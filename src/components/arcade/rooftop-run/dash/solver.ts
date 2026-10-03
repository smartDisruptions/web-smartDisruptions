/**
 * The solver: a bot that proves a level can be finished, then measures how
 * fair it is. Runs in Node (scripts/test-rooftop.mjs) and in the browser
 * (the dev autopilot). Never shipped to players.
 *
 * solve() searches every way of playing, frame by frame. The button may only
 * change every 2 steps (60 times a second, as a person's can), so each state
 * has two futures: held or not for the next 2 steps. States that land on the
 * same quantised key at the same frame play out alike, so only one is kept:
 * the one whose path has stayed furthest from danger (its bottleneck
 * clearance). If a frame holds more than `beam` states, the best are kept,
 * one per height band first so every route stays alive. Each state is a real
 * snapshot of the simulation, so every path found is a real input sequence;
 * the witness is still replayed through a fresh sim to prove it.
 *
 * measureSlack() then takes the witness press by press and slides each tap
 * earlier and later, one step (8.3 ms) at a time, until the run no longer
 * completes: the window a player has for that press. Taps in the flying
 * modes (kite, parasol, dragon) steer continuously, so a shifted tap moves
 * the whole rest of the flight; for those the clearance along the path is
 * the honest measure, and their slack is reported for information only.
 */
import { STEP } from './types';
import type { DeathCause, LevelDef, ModeId, SimSnapshot } from './types';
import { CLEAR_CAP, SNAP_LEN, createSim } from './sim';
import type { DashSim } from './sim';
import { MODE_LIST, isFlying } from './physics';

export interface SolveOptions {
  /** Start from this snapshot (a checkpoint) instead of the level start. */
  from?: SimSnapshot;
  /** Scroll ids that must be picked up on the way to the finish. */
  scrolls?: readonly (0 | 1 | 2)[];
  /** States kept per frame (default: tries 250, then 1000, then 4000, with finer keys each time). */
  beam?: number;
  /** Key quantisation for height (blocks) and vertical speed (blocks/s). */
  qy?: number;
  qv?: number;
  /** Give up after this long (default 30 s). */
  timeLimitMs?: number;
  /** Give up past this many steps (default: 3 × the song). */
  maxSteps?: number;
  /**
   * A finishing run to rejoin: once a searched state (with the required
   * scrolls) matches this run's exact state at the same frame, the rest of
   * this run finishes it. Makes scroll searches fast. Build with rejoinFrom().
   */
  rejoin?: Rejoin;
  /** Diagnostics: called after each 2-step layer with its state count and furthest x. */
  onLayer?: (layer: number, states: number, x: number) => void;
}

export interface Rejoin {
  /** The run's inputs from its own start. */
  inputs: Uint8Array;
  /** Frame of the run's first input. */
  frame0: number;
  /** Exact keys (scrolls left out) after each of its steps. */
  keys: Float64Array;
}

export interface SolveResult {
  ok: boolean;
  /** Held (1) or not (0) for each step, from the start (or from `from`). */
  inputs: Uint8Array;
  steps: number;
  /** Furthest x any state reached. */
  reachedX: number;
  /** When it failed: where the furthest run died, and of what. */
  deathX?: number;
  cause?: DeathCause | 'timeout' | 'beam';
  ms: number;
  /** States expanded. */
  states: number;
  /** Scrolls the witness picks up. */
  scrolls: [boolean, boolean, boolean];
  /** The witness's narrowest clearance (blocks) as the search saw it. */
  clearance: number;
}

/**
 * Coarse and quick first; finer and wider only if that fails. A coarse key
 * merges near-identical states, and the merge keeps the safer one, so it
 * rarely loses a route a person could take.
 */
const TRIES = [
  { beam: 250, qy: 1 / 8, qv: 1 },
  { beam: 1000, qy: 1 / 16, qv: 1 / 2 },
  { beam: 4000, qy: 1 / 32, qv: 1 / 4 },
];

const now = () =>
  typeof performance !== 'undefined' ? performance.now() : Date.now();

