'use client';

import { useEffect, useRef, useState } from 'react';

type Stop = { part: string; id: string; label: string };

/**
 * In-page navigation for a long report.
 *
 * WHY IT EXISTS
 * -------------
 * These reports run several thousand words. A reader who wants the cash-flow
 * section should not have to scroll for it, and a reader who has read half
 * should be able to see how much is left. Both are jobs a table of contents
 * does and prose cannot.
 *
 * WHY IT IS GROUPED
 * -----------------
 * Flat, the list ran to fourteen stops and read as a pile rather than a route
 * — a first-time reader could not tell from it what the article was going to
 * argue. Grouped, the same list scans as four things: start here, the
 * evidence, the verdict, the receipts. The numbering stays global so a stop's
 * number still means "how far through the whole report", not "how far through
 * this group".
 *
 * WHY IT IS A CLIENT COMPONENT
 * ----------------------------
 * Scroll-spy needs an observer. Everything else in the report, charts
 * included, is server-rendered; this is deliberately small. It degrades
 * honestly: with JavaScript off the links are still anchor links to real ids,
 * they simply do not highlight.
 *
 * The rootMargin is asymmetric on purpose. A section counts as "current" once
 * its heading passes the top quarter of the viewport, which matches where a
 * reader's eye actually is — centring the band made the highlight lag a full
 * section behind the text being read.
 *
 * THE RAIL
 * --------
 * An ink line runs down the list; vermilion fills it to the section you are
 * in, and a diamond slides to that stop. Both move by transform (the fill is a
 * scaleY, the diamond a translate) from one measurement per section change —
 * nothing runs per scroll frame. On a desktop the nav is sticky with its own
 * scroll box, so the current stop is also kept inside that box.
 */
export default function JumpNav({ items }: { items: Stop[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!items.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    );
    const nodes = items
      .map((i) => document.getElementById(i.id))
      .filter((n): n is HTMLElement => !!n);
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [items]);

  // Move the rail's marker to the current stop, and keep it there if the
  // list reflows (a font arriving late, a resize that re-wraps a label).
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('a[data-stop]'));
    const link = links.find((a) => a.dataset.stop === active);
    if (!link) return;

    const place = () => {
      const y = link.offsetTop + link.offsetHeight / 2;
      const h = Math.max(1, list.offsetHeight - 8);
      list.style.setProperty('--ms-y', `${Math.round(y - 4)}px`);
      list.style.setProperty('--ms-p', Math.min(1, Math.max(0, (y - 4) / h)).toFixed(4));
    };
    place();
    const ro = new ResizeObserver(place);
    links.forEach((a) => ro.observe(a));

    // Keep the current stop in view inside the sticky nav's own scroll box,
    // without ever scrolling the page itself.
    const box = list.closest<HTMLElement>('.sd-report-nav');
    if (box && box.scrollHeight > box.clientHeight + 1) {
      const top = link.getBoundingClientRect().top - box.getBoundingClientRect().top;
      if (top < 48 || top > box.clientHeight - 64) {
        box.scrollTo({ top: box.scrollTop + top - box.clientHeight / 2, behavior: 'smooth' });
      }
    }
    return () => ro.disconnect();
  }, [active]);

  if (!items.length) return null;

  // Group in place. Stops arrive in reading order, so a part is a run of
  // adjacent stops — no sorting, which would let the nav disagree with the
  // page it indexes.
  const groups: { part: string; stops: (Stop & { n: number })[] }[] = [];
  items.forEach((it, i) => {
    const last = groups[groups.length - 1];
    const stop = { ...it, n: i + 1 };
    if (last && last.part === it.part) last.stops.push(stop);
    else groups.push({ part: it.part, stops: [stop] });
  });

  return (
    <nav
      aria-label="Sections of this report"
      className="mb-10 rounded-2xl border border-border bg-background/60 p-4 lg:mb-0 lg:border-0 lg:bg-transparent lg:p-0 lg:pr-1"
    >
      <p className="sd-kicker mb-4">On this page</p>
      <div ref={listRef} className="ms-jump-list space-y-5">
        <span className="ms-jump-rail" aria-hidden="true" />
        <span className="ms-jump-fill" aria-hidden="true" />
        <span className="ms-jump-dot" aria-hidden="true" />
        {groups.map((g) => (
          <div key={`${g.part}-${g.stops[0].id}`}>
            <p className="mb-1.5 px-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-accent-hover">
              {g.part}
            </p>
            <ol className="space-y-0.5" role="list">
              {g.stops.map((it) => {
                const on = active === it.id;
                return (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      data-stop={it.id}
                      aria-current={on ? 'true' : undefined}
                      className={`flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm leading-snug transition-colors lg:min-h-0 ${
                        // Colour and ground only — never weight. A bolder
                        // label is wider, re-wraps, and shoves every stop
                        // below it as the reader scrolls.
                        on
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-secondary hover:bg-fill hover:text-text-primary'
                      }`}
                    >
                      <span className="font-mono text-[0.65rem] font-bold [font-variant-numeric:tabular-nums]">
                        {String(it.n).padStart(2, '0')}
                      </span>
                      <span className="min-w-0">{it.label}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
      </div>
    </nav>
  );
}
