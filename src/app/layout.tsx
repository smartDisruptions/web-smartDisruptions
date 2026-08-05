import type { Metadata } from 'next';
import { Inter, Instrument_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Body: Inter — clean, highly legible at long-form reading sizes.
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

// Display: Instrument Sans — clean, slightly condensed, modern.
//
// This replaced Fraunces, whose descending `f` dropped below the baseline and
// read as a quirk rather than a signature. Headlines and body are now both
// sans, so the contrast between them has to come from weight, size and the
// tighter set width of this face rather than from serif-against-sans.
const display = Instrument_Sans({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  // The canonical/OG base. Set to the branded domain so social + canonical
  // URLs are correct once smartdisruptions.com is pointed at this project.
  metadataBase: new URL('https://smartdisruptions.com'),
  title: 'SmartDisruptions — building real things with AI, in public',
  description:
    'Honest breakdowns of things I build with AI — the timeline, the method, and the parts worth copying. The goal: make advanced AI usable for people who feel behind, stuck, or underpowered.',
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
  // og:image / twitter:image are supplied by app/opengraph-image.tsx and
  // app/twitter-image.tsx (the branded card).
  twitter: {
    card: 'summary_large_image',
    title: 'SmartDisruptions — building real things with AI, in public',
    description:
      'Honest breakdowns of things I build with AI — the timeline, the method, and the parts worth copying. Real apps, shipped and live.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Set the theme before first paint so there's no flash of the wrong
            theme. Uses the saved choice, else the OS preference. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* Cookieless, aggregate page analytics (see /privacy). Requires
            Web Analytics enabled in the Vercel project settings. */}
        <Analytics />
        {/* Core Web Vitals / real-user load-speed data. Requires Speed
            Insights enabled in the Vercel project settings. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
