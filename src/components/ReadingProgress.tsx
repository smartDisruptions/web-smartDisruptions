'use client';

import { useEffect } from 'react';

/**
 * The red pen line across the top of an article, filling as you read.
 *
 * It measures the ARTICLE, not the document: the footer and the "keep reading"
 * prints are not part of the read, and counting them leaves the bar short of
 * the end at the last paragraph, which reads as a bug.
 *
 * Width is written straight to the element rather than held in React state —
 * this fires on every scroll frame, and a state update per frame would
 * re-render the whole page for a number nothing else reads.
 */
export default function ReadingProgress({ targetId }: { targetId: string }) {
  useEffect(() => {
    const bar = document.getElementById('reading-progress');
    const target = document.getElementById(targetId);
    if (!bar || !target) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = target.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const done = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      bar.style.width = `${done * 100}%`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1"
    >
      <div
        id="reading-progress"
        className="h-full w-0 rounded-r bg-[var(--sd-pen)]"
      />
    </div>
  );
}
