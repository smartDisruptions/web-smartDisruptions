import { apps } from './apps';

/**
 * The skills on the About page, and the work that proves each one.
 *
 * ONE RULE, AND IT IS THE WHOLE POINT: a skill only appears here if there is
 * something a stranger can open that shows it being used. No aspirations, no
 * "familiar with", no self-assessed levels. If the receipts are not there, the
 * skill is not on the page — and the fix is to build something, not to soften
 * the wording.
 *
 * `scripts/test-skills.mjs` enforces it: every skill needs at least one piece
 * of evidence, every app slug has to resolve in `apps.ts`, and every article
 * has to be genuinely published (not staged, which renders on previews and
 * 404s on the live site).
 *
 * Apps are referenced BY SLUG rather than by URL, so the label and the link
 * are derived from `apps.ts` at build time. Rename an app and this follows.
 * That also means the /apps gallery and the arcade are not a separate showcase
 * sitting off to one side — they are the evidence, wired in directly.
 */

export type EvidenceKind =
  | 'app' // something running, on the /apps gallery
  | 'game' // an arcade cabinet — same gallery, different room
  | 'article' // a piece of writing about the work
  | 'site' // a live site or section
  | 'code'; // a file in a public repository

export interface Evidence {
  kind: EvidenceKind;
  label: string;
  href: string;
  /** A few words on what this particular link shows. */
  detail?: string;
}

export interface Skill {
  id: string;
  /** The term. Carries the credibility. */
  name: string;
  /**
   * The plain-language line, shown collapsed.
   *
   * Most people who land here do not have the vocabulary yet, and the term on
   * its own is a wall. This sentence is the one that has to work for them.
   */
  plain: string;
  /** Where it actually got used. Revealed on expand, first person, concrete. */
  used: string;
  /** App slugs from `apps.ts`. Resolved to links at build time. */
  apps?: string[];
  /** Everything that is not an app. */
  links?: Evidence[];
}

export interface SkillGroup {
  id: string;
  name: string;
  blurb: string;
  skills: Skill[];
}

const SITE = 'https://smartdisruptions.com';
const REPO =
  'https://github.com/smartDisruptions/web-smartDisruptions/blob/main';

const article = (slug: string, label: string, detail?: string): Evidence => ({
  kind: 'article',
  label,
  href: `/content/${slug}`,
  detail,
});

