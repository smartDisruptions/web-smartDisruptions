import type { Metadata } from 'next';
import './drafts.css';

/**
 * /about-drafts — four candidate designs for the new About (October 2026),
 * previewed side by side so Josh can pick one. Not linked from the nav, not
 * in the sitemap, and noindex, so nothing outside a preview finds them. The
 * one he picks moves to its real address and this folder goes.
 *
 * Styles: ./drafts.css — adx- for the shared strip and index, then one
 * prefix per draft: adl- (letter), adc- (card), add- (doors), adm- (made).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DraftsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
