'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/src/components/app-shell';
import { AiOrb } from '@/src/components/ai-orb';
import { Waveform } from '@/src/components/waveform';
import { processing } from '@/src/lib/api-client';

const STAGES = [
  { key: 'preparing', label: 'Preparing the atelier' },
  { key: 'cleaning', label: 'Clearing room noise' },
  { key: 'tuning', label: 'Refining tuning' },
  { key: 'aligning', label: 'Aligning your delivery' },
  { key: 'polishing', label: 'Polishing tone' },
  { key: 'mastering', label: 'Shaping the final mix' },
  { key: 'finalizing', label: 'Finalizing your track' },
];

export default function ProcessingClient() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<string>('RUNNING');
  const [progress, setProgress] = useState<number>(5);
  const [stage, setStage] = useState<string>('Preparing your session');
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    async function tick() {
      try {
        const data = await processing.status(params.jobId);
        setStatus(data.status);
        setProgress(data.progress ?? 0);
        setStage(data.stage ?? 'Enhancing your voice');
        setProjectId(data.projectId);
        if (data.status === 'COMPLETED') {
          setTimeout(() => router.push(`/result/${data.projectId}`), 900);
        }
        if (data.status === 'FAILED') {
          setError(data.errorMessage ?? 'Processing failed unexpectedly');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lost connection to the atelier');
      }
    }
    void tick();
    pollRef.current = window.setInterval(tick, 2000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [params.jobId, router]);

  const active = STAGES.find((s) => s.label.toLowerCase() === stage.toLowerCase());

  return (
    <AppShell>
      <div className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-20 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(42,53,95,0.25),transparent_60%)]" />
        <motion.p
          className="text-[10px] uppercase tracking-[0.32em] text-champagne"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Voixa is refining your voice
        </motion.p>
        <motion.h1
          className="mt-4 voixa-heading text-4xl md:text-6xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {status === 'FAILED' ? 'A pause in the atelier.' : stage}
        </motion.h1>
        <p className="mt-4 max-w-xl text-sm text-pearl/65">
          Breathe. We&apos;re shaping the finest version of your voice. This usually takes a minute or two.
        </p>

        <div className="mt-12">
          <AiOrb size={260} label={active?.label ?? 'Enhancing'} />
        </div>

        <div className="mt-14 w-full max-w-2xl">
          <div className="h-32 overflow-hidden rounded-3xl border border-white/10 bg-black/40 px-3 py-3">
            <Waveform bars={82} seed={progress + 1} intensity={1} />
          </div>
          <div className="mt-6 rounded-full border border-white/10 bg-white/[0.02] p-1">
            <div
              className="h-2 rounded-full bg-champagne transition-all"
              style={{ width: `${Math.min(100, Math.max(4, progress))}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-pearl/55">
            {Math.min(100, Math.max(0, progress))}% complete
          </p>
        </div>

        {error && (
          <div className="mt-8 max-w-lg rounded-2xl border border-burgundy/50 bg-burgundy/20 px-4 py-3 text-sm text-pearl/80">
            {error}
            {projectId && (
              <button
                type="button"
                className="voixa-button-primary mt-4"
                onClick={() => router.push(`/create/${projectId}`)}
              >
                Return to session
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
