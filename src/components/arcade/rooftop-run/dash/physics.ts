/**
 * Kiru's Rooftop Run — DASH physics: every tuned number in one place, the
 * shared geometry of the level objects, and the facts a level designer reads
 * (how high a jump goes, how far it carries, how fast the kite climbs).
 *
 * Units are blocks and seconds; y grows up. The simulation (sim.ts) is the
 * only thing that moves Kiru; this file only says how. The renderer may
 * import the geometry helpers at the bottom (motion, lantern swing, vent
 * timing) so what it draws is exactly what the simulation tests.
 *
 * "g-space" in the comments means gravity-relative: up is away from the
 * surface gravity pulls Kiru toward. Upside down, every number here holds
 * with up and down swapped.
 *
 * Runs in Node too (the solver test): erasable TypeScript only.
 */
import { SPEEDS, STEP } from './types';
import type {
  LanternObj,
  ModeId,
  Motion,
  OrbColor,
  PadColor,
  SpeedId,
  SpikeObj,
  VentObj,
} from './types';

// ── Run: Geometry Dash's cube ─────────────────────────────────────────────
//
// A fixed arc: no variable height, so a jump is a jump and the level can be
// learned. Two numbers decide it. The peak sets which steps he can climb (2
// blocks yes, 3 no). The airtime sets the spike rows: the feet must stay above
// a caltrop's hitbox for as long as the row takes to pass under him, and at
// normal speed three caltrops take 0.287 s while four take 0.383 s. With these
// numbers the feet stay above caltrop height for 0.363 s: a triple clears with
// a window of 83 to 92 ms measured step by step (±41 to ±46 ms, five 60 Hz
// frames), and a quadruple falls 20 ms short, more than two simulation steps,
// so no lucky sampling ever lets one through. A row's window differs from the
// next by exactly one block's travel (96 ms at normal speed), so a fair triple
// and an impossible quadruple cannot both get wider.

/** Height of a Run jump's peak above the take-off surface, blocks. */
export const JUMP_PEAK = 2.2;
/** Seconds from take-off to touching down again on the same level. */
export const JUMP_AIR = 0.406;
/** Run gravity, blocks/s². Roll and Shadow Step fall the same way. */
export const G = (8 * JUMP_PEAK) / (JUMP_AIR * JUMP_AIR);
/** Take-off speed of a Run jump, blocks/s. */
export const JUMP_V = (4 * JUMP_PEAK) / JUMP_AIR;
/**
 * Terminal fall speed, blocks/s. Kept below SNAP per step (26 / 120 = 0.22)
 * so a fall can never pass through a landing in one step.
 */
export const MAX_FALL = 26;

/** A press this many steps (0.1 s) before he can act still counts. */
export const BUFFER_STEPS = 12;
/** Run, Roll and Shadow Step may still act this many steps (0.05 s) after walking off an edge. */
export const COYOTE_STEPS = 6;

// ── Kite: the ship ────────────────────────────────────────────────────────
//
// Hold to accelerate up, let go to accelerate down. Both the speed cap and the
// acceleration scale with the run speed, so the climb ANGLE is the same at
// every speed (about 40°) and a corridor drawn in blocks flies the same way;
// only the turns get wider as he goes faster.

/** Climb and dive speed cap, as a fraction of the run speed. */
export const KITE_RATE = 0.85;
/** Seconds to swing from a full dive to a full climb (or back). */
export const KITE_SWING = 0.35;

// ── Parasol: the UFO ──────────────────────────────────────────────────────

/** Parasol gravity, as a fraction of Run's: the parasol makes the fall gentle. */
export const PARASOL_GRAVITY = 0.45;
/** Every tap is a hop this high (blocks), from wherever he is. */
export const PARASOL_HOP = 1.6;
/** The parasol caps his fall at this speed, blocks/s. */
export const PARASOL_MAX_FALL = 7;
/** Parasol gravity, blocks/s². */
export const PARASOL_G = PARASOL_GRAVITY * G;
/** Upward speed a hop starts with, blocks/s. */
export const PARASOL_HOP_V = Math.sqrt(2 * PARASOL_G * PARASOL_HOP);

// ── Dragon: the wave ──────────────────────────────────────────────────────

/** Vertical speed as a fraction of the run speed: 1 is a 45° zigzag. */
export const DRAGON_SLOPE = 1;

// ── Launches: drums (pads), spirit lanterns (orbs), gravity flips ─────────

/**
 * How high each drum throws him, blocks above the drum, in every mode that
 * falls (Run, Roll, Shadow Step, Parasol). Blue flips gravity instead.
 */
