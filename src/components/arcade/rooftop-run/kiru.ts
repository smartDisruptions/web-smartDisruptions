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
 */

// Night palette: the moonlit outline and rim, as on the site in dark mode.
const LINE = '#3d4c95';
const GI = '#252d56';
const GI_LIT = '#2e3970';
const GI_SHADE = '#1a2044';
const SKIN = '#f6d0a8';
const SKIN_SHADE = '#e2b083';
const RED = '#e8432a';
const RED_DARK = '#bd3019';
const STEEL = '#cfd5e2';
const STEEL_EDGE = '#8d95ab';
const WRAP = '#e4e7f0';
const WRAP_SHADE = '#b6bccf';
const INK = '#13152a';
const GOLD = '#dcae4e';
const RIM = '#a9bcff';

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

interface Paths {
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
let P: Paths | null = null;
function paths(): Paths {
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
      'M44 80 C70 68 130 68 156 80 C168 85 168 104 156 109 C130 121 70 121 44 109 C32 104 32 85 44 80 Z',
    ),
    faceShade: new Path2D(
      'M44 80 C70 68 130 68 156 80 C160 82 162 85 163 88 C130 77 70 77 37 88 C38 85 40 82 44 80 Z',
    ),
    torso: new Path2D('M64 158 Q66 146 82 143 L118 143 Q134 146 136 158 L133 199 Q100 205 67 199 Z'),
    torsoShade: new Path2D('M112 144 L118 143 Q134 146 136 158 L133 199 Q123 202 112 203 Z'),
    collar: new Path2D('M88 145 L100 166 L112 145 Z'),
    obi: new Path2D('M66 184 Q100 191 134 184 L133 196 Q100 203 67 196 Z'),
    obiBow: new Path2D('M81 193 l-6 15 l8 -3 z M86 193 l2 15 l5 -5 z'),
    bolt: new Path2D('M103.5 46.5 L94 55.5 L100.5 55.5 L96.5 60.5 L107 51.5 L100.5 51.5 Z'),
    plate: rr(81, 43, 38, 20, 4.5),
    plateIn: rr(83.5, 45.5, 33, 15, 3),
    // The shoe, relative to the end of the leg; the toe points forward (−x).
    shoe: new Path2D('M-14 8 q0 -10 12 -10 h8 q6 0 6 6 v4 z'),
  };
  return P;
}

