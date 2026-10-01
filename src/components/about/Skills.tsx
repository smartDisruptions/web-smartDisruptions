import type { CSSProperties } from 'react';
import Link from 'next/link';
import { IconArrowRight, IconExternal } from '@/components/icons';
import {
  evidenceFor,
  skillGroups,
  skillTotals,
  type EvidenceKind,
  type ResolvedEvidence,
  type Skill,
} from '@/data/skills';

/**
 * The skills section on /about, with its evidence folded in. Styles live in
 * src/app/about/about.css (ab-sk-*, ab-rc-*).
 *
 * WHY NATIVE <details> AND NOT A REACT ACCORDION
 * Every row here is server-rendered HTML. There is no state, no hydration and
 * no client bundle — opening a row is the browser doing what it already does,
 * which is why it is instant on a phone on a bad connection. An accordion is
 * the one interaction pattern the platform gives away for free, and taking it
 * would have meant shipping JavaScript to reproduce something that already
 * works, including the keyboard and screen-reader behaviour — and find-in-page,
 * which opens a closed row to show a match.
 *
 * The smooth open is CSS too: `::details-content` animating to `height: auto`
 * through `interpolate-size`. Where that isn't supported the row just opens.
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
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/** One receipt: something a stranger can open. */
function Receipt({ item }: { item: ResolvedEvidence }) {
  const body = (
    <>
      <span className="ab-rc-kind">{kindLabel[item.kind]}</span>
      <span className="ab-rc-text">
        <span className="ab-rc-label">{item.label}</span>
        {item.detail && (
          <span className="ab-rc-detail">
            <span className="sr-only">&mdash; </span>
            {item.detail}
          </span>
        )}
      </span>
      <span className="ab-rc-go" aria-hidden>
        {item.internal ? (
          <IconArrowRight size={16} />
        ) : (
          <IconExternal size={16} />
        )}
      </span>
    </>
  );

  // Internal paths route through next/link for the client-side transition;
  // anything off-site opens in a new tab so the page is not lost.
  return item.internal ? (
    <Link href={item.href} className="ab-rc" data-kind={item.kind}>
      {body}
    </Link>
  ) : (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="ab-rc"
      data-kind={item.kind}
    >
      {body}
      <span className="sr-only"> (opens in a new tab)</span>
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
    <details id={skill.id} open={open} className="ab-sk">
      <summary>
        <div className="ab-sk-term">
          <h4>{skill.name}</h4>
          <p>{skill.plain}</p>
        </div>
        <div className="ab-sk-meta">
          {/* Labelled, because a bare numeral beside a chevron reads as a
              footnote marker rather than a count of things to click. The word
              drops below sm, where the row needs the width more than the
              reader needs the noun. */}
          <span className="ab-sk-count">
            {evidence.length}
            <span className="hidden sm:inline">
              {' '}
              {evidence.length === 1 ? 'receipt' : 'receipts'}
            </span>
          </span>
          <span className="ab-sk-chev">
            <Chevron />
          </span>
        </div>
      </summary>

      <div className="ab-sk-body">
        <p className="ab-sk-used font-read">{skill.used}</p>
        <ul
          className="ab-sk-receipts"
          role="list"
          aria-label={`Evidence for ${skill.name}`}
        >
          {evidence.map((item, i) => (
            <li
              key={`${item.kind}-${item.href}-${item.label}`}
              style={{ '--i': i } as CSSProperties}
            >
              <Receipt item={item} />
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export default function Skills() {
  const totals = skillTotals();
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section id="skills" className="ab-sec" aria-labelledby="skills-title">
      <div className="ab-sec-head">
        <p className="sd-kicker">Skills, with receipts</p>
        <h2 id="skills-title" className="ab-sec-title font-display">
          What I can do, and what proves it
        </h2>
      </div>

      <div className="ab-sk-intro sd-sheet sd-reveal">
        <p className="font-read">
          Nothing on this list is here because I have read about it. Each one
          came out of a build that needed it, and each one opens to what I made
          with it and something you can click. Most of those links go to the{' '}
          <Link href="/built">apps</Link> and the{' '}
          <Link href="/games">arcade</Link> — those are not a separate showcase,
          they are the same evidence from a different angle. Every one of them
          took some of these skills to make.
        </p>
        {/* Counted from the data (skillTotals), so it cannot drift. */}
        <dl className="ab-sk-tally">
          <div>
            <dt>Skills</dt>
            <dd>{totals.skills}</dd>
          </div>
          <div>
            <dt>Receipts to open</dt>
            <dd>{totals.receipts}</dd>
          </div>
          <div>
            <dt>Apps &amp; games</dt>
            <dd>{totals.apps}</dd>
          </div>
        </dl>
      </div>

      <div className="ab-sk-groups">
        {skillGroups.map((group, groupIndex) => (
          <div key={group.id} className="ab-sk-group sd-sheet">
            <div className="ab-sk-head">
              <p className="ab-sk-num" aria-hidden>
                {pad(groupIndex + 1)} / {pad(skillGroups.length)}
              </p>
              <h3 className="ab-sk-name font-display">{group.name}</h3>
              <p className="ab-sk-blurb">{group.blurb}</p>
            </div>
            <div className="ab-sk-rows">
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
      </div>
    </section>
  );
}
