/**
 * Build Games — the header's tiny level editor and runner. Canvas 2D, no
 * libraries, no React: LevelToy.tsx owns the buttons and the words, this
 * owns the pixels.
 *
 * The craft rules are the pixel-art skill's (fixed palette, low logical
 * resolution, integer scale, procedural sprites with a 1px outline and a rim
 * light, pooled particles, a fixed 60 Hz step):
 *
 * - Everything is drawn as palette INDICES into a Uint8Array and mapped
 *   through a lookup table into one ImageData per frame. The canvas's backing
 *   store IS the logical resolution (about 180×100), whatever the screen's
 *   pixel ratio; CSS scales it up by a whole number of device pixels with
 *   `image-rendering: pixelated`, so the compositor does the enlarging and
 *   the main thread only ever pushes ~18k pixels.
 * - The level is 16×9 tiles of 10px. The viewport is a little bigger than
 *   the level (whatever the integer scale leaves over), and the margins are
 *   more sky and more town, so the picture fills its box edge to edge.
 * - The sky, moon and far town are baked once per size; the buildings are
 *   baked on top whenever the level changes. Per frame there is one copy of
 *   that, then the few moving things, then the LUT pass.
 * - Zero allocation in the loop: typed arrays for the particles, the trace
 *   and the sprite; events to React only on state changes, never per frame.
 * - The loop runs only while the cabinet is on screen and the tab is
 *   visible, and only renders when something moved. Reduced motion never
 *   starts it: the level is drawn once, edits redraw once, and Play draws
 *   Kiru's whole run as a dotted path in a single still frame.
 *
 * The physics, the demo AI and the level live in plain functions over plain
 * data, so `simulate()` can run a level headless (it is what draws the
 * reduced-motion path, and it is how the demo level was checked).
 */

// ── The level ───────────────────────────────────────────────────────────────
export const COLS = 16;
export const ROWS = 9;
export const T = 10; // tile size, logical px
export const LW = COLS * T; // 160
export const LH = ROWS * T; // 90
export const MAXH = 6; // tallest roof, in tiles: three rows of sky stay clear
export const MAX_LANTERNS = 8;
const GOAL_MIN = 3; // the gate needs a run-up

export interface Level {
  /** Roof height per column, in tiles. 0 is a gap. */
  h: Uint8Array;
  /** 1 where a lantern hangs, row-major (row * COLS + col). */
  lan: Uint8Array;
  /** The column the gate (the goal) stands on. */
  goal: number;
}

// The demo levels Kiru runs before anyone touches the toy. Between runs an
// invisible builder turns one into the next, so the header shows the whole
// idea on its own: build a level, then play it. Each one is checked by
// simulate(): the demo brain clears it with all three lanterns.
//  A: a run-up, a two-tile gap up to a higher roof, a step down, a one-tile
//     gap, a two-tile climb, a last gap down to the gate's roof by the moon.
//  B: a climb, a wide gap to a tall roof, steps down, a lantern pair, a climb.
//  C: low and long, a three-roof bridge, a double gap; the gate moves in one.
const DEMOS: { h: number[]; lan: number[][]; goal: number }[] = [
  {
    h: [2, 2, 2, 0, 0, 3, 3, 2, 0, 2, 2, 4, 4, 0, 3, 3],
    lan: [
      [3, 3],
      [8, 4],
      [13, 2],
    ],
    goal: 15,
  },
  {
    h: [2, 2, 2, 3, 3, 0, 0, 4, 4, 3, 2, 0, 3, 4, 4, 4],
    lan: [
      [5, 3],
      [10, 5],
      [11, 4],
    ],
    goal: 15,
  },
  {
    h: [1, 1, 2, 2, 0, 2, 3, 3, 3, 0, 0, 3, 2, 2, 2, 2],
    lan: [
      [4, 5],
      [9, 3],
      [12, 4],
    ],
    goal: 14,
  },
];
const DEMO_GOAL = 15;

export function newLevel(): Level {
  return {
    h: new Uint8Array(COLS),
    lan: new Uint8Array(COLS * ROWS),
    goal: DEMO_GOAL,
  };
}
export function demoLevel(into: Level = newLevel(), i = 0): Level {
  const D = DEMOS[i];
  for (let c = 0; c < COLS; c++) into.h[c] = D.h[c];
  into.lan.fill(0);
  for (const [c, r] of D.lan) into.lan[r * COLS + c] = 1;
  into.goal = D.goal;
  return into;
}
export const DEMO_COUNT = DEMOS.length;
function lanternCount(L: Level): number {
  let n = 0;
  for (let i = 0; i < L.lan.length; i++) n += L.lan[i];
  return n;
}

// ── Physics (level px, y down; a roof of height h tops out at LH - h*T) ─────
const RUN = 50; // px/s, always to the right
const JUMP_V = 152;
const G = 900;
const G_HOLD = 430; // while rising with the button held
const HOLD_MAX = 0.3;
const CUT_V = 70; // letting go early caps the rise at this speed
const MAX_FALL = 240;
const COYOTE = 0.08; // a jump still counts just after the edge
const BUFFER = 0.12; // a press just before landing still counts
const HW = 3; // half the width of Kiru's feet
const KH = 15; // his height, for lanterns
const DT = 1 / 60;
const NONE = 1e9; // the "roof top" of a gap
const STUCK_S = 1.1;

interface Body {
  x: number;
  y: number;
  vy: number;
  ground: boolean;
  coyote: number;
  buffer: number;
  hold: boolean;
  holdT: number;
  blocked: boolean;
  blockedT: number;
}
function newBody(): Body {
  return {
    x: 0,
    y: 0,
    vy: 0,
    ground: true,
    coyote: 0,
    buffer: 0,
    hold: false,
    holdT: 0,
    blocked: false,
    blockedT: 0,
  };
}
function colOf(x: number): number {
  const c = Math.floor(x / T);
  return c < -1 ? -1 : c > COLS ? COLS : c;
}
/** The roof top of column c (the margins repeat the end columns). */
function topOf(L: Level, c: number): number {
  const h = L.h[c < 0 ? 0 : c >= COLS ? COLS - 1 : c];
  return h > 0 ? LH - h * T : NONE;
}
function groundAt(L: Level, x: number): number {
  const a = topOf(L, colOf(x - HW));
  const b = topOf(L, colOf(x + HW - 0.001));
  return a < b ? a : b;
}
function placeAtStart(b: Body, L: Level) {
  b.x = 4;
  b.y = topOf(L, 0);
  b.vy = 0;
  b.ground = true;
  b.coyote = 0;
  b.buffer = 0;
  b.hold = false;
  b.holdT = 0;
  b.blocked = false;
  b.blockedT = 0;
}
function press(b: Body) {
  b.buffer = BUFFER;
  b.hold = true;
}
function release(b: Body) {
  b.hold = false;
  if (b.vy < -CUT_V) b.vy = -CUT_V;
}

const F_JUMP = 1;
const F_LAND = 2;
/** One fixed step. Returns F_* flags. */
function stepBody(b: Body, L: Level): number {
  let flags = 0;
  if (b.buffer > 0) {
    if (b.ground || b.coyote > 0) {
      b.vy = -JUMP_V;
      b.ground = false;
      b.coyote = 0;
      b.buffer = 0;
      b.holdT = 0;
      flags |= F_JUMP;
    } else b.buffer -= DT;
  }
  // Across: entering a column whose roof is above the feet is a wall.
  let nx = b.x + RUN * DT;
  const from = colOf(b.x + HW - 0.001);
  const to = colOf(nx + HW - 0.001);
  b.blocked = false;
  if (to !== from && topOf(L, to) < b.y - 0.5) {
    nx = to * T - HW;
    b.blocked = true;
  }
  b.x = nx;
  b.blockedT = b.blocked ? b.blockedT + DT : 0;
  // Down.
  const rising = b.vy < 0;
  const g = rising && b.hold && b.holdT < HOLD_MAX ? G_HOLD : G;
  if (rising && b.hold) b.holdT += DT;
  b.vy = Math.min(MAX_FALL, b.vy + g * DT);
  const prevY = b.y;
  b.y += b.vy * DT;
  const gy = groundAt(L, b.x);
  if (b.vy >= 0 && b.y >= gy && prevY <= gy + 0.01) {
    if (!b.ground) flags |= F_LAND;
    b.y = gy;
    b.vy = 0;
    b.ground = true;
  } else if (b.ground) {
    b.ground = false;
    b.coyote = rising ? 0 : COYOTE;
  } else if (b.coyote > 0) b.coyote -= DT;
  return flags;
}

/** The demo's (and the still trace's) jump brain: how long to hold, or 0. */
function aiDecide(b: Body, L: Level, got: Uint8Array): number {
  const lead = b.x + HW;
  const cur = groundAt(L, b.x);
  const c0 = colOf(lead - 0.001);
  // From the column under his leading foot: after a step down he can land
  // with that foot already over the next gap.
  for (let c = c0; c <= c0 + 3 && c <= COLS; c++) {
    const top = topOf(L, c);
    if (top === cur) continue;
    const d = c * T - lead; // < 0 once the leading foot is past the edge
    if (top === NONE) {
      let e = c;
      while (e < COLS && topOf(L, e) === NONE) e++;
      const up = cur - topOf(L, e);
      // Take off with the back foot still on the roof: the most reach.
      if (d <= 1 - 2 * HW) return (e - c) * T >= 20 || up > 0 ? HOLD_MAX : 0.15;
      return 0;
    }
    if (top < cur) {
      const rise = cur - top;
      if (d <= (rise > 10 ? 12 : 6)) return rise > 10 ? HOLD_MAX : 0.16;
      return 0;
    }
    break; // a step down needs nothing
  }
  // Nothing in the way: go for a lantern overhead, if the landing is a roof.
  if (groundAt(L, b.x + 28) === NONE) return 0;
  for (let c = Math.max(0, c0); c <= c0 + 2 && c < COLS; c++) {
    for (let r = 0; r < ROWS; r++) {
      const i = r * COLS + c;
      if (!L.lan[i] || got[i]) continue;
      const dx = c * T + 5 - b.x;
      const up = b.y - (r * T + 5);
      if (up > KH - 3 && up < 34 && dx > 7 && dx < 15)
        return up > 22 ? HOLD_MAX : 0.12;
    }
  }
  return 0;
}

/** Index of a lantern Kiru touches this step (marked in `got`), or -1. */
function collect(L: Level, got: Uint8Array, b: Body): number {
  const c0 = Math.max(0, colOf(b.x - HW - 3));
  const c1 = Math.min(COLS - 1, colOf(b.x + HW + 3));
  for (let c = c0; c <= c1; c++) {
    for (let r = 0; r < ROWS; r++) {
      const i = r * COLS + c;
      if (!L.lan[i] || got[i]) continue;
      const lx = c * T + 5;
      const ly = r * T + 5;
      if (Math.abs(lx - b.x) <= HW + 2 && ly >= b.y - KH - 3 && ly <= b.y + 3) {
        got[i] = 1;
        return i;
      }
    }
  }
  return -1;
}
const goalX = (L: Level) => L.goal * T + 5;
/** At the gate: his hood touches its near pillar, his feet at its roof's height. */
const reached = (b: Body, L: Level) =>
  b.x >= goalX(L) - 8 && b.y <= topOf(L, L.goal) + 0.5;