export const PAD_PEAK: Record<Exclude<PadColor, 'blue'>, number> = {
  yellow: 4.5,
  pink: 3.2,
  red: 6.5,
};
/**
 * Spirit lanterns, as multiples of a full jump's take-off SPEED (height goes
 * with the square: pink reaches 0.49 of a jump's height, red 1.82).
 */
export const ORB_KICK: Record<'yellow' | 'pink' | 'red' | 'green', number> = {
  yellow: 1,
  pink: 0.7,
  red: 1.35,
  green: 1,
};
/** The black lantern's push toward the ground, blocks/s (capped by the mode's fall cap). */
export const BLACK_V = 1.2 * JUMP_V;
/**
 * The small push a gravity flip gives toward the new ground (blue drum, blue
 * lantern, a Roll tap), blocks/s. It makes a flip read as a deliberate move
 * rather than a slow drift off the surface.
 */
export const FLIP_PUSH = 0.35 * JUMP_V;
/** A mode gate keeps this fraction of his vertical speed (Geometry Dash halves it). */
export const MODE_VY_KEEP = 0.5;
/** A gravity gate keeps this fraction of his vertical speed. */
export const GRAV_VY_KEEP = 0.5;

// ── Hitboxes ──────────────────────────────────────────────────────────────

/** Kiru's solid box per mode, blocks. Its centre is the player's x, y. */
export const HITBOX: Record<ModeId, { w: number; h: number }> = {
  run: { w: 0.8, h: 1.4 },
  shadow: { w: 0.8, h: 1.4 },
  roll: { w: 0.9, h: 0.9 },
  kite: { w: 0.8, h: 0.8 },
  parasol: { w: 0.8, h: 0.8 },
  dragon: { w: 0.4, h: 0.4 },
};
/** Hazards test against the solid box scaled by this (about 15% smaller): a near miss is a miss. */
export const HAZARD_SCALE = 0.85;
/**
 * The inner box (this fraction of the solid box, centred) decides crushes:
 * overlapping a solid only kills once the inner box is inside it.
 */
export const INNER_SCALE = 0.5;
/**
 * Ledge forgiveness, blocks: if his feet are within this much below a top
 * surface when he meets it, he lands on it (or, rising, is lifted onto it)
 * instead of hitting its side. Smaller for the small flying hitboxes, so the
 * dragon cannot slide over a block it clearly flew into.
 */
export const SNAP: Record<ModeId, number> = {
  run: 0.25,
  shadow: 0.25,
  roll: 0.25,
  kite: 0.2,
  parasol: 0.2,
  dragon: 0.1,
};
/** A side contact deeper than this (blocks) is a wall death; less is a touch. */
export const WALL_EPS = 0.02;

// ── Object geometry ───────────────────────────────────────────────────────

/** Caltrops: the hitbox starts this far in from each end of a row, blocks. */
export const SPIKE_INSET = 0.35;
/** Caltrops: the hitbox's height from the base, blocks (a full caltrop is 1 tall). */
export const SPIKE_TALL = 0.55;
/** Small caltrops (half height): the hitbox's height from the base. */
export const SPIKE_TALL_SMALL = 0.28;
/** Shuriken: the hitbox radius is this fraction of the drawn radius. */
export const SAW_SCALE = 0.8;
/** Crow: hitbox radius, blocks. */
export const CROW_R = 0.4;
/** Swinging lantern: the body's hitbox radius, blocks (the rope is harmless). */
export const LANTERN_R = 0.45;
/** Lantern defaults: swing amplitude (radians) and period (beats). */
export const LANTERN_SWING = 0.6;
export const LANTERN_PERIOD = 4;
/** Vents: the deadly column is this much narrower on each side than drawn. */
export const VENT_INSET = 0.1;
/** Spirit lantern (orb): reach radius, blocks, tested against the solid box. Generous, as in GD. */
export const ORB_R = 0.6;
/** Secret scroll: pick-up radius, blocks. */
export const SCROLL_R = 0.6;
/** Drum (pad): the trigger strip is this tall, and inset this much from each side of its cell. */
export const PAD_H = 0.3;
export const PAD_INSET = 0.1;
/** Gates and wind chevrons: default height of the trigger span, blocks. */
export const GATE_H = 4;
/** A flying mode entered through a gate with no bounds gets a corridor this tall, centred on the gate. */
export const FLY_CORRIDOR = 10;
/** Default kill lines (LevelDef.killBelow / killAbove). */
export const KILL_BELOW = -4;
export const KILL_ABOVE = 40;

// ── Modes and speeds as small integers (the simulation's own codes) ───────

export const MODE_LIST: readonly ModeId[] = [
  'run',
  'kite',
  'roll',
  'parasol',
  'dragon',
  'shadow',
];
export const SPEED_LIST: readonly SpeedId[] = [
  'slow',
  'normal',
  'fast',
  'faster',
  'fastest',
];

