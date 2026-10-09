'use client';

import { useEffect, useRef } from 'react';

type Item = { id: string; n: number; toc: string };

/**
 * ChapterRail — a slim chapter rail in the left margin of wide screens: one
 * short ink tick per chapter, the chapter you're reading in vermilion.
 *
 * It costs nothing while you scroll. Two IntersectionObservers do the work:
 * one watches a thin band across the middle of the viewport and, when a
 * chapter crosses it, moves `aria-current` from one link to another (two
 * attribute writes, a few times per article); the other shows the rail once
 * the opening — hero, short answer, contents — has scrolled away. No scroll listener, no
 * per-frame work, nothing at all below 1200px wide.
 *
 * The rail is extra: the contents table is the page's real navigation, so
 * the rail stays out of the way (hidden, not focusable) until it's useful.
 */
export default function ChapterRail({ chapters }: { chapters: Item[] }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const railEl = ref.current;
    if (!railEl) return;
    const rail: HTMLElement = railEl;
    const wide = window.matchMedia('(min-width: 1200px)');
    const links = new Map<string, HTMLAnchorElement>();
    rail.querySelectorAll<HTMLAnchorElement>('a[data-id]').forEach((a) => {
      if (a.dataset.id) links.set(a.dataset.id, a);
    });
    let current: HTMLAnchorElement | null = null;
    let spy: IntersectionObserver | null = null;
    let reveal: IntersectionObserver | null = null;

    const setCurrent = (id: string) => {
      const a = links.get(id) ?? null;
      if (a === current) return;
      current?.removeAttribute('aria-current');
      a?.setAttribute('aria-current', 'location');
      current = a;
    };

    function on() {
      if (spy) return;
      spy = new IntersectionObserver(
        (entries) => {
          for (const e of entries)
            if (e.isIntersecting) setCurrent(e.target.id);
        },
        { rootMargin: '-45% 0px -54% 0px' }
      );
      for (const c of chapters) {
        const el = document.getElementById(c.id);
        if (el) spy.observe(el);
      }
      // The opening (hero, short answer, contents) runs from the top of the
      // page, so "none of it on screen" means the reader is past it. Watching
      // all three rather than the contents alone also catches a jump straight
      // from a chapter to the top, which never intersects the contents.
      const showing = new Set<Element>();
      reveal = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) showing.add(e.target);
          else showing.delete(e.target);
        }
        if (showing.size) rail.removeAttribute('data-on');
        else rail.setAttribute('data-on', '');
      });
      document
        .querySelectorAll('[data-a-hero], [data-a-answer], [data-a-toc]')
        .forEach((el) => reveal!.observe(el));
    }
    function off() {
      spy?.disconnect();
      reveal?.disconnect();
      spy = reveal = null;
      rail.removeAttribute('data-on');
    }
    const onWidth = () => (wide.matches ? on() : off());
    onWidth();
    wide.addEventListener('change', onWidth);
    return () => {
      wide.removeEventListener('change', onWidth);
      off();
      current?.removeAttribute('aria-current');
    };
  }, [chapters]);

  return (
    <nav ref={ref} className="re-a-rail" aria-label="Chapters">
      <ol role="list">
        {chapters.map((c) => (
          <li key={c.id}>
            <a href={`#${c.id}`} data-id={c.id} className="re-a-rail-a">
              <span className="re-a-rail-n">
                {String(c.n).padStart(2, '0')}
              </span>
              <span className="re-a-rail-t">{c.toc}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
