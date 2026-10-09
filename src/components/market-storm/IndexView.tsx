import Link from 'next/link';
import { Fragment, type CSSProperties } from 'react';
import {
  archivedReports,
  frontReports,
  leadReport,
  type MarketStormEntry,
  cardKpis,
  methodOf,
  type Kpi,
} from '@/data/marketStorm';
import { Button, SectionContainer } from '@/components/ui';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { Disclaimer } from '@/components/market-storm/ReportView';
import { toneGlyph, toneText } from '@/components/market-storm/tone';
import StormSky from '@/components/market-storm/StormSky';
import HeroImage from '@/components/HeroImage';
import { formatDate } from '@/lib/format';
import {
  MethodBadge,
  verificationLine,
} from '@/components/market-storm/Method';

/** Everything below the lead: the rest of the front, then the archive. */
function gridReports(): MarketStormEntry[] {
  return [...frontReports().slice(1), ...archivedReports()];
}

/**
 * Reports per page.
 *
 * Six is two full rows of the three-up grid, so a page always ends on a
 * straight edge rather than a widowed card hanging off the last row. It is
 * also about one screen and a half on a laptop — enough that scrolling feels
 * like reading rather than paging, and few enough that the reader reaches a
 * decision point instead of an infinite column.
 */
export const REPORTS_PER_PAGE = 6;

/**
 * The pinned piece is excluded from the grid and from the page maths — it has
 * its own slot above, and showing it twice on page 1 would be the duplicate the
 * whole featured treatment is meant to avoid.
 */
export const totalReportPages = Math.max(
  1,
  Math.ceil(gridReports().length / REPORTS_PER_PAGE)
);

/** Authored newest-first, so page 1 is the newest. */
export function reportsOnPage(page: number): MarketStormEntry[] {
  const start = (page - 1) * REPORTS_PER_PAGE;
  return gridReports().slice(start, start + REPORTS_PER_PAGE);
}

/**
 * Page 1 lives at `/market-storm`, not `/market-storm/page/1`.
 *
 * Two URLs serving identical HTML is a duplicate-content problem, and the
 * bare section URL is the one that gets linked, shared and indexed. The
 * numbered route starts at 2 and page 1 is never generated there.
 */
export function pageHref(page: number): string {
  return page <= 1 ? '/market-storm' : `/market-storm/page/${page}`;
}

/**
 * The four stakes the agents take — the method-forward hook. This is a real
 * process (opposing roles → grounded interviews → adversarial verification),
 * so the roles are the method, not decoration.
 */
const STAKES = [
  'Fundamentals analyst',
  'Short-seller',
  'Industry engineer',
  'Valuation watcher',
];

/* ── The storm ─────────────────────────────────────────────────────────── */

/** Rain rings in the puddle at Kiru's feet (they run only while the storm does). */
const RIPPLES = [
  { '--w': '30%', '--x': '8%', '--y': '24%', '--d': '0s' },
  { '--w': '36%', '--x': '44%', '--y': '8%', '--d': '-0.7s' },
  { '--w': '24%', '--x': '70%', '--y': '40%', '--d': '-1.3s' },
] as unknown as CSSProperties[];

/**
 * The index hero: the live storm behind, the page kanji inking itself in,
 * and Kiru under his wagasa at the edge of it.
 *
 * The words sit in a clearing (`ms-clear`) and carry `data-storm-avoid`, so
 * StormSky aims its strikes beside them, never through them. Every word of
 * the explanation is the same as before; it has simply been given a sky.
 */
