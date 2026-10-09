import { useId, type ReactNode } from 'react';
import { S12 } from './content';
import './sections/e.css';

/**
 * A glossary word in running text: a dotted underline you can press, which
 * opens that word's definition (the same words as the glossary in chapter
 * 12) on a small paper slip.
 *
 * It is the platform's own popover, so it ships no JavaScript: the button
 * opens and closes it, Escape or a tap anywhere else closes it, opening one
 * closes any other, and the browser tells assistive tech the button is
 * expanded. Closed, the slip is display:none, so it never doubles the text.
 * On a wide screen it hangs under the word (CSS anchor positioning); on a
 * phone, or where anchoring isn't supported, it rises from the bottom of the
 * screen like a sheet (see e.css, "Glossary terms").
 *
 * Mark a word in content.ts as [[shown words|Glossary term]] or [[Term]].
 * Only the first use of each term in the running text is marked.
 */
export default function Term({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  const uid = useId();
  const entry = S12.glossary.find(
    (g) => g.term.toLowerCase() === term.toLowerCase()
  );
  if (!entry) return <>{children}</>;
  // useId is unique on the page; keep only characters an id and a CSS
  // dashed-ident both accept.
  const id = `re-def-${uid.replace(/[^A-Za-z0-9_-]/g, '')}`;
  const anchor = `--${id}`;
  return (
    <span className="re-e-term">
      <button
        type="button"
        className="re-term re-e-term-btn"
        popoverTarget={id}
        style={{ anchorName: anchor }}
      >
        {children}
      </button>
      <span
        id={id}
        popover="auto"
        className="re-e-def"
        style={{ positionAnchor: anchor }}
      >
        <span className="re-e-def-k">{entry.term}</span>
        <span className="font-read re-e-def-d">{entry.def}</span>
        <button
          type="button"
          className="re-e-def-x"
          popoverTarget={id}
          popoverTargetAction="hide"
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </span>
    </span>
  );
}
