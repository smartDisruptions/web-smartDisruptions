import { apps, GAME_SLUGS } from './apps';
import { builtHref, projects } from './projects';

/**
 * The résumé (/resume): a portfolio first, a résumé underneath.
 *
 * Rebuilt 2026-11-06 on Josh's word. The first version led with 22 skill
 * names and long stories behind each one; he read it and said it didn't
 * look or feel like a résumé, and that an employer doesn't care about that
 * kind of jumble. What a hiring manager is actually asking, in order:
 *
 *   1. What can you build?            → CAPABILITIES, in plain job words
 *   2. Show me.                       → FEATURED, four deep dives you can open
 *   3. How much range?                → the gallery (everything else, live)
 *   4. Can I trust AI-built work?     → HOW_I_BUILD (spec, agents, tests, me)
 *   5. The usual résumé facts.        → EXPERIENCE and SKILLS
 *
 * Every line says what I did with a verb ("Connected", "Designed") and
 * every claim links to something running. Facts come from this repo's own
 * records (apps.ts, projects.ts, the build write-ups), never widened.
 *
 * `scripts/test-resume.mjs` checks the links resolve, the images exist, and
 * nothing points into the private knowledge base.
 */

export interface ProofLink {
  label: string;
  href: string;
}

/** The Net Price Calculator, live on the University of Idaho's own server. */
const NPC = 'https://banner.uidaho.edu/net-price-calculator/index.html';

/* ── 1. What I can build ───────────────────────────────────────────────── */

export interface Capability {
  id: string;
  title: string;
  /** What an employer gets, in one plain sentence, first person. */
  line: string;
  proof: ProofLink[];
}

export const CAPABILITIES: Capability[] = [
  {
    id: 'commerce',
    title: 'Online ordering and payments',
    line: 'I connected a real food truck’s Square account through OAuth, so its site takes card payments with the menu, prices and stock read live from the till.',
    proof: [
      { label: 'Samurai Kitchen', href: 'https://samuraikitchencatering.com' },
      {
        label: 'Moonbowl Ramen (ordering demo)',
        href: 'https://web-moonbowl.vercel.app',
      },
    ],
  },
  {
    id: 'data',
    title: 'Databases and back ends',
    line: 'I designed the Postgres database behind the food truck’s orders and encrypted payment tokens, and the Supabase back end that keeps one family’s game in sync on every phone.',
    proof: [
      {
        label: 'How Samurai Kitchen is built',
        href: builtHref('samurai-kitchen'),
      },
      { label: 'How Broom & Blade is built', href: builtHref('broom-blade') },
    ],
  },
  {
    id: 'dashboards',
    title: 'Calculators and dashboards for real decisions',
    line: 'I built the University of Idaho’s Net Price Calculator on the federal aid formula, and turned 953 of a food truck’s orders into a ranked plan of what to try next.',
    proof: [
      { label: 'Net Price Calculator', href: NPC },
      {
        label: 'Insights demo',
        href: '/demo/moonbowl-insights',
      },
      { label: 'Portfolio Ledger demo', href: '/demo/portfolio-ledger' },
    ],
  },
  {
    id: 'games',
    title: 'Games people can play',
    line: `I designed and built ${GAME_SLUGS.length} browser games, from 3D flight over a real round planet to physics demolition. All of them are free to play right now.`,
    proof: [
      { label: 'The Arcade', href: '/games' },
      { label: 'Rubble Rouser', href: '/games/rubble-rouser' },
      { label: 'Cosmo Outbound', href: '/games/cosmo-outbound' },
    ],
  },
  {
    id: 'brand',
    title: 'Websites for brands',
    line: 'I build launch pages and small-business sites that load fast on an old phone and are built to convert, from a 3D drink can to a barbershop’s booking page.',
    proof: [
      { label: 'VOLTIC', href: 'https://web-voltic.vercel.app' },
      { label: 'Gilt & Lather', href: '/demo/gilt-and-lather' },
      { label: 'This site', href: '/' },
    ],
  },
  {
    id: 'ai',
    title: 'AI systems and automation',
    line: 'I built a research pipeline of fourteen AI agents: some investigate a question from different angles, the rest try to disprove every finding. Plus a publishing pipeline that ships on its own.',
    proof: [
      { label: 'Market Storm', href: '/market-storm' },
      {
        label: 'A pipeline with no server',
        href: '/content/a-pipeline-with-no-server',
      },
    ],
  },
];

/* ── 2. Featured work ──────────────────────────────────────────────────── */

