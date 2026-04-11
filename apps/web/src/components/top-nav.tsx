'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/providers/auth-provider';
import { VoixaLogo } from './voixa-logo';

export function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const onAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup');

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-6 md:px-10">
      <Link href="/" className="group flex items-center gap-3">
        <VoixaLogo className="h-8 w-auto" />
      </Link>
      <nav className="hidden items-center gap-8 text-sm text-pearl/70 md:flex">
        <Link className="transition hover:text-pearl" href="/#experience">
          Experience
        </Link>
        <Link className="transition hover:text-pearl" href="/#features">
          Features
        </Link>
        <Link className="transition hover:text-pearl" href="/#pricing">
          Pricing
        </Link>
      </nav>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href="/dashboard" className="voixa-button-ghost hidden md:inline-flex">
              Atelier
            </Link>
            <button
              type="button"
              className="voixa-button-primary"
              onClick={() => {
                void logout();
              }}
            >
              Sign out
            </button>
          </>
        ) : !onAuthPage ? (
          <>
            <Link href="/login" className="voixa-button-ghost hidden md:inline-flex">
              Sign in
            </Link>
            <Link href="/signup" className="voixa-button-primary">
              Begin
            </Link>
          </>
        ) : null}
      </div>
    </header>
  );
}
