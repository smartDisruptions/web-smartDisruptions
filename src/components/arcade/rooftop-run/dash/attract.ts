/**
 * Kiru's Rooftop Run: Dash — attract mode. Kiru runs an easy, endless
 * rooftop strip behind the menus: small gaps, single caltrops, the odd
 * taiko drum and spirit lantern, cats and banners, and the town's palette
 * drifting from dawn to festival night to moonlight as he goes. It is the
 * first thing a player sees after Start, so it should look alive; it is
 * behind a menu, so it must cost next to nothing.
 *
 * How it stays alive without a solver:
 *
 *  1. Calibrate. Once per page, the real simulation runs three tiny test
 *     levels (a jump, a drum, a jump with a lantern at its top) and measures
 *     how far and how high each one carries. Physics can be retuned freely;
 *     attract mode follows.
 *  2. Build from pieces whose press points come from those measurements: a
 *     spike gets a press that puts the top of the jump over it, a gap a
 *     press at the roof's edge, a lantern a second press at the top.
 *  3. Prove the pieces. A test strip with every kind of piece is played by
 *     the autopilot on the real sim; a kind that kills him is dropped.
 *  4. Hand over. Each strip ends on a long quiet roof; the next strip begins
 *     with that same roof, from the exact spot Kiru is standing on, so the
 *     swap never shows.
 */
import type {
  CreateSim,
  DecoKind,
  Input,
  LevelDef,
  Obj,
  RoofStyle,
  SimState,
  ThemeId,
} from './types';

/** Strip length in blocks (about two minutes of running at normal speed). */
const STRIP = 1100;
/** The quiet roof each strip ends on, and how far onto it the next one takes over. */
const TAIL = 50;
const HANDOFF = 22;
/** Each press is held this many steps (spirit lanterns accept a press held into them). */
const HOLD_STEPS = 6;
const BPM = 120;
const THEMES: ThemeId[] = ['dawn', 'lanterns', 'moon', 'sakura', 'dojo'];
const STYLES: RoofStyle[] = [
  'tiles',
  'flat',
  'tiles',
  'pagoda',
  'shrine',
  'warehouse',
];
const DECOS: DecoKind[] = [
  'cat',
  'banner',
  'cat',
  'banner',
  'lanterns',
  'bonsai',
  'laundry',
  'chime',
  'stone-lantern',
  'sakura',
  'neon',
  'crane',
];

type Kind = 'spike' | 'gap' | 'drum' | 'lantern';

/** What the physics does, measured on the real sim. */
interface Calib {
  /** Kiru's Run hitbox (blocks). */
  w: number;
  h: number;
  /** A plain jump: take-off to landing at the same height, its rise, and where the top is. */
  jumpD: number;
  rise: number;
  apexDx: number;
  /** The jump's arc: centre rise above take-off by distance from take-off, one sample a step. */
  arcX: Float64Array;
  arcY: Float64Array;
  /** Yellow drum: from its left edge to the landing (0: drums are not used). */
  padD: number;
  /** A jump with a yellow lantern pressed at its top: take-off to landing (0: not used). */
  orbD: number;
  enabled: Record<Kind, boolean>;
}

