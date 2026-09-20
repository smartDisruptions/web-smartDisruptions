import type { Metadata } from 'next';
import { Caveat, Literata, Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// UI: Nunito — labels, nav, cards, captions. Rounded enough to sit beside
// handwriting without looking like a different site.
const ui = Nunito({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

// Display: Caveat — handwriting, for headlines and asides ONLY. It never sets
// a paragraph: a page of handwriting is a page nobody finishes.
const display = Caveat({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

// Reading: Literata — built for long-form screen reading. Article and report
// bodies use it (see ArticleBody), so the thing people came to read is set in
// a face made for reading, on a plain sheet, with the notebook around it.
const read = Literata({
  variable: '--font-read',
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
      className={`${ui.variable} ${display.variable} ${read.variable} h-full antialiased`}
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
