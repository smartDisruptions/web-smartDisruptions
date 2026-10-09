import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  archivedReports,
  cardKpis,
  frontReports,
  type Kpi,
  type MarketStormEntry,
} from '@/data/marketStorm';
import StormSky from '@/components/market-storm/StormSky';
import Kanji, { Seal } from '@/components/brand/Kanji';
import Kiru from '@/components/kiru/Kiru';
import { toneGlyph, toneText } from '@/components/market-storm/tone';
import { formatDate } from '@/lib/format';
import { leadArt, watchDate, type LeadArt } from './art';
import { cents, findingFor, type Finding } from './finding';
import RoomKeeper from './RoomKeeper';
import './storm.css';

/**
 * THE STORM ROOM — Market Storm, as the second section of the Writing page.
 *
 * The page above is paper. Here it tears open, and behind the tear is the
 * storm: the live WebGL sky (StormSky, always night here), 嵐 brushing itself
 * in and flaring with each strike, Kiru under his wagasa with rain rings at
 * his feet. In the room: the front of Market Storm, in the order Josh pinned
 * it — the lead as the headline act, the next two as a pair beneath it —
 * and one quiet way into the archive, which lives on /market-storm.
 *
 * WHY ALWAYS NIGHT
 * ----------------
 * It is an object region, like the footer and the home page's storm teaser:
 * the same room in both lights, light text in both. The drama is the point —
 * scrolling out of washi paper into a thunderstorm — and the only thing that
 * follows the theme is the torn paper itself, which is the page.
 *
 * THE LEAD
 * --------
 * Big and first: the whole width, the biggest number, the only primary
 * button. Its card image is framed rather than shown whole (art.ts says how,
 * per report), and when the image is the rare-earths magnet the field is
 * alive: rings of light run out from the magnet through the iron filings,
 * and a lightning strike lights every filing at once. Its catalyst, when it
 * names a date still ahead of the report, is pinned up as a calendar leaf.
 *
 * WHAT IT COSTS
 * -------------
 * Server-rendered. The WebGL sky is the existing island (starts after load,
 * pauses off screen, one still frame under reduced motion). One more tiny
 * island, RoomKeeper, draws nothing: it tells the CSS which parts are on
 * screen and when the page is scrolling. Every other moving thing is CSS on
 * the compositor — transform and opacity — and every loop stops off
 * screen, holds still while the page scrolls, and stops under reduced
 * motion. Nothing here is scroll-linked: measured, each scroll-driven layer
 * (a parallax tear, a drifting kanji, a rising panel) cost compositor time
 * on every scrolling frame for a nuance nobody would miss.
 *
 * Content comes from the data: frontReports() in order, the lead first; the
 * archive is counted, never listed. Mount it outside any max-width column
 * (it is full-bleed); it carries `id="market-storm"` for links from
 * elsewhere.
 */
export default function WritingStorm() {
  const [lead, ...rest] = frontReports();
  if (!lead) return null;
  const archived = archivedReports().length;

  return (
    <section id="market-storm" aria-labelledby="wms-title" className="wms">
      <div className="wms-room">
        <StormSky variant="band" night />
        {/* 嵐, arashi, "storm": brushed in once the reader stops to look,
            lit by every strike (storm.css, RoomKeeper). */}
        <div className="wms-kanji" aria-hidden="true">
          <Kanji char="嵐" draw className="wms-kanji-glyph" />
        </div>

        <div className="wms-inner">
          <header className="wms-head">
            {/* StormSky aims its strikes beside this, never through it. */}
            <div className="wms-head-text" data-storm-avoid>
              <p className="sd-kicker wms-kicker">The money side of AI</p>
              <h2
                id="wms-title"
                className="font-display sd-brush-under wms-title"
                data-text="Market Storm"
              >
                Market Storm
              </h2>
              <p className="font-read wms-lede">
                AI agents that are told to disagree dig into one event in the AI
                business, like a big company&rsquo;s quarterly results. Then
                other agents try to prove the key claims wrong. Only what
                survives gets written up. Not stock tips.
              </p>
            </div>
            <div className="wms-kiru" aria-hidden="true">
              <span className="wms-puddle">
                {RIPPLES.map((style, i) => (
                  <span key={i} className="wms-ripple" style={style} />
                ))}
              </span>
              <Kiru pose="storm" />
            </div>
          </header>

          {/* The front, in Josh's order: an ordered list, so a screen reader
              hears "1 of 3" where a reader sees the numbers. */}
          <ol className="wms-front" role="list">
            <li className="wms-slot wms-slot-lead">
              <Lead report={lead} />
            </li>
            {rest.map((report, i) => (
              <li key={report.slug} className="wms-slot">
                <Card report={report} no={i + 2} />
              </li>
            ))}
          </ol>

          {archived > 0 && <ArchiveLink count={archived} />}
        </div>
        <RoomKeeper />
      </div>
      <Tear edge="top" />
      <Tear edge="bottom" />
    </section>
  );
}

