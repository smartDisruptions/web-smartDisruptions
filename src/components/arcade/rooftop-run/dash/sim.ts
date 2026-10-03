/**
 * Kiru's Rooftop Run — DASH simulation. Pure: no DOM, no clock, no
 * randomness. One call to step() advances one STEP (1/120 s) of level time;
 * identical inputs always give identical runs, on every device, from the
 * start or from any snapshot. physics.ts holds every tuned number.
 *
 * The runtime, the solver (solver.ts) and the tests all drive this same
 * code, so a level the solver can finish is a level a player can finish.
 *
 * How a step goes:
 *   1. The button: a spirit lantern under him takes the press first; else
 *      the mode acts (jump, flip, shadow step, hop).
 *   2. He moves: forward at the run speed, up or down by the mode's rules,
 *      riding any moving block he stands on.
 *   3. Solids: land on tops, bump heads on undersides, die on sides.
 *   4. Gates and wind chevrons he crossed, drums and scrolls he touched.
 *   5. Hazards, then the kill lines, then the finish line.
 *
 * Collision maths runs in "g-space": up means away from the surface gravity
 * pulls him toward, so upside down is the same code with one sign flipped.
 *
 * Speed matters (the solver runs millions of steps), so the steady state
 * allocates nothing: objects live in typed arrays, a uniform grid of 2-block
 * cells lists what each cell can touch (long roofs sit in every cell they
 * cross), and state is plain numbers. Because the grid does not depend on
 * where Kiru is, restoring a snapshot costs nothing extra.
 *
 * Runs in Node too (the solver test): erasable TypeScript only.
 */
import { SPEEDS, STEP } from './types';
import type {
  DeathCause,
  GateObj,
  Input,
  LevelDef,
  ModeId,
  Obj,
  OrbColor,
  PadColor,
  PadObj,
  PlayerView,
  Sim,
  SimEvent,
  SimSnapshot,
  SimState,
  SpeedId,
} from './types';
import {
  BUFFER_STEPS,
  COYOTE_STEPS,
  CROW_R,
  DRAGON_SLOPE,
  FLIP_PUSH,
  FLY_CORRIDOR,
  G,
  GATE_H,
  GRAV_VY_KEEP,
  HAZARD_SCALE,
  HITBOX,
  INNER_SCALE,
  JUMP_V,
  KILL_ABOVE,
  KILL_BELOW,
  KITE_RATE,
  KITE_SWING,
  LANTERN_PERIOD,
  LANTERN_R,
  LANTERN_SWING,
  MAX_FALL,
  MODE_LIST,
  MODE_VY_KEEP,
  ORB_R,
  PAD_H,
  PAD_INSET,
  PARASOL_G,
  PARASOL_HOP_V,
  PARASOL_MAX_FALL,
  SAW_SCALE,
  SCROLL_R,
  SNAP,
  SPEED_LIST,
  SPIKE_INSET,
  SPIKE_TALL,
  SPIKE_TALL_SMALL,
  VENT_INSET,
  WALL_EPS,
  orbSpeed,
  padSpeed,
} from './physics';

// Mode codes: indices into MODE_LIST (keep the two in the same order).
const RUN = 0;
const KITE = 1;
const ROLL = 2;
const PARASOL = 3;
const DRAGON = 4;
const SHADOW = 5;

// Object kind codes.
const K_ROOF = 1;
const K_BLOCK = 2;
const K_SPIKE = 3;
const K_SAW = 4;
const K_CROW = 5;
const K_LANTERN = 6;
const K_VENT = 7;
const K_PAD = 8;
const K_ORB = 9;
const K_GATE = 10;
const K_SPEED = 11;
const K_SCROLL = 12;
const K_END = 13;

/** nearby() bits. */
const NEAR_ORB = 1;
const NEAR_GATE = 2;
const NEAR_PAD = 4;

/** groundIdx values that are not an object index. */
const NONE = -1;
const FLOOR_BOUND = -2;
const CEIL_BOUND = -3;

/** Roofs are solid "from below the screen": this deep. */
const ROOF_BOTTOM = -1e6;
const EPS = 1e-7;
const TAU = Math.PI * 2;
/** Broad-phase cell width, blocks, and how far past its edges a cell looks. */
const CELL = 2;
const CELL_MARGIN = 1.5;
/** "Never" for frame stamps. */
const NEVER = -1e9;

const DEATHS: DeathCause[] = [
  'spike',
  'saw',
  'crow',
  'lantern',
  'vent',
  'wall',
  'pit',
  'sky',
  'crush',
];
const D_SPIKE = 0;
const D_SAW = 1;
const D_CROW = 2;
const D_LANTERN = 3;
const D_VENT = 4;
const D_WALL = 5;
const D_PIT = 6;
const D_SKY = 7;
const D_CRUSH = 8;

/** Length of the Float64Array a snapshot packs the state into. */
export const SNAP_LEN = 24;
/** clearance() never reports more than this (blocks): beyond it, everything is equally safe. */
export const CLEAR_CAP = 2;

export interface SimOptions {
  /**
   * false: raise no events. The solver steps millions of times and only
   * needs the outcome, so it skips building event objects. Default true.
   */
  events?: boolean;
  /**
   * false: step() and loadFrom() leave `state` alone (the solver reads the
   * x, over, frame and scrollBits getters instead). Default true.
   */
  view?: boolean;
}

/** The Sim contract plus what the solver and dev tools need. */
export interface DashSim extends Sim {
  /** Copy the whole state into `f` (length SNAP_LEN) and `used` (length level.objects.length). */
  saveTo(f: Float64Array, used: Uint8Array): void;
  /** The inverse of saveTo. */
  loadFrom(f: Float64Array, used: Uint8Array): void;
  /**
   * A hash of everything that decides the future (not the looks), with y and
   * vy rounded to the given steps: two states with equal keys at the same
   * frame play out alike. The solver dedupes on it. Only the scrolls in
   * `scrollMask` (bits; default all) count: a search that does not need a
   * scroll should not keep two copies of every state over it.
   */
  key(qy: number, qv: number, scrollMask?: number): number;
  /**
   * How close Kiru is to dying right now, in blocks: the distance from his
   * hazard box to the nearest hazard and, in the flying modes, to the face
   * of a solid ahead (floors and ceilings are safe to touch, so they do not
   * count). Capped at CLEAR_CAP. The solver keeps the paths that stay
   * furthest from danger, and reports the tightest squeeze.
   */
  clearance(): number;
  /** The button cannot change anything over the next 2 steps (see sim.ts). */
  idle(): boolean;
  /** Live readouts that work with `view: false`: x, the step count, 0 running / 1 dead / 2 done, scrolls as bits. */
  readonly x: number;
  readonly frame: number;
  readonly over: number;
  readonly scrollBits: number;
  /** Steps since the last unused press (BUFFER_STEPS or more: none waiting). */
  readonly pressAge: number;
  /** Why he died, or null. */
  readonly cause: DeathCause | null;
}

interface PackedSnapshot extends SimSnapshot {
  f: Float64Array;
  used: Uint8Array;
}

