/**
 * The Broom & Blade Arcade's fixed scenery, worked out on the server: the
 * stair down from the neon market, where its torches hang, the bunting and
 * the bulbs strung under the beam, the signboard's marquee bulbs and the dust
 * in the torchlight. Nothing here reaches the browser as code, only the
 * numbers and paths it produces (like ../market.ts for the neon above).
 */

const r = (n: number) => Math.round(n * 10) / 10;

// ── The stair ───────────────────────────────────────────────────────────────
// A flight of stone steps going down a stairwell wall, drawn side on: a
// landing on the left where Kiru stands, then step after step down to the
// right until the hall's ceiling beam (drawn over the stair's foot) hides it.
// Two drawings, because a phone is tall and a desktop is wide: the same
// stair, steeper on the phone.

export interface Stair {
  /** The SVG's viewBox width and height; the drawing box keeps this ratio. */
  w: number;
  h: number;
  /** The top step's corner (the landing's edge), the step size and count. */
  x0: number;
  y0: number;
  run: number;
  rise: number;
  n: number;
  /** Torches on the wall, by their x; each hangs `torchUp` above its step. */
  torchX: number[];
  torchUp: number;
  /** Rope-rail posts, by their x. */
  postX: number[];
  /** Kiru's spot on the landing: centre x, feet y, width (viewBox units). */
  kiru: { x: number; w: number };
  /** The neon DOWNSTAIRS sign's box. */
  neon: { x: number; y: number; w: number; h: number };
}

export const STAIR_PHONE: Stair = {
  w: 400,
  h: 560,
  x0: 96,
  y0: 170,
  run: 36,
  rise: 34,
  n: 13,
  torchX: [196, 268, 340],
  torchUp: 112,
  postX: [110, 218, 326],
  kiru: { x: 50, w: 108 },
  neon: { x: 216, y: 22, w: 176, h: 84 },
};

export const STAIR_WIDE: Stair = {
  w: 1000,
  h: 500,
  x0: 196,
  y0: 158,
  run: 56,
  rise: 29,
  n: 13,
  torchX: [352, 516, 680, 844],
  torchUp: 120,
  postX: [214, 396, 578, 760, 942],
  kiru: { x: 104, w: 128 },
  neon: { x: 600, y: 22, w: 330, h: 104 },
};

/** The y of the tread under x (the step's top surface). */
export function treadY(s: Stair, x: number) {
  const i = Math.max(0, Math.min(s.n - 1, Math.floor((x - s.x0) / s.run)));
  return s.y0 + i * s.rise;
}

// Stone warms as the stair goes down: cool neon-lit slate at the top, torchlit
// sandstone at the foot. Linear in sRGB is plenty for a few steps.
const COOL = [58, 58, 86];
const WARM = [122, 86, 52];
const mix = (t: number) =>
  `rgb(${COOL.map((c, k) => Math.round(c + (WARM[k] - c) * t)).join(' ')})`;

export function stairArt(s: Stair) {
  const steps = Array.from({ length: s.n }, (_, i) => {
    const x = s.x0 + i * s.run;
    const y = s.y0 + i * s.rise;
    return { x, y, fill: mix(Math.min(1, i / (s.n - 3))) };
  });
  const endX = s.x0 + s.n * s.run;
  const endY = s.y0 + s.n * s.rise;
  // The solid stone: the landing, then the sawtooth of the treads, then down
  // and back under everything. Far past the box on the left and below it, so
  // a wide screen never sees an edge.
  let solid = `M-2000 ${s.y0}L${s.x0} ${s.y0}`;
  for (let i = 0; i < s.n; i++) {
    const x = s.x0 + (i + 1) * s.run;
    const y = s.y0 + i * s.rise;
    solid += `L${x} ${y}L${x} ${y + s.rise}`;
  }
  solid += `L${endX + 2000} ${endY}L${endX + 2000} ${s.h + 400}L-2000 ${s.h + 400}Z`;

  // Mortar under the steps: one course per riser, staggered joints.
  const mortar: string[] = [];
  for (let i = 0; i < s.n; i++) {
    const y = s.y0 + (i + 1) * s.rise;
    const x1 = s.x0 + (i + 1) * s.run;
    mortar.push(`M-2000 ${y}L${x1} ${y}`);
    const off = i % 2 ? s.run * 0.5 : 0;
    for (let x = x1 - s.run * 0.9 - off; x > -400; x -= s.run * 1.6) {
      mortar.push(`M${r(x)} ${y}L${r(x)} ${y + s.rise}`);
    }
  }
  // Under the landing, bigger blocks.
  for (let y = s.y0 + 46; y < s.h + 60; y += 46) mortar.push(`M-2000 ${y}L${s.x0 - 1} ${y}`);

  // The rope rail: gold rope swagged between posts that stand on the steps.
  const RAIL = s.rise * 1.9 + 8;
  const posts = s.postX.map((x) => ({ x, y: treadY(s, x), top: treadY(s, x) - RAIL }));
  let rope = '';
  for (let i = 0; i < posts.length - 1; i++) {
    const a = posts[i];
    const b = posts[i + 1];
    const mx = (a.x + b.x) / 2;
    const my = (a.top + b.top) / 2 + 22;
    rope += `M${a.x} ${a.top + 3}Q${mx} ${my + 14} ${b.x} ${b.top + 3}`;
  }
  // The rope runs on past the last post, down behind the beam.
  const last = posts[posts.length - 1];
  rope += `M${last.x} ${last.top + 3}Q${last.x + 60} ${last.top + 60} ${last.x + 120} ${last.top + 64}`;

  const torches = s.torchX.map((x) => ({ x, y: treadY(s, x) - s.torchUp }));
  return { steps, solid, mortar: mortar.join(''), posts, rope, torches, endX, endY };
}

