/**
 * Kiru's Rooftop Run: Dash — the camera.
 *
 * x is simple: Kiru sits CAM_X (28%) in from the left edge, always, so the
 * time you get to read what is coming depends only on the speed.
 *
 * y is where the care goes. It is stepped with the simulation (120 Hz), so
 * it is deterministic and a practice checkpoint can save and restore it
 * exactly; the engine interpolates between the last two steps for drawing.
 *
 *  1. A corridor (the last gate's floor and ceiling) that fits in the view
 *     is centred, and the camera holds still however Kiru moves inside it.
 *  2. Otherwise Kiru is kept inside a dead zone (30–65% of the height from
 *     the side gravity pulls toward), so ordinary jumps never move the
 *     camera, and the view always shows more of where he will fall than of
 *     where he came from.
 *  3. It looks ahead the way gravity pulls: while he falls it finds the
 *     surface he will land on, and only drops the view further when there
 *     is nothing to land on.
 *  4. Every hazard he could meet in the next ~0.4 s is kept inside the view,
 *     so nothing that kills him ever arrives from off screen.
 *  5. It never shows below the street, and it freezes when he dies.
 *
 * Smoothing is critically damped (SmoothDamp, ~0.15 s), so it settles
 * without bouncing. There is no shake here: the renderer owns shake.
 */
import { LANTERN_R, LANTERN_SWING } from './physics';
import { SPEEDS, type LevelDef, type Obj, type SimState } from './types';

/** Kiru's hitbox centre sits this fraction of the view width from the left. */
export const CAM_X = 0.28;

/** The dead zone, as fractions of the view height from the "gravity" side. */
const ZONE_LO = 0.3;
const ZONE_HI = 0.65;
/** SmoothDamp's smoothing time, seconds. */
const SMOOTH = 0.15;
/** The smooth goal makes room for hazards this far ahead (seconds of running)... */
const HAZARD_AHEAD = 0.65;
/** ...so that the hard rule rarely has to act: anything he meets within this is on screen. */
const HAZARD_MUST = 0.42;
/** Hazards further than this from Kiru vertically are not "his" (blocks)... */
const REACH = 4;
/** ...but the smooth goal starts making room for them from a little further. */
const REACH_SOON = 5.5;
/** Breathing room the smooth goal keeps around Kiru and the hazards... */
const MARGIN = 0.4;
/** ...and the least the hard rule allows, so the spring usually gets there first. */
const MARGIN_MUST = 0.15;
/** How long ahead a fall is predicted, seconds. */
const FALL_AHEAD = 0.3;
/** A corridor taller than the view may show this much past its lines. */
const CORRIDOR_EDGE = 1;

/**
 * Axis-aligned boxes for one kind of thing (hazards, or solids), sorted by
 * their left edge, in flat typed arrays so a scan allocates nothing.
 */
export interface BoxIndex {
  n: number;
  x0: Float64Array;
  x1: Float64Array;
  y0: Float64Array;
  y1: Float64Array;
  /** The widest box: how far left of x a box can start and still reach x. */
  wide: number;
}

const EMPTY = new Float64Array(0);

function emptyIndex(): BoxIndex {
  return { n: 0, x0: EMPTY, x1: EMPTY, y0: EMPTY, y1: EMPTY, wide: 0 };
}

