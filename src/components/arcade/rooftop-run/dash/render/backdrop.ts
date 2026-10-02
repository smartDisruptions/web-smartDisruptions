/**
 * The sky and the town behind the level: per theme, a sky gradient, the sun
 * or moon, clouds, twinkling stars, and three depths of town baked into
 * offscreen tiles (as in Classic's bake()), plus that theme's weather.
 *
 * Everything that is expensive to draw is baked here once per theme and per
 * canvas size. A frame only blits tiles, fills a gradient made at bake time,
 * and draws a few hundred small sprites or rects.
 *
 * Layers are measured in BLOCKS, not in fractions of the screen, so a
 * portrait screen (a taller view) shows more sky rather than a stretched
 * town.
 */
import type { Palette, FarKind } from './themes';
import {
  TAU,
  bakeSprite,
  clamp,
  ctxOf,
  glowSprite,
  makeCanvas,
  mix,
  mod,
  mulberry32,
  rgba,
  blank,
  shade,
  warm,
  type Sprite,
} from './util';

/** One parallax depth: a tile as wide as the screen, repeated. */
interface Layer {
  c: HTMLCanvasElement;
  /** Tile width and height in canvas pixels (the tile is drawn scaled up). */
  w: number;
  h: number;
  /** Horizontal and vertical parallax: 0 is fixed, 1 moves with the level. */
  fx: number;
  fy: number;
}

export interface Backdrop {
  pal: Palette;
  /** Canvas size and scale this was baked for. */
  W: number;
  H: number;
  ppu: number;
  sky: CanvasGradient;
  sun: Sprite;
  halo: Sprite;
  clouds: Sprite[];
  /** Baked one per step (far, mid, near); usable once all three are in. */
  layers: Layer[];
  ready: boolean;
  /** The next baking job (see backdropStep). */
  job: number;
  /** Below the town: the dark of the street, seen down the gaps between roofs. */
  alley: Sprite;
  bolt: Sprite | null;
  /** Small sprites the weather draws. */
  petal: Sprite[];
  spark: Sprite[];
  ink: Sprite[];
}

/** A view of the camera, in the units the backdrop needs. */
export interface BackView {
  W: number;
  H: number;
  ppu: number;
  camX: number;
  camY: number;
  /** Seconds of ambient time (keeps going through deaths and pauses). */
  now: number;
  /** 0..1, the beat (see objects.ts Cam.pulse). */
  pulse: number;
  /** 0..1, the swell after the song's big hits (see objects.ts Cam.accent). */
  accent: number;
  reduced: boolean;
}

/** The town's layers stand on this line (blocks), about where the roofs are. */
const BASE = 2.6;

// Depths, in blocks: tile height, parallax across and up, bake resolution.
const DEPTHS = [
  { h: 7.4, fx: 0.06, fy: 0.08, q: 0.42 },
  { h: 6.4, fx: 0.2, fy: 0.22, q: 0.58 },
  { h: 5.1, fx: 0.42, fy: 0.42, q: 0.72 },
];

// ── Shared shapes ─────────────────────────────────────────────────────────

/**
 * A hip roof with upturned corners (the curl is what reads as Japanese).
 * (cx, y) is the middle of the eave line; the roof rises `rise` above it.
 */
export function hipRoof(
  g: CanvasRenderingContext2D,
  cx: number,
  y: number,
  hw: number,
  rise: number,
  curl: number
) {
  g.moveTo(cx - hw - curl * 1.7, y - curl * 1.1);
  g.quadraticCurveTo(
    cx - hw + curl * 0.3,
    y + curl * 0.5,
    cx - hw * 0.6,
    y - rise * 0.32
  );
  g.lineTo(cx - hw * 0.22, y - rise);
  g.lineTo(cx + hw * 0.22, y - rise);
  g.lineTo(cx + hw * 0.6, y - rise * 0.32);
  g.quadraticCurveTo(
    cx + hw - curl * 0.3,
    y + curl * 0.5,
    cx + hw + curl * 1.7,
    y - curl * 1.1
  );
  g.lineTo(cx + hw - curl * 0.6, y + curl * 0.7);
  g.lineTo(cx - hw + curl * 0.6, y + curl * 0.7);
  g.closePath();
}

/** A five-storey pagoda standing on (cx, base), `s` blocks per tier. */
function pagoda(
  g: CanvasRenderingContext2D,
  cx: number,
  base: number,
  s: number,
  tiers = 5
) {
  for (let k = 0; k < tiers; k++) {
    const hw = s * (1.25 - k * 0.15);
    const y = base - s * 0.9 - k * s * 0.95;
    g.rect(cx - hw * 0.55, y, hw * 1.1, s * 0.95);
    hipRoof(g, cx, y, hw, s * 0.36, s * 0.16);
  }
  const top = base - s * 0.9 - tiers * s * 0.95;
  g.rect(cx - s * 0.05, top - s * 1.3, s * 0.1, s * 1.4);
  g.rect(cx - s * 0.32, base - s * 0.9, s * 0.64, s * 0.9);
}

/** A castle keep: a stone base and stacked, gabled storeys. */
function castle(
  g: CanvasRenderingContext2D,
  cx: number,
  base: number,
  s: number
) {
  g.moveTo(cx - s * 2.1, base);
  g.lineTo(cx - s * 1.7, base - s * 1.1);
  g.lineTo(cx + s * 1.7, base - s * 1.1);
  g.lineTo(cx + s * 2.1, base);
  g.closePath();
  let y = base - s * 1.1;
  for (let k = 0; k < 4; k++) {
    const hw = s * (1.5 - k * 0.3);
    g.rect(cx - hw, y - s * 0.75, hw * 2, s * 0.8);
    hipRoof(g, cx, y - s * 0.75, hw + s * 0.25, s * 0.42, s * 0.14);
    if (k === 1 || k === 2) {
      g.moveTo(cx - s * 0.35, y - s * 0.75);
      g.lineTo(cx, y - s * 1.2);
      g.lineTo(cx + s * 0.35, y - s * 0.75);
      g.closePath();
    }
    y -= s * 0.95;
  }
}

/** A string of paper lanterns hanging between two points (bake time). */
function lanternString(
  g: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  sag: number,
  r: number,
  rope: string,
  cols: [string, string],
  glow: boolean
) {
  const mx = (ax + bx) / 2;
  const my = Math.max(ay, by) + sag;
  g.strokeStyle = rope;
  g.lineWidth = r * 0.25;
  g.beginPath();
  g.moveTo(ax, ay);
  g.quadraticCurveTo(mx, my, bx, by);
  g.stroke();
  const n = Math.max(2, Math.round(Math.abs(bx - ax) / (r * 4.2)));
  for (let k = 1; k < n; k++) {
    const u = k / n;
    const lx = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx;
    const ly = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by;
    const col = cols[k % 2];
    if (glow) {
      g.save();
      g.shadowColor = col;
      g.shadowBlur = r * 5;
    }
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(lx, ly + r * 1.2, r * 0.8, r, 0, 0, TAU);
    g.fill();
    if (glow) g.restore();
    g.fillStyle = rgba('#000000', 0.35);
    g.fillRect(lx - r * 0.55, ly + r * 0.15, r * 1.1, r * 0.25);
    g.fillRect(lx - r * 0.55, ly + r * 1.95, r * 1.1, r * 0.25);
  }
}

