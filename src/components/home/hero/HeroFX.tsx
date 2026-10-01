'use client';

import { useEffect, useRef } from 'react';

/**
 * The hero's interactive layer. Renders nothing itself — it attaches to the
 * server-rendered scene around it:
 *
 *  - Parallax: pointer position (or phone tilt on Android) → --px/--py on the
 *    section, eased toward the target; layers translate by them in CSS.
 *  - Sakura: a canvas of petals that tumble on the wind and scatter away from
 *    the pointer. Starts after the page is idle, renders at a capped pixel
 *    ratio, and stops whenever the hero is off screen or the tab is hidden.
 *  - Shuriken: tap or click the sky and Kiru throws one there. Hit the moon
 *    (or the sun) and it rings.
 *
 * Under prefers-reduced-motion none of this runs; the scene is a still print.
 */

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  phase: number;
  spin: number;
  tone: number;
};

const SPRITE = 40;

function makeSprites(night: boolean): HTMLCanvasElement[] {
  const tones = night ? ['#e3b0c9', '#c995b4'] : ['#f7a9bc', '#ffc9d5'];
  return tones.map((fill) => {
    const c = document.createElement('canvas');
    c.width = c.height = SPRITE;
    const g = c.getContext('2d')!;
    g.translate(SPRITE / 2, SPRITE / 2);
    // A sakura petal: a teardrop with the notch at its wide end.
    g.beginPath();
    g.moveTo(0, 15);
    g.bezierCurveTo(-13, 6, -11, -12, -3, -14);
    g.lineTo(0, -10);
    g.lineTo(3, -14);
    g.bezierCurveTo(11, -12, 13, 6, 0, 15);
    g.closePath();
    const grad = g.createLinearGradient(0, -14, 0, 15);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, night ? '#f6d8e6' : '#fff1f4');
    g.fillStyle = grad;
    g.globalAlpha = night ? 0.8 : 0.92;
    g.fill();
    return c;
  });
}

