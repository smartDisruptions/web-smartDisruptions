// All the words on the page live here, so the components only arrange them.
// Written for someone who has never coded or used AI: every term is defined
// before it is used, every number says what it counts, and nothing leans on
// jargon. Prices are Anthropic's posted prices as of October 2026.

export const TITLE =
  'Claude Code: monthly plan or pay per use? Most games only need the plan';

// The publish date, in one place: the guide's byline, its metadata and its
// card on the Writing page (src/lib/fieldNotes.ts) all read it from here.
export const PUBLISHED = '2026-10-06';

export const EXCERPT =
  'Claude Code subscription vs API credits, in plain words. A flat monthly plan covers building your game, website or app with Claude. Paying per use only comes in if your finished app needs Claude to talk to other people.';

export const PRICES = {
  pro: 20,
  maxLow: 100,
  maxHigh: 200,
  apiIn: 4,
  apiOut: 20,
  sonnetIn: 2,
  sonnetOut: 10,
};

export type Word = {
  term: string;
  plain: string;
  icon: 'code' | 'door' | 'chunk' | 'clock' | 'spark' | 'stack' | 'people';
};

// The words a reader meets on this page, in the order they meet them.
export const WORDS: Word[] = [
  {
    term: 'Claude',
    icon: 'spark',
    plain:
      'An AI made by a company called Anthropic. You talk to it in plain English, and it can answer questions, write, and build things.',
  },
  {
    term: 'Claude Code',
    icon: 'code',
    plain:
      'A version of Claude that builds software for you. You describe what you want, and it writes the code, tries it out and fixes what breaks.',
  },
  {
    term: 'Plan (subscription)',
    icon: 'clock',
    plain:
      'A flat monthly price for using Claude yourself: Pro is $20 a month, and Max is $100 or $200. Claude Code is included.',
  },
  {
    term: 'Usage limit',
    icon: 'clock',
    plain:
      "Your plan has a cap on how much you can use. The cap resets on a schedule, and there is also a weekly cap. If you hit it, you can't use Claude until it resets, unless you move to a bigger plan or pay per use for more. The price of your plan never jumps on you.",
  },
  {
    term: 'API (paying per use)',
    icon: 'door',
    plain:
      'The way an app talks to Claude by itself, with no person typing. It is billed per use, like a taxi meter: every bit of reading and writing costs a little.',
  },
  {
    term: 'Token',
    icon: 'chunk',
    plain:
      'The small pieces Claude reads and writes in. One token is about three quarters of a word, so a million tokens is about 750,000 words.',
  },
  {
    term: 'Sonnet, Opus and Haiku',
    icon: 'stack',
    plain:
      'Different sizes of Claude. Opus is the biggest and costs the most, Sonnet is the middle one, and Haiku is the smallest and cheapest. A number after the name, like 5.5, is the version.',
  },
  {
    term: 'Helper agents',
    icon: 'people',
    plain:
      'Extra copies of Claude that work on different parts of a job at the same time, like a small team. Faster, but every copy costs.',
  },
];

export type Task = {
  title: string;
  plain: string;
  cost: number; // dollars if paid per use, from my real receipt
};

// Where my real $535.94 went (vault, AI Builder Skill Tree, "My plan vs the
// API"). The tracker splits it 61% rereading, 17% saving to memory, 22%
// output; the output is split here by tokens (6.4M of 9.7M were thinking),
// so those two are close estimates. Rounded to whole dollars, they sum to $536.
export const DAY: Task[] = [
  {
    title: 'Rereading the whole conversation',
    plain:
      "Claude doesn't remember the way you do. Before every step, it reads the whole conversation again from the start so it doesn't lose track.\n\nMine grew to about 440,000 tokens, about four novels long, and Claude reread it thousands of times. Each reread is cheap, but thousands of them made this the biggest part of the bill.",
    cost: 327,
  },
  {
    title: 'Saving new work so it can be reread cheaply',
    plain:
      'The conversation is kept ready so rereading it costs less. Every time something new was added, like a message from me or a file Claude opened, adding it cost a little more than rereading it.',
    cost: 91,
  },
  {
    title: 'Thinking before acting',
    plain:
      'Before Claude writes anything, it thinks the problem through, like working out a math problem on scrap paper. You never see this thinking, but it is paid for. About two thirds of everything Claude produced was thinking.',
    cost: 78,
  },
  {
    title: 'Writing the code and the replies',
    plain:
      'This is the part you actually see: the code that makes the game work, and the messages Claude wrote back to me. It was the smallest part of the bill.',
    cost: 40,
  },
];

export type SortItem = {
  text: string;
  answer: 'plan' | 'api';
  why: string;
};

export const SORT: SortItem[] = [
  {
    text: 'Claude writes your game',
    answer: 'plan',
    why: "You're at the keyboard and Claude is building for you. Your plan covers it.",
  },
  {
    text: 'Claude fixes a bug in your game',
    answer: 'plan',
    why: 'You are still building. Fixing mistakes is part of making something.',
  },
  {
    text: 'Claude builds your website',
    answer: 'plan',
    why: "The website is the thing you're making. Once it's online, it doesn't need Claude to load.",
  },
  {
    text: 'Claude builds an app you plan to sell',
    answer: 'plan',
    why: "Selling it later doesn't change who is building it now: you, with Claude.",
  },
  {
    text: 'Claude helps you update and tidy your project',
    answer: 'plan',
    why: 'Updates, cleanups and new features are all part of building.',
  },
  {
    text: 'Your finished app asks Claude a question by itself, with nobody typing',
    answer: 'api',
    why: "Now your app is talking to Claude without you. That's what paying per use is for.",
  },
  {
    text: 'Players chat with a character in your game, and Claude writes its replies live',
    answer: 'api',
    why: 'Every player conversation is a new request to Claude, so each one is paid per use.',
  },
  {
    text: "Claude writes all the dialogue for your game's characters while you build",
    answer: 'plan',
    why: "Claude writes it once, and it's saved into the game. Players read it. Nothing calls Claude while they play.",
  },
];

