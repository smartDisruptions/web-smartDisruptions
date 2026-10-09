import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  cardKpis,
  frontReports,
  leadReport,
  marketStormReports,
  methodOf,
  type Kpi,
  type MarketStormEntry,
  type ResearchMethod,
} from '@/data/marketStorm';
import StormSky from '@/components/market-storm/StormSky';
import Kanji, { Seal } from '@/components/brand/Kanji';
import Kiru from '@/components/kiru/Kiru';
import Button from '@/components/ui/Button';
import HeroImage from '@/components/HeroImage';
import { toneGlyph, toneText } from '@/components/market-storm/tone';
import { formatDate } from '@/lib/format';
import { cents, findingFor, type Finding } from './finding';
import TapeToggle from './TapeToggle';
import './storm.css';

/**
 * THE STORM ROOM — Market Storm, as the second section of the Writing page.
 *
 * The page above is paper. Here it tears open, and behind the tear is the
 * storm: the live WebGL sky (StormSky, always night here), 嵐 brushing itself
 * in and flaring with each strike, Kiru under his wagasa with rain rings at
 * his feet. In the room: the lead report with its central finding drawn as a
 * picture, and the rest of the archive crawling past on a paper ticker tape.
 *
 * WHY ALWAYS NIGHT
 * ----------------
 * It is an object region, like the footer and the home page's storm teaser:
 * the same room in both lights, light text in both. The drama is the point —
 * scrolling out of washi paper into a thunderstorm — and the only thing that
 * follows the theme is the torn paper itself, which is the page.
 *
 * WHAT IT COSTS
 * -------------
 * Server-rendered. The WebGL sky is the existing island (starts after load,
 * pauses off screen, one still frame under reduced motion). One more tiny
 * island, the ticker's pause button, also tells the CSS which parts are on
 * screen and when the page is scrolling. Every other moving thing is CSS on
 * the compositor — transform and opacity — and every loop stops off
 * screen, holds still while the page scrolls, and stops under reduced
 * motion. Nothing here is scroll-linked: measured, each scroll-driven layer
 * (a parallax tear, a drifting kanji, a rising panel) cost compositor time
 * on every scrolling frame for a nuance nobody would miss.
 *
 * Measured on a phone at 4× CPU: idle in the room, 60fps with no slow
 * frames; scrolling through it, within a couple of frames of the same page
 * with the room hidden.
 *
 * Content comes from the data: whichever report is pinned as featured leads,
 * the rest of the archive rides the tape newest first, and the counts are
 * counted. Mount it outside any max-width column (it is full-bleed); it
 * carries `id="market-storm"` for links from elsewhere.
 */
export default function WritingStorm() {
  const lead = leadReport();
  if (!lead) return null;
  const archive = frontReports().slice(1);
  // The newest report gets its own card under the lead; the tape carries the
  // rest, so nothing is shown twice.
  const [newest, ...earlier] = archive;
  const [stat, ...figs] = cardKpis(lead).slice(0, 3);
  const finding = findingFor(lead);
  const href = `/market-storm/${lead.slug}`;

  return (
    <section id="market-storm" aria-labelledby="wms-title" className="wms">
      <div className="wms-room">
        <StormSky variant="band" night />
        {/* 嵐, arashi, "storm": brushed in once the reader stops to look,
            lit by every strike (storm.css, TapeToggle). */}
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

          {/* Source order is the phone's reading order — the claim, the
              evidence, then the way in. On a wide screen the evidence takes
              the right-hand column (grid areas in storm.css). */}
          <article className="wms-lead" aria-labelledby="wms-lead-title">
            <Seal char="雷" className="wms-seal" />
            <p className="wms-lead-kicker">
              Lead report &middot;{' '}
              <time dateTime={lead.publishDate}>
                {formatDate(lead.publishDate)}
              </time>
            </p>
            <h3 id="wms-lead-title" className="font-display wms-lead-title">
              <Link href={href}>{lead.title}</Link>
            </h3>
            <p className="font-read wms-excerpt">{lead.excerpt}</p>
            <div className="wms-finding">
              {stat && <BigStat kpi={stat} />}
              {finding && <Bars finding={finding} />}
              {figs.length > 0 && <Figures kpis={figs} />}
            </div>
            <MethodLine method={methodOf(lead)} />
            <div className="wms-cta-row">
              <Button href={href} size="lg">
                Read the report <span aria-hidden="true">&rarr;</span>
              </Button>
              <p className="wms-advice">Research, not advice.</p>
            </div>
          </article>

          {newest && <Newest report={newest} />}

          {earlier.length > 0 && (
            <div className="wms-archive">
              <h3 className="sd-kicker wms-archive-title">Earlier reports</h3>
              <TapeToggle />
              <Tape reports={earlier} />
              <Button
                variant="secondary"
                href="/market-storm#reports"
                className="wms-browse"
              >
                Browse all {marketStormReports.length} reports{' '}
                <span aria-hidden="true">&rarr;</span>
              </Button>
            </div>
          )}
        </div>
      </div>
      <Tear edge="top" />
      <Tear edge="bottom" />
    </section>
  );
}

