import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Body: Inter — clean, highly legible at long-form reading sizes.
const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

// Display: Fraunces — a characterful serif for headlines (the personality).
const fraunces = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
  axes: ['opsz'],
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
