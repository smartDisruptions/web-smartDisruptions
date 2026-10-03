/**
 * The level authoring kit. A level file builds its objects with this and
 * exports the result of build():
 *
 *   import { kit } from './kit';
 *   const k = kit('first-light');
 *   k.roof(-10, 60, 3);
 *   k.jumpSpikes(k.at(4), 3);          // a caltrop to jump on the downbeat of bar 4
 *   k.end(k.at(28));
 *   export default k.build();
 *
 * Positions are in blocks. `at(bar, beat)` turns a musical moment into the
 * x Kiru's centre reaches at that moment, so obstacles land on the beat.
 * build() sorts the objects and checks the level, throwing a message that
 * says what is wrong and where. GUIDE.md (next to this file) explains the
 * physics, the patterns and the solver.
 *
 * Runs in Node too (the solver test): erasable TypeScript only.
 */
import { SPEEDS, STEP } from '../types';
import type {
  BlockObj,
  BlockStyle,
  DecoKind,
  Grav,
  LevelDef,
  LevelId,
  LevelMeta,
  ModeId,
  Motion,
  Obj,
  OrbColor,
  PadColor,
  RoofObj,
  RoofStyle,
  SpeedId,
  ThemeId,
} from '../types';
import { levelMeta } from './meta';
import {
  G,
  GATE_H,
  HITBOX,
  JUMP_V,
  KILL_ABOVE,
  KILL_BELOW,
  MAX_FALL,
  gapMax,
  gravityOf,
  isFlying,
  jumpReach,
  maxFallOf,
  orbSpeed,
  fallTime,
  STEP_MAX,
} from '../physics';

/** One section of the song, placed in the level. */
export interface SectionSpan {
  name: string;
  /** First bar of the section (0-based) and the bar after its last. */
  bar0: number;
  bar1: number;
  /** Where Kiru's centre is when the section starts and when it ends. */
  x0: number;
  x1: number;
  energy: number;
  mode: ModeId;
  speed: SpeedId;
  note: string;
}

/** One roof in a roofs() run. `gap` is the gap before it, blocks (ignored for the first). */
export interface RoofSpec {
  w: number;
  top: number;
  gap?: number;
  style?: RoofStyle;
}

export interface KitOptions {
  /** Kiru's start: his centre x, and the surface y his feet are on. Default { x: 0, y: 3 }. */
  start?: { x: number; y: number };
}

export interface Kit {
  readonly meta: LevelMeta;
  readonly start: { x: number; y: number };
  /** Everything placed so far, in the order it was placed. */
  readonly objects: Obj[];

  // ── Time and music ──
  /**
   * The x where bar `bar`, beat `beat` falls: Kiru's centre is there at that
   * moment. Bars are 4 beats and count from 0; at(0) is the start. Honours
   * the start speed and every speed portal placed so far, so place each
   * section's portal before you use at() past it.
   */
  at(bar: number, beat?: number): number;
  /** The same, counting beats from the start. */
  beatX(beats: number): number;
  /** Level seconds when Kiru's centre reaches x. */
  timeAt(x: number): number;
  /** Beats since the start when Kiru's centre reaches x. */
  beatAt(x: number): number;
  /** The speed in force at x, from the portals placed so far. */
  speedAt(x: number): SpeedId;
  /** Blocks per second in force at x. */
  vAt(x: number): number;
  /** The song section called `name`, placed in the level (uses the portals placed so far). */
  section(name: string): SectionSpan;
  sections(): SectionSpan[];

  // ── Objects (each returns what it added) ──
  roof(x: number, w: number, top: number, style?: RoofStyle): Obj;
  block(
    x: number,
    y: number,
    w: number,
    h: number,
    opts?: { style?: BlockStyle; move?: Motion }
  ): Obj;
  spike(
    x: number,
    y: number,
    n?: number,
    opts?: {
      dir?: 'up' | 'down' | 'left' | 'right';
      small?: boolean;
      move?: Motion;
    }
  ): Obj;
  saw(x: number, y: number, r: number, move?: Motion): Obj;
  crow(x: number, y: number, move?: Motion): Obj;
  lantern(
    x: number,
    y: number,
    len: number,
    opts?: { swing?: number; period?: number; phase?: number }
  ): Obj;
  vent(
    x: number,
    y: number,
    h: number,
    on: number,
    off: number,
    opts?: { w?: number; phase?: number; style?: 'steam' | 'fire' }
  ): Obj;
  pad(x: number, y: number, c: PadColor, flip?: boolean): Obj;
  orb(x: number, y: number, c: OrbColor, move?: Motion): Obj;
  gate(
    x: number,
    y: number,
    opts: {
      mode?: ModeId;
      grav?: Grav;
      floor?: number | null;
      ceil?: number | null;
      h?: number;
    }
  ): Obj;
  speed(x: number, y: number, speed: SpeedId, h?: number): Obj;
  scroll(x: number, y: number, id: 0 | 1 | 2, move?: Motion): Obj;
  text(x: number, y: number, text: string, size?: number): Obj;
  deco(
    x: number,
    y: number,
    d: DecoKind,
    opts?: { s?: number; flip?: boolean }
  ): Obj;
  theme(x: number, theme: ThemeId, fade?: number): Obj;
  end(x: number): Obj;
  /** Any object, raw. */
  add(o: Obj): Obj;
  /** Kill lines (defaults: below -4, above 40). Lower `above` for upside-down sections with no ceiling. */
  kill(below: number, above: number): void;

