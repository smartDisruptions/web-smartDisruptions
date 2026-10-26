'use client';

import { useEffect } from 'react';

/**
 * The reel moves as the page scrolls, and a finger can still push it.
 *
 * Each row of screens is a swipe rail (games.css). This turns the page's
 * scroll into each rail's own sideways scroll: a row crosses its whole length
 * while it is wholly on screen, the first row left to right and the second
 * the other way, as the CSS scroll timeline used to. Because it moves the
 * rail's scroll position instead of translating the row, the rail stays a
 * rail: a swipe, a trackpad or a scrollbar drag scrolls it either way, and
 * the page's scroll carries on from wherever it was left (Josh, 2026-10-26).
 *
 * How the two share a row: the page sets where the row would be (`auto`),
 * and the reader's own sideways scroll is kept as an offset from it. While a
 * finger is down, or the rail is still coasting from a swipe, the page leaves
 * that row alone; once it settles, the offset is whatever the reader left,
 * clamped so the row never runs past either end. A row holding keyboard
 * focus is left to RailFocus.
 *
 * "Wholly on screen" is measured inside the bars that cover the page, the
 * same insets the CSS timeline used: the tab bar (64px) at the foot below
 * 64rem, the header (65px) at the top from 64rem.
 *
 * Cost: while the section is near the screen, one rAF per scroll frame that
 * reads two rects and writes two scrollLefts (no layout is dirty during a
 * scroll, so the reads are cheap). Off screen, nothing. Under reduced
 * motion it never starts, and the rails stay still snapping rails.
 */
export default function ReelDrive({ id }: { id: string }) {
  useEffect(() => {
    const root = document.getElementById(id);
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 64rem)');

    type Row = {
      el: HTMLElement;
      rev: boolean;
      offset: number;
      /** The scrollLeft this file last wrote, to tell its scrolls from the reader's. */
      set: number;
      touching: boolean;
      /** The reader's own scroll holds the row until this time. */
      until: number;
    };
    const rows: Row[] = Array.from(
      root.querySelectorAll<HTMLElement>('.wk-gm-row')
    ).map((el) => ({
      el,
      rev: el.classList.contains('wk-gm-rev'),
      offset: 0,
      set: -1,
      touching: false,
      until: 0,
    }));
    if (!rows.length) return;

    let raf = 0;
    let near = false;
    let on = false;

    // Where the page would put a row: 0 at the start of the contain range,
    // its far end at the end of it (reversed for the second row).
    const autoOf = (row: Row) => {
      const max = row.el.scrollWidth - row.el.clientWidth;
      if (max <= 0) return { auto: 0, max: 0 };
      const r = row.el.getBoundingClientRect();
      const top = wide.matches ? 65 : 0;
      const bottom = wide.matches ? 0 : 64;
      const start = window.innerHeight - bottom - r.height; // foot clears the bar
      const span = start - top; // ...until its top reaches the top bar
      const p =
        span > 0 ? Math.min(1, Math.max(0, (start - r.top) / span)) : 0.5;
      return { auto: (row.rev ? 1 - p : p) * max, max };
    };

    const frame = () => {
      raf = 0;
      if (!on) return;
      const now = performance.now();
      const moves: [Row, number][] = [];
      for (const row of rows) {
        if (row.touching || now < row.until) continue;
        if (row.el.querySelector(':focus-visible')) continue;
        const { auto, max } = autoOf(row);
        const to = Math.min(max, Math.max(0, auto + row.offset));
        // Keep the offset honest at the ends, so a row pushed past one end
        // turns round the moment the page scrolls back.
        row.offset = to - auto;
        moves.push([row, to]);
      }
      // Reads above, writes below: one layout read per frame, not one per row.
      for (const [row, to] of moves) {
        if (Math.abs(row.el.scrollLeft - to) < 0.5) continue;
        row.el.scrollLeft = to;
        row.set = row.el.scrollLeft;
      }
    };
    const schedule = () => {
      if (on && near && !raf) raf = requestAnimationFrame(frame);
    };

    // The reader's own scroll (a swipe and its coast, a trackpad, the
    // scrollbar, a focus scroll): keep it as the row's offset, and hold the
    // page off the row until the rail has been still for a moment.
    const onRowScroll = (row: Row) => () => {
      if (!on || Math.abs(row.el.scrollLeft - row.set) <= 1) return;
      row.offset = row.el.scrollLeft - autoOf(row).auto;
      row.set = row.el.scrollLeft;
      row.until = performance.now() + 250;
    };
    const handlers = rows.map((row) => ({
      scroll: onRowScroll(row),
      down: () => (row.touching = true),
      up: () => {
        row.touching = false;
        row.until = performance.now() + 250;
      },
    }));

    const io = new IntersectionObserver(
      (entries) => {
        near = entries.some((e) => e.isIntersecting);
        schedule();
      },
      { rootMargin: '200px 0px' }
    );

    const start = () => {
      if (on || reduce.matches) return;
      on = true;
      root.setAttribute('data-drive', '');
      rows.forEach((row, i) => {
        const h = handlers[i];
        row.el.addEventListener('scroll', h.scroll, { passive: true });
        row.el.addEventListener('touchstart', h.down, { passive: true });
        row.el.addEventListener('touchend', h.up, { passive: true });
        row.el.addEventListener('touchcancel', h.up, { passive: true });
      });
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      io.observe(root);
    };
    const stop = () => {
      if (!on) return;
      on = false;
      root.removeAttribute('data-drive');
      rows.forEach((row, i) => {
        const h = handlers[i];
        row.el.removeEventListener('scroll', h.scroll);
        row.el.removeEventListener('touchstart', h.down);
        row.el.removeEventListener('touchend', h.up);
        row.el.removeEventListener('touchcancel', h.up);
        row.offset = 0;
        row.touching = false;
      });
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onReduce = () => (reduce.matches ? stop() : start());

    start();
    reduce.addEventListener('change', onReduce);
    wide.addEventListener('change', schedule);
    return () => {
      reduce.removeEventListener('change', onReduce);
      wide.removeEventListener('change', schedule);
      stop();
    };
  }, [id]);
  return null;
}
