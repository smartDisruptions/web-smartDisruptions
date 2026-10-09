'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * "Back to the text": after a reader follows a citation down to the source
 * list, a small pill offers the way back to the exact line they left. One
 * click listener (passive, capture) notes where a citation was pressed;
 * nothing runs per frame, and the pill leaves once the reader scrolls away
 * from the sources. The browser's own Back works too: each citation is a
 * same-page link.
 */
export default function CiteBack() {
  const ref = useRef<HTMLDivElement>(null);
  const from = useRef<{ y: number; link: HTMLElement } | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sources = ref.current?.closest('section');
    if (!sources) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.<HTMLElement>(
        'a[href^="#src-"]'
      );
      if (!link || sources.contains(link)) return;
      from.current = { y: window.scrollY, link };
      setShow(true);
    };
    // Once the reader has left the sources, the offer lapses.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) setShow(false);
    });
    io.observe(sources);
    document.addEventListener('click', onClick, {
      capture: true,
      passive: true,
    });
    return () => {
      io.disconnect();
      document.removeEventListener('click', onClick, { capture: true });
    };
  }, []);

  const back = () => {
    const f = from.current;
    setShow(false);
    if (!f) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: f.y, behavior: still ? 'auto' : 'smooth' });
    f.link.focus({ preventScroll: true });
  };

  return (
    <div ref={ref} className="re-e-back-wrap">
      {show && (
        <button type="button" className="re-e-back-pill" onClick={back}>
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M6 3.5 2.5 7 6 10.5M3 7h6.5a4 4 0 0 1 0 8H8" />
          </svg>
          Back to the text
        </button>
      )}
    </div>
  );
}
