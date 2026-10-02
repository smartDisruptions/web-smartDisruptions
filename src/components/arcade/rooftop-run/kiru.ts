/**
 * Kiru, drawn on a canvas. The same rig as the SVG mascot
 * (components/kiru/Kiru.tsx) — the hood, the face opening, the plate with the
 * bolt, the headband and its knot are the very same path data, fed to Path2D —
 * with the limbs and the headband tails posed procedurally every frame, so the
 * run cycle, the tuck of a jump and the flail of a fall blend into each other
 * instead of snapping between drawings.
 *
 * Everything here is in the SVG's own units (a 240 box, feet at 100,232,
 * facing left); drawKiru mirrors him to run right and scales him to the world.
 *
 * The parts (kiruHood, kiruEyes, kiruTorso, kiruArm, kiruLeg, kiruTail, the
 * katana) are exported for Dash (dash/kiru-dash.ts), which poses the same rig
 * in its six modes and recolours it through a KiruColors object. Classic draws
 * with KIRU_COLORS, so its frames are exactly what they were.
 */

/** Every colour in the rig, so another drawing of him can swap a few. */
export interface KiruColors {
  /** The sticker outline: moonlit indigo, as on the site in dark mode. */
  line: string;
  gi: string;
  giLit: string;
  giShade: string;
  skin: string;
  skinShade: string;
  /** Headband, tails, obi and the katana's wrap. */
  band: string;
  bandDark: string;
  /** Optional sheen along the headband, for bands too dark to read on the hood. */
  bandHi?: string;
  /** The bolt on the plate: the brand mark. */
  bolt: string;
  steel: string;
  steelEdge: string;
  wrap: string;
  wrapShade: string;
  ink: string;
  gold: string;
  rim: string;
  collar: string;
  cheek: string;
  /** The scabbard. */
  saya: string;
  /** Eye whites, catchlights, the hood's sheen. */
  white: string;
  /** Hood gradient stops, lit top-left to shaded bottom-right. */
  hood: readonly [string, string, string];
  /** Gi gradient stops. */
  giGrad: readonly [string, string, string];
}

// Night palette: the moonlit outline and rim, as on the site in dark mode.
export const KIRU_COLORS: KiruColors = {
  line: '#3d4c95',
  gi: '#252d56',
  giLit: '#2e3970',
  giShade: '#1a2044',
  skin: '#f6d0a8',
  skinShade: '#e2b083',
  band: '#e8432a',
  bandDark: '#bd3019',
  bolt: '#e8432a',
  steel: '#cfd5e2',
  steelEdge: '#8d95ab',
  wrap: '#e4e7f0',
  wrapShade: '#b6bccf',
  ink: '#13152a',
  gold: '#dcae4e',
  rim: '#a9bcff',
  collar: '#c9cfe3',
  cheek: '#f08a78',
  saya: '#3a1f2a',
  white: '#fff',
  hood: ['#34417c', '#252d56', '#181d3b'],
  giGrad: ['#2e3970', '#252d56', '#1b2146'],
};

const C = KIRU_COLORS;

export type KiruState = 'run' | 'jump' | 'fall' | 'flip' | 'hit';

export interface KiruFrame {
  /** Seconds, for the tails and the blink. */
  t: number;
  /** Run-cycle phase in radians. */
  phase: number;
  state: KiruState;
  /** 0 on the ground → 1 fully in the air pose (eased by the engine). */
  air: number;
  /** 0 rising pose → 1 falling pose (eased). */
  fall: number;
  /** Vertical velocity, up positive (world units / s). */
  vy: number;
  /** 0..1, how fast the world is moving, for the tail flutter. */
  speed: number;
  /** Squash and stretch. */
  sx: number;
  sy: number;
  /** Rotation in radians (clockwise on screen). */
  rot: number;
  blink: boolean;
}