/** Where he stands to celebrate: on the gate's top beam. */
const perchY = (L: Level) => topOf(L, L.goal) - 14;

// ── Headless run ────────────────────────────────────────────────────────────
export const R_CLEAR = 1;
export const R_FELL = 2;
export const R_STUCK = 3;
export interface Trace {
  /** Points recorded (every 3rd step). */
  n: number;
  xs: Float32Array;
  ys: Float32Array;
  result: number;
  /** The column where the run ended. */
  at: number;
  got: number;
  total: number;
}
export function newTrace(): Trace {
  return {
    n: 0,
    xs: new Float32Array(800),
    ys: new Float32Array(800),
    result: 0,
    at: 0,
    got: 0,
    total: 0,
  };
}
/**
 * Run a level headless and record the path. The demo brain goes first (it
 * likes lanterns); if it doesn't make it, a search over every jump timing
 * looks for any run that does, so "Kiru falls here" only ever means the
 * level can't be cleared, not that the brain missed a hop.
 */
export function simulate(
  L: Level,
  out: Trace = newTrace(),
  body: Body = newBody(),
  got = new Uint8Array(COLS * ROWS)
): Trace {
  run(L, out, body, got, false);
  if (out.result !== R_CLEAR && solve(L)) run(L, out, body, got, true);
  return out;
}

// The solver's answer: jumps as (step it starts on, steps held) pairs.
const PLAN = new Int16Array(512);
let planN = 0;

/** One run, its jumps from the demo brain or from PLAN. */
function run(
  L: Level,
  out: Trace,
  body: Body,
  got: Uint8Array,
  usePlan: boolean
) {
  got.fill(0);
  placeAtStart(body, L);
  out.n = 0;
  out.result = 0;
  out.got = 0;
  out.total = lanternCount(L);
  let holdLeft = 0;
  let p = 0;
  let held = 0;
  let holdFor = 0;
  for (let i = 0; i < 60 * 30; i++) {
    if (usePlan) {
      if (p < planN && PLAN[p * 2] === i) {
        press(body);
        holdFor = PLAN[p * 2 + 1];
        held = 0;
        p++;
      }
      if (body.hold && held >= holdFor) release(body);
      held++;
    } else if (body.hold) {
      holdLeft -= DT;
      if (holdLeft <= 0) release(body);
    } else if (body.ground) {
      const h = aiDecide(body, L, got);
      if (h > 0) {
        press(body);
        holdLeft = h;
      }
    }
    stepBody(body, L);
    if (collect(L, got, body) >= 0) out.got++;
    if (i % 3 === 0 && out.n < out.xs.length) {
      out.xs[out.n] = body.x;
      out.ys[out.n] = body.y;
      out.n++;
    }
    if (reached(body, L)) out.result = R_CLEAR;
    else if (body.y > LH + 20) out.result = R_FELL;
    else if (body.blockedT > STUCK_S) out.result = R_STUCK;
    if (out.result) break;
  }
  if (!out.result) out.result = R_STUCK;
  out.at = Math.max(0, Math.min(COLS - 1, colOf(body.x)));
}

// The search: depth-first over the moments he is on a roof, trying to run on
// a little or to jump with one of a few hold lengths; each spot on a roof is
// tried once. Everything it needs is allocated once, here.
const HOLDS = [0, 3, 7, 11, 18]; // steps held; 0 = run on
const DEPTH = 240;
const POOL: Body[] = Array.from({ length: DEPTH + 1 }, newBody);
const D_STEP = new Int16Array(DEPTH);
const D_HOLD = new Int16Array(DEPTH);
const SEEN = new Uint8Array(420 * 160);
function copyBody(d: Body, s: Body) {
  d.x = s.x;
  d.y = s.y;
  d.vy = s.vy;
  d.ground = s.ground;
  d.coyote = s.coyote;
  d.buffer = s.buffer;
  d.hold = s.hold;
  d.holdT = s.holdT;
  d.blocked = s.blocked;
  d.blockedT = s.blockedT;
}
function solve(L: Level): boolean {
  SEEN.fill(0);
  planN = 0;
  placeAtStart(POOL[0], L);
  return dfs(L, 0, 0);
}
function dfs(L: Level, depth: number, step: number): boolean {
  if (depth >= DEPTH) return false;
  const s = POOL[depth];
  const key = (Math.round(s.x * 2) + 40) * 160 + Math.round(s.y) + 40;
  if (key < 0 || key >= SEEN.length || SEEN[key]) return false;
  SEEN[key] = 1;
  for (let o = 0; o < HOLDS.length; o++) {
    const hold = HOLDS[o];
    const c = POOL[depth + 1];
    copyBody(c, s);
    if (hold) press(c);
    let t = 0;
    let alive = true;
    for (;;) {
      if (c.hold && t >= hold) release(c);
      stepBody(c, L);
      t++;
      if (reached(c, L)) {
        D_STEP[depth] = step;
        D_HOLD[depth] = Math.min(hold, t);
        planN = 0;
        for (let k = 0; k <= depth; k++) {
          if (!D_HOLD[k]) continue;
          PLAN[planN * 2] = D_STEP[k];
          PLAN[planN * 2 + 1] = D_HOLD[k];
          planN++;
        }
        return true;
      }
      if (c.y > LH + 20 || c.blockedT > STUCK_S || step + t > 60 * 30) {
        alive = false;
        break;
      }
      // The next decision: back on a roof, after the jump or a few steps.
      if (c.ground && t >= (hold ? 2 : 3)) break;
    }
    if (!alive) continue;
    if (c.hold) release(c);
    D_STEP[depth] = step;
    D_HOLD[depth] = Math.min(hold, t);
    if (dfs(L, depth + 1, step + t)) return true;
  }
  return false;
}

// ── Palette ─────────────────────────────────────────────────────────────────
// The site's night: sumi navy, ai-iro indigo, vermilion, gold, moon cream.
// Indices, by role. Backgrounds are low-saturation; the accents (vermilion,
// gold, sakura) are used by nothing in the sky.
const PAL = [
  '#04050c', //  0 OUT       outline / void
  '#080a18', //  1 SKY0      top of the sky
  '#0b0e20', //  2 SKY1
  '#0f132b', //  3 SKY2
  '#141a38', //  4 SKY3
  '#1a2147', //  5 SKY4      just above the town
  '#222a57', //  6 HAZE      mist, the far mountain
  '#0d1126', //  7 TOWN      far town silhouette
  '#1f2754', //  8 TOWN_RIM
  '#4d5588', //  9 STAR_DIM
  '#dde2fb', // 10 STAR
  '#1c2350', // 11 HALO      moon halo
  '#e6d3a3', // 12 MOON_SHADE
  '#fff3d6', // 13 MOON
  '#d4bf8c', // 14 CRATER
  '#8a93b8', // 15 RIDGE     moonlit ridge tiles (kawara are silver-grey)
  '#4b5274', // 16 TILE_LIT
  '#373d5a', // 17 TILE
  '#22263d', // 18 EAVE
  '#1d1f35', // 19 WALL      dark wood
  '#121325', // 20 BEAM
  '#2c2f4f', // 21 WALL_LIT  the side facing the moon
  '#b9862a', // 22 WIN       lit window
  '#ffcf70', // 23 WIN_CORE  gold
  '#0e0f1f', // 24 WIN_DARK
  '#a8281a', // 25 RED_DARK
  '#e2412a', // 26 RED       vermilion
  '#ff6a48', // 27 RED_LIT
  '#ffe7ad', // 28 GOLD_LIGHT
  '#171c3a', // 29 HOOD_DARK Kiru's hood and gi
  '#252d56', // 30 HOOD
  '#34417c', // 31 HOOD_LIT
  '#6274c0', // 32 RIM       moonlight on his edges
  '#f6d0a8', // 33 SKIN
  '#dba67a', // 34 SKIN_SHADE
  '#cfd5e2', // 35 STEEL     the plate on his headband
  '#13152a', // 36 INK
  '#ffffff', // 37 WHITE
  '#bd3019', // 38 BAND_DARK
  '#ffd9e3', // 39 SAKURA_LIGHT
  '#f7a9bc', // 40 SAKURA
  '#d97b99', // 41 SAKURA_DEEP
  '#6a3f63', // 42 SAKURA_DUSK
  '#c9cee6', // 43 PUFF_LIGHT
  '#7b82a8', // 44 PUFF
  '#3a4170', // 45 PUFF_DARK
  '#313b74', // 46 GRID      build-mode dots
  '#33243e', // 47 GLOW      lantern light, dithered over sky
  '#f08a78', // 48 BLUSH
  '#c8962e', // 49 GOLD
  '#5e4826', // 50 WIN_FAR   far town windows
  '#2d3770', // 51 SNOW      the far mountain's cap
];
const OUT = 0;
const SKY0 = 1;
const HAZE = 6;
const TOWN = 7;
const TOWN_RIM = 8;
const STAR_DIM = 9;
const STAR = 10;
const HALO = 11;
const MOON_SHADE = 12;
const MOON = 13;
const CRATER = 14;
const RIDGE = 15;
const TILE_LIT = 16;
const TILE = 17;
const EAVE = 18;
const WALL = 19;
const BEAM = 20;
const WALL_LIT = 21;
const WIN = 22;
const WIN_CORE = 23;
const WIN_DARK = 24;
const RED_DARK = 25;
const RED = 26;
const RED_LIT = 27;
const GOLD_LIGHT = 28;
const HOOD_DARK = 29;
const HOOD = 30;
const HOOD_LIT = 31;
const RIM = 32;
const SKIN = 33;
const SKIN_SHADE = 34;
const STEEL = 35;
const INK = 36;
const WHITE = 37;
const BAND_DARK = 38;
const SAKURA_LIGHT = 39;
const SAKURA = 40;
const SAKURA_DEEP = 41;
const SAKURA_DUSK = 42;
const PUFF_LIGHT = 43;
const PUFF = 44;
const PUFF_DARK = 45;
const GRID = 46;
const GLOW = 47;
const BLUSH = 48;
const GOLD = 49;
const WIN_FAR = 50;
const SNOW = 51;

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
// How far each row of a roof steps in from an open end: ridge to eave.
const ROOF_INSET = new Int8Array([2, 1, 0, -1, -1]);
const EMPTY = 255;

// Moonlight on Kiru's edges, by material: navy lifts a step, the band
// brightens, skin and steel keep their colour.
const RIM_OF = new Uint8Array(PAL.length);
for (let i = 0; i < PAL.length; i++) RIM_OF[i] = i;
RIM_OF[HOOD_DARK] = HOOD;
RIM_OF[HOOD] = HOOD_LIT;
RIM_OF[HOOD_LIT] = RIM;
RIM_OF[RED] = RED_LIT;
RIM_OF[BAND_DARK] = RED;

// Where a lantern's glow may fall: the sky and what's far away in it.
const SKYISH = new Uint8Array(PAL.length);
for (const i of [
  1,
  2,
  3,
  4,
  5,
  HAZE,
  TOWN,
  TOWN_RIM,
  STAR_DIM,
  STAR,
  HALO,
  SNOW,
  WIN_FAR,
  GRID,
])
  SKYISH[i] = 1;