/** A blossoming tree's canopy: clustered discs, lit from above. */
function blossom(
  g: CanvasRenderingContext2D,
  r: () => number,
  cx: number,
  cy: number,
  s: number,
  dark: string,
  lit: string
) {
  g.fillStyle = dark;
  g.beginPath();
  for (let k = 0; k < 9; k++) {
    const a = r() * TAU;
    const d = r() * s * 0.7;
    const rr = s * (0.35 + r() * 0.3);
    g.moveTo(cx + Math.cos(a) * d + rr, cy + Math.sin(a) * d * 0.6);
    g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.6, rr, 0, TAU);
  }
  g.fill();
  g.fillStyle = lit;
  g.beginPath();
  for (let k = 0; k < 6; k++) {
    const a = Math.PI + r() * Math.PI;
    const d = r() * s * 0.6;
    const rr = s * (0.18 + r() * 0.2);
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d * 0.55 - s * 0.15;
    g.moveTo(x + rr, y);
    g.arc(x, y, rr, 0, TAU);
  }
  g.fill();
}

// ── Baking ────────────────────────────────────────────────────────────────

function bakeSun(p: Palette, ppu: number): Sprite {
  const o = p.orb;
  const R = o.r * 11.5 * ppu;
  const S = Math.ceil(R * 2 + 8);
  return bakeSprite(S, S, S / 2, S / 2, (g) => {
    const c = S / 2;
    if (o.kind === 'veiled') {
      const gr = g.createRadialGradient(c, c, 0, c, c, R);
      gr.addColorStop(0, rgba(o.disc, 0.55));
      gr.addColorStop(0.5, rgba(o.disc, 0.18));
      gr.addColorStop(1, rgba(o.disc, 0));
      g.fillStyle = gr;
      g.fillRect(0, 0, S, S);
      return;
    }
    if (o.kind === 'hinomaru') {
      // A flat red disc with a brushed, slightly ragged edge.
      g.fillStyle = o.edge;
      g.beginPath();
      for (let i = 0; i <= 96; i++) {
        const a = (i / 96) * TAU;
        const rr =
          R * (1 + 0.006 * Math.sin(a * 13) + 0.004 * Math.sin(a * 31 + 1));
        g.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr);
      }
      g.fill();
      const gr = g.createRadialGradient(
        c - R * 0.2,
        c - R * 0.25,
        R * 0.1,
        c,
        c,
        R * 0.97
      );
      gr.addColorStop(0, shade(o.disc, 0.08));
      gr.addColorStop(1, o.disc);
      g.fillStyle = gr;
      g.beginPath();
      g.arc(c, c, R * 0.965, 0, TAU);
      g.fill();
      return;
    }
    const gr = g.createRadialGradient(
      c - R * 0.25,
      c - R * 0.3,
      R * 0.05,
      c,
      c,
      R
    );
    gr.addColorStop(0, o.kind === 'sun' ? '#ffffff' : shade(o.disc, 0.4));
    gr.addColorStop(0.7, o.disc);
    gr.addColorStop(1, o.edge);
    g.fillStyle = gr;
    g.beginPath();
    g.arc(c, c, R, 0, TAU);
    g.fill();
    if (o.kind === 'moon') {
      // Soft maria and a few craters.
      const r = mulberry32(11);
      g.save();
      g.beginPath();
      g.arc(c, c, R, 0, TAU);
      g.clip();
      // Soft maria: wide, faint, overlapping.
      for (let k = 0; k < 9; k++) {
        const a = r() * TAU;
        const d = r() * R * 0.55;
        const rr = R * (0.14 + r() * 0.2);
        const x = c + Math.cos(a) * d - R * 0.1;
        const y = c + Math.sin(a) * d - R * 0.05;
        const gr = g.createRadialGradient(x, y, 0, x, y, rr);
        gr.addColorStop(0, rgba(o.marks, 0.5));
        gr.addColorStop(0.7, rgba(o.marks, 0.3));
        gr.addColorStop(1, rgba(o.marks, 0));
        g.fillStyle = gr;
        g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
      }
      // A few small, crisp craters with a lit rim.
      for (let k = 0; k < 7; k++) {
        const a = r() * TAU;
        const d = (0.25 + r() * 0.6) * R;
        const rr = R * (0.018 + r() * 0.035);
        const x = c + Math.cos(a) * d;
        const y = c + Math.sin(a) * d;
        g.fillStyle = rgba(o.marks, 0.75);
        g.beginPath();
        g.arc(x, y, rr, 0, TAU);
        g.fill();
        g.strokeStyle = rgba('#ffffff', 0.6);
        g.lineWidth = Math.max(1, rr * 0.3);
        g.beginPath();
        g.arc(x, y, rr, Math.PI * 0.15, Math.PI * 0.85);
        g.stroke();
      }
      // The limb darkens a touch.
      const limb = g.createRadialGradient(c, c, R * 0.75, c, c, R);
      limb.addColorStop(0, rgba(o.edge, 0));
      limb.addColorStop(1, rgba(o.edge, 0.45));
      g.fillStyle = limb;
      g.fillRect(c - R, c - R, R * 2, R * 2);
      g.restore();
    } else {
      // Sunrise haze: thin bands across the disc.
      g.save();
      g.beginPath();
      g.arc(c, c, R, 0, TAU);
      g.clip();
      g.fillStyle = rgba(o.halo, 0.35);
      for (let k = 0; k < 4; k++) {
        const y = c + R * (0.2 + k * 0.2);
        g.fillRect(c - R, y, R * 2, R * (0.035 + k * 0.012));
      }
      g.restore();
    }
  });
}

function bakeHalo(p: Palette, ppu: number): Sprite {
  const o = p.orb;
  const R = o.r * 11.5 * ppu * (o.kind === 'hinomaru' ? 2.2 : 3.2);
  const q = 0.25;
  const S = Math.ceil(R * 2 * q);
  const sp = bakeSprite(S, S, S / 2, S / 2, (g) => {
    const c = S / 2;
    const gr = g.createRadialGradient(c, c, 0, c, c, c);
    gr.addColorStop(0, rgba(o.halo, o.haloA));
    gr.addColorStop(0.3, rgba(o.halo, o.haloA * 0.45));
    gr.addColorStop(0.65, rgba(o.halo, o.haloA * 0.12));
    gr.addColorStop(1, rgba(o.halo, 0));
    g.fillStyle = gr;
    g.fillRect(0, 0, S, S);
  });
  // Drawn at full size: record the destination size, not the bake size.
  sp.w = R * 2;
  sp.h = R * 2;
  sp.ax = R;
  sp.ay = R;
  return sp;
}

/** How many clouds a theme has (storm's are heavier and more). */
const cloudCount = (p: Palette) => (p.weather.rain ? 4 : 3);

/**
 * One cloud, soft enough to bake at a quarter of the canvas resolution
 * (cheap to bake ahead of time, and nobody can tell).
 */
