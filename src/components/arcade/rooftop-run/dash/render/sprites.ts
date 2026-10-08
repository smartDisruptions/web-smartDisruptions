/**
 * The level's art, baked once per canvas scale (and per theme where the
 * palette matters) into offscreen sprites. objects.ts only ever blits these.
 *
 * Sprites are drawn in canvas pixels with `ppu` pixels per block, and each
 * baker works in blocks (it scales its context by ppu first).
 *
 * Two families:
 *  - ThemeArt: things whose colours come from the palette (roofs, blocks,
 *    hazards, signs, decoration, the corridor). One set per theme in play.
 *  - CommonArt: things whose colour IS their meaning (orbs, drums, gates,
 *    wind chevrons, scrolls, the finish). One set, any theme.
 */
import type {
  BlockStyle,
  DecoObj,
  ModeId,
  OrbColor,
  PadColor,
  RoofStyle,
  SpeedId,
} from '../types';
import { hipRoof } from './backdrop';
import type { Palette } from './themes';
import {
  TAU,
  bakeSprite,
  blank,
  glowSprite,
  mix,
  mulberry32,
  rgba,
  shade,
  type Sprite,
} from './util';

// ── Colours that mean something (never used for scenery) ──────────────────

// Kiru's own colour code (2026-10-07): each lantern and drum is named for
// what it does, and coloured from the town's palette.
export const ORB_COL: Record<OrbColor, string> = {
  jump: '#ff6a3d', // vermilion
  hop: '#3fd6a6', // jade
  leap: '#ffc53d', // gold
  flip: '#a77bff', // wisteria
  spin: '#ff8fc8', // sakura
  slam: '#2a2f5e', // night indigo
};
export const PAD_COL: Record<PadColor, string> = {
  jump: '#ff6a3d',
  hop: '#3fd6a6',
  leap: '#ffc53d',
  flip: '#a77bff',
};
// Speed runs cool to hot: indigo, paper, gold, ember, crimson.
export const SPEED_COL: Record<SpeedId, string> = {
  slow: '#8fa3ff',
  normal: '#f4efe2',
  fast: '#ffd166',
  faster: '#ff8a3d',
  fastest: '#ff2f6d',
};
// One chevron per step of speed, so the count reads as the speed.
export const SPEED_N: Record<SpeedId, number> = {
  slow: 1,
  normal: 2,
  fast: 3,
  faster: 4,
  fastest: 5,
};
// `finish` is the gold veil over the finish line; no gate uses it.
export const GATE_COL = {
  mode: '#ff4a2a',
  flip: '#a77bff',
  upright: '#3fd6a6',
  finish: '#ffd23f',
};
export type GateTint = keyof typeof GATE_COL;

/** Colour-blind-safe marks: each orb and drum colour has its own shape. */
type Glyph = 'up1' | 'up0' | 'up2' | 'flip' | 'spin' | 'down';
const ORB_GLYPH: Record<OrbColor, Glyph> = {
  jump: 'up1',
  hop: 'up0',
  leap: 'up2',
  flip: 'flip',
  spin: 'spin',
  slam: 'down',
};

/** Draw a glyph centred on (cx, cy), about `s` across, as strokes. */
function glyph(
  g: CanvasRenderingContext2D,
  k: Glyph,
  cx: number,
  cy: number,
  s: number
) {
  const h = s / 2;
  g.beginPath();
  const chev = (y: number, w: number, up: boolean) => {
    const d = up ? -1 : 1;
    g.moveTo(cx - w, y - d * w * 0.55);
    g.lineTo(cx, y + d * w * 0.55);
    g.lineTo(cx + w, y - d * w * 0.55);
  };
  if (k === 'up1') chev(cy + h * 0.05, h * 0.8, true);
  else if (k === 'up0') {
    chev(cy - h * 0.15, h * 0.55, true);
    g.moveTo(cx - h * 0.55, cy + h * 0.55);
    g.lineTo(cx + h * 0.55, cy + h * 0.55);
  } else if (k === 'up2') {
    chev(cy - h * 0.3, h * 0.72, true);
    chev(cy + h * 0.42, h * 0.72, true);
  } else if (k === 'down') {
    chev(cy - h * 0.12, h * 0.75, false);
    g.moveTo(cx - h * 0.75, cy + h * 0.68);
    g.lineTo(cx + h * 0.75, cy + h * 0.68);
  } else if (k === 'flip') {
    const ax = cx - h * 0.42;
    const bx = cx + h * 0.42;
    g.moveTo(ax, cy + h * 0.85);
    g.lineTo(ax, cy - h * 0.75);
    g.moveTo(ax - h * 0.32, cy - h * 0.4);
    g.lineTo(ax, cy - h * 0.8);
    g.lineTo(ax + h * 0.32, cy - h * 0.4);
    g.moveTo(bx, cy - h * 0.85);
    g.lineTo(bx, cy + h * 0.75);
    g.moveTo(bx - h * 0.32, cy + h * 0.4);
    g.lineTo(bx, cy + h * 0.8);
    g.lineTo(bx + h * 0.32, cy + h * 0.4);
  } else {
    // spin: a circling arrow (flip, then jump).
    g.arc(cx, cy, h * 0.62, -Math.PI * 0.35, Math.PI * 1.25);
    const ex = cx + Math.cos(-Math.PI * 0.35) * h * 0.62;
    const ey = cy + Math.sin(-Math.PI * 0.35) * h * 0.62;
    g.moveTo(ex - h * 0.42, ey - h * 0.12);
    g.lineTo(ex + h * 0.02, ey + h * 0.02);
    g.lineTo(ex - h * 0.08, ey + h * 0.46);
  }
  g.stroke();
}

// ── Theme art ─────────────────────────────────────────────────────────────

export interface RoofArt {
  /** Upper facade under the cap, and the repeating lower storeys. */
  upper: Sprite;
  lower: Sprite;
  /** The tiled cap, its left and right ends (with the curl). */
  cap: Sprite;
  endL: Sprite;
  endR: Sprite;
  /** Blocks: cap thickness, upper facade height, lower storey height, tile width. */
  capH: number;
  upperH: number;
  lowerH: number;
  tileW: number;
}

export interface ThemeArt {
  pal: Palette;
  ppu: number;
  roofs: Partial<Record<RoofStyle, RoofArt>>;
  blocks: Map<string, Sprite>;
  /** Spikes by dir (up, down, left, right) × size (full, small). */
  spikes: Sprite[];
  saws: Map<number, Sprite>;
  crow: Sprite[];
  lantern: Sprite;
  vents: Map<number, Sprite>;
  texts: Map<string, Sprite>;
  deco: Map<string, Sprite>;
  eave: Sprite;
  beam: Sprite;
  /** How many of the palette's base sprites are baked (see bakeBase). */
  base: number;
  /** Roof styles part-way baked: parts done, and the art so far. */
  pending: Map<RoofStyle, { n: number; art: Partial<RoofArt> }>;
}

export const ROOF_TILE_W = 6;

function windowPanel(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lit: boolean,
  p: Palette,
  lattice: boolean
) {
  g.fillStyle = lit ? p.win : p.winDim;
  g.fillRect(x, y, w, h);
  if (lit) {
    g.fillStyle = rgba('#ffffff', 0.18);
    g.fillRect(x, y, w, h * 0.35);
  }
  g.strokeStyle = lit ? rgba(p.wood, 0.85) : rgba('#000000', 0.35);
  g.lineWidth = 0.035;
  g.beginPath();
  if (lattice) {
    for (let k = 1; k < 3; k++) {
      g.moveTo(x + (w * k) / 3, y);
      g.lineTo(x + (w * k) / 3, y + h);
    }
    g.moveTo(x, y + h / 2);
    g.lineTo(x + w, y + h / 2);
  } else {
    g.moveTo(x + w / 2, y);
    g.lineTo(x + w / 2, y + h);
  }
  g.stroke();
  g.strokeStyle = p.wood;
  g.lineWidth = 0.06;
  g.strokeRect(x, y, w, h);
}

/**
 * One part of a roof style's art (0 the upper facade, 1 the lower storeys,
 * 2 the cap and its curled ends), into `into`: three small bakes, so a
 * theme baked ahead of time never stalls a frame.
 */