/** Prove the level can be finished (with the required scrolls). */
export function solve(level: LevelDef, opts: SolveOptions = {}): SolveResult {
  const t0 = now();
  const limit = opts.timeLimitMs ?? 30000;
  const tries =
    opts.beam || opts.qy || opts.qv
      ? [
          {
            beam: opts.beam ?? 2000,
            qy: opts.qy ?? 1 / 32,
            qv: opts.qv ?? 1 / 4,
          },
        ]
      : TRIES;
  let res: SolveResult | null = null;
  let states = 0;
  for (const t of tries) {
    const left = limit - (now() - t0);
    if (left <= 0) break;
    res = search(level, opts, t.beam, t.qy, t.qv, left);
    states += res.states;
    if (res.ok) break;
  }
  const out = res ?? failure(level, opts, 'timeout');
  out.states = states;
  out.ms = now() - t0;
  return out;
}

function failure(
  level: LevelDef,
  opts: SolveOptions,
  cause: SolveResult['cause']
): SolveResult {
  return {
    ok: false,
    inputs: new Uint8Array(0),
    steps: 0,
    reachedX: level.start.x,
    cause,
    ms: 0,
    states: 0,
    scrolls: [false, false, false],
    clearance: 0,
  };
}

function scrollMask(ids: readonly number[] | undefined): number {
  let m = 0;
  if (ids) for (const i of ids) m |= 1 << i;
  return m;
}

function bitsOf(sim: DashSim): number {
  return sim.scrollBits;
}

/**
 * State key → slot, open addressing. Keys are 53-bit numbers; a Map would
 * box each one, and the garbage adds up over millions of states. A stamp
 * per entry clears the table in O(1) between frames.
 */
interface Table {
  keys: Float64Array;
  vals: Int32Array;
  stamps: Int32Array;
  mask: number;
  stamp: number;
}

function makeTable(cap: number): Table {
  let size = 16;
  while (size < cap * 2) size *= 2;
  return {
    keys: new Float64Array(size),
    vals: new Int32Array(size),
    stamps: new Int32Array(size),
    mask: size - 1,
    stamp: 1,
  };
}

function tableGet(t: Table, key: number): number {
  let i = (key | 0) & t.mask;
  while (t.stamps[i] === t.stamp) {
    if (t.keys[i] === key) return t.vals[i];
    i = (i + 1) & t.mask;
  }
  return -1;
}

function tableSet(t: Table, key: number, val: number) {
  let i = (key | 0) & t.mask;
  while (t.stamps[i] === t.stamp && t.keys[i] !== key) i = (i + 1) & t.mask;
  t.stamps[i] = t.stamp;
  t.keys[i] = key;
  t.vals[i] = val;
}

function popcount(v: number): number {
  let c = 0;
  for (let b = v; b; b &= b - 1) c++;
  return c;
}

interface Pool {
  f: Float64Array[];
  u: Uint8Array[];
  /** Bottleneck clearance of the path to each state. */
  b: Float64Array;
  /** Parent node and the input that led here. */
  p: Int32Array;
  i: Uint8Array;
  k: Float64Array;
  node: Int32Array;
}

function makePool(cap: number, n: number): Pool {
  const f: Float64Array[] = [];
  const u: Uint8Array[] = [];
  for (let j = 0; j < cap; j++) {
    f.push(new Float64Array(SNAP_LEN));
    u.push(new Uint8Array(n));
  }
  return {
    f,
    u,
    b: new Float64Array(cap),
    p: new Int32Array(cap),
    i: new Uint8Array(cap),
    k: new Float64Array(cap),
    node: new Int32Array(cap),
  };
}

function swapSlots(P: Pool, a: number, b: number) {
  const f = P.f[a];
  P.f[a] = P.f[b];
  P.f[b] = f;
  const u = P.u[a];
  P.u[a] = P.u[b];
  P.u[b] = u;
  let t = P.b[a];
  P.b[a] = P.b[b];
  P.b[b] = t;
  t = P.p[a];
  P.p[a] = P.p[b];
  P.p[b] = t;
  t = P.i[a];
  P.i[a] = P.i[b];
  P.i[b] = t;
  t = P.k[a];
  P.k[a] = P.k[b];
  P.k[b] = t;
}

