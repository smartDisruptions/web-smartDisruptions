/**
 * The level itself: roofs, blocks, hazards, the things you press, the
 * finish. setLevel turns the object list into draw lists sorted by x (and
 * works out which sprites to bake); every frame draws only what is on
 * screen, from baked sprites, with simple fills for the rest.
 *
 * Moving things use the same maths as the simulation (motion.ts), so what
 * you see is what you hit.
 */
import type {
  BlockObj,
  CrowObj,
  DecoObj,
  EndObj,
  GateObj,
  LanternObj,
  LevelDef,
  ModeId,
  Obj,
  OrbObj,
  PadObj,
  RoofObj,
  SawObj,
  ScrollObj,
  SpeedObj,
  SpikeObj,
  VentObj,
} from '../types';
import { lanternAngle, motionW, ventCycle } from './motion';
import {
  FINISH_H,
  decoKey,
  emptyNeeds,
  gateTint,
  type CommonArt,
  type CommonNeeds,
  type ThemeArt,
} from './sprites';
import { clamp, mod, type Sprite } from './util';

/** The camera, in canvas pixels: sx = x * ppu + ox, sy = oy - y * ppu. */
export interface Cam {
  W: number;
  H: number;
  ppu: number;
  ox: number;
  oy: number;
  /** The view in blocks. */
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Song beats (motion), level seconds, ambient seconds. */
  beat: number;
  t: number;
  now: number;
  /** 0..1, peaks on every beat and decays (gentler under reduced motion). */
  pulse: number;
  /**
   * 0..1, a slower swell after the song's big hits (a section's downbeat, a
   * crash): the glows lift a little more. Always 0 under reduced motion.
   */
  accent: number;
  reduced: boolean;
}

// Layers, back to front.
const L_DECO_BACK = 0;
const L_BLOCK = 1;
const L_DECO = 2;
const L_PORTAL = 3;
const L_PICKUP = 4;
const L_HAZARD = 5;
const L_TEXT = 6;

interface Item {
  i: number;
  o: Obj;
  layer: number;
  x0: number;
  x1: number;
  key: string;
}

export interface Corridor {
  x0: number;
  x1: number;
  floor: number | null;
  ceil: number | null;
}

const FLYING: Record<ModeId, boolean> = {
  run: false,
  kite: true,
  roll: false,
  parasol: true,
  dragon: true,
  shadow: false,
};

export interface LevelPlan {
  level: LevelDef;
  roofs: { i: number; o: RoofObj }[];
  items: Item[];
  maxSpan: number;
  corridors: Corridor[];
  end: EndObj | null;
  endY: number;
  needs: ReturnType<typeof emptyNeeds>;
  common: CommonNeeds;
  /** Scratch: indices into items that are on screen this frame. */
  vis: Int32Array;
  visN: number;
  /** Per object: ambient time it was last triggered (orb, pad, gate, scroll). */
  hitAt: Float32Array;
}

const blockKey = (o: BlockObj) => `${o.style ?? 'tiles'}|${o.w}|${o.h}`;
const gateKey = (o: GateObj) => `${gateTint(o)}|${o.h ?? 4}`;
const speedKey = (o: SpeedObj) => `${o.speed}|${o.h ?? 4}`;

