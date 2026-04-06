import type { ReactNode } from 'react';

export function PageShell({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold text-pearl">{title}</h1>
      <p className="mt-2 text-sm text-pearl/70">{description}</p>
      {children}
    </main>
  );
}
