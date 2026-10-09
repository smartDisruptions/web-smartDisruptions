'use client';

import { useEffect, useRef } from 'react';

const DAY = 86_400_000;
/** The marker's words live in its one child (the pill), not the line. */
const setText = (mark: HTMLElement, text: string) => {
  const pill = mark.firstElementChild;
  if (pill) pill.textContent = text;
};
/** "2026-10-28" → that calendar day, as a UTC day number (no time zones). */
const dayOf = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1) / DAY;
};

/**
 * Chapter 11's clock. The page is static, so the server can't know the
 * reader's today; this reads it once from the reader's own clock, after the
 * page has hydrated (the server HTML carries no countdowns, so there is
 * nothing to mismatch), and:
 *
 *  - writes each exact date's chip: "in 19 days", "today" or "passed"
 *    (fuzzy dates — "Late Oct", "2027" — get none);
 *  - marks each row passed / now / soon, for the rail's ink;
 *  - shows the "Today" marker just after the last date that has passed.
 *
 * It runs again at the reader's next midnight and when a tab left open for
 * days comes back. The marker is absolutely positioned and the chips sit at
 * the end of a line, so nothing on the page moves when they appear.
 */
export default function DatesClock({ year }: { year: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fig = ref.current?.closest<HTMLElement>('.re-e-dates');
    if (!fig) return;
    const rows = [...fig.querySelectorAll<HTMLElement>('.re-e-date')];
    const end = fig.querySelector<HTMLElement>('.re-e-now-end');
    let timer = 0;

    const paint = () => {
      const now = new Date();
      const today =
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY;
      const label = `Today · ${now.getDate()} ${now.toLocaleString('en-GB', { month: 'short' })}${
        now.getFullYear() === year ? '' : ` ${now.getFullYear()}`
      }`;
      const states = rows.map((row) => {
        const from = dayOf(row.dataset.from ?? '');
        const to = dayOf(row.dataset.to ?? '');
        const state = today > to ? 'passed' : today >= from ? 'now' : 'soon';
        row.dataset.state = state;
        const chip = row.querySelector<HTMLElement>('.re-e-cd');
        if (chip) {
          const n = Math.round(from - today);
          chip.textContent =
            state === 'passed'
              ? 'passed'
              : state === 'now'
                ? 'today'
                : `in ${n} ${n === 1 ? 'day' : 'days'}`;
          chip.hidden = false;
        }
        return state;
      });
      // Today sits just after the last date that has passed. (A fuzzy span
      // like "Early Nov" can still be running when "9 Nov" has passed.)
      const at = states.lastIndexOf('passed') + 1;
      rows.forEach((row, i) => {
        const mark = row.querySelector<HTMLElement>('.re-e-now');
        if (!mark) return;
        mark.hidden = i !== at;
        if (i === at) setText(mark, label);
      });
      if (end) {
        end.hidden = at < rows.length;
        if (at >= rows.length) setText(end, label);
      }
      // Again at the reader's next midnight.
      const next = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      window.clearTimeout(timer);
      timer = window.setTimeout(paint, next.getTime() - now.getTime() + 1000);
    };
    paint();

    const onShow = () => {
      if (document.visibilityState === 'visible') paint();
    };
    document.addEventListener('visibilitychange', onShow);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onShow);
    };
  }, [year]);

  return <span ref={ref} hidden />;
}
