import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/src/providers/auth-provider';

export const metadata: Metadata = {
  title: 'Voixa — Premium AI Vocal Studio',
  description:
    'Voixa transforms natural vocals into studio-quality songs while preserving the character that makes your voice yours.',
  applicationName: 'Voixa',
  authors: [{ name: 'Voixa' }],
  themeColor: '#07070A',
};

export const viewport: Viewport = {
  themeColor: '#07070A',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
