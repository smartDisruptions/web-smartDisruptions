'use client';

import { useEffect } from 'react';

/**
 * One-shot entrances for the companies chapters (the fall in 05, the seals
 * stamped in 07). Renders nothing: the markup is the server's, complete and
 * in its final state, so a reader with no JavaScript (or reduced motion)
 * sees every bar at its depth and every seal on the page.
 *
 * Once it boots, each `[data-d-in]` element under #id that is still below
 * the fold is set to "wait" (its pre-entrance pose, off screen, so nobody
 * sees it change); when it scrolls in, "go" plays its CSS animation once.
 * Anything already on screen or above it is left alone. An
 * IntersectionObserver does the watching: no scroll listener, nothing per
 * frame, and it disconnects when every entrance has played.
 */
export default function DArm({
  id,
  threshold = 0,
  bottom = '-9%',
}: {
  id: string;
  /** how much of the element must show before it plays */
  threshold?: number;
  /** where the trigger line sits, as a bottom rootMargin (-38%: 62% up the screen) */
  bottom?: string;
}) {
  useEffect(() => {
    const root = document.getElementById(id);
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    if (!('IntersectionObserver' in window)) return;
    const items = [...root.querySelectorAll<HTMLElement>('[data-d-in]')];
    if (!items.length) return;

    let left = items.length;
    let first = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (first) {
            // Wholly below the fold: hide it in its starting pose. On screen
            // (even in the strip the margin leaves out) or above: it is
            // already where it belongs.
            if (e.boundingClientRect.top >= window.innerHeight) {
              el.dataset.dIn = 'wait';
              continue;
            }
            io.unobserve(el);
            left -= 1;
            continue;
          }
          if (el.dataset.dIn !== 'wait') continue;
          if (e.isIntersecting && e.intersectionRatio >= threshold * 0.98) {
            el.dataset.dIn = 'go';
          } else if (!e.isIntersecting && e.boundingClientRect.top < 0) {
            // flung past it before it showed enough: just let it be there
            el.dataset.dIn = 'done';
          } else continue;
          io.unobserve(el);
          left -= 1;
        }
        first = false;
        if (left <= 0) io.disconnect();
      },
      // Fire once the block is well inside the screen (`threshold` of it
      // above the trigger line), clear of the bottom edge where a phone's
      // tab bar sits.
      {
        rootMargin: `0px 0px ${bottom} 0px`,
        threshold: threshold > 0 ? [0, threshold] : 0,
      }
    );
    for (const el of items) io.observe(el);
    return () => io.disconnect();
  }, [id, threshold, bottom]);

  return null;
}
