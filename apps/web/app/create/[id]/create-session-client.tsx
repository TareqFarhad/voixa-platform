'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/src/components/app-shell';
import { Waveform } from '@/src/components/waveform';
import { RefinementSlider } from '@/src/components/refinement-slider';
import {
  processing,
  projects as projectsApi,
  uploads,
  type VoixaProject,
} from '@/src/lib/api-client';

const STYLE_MODES = [
  { key: 'Natural', label: 'Natural', description: 'Honest, airy, untouched grain' },
  { key: 'Studio', label: 'Studio', description: 'Polished, confident, warm' },
  { key: 'Cinematic', label: 'Cinematic', description: 'Widescreen, emotive, rich' },
  { key: 'Luxury', label: 'Luxury', description: 'Intimate, velvet, refined' },
];

const STEPS = [
  { key: 'vocal', title: 'Bring your voice', description: 'Upload or record your take.' },
  { key: 'instrumental', title: 'Invite the music', description: 'Add your instrumental.' },
  { key: 'lyrics', title: 'Write the words', description: 'Paste or edit your lyrics.' },
  { key: 'style', title: 'Choose the mood', description: 'Pick a style mode.' },
  { key: 'refine', title: 'Shape the feeling', description: 'Adjust your finishing touches.' },
];

interface SessionSettings {
  style: string;
  pitchCorrection: number;
  smoothness: number;
  clarity: number;
  warmth: number;
  reverb: number;
  vocalVolume: number;
  instrumentalVolume: number;
  naturalVsPolished: number;
}

const DEFAULT_SETTINGS: SessionSettings = {
  style: 'Studio',
  pitchCorrection: 0.55,
  smoothness: 0.5,
  clarity: 0.6,
  warmth: 0.5,
  reverb: 0.3,
  vocalVolume: 0.85,
  instrumentalVolume: 0.75,
  naturalVsPolished: 0.5,
};

