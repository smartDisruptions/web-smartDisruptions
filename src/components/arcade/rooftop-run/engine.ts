/**
 * Kiru's Rooftop Run — the engine. Canvas 2D, no libraries, no React.
 *
 * Nothing here is in the page's bundle: ../RooftopRun.tsx imports this module
 * (through Game.tsx) only when a player presses Start.
 *
 * - Simulation runs at a fixed 120 Hz; rendering interpolates between the last
 *   two steps, so it is equally smooth at 60, 90, 120 or 144 Hz, and a slow
 *   device simulates exactly the same game as a fast one.
 * - The world is a fixed height (280 units) and as wide as the screen's
 *   aspect allows, clamped to 380–640: a portrait phone sees more sky rather
 *   than less road, and the run speed scales with the visible width so the
 *   time you get to react is about the same everywhere.
 * - The skyline layers are drawn once, procedurally, into offscreen tiles and
 *   then only blitted; per frame there are no shadows and no gradients built.
 * - The loop runs only while Kiru is running or falling. Paused, game over,
 *   tab hidden, scrolled away: no requestAnimationFrame at all.
 * - Reduced motion: no screen shake and no flash.
 */
import { drawKiru, type KiruFrame, type KiruState } from './kiru';
import type { Sfx } from './sfx';

export type Mode = 'running' | 'paused' | 'dying' | 'over';
export interface RunStats {
  score: number;
  best: number;
  newBest: boolean;
  coins: number;
}
export interface EngineOptions {
  reducedMotion: boolean;
  touch: boolean;
  sfx: Sfx;
  /** CSS font-family list for the score (the site's display face). */
  hudFont: string;
  onMode: (mode: Mode, stats: RunStats) => void;
  onSoundKey: () => void;
}
export interface Engine {
  pause(): void;
  resume(): void;
  restart(): void;
  destroy(): void;
  readonly mode: Mode;
}

// ── Tuning (world units: the view is 280 tall) ─────────────────────────────
const STEP = 1 / 120;
const BASE_H = 280;
const W_MIN = 380;
const W_MAX = 640;
const KIRU_H = 44;
const KIRU_SCALE = KIRU_H / 208; // the rig is 208 SVG units from hood to sole
const G = 2300; // gravity
const G_HOLD = 1150; // gravity while rising with the button held
const JUMP_V = 480;
const DJUMP_V = 440;
const HOLD_MAX = 0.24;
const DHOLD_MAX = 0.14;
const MIN_HOLD = 0.075; // a tap still clears a chimney
const CUT_V = 210; // releasing early caps the rise at this speed
const MAX_FALL = 950;
const COYOTE = 0.09; // a jump still counts just after the edge
const BUFFER = 0.13; // a press just before landing still counts
const SPEED_0 = 255;
const SPEED_1 = 520;
const RAMP = 14000;
const BEST_KEY = 'sd-rooftop-run-best';

const TAU = Math.PI * 2;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * How far a full-strength jump carries at `speed` before it comes back down
 * to `dh` above the take-off (and, with `double`, a full double jump at the
 * top). The level generator sizes every gap from this, so no gap is ever
 * wider than the physics can clear.
 */
function reach(speed: number, dh: number, double: boolean): number {
  let h = 0;
  let v = JUMP_V;
  let hold = 0;
  let max = HOLD_MAX;
  let dj = double;
  for (let i = 1; i < 600; i++) {
    let g = G;
    if (v > 0 && hold < max) {
      g = G_HOLD;
      hold += STEP;
    }
    v = Math.max(-MAX_FALL, v - g * STEP);
    h += v * STEP;
    if (dj && v <= 0) {
      v = DJUMP_V;
      hold = 0;
      max = DHOLD_MAX;
      dj = false;
    }
    if (v < 0 && h <= dh) return speed * i * STEP;
  }
  return 0;
}

interface Roof {
  x: number;
  w: number;
  top: number; // height of the walking surface above the bottom of the view
  body: string;
  win: number[]; // [dx, dyFromTop, lit] triples
  deco: number;
  hue: number;
}
interface Ob {
  kind: 0 | 1 | 2; // chimney, lantern gate, crow
  x: number;
  w: number;
  h: number;
  base: number;
  high: boolean;
  phase: number;
  vc: number;
  px: number; // crow: previous x, for interpolation
  meet: number;
}
interface Pick {
  star: boolean;
  x: number;
  h: number;
  got: boolean;
  phase: number;
}
interface Part {
  on: boolean;
  kind: number; // 0 dust, 1 spark, 2 ring, 3 smoke, 4 feather
  x: number;
  h: number;
  vx: number;
  vh: number;
  life: number;
  max: number;
  size: number;
  rot: number;
}
interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  s: number;
}
interface Pop {
  x: number;
  h: number;
  t: number;
  text: string;
}

const BODIES = ['#151937', '#171b3d', '#131633', '#1a1d40'];
const NEONS = ['#ff4f9a', '#3de1ff', '#ffb547'];

