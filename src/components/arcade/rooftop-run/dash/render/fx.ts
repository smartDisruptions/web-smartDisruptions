/**
 * Particles: one pool of 300, struct-of-arrays, no allocation once made.
 * Jump dust, landing puffs, orb and drum bursts, gate flashes, wind
 * streaks, the scroll sparkle, the parasol's gust, shadow-step smoke, the
 * death shatter and its ink, the finish fireworks, and the skin trails.
 *
 * Positions are in blocks (world space, y up), so particles stay put while
 * the camera moves. Everything is drawn from small baked sprites.
 */
import {
  TAU,
  bakeSprite,
  glowSprite,
  mulberry32,
  rgba,
  shade,
  type Sprite,
} from './util';

/** Particle kinds. */
export const K = {
  Dot: 0,
  Puff: 1,
  Ring: 2,
  Shard: 3,
  Ink: 4,
  Streak: 5,
  Petal: 6,
  Star: 7,
} as const;

const N = 300;

/** Colours particles come in. Index into this with `col`. */
export const FX_COL = [
  '#ffffff', // 0 white
  '#ffcf70', // 1 gold
  '#d6d0ee', // 2 dust
  '#ff8a3d', // 3 ember
  '#ffe08a', // 4 spark
  '#ffd23f', // 5 yellow
  '#ff6fbf', // 6 pink
  '#ff4a3a', // 7 red
  '#3db4ff', // 8 blue
  '#46f08a', // 9 green
  '#9a6aff', // 10 violet (the black orb)
  '#5cf27e', // 11 fast
  '#43d2ff', // 12 normal
  '#ff5ad6', // 13 faster
  '#ffad3d', // 14 slow
  '#ff4040', // 15 fastest
  '#ff4a2a', // 16 vermilion
  '#ffb7d4', // 17 petal
  '#4ade80', // 18 practice green
  '#7a6aa8', // 19 shadow smoke
];
const colIndex = new Map(FX_COL.map((c, i) => [c, i]));
export function fxCol(c: string): number {
  return colIndex.get(c) ?? 0;
}

// Kiru's colours, for the shatter (the band colour is the skin's).
const KIRU = ['#252d56', '#2e3970', '#f6d0a8', '#cfd5e2', '#3d4c95', '#13152a'];

export class Fx {
  x = new Float32Array(N);
  y = new Float32Array(N);
  vx = new Float32Array(N);
  vy = new Float32Array(N);
  life = new Float32Array(N);
  max = new Float32Array(N);
  size = new Float32Array(N);
  rot = new Float32Array(N);
  vr = new Float32Array(N);
  grav = new Float32Array(N);
  drag = new Float32Array(N);
  kind = new Uint8Array(N);
  col = new Uint8Array(N);
  front = new Uint8Array(N);
  private top = 0;
  private cursor = 0;
  private r = mulberry32(1234);

  /** Baked at the current scale. */
  private dots: Sprite[] = [];
  private rings: Sprite[] = [];
  private puffs: Sprite[] = [];
  private shards: Sprite[] = [];
  private inks: Sprite[] = [];
  private petal: Sprite | null = null;
  private star: Sprite | null = null;
  private band = '';
  /** Pixels per block the sprites were baked at (0: not yet). */
  scale = 0;

  /** Screen shake, in blocks, and its phase. */
  shake = 0;
  private shakeT = 0;

