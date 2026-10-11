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
 *  - The chips (All · Projects · More builds · Games) are shown only
 *    once they work (data-chips). On the ring a chip turns to the first
 *    plaque of its kind and leaves the rest in shadow, so the arrows step
 *    between the plaques it picked; on the flat grid it shows only those.
 *    Either way the plaques it leaves out carry data-out, and the line
 *    below says what happened.
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
    let wall: WallDrive | null = null;
    let io: IntersectionObserver | null = null;
    let alive = true;

    const choose = (chip: HTMLButtonElement) => {
      const id = chip.dataset.wallChip ?? 'all';
      const label = chip.dataset.label ?? '';
      const all = id === 'all';
      for (const c of chips) c.setAttribute('aria-pressed', String(c === chip));
      let count = 0;
      for (const p of panels) {
        const keep = all || p.dataset.group === id;
        p.toggleAttribute('data-out', !keep);
        if (keep) count++;
      }
      const what = all ? `All ${count}` : `The ${count} ${label.toLowerCase()}`;
      if (wall) wall.find(id, `${what}: `);
      else status.textContent = `Showing ${what.toLowerCase()}.`;
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
      if (wall || io) return;
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          io = null;
          import('./armory-drive').then(({ drive }) => {
            if (!alive || wall || reduce.matches) return;
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
      reduce.removeEventListener('change', onChange);
      for (const c of chips) c.removeEventListener('click', onChip);
      stop();
    };
  }, []);

  return (
    <p ref={ref} className="sr-only" aria-live="polite" data-wall-status />
  );
}