function bakeCloud(p: Palette, ppu: number, i: number): Sprite {
  const r = mulberry32(p.id.length * 97 + 3 + i * 7919);
  const heavy = p.weather.rain === true;
  const q = 0.25;
  // Lit from below at dawn (the sun is low), from above by the moon.
  const litBelow = p.orb.y > 0.5;
  {
    const wB = (heavy ? 14 : 8) + i * 2.4;
    const hB = heavy ? 3.2 : 1.5;
    const w = wB * ppu * q;
    const h = hB * ppu * q;
    const sp = bakeSprite(w, h, 0, 0, (g) => {
      // Flat, layered streaks: wide soft ellipses, thinning toward the ends.
      const blobs = heavy ? 26 : 14;
      const pts: number[] = [];
      for (let k = 0; k < blobs; k++) {
        const u = (k + 0.5) / blobs;
        const spread = Math.sin(u * Math.PI);
        const rx = w * (0.08 + 0.1 * spread) * (0.7 + r() * 0.6);
        const ry =
          h * (heavy ? 0.28 : 0.22) * (0.5 + spread * 0.6) * (0.7 + r() * 0.5);
        const cx = w * (0.08 + u * 0.84) + (r() - 0.5) * w * 0.04;
        const cy = h * (0.55 + (r() - 0.5) * 0.18) - spread * h * 0.08;
        pts.push(cx, cy, rx, ry);
      }
      const blob = (
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        col: string,
        a: number
      ) => {
        g.setTransform(rx / ry, 0, 0, 1, cx, cy);
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, ry);
        gr.addColorStop(0, rgba(col, a));
        gr.addColorStop(0.6, rgba(col, a * 0.6));
        gr.addColorStop(1, rgba(col, 0));
        g.fillStyle = gr;
        g.fillRect(-ry, -ry, ry * 2, ry * 2);
      };
      for (let k = 0; k < pts.length; k += 4)
        blob(pts[k], pts[k + 1], pts[k + 2], pts[k + 3], p.cloud, p.cloudA);
      // The lit edge, painted only where there is cloud.
      g.globalCompositeOperation = 'source-atop';
      const dy = litBelow ? 0.45 : -0.45;
      for (let k = 0; k < pts.length; k += 4)
        blob(
          pts[k],
          pts[k + 1] + pts[k + 3] * dy,
          pts[k + 2] * 0.85,
          pts[k + 3] * 0.7,
          p.cloudLit,
          heavy ? 0.22 : 0.5
        );
      g.setTransform(1, 0, 0, 1, 0, 0);
    });
    sp.w = wB * ppu;
    sp.h = hB * ppu;
    return sp;
  }
}

/** A seamless ridge: sines whose periods divide the tile width. */
function ridge(
  x: number,
  TW: number,
  base: number,
  amps: number[],
  ph: number
) {
  const a = (x / TW) * TAU;
  let y = base;
  for (let k = 0; k < amps.length; k++)
    y += amps[k] * Math.sin(a * (k * 2 + 1) + ph * (k + 1));
  return y;
}

function bakeFar(
  p: Palette,
  TW: number,
  H: number,
  kind: FarKind,
  g: CanvasRenderingContext2D
) {
  const r = mulberry32(31 + kind.length);
  // The back range: paler, nearer the sky.
  const back = mix(p.far, p.farMist, 0.45);
  const fillRange = (
    col: string,
    top: string,
    base: number,
    amps: number[],
    ph: number
  ) => {
    const gr = g.createLinearGradient(0, H - base - 2.5, 0, H);
    gr.addColorStop(0, top);
    gr.addColorStop(1, col);
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(0, H);
    for (let x = 0; x <= TW + 0.05; x += 0.1)
      g.lineTo(x, H - ridge(x, TW, base, amps, ph));
    g.lineTo(TW, H);
    g.closePath();
    g.fill();
  };

  if (kind === 'ink') {
    // Sumi-e: three ranges of tall peaks, each washing out into mist.
    for (let layer = 0; layer < 3; layer++) {
      const peaks = 5 + layer * 2;
      const top = H - (6.6 - layer * 1.4);
      const gr = g.createLinearGradient(0, top, 0, H - layer * 0.4);
      const ink = mix(p.far, '#000000', layer * 0.25);
      gr.addColorStop(0, rgba(ink, 0.95));
      gr.addColorStop(0.55, rgba(ink, 0.55));
      gr.addColorStop(1, rgba(p.farMist, 0.0));
      g.fillStyle = gr;
      for (let ox = -TW; ox <= TW; ox += TW) {
        g.beginPath();
        g.moveTo(ox, H);
        for (let k = 0; k <= peaks; k++) {
          const px = ox + (k / peaks) * TW + (r() - 0.5) * 0.6;
          const ph = H - (2.2 + r() * (4.4 - layer * 1.1));
          const w = (TW / peaks) * 0.5;
          g.quadraticCurveTo(px - w * 0.5, ph - 0.2, px, ph);
          g.quadraticCurveTo(px + w * 0.5, ph - 0.2, px + w, H - 1 - r() * 1.2);
        }
        g.lineTo(ox + TW, H);
        g.closePath();
        g.fill();
      }
      // Brushed light on the left flanks.
      g.strokeStyle = rgba(p.farLit, 0.18 - layer * 0.04);
      g.lineWidth = 0.08;
      g.beginPath();
      for (let k = 0; k < 14; k++) {
        const x = r() * TW;
        const y = H - 1.5 - r() * 3.5;
        g.moveTo(x, y);
        g.quadraticCurveTo(x - 0.3, y + 0.6, x - 0.1, y + 1.4);
      }
      g.stroke();
    }
    return;
  }

  if (kind === 'storm') {
    fillRange(
      mix(back, p.farMist, 0.4),
      mix(back, p.cloud, 0.3),
      4.6,
      [0.9, 0.5, 0.25],
      0.4
    );
    fillRange(
      p.far,
      mix(p.far, p.farLit, 0.12),
      3.2,
      [0.7, 0.4, 0.3, 0.12],
      2.1
    );
  } else if (kind === 'blossom') {
    fillRange(back, mix(back, p.farLit, 0.2), 3.6, [0.6, 0.3, 0.15], 0.8);
    fillRange(p.far, mix(p.far, p.farLit, 0.1), 2.3, [0.5, 0.35, 0.12], 1.7);
    for (let ox = -TW; ox <= TW; ox += TW) {
      for (let k = 0; k < 16; k++) {
        const x = ox + (k / 16) * TW + r() * 0.8;
        const y = H - ridge(x - ox, TW, 2.3, [0.5, 0.35, 0.12], 1.7) + 0.3;
        blossom(
          g,
          r,
          x,
          y,
          0.55 + r() * 0.35,
          mix(p.far, p.farLit, 0.45),
          mix(p.farLit, '#ffffff', 0.25)
        );
      }
      g.fillStyle = mix(p.far, '#000000', 0.15);
      g.beginPath();
      pagoda(g, ox + TW * 0.78, H - 2.4, 0.42, 5);
      g.fill();
    }
  } else if (kind === 'castle') {
    fillRange(back, mix(back, p.farLit, 0.12), 2.6, [0.5, 0.25, 0.12], 1.1);
    fillRange(p.far, mix(p.far, p.farLit, 0.06), 1.8, [0.45, 0.2, 0.1], 2.4);
    for (let ox = -TW; ox <= TW; ox += TW) {
      const cx = ox + TW * 0.3;
      g.fillStyle = mix(p.far, '#000000', 0.2);
      g.beginPath();
      castle(g, cx, H - 2.2, 0.62);
      g.fill();
      // Lit windows, and a procession of lanterns down the hill.
      g.fillStyle = rgba(p.farLit, 0.9);
      for (let k = 0; k < 4; k++)
        g.fillRect(cx - 0.5 + k * 0.3, H - 2.95 - (k % 2) * 0.6, 0.09, 0.12);
      g.save();
      g.shadowColor = p.farLit;
      g.shadowBlur = 6;
      g.fillStyle = mix(p.farLit, '#ffffff', 0.3);
      for (let k = 0; k < 22; k++) {
        const u = k / 22;
        const x = cx + 1.3 + u * TW * 0.45;
        const y = H - 2 + u * 1.2 + Math.sin(u * 9) * 0.25;
        g.beginPath();
        g.arc(x, y, 0.06, 0, TAU);
        g.fill();
      }
      g.restore();
    }
  } else {
    // fuji and peaks: a back range, then a front range, then snow.
    const peaks = kind === 'peaks';
    fillRange(
      back,
      mix(back, p.farLit, 0.15),
      peaks ? 3.4 : 2.6,
      [0.8, 0.4, 0.25, 0.1],
      0.3
    );
    if (peaks) {
      for (let ox = -TW; ox <= TW; ox += TW) {
        const n = 6;
        for (let k = 0; k < n; k++) {
          const cx = ox + (k + 0.5) * (TW / n) + (r() - 0.5) * 1.2;
          const ht = 3.4 + r() * 2.8;
          const hw = 1.6 + r() * 1.4;
          const tip = H - ht;
          g.fillStyle = mix(p.far, '#000000', 0.05 * k);
          g.beginPath();
          g.moveTo(cx - hw * 1.6, H);
          g.lineTo(cx - hw * 0.25, tip + 0.35);
          g.lineTo(cx, tip);
          g.lineTo(cx + hw * 0.3, tip + 0.45);
          g.lineTo(cx + hw * 1.7, H);
          g.closePath();
          g.fill();
          if (ht > 4.2) {
            // Snow on the moonlit side.
            g.fillStyle = rgba(p.farLit, 0.8);
            g.beginPath();
            g.moveTo(cx, tip);
            g.lineTo(cx - hw * 0.25, tip + 0.35);
            g.lineTo(cx - hw * 0.42, tip + 0.75);
            g.lineTo(cx - hw * 0.18, tip + 0.62);
            g.lineTo(cx - 0.02, tip + 0.9);
            g.lineTo(cx + hw * 0.1, tip + 0.5);
            g.lineTo(cx + hw * 0.3, tip + 0.45);
            g.closePath();
            g.fill();
          }
        }
        g.fillStyle = mix(p.far, '#000000', 0.25);
        g.beginPath();
        pagoda(g, ox + TW * 0.18, H - 2.2, 0.32, 5);
        g.fill();
      }
      fillRange(
        mix(p.far, '#000000', 0.15),
        mix(p.far, p.farLit, 0.06),
        1.6,
        [0.4, 0.25, 0.1],
        2.2
      );
    } else {
      fillRange(p.far, mix(p.far, p.farLit, 0.12), 1.9, [0.6, 0.3, 0.18], 1.9);
      for (let ox = -TW; ox <= TW; ox += TW) {
        // Fuji, catching the first light.
        const px = ox + TW * 0.38;
        const top = H - 5.3;
        const peak = (dx: number) =>
          top + Math.pow(Math.abs(dx) / 4.6, 1.45) * 4.3;
        const gr = g.createLinearGradient(0, top, 0, H);
        gr.addColorStop(0, mix(p.far, p.farLit, 0.25));
        gr.addColorStop(1, p.far);
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(px - 6, H);
        for (let dx = -6; dx <= 6; dx += 0.15)
          g.lineTo(px + dx, Math.min(H, peak(dx)));
        g.lineTo(px + 6, H);
        g.fill();
        g.fillStyle = rgba(p.farLit, 0.85);
        g.beginPath();
        g.moveTo(px - 1.1, peak(-1.1));
        for (let dx = -1.1; dx <= 1.1; dx += 0.1) g.lineTo(px + dx, peak(dx));
        for (let dx = 1.1; dx >= -1.1; dx -= 0.2)
          g.lineTo(px + dx, peak(dx) + 0.26 + 0.16 * Math.sin(dx * 7));
        g.closePath();
        g.fill();
      }
    }
  }
}