/**
 * Keep the best `beam` of `count` states: first the best of each band
 * (mode, gravity, grounded, height in quarter blocks, speed in steps of 3),
 * so no route is starved, then the best of the rest. Best means it carries
 * the required scrolls, then the widest clearance.
 */
function prune(P: Pool, count: number, beam: number, need: number): number {
  const score = new Float64Array(count);
  const order: number[] = [];
  for (let j = 0; j < count; j++) {
    const f = P.f[j];
    score[j] = popcount(f[17] & need) * 100 + Math.min(P.b[j], CLEAR_CAP);
    order.push(j);
  }
  order.sort((a, b) => score[b] - score[a] || P.k[a] - P.k[b]);
  const keep = new Uint8Array(count);
  const bands = new Set<number>();
  let kept = 0;
  for (const j of order) {
    if (kept >= beam) break;
    const f = P.f[j];
    const band =
      ((f[4] * 2 + (f[5] > 0 ? 1 : 0)) * 2 + f[6]) * 1e7 +
      Math.round(f[2] * 4) * 1000 +
      Math.round(f[3] / 3);
    if (bands.has(band)) continue;
    bands.add(band);
    keep[j] = 1;
    kept++;
  }
  for (const j of order) {
    if (kept >= beam) break;
    if (keep[j]) continue;
    keep[j] = 1;
    kept++;
  }
  let t = 0;
  for (let j = 0; j < count; j++) {
    if (!keep[j]) continue;
    if (j !== t) swapSlots(P, t, j);
    t++;
  }
  return t;
}