export const skillGroups: SkillGroup[] = [
  {
    id: 'ai',
    name: 'Working with AI',
    blurb:
      'Three years in, almost none of this is prompting any more. Each one came out of a build that needed it.',
    skills: [
      {
        id: 'context-engineering',
        name: 'Context engineering',
        plain:
          'Designing what the model knows before it is asked anything — the file it reads first, and what that file points at.',
        used: 'I got tired of re-explaining who I am at the start of every session, so I built a linked knowledge base with a documented retrieval policy: every note describes itself, and one command returns the whole map. Every AI session I run reads it first, on my laptop, in the cloud, and on my phone. I tested it cold once and it answered six of ten questions from the notes alone, citing where each answer came from — and the four it missed were things I had genuinely never written down.',
        links: [
          article(
            'stop-re-explaining-yourself-to-ai',
            'I stopped re-explaining myself to my AI',
            'the whole story, including the cold-start score'
          ),
          {
            kind: 'code',
            label: 'The instruction file that runs this site',
            href: `${REPO}/AGENTS.md`,
            detail: 'the same idea, applied to a codebase instead of a life',
          },
        ],
      },
      {
        id: 'multi-agent',
        name: 'Multi-agent orchestration',
        plain:
          'Splitting one question across parallel agents with different angles, then synthesising what comes back.',
        used: 'I turned a research method Stanford published into a tool I can invoke. It runs fourteen agents on one question — five perspectives interviewing each other against live search, then eight fact-checkers — and I pointed it at company earnings. Every report on the Market Storm section came out of it, and each one prints how many of its own claims survived checking.',
        links: [
          {
            kind: 'site',
            label: 'Market Storm',
            href: '/market-storm',
            detail: 'five reports, all produced by the pipeline',
          },
          {
            kind: 'site',
            label: 'A report, with its verification ledger',
            href: '/market-storm/msft-q4-fy2026',
            detail: 'confirmed / partly true / corrected, counted on the page',
          },
        ],
      },
      {
        id: 'adversarial-verification',
        name: 'Adversarial verification',
        plain:
          'A finding does not count until independent agents have tried to prove it wrong.',
        used: 'A model asked to check its own work agrees with itself, so the instruction has to be to refute, and the agents have to be different ones. On the Microsoft report it changed the headline rather than adding a caveat: the widely repeated line was that capex doubled while free cash flow stayed positive, and free cash flow had actually fallen. I have also run it on my own finished research and lost — seven of eight load-bearing claims came back corrected, and I shipped the corrections.',
        links: [
          {
            kind: 'site',
            label: 'The report whose headline the check rewrote',
            href: '/market-storm/msft-q4-fy2026',
          },
          article(
            'a-pipeline-with-no-server',
            'A pipeline with no server',
            'how the automated half of this fits together'
          ),
        ],
      },
      {
        id: 'directing-a-build',
        name: 'Directing a build, and rejecting the output',
        plain:
          'Asking for work, then measuring whether it was any good instead of accepting it because it looks finished.',
        used: 'I asked for ten image templates and kept four. What settled it was rendering both versions side by side rather than arguing about them, and measuring an instinct instead of acting on it — I thought the type would look wrong on a phone, and measuring showed a card renders at 341 pixels there, where 69% of the words were unreadable. The six I cut had each cleared a quality bar the AI wrote for itself.',
        links: [
          {
            kind: 'code',
            label: 'The image generator and its four templates',
            href: `${REPO}/scripts/make-hero.mjs`,
            detail: 'including the written reasoning for the cut',
          },
          {
            kind: 'site',
            label: 'The images, in both themes',
            href: '/content',
          },
        ],
      },
      {
        id: 'graduated-autonomy',
        name: 'Graduated autonomy',
        plain:
          'Every scheduled agent has a trust level. They reach a test build and hand me a pull request; production is a decision I make.',
        used: "I run scheduled agents with names and job descriptions — one tidies the knowledge base nightly, one sweeps it weekly, one drafts the day's writing before I wake up. The ceiling is deliberate. Making that last step automatic would be easy and I do not want it, because judgment is the part I keep.",
        links: [
          article(
            'took-it-apart-and-built-it-again',
            'I built my own dashboard, then took it apart',
            'why the thing that watches cannot live inside the thing it watches'
          ),
          article(
            'what-ai-handed-back',
            'What my AI handed back',
            'where the line between us actually falls'
          ),
        ],
      },
    ],
  },

  {
    id: 'engineering',
    name: 'Engineering',
    blurb:
      'Self-taught since 2008, an engineer by title since 2024. These are the ones with something running at the end of them.',
    skills: [
      {
        id: 'full-stack',
        name: 'Full-stack product build',
        plain:
          'Taking something from an idea to a working product other people can open — interface, data, deployment, the lot.',
        used: 'Most of what is in the gallery is this: a restaurant platform with a menu, a cart and a checkout; a journalling app wired to a language model; a focus timer with session analytics, a twelve-week heatmap and an achievement system. Different problems, same loop.',
        apps: ['samurai-kitchen', 'ai-diary', 'pomodoro-timer'],
      },
      {
        id: 'payments',
        name: 'Payments and third-party APIs',
        plain:
          'Wiring a real commercial system — a payment provider, a live product catalogue — into a product that handles money.',
        used: "I built ordering for a friend's catering business against his real Square catalogue rather than a copy in the codebase, because his kiosk already runs on it and any second copy is one that goes stale. That meant full support for his customisations — twenty-two modifier lists, with the prices resolved on the server so the browser cannot name its own.",
        apps: ['samurai-kitchen'],
        links: [
          article(
            'food-truck-site-with-ai',
            "I built my friend's food truck site with AI",
            'what actually happened, including what I did not ship'
          ),
        ],
      },
      {
        id: 'security',
        name: 'Security auditing and hardening',
        plain:
          "Going looking for the hole before someone else finds it, and reading a platform's defaults literally instead of trusting what they are called.",
        used: 'Before publishing an article about my own tools I stopped and asked whether they could be attacked, and found my live task list — forty-three items — being served to anyone with the URL. I closed it in about sixty seconds with a reversible fix, then built the proper gate, and only restored the data after watching production actually deny the request. On the restaurant checkout, an audit nobody asked for found the server taking the charge amount from the browser.',
        links: [
          article(
            'my-private-task-list-was-public',
            'I found my own task list on the open internet'
          ),
          article(
            'i-tried-to-break-my-friends-ai-site',
            "I tried to break my friend's AI-built site",
            'and deleted the hole instead of patching it'
          ),
        ],
      },
      {
        id: 'production-debugging',
        name: 'Debugging what only breaks in production',
        plain:
          'Finding a fault that cannot be reproduced on your own machine, by reasoning about where the code actually runs.',
        used: 'An order total read $0.00 on the deployed build and was correct locally every time. My machine runs one long-lived process; the deployed one does not share memory between requests, and the mock state was sitting in it. Same category as a ten-minute build hang that turned out to be pages calling a live API while they were being built.',
        apps: ['samurai-kitchen'],
        links: [
          article(
            'my-dashboard-said-published',
            'My dashboard said published. The URL said 404.',
            'the same lesson in a different disguise'
          ),
        ],
      },
      {
        id: 'idempotent-jobs',
        name: 'Automation that survives its own failure',
        plain:
          'Any job that can half-finish has to look for its own wreckage before it looks for new work.',
        used: 'Teaching a scheduler to publish without me took six failures, and five of them reported success. The worst flipped an article halfway, failed, and then went invisible to every later run because it was no longer due — reporting "nothing to do" over a permanently stuck state. The fix was a reconcile pass. It now opens and merges its own pull request with nobody watching.',
        links: [
          article(
            'five-of-six-failures-said-success',
            'Five of my six failures reported success'
          ),
          article('a-pipeline-with-no-server', 'A pipeline with no server'),
        ],
      },
      {
        id: 'regression-tripwires',
        name: 'Regression tripwires',
        plain:
          'A cheap test that always runs, fenced around the part that must not change, so everything else can move fast.',
        used: 'At work this guards financial aid arithmetic — twenty-three assertions on every single change, because that is the part which is not allowed to be wrong. The same pattern runs on this site: a test refuses an article dated in the future, and another one refuses to ship a post with missing images, which immediately found two already-published posts with no social card.',
        links: [
          {
            kind: 'code',
            label: 'The tests that guard this site',
            href: `${REPO}/scripts/test-posts.mjs`,
          },
        ],
      },
      {
        id: 'simulation',
        name: 'Physics, canvas and real-time rendering',
        plain:
          'Maths that has to hold up sixty times a second — orbital mechanics, cloth, collisions.',
        used: 'A Mars transfer simulation that models a real Hohmann transfer window, and a cloth simulator running Verlet integration with constraint relaxation and tearing. Both are hand-written on a canvas with no engine underneath, which is the only way I would have learned what the maths actually does.',
        apps: ['spacex-mars', 'cloth-simulator'],
      },
      {
        id: 'game-dev',
        name: 'Game development',
        plain:
          'Game loops, collision, input, audio and the feel work that separates a demo from something worth playing.',
        used: "The arcade is six cabinets. The Pembroke File is the one I would point at first: a five-act mystery where every clue is an artifact you pick up and read, sliding-block and 8-puzzle boards generated and difficulty-checked by breadth-first search, Verlet chain physics on the wires, and a pencil-rubbing canvas where the answer is never drawn — only revealed by shading around it. Two of the cabinets are my son's.",
        apps: ['field-office', 'aureum-snake', 'grove'],
        links: [
          {
            kind: 'site',
            label: 'The arcade',
            href: '/games',
            detail: 'all six, playable in the browser',
          },
        ],
      },
    ],
  },

  {
    id: 'design',
    name: 'Design and product',
    blurb:
      'Design and content was my first job at a university, before engineering. It is the half of this I had a head start on.',
    skills: [
      {
        id: 'design-systems',
        name: 'Design systems and theming',
        plain:
          'One set of named colours the whole site reads from, so a single switch re-themes everything without hunting for stragglers.',
        used: 'This site runs on semantic tokens rather than colour values scattered through components, which is what makes dark mode a switch instead of a rewrite. The palette is deliberately warm charcoal rather than black, because cold black would throw away the identity the light theme has.',
        links: [
          {
            kind: 'code',
            label: 'The design system, written down',
            href: `${REPO}/DESIGN.md`,
            detail: 'every rule that is a decision rather than a default',
          },
          { kind: 'site', label: 'The site itself', href: `${SITE}` },
        ],
      },
      {
        id: 'accessibility',
        name: 'Accessibility as a constraint that improves the design',
        plain:
          'Holding every colour to a contrast standard in both themes — and letting that push the design somewhere better.',
        used: "The arcade's bright red, yellow and blue fail contrast on a paper background, so every text use points at a darker ink. In dark mode those inks flip to the bright neon, which pops on the dark cabinet. A light-mode constraint turned into a dark-mode feature — the rule made it better rather than duller.",
        links: [
          {
            kind: 'code',
            label: 'The ink flip, and why it exists',
            href: `${REPO}/DESIGN.md`,
          },
          { kind: 'site', label: 'The arcade, in both themes', href: '/games' },
        ],
      },
      {
        id: 'design-audit',
        name: 'Keeping AI-built work from looking AI-built',
        plain:
          'Running a rule-based auditor over finished pages, and writing down every place I decided it was wrong.',
        used: 'The first sweep lit up with every generated tell I had reached for by instinct: coloured rails on cards, tinted sub-panels, cramped table frames. I reworked each into plain headings, dividers and coloured text. Where the tool was wrong I overruled it by name, in writing, scoped so the same pattern elsewhere still gets caught — no suppression without a reason, and "intentional" is not a reason.',
        links: [
          {
            kind: 'code',
            label: 'How the audit runs, and what I overruled',
            href: `${REPO}/docs/impeccable.md`,
          },
        ],
      },
      {
        id: 'product-judgment',
        name: 'Finding the real constraint behind a request',
        plain:
          'Working out what someone actually needs, which is often not the feature they asked for.',
        used: 'I asked for my task board to be drag-reorderable and it already was. The real gap was different: card order lived only in each device\'s storage, so "make it draggable" and "set the order for me from somewhere else" were never the same feature, and only one of them was missing. Same instinct that turned "it flings when I drag slowly" into a diagnosis rather than a patch.',
        links: [
          article(
            'six-prompts-one-day',
            'I put an app on my home screen in a day',
            'the six prompts, and which three stood on earlier work'
          ),
        ],
      },
    ],
  },

  {
    id: 'shipping',
    name: 'Shipping and teaching',
    blurb:
      'The half that is not building. It took me longest and it is the part that actually compounds.',
    skills: [
      {
        id: 'client-work',
        name: 'Building for a real client',
        plain:
          'Their constraints, their data, their sign-off — and the parts you decide not to ship.',
        used: 'Robert has been a friend since high school and runs a Japanese catering business. Two calls on that job were mine rather than technical: I deleted a loyalty panel that promised points nothing awarded, and removed a review funnel that routed happy customers to Google and unhappy ones to a private form. Both were working features. Neither was honest.',
        apps: ['samurai-kitchen'],
        links: [
          {
            kind: 'site',
            label: 'samuraikitchencatering.com',
            href: 'https://samuraikitchencatering.com',
            detail: 'his live site',
          },
        ],
      },
      {
        id: 'writing',
        name: 'Writing in public',
        plain:
          'Publishing how the work actually went, including the parts where I was wrong.',
        used: 'Eleven articles so far, all about my own builds, and the ones people respond to are the ones where something broke. The rule I write to is receipts over claims: if I cannot point at the thing, I do not say it.',
        links: [
          {
            kind: 'site',
            label: 'Everything I have written',
            href: '/content',
          },
          article(
            'you-dont-get-replaced-for-being-slow',
            "You don't get replaced for being slow"
          ),
        ],
      },
      {
        id: 'teaching',
        name: 'Teaching the loop to someone else',
        plain:
          'Handing over the method rather than the finished thing — the test being whether they can do it again without you.',
        used: 'My son wanted to make a game. I could have built it for him, and instead I taught him the loop: describe it, get something playable, look at it, ask for the next thing. He built a kart racer — his features, drive-over powerups and coins that make you faster — and then a second game on his own, which is the part that shows it transferred. The hard bit is not taking the keyboard.',
        apps: ['pebble-kart', 'grove'],
        links: [
          {
            kind: 'site',
            label: 'His cabinets in the arcade',
            href: '/games',
          },
        ],
      },
    ],
  },
];

