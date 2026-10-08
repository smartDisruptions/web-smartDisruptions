/**
 * Kiru's Rooftop Run — DASH: the shared contract.
 *
 * Dash is the level game: hand-built levels set to original music, one
 * button, six ways to move (torii gates switch between them). Every Dash module codes against the types in this file:
 *
 *   sim.ts / physics.ts / solver.ts   the simulation (pure, no DOM)
 *   levels/                           the six levels and the authoring kit
 *   engine.ts / camera.ts             the runtime: loop, input, attempts, practice
 *   render/                           the world renderer
 *   kiru-dash.ts                      Kiru in every mode
 *   audio/                            the music and the sound effects
 *   ui/ + ../Game.tsx                 the React shell: menus and panels
 *
 * README.md (next to this file) is the design spec. Change a type here only
 * additively (new optional fields, new union members) unless every owner
 * agrees.
 *
 * UNITS. Everything is in BLOCKS (one block = BLOCK world units). x grows to
 * the right, the way Kiru runs; y grows UP; y = 0 is the level's street
 * line, the bottom of the camera on a level's flat opening stretch. Time t
 * is seconds of level time, advanced in fixed steps of STEP.
 *
 * NODE. sim, physics, solver, the kit and the levels also run in Node (the
 * solver test). Node strips types but cannot run non-erasable TypeScript:
 * no enums, no namespaces, no constructor parameter properties, and always
 * `import type` for type-only imports.
 */

/** Fixed simulation step: 120 Hz, the same on every device. */
export const STEP = 1 / 120;

/** World units per block. The classic game's view is 280 units tall. */
export const BLOCK = 24;

/** The camera's view is this many blocks tall on a landscape screen. */
export const VIEW_H = 11.5;
/** The view's width in blocks is clamped to this range; past it, the height gives. */
export const VIEW_W_MIN = 16;
export const VIEW_W_MAX = 26.5;

// ── Vocabulary ─────────────────────────────────────────────────────────────

/**
 * How Kiru moves. Internal ids, with the display names the UI uses:
 *  run      "Run"          tap or hold to jump
 *  kite     "Kite"         hold to climb, let go to dive (ship)
 *  roll     "Roll"         tap to switch gravity while rolling (ball)
 *  parasol  "Parasol"      each tap is a hop, the parasol slows the fall (UFO)
 *  dragon   "Dragon"       hold to fly up at 45°, let go to fly down (wave)
 *  shadow   "Shadow Step"  tap to vanish and reappear on the other surface (spider)
 */
export type ModeId = 'run' | 'kite' | 'roll' | 'parasol' | 'dragon' | 'shadow';

export const MODE_NAMES: Record<ModeId, string> = {
  run: 'Run',
  kite: 'Kite',
  roll: 'Roll',
  parasol: 'Parasol',
  dragon: 'Dragon',
  shadow: 'Shadow Step',
};

export type SpeedId = 'slow' | 'normal' | 'fast' | 'faster' | 'fastest';

/** Run speed in blocks per second. */
export const SPEEDS: Record<SpeedId, number> = {
  slow: 8.4,
  normal: 10.4,
  fast: 12.9,
  faster: 15.6,
  fastest: 19.2,
};

/** 1: gravity pulls down. -1: upside down, Kiru runs on ceilings. */
export type Grav = 1 | -1;

export type ThemeId =
  | 'dawn'
  | 'lanterns'
  | 'moon'
  | 'storm'
  | 'sakura'
  | 'dojo';

export type Difficulty =
  | 'easy'
  | 'normal'
  | 'hard'
  | 'harder'
  | 'insane'
  | 'demon';

export type LevelId =
  | 'first-light'
  | 'lantern-row'
  | 'moon-gate'
  | 'storm-roofs'
  | 'dragon-festival'
  | 'shadow-dojo';

// ── Level data ─────────────────────────────────────────────────────────────

/**
 * Motion for anything that moves, as a function of LEVEL TIME, so a level is
 * identical on every attempt and from every checkpoint. The object's offset
 * from its placed position is (dx, dy) * w(beats), w swinging -1..1.
 */
