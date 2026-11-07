'use client';

import { useEffect, useRef } from 'react';
import type { WallDrive } from './armory-drive';

/**
 * The switch that wakes the ring up, the chips, and the status line.
 *
 * Everything you can see is server markup (ArmoryWall): the plaques, the
 * chips, the buttons, the caption. This island renders only the polite live
 * line a screen reader hears, and wires the rest:
 *
 *  - It imports the ring's behaviour (./armory-drive) when the ring comes
 *    within 400px of the screen, so a reader who never scrolls that far
 *    never downloads it. Under reduced motion it never loads at all: the
 *    ring lies flat as a grid of links and needs nothing.
 *  - It loads the plaques' pictures before they are needed. Each one is
 *    lazy in the markup, so the page's first paint never waits on the wall,
 *    but a lazy image in a 3D ring only loads as its plaque turns toward
 *    you: measured 2026-11-07 on a throttled phone, ten of the 32 loaded as
 *    the ring came into view and the rest two at a time, one turn behind,
 *    so a turning ring kept bringing round empty plaques (Josh: slow on the
 *    iPad and the phone). So once the ring is within two screens, every
 *    picture is set to load, the plaques nearest the front first, and
 *    decoded, so each one is ready before it comes round. They are small
 *    pre-sized files (scripts/make-wall-thumbs.mjs), about 400 KB for all
 *    of them. Under reduced motion the grid is flat and lazy loading does
 *    its usual job, so they are left to it.
 *  - The chips (All · Games · Apps · Websites) are shown only once they
 *    work (data-chips). A chip keeps the plaques of its kind and the rest go
 *    (data-out, display: none), on the ring and on the flat grid alike (Josh,
 *    2026-10-26: gone, not dimmed). On the ring that means a new ring: the
 *    plaques kept are renumbered 0…k-1 (--i) round a ring of k (--n, so its
 *    radius fits them, wall.css), the counter's total becomes k, and the
 *    drive starts again over just those, two plaques short of the first,
 *    and turns to it. The line below says what happened.
 */
export default function ArmoryWallIsland() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const status = ref.current;
    const root = status?.closest<HTMLElement>('[data-wall]');
    if (!status || !root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const chips = Array.from(
      root.querySelectorAll<HTMLButtonElement>('[data-wall-chip]')
    );
    const panels = Array.from(root.querySelectorAll<HTMLElement>('.bt-panel'));
    const total = root.querySelector<HTMLElement>('[data-wall-of]');
    let drive: ((root: HTMLElement) => WallDrive) | null = null;
    let wall: WallDrive | null = null;
    let io: IntersectionObserver | null = null;
    let warmIo: IntersectionObserver | null = null;
    let alive = true;

    // Every picture on the ring, nearest the front first: the ring settles
    // on the first plaque, so that one, then its neighbours either side,
    // outward round the ring.
    const warm = () => {
      const n = panels.length;
      panels
        .map((p, i) => ({ img: p.querySelector('img'), d: Math.min(i, n - i) }))
        .sort((a, b) => a.d - b.d)
        .forEach(({ img }) => {
          if (!img) return;
          img.loading = 'eager';
          img.decode().catch(() => {});
        });
    };

    const choose = (chip: HTMLButtonElement) => {
      const id = chip.dataset.wallChip ?? 'all';
      const label = chip.dataset.label ?? '';
      const all = id === 'all';
      for (const c of chips) c.setAttribute('aria-pressed', String(c === chip));
      const kept = panels.filter(
        (p) => all || (p.dataset.groups ?? '').split(' ').includes(id)
      );
      for (const p of panels) p.toggleAttribute('data-out', !kept.includes(p));
      const count = kept.length;
      const what = all ? `All ${count}` : `The ${count} ${label.toLowerCase()}`;
      if (!wall || !drive || !count) {
        status.textContent = `Showing ${what.toLowerCase()}.`;
        return;
      }
      // A new ring of just these plaques.
      wall.stop();
      kept.forEach((p, i) => p.style.setProperty('--i', String(i)));
      root.style.setProperty('--n', String(count));
      root.style.setProperty('--park', '0');
      root.removeAttribute('data-park');
      for (const p of panels) {
        p.removeAttribute('data-front');
        p.removeAttribute('data-away');
      }
      if (total) total.textContent = ` / ${String(count).padStart(2, '0')}`;
      root.dataset.spin = String((360 / count) * Math.min(2, count - 1));
      wall = drive(root);
      wall.first(`${what}: `);
    };
    const onChip = (e: MouseEvent) =>
      choose(e.currentTarget as HTMLButtonElement);
    for (const c of chips) c.addEventListener('click', onChip);

    const start = () => {
      if (reduce.matches) {
        // The flat grid: the chips filter it, no behaviour needed.
        root.setAttribute('data-chips', '');
        return;
      }
      if (!warmIo) {
        warmIo = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            warmIo?.disconnect();
            warm();
          },
          { rootMargin: '200% 0px' }
        );
        warmIo.observe(root);
      }
      if (wall || io) return;
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          io = null;
          import('./armory-drive').then((m) => {
            if (!alive || wall || reduce.matches) return;
            drive = m.drive;
            wall = drive(root);
            root.setAttribute('data-chips', '');
          });
        },
        { rootMargin: '400px 0px' }
      );
      io.observe(root);
    };
    const stop = () => {
      io?.disconnect();
      io = null;
      wall?.stop();
      wall = null;
    };
    const onChange = () => {
      stop();
      start();
    };

    start();
    reduce.addEventListener('change', onChange);
    return () => {
      alive = false;
      warmIo?.disconnect();
      reduce.removeEventListener('change', onChange);
      for (const c of chips) c.removeEventListener('click', onChip);
      stop();
    };
  }, []);

  return (
    <p ref={ref} className="sr-only" aria-live="polite" data-wall-status />
  );
}