function StormHero({ page }: { page: number }) {
  const featured = leadReport();
  return (
    <section className="ms-hero" aria-labelledby="ms-hero-title">
      <StormSky variant="hero" />
      <div
        className="ms-wm sd-watermark -left-[14%] top-[3rem] w-[300px] sm:left-auto sm:-right-[4%] sm:top-[0.5rem] sm:w-[420px] lg:right-[3%] lg:-top-[2rem] lg:w-[470px]"
        aria-hidden="true"
      >
        <Kanji char="嵐" draw className="h-full w-full" />
      </div>

      <div className="ms-hero-inner mx-auto max-w-6xl px-5 pb-14 pt-[11.5rem] sm:px-6 sm:pt-[13.5rem] lg:pb-32 lg:pt-28">
        {/* Market Storm is a section of the Writing page now, and this is
            its archive. The way back is to that section, not the top of
            Writing. It sits in the open sky above the words, the way a
            report's back link does, so the clearing and Kiru keep their
            places — and it carries no data-storm-avoid: StormSky reads the
            first one it finds, which has to stay the words. */}
        <Link
          href="/content#market-storm"
          transitionTypes={['nav-back']}
          className="ms-back absolute left-5 top-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-text-secondary transition-[color,border-color,scale] hover:border-accent/40 hover:text-accent active:scale-[0.97] sm:left-6 sm:top-7 lg:top-8"
        >
          &larr; Writing
        </Link>
        <div className="ms-clear max-w-[41rem]" data-storm-avoid>
          <p className="sd-kicker">Market Storm · the archive</p>
          <h1
            id="ms-hero-title"
            className="ms-quake font-display mt-4 text-[2.45rem] leading-[1.03] text-text-primary sm:text-[3.5rem] lg:text-[4.25rem]"
          >
            The AI market, read by a research method
          </h1>
          <p className="font-read mt-6 max-w-[54ch] text-[1.0625rem] leading-[1.75] text-text-secondary sm:text-[1.1875rem]">
            Not stock tips — a look at where AI is really going by following its
            money. Each report is produced by{' '}
            <strong className="font-semibold text-text-primary">STORM</strong>,
            a multi-agent AI research method, pointed at a real market catalyst:
            earnings, a major deal, an industry move. The finance is the
            payload; the method is the point.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {page === 1 && featured ? (
              <Button href={`/market-storm/${featured.slug}`}>
                Read the standing thesis
              </Button>
            ) : null}
            <Button variant="secondary" href="#reports">
              Browse the reports
            </Button>
          </div>
        </div>

        {/* Feet on the line the words start from on a phone; on a wide
            screen, standing in the storm beside them. */}
        <div
          className="ms-kiru right-4 top-[2.1rem] w-[116px] sm:right-8 sm:top-[2.4rem] sm:w-[148px] lg:bottom-[5.5rem] lg:right-10 lg:top-auto lg:w-[250px]"
          aria-hidden="true"
        >
          <span className="ms-puddle">
            {RIPPLES.map((style, i) => (
              <span key={i} className="ms-ripple" style={style} />
            ))}
          </span>
          <Kiru pose="storm" />
        </div>
      </div>
    </section>
  );
}

/* ── How it works ──────────────────────────────────────────────────────── */

/**
 * The method as a picture: four seats around one catalyst, every pair of
 * them in conversation, and a fifth seat that only the thesis runs fill.
 * Decorative — the paragraph beside it says all of this in words.
 */
function StormCell({ className = '' }: { className?: string }) {
  const seats: [number, number][] = [
    [34, 34],
    [146, 34],
    [146, 146],
    [34, 146],
  ];
  const pairs: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [0, 2],
    [1, 3],
  ];
  return (
    <svg
      viewBox="0 0 180 200"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke="var(--sd-border-strong)"
        strokeWidth="1.5"
        strokeDasharray="3 5"
        fill="none"
      >
        {pairs.map(([a, b]) => (
          <line
            key={`${a}${b}`}
            x1={seats[a][0]}
            y1={seats[a][1]}
            x2={seats[b][0]}
            y2={seats[b][1]}
          />
        ))}
        <line x1="90" y1="90" x2="90" y2="178" strokeDasharray="1.5 4" />
      </g>
      <g stroke="var(--sd-accent)" strokeWidth="1.5" opacity="0.55">
        {seats.map(([x, y]) => (
          <line key={`c${x}${y}`} x1={x} y1={y} x2="90" y2="90" />
        ))}
      </g>
      <circle cx="90" cy="90" r="21" fill="var(--sd-pen)" />
      <path d="M94 74 L82 93 L90 93 L85 107 L99 86 L91 86 Z" fill="#fff" />
      {seats.map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r="15"
            fill="var(--sd-surface)"
            stroke="var(--sd-accent)"
            strokeWidth="2"
          />
          <text
            x={x}
            y={y + 4.5}
            textAnchor="middle"
            className="fill-[var(--sd-accent)] font-mono text-[13px] font-bold"
          >
            {i + 1}
          </text>
        </g>
      ))}
      <circle
        cx="90"
        cy="178"
        r="13"
        fill="var(--sd-surface)"
        stroke="var(--sd-text-secondary)"
        strokeWidth="1.5"
        strokeDasharray="2.5 3"
      />
      <text
        x="90"
        y="182.5"
        textAnchor="middle"
        className="fill-[var(--sd-text-secondary)] font-mono text-[12px] font-bold"
      >
        5
      </text>
    </svg>
  );
}

