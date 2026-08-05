'use client';

import { useState } from 'react';
import AboutLetter from '@/components/about/AboutLetter';
import AboutReceipts from '@/components/about/AboutReceipts';
import AboutPath from '@/components/about/AboutPath';
import AboutSpecSheet from '@/components/about/AboutSpecSheet';
import AboutQA from '@/components/about/AboutQA';

/**
 * Side-by-side chooser for the five about-page templates. This route exists so
 * the decision gets made against the real design system, real fonts and both
 * themes — not against a description. It is scaffolding: once a template is
 * picked, its component moves into src/app/about/page.tsx and this whole
 * directory gets deleted.
 */
const templates = [
  {
    id: 1,
    name: 'The Letter',
    pitch:
      'One column, no cards. Whitespace and type do all the work. Most on-brand with Paper; least immediate proof.',
    Component: AboutLetter,
  },
  {
    id: 2,
    name: 'The Receipts Wall',
    pitch:
      'Sticky identity rail, evidence grid. Puts the numbers above the fold. Counts read from the site data, so they cannot go stale.',
    Component: AboutReceipts,
  },
  {
    id: 3,
    name: 'The Path',
    pitch:
      'A timeline with a spine, 2007 to now. The eighteen-year span is the argument — nobody skipped to the end. Dates are your real ones.',
    Component: AboutPath,
  },
  {
    id: 4,
    name: 'The Spec Sheet',
    pitch:
      'Shaped like a README. Scannable in fifteen seconds. Densest and most opinionated; assumes a technical reader.',
    Component: AboutSpecSheet,
  },
  {
    id: 5,
    name: 'The Interview',
    pitch:
      'Split hero, then plain Q&A. Turns the AI disclosure into the answer to a question the reader is already asking.',
    Component: AboutQA,
  },
];

export default function AboutPreviewClient() {
  const [active, setActive] = useState(1);
  const current = templates.find((t) => t.id === active) ?? templates[0];
  const Active = current.Component;

  return (
    <div>
      {/* Chooser bar. Sticks directly below the site nav, which is sticky at
          top-0 and measures 69px. A magic number is fine here — this route is
          scaffolding and gets deleted once a template is chosen. */}
      <div className="sticky top-[69px] z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-accent mr-2 text-text-secondary">
              About templates
            </span>
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                aria-pressed={active === t.id}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active === t.id
                    ? 'bg-accent text-background'
                    : 'bg-fill text-text-secondary hover:text-text-primary'
                }`}
              >
                {t.id}. {t.name}
              </button>
            ))}
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
            {current.pitch}
          </p>
        </div>
      </div>

      <Active />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <p className="border-t border-border pt-6 text-sm text-text-secondary">
          Preview only &mdash; nothing here is the live About page. Flip the
          theme in the nav to check both. Copy is now reconciled against the
          LinkedIn profile (2026-08-05): real dates, the psychology degree, and
          the food truck told honestly &mdash; built, then deliberately not
          shipped.
        </p>
      </div>
    </div>
  );
}
