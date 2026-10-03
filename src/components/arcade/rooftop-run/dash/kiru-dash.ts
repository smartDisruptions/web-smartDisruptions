/**
 * Kiru in Dash: the same rig as Classic (../kiru.ts, itself the SVG mascot's
 * path data), posed for each of Dash's six ways to move.
 *
 *   run      Classic's run cycle, a tuck in the air, a squash on landing,
 *            and a forward flip when a drum or a spirit lantern launches him.
 *   kite     hanging from the bridle of a big Edo kite painted with the bolt.
 *   roll     curled into a ball: hood, a flash of headband, tails streaming.
 *   parasol  under an open wagasa that pumps on every hop and floats him down.
 *   dragon   riding a little paper festival dragon at 45°.
 *   shadow   running in a cape of ink smoke, eyes lit, arriving in a bloom of
 *            ink after every step.
 *
 * Everything is drawn in the rig's own units (130 per block: he is 208 units
 * tall and 1.6 blocks tall in Run), in a frame whose origin is the hitbox
 * centre and whose +x is the way he runs. Upside down (grav -1) the whole
 * frame is mirrored vertically, so his feet find the ceiling and his tails
 * hang "up" without any mode having to think about it.
 *
 * Budget: no allocations per call. The parts that never change shape (head,
 * gi, katana, kite, parasol, dragon, the curled ball, the smoke loops) are
 * baked once into sprites, at twice the on-screen resolution (the soft smoke
 * at one); the parts that move (limbs, tails, cords, whiskers) are drawn live,
 * and so is the brief white flash before a shatter.
 *
 * Exports: drawKiruDash (every frame), warmKiruDash (optional, bakes the
 * sprites ahead of play), dragonNeck (where the dragon's ribbon body joins).
 */
import { G, JUMP_V } from './physics';
import type { KiruDashPose, KiruSkin, ModeId } from './types';
import {
  KIRU_COLORS,
  kiruArm,
  kiruEyes,
  kiruGradients,
  kiruHilt,
  kiruHood,
  kiruLeg,
  kiruPaths,
  kiruScabbard,
  kiruSticker,
  kiruTail,
  kiruTorso,
  type KiruColors,
} from '../kiru';

const TAU = Math.PI * 2;
/** Rig units per block. */
const U = 130;
/** The rig's y at the Run hitbox centre: soles at 232, hitbox 1.4 blocks tall. */
const RUN_CY = 232 - 0.7 * U;
/** Mode changes pop in over this long (s). */
const MODE_IN = 0.25;
/** Shadow Step's ink bloom lasts this long after a teleport (s). */
const INK_IN = 0.15;
/** A gravity flip turns him over like a card, this fast (s). */
const GRAV_IN = 0.12;

/**
 * Rig units per canvas pixel at full size, set each call. Outlines never get
 * thinner than about 0.8 px, so he keeps his sticker edge on a small screen
 * (at 40 px a block and up the rig's own widths already clear it).
 */
let PXU = 1;
/** An outline `base` units wide, drawn at scale k, widened to stay visible. */
const ow = (base: number, k: number) => Math.max(base, (1.6 * PXU) / k);

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

// ── Colours ────────────────────────────────────────────────────────────────

/** Everything a frame needs to colour him and his ride, for one skin. */
interface Look {
  c: KiruColors;
  /** The tails' outline: lighter than the line when the band is dark. */
  tailLine: string;
  /** The vehicle's paper (the skin's band), its shade and its highlight. */
  paper: string;
  paperDark: string;
  paperLit: string;
  /** The vehicle's outline and ribs: moonlit when the paper is near-black. */
  paperLine: string;
  rib: string;
  /** Painted marks on the vehicle: a colour that reads on the paper. */
  mark: string;
  /** Bamboo, horns and trim. */
  trim: string;
  trimDark: string;
  /** The dragon's open mouth. */
  mouth: string;
  /** Smoke: outline, shade, light (the house smoke bomb, cel-shaded). */
  smokeLine: string;
  smokeShade: string;
  smokeLit: string;
  /** Shadow Step's smoke and eyes. */
  aura: string;
  auraEdge: string;
  glow: string;
  /**
   * Paint live instead of from sprites: the flash before a shatter lasts a
   * fraction of a second, not worth a hundred sprites per skin.
   */
  live: boolean;
}

interface SkinLooks {
  base: Look;
  shadow: Look;
  /** Whiter and whiter, for the flash before he shatters. */
  flash: Look[];
}

const FLASH_LEVELS = 6;