export default function HeroFX() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const found = anchor.current?.closest<HTMLElement>('.hx');
    if (!found) return;
    const hero: HTMLElement = found;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) {
      hero.dataset.pose = 'idle';
      return;
    }

    let disposed = false;
    const cleanups: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(
      t: EventTarget,
      type: K | string,
      fn: (e: never) => void,
      opts?: AddEventListenerOptions,
    ) => {
      t.addEventListener(type, fn as EventListener, opts);
      cleanups.push(() => t.removeEventListener(type, fn as EventListener, opts));
    };

    // ── Intro: Kiru waves, then settles into his watch ────────────────────
    const settle = window.setTimeout(() => {
      if (hero.dataset.pose === 'wave') hero.dataset.pose = 'idle';
    }, 3600);
    cleanups.push(() => clearTimeout(settle));

    // ── Visibility gates every per-frame cost ─────────────────────────────
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      wake();
    });
    io.observe(hero);
    cleanups.push(() => io.disconnect());
    on(document, 'visibilitychange', () => wake());

    // ── Parallax ──────────────────────────────────────────────────────────
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let parallaxLive = false;
    const setTarget = (x: number, y: number) => {
      tx = Math.max(-1, Math.min(1, x));
      ty = Math.max(-1, Math.min(1, y));
      parallaxLive = true;
      wake();
    };
    on(window, 'pointermove', (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      setTarget((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    }, { passive: true });
    // Phone tilt — Android grants it freely; iOS needs a permission prompt we
    // won't spring on anyone, so iOS gets the scroll depth only.
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: unknown } | undefined;
    if (DOE && typeof DOE.requestPermission !== 'function') {
      on(window, 'deviceorientation', (e: DeviceOrientationEvent) => {
        if (e.gamma == null || e.beta == null) return;
        setTarget(e.gamma / 25, (e.beta - 45) / 30);
      }, { passive: true });
    }

    // ── Petals ────────────────────────────────────────────────────────────
    const canvas = hero.querySelector<HTMLCanvasElement>('.hx-petals')!;
    const ctx = canvas.getContext('2d', { alpha: true });
    let sprites: HTMLCanvasElement[] = [];
    const petals: Petal[] = [];
    let W = 0;
    let H = 0;
    let dpr = 1;
    let petalsReady = false;
    let pointerX = -9999;
    let pointerY = -9999;
    const coarse = window.matchMedia('(pointer: coarse)').matches;

    const spawn = (p: Partial<Petal> = {}, anywhere = false): Petal => ({
      x: anywhere ? Math.random() * W : -40 + Math.random() * W * 0.9,
      y: anywhere ? Math.random() * H : -30 - Math.random() * 60,
      vx: 20 + Math.random() * 30,
      vy: 26 + Math.random() * 34,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 2.4,
      size: (coarse ? 0.36 : 0.42) + Math.random() * 0.34,
      phase: Math.random() * Math.PI * 2,
      spin: 1.2 + Math.random() * 2.4,
      tone: Math.random() < 0.5 ? 0 : 1,
      ...p,
    });

    const resize = () => {
      const r = hero.getBoundingClientRect();
      W = r.width;
      H = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      const target = Math.max(28, Math.min(80, Math.round((W * H) / 17000)));
      while (petals.length < target) petals.push(spawn({}, true));
      petals.length = target;
    };
    const themeSprites = () => {
      sprites = makeSprites(document.documentElement.getAttribute('data-theme') === 'dark');
    };

    const startPetals = () => {
      if (disposed || !ctx || petalsReady) return;
      themeSprites();
      resize();
      petalsReady = true;
      hero.dataset.swirl = '';
      wake();
    };
    // Desktop only, and only once someone actually moves the mouse: until then
    // the CSS petals carry the scene and no frame runs any script.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const first = () => startPetals();
      window.addEventListener('pointermove', first, { once: true, passive: true });
      cleanups.push(() => window.removeEventListener('pointermove', first));
    }

    let resizeQueued = 0;
    on(window, 'resize', () => {
      cancelAnimationFrame(resizeQueued);
      resizeQueued = requestAnimationFrame(() => petalsReady && resize());
    });
    on(window, 'themechange', () => {
      if (petalsReady) themeSprites();
      hero.classList.remove('hx-rising');
      void hero.offsetWidth;
      hero.classList.add('hx-rising');
    });

    // Pointer position relative to the hero, for the petals to flee from.
    on(hero, 'pointermove', (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      pointerX = e.clientX - r.left;
      pointerY = e.clientY - r.top;
    }, { passive: true });
    on(hero, 'pointerleave', () => {
      pointerX = pointerY = -9999;
    });

    // ── The loop: runs only while something needs a frame ─────────────────
    let raf = 0;
    let last = 0;
    let t = 0;
    function wake() {
      if (!raf && visible && !document.hidden && (petalsReady || parallaxLive)) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    function frame(now: number) {
      raf = 0;
      if (disposed || !visible || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;

      if (parallaxLive) {
        cx += (tx - cx) * Math.min(1, dt * 5);
        cy += (ty - cy) * Math.min(1, dt * 5);
        hero.style.setProperty('--px', cx.toFixed(4));
        hero.style.setProperty('--py', cy.toFixed(4));
        if (Math.abs(tx - cx) < 0.001 && Math.abs(ty - cy) < 0.001) parallaxLive = false;
      }

      if (petalsReady && ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const gust = 14 * Math.sin(t * 0.35) + 8 * Math.sin(t * 1.3);
        for (const p of petals) {
          const dx = p.x - pointerX;
          const dy = p.y - pointerY;
          const d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / 150) * 900;
            p.vx += (dx / d) * f * dt;
            p.vy += (dy / d) * f * dt;
            p.vr += (Math.random() - 0.5) * 6 * dt;
          }
          // Drag back toward the drift, so a scattered petal settles again.
          p.vx += ((26 + gust) - p.vx) * 0.9 * dt;
          p.vy += (38 - p.vy) * 0.9 * dt;
          p.x += (p.vx + Math.sin(p.phase + t * p.spin) * 18) * dt;
          p.y += p.vy * dt;
          p.rot += p.vr * dt;
          if (p.y > H + 30 || p.x > W + 40 || p.x < -80 || p.y < -200) Object.assign(p, spawn());
          const flip = Math.cos(p.phase + t * p.spin * 0.8);
          const s = p.size * dpr;
          const c = Math.cos(p.rot);
          const sn = Math.sin(p.rot);
          ctx.setTransform(c * s * flip, sn * s * flip, -sn * s, c * s, p.x * dpr, p.y * dpr);
          ctx.drawImage(sprites[p.tone], -SPRITE / 2, -SPRITE / 2);
        }
      }

      if (petalsReady || parallaxLive) raf = requestAnimationFrame(frame);
    }

    // ── Shuriken ──────────────────────────────────────────────────────────
    const kiruBox = hero.querySelector<HTMLElement>('.hx-leap');
    const orb = hero.querySelector<HTMLElement>('.hx-orb-disc');
    let flying = 0;
    let poseTimer = 0;
    let down: { x: number; y: number; t: number } | null = null;

    on(hero, 'pointerdown', (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    }, { passive: true });
    on(hero, 'pointerup', (e: PointerEvent) => {
      const d = down;
      down = null;
      if (!d || e.button > 0) return;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.t > 450) return;
      const target = e.target as Element;
      if (target.closest('a, button, input, h1, p, kbd')) return;
      throwAt(e.clientX, e.clientY);
    });

    function throwAt(clientX: number, clientY: number) {
      if (!kiruBox || flying > 7) return;
      // Kiru's box is square and his poses are 240 units tall, left-aligned;
      // the 'throw' pose's hand sits at (175, 136) in those units.
      const kb = kiruBox.getBoundingClientRect();
      const u = kb.height / 240;
      const hr = hero.getBoundingClientRect();
      const x0 = kb.left + 175 * u - hr.left;
      const y0 = kb.top + 136 * u - hr.top;
      const x1 = clientX - hr.left;
      const y1 = clientY - hr.top;

      hero.dataset.pose = 'throw';
      clearTimeout(poseTimer);
      poseTimer = window.setTimeout(() => (hero.dataset.pose = 'idle'), 650);
      navigator.vibrate?.(10);

      const star = document.createElement('div');
      star.className = 'hx-shuriken';
      star.innerHTML =
        '<svg viewBox="-16 -16 32 32" aria-hidden="true"><path d="M0-15L3.6-3.6 15 0 3.6 3.6 0 15-3.6 3.6-15 0-3.6-3.6Z"/><circle r="2.6"/></svg>';
      hero.appendChild(star);
      flying++;

      const dist = Math.hypot(x1 - x0, y1 - y0);
      const dur = Math.max(240, Math.min(700, dist * 0.9));
      const lift = Math.min(90, dist * 0.18);
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2 - lift;
      const fly = star.animate(
        [
          { transform: `translate(${x0}px, ${y0}px) rotate(0deg) scale(.6)` },
          { transform: `translate(${mx}px, ${my}px) rotate(540deg) scale(1)`, offset: 0.5 },
          { transform: `translate(${x1}px, ${y1}px) rotate(1080deg) scale(1)` },
        ],
        { duration: dur, easing: 'cubic-bezier(.25,.6,.35,1)', fill: 'forwards' },
      );
      fly.onfinish = () => {
        star.classList.add('is-stuck');
        sparks(x1, y1);
        if (orb) {
          const o = orb.getBoundingClientRect();
          const ox = o.left + o.width / 2 - hr.left;
          const oy = o.top + o.height / 2 - hr.top;
          if (Math.hypot(x1 - ox, y1 - oy) < o.width / 2) {
            hero.classList.remove('hx-ding');
            void hero.offsetWidth;
            hero.classList.add('hx-ding');
            if (petalsReady) {
              for (let i = 0; i < 26; i++) {
                const a = Math.random() * Math.PI * 2;
                const v = 120 + Math.random() * 260;
                petals.push(spawn({ x: x1, y: y1, vx: Math.cos(a) * v, vy: Math.sin(a) * v }));
              }
              window.setTimeout(() => (petals.length = Math.max(28, petals.length - 26)), 4000);
            } else {
              burst(x1, y1);
            }
          }
        }
        star
          .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, delay: 1100, fill: 'forwards' })
          .finished.then(() => {
            star.remove();
            flying--;
          })
          .catch(() => {});
      };
    }

    // A petal burst made of DOM nodes animated with WAAPI transforms — for
    // touch devices, where the canvas never runs.
    function burst(x: number, y: number) {
      for (let i = 0; i < 16; i++) {
        const p = document.createElement('i');
        p.className = 'hx-burst';
        hero.appendChild(p);
        const a = Math.random() * Math.PI * 2;
        const r = 50 + Math.random() * 110;
        const dx = Math.cos(a) * r;
        const dy = Math.sin(a) * r;
        p.animate(
          [
            { transform: `translate(${x}px, ${y}px) rotate(0deg) scale(.4)`, opacity: 1 },
            { transform: `translate(${x + dx}px, ${y + dy}px) rotate(${180 + Math.random() * 180}deg) scale(1)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${x + dx * 1.2}px, ${y + dy + 140}px) rotate(${400 + Math.random() * 200}deg) scale(.8)`, opacity: 0 },
          ],
          { duration: 1600 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
        ).onfinish = () => p.remove();
      }
    }

    function sparks(x: number, y: number) {
      for (let i = 0; i < 7; i++) {
        const s = document.createElement('span');
        s.className = 'hx-spark';
        hero.appendChild(s);
        const a = (i / 7) * Math.PI * 2 + Math.random() * 0.5;
        const r = 18 + Math.random() * 22;
        s.animate(
          [
            { transform: `translate(${x}px, ${y}px) rotate(${a}rad) scaleX(.2)`, opacity: 1 },
            {
              transform: `translate(${x + Math.cos(a) * r}px, ${y + Math.sin(a) * r}px) rotate(${a}rad) scaleX(1)`,
              opacity: 0,
            },
          ],
          { duration: 420, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' },
        ).onfinish = () => s.remove();
      }
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(poseTimer);
      cleanups.forEach((c) => c());
    };
  }, []);

  return <span ref={anchor} hidden />;
}