export interface Featured {
  id: string;
  /** Client work, my own product, a practice build: said plainly. */
  context: string;
  title: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  problem: string;
  /** What I did, each starting with a verb. */
  built: string[];
  result: string;
  stack: string[];
  links: ProofLink[];
}

export const FEATURED: Featured[] = [
  {
    id: 'net-price-calculator',
    context: 'Day job · University of Idaho · live for 2026–27',
    title: 'The University of Idaho’s Net Price Calculator',
    image: '/images/websites/net-price-calculator.webp',
    imageAlt:
      'The University of Idaho Net Price Calculator results screen: an estimated net price of $15,616 a year, from a $30,791 cost of attendance less $15,175 in gift aid.',
    imageWidth: 1200,
    imageHeight: 750,
    problem:
      'Every U.S. college that takes federal student aid has to offer one. Families want an honest answer to “what will this actually cost us?”, and the answer depends on a federal aid formula that changes every year.',
    built: [
      'Built the whole estimator as one page that runs in the browser: academics, family situation and finances in three short steps, a net price in about three minutes.',
      'Implemented the federal 2026–27 Student Aid Index formula from the official guide, for dependent students and both kinds of independent student, then the Pell Grant and need-based aid that follow from it.',
      'Turned the university’s scholarship rules into code: Go Idaho merit tiers by GPA, National Merit, Western Undergraduate Exchange awards for 20 states and territories, and transfer awards.',
      'Kept the aid math behind a 23-check regression test that had to pass after every change, so no edit to the screens could quietly change what a family is told.',
      'Designed it for privacy: answers stay on the device, it never asks for a name or Social Security number, and a shared link carries only academic answers, never income.',
    ],
    result:
      'Live on the university’s website for the 2026–27 award year. It loads as one file from the university’s own server, with no outside requests.',
    stack: [
      'JavaScript',
      'HTML and CSS',
      'Federal aid formula (SAI)',
      'jsdom tests',
      'Accessibility',
    ],
    links: [
      { label: 'Try the calculator', href: NPC },
      { label: 'How it’s built', href: builtHref('net-price-calculator') },
    ],
  },
  {
    id: 'samurai-kitchen',
    context: 'Client work · live since August 2026',
    title: 'Online ordering and payments for a real food truck',
    image: '/images/websites/samurai-kitchen.webp',
    imageAlt:
      'The Samurai Kitchen website, showing catering and online ordering.',
    imageWidth: 1200,
    imageHeight: 750,
    problem:
      'The truck’s old site couldn’t take an order. Every catering request arrived as an email, and nobody could pay online.',
    built: [
      'Connected the owner’s Square account through OAuth, so the site takes real card payments and no access key ever changed hands.',
      'Read the menu, prices, hours and sold-out items live from his till, refreshed every minute, so the site never goes out of date.',
      'Designed a Postgres database for the encrypted Square tokens and every order, with a read-only role so the reporting app can read it but never change it.',
      'Locked checkout outside opening hours, then audited the live site and hardened the payment routes with rate limits and security headers.',
    ],
    result:
      'Taking real orders on the truck’s own domain since August 2026. If the truck is closed when you visit, checkout says so: that’s the hours lock working.',
    stack: [
      'Next.js',
      'TypeScript',
      'Square API',
      'OAuth 2.0',
      'Postgres',
      'Vercel',
    ],
    links: [
      { label: 'Open the site', href: 'https://samuraikitchencatering.com' },
      { label: 'How it’s built', href: builtHref('samurai-kitchen') },
      { label: 'The story', href: '/content/food-truck-site-with-ai' },
    ],
  },
  {
    id: 'broom-blade',
    context: 'My own product · used by my family',
    title: 'A chore app that turns housework into a game',
    image: '/images/apps/broom-blade-1.webp',
    imageAlt:
      'The Broom & Blade chore board, showing the day’s chores as quests with rewards beside them.',
    imageWidth: 1200,
    imageHeight: 753,
    problem:
      'Getting kids to do chores. I turned the family’s chore list into a role-playing game they want to play.',
    built: [
      'Designed the Supabase back end: one family board shared across every phone, joined with a code instead of accounts.',
      'Built the game systems: points and ranks, a gear shop, 67 earnable items with their own stories, and a parent’s approval before any chore pays out.',
      'Made it install on a phone like any app, with every sound generated by the app itself, so there’s nothing to download.',
      'Built its website too, with no image files at all: the whole scene is drawn by the page, in 81 KB.',
    ],
    result:
      'My family uses it, and any other family can open their own board with a code.',
    stack: ['JavaScript', 'Supabase', 'Postgres', 'PWA', 'SVG', 'Web Audio'],
    links: [
      { label: 'Try the app', href: 'https://broom-blade.vercel.app' },
      { label: 'See the website', href: 'https://web-broom-blade.vercel.app' },
      { label: 'How it’s built', href: builtHref('broom-blade') },
    ],
  },
  {
    id: 'rubble-rouser',
    context: 'Game · free to play',
    title: 'A 3D physics demolition game',
    image: '/images/apps/rubble-rouser-thumbnail.webp',
    imageAlt:
      'Rubble Rouser: a rocket launcher aimed at a building of timber, brick and steel.',
    imageWidth: 1200,
    imageHeight: 630,
    problem:
      'Forty buildings that have to stand and fall the way real ones would, in a browser, on a phone.',
    built: [
      'Built a structural solver: weight has to reach the ground through what’s left, so a building falls the way it’s built.',
      'Ran the build with AI agents working side by side: the engine first, then five level builders at a time.',
      'Put the forty levels in order by measuring how easily each one falls, firing at random eight times each, instead of judging by eye.',
      'Generated every texture, sound and building in the browser as it loads, in one file of about 3.4 MB.',
    ],
    result: `One of ${GAME_SLUGS.length} games in the Arcade, all playable right now.`,
    stack: ['three.js', 'WebGL', 'Rapier physics', 'WebAssembly', 'Web Audio'],
    links: [
      { label: 'Play it', href: '/games/rubble-rouser' },
      { label: 'How it’s built', href: builtHref('rubble-rouser') },
      { label: 'The whole Arcade', href: '/games' },
    ],
  },
  {
    id: 'voltic',
    context: 'Brand website · practice build',
    title: 'A product launch page with a real 3D can',
    image: '/images/websites/voltic.webp',
    imageAlt:
      'The VOLTIC website. A black energy drink can lit in blue and green, covered in water droplets.',
    imageWidth: 1200,
    imageHeight: 750,
    problem:
      'A launch page for an energy drink I made up, built to find out how good I could make one.',
    built: [
      'Built the can as a live 3D model that turns as you scroll and spins when you grab it.',
      'Typed the label and nutrition panel as real text, because AI images get small print wrong.',
      'Generated every other image with AI under a hard budget written into the code.',
      'Added an automatic accessibility check at six points down the page that blocks the release if anything fails.',
    ],
    result:
      'Zero accessibility problems on the automatic check, and the page that draws it is 33 KB.',
    stack: [
      'three.js',
      'WebGL',
      'AI image generation',
      'Accessibility testing',
    ],
    links: [
      { label: 'Open the site', href: 'https://web-voltic.vercel.app' },
      { label: 'How it’s built', href: builtHref('voltic') },
    ],
  },
];

