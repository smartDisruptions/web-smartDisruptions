'use client';

import { useEffect, useRef } from 'react';

/**
 * Holds the header's ninja still while the page scrolls, the way SiteFX holds
 * Pip and the guild hall holds its machines. A running CSS loop costs Chrome
 * a style pass on every scrolling frame, even one the compositor draws, and
 * inside an SVG a layout too; a paused loop costs nothing. So the first
 * scroll event of a scroll sets `data-hold` on the header (its parent here),
 * and 200 ms after `scrollend` (or, without it, after the last scroll event)
 * the hold lets go and he carries on reading. Nothing reads layout, and where
 * `scrollend` exists the listener is `once` per scroll: a fling costs a
 * handful of events, not one a frame. See `.wr-head[data-hold]` in
 * writing.css.
 */
export default function ScrollHold() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current?.parentElement;
    if (!root) return;
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
      window.addEventListener('scroll', onScroll, {
        passive: true,
        once: true,
      });
    };
    window.addEventListener('scroll', onScroll, {
      passive: true,
      once: hasScrollEnd,
    });
    if (hasScrollEnd) {
      window.addEventListener('scrollend', onScrollEnd, { passive: true });
    }

    return () => {
      window.clearTimeout(quiet);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', onScrollEnd);
      root.removeAttribute('data-hold');
    };
  }, []);

  return <span ref={ref} hidden />;
}
