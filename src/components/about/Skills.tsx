import Link from 'next/link';
import {
  evidenceFor,
  skillGroups,
  type EvidenceKind,
  type ResolvedEvidence,
  type Skill,
} from '@/data/skills';

/**
 * The skills section on /about, with its evidence folded in.
 *
 * WHY NATIVE <details> AND NOT A REACT ACCORDION
 * Every row here is server-rendered HTML. There is no state, no hydration and
 * no client bundle — opening a row is the browser doing what it already does,
 * which is why it is instant on a phone on a bad connection. An accordion is
 * the one interaction pattern the platform gives away for free, and taking it
 * would have meant shipping JavaScript to reproduce something that already
 * works, including the keyboard and screen-reader behaviour.
 *
 * WHY IT IS COLLAPSED AT ALL
 * Eighteen skills with their receipts is a wall if it is all on screen. The
 * closed row still carries the two things that matter to someone scanning —
 * the term and a plain sentence explaining it — so nothing is hidden that a
 * reader needs. What expands is the depth: where it got used, and the links.
 */

const kindLabel: Record<EvidenceKind, string> = {
  app: 'App',
  game: 'Game',
  article: 'Read',
  site: 'Live',
  code: 'Code',
};

function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function EvidenceLink({ item }: { item: ResolvedEvidence }) {
  const body = (
    <>
      <span className="font-mono text-[0.7rem] uppercase tracking-[0.06em] text-accent">
        {kindLabel[item.kind]}
      </span>
      <span className="font-medium text-text-primary group-hover/ev:text-accent">
        {item.label}
      </span>
      {item.detail && (
        <span className="text-text-secondary">&mdash; {item.detail}</span>
      )}
    </>
  );

  const className =
    'group/ev flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-snug transition-colors hover:border-accent/40';

  // Internal paths route through next/link for the client-side transition;
  // anything off-site opens in a new tab so the page is not lost.
  return item.internal ? (
    <Link href={item.href} className={className}>
      {body}
    </Link>
  ) : (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {body}
    </a>
  );
}

function SkillRow({ skill, open = false }: { skill: Skill; open?: boolean }) {
  const evidence = evidenceFor(skill);

  // The very first row ships open. A closed list of twenty rows does not
  // announce that it is a list of twenty rows you can open, and a reader who
  // never clicks one sees only the shallowest version of the page. One open row
  // teaches the interaction and costs half a screen of scroll.
  //
  // The id makes a single skill linkable.
  return (
    <details
      id={skill.id}
      open={open}
      className="group scroll-mt-24 border-t border-border"
    >
      <summary className="flex cursor-pointer list-none items-start gap-4 py-5 transition-colors hover:bg-fill/40 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text-primary group-hover:text-accent">
            {skill.name}
          </h3>
          <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
            {skill.plain}
          </p>
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-2">
          {/* Labelled, because a bare numeral beside a chevron reads as a
              footnote marker rather than a count of things to click. The word
              drops below sm, where the row needs the width more than the
              reader needs the noun. */}
          <span className="font-mono text-[0.7rem] tracking-[0.04em] text-text-secondary [font-variant-numeric:tabular-nums]">
            {evidence.length}
            <span className="hidden sm:inline">
              {' '}
              {evidence.length === 1 ? 'receipt' : 'receipts'}
            </span>
          </span>
          <Chevron />
        </div>
      </summary>

      <div className="pb-6 pl-0 sm:pl-1">
        <p className="max-w-[64ch] leading-[1.75] text-text-secondary">
          {skill.used}
        </p>
        <ul
          className="mt-4 flex flex-wrap gap-2"
          role="list"
          aria-label={`Evidence for ${skill.name}`}
        >
          {evidence.map((item) => (
            <li key={`${item.kind}-${item.href}-${item.label}`}>
              <EvidenceLink item={item} />
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export default function Skills() {
  return (
    <section
      id="skills"
      className="mt-16 scroll-mt-24 border-t border-border pt-12"
    >
      <h2 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
        What I can do, and what proves it
      </h2>
      <p className="mt-3 max-w-[62ch] leading-[1.75] text-text-secondary">
        Nothing on this list is here because I have read about it. Each one came
        out of a build that needed it, and each one opens to what I made with it
        and something you can click. Most of those links go to the{' '}
        <Link
          href="/apps"
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          apps
        </Link>{' '}
        and the{' '}
        <Link
          href="/games"
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          arcade
        </Link>{' '}
        &mdash; those are not a separate showcase, they are the same evidence
        from a different angle. Every one of them took some of these skills to
        make.
      </p>

      {skillGroups.map((group, groupIndex) => (
        <div key={group.id} className="mt-12 first:mt-10">
          <h3 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            {group.name}
          </h3>
          <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
            {group.blurb}
          </p>
          <div className="mt-5 border-b border-border">
            {group.skills.map((skill, i) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                open={groupIndex === 0 && i === 0}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
