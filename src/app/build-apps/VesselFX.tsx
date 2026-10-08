'use client';

import { useEffect, useRef } from 'react';
import { CARD_SLOTS, CARD_START } from './vessel-model';

/**
 * The /build-apps phone's one script. Renders nothing: it attaches to the
 * server-rendered toy around it (Vessel.tsx) and owns three things.
 *
 *  - Turn it: drag (or the arrow keys) and the phone turns, carries a little
 *    inertia, then springs back to its resting angle. Taken apart, a sideways
 *    drag spins the stack like a turntable instead.
 *  - Take it apart: the slider lifts the layers off each other along Z and
 *    tips the phone back so they stack up the screen like floors; labels
 *    follow the layers they name.
 *  - Tap the app: a signal runs from the button down through the logic to
 *    the data and back up, slowed right down, and the screen updates. If the
 *    phone is closed it breathes open for the trip and shuts as the stamp
 *    lands.
 *
 * One rAF loop, awake only while something moves and the stage is on screen.
 * Every frame writes transforms (one per moving part, on that part alone) and
 * never React state; the per-tap changes are a few attributes. The gears are
 * Web Animations on their own elements, so the compositor turns them, and
 * only while the phone is open and visible. Under reduced motion it is a
 * still, labelled diagram: no turning, and a tap updates at once.
 */

type Pose = {
  rx: number;
  ry: number;
  rz: number;
  s: number;
  tx: number;
  ty: number;
};

// Closed: standing, turned a little to show its gold-lined edge.
const CLOSED: Pose = { rx: 14, ry: -26, rz: -3, s: 1, tx: 0, ty: 0 };
// Apart: lying back so the layers stack up the screen like floors. Where it
// sits (tx/ty, in phone widths) is fitted to the stage on every resize
// (fitApart); these are the starting guesses. The reduced-motion CSS pose in
// build-apps.css draws the same thing before this script runs: keep in step.
const APART: Pose = { rx: 60, ry: -2, rz: -14, s: 0.74, tx: -0.45, ty: 0.56 };

const PERSPECTIVE = 1100;
const DEG = Math.PI / 180;
/** How far apart the layers float, in phone widths, per layer. */
const GAP = 0.62;
/** Phone thickness and where each inner layer sits in it, in phone widths. */
const THICK = 0.08;

