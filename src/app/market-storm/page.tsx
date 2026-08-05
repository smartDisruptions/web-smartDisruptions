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

function ReportCard({ report }: { report: MarketStormReport }) {
  const v = report.verification;
  return (
    <Link href={`/market-storm/${report.slug}`} className="group block">
      <article className="overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_10px_30px_-12px_var(--sd-card-shadow)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-6 py-3 sm:px-8">
          <span className="font-mono text-lg font-bold tracking-wider text-accent">
            {report.ticker}
          </span>
          <span className="font-mono text-xs text-text-secondary">
            {report.catalyst}
          </span>
          <span className="ml-auto text-xs text-text-secondary">
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
        <div className="p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-text-primary transition-colors group-hover:text-accent sm:text-[1.6rem]">
            {report.title}
          </h2>
          <p className="mt-3 max-w-[62ch] text-text-secondary">
            {report.excerpt}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="rounded-md border border-bull bg-bull-soft px-2 py-1 text-bull">
              {v.confirmed} confirmed
            </span>
            <span className="rounded-md border border-warn bg-warn-soft px-2 py-1 text-warn">
              {v.partlyTrue} partly-true
            </span>
            <span className="rounded-md border border-border bg-fill px-2 py-1 text-text-primary">
              {v.corrected} corrected
            </span>
            <span className="ml-auto text-sm font-medium text-accent">
              Read the report &rarr;
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

      {/* How it works — the method-forward explainer */}
      <div className="mx-auto mt-14 max-w-4xl">
        <p className="font-mono-accent text-center text-text-secondary">
          How each report is made
        </p>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAKES.map((s) => (
            <div
              key={s.role}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <h2 className="text-sm font-semibold text-text-primary">
                {s.role}
              </h2>
              <p className="mt-1.5 text-sm leading-snug text-text-secondary">
                {s.probe}
              </p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-[60ch] text-center text-[0.95rem] leading-relaxed text-text-secondary">
          These agents interview each other while grounded in live web search,
          then a separate skeptic pass tries to{' '}
          <strong className="text-text-primary">refute</strong> every
          load-bearing claim against primary sources. What survives is written
          up —{' '}
          <strong className="text-text-primary">
            with the caveats it earned.
          </strong>
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto mt-12 max-w-4xl">
        <Disclaimer />
      </div>

      {/* Reports */}
      <div className="mx-auto mt-12 max-w-4xl space-y-8">
        {marketStormReports.map((report) => (
          <ReportCard key={report.slug} report={report} />
        ))}
      </div>
    </SectionContainer>
  );
}