function bakeTown(
  p: Palette,
  TW: number,
  H: number,
  g: CanvasRenderingContext2D
) {
  const r = mulberry32(7 + p.id.length * 13);
  const blds: number[] = [];
  let x = -0.4;
  while (x < TW) {
    const w = 0.8 + r() * 1.5;
    const h = 1.4 + r() * 2.8 + (r() < 0.12 ? 1.2 : 0);
    blds.push(x, w, h, r());
    x += w + 0.06 + r() * 0.45;
  }
  const lights = p.id === 'dawn' ? 0.06 : p.id === 'lanterns' ? 0.2 : 0.11;
  for (let ox = -TW; ox <= TW; ox += TW) {
    g.fillStyle = p.mid;
    g.beginPath();
    for (let i = 0; i < blds.length; i += 4) {
      const bx = blds[i] + ox;
      const bw = blds[i + 1];
      const bh = blds[i + 2];
      g.rect(bx, H - bh, bw, bh);
      if (blds[i + 3] < 0.45)
        hipRoof(g, bx + bw / 2, H - bh, bw / 2 + 0.08, 0.36, 0.12);
    }
    const pg = ox + TW * 0.27;
    pagoda(g, pg, H, 0.85, 5);
    if (p.id === 'dojo' || p.id === 'lanterns')
      castle(g, ox + TW * 0.74, H - 1.6, 0.55);
    g.fill();
    // Sky light along the roof lines.
    g.strokeStyle = rgba(mix(p.mid, p.farLit, 0.5), 0.45);
    g.lineWidth = 0.035;
    g.beginPath();
    for (let i = 0; i < blds.length; i += 4) {
      if (blds[i + 3] < 0.45) continue;
      g.moveTo(blds[i] + ox, H - blds[i + 2]);
      g.lineTo(blds[i] + ox + blds[i + 1], H - blds[i + 2]);
    }
    g.stroke();
    // Windows.
    g.fillStyle = rgba(p.midWin, 0.8);
    g.beginPath();
    for (let i = 0; i < blds.length; i += 4) {
      const bx = blds[i] + ox;
      const bw = blds[i + 1];
      const bh = blds[i + 2];
      const seed = blds[i + 3];
      for (let wy = H - bh + 0.35; wy < H - 0.3; wy += 0.4) {
        for (let wx = bx + 0.18; wx < bx + bw - 0.2; wx += 0.3) {
          if ((wx * 13.1 + wy * 7.7 + seed * 100) % 1 < lights)
            g.rect(wx, wy, 0.1, 0.13);
        }
      }
    }
    g.fill();
    // Theme dressing: neon, lanterns, blossom, banners.
    g.save();
    for (let i = 0; i < blds.length; i += 4) {
      const seed = blds[i + 3];
      const bx = blds[i] + ox;
      const bw = blds[i + 1];
      const bh = blds[i + 2];
      if (seed > 0.8 && bw > 1 && p.id !== 'dawn') {
        // Neon, kept dim: it is far away, and it mustn't pull the eye.
        const col = mix(
          p.neon[Math.floor(seed * 100) % p.neon.length],
          p.mid,
          0.35
        );
        g.shadowColor = col;
        g.shadowBlur = 5;
        g.fillStyle = col;
        g.fillRect(
          bx + bw * 0.35,
          H - bh + 0.35,
          0.08,
          Math.min(0.9, bh * 0.3)
        );
      }
      if (p.id === 'dojo' && seed > 0.55 && seed < 0.68) {
        g.shadowBlur = 0;
        g.fillStyle = p.trim;
        g.fillRect(bx + bw * 0.5, H - bh - 1.4, 0.05, 1.4);
        g.fillRect(bx + bw * 0.5 + 0.05, H - bh - 1.35, 0.32, 1.0);
      }
    }
    g.restore();
    if (p.weather.fireworks || p.id === 'dawn' || p.id === 'dojo') {
      for (let i = 0; i + 8 < blds.length; i += 12) {
        const ax = blds[i] + ox + blds[i + 1] * 0.8;
        const ay = H - blds[i + 2] + 0.2;
        const bx = blds[i + 8] + ox + blds[i + 9] * 0.2;
        const by = H - blds[i + 10] + 0.2;
        if (bx - ax > 4 || bx < ax) continue;
        lanternString(
          g,
          ax,
          ay,
          bx,
          by,
          0.4,
          0.07,
          rgba('#000000', 0.5),
          p.lamp,
          p.id !== 'dawn'
        );
      }
    }
    if (p.id === 'sakura') {
      for (let k = 0; k < 7; k++) {
        const tx = ox + (k / 7) * TW + r() * 1.2;
        g.fillStyle = mix(p.mid, '#000000', 0.2);
        g.fillRect(tx - 0.05, H - 1.4, 0.1, 1.4);
        blossom(
          g,
          r,
          tx,
          H - 1.6,
          0.6,
          mix(p.mid, p.farLit, 0.5),
          mix(p.farLit, '#ffffff', 0.35)
        );
      }
    }
  }
  const mist = g.createLinearGradient(0, H - 2.6, 0, H);
  mist.addColorStop(0, rgba(p.midMist, 0));
  mist.addColorStop(1, rgba(p.midMist, 0.7));
  g.fillStyle = mist;
  g.fillRect(0, H - 2.6, TW, 2.6);
}

