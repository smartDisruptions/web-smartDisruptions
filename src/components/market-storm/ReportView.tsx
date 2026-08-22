import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import ArticleBody from '@/components/ArticleBody';
import {
  MARKET_STORM_DISCLAIMER,
  MARKET_STORM_METHOD,
  type MarketStormReport,
  type DataTable as DataTableType,
  type SourceRef,
  type SourceKind,
  type HeadlineVsReal as HeadlineVsRealType,
  type ThroughLine as ThroughLineType,
} from '@/data/marketStorm';
/* ---- tone → token classes (bull=green, bear=red, warn=amber). Tone is
   carried by text color, a small dot, or a tinted header — never a colored
   side/top rail on a card (a documented AI-UI tell the house rejects).
   Moved to ./tone when the index started showing figures too: a second copy
   is how a bull turns green on one surface and neutral on another. ---- */
import { toneText, toneDot } from './tone';
import MethodBlock from './Method';

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

/* ---- price strip ----
   auto-fit rather than a fixed column count. It was `sm:grid-cols-5` against
   reports that carry five OR six cells, so a six-cell strip dropped its last
   stat onto a row of its own beside four empty slots — the most visible
   unpolished thing on the page. auto-fit fills the row at whatever count the
   report has and never orphans one.

   The dividers are a 1px grid gap over a border-coloured ground rather than
   per-cell borders, because a wrapped row makes `last:border-r-0` wrong on
   every cell that happens to end a line. */