function search(
  level: LevelDef,
  opts: SolveOptions,
  beam: number,
  qy: number,
  qv: number,
  timeLeft: number
): SolveResult {
  const t0 = now();
  const sim = createSim(level, { events: false, view: false });
  if (opts.from) sim.restore(opts.from);
  const n = level.objects.length;
  const frame0 = sim.frame;
  const need = scrollMask(opts.scrolls);
  const songSteps = Math.ceil(
    (level.sections.reduce((s, x) => s + x.bars, 0) * 4 * 60) / level.bpm / STEP
  );
  const maxSteps = opts.maxSteps ?? songSteps * 3;
  const cap = beam * 3;
  let cur = makePool(cap, n);
  let nxt = makePool(cap, n);
  let nodeParent = new Int32Array(1 << 16);
  let nodeInput = new Uint8Array(1 << 16);
  let nodeCount = 1;
  nodeParent[0] = -1;
  sim.saveTo(cur.f[0], cur.u[0]);
  cur.b[0] = sim.clearance();
  cur.node[0] = 0;
  let curCount = 1;
  const table = makeTable(cap);
  const inputs = [
    { held: false, pressed: false },
    { held: true, pressed: false },
  ];
  let explored = 0;
  let reachedX = sim.x;
  let deadX = -Infinity;
  let deadCause: DeathCause | undefined;
  const rj = opts.rejoin;

  const pathTo = (node: number, last: number, steps: number): Uint8Array => {
    const macro: number[] = [last];
    for (let nd = node; nd > 0; nd = nodeParent[nd]) macro.push(nodeInput[nd]);
    macro.reverse();
    const out = new Uint8Array(steps);
    for (let m = 0; m < macro.length; m++) {
      if (2 * m < steps) out[2 * m] = macro[m];
      if (2 * m + 1 < steps) out[2 * m + 1] = macro[m];
    }
    return out;
  };

  const finish = (
    witness: Uint8Array,
    clearance: number
  ): SolveResult | null => {
    const v = replay(level, witness, opts.from);
    if (!v.state.player.done || (bitsOf(v) & need) !== need) return null;
    const sc = v.state.scrolls;
    return {
      ok: true,
      inputs: witness,
      steps: witness.length,
      reachedX: v.state.player.x,
      ms: now() - t0,
      states: explored,
      scrolls: [sc[0], sc[1], sc[2]],
      clearance,
    };
  };

  for (let layer = 0; ; layer++) {
    if (curCount === 0) break;
    if (layer * 2 > maxSteps) break;
    if ((layer & 15) === 0 && now() - t0 > timeLeft) {
      const r = failure(level, opts, 'timeout');
      r.reachedX = reachedX;
      r.states = explored;
      r.ms = now() - t0;
      return r;
    }
    table.stamp++;
    let nc = 0;
    for (let s = 0; s < curCount; s++) {
      sim.loadFrom(cur.f[s], cur.u[s]);
      // When the button cannot matter, holding it or not leads to the same
      // place: try only one.
      const hn = sim.idle() ? 1 : 2;
      for (let h = 0; h < hn; h++) {
        if (h > 0) sim.loadFrom(cur.f[s], cur.u[s]);
        const inp = inputs[h];
        sim.step(inp);
        if (sim.over === 0) sim.step(inp);
        explored++;
        const px = sim.x;
        if (px > reachedX) reachedX = px;
        const over = sim.over;
        if (over === 1) {
          if (px > deadX) {
            deadX = px;
            deadCause = sim.cause ?? undefined;
          }
          continue;
        }
        const bits = bitsOf(sim);
        const c = Math.min(cur.b[s], sim.clearance());
        if (over === 2) {
          if ((bits & need) !== need) continue;
          const r = finish(pathTo(cur.node[s], h, sim.frame - frame0), c);
          if (r) return r;
          continue;
        }
        if (rj && (bits & need) === need) {
          const at = sim.frame - rj.frame0;
          if (
            at > 0 &&
            at <= rj.keys.length &&
            sim.key(1e-6, 1e-6, 0) === rj.keys[at - 1]
          ) {
            const head = pathTo(cur.node[s], h, sim.frame - frame0);
            const tail = rj.inputs.subarray(at);
            const all = new Uint8Array(head.length + tail.length);
            all.set(head);
            all.set(tail, head.length);
            const r = finish(all, c);
            if (r) return r;
          }
        }
        const key = sim.key(qy, qv, need);
        let j = tableGet(table, key);
        if (j < 0) {
          if (nc === cap) {
            nc = prune(nxt, nc, beam, need);
            table.stamp++;
            for (let q = 0; q < nc; q++) tableSet(table, nxt.k[q], q);
          }
          j = nc++;
          tableSet(table, key, j);
          nxt.k[j] = key;
        } else if (c <= nxt.b[j]) continue;
        sim.saveTo(nxt.f[j], nxt.u[j]);
        nxt.b[j] = c;
        nxt.p[j] = cur.node[s];
        nxt.i[j] = h;
      }
    }
    if (nc > beam) nc = prune(nxt, nc, beam, need);
    if (nodeCount + nc > nodeParent.length) {
      const size = Math.max(nodeParent.length * 2, nodeCount + nc);
      const np = new Int32Array(size);
      np.set(nodeParent);
      nodeParent = np;
      const ni = new Uint8Array(size);
      ni.set(nodeInput);
      nodeInput = ni;
    }
    for (let j = 0; j < nc; j++) {
      nodeParent[nodeCount] = nxt.p[j];
      nodeInput[nodeCount] = nxt.i[j];
      nxt.node[j] = nodeCount++;
    }
    const t = cur;
    cur = nxt;
    nxt = t;
    curCount = nc;
    if (opts.onLayer) opts.onLayer(layer, nc, nc ? cur.f[0][1] : NaN);
  }
  return {
    ok: false,
    inputs: new Uint8Array(0),
    steps: 0,
    reachedX,
    ...(deadX > -Infinity ? { deathX: deadX, cause: deadCause } : {}),
    ms: now() - t0,
    states: explored,
    scrolls: [false, false, false],
    clearance: 0,
  };
}

/** Play `inputs` (held per step) through a fresh sim, from the start or `from`. */
export function replay(
  level: LevelDef,
  inputs: Uint8Array,
  from?: SimSnapshot
): DashSim {
  const sim = createSim(level, { events: false });
  if (from) sim.restore(from);
  const inp = { held: false, pressed: false };
  for (let i = 0; i < inputs.length; i++) {
    inp.held = inputs[i] === 1;
    sim.step(inp);
    if (sim.state.player.dead || sim.state.player.done) break;
  }
  return sim;
}

