import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Voixa',
  description: 'Premium AI Vocal Studio'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