export type Level = { id: string; n: number; label: string; kanji: string };

// The page is laid out like a level-select map: seven stops, then the finish.
// Kanji are drawn from the baked brush set (src/components/brand/glyphs.ts).
export const LEVELS: Level[] = [
  { id: 'why', n: 1, label: 'The question', kanji: '探' },
  { id: 'pay', n: 2, label: 'Two ways to pay', kanji: '道' },
  { id: 'day', n: 3, label: '4 days, priced two ways', kanji: '作' },
  { id: 'others', n: 4, label: "Other people's bills", kanji: '学' },
  { id: 'line', n: 5, label: 'Do you need to pay per use?', kanji: '岐' },
  { id: 'sort', n: 6, label: 'Your turn', kanji: '遊' },
  { id: 'month', n: 7, label: 'Your month', kanji: '月' },
];

// My real receipt, from the vault (AI Builder Skill Tree, "My plan vs the
// API", checked 2026-10-06). Per-use figures are Claude Code's own cost
// tracker; the plan share is a reading of the plan's usage screen, which also
// counts other work that week, so it is approximate.
export const RECEIPT = {
  dates: 'Oct 2 to Oct 6, 2026',
  days: 4,
  helpers: 10,
  lines: [
    { model: 'Sonnet 5.5', note: 'middle-size Claude', cost: 408.67 },
    { model: 'Opus 5.5', note: 'biggest Claude', cost: 126.98 },
    { model: 'Haiku', note: 'smallest Claude', cost: 0.29 },
  ],
  apiTotal: 535.94,
  planShare: 15,
  planWeek: 46,
  planCost: 7,
  times: 75,
  rereadShare: 61,
  rereadPerStep: '440,000',
  // Day rates for the calculator, from the same receipt: Oct 3 (ten helper
  // agents) was about $400; the other three days shared the remaining ~$136.
  bigDay: 400,
  normalDay: 45,
  // If 15% of a week's allowance was $535.94 at per-use prices, a full week is
  // worth about $3,573. A rough reading, and the calculator says so.
  weekAllowance: 3573,
};

export type Bill = {
  amount: string;
  kind: 'Real bill' | 'Expected bill' | 'If paid per use' | 'Average cost';
  who: string;
  what: string;
  lesson: string;
  source: string;
  url: string;
};

// People who shared what AI coding cost them, checked 2026-10-06. Each one
// links to its source. The tone is thanks: they put real numbers in public,
// which is how the rest of us learn. People are "they" unless they are named
// on their own byline.
export const BILLS: Bill[] = [
  {
    amount: '$13 a day',
    kind: 'Average cost',
    who: 'Anthropic, the company that makes Claude',
    what: 'Anthropic says that for companies paying per use, one programmer using Claude Code costs about $13 for each day they use it, or $150 to $250 a month. Nine out of ten stay under $30 a day.',
    lesson:
      'Anthropic says the big bills usually come from conversations that kept growing and were never restarted, or from always using the biggest, most expensive version of Claude.',
    source: 'Claude Code help pages: Manage costs effectively',
    url: 'https://code.claude.com/docs/en/costs',
  },
  {
    amount: '$15,000+',
    kind: 'If paid per use',
    who: 'A programmer who writes online as ksred',
    what: 'They used a free tracking tool to add up eight months of their Claude Code use. Paid per use, it would have cost over $15,000. They were on a monthly plan instead and paid about $800 in total.',
    lesson:
      'More than 90% of their usage was Claude rereading earlier work. That is the same pattern as my own measurement.',
    source: 'ksred.com: Claude Code Pricing Guide',
    url: 'https://www.ksred.com/claude-code-pricing-guide-which-plan-actually-saves-you-money/',
  },
  {
    amount: 'Tens of thousands of dollars',
    kind: 'If paid per use',
    who: 'One person on the $200 plan',
    what: 'In July 2025, Anthropic said one person on the $200 plan had used tens of thousands of dollars worth of Claude, mostly by leaving it running day and night.',
    lesson:
      "This is part of why plans now have weekly limits. A flat price works because most of us don't run Claude around the clock.",
    source: 'Anthropic on X (formerly Twitter), July 28, 2025',
    url: 'https://x.com/AnthropicAI/status/1949898511287226425',
  },
  {
    amount: '$1,800 in 2 days',
    kind: 'Real bill',
    who: 'Someone on the $200 plan',
    what: 'They had set up small programs to run Claude automatically, over and over. An old API key (a kind of password that tells Anthropic to bill you per use) was still saved on their computer, so the charges went to a pay-per-use account instead of their plan.',
    lesson:
      'Check which account is paying. In Claude Code you can type /status and press Enter to see it.',
    source: 'GitHub (a site where people report software problems), March 2026',
    url: 'https://github.com/anthropics/claude-code/issues/37686',
  },
  {
    amount: '$8,000 a month',
    kind: 'Expected bill',
    who: 'Jason Lemkin, founder of the business community SaaStr',
    what: 'Lemkin wrote that they expected to spend about $8,000 in one month building an app with Replit, a different AI building tool that charges per use.',
    lesson:
      'Lemkin felt it was still far cheaper than hiring a team to build the same app. Paying per use can be worth it when the work is worth it.',
    source: "SaaStr: Why I'll Likely Spend $8,000 on Replit This Month Alone",
    url: 'https://www.saastr.com/why-ill-likely-spend-8000-on-replit-this-month-alone-and-why-thats-ok/',
  },
];