const grads = new WeakMap<CanvasRenderingContext2D, { hood: CanvasGradient; gi: CanvasGradient }>();
function gradients(ctx: CanvasRenderingContext2D) {
  let g = grads.get(ctx);
  if (!g) {
    const hood = ctx.createLinearGradient(48, 24, 152, 156);
    hood.addColorStop(0, '#34417c');
    hood.addColorStop(0.5, '#252d56');
    hood.addColorStop(1, '#181d3b');
    const gi = ctx.createLinearGradient(64, 143, 136, 172);
    gi.addColorStop(0, '#2e3970');
    gi.addColorStop(0.6, '#252d56');
    gi.addColorStop(1, '#1b2146');
    g = { hood, gi };
    grads.set(ctx, g);
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
function sticker(ctx: CanvasRenderingContext2D, p: Path2D, fill: string | CanvasGradient, out = 6) {
  ctx.strokeStyle = LINE;
  ctx.lineWidth = out;
  ctx.stroke(p);
  ctx.fillStyle = fill;
  ctx.fill(p);
}

function arm(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  c: [number, number],
  h: [number, number],
  lit: boolean,
) {
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.quadraticCurveTo(sx + c[0], sy + c[1], sx + h[0], sy + h[1]);
  stroke(ctx, LINE, 22);
  stroke(ctx, lit ? GI_LIT : GI_SHADE, 15);
  const hx = sx + h[0];
  const hy = sy + h[1] + 2;
  ctx.beginPath();
  ctx.arc(hx, hy, 9.5, 0, Math.PI * 2);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = WRAP;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx - 6, hy - 2.5);
  ctx.quadraticCurveTo(hx, hy + 0.5, hx + 6, hy - 2.5);
  stroke(ctx, WRAP_SHADE, 2);
}

function leg(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  angle: number,
  len: number,
  color: string,
) {
  const [fx, fy] = rot(0, len, angle);
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(hx + fx, hy + fy);
  stroke(ctx, LINE, 24);
  stroke(ctx, color, 18);
  ctx.save();
  ctx.translate(hx + fx, hy + fy);
  ctx.rotate(-angle * 0.45);
  sticker(ctx, paths().shoe, INK, 5);
  ctx.restore();
}

/** One headband tail: a ribbon whose wave runs from the knot to the tip. */
function tail(
  ctx: CanvasRenderingContext2D,
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
) {
  const N = 9;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const px = -dy;
  const py = dx;
  const top: number[] = [];
  const bot: number[] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N;
    const w = Math.pow(s, 1.3) * amp * Math.sin(t * freq - s * 5.2 + phase);
    const cx = rx + dx * len * s + px * w;
    const cy = ry + dy * len * s + py * w;
    const hw = (width / 2) * (1 - 0.72 * s);
    top.push(cx + px * hw, cy + py * hw);
    bot.push(cx - px * hw, cy - py * hw);
  }
  ctx.beginPath();
  ctx.moveTo(top[0], top[1]);
  for (let i = 2; i < top.length; i += 2) ctx.lineTo(top[i], top[i + 1]);
  for (let i = bot.length - 2; i >= 0; i -= 2) ctx.lineTo(bot[i], bot[i + 1]);
  ctx.closePath();
  ctx.lineJoin = 'round';
  stroke(ctx, LINE, 4);
  ctx.fillStyle = fill;
  ctx.fill();
}

/**
 * Draw Kiru with his feet at (x, y) in the current (world) transform.
 * `scale` is world units per SVG unit.
 */
