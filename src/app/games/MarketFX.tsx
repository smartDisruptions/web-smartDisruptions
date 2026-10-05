'use client';

import { useEffect } from 'react';

/**
 * The night market's loops stop while they are off screen.
 *
 * Every CSS loop wakes the main thread at each iteration boundary on this
 * page (React listens for `animationiteration` at its root), and every wake
 * restyles every running animation on the page. Measured with CDP at 4× CPU:
 * the lanterns, the neon's flicker and the Rooftop Run cabinet's ring and
 * blink kept the main thread busy ~47 times a second at rest, even with the
 * reader far below them in the Broom & Blade Arcade.
 *
 * So each region tagged `data-market` gets `data-off` while it is out of view,
 * and arcade.css pauses its loops under it. The direction matters: without
 * JavaScript, or before it runs, nothing is marked off, and the market moves
 * exactly as it always has.
 */
export default function MarketFX() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) (e.target as HTMLElement).toggleAttribute('data-off', !e.isIntersecting);
      },
      { rootMargin: '120px' },
    );
    document.querySelectorAll<HTMLElement>('[data-market]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
