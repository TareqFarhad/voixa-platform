'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell } from '@/src/components/app-shell';
import { AiOrb } from '@/src/components/ai-orb';
import { projects as projectsApi } from '@/src/lib/api-client';
import { useAuth } from '@/src/providers/auth-provider';

/**
 * Entry to the create flow - creates a draft project and forwards the
 * artist into the step-based session at /create/[id].
 */
export default function CreatePage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/login');
      return;
    }
    let cancelled = false;
    projectsApi
      .create({ title: 'Untitled session' })
      .then((project) => {
        if (!cancelled) router.replace(`/create/${project.id}`);
      })
      .catch(() => {
        if (!cancelled) router.replace('/dashboard');
      });
    return () => {
      cancelled = true;
    };
  }, [session, loading, router]);

  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-20 text-center">
        <AiOrb size={180} label="Preparing your atelier" />
        <p className="text-sm text-pearl/55">Opening a quiet space for your new session…</p>
      </div>
    </AppShell>
  );
}