// ── The festoon over the machines ───────────────────────────────────────────
// A string of warm bulbs with red and cream pennants between them, strung
// across the full width in swags (the cellar's answer to the paper lanterns
// above). A swag's sag is fixed in pixels, so an item's place is its x in
// percent and a y worked out from the curve: the string looks the same at any
// width, and no JavaScript measures anything. Two cuts: three swags on a wide
// screen, two on a phone.

export interface Hung {
  /** Left, in percent of the row's width. */
  x: number;
  /** Drop below the string's anchor, in px. */
  y: number;
  /** A small tilt along the string, in degrees. */
  tilt: number;
  kind: 'flag' | 'bulb';
  /** Pennant colour, or the bulb's twinkle group. */
  c: 'red' | 'cream' | 0 | 1;
  i: number;
}

function festoon(perSwag: number, swags: number, sag: number): Hung[] {
  const count = perSwag * swags;
  let flags = 0;
  let bulbs = 0;
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 0.5) / count;
    const u = (t * swags) % 1;
    const y = 4 * sag * u * (1 - u);
    const slope = (4 * sag * (1 - 2 * u)) / 10;
    const kind = i % 2 ? 'bulb' : 'flag';
    const c = kind === 'flag' ? (flags++ % 2 ? 'cream' : 'red') : ((bulbs++ % 2) as 0 | 1);
    return { x: r(t * 100), y: r(y), tilt: r(Math.max(-9, Math.min(9, slope))), kind, c, i };
  });
}

export const FESTOON_SAG = 46;
export const FESTOON_WIDE = festoon(14, 3, FESTOON_SAG);
export const FESTOON_PHONE = festoon(9, 2, FESTOON_SAG);
/** The wire for n swags, in a 100n × 2·sag box (preserveAspectRatio none). */
export const festoonWire = (swags: number) =>
  Array.from({ length: swags }, (_, k) => `${k ? '' : 'M0 0'}Q${k * 100 + 50} ${FESTOON_SAG * 2} ${(k + 1) * 100} 0`).join('');

// ── The awning under the beam ───────────────────────────────────────────────
// Red and cream stripes ending in scallops (the booths' awnings in the games),
// a bulb at the tip of every scallop. The pattern is centred on the room, so
// the bulbs are placed from the middle out in fixed steps.
export const SCALLOP = 46;
export const AWNING_BULBS = Array.from({ length: 44 }, (_, k) => ({ k: k - 22, g: k % 2 }));

// ── The signboard's marquee bulbs ──────────────────────────────────────────
// The board is drawn in its own viewBox (SIGN_VB): the board itself is
// 0..800 × 0..BOARD_H, the crest pokes up above it and the ribbon hangs below.
// Bulbs run round the board's rim and are placed as percentages of the
// viewBox, so they track the board at any size. They light in three groups
// that take turns: the chase.

export const SIGN_W = 800;
export const BOARD_H = 248;
export const SIGN_VB = { x: 0, y: -44, w: SIGN_W, h: 344 };
const RIM = 17; // bulb centre line, inset from the board's edge
const NOTCH = 30; // the board's cut corners

export function signBulbs() {
  const pts: { x: number; y: number }[] = [];
  const step = 31;
  const top = RIM;
  const bottom = BOARD_H - RIM;
  const left = RIM;
  const right = SIGN_W - RIM;
  const along = (x1: number, y1: number, x2: number, y2: number) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const k = Math.max(1, Math.round(len / step));
    for (let j = 0; j < k; j++) pts.push({ x: x1 + ((x2 - x1) * j) / k, y: y1 + ((y2 - y1) * j) / k });
  };
  // Clockwise from the top-left notch, skipping the cut corners.
  along(left + NOTCH, top, right - NOTCH, top);
  along(right, top + NOTCH, right, bottom - NOTCH);
  along(right - NOTCH, bottom, left + NOTCH, bottom);
  along(left, bottom - NOTCH, left, top + NOTCH);
  return pts
    .filter(
      (p) =>
        // not under the crest, the chains' eye-bolts or the ribbon
        !(p.y === top && (Math.abs(p.x - 400) < 50 || Math.abs(p.x - 220) < 13 || Math.abs(p.x - 580) < 13)) &&
        !(p.y === bottom && p.x > 140 && p.x < 660),
    )
    .map((p, i) => ({
      x: r(((p.x - SIGN_VB.x) / SIGN_VB.w) * 100),
      y: r(((p.y - SIGN_VB.y) / SIGN_VB.h) * 100),
      g: i % 3,
    }));
}

// ── Dust in the torchlight ─────────────────────────────────────────────────
// A fixed scatter (no Math.random: the server and the browser must agree, and
// the page must look the same every visit).
export const MOTES = Array.from({ length: 18 }, (_, i) => {
  const a = (i * 137.508) % 360; // golden angle: an even, unpatterned spread
  const d = 0.25 + ((i * 7919) % 100) / 140;
  return {
    x: r(50 + Math.cos((a * Math.PI) / 180) * d * 46),
    y: r(50 + Math.sin((a * Math.PI) / 180) * d * 40),
    s: r(1.6 + ((i * 31) % 7) * 0.32),
    dur: r(11 + ((i * 53) % 9)),
    delay: r(-((i * 2.7) % 14)),
    dx: r((((i * 97) % 21) - 10) * 2.2),
    dy: r(-18 - ((i * 13) % 16) * 2),
  };
});