/** Read a level once: draw lists, corridors, and what to bake. */
export function planLevel(level: LevelDef): LevelPlan {
  const roofs: LevelPlan['roofs'] = [];
  const items: Item[] = [];
  const needs = emptyNeeds();
  const common: CommonNeeds = {
    gates: new Map(),
    speeds: new Map(),
    saws: new Set(),
  };
  let end: EndObj | null = null;
  const gates: GateObj[] = [];
  const mx = (m?: { dx: number }) => (m ? Math.abs(m.dx) : 0);
  level.objects.forEach((o, i) => {
    const add = (layer: number, x0: number, x1: number, key = '') =>
      items.push({ i, o, layer, x0, x1, key });
    switch (o.k) {
      case 'roof':
        roofs.push({ i, o });
        needs.roofs.add(o.style ?? 'tiles');
        break;
      case 'block': {
        const k = blockKey(o);
        needs.blocks.set(k, { style: o.style ?? 'tiles', w: o.w, h: o.h });
        add(L_BLOCK, o.x - mx(o.move) - 0.3, o.x + o.w + mx(o.move) + 0.3, k);
        break;
      }
      case 'spike': {
        const n = o.n ?? 1;
        const wide = o.dir === 'left' || o.dir === 'right' ? 1 : n;
        add(L_HAZARD, o.x - mx(o.move) - 0.2, o.x + wide + mx(o.move) + 0.2);
        break;
      }
      case 'saw':
        needs.saws.add(o.r);
        common.saws.add(o.r);
        add(
          L_HAZARD,
          o.x - o.r * 1.3 - mx(o.move),
          o.x + o.r * 1.3 + mx(o.move)
        );
        break;
      case 'crow':
        add(L_HAZARD, o.x - 1 - mx(o.move), o.x + 1 + mx(o.move));
        break;
      case 'lantern':
        add(L_HAZARD, o.x - o.len - 1, o.x + o.len + 1);
        break;
      case 'vent':
        needs.vents.add(o.w ?? 1);
        add(L_HAZARD, o.x - 0.6, o.x + (o.w ?? 1) + 0.6);
        break;
      case 'pad':
        add(L_PICKUP, o.x - 1, o.x + 2);
        break;
      case 'orb':
        add(L_PICKUP, o.x - 1.2 - mx(o.move), o.x + 1.2 + mx(o.move));
        break;
      case 'gate':
        common.gates.set(gateKey(o), { tint: gateTint(o), h: o.h ?? 4 });
        gates.push(o);
        add(L_PORTAL, o.x - 2, o.x + 2, gateKey(o));
        break;
      case 'speed':
        common.speeds.set(speedKey(o), { speed: o.speed, h: o.h ?? 4 });
        add(L_PORTAL, o.x - 2, o.x + 2, speedKey(o));
        break;
      case 'scroll':
        add(L_PICKUP, o.x - 1.2 - mx(o.move), o.x + 1.2 + mx(o.move));
        break;
      case 'text': {
        const size = o.size ?? 1;
        const k = `${o.text}|${size}`;
        needs.texts.set(k, { text: o.text, size });
        const half = o.text.length * size * 0.42 + 1;
        add(L_TEXT, o.x - half, o.x + half, k);
        break;
      }
      case 'deco': {
        const k = decoKey(o);
        needs.deco.set(k, o);
        const s = o.s ?? 3;
        const span = o.d === 'lanterns' || o.d === 'laundry' ? s + 1 : 2.5;
        add(o.d === 'torii' ? L_DECO_BACK : L_DECO, o.x - 1.5, o.x + span, k);
        break;
      }
      case 'end':
        end = o;
        break;
      default:
        break;
    }
  });
  items.sort((a, b) => a.x0 - b.x0);
  let maxSpan = 0;
  for (const it of items) maxSpan = Math.max(maxSpan, it.x1 - it.x0);

  // Corridors: each gate sets the bounds from its x until the next gate.
  // Flying modes with no bounds get 10 blocks centred on the gate.
  gates.sort((a, b) => a.x - b.x);
  const corridors: Corridor[] = [];
  let mode: ModeId = level.startMode;
  for (let k = 0; k < gates.length; k++) {
    const g = gates[k];
    mode = g.mode ?? mode;
    let floor = g.floor ?? null;
    let ceil = g.ceil ?? null;
    if (floor === null && ceil === null && FLYING[mode]) {
      floor = g.y - 5;
      ceil = g.y + 5;
    }
    const x1 = k + 1 < gates.length ? gates[k + 1].x : Infinity;
    if (floor !== null || ceil !== null)
      corridors.push({ x0: g.x, x1, floor, ceil });
  }

  let endY = 3;
  const e = end as EndObj | null;
  if (e) {
    for (const r of roofs)
      if (e.x >= r.o.x && e.x <= r.o.x + r.o.w) endY = r.o.top;
  }
  return {
    level,
    roofs,
    items,
    maxSpan,
    corridors,
    end: e,
    endY,
    needs,
    common,
    vis: new Int32Array(items.length),
    visN: 0,
    hitAt: new Float32Array(level.objects.length).fill(-1e9),
  };
}

/** Collect the items on screen into plan.vis. */
export function cull(plan: LevelPlan, cam: Cam) {
  const items = plan.items;
  const from = cam.x0 - plan.maxSpan;
  let lo = 0;
  let hi = items.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (items[m].x0 < from) lo = m + 1;
    else hi = m;
  }
  let n = 0;
  for (let k = lo; k < items.length; k++) {
    const it = items[k];
    if (it.x0 > cam.x1) break;
    if (it.x1 < cam.x0) continue;
    plan.vis[n++] = k;
  }
  plan.visN = n;
}

// ── Drawing helpers ───────────────────────────────────────────────────────

function blit(ctx: CanvasRenderingContext2D, s: Sprite, x: number, y: number) {
  ctx.drawImage(s.c, x - s.ax, y - s.ay, s.w, s.h);
}

