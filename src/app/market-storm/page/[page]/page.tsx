import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MarketStormIndexView, {
  totalReportPages,
} from '@/components/market-storm/IndexView';

/**
 * Pages 2..N only.
 *
 * Page 1 is `/market-storm`. Generating it here too would put the same six
 * cards at two URLs, so `/market-storm/page/1` is deliberately a 404 rather
 * than a second front door.
 */
export function generateStaticParams() {
  return Array.from({ length: Math.max(0, totalReportPages - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

/** Rejects `1`, `0`, `-2`, `01`, `2.5` and `abc` — only a clean 2..N passes. */
function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 && n <= totalReportPages ? n : null;
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
    title: `Market Storm — page ${n} of ${totalReportPages} · SmartDisruptions`,
    description: `Older Market Storm reports — page ${n} of ${totalReportPages}. Each one produced by STORM, a multi-agent AI research method, pointed at a real AI-market catalyst. Research, not advice.`,
    alternates: { canonical: `/market-storm/page/${n}` },
    // Deliberately not indexed. These pages hold no content of their own —
    // every card on them also lives at its own report URL — so all they can
    // do in an index is compete with the reports they link to. `follow`
    // keeps the crawler walking through to those reports.
    robots: { index: false, follow: true },
    openGraph: {
      title: `Market Storm — page ${n}`,
      description:
        'A multi-agent AI research method pointed at AI-market catalysts. Research, not advice.',
      url: `/market-storm/page/${n}`,
      type: 'website',
    },
  };
}

export default async function MarketStormIndexPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const n = parsePage(page);
  if (!n) notFound();

  return <MarketStormIndexView page={n} />;
}