/** Record a finishing run so a scroll search can rejoin it (SolveOptions.rejoin). */
export function rejoinFrom(
  level: LevelDef,
  inputs: Uint8Array,
  from?: SimSnapshot
): Rejoin {
  const sim = createSim(level, { events: false });
  if (from) sim.restore(from);
  const frame0 = sim.state.frame;
  const keys = new Float64Array(inputs.length);
  const inp = { held: false, pressed: false };
  for (let i = 0; i < inputs.length; i++) {
    inp.held = inputs[i] === 1;
    sim.step(inp);
    keys[i] = sim.key(1e-6, 1e-6, 0);
  }
  return { inputs, frame0, keys };
}

/**
 * Prove scroll `id` can be picked up on a finishing run, quickly: start from
 * the main witness a few seconds before the scroll, search for a route that
 * takes it and rejoins the witness; fall back to a full search from the start.
 */
export function solveScroll(
  level: LevelDef,
  id: 0 | 1 | 2,
  witness: Uint8Array,
  opts: SolveOptions = {}
): SolveResult {
  const t0 = now();
  const sc = level.objects.find((o) => o.k === 'scroll' && o.id === id);
  if (!sc) return { ...failure(level, opts, undefined), ms: now() - t0 };
  const rejoin = rejoinFrom(level, witness);
  const sim = createSim(level, { events: false });
  const inp = { held: false, pressed: false };
  let states = 0;
  // Branch points: about 3 s, then 8 s before the scroll, then the start.
  for (const lead of [3, 8]) {
    sim.reset();
    let i = 0;
    for (; i < witness.length; i++) {
      const p = sim.state.player;
      if (p.x >= sc.x - lead * 10.4 || p.dead || p.done) break;
      inp.held = witness[i] === 1;
      sim.step(inp);
    }
    if (i === 0) break;
    const r = solve(level, {
      ...opts,
      from: sim.snapshot(),
      scrolls: [id],
      rejoin,
      timeLimitMs: opts.timeLimitMs ?? 8000,
    });
    states += r.states;
    if (r.ok) {
      const all = new Uint8Array(i + r.inputs.length);
      all.set(witness.subarray(0, i));
      all.set(r.inputs, i);
      const v = replay(level, all);
      if (v.state.player.done && v.state.scrolls[id]) {
        const s = v.state.scrolls;
        return {
          ...r,
          inputs: all,
          steps: all.length,
          states,
          ms: now() - t0,
          scrolls: [s[0], s[1], s[2]],
        };
      }
    }
  }
  const r = solve(level, { ...opts, scrolls: [id], rejoin });
  return { ...r, states: states + r.states, ms: now() - t0 };
}

/**
 * Remove presses the run does not need (a tap in mid-air that does nothing),
 * so the slack measure only judges presses that matter. Only taps in Run,
 * Roll and Shadow Step: in the flying modes every hold steers.
 */
export function simplify(
  level: LevelDef,
  inputs: Uint8Array,
  from?: SimSnapshot
): Uint8Array {
  const out = inputs.slice();
  let tr = trace(level, out, from);
  // The trace holds the run's states; after a removal the run differs from
  // it until it rejoins (its state after step `stale` matches the trace), so
  // a hold that starts at or before then needs a new trace.
  let stale = -1;
  let i = 0;
  while (i < out.length) {
    if (!out[i]) {
      i++;
      continue;
    }
    let r = i;
    while (r < out.length && out[r]) r++;
    if (i <= stale) {
      tr = trace(level, out, from);
      stale = -1;
    }
    // Flying holds steer: dropping one changes the flight, not just a tap.
    if (isFlying(MODE_LIST[tr.modes[i]])) {
      i = r;
      continue;
    }
    out.fill(0, i, r);
    // Only drop it if the run comes back to the same path (or finishes
    // soon): a flight that merely survives another way is a different run.
    const at = rejoinStep(level, out, tr, i, r - 1, 0, 240);
    if (at < 0) out.fill(1, i, r);
    else stale = at;
    i = r;
  }
  // Belt and braces: the simplified run must still finish.
  return replay(level, out, from).state.player.done ? out : inputs.slice();
}

