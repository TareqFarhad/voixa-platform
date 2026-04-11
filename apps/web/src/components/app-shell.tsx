'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/src/providers/auth-provider';
import { VoixaLogo } from './voixa-logo';

interface AppShellProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Atelier', description: 'Your creative studio' },
  { href: '/dashboard/projects', label: 'Projects', description: 'Every session you have shaped' },
  { href: '/profile', label: 'Voice Profile', description: 'Your vocal identity' },
  { href: '/profile#privacy', label: 'Privacy', description: 'Consent & data controls' },
  { href: '/profile#billing', label: 'Billing', description: 'Plan & invoices' },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  return (
    <div className="relative flex min-h-screen text-pearl">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/5 bg-black/30 px-6 py-8 backdrop-blur-xl md:flex">
        <Link href="/" className="mb-10 flex items-center">
          <VoixaLogo className="h-8 w-auto" />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col rounded-2xl border px-4 py-3 transition ${
                  active
                    ? 'border-champagne/50 bg-white/5 text-pearl shadow-glow'
                    : 'border-transparent text-pearl/65 hover:border-white/10 hover:bg-white/[0.03] hover:text-pearl'
                }`}
              >
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
                <span className="text-[11px] text-pearl/45">{item.description}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-pearl/50">Signed in as</p>
          <p className="mt-1 truncate text-sm text-pearl">{user?.name ?? user?.email ?? '—'}</p>
          <p className="text-[11px] capitalize text-champagne/80">{user?.plan?.toLowerCase() ?? 'free'} plan</p>
          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="mt-3 w-full rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-pearl/70 transition hover:border-white/25 hover:text-pearl"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto voixa-scrollbar">{children}</main>
    </div>
  );
}
