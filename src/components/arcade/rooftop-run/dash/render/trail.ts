/**
 * What Kiru leaves behind him.
 *
 *  - The dragon's ribbon: in Dragon mode (Geometry Dash's wave), a ring
 *    buffer of his recent positions drawn as a zigzag ribbon in the skin's
 *    headband colour, bright at his end and fading behind.
 *  - Skin trails (ink, petals, sparks, embers, stars): particles emitted
 *    from where he is, through the shared pool in fx.ts.
 */
import type { TrailId } from '../types';
import { Fx, K, fxCol } from './fx';
import { shade } from './util';

const RIB = 96;

export class Trail {
  /** Ring buffer of world positions (blocks). */
  private xs = new Float32Array(RIB);
  private ys = new Float32Array(RIB);
  private head = 0;
  private n = 0;
  private acc = 0;
  private band = '';
  private core = '#ffffff';

  clear() {
    this.n = 0;
    this.head = 0;
  }

  /** Record where he is (call every frame while the ribbon should grow). */
  push(x: number, y: number) {
    if (this.n > 0) {
      const p = (this.head - 1 + RIB) % RIB;
      const dx = x - this.xs[p];
      const dy = y - this.ys[p];
      // A teleport or a respawn: start a new ribbon rather than draw a line.
      if (dx * dx + dy * dy > 9 || dx < -0.5) this.clear();
      else if (dx * dx + dy * dy < 0.0004) return;
    }
    this.xs[this.head] = x;
    this.ys[this.head] = y;
    this.head = (this.head + 1) % RIB;
    if (this.n < RIB) this.n++;
  }

  /** The ribbon: older parts fade, as the wave's trail does. */
  drawRibbon(
    ctx: CanvasRenderingContext2D,
    band: string,
    ox: number,
    oy: number,
    ppu: number,
    alpha: number
  ) {
    if (this.n < 2) return;
    if (band !== this.band) {
      this.band = band;
      this.core = shade(band, 0.55);
    }
    const chunks = 4;
    const per = Math.ceil(this.n / chunks);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) {
      ctx.strokeStyle = pass ? this.core : band;
      ctx.lineWidth = Math.max(2, ppu * (pass ? 0.09 : 0.26));
      for (let c = 0; c < chunks; c++) {
        const from = c * per;
        const to = Math.min(this.n - 1, from + per);
        if (to <= from) continue;
        ctx.globalAlpha = alpha * ((c + 1) / chunks) * (pass ? 0.9 : 0.95);
        ctx.beginPath();
        for (let k = from; k <= to; k++) {
          const j = (this.head - this.n + k + RIB) % RIB;
          const x = this.xs[j] * ppu + ox;
          const y = oy - this.ys[j] * ppu;
          if (k === from) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  /** Emit the skin's trail from (x, y) for dt seconds of running at `speed` blocks/s. */
  emit(
    fx: Fx,
    trail: TrailId,
    x: number,
    y: number,
    dt: number,
    speed: number,
    reduced: boolean
  ) {
    if (trail === 'none') return;
    const rate = (reduced ? 14 : 30) * (0.6 + speed / 26);
    this.acc += dt * rate;
    while (this.acc >= 1) {
      this.acc -= 1;
      const r = fx.rnd();
      const jx = (fx.rnd() - 0.5) * 0.4;
      const jy = (fx.rnd() - 0.5) * 0.6;
      switch (trail) {
        case 'ink':
          fx.spawn(
            K.Ink,
            x - 0.3 + jx,
            y + jy,
            -1 - r,
            -0.5,
            0.45,
            0.22 + r * 0.18,
            0,
            2,
            2,
            0
          );
          break;
        case 'petals':
          fx.spawn(
            K.Petal,
            x - 0.3 + jx,
            y + jy,
            -2 - r * 2,
            -0.6 - r,
            0.8,
            0.9 + r * 0.6,
            17,
            1.2,
            1,
            0
          );
          break;
        case 'sparks':
          fx.spawn(
            K.Dot,
            x - 0.3 + jx,
            y - 0.3 + jy,
            -3 - r * 3,
            2 + r * 2,
            0.4,
            0.35,
            fxCol('#ffe08a'),
            18,
            0.5,
            0
          );
          break;
        case 'embers':
          fx.spawn(
            K.Dot,
            x - 0.3 + jx,
            y + jy,
            -1 - r,
            1.2 + r * 1.5,
            0.7,
            0.4,
            fxCol('#ff8a3d'),
            -1,
            1,
            0
          );
          break;
        case 'stars':
          fx.spawn(
            K.Star,
            x - 0.3 + jx,
            y + jy,
            -1.5 * r,
            0,
            0.6,
            0.8 + r * 0.5,
            0,
            0,
            1,
            0
          );
          break;
        default:
          break;
      }
    }
  }
}
