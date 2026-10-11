'use client';

import { useEffect, useRef } from 'react';

/**
 * The emaki's one island. It renders nothing you can see (an empty, hidden
 * span to find the section by) and owns two small jobs:
 *
 *  1. Keyboard focus. The behaviour (./follow) is imported when the section
 *     comes within half a screen, or on the first focus inside it, whichever
 *     is first — so a reader who never scrolls this far never downloads it,
 *     and a keyboard reader who Tabs in before it arrives is still answered
 *     (the focus that triggered the import is handed to it).
 *  2. Pictures. The screenshots are lazy, but three of the four scenes sit
 *     beside the screen, not below it, where the browser's lazy loading does
 *     not look (it reaches ahead down the page, and the page clips
 *     sideways). So as the section nears, they are asked for now, and each
 *     scene arrives with its picture already in it.
 *
 * Nothing here runs per frame: the scroll itself is CSS.
 */
export default function WorkProjectsIsland() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest<HTMLElement>('.wk-pj');
    if (!section) return;
    const root: HTMLElement = section;
    let alive = true;
    let started = false;
    let cleanup: (() => void) | undefined;

    const start = (first?: Element | null) => {
      if (started) return;
      started = true;
      io.disconnect();
      root.removeEventListener('focusin', onEarlyFocus);
      root
        .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
        .forEach((img) => {
          img.loading = 'eager';
        });
      import('./follow').then(({ follow }) => {
        if (alive) cleanup = follow(root, first);
      });
    };
    const onEarlyFocus = (e: FocusEvent) => start(e.target as Element | null);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
      },
      { rootMargin: '50% 0px' }
    );
    io.observe(root);
    root.addEventListener('focusin', onEarlyFocus);

    return () => {
      alive = false;
      io.disconnect();
      root.removeEventListener('focusin', onEarlyFocus);
      cleanup?.();
    };
  }, []);

  return <span ref={ref} hidden />;
}