const hrefOf = (r: MarketStormEntry) => `/market-storm/${r.slug}`;

/**
 * Its place in the order, set big. Decoration: the list carries the order
 * for a screen reader, and the number is the same one.
 */
function No({ n }: { n: number }) {
  return (
    <span className="font-display wms-no" aria-hidden="true">
      <span className="wms-no-l">No.</span>
      {n}
    </span>
  );
}

/* ── The lead ───────────────────────────────────────────────────────────── */

/*
 * One link per card: the title. Its ::after stretches over the whole card,
 * so the card is the tap target and a keyboard stops once, on a link named
 * by the title. The button-shaped "Read the report" is that same link's
 * face, so it is hidden from assistive tech rather than read twice.
 */
function Lead({ report }: { report: MarketStormEntry }) {
  const href = hrefOf(report);
  const art = leadArt(report);
  const when = watchDate(report);
  const finding = findingFor(report);
  const [stat] = cardKpis(report);

  return (
    <article className="wms-card wms-lead" aria-labelledby="wms-lead-title">
      <Seal char="雷" className="wms-seal" />
      {report.cardImage && !finding ? (
        <Field report={report} art={art} />
      ) : finding || stat ? (
        <div className="wms-pic wms-plate wms-lead-plate">
          <Plate stat={stat} finding={finding} />
        </div>
      ) : null}
      <div className="wms-lead-body">
        <div className="wms-top">
          <No n={1} />
          <p className="wms-kick">
            <span>Lead report</span>
            <time dateTime={report.publishDate}>
              {formatDate(report.publishDate)}
            </time>
          </p>
        </div>
        <h3 id="wms-lead-title" className="font-display wms-lead-title">
          <Link href={href} className="wms-link">
            {report.title}
          </Link>
        </h3>
        <p className="font-read wms-lead-excerpt">{report.excerpt}</p>
        {report.catalyst && (
          <div className="wms-watch">
            {when && (
              <span className="wms-leaf" aria-hidden="true">
                <span className="wms-leaf-m">{when.month}</span>
                <span className="font-display wms-leaf-d">{when.day}</span>
                <span className="wms-leaf-y">{when.year}</span>
              </span>
            )}
            <p className="wms-watch-text">
              <span className="wms-watch-label">
                {when ? 'The date I’m watching' : 'The catalyst'}
              </span>{' '}
              <span>
                {when ? (
                  <>
                    {report.catalyst.slice(0, when.at)}
                    <time dateTime={when.iso}>{when.text}</time>
                    {report.catalyst.slice(when.at + when.text.length)}
                  </>
                ) : (
                  report.catalyst
                )}
              </span>
            </p>
          </div>
        )}
        <div className="wms-lead-foot">
          <span className="wms-go wms-go-primary" aria-hidden="true">
            Read the report <span className="wms-go-arrow">&rarr;</span>
          </span>
          <p className="wms-advice">Research, not advice.</p>
        </div>
      </div>
    </article>
  );
}

