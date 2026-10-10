import type { Metadata } from 'next';
import MarketStormIndexView from '@/components/market-storm/IndexView';
import { shareMeta } from '@/lib/shareCard';

export const metadata: Metadata = {
  title:
    'Market Storm — the AI market, read by a research method · SmartDisruptions',
  // "Four AI agents" and "every load-bearing claim" were true of the earnings
  // reads only: the reports at the front ran nine and twenty-one agents, and
  // the earnings reads refute-test their top claims, not all of them.
  description:
    'STORM — a multi-agent AI research method — pointed at AI-market catalysts: earnings, big deals, industry moves. AI agents take opposing stakes, interview each other grounded in live web search, and a skeptic pass tries to refute the load-bearing claims. Research, not advice.',
  alternates: { canonical: '/market-storm' },
  // Its own openGraph used to carry no image, which dropped the site card:
  // a shared /market-storm link had no picture. shareMeta names it.
  ...shareMeta({
    title: 'Market Storm — the AI market, read by a research method',
    description:
      'A multi-agent AI research method pointed at AI-market catalysts. Research, not advice.',
    path: '/market-storm',
  }),
};

/**
 * The whole section on one page: the front, then the archive. It was paged
 * (/market-storm/page/N) while every report sat in one grid; those addresses
 * now redirect to /market-storm#archive (next.config.ts).
 */
export default function MarketStormIndex() {
  return <MarketStormIndexView />;
}