function rgb(hex: string): [number, number, number] {
  let h = hex.slice(1);
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function hex(r: number, g: number, b: number): string {
  const q = (v: number) => clamp(Math.round(v), 0, 255);
  return (
    '#' + ((1 << 24) | (q(r) << 16) | (q(g) << 8) | q(b)).toString(16).slice(1)
  );
}
function mix(a: string, b: string, t: number): string {
  const A = rgb(a);
  const B = rgb(b);
  return hex(lerp(A[0], B[0], t), lerp(A[1], B[1], t), lerp(A[2], B[2], t));
}
/** The band's own shade: darker and richer, the way the mascot's #e8432a → #bd3019. */
function deepen(c: string): string {
  const [r, g, b] = rgb(c);
  const k = (v: number) => v * (0.55 + (0.3 * v) / 255);
  return hex(k(r), k(g), k(b));
}
/** Relative luminance, 0..1. */
function luma(c: string): number {
  const [r, g, b] = rgb(c);
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.04 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function makeLook(band: string): Look {
  const L = luma(band);
  const dark = L < 0.03;
  const bandDark = dark ? mix(band, '#5a6294', 0.42) : deepen(band);
  const c: KiruColors = {
    ...KIRU_COLORS,
    band,
    bandDark,
    // Black on an indigo hood needs a sheen to read at all.
    bandHi: dark ? '#7d87c2' : undefined,
  };
  return {
    c,
    tailLine: dark ? '#6f7bbd' : KIRU_COLORS.line,
    paper: band,
    paperDark: bandDark,
    paperLit: dark ? '#7d87c2' : mix(band, '#ffffff', 0.38),
    paperLine: dark ? '#6f7bbd' : KIRU_COLORS.line,
    rib: dark ? '#5d6799' : bandDark,
    // Paper marks: ink on light paper, cream on dark or saturated paper.
    mark: L > 0.4 ? '#2a2f55' : '#fff4dc',
    trim: '#dcae4e',
    trimDark: '#9a6a37',
    mouth: '#5c1022',
    smokeLine: KIRU_COLORS.line,
    smokeShade: '#b9bfd4',
    smokeLit: '#f2f3f9',
    aura: '#1d1546',
    auraEdge: '#6a53e0',
    glow: '#9fe3ff',
    live: false,
  };
}

/** Shadow Step: the same ninja, steeped in night. His band keeps its colour. */
function shadowLook(base: Look): Look {
  const k = base.c;
  const night = '#120f2b';
  const c: KiruColors = {
    ...k,
    line: '#5b46c9',
    gi: '#18143a',
    giLit: '#231d52',
    giShade: '#0e0b25',
    skin: mix(k.skin, night, 0.62),
    skinShade: mix(k.skinShade, night, 0.66),
    steel: mix(k.steel, '#8f84d6', 0.35),
    steelEdge: '#5d55a0',
    wrap: mix(k.wrap, '#6f63c4', 0.55),
    wrapShade: '#4b4290',
    ink: '#07051a',
    rim: '#c9b5ff',
    collar: '#3a3478',
    cheek: mix(k.cheek, night, 0.7),
    saya: '#2a1638',
    hood: ['#2c2560', '#17133d', '#0b0922'],
    giGrad: ['#241e55', '#18143a', '#0e0b25'],
  };
  return { ...base, c, tailLine: '#5b46c9', trim: '#b9a0ff' };
}

/** Every colour of a look, pushed toward white by t. */
function whiten(L: Look, t: number): Look {
  const w = (s: string) => mix(s, '#ffffff', t);
  const k = L.c;
  const c: KiruColors = {
    line: w(k.line),
    gi: w(k.gi),
    giLit: w(k.giLit),
    giShade: w(k.giShade),
    skin: w(k.skin),
    skinShade: w(k.skinShade),
    band: w(k.band),
    bandDark: w(k.bandDark),
    bandHi: k.bandHi ? w(k.bandHi) : undefined,
    bolt: w(k.bolt),
    steel: w(k.steel),
    steelEdge: w(k.steelEdge),
    wrap: w(k.wrap),
    wrapShade: w(k.wrapShade),
    ink: w(k.ink),
    gold: w(k.gold),
    rim: w(k.rim),
    collar: w(k.collar),
    cheek: w(k.cheek),
    saya: w(k.saya),
    white: '#ffffff',
    hood: [w(k.hood[0]), w(k.hood[1]), w(k.hood[2])],
    giGrad: [w(k.giGrad[0]), w(k.giGrad[1]), w(k.giGrad[2])],
  };
  return {
    c,
    tailLine: w(L.tailLine),
    paper: w(L.paper),
    paperDark: w(L.paperDark),
    paperLit: w(L.paperLit),
    paperLine: w(L.paperLine),
    rib: w(L.rib),
    mark: w(L.mark),
    trim: w(L.trim),
    trimDark: w(L.trimDark),
    mouth: w(L.mouth),
    smokeLine: w(L.smokeLine),
    smokeShade: w(L.smokeShade),
    smokeLit: w(L.smokeLit),
    aura: w(L.aura),
    auraEdge: w(L.auraEdge),
    glow: w(L.glow),
    live: true,
  };
}

const skins = new Map<string, SkinLooks>();
function looksFor(band: string): SkinLooks {
  let s = skins.get(band);
  if (s) return s;
  // A colour picker could feed endless bands: keep the last few dozen.
  if (skins.size > 32) skins.clear();
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(band);
  const base = makeLook(valid ? band : KIRU_COLORS.band);
  const flash: Look[] = [];
  for (let i = 1; i <= FLASH_LEVELS; i++)
    flash.push(whiten(base, (i / FLASH_LEVELS) * 0.92));
  s = { base, shadow: shadowLook(base), flash };
  skins.set(band, s);
  return s;
}

// ── Shapes ─────────────────────────────────────────────────────────────────

interface Shapes {
  /** The kite's paper, frame and painted mon, centred on its middle. */
  kite: Path2D;
  kiteRibs: Path2D;
  kiteMon: Path2D;
  /** The wagasa (from the mascot's storm pose), its ferrule at 0,0. */
  canopy: Path2D;
  canopyRibs: Path2D;
  canopyBand: Path2D;
  /** The paper dragon's head, snout to +x. */
  dragonHead: Path2D;
  dragonJaw: Path2D;
  dragonMouth: Path2D;
  dragonTeeth: Path2D;
  dragonBrow: Path2D;
  dragonHorns: Path2D;
  dragonMane: Path2D;
  dragonFrill: Path2D;
  dragonBeard: Path2D;
  dragonRibs: Path2D;
  dragonNostril: Path2D;
  /** Kiru's tucked knees and shoes, for the roll. */
  knees: Path2D;
  shoes: Path2D;
  /** A four-point sparkle, unit size. */
  spark: Path2D;
}
let SH: Shapes | null = null;
function shapes(): Shapes {
  if (SH) return SH;
  SH = {
    // Seen from below at a slant: an Edo kite's 124 × 90 drawn 0.9 × 0.46.
    kite: new Path2D(
      'M-55.8 -18.4 Q0 -23 55.8 -18.4 Q59.4 0 54 18.4 Q0 22.1 -54 18.4 Q-59.4 0 -55.8 -18.4 Z'
    ),
    kiteRibs: new Path2D(
      'M-54 -17.9 L52.2 17.9 M54 -17.9 L-52.2 17.9 M-57.6 -0.9 Q0 1.8 57.6 -0.9 M0 -20.7 L0 20.2'
    ),
    kiteMon: new Path2D(
      'M23.4 0 A23.4 12 0 1 1 -23.4 0 A23.4 12 0 1 1 23.4 0 Z'
    ),
    canopy: new Path2D(
      'M-98 48 Q0 -48 98 48 Q84 39 70 50 Q56 40 42 51 Q28 41 14 52 Q0 42 -14 52 Q-28 41 -42 51 Q-56 40 -70 50 Q-84 39 -98 48 Z'
    ),
    canopyRibs: new Path2D(
      'M0 0 Q-70 26 -98 48 M0 0 Q-40 28 -70 50 M0 0 Q-18 30 -42 51 M0 0 Q-4 30 -14 52 M0 0 Q4 30 14 52 M0 0 Q18 30 42 51 M0 0 Q40 28 70 50 M0 0 Q70 26 98 48'
    ),
    canopyBand: new Path2D('M-70 26 Q0 -16 70 26'),
    dragonHead: new Path2D(
      'M-38 -2 C-40 -24 -24 -36 -4 -34 C10 -33 18 -26 26 -22 C36 -20 46 -18 48 -8 C50 0 44 4 36 4 L4 6 C-10 8 -20 14 -30 12 C-36 10 -38 6 -38 -2 Z'
    ),
    dragonJaw: new Path2D(
      'M0 9 L34 13 C42 14 42 21 34 23 C22 26 6 25 -4 20 C-10 17 -8 10 0 9 Z'
    ),
    dragonMouth: new Path2D('M0 5 L38 3 L36 14 L0 10 Z'),
    dragonTeeth: new Path2D(
      'M30 4 L33 11 L36 4 Z M15 5 L17.5 10 L20 5 Z M22 13 L24.5 8 L27 13 Z'
    ),
    dragonBrow: new Path2D(
      'M-24 -23 C-18 -35 2 -36 10 -24 C0 -29 -14 -29 -24 -23 Z'
    ),
    dragonHorns: new Path2D(
      'M-16 -30 C-20 -44 -28 -52 -42 -56 C-32 -48 -28 -40 -28 -27 Z M-25 -44 C-31 -50 -33 -58 -31 -65 C-27 -58 -23 -54 -20 -47 Z M-2 -32 C-4 -46 -10 -56 -22 -63 C-15 -52 -13 -44 -13 -31 Z'
    ),
    dragonMane: new Path2D(
      'M-30 -24 C-42 -30 -50 -26 -58 -30 C-52 -20 -48 -16 -42 -14 C-52 -10 -56 -2 -62 0 C-52 6 -44 4 -38 0 C-44 8 -46 16 -52 22 C-40 20 -32 12 -28 6 Z'
    ),
    dragonFrill: new Path2D(
      'M-22 10 C-28 18 -38 22 -46 20 C-38 16 -34 12 -32 6 Z'
    ),
    dragonBeard: new Path2D('M6 22 C4 30 -2 34 -10 36 C-6 30 -6 26 -6 20 Z'),
    dragonRibs: new Path2D(
      'M-2 -33 Q-6 -14 0 5 M14 -27 Q10 -10 16 5 M-20 -32 Q-24 -12 -18 10'
    ),
    dragonNostril: new Path2D('M37 -15 q4 -3 7 1'),
    knees: new Path2D(
      'M-30 18 C-34 34 -18 48 2 46 C20 44 34 34 30 18 C18 26 -18 26 -30 18 Z'
    ),
    shoes: new Path2D('M10 40 q0 -10 12 -10 h8 q6 0 6 6 v4 z'),
    spark: new Path2D(
      'M0 -1 L0.22 -0.22 L1 0 L0.22 0.22 L0 1 L-0.22 0.22 L-1 0 L-0.22 -0.22 Z'
    ),
  };
  return SH;
}

// ── The figure's pose, reused every frame ──────────────────────────────────

/** Eyes: on the road ahead, shocked, the mascot's resting look, lit from inside. */
const FOCUS = 0;
const HIT = 1;
const NORMAL = 2;
const GLOW = 3;

/**
 * How the rig is posed this frame. Angles follow Classic: a positive angle
 * swings a limb forward. Held hands go to fixed points (rig units) instead.
 */
const F = {
  legF: 0,
  legB: 0,
  lenF: 27,
  lenB: 27,
  armF: 0,
  armB: 0,
  /** Hands to fixed points: front (hfx, hfy), back (hbx, hby). */
  holdF: false,
  holdB: false,
  hfx: 0,
  hfy: 0,
  hbx: 0,
  hby: 0,
  /** Draw both fists again over the head (gripping something above). */
  fists: false,
  /** A parasol shaft, rig units, drawn over the gi and under the front hand. */
  shaft: false,
  sx0: 0,
  sy0: 0,
  sx1: 0,
  sy1: 0,
  /** Body bob (rig units); the legs stay planted. */
  dy: 0,
  tailAng: 0,
  tailAmp: 8,
  tailFreq: 16,
  mood: FOCUS,
  blink: false,
  /** The figure's size (1 in Run); sets how much its outline must widen. */
  k: 1,
};

function resetFigure(pose: KiruDashPose) {
  F.legF = 0;
  F.legB = 0;
  F.lenF = 27;
  F.lenB = 27;
  F.armF = 0;
  F.armB = 0;
  F.holdF = false;
  F.holdB = false;
  F.fists = false;
  F.shaft = false;
  F.dy = 0;
  F.tailAng = 0;
  F.tailAmp = 8;
  F.tailFreq = 16;
  F.mood = pose.dying > 0 ? HIT : FOCUS;
  F.blink = pose.blink && pose.dying <= 0;
  F.k = 1;
}

// ── Sprites: the parts that never change shape, baked once ─────────────────

/** Sprites are baked at twice the on-screen size, so they stay crisp when drawn moving and turning. */
const OVERSAMPLE = 2;
const HEAD = 0;
const TORSO = 1;
const KATANA = 2;
const KITE = 3;
const CANOPY_PART = 4;
const DRAGON_BACK = 5;
const DRAGON_FRONT = 6;
const BALL = 7;
const SMOKE = 8;
const PUFF_TALL = 9;
const PUFF_ROUND = 10;
/**
 * What each sprite's content spans (x0, y0, x1, y1) in its part's own units,
 * and how far its usual outline reaches past that. A bake adds the outline
 * it really has at that size (wider on a small screen) and two pixels.
 */
const SPAN: readonly (readonly [number, number, number, number, number])[] = [
  [26, 24, 182, 156, 3], // HEAD, rig units: hood and knot
  [64, 143, 136, 209, 3], // TORSO: gi and the obi's bow
  [25, 108, 165, 232, 0], // KATANA: the hilt and the scabbard's tip
  [-60, -23, 60, 23, 3], // KITE, about its middle
  [-98, -7, 98, 52, 4], // CANOPY_PART, about its ferrule
  [-62, -65, 0, 22, 2.5], // DRAGON_BACK: horns and mane
  [-48, -36, 50, 36, 3], // DRAGON_FRONT: the head
  [-58, -58, 58, 58, 3], // BALL, about its centre
  [-177, -130, 13, 64, 0], // SMOKE, about the hitbox centre
  [-112, -168, 112, 168, 0], // PUFF_TALL
  [-142, -132, 142, 132, 0], // PUFF_ROUND
];

interface Sprite {
  cv: HTMLCanvasElement;
  /** The region it covers, in its part's units. */
  x: number;
  y: number;
  w: number;
  h: number;
}
const CAN_BAKE = typeof document !== 'undefined';
const sprites = new Map<Look, Map<number, Sprite>>();
let spriteCount = 0;
/** Sprite resolutions step by 12%: a resize rebakes only when it matters. */
const BUCKET = Math.log(1.12);

/**
 * Draw one static part from its sprite, at local scale k (its units are drawn
 * k / PXU canvas pixels each). Baked on first use for each look, variant and
 * resolution.
 */
function drawPart(
  ctx: CanvasRenderingContext2D,
  kind: number,
  L: Look,
  variant: number,
  k: number
) {
  // Soft smoke needs no extra resolution; everything else is baked at 2×.
  const want = (k / PXU) * (kind >= SMOKE ? 1 : OVERSAMPLE);
  if (!CAN_BAKE || L.live) {
    // A flash frame, or no document to make canvases in (a worker): paint
    // straight onto the frame.
    paint(ctx, kind, L, variant, want);
    return;
  }
  const b = clamp(Math.ceil(Math.log(want) / BUCKET) + 40, 0, 63);
  const key = (kind * 8 + variant) * 64 + b;
  let m = sprites.get(L);
  if (!m) {
    m = new Map();
    sprites.set(L, m);
  }
  let sp = m.get(key);
  if (!sp) {
    if (spriteCount > 240) {
      // A long session of resizes: start over rather than hoard canvases.
      sprites.clear();
      spriteCount = 0;
      m = new Map();
      sprites.set(L, m);
    }
    sp = bake(kind, L, variant, Math.exp((b - 40) * BUCKET));
    m.set(key, sp);
    spriteCount++;
  }
  ctx.drawImage(sp.cv, sp.x, sp.y, sp.w, sp.h);
}

function bake(kind: number, L: Look, variant: number, dens: number): Sprite {
  const [x0, y0, x1, y1, edge] = SPAN[kind];
  const os = kind >= SMOKE ? 1 : OVERSAMPLE;
  // The outline as drawn at this size, plus two pixels for anti-aliasing.
  const m = Math.max(edge, (0.8 * os) / dens) + 2 / dens;
  const x = x0 - m;
  const y = y0 - m;
  const w = x1 - x0 + 2 * m;
  const h = y1 - y0 + 2 * m;
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.ceil(w * dens));
  cv.height = Math.max(1, Math.ceil(h * dens));
  const sp = { cv, x, y, w, h };
  const c = cv.getContext('2d');
  if (!c) return sp;
  c.scale(cv.width / w, cv.height / h);
  c.translate(-x, -y);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  paint(c, kind, L, variant, dens);
  return sp;
}

/** Paint a static part in its own units; `dens` is the pixels per unit it will show at (× OVERSAMPLE). */
function paint(
  c: CanvasRenderingContext2D,
  kind: number,
  L: Look,
  variant: number,
  dens: number
) {
  // The thinnest outline that still shows at the size it will be drawn.
  const minW = (1.6 * OVERSAMPLE) / dens;
  const S = shapes();
  const k = L.c;
  switch (kind) {
    case HEAD:
      bakeHead(c, L, variant >> 1, (variant & 1) === 1, minW);
      break;
    case TORSO: {
      const P = kiruPaths();
      if (minW > 6) {
        c.strokeStyle = k.line;
        c.lineWidth = minW;
        c.stroke(P.torso);
      }
      kiruTorso(c, k, kiruGradients(c, k).gi);
      break;
    }
    case KATANA:
      kiruScabbard(c, k);
      kiruHilt(c, k);
      break;
    case KITE:
      kiruSticker(c, S.kite, L.paper, Math.max(6, minW), L.paperLine);
      c.globalAlpha = 0.55;
      c.strokeStyle = L.rib;
      c.lineWidth = 2;
      c.stroke(S.kiteRibs);
      c.globalAlpha = 1;
      c.fillStyle = L.mark;
      c.fill(S.kiteMon);
      c.save();
      c.scale(2.25, 1.15);
      c.translate(-100.5, -53.5);
      c.fillStyle = L.paper;
      c.fill(kiruPaths().bolt);
      c.restore();
      break;
    case CANOPY_PART:
      kiruSticker(c, S.canopy, L.paper, Math.max(8, minW), L.paperLine);
      c.globalAlpha = 0.85;
      c.strokeStyle = L.rib;
      c.lineWidth = 2.6;
      c.stroke(S.canopyRibs);
      c.globalAlpha = 0.8;
      c.strokeStyle = L.paperLit;
      c.lineWidth = 5;
      c.stroke(S.canopyBand);
      c.globalAlpha = 1;
      c.beginPath();
      c.arc(0, 0, 7, 0, TAU);
      c.fillStyle = k.ink;
      c.fill();
      break;
    case DRAGON_BACK:
      kiruSticker(c, S.dragonHorns, L.trim, Math.max(5, minW), L.paperLine);
      kiruSticker(c, S.dragonMane, L.paperDark, Math.max(5, minW), L.paperLine);
      break;
    case DRAGON_FRONT:
      bakeDragonFront(c, L, minW);
      break;
    case BALL:
      bakeBall(c, L, variant >> 1, (variant & 1) === 1, minW, dens);
      break;
    case SMOKE:
      // Baked at 1×, this rim comes out about 1.6 px: firm on a small screen.
      smokeAt(c, L, (variant / SMOKE_FRAMES) * SMOKE_T, Math.max(5, minW / 2));
      break;
    case PUFF_TALL:
    case PUFF_ROUND: {
      const tall = kind === PUFF_TALL;
      puffAt(
        c,
        L,
        (variant + 0.5) / PUFF_FRAMES,
        (tall ? 0.5 : 0.62) * U,
        (tall ? 0.85 : 0.55) * U,
        Math.max(6, 1 / dens)
      );
      break;
    }
  }
}

/** The head: hood, band, plate, face and eyes, with its outline widened if small. */
function bakeHead(
  c: CanvasRenderingContext2D,
  L: Look,
  mood: number,
  blink: boolean,
  minW: number
) {
  if (minW > 6) {
    c.strokeStyle = L.c.line;
    c.lineWidth = minW;
    c.stroke(kiruPaths().hood);
  }
  kiruHood(c, L.c, kiruGradients(c, L.c).hood);
  eyes(c, L, mood, blink);
}

function bakeDragonFront(c: CanvasRenderingContext2D, L: Look, minW: number) {
  const S = shapes();
  const k = L.c;
  // Under about 26 px a block the fine work (ribs, beard, nostril) is mud.
  const fine = minW < 8;
  const line = L.paperLine;
  if (fine) kiruSticker(c, S.dragonBeard, L.trim, 4, line);
  kiruSticker(c, S.dragonJaw, L.paperDark, Math.max(5, minW), line);
  c.fillStyle = L.mouth;
  c.fill(S.dragonMouth);
  c.fillStyle = '#ffffff';
  c.fill(S.dragonTeeth);
  kiruSticker(c, S.dragonHead, L.paper, Math.max(6, minW), line);
  if (fine) {
    c.globalAlpha = 0.4;
    c.strokeStyle = L.rib;
    c.lineWidth = 2.4;
    c.stroke(S.dragonRibs);
    c.globalAlpha = 1;
  }
  kiruSticker(c, S.dragonFrill, L.trim, 4, line);
  kiruSticker(c, S.dragonBrow, L.trim, 3, line);
  // The big eye, looking where it flies.
  c.beginPath();
  c.arc(-6, -14, 12.5, 0, TAU);
  c.fillStyle = k.line;
  c.fill();
  c.beginPath();
  c.arc(-6, -14, 10, 0, TAU);
  c.fillStyle = '#ffffff';
  c.fill();
  c.beginPath();
  c.arc(-3, -13.5, 6.5, 0, TAU);
  c.fillStyle = k.ink;
  c.fill();
  c.beginPath();
  c.arc(-1, -16.5, 2.4, 0, TAU);
  c.fillStyle = '#ffffff';
  c.fill();
  if (fine) {
    c.strokeStyle = k.ink;
    c.lineWidth = 2.6;
    c.stroke(S.dragonNostril);
  }
}

/** Kiru curled up: his back in the gi, the obi, knees and fists, the hood on top. */
function bakeBall(
  c: CanvasRenderingContext2D,
  L: Look,
  mood: number,
  blink: boolean,
  minW: number,
  dens: number
) {
  const S = shapes();
  const k = L.c;
  c.beginPath();
  c.arc(0, 0, BALL_R, 0, TAU);
  c.strokeStyle = k.line;
  c.lineWidth = Math.max(6, minW);
  c.stroke();
  c.fillStyle = k.giShade;
  c.fill();
  c.beginPath();
  c.arc(0, 0, BALL_R - 10, Math.PI * 0.55, Math.PI * 1.12);
  c.strokeStyle = k.band;
  c.lineWidth = 12;
  c.stroke();
  kiruSticker(c, S.knees, k.gi, 4, k.line);
  kiruSticker(c, S.shoes, k.ink, 4, k.line);
  c.save();
  c.scale(-1, 1);
  kiruSticker(c, S.shoes, k.ink, 4, k.line);
  c.restore();
  fist(c, k, -16, 30);
  fist(c, k, 18, 30);
  c.save();
  c.translate(6, -16);
  c.scale(-BALL_HEAD, BALL_HEAD);
  c.translate(-100, -90);
  bakeHead(c, L, mood, blink, (1.6 * OVERSAMPLE) / (dens * BALL_HEAD));
  c.restore();
}

// ── The figure ─────────────────────────────────────────────────────────────

/** Arm to a held point: the sleeve bows to one side like Classic's swing. */
function armTo(
  ctx: CanvasRenderingContext2D,
  c: KiruColors,
  sx: number,
  sy: number,
  hx: number,
  hy: number,
  lit: boolean,
  bow: number
) {
  const dx = hx - sx;
  const dy = hy - sy;
  kiruArm(
    ctx,
    c,
    sx,
    sy,
    dx * 0.5 - dy * bow,
    dy * 0.5 + dx * bow,
    dx,
    dy,
    lit,
    true
  );
}

/** Classic's arm, (±14, 10) and (±24, 25) from the shoulder, swung by a. */
function swingArm(
  ctx: CanvasRenderingContext2D,
  c: KiruColors,
  sx: number,
  sy: number,
  side: number,
  a: number,
  lit: boolean
) {
  const co = Math.cos(a);
  const si = Math.sin(a);
  const cx = side * 14;
  const hx = side * 24;
  kiruArm(
    ctx,
    c,
    sx,
    sy,
    cx * co - 10 * si,
    cx * si + 10 * co,
    hx * co - 25 * si,
    hx * si + 25 * co,
    lit,
    true
  );
}

/** A wrapped fist, as kiruArm's fast path ends: a disc on its outline. */
function fist(
  ctx: CanvasRenderingContext2D,
  c: KiruColors,
  x: number,
  y: number
) {
  ctx.beginPath();
  ctx.arc(x, y, 11.5, 0, TAU);
  ctx.fillStyle = c.line;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 9.5, 0, TAU);
  ctx.fillStyle = c.wrap;
  ctx.fill();
}

