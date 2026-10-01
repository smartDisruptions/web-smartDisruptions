'use client';

import { useEffect } from 'react';

/**
 * The site's one global effects island. It owns three small jobs that would
 * otherwise each need their own listener:
 *
 *  1. Liveness — every <Kiru> idles only while on screen. An
 *     IntersectionObserver sets `data-live` and pauses his SMIL tails when he
 *     scrolls away, so a page full of ninjas costs nothing per frame.
 *  2. Gaze — visible ninjas look at the pointer (or the last touch). One
 *     rAF-throttled listener writes --lx/--ly on each; CSS moves the pupils.
 *  3. Tilt — `.sd-tilt` cards lean toward a fine pointer, via --rx/--ry.
 *
 * Reduced motion turns 1 and 3 off and leaves the eyes looking ahead.
 */
export default function SiteFX() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const visible = new Set<SVGSVGElement>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const svg = e.target as SVGSVGElement;
          if (e.isIntersecting && !reduce.matches && svg.dataset.kiru !== 'still') {
            svg.setAttribute('data-live', '');
            svg.unpauseAnimations?.();
            visible.add(svg);
          } else {
            svg.removeAttribute('data-live');
            svg.pauseAnimations?.();
            visible.delete(svg);
          }
        }
      },
      { rootMargin: '80px' },
    );

    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll<SVGSVGElement>('svg[data-kiru]').forEach((svg) => {
        if (seen.has(svg)) return;
        seen.add(svg);
        svg.pauseAnimations?.();
        io.observe(svg);
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

    let px = innerWidth / 2;
    let py = innerHeight / 3;
    let frame = 0;
    const look = () => {
      frame = 0;
      for (const svg of visible) {
        const r = svg.getBoundingClientRect();
        // His eyes sit about 40% down the box.
        const ex = r.left + r.width / 2;
        const ey = r.top + r.height * 0.4;
        const dx = px - ex;
        const dy = py - ey;
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 260);
        const flip = svg.style.scale.startsWith('-1') ? -1 : 1;
        svg.style.setProperty('--lx', ((dx / d) * k * flip).toFixed(3));
        svg.style.setProperty('--ly', ((dy / d) * k).toFixed(3));
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
      const card = (e.target as Element | null)?.closest?.<HTMLElement>('.sd-tilt');
      if (card && !card.contains(e.relatedTarget as Node | null)) {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      }
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    document.addEventListener('pointerout', onLeaveCard, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('pointerout', onLeaveCard);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
