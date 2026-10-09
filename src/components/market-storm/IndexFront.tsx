import Link from 'next/link';
import {
  cardKpis,
  frontReports,
  methodOf,
  type Kpi,
  type MarketStormEntry,
} from '@/data/marketStorm';
import HeroImage from '@/components/HeroImage';
import { MethodBadge } from '@/components/market-storm/Method';
import { toneGlyph, toneText } from '@/components/market-storm/tone';
import { watchDate } from '@/components/writing/storm/art';
import { formatDate } from '@/lib/format';

/**
 * THE FRONT — the reports Josh has put first, in his order.
 *
 * `frontReports()` decides who is here and in what order (`pin`, 1 leads);
 * this only draws it. The lead gets the section's biggest moment, a night
 * slab with its card art set into it; the rest follow as a pair of cards.
 * Every piece carries its place as a hanko stamp, and the list is an <ol>,
 * so the order is the same thing to a screen reader as it is to the eye.
 *
 * WHAT IT COSTS
 * -------------
 * Nothing at runtime: server-rendered, no client JavaScript. The slab's rain
 * is a static SVG tile and its art one lazy image. The only motion is the
 * site's scroll reveal (`sd-reveal`, compositor-only, off under reduced
 * motion) and, on a fine pointer, a hover lift and one flash of lightning
 * over the lead — opacity on one layer, run once per hover, never while
 * the page is only scrolling.
 */
export default function IndexFront() {
  const front = frontReports();
  const [lead, ...rest] = front;
  if (!lead) return null;

  return (
    <section
      id="reports"
      aria-labelledby="ms-front-title"
      className="ms-front scroll-mt-24"
    >
      <div className="flex items-baseline gap-3">
        <h2 id="ms-front-title" className="sd-kicker">
          Start here
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        {/* shrink-0 keeps the count on one line: on a <p>, the nowrap
            utility loses to globals.css's unlayered p { text-wrap }. */}
        <p className="shrink-0 whitespace-nowrap font-mono text-xs text-text-secondary [font-variant-numeric:tabular-nums]">
          {front.length === 1 ? '1 report' : `${front.length} reports`}
        </p>
      </div>

      <ol className="ms-front-list mt-5" role="list">
        <li className="ms-front-lead sd-reveal">
          <LeadReport entry={lead} />
        </li>
        {rest.map((entry, i) => (
          <li key={entry.slug} className="sd-reveal">
            <FrontCard entry={entry} place={i + 2} />
          </li>
        ))}
      </ol>
    </section>
  );
}

/** A report's place on the front, stamped like a hanko. The <ol> says it aloud. */
function Place({ n, size = 'sm' }: { n: number; size?: 'sm' | 'lg' }) {
  return (
    <span className={`ms-num ms-num-${size}`} aria-hidden="true">
      {n}
    </span>
  );
}

/**
 * A storm-warning flag: a red square with a black centre, the signal flown
 * ashore when a storm is coming. It marks the lead's catalyst — the thing
 * that could move it. Decorative; the words beside it are the content.
 */
function StormFlag() {
  return (
    <svg
      viewBox="0 0 16 18"
      className="ms-flag"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2.5 1v16.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="3.5" y="1.5" width="11.5" height="9" rx="1" fill="#e2412a" />
      <rect x="7.1" y="4.2" width="4.3" height="3.6" fill="#15172b" />
    </svg>
  );
}

/**
 * The lead.
 *
 * WHY A SLAB, AND WHY THE ART IS CROPPED
 * --------------------------------------
 * The lead used to be the NVIDIA thesis in the old feature frame, which was
 * built around a template report's figures and roster. The lead now is an
 * article: it has a card image instead of figures, so the image carries the
 * slab. The card images are drawn on the house share-card plan, words on the
 * left and the picture on the right, so the slab shows the right-hand square
 * of it (the magnet and its field, for rare earths) and sets its own title
 * beside it: the card's title is the slab's title, and it reads once.
 *
 * The slab is night in both lights, like the footer and the storm room, so
 * the card's night ground and the slab's are one surface and the square's
 * edges feather into it rather than sitting in a frame.
 *
 * A template report could lead too, so its figures and method still render
 * when it has them; an article simply has none.
 */