export interface KiruPaths {
  hood: Path2D;
  headClip: Path2D;
  face: Path2D;
  faceShade: Path2D;
  torso: Path2D;
  torsoShade: Path2D;
  collar: Path2D;
  obi: Path2D;
  obiBow: Path2D;
  bolt: Path2D;
  plate: Path2D;
  plateIn: Path2D;
  shoe: Path2D;
}
let P: KiruPaths | null = null;
/** The rig's shapes, built once: the SVG mascot's own path data. */
export function kiruPaths(): KiruPaths {
  if (P) return P;
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    const p = new Path2D();
    // roundRect is Safari 16+; older browsers get square corners.
    if (typeof p.roundRect === 'function') p.roundRect(x, y, w, h, r);
    else p.rect(x, y, w, h);
    return p;
  };
  P = {
    hood: new Path2D('M26 90a74 66 0 1 0 148 0a74 66 0 1 0 -148 0Z'),
    headClip: new Path2D('M26 90a74 66 0 1 0 148 0a74 66 0 1 0 -148 0Z'),
    face: new Path2D(
      'M44 80 C70 68 130 68 156 80 C168 85 168 104 156 109 C130 121 70 121 44 109 C32 104 32 85 44 80 Z'
    ),
    faceShade: new Path2D(
      'M44 80 C70 68 130 68 156 80 C160 82 162 85 163 88 C130 77 70 77 37 88 C38 85 40 82 44 80 Z'
    ),
    torso: new Path2D(
      'M64 158 Q66 146 82 143 L118 143 Q134 146 136 158 L133 199 Q100 205 67 199 Z'
    ),
    torsoShade: new Path2D(
      'M112 144 L118 143 Q134 146 136 158 L133 199 Q123 202 112 203 Z'
    ),
    collar: new Path2D('M88 145 L100 166 L112 145 Z'),
    obi: new Path2D('M66 184 Q100 191 134 184 L133 196 Q100 203 67 196 Z'),
    obiBow: new Path2D('M81 193 l-6 15 l8 -3 z M86 193 l2 15 l5 -5 z'),
    bolt: new Path2D(
      'M103.5 46.5 L94 55.5 L100.5 55.5 L96.5 60.5 L107 51.5 L100.5 51.5 Z'
    ),
    plate: rr(81, 43, 38, 20, 4.5),
    plateIn: rr(83.5, 45.5, 33, 15, 3),
    // The shoe, relative to the end of the leg; the toe points forward (−x).
    shoe: new Path2D('M-14 8 q0 -10 12 -10 h8 q6 0 6 6 v4 z'),
  };
  return P;
}

export interface KiruGradients {
  hood: CanvasGradient;
  gi: CanvasGradient;
}
// Gradients belong to a context; they are built once per context and palette
// (in rig units, so one serves every position and scale).
const grads = new WeakMap<
  CanvasRenderingContext2D,
  Map<KiruColors, KiruGradients>