// Particle ramps, five steps each: bright → accent → dark → gone.
const RAMPS = new Uint8Array([
  WHITE,
  SAKURA_LIGHT,
  SAKURA,
  SAKURA_DEEP,
  SAKURA_DUSK, // 0 sakura
  WHITE,
  WIN_CORE,
  RED_LIT,
  RED,
  RED_DARK, //               1 lantern pop
  PUFF_LIGHT,
  PUFF_LIGHT,
  PUFF,
  PUFF_DARK,
  PUFF_DARK, //    2 puff
  WHITE,
  GOLD_LIGHT,
  WIN_CORE,
  GOLD,
  WIN, //                3 gold
]);
const RP_SAKURA = 0;
const RP_LANTERN = 1;
const RP_PUFF = 2;
const RP_GOLD = 3;
const K_FALL = 0; // particle kinds: falls under gravity
const K_PETAL = 1; //               drifts and sways
const K_PUFF = 2; //                hangs and rises a little

// The lantern's glow ring, as offsets (dithered: every other pixel).
const HALO_OFF: number[] = [];
for (let dy = -6; dy <= 6; dy++)
  for (let dx = -5; dx <= 5; dx++) {
    const d2 = dx * dx + dy * dy * 0.8;
    if (d2 >= 8 && d2 <= 27 && ((dx + dy) & 1) === 0) HALO_OFF.push(dx, dy);
  }
const HALO_XY = new Int8Array(HALO_OFF);

// Lantern: 5×7, around its centre.
const LANTERN_ART = [
  '.ggg.',
  'RrrrR',
  'RrYrR',
  'RrYrR',
  'RrrrR',
  '.RRR.',
  '..g..',
];
const LANTERN_MAP: Record<string, number> = {
  g: GOLD,
  R: RED_DARK,
  r: RED,
  Y: WIN_CORE,
};
const LANTERN_PX = bakeArt(LANTERN_ART, LANTERN_MAP);

// The gate: 17×15, its feet on the roof, centred on the column.
const TORII_ART = [
  'k...............k',
  'kkkkkkkkkkkkkkkkk',
  '.KKKKKKKKKKKKKKK.',
  '..DRRRRRRRRRRRL..',
  '...DR...g...RL...',
  'DRRRRRRRRRRRRRRRL',
  '...DR.......RL...',
  '...DR.......RL...',
  '...DR.......RL...',
  '...DR.......RL...',
  '...DR.......RL...',
  '...DR.......RL...',
  '...DR.......RL...',
  '...DR.......RL...',
  '..kkkk.....kkkk..',
];
const TORII_MAP: Record<string, number> = {
  k: INK,
  K: TILE_LIT,
  D: RED_DARK,
  R: RED,
  L: RED_LIT,
  g: GOLD,
};
const TORII_PX = bakeArt(TORII_ART, TORII_MAP);
const TORII_W = 17;
const TORII_H = 15;

/** A tiny bitmap → [x, y, colour, ...] triples, built once. */
function bakeArt(rows: string[], map: Record<string, number>): Int16Array {
  const out: number[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = map[row[x]];
      if (c !== undefined) out.push(x, y, c);
    }
  });
  return new Int16Array(out);
}