/** True for the modes that fly inside a corridor (kite, parasol, dragon). */
export function isFlying(mode: ModeId): boolean {
  return mode === 'kite' || mode === 'parasol' || mode === 'dragon';
}

/** Gravity of a mode, blocks/s² (0 for the kite and the dragon, which steer). */
export function gravityOf(mode: ModeId): number {
  if (mode === 'parasol') return PARASOL_G;
  if (mode === 'kite' || mode === 'dragon') return 0;
  return G;
}

/** Fall-speed cap of a mode, blocks/s. */
export function maxFallOf(mode: ModeId, speed: number): number {
  if (mode === 'parasol') return PARASOL_MAX_FALL;
  if (mode === 'kite') return KITE_RATE * speed;
  if (mode === 'dragon') return DRAGON_SLOPE * speed;
  return MAX_FALL;
}

/** Kite: climb and dive speed cap at a run speed (blocks/s). */
export function kiteCap(speed: number): number {
  return KITE_RATE * speed;
}

/** Kite: vertical acceleration at a run speed (blocks/s²). */
export function kiteAccel(speed: number): number {
  return (2 * KITE_RATE * speed) / KITE_SWING;
}

/** Take-off speed that peaks `height` blocks up under gravity `g`. */
export function launchSpeed(height: number, g: number): number {
  return Math.sqrt(2 * g * height);
}

/**
 * The g-space speed a drum gives in a mode (blocks/s, up positive), or NaN
 * when the drum does nothing in that mode. Blue is handled as a flip.
 */
export function padSpeed(
  c: Exclude<PadColor, 'blue'>,
  mode: ModeId,
  speed: number
): number {
  if (mode === 'dragon') return NaN;
  if (mode === 'kite') return kiteCap(speed);
  return launchSpeed(PAD_PEAK[c], gravityOf(mode));
}

/**
 * The g-space speed a spirit lantern gives (blocks/s), or NaN when it does
 * nothing in that mode. Blue only flips; green flips and then uses this.
 */
export function orbSpeed(c: OrbColor, mode: ModeId, speed: number): number {
  if (c === 'blue') return 0;
  if (mode === 'dragon') return c === 'green' ? 0 : NaN;
  if (c === 'black') return -Math.min(BLACK_V, maxFallOf(mode, speed));
  const k = ORB_KICK[c];
  if (mode === 'kite') return Math.min(1, k) * kiteCap(speed);
  return k * launchSpeed(JUMP_PEAK, gravityOf(mode));
}

// ── Facts for level designers (all derived from the numbers above) ────────

/** Blocks per second at a speed id or a raw speed. */
export function speedOf(s: SpeedId | number): number {
  return typeof s === 'number' ? s : SPEEDS[s];
}

/**
 * Seconds after take-off (vertical speed v, gravity g, fall cap) until the
 * feet come back DOWN through `dh` blocks above the take-off level (dh may
 * be negative). NaN if the arc never gets that high.
 */
export function fallTime(
  v: number,
  g: number,
  cap: number,
  dh: number
): number {
  const peak = (v * v) / (2 * g);
  if (dh > peak) return NaN;
  const tPeak = v / g;
  // Free fall from the peak until the cap is reached, then a steady fall.
  const capDrop = (cap * cap) / (2 * g);
  const drop = peak - dh;
  if (drop <= capDrop) return tPeak + Math.sqrt((2 * drop) / g);
  return tPeak + cap / g + (drop - capDrop) / cap;
}

/** Seconds a Run jump spends in the air before landing `dh` blocks above where it left (negative: below). */
export function jumpAirtime(dh = 0): number {
  return fallTime(JUMP_V, G, MAX_FALL, dh);
}

/** Horizontal blocks a Run jump carries before landing `dh` above the take-off level. */
export function jumpReach(speed: SpeedId | number, dh = 0): number {
  return speedOf(speed) * jumpAirtime(dh);
}

/**
 * The widest gap, edge to edge, between two roofs a Run jump clears at this
 * speed, landing `dh` above the take-off roof. He can leave as late as the
 * moment his box clears the edge, and lands as soon as his box reaches the
 * far roof with his feet within SNAP of its top. No coyote time is counted:
 * never design for it.
 */
export function gapMax(speed: SpeedId | number, dh = 0): number {
  return jumpReach(speed, dh - SNAP.run) + HITBOX.run.w;
}

/** Highest step (blocks above where he stands) a Run jump can get onto. */
export const STEP_MAX = JUMP_PEAK + SNAP.run;

