'use client';

import { useEffect, useState } from 'react';

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
 * WHY IT IS A CLIENT COMPONENT — the only one in the report
 * --------------------------------------------------------
 * Scroll-spy needs an observer. Everything else on the page, charts included,
 * is server-rendered; this is the single exception and it is deliberately
 * small. It degrades honestly: with JavaScript off the links are still anchor
 * links to real ids, they simply do not highlight.
 *
 * The rootMargin is asymmetric on purpose. A section counts as "current" once
 * its heading passes the top quarter of the viewport, which matches where a
 * reader's eye actually is — centring the band made the highlight lag a full
 * section behind the text being read.
 */
export default function JumpNav({ items }: { items: Stop[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? '');

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
      className="mb-10 rounded-2xl border border-border bg-surface-elevated p-5 lg:mb-0"
    >
      <p className="font-mono-accent mb-4 text-text-secondary">On this page</p>
      <div className="space-y-5">
        {groups.map((g) => (
          <div key={`${g.part}-${g.stops[0].id}`}>
            <p className="mb-1.5 px-2 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-accent-hover">
              {g.part}
            </p>
            <ol className="space-y-0.5" role="list">
              {g.stops.map((it) => {
                const on = active === it.id;
                return (
                  <li key={it.id}>
                    <a
                      href={`#${it.id}`}
                      aria-current={on ? 'true' : undefined}
                      className={`flex items-baseline gap-2.5 rounded-md px-2 py-1.5 text-sm leading-snug transition-colors ${
                        on
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-secondary hover:bg-fill hover:text-text-primary'
                      }`}
                    >
                      <span className="font-mono text-[0.65rem] font-bold [font-variant-numeric:tabular-nums] opacity-70">
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