function bakeRoof(
  style: RoofStyle,
  p: Palette,
  ppu: number,
  seed: number,
  part: number,
  into: Partial<RoofArt>
) {
  const r = mulberry32(seed + part * 31);
  const T = ROOF_TILE_W;
  const capH =
    style === 'pagoda'
      ? 0.62
      : style === 'shrine'
        ? 0.58
        : style === 'flat'
          ? 0.34
          : 0.5;
  const upperH = 3.2;
  const lowerH = 2.4;
  const kura = style === 'warehouse';
  const plasterWall = kura || style === 'shrine' || style === 'pagoda';
  const wallCol = plasterWall ? mix(p.wall, p.plaster, 0.55) : p.wall;

  into.capH = capH;
  into.upperH = upperH;
  into.lowerH = lowerH;
  into.tileW = T;
  if (part === 0)
    into.upper = bakeSprite(T * ppu, upperH * ppu, 0, 0, (g) => {
      g.scale(ppu, ppu);
      g.fillStyle = wallCol;
      g.fillRect(0, 0, T, upperH);
      // The eave's shadow.
      const sh = g.createLinearGradient(0, 0, 0, 0.7);
      sh.addColorStop(0, rgba('#000000', 0.55));
      sh.addColorStop(1, rgba('#000000', 0));
      g.fillStyle = sh;
      g.fillRect(0, 0, T, 0.7);
      if (style === 'pagoda' || style === 'shrine') {
        // Vermilion brackets under the eave.
        g.fillStyle = shade(p.trim, -0.25);
        g.fillRect(0, 0.05, T, 0.3);
        g.fillStyle = p.trim;
        for (let x = 0.15; x < T; x += 0.6) g.fillRect(x, 0.08, 0.32, 0.22);
        g.fillStyle = rgba('#000000', 0.4);
        g.fillRect(0, 0.35, T, 0.06);
        // Pillars.
        g.fillStyle = shade(p.trim, -0.15);
        for (let x = 0; x < T; x += 2) g.fillRect(x + 0.05, 0.4, 0.22, upperH);
        for (let x = 0; x < T; x += 2) {
          if (style === 'pagoda') {
            const lit = r() < 0.55;
            g.fillStyle = lit ? p.win : p.winDim;
            g.beginPath();
            g.arc(x + 1.15, 1.45, 0.42, 0, TAU);
            g.fill();
            g.strokeStyle = p.wood;
            g.lineWidth = 0.07;
            g.stroke();
            g.beginPath();
            g.moveTo(x + 1.15, 1.03);
            g.lineTo(x + 1.15, 1.87);
            g.moveTo(x + 0.73, 1.45);
            g.lineTo(x + 1.57, 1.45);
            g.lineWidth = 0.04;
            g.stroke();
          } else {
            windowPanel(g, x + 0.55, 0.85, 1.2, 1.1, r() < 0.5, p, true);
          }
        }
        g.fillStyle = shade(p.trim, -0.2);
        g.fillRect(0, 2.45, T, 0.16);
      } else if (kura) {
        g.fillStyle = rgba('#ffffff', 0.04);
        g.fillRect(0, 0.6, T, 0.05);
        for (let x = 0; x < T; x += 3) {
          const lit = r() < 0.4;
          g.fillStyle = p.wallDark;
          g.fillRect(x + 1.02, 0.88, 0.96, 0.84);
          windowPanel(g, x + 1.1, 0.95, 0.8, 0.7, lit, p, false);
          g.fillStyle = shade(wallCol, -0.25);
          for (let k = 0; k < 3; k++)
            g.fillRect(x + 1.2 + k * 0.28, 0.95, 0.06, 0.7);
        }
        // A painted crest.
        g.strokeStyle = rgba(p.wallDark, 0.7);
        g.lineWidth = 0.09;
        g.beginPath();
        g.arc(T - 1.5, 2.35, 0.36, 0, TAU);
        g.moveTo(T - 1.5 - 0.22, 2.35);
        g.lineTo(T - 1.5 + 0.22, 2.35);
        g.stroke();
      } else if (style === 'flat') {
        // Concrete, a grid of windows, an air-conditioner.
        g.fillStyle = rgba('#000000', 0.25);
        g.fillRect(0, 0, T, 0.12);
        for (let x = 0.3; x < T - 0.3; x += 1.5) {
          windowPanel(g, x, 0.75, 0.95, 0.9, r() < 0.45, p, false);
          g.fillStyle = rgba('#000000', 0.25);
          g.fillRect(x - 0.05, 1.68, 1.05, 0.08);
        }
        g.fillStyle = shade(p.plaster, -0.1);
        g.fillRect(2.05, 2.1, 0.8, 0.55);
        g.strokeStyle = p.wallDark;
        g.lineWidth = 0.05;
        g.beginPath();
        g.arc(2.45, 2.38, 0.2, 0, TAU);
        g.stroke();
        g.fillStyle = rgba('#000000', 0.3);
        g.fillRect(0, 2.95, T, 0.08);
      } else {
        // tiles: a machiya front, wooden posts and lit shoji.
        g.fillStyle = p.wood;
        for (let x = 0; x < T; x += 2) g.fillRect(x, 0.3, 0.14, upperH);
        g.fillRect(0, 2.1, T, 0.12);
        for (let x = 0; x < T; x += 2) {
          const kind = r();
          if (kind < 0.55)
            windowPanel(g, x + 0.4, 0.75, 1.25, 1.05, kind < 0.4, p, true);
          else {
            // A shop's noren: a split curtain over a lit doorway.
            g.fillStyle = rgba(p.win, 0.55);
            g.fillRect(x + 0.4, 0.75, 1.25, 1.25);
            g.fillStyle = mix(p.trim, p.wall, 0.35);
            for (let k = 0; k < 3; k++)
              g.fillRect(x + 0.42 + k * 0.41, 0.72, 0.37, 0.62);
            g.fillStyle = rgba(p.plaster, 0.85);
            g.beginPath();
            g.arc(x + 1.025, 1.0, 0.11, 0, TAU);
            g.fill();
          }
        }
      }
      if (p.id === 'lanterns' || p.id === 'sakura') {
        // Festival lanterns hung along the eave (lit paper, no halo: scenery).
        for (let x = 0.75; x < T; x += 1.5) {
          g.strokeStyle = rgba('#000000', 0.5);
          g.lineWidth = 0.03;
          g.beginPath();
          g.moveTo(x, 0.02);
          g.lineTo(x, 0.22);
          g.stroke();
          g.fillStyle = p.lamp[Math.round(x) % 2];
          g.beginPath();
          g.ellipse(x, 0.42, 0.15, 0.2, 0, 0, TAU);
          g.fill();
          g.fillStyle = rgba('#ffffff', 0.25);
          g.fillRect(x - 0.05, 0.3, 0.04, 0.22);
          g.fillStyle = rgba('#000000', 0.45);
          g.fillRect(x - 0.1, 0.21, 0.2, 0.04);
          g.fillRect(x - 0.1, 0.6, 0.2, 0.04);
        }
      }
      if (style === 'tiles' || style === 'flat') {
        // A shop sign: a hanging board with brushed marks (no lettering:
        // Japanese characters are never a font here).
        // It hangs in a gap between window bays.
        const sx = style === 'tiles' ? 3.83 : 4.52;
        const hw = style === 'tiles' ? 0.15 : 0.19;
        g.fillStyle = rgba('#000000', 0.45);
        g.fillRect(sx - hw + 0.03, 0.62, hw * 2, 1.62);
        g.fillStyle =
          style === 'flat' ? shade(p.iron, 0.1) : mix(p.wood, '#c9a46a', 0.55);
        g.fillRect(sx - hw, 0.58, hw * 2, 1.6);
        g.strokeStyle =
          style === 'flat'
            ? mix(p.neon[0], p.wall, 0.25)
            : rgba('#1a1014', 0.85);
        g.lineWidth = 0.05;
        g.beginPath();
        for (let k = 0; k < 3; k++) {
          const y = 0.78 + k * 0.48;
          g.moveTo(sx - hw * 0.6, y);
          g.lineTo(sx + hw * 0.55, y + 0.04);
          g.moveTo(sx - 0.02, y - 0.06);
          g.lineTo(sx, y + 0.3);
          g.moveTo(sx - hw * 0.5, y + 0.22);
          g.lineTo(sx + hw * 0.6, y + 0.18);
        }
        g.stroke();
        g.strokeStyle = rgba(p.wallLit, 0.5);
        g.lineWidth = 0.025;
        g.strokeRect(sx - hw, 0.58, hw * 2, 1.6);
      }
      // The wall catches a little light on its left.
      g.fillStyle = rgba(p.wallLit, 0.25);
      g.fillRect(0, 0, 0.06, upperH);
    });

  if (part === 1)
    into.lower = bakeSprite(T * ppu, lowerH * ppu, 0, 0, (g) => {
      g.scale(ppu, ppu);
      g.fillStyle = kura ? p.wallDark : shade(wallCol, -0.12);
      g.fillRect(0, 0, T, lowerH);
      if (kura) {
        // Namako: dark tiles held by a white diamond lattice.
        g.strokeStyle = rgba(p.plaster, 0.75);
        g.lineWidth = 0.07;
        g.beginPath();
        for (let k = -lowerH; k < T + lowerH; k += 0.6) {
          g.moveTo(k, 0);
          g.lineTo(k + lowerH, lowerH);
          g.moveTo(k + lowerH, 0);
          g.lineTo(k, lowerH);
        }
        g.stroke();
        return;
      }
      for (let x = 0; x < T; x += 2) {
        const lit = r() < (style === 'flat' ? 0.4 : 0.3);
        if (style === 'flat')
          windowPanel(g, x + 0.3, 0.6, 0.95, 0.9, lit, p, false);
        else if (r() < 0.7)
          windowPanel(g, x + 0.45, 0.55, 1.1, 0.95, lit, p, true);
      }
      g.fillStyle = style === 'flat' ? rgba('#000000', 0.25) : p.wood;
      if (style !== 'flat')
        for (let x = 0; x < T; x += 2) g.fillRect(x, 0, 0.14, lowerH);
      g.fillRect(0, lowerH - 0.12, T, 0.12);
    });

  if (part !== 2) return;
  const capCol = style === 'shrine' ? mix(p.cap, '#7a4a2a', 0.6) : p.cap;
  const capArt = (g: CanvasRenderingContext2D, w: number) => {
    g.scale(ppu, ppu);
    g.fillStyle = capCol;
    g.fillRect(0, 0, w, capH);
    if (style === 'flat') {
      g.fillStyle = mix(p.plaster, p.capLit, 0.3);
      g.fillRect(0, 0, w, capH * 0.55);
      g.fillStyle = rgba('#000000', 0.45);
      g.fillRect(0, capH * 0.55, w, capH * 0.12);
      for (let x = 0.5; x < w; x += 1) g.fillRect(x, 0.04, 0.03, capH * 0.45);
    } else if (style === 'shrine') {
      const gr = g.createLinearGradient(0, 0, 0, capH);
      gr.addColorStop(0, shade(capCol, 0.25));
      gr.addColorStop(1, shade(capCol, -0.35));
      g.fillStyle = gr;
      g.fillRect(0, 0, w, capH);
      g.fillStyle = rgba('#000000', 0.25);
      for (let x = 0.25; x < w; x += 0.5)
        g.fillRect(x, 0.1, 0.025, capH - 0.25);
      g.fillStyle = '#d9b25e';
      g.fillRect(0, capH - 0.15, w, 0.06);
      g.fillStyle = rgba('#000000', 0.4);
      g.fillRect(0, capH - 0.09, w, 0.09);
    } else {
      // Kawara: rows of round tile ends along the eave.
      g.fillStyle = rgba(p.capLit, 0.2);
      g.fillRect(0, 0.06, w, 0.06);
      g.strokeStyle = rgba(p.capLit, 0.55);
      g.lineWidth = 0.05;
      g.beginPath();
      const step = 0.3;
      for (let x = 0; x < w; x += step) {
        g.moveTo(x + step, capH - 0.16);
        g.arc(x + step / 2, capH - 0.16, step / 2, 0, Math.PI);
      }
      g.stroke();
      g.fillStyle = rgba('#000000', 0.3);
      for (let x = 0; x < w; x += step) g.fillRect(x, 0.16, 0.03, capH - 0.32);
      if (style === 'pagoda') {
        g.fillStyle = rgba(p.trim, 0.9);
        g.fillRect(0, capH - 0.06, w, 0.06);
      }
    }
  };
  into.cap = bakeSprite(2 * ppu, capH * ppu, 0, 0, (g) => capArt(g, 2));
  // The ends: the cap curls up a little past the wall, never above the
  // running line, so the edge he must jump from stays exact.
  const curl = 0.32;
  const end = (left: boolean) =>
    bakeSprite(
      (curl + 0.6) * ppu,
      (capH + 0.1) * ppu,
      left ? curl * ppu : 0.6 * ppu,
      0,
      (g) => {
        g.scale(ppu, ppu);
        if (left) {
          g.translate(curl + 0.6, 0);
          g.scale(-1, 1);
        }
        g.fillStyle = shade(capCol, -0.1);
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(0.6, 0);
        g.quadraticCurveTo(0.6 + curl * 0.6, capH * 0.35, 0.6 + curl, 0.02);
        g.lineTo(0.6 + curl * 0.75, capH * 0.75);
        g.quadraticCurveTo(0.5, capH * 1.05, 0, capH);
        g.closePath();
        g.fill();
        g.strokeStyle = rgba(p.capLit, 0.5);
        g.lineWidth = 0.05;
        g.beginPath();
        g.moveTo(0.55, capH * 0.5);
        g.quadraticCurveTo(
          0.6 + curl * 0.5,
          capH * 0.5,
          0.6 + curl * 0.95,
          0.06
        );
        g.stroke();
      }
    );
  into.endL = end(true);
  into.endR = end(false);
}

