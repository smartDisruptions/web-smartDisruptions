'use client';

import { useEffect } from 'react';

/**
 * Holds the article's own ninjas (the hero's and the one bowing at the end)
 * still through a scroll, with a beat of grace.
 *
 * SiteFX already pauses every Kiru from a scroll's first event to scrollend,
 * but it lets go at once, and a mouse wheel ends a scroll at every notch:
 * between two notches his loops ran again, and each of their frames re-laid
 * out his SVG and repainted around him (measured on a phone-speed CPU: the
 * hero went from ~31 to ~45fps with him still, the end from ~33 to ~50).
 * Here the hold starts at a scroll's first event too, but ends 250ms after
 * the scroll does, so a reader flicking down the page never restarts him
 * between flicks. Only ninjas near the screen are held, and the switch
 * restyles only their looping parts (re.css names them).
 *
 * One passive listener per gesture (`once`, re-armed at scrollend), nothing
 * per frame. Under reduced motion he never moves, so nothing runs. Renders
 * nothing.
 */
export default function KiruHold() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ninjas = [
      ...document.querySelectorAll<SVGSVGElement>(
        '.re svg[data-kiru]:not([data-kiru="still"])'
      ),
    ];
    if (!ninjas.length) return;

    const near = new Set<Element>();
    let holding = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            near.add(e.target);
            if (holding) e.target.setAttribute('data-re-hold', '');
          } else {
            near.delete(e.target);
            e.target.removeAttribute('data-re-hold');
          }
        }
      },
      { rootMargin: '80px' }
    );
    for (const k of ninjas) io.observe(k);

    const hasEnd = 'onscrollend' in window;
    let quiet = 0;
    let grace = 0;
    const hold = (on: boolean) => {
      holding = on;
      for (const k of near) k.toggleAttribute('data-re-hold', on);
    };
    const listen = () =>
      window.addEventListener('scroll', onScroll, {
        passive: true,
        once: hasEnd,
      });
    function onScroll() {
      window.clearTimeout(grace);
      if (!holding && near.size) hold(true);
      window.clearTimeout(quiet);
      quiet = window.setTimeout(release, hasEnd ? 3000 : 160);
    }
    function ended() {
      window.clearTimeout(quiet);
      window.clearTimeout(grace);
      grace = window.setTimeout(release, 250);
      if (hasEnd) listen();
    }
    function release() {
      window.clearTimeout(quiet);
      window.clearTimeout(grace);
      if (holding) hold(false);
    }
    listen();
    if (hasEnd) window.addEventListener('scrollend', ended, { passive: true });

    return () => {
      io.disconnect();
      window.clearTimeout(quiet);
      window.clearTimeout(grace);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', ended);
      for (const k of ninjas) k.removeAttribute('data-re-hold');
    };
  }, []);
  return null;
}