/* ── The lead report's figures ─────────────────────────────────────────── */

/** The figure the report turns on, set big, in its semantic ink. */
/** The newest report, as a card of its own between the lead and the tape. */
function Newest({ report }: { report: MarketStormEntry }) {
  const href = `/market-storm/${report.slug}`;
  return (
    <article className="wms-new" aria-labelledby="wms-new-title">
      {report.cardImage && (
        <div className="wms-new-img">
          {/* The room is always night, so only the night card. */}
          <HeroImage
            post={{
              heroImage: report.cardImage,
              heroImageAlt: report.cardImageAlt,
              title: report.title,
            }}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="wms-new-body">
        <p className="wms-lead-kicker">
          <span className="wms-new-pill">New</span> Newest report &middot;{' '}
          <time dateTime={report.publishDate}>
            {formatDate(report.publishDate)}
          </time>
        </p>
        <h3 id="wms-new-title" className="font-display wms-new-title">
          <Link href={href}>{report.title}</Link>
        </h3>
        <p className="font-read wms-new-excerpt">{report.excerpt}</p>
        <Button href={href} variant="secondary" className="wms-new-cta">
          Read it <span aria-hidden="true">&rarr;</span>
        </Button>
      </div>
    </article>
  );
}

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

/** The next two headline figures, in the report's own semantic inks. */
function Figures({ kpis }: { kpis: Kpi[] }) {
  return (
    <dl className="wms-figs">
      {kpis.map((kpi) => {
        const tone = kpi.tone ?? 'neutral';
        return (
          <div key={kpi.label}>
            <dt className="wms-fig-label">{kpi.label}</dt>
            <dd className={`wms-fig-value ${toneText[tone]}`}>
              {toneGlyph[tone] && (
                <span className="wms-glyph" aria-hidden="true">
                  {toneGlyph[tone]}
                </span>
              )}
              {cents(kpi.value)}
            </dd>
            {kpi.delta && <dd className="wms-fig-delta">{cents(kpi.delta)}</dd>}
          </div>
        );
      })}
    </dl>
  );
}

/** How it was made, in one line of plain words. */
function MethodLine({ method }: { method?: ResearchMethod }) {
  if (!method) return null;
  const facts: string[] = [];
  if (method.agentCount > 0) facts.push(`${method.agentCount} AI agents`);
  facts.push(
    method.claimsVerified === undefined
      ? `${method.claimsSurfaced} claims tracked`
      : `${method.claimsVerified} claims sent to be disproved`
  );
  if (method.primaryDocsOpened !== undefined) {
    facts.push(`${method.primaryDocsOpened} original documents opened`);
  }
  return (
    <ul className="wms-method" role="list" aria-label="How it was researched">
      {facts.map((f) => (
        <li key={f}>{f}</li>
      ))}
    </ul>
  );
}

/* ── The archive, on ticker tape ──────────────────────────────────────── */

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return m && d ? `${MONTHS[m - 1]} ${d}` : iso;
};

/**
 * A strip of cream paper crawling across the storm: every other report,
 * newest first, ticker and date and the figure it leads with.
 *
 * The crawl is one translateX on the compositor over two copies of the list;
 * the second copy is for the seamless loop only, so it is hidden from
 * assistive tech and out of the tab order. It pauses on hover and on the
 * button; when a key brings focus into it, it stops and lays itself out as
 * a still paper slip, every link on screen. Under reduced motion it is that
 * slip from the start (one row to swipe, on a phone).
 */
function Tape({ reports }: { reports: MarketStormEntry[] }) {
  const style = { '--wms-n': reports.length } as CSSProperties;
  return (
    <div className="wms-tape" style={style}>
      <div className="wms-tape-track">
        <TapeSet reports={reports} />
        <TapeSet reports={reports} copy />
      </div>
    </div>
  );
}

function TapeSet({
  reports,
  copy = false,
}: {
  reports: MarketStormEntry[];
  copy?: boolean;
}) {
  return (
    <ul
      className="wms-tape-set"
      role={copy ? undefined : 'list'}
      aria-hidden={copy || undefined}
    >
      {reports.map((r) => {
        const k = cardKpis(r)[0];
        const tone = k?.tone ?? 'neutral';
        return (
          <li key={r.slug}>
            <Link
              href={`/market-storm/${r.slug}`}
              className="wms-tick"
              tabIndex={copy ? -1 : undefined}
              prefetch={false}
            >
              <span className="sr-only">{r.company ?? r.title},</span>{' '}
              <span className="font-display wms-tick-sym">
                {r.ticker ?? 'Storm'}
              </span>{' '}
              <span className="wms-tick-date">{shortDate(r.publishDate)}</span>{' '}
              {k && (
                <>
                  <span className={`wms-tick-fig ${toneText[tone]}`}>
                    {toneGlyph[tone] && (
                      <span className="wms-glyph" aria-hidden="true">
                        {toneGlyph[tone]}
                      </span>
                    )}
                    {k.value}
                  </span>{' '}
                  <span className="wms-tick-label">{k.label}</span>
                </>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

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
