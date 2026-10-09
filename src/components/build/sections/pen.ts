/**
 * Pen strokes for the sketch faces of the home's shoji browser: lines that
 * bow a little and boxes whose sides cross at the corners, the way a hand
 * draws a wireframe. Seeded, so the server draws the same sketch every time.
 * Coordinates are in the face's own viewBox units.
 */
import { seeded } from '@/components/brand/scenery';

export type Rnd = () => number;
export const pen = (seed: number): Rnd => seeded(seed);

const n = (v: number) => Math.round(v * 10) / 10;
const jitter = (rnd: Rnd, amp: number) => (rnd() - 0.5) * 2 * amp;

/** A pen line from (x1, y1) to (x2, y2), bowed by up to `bow`. */
export function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rnd: Rnd,
  bow = 2
): string {
  const mx = (x1 + x2) / 2 + jitter(rnd, bow);
  const my = (y1 + y2) / 2 + jitter(rnd, bow);
  return `M${n(x1)} ${n(y1)}Q${n(mx)} ${n(my)} ${n(x2)} ${n(y2)}`;
}

/** A box as four pen lines that overshoot the corners by `over`. */
export function box(
  x: number,
  y: number,
  w: number,
  h: number,
  rnd: Rnd,
  over = 4
): string {
  const j = () => jitter(rnd, 1.2);
  return (
    line(x - over, y + j(), x + w + over, y + j(), rnd) +
    line(x + w + j(), y - over, x + w + j(), y + h + over, rnd) +
    line(x + w + over, y + h + j(), x - over, y + h + j(), rnd) +
    line(x + j(), y + h + over, x + j(), y - over, rnd)
  );
}

/** The wireframe sign for "a picture goes here": a box with its diagonals. */
export function picture(
  x: number,
  y: number,
  w: number,
  h: number,
  rnd: Rnd
): string {
  return (
    box(x, y, w, h, rnd) +
    line(x, y, x + w, y + h, rnd, 3) +
    line(x + w, y, x, y + h, rnd, 3)
  );
}

/** A scribble standing in for a line of words: a loose wave. */
export function scribble(
  x: number,
  y: number,
  w: number,
  amp: number,
  rnd: Rnd,
  step = 16
): string {
  let d = `M${n(x)} ${n(y)}`;
  let up = true;
  for (let cx = x; cx < x + w - step / 2; cx += step) {
    const nx = Math.min(cx + step, x + w);
    const a = amp * (0.7 + rnd() * 0.5);
    d += `Q${n(cx + step / 2)} ${n(y + (up ? -a : a))} ${n(nx)} ${n(y + jitter(rnd, amp * 0.15))}`;
    up = !up;
  }
  return d;
}

/** A rounded pill outline (a button), drawn in one pass that overlaps its start. */
export function pill(
  x: number,
  y: number,
  w: number,
  h: number,
  rnd: Rnd
): string {
  const r = h / 2;
  const j = () => jitter(rnd, 1);
  return (
    `M${n(x + r - 3)} ${n(y + j())}` +
    `L${n(x + w - r)} ${n(y + j())}` +
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + w - r)} ${n(y + h + j())}` +
    `L${n(x + r)} ${n(y + h + j())}` +
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + r + 4)} ${n(y + j() - 1)}`
  );
}
