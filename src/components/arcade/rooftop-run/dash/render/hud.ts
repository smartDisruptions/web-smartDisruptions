/**
 * The in-canvas HUD: the progress bar at the top centre (green in
 * practice) with a tick at the best, "Attempt N" written in the world near
 * where the attempt began, the "NEW BEST" flourish
 * and "LEVEL COMPLETE".
 *
 * Screen text is laid out in CSS pixels, so it is the same size on every
 * screen. Words that don't change are baked into sprites once per size.
 */
import { bakeSprite, clamp, rgba, smooth, type Sprite } from './util';

/**
 * "LEVEL COMPLETE" holds for a second, then fades out and is gone by this
 * many seconds into the finish: the shell's end card arrives at 1.6 s.
 */
export const COMPLETE_GONE = 1.4;
const COMPLETE_FADE = 0.4;

const PCT: string[] = [];
for (let i = 0; i <= 100; i++) PCT.push(`${i}%`);

export class Hud {
  private font = '';
  private dpr = 1;
  private cssW = 0;
  private cssH = 0;
  private barFill: CanvasGradient | null = null;
  private barPractice: CanvasGradient | null = null;
  private barX = 0;
  private barW = 0;
  private complete: Sprite | null = null;
  private newBest: Sprite | null = null;
  private attempt: Sprite | null = null;
  private attemptN = -1;
  private attemptPpu = 0;
  private fontOk = false;
  /** Font strings, made once per size rather than every frame. */
  private pctFont = '';
  private bestFont = '';
  private bestPx = 0;

  constructor(font: string) {
    this.font = font;
  }

  /** Bake for a new size (CSS px and device pixel ratio). */
  resize(
    ctx: CanvasRenderingContext2D,
    cssW: number,
    cssH: number,
    dpr: number
  ) {
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = dpr;
    // Centred, unless that would run under the shell's buttons in the
    // top-right corner (up to three 44px buttons): then from the left.
    const reserve = 165;
    this.barW = Math.min(380, Math.max(150, cssW * 0.4));
    this.barX = (cssW - this.barW) / 2;
    if (this.barX + this.barW + 52 > cssW - reserve) {
      this.barX = 14;
      this.barW = Math.max(90, cssW - reserve - 52 - 14);
    }
    const mk = (a: string, b: string) => {
      const g = ctx.createLinearGradient(
        this.barX * dpr,
        0,
        (this.barX + this.barW) * dpr,
        0
      );
      g.addColorStop(0, a);
      g.addColorStop(1, b);
      return g;
    };
    // Made in device pixels: the bar is drawn with an identity transform.
    this.barFill = mk('#ff6a3d', '#ffd36b');
    this.barPractice = mk('#2fbf6a', '#8dffb8');
    this.pctFont = `400 ${Math.round(13 * dpr)}px ${this.font}`;
    this.bestPx = Math.round(Math.min(46, cssW / 13) * dpr);
    this.bestFont = `400 ${this.bestPx}px ${this.font}`;
    this.fontOk = this.fontReady();
    this.complete = this.word(
      'LEVEL COMPLETE',
      Math.min(64, cssW / 11),
      '#ffffff',
      '#ffcf70'
    );
    this.newBest = this.word(
      'NEW BEST',
      Math.min(34, cssW / 18),
      '#fff4d0',
      '#ffcf70'
    );
    this.attemptN = -1;
  }

  private fontReady() {
    try {
      return document.fonts.check(`40px ${this.font}`);
    } catch {
      return true;
    }
  }

  /** If the display face arrived after we baked, bake the words again. */
  refreshFont(ctx: CanvasRenderingContext2D) {
    if (this.fontOk || !this.cssW) return;
    if (this.fontReady()) this.resize(ctx, this.cssW, this.cssH, this.dpr);
  }

