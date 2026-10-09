'use client';

import { useEffect } from 'react';

/**
 * Chapters 02, 03 and 10 move only near the screen. Measured on a
 * phone-speed CPU, every attached scroll-driven animation and every running
 * transition costs the main thread a style pass on each frame, wherever on
 * the page the reader is. So this observer sets `data-near` on each
 * `.re-c-ch` while it is within about half a screen of the viewport, and
 * c.css hangs every scroll timeline and every transition of these chapters
 * off it. Far away, the charts sit in their final state and a change made
 * elsewhere (a world picked in 02 while 10 is off screen) simply lands;
 * nearby, the scroll charts are in their before-state long before they
 * show.
 *
 * Under reduced motion nothing moves anyway, and the observer never
 * starts. Renders nothing.
 */
export default function Near() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.setAttribute('data-near', '');
          else e.target.removeAttribute('data-near');
        }
      },
      { rootMargin: '60% 0px 60% 0px' }
    );
    document.querySelectorAll('.re-c-ch').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