>();
export function kiruGradients(
  ctx: CanvasRenderingContext2D,
  c: KiruColors = C
): KiruGradients {
  let m = grads.get(ctx);
  if (!m) {
    m = new Map();
    grads.set(ctx, m);
  }
  let g = m.get(c);
  if (!g) {
    const hood = ctx.createLinearGradient(48, 24, 152, 156);
    hood.addColorStop(0, c.hood[0]);
    hood.addColorStop(0.5, c.hood[1]);
    hood.addColorStop(1, c.hood[2]);
    const gi = ctx.createLinearGradient(64, 143, 136, 172);
    gi.addColorStop(0, c.giGrad[0]);
    gi.addColorStop(0.6, c.giGrad[1]);
    gi.addColorStop(1, c.giGrad[2]);
    g = { hood, gi };
    m.set(c, g);
  }
  return g;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A vector rotated so that a positive angle swings a hanging limb forward (−x). */
function rot(vx: number, vy: number, a: number): [number, number] {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [vx * c - vy * s, vx * s + vy * c];
}

function stroke(ctx: CanvasRenderingContext2D, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

/** Fill with the sticker outline painted underneath (SVG paint-order: stroke). */
export function kiruSticker(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  fill: string | CanvasGradient,
  out = 6,
  line = C.line
) {
  ctx.strokeStyle = line;
  ctx.lineWidth = out;
  ctx.stroke(p);
  ctx.fillStyle = fill;
  ctx.fill(p);
}

/**
 * An arm from the shoulder (sx, sy): a sleeve curving through (sx+cx, sy+cy)
 * to the hand at (sx+hx, sy+hy), ending in a wrapped fist. `fast` (Dash, at
 * game sizes) paints the fist as two discs and leaves out the wrap's crease.
 */
export function kiruArm(
  ctx: CanvasRenderingContext2D,
  c: KiruColors,
  sx: number,
  sy: number,
  cx: number,
  cy: number,
  hx: number,
  hy: number,
  lit: boolean,
  fast = false
) {
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(sx + cx, sy + cy, sx + hx, sy + hy);
  stroke(ctx, c.line, 22);
  stroke(ctx, lit ? c.giLit : c.giShade, 15);
  const fx = sx + hx;
  const fy = sy + hy + 2;
  if (fast) {
    // Fills are cheaper than strokes: the outline is a disc under the fist.
    ctx.beginPath();
    ctx.arc(fx, fy, 11.5, 0, Math.PI * 2);
    ctx.fillStyle = c.line;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx, fy, 9.5, 0, Math.PI * 2);
    ctx.fillStyle = c.wrap;
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.arc(fx, fy, 9.5, 0, Math.PI * 2);
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = c.wrap;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(fx - 6, fy - 2.5);
  ctx.quadraticCurveTo(fx, fy + 0.5, fx + 6, fy - 2.5);
  stroke(ctx, c.wrapShade, 2);
}

/** A leg from the hip (hx, hy), swung by `angle` (positive: forward), with its shoe. */
export function kiruLeg(
  ctx: CanvasRenderingContext2D,
  c: KiruColors,
  hx: number,
  hy: number,
  angle: number,
  len: number,
  color: string
) {
  // (0, len) swung by angle, written out so a frame allocates nothing.
  const fx = -len * Math.sin(angle);
  const fy = len * Math.cos(angle);
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + fx, hy + fy);
  stroke(ctx, c.line, 24);
  stroke(ctx, color, 18);
  ctx.save();
  ctx.translate(hx + fx, hy + fy);
  ctx.rotate(-angle * 0.45);
  kiruSticker(ctx, kiruPaths().shoe, c.ink, 5, c.line);
  ctx.restore();
}

// The tail's two edges, reused every call (nine segments, ten points each),
// and the edges of its outline for the fast path.
const TAIL_N = 9;
const tailTop = new Float64Array((TAIL_N + 1) * 2);
const tailBot = new Float64Array((TAIL_N + 1) * 2);
const tailTopO = new Float64Array((TAIL_N + 1) * 2);
const tailBotO = new Float64Array((TAIL_N + 1) * 2);

function ribbonPath(
  ctx: CanvasRenderingContext2D,
  top: Float64Array,
  bot: Float64Array
) {
  ctx.beginPath();
  ctx.moveTo(top[0], top[1]);
  for (let i = 2; i < top.length; i += 2) ctx.lineTo(top[i], top[i + 1]);
  for (let i = bot.length - 2; i >= 0; i -= 2) ctx.lineTo(bot[i], bot[i + 1]);
  ctx.closePath();
}

/**
 * One headband tail: a ribbon whose wave runs from the knot (rx, ry) to the
 * tip. `fast` (Dash) paints its outline as a second, wider ribbon underneath
 * instead of a stroke: the same look for about half the cost.
 */
export function kiruTail(
  ctx: CanvasRenderingContext2D,
  line: string,
  rx: number,
  ry: number,
  angle: number,
  len: number,
  width: number,
  amp: number,
  t: number,
  freq: number,
  phase: number,
  fill: string,
  fast = false
) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const px = -dy;
  const py = dx;
  for (let i = 0; i <= TAIL_N; i++) {
    const s = i / TAIL_N;
    const w = Math.pow(s, 1.3) * amp * Math.sin(t * freq - s * 5.2 + phase);
    const cx = rx + dx * len * s + px * w;
    const cy = ry + dy * len * s + py * w;
    const hw = (width / 2) * (1 - 0.72 * s);
    tailTop[i * 2] = cx + px * hw;
    tailTop[i * 2 + 1] = cy + py * hw;
    tailBot[i * 2] = cx - px * hw;
    tailBot[i * 2 + 1] = cy - py * hw;
    if (fast) {
      // Two units wider all round, and two past the root and the tip.
      const ho = hw + 2;
      const e = i === 0 ? -2 : i === TAIL_N ? 2 : 0;
      tailTopO[i * 2] = cx + px * ho + dx * e;
      tailTopO[i * 2 + 1] = cy + py * ho + dy * e;
      tailBotO[i * 2] = cx - px * ho + dx * e;
      tailBotO[i * 2 + 1] = cy - py * ho + dy * e;
    }
  }
  if (fast) {
    ribbonPath(ctx, tailTopO, tailBotO);
    ctx.fillStyle = line;
    ctx.fill();
    ribbonPath(ctx, tailTop, tailBot);
    ctx.fillStyle = fill;
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.moveTo(tailTop[0], tailTop[1]);
  for (let i = 2; i < tailTop.length; i += 2)
    ctx.lineTo(tailTop[i], tailTop[i + 1]);
  for (let i = tailBot.length - 2; i >= 0; i -= 2)
    ctx.lineTo(tailBot[i], tailBot[i + 1]);
  ctx.closePath();
  ctx.lineJoin = 'round';
  stroke(ctx, line, 4);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** The scabbard's tip, behind the back leg. */
export function kiruScabbard(ctx: CanvasRenderingContext2D, c: KiruColors) {
  ctx.beginPath();
  ctx.moveTo(134, 188);
  ctx.lineTo(157, 224);
  stroke(ctx, c.line, 13);
  stroke(ctx, c.saya, 8);
  ctx.beginPath();
  ctx.arc(157, 224, 3.6, 0, Math.PI * 2);
  ctx.fillStyle = c.gold;
  ctx.fill();
}

/** The katana's handle over the front shoulder, its wrap and its guard. */
export function kiruHilt(ctx: CanvasRenderingContext2D, c: KiruColors) {
  ctx.beginPath();
  ctx.moveTo(33, 116);
  ctx.lineTo(57, 150);
  stroke(ctx, c.line, 15);
  stroke(ctx, c.ink, 9.5);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(31 + i * 4, 120 + i * 6);
    ctx.lineTo(38 + i * 4, 117 + i * 6);
  }
  stroke(ctx, c.band, 2.6);
  ctx.beginPath();
  ctx.ellipse(57, 150, 11, 4.2, (-55 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = c.gold;
  ctx.fill();
}

/** The gi: torso, shade, collar, obi and its bow. */
export function kiruTorso(
  ctx: CanvasRenderingContext2D,
  c: KiruColors,
  gi: string | CanvasGradient
) {
  const p = kiruPaths();
  kiruSticker(ctx, p.torso, gi, 6, c.line);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = c.giShade;
  ctx.fill(p.torsoShade);
  ctx.globalAlpha = 1;
  ctx.fillStyle = c.collar;
  ctx.fill(p.collar);
  ctx.beginPath();
  ctx.moveTo(84, 145);
  ctx.lineTo(100, 170);
  ctx.lineTo(116, 145);
  stroke(ctx, c.giLit, 4.5);
  ctx.fillStyle = c.band;
  ctx.fill(p.obi);
  kiruSticker(ctx, p.obiBow, c.bandDark, 2, c.line);
  ctx.beginPath();
  ctx.arc(84, 192, 5, 0, Math.PI * 2);
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = c.bandDark;
  ctx.fill();
}

/**
 * The head without its eyes: hood, headband, moonlit rim, knot, the plate
 * with the bolt, and the face opening. Draw kiruEyes (or other eyes) after.
 */
export function kiruHood(
  ctx: CanvasRenderingContext2D,
  c: KiruColors,
  hood: string | CanvasGradient
) {
  const p = kiruPaths();
  kiruSticker(ctx, p.hood, hood, 6, c.line);
  ctx.save();
  ctx.clip(p.headClip);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = c.giShade;
  ctx.beginPath();
  ctx.ellipse(132, 128, 82, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = c.white;
  ctx.beginPath();
  ctx.ellipse(66, 40, 38, 15, (-24 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(14, 78);
  ctx.quadraticCurveTo(100, 34, 186, 78);
  stroke(ctx, c.band, 18);
  if (c.bandHi) {
    // A sheen along the top edge, so a dark band still reads on the hood.
    ctx.beginPath();
    ctx.moveTo(14, 71);
    ctx.quadraticCurveTo(100, 27, 186, 71);
    stroke(ctx, c.bandHi, 3);
  }
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(14, 87);
  ctx.quadraticCurveTo(100, 43, 186, 87);
  stroke(ctx, c.bandDark, 2.5);
  ctx.restore();
  // Moonlight on the hood's rim.
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(47, 50);
  ctx.quadraticCurveTo(33, 68, 31, 95);
  stroke(ctx, c.rim, 3.2);
  ctx.globalAlpha = 1;
  // The knot.
  ctx.strokeStyle = c.line;
  ctx.lineWidth = 3;
  ctx.fillStyle = c.bandDark;
  ctx.beginPath();
  ctx.ellipse(171, 64, 7.5, 5, (-32 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(172, 79, 6.5, 5, (30 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(166, 71, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = c.band;
  ctx.fill();
  // The plate, and the bolt: the brand mark, struck in steel.
  ctx.lineWidth = 3.5;
  ctx.stroke(p.plate);
  ctx.fillStyle = c.steel;
  ctx.fill(p.plate);
  ctx.strokeStyle = c.steelEdge;
  ctx.lineWidth = 1.2;
  ctx.stroke(p.plateIn);
  ctx.fillStyle = c.bolt;
  ctx.fill(p.bolt);
  // The face.
  ctx.fillStyle = c.skin;
  ctx.fill(p.face);
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = c.skinShade;
  ctx.fill(p.faceShade);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = c.cheek;
  ctx.beginPath();
  ctx.ellipse(57, 107, 7, 3.4, 0, 0, Math.PI * 2);
  ctx.ellipse(143, 107, 7, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * Eyes and brows. 'focus': on the road ahead (Classic's run). 'hit': wide,
 * brows up. 'normal': the mascot's resting look, round and open. `blink`
 * shuts them (never while hit). `look` shifts the pupils along x.
 */
export function kiruEyes(
  ctx: CanvasRenderingContext2D,
  c: KiruColors,
  mood: 'focus' | 'hit' | 'normal',
  blink: boolean,
  look: number
) {
  const hit = mood === 'hit';
  if (blink && !hit) {
    ctx.beginPath();
    ctx.moveTo(64, 96);
    ctx.quadraticCurveTo(76, 103, 88, 96);
    ctx.moveTo(112, 96);
    ctx.quadraticCurveTo(124, 103, 136, 96);
    stroke(ctx, c.ink, 5.5);
  } else {
    const normal = mood === 'normal';
    const rx = hit ? 13.5 : 12.5;
    const ry = hit ? 16 : normal ? 14.5 : 12.5;
    const cy = hit ? 95 : normal ? 95.5 : 97.5;
    const pr = hit ? 5.8 : 8;
    const lx = hit ? 0 : look;
    ctx.fillStyle = c.white;
    ctx.beginPath();
    ctx.ellipse(76, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.ellipse(124, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.ink;
    ctx.beginPath();
    ctx.arc(78 + lx, cy + 1.5, pr, 0, Math.PI * 2);
    ctx.arc(126 + lx, cy + 1.5, pr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.white;
    ctx.beginPath();
    ctx.arc(81 + lx, cy - 2.5, pr * 0.37, 0, Math.PI * 2);
    ctx.arc(129 + lx, cy - 2.5, pr * 0.37, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  if (hit) {
    ctx.moveTo(62, 74);
    ctx.quadraticCurveTo(74, 68, 87, 72);
    ctx.moveTo(113, 72);
    ctx.quadraticCurveTo(126, 68, 138, 74);
  } else if (mood === 'normal') {
    ctx.moveTo(61, 78);
    ctx.lineTo(87, 84);
    ctx.moveTo(113, 84);
    ctx.lineTo(139, 78);
  } else {
    ctx.moveTo(60, 79);
    ctx.lineTo(89, 88);
    ctx.moveTo(111, 88);
    ctx.lineTo(140, 79);
  }
  stroke(ctx, c.ink, 5);
}

/**
 * Draw Kiru with his feet at (x, y) in the current (world) transform.
 * `scale` is world units per SVG unit.
 */
export function drawKiru(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  f: KiruFrame
) {
  const g = kiruGradients(ctx);
  ctx.save();
  ctx.translate(x, y);
  // Flips and tumbles turn about his middle; leans about his feet.
  if (f.state === 'flip' || f.state === 'hit') {
    const mid = 104 * scale;
    ctx.translate(0, -mid);
    ctx.rotate(f.rot);
    ctx.translate(0, mid);
  } else {
    ctx.rotate(f.rot);
  }
  ctx.scale(-scale * f.sx, scale * f.sy); // mirrored: the rig faces left
  ctx.translate(-100, -232);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const air = f.air;
  const fl = f.fall;
  const hit = f.state === 'hit';
  const s = Math.sin(f.phase);
  const c = Math.cos(f.phase);

  // ── Limb pose: run cycle blended toward the air pose ─────────────────────
  const runFront = s * 0.62;
  const runBack = -s * 0.62;
  const liftF = 7 * Math.max(0, c);
  const liftB = 7 * Math.max(0, -c);
  let legF = lerp(runFront, lerp(0.95, 0.28, fl), air);
  let legB = lerp(runBack, lerp(-0.4, -0.12, fl), air);
  let lenF = lerp(27 - liftF, lerp(18, 26, fl), air);
  let lenB = lerp(27 - liftB, lerp(23, 27, fl), air);
  const flail = Math.sin(f.t * 22) * 0.18;
  let armF = lerp(-s * 0.95, lerp(1.25, 2.35 + flail, fl), air);
  let armB = lerp(s * 0.95, lerp(-0.85, -2.2 - flail, fl), air);
  if (f.state === 'flip') {
    legF = 1.15;
    legB = -0.1;
    lenF = 16;
    lenB = 18;
    armF = 1.5;
    armB = 0.9;
  }
  if (hit) {
    legF = 0.55 + flail;
    legB = -0.6 - flail;
    lenF = 26;
    lenB = 26;
    armF = 2.5 + flail;
    armB = -2.5 - flail;
  }

  // The hips sit wherever the lower foot touches the roof, so the feet stay
  // planted and the body bobs through the stride on its own.
  const depth = Math.max(lenF * Math.cos(legF), lenB * Math.cos(legB));
  const dy = lerp(231 - 8 - depth - 196, 0, air);

  // ── Tails, behind everything ────────────────────────────────────────────
  const vy = Math.max(-1, Math.min(1, f.vy / 650));
  const lift = hit ? Math.sin(f.t * 9) * 0.5 : vy > 0 ? vy * 0.5 : vy * 0.75;
  const amp = 6 + f.speed * 5 + (hit ? 6 : 0);
  const freq = 13 + f.speed * 9;
  ctx.save();
  ctx.translate(0, dy);
  kiruTail(
    ctx,
    C.line,
    166,
    74,
    0.16 + lift,
    86,
    9,
    amp,
    f.t,
    freq,
    1.9,
    C.bandDark
  );
  kiruTail(
    ctx,
    C.line,
    166,
    66,
    -0.1 + lift,
    92,
    10,
    amp,
    f.t,
    freq * 1.08,
    0,
    C.band
  );

  // ── Katana (behind the body) ─────────────────────────────────────────────
  kiruScabbard(ctx, C);
  kiruHilt(ctx, C);

  // ── Back arm, behind the torso ───────────────────────────────────────────
  const cb = rot(14, 10, armB);
  const hb = rot(24, 25, armB);
  kiruArm(ctx, C, 127, 156, cb[0], cb[1], hb[0], hb[1], false);
  ctx.restore();

  // ── Legs (planted: not shifted with the body) ───────────────────────────
  kiruLeg(ctx, C, 110, 196 + dy, legB, lenB, C.giShade);
  kiruLeg(ctx, C, 90, 196 + dy, legF, lenF, C.gi);

  ctx.save();
  ctx.translate(0, dy);
  // ── Torso ────────────────────────────────────────────────────────────────
  kiruTorso(ctx, C, g.gi);

  // ── Front arm ────────────────────────────────────────────────────────────
  const cf = rot(-14, 10, armF);
  const hf = rot(-24, 25, armF);
  kiruArm(ctx, C, 73, 156, cf[0], cf[1], hf[0], hf[1], true);

  // ── Head ─────────────────────────────────────────────────────────────────
  // Eyes: focused while running, wide when hit, shut for a blink.
  kiruHood(ctx, C, g.hood);
  kiruEyes(ctx, C, hit ? 'hit' : 'focus', f.blink, -3.5); // eyes on the road ahead
  ctx.restore();
  ctx.restore();
}
