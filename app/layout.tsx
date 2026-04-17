import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'next-template',
  description:
    'Production-ready Next.js 15 PWA starter — Supabase, Tailwind, shadcn/ui, PostHog, Stripe.',
  manifest: '/manifest.webmanifest',
  applicationName: 'next-template',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'next-template',
  },
  icons: {
    icon: '/manifest-assets/icon-192.png',
    apple: '/manifest-assets/icon-192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
