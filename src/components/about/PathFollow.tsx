'use client';

import { useEffect } from 'react';

/**
 * Keeps Kiru on the path where the CSS run (ThePath.tsx) cannot happen.
 *
 * The run itself is pure CSS: a scroll timeline moves him along an
 * offset-path. Two kinds of reader never see it, and on a desktop both are
 * common:
 *
 *  - Reduced motion. Windows turns it on with "Animation effects" off, and
 *    the site honours it, so he must not run. He sits with the year being
 *    read instead, and when the reader moves on he reappears at the next
 *    one: a fade in place, never a slide.
 *  - Browsers without scroll timelines or offset-path: shape(). He runs as the
 *    CSS would, from a passive scroll listener, on the same curve (the rail's
 *    own SVG path) and the same eye line, 60% down the screen.
 *
 * Where the CSS can run him, this does nothing at all.
 */
export default function PathFollow() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.ab-path');
    const walker = root?.querySelector<HTMLElement>('.ab-walker');
    const turn = root?.querySelector<HTMLElement>('.ab-turn');
    if (!root || !walker || !turn) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cssRuns =
      CSS.supports('animation-timeline: view()') &&
      CSS.supports('offset-path: shape(from 0px 0px, line to 1px 1px)');
    const hint = document.querySelector<HTMLElement>('.ab-hint');
    const strokes = root.querySelectorAll<SVGPathElement>(
      '.ab-stroke, .ab-bleed'
    );

    let mode: 'css' | 'run' | 'still' = 'css';
    let raf = 0;
    let active = -1; // still: the milestone Kiru sits with

    /** The rail drawn at this width (CSS shows one of three). */
    const rail = () =>
      [...root.querySelectorAll<SVGSVGElement>('.ab-ink')].find(
        (svg) => svg.getClientRects().length > 0
      );

    /**
     * The path at a fraction of its length, in px inside the rail. The legs
     * all climb at one slope (route.ts), so a fraction of the length is the
     * same fraction of the height — the property the CSS run relies on too.
     */
    function pointAt(svg: SVGSVGElement, f: number) {
      const path = svg.querySelector<SVGPathElement>('.ab-ghost')!;
      const box = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      const len = path.getTotalLength();
      const at = path.getPointAtLength(Math.min(len, Math.max(0, f * len)));
      const ahead = path.getPointAtLength(Math.min(len, f * len + 2));
      return {
        x: (at.x * box.width) / vb.width,
        y: (at.y * box.height) / vb.height,
        dx: ahead.x - at.x,
      };
    }

    function run(svg: SVGSVGElement) {
      // The CSS range, `entry 40% exit 40%`: 0 when the top of the path is
      // 60% down the screen, 1 when its bottom is.
      const r = root!.getBoundingClientRect();
      const p = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height)
      );
      const { x, y, dx } = pointAt(svg, p * 0.9996);
      walker!.style.translate = `${x}px ${y}px`;
      // The run pose faces left; heading right, he turns around.
      if (dx > 0.3) turn!.style.rotate = 'y 180deg';
      else if (dx < -0.3) turn!.style.rotate = 'y 0deg';
      root!.dataset.pose = p > 0.01 && p < 0.99 ? 'run' : 'sit';
      for (const s of strokes) s.style.strokeDashoffset = String(1 - p);
    }

    function still(svg: SVGSVGElement) {
      const eye = window.innerHeight * 0.6;
      const nodes = root!.querySelectorAll<HTMLElement>('.ab-node');
      let best = 0;
      let bestD = Infinity;
      nodes.forEach((n, i) => {
        const b = n.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - eye);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      if (best === active || !nodes[best]) return;
      const moved = active !== -1;
      active = best;
      const b = nodes[best].getBoundingClientRect();
      const box = svg.getBoundingClientRect();
      const { x, y } = pointAt(
        svg,
        (b.top + b.height / 2 - box.top) / box.height
      );
      walker!.style.translate = `${x}px ${y}px`;
      // Not a slide: he is simply there, fading in. Opacity only, which is
      // what reduced motion still allows.
      if (moved)
        walker!.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 240,
          easing: 'ease-out',
        });
    }

    function frame() {
      raf = 0;
      const svg = rail();
      if (!svg) return;
      if (mode === 'run') run(svg);
      else if (mode === 'still') still(svg);
    }
    const schedule = () => {
      if (mode !== 'css' && !raf) raf = requestAnimationFrame(frame);
    };

    function pick() {
      mode = reduce.matches ? 'still' : cssRuns ? 'css' : 'run';
      active = -1;
      walker!.style.translate = '';
      turn!.style.rotate = '';
      for (const s of strokes) s.style.strokeDashoffset = '';
      if (mode === 'css') {
        delete root!.dataset.follow;
        delete root!.dataset.pose;
        if (hint) hint.style.display = '';
        return;
      }
      root!.dataset.follow = mode;
      // "Scroll, and Kiru runs it with you" — only where he does.
      if (hint) hint.style.display = mode === 'run' ? 'flex' : '';
      schedule();
    }

    pick();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reduce.addEventListener('change', pick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reduce.removeEventListener('change', pick);
    };
  }, []);

  return null;
}
