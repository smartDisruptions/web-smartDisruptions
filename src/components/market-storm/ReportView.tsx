import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import ArticleBody from '@/components/ArticleBody';
import {
  MARKET_STORM_DISCLAIMER,
  MARKET_STORM_METHOD,
  type MarketStormReport,
  type Tone,
  type DataTable as DataTableType,
  type SourceRef,
  type HeadlineVsReal as HeadlineVsRealType,
  type ThroughLine as ThroughLineType,
} from '@/data/marketStorm';

/* ---- tone → token classes (bull=green, bear=red, warn=amber). Tone is
   carried by text color, a small dot, or a tinted header — never a colored
   side/top rail on a card (a documented AI-UI tell the house rejects). ---- */
const toneText: Record<Tone, string> = {
  bull: 'text-bull',
  bear: 'text-bear',
  warn: 'text-warn',
  neutral: 'text-text-primary',
};
const toneDot: Record<Tone, string> = {
  bull: 'bg-bull',
  bear: 'bg-bear',
  warn: 'bg-warn',
  neutral: 'bg-text-secondary',
};

/* ---- inline markdown (bold/italic/code/links) with no block wrapper ---- */
function Inline({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <>{children}</>,
        strong: ({ children }) => (
          <strong className="font-semibold text-text-primary">
            {children}
          </strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => (
          <code className="rounded bg-fill px-1 py-0.5 font-mono text-[0.85em] text-accent-hover">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono-accent text-accent">{children}</p>;
}

/* ---- report hero: ticker + verdict + method mark ---- */
function ReportHero({ report }: { report: MarketStormReport }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="border-b border-border px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="font-mono text-xl font-bold tracking-wider text-accent">
            {report.ticker}
          </span>
          <span className="text-sm text-text-secondary">{report.company}</span>
          <span className="ml-auto font-mono text-xs text-text-secondary">
            {report.catalyst}
          </span>
        </div>
      </div>
      <div className="px-6 py-7 sm:px-8">
        <p className="max-w-[58ch] font-display text-xl font-semibold leading-snug text-text-primary sm:text-2xl">
          {report.verdict}
        </p>
      </div>
    </div>
  );
}

/* ---- price strip ---- */
function PriceStrip({ report }: { report: MarketStormReport }) {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-5">
      {report.priceStrip.map((cell, i) => (
        <div
          key={i}
          className="border-b border-border px-4 py-3 sm:border-b-0 sm:border-r sm:last:border-r-0"
        >
          <div className="font-mono-accent text-text-secondary">{cell.k}</div>
          <div
            className={`mt-1 font-mono text-lg font-semibold [font-variant-numeric:tabular-nums] ${
              toneText[cell.tone ?? 'neutral']
            }`}
          >
            {cell.v}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- headline vs. filing: the recurring finding, given its own block ----
   Two stacked rows per claim rather than a table, because the pairing is the
   point and a 3-column table collapses badly on a phone. */
function HeadlineVsRealBlock({ items }: { items: HeadlineVsRealType[] }) {
  return (
    <div>
      <h2 className="font-display mb-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        The headline number vs. the filing
      </h2>
      <p className="mb-6 max-w-[62ch] text-text-secondary">
        Every report in this section has found the same shape: the number that
        leads the coverage is not the number the filing supports. Here is where
        they part company.
      </p>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="border-b border-border px-5 py-4 sm:border-b-0 sm:border-r">
                <div className="font-mono-accent text-text-secondary">
                  The headline says
                </div>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-text-primary/85">
                  <Inline>{item.headline}</Inline>
                </p>
              </div>
              <div className="px-5 py-4">
                <div className={`font-mono-accent ${toneText.warn}`}>
                  The filing says
                </div>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-text-primary/85">
                  <Inline>{item.real}</Inline>
                </p>
              </div>
            </div>
            <div className="border-t border-border bg-fill px-5 py-3">
              <p className="text-sm leading-relaxed text-text-secondary">
                <span className="font-semibold text-text-primary">
                  The gap:{' '}
                </span>
                <Inline>{item.gap}</Inline>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- KPI scorecard ---- */
function KpiGrid({ report }: { report: MarketStormReport }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {report.kpis.map((kpi, i) => {
        const tone = kpi.tone ?? 'neutral';
        return (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${toneDot[tone]}`}
                aria-hidden
              />
              <div className="font-mono-accent text-text-secondary">
                {kpi.label}
              </div>
            </div>
            <div
              className={`mt-2 font-mono text-2xl font-bold leading-tight [font-variant-numeric:tabular-nums] ${toneText[tone]}`}
            >
              {kpi.value}
            </div>
            {kpi.delta && (
              <div className={`mt-1 text-xs font-semibold ${toneText[tone]}`}>
                {kpi.delta}
              </div>
            )}
            {kpi.note && (
              <div className="mt-2 text-sm leading-snug text-text-secondary">
                {kpi.note}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---- structured data table (full width, star rows, right-aligned nums) ---- */
function DataTableBlock({
  table,
  title,
}: {
  table: DataTableType;
  title: string;
}) {
  return (
    <div>
      <h2 className="font-display mb-4 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        {title}
      </h2>
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full border-collapse text-left text-sm [font-variant-numeric:tabular-nums]">
          <thead className="bg-surface-elevated">
            <tr>
              {table.columns.map((col, i) => (
                <th
                  key={i}
                  className={`border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-secondary ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r} className={row.star ? 'bg-accent/[0.06]' : undefined}>
                {row.cells.map((cell, c) => (
                  <td
                    key={c}
                    className={`border-b border-border px-4 py-3 align-top ${
                      table.columns[c]?.align === 'right' ? 'text-right' : ''
                    } ${
                      c === 0
                        ? 'font-medium text-text-primary'
                        : 'text-text-primary/85'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- bull / bear split + the central question ---- */
function BullBear({ report }: { report: MarketStormReport }) {
  return (
    <div>
      <h2 className="font-display mb-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        The central tension
      </h2>
      <p className="mb-6 max-w-[62ch] text-text-secondary">
        The bull and bear don’t disagree on the facts. They disagree on one
        thing — and it’s the whole investment.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Pole tone="bull" heading="The Bull holds" items={report.bull} />
        <Pole tone="bear" heading="The Bear presses" items={report.bear} />
      </div>
      <div className="mt-6 rounded-xl border border-border bg-accent/[0.06] px-6 py-5">
        <p className="font-mono-accent mb-2 text-accent">The one question</p>
        <p className="max-w-[62ch] text-lg leading-relaxed text-text-primary/90">
          <Inline>{report.theQuestion}</Inline>
        </p>
      </div>
    </div>
  );
}

function Pole({
  tone,
  heading,
  items,
}: {
  tone: 'bull' | 'bear';
  heading: string;
  items: string[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-3">
        <span className={`font-mono-accent ${toneText[tone]}`}>
          {tone === 'bull' ? '▲ ' : '▼ '}
          {heading}
        </span>
      </div>
      <ul className="space-y-0 px-5" role="list">
        {items.map((item, i) => (
          <li
            key={i}
            className="border-b border-border py-3 text-[0.95rem] leading-relaxed text-text-primary/85 last:border-b-0"
          >
            <Inline>{item}</Inline>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- invalidation duo ---- */
function Invalidation({ report }: { report: MarketStormReport }) {
  return (
    <div>
      <h2 className="font-display mb-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        What would invalidate this view
      </h2>
      <p className="mb-6 max-w-[62ch] text-text-secondary">
        The discipline: name in advance what would prove each side wrong.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-3">
            <h3 className={`text-base font-semibold ${toneText.bull}`}>
              The bull breaks if…
            </h3>
          </div>
          <ul className="space-y-2.5 p-6 text-[0.95rem] leading-relaxed text-text-primary/85">
            {report.invalidation.bull.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className={toneText.bull} aria-hidden>
                  —
                </span>
                <span>
                  <Inline>{item}</Inline>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-3">
            <h3 className={`text-base font-semibold ${toneText.bear}`}>
              The bear fails if…
            </h3>
          </div>
          <ul className="space-y-2.5 p-6 text-[0.95rem] leading-relaxed text-text-primary/85">
            {report.invalidation.bear.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className={toneText.bear} aria-hidden>
                  —
                </span>
                <span>
                  <Inline>{item}</Inline>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ---- verification ledger ---- */
function VerificationLedger({ report }: { report: MarketStormReport }) {
  const v = report.verification;
  return (
    <div>
      <h2 className="font-display mb-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        Verification ledger
      </h2>
      <p className="mb-6 max-w-[62ch] text-text-secondary">
        A separate skeptic pass tried to refute every load-bearing claim against
        primary sources. Where it bit:
      </p>
      <div className="mb-6 flex flex-wrap gap-3">
        <span className="rounded-lg border border-bull bg-bull-soft px-3 py-1.5 text-sm font-semibold text-bull">
          {v.confirmed} confirmed
        </span>
        <span className="rounded-lg border border-warn bg-warn-soft px-3 py-1.5 text-sm font-semibold text-warn">
          {v.partlyTrue} partly-true
        </span>
        <span className="rounded-lg border border-border bg-fill px-3 py-1.5 text-sm font-semibold text-text-primary">
          {v.corrected} corrected
        </span>
      </div>
      <p className="mb-5 max-w-[62ch] text-[0.95rem] leading-relaxed text-text-primary/85">
        {/* Each report's note opens with its own "Confirmed against X:" lead.
            Bold that lead wherever it ends, rather than hardcoding one
            company's name — which previously printed "Amazon" on every
            report, including Microsoft's. */}
        <span className="font-semibold text-text-primary">
          {v.confirmedNote.slice(0, v.confirmedNote.indexOf(':') + 1)}{' '}
        </span>
        {v.confirmedNote.slice(v.confirmedNote.indexOf(':') + 1).trim()}
      </p>
      <div className="space-y-3">
        {v.items.map((item, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface px-5 py-4"
          >
            <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide ${
                  item.kind === 'partly'
                    ? 'bg-warn-soft text-warn'
                    : 'bg-fill text-text-primary'
                }`}
              >
                {item.kind === 'partly' ? 'Partly-true' : 'Corrected'}
              </span>
              <span className="text-[0.95rem] font-semibold text-text-primary">
                <Inline>{item.title}</Inline>
              </span>
            </div>
            <p className="max-w-[68ch] text-sm leading-relaxed text-text-secondary">
              <Inline>{item.text}</Inline>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- open questions ---- */
function OpenQuestions({ report }: { report: MarketStormReport }) {
  return (
    <div>
      <h2 className="font-display mb-6 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        Open questions
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {report.openQuestions.map((q, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="font-mono text-xs font-bold text-accent">
              Q{i + 1}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-primary/85">
              <Inline>{q}</Inline>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- the non-finance takeaway + the cross-report through line ---- */
function SoWhat({ report }: { report: MarketStormReport }) {
  return (
    <div className="rounded-2xl border border-border bg-accent/[0.06] p-6 sm:p-8">
      <p className="font-mono-accent mb-3 text-accent">
        So what — if you don’t trade stocks
      </p>
      <ArticleBody className="max-w-[62ch] [&>p:last-child]:mb-0">
        {report.soWhat ?? ''}
      </ArticleBody>
    </div>
  );
}

function ThroughLineBlock({ line }: { line: ThroughLineType }) {
  return (
    <div>
      <h2 className="font-display mb-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        How this reads against the other reports
      </h2>
      <ArticleBody className="max-w-[62ch]">{line.text}</ArticleBody>
      <div className="mt-5 flex flex-wrap gap-3">
        {line.links.map((l) => (
          <Link
            key={l.slug}
            href={`/market-storm/${l.slug}`}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent/40 hover:text-accent"
          >
            {l.label} &rarr;
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---- sources ---- */
function Sources({ sources }: { sources: SourceRef[] }) {
  return (
    <div>
      <h2 className="font-display mb-6 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        Sources
      </h2>
      <ol
        className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2"
        role="list"
      >
        {sources.map((s) => (
          <li key={s.n} className="flex gap-3 text-sm leading-snug">
            <span className="font-mono text-xs font-bold text-accent [font-variant-numeric:tabular-nums]">
              {s.n}
            </span>
            <span className="text-text-secondary">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline decoration-border underline-offset-2 hover:text-accent hover:decoration-accent ${
                  s.primary ? 'font-semibold text-bull' : 'text-text-primary/80'
                }`}
              >
                {s.label}
              </a>
              {s.secondaryUrl && (
                <>
                  {' · '}
                  <a
                    href={s.secondaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs underline decoration-border underline-offset-2 hover:text-accent hover:decoration-accent"
                  >
                    {s.secondaryLabel ?? 'primary'}
                  </a>
                </>
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---- shared disclaimer + method note ---- */
export function Disclaimer() {
  return (
    <div className="rounded-lg border border-border bg-fill px-4 py-3 text-xs leading-relaxed text-text-secondary">
      <span className="font-semibold text-text-primary">
        Research, not advice.{' '}
      </span>
      {MARKET_STORM_DISCLAIMER.replace(
        /^Market Storm is research, not investment advice\.\s*/,
        ''
      )}
    </div>
  );
}

function MethodNote() {
  return (
    <div className="rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8">
      <p className="font-mono-accent mb-3 text-accent">How this was made</p>
      <p className="max-w-[62ch] leading-relaxed text-text-primary/85">
        <Inline>{MARKET_STORM_METHOD}</Inline>
      </p>
    </div>
  );
}

/* ---- the whole report body, in a fixed, reusable sequence ---- */
export default function ReportView({ report }: { report: MarketStormReport }) {
  return (
    <div className="mt-8 space-y-14">
      <Disclaimer />
      <ReportHero report={report} />
      <PriceStrip report={report} />

      <section>
        <Eyebrow>The one-paragraph read</Eyebrow>
        <ArticleBody className="mt-3 max-w-[62ch]">
          {report.summary}
        </ArticleBody>
      </section>

      {report.headlineVsReal && report.headlineVsReal.length > 0 && (
        <HeadlineVsRealBlock items={report.headlineVsReal} />
      )}

      <section>
        <Eyebrow>The scorecard</Eyebrow>
        <p className="mb-4 mt-1 max-w-[62ch] text-text-secondary">
          One quarter, two opposite signals — the operating business against the
          cash statement.
        </p>
        <KpiGrid report={report} />
      </section>

      <DataTableBlock
        table={report.printTable}
        title={report.printTableTitle}
      />

      <BullBear report={report} />

      {/* Long-form analysis: valuation, AI-compute, risk, horizon */}
      <ArticleBody className="max-w-[62ch]">{report.analysis}</ArticleBody>

      <Invalidation report={report} />
      <VerificationLedger report={report} />
      <OpenQuestions report={report} />
      {report.soWhat && <SoWhat report={report} />}
      {report.throughLine && <ThroughLineBlock line={report.throughLine} />}
      <Sources sources={report.sources} />
      <MethodNote />
    </div>
  );
}
