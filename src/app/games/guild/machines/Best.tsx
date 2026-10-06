'use client';

import type { CSSProperties } from 'react';
import { useSyncExternalStore } from 'react';
import { readout } from './segments';

/**
 * Your best, from this browser's localStorage. The games are static files on
 * this same origin, so /games can read what they saved; nothing is sent
 * anywhere.
 *
 * The keys and meanings are the games' own (a contract with them): four are
 * plain points, and Kid Volt's is a TIME — the fastest win in fight-clock
 * seconds, lower is better, written only on a win — shown the way the game
 * shows it, m:ss with the seconds rounded up.
 *
 * A best set in another tab arrives through the `storage` event, so the
 * machine updates while you're still in the game; `pageshow` and
 * `visibilitychange` cover a return from the back/forward cache. The server
 * renders the no-score state and the browser swaps the number in after
 * hydration (useSyncExternalStore's server snapshot) — the line's box is
 * reserved in CSS, so the swap can't move anything.
 */

type Kind = 'points' | 'ko';
const STORE: Record<string, { key: string; kind: Kind }> = {
  'hoop-quest': { key: 'hoopquest-best-pts3', kind: 'points' },
  'kid-volt-knockout': { key: 'kidvolt.best', kind: 'ko' },
  'whack-a-dust-bunny': { key: 'whack-best', kind: 'points' },
  'ring-toss': { key: 'ringtoss-best', kind: 'points' },
  'milk-bottle-knockdown': { key: 'milkbottle-best', kind: 'points' },
};

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener('pageshow', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener('pageshow', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
}

function read(key: string | undefined): number | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw.trim() === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null; // storage blocked (private mode): no score to show
  }
}

const serverSnapshot = () => null;

function useBest(slug: string) {
  const key = STORE[slug]?.key;
  return useSyncExternalStore(subscribe, () => read(key), serverSnapshot);
}

/** The game's own clock format: 97 → "1:37". */
const clock = (s: number) => {
  const t = Math.ceil(s);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
};

/**
 * A two-line plaque: a small label over the score. Before any play the value
 * is a line of its own and the label steps aside for screen readers, so they
 * hear "No score yet" rather than "Your best, no score yet".
 */
export default function Best({ slug }: { slug: string }) {
  const best = useBest(slug);
  const ko = STORE[slug]?.kind === 'ko';
  const label = ko ? 'Best KO' : 'Your best';
  if (best === null) {
    return (
      <>
        <span className="gm-best-k" aria-hidden="true">
          {label}
        </span>
        <span className="gm-best-v gm-best-none">{ko ? 'No KO yet' : 'No score yet'}</span>
      </>
    );
  }
  return (
    <>
      <span className="gm-best-k">
        {label}
        <span className="sr-only">:</span>
      </span>
      <span className="gm-best-v">{ko ? clock(best) : Math.round(best).toLocaleString('en-US')}</span>
    </>
  );
}

/**
 * Kid Volt's segment readout: "KO" until you've won, then your fastest
 * knockout, lit on the machine. Decoration (the text line above says it).
 */
export function VoltReadout({ viewBox, style, cx, y }: { viewBox: string; style: CSSProperties; cx: number; y: number }) {
  const best = useBest('kid-volt-knockout');
  const { unlit, lit, dots } = readout(best === null ? 'KO' : clock(best), cx, y);
  return (
    <svg className="gm-volt-readout" viewBox={viewBox} style={style} aria-hidden="true" focusable="false">
      <g fill="none" strokeLinecap="round">
        <g stroke="#3a0e1d" strokeWidth="3.4">
          {unlit.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g stroke="#ff3d6e" strokeWidth="7" opacity=".28">
          {lit.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g stroke="#ff6a8e" strokeWidth="3.4">
          {lit.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
      {dots.map(([x, yy]) => (
        <circle key={`${x}-${yy}`} cx={x} cy={yy} r="2.1" fill="#ff6a8e" />
      ))}
    </svg>
  );
}