/* ── 3. Everything else, live ──────────────────────────────────────────── */

export type WorkKind = 'Website' | 'App' | 'Game';

export interface WorkCard {
  id: string;
  kind: WorkKind;
  name: string;
  line: string;
  image: string;
  imageAlt: string;
  href: string;
  more?: string;
}

const FEATURED_IDS = new Set(FEATURED.map((f) => f.id));
const GAMES = new Set<string>(GAME_SLUGS);

/** Websites with a write-up, minus the featured ones and this site's old look. */
const siteCards: WorkCard[] = projects
  .filter((p) => !FEATURED_IDS.has(p.slug) && p.slug !== 'notebook')
  .map((p) => {
    const part = p.parts.find((x) => x.kind === 'Website') ?? p.parts[0];
    return {
      id: p.slug,
      kind: 'Website' as const,
      name: p.name,
      line: p.summary,
      image: p.image,
      imageAlt: p.imageAlt,
      href: part.href,
      more: `/built/${p.slug}`,
    };
  });

/**
 * Apps and games from the gallery, minus the featured ones and anything
 * not actually live. The cloth simulator sits in the Arcade, but to an
 * employer it's an app, so it's listed by what it is.
 */
const appCards: WorkCard[] = apps
  .filter((a) => !FEATURED_IDS.has(a.slug) && a.status === 'live' && a.liveUrl)
  .filter((a) => a.slug !== 'samurai-kitchen')
  .map((a) => ({
    id: a.slug,
    kind:
      GAMES.has(a.slug) && a.category !== 'Simulation'
        ? ('Game' as const)
        : ('App' as const),
    name: a.name,
    line: a.description,
    image: a.thumbnailUrl,
    imageAlt: `${a.name}.`,
    href: a.liveUrl as string,
    more: builtHref(a.slug),
  }));

export const GALLERY: WorkCard[] = [...siteCards, ...appCards];