export interface Motion {
  dx: number;
  dy: number;
  /** One full cycle, in beats of the level's song. */
  period: number;
  /** Where in the cycle it is at t = 0, 0..1. */
  phase?: number;
  /** 'sine' (default): eases at the ends. 'tri': constant speed, sharp turns. */
  wave?: 'sine' | 'tri';
}

export type RoofStyle = 'tiles' | 'flat' | 'pagoda' | 'shrine' | 'warehouse';
export type BlockStyle =
  | 'tiles'
  | 'crate'
  | 'tank'
  | 'wall'
  | 'beam'
  | 'stone'
  | 'chimney'
  | 'bridge';
export type PadColor = 'jump' | 'hop' | 'leap' | 'flip';
export type OrbColor = 'jump' | 'hop' | 'leap' | 'flip' | 'spin' | 'slam';
export type DecoKind =
  | 'lanterns' // a string of paper lanterns between two points (x..x+s blocks)
  | 'banner' // a tall nobori flag
  | 'cat' // a cat asleep on the roof
  | 'bonsai'
  | 'laundry'
  | 'neon' // a vertical neon sign
  | 'sakura' // a blossoming tree in a pot
  | 'chime' // a wind chime
  | 'torii' // a decorative (non-portal) torii in the background
  | 'stone-lantern'
  | 'crane'; // a paper crane on a string

/** A building. Solid from below the screen up to `top`; its sides are walls. */
export interface RoofObj {
  k: 'roof';
  x: number;
  w: number;
  top: number;
  style?: RoofStyle;
}
/** A solid box [x, x+w] × [y, y+h]: land on it, run under it, never into its side. */
export interface BlockObj {
  k: 'block';
  x: number;
  y: number;
  w: number;
  h: number;
  style?: BlockStyle;
  move?: Motion;
}
/**
 * Iron caltrops: `n` spikes in a row, each one block wide, along the base.
 * Cell (dir 'up'): [x, x+n] × [y, y+1] (half height if small). 'down' hangs
 * from a ceiling at y (cell [x, x+n] × [y-1, y]); 'left'/'right' stick out
 * of a wall, stacked upward.
 */
export interface SpikeObj {
  k: 'spike';
  x: number;
  y: number;
  n?: number;
  dir?: 'up' | 'down' | 'left' | 'right';
  small?: boolean;
  move?: Motion;
}
/** A giant spinning shuriken. Centre (x, y), radius r. */
export interface SawObj {
  k: 'saw';
  x: number;
  y: number;
  r: number;
  move?: Motion;
}
/** A crow on the wing. Centre (x, y); give it a `move` to patrol. */
export interface CrowObj {
  k: 'crow';
  x: number;
  y: number;
  move?: Motion;
}
/**
 * A heavy lantern swinging on a rope from the anchor (x, y): rope `len`
 * blocks, swinging ±`swing` radians (default 0.6) once every `period` beats
 * (default 4). The lantern body is the hazard; the rope is not.
 */
export interface LanternObj {
  k: 'lantern';
  x: number;
  y: number;
  len: number;
  swing?: number;
  period?: number;
  phase?: number;
}
/**
 * A steam (or fire) vent: the column [x, x+w] × [y, y+h] is deadly for `on`
 * beats, then quiet for `off` beats, starting `phase` beats into the cycle.
 * It warns (a hiss, a wisp) for a beat before it blows.
 */
export interface VentObj {
  k: 'vent';
  x: number;
  y: number;
  w?: number;
  h: number;
  on: number;
  off: number;
  phase?: number;
  style?: 'steam' | 'fire';
}
/** A spring drum on a surface at y, cell [x, x+1]. Touching it launches. `flip`: on a ceiling. */
export interface PadObj {
  k: 'pad';
  x: number;
  y: number;
  c: PadColor;
  flip?: boolean;
}
/** A floating spirit lantern. Press while touching it to use it. Centre (x, y). */
export interface OrbObj {
  k: 'orb';
  x: number;
  y: number;
  c: OrbColor;
  move?: Motion;
}
/**
 * A torii gate: crossing x (centre within y ± h/2, h default 4) switches
 * mode and/or gravity. It also sets the corridor bounds that hold from here
 * on: `floor` / `ceil` are solid, safe-to-touch lines (blocks); null or
 * omitted means none (rooftops are the floor; the sky is open). Flying modes
 * (kite, parasol, dragon) with no bounds get a 10-block corridor centred on
 * the gate.
 */
