'use client';

import { useEffect, useState } from 'react';

/**
 * In-page navigation for a long report.
 *
 * WHY IT EXISTS
 * -------------
 * These reports run eight sections and several thousand words. A reader who
 * wants the cash-flow section should not have to scroll for it, and a reader
 * who has read half should be able to see how much is left. Both are jobs a
 * table of contents does and prose cannot.
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
export default function JumpNav({
  items,
}: {
  items: { id: string; label: string }[];
}) {
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

  return (
    <nav
      aria-label="Sections of this report"
      className="mb-10 rounded-2xl border border-border bg-surface-elevated p-5 lg:mb-0"
    >
      <p className="font-mono-accent mb-3 text-text-secondary">On this page</p>
      <ol className="space-y-1" role="list">
        {items.map((it, i) => {
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
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0">{it.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