/* ── Derived ────────────────────────────────────────────────────────────── */

export interface ResolvedEvidence extends Evidence {
  /** True for same-site paths, which route through next/link. */
  internal: boolean;
}

const appBySlug = new Map(apps.map((a) => [a.slug, a]));

/** Arcade cabinets, so an app can be labelled as a game rather than a tool. */
const ARCADE = new Set([
  'field-office',
  'cloth-simulator',
  'grove',
  'broom-blade',
  'pebble-kart',
  'aureum-snake',
]);

/**
 * Everything that backs one skill, apps first.
 *
 * The apps come from `apps.ts` rather than being retyped here, so the gallery
 * and this page can never disagree about what something is called.
 */
export function evidenceFor(skill: Skill): ResolvedEvidence[] {
  const fromApps: ResolvedEvidence[] = (skill.apps ?? []).flatMap((slug) => {
    const app = appBySlug.get(slug);
    if (!app) return [];
    return [
      {
        kind: ARCADE.has(slug) ? ('game' as const) : ('app' as const),
        label: app.name,
        href: `/apps/${app.slug}`,
        detail: app.techStack.slice(0, 3).join(' · '),
        internal: true,
      },
    ];
  });

  const rest: ResolvedEvidence[] = (skill.links ?? []).map((l) => ({
    ...l,
    internal: l.href.startsWith('/'),
  }));

  return [...fromApps, ...rest];
}

export const allSkills: Skill[] = skillGroups.flatMap((g) => g.skills);

/** The counts printed above the list. Derived, so they cannot drift. */
export function skillTotals() {
  const evidence = allSkills.flatMap(evidenceFor);
  return {
    skills: allSkills.length,
    apps: apps.length,
    games: ARCADE.size,
    receipts: new Set(evidence.map((e) => e.href)).size,
  };
}