export interface GateObj {
  k: 'gate';
  x: number;
  y: number;
  h?: number;
  mode?: ModeId;
  grav?: Grav;
  floor?: number | null;
  ceil?: number | null;
}
/** Wind chevrons: crossing x (centre within y ± h/2, h default 4) changes speed. */
export interface SpeedObj {
  k: 'speed';
  x: number;
  y: number;
  h?: number;
  speed: SpeedId;
}
/** A secret scroll. Three per level, ids 0, 1, 2. Centre (x, y). */
export interface ScrollObj {
  k: 'scroll';
  x: number;
  y: number;
  id: 0 | 1 | 2;
  move?: Motion;
}
/** A sign in the world (tutorial lines, the level's name). Centre (x, y); size in blocks. */
export interface TextObj {
  k: 'text';
  x: number;
  y: number;
  text: string;
  size?: number;
}
/** Pure decoration: never collides. `s` is a size or span, per kind. */
export interface DecoObj {
  k: 'deco';
  x: number;
  y: number;
  d: DecoKind;
  s?: number;
  flip?: boolean;
}
/** From x on, the palette crossfades to `theme` over `fade` blocks (default 8). */
export interface ThemeObj {
  k: 'theme';
  x: number;
  theme: ThemeId;
  fade?: number;
}
/** The finish line. Crossing it completes the level. Exactly one per level. */
export interface EndObj {
  k: 'end';
  x: number;
}

export type Obj =
  | RoofObj
  | BlockObj
  | SpikeObj
  | SawObj
  | CrowObj
  | LanternObj
  | VentObj
  | PadObj
  | OrbObj
  | GateObj
  | SpeedObj
  | ScrollObj
  | TextObj
  | DecoObj
  | ThemeObj
  | EndObj;

export type ObjKind = Obj['k'];

/** One section of a level's song, which the gameplay follows. */
export interface Section {
  name: string;
  /** Length in bars (4 beats each). */
  bars: number;
  /** 1 calm … 5 everything at once. The music and the level both follow it. */
  energy: 1 | 2 | 3 | 4 | 5;
  /** The main mode the level uses here (a hint for the designer and composer). */
  mode: ModeId;
  /** Speed the section should run at (the level places the speed portal). */
  speed: SpeedId;
  /** What the section is for, in words. */
  note: string;
}

/** Everything about a level except its objects: what menus and music need. */
export interface LevelMeta {
  id: LevelId;
  /** 1-based order in the level list. */
  n: number;
  name: string;
  /** One short line for the level card. */
  tagline: string;
  difficulty: Difficulty;
  stars: number;
  bpm: number;
  /** The song's structure; the level is built to it. */
  sections: Section[];
  theme: ThemeId;
  startMode: ModeId;
  startSpeed: SpeedId;
  /** The modes a player meets in this level, in order of appearance. */
  modes: ModeId[];
}

export interface LevelDef extends LevelMeta {
  /** All objects, sorted by x (left edge, or centre for round things). */
  objects: Obj[];
  /** Kiru's start: hitbox centre x, and the surface y his feet start on. */
  start: { x: number; y: number };
  /** Falling below this y is a death (default -4). */
  killBelow?: number;
  /** Rising above this y (upside down, no ceiling) is a death (default 40). */
  killAbove?: number;
}

// ── Simulation ─────────────────────────────────────────────────────────────

export interface PlayerView {
  /** Hitbox centre, blocks. */
  x: number;
  y: number;
  /** Vertical velocity, blocks/s, world up positive. */
  vy: number;
  /** Current hitbox size, blocks (it changes with the mode). */
  w: number;
  h: number;
  mode: ModeId;
  grav: Grav;
  /** Resting on the surface gravity pulls toward (floor, or ceiling when upside down). */
  grounded: boolean;
  /** Radians: a visual hint from the physics (roll spin, dragon heading, kite pitch). */
  rot: number;
  /** Seconds since gravity last changed (Infinity if never this attempt). */
  flipT: number;
  /** Seconds since the current mode began. */
  modeT: number;
  /** Seconds since the last launch: jump, orb, pad, flap, teleport. */
  jumpT: number;
  dead: boolean;
  /** Crossed the finish line. */
  done: boolean;
}