/**
 * How it works, beside the disclaimer.
 *
 * This was four bordered cards and a closing paragraph — a full screen of
 * method before the reader reached a single report, on a page whose job is to
 * get them into one. Every report page carries the method note in full, so the
 * index only has to say enough to make the four stakes legible: one line of
 * roles, one line of what happens to them. The roles are set as chips; the
 * sentence around them is unchanged.
 */
function HowItWorks() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
      <div className="sd-reveal">
        <div className="sd-sheet flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <StormCell className="w-[112px] shrink-0 sm:w-[150px]" />
          <div className="min-w-0">
            <p className="sd-kicker">Agents with opposing stakes, one catalyst</p>
            {/* Deliberately no fixed agent count and no "every claim" here. The
                earnings reads run four perspectives and refute-test the top
                load-bearing claims; the thesis pieces run five and test all of
                them. Stating one number in the section header made the other
                shape look like an error, which is the whole reason each report
                now publishes its own roster and depth. */}
            <p className="mt-4 text-[0.98rem] leading-[1.95] text-text-secondary">
              {/* Each chip carries the dot that follows it, so a wrapped line
                  ends on a separator instead of starting with one. */}
              {STAKES.map((stake, i) => (
                <Fragment key={stake}>
                  <span className="whitespace-nowrap">
                    <span className="ms-stake">{stake}</span>
                    {i < STAKES.length - 1 && <span className="ms-dot"> ·</span>}
                  </span>{' '}
                </Fragment>
              ))}
              — and a fifth on the thesis pieces. They interview each other
              grounded in live web search, then a separate pass tries to{' '}
              <strong className="text-text-primary">refute</strong> the
              load-bearing claims against primary sources. What survives is
              written up{' '}
              <strong className="text-text-primary">
                with the caveats it earned
              </strong>{' '}
              — and every report shows its own roster and how deep the
              refutation went.
            </p>
          </div>
        </div>
      </div>
      <div className="sd-reveal px-1 pt-3 lg:px-0 lg:pt-0">
        <Disclaimer />
      </div>
    </div>
  );
}

/* ── Figures ───────────────────────────────────────────────────────────── */

/**
 * The three headline figures for a report, on the index card.
 *
 * WHICH THREE
 * -----------
 * The first three of `kpis`. That list is authored most-important-first — the
 * report page's scorecard reads in the same order — so the card takes the top
 * of it rather than carrying a second, hand-curated selection that could drift
 * out of agreement with the page.
 *
 * WHY NO DELTA
 * ------------
 * A cell is about 100px wide here. `delta` runs from "+37% YoY" to "3rd
 * straight accel", and the long ones either wrap to three lines or truncate
 * mid-word. The value is the headline and the ink already carries the
 * direction; the delta is detail, and detail belongs on the page the card
 * opens. Same reasoning that took the hero images from 27 words to 17.
 */