/** A solid block, w × h blocks, in its style. */
function bakeBlock(
  style: BlockStyle,
  w: number,
  h: number,
  p: Palette,
  ppu: number
): Sprite {
  const m = 0.12;
  return bakeSprite(
    (w + m * 2) * ppu,
    (h + m * 2) * ppu,
    m * ppu,
    m * ppu,
    (g) => {
      g.scale(ppu, ppu);
      g.translate(m, m);
      const r = mulberry32(Math.round(w * 31 + h * 7 + style.length));
      const body = (c: string) => {
        g.fillStyle = c;
        g.fillRect(0, 0, w, h);
      };
      g.lineWidth = 0.06;
      if (style === 'crate') {
        body(mix(p.wood, '#7a4a2a', 0.45));
        g.strokeStyle = rgba('#000000', 0.4);
        g.beginPath();
        for (let y = 0.25; y < h; y += 0.25) {
          g.moveTo(0, y);
          g.lineTo(w, y);
        }
        g.stroke();
        g.strokeStyle = mix(p.wood, '#a8743e', 0.35);
        g.lineWidth = 0.14;
        for (let x = 0; x < w - 0.01; x += 1) {
          g.strokeRect(x + 0.1, 0.1, 0.8, h - 0.2);
          g.beginPath();
          g.moveTo(x + 0.15, h - 0.15);
          g.lineTo(x + 0.85, 0.15);
          g.stroke();
        }
      } else if (style === 'tank') {
        const gr = g.createLinearGradient(0, 0, w, 0);
        gr.addColorStop(0, shade(p.ironLit, 0.1));
        gr.addColorStop(0.35, mix(p.ironLit, p.plaster, 0.5));
        gr.addColorStop(1, p.wallDark);
        g.fillStyle = gr;
        g.fillRect(0, 0.3, w, h - 0.3);
        g.beginPath();
        g.ellipse(w / 2, 0.3, w / 2, 0.3, 0, Math.PI, TAU);
        g.fill();
        g.fillStyle = rgba('#000000', 0.35);
        for (let y = 0.9; y < h; y += 0.8) g.fillRect(0, y, w, 0.08);
        g.fillStyle = rgba('#ffffff', 0.12);
        g.fillRect(w * 0.18, 0.4, 0.1, h - 0.6);
      } else if (style === 'beam') {
        body(mix(p.wood, '#5a3a24', 0.4));
        g.strokeStyle = rgba('#000000', 0.25);
        g.lineWidth = 0.035;
        g.beginPath();
        for (let k = 0; k < h * 4; k++) {
          const y = 0.12 + r() * (h - 0.24);
          g.moveTo(0.1 + r() * 0.3, y);
          g.lineTo(w - 0.1 - r() * 0.3, y + (r() - 0.5) * 0.06);
        }
        g.stroke();
        g.fillStyle = mix(p.ironLit, '#000000', 0.2);
        for (const x of [0.12, w - 0.36]) {
          g.fillRect(x, 0.05, 0.24, h - 0.1);
          g.fillStyle = rgba('#ffffff', 0.25);
          g.fillRect(x + 0.06, 0.2, 0.08, 0.08);
          g.fillRect(x + 0.06, h - 0.3, 0.08, 0.08);
          g.fillStyle = mix(p.ironLit, '#000000', 0.2);
        }
      } else if (style === 'stone') {
        body(mix(p.wallDark, p.plaster, 0.35));
        g.strokeStyle = rgba('#000000', 0.45);
        g.lineWidth = 0.06;
        for (let y = 0; y < h - 0.01; y += 0.5) {
          let x = (y * 2) % 2 ? -0.3 : 0;
          while (x < w) {
            const sw = 0.6 + r() * 0.5;
            g.fillStyle = mix(p.plaster, p.wallDark, 0.3 + r() * 0.4);
            g.fillRect(x + 0.03, y + 0.03, sw - 0.06, 0.44);
            g.strokeRect(x + 0.03, y + 0.03, sw - 0.06, 0.44);
            x += sw;
          }
        }
      } else if (style === 'chimney') {
        body(mix(p.wallDark, '#6a2a22', 0.4));
        g.fillStyle = rgba('#000000', 0.3);
        for (let y = 0.3; y < h; y += 0.3) {
          g.fillRect(0, y, w, 0.04);
          const off = (y * 10) % 2 < 1 ? 0.25 : 0.55;
          for (let x = off; x < w; x += 0.6) g.fillRect(x, y - 0.3, 0.04, 0.3);
        }
        g.fillStyle = mix(p.ironLit, '#000000', 0.3);
        g.fillRect(-0.08, 0, w + 0.16, 0.22);
      } else if (style === 'bridge') {
        body(rgba(p.wallDark, 0.0));
        g.fillStyle = mix(p.wood, '#6a3a22', 0.4);
        g.fillRect(0, 0, w, Math.min(0.4, h));
        g.fillStyle = shade(p.trim, -0.15);
        for (let x = 0.2; x < w; x += 1) g.fillRect(x, 0.4, 0.14, h - 0.4);
        g.fillRect(0, h - 0.14, w, 0.14);
        g.strokeStyle = shade(p.trim, -0.35);
        g.lineWidth = 0.08;
        g.beginPath();
        for (let x = 0.2; x < w - 1; x += 1) {
          g.moveTo(x + 0.14, 0.45);
          g.lineTo(x + 1, h - 0.15);
        }
        g.stroke();
      } else if (style === 'wall') {
        body(mix(p.wall, p.plaster, 0.6));
        g.fillStyle = rgba('#000000', 0.18);
        for (let x = 1; x < w; x += 1)
          g.fillRect(x - 0.02, 0.35, 0.04, h - 0.35);
        g.fillStyle = p.cap;
        g.fillRect(-0.06, 0, w + 0.12, 0.3);
        g.fillStyle = rgba(p.capLit, 0.5);
        g.fillRect(-0.06, 0.24, w + 0.12, 0.05);
      } else {
        // tiles: a little roof.
        body(p.wall);
        g.fillStyle = p.cap;
        g.fillRect(0, 0, w, Math.min(0.5, h));
        g.strokeStyle = rgba(p.capLit, 0.5);
        g.lineWidth = 0.05;
        g.beginPath();
        for (let x = 0; x < w; x += 0.3) {
          g.moveTo(x + 0.3, 0.34);
          g.arc(x + 0.15, 0.34, 0.15, 0, Math.PI);
        }
        g.stroke();
        if (h > 1.2) {
          for (let x = 0.3; x < w - 0.5; x += 1.2)
            windowPanel(
              g,
              x,
              0.8,
              0.6,
              Math.min(0.6, h - 1.1),
              r() < 0.5,
              p,
              true
            );
        }
      }
      // Every solid: an inner shadow, a dark outline, then a clear edge in the
      // theme's running-line colour (the top line itself is drawn per frame).
      const sh = g.createLinearGradient(0, 0, 0, h);
      sh.addColorStop(0, rgba('#000000', 0));
      sh.addColorStop(1, rgba('#000000', 0.3));
      g.fillStyle = sh;
      g.fillRect(0, 0, w, h);
      g.strokeStyle = rgba('#000000', 0.6);
      g.lineWidth = 0.14;
      g.strokeRect(-0.02, -0.02, w + 0.04, h + 0.04);
      g.strokeStyle = rgba(p.edge, 0.7);
      g.lineWidth = 0.06;
      g.strokeRect(0.03, 0.03, w - 0.06, h - 0.06);
    }
  );
}

/**
 * Iron caltrops (makibishi): a tall prong standing on two splayed legs, in
 * dark iron with a white rim light and a hot glint at the point. Baked
 * pointing up, then turned for the other three directions. dir 0 up, 1
 * down, 2 left, 3 right. Small ones are half as tall.
 */
function bakeSpike(
  dir: number,
  small: boolean,
  p: Palette,
  ppu: number
): Sprite {
  const m = 0.14;
  const S = 1 + m * 2;
  return bakeSprite(S * ppu, S * ppu, m * ppu, m * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(m + 0.5, m + 0.5);
    g.rotate([0, Math.PI, -Math.PI / 2, Math.PI / 2][dir]);
    g.translate(-0.5, -0.5);
    const tall = small ? 0.5 : 0.98;
    const base = 1;
    const tip = base - tall;
    const jy = base - tall * 0.3; // where the legs meet the prong
    const hw = small ? 0.26 : 0.22; // the prong's half-width where the legs meet
    const shape = () => {
      g.beginPath();
      g.moveTo(0.5, tip);
      g.lineTo(0.5 + hw, jy);
      g.lineTo(0.98, base);
      g.lineTo(0.68, base);
      g.lineTo(0.5, base - tall * 0.13);
      g.lineTo(0.32, base);
      g.lineTo(0.02, base);
      g.lineTo(0.5 - hw, jy);
      g.closePath();
    };
    // A dark halo, so it reads against any sky.
    shape();
    g.strokeStyle = rgba('#000000', 0.6);
    g.lineWidth = 0.2;
    g.stroke();
    g.fillStyle = p.iron;
    g.fill();
    // The lit facet: the left half of the prong and the left leg.
    g.fillStyle = p.ironLit;
    g.beginPath();
    g.moveTo(0.5, tip);
    g.lineTo(0.5 - hw, jy);
    g.lineTo(0.02, base);
    g.lineTo(0.32, base);
    g.lineTo(0.5, base - tall * 0.13);
    g.closePath();
    g.fill();
    // Rim light.
    shape();
    g.strokeStyle = p.rim;
    g.lineWidth = 0.055;
    g.stroke();
    // A hot glint at the point.
    g.strokeStyle = p.hot;
    g.lineWidth = 0.06;
    g.beginPath();
    g.moveTo(0.5 - 0.07, tip + tall * 0.2);
    g.lineTo(0.5, tip + 0.03);
    g.lineTo(0.5 + 0.07, tip + tall * 0.2);
    g.stroke();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(0.5, tip + 0.035, 0.045, 0, TAU);
    g.fill();
  });
}

/**
 * A giant shuriken: four swept blades of dark steel around a ring, a white
 * rim, a bright bevel on each blade's leading edge.
 */
function bakeSaw(r: number, p: Palette, ppu: number): Sprite {
  const R = r * 1.05;
  const S = R * 2 + 0.4;
  return bakeSprite(S * ppu, S * ppu, (S / 2) * ppu, (S / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(S / 2, S / 2);
    const blades = () => {
      g.beginPath();
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU;
        const tip = [Math.cos(a) * R, Math.sin(a) * R];
        const back = a - TAU / 8;
        const fwd = a + TAU / 8;
        // From the hub, sweep out to the tip along a curved leading edge,
        // then back in along a straighter trailing edge.
        const h0 = [Math.cos(back) * R * 0.3, Math.sin(back) * R * 0.3];
        const h1 = [Math.cos(fwd) * R * 0.3, Math.sin(fwd) * R * 0.3];
        if (k === 0) g.moveTo(h0[0], h0[1]);
        else g.lineTo(h0[0], h0[1]);
        g.quadraticCurveTo(
          Math.cos(a - 0.45) * R * 0.78,
          Math.sin(a - 0.45) * R * 0.78,
          tip[0],
          tip[1]
        );
        g.quadraticCurveTo(
          Math.cos(a + 0.2) * R * 0.5,
          Math.sin(a + 0.2) * R * 0.5,
          h1[0],
          h1[1]
        );
      }
      g.closePath();
    };
    blades();
    g.strokeStyle = rgba('#000000', 0.6);
    g.lineWidth = 0.24;
    g.stroke();
    const gr = g.createRadialGradient(-R * 0.25, -R * 0.3, R * 0.05, 0, 0, R);
    gr.addColorStop(0, shade(p.ironLit, 0.35));
    gr.addColorStop(0.55, p.ironLit);
    gr.addColorStop(1, p.iron);
    g.fillStyle = gr;
    g.fill();
    g.strokeStyle = p.rim;
    g.lineWidth = 0.055;
    g.stroke();
    // A bright bevel just inside each leading edge, and a hot point.
    g.strokeStyle = rgba('#ffffff', 0.5);
    g.lineWidth = 0.05;
    g.beginPath();
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      g.moveTo(
        Math.cos(a - TAU / 8) * R * 0.36,
        Math.sin(a - TAU / 8) * R * 0.36
      );
      g.quadraticCurveTo(
        Math.cos(a - 0.38) * R * 0.74,
        Math.sin(a - 0.38) * R * 0.74,
        Math.cos(a) * R * 0.9,
        Math.sin(a) * R * 0.9
      );
    }
    g.stroke();
    g.fillStyle = p.hot;
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      g.beginPath();
      g.arc(Math.cos(a) * R * 0.93, Math.sin(a) * R * 0.93, 0.05, 0, TAU);
      g.fill();
    }
    // The hub ring.
    g.fillStyle = p.iron;
    g.beginPath();
    g.arc(0, 0, R * 0.26, 0, TAU);
    g.fill();
    g.strokeStyle = p.rim;
    g.lineWidth = 0.05;
    g.stroke();
    g.fillStyle = rgba('#000000', 0.95);
    g.beginPath();
    g.arc(0, 0, R * 0.11, 0, TAU);
    g.fill();
  });
}