export function createSim(level: LevelDef, opts: SimOptions = {}): DashSim {
  const emit = opts.events !== false;
  const view = opts.view !== false;
  const objs: Obj[] = level.objects;
  const n = objs.length;
  const bpm = level.bpm;
  const beatsPerSec = bpm / 60;
  const killBelow = level.killBelow ?? KILL_BELOW;
  const killAbove = level.killAbove ?? KILL_ABOVE;
  const startX = level.start.x;
  const startY = level.start.y;
  const startMode = MODE_LIST.indexOf(level.startMode);
  const startSpd = SPEED_LIST.indexOf(level.startSpeed);
  let endX = Infinity;

  // ── Objects as typed arrays ──────────────────────────────────────────────
  // Boxes are [X0, X1] × [Y0, Y1] at rest. Circles use X0, Y0 as the centre
  // and R as the radius. Lanterns: X0, Y0 the anchor, X1 the rope, Y1 the
  // swing, MPER/MPH the period and phase. Vents: the box plus VON/VOFF/MPH.
  const KIND = new Uint8Array(n);
  const X0 = new Float64Array(n);
  const X1 = new Float64Array(n);
  const Y0 = new Float64Array(n);
  const Y1 = new Float64Array(n);
  const R = new Float64Array(n);
  const MDX = new Float64Array(n);
  const MDY = new Float64Array(n);
  const MPER = new Float64Array(n); // motion period in beats; 0 = still
  const MPH = new Float64Array(n);
  const MTRI = new Uint8Array(n);
  const VON = new Float64Array(n);
  const VOFF = new Float64Array(n);
  const BX0 = new Float64Array(n); // broad-phase x extent, motion included
  const BX1 = new Float64Array(n);
  const solidIdx: number[] = [];
  const hazardIdx: number[] = [];
  const touchIdx: number[] = [];

  for (let i = 0; i < n; i++) {
    const o = objs[i];
    let mdx = 0;
    if ('move' in o && o.move) {
      MDX[i] = o.move.dx;
      MDY[i] = o.move.dy;
      MPER[i] = o.move.period;
      MPH[i] = o.move.phase ?? 0;
      MTRI[i] = o.move.wave === 'tri' ? 1 : 0;
      mdx = Math.abs(o.move.dx);
    }
    switch (o.k) {
      case 'roof':
        KIND[i] = K_ROOF;
        X0[i] = o.x;
        X1[i] = o.x + o.w;
        Y0[i] = ROOF_BOTTOM;
        Y1[i] = o.top;
        solidIdx.push(i);
        break;
      case 'block':
        KIND[i] = K_BLOCK;
        X0[i] = o.x;
        X1[i] = o.x + o.w;
        Y0[i] = o.y;
        Y1[i] = o.y + o.h;
        solidIdx.push(i);
        break;
      case 'spike': {
        KIND[i] = K_SPIKE;
        const nn = o.n ?? 1;
        const tall = o.small ? SPIKE_TALL_SMALL : SPIKE_TALL;
        const dir = o.dir ?? 'up';
        // One box for the whole row: two caltrops side by side leave no gap
        // a body could fit in, so neither does the hitbox.
        if (dir === 'up' || dir === 'down') {
          X0[i] = o.x + SPIKE_INSET;
          X1[i] = o.x + nn - SPIKE_INSET;
          Y0[i] = dir === 'up' ? o.y : o.y - tall;
          Y1[i] = dir === 'up' ? o.y + tall : o.y;
        } else {
          // Cells [x, x+1] × [y, y+n]. 'right': base on the left (x), points
          // right. 'left': base on the right (x+1), points left.
          X0[i] = dir === 'right' ? o.x : o.x + 1 - tall;
          X1[i] = dir === 'right' ? o.x + tall : o.x + 1;
          Y0[i] = o.y + SPIKE_INSET;
          Y1[i] = o.y + nn - SPIKE_INSET;
        }
        hazardIdx.push(i);
        break;
      }
      case 'saw':
        KIND[i] = K_SAW;
        X0[i] = o.x;
        Y0[i] = o.y;
        R[i] = o.r * SAW_SCALE;
        X1[i] = o.x;
        Y1[i] = o.y;
        hazardIdx.push(i);
        break;
      case 'crow':
        KIND[i] = K_CROW;
        X0[i] = X1[i] = o.x;
        Y0[i] = Y1[i] = o.y;
        R[i] = CROW_R;
        hazardIdx.push(i);
        break;
      case 'lantern':
        KIND[i] = K_LANTERN;
        X0[i] = o.x;
        Y0[i] = o.y;
        X1[i] = o.len;
        Y1[i] = o.swing ?? LANTERN_SWING;
        MPER[i] = o.period ?? LANTERN_PERIOD;
        MPH[i] = o.phase ?? 0;
        R[i] = LANTERN_R;
        hazardIdx.push(i);
        break;
      case 'vent':
        KIND[i] = K_VENT;
        X0[i] = o.x + VENT_INSET;
        X1[i] = o.x + (o.w ?? 1) - VENT_INSET;
        Y0[i] = o.y;
        Y1[i] = o.y + o.h;
        VON[i] = o.on;
        VOFF[i] = o.off;
        MPH[i] = o.phase ?? 0;
        hazardIdx.push(i);
        break;
      case 'pad':
        KIND[i] = K_PAD;
        X0[i] = o.x + PAD_INSET;
        X1[i] = o.x + 1 - PAD_INSET;
        Y0[i] = o.flip ? o.y - PAD_H : o.y;
        Y1[i] = o.flip ? o.y : o.y + PAD_H;
        touchIdx.push(i);
        break;
      case 'orb':
        KIND[i] = K_ORB;
        X0[i] = X1[i] = o.x;
        Y0[i] = Y1[i] = o.y;
        R[i] = ORB_R;
        touchIdx.push(i);
        break;
      case 'scroll':
        KIND[i] = K_SCROLL;
        X0[i] = X1[i] = o.x;
        Y0[i] = Y1[i] = o.y;
        R[i] = SCROLL_R;
        touchIdx.push(i);
        break;
      case 'gate':
      case 'speed':
        KIND[i] = o.k === 'gate' ? K_GATE : K_SPEED;
        X0[i] = X1[i] = o.x;
        Y0[i] = o.y - (o.h ?? GATE_H) / 2;
        Y1[i] = o.y + (o.h ?? GATE_H) / 2;
        touchIdx.push(i);
        break;
      case 'end':
        KIND[i] = K_END;
        X0[i] = X1[i] = o.x;
        endX = Math.min(endX, o.x);
        touchIdx.push(i);
        break;
      default:
        // text, deco, theme: scenery, never collides.
        break;
    }
    if (KIND[i] === K_LANTERN) {
      const reach = X1[i] + R[i];
      BX0[i] = X0[i] - reach;
      BX1[i] = X0[i] + reach;
    } else if (KIND[i] !== 0) {
      BX0[i] = Math.min(X0[i], X1[i]) - R[i] - mdx;
      BX1[i] = Math.max(X0[i], X1[i]) + R[i] + mdx;
    }
  }
  if (!Number.isFinite(endX)) endX = startX + 1e6;

  // ── Broad phase: a uniform grid of cells, each listing what it can touch ─
  let gridX0 = startX - 4;
  let gridX1 = startX + 4;
  for (let i = 0; i < n; i++) {
    if (KIND[i] === 0) continue;
    if (BX0[i] < gridX0) gridX0 = BX0[i];
    if (BX1[i] > gridX1) gridX1 = BX1[i];
  }
  gridX0 -= CELL;
  gridX1 += CELL;
  const nCells = Math.max(1, Math.ceil((gridX1 - gridX0) / CELL));

  function buildGrid(list: number[]): { start: Int32Array; items: Int32Array } {
    const start = new Int32Array(nCells + 1);
    const span = (i: number, out: Int32Array) => {
      out[0] = Math.max(0, Math.floor((BX0[i] - CELL_MARGIN - gridX0) / CELL));
      out[1] = Math.min(
        nCells - 1,
        Math.floor((BX1[i] + CELL_MARGIN - gridX0) / CELL)
      );
    };
    const s = new Int32Array(2);
    for (const i of list) {
      span(i, s);
      for (let c = s[0]; c <= s[1]; c++) start[c + 1]++;
    }
    for (let c = 0; c < nCells; c++) start[c + 1] += start[c];
    const items = new Int32Array(start[nCells]);
    const fill = start.slice(0, nCells);
    for (const i of list) {
      span(i, s);
      for (let c = s[0]; c <= s[1]; c++) items[fill[c]++] = i;
    }
    return { start, items };
  }
  const solids = buildGrid(solidIdx);
  const hazards = buildGrid(hazardIdx);
  const touches = buildGrid(touchIdx);
  const SOL_S = solids.start;
  const SOL_I = solids.items;
  const HAZ_S = hazards.start;
  const HAZ_I = hazards.items;
  const TCH_S = touches.start;
  const TCH_I = touches.items;
  let maxCell = 0;
  for (let c = 0; c < nCells; c++)
    maxCell = Math.max(maxCell, SOL_S[c + 1] - SOL_S[c]);
  // Scratch: solid positions this step, so the crush test need not recompute them.
  const cx0 = new Float64Array(maxCell);
  const cx1 = new Float64Array(maxCell);
  const cy0 = new Float64Array(maxCell);
  const cy1 = new Float64Array(maxCell);

  const cellOf = (px: number): number => {
    const c = Math.floor((px - gridX0) / CELL);
    return c < 0 ? 0 : c >= nCells ? nCells - 1 : c;
  };

  /** A moving object's swing (-1..1) at `beats`; must match physics.motionWave. */
  function wave(i: number, beats: number): number {
    const p = beats / MPER[i] + MPH[i];
    if (MTRI[i] === 1) {
      const q = p + 0.25 - Math.floor(p + 0.25);
      return 1 - 4 * Math.abs(q - 0.5);
    }
    return Math.sin(TAU * p);
  }

  // ── State ────────────────────────────────────────────────────────────────
  let frame = 0;
  let x = 0;
  let y = 0;
  let vy = 0;
  let mode = RUN;
  let grav: 1 | -1 = 1;
  let grounded = true;
  let rot = 0;
  let flipF = NEVER;
  let modeF = 0;
  let jumpF = NEVER;
  let dead = false;
  let done = false;
  let spd = 1;
  let floorY = NaN; // NaN: no bound
  let ceilY = NaN;
  let jumps = 0;
  let scrollBits = 0;
  let pressF = NEVER; // step of the last press not yet used up
  let edgeF = NEVER; // step at which he walked off an edge (coyote time)
  let lastHeld = false;
  let groundIdx = NONE;
  let causeCode = -1;
  // Derived from the above (recomputed on mode or speed change and on load).
  let hw = 0.4;
  let hh = 0.7;
  let speedV = SPEEDS.normal;
  let launched = false; // this step: something launched him (no coyote)

  const used = new Uint8Array(n);
  const events: SimEvent[] = [];
  const player: PlayerView = {
    x: 0,
    y: 0,
    vy: 0,
    w: 0.8,
    h: 1.4,
    mode: 'run',
    grav: 1,
    grounded: true,
    rot: 0,
    flipT: Infinity,
    modeT: 0,
    jumpT: Infinity,
    dead: false,
    done: false,
  };
  const state: SimState = {
    t: 0,
    frame: 0,
    player,
    speed: 'normal',
    bounds: { floor: null, ceil: null },
    used,
    events,
    progress: 0,
    jumps: 0,
    scrolls: [false, false, false],
  };

  function setMode(m: number) {
    mode = m;
    const hb = HITBOX[MODE_LIST[m]];
    hw = hb.w / 2;
    hh = hb.h / 2;
  }
  function setSpeed(s: number) {
    spd = s;
    speedV = SPEEDS[SPEED_LIST[s]];
  }

  function sync() {
    player.x = x;
    player.y = y;
    player.vy = vy;
    player.w = hw * 2;
    player.h = hh * 2;
    player.mode = MODE_LIST[mode];
    player.grav = grav;
    player.grounded = grounded;
    player.rot = rot;
    player.flipT = flipF === NEVER ? Infinity : (frame - flipF) * STEP;
    player.modeT = (frame - modeF) * STEP;
    player.jumpT = jumpF === NEVER ? Infinity : (frame - jumpF) * STEP;
    player.dead = dead;
    player.done = done;
    state.t = frame * STEP;
    state.frame = frame;
    state.speed = SPEED_LIST[spd];
    state.bounds.floor = floorY === floorY ? floorY : null;
    state.bounds.ceil = ceilY === ceilY ? ceilY : null;
    state.progress = done
      ? 1
      : Math.min(1, Math.max(0, (x - startX) / (endX - startX)));
    state.jumps = jumps;
    state.scrolls[0] = (scrollBits & 1) !== 0;
    state.scrolls[1] = (scrollBits & 2) !== 0;
    state.scrolls[2] = (scrollBits & 4) !== 0;
  }

  function reset() {
    frame = 0;
    setMode(startMode < 0 ? RUN : startMode);
    setSpeed(startSpd < 0 ? 1 : startSpd);
    x = startX;
    y = startY + hh;
    vy = 0;
    grav = 1;
    grounded = true;
    rot = 0;
    flipF = NEVER;
    modeF = 0;
    jumpF = NEVER;
    dead = false;
    done = false;
    floorY = NaN;
    ceilY = NaN;
    jumps = 0;
    scrollBits = 0;
    pressF = NEVER;
    edgeF = NEVER;
    lastHeld = false;
    groundIdx = NONE;
    causeCode = -1;
    used.fill(0);
    events.length = 0;
    sync();
  }

  // ── Events ───────────────────────────────────────────────────────────────
  function die(code: number) {
    dead = true;
    causeCode = code;
    if (emit) events.push({ e: 'death', x, y, cause: DEATHS[code] });
  }

  // ── The button ───────────────────────────────────────────────────────────
  function consumePress() {
    pressF = NEVER;
    edgeF = NEVER;
    launched = true;
    grounded = false;
    groundIdx = NONE;
  }

  function flipGravity() {
    grav = grav === 1 ? -1 : 1;
    flipF = frame;
  }

  /** A spirit lantern he overlaps takes the press. True if one fired. */
  function tryOrb(beats: number): boolean {
    const c = cellOf(x);
    const m = MODE_LIST[mode];
    for (let k = TCH_S[c], e = TCH_S[c + 1]; k < e; k++) {
      const i = TCH_I[k];
      if (KIND[i] !== K_ORB || used[i] === 1) continue;
      const col = (objs[i] as { c: OrbColor }).c;
      const v = orbSpeed(col, m, speedV);
      if (v !== v) continue; // does nothing in this mode
      let ox = X0[i];
      let oy = Y0[i];
      if (MPER[i] > 0) {
        const w = wave(i, beats);
        ox += MDX[i] * w;
        oy += MDY[i] * w;
      }
      if (!circleBox(ox, oy, R[i], x - hw, x + hw, y - hh, y + hh)) continue;
      used[i] = 1;
      consumePress();
      jumps++;
      jumpF = frame;
      if (col === 'blue') {
        flipGravity();
        vy = mode === DRAGON ? vy : grav * -Math.min(FLIP_PUSH, flyCap());
      } else if (col === 'green') {
        flipGravity();
        if (mode !== DRAGON) vy = grav * v;
      } else {
        vy = grav * v;
      }
      if (emit) events.push({ e: 'orb', x: ox, y: oy, c: col, i });
      return true;
    }
    return false;
  }

  /** The cap a push may not exceed in this mode (the kite's climb rate, or no cap). */
  function flyCap(): number {
    return mode === KITE ? KITE_RATE * speedV : Infinity;
  }

  function teleport(beats: number) {
    // The first surface in the opposite direction, in g-space: the lowest
    // "underside" at or above his head.
    const L = x - hw;
    const Rr = x + hw;
    const H = grav * y + hh;
    let best = Infinity;
    let bestI = NONE;
    const c = cellOf(x);
    for (let k = SOL_S[c], e = SOL_S[c + 1]; k < e; k++) {
      const i = SOL_I[k];
      let ox = 0;
      let oy = 0;
      if (MPER[i] > 0) {
        const w = wave(i, beats);
        ox = MDX[i] * w;
        oy = MDY[i] * w;
      }
      if (Rr <= X0[i] + ox + EPS || L >= X1[i] + ox - EPS) continue;
      const sB = grav === 1 ? Y0[i] + oy : -(Y1[i] + oy);
      if (sB >= H - EPS && sB < best) {
        best = sB;
        bestI = i;
      }
    }
    const bound = grav === 1 ? ceilY : floorY;
    if (bound === bound) {
      const sB = grav === 1 ? bound : -bound;
      if (sB >= H - EPS && sB < best) {
        best = sB;
        bestI = grav === 1 ? CEIL_BOUND : FLOOR_BOUND;
      }
    }
    const y0 = y;
    jumps++;
    jumpF = frame;
    consumePress();
    if (bestI === NONE) {
      // Nothing that way: he steps out of the level.
      const yOut = grav === 1 ? killAbove : killBelow;
      if (emit) events.push({ e: 'teleport', x, y0, y1: yOut });
      y = yOut;
      die(grav === 1 ? D_SKY : D_PIT);
      return;
    }
    flipGravity();
    // He now stands on that surface with his feet on it (new g-space).
    y = grav * (-best + hh);
    vy = 0;
    grounded = true;
    groundIdx = bestI;
    if (emit) events.push({ e: 'teleport', x, y0, y1: y });
  }

  function act(press: boolean, held: boolean, s: number, beats: number) {
    const bufOk = s - pressF < BUFFER_STEPS;
    // A spirit lantern takes a fresh press, or a buffered one still held.
    if (bufOk && (press || held) && tryOrb(beats)) return;
    const canAct = grounded || s - edgeF <= COYOTE_STEPS;
    switch (mode) {
      case RUN:
        // Tap or hold: a held button jumps again on every landing.
        if (canAct && (held || bufOk)) {
          vy = grav * JUMP_V;
          consumePress();
          jumps++;
          jumpF = frame;
          if (emit) events.push({ e: 'jump', x, y });
        }
        break;
      case ROLL:
        if (canAct && bufOk) {
          consumePress();
          flipGravity();
          vy = grav * -FLIP_PUSH;
          jumps++;
          if (emit) events.push({ e: 'flip', x, y });
        }
        break;
      case SHADOW:
        if (canAct && bufOk) teleport(beats);
        break;
      case PARASOL:
        if (press) {
          vy = grav * PARASOL_HOP_V;
          consumePress();
          jumps++;
          jumpF = frame;
          if (emit) events.push({ e: 'flap', x, y });
        }
        break;
      default:
        // Kite and Dragon steer with `held` while moving.
        break;
    }
  }

  // ── Moving ───────────────────────────────────────────────────────────────
  function integrate(held: boolean) {
    x += speedV * STEP;
    // Velocities are integrated exactly for constant acceleration (the
    // average of the old and new speed), so the stepped arc samples the
    // true parabola and the physics facts hold to the step.
    const vg0 = grav * vy;
    let vg1: number;
    switch (mode) {
      case KITE: {
        const cap = KITE_RATE * speedV;
        const a = (2 * cap) / KITE_SWING;
        vg1 = vg0 + (held ? a : -a) * STEP;
        if (vg1 > cap) vg1 = cap;
        else if (vg1 < -cap) vg1 = -cap;
        break;
      }
      case DRAGON:
        vg1 = (held ? DRAGON_SLOPE : -DRAGON_SLOPE) * speedV;
        y += grav * vg1 * STEP;
        vy = grav * vg1;
        return;
      case PARASOL:
        vg1 = vg0 - PARASOL_G * STEP;
        if (vg1 < -PARASOL_MAX_FALL) vg1 = -PARASOL_MAX_FALL;
        break;
      default:
        vg1 = vg0 - G * STEP;
        if (vg1 < -MAX_FALL) vg1 = -MAX_FALL;
        break;
    }
    y += grav * 0.5 * (vg0 + vg1) * STEP;
    vy = grav * vg1;
  }

  /** He rides a moving block he stands on, vertically only. */
  function carry(b0: number, b1: number) {
    if (!grounded || groundIdx < 0 || MPER[groundIdx] === 0) return;
    const i = groundIdx;
    y += MDY[i] * (wave(i, b1) - wave(i, b0));
  }

  // ── Solids ───────────────────────────────────────────────────────────────
  /**
   * Resolve contacts with solids after moving from (px, py). Each solid he
   * overlaps is one of:
   *  - top: his feet are within SNAP below its top, or were above it last
   *    step: he lands on it (or, still rising, is lifted onto the lip);
   *  - underside: his head was below it last step and he rose into it (or it
   *    came down on him): the rise stops, he is pushed down;
   *  - side: he was left of its face last step and is now inside it by more
   *    than WALL_EPS: a wall death;
   *  - anything else (an overlap he was already in): allowed, unless the
   *    inner box ends up inside a solid, which is a crush.
   * Corridor bounds are lines with no sides: always a top or an underside.
   */
  function collide(px: number, py: number, s: number, b0: number, b1: number) {
    const L = x - hw;
    const Rr = x + hw;
    const pR = px + hw;
    let vg = grav * vy;
    const vgIn = vg;
    let F = grav * y - hh;
    const pF = grav * py - hh;
    const pH = pF + 2 * hh;
    const snap = SNAP[MODE_LIST[mode]];
    let supT = -Infinity;
    let supI = NONE;
    let ceilB = Infinity;
    let ceilV = 0;
    let wall = false;
    const c = cellOf(x);
    const k0 = SOL_S[c];
    const k1 = SOL_S[c + 1];
    for (let k = k0; k < k1; k++) {
      const i = SOL_I[k];
      const j = k - k0;
      let sx0 = X0[i];
      let sx1 = X1[i];
      let sy0 = Y0[i];
      let sy1 = Y1[i];
      let psx0 = sx0;
      let psy0 = sy0;
      let psy1 = sy1;
      if (MPER[i] > 0) {
        const w1 = wave(i, b1);
        const w0 = wave(i, b0);
        sx0 += MDX[i] * w1;
        sx1 += MDX[i] * w1;
        sy0 += MDY[i] * w1;
        sy1 += MDY[i] * w1;
        psx0 = X0[i] + MDX[i] * w0;
        psy0 = Y0[i] + MDY[i] * w0;
        psy1 = Y1[i] + MDY[i] * w0;
      }
      cx0[j] = sx0;
      cx1[j] = sx1;
      cy0[j] = sy0;
      cy1[j] = sy1;
      if (Rr <= sx0 + EPS || L >= sx1 - EPS) continue;
      let sT: number;
      let sB: number;
      let psT: number;
      let psB: number;
      if (grav === 1) {
        sT = sy1;
        sB = sy0;
        psT = psy1;
        psB = psy0;
      } else {
        sT = -sy0;
        sB = -sy1;
        psT = -psy0;
        psB = -psy1;
      }
      const H = F + 2 * hh;
      if (H <= sB + EPS || F >= sT - EPS) continue;
      if (F >= sT - snap || pF >= psT - EPS) {
        if (sT > supT) {
          supT = sT;
          supI = i;
        }
      } else if (pH <= psB + EPS && (vg > 0 || sB < psB)) {
        if (sB < ceilB) {
          ceilB = sB;
          ceilV = (sB - psB) / STEP;
        }
      } else if (pR <= psx0 + WALL_EPS && Rr - sx0 > WALL_EPS) {
        wall = true;
      }
    }
    // Corridor bounds.
    const fl = grav === 1 ? floorY : -ceilY; // the bound he stands on (g-space top)
    const cl = grav === 1 ? ceilY : -floorY; // the bound over his head (g-space underside)
    if (fl === fl && F < fl && fl > supT) {
      supT = fl;
      supI = grav === 1 ? FLOOR_BOUND : CEIL_BOUND;
    }
    if (cl === cl && F + 2 * hh > cl && cl < ceilB) {
      ceilB = cl;
      ceilV = 0;
    }

    if (wall) {
      die(D_WALL);
      return;
    }
    const wasGrounded = grounded;
    grounded = false;
    if (supI !== NONE) {
      F = supT;
      if (vg <= 0) {
        if (!wasGrounded && emit)
          events.push({ e: 'land', x, y: grav * (F + hh), v: -vgIn });
        vg = 0;
        grounded = true;
        groundIdx = supI;
      }
      // Rising: lifted onto the lip, and the rise carries on.
    }
    if (ceilB < F + 2 * hh) {
      // Head bonk (or a block coming down on him): the rise stops.
      F = ceilB - 2 * hh;
      if (vg > ceilV) vg = ceilV;
    }
    if (!grounded) groundIdx = NONE;
    y = grav * (F + hh);
    vy = grav * vg;
    if (wasGrounded && !grounded && !launched) edgeF = s;
    if (grounded) edgeF = NEVER;

    // Crush: the inner box inside any solid.
    const ix0 = x - hw * INNER_SCALE;
    const ix1 = x + hw * INNER_SCALE;
    const iy0 = y - hh * INNER_SCALE;
    const iy1 = y + hh * INNER_SCALE;
    for (let k = k0; k < k1; k++) {
      const j = k - k0;
      if (ix1 > cx0[j] && ix0 < cx1[j] && iy1 > cy0[j] && iy0 < cy1[j]) {
        die(D_CRUSH);
        return;
      }
    }
    if ((floorY === floorY && iy0 < floorY) || (ceilY === ceilY && iy1 > ceilY))
      die(D_CRUSH);
  }

  // ── Gates, chevrons, drums, scrolls ──────────────────────────────────────
  function applyGate(i: number) {
    const g = objs[i] as GateObj;
    const nm = g.mode ? MODE_LIST.indexOf(g.mode) : mode;
    if (nm !== mode) {
      const oldHH = hh;
      setMode(nm);
      // Keep his feet where they are if he is standing, so he stays standing;
      // in the air keep his centre.
      if (grounded) y += grav * (hh - oldHH);
      modeF = frame;
      vy *= MODE_VY_KEEP;
      if (nm === KITE) {
        const cap = KITE_RATE * speedV;
        if (vy > cap) vy = cap;
        else if (vy < -cap) vy = -cap;
      } else if (nm === PARASOL) {
        if (grav * vy < -PARASOL_MAX_FALL) vy = -grav * PARASOL_MAX_FALL;
      }
    }
    if (g.grav !== undefined && g.grav !== grav) {
      flipGravity();
      vy *= GRAV_VY_KEEP;
      grounded = false;
      groundIdx = NONE;
    }
    let f = g.floor ?? NaN;
    let cc = g.ceil ?? NaN;
    if (
      f !== f &&
      cc !== cc &&
      (nm === KITE || nm === PARASOL || nm === DRAGON)
    ) {
      f = g.y - FLY_CORRIDOR / 2;
      cc = g.y + FLY_CORRIDOR / 2;
    }
    floorY = f;
    ceilY = cc;
    if (emit)
      events.push({ e: 'gate', x: g.x, y: g.y, i, mode: g.mode, grav: g.grav });
  }

  /**
   * Crossings and touches after moving from px: gates and chevrons he
   * crossed (his centre, within their height), drums and scrolls he
   * touches. Returns true if he crossed the finish line this step.
   */
  function touch(px: number, beats: number): boolean {
    let finish = false;
    const c = cellOf(x);
    const L = x - hw;
    const Rr = x + hw;
    for (let k = TCH_S[c], e = TCH_S[c + 1]; k < e; k++) {
      const i = TCH_I[k];
      if (used[i] === 1) continue;
      const kind = KIND[i];
      if (kind === K_GATE || kind === K_SPEED || kind === K_END) {
        if (!(px < X0[i] && x >= X0[i])) continue;
        if (kind === K_END) {
          used[i] = 1;
          finish = true;
          continue;
        }
        if (y < Y0[i] || y > Y1[i]) continue;
        used[i] = 1;
        if (kind === K_GATE) applyGate(i);
        else {
          const sp = (objs[i] as { speed: SpeedId }).speed;
          setSpeed(SPEED_LIST.indexOf(sp));
          if (emit) events.push({ e: 'speed', x: X0[i], y, i, speed: sp });
        }
      } else if (kind === K_PAD) {
        if (Rr <= X0[i] || L >= X1[i] || y + hh <= Y0[i] || y - hh >= Y1[i])
          continue;
        const col = (objs[i] as { c: PadColor }).c;
        if (col === 'blue') {
          used[i] = 1;
          consumeLaunch();
          flipGravity();
          vy = grav * -Math.min(FLIP_PUSH, flyCap());
        } else {
          const v = padSpeed(col, MODE_LIST[mode], speedV);
          if (v !== v) continue; // the dragon ignores drums
          used[i] = 1;
          consumeLaunch();
          vy = grav * v;
        }
        jumpF = frame;
        if (emit)
          events.push({
            e: 'pad',
            x: X0[i] - PAD_INSET + 0.5,
            y: (objs[i] as PadObj).y,
            c: col,
            i,
          });
      } else if (kind === K_SCROLL) {
        let ox = X0[i];
        let oy = Y0[i];
        if (MPER[i] > 0) {
          const w = wave(i, beats);
          ox += MDX[i] * w;
          oy += MDY[i] * w;
        }
        if (!circleBox(ox, oy, R[i], L, Rr, y - hh, y + hh)) continue;
        used[i] = 1;
        const id = (objs[i] as { id: 0 | 1 | 2 }).id;
        scrollBits |= 1 << id;
        if (emit) events.push({ e: 'scroll', x: ox, y: oy, id, i });
      }
    }
    return finish;
  }

  /** A drum launch: like a press used up, but it leaves the press buffer alone. */
  function consumeLaunch() {
    edgeF = NEVER;
    launched = true;
    grounded = false;
    groundIdx = NONE;
  }

  // ── Hazards ──────────────────────────────────────────────────────────────
  function hazardsHit(beats: number): number {
    const hx = hw * HAZARD_SCALE;
    const hy = hh * HAZARD_SCALE;
    const L = x - hx;
    const Rr = x + hx;
    const B = y - hy;
    const T = y + hy;
    const c = cellOf(x);
    for (let k = HAZ_S[c], e = HAZ_S[c + 1]; k < e; k++) {
      const i = HAZ_I[k];
      const kind = KIND[i];
      if (kind === K_LANTERN) {
        const a = Y1[i] * Math.sin(TAU * (beats / MPER[i] + MPH[i]));
        const lx = X0[i] + X1[i] * Math.sin(a);
        const ly = Y0[i] - X1[i] * Math.cos(a);
        if (circleBox(lx, ly, R[i], L, Rr, B, T)) return D_LANTERN;
        continue;
      }
      if (kind === K_VENT) {
        const cycle = VON[i] + VOFF[i];
        const cyc = beats + MPH[i];
        if (cyc - Math.floor(cyc / cycle) * cycle >= VON[i]) continue;
        if (Rr > X0[i] && L < X1[i] && T > Y0[i] && B < Y1[i]) return D_VENT;
        continue;
      }
      let ox = 0;
      let oy = 0;
      if (MPER[i] > 0) {
        const w = wave(i, beats);
        ox = MDX[i] * w;
        oy = MDY[i] * w;
      }
      if (kind === K_SPIKE) {
        if (
          Rr > X0[i] + ox &&
          L < X1[i] + ox &&
          T > Y0[i] + oy &&
          B < Y1[i] + oy
        )
          return D_SPIKE;
      } else if (circleBox(X0[i] + ox, Y0[i] + oy, R[i], L, Rr, B, T)) {
        return kind === K_SAW ? D_SAW : D_CROW;
      }
    }
    return -1;
  }

  // ── The step ─────────────────────────────────────────────────────────────
  function step(input: Input): void {
    events.length = 0;
    if (dead || done) return;
    const held = input.held;
    const press = input.pressed || (held && !lastHeld);
    lastHeld = held;
    const s = frame;
    const b0 = s * STEP * beatsPerSec;
    frame = s + 1;
    const b1 = frame * STEP * beatsPerSec;
    launched = false;
    if (press) pressF = s;

    act(press, held, s, b0);
    if (!dead) {
      const px = x;
      const py = y;
      carry(b0, b1);
      integrate(held);
      collide(px, py, s, b0, b1);
      if (!dead) {
        const finish = touch(px, b1);
        const hit = hazardsHit(b1);
        if (hit >= 0) die(hit);
        else if (y < killBelow) die(D_PIT);
        else if (y > killAbove) die(D_SKY);
        else if (finish) {
          done = true;
          if (emit) events.push({ e: 'complete', x, y });
        }
      }
    }
    // The look: roll spin, kite pitch, dragon heading, parasol sway.
    if (mode === ROLL) {
      rot -= (grav * speedV * STEP) / hh;
      if (rot < -Math.PI) rot += TAU;
      else if (rot > Math.PI) rot -= TAU;
    } else if (mode === KITE || mode === DRAGON) {
      rot = Math.atan2(vy, speedV);
    } else if (mode === PARASOL) {
      rot = 0.35 * Math.atan2(vy, speedV);
    } else {
      rot = 0;
    }
    if (view) sync();
  }

  // ── Snapshots ────────────────────────────────────────────────────────────
  function saveTo(f: Float64Array, u: Uint8Array) {
    f[0] = frame;
    f[1] = x;
    f[2] = y;
    f[3] = vy;
    f[4] = mode;
    f[5] = grav;
    f[6] = grounded ? 1 : 0;
    f[7] = rot;
    f[8] = flipF;
    f[9] = modeF;
    f[10] = jumpF;
    f[11] = dead ? 1 : 0;
    f[12] = done ? 1 : 0;
    f[13] = spd;
    f[14] = floorY;
    f[15] = ceilY;
    f[16] = jumps;
    f[17] = scrollBits;
    f[18] = pressF;
    f[19] = edgeF;
    f[20] = lastHeld ? 1 : 0;
    f[21] = groundIdx;
    f[22] = causeCode;
    f[23] = 0;
    u.set(used);
  }

  function loadFrom(f: Float64Array, u: Uint8Array) {
    frame = f[0];
    x = f[1];
    y = f[2];
    vy = f[3];
    setMode(f[4]);
    grav = f[5] === -1 ? -1 : 1;
    grounded = f[6] === 1;
    rot = f[7];
    flipF = f[8];
    modeF = f[9];
    jumpF = f[10];
    dead = f[11] === 1;
    done = f[12] === 1;
    setSpeed(f[13]);
    floorY = f[14];
    ceilY = f[15];
    jumps = f[16];
    scrollBits = f[17];
    pressF = f[18];
    edgeF = f[19];
    lastHeld = f[20] === 1;
    groundIdx = f[21];
    causeCode = f[22];
    used.set(u);
    events.length = 0;
    if (view) sync();
  }

  // ── Solver key ───────────────────────────────────────────────────────────
  // Two 32-bit FNV-style hashes over the quantised state, folded into one
  // 53-bit safe integer (collisions are vanishingly unlikely).
  let h1 = 0;
  let h2 = 0;
  function mix(v: number) {
    h1 = Math.imul(h1 ^ v, 0x01000193);
    h2 = Math.imul(h2 ^ v, 0x5bd1e995) ^ (h2 >>> 13);
  }
  /**
   * The key ignores button history that provably cannot matter, which is
   * most of it, so equivalent states merge:
   *  - The press buffer only feeds a lantern (orb) or a landing (Run, Roll,
   *    Shadow Step); the kite, the dragon and the parasol's hops use fresh
   *    presses. With no lantern within its 0.1 s of life it is moot in the
   *    flying modes; in the air it is moot too if no landing can come
   *    before it expires (no surface within reach of the fall, no ceiling to
   *    cut a rise short, no drum or gate to change the arc).
   *  - The last-held bit only decides whether the next held step is a new
   *    press: moot whenever such a press would be.
   */
  function key(qy: number, qv: number, scrollMask = 7): number {
    const s = frame;
    let pa = s - pressF;
    if (pa > BUFFER_STEPS) pa = BUFFER_STEPS;
    let lh = lastHeld ? 1 : 0;
    if (pa < BUFFER_STEPS || lh === 1) {
      const falls = mode === RUN || mode === ROLL || mode === SHADOW;
      const T = (BUFFER_STEPS + 2) * STEP;
      const near = nearby(speedV * T + 1.5);
      if ((near & NEAR_ORB) === 0) {
        if (mode === KITE || mode === DRAGON) {
          pa = BUFFER_STEPS;
          if ((near & NEAR_GATE) === 0) lh = 0;
        } else if (mode === PARASOL) {
          pa = BUFFER_STEPS;
        } else if (falls && grounded) {
          // A waiting press acts on the next step whatever its age; Run
          // jumps on a held button anyway, so there the last-held bit is
          // moot too (unless a gate could change what the button means).
          if (pa < BUFFER_STEPS) {
            pa = 0;
            if ((near & NEAR_GATE) === 0) lh = 0;
          } else if (mode === RUN && (near & NEAR_GATE) === 0) lh = 0;
        } else if (falls && near === 0 && s - edgeF > COYOTE_STEPS) {
          // In the air, nothing the button does moves him: all that
          // matters is whether a waiting press is still alive when he
          // lands, and that is a yes or a no.
          const k = landSteps(BUFFER_STEPS + 2);
          if (k > BUFFER_STEPS + 2 || (k < 0 && !landingWithin(T))) {
            pa = BUFFER_STEPS;
            lh = 0;
          } else if (k > 0 && pa < BUFFER_STEPS) {
            pa = pa + k < BUFFER_STEPS ? 0 : BUFFER_STEPS;
          }
        }
      }
    }
    h1 = 0x811c9dc5 | 0;
    h2 = 0x01000193;
    mix(Math.round(x * 64));
    mix(Math.round(y / qy));
    mix(Math.round(vy / qv));
    mix(
      mode | ((grav === 1 ? 1 : 0) << 3) | ((grounded ? 1 : 0) << 4) | (lh << 5)
    );
    mix(spd | ((scrollBits & scrollMask) << 4));
    mix(pa);
    const ea = s - edgeF;
    mix(ea <= COYOTE_STEPS ? ea : COYOTE_STEPS + 1);
    mix(groundIdx >= 0 && MPER[groundIdx] > 0 ? groundIdx : -1);
    mix(floorY === floorY ? Math.round(floorY * 64) : 0x7fff);
    mix(ceilY === ceilY ? Math.round(ceilY * 64) : 0x7ffe);
    // Used flags of what is in reach: everything behind is spent, everything
    // ahead untouched, so only the nearby ones tell states apart.
    const c = cellOf(x);
    for (let k = TCH_S[c], e = TCH_S[c + 1]; k < e; k++) {
      const i = TCH_I[k];
      if (used[i] === 1) mix(i);
    }
    return (h1 >>> 0) * 2097152 + ((h2 >>> 0) & 0x1fffff);
  }

  /**
   * True when the button cannot change anything over the next 2 steps: in
   * the air in Run, Roll or Shadow Step, past coyote time, with nothing in
   * reach a press could use and no landing before such a press would
   * expire. The solver then tries only one input. (The kite, the dragon and
   * the parasol always listen to the button.)
   */
  function idle(): boolean {
    if (grounded || !(mode === RUN || mode === ROLL || mode === SHADOW))
      return false;
    if (frame - edgeF <= COYOTE_STEPS + 2) return false;
    const T = (BUFFER_STEPS + 2) * STEP;
    return nearby(speedV * T + 1.5) === 0 && !landingWithin(T);
  }

  /**
   * Steps until he lands, falling freely from here (in Run, Roll and Shadow
   * Step nothing the button does changes a fall): 1..maxK; maxK + 1 if not
   * within maxK; -1 if it is not that simple (something moving nearby, or
   * a contact that is not a plain landing).
   */
  function landSteps(maxK: number): number {
    let vg = grav * vy;
    let F = grav * y - hh;
    let px = x;
    const snap = SNAP[MODE_LIST[mode]];
    const fl = grav === 1 ? floorY : -ceilY;
    const cl = grav === 1 ? ceilY : -floorY;
    const c0 = cellOf(x);
    const c1 = cellOf(x + speedV * maxK * STEP + 1);
    for (let c = c0; c <= c1; c++) {
      for (let k = SOL_S[c], e = SOL_S[c + 1]; k < e; k++)
        if (MPER[SOL_I[k]] > 0) return -1;
    }
    for (let k = 1; k <= maxK; k++) {
      let vg1 = vg - G * STEP;
      if (vg1 < -MAX_FALL) vg1 = -MAX_FALL;
      const Fp = F;
      F += 0.5 * (vg + vg1) * STEP;
      vg = vg1;
      px += speedV * STEP;
      if (fl === fl && F < fl) return vg <= 0 ? k : -1;
      if (cl === cl && F + 2 * hh > cl) return -1;
      const L = px - hw;
      const Rr = px + hw;
      for (let c = c0; c <= c1; c++) {
        for (let q = SOL_S[c], e = SOL_S[c + 1]; q < e; q++) {
          const i = SOL_I[q];
          if (Rr <= X0[i] + EPS || L >= X1[i] - EPS) continue;
          const sT = grav === 1 ? Y1[i] : -Y0[i];
          const sB = grav === 1 ? Y0[i] : -Y1[i];
          if (F + 2 * hh <= sB + EPS || F >= sT - EPS) continue;
          if (vg <= 0 && (F >= sT - snap || Fp >= sT - EPS)) return k;
          return -1;
        }
      }
    }
    return maxK + 1;
  }

  /** Unused lanterns, gates (and wind chevrons) and drums within `ahead` blocks in front (NEAR_* bits). */
  function nearby(ahead: number): number {
    let near = 0;
    const c1 = cellOf(x + ahead);
    for (let c = cellOf(x); c <= c1; c++) {
      for (let k = TCH_S[c], e = TCH_S[c + 1]; k < e; k++) {
        const i = TCH_I[k];
        // Spent, or wholly behind him: out of play.
        if (used[i] === 1 || BX1[i] < x - hw) continue;
        const kind = KIND[i];
        if (kind === K_ORB) near |= NEAR_ORB;
        else if (kind === K_GATE || kind === K_SPEED) near |= NEAR_GATE;
        else if (kind === K_PAD) near |= NEAR_PAD;
      }
    }
    return near;
  }

  /**
   * Could he land within T seconds, falling freely from here? True if any
   * surface (a solid's g-space top, wherever its motion can take it, or the
   * floor bound) lies within reach of his arc ahead, or anything could cut
   * a rise short. Conservative: a true here only costs the solver time.
   */
  function landingWithin(T: number): boolean {
    const vg = grav * vy;
    const F = grav * y - hh;
    const H = F + 2 * hh;
    const lowest = vg * T - 0.5 * G * T * T; // where the arc is after T (it only gets lower)
    const drop = lowest < 0 ? -lowest : 0;
    const rise = vg > 0 ? (vg * vg) / (2 * G) : 0;
    const lo = F - drop - SNAP.run - 0.05;
    const hi = F + rise + 0.05;
    const xa = x - hw - 0.1;
    const xb = x + hw + speedV * T + 0.1;
    const fl = grav === 1 ? floorY : -ceilY;
    if (fl === fl && fl >= lo) return true;
    const cl = grav === 1 ? ceilY : -floorY;
    if (cl === cl && rise > 0 && cl <= H + rise + 0.05) return true;
    const c1 = cellOf(xb);
    for (let c = cellOf(x); c <= c1; c++) {
      for (let k = SOL_S[c], e = SOL_S[c + 1]; k < e; k++) {
        const i = SOL_I[k];
        const mx = MDX[i] < 0 ? -MDX[i] : MDX[i];
        if (X1[i] + mx < xa || X0[i] - mx > xb) continue;
        const my = MDY[i] < 0 ? -MDY[i] : MDY[i];
        // g-space top and underside, at the extremes of any motion.
        const sTop = grav === 1 ? Y1[i] + my : -Y0[i] + my;
        const sBot = grav === 1 ? Y0[i] - my : -Y1[i] - my;
        if (sTop >= lo && sBot <= hi) return true;
        if (rise > 0 && sBot > F && sBot <= H + rise + 0.05) return true;
      }
    }
    return false;
  }

  // ── Clearance (the solver's safety margin) ───────────────────────────────
  function clearance(): number {
    const beats = frame * STEP * beatsPerSec;
    const hx = hw * HAZARD_SCALE;
    const hy = hh * HAZARD_SCALE;
    const L = x - hx;
    const Rr = x + hx;
    const B = y - hy;
    const T = y + hy;
    let best = CLEAR_CAP;
    const c = cellOf(x);
    for (let k = HAZ_S[c], e = HAZ_S[c + 1]; k < e; k++) {
      const i = HAZ_I[k];
      const kind = KIND[i];
      let d: number;
      if (kind === K_LANTERN) {
        const a = Y1[i] * Math.sin(TAU * (beats / MPER[i] + MPH[i]));
        d = circleDist(
          X0[i] + X1[i] * Math.sin(a),
          Y0[i] - X1[i] * Math.cos(a),
          R[i],
          L,
          Rr,
          B,
          T
        );
      } else if (kind === K_VENT) {
        const cycle = VON[i] + VOFF[i];
        const cyc = beats + MPH[i];
        if (cyc - Math.floor(cyc / cycle) * cycle >= VON[i]) continue;
        d = boxDist(X0[i], X1[i], Y0[i], Y1[i], L, Rr, B, T);
      } else {
        let ox = 0;
        let oy = 0;
        if (MPER[i] > 0) {
          const w = wave(i, beats);
          ox = MDX[i] * w;
          oy = MDY[i] * w;
        }
        d =
          kind === K_SPIKE
            ? boxDist(
                X0[i] + ox,
                X1[i] + ox,
                Y0[i] + oy,
                Y1[i] + oy,
                L,
                Rr,
                B,
                T
              )
            : circleDist(X0[i] + ox, Y0[i] + oy, R[i], L, Rr, B, T);
      }
      if (d < best) best = d;
    }
    if (mode === KITE || mode === PARASOL || mode === DRAGON) {
      // The face of a solid ahead: its side, minus the band at the top he
      // would be lifted over.
      const snap = SNAP[MODE_LIST[mode]];
      for (let k = SOL_S[c], e = SOL_S[c + 1]; k < e; k++) {
        const i = SOL_I[k];
        let ox = 0;
        let oy = 0;
        if (MPER[i] > 0) {
          const w = wave(i, beats);
          ox = MDX[i] * w;
          oy = MDY[i] * w;
        }
        const sx0 = X0[i] + ox;
        if (sx0 < x + hw - EPS) continue;
        const sy0 = Y0[i] + oy + (grav === 1 ? 0 : snap);
        const sy1 = Y1[i] + oy - (grav === 1 ? snap : 0);
        const d = boxDist(
          sx0,
          X1[i] + ox,
          sy0,
          sy1,
          x - hw,
          x + hw,
          y - hh,
          y + hh
        );
        if (d < best) best = d;
      }
    }
    return best;
  }

  reset();

  const sim: DashSim = {
    level,
    state,
    step,
    snapshot(): SimSnapshot {
      const snap: PackedSnapshot = {
        __snapshot: true,
        f: new Float64Array(SNAP_LEN),
        used: new Uint8Array(n),
      };
      saveTo(snap.f, snap.used);
      return snap;
    },
    restore(sn: SimSnapshot) {
      const p = sn as PackedSnapshot;
      loadFrom(p.f, p.used);
    },
    reset,
    saveTo,
    loadFrom,
    key,
    clearance,
    idle,
    get x() {
      return x;
    },
    get frame() {
      return frame;
    },
    get over() {
      return dead ? 1 : done ? 2 : 0;
    },
    get scrollBits() {
      return scrollBits;
    },
    get pressAge() {
      return frame - pressF;
    },
    get cause() {
      return causeCode >= 0 ? DEATHS[causeCode] : null;
    },
  };
  return sim;
}

