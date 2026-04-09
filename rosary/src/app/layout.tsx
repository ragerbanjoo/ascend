import type { Metadata } from 'next';
import './globals.css';
import { ClientProviders } from './providers';

export const metadata: Metadata = {
  title: 'Holy Rosary - St. Juan Young Adult Group',
  description: 'Guided bilingual Rosary app — pray the Holy Rosary in English or Spanish with step-by-step prayers, mysteries, and the Litany of Loreto.',
  metadataBase: new URL('https://stjuandiegoyoungadults.com'),
  icons: {
    icon: '/images/rosary-logo.png',
    apple: '/images/rosary-logo.png',
    shortcut: '/images/rosary-logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Holy Rosary - St. Juan Young Adult Group',
    description: 'Pray the Holy Rosary guided in English or Spanish.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'es_MX',
    images: [{ url: '/images/rosary-logo.png', width: 512, height: 512 }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
