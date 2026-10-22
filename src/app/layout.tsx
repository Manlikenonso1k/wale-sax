import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Bodoni_Moda, Instrument_Sans } from 'next/font/google';
import { site } from '@/content/site';
import { SkipLink } from '@/components/layout/SkipLink';
import { CosmosPoster } from '@/components/layout/CosmosPoster';
import { WhatsAppWidget } from '@/components/overlays/WhatsAppWidget';
import './globals.css';

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'], // verified: Bodoni Moda has opsz 6–96 and wght 400–900
  display: 'swap',
  variable: '--font-bodoni',
});
const instrument = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: site.seo.title,
  description: site.seo.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    title: site.seo.title,
    description: site.seo.description,
    images: [{ url: '/_img/og.jpg', width: 1200, height: 630 }],
    locale: 'en_NG',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#0A090B',
};

// Sets data-motion="off" before first paint for returning “motion off” visitors (§10.4).
const motionScript =
  "try{if(localStorage.getItem('wale-motion')==='off')document.documentElement.setAttribute('data-motion','off')}catch(e){}";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG" suppressHydrationWarning className={`${bodoni.variable} ${instrument.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>
        <SkipLink />
        <CosmosPoster />
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