/**
 * A crow on the wing, facing left (toward Kiru): `flap` from -1 (wings
 * down) to 1 (wings up). Glossy black with a moonlit rim along its back and
 * a bright eye.
 */
function bakeCrow(flap: number, p: Palette, ppu: number): Sprite {
  const S = 2.3;
  return bakeSprite(S * ppu, S * ppu, (S / 2) * ppu, (S / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(S / 2, S / 2);
    g.scale(1.3, 1.3);
    const body = shade(p.iron, -0.15);
    const wingY = -flap * 0.42;
    const wing = (dx: number, lift: number, col: string) => {
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(-0.12 + dx, -0.06);
      g.quadraticCurveTo(0.05 + dx, -0.1 + lift * 0.5, 0.18 + dx, lift - 0.02);
      // Feather tips.
      g.lineTo(0.3 + dx, lift + 0.06);
      g.lineTo(0.36 + dx, lift + 0.0);
      g.lineTo(0.44 + dx, lift + 0.1);
      g.lineTo(0.48 + dx, lift + 0.05);
      g.quadraticCurveTo(0.4 + dx, -0.02 + lift * 0.3, 0.2 + dx, 0.06);
      g.closePath();
      g.fill();
    };
    // The far wing, a little darker, a beat behind.
    wing(0.06, -flap * 0.32 - 0.04, shade(body, -0.3));
    // Body, head and tail as one silhouette.
    const sil = () => {
      g.beginPath();
      g.moveTo(-0.52, -0.1); // beak tip
      g.lineTo(-0.36, -0.16);
      g.quadraticCurveTo(-0.32, -0.3, -0.2, -0.27); // crown
      g.quadraticCurveTo(-0.06, -0.2, 0.08, -0.12); // back
      g.quadraticCurveTo(0.3, -0.08, 0.5, -0.12); // to the tail
      g.lineTo(0.62, -0.04);
      g.lineTo(0.5, 0.0);
      g.quadraticCurveTo(0.2, 0.18, -0.08, 0.12); // belly
      g.quadraticCurveTo(-0.26, 0.08, -0.34, -0.05);
      g.lineTo(-0.52, -0.06);
      g.closePath();
    };
    sil();
    g.strokeStyle = rgba('#000000', 0.6);
    g.lineWidth = 0.12;
    g.stroke();
    g.fillStyle = body;
    g.fill();
    // Rim light along the head and back.
    g.strokeStyle = p.rim;
    g.lineWidth = 0.04;
    g.beginPath();
    g.moveTo(-0.36, -0.16);
    g.quadraticCurveTo(-0.32, -0.3, -0.2, -0.27);
    g.quadraticCurveTo(-0.06, -0.2, 0.08, -0.12);
    g.quadraticCurveTo(0.3, -0.08, 0.5, -0.12);
    g.stroke();
    // Beak and eye.
    g.fillStyle = '#ffb547';
    g.beginPath();
    g.moveTo(-0.56, -0.08);
    g.lineTo(-0.36, -0.17);
    g.lineTo(-0.38, -0.05);
    g.closePath();
    g.fill();
    g.fillStyle = p.hot;
    g.beginPath();
    g.arc(-0.27, -0.17, 0.045, 0, TAU);
    g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(-0.28, -0.18, 0.016, 0, TAU);
    g.fill();
    // The near wing, rim-lit on its leading edge.
    wing(-0.06, wingY, body);
    g.strokeStyle = p.rim;
    g.lineWidth = 0.035;
    g.beginPath();
    g.moveTo(-0.18, -0.06);
    g.quadraticCurveTo(-0.01, -0.1 + wingY * 0.5, 0.12, wingY - 0.02);
    g.stroke();
  });
}

/**
 * The hanging iron lantern (a hazard): a little hip roof, an iron cage
 * with a hot glow behind its bars, studs around it. The sprite's anchor is
 * the body's centre, where the simulation's hitbox is (physics.LANTERN_R).
 */
function bakeLantern(p: Palette, ppu: number): Sprite {
  const W = 1.5;
  const H = 1.5;
  return bakeSprite(W * ppu, H * ppu, (W / 2) * ppu, (H / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(W / 2, H / 2);
    // Studs: short iron spikes around the cage.
    g.fillStyle = p.iron;
    g.strokeStyle = p.rim;
    g.lineWidth = 0.035;
    for (const [x, y, dx, dy] of [
      [-0.3, 0.02, -0.26, 0],
      [0.3, 0.02, 0.26, 0],
      [-0.24, 0.3, -0.18, 0.16],
      [0.24, 0.3, 0.18, 0.16],
      [0, 0.38, 0, 0.26],
    ]) {
      const nx = -dy;
      const ny = dx;
      const l = Math.hypot(nx, ny) || 1;
      g.beginPath();
      g.moveTo(x + (nx / l) * 0.07, y + (ny / l) * 0.07);
      g.lineTo(x + dx, y + dy);
      g.lineTo(x - (nx / l) * 0.07, y - (ny / l) * 0.07);
      g.closePath();
      g.fill();
      g.stroke();
    }
    // The dark halo.
    g.strokeStyle = rgba('#000000', 0.6);
    g.lineWidth = 0.18;
    g.strokeRect(-0.3, -0.24, 0.6, 0.62);
    // Body: glowing slits between iron bars.
    g.fillStyle = shade(p.hot, -0.4);
    g.fillRect(-0.26, -0.22, 0.52, 0.58);
    g.fillStyle = rgba(p.hot, 0.9);
    g.fillRect(-0.18, -0.12, 0.36, 0.38);
    g.fillStyle = rgba('#ffffff', 0.55);
    g.fillRect(-0.08, -0.04, 0.16, 0.2);
    g.fillStyle = p.iron;
    for (let k = 0; k < 4; k++) g.fillRect(-0.28 + k * 0.17, -0.24, 0.05, 0.62);
    g.fillRect(-0.3, -0.26, 0.6, 0.07);
    g.fillRect(-0.3, 0.3, 0.6, 0.09);
    g.strokeStyle = p.rim;
    g.lineWidth = 0.04;
    g.strokeRect(-0.3, -0.26, 0.6, 0.65);
    // The cap.
    g.fillStyle = p.iron;
    g.beginPath();
    hipRoof(g, 0, -0.26, 0.38, 0.26, 0.06);
    g.fill();
    g.strokeStyle = p.rim;
    g.lineWidth = 0.04;
    g.stroke();
    g.fillStyle = p.iron;
    g.beginPath();
    g.arc(0, -0.56, 0.06, 0, TAU);
    g.fill();
  });
}

/** A vent's grate, flush with the roof: w blocks wide. Anchor: its left end on the surface. */
function bakeVent(w: number, p: Palette, ppu: number): Sprite {
  const m = 0.16;
  return bakeSprite((w + m * 2) * ppu, 0.5 * ppu, m * ppu, 0.36 * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(m, 0.36);
    g.strokeStyle = rgba('#000000', 0.55);
    g.lineWidth = 0.12;
    g.strokeRect(-0.06, -0.2, w + 0.12, 0.22);
    g.fillStyle = p.iron;
    g.fillRect(-0.06, -0.2, w + 0.12, 0.22);
    // Slots, glowing faintly from below.
    g.fillStyle = rgba(p.hot, 0.55);
    for (let x = 0.08; x < w - 0.05; x += 0.2) g.fillRect(x, -0.15, 0.09, 0.12);
    g.strokeStyle = p.rim;
    g.lineWidth = 0.04;
    g.strokeRect(-0.06, -0.2, w + 0.12, 0.22);
  });
}