export interface DashAttract {
  /** A fresh strip from the beginning. */
  begin(): LevelDef;
  /** The autopilot: the button for the next step. */
  input(state: SimState, out: Input): void;
  /** After a step: the next strip once Kiru is on the hand-over roof, else null. */
  next(state: SimState): LevelDef | null;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stripDef(
  objects: Obj[],
  start: { x: number; y: number },
  theme: ThemeId,
  length: number
): LevelDef {
  objects.sort((a, b) => a.x - b.x);
  return {
    // Not a real level: the id is only a placeholder the type requires.
    // Nothing is saved for it and no song is played for it.
    id: 'first-light',
    n: 0,
    name: 'Rooftops',
    tagline: '',
    difficulty: 'easy',
    stars: 0,
    bpm: BPM,
    sections: [
      {
        name: 'attract',
        bars: Math.max(1, Math.ceil(length / 20)),
        energy: 2,
        mode: 'run',
        speed: 'normal',
        note: 'Behind the menus.',
      },
    ],
    theme,
    startMode: 'run',
    startSpeed: 'normal',
    modes: ['run'],
    objects,
    start,
    killBelow: -4,
  };
}

// ── Calibration ────────────────────────────────────────────────────────────

/** Plays `presses` (x positions) on a flat test roof with `extra` objects. */
function trial(
  createSim: CreateSim,
  extra: Obj[],
  presses: number[],
  watch: (st: SimState) => boolean
) {
  const objects: Obj[] = [
    { k: 'roof', x: -20, w: 260, top: 3 },
    ...extra,
    { k: 'end', x: 230 },
  ];
  const sim = createSim(stripDef(objects, { x: 2, y: 3 }, 'dawn', 260));
  const inp: Input = { held: false, pressed: false };
  let next = 0;
  let hold = 0;
  for (let i = 0; i < 1200; i++) {
    const st = sim.state;
    inp.pressed = false;
    while (next < presses.length && st.player.x >= presses[next]) {
      inp.pressed = true;
      next++;
    }
    if (inp.pressed) hold = HOLD_STEPS;
    inp.held = hold > 0;
    if (hold > 0) hold--;
    sim.step(inp);
    if (sim.state.player.dead || watch(sim.state)) break;
  }
  return sim.state;
}

function calibrate(createSim: CreateSim): Calib | null {
  const TAKEOFF = 8;
  // A plain jump.
  let x0 = NaN;
  let y0 = 0;
  let air = false;
  let land = NaN;
  let top = -Infinity;
  let apexX = 0;
  const ax: number[] = [];
  const ay: number[] = [];
  let w = 0.8;
  let h = 1.4;
  // Where he was before the step: presses are compared against that.
  let bx = 2;
  let by = 3;
  trial(createSim, [], [TAKEOFF], (st) => {
    const p = st.player;
    w = p.w;
    h = p.h;
    if (Number.isNaN(x0)) {
      for (const ev of st.events) {
        if (ev.e === 'jump') {
          x0 = bx;
          y0 = by;
        }
      }
      bx = p.x;
      by = p.y;
      // The jump is measured from the step that launched it.
      if (Number.isNaN(x0)) return false;
    }
    ax.push(p.x - x0);
    ay.push(p.y - y0);
    if (p.y > top) {
      top = p.y;
      apexX = p.x;
    }
    if (!p.grounded) air = true;
    else if (air) {
      land = p.x;
      return true;
    }
    return ax.length > 600;
  });
  if (Number.isNaN(x0) || Number.isNaN(land)) return null;
  const jumpD = land - x0;
  const rise = top - y0;
  if (jumpD < 1.5 || rise < 0.8) return null;
  const cal: Calib = {
    w,
    h,
    jumpD,
    rise,
    apexDx: apexX - x0,
    arcX: Float64Array.from(ax),
    arcY: Float64Array.from(ay),
    padD: 0,
    orbD: 0,
    enabled: { spike: rise > 1.3, gap: true, drum: true, lantern: true },
  };

  // A yellow drum.
  {
    const PAD = 12;
    let launched = false;
    let up = false;
    let at = NaN;
    trial(createSim, [{ k: 'pad', x: PAD, y: 3, c: 'jump' }], [], (st) => {
      const p = st.player;
      for (const ev of st.events) if (ev.e === 'pad') launched = true;
      if (!launched) return p.x > PAD + 4;
      if (!p.grounded) up = true;
      else if (up) {
        at = p.x;
        return true;
      }
      return p.x > PAD + 40;
    });
    cal.padD = Number.isNaN(at) ? 0 : at - PAD;
    if (cal.padD < 3) cal.enabled.drum = false;
  }

  // A yellow lantern, pressed at the top of a jump.
  {
    const ORB_X = apexX;
    const ORB_Y = top;
    let used = false;
    let up = false;
    let at = NaN;
    let from = NaN;
    let before = 2;
    trial(
      createSim,
      [{ k: 'orb', x: ORB_X, y: ORB_Y, c: 'jump' }],
      [TAKEOFF, ORB_X - 0.25],
      (st) => {
        const p = st.player;
        for (const ev of st.events) {
          if (ev.e === 'orb') used = true;
          if (ev.e === 'jump' && Number.isNaN(from)) from = before;
        }
        before = p.x;
        if (!p.grounded) up = true;
        else if (up) {
          at = p.x;
          return true;
        }
        return p.x > ORB_X + 40;
      }
    );
    cal.orbD = used && !Number.isNaN(at) && !Number.isNaN(from) ? at - from : 0;
    if (cal.orbD < jumpD + 1) cal.enabled.lantern = false;
  }
  return cal;
}

/** The arc's rise at a distance from take-off (the nearest sample). */
function riseAt(cal: Calib, dx: number): number {
  const xs = cal.arcX;
  for (let i = 0; i < xs.length; i++) if (xs[i] >= dx) return cal.arcY[i];
  return -Infinity;
}

// ── The strip builder ──────────────────────────────────────────────────────

interface Piece {
  kind: Kind;
  x0: number;
  x1: number;
}

/** Where a strip begins: the roof Kiru is on, and what is already on it. */
interface Begin {
  /** Kiru's start (hitbox centre x). */
  x: number;
  /** The roof he starts on: its left edge, top and style. */
  roofX: number;
  top: number;
  style: RoofStyle;
  /** Nothing new is placed before this x. */
  cur: number;
  theme: ThemeId;
  /** Decoration already on that roof. */
  decor: Obj[];
}

interface Strip {
  level: LevelDef;
  presses: Float64Array;
  /** Where the next strip takes over (Kiru's x, on the tail roof). */
  handoff: number;
  /** The next strip begins here, on the same roof. */
  then: Omit<Begin, 'x'>;
  pieces: Piece[];
}

function buildStrip(
  cal: Calib | null,
  rnd: () => number,
  begin: Begin,
  length: number,
  only?: Kind[]
): Strip {
  const r = (a: number, b: number) => a + (b - a) * rnd();
  const objects: Obj[] = begin.decor.slice();
  const presses: number[] = [];
  const pieces: Piece[] = [];
  let top = begin.top;
  let roofX = begin.roofX;
  let style = begin.style;
  let cur = begin.cur;
  let theme = begin.theme;
  let themeIdx = Math.max(0, THEMES.indexOf(theme));
  let nextTheme = cur + r(90, 150);
  const end = begin.x + length;

  const deco = (x: number) => {
    const d = DECOS[Math.floor(rnd() * DECOS.length)];
    const o: Obj = { k: 'deco', x, y: top, d, flip: rnd() < 0.5 };
    if (d === 'lanterns') {
      o.y = top + 4.2;
      o.s = r(4, 7);
    }
    objects.push(o);
  };
  const closeRoof = (x: number) => {
    objects.push({ k: 'roof', x: roofX, w: x - roofX, top, style });
    // Something to look at on most roofs: a cat asleep, a banner.
    if (x - roofX > 6 && rnd() < 0.75) {
      deco(roofX + r(1, Math.min(5, x - roofX - 1)));
    }
  };
  const openRoof = (x: number, t: number) => {
    roofX = x;
    top = t;
    style = STYLES[Math.floor(rnd() * STYLES.length)];
  };

  const kinds: Kind[] = [];
  if (cal) {
    for (const k of only ?? (['spike', 'gap', 'drum', 'lantern'] as Kind[])) {
      if (cal.enabled[k]) kinds.push(k);
    }
  }
  const weight: Record<Kind, number> = {
    spike: 4,
    gap: 4,
    drum: 1.3,
    lantern: 1.3,
  };

  while (cur < end - TAIL - 40) {
    if (cur > nextTheme) {
      themeIdx = (themeIdx + 1) % THEMES.length;
      theme = THEMES[themeIdx];
      objects.push({ k: 'theme', x: cur, theme, fade: 14 });
      nextTheme = cur + r(120, 190);
    }
    // A stroll now and then: room to breathe, and something to look at.
    if (!cal || kinds.length === 0 || rnd() < 0.18) {
      const len = r(5, 11);
      if (rnd() < 0.6) deco(cur + r(1, len - 1));
      cur += len;
      continue;
    }
    let total = 0;
    for (const k of kinds) total += weight[k];
    let pick = rnd() * total;
    let kind: Kind = kinds[0];
    for (const k of kinds) {
      pick -= weight[k];
      if (pick < 0) {
        kind = k;
        break;
      }
    }
    const x0 = cur;
    const half = cal.w / 2;
    if (kind === 'spike') {
      // The top of the jump right over the caltrop.
      const sx = cur + cal.apexDx + r(1.5, 4);
      objects.push({ k: 'spike', x: sx, y: top });
      const takeoff = sx + 0.5 - cal.apexDx;
      presses.push(takeoff);
      cur = takeoff + cal.jumpD + r(2.5, 4);
    } else if (kind === 'gap') {
      const edge = cur + r(3, 6);
      const takeoff = edge - 0.3;
      const maxGap = Math.min(3, cal.jumpD - half - 0.9);
      let gap = r(1.4, Math.max(1.5, maxGap));
      let dTop = 0;
      const roll = rnd();
      if (roll < 0.22 && top > 2) dTop = -1;
      else if (roll < 0.4 && top < 5) {
        // A step up: only when the arc clears the next roof's wall and
        // comes down onto it, not into its side.
        gap = Math.min(gap, 2);
        const wall = riseAt(cal, edge + gap - half - takeoff);
        if (wall > 1.3 && cal.rise > 1.6) dTop = 1;
      }
      closeRoof(edge);
      presses.push(takeoff);
      openRoof(edge + gap, top + dTop);
      cur = takeoff + cal.jumpD + r(2.5, 4);
      if (rnd() < 0.5) deco(edge + gap + r(0.5, 2));
    } else if (kind === 'drum') {
      const px = cur + r(2, 4);
      objects.push({ k: 'pad', x: px, y: top, c: 'jump' });
      // Half the time the drum throws him over a gap.
      const g1 = px + cal.padD * 0.55;
      if (rnd() < 0.5 && g1 - (px + 1.6) >= 1.2) {
        closeRoof(px + 1.6);
        openRoof(g1, top);
      }
      cur = px + cal.padD + r(2.5, 4);
    } else {
      // A gap too wide to jump, with a spirit lantern at the top of the jump.
      const edge = cur + r(3, 5);
      const takeoff = edge - 0.3;
      const ox = takeoff + cal.apexDx;
      const oy = top + cal.h / 2 + cal.rise;
      objects.push({ k: 'orb', x: ox, y: oy, c: 'jump' });
      presses.push(takeoff, ox - 0.25);
      const most = cal.orbD - half - 1.3;
      const gap = Math.max(1.4, Math.min(most, r(cal.jumpD - 0.2, most)));
      closeRoof(edge);
      openRoof(edge + gap, top);
      cur = takeoff + cal.orbD + r(2.5, 4);
    }
    pieces.push({ kind, x0, x1: cur });
  }

  // The tail: the roof Kiru is on carries on, quiet, for TAIL blocks. This
  // strip's copy of it ends just past anything he can see before the
  // hand-over; the next strip opens the same roof and carries it on.
  const tailEnd = cur + TAIL;
  const decor: Obj[] = [
    { k: 'deco', x: cur + 6, y: top, d: 'cat' },
    { k: 'deco', x: cur + 13, y: top, d: 'banner' },
    { k: 'deco', x: cur + 34, y: top, d: 'banner', flip: true },
    { k: 'deco', x: cur + 41, y: top, d: 'cat', flip: true },
  ];
  objects.push(...decor);
  objects.push({ k: 'roof', x: roofX, w: tailEnd + 30 - roofX, top, style });
  objects.push({ k: 'end', x: tailEnd + 20 });
  return {
    level: stripDef(
      objects,
      { x: begin.x, y: begin.top },
      begin.theme,
      tailEnd - begin.x
    ),
    presses: Float64Array.from(presses.sort((a, b) => a - b)),
    handoff: cur + HANDOFF,
    then: { roofX, top, style, cur: tailEnd, theme, decor },
    pieces,
  };
}

const FIRST: Begin = {
  x: 2,
  roofX: -14,
  top: 3,
  style: 'tiles',
  cur: 26,
  theme: 'dawn',
  decor: [
    { k: 'deco', x: 5, y: 3, d: 'cat' },
    { k: 'deco', x: 17, y: 3, d: 'banner' },
  ],
};

// Calibration is per page: the physics doesn't change while it is open.
let calibrated: Calib | null | undefined;

function getCalib(createSim: CreateSim): Calib | null {
  if (calibrated !== undefined) return calibrated;
  let cal: Calib | null = null;
  try {
    cal = calibrate(createSim);
  } catch {
    cal = null;
  }
  if (cal) {
    // Prove the pieces: play a strip of each on the real sim. A kind that
    // kills him is dropped, and the rest are tried again without it.
    const rnd = mulberry32(7);
    for (let round = 0; round < 4; round++) {
      const kinds = (['spike', 'gap', 'drum', 'lantern'] as Kind[]).filter(
        (k) => cal!.enabled[k]
      );
      if (kinds.length === 0) break;
      const s = buildStrip(cal, rnd, { ...FIRST, cur: 14 }, 260, kinds);
      const dead = play(createSim, s);
      if (dead === null) break;
      // Blame the last piece he started before he fell.
      let bad: Piece | null = null;
      for (const p of s.pieces) if (p.x0 <= dead + 0.5) bad = p;
      if (!bad) {
        // Nothing explains it: trust nothing but strolls.
        for (const k of kinds) cal.enabled[k] = false;
        break;
      }
      cal.enabled[bad.kind] = false;
    }
  }
  calibrated = cal;
  return cal;
}

/** Plays a strip with its autopilot; the x where Kiru died, or null if he made the hand-over. */
function play(createSim: CreateSim, s: Strip): number | null {
  const sim = createSim(s.level);
  const inp: Input = { held: false, pressed: false };
  let next = 0;
  let hold = 0;
  for (let i = 0; i < 40000; i++) {
    const p = sim.state.player;
    if (p.x >= s.handoff) return null;
    inp.pressed = false;
    while (next < s.presses.length && p.x >= s.presses[next]) {
      inp.pressed = true;
      next++;
    }
    if (inp.pressed) hold = HOLD_STEPS;
    inp.held = hold > 0;
    if (hold > 0) hold--;
    sim.step(inp);
    if (sim.state.player.dead) return sim.state.player.x;
  }
  return null;
}

export function createAttract(createSim: CreateSim): DashAttract {
  let seed = (Math.random() * 4294967296) >>> 0;
  let strip: Strip | null = null;
  let next = 0;
  let hold = 0;

  function adopt(s: Strip): LevelDef {
    strip = s;
    next = 0;
    hold = 0;
    return s.level;
  }

  return {
    begin() {
      const cal = getCalib(createSim);
      return adopt(buildStrip(cal, mulberry32(seed++), FIRST, STRIP));
    },
    input(st, out) {
      const s = strip;
      let pressed = false;
      if (s) {
        const x = st.player.x;
        while (next < s.presses.length && x >= s.presses[next]) {
          pressed = true;
          next++;
        }
      }
      if (pressed) hold = HOLD_STEPS;
      out.pressed = pressed;
      out.held = hold > 0;
      if (hold > 0) hold--;
    },
    next(st) {
      const s = strip;
      const p = st.player;
      if (!s || p.x < s.handoff || !p.grounded) return null;
      const cal = getCalib(createSim);
      return adopt(
        buildStrip(cal, mulberry32(seed++), { x: p.x, ...s.then }, STRIP)
      );
    },
  };
}