  // ── Helpers ──
  /** A Motion: offset (dx, dy) × a swing from -1 to 1, once every `period` beats. */
  move(
    dx: number,
    dy: number,
    period: number,
    phase?: number,
    wave?: 'sine' | 'tri'
  ): Motion;
  /** Top of the highest still roof or block under x, at or below `below` (default: any). Null over a pit. */
  topAt(x: number, below?: number): number | null;
  /**
   * A caltrop row on the surface at y, placed so a Run jump pressed when
   * Kiru's centre is at `pressX` sails over its middle: put pressX on a beat
   * and the jump lands on the music. Returns the row's left x.
   */
  jumpSpikes(
    pressX: number,
    y: number,
    n?: number,
    opts?: { small?: boolean }
  ): number;
  /**
   * A staircase of blocks from x on a surface at y: `steps` steps, each
   * `run` blocks deep and `rise` blocks higher than the last (negative rise
   * goes down). Returns the x past the last step.
   */
  stairs(
    x: number,
    y: number,
    opts: { steps: number; rise?: number; run?: number; style?: BlockStyle }
  ): number;
  /**
   * Roofs in a row with gaps between them, checked against the jump: each
   * gap must be clearable at the speed in force with room to spare. A gap
   * left out is half the widest clearable one. Returns the x past the last roof.
   */
  roofs(x: number, specs: RoofSpec[]): number;
  /**
   * `n` spirit lanterns, one jump apart at the speed in force: tap each as
   * you reach it. `dy` raises (or lowers) each one after the first.
   * Returns the x of the last.
   */
  orbChain(
    x: number,
    y: number,
    n: number,
    opts?: { c?: OrbColor; dy?: number }
  ): number;
  /**
   * A flying section: a gate at x0 into `mode` with the corridor
   * [floor, ceil], and a gate at x1 back to `back` (default 'run', open sky).
   * The gates span the whole corridor so Kiru cannot miss them. With
   * `grav: -1` the way in turns him upside down and the way out turns him back.
   */
  fly(
    x0: number,
    x1: number,
    opts: {
      mode: ModeId;
      floor: number;
      ceil: number;
      back?: ModeId;
      grav?: Grav;
    }
  ): void;

  /** Sort, check and return the level. Throws a list of everything wrong. */
  build(): LevelDef;
}

