'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppShell } from '@/src/components/app-shell';
import { AiOrb } from '@/src/components/ai-orb';
import { Waveform } from '@/src/components/waveform';
import { projects as projectsApi, type VoixaProject } from '@/src/lib/api-client';
import { useAuth } from '@/src/providers/auth-provider';

export default function DashboardPage() {
  const router = useRouter();
  const { user, session } = useAuth();
  const [projects, setProjects] = useState<VoixaProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    projectsApi
      .list()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load your atelier');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function createProject() {
    try {
      const project = await projectsApi.create({ title: 'Untitled session' });
      router.push(`/create/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create a new session');
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4"
        >
          <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">Welcome</p>
          <h1 className="voixa-heading text-4xl md:text-5xl">
            Good evening, {user?.name ?? user?.email?.split('@')[0] ?? 'Artist'}.
          </h1>
          <p className="max-w-xl text-sm text-pearl/65">
            The atelier is quiet and ready. Begin a new session, or continue refining a recent piece.
          </p>
        </motion.div>

        {/* PRIMARY CTA */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="voixa-card relative overflow-hidden rounded-[32px] p-8 md:col-span-2">
            <div className="pointer-events-none absolute -right-20 -top-10 h-64 w-64 rounded-full bg-champagne/15 blur-3xl" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/55">New session</p>
            <h2 className="mt-2 voixa-heading text-3xl">Shape a new song.</h2>
            <p className="mt-2 text-sm text-pearl/65">
              Four unhurried steps. Bring your voice, add the music, breathe in the lyrics, release.
            </p>
            <button type="button" onClick={createProject} className="voixa-button-primary mt-8">
              Begin a new session
            </button>
          </div>
          <div className="voixa-card flex items-center justify-center rounded-[32px] p-8">
            <AiOrb size={180} label="Atelier core" />
          </div>
        </div>

        {/* STATUS CARDS */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <StatusCard
            label="Voice profile"
            value="Not configured"
            hint="Add three minutes of your voice to build your identity profile."
            href="/profile"
          />
          <StatusCard
            label="Current plan"
            value={(user?.plan ?? 'FREE').toLowerCase()}
            hint="Upgrade for priority processing and WAV export."
            href="/profile#billing"
            accent
          />
          <StatusCard
            label="Recent drafts"
            value={loading ? '…' : `${projects.length}`}
            hint="All your saved sessions, ready to reopen."
          />
        </div>

        {/* PROJECTS */}
        <div className="mt-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-pearl/55">Recent sessions</p>
              <h2 className="mt-2 voixa-heading text-3xl">Your atelier</h2>
            </div>
            <button type="button" onClick={createProject} className="voixa-button-ghost">
              New session
            </button>
          </div>
          {error && (
            <p className="mb-4 rounded-2xl border border-burgundy/40 bg-burgundy/20 px-4 py-3 text-sm text-pearl/80">
              {error}
            </p>
          )}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="voixa-card h-40 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="voixa-card rounded-3xl p-10 text-center">
              <p className="text-[10px] uppercase tracking-[0.32em] text-pearl/55">Empty atelier</p>
              <h3 className="mt-2 voixa-heading text-2xl">Your first session awaits.</h3>
              <p className="mx-auto mt-3 max-w-md text-sm text-pearl/60">
                Begin a new session, bring your vocal, and hear the studio-quality version of yourself.
              </p>
              <button type="button" onClick={createProject} className="voixa-button-primary mt-6">
                Begin
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/create/${project.id}`}
                  className="voixa-card group relative overflow-hidden rounded-3xl p-6 transition hover:border-champagne/40 hover:shadow-glow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/55">
                        {project.genre ?? project.style ?? 'Draft'}
                      </p>
                      <h3 className="mt-2 font-display text-2xl text-pearl">
                        {project.title || 'Untitled session'}
                      </h3>
                      <p className="text-xs text-pearl/55">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] ${
                        project.status === 'COMPLETED'
                          ? 'border-champagne/50 text-champagne'
                          : project.status === 'PROCESSING'
                            ? 'border-midnight/60 text-pearl/70'
                            : project.status === 'FAILED'
                              ? 'border-burgundy/50 text-burgundy'
                              : 'border-white/15 text-pearl/55'
                      }`}
                    >
                      {project.status.toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-6 h-16 overflow-hidden rounded-2xl bg-black/40 px-2 py-2">
                    <Waveform bars={52} seed={project.id.length + 3} intensity={0.85} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

interface StatusCardProps {
  label: string;
  value: string;
  hint: string;
  href?: string;
  accent?: boolean;
}

function StatusCard({ label, value, hint, href, accent }: StatusCardProps) {
  const Body = (
    <div
      className={`voixa-card flex h-full flex-col justify-between rounded-3xl p-6 transition ${
        href ? 'hover:border-champagne/30' : ''
      }`}
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-pearl/55">{label}</p>
        <p
          className={`mt-3 font-display text-3xl capitalize ${
            accent ? 'text-champagne' : 'text-pearl'
          }`}
        >
          {value}
        </p>
      </div>
      <p className="mt-4 text-xs text-pearl/55">{hint}</p>
    </div>
  );
  return href ? <Link href={href}>{Body}</Link> : Body;
}