function LeadReport({ entry }: { entry: MarketStormEntry }) {
  const href = `/market-storm/${entry.slug}`;
  const kpis = cardKpis(entry);
  const method = methodOf(entry);
  // The date the catalyst names, kept whole: at a tablet's width the line
  // broke as "ends 10 / Nov 2026". The room reads it the same way (art.ts).
  const when = watchDate(entry);

  return (
    <article
      className={`ms-lead ms-night group ${entry.cardImage ? '' : 'ms-lead-solo'}`.trim()}
      aria-labelledby="ms-lead-title"
    >
      {entry.cardImage && (
        <div className="ms-lead-art">
          {/* Always the night card: the slab is night in both lights. */}
          <HeroImage
            post={{
              heroImage: entry.cardImage,
              heroImageAlt: entry.cardImageAlt,
              title: entry.title,
            }}
            className="ms-lead-img"
          />
        </div>
      )}

      <div className="ms-lead-body">
        <p className="ms-meta">
          <Place n={1} size="lg" />
          <span>
            Lead report &middot;{' '}
            <time dateTime={entry.publishDate} className="whitespace-nowrap">
              {formatDate(entry.publishDate)}
            </time>
          </span>
        </p>

        <h3 id="ms-lead-title" className="font-display ms-lead-title">
          <Link href={href} className="ms-stretch">
            {entry.title}
          </Link>
        </h3>

        <p className="font-read ms-lead-excerpt">{entry.excerpt}</p>

        {entry.catalyst && (
          <p className="ms-lead-catalyst">
            <StormFlag />
            <span>
              {when ? (
                <>
                  {entry.catalyst.slice(0, when.at)}
                  <time dateTime={when.iso} className="whitespace-nowrap">
                    {when.text}
                  </time>
                  {entry.catalyst.slice(when.at + when.text.length)}
                </>
              ) : (
                entry.catalyst
              )}
            </span>
          </p>
        )}

        {kpis.length > 0 && <CardFigures kpis={kpis} className="mt-6" />}
        {method && (
          <div className="mt-3">
            <MethodBadge method={method} />
          </div>
        )}

        <span className="ms-cta ms-lead-cta" aria-hidden="true">
          Read the report <span className="ms-cta-arrow">&rarr;</span>
        </span>
      </div>
    </article>
  );
}

/**
 * Second and third (and any report pinned after them): a card each, side by
 * side from a tablet up.
 *
 * Built from the old index card's parts, because a card is a promise about
 * the page it opens — but with the card art whole, the place stamped on it,
 * and the excerpt allowed four lines instead of three, since there are two of
 * these, not six. A template report keeps its headline figures and its
 * method line; an article has neither, so its excerpt is set in the reading
 * face and it closes on what it covers.
 */
function FrontCard({
  entry,
  place,
}: {
  entry: MarketStormEntry;
  place: number;
}) {
  const href = `/market-storm/${entry.slug}`;
  const kpis = cardKpis(entry);
  const method = methodOf(entry);
  const titleId = `ms-front-${entry.slug}`;

  return (
    <article className="ms-pick sd-card group" aria-labelledby={titleId}>
      {entry.cardImage && (
        <div className="ms-pick-art">
          <HeroImage
            post={{
              heroImage: entry.cardImage,
              heroImageLight: entry.cardImageLight,
              heroImageAlt: entry.cardImageAlt,
              title: entry.title,
            }}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="ms-pick-body">
        <p className="ms-meta">
          <Place n={place} />
          {entry.ticker && (
            <span className="font-display ms-pick-ticker">{entry.ticker}</span>
          )}
          <time dateTime={entry.publishDate} className="ms-pick-date">
            {formatDate(entry.publishDate)}
          </time>
        </p>

        {entry.catalyst && <p className="ms-pick-catalyst">{entry.catalyst}</p>}

        <h3 id={titleId} className="font-display ms-pick-title">
          <Link href={href} className="ms-stretch">
            {entry.title}
          </Link>
        </h3>

        {/* An article has no figures to end on, so its excerpt is set to be
            read — the reading face, two more lines — where a template
            report's is a lead-in to the numbers under it. */}
        <p
          className={`ms-pick-excerpt ${kpis.length ? '' : 'font-read ms-pick-excerpt-read'}`.trim()}
        >
          {entry.excerpt}
        </p>

        <div className="mt-auto pt-5">
          {kpis.length > 0 && <CardFigures kpis={kpis} />}
          {/* Both kinds end on one mono line and the way in: how a report
              was researched, or what an article covers — so a pair of
              different kinds still closes on the same baseline. */}
          <div
            className={`flex items-center justify-between gap-3 ${kpis.length > 0 ? 'mt-3.5' : 'ms-pick-foot'}`}
          >
            {method ? (
              <MethodBadge method={method} />
            ) : (
              <p className="font-mono text-[0.62rem] uppercase leading-[1.05rem] tracking-[0.07em] text-text-secondary">
                {entry.company ?? ''}
              </p>
            )}
            <span
              className="shrink-0 text-sm font-semibold text-accent"
              aria-hidden="true"
            >
              Read <span className="ms-cta-arrow inline-block">&rarr;</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Figures ───────────────────────────────────────────────────────────── */

/**
 * The three headline figures for a template report.
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
 * A cell is about 100px wide on a phone. `delta` runs from "+37% YoY" to "3rd
 * straight accel", and the long ones either wrap to three lines or truncate
 * mid-word. The value is the headline and the ink already carries the
 * direction; the delta is detail, and detail belongs on the page the card
 * opens.
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
      {/* Each cell is a column with the label at the top and the figure
          pushed to the bottom, so the numbers share one baseline for any
          label length. A fixed two-line label box clipped: "US commercial
          revenue" needs three lines at this width. */}
      {shown.map((kpi, i) => {
        const tone = kpi.tone ?? 'neutral';
        return (
          <div
            key={i}
            className="flex flex-col justify-between gap-2 px-2.5 pb-2.5 pt-2 sm:px-3"
          >
            {/* The verdict's shape rides on the label line, so the figure
                keeps the cell's full width. */}
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
