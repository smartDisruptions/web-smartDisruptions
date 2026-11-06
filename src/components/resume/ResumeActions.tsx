'use client';

/**
 * The résumé's only JavaScript: the PDF button. The print stylesheet in
 * app/resume/resume.css does the real work, turning the page into a plain
 * résumé with every link written out, so the browser's own Print menu
 * gives the same result.
 */
export function PrintButton() {
  return (
    <button type="button" className="rs-ghost" onClick={() => window.print()}>
      Download résumé (PDF)
    </button>
  );
}
