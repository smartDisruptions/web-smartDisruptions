import Link from 'next/link';
import { Fragment, type CSSProperties } from 'react';
import { leadReport, marketStormReports } from '@/data/marketStorm';
import { Button } from '@/components/ui';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { Disclaimer } from '@/components/market-storm/ReportView';
import StormSky from '@/components/market-storm/StormSky';
import IndexFront from '@/components/market-storm/IndexFront';
import IndexArchive from '@/components/market-storm/IndexArchive';

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
 * Two phrases changed when the page stopped being only the archive: the
 * kicker, and the first button, which opens whichever report leads now.
 */
function StormHero() {
  const lead = leadReport();
  const count = marketStormReports.length;
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
        {/* Market Storm is a section of the Writing page, and this is its
            own page: the reports Josh put first, then the archive. The way
            back is to that section, not the top of Writing. It sits in the
            open sky above the words, the way a report's back link does, so
            the clearing and Kiru keep their places — and it carries no
            data-storm-avoid: StormSky reads the first one it finds, which
            has to stay the words. */}
        <Link
          href="/content#market-storm"
          transitionTypes={['nav-back']}
          className="ms-back absolute left-5 top-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-text-secondary transition-[color,border-color,scale] hover:border-accent/40 hover:text-accent active:scale-[0.97] sm:left-6 sm:top-7 lg:top-8"
        >
          &larr; Writing
        </Link>
        <div className="ms-clear max-w-[41rem]" data-storm-avoid>
          <p className="sd-kicker">
            Market Storm{count > 1 ? ` · all ${count} reports` : ''}
          </p>
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
            {lead ? (
              <Button href={`/market-storm/${lead.slug}`}>
                Read the lead report
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
 *
 * It sits between the front and the archive: after the three reports a reader
 * came for, before the earnings reads its "four rather than five" describes.
 */
function HowItWorks() {
  return (
    <section
      aria-labelledby="ms-how-title"
      className="ms-how grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-center lg:gap-10"
    >
      <div className="sd-reveal">
        <div className="sd-sheet flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
          <StormCell className="w-[112px] shrink-0 sm:w-[150px]" />
          <div className="min-w-0">
            <h2 id="ms-how-title" className="sd-kicker">
              Agents with opposing stakes, one catalyst
            </h2>
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
    </section>
  );
}

/**
 * The Market Storm page: the storm, the front, the method, the archive.
 *
 * It used to be the archive alone, six cards a page across numbered pages,
 * with the thesis pinned above page 1. Josh put three reports at the front
 * on 2026-10-09 and archived the rest, so the page now says that in that
 * order: the three he chose (IndexFront), how they are made, then every
 * earlier report on one quiet list (IndexArchive). With ten in the archive
 * there is nothing left to page through; old /market-storm/page/N links are
 * redirected to the archive in next.config.ts.
 */
export default function MarketStormIndexView() {
  return (
    <>
      <StormHero />
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <IndexFront />
        <HowItWorks />
        <IndexArchive />
      </div>
    </>
  );
}
