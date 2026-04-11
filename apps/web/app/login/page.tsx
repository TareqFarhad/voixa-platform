'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/src/providers/auth-provider';
import { TopNav } from '@/src/components/top-nav';
import { VoixaLogo } from '@/src/components/voixa-logo';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign you in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <TopNav />
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-6 md:px-10">
        <div className="voixa-card relative w-full max-w-md overflow-hidden rounded-[32px] p-10">
          <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-midnight/50 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-burgundy/30 blur-3xl" />
          <div className="relative">
            <VoixaLogo className="mb-8 h-8 w-auto" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-champagne">Welcome back</p>
            <h1 className="mt-2 voixa-heading text-3xl">Step into the atelier.</h1>
            <p className="mt-3 text-sm text-pearl/65">
              Your voice, your drafts, and your saved sessions are waiting.
            </p>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="voixa-label" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="voixa-input"
                  placeholder="you@studio.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="voixa-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="voixa-input"
                  placeholder="At least 8 characters"
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <p className="rounded-xl border border-burgundy/40 bg-burgundy/20 px-4 py-2 text-xs text-pearl/80">
                  {error}
                </p>
              )}
              <button type="submit" className="voixa-button-primary w-full" disabled={loading}>
                {loading ? 'Opening…' : 'Enter Voixa'}
              </button>
            </form>

            <div className="relative mt-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-pearl/40">
              <span className="h-px flex-1 voixa-divider" />
              or
              <span className="h-px flex-1 voixa-divider" />
            </div>

            <button
              type="button"
              className="voixa-button-ghost mt-4 w-full"
              disabled
              title="Coming soon"
            >
              Continue with Google
            </button>

            <p className="mt-6 text-center text-[11px] text-pearl/55">
              New to Voixa?{' '}
              <Link href="/signup" className="text-champagne hover:underline">
                Begin your atelier
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