// The tap's trip, in ms at normal speed. p is the signal's depth: 0 the
// screen, 1 the logic, 2 the data.
const T_LEAVE = 140;
const T_LOGIC = 520;
const T_LOGIC_END = 820;
const T_DATA = 1080;
const T_DATA_END = 1260;
const T_HOME = 1680;
const T_END = 1820;
/** How far a closed phone opens for a trip. */
const BREATH = 0.86;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export default function VesselFX() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const toy = anchor.current?.closest<HTMLElement>('.ba-toy');
    if (!toy) return;
    const q = <T extends Element>(sel: string) => toy.querySelector<T>(sel)!;
    const qa = <T extends Element>(sel: string) =>
      Array.from(toy.querySelectorAll<T>(sel));

    const stage = q<HTMLElement>('.ba-stage');
    const scene = q<HTMLElement>('.ba-scene');
    const rotor = q<HTMLElement>('.ba-rotor');
    const screen = q<HTMLElement>('.ba-screen');
    const logic = q<HTMLElement>('.ba-logic');
    const data = q<HTMLElement>('.ba-data');
    const glass = q<HTMLElement>('.ba-glass');
    const thread = q<HTMLElement>('.ba-thread');
    const bead = q<HTMLElement>('.ba-bead');
    const labelBox = q<HTMLElement>('.ba-labels');
    const labels = qa<HTMLElement>('.ba-label');
    const leaderBox = q<HTMLElement>('.ba-leaders');
    const leaders = qa<HTMLElement>('.ba-leaders i');
    const btn = q<HTMLButtonElement>('.ba-btn');
    const range = q<HTMLInputElement>('.ba-range');
    const say = q<HTMLElement>('.ba-say');
    const live = q<HTMLElement>('#ba-live');
    const card = q<HTMLElement>('.ba-card');
    const slots = qa<HTMLElement>('.ba-slot');
    const nEl = q<HTMLElement>('.ba-n');
    const cEl = q<HTMLElement>('.ba-c');
    const togo = q<HTMLElement>('.ba-togo');
    const slipList = q<HTMLElement>('.ba-slips');
    const gearEls = qa<HTMLElement>('.ba-gear');

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const cleanups: (() => void)[] = [];
    const on = (
      t: EventTarget,
      type: string,
      fn: EventListener,
      opts?: AddEventListenerOptions | boolean
    ) => {
      t.addEventListener(type, fn, opts);
      cleanups.push(() => t.removeEventListener(type, fn, opts));
    };
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    // ── The app's own state ───────────────────────────────────────────────
    let stamps = CARD_START;
    let cardNo = 1;
    let checkins = CARD_START;

    // ── Geometry (measured, not per frame) ────────────────────────────────
    let W = 0;
    let H = 0;
    let SW = 0;
    let SH = 0;
    let cx = 0;
    let cy = 0;
    let ox = 0;
    let oy = 0;
    let bx = 0;
    let by = 0;
    let inset = 0;
    let labelW = 140;
    let apart: Pose = APART;
    const measure = () => {
      W = rotor.offsetWidth;
      H = rotor.offsetHeight;
      SW = stage.clientWidth;
      SH = stage.clientHeight;
      cx = rotor.offsetLeft + W / 2;
      cy = rotor.offsetTop + H / 2;
      ox = SW * 0.5;
      oy = SH * 0.42;
      bx = Math.round(
        screen.offsetLeft +
          glass.offsetLeft +
          btn.offsetLeft +
          btn.offsetWidth / 2
      );
      by = Math.round(
        screen.offsetTop +
          glass.offsetTop +
          btn.offsetTop +
          btn.offsetHeight / 2
      );
      inset = logic.offsetLeft;
      labelW = Math.max(...labels.map((l) => l.offsetWidth)) || 140;
      fitApart();
    };
    // Apart, the stack and its labels are placed as one picture, centred
    // across the stage and down it, at any size: project the stack's corners
    // and shift to fit (a few passes, since perspective bends the shift).
    const fitApart = () => {
      const base = APART;
      const zTop = (THICK + 3 * GAP) * W;
      let tx = base.tx * W;
      let ty = base.ty * W;
      for (let pass = 0; pass < 3; pass++) {
        setMatrix(base.rx, base.ry, base.rz, base.s, tx, ty);
        let x0 = Infinity;
        let x1 = -Infinity;
        let y0 = Infinity;
        let y1 = -Infinity;
        for (const z of [0, zTop]) {
          for (let c = 0; c < 4; c++) {
            project(c & 1 ? W / 2 : -W / 2, c & 2 ? H / 2 : -H / 2, z);
            x0 = Math.min(x0, out.x);
            x1 = Math.max(x1, out.x);
            y0 = Math.min(y0, out.y);
            y1 = Math.max(y1, out.y);
          }
        }
        const left = Math.max(6, (SW - (x1 - x0 + 18 + labelW)) / 2);
        tx += left - x0;
        ty += SH * 0.47 - (y0 + y1) / 2;
      }
      apart = { ...base, tx: tx / W, ty: ty / W };
    };

    // ── Motion state ──────────────────────────────────────────────────────
    let eT = reduce ? 1 : 0; // the slider's target
    let e = eT; // what's shown
    let eV = 0;
    let breath = 0; // opened by a tap's trip
    let breathFrom = 0;
    let breathTo = 0;
    let breathT0 = 0;
    let intro = 0; // the hint on arrival
    let introT0 = -1;
    let dragX = 0; // the reader's turn, in degrees, springing back to 0
    let dragY = 0;
    let dragXV = 0;
    let dragYV = 0;
    let dragging = false;
    let interacted = false;

    // The tap's trip.
    let tripT0 = -1;
    let tripSpeed = 1;
    let queued = 0;
    let tripStep = 0;
    let tripRule: 'add' | 'full' = 'add';
    let firstTrip = true;
    let thinkUntil = 0;

    // Anything the reader does ends the arrival hint, but from where it had
    // got to: the explode spring carries on from there, so nothing snaps.
    const takeOver = () => {
      interacted = true;
      if (introT0 < 0) return;
      e = Math.max(e, intro);
      introT0 = -1;
      intro = 0;
    };

    // ── Visibility gates every per-frame cost ─────────────────────────────
    let visible = false;
    let raf = 0;
    let last = 0;
    const gears: Animation[] = [];
    let gearRate = 0;
    const setGears = (rate: number) => {
      if (reduce || rate === gearRate) return;
      gearRate = rate;
      for (const g of gears) {
        if (rate === 0) g.pause();
        else {
          g.updatePlaybackRate(rate);
          if (g.playState !== 'running') g.play();
        }
      }
    };
    if (!reduce && typeof Element.prototype.animate === 'function') {
      // Meshed: the small gear has 9 teeth to the big one's 14, so it turns
      // 14/9 as fast, the other way.
      const [a, b] = gearEls;
      if (a && b) {
        gears.push(
          a.animate(
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
            {
              duration: 14000,
              iterations: Infinity,
            }
          ),
          b.animate(
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-360deg)' }],
            {
              duration: 9000,
              iterations: Infinity,
            }
          )
        );
        for (const g of gears) g.pause();
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      liveness();
    });
    io.observe(stage);
    cleanups.push(() => io.disconnect());
    on(document, 'visibilitychange', () => liveness());
    function liveness() {
      const lit = visible && !document.hidden;
      if (lit) stage.setAttribute('data-live', '');
      else stage.removeAttribute('data-live');
      if (!lit) {
        cancelAnimationFrame(raf);
        raf = 0;
        setGears(0);
      } else wake();
    }

    function wake() {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }

    // ── Writing: only what changed ─────────────────────────────────────────
    const lastWrite = new Map<HTMLElement, string>();
    const put = (el: HTMLElement, transform: string) => {
      if (lastWrite.get(el) === transform) return;
      lastWrite.set(el, transform);
      el.style.transform = transform;
    };
    const lastAlpha = new Map<HTMLElement, string>();
    const fade = (el: HTMLElement, a: number) => {
      const v = a < 0.01 ? '0' : a > 0.99 ? '1' : a.toFixed(2);
      if (lastAlpha.get(el) === v) return;
      lastAlpha.set(el, v);
      el.style.opacity = v;
    };

    // Projection, the same maths the browser does: the rotor's transform
    // (translate · rotateX · rotateY · rotateZ · scale about its centre), then
    // the scene's perspective. Reused buffers; nothing allocates per frame.
    const m = new Float64Array(9);
    let mtx = 0;
    let mty = 0;
    let ms = 1;
    const setMatrix = (
      rx: number,
      ry: number,
      rz: number,
      s: number,
      tx: number,
      ty: number
    ) => {
      const ca = Math.cos(rx * DEG);
      const sa = Math.sin(rx * DEG);
      const cb = Math.cos(ry * DEG);
      const sb = Math.sin(ry * DEG);
      const cc = Math.cos(rz * DEG);
      const sc = Math.sin(rz * DEG);
      m[0] = cb * cc;
      m[1] = -cb * sc;
      m[2] = sb;
      m[3] = ca * sc + sa * sb * cc;
      m[4] = ca * cc - sa * sb * sc;
      m[5] = -sa * cb;
      m[6] = sa * sc - ca * sb * cc;
      m[7] = sa * cc + ca * sb * sc;
      m[8] = ca * cb;
      mtx = tx;
      mty = ty;
      ms = s;
    };
    const out = { x: 0, y: 0 };
    const project = (x: number, y: number, z: number) => {
      const qx = ms * (m[0] * x + m[1] * y + m[2] * z) + mtx;
      const qy = ms * (m[3] * x + m[4] * y + m[5] * z) + mty;
      const qz = ms * (m[6] * x + m[7] * y + m[8] * z);
      const f = PERSPECTIVE / (PERSPECTIVE - qz);
      out.x = ox + (cx + qx - ox) * f;
      out.y = oy + (cy + qy - oy) * f;
    };
    const ax = [0, 0, 0, 0];
    const ay = [0, 0, 0, 0];
    const ly = [0, 0, 0, 0];

    // ── The frame ─────────────────────────────────────────────────────────
    function frame(now: number) {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let busy = false;

      // Explode: a critically damped spring toward the slider.
      if (reduce) {
        e = eT;
        eV = 0;
      } else {
        const acc = 140 * (eT - e) - 2 * Math.sqrt(140) * eV;
        eV += acc * dt;
        e += eV * dt;
        if (Math.abs(eT - e) < 0.0005 && Math.abs(eV) < 0.002) {
          e = eT;
          eV = 0;
        } else busy = true;
      }

      // The trip: its clock, its steps, and the breath that opens the phone.
      let p = -1; // the signal's depth, or -1 when there's no signal
      let beadA = 0;
      if (tripT0 >= 0) {
        const t = (now - tripT0) * tripSpeed;
        busy = true;
        if (tripStep < 2 && t >= T_LOGIC) step(2);
        if (tripStep < 3 && t >= T_DATA) step(3);
        if (tripStep < 4 && t >= T_HOME) step(4);
        if (t < T_LEAVE) p = 0;
        else if (t < T_LOGIC) p = ease((t - T_LEAVE) / (T_LOGIC - T_LEAVE));
        else if (t < T_LOGIC_END) p = 1;
        else if (t < T_DATA)
          p = 1 + ease((t - T_LOGIC_END) / (T_DATA - T_LOGIC_END));
        else if (t < T_DATA_END) p = 2;
        else if (t < T_HOME)
          p = 2 - 2 * ease((t - T_DATA_END) / (T_HOME - T_DATA_END));
        else p = 0;
        beadA =
          t < T_LEAVE
            ? t / T_LEAVE
            : t > T_HOME
              ? clamp(1 - (t - T_HOME) / (T_END - T_HOME), 0, 1)
              : 1;
        if (t >= T_END) endTrip();
      }
      // A fixed-length tween, not an endless approach: once it arrives it
      // holds exactly still, so for most of a trip the pose doesn't change
      // and only the signal is written.
      const breathT = tripT0 >= 0 || queued > 0 ? BREATH : 0;
      if (breathT !== breathTo) {
        breathFrom = breath;
        breathTo = breathT;
        breathT0 = now;
      }
      if (breath !== breathTo) {
        const dur = breathTo > breathFrom ? 380 : 560;
        const u = clamp((now - breathT0) / dur, 0, 1);
        breath = u >= 1 ? breathTo : lerp(breathFrom, breathTo, easeOut(u));
        busy = true;
      }

      // The hint on arrival: open a little, and close.
      if (introT0 >= 0) {
        const t = (now - introT0) / 1900;
        if (t >= 1) {
          intro = 0;
          introT0 = -1;
        } else {
          intro =
            0.55 * (t < 0.38 ? ease(t / 0.38) : 1 - ease((t - 0.38) / 0.62));
          busy = true;
        }
      }

      // Turn: follow the finger, or spring home with what it threw.
      if (!dragging && !reduce) {
        const k = 42;
        const c = 2 * 0.62 * Math.sqrt(k);
        dragXV += (-k * dragX - c * dragXV) * dt;
        dragYV += (-k * dragY - c * dragYV) * dt;
        dragX += dragXV * dt;
        dragY += dragYV * dt;
        if (
          Math.abs(dragX) < 0.02 &&
          Math.abs(dragXV) < 0.05 &&
          Math.abs(dragY) < 0.02 &&
          Math.abs(dragYV) < 0.05
        ) {
          dragX = dragY = dragXV = dragYV = 0;
        } else busy = true;
      } else if (dragging) busy = true;

      write(p, beadA);
      // The gears: a quick whirr while the logic decides, a slow turn while
      // the phone is open enough to see them, still otherwise.
      setGears(now < thinkUntil ? 7 : Math.max(e, breath, intro) > 0.3 ? 1 : 0);
      if (busy) raf = requestAnimationFrame(frame);
    }

    // Rounded for the style strings: a hundredth of a pixel or a degree is
    // finer than any screen shows.
    const r2 = (v: number) => Math.round(v * 100) / 100;
    // The pose last written. While it holds (a trip with the phone apart,
    // say) only the signal moves, and nothing else is recomputed.
    const pose = {
      open: -1,
      rx: 0,
      ry: 0,
      rz: 0,
      s: 1,
      tx: 0,
      ty: 0,
      zScreen: 0,
      zLogic: 0,
      zData: 0,
      dirty: true,
    };

    function write(p: number, beadA: number) {
      const open = Math.max(e, breath, intro);
      const k = smooth(clamp(open, 0, 1));
      const rx = r2(lerp(CLOSED.rx, apart.rx, k) + dragY);
      const ry = r2(lerp(CLOSED.ry, apart.ry, k) + dragX * (1 - k));
      const rz = r2(lerp(CLOSED.rz, apart.rz, k) + dragX * k);
      const sc = Math.round(lerp(CLOSED.s, apart.s, k) * 1000) / 1000;
      const tx = r2(lerp(CLOSED.tx, apart.tx, k) * W);
      const ty = r2(lerp(CLOSED.ty, apart.ty, k) * W);
      const moved =
        pose.dirty ||
        open !== pose.open ||
        rx !== pose.rx ||
        ry !== pose.ry ||
        rz !== pose.rz ||
        sc !== pose.s ||
        tx !== pose.tx ||
        ty !== pose.ty;

      if (moved) {
        pose.dirty = false;
        pose.open = open;
        pose.rx = rx;
        pose.ry = ry;
        pose.rz = rz;
        pose.s = sc;
        pose.tx = tx;
        pose.ty = ty;
        put(
          rotor,
          `translate3d(${tx}px,${ty}px,0) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale3d(${sc},${sc},${sc})`
        );
        // The layers, lifted along Z.
        const T = THICK * W;
        const g = GAP * W * open;
        pose.zData = r2(T * 0.3 + g);
        pose.zLogic = r2(T * 0.6 + g * 2);
        pose.zScreen = r2(T + g * 3);
        put(data, `translateZ(${pose.zData}px)`);
        put(logic, `translateZ(${pose.zLogic}px)`);
        put(screen, `translateZ(${pose.zScreen}px)`);
        labelsAt(open, rx, ry, rz, sc, tx, ty);
      }

      // The signal and its thread.
      if (p >= 0) {
        const { zScreen, zLogic, zData } = pose;
        const z =
          p <= 1 ? lerp(zScreen, zLogic, p) : lerp(zLogic, zData, p - 1);
        // Turned to face the eye, so it reads as a glow from any angle, and
        // lifted a little so it rests on a layer rather than cutting it.
        put(
          bead,
          `translate3d(${bx}px,${by}px,${r2(z + W * 0.06)}px) rotateZ(${-rz}deg) rotateY(${-ry}deg) rotateX(${-rx}deg)`
        );
        fade(bead, beadA);
        if (moved || lastWrite.get(thread) === undefined) {
          put(
            thread,
            `translate3d(${bx}px,${by}px,${zScreen}px) rotateX(-90deg) scaleY(${r2(Math.max(0.01, (zScreen - zData) / 100))})`
          );
        }
        fade(thread, beadA * clamp((open - 0.12) / 0.3, 0, 1) * 0.9);
      } else {
        fade(bead, 0);
        fade(thread, 0);
      }
    }

    // Labels beside the layers they name, in a tidy column on the right.
    function labelsAt(
      open: number,
      rx: number,
      ry: number,
      rz: number,
      sc: number,
      tx: number,
      ty: number
    ) {
      const alpha =
        clamp((open - 0.14) / 0.36, 0, 1) *
        clamp(1 - (Math.abs(dragX) - 30) / 30, 0, 1);
      fade(labelBox, alpha);
      fade(leaderBox, alpha);
      if (alpha <= 0) return;
      setMatrix(rx, ry, rz, sc, tx, ty);
      // Each layer's right edge, low down: the part of it that still shows
      // under the layer above when the phone is apart.
      const T = THICK * W;
      const yAnchor = H * 0.3;
      let col = 0;
      for (let i = 0; i < 4; i++) {
        const z =
          i === 0
            ? pose.zScreen
            : i === 1
              ? pose.zLogic
              : i === 2
                ? pose.zData
                : T * 0.5;
        project(i === 1 || i === 2 ? W / 2 - inset : W / 2, yAnchor, z);
        ax[i] = out.x;
        ay[i] = out.y;
        col = Math.max(col, out.x);
      }
      const lx = r2(clamp(col + 16, 0, SW - labelW - 2));
      const gap = SW >= 600 ? 46 : 38;
      for (let i = 0; i < 4; i++)
        ly[i] = i ? Math.max(ay[i], ly[i - 1] + gap) : ay[i];
      // Keep the column inside the stage.
      const over = ly[3] + 26 - SH;
      if (over > 0) for (let i = 0; i < 4; i++) ly[i] -= over;
      if (ly[0] < 10) {
        const d = 10 - ly[0];
        for (let i = 0; i < 4; i++) ly[i] += d;
      }
      for (let i = 0; i < 4; i++) {
        put(labels[i], `translate3d(${lx}px,${r2(ly[i] - 10)}px,0)`);
        const dx = lx - 3 - ax[i];
        const dy = ly[i] - ay[i];
        put(
          leaders[i],
          `translate3d(${r2(ax[i])}px,${r2(ay[i])}px,0) rotate(${Math.round(Math.atan2(dy, dx) * 1000) / 1000}rad) scaleX(${Math.round(Math.hypot(dx, dy) * 10) / 1000})`
        );
      }
    }

    // ── The trip's steps ──────────────────────────────────────────────────
    const sayLine = (html: string) => {
      const line = document.createElement('span');
      line.className = 'ba-say-line';
      if (!reduce) line.setAttribute('data-in', '');
      line.innerHTML = html;
      say.replaceChildren(line);
    };
    const mark = (k: string | null) => {
      for (const l of labels) {
        if (l.dataset.k === k) l.setAttribute('data-on', '');
        else l.removeAttribute('data-on');
      }
    };
    const fullNow = () => stamps >= CARD_SLOTS;

    function startTrip() {
      tripT0 = performance.now();
      tripStep = 1;
      tripRule = fullNow() ? 'full' : 'add';
      stage.setAttribute('data-tapped', '');
      sayLine('<span class="ba-step">1</span>The screen sends your tap down.');
      mark('screen');
      wake();
    }
    function step(n: number) {
      tripStep = n;
      if (n === 2) {
        logic.setAttribute('data-rule', tripRule);
        mark('logic');
        thinkUntil = performance.now() + 340 / tripSpeed;
        sayLine(
          tripRule === 'add'
            ? '<span class="ba-step">2</span>The logic decides: add a stamp.'
            : '<span class="ba-step">2</span>The logic decides: the card’s full, so start a new one.'
        );
      } else if (n === 3) {
        checkins++;
        addSlip(checkins);
        data.setAttribute('data-hit', '');
        mark('data');
        sayLine(
          `<span class="ba-step">3</span>The data remembers: check-in <b>${checkins}</b>.`
        );
      } else if (n === 4) {
        land();
        mark('screen');
        logic.removeAttribute('data-rule');
        data.removeAttribute('data-hit');
        sayLine(
          `<span class="ba-step">4</span>The screen shows it: <b>${
            tripRule === 'full'
              ? `a new card, 1 of ${CARD_SLOTS}`
              : fullNow()
                ? 'a full card'
                : `${stamps} of ${CARD_SLOTS}`
          }</b>.`
        );
        // The card takes the stamp: a small thunk (CSS, on the card alone;
        // nudging the whole phone kept every label moving for most of a run
        // of taps).
        card.animate?.(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(0.965)', offset: 0.3 },
            { transform: 'scale(1)' },
          ],
          { duration: 380, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' }
        );
        navigator.vibrate?.(12);
      }
    }
    function endTrip() {
      tripT0 = -1;
      tripStep = 0;
      mark(null);
      live.textContent = summary();
      if (queued > 0) {
        queued--;
        tripSpeed = 1.7;
        startTrip();
        return;
      }
      tripSpeed = 1;
      if (firstTrip) {
        firstTrip = false;
        later(() => {
          if (tripT0 < 0)
            sayLine(
              'A real app does all four steps in a blink. This one is slowed down.'
            );
        }, 2600);
      }
    }
    const summary = () =>
      `${tripRule === 'full' ? 'New card started.' : fullNow() ? 'Card full.' : 'Stamped.'} ${stamps} of ${CARD_SLOTS}. ` +
      `Your tap went from the screen to the logic, which decided to ${tripRule === 'full' ? 'start a new card' : 'add a stamp'}, ` +
      `to the data, which saved check-in ${checkins}, and back up to the screen.`;

    function land() {
      for (const s of slots) s.removeAttribute('data-new');
      if (tripRule === 'full') {
        cardNo++;
        stamps = 0;
        card.removeAttribute('data-full');
        for (const s of slots) s.removeAttribute('data-on');
        cEl.textContent = String(cardNo);
      }
      const slot = slots[stamps];
      stamps++;
      if (slot) {
        slot.setAttribute('data-on', '');
        if (!reduce) slot.setAttribute('data-new', '');
      }
      nEl.textContent = String(stamps);
      togo.textContent = fullNow() ? 'Full' : `${CARD_SLOTS - stamps} to go`;
      if (fullNow()) card.setAttribute('data-full', '');
    }

    function addSlip(n: number) {
      const items = Array.from(slipList.children) as HTMLElement[];
      items.forEach((li, i) => {
        li.style.setProperty('--i', String(i + 1));
        li.removeAttribute('data-new');
        if (i + 1 >= 4) {
          li.setAttribute('data-gone', '');
          later(() => li.remove(), reduce ? 0 : 450);
        }
      });
      const li = document.createElement('li');
      li.className = 'ba-slip';
      li.style.setProperty('--i', '0');
      if (!reduce) li.setAttribute('data-new', '');
      li.innerHTML = `<span class="ba-slip-dot"></span>Check-in <b>${n}</b>`;
      slipList.prepend(li);
    }

    // Reduced motion: the whole trip at once, said in one line.
    function instantTrip() {
      tripRule = fullNow() ? 'full' : 'add';
      checkins++;
      addSlip(checkins);
      land();
      logic.setAttribute('data-rule', tripRule);
      stage.setAttribute('data-tapped', '');
      sayLine(
        `Screen → logic (${tripRule === 'full' ? 'new card' : 'add a stamp'}) → data (check-in <b>${checkins}</b>) → screen (<b>${stamps} of ${CARD_SLOTS}</b>).`
      );
      live.textContent = summary();
    }

    on(btn, 'click', () => {
      takeOver();
      if (reduce) return instantTrip();
      btn.setAttribute('data-press', '');
      later(() => btn.removeAttribute('data-press'), 140);
      if (tripT0 >= 0) {
        if (queued < 3) queued++;
        return;
      }
      startTrip();
    });

    // ── Take it apart ─────────────────────────────────────────────────────
    const syncRange = () => {
      const v = Number(range.value);
      eT = v / 100;
      range.style.setProperty('--fill', `${v}%`);
      range.setAttribute(
        'aria-valuetext',
        v < 8
          ? 'Together'
          : v > 92
            ? 'Apart'
            : v < 50
              ? 'Coming apart'
              : 'Nearly apart'
      );
    };
    on(range, 'input', () => {
      takeOver();
      syncRange();
      wake();
    });
    if (reduce) range.value = '100';
    syncRange();

    // ── Turn it ───────────────────────────────────────────────────────────
    let pid = -1;
    let downX = 0;
    let downY = 0;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let velX = 0;
    let velY = 0;
    let swallowClick = false;
    const rubber = (v: number, lim: number) =>
      Math.abs(v) <= lim
        ? v
        : Math.sign(v) * (lim + (Math.abs(v) - lim) * 0.25);

    if (!reduce) {
      on(stage, 'pointerdown', ((ev: PointerEvent) => {
        if (ev.button > 0 || pid !== -1) return;
        pid = ev.pointerId;
        downX = lastX = ev.clientX;
        downY = lastY = ev.clientY;
        lastT = ev.timeStamp;
        startX = dragX;
        startY = dragY;
        velX = velY = 0;
      }) as EventListener);
      on(stage, 'pointermove', ((ev: PointerEvent) => {
        if (ev.pointerId !== pid) return;
        const dx = ev.clientX - downX;
        const dy = ev.clientY - downY;
        if (!dragging) {
          if (Math.hypot(dx, dy) < 7) return;
          // A finger that starts vertical is scrolling the page.
          if (ev.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx)) {
            pid = -1;
            return;
          }
          dragging = true;
          takeOver();
          if (ev.pointerType === 'mouse') stage.setAttribute('data-drag', '');
          try {
            stage.setPointerCapture(pid);
          } catch {}
          // Pick up from wherever the spring had it.
          startX = dragX - dx * 0.5;
          startY = dragY + dy * 0.3;
          dragXV = dragYV = 0;
        }
        // While the phone has the pointer, the move is the phone's alone.
        // Bubbling on, every move re-ran the site's gaze tracker (a forced
        // layout per move: ~4× this whole loop's cost, measured) and React's
        // root listener, for a ninja whose eyes are on the phone anyway.
        ev.stopPropagation();
        dragX = startX + dx * 0.5;
        dragY = rubber(startY - dy * 0.3, 32);
        const dtm = Math.max(1, ev.timeStamp - lastT);
        velX = velX * 0.6 + (((ev.clientX - lastX) * 0.5) / dtm) * 1000 * 0.4;
        velY = velY * 0.6 + ((-(ev.clientY - lastY) * 0.3) / dtm) * 1000 * 0.4;
        lastX = ev.clientX;
        lastY = ev.clientY;
        lastT = ev.timeStamp;
        wake();
      }) as EventListener);
      const release = (ev: Event) => {
        const pe = ev as PointerEvent;
        if (pe.pointerId !== pid) return;
        pid = -1;
        if (!dragging) return;
        dragging = false;
        stage.removeAttribute('data-drag');
        swallowClick = true;
        later(() => (swallowClick = false), 0);
        // A throw that stopped before letting go doesn't fly.
        const still = pe.timeStamp - lastT > 80;
        dragXV = still ? 0 : clamp(velX, -900, 900);
        dragYV = still ? 0 : clamp(velY, -400, 400);
        // Settle the short way round (only while closed or fully apart,
        // where a whole turn looks the same).
        const k = smooth(clamp(Math.max(e, breath), 0, 1));
        if (k < 0.02 || k > 0.98)
          dragX = ((((dragX + 180) % 360) + 360) % 360) - 180;
        wake();
      };
      on(stage, 'pointerup', release);
      on(stage, 'pointercancel', release);
      on(
        stage,
        'touchmove',
        (ev) => {
          if (dragging) ev.stopPropagation();
        },
        { passive: true }
      );
      // A drag that ends on the button isn't a press.
      on(
        stage,
        'click',
        (ev) => {
          if (swallowClick) {
            ev.stopPropagation();
            ev.preventDefault();
          }
        },
        true
      );
      on(stage, 'keydown', ((ev: KeyboardEvent) => {
        const k = ev.key;
        if (k === 'ArrowLeft' || k === 'ArrowRight')
          dragXV += k === 'ArrowLeft' ? -240 : 240;
        else if (k === 'ArrowUp' || k === 'ArrowDown')
          dragYV += k === 'ArrowUp' ? 150 : -150;
        else return;
        ev.preventDefault();
        takeOver();
        wake();
      }) as EventListener);
    }

    // ── The apps list: join, and the list card gets its stamp ─────────────
    // SubscribeForm stays a black box: its success line (role=status) is
    // the signal. Nothing else is read from it.
    const list = document.getElementById('ba-list');
    if (list) {
      const mo = new MutationObserver(() => {
        if (list.querySelector('[role="status"]')) {
          list.setAttribute('data-joined', '');
          mo.disconnect();
        }
      });
      mo.observe(list, { childList: true, subtree: true });
      cleanups.push(() => mo.disconnect());
    }

    // ── Size ──────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      measure();
      lastWrite.clear();
      pose.dirty = true;
      write(-1, 0);
      wake();
    });
    ro.observe(stage);
    cleanups.push(() => ro.disconnect());
    measure();
    write(-1, 0);

    // ── Arrival: once the phone has floated in, it breathes apart and back
    // together, so the first thing it teaches is that it comes apart.
    if (!reduce) {
      const begin = () => {
        if (interacted || !visible) return;
        introT0 = performance.now();
        dragXV = 70;
        wake();
      };
      const arrive = scene.getAnimations?.()[0];
      if (arrive && arrive.playState === 'running') {
        arrive.finished.then(() => later(begin, 120)).catch(() => {});
      } else later(begin, 300);
    }

    return () => {
      cancelAnimationFrame(raf);
      for (const id of timers) clearTimeout(id);
      for (const g of gears) g.cancel();
      cleanups.forEach((c) => c());
    };
  }, []);

  return <span ref={anchor} hidden />;
}
