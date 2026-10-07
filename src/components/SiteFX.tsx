'use client';

import { useEffect } from 'react';

/**
 * The site's one global effects island. It owns three small jobs that would
 * otherwise each need their own listener:
 *
 *  1. Liveness — every <Kiru> (and every <Pip>, the guild mouse) idles only
 *     while on screen. An IntersectionObserver sets `data-live`, which is
 *     what their CSS loops (Kiru's headband included) run on, so a page full
 *     of ninjas costs nothing per frame.
 *  2. Gaze — visible ninjas and mice look at the pointer (or the last
 *     touch). One rAF-throttled listener writes --lx/--ly on each; CSS moves
 *     the pupils.
 *  3. Tilt — `.sd-tilt` cards lean toward a fine pointer, via --rx/--ry.
 *
 * Reduced motion turns 1 and 3 off and leaves the eyes looking ahead.
 *
 * Every ninja and mouse on screen also holds still while the page scrolls
 * (`data-hold`). Any running CSS loop costs Chrome a style pass on every
 * scrolling frame, even one the compositor draws, and inside an SVG a layout
 * too; a paused loop costs nothing. So the first scroll event of a gesture
 * pauses them (mid-pose: the loops are paused, never reset) and scrollend
 * lets them go. Measured on a phone at 4× CPU, it took scrolling /learn from
 * ~58fps to 60 and /market-storm from ~57 to ~58, with ~40% fewer slow frames.
 * The hold rules name each looping part (globals.css, pip.css): a `*` under
 * a `[data-hold]` anywhere would make every toggle restyle whole subtrees.
 *
 * It also backs up the inline theme script: when Next has to render a page
 * in the browser (its error shell), that script never runs, so the theme is
 * applied here instead of leaving a night reader on a day page.
 */
export default function SiteFX() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.theme) {
      let t: string | null = null;
      try {
        t = localStorage.getItem('theme');
      } catch {}
      if (t !== 'light' && t !== 'dark') t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.dataset.theme = t;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#090b16' : '#f4efe4');
      window.dispatchEvent(new Event('themechange'));
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const visible = new Set<SVGSVGElement>();

    // The scroll hold. A passive listener catches the first scroll event
    // (just the first, where scrollend exists, so nothing runs per scrolling
    // frame); scrollend, or a quiet spell where it's missing, lets them go.
    // A mouse that scrolls into or out of view mid-scroll could not move
    // anyway, so his liveness change waits for the release too: no Pip
    // restyles during a scroll at all. A ninja's doesn't wait: he goes live
    // 80px before he shows (already held, at his first keyframe), because
    // some poses' loops don't start at rest and going live on screen at
    // scrollend would make him jump.
    const pending = new Map<SVGSVGElement, boolean>();
    const hasScrollEnd = 'onscrollend' in window;
    let holding = false;
    let quiet = 0;
    let armed = false;
    const hold = (svg: SVGSVGElement, on: boolean) =>
      on ? svg.setAttribute('data-hold', '') : svg.removeAttribute('data-hold');
    const onScroll = () => {
      if (!holding) {
        holding = true;
        for (const svg of visible) hold(svg, true);
      }
      window.clearTimeout(quiet);
      quiet = window.setTimeout(release, hasScrollEnd ? 3000 : 160);
    };
    const listen = () => window.addEventListener('scroll', onScroll, { passive: true, once: hasScrollEnd });
    function release() {
      window.clearTimeout(quiet);
      if (holding) {
        holding = false;
        for (const svg of visible) hold(svg, false);
        for (const [svg, on] of pending) live(svg, on);
        pending.clear();
      }
      if (hasScrollEnd) listen();
    }

    function live(svg: SVGSVGElement, on: boolean) {
      if (on) {
        svg.setAttribute('data-live', '');
        visible.add(svg);
        if (holding) hold(svg, true);
      } else {
        svg.removeAttribute('data-live');
        visible.delete(svg);
        hold(svg, false);
      }
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const svg = e.target as SVGSVGElement;
          const on = e.isIntersecting && !reduce.matches && svg.dataset.kiru !== 'still' && svg.dataset.pip !== 'still';
          if (holding && svg.dataset.pip !== undefined) pending.set(svg, on);
          else live(svg, on);
        }
      },
      { rootMargin: '80px' },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<SVGSVGElement>('svg[data-kiru], svg[data-pip]').forEach((svg) => {
        if (seen.has(svg)) return;
        seen.add(svg);
        io.observe(svg);
        // The scroll hold is armed once a page shows anyone who can move.
        if (!armed && svg.dataset.kiru !== 'still' && svg.dataset.pip !== 'still') {
          armed = true;
          listen();
          if (hasScrollEnd) window.addEventListener('scrollend', release, { passive: true });
        }
      });
    };
    scan();
    // Client navigation swaps the page; catch the new ninjas.
    let scanQueued = false;
    const mo = new MutationObserver(() => {
      if (scanQueued) return;
      scanQueued = true;
      requestAnimationFrame(() => {
        scanQueued = false;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Where the gaze is written: the element that reads it. A ninja's pupils
    // are the only part of him that use --lx/--ly, and the custom properties
    // inherit, so writing them on his <svg> restyled all ~90 parts of him on
    // every touch and every mouse frame (~10ms a ninja at 4× CPU); on his
    // pupils it is one small group. A ninja with no pupils (eyes shut or
    // smiling) has nothing to aim. Pip reads it in two places, so his stays
    // on the <svg>.
    const gazeOf = new WeakMap<SVGSVGElement, SVGElement | null>();
    const gazeTarget = (svg: SVGSVGElement) => {
      let el = gazeOf.get(svg);
      if (el === undefined) {
        el = svg.dataset.pip !== undefined ? svg : svg.querySelector<SVGElement>('.k-pupils');
        gazeOf.set(svg, el);
      }
      return el;
    };

    let px = innerWidth / 2;
    let py = innerHeight / 3;
    let frame = 0;
    const look = () => {
      frame = 0;
      for (const svg of visible) {
        const eye = gazeTarget(svg);
        if (!eye) continue;
        const r = svg.getBoundingClientRect();
        // His eyes sit about 40% down the box (Pip says where, per pose).
        const ex = r.left + r.width / 2;
        const ey = r.top + r.height * (Number(svg.dataset.eye) || 0.4);
        const dx = px - ex;
        const dy = py - ey;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 260);
        const flip = svg.style.scale.startsWith('-1') ? -1 : 1;
        eye.style.setProperty('--lx', ((dx / d) * k * flip).toFixed(3));
        eye.style.setProperty('--ly', ((dy / d) * k).toFixed(3));
      }
    };
    const onPointer = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(look);

      if (finePointer.matches && !reduce.matches) {
        const card = (e.target as Element | null)?.closest?.<HTMLElement>('.sd-tilt');
        if (card) {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
          card.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
          card.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
          card.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
          card.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        }
      }
    };
    const onLeaveCard = (e: PointerEvent) => {
      // Only a fine pointer ever tilts a card (onPointer). Without this, every
      // touch that starts on a card rewrote its tilt on the way out, which
      // restyles the whole card.
      if (!finePointer.matches) return;
      const card = (e.target as Element | null)?.closest?.<HTMLElement>('.sd-tilt');
      if (card && !card.contains(e.relatedTarget as Node | null)) {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      }
    };

    // Offline + instant repeat visits (public/sw.js). Production only, and
    // after load, so it never competes with the first paint.
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register, { once: true });
    }

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    document.addEventListener('pointerout', onLeaveCard, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', release);
      window.clearTimeout(quiet);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('pointerout', onLeaveCard);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
