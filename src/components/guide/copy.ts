// All the words on the page live here, so the components only arrange them.
// Prices are Anthropic's list prices as of October 2026.

export const TITLE =
  'Claude Code subscription vs API credits: most games never need the API';

export const EXCERPT =
  "Your Claude plan covers building your game, website or app. Once it's made, most of them run on their own. The API only comes in when you want Claude inside the finished thing, like a character that talks back.";

export const PRICES = {
  pro: 20,
  maxLow: 100,
  maxHigh: 200,
  apiIn: 4,
  apiOut: 20,
};

export type Word = {
  term: string;
  plain: string;
  icon: 'code' | 'door' | 'chunk' | 'clock';
};

export const WORDS: Word[] = [
  {
    term: 'Claude Code',
    icon: 'code',
    plain:
      'Claude working inside your project folder. It can read your files, write code, try it out, and fix what breaks.',
  },
  {
    term: 'API',
    icon: 'door',
    plain:
      'A doorway that lets one program talk to another. Your app knocks, Claude answers, and a meter ticks each time.',
  },
  {
    term: 'Token',
    icon: 'chunk',
    plain:
      'The small chunks Claude reads and writes in. One token is about three quarters of a word. A million tokens is roughly ten novels.',
  },
  {
    term: 'Usage limit',
    icon: 'clock',
    plain:
      "How much your plan lets you use before it resets. If you hit it, you wait for the reset or move up to a bigger plan. You won't get a surprise bill.",
  },
];

export type Task = {
  title: string;
  plain: string;
  cost: number; // dollars at API prices, from my real receipt
};

// Where my real $535.94 went (vault, AI Builder Skill Tree, "My plan vs the
// API"). The tracker splits it 61% rereading, 17% saving to the cache, 22%
// output; the output is split here by tokens (6.4M of 9.7M were thinking),
// so those two are close estimates. Rounded to whole dollars, they sum to $536.
export const DAY: Task[] = [
  {
    title: 'Rereading the whole conversation',
    plain:
      "Before every step, Claude reads everything so far again so it doesn't lose track. Mine was about 440,000 tokens a step, over and over. Most of it came from a cheap short-term memory, but it added up.",
    cost: 327,
  },
  {
    title: 'Saving new work to memory',
    plain:
      'Every new message and every file Claude opens gets saved to that short-term memory, so the next step can reread it cheaply.',
    cost: 91,
  },
  {
    title: 'Thinking before acting',
    plain:
      'Claude works a problem through before it writes anything. 6.4 million of the 9.7 million tokens it wrote were thinking.',
    cost: 78,
  },
  {
    title: 'Writing the code and the words',
    plain:
      'The part you actually see: the code for the levels, the files, and the replies to me. It was the smallest slice.',
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
    why: 'Still you, still building. Fixing is part of making.',
  },
  {
    text: 'Claude builds your website',
    answer: 'plan',
    why: "The website is the thing you're making. Once it's live, it doesn't need Claude to load.",
  },
  {
    text: 'Claude builds an app you plan to sell',
    answer: 'plan',
    why: "Selling it later doesn't change who's building it now: you, with Claude.",
  },
  {
    text: 'Claude helps you update and tidy your project',
    answer: 'plan',
    why: 'Updates, cleanups and new features are all building work.',
  },
  {
    text: 'Your finished app asks Claude a question by itself',
    answer: 'api',
    why: "Now your app is talking to Claude without you. That's what the API is for.",
  },
  {
    text: 'Your players chat with a character Claude is voicing',
    answer: 'api',
    why: 'Every player conversation is a request to Claude, so each one runs on the meter.',
  },
  {
    text: "Claude writes all the dialogue for your game's characters",
    answer: 'plan',
    why: "Claude writes it once while you build, and it's saved into the game. Players read it. Nothing calls Claude while they play.",
  },
];

export type Level = { id: string; n: number; label: string; kanji: string };

// The page is laid out like a level-select map: seven stops, then the finish.
// Kanji are drawn from the baked brush set (src/components/brand/glyphs.ts).
export const LEVELS: Level[] = [
  { id: 'why', n: 1, label: 'Why I asked', kanji: '探' },
  { id: 'pay', n: 2, label: 'Two ways to pay', kanji: '道' },
  { id: 'day', n: 3, label: 'Where my $536 went', kanji: '作' },
  { id: 'others', n: 4, label: "Other people's bills", kanji: '学' },
  { id: 'line', n: 5, label: 'Do you need the API?', kanji: '岐' },
  { id: 'sort', n: 6, label: 'Your turn', kanji: '遊' },
  { id: 'month', n: 7, label: 'Your month', kanji: '月' },
];

// My real receipt, from the vault (AI Builder Skill Tree, "My plan vs the
// API", checked 2026-10-06). API figures are Claude Code's own cost tracker;
// the plan share is a reading of Settings → Usage, which also counts other
// sessions that week, so it is approximate.
export const RECEIPT = {
  dates: 'Oct 2–6, 2026',
  days: 4,
  helpers: 10,
  lines: [
    { model: 'Sonnet 5.5', cost: 408.67 },
    { model: 'Opus 5.5', cost: 126.98 },
    { model: 'Haiku', cost: 0.29 },
  ],
  apiTotal: 535.94,
  planShare: 15,
  planCost: 7,
  times: 75,
  rereadShare: 61,
  rereadPerStep: '440,000',
  // Day rates for the calculator, from the same receipt: Oct 3 (ten helper
  // agents) was about $400; the other three days shared the remaining ~$136.
  bigDay: 400,
  normalDay: 45,
  // If 15% of a week's allowance was $535.94 at API prices, a full week is
  // worth about $3,573. A rough reading, and the calculator says so.
  weekAllowance: 3573,
};
