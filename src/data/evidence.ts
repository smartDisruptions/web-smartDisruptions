/**
 * THE EVIDENCE ENGINE — the record.
 *
 * This file is data, not judgment. It holds what happened: projects, the ten
 * fields captured for each one, and the skill claims that point back at them.
 * Nothing in here decides whether a claim is *earned* — that is the job of
 * `src/lib/adjudicate.ts`, which reads this file and grades it against rules
 * it cannot be talked out of.
 *
 * The separation is the whole product. A portfolio where the same author
 * writes both the claim and the verdict is a résumé. Here the claims are
 * authored, the verdicts are computed, and the computation is allowed to
 * come back "no".
 *
 * ON HONESTY
 * ----------
 * Every entry below is taken from a dated record kept while the work happened
 * (Josh's build journal and his vault's Proof of Progress log), not
 * reconstructed afterwards. Where a project's evidence cannot be opened by a
 * stranger — an employer's internal system, a private repo — it is marked
 * `access: 'private'` and the adjudicator downgrades every claim resting on
 * it. Do not mark something public to make a claim score better. The refusal
 * is the feature.
 */

/** What kind of thing the evidence is. Shown as a label on the case study. */
export type EvidenceKind =
  | 'live' // a URL a stranger can load right now
  | 'code' // a repository or a specific commit / PR
  | 'writing' // a published article about the work
  | 'artifact' // a generated file, report, or document
  | 'metric' // a number that was measured, not estimated
  | 'testimony'; // a person said something; no link exists

/**
 * Whether a stranger can actually open it.
 *
 * `public`  — a URL that resolves with no login.
 * `private` — real and dated, but behind an employer's walls, a private repo,
 *             or a personal vault. It still counts as a record. It does not
 *             count as proof, and the adjudicator says so out loud.
 */
export type EvidenceAccess = 'public' | 'private';

export interface EvidenceLink {
  kind: EvidenceKind;
  label: string;
  access: EvidenceAccess;
  /** Required when access is 'public'. A public claim with no URL is refused. */
  href?: string;
  /** Why it can't be opened. Required when access is 'private'. */
  note?: string;
}

export interface Decision {
  call: string;
  why: string;
}

export interface Adjudication {
  /** What the work genuinely demonstrates. */
  demonstrates: string[];
  /** What it does NOT demonstrate — stated by the person who did it. */
  doesNotShow: string[];
  /** The concrete next artifact that would close the gap. */
  wouldClose: string[];
}

export interface CaseStudy {
  slug: string;
  title: string;
  /** One line. What a reader gets in three seconds. */
  headline: string;
  /** ISO date the work happened — from the record, not the day it was written up. */
  date: string;
  /** Optional span, when the work ran over several days. */
  dateRange?: string;
  /** Is there a running thing, at a URL, that other people can use? */
  deployed: boolean;
  /**
   * A qualifier printed next to the Deployed mark.
   *
   * Needed the first time a project was live in one sense and not in another:
   * Samurai Kitchen's site is up, its ordering is not. A bare green chip beside
   * a headline saying "unlaunched" is the same "status is not liveness" bug
   * this record keeps documenting, so the chip has to be able to qualify itself.
   */
  deployedNote?: string;
  /** Did a person who is not Josh use it for their own purposes? */
  usedByOthers: boolean;
  /** Who, when usedByOthers is true. Named people beat "users". */
  usedBy?: string;

  // ── The ten fields. Nine are context. One is the product. ──────────────
  problem: string;
  priorKnowledge: string;
  hadToLearn: string[];
  decisions: Decision[];
  failures: string[];
  iterations: string[];
  /** ⭐ The whole value proposition: the calls that were the person's. */
  humanJudgment: string[];
  aiContribution: string[];
  result: string;
  evidence: EvidenceLink[];
  // ───────────────────────────────────────────────────────────────────────

