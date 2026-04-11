import Link from 'next/link';
import { TopNav } from '@/src/components/top-nav';

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <TopNav />
      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center">
        <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">404</p>
        <h1 className="mt-4 voixa-heading text-5xl">A quiet corner of the atelier.</h1>
        <p className="mt-4 max-w-lg text-sm text-pearl/65">
          The page you were looking for has not been recorded yet. Return to your sessions or
          begin a new song.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="voixa-button-primary">
            Return home
          </Link>
          <Link href="/dashboard" className="voixa-button-ghost">
            Open the atelier
          </Link>
        </div>
      </section>
    </main>
  );
}
