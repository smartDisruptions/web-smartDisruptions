/**
 * Kiru's Rooftop Run: Dash — development hooks. Never in production: the
 * engine imports this file only inside `process.env.NODE_ENV !==
 * 'production'`, so the bundler drops it, and the solver it loads, from
 * production builds.
 *
 *   window.__dash.state()         the sim state, plus the engine's own numbers
 *   window.__dash.level()         the level being played
 *   window.__dash.phase()         the engine's phase
 *   window.__dash.autopilot(on)   plays the solver's winning inputs from the
 *                                 start, so a browser test can finish a level
 *   window.__dash.inputs(held)    plays a scripted button (held per step, from
 *                                 the start); null gives it back
 *   window.__dash.engine          the DashEngine itself
 *
 * createSilentAudio() is a DashAudio that plays nothing (and can log what it
 * was asked to do), for harnesses and tests.
 */
import type {
  DashAudio,
  DashEngine,
  DashPhase,
  Input,
  LevelDef,
  SimState,
} from './types';

/** What the engine hands this module. */
export interface DashDevHooks {
  engine: DashEngine;
  state(): SimState | null;
  level(): LevelDef | null;
  phase(): DashPhase;
  /** The engine's own numbers: attempt, camera, view, quality, frame counts… */
  info(): Record<string, unknown>;
  /**
   * Per-step inputs from the level start, indexed by SimState.frame: restarts
   * the attempt from the start, checkpoints cleared. null gives the button
   * back to the player, mid-run.
   */
  setInputs(pressed: Uint8Array | null, held: Uint8Array | null): void;
}

export interface DashDev {
  state(): Record<string, unknown> | null;
  level(): LevelDef | null;
  phase(): DashPhase;
  /** Resolves once the solver's inputs are playing (or the player has the button back). */
  autopilot(
    on?: boolean
  ): Promise<{ ok: boolean; steps: number; note?: string }>;
  /**
   * Plays a script from the level start: held per step, or one Input per
   * step. null gives the button back to the player.
   */
  inputs(script: ArrayLike<number | boolean> | readonly Input[] | null): void;
  engine: DashEngine;
}

type DevWindow = Window & { __dash?: DashDev };

/**
 * Per-step pressed/held arrays from a script: held per step (the solver's
 * witness, 0/1 or booleans), or one Input per step.
 */
export function scriptToInputs(
  script: ArrayLike<number | boolean> | readonly Input[]
): { pressed: Uint8Array; held: Uint8Array } {
  const n = script.length;
  const pressed = new Uint8Array(n);
  const held = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const s = script[i];
    if (typeof s === 'object' && s !== null) {
      pressed[i] = s.pressed ? 1 : 0;
      held[i] = s.held || s.pressed ? 1 : 0;
    } else {
      held[i] = s ? 1 : 0;
      // The sim also treats a rising edge of `held` as a press.
      pressed[i] = held[i] && (i === 0 || !script[i - 1]) ? 1 : 0;
    }
  }
  return { pressed, held };
}

export function installDashDev(h: DashDevHooks): () => void {
  const w = window as DevWindow;
  const api: DashDev = {
    engine: h.engine,
    state() {
      const st = h.state();
      if (!st) return null;
      let used = 0;
      for (let i = 0; i < st.used.length; i++) used += st.used[i];
      return {
        t: st.t,
        frame: st.frame,
        player: { ...st.player },
        speed: st.speed,
        bounds: { ...st.bounds },
        progress: st.progress,
        jumps: st.jumps,
        scrolls: [...st.scrolls],
        events: st.events.map((e) => ({ ...e })),
        used,
        phase: h.phase(),
        ...h.info(),
      };
    },
    level: () => h.level(),
    phase: () => h.phase(),
    inputs(script) {
      if (!script) {
        h.setInputs(null, null);
        return;
      }
      const ins = scriptToInputs(script);
      h.setInputs(ins.pressed, ins.held);
    },
    async autopilot(on = true) {
      if (!on) {
        h.setInputs(null, null);
        return { ok: true, steps: 0 };
      }
      const level = h.level();
      if (!level) return { ok: false, steps: 0, note: 'no level' };
      const { solve } = await import('./solver');
      const res = solve(level, { timeLimitMs: 20000 });
      if (!res.ok) {
        const at =
          res.deathX === undefined ? '' : ` at x ${res.deathX.toFixed(1)}`;
        return { ok: false, steps: 0, note: `${res.cause ?? 'no route'}${at}` };
      }
      const ins = scriptToInputs(res.inputs);
      h.setInputs(ins.pressed, ins.held);
      return {
        ok: true,
        steps: res.steps,
        note: `solved in ${Math.round(res.ms)} ms, clearance ${res.clearance.toFixed(2)}`,
      };
    },
  };
  w.__dash = api;
  return () => {
    if (w.__dash === api) delete w.__dash;
  };
}

/**
 * A DashAudio that plays nothing. Pass a `log` to see what the engine asked
 * of it (the newest last; it keeps the latest 4,000 lines).
 */
export function createSilentAudio(log?: string[]): DashAudio {
  let on = false;
  const note = (s: string) => {
    if (!log) return;
    log.push(s);
    if (log.length > 4000) log.splice(0, log.length - 4000);
  };
  return {
    get on() {
      return on;
    },
    setOn(v) {
      on = v;
      note(`setOn ${v}`);
    },
    play(level, from) {
      note(`play ${level} ${from.toFixed(3)}`);
    },
    stop() {
      note('stop');
    },
    pause() {
      note('pause');
    },
    resume(from) {
      note(`resume ${from.toFixed(3)}`);
    },
    menu() {
      note('menu');
    },
    sfx(id) {
      note(`sfx ${id}`);
    },
    destroy() {
      note('destroy');
    },
  };
}