export default function CreateSessionClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<VoixaProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [title, setTitle] = useState('Untitled session');
  const [songTitle, setSongTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SETTINGS);
  const [vocalFileName, setVocalFileName] = useState<string | null>(null);
  const [instrumentalFileName, setInstrumentalFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await projectsApi.get(params.id);
      setProject(data);
      setTitle(data.title ?? 'Untitled session');
      setSongTitle(data.songTitle ?? '');
      setGenre(data.genre ?? '');
      setLyrics(data.lyrics ?? '');
      const assetVocal = data.assets?.find((a) => a.type === 'RAW_VOCAL');
      const assetInstrumental = data.assets?.find((a) => a.type === 'INSTRUMENTAL');
      setVocalFileName(assetVocal ? 'Voice already captured' : null);
      setInstrumentalFileName(assetInstrumental ? 'Instrumental already captured' : null);
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...(data.settings as Partial<SessionSettings>) }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load your session');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const completionFlags = useMemo(
    () => [
      Boolean(vocalFileName),
      Boolean(instrumentalFileName),
      lyrics.trim().length > 0,
      Boolean(settings.style),
      true,
    ],
    [vocalFileName, instrumentalFileName, lyrics, settings.style],
  );

  async function handleFileUpload(kind: 'vocal' | 'instrumental', file: File) {
    if (!project) return;
    setUploading(true);
    setError(null);
    try {
      if (kind === 'vocal') {
        await uploads.vocal(project.id, file);
        setVocalFileName(file.name);
      } else {
        await uploads.instrumental(project.id, file);
        setInstrumentalFileName(file.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function toggleRecording() {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Recording is not available in this browser');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) mediaChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(mediaChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        const file = new File([blob], `voixa-take-${Date.now()}.webm`, { type: 'audio/webm' });
        await handleFileUpload('vocal', file);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start recording');
    }
  }

  async function saveProject() {
    if (!project) return;
    setSaving(true);
    setError(null);
    try {
      await projectsApi.update(project.id, {
        title,
        songTitle,
        genre,
        style: settings.style,
        lyrics,
        settings: settings as unknown as Record<string, unknown>,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save session');
    } finally {
      setSaving(false);
    }
  }

  async function startProcessing() {
    if (!project) return;
    setStarting(true);
    setError(null);
    try {
      await projectsApi.update(project.id, {
        title,
        songTitle,
        genre,
        style: settings.style,
        lyrics,
        settings: settings as unknown as Record<string, unknown>,
      });
      const { jobId } = await processing.start(project.id, settings as unknown as Record<string, unknown>);
      router.push(`/processing/${jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start processing');
      setStarting(false);
    }
  }

  const canProcess = completionFlags[0] && completionFlags[1];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        <div className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">New session</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="voixa-heading w-full bg-transparent text-4xl outline-none placeholder:text-pearl/30 md:text-5xl"
            placeholder="Name your session"
          />
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={songTitle}
              onChange={(e) => setSongTitle(e.target.value)}
              className="voixa-input max-w-xs"
              placeholder="Song title"
            />
            <input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="voixa-input max-w-xs"
              placeholder="Genre or mood"
            />
            <button
              type="button"
              className="voixa-button-ghost"
              onClick={saveProject}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-burgundy/40 bg-burgundy/20 px-4 py-3 text-sm text-pearl/80">
            {error}
          </p>
        )}

        {/* STEPPER */}
        <div className="mt-10 grid gap-3 md:grid-cols-5">
          {STEPS.map((step, index) => (
            <button
              key={step.key}
              type="button"
              onClick={() => setActiveStep(index)}
              className={`group flex flex-col rounded-2xl border px-4 py-4 text-left transition ${
                activeStep === index
                  ? 'border-champagne/60 bg-white/5 shadow-glow'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.28em] text-pearl/50">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={`h-[6px] w-[6px] rounded-full transition ${
                    completionFlags[index] ? 'bg-champagne' : 'bg-white/15'
                  }`}
                />
              </div>
              <span className="mt-3 text-sm font-medium text-pearl">{step.title}</span>
              <span className="text-[11px] text-pearl/55">{step.description}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="voixa-card rounded-[32px] p-8">
            {loading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
            ) : activeStep === 0 ? (
              <VocalStep
                vocalFileName={vocalFileName}
                uploading={uploading}
                recording={recording}
                onFile={(file) => handleFileUpload('vocal', file)}
                onRecord={toggleRecording}
              />
            ) : activeStep === 1 ? (
              <InstrumentalStep
                uploading={uploading}
                instrumentalFileName={instrumentalFileName}
                onFile={(file) => handleFileUpload('instrumental', file)}
              />
            ) : activeStep === 2 ? (
              <LyricsStep lyrics={lyrics} setLyrics={setLyrics} />
            ) : activeStep === 3 ? (
              <StyleStep
                style={settings.style}
                onChange={(style) => setSettings((prev) => ({ ...prev, style }))}
              />
            ) : (
              <RefineStep settings={settings} setSettings={setSettings} />
            )}

            <div className="voixa-divider mt-10 h-px" />

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                className="voixa-button-ghost disabled:opacity-30"
              >
                Previous
              </button>
              {activeStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="voixa-button-primary"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canProcess || starting}
                  onClick={startProcessing}
                  className="voixa-button-primary disabled:opacity-40"
                >
                  {starting ? 'Lifting your voice…' : 'Refine with Voixa'}
                </button>
              )}
            </div>
          </div>

          {/* Right preview rail */}
          <div className="space-y-5">
            <div className="voixa-card rounded-3xl p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Session preview</p>
              <div className="mt-4 h-28 overflow-hidden rounded-2xl bg-black/40 px-2 py-2">
                <Waveform bars={64} seed={title.length + 1} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-pearl/60">
                <PreviewRow label="Voice" value={vocalFileName ? 'Captured' : 'Waiting'} />
                <PreviewRow
                  label="Music"
                  value={instrumentalFileName ? 'Captured' : 'Waiting'}
                />
                <PreviewRow label="Lyrics" value={lyrics.trim() ? 'Written' : 'Pending'} />
                <PreviewRow label="Style" value={settings.style} />
              </div>
            </div>
            <div className="voixa-card rounded-3xl p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Privacy</p>
              <p className="mt-2 text-xs text-pearl/65">
                Your voice remains in your atelier. Voixa never trains public models on your takes and
                you can remove any asset at any moment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <span className="text-[10px] uppercase tracking-[0.25em] text-pearl/45">{label}</span>
      <span className="truncate text-pearl/80">{value}</span>
    </div>
  );
}

interface VocalStepProps {
  vocalFileName: string | null;
  uploading: boolean;
  recording: boolean;
  onFile: (file: File) => void;
  onRecord: () => void;
}

function VocalStep({ vocalFileName, uploading, recording, onFile, onRecord }: VocalStepProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">Step 01</p>
        <h2 className="mt-2 voixa-heading text-3xl">Bring your voice.</h2>
        <p className="mt-2 text-sm text-pearl/65">
          Drop a WAV, MP3, or M4A take - or record directly in your browser. We only keep what you
          ask us to keep.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="voixa-card flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-dashed border-white/15 px-6 py-10 text-center transition hover:border-champagne/40">
          <span className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Upload a take</span>
          <span className="font-display text-xl text-pearl">Drop your file here</span>
          <span className="text-xs text-pearl/50">
            {vocalFileName ?? 'WAV · MP3 · M4A · up to 60 MB'}
          </span>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
            }}
          />
        </label>
        <div className="voixa-card flex flex-col items-center justify-center gap-4 rounded-3xl px-6 py-10 text-center">
          <span className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Record in browser</span>
          <button
            type="button"
            onClick={onRecord}
            className={`relative flex h-20 w-20 items-center justify-center rounded-full border transition ${
              recording
                ? 'border-burgundy/70 bg-burgundy/20 text-burgundy'
                : 'border-champagne/50 bg-champagne/10 text-champagne hover:bg-champagne/20'
            }`}
          >
            <span className="absolute inset-3 rounded-full border border-current opacity-40" />
            <span className="font-display text-sm uppercase tracking-[0.22em]">
              {recording ? 'Stop' : 'Record'}
            </span>
          </button>
          <p className="text-[11px] text-pearl/50">
            {recording ? 'Listening… tap stop when ready.' : 'A private, lossless capture.'}
          </p>
        </div>
      </div>
      {uploading && (
        <p className="text-xs uppercase tracking-[0.3em] text-pearl/55">Uploading to your atelier…</p>
      )}
    </motion.div>
  );
}

interface InstrumentalStepProps {
  instrumentalFileName: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
}

function InstrumentalStep({ instrumentalFileName, uploading, onFile }: InstrumentalStepProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">Step 02</p>
        <h2 className="mt-2 voixa-heading text-3xl">Invite the music.</h2>
        <p className="mt-2 text-sm text-pearl/65">
          Upload the instrumental that will frame your voice. WAV or MP3, any genre.
        </p>
      </div>
      <label className="voixa-card flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-dashed border-white/15 px-6 py-12 text-center transition hover:border-champagne/40">
        <span className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Upload instrumental</span>
        <span className="font-display text-xl text-pearl">Drop your backing track</span>
        <span className="text-xs text-pearl/50">
          {instrumentalFileName ?? 'WAV or MP3 · up to 60 MB'}
        </span>
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
      </label>
      {uploading && (
        <p className="text-xs uppercase tracking-[0.3em] text-pearl/55">
          Bringing your instrumental into the atelier…
        </p>
      )}
    </motion.div>
  );
}

interface LyricsStepProps {
  lyrics: string;
  setLyrics: (value: string) => void;
}

function LyricsStep({ lyrics, setLyrics }: LyricsStepProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">Step 03</p>
        <h2 className="mt-2 voixa-heading text-3xl">Write the words.</h2>
        <p className="mt-2 text-sm text-pearl/65">
          Paste your lyrics or write them here. They stay private and travel with your session.
        </p>
      </div>
      <textarea
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        rows={12}
        className="voixa-input resize-none font-display text-lg leading-relaxed"
        placeholder={'Verse 1\n…\n\nChorus\n…'}
      />
    </motion.div>
  );
}

interface StyleStepProps {
  style: string;
  onChange: (style: string) => void;
}

function StyleStep({ style, onChange }: StyleStepProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">Step 04</p>
        <h2 className="mt-2 voixa-heading text-3xl">Choose the mood.</h2>
        <p className="mt-2 text-sm text-pearl/65">
          Each mode is a curated preset - a starting point that you can refine further in the next
          step.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {STYLE_MODES.map((mode) => {
          const active = style === mode.key;
          return (
            <button
              key={mode.key}
              type="button"
              onClick={() => onChange(mode.key)}
              className={`relative overflow-hidden rounded-3xl border p-6 text-left transition ${
                active
                  ? 'border-champagne/60 bg-white/5 shadow-glow'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/30'
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/55">Mode</p>
              <h3 className="mt-2 font-display text-2xl text-pearl">{mode.label}</h3>
              <p className="mt-2 text-sm text-pearl/65">{mode.description}</p>
              <div className="mt-6 h-14 overflow-hidden rounded-2xl bg-black/40 px-2 py-2">
                <Waveform bars={48} seed={mode.key.length * 3} intensity={active ? 1 : 0.65} />
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

interface RefineStepProps {
  settings: SessionSettings;
  setSettings: (update: (prev: SessionSettings) => SessionSettings) => void;
}

function RefineStep({ settings, setSettings }: RefineStepProps) {
  const bind =
    (key: keyof SessionSettings) =>
    (value: number) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">Step 05</p>
        <h2 className="mt-2 voixa-heading text-3xl">Shape the feeling.</h2>
        <p className="mt-2 text-sm text-pearl/65">
          Every slider is a feeling, not a parameter. Adjust only what moves you.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <RefinementSlider
          label="Tuning"
          description="How far Voixa nudges your notes toward center."
          value={settings.pitchCorrection}
          onChange={bind('pitchCorrection')}
        />
        <RefinementSlider
          label="Smoothness"
          description="Softens breath and harsh transients."
          value={settings.smoothness}
          onChange={bind('smoothness')}
        />
        <RefinementSlider
          label="Clarity"
          description="Presence and articulation lift."
          value={settings.clarity}
          onChange={bind('clarity')}
        />
        <RefinementSlider
          label="Warmth"
          description="Velvet low-mids and body."
          value={settings.warmth}
          onChange={bind('warmth')}
        />
        <RefinementSlider
          label="Reverb"
          description="Atmosphere around the voice."
          value={settings.reverb}
          onChange={bind('reverb')}
        />
        <RefinementSlider
          label="Polish"
          description="Natural — or cinematically polished."
          value={settings.naturalVsPolished}
          onChange={bind('naturalVsPolished')}
        />
        <RefinementSlider
          label="Voice volume"
          description="Loudness of the lead vocal."
          value={settings.vocalVolume}
          onChange={bind('vocalVolume')}
        />
        <RefinementSlider
          label="Music volume"
          description="Loudness of the instrumental bed."
          value={settings.instrumentalVolume}
          onChange={bind('instrumentalVolume')}
        />
      </div>
    </motion.div>
  );
}
