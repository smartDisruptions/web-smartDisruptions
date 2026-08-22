import Link from 'next/link';
import {
  featuredReport,
  unfeaturedReports,
  type MarketStormReport,
  type Kpi,
} from '@/data/marketStorm';
import { SectionContainer } from '@/components/ui';
import { Disclaimer } from '@/components/market-storm/ReportView';
import { toneText } from '@/components/market-storm/tone';
import HeroImage from '@/components/HeroImage';
import { formatDate } from '@/lib/format';
import {
  MethodBadge,
  verificationLine,
} from '@/components/market-storm/Method';

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
  Math.ceil(unfeaturedReports().length / REPORTS_PER_PAGE)
);

/** Authored newest-first, so page 1 is the newest. */
export function reportsOnPage(page: number): MarketStormReport[] {
  const start = (page - 1) * REPORTS_PER_PAGE;
  return unfeaturedReports().slice(start, start + REPORTS_PER_PAGE);
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
function CardFigures({ kpis }: { kpis: Kpi[] }) {
  const shown = kpis.slice(0, 3);
  if (!shown.length) return null;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-border">
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))`,
        }}
      >
        {/* Grid cells in a row already stretch to the tallest, so each one is a
            column with the label at the top and the figure pushed to the
            bottom. That keeps the numbers on one baseline for any label length.
            A fixed two-line label box was the first attempt and it clipped:
            "US commercial revenue" and "GAAP operating margin" both need three
            lines at this width, and both lost their last word to an ellipsis. */}
        {shown.map((kpi, i) => (
          <div
            key={i}
            className="flex flex-col justify-between gap-2 bg-surface px-3 pb-2.5 pt-2"
          >
            <div className="font-mono text-[0.62rem] uppercase leading-[1.05rem] tracking-[0.07em] text-text-secondary">
              {kpi.label}
            </div>
            <div
              className={`font-mono text-[0.95rem] font-semibold leading-none [font-variant-numeric:tabular-nums] ${
                toneText[kpi.tone ?? 'neutral']
              }`}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
 */
function ReportCard({ report }: { report: MarketStormReport }) {
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
        {/* The mark, not the hero. HeroImage takes whatever pair it is handed,
            so the card feeds it the logo and the report page feeds it the
            generated card. */}
        {report.cardImage && (
          <div className="aspect-[1200/630] w-full overflow-hidden border-b border-border">
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
          <p className="truncate font-mono text-[0.7rem] uppercase tracking-wide text-text-secondary">
            {report.catalyst}
          </p>
          <h2 className="font-display mt-2 text-xl font-semibold leading-snug tracking-tight text-text-primary transition-colors group-hover:text-accent">
            {report.title}
          </h2>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-text-secondary">
            {report.excerpt}
          </p>
          {/* The figures, not the verification counts.
              Three chips reading "6 confirmed / 4 partly-true / 3 corrected"
              described the method and said nothing about the company — the
              same three labels on every card, so they scanned as chrome. What
              a reader wants off an index is what the quarter did.

              Deliberately the PriceStrip pattern from the report page rather
              than a new stat treatment: same 1px-gap-over-border-ground, same
              mono-accent label over tabular-nums figure, same semantic inks.
              The card is a promise about the page it opens, so it should be
              built out of that page's parts. */}
          <div className="mt-auto pt-4">
            <CardFigures kpis={report.kpis} />
            {/* How this one was researched, in one line. Agent count plus
                refutation depth — deliberately not the four role names, which
                are identical on every card and would read as chrome, the same
                failure as the verification chips this card already dropped. */}
            <div className="mt-3 flex items-center justify-between gap-3">
              <MethodBadge method={report.method} />
              <span className="shrink-0 text-sm font-medium text-accent">
                Read &rarr;
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

/**
 * The pinned thesis piece.
 *
 * WHY IT LOOKS DIFFERENT FROM THE CARDS
 * -------------------------------------
 * Because it IS different. The eight below are earnings reads on one company;
 * this is a read on the whole cycle, produced by a different run shape — more
 * perspectives, and every load-bearing claim sent to a refutation pass rather
 * than the top handful. Rendering it as a bigger card would say "same thing,
 * more important", which is the wrong claim. It gets its own frame, its verdict
 * in full, and its roster named on the index, because the roster is precisely
 * what distinguishes it.
 */
function FeaturedReport({ report }: { report: MarketStormReport }) {
  const m = report.method;
  return (
    <section className="mx-auto mt-12 max-w-6xl">
      <div className="flex items-baseline gap-3">
        <p className="font-mono-accent text-accent">The standing thesis</p>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <p className="font-mono text-xs text-text-secondary">
          {formatDate(report.publishDate)}
        </p>
      </div>

      <Link
        href={`/market-storm/${report.slug}`}
        className="group mt-4 block rounded-2xl border border-accent/25 bg-surface transition-all hover:border-accent/50 hover:shadow-[0_18px_50px_-20px_var(--sd-card-shadow)]"
      >
        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="truncate font-mono text-[0.7rem] uppercase tracking-wide text-text-secondary">
              {report.catalyst}
            </p>
            <h2 className="font-display mt-3 text-2xl font-semibold leading-tight tracking-tight text-text-primary transition-colors group-hover:text-accent sm:text-[2rem]">
              {report.title}
            </h2>
            <p className="mt-4 max-w-[62ch] leading-relaxed text-text-secondary">
              {report.excerpt}
            </p>
            <div className="mt-5 text-sm font-medium text-accent">
              Read the thesis &rarr;
            </div>
          </div>

          {/* The roster, on the index. This is the answer to "which agents
              worked on this one" without needing to open the report. */}
          {m && (
            <div className="self-start rounded-xl border border-border bg-surface-elevated p-5">
              <p className="font-mono-accent text-text-secondary">
                {m.perspectives.length} agents, {m.turnsEach} grounded turns
                each
              </p>
              <ul className="mt-3 space-y-1.5" role="list">
                {m.perspectives.map((persp, i) => (
                  <li
                    key={persp.role}
                    className="flex items-baseline gap-2 text-sm text-text-primary"
                  >
                    <span className="font-mono text-[0.7rem] font-bold text-accent [font-variant-numeric:tabular-nums]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {persp.role}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-border pt-3 font-mono text-xs leading-relaxed text-text-secondary">
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
    </section>
  );
}

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
    'inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors';

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
      className={`${base} border-accent/40 text-accent hover:bg-accent/8`}
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
 */
function Pagination({ page, total }: { page: number; total: number }) {
  if (total <= 1) return null;

  return (
    <nav
      aria-label="Market Storm reports, by page"
      className="mx-auto mt-14 flex max-w-6xl flex-col items-center gap-4"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
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
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-accent px-3 font-mono text-sm font-semibold text-background [font-variant-numeric:tabular-nums]"
                  >
                    {item}
                  </span>
                ) : (
                  <Link
                    href={pageHref(item)}
                    aria-label={`Page ${item} of ${total}`}
                    className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 font-mono text-sm text-text-secondary transition-colors [font-variant-numeric:tabular-nums] hover:bg-fill hover:text-text-primary"
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
        Page {page} of {total} &middot; {unfeaturedReports().length} company
        reports
      </p>
    </nav>
  );
}

/**
 * The Market Storm index, one page of it.
 *
 * Both routes render this: `/market-storm` passes 1, `/market-storm/page/[page]`
 * passes the rest. The header and the method blurb repeat on every page
 * deliberately — a reader arriving on page 3 from a search result needs to be
 * told what this section is just as much as one arriving on page 1.
 */
export default function MarketStormIndexView({ page }: { page: number }) {
  const featured = featuredReport();
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
          Agents with opposing stakes, one catalyst
        </p>
        {/* Deliberately no fixed agent count and no "every claim" here. The
            earnings reads run four perspectives and refute-test the top
            load-bearing claims; the thesis pieces run five and test all of
            them. Stating one number in the section header made the other shape
            look like an error, which is the whole reason each report now
            publishes its own roster and depth. */}
        <p className="mt-3 text-[0.95rem] leading-relaxed text-text-secondary">
          {STAKES.join(' · ')} — and a fifth on the thesis pieces. They
          interview each other grounded in live web search, then a separate pass
          tries to <strong className="text-text-primary">refute</strong> the
          load-bearing claims against primary sources. What survives is written
          up{' '}
          <strong className="text-text-primary">
            with the caveats it earned
          </strong>{' '}
          — and every report shows its own roster and how deep the refutation
          went.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto mt-10 max-w-3xl">
        <Disclaimer />
      </div>

      {/* The pinned thesis, page 1 only. On page 2 it would read as a header
          rather than a pin, and the reader arriving there is looking for the
          older reports, not the standing view. */}
      {page === 1 && featured && <FeaturedReport report={featured} />}

      {page === 1 && featured && (
        <div className="mx-auto mt-14 max-w-6xl">
          <div className="flex items-baseline gap-3">
            <p className="font-mono-accent text-accent">
              The companies, one quarter at a time
            </p>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <p className="mt-3 max-w-[70ch] text-[0.95rem] leading-relaxed text-text-secondary">
            Each of these reads a single company&rsquo;s filing.{' '}
            <strong className="text-text-primary">
              Four agents rather than five
            </strong>
            , and the top load-bearing claims go to the refutation pass rather
            than all of them — every card says which, and every report names its
            own roster.
          </p>
        </div>
      )}

      {/* Reports — three up, which needs the wider container to work. At
          max-w-5xl a third column puts each card at 325px, under the 341px they
          are drawn to survive at; at max-w-6xl it is 368px and they hold. The
          container is what decides this, not the column count. */}
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportsOnPage(page).map((report) => (
          <ReportCard key={report.slug} report={report} />
        ))}
      </div>

      <Pagination page={page} total={totalReportPages} />
    </SectionContainer>
  );
}
