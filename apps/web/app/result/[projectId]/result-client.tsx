'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/src/components/app-shell';
import { AudioPlayer } from '@/src/components/audio-player';
import { RefinementSlider } from '@/src/components/refinement-slider';
import {
  exportsApi,
  processing,
  projects as projectsApi,
  storageUrl,
  type VoixaProject,
} from '@/src/lib/api-client';

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

export default function ResultClient() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<VoixaProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SessionSettings>(DEFAULT_SETTINGS);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [reprocessing, setReprocessing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await projectsApi.get(params.projectId);
      setProject(data);
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...(data.settings as Partial<SessionSettings>) }));
      }
      try {
        const exp = await exportsApi.get(data.id);
        setExportUrl(exp.url);
      } catch {
        setExportUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load session');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.projectId]);

  const rawAsset = useMemo(
    () => project?.assets?.find((a) => a.type === 'RAW_VOCAL'),
    [project],
  );
  const finishedAsset = useMemo(
    () => project?.assets?.find((a) => a.type === 'PROCESSED_OUTPUT'),
    [project],
  );

  async function reprocess() {
    if (!project) return;
    setReprocessing(true);
    try {
      await projectsApi.update(project.id, {
        settings: settings as unknown as Record<string, unknown>,
      });
      const { jobId } = await processing.start(
        project.id,
        settings as unknown as Record<string, unknown>,
      );
      router.push(`/processing/${jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reprocess');
      setReprocessing(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        {loading ? (
          <div className="h-96 animate-pulse rounded-[32px] bg-white/5" />
        ) : !project ? (
          <div className="voixa-card rounded-3xl p-10 text-center text-pearl/70">
            {error ?? 'Session not found'}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">
                Your final release
              </p>
              <h1 className="voixa-heading text-4xl md:text-5xl">
                {project.songTitle || project.title}
              </h1>
              <p className="text-sm text-pearl/65">
                Enhanced in the Voixa atelier · {project.style ?? 'Studio'} preset ·{' '}
                {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>

            {error && (
              <p className="mt-6 rounded-2xl border border-burgundy/40 bg-burgundy/20 px-4 py-3 text-sm text-pearl/80">
                {error}
              </p>
            )}

            <div className="mt-10 grid gap-8 lg:grid-cols-[2fr,1fr]">
              <div className="voixa-card rounded-[32px] p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Before / After</p>
                <h2 className="mt-2 voixa-heading text-3xl">Compare the two versions</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <AudioPlayer
                    src={rawAsset ? storageUrl(rawAsset.storageKey) : ''}
                    label="Raw take"
                    tone="raw"
                  />
                  <AudioPlayer
                    src={finishedAsset ? storageUrl(finishedAsset.storageKey) : ''}
                    label="Voixa enhanced"
                    tone="enhanced"
                  />
                </div>

                <div className="voixa-divider mt-10 h-px" />

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {exportUrl ? (
                    <a
                      href={exportUrl}
                      download
                      className="voixa-button-primary"
                    >
                      Download MP3
                    </a>
                  ) : (
                    <span className="voixa-button-ghost opacity-60">
                      Export unavailable yet
                    </span>
                  )}
                  <button
                    type="button"
                    className="voixa-button-ghost"
                    onClick={reprocess}
                    disabled={reprocessing}
                  >
                    {reprocessing ? 'Reprocessing…' : 'Reprocess with changes'}
                  </button>
                  <Link href={`/create/${project.id}`} className="voixa-button-ghost">
                    Edit session
                  </Link>
                </div>
              </div>

              <div className="space-y-6">
                <div className="voixa-card rounded-3xl p-6">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Refine</p>
                  <h3 className="mt-2 voixa-heading text-xl">Adjust the feeling</h3>
                  <div className="mt-4 space-y-5">
                    <RefinementSlider
                      label="Tuning"
                      value={settings.pitchCorrection}
                      onChange={(v) => setSettings((p) => ({ ...p, pitchCorrection: v }))}
                    />
                    <RefinementSlider
                      label="Warmth"
                      value={settings.warmth}
                      onChange={(v) => setSettings((p) => ({ ...p, warmth: v }))}
                    />
                    <RefinementSlider
                      label="Clarity"
                      value={settings.clarity}
                      onChange={(v) => setSettings((p) => ({ ...p, clarity: v }))}
                    />
                    <RefinementSlider
                      label="Reverb"
                      value={settings.reverb}
                      onChange={(v) => setSettings((p) => ({ ...p, reverb: v }))}
                    />
                  </div>
                </div>
                <div className="voixa-card rounded-3xl p-6 text-xs text-pearl/60">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-pearl/55">Next</p>
                  <p className="mt-2">
                    Share privately, or save as a draft and return tomorrow. Every session is yours -
                    stored privately to your account.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