/**
 * Timing window (seconds) for clearing a row of `n` caltrops on flat ground
 * with one Run jump at this speed: positive is the window's width, negative
 * means it cannot be done. Continuous estimate; the solver measures the real
 * thing step by step.
 */
export function spikeWindow(
  n: number,
  speed: SpeedId | number,
  small = false
): number {
  const hz = HITBOX.run;
  const feetGap = (hz.h * (1 - HAZARD_SCALE)) / 2; // hazard box bottom above the feet
  const clear = (small ? SPIKE_TALL_SMALL : SPIKE_TALL) - feetGap;
  const above = 2 * Math.sqrt((2 * (JUMP_PEAK - clear)) / G);
  const span = n - 2 * SPIKE_INSET + hz.w * HAZARD_SCALE;
  return above - span / speedOf(speed);
}

/** Peak height (blocks) of a launch with g-space speed v in a falling mode. */
export function peakOf(v: number, mode: ModeId): number {
  const g = gravityOf(mode);
  return g > 0 ? (v * v) / (2 * g) : NaN;
}

/** Parasol: seconds a hop takes to come back down to where it started. */
export function parasolHopTime(): number {
  return fallTime(PARASOL_HOP_V, PARASOL_G, PARASOL_MAX_FALL, 0);
}

// ── Shared object geometry (sim and renderer) ─────────────────────────────

/** Beats since the level began at level time t (seconds). */
export function beatsAt(t: number, bpm: number): number {
  return (t * bpm) / 60;
}

/**
 * A Motion's swing at `beats`, from -1 to 1. The object sits at its placed
 * position plus (dx, dy) times this. 'sine' eases at the ends; 'tri' moves at
 * a constant speed and turns sharply. Both start at 0 rising when phase is 0.
 */
export function motionWave(m: Motion, beats: number): number {
  const p = beats / m.period + (m.phase ?? 0);
  if (m.wave === 'tri') {
    const q = p + 0.25 - Math.floor(p + 0.25);
    return 1 - 4 * Math.abs(q - 0.5);
  }
  return Math.sin(2 * Math.PI * p);
}

/** A swinging lantern's angle from straight down (radians, + swings right) at `beats`. */
export function lanternAngle(o: LanternObj, beats: number): number {
  const p = beats / (o.period ?? LANTERN_PERIOD) + (o.phase ?? 0);
  return (o.swing ?? LANTERN_SWING) * Math.sin(2 * Math.PI * p);
}

/** A swinging lantern's body centre (the part that kills) at `beats`. */
export function lanternBody(
  o: LanternObj,
  beats: number
): { x: number; y: number } {
  const a = lanternAngle(o, beats);
  return { x: o.x + o.len * Math.sin(a), y: o.y - o.len * Math.cos(a) };
}

/**
 * A caltrop row's hitbox at rest, [x0, x1, y0, y1] (add the Motion offset
 * if it moves). One box spans the whole row: caltrops side by side leave no
 * gap a body fits in. Cells: 'up' [x, x+n] × [y, y+1]; 'down' [x, x+n] ×
 * [y-1, y] (hanging from a ceiling at y); 'left' and 'right' [x, x+1] ×
 * [y, y+n], stacked upward, 'right' with its base on the cell's left edge
 * (a wall at x, pointing right) and 'left' with its base on the right edge
 * (a wall at x+1, pointing left). Small caltrops are half as tall (or wide).
 */
export function spikeBox(o: SpikeObj): [number, number, number, number] {
  const n = o.n ?? 1;
  const tall = o.small ? SPIKE_TALL_SMALL : SPIKE_TALL;
  const dir = o.dir ?? 'up';
  if (dir === 'up')
    return [o.x + SPIKE_INSET, o.x + n - SPIKE_INSET, o.y, o.y + tall];
  if (dir === 'down')
    return [o.x + SPIKE_INSET, o.x + n - SPIKE_INSET, o.y - tall, o.y];
  const y0 = o.y + SPIKE_INSET;
  const y1 = o.y + n - SPIKE_INSET;
  return dir === 'right'
    ? [o.x, o.x + tall, y0, y1]
    : [o.x + 1 - tall, o.x + 1, y0, y1];
}

/** True while a vent is blowing (deadly) at `beats`. */
export function ventActive(o: VentObj, beats: number): boolean {
  const cycle = o.on + o.off;
  const c = beats + (o.phase ?? 0);
  return c - Math.floor(c / cycle) * cycle < o.on;
}

/** True when a vent will blow within the next beat (the warning hiss). */
export function ventWarning(o: VentObj, beats: number): boolean {
  return !ventActive(o, beats) && ventActive(o, beats + 1);
}

/** The simulation step, re-exported for modules that only import physics. */
export { STEP };
