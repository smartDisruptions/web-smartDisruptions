'use client';

import { useEffect, useRef } from 'react';

/**
 * The ring's controls, and the switch that wakes the ring up.
 *
 * The plaques themselves are server markup (ArmoryWall). This island renders
 * only the two buttons and the status line, and imports the behaviour
 * (./armory-drive) when the ring comes within 400px of the screen — so a
 * reader who never scrolls that far never downloads it. Under reduced
 * motion it never loads at all: the ring is a flat grid of links and needs
 * nothing.
 */
export default function ArmoryWallIsland({
  count,
  first,
}: {
  count: number;
  first: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>('[data-wall]');
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let cleanup: (() => void) | null = null;
    let io: IntersectionObserver | null = null;
    let alive = true;

    const start = () => {
      if (cleanup || io || reduce.matches) return;
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          io = null;
          import('./armory-drive').then(({ drive }) => {
            if (!alive || cleanup || reduce.matches) return;
            cleanup = drive(root);
          });
        },
        { rootMargin: '400px 0px' },
      );
      io.observe(root);
    };
    const stop = () => {
      io?.disconnect();
      io = null;
      cleanup?.();
      cleanup = null;
    };
    const onChange = () => (reduce.matches ? stop() : start());

    start();
    reduce.addEventListener('change', onChange);
    return () => {
      alive = false;
      reduce.removeEventListener('change', onChange);
      stop();
    };
  }, []);

  return (
    <div ref={ref} className="bt-wall-controls">
      <button
        type="button"
        className="bt-wall-btn"
        data-wall-prev
        aria-label="Turn the wall back one"
        disabled
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <p className="bt-wall-status" data-wall-status aria-live="polite">
        1 of {count} · <b>{first}</b>
      </p>
      <button
        type="button"
        className="bt-wall-btn"
        data-wall-next
        aria-label="Turn the wall on one"
        disabled
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
