'use client';

import { useEffect, useRef } from 'react';

/**
 * The machines' one effects island. Two small jobs, nothing per frame:
 *
 *  1. Which machines are on screen. One IntersectionObserver sets `data-on`
 *     on each machine while any of it is visible (on a phone the swipeable
 *     row clips the others, and the observer sees that). CSS runs a
 *     machine's attract loop only while it is on AND the room is live
 *     (`.gh[data-live]`, the hall's).
 *
 *  2. The swipe hold. On a phone the row scrolls sideways, which the hall's
 *     hold (the page's scroll) never sees. The first scroll event of a swipe
 *     sets `data-hold` on the row's root, and a 200 ms quiet spell after the
 *     last `scrollend` (or, without it, after the last scroll event) clears
 *     it, so the loops hold still while you swipe and a swiping frame
 *     restyles none of them. With `scrollend`, the listener is `once` per
 *     scroll sequence: a swipe costs a handful of events, not one a frame.
 */
export default function Live() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = ref.current?.parentElement;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const machines = root.querySelectorAll('.gm-m');
    const row = root.querySelector<HTMLElement>('.gm-row');

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.target.toggleAttribute('data-on', e.isIntersecting);
    });
    machines.forEach((m) => io.observe(m));

    if (!row) return () => io.disconnect();
    // The row snaps, so one swipe can end several scroll sequences (several
    // `scrollend`s). The hold lets go 200 ms after the last one, and a new
    // sequence inside that spell keeps it: one hold, one release, a swipe.
    const hasScrollEnd = 'onscrollend' in window;
    let quiet = 0;
    const release = () => {
      window.clearTimeout(quiet);
      root.removeAttribute('data-hold');
    };
    function onScroll() {
      if (!root!.hasAttribute('data-hold')) root!.setAttribute('data-hold', '');
      window.clearTimeout(quiet);
      // where scrollend exists this is only a safety net
      quiet = window.setTimeout(release, hasScrollEnd ? 1500 : 200);
    }
    const onScrollEnd = () => {
      window.clearTimeout(quiet);
      quiet = window.setTimeout(release, 200);
      row.addEventListener('scroll', onScroll, { passive: true, once: true });
    };
    row.addEventListener('scroll', onScroll, { passive: true, once: hasScrollEnd });
    if (hasScrollEnd) row.addEventListener('scrollend', onScrollEnd, { passive: true });

    return () => {
      io.disconnect();
      window.clearTimeout(quiet);
      row.removeEventListener('scroll', onScroll);
      row.removeEventListener('scrollend', onScrollEnd);
      root.removeAttribute('data-hold');
    };
  }, []);
  return <span ref={ref} hidden />;
}
