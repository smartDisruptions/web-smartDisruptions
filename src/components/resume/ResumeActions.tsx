'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The résumé's only JavaScript, and none of it is required.
 *
 * The "hiring for…" lens is plain radio buttons filtered by CSS (`:has()`),
 * so it works before this loads and without it. This only adds:
 *
 *   - LensSync: keeps the lens in the URL (/resume?for=ai), so a link can be
 *     sent already narrowed to one job, and reopens on the lens it names.
 *   - PrintButton: saves the page as a PDF, with every skill opened first so
 *     the paper copy carries the receipts, then puts them back as they were.
 */

const RADIO = 'input[name="rs-lens"]';

export function LensSync() {
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get('for');
    if (want) {
      const input = document.querySelector<HTMLInputElement>(
        `${RADIO}[value="${CSS.escape(want)}"]`
      );
      if (input) input.checked = true;
    }

    const onChange = (e: Event) => {
      const t = e.target as HTMLInputElement | null;
      if (!t?.matches?.(RADIO)) return;
      const url = new URL(window.location.href);
      if (t.value === 'all') url.searchParams.delete('for');
      else url.searchParams.set('for', t.value);
      window.history.replaceState(window.history.state, '', url);
    };
    document.addEventListener('change', onChange);
    return () => document.removeEventListener('change', onChange);
  }, []);

  return null;
}

export function CopyLensLink() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return (
    <button
      type="button"
      className="rs-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked — the address bar already has the link */
        }
      }}
    >
      <span aria-live="polite">
        {copied ? 'Link copied' : 'Copy link to this view'}
      </span>
    </button>
  );
}

export function PrintButton() {
  useEffect(() => {
    let opened: HTMLDetailsElement[] = [];
    const before = () => {
      opened = Array.from(
        document.querySelectorAll<HTMLDetailsElement>('.rs-skill:not([open])')
      );
      opened.forEach((d) => (d.open = true));
    };
    const after = () => {
      opened.forEach((d) => (d.open = false));
      opened = [];
    };
    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);

  return (
    <button type="button" className="rs-ghost" onClick={() => window.print()}>
      Save as PDF
    </button>
  );
}
