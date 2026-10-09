'use client';

import { useEffect } from 'react';

/**
 * Scroll reveals, but only near the screen. Every attached scroll-driven
 * animation costs the main thread a style pass on each scrolling frame,
 * wherever on the page the reader is (measured on a phone-speed CPU while
 * building chapter 10). So this one observer sets `data-near` on each
 * chapter while it is within about half a screen of the viewport, and
 * re.css attaches the `.re-rv` reveals only there. Far away, everything sits
 * in its final state. Without JavaScript, without scroll timelines, or under
 * reduced motion nothing is hidden: the content simply shows.
 *
 * Renders nothing.
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
      { rootMargin: '35% 0px 35% 0px' }
    );
    document.querySelectorAll('.re-ch, .re-near').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