/** Index of the first box that could overlap x or anything right of it. */
export function firstBox(b: BoxIndex, x: number): number {
  const from = x - b.wide;
  let lo = 0;
  let hi = b.n;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (b.x0[mid] < from) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Everywhere a hazard can hurt over its whole motion (a crow's patrol, a
 * lantern's swing, a vent whether it is blowing or not). For the camera and
 * for checkpoint safety, the whole reach is the right question; the sim
 * does the exact, moment-by-moment test.
 */
function hazardBox(o: Obj, out: number[]): boolean {
  let x0: number;
  let x1: number;
  let y0: number;
  let y1: number;
  let mdx = 0;
  let mdy = 0;
  switch (o.k) {
    case 'spike': {
      // The whole drawn caltrop (the sim tests a smaller box inside it):
      // that is what the player sees and keeps clear of.
      const n = o.n ?? 1;
      const h = o.small ? 0.5 : 1;
      const dir = o.dir ?? 'up';
      if (dir === 'up' || dir === 'down') {
        x0 = o.x;
        x1 = o.x + n;
        y0 = dir === 'up' ? o.y : o.y - h;
        y1 = dir === 'up' ? o.y + h : o.y;
      } else {
        // Stacked up a wall: 'right' has its base at x, 'left' at x + 1.
        x0 = dir === 'right' ? o.x : o.x + 1 - h;
        x1 = dir === 'right' ? o.x + h : o.x + 1;
        y0 = o.y;
        y1 = o.y + n;
      }
      if (o.move) {
        mdx = Math.abs(o.move.dx);
        mdy = Math.abs(o.move.dy);
      }
      break;
    }
    case 'saw':
      x0 = o.x - o.r;
      x1 = o.x + o.r;
      y0 = o.y - o.r;
      y1 = o.y + o.r;
      if (o.move) {
        mdx = Math.abs(o.move.dx);
        mdy = Math.abs(o.move.dy);
      }
      break;
    case 'crow':
      x0 = o.x - 0.5;
      x1 = o.x + 0.5;
      y0 = o.y - 0.45;
      y1 = o.y + 0.45;
      if (o.move) {
        mdx = Math.abs(o.move.dx);
        mdy = Math.abs(o.move.dy);
      }
      break;
    case 'lantern': {
      const sw = Math.min(Math.abs(o.swing ?? LANTERN_SWING), Math.PI / 2);
      const side = o.len * Math.sin(sw) + LANTERN_R;
      x0 = o.x - side;
      x1 = o.x + side;
      y0 = o.y - o.len - LANTERN_R;
      y1 = o.y - o.len * Math.cos(sw) + LANTERN_R;
      break;
    }
    case 'vent':
      x0 = o.x;
      x1 = o.x + (o.w ?? 1);
      y0 = o.y;
      y1 = o.y + o.h;
      break;
    default:
      return false;
  }
  out[0] = x0 - mdx;
  out[1] = x1 + mdx;
  out[2] = y0 - mdy;
  out[3] = y1 + mdy;
  return true;
}

/** Roofs and blocks: where Kiru can land (tops) or slide (undersides). */
function solidBox(o: Obj, out: number[]): boolean {
  if (o.k === 'roof') {
    out[0] = o.x;
    out[1] = o.x + o.w;
    out[2] = -1e9; // a building goes all the way down
    out[3] = o.top;
    return true;
  }
  if (o.k === 'block') {
    out[0] = o.x;
    out[1] = o.x + o.w;
    out[2] = o.y;
    out[3] = o.y + o.h;
    return true;
  }
  return false;
}

function buildIndex(
  level: LevelDef,
  pick: (o: Obj, out: number[]) => boolean
): BoxIndex {
  const tmp = [0, 0, 0, 0];
  const rows: number[][] = [];
  for (const o of level.objects) if (pick(o, tmp)) rows.push(tmp.slice());
  if (rows.length === 0) return emptyIndex();
  rows.sort((a, b) => a[0] - b[0]);
  const n = rows.length;
  const b: BoxIndex = {
    n,
    x0: new Float64Array(n),
    x1: new Float64Array(n),
    y0: new Float64Array(n),
    y1: new Float64Array(n),
    wide: 0,
  };
  for (let i = 0; i < n; i++) {
    const r = rows[i];
    b.x0[i] = r[0];
    b.x1[i] = r[1];
    b.y0[i] = r[2];
    b.y1[i] = r[3];
    if (r[1] - r[0] > b.wide) b.wide = r[1] - r[0];
  }
  return b;
}

/** The static boxes the camera and the practice checkpoints look at. */
export interface LevelBoxes {
  hazards: BoxIndex;
  solids: BoxIndex;
  /** The lowest the camera's bottom edge goes: the street, or just below the lowest roof. */
  floorY: number;
}

export function indexLevel(level: LevelDef): LevelBoxes {
  const solids = buildIndex(level, solidBox);
  let low = Infinity;
  for (let i = 0; i < solids.n; i++) if (solids.y1[i] < low) low = solids.y1[i];
  return {
    hazards: buildIndex(level, hazardBox),
    solids,
    floorY: Math.min(0, Number.isFinite(low) ? low - 1 : 0),
  };
}

/**
 * True when no hazard reaches into the box [x0, x1] × [y0, y1]. Used to keep
 * automatic practice checkpoints away from anything sharp.
 */
export function clearOfHazards(
  boxes: LevelBoxes,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): boolean {
  const h = boxes.hazards;
  for (let i = firstBox(h, x0); i < h.n && h.x0[i] <= x1; i++) {
    if (h.x1[i] >= x0 && h.y1[i] >= y0 && h.y0[i] <= y1) return false;
  }
  return true;
}

/** True when no roof or block (at rest) reaches into the box. */
export function clearOfSolids(
  boxes: LevelBoxes,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): boolean {
  const s = boxes.solids;
  for (let i = firstBox(s, x0); i < s.n && s.x0[i] <= x1; i++) {
    if (s.x1[i] >= x0 && s.y1[i] >= y0 && s.y0[i] <= y1) return false;
  }
  return true;
}

/** What a checkpoint saves of the camera, so a respawn looks exactly the same. */
export interface CameraSave {
  y: number;
  vy: number;
  goal: number;
}

export interface DashCamera {
  /** The view's bottom edge in world blocks, after the latest step. */
  readonly y: number;
  /** The same, one step earlier (for interpolation). */
  readonly prevY: number;
  /** The level's boxes. Keeps the camera where it is (snap() moves it). */
  setLevel(boxes: LevelBoxes): void;
  /** The view's size in blocks. */
  setView(w: number, h: number): void;
  /** Jump straight to where the camera wants to be (a level start). */
  snap(state: SimState): void;
  /** Without smoothing, bring Kiru back into view (after a resize while stopped). */
  fit(state: SimState): void;
  /** One fixed step of following. Frozen while Kiru is dead or done. */
  step(state: SimState, dt: number): void;
  save(out: CameraSave): void;
  load(s: CameraSave): void;
}

export function createCamera(): DashCamera {
  let boxes: LevelBoxes = {
    hazards: emptyIndex(),
    solids: emptyIndex(),
    floorY: 0,
  };
  let viewH = 11.5;
  let y = 0;
  let prevY = 0;
  let vy = 0;
  let goal = 0;
  // Scan cursors: the index of the first box that could still matter. They
  // only move forward while Kiru runs, and are re-found after a jump in x.
  let hCur = 0;
  let sCur = 0;
  let lastX = -Infinity;

  function cursors(x: number) {
    if (x < lastX || x - lastX > 8) {
      hCur = firstBox(boxes.hazards, x - 1);
      sCur = firstBox(boxes.solids, x - 1);
    } else {
      const h = boxes.hazards;
      while (hCur < h.n && h.x0[hCur] < x - 1 - h.wide) hCur++;
      const s = boxes.solids;
      while (sCur < s.n && s.x0[sCur] < x - 1 - s.wide) sCur++;
    }
    lastX = x;
  }

  /**
   * Where a fall in progress will end: the centre height Kiru will have once
   * he lands, or NaN when there is nothing to land on (a pit, open sky).
   */
  function landing(st: SimState): number {
    const p = st.player;
    const s = boxes.solids;
    const a = p.x - p.w / 2;
    const b = p.x + p.w / 2 + SPEEDS[st.speed] * FALL_AHEAD;
    if (p.grav === 1) {
      const feet = p.y - p.h / 2 + 0.25;
      let best =
        st.bounds.floor !== null && st.bounds.floor <= feet
          ? st.bounds.floor
          : -Infinity;
      for (let i = sCur; i < s.n && s.x0[i] <= b; i++) {
        if (s.x1[i] >= a && s.y1[i] <= feet && s.y1[i] > best) best = s.y1[i];
      }
      return best === -Infinity ? NaN : best + p.h / 2;
    }
    const head = p.y + p.h / 2 - 0.25;
    let best =
      st.bounds.ceil !== null && st.bounds.ceil >= head
        ? st.bounds.ceil
        : Infinity;
    for (let i = sCur; i < s.n && s.x0[i] <= b; i++) {
      if (s.x1[i] >= a && s.y0[i] >= head && s.y0[i] < best) best = s.y0[i];
    }
    return best === Infinity ? NaN : best - p.h / 2;
  }

  // The vertical span the view must cover: Kiru plus the hazards ahead.
  // Written by spanAhead(); kept here so nothing is allocated per step.
  let spanLo = 0;
  let spanHi = 0;

  function spanAhead(
    st: SimState,
    seconds: number,
    reach: number,
    margin: number
  ) {
    const p = st.player;
    spanLo = p.y - p.h / 2;
    spanHi = p.y + p.h / 2;
    const h = boxes.hazards;
    const a = p.x - p.w / 2 - 0.5;
    const b = p.x + SPEEDS[st.speed] * seconds + 0.5;
    const room = viewH - 2 * margin;
    for (let i = hCur; i < h.n && h.x0[i] <= b; i++) {
      if (h.x1[i] < a) continue;
      if (h.y0[i] > p.y + reach || h.y1[i] < p.y - reach) continue;
      const lo = Math.min(spanLo, h.y0[i]);
      const hi = Math.max(spanHi, h.y1[i]);
      // Nearest first (the scan runs left to right): one that no longer
      // fits beside the nearer ones is left for later.
      if (hi - lo > room) continue;
      spanLo = lo;
      spanHi = hi;
    }
  }

  function computeGoal(st: SimState) {
    const p = st.player;
    const b = st.bounds;
    const H = viewH;
    let g = goal;
    if (b.floor !== null && b.ceil !== null && b.ceil - b.floor <= H) {
      g = (b.floor + b.ceil) / 2 - H / 2;
    } else {
      const lo = (p.grav === 1 ? ZONE_LO : 1 - ZONE_HI) * H;
      const hi = (p.grav === 1 ? ZONE_HI : 1 - ZONE_LO) * H;
      if (p.y - g < lo) g = p.y - lo;
      else if (p.y - g > hi) g = p.y - hi;
      // Falling the way gravity pulls: look where the fall ends.
      if (!p.grounded && p.vy * p.grav < 0) {
        const land = landing(st);
        let ahead = p.y + p.vy * FALL_AHEAD;
        if (p.grav === 1) {
          if (!Number.isNaN(land) && land > ahead) ahead = land;
          if (ahead - g < lo) g = ahead - lo;
        } else {
          if (!Number.isNaN(land) && land < ahead) ahead = land;
          if (ahead - g > hi) g = ahead - hi;
        }
      }
      // A corridor taller than the view: don't waste the view outside it.
      if (b.floor !== null && g < b.floor - CORRIDOR_EDGE)
        g = b.floor - CORRIDOR_EDGE;
      if (b.ceil !== null && g + H > b.ceil + CORRIDOR_EDGE)
        g = b.ceil + CORRIDOR_EDGE - H;
    }
    spanAhead(st, HAZARD_AHEAD, REACH_SOON, MARGIN);
    if (g > spanLo - MARGIN) g = spanLo - MARGIN;
    if (g + H < spanHi + MARGIN) g = spanHi + MARGIN - H;
    if (g < boxes.floorY) g = boxes.floorY;
    goal = g;
  }

  /** After smoothing: Kiru and the hazards he is about to meet are on screen, always. */
  function enforce(st: SimState) {
    spanAhead(st, HAZARD_MUST, REACH, MARGIN_MUST);
    const H = viewH;
    if (y > spanLo - MARGIN_MUST) y = spanLo - MARGIN_MUST;
    if (y + H < spanHi + MARGIN_MUST) y = spanHi + MARGIN_MUST - H;
    // Below the street there is nothing to see; a fall into a pit leaves
    // the bottom of the view, as it should.
    if (y < boxes.floorY) y = boxes.floorY;
  }

  return {
    get y() {
      return y;
    },
    get prevY() {
      return prevY;
    },
    setLevel(bx) {
      boxes = bx;
      lastX = -Infinity;
    },
    setView(_w, h) {
      viewH = h;
    },
    snap(st) {
      cursors(st.player.x);
      goal = boxes.floorY;
      computeGoal(st);
      y = prevY = goal;
      vy = 0;
    },
    fit(st) {
      cursors(st.player.x);
      enforce(st);
      prevY = y;
    },
    step(st, dt) {
      prevY = y;
      const p = st.player;
      if (p.dead || p.done) return;
      cursors(p.x);
      computeGoal(st);
      // SmoothDamp: a critically damped spring, stable at any step size.
      const omega = 2 / SMOOTH;
      const x = omega * dt;
      const k = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
      const change = y - goal;
      const temp = (vy + omega * change) * dt;
      vy = (vy - omega * temp) * k;
      y = goal + (change + temp) * k;
      enforce(st);
    },
    save(out) {
      out.y = y;
      out.vy = vy;
      out.goal = goal;
    },
    load(s) {
      y = prevY = s.y;
      vy = s.vy;
      goal = s.goal;
      lastX = -Infinity;
    },
  };
}
