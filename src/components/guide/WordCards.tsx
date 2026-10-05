'use client';

import { useState, type ReactNode } from 'react';
import type { Word } from './copy';

const ICONS: Record<Word['icon'], ReactNode> = {
  code: (
    <>
      <path d="m8.5 8-4 4 4 4" />
      <path d="m15.5 8 4 4-4 4" />
      <path d="m13.2 5.5-2.4 13" />
    </>
  ),
  door: (
    <>
      <path d="M5.5 20.5v-15a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v15" />
      <path d="M3.5 20.5h17" />
      <circle cx="14.6" cy="12.4" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  chunk: (
    <>
      <rect x="3.5" y="6.5" width="5" height="11" rx="1.4" />
      <rect x="9.5" y="6.5" width="5" height="11" rx="1.4" />
      <rect x="15.5" y="6.5" width="5" height="11" rx="1.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

/**
 * Four words that come up whenever people talk about paying for AI. Each card
 * flips to its plain meaning. Both faces are in the DOM, so a screen reader
 * hears the term and its meaning together; the flip is only for eyes.
 */
export default function WordCards({ words }: { words: Word[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <ul className="gd-words" role="list">
      {words.map((w, i) => {
        const flipped = !!open[i];
        return (
          <li key={w.term}>
            <button
              type="button"
              className="gd-word"
              data-flipped={flipped}
              aria-pressed={flipped}
              onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
            >
              <span className="gd-word-inner">
                <span className="gd-word-face gd-word-front">
                  <svg
                    className="gd-word-ico"
                    viewBox="0 0 24 24"
                    width="26"
                    height="26"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    focusable="false"
                  >
                    {ICONS[w.icon]}
                  </svg>
                  <span className="gd-word-term">{w.term}</span>
                  <span className="gd-word-hint" aria-hidden>
                    <span className="gd-only-touch">Tap to flip</span>
                    <span className="gd-only-mouse">Click to flip</span>
                  </span>
                </span>
                <span className="gd-word-face gd-word-back">
                  <span className="gd-word-term-sm">{w.term}</span>
                  <span className="gd-word-plain">{w.plain}</span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
