/**
 * Small shared helpers for the Dash renderer: maths, a seeded random number
 * generator, offscreen canvases and colour mixing.
 *
 * Colour mixing makes strings, so it only ever runs while baking (on
 * setLevel or resize), never inside a frame.
 */

export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number) =>
  v < a ? a : v > b ? b : v;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
/** Positive remainder: mod(-1, 4) is 3, not -1. */
export const mod = (a: number, n: number) => ((a % n) + n) % n;

/** A tiny seeded generator, so every bake draws the same town. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable 0..1 value for an integer, for per-object variety without state. */
export function hash01(n: number): number {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export interface Sprite {
  /** The baked image. */
  c: HTMLCanvasElement;
  /** Its size in canvas pixels when drawn at the bake scale. */
  w: number;
  h: number;
  /** The anchor (canvas pixels from the image's top-left). */
  ax: number;
  ay: number;
}

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

export function ctxOf(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const g = c.getContext('2d');
  if (!g) throw new Error('Canvas 2D is not available');
  return g;
}

let scratch: CanvasRenderingContext2D | null = null;

/**
 * Make the browser rasterize a freshly drawn canvas now. Canvas drawing is
 * recorded and only turned into pixels when the canvas is first used, so
 * without this a theme baked ahead of time would still cost its full price
 * on the first frame it appears. Drawing it into a 1×1 scratch canvas takes
 * that snapshot at bake time instead.
 */
export function warm(c: HTMLCanvasElement) {
  if (!scratch) scratch = ctxOf(makeCanvas(1, 1));
  scratch.drawImage(c, 0, 0, 1, 1);
}

/**
 * Bake a sprite: a canvas of (w × h) canvas pixels with the anchor at
 * (ax, ay), and a drawing callback that works in those pixels.
 */
export function bakeSprite(
  w: number,
  h: number,
  ax: number,
  ay: number,
  draw: (g: CanvasRenderingContext2D) => void
): Sprite {
  const c = makeCanvas(w, h);
  const g = ctxOf(c);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  draw(g);
  warm(c);
  return { c, w: c.width, h: c.height, ax, ay };
}

// ── Colour (bake time only) ───────────────────────────────────────────────

type RGB = [number, number, number];

export function rgbOf(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const hex2 = (v: number) =>
  Math.round(clamp(v, 0, 255))
    .toString(16)
    .padStart(2, '0');

/** Mix two hex colours: t = 0 is a, 1 is b. */
export function mix(a: string, b: string, t: number): string {
  const x = rgbOf(a);
  const y = rgbOf(b);
  return `#${hex2(lerp(x[0], y[0], t))}${hex2(lerp(x[1], y[1], t))}${hex2(lerp(x[2], y[2], t))}`;
}

/** A hex colour with an alpha, as an rgba() string. */
export function rgba(hex: string, a: number): string {
  const [r, g, b] = rgbOf(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(a, 0, 1).toFixed(3)})`;
}

/** Lighten (t > 0, toward white) or darken (t < 0, toward black). */
export function shade(hex: string, t: number): string {
  return t >= 0 ? mix(hex, '#ffffff', t) : mix(hex, '#000000', -t);
}

/**
 * A ramp of colours from a to b, so a crossfade can pick a colour per frame
 * by index instead of building a string.
 */
export function ramp(a: string, b: string, steps = 32): string[] {
  const out: string[] = [];
  for (let i = 0; i <= steps; i++) out.push(mix(a, b, i / steps));
  return out;
}

let blankSprite: Sprite | null = null;

/** A 1×1 stand-in for a sprite not baked yet (nothing draws it before it is). */
export function blank(): Sprite {
  if (!blankSprite) blankSprite = bakeSprite(1, 1, 0, 0, () => undefined);
  return blankSprite;
}

/** A soft round glow: bright in the middle, gone at the edge. */
export function glowSprite(px: number, color: string, core = 0): Sprite {
  const S = Math.max(2, Math.ceil(px));
  return bakeSprite(S, S, S / 2, S / 2, (g) => {
    const r = S / 2;
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, rgba(color, 1));
    if (core > 0) gr.addColorStop(core, rgba(color, 0.55));
    gr.addColorStop(0.45, rgba(color, 0.22));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
  });
}