/** Glowing eyes for Shadow Step: lit from inside, no pupils, brows set. */
function glowEyes(ctx: CanvasRenderingContext2D, L: Look, blink: boolean) {
  if (blink) {
    ctx.beginPath();
    ctx.moveTo(64, 97);
    ctx.quadraticCurveTo(76, 101, 88, 97);
    ctx.moveTo(112, 97);
    ctx.quadraticCurveTo(124, 101, 136, 97);
    ctx.strokeStyle = L.glow;
    ctx.lineWidth = 5;
    ctx.stroke();
  } else {
    ctx.fillStyle = L.glow;
    for (let i = 0; i < 2; i++) {
      ctx.globalAlpha = i === 0 ? 0.22 : 0.4;
      const r = i === 0 ? 21 : 16;
      ctx.beginPath();
      ctx.ellipse(76, 97, r, r * 0.82, 0, 0, TAU);
      ctx.moveTo(124 + r, 97);
      ctx.ellipse(124, 97, r, r * 0.82, 0, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Almond eyes, narrowed at the inner corner: determined, not scary.
    ctx.beginPath();
    ctx.moveTo(63, 94);
    ctx.quadraticCurveTo(76, 86, 89, 99);
    ctx.quadraticCurveTo(74, 106, 63, 94);
    ctx.moveTo(137, 94);
    ctx.quadraticCurveTo(124, 86, 111, 99);
    ctx.quadraticCurveTo(126, 106, 137, 94);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(77, 96.5, 6, 3.4, 0.25, 0, TAU);
    ctx.moveTo(129, 96.5);
    ctx.ellipse(123, 96.5, 6, 3.4, -0.25, 0, TAU);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.lineTo(89, 89);
  ctx.moveTo(111, 89);
  ctx.lineTo(140, 80);
  ctx.strokeStyle = L.c.ink;
  ctx.lineWidth = 5;
  ctx.stroke();
}

function eyes(
  ctx: CanvasRenderingContext2D,
  L: Look,
  mood: number,
  blink: boolean
) {
  if (mood === GLOW) glowEyes(ctx, L, blink);
  else
    kiruEyes(
      ctx,
      L.c,
      mood === HIT ? 'hit' : mood === NORMAL ? 'normal' : 'focus',
      blink,
      mood === NORMAL ? -2 : -3.5
    );
}

/** The parasol's shaft and its hooked handle, between the gi and his hand. */
function drawShaft(ctx: CanvasRenderingContext2D, L: Look) {
  ctx.beginPath();
  ctx.moveTo(F.sx0, F.sy0);
  ctx.lineTo(F.sx1, F.sy1);
  ctx.quadraticCurveTo(F.sx1 + 2, F.sy1 + 12, F.sx1 - 8, F.sy1 + 12);
  ctx.strokeStyle = L.c.line;
  ctx.lineWidth = ow(9, F.k);
  ctx.stroke();
  ctx.strokeStyle = L.trimDark;
  ctx.lineWidth = 4.5;
  ctx.stroke();
}

/** The whole rig in its own units (the caller has mirrored it to face +x). */
function drawFigure(ctx: CanvasRenderingContext2D, L: Look, t: number) {
  const c = L.c;
  const a = F.tailAng;
  ctx.save();
  ctx.translate(0, F.dy);
  kiruTail(
    ctx,
    L.tailLine,
    166,
    74,
    a + 0.26,
    86,
    9,
    F.tailAmp,
    t,
    F.tailFreq,
    1.9,
    c.bandDark,
    true
  );
  kiruTail(
    ctx,
    L.tailLine,
    166,
    66,
    a,
    92,
    10,
    F.tailAmp,
    t,
    F.tailFreq * 1.08,
    0,
    c.band,
    true
  );
  drawPart(ctx, KATANA, L, 0, F.k);
  if (F.holdB) armTo(ctx, c, 127, 156, F.hbx, F.hby, false, -0.3);
  else swingArm(ctx, c, 127, 156, 1, F.armB, false);
  ctx.restore();
  kiruLeg(ctx, c, 110, 196 + F.dy, F.legB, F.lenB, c.giShade);
  kiruLeg(ctx, c, 90, 196 + F.dy, F.legF, F.lenF, c.gi);
  ctx.save();
  ctx.translate(0, F.dy);
  drawPart(ctx, TORSO, L, 0, F.k);
  if (F.shaft) drawShaft(ctx, L);
  if (F.holdF) armTo(ctx, c, 73, 156, F.hfx, F.hfy, true, 0.3);
  else swingArm(ctx, c, 73, 156, -1, F.armF, true);
  drawPart(ctx, HEAD, L, F.mood * 2 + (F.blink ? 1 : 0), F.k);
  if (F.fists) {
    fist(ctx, c, F.hfx, F.hfy + 2);
    fist(ctx, c, F.hbx, F.hby + 2);
  }
  ctx.restore();
}

/** Mirror the rig to face +x and put rig point (100, cy) at the origin, at size k. */
function rig(ctx: CanvasRenderingContext2D, k: number, cy: number) {
  ctx.scale(-k, k);
  ctx.translate(-100, -cy);
}

/** The shocked pose: limbs flung out, eyes wide, tails whipping. */
function poseHit(t: number) {
  const flail = Math.sin(t * 22) * 0.18;
  F.legF = 0.55 + flail;
  F.legB = -0.6 - flail;
  F.lenF = 26;
  F.lenB = 26;
  F.armF = 2.5 + flail;
  F.armB = -2.5 - flail;
  F.holdF = false;
  F.holdB = false;
  F.fists = false;
  F.mood = HIT;
  F.tailAng = Math.sin(t * 9) * 0.5;
  F.tailAmp = 14;
}

// ── Run (and Shadow Step's body) ───────────────────────────────────────────

/** A forward flip lasts this long (s), from the take-off. */
const FLIP_T = 0.42;

/**
 * How far through a forward flip he is (0..1), or -1 for none. A flip
 * answers a drum or a spirit lantern: the renderer says so with
 * pose.boosted; without it the take-off speed (rebuilt from the speed now
 * and the time since, under Run gravity) has to beat an ordinary jump's.
 */
function flipProgress(pose: KiruDashPose, vl: number): number {
  if (pose.grounded || pose.jumpT >= FLIP_T || pose.dying > 0) return -1;
  const boosted = pose.boosted ?? vl + G * pose.jumpT > JUMP_V * 1.1;
  return boosted ? pose.jumpT / FLIP_T : -1;
}

function poseRun(pose: KiruDashPose, vl: number) {
  const s = Math.sin(pose.runPhase);
  const co = Math.cos(pose.runPhase);
  const air = clamp(pose.air, 0, 1);
  // 0 while rising, 1 once falling: continuous through the apex.
  const fall = smooth(clamp(0.5 - vl / 16, 0, 1));
  const flail = Math.sin(pose.t * 22) * 0.16;
  const liftF = 7 * Math.max(0, co);
  const liftB = 7 * Math.max(0, -co);
  // Classic's stride on the ground; in the air a tuck (front knee up) that
  // opens into the reach for the landing.
  F.legF = lerp(s * 0.62, lerp(1.1, 0.3, fall), air);
  F.legB = lerp(-s * 0.62, lerp(-0.45, -0.1, fall), air);
  F.lenF = lerp(27 - liftF, lerp(15, 26, fall), air);
  F.lenB = lerp(27 - liftB, lerp(19, 27, fall), air);
  F.armF = lerp(-s * 0.95, lerp(1.3, 2.25 + flail, fall), air);
  F.armB = lerp(s * 0.95, lerp(-0.95, -2.1 - flail, fall), air);
  // The hips sit wherever the lower foot touches the roof (Classic's bob).
  const depth = Math.max(F.lenF * Math.cos(F.legF), F.lenB * Math.cos(F.legB));
  F.dy = lerp(231 - 8 - depth - 196, 0, air);
  const vn = clamp(vl / 22, -1, 1);
  F.tailAng = vn > 0 ? vn * 0.5 : vn * 0.8;
  F.tailAmp = 9;
  F.tailFreq = 19;
}

/** The tuck of a flip: knees to his chest, fists tucked in. */
function poseFlip() {
  F.legF = 1.25;
  F.legB = 0.55;
  F.lenF = 15;
  F.lenB = 16;
  F.armF = 1.7;
  F.armB = 1.0;
  F.dy = 0;
  F.tailAng = -0.3;
  F.tailAmp = 12;
}

/** Run and Shadow Step: the full-size ninja on his feet. */
function drawRunner(
  ctx: CanvasRenderingContext2D,
  L: Look,
  pose: KiruDashPose,
  vl: number
) {
  poseRun(pose, vl);
  const flip = flipProgress(pose, vl);
  if (flip >= 0) poseFlip();
  if (pose.dying > 0) poseHit(pose.t);

  ctx.save();
  if (flip >= 0) {
    // A fast forward flip about his middle, easing out as he opens up.
    const e = 1 - Math.pow(1 - flip, 2.4);
    ctx.translate(0, -12);
    ctx.rotate(TAU * e);
    ctx.translate(0, 12);
  } else if (pose.dying > 0) {
    ctx.rotate(-0.25 * smooth(clamp(pose.dying * 2, 0, 1)));
  } else {
    // Lean into the run; ease upright in the air.
    ctx.rotate(
      lerp(0.1, clamp(-vl * 0.004, -0.08, 0.1), clamp(pose.air, 0, 1))
    );
  }
  // Squash on landing, stretch on take-off, both about his feet.
  let sx = 1;
  let sy = 1;
  if (pose.grounded && pose.air > 0.01 && pose.dying <= 0) {
    const k = clamp(pose.air, 0, 1);
    sx = 1 + 0.2 * k;
    sy = 1 - 0.2 * k;
  } else if (!pose.grounded && pose.jumpT < 0.12 && vl > 0 && flip < 0) {
    const k = 1 - pose.jumpT / 0.12;
    sx = 1 - 0.1 * k;
    sy = 1 + 0.14 * k;
  }
  if (sx !== 1) {
    const feet = 232 - RUN_CY;
    ctx.translate(0, feet);
    ctx.scale(sx, sy);
    ctx.translate(0, -feet);
  }
  rig(ctx, 1, RUN_CY);
  drawFigure(ctx, L, pose.t);
  ctx.restore();
}

// ── Shadow Step ────────────────────────────────────────────────────────────

// Smoke streaming off him in two plumes, one from his hood and one from his
// back: where each starts (from the hitbox centre), its puff radius, how far
// it rises, and its phase. Fixed numbers: the smoke is the same every attempt.
const PLUMES = [-30, -60, 38, 22, 0, -22, 26, 28, 10, 0.5];
const PUFFS_PER_PLUME = 9;
const SMOKE_RATE = 1.6;
/**
 * The puffs flow along fixed wavy paths, so the smoke repeats itself exactly
 * every 1 / (puffs × rate) seconds: eight baked frames cover the loop.
 */
const SMOKE_T = 1 / (PUFFS_PER_PLUME * SMOKE_RATE);
const SMOKE_FRAMES = 8;

/**
 * Ink smoke trailing behind him like a cape: puffs flow back along each plume,
 * shrinking as they go. Drawn twice, the violet edge a little larger than
 * the ink, so the puffs merge into one cloud with a lit rim (the smoke
 * bomb's trick, in negative).
 */
function smokeAt(
  ctx: CanvasRenderingContext2D,
  L: Look,
  t: number,
  edge: number
) {
  for (let pass = 0; pass < 2; pass++) {
    ctx.fillStyle = pass === 0 ? L.auraEdge : L.aura;
    ctx.beginPath();
    for (let j = 0; j < PLUMES.length; j += 5) {
      for (let i = 0; i < PUFFS_PER_PLUME; i++) {
        const u = (i / PUFFS_PER_PLUME + t * SMOKE_RATE + PLUMES[j + 4]) % 1;
        const x = PLUMES[j] - u * 104;
        const y =
          PLUMES[j + 1] - u * PLUMES[j + 3] + Math.sin(u * 11 + j) * 5 * u;
        const r =
          PLUMES[j + 2] * Math.pow(1 - u, 0.6) + (pass === 0 ? edge : 0);
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, TAU);
      }
    }
    ctx.fill();
  }
}

function drawSmoke(ctx: CanvasRenderingContext2D, L: Look, t: number) {
  const u = (((t % SMOKE_T) + SMOKE_T) % SMOKE_T) / SMOKE_T;
  drawPart(ctx, SMOKE, L, Math.floor(u * SMOKE_FRAMES) % SMOKE_FRAMES, 1);
}

// Ink blots that bloom to reveal him after a teleport: x, y (rig units from
// the hitbox centre), full radius, delay (0..1 of the bloom).
const INK = [
  0, -60, 62, 0, -6, 30, 50, 0.1, 30, -20, 40, 0.2, -36, -10, 44, 0.15, 10, 80,
  36, 0.3, -20, 60, 34, 0.25, 50, -80, 30, 0.35, -50, -88, 32, 0.4,
];

function inkClip(ctx: CanvasRenderingContext2D, q: number) {
  ctx.beginPath();
  for (let i = 0; i < INK.length; i += 4) {
    const k = clamp((q - INK[i + 3]) / (1 - INK[i + 3]), 0, 1);
    if (k <= 0) continue;
    const r = INK[i + 2] * 1.25 * Math.sqrt(k);
    ctx.moveTo(INK[i] + r, INK[i + 1]);
    ctx.arc(INK[i], INK[i + 1], r, 0, TAU);
  }
  ctx.clip();
}

function inkSplats(ctx: CanvasRenderingContext2D, L: Look, q: number) {
  // Droplets thrown out by the bloom, shrinking as he solidifies: one pass
  // in the smoke's violet, which reads on every night sky.
  ctx.fillStyle = L.auraEdge;
  ctx.beginPath();
  for (let i = 0; i < INK.length; i += 4) {
    const a = i * 0.9 + 0.4;
    const d = 40 + q * 70 + INK[i + 2] * 0.5;
    const r = (1 - q) * (7 + INK[i + 2] * 0.13);
    const x = INK[i] * 0.4 + Math.cos(a) * d;
    const y = INK[i + 1] * 0.5 + Math.sin(a) * d;
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, TAU);
  }
  ctx.fill();
}

/**
 * Seconds since a Shadow Step teleport, or Infinity. A teleport is the one
 * launch that flips gravity in the same step and leaves him standing still
 * (vy exactly 0); a blue or green lantern flips him too, but pushes him.
 */
function sinceTeleport(pose: KiruDashPose, vl: number): number {
  return pose.mode === 'shadow' &&
    Math.abs(pose.flipT - pose.jumpT) < 0.004 &&
    Math.abs(vl) < 1e-6
    ? pose.jumpT
    : Infinity;
}

function drawShadow(
  ctx: CanvasRenderingContext2D,
  L: Look,
  pose: KiruDashPose,
  vl: number
) {
  const q = pose.dying > 0 ? 1 : clamp(sinceTeleport(pose, vl) / INK_IN, 0, 1);
  if (q < 1) inkSplats(ctx, L, q);
  else if (pose.dying <= 0) drawSmoke(ctx, L, pose.t);
  if (q < 1) {
    ctx.save();
    inkClip(ctx, q);
  }
  F.mood = pose.dying > 0 ? HIT : GLOW;
  drawRunner(ctx, L, pose, vl);
  if (q < 1) ctx.restore();
}

// ── Kite ───────────────────────────────────────────────────────────────────

const KITE_K = 0.4;

function drawKite(
  ctx: CanvasRenderingContext2D,
  L: Look,
  pose: KiruDashPose,
  vl: number
) {
  const t = pose.t;
  // Nose up as he climbs (the physics' flight angle, softened), and a
  // little more while the button is held.
  const pitch = clamp(
    pose.rot * pose.grav * 0.75 + (pose.held ? 0.08 : -0.04),
    -0.5,
    0.5
  );
  const bob = Math.sin(t * 5.2) * 1.5;
  const kx = -2;
  const ky = -38 + bob;
  const ca = Math.cos(-pitch);
  const sa = Math.sin(-pitch);
  // The ribbon tail from the trailing corner, streaming behind.
  const cx = -52;
  const cy = 17.5;
  kiruTail(
    ctx,
    L.tailLine,
    kx + cx * ca - cy * sa,
    ky + cx * sa + cy * ca,
    Math.PI - 0.2 - pitch * 0.5,
    96,
    10,
    10,
    t,
    13,
    0.6,
    L.paper,
    true
  );

  // The kite, behind him: an Edo dako bowed by the wind, the bolt painted on.
  ctx.save();
  ctx.translate(kx, ky);
  ctx.rotate(-pitch);
  drawPart(ctx, KITE, L, 0, 1);
  ctx.restore();

  // Kiru, hanging from the bridle: swung back by the wind, legs trailing.
  const ax = 4;
  const ay = 16 + bob * 0.4;
  const swing = 0.18 + pitch * 0.3 + Math.sin(t * 3.1) * 0.04;
  F.holdF = true;
  F.holdB = true;
  F.fists = true;
  F.hfx = 40;
  F.hfy = 122;
  F.hbx = 160;
  F.hby = 122;
  const kick = Math.sin(t * 7);
  F.legF = -0.3 + kick * 0.16;
  F.legB = -0.7 - kick * 0.16;
  F.lenF = 25;
  F.lenB = 26;
  F.tailAng = -0.1 + clamp(vl / 20, -1, 1) * 0.3;
  F.tailAmp = 10;
  F.tailFreq = 21;
  F.k = KITE_K;
  if (pose.dying > 0) poseHit(t);
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(swing);
  rig(ctx, KITE_K, 128);
  drawFigure(ctx, L, t);
  ctx.restore();

  if (pose.dying <= 0) {
    // The bridle cords, from the kite to his fists.
    const cs = Math.cos(swing);
    const sn = Math.sin(swing);
    const fx = -(F.hfx - 100) * KITE_K;
    const bx = -(F.hbx - 100) * KITE_K;
    const fy = (F.hfy - 126) * KITE_K;
    const ux = 25;
    const uy = 18.4;
    ctx.beginPath();
    ctx.moveTo(kx + ux * ca - uy * sa, ky + ux * sa + uy * ca);
    ctx.lineTo(ax + fx * cs - fy * sn, ay + fx * sn + fy * cs);
    ctx.moveTo(kx - ux * ca - uy * sa, ky - ux * sa + uy * ca);
    ctx.lineTo(ax + bx * cs - fy * sn, ay + bx * sn + fy * cs);
    ctx.strokeStyle = L.c.wrap;
    ctx.lineWidth = ow(2.4, 2);
    ctx.stroke();
  }
}

// ── Roll ───────────────────────────────────────────────────────────────────

const BALL_R = 58;
/** The hood's size inside the ball. */
const BALL_HEAD = 0.6;

function drawRoll(
  ctx: CanvasRenderingContext2D,
  L: Look,
  pose: KiruDashPose,
  vl: number
) {
  const c = L.c;
  const t = pose.t;
  // pose.rot is the physics' spin, counter-clockwise positive in the world
  // (y up); in this y-down frame that is clockwise, and mirrored again when
  // upside down.
  const spin = -pose.rot * pose.grav;

  // Tails stream straight back from behind the ball, whatever its spin.
  const lift = clamp(vl / 20, -1, 1) * 0.35;
  kiruTail(
    ctx,
    L.tailLine,
    -18,
    -18,
    Math.PI + 0.22 + lift,
    92,
    9,
    9,
    t,
    20,
    1.9,
    c.bandDark,
    true
  );
  kiruTail(
    ctx,
    L.tailLine,
    -18,
    -26,
    Math.PI + 0.02 + lift,
    100,
    10,
    9,
    t,
    21,
    0,
    c.band,
    true
  );

  // Speed swooshes behind the ball.
  ctx.strokeStyle = c.rim;
  ctx.lineWidth = ow(4, 2);
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.arc(0, 0, BALL_R + 12, Math.PI * 0.62, Math.PI * 0.95);
  ctx.moveTo(
    Math.cos(Math.PI * 1.08) * (BALL_R + 12),
    Math.sin(Math.PI * 1.08) * (BALL_R + 12)
  );
  ctx.arc(0, 0, BALL_R + 12, Math.PI * 1.08, Math.PI * 1.38);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.save();
  // Squash a touch when he lands on a new surface.
  if (pose.grounded && pose.air > 0.01) {
    const k = clamp(pose.air, 0, 1) * 0.14;
    ctx.translate(0, BALL_R);
    ctx.scale(1 + k, 1 - k);
    ctx.translate(0, -BALL_R);
  }
  ctx.rotate(spin);
  drawPart(ctx, BALL, L, F.mood * 2 + (F.blink ? 1 : 0), 1);
  ctx.restore();
}

// ── Parasol ────────────────────────────────────────────────────────────────

const PARA_K = 0.46;
const CANOPY = 0.7;

function drawParasol(
  ctx: CanvasRenderingContext2D,
  L: Look,
  pose: KiruDashPose,
  vl: number
) {
  const t = pose.t;
  // A hop pumps the canopy: it snaps shut a little, then springs open.
  const pq = clamp(pose.jumpT / 0.3, 0, 1);
  const pump = pose.jumpT < 0.3 ? Math.sin(pq * Math.PI) * (1 - pq * 0.5) : 0;
  const floating = vl < 0 && pump === 0;
  // The physics' sway (rot), plus a lazy drift while he floats.
  const sway =
    -pose.rot * pose.grav + Math.sin(t * 2.3) * (floating ? 0.08 : 0.03);
  // Where Kiru hangs and where the ferrule (top of the shaft) is.
  const ay = 14 - pump * 5;
  const top = -66 + pump * 4;

  ctx.save();
  ctx.rotate(sway);
  // The shaft runs behind his head and over his gi, and his front hand grips
  // it, as in the mascot's storm pose.
  F.holdF = true;
  F.hfx = 104;
  F.hfy = 160;
  F.shaft = true;
  F.sx0 = 100;
  F.sy0 = 128 + (top - ay) / PARA_K;
  F.sx1 = 105;
  F.sy1 = 188;
  if (pump > 0) {
    // A kick on every hop.
    F.legF = 0.85 * pump;
    F.legB = -0.75 * pump;
    F.lenF = 21;
    F.lenB = 26;
  } else {
    // Floating: legs dangle and paddle lazily.
    const w = Math.sin(t * 3);
    F.legF = 0.14 + w * 0.12;
    F.legB = -0.1 - w * 0.12;
  }
  F.armB = floating ? -0.5 + Math.sin(t * 2.3) * 0.15 : -0.2;
  F.tailAng = floating ? -0.85 : 0.25;
  F.tailAmp = floating ? 6 : 9;
  F.tailFreq = floating ? 7 : 15;
  F.mood = floating ? NORMAL : FOCUS;
  F.k = PARA_K;
  if (pose.dying > 0) {
    poseHit(t);
    F.shaft = true;
  }
  ctx.save();
  ctx.translate(0, ay);
  rig(ctx, PARA_K, 128);
  drawFigure(ctx, L, t);
  ctx.restore();

  // The canopy, over everything.
  ctx.translate(0, top);
  ctx.scale(CANOPY * (1 - pump * 0.2), CANOPY * (1 + pump * 0.3));
  drawPart(ctx, CANOPY_PART, L, 0, CANOPY);
  ctx.restore();
}

// ── Dragon ─────────────────────────────────────────────────────────────────

/** The dragon's head sits here (rig units from the hitbox centre, before the heading). */
const DH_X = 22;
const DH_Y = 4;
/** Kiru sits on its neck, behind the mane, at this size. */
const DK_X = -32;
const DK_Y = -2;
const DRAGON_K = 0.34;
/** Where the renderer's ribbon body joins the head (rig units, before the heading). */
const NECK_X = -22;
const NECK_Y = 14;

/** The dragon's heading this frame, radians in the mode frame (y down). */
function dragonHeading(pose: KiruDashPose): number {
  // The physics' flight angle: ±45° on the zigzag, level while sliding.
  return -clamp(pose.rot, -1, 1) * pose.grav;
}

/**
 * Where the dragon's neck is this frame, in blocks from Kiru's hitbox centre,
 * in the same y-down space as drawKiruDash: the renderer starts the ribbon
 * body here so it joins the head. Writes into `out` (no allocation).
 */
export function dragonNeck(
  pose: KiruDashPose,
  out: { x: number; y: number }
): { x: number; y: number } {
  const h = dragonHeading(pose);
  const c = Math.cos(h);
  const s = Math.sin(h);
  out.x = (NECK_X * c - NECK_Y * s) / U;
  out.y = ((NECK_X * s + NECK_Y * c) / U) * pose.grav;
  return out;
}

function drawDragon(
  ctx: CanvasRenderingContext2D,
  L: Look,
  pose: KiruDashPose
) {
  const c = L.c;
  const t = pose.t;
  const head = dragonHeading(pose);
  ctx.save();
  ctx.rotate(head);
  // The horns and the mane sweep back behind him.
  ctx.save();
  ctx.translate(DH_X, DH_Y);
  drawPart(ctx, DRAGON_BACK, L, 0, 1);
  ctx.restore();

  // Kiru: astride the neck, leaning less than the dragon does, one fist in
  // the mane.
  ctx.save();
  ctx.translate(DK_X, DK_Y);
  ctx.rotate(-head * 0.45);
  F.holdF = true;
  F.hfx = 58;
  F.hfy = 176;
  F.armB = -0.9;
  F.legF = 1.2;
  F.legB = 0.8;
  F.lenF = 20;
  F.lenB = 20;
  F.tailAng = -0.2 - head * 0.3;
  F.tailAmp = 9;
  F.tailFreq = 22;
  F.k = DRAGON_K;
  if (pose.dying > 0) poseHit(t);
  rig(ctx, DRAGON_K, 196);
  drawFigure(ctx, L, t);
  ctx.restore();

  ctx.translate(DH_X, DH_Y);
  // Whiskers stream back from the snout.
  ctx.beginPath();
  for (let w = 0; w < 2; w++) {
    const y0 = w === 0 ? -2 : 4;
    ctx.moveTo(44, y0);
    for (let i = 1; i <= 7; i++) {
      const u = i / 7;
      ctx.lineTo(
        44 - u * 76,
        y0 + u * (w === 0 ? 4 : 22) + Math.sin(t * 9 - u * 5 + w * 2) * 6 * u
      );
    }
  }
  ctx.strokeStyle = c.line;
  ctx.lineWidth = ow(5.5, 2);
  ctx.stroke();
  ctx.strokeStyle = L.trim;
  ctx.lineWidth = 2.6;
  ctx.stroke();
  drawPart(ctx, DRAGON_FRONT, L, 0, 1);
  ctx.restore();
}

// ── Mode change: the smoke bomb ────────────────────────────────────────────

// A ring of overlapping puffs round him, so the bang never hides where he is:
// direction (radians), reach (× the ring), radius (rig units).
const PUFF_N = 18;
const PUFFS = new Float64Array(PUFF_N * 3);
for (let i = 0; i < PUFF_N; i++) {
  // Close enough that neighbours overlap and merge into one wreath.
  PUFFS[i * 3] = (i / PUFF_N) * TAU + 0.2;
  PUFFS[i * 3 + 1] = i % 2 ? 1.08 : 0.96;
  PUFFS[i * 3 + 2] = (i % 3 === 0 ? 0.17 : i % 3 === 1 ? 0.13 : 0.15) * U;
}
/** The bang is baked in eight frames, the same for every skin. */
const PUFF_FRAMES = 8;

/**
 * The smoke bomb at progress p (0..1), cel-shaded like the 404's: the puffs
 * in his outline colour, then their shade, then their light, lifted a little
 * so the shade shows along every underside. A ring rx × ry (rig units).
 */
function puffAt(
  ctx: CanvasRenderingContext2D,
  L: Look,
  p: number,
  rx: number,
  ry: number,
  edge: number
) {
  // The bang throws the puffs out; they swell, then thin away.
  const grow = 1 - Math.pow(1 - p, 3);
  const size = Math.sin(clamp(p * 1.25, 0, 1) * Math.PI) * (1 - p * 0.3);
  if (size <= 0.01) return;
  const out = 0.75 + grow * 0.45;
  for (let pass = 0; pass < 3; pass++) {
    ctx.fillStyle =
      pass === 0 ? L.smokeLine : pass === 1 ? L.smokeShade : L.smokeLit;
    ctx.beginPath();
    for (let i = 0; i < PUFFS.length; i += 3) {
      const a = PUFFS[i];
      const x = Math.cos(a) * rx * out * PUFFS[i + 1];
      const y = Math.sin(a) * ry * out * PUFFS[i + 1] - (pass === 2 ? edge : 0);
      let r = PUFFS[i + 2] * size;
      if (pass === 0) r += edge;
      if (pass === 2) r -= edge;
      if (r <= 0) continue;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, TAU);
    }
    ctx.fill();
  }
  // A few gold sparks thrown out by the bang: four-point stars.
  const r = 0.11 * U * size;
  ctx.fillStyle = L.trim;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const a = i * 1.57 + 0.8;
    const sx = Math.cos(a) * (rx * out + 0.25 * U * grow);
    const sy = Math.sin(a) * (ry * out + 0.25 * U * grow);
    const q = r * 0.22;
    ctx.moveTo(sx, sy - r);
    ctx.lineTo(sx + q, sy - q);
    ctx.lineTo(sx + r, sy);
    ctx.lineTo(sx + q, sy + q);
    ctx.lineTo(sx, sy + r);
    ctx.lineTo(sx - q, sy + q);
    ctx.lineTo(sx - r, sy);
    ctx.lineTo(sx - q, sy - q);
    ctx.closePath();
  }
  ctx.fill();
}

