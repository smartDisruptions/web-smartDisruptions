'use client';

import { useState } from 'react';
import type { SortItem } from './copy';

type Pick = 'plan' | 'api';

const LABEL: Record<Pick, string> = { plan: 'Your plan', api: 'The API' };
const GOES: Record<Pick, string> = { plan: 'your plan', api: 'the API' };

/**
 * A tiny card game: eight situations, one at a time, and you call which bill
 * each one lands on. Wrong answers aren't punished, just explained. The full
 * answer list is server-rendered under the game on the page, so nothing here
 * is the only way to read it.
 */
export default function SortGame({ items }: { items: SortItem[] }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Pick | null>(null);
  const [score, setScore] = useState(0);
  const finished = i >= items.length;
  const item = items[i];

  function choose(p: Pick) {
    if (picked || !item) return;
    setPicked(p);
    if (p === item.answer) setScore((s) => s + 1);
  }

  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }

  function restart() {
    setPicked(null);
    setScore(0);
    setI(0);
  }

  return (
    <div className="gd-sort">
      <div className="gd-sort-pips" aria-hidden>
        {items.map((_, n) => (
          <span
            key={n}
            className="gd-sort-pip"
            data-state={n < i ? 'done' : n === i ? 'now' : 'ahead'}
          />
        ))}
      </div>

      {finished ? (
        <div className="gd-sort-card gd-sort-end" key="end">
          <p className="gd-sort-count">Level clear</p>
          <p className="gd-sort-score font-display tabular-nums">
            {score} / {items.length}
          </p>
          <p className="gd-sort-why font-read">
            {score === items.length
              ? "Every one right. That's the whole line, and you've got it."
              : score >= items.length - 2
                ? 'Nearly all of them. The list below has the reason behind each one.'
                : 'This line takes a minute to see. The list below has every answer and the reason for it.'}
          </p>
          <button
            type="button"
            className="gd-btn gd-btn-ghost"
            onClick={restart}
          >
            Play again
          </button>
        </div>
      ) : (
        <div
          className="gd-sort-card"
          key={i}
          data-result={
            picked ? (picked === item.answer ? 'right' : 'wrong') : 'none'
          }
        >
          <p className="gd-sort-count">
            Card {i + 1} of {items.length}
          </p>
          <p className="gd-sort-text font-display">{item.text}</p>

          <div className="gd-sort-choices">
            {(['plan', 'api'] as const).map((p) => (
              <button
                key={p}
                type="button"
                className="gd-sort-choice"
                data-choice={p}
                data-picked={picked === p}
                data-answer={picked !== null && item.answer === p}
                disabled={picked !== null}
                onClick={() => choose(p)}
              >
                {LABEL[p]}
              </button>
            ))}
          </div>

          <div className="gd-sort-feedback" aria-live="polite">
            {picked && (
              <>
                <p className="gd-sort-verdict">
                  {picked === item.answer
                    ? 'Right.'
                    : `This one goes on ${GOES[item.answer]}.`}
                </p>
                <p className="gd-sort-why font-read">{item.why}</p>
                <button type="button" className="gd-btn" onClick={next}>
                  {i === items.length - 1 ? 'See my score' : 'Next card'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