function bakeNear(
  p: Palette,
  TW: number,
  H: number,
  g: CanvasRenderingContext2D
) {
  const r = mulberry32(19 + p.id.length * 7);
  // Pushed back into the air a little, so it never passes for a roof Kiru
  // can stand on.
  const body = mix(p.near, p.nearMist, 0.3);
  const blds: number[] = [];
  let x = -0.8;
  while (x < TW) {
    const w = 1.9 + r() * 2.6;
    const h = 1.3 + r() * 2.5;
    blds.push(x, w, h, r());
    x += w + 0.15 + r() * 0.9;
  }
  for (let ox = -TW; ox <= TW; ox += TW) {
    g.fillStyle = body;
    g.beginPath();
    for (let i = 0; i < blds.length; i += 4) {
      const bx = blds[i] + ox;
      const bw = blds[i + 1];
      const bh = blds[i + 2];
      g.rect(bx + 0.15, H - bh, bw - 0.3, bh);
      hipRoof(g, bx + bw / 2, H - bh, bw / 2, 0.55 + blds[i + 3] * 0.3, 0.2);
    }
    g.fill();
    // The tiles catch the sky.
    g.strokeStyle = rgba(mix(body, p.farLit, 0.5), 0.35);
    g.lineWidth = 0.04;
    g.beginPath();
    for (let i = 0; i < blds.length; i += 4) {
      const bx = blds[i] + ox;
      const bw = blds[i + 1];
      const bh = blds[i + 2];
      const rise = 0.55 + blds[i + 3] * 0.3;
      g.moveTo(bx + bw / 2 - (bw / 2) * 0.22, H - bh - rise);
      g.lineTo(bx + bw / 2 + (bw / 2) * 0.22, H - bh - rise);
    }
    g.stroke();
    g.fillStyle = rgba(p.nearWin, 0.7);
    g.beginPath();
    for (let i = 0; i < blds.length; i += 4) {
      const bx = blds[i] + ox;
      const bw = blds[i + 1];
      const bh = blds[i + 2];
      for (let wy = H - bh + 0.45; wy < H - 0.3; wy += 0.55) {
        for (let wx = bx + 0.4; wx < bx + bw - 0.5; wx += 0.5) {
          if ((wx * 3.7 + wy * 11.3 + blds[i + 3] * 50) % 1 < 0.13)
            g.rect(wx, wy, 0.2, 0.24);
        }
      }
    }
    g.fill();
    for (let i = 0; i + 4 < blds.length; i += 8) {
      const ax = blds[i] + ox + blds[i + 1] * 0.8;
      const ay = H - blds[i + 2] + 0.35;
      const bx = blds[i + 4] + ox + blds[i + 5] * 0.2;
      const by = H - blds[i + 6] + 0.35;
      lanternString(
        g,
        ax,
        ay,
        bx,
        by,
        0.5,
        0.1,
        rgba('#000000', 0.55),
        p.lamp,
        p.id !== 'dawn'
      );
    }
    if (p.id === 'sakura') {
      for (let i = 0; i < blds.length; i += 8) {
        const bx = blds[i] + ox + blds[i + 1];
        blossom(
          g,
          r,
          bx,
          H - blds[i + 2] - 0.4,
          0.75,
          mix(p.near, p.farLit, 0.4),
          mix(p.farLit, '#ffffff', 0.2)
        );
      }
    }
  }
  const mist = g.createLinearGradient(0, H - 2.2, 0, H);
  mist.addColorStop(0, rgba(p.nearMist, 0));
  mist.addColorStop(1, rgba(p.nearMist, 0.55));
  g.fillStyle = mist;
  g.fillRect(0, H - 2.2, TW, 2.2);
}

/**
 * Start a theme's backdrop: the sky, its sun or moon, clouds and the
 * weather's sprites. The three layers come one per backdropStep() call, so a
 * theme can be baked ahead of time a frame at a time.
 */
/** A theme's sky: cheap to start, the rest comes a job at a time (backdropStep). */
export function startBackdrop(
  main: CanvasRenderingContext2D,
  p: Palette,
  W: number,
  H: number,
  ppu: number
): Backdrop {
  const sky = main.createLinearGradient(0, 0, 0, H);
  for (const [s, c] of p.sky) sky.addColorStop(s, c);
  const none = blank();
  return {
    pal: p,
    W,
    H,
    ppu,
    sky,
    sun: none,
    halo: none,
    clouds: [],
    layers: [],
    ready: false,
    job: 0,
    alley: none,
    bolt: null,
    petal: [],
    spark: [],
    ink: [],
  };
}