  bake(ppu: number, band: string) {
    this.scale = ppu;
    this.dots = FX_COL.map((c) => glowSprite(ppu * 0.5, c, 0.25));
    this.rings = FX_COL.map((c) =>
      bakeSprite(ppu * 2, ppu * 2, ppu, ppu, (g) => {
        g.strokeStyle = c;
        g.lineWidth = ppu * 0.07;
        g.beginPath();
        g.arc(ppu, ppu, ppu * 0.9, 0, TAU);
        g.stroke();
      })
    );
    const puff = (c: string, a: number) =>
      bakeSprite(ppu * 1.2, ppu * 1.2, ppu * 0.6, ppu * 0.6, (g) => {
        const c0 = ppu * 0.6;
        const gr = g.createRadialGradient(c0, c0, 0, c0, c0, c0);
        gr.addColorStop(0, rgba(c, a));
        gr.addColorStop(0.6, rgba(c, a * 0.5));
        gr.addColorStop(1, rgba(c, 0));
        g.fillStyle = gr;
        g.fillRect(0, 0, ppu * 1.2, ppu * 1.2);
      });
    this.puffs = [
      puff('#e8e4f4', 0.7),
      puff('#1a1428', 0.85),
      puff('#7a6aa8', 0.6),
    ];
    const r = mulberry32(8);
    this.inks = [0, 1, 2].map(() =>
      bakeSprite(ppu * 1.4, ppu * 1.4, ppu * 0.7, ppu * 0.7, (g) => {
        g.fillStyle = '#0b0912';
        g.beginPath();
        for (let k = 0; k < 7; k++) {
          const a = r() * TAU;
          const d = r() * ppu * 0.32;
          const rr = ppu * (0.12 + r() * 0.16);
          g.moveTo(
            ppu * 0.7 + Math.cos(a) * d + rr,
            ppu * 0.7 + Math.sin(a) * d
          );
          g.arc(
            ppu * 0.7 + Math.cos(a) * d,
            ppu * 0.7 + Math.sin(a) * d,
            rr,
            0,
            TAU
          );
        }
        g.fill();
      })
    );
    this.petal = bakeSprite(
      ppu * 0.3,
      ppu * 0.2,
      ppu * 0.15,
      ppu * 0.1,
      (g) => {
        g.fillStyle = '#ffb7d4';
        g.beginPath();
        g.ellipse(ppu * 0.15, ppu * 0.1, ppu * 0.14, ppu * 0.08, 0, 0, TAU);
        g.fill();
      }
    );
    this.star = bakeSprite(ppu * 0.6, ppu * 0.6, ppu * 0.3, ppu * 0.3, (g) => {
      g.translate(ppu * 0.3, ppu * 0.3);
      g.fillStyle = '#ffffff';
      g.beginPath();
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU;
        g.lineTo(Math.cos(a) * ppu * 0.28, Math.sin(a) * ppu * 0.28);
        g.lineTo(
          Math.cos(a + TAU / 8) * ppu * 0.06,
          Math.sin(a + TAU / 8) * ppu * 0.06
        );
      }
      g.closePath();
      g.fill();
    });
    this.band = '';
    this.setBand(band);
  }

  /** The shatter's shards wear the skin's headband colour too. */
  setBand(band: string) {
    if (band === this.band || !this.scale) return;
    this.band = band;
    const ppu = this.scale;
    const cols = KIRU.concat([band, shade(band, -0.25)]);
    const r = mulberry32(21);
    this.shards = cols.map((c) =>
      bakeSprite(ppu * 0.5, ppu * 0.5, ppu * 0.25, ppu * 0.25, (g) => {
        g.translate(ppu * 0.25, ppu * 0.25);
        g.fillStyle = c;
        g.strokeStyle = '#0b0d1a';
        g.lineWidth = ppu * 0.025;
        g.beginPath();
        const n = 3 + Math.floor(r() * 2);
        for (let k = 0; k < n; k++) {
          const a = (k / n) * TAU + r() * 0.6;
          const d = ppu * (0.1 + r() * 0.13);
          g.lineTo(Math.cos(a) * d, Math.sin(a) * d);
        }
        g.closePath();
        g.fill();
        g.stroke();
      })
    );
  }

  clear() {
    this.life.fill(0);
    this.max.fill(0);
    this.top = 0;
  }

  /** Add one particle (or quietly reuse the oldest slot when full). */
  spawn(
    kind: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    col = 0,
    grav = 0,
    drag = 0,
    front = 1
  ) {
    let i = -1;
    for (let k = 0; k < N; k++) {
      const j = (this.cursor + k) % N;
      if (this.life[j] >= this.max[j]) {
        i = j;
        break;
      }
    }
    if (i < 0) i = this.cursor;
    this.cursor = (i + 1) % N;
    this.x[i] = x;
    this.y[i] = y;
    this.vx[i] = vx;
    this.vy[i] = vy;
    this.life[i] = 0;
    this.max[i] = life;
    this.size[i] = size;
    this.rot[i] = this.r() * TAU;
    this.vr[i] = (this.r() - 0.5) * 12;
    this.grav[i] = grav;
    this.drag[i] = drag;
    this.kind[i] = kind;
    this.col[i] = col;
    this.front[i] = front;
    if (i + 1 > this.top) this.top = i + 1;
  }

  rnd() {
    return this.r();
  }

  /** A ring of `n` dots bursting from (x, y). */
  burst(
    x: number,
    y: number,
    n: number,
    speed: number,
    col: number,
    life = 0.5,
    size = 0.5,
    grav = 0
  ) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + this.r() * 0.4;
      const s = speed * (0.6 + this.r() * 0.5);
      this.spawn(
        K.Dot,
        x,
        y,
        Math.cos(a) * s,
        Math.sin(a) * s,
        life * (0.7 + this.r() * 0.5),
        size,
        col,
        grav,
        2.5
      );
    }
  }

  /** Kiru breaks apart: shards in his colours, and a splash of ink. */
  shatter(x: number, y: number, reduced: boolean) {
    const r = this.r;
    const n = reduced ? 16 : 30;
    for (let k = 0; k < n; k++) {
      const a = r() * TAU;
      const s = 4 + r() * 9;
      this.spawn(
        K.Shard,
        x + (r() - 0.5) * 0.5,
        y + (r() - 0.5) * 0.9,
        Math.cos(a) * s,
        Math.sin(a) * s + 3,
        0.55 + r() * 0.35,
        0.8 + r() * 0.7,
        k % 8,
        26,
        1.2
      );
    }
    for (let k = 0; k < 5; k++) {
      const a = r() * TAU;
      this.spawn(
        K.Ink,
        x + Math.cos(a) * 0.3,
        y + Math.sin(a) * 0.3,
        Math.cos(a) * 1.2,
        Math.sin(a) * 1.2,
        0.6 + r() * 0.2,
        0.9 + r() * 0.7,
        0,
        0,
        3,
        0
      );
    }
    for (let k = 0; k < 14; k++) {
      const a = r() * TAU;
      const s = 3 + r() * 8;
      this.spawn(
        K.Ink,
        x,
        y,
        Math.cos(a) * s,
        Math.sin(a) * s,
        0.4 + r() * 0.2,
        0.18 + r() * 0.16,
        0,
        18,
        1.5
      );
    }
    this.spawn(K.Ring, x, y, 0, 0, 0.35, 1.6, 0, 0, 0);
  }

  /** Shadow step: a puff of smoke at both ends. */
  smoke(x: number, y: number) {
    // Ink-dark puffs with violet ones among them (they must show on the
    // darkest sky), a pale ring, and a few glints.
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * TAU;
      const sp = 1.6 + this.r() * 1.2;
      this.spawn(
        K.Puff,
        x + Math.cos(a) * 0.2,
        y + Math.sin(a) * 0.3,
        Math.cos(a) * sp,
        Math.sin(a) * sp,
        0.45 + this.r() * 0.2,
        0.7 + this.r() * 0.4,
        k % 2 ? 2 : 1,
        0,
        4
      );
    }
    this.spawn(K.Ring, x, y, 0, 0, 0.3, 1.1, 19, 0, 0);
    for (let k = 0; k < 6; k++) {
      const a = this.r() * TAU;
      this.spawn(
        K.Star,
        x,
        y,
        Math.cos(a) * 3.5,
        Math.sin(a) * 3.5,
        0.35,
        0.45,
        0,
        0,
        3
      );
    }
  }

  /**
   * A firework in the world: a ring of gold and colour, with a little fall.
   * `scale` below 1 makes a small, quiet one (behind the end card).
   */
  firework(x: number, y: number, col: number, reduced: boolean, scale = 1) {
    // A peony: an outer shell, a slower inner one, a little glitter, all
    // slightly irregular so it never reads as a dotted circle.
    const r = this.r;
    const n = Math.round((reduced ? 18 : 30) * (0.4 + 0.6 * scale));
    const base = (5.5 + r() * 1.5) * scale;
    const big = 0.55 + 0.45 * scale;
    const fall = 2.6 * scale;
    // A small one is also brief: it is gone well before a big one would be.
    const life = 0.5 + 0.5 * scale;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * TAU + (r() - 0.5) * 0.25;
      const s = base * (0.82 + r() * 0.3);
      this.spawn(
        K.Dot,
        x,
        y,
        Math.cos(a) * s,
        Math.sin(a) * s,
        (1 + r() * 0.5) * life,
        (0.45 + r() * 0.25) * big,
        col,
        fall,
        1.7
      );
    }
    for (let k = 0; k < n / 2; k++) {
      const a = r() * TAU;
      const s = base * (0.3 + r() * 0.3);
      this.spawn(
        K.Dot,
        x,
        y,
        Math.cos(a) * s,
        Math.sin(a) * s,
        (0.8 + r() * 0.4) * life,
        0.4 * big,
        1,
        fall,
        1.8
      );
    }
    if (!reduced && scale >= 1) {
      for (let k = 0; k < 6; k++) {
        const a = r() * TAU;
        const s = base * (0.5 + r() * 0.5);
        this.spawn(
          K.Star,
          x,
          y,
          Math.cos(a) * s,
          Math.sin(a) * s,
          0.9,
          0.6,
          0,
          2.2,
          1.6
        );
      }
    }
    this.spawn(K.Ring, x, y, 0, 0, 0.35, 1.4 * scale, col, 0, 0);
  }

  update(dt: number) {
    for (let i = 0; i < this.top; i++) {
      if (this.life[i] >= this.max[i]) continue;
      this.life[i] += dt;
      const d = 1 - Math.min(1, this.drag[i] * dt);
      this.vx[i] *= d;
      this.vy[i] = this.vy[i] * d - this.grav[i] * dt;
      this.x[i] += this.vx[i] * dt;
      this.y[i] += this.vy[i] * dt;
      this.rot[i] += this.vr[i] * dt;
    }
    while (this.top > 0 && this.life[this.top - 1] >= this.max[this.top - 1])
      this.top--;
    this.shakeT += dt;
    this.shake = Math.max(0, this.shake - dt * 0.8);
  }

  /** Shake offset in canvas pixels (0 if none). */
  shakeX(ppu: number) {
    return this.shake > 0 ? Math.sin(this.shakeT * 71) * this.shake * ppu : 0;
  }
  shakeY(ppu: number) {
    return this.shake > 0 ? Math.cos(this.shakeT * 57) * this.shake * ppu : 0;
  }

  /** Draw the particles of one layer (0: behind Kiru, 1: in front). */
  draw(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    ppu: number,
    front: number
  ) {
    if (!this.dots.length) return;
    for (let i = 0; i < this.top; i++) {
      if (this.life[i] >= this.max[i] || this.front[i] !== front) continue;
      const k = this.life[i] / this.max[i];
      const x = this.x[i] * ppu + ox;
      const y = oy - this.y[i] * ppu;
      const s = this.size[i];
      switch (this.kind[i]) {
        case K.Dot: {
          const sp = this.dots[this.col[i]];
          const z = s * (1 - k * 0.5);
          ctx.globalAlpha = 1 - k * k;
          ctx.drawImage(
            sp.c,
            x - (sp.w * z) / 2,
            y - (sp.h * z) / 2,
            sp.w * z,
            sp.h * z
          );
          break;
        }
        case K.Puff: {
          const sp = this.puffs[this.col[i]];
          const z = s * (0.6 + k * 0.9);
          ctx.globalAlpha = (1 - k) * 0.9;
          ctx.drawImage(
            sp.c,
            x - (sp.w * z) / 2,
            y - (sp.h * z) / 2,
            sp.w * z,
            sp.h * z
          );
          break;
        }
        case K.Ring: {
          const sp = this.rings[this.col[i]];
          const z = s * (0.25 + k * 0.9);
          ctx.globalAlpha = (1 - k) * 0.85;
          ctx.drawImage(
            sp.c,
            x - (sp.w * z) / 2,
            y - (sp.h * z) / 2,
            sp.w * z,
            sp.h * z
          );
          break;
        }
        case K.Shard: {
          const sp = this.shards[this.col[i] % this.shards.length];
          if (!sp) break;
          ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
          const c = Math.cos(this.rot[i]) * s;
          const sn = Math.sin(this.rot[i]) * s;
          ctx.setTransform(c, sn, -sn, c, x, y);
          ctx.drawImage(sp.c, -sp.ax, -sp.ay, sp.w, sp.h);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          break;
        }
        case K.Ink: {
          const sp = this.inks[i % 3];
          const z = s * (0.5 + Math.min(1, k * 3) * 0.6);
          ctx.globalAlpha = (1 - k) * 0.85;
          ctx.drawImage(
            sp.c,
            x - (sp.w * z) / 2,
            y - (sp.h * z) / 2,
            sp.w * z,
            sp.h * z
          );
          break;
        }
        case K.Streak: {
          const sp = this.dots[this.col[i]];
          ctx.globalAlpha = (1 - k) * 0.6;
          ctx.drawImage(
            sp.c,
            x - sp.w * s * 2,
            y - sp.h * 0.1,
            sp.w * s * 4,
            sp.h * 0.2
          );
          break;
        }
        case K.Petal: {
          const sp = this.petal;
          if (!sp) break;
          ctx.globalAlpha = 1 - k;
          const c = Math.cos(this.rot[i]) * s;
          const sn = Math.sin(this.rot[i]) * s;
          ctx.setTransform(c, sn, -sn * 0.6, c * 0.6, x, y);
          ctx.drawImage(sp.c, -sp.ax, -sp.ay, sp.w, sp.h);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          break;
        }
        case K.Star: {
          const sp = this.star;
          if (!sp) break;
          const z = s * Math.sin(k * Math.PI);
          ctx.globalAlpha = 1;
          const c = Math.cos(this.rot[i]) * z;
          const sn = Math.sin(this.rot[i]) * z;
          ctx.setTransform(c, sn, -sn, c, x, y);
          ctx.drawImage(sp.c, -sp.ax, -sp.ay, sp.w, sp.h);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          break;
        }
        default:
          break;
      }
    }
    ctx.globalAlpha = 1;
  }
}