/**
 * The lead's card image, framed on its subject. When the subject is the
 * magnet, the field pulses: two rings of light run out from the magnet's
 * centre, and the image's own brightness is their mask, so they light the
 * iron filings and nothing else. A strike lights them all at once.
 */
function Field({ report, art }: { report: MarketStormEntry; art?: LeadArt }) {
  const style = art
    ? ({
        '--fx': art.focus[0],
        '--fy': art.focus[1],
        '--subject': art.subject,
        '--mask': `url(${report.cardImage})`,
      } as CSSProperties)
    : undefined;
  return (
    <div
      className={`wms-pic wms-field${art ? ' is-framed' : ''}`}
      data-wms-field={art?.pulse ? '' : undefined}
      style={style}
    >
      <div className="wms-field-art">
        {/* eslint-disable-next-line @next/next/no-img-element -- a pre-sized 1200×630 webp the CSS frames, masks and lights; lazy, below the fold */}
        <img
          src={report.cardImage}
          alt={report.cardImageAlt ?? ''}
          width={1200}
          height={630}
          loading="lazy"
          decoding="async"
          className="wms-field-img"
        />
        {art?.pulse && (
          <span className="wms-field-fx" aria-hidden="true">
            <span className="wms-pulse" />
            <span className="wms-pulse wms-pulse-b" />
            <span className="wms-strike" />
          </span>
        )}
      </div>
    </div>
  );
}

/* ── The pair ───────────────────────────────────────────────────────────── */

function Card({ report, no }: { report: MarketStormEntry; no: number }) {
  const href = hrefOf(report);
  const id = `wms-card-${report.slug}`;
  const finding = findingFor(report);
  const [stat] = cardKpis(report);
  const tag = report.ticker ?? report.company;

  return (
    <article className="wms-card wms-pair" aria-labelledby={id}>
      {finding || (!report.cardImage && stat) ? (
        <div className="wms-pic wms-plate">
          <Plate stat={stat} finding={finding} />
        </div>
      ) : report.cardImage ? (
        <div className="wms-pic wms-print">
          {/* The room is always night, so only the night card. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- a pre-sized 1200×630 webp card, lazy, below the fold: nothing for next/image to do */}
          <img
            src={report.cardImage}
            alt={report.cardImageAlt ?? ''}
            width={1200}
            height={630}
            loading="lazy"
            decoding="async"
          />
        </div>
      ) : null}
      <div className="wms-pair-body">
        <div className="wms-top">
          <No n={no} />
          <p className="wms-kick">
            {tag && <span>{tag}</span>}
            <time dateTime={report.publishDate}>
              {formatDate(report.publishDate)}
            </time>
          </p>
        </div>
        <h3 id={id} className="font-display wms-pair-title">
          <Link href={href} className="wms-link">
            {report.title}
          </Link>
        </h3>
        <p className="font-read wms-pair-excerpt">{report.excerpt}</p>
        <span className="wms-go" aria-hidden="true">
          Read it <span className="wms-go-arrow">&rarr;</span>
        </span>
      </div>
    </article>
  );
}

/* ── A report's own picture: its figure, and the finding drawn ─────────── */

function Plate({ stat, finding }: { stat?: Kpi; finding: Finding | null }) {
  return (
    <div className="wms-finding">
      {stat && <BigStat kpi={stat} />}
      {finding && <Bars finding={finding} />}
    </div>
  );
}

/** The figure the report turns on, set big, in its semantic ink. */
function BigStat({ kpi }: { kpi: Kpi }) {
  const tone = kpi.tone ?? 'neutral';
  return (
    <p className="wms-stat">
      <span className={`font-display wms-stat-num ${toneText[tone]}`}>
        {cents(kpi.value)}
      </span>{' '}
      <span className="wms-stat-text">
        <span className="wms-stat-label">{kpi.label}</span>{' '}
        {kpi.delta && (
          <span className={`wms-stat-delta ${toneText[tone]}`}>
            {toneGlyph[tone] && (
              <span className="wms-glyph" aria-hidden="true">
                {toneGlyph[tone]}
              </span>
            )}
            {cents(kpi.delta)}
          </span>
        )}
      </span>
    </p>
  );
}