export type DeathCause =
  | 'spike'
  | 'saw'
  | 'crow'
  | 'lantern'
  | 'vent'
  | 'wall' // ran into the side of a block or a roof
  | 'pit' // fell below the level
  | 'sky' // fell upward into the open sky
  | 'crush';

/** What happened during the last step: the renderer turns these into particles, the audio into sounds. */
export type SimEvent =
  | { e: 'jump'; x: number; y: number }
  | { e: 'land'; x: number; y: number; v: number }
  | { e: 'orb'; x: number; y: number; c: OrbColor; i: number }
  | { e: 'pad'; x: number; y: number; c: PadColor; i: number }
  | { e: 'gate'; x: number; y: number; i: number; mode?: ModeId; grav?: Grav }
  | { e: 'speed'; x: number; y: number; i: number; speed: SpeedId }
  | { e: 'scroll'; x: number; y: number; id: 0 | 1 | 2; i: number }
  | { e: 'flap'; x: number; y: number }
  | { e: 'flip'; x: number; y: number }
  | { e: 'teleport'; x: number; y0: number; y1: number }
  | { e: 'death'; x: number; y: number; cause: DeathCause }
  | { e: 'complete'; x: number; y: number };

export interface SimState {
  /** Level time, seconds. */
  t: number;
  /** Steps since the level start. */
  frame: number;
  player: PlayerView;
  speed: SpeedId;
  /** The corridor in force (set by the last gate). */
  bounds: { floor: number | null; ceil: number | null };
  /** One byte per level object (same index): 1 once used this attempt (orb, pad, gate, scroll…). */
  used: Uint8Array;
  /** Events raised by the last step only. */
  events: SimEvent[];
  /** 0..1: how far through the level (x over the finish line's x). */
  progress: number;
  /** Presses that did something this attempt, for the stats. */
  jumps: number;
  /** Secret scrolls picked up this attempt. */
  scrolls: [boolean, boolean, boolean];
}

export interface Input {
  /** The button is down during this step. */
  held: boolean;
  /** A new press began since the last step. */
  pressed: boolean;
}

/** Opaque: everything needed to resume a run exactly where it was. */
export interface SimSnapshot {
  readonly __snapshot: true;
}

export interface Sim {
  readonly level: LevelDef;
  readonly state: SimState;
  /** Advance one STEP. Does nothing once the player is dead or done. */
  step(input: Input): void;
  snapshot(): SimSnapshot;
  restore(s: SimSnapshot): void;
  /** Back to the level start. */
  reset(): void;
}

// ── Kiru's look ────────────────────────────────────────────────────────────

export type TrailId = 'none' | 'ink' | 'petals' | 'sparks' | 'embers' | 'stars';

export interface KiruSkin {
  /** Headband (and kite, parasol, dragon) accent colour. Default the site's vermilion. */
  band: string;
  trail: TrailId;
}

export const DEFAULT_SKIN: KiruSkin = { band: '#e8432a', trail: 'none' };

/** Everything kiru-dash.ts needs to draw one frame of Kiru. */
export interface KiruDashPose {
  /** Seconds, for idle motion (tails, blink). */
  t: number;
  mode: ModeId;
  grav: Grav;
  /** Blocks/s, world up positive. */
  vy: number;
  grounded: boolean;
  /** Radians, the physics hint (PlayerView.rot). */
  rot: number;
  /** Run cycle, radians. */
  runPhase: number;
  /** 0 on the ground … 1 fully airborne (eased by the renderer). */
  air: number;
  jumpT: number;
  flipT: number;
  modeT: number;
  /** The button is held (the kite climbs, the dragon rises). */
  held: boolean;
  skin: KiruSkin;
  /** Canvas pixels per block. */
  scale: number;
  blink: boolean;
  /** 0..1 while dying (he is about to shatter); 0 otherwise. */
  dying: number;
  /**
   * The launch that started jumpT came from a drum (pad: yellow, pink, red)
   * or a spirit lantern (orb: yellow, pink, red, green). Run and Shadow Step
   * answer it with a forward flip. Omitted: kiru-dash guesses from the
   * take-off speed, which catches drums and red lanterns only.
   */
  boosted?: boolean;
  /**
   * The player asked for reduced motion (RenderFrame.reducedMotion): no white
   * flash before the shatter (a steady fade instead) and no pop on a mode
   * change.
   */
  reducedMotion?: boolean;
}