export function createRooftopRun(canvas: HTMLCanvasElement, opts: EngineOptions): Engine {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D is not available');
  const reduced = opts.reducedMotion;
  const sfx = opts.sfx;

  // ── View ─────────────────────────────────────────────────────────────────
  let cssW = 0;
  let cssH = 0;
  let dpr = 1;
  let quality = 1;
  let W = 560;
  let Hv = BASE_H;
  let ppu = 1; // device pixels per world unit
  let kiruSX = 110;
  let speedK = 1;
  let TW = 600; // parallax tile width
  let far: HTMLCanvasElement | null = null;
  let mid: HTMLCanvasElement | null = null;
  let near: HTMLCanvasElement | null = null;
  const FAR_H = 210;
  const MID_H = 190;
  const NEAR_H = 150;
  let sky: CanvasGradient | null = null;
  let moon: HTMLCanvasElement | null = null;
  const glow: Record<string, HTMLCanvasElement> = {};
  const clouds: HTMLCanvasElement[] = [];
  const CLOUD_W = 130;
  const CLOUD_H = 40;

  // ── Run state ────────────────────────────────────────────────────────────
  let mode: Mode = 'running';
  let rng = mulberry32(Date.now());
  let t = 0;
  let runT = 0;
  let speed = SPEED_0;
  let kx = 0;
  let kh = 0;
  let pkx = 0;
  let pkh = 0;
  let vy = 0;
  let grounded = true;
  let coyote = 0;
  let buffer = 0;
  let held = false;
  let pressQueued = false;
  let holdT = 0;
  let jumpT = 0;
  let cuttable = false;
  let airJumps = 1;
  let isDouble = false;
  let flipT = -1;
  let sqx = 1;
  let sqy = 1;
  let airBlend = 0;
  let fallBlend = 0;
  let phase = 0;
  let blinkIn = 2.4;
  let blinkT = 0;
  let deathT = 0;
  let deathKind: 'hit' | 'fall' = 'fall';
  let knockVx = 0;
  let spin = 0;
  let shake = 0;
  let flash = 0;
  let coins = 0;
  let stars = 0;
  let score = 0;
  let best = 0;
  let newBest = false;
  let passedBest = false;
  let runs = 0;
  let overAt = 0;
  let nextStarAt = 2600;
  let petalIn = 0;
  let seenVisible = false;
  let disposed = false;

  try {
    best = parseInt(localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    best = 0;
  }

  const roofs: Roof[] = [];
  const obs: Ob[] = [];
  const picks: Pick[] = [];
  const parts: Part[] = Array.from({ length: 140 }, () => ({
    on: false,
    kind: 0,
    x: 0,
    h: 0,
    vx: 0,
    vh: 0,
    life: 0,
    max: 1,
    size: 1,
    rot: 0,
  }));
  const petals: Petal[] = [];
  const pops: Pop[] = [];
  const starsBg: number[] = [];
  {
    const r = mulberry32(42);
    for (let i = 0; i < 70; i++) starsBg.push(r(), r() * 0.58, 0.5 + r() * 1.1, r() * TAU, 0.6 + r() * 2.2);
  }

  const speedAt = (x: number) => speedK * (SPEED_0 + (SPEED_1 - SPEED_0) * (1 - Math.exp(-Math.max(0, x) / RAMP)));
  const rnd = (a: number, b: number) => a + (b - a) * rng();

  function emit(kind: number, x: number, h: number, vx: number, vh: number, life: number, size: number) {
    for (const p of parts) {
      if (p.on) continue;
      p.on = true;
      p.kind = kind;
      p.x = x;
      p.h = h;
      p.vx = vx;
      p.vh = vh;
      p.life = 0;
      p.max = life;
      p.size = size;
      p.rot = rng() * TAU;
      return;
    }
  }

  // ── Level generation ─────────────────────────────────────────────────────
  function makeRoof(x: number, w: number, top: number): Roof {
    const win: number[] = [];
    const cols = Math.floor((w - 14) / 17);
    const rows = Math.max(1, Math.floor((top - 18) / 19));
    const lit = 0.25 + rng() * 0.25;
    for (let c = 0; c < cols; c++) {
      if (c % 4 === 3) continue; // pillars between bays
      for (let r = 0; r < rows; r++) {
        if (rng() < 0.82) win.push(10 + c * 17, 20 + r * 19, rng() < lit ? 1 : 0);
      }
    }
    return {
      x,
      w,
      top,
      body: BODIES[Math.floor(rng() * BODIES.length)],
      win,
      deco: Math.floor(rng() * 16),
      hue: Math.floor(rng() * NEONS.length),
    };
  }

  /** Coins along a jump arc: they draw the line the jump should take. */
  function arcCoins(x0: number, h0: number, s: number, holdMax: number, dbl: boolean, landTop: number) {
    let h = h0;
    let v = JUMP_V;
    let hold = 0;
    let max = holdMax;
    let dj = dbl;
    let next = 0.09;
    let n = 0;
    for (let i = 1; i < 400 && n < 10; i++) {
      let g = G;
      if (v > 0 && hold < max) {
        g = G_HOLD;
        hold += STEP;
      }
      v = Math.max(-MAX_FALL, v - g * STEP);
      h += v * STEP;
      if (dj && v <= 0) {
        v = DJUMP_V;
        hold = 0;
        max = DHOLD_MAX;
        dj = false;
      }
      const tt = i * STEP;
      if (v < 0 && h <= landTop + 12) break;
      if (tt >= next) {
        picks.push({ star: false, x: x0 + s * tt, h: h + 14, got: false, phase: n * 0.5 });
        n++;
        next += 0.075;
      }
    }
  }

  /**
   * Dress a roof with hazards and coins. `land` is how far in from the roof's
   * edge a sensible jump over the gap before it comes down: nothing is placed
   * there, and nothing is placed so close to the far edge that clearing it
   * would leave no room to jump the next gap.
   */
  function populate(roof: Roof, s: number, d: number, land: number) {
    const endEdge = roof.x + roof.w;
    const stop = endEdge - Math.max(50, s * 0.22);
    let cur = roof.x + Math.max(110, land + s * 0.28);
    const after = Math.max(140, s * 0.62); // a hop lands about s*0.21 on, then time to react
    while (cur < stop) {
      const room = stop - cur;
      if (rng() < 0.52 + 0.26 * d) {
        // Pick among the hazards that fit the room that is left.
        const cw = rnd(15, 21);
        const fits = [
          room > cw + s * 0.3 + 20 ? 1 : 0, // chimney: hop it, land, react
          d > 0.04 && room > 72 + s * 0.12 ? 0.55 : 0, // lantern gate: just run under
          d > 0.08 && room > 30 + s * 0.3 ? 0.6 : 0, // crow
        ];
        const total = fits[0] + fits[1] + fits[2];
        if (total === 0) break;
        let k = rng() * total;
        const kind = (k -= fits[0]) < 0 ? 0 : (k -= fits[1]) < 0 ? 1 : 2;
        if (kind === 0) {
          obs.push({ kind: 0, x: cur, w: cw, h: rnd(19, 31), base: roof.top, high: false, phase: rng() * TAU, vc: 0, px: 0, meet: 0 });
          if (rng() < 0.45) arcCoins(cur - s * 0.17, roof.top, s, MIN_HOLD + 0.04, false, roof.top);
          cur += cw + after;
        } else if (kind === 1) {
          const gx = cur + 36;
          obs.push({ kind: 1, x: gx, w: 0, h: 0, base: roof.top, high: true, phase: rng() * TAU, vc: 0, px: 0, meet: 0 });
          // Coins under the lantern pay for keeping your feet on the roof.
          for (let i = -1; i <= 1; i++) picks.push({ star: false, x: gx + i * 19, h: roof.top + 13, got: false, phase: i });
          cur = gx + 36 + Math.max(110, s * 0.45);
        } else {
          const high = rng() < 0.42;
          const meet = cur + 16;
          const vc = rnd(70, 115) + 50 * d;
          const x = meet + (vc * (meet - kx)) / Math.max(1, speed);
          obs.push({ kind: 2, x, w: 0, h: 0, base: roof.top, high, phase: rng() * TAU, vc, px: x, meet });
          cur = meet + (high ? Math.max(120, s * 0.45) : after);
        }
      } else if (rng() < 0.6 && room > 110) {
        const n = 3 + Math.floor(rng() * 4);
        for (let i = 0; i < n; i++) picks.push({ star: false, x: cur + i * 19, h: roof.top + 14, got: false, phase: i * 0.6 });
        cur += n * 19 + 60;
      } else {
        cur += rnd(50, 110);
      }
    }
    // A shuriken every so often, up where only a double jump reaches.
    if (roof.x > nextStarAt && roof.w > 220) {
      picks.push({ star: true, x: roof.x + roof.w * rnd(0.35, 0.65), h: roof.top + rnd(132, 148), got: false, phase: 0 });
      nextStarAt = roof.x + rnd(2400, 3400);
    }
  }

  function addRoof() {
    const prev = roofs[roofs.length - 1];
    const x0 = prev.x + prev.w;
    const d = clamp(x0 / 16000, 0, 1);
    const s = speedAt(x0);
    const top = clamp(prev.top + rnd(-44, 36) * (0.55 + 0.45 * d), 42, 124);
    const dh = top - prev.top;
    const r1 = reach(s, dh, false);
    let gap: number;
    let land: number;
    let dbl = false;
    if (d > 0.2 && rng() < 0.1 + 0.16 * d) {
      const r2 = reach(s, dh, true);
      const lo = Math.max(r1 * 0.96, 60);
      gap = rnd(lo, Math.max(lo + 8, r2 * 0.7));
      dbl = true;
      land = Math.max(0, r2 + 12 - gap);
    } else {
      gap = rnd(36 + 30 * d, Math.max(58, r1 * (0.4 + 0.38 * d)));
      // Plenty of players hold the button on every gap, so leave room for a
      // full jump taken just before the edge to come down clear.
      land = Math.max(30, r1 + 12 - gap);
    }
    // Roofs are measured in seconds of running, so the rhythm holds as the
    // speed climbs instead of the town thinning out.
    const w = s * rnd(lerp(1.5, 1.05, d), lerp(2.8, 1.95, d));
    const roof = makeRoof(x0 + gap, w, top);
    if (rng() < 0.55 || dbl) arcCoins(x0 - 12, prev.top, s, HOLD_MAX, dbl, top);
    roofs.push(roof);
    populate(roof, s, d, land);
  }

  function reset() {
    rng = mulberry32((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    roofs.length = 0;
    obs.length = 0;
    picks.length = 0;
    pops.length = 0;
    for (const p of parts) p.on = false;
    t = 0;
    runT = 0;
    kx = 0;
    pkx = 0;
    kh = 72;
    pkh = 72;
    vy = 0;
    grounded = true;
    coyote = 0;
    buffer = 0;
    pressQueued = false;
    holdT = 0;
    jumpT = 0;
    cuttable = false;
    airJumps = 1;
    isDouble = false;
    flipT = -1;
    sqx = 1;
    sqy = 1;
    airBlend = 0;
    fallBlend = 0;
    deathT = 0;
    spin = 0;
    shake = 0;
    flash = 0;
    coins = 0;
    stars = 0;
    score = 0;
    newBest = false;
    passedBest = false;
    nextStarAt = 2600;
    speed = speedAt(0);
    // A long, empty first roof: room to find your feet.
    roofs.push(makeRoof(-260, 980, 72));
    while (roofs[roofs.length - 1].x < kx + W + 500) addRoof();
  }

  // ── Physics ──────────────────────────────────────────────────────────────
  function roofUnder(x: number): Roof | null {
    for (const r of roofs) if (x + 7 >= r.x && x - 7 <= r.x + r.w) return r;
    return null;
  }

  function groundJump() {
    vy = JUMP_V;
    grounded = false;
    coyote = 0;
    buffer = 0;
    holdT = 0;
    jumpT = 0;
    cuttable = true;
    isDouble = false;
    sqx = 0.78;
    sqy = 1.24;
    for (let i = 0; i < 5; i++) emit(0, kx - 4 + rng() * 8, kh + 1, -speed * 0.25 - rng() * 40, 10 + rng() * 30, 0.35, 3 + rng() * 2);
    sfx.jump();
  }

  function doubleJump() {
    vy = DJUMP_V;
    airJumps--;
    isDouble = true;
    holdT = 0;
    jumpT = 0;
    cuttable = true;
    flipT = 0;
    sqx = 0.86;
    sqy = 1.16;
    emit(2, kx, kh + 4, -speed * 0.35, 0, 0.32, 4);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      emit(0, kx, kh + 6, Math.cos(a) * 60 - speed * 0.3, Math.sin(a) * 40, 0.3, 2.5);
    }
    sfx.doubleJump();
  }

  function land(r: Roof, impact: number) {
    kh = r.top;
    vy = 0;
    grounded = true;
    airJumps = 1;
    isDouble = false;
    flipT = -1;
    cuttable = false;
    holdT = 0;
    const k = clamp(impact / 700, 0.25, 1);
    sqx = 1 + 0.32 * k;
    sqy = 1 - 0.28 * k;
    const n = Math.round(3 + 5 * k);
    for (let i = 0; i < n; i++) {
      const dir = i % 2 ? 1 : -1;
      emit(0, kx + dir * 6, r.top + 1, dir * (30 + rng() * 60) - speed * 0.2, 8 + rng() * 26, 0.4, 2.5 + rng() * 2.5);
    }
    if (k > 0.4) sfx.land();
  }

  function die(kind: 'hit' | 'fall') {
    mode = 'dying';
    deathKind = kind;
    deathT = 0;
    held = false;
    if (kind === 'hit') {
      vy = 380;
      knockVx = -70;
      spin = 0;
      grounded = false;
      if (!reduced) {
        shake = 7;
        flash = 0.55;
      }
      for (let i = 0; i < 12; i++) emit(1, kx, kh + 22, rnd(-120, 120), rnd(-60, 160), 0.5, 2 + rng() * 2);
      sfx.hit();
    } else {
      sfx.fall();
    }
    emitMode();
  }

  function over() {
    mode = 'over';
    overAt = performance.now();
    if (score > best) {
      best = score;
      newBest = true;
      try {
        localStorage.setItem(BEST_KEY, String(best));
      } catch {
        /* private mode or blocked storage: the best just isn't remembered */
      }
    }
    canvas.removeAttribute('data-playing');
    emitMode();
  }

  function emitMode() {
    opts.onMode(mode, { score, best: Math.max(best, score), newBest, coins: coins + stars });
  }

  const boxHit = (x0: number, h0: number, x1: number, h1: number) =>
    kx + 7 > x0 && kx - 7 < x1 && kh + 36 > h0 && kh + 3 < h1;
  const circleHit = (cx: number, ch: number, r: number) => {
    const nx = clamp(cx, kx - 7, kx + 7);
    const nh = clamp(ch, kh + 3, kh + 36);
    const dx = cx - nx;
    const dh = ch - nh;
    return dx * dx + dh * dh < r * r;
  };

  function step(dt: number) {
    t += dt;
    pkx = kx;
    pkh = kh;
    for (const o of obs) o.px = o.x;

    if (mode === 'running') {
      runT += dt;
      speed = speedAt(kx);
      kx += speed * dt;
      phase += dt * (9 + speed * 0.021);

      coyote = grounded ? COYOTE : Math.max(0, coyote - dt);
      buffer = Math.max(0, buffer - dt);
      if (pressQueued) {
        pressQueued = false;
        if (grounded || coyote > 0) groundJump();
        else if (airJumps > 0) doubleJump();
        else buffer = BUFFER;
      } else if (buffer > 0 && grounded) {
        groundJump();
      }

      if (!grounded) {
        let g = G;
        if (vy > 0 && held && holdT < (isDouble ? DHOLD_MAX : HOLD_MAX)) {
          g = G_HOLD;
          holdT += dt;
        }
        jumpT += dt;
        if (cuttable && !held && jumpT >= MIN_HOLD) {
          if (vy > CUT_V) vy = CUT_V;
          cuttable = false;
        }
        const prevH = kh;
        vy = Math.max(-MAX_FALL, vy - g * dt);
        kh += vy * dt;
        const r = roofUnder(kx);
        if (r && vy <= 0 && prevH >= r.top - 0.01 && kh <= r.top) land(r, -vy);
      } else {
        const r = roofUnder(kx);
        if (!r || Math.abs(r.top - kh) > 0.5) {
          grounded = false;
          vy = 0;
          jumpT = MIN_HOLD;
          cuttable = false;
        }
      }
      if (flipT >= 0) {
        flipT += dt;
        if (flipT > 0.4) flipT = -1;
      }

      // Walls: falling short into the side of the next roof is a bonk. (Only
      // a roof that starts ahead of him — never the one he just ran off.)
      for (const r of roofs) {
        if (r.x > kx + 20) break;
        if (r.x > kx - 8 && kx + 8 > r.x && kh < r.top - 4) {
          die('hit');
          return;
        }
      }
      if (kh < -50) {
        die('fall');
        return;
      }

      // Hazards.
      for (const o of obs) {
        if (o.kind === 2) o.x = o.meet + (o.vc * (o.meet - kx)) / Math.max(1, speed);
        const sx = o.kind === 0 ? o.x : o.x - 40;
        if (sx > kx + 60) continue;
        if (o.kind === 0) {
          if (boxHit(o.x + 1.5, o.base, o.x + o.w - 1.5, o.base + o.h - 1)) return die('hit');
        } else if (o.kind === 1) {
          const sway = Math.sin(t * 2.1 + o.phase) * 3;
          if (circleHit(o.x + sway, o.base + 59, 10) || boxHit(o.x - 34, o.base + 80, o.x + 34, o.base + 88)) return die('hit');
        } else {
          const ch = o.base + (o.high ? 62 : 13) + Math.sin(t * 6 + o.phase) * 2.5;
          if (circleHit(o.x, ch, 8.5)) return die('hit');
        }
      }

      // Pickups.
      for (const p of picks) {
        if (p.got || p.x > kx + 20) continue;
        if (p.x < kx - 20) continue;
        if (circleHit(p.x, p.h, p.star ? 11 : 9)) {
          p.got = true;
          if (p.star) {
            stars++;
            pops.push({ x: p.x, h: p.h + 8, t: 0, text: '+50' });
            for (let i = 0; i < 14; i++) emit(1, p.x, p.h, rnd(-140, 140), rnd(-140, 140), 0.55, 2 + rng() * 2.5);
            sfx.shuriken();
          } else {
            coins++;
            for (let i = 0; i < 5; i++) emit(1, p.x, p.h, rnd(-70, 70) - speed * 0.2, rnd(-40, 100), 0.4, 1.6 + rng() * 1.4);
            sfx.coin();
          }
        }
      }

      score = Math.floor(kx / 10) + coins * 10 + stars * 50;
      if (!passedBest && best > 0 && score > best) {
        passedBest = true;
        pops.push({ x: kx + 30, h: kh + 70, t: 0, text: 'NEW BEST' });
        sfx.best();
      }

      // Keep the road ahead built, and forget what is behind.
      while (roofs[roofs.length - 1].x < kx + W + 500) addRoof();
      const cut = kx - kiruSX - 120;
      while (roofs.length > 2 && roofs[0].x + roofs[0].w < cut) roofs.shift();
      for (let i = obs.length - 1; i >= 0; i--) if ((obs[i].kind === 2 ? obs[i].x + 20 : obs[i].x + 60) < cut) obs.splice(i, 1);
      for (let i = picks.length - 1; i >= 0; i--) if (picks[i].x < cut) picks.splice(i, 1);

      // A chimney breathes a little smoke.
      for (const o of obs) {
        if (o.kind === 0 && o.x > kx - kiruSX && o.x < kx + W && rng() < dt * 3) {
          emit(3, o.x + o.w / 2, o.base + o.h + 3, -12 - rng() * 10, 16 + rng() * 10, 1.6, 3.5);
        }
      }
    } else if (mode === 'dying') {
      deathT += dt;
      speed = Math.max(0, speed - (deathKind === 'hit' ? 2400 : 900) * dt);
      kx += speed * dt;
      if (deathKind === 'hit') {
        kx += knockVx * dt;
        spin += dt * 11;
      }
      vy = Math.max(-MAX_FALL, vy - G * 0.85 * dt);
      kh += vy * dt;
      for (const o of obs) if (o.kind === 2) o.x -= o.vc * dt;
      if (deathT > 1.05) {
        over();
        return;
      }
    }

    // Shared: particles, petals, popups, springs, blink.
    for (const p of parts) {
      if (!p.on) continue;
      p.life += dt;
      if (p.life >= p.max) {
        p.on = false;
        continue;
      }
      p.x += p.vx * dt;
      p.h += p.vh * dt;
      if (p.kind === 1) p.vh -= 260 * dt;
      else if (p.kind === 0) {
        p.vx *= 1 - 3 * dt;
        p.vh *= 1 - 3 * dt;
      }
    }
    petalIn -= dt;
    if (petalIn <= 0 && petals.length < (reduced ? 6 : 16)) {
      petalIn = 0.35 + rng() * 0.5;
      petals.push({ x: W * (0.25 + rng() * 0.85), y: -6, vx: -20 - rng() * 30, vy: 18 + rng() * 22, rot: rng() * TAU, vr: rnd(-3, 3), s: 1.6 + rng() * 1.6 });
    }
    const wind = mode === 'running' ? speed * 0.22 : 0;
    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.x += (p.vx - wind) * dt + Math.sin(t * 2 + p.rot) * 12 * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.x < -10 || p.y > Hv + 10) petals.splice(i, 1);
    }
    for (let i = pops.length - 1; i >= 0; i--) {
      pops[i].t += dt;
      if (pops[i].t > 1.1) pops.splice(i, 1);
    }
    sqx += (1 - sqx) * Math.min(1, dt * 13);
    sqy += (1 - sqy) * Math.min(1, dt * 13);
    airBlend += ((grounded && mode === 'running' ? 0 : 1) - airBlend) * Math.min(1, dt * 16);
    fallBlend += ((vy < -40 ? 1 : 0) - fallBlend) * Math.min(1, dt * 9);
    shake = Math.max(0, shake - dt * 22);
    flash = Math.max(0, flash - dt * 3.2);
    blinkIn -= dt;
    if (blinkIn <= 0) {
      blinkT = 0.11;
      blinkIn = 2 + rng() * 3.5;
    }
    blinkT = Math.max(0, blinkT - dt);
  }

  // ── Art: baked once per size ─────────────────────────────────────────────
  function makeCanvas(w: number, h: number) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w));
    c.height = Math.max(1, Math.ceil(h));
    return c;
  }

  function roofPath(g: CanvasRenderingContext2D, cx: number, y: number, hw: number, rise: number) {
    // A hip roof with upturned corners — the curl is what reads as Japanese.
    g.moveTo(cx - hw - 8, y - 5);
    g.quadraticCurveTo(cx - hw + 2, y + 3, cx - hw * 0.62, y - 4);
    g.lineTo(cx - hw * 0.22, y - rise);
    g.lineTo(cx + hw * 0.22, y - rise);
    g.lineTo(cx + hw * 0.62, y - 4);
    g.quadraticCurveTo(cx + hw - 2, y + 3, cx + hw + 8, y - 5);
    g.lineTo(cx + hw - 4, y + 4);
    g.lineTo(cx - hw + 4, y + 4);
    g.closePath();
  }

  function bake() {
    const r = mulberry32(7);
    TW = Math.ceil(W) + 2;

    // Far: mountains and a snow-capped peak, soft and low-res on purpose.
    {
      const q = 0.5;
      const c = makeCanvas(TW * ppu * q, FAR_H * ppu * q);
      const g = c.getContext('2d')!;
      g.scale(ppu * q, ppu * q);
      const ridge = (x: number) => {
        const a = (x / TW) * TAU;
        return 96 + 20 * Math.sin(a + 0.6) + 11 * Math.sin(a * 3 + 1.3) + 6 * Math.sin(a * 7 + 2.1);
      };
      const gr = g.createLinearGradient(0, FAR_H - 160, 0, FAR_H);
      gr.addColorStop(0, '#20275a');
      gr.addColorStop(1, '#151a3e');
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(0, FAR_H);
      for (let x = 0; x <= TW; x += 4) g.lineTo(x, FAR_H - ridge(x));
      g.lineTo(TW, FAR_H);
      g.closePath();
      g.fill();
      // The peak.
      const px = TW * 0.66;
      const peak = (dx: number) => FAR_H - 178 + Math.pow(Math.abs(dx) / 120, 1.35) * 120;
      g.fillStyle = '#1c2250';
      g.beginPath();
      g.moveTo(px - 150, FAR_H);
      for (let dx = -150; dx <= 150; dx += 5) g.lineTo(px + dx, Math.min(FAR_H, peak(dx)));
      g.lineTo(px + 150, FAR_H);
      g.fill();
      g.fillStyle = 'rgba(205, 214, 255, 0.5)';
      g.beginPath();
      g.moveTo(px - 30, peak(-30));
      for (let dx = -30; dx <= 30; dx += 3) g.lineTo(px + dx, peak(dx));
      for (let dx = 30; dx >= -30; dx -= 6) g.lineTo(px + dx, peak(dx) + 7 + 4 * Math.sin(dx * 0.5));
      g.closePath();
      g.fill();
      const mist = g.createLinearGradient(0, FAR_H - 90, 0, FAR_H);
      mist.addColorStop(0, 'rgba(70, 52, 120, 0)');
      mist.addColorStop(1, 'rgba(88, 52, 120, 0.55)');
      g.fillStyle = mist;
      g.fillRect(0, FAR_H - 90, TW, 90);
      far = c;
    }

    // Mid: the town — towers, a pagoda, a few neon signs.
    {
      const q = 0.75;
      const c = makeCanvas(TW * ppu * q, MID_H * ppu * q);
      const g = c.getContext('2d')!;
      g.scale(ppu * q, ppu * q);
      const blds: number[] = [];
      let x = -10;
      while (x < TW) {
        const w = 18 + r() * 40;
        const h = 44 + r() * 82 + (r() < 0.12 ? 40 : 0);
        blds.push(x, w, h, r());
        x += w + 2 + r() * 12;
      }
      const drawTown = (ox: number) => {
        g.fillStyle = '#141a40';
        g.beginPath();
        for (let i = 0; i < blds.length; i += 4) {
          const bx = blds[i] + ox;
          const bw = blds[i + 1];
          const bh = blds[i + 2];
          g.rect(bx, MID_H - bh, bw, bh);
          if (blds[i + 3] < 0.4) roofPath(g, bx + bw / 2, MID_H - bh, bw / 2 + 2, 9);
        }
        g.fill();
        // The pagoda.
        const cx = TW * 0.28 + ox;
        g.beginPath();
        for (let k = 0; k < 5; k++) {
          const hw = 30 - k * 4;
          const base = MID_H - 30 - k * 24;
          g.rect(cx - hw * 0.55, base - 16, hw * 1.1, 18);
          roofPath(g, cx, base - 16, hw, 9);
        }
        g.rect(cx - 1, MID_H - 30 - 5 * 24 - 26, 2, 30);
        g.rect(cx - 4, MID_H - 30, 8, 30);
        g.fill();
        // Windows.
        g.fillStyle = 'rgba(255, 207, 112, 0.75)';
        g.beginPath();
        for (let i = 0; i < blds.length; i += 4) {
          const bx = blds[i] + ox;
          const bw = blds[i + 1];
          const bh = blds[i + 2];
          const seed = blds[i + 3];
          for (let wy = MID_H - bh + 8; wy < MID_H - 6; wy += 9) {
            for (let wx = bx + 4; wx < bx + bw - 5; wx += 7) {
              if (((wx * 13.1 + wy * 7.7 + seed * 100) % 10) < 1.3) g.rect(wx, wy, 2.4, 3);
            }
          }
        }
        g.fill();
        // Neon signs.
        g.save();
        for (let i = 0; i < blds.length; i += 4) {
          if (blds[i + 3] > 0.82 && blds[i + 1] > 24) {
            const col = NEONS[Math.floor(blds[i + 3] * 100) % 3];
            g.shadowColor = col;
            g.shadowBlur = 8;
            g.fillStyle = col;
            g.fillRect(blds[i] + ox + blds[i + 1] * 0.35, MID_H - blds[i + 2] + 10, 3.5, Math.min(32, blds[i + 2] * 0.4));
          }
        }
        g.restore();
      };
      drawTown(0);
      drawTown(TW);
      drawTown(-TW);
      const mist = g.createLinearGradient(0, MID_H - 70, 0, MID_H);
      mist.addColorStop(0, 'rgba(40, 30, 80, 0)');
      mist.addColorStop(1, 'rgba(60, 34, 90, 0.5)');
      g.fillStyle = mist;
      g.fillRect(0, MID_H - 70, TW, 70);
      mid = c;
    }

    // Near: big dark roofs with warm windows and strings of lanterns.
    {
      const c = makeCanvas(TW * ppu, NEAR_H * ppu);
      const g = c.getContext('2d')!;
      g.scale(ppu, ppu);
      const blds: number[] = [];
      let x = -20;
      while (x < TW) {
        const w = 46 + r() * 70;
        const h = 34 + r() * 66;
        blds.push(x, w, h, r());
        x += w + 4 + r() * 22;
      }
      const drawRow = (ox: number) => {
        g.fillStyle = '#0d1030';
        g.beginPath();
        for (let i = 0; i < blds.length; i += 4) {
          const bx = blds[i] + ox;
          const bw = blds[i + 1];
          const bh = blds[i + 2];
          g.rect(bx + 4, NEAR_H - bh, bw - 8, bh);
          roofPath(g, bx + bw / 2, NEAR_H - bh, bw / 2, 14 + blds[i + 3] * 8);
        }
        g.fill();
        g.fillStyle = 'rgba(255, 190, 110, 0.85)';
        g.beginPath();
        for (let i = 0; i < blds.length; i += 4) {
          const bx = blds[i] + ox;
          const bw = blds[i + 1];
          const bh = blds[i + 2];
          for (let wy = NEAR_H - bh + 12; wy < NEAR_H - 8; wy += 14) {
            for (let wx = bx + 10; wx < bx + bw - 12; wx += 13) {
              if (((wx * 3.7 + wy * 11.3 + blds[i + 3] * 50) % 10) < 1.6) g.rect(wx, wy, 5, 6);
            }
          }
        }
        g.fill();
        // Lantern strings between rooftops.
        g.save();
        g.shadowColor = '#ff7a3d';
        g.shadowBlur = 6;
        for (let i = 0; i < blds.length - 4; i += 8) {
          const ax = blds[i] + ox + blds[i + 1] * 0.8;
          const ay = NEAR_H - blds[i + 2] + 10;
          const bx = blds[i + 4] + ox + blds[i + 5] * 0.2;
          const by = NEAR_H - blds[i + 6] + 10;
          g.strokeStyle = 'rgba(40, 30, 50, 0.9)';
          g.lineWidth = 0.6;
          g.beginPath();
          g.moveTo(ax, ay);
          g.quadraticCurveTo((ax + bx) / 2, Math.max(ay, by) + 12, bx, by);
          g.stroke();
          for (let k = 1; k < 6; k++) {
            const u = k / 6;
            const lx = lerp(ax, bx, u);
            const ly = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * (Math.max(ay, by) + 12) + u * u * by;
            g.fillStyle = k % 2 ? '#ff6b3d' : '#ffc46b';
            g.beginPath();
            g.ellipse(lx, ly + 3, 2.2, 2.8, 0, 0, TAU);
            g.fill();
          }
        }
        g.restore();
      };
      drawRow(0);
      drawRow(TW);
      drawRow(-TW);
      near = c;
    }

    // Sky, moon, glows, clouds.
    sky = ctx!.createLinearGradient(0, 0, 0, Hv);
    sky.addColorStop(0, '#060716');
    sky.addColorStop(0.42, '#111540');
    sky.addColorStop(0.74, '#271c52');
    sky.addColorStop(1, '#3d1f4a');

    {
      const R = 21;
      const S = 80;
      const c = makeCanvas(S * 2 * ppu, S * 2 * ppu);
      const g = c.getContext('2d')!;
      g.scale(ppu, ppu);
      const halo = g.createRadialGradient(S, S, R * 0.8, S, S, S);
      halo.addColorStop(0, 'rgba(255, 236, 200, 0.32)');
      halo.addColorStop(0.35, 'rgba(255, 220, 190, 0.1)');
      halo.addColorStop(1, 'rgba(255, 220, 190, 0)');
      g.fillStyle = halo;
      g.fillRect(0, 0, S * 2, S * 2);
      const disc = g.createRadialGradient(S - 6, S - 7, 2, S, S, R);
      disc.addColorStop(0, '#fffaf0');
      disc.addColorStop(1, '#f6e2b8');
      g.fillStyle = disc;
      g.beginPath();
      g.arc(S, S, R, 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(214, 190, 150, 0.45)';
      for (const [dx, dy, rr] of [
        [-7, -4, 4.5],
        [6, 5, 3.4],
        [3, -9, 2.4],
        [-3, 9, 2],
        [10, -3, 1.8],
      ]) {
        g.beginPath();
        g.arc(S + dx, S + dy, rr, 0, TAU);
        g.fill();
      }
      moon = c;
    }

    const glowSprite = (col: string) => {
      const S = 32;
      const c = makeCanvas(S * 2 * ppu, S * 2 * ppu);
      const g = c.getContext('2d')!;
      g.scale(ppu, ppu);
      const rg = g.createRadialGradient(S, S, 0, S, S, S);
      rg.addColorStop(0, col);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.fillRect(0, 0, S * 2, S * 2);
      return c;
    };
    glow.amber = glowSprite('rgba(255, 190, 90, 0.55)');
    glow.red = glowSprite('rgba(255, 96, 50, 0.6)');
    glow.white = glowSprite('rgba(220, 240, 255, 0.6)');
    glow.pink = glowSprite('rgba(255, 79, 154, 0.5)');
    glow.cyan = glowSprite('rgba(61, 225, 255, 0.45)');

    // Long thin clouds: soft puffs that fade out well inside the sprite, so
    // no edge of the sprite ever shows.
    clouds.length = 0;
    for (let i = 0; i < 3; i++) {
      const cw = CLOUD_W + i * 30;
      const c = makeCanvas(cw * ppu * 0.5, CLOUD_H * ppu * 0.5);
      const g = c.getContext('2d')!;
      g.scale(ppu * 0.5, ppu * 0.5);
      for (let k = 0; k < 8; k++) {
        const er = 9 + r() * 8;
        const ex = er + 4 + r() * (cw - 2 * er - 8);
        const ey = CLOUD_H / 2 + (r() - 0.5) * 5;
        const rg = g.createRadialGradient(ex, ey, 0, ex, ey, er);
        rg.addColorStop(0, 'rgba(120, 110, 190, 0.2)');
        rg.addColorStop(1, 'rgba(120, 110, 190, 0)');
        g.fillStyle = rg;
        g.beginPath();
        g.arc(ex, ey, er, 0, TAU);
        g.fill();
      }
      clouds.push(c);
    }
  }

  // ── Rendering ────────────────────────────────────────────────────────────
  function layer(c: HTMLCanvasElement | null, lh: number, offset: number) {
    if (!c) return;
    let ox = -(((offset % TW) + TW) % TW);
    ox = Math.round(ox * ppu) / ppu;
    const y = Hv - lh;
    ctx!.drawImage(c, ox, y, TW, lh);
    ctx!.drawImage(c, ox + TW - 0.5 / ppu, y, TW, lh);
  }

  function drawCoin(x: number, y: number, ph: number) {
    const sx = Math.max(0.18, Math.abs(Math.cos(t * 4 + ph)));
    ctx!.drawImage(glow.amber, x - 11, y - 11, 22, 22);
    ctx!.fillStyle = '#8a5a00';
    ctx!.beginPath();
    ctx!.ellipse(x, y, 6 * sx, 6, 0, 0, TAU);
    ctx!.fill();
    ctx!.fillStyle = '#ffcf70';
    ctx!.beginPath();
    ctx!.ellipse(x, y, 5 * sx, 5, 0, 0, TAU);
    ctx!.fill();
    ctx!.fillStyle = '#c8962e';
    ctx!.fillRect(x - 1.6 * sx, y - 1.6, 3.2 * sx, 3.2);
  }

  function drawStar(x: number, y: number) {
    const c = ctx!;
    c.drawImage(glow.white, x - 20, y - 20, 40, 40);
    c.save();
    c.translate(x, y);
    c.rotate(t * 7);
    c.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      c.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
      c.lineTo(Math.cos(a + Math.PI / 4) * 3.4, Math.sin(a + Math.PI / 4) * 3.4);
    }
    c.closePath();
    c.lineWidth = 1.6;
    c.strokeStyle = '#3d4c95';
    c.stroke();
    c.fillStyle = '#e4e9f5';
    c.fill();
    c.fillStyle = '#13152a';
    c.beginPath();
    c.arc(0, 0, 1.7, 0, TAU);
    c.fill();
    c.restore();
  }

  function drawCrow(x: number, y: number, ph: number) {
    const c = ctx!;
    const flap = Math.sin(t * 15 + ph);
    c.save();
    c.translate(x, y);
    c.scale(1.2, 1.2); // drawn a little larger than its hitbox: forgiving
    c.lineJoin = 'round';
    // Far wing.
    c.fillStyle = '#0b0c1a';
    c.beginPath();
    c.moveTo(1, -1);
    c.lineTo(8, -2 - flap * 9);
    c.lineTo(12, -1 - flap * 7);
    c.closePath();
    c.fill();
    // Body and head.
    c.beginPath();
    c.ellipse(1, 0, 9, 5.5, -0.1, 0, TAU);
    c.moveTo(-5, -2);
    c.arc(-7, -2.5, 4.6, 0, TAU);
    c.moveTo(9, -1);
    c.lineTo(15, -4);
    c.lineTo(15, 2);
    c.closePath();
    c.strokeStyle = '#8796e6';
    c.lineWidth = 1.4;
    c.stroke();
    c.fill();
    // Beak and eye.
    c.fillStyle = '#ffb547';
    c.beginPath();
    c.moveTo(-11, -3.5);
    c.lineTo(-16.5, -1.6);
    c.lineTo(-11, -0.6);
    c.closePath();
    c.fill();
    c.fillStyle = '#ffe9a8';
    c.beginPath();
    c.arc(-8, -3.4, 1.3, 0, TAU);
    c.fill();
    // Near wing.
    c.fillStyle = '#141632';
    c.beginPath();
    c.moveTo(-1, -1);
    c.lineTo(5, -3 - flap * 11);
    c.lineTo(11, -2 - flap * 8);
    c.lineTo(6, 1);
    c.closePath();
    c.strokeStyle = '#8796e6';
    c.lineWidth = 1.1;
    c.stroke();
    c.fill();
    c.restore();
  }

  function hudText(text: string, x: number, y: number, align: CanvasTextAlign) {
    const c = ctx!;
    c.textAlign = align;
    c.fillStyle = 'rgba(4, 5, 14, 0.75)';
    c.fillText(text, x + 1, y + 1.5);
    c.fillStyle = '#f4f5ff';
    c.fillText(text, x, y);
  }

  function render(alpha: number) {
    const c = ctx!;
    if (!far) return;
    const ix = pkx + (kx - pkx) * alpha;
    const ih = pkh + (kh - pkh) * alpha;
    const cam = ix - kiruSX;
    const tt = t + alpha * STEP;
    let shx = 0;
    let shy = 0;
    if (shake > 0) {
      shx = (Math.random() - 0.5) * shake;
      shy = (Math.random() - 0.5) * shake;
    }

    c.setTransform(ppu, 0, 0, ppu, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';

    // Sky.
    c.fillStyle = sky!;
    c.fillRect(0, 0, W, Hv);
    c.fillStyle = '#fff';
    for (let i = 0; i < starsBg.length; i += 5) {
      c.globalAlpha = 0.35 + 0.45 * Math.sin(tt * starsBg[i + 4] + starsBg[i + 3]) ** 2;
      const s = starsBg[i + 2];
      c.fillRect(starsBg[i] * W, starsBg[i + 1] * Hv, s, s);
    }
    c.globalAlpha = 1;
    const mx = W * 0.76;
    const my = Math.min(64, Hv * 0.2);
    c.drawImage(moon!, mx - 80, my - 80, 160, 160);
    for (let i = 0; i < clouds.length; i++) {
      const cw = CLOUD_W + i * 30;
      const span = W + cw + 40;
      const cx = W + 20 - ((((cam * 0.03 + tt * (5 + i * 2) + i * 230) % span) + span) % span);
      c.drawImage(clouds[i], cx, my - 36 + i * 34, cw, CLOUD_H);
    }

    // The town, in three depths.
    layer(far, FAR_H, cam * 0.05);
    layer(mid, MID_H, cam * 0.18);
    layer(near, NEAR_H, cam * 0.4);

    // Petals drift across everything behind the roofs.
    c.fillStyle = '#ffb7d0';
    c.globalAlpha = 0.8;
    for (const p of petals) {
      c.beginPath();
      c.ellipse(p.x, p.y, p.s, p.s * 0.55, p.rot, 0, TAU);
      c.fill();
    }
    c.globalAlpha = 1;

    c.save();
    c.translate(shx - cam, shy);
    const x0 = cam - 30;
    const x1 = cam + W + 30;

    // Roofs: bodies, then batched windows, then the tiled caps.
    for (const r of roofs) {
      if (r.x > x1 || r.x + r.w < x0) continue;
      const ty = Hv - r.top;
      c.fillStyle = r.body;
      c.fillRect(r.x, ty + 6, r.w, r.top);
      c.fillStyle = 'rgba(130, 150, 255, 0.09)';
      c.fillRect(r.x, ty + 6, 3, r.top);
    }
    c.fillStyle = '#0d1029';
    c.beginPath();
    for (const r of roofs) {
      if (r.x > x1 || r.x + r.w < x0) continue;
      const ty = Hv - r.top;
      for (let i = 0; i < r.win.length; i += 3) if (!r.win[i + 2]) c.rect(r.x + r.win[i], ty + r.win[i + 1], 7, 9);
    }
    c.fill();
    c.globalAlpha = 0.3;
    c.fillStyle = '#ffb347';
    c.beginPath();
    for (const r of roofs) {
      if (r.x > x1 || r.x + r.w < x0) continue;
      const ty = Hv - r.top;
      for (let i = 0; i < r.win.length; i += 3) if (r.win[i + 2]) c.rect(r.x + r.win[i] - 2.5, ty + r.win[i + 1] - 2.5, 12, 14);
    }
    c.fill();
    c.globalAlpha = 1;
    c.fillStyle = '#ffcf70';
    c.beginPath();
    for (const r of roofs) {
      if (r.x > x1 || r.x + r.w < x0) continue;
      const ty = Hv - r.top;
      for (let i = 0; i < r.win.length; i += 3) if (r.win[i + 2]) c.rect(r.x + r.win[i], ty + r.win[i + 1], 7, 9);
    }
    c.fill();
    // Facade dressing: neon signs, eave lanterns, a vermilion rail.
    for (const r of roofs) {
      if (r.x > x1 || r.x + r.w < x0) continue;
      const ty = Hv - r.top;
      if (r.deco & 1 && r.w > 160 && r.top > 70) {
        const nx = r.x + r.w * 0.72;
        const col = NEONS[r.hue];
        const gl = r.hue === 0 ? glow.pink : r.hue === 1 ? glow.cyan : glow.amber;
        c.drawImage(gl, nx - 22, ty + 12, 50, 50);
        c.fillStyle = '#0a0b18';
        c.fillRect(nx - 2, ty + 18, 10, 34);
        c.fillStyle = col;
        c.fillRect(nx, ty + 21, 6, 2.2);
        c.fillRect(nx, ty + 27, 6, 2.2);
        c.fillRect(nx + 2, ty + 33, 2.2, 10);
        c.fillRect(nx, ty + 46, 6, 2.2);
      }
      if (r.deco & 2) {
        for (let k = 0; k < 3; k++) {
          const lx = r.x + 30 + k * Math.min(70, (r.w - 60) / 2);
          c.drawImage(glow.red, lx - 12, ty + 4, 24, 24);
          c.fillStyle = '#e8432a';
          c.beginPath();
          c.ellipse(lx, ty + 16, 3.6, 4.6, 0, 0, TAU);
          c.fill();
          c.fillStyle = '#1b1310';
          c.fillRect(lx - 2.5, ty + 10.6, 5, 1.4);
          c.fillRect(lx - 2.5, ty + 20, 5, 1.4);
        }
      }
      if (r.deco & 4 && r.top > 64) {
        c.fillStyle = '#b8321e';
        c.fillRect(r.x + 6, ty + 40, r.w - 12, 2.4);
        for (let px = r.x + 8; px < r.x + r.w - 8; px += 12) c.fillRect(px, ty + 40, 1.6, 9);
      }
    }
    // Caps.
    c.fillStyle = '#252b55';
    c.beginPath();
    for (const r of roofs) {
      if (r.x > x1 || r.x + r.w < x0) continue;
      const ty = Hv - r.top;
      c.moveTo(r.x - 3, ty);
      c.lineTo(r.x + r.w + 3, ty);
      c.quadraticCurveTo(r.x + r.w + 8, ty + 6, r.x + r.w + 15, ty + 1);
      c.lineTo(r.x + r.w + 10, ty + 9);
      c.lineTo(r.x - 10, ty + 9);
      c.lineTo(r.x - 15, ty + 1);
      c.quadraticCurveTo(r.x - 8, ty + 6, r.x - 3, ty);
      c.closePath();
    }
    c.fill();
    c.strokeStyle = '#38407a';
    c.lineWidth = 1.1;
    c.beginPath();
    for (const r of roofs) {
      if (r.x > x1 || r.x + r.w < x0) continue;
      const ty = Hv - r.top;
      const a = Math.max(r.x - 6, x0);
      const b = Math.min(r.x + r.w + 6, x1);
      for (let px = a - ((a - r.x) % 6); px < b; px += 6) {
        c.moveTo(px + 6, ty + 5);
        c.arc(px + 3, ty + 5, 3, 0, Math.PI);
      }
    }
    c.stroke();
    c.strokeStyle = 'rgba(160, 180, 255, 0.55)';
    c.lineWidth = 1;
    c.beginPath();
    for (const r of roofs) {
      if (r.x > x1 || r.x + r.w < x0) continue;
      const ty = Hv - r.top + 0.5;
      c.moveTo(r.x - 3, ty);
      c.lineTo(r.x + r.w + 3, ty);
    }
    c.stroke();

    // Kiru's shadow on the roof below him.
    const under = roofUnder(ix);
    if (under && ih >= under.top - 2 && mode !== 'dying') {
      const k = clamp((ih - under.top) / 110, 0, 1);
      c.globalAlpha = 0.4 * (1 - k);
      c.fillStyle = '#04050d';
      c.beginPath();
      c.ellipse(ix + 1, Hv - under.top + 1, 11 * (1 - k * 0.5), 2.4, 0, 0, TAU);
      c.fill();
      c.globalAlpha = 1;
    }

    // Hazards: gates and chimneys sit on the roofs; crows fly.
    for (const o of obs) {
      if (o.kind === 2) continue;
      const by = Hv - o.base;
      if (o.kind === 0) {
        if (o.x > x1 || o.x + o.w < x0) continue;
        c.fillStyle = '#3a2f52';
        c.fillRect(o.x, by - o.h, o.w, o.h);
        c.fillStyle = 'rgba(160, 170, 255, 0.16)';
        c.fillRect(o.x, by - o.h, 2, o.h);
        c.fillStyle = '#2a2140';
        for (let yy = by - o.h + 5; yy < by - 2; yy += 6) c.fillRect(o.x, yy, o.w, 1);
        c.fillStyle = '#4c4170';
        c.fillRect(o.x - 2.5, by - o.h - 4, o.w + 5, 4.5);
        c.fillStyle = 'rgba(255, 170, 90, 0.5)';
        c.fillRect(o.x + 2, by - o.h - 4.5, o.w - 4, 1);
      } else {
        if (o.x - 45 > x1 || o.x + 45 < x0) continue;
        // A small torii with a lantern: run under it, don't jump into it.
        c.fillStyle = '#c4321c';
        c.fillRect(o.x - 31, by - 86, 5, 86);
        c.fillRect(o.x + 26, by - 86, 5, 86);
        c.fillRect(o.x - 34, by - 76, 68, 4);
        c.fillStyle = '#1b1310';
        c.beginPath();
        c.moveTo(o.x - 42, by - 92);
        c.quadraticCurveTo(o.x, by - 84, o.x + 42, by - 92);
        c.lineTo(o.x + 40, by - 86);
        c.quadraticCurveTo(o.x, by - 79, o.x - 40, by - 86);
        c.closePath();
        c.fill();
      }
    }
    // Pickups.
    for (const p of picks) {
      if (p.got || p.x < x0 || p.x > x1) continue;
      if (p.star) drawStar(p.x, Hv - p.h + Math.sin(tt * 3) * 2.5);
      else drawCoin(p.x, Hv - p.h, p.phase);
    }

    // Kiru.
    const st: KiruState =
      mode === 'dying' && deathKind === 'hit' ? 'hit' : flipT >= 0 ? 'flip' : grounded && mode === 'running' ? 'run' : vy > 0 ? 'jump' : 'fall';
    const fr: KiruFrame = {
      t: tt,
      phase,
      state: st,
      air: airBlend,
      fall: fallBlend,
      vy,
      speed: clamp((speed / speedK - SPEED_0) / (SPEED_1 - SPEED_0), 0, 1),
      sx: sqx,
      sy: sqy,
      rot:
        st === 'flip'
          ? TAU * (1 - Math.pow(1 - Math.min(1, flipT / 0.4), 2.2))
          : st === 'hit'
            ? -spin
            : grounded
              ? 0.1
              : clamp(-vy / 2600, -0.12, 0.2),
      blink: blinkT > 0,
    };
    drawKiru(c, ix, Hv - ih, KIRU_SCALE, fr);

    // Lanterns hang in front.
    for (const o of obs) {
      if (o.kind !== 1 || o.x - 45 > x1 || o.x + 45 < x0) continue;
      const by = Hv - o.base;
      const sway = Math.sin(tt * 2.1 + o.phase) * 3;
      c.strokeStyle = '#1b1310';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(o.x, by - 82);
      c.lineTo(o.x + sway, by - 69);
      c.stroke();
      c.drawImage(glow.red, o.x + sway - 26, by - 85, 52, 52);
      c.fillStyle = '#e8432a';
      c.beginPath();
      c.ellipse(o.x + sway, by - 59, 9, 11, 0, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(255, 220, 160, 0.55)';
      c.beginPath();
      c.ellipse(o.x + sway - 1.5, by - 61, 4, 7, 0, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(120, 20, 10, 0.55)';
      c.beginPath();
      for (let k = -1; k <= 1; k++) {
        c.moveTo(o.x + sway - 8.5, by - 59 + k * 4.5);
        c.lineTo(o.x + sway + 8.5, by - 59 + k * 4.5);
      }
      c.stroke();
      c.fillStyle = '#1b1310';
      c.fillRect(o.x + sway - 5, by - 71, 10, 2.4);
      c.fillRect(o.x + sway - 5, by - 49.5, 10, 2.4);
    }

    // Crows.
    for (const o of obs) {
      if (o.kind !== 2) continue;
      const ox = o.px + (o.x - o.px) * alpha;
      if (ox < x0 || ox > x1 + 10) continue;
      drawCrow(ox, Hv - o.base - (o.high ? 62 : 13) - Math.sin(tt * 6 + o.phase) * 2.5, o.phase);
    }

    // Particles.
    for (const p of parts) {
      if (!p.on) continue;
      const k = p.life / p.max;
      const px = p.x;
      const py = Hv - p.h;
      if (p.kind === 0) {
        c.globalAlpha = 0.45 * (1 - k);
        c.fillStyle = '#8d96cf';
        c.beginPath();
        c.arc(px, py, p.size * (0.6 + k), 0, TAU);
        c.fill();
      } else if (p.kind === 1) {
        c.globalAlpha = 1 - k;
        c.fillStyle = '#ffd98a';
        c.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
      } else if (p.kind === 2) {
        c.globalAlpha = 0.8 * (1 - k);
        c.strokeStyle = '#ffe3f0';
        c.lineWidth = 1.6;
        c.beginPath();
        c.ellipse(px, py, 6 + k * 22, 2 + k * 6, 0, 0, TAU);
        c.stroke();
      } else if (p.kind === 3) {
        c.globalAlpha = 0.16 * (1 - k);
        c.fillStyle = '#9aa0c0';
        c.beginPath();
        c.arc(px, py, p.size * (1 + k * 1.6), 0, TAU);
        c.fill();
      }
    }
    c.globalAlpha = 1;

    // Popups.
    c.font = `400 11px ${opts.hudFont}`;
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    for (const p of pops) {
      c.globalAlpha = 1 - p.t / 1.1;
      c.fillStyle = p.text === 'NEW BEST' ? '#ffcf70' : '#e6fcff';
      c.fillText(p.text, p.x, Hv - p.h - p.t * 26);
    }
    c.globalAlpha = 1;
    c.restore();

    // Crow warnings at the right edge.
    for (const o of obs) {
      if (o.kind !== 2) continue;
      const sx = o.x - cam;
      if (sx > W - 4 && sx < W + 170 && mode === 'running') {
        const y = Hv - o.base - (o.high ? 62 : 13);
        c.globalAlpha = 0.55 + 0.45 * Math.sin(tt * 18);
        c.fillStyle = '#ff7ab8';
        c.beginPath();
        c.moveTo(W - 5, y - 6);
        c.lineTo(W - 14, y);
        c.lineTo(W - 5, y + 6);
        c.closePath();
        c.fill();
        c.globalAlpha = 1;
      }
    }

    // HUD, in CSS pixels so it is the same size on every screen.
    const k = dpr;
    c.setTransform(k, 0, 0, k, 0, 0);
    const big = cssW < 520 ? 20 : 26;
    c.textBaseline = 'top';
    c.font = `800 ${big * 0.42}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
    hudText('SCORE', 14, 12, 'left');
    c.font = `400 ${big}px ${opts.hudFont}`;
    hudText(String(score), 14, 12 + big * 0.55, 'left');
    const sw = c.measureText(String(score)).width;
    const cy = 12 + big * 0.55 + big * 0.55;
    c.drawImage(glow.amber, 14 + sw + 10, cy - 10, 20, 20);
    c.fillStyle = '#ffcf70';
    c.beginPath();
    c.arc(14 + sw + 20, cy, 5, 0, TAU);
    c.fill();
    c.fillStyle = '#c8962e';
    c.fillRect(14 + sw + 18.4, cy - 1.6, 3.2, 3.2);
    c.font = `800 ${big * 0.5}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
    hudText(String(coins + stars), 14 + sw + 29, cy - big * 0.26, 'left');
    c.font = `800 ${big * 0.42}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
    hudText(`BEST ${Math.max(best, score)}`, 14, 12 + big * 1.75, 'left');

    // How to play, for the first few seconds of the first runs.
    if (runs <= 2 && runT < 5 && mode === 'running') {
      const a = Math.min(1, runT * 3) * Math.min(1, (5 - runT) * 1.5);
      c.globalAlpha = a;
      const line1 = opts.touch ? 'Tap to jump · hold to go higher' : 'Space or ↑ to jump · hold to go higher';
      const line2 = opts.touch ? 'Tap again in mid-air to double-jump' : 'Press again in mid-air to double-jump';
      c.font = `700 ${cssW < 520 ? 12 : 14}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
      c.textAlign = 'center';
      const w1 = Math.max(c.measureText(line1).width, c.measureText(line2).width) + 28;
      const hy = cssH * 0.3;
      c.fillStyle = 'rgba(6, 7, 18, 0.66)';
      c.beginPath();
      const ph = cssW < 520 ? 44 : 50;
      if (typeof c.roundRect === 'function') c.roundRect(cssW / 2 - w1 / 2, hy - 8, w1, ph, 12);
      else c.rect(cssW / 2 - w1 / 2, hy - 8, w1, ph);
      c.fill();
      c.fillStyle = '#f4f5ff';
      c.fillText(line1, cssW / 2, hy);
      c.fillStyle = '#ffcf70';
      c.fillText(line2, cssW / 2, hy + (cssW < 520 ? 17 : 20));
      c.globalAlpha = 1;
    }
    if (flash > 0) {
      c.globalAlpha = flash;
      c.fillStyle = '#fff';
      c.fillRect(0, 0, cssW, cssH);
      c.globalAlpha = 1;
    }
  }

  // ── Size ─────────────────────────────────────────────────────────────────
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    cssW = rect.width;
    cssH = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2) * quality;
    const maxPx = 2.4e6;
    if (cssW * cssH * dpr * dpr > maxPx) dpr = Math.sqrt(maxPx / (cssW * cssH));
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const aspect = cssW / cssH;
    W = BASE_H * aspect;
    Hv = BASE_H;
    if (W < W_MIN) {
      W = W_MIN;
      Hv = W / aspect;
    } else if (W > W_MAX) {
      W = W_MAX;
      Hv = W / aspect;
    }
    ppu = canvas.width / W;
    kiruSX = clamp(W * 0.22, 72, 128);
    speedK = clamp(0.78 + (0.22 * (W - W_MIN)) / (560 - W_MIN), 0.78, 1);
    bake();
    if (roofs.length === 0) reset();
    render(0);
  }

  // ── Loop ─────────────────────────────────────────────────────────────────
  let raf = 0;
  let last = 0;
  let acc = 0;
  let cost = 0;
  let frames = 0;
  function frame(now: number) {
    raf = 0;
    if (disposed) return;
    const t0 = performance.now();
    let dt = last ? (now - last) / 1000 : 0;
    last = now;
    if (dt > 0.1) dt = 0.1;
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 14) {
      step(STEP);
      acc -= STEP;
      n++;
      if (mode !== 'running' && mode !== 'dying') break;
    }
    if (n >= 14) acc = 0;
    render(mode === 'running' || mode === 'dying' ? acc / STEP : 1);
    // If this device struggles, draw fewer pixels rather than drop frames.
    cost = cost * 0.95 + (performance.now() - t0) * 0.05;
    if (++frames > 90 && cost > 9 && quality > 0.55) {
      quality *= 0.75;
      frames = 0;
      resize();
    }
    if (mode === 'running' || mode === 'dying') raf = requestAnimationFrame(frame);
  }
  function loop() {
    if (!raf && !disposed) {
      last = 0;
      acc = 0;
      raf = requestAnimationFrame(frame);
    }
  }
  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // ── Controls ─────────────────────────────────────────────────────────────
  function pause() {
    if (mode !== 'running') return;
    mode = 'paused';
    held = false;
    pressQueued = false;
    stopLoop();
    canvas.removeAttribute('data-playing');
    render(1);
    emitMode();
  }
  function resume() {
    if (mode !== 'paused') return;
    mode = 'running';
    seenVisible = true;
    canvas.setAttribute('data-playing', '');
    emitMode();
    loop();
  }
  function restart() {
    stopLoop();
    runs++;
    reset();
    mode = 'running';
    seenVisible = false;
    canvas.setAttribute('data-playing', '');
    emitMode();
    loop();
  }
  function press() {
    if (mode === 'running') {
      pressQueued = true;
      held = true;
    } else if (mode === 'paused') {
      resume();
    } else if (mode === 'over' && performance.now() - overAt > 450) {
      restart();
    }
  }
  function release() {
    held = false;
  }

  const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW']);
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (JUMP_KEYS.has(e.code) || e.key === ' ') {
      e.preventDefault(); // only while the game has focus, only for its keys
      if (!e.repeat) press();
    } else if (e.code === 'Enter') {
      if (mode !== 'running') press();
    } else if (e.code === 'KeyP' || e.code === 'Escape') {
      if (mode === 'running') pause();
      else if (mode === 'paused' && e.code === 'KeyP') resume();
    } else if (e.code === 'KeyM') {
      opts.onSoundKey();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (JUMP_KEYS.has(e.code) || e.key === ' ') release();
  };
  const pointers = new Set<number>();
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.add(e.pointerId);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* not capturable: fine */
    }
    if (document.activeElement !== canvas) canvas.focus({ preventScroll: true });
    press();
  };
  const onPointerUp = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) release();
  };
  const onContext = (e: Event) => e.preventDefault();
  const onBlur = (e: FocusEvent) => {
    const to = e.relatedTarget as Node | null;
    if (to && canvas.parentElement?.contains(to)) return;
    pause();
  };
  const onVisibility = () => {
    if (document.hidden) pause();
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.intersectionRatio >= 0.6) seenVisible = true;
        // Pause once it has been on screen and then mostly scrolls away —
        // never while the page is still scrolling it into view.
        else if (en.intersectionRatio < 0.35 && seenVisible) pause();
      }
    },
    { threshold: [0, 0.35, 0.6, 1] },
  );
  let resizeQueued = 0;
  const ro = new ResizeObserver(() => {
    if (resizeQueued) return;
    resizeQueued = requestAnimationFrame(() => {
      resizeQueued = 0;
      resize();
    });
  });

  canvas.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('contextmenu', onContext);
  canvas.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', onVisibility);
  io.observe(canvas);
  ro.observe(canvas);

  resize();
  runs = 1;
  canvas.setAttribute('data-playing', '');
  emitMode();
  loop();

  // Development only (stripped from production builds): a read-only view of
  // the run, so an automated play-test can check every gap is clearable.
  if (process.env.NODE_ENV !== 'production') {
    (window as unknown as { __rooftop?: () => unknown }).__rooftop = () => ({
      mode,
      kx,
      kh,
      vy,
      grounded,
      airJumps,
      speed,
      score,
      W,
      roofs: roofs.map((r) => ({ x: r.x, w: r.w, top: r.top })),
      obs: obs.map((o) => ({ kind: o.kind, x: o.x, w: o.w, h: o.h, base: o.base, high: o.high, meet: o.meet })),
    });
  }

  return {
    pause,
    resume,
    restart,
    get mode() {
      return mode;
    },
    destroy() {
      disposed = true;
      stopLoop();
      if (resizeQueued) cancelAnimationFrame(resizeQueued);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('contextmenu', onContext);
      canvas.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