/** A sign in the world, in the display face. */
export function bakeText(
  text: string,
  size: number,
  font: string,
  p: Palette,
  ppu: number
): Sprite {
  const px = Math.max(8, size * ppu * 0.8);
  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = `400 ${px}px ${font}`;
  const tw = probe.measureText(text).width;
  const w = tw + px * 0.8;
  const h = px * 1.7;
  return bakeSprite(w, h, w / 2, h / 2, (g) => {
    g.font = `400 ${px}px ${font}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.strokeStyle = rgba(p.textShade, 0.8);
    g.lineWidth = px * 0.22;
    g.strokeText(text, w / 2, h / 2 + px * 0.06);
    g.fillStyle = p.text;
    g.fillText(text, w / 2, h / 2);
  });
}

/** Decoration (never collides). Sprites anchor at their base or hook. */
/** The key a decoration's sprite is cached under: the same look, one bake. */
export const decoKey = (o: DecoObj) => `${o.d}|${o.s ?? ''}|${o.flip ? 1 : 0}`;

function bakeDeco(o: DecoObj, p: Palette, ppu: number): Sprite {
  const r = mulberry32(o.d.length * 977 + Math.round((o.s ?? 0) * 31));
  const sil = mix(p.wall, p.wallLit, 0.35);
  const dark = shade(p.wall, -0.2);
  const lit = rgba(p.wallLit, 0.9);
  const flip = o.flip ? -1 : 1;
  const wrap = (
    w: number,
    h: number,
    ax: number,
    ay: number,
    draw: (g: CanvasRenderingContext2D) => void
  ) =>
    bakeSprite(w * ppu, h * ppu, ax * ppu, ay * ppu, (g) => {
      g.scale(ppu, ppu);
      g.translate(ax, ay);
      g.scale(flip, 1);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      draw(g);
    });
  switch (o.d) {
    case 'cat':
      return wrap(1.3, 0.8, 0.65, 0.75, (g) => {
        g.fillStyle = shade(p.iron, 0.05);
        g.beginPath();
        g.ellipse(0, -0.24, 0.42, 0.25, 0, 0, TAU);
        g.moveTo(-0.22, -0.32);
        g.arc(-0.3, -0.36, 0.17, 0, TAU);
        g.fill();
        g.beginPath();
        g.moveTo(-0.44, -0.44);
        g.lineTo(-0.42, -0.62);
        g.lineTo(-0.33, -0.5);
        g.moveTo(-0.27, -0.5);
        g.lineTo(-0.18, -0.62);
        g.lineTo(-0.17, -0.44);
        g.fill();
        g.strokeStyle = shade(p.iron, 0.05);
        g.lineWidth = 0.09;
        g.beginPath();
        g.moveTo(0.38, -0.12);
        g.quadraticCurveTo(0.58, -0.02, 0.4, 0.0);
        g.stroke();
        g.strokeStyle = lit;
        g.lineWidth = 0.03;
        g.beginPath();
        g.ellipse(0, -0.24, 0.42, 0.25, 0, Math.PI * 1.05, Math.PI * 1.7);
        g.stroke();
        g.strokeStyle = rgba(p.win, 0.8);
        g.beginPath();
        g.moveTo(-0.37, -0.37);
        g.lineTo(-0.32, -0.36);
        g.stroke();
      });
    case 'banner': {
      const hgt = o.s ?? 3;
      return wrap(1.2, hgt + 0.3, 0.15, hgt + 0.1, (g) => {
        g.fillStyle = dark;
        g.fillRect(-0.04, -hgt, 0.08, hgt);
        g.fillRect(-0.04, -hgt, 0.72, 0.05);
        g.fillStyle = mix(p.trim, p.wall, 0.5);
        g.fillRect(0.06, -hgt + 0.08, 0.6, hgt * 0.72);
        g.fillStyle = mix(p.plaster, p.wall, 0.2);
        g.beginPath();
        g.arc(0.36, -hgt + 0.55, 0.18, 0, TAU);
        g.fill();
        g.fillStyle = rgba('#000000', 0.35);
        for (let k = 0; k < 3; k++)
          g.fillRect(0.3, -hgt + 0.95 + k * 0.32, 0.12, 0.2);
      });
    }
    case 'bonsai':
      return wrap(1.4, 1.3, 0.7, 1.25, (g) => {
        g.fillStyle = mix(p.trim, p.wallDark, 0.55);
        g.fillRect(-0.32, -0.22, 0.64, 0.22);
        g.fillStyle = dark;
        g.beginPath();
        g.moveTo(-0.05, -0.22);
        g.quadraticCurveTo(-0.25, -0.5, 0.05, -0.7);
        g.quadraticCurveTo(0.2, -0.8, 0.1, -0.22);
        g.fill();
        const leaf = mix('#2f5a3a', p.wall, 0.45);
        for (const [x, y, rr] of [
          [-0.3, -0.75, 0.22],
          [0.15, -0.95, 0.26],
          [0.38, -0.7, 0.18],
        ]) {
          g.fillStyle = leaf;
          g.beginPath();
          g.ellipse(x, y, rr * 1.4, rr * 0.7, 0, 0, TAU);
          g.fill();
          g.fillStyle = rgba(p.wallLit, 0.5);
          g.beginPath();
          g.ellipse(x - 0.03, y - rr * 0.3, rr, rr * 0.3, 0, 0, TAU);
          g.fill();
        }
      });
    case 'laundry': {
      // Washing on a line between two bamboo poles standing on the roof.
      const span = o.s ?? 3;
      const top = 1.7;
      return wrap(span + 0.4, top + 0.3, 0.2, top + 0.15, (g) => {
        g.fillStyle = dark;
        g.fillRect(-0.04, -top, 0.08, top);
        g.fillRect(span - 0.04, -top, 0.08, top);
        g.strokeStyle = dark;
        g.lineWidth = 0.035;
        g.beginPath();
        g.moveTo(0, -top + 0.1);
        g.quadraticCurveTo(span / 2, -top + 0.45, span, -top + 0.1);
        g.stroke();
        const cols = [
          p.plaster,
          mix(p.trim, p.wall, 0.4),
          mix('#3a6aa0', p.wall, 0.4),
          mix(p.win, p.wall, 0.5),
        ];
        for (let x = 0.35; x < span - 0.3; x += 0.55 + r() * 0.3) {
          const u = x / span;
          const y = -top + 0.1 + 0.35 * 4 * u * (1 - u) * 0.5;
          g.fillStyle = cols[Math.floor(r() * cols.length)];
          const w = 0.3 + r() * 0.25;
          g.fillRect(x - w / 2, y, w, 0.4 + r() * 0.3);
        }
      });
    }
    case 'neon': {
      const hgt = o.s ?? 2;
      const col = p.neon[Math.floor(r() * p.neon.length)];
      return wrap(0.9, hgt + 0.3, 0.45, hgt + 0.15, (g) => {
        g.fillStyle = shade(p.iron, -0.1);
        g.fillRect(-0.28, -hgt, 0.56, hgt);
        g.strokeStyle = rgba(p.wallLit, 0.6);
        g.lineWidth = 0.03;
        g.strokeRect(-0.28, -hgt, 0.56, hgt);
        g.shadowColor = col;
        g.shadowBlur = ppu * 0.25;
        g.strokeStyle = col;
        g.lineWidth = 0.06;
        g.beginPath();
        for (let y = -hgt + 0.25; y < -0.3; y += 0.55) {
          g.moveTo(-0.14, y);
          g.lineTo(0.14, y);
          g.moveTo(0, y + 0.06);
          g.lineTo(0, y + 0.3);
          g.moveTo(-0.12, y + 0.36);
          g.lineTo(0.12, y + 0.42);
        }
        g.stroke();
      });
    }
    case 'sakura': {
      const s = o.s ?? 2;
      return wrap(s * 1.4, s * 1.25, s * 0.7, s * 1.2, (g) => {
        g.fillStyle = mix(p.trim, p.wallDark, 0.5);
        g.fillRect(-0.3, -0.25, 0.6, 0.25);
        g.strokeStyle = dark;
        g.lineWidth = 0.12;
        g.beginPath();
        g.moveTo(0, -0.25);
        g.quadraticCurveTo(-0.1, -s * 0.5, 0.1, -s * 0.7);
        g.moveTo(0.02, -s * 0.45);
        g.quadraticCurveTo(0.3, -s * 0.6, 0.4, -s * 0.75);
        g.stroke();
        const pink = mix('#ff9cc4', p.wall, 0.35);
        g.fillStyle = pink;
        g.beginPath();
        for (let k = 0; k < 10; k++) {
          const x = (r() - 0.5) * s * 0.9;
          const y = -s * (0.7 + r() * 0.35);
          const rr = s * (0.12 + r() * 0.1);
          g.moveTo(x + rr, y);
          g.arc(x, y, rr, 0, TAU);
        }
        g.fill();
        g.fillStyle = rgba('#ffe0ee', 0.5);
        g.beginPath();
        for (let k = 0; k < 6; k++) {
          const x = (r() - 0.5) * s * 0.7;
          const y = -s * (0.85 + r() * 0.2);
          const rr = s * (0.05 + r() * 0.05);
          g.moveTo(x + rr, y);
          g.arc(x, y, rr, 0, TAU);
        }
        g.fill();
      });
    }
    case 'chime':
      return wrap(0.7, 1.4, 0.35, 0.05, (g) => {
        g.strokeStyle = dark;
        g.lineWidth = 0.03;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(0, 0.35);
        g.stroke();
        g.fillStyle = rgba(p.plaster, 0.9);
        g.beginPath();
        g.arc(0, 0.55, 0.2, Math.PI, TAU);
        g.lineTo(0.2, 0.62);
        g.lineTo(-0.2, 0.62);
        g.fill();
        g.fillStyle = rgba(p.trim, 0.8);
        g.fillRect(-0.18, 0.5, 0.36, 0.05);
        g.strokeStyle = dark;
        g.beginPath();
        g.moveTo(0, 0.62);
        g.lineTo(0, 0.9);
        g.stroke();
        g.fillStyle = mix(p.plaster, '#ffffff', 0.3);
        g.fillRect(-0.08, 0.9, 0.16, 0.4);
      });
    case 'torii': {
      // Background only: small, dark, no glow, so it can't pass for a gate.
      const hgt = o.s ?? 2.6;
      const hw = hgt * 0.42;
      return wrap(hw * 2 + 0.6, hgt + 0.4, hw + 0.3, hgt + 0.1, (g) => {
        g.fillStyle = mix(p.wallDark, p.trim, 0.3);
        g.fillRect(-hw * 0.7, -hgt * 0.92, hgt * 0.07, hgt * 0.92);
        g.fillRect(hw * 0.7 - hgt * 0.07, -hgt * 0.92, hgt * 0.07, hgt * 0.92);
        g.fillRect(-hw * 0.85, -hgt * 0.74, hw * 1.7, hgt * 0.05);
        g.fillStyle = shade(p.wallDark, -0.2);
        g.beginPath();
        g.moveTo(-hw - 0.15, -hgt);
        g.quadraticCurveTo(0, -hgt * 0.9, hw + 0.15, -hgt);
        g.lineTo(hw, -hgt * 0.9);
        g.quadraticCurveTo(0, -hgt * 0.84, -hw, -hgt * 0.9);
        g.closePath();
        g.fill();
      });
    }
    case 'stone-lantern':
      return wrap(1, 1.6, 0.5, 1.55, (g) => {
        const st = mix(p.plaster, p.wallDark, 0.45);
        g.fillStyle = st;
        g.fillRect(-0.3, -0.12, 0.6, 0.12);
        g.fillRect(-0.08, -0.7, 0.16, 0.6);
        g.fillRect(-0.24, -0.8, 0.48, 0.1);
        g.fillRect(-0.2, -1.12, 0.4, 0.34);
        g.fillStyle = rgba(p.win, 0.55);
        g.fillRect(-0.1, -1.04, 0.2, 0.18);
        g.fillStyle = st;
        g.beginPath();
        hipRoof(g, 0, -1.12, 0.32, 0.22, 0.05);
        g.fill();
        g.fillRect(-0.04, -1.42, 0.08, 0.1);
        g.strokeStyle = lit;
        g.lineWidth = 0.025;
        g.strokeRect(-0.2, -1.12, 0.4, 0.34);
      });
    case 'crane': {
      const len = o.s ?? 1.5;
      return wrap(1, len + 0.6, 0.5, 0.02, (g) => {
        g.strokeStyle = rgba(p.wallLit, 0.6);
        g.lineWidth = 0.02;
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(0, len);
        g.stroke();
        g.fillStyle = mix(p.trim, '#ffffff', 0.25);
        g.beginPath();
        g.moveTo(-0.35, len + 0.05);
        g.lineTo(0, len - 0.05);
        g.lineTo(0.38, len + 0.02);
        g.lineTo(0.05, len + 0.15);
        g.closePath();
        g.fill();
        g.fillStyle = mix(p.trim, '#000000', 0.15);
        g.beginPath();
        g.moveTo(0, len - 0.05);
        g.lineTo(0.12, len - 0.35);
        g.lineTo(0.08, len + 0.1);
        g.closePath();
        g.fill();
      });
    }
    case 'lanterns':
    default: {
      const span = o.s ?? 4;
      return wrap(span + 0.4, 1.4, 0.2, 0.2, (g) => {
        g.strokeStyle = dark;
        g.lineWidth = 0.04;
        g.beginPath();
        g.moveTo(0, 0);
        g.quadraticCurveTo(span / 2, 0.6, span, 0);
        g.stroke();
        const n = Math.max(2, Math.round(span / 0.9));
        for (let k = 1; k < n; k++) {
          const u = k / n;
          const x = u * span;
          const y = 0.6 * 2 * u * (1 - u);
          g.fillStyle = shade(p.lamp[k % 2], -0.25);
          g.beginPath();
          g.ellipse(x, y + 0.28, 0.15, 0.2, 0, 0, TAU);
          g.fill();
          g.fillStyle = rgba('#ffffff', 0.2);
          g.beginPath();
          g.ellipse(x - 0.04, y + 0.24, 0.06, 0.12, 0, 0, TAU);
          g.fill();
          g.fillStyle = sil;
          g.fillRect(x - 0.1, y + 0.06, 0.2, 0.04);
          g.fillRect(x - 0.1, y + 0.46, 0.2, 0.04);
        }
      });
    }
  }
}

/** The corridor: a beam along the floor, a row of eaves along the ceiling. */
function bakeCorridor(p: Palette, ppu: number): { eave: Sprite; beam: Sprite } {
  const eave = bakeSprite(2 * ppu, 0.75 * ppu, 0, 0, (g) => {
    g.scale(ppu, ppu);
    // Drawn hanging down: the bright line is the bottom edge (the ceiling).
    g.fillStyle = p.corridor;
    g.fillRect(0, 0, 2, 0.75);
    g.fillStyle = shade(p.corridor, -0.3);
    g.fillRect(0, 0, 2, 0.3);
    g.strokeStyle = rgba(p.corridorLit, 0.45);
    g.lineWidth = 0.05;
    g.beginPath();
    for (let x = 0; x < 2; x += 0.3) {
      g.moveTo(x + 0.3, 0.52);
      g.arc(x + 0.15, 0.52, 0.15, 0, Math.PI, true);
    }
    g.stroke();
    g.fillStyle = rgba('#000000', 0.3);
    for (let x = 0; x < 2; x += 0.3) g.fillRect(x, 0.08, 0.03, 0.38);
  });
  const beam = bakeSprite(2 * ppu, 0.55 * ppu, 0, 0, (g) => {
    g.scale(ppu, ppu);
    g.fillStyle = shade(p.corridor, 0.08);
    g.fillRect(0, 0, 2, 0.55);
    g.fillStyle = rgba('#000000', 0.35);
    g.fillRect(0, 0.36, 2, 0.19);
    g.fillRect(1.96, 0, 0.04, 0.36);
    g.fillStyle = rgba(p.corridorLit, 0.25);
    g.fillRect(0, 0.06, 2, 0.05);
  });
  return { eave, beam };
}

export interface LevelNeeds {
  roofs: Set<RoofStyle>;
  blocks: Map<string, { style: BlockStyle; w: number; h: number }>;
  saws: Set<number>;
  vents: Set<number>;
  texts: Map<string, { text: string; size: number }>;
  deco: Map<string, DecoObj>;
}

export function emptyNeeds(): LevelNeeds {
  return {
    roofs: new Set(),
    blocks: new Map(),
    saws: new Set(),
    vents: new Set(),
    texts: new Map(),
    deco: new Map(),
  };
}

/** A theme's art, empty: topUpThemeArt fills it a sprite at a time. */
export function newThemeArt(p: Palette, ppu: number): ThemeArt {
  const none = blank();
  return {
    pal: p,
    ppu,
    roofs: {},
    blocks: new Map(),
    spikes: [],
    saws: new Map(),
    crow: [],
    lantern: none,
    vents: new Map(),
    texts: new Map(),
    deco: new Map(),
    eave: none,
    beam: none,
    base: 0,
    pending: new Map(),
  };
}

/** The palette's sprites every level uses: caltrops, crows, the lantern, the corridor. */
const BASE_N = 18;

function bakeBase(a: ThemeArt, k: number) {
  const p = a.pal;
  if (k < 8) a.spikes[k] = bakeSpike(k >> 1, (k & 1) === 1, p, a.ppu);
  else if (k < 16)
    a.crow[k - 8] = bakeCrow(Math.sin(((k - 8) / 8) * TAU), p, a.ppu);
  else if (k === 16) a.lantern = bakeLantern(p, a.ppu);
  else {
    const c = bakeCorridor(p, a.ppu);
    a.eave = c.eave;
    a.beam = c.beam;
  }
}

const ROOF_SEED: Record<RoofStyle, number> = {
  tiles: 4,
  flat: 5,
  pagoda: 6,
  shrine: 7,
  warehouse: 8,
};

/**
 * Bake whatever this level needs that the theme's art doesn't have yet.
 * Stops once `until` (a performance.now() time) has passed, so a theme
 * baked ahead of time costs a few milliseconds a frame; returns true once
 * nothing is missing.
 */
export function topUpThemeArt(
  a: ThemeArt,
  needs: LevelNeeds,
  font: string,
  until = Infinity
): boolean {
  const p = a.pal;
  const ppu = a.ppu;
  const late = () => performance.now() > until;
  while (a.base < BASE_N) {
    bakeBase(a, a.base++);
    if (late()) return false;
  }
  for (const s of needs.roofs) {
    if (a.roofs[s]) continue;
    let pend = a.pending.get(s);
    if (!pend) {
      pend = { n: 0, art: {} };
      a.pending.set(s, pend);
    }
    while (pend.n < 3) {
      bakeRoof(s, p, ppu, ROOF_SEED[s] * 101, pend.n++, pend.art);
      if (pend.n === 3) {
        a.roofs[s] = pend.art as RoofArt;
        a.pending.delete(s);
      }
      if (late()) return false;
    }
  }
  for (const [k, b] of needs.blocks) {
    if (a.blocks.has(k)) continue;
    a.blocks.set(k, bakeBlock(b.style, b.w, b.h, p, ppu));
    if (late()) return false;
  }
  for (const r of needs.saws) {
    if (a.saws.has(r)) continue;
    a.saws.set(r, bakeSaw(r, p, ppu));
    if (late()) return false;
  }
  for (const w of needs.vents) {
    if (a.vents.has(w)) continue;
    a.vents.set(w, bakeVent(w, p, ppu));
    if (late()) return false;
  }
  for (const [k, t] of needs.texts) {
    if (a.texts.has(k)) continue;
    a.texts.set(k, bakeText(t.text, t.size, font, p, ppu));
    if (late()) return false;
  }
  for (const [k, o] of needs.deco) {
    if (a.deco.has(k)) continue;
    a.deco.set(k, bakeDeco(o, p, ppu));
    if (late()) return false;
  }
  return true;
}

/** Signs were baked before the display face arrived: bake them again. */
export function rebakeTexts(a: ThemeArt, font: string) {
  for (const k of a.texts.keys()) {
    const bar = k.lastIndexOf('|');
    a.texts.set(
      k,
      bakeText(k.slice(0, bar), Number(k.slice(bar + 1)), font, a.pal, a.ppu)
    );
  }
}

// ── Common art ────────────────────────────────────────────────────────────

export interface CommonArt {
  ppu: number;
  orb: Record<OrbColor, Sprite>;
  orbGlow: Record<OrbColor, Sprite>;
  ring: Record<OrbColor, Sprite>;
  pad: Record<PadColor, Sprite>;
  padGlow: Record<PadColor, Sprite>;
  gates: Map<string, Sprite>;
  veil: Record<GateTint, Sprite>;
  gateGlow: Record<GateTint, Sprite>;
  emblem: Record<ModeId, Sprite>;
  /** Gravity-only gates: an arrow the way he will fall (up, then down). */
  gravEmblem: [Sprite, Sprite];
  speed: Map<string, Sprite>;
  speedGlow: Record<SpeedId, Sprite>;
  scroll: Sprite;
  scrollGlow: Sprite;
  glint: Sprite;
  smear: Map<number, Sprite>;
  puff: Sprite;
  jet: Sprite;
  fire: Sprite;
  fireJet: Sprite;
  flames: Sprite[];
  warn: Sprite;
  finish: Sprite;
  finishGlow: Sprite;
  checkpoint: Sprite;
  shadow: Sprite;
}

function bakeOrb(c: OrbColor, ppu: number): Sprite {
  const col = ORB_COL[c];
  const black = c === 'slam';
  const S = 1.2;
  return bakeSprite(S * ppu, S * ppu, (S / 2) * ppu, (S / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(S / 2, S / 2);
    // Paper body, lit from within.
    g.strokeStyle = rgba('#000000', 0.6);
    g.lineWidth = 0.14;
    g.beginPath();
    g.ellipse(0, 0, 0.36, 0.4, 0, 0, TAU);
    g.stroke();
    const gr = g.createRadialGradient(-0.08, -0.1, 0.02, 0, 0, 0.42);
    gr.addColorStop(0, black ? '#5a4a78' : shade(col, 0.6));
    gr.addColorStop(0.6, col);
    gr.addColorStop(1, shade(col, -0.25));
    g.fillStyle = gr;
    g.fill();
    // Ribs.
    g.strokeStyle = black
      ? rgba('#ffffff', 0.18)
      : rgba(shade(col, -0.45), 0.45);
    g.lineWidth = 0.025;
    g.beginPath();
    for (let k = -2; k <= 2; k++) {
      const y = k * 0.13;
      const w = 0.36 * Math.sqrt(1 - (y / 0.4) ** 2);
      g.moveTo(-w, y);
      g.quadraticCurveTo(0, y + 0.03, w, y);
    }
    g.stroke();
    // Caps.
    g.fillStyle = '#1a1424';
    g.fillRect(-0.2, -0.44, 0.4, 0.09);
    g.fillRect(-0.2, 0.35, 0.4, 0.09);
    g.fillStyle = shade(ORB_COL.jump, -0.3);
    g.fillRect(-0.2, -0.44, 0.4, 0.025);
    g.fillRect(-0.2, 0.415, 0.4, 0.025);
    // The glyph, painted on in ink (white on the black lantern).
    g.strokeStyle = black ? '#eef1ff' : '#1d1226';
    g.lineWidth = 0.075;
    glyph(g, ORB_GLYPH[c], 0, 0, 0.42);
    if (black) {
      g.strokeStyle = '#9fb0ff';
      g.lineWidth = 0.045;
      g.beginPath();
      g.ellipse(0, 0, 0.36, 0.4, 0, 0, TAU);
      g.stroke();
    }
  });
}

function bakeRing(c: OrbColor, ppu: number): Sprite {
  const col = c === 'slam' ? '#9fb0ff' : ORB_COL[c];
  const S = 1.5;
  return bakeSprite(S * ppu, S * ppu, (S / 2) * ppu, (S / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(S / 2, S / 2);
    g.strokeStyle = rgba(col, 0.9);
    g.lineWidth = 0.06;
    g.setLineDash([0.16, 0.1]);
    g.beginPath();
    g.arc(0, 0, 0.62, 0, TAU);
    g.stroke();
  });
}

function bakePad(c: PadColor, ppu: number): Sprite {
  const col = PAD_COL[c];
  const W = 1.3;
  const H = 0.7;
  // Anchor: the middle of the drum's base.
  return bakeSprite(W * ppu, H * ppu, (W / 2) * ppu, (H - 0.05) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(W / 2, H - 0.05);
    const top = -0.3; // the drum fires from the top 0.3 of its cell (physics.PAD_H)
    g.strokeStyle = rgba('#000000', 0.6);
    g.lineWidth = 0.12;
    g.beginPath();
    g.moveTo(-0.46, 0);
    g.quadraticCurveTo(-0.52, top / 2, -0.44, top);
    g.lineTo(0.44, top);
    g.quadraticCurveTo(0.52, top / 2, 0.46, 0);
    g.closePath();
    g.stroke();
    // The barrel: dark lacquer, a band of studs.
    const gr = g.createLinearGradient(-0.5, 0, 0.5, 0);
    gr.addColorStop(0, '#5a2a1e');
    gr.addColorStop(0.4, '#8a4430');
    gr.addColorStop(1, '#3a1810');
    g.fillStyle = gr;
    g.fill();
    g.fillStyle = '#e8c47a';
    for (let k = -3; k <= 3; k++) {
      g.beginPath();
      g.arc(k * 0.13, top + 0.05, 0.022, 0, TAU);
      g.arc(k * 0.13, -0.04, 0.022, 0, TAU);
      g.fill();
    }
    // The head, in the drum's colour.
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(0, top, 0.45, 0.1, 0, 0, TAU);
    g.fill();
    g.fillStyle = rgba('#ffffff', 0.45);
    g.beginPath();
    g.ellipse(-0.1, top - 0.02, 0.22, 0.04, 0, 0, TAU);
    g.fill();
    // Its glyph on the barrel, in the drum's colour.
    g.strokeStyle = shade(col, 0.15);
    g.lineWidth = 0.065;
    glyph(g, ORB_GLYPH[c], 0, top / 2 + 0.01, 0.2);
  });
}

function gateTint(o: { grav?: number }): GateTint {
  return o.grav === -1 ? 'flip' : o.grav === 1 ? 'upright' : 'mode';
}
export { gateTint };

function bakeGate(tint: GateTint, h: number, ppu: number): Sprite {
  const col = GATE_COL[tint];
  const hw = 1.25;
  const W = hw * 2 + 0.8;
  const top = h / 2 + 0.75;
  const Ht = h + 0.95;
  // Anchor: the gate's centre (x, y).
  return bakeSprite(W * ppu, Ht * ppu, (W / 2) * ppu, top * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(W / 2, top);
    const pil = 0.85;
    const pw = 0.2;
    const outline = (fn: () => void) => {
      g.strokeStyle = rgba('#000000', 0.55);
      g.lineWidth = 0.14;
      fn();
      g.stroke();
    };
    // Pillars, the tie beam, the plaque.
    g.fillStyle = col;
    g.beginPath();
    g.rect(-pil - pw / 2, -h / 2 + 0.05, pw, h);
    g.rect(pil - pw / 2, -h / 2 + 0.05, pw, h);
    g.rect(-hw + 0.15, -h / 2 + 0.38, (hw - 0.15) * 2, 0.17);
    outline(() => undefined);
    g.fill();
    g.fillStyle = shade(col, 0.35);
    g.fillRect(-pil - pw / 2, -h / 2 + 0.05, 0.05, h);
    g.fillRect(pil - pw / 2, -h / 2 + 0.05, 0.05, h);
    // Pillar feet (black).
    g.fillStyle = '#16121c';
    g.fillRect(-pil - pw / 2 - 0.03, h / 2 - 0.25, pw + 0.06, 0.25);
    g.fillRect(pil - pw / 2 - 0.03, h / 2 - 0.25, pw + 0.06, 0.25);
    // The kasagi: a black lintel with upturned ends over a coloured one.
    g.fillStyle = col;
    g.fillRect(-hw, -h / 2 - 0.08, hw * 2, 0.17);
    g.fillStyle = '#16121c';
    g.beginPath();
    g.moveTo(-hw - 0.32, -h / 2 - 0.42);
    g.quadraticCurveTo(0, -h / 2 - 0.18, hw + 0.32, -h / 2 - 0.42);
    g.lineTo(hw + 0.18, -h / 2 - 0.1);
    g.quadraticCurveTo(0, -h / 2 + 0.02, -hw - 0.18, -h / 2 - 0.1);
    g.closePath();
    g.fill();
    g.strokeStyle = rgba(col, 0.9);
    g.lineWidth = 0.04;
    g.stroke();
    // The plaque.
    g.fillStyle = '#16121c';
    g.fillRect(-0.3, -h / 2 + 0.02, 0.6, 0.62);
    g.strokeStyle = '#e8c47a';
    g.lineWidth = 0.04;
    g.strokeRect(-0.27, -h / 2 + 0.05, 0.54, 0.56);
    // Gravity arrows on the pillars (shape, not just colour).
    if (tint !== 'mode') {
      g.strokeStyle = '#16121c';
      g.lineWidth = 0.07;
      const up = tint === 'flip';
      for (const x of [-pil, pil]) {
        for (let k = 0; k < 2; k++) {
          const y = -0.35 + k * 0.5;
          const d = up ? -1 : 1;
          g.beginPath();
          g.moveTo(x - 0.07, y - d * 0.05);
          g.lineTo(x, y + d * 0.05);
          g.lineTo(x + 0.07, y - d * 0.05);
          g.stroke();
        }
      }
    }
  });
}

function bakeVeil(tint: GateTint, ppu: number): Sprite {
  const col = GATE_COL[tint];
  // A unit-height light curtain, stretched to each gate's height.
  return bakeSprite(1.6 * ppu, 4 * ppu, 0.8 * ppu, 2 * ppu, (g) => {
    const w = 1.6 * ppu;
    const h = 4 * ppu;
    const gx = g.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, rgba(col, 0));
    gx.addColorStop(0.35, rgba(col, 0.28));
    gx.addColorStop(0.5, rgba(shade(col, 0.6), 0.45));
    gx.addColorStop(0.65, rgba(col, 0.28));
    gx.addColorStop(1, rgba(col, 0));
    g.fillStyle = gx;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-in';
    const gy = g.createLinearGradient(0, 0, 0, h);
    gy.addColorStop(0, 'rgba(0,0,0,0.2)');
    gy.addColorStop(0.15, 'rgba(0,0,0,1)');
    gy.addColorStop(0.85, 'rgba(0,0,0,1)');
    gy.addColorStop(1, 'rgba(0,0,0,0.2)');
    g.fillStyle = gy;
    g.fillRect(0, 0, w, h);
  });
}

/** The six modes' emblems, for the gates' plaques (white on black). */
/** A gravity gate's plaque: an arrow the way he will fall. */
function bakeGravEmblem(up: boolean, ppu: number): Sprite {
  const S = 0.5;
  return bakeSprite(S * ppu, S * ppu, (S / 2) * ppu, (S / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(S / 2, S / 2);
    if (!up) g.scale(1, -1);
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.moveTo(0, -0.2);
    g.lineTo(0.15, -0.03);
    g.lineTo(0.055, -0.03);
    g.lineTo(0.055, 0.19);
    g.lineTo(-0.055, 0.19);
    g.lineTo(-0.055, -0.03);
    g.lineTo(-0.15, -0.03);
    g.closePath();
    g.fill();
  });
}

function bakeEmblem(m: ModeId, ppu: number): Sprite {
  const S = 0.5;
  return bakeSprite(S * ppu, S * ppu, (S / 2) * ppu, (S / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(S / 2, S / 2);
    g.strokeStyle = '#ffffff';
    g.fillStyle = '#ffffff';
    g.lineWidth = 0.045;
    g.beginPath();
    if (m === 'run') {
      // Kiru's hood: a round head, the headband, the eye slit.
      g.arc(0, 0.01, 0.17, 0, TAU);
      g.fill();
      g.fillStyle = '#ff4a2a';
      g.fillRect(-0.17, -0.09, 0.34, 0.06);
      g.fillStyle = '#16121c';
      g.fillRect(-0.11, 0.0, 0.22, 0.06);
    } else if (m === 'kite') {
      g.moveTo(0, -0.2);
      g.lineTo(0.14, 0);
      g.lineTo(0, 0.17);
      g.lineTo(-0.14, 0);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(0, 0.17);
      g.quadraticCurveTo(0.1, 0.22, 0.04, 0.24);
      g.stroke();
    } else if (m === 'roll') {
      g.arc(0, 0, 0.17, 0, TAU);
      g.stroke();
      g.beginPath();
      g.arc(0.02, -0.04, 0.08, Math.PI * 0.2, Math.PI * 1.6);
      g.stroke();
      g.beginPath();
      g.arc(0.06, -0.08, 0.035, 0, TAU);
      g.fill();
    } else if (m === 'parasol') {
      g.moveTo(-0.19, 0.0);
      g.quadraticCurveTo(0, -0.26, 0.19, 0.0);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(0, 0.15);
      g.quadraticCurveTo(0, 0.2, -0.05, 0.18);
      g.stroke();
    } else if (m === 'dragon') {
      g.moveTo(-0.2, 0.1);
      g.lineTo(-0.08, -0.06);
      g.lineTo(0.03, 0.08);
      g.lineTo(0.16, -0.1);
      g.stroke();
      g.beginPath();
      g.moveTo(0.06, -0.12);
      g.lineTo(0.19, -0.14);
      g.lineTo(0.18, -0.01);
      g.stroke();
    } else {
      // shadow: a crescent moon.
      g.arc(0, 0, 0.17, 0, TAU);
      g.fill();
      g.globalCompositeOperation = 'destination-out';
      g.beginPath();
      g.arc(0.08, -0.05, 0.15, 0, TAU);
      g.fill();
    }
  });
}

/**
 * Wind chevrons: a tall lens of swept air with the chevrons inside, one to
 * five of them, pointing back for slow.
 */
function bakeSpeed(sp: SpeedId, h: number, ppu: number): Sprite {
  const col = SPEED_COL[sp];
  const n = SPEED_N[sp];
  const back = sp === 'slow';
  const cw = 0.4;
  const iw = Math.max(1.1, n * cw + 0.5);
  const W = iw + 1;
  const Ht = h + 0.4;
  return bakeSprite(W * ppu, Ht * ppu, (W / 2) * ppu, (Ht / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(W / 2, Ht / 2);
    g.lineCap = 'round';
    const lens = (inset: number) => {
      const hw = iw / 2 - inset;
      const hh = h / 2 - inset * 0.6;
      g.moveTo(0, -hh);
      g.quadraticCurveTo(hw * 1.9, 0, 0, hh);
      g.moveTo(0, -hh);
      g.quadraticCurveTo(-hw * 1.9, 0, 0, hh);
    };
    // A faint fill of moving air.
    g.fillStyle = rgba(col, 0.12);
    g.beginPath();
    g.moveTo(0, -h / 2);
    g.quadraticCurveTo((iw / 2) * 1.9, 0, 0, h / 2);
    g.quadraticCurveTo((-iw / 2) * 1.9, 0, 0, -h / 2);
    g.fill();
    for (const pass of [0, 1]) {
      g.strokeStyle = pass ? col : rgba('#000000', 0.5);
      g.lineWidth = pass ? 0.08 : 0.2;
      g.beginPath();
      lens(0);
      g.stroke();
      g.globalAlpha = pass ? 0.55 : 0.3;
      g.lineWidth = pass ? 0.045 : 0.12;
      g.beginPath();
      lens(0.22);
      g.stroke();
      g.globalAlpha = 1;
    }
    // The chevrons.
    const x0 = -((n - 1) * cw) / 2;
    for (const pass of [0, 1]) {
      g.strokeStyle = pass ? shade(col, 0.4) : rgba('#000000', 0.6);
      g.lineWidth = pass ? 0.13 : 0.27;
      g.beginPath();
      for (let k = 0; k < n; k++) {
        const x = x0 + k * cw;
        const d = back ? -1 : 1;
        g.moveTo(x - d * 0.15, -0.4);
        g.lineTo(x + d * 0.15, 0);
        g.lineTo(x - d * 0.15, 0.4);
      }
      g.stroke();
    }
  });
}

function bakeScroll(ppu: number): Sprite {
  const W = 1.4;
  const H = 0.8;
  return bakeSprite(W * ppu, H * ppu, (W / 2) * ppu, (H / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(W / 2, H / 2);
    g.strokeStyle = rgba('#000000', 0.55);
    g.lineWidth = 0.12;
    g.strokeRect(-0.45, -0.2, 0.9, 0.4);
    // The paper roll.
    const gr = g.createLinearGradient(0, -0.2, 0, 0.2);
    gr.addColorStop(0, '#fff6dc');
    gr.addColorStop(0.5, '#f0dcae');
    gr.addColorStop(1, '#c9a86e');
    g.fillStyle = gr;
    g.fillRect(-0.45, -0.2, 0.9, 0.4);
    g.fillStyle = rgba('#8a5a00', 0.35);
    g.fillRect(-0.45, 0.06, 0.9, 0.025);
    // Gold rollers.
    for (const x of [-0.5, 0.5]) {
      g.fillStyle = '#c8962e';
      g.fillRect(x - 0.06, -0.27, 0.12, 0.54);
      g.fillStyle = '#ffcf70';
      g.fillRect(x - 0.06, -0.27, 0.12, 0.06);
      g.fillStyle = '#8a5a00';
      g.beginPath();
      g.arc(x, -0.3, 0.06, 0, TAU);
      g.arc(x, 0.3, 0.06, 0, TAU);
      g.fill();
    }
    // The cord.
    g.fillStyle = '#e8432a';
    g.fillRect(-0.06, -0.21, 0.12, 0.42);
    g.strokeStyle = '#e8432a';
    g.lineWidth = 0.05;
    g.beginPath();
    g.moveTo(0, 0.2);
    g.quadraticCurveTo(0.08, 0.32, 0.02, 0.38);
    g.moveTo(0, 0.2);
    g.quadraticCurveTo(-0.1, 0.3, -0.12, 0.36);
    g.stroke();
  });
}

function bakeGlint(ppu: number): Sprite {
  const S = 0.7;
  return bakeSprite(S * ppu, S * ppu, (S / 2) * ppu, (S / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(S / 2, S / 2);
    g.fillStyle = '#ffffff';
    g.beginPath();
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      g.lineTo(Math.cos(a) * 0.32, Math.sin(a) * 0.32);
      g.lineTo(Math.cos(a + TAU / 8) * 0.06, Math.sin(a + TAU / 8) * 0.06);
    }
    g.closePath();
    g.fill();
  });
}

function bakeSmear(r: number, ppu: number): Sprite {
  const R = r * 1.25;
  const S = R * 2;
  return bakeSprite(S * ppu, S * ppu, R * ppu, R * ppu, (g) => {
    const c = R * ppu;
    const gr = g.createRadialGradient(c, c, R * ppu * 0.45, c, c, R * ppu);
    gr.addColorStop(0, 'rgba(220, 230, 255, 0)');
    gr.addColorStop(0.55, 'rgba(220, 230, 255, 0.22)');
    gr.addColorStop(0.8, 'rgba(255, 255, 255, 0.12)');
    gr.addColorStop(1, 'rgba(220, 230, 255, 0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, S * ppu, S * ppu);
  });
}

function bakeJet(core: string, edge: string, ppu: number): Sprite {
  // A column profile, stretched to each vent's size: a bright core, firm
  // sides (where the hitbox is), fading only at the very top.
  return bakeSprite(1 * ppu, 4 * ppu, 0, 4 * ppu, (g) => {
    const w = ppu;
    const h = 4 * ppu;
    const gx = g.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, rgba(edge, 0));
    gx.addColorStop(0.08, rgba(edge, 0.55));
    gx.addColorStop(0.16, rgba(edge, 0.75));
    gx.addColorStop(0.5, rgba(core, 0.95));
    gx.addColorStop(0.84, rgba(edge, 0.75));
    gx.addColorStop(0.92, rgba(edge, 0.55));
    gx.addColorStop(1, rgba(edge, 0));
    g.fillStyle = gx;
    g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-in';
    const gy = g.createLinearGradient(0, 0, 0, h);
    gy.addColorStop(0, 'rgba(0,0,0,0)');
    gy.addColorStop(0.12, 'rgba(0,0,0,0.85)');
    gy.addColorStop(1, 'rgba(0,0,0,1)');
    g.fillStyle = gy;
    g.fillRect(0, 0, w, h);
  });
}

/** A flame tongue: a pointed teardrop, white-hot at its root. Anchor: its base. */
function bakeFlame(ppu: number, lean: number): Sprite {
  const W = 0.9;
  const H = 1.5;
  return bakeSprite(W * ppu, H * ppu, (W / 2) * ppu, H * 0.92 * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(W / 2, H * 0.92);
    const shape = (k: number) => {
      g.beginPath();
      g.moveTo(-0.34 * k, 0);
      g.quadraticCurveTo(-0.42 * k, -0.5 * k, lean * k, -1.3 * k);
      g.quadraticCurveTo(0.42 * k, -0.55 * k, 0.34 * k, 0);
      g.quadraticCurveTo(0, 0.12 * k, -0.34 * k, 0);
      g.closePath();
    };
    shape(1);
    g.fillStyle = 'rgba(255, 70, 30, 0.85)';
    g.fill();
    shape(0.72);
    g.fillStyle = 'rgba(255, 170, 50, 0.95)';
    g.fill();
    shape(0.42);
    g.fillStyle = '#fff4c0';
    g.fill();
  });
}

/** The finish's height in blocks (objects.ts places its glow and ribbons by it). */
export const FINISH_H = 6.6;

function bakeFinish(ppu: number): Sprite {
  const H = FINISH_H;
  const hw = 2.4;
  const W = hw * 2 + 1.6;
  return bakeSprite(
    W * ppu,
    (H + 1) * ppu,
    (W / 2) * ppu,
    (H + 0.5) * ppu,
    (g) => {
      g.scale(ppu, ppu);
      g.translate(W / 2, H + 0.5);
      const red = '#e8432a';
      const pil = 1.75;
      g.strokeStyle = rgba('#000000', 0.5);
      g.lineWidth = 0.2;
      g.fillStyle = red;
      g.beginPath();
      g.rect(-pil - 0.22, -H + 0.6, 0.44, H - 0.6);
      g.rect(pil - 0.22, -H + 0.6, 0.44, H - 0.6);
      g.rect(-hw + 0.25, -H + 1.75, (hw - 0.25) * 2, 0.32);
      g.stroke();
      g.fill();
      g.fillStyle = shade(red, 0.3);
      g.fillRect(-pil - 0.22, -H + 0.6, 0.1, H - 0.6);
      g.fillRect(pil - 0.22, -H + 0.6, 0.1, H - 0.6);
      g.fillStyle = '#16121c';
      g.fillRect(-pil - 0.27, -0.6, 0.54, 0.6);
      g.fillRect(pil - 0.27, -0.6, 0.54, 0.6);
      g.fillStyle = red;
      g.fillRect(-hw, -H + 0.6, hw * 2, 0.32);
      g.fillStyle = '#16121c';
      g.beginPath();
      g.moveTo(-hw - 0.6, -H - 0.1);
      g.quadraticCurveTo(0, -H + 0.35, hw + 0.6, -H - 0.1);
      g.lineTo(hw + 0.35, -H + 0.55);
      g.quadraticCurveTo(0, -H + 0.8, -hw - 0.35, -H + 0.55);
      g.closePath();
      g.fill();
      g.strokeStyle = '#e8c47a';
      g.lineWidth = 0.06;
      g.stroke();
      // The plaque.
      g.fillStyle = '#16121c';
      g.fillRect(-0.45, -H + 0.85, 0.9, 1.1);
      g.strokeStyle = '#e8c47a';
      g.strokeRect(-0.4, -H + 0.9, 0.8, 1.0);
      g.fillStyle = '#e8c47a';
      g.beginPath();
      g.moveTo(0, -H + 1.05);
      g.lineTo(0.18, -H + 1.4);
      g.lineTo(0, -H + 1.75);
      g.lineTo(-0.18, -H + 1.4);
      g.closePath();
      g.fill();
      // The shimenawa rope and its paper streamers.
      g.strokeStyle = '#d8c28a';
      g.lineWidth = 0.22;
      g.beginPath();
      g.moveTo(-pil, -H + 2.6);
      g.quadraticCurveTo(0, -H + 3.3, pil, -H + 2.6);
      g.stroke();
      g.fillStyle = '#ffffff';
      for (let k = -2; k <= 2; k++) {
        const x = k * 0.62;
        const y = -H + 2.95 + 0.25 * (1 - (k / 2.6) ** 2);
        g.beginPath();
        g.moveTo(x - 0.1, y);
        g.lineTo(x + 0.1, y);
        g.lineTo(x + 0.1, y + 0.25);
        g.lineTo(x - 0.05, y + 0.25);
        g.lineTo(x - 0.05, y + 0.5);
        g.lineTo(x + 0.1, y + 0.5);
        g.lineTo(x + 0.1, y + 0.75);
        g.lineTo(x - 0.1, y + 0.75);
        g.closePath();
        g.fill();
      }
    }
  );
}

function bakeCheckpoint(ppu: number): Sprite {
  const S = 0.9;
  return bakeSprite(S * ppu, S * ppu, (S / 2) * ppu, (S / 2) * ppu, (g) => {
    g.scale(ppu, ppu);
    g.translate(S / 2, S / 2);
    g.beginPath();
    g.moveTo(0, -0.34);
    g.lineTo(0.22, 0);
    g.lineTo(0, 0.34);
    g.lineTo(-0.22, 0);
    g.closePath();
    g.strokeStyle = rgba('#000000', 0.5);
    g.lineWidth = 0.12;
    g.stroke();
    g.fillStyle = '#4ade80';
    g.fill();
    g.strokeStyle = '#eafff0';
    g.lineWidth = 0.05;
    g.stroke();
    g.fillStyle = rgba('#ffffff', 0.5);
    g.beginPath();
    g.moveTo(0, -0.26);
    g.lineTo(0.1, -0.02);
    g.lineTo(0, 0.02);
    g.closePath();
    g.fill();
  });
}

export interface CommonNeeds {
  gates: Map<string, { tint: GateTint; h: number }>;
  speeds: Map<string, { speed: SpeedId; h: number }>;
  saws: Set<number>;
}

export function newCommonArt(ppu: number): CommonArt {
  const orbs = Object.keys(ORB_COL) as OrbColor[];
  const pads = Object.keys(PAD_COL) as PadColor[];
  const orb = {} as Record<OrbColor, Sprite>;
  const orbGlow = {} as Record<OrbColor, Sprite>;
  const ring = {} as Record<OrbColor, Sprite>;
  for (const c of orbs) {
    orb[c] = bakeOrb(c, ppu);
    orbGlow[c] = glowSprite(
      ppu * 2.2,
      c === 'slam' ? '#6f86ff' : ORB_COL[c],
      0.12
    );
    ring[c] = bakeRing(c, ppu);
  }
  const pad = {} as Record<PadColor, Sprite>;
  const padGlow = {} as Record<PadColor, Sprite>;
  for (const c of pads) {
    pad[c] = bakePad(c, ppu);
    padGlow[c] = glowSprite(ppu * 1.8, PAD_COL[c], 0.1);
  }
  const tints = Object.keys(GATE_COL) as GateTint[];
  const veil = {} as Record<GateTint, Sprite>;
  const gateGlow = {} as Record<GateTint, Sprite>;
  for (const t of tints) {
    veil[t] = bakeVeil(t, ppu);
    gateGlow[t] = glowSprite(ppu * 3, GATE_COL[t], 0.1);
  }
  const emblem = {} as Record<ModeId, Sprite>;
  for (const m of [
    'run',
    'kite',
    'roll',
    'parasol',
    'dragon',
    'shadow',
  ] as ModeId[])
    emblem[m] = bakeEmblem(m, ppu);
  const gravEmblem: [Sprite, Sprite] = [
    bakeGravEmblem(true, ppu),
    bakeGravEmblem(false, ppu),
  ];
  const speedGlow = {} as Record<SpeedId, Sprite>;
  for (const s of Object.keys(SPEED_COL) as SpeedId[])
    speedGlow[s] = glowSprite(ppu * 2.6, SPEED_COL[s], 0.1);
  return {
    ppu,
    orb,
    orbGlow,
    ring,
    pad,
    padGlow,
    gates: new Map(),
    veil,
    gateGlow,
    emblem,
    gravEmblem,
    speed: new Map(),
    speedGlow,
    scroll: bakeScroll(ppu),
    scrollGlow: glowSprite(ppu * 2, '#ffcf70', 0.1),
    glint: bakeGlint(ppu),
    smear: new Map(),
    puff: glowSprite(ppu * 1.4, '#f2f6ff', 0.3),
    jet: bakeJet('#ffffff', '#cfe0f0', ppu),
    fire: glowSprite(ppu * 1.3, '#ffb03d', 0.35),
    fireJet: bakeJet('#fff2b0', '#ff6a2a', ppu),
    flames: [bakeFlame(ppu, -0.08), bakeFlame(ppu, 0.1), bakeFlame(ppu, 0)],
    warn: glowSprite(ppu * 1.2, '#ffffff', 0.2),
    finish: bakeFinish(ppu),
    finishGlow: glowSprite(ppu * 6, '#ffcf70', 0.1),
    checkpoint: bakeCheckpoint(ppu),
    shadow: bakeSprite(ppu * 1.3, ppu * 0.36, ppu * 0.65, ppu * 0.18, (g) => {
      // A soft contact shadow: a flattened radial gradient.
      g.setTransform(1, 0, 0, 0.36 / 1.3, 0, 0);
      const r = ppu * 0.65;
      const gr = g.createRadialGradient(r, r, 0, r, r, r);
      gr.addColorStop(0, 'rgba(2, 2, 8, 0.85)');
      gr.addColorStop(0.55, 'rgba(2, 2, 8, 0.45)');
      gr.addColorStop(1, 'rgba(2, 2, 8, 0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, r * 2, r * 2);
    }),
  };
}

export function topUpCommon(a: CommonArt, needs: CommonNeeds) {
  for (const [k, v] of needs.gates)
    if (!a.gates.has(k)) a.gates.set(k, bakeGate(v.tint, v.h, a.ppu));
  for (const [k, v] of needs.speeds)
    if (!a.speed.has(k)) a.speed.set(k, bakeSpeed(v.speed, v.h, a.ppu));
  for (const r of needs.saws)
    if (!a.smear.has(r)) a.smear.set(r, bakeSmear(r, a.ppu));
}
