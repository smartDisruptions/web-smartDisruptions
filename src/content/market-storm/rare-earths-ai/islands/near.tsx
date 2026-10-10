'use client';

import { useEffect } from 'react';

/**
 * Two jobs that keep a long, dense page at 60fps while it scrolls.
 *
 * 1. Scroll motion on. The stylesheets attach their scroll-driven animations
 *    under `[data-near]`, set here on every chapter once JavaScript runs.
 *    Without JavaScript, without scroll timelines, or under reduced motion
 *    nothing is hidden: the content simply sits in its final state. (This
 *    used to follow the reader, attaching animations only within a third of
 *    a screen, because an attached scroll animation costs a style pass on
 *    every scrolling frame. Since chapters off screen now skip rendering
 *    altogether, their animations cost nothing there, and attaching and
 *    detaching as the reader moved cost more than it saved: measured on a
 *    4x-throttled phone at reading pace, 4 long tasks while scrolling
 *    instead of 6 to 9.)
 *
 * 2. Warm-up. Off-screen chapters skip rendering (content-visibility: auto in
 *    re.css), which makes every scroll frame and hit test cheaper, but leaves
 *    each chapter's first style and layout (~200ms on a 4x-throttled phone
 *    CPU) to land mid-scroll the first time the reader reaches it. So once the
 *    page has loaded, and only while the reader is not scrolling, an idle
 *    moment lays out the chapter just past the one the reader is in, and
 *    hands it back to being skipped. The browser keeps that layout, so
 *    reaching the chapter later costs only paint, and its remembered height
 *    (contain-intrinsic-size: auto) becomes exact. Warming everything after
 *    load instead added ~1.1s of blocking time on a throttled phone; one
 *    chapter ahead costs one short task at a time, while the reader is
 *    reading. A fast device, where a chapter takes under ~60ms, does warm
 *    everything in idle moments, so a laptop's long continuous scroll never
 *    meets a first layout either.
 *
 *    The chapters just past where the reader is now go first, nearest first,
 *    and only then any chapter behind them still cold (a jump can pass over
 *    one). After a jump (a contents link, a citation, a shared link) or a
 *    fast skim, when the reader has come two or more chapters since the
 *    warm-up last caught up, it works two chapters ahead rather than one:
 *    someone who jumps is often skimming. Measured on a 4x-throttled phone,
 *    a jump to 9,000px, a 1.5s pause, then 8s of continuous swiping: the
 *    swipe's long tasks fell from a median of 183ms to 58ms (4 runs each;
 *    range 152-288 vs 52-278), because chapter 05 was already laid out.
 *    With no pause between the jump and the swipe there is no idle moment
 *    to work in, and nothing changes. Reading at a reading pace never covers
 *    two chapters between pauses, so it stays one ahead, as before.
 *
 * Renders nothing.
 */
export default function Near() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document
      .querySelectorAll('.re-ch, .re-near')
      .forEach((el) => el.setAttribute('data-near', ''));
  }, []);

  useEffect(() => {
    if (typeof window.requestIdleCallback !== 'function') return;
    const chapters = Array.from(
      document.querySelectorAll<HTMLElement>('.re-ch, .re #sources')
    );
    const warm = new Set<HTMLElement>();
    const onScreen = new Set<number>();
    let at = -1; // the furthest chapter on screen (the last one seen, if none)
    let caught = -1; // where the reader was when the warm-up last caught up
    let idleId = 0;
    let startId = 0;
    let quietId = 0;
    let scrolling = false;
    let disposed = false;
    // How far past the reader to work. One chapter on a slow device, so the
    // work comes one short task at a time while they read. A fast one (a
    // chapter laid out in under ~60ms) warms the rest of the page in idle
    // moments after load, so even a long continuous scroll never meets a
    // first layout.
    let ahead = 1;

    // The next chapter to lay out: those just past the reader first, nearest
    // first, then those behind, nearest first. Past the lead, nothing: the
    // reader may never get there. The lead is two chapters, not one, when the
    // reader has come two or more chapters since the warm-up last caught up:
    // a jump, or a fast skim. (Reading at a reading pace, it stays one.)
    const next = () => {
      const lead = Math.max(ahead, at - caught >= 2 ? 2 : 1);
      for (let i = at + 1; i <= at + lead && i < chapters.length; i++) {
        if (!warm.has(chapters[i])) return chapters[i];
      }
      for (let i = Math.min(at, chapters.length) - 1; i >= 0; i--) {
        if (!warm.has(chapters[i])) return chapters[i];
      }
      caught = at;
      return undefined;
    };

    const warmNext = (deadline: IdleDeadline) => {
      idleId = 0;
      if (disposed || scrolling) return;
      const el = next();
      if (!el) return;
      if (deadline.timeRemaining() > 4 || deadline.didTimeout) {
        warm.add(el);
        const t0 = performance.now();
        el.style.contentVisibility = 'visible';
        void el.offsetHeight; // style + layout this chapter once, now
        el.style.contentVisibility = '';
        ahead = performance.now() - t0 < 60 ? chapters.length : 1;
      }
      schedule();
    };
    const schedule = () => {
      if (!idleId && !disposed && !scrolling && next()) {
        idleId = window.requestIdleCallback(warmNext, { timeout: 4000 });
      }
    };

    // Chapters on screen are rendered by the browser, so they count as warm,
    // and they say where the reader is.
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const i = chapters.indexOf(e.target as HTMLElement);
        if (e.isIntersecting) {
          onScreen.add(i);
          warm.add(chapters[i]);
        } else {
          onScreen.delete(i);
        }
      }
      if (onScreen.size) at = Math.max(...onScreen);
      schedule();
    });
    chapters.forEach((c) => io.observe(c));

    // A scroll pauses the warm-up until the page has been still for a moment,
    // so a layout never lands in the middle of a gesture.
    const onScroll = () => {
      scrolling = true;
      if (idleId) {
        window.cancelIdleCallback(idleId);
        idleId = 0;
      }
      window.clearTimeout(quietId);
      quietId = window.setTimeout(() => {
        scrolling = false;
        schedule();
      }, 450);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const start = () => {
      startId = window.setTimeout(schedule, 2500);
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    return () => {
      disposed = true;
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('load', start);
      window.clearTimeout(startId);
      window.clearTimeout(quietId);
      if (idleId) window.cancelIdleCallback(idleId);
    };
  }, []);
  return null;
}
