/**
 * Kiru's Rooftop Run: Dash — the runtime. It runs a level: the loop, the
 * input, attempts and practice, and the glue between the simulation, the
 * renderer and the audio. Canvas 2D, no libraries, no React.
 *
 * - The sim steps at a fixed 120 Hz on a performance.now() clock, with an
 *   accumulator; drawing interpolates between the last two steps, so it is
 *   as smooth at 60 Hz as at 144, and a slow phone plays exactly the same
 *   level as a fast desktop.
 * - Level time is song time. Whenever the clock starts again (an attempt, a
 *   practice respawn, a resume) the level and the music are anchored to the
 *   same instant. A stall too long to catch up on is let go, and the song is
 *   brought back in line with the level.
 * - Input is timestamped. A press lands on the 120 Hz step it happened in,
 *   not on the next frame, so the timing is as tight at 30 fps as at 120;
 *   and a tap pressed and released between two frames is never lost.
 * - The loop runs only while something moves. Paused, hidden, scrolled
 *   away, or a level finished: no requestAnimationFrame at all.
 * - The view is measured in blocks: 11.5 tall, its width clamped to
 *   16–26.5; past the clamp the height gives (portrait sees more sky, never
 *   less road). A struggling device draws fewer pixels rather than drop
 *   frames.
 * - Nothing is allocated per frame.
 */
import { createAttract, type DashAttract } from './attract';
import {
  CAM_X,
  clearOfHazards,
  clearOfSolids,
  createCamera,
  firstBox,
  indexLevel,
  type CameraSave,
  type LevelBoxes,
} from './camera';
import type { DashDevHooks } from './dev';
import { JUMP_V, SNAP, gravityOf, isFlying, maxFallOf } from './physics';
import { createRenderer } from './render';
import { createSim } from './sim';
import {
  MAX_COUNT,
  SPEEDS,
  STEP,
  VIEW_H,
  VIEW_W_MAX,
  VIEW_W_MIN,
  type DashEngine,
  type DashEngineOptions,
  type DashPhase,
  type DashRenderer,
  type DashRunInfo,
  type Input,
  type KiruSkin,
  type LevelDef,
  type LevelProgress,
  type PlayerView,
  type RenderFrame,
  type Sim,
  type SimEvent,
  type SimSnapshot,
  type SimState,
} from './types';

/** At most this many steps are caught up in one frame (0.25 s). */
const MAX_STEPS = 30;
/** The shatter plays this long before the next attempt starts (seconds). */
const DEATH_DELAY = 0.6;
/** Behind the menus a (rare) fall restarts the strip after this long. */
const ATTRACT_DEATH_DELAY = 0.8;
/** The finish celebration animates this long; then the loop stops. */
const COMPLETE_TIME = 3;
/** Past the finish line the camera eases to a stop over this long (seconds). */
const RUNOUT_CAMERA_STOP = 0.7;
/** A flying mode levels out past the line with this time constant (seconds). */
const RUNOUT_LEVEL_OUT = 0.12;
/** Practice: an automatic checkpoint at most this often (level seconds). */
const AUTO_CHECKPOINT = 2.5;
/** Practice keeps at most this many checkpoints (the oldest go first). */
const MAX_CHECKPOINTS = 240;
/**
 * A landing at least this fast (blocks/s) is a hard one, and thuds. A jump
 * that comes back down to where it left lands at JUMP_V; anything harder fell
 * further than that (a drop, a drum, a lantern, a Roll flip across a gap).
 */
const HARD_LAND = JUMP_V * 1.1;
/** The canvas backing store never exceeds this many pixels. */
const MAX_PIXELS = 2.4e6;
/** Adaptive quality judges this many seconds of frames at a time. */
const QUALITY_WINDOW = 1.5;
/** Frames slower than this on average (ms, about 42 fps) mean the device is struggling. */
const SLOW_FRAME = 24;
/** Quality never drops below this (a fraction of the device pixel ratio). */
const MIN_QUALITY = 0.4;
/** Input transitions waiting for the step they belong to. */
const QUEUE = 64;

interface Checkpoint {
  snap: SimSnapshot;
  x: number;
  y: number;
  t: number;
  cam: CameraSave;
}

