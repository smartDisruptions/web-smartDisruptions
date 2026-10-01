import type { CSSProperties } from 'react';
import Kiru from '@/components/kiru/Kiru';
import Torii from './Torii';
import { switchback, turnKeyframes } from './route';

/**
 * 道 — the timeline on /about, drawn as a brush path that inks itself as you
 * scroll, with Kiru running it.
 *
 * NO JAVASCRIPT. Everything moves on one named view timeline (`--ab-path`,
 * the list's own passage through the viewport):
 *
 *  - the stroke draws by animating stroke-dashoffset (pathLength="1"),
 *  - Kiru travels on `offset-path: shape(...)` — the same curve, in pixels,
 *  - a run pose turns around at every corner, and a meditating one waits at
 *    either end.
 *
 * The range is `entry 40% exit 40%`: progress 0 when the top of the list is
 * 60% down the screen, 1 when its bottom is. So the ink tip — and Kiru — sit
 * on the reader's eye line the whole way down.
 *
 * Content never depends on any of it. Without scroll timelines, or with
 * reduced motion, the path is simply drawn in full and Kiru sits at the top.
 * All three rails (phone and tablet: a trail at the left; desktop: a wide one
 * down the middle) are server-rendered; CSS shows the one that fits.
 */

// Desktop: a 208px gutter between the two columns of cards. Tablet: a 60px
// trail at the left. Phone: a 44px one. Each rail's SVG is exactly as wide as
// its route (x is in pixels), so the CSS swaps whole rails, never stretches one.
const WIDE = switchback(208, 46, 9);
const MID = switchback(60, 10, 11);
const NARROW = switchback(44, 7, 13);

const TURNS =
  turnKeyframes('ab-turn-d', WIDE.turns) +
  turnKeyframes('ab-turn-t', MID.turns) +
  turnKeyframes('ab-turn-m', NARROW.turns);

export type Milestone = {
  year: string;
  title: string;
  body: string;
  /** Marks where the story changes gear. */
  era?: string;
  current?: boolean;
};

function Rail({
  route,
  className,
}: {
  route: ReturnType<typeof switchback>;
  className: string;
}) {
  return (
    <svg
      className={`ab-ink ${className}`}
      viewBox={route.viewBox}
      preserveAspectRatio="none"
      focusable="false"
    >
      {/* The way ahead, as a dotted guide. */}
      <path className="ab-ghost" d={route.d} />
      {/* Sumi bleeding into washi, then the stroke itself. */}
      <path className="ab-bleed" d={route.d} pathLength={1} />
      <path className="ab-stroke" d={route.d} pathLength={1} />
    </svg>
  );
}

export default function ThePath({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="ab-path">
      {/* The turn keyframes are generated from the same geometry as the path,
          so the corners and the turns can never drift apart. */}
      <style href="ab-path-turns" precedence="medium">
        {TURNS}
      </style>

      <div
        className="ab-rail"
        aria-hidden
        style={
          {
            '--ab-route-d': WIDE.shape,
            '--ab-route-t': MID.shape,
            '--ab-route-m': NARROW.shape,
          } as CSSProperties
        }
      >
        <Rail route={WIDE} className="ab-ink-d" />
        <Rail route={MID} className="ab-ink-t" />
        <Rail route={NARROW} className="ab-ink-m" />
        <span className="ab-blot" />
        <div className="ab-walker">
          <div className="ab-kiru-sit">
            <Kiru pose="meditate" />
          </div>
          <div className="ab-kiru-run">
            <div className="ab-turn">
              <Kiru pose="run" />
            </div>
          </div>
        </div>
      </div>

      <ol className="ab-list">
        {milestones.map((m, i) => (
          <li
            key={m.year}
            className={`ab-ms ${i % 2 ? 'ab-ms-r' : 'ab-ms-l'}${m.era ? ' ab-ms-era' : ''}`}
          >
            {/* The era marks where the story changes gear without breaking the
                single chronological spine: the path runs through a gate. */}
            {m.era && (
              <div className="ab-era">
                <p className="ab-era-label">{m.era}</p>
                <Torii className="ab-torii" />
              </div>
            )}
            <div
              className={`ab-card sd-sheet${m.current ? ' ab-card-now' : ''}`}
            >
              <span className="ab-node" aria-hidden />
              <p className="ab-year">
                {m.current && <span className="ab-live" aria-hidden />}
                {m.year}
              </p>
              <h3 className="ab-title font-display">{m.title}</h3>
              <p className="ab-body font-read">{m.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
