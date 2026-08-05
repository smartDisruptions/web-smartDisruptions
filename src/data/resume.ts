/**
 * Josh's résumé, as data.
 *
 * Four sample surfaces render this same record in four different visual
 * worlds. That is the whole point of the set — the design varies, the truth
 * does not — so every fact lives here exactly once and nowhere else.
 *
 * Everything below is confirmed in PRODUCT.md § Evidence on Hand, which was
 * built from Josh's vault (About Me/Timeline, About Me/Profile). Do not add a
 * claim here that is not in that file. In particular, PRODUCT.md records these
 * as things that must NOT be invented: testimonials, pricing, rates, revenue,
 * traffic figures, FormYourFuture specifics, and his age.
 */

export const identity = {
  name: 'Josh Escusa',
  role: 'Enterprise Developer · AI-native builder',
  place: 'Moscow, Idaho / Pullman, Washington — the Palouse',
  linkedin: 'https://www.linkedin.com/in/joshescusa',
  linkedinLabel: 'linkedin.com/in/joshescusa',
  site: 'https://smartdisruptions.com',
  siteLabel: 'smartdisruptions.com',
  /** One sentence, his own framing: self-taught, AI-amplified. */
  summary:
    'Self-taught developer who grew into engineering on the job. Eleven years at the University of Idaho across design, communications and now enterprise development — and three years of building real things with AI every day, in public, with the receipts attached.',
} as const;

export type Role = {
  org: string;
  title: string;
  start: string;
  end: string;
  /** Sort key + chart plotting. `end: null` means current. */
  years: [number, number | null];
  stack?: string[];
  notes: string[];
};

/** Newest first. */
export const roles: Role[] = [
  {
    org: 'University of Idaho',
    title: 'Enterprise Developer',
    start: '2024',
    end: 'present',
    years: [2024, null],
    stack: ['Oracle SQL', 'Pro*C', 'Banner', 'Argos'],
    notes: [
      'Financial aid systems — the software that decides what students are told they can afford.',
      'Rebuilt the Net Price Calculator, replacing a vendor product that cost roughly $80,000. Live ~August 2026.',
      "The department's AI person.",
    ],
  },
  {
    org: 'University of Idaho',
    title: 'Financial Aid Communications',
    start: '2020',
    end: '2023',
    years: [2020, 2023],
    notes: [
      'Wrote and ran the communications students actually received about paying for school.',
    ],
  },
  {
    org: 'University of Idaho — BEAMS',
    title: 'Design & Content',
    start: '2014',
    end: '2020',
    years: [2014, 2020],
    notes: [
      "Design and content for the university's student financial-wellness program.",
      'Six years of design work that later turned out not to be a detour.',
    ],
  },
  {
    org: 'Cobalt, Seattle',
    title: 'Reputation Management Specialist',
    start: '~2011',
    end: '~2013',
    years: [2011, 2013],
    notes: [
      'Car dealerships: reading and responding to reviews at volume, and the response practices that worked.',
      'The professional root of the Review Growth System, roughly a decade before building it.',
    ],
  },
  {
    org: 'Freelance',
    title: 'Web Developer & SEO — self-taught',
    start: '2008',
    end: '2013',
    years: [2008, 2013],
    notes: [
      'Built sites and ran SEO for small businesses. The technical origin, before the university.',
      'Also the FormYourFuture.com era — a niche site he built and grew, then a hard crash. Told publicly on an Empire Flippers podcast episode, “From Crushing It To Getting Crushed.”',
    ],
  },
];

export type Project = {
  name: string;
  kind: string;
  /** The single strongest verifiable fact. No adjectives. */
  result: string;
  detail: string;
  href?: string;
  /** Used by the bulletin's plot map and the portfolio's grid. */
  yield: number;
  status: 'live' | 'production' | 'shipped';
};