/** measureSlack's pair search: how far back the previous press may be, and how far it may move (steps). */
const PAIR_GAP = 150;
const PAIR_SHIFT = 30;

/** How long a person's tap lasts, steps (50 ms). */
export const TAP_STEPS = 6;

/**
 * Lengthen the run's short taps to a person's TAP_STEPS where that changes
 * nothing, so the slack measure judges taps as people make them (a press
 * held through the start of a lantern's reach still fires it).
 */
export function humanize(
  level: LevelDef,
  inputs: Uint8Array,
  from?: SimSnapshot
): Uint8Array {
  const out = inputs.slice();
  let tr = trace(level, out, from);
  let stale = -1;
  let i = 0;
  while (i < out.length) {
    if (!out[i]) {
      i++;
      continue;
    }
    let r = i;
    while (r < out.length && out[r]) r++;
    let ns = r;
    while (ns < out.length && !out[ns]) ns++;
    const want = Math.min(
      i + TAP_STEPS,
      ns === out.length ? out.length : ns - 1
    );
    if (want > r) {
      if (i <= stale) {
        tr = trace(level, out, from);
        stale = -1;
      }
    }
    if (want > r && !isFlying(MODE_LIST[tr.modes[i]])) {
      out.fill(1, r, want);
      const at = rejoinStep(level, out, tr, r, want - 1, 0, 240);
      if (at < 0) out.fill(0, r, want);
      else stale = at;
    }
    i = Math.max(r, want);
  }
  return replay(level, out, from).state.player.done ? out : inputs.slice();
}

/** The witness, recorded step by step for the probes. */
interface Trace {
  f: Float64Array[];
  u: Uint8Array[];
  keys: Float64Array;
  modes: Uint8Array;
  xs: Float64Array;
  clear: Float64Array;
  lastHeld0: boolean;
  sim: DashSim;
}

function trace(level: LevelDef, inputs: Uint8Array, from?: SimSnapshot): Trace {
  const sim = createSim(level, { events: false });
  if (from) sim.restore(from);
  const n = level.objects.length;
  const steps = inputs.length;
  const f: Float64Array[] = [];
  const u: Uint8Array[] = [];
  const keys = new Float64Array(steps);
  const modes = new Uint8Array(steps);
  const xs = new Float64Array(steps);
  const clear = new Float64Array(steps);
  const inp = { held: false, pressed: false };
  const head = new Float64Array(SNAP_LEN);
  sim.saveTo(head, new Uint8Array(n));
  for (let i = 0; i < steps; i++) {
    const fi = new Float64Array(SNAP_LEN);
    const ui = new Uint8Array(n);
    sim.saveTo(fi, ui);
    f.push(fi);
    u.push(ui);
    modes[i] = MODE_LIST.indexOf(sim.state.player.mode);
    xs[i] = sim.state.player.x;
    inp.held = inputs[i] === 1;
    sim.step(inp);
    keys[i] = sim.key(1e-6, 1e-6);
    clear[i] = sim.clearance();
  }
  return { f, u, keys, modes, xs, clear, lastHeld0: head[20] === 1, sim };
}

/**
 * Replay the changed inputs from step s0 until the run dies (-1), finishes,
 * or rejoins the traced run's exact state after a step past `last`; returns
 * that step (the run will finish exactly as the traced one did).
 * `budget` > 0: also a pass if still alive that many steps after `last`.
 * `doneWithin` > 0: finishing only counts if it is that soon after `last`.
 */
function rejoinStep(
  level: LevelDef,
  inputs: Uint8Array,
  tr: Trace,
  s0: number,
  last: number,
  budget: number,
  doneWithin = 0
): number {
  const sim = tr.sim;
  const start = Math.max(0, s0);
  sim.loadFrom(tr.f[start], tr.u[start]);
  const inp = { held: false, pressed: false };
  const p = sim.state.player;
  for (let t = start; ; t++) {
    inp.held = t < inputs.length ? inputs[t] === 1 : false;
    sim.step(inp);
    if (p.dead) return -1;
    if (p.done) return doneWithin > 0 && t > last + doneWithin ? -1 : t;
    if (t > last && t < tr.keys.length && sim.key(1e-6, 1e-6) === tr.keys[t])
      return t;
    if (budget > 0 && t > last + budget) return t;
    if (t > inputs.length + 600) return -1;
  }
}