// ── The entry point ────────────────────────────────────────────────────────

/**
 * How white he is while dying (0..1): a bright hit, a breath, then white-hot
 * for the shatter. Under reduced motion, a steady fade instead.
 */
function flashLevel(d: number, calm: boolean): number {
  if (calm) return 0.2 + 0.72 * d;
  const hit = clamp(1 - d / 0.25, 0, 1) * 0.85;
  return Math.max(hit, 0.08 + 0.87 * d * d * d);
}

/**
 * Draw Kiru for one frame of Dash. (x, y): his hitbox centre in the current
 * space (y down); pose.scale: canvas pixels per block.
 */
export function drawKiruDash(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pose: KiruDashPose
): void {
  const looks = looksFor(pose.skin.band);
  const dying = pose.dying > 0;
  const calm = pose.reducedMotion === true;
  const L = dying
    ? looks.flash[
        clamp(
          Math.round(flashLevel(pose.dying, calm) * FLASH_LEVELS) - 1,
          0,
          FLASH_LEVELS - 1
        )
      ]
    : pose.mode === 'shadow'
      ? looks.shadow
      : looks.base;
  // Vertical speed toward his head: the same in either gravity.
  const vl = pose.vy * pose.grav;
  const changing = pose.modeT < MODE_IN && !dying;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, pose.grav);
  if (pose.flipT < GRAV_IN && !dying && sinceTeleport(pose, vl) > INK_IN) {
    // Gravity just flipped: turn over like a card, from the old way up.
    const m = -Math.cos((pose.flipT / GRAV_IN) * Math.PI);
    ctx.scale(1, Math.abs(m) < 0.35 ? (m < 0 ? -0.35 : 0.35) : m);
  }
  PXU = U / Math.max(1, pose.scale);
  const k = pose.scale / U;
  ctx.scale(k, k);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // The sprites are drawn turned and scaled: always smooth them.
  ctx.imageSmoothingEnabled = true;
  const p = changing ? pose.modeT / MODE_IN : 1;
  const pop = changing && !calm;
  if (pop) {
    // Pop in from the smoke with a little overshoot.
    const s =
      0.55 +
      0.45 *
        (1 + 0.35 * Math.sin(p * Math.PI) * (1 - p)) *
        smooth(clamp(p * 1.6, 0, 1));
    ctx.save();
    ctx.scale(s, s);
  }
  resetFigure(pose);
  switch (pose.mode) {
    case 'run':
      drawRunner(ctx, L, pose, vl);
      break;
    case 'shadow':
      drawShadow(ctx, L, pose, vl);
      break;
    case 'kite':
      drawKite(ctx, L, pose, vl);
      break;
    case 'roll':
      drawRoll(ctx, L, pose, vl);
      break;
    case 'parasol':
      drawParasol(ctx, L, pose, vl);
      break;
    case 'dragon':
      drawDragon(ctx, L, pose);
      break;
  }
  if (pop) ctx.restore();
  if (changing) {
    const tall = pose.mode === 'run' || pose.mode === 'shadow';
    drawPart(
      ctx,
      tall ? PUFF_TALL : PUFF_ROUND,
      looks.base,
      Math.min(PUFF_FRAMES - 1, Math.floor(p * PUFF_FRAMES)),
      1
    );
  }
  ctx.restore();
}

