import type { Metadata } from 'next';
import AboutPreviewClient from './AboutPreviewClient';

// Scaffolding route for choosing an About layout. Kept out of the index and
// the sitemap — it is a decision surface, not a page of the site.
export const metadata: Metadata = {
  title: 'About templates — preview',
  robots: { index: false, follow: false },
};

export default function AboutPreviewPage() {
  return <AboutPreviewClient />;
}