export function createDashEngine(opts: DashEngineOptions): DashEngine {
  const canvas = opts.canvas;
  const audio = opts.audio;
  const reduced = opts.reducedMotion;
  // Throws without a 2D context; the shell catches it and says so.
  const renderer = createRenderer(canvas, {
    hudFont: opts.hudFont,
    reducedMotion: reduced,
  });
  const camera = createCamera();
  let skin: KiruSkin = opts.skin;
  let disposed = false;

  // ── View ─────────────────────────────────────────────────────────────────
  let cssW = 0;
  let cssH = 0;
  let dpr = 1;
  let quality = 1;
  let viewW = VIEW_W_MIN;
  let viewH = VIEW_H;

  // ── What is running ──────────────────────────────────────────────────────
  let phase: DashPhase = 'attract';
  let phaseAt = 0;
  /** Seconds of this attempt played before a pause, so phaseT carries on after it. */
  let playedFor = 0;
  /** 'level': a real level; 'attract': the strip behind the menus. */
  let mode: 'none' | 'level' | 'attract' = 'none';
  let level: LevelDef | null = null;
  let sim: Sim | null = null;
  let boxes: LevelBoxes | null = null;
  let attract: DashAttract | null = null;
  /** Attract only: level time carried over from earlier strips, so animation never jumps. */
  let tBase = 0;
  let attractDeadAt = 0;

  // ── Attempts ─────────────────────────────────────────────────────────────
  let practice = false;
  let attempt = 0;
  /** Best whole percent, normal and practice, including attempts this session. */
  let bestNormal = 0;
  let bestPractice = 0;
  /** The best in force when this attempt began: what "new best" is measured against. */
  let attemptBest = 0;
  let attemptT0 = 0;
  let attemptJumps0 = 0;
  let passedBest = false;
  /**
   * The attempt on screen has begun and has not yet been counted (by a
   * death, the finish, or being given up part-way).
   */
  let attemptOpen = false;
  /** The level's song has been started for this attempt (and not stopped). */
  let songOn = false;
  const checkpoints: Checkpoint[] = [];
  /** What the renderer sees of them: the same objects every frame. */
  const marks: { x: number; y: number }[] = [];
  let lastAuto = 0;

  // ── Interpolation ────────────────────────────────────────────────────────
  let prevX = 0;
  let prevY = 0;
  let prevT = 0;
  let lastAlpha = 1;
  let lastHeld = false;

  // ── Input ────────────────────────────────────────────────────────────────
  // The physical button: any game key or any pointer down.
  const keysDown = new Set<string>();
  const pointersDown = new Set<number>();
  let liveHeld = false;
  /** The press that resumed from pause is not also a jump: ignore it until released. */
  let swallow = false;
  /** The button as the sim has seen it so far. */
  let simHeld = false;
  // Transitions (time in ms, 1 down / 0 up) waiting for their step.
  const qTime = new Float64Array(QUEUE);
  const qDown = new Uint8Array(QUEUE);
  let qHead = 0;
  let qLen = 0;
  const input: Input = { held: false, pressed: false };
  // Development autopilot: the solver's inputs, by step index from the start.
  let devPressed: Uint8Array | null = null;
  let devHeld: Uint8Array | null = null;

  // ── Loop ─────────────────────────────────────────────────────────────────
  let raf = 0;
  let last = 0;
  let acc = 0;
  /** JS time per frame (ms), smoothed. */
  let cost = 0;
  // Adaptive quality: the current window of frames, and the last change,
  // which is undone if it did not help.
  let winT = 0;
  let winN = 0;
  let winSkip = 0;
  let qualityPrev = 0;
  let qualityBefore = 0;
  let qualityLocked = false;
  /** A new quality was decided mid-attempt and waits for a safe moment. */
  let qualityPending = false;
  let hidden = typeof document !== 'undefined' && document.hidden;
  let onScreen = true;
  /** How much of the canvas is on screen (the IntersectionObserver's latest word). */
  let ratio = 1;
  let seenVisible = false;
  let devFrames = 0;
  let devSteps = 0;
  let overlay: DashRenderer | null = null;
  let toggleOverlay: (() => void) | null = null;
  let devDispose: (() => void) | null = null;

  // One frame object for the renderer, refilled in place every frame.
  let fr: RenderFrame | null = null;

  // ── The run-out ──────────────────────────────────────────────────────────
  // Past the finish line the sim is done and stops, as it must (the stats
  // and the solver rely on it). What the player sees carries on, Geometry
  // Dash style: Kiru runs on through the finish torii at the speed he
  // finished at, lands if he crossed the line in the air (the flying modes
  // level out instead), and the camera eases to a stop, so he runs off the
  // right of the screen while the celebration plays. It is a copy of his
  // PlayerView in a copy of the state, stepped at 120 Hz and interpolated
  // like the sim: no input, no events, no deaths, and anything sharp past
  // the line is ignored. The renderer draws from it as from the sim.
  let runout = false;
  const outPlayer: PlayerView = {
    x: 0,
    y: 0,
    vy: 0,
    w: 0.8,
    h: 1.4,
    mode: 'run',
    grav: 1,
    grounded: true,
    rot: 0,
    flipT: Infinity,
    modeT: 0,
    jumpT: Infinity,
    dead: false,
    done: true,
  };
  const outState: SimState = {
    t: 0,
    frame: 0,
    player: outPlayer,
    speed: 'normal',
    bounds: { floor: null, ceil: null },
    used: new Uint8Array(0),
    events: [],
    progress: 1,
    jumps: 0,
    scrolls: [false, false, false],
  };
  let outSpeed = 0;
  /** Seconds since the line. */
  let outTau = 0;
  let outCamX0 = 0;
  let outCamY0 = 0;
  let outCamVY0 = 0;
  let outCamX = 0;
  let outCamY = 0;
  let prevOutCamX = 0;
  let prevOutCamY = 0;
  const camSave: CameraSave = { y: 0, vy: 0, goal: 0 };

  // ── Helpers ──────────────────────────────────────────────────────────────
  /** The phase as it is now: a callback to the shell may have changed it. */
  const phaseNow = (): DashPhase => phase;
  const percentOf = (st: SimState) =>
    st.player.done
      ? 100
      : Math.max(0, Math.min(99, Math.floor(st.progress * 100)));

  function runInfo(): DashRunInfo {
    const st = sim!.state;
    const percent = percentOf(st);
    return {
      levelId: level!.id,
      practice,
      attempt,
      percent,
      best: Math.max(attemptBest, percent),
      newBest: percent > attemptBest,
      completed: st.player.done,
      scrolls: [st.scrolls[0], st.scrolls[1], st.scrolls[2]],
      jumps: st.jumps - attemptJumps0,
      time: Math.max(0, st.t - attemptT0),
    };
  }

  function setPhase(p: DashPhase) {
    phase = p;
    phaseAt = performance.now();
    // While Kiru runs, the canvas takes every touch (no scrolling, no zoom).
    if (p === 'playing' || p === 'dying')
      canvas.setAttribute('data-playing', '');
    else canvas.removeAttribute('data-playing');
  }

  function loadLevel(lv: LevelDef) {
    runout = false;
    level = lv;
    sim = createSim(lv);
    boxes = indexLevel(lv);
    camera.setLevel(boxes);
    renderer.setLevel(lv);
    overlay?.setLevel(lv);
    const st = sim.state;
    if (!fr) {
      fr = {
        level: lv,
        state: st,
        t: 0,
        px: 0,
        py: 0,
        camX: 0,
        camY: 0,
        viewW,
        viewH,
        beat: 0,
        phase,
        phaseT: 0,
        attempt: 0,
        practice: false,
        checkpoints: marks,
        best: 0,
        held: false,
        skin,
        reducedMotion: reduced,
      };
    }
    fr.level = lv;
    fr.state = st;
  }

  function settle() {
    const st = sim!.state;
    prevX = st.player.x;
    prevY = st.player.y;
    prevT = st.t;
    lastAlpha = 0;
  }

  // ── Input queue ──────────────────────────────────────────────────────────
  function enqueue(down: boolean) {
    if (qLen === QUEUE) {
      // Sixty-four presses between two frames: drop the oldest.
      qHead = (qHead + 1) % QUEUE;
      qLen--;
    }
    const i = (qHead + qLen) % QUEUE;
    qTime[i] = performance.now();
    qDown[i] = down ? 1 : 0;
    qLen++;
  }

  function clearQueue() {
    qHead = 0;
    qLen = 0;
  }

  /** The button for the step that ends at wall time `until` (ms). */
  function readInput(until: number) {
    let pressed = false;
    while (qLen > 0 && qTime[qHead] <= until) {
      if (qDown[qHead]) {
        pressed = true;
        simHeld = true;
      } else simHeld = false;
      qHead = (qHead + 1) % QUEUE;
      qLen--;
    }
    input.pressed = pressed;
    // A tap that came and went within this step was still held during it.
    input.held = simHeld || pressed;
  }

  function buttonDown() {
    if (liveHeld) {
      // Already down (a second finger, a second key): still a new press,
      // so a finger can take a spirit lantern while
      // another holds. It is a real press, so a held resume button now
      // counts as held too (its release is no longer swallowed).
      if (phase === 'playing') {
        swallow = false;
        enqueue(true);
      }
      return;
    }
    liveHeld = true;
    if (phase === 'playing') enqueue(true);
    else if (phase === 'paused') resume();
  }

  function buttonUp() {
    if (keysDown.size > 0 || pointersDown.size > 0 || !liveHeld) return;
    liveHeld = false;
    if (swallow) swallow = false;
    else if (phase === 'playing') enqueue(false);
  }

  function releaseAll() {
    keysDown.clear();
    pointersDown.clear();
    if (liveHeld) {
      liveHeld = false;
      if (phase === 'playing' && !swallow) enqueue(false);
    }
    swallow = false;
  }

  // ── Attempts ─────────────────────────────────────────────────────────────
  /**
   * A new attempt: from the start, or in practice from the latest
   * checkpoint. `paused` sets it up without starting the clock or the song
   * (a pause that arrived during the death shatter).
   */
  function beginAttempt(paused: boolean) {
    const s = sim!;
    // A quality change waiting from the last attempt: before the clock starts.
    flushQuality();
    // The attempt being left part-way counts (see abandon). One that never
    // ran gives its number to this one, so the count on screen is the count
    // saved.
    abandon();
    // (Capped as the save is, so the end card and the level card agree.)
    if (!attemptOpen) attempt = Math.min(MAX_COUNT, attempt + 1);
    attemptOpen = true;
    runout = false;
    const cp =
      practice && checkpoints.length > 0
        ? checkpoints[checkpoints.length - 1]
        : null;
    if (cp) {
      s.restore(cp.snap);
      camera.load(cp.cam);
    } else {
      s.reset();
      camera.snap(s.state);
    }
    const st = s.state;
    if (fr) fr.state = st;
    settle();
    attemptT0 = st.t;
    attemptJumps0 = st.jumps;
    lastAuto = st.t;
    attemptBest = practice ? bestPractice : bestNormal;
    passedBest = percentOf(st) > attemptBest;
    clearQueue();
    // Holding the button through a respawn counts.
    simHeld = liveHeld && !swallow;
    songOn = false;
    playedFor = 0;
    if (paused || hidden) {
      setPhase('paused');
      draw(performance.now());
      opts.onPhase('paused', runInfo());
      return;
    }
    setPhase('playing');
    opts.onPhase('playing', runInfo());
    // The shell may have paused or moved on from inside onPhase.
    if (phaseNow() === 'playing') startClock();
  }

  /**
   * The level clock and the song start together, at this instant: level
   * time `t` is song time `t`.
   */
  function startClock() {
    const t = sim!.state.t;
    stopLoop();
    startLoop();
    if (songOn) audio.resume(t);
    else audio.play(level!.id, t);
    songOn = true;
  }

  /**
   * An attempt given up part-way (a restart, a practice switch, back to the
   * menus, another level) still counts if any of it
   * was played: reported with `abandoned`, it adds an attempt and its jumps
   * but sets no best and keeps no scrolls.
   */
  function abandon() {
    if (!attemptOpen || !sim || !level || !(sim.state.t > attemptT0)) return;
    attemptOpen = false;
    const info = runInfo();
    info.abandoned = true;
    info.completed = false;
    info.newBest = false;
    info.best = attemptBest;
    opts.onAttempt(info);
  }

  /** The attempt ended (death or the finish line): report it, keep the bests. */
  function endAttempt(next: 'dying' | 'complete') {
    attemptOpen = false;
    const info = runInfo();
    if (practice) bestPractice = Math.max(bestPractice, info.percent);
    else bestNormal = Math.max(bestNormal, info.percent);
    setPhase(next);
    opts.onAttempt(info);
    // Unless the shell already moved on from inside onAttempt.
    if (phaseNow() === next) opts.onPhase(next, info);
  }

  function addCheckpoint(manual: boolean) {
    const s = sim!;
    const st = s.state;
    const p = st.player;
    const cam: CameraSave = { y: 0, vy: 0, goal: 0 };
    camera.save(cam);
    checkpoints.push({
      snap: s.snapshot(),
      x: p.x,
      y: p.y,
      t: st.t,
      cam,
    });
    marks.push({ x: p.x, y: p.y });
    if (checkpoints.length > MAX_CHECKPOINTS) {
      checkpoints.shift();
      marks.shift();
    }
    if (manual) audio.sfx('checkpoint');
  }

  /**
   * Automatic checkpoints, every ~2.5 s of level time, only where it is safe
   * to come back to: on the ground in the ground modes (never mid-jump),
   * anywhere in the flying modes, and never within a block of a hazard.
   */
  function autoCheckpoint(st: SimState) {
    if (st.t - lastAuto < AUTO_CHECKPOINT) return;
    const p = st.player;
    const flying =
      p.mode === 'kite' || p.mode === 'parasol' || p.mode === 'dragon';
    if (!flying && !p.grounded) return;
    if (p.flipT < 0.25 || p.modeT < 0.25) return;
    const ahead = SPEEDS[st.speed] * 0.15;
    const b = boxes!;
    const x0 = p.x - p.w / 2;
    const x1 = p.x + p.w / 2;
    const y0 = p.y - p.h / 2;
    const y1 = p.y + p.h / 2;
    if (!clearOfHazards(b, x0 - 1, x1 + 1 + ahead, y0 - 1, y1 + 1)) return;
    // Nor facing a wall: the side of a block or roof just ahead kills.
    if (!clearOfSolids(b, x1 + 0.05, x1 + 1 + ahead, y0 + 0.1, y1 - 0.1))
      return;
    addCheckpoint(false);
    lastAuto = st.t;
  }

  function sfxFor(ev: SimEvent) {
    switch (ev.e) {
      case 'land':
        if (Math.abs(ev.v) >= HARD_LAND) audio.sfx('land');
        break;
      case 'death':
      case 'complete':
        break; // sounded with the phase change
      default:
        audio.sfx(ev.e);
    }
  }

  // ── Simulation ───────────────────────────────────────────────────────────
  function stepOnce(until: number, now: number) {
    const s = sim!;
    let st = s.state;
    if (mode === 'attract') {
      attract!.input(st, input);
      clearQueue();
    } else if (devHeld) {
      const f = st.frame;
      input.held = f < devHeld.length && devHeld[f] === 1;
      input.pressed =
        devPressed !== null && f < devPressed.length && devPressed[f] === 1;
      clearQueue();
    } else {
      readInput(until);
    }
    lastHeld = input.held;
    prevX = st.player.x;
    prevY = st.player.y;
    prevT = st.t;
    s.step(input);
    st = s.state;
    if (process.env.NODE_ENV !== 'production') devSteps++;
    camera.step(st, STEP);
    const p = st.player;
    const evs = st.events;
    if (evs.length > 0) {
      fill(1, now);
      for (let i = 0; i < evs.length; i++) {
        const ev = evs[i];
        // Shadow Step is instant: never draw him sliding between surfaces.
        if (ev.e === 'teleport') prevY = p.y;
        renderer.event(ev, fr!);
        if (mode === 'level') sfxFor(ev);
      }
    }
    if (mode === 'attract') {
      if (p.dead) {
        if (!attractDeadAt) attractDeadAt = now;
      } else {
        const next = attract!.next(st);
        if (next) handoff(next);
      }
      return;
    }
    if (p.dead) {
      audio.stop();
      songOn = false;
      audio.sfx('death');
      endAttempt('dying');
      return;
    }
    if (p.done) {
      // The run-out starts first: the shell may restart from inside a callback.
      beginRunout();
      audio.sfx('complete');
      endAttempt('complete');
      return;
    }
    if (!passedBest && attemptBest > 0 && percentOf(st) > attemptBest) {
      passedBest = true;
      audio.sfx('newBest');
    }
    if (practice) autoCheckpoint(st);
  }

  /** Attract: the next strip takes over where Kiru is, without a seam. */
  function handoff(next: LevelDef) {
    tBase += sim!.state.t;
    loadLevel(next);
    settle();
  }

  function attractRestart() {
    tBase = 0;
    attractDeadAt = 0;
    acc = 0;
    loadLevel(attract!.begin());
    sim!.reset();
    camera.snap(sim!.state);
    settle();
  }

  /** The finish step: the run-out takes over from where the sim stopped. */
  function beginRunout() {
    const st = sim!.state;
    const p = st.player;
    const o = outPlayer;
    o.x = p.x;
    o.y = p.y;
    o.vy = p.vy;
    o.w = p.w;
    o.h = p.h;
    o.mode = p.mode;
    o.grav = p.grav;
    o.grounded = p.grounded;
    o.rot = p.rot;
    o.flipT = p.flipT;
    o.modeT = p.modeT;
    o.jumpT = p.jumpT;
    outState.t = st.t;
    outState.frame = st.frame;
    outState.speed = st.speed;
    outState.bounds.floor = st.bounds.floor;
    outState.bounds.ceil = st.bounds.ceil;
    outState.used = st.used;
    outState.jumps = st.jumps;
    outState.scrolls = st.scrolls;
    outSpeed = SPEEDS[st.speed];
    outTau = 0;
    // No input past the line: the kite and the dragon don't pose as climbing.
    lastHeld = false;
    // The camera carries on exactly from where it was, then eases to a stop.
    outCamX0 = outCamX = p.x - CAM_X * viewW;
    prevOutCamX = prevX - CAM_X * viewW;
    camera.save(camSave);
    outCamY0 = outCamY = camera.y;
    prevOutCamY = camera.prevY;
    outCamVY0 = camSave.vy;
    runout = true;
  }

  /**
   * The highest surface under Kiru's box that is no higher than `limit`, in
   * g-space (up is away from the ground he is drawn to): roof and block tops,
   * or block undersides when he is upside down, and the corridor's lines.
   * -Infinity when there is none.
   */
  function groundUnder(limit: number): number {
    const o = outPlayer;
    const sol = boxes!.solids;
    const x0 = o.x - o.w / 2;
    const x1 = o.x + o.w / 2;
    let best = -Infinity;
    for (let i = firstBox(sol, x0); i < sol.n && sol.x0[i] < x1; i++) {
      if (sol.x1[i] <= x0) continue;
      // A roof has no underside to stand on upside down (its y0 is far below).
      const top = o.grav === 1 ? sol.y1[i] : -sol.y0[i];
      if (top <= limit && top > best) best = top;
    }
    const line = o.grav === 1 ? outState.bounds.floor : outState.bounds.ceil;
    if (line !== null) {
      const top = o.grav === 1 ? line : -line;
      if (top <= limit && top > best) best = top;
    }
    return best;
  }

  /** One 120 Hz step of the run-out. */
  function runoutStep() {
    const o = outPlayer;
    prevX = o.x;
    prevY = o.y;
    prevT = outState.t;
    prevOutCamX = outCamX;
    prevOutCamY = outCamY;
    outTau += STEP;
    outState.t += STEP;
    outState.frame++;
    o.jumpT += STEP;
    o.flipT += STEP;
    o.modeT += STEP;
    o.x += outSpeed * STEP;
    const g = o.grav;
    const hh = o.h / 2;
    if (isFlying(o.mode)) {
      // The flying modes level out and carry straight on.
      o.vy *= Math.exp(-STEP / RUNOUT_LEVEL_OUT);
      o.y += o.vy * STEP;
      const b = outState.bounds;
      if (b.floor !== null && o.y - hh < b.floor) o.y = b.floor + hh;
      if (b.ceil !== null && o.y + hh > b.ceil) o.y = b.ceil - hh;
      const pitch = Math.atan2(o.vy, outSpeed);
      o.rot = o.mode === 'parasol' ? 0.35 * pitch : pitch;
    } else {
      // On foot (Run, Roll, Shadow Step): the feet follow the ground, a
      // little step up or down included; off an edge, or over the line in
      // mid-air, he falls (the sim's gravity and fall cap) and lands.
      const feet = g * o.y - hh;
      if (o.grounded) {
        const top = groundUnder(feet + SNAP[o.mode]);
        if (top >= feet - 0.05) {
          o.y = g * (top + hh);
          o.vy = 0;
        } else o.grounded = false;
      }
      if (!o.grounded) {
        const vg0 = g * o.vy;
        const vg1 = Math.max(
          vg0 - gravityOf(o.mode) * STEP,
          -maxFallOf(o.mode, outSpeed)
        );
        let f1 = feet + 0.5 * (vg0 + vg1) * STEP;
        let v1 = vg1;
        if (vg1 <= 0) {
          const top = groundUnder(feet + 0.05);
          if (f1 <= top) {
            f1 = top;
            v1 = 0;
            o.grounded = true;
          }
        }
        // Nothing below at all: past the kill lines he stops falling (he is
        // long out of sight by then).
        if (f1 < -60) v1 = 0;
        o.y = g * (f1 + hh);
        o.vy = g * v1;
      }
      if (o.mode === 'roll') {
        // Still rolling, the sim's way (upside down it turns the other way).
        o.rot -= (g * outSpeed * STEP) / hh;
        if (o.rot < -Math.PI) o.rot += Math.PI * 2;
        else if (o.rot > Math.PI) o.rot -= Math.PI * 2;
      } else o.rot = 0;
    }
    // The camera: Kiru's speed at the line, easing to nothing (and the same
    // for any vertical drift it had), so he runs out of the frame.
    const k = Math.min(outTau / RUNOUT_CAMERA_STOP, 1);
    const travelled =
      (RUNOUT_CAMERA_STOP / 3) * (1 - (1 - k) * (1 - k) * (1 - k));
    outCamX = outCamX0 + outSpeed * travelled;
    outCamY = outCamY0 + outCamVY0 * travelled;
  }

  // ── Drawing ──────────────────────────────────────────────────────────────
  function fill(alpha: number, now: number) {
    const f = fr!;
    const st = runout ? outState : sim!.state;
    const p = st.player;
    f.state = st;
    f.t = tBase + prevT + (st.t - prevT) * alpha;
    f.px = prevX + (p.x - prevX) * alpha;
    f.py = prevY + (p.y - prevY) * alpha;
    if (runout) {
      f.camX = prevOutCamX + (outCamX - prevOutCamX) * alpha;
      f.camY = prevOutCamY + (outCamY - prevOutCamY) * alpha;
    } else {
      f.camX = f.px - CAM_X * viewW;
      f.camY = camera.prevY + (camera.y - camera.prevY) * alpha;
    }
    f.viewW = viewW;
    f.viewH = viewH;
    f.beat = (f.t * level!.bpm) / 60;
    f.phase = phase;
    f.phaseT = Math.max(0, (now - phaseAt) / 1000);
    f.attempt = attempt;
    f.practice = practice;
    f.best = attemptBest / 100;
    f.held = lastHeld;
    f.skin = skin;
  }

  function draw(now: number) {
    if (!sim || !fr) return;
    fill(lastAlpha, now);
    renderer.draw(fr);
    if (overlay) overlay.draw(fr);
  }

  // ── Loop ─────────────────────────────────────────────────────────────────
  function wantLoop(): boolean {
    if (disposed || hidden || !sim) return false;
    switch (phase) {
      case 'playing':
      case 'dying':
        return true;
      case 'attract':
        return onScreen;
      case 'complete':
        return onScreen && performance.now() - phaseAt < COMPLETE_TIME * 1000;
      default:
        return false;
    }
  }

  function startLoop() {
    if (raf || !wantLoop()) return;
    // A stopped clock restarts from now: no time passed while it was off.
    last = performance.now();
    acc = 0;
    raf = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function syncLoop() {
    if (wantLoop()) startLoop();
    else stopLoop();
  }

  /** Phases that step at 120 Hz: play, behind the menus, and the run-out. */
  function stepping(): boolean {
    return (
      phase === 'playing' ||
      phase === 'attract' ||
      (phase === 'complete' && runout)
    );
  }

  function frame() {
    raf = 0;
    if (disposed || !sim) return;
    // A quality change that waited out the attempt (adapt) happens now,
    // while Kiru shatters or the finish plays, and before this frame takes
    // its time: the long frame is spent inside the 0.6 s death delay.
    if (qualityPending && phase !== 'playing') flushQuality();
    const now = performance.now();
    if (process.env.NODE_ENV !== 'production') devFrames++;
    let dt = (now - last) / 1000;
    last = now;
    if (dt < 0) dt = 0;
    if (stepping()) {
      acc += dt;
      const acc0 = acc;
      let n = 0;
      while (acc >= STEP && n < MAX_STEPS) {
        n++;
        // Taken first: a callback that restarts the clock leaves it at 0.
        acc -= STEP;
        if (phase === 'complete') runoutStep();
        // This step brings the level up to wall time `until`.
        else stepOnce(now - (acc0 - n * STEP) * 1000, now);
        if (!stepping()) break;
        if (mode === 'attract' && attractDeadAt) break;
      }
      if (stepping()) {
        if (acc >= STEP) {
          // A stall longer than we catch up on (a long task, a debugger):
          // let that time go, and bring the song back in line with the level.
          acc = 0;
          if (phase === 'playing' && songOn) {
            audio.pause();
            audio.resume(sim.state.t);
          }
        }
        lastAlpha = acc / STEP;
      } else {
        acc = 0;
        lastAlpha = 1;
      }
    } else {
      lastAlpha = 1;
    }

    const since = (now - phaseAt) / 1000;
    if (phase === 'dying' && since >= DEATH_DELAY) {
      beginAttempt(false);
    } else if (
      mode === 'attract' &&
      attractDeadAt &&
      now - attractDeadAt >= ATTRACT_DEATH_DELAY * 1000
    ) {
      attractRestart();
    }

    draw(now);
    cost = cost * 0.95 + (performance.now() - now) * 0.05;
    adapt(dt);
    if (!raf && wantLoop()) raf = requestAnimationFrame(frame);
  }

  /**
   * If this device struggles, draw fewer pixels rather than drop frames.
   * Most of a slow frame is the browser rasterising the canvas after this
   * callback has returned, so the honest signal is the time between frames
   * (as well as our own JS time). A step down is sized to how slow it is; a
   * step that does not help (a display capped at 30 Hz, say) is undone, and
   * then quality is left alone.
   */
  function adapt(dt: number) {
    // A change waiting for a safe moment: until it is made, these frames
    // are still at the old size and say nothing new.
    if (qualityPending) return;
    // The frames right after a re-bake, and a stall (a long task, a
    // debugger), say nothing about how fast this device draws.
    if (winSkip > 0 || dt > 0.25) {
      if (winSkip > 0) winSkip--;
      return;
    }
    winT += dt;
    winN++;
    if (winT < QUALITY_WINDOW) return;
    const avg = (winT / winN) * 1000;
    winT = 0;
    winN = 0;
    if (qualityPrev > 0) {
      // Judge the last step down: undo it if frames are no quicker.
      if (avg > qualityBefore * 0.9) {
        quality = qualityPrev;
        qualityLocked = true;
        requestQuality();
      }
      qualityPrev = 0;
      return;
    }
    if (qualityLocked || quality <= MIN_QUALITY) return;
    if (avg > SLOW_FRAME) {
      // Pixels go with the square of the scale: aim for ~17 ms frames.
      const k = Math.min(0.85, Math.max(0.55, Math.sqrt(17 / avg)));
      qualityPrev = quality;
      qualityBefore = avg;
      quality = Math.max(MIN_QUALITY, quality * k);
      requestQuality();
    } else if (cost > 9) {
      quality = Math.max(MIN_QUALITY, quality * 0.75);
      requestQuality();
    }
  }

  /**
   * A new quality re-bakes every sprite: a long frame (hundreds of ms on the
   * slow devices that need it). Never during an attempt, where it would
   * freeze the run and cost a fair jump: it waits for the next safe moment
   * (the death shatter, a pause, the next attempt, the finish, the menus).
   * Behind the menus it happens at once.
   */
  function requestQuality() {
    if (mode === 'level' && phase === 'playing') qualityPending = true;
    else resize(true);
  }

  /** Make a waiting quality change now (a safe moment). */
  function flushQuality() {
    if (qualityPending) resize(true);
  }

  // ── Size ─────────────────────────────────────────────────────────────────
  function resize(force: boolean) {
    const r = canvas.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    let d = Math.min(window.devicePixelRatio || 1, 2) * quality;
    if (r.width * r.height * d * d > MAX_PIXELS) {
      d = Math.sqrt(MAX_PIXELS / (r.width * r.height));
    }
    if (!force && r.width === cssW && r.height === cssH && d === dpr) return;
    // Any re-bake applies the current quality, a waiting change included.
    qualityPending = false;
    cssW = r.width;
    cssH = r.height;
    dpr = d;
    const bw = Math.round(cssW * dpr);
    const bh = Math.round(cssH * dpr);
    if (canvas.width !== bw) canvas.width = bw;
    if (canvas.height !== bh) canvas.height = bh;
    const aspect = cssW / cssH;
    viewH = VIEW_H;
    viewW = VIEW_H * aspect;
    if (viewW < VIEW_W_MIN) {
      viewW = VIEW_W_MIN;
      viewH = viewW / aspect;
    } else if (viewW > VIEW_W_MAX) {
      viewW = VIEW_W_MAX;
      viewH = viewW / aspect;
    }
    camera.setView(viewW, viewH);
    renderer.resize(cssW, cssH, dpr);
    // The renderer re-bakes now: the next frames say nothing about the device.
    winT = 0;
    winN = 0;
    winSkip = 3;
    overlay?.resize(cssW, cssH, dpr);
    if (sim) {
      // Setting the size cleared the canvas: draw now, in this frame.
      if (!raf) camera.fit(sim.state);
      draw(performance.now());
    }
  }

  // ── Controls ─────────────────────────────────────────────────────────────
  function pause() {
    if (phase === 'playing') {
      stopLoop();
      if (songOn) audio.pause();
      clearQueue();
      simHeld = false;
      playedFor = (performance.now() - phaseAt) / 1000;
      setPhase('paused');
      // A waiting quality change: now, with the clock stopped (it redraws).
      if (qualityPending) flushQuality();
      else draw(performance.now());
      opts.onPhase('paused', runInfo());
    } else if (phase === 'dying') {
      // Paused during the shatter: the next attempt waits, set up and paused.
      stopLoop();
      beginAttempt(true);
    }
  }

  function resume() {
    if (phase !== 'paused' || disposed || hidden) return;
    seenVisible = true;
    clearQueue();
    simHeld = false;
    // The button that resumed (or one held through the pause) is not a jump.
    swallow = liveHeld;
    setPhase('playing');
    // phaseT counts this attempt's play: a pause doesn't start it again.
    phaseAt -= playedFor * 1000;
    opts.onPhase('playing', runInfo());
    if (phaseNow() === 'playing') startClock();
  }

  function restart() {
    if (mode !== 'level' || disposed) return;
    stopLoop();
    beginAttempt(false);
  }

  function start(lv: LevelDef, progress: LevelProgress, prac: boolean) {
    if (disposed) return;
    stopLoop();
    // An attempt left part-way on the level before counts there.
    abandon();
    mode = 'level';
    tBase = 0;
    attractDeadAt = 0;
    devHeld = null;
    devPressed = null;
    loadLevel(lv);
    bestNormal = progress.best;
    bestPractice = progress.practiceBest;
    practice = prac;
    // Attempts are the level's, over every visit: this
    // one is the next after those saved.
    attempt = progress.attempts;
    attemptOpen = false;
    checkpoints.length = 0;
    marks.length = 0;
    // The page may still be scrolling the game into view: until it has been
    // properly on screen, scrolling doesn't pause it. (The observer only
    // speaks when a threshold is crossed, so ask what it said last.)
    seenVisible = ratio >= 0.6;
    swallow = false;
    beginAttempt(false);
  }

  function enterAttract() {
    if (disposed) return;
    stopLoop();
    // Back to the menus part-way through an attempt: it counts.
    abandon();
    attemptOpen = false;
    if (songOn) audio.stop();
    songOn = false;
    audio.menu();
    mode = 'attract';
    practice = false;
    attempt = 0;
    attemptBest = 0;
    checkpoints.length = 0;
    marks.length = 0;
    devHeld = null;
    devPressed = null;
    if (!attract) attract = createAttract(createSim);
    attractRestart();
    // A quality change still waiting: behind the menus a long frame is harmless.
    flushQuality();
    clearQueue();
    simHeld = false;
    setPhase('attract');
    opts.onPhase('attract', null);
    syncLoop();
  }

  function setPractice(on: boolean) {
    if (mode !== 'level' || on === practice || disposed) return;
    // The attempt being left counts, in the mode it was played in.
    abandon();
    practice = on;
    checkpoints.length = 0;
    marks.length = 0;
    stopLoop();
    beginAttempt(false);
  }

  function placeCheckpoint() {
    if (!practice || phase !== 'playing' || !sim) return;
    const p = sim.state.player;
    if (p.dead || p.done) return;
    addCheckpoint(true);
    lastAuto = sim.state.t;
  }

  function removeCheckpoint() {
    if (!practice || mode !== 'level' || checkpoints.length === 0) return;
    checkpoints.pop();
    marks.pop();
    if (!raf) draw(performance.now());
  }

  // ── Events ───────────────────────────────────────────────────────────────
  const BUTTON_KEYS = new Set(['Space', 'ArrowUp', 'KeyW']);
  const GAME_KEYS = new Set([
    'KeyP',
    'Escape',
    'KeyM',
    'KeyR',
    'KeyC',
    'KeyZ',
    'KeyX',
    'KeyQ',
  ]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const code =
      BUTTON_KEYS.has(e.code) || e.key === ' ' ? e.code || 'Space' : '';
    if (code) {
      e.preventDefault(); // only on the focused canvas, only for its keys
      if (e.repeat || phase === 'attract') return;
      keysDown.add(code);
      buttonDown();
      return;
    }
    if (
      process.env.NODE_ENV !== 'production' &&
      e.code === 'Backquote' &&
      toggleOverlay
    ) {
      e.preventDefault();
      toggleOverlay();
      return;
    }
    if (!GAME_KEYS.has(e.code)) return;
    e.preventDefault();
    if (e.repeat) return;
    switch (e.code) {
      case 'KeyP':
      case 'Escape':
        if (opts.onKey) opts.onKey('pause');
        else if (phase === 'paused') {
          if (e.code === 'KeyP') resume();
        } else pause();
        break;
      case 'KeyM':
        if (opts.onKey) opts.onKey('sound');
        else audio.setOn(!audio.on);
        break;
      case 'KeyR':
        restart();
        break;
      case 'KeyC':
      case 'KeyZ':
        placeCheckpoint();
        break;
      case 'KeyX':
        removeCheckpoint();
        break;
      case 'KeyQ':
        opts.onKey?.('quit');
        break;
    }
  };
  // Heard on the window, not the canvas: a key that went down on the canvas
  // can come up after focus has moved to one of the game's own controls (a
  // pause moves it to Resume). Missed there, the key stayed held, and the
  // first press after resuming was swallowed. Only keys the canvas saw go
  // down are in keysDown, so a keyup anywhere else changes nothing.
  const onKeyUp = (e: KeyboardEvent) => {
    const code =
      BUTTON_KEYS.has(e.code) || e.key === ' ' ? e.code || 'Space' : '';
    if (code && keysDown.delete(code)) buttonUp();
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (phase === 'attract') return; // behind the menus the canvas is scenery
    pointersDown.add(e.pointerId);
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* not capturable: fine */
    }
    if (document.activeElement !== canvas)
      canvas.focus({ preventScroll: true });
    buttonDown();
  };
  const onPointerUp = (e: PointerEvent) => {
    if (pointersDown.delete(e.pointerId)) buttonUp();
  };
  const onContext = (e: Event) => e.preventDefault();
  const onBlur = (e: FocusEvent) => {
    const to = e.relatedTarget as Node | null;
    // Focus moving into the game's own controls (pause, sound…) is not leaving.
    if (to && canvas.parentElement?.contains(to)) return;
    releaseAll();
    pause();
  };
  const onVisibility = () => {
    hidden = document.hidden;
    if (hidden) {
      releaseAll();
      pause();
    }
    syncLoop();
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        onScreen = en.isIntersecting;
        ratio = en.intersectionRatio;
        if (ratio >= 0.6) seenVisible = true;
        // Pause once it has been on screen and then mostly scrolls away —
        // never while the page is still scrolling it into view.
        else if (ratio < 0.35 && seenVisible) pause();
      }
      syncLoop();
    },
    { threshold: [0, 0.35, 0.6, 1] }
  );
  const ro = new ResizeObserver(() => resize(false));

  canvas.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp, true);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('lostpointercapture', onPointerUp);
  canvas.addEventListener('contextmenu', onContext);
  canvas.addEventListener('blur', onBlur);
  document.addEventListener('visibilitychange', onVisibility);
  io.observe(canvas);
  ro.observe(canvas);
  resize(true);

  const engine: DashEngine = {
    start,
    attract: enterAttract,
    pause,
    resume,
    restart,
    setPractice,
    placeCheckpoint,
    removeCheckpoint,
    setSkin(s: KiruSkin) {
      skin = s;
      if (fr) fr.skin = s;
      if (!raf) draw(performance.now());
    },
    get phase() {
      return phase;
    },
    destroy() {
      if (disposed) return;
      // Leaving the page part-way through an attempt: it counts.
      abandon();
      disposed = true;
      stopLoop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp, true);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('lostpointercapture', onPointerUp);
      canvas.removeEventListener('contextmenu', onContext);
      canvas.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeAttribute('data-playing');
      if (songOn) audio.stop();
      songOn = false;
      renderer.destroy();
      overlay?.destroy();
      overlay = null;
      devDispose?.();
      devDispose = null;
    },
  };

  // Development only (stripped from production builds, and with it the
  // solver): window.__dash for browser tests, and the ` key's wireframe.
  if (process.env.NODE_ENV !== 'production') {
    toggleOverlay = () => {
      if (overlay) {
        overlay.destroy();
        overlay = null;
        if (!raf) draw(performance.now());
        return;
      }
      void import('./debug-render').then((m) => {
        if (disposed || overlay) return;
        const o = m.createDebugRenderer(canvas, {
          hudFont: opts.hudFont,
          reducedMotion: reduced,
          overlay: true,
        });
        o.resize(cssW, cssH, dpr);
        if (level) o.setLevel(level);
        overlay = o;
        if (!raf) draw(performance.now());
      });
    };
    const hooks: DashDevHooks = {
      engine,
      state: () => sim?.state ?? null,
      level: () => level,
      phase: () => phase,
      info: () => ({
        mode,
        attempt,
        practice,
        checkpoints: checkpoints.length,
        bestNormal,
        bestPractice,
        camX: fr?.camX ?? 0,
        camY: fr?.camY ?? 0,
        phaseT: fr?.phaseT ?? 0,
        px: fr?.px ?? 0,
        py: fr?.py ?? 0,
        frameT: fr?.t ?? 0,
        runout,
        outGrounded: outPlayer.grounded,
        outVy: outPlayer.vy,
        outRot: outPlayer.rot,
        viewW,
        viewH,
        cssW,
        cssH,
        dpr,
        quality,
        qualityPending,
        attemptOpen,
        cost,
        frames: devFrames,
        steps: devSteps,
        looping: raf !== 0,
        held: liveHeld,
        tBase,
      }),
      setInputs(pressed, held) {
        devPressed = pressed;
        devHeld = held;
        // A script plays from the level start; giving the button back
        // carries on from where he is.
        if (held && mode === 'level') {
          checkpoints.length = 0;
          marks.length = 0;
          restart();
        }
      },
    };
    void import('./dev').then((m) => {
      if (!disposed) devDispose = m.installDashDev(hooks);
    });
  }

  return engine;
}
