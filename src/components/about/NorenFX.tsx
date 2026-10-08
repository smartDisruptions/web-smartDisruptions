'use client';

import { useEffect, useRef, useState } from 'react';
import { NOREN, REST, panelLeft } from './noren';

/**
 * The noren's island. Renders nothing; it moves the server-rendered cloth
 * around it (Noren.tsx).
 *
 * Each panel is two springs: the upper piece swings about the rod, and the
 * piece below the seam bends on its own and lags behind it, which is what
 * makes the boxes read as cloth. Three things move them:
 *
 *  - a hand: the pointer (a hovering mouse, or a finger while it's down)
 *    parts the cloth around it, more the lower it is, and brushes the panels
 *    it crosses in the direction it's going;
 *  - a tap (or Enter / Space on the doorway): a push through. Kiru lets go
 *    and leans back, the middle panels swing shut, and a moment later he
 *    parts them again, wearing a different face;
 *  - a breeze, now and then, while nobody's touching it.
 *
 * While Kiru holds the middle two, they mostly stay put in his fists; let go,
 * they swing as freely as the rest.
 *
 * Costs: transforms only, written to eight elements, from one rAF loop that
 * runs only while the cloth is moving, and never while the doorway is off
 * screen or the tab is hidden. No React state. Under reduced motion there is
 * no loop at all: a tap swaps the still picture (Kiru hidden, then back).
 */

const N = NOREN.panels;
const CX = Array.from({ length: N }, (_, i) => panelLeft(i) + NOREN.pw / 2);
const LOW = NOREN.h - NOREN.seam;

// Springs (per second²) and damping (per second). Underdamped: cloth rings.
const KS = 52;
const CS = 3.1;
const KB = 78;
const CB = 4.4;
const LAG = 0.55; // the lower piece's inertia against the upper's swing
const MAX_S = 18;
const MAX_B = 24;

// The hand.
const SPREAD = 64; // cloth units: how wide a hand's push reaches
const PART_S = 8.5; // degrees at the hem, straight under the hand
const PART_B = 11;
const BRUSH = 0.026; // degrees per second of swing, per cloth unit per second
const HELD = 0.3; // what's left of a push on a panel Kiru is holding

