import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FieldNotesView from '../../FieldNotesView';
import { totalNotePages } from '@/lib/fieldNotes';

/**
 * Pages 2..N of the Writing page.
 *
 * Page 1 is `/content`. Generating it here too would put the same notes at
 * two URLs, so `/content/page/1` is deliberately a 404 rather than a second
 * front door.
 */
// Every real page is known at build time (publishing is a rebuild), so an
// unknown one is a plain static 404 rather than an on-demand render.
export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: Math.max(0, totalNotePages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

/** Rejects `1`, `0`, `-2`, `01`, `2.5` and `abc` — only a clean 2..N passes. */
function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 && n <= totalNotePages ? n : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const n = parsePage(page);
  if (!n) return {};

  return {
    title: `Field notes — page ${n} of ${totalNotePages} · SmartDisruptions`,
    description: `Older field notes, page ${n} of ${totalNotePages}: plain-language guides from things I’ve actually built with AI.`,
    alternates: { canonical: `/content/page/${n}` },
    // Not indexed: every card here also lives at its own URL, so in an index
    // these pages could only compete with the notes they link to. `follow`
    // keeps the crawler walking through to them.
    robots: { index: false, follow: true },
    // No `openGraph`: it would replace the root one, share image included.
  };
}

export default async function FieldNotesPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const n = parsePage(page);
  if (!n) notFound();

  return <FieldNotesView page={n} />;
}