export function kit(id: LevelId, opts: KitOptions = {}): Kit {
  const meta = levelMeta(id);
  const start = opts.start ?? { x: 0, y: 3 };
  const objects: Obj[] = [];
  const secPerBeat = 60 / meta.bpm;
  let killBelow = KILL_BELOW;
  let killAbove = KILL_ABOVE;
  let killSet = false;

  const add = <T extends Obj>(o: T): T => {
    objects.push(o);
    return o;
  };

  /** Speed portals placed so far, by x. */
  function portals(): { x: number; v: number; id: SpeedId }[] {
    const list: { x: number; v: number; id: SpeedId }[] = [];
    for (const o of objects)
      if (o.k === 'speed')
        list.push({ x: o.x, v: SPEEDS[o.speed], id: o.speed });
    return list.sort((a, b) => a.x - b.x);
  }

  function xAtTime(t: number): number {
    let x = start.x;
    let v = SPEEDS[meta.startSpeed];
    let left = t;
    for (const p of portals()) {
      if (p.x <= x) {
        v = p.v;
        continue;
      }
      const dt = (p.x - x) / v;
      if (dt >= left) break;
      left -= dt;
      x = p.x;
      v = p.v;
    }
    return x + v * left;
  }

  function timeAtX(x1: number): number {
    let x = start.x;
    let v = SPEEDS[meta.startSpeed];
    let t = 0;
    for (const p of portals()) {
      if (p.x <= x) {
        v = p.v;
        continue;
      }
      if (p.x >= x1) break;
      t += (p.x - x) / v;
      x = p.x;
      v = p.v;
    }
    return t + (x1 - x) / v;
  }

  function speedIdAt(x: number): SpeedId {
    let s = meta.startSpeed;
    for (const p of portals()) if (p.x <= x) s = p.id;
    return s;
  }

  const at = (bar: number, beat = 0) => xAtTime((bar * 4 + beat) * secPerBeat);

  function sections(): SectionSpan[] {
    let bar = 0;
    return meta.sections.map((s) => {
      const span: SectionSpan = {
        name: s.name,
        bar0: bar,
        bar1: bar + s.bars,
        x0: at(bar),
        x1: at(bar + s.bars),
        energy: s.energy,
        mode: s.mode,
        speed: s.speed,
        note: s.note,
      };
      bar += s.bars;
      return span;
    });
  }

  function topAt(x: number, below = Infinity): number | null {
    let best: number | null = null;
    for (const o of objects) {
      let x0: number;
      let x1: number;
      let top: number;
      if (o.k === 'roof') {
        x0 = o.x;
        x1 = o.x + o.w;
        top = o.top;
      } else if (o.k === 'block' && !o.move) {
        x0 = o.x;
        x1 = o.x + o.w;
        top = o.y + o.h;
      } else continue;
      if (x < x0 || x > x1 || top > below + 1e-9) continue;
      if (best === null || top > best) best = top;
    }
    return best;
  }

  const k: Kit = {
    meta,
    start,
    objects,
    at,
    beatX: (beats) => xAtTime(beats * secPerBeat),
    timeAt: timeAtX,
    beatAt: (x) => timeAtX(x) / secPerBeat,
    speedAt: speedIdAt,
    vAt: (x) => SPEEDS[speedIdAt(x)],
    section(name) {
      const s = sections().find((x) => x.name === name);
      if (!s) {
        throw new Error(
          `${meta.name}: no section "${name}" (sections: ${meta.sections.map((x) => x.name).join(', ')})`
        );
      }
      return s;
    },
    sections,

    roof: (x, w, top, style) =>
      add({ k: 'roof', x, w, top, ...(style ? { style } : {}) }),
    block: (x, y, w, h, o = {}) =>
      add({
        k: 'block',
        x,
        y,
        w,
        h,
        ...(o.style ? { style: o.style } : {}),
        ...(o.move ? { move: o.move } : {}),
      }),
    spike: (x, y, n = 1, o = {}) =>
      add({
        k: 'spike',
        x,
        y,
        ...(n !== 1 ? { n } : {}),
        ...(o.dir && o.dir !== 'up' ? { dir: o.dir } : {}),
        ...(o.small ? { small: true } : {}),
        ...(o.move ? { move: o.move } : {}),
      }),
    saw: (x, y, r, move) =>
      add({ k: 'saw', x, y, r, ...(move ? { move } : {}) }),
    crow: (x, y, move) => add({ k: 'crow', x, y, ...(move ? { move } : {}) }),
    lantern: (x, y, len, o = {}) => add({ k: 'lantern', x, y, len, ...o }),
    vent: (x, y, h, on, off, o = {}) =>
      add({ k: 'vent', x, y, h, on, off, ...o }),
    pad: (x, y, c, flip) =>
      add({ k: 'pad', x, y, c, ...(flip ? { flip: true } : {}) }),
    orb: (x, y, c, move) =>
      add({ k: 'orb', x, y, c, ...(move ? { move } : {}) }),
    gate: (x, y, o) => add({ k: 'gate', x, y, ...o }),
    speed: (x, y, speed, h) =>
      add({ k: 'speed', x, y, speed, ...(h ? { h } : {}) }),
    scroll: (x, y, id, move) =>
      add({ k: 'scroll', x, y, id, ...(move ? { move } : {}) }),
    text: (x, y, text, size) =>
      add({ k: 'text', x, y, text, ...(size ? { size } : {}) }),
    deco: (x, y, d, o = {}) => add({ k: 'deco', x, y, d, ...o }),
    theme: (x, theme, fade) =>
      add({ k: 'theme', x, theme, ...(fade ? { fade } : {}) }),
    end: (x) => add({ k: 'end', x }),
    add,
    kill(below, above) {
      killBelow = below;
      killAbove = above;
      killSet = true;
    },

    move: (dx, dy, period, phase, wave) => ({
      dx,
      dy,
      period,
      ...(phase ? { phase } : {}),
      ...(wave === 'tri' ? { wave } : {}),
    }),
    topAt,

    jumpSpikes(pressX, y, n = 1, o = {}) {
      // A jump's arc is symmetric about its peak, JUMP_V / G seconds after
      // the press: centre the row there and the window is centred on the beat.
      const v = SPEEDS[speedIdAt(pressX)];
      const left = pressX + (v * JUMP_V) / G - n / 2;
      k.spike(left, y, n, { small: o.small });
      return left;
    },

    stairs(x, y, o) {
      const rise = o.rise ?? 1;
      const run = o.run ?? 3;
      if (rise > 2) {
        throw new Error(
          `${meta.name}: stairs at x=${x}: a rise of ${rise} cannot be jumped (2 at most)`
        );
      }
      for (let i = 0; i < o.steps; i++) {
        const h = rise > 0 ? rise * (i + 1) : -rise * (o.steps - i);
        k.block(x + i * run, y, run, h, { style: o.style ?? 'crate' });
      }
      return x + o.steps * run;
    },

    roofs(x, specs) {
      // Work out every roof first, so a gap that cannot be jumped throws
      // before anything is added.
      const placed: { x: number; s: RoofSpec }[] = [];
      let cx = x;
      let prevTop = 0;
      specs.forEach((s, i) => {
        if (i > 0) {
          const speed = speedIdAt(cx);
          const max = gapMax(speed, s.top - prevTop);
          const gap = s.gap ?? Math.max(1, Math.round(max)) / 2;
          if (!(max > 0) || gap > max * 0.9) {
            throw new Error(
              `${meta.name}: roofs at x=${cx.toFixed(1)}: a ${gap}-block gap up ${(s.top - prevTop).toFixed(2)} ` +
                `cannot be jumped fairly at ${speed} speed (the widest clearable is ${max > 0 ? max.toFixed(2) : 'none'}; keep under 90% of it)`
            );
          }
          cx += gap;
        }
        placed.push({ x: cx, s });
        cx += s.w;
        prevTop = s.top;
      });
      for (const p of placed) k.roof(p.x, p.s.w, p.s.top, p.s.style);
      return cx;
    },

    orbChain(x, y, n, o = {}) {
      const c = o.c ?? 'yellow';
      const dy = o.dy ?? 0;
      let cx = x;
      for (let i = 0; i < n; i++) {
        k.orb(cx, y + i * dy, c);
        // The next one sits where this one's arc comes back to its height.
        const v = SPEEDS[speedIdAt(cx)];
        const kick = orbSpeed(c, 'run', v);
        const t =
          kick > 0
            ? fallTime(kick, gravityOf('run'), maxFallOf('run', v), dy)
            : NaN;
        if (i < n - 1) {
          if (!(t > 0)) {
            throw new Error(
              `${meta.name}: orbChain at x=${x}: a ${c} lantern cannot reach ${dy} higher`
            );
          }
          cx += v * t;
        }
      }
      return cx;
    },

    fly(x0, x1, o) {
      const mid = (o.floor + o.ceil) / 2;
      const h = o.ceil - o.floor;
      k.gate(x0, mid, {
        mode: o.mode,
        floor: o.floor,
        ceil: o.ceil,
        h,
        ...(o.grav ? { grav: o.grav } : {}),
      });
      // Out the other side; if the way in turned him upside down, the way
      // out turns him back.
      k.gate(x1, mid, {
        mode: o.back ?? 'run',
        floor: null,
        ceil: null,
        h,
        ...(o.grav === -1 ? { grav: 1 as const } : {}),
      });
    },

    build() {
      const errs: string[] = [];
      const where = (o: Obj) => `${o.k} at x=${+o.x.toFixed(2)}`;
      const ends = objects.filter((o) => o.k === 'end');
      if (ends.length !== 1)
        errs.push(`needs exactly one end, has ${ends.length}`);
      const endX = ends.length ? ends[0].x : Infinity;

      for (const id of [0, 1, 2] as const) {
        const s = objects.filter((o) => o.k === 'scroll' && o.id === id);
        if (s.length !== 1) {
          errs.push(
            `scroll ${id} must appear exactly once, appears ${s.length} time(s)` +
              (s.length ? ` (${s.map(where).join(', ')})` : '')
          );
        }
      }

      for (const o of objects) {
        const nums = Object.entries(o).filter(([, v]) => typeof v === 'number');
        for (const [name, v] of nums) {
          if (!Number.isFinite(v as number))
            errs.push(`${where(o)}: ${name} is ${v}`);
        }
        if (o.x < start.x - 40 || o.x > endX + 40) {
          errs.push(
            `${where(o)} is outside the level (start ${start.x}, end ${endX})`
          );
        }
        if (
          'y' in o &&
          typeof o.y === 'number' &&
          (o.y < killBelow || o.y > killAbove)
        ) {
          errs.push(
            `${where(o)}: y=${o.y} is past the kill lines (${killBelow}..${killAbove})`
          );
        }
      }

      // No solid inside a caltrop's cell (it would hide it, or kill unfairly).
      const solids = objects.filter(
        (o): o is RoofObj | BlockObj =>
          o.k === 'roof' || (o.k === 'block' && !o.move)
      );
      for (const s of objects) {
        if (s.k !== 'spike' || s.move) continue;
        const [a0, a1, b0, b1] = spikeCell(s);
        for (const o of solids) {
          const [c0, c1, d0, d1] =
            o.k === 'roof'
              ? [o.x, o.x + o.w, -1e6, o.top]
              : [o.x, o.x + o.w, o.y, o.y + o.h];
          const ox = Math.min(a1, c1) - Math.max(a0, c0);
          const oy = Math.min(b1, d1) - Math.max(b0, d0);
          if (ox > 1e-6 && oy > 1e-6)
            errs.push(`${where(s)}: its cell overlaps the ${where(o)}`);
        }
      }

      // Gates: a corridor Kiru fits in, and a span that holds a y.
      for (const o of objects) {
        if (o.k !== 'gate' && o.k !== 'speed') continue;
        if ((o.h ?? GATE_H) <= 0) errs.push(`${where(o)}: h must be positive`);
        if (o.k !== 'gate') continue;
        const f = o.floor ?? null;
        const c = o.ceil ?? null;
        if (f !== null && c !== null) {
          const need = HITBOX[o.mode ?? 'run'].h + 0.5;
          if (c - f < need)
            errs.push(
              `${where(o)}: corridor ${f}..${c} is too narrow (at least ${need})`
            );
          if (o.y < f || o.y > c)
            errs.push(
              `${where(o)}: its centre y=${o.y} is outside its corridor ${f}..${c}`
            );
        }
        if (o.mode && isFlying(o.mode) && f === null && c === null) {
          // Allowed (a 10-block corridor centred on the gate), but say so in the guide.
        }
      }

      // Kiru starts standing on something.
      const under = solids.filter(
        (o) =>
          start.x >= o.x &&
          start.x <= o.x + o.w &&
          Math.abs((o.k === 'roof' ? o.top : o.y + o.h) - start.y) < 1e-6
      );
      if (under.length === 0) {
        errs.push(
          `the start (${start.x}, ${start.y}) is not on a roof or block top`
        );
      }
      if (endX <= start.x)
        errs.push(`the end (x=${endX}) is not after the start (x=${start.x})`);

      if (errs.length) {
        throw new Error(
          `${meta.name} (${meta.id}): ${errs.length} problem(s):\n  - ${errs.join('\n  - ')}`
        );
      }
      const sorted = objects
        .map((o, i) => ({ o, i }))
        .sort((a, b) => a.o.x - b.o.x || a.i - b.i)
        .map((e) => e.o);
      return {
        ...meta,
        objects: sorted,
        start: { ...start },
        ...(killSet ? { killBelow, killAbove } : {}),
      };
    },
  };
  return k;
}

/** A caltrop row's cell (the drawn shape's box), [x0, x1, y0, y1]. */
export function spikeCell(o: {
  x: number;
  y: number;
  n?: number;
  dir?: 'up' | 'down' | 'left' | 'right';
  small?: boolean;
}): [number, number, number, number] {
  const n = o.n ?? 1;
  const d = o.small ? 0.5 : 1;
  switch (o.dir ?? 'up') {
    case 'up':
      return [o.x, o.x + n, o.y, o.y + d];
    case 'down':
      return [o.x, o.x + n, o.y - d, o.y];
    case 'right':
      return [o.x, o.x + d, o.y, o.y + n];
    default:
      return [o.x + 1 - d, o.x + 1, o.y, o.y + n];
  }
}

/** Physics facts, re-exported so a level file needs only this module. */
export { G, JUMP_V, MAX_FALL, STEP, STEP_MAX, gapMax, jumpReach };
