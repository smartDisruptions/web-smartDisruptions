/**
 * Shared pieces for the Evidence Engine pages.
 *
 * DESIGN NOTE — why there are no coloured rails or tinted sub-panels in here.
 * The house rule from DESIGN.md is that structure is conveyed with coloured
 * text and dividers; rails and nested tinted cards are the patterns that read
 * as machine-generated, and the design auditor flags them by name. Everything
 * below is therefore a heading, a divider, or a figure on the page ground.
 *
 * The verdict colours reuse the existing bull/warn/bear semantic inks rather
 * than inventing a fourth axis. They already encode "holds / partly holds /
 * does not hold" and are AA-verified in both themes, which is exactly the
 * polarity a verdict has.
 */

import Link from 'next/link';
import type { EvidenceLink, EvidenceKind } from '@/data/evidence';
import type { ClaimStatus, Verdict } from '@/lib/adjudicate';

/* ── Verdict presentation ────────────────────────────────────────────────── */

export const statusLabel: Record<ClaimStatus, string> = {
  evidenced: 'Evidenced',
  attested: 'Attested only',
  refused: 'Refused',
};

export const statusText: Record<ClaimStatus, string> = {
  evidenced: 'text-bull',
  attested: 'text-warn',
  refused: 'text-bear',
};

const statusDot: Record<ClaimStatus, string> = {
  evidenced: 'bg-bull',
  attested: 'bg-warn',
  refused: 'bg-bear',
};

export function VerdictMark({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={`font-mono-accent inline-flex items-center gap-2 ${statusText[status]}`}
    >
      <span
        aria-hidden
        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[status]}`}
      />
      {statusLabel[status]}
    </span>
  );
}

/* ── Evidence links ──────────────────────────────────────────────────────── */

const kindLabel: Record<EvidenceKind, string> = {
  live: 'Live',
  code: 'Code',
  writing: 'Writing',
  artifact: 'Artifact',
  metric: 'Measured',
  testimony: 'Testimony',
};

/**
 * One piece of evidence.
 *
 * A public item is a link. A private one is deliberately NOT a link and says
 * why in the same breath — the reader should be able to tell at a glance which
 * half of this list they can actually check, because that distinction is what
 * the whole page is arguing about.
 */
export function EvidenceItem({ item }: { item: EvidenceLink }) {
  const openable = item.access === 'public' && item.href;

  return (
    <li className="border-t border-border py-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={`font-mono-accent shrink-0 ${openable ? 'text-bull' : 'text-warn'}`}
        >
          {kindLabel[item.kind]}
        </span>
        {openable ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
          >
            {item.label}
          </a>
        ) : (
          <span className="font-medium text-text-primary">{item.label}</span>
        )}
      </div>
      {!openable && item.note && (
        <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
          <span className="text-warn">Cannot be opened.</span> {item.note}
        </p>
      )}
    </li>
  );
}

export function EvidenceList({ items }: { items: EvidenceLink[] }) {
  return (
    <ul className="mt-4" role="list">
      {items.map((item, i) => (
        <EvidenceItem key={`${item.label}-${i}`} item={item} />
      ))}
    </ul>
  );
}

/* ── Figures ─────────────────────────────────────────────────────────────── */

export interface Figure {
  label: string;
  value: string;
  tone?: 'neutral' | 'bull' | 'warn' | 'bear';
}

const figureTone: Record<NonNullable<Figure['tone']>, string> = {
  neutral: 'text-text-primary',
  bull: 'text-bull',
  warn: 'text-warn',
  bear: 'text-bear',
};

/**
 * The counter strip.
 *
 * Deliberately the same construction as Market Storm's price strip — a 1px
 * grid gap over a border-coloured ground, mono label above a tabular figure —
 * because the site already has a way of showing a row of numbers and a second
 * one would just be a second thing to keep consistent.
 */
export function FigureStrip({ figures }: { figures: Figure[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-border">
      <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
        {figures.map((f) => (
          <div
            key={f.label}
            className="flex flex-col justify-between gap-2 bg-surface px-4 pb-3 pt-3"
          >
            <div className="font-mono text-[0.7rem] uppercase leading-[1.1rem] tracking-[0.06em] text-text-secondary">
              {f.label}
            </div>
            <div
              className={`font-mono text-2xl font-semibold leading-none [font-variant-numeric:tabular-nums] ${
                figureTone[f.tone ?? 'neutral']
              }`}
            >
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Field blocks ────────────────────────────────────────────────────────── */

/** A labelled block of the ten-field schema. Heading + divider, no panel. */
export function Field({
  label,
  children,
  starred = false,
}: {
  label: string;
  children: React.ReactNode;
  starred?: boolean;
}) {
  return (
    <section className="border-t border-border pt-6">
      {/* Deliberately NOT font-mono-accent: that utility uppercases, and these
          labels run to 30-odd characters. A long all-caps run is measurably
          harder to read and the design auditor is right to flag it — the
          uppercase eyebrow is for short labels, which these are not. */}
      <h3
        className={`font-mono text-[0.8rem] font-medium tracking-[0.04em] ${
          starred ? 'text-accent' : 'text-text-secondary'
        }`}
      >
        {label}
      </h3>
      <div className="mt-3 max-w-[62ch]">{children}</div>
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <p className="leading-[1.75] text-text-secondary">{children}</p>;
}

/**
 * A list where each item is a full thought.
 *
 * Markers are em-dashes in the secondary ink rather than bullets: the items
 * here are sentences, and a disc in front of a three-line sentence reads as a
 * checklist of things that were completed, which is the wrong promise.
 */
export function Points({
  items,
  tone = 'neutral',
}: {
  items: string[];
  tone?: 'neutral' | 'accent' | 'bear';
}) {
  const marker =
    tone === 'accent'
      ? 'text-accent'
      : tone === 'bear'
        ? 'text-bear'
        : 'text-text-secondary';
  return (
    <ul className="flex flex-col gap-3" role="list">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 leading-[1.75] text-text-secondary">
          <span aria-hidden className={`shrink-0 select-none ${marker}`}>
            &mdash;
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ── Verdict row ─────────────────────────────────────────────────────────── */

/**
 * One skill claim with its grade.
 *
 * The claim is set in the primary ink and the engine's reason underneath it in
 * secondary, so the eye reads claim-then-verdict rather than badge-then-claim.
 * A refused claim is shown in full, not hidden — the refusals are the reason
 * to believe the rest of the page.
 */
export function VerdictRow({ verdict }: { verdict: Verdict }) {
  const { claim, status, supporting, reason } = verdict;
  return (
    <li className="border-t border-border py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          {claim.name}
        </h3>
        <VerdictMark status={status} />
      </div>

      <p
        className={`mt-2 max-w-[62ch] leading-[1.7] ${
          status === 'refused'
            ? 'text-text-secondary italic'
            : 'text-text-secondary'
        }`}
      >
        {claim.claim}
      </p>

      <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
        <span className={statusText[status]}>{statusLabel[status]}.</span>{' '}
        {reason}
      </p>

      {claim.limit && (
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
          <span className="text-warn">Known limit.</span> {claim.limit}
        </p>
      )}

      {supporting.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {supporting.map((s) => (
            <Link
              key={s.slug}
              href={`/evidence/josh/${s.slug}`}
              className="text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {s.title}
            </Link>
          ))}
        </p>
      )}
    </li>
  );
}
