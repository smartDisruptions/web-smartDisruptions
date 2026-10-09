'use client';

import { useEffect } from 'react';

/**
 * Chapters 02, 03 and 10 draw their charts with scroll-driven animations.
 * Measured on a phone-speed CPU, an attached scroll-driven animation costs
 * the main thread a little on every scrolling frame (a style and layer
 * update), wherever on the page the reader is. So the animations are only
 * attached while a chapter is within about half a screen of the viewport:
 * this observer sets `data-near` on each `.re-c-ch`, and c.css attaches the
 * timelines under it. Far away, the charts sit in their final state and cost
 * nothing; nearby, they are in their before-state long before they show.
 *
 * Without scroll-timeline support or under reduced motion there is nothing
 * to attach, and the observer never starts. Renders nothing.
 */
export default function Near() {
  useEffect(() => {
    if (
      typeof CSS === 'undefined' ||
      !CSS.supports('animation-timeline: view()')
    )
      return;
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
