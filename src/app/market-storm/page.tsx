import type { Metadata } from 'next';
import Link from 'next/link';
import { marketStormReports, type MarketStormReport } from '@/data/marketStorm';
import { SectionContainer } from '@/components/ui';
import { Disclaimer } from '@/components/market-storm/ReportView';
import HeroImage from '@/components/HeroImage';
import { formatDate } from '@/lib/format';

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

// The four stakes the agents take — the method-forward hook. This is a real
// process (opposing roles → grounded interviews → adversarial verification),
// so the four-up grid encodes the method, it isn't decoration.
const STAKES = [
  {
    role: 'Fundamentals analyst',
    probe: 'Segment margins, cash generation, guidance.',
  },
  { role: 'Short-seller', probe: 'What could break the bull case.' },
  {
    role: 'Industry engineer',
    probe: 'The technology and the competitive moat.',
  },
  { role: 'Valuation watcher', probe: 'What the price already assumes.' },
];

/**
 * One report, as a card in a two-up grid.
 *
 * It used to be a full-bleed row roughly 900px tall — one whole screen per
 * report, so two could never be on screen at once, which is the one thing an
 * index has to do. Three things carried that weight and each is handled here:
 *
 * - The excerpt ran past 600 characters. That is an abstract, and the report
 *   page already has it; on an index the reader is choosing, not reading. It
 *   clamps to three lines.
 * - The verification chips were printed twice over. The `ledger` heroes ARE
 *   those counts, at display size — so the chips only render for a report whose
 *   hero is not already showing them.
 * - Two columns rather than three: the heroes are drawn to survive down to
 *   341px (see make-hero.mjs), and a three-up grid here lands near 280px, which
 *   crowds the ticker board's cells and the scorecard's tiles.
 */
function ReportCard({ report }: { report: MarketStormReport }) {
  const v = report.verification;
  // A ledger hero already renders these three counts as its entire design.
  const heroShowsLedger = report.heroTemplate === 'ledger';
  return (
    <Link href={`/market-storm/${report.slug}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_10px_30px_-12px_var(--sd-card-shadow)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-5 py-2.5">
          <span className="font-mono text-base font-bold tracking-wider text-accent">
            {report.ticker}
          </span>
          <span className="ml-auto font-mono text-xs text-text-secondary">
            {formatDate(report.publishDate)}
          </span>
        </div>
        {report.heroImage && (
          <div className="aspect-[1200/630] w-full overflow-hidden border-b border-border">
            <HeroImage
              post={{ ...report, title: report.title }}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          {/* One line. It wrapped to two in small mono, next to a date that
              already says half of it. */}
          <p className="truncate font-mono text-[0.7rem] uppercase tracking-wide text-text-secondary">
            {report.catalyst}
          </p>
          <h2 className="font-display mt-2 text-xl font-semibold leading-snug tracking-tight text-text-primary transition-colors group-hover:text-accent">
            {report.title}
          </h2>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-text-secondary">
            {report.excerpt}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 text-[0.7rem] font-semibold">
            {!heroShowsLedger && (
              <>
                <span className="rounded border border-bull bg-bull-soft px-1.5 py-0.5 text-bull">
                  {v.confirmed} confirmed
                </span>
                <span className="rounded border border-warn bg-warn-soft px-1.5 py-0.5 text-warn">
                  {v.partlyTrue} partly-true
                </span>
                <span className="rounded border border-border bg-fill px-1.5 py-0.5 text-text-primary">
                  {v.corrected} corrected
                </span>
              </>
            )}
            <span className="ml-auto text-sm font-medium text-accent">
              Read &rarr;
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function MarketStormIndex() {
  return (
    <SectionContainer className="py-20">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono-accent text-accent">Market Storm</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          The AI market, read by a research method
        </h1>
        <p className="mx-auto mt-5 max-w-[60ch] text-lg text-text-secondary">
          Not stock tips — a look at where AI is really going by following its
          money. Each report is produced by <strong>STORM</strong>, a
          multi-agent AI research method, pointed at a real market catalyst:
          earnings, a major deal, an industry move. The finance is the payload;
          the method is the point.
        </p>
      </div>

      {/* How it works.
          This was four bordered cards and a closing paragraph — a full screen
          of method before the reader reached a single report, on a page whose
          job is to get them into one. Every report page carries the method note
          in full, so the index only has to say enough to make the four stakes
          legible: one line of roles, one line of what happens to them. */}
      <div className="mx-auto mt-10 max-w-3xl text-center">
        <p className="font-mono-accent text-text-secondary">
          Four agents, one catalyst
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-text-secondary">
          {STAKES.map((s) => s.role).join(' · ')} — they interview each other
          grounded in live web search, then a separate skeptic pass tries to{' '}
          <strong className="text-text-primary">refute</strong> every
          load-bearing claim against primary sources. What survives is written
          up{' '}
          <strong className="text-text-primary">
            with the caveats it earned.
          </strong>
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto mt-10 max-w-3xl">
        <Disclaimer />
      </div>

      {/* Reports — two up. Three would put the heroes near 280px, below the
          341px they are drawn to survive at. */}
      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {marketStormReports.map((report) => (
          <ReportCard key={report.slug} report={report} />
        ))}
      </div>
    </SectionContainer>
  );
}