/** Distance between the boxes [ax0, ax1] × [ay0, ay1] and [x0, x1] × [y0, y1] (0 if they touch). */
function boxDist(
  ax0: number,
  ax1: number,
  ay0: number,
  ay1: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): number {
  const dx = ax0 > x1 ? ax0 - x1 : x0 > ax1 ? x0 - ax1 : 0;
  const dy = ay0 > y1 ? ay0 - y1 : y0 > ay1 ? y0 - ay1 : 0;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Distance from the circle (cx, cy, r) to the box [x0, x1] × [y0, y1] (0 if they touch). */
function circleDist(
  cx: number,
  cy: number,
  r: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): number {
  const nx = cx < x0 ? x0 : cx > x1 ? x1 : cx;
  const ny = cy < y0 ? y0 : cy > y1 ? y1 : cy;
  const d = Math.sqrt((cx - nx) * (cx - nx) + (cy - ny) * (cy - ny)) - r;
  return d > 0 ? d : 0;
}

/** Does the circle (cx, cy, r) touch the box [x0, x1] × [y0, y1]? */
function circleBox(
  cx: number,
  cy: number,
  r: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number
): boolean {
  const nx = cx < x0 ? x0 : cx > x1 ? x1 : cx;
  const ny = cy < y0 ? y0 : cy > y1 ? y1 : cy;
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

/** The modes, re-exported for callers that only import the sim. */
export type { ModeId };
