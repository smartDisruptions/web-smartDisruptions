/**
 * Kiru's Rooftop Run: Dash — the wireframe renderer. Development only: the
 * engine loads it for the ` key (an overlay on top of the real art), and
 * test harnesses use it in place of the real renderer.
 *
 * It draws what the simulation sees rather than what the player sees:
 * solids, hazard hitboxes (moving ones where they are now), orbs and pads,
 * gates and corridor bounds, Kiru's solid and hazard boxes, practice
 * checkpoints, recent sim events, and an x ruler with a line at every bar of
 * the song (so a designer can see where the beat falls on the rooftops).
 */
import {
  CROW_R,
  GATE_H,
  HAZARD_SCALE,
  LANTERN_R,
  ORB_R,
  PAD_H,
  PAD_INSET,
  SAW_SCALE,
  SCROLL_R,
  VENT_INSET,
  lanternAngle,
  motionWave,
  spikeBox,
  ventActive,
  ventWarning,
} from './physics';
import {
  MODE_NAMES,
  SPEEDS,
  type DashRenderer,
  type LevelDef,
  type Obj,
  type RenderFrame,
  type RendererOptions,
  type SimEvent,
} from './types';

export interface DebugRendererOptions extends RendererOptions {
  /** Draw on top of the real renderer (no background) instead of in its place. */
  overlay?: boolean;
}

const TAU = Math.PI * 2;
const FLASHES = 24;

const COLORS = {
  bg: '#0b0d1a',
  grid: 'rgba(120, 140, 220, 0.12)',
  solid: 'rgba(170, 190, 255, 0.85)',
  solidFill: 'rgba(60, 70, 130, 0.35)',
  hazard: '#ff4057',
  hazardFill: 'rgba(255, 64, 87, 0.25)',
  player: '#6dff9a',
  bar: 'rgba(255, 207, 112, 0.35)',
  section: 'rgba(255, 207, 112, 0.85)',
  corridor: '#3de1ff',
  text: '#e8ecff',
} as const;

const ORB: Record<string, string> = {
  yellow: '#ffd23f',
  pink: '#ff7ab8',
  red: '#ff4b3e',
  blue: '#4aa8ff',
  green: '#4dff8a',
  black: '#c9c9d6',
};

