import type { Metadata } from 'next';
import { shareMeta } from '@/lib/shareCard';
import FieldNotesView from '../FieldNotesView';

const TITLE = 'Field notes archive — SmartDisruptions';
const DESCRIPTION =
  'My earlier field notes, written for the site’s older design: things I built with AI, what mattered, and why.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/content/archive' },
  // Its own share address and words, with the site card named explicitly.
  ...shareMeta({
    title: TITLE,
    description: DESCRIPTION,
    path: '/content/archive',
  }),
};

/**
 * THE WRITING ARCHIVE (October 2026).
 *
 * Josh's call, 2026-10-26: the Writing page keeps the field guide and Market
 * Storm, and every earlier post moved here (ARCHIVED_POST_SLUGS in
 * src/lib/fieldNotes.ts). Each post keeps its own page at /content/<slug>.
 * A static segment, so it wins over /content/[slug]; no post may take the
 * slug `archive`.
 */
export default function ContentArchive() {
  return <FieldNotesView view="archive" />;
}