/** The weather's small sprites, and the street's dark under the town. */
function bakeWeatherSprites(b: Backdrop) {
  const p = b.pal;
  const ppu = b.ppu;
  let bolt: Sprite | null = null;
  if (p.weather.lightning) {
    const r = mulberry32(5);
    const w = 2.4 * ppu;
    const h = 9 * ppu;
    bolt = bakeSprite(w, h, w / 2, 0, (g) => {
      g.beginPath();
      let x = w / 2;
      let y = 0;
      g.moveTo(x, y);
      while (y < h * 0.95) {
        x += (r() - 0.5) * ppu * 0.7;
        y += ppu * (0.25 + r() * 0.35);
        g.lineTo(clamp(x, ppu * 0.3, w - ppu * 0.3), y);
      }
      // A glow from wide, faint strokes (cheaper to bake than a blur).
      const glow: [number, string][] = [
        [0.4, 'rgba(191, 248, 255, 0.12)'],
        [0.2, 'rgba(191, 248, 255, 0.3)'],
        [0.07, '#f2feff'],
      ];
      for (const [lw, col] of glow) {
        g.strokeStyle = col;
        g.lineWidth = Math.max(1.5, ppu * lw);
        g.stroke();
      }
    });
  }
  const petal = b.petal;
  const spark = b.spark;
  const ink = b.ink;
  if (p.weather.petals) {
    for (let k = 0; k < 3; k++) {
      const s = ppu * (0.22 + k * 0.05);
      petal.push(
        bakeSprite(s, s * 0.7, s / 2, s * 0.35, (g) => {
          g.fillStyle = k === 1 ? shade(p.petal, 0.25) : p.petal;
          g.beginPath();
          g.ellipse(s / 2, s * 0.35, s * 0.48, s * 0.28, 0, 0, TAU);
          g.fill();
          g.fillStyle = rgba('#ffffff', 0.35);
          g.beginPath();
          g.ellipse(s * 0.42, s * 0.28, s * 0.22, s * 0.1, -0.2, 0, TAU);
          g.fill();
        })
      );
    }
  }
  if (p.weather.fireworks) {
    const cols = [
      p.lamp[1],
      '#ff6b9a',
      '#7ae8ff',
      '#ffffff',
      p.lamp[0],
      '#b6ff7a',
    ];
    for (const c of cols) spark.push(glowSprite(ppu * 0.32, c, 0.15));
  }
  if (p.weather.ink) {
    const r = mulberry32(77);
    for (let k = 0; k < 3; k++) {
      const s = ppu * (2.2 + k * 0.8);
      ink.push(
        bakeSprite(s, s * 0.6, s / 2, s * 0.3, (g) => {
          for (let b = 0; b < 14; b++) {
            const x = s * (0.15 + r() * 0.7);
            const y = s * (0.18 + r() * 0.24);
            const rr = s * (0.06 + r() * 0.14);
            const gr = g.createRadialGradient(x, y, 0, x, y, rr);
            gr.addColorStop(0, rgba('#050304', 0.5));
            gr.addColorStop(1, rgba('#050304', 0));
            g.fillStyle = gr;
            g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
          }
        })
      );
    }
  }
  const alley = bakeSprite(4, 64, 0, 0, (g) => {
    const gr = g.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, mix(p.near, p.nearMist, 0.6));
    gr.addColorStop(0.35, p.near);
    gr.addColorStop(1, shade(p.near, -0.6));
    g.fillStyle = gr;
    g.fillRect(0, 0, 4, 64);
  });
  b.bolt = bolt;
  b.alley = alley;
}

/** Each layer is baked in this many vertical slices, one job each. */
const SLICES = 3;

/**
 * Bake the next small piece of a backdrop: the sun or moon, its halo, each
 * cloud, the weather's sprites, then each depth of town in three slices.
 * Each job is a few milliseconds, so a theme can be baked ahead of time
 * without a dropped frame. Returns true once the backdrop is complete.
 */
export function backdropStep(b: Backdrop): boolean {
  if (b.ready) return true;
  const p = b.pal;
  const nc = cloudCount(p);
  const j = b.job++;
  if (j === 0) b.sun = bakeSun(p, b.ppu);
  else if (j === 1) b.halo = bakeHalo(p, b.ppu);
  else if (j < 2 + nc) b.clouds.push(bakeCloud(p, b.ppu, j - 2));
  else if (j === 2 + nc) bakeWeatherSprites(b);
  else {
    const k = j - 3 - nc;
    const li = Math.floor(k / SLICES);
    bakeSlice(b, li, k % SLICES);
    b.ready = li === DEPTHS.length - 1 && k % SLICES === SLICES - 1;
  }
  return b.ready;
}

/**
 * One slice of one depth. The town is drawn whole each time, clipped to
 * the slice (its generator is seeded, so every slice draws the same town),
 * and the slice edges fall on whole pixels so no seam shows.
 */
function bakeSlice(b: Backdrop, li: number, slice: number) {
  const d = DEPTHS[li];
  const p = b.pal;
  const TWb = b.W / b.ppu + 2 / b.ppu;
  let L = b.layers[li];
  if (!L) {
    const s = b.ppu * d.q;
    L = {
      c: makeCanvas(TWb * s, d.h * s),
      w: TWb * b.ppu,
      h: d.h * b.ppu,
      fx: d.fx,
      fy: d.fy,
    };
    b.layers[li] = L;
  }
  const g = ctxOf(L.c);
  const k = L.c.width / TWb;
  const x0 = Math.round((L.c.width * slice) / SLICES);
  const x1 = Math.round((L.c.width * (slice + 1)) / SLICES);
  g.save();
  g.beginPath();
  g.rect(x0, 0, x1 - x0, L.c.height);
  g.clip();
  g.scale(k, L.c.height / d.h);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  if (li === 0) bakeFar(p, TWb, d.h, p.farKind, g);
  else if (li === 1) bakeTown(p, TWb, d.h, g);
  else bakeNear(p, TWb, d.h, g);
  g.restore();
  warm(L.c);
}

// ── Stars, shared by every theme ──────────────────────────────────────────

const STARS: number[] = [];
{
  const r = mulberry32(42);
  for (let i = 0; i < 110; i++)
    STARS.push(r(), r() * r(), 0.6 + r() * 1.3, Math.floor(r() * 4));
}
const STAR_RATE = [0.7, 1.3, 2.1, 0.45];
const STAR_PH = [0, 1.7, 3.1, 4.4];

// ── Weather ───────────────────────────────────────────────────────────────

/** Ambient motion for one theme: rain, lightning, petals, fireworks, ink. */
export class Weather {
  /** Rain streaks: x, y (fractions of the screen), length, speed. */
  private rain = new Float32Array(0);
  /** Petals: x, y (fractions), rot, spin, sway phase, sprite. */
  private petals = new Float32Array(0);
  /** Firework sparks: x, y, vx, vy (blocks), life, max, sprite; on > 0. */
  private sparks = new Float32Array(0);
  private sparkN = 0;
  private nextBurst = 1.2;
  /** Rockets climbing: x, y, vy, fuse (blocks / s). */
  private rockets = new Float32Array(4 * 4);
  /** Ink wisps: x, y (blocks from the screen's top-left), drift, phase, sprite. */
  private ink = new Float32Array(0);
  private nextFlash = 3.5;
  /** Seconds since the last flash: never two within two seconds. */
  private sinceFlash = 99;
  /** 0..1, the current lightning flash. */
  flash = 0;
  /**
   * The song has thunder of its own: lightning comes only on its cues
   * (strike), never at random, so every flash lands on a crack.
   */
  cued = false;
  private boltX = 0.5;
  private rnd = mulberry32(99);
  private lastCamX = NaN;

  /**
   * A thunder cue: one soft flash, if this theme has lightning. Photosafe:
   * at most one flash every two seconds, and none under reduced motion.
   */
  strike() {
    if (!this.p.weather.lightning || this.reduced || this.sinceFlash < 2)
      return;
    this.sinceFlash = 0;
    this.flash = 1;
    this.boltX = 0.15 + this.rnd() * 0.7;
  }