export function drawKiru(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, f: KiruFrame) {
  const p = paths();
  const g = gradients(ctx);
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
  tail(ctx, 166, 74, 0.16 + lift, 86, 9, amp, f.t, freq, 1.9, RED_DARK);
  tail(ctx, 166, 66, -0.1 + lift, 92, 10, amp, f.t, freq * 1.08, 0, RED);

  // ── Katana (behind the body) ─────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(134, 188);
  ctx.lineTo(157, 224);
  stroke(ctx, LINE, 13);
  stroke(ctx, '#3a1f2a', 8);
  ctx.beginPath();
  ctx.arc(157, 224, 3.6, 0, Math.PI * 2);
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(33, 116);
  ctx.lineTo(57, 150);
  stroke(ctx, LINE, 15);
  stroke(ctx, INK, 9.5);
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(31 + i * 4, 120 + i * 6);
    ctx.lineTo(38 + i * 4, 117 + i * 6);
  }
  stroke(ctx, RED, 2.6);
  ctx.beginPath();
  ctx.ellipse(57, 150, 11, 4.2, (-55 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.fill();

  // ── Back arm, behind the torso ───────────────────────────────────────────
  arm(ctx, 127, 156, rot(14, 10, armB), rot(24, 25, armB), false);
  ctx.restore();

  // ── Legs (planted: not shifted with the body) ───────────────────────────
  leg(ctx, 110, 196 + dy, legB, lenB, GI_SHADE);
  leg(ctx, 90, 196 + dy, legF, lenF, GI);

  ctx.save();
  ctx.translate(0, dy);
  // ── Torso ────────────────────────────────────────────────────────────────
  sticker(ctx, p.torso, g.gi);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = GI_SHADE;
  ctx.fill(p.torsoShade);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#c9cfe3';
  ctx.fill(p.collar);
  ctx.beginPath();
  ctx.moveTo(84, 145);
  ctx.lineTo(100, 170);
  ctx.lineTo(116, 145);
  stroke(ctx, GI_LIT, 4.5);
  ctx.fillStyle = RED;
  ctx.fill(p.obi);
  sticker(ctx, p.obiBow, RED_DARK, 2);
  ctx.beginPath();
  ctx.arc(84, 192, 5, 0, Math.PI * 2);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = RED_DARK;
  ctx.fill();

  // ── Front arm ────────────────────────────────────────────────────────────
  arm(ctx, 73, 156, rot(-14, 10, armF), rot(-24, 25, armF), true);

  // ── Head ─────────────────────────────────────────────────────────────────
  sticker(ctx, p.hood, g.hood);
  ctx.save();
  ctx.clip(p.headClip);
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = GI_SHADE;
  ctx.beginPath();
  ctx.ellipse(132, 128, 82, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(66, 40, 38, 15, (-24 * Math.PI) / 180, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.moveTo(14, 78);
  ctx.quadraticCurveTo(100, 34, 186, 78);
  stroke(ctx, RED, 18);
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(14, 87);
  ctx.quadraticCurveTo(100, 43, 186, 87);
  stroke(ctx, RED_DARK, 2.5);
  ctx.restore();
  // Moonlight on the hood's rim.
  ctx.globalAlpha = 0.75;
  ctx.beginPath();
  ctx.moveTo(47, 50);
  ctx.quadraticCurveTo(33, 68, 31, 95);
  stroke(ctx, RIM, 3.2);
  ctx.globalAlpha = 1;
  // The knot.
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.fillStyle = RED_DARK;
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
  ctx.fillStyle = RED;
  ctx.fill();
  // The plate, and the bolt: the brand mark, struck in steel.
  ctx.lineWidth = 3.5;
  ctx.stroke(p.plate);
  ctx.fillStyle = STEEL;
  ctx.fill(p.plate);
  ctx.strokeStyle = STEEL_EDGE;
  ctx.lineWidth = 1.2;
  ctx.stroke(p.plateIn);
  ctx.fillStyle = RED;
  ctx.fill(p.bolt);
  // The face.
  ctx.fillStyle = SKIN;
  ctx.fill(p.face);
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = SKIN_SHADE;
  ctx.fill(p.faceShade);
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#f08a78';
  ctx.beginPath();
  ctx.ellipse(57, 107, 7, 3.4, 0, 0, Math.PI * 2);
  ctx.ellipse(143, 107, 7, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Eyes: focused while running, wide when hit, shut for a blink.
  if (f.blink && !hit) {
    ctx.beginPath();
    ctx.moveTo(64, 96);
    ctx.quadraticCurveTo(76, 103, 88, 96);
    ctx.moveTo(112, 96);
    ctx.quadraticCurveTo(124, 103, 136, 96);
    stroke(ctx, INK, 5.5);
  } else {
    const rx = hit ? 13.5 : 12.5;
    const ry = hit ? 16 : 12.5;
    const cy = hit ? 95 : 97.5;
    const pr = hit ? 5.8 : 8;
    const look = hit ? 0 : -3.5; // eyes on the road ahead
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(76, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.ellipse(124, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(78 + look, cy + 1.5, pr, 0, Math.PI * 2);
    ctx.arc(126 + look, cy + 1.5, pr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(81 + look, cy - 2.5, pr * 0.37, 0, Math.PI * 2);
    ctx.arc(129 + look, cy - 2.5, pr * 0.37, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  if (hit) {
    ctx.moveTo(62, 74);
    ctx.quadraticCurveTo(74, 68, 87, 72);
    ctx.moveTo(113, 72);
    ctx.quadraticCurveTo(126, 68, 138, 74);
  } else {
    ctx.moveTo(60, 79);
    ctx.lineTo(89, 88);
    ctx.moveTo(111, 88);
    ctx.lineTo(140, 79);
  }
  stroke(ctx, INK, 5);
  ctx.restore();
  ctx.restore();
}