  /** Skill ids this project is offered as evidence for. Must resolve. */
  skills: string[];
  adjudication: Adjudication;
  /** A résumé line with a number in it. */
  resumeBullet: string;
  star?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface SkillClaim {
  id: string;
  name: string;
  category: string;
  /**
   * The claim, in the only form this engine accepts: what was built and what
   * it does. "Excel — Intermediate" is not a claim, it is a self-assessment.
   */
  claim: string;
  /** Case study slugs offered in support. The adjudicator checks these. */
  evidence: string[];
  /**
   * A limit the author already knows about. Printed next to the verdict even
   * when the claim passes — a passing grade with a stated edge is worth more
   * than a passing grade alone.
   */
  limit?: string;
}

export interface Profile {
  handle: string;
  name: string;
  tagline: string;
  /** Short intro, first person. */
  intro: string;
  photo?: string;
  links: { label: string; href: string }[];
  /** The window the record covers. */
  recordFrom: string;
  recordTo: string;
  skills: SkillClaim[];
  caseStudies: CaseStudy[];
  /**
   * Gaps the engine cannot derive from the data, named by the person anyway.
   * These are the ones that cost something to admit, which is exactly why
   * they belong on the page.
   */
  declaredGaps: { gap: string; wouldClose: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// THE SKILL CLAIMS
// ═══════════════════════════════════════════════════════════════════════════

const skills: SkillClaim[] = [
  {
    id: 'agent-orchestration',
    name: 'Multi-agent orchestration',
    category: 'Working with AI',
    claim:
      'Built a research method that runs 14 agents over one question — five perspectives interviewing each other against live search, then eight adversarial fact-checkers told to assume every claim is wrong until a source proves otherwise.',
    evidence: ['storm-method', 'market-storm'],
    limit:
      'Runs on one machine for one person. Never had to hold up under concurrent users.',
  },
  {
    id: 'adversarial-verification',
    name: 'Adversarial verification',
    category: 'Working with AI',
    claim:
      'Put my own published research through a refutation pass and lost: 7 of 8 load-bearing claims came back corrected, including the one the thesis rested on. Shipped the corrections instead of quietly patching them.',
    evidence: ['storm-method'],
  },
  {
    id: 'context-engineering',
    name: 'Context engineering',
    category: 'Working with AI',
    claim:
      'Designed what the model knows before it is asked anything: a linked knowledge base with a documented retrieval policy, read by every session across three surfaces, tested cold on a fresh session.',
    evidence: ['brain-graph'],
    limit:
      'Tested by me, on me. A memory system nobody else has used is a personal tool, not a proven design.',
  },
  {
    id: 'directing-a-build',
    name: 'Directing an AI build (and rejecting its output)',
    category: 'Working with AI',
    claim:
      'Deleted six of ten templates I had asked for, after rendering both versions side by side rather than arguing about them — and measured my own instinct instead of trusting it (a hero renders at 341px on a phone, and 69% of the words were unreadable).',
    evidence: ['hero-system', 'studio', 'daily-kanban'],
  },
  {
    id: 'security-audit',
    name: 'Security auditing a live system',
    category: 'Engineering',
    claim:
      'Audited my own deployed tools before writing about them publicly and found a real breach — my live task list, 43 items, served at 200 OK to anyone with the URL. Closed it in two stages with no window of exposure, and only restored the data after watching production deny the request.',
    evidence: ['kanban-breach', 'samurai-kitchen'],
  },
  {
    id: 'payments-hardening',
    name: 'Hardening a payment path before it takes money',
    category: 'Engineering',
    claim:
      "Found a client-controlled charge amount in a real restaurant's checkout before it could ever take money — the price the server billed came from the browser — plus client-priced line items and missing rate limits, and fixed all of it in the same session.",
    evidence: ['samurai-kitchen'],
  },
  {
    id: 'environment-debugging',
    name: 'Debugging a bug that only exists in production',
    category: 'Engineering',
    claim:
      'Diagnosed an order total that read $0.00 on the deployed build and was correct locally — mock state held in per-process memory that does not survive a stateless serverless invocation — and fixed it with the right platform primitive rather than a workaround.',
    evidence: ['samurai-kitchen'],
  },
  {
    id: 'idempotent-automation',
    name: 'Automation that survives its own partial failure',
    category: 'Engineering',
    claim:
      'Shipped a publishing robot that opens and merges its own pull request, after six failures — five of which reported success. The fix was a reconcile pass: every run looks for its own wreckage before it looks for new work.',
    evidence: ['studio'],
  },
  {
    id: 'design-system',
    name: 'Design systems and accessible theming',
    category: 'Design',
    claim:
      'Refactored a live site onto a semantic colour palette so one attribute re-themes the whole thing, shipped a warm-dark mode, and hold every text colour to WCAG AA in both themes — enforced by a deterministic auditor with 58 rules, where every suppression carries a written reason.',
    evidence: ['hero-system', 'market-storm'],
  },
  {
    id: 'product-judgment',
    name: 'Finding the real constraint behind a request',
    category: 'Design',
    claim:
      'Asked to make a board draggable, established that it already was — and that the actual need was a different feature: card order lived only in each device\'s local storage, so "make it draggable" and "set the order for me from somewhere else" were never the same ask.',
    evidence: ['daily-kanban'],
  },
  {
    id: 'shipping-to-a-client',
    name: 'Shipping to a paying client',
    category: 'Earning',
    claim:
      'Built a restaurant owner online ordering against his real Square catalogue — 22 modifier lists, his actual prices — and he placed a full order through it end to end on the test build and approved go-live.',
    evidence: ['samurai-kitchen'],
    limit:
      'Approved is not launched. It is still unmerged and has never taken a real order — the last step is mine and I have not taken it.',
  },
  {
    id: 'institutional-value',
    name: 'Replacing vendor software at institutional scale',
    category: 'Earning',
    claim:
      'Rebuilt a university net price calculator that a vendor charged $80,000 to build and $5,000 a year to keep, behind a 23-assertion regression tripwire on the aid math that runs on every change.',
    evidence: ['npc-rebuild'],
    limit:
      'Employer-internal. The dollar figures and the code are real and dated; a stranger cannot open either.',
  },
  {
    id: 'teaching-the-loop',
    name: 'Teaching the loop to someone else',
    category: 'Teaching',
    claim:
      'Taught my twelve-year-old the build loop — prompt to prototype, then iterate — and he built his own kart racer: his name on it, his features, his iterations. I did not build it for him.',
    evidence: ['pebble-kart'],
  },
  {
    id: 'publishing',
    name: 'Publishing under my own name',
    category: 'Teaching',
    claim:
      'Wrote and shipped 11 articles about my own builds — including the ones where I was wrong — through a preview-first review gate, each one live at a real URL under my name.',
    evidence: ['studio', 'kanban-breach'],
  },
  {
    id: 'audience',
    name: 'Building an audience',
    category: 'Earning',
    claim:
      'Articles published and shared on LinkedIn from my own profile, with an owned email list behind them.',
    evidence: [],
    limit:
      'Deliberately unevidenced. Published is not read. See the verdict below — the engine is right about this one.',
  },
  {
    id: 'team-engineering',
    name: 'Working in an engineering team',
    category: 'Engineering',
    claim:
      'Code reviewed by peers, shared ownership of a codebase, a change I did not get to make my own way.',
    evidence: [],
  },
  {
    id: 'scale',
    name: 'Running something under real load',
    category: 'Engineering',
    claim:
      'A system that stayed up while a lot of people used it at once, with the numbers to show it.',
    evidence: [],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// THE CASE STUDIES
// ═══════════════════════════════════════════════════════════════════════════

const caseStudies: CaseStudy[] = [
  {
    slug: 'samurai-kitchen',
    title: 'Online ordering for a real restaurant',
    headline:
      "Built online ordering against a friend's real Square catalogue, found a client-controlled charge amount before it could ever take money — and it is still sitting unlaunched, one credential step from going live.",
    date: '2026-07-09',
    dateRange: 'February 2025 → July 2026',
    deployed: true,
    deployedNote: 'the site — ordering is built but not launched',
    usedByOthers: true,
    usedBy: 'Robert, the owner — he validated the build and runs the live site',
    problem:
      'Robert runs a Japanese catering business and a food truck. His website was an old WordPress build that could not take an order, so every order arrived by phone or in person and his menu lived in two places that disagreed with each other — the site and his Square kiosk. He wanted online ordering, and he wanted the site to say exactly what the kiosk says.',
    priorKnowledge:
      "I had built websites before and I knew Next.js. I had never integrated a payment provider, never worked against a live commercial catalogue API, and had never shipped anything that handled another person's money.",
    hadToLearn: [
      'The Square Catalog, Orders and Web Payments APIs, and how a catalogue models modifiers (required/optional, single/multiple, min/max) rather than flat options',
      'Where the security boundary actually sits in a checkout — which turned out not to be where I assumed',
      'How Vercel decides whether to build a branch, and that it reads the commit author, not the CLI user',
      'The difference between build-time and request-time rendering, the hard way',
    ],
    decisions: [
      {
        call: 'The Square catalogue is the source of truth, not a copy in the codebase.',
        why: 'Robert already maintains his menu in Square because his kiosk needs it. Any second copy is a copy that goes stale, and the failure mode is a customer being charged for something the kitchen does not have.',
      },
      {
        call: 'Delete the loyalty panel at checkout rather than leave it in place.',
        why: 'It promised points that nothing awarded. A mock that lies to a customer is worse than a missing feature, and it can come back behind one flag when Square Loyalty is actually wired.',
      },
      {
        call: 'Remove the review-sentiment gate entirely instead of fixing its auth hole.',
        why: 'The admin area existed to run a funnel that routed happy customers to Google and unhappy ones to a private form. Deleting the funnel deleted the "any logged-in user is an admin" hole with it. Fixing the auth would have kept a feature I did not think he should be running.',
      },
      {
        call: 'Filter the real catalogue down rather than render it as-is.',
        why: "Live retail data is messy: nine empty or duplicate reporting categories, catering and gift cards mixed in with dishes. Six clean categories, with the repo's existing dish photography as a name-keyed fallback that a real Square photo overrides.",
      },
    ],
    failures: [
      "The order confirmation totalled $0.00 — but only on the deployed build. It was correct on my machine every time, because my machine runs one long-lived process and the mock order state was held in process memory. Vercel's serverless invocations do not share memory.",
      'A ten-minute build hang, caused by the menu routes prerendering at build time and calling Square while they did it.',
      'Vercel refused to build the branch at all, and the error pointed at the wrong thing. It gates on the commit author identity, not on who ran the deploy.',
      'I believed the security fixes were already live. They were on unmerged branches. I only found out because I checked production before publishing an article that said they were fixed.',
    ],
    iterations: [
      'Mock menu → real Square catalogue → catalogue with full modifier support matching the kiosk',
      'Five UX changes typed on a phone, made in a cloud session, deployed to a preview he could test, merged — no laptop involved at any point',
      'Security audit → same-session hardening → a re-check against production before I wrote about it publicly',
    ],
    humanJudgment: [
      'Choosing to audit a payment path before go-live, on a job where nobody asked me to. The client-controlled charge amount was not in a ticket. It was found because I went looking.',
      'Deciding the loyalty panel had to go. The AI would have kept building the feature; the call that it was dishonest to a customer was mine.',
      'Choosing deletion over patching on the review funnel — a product judgment about what Robert should be doing, not a technical one.',
      'Not believing my own notes. Before publishing an article that said two holes were fixed, I checked the live branch instead of the record, and found both fixes were still sitting unmerged.',
      'Deciding the catalogue is the source of truth. That single call is why his site and his kiosk cannot drift, and it is the difference between a website and a system.',
    ],
    aiContribution: [
      'Wrote most of the integration code — the catalogue fetch, the modifier resolution, the cart, the checkout',
      'Traced the $0.00 bug to per-process memory once I described that it only happened on the deployed build',
      'Ran the audit sweep across the API surface that surfaced the pricing hole I then judged and fixed',
      'Did the whole build-deploy-test loop from a cloud session while I was away from my machine',
    ],
    result:
      'Ordering built against his real production catalogue — the actual menu, actual prices, 22 modifier lists — with server-side modifier resolution that rejects unknown IDs and a checkout that no longer trusts a price sent from the browser. Robert placed a full order through it end to end on the test build and approved go-live. It has not launched: the branches are still unmerged and the last step is a real card test on production, which is mine to do and I have not done it. The site he runs today is the menu and the catering form, without ordering.',
    evidence: [
      {
        kind: 'live',
        label:
          'samuraikitchencatering.com — the live site: menu and catering form, no ordering yet',
        access: 'public',
        href: 'https://samuraikitchencatering.com',
      },
      {
        kind: 'writing',
        label:
          "I built my friend's food truck site with AI — here's what actually happened",
        access: 'public',
        href: 'https://smartdisruptions.com/content/food-truck-site-with-ai',
      },
      {
        kind: 'writing',
        label:
          "I tried to break my friend's AI-built site — and deleted the hole instead of patching it",
        access: 'public',
        href: 'https://smartdisruptions.com/content/i-tried-to-break-my-friends-ai-site',
      },
      {
        kind: 'testimony',
        label:
          'Robert placed a full order on the test build and approved go-live',
        access: 'private',
        note: 'A text message from the owner, against a 23-hour preview link that has long since expired. Real and dated in my log; nothing a stranger can verify.',
      },
      {
        kind: 'code',
        label: 'The security-hardening commit (537bbf2)',
        access: 'private',
        note: "Private client repository. It is his business's code, not mine to publish.",
      },
    ],
    skills: [
      'shipping-to-a-client',
      'payments-hardening',
      'environment-debugging',
      'security-audit',
    ],
    adjudication: {
      demonstrates: [
        'Integrating a third-party commercial API against live production data, not a sandbox',
        'Finding a money-handling vulnerability in a system nobody asked you to audit, and fixing it before launch',
        'Debugging a fault that cannot be reproduced locally by reasoning about the runtime',
        'Working with a real client: their constraints, their data, their sign-off',
      ],
      doesNotShow: [
        'That the ordering system has ever taken a real order. It is validated on a preview and it has not launched — the branches are unmerged and the final production card test is a step I have not taken. Building something a client approved and then not shipping it is the honest headline here.',
        'That the payment path is safe under a determined attacker. It is safer than it was, and one audit by the person who wrote the code is not a penetration test.',
        "Any of the code. The repository is the client's and stays private, so the strongest technical evidence here is unopenable.",
      ],
      wouldClose: [
        'Merging the branches, running the real card test, and launching it — which is one afternoon of work I keep not doing',
        "An order count and a revenue figure over a defined period afterwards, with the owner's permission to publish it",
        'An external security review of the checkout by somebody who did not write it',
      ],
    },
    resumeBullet:
      'Built client-approved online ordering for a catering business against its live Square catalogue (22 modifier lists, server-side price resolution), after an audit found and fixed a client-controlled charge amount; validated end to end by the owner on a test build, not yet launched.',
    star: {
      situation:
        "A friend's catering business had a website that could not take an order, and a menu that lived in two systems that disagreed.",
      task: 'Get him live online ordering that matches his kiosk exactly, without ever charging a customer the wrong amount.',
      action:
        'Made his Square catalogue the single source of truth rather than copying the menu into the codebase, built full modifier support to reach kiosk parity, then audited the API surface before go-live — which found that the server was taking the charge amount from the browser. Fixed that, removed a loyalty panel that promised points nothing awarded, and deleted a review funnel whose admin area let any logged-in user in.',
      result:
        'He placed a full order end to end on the test build and approved go-live. The site and the kiosk cannot drift, because there is only one menu. It is still not launched, which is on me rather than on the build.',
    },
  },

  {
    slug: 'npc-rebuild',
    title: 'Replacing an $80,000 vendor calculator',
    headline:
      'Rebuilt a university net price calculator that a vendor charged $80,000 to build and $5,000 a year to keep — with a regression tripwire around the part that must never be wrong.',
    date: '2026-07-05',
    // Scheduled, not shipped. The prose says "scheduled to go live", so marking
    // it deployed would put the counters at odds with the case study.
    deployed: false,
    usedByOthers: false,
    problem:
      'The university paid a vendor roughly $80,000 to build its net price calculator and about $5,000 a year to keep it. It is the tool a family uses to find out what a degree will actually cost them, and the department could not change it without going back to the vendor. I work in financial aid engineering; I know what the numbers are supposed to do.',
    priorKnowledge:
      'I have spent years inside financial aid systems — the regulations, the aid math, the Student Aid Index. What I had not done was rebuild a piece of vendor software with an AI as the implementer while remaining accountable for numbers that decide whether a family thinks they can afford college.',
    hadToLearn: [
      'How to keep an AI implementer from silently changing arithmetic that has a legal definition',
      'How to test aid math without a test framework in the environment I was working in',
      'How to structure edits so a policy question surfaces as a question rather than as a diff',
    ],
    decisions: [
      {
        call: 'Put a byte-identical 23-assertion regression run around the aid engine, and run it on every single change.',
        why: 'The calculator has one part that is not allowed to be wrong. Fencing it with a cheap test that always runs is what lets everything around it move fast. I have since reused this pattern everywhere: separation of trust.',
      },
      {
        call: 'Every policy call gets flagged for approval, never made silently.',
        why: 'An AI will happily pick a plausible interpretation of an aid rule. Plausible is not the standard — the standard is what the regulation says, and that is a human decision with an audit trail.',
      },
      {
        call: 'Narrowest possible edit, always. Locate and read the exact code first, propose with explicit scope, then change the smallest thing that works.',
        why: 'In a system this consequential, a large diff is unreviewable, and unreviewable means unowned.',
      },
    ],
    failures: [
      'Early on I let scope drift inside single edits, which made the diffs hard to review and made me slower, not faster. The loop above exists because of that.',
    ],
    iterations: [
      'Prototype → a disciplined edit loop for every post-prototype change → a three-layer validation stack (syntax gate, per-feature behavioural tests, the always-run regression)',
      'Closed an 8-scenario integration test at 27 of 27 assertions passing',
    ],
    humanJudgment: [
      'Knowing which part of the system is not allowed to be wrong. That is domain knowledge, and no amount of model capability substitutes for it — the AI cannot tell you that the SAI calculation is the load-bearing one.',
      'Designing the tripwire pattern: a cheap, always-run test fenced around the untouchable part so everything else can move fast. That idea is now in four other projects of mine.',
      'Every policy interpretation. The AI proposed; I decided, because the consequence lands on a family reading a number.',
      'Insisting on narrow edits when a broader refactor would have been faster to write and impossible to review.',
    ],
    aiContribution: [
      'Wrote the implementation and the behavioural tests',
      'Located and read the exact code paths on request rather than my grepping for them',
      'Produced the diffs I reviewed and approved',
    ],
    result:
      'A working replacement for vendor software, built at a fraction of the cost, scheduled to go live on the university site. Behind it: a three-layer validation stack, and an aid engine guarded by 23 assertions that run on every change. The department now brings me the AI work.',
    evidence: [
      {
        kind: 'metric',
        label:
          '23-assertion regression run, 8-scenario integration test at 27/27',
        access: 'private',
        note: "Runs inside the university environment. The output is real and dated in my log; the system is my employer's.",
      },
      {
        kind: 'code',
        label: 'The calculator itself',
        access: 'private',
        note: 'Employer-owned. I cannot publish it, and I am not going to pretend otherwise.',
      },
      {
        kind: 'artifact',
        label: 'The method, written up in my own notes',
        access: 'private',
        note: 'Personal vault. Written the week it happened.',
      },
    ],
    skills: ['institutional-value'],
    adjudication: {
      demonstrates: [
        'Domain expertise deep enough to know which part of a consequential system is not allowed to be wrong',
        'A validation discipline strong enough to let an AI edit code that moves real money',
        'Delivering institutional-scale dollar value with an AI-native workflow',
      ],
      doesNotShow: [
        "Anything a stranger can check. Every artifact here is behind an employer's walls. On this record it is testimony, not proof — a strong claim with no openable link.",
        'That it survived contact with the public. It is scheduled to go live; the live date is not logged yet.',
        'The quality of the code, which nobody outside the university has read.',
      ],
      wouldClose: [
        'The live public URL once the university ships it — that alone would move this from testimony to evidence',
        'A published write-up of the tripwire pattern with a runnable open-source example, which carries the transferable part without exposing anything internal',
      ],
    },
    resumeBullet:
      'Rebuilt a university net price calculator replacing an $80k-build / $5k-per-year vendor product, guarded by a 23-assertion regression suite on the aid engine and an 8-scenario integration test passing 27/27.',
  },

  {
    slug: 'studio',
    title: 'A publishing robot that finally shipped it',
    headline:
      'Built the dashboard that runs my site, decided six hours later the architecture was wrong, took it apart — then spent a day teaching a scheduler to press its own publish button through six failures, five of which reported success.',
    date: '2026-08-02',
    dateRange: '1 → 3 August 2026',
    deployed: true,
    usedByOthers: false,
    problem:
      'My writing lived in a 661-line TypeScript file. Publishing meant editing code. I wanted an editor-in-chief view — every article across every branch, a schedule, a publish button — and eventually I wanted the publishing to happen without me watching.',
    priorKnowledge:
      'I could build a dashboard. I had not built authentication I would trust on something that can merge to production, and I had never written a scheduled job that had to be safe when nobody was watching it.',
    hadToLearn: [
      'Auth that runs identically at the edge and in a Node route handler, on Web Crypto',
      'The GitHub Actions permission model, and that a workflow which has never run has never been tested',
      'That an eventually-consistent read API will race your own write, and the write has to be treated as the authority',
      'Idempotent job design — the term arrived after the lesson did',
    ],
    decisions: [
      {
        call: 'Content moves out of a TypeScript file and into one markdown file per article, with status in frontmatter.',
        why: 'Git becomes the single source of truth for the editorial calendar. No second store to drift. It also means two branches editing different articles never touch the same file.',
      },
      {
        call: 'The publish gate is a function, and it is the only list the public site may render.',
        why: 'That single property is what lets an unpublished draft sit merged on the production branch and stay invisible. Without it, drafts need a separate branch and every publish is a merge conflict.',
      },
      {
        call: 'Take the dashboard out of the site it monitors — six hours after shipping it.',
        why: 'A dashboard built into the site deploys with the site and dies with it. It cannot tell you the site is broken, because it is part of what broke. I archived the working version at a branch and a tag first, which turned "should we rebuild this?" from a risk into a preference.',
      },
      {
        call: 'The scheduler refuses to run when the pending change carries code.',
        why: "Shipping code unattended, with nobody reading what else is going out, is not a scheduler's call to make. It refused twice on my own tooling commits and was right both times.",
      },
      {
        call: 'No posting API. The dashboard fills my clipboard; it never posts as me.',
        why: 'Posting as me is my account and my voice. A dashboard that could do it is a far bigger trust decision than one that cannot.',
      },
    ],
    failures: [
      'The dashboard reported an article as live on production while the site returned a 404 for that URL — because liveness was read off a status field instead of off production. It was confidently wrong for hours.',
      'Six failures teaching the scheduler to publish, and five of them reported success. One was a half-run publish that flipped an article\'s status, failed to promote, and then went invisible to every later pass because it was no longer "due" — reporting "nothing due, done" over a permanently stuck state.',
      'An article shipped with no hero image and no social card, because nothing generated them and the frontmatter called them optional.',
      'A Schedule button that had silently done nothing since a rename. An Unschedule that sent a byte-identical payload to Unstage — the destructive one wearing the milder name.',
      'Every date-only value rendered a day early across three tabs, because parsing a bare date string gives UTC midnight, which is the previous day in Pacific.',
    ],
    iterations: [
      'In-site dashboard → extracted to its own repository and deployment, same day',
      'Manual publish button → scheduled publishing → a reconcile pass so a half-finished publish heals itself',
      'Optional images → a generator using headless Chrome → a test that fails when an article lacks them, which immediately found two already-published posts with no social card, live for weeks',
    ],
    humanJudgment: [
      'Refusing to believe my own tool. I asked why an article was not showing as a draft, and that question is what surfaced a dashboard reporting the opposite of reality. The tool is confident either way; the check has to be me.',
      'Calling the architecture wrong six hours after shipping it, and saying so. The reusable question I got out of it: if the thing I am monitoring goes down, do I still have the monitor?',
      'Setting the rule that removed the recurring cause instead of loosening the guard that kept firing — content branch carries content only, an article and its images ship in one commit, tooling goes straight to production.',
      'Deciding the ceiling deliberately: agents work in development, push to a test build, and hand me a pull request. Making that last step automatic would be easy. The point of the whole setup is that judgment is the part I keep.',
      'Naming the lesson as a family rather than fixing three bugs. Status is not liveness; a green light asserts that a job finished, never that it achieved anything.',
    ],
    aiContribution: [
      'Wrote the dashboard, the auth, the content migration, and the scheduler',
      'Round-tripped six articles field by field before the source file was deleted',
      'Wrote 78 tests across both repositories, including ones that try to defeat its own auth gate with forged, tampered and expired tokens',
      'Rebuilt the whole thing as a separate application after I called the architecture wrong',
    ],
    result:
      'A scheduled article was promoted at 20:40Z by a job that opened and merged its own pull request; the article was live five minutes later with nobody watching. The publish gate, the markdown content store and the image tests are the same ones running this page.',
    evidence: [
      {
        kind: 'writing',
        label:
          'My dashboard said the article was published. The article was returning a 404.',
        access: 'public',
        href: 'https://smartdisruptions.com/content/my-dashboard-said-published',
      },
      {
        kind: 'writing',
        label:
          'My publish button worked on day one. Teaching the robot to press it took six failures.',
        access: 'public',
        href: 'https://smartdisruptions.com/content/five-of-six-failures-said-success',
      },
      {
        kind: 'writing',
        label:
          'I built my own dashboard for my site — then took it apart and built it again',
        access: 'public',
        href: 'https://smartdisruptions.com/content/took-it-apart-and-built-it-again',
      },
      {
        kind: 'code',
        label: 'The publish gate and content store, running this site',
        access: 'public',
        href: 'https://github.com/smartDisruptions/web-smartDisruptions/pull/29',
      },
      {
        kind: 'metric',
        label:
          '78 tests across both repositories; scheduled publish verified end to end',
        access: 'private',
        note: 'The dashboard repository is private — it holds tokens that can merge to production.',
      },
    ],
    skills: ['idempotent-automation', 'directing-a-build', 'publishing'],
    adjudication: {
      demonstrates: [
        'Building internal tooling on production, with auth, a write path to GitHub, and a content-architecture migration executed without breaking a live URL',
        'Recognising a working system was architecturally wrong and taking it apart the same day',
        'Automation designed to survive its own partial failure, proven by an unattended publish',
      ],
      doesNotShow: [
        "That any of it works for anyone but me. One user, one site, one person's conventions.",
        'That the auth would hold against a real attacker. It has tests that try to defeat it, written by the same person who wrote the gate.',
        'Long-term operation. The unattended publish has run a handful of times, not a hundred.',
      ],
      wouldClose: [
        'A second person publishing through it, with their own repository and their own tokens',
        "A ninety-day run log showing the scheduler's success rate against the failures it recovered from",
      ],
    },
    resumeBullet:
      'Built a publishing pipeline that promotes and merges its own pull request unattended, hardened through six failures (five of which reported success) with a reconcile pass and 78 tests across two repositories.',
  },

  {
    slug: 'storm-method',
    title: 'Research that breaks its own conclusions',
    headline:
      'Built a 14-agent research method, published a report with it, then set eight adversarial fact-checkers on my own findings — and lost. Seven of eight load-bearing claims came back corrected, including the one the thesis rested on.',
    date: '2026-07-30',
    dateRange: '5 → 30 July 2026',
    deployed: false,
    usedByOthers: false,
    problem:
      'I wanted to research things properly — investment questions, technical questions — without producing the thing an AI is best at producing: a fluent, confident, unsourced memo. Stanford published a method (STORM) that structures research as perspective interviews. Nobody had turned it into a tool I could invoke.',
    priorKnowledge:
      'I had read the STORM paper. I had built Claude Code skills before. I had never built one that coordinated more than a dozen agents, and I had never subjected my own finished work to adversarial review.',
    hadToLearn: [
      'How to enforce a schema on a subagent so a degraded run fails loudly instead of returning nothing',
      'How to preflight tool access before committing an agent fleet to a run',
      'That the interesting failure mode is not a wrong answer, it is a plausible answer with no source under it',
    ],
    decisions: [
      {
        call: 'Verification is a separate adversarial pass, told to assume each claim is wrong until a source proves otherwise.',
        why: 'A model asked to check its own work will agree with itself. The instruction has to be to refute, and the agents have to be different ones.',
      },
      {
        call: 'Ship the corrections, publicly, superseding the original report rather than quietly patching it.',
        why: 'A research method whose corrections are invisible is a research method with no accountability. The superseded report is still in the repository.',
      },
      {
        call: 'Fail loud on the first empty return.',
        why: 'The first run came back with zero interviews and still produced a report. A tool that degrades silently is worse than one that crashes.',
      },
    ],
    failures: [
      'The first real run returned nothing from all five interview agents — the session stripped their tool arguments, so they retrieved nothing — and the skill produced a report anyway. It shipped single-pass on a $25 billion debt question.',
      'The verification pass then withdrew the thesis\'s spine: a "2027 renegotiation cliff" that exists in no filing anywhere. I had written a report around a date I could not source.',
      'The corrections inverted my own ranking. I had one company ahead on capacity; it has 50MW where the one I ranked below it has over a gigawatt energised.',
      'It also caught a citation error of mine on a later report: a change I attributed to a 10-K appears only in the earnings call.',
    ],
    iterations: [
      'Single-pass research → perspective interviews → interviews plus a separate adversarial verification pass',
      'Silent degradation → schema on every agent, a 20-second tool preflight with an inline fallback, and a loud failure on the first empty return',
      'Ran cold on a subject it had never seen (an earnings report from that morning) to prove the fix was not a one-off patch: 14 agents, 8 verifications, zero empty returns',
    ],
    humanJudgment: [
      'Deciding that the point of the tool is not running the research — it is refusing to trust my own output. That reframing is what produced the adversarial pass, and it is the only reason the report is worth reading.',
      'Publishing the loss. A finished, published deliverable of mine went through verification and failed, on the record, with corrections shipped rather than the original quietly edited.',
      'Reading the honest-failure property correctly: five agents with no retrieval returned nothing rather than something plausible. That is the only failure mode that does not poison a downstream conclusion, and I hardened the tool to preserve it.',
      'Choosing a house rule out of the incident — every report ships with a clickable link — because a report nobody can open was not delivered.',
    ],
    aiContribution: [
      'Ran all 14 agents, 353 tool calls in the verified run, zero failures',
      'Wrote the skill, then rewrote it with the schema enforcement and preflight after I described the failure',
      'Produced the corrections that overturned my own thesis',
    ],
    result:
      'A reusable research method with a verification pass that has, on the record, corrected its author. Later pointed at public-company earnings and turned into a section of this site, where the verification ledger — how many claims survived, how many were downgraded, how many were corrected — is printed on the report itself.',
    evidence: [
      {
        kind: 'writing',
        label:
          'I finished my research, then set an AI on it to prove me wrong. It broke seven of my eight claims.',
        access: 'private',
        note: 'Written and staged, not published — it renders on preview builds only, so the public URL is a 404 today. It becomes openable evidence the day it ships, and not before.',
      },
      {
        kind: 'artifact',
        label: 'The verified report, and the superseded original beside it',
        access: 'private',
        note: 'Both live in my personal knowledge-base repository, which is private because it also holds notes about my family and my clients. Checked 2026-08-19: the URL 404s for anyone who is not me, so it does not count.',
      },
      {
        kind: 'live',
        label: 'Market Storm — the method, published as reports',
        access: 'public',
        href: 'https://smartdisruptions.com/market-storm',
      },
      {
        kind: 'metric',
        label:
          '14 agents · 353 tool calls · 0 failures · 1 clean, 7 corrected, 0 refuted',
        access: 'private',
        note: 'Counted from the run log in the same private repository as the report above.',
      },
    ],
    skills: ['agent-orchestration', 'adversarial-verification'],
    adjudication: {
      demonstrates: [
        'Turning a published academic method into a working tool in a single session',
        "Catching a tool's own silent failure, root-causing it, hardening it, and re-validating cold on an unseen subject",
        'Subjecting finished work to adversarial review and publishing the result when it loses',
      ],
      doesNotShow: [
        'That the research conclusions were any good. The method corrected them; nobody has checked whether the corrected version holds up against what actually happened since.',
        'That anyone other than me has used it, or that the reports have been read by someone qualified to argue with them.',
        'Financial competence. Correcting a claim about a filing is a research skill, not an investing result.',
      ],
      wouldClose: [
        'A dated forecast from one of these reports, scored against what actually happened — right or wrong, published either way',
        'A second person running the method on their own question and reporting what it did',
      ],
    },
    resumeBullet:
      'Built a 14-agent research pipeline with an adversarial verification stage that corrected 7 of 8 load-bearing claims in my own published report, including one sourced to a document that does not contain it.',
  },

  {
    slug: 'kanban-breach',
    title: 'I found my own task list on the open internet',
    headline:
      'Before publishing an article about my tools, I audited whether they could be hacked. One returned my live task list — 43 items, 17,798 bytes — at 200 OK to anyone with the URL.',
    date: '2026-08-02',
    deployed: true,
    usedByOthers: false,
    problem:
      'I had an article written and ready about the dashboard that runs my site. Publishing it would point strangers at my tools. A private URL and a URL in a blog post are not the same asset, so before publishing I stopped and asked whether any of it could be attacked.',
    priorKnowledge:
      "I had done a security audit before, on a client app. I had never audited my own infrastructure, and I had assumed my hosting platform's protection setting did what its name suggests.",
    hadToLearn: [
      'That the free tier\'s "protect all except custom domains" gates preview deployments and exempts production — the inverse of what everyone assumes',
      'That deployment subdomains are enumerable through Certificate Transparency logs, so obscurity was never protection',
      'Routing middleware as a framework-agnostic gate that runs on every request, even for a zero-build static site',
    ],
    decisions: [
      {
        call: 'Stop the bleeding with the fast reversible fix, then build the good one.',
        why: 'One line stopped the file deploying within about sixty seconds at zero downtime. The password gate took longer and was the right answer, but the exposure ended first.',
      },
      {
        call: 'Gate the application, not the deployment.',
        why: 'A middleware gate runs on every request regardless of how the site is built, which beat the paid platform upgrade I declined.',
      },
      {
        call: 'Fail toward the outage: unset secrets mean closed, every deny path returns explicitly, only a verified session continues.',
        why: 'A gate that fails open is not a gate. If the configuration is missing I would rather the tool be unavailable than unlocked.',
      },
      {
        call: 'Do not restore the data until production has been observed denying the request.',
        why: 'A gate not yet seen denying is a belief, not a control.',
      },
      {
        call: 'Split the credential in two, scoped by operation rather than an allow-list.',
        why: 'The token that publishes articles had carried write access to my private knowledge base. A default cannot be forgotten the way a list can.',
      },
    ],
    failures: [
      'The exposure existed for as long as the board did. It was live and readable the whole time, and I only found it because I went looking on the day I happened to be publishing.',
      'The audit itself had a blind spot and walked straight past an admin panel on the site it was auditing — because I enumerated the apps I had deployed, not the routes those apps serve. A checklist decides what you are capable of finding.',
      'What caught the miss was not more diligence. It was a separate tool whose job is re-checking whether written-down claims are still true, and it found the panel a day after the audit called everything clean.',
    ],
    iterations: [
      'One-line deploy exclusion (60 seconds, zero downtime) → a middleware password gate with 24 tests → security headers, a working sign-out, and split credentials',
      'Audit by deployed application → audit by route, after the first pass missed one',
    ],
    humanJudgment: [
      'The ordering. Publishing changes the threat model, so the audit belongs before the article, not after. Nobody told me to do that.',
      'Telling a genuine breach apart from a thinner margin. The board had no application-level auth at all; the dashboard had one lock instead of two. One of those is an open door and the other is a reduced margin, and treating them the same would have wasted the day.',
      'Refusing to restore the data on the strength of the code being correct. I waited until I had watched production serve the login page for that exact URL.',
      'Deciding the 24 tests should be named after the failures — that the task file returns the gate and never the data for no cookie, a forged cookie, a foreign-secret cookie, and missing environment variables.',
    ],
    aiContribution: [
      'Ran the enumeration across every repository and deployment',
      'Built the middleware gate and the 24 tests',
      "Read the platform's protection semantics correctly once I asked the direct question",
    ],
    result:
      'The exposure was closed in about sixty seconds and then properly gated. No secrets were found in any repository history, and the private notes I most cared about were never exposed. The whole thing became an article, published under my own name, about finding my own task list on the internet.',
    evidence: [
      {
        kind: 'writing',
        label:
          'I was about to publish an article about my dashboard. First I checked whether it was safe.',
        access: 'public',
        href: 'https://smartdisruptions.com/content/my-private-task-list-was-public',
      },
      {
        kind: 'live',
        label: 'The board, now behind a gate (it returns a login page)',
        access: 'public',
        href: 'https://daily-kanban-mu.vercel.app/inbox.json',
      },
      {
        kind: 'metric',
        label:
          '24 tests on the gate; production observed denying before data was restored',
        access: 'private',
        note: 'The board lives in my private knowledge-base repository.',
      },
    ],
    skills: ['security-audit', 'publishing'],
    adjudication: {
      demonstrates: [
        'Auditing your own systems, finding something real, and publishing it rather than fixing it quietly',
        'Incident response ordering: stop the exposure with the reversible fix, then build the durable one',
        "Reading a platform's defaults literally instead of trusting what they are called",
      ],
      doesNotShow: [
        'That I would find a subtle vulnerability. This was an open file with no auth in front of it — the easiest class there is.',
        'That the gate holds against anyone determined. It has tests I wrote for the failures I thought of.',
        "That any of this was caught by a process. It was caught because I happened to be publishing that day, which is luck wearing a habit's clothes.",
      ],
      wouldClose: [
        'A scheduled audit that runs whether or not I am publishing something, with its findings logged',
        'An external review of the gate by somebody who did not write it',
      ],
    },
    resumeBullet:
      'Found and closed a production data exposure (43 records served at 200 OK) in ~60 seconds with zero downtime, then rebuilt the access control as fail-closed middleware with 24 tests, verified against production before restoring data.',
  },

  {
    slug: 'daily-kanban',
    title: 'Idea to phone home screen in one day',
    headline:
      'A single-file board with no dependencies and no backend, on my phone home screen the day I thought of it — then rebuilt around the one sentence of feedback that told me the touch model was wrong.',
    date: '2026-07-07',
    dateRange: '7 July → 3 August 2026',
    deployed: true,
    usedByOthers: false,
    problem:
      'I needed one board for everything — work, builds, family, the lot — and I needed it on my phone. Every tool I tried wanted an account, a subscription, or a data model that did not match how I actually think about a week.',
    priorKnowledge:
      'I had built plenty of web apps. I had never built a touch interaction model, and I had never tested gestures without a device in my hand.',
    hadToLearn: [
      'Synthesised-touch testing in a headless browser, so a gesture can be regression-tested without a phone',
      "How a browser's compatibility mouse events arrive after a touch, and why that makes a control pop under your finger",
      'That an overflow rule on one axis silently promotes the other',
    ],
    decisions: [
      {
        call: 'Single file, no dependencies, no backend.',
        why: 'It deploys anywhere, it cannot rot from a dependency update, and my data stays in my own browser. The constraint made the whole thing faster to build than the alternatives were to evaluate.',
      },
      {
        call: 'The gesture ladder: a flick pages the columns, a ~200ms hold arms a card, and the first direction moved decides between reveal and reorder.',
        why: 'The first version used a 500ms timer to pick the mode, which stole the mode from you if you moved early. Direction of first movement is a decision the user is already making.',
      },
      {
        call: 'A folder header drags the whole group, because a folder has no position of its own.',
        why: 'It renders wherever its first card sits, so moving the header and leaving the cards would be incoherent. That is the only honest meaning of the gesture.',
      },
      {
        call: 'Priority applies once per card id, never on every sync.',
        why: 'So a card I dragged by hand is never yanked back by the next update. A tool that fights the user loses.',
      },
    ],
    failures: [
      'A double vertical scroll that took real diagnosis: a horizontal overflow rule was silently promoting the vertical axis.',
      'A small slow sideways drag flung the board a full column, because the flick detector had no distance or velocity floor.',
      'A ghost tap on mobile where the trailing compatibility mouse events popped open the field that had just risen under the finger.',
      'The first touch model was wrong in a way I could not see and one sentence of real-thumb feedback exposed immediately.',
    ],
    iterations: [
      'Desktop build → mobile-first rework → gesture ladder redesign from real-device feedback → four columns collapsed to three from actual use',
      'Project grouping added from six one-line prompts typed on a phone',
      'Cards draggable → order settable from outside, once the real constraint was named',
    ],
    humanJudgment: [
      'Hearing "it flings when I drag slowly" and turning it into a diagnosis: the timer is stealing the mode. That translation from a sentence to a cause is the work.',
      "Naming the gap in my own feature request. I asked for the board to be draggable; it already was. What I actually needed was for the order to be settable from somewhere the board cannot see, because it lives in each device's local storage. Draggable and remotely-settable are different features and only one of them was missing.",
      'Collapsing four columns to three after using it, not after designing it. The extra column looked right and was not.',
      'Deciding the priority rule applies once per card so a manual drag is never undone — a small call that decides whether the tool feels like a partner or an opponent.',
    ],
    aiContribution: [
      'Built the whole thing, including the two Playwright suites with synthesised touch gestures',
      'Wrote the 17-check regression suite covering the exact reported bug',
      'Verified the group-move arithmetic in Node — members stay contiguous, orders stay sequential, no cards lost — before the change reached the device I depend on',
    ],
    result:
      'On my phone home screen the day I had the idea, and still the board I use daily. Six pull requests, each verified in a headless browser before merge, with a gesture suite that catches the touch bugs a desktop test never would.',
    evidence: [
      {
        kind: 'writing',
        label:
          'I put an app on my home screen in a day — here are the six prompts',
        access: 'public',
        href: 'https://smartdisruptions.com/content/six-prompts-one-day',
      },
      {
        kind: 'live',
        label: 'The board (gated — it returns a login page)',
        access: 'public',
        href: 'https://daily-kanban-mu.vercel.app',
      },
      {
        kind: 'metric',
        label:
          '17-check synthesised-touch suite; 3 real touch bugs caught before release',
        access: 'private',
        note: 'The board lives in my private knowledge-base repository.',
      },
    ],
    skills: ['product-judgment', 'directing-a-build'],
    adjudication: {
      demonstrates: [
        'Taking an idea to a daily-use tool in a day, then keeping it good under real use',
        'Turning a non-technical sentence of feedback into a root cause rather than a patch',
        'Verifying device-grade touch behaviour without a device',
      ],
      doesNotShow: [
        'That anyone else wants it. One user — me — and the feedback loop is me talking to myself.',
        'That the data model survives scale. It is local storage on one device, deliberately, and that ceiling has never been tested.',
        'Any design process beyond my own taste. There was no user research, because there were no users.',
      ],
      wouldClose: [
        'Three people using it for a month and telling me what broke',
        'A sync model that survives two devices, which is the first real constraint the current design would fail',
      ],
    },
    resumeBullet:
      'Shipped a dependency-free, backend-free Kanban board from idea to phone home screen in one day, with a 17-check synthesised-touch regression suite that caught 3 real gesture bugs pre-release.',
  },

  {
    slug: 'hero-system',
    title: 'Deleting six of the ten things I asked for',
    headline:
      'Asked for ten image templates, then measured my own instincts instead of trusting them — a card renders at 341px on a phone, 69% of the words were unreadable — and retired six templates that had cleared a bar the AI wrote for itself.',
    date: '2026-08-05',
    deployed: true,
    usedByOthers: false,
    problem:
      'The images on my site were bad and I assumed it was a sourcing problem — that I needed a better image generator. That framing was wrong, and it took a research question to find out.',
    priorKnowledge:
      "I had shipped the site's design system and dark mode. I had not built a generated-image pipeline, and I had never systematically checked whether a design decision I felt strongly about was actually correct.",
    hadToLearn: [
      'Rendering and encoding images in headless Chrome with no new dependency',
      'How to measure the real rendered width of an element on a phone rather than assuming the CSS says it',
      'That a template registry keyed on the evidence in the data removes the taste call entirely',
    ],
    decisions: [
      {
        call: 'A template is selected by what evidence the article has, not by which one looks nicer.',
        why: 'Taste calls do not survive a pipeline that writes three articles in the same two minutes. Putting a count in the data selects the count template; there is no template field and there must not be one.',
      },
      {
        call: 'The image specification is committed alongside the article.',
        why: 'The first version took the spec as a throwaway argument. When the template was redesigned, every spec had to be reconstructed from the alt text.',
      },
      {
        call: 'Retire six of the ten templates.',
        why: 'Each turned out to be the default template wearing a costume. Rendering the same articles both ways showed the plain one was bigger, clearer, and said the same thing.',
      },
      {
        call: 'The social card never varies, whatever the hero does.',
        why: 'Two different jobs. The hero lives on an index where variety is the point; the social card lives in a feed where being recognisable is.',
      },
    ],
    failures: [
      'The images were hardcoded to one theme, so roughly half of visitors got a black slab on a light page. That had been live for weeks.',
      'Every social card had been silently rendering in the wrong typeface for weeks, and nothing caught it.',
      'The layout assumed a card renders around 500px wide. On a phone it is 341px, and at that size 69% of the words were unreadable. I had approved those images.',
      'Six of my ten templates cleared a quality bar — one the AI had written for itself — and were still not doing the job.',
    ],
    iterations: [
      'One theme → both themes, full bleed, on the existing palette',
      'Ten templates → four, after rendering both versions side by side',
      'A throwaway spec argument → a committed specification file per article',
    ],
    humanJudgment: [
      'Not accepting the first framing. The question I asked was whether a better image tool would fix this; the answer was that it was a template bug, and taking the "no" seriously is what made the work possible.',
      'Distrusting my own instinct enough to measure it. "The letters will look inconsistent on mobile" was a hunch, and measuring turned it into 341px and 69% — a number I could act on.',
      'Settling a disagreement by rendering both versions rather than arguing about them. That is what retired the six templates, and it is a cheaper way to be right than a debate.',
      'Deleting work I asked for. The templates existed because I requested them; the evidence said they were not earning their place.',
      'Asking the AI to be honest instead of agreeable, and meaning it.',
    ],
    aiContribution: [
      'Built the generator, all ten templates, and then rebuilt it around four',
      'Rendered both versions side by side on request so the comparison could be looked at rather than argued',
      'Wrote the specification format and the registry that keys a template to its evidence',
    ],
    result:
      'Four templates, each owning one kind of evidence, both themes, drawn to survive at the smallest size they actually appear at. Six pull requests, and a documented bar for adding a new one: not "does this need its own data", but "can the plain template not draw this".',
    evidence: [
      {
        kind: 'live',
        label: 'The images, in both themes, on the site',
        access: 'public',
        href: 'https://smartdisruptions.com/content',
      },
      {
        kind: 'code',
        label:
          'The generator, its registry, and the written reasoning for the cut',
        access: 'public',
        href: 'https://github.com/smartDisruptions/web-smartDisruptions/blob/main/scripts/make-hero.mjs',
      },
      {
        kind: 'metric',
        label:
          'Measured: 341px real render width on a phone; 69% of words unreadable',
        access: 'public',
        href: 'https://github.com/smartDisruptions/web-smartDisruptions/blob/main/AGENTS.md',
      },
    ],
    skills: ['directing-a-build', 'design-system'],
    adjudication: {
      demonstrates: [
        'Directing an AI build and rejecting its output on evidence rather than preference',
        'Measuring an instinct instead of acting on it',
        'Deleting work you asked for when the comparison says to',
      ],
      doesNotShow: [
        'That the four templates are good, only that they are better than the six that were cut. Nobody outside has assessed them.',
        'Any reader response. There is no click-through data on these images.',
        'Design ability from scratch. This was editing and cutting a generated system, not originating a visual language.',
      ],
      wouldClose: [
        'Click-through or engagement numbers on articles before and after the rebuild',
        'A critique from a designer who did not build it',
      ],
    },
    resumeBullet:
      'Rebuilt a generated-image pipeline across 6 pull requests and cut it from ten templates to four, after measuring that cards render at 341px on mobile where 69% of the text was unreadable.',
  },

  {
    slug: 'market-storm',
    title: 'Turning my own tool into a section of the site',
    headline:
      'Took the research method I built for myself and made it a product surface — a report schema so the next one is a data object, not a rebuild — and ran a deterministic design auditor until it stopped flagging the tells that make AI-built pages look AI-built.',
    date: '2026-08-01',
    dateRange: '1 → 5 August 2026',
    deployed: true,
    usedByOthers: false,
    problem:
      'I had a research method that produced good work and nowhere for it to live. My site had writing on it; it had no way to publish structured research where the method itself is visible.',
    priorKnowledge:
      'I had built the site and its design system. I had never designed a content schema meant to be filled repeatedly by someone in a hurry, and I had never used an automated design auditor.',
    hadToLearn: [
      "Generating social cards through the framework's own image response rather than screenshotting a page",
      'Semantic colour tokens for data polarity that hold accessibility in both themes',
      'Which visual patterns read as machine-generated, from a detector with 58 deterministic rules',
    ],
    decisions: [
      {
        call: 'A report is a data object, not a page.',
        why: 'If report two requires component work, there will not be a report five. The schema is the whole bet.',
      },
      {
        call: 'Method-forward, not tips-forward. Research, not advice, with a standing disclaimer.',
        why: 'I am not licensed to advise anyone and the interesting part is the pipeline, not the ticker.',
      },
      {
        call: 'Reports fire on a real catalyst, with no calendar promise.',
        why: 'A weekly cadence I cannot keep is a broken promise on a schedule. An earnings report or a major deal is an honest trigger.',
      },
      {
        call: 'Every suppression in the design auditor carries a written reason. "Intentional" is not a reason.',
        why: 'An ignore file with no reasoning is how a design system quietly dies. It is also the rejection log I had been meaning to keep.',
      },
      {
        call: "The index card shows each company's own figures, not the method's verification counts.",
        why: 'The counts carried the same three labels on every card, so they read as chrome and said nothing about the company. A card is a promise about the page it opens.',
      },
    ],
    failures: [
      'The first design sweep lit up with every machine-generated tell I had instinctively reached for: coloured side-rails on cards, top-rails on panels, cramped bordered tables, nested cards, an all-caps line.',
      'The section 404ed on its first production deploy, because I had probed the URL before it existed and the edge cached the miss. I nearly rolled back a working build.',
      'A preview link I handed over for review was broken, and it looked fine from my own logged-in session. A share token minted against a deep path does not survive the login redirect.',
    ],
    iterations: [
      'One report as a page → a reusable schema, proven when report two shipped as a single data append with zero component work',
      "Method chips on the index cards → each company's actual figures, reusing the report page's own component",
      'First design sweep → reworked into the house idiom until the section passed clean',
    ],
    humanJudgment: [
      'Choosing method-forward over tips-forward — the harder sell, and the only honest one given I hold no licence to advise anybody.',
      'Choosing a catalyst-driven cadence over a weekly one because I could see my own automation was unreliable. Promising a schedule I would miss was the worse option.',
      'Rejecting the design auditor by name where it was wrong, in writing, scoped so the same pattern elsewhere still fires. That file is a record of what the tool got wrong and why.',
      'Deciding the section only earns its keep as a linkable, subscribe-worthy asset rather than more output into a void — the honest strategic read, given reach is my actual bottleneck.',
      'Recognising the index cards were describing the method rather than the company, which is a subtle failure nothing flagged.',
    ],
    aiContribution: [
      'Built the section, the schema, the report dashboard, and the generated social cards',
      'Ran the research that fills the reports',
      'Reworked every flagged design pattern into the sanctioned house idiom',
    ],
    result:
      'Live, with five reports published. The schema claim is tested rather than asserted: report two shipped as one append to a data file with no component work at all. The verification ledger on each report shows how many claims survived, how many were downgraded, and how many were corrected.',
    evidence: [
      {
        kind: 'live',
        label: 'Market Storm, live',
        access: 'public',
        href: 'https://smartdisruptions.com/market-storm',
      },
      {
        kind: 'artifact',
        label: 'A report, with its verification ledger',
        access: 'public',
        href: 'https://smartdisruptions.com/market-storm/msft-q4-fy2026',
      },
      {
        kind: 'code',
        label: 'The design system the auditor enforces, exported and committed',
        access: 'public',
        href: 'https://github.com/smartDisruptions/web-smartDisruptions/blob/main/DESIGN.md',
      },
    ],
    skills: ['agent-orchestration', 'design-system'],
    adjudication: {
      demonstrates: [
        'Productising a personal tool into a repeatable section of a live site',
        'Designing a schema whose payoff is testable, and then testing it',
        'Using a deterministic auditor as a forcing function, and overruling it in writing where it was wrong',
      ],
      doesNotShow: [
        'That anyone reads the reports. There is no readership figure here and I am not going to imply one.',
        'That the analysis is any good, which is a different skill from the pipeline that produces it.',
        'That the cadence holds. Five reports is a start, not a track record.',
      ],
      wouldClose: [
        'Traffic and subscriber numbers attributable to the section over a defined period',
        'A dated call from a report scored against the outcome',
      ],
    },
    resumeBullet:
      'Built a research-report section on a live site around a reusable schema, proven when the second report shipped as a single data append with zero component work; passed a 58-rule design audit with every suppression documented.',
  },

  {
    slug: 'brain-graph',
    title: 'Giving my AI a memory it can navigate',
    headline:
      'A linked knowledge base every AI session reads before it does anything, rendered as a graph I can browse on my phone — tested cold on a fresh session, which scored six out of ten from the notes alone.',
    date: '2026-07-03',
    dateRange: '3 → 21 July 2026',
    deployed: true,
    usedByOthers: false,
    problem:
      'Every AI session started from zero. I re-explained who I am, what I am building, and what I decided last week, every single time. The context I needed was scattered across three years of chat histories nobody would ever read again.',
    priorKnowledge:
      'I had used AI daily for years and had a hand-maintained context file. I had not built a knowledge system with a retrieval policy, and I had never used a GPU-accelerated rendering library.',
    hadToLearn: [
      'Force-directed graph layout and GPU-accelerated rendering in a browser',
      'How to write a retrieval policy an agent will actually follow — a documented two-hop rule, so it stops wandering',
      'Deterministic builds from markdown, so the graph and the notes cannot disagree',
    ],
    decisions: [
      {
        call: 'Every note describes itself in its own header.',
        why: 'One command then returns the entire map of the system. That is a retrieval policy, and I designed it before I knew the field had a name for it.',
      },
      {
        call: 'A documented two-hop limit: entry point to note, or entry point to index to note.',
        why: 'Without a stated ceiling an agent explores, and exploring costs the context window that the notes were supposed to save.',
      },
      {
        call: 'No capture inbox, despite it being the obvious design.',
        why: 'I considered it and rejected it. My actual capture habit is pasting into a session, because I always have one open. A system built around a habit I do not have is a system I will not use.',
      },
      {
        call: 'Sensitive notes fail closed: any build that does not explicitly opt in strips their content.',
        why: 'The default has to be the safe one. A flag that has to be remembered to protect something will eventually be forgotten.',
      },
    ],
    failures: [
      'The system was confidently wrong about its own history twice, and both times I caught it by checking reality instead of the notes — once about a DNS setup, once about a commit that had never happened.',
      "Reading a date from the wrong timezone made a session report six of about twenty items for a day's work, because it trusted a single date and did not cross-check against activity.",
      "An unquoted colon in one note's header silently broke every build of the graph until it was found.",
    ],
    iterations: [
      'A hand-maintained context file → a linked knowledge base → a browsable graph → a graph that installs on a phone and refreshes in place without losing your position',
      'Notes → notes that audit themselves, with a lint pass for dead links, orphans and staleness',
    ],
    humanJudgment: [
      'Rejecting the capture inbox. It is what every system like this has, and it was wrong for me. Knowing your own habits well enough to design against the obvious answer is the call.',
      'Testing it cold rather than assuming. A fresh session scored six of ten from the notes alone, and the misses were things I had genuinely never written down — which made the score useful instead of flattering.',
      'Deciding the redaction defaults to closed, because a protection you have to remember is not a protection.',
      'Writing down the failures as rules the system now enforces — check the artifacts, not the record — after being burned by its own account of itself twice.',
    ],
    aiContribution: [
      'Built the graph application across four phases, each validated in a headless browser',
      'Wrote the lint pass and the automatic rebuild pipeline',
      'Uses the system on every session, which is the only reason the design gets tested at all',
    ],
    result:
      'A fresh session on any surface — laptop, cloud, phone — already knows who I am and what I am building. It survived two weeks of continuous real use with zero manual cleanup, and it audits itself nightly.',
    evidence: [
      {
        kind: 'writing',
        label:
          "I stopped re-explaining myself to my AI — here's the one file that did it",
        access: 'public',
        href: 'https://smartdisruptions.com/content/stop-re-explaining-yourself-to-ai',
      },
      {
        kind: 'metric',
        label:
          'Cold-start test: 6 of 10 questions answered correctly from the notes alone, with sources',
        access: 'private',
        note: 'Run inside my own knowledge base, which is private — it holds notes about my family and my clients.',
      },
      {
        kind: 'code',
        label: 'The graph application',
        access: 'private',
        note: 'Private repository and a login-gated deployment, because the content is personal.',
      },
    ],
    skills: ['context-engineering'],
    adjudication: {
      demonstrates: [
        'Designing a retrieval policy an agent actually follows, and testing it cold rather than assuming it works',
        'Rejecting the obvious design in favour of one that matches a real habit',
        'A privacy model that fails closed by default',
      ],
      doesNotShow: [
        'That the design generalises. One user, whose habits it was designed around, which is exactly the thing that makes it work and the thing that makes it unproven.',
        'The score is 6 of 10, not 10. Four questions it could not answer, and I have left that number on the record rather than re-running it until it improved.',
        'Any of the code or the content, both of which are private.',
      ],
      wouldClose: [
        'Someone else running the same structure on their own material and reporting the cold-start score',
        'A public, content-free version of the structure that a stranger could clone and try',
      ],
    },
    resumeBullet:
      'Built a linked knowledge base with a documented retrieval policy read by every AI session across three surfaces; a cold-start test scored 6 of 10 with sources cited, and it ran two weeks of real use with zero manual cleanup.',
  },

  {
    slug: 'pebble-kart',
    title: 'My twelve-year-old built his own game',
    headline:
      'I taught my son the loop — one prompt to a prototype, then iterate — and he built a kart racer. His name on it, his features, his iterations. I did not build it for him.',
    date: '2026-05-01',
    dateRange: 'May 2026',
    deployed: true,
    usedByOthers: true,
    usedBy: 'Gabe, 12 — he built it, and other people play it',
    problem:
      'My son wanted to make a game. The honest options were to build it for him, or to teach him something he could use again. Only one of those is worth anything to him in five years.',
    priorKnowledge:
      'I knew the loop cold — I run it every day. What I had not done was teach it to somebody with no programming background at all, let alone a child, and find out which parts of it are actually load-bearing.',
    hadToLearn: [
      'Which parts of my own process are essential and which are habits I picked up along the way',
      'How to stop myself taking the keyboard, which is the entire difficulty of the exercise',
    ],
    decisions: [
      {
        call: 'Teach the loop, not the game.',
        why: 'A game I helped him finish is one game. The loop — describe it, get a prototype, look at it, ask for the next thing — is every game after it.',
      },
      {
        call: 'His features, even the ones I would not have picked.',
        why: 'Drive-over powerups, coins that make you faster, multi-stage courses, karts with different personalities. They are his ideas, which is why he kept going. Authorship is the fuel.',
      },
      {
        call: 'It goes on the site under his name.',
        why: 'The evidence rule applies to him too. A thing you made that other people can play is different from a thing you made.',
      },
    ],
    failures: [
      'I do not have a full contemporaneous record of this one. I wrote it up in July from memory of a May build, and the process detail is thinner than the projects I logged while they happened. That is exactly the problem this engine exists to solve, and my own best story is the one it caught me out on.',
    ],
    iterations: [
      'One prompt to a playable prototype → follow-up prompts adding his features one at a time',
      'A second game after it, which is the part that actually proves the loop transferred',
    ],
    humanJudgment: [
      'Deciding to teach rather than build. That is the whole thing, and it costs more time in the moment.',
      'Not taking the keyboard when the obvious fix was right there. The temptation is constant and giving in once resets the lesson.',
      'Letting his feature ideas win over better ones, because ownership is what kept him at it.',
      "Putting it on the site under his name — treating a twelve-year-old's work as real work with a real URL.",
    ],
    aiContribution: ['Wrote the game, from his prompts, not mine'],
    result:
      'A kart racer he built himself, playable at a real URL, with the features he chose. Then a second game, which is the part that shows the loop transferred rather than the outcome being lucky.',
    evidence: [
      {
        kind: 'live',
        label: 'Pebble Kart — playable',
        access: 'public',
        href: 'https://pebble-kart-ten.vercel.app',
      },
      {
        kind: 'live',
        label: 'In the arcade on this site, under his name',
        access: 'public',
        href: 'https://smartdisruptions.com/games',
      },
      {
        kind: 'testimony',
        label: 'That he built it himself, with me not touching the keyboard',
        access: 'private',
        note: 'My account of what happened in my own house. Nobody else was in the room, and the record was written two months later.',
      },
    ],
    skills: ['teaching-the-loop'],
    adjudication: {
      demonstrates: [
        'Teaching the loop to a complete beginner well enough that they ship on their own',
        'That the method transfers to someone with no technical background at all',
      ],
      doesNotShow: [
        'A contemporaneous record. This is the weakest-documented project here, reconstructed from memory two months after the fact — which is precisely the failure this engine is built to prevent, on my best story.',
        'That it works for anyone but my own child, in my own house, with me available the whole time.',
        'Anything measurable. No play count, no completion data, no second learner.',
      ],
      wouldClose: [
        'Teaching the same loop to a kid who is not mine, with the session recorded as it happens rather than remembered',
        'A play count on the game, or his own written account in his words',
      ],
    },
    resumeBullet:
      'Taught the AI build loop to a 12-year-old with no coding background well enough that he shipped 2 playable games of his own design, the second one unaided.',
  },
];

export const profile: Profile = {
  handle: 'josh',
  name: 'Josh Escusa',
  tagline:
    'Self-taught builder. Three years of daily work with AI, on the record.',
  intro:
    'This page was not written as a portfolio. It was assembled from a record I kept while the work was happening — dated entries, linked artifacts, the failures included — and then graded by rules I do not get to argue with. Where a claim has nothing openable behind it, the page says so. That is the point of it.',
  photo: '/images/josh.webp',
  links: [
    { label: 'smartdisruptions.com', href: 'https://smartdisruptions.com' },
    { label: 'About me', href: '/about' },
    { label: 'Everything I have shipped', href: '/apps' },
  ],
  recordFrom: '2026-03-01',
  recordTo: '2026-08-05',
  skills,
  caseStudies,
  declaredGaps: [
    {
      gap: 'Nobody has reviewed my code. Every project here was written with an AI and read by me, and that is the whole review process.',
      wouldClose:
        'A merged pull request on a repository I do not own, with review comments from a maintainer I had to satisfy.',
    },
    {
      gap: 'I have never maintained a system somebody else designed, over a long enough period to inherit its decisions. The one unfamiliar codebase here was one I finished, not one I lived with.',
      wouldClose:
        'Six months of ownership of a codebase I did not write, with a change log showing what I chose not to rewrite.',
    },
    {
      gap: 'Almost everything here has one user. Where a project has a second person, it is a friend or my son.',
      wouldClose:
        'One tool used by ten people who owe me nothing, with a usage number I did not have to caveat.',
    },
  ],
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return profile.caseStudies.find((c) => c.slug === slug);
}

export function getProfile(handle: string): Profile | undefined {
  return handle === profile.handle ? profile : undefined;
}

export const profiles: Profile[] = [profile];
