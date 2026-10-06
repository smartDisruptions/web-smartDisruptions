import type { Metadata } from 'next';
import FieldNotesView from './FieldNotesView';

const DESCRIPTION =
  'Plain-language guides from things I’ve actually built with AI: what mattered, and why.';

export const metadata: Metadata = {
  title: 'Field notes — SmartDisruptions',
  description: DESCRIPTION,
  alternates: { canonical: '/content' },
  // No `openGraph` here on purpose: a page-level openGraph object replaces
  // the root one wholesale, share image included, so setting it without an
  // image would leave the link with no card. The root's card carries over.
};

/**
 * Page 1 of the Writing page. Pages 2+ are at `/content/page/[page]`; the
 * whole view lives in FieldNotesView so the two routes can never drift apart.
 */
export default function ContentIndex() {
  return <FieldNotesView page={1} />;
}
