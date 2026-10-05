'use client';

import { useEffect, useRef, useState } from 'react';
import type { Task } from './copy';

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/**
 * One building day, told as you scroll. The task cards scroll past; the two
 * meters stay pinned beside them. As each card reaches the middle of the
 * screen the per-use meter climbs by that task's share, and the plan meter
 * doesn't move.
 *
 * Performance: an IntersectionObserver picks the active card; the number
 * tweens with one short requestAnimationFrame loop that writes textContent
 * directly (no React render per frame) and stops when it lands. The bar is a
 * scaleX transform. Under reduced motion the number jumps instead of
 * counting.
 */
export default function BuildDay({ tasks }: { tasks: Task[] }) {
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLOListElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const total = tasks.reduce((s, t) => s + t.cost, 0);

  useEffect(() => {
    const cards = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[data-task]') ?? []
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          setActive(Number((e.target as HTMLElement).dataset.task));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  const target = tasks.slice(0, active + 1).reduce((s, t) => s + t.cost, 0);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const from = shown.current;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (reduce || from === target) {
      shown.current = target;
      el.textContent = money(target);
      return;
    }
    const start = performance.now();
    const dur = 650;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * eased;
      shown.current = v;
      el.textContent = money(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const done = active === tasks.length - 1;

  return (
    <div className="gd-day">
      <div className="gd-day-meters">
        <div className="gd-meter gd-meter-api">
          <span className="gd-meter-label">If you paid per use</span>
          <span className="gd-meter-num tabular-nums" ref={numRef}>
            {money(0)}
          </span>
          <span className="gd-meter-bar" aria-hidden>
            <span
              className="gd-meter-fill"
              style={{ transform: `scaleX(${target / total})` }}
            />
          </span>
          <span className="gd-meter-note">
            {active < 0
              ? 'What this would cost on the API, by my rough math'
              : `${active + 1} of ${tasks.length} jobs done`}
          </span>
        </div>
        <div className="gd-meter gd-meter-plan">
          <span className="gd-meter-label">Extra on your plan today</span>
          <span className="gd-meter-num tabular-nums">{money(0)}</span>
          <span className="gd-meter-bar" aria-hidden>
            <span className="gd-meter-flat" />
          </span>
          <span className="gd-meter-note">
            {done
              ? "Still $0 extra, inside your plan's limits"
              : 'Already paid for'}
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {active < 0
          ? ''
          : `Job ${active + 1} done (${tasks[active].title}): ${money(target)} if paid per use, $0 extra on your plan.`}
      </p>

      <ol className="gd-day-list" ref={listRef}>
        {tasks.map((t, i) => (
          <li
            key={t.title}
            data-task={i}
            className="gd-task"
            data-state={i < active ? 'done' : i === active ? 'now' : 'ahead'}
          >
            <span className="gd-task-time" aria-hidden>
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="gd-task-title">{t.title}</h3>
            <p className="gd-task-plain font-read">{t.plain}</p>
            <p className="gd-task-chips">
              <span className="gd-chip gd-chip-api">
                +{money(t.cost)} per use
              </span>
              <span className="gd-chip gd-chip-plan">+$0.00 on your plan</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
