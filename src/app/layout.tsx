// app/layout.tsx
// Root layout — mounts the Navbar across every page of the app.
// Fonts: Inter (body) + Playfair Display (headings) — matching existing globals.css

import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/NavBar';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Church of Christ at Redcross',
    template: '%s — Church of Christ at Redcross',
  },
  description: 'Member directory and management system for Church of Christ at Redcross.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-background text-foreground`}
      >
        {/* Global sticky navbar */}
        <Navbar />

        {/* Page content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Toast notifications */}
        <Toaster />
      </body>
    </html>
  );
}