export const projects: Project[] = [
  {
    name: 'Samurai Kitchen',
    kind: 'Client site + online ordering',
    result: 'Client placed a full order end to end',
    detail:
      "A real site for a real friend's food truck, built on his live Square catalog. Also the subject of a published security post-mortem: the fix for the worst hole was deleting the feature that had it, not patching it.",
    href: 'https://samuraikitchencatering.com',
    yield: 92,
    status: 'live',
  },
  {
    name: 'Review Growth System',
    kind: 'SaaS',
    result: 'Reached production maturity',
    detail:
      'Role-based auth, four cron jobs, and an accessibility audit. The idea traces straight back to the Cobalt dealership work in 2011.',
    yield: 84,
    status: 'production',
  },
  {
    name: 'Smart Disruptions',
    kind: 'This site',
    result: 'One post published with nobody watching',
    detail:
      'Six posts live. One of them was shipped entirely unattended — the scheduler opened its own pull request, merged it, and the article was live five minutes later.',
    href: 'https://smartdisruptions.com',
    yield: 88,
    status: 'live',
  },
  {
    name: 'Net Price Calculator',
    kind: 'Enterprise rebuild',
    result: 'Replaced a ~$80k vendor product',
    detail:
      'The tool that tells a prospective student what a year will actually cost them. Rebuilt in-house on Oracle and Banner.',
    yield: 96,
    status: 'shipped',
  },
  {
    name: 'Dirty Coffee Pullman',
    kind: 'Local business site',
    result: 'Shipped and live',
    detail: 'A local coffee business on the Palouse.',
    yield: 71,
    status: 'live',
  },
  {
    name: 'Pebble Kart',
    kind: 'Game',
    result: 'Built by his son',
    detail:
      'Gabe built it himself, with his dad sitting next to him. It is on the site under his own name, which is the correct credit.',
    yield: 78,
    status: 'shipped',
  },
];

export const skills = [
  {
    group: 'Enterprise',
    items: ['Oracle SQL', 'Pro*C', 'Banner', 'Argos', 'Financial aid systems'],
  },
  {
    group: 'Web',
    items: ['TypeScript', 'React', 'Next.js', 'Tailwind', 'PixiJS', 'Supabase'],
  },
  {
    group: 'AI-assisted build',
    items: [
      'Claude Code',
      'Agent pipelines',
      'Spec → plan → QA → ship',
      'Custom skills',
      'Scheduled agents',
    ],
  },
  {
    group: 'Before engineering',
    items: ['SEO', 'Design & content', 'Communications', 'Reputation management'],
  },
];

export const education = {
  degree: 'BS, Psychology',
  school: 'Washington State University',
  note: 'No computer science degree. Self-taught from 2008, then grew into engineering on the job.',
};

export const elsewhere = [
  {
    label: 'Martial arts — 20+ years',
    detail:
      'Taekwondo from age 10 in Okinawa, Japan. Brazilian jiu-jitsu since 2008. First coached in Arkansas around 2009; coached at V7 from 2022 to summer 2025.',
  },
  {
    label: 'Dad',
    detail:
      'Builds games with his son Gabe rather than for him. Gabe gets the byline when it is his.',
  },
];

/**
 * The honest note. Every one of these four samples was designed and built by
 * an AI agent working from a brief — so saying so on the artifact itself is
 * the same disclosure the site already makes on /about, applied where it is
 * most load-bearing.
 */
export const disclosure =
  'This page was designed and built by an AI agent, from a brief, in one session. The résumé it renders is real; the design is the demonstration.';

/** Fed to the live model so it can only answer from the record above. */
export const modelFacts = `
NAME: ${identity.name}
LOCATION: ${identity.place}
SUMMARY: ${identity.summary}
CONTACT: LinkedIn ${identity.linkedinLabel}. No email or phone is published.

ROLES (newest first):
${roles
  .map(
    (r) =>
      `- ${r.title}, ${r.org} (${r.start}–${r.end})${
        r.stack ? ` [${r.stack.join(', ')}]` : ''
      }\n${r.notes.map((n) => `    ${n}`).join('\n')}`,
  )
  .join('\n')}

PROJECTS:
${projects
  .map((p) => `- ${p.name} (${p.kind}) — ${p.result}. ${p.detail}`)
  .join('\n')}

SKILLS:
${skills.map((s) => `- ${s.group}: ${s.items.join(', ')}`).join('\n')}

EDUCATION: ${education.degree}, ${education.school}. ${education.note}

ELSEWHERE:
${elsewhere.map((e) => `- ${e.label}: ${e.detail}`).join('\n')}

NOT ON RECORD — never invent these, say they are not published:
salary or rates, pricing, client testimonials, revenue or traffic figures,
his age or birth year, his email or phone number, and the specifics of the
FormYourFuture venture (exact years, his exact role, peak revenue, and what
caused the crash are genuinely unconfirmed).
`.trim();