  /**
   * A word in the display face: gradient fill, ink outline, soft drop. It
   * shrinks to fit a narrow screen with a margin each side (a phone held
   * upright would otherwise clip "LEVEL COMPLETE").
   */
  private word(
    text: string,
    cssPx: number,
    top: string,
    bottom: string
  ): Sprite {
    let px = cssPx * this.dpr;
    const probe = document.createElement('canvas').getContext('2d')!;
    probe.font = `400 ${px}px ${this.font}`;
    const fit = (this.cssW * this.dpr * 0.88) / probe.measureText(text).width;
    if (fit < 1) {
      px = Math.floor(px * fit);
      probe.font = `400 ${px}px ${this.font}`;
    }
    const w = probe.measureText(text).width + px * 0.9;
    const h = px * 1.8;
    return bakeSprite(w, h, w / 2, h / 2, (g) => {
      g.font = `400 ${px}px ${this.font}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.fillStyle = rgba('#000000', 0.45);
      g.fillText(text, w / 2 + px * 0.04, h / 2 + px * 0.1);
      g.strokeStyle = '#120a14';
      g.lineWidth = px * 0.2;
      g.strokeText(text, w / 2, h / 2);
      const gr = g.createLinearGradient(0, h / 2 - px / 2, 0, h / 2 + px / 2);
      gr.addColorStop(0, top);
      gr.addColorStop(1, bottom);
      g.fillStyle = gr;
      g.fillText(text, w / 2, h / 2);
      g.strokeStyle = rgba('#ffffff', 0.5);
      g.lineWidth = Math.max(1, px * 0.025);
      g.strokeText(text, w / 2, h / 2 - px * 0.02);
    });
  }

  /** "Attempt N", baked once per attempt at the world's scale. */
  attemptSprite(n: number, ppu: number): Sprite {
    if (!this.attempt || n !== this.attemptN || ppu !== this.attemptPpu) {
      this.attemptN = n;
      this.attemptPpu = ppu;
      const px = ppu * 1.05;
      const text = `Attempt ${n}`;
      const probe = document.createElement('canvas').getContext('2d')!;
      probe.font = `400 ${px}px ${this.font}`;
      const w = probe.measureText(text).width + px;
      const h = px * 1.8;
      this.attempt = bakeSprite(w, h, w / 2, h / 2, (g) => {
        g.font = `400 ${px}px ${this.font}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.lineJoin = 'round';
        g.strokeStyle = rgba('#0a0814', 0.85);
        g.lineWidth = px * 0.18;
        g.strokeText(text, w / 2, h / 2);
        g.fillStyle = '#ffffff';
        g.fillText(text, w / 2, h / 2);
      });
    }
    return this.attempt;
  }

  /** The progress bar, top centre. */
  drawBar(
    ctx: CanvasRenderingContext2D,
    progress: number,
    best: number,
    practice: boolean,
    pulse: number
  ) {
    const d = this.dpr;
    const x = Math.round(this.barX * d);
    const y = Math.round(12 * d);
    const w = Math.round(this.barW * d);
    const h = Math.round(9 * d);
    const r = h / 2;
    ctx.fillStyle = rgba('#05040c', 0.6);
    ctx.beginPath();
    roundRect(ctx, x - 2 * d, y - 2 * d, w + 4 * d, h + 4 * d, r + 2 * d);
    ctx.fill();
    ctx.strokeStyle = rgba('#ffffff', 0.35);
    ctx.lineWidth = Math.max(1, d);
    ctx.stroke();
    const p = clamp(progress, 0, 1);
    if (p > 0) {
      ctx.fillStyle = (practice ? this.barPractice : this.barFill)!;
      ctx.beginPath();
      roundRect(ctx, x, y, Math.max(h, w * p), h, r);
      ctx.fill();
      ctx.fillStyle = rgba('#ffffff', 0.3 + 0.2 * pulse);
      ctx.fillRect(x + r, y + h * 0.18, Math.max(0, w * p - r * 2), h * 0.22);
    }
    if (best > 0.005) {
      const bx = Math.round(x + w * clamp(best, 0, 1));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx - d, y - 3 * d, 2 * d, h + 6 * d);
    }
    ctx.font = this.pctFont;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const pct = PCT[Math.floor(p * 100 + 1e-6)];
    ctx.fillStyle = rgba('#05040c', 0.7);
    ctx.fillText(pct, x + w + 9 * d, y + h / 2 + d);
    ctx.fillStyle = practice ? '#8dffb8' : '#ffffff';
    ctx.fillText(pct, x + w + 8 * d, y + h / 2);
  }

  /** "NEW BEST 47%": punches in, holds, fades. `t` seconds since it began. */
  drawNewBest(
    ctx: CanvasRenderingContext2D,
    t: number,
    percent: number,
    reduced: boolean
  ) {
    if (!this.newBest || t < 0 || t > 1.9) return;
    const d = this.dpr;
    const a = Math.min(1, t * 6) * (t > 1.5 ? 1 - (t - 1.5) / 0.4 : 1);
    const pop = reduced ? 1 : 1 + 0.35 * Math.exp(-t * 9) * Math.cos(t * 22);
    const cx = (this.cssW / 2) * d;
    const cy = this.cssH * 0.2 * d;
    const s = this.newBest;
    ctx.globalAlpha = a;
    ctx.drawImage(
      s.c,
      cx - (s.w * pop) / 2,
      cy - (s.h * pop) / 2,
      s.w * pop,
      s.h * pop
    );
    const px = this.bestPx;
    ctx.font = this.bestFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pct = PCT[clamp(Math.round(percent), 0, 100)];
    const y = cy + s.h * 0.52 + px * 0.35;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#120a14';
    ctx.lineWidth = px * 0.18;
    ctx.strokeText(pct, cx, y);
    ctx.fillStyle = '#ffcf70';
    ctx.fillText(pct, cx, y);
    ctx.globalAlpha = 1;
  }

  /**
   * "LEVEL COMPLETE" across the middle. `t` is seconds into the finish (the
   * phase's own clock, the one the shell times its end card by).
   */
  drawComplete(ctx: CanvasRenderingContext2D, t: number, reduced: boolean) {
    if (!this.complete || t >= COMPLETE_GONE) return;
    const d = this.dpr;
    const out =
      1 -
      smooth(
        clamp((t - (COMPLETE_GONE - COMPLETE_FADE)) / COMPLETE_FADE, 0, 1)
      );
    const a = Math.min(1, t * 4) * out;
    const pop = reduced ? 1 : 1 + 0.5 * Math.exp(-t * 7) * Math.cos(t * 18);
    const cx = (this.cssW / 2) * d;
    const cy = this.cssH * 0.42 * d;
    const s = this.complete;
    // A band of shadow behind it, sliding open.
    const open = reduced ? 1 : Math.min(1, t * 3.5);
    ctx.globalAlpha = 0.5 * a;
    ctx.fillStyle = '#07050d';
    const bh = s.h * 0.9;
    ctx.fillRect(
      cx - (this.cssW * d * open) / 2,
      cy - bh / 2,
      this.cssW * d * open,
      bh
    );
    ctx.globalAlpha = 0.9 * a;
    ctx.fillStyle = '#e8432a';
    ctx.fillRect(
      cx - (this.cssW * d * open) / 2,
      cy - bh / 2,
      this.cssW * d * open,
      Math.max(2, d * 2)
    );
    ctx.fillRect(
      cx - (this.cssW * d * open) / 2,
      cy + bh / 2 - Math.max(2, d * 2),
      this.cssW * d * open,
      Math.max(2, d * 2)
    );
    ctx.globalAlpha = a;
    ctx.drawImage(
      s.c,
      cx - (s.w * pop) / 2,
      cy - (s.h * pop) / 2,
      s.w * pop,
      s.h * pop
    );
    ctx.globalAlpha = 1;
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  // roundRect is Safari 16+; older browsers get square ends.
  if (typeof ctx.roundRect === 'function')
    ctx.roundRect(x, y, w, h, Math.min(r, h / 2, w / 2));
  else ctx.rect(x, y, w, h);
}