// ── Runtime ↔ renderer ─────────────────────────────────────────────────────

export type DashPhase = 'attract' | 'playing' | 'paused' | 'dying' | 'complete';

export interface RenderFrame {
  level: LevelDef;
  /** The latest simulation step. */
  state: SimState;
  /** Interpolated level time (s), for animation. */
  t: number;
  /** Interpolated player hitbox centre (blocks). */
  px: number;
  py: number;
  /** The world point at the view's bottom-left (blocks), already smoothed. */
  camX: number;
  camY: number;
  /** View size in blocks. */
  viewW: number;
  viewH: number;
  /** Fractional beats since the song began (t * bpm / 60): pulses on the beat. */
  beat: number;
  phase: DashPhase;
  /** Seconds since the phase began (the death shatter, the finish fireworks). */
  phaseT: number;
  attempt: number;
  practice: boolean;
  /** Practice checkpoints, newest last. */
  checkpoints: { x: number; y: number }[];
  /** Best progress so far on this level in this mode, 0..1. */
  best: number;
  held: boolean;
  skin: KiruSkin;
  reducedMotion: boolean;
}

export interface DashRenderer {
  /** Canvas backing size changed (CSS px and device pixel ratio); re-bake what depends on it. */
  resize(cssW: number, cssH: number, dpr: number): void;
  /** Prepare this level's art (theme, sprites). */
  setLevel(level: LevelDef): void;
  /** A sim event happened: particles, a flash, a shake. */
  event(ev: SimEvent, f: RenderFrame): void;
  draw(f: RenderFrame): void;
  destroy(): void;
}

// ── Audio ──────────────────────────────────────────────────────────────────

export type SfxId =
  | 'jump'
  | 'land'
  | 'orb'
  | 'pad'
  | 'gate'
  | 'speed'
  | 'scroll'
  | 'flap'
  | 'flip'
  | 'teleport'
  | 'death'
  | 'complete'
  | 'checkpoint'
  | 'newBest'
  | 'click';

/**
 * Music and sound. OFF until the player turns sound on (the site's rule:
 * nothing plays unasked, and the choice is not remembered between visits).
 * Everything is synthesised: no audio files.
 *
 * The runtime calls play / pause / resume / stop whether sound is on or not.
 * The module keeps track of where the song would be, so turning sound on in
 * the middle of a run starts the music at the right bar, in time with the
 * level.
 */
export interface DashAudio {
  readonly on: boolean;
  /** Called from a user gesture: creates or resumes the AudioContext. */
  setOn(on: boolean): void;
  /** Start `level`'s song from level time `fromSec` (an attempt, or a checkpoint). */
  play(level: LevelId, fromSec: number): void;
  /** Stop the song (death, exit). */
  stop(): void;
  pause(): void;
  /** Carry on from level time `fromSec`. */
  resume(fromSec: number): void;
  /** Quiet menu music while choosing a level (optional; may do nothing). */
  menu(): void;
  sfx(id: SfxId): void;
  destroy(): void;
}

// ── Runtime ↔ React shell ──────────────────────────────────────────────────

export interface LevelProgress {
  /** Best normal-mode progress, 0..100 (whole percent). */
  best: number;
  /** Best practice-mode progress, 0..100. */
  practiceBest: number;
  attempts: number;
  completed: boolean;
  /** Scrolls only count when collected on a completed normal-mode run. */
  scrolls: [boolean, boolean, boolean];
  jumps: number;
}

