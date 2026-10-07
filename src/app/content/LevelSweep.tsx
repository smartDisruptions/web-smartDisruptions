'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Lights the field guide's level strip once, the first time most of it is on
 * screen: the seven levels come on one after another, like a game's level
 * select. One IntersectionObserver that disconnects after it fires, and the
 * sweep itself is CSS (opacity and transforms, see `.wr-lv` in writing.css).
 *
 * The strip is server-rendered and handed in as children, so the kanji paths
 * never ship as client JavaScript. It starts as `data-lv="wait"`, which the
 * CSS dims only when scripts run and motion is welcome; without JavaScript,
 * or under reduced motion, it simply shows every level lit.
 */
export default function LevelSweep({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      el.dataset.lv = 'done';
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        el.dataset.lv = 'go';
      },
      { threshold: 0.8 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-lv="wait" aria-hidden>
      {children}
    </div>
  );
}
