/**
 * The night market's fixed scenery, worked out on the server: the lantern
 * string and the ticker. Nothing here reaches the browser as code — only the
 * numbers it produces.
 */

// Paper lanterns strung along a wire across the top: two swags of one
// quadratic each, so a lantern's height is the curve's y at its x.
const wireY = (x: number) => {
  const [a, c, b, t] = x <= 50 ? [6, 64, 10, x / 50] : [10, 64, 6, (x - 50) / 50];
  return (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
};

export const WIRE_PATH = 'M0 6 Q250 64 500 10 Q750 64 1000 6';

export const LANTERNS = [3, 10, 17, 25, 33, 41, 58, 66, 74, 82, 89, 96].map((x, i) => ({
  x,
  y: Math.round(wireY(x) + 5),
  gold: i % 3 === 1,
  wide: i % 2 === 1,
  sway: `${(5.2 + (i % 4) * 0.9).toFixed(1)}s`,
  delay: `${(-i * 0.73).toFixed(2)}s`,
}));

// The ticker. It used to measure itself with a ResizeObserver to hold a steady
// 30px/s whatever the line-up. It is set in the platform UI face now — no web
// font swaps in under it — so its width is predictable from the text: about
// 14px a character at this size and tracking, plus 48px of padding an item.
// The duration is worked out here, on the server, and the page ships no
// JavaScript for it. Within a few percent of 30px/s on any platform font.
const MARQUEE_SPEED_PX_PER_SEC = 30;

export function ticker(names: string[]) {
  const items = ['NOW PLAYING', ...names.map((n) => n.toUpperCase()), 'INSERT COIN', 'HIGH SCORE', 'PLAYER ONE READY'];
  const seconds = Math.round(items.reduce((w, t) => w + (t.length + 2) * 14 + 48, 0) / MARQUEE_SPEED_PX_PER_SEC);
  return { items, seconds };
}

export const TICKER_INK = ['var(--arc-pink-ink)', 'var(--arc-amber-ink)', 'var(--arc-cyan-ink)'];