/**
 * Attempts and jumps stop counting here, in the save and on screen: a damaged
 * save can't claim absurd numbers.
 */
export const MAX_COUNT = 9_999_999;

export const EMPTY_PROGRESS: LevelProgress = {
  best: 0,
  practiceBest: 0,
  attempts: 0,
  completed: false,
  scrolls: [false, false, false],
  jumps: 0,
};

export interface DashRunInfo {
  levelId: LevelId;
  practice: boolean;
  /**
   * This attempt's number on this level, counted over every visit
   * (the saved attempts + 1 when the level starts): the
   * canvas's "Attempt N".
   */
  attempt: number;
  /** This attempt's progress, 0..100. */
  percent: number;
  /** Best progress in this mode (normal or practice), including this attempt. */
  best: number;
  newBest: boolean;
  completed: boolean;
  /** Scrolls picked up on this attempt. */
  scrolls: [boolean, boolean, boolean];
  jumps: number;
  /** Seconds this attempt lasted. */
  time: number;
  /**
   * The attempt was given up part-way (a restart, a practice switch, back to
   * the menus, another level) after some of it was played. It counts as an
   * attempt, with its jumps, but sets no best and keeps no scrolls.
   */
  abandoned?: boolean;
}

export interface DashEngineOptions {
  canvas: HTMLCanvasElement;
  reducedMotion: boolean;
  touch: boolean;
  /** CSS font-family list for in-canvas text (the site's display face first). */
  hudFont: string;
  audio: DashAudio;
  skin: KiruSkin;
  /** The phase changed: the shell shows or hides its panels. */
  onPhase(phase: DashPhase, info: DashRunInfo | null): void;
  /**
   * An attempt ended (death or finish), or was given up part-way
   * (`abandoned`): the shell saves progress.
   */
  onAttempt(info: DashRunInfo): void;
  /** A shortcut key the shell handles: M sound, Esc/P pause, Q quit to levels. */
  onKey?(key: 'sound' | 'pause' | 'quit'): void;
}

export interface DashEngine {
  /** Run a level from the start (or from no checkpoint in practice). */
  start(level: LevelDef, progress: LevelProgress, practice: boolean): void;
  /** Kiru runs an easy endless strip behind the menus. */
  attract(): void;
  pause(): void;
  resume(): void;
  /** A fresh attempt from the start (practice: from the latest checkpoint). */
  restart(): void;
  /** Practice on/off mid-level: switching restarts the attempt. */
  setPractice(on: boolean): void;
  placeCheckpoint(): void;
  removeCheckpoint(): void;
  setSkin(skin: KiruSkin): void;
  readonly phase: DashPhase;
  destroy(): void;
}

export interface DashSave {
  v: 1;
  levels: Partial<Record<LevelId, LevelProgress>>;
  skin: KiruSkin;
}

// ── Module entry points (path → export) ────────────────────────────────────
//
//   sim.ts            export function createSim(level: LevelDef): Sim
//   render/index.ts   export function createRenderer(canvas, opts): DashRenderer
//   kiru-dash.ts      export function drawKiruDash(ctx, x, y, pose): void
//   audio/index.ts    export function createDashAudio(): DashAudio
//   engine.ts         export function createDashEngine(opts): DashEngine
//   levels/index.ts   export function getLevel(id): LevelDef; LEVEL_METAS

export type CreateSim = (level: LevelDef) => Sim;

export interface RendererOptions {
  /** CSS font-family list for in-canvas text. */
  hudFont: string;
  reducedMotion: boolean;
}
/** The renderer takes the canvas's 2D context itself; the runtime sizes the canvas. */
export type CreateRenderer = (
  canvas: HTMLCanvasElement,
  opts: RendererOptions
) => DashRenderer;

/**
 * Draws Kiru in the context's current coordinate space (y down, as canvas
 * is): (x, y) is his hitbox centre, and pose.scale is units per block.
 */
export type DrawKiruDash = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pose: KiruDashPose
) => void;

export type CreateDashAudio = () => DashAudio;

export type CreateDashEngine = (opts: DashEngineOptions) => DashEngine;
