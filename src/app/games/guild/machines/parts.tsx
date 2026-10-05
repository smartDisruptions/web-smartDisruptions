import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import type { App } from '@/data/apps';
import { builtHref } from '@/data/projects';
import { ArrowIcon } from '../../Cabinets';
import Best from './Best';
import { range } from './geo';

export interface MachineProps {
  game: App;
  /** The machine's place in the row, 1–5: its ticket's serial number. */
  no: number;
}

export const nameId = (game: App) => `gm-${game.slug}`;

/**
 * The machine's screen: the game's own attract screen (a 3:4 still the games
 * agents render), under warm CRT glass: scanlines, a vignette, a reflection.
 * Until the still exists the glass sits over a lit, empty screen, so it never
 * reads as a hole.
 *
 * The whole screen is a Play target for a thumb or a mouse, but it is hidden
 * from the keyboard and screen readers, who get the labelled ticket instead.
 */
export function Screen({ game, children }: { game: App; children?: ReactNode }) {
  const inner = (
    <span className="gm-screen-in">
      <span className="gm-screen-idle">Free play</span>
      {/* eslint-disable-next-line @next/next/no-img-element -- a small static still, sized by the screen box, lazy */}
      <img
        src={`/images/apps/${game.slug}-cabinet.webp`}
        alt=""
        width={720}
        height={960}
        loading="lazy"
        decoding="async"
      />
      <span className="gm-glass" />
      {children}
    </span>
  );
  return game.liveUrl ? (
    <a className="gm-screen" href={game.liveUrl} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
      {inner}
    </a>
  ) : (
    <span className="gm-screen" aria-hidden="true">
      {inner}
    </span>
  );
}

const PlayIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
    <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
  </svg>
);

/**
 * Play, as a carnival ticket: at home in Broom & Blade a finished chore earns
 * tickets and a ticket buys a round. Here every round is free, so the ticket
 * says so. Its name starts with the visible word "Play" (label in name); the
 * printed lines follow it, in reading order on the ticket.
 */
export function Ticket({ game, no }: MachineProps) {
  if (!game.liveUrl) return null;
  return (
    <a className="gm-tk" href={game.liveUrl} target="_blank" rel="noopener noreferrer">
      <span className="gm-tk-paper">
        <span className="gm-tk-main">
          <span className="gm-tk-play">
            <PlayIcon />
            Play<span className="sr-only"> {game.name}: </span>
          </span>
          <span className="gm-tk-admit">Admit one </span>
          <span className="gm-tk-free">
            <span className="sr-only">· </span>Free play
          </span>
        </span>
        <span className="gm-tk-stub" aria-hidden="true">
          <span>No.</span>
          {String(no).padStart(2, '0')}
        </span>
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/**
 * What the game is, your best, the way to the details, and the ticket,
 * hanging out of the machine's ticket slot.
 */
export function Plate({ game, no, className }: MachineProps & { className?: string }) {
  return (
    <div className={['gm-plate', className].filter(Boolean).join(' ')}>
      <p className="gm-desc">{game.description}</p>
      <div className="gm-meta">
        <p className="gm-best">
          <Best slug={game.slug} />
        </p>
        <Link className="gm-more" href={`${builtHref(game.slug)}?from=guild`}>
          Details
          <span className="sr-only"> about {game.name}</span>
          <ArrowIcon />
        </Link>
      </div>
      <div className="gm-slot">
        <Ticket game={game} no={no} />
      </div>
    </div>
  );
}

/**
 * Warm marquee bulbs. The bulbs are one still SVG; every other bulb also has
 * a glow in a second SVG that blinks on the room's clock (opacity only), so a
 * whole marquee costs one composited layer and no paint per frame. `points`
 * are in the viewBox.
 */
export function Bulbs({
  points,
  viewBox,
  r = 2.5,
  className,
  style,
}: {
  points: ReadonlyArray<readonly [number, number]>;
  viewBox: string;
  r?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={['gm-bulbs', className].filter(Boolean).join(' ')} style={style} aria-hidden="true">
      <svg viewBox={viewBox} className="gm-bulbs-row">
        {points.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r * 1.24} fill="#3a2410" />
            <circle cx={x} cy={y} r={r} fill="url(#gm-g-bulb)" />
          </g>
        ))}
      </svg>
      <svg viewBox={viewBox} className="gm-bulbs-lit gm-a">
        {points.map(([x, y], i) =>
          i % 2 === 0 ? (
            <g key={i}>
              <circle cx={x} cy={y} r={r * 2} fill="url(#gm-g-glow)" />
              <circle cx={x} cy={y} r={r * 0.92} fill="#fffbe6" />
            </g>
          ) : null
        )}
      </svg>
    </span>
  );
}

/** Bulbs in a straight row, n of them, filling a strip n×10 by 10. */
export function BulbRow({ n, className, style }: { n: number; className?: string; style?: CSSProperties }) {
  const points = range(n).map((i) => [5 + i * 10, 5] as const);
  return <Bulbs points={points} viewBox={`0 0 ${n * 10} 10`} className={className} style={style} />;
}