  constructor(
    private p: Palette,
    private reduced: boolean
  ) {
    const w = p.weather;
    if (w.rain) {
      const n = reduced ? 60 : 130;
      this.rain = new Float32Array(n * 4);
      for (let i = 0; i < n; i++) this.respawnRain(i, true);
    }
    if (w.petals) {
      const n = reduced ? 10 : 24;
      this.petals = new Float32Array(n * 6);
      for (let i = 0; i < n; i++) this.respawnPetal(i, true);
    }
    if (w.fireworks) this.sparks = new Float32Array(160 * 7);
    if (w.ink) {
      const n = 9;
      this.ink = new Float32Array(n * 5);
      for (let i = 0; i < n; i++) {
        this.ink[i * 5] = this.rnd() * 30;
        this.ink[i * 5 + 1] = 1 + this.rnd() * 6;
        this.ink[i * 5 + 2] = 0.2 + this.rnd() * 0.35;
        this.ink[i * 5 + 3] = this.rnd() * TAU;
        this.ink[i * 5 + 4] = i % 3;
      }
    }
  }

  private respawnRain(i: number, anywhere: boolean) {
    const r = this.rnd;
    const o = i * 4;
    this.rain[o] = r() * 1.3 - 0.1;
    this.rain[o + 1] = anywhere ? r() : -0.1 - r() * 0.2;
    this.rain[o + 2] = 0.03 + r() * 0.04;
    this.rain[o + 3] = 1.1 + r() * 0.7;
  }

  private respawnPetal(i: number, anywhere: boolean) {
    const r = this.rnd;
    const o = i * 6;
    this.petals[o] = anywhere ? r() : 0.3 + r() * 0.9;
    this.petals[o + 1] = anywhere ? r() : -0.05;
    this.petals[o + 2] = r() * TAU;
    this.petals[o + 3] = (r() - 0.5) * 4;
    this.petals[o + 4] = r() * TAU;
    this.petals[o + 5] = Math.floor(r() * 3);
  }

  /** Advance by dt seconds of ambient time. */
  update(dt: number, v: BackView) {
    const r = this.rnd;
    // How far the level scrolled (blocks): petals and rain blow past with it.
    const scroll = Number.isNaN(this.lastCamX)
      ? 0
      : clamp(v.camX - this.lastCamX, -2, 2);
    this.lastCamX = v.camX;
    const viewW = v.W / v.ppu;
    const viewH = v.H / v.ppu;
    for (let i = 0; i < this.rain.length; i += 4) {
      this.rain[i + 1] += dt * this.rain[i + 3];
      this.rain[i] -= dt * this.rain[i + 3] * 0.18 + (scroll / viewW) * 0.35;
      if (this.rain[i + 1] > 1.05 || this.rain[i] < -0.15)
        this.respawnRain(i / 4, false);
    }
    for (let i = 0; i < this.petals.length; i += 6) {
      this.petals[i] -= dt * 0.035 + (scroll / viewW) * 0.55;
      this.petals[i + 1] +=
        dt * (0.05 + 0.03 * Math.sin(v.now * 0.9 + this.petals[i + 4]));
      this.petals[i] += Math.sin(v.now * 1.6 + this.petals[i + 4]) * dt * 0.02;
      this.petals[i + 2] += dt * this.petals[i + 3];
      if (this.petals[i + 1] > 1.05 || this.petals[i] < -0.05)
        this.respawnPetal(i / 6, false);
    }
    this.sinceFlash += dt;
    if (this.p.weather.lightning && !this.reduced && !this.cued) {
      this.nextFlash -= dt;
      if (this.nextFlash <= 0) {
        // No song to follow: rare and soft, at random.
        this.nextFlash = 2.6 + r() * 5;
        this.strike();
      }
    }
    this.flash = Math.max(0, this.flash - dt * 2.4);
    if (this.sparks.length) {
      this.nextBurst -= dt;
      if (this.nextBurst <= 0) {
        this.nextBurst = (this.reduced ? 2.6 : 1.1) + r() * 1.8;
        for (let k = 0; k < 4; k++) {
          const o = k * 4;
          if (this.rockets[o + 3] > 0) continue;
          this.rockets[o] = viewW * (0.15 + r() * 0.75);
          this.rockets[o + 1] = viewH + 0.5;
          this.rockets[o + 2] = 9 + r() * 3;
          this.rockets[o + 3] = 0.5 + r() * 0.35;
          break;
        }
      }
      for (let k = 0; k < 4; k++) {
        const o = k * 4;
        if (this.rockets[o + 3] <= 0) continue;
        this.rockets[o + 1] -= this.rockets[o + 2] * dt;
        this.rockets[o + 3] -= dt;
        if (this.rockets[o + 3] <= 0)
          this.burst(this.rockets[o], this.rockets[o + 1]);
      }
      for (let i = 0; i < this.sparkN; i++) {
        const o = i * 7;
        if (this.sparks[o + 4] <= 0) continue;
        this.sparks[o + 4] -= dt;
        this.sparks[o] += this.sparks[o + 2] * dt;
        this.sparks[o + 1] += this.sparks[o + 3] * dt;
        this.sparks[o + 3] += 2.2 * dt;
        this.sparks[o + 2] *= 1 - 1.2 * dt;
        this.sparks[o + 3] *= 1 - 1.2 * dt;
      }
    }
    for (let i = 0; i < this.ink.length; i += 5) {
      this.ink[i] -= dt * this.ink[i + 2] + scroll * 0.25;
      if (this.ink[i] < -4) {
        this.ink[i] = viewW + 3 + r() * 6;
        this.ink[i + 1] = 1 + r() * Math.max(2, viewH - 5);
      }
    }
  }

  private burst(x: number, y: number) {
    const r = this.rnd;
    const n = this.reduced ? 18 : 30;
    const col = Math.floor(r() * 6);
    const speed = 2.6 + r() * 1.6;
    let made = 0;
    for (let i = 0; i < 160 && made < n; i++) {
      const o = i * 7;
      if (this.sparks[o + 4] > 0) continue;
      const a = (made / n) * TAU + r() * 0.2;
      this.sparks[o] = x;
      this.sparks[o + 1] = y;
      this.sparks[o + 2] = Math.cos(a) * speed;
      this.sparks[o + 3] = Math.sin(a) * speed;
      this.sparks[o + 4] = 1.1 + r() * 0.5;
      this.sparks[o + 5] = this.sparks[o + 4];
      this.sparks[o + 6] = made % 3 === 0 ? 3 : col;
      if (i + 1 > this.sparkN) this.sparkN = i + 1;
      made++;
    }
  }

  /** Behind the town: lightning, fireworks. */
  drawSky(
    ctx: CanvasRenderingContext2D,
    b: Backdrop,
    alpha: number,
    v: BackView
  ) {
    if (this.flash > 0 && b.bolt) {
      const k = this.flash * this.flash;
      ctx.globalAlpha = alpha * 0.22 * k;
      ctx.fillStyle = '#d8fffa';
      ctx.fillRect(0, 0, v.W, v.H);
      ctx.globalAlpha = alpha * k;
      const bx = this.boltX * v.W - b.bolt.ax;
      ctx.drawImage(b.bolt.c, bx, 0, b.bolt.w, b.bolt.h);
    }
    if (this.sparkN > 0 && b.spark.length) {
      const s = v.ppu;
      for (let k = 0; k < 4; k++) {
        const o = k * 4;
        if (this.rockets[o + 3] <= 0) continue;
        ctx.globalAlpha = alpha * 0.9;
        const sp = b.spark[0];
        ctx.drawImage(
          sp.c,
          this.rockets[o] * s - sp.w * 0.25,
          this.rockets[o + 1] * s - sp.h * 0.25,
          sp.w * 0.5,
          sp.h * 0.5
        );
      }
      for (let i = 0; i < this.sparkN; i++) {
        const o = i * 7;
        const life = this.sparks[o + 4];
        if (life <= 0) continue;
        const k = life / this.sparks[o + 5];
        const sp = b.spark[this.sparks[o + 6]];
        ctx.globalAlpha = alpha * Math.min(1, k * 1.6);
        const z = 0.5 + k * 0.5;
        ctx.drawImage(
          sp.c,
          this.sparks[o] * s - sp.w * z * 0.5,
          this.sparks[o + 1] * s - sp.h * z * 0.5,
          sp.w * z,
          sp.h * z
        );
      }
    }
    ctx.globalAlpha = 1;
  }

