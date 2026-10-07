import type { Metadata } from 'next';
import { shareMeta } from '@/lib/shareCard';
import FieldNotesView from './FieldNotesView';

const TITLE = 'Field notes — SmartDisruptions';
const DESCRIPTION =
  'Plain-language guides from things I’ve actually built with AI: what mattered, and why.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/content' },
  // Its own share address and words, with the site card named explicitly:
  // left to the root's, a shared /content pointed at the home page.
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/content' }),
};

/**
 * Page 1 of the Writing page. Pages 2+ are at `/content/page/[page]`; the
 * whole view lives in FieldNotesView so the two routes can never drift apart.
 */
export default function ContentIndex() {
  return <FieldNotesView page={1} />;
}