export interface PressSlack {
  /** Step of the press, Kiru's x then, and his mode. */
  step: number;
  x: number;
  mode: ModeId;
  /** Steps the tap can move earlier and later and still finish. */
  early: number;
  late: number;
  /** Half the window, ms: the ± a player gets aiming at its middle. */
  ms: number;
  /** A tap in Run, Roll or Shadow Step (judged by slack), not a flying mode (judged by clearance). */
  discrete: boolean;
}

export interface SlackReport {
  presses: PressSlack[];
  /** Over the discrete presses: the narrowest ± and the median, ms. */
  min: number;
  median: number;
  /** The three narrowest discrete presses. */
  tightest: PressSlack[];
  /** Presses whose window is a single step: never acceptable. */
  framePerfect: number;
  /** Over flying-mode presses (information only). */
  flyMin: number;
  flyMedian: number;
  /** Narrowest clearance along the path in the flying modes (blocks), and where. */
  clearance: number;
  clearanceX: number;
}

export interface SlackOptions {
  from?: SimSnapshot;
  /** Steps each way to try, at most (default 30 = 250 ms). */
  maxShift?: number;
  /**
   * The ± (ms) a press must reach. Discrete presses that fall short with the
   * rest of the run held fixed are measured again letting the rest of the
   * run adapt, as a player would: a shifted tap that sends Kiru down another
   * route still counts if a short search from there finishes (or rejoins
   * the run). Default 0: no second pass.
   */
  target?: number;
  /** Time limit for each of those searches (default 1500 ms). */
  adaptMs?: number;
}

/**
 * Slide each press of a finishing run earlier and later until it stops
 * finishing: the window a player has for it.
 */