/* ── 4. How I build with AI ────────────────────────────────────────────── */

export const HOW_I_BUILD: { title: string; line: string; proof?: ProofLink }[] =
  [
    {
      title: 'I write the spec first',
      line: 'One written contract every agent builds to. “Fast on an old phone” becomes a frame budget, not a hope.',
      proof: {
        label: 'The rules every agent on this site reads',
        href: 'https://github.com/smartDisruptions/web-smartDisruptions/blob/main/AGENTS.md',
      },
    },
    {
      title: 'I run a team of AI agents',
      line: 'Four to ten at once, each with one job: builders, a critic, a tester and a code reviewer.',
    },
    {
      title: 'I test it and secure it',
      line: 'Automated tests on every change, accessibility checks that block a bad release, and security audits on the live site, not just the code.',
      proof: {
        label: 'I found my own task list on the open internet',
        href: '/content/my-private-task-list-was-public',
      },
    },
    {
      title: 'I own what ships',
      line: 'Claude writes most of the code. I read every change, and nothing goes live until I say so.',
    },
  ];

/**
 * Websites with a write-up: every project part that is a website, less the
 * Notebook (this site's own old look). Counted from the parts, not the
 * projects, because the Net Price Calculator is a project and an app.
 */
const WEBSITES = projects
  .filter((p) => p.slug !== 'notebook')
  .flatMap((p) => p.parts)
  .filter((part) => part.kind === 'Website').length;

/* ── 5. The résumé facts ───────────────────────────────────────────────── */

/**
 * First name only, as on the rest of the site (Josh's call, 2026-10-26).
 * The University of Idaho is named here because Josh asked for its Net
 * Price Calculator to be on this page (2026-11-06), which links to the
 * university's own server; his title comes from his vault résumé. The rest
 * of that résumé (earlier employers, start dates, education) stays off
 * until he says otherwise, because this repository is public. So does the
 * calculator's vendor and cost: the university owns that work (FSH 5300),
 * and that claim waits on its OK.
 */
export const EXPERIENCE: {
  when: string;
  role: string;
  where: string;
  points: string[];
}[] = [
  {
    when: '2026 – now',
    role: 'Independent software builder',
    where: 'SmartDisruptions',
    points: [
      'Shipped online ordering and card payments for a food truck, live on its own domain since August 2026.',
      `Built and published ${apps.length} apps and games and ${WEBSITES} websites, all live and free to try.`,
    ],
  },
  {
    when: '2024 – now',
    role: 'Enterprise Developer, Student Financial Aid',
    where: 'University of Idaho',
    points: [
      'Built the university’s Net Price Calculator: the federal aid formula and its scholarship rules in a three-minute estimate for families, live for 2026–27.',
      'Work on the financial aid systems behind awards and student communications, where the arithmetic isn’t allowed to be wrong, and guard it with a regression test on every change.',
    ],
  },
  {
    when: 'Before 2024',
    role: 'Design and content',
    where: 'University of Idaho',
    points: [
      'My first role there, and where the design half of my work started.',
    ],
  },
  {
    when: 'Since 2008',
    role: 'Self-taught developer',
    where: '',
    points: ['Building websites and software on my own since 2008.'],
  },
];

export const SKILLS: { group: string; items: string[] }[] = [
  {
    group: 'Front end',
    items: [
      'TypeScript',
      'JavaScript',
      'React',
      'Next.js',
      'HTML and CSS',
      'Tailwind',
      'three.js and WebGL',
      'Canvas',
    ],
  },
  {
    group: 'Back end and data',
    items: [
      'Node.js',
      'Postgres',
      'Supabase',
      'SQL',
      'REST APIs',
      'OAuth 2.0',
      'Square API',
    ],
  },
  {
    group: 'Building with AI',
    items: [
      'Claude Code',
      'Multi-agent workflows',
      'Context engineering',
      'AI image and audio generation',
    ],
  },
  {
    group: 'Shipping',
    items: [
      'Vercel',
      'Git and GitHub',
      'GitHub Actions',
      'Playwright',
      'Accessibility (WCAG)',
      'Performance budgets',
    ],
  },
];

/**
 * How to reach me, and what I'm looking for. Josh fills these in; until he
 * does, previews show a note and production leaves the section off.
 */
export const CONTACT: { label: string; href: string } | null = null;
export const LOOKING_FOR: string | null = null;

/** The headline numbers. Derived, so they can't drift. */
export function resumeTotals() {
  return {
    live: apps.length,
    games: GAME_SLUGS.length,
    websites: WEBSITES,
  };
}