/** A sprite rotated by `a` (radians, clockwise on screen) about its anchor at (x, y). */
function blitRot(
  ctx: CanvasRenderingContext2D,
  s: Sprite,
  x: number,
  y: number,
  a: number,
  k = 1
) {
  const c = Math.cos(a) * k;
  const sn = Math.sin(a) * k;
  ctx.setTransform(c, sn, -sn, c, x, y);
  ctx.drawImage(s.c, -s.ax, -s.ay, s.w, s.h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ── Themed passes (drawn once, or twice while a theme crossfades) ─────────

/** The corridor's floor beam and ceiling eaves, with the outside dimmed. */
export function drawCorridors(
  ctx: CanvasRenderingContext2D,
  plan: LevelPlan,
  art: ThemeArt,
  cam: Cam,
  alpha: number
) {
  const p = art.pal;
  const u = cam.ppu;
  for (const c of plan.corridors) {
    if (c.x0 > cam.x1 || c.x1 < cam.x0) continue;
    const a = Math.max(c.x0, cam.x0 - 1);
    const b = Math.min(c.x1, cam.x1 + 1);
    const xa = Math.round(a * u + cam.ox);
    const xb = Math.round(b * u + cam.ox);
    // The ceiling: eaves hanging down to the bound, the air above shaded.
    // The floor (below): a beam on the bound, the drop beneath it shaded.
    if (c.ceil !== null && c.ceil < cam.y1 + 1) {
      const y = Math.round(cam.oy - c.ceil * u);
      ctx.globalAlpha = alpha * 0.55;
      ctx.fillStyle = p.corridor;
      ctx.fillRect(xa, 0, xb - xa, Math.max(0, y - art.eave.h));
      ctx.globalAlpha = alpha;
      const tw = art.eave.w;
      const start = Math.floor((a - c.x0) / 2) * 2 + c.x0;
      for (let x = start; x < b; x += 2) {
        const sx = Math.round(x * u + cam.ox);
        const cw = Math.min(tw, xb - sx);
        if (cw <= 0) break;
        const cut = Math.max(0, xa - sx);
        ctx.drawImage(
          art.eave.c,
          cut,
          0,
          cw - cut,
          art.eave.c.height,
          sx + cut,
          y - art.eave.h,
          cw - cut,
          art.eave.h
        );
      }
      ctx.fillStyle = p.corridorLit;
      ctx.globalAlpha = alpha * (0.75 + 0.25 * cam.pulse);
      ctx.fillRect(
        xa,
        y - Math.max(1, u * 0.05),
        xb - xa,
        Math.max(2, u * 0.07)
      );
    }
    if (c.floor !== null && c.floor > cam.y0 - 1) {
      const y = Math.round(cam.oy - c.floor * u);
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = p.corridor;
      ctx.fillRect(
        xa,
        y + art.beam.h,
        xb - xa,
        Math.max(0, cam.H - y - art.beam.h)
      );
      ctx.globalAlpha = alpha;
      const start = Math.floor((a - c.x0) / 2) * 2 + c.x0;
      for (let x = start; x < b; x += 2) {
        const sx = Math.round(x * u + cam.ox);
        const cw = Math.min(art.beam.w, xb - sx);
        if (cw <= 0) break;
        const cut = Math.max(0, xa - sx);
        ctx.drawImage(
          art.beam.c,
          cut,
          0,
          cw - cut,
          art.beam.c.height,
          sx + cut,
          y,
          cw - cut,
          art.beam.h
        );
      }
      ctx.fillStyle = p.corridorLit;
      ctx.globalAlpha = alpha * (0.75 + 0.25 * cam.pulse);
      ctx.fillRect(
        xa,
        y - Math.max(1, u * 0.03),
        xb - xa,
        Math.max(2, u * 0.07)
      );
    }
  }
  ctx.globalAlpha = 1;
}

/** Tile a sprite across [a, b] (canvas px), from a phase origin, cropping the ends. */
function tileRow(
  ctx: CanvasRenderingContext2D,
  s: Sprite,
  origin: number,
  a: number,
  b: number,
  y: number,
  h: number
) {
  const tw = s.w;
  let x = origin + Math.floor((a - origin) / tw) * tw;
  for (; x < b; x += tw) {
    const l = Math.max(a, x);
    const r = Math.min(b, x + tw);
    if (r <= l) continue;
    const sx0 = ((l - x) / tw) * s.c.width;
    const sw = ((r - l) / tw) * s.c.width;
    ctx.drawImage(s.c, sx0, 0, sw, s.c.height, l, y, r - l, h);
  }
}

/** The roofs: the ground. Body, storeys, the tiled cap, the running line. */
export function drawRoofs(
  ctx: CanvasRenderingContext2D,
  plan: LevelPlan,
  art: ThemeArt,
  cam: Cam,
  alpha: number
) {
  const p = art.pal;
  const u = cam.ppu;
  ctx.globalAlpha = alpha;
  const line = Math.max(2, Math.round(u * 0.075));
  for (const { o } of plan.roofs) {
    if (o.x > cam.x1 + 1 || o.x + o.w < cam.x0 - 1) continue;
    const ra = art.roofs[o.style ?? 'tiles'];
    if (!ra) continue;
    const left = Math.round(o.x * u + cam.ox);
    const right = Math.round((o.x + o.w) * u + cam.ox);
    const a = Math.max(left, -4);
    const b = Math.min(right, cam.W + 4);
    const top = Math.round(cam.oy - o.top * u);
    if (top > cam.H) continue;
    const capH = Math.round(ra.capH * u);
    const yU = top + capH;
    const upH = ra.upper.h;
    // Storeys.
    tileRow(ctx, ra.upper, left, a, b, yU, upH);
    let y = yU + upH;
    while (y < cam.H) {
      tileRow(ctx, ra.lower, left, a, b, y, ra.lower.h);
      y += ra.lower.h;
    }
    // The walls: a clear edge on both sides (running into one is a death).
    const ew = Math.max(2, Math.round(u * 0.06));
    ctx.fillStyle = p.edge;
    ctx.globalAlpha = alpha * 0.55;
    if (left >= -4) ctx.fillRect(left, top, ew, cam.H - top);
    if (right <= cam.W + 4) ctx.fillRect(right - ew, top, ew, cam.H - top);
    ctx.globalAlpha = alpha;
    // The cap and its curled ends.
    tileRow(ctx, ra.cap, left, a, b, top, capH);
    if (left > -u) blit(ctx, ra.endL, left, top);
    if (right < cam.W + u) blit(ctx, ra.endR, right, top);
    // The running line.
    ctx.fillStyle = p.edge;
    ctx.globalAlpha = alpha * (0.85 + 0.15 * cam.pulse);
    ctx.fillRect(a, top - (line >> 1), b - a, line);
    ctx.globalAlpha = alpha;
  }
  ctx.globalAlpha = 1;
}

/** Blocks, decoration and hazards: the themed layers, in order. */
export function drawThemed(
  ctx: CanvasRenderingContext2D,
  plan: LevelPlan,
  art: ThemeArt,
  common: CommonArt,
  cam: Cam,
  alpha: number,
  layer: number
) {
  const u = cam.ppu;
  const p = art.pal;
  ctx.globalAlpha = alpha;
  for (let k = 0; k < plan.visN; k++) {
    const it = plan.items[plan.vis[k]];
    if (it.layer !== layer) continue;
    const o = it.o;
    switch (o.k) {
      case 'block':
        drawBlock(ctx, o, art.blocks.get(it.key), p.edge, cam, alpha);
        break;
      case 'deco':
        drawDeco(ctx, o, art.deco.get(it.key), cam);
        break;
      case 'text': {
        const s = art.texts.get(it.key);
        if (s) blit(ctx, s, o.x * u + cam.ox, cam.oy - o.y * u);
        break;
      }
      case 'spike':
        drawSpike(ctx, o, art, cam);
        break;
      case 'saw':
        drawSaw(ctx, o, art, common, cam, alpha);
        break;
      case 'crow':
        drawCrow(ctx, o, art, cam);
        break;
      case 'lantern':
        drawLantern(ctx, o, art, cam);
        break;
      case 'vent':
        drawVent(ctx, o, art, common, cam, alpha);
        break;
      default:
        break;
    }
  }
  ctx.globalAlpha = 1;
}

export const LAYERS = {
  decoBack: L_DECO_BACK,
  block: L_BLOCK,
  deco: L_DECO,
  portal: L_PORTAL,
  pickup: L_PICKUP,
  hazard: L_HAZARD,
  text: L_TEXT,
};

function moved(
  o: { x: number; y: number; move?: BlockObj['move'] },
  cam: Cam,
  out: { x: number; y: number }
) {
  if (o.move) {
    const w = motionW(o.move, cam.beat);
    out.x = o.x + o.move.dx * w;
    out.y = o.y + o.move.dy * w;
  } else {
    out.x = o.x;
    out.y = o.y;
  }
  return out;
}
const P = { x: 0, y: 0 };

function drawBlock(
  ctx: CanvasRenderingContext2D,
  o: BlockObj,
  s: Sprite | undefined,
  edge: string,
  cam: Cam,
  alpha: number
) {
  if (!s) return;
  const u = cam.ppu;
  moved(o, cam, P);
  const x = Math.round(P.x * u + cam.ox);
  const y = Math.round(cam.oy - (P.y + o.h) * u);
  blit(ctx, s, x, y);
  const line = Math.max(2, Math.round(u * 0.075));
  ctx.fillStyle = edge;
  ctx.globalAlpha = alpha * (0.85 + 0.15 * cam.pulse);
  ctx.fillRect(x, y - (line >> 1), Math.round(o.w * u), line);
  ctx.globalAlpha = alpha;
}

function drawDeco(
  ctx: CanvasRenderingContext2D,
  o: DecoObj,
  s: Sprite | undefined,
  cam: Cam
) {
  if (!s) return;
  const u = cam.ppu;
  const x = o.x * u + cam.ox;
  const y = cam.oy - o.y * u;
  if (o.d === 'chime' || o.d === 'crane') {
    const a =
      Math.sin(cam.now * (o.d === 'chime' ? 2.3 : 0.9) + o.x) *
      (cam.reduced ? 0.04 : 0.12);
    blitRot(ctx, s, x, y, a);
  } else blit(ctx, s, x, y);
}

const SPIKE_DIR: Record<string, number> = { up: 0, down: 1, left: 2, right: 3 };

function drawSpike(
  ctx: CanvasRenderingContext2D,
  o: SpikeObj,
  art: ThemeArt,
  cam: Cam
) {
  const u = cam.ppu;
  const d = SPIKE_DIR[o.dir ?? 'up'];
  const s = art.spikes[d * 2 + (o.small ? 1 : 0)];
  const n = o.n ?? 1;
  moved(o, cam, P);
  for (let k = 0; k < n; k++) {
    // The cell's top-left, in blocks.
    let cx = P.x;
    let cy = P.y + 1;
    if (d === 0) cx += k;
    else if (d === 1) {
      cx += k;
      cy = P.y;
    } else cy = P.y + k + 1;
    ctx.drawImage(
      s.c,
      Math.round(cx * u + cam.ox) - s.ax,
      Math.round(cam.oy - cy * u) - s.ay,
      s.w,
      s.h
    );
  }
}

function drawSaw(
  ctx: CanvasRenderingContext2D,
  o: SawObj,
  art: ThemeArt,
  common: CommonArt,
  cam: Cam,
  alpha: number
) {
  const s = art.saws.get(o.r);
  if (!s) return;
  const u = cam.ppu;
  moved(o, cam, P);
  const x = P.x * u + cam.ox;
  const y = cam.oy - P.y * u;
  const sm = common.smear.get(o.r);
  if (sm) {
    ctx.globalAlpha = alpha * 0.9;
    blit(ctx, sm, x, y);
    ctx.globalAlpha = alpha;
  }
  // Spins on ambient time: it keeps turning through a death and the finish.
  blitRot(ctx, s, x, y, cam.now * 7.5);
}

function drawCrow(
  ctx: CanvasRenderingContext2D,
  o: CrowObj,
  art: ThemeArt,
  cam: Cam
) {
  const u = cam.ppu;
  moved(o, cam, P);
  const f = art.crow[Math.floor(mod(cam.now * 14 + o.x * 0.7, 8))];
  blit(ctx, f, P.x * u + cam.ox, cam.oy - P.y * u);
}

function drawLantern(
  ctx: CanvasRenderingContext2D,
  o: LanternObj,
  art: ThemeArt,
  cam: Cam
) {
  const u = cam.ppu;
  const a = lanternAngle(o, cam.beat);
  const ax = o.x * u + cam.ox;
  const ay = cam.oy - o.y * u;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const len = o.len * u;
  // The rope (not a hazard): thin and dark, with a faint light edge.
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.lineWidth = Math.max(2, u * 0.08);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax + s * len, ay + c * len);
  ctx.stroke();
  ctx.strokeStyle = art.pal.wallLit;
  ctx.lineWidth = Math.max(1, u * 0.03);
  ctx.stroke();
  ctx.fillStyle = art.pal.iron;
  ctx.fillRect(ax - u * 0.12, ay - u * 0.06, u * 0.24, u * 0.12);
  // The body swings with the rope.
  ctx.setTransform(c, -s, s, c, ax + s * len, ay + c * len);
  ctx.drawImage(
    art.lantern.c,
    -art.lantern.ax,
    -art.lantern.ay,
    art.lantern.w,
    art.lantern.h
  );
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawVent(
  ctx: CanvasRenderingContext2D,
  o: VentObj,
  art: ThemeArt,
  common: CommonArt,
  cam: Cam,
  alpha: number
) {
  const u = cam.ppu;
  const w = o.w ?? 1;
  const x = o.x * u + cam.ox;
  const y = cam.oy - o.y * u;
  const c = ventCycle(o, cam.beat);
  const cyc = o.on + o.off;
  const fire = o.style === 'fire';
  const hh = o.h * u;
  const ww = w * u;
  // The hiss: the beat before it blows.
  const warn = c >= o.on && c >= cyc - 1 ? c - (cyc - 1) : 0;
  const jet = fire ? common.fireJet : common.jet;
  if (c < o.on) {
    // Blowing: full height from the first frame, fading out at the end.
    const end = clamp((o.on - c) / 0.12, 0, 1);
    ctx.globalAlpha = alpha * (0.6 + 0.4 * end);
    ctx.drawImage(jet.c, x - ww * 0.05, y - hh, ww * 1.1, hh);
    if (fire) {
      const n = Math.max(2, Math.round(o.h * 1.6));
      for (let k = 0; k < n; k++) {
        const ph = mod(cam.now * 2.6 + k / n + o.x * 0.13, 1);
        const f = common.flames[k % 3];
        const z =
          (0.75 + 0.35 * Math.sin(cam.now * 13 + k)) *
          (w * 0.75 + 0.3) *
          (1 - ph * 0.35);
        ctx.globalAlpha = alpha * (1 - ph * ph) * end;
        ctx.drawImage(
          f.c,
          x + ww / 2 - (f.w * z) / 2 + Math.sin(k * 2.3) * ww * 0.15,
          y - ph * hh * 0.85 - f.ay * z,
          f.w * z,
          f.h * z
        );
      }
    } else {
      const puff = common.puff;
      const n = Math.ceil(o.h * 2.4);
      for (let k = 0; k < n; k++) {
        const ph = mod(cam.now * 2.2 + k / n + o.x * 0.13, 1);
        const wob = Math.sin(cam.now * 5 + k * 2.1) * ww * 0.1;
        const z = (0.55 + ph * 0.6) * (w * 0.75 + 0.35);
        ctx.globalAlpha = alpha * 0.85 * (1 - ph * 0.5) * end;
        ctx.drawImage(
          puff.c,
          x + ww / 2 + wob - (puff.w * z) / 2,
          y - ph * hh - (puff.h * z) / 2,
          puff.w * z,
          puff.h * z
        );
      }
    }
    // Firm edges where the hitbox is.
    ctx.globalAlpha = alpha * 0.55 * end;
    ctx.fillStyle = fire ? '#ffd27a' : '#ffffff';
    const lw = Math.max(1, u * 0.04);
    ctx.fillRect(x + u * 0.1 - lw / 2, y - hh * 0.92, lw, hh * 0.92);
    ctx.fillRect(x + ww - u * 0.1 - lw / 2, y - hh * 0.92, lw, hh * 0.92);
  } else if (warn > 0) {
    // The warning: a ghost of the column, and wisps hissing at the grate.
    ctx.globalAlpha = alpha * (0.1 + 0.18 * warn);
    ctx.drawImage(jet.c, x, y - hh, ww, hh);
    const puff = fire ? common.fire : common.puff;
    for (let k = 0; k < 3; k++) {
      const ph = mod(cam.now * 3 + k / 3, 1);
      const z = (0.3 + warn * 0.45) * (0.6 + ph * 0.6) * (w * 0.6 + 0.4);
      ctx.globalAlpha = alpha * (0.4 + warn * 0.5) * (1 - ph);
      ctx.drawImage(
        puff.c,
        x + ww / 2 - (puff.w * z) / 2 + (k - 1) * ww * 0.25,
        y - ph * u * (0.5 + warn) - (puff.h * z) / 2,
        puff.w * z,
        puff.h * z
      );
    }
    // A hissing flicker, or a steady glow under reduced motion.
    const hiss = cam.reduced ? 0.8 : 0.55 + 0.45 * Math.sin(cam.now * 28);
    ctx.globalAlpha = alpha * warn * hiss;
    ctx.drawImage(
      common.warn.c,
      x + ww / 2 - common.warn.w * 0.5 * (w * 0.6 + 0.4),
      y - common.warn.h * 0.35,
      common.warn.w * (w * 0.6 + 0.4),
      common.warn.h * 0.7
    );
  }
  ctx.globalAlpha = alpha;
  const base = art.vents.get(w);
  if (base) blit(ctx, base, x, y);
}

// ── Interactive things (one pass: their colour is their meaning) ──────────

export function drawInteractive(
  ctx: CanvasRenderingContext2D,
  plan: LevelPlan,
  art: CommonArt,
  cam: Cam,
  used: Uint8Array,
  scrolls: [boolean, boolean, boolean],
  glow: number,
  layer: number
) {
  for (let k = 0; k < plan.visN; k++) {
    const it = plan.items[plan.vis[k]];
    if (it.layer !== layer) continue;
    const o = it.o;
    const isUsed = used[it.i] === 1;
    const since = cam.now - plan.hitAt[it.i];
    switch (o.k) {
      case 'gate':
        drawGate(ctx, o, art, it.key, cam, isUsed, since, glow);
        break;
      case 'speed':
        drawSpeed(ctx, o, art, it.key, cam, isUsed, glow);
        break;
      case 'pad':
        drawPad(ctx, o, art, cam, since, glow);
        break;
      case 'orb':
        drawOrb(ctx, o, art, cam, isUsed, since, glow);
        break;
      case 'scroll':
        drawScroll(ctx, o, art, cam, isUsed || scrolls[o.id], since);
        break;
      default:
        break;
    }
  }
  ctx.globalAlpha = 1;
}

function drawGate(
  ctx: CanvasRenderingContext2D,
  o: GateObj,
  art: CommonArt,
  key: string,
  cam: Cam,
  used: boolean,
  since: number,
  glow: number
) {
  const s = art.gates.get(key);
  if (!s) return;
  const u = cam.ppu;
  const h = o.h ?? 4;
  const tint = gateTint(o);
  const x = o.x * u + cam.ox;
  const y = cam.oy - o.y * u;
  const flash = since < 0.5 ? 1 - since / 0.5 : 0;
  // Halo and the light curtain between the pillars.
  const g = art.gateGlow[tint];
  ctx.globalAlpha = clamp(
    glow *
      (0.35 + 0.2 * cam.pulse + 0.3 * cam.accent + flash * 0.5) *
      (used ? 0.6 : 1),
    0,
    1
  );
  ctx.drawImage(
    g.c,
    x - g.w * 0.5,
    y - (h * u) / 2 - u * 0.4,
    g.w,
    h * u + u * 0.8
  );
  const v = art.veil[tint];
  ctx.globalAlpha = clamp(
    (used ? 0.35 : 0.75 + 0.25 * cam.pulse) + flash,
    0,
    1
  );
  ctx.drawImage(v.c, x - v.w / 2, y - (h * u) / 2, v.w, h * u);
  ctx.globalAlpha = 1;
  blit(ctx, s, x, y);
  const e = o.mode ? art.emblem[o.mode] : art.gravEmblem[o.grav === -1 ? 0 : 1];
  if (o.mode || o.grav) {
    const z = 1 + flash * 0.5;
    ctx.drawImage(
      e.c,
      x - (e.w * z) / 2,
      y - (h / 2) * u + u * 0.33 - (e.h * z) / 2,
      e.w * z,
      e.h * z
    );
  }
}

function drawSpeed(
  ctx: CanvasRenderingContext2D,
  o: SpeedObj,
  art: CommonArt,
  key: string,
  cam: Cam,
  used: boolean,
  glow: number
) {
  const s = art.speed.get(key);
  if (!s) return;
  const u = cam.ppu;
  const x = o.x * u + cam.ox;
  const y = cam.oy - o.y * u;
  const h = o.h ?? 4;
  const g = art.speedGlow[o.speed];
  ctx.globalAlpha = clamp(
    glow * (used ? 0.25 : 0.45 + 0.25 * cam.pulse + 0.3 * cam.accent),
    0,
    1
  );
  ctx.drawImage(g.c, x - g.w * 0.45, y - (h * u) / 2, g.w * 0.9, h * u);
  ctx.globalAlpha = used ? 0.6 : 1;
  // The chevrons drift forward a little, on the beat.
  const shift =
    (cam.reduced ? 0 : cam.pulse * 0.08) * u * (o.speed === 'slow' ? -1 : 1);
  blit(ctx, s, x + shift, y);
  ctx.globalAlpha = 1;
}

function drawPad(
  ctx: CanvasRenderingContext2D,
  o: PadObj,
  art: CommonArt,
  cam: Cam,
  since: number,
  glow: number
) {
  const u = cam.ppu;
  const x = (o.x + 0.5) * u + cam.ox;
  const y = cam.oy - o.y * u;
  const d = o.flip ? -1 : 1;
  const g = art.padGlow[o.c];
  const bounce =
    since < 0.35
      ? Math.sin((since / 0.35) * Math.PI * 3) * (1 - since / 0.35)
      : 0;
  ctx.globalAlpha = clamp(
    glow *
      (0.55 + 0.3 * cam.pulse + 0.3 * cam.accent + (since < 0.3 ? 0.4 : 0)),
    0,
    1
  );
  ctx.drawImage(
    g.c,
    x - g.w / 2,
    y - d * u * 0.4 - g.h * 0.32,
    g.w,
    g.h * 0.64
  );
  ctx.globalAlpha = 1;
  const s = art.pad[o.c];
  const sy = 1 - bounce * 0.25;
  ctx.setTransform(1 + bounce * 0.12, 0, 0, d * sy, x, y);
  ctx.drawImage(s.c, -s.ax, -s.ay, s.w, s.h);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawOrb(
  ctx: CanvasRenderingContext2D,
  o: OrbObj,
  art: CommonArt,
  cam: Cam,
  used: boolean,
  since: number,
  glow: number
) {
  const u = cam.ppu;
  moved(o, cam, P);
  const x = P.x * u + cam.ox;
  const y =
    cam.oy -
    P.y * u +
    Math.sin(cam.now * 2.2 + o.x) * u * (cam.reduced ? 0.02 : 0.05);
  const burst = since < 0.4 ? 1 - since / 0.4 : 0;
  if (!used || burst > 0) {
    const g = art.orbGlow[o.c];
    const z = 0.9 + 0.2 * cam.pulse + 0.15 * cam.accent + burst * 0.8;
    ctx.globalAlpha = clamp(
      glow * (0.6 + 0.25 * cam.pulse + 0.3 * cam.accent) + burst,
      0,
      1
    );
    ctx.drawImage(g.c, x - (g.w * z) / 2, y - (g.h * z) / 2, g.w * z, g.h * z);
    const r = art.ring[o.c];
    ctx.globalAlpha = used ? burst : 0.75 + 0.25 * cam.pulse;
    blitRot(
      ctx,
      r,
      x,
      y,
      cam.now * 0.8 + o.x,
      1 + 0.12 * cam.pulse + burst * 0.8
    );
  }
  ctx.globalAlpha = used ? 0.4 : 1;
  blit(ctx, art.orb[o.c], x, y);
  ctx.globalAlpha = 1;
}

function drawScroll(
  ctx: CanvasRenderingContext2D,
  o: ScrollObj,
  art: CommonArt,
  cam: Cam,
  got: boolean,
  since: number
) {
  const u = cam.ppu;
  moved(o, cam, P);
  const bob = Math.sin(cam.now * 2 + o.id) * u * 0.1;
  const x = P.x * u + cam.ox;
  let y = cam.oy - P.y * u + bob;
  if (got) {
    // Faded once collected: a ghost that drifts up and away.
    const k = clamp(since / 0.8, 0, 1);
    y -= k * u * 1.2;
    ctx.globalAlpha = 0.25;
    blit(ctx, art.scroll, x, y);
    ctx.globalAlpha = 1;
    return;
  }
  const g = art.scrollGlow;
  ctx.globalAlpha = 0.55 + 0.3 * cam.pulse + 0.15 * cam.accent;
  blit(ctx, g, x, y);
  ctx.globalAlpha = 1;
  blit(ctx, art.scroll, x, y);
  // A glint runs along it every couple of seconds.
  const gl = mod(cam.now * 0.6 + o.id * 0.3, 1.4);
  if (gl < 1) {
    const gz = Math.sin(gl * Math.PI);
    blitRot(ctx, art.glint, x + (gl - 0.5) * u * 0.9, y - u * 0.12, gl * 2, gz);
  }
}

/** The finish: a great ribboned torii, and a pillar of light on the line. */
export function drawFinish(
  ctx: CanvasRenderingContext2D,
  plan: LevelPlan,
  art: CommonArt,
  cam: Cam
) {
  const e = plan.end;
  if (!e || e.x < cam.x0 - 5 || e.x > cam.x1 + 5) return;
  const u = cam.ppu;
  const x = e.x * u + cam.ox;
  const y = cam.oy - plan.endY * u;
  const g = art.finishGlow;
  ctx.globalAlpha = 0.5 + 0.3 * cam.pulse + 0.2 * cam.accent;
  ctx.drawImage(g.c, x - g.w / 2, y - (FINISH_H + 0.3) * u - g.h / 2, g.w, g.h);
  ctx.globalAlpha = 0.35 + 0.15 * cam.pulse;
  const v = art.veil.yellow;
  ctx.drawImage(v.c, x - v.w * 0.6, 0, v.w * 1.2, y);
  ctx.globalAlpha = 1;
  blit(ctx, art.finish, x, y);
  // Streamers, red and white, hanging from both ends of the lintel and
  // swaying in the wind, wider at the top.
  const top = y - (FINISH_H - 0.95) * u;
  ctx.lineCap = 'round';
  for (let r = 0; r < 4; r++) {
    const side = r < 2 ? -1 : 1;
    const bx = x + side * (2.0 + (r % 2) * 0.22) * u;
    const len = (2.2 + (r % 2) * 0.6) * u;
    ctx.strokeStyle = r % 2 ? '#f4f0ea' : '#e8432a';
    for (let seg = 0; seg < 2; seg++) {
      // Two widths: the upper half broad, the lower half tapering.
      ctx.lineWidth = Math.max(2, u * (seg ? 0.09 : 0.16));
      ctx.beginPath();
      for (let k = seg * 3; k <= 3 + seg * 3; k++) {
        const s = k / 6;
        const sway = Math.sin(cam.now * 3.2 - s * 3.5 + r * 1.7) * u * 0.32 * s;
        const px = bx + sway - s * u * 0.35;
        const py = top + s * len;
        if (k === seg * 3) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
}

/**
 * Kiru's shadow on the surface under him (over him, upside down): it
 * grounds him, and it tells the eye where he will land. Fades with height.
 */
export function drawShadow(
  ctx: CanvasRenderingContext2D,
  plan: LevelPlan,
  art: CommonArt,
  cam: Cam,
  px: number,
  py: number,
  halfH: number,
  grav: number
) {
  // The nearest surface on the side gravity pulls toward, at or past his feet.
  const feet = py - grav * halfH;
  let surf = grav > 0 ? -Infinity : Infinity;
  if (grav > 0) {
    for (const { o } of plan.roofs) {
      if (px >= o.x && px <= o.x + o.w) surf = nearer(surf, o.top, feet, grav);
    }
  }
  for (let k = 0; k < plan.visN; k++) {
    const it = plan.items[plan.vis[k]];
    if (it.layer !== L_BLOCK) continue;
    const o = it.o as BlockObj;
    moved(o, cam, P);
    if (px < P.x || px > P.x + o.w) continue;
    surf = nearer(surf, grav > 0 ? P.y + o.h : P.y, feet, grav);
  }
  for (const c of plan.corridors) {
    if (px < c.x0 || px >= c.x1) continue;
    const y = grav > 0 ? c.floor : c.ceil;
    if (y !== null) surf = nearer(surf, y, feet, grav);
  }
  if (!Number.isFinite(surf)) return;
  const k = clamp(Math.abs(feet - surf) / 5, 0, 1);
  const s = art.shadow;
  const z = 1 - 0.55 * k;
  ctx.globalAlpha = 0.55 * (1 - k);
  ctx.drawImage(
    s.c,
    px * cam.ppu + cam.ox - (s.w * z) / 2,
    cam.oy - surf * cam.ppu - (s.h * z) / 2,
    s.w * z,
    s.h * z
  );
  ctx.globalAlpha = 1;
}

/** Keep `cur`, or take `y` if it is a surface past his feet and nearer. */
function nearer(cur: number, y: number, feet: number, grav: number) {
  if (grav > 0) return y <= feet + 0.15 && y > cur ? y : cur;
  return y >= feet - 0.15 && y < cur ? y : cur;
}

/** Practice checkpoints, as Geometry Dash draws them: green diamonds. */
export function drawCheckpoints(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; y: number }[],
  art: CommonArt,
  cam: Cam
) {
  const u = cam.ppu;
  for (let k = 0; k < pts.length; k++) {
    const c = pts[k];
    if (c.x < cam.x0 - 1 || c.x > cam.x1 + 1) continue;
    const z = 1 + (k === pts.length - 1 ? 0.15 * cam.pulse : 0);
    const s = art.checkpoint;
    ctx.drawImage(
      s.c,
      c.x * u + cam.ox - (s.w * z) / 2,
      cam.oy - c.y * u - (s.h * z) / 2,
      s.w * z,
      s.h * z
    );
  }
}