export function measureSlack(
  level: LevelDef,
  inputs: Uint8Array,
  opts: SlackOptions = {}
): SlackReport {
  const maxShift = opts.maxShift ?? 30;
  const target = opts.target ?? 0;
  const adaptMs = opts.adaptMs ?? 1500;
  const tr = trace(level, inputs, opts.from);
  const steps = inputs.length;
  const work = inputs.slice();
  /** The previous discrete press: its start, end, and the end of the hold before it. */
  let prevSeg: [number, number, number] | null = null;
  /**
   * The widest window (steps) the hold [b, br) gets when the hold [a, ar)
   * before it may also move (up to PAIR_SHIFT steps either way, keeping a
   * release step from `ape`, its own previous hold, and from b).
   */
  const pairWindow = (
    a: number,
    ar: number,
    ape: number,
    b: number,
    br: number,
    bns: number
  ): number => {
    let best = 0;
    const ok = new Uint8Array(2 * maxShift + 1);
    for (let da = -PAIR_SHIFT; da <= PAIR_SHIFT; da += 2) {
      const a0 = a + da;
      const a1 = ar + da;
      if (a0 < (ape >= 0 ? ape + 2 : 0) || a1 >= b - 1) continue;
      ok.fill(0);
      for (let db = -maxShift; db <= maxShift; db++) {
        const b0 = b + db;
        const b1 = br + db;
        if (b0 <= a1 || b1 >= bns) continue;
        work.fill(0, a, ar);
        work.fill(0, b, br);
        work.fill(1, a0, a1);
        work.fill(1, b0, b1);
        const s0 = Math.min(a, a0);
        const s1 = Math.max(br, b1);
        ok[db + maxShift] = rejoinStep(level, work, tr, s0, s1, 0) >= 0 ? 1 : 0;
        work.fill(0, s0, s1);
        work.fill(1, a, ar);
        work.fill(1, b, br);
      }
      let run = 0;
      for (let q = 0; q < ok.length; q++) {
        run = ok[q] ? run + 1 : 0;
        if (run > best) best = run;
      }
    }
    return best;
  };
  let rj: Rejoin | null = null;
  const probeSim = createSim(level, { events: false, view: false });
  const inp = { held: false, pressed: false };
  /** Can the run still finish, playing on freely after the changed steps [s0, s1)? */
  const recovers = (s0: number, s1: number): boolean => {
    probeSim.loadFrom(tr.f[s0], tr.u[s0]);
    for (let t = s0; t < s1; t++) {
      inp.held = work[t] === 1;
      probeSim.step(inp);
      if (probeSim.over === 1) return false;
      if (probeSim.over === 2) return true;
    }
    if (!rj) rj = rejoinFrom(level, inputs, opts.from);
    return solve(level, {
      from: probeSim.snapshot(),
      rejoin: rj,
      timeLimitMs: adaptMs,
      beam: 600,
      qy: 1 / 16,
      qv: 1 / 2,
    }).ok;
  };
  const presses: PressSlack[] = [];

  for (let i = 0; i < steps; i++) {
    const prev = i > 0 ? inputs[i - 1] === 1 : tr.lastHeld0;
    if (!inputs[i] || prev) continue;
    let r = i;
    while (r < steps && inputs[r]) r++;
    // The neighbouring holds: a shift must leave at least one step of
    // release between this hold and them, or the press would vanish.
    let pe = i - 1;
    while (pe >= 0 && !inputs[pe]) pe--;
    let ns = r;
    while (ns < steps && !inputs[ns]) ns++;
    const mode = MODE_LIST[tr.modes[i]];
    const discrete = !isFlying(mode);
    const budget = discrete ? 0 : 240;
    const minA = pe >= 0 ? pe + 2 : tr.lastHeld0 ? 1 : 0;
    const probe = (dir: -1 | 1, adapt: boolean): number => {
      let ok = 0;
      for (let d = 1; d <= maxShift; d++) {
        const a = i + dir * d;
        const b = r + dir * d;
        if (a < minA || b >= ns) break;
        work.fill(0, i, r);
        work.fill(1, a, b);
        const s0 = Math.min(i, a);
        const s1 = Math.max(r, b);
        const good =
          rejoinStep(level, work, tr, s0, s1, budget) >= 0 ||
          (adapt && recovers(s0, s1));
        work.fill(0, s0, s1);
        work.fill(1, i, r);
        if (!good) break;
        ok = d;
      }
      return ok;
    };
    let early = probe(-1, false);
    let late = probe(1, false);
    const short = () => ((early + late + 1) * STEP * 1000) / 2 < target;
    if (discrete && short()) {
      early = probe(-1, true);
      late = probe(1, true);
    }
    if (discrete && short() && prevSeg && i - prevSeg[0] <= PAIR_GAP) {
      // Still short: perhaps only because the press before it was made late
      // or early. A player learns that one too, so let it move as well and
      // keep the widest window this press gets.
      const best = pairWindow(prevSeg[0], prevSeg[1], prevSeg[2], i, r, ns);
      if (best > early + late + 1) {
        early = Math.floor((best - 1) / 2);
        late = best - 1 - early;
      }
    }
    if (discrete) prevSeg = [i, r, pe];
    presses.push({
      step: i,
      x: tr.xs[i],
      mode,
      early,
      late,
      ms: ((early + late + 1) * STEP * 1000) / 2,
      discrete,
    });
    i = r;
  }

  const disc = presses.filter((p) => p.discrete).sort((a, b) => a.ms - b.ms);
  const fly = presses.filter((p) => !p.discrete).sort((a, b) => a.ms - b.ms);
  const med = (a: PressSlack[]) =>
    a.length ? a[Math.floor((a.length - 1) / 2)].ms : Infinity;
  let clearance = Infinity;
  let clearanceX = NaN;
  for (let i = 0; i < steps; i++) {
    if (!isFlying(MODE_LIST[tr.modes[i]])) continue;
    if (tr.clear[i] < clearance) {
      clearance = tr.clear[i];
      clearanceX = tr.xs[i];
    }
  }
  return {
    presses,
    min: disc.length ? disc[0].ms : Infinity,
    median: med(disc),
    tightest: disc.slice(0, 3),
    framePerfect: disc.filter((p) => p.early + p.late === 0).length,
    flyMin: fly.length ? fly[0].ms : Infinity,
    flyMedian: med(fly),
    clearance,
    clearanceX,
  };
}