/**
 * The title, drawn: what was reported against what arrived, on one scale.
 *
 * The cash bar fills once when it is first seen — up to where it stood three
 * months earlier, a beat, then down to where it is now, leaving a dashed
 * ghost behind. Transform only; with no script or under reduced motion it is
 * simply drawn finished.
 */
function Bars({ finding }: { finding: Finding }) {
  const style = {
    '--share': finding.share.toFixed(4),
    '--before': finding.before.toFixed(4),
  } as CSSProperties;
  return (
    <div className="wms-bars" data-wms-fill style={style}>
      <div>
        <p className="wms-bar-label">
          <span>{finding.labels.profit}</span>{' '}
          <span className="wms-bar-num">{finding.profit}</span>
        </p>
        <div className="wms-track" aria-hidden="true">
          <span className="wms-bar wms-bar-profit" />
        </div>
      </div>
      <div>
        <p className="wms-bar-label">
          <span>{finding.labels.cash}</span>{' '}
          <span className="wms-bar-num wms-bar-num-cash">{finding.cash}</span>
        </p>
        <div className="wms-track" aria-hidden="true">
          <span className="wms-ghost" />
          <span className="wms-bar wms-bar-cash" />
        </div>
        <p className="wms-then" aria-hidden="true">
          {finding.labels.before}
        </p>
      </div>
    </div>
  );
}

/* ── The way into the archive ──────────────────────────────────────────── */

/**
 * The archive left the room for /market-storm. What stays is one quiet link
 * that says how much is there — counted, never hardcoded — beside the count
 * drawn as a stack of paper slips (up to twelve; past that a stack stops
 * being countable at a glance).
 */
function ArchiveLink({ count }: { count: number }) {
  const slips = Math.min(count, 12);
  return (
    <p className="wms-more">
      <Link href="/market-storm#archive" className="wms-more-link">
        <span className="wms-stack" aria-hidden="true">
          {Array.from({ length: slips }, (_, i) => (
            <span
              key={i}
              style={{ '--i': i, '--j': JITTER[i % JITTER.length] } as CSSProperties}
            />
          ))}
        </span>
        <span>
          {count} earlier {count === 1 ? 'report' : 'reports'} in the archive
        </span>
        <span aria-hidden="true" className="wms-go-arrow">
          &rarr;
        </span>
      </Link>
    </p>
  );
}

/** How far each slip in the stack sits off square, in px (fixed, not random). */
const JITTER = [0, 2, -1, 3, 1, -2, 2, 0, -1, 3, 1, -2];

/* ── The tear ─────────────────────────────────────────────────────────── */

/**
 * The page's own paper, torn: a soft shadow on the storm, a lighter rim of
 * torn fibre, then the sheet itself. Three CSS masks over one 960px tile, in
 * the page's ground colour, so it is washi by day and lacquer by night.
 */
function Tear({ edge }: { edge: 'top' | 'bottom' }) {
  return (
    <div className={`wms-tear wms-tear-${edge}`} aria-hidden="true">
      <span className="wms-tear-shade" />
      <span className="wms-tear-paper" />
    </div>
  );
}

/** Rain rings in the puddle at Kiru's feet (they run while the puddle is on screen). */
const RIPPLES = [
  { '--w': '30%', '--x': '8%', '--y': '24%', '--d': '0s' },
  { '--w': '36%', '--x': '44%', '--y': '8%', '--d': '-0.7s' },
  { '--w': '24%', '--x': '70%', '--y': '40%', '--d': '-1.3s' },
] as unknown as CSSProperties[];
