import type { Metadata } from 'next';
import MarketStormIndexView from '@/components/market-storm/IndexView';

export const metadata: Metadata = {
  title:
    'Market Storm — the AI market, read by a research method · SmartDisruptions',
  description:
    'STORM — a multi-agent AI research method — pointed at AI-market catalysts: earnings, big deals, industry moves. Four AI agents take opposing stakes, interview each other grounded in live web search, and a skeptic pass tries to refute every load-bearing claim. Research, not advice.',
  alternates: { canonical: '/market-storm' },
  openGraph: {
    title: 'Market Storm — the AI market, read by a research method',
    description:
      'A multi-agent AI research method pointed at AI-market catalysts. Research, not advice.',
    url: '/market-storm',
    type: 'website',
  },
};

/**
 * Page 1 of the index. Pages 2+ are at `/market-storm/page/[page]`; the whole
 * view lives in IndexView so the two routes can never drift apart.
 */
export default function MarketStormIndex() {
  return <MarketStormIndexView page={1} />;
}
