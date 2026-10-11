'use client';

import { useEffect, useRef } from 'react';

/**
 * The threshold's island. Renders nothing; it tells two pieces of server
 * markup when they have been reached, so their CSS can play a one-off,
 * time-based flourish there (threshold.css):
 *
 *  - the till (`.au-th-till`): `data-landed` once its foot comes on screen,
 *    which is the moment the sticky till stops riding the bottom of the
 *    screen and the whole receipt is out. The 作 seal stamps down then, with
 *    a thump. Scroll back above it and it is un-stamped (out of sight, inside
 *    the till again), so it stamps again next time;
 *  - the cue (`.au-th-cue`): `data-seen` when it is mostly on screen, and its
 *    brush arrow inks itself down toward the work.
 *
 * Each is armed (`data-armed`, which is what lets the CSS hide the seal and
 * the arrow beforehand) only if it is still below the fold when the page
 * hydrates, so nothing already on screen ever blinks out to replay. Without
 * JavaScript, under reduced motion, or for anything already reached, the seal
 * is stamped and the arrow inked from the first paint.
 *
 * Why an IntersectionObserver and not a scroll timeline: a scroll-driven
 * animation costs Chrome a style pass on every scrolling frame of the whole
 * page (measured: one per frame, even with the receipt far off screen),
 * while an observer only wakes when its line is crossed.
 */
export default function ThresholdFX() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.au-hero');
    const till = root?.querySelector<HTMLElement>('.au-th-till');
    const foot = till?.querySelector<HTMLElement>('.au-th-end');
    const cue = root?.querySelector<HTMLElement>('.au-th-cue');
    if (!root || !till || !foot || !cue) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const below = (el: Element) =>
      el.getBoundingClientRect().top > window.innerHeight;
    const observers: IntersectionObserver[] = [];

    if (below(foot)) {
      till.dataset.armed = '';
      const io = new IntersectionObserver(([e]) => {
        // Landed while the foot is on screen or above it; printing (seal
        // hidden, inside the till) while it is still below the fold.
        const under =
          !e.isIntersecting &&
          e.boundingClientRect.top > (e.rootBounds?.bottom ?? innerHeight);
        till.toggleAttribute('data-landed', !under);
      });
      io.observe(foot);
      observers.push(io);
    }

    if (below(cue)) {
      cue.dataset.armed = '';
      const io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          cue.dataset.seen = '';
          io.disconnect();
        },
        // The bottom 80px is under the phone's tab bar: it doesn't count.
        { threshold: 0.6, rootMargin: '0px 0px -80px 0px' }
      );
      io.observe(cue);
      observers.push(io);
    }

    return () => {
      observers.forEach((io) => io.disconnect());
      for (const el of [till, cue]) {
        el.removeAttribute('data-armed');
        el.removeAttribute('data-landed');
        el.removeAttribute('data-seen');
      }
    };
  }, []);

  return <span ref={anchor} hidden />;
}
