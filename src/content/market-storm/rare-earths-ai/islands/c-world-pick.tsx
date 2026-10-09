'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { WorldKey } from '../content';
import { setWorld, useWorld } from '../world';

/*
 * "Pick your 2030" — chapter 02's three scenarios as a radio group. Picking
 * one sets the page-wide world (../world.ts): the ranking lab in chapter 10
 * re-ranks for it, and the scenario chart there lights its markers. Nothing
 * is picked at first: the page opens on the article's own view.
 *
 * Native radios, so the arrow keys, the focus ring and the group semantics
 * come free; the card around each is its <label>. A pick lands as a
 * vermilion hanko stamped over the empty dot, with a ripple of field lines
 * (one-shot CSS, transforms and opacity only). All state lives in the store,
 * so the card in chapter 10's toggle and this one always agree.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const UI = {
  hint: 'Pick your 2030. The ranking in chapter 10 follows your pick.',
  picked: (name: string) => `Chapter 10 now ranks the companies for ${name}.`,
  go: 'See the ranking',
  clear: 'Clear',
};

export default function WorldPick({
  labelledBy,
  items,
  seal,
}: {
  labelledBy: string;
  /** `text` arrives rendered (the server's <Rich>), so no markup parser ships here. */
  items: { key: WorldKey; name: string; p: number; text: ReactNode }[];
  /** The hanko's character, rendered on the server. */
  seal: ReactNode;
}) {
  const world = useWorld();
  const picked = items.find((it) => it.key === world);

  return (
    <div className="re-c-pick">
      <p id="re-c-pick-hint" className="re-c-pick-hint">
        {UI.hint}
      </p>
      <div
        className="re-c-pick-grid"
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-describedby="re-c-pick-hint"
      >
        {items.map((it) => (
          <label key={it.key} className={`re-c-world is-${it.key}`}>
            <input
              type="radio"
              name="re-c-world"
              value={it.key}
              className="re-c-world-in"
              checked={world === it.key}
              onChange={() => setWorld(it.key)}
            />
            <span className="font-display re-c-world-name">{it.name}</span>
            <span className="re-c-world-mark" aria-hidden="true">
              <span className="re-c-world-dot" />
              <span className="sd-seal re-c-world-seal">{seal}</span>
            </span>
            <span className="font-display re-c-world-p">{it.p}%</span>
            <span className="re-c-world-bar" aria-hidden="true">
              <i
                className="re-c-world-fill"
                style={{ '--p': it.p / 100 } as Vars}
              />
            </span>
            <span className="font-read re-c-world-text">{it.text}</span>
          </label>
        ))}
      </div>
      <div className="re-c-pick-after">
        <p className="re-c-pick-status" aria-live="polite">
          {picked ? UI.picked(picked.name) : ''}
        </p>
        {picked && (
          <span className="re-c-pick-acts">
            <a className="re-c-pick-go" href="#ranking">
              {UI.go}
              <span aria-hidden="true">↓</span>
            </a>
            <button
              type="button"
              className="re-c-pick-clear"
              onClick={() => setWorld(null)}
            >
              {UI.clear}
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
