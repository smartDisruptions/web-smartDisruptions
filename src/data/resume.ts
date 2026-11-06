import { apps, GAME_SLUGS } from './apps';
import { builtHref } from './projects';
import { allSkills, type Evidence } from './skills';
import { marketStormReports } from './marketStorm';

/**
 * The résumé (/resume) — for someone deciding whether to hire me.
 *
 * It makes the same promise as the skills list it is built on
 * (`./skills.ts`): nothing here is claimed without something a stranger can
 * open. The skills themselves are not retyped — the page reads
 * `skillGroups` — so a skill rewritten there is rewritten here. What this
 * file adds is only what a hiring page needs on top:
 *
 *   - LENSES: "hiring for…" filters. Each one is a list of skill ids, so a
 *     link like /resume?for=ai opens the page already narrowed to the job.
 *   - CASE_STUDIES: the four builds worth a hiring manager's five minutes,
 *     each with the call I made that the AI could not.
 *   - EXPERIENCE: only what the site already says in public.
 *
 * `scripts/test-resume.mjs` holds it to that: every lens id resolves to a
 * real skill, every link is a published page or a real app, and nothing
 * points into the private knowledge base.
 */

export interface Lens {
  /** Used in the URL (?for=<id>), so keep it short and stable. */
  id: string;
  name: string;
  /** One line on what this kind of hire gets. */
  pitch: string;
  skills: string[];
}

export const LENSES: Lens[] = [
  {
    id: 'ai',
    name: 'AI & agent workflows',
    pitch:
      'Someone who already runs teams of agents in production work: written contracts, adversarial checks, and a human gate before anything ships.',
    skills: [
      'context-engineering',
      'multi-agent',
      'adversarial-verification',
      'directing-a-build',
      'graduated-autonomy',
      'generated-media',
      'idempotent-jobs',
      'design-audit',
    ],
  },
  {
    id: 'product',
    name: 'Product engineering',
    pitch:
      'Someone who works out what the person actually needs, ships it end to end, and cuts what does not earn its place.',
    skills: [
      'product-judgment',
      'directing-a-build',
      'client-work',
      'full-stack',
      'security',
      'design-systems',
      'accessibility',
      'writing',
    ],
  },
  {
    id: 'frontend',
    name: 'Front-end & interactive',
    pitch:
      'Someone who holds a phone to a frame budget, themes from tokens, and builds the games and 3D a brand page wants.',
    skills: [
      'design-systems',
      'accessibility',
      'design-audit',
      'simulation',
      'game-dev',
      'generated-media',
      'full-stack',
    ],
  },
  {
    id: 'fullstack',
    name: 'Full-stack & integrations',
    pitch:
      'Someone who wires real payment and business systems in, and checks them on the live site, not just in the code.',
    skills: [
      'full-stack',
      'payments',
      'oauth-connect',
      'hours-and-scheduling',
      'security',
      'production-debugging',
      'idempotent-jobs',
      'regression-tripwires',
    ],
  },
];

/** Every lens a skill belongs to, for its data-lens attribute. */
export function lensesFor(skillId: string): string[] {
  return LENSES.filter((l) => l.skills.includes(skillId)).map((l) => l.id);
}

/** How the work actually gets done. Each step names where it happened. */
export const LOOP = [
  {
    step: 'Write the spec',
    line: 'One written contract every agent works to. “Fast on an old phone” becomes a frame budget, not a hope.',
  },
  {
    step: 'Direct the team',
    line: 'Four to ten agents at once, each with a job: builders, a critic, QA, a code reviewer.',
  },
  {
    step: 'Check the real thing',
    line: 'The live URL, not the dashboard. A real card at a real food truck, not a test card.',
  },
  {
    step: 'Cut what doesn’t earn it',
    line: 'Ten image templates in, four kept. Working features removed because they weren’t honest.',
  },
  {
    step: 'Write it down',
    line: 'Every lesson goes where the next build will find it: a test, a rule, an article.',
  },
];

export interface CaseStudy {
  id: string;
  kicker: string;
  title: string;
  what: string;
  /** The call I made that the AI couldn't. The point of the card. */
  call: string;
  links: Evidence[];
}

const article = (slug: string, label: string): Evidence => ({
  kind: 'article',
  label,
  href: `/content/${slug}`,
});