/** Seeded PRNG (mulberry32), so the town is the same every visit. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const easeOutBack = (t: number) => {
  const u = t - 1;
  return 1 + 2.4 * u * u * u + 1.4 * u * u;
};
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);

// ── The game ────────────────────────────────────────────────────────────────
export type Mode = 'attract' | 'build' | 'play';
export type Brush = 'roof' | 'lantern' | 'goal';
export type Refusal = 'start' | 'goal-gap' | 'goal-near' | 'inside' | 'full';
export type GameEvent =
  | { type: 'mode'; mode: Mode }
  | { type: 'ready' } // first frame drawn
  | { type: 'motion'; reduced: boolean }
  | { type: 'brush'; brush: Brush } // picked from the keyboard
  | { type: 'lanterns'; got: number; total: number }
  | { type: 'fall' }
  | { type: 'blocked' } // a wall too tall to jump
  | { type: 'clear'; edited: boolean; got: number; total: number }
  | { type: 'again' } // after a clear, a jump now replays
  | { type: 'run' } // a fresh run started while playing
  | { type: 'edit'; text: string }
  | { type: 'refuse'; why: Refusal }
  | { type: 'cursor'; text: string }
  | {
      type: 'trace';
      result: number;
      at: number;
      got: number;
      total: number;
      edited: boolean;
    };

export interface Game {
  play(): void;
  build(): void;
  brush(b: Brush): void;
  reset(): void;
  jumpDown(): void;
  jumpUp(): void;
  focus(): void;
  destroy(): void;
}

// Kiru states.
const S_HIDDEN = 0;
const S_STAND = 1;
const S_RUN = 2;
const S_GONE = 3; // fell; waiting to respawn
const S_CHEER = 4;
const S_DROP = 5; // dropping in at the start

// Sprite buffer: Kiru is ~13×16; tails and hands need room.
const SW = 24;
const SH = 24;
const SCX = 14; // his feet centre, in the buffer
const SGY = 21; // the row his soles are on
const LEAP = 0.42; // seconds from the gate's foot to its top beam

export function createGame(
  canvas: HTMLCanvasElement,
  opts: { reduced: boolean; onEvent: (e: GameEvent) => void }
): Game {
  const ctx = canvas.getContext('2d', { alpha: false });
  const emit = opts.onEvent;
  let reduced = opts.reduced;
  const box = canvas.parentElement as HTMLElement;

  // ── State ──
  const L = demoLevel();
  let edited = false;
  let mode: Mode = reduced ? 'build' : 'attract';
  let brush: Brush = 'roof';
  const body = newBody();
  const got = new Uint8Array(COLS * ROWS);
  let gotN = 0;
  let total = lanternCount(L);
  let kState = reduced ? S_STAND : S_HIDDEN;
  let kT = 0; // time in state
  let aiHold = 0;
  let againSent = false;
  let blockedSent = false;
  let landSquash = 0;
  let cheered = false;
  let leapX = 0;
  let leapY = 0;
  let runPhase = 0;

  // Display heights (px) per column, eased toward the level's.
  const disp = new Float32Array(COLS);
  const from = new Float32Array(COLS);
  const anim = new Float32Array(COLS).fill(1); // 0→1, 1 = settled
  let animating = false;
  // The intro: the skyline builds itself, then the gate, the lanterns, Kiru.
  let intro = reduced ? -1 : 0;
  let toriiDrop = 0;
  let lanternShow = reduced ? 99 : 0; // how many lanterns are visible
  let flash = 0;
  let toriiGlow = 0;

  // The demo's builder: which demo level, and its turn into the next.
  let demoIdx = 0;
  let morphT = -1;
  let morphStep = 0;
  let morphN = 0;
  let morphSwapped = false;
  const morphCols = new Int8Array(COLS);
  let ghostC = 0;
  let ghostR = 0;
  let ghostT = 0;

  // Cursor (build mode).
  let curC = 4;
  let curR = 4;
  let curOn = false; // shown at all
  let curKeys = false; // placed by keyboard (stays until blur)
  let curT = 0;

  // Reduced-motion trace.
  const trace = newTrace();
  let traceOn = false;
  const traceBody = newBody();
  const traceGot = new Uint8Array(COLS * ROWS);

  // ── Buffers (sized on resize) ──
  let VW = 0;
  let VH = 0;
  let OX = 0;
  let OY = 0;
  let N = 0;
  let img: ImageData | null = null;
  let pix = new Uint32Array(0);
  let fb = new Uint8Array(0);
  let bg = new Uint8Array(0);
  let scene = new Uint8Array(0);
  const twinkle = new Int16Array(16); // x, y pairs for 8 twinkling stars
  const lut = new Uint32Array(PAL.length);
  const flashLut = new Uint32Array(PAL.length);
  for (let i = 0; i < PAL.length; i++) {
    const h = parseInt(PAL[i].slice(1), 16);
    lut[i] =
      (0xff000000 | ((h & 0xff) << 16) | (h & 0xff00) | ((h >> 16) & 0xff)) >>>
      0;
  }
  flashLut.set(lut);
  for (let i = 1; i <= 5; i++) flashLut[i] = lut[i + 1]; // one-frame sky lift
  flashLut[HAZE] = lut[SNOW];
  flashLut[HALO] = lut[HAZE];

  const spr = new Uint8Array(SW * SH);

  // ── Particles ──
  const MAXP = 200;
  const pOn = new Uint8Array(MAXP);
  const pRamp = new Uint8Array(MAXP);
  const pKind = new Uint8Array(MAXP);
  const pX = new Float32Array(MAXP);
  const pY = new Float32Array(MAXP);
  const pVX = new Float32Array(MAXP);
  const pVY = new Float32Array(MAXP);
  const pAge = new Float32Array(MAXP);
  const pLife = new Float32Array(MAXP);
  const pSeed = new Float32Array(MAXP);
  let pCursor = 0;
  let pAlive = 0;
  const rnd = seeded(20261008);

  function spawn(
    ramp: number,
    kind: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number
  ) {
    for (let n = 0; n < MAXP; n++) {
      const k = pCursor;
      pCursor = (pCursor + 1) % MAXP;
      if (pOn[k]) continue;
      pOn[k] = 1;
      pRamp[k] = ramp;
      pKind[k] = kind;
      pX[k] = x;
      pY[k] = y;
      pVX[k] = vx;
      pVY[k] = vy;
      pAge[k] = 0;
      pLife[k] = life;
      pSeed[k] = rnd() * 6.28;
      pAlive++;
      return;
    }
  }
  function burst(
    ramp: number,
    kind: number,
    x: number,
    y: number,
    n: number,
    sMin: number,
    sMax: number,
    up: number,
    lMin: number,
    lMax: number
  ) {
    if (reduced) return;
    for (let i = 0; i < n; i++) {
      const a = rnd() * Math.PI * 2;
      const s = sMin + rnd() * (sMax - sMin);
      spawn(
        ramp,
        kind,
        x,
        y,
        Math.cos(a) * s,
        Math.sin(a) * s * 0.8 - up,
        lMin + rnd() * (lMax - lMin)
      );
    }
  }
  function puff(x: number, y: number, n: number) {
    burst(RP_PUFF, K_PUFF, x, y, n, 6, 22, 6, 0.3, 0.55);
  }
  function updateParticles() {
    if (!pAlive) return;
    for (let k = 0; k < MAXP; k++) {
      if (!pOn[k]) continue;
      pAge[k] += DT;
      if (pAge[k] >= pLife[k]) {
        pOn[k] = 0;
        pAlive--;
        continue;
      }
      const kind = pKind[k];
      if (kind === K_PETAL) {
        pVX[k] = pVX[k] * 0.985 + Math.sin(pAge[k] * 5 + pSeed[k]) * 1.6;
        pVY[k] = Math.min(26, pVY[k] * 0.985 + 24 * DT);
      } else if (kind === K_PUFF) {
        pVX[k] *= 0.9;
        pVY[k] = pVY[k] * 0.9 - 4 * DT;
      } else {
        pVX[k] *= 0.97;
        pVY[k] += 170 * DT;
      }
      pX[k] += pVX[k] * DT;
      pY[k] += pVY[k] * DT;
    }
  }

  // ── Sizing ──
  // The integer scale S (device px per logical px) is the largest that fits
  // the level; the viewport then takes every whole logical px the box has.
  function resize() {
    const r = box.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    const dpr = window.devicePixelRatio || 1;
    const bw = r.width * dpr;
    const bh = r.height * dpr;
    // At least 4px of town either side: the gate is wider than its column.
    const S = Math.floor(Math.min(bw / (LW + 8), bh / LH));
    let nw: number;
    let nh: number;
    if (S >= 2) {
      nw = Math.floor(bw / S);
      nh = Math.floor(bh / S);
      canvas.style.width = `${(nw * S) / dpr}px`;
      canvas.style.height = `${(nh * S) / dpr}px`;
    } else {
      // A box too small for 2× (a narrow window on a 1× screen): fill it
      // and let the pixels be a little uneven, rather than shrink the level.
      nw = LW + 8;
      nh = Math.max(LH, Math.round((nw * r.height) / r.width));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
    }
    if (nw === VW && nh === VH) return;
    VW = nw;
    VH = nh;
    OX = (VW - LW) >> 1;
    OY = VH - LH;
    N = VW * VH;
    canvas.width = VW;
    canvas.height = VH;
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      img = ctx.createImageData(VW, VH);
      pix = new Uint32Array(img.data.buffer);
    }
    fb = new Uint8Array(N);
    bg = new Uint8Array(N);
    scene = new Uint8Array(N);
    bakeBg();
    bakeScene();
    dirty = true;
    if (reduced || !raf) draw();
  }

  // ── The sky, the moon, the far town (baked per size) ──
  function bakeBg() {
    const horizon = VH - 22;
    const at = (x: number, y: number, c: number) => {
      if (x >= 0 && y >= 0 && x < VW && y < VH) bg[y * VW + x] = c;
    };
    for (let y = 0; y < VH; y++) {
      const f = Math.min(4, Math.max(0, (y / horizon) * 4.3));
      const b0 = f | 0;
      const thr = (f - b0) * 16;
      for (let x = 0; x < VW; x++) {
        bg[y * VW + x] =
          SKY0 + b0 + (b0 < 4 && thr > BAYER[((y & 3) << 2) | (x & 3)] ? 1 : 0);
      }
    }
    const R = seeded(7);
    // Moon, up and to the right, with a dithered halo.
    const mx = VW - 31;
    const my = 16;
    const mr = 8;
    for (let dy = -mr - 6; dy <= mr + 6; dy++)
      for (let dx = -mr - 6; dx <= mr + 6; dx++) {
        const x = mx + dx;
        const y = my + dy;
        if (x < 0 || y < 0 || x >= VW || y >= VH) continue;
        const d = Math.sqrt(dx * dx + dy * dy);
        const i = y * VW + x;
        if (d <= mr - 0.3)
          bg[i] = dx + dy * 0.6 < -mr * 0.62 ? MOON_SHADE : MOON;
        else if (d <= mr + 5) {
          const t = (d - mr) / 5;
          if ((1 - t) * 15 > BAYER[((y & 3) << 2) | (x & 3)] + 2) bg[i] = HALO;
        }
      }
    for (const [cx, cy] of [
      [-3, -2],
      [-4, -1],
      [2, 2],
      [-1, 3],
      [3, -3],
    ])
      at(mx + cx, my + cy, CRATER);
    // Stars: most still, eight that twinkle (drawn per frame).
    let tw = 0;
    for (let s = 0; s < 46; s++) {
      const x = (R() * VW) | 0;
      const y = (R() * (VH * 0.56)) | 0;
      const dx = x - mx;
      const dy = y - my;
      if (dx * dx + dy * dy < 220) continue;
      if (tw < 8 && s % 5 === 0) {
        twinkle[tw * 2] = x;
        twinkle[tw * 2 + 1] = y;
        tw++;
        continue;
      }
      bg[y * VW + x] = R() < 0.28 ? STAR : STAR_DIM;
    }
    // The far mountain, low contrast, its snow cap edged in drips.
    const fx = Math.round(VW * 0.28);
    const fTop = VH - 56;
    const fBase = VH - 20;
    for (let y = fTop; y < fBase; y++) {
      const t = (y - fTop) / (fBase - fTop);
      const half = Math.round(4 + t * t * 36 + t * 16);
      for (let x = fx - half; x <= fx + half; x++) {
        if (x < 0 || x >= VW) continue;
        const drip = Math.round(
          1.4 * Math.sin(x * 0.75) + 1.1 * Math.sin(x * 1.9 + 1) + 1.6
        );
        bg[y * VW + x] = y < fTop + 5 + drip ? SNOW : HAZE;
      }
    }
    // Mist, dithered, over the mountain's foot.
    for (let y = VH - 34; y < VH - 20; y++) {
      const t = 1 - Math.abs(y - (VH - 27)) / 7;
      for (let x = 0; x < VW; x++)
        if (t * 13 > BAYER[((y & 3) << 2) | (x & 3)] + 3) bg[y * VW + x] = HAZE;
    }
    // The far town: small hipped roofs, a pagoda, a few warm windows.
    let x = -4;
    while (x < VW + 4) {
      const w = 7 + ((R() * 9) | 0);
      const top = VH - 9 - ((R() * 8) | 0);
      for (let xx = x; xx < x + w; xx++)
        for (let y = top + 2; y < VH; y++) at(xx, y, TOWN);
      for (let xx = x + 1; xx < x + w - 1; xx++) at(xx, top, TOWN_RIM); // ridge
      for (let xx = x - 1; xx <= x + w; xx++) at(xx, top + 1, TOWN); // eave
      at(x - 1, top, TOWN_RIM); // its ends, curled up
      at(x + w, top, TOWN_RIM);
      if (R() < 0.75)
        at(x + 2 + ((R() * (w - 4)) | 0), top + 4 + ((R() * 3) | 0), WIN_FAR);
      x += w + 3 + ((R() * 3) | 0);
    }
    const px = Math.round(VW * 0.62);
    for (let tier = 0; tier < 4; tier++) {
      const eave = VH - 11 - tier * 5;
      const hw = 6 - tier;
      for (let xx = px - hw; xx <= px + hw; xx++) at(xx, eave, TOWN_RIM);
      at(px - hw - 1, eave - 1, TOWN_RIM);
      at(px + hw + 1, eave - 1, TOWN_RIM);
      for (let y = eave + 1; y < eave + 5; y++)
        for (let xx = px - hw + 2; xx <= px + hw - 2; xx++) at(xx, y, TOWN);
    }
    for (let y = VH - 11 - 4 * 5 - 5; y < VH - 11 - 3 * 5; y++)
      at(px, y, TOWN_RIM);
    // The street far below: a warm haze and a few lamps, seen only where
    // the roofs part.
    for (let y = VH - 7; y < VH; y++) {
      const t = (y - (VH - 8)) / 6;
      for (let xx = 0; xx < VW; xx++)
        if (
          t * 16 > BAYER[((y & 3) << 2) | (xx & 3)] &&
          bg[y * VW + xx] === TOWN
        )
          bg[y * VW + xx] = GLOW;
    }
    for (let xx = 3; xx < VW; xx += 7 + ((R() * 9) | 0)) at(xx, VH - 2, WIN);
  }

  // ── The rooftops (baked whenever the level changes) ──
  function hpx(c: number): number {
    return Math.round(disp[c < 0 ? 0 : c >= COLS ? COLS - 1 : c]);
  }
  /** Is the shoji in this bay lit? Fixed per bay, so edits don't reshuffle the town. */
  function winLit(c: number, k: number): boolean {
    const n = Math.imul(c * 92821 + k * 68917 + 7, 0x45d9f3b) >>> 0;
    return (n >>> 7) % 100 < 42;
  }
  function put(x: number, y: number, col: number) {
    if (x >= 0 && y >= 0 && x < VW && y < VH) scene[y * VW + x] = col;
  }
  function bakeScene() {
    scene.set(bg);
    for (let c = -1; c <= COLS; c++) bakeColumn(c);
  }
  /**
   * One column of town: a hipped roof of tiles (ridge, striped tiles, the
   * eave's round tile ends) over a timber-framed wall with shoji windows,
   * lit or latticed. Where a neighbour is lower, the roof steps in toward
   * the ridge, the eave overhangs, and both ends curl up.
   */
  function bakeColumn(c: number) {
    const hp = hpx(c);
    if (hp <= 0) return;
    const x0 = c < 0 ? 0 : c >= COLS ? OX + LW : OX + c * T;
    const x1 = c < 0 ? OX : c >= COLS ? VW : x0 + T;
    if (x1 <= x0) return;
    const hl = c <= 0 ? hp : hpx(c - 1);
    const hr = c >= COLS - 1 ? hp : hpx(c + 1);
    const openL = hl < hp - 3;
    const openR = hr < hp - 3;
    const top = OY + LH - hp;
    // The roof band, five rows.
    for (let dy = 0; dy < 5; dy++) {
      const y = top + dy;
      const inL = openL ? ROOF_INSET[dy] : 0;
      const inR = openR ? ROOF_INSET[dy] : 0;
      for (let x = x0 + inL; x <= x1 - 1 - inR; x++) {
        const odd = (x - OX) & 1;
        let col: number;
        if (dy === 0) col = RIDGE;
        else if (dy === 1) col = odd ? TILE : TILE_LIT;
        else if (dy === 4) col = odd ? EAVE : TILE_LIT;
        else col = odd ? EAVE : TILE;
        put(x, y, col);
      }
    }
    if (openL) {
      put(x0 + 2, top - 1, RIDGE); // the ridge end's ornament
      put(x0 - 2, top + 3, TILE_LIT); // the eave's tip, curling up
    }
    if (openR) {
      put(x1 - 3, top - 1, RIDGE);
      put(x1 + 1, top + 3, TILE_LIT);
    }
    // The walls: a bay per tile, a post at each bay's edge, a beam at each
    // floor; a shoji per bay, warm if someone's home, latticed if not.
    for (let y = Math.max(0, top + 5); y < VH; y++) {
      const dy = y - top;
      const k = Math.floor(dy / T);
      const wy = dy - k * T;
      for (let x = x0; x < x1; x++) {
        const gx = x - OX;
        const wx = ((gx % T) + T) % T;
        let col = WALL;
        if (wy === 0) col = BEAM;
        else if (wx === 0) col = BEAM;
        else if (x === x1 - 1 && openR) col = WALL_LIT;
        else if (
          wx >= 2 &&
          wx <= 7 &&
          wy >= (k === 0 ? 6 : 2) &&
          wy <= (k === 0 ? 8 : 6)
        ) {
          const cc = Math.floor(gx / T);
          const lit = winLit(cc, k);
          const edge =
            wx === 2 ||
            wx === 7 ||
            wy === (k === 0 ? 6 : 2) ||
            wy === (k === 0 ? 8 : 6);
          // Lit: a warm paper screen with a frame and a centre bar.
          if (lit) col = edge || wx === 4 ? WIN : WIN_CORE;
          // Unlit: the wooden lattice of a closed shutter.
          else col = edge || wx & 1 ? BEAM : WIN_DARK;
        }
        scene[y * VW + x] = col;
      }
    }
  }

  // ── Drawing helpers ──
  function pset(x: number, y: number, c: number) {
    if (x >= 0 && y >= 0 && x < VW && y < VH) fb[y * VW + x] = c;
  }
  function drawArt(art: Int16Array, x0: number, y0: number, swap: number) {
    for (let i = 0; i < art.length; i += 3) {
      let c = art[i + 2];
      if (swap && (c === RED || c === RED_LIT || c === RED_DARK)) c = swap;
      pset(x0 + art[i], y0 + art[i + 1], c);
    }
  }
  function drawLanterns() {
    let shown = 0;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        if (!L.lan[i]) continue;
        if (shown++ >= lanternShow) continue;
        if (got[i] || (traceOn && traceGot[i])) continue;
        const bob = reduced ? 0 : ((tick >> 5) + c + r) & 1;
        const cx = OX + c * T + 5;
        const cy = OY + r * T + 5 + bob;
        for (let k = 0; k < HALO_XY.length; k += 2) {
          const x = cx + HALO_XY[k];
          const y = cy + HALO_XY[k + 1];
          if (x >= 0 && y >= 0 && x < VW && y < VH && SKYISH[fb[y * VW + x]])
            fb[y * VW + x] = GLOW;
        }
        drawArt(LANTERN_PX, cx - 2, cy - 3, 0);
      }
  }
  function drawTorii() {
    const hp = Math.round(disp[L.goal]);
    if (hp <= 0 || toriiDrop <= 0) return;
    const drop = Math.round((1 - easeOutBack(clamp01(toriiDrop))) * -10);
    const x0 = OX + L.goal * T + 5 - (TORII_W >> 1);
    const y0 = OY + LH - hp - TORII_H + drop;
    drawArt(
      TORII_PX,
      x0,
      y0,
      toriiGlow > 0 ? (toriiGlow & 4 ? WIN_CORE : GOLD_LIGHT) : 0
    );
  }
  function drawStars() {
    for (let s = 0; s < 8; s++) {
      const x = twinkle[s * 2];
      const y = twinkle[s * 2 + 1];
      const ph = reduced ? 1 : ((tick >> 3) + s * 5) % 23;
      const c = ph < 2 ? STAR : ph < 14 ? STAR_DIM : 0;
      if (c && SKYISH[fb[y * VW + x]]) fb[y * VW + x] = c;
    }
  }
  function drawGrid() {
    for (let r = 0; r <= ROWS; r++)
      for (let c = 0; c <= COLS; c++) {
        const x = OX + c * T;
        const y = OY + r * T;
        if (x < VW && y < VH && SKYISH[fb[y * VW + x]]) fb[y * VW + x] = GRID;
      }
  }
  /** The cursor's four corner brackets around a tile. */
  function brackets(x0: number, y0: number, c: number) {
    for (let i = 0; i < 3; i++) {
      pset(x0 + i, y0, c);
      pset(x0, y0 + i, c);
      pset(x0 + T - 1 - i, y0, c);
      pset(x0 + T - 1, y0 + i, c);
      pset(x0 + i, y0 + T - 1, c);
      pset(x0, y0 + T - 1 - i, c);
      pset(x0 + T - 1 - i, y0 + T - 1, c);
      pset(x0 + T - 1, y0 + T - 1 - i, c);
    }
  }
  function drawCursor() {
    if (!curOn) return;
    if (!reduced && !curKeys && curT > 1.6) return;
    if (!reduced && (tick >> 4) % 4 === 3) return; // a slow blink
    const x0 = OX + curC * T;
    const y0 = OY + curR * T;
    const removing =
      brush === 'roof' && L.h[curC] === ROWS - curR && curC !== 0;
    brackets(x0, y0, removing ? RED_LIT : WIN_CORE);
    // A roof preview: where the ridge would land.
    if (brush === 'roof' && !removing) {
      const nh = Math.min(MAXH, ROWS - curR);
      const y = OY + LH - nh * T;
      if (nh !== L.h[curC])
        for (let x = x0; x < x0 + T; x += 2) pset(x + (y & 1), y, GOLD_LIGHT);
    }
  }
  function drawParticles() {
    if (!pAlive) return;
    for (let k = 0; k < MAXP; k++) {
      if (!pOn[k]) continue;
      const step = Math.min(4, ((pAge[k] / pLife[k]) * 5) | 0);
      const c = RAMPS[pRamp[k] * 5 + step];
      const x = Math.round(OX + pX[k]);
      const y = Math.round(OY + pY[k]);
      pset(x, y, c);
      if (pKind[k] === K_PETAL && step < 3) pset(x + 1, y, c);
    }
  }
  function drawTrace() {
    if (!traceOn) return;
    // His run as a dashed gold line through his middle, every recorded step.
    for (let i = 0; i < trace.n; i++) {
      const x = Math.round(OX + trace.xs[i]);
      const y = Math.round(OY + trace.ys[i]) - 7;
      if (y >= 0 && y < VH && i % 3 !== 2) pset(x, y, i % 3 ? WIN : GOLD_LIGHT);
    }
    if (trace.result === R_FELL) {
      const x = Math.round(OX + trace.xs[trace.n - 1]);
      for (let i = -2; i <= 2; i++) {
        pset(x + i, VH - 5 + i, RED_LIT);
        pset(x + i, VH - 5 - i, RED_LIT);
      }
    }
  }

  // ── Kiru, procedural, rebuilt at 12 fps ──
  let pose = 0; // 0 stand, 1 run, 2 rise, 3 fall, 4 cheer, 5 push
  let frame4 = 0;
  let blinkOn = false;
  function sp(x: number, y: number, c: number) {
    if (x >= 0 && y >= 0 && x < SW && y < SH) spr[y * SW + x] = c;
  }
  function spRow(y: number, x0: number, x1: number, c: number) {
    for (let x = x0; x <= x1; x++) sp(x, y, c);
  }
  // The hood: a 12×10 ellipse.
  const HOOD_ROWS = [
    4, 7, 2, 9, 1, 10, 0, 11, 0, 11, 0, 11, 0, 11, 1, 10, 2, 9, 4, 7,
  ];
  const TAIL_RUN_A = [-1, 2, -2, 2, -3, 2, -4, 3, -5, 3, -6, 2];
  const TAIL_RUN_B = [-1, 2, -2, 2, -3, 3, -4, 3, -5, 2, -6, 2];
  const TAIL_LO_A = [-1, 3, -2, 3, -3, 4, -4, 4, -5, 5];
  const TAIL_LO_B = [-1, 3, -2, 4, -3, 4, -4, 5, -5, 5];
  const TAIL_HANG_A = [-1, 3, -2, 4, -2, 5, -3, 6];
  const TAIL_HANG_B = [-1, 3, -2, 4, -3, 5, -3, 6];
  const TAIL_HANG_LO = [-1, 4, -1, 5, -2, 6, -2, 7];
  const TAIL_UP = [-1, 2, -2, 1, -3, 0, -4, 0, -5, -1];
  const TAIL_UP_LO = [-1, 3, -2, 2, -3, 2, -4, 1];
  const TAIL_DOWN = [-1, 3, -2, 4, -3, 5, -3, 6, -4, 7];
  const TAIL_DOWN_LO = [-1, 4, -2, 5, -2, 6, -3, 7];
  function tail(hx: number, hy: number, pts: number[], c: number) {
    for (let i = 0; i < pts.length; i += 2) sp(hx + pts[i], hy + pts[i + 1], c);
  }
  function buildKiru() {
    spr.fill(EMPTY);
    if (kState === S_HIDDEN || kState === S_GONE) return;
    const f = frame4;
    let bob = 0;
    let lean = 0;
    if (pose === 0 || pose === 4) bob = blinkOn ? 0 : (tick >> 5) & 1 ? 1 : 0;
    if (pose === 1 && f & 1) bob = -1;
    if (pose === 5) lean = 1;
    if (landSquash > 0) bob = 1;
    const hx = SCX - 6 + lean; // the hood's left edge
    const hy = SGY - 15 + bob; // its top row
    const by = SGY - 5; // body top (torso row)

    // Tails first: the hood sits over their roots.
    if (pose === 1 || pose === 5) {
      tail(hx, hy, f & 1 ? TAIL_RUN_B : TAIL_RUN_A, RED);
      tail(hx, hy, f & 1 ? TAIL_LO_B : TAIL_LO_A, BAND_DARK);
    } else if (pose === 2) {
      tail(hx, hy, TAIL_DOWN, RED);
      tail(hx, hy, TAIL_DOWN_LO, BAND_DARK);
    } else if (pose === 3 || pose === 4) {
      tail(hx, hy, TAIL_UP, RED);
      tail(hx, hy, TAIL_UP_LO, BAND_DARK);
    } else {
      tail(hx, hy, (tick >> 5) & 1 ? TAIL_HANG_B : TAIL_HANG_A, RED);
      tail(hx, hy, TAIL_HANG_LO, BAND_DARK);
    }

    // Legs (far leg darker, drawn first).
    const ly = by + 3;
    if (pose === 1 || pose === 5) {
      if (f === 0 || f === 2) {
        const far = f === 0 ? -1 : 1;
        const fx = SCX - 1 + far * 2;
        const nx = SCX - 1 - far * 2;
        spRow(ly, fx, fx + 1, HOOD_DARK);
        spRow(ly + 1, fx + far, fx + 1 + far, HOOD_DARK);
        spRow(
          ly + 2,
          fx + far * 2 - (far < 0 ? 1 : 0),
          fx + far * 2 + 1 + (far > 0 ? 1 : 0),
          INK
        );
        spRow(ly, nx, nx + 1, HOOD);
        spRow(ly + 1, nx - far, nx + 1 - far, HOOD);
        spRow(
          ly + 2,
          nx - far * 2 - (far > 0 ? 1 : 0),
          nx - far * 2 + 1 + (far < 0 ? 1 : 0),
          INK
        );
      } else {
        // Passing: one leg under him, the other tucked behind.
        const back = f === 1 ? HOOD : HOOD_DARK;
        const under = f === 1 ? HOOD_DARK : HOOD;
        spRow(ly, SCX - 3, SCX - 2, back);
        spRow(ly + 1, SCX - 4, SCX - 3, back);
        sp(SCX - 5, ly + 1, INK);
        spRow(ly, SCX - 1, SCX, under);
        spRow(ly + 1, SCX - 1, SCX, under);
        spRow(ly + 2, SCX - 1, SCX + 1, INK);
      }
    } else if (pose === 2) {
      spRow(ly, SCX - 3, SCX - 2, HOOD_DARK);
      spRow(ly + 1, SCX - 3, SCX - 2, HOOD_DARK);
      spRow(ly + 2, SCX - 4, SCX - 2, INK);
      spRow(ly - 1, SCX, SCX + 1, HOOD);
      spRow(ly, SCX + 1, SCX + 2, HOOD);
      spRow(ly + 1, SCX + 1, SCX + 3, INK);
    } else if (pose === 3) {
      spRow(ly, SCX - 3, SCX - 2, HOOD_DARK);
      spRow(ly + 1, SCX - 4, SCX - 3, HOOD_DARK);
      spRow(ly + 2, SCX - 5, SCX - 3, INK);
      spRow(ly, SCX, SCX + 1, HOOD);
      spRow(ly + 1, SCX + 1, SCX + 2, HOOD);
      spRow(ly + 2, SCX + 1, SCX + 3, INK);
    } else {
      spRow(ly, SCX - 3, SCX - 2, HOOD_DARK);
      spRow(ly + 1, SCX - 3, SCX - 2, HOOD_DARK);
      spRow(ly + 2, SCX - 4, SCX - 2, INK);
      spRow(ly, SCX, SCX + 1, HOOD);
      spRow(ly + 1, SCX, SCX + 1, HOOD);
      spRow(ly + 2, SCX, SCX + 2, INK);
    }

    // Torso and obi, under the hood.
    const ty = by + bob;
    spRow(ty, SCX - 3, SCX + 2, HOOD);
    spRow(ty + 1, SCX - 3, SCX + 2, HOOD);
    sp(SCX - 3, ty + 1, HOOD_DARK);
    sp(SCX - 1, ty, STEEL); // the collar
    spRow(ty + 2, SCX - 3, SCX + 2, RED);

    // Hands (white wraps).
    if (pose === 4) {
      sp(hx - 1, hy + 6, WHITE);
      sp(hx + 12, hy + 6, WHITE);
    } else if (pose === 3) {
      sp(hx - 1, hy + 8, WHITE);
      sp(hx + 12, hy + 8, WHITE);
    } else if (pose === 2) {
      sp(SCX + 4, ty - 1, WHITE);
      sp(SCX - 5, ty + 1, WHITE);
    } else if (pose === 5) {
      sp(SCX + 4, ty, WHITE);
      sp(SCX + 3, ty + 1, WHITE);
    } else if (pose === 1) {
      const sw = f === 0 ? 1 : f === 2 ? -1 : 0;
      sp(SCX + 3 + sw, ty + 1, WHITE);
      sp(SCX - 4 - sw, ty + 1, WHITE);
    } else {
      sp(SCX + 3, ty + 1, WHITE);
      sp(SCX - 4, ty + 1, WHITE);
    }

    // The hood, lit from the moon (up and to the right).
    for (let r = 0; r < 10; r++) {
      const a = HOOD_ROWS[r * 2];
      const b = HOOD_ROWS[r * 2 + 1];
      for (let x = a; x <= b; x++) {
        const v = x / 11 - r / 9;
        sp(hx + x, hy + r, v > 0.42 ? HOOD_LIT : v < -0.5 ? HOOD_DARK : HOOD);
      }
    }
    // Headband, with the steel plate and its vermilion bolt.
    spRow(hy + 2, hx + 1, hx + 10, RED);
    spRow(hy + 3, hx, hx + 11, BAND_DARK);
    spRow(hy + 2, hx + 6, hx + 8, STEEL);
    sp(hx + 7, hy + 3, STEEL);
    sp(hx + 7, hy + 2, RED);
    sp(hx - 1, hy + 2, RED); // the knot
    // Face band.
    spRow(hy + 4, hx + 2, hx + 11, SKIN_SHADE);
    spRow(hy + 5, hx + 2, hx + 11, SKIN);
    spRow(hy + 6, hx + 2, hx + 11, SKIN);
    spRow(hy + 7, hx + 3, hx + 9, SKIN);
    // Eyes, looking where he runs.
    if (pose === 4) {
      spRow(hy + 5, hx + 5, hx + 6, INK);
      spRow(hy + 5, hx + 9, hx + 10, INK);
      sp(hx + 4, hy + 7, BLUSH);
      sp(hx + 9, hy + 7, BLUSH);
    } else if (blinkOn) {
      spRow(hy + 6, hx + 5, hx + 6, INK);
      spRow(hy + 6, hx + 9, hx + 10, INK);
    } else {
      sp(hx + 5, hy + 5, WHITE);
      sp(hx + 5, hy + 6, WHITE);
      sp(hx + 6, hy + 5, INK);
      sp(hx + 6, hy + 6, INK);
      sp(hx + 9, hy + 5, WHITE);
      sp(hx + 9, hy + 6, WHITE);
      sp(hx + 10, hy + 5, INK);
      sp(hx + 10, hy + 6, INK);
    }
  }
  /** Composite Kiru into fb: 1px outline, moonlight on top/right edges. */
  function compositeKiru(wx0: number, wy0: number) {
    for (let sy = 0; sy < SH; sy++) {
      const wy = wy0 + sy;
      if (wy < 0 || wy >= VH) continue;
      for (let sx = 0; sx < SW; sx++) {
        const wx = wx0 + sx;
        if (wx < 0 || wx >= VW) continue;
        let c = spr[sy * SW + sx];
        if (c !== EMPTY) {
          const right = sx + 1 >= SW || spr[sy * SW + sx + 1] === EMPTY;
          const up = sy === 0 || spr[(sy - 1) * SW + sx] === EMPTY;
          if (right || up) c = RIM_OF[c];
          fb[wy * VW + wx] = c;
        } else if (
          (sx > 0 && spr[sy * SW + sx - 1] !== EMPTY) ||
          (sx + 1 < SW && spr[sy * SW + sx + 1] !== EMPTY) ||
          (sy > 0 && spr[(sy - 1) * SW + sx] !== EMPTY) ||
          (sy + 1 < SH && spr[(sy + 1) * SW + sx] !== EMPTY)
        ) {
          fb[wy * VW + wx] = OUT;
        }
      }
    }
  }
  function poseFor(): number {
    if (kState === S_CHEER) return kT < LEAP * 0.5 ? 2 : kT < LEAP ? 3 : 4;
    if (kState === S_STAND || kState === S_HIDDEN) return 0;
    if (kState === S_DROP) return 3;
    if (!body.ground) return body.vy < 0 ? 2 : 3;
    if (body.blocked) return 5;
    return 1;
  }

  // ── Frame ──
  let tick = 0;
  let dirty = true;
  function draw() {
    if (!img || !ctx || !N) return;
    fb.set(scene);
    drawStars();
    drawLanterns();
    drawTorii();
    if (mode === 'build') drawGrid();
    drawTrace();
    if (kState !== S_HIDDEN && kState !== S_GONE) {
      compositeKiru(
        OX + Math.round(body.x) - SCX,
        OY + Math.round(body.y) - SGY
      );
    }
    if (mode === 'build') drawCursor();
    else if (ghostT > 0) brackets(OX + ghostC * T, OY + ghostR * T, WIN_CORE);
    drawParticles();
    const P = flash > 0 ? flashLut : lut;
    for (let i = 0; i < N; i++) pix[i] = P[fb[i]];
    ctx.putImageData(img, 0, 0);
  }

  // ── Rules ──
  function restartRun() {
    placeAtStart(body, L);
    got.fill(0);
    gotN = 0;
    aiHold = 0;
    againSent = false;
    blockedSent = false;
    kState = S_RUN;
    kT = 0;
    emit({ type: 'lanterns', got: 0, total });
    if (mode === 'play') emit({ type: 'run' });
  }
  /** A fresh run that starts with him dropping onto the first roof. */
  function dropIn() {
    restartRun();
    body.y -= 16;
    body.ground = false;
    body.vy = 0;
    kState = S_DROP;
    kT = 0;
  }
  function standAtStart() {
    placeAtStart(body, L);
    got.fill(0);
    gotN = 0;
    kState = S_STAND;
    kT = 0;
  }
  function finishIntro() {
    if (intro < 0) return;
    intro = -1;
    for (let c = 0; c < COLS; c++) {
      disp[c] = L.h[c] * T;
      anim[c] = 1;
    }
    animating = false;
    toriiDrop = 1;
    lanternShow = 99;
    bakeScene();
  }
  /** The demo's builder turns the level into demo `i`, column by column. */
  function morphTo(i: number) {
    demoIdx = i;
    const D = DEMOS[i];
    morphN = 0;
    for (let c = 0; c < COLS; c++)
      if (L.h[c] !== D.h[c]) morphCols[morphN++] = c;
    morphT = 0;
    morphStep = 0;
    morphSwapped = false;
    puff(body.x, body.y - 6, 8);
    kState = S_HIDDEN;
  }
  /** Lanterns and the gate move once the roofs are done. */
  function morphSwap() {
    morphSwapped = true;
    const D = DEMOS[demoIdx];
    for (let i = 0; i < L.lan.length; i++) {
      if (!L.lan[i]) continue;
      L.lan[i] = 0;
      puff((i % COLS) * T + 5, ((i / COLS) | 0) * T + 5, 4);
    }
    for (const [c, r] of D.lan) {
      L.lan[r * COLS + c] = 1;
      burst(RP_GOLD, K_FALL, c * T + 5, r * T + 5, 8, 10, 26, 8, 0.25, 0.45);
    }
    syncTotal();
    if (L.goal !== D.goal) {
      L.goal = D.goal;
      toriiDrop = 0.0001;
      burst(
        RP_GOLD,
        K_FALL,
        D.goal * T + 5,
        LH - L.h[D.goal] * T - 8,
        12,
        14,
        36,
        10,
        0.3,
        0.6
      );
    }
  }
  function updateMorph() {
    morphT += DT;
    const D = DEMOS[demoIdx];
    while (morphStep < morphN && morphT >= 0.2 + morphStep * 0.11) {
      const c = morphCols[morphStep++];
      setHeight(c, D.h[c]);
      ghostC = c;
      ghostR = ROWS - Math.max(1, D.h[c]);
      ghostT = 0.32;
    }
    const done = 0.2 + morphN * 0.11 + 0.2;
    if (morphT >= done && !morphSwapped) morphSwap();
    if (morphT >= done + 0.45) {
      morphT = -1;
      dropIn();
    }
  }
  /** Someone took over mid-change: finish it at once, so the level is whole. */
  function finishMorph() {
    if (morphT < 0) return;
    const D = DEMOS[demoIdx];
    while (morphStep < morphN) {
      const c = morphCols[morphStep++];
      setHeight(c, D.h[c]);
    }
    if (!morphSwapped) morphSwap();
    morphT = -1;
    ghostT = 0;
  }
  function clearTrace() {
    if (!traceOn) return;
    traceOn = false;
    emit({ type: 'lanterns', got: 0, total });
  }
  function setMode(m: Mode) {
    if (m === mode) return;
    finishMorph();
    mode = m;
    traceOn = false;
    emit({ type: 'mode', mode });
  }
  function enterBuild() {
    finishIntro();
    setMode('build');
    standAtStart();
    emit({ type: 'lanterns', got: 0, total });
    curOn = curKeys;
    paint();
  }
  function enterPlay() {
    finishIntro();
    if (reduced) {
      // No motion: run it headless and draw the whole run as one still.
      setMode('build');
      simulate(L, trace, traceBody, traceGot);
      traceOn = true;
      placeAtStart(body, L);
      kState = S_STAND;
      if (trace.result === R_CLEAR) {
        body.x = goalX(L);
        body.y = perchY(L);
        kState = S_CHEER;
        kT = LEAP + 1;
      } else if (trace.result === R_STUCK) {
        body.x = trace.xs[trace.n - 1];
        body.y = trace.ys[trace.n - 1];
        kState = S_RUN;
      }
      emit({ type: 'lanterns', got: trace.got, total: trace.total });
      emit({
        type: 'trace',
        result: trace.result,
        at: trace.at,
        got: trace.got,
        total: trace.total,
        edited,
      });
      paint();
      return;
    }
    setMode('play');
    restartRun();
    wake();
  }

  // ── Edits ──
  function setHeight(c: number, h: number, stagger = 0) {
    if (L.h[c] === h) return;
    from[c] = disp[c];
    L.h[c] = h;
    anim[c] = reduced ? 1 : -stagger;
    if (reduced) disp[c] = h * T;
    else animating = true;
    for (let r = ROWS - h; r < ROWS; r++) {
      const i = r * COLS + c;
      if (L.lan[i]) {
        L.lan[i] = 0;
        puff(c * T + 5, r * T + 5, 5);
      }
    }
    syncTotal();
  }
  /** Tell the cabinet when the number of lanterns in the level changes. */
  function syncTotal() {
    const n = lanternCount(L);
    if (n === total) return;
    total = n;
    emit({ type: 'lanterns', got: 0, total });
  }
  function describe(c: number, r: number): string {
    const h = L.h[c];
    let what: string;
    if (L.lan[r * COLS + c]) what = 'a lantern';
    else if (r >= ROWS - h)
      what =
        r === ROWS - h
          ? `the roof top, height ${h}`
          : `inside a building, height ${h}`;
    else if (c === L.goal && r >= ROWS - h - 2) what = 'the gate';
    else what = h ? `sky, roof height ${h} below` : 'sky over a gap';
    return `Column ${c + 1}, row ${r + 1}: ${what}.`;
  }
  /** Apply the brush at a cell. `drag` sets heights without ever clearing. */
  function apply(c: number, r: number, drag: boolean): boolean {
    c = Math.max(0, Math.min(COLS - 1, c));
    r = Math.max(0, Math.min(ROWS - 1, r));
    finishIntro();
    clearTrace();
    if (brush === 'roof') {
      // A tap on a roof's own top tile knocks it out; anywhere else in the
      // column sets the roof to that height (as high as MAXH).
      const h = !drag && r === ROWS - L.h[c] ? 0 : Math.min(MAXH, ROWS - r);
      if (h === 0 && c === 0) return refuse('start');
      if (h === 0 && c === L.goal) return refuse('goal-gap');
      if (L.h[c] === h) return false;
      setHeight(c, h);
      edited = true;
      if (!drag)
        emit({
          type: 'edit',
          text: h
            ? `Column ${c + 1} roof set to height ${h}.`
            : `Column ${c + 1} is a gap now.`,
        });
    } else if (brush === 'lantern') {
      const i = r * COLS + c;
      if (r >= ROWS - L.h[c]) return refuse('inside');
      if (L.lan[i]) {
        L.lan[i] = 0;
        burst(
          RP_LANTERN,
          K_FALL,
          c * T + 5,
          r * T + 5,
          8,
          10,
          30,
          10,
          0.3,
          0.6
        );
        emit({
          type: 'edit',
          text: `Lantern taken down from column ${c + 1}.`,
        });
      } else {
        if (lanternCount(L) >= MAX_LANTERNS) return refuse('full');
        L.lan[i] = 1;
        burst(RP_GOLD, K_FALL, c * T + 5, r * T + 5, 10, 14, 34, 14, 0.25, 0.5);
        emit({
          type: 'edit',
          text: `Lantern hung in column ${c + 1}, row ${r + 1}.`,
        });
      }
      syncTotal();
      edited = true;
    } else {
      if (c < GOAL_MIN) return refuse('goal-near');
      if (c === L.goal) return false;
      if (!L.h[c]) setHeight(c, 1);
      L.goal = c;
      toriiDrop = reduced ? 1 : 0.0001;
      if (!reduced)
        burst(
          RP_GOLD,
          K_FALL,
          c * T + 5,
          LH - L.h[c] * T - 8,
          12,
          14,
          36,
          10,
          0.3,
          0.6
        );
      edited = true;
      emit({ type: 'edit', text: `Gate moved to column ${c + 1}.` });
    }
    if (mode === 'build') standAtStart();
    bakeScene();
    paint();
    return true;
  }
  function refuse(why: Refusal): boolean {
    emit({ type: 'refuse', why });
    return false;
  }
  /** Something changed: draw it now (reduced motion) or let the loop. */
  function paint() {
    dirty = true;
    if (reduced || !started) {
      buildKiru();
      draw();
    } else wake();
  }

  // ── Input ──
  function cellAt(clientX: number, clientY: number): [number, number] {
    const r = canvas.getBoundingClientRect();
    const lx = ((clientX - r.left) / r.width) * VW - OX;
    const ly = ((clientY - r.top) / r.height) * VH - OY;
    return [
      Math.max(0, Math.min(COLS - 1, Math.floor(lx / T))),
      Math.max(0, Math.min(ROWS - 1, Math.floor(ly / T))),
    ];
  }
  let downId = -1;
  let downX = 0;
  let downY = 0;
  let downAt = 0;
  let painting = false;
  let lastPaintC = -1;
  let lastPaintR = -1;

  function takeOver() {
    finishIntro();
    setMode('play');
    if (kState !== S_RUN) restartRun();
    jumpDown();
  }
  function jumpDown() {
    if (mode === 'attract') return takeOver();
    if (mode !== 'play') return;
    if (kState === S_CHEER) {
      if (againSent) restartRun();
      return;
    }
    press(body);
    wake();
  }
  function jumpUp() {
    if (mode === 'play') release(body);
  }

  function onDown(e: PointerEvent) {
    if (e.button > 0) return;
    if (mode === 'play') {
      jumpDown();
      canvas.setPointerCapture?.(e.pointerId);
      downId = e.pointerId;
      return;
    }
    downId = e.pointerId;
    downX = e.clientX;
    downY = e.clientY;
    downAt = performance.now();
    painting = false;
    if (mode === 'build') {
      const [c, r] = cellAt(e.clientX, e.clientY);
      curC = c;
      curR = r;
      curOn = true;
      curKeys = false;
      curT = 0;
      paint();
    }
  }
  function onMove(e: PointerEvent) {
    // A press that ended off the canvas before it was captured never sent
    // its pointerup here; with no button down, it's over. Without this, a
    // mouse hovering afterwards kept painting roofs.
    if (downId >= 0 && e.buttons === 0) {
      downId = -1;
      painting = false;
    }
    if (mode === 'build' && downId < 0 && e.pointerType === 'mouse') {
      const [c, r] = cellAt(e.clientX, e.clientY);
      if (c !== curC || r !== curR || !curOn) {
        curC = c;
        curR = r;
        curOn = true;
        curKeys = false;
        curT = 0;
        paint();
      }
      return;
    }
    if (e.pointerId !== downId || mode !== 'build' || brush !== 'roof') return;
    const dx = e.clientX - downX;
    if (!painting) {
      if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(e.clientY - downY))
        return;
      painting = true;
      canvas.setPointerCapture?.(e.pointerId);
      const [c0, r0] = cellAt(downX, downY);
      apply(c0, r0, true);
      lastPaintC = c0;
      lastPaintR = r0;
    }
    const [c, r] = cellAt(e.clientX, e.clientY);
    curC = c;
    curR = r;
    curT = 0;
    if (c === lastPaintC && r === lastPaintR) return;
    // Fill every column the finger crossed, so a fast swipe leaves no holes.
    const step = c > lastPaintC ? 1 : -1;
    for (let cc = lastPaintC === c ? c : lastPaintC + step; ; cc += step) {
      const t = lastPaintC === c ? 1 : (cc - lastPaintC) / (c - lastPaintC);
      apply(cc, Math.round(lastPaintR + (r - lastPaintR) * t), true);
      if (cc === c) break;
    }
    lastPaintC = c;
    lastPaintR = r;
  }
  function onUp(e: PointerEvent) {
    if (e.pointerId !== downId) return;
    downId = -1;
    if (mode === 'play') return jumpUp();
    if (painting) {
      painting = false;
      if (e.pointerType !== 'mouse') curOn = false;
      emit({ type: 'edit', text: 'Rooftops drawn.' });
      paint();
      return;
    }
    const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
    if (moved > 12 || performance.now() - downAt > 700) return;
    if (mode === 'attract') {
      takeOver();
      // The finger is already up, so this was a tap: a short hop, not the
      // held jump takeOver's press would otherwise become.
      return jumpUp();
    }
    const [c, r] = cellAt(e.clientX, e.clientY);
    // A finger's cursor is feedback while it is down; a mouse keeps hovering.
    if (e.pointerType !== 'mouse') curOn = false;
    apply(c, r, false);
  }
  function onCancel(e: PointerEvent) {
    if (e.pointerId !== downId) return;
    downId = -1;
    painting = false;
    if (e.pointerType !== 'mouse' && curOn && !curKeys) {
      curOn = false;
      paint();
    }
    if (mode === 'play') jumpUp();
  }
  function onLeave(e: PointerEvent) {
    if (
      e.pointerType === 'mouse' &&
      mode === 'build' &&
      !curKeys &&
      downId < 0
    ) {
      curOn = false;
      paint();
    }
  }
  function moveCursor(dc: number, dr: number) {
    if (mode !== 'build') enterBuild();
    if (curOn && curKeys) {
      curC = Math.max(0, Math.min(COLS - 1, curC + dc));
      curR = Math.max(0, Math.min(ROWS - 1, curR + dr));
    }
    curOn = true;
    curKeys = true;
    curT = 0;
    emit({ type: 'cursor', text: describe(curC, curR) });
    paint();
  }
  function onKey(e: KeyboardEvent) {
    const k = e.key;
    if (k === ' ' || k === 'Spacebar') {
      e.preventDefault();
      if (e.repeat) return;
      if (mode === 'build') enterPlay();
      else jumpDown();
      return;
    }
    if (k === 'ArrowUp' && mode === 'play') {
      e.preventDefault();
      if (!e.repeat) jumpDown();
      return;
    }
    if (k.startsWith('Arrow')) {
      e.preventDefault();
      if (mode === 'play') return;
      moveCursor(
        k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : 0,
        k === 'ArrowUp' ? -1 : k === 'ArrowDown' ? 1 : 0
      );
      return;
    }
    if (k === 'Enter') {
      e.preventDefault();
      if (mode === 'play') return;
      if (mode !== 'build' || !curOn) return moveCursor(0, 0);
      if (apply(curC, curR, false))
        emit({ type: 'cursor', text: describe(curC, curR) });
      return;
    }
    if (k === 'Escape' && mode === 'play') {
      e.preventDefault();
      enterBuild();
      return;
    }
    if (k === '1' || k === '2' || k === '3') {
      setBrush(k === '1' ? 'roof' : k === '2' ? 'lantern' : 'goal');
      emit({ type: 'brush', brush });
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowUp') jumpUp();
  }
  function onBlur() {
    jumpUp();
    if (curKeys) {
      curKeys = false;
      curOn = false;
      paint();
    }
  }
  function setBrush(b: Brush) {
    brush = b;
    if (mode !== 'build') enterBuild();
    else paint();
  }

  // ── Loop ──
  let raf = 0;
  let last = 0;
  let acc = 0;
  let visible = true;
  let started = false;
  let spriteTick = 0;
  function canRun() {
    return started && !reduced && visible && !document.hidden;
  }
  function wake() {
    if (!raf && canRun()) {
      last = performance.now();
      acc = 0;
      raf = requestAnimationFrame(loop);
    }
  }
  function loop(now: number) {
    raf = 0;
    if (!canRun()) return;
    acc += Math.min(0.1, (now - last) / 1000);
    last = now;
    let steps = 0;
    while (acc >= DT && steps < 6) {
      update();
      acc -= DT;
      steps++;
    }
    if (dirty) {
      draw();
      dirty = false;
    }
    raf = requestAnimationFrame(loop);
  }

  function update() {
    tick++;
    if (curOn) curT += DT;
    if (ghostT > 0) ghostT -= DT;
    if (morphT >= 0) updateMorph();
    if (flash > 0) flash--;
    if (toriiGlow > 0) toriiGlow--;
    if (landSquash > 0) landSquash -= DT;

    // The intro, and any column still easing to its new height.
    if (intro >= 0) updateIntro();
    else if (animating) {
      animating = false;
      for (let c = 0; c < COLS; c++) {
        if (anim[c] >= 1) continue;
        anim[c] = Math.min(1, anim[c] + DT / 0.2);
        const t = clamp01(anim[c]);
        disp[c] = from[c] + (L.h[c] * T - from[c]) * easeOutBack(t);
        if (anim[c] >= 1) {
          disp[c] = L.h[c] * T;
          if (L.h[c]) {
            puff(c * T + 1, LH - L.h[c] * T, 2);
            puff(c * T + 8, LH - L.h[c] * T, 2);
          }
        } else animating = true;
      }
      bakeScene();
      dirty = true;
    }
    if (toriiDrop > 0 && toriiDrop < 1) {
      toriiDrop = Math.min(1, toriiDrop + DT / 0.3);
      dirty = true;
    }

    updateKiru();
    if (pAlive) {
      updateParticles();
      dirty = true;
    }
    // Sprites and the slow things (blink, bob, stars) move at 12 fps.
    if (++spriteTick >= 5) {
      spriteTick = 0;
      const p = poseFor();
      if (p !== pose) frame4 = 0;
      else if (p === 1 || p === 5) frame4 = (frame4 + 1) & 3;
      pose = p;
      runPhase++;
      blinkOn = (pose === 0 || pose === 1) && runPhase % 40 < 2;
      buildKiru();
      dirty = true;
    }
  }

  function updateIntro() {
    intro += DT;
    let settling = false;
    for (let c = 0; c < COLS; c++) {
      const t0 = 0.12 + c * 0.045;
      const p = clamp01((intro - t0) / 0.3);
      const before = disp[c];
      disp[c] = L.h[c] * T * easeOutBack(p);
      if (p < 1) settling = true;
      if (p >= 1 && before !== L.h[c] * T && L.h[c])
        puff(c * T + 5, LH - L.h[c] * T, 3);
    }
    bakeScene();
    dirty = true;
    if (intro > 0.95 && toriiDrop === 0) {
      toriiDrop = 0.0001;
      burst(
        RP_GOLD,
        K_FALL,
        L.goal * T + 5,
        LH - L.h[L.goal] * T - 9,
        14,
        14,
        40,
        12,
        0.35,
        0.7
      );
    }
    const n = Math.floor((intro - 1.05) / 0.09) + 1;
    if (n > lanternShow && lanternShow < total) {
      lanternShow = n;
      let k = 0;
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) {
          if (!L.lan[r * COLS + c]) continue;
          if (++k === n)
            burst(
              RP_GOLD,
              K_FALL,
              c * T + 5,
              r * T + 5,
              8,
              10,
              26,
              8,
              0.25,
              0.45
            );
        }
    }
    if (intro > 1.3 && kState === S_HIDDEN) {
      placeAtStart(body, L);
      body.y = -14;
      body.vy = 40;
      body.ground = false;
      kState = S_DROP;
    }
    if (!settling && intro > 1.3 && kState !== S_DROP && kState !== S_HIDDEN) {
      intro = -1;
      lanternShow = 99;
    }
  }

  function updateKiru() {
    kT += DT;
    if (kState === S_DROP) {
      body.vy = Math.min(MAX_FALL, body.vy + G * DT);
      body.y += body.vy * DT;
      const gy = topOf(L, 0);
      if (body.y >= gy) {
        body.y = gy;
        body.vy = 0;
        body.ground = true;
        puff(body.x - 3, gy, 3);
        puff(body.x + 3, gy, 3);
        landSquash = 0.12;
        kState = S_STAND;
        kT = 0;
      }
      dirty = true;
      return;
    }
    if (kState === S_STAND) {
      // Dropped in: a beat to land, then he runs (in Build he just waits).
      if (mode !== 'build' && kT > 0.3) {
        if (intro >= 0) {
          intro = -1;
          lanternShow = 99;
        }
        kState = S_RUN;
        kT = 0;
      }
      return;
    }
    if (kState === S_GONE) {
      if (kT > 0.6) dropIn();
      return;
    }
    if (kState === S_CHEER) {
      const px = goalX(L);
      const py = perchY(L);
      if (kT < LEAP) {
        // The leap: up and onto the gate's top beam.
        const t = kT / LEAP;
        body.x = leapX + (px - leapX) * (1 - (1 - t) * (1 - t));
        body.y = leapY + (py - leapY) * t - Math.sin(t * Math.PI) * 9;
      } else {
        if (!cheered) {
          // Landed on the beam: the gate lights up and the petals go.
          cheered = true;
          body.x = px;
          body.y = py;
          body.vy = -55;
          flash = 3;
          toriiGlow = 24;
          landSquash = 0.1;
          const ty = topOf(L, L.goal) - 12;
          burst(RP_SAKURA, K_PETAL, px, ty, 64, 18, 58, 26, 1.2, 2.3);
          burst(RP_GOLD, K_FALL, px, ty, 18, 20, 60, 20, 0.4, 0.8);
          if (mode === 'play')
            emit({ type: 'clear', edited, got: gotN, total });
        }
        // Little hops of joy up there.
        body.vy += G * DT;
        body.y += body.vy * DT;
        if (body.y >= py) {
          body.y = py;
          body.vy = kT < LEAP + 1.6 ? -55 : 0;
        }
      }
      dirty = true;
      if (mode === 'play' && kT > LEAP + 0.8 && !againSent) {
        againSent = true;
        emit({ type: 'again' });
      }
      if (mode === 'attract' && kT > LEAP + 2.4)
        morphTo((demoIdx + 1) % DEMOS.length);
      return;
    }
    if (kState !== S_RUN) return;

    if (mode === 'attract') {
      if (body.hold) {
        aiHold -= DT;
        if (aiHold <= 0) release(body);
      } else if (body.ground) {
        const h = aiDecide(body, L, got);
        if (h > 0) {
          press(body);
          aiHold = h;
        }
      }
    }
    const wasGround = body.ground;
    const fl = stepBody(body, L);
    if (fl & F_JUMP) puff(body.x - 2, body.y, 2);
    if (fl & F_LAND) {
      landSquash = 0.1;
      if (!wasGround) puff(body.x, body.y, 3);
    }
    const li = collect(L, got, body);
    if (li >= 0) {
      gotN++;
      const c = li % COLS;
      const r = (li / COLS) | 0;
      burst(RP_LANTERN, K_FALL, c * T + 5, r * T + 5, 18, 16, 46, 16, 0.3, 0.7);
      emit({ type: 'lanterns', got: gotN, total });
    }
    if (reached(body, L)) {
      kState = S_CHEER;
      kT = 0;
      cheered = false;
      leapX = body.x;
      leapY = body.y;
      release(body);
      return;
    }
    if (body.y > LH + 20) {
      kState = S_GONE;
      kT = 0;
      puff(body.x, LH - 4, 10);
      if (mode === 'play') emit({ type: 'fall' });
      return;
    }
    if (mode === 'play' && body.blockedT > STUCK_S && !blockedSent) {
      const top = topOf(L, colOf(body.x + HW + 0.5));
      if (body.y - top > 24) {
        blockedSent = true;
        emit({ type: 'blocked' });
      }
    }
    dirty = true;
  }

  // ── Wiring ──
  const ro = new ResizeObserver(() => resize());
  ro.observe(box);
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    wake();
  });
  io.observe(box);
  const onVis = () => wake();
  document.addEventListener('visibilitychange', onVis);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onCancel);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('keydown', onKey);
  canvas.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('blur', onBlur);
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onMotion = () => {
    reduced = mq.matches;
    emit({ type: 'motion', reduced });
    if (reduced) {
      cancelAnimationFrame(raf);
      raf = 0;
      pOn.fill(0);
      pAlive = 0;
      finishIntro();
      if (mode !== 'build') enterBuild();
      paint();
    } else wake();
  };
  mq.addEventListener('change', onMotion);

  // First paint: the empty sky (the skyline builds itself once the page is
  // idle), or under reduced motion the whole level, Kiru at the start.
  if (reduced) {
    for (let c = 0; c < COLS; c++) disp[c] = L.h[c] * T;
    toriiDrop = 1;
    placeAtStart(body, L);
    kState = S_STAND;
  }
  resize();
  buildKiru();
  draw();
  emit({ type: 'ready' });
  emit({ type: 'mode', mode });
  emit({ type: 'motion', reduced });
  emit({ type: 'lanterns', got: 0, total });

  let idle = 0;
  const start = () => {
    started = true;
    wake();
  };
  const ric = (
    window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    }
  ).requestIdleCallback;
  if (ric) idle = ric(start, { timeout: 900 });
  else idle = window.setTimeout(start, 250);

  return {
    play: () => {
      if (mode === 'play' && kState === S_CHEER) restartRun();
      else enterPlay();
      canvas.focus({ preventScroll: true });
    },
    build: () => {
      enterBuild();
      canvas.focus({ preventScroll: true });
    },
    brush: (b) => setBrush(b),
    reset: () => {
      finishIntro();
      finishMorph();
      demoIdx = 0;
      const D = demoLevel(newLevel());
      for (let c = 0; c < COLS; c++) setHeight(c, D.h[c], c * 0.04);
      L.lan.set(D.lan);
      L.goal = D.goal;
      total = lanternCount(L);
      toriiDrop = reduced ? 1 : 0.0001;
      edited = false;
      traceOn = false;
      if (mode !== 'build') setMode('build');
      standAtStart();
      bakeScene();
      emit({ type: 'lanterns', got: 0, total });
      paint();
    },
    jumpDown,
    jumpUp,
    focus: () => canvas.focus({ preventScroll: true }),
    destroy: () => {
      cancelAnimationFrame(raf);
      raf = 0;
      started = false;
      if (ric)
        (
          window as unknown as { cancelIdleCallback: (n: number) => void }
        ).cancelIdleCallback(idle);
      else clearTimeout(idle);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      mq.removeEventListener('change', onMotion);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('keydown', onKey);
      canvas.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('blur', onBlur);
    },
  };
}