// ── Warming up ─────────────────────────────────────────────────────────────

const MODES: readonly ModeId[] = [
  'run',
  'kite',
  'roll',
  'parasol',
  'dragon',
  'shadow',
];
let warmCtx: CanvasRenderingContext2D | null = null;
const warmPose: KiruDashPose = {
  t: 0,
  mode: 'run',
  grav: 1,
  vy: 0,
  grounded: true,
  rot: 0,
  runPhase: 0,
  air: 0,
  jumpT: Infinity,
  flipT: Infinity,
  modeT: Infinity,
  held: false,
  skin: { band: KIRU_COLORS.band, trail: 'none' },
  scale: 40,
  blink: false,
  dying: 0,
};

/**
 * Optional: bake every sprite Kiru can need at this scale and skin (each mode
 * with eyes open and blinking, the parasol's float, Shadow Step's smoke, the
 * smoke bomb), so no frame in play pays for a first bake. Call it after
 * setLevel or a resize; it draws nowhere visible.
 */
export function warmKiruDash(scale: number, skin: KiruSkin): void {
  if (!CAN_BAKE) return;
  if (!warmCtx) warmCtx = document.createElement('canvas').getContext('2d');
  if (!warmCtx) return;
  const p = warmPose;
  p.scale = scale;
  p.skin = skin;
  for (const mode of MODES) {
    p.mode = mode;
    // Eyes open, blinking, and (falling under the parasol) at rest.
    for (let i = 0; i < 3; i++) {
      p.blink = i === 1;
      p.grounded = i < 2;
      p.vy = i === 2 ? -6 : 0;
      drawKiruDash(warmCtx, 0, 0, p);
    }
    p.blink = false;
    // Every frame of the smoke bomb, and of Shadow Step's smoke.
    for (let f = 0; f < PUFF_FRAMES; f++) {
      p.modeT = ((f + 0.5) / PUFF_FRAMES) * MODE_IN;
      drawKiruDash(warmCtx, 0, 0, p);
    }
    p.modeT = Infinity;
    if (mode === 'shadow')
      for (let f = 0; f < SMOKE_FRAMES; f++) {
        p.t = ((f + 0.5) / SMOKE_FRAMES) * SMOKE_T;
        drawKiruDash(warmCtx, 0, 0, p);
      }
  }
}