export default function NorenFX() {
  const anchor = useRef<HTMLSpanElement>(null);
  // The motion preference, live: switching reduced motion on mid-visit tears
  // the moving cloth down and sets up the still picture (and back).
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduce(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduce === null) return;
    const found = anchor.current?.closest<HTMLElement>('.au-door');
    const hitEl = found?.querySelector<HTMLButtonElement>('.au-hit');
    const clothEl = found?.querySelector<HTMLElement>('.au-noren');
    if (!found || !hitEl || !clothEl) return;
    const door: HTMLElement = found;
    const hit: HTMLButtonElement = hitEl;
    const cloth: HTMLElement = clothEl;
    const uppers = [...door.querySelectorAll<HTMLElement>('.au-u')];
    const lowers = [...door.querySelectorAll<HTMLElement>('.au-d')];
    if (uppers.length !== N || lowers.length !== N) return;

    // The CSS arrival sway starts when the doorway is inserted: at the first
    // paint, or on a client navigation, about now.
    const mountedAt = performance.now();
    const cleanups: (() => void)[] = [];
    const on = <E extends Event>(
      t: EventTarget,
      type: string,
      fn: (e: E) => void,
      opts?: AddEventListenerOptions
    ) => {
      t.addEventListener(type, fn as EventListener, opts);
      cleanups.push(() =>
        t.removeEventListener(type, fn as EventListener, opts)
      );
    };

    // ── State ─────────────────────────────────────────────────────────────
    const s = new Float64Array(N); // upper swing, degrees
    const vs = new Float64Array(N);
    const b = new Float64Array(N); // lower bend, degrees
    const vb = new Float64Array(N);
    const restS = new Float64Array(N);
    const restB = new Float64Array(N);
    const handS = new Float64Array(N); // where the hand pushes the cloth
    const handB = new Float64Array(N);
    const shownS = new Float64Array(N); // last values written to the DOM
    const shownB = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      s[i] = restS[i] = shownS[i] = REST.peek[i][0];
      b[i] = restB[i] = shownB[i] = REST.peek[i][1];
    }

    let peeking = true;
    let mood = 0;
    let backTimer = 0;
    door.dataset.kiru = 'peek';
    door.dataset.mood = '0';
    const setRest = (rest: readonly (readonly [number, number])[]) => {
      for (let i = 0; i < N; i++) {
        restS[i] = rest[i][0];
        restB[i] = rest[i][1];
      }
    };
    const write = (i: number) => {
      uppers[i].style.transform = `skewX(${s[i].toFixed(3)}deg)`;
      lowers[i].style.transform = `skewX(${b[i].toFixed(3)}deg)`;
      shownS[i] = s[i];
      shownB[i] = b[i];
    };
    const held = (i: number) => (peeking && (i === 1 || i === 2) ? HELD : 1);
    for (let i = 0; i < N; i++) write(i);

    // ── Kiru: let go, then peek again ─────────────────────────────────────
    function duck() {
      peeking = false;
      door.dataset.kiru = 'duck';
      setRest(REST.duck);
      window.clearTimeout(backTimer);
      backTimer = window.setTimeout(peek, 1500 + Math.random() * 900);
    }
    function peek() {
      // A new face while he's out of sight.
      mood = (mood + 1) % 2;
      door.dataset.mood = String(mood);
      door.dataset.kiru = 'peek';
      peeking = true;
      setRest(REST.peek);
      if (reduce) {
        for (let i = 0; i < N; i++) {
          s[i] = restS[i];
          b[i] = restB[i];
          write(i);
        }
        return;
      }
      // He parts them from behind: the middle two kick outward.
      vs[1] -= 30;
      vs[2] += 30;
      wake();
    }
    cleanups.push(() => window.clearTimeout(backTimer));

    if (reduce) {
      // The still picture, swapped on a tap: the cloth closes over him, and
      // a moment later he's back, with the other face.
      on(hit, 'click', () => {
        if (!peeking) return;
        duck();
        for (let i = 0; i < N; i++) {
          s[i] = restS[i];
          b[i] = restB[i];
          write(i);
        }
      });
      return () => cleanups.forEach((c) => c());
    }

    // ── Visibility gates every frame ──────────────────────────────────────
    let visible = false;
    let raf = 0;
    let last = 0;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) {
        wake();
        if (!introDone) intro();
      }
    });
    io.observe(door);
    cleanups.push(() => io.disconnect());
    on(document, 'visibilitychange', () => wake());

    // ── The hand ──────────────────────────────────────────────────────────
    let rect: DOMRect | null = null;
    let handOn = false;
    let hx = 0;
    let hy = 0;
    let lastT = 0;
    let lastScroll = -1e9;
    let lastTouch = -1e9;
    const place = (e: PointerEvent) => {
      rect ??= cloth.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * NOREN.w,
        y: ((e.clientY - rect.top) / rect.height) * NOREN.h,
      };
    };
    /** Where the hand holds the cloth aside: a push away from it on both
        sides, strongest under it, more the lower it is. */
    const field = () => {
      const depth = Math.min(1.1, Math.max(0.12, hy / NOREN.h));
      const low = Math.min(1, Math.max(0, (hy - NOREN.seam) / LOW));
      for (let i = 0; i < N; i++) {
        const dx = CX[i] - hx;
        const w = Math.exp(-(dx * dx) / (2 * SPREAD * SPREAD)) * held(i);
        const dir = dx >= 0 ? 1 : -1;
        handS[i] = dir * w * PART_S * depth;
        handB[i] = dir * w * PART_B * low;
      }
    };
    const clearField = () => {
      handOn = false;
      handS.fill(0);
      handB.fill(0);
      wake();
    };
    const move = (e: PointerEvent) => {
      const p = place(e);
      const t = e.timeStamp;
      if (handOn && lastT) {
        // Brush: the cloth the hand crosses swings the way it's going.
        const dt = Math.max(0.008, (t - lastT) / 1000);
        const vx = Math.max(-2600, Math.min(2600, (p.x - hx) / dt));
        const low = 0.35 + 0.65 * Math.min(1, Math.max(0, p.y / NOREN.h));
        for (let i = 0; i < N; i++) {
          const dx = CX[i] - p.x;
          const w = Math.exp(-(dx * dx) / (2 * 46 * 46)) * held(i);
          vs[i] += vx * BRUSH * w * low;
          vb[i] += vx * BRUSH * 1.4 * w * low;
        }
      }
      hx = p.x;
      hy = p.y;
      lastT = t;
      handOn = true;
      lastTouch = performance.now();
      field();
      wake();
    };

    on(hit, 'pointerenter', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      rect = null;
      lastT = 0;
      move(e);
    });
    on(
      hit,
      'pointermove',
      (e: PointerEvent) => {
        if (e.pointerType === 'mouse' || handOn) move(e);
      },
      { passive: true }
    );
    on(hit, 'pointerdown', (e: PointerEvent) => {
      rect = null;
      lastT = 0;
      move(e);
    });
    on(hit, 'pointerleave', (e: PointerEvent) => {
      if (e.pointerType === 'mouse') clearField();
    });
    on(hit, 'pointerup', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') clearField();
    });
    on(hit, 'pointercancel', clearField);
    on(
      window,
      'scroll',
      () => {
        rect = null;
        lastScroll = performance.now();
      },
      { passive: true }
    );
    on(window, 'resize', () => (rect = null), { passive: true });

    // ── A tap: push through ───────────────────────────────────────────────
    on(hit, 'click', (e: MouseEvent) => {
      // Enter / Space arrive as a click with no pointer: push at the middle.
      let px = NOREN.w / 2;
      let py = NOREN.h * 0.85;
      if (e.detail > 0) {
        rect ??= cloth.getBoundingClientRect();
        px = ((e.clientX - rect.left) / rect.width) * NOREN.w;
        py = ((e.clientY - rect.top) / rect.height) * NOREN.h;
      }
      const low = 0.45 + 0.55 * Math.min(1, Math.max(0, py / NOREN.h));
      if (peeking) duck();
      else {
        // Already hiding: he waits a little longer before trying again.
        window.clearTimeout(backTimer);
        backTimer = window.setTimeout(peek, 1800 + Math.random() * 900);
      }
      for (let i = 0; i < N; i++) {
        const dx = CX[i] - px;
        const w = Math.exp(-(dx * dx) / (2 * 80 * 80));
        const dir = dx >= 0 ? 1 : -1;
        vs[i] += dir * w * 62 * low;
        vb[i] += dir * w * 84 * low;
      }
      lastTouch = performance.now();
      navigator.vibrate?.(8);
      wake();
    });

    // ── The breeze ────────────────────────────────────────────────────────
    // A gust crosses the panels in turn, now and then, only while nobody is
    // touching the cloth or scrolling past it.
    let introDone = false;
    let gustAt = -1; // when the current gust started (ms), or -1
    let gustDir = 1;
    let gustAmp = 1;
    let gustNext = mountedAt + 6000;
    const gusted = new Uint8Array(N);
    const gust = (dir: number, amp: number) => {
      gustAt = performance.now();
      gustDir = dir;
      gustAmp = amp;
      gusted.fill(0);
      wake();
    };
    function intro() {
      introDone = true;
      // The cloth's arrival sway is CSS (noren.css, from the first paint).
      // Once it has passed, Kiru takes a better grip: the middle two kick
      // open a little and settle.
      const t = window.setTimeout(
        () => {
          vs[1] -= 14;
          vs[2] += 14;
          gustNext = performance.now() + 5000;
          wake();
        },
        Math.max(400, mountedAt + 2500 - performance.now())
      );
      cleanups.push(() => window.clearTimeout(t));
    }
    const breeze = window.setInterval(() => {
      const now = performance.now();
      if (!visible || document.hidden || now < gustNext) return;
      if (now - lastTouch < 4000 || now - lastScroll < 1200) return;
      gustNext = now + 6500 + Math.random() * 6000;
      gust(Math.random() < 0.5 ? -1 : 1, 0.7 + Math.random() * 0.5);
    }, 1000);
    cleanups.push(() => window.clearInterval(breeze));

    // ── The loop: runs only while the cloth moves ─────────────────────────
    function wake() {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;

      if (gustAt >= 0) {
        let left = 0;
        for (let k = 0; k < N; k++) {
          const i = gustDir > 0 ? k : N - 1 - k;
          if (gusted[i]) continue;
          if (now - gustAt >= k * 120) {
            gusted[i] = 1;
            const g = gustAmp * held(i);
            vs[i] += gustDir * 15 * g;
            vb[i] += gustDir * 19 * g;
          } else left++;
        }
        if (!left) gustAt = -1;
      }

      // Fixed substeps keep stiff springs stable on a slow frame.
      const steps = Math.max(1, Math.ceil(dt * 120));
      const h = dt / steps;
      for (let k = 0; k < steps; k++) {
        for (let i = 0; i < N; i++) {
          const as = -KS * (s[i] - restS[i] - handS[i]) - CS * vs[i];
          vs[i] += as * h;
          s[i] += vs[i] * h;
          const ab = -KB * (b[i] - restB[i] - handB[i]) - CB * vb[i] - LAG * as;
          vb[i] += ab * h;
          b[i] += vb[i] * h;
          if (s[i] > MAX_S || s[i] < -MAX_S) {
            s[i] = Math.max(-MAX_S, Math.min(MAX_S, s[i]));
            vs[i] *= -0.3;
          }
          if (b[i] > MAX_B || b[i] < -MAX_B) {
            b[i] = Math.max(-MAX_B, Math.min(MAX_B, b[i]));
            vb[i] *= -0.3;
          }
        }
      }

      // A hand resting on the cloth doesn't keep the loop awake; its next move
      // wakes it.
      let moving = gustAt >= 0;
      for (let i = 0; i < N; i++) {
        const off =
          Math.abs(vs[i]) +
          Math.abs(vb[i]) +
          Math.abs(s[i] - restS[i] - handS[i]) +
          Math.abs(b[i] - restB[i] - handB[i]);
        if (off > 0.015) moving = true;
        if (
          Math.abs(s[i] - shownS[i]) > 0.004 ||
          Math.abs(b[i] - shownB[i]) > 0.004
        )
          write(i);
      }
      if (moving) raf = requestAnimationFrame(frame);
      else
        for (let i = 0; i < N; i++) {
          // Settled: land exactly on rest, then sleep.
          s[i] = restS[i] + handS[i];
          b[i] = restB[i] + handB[i];
          vs[i] = vb[i] = 0;
          write(i);
        }
    }

    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((c) => c());
    };
  }, [reduce]);

  return <span ref={anchor} hidden />;
}