const REPO =
  'https://github.com/smartDisruptions/web-smartDisruptions/blob/main';

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'samurai-kitchen',
    kicker: 'Client work · live since August 2026',
    title: 'Online ordering for a real food truck',
    what: 'Menu, prices, hours and sold-outs read live from the owner’s Square account. Real payments, checkout that locks when the truck closes, and an OAuth connect so no access key ever changed hands.',
    call: 'I deleted a loyalty panel that promised points nothing awarded, and a review funnel that sent happy customers to Google and unhappy ones to a private form. Both worked. Neither was honest.',
    links: [
      {
        kind: 'app',
        label: 'The build',
        href: builtHref('samurai-kitchen'),
      },
      {
        kind: 'site',
        label: 'samuraikitchencatering.com',
        href: 'https://samuraikitchencatering.com',
      },
      article(
        'food-truck-site-with-ai',
        'How it went, including what I didn’t ship'
      ),
    ],
  },
  {
    id: 'market-storm',
    kicker: 'AI research pipeline',
    title: 'Fourteen agents on one question',
    what: `A Stanford research method turned into a tool I run: perspectives that interview each other against live search, then fact-checkers. ${marketStormReports.length} published reports, each printing how many of its own claims survived.`,
    call: 'The checkers are told to disprove, not confirm. On the Microsoft report that changed the headline instead of adding a caveat.',
    links: [
      { kind: 'site', label: 'Market Storm', href: '/market-storm' },
      {
        kind: 'site',
        label: 'The report the check rewrote',
        href: '/market-storm/msft-q4-fy2026',
      },
    ],
  },
  {
    id: 'arcade',
    kicker: 'Games · built by agent teams',
    title: `${GAME_SLUGS.length} games, free in the browser`,
    what: 'Up to ten agents working side by side on one written contract per game. Physics solvers, simulated balance, original music and sound, and a phone frame budget.',
    call: 'When a game felt too hard, I had it measured before anything changed. Balance came from simulated rounds, not my own gut.',
    links: [
      { kind: 'site', label: 'The Arcade', href: '/games' },
      {
        kind: 'game',
        label: 'Rubble Rouser',
        href: builtHref('rubble-rouser'),
      },
    ],
  },
  {
    id: 'this-site',
    kicker: 'The site you’re on',
    title: 'A site that refuses to ship its own mistakes',
    what: 'A token design system in two themes, tests that block an article with missing images or a future date, and a scheduler that publishes on its own and merges its own pull request.',
    call: 'Automating the last step to production would be easy. I kept it a decision I make, because judgment is the part I keep.',
    links: [
      { kind: 'code', label: 'The design system', href: `${REPO}/DESIGN.md` },
      {
        kind: 'code',
        label: 'The rules every agent reads',
        href: `${REPO}/AGENTS.md`,
      },
      article(
        'five-of-six-failures-said-success',
        'Five of my six failures reported success'
      ),
    ],
  },
];

/** Only what the site already says in public. Dates are years. */
export const EXPERIENCE = [
  {
    when: '2026 – now',
    role: 'Independent builder',
    where: 'SmartDisruptions',
    line: `Websites, apps, games and research, built with Claude and written up in public. ${apps.length} things online so far.`,
  },
  {
    when: '2024 – now',
    role: 'Software engineer',
    where: 'A university',
    line: 'Financial aid systems, the arithmetic that isn’t allowed to be wrong, kept behind a regression test on every change.',
  },
  {
    when: 'Before 2024',
    role: 'Design and content',
    where: 'The same university',
    line: 'My first job there, and why the design half of this came first.',
  },
  {
    when: '2008',
    role: 'Started teaching myself to build',
    where: '',
    line: 'Self-taught, one build at a time.',
  },
];

/**
 * How to reach me, and what I'm looking for. Josh fills these in; until he
 * does, the section shows a note on previews and is left off production.
 */
export const CONTACT: { label: string; href: string } | null = null;
export const LOOKING_FOR: string | null = null;

/** The headline numbers. Derived, so they can't drift. */
export function resumeTotals() {
  return {
    skills: allSkills.length,
    things: apps.length,
    games: GAME_SLUGS.length,
  };
}