function PriceStrip({ report }: { report: MarketStormReport }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-border">
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        {report.priceStrip.map((cell, i) => (
          <div key={i} className="bg-surface px-4 py-3">
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
    </div>
  );
}

/* ---- headline vs. filing: the recurring finding, given its own block ----
   Two stacked rows per claim rather than a table, because the pairing is the
   point and a 3-column table collapses badly on a phone. */
function HeadlineVsRealBlock({ items }: { items: HeadlineVsRealType[] }) {
  return (
    <div>
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
function DataTableBlock({ table }: { table: DataTableType }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full border-collapse text-left text-sm [font-variant-numeric:tabular-nums]">
          <thead className="bg-surface-elevated">
            <tr>
              {table.columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
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
      <h3 className="font-display mb-2 text-xl font-semibold tracking-tight text-text-primary">
        Verification ledger
      </h3>
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
      <h3 className="font-display mb-6 text-xl font-semibold tracking-tight text-text-primary">
        Open questions
      </h3>
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
/**
 * The source list, grouped and counted.
 *
 * A full report cites forty to fifty documents. Rendered flat that is a wall
 * the reader skims past, and skimming past it defeats the purpose — the whole
 * point of publishing the list is that someone can see the conclusions rest on
 * filings rather than on other people's articles. So the count leads, the
 * primary documents come first, and each shelf is labelled.
 */
const SOURCE_GROUPS: { kind: SourceKind; title: string; blurb: string }[] = [
  {
    kind: 'filing',
    title: 'Filings and primary documents',
    blurb:
      'What the company told a regulator. Every load-bearing figure traces here.',
  },
  {
    kind: 'company',
    title: 'Company disclosures',
    blurb:
      'Releases, decks, transcripts and engineering posts — the company speaking, unaudited.',
  },
  {
    kind: 'data',
    title: 'Market and pricing data',
    blurb:
      'Prices, multiples and market values, as of the dates given in the report.',
  },
  {
    kind: 'analysis',
    title: 'Reporting and analysis',
    blurb:
      'Third-party coverage, used for context and for checking claims against a second pair of eyes.',
  },
];

function sourceKind(s: SourceRef): SourceKind {
  return s.kind ?? (s.primary ? 'filing' : 'analysis');
}

function Sources({ sources }: { sources: SourceRef[] }) {
  const groups = SOURCE_GROUPS.map((g) => ({
    ...g,
    items: sources.filter((s) => sourceKind(s) === g.kind),
  })).filter((g) => g.items.length > 0);

  const primaryCount = groups
    .filter((g) => g.kind === 'filing' || g.kind === 'company')
    .reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
        Sources
      </h2>
      <p className="mb-8 mt-2 text-sm text-text-secondary">
        <strong className="text-text-primary [font-variant-numeric:tabular-nums]">
          {sources.length} documents
        </strong>{' '}
        consulted for this report
        {primaryCount > 0 && (
          <>
            {' — '}
            <strong className="text-text-primary [font-variant-numeric:tabular-nums]">
              {primaryCount}
            </strong>{' '}
            of them filings or first-party disclosures
          </>
        )}
        {'. Every link was checked before publication.'}
      </p>

      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.kind}>
            <h3 className="font-mono-accent text-accent">{g.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              {g.blurb}
            </p>
            <ol
              className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2"
              role="list"
            >
              {g.items.map((s) => (
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
                        s.primary
                          ? 'font-semibold text-bull'
                          : 'text-text-primary/80'
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
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---- shared disclaimer ---- */
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

/* ---- the whole report body, in a fixed, reusable sequence ---- */
/* A numbered stop on the walkthrough. The reports are long and technical, and
   a reader who does not do this for a living needs to know where they are and
   that there is an end. The number is the cheapest possible progress bar. */
function Stop({
  n,
  title,
  lede,
  children,
}: {
  n: number;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* The number sits ABOVE the title, not beside it. Inline, it pushed
          every h2 29px to the right of the content it heads — so the page had
          one left edge for its headings and a different one for everything
          under them, all the way down. A single flush edge is most of what
          reads as "aligned". */}
      <div className="border-b border-border pb-4">
        <p className="font-mono-accent text-accent [font-variant-numeric:tabular-nums]">
          {String(n).padStart(2, '0')}
        </p>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
          {title}
        </h2>
      </div>
      {lede && <p className="mt-5 max-w-[62ch] text-text-secondary">{lede}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/**
 * The report, as a walkthrough.
 *
 * The order here is the argument, and it changed for two reasons Josh named.
 *
 * REDUNDANCY. The reports were carrying every key figure four times over — once
 * in the summary prose, again as data in the scorecard and table, again as a
 * bull/bear bullet, and again inside the long-form analysis. Palantir's "93%"
 * appeared in twelve separate sections. The data blocks are the ones that show
 * a number best, so they keep it; the prose around them was cut back to what
 * the visuals cannot say.
 *
 * THE META GOES LAST. The disclaimer opened the article and the method note
 * closed it, so a reader met a caveat about AI research before a single fact
 * about the company. Everything about *how the research was made* — method,
 * verification ledger, open questions, disclaimer — now sits together at the
 * end under one heading. The company is the article; the method is the
 * appendix that earns it.
 *
 * The numbered stops exist because these run long and technical. A reader who
 * does not do this for a living should be able to see where they are.
 */
export default function ReportView({ report }: { report: MarketStormReport }) {
  return (
    <div className="mt-8 space-y-14">
      <ReportHero report={report} />
      <PriceStrip report={report} />

      <Stop n={1} title="What happened" lede={undefined}>
        <ArticleBody className="max-w-[62ch]">{report.summary}</ArticleBody>
      </Stop>

      <Stop
        n={2}
        title="The numbers that matter"
        lede="The figures the rest of this rests on, and which way each one cuts."
      >
        <KpiGrid report={report} />
      </Stop>

      {report.headlineVsReal && report.headlineVsReal.length > 0 && (
        <Stop
          n={3}
          title="The headline vs. the filing"
          lede="Every report in this section has found the same shape: the number that leads the coverage is not the number the filing supports."
        >
          <HeadlineVsRealBlock items={report.headlineVsReal} />
        </Stop>
      )}

      {/* The full print, collapsed.

          Every KPI card above is also a row in here — 8 of 8 on Amazon, 6 of 9
          on Palantir. Deleting the duplicate rows was the obvious fix and the
          wrong one: this table's job is letting somebody check the arithmetic,
          and a reference table missing its headline figures cannot do that.

          So it keeps every row and stops competing for attention instead. The
          walkthrough reader never opens it; the one who wants to verify gets
          the complete print. */}
      <Stop
        n={report.headlineVsReal?.length ? 4 : 3}
        title={report.printTableTitle}
      >
        <details className="group rounded-xl border border-border bg-surface">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-sm font-medium text-text-primary transition-colors hover:text-accent">
            <span
              className="font-mono text-xs text-accent transition-transform group-open:rotate-90"
              aria-hidden
            >
              &#9654;
            </span>
            Show the full print — {report.printTable.rows.length} rows, every
            figure this report rests on
          </summary>
          <div className="border-t border-border p-5">
            <DataTableBlock table={report.printTable} />
          </div>
        </details>
      </Stop>

      <Stop
        n={report.headlineVsReal?.length ? 5 : 4}
        title="The central tension"
        lede="The bull and the bear do not disagree on the facts. They disagree on one thing — and it is the whole investment."
      >
        <BullBear report={report} />
      </Stop>

      <Stop
        n={report.headlineVsReal?.length ? 6 : 5}
        title="What would prove this wrong"
        lede="The discipline: name in advance what would break each side of the case."
      >
        <Invalidation report={report} />
      </Stop>

      {report.soWhat && (
        <Stop
          n={report.headlineVsReal?.length ? 7 : 6}
          title="What this means if you don’t trade stocks"
        >
          <SoWhat report={report} />
        </Stop>
      )}

      {/* What is left of the long-form: the reasoning the blocks above cannot
          carry — valuation arithmetic, the risks ranked, the horizon. */}
      <Stop
        n={report.headlineVsReal?.length ? 8 : 7}
        title="The longer read"
        lede="Valuation, the risks in order, and the horizon this resolves on."
      >
        <ArticleBody className="max-w-[62ch]">{report.analysis}</ArticleBody>
      </Stop>

      {report.throughLine && <ThroughLineBlock line={report.throughLine} />}

      {/* ---- How the research was made. Everything meta, together, at the end. ---- */}
      <div className="space-y-10 rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8">
        <div>
          <p className="font-mono-accent mb-2 text-accent">
            How this was researched
          </p>
          <p className="max-w-[62ch] leading-relaxed text-text-primary/85">
            <Inline>{MARKET_STORM_METHOD}</Inline>
          </p>
        </div>
        {/* The section-wide description above says what STORM is; this says what
            happened on THIS run — who was in the room, how deep the refutation
            pass went, and what capped it. Reports written before the run record
            was captured render the description alone. */}
        <MethodBlock method={report.method} />
        <VerificationLedger report={report} />
        <OpenQuestions report={report} />
        <Disclaimer />
      </div>

      <Sources sources={report.sources} />
    </div>
  );
}