function CardFigures({
  kpis,
  className = '',
}: {
  kpis: Kpi[];
  className?: string;
}) {
  const shown = kpis.slice(0, 3);
  if (!shown.length) return null;
  return (
    <div
      className={`ms-figs ${className}`.trim()}
      style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}
    >
      {/* Grid cells in a row already stretch to the tallest, so each one is a
          column with the label at the top and the figure pushed to the
          bottom. That keeps the numbers on one baseline for any label length.
          A fixed two-line label box was the first attempt and it clipped:
          "US commercial revenue" and "GAAP operating margin" both need three
          lines at this width, and both lost their last word to an ellipsis. */}
      {shown.map((kpi, i) => {
        const tone = kpi.tone ?? 'neutral';
        return (
          <div
            key={i}
            className="flex flex-col justify-between gap-2 px-2.5 pb-2.5 pt-2 sm:px-3"
          >
            {/* The verdict's shape rides on the label line, so the figure
                keeps the cell's full width: "$(175.9)M" is nine characters
                in a cell about seventy pixels wide on a small phone. */}
            <div className="hyphens-auto text-[0.6rem] font-semibold uppercase leading-[1rem] tracking-[0.05em] text-text-secondary [overflow-wrap:anywhere]">
              {toneGlyph[tone] && (
                <span
                  className={`ms-tone-glyph mr-1 ${toneText[tone]}`}
                  aria-hidden="true"
                >
                  {toneGlyph[tone]}
                </span>
              )}
              {kpi.label}
            </div>
            <div
              className={`font-mono text-[0.8rem] font-bold leading-none tracking-[-0.02em] [font-variant-numeric:tabular-nums] min-[380px]:text-[0.9rem] ${toneText[tone]}`}
            >
              {kpi.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── The reports ───────────────────────────────────────────────────────── */

/**
 * One report, as a card in the three-up grid.
 *
 * It used to be a full-bleed row roughly 900px tall — one whole screen per
 * report, so two could never be on screen at once, which is the one thing an
 * index has to do. Three things carried that weight and each is handled here:
 *
 * - The excerpt ran past 600 characters. That is an abstract, and the report
 *   page already has it; on an index the reader is choosing, not reading. It
 *   clamps to three lines.
 * - The verification chips were replaced by the report's own headline figures.
 *   "6 confirmed / 4 partly-true / 3 corrected" carried the same three labels on
 *   every card, so it read as chrome and said nothing about the company.
 * - The card art is the company mark, not the generated report card, because
 *   at 368px the report card's own text is below its legibility floor.
 *
 * The scroll reveal sits on a wrapper, not on the card: an animation that
 * fills `translate` would pin the card and swallow its hover lift.
 */
function ReportCard({ report }: { report: MarketStormEntry }) {
  return (
    <div className="sd-reveal h-full">
      <Link
        href={`/market-storm/${report.slug}`}
        className="sd-card sd-tilt group block h-full"
      >
        <article className="flex h-full flex-col">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-5 py-3">
            <span className="font-display text-[1.1rem] tracking-[0.04em] text-accent">
              {report.ticker ?? 'Market Storm'}
            </span>
            <span className="ml-auto font-mono text-xs text-text-secondary">
              {formatDate(report.publishDate)}
            </span>
          </div>
          {/* The report's own card image. HeroImage takes whatever it is
              handed: a day/night pair, or one image for both. */}
          {report.cardImage && (
            <div className="aspect-[2.5/1] w-full overflow-hidden border-b border-border sm:aspect-[1200/630]">
              <HeroImage
                post={{
                  heroImage: report.cardImage,
                  heroImageLight: report.cardImageLight,
                  heroImageAlt: report.cardImageAlt,
                  title: report.title,
                }}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            {/* One line. It wrapped to two in small mono, next to a date that
                already says half of it. */}
            {report.catalyst && (
              <p className="truncate font-mono text-[0.7rem] uppercase tracking-wide text-text-secondary">
                {report.catalyst}
              </p>
            )}
            <h2 className="font-display mt-2.5 text-[1.05rem] leading-[1.26] text-text-primary transition-colors group-hover:text-accent">
              {report.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">
              {report.excerpt}
            </p>
            {/* The figures, not the verification counts.
                Three chips reading "6 confirmed / 4 partly-true / 3 corrected"
                described the method and said nothing about the company — the
                same three labels on every card, so they scanned as chrome. What
                a reader wants off an index is what the quarter did.

                Deliberately the PriceStrip pattern from the report page rather
                than a new stat treatment: same 1px-gap-over-border-ground, same
                small label over tabular-nums figure, same semantic inks. The
                card is a promise about the page it opens, so it should be
                built out of that page's parts. */}
            <div className="mt-auto pt-5">
              <CardFigures kpis={cardKpis(report)} />
              {/* How this one was researched, in one line. Agent count plus
                  refutation depth — deliberately not the four role names, which
                  are identical on every card and would read as chrome, the same
                  failure as the verification chips this card already dropped. */}
              <div className="mt-3.5 flex items-center justify-between gap-3">
                <MethodBadge method={methodOf(report)} />
                <span className="shrink-0 text-sm font-semibold text-accent">
                  Read <span className="ms-cta-arrow inline-block">&rarr;</span>
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}

/**
 * The pinned thesis piece.
 *
 * WHY IT LOOKS DIFFERENT FROM THE CARDS
 * -------------------------------------
 * Because it IS different. The ones below are earnings reads on one company;
 * this is a read on the whole cycle, produced by a different run shape — more
 * perspectives, and every load-bearing claim sent to a refutation pass rather
 * than the top handful. Rendering it as a bigger card would say "same thing,
 * more important", which is the wrong claim. It gets its own frame — ink
 * lacquer in both lights, like the footer — its verdict in full, its headline
 * figures, and its roster named on the index, because the roster is precisely
 * what distinguishes it.
 */
function FeaturedReport({ report }: { report: MarketStormEntry }) {
  const m = methodOf(report);
  return (
    <section
      className="mx-auto mt-16 max-w-6xl sm:mt-20"
      aria-labelledby="ms-thesis-title"
    >
      <div className="flex items-baseline gap-3">
        <p className="sd-kicker">The standing thesis</p>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <p className="font-mono text-xs text-text-secondary">
          {formatDate(report.publishDate)}
        </p>
      </div>

      <div className="sd-reveal mt-5">
        <Link
          href={`/market-storm/${report.slug}`}
          className="ms-feature ms-night sd-card group block"
        >
          <div className="ms-feature-art" aria-hidden="true">
            <Kanji
              char="雷"
              className="absolute -bottom-24 -right-20 hidden h-[400px] w-[400px] text-[var(--sd-pen)] opacity-[0.06] lg:block"
            />
            <svg
              viewBox="0 0 120 300"
              className="ms-feature-bolt"
              focusable="false"
            >
              <g
                fill="none"
                stroke="var(--sd-pen)"
                strokeLinejoin="miter"
                strokeLinecap="round"
              >
                <path
                  d="M84 -4 L56 96 L76 100 L44 192 L66 196 L30 304"
                  strokeWidth="12"
                  opacity="0.14"
                />
                <path
                  d="M84 -4 L56 96 L76 100 L44 192 L66 196 L30 304"
                  strokeWidth="3.2"
                />
                <path
                  d="M56 96 L36 128 L42 131 L22 168"
                  strokeWidth="1.8"
                  opacity="0.8"
                />
                <path
                  d="M44 192 L70 226 L64 230 L84 262"
                  strokeWidth="1.4"
                  opacity="0.6"
                />
              </g>
            </svg>
          </div>

          <div className="relative z-[1] grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
            <div className="min-w-0">
              {report.catalyst && (
                <p className="font-mono text-[0.7rem] uppercase leading-relaxed tracking-wide text-text-secondary">
                  {report.catalyst}
                </p>
              )}
              <h2
                id="ms-thesis-title"
                className="font-display mt-3 text-[1.8rem] leading-[1.1] text-text-primary transition-colors group-hover:text-accent-hover sm:text-[2.45rem] lg:text-[2.75rem]"
              >
                {report.title}
              </h2>
              <p className="font-read mt-5 max-w-[60ch] text-[1.03rem] leading-[1.75] text-text-secondary">
                {report.excerpt}
              </p>
              <CardFigures kpis={cardKpis(report)} className="mt-7" />
              <span className="ms-cta mt-7">
                Read the thesis{' '}
                <span className="ms-cta-arrow">
                  &rarr;
                </span>
              </span>
            </div>

            {/* The roster, on the index. This is the answer to "which agents
                worked on this one" without needing to open the report. */}
            {m && (
              <div className="self-start border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-1">
                <p className="font-mono-accent text-text-secondary">
                  {m.perspectives.length} agents, {m.turnsEach} grounded turns
                  each
                </p>
                <ul className="relative mt-4 space-y-2.5" role="list">
                  {m.perspectives.map((persp, i) => (
                    <li
                      key={persp.role}
                      className="flex items-center gap-3 text-[0.95rem] text-text-primary"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface font-mono text-[0.68rem] font-bold text-accent [font-variant-numeric:tabular-nums]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {persp.role}
                    </li>
                  ))}
                </ul>
                <p className="mt-5 border-t border-border pt-4 font-mono text-xs leading-relaxed text-text-secondary">
                  Then{' '}
                  <strong className="text-text-primary">
                    {verificationLine(m)}
                  </strong>
                  {m.primaryDocsOpened !== undefined && (
                    <>
                      {' '}
                      against{' '}
                      <strong className="text-text-primary [font-variant-numeric:tabular-nums]">
                        {m.primaryDocsOpened}
                      </strong>{' '}
                      primary documents
                    </>
                  )}
                  .
                </p>
              </div>
            )}
          </div>
        </Link>
      </div>
    </section>
  );
}

/**
 * The end of the archive, on the last page only, filling whatever the last
 * row of the three-up grid leaves empty — so the oldest report never sits
 * beside two blank columns. Its facts come from the data: which report is
 * the first one, and when it was published.
 */
function EndOfArchive({ span }: { span: 1 | 2 }) {
  const all = gridReports();
  const first = all[all.length - 1];
  if (!first) return null;
  return (
    <div
      className={`sd-reveal sm:col-span-2 ${span === 2 ? 'lg:col-span-2' : 'lg:col-span-1'}`}
    >
      <div className="flex h-full flex-col items-center justify-center gap-5 rounded-2xl border border-dashed border-[var(--sd-border-strong)] px-6 py-10 text-center sm:flex-row sm:text-left">
        <Kiru pose="bow" className="w-[104px] shrink-0" />
        <div className="max-w-sm">
          <p className="sd-kicker">The end of the archive</p>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-text-secondary">
            Market Storm starts here, with{' '}
            <strong className="text-text-primary">{first.ticker}</strong> on{' '}
            {formatDate(first.publishDate)}. Every report since is on the
            pages before this one.
          </p>
          <div className="mt-5">
            <Button variant="secondary" size="sm" href={pageHref(1)}>
              &larr; Back to the newest
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Pagination ────────────────────────────────────────────────────────── */

/**
 * Which page numbers to render.
 *
 * Up to seven pages every number fits on a phone, so show them all. Past that
 * it collapses to first / current±1 / last with ellipses, which keeps the
 * control one line wide however long the section runs. A report lands here
 * most weeks, so "however long" is the operative word — this section is at 2
 * pages now and will be at 6 inside a year.
 */
function pageWindow(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const out: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push('gap');
  for (let n = start; n <= end; n++) out.push(n);
  if (end < total - 1) out.push('gap');
  out.push(total);
  return out;
}

/**
 * A prev/next arrow.
 *
 * With no `href` it renders a `<span>`, not a disabled `<a>`. A link to
 * nowhere is still in the tab order and still announces as a link, so a
 * keyboard or screen-reader user lands on "Newer, link" at the top of page 1
 * and it does nothing. `aria-hidden` on the dead end takes it out of both.
 *
 * The dead end keeps its slot so the numbers do not slide sideways between
 * page 1 and the last page, but it drops the border with the link: faded text
 * inside a button outline reads as a button that is broken, whereas faded text
 * on its own reads as a label. That also settles a contrast problem — the
 * light theme's `--sd-text-secondary` sits at 5.0:1 on its ground, so any
 * alpha at all pushes a *button* under AA, while an inactive, `aria-hidden`
 * label is exempt under WCAG 1.4.3 and is supposed to recede.
 */
function PageArrow({
  href,
  rel,
  children,
}: {
  href?: string;
  rel?: 'prev' | 'next';
  children: React.ReactNode;
}) {
  const base =
    'inline-flex h-11 items-center rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color,scale] duration-200';

  if (!href) {
    return (
      <span
        aria-hidden="true"
        className={`${base} border-transparent text-text-secondary/55`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      rel={rel}
      className={`${base} border-accent/40 bg-surface text-accent hover:border-accent hover:bg-accent/8 active:scale-[0.97]`}
    >
      {children}
    </Link>
  );
}

/**
 * Newer / numbered / older.
 *
 * "Newer" and "Older" rather than "Previous" and "Next": the list is
 * reverse-chronological, and on a reverse-chronological list "next" points
 * backwards in time, which is exactly the wrong intuition. The `rel="prev"`
 * and `rel="next"` attributes still carry the document order for anything
 * reading the markup.
 *
 * The current page is stamped like a hanko — the primary button's vermilion
 * with white type (4.7:1), the same object in both lights.
 */
function Pagination({ page, total }: { page: number; total: number }) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Market Storm reports, by page"
      className="mx-auto mt-16 flex max-w-6xl flex-col items-center gap-4"
    >
      <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-border bg-surface/70 p-1.5 shadow-[0_18px_40px_-30px_var(--sd-card-shadow)]">
        <PageArrow href={page > 1 ? pageHref(page - 1) : undefined} rel="prev">
          &larr; Newer
        </PageArrow>

        <ol className="flex items-center gap-1">
          {pageWindow(page, total).map((item, i) =>
            item === 'gap' ? (
              <li
                key={`gap-${i}`}
                aria-hidden="true"
                className="px-1 font-mono text-sm text-text-secondary"
              >
                &hellip;
              </li>
            ) : (
              <li key={item}>
                {item === page ? (
                  <span
                    aria-current="page"
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-[#d63a22] px-3 font-mono text-sm font-bold text-white shadow-[0_8px_18px_-8px_rgba(214,58,34,0.7)] [font-variant-numeric:tabular-nums]"
                  >
                    {item}
                  </span>
                ) : (
                  <Link
                    href={pageHref(item)}
                    aria-label={`Page ${item} of ${total}`}
                    className="inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 font-mono text-sm text-text-secondary transition-colors [font-variant-numeric:tabular-nums] hover:bg-fill hover:text-text-primary active:scale-[0.96]"
                  >
                    {item}
                  </Link>
                )}
              </li>
            )
          )}
        </ol>

        <PageArrow
          href={page < total ? pageHref(page + 1) : undefined}
          rel="next"
        >
          Older &rarr;
        </PageArrow>
      </div>

      {/* Counts the paginated set, not every report — the pinned thesis has its
          own slot above and is not in this grid, so including it here would
          promise a card the reader can never find by paging. */}
      <p className="font-mono text-xs text-text-secondary [font-variant-numeric:tabular-nums]">
        Page {page} of {total} &middot; {gridReports().length} company
        reports
      </p>
    </nav>
  );
}

/**
 * The Market Storm index, one page of it.
 *
 * Both routes render this: `/market-storm` passes 1, `/market-storm/page/[page]`
 * passes the rest. The hero and the method blurb repeat on every page
 * deliberately — a reader arriving on page 3 from a search result needs to be
 * told what this section is just as much as one arriving on page 1.
 */
export default function MarketStormIndexView({ page }: { page: number }) {
  const featured = leadReport();
  return (
    <>
      <StormHero page={page} />

      <SectionContainer className="pt-6 sm:pt-8">
        <HowItWorks />

        {/* The pinned thesis, page 1 only. On page 2 it would read as a header
            rather than a pin, and the reader arriving there is looking for the
            older reports, not the standing view. */}
        {page === 1 && featured && <FeaturedReport report={featured} />}

        {page === 1 && featured && (
          <div className="mx-auto mt-16 max-w-6xl sm:mt-20">
            <div className="flex items-baseline gap-3">
              <p className="sd-kicker">The companies, one quarter at a time</p>
              <span className="h-px flex-1 bg-border" aria-hidden="true" />
            </div>
            <p className="mt-3 max-w-[70ch] text-[0.95rem] leading-relaxed text-text-secondary">
              Each of these reads a single company&rsquo;s filing.{' '}
              <strong className="text-text-primary">
                Four agents rather than five
              </strong>
              , and the top load-bearing claims go to the refutation pass rather
              than all of them — every card says which, and every report names
              its own roster.
            </p>
          </div>
        )}

        {/* Reports — three up, which needs the wider container to work. At
            max-w-5xl a third column puts each card at 325px, under the 341px
            they are drawn to survive at; at max-w-6xl it is 368px and they
            hold. The container is what decides this, not the column count. */}
        <div
          id="reports"
          className="mx-auto mt-10 grid max-w-6xl scroll-mt-24 grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {reportsOnPage(page).map((report) => (
            <ReportCard key={report.slug} report={report} />
          ))}
          {page === totalReportPages &&
            totalReportPages > 1 &&
            reportsOnPage(page).length % 3 !== 0 && (
              <EndOfArchive
                span={reportsOnPage(page).length % 3 === 1 ? 2 : 1}
              />
            )}
        </div>

        <Pagination page={page} total={totalReportPages} />
      </SectionContainer>
    </>
  );
}
