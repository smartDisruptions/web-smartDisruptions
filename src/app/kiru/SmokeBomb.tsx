'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import Button from '@/components/ui/Button';

/**
 * Kiru's smoke bomb: a tiny client island that only flips two data attributes.
 * Everything you see — the cloud, the bang, the stars, Kiru popping back — is
 * CSS in ./smoke-css.ts. Kiru himself and the brush "消" are server-rendered and
 * passed in, so neither the rig nor the glyph table ships to the browser.
 *
 * Without JavaScript the first vanish still plays (it's CSS on load); the
 * smoke just doesn't answer a tap.
 */

// x, y, size (% of the stage), billow period (s), delay (s), drift x/y (px), growth
const BLOBS: [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
][] = [
  [22, 70, 31, 3.1, -0.6, -4, -2, 1.06],
  [42, 74, 35, 3.6, 0, -1, -3, 1.05],
  [62, 73, 34, 3.4, -1.2, 2, -3, 1.05],
  [80, 68, 29, 2.9, -2, 4, -2, 1.07],
  [30, 50, 34, 3.3, -0.3, -3, -5, 1.06],
  [54, 45, 41, 3.8, -1.6, 1, -6, 1.05],
  [75, 51, 30, 3, -0.9, 4, -5, 1.07],
  [41, 29, 28, 2.8, -1.4, -2, -7, 1.08],
  [62, 27, 24, 3.2, -0.5, 3, -7, 1.08],
  [9, 60, 16, 2.6, -1.8, -5, -3, 1.1],
  [92, 57, 15, 2.7, -0.2, 5, -3, 1.1],
];

// x, y (% of stage), flight in the spark's own widths, delay (s)
const SPARKS: [number, number, number, number, number][] = [
  [20, 30, -330, -260, 0],
  [82, 26, 320, -300, 0.05],
  [10, 64, -380, 60, 0.08],
  [92, 62, 360, 90, 0.03],
  [50, 6, 20, -360, 0.1],
];

export function SmokeBomb({
  children,
  sfx,
  size,
  hint = true,
}: {
  /** Kiru, server-rendered. */
  children: ReactNode;
  /** The brush sound effect, server-rendered. */
  sfx?: ReactNode;
  /** Stage width, any CSS length. */
  size?: string;
  hint?: boolean;
}) {
  const [shown, setShown] = useState(false);
  const [bangs, setBangs] = useState(0);

  const layer = (cls: string) => (
    <span className={`kv-layer ${cls}`}>
      {BLOBS.map(([x, y, s, t, w, dx, dy, g], i) => (
        <span
          key={i}
          className="kv-blob"
          style={
            {
              '--x': x,
              '--y': y,
              '--s': s,
              '--t': `${t}s`,
              '--w': `${w}s`,
              '--dx': dx,
              '--dy': dy,
              '--g': g,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );

  return (
    <div
      className="kv"
      data-shown={shown ? '' : undefined}
      data-touched={bangs ? '' : undefined}
      style={size ? ({ '--kv-size': size } as CSSProperties) : undefined}
    >
      <button
        type="button"
        className="kv-stage"
        onClick={() => {
          setShown((s) => !s);
          setBangs((n) => n + 1);
        }}
      >
        <span className="sr-only">
          {shown ? 'Make Kiru vanish again' : 'Clear the smoke'}
        </span>
        <span className="kv-kiru" aria-hidden>
          {children}
        </span>
        <span className="kv-smoke" aria-hidden>
          {/* Re-keyed on every tap so the bang replays. */}
          <span className="kv-puff" key={bangs}>
            {layer('kv-ink')}
            {layer('kv-shade')}
            {layer('kv-fill')}
          </span>
          {/* A few small puffs curling up off the top. */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="kv-wisp"
              style={{ '--i': i } as CSSProperties}
            />
          ))}
        </span>
        {SPARKS.map(([x, y, fx, fy, d], i) => (
          <span
            key={`${bangs}-${i}`}
            className="kv-spark"
            aria-hidden
            style={
              {
                '--x': x,
                '--y': y,
                '--fx': fx,
                '--fy': fy,
                '--d': `${d}s`,
              } as CSSProperties
            }
          />
        ))}
        {sfx}
      </button>
      {hint && (
        <p className="kv-hint" aria-live="polite">
          {shown ? 'There he is. Tap again and he’s gone.' : 'Tap the smoke.'}
        </p>
      )}
    </div>
  );
}

const openPalette = () => window.dispatchEvent(new Event('sd:palette'));

/** A card that opens the command palette (the "peek" pose lives there). */
export function PaletteCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={openPalette}>
      {children}
    </button>
  );
}

/** Opens the command palette — the same event the header's search button sends. */
export function OpenSearch({ children }: { children: ReactNode }) {
  return (
    <Button variant="secondary" size="lg" onClick={openPalette}>
      {children}
    </Button>
  );
}
