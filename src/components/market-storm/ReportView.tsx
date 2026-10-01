import Link from 'next/link';
import ArticleBody from '@/components/ArticleBody';
import { Seal } from '@/components/brand/Kanji';
import Kanji from '@/components/brand/Kanji';
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
   carried by text color, a shape glyph, or a tinted header — never a colored
   side/top rail on a card (a documented AI-UI tell the house rejects).
   Moved to ./tone when the index started showing figures too: a second copy
   is how a bull turns green on one surface and neutral on another. ---- */
import { toneText, toneGlyph } from './tone';
import JumpNav from './JumpNav';
import BodyWithCharts from './BodyWithCharts';
import Takeaways from './Takeaways';
import MethodBlock from './Method';
import Inline from './Inline';

/** Small uppercase label used across the report's blocks. */
const LABEL =
  'hyphens-auto text-[0.66rem] font-bold uppercase leading-[1.1rem] tracking-[0.1em] [overflow-wrap:anywhere]';

/* ---- report hero: identity, and the verdict when nothing states it better ---- */
function ReportHero({ report }: { report: MarketStormReport }) {
  /**
   * Takeaways supersede the verdict.
   *
   * They do the same job — say what the report found before the reader commits
   * — and they do it better: numbered, one idea each, every line carrying a
   * figure. Printing both put a 108-word paragraph between the headline and
   * the findings, four of whose six claims then reappeared immediately below
   * it. So a report with takeaways shows identity here and gets straight to
   * them; a report without one keeps the verdict, which is most of them.
   *
   * The identity strip always stays. The ticker, the company and the "verified
   * against filings through…" line are provenance, they appear nowhere else on
   * the page, and every report in the section carries them.
   */
  const showVerdict = !report.keyTakeaways?.length;
  return (
    <div>
      <div className="flex flex-wrap items-end gap-x-5 gap-y-2 border-b border-border pb-5">
        <span className="font-display text-[2.2rem] leading-none tracking-[0.02em] text-accent sm:text-[2.75rem]">
          {report.ticker}
        </span>
        <span className="pb-0.5 text-[0.95rem] font-semibold text-text-primary">
          {report.company}
        </span>
        <span className="w-full pb-0.5 font-mono text-xs leading-relaxed text-text-secondary sm:ml-auto sm:w-auto sm:max-w-[26rem] sm:text-right">
          {report.catalyst}
        </span>
      </div>
      {showVerdict && (
        /* Set between kagi brackets — 「 」, the Japanese quotation marks —
           drawn in vermilion, because it is the report's own verdict. */
        <div className="ms-kagi mt-8 w-fit max-w-[60ch] px-5 py-3 sm:px-7">
          <p className="font-read text-[1.3rem] font-semibold leading-snug text-text-primary sm:text-[1.6rem]">
            {report.verdict}
          </p>
        </div>
      )}
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
   every cell that happens to end a line.

   Renders nothing when the report carries no strip. The strip is market data
   — a price, a cap, the print's headline number — and the thesis has none of
   that; it had been filled with the figures the takeaways and the KPI grid
   already show, so the same six numbers appeared three times in two screens. */
function PriceStrip({ report }: { report: MarketStormReport }) {
  if (!report.priceStrip?.length) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-border">
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        }}
      >
        {report.priceStrip.map((cell, i) => {
          const tone = cell.tone ?? 'neutral';
          return (
            <div key={i} className="bg-background px-4 py-3.5">
              <div className={`${LABEL} text-text-secondary`}>{cell.k}</div>
              <div
                className={`mt-1.5 flex items-baseline gap-1.5 font-mono text-lg font-bold [font-variant-numeric:tabular-nums] ${toneText[tone]}`}
              >
                {toneGlyph[tone] && (
                  <span className="ms-tone-glyph" aria-hidden="true">
                    {toneGlyph[tone]}
                  </span>
                )}
                {cell.v}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- headline vs. filing: the recurring finding, given its own block ----
   Two stacked rows per claim rather than a table, because the pairing is the
   point and a 3-column table collapses badly on a phone. On a wide screen a
   vermilion slash cuts the two halves apart — Kiru's whole job. */
function HeadlineVsRealBlock({ items }: { items: HeadlineVsRealType[] }) {
  return (
    <div className="space-y-5">
      {items.map((item, i) => (
        <div
          key={i}
          className="sd-reveal overflow-hidden rounded-2xl border border-border bg-surface"
        >
          <div className="ms-cut grid grid-cols-1 sm:grid-cols-2">
            <div className="border-b border-border bg-fill px-5 py-5 sm:border-b-0 sm:pr-9">
              <div className={`${LABEL} text-text-secondary`}>
                The headline says
              </div>
              <p className="font-read mt-2 text-[1rem] leading-relaxed text-text-primary/85">
                <Inline>{item.headline}</Inline>
              </p>
            </div>
            <div className="px-5 py-5 sm:pl-9">
              <div className={`${LABEL} ${toneText.warn}`}>The filing says</div>
              <p className="font-read mt-2 text-[1rem] leading-relaxed text-text-primary/85">
                <Inline>{item.real}</Inline>
              </p>
            </div>
          </div>
          <div className="border-t border-border bg-background px-5 py-3.5">
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
  );
}

/* ---- KPI scorecard ----
   Four across or three across on a wide screen — whichever leaves the fuller
   last row. Nine figures in fours left one tile alone on a row of its own;
   in threes they square off. */
function kpiCols(n: number): 3 | 4 {
  if (n % 4 === 0) return 4;
  if (n % 3 === 0) return 3;
  return n % 4 >= n % 3 ? 4 : 3;
}

function KpiGrid({ report }: { report: MarketStormReport }) {
  const cols = kpiCols(report.kpis.length);
  return (
    // Two up even on a phone: nine figures one per row ran to a 2,500px
    // column. The figure steps down a size to fit a half-width tile.
    <div
      className={`ms-kpis grid grid-cols-2 gap-2.5 sm:gap-3 ${
        cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
      }`}
    >
      {report.kpis.map((kpi, i) => {
        const tone = kpi.tone ?? 'neutral';
        return (
          <div
            key={i}
            className="sd-reveal flex min-w-0 flex-col rounded-2xl border border-border bg-background p-3.5 sm:p-5"
          >
            <div className={`${LABEL} text-text-secondary`}>
              {toneGlyph[tone] && (
                <span
                  className={`ms-tone-glyph mr-1.5 ${toneText[tone]}`}
                  aria-hidden="true"
                >
                  {toneGlyph[tone]}
                </span>
              )}
              {kpi.label}
            </div>
            <div
              className={`mt-2.5 break-words font-mono text-[1.08rem] font-bold leading-tight tracking-[-0.02em] [font-variant-numeric:tabular-nums] sm:mt-3 sm:text-[1.45rem] ${toneText[tone]}`}
            >
              {kpi.value}
            </div>
            {kpi.delta && (
              <div className={`mt-1 text-xs font-bold ${toneText[tone]}`}>
                {kpi.delta}
              </div>
            )}
            {kpi.note && (
              <div className="mt-3 border-t border-border pt-3 text-[0.8125rem] leading-snug text-text-secondary sm:text-sm">
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
          <thead className="bg-background">
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
                    {/* A load-bearing row gets a small vermilion mark. */}
                    {c === 0 && row.star && (
                      <span
                        className="mr-2 inline-block h-1.5 w-1.5 rotate-45 bg-pen align-middle"
                        aria-hidden="true"
                      />
                    )}
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

/* ---- bull / bear split ---- */
function BullBear({ report }: { report: MarketStormReport }) {
  if (!report.bull?.length || !report.bear?.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Pole tone="bull" heading="The Bull holds" items={report.bull} />
      <Pole tone="bear" heading="The Bear presses" items={report.bear} />
    </div>
  );
}

/**
 * The central question, on its own.
 *
 * It used to live inside BullBear. When the bull and bear lists became optional
 * — a thesis piece lays its evidence out as contrasts and does not need them —
 * the question silently disappeared with them, which is the wrong thing to lose:
 * it does not depend on the poles, and it is the framing the rest answers.
 */
function TheQuestion({ report }: { report: MarketStormReport }) {
  if (!report.theQuestion) return null;
  return (
    <div className="sd-reveal relative overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.05] px-6 py-7 sm:px-9 sm:py-8">
      <Kanji
        char="探"
        className="pointer-events-none absolute -right-5 -top-5 h-36 w-36 text-accent opacity-[0.07]"
      />
      <p className="font-mono-accent relative mb-3 text-accent-hover">
        The one question
      </p>
      <p className="font-read relative max-w-[60ch] text-[1.15rem] leading-relaxed text-text-primary/90 sm:text-[1.28rem]">
        <Inline>{report.theQuestion}</Inline>
      </p>
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
    <div className="sd-reveal overflow-hidden rounded-2xl border border-border bg-surface">
      <div
        className={`border-b border-border px-5 py-3.5 ${
          tone === 'bull' ? 'bg-bull-soft' : 'bg-bear-soft'
        }`}
      >
        <span className={`font-mono-accent ${toneText[tone]}`}>
          {tone === 'bull' ? '▲ ' : '▼ '}
          {heading}
        </span>
      </div>
      <ul className="px-5" role="list">
        {items.map((item, i) => (
          <li
            key={i}
            className="font-read border-b border-border py-3.5 text-[0.98rem] leading-relaxed text-text-primary/85 last:border-b-0"
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
  const sides = [
    {
      tone: 'bull' as const,
      title: 'The bull breaks if…',
      items: report.invalidation.bull,
    },
    {
      tone: 'bear' as const,
      title: 'The bear fails if…',
      items: report.invalidation.bear,
    },
  ];
  return (
    <div>
      {report.invalidationIntro && (
        <div className="mb-7 max-w-[62ch]">
          <ArticleBody>{report.invalidationIntro}</ArticleBody>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {sides.map((side) => (
          <div
            key={side.tone}
            className="sd-reveal overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <div
              className={`border-b border-border px-6 py-3.5 ${
                side.tone === 'bull' ? 'bg-bull-soft' : 'bg-bear-soft'
              }`}
            >
              <h3 className={`text-base font-bold ${toneText[side.tone]}`}>
                {side.title}
              </h3>
            </div>
            <ul className="font-read space-y-3 p-6 text-[0.98rem] leading-relaxed text-text-primary/85">
              {side.items.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className={toneText[side.tone]} aria-hidden>
                    —
                  </span>
                  <span>
                    <Inline>{item}</Inline>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- verification ledger ---- */
function VerificationLedger({ report }: { report: MarketStormReport }) {
  const v = report.verification;
  return (
    <div>
      <h3 className="font-display mb-2 text-[1.35rem] leading-tight text-text-primary">
        Verification ledger
      </h3>
      <p className="mb-6 max-w-[62ch] text-text-secondary">
        A separate skeptic pass tried to refute every load-bearing claim against
        primary sources. Where it bit:
      </p>
      <div className="mb-6 flex flex-wrap gap-2.5">
        <span className="rounded-full border border-bull bg-bull-soft px-3.5 py-1.5 text-sm font-bold text-bull">
          {v.confirmed} confirmed
        </span>
        <span className="rounded-full border border-warn bg-warn-soft px-3.5 py-1.5 text-sm font-bold text-warn">
          {v.partlyTrue} partly-true
        </span>
        <span className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-bold text-text-primary">
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
      {/* Line items on the receipt, not cards: dashed rules between them. */}
      <div className="ms-ledger">
        {v.items.map((item, i) => (
          <div key={i} className="py-4">
            <div className="mb-1.5 flex flex-wrap items-baseline gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide ${
                  item.kind === 'partly'
                    ? 'bg-warn-soft text-warn'
                    : 'bg-surface text-text-primary'
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
      <h3 className="font-display mb-6 text-[1.35rem] leading-tight text-text-primary">
        Open questions
      </h3>
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-3">
        {report.openQuestions.map((q, i) => (
          <div key={i} className="ms-dash-top pt-4">
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
    <div className="sd-reveal rounded-2xl border border-accent/20 bg-accent/[0.05] p-6 sm:p-8">
      <ArticleBody className="max-w-[62ch] [&>p:last-child]:mb-0">
        {report.soWhat ?? ''}
      </ArticleBody>
    </div>
  );
}

function ThroughLineBlock({ line }: { line: ThroughLineType }) {
  return (
    <div>
      <h2 className="font-display mb-3 text-[1.6rem] leading-[1.15] text-text-primary sm:text-[1.9rem]">
        How this reads against the other reports
      </h2>
      <ArticleBody className="max-w-[62ch]">{line.text}</ArticleBody>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {line.links.map((l) => (
          <Link
            key={l.slug}
            href={`/market-storm/${l.slug}`}
            className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-semibold text-text-primary transition-[color,border-color,scale] hover:border-accent/40 hover:text-accent active:scale-[0.97]"
          >
            {l.label}{' '}
            <span className="ms-cta-arrow inline-block">
              &rarr;
            </span>
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
      <h2 className="font-display text-[1.6rem] leading-[1.15] text-text-primary sm:text-[1.9rem]">
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

      <div className="space-y-9">
        {groups.map((g) => (
          <section key={g.kind}>
            <h3 className="sd-kicker">{g.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
              {g.blurb}
            </p>
            <ol
              className="mt-4 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2"
              role="list"
            >
              {g.items.map((s) => (
                <li
                  key={s.n}
                  className="flex gap-3 border-b border-dashed border-border py-2 text-sm leading-snug"
                >
                  <span className="w-6 shrink-0 font-mono text-xs font-bold text-accent [font-variant-numeric:tabular-nums]">
                    {s.n}
                  </span>
                  <span className="min-w-0 text-text-secondary [overflow-wrap:anywhere]">
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

/* ---- shared disclaimer ----
   An ofuda: the paper-slip material, pinned with a 学 ("study") seal. The
   slip is the same object in both lights, so its words are the slip's own
   sumi ink, never a theme colour. */
export function Disclaimer() {
  return (
    <div className="ms-ofuda sd-note text-[0.8125rem] leading-relaxed">
      <Seal char="学" className="ms-ofuda-seal" />
      <span className="font-bold">Research, not advice. </span>
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
/**
 * The stops in this report, in order, with the ids the jump nav anchors to.
 *
 * Derived rather than hand-numbered. Every stop used to carry its own
 * `n={report.headlineVsReal?.length ? 6 : 5}` expression, which meant the
 * numbering was restated eight times and adding a section meant editing all of
 * them. Worse, the jump nav would have had to repeat the same conditionals a
 * ninth time and could drift out of agreement with the page it indexes.
 * One list, one source of truth, and the numbers fall out of the order.
 */
function stopsFor(report: MarketStormReport) {
  return [
    { part: 'Start here', id: 'what-happened', label: 'What happened' },
    { part: 'Start here', id: 'the-numbers', label: 'The numbers that matter' },
    ...(report.headlineVsReal?.length
      ? [
          {
            part: 'Start here',
            id: 'headline-vs-filing',
            label: 'The headline vs. the fine print',
          },
        ]
      : []),
    ...(report.printTable
      ? [
          {
            part: 'Start here',
            id: 'the-print',
            label: report.printTableTitle ?? 'The print',
          },
        ]
      : []),
    ...(report.bull?.length && report.bear?.length
      ? [
          {
            part: 'Start here',
            id: 'central-tension',
            label: 'The central tension',
          },
        ]
      : []),
    // Evidence, then the tests of it. Sections replace the single long read:
    // each becomes its own numbered stop, which is what lets the nav list them
    // and a reader land in one.
    ...(report.sections?.length
      ? report.sections.map((x) => ({
          part: x.part ?? 'The evidence',
          id: x.id,
          label: x.label,
        }))
      : [
          {
            part: 'The evidence',
            id: 'longer-read',
            label: 'The longer read',
          },
        ]),
    {
      part: 'The verdict',
      id: 'invalidation',
      // A report carrying the intro has already asked "what would settle
      // this?" in prose, so the stop takes that name rather than listing the
      // same idea twice under two headings.
      label: report.invalidationIntro
        ? 'What would settle it'
        : 'What would prove this wrong',
    },
    ...(report.soWhat
      ? [
          {
            part: 'The verdict',
            id: 'so-what',
            label: 'What this means for you',
          },
        ]
      : []),
    { part: 'Receipts', id: 'method', label: 'How this was researched' },
    { part: 'Receipts', id: 'sources', label: 'Sources' },
  ];
}

const pad = (n: number) => String(n).padStart(2, '0');

function Stop({
  n,
  of,
  id,
  title,
  lede,
  children,
}: {
  n: number;
  of: number;
  id?: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    // scroll-mt keeps an anchored heading clear of the sticky site header
    // instead of landing underneath it, which is the classic jump-link bug.
    <section id={id} className="scroll-mt-24">
      {/* The number sits ABOVE the title, not beside it. Inline, it pushed
          every h2 29px to the right of the content it heads — so the page had
          one left edge for its headings and a different one for everything
          under them, all the way down. A single flush edge is most of what
          reads as "aligned". It is stamped like a hanko, and says how many
          stops there are in all. */}
      <div className="border-b border-border pb-4">
        <p className="flex items-center gap-2.5">
          <span className="ms-stop-num">{pad(n)}</span>
          <span className="font-mono text-xs text-text-secondary [font-variant-numeric:tabular-nums]">
            / {pad(of)}
          </span>
        </p>
        <h2 className="font-display mt-3 text-[1.6rem] leading-[1.15] text-text-primary sm:text-[1.9rem]">
          {title}
        </h2>
      </div>
      {lede && (
        <p className="font-read mt-5 max-w-[62ch] text-[1.02rem] leading-relaxed text-text-secondary">
          {lede}
        </p>
      )}
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
  const stops = stopsFor(report);
  const nOf = (id: string) => stops.findIndex((s) => s.id === id) + 1;
  const of = stops.length;

  return (
    <div className="space-y-14">
      <ReportHero report={report} />
      <Takeaways lead={report.takeawaysLead} items={report.keyTakeaways} />
      <PriceStrip report={report} />

      {/* Body and nav, side by side on large screens.
          The nav comes AFTER the body in source order so a screen reader and a
          keyboard user meet the report before its table of contents, and
          `lg:order-first` puts it on the left visually. Reading order and
          visual order are allowed to differ; which one serves the reader is
          the question, and here they want opposite things. */}
      <div className="sd-report-grid">
        <div className="sd-report-body min-w-0 space-y-16">
          <Stop
            n={nOf('what-happened')}
            of={of}
            id="what-happened"
            title="What happened"
            lede={undefined}
          >
            <ArticleBody className="max-w-[62ch]">{report.summary}</ArticleBody>
          </Stop>

          <Stop
            n={nOf('the-numbers')}
            of={of}
            id="the-numbers"
            title="The numbers that matter"
            lede="The figures the rest of this rests on, and which way each one cuts."
          >
            <KpiGrid report={report} />
          </Stop>

          {report.headlineVsReal && report.headlineVsReal.length > 0 && (
            <Stop
              n={nOf('headline-vs-filing')}
              of={of}
              id="headline-vs-filing"
              title="The headline vs. the fine print"
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
          {report.printTable && (
            <Stop
              n={nOf('the-print')}
              of={of}
              id="the-print"
              title={report.printTableTitle ?? 'The print'}
            >
              <details className="ms-fold group rounded-2xl border border-border bg-background">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-text-primary transition-colors hover:text-accent">
                  <span
                    className="ms-chev grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface font-mono text-[0.6rem] text-accent"
                    aria-hidden
                  >
                    &#9654;
                  </span>
                  Show the full print — {report.printTable.rows.length} rows,
                  every figure this report rests on
                </summary>
                <div className="border-t border-border bg-surface p-3 sm:p-5">
                  <DataTableBlock table={report.printTable} />
                </div>
              </details>
            </Stop>
          )}

          {report.bull?.length && report.bear?.length ? (
            <Stop
              n={nOf('central-tension')}
              of={of}
              id="central-tension"
              title="The central tension"
              lede="The bull and the bear do not disagree on the facts. They disagree on one thing — and it is the whole investment."
            >
              <BullBear report={report} />
            </Stop>
          ) : null}

          {/* With no bull/bear stop to host it, the question stands alone here,
          just before the evidence sections that answer it. */}
          {!(report.bull?.length && report.bear?.length) && (
            <TheQuestion report={report} />
          )}

          {/* Sections, or the single long read if the report has none.
          A thesis piece carries its whole argument here, and 1,290 words under
          one heading is a wall however the prose reads — so each idea gets its
          own numbered stop and its own figure, and the nav can list them. */}
          {report.sections?.length ? (
            report.sections.map((sec) => (
              <Stop
                key={sec.id}
                n={nOf(sec.id)}
                of={of}
                id={sec.id}
                title={sec.label}
              >
                <BodyWithCharts
                  markdown={sec.body}
                  charts={report.charts}
                  className="max-w-[62ch]"
                />
              </Stop>
            ))
          ) : (
            <Stop
              n={nOf('longer-read')}
              of={of}
              id="longer-read"
              title="The longer read"
              lede="Valuation, the risks in order, and the horizon this resolves on."
            >
              <BodyWithCharts
                markdown={report.analysis}
                charts={report.charts}
                className="max-w-[62ch]"
              />
            </Stop>
          )}

          <Stop
            n={nOf('invalidation')}
            of={of}
            id="invalidation"
            title={
              report.invalidationIntro
                ? 'What would settle it'
                : 'What would prove this wrong'
            }
            lede="The discipline: name in advance what would break each side of the case."
          >
            <Invalidation report={report} />
          </Stop>

          {report.soWhat && (
            <Stop
              n={nOf('so-what')}
              of={of}
              id="so-what"
              title="What this means for you"
              lede="If you do not trade stocks, this is the part that still reaches you."
            >
              <SoWhat report={report} />
            </Stop>
          )}

          {report.throughLine && <ThroughLineBlock line={report.throughLine} />}

          {/* ---- How the research was made. Everything meta, together, at the
               end — printed as a receipt, perforated top and bottom, because
               that is what it is. ---- */}
          <div
            id="method"
            className="ms-receipt scroll-mt-24 space-y-12 px-5 py-10 sm:px-8 sm:py-12"
          >
            <div>
              <p className="sd-kicker mb-3">How this was researched</p>
              <p className="font-read max-w-[62ch] text-[1.02rem] leading-relaxed text-text-primary/85">
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
        </div>

        <div className="sd-report-nav">
          <JumpNav items={stops} />
        </div>
      </div>

      <div id="sources" className="sd-defer scroll-mt-24">
        <Sources sources={report.sources} />
      </div>
    </div>
  );
}
