import type { Metadata, Viewport } from 'next';
import { Literata } from 'next/font/google';
import localFont from 'next/font/local';
import { ViewTransition } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import SiteHeader from '@/components/nav/SiteHeader';
import TabBar from '@/components/nav/TabBar';
import Footer from '@/components/Footer';
import KiruDefs from '@/components/kiru/KiruDefs';
import SiteFX from '@/components/SiteFX';
import PaletteTrigger from '@/components/palette/PaletteTrigger';

// Display: Dela Gothic One — a Japanese poster gothic, headlines only.
// Self-hosted as a Latin-only subset (fonts/dela-gothic-one-latin.woff2, cut
// with fontTools' pyftsubset from the OFL release). Loading it through
// next/font/google emitted an @font-face for every Japanese slice — ~90 KB of
// CSS on every page — for characters the site draws as SVG paths instead.
const display = localFont({
  src: './fonts/dela-gothic-one-latin.woff2',
  variable: '--font-dela',
  weight: '400',
  style: 'normal',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

// Reading: Literata — built for long-form screen reading. Article and report
// bodies use it. UI text is the platform's own face (see globals.css), which
// is free to load and is what makes the site feel native on a phone.
const read = Literata({
  variable: '--font-read',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://smartdisruptions.com'),
  title: 'SmartDisruptions — building real things with AI, in public',
  description:
    'Honest breakdowns of things I build with AI — the timeline, the method, and the parts worth copying. The goal: make advanced AI usable for people who feel behind, stuck, or underpowered.',
  applicationName: 'Smart Disruptions',
  appleWebApp: {
    capable: true,
    title: 'Smart Disruptions',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'SmartDisruptions — building real things with AI, in public',
    description:
      'Honest breakdowns of things I build with AI — the timeline, the method, and the parts worth copying. Real apps, shipped and live.',
    url: 'https://smartdisruptions.com',
    siteName: 'SmartDisruptions',
    type: 'website',
    locale: 'en_US',
  },
  // max-image-preview:large is required for Google Discover to show posts
  // with their full-size hero image instead of a thumbnail.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartDisruptions — building real things with AI, in public',
    description:
      'Honest breakdowns of things I build with AI — the timeline, the method, and the parts worth copying. Real apps, shipped and live.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Draw under the notch and the home indicator; the header and tab bar pad
  // themselves with the safe-area insets.
  viewportFit: 'cover',
};

// Runs before first paint: the saved theme, else the OS preference, and the
// browser chrome colour to match — no flash of the wrong theme.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'#090b16':'#f4efe4');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${read.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#f4efe4" />
      </head>
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <a href="#main" className="sd-skip">
          Skip to content
        </a>
        <KiruDefs />
        <SiteHeader />
        <ViewTransition
          default={{ 'nav-forward': 'sd-page sd-fwd', 'nav-back': 'sd-page sd-back', default: 'sd-page' }}
        >
          <main id="main" className="flex-1">
            {children}
          </main>
        </ViewTransition>
        <Footer />
        <TabBar />
        <SiteFX />
        <PaletteTrigger />
        {/* Cookieless, aggregate page analytics (see /privacy). */}
        <Analytics />
        {/* Core Web Vitals / real-user load-speed data. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
