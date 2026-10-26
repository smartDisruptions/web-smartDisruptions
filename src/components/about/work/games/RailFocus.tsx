'use client';

import { useEffect } from 'react';

/**
 * Keyboard focus in the games' rails always shows the whole screen.
 *
 * A row of screens that holds keyboard focus stops following the page
 * (./ReelDrive leaves it alone), so the browser can scroll the focused
 * screen into view. But Chrome only scrolls a focused element that is entirely out of
 * view; one that is partly visible it leaves where it is. On a phone, where a
 * rail shows a screen and most of the next, every other Tab would land on a
 * screen cut off by the edge. So on keyboard focus inside a rail, this
 * scrolls the rail sideways just far enough to show all of it, clear of the
 * edge by the rail's scroll-padding. Only the rail: the page's own scroll to
 * the focused screen is left to the browser. A click or a tap never moves
 * anything.
 *
 * One delegated listener on the section; nothing renders, nothing runs per
 * frame (one measurement per focus), and without JavaScript the rails still
 * work, just less tidily.
 */
export default function RailFocus({ id }: { id: string }) {
  useEffect(() => {
    const root = document.getElementById(id);
    if (!root) return;
    const onFocus = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof HTMLElement) || !el.matches(':focus-visible')) return;
      const rail = el.closest<HTMLElement>('.wk-gm-row');
      if (!rail || rail.scrollWidth <= rail.clientWidth) return;
      const pad = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
      const box = rail.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      if (r.left < box.left + pad) rail.scrollLeft -= box.left + pad - r.left;
      else if (r.right > box.right - pad)
        rail.scrollLeft += r.right - (box.right - pad);
    };
    root.addEventListener('focusin', onFocus);
    return () => root.removeEventListener('focusin', onFocus);
  }, [id]);
  return null;
}
