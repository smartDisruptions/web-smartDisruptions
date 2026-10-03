/**
 * The bakery: every theme's backdrop and sprites, baked when needed and
 * kept while they are useful.
 *
 * A level usually has one or two themes, but attract mode's endless strip
 * drifts through five, so baking every theme up front would cost tens of
 * megabytes and a long pause. Instead:
 *
 *  - the theme on screen is baked at once (need), if it isn't ready;
 *  - an upcoming theme is baked ahead of time in small jobs while the main
 *    thread is idle between frames (prefetch), so it is ready long before
 *    its crossfade begins and no frame pays for it;
 *  - at most three themes are kept; the one used longest ago goes first.
 *
 * A new canvas size or scale throws everything away (it would all be the
 * wrong size). A new level keeps the backdrops and tops up the sprites with
 * whatever the new level has that the old one didn't.
 */
import type { ThemeId } from '../types';
import { backdropStep, startBackdrop, type Backdrop } from './backdrop';
import {
  emptyNeeds,
  newCommonArt,
  newThemeArt,
  rebakeTexts,
  topUpCommon,
  topUpThemeArt,
  type CommonArt,
  type CommonNeeds,
  type LevelNeeds,
  type ThemeArt,
} from './sprites';
import { PALETTES } from './themes';

const MAX_THEMES = 3;

/** A theme that is ready to draw. */
export interface Baked {
  back: Backdrop;
  art: ThemeArt;
}

interface Entry {
  id: ThemeId;
  back: Backdrop | null;
  art: ThemeArt | null;
  /** The art has every sprite the current level needs. */
  fresh: boolean;
  used: number;
}

export class Bakery {
  private entries = new Map<ThemeId, Entry>();
  private queue: ThemeId[] = [];
  private W = 0;
  private H = 0;
  private ppu = 0;
  private needs: LevelNeeds = emptyNeeds();
  private cneeds: CommonNeeds = {
    gates: new Map(),
    speeds: new Map(),
    saws: new Set(),
  };
  private common: CommonArt | null = null;
  private tick = 0;
  /** The pending idle callback (> 0) or timeout (< 0, negated), or 0. */
  private idle = 0;

  constructor(
    private main: CanvasRenderingContext2D,
    private font: string
  ) {}

  /** The canvas size and the pixels per block everything is baked at. */
  setScale(W: number, H: number, ppu: number) {
    if (W === this.W && H === this.H && ppu === this.ppu) return;
    this.W = W;
    this.H = H;
    this.ppu = ppu;
    this.entries.clear();
    this.queue.length = 0;
    this.common = null;
  }

  /** A new level: what its objects need. */
  setNeeds(needs: LevelNeeds, cneeds: CommonNeeds) {
    this.needs = needs;
    this.cneeds = cneeds;
    for (const e of this.entries.values()) e.fresh = false;
    if (this.common) topUpCommon(this.common, cneeds);
  }

  commonArt(): CommonArt {
    if (!this.common) {
      this.common = newCommonArt(this.ppu);
      topUpCommon(this.common, this.cneeds);
    }
    return this.common;
  }

  /**
   * Bake a theme's jobs until it is complete (true) or `until` (a
   * performance.now() time) has passed (false). At least one job runs.
   */
  private step(e: Entry, until = Infinity): boolean {
    const p = PALETTES[e.id];
    if (!e.back) e.back = startBackdrop(this.main, p, this.W, this.H, this.ppu);
    while (!e.back.ready) {
      backdropStep(e.back);
      if (performance.now() > until) return false;
    }
    if (!e.art) e.art = newThemeArt(p, this.ppu);
    if (!e.fresh) e.fresh = topUpThemeArt(e.art, this.needs, this.font, until);
    return e.fresh;
  }

  private entry(id: ThemeId, keep: readonly ThemeId[]): Entry {
    let e = this.entries.get(id);
    if (!e) {
      if (this.entries.size >= MAX_THEMES) this.evict(keep);
      e = { id, back: null, art: null, fresh: false, used: this.tick };
      this.entries.set(id, e);
    }
    return e;
  }

  private evict(keep: readonly ThemeId[]) {
    let worst: Entry | null = null;
    for (const e of this.entries.values()) {
      if (keep.includes(e.id)) continue;
      if (!worst || e.used < worst.used) worst = e;
    }
    if (worst) {
      this.entries.delete(worst.id);
      const q = this.queue.indexOf(worst.id);
      if (q >= 0) this.queue.splice(q, 1);
    }
  }

  /** A theme on screen: finish baking it now if it isn't ready. */
  need(id: ThemeId, keep: readonly ThemeId[]): Baked {
    const e = this.entry(id, keep);
    e.used = ++this.tick;
    while (!this.step(e)) {
      /* keep baking */
    }
    // Complete now: back and art are both set (no new object per frame).
    return e as Baked;
  }

  /** A theme coming up: bake it in the gaps between frames from now on. */
  prefetch(id: ThemeId, keep: readonly ThemeId[]) {
    const e = this.entries.get(id);
    if (e && e.back?.ready && e.art && e.fresh) return;
    if (!e) this.entry(id, keep);
    if (!this.queue.includes(id)) this.queue.push(id);
    this.schedule();
  }

  /**
   * Bake queued themes while the main thread is idle, never inside a frame:
   * a frame stays the same cost while the next theme bakes, even on a slow
   * phone. Without requestIdleCallback (Safari), a timeout after the frame.
   * If a theme is needed before it is done, need() finishes it at once.
   */
  private schedule() {
    if (this.idle || !this.queue.length) return;
    const run = (deadline?: IdleDeadline) => {
      this.idle = 0;
      const budget = deadline ? Math.max(2, deadline.timeRemaining() - 1) : 3;
      const until = performance.now() + budget;
      while (this.queue.length) {
        const e = this.entries.get(this.queue[0]);
        if (!e) {
          this.queue.shift();
          continue;
        }
        if (this.step(e, until)) this.queue.shift();
        if (performance.now() > until) break;
      }
      this.schedule();
    };
    this.idle =
      typeof requestIdleCallback === 'function'
        ? requestIdleCallback(run, { timeout: 300 })
        : -(setTimeout(run, 20) as unknown as number);
  }

  private cancel() {
    if (this.idle > 0) cancelIdleCallback(this.idle);
    else if (this.idle < 0) clearTimeout(-this.idle);
    this.idle = 0;
  }

  /** The display face arrived after the signs were baked. */
  refreshTexts() {
    for (const e of this.entries.values())
      if (e.art) rebakeTexts(e.art, this.font);
  }

  clear() {
    this.cancel();
    this.entries.clear();
    this.queue.length = 0;
    this.common = null;
    this.W = 0;
  }
}
