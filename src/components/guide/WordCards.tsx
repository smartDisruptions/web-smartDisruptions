import type { ReactNode } from 'react';
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
  spark: (
    <>
      <path d="M12 3.5 13.9 10 20.5 12l-6.6 2L12 20.5 10.1 14 3.5 12l6.6-2z" />
    </>
  ),
  stack: (
    <>
      <rect x="4" y="13" width="5" height="7" rx="1.2" />
      <rect x="9.5" y="9" width="5" height="11" rx="1.2" />
      <rect x="15" y="4.5" width="5" height="15.5" rx="1.2" />
    </>
  ),
  people: (
    <>
      <circle cx="8" cy="9" r="2.6" />
      <circle cx="16" cy="9" r="2.6" />
      <path d="M3.5 19c.6-3 2.4-4.6 4.5-4.6s3.9 1.6 4.5 4.6" />
      <path d="M11.5 19c.6-3 2.4-4.6 4.5-4.6s3.9 1.6 4.5 4.6" />
    </>
  ),
  chat: (
    <>
      <path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5v-3.5h0a2 2 0 0 1-2-2z" />
    </>
  ),
};

/**
 * The words this page uses, each with its plain meaning in full view. No
 * flipping: a reader who doesn't know a word shouldn't have to find it.
 */
export default function WordCards({ words }: { words: Word[] }) {
  return (
    <dl className="gd-words">
      {words.map((w) => (
        <div key={w.term} className="gd-word">
          <dt className="gd-word-head">
            <svg
              className="gd-word-ico"
              viewBox="0 0 24 24"
              width="22"
              height="22"
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
          </dt>
          <dd className="gd-word-plain">{w.plain}</dd>
        </div>
      ))}
    </dl>
  );
}
