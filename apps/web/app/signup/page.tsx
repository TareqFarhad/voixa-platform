'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/src/providers/auth-provider';
import { TopNav } from '@/src/components/top-nav';
import { VoixaLogo } from '@/src/components/voixa-logo';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(email, password, name || undefined);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your atelier');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <TopNav />
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pb-20 pt-6 md:px-10">
        <div className="voixa-card relative w-full max-w-md overflow-hidden rounded-[32px] p-10">
          <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-champagne/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-midnight/50 blur-3xl" />
          <div className="relative">
            <VoixaLogo className="mb-8 h-8 w-auto" />
            <p className="text-[10px] uppercase tracking-[0.3em] text-champagne">
              Begin your atelier
            </p>
            <h1 className="mt-2 voixa-heading text-3xl">Create your account.</h1>
            <p className="mt-3 text-sm text-pearl/65">
              A private space to shape voices into songs. No noise, no clutter.
            </p>

            <form className="mt-8 space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="voixa-label" htmlFor="name">
                  Artist name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="voixa-input"
                  placeholder="How shall we address you?"
                  autoComplete="name"
                />
              </div>
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
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <p className="rounded-xl border border-burgundy/40 bg-burgundy/20 px-4 py-2 text-xs text-pearl/80">
                  {error}
                </p>
              )}
              <p className="text-[10px] leading-relaxed text-pearl/45">
                By continuing you consent to Voixa processing your voice recordings privately for the
                purpose of creating your projects. You can delete your voice data at any time.
              </p>
              <button type="submit" className="voixa-button-primary w-full" disabled={loading}>
                {loading ? 'Preparing your atelier…' : 'Begin'}
              </button>
            </form>

            <p className="mt-6 text-center text-[11px] text-pearl/55">
              Already inside?{' '}
              <Link href="/login" className="text-champagne hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