  /** Between the town's depths: drifting ink. */
  drawMid(
    ctx: CanvasRenderingContext2D,
    b: Backdrop,
    alpha: number,
    v: BackView
  ) {
    if (!this.ink.length) return;
    const s = v.ppu;
    for (let i = 0; i < this.ink.length; i += 5) {
      const sp = b.ink[this.ink[i + 4]];
      const bob = Math.sin(v.now * 0.4 + this.ink[i + 3]) * 0.3;
      ctx.globalAlpha =
        alpha * (0.55 + 0.25 * Math.sin(v.now * 0.3 + this.ink[i + 3]));
      ctx.drawImage(
        sp.c,
        this.ink[i] * s - sp.ax,
        (this.ink[i + 1] + bob) * s - sp.ay,
        sp.w,
        sp.h
      );
    }
    ctx.globalAlpha = 1;
  }

  /** Behind the level, in front of the town: the far rain. */
  drawBack(ctx: CanvasRenderingContext2D, alpha: number, v: BackView) {
    if (!this.rain.length) return;
    this.strokeRain(ctx, alpha * 0.32, v, 0, this.rain.length * 0.6);
  }

  /** In front of everything: near rain and petals. */
  drawFront(
    ctx: CanvasRenderingContext2D,
    b: Backdrop,
    alpha: number,
    v: BackView
  ) {
    if (this.rain.length)
      this.strokeRain(
        ctx,
        alpha * 0.5,
        v,
        this.rain.length * 0.6,
        this.rain.length
      );
    if (this.petals.length && b.petal.length) {
      ctx.globalAlpha = alpha * 0.9;
      for (let i = 0; i < this.petals.length; i += 6) {
        const sp = b.petal[this.petals[i + 5]];
        const a = this.petals[i + 2];
        const c = Math.cos(a);
        const s = Math.sin(a);
        ctx.setTransform(
          c,
          s,
          -s * 0.6,
          c * 0.6 + 0.4,
          this.petals[i] * v.W,
          this.petals[i + 1] * v.H
        );
        ctx.drawImage(sp.c, -sp.ax, -sp.ay, sp.w, sp.h);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
    }
  }

  private strokeRain(
    ctx: CanvasRenderingContext2D,
    a: number,
    v: BackView,
    from: number,
    to: number
  ) {
    from = Math.floor(from / 4) * 4;
    ctx.globalAlpha = a;
    ctx.strokeStyle = '#c8f0ee';
    ctx.lineWidth = Math.max(1, v.ppu * 0.03);
    ctx.beginPath();
    for (let i = from; i < to; i += 4) {
      const x = this.rain[i] * v.W;
      const y = this.rain[i + 1] * v.H;
      const l = this.rain[i + 2] * v.H;
      ctx.moveTo(x, y);
      ctx.lineTo(x - l * 0.2, y + l);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

// ── Drawing ───────────────────────────────────────────────────────────────

/** Sky, stars, sun or moon, clouds: everything above the town. */
export function drawSky(
  ctx: CanvasRenderingContext2D,
  b: Backdrop,
  alpha: number,
  v: BackView
) {
  const p = b.pal;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = b.sky;
  ctx.fillRect(0, 0, v.W, v.H);
  if (p.stars > 0) {
    const sh = v.H - 5 * v.ppu;
    const z = Math.max(1, v.ppu / 40);
    const slow = v.reduced ? 0.4 : 1;
    ctx.fillStyle = '#ffffff';
    for (let bucket = 0; bucket < 4; bucket++) {
      const tw = Math.sin(v.now * STAR_RATE[bucket] * slow + STAR_PH[bucket]);
      ctx.globalAlpha = alpha * p.stars * (0.3 + 0.7 * tw * tw);
      ctx.beginPath();
      for (let i = 0; i < STARS.length; i += 4) {
        if (STARS[i + 3] !== bucket) continue;
        const s = STARS[i + 2] * z;
        ctx.rect(STARS[i] * v.W, STARS[i + 1] * sh, s, s);
      }
      ctx.fill();
    }
  }
  // The sun or moon sits a fixed height above the street line, and sinks a
  // little as the camera climbs.
  const o = p.orb;
  const ox = o.x * v.W;
  const oy = v.H - (1 - o.y) * 11.5 * v.ppu + v.camY * v.ppu * 0.04;
  // The halo breathes with the song, and swells a little on its big hits.
  const z = 1 + 0.04 * v.pulse + 0.05 * v.accent;
  ctx.globalAlpha = alpha * Math.min(1, 0.82 + 0.18 * v.pulse + 0.1 * v.accent);
  ctx.drawImage(
    b.halo.c,
    ox - b.halo.ax * z,
    oy - b.halo.ay * z,
    b.halo.w * z,
    b.halo.h * z
  );
  ctx.globalAlpha = alpha;
  ctx.drawImage(b.sun.c, ox - b.sun.ax, oy - b.sun.ay, b.sun.w, b.sun.h);
  for (let i = 0; i < b.clouds.length; i++) {
    const c = b.clouds[i];
    const span = v.W + c.w + v.ppu * 2;
    const speed = (p.weather.rain ? 1.1 : 0.25) + i * 0.12;
    const x =
      v.W -
      mod(
        v.camX * v.ppu * 0.03 + v.now * speed * v.ppu + i * 0.37 * span,
        span
      );
    const y =
      v.H -
      (8.6 - i * (p.weather.rain ? 0.9 : 1.5)) * v.ppu * 1.08 +
      v.camY * v.ppu * 0.06;
    ctx.drawImage(c.c, x, y - c.h / 2, c.w, c.h);
  }
  ctx.globalAlpha = 1;
}

/** One depth of the town (0 far, 1 mid, 2 near), tiled and parallaxed. */
export function drawLayer(
  ctx: CanvasRenderingContext2D,
  b: Backdrop,
  i: number,
  alpha: number,
  v: BackView
) {
  const L = b.layers[i];
  if (!L) return;
  const ox = -Math.round(mod(v.camX * v.ppu * L.fx, L.w));
  // The layers stand on the roof line, and sink more slowly than the level
  // when the camera climbs.
  const bottom = Math.round(v.H - BASE * v.ppu + v.camY * v.ppu * L.fy);
  const top = bottom - L.h;
  if (top >= v.H) return;
  ctx.globalAlpha = alpha;
  ctx.drawImage(L.c, ox, top, L.w + 1, L.h);
  ctx.drawImage(L.c, ox + L.w, top, L.w + 1, L.h);
  if (i === 2 && bottom < v.H) {
    // Down the gaps between roofs: the street's dark.
    ctx.drawImage(
      b.alley.c,
      0,
      bottom - 1,
      v.W,
      Math.max(BASE * v.ppu, v.H - bottom) + 1
    );
  }
  ctx.globalAlpha = 1;
}