export function createDebugRenderer(
  canvas: HTMLCanvasElement,
  opts: DebugRendererOptions
): DashRenderer {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available');
  const g = ctx;
  const overlay = !!opts.overlay;
  let dpr = 1;
  let level: LevelDef | null = null;
  let objs: Obj[] = [];
  /** The widest object: how far left of the view an object can start and still show. */
  let reach = 0;
  /** x of the start of every bar of the song, and which of them start a section. */
  let bars = new Float64Array(0);
  let sectionAt: (string | null)[] = [];
  // Recent events, drawn where they happened and fading.
  const fx = new Float64Array(FLASHES);
  const fy = new Float64Array(FLASHES);
  const ft = new Float64Array(FLASHES);
  const fl: string[] = new Array(FLASHES).fill('');
  let fn = 0;
  let lastT = 0;
  let fps = 0;
  let lastNow = 0;

  function measureBars(lv: LevelDef) {
    // Walk the level at its speeds (every speed portal taken) and note the
    // x where each bar of the song begins.
    const speeds = lv.objects
      .filter((o) => o.k === 'speed')
      .sort((a, b) => a.x - b.x) as Extract<Obj, { k: 'speed' }>[];
    const end = lv.objects.find((o) => o.k === 'end')?.x ?? 0;
    const barT = (4 * 60) / lv.bpm;
    const out: number[] = [];
    const names: (string | null)[] = [];
    const starts = new Map<number, string>();
    let b = 0;
    for (const s of lv.sections) {
      starts.set(b, s.name);
      b += s.bars;
    }
    let x = lv.start.x;
    let t = 0;
    let v = SPEEDS[lv.startSpeed];
    let si = 0;
    for (let k = 0; k < 4000; k++) {
      const target = k * barT;
      while (t < target) {
        const nextX = si < speeds.length ? speeds[si].x : Infinity;
        const dt = Math.min(target - t, (nextX - x) / v);
        x += v * dt;
        t += dt;
        if (si < speeds.length && x >= nextX - 1e-9) {
          v = SPEEDS[speeds[si].speed];
          si++;
        }
      }
      out.push(x);
      names.push(starts.get(k) ?? null);
      if (x > end + 40) break;
    }
    bars = Float64Array.from(out);
    sectionAt = names;
  }

  return {
    resize(_w, _h, d) {
      dpr = d;
    },
    setLevel(lv) {
      level = lv;
      objs = lv.objects;
      reach = 0;
      for (const o of objs) {
        const w =
          o.k === 'roof' || o.k === 'block'
            ? o.w
            : o.k === 'spike'
              ? (o.n ?? 1) + 1
              : o.k === 'lantern'
                ? o.len + 1
                : o.k === 'saw'
                  ? o.r
                  : o.k === 'deco' && o.d === 'lanterns'
                    ? (o.s ?? 6)
                    : 2;
        // A moving thing reaches as far as it swings.
        const m = 'move' in o && o.move ? Math.abs(o.move.dx) * 2 : 0;
        if (w + m > reach) reach = w + m;
      }
      measureBars(lv);
      fn = 0;
    },
    event(ev: SimEvent, f: RenderFrame) {
      const i = fn % FLASHES;
      fn++;
      fx[i] = ev.x;
      fy[i] = 'y' in ev ? ev.y : ev.y1;
      ft[i] = f.t;
      fl[i] = ev.e === 'death' ? `death:${ev.cause}` : ev.e;
    },
    draw(f: RenderFrame) {
      if (!level) return;
      const W = canvas.width;
      const H = canvas.height;
      const ppb = W / f.viewW;
      const cx = f.camX;
      const cy = f.camY;
      const sx = (x: number) => (x - cx) * ppb;
      const sy = (y: number) => H - (y - cy) * ppb;
      const beats = (f.t * level.bpm) / 60;
      const px1 = Math.max(1, dpr);
      const now = performance.now();
      if (lastNow) fps = fps * 0.9 + (1000 / Math.max(1, now - lastNow)) * 0.1;
      lastNow = now;

      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = 1;
      if (!overlay) {
        g.fillStyle = COLORS.bg;
        g.fillRect(0, 0, W, H);
      }

      // Grid: a line every block of height.
      g.strokeStyle = COLORS.grid;
      g.lineWidth = px1;
      g.beginPath();
      for (let y = Math.ceil(cy); y <= cy + f.viewH; y++) {
        g.moveTo(0, sy(y));
        g.lineTo(W, sy(y));
      }
      g.stroke();

      // Bar lines, section names.
      const fontPx = Math.round(11 * dpr);
      g.font = `600 ${fontPx}px ui-monospace, Menlo, Consolas, monospace`;
      g.textBaseline = 'top';
      for (let k = 0; k < bars.length; k++) {
        const x = bars[k];
        if (x < cx - 1 || x > cx + f.viewW + 1) continue;
        const name = sectionAt[k];
        g.strokeStyle = name ? COLORS.section : COLORS.bar;
        g.lineWidth = name ? 2 * px1 : px1;
        g.beginPath();
        g.moveTo(sx(x), 0);
        g.lineTo(sx(x), H);
        g.stroke();
        g.fillStyle = name ? COLORS.section : COLORS.bar;
        g.fillText(name ? `${k} ${name}` : `${k}`, sx(x) + 3 * dpr, 4 * dpr);
      }

      // Objects in view.
      const x0 = cx - 2;
      const x1 = cx + f.viewW + 2;
      let lo = 0;
      let hi = objs.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (objs[mid].x < x0 - reach) lo = mid + 1;
        else hi = mid;
      }
      const used = f.state.used;
      for (let i = lo; i < objs.length; i++) {
        const o = objs[i];
        if (o.x > x1) break;
        const done = used[i] === 1;
        g.globalAlpha = done ? 0.35 : 1;
        switch (o.k) {
          case 'roof': {
            g.fillStyle = COLORS.solidFill;
            g.fillRect(sx(o.x), sy(o.top), o.w * ppb, H - sy(o.top) + 2);
            g.strokeStyle = COLORS.solid;
            g.lineWidth = 2 * px1;
            g.strokeRect(sx(o.x), sy(o.top), o.w * ppb, H);
            break;
          }
          case 'block': {
            const m = o.move ? motionWave(o.move, beats) : 0;
            const bx = o.x + (o.move ? o.move.dx * m : 0);
            const by = o.y + (o.move ? o.move.dy * m : 0);
            g.fillStyle = COLORS.solidFill;
            g.fillRect(sx(bx), sy(by + o.h), o.w * ppb, o.h * ppb);
            g.strokeStyle = COLORS.solid;
            g.lineWidth = 2 * px1;
            g.strokeRect(sx(bx), sy(by + o.h), o.w * ppb, o.h * ppb);
            break;
          }
          case 'spike': {
            const n = o.n ?? 1;
            const h = o.small ? 0.5 : 1;
            const m = o.move ? motionWave(o.move, beats) : 0;
            const mx = o.move ? o.move.dx * m : 0;
            const my = o.move ? o.move.dy * m : 0;
            const dir = o.dir ?? 'up';
            g.strokeStyle = COLORS.hazard;
            g.lineWidth = px1;
            // The drawn caltrops...
            g.beginPath();
            for (let k = 0; k < n; k++) {
              if (dir === 'up' || dir === 'down') {
                const s = dir === 'up' ? 1 : -1;
                g.moveTo(sx(o.x + mx + k), sy(o.y + my));
                g.lineTo(sx(o.x + mx + k + 0.5), sy(o.y + my + s * h));
                g.lineTo(sx(o.x + mx + k + 1), sy(o.y + my));
              } else {
                const base = dir === 'right' ? o.x : o.x + 1;
                const s = dir === 'right' ? 1 : -1;
                g.moveTo(sx(base + mx), sy(o.y + my + k));
                g.lineTo(sx(base + mx + s * h), sy(o.y + my + k + 0.5));
                g.lineTo(sx(base + mx), sy(o.y + my + k + 1));
              }
            }
            g.stroke();
            // ...and the forgiving box the sim actually tests.
            const b = spikeBox(o);
            g.fillStyle = COLORS.hazardFill;
            g.fillRect(
              sx(b[0] + mx),
              sy(b[3] + my),
              (b[1] - b[0]) * ppb,
              (b[3] - b[2]) * ppb
            );
            g.strokeRect(
              sx(b[0] + mx),
              sy(b[3] + my),
              (b[1] - b[0]) * ppb,
              (b[3] - b[2]) * ppb
            );
            break;
          }
          case 'saw': {
            const m = o.move ? motionWave(o.move, beats) : 0;
            const ox = o.x + (o.move ? o.move.dx * m : 0);
            const oy = o.y + (o.move ? o.move.dy * m : 0);
            g.strokeStyle = COLORS.hazard;
            g.lineWidth = px1;
            g.beginPath();
            g.arc(sx(ox), sy(oy), o.r * ppb, 0, TAU);
            g.stroke();
            g.fillStyle = COLORS.hazardFill;
            g.beginPath();
            g.arc(sx(ox), sy(oy), o.r * SAW_SCALE * ppb, 0, TAU);
            g.fill();
            break;
          }
          case 'crow': {
            const m = o.move ? motionWave(o.move, beats) : 0;
            const ox = o.x + (o.move ? o.move.dx * m : 0);
            const oy = o.y + (o.move ? o.move.dy * m : 0);
            g.fillStyle = COLORS.hazardFill;
            g.strokeStyle = COLORS.hazard;
            g.lineWidth = px1;
            g.beginPath();
            g.arc(sx(ox), sy(oy), CROW_R * ppb, 0, TAU);
            g.fill();
            g.stroke();
            break;
          }
          case 'lantern': {
            const a = lanternAngle(o, beats);
            const bx = o.x + Math.sin(a) * o.len;
            const by = o.y - Math.cos(a) * o.len;
            g.strokeStyle = COLORS.solid;
            g.lineWidth = px1;
            g.beginPath();
            g.moveTo(sx(o.x), sy(o.y));
            g.lineTo(sx(bx), sy(by));
            g.stroke();
            g.fillStyle = COLORS.hazardFill;
            g.strokeStyle = COLORS.hazard;
            g.beginPath();
            g.arc(sx(bx), sy(by), LANTERN_R * ppb, 0, TAU);
            g.fill();
            g.stroke();
            break;
          }
          case 'vent': {
            const on = ventActive(o, beats);
            const warn = ventWarning(o, beats);
            const w = o.w ?? 1;
            g.lineWidth = px1;
            g.strokeStyle = 'rgba(255, 64, 87, 0.35)';
            g.strokeRect(sx(o.x), sy(o.y + o.h), w * ppb, o.h * ppb);
            if (on || warn) {
              // The deadly column is a little narrower than the drawn one.
              g.strokeStyle = on ? COLORS.hazard : '#ffd23f';
              g.fillStyle = on ? COLORS.hazardFill : 'rgba(255, 210, 63, 0.12)';
              const ix = o.x + VENT_INSET;
              const iw = w - 2 * VENT_INSET;
              g.fillRect(sx(ix), sy(o.y + o.h), iw * ppb, o.h * ppb);
              g.strokeRect(sx(ix), sy(o.y + o.h), iw * ppb, o.h * ppb);
            }
            break;
          }
          case 'pad': {
            g.fillStyle = ORB[o.c] ?? '#fff';
            const y0 = o.flip ? o.y - PAD_H : o.y;
            g.fillRect(
              sx(o.x + PAD_INSET),
              sy(y0 + PAD_H),
              (1 - 2 * PAD_INSET) * ppb,
              PAD_H * ppb
            );
            break;
          }
          case 'orb': {
            const m = o.move ? motionWave(o.move, beats) : 0;
            const ox = o.x + (o.move ? o.move.dx * m : 0);
            const oy = o.y + (o.move ? o.move.dy * m : 0);
            g.strokeStyle = ORB[o.c] ?? '#fff';
            g.lineWidth = 2 * px1;
            g.beginPath();
            g.arc(sx(ox), sy(oy), ORB_R * ppb, 0, TAU);
            g.stroke();
            break;
          }
          case 'gate':
          case 'speed': {
            const h = o.h ?? GATE_H;
            g.strokeStyle = o.k === 'gate' ? '#c08bff' : '#9affd5';
            g.lineWidth = 2 * px1;
            g.beginPath();
            g.moveTo(sx(o.x), sy(o.y - h / 2));
            g.lineTo(sx(o.x), sy(o.y + h / 2));
            g.stroke();
            g.fillStyle = g.strokeStyle;
            const label =
              o.k === 'speed'
                ? `»${o.speed}`
                : `${o.mode ? MODE_NAMES[o.mode] : ''}${o.grav ? ` g${o.grav}` : ''}`;
            g.fillText(label, sx(o.x) + 3 * dpr, sy(o.y + h / 2));
            break;
          }
          case 'scroll': {
            if (f.state.scrolls[o.id]) break;
            g.strokeStyle = '#ffcf70';
            g.lineWidth = 2 * px1;
            g.beginPath();
            g.arc(sx(o.x), sy(o.y), SCROLL_R * ppb, 0, TAU);
            g.stroke();
            break;
          }
          case 'text': {
            g.fillStyle = 'rgba(232, 236, 255, 0.7)';
            g.textAlign = 'center';
            g.fillText(o.text, sx(o.x), sy(o.y));
            g.textAlign = 'left';
            break;
          }
          case 'deco': {
            g.fillStyle = 'rgba(200, 200, 220, 0.4)';
            g.fillRect(sx(o.x) - 2 * dpr, sy(o.y) - 6 * dpr, 4 * dpr, 6 * dpr);
            break;
          }
          case 'theme': {
            g.fillStyle = 'rgba(200, 160, 255, 0.8)';
            g.fillText(`theme ${o.theme}`, sx(o.x) + 3 * dpr, 18 * dpr);
            break;
          }
          case 'end': {
            g.strokeStyle = COLORS.player;
            g.lineWidth = 3 * px1;
            g.beginPath();
            g.moveTo(sx(o.x), 0);
            g.lineTo(sx(o.x), H);
            g.stroke();
            break;
          }
        }
      }
      g.globalAlpha = 1;

      // The corridor in force.
      const b = f.state.bounds;
      g.strokeStyle = COLORS.corridor;
      g.lineWidth = 2 * px1;
      g.setLineDash([6 * dpr, 4 * dpr]);
      g.beginPath();
      if (b.floor !== null) {
        g.moveTo(0, sy(b.floor));
        g.lineTo(W, sy(b.floor));
      }
      if (b.ceil !== null) {
        g.moveTo(0, sy(b.ceil));
        g.lineTo(W, sy(b.ceil));
      }
      g.stroke();
      g.setLineDash([]);

      // Practice checkpoints.
      g.fillStyle = COLORS.player;
      for (const c of f.checkpoints) {
        const x = sx(c.x);
        const y = sy(c.y);
        const s = 0.3 * ppb;
        g.beginPath();
        g.moveTo(x, y - s);
        g.lineTo(x + s, y);
        g.lineTo(x, y + s);
        g.lineTo(x - s, y);
        g.closePath();
        g.fill();
      }

      // Kiru: the solid box, the (smaller) hazard box, and his velocity.
      const p = f.state.player;
      g.strokeStyle = p.dead ? COLORS.hazard : COLORS.player;
      g.lineWidth = 2 * px1;
      g.strokeRect(
        sx(f.px - p.w / 2),
        sy(f.py + p.h / 2),
        p.w * ppb,
        p.h * ppb
      );
      g.setLineDash([3 * dpr, 3 * dpr]);
      g.strokeRect(
        sx(f.px - (p.w * HAZARD_SCALE) / 2),
        sy(f.py + (p.h * HAZARD_SCALE) / 2),
        p.w * HAZARD_SCALE * ppb,
        p.h * HAZARD_SCALE * ppb
      );
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(sx(f.px), sy(f.py));
      g.lineTo(sx(f.px), sy(f.py + p.vy * 0.1));
      g.stroke();

      // Recent events.
      g.fillStyle = '#ffffff';
      for (let k = 0; k < Math.min(fn, FLASHES); k++) {
        const age = f.t - ft[k];
        if (age < 0 || age > 1.2) continue;
        g.globalAlpha = 1 - age / 1.2;
        g.fillText(fl[k], sx(fx[k]) + 4 * dpr, sy(fy[k]) - 14 * dpr);
      }
      g.globalAlpha = 1;

      // The x ruler: a tick every block, a number every five.
      g.strokeStyle = 'rgba(232, 236, 255, 0.6)';
      g.fillStyle = 'rgba(232, 236, 255, 0.8)';
      g.lineWidth = px1;
      g.beginPath();
      for (let x = Math.ceil(cx); x <= cx + f.viewW; x++) {
        const big = x % 5 === 0;
        g.moveTo(sx(x), H);
        g.lineTo(sx(x), H - (big ? 10 : 5) * dpr);
        if (x % 10 === 0) g.fillText(String(x), sx(x) + 2 * dpr, H - 24 * dpr);
      }
      g.stroke();

      // Numbers.
      if (f.t < lastT) fn = 0;
      lastT = f.t;
      const lines = [
        `${f.phase} ${f.phaseT.toFixed(2)}s  attempt ${f.attempt}${f.practice ? ' practice' : ''}`,
        `t ${f.t.toFixed(2)}  beat ${f.beat.toFixed(1)}  ${(f.state.progress * 100).toFixed(1)}%  best ${Math.round(f.best * 100)}%`,
        `x ${p.x.toFixed(2)} y ${p.y.toFixed(2)} vy ${p.vy.toFixed(1)}  ${p.mode} g${p.grav}${p.grounded ? ' ground' : ''}${f.held ? ' held' : ''}`,
        `${f.state.speed}  view ${f.viewW.toFixed(1)}×${f.viewH.toFixed(1)}  cam ${cx.toFixed(1)},${cy.toFixed(2)}  ${fps.toFixed(0)} fps`,
      ];
      g.font = `600 ${fontPx}px ui-monospace, Menlo, Consolas, monospace`;
      const lh = fontPx + 3 * dpr;
      const top = 22 * dpr;
      g.fillStyle = 'rgba(5, 6, 14, 0.6)';
      g.fillRect(
        4 * dpr,
        top - 3 * dpr,
        30 * fontPx,
        lh * lines.length + 6 * dpr
      );
      g.fillStyle = COLORS.text;
      for (let k = 0; k < lines.length; k++)
        g.fillText(lines[k], 8 * dpr, top + k * lh);
      if (!overlay && f.phase !== 'playing' && f.phase !== 'attract') {
        g.font = `800 ${Math.round(34 * dpr)}px system-ui, sans-serif`;
        g.textAlign = 'center';
        g.fillStyle =
          f.phase === 'complete'
            ? COLORS.player
            : f.phase === 'dying'
              ? COLORS.hazard
              : COLORS.text;
        g.fillText(f.phase.toUpperCase(), W / 2, H * 0.4);
        g.textAlign = 'left';
      }
    },
    destroy() {
      level = null;
      objs = [];
    },
  };
}
