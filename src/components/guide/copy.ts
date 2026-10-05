// All the words on the page live here, so the components only arrange them.
// Prices are Anthropic's list prices as of October 2026.

export const TITLE =
  'Claude Code subscription vs API credits: one builds your game, one runs it';

export const EXCERPT =
  "A flat monthly plan covers Claude building, fixing and growing your project. API credits are for when your finished app talks to Claude for other people. Here's where the line sits, in plain words.";

export const PRICES = {
  pro: 20,
  maxLow: 100,
  maxHigh: 200,
  apiIn: 4,
  apiOut: 20,
};

// My rough math for one hour of steady building in Claude Code, priced as if
// it ran on the API. Shown in full in the "how I got this number" panel.
export const DOLLARS_PER_HOUR = 6;

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
  cost: number; // illustrative API-equivalent dollars
};

export const DAY: Task[] = [
  {
    title: 'Build the combat system',
    plain:
      'Claude writes the code that decides what happens when you swing, block and get hit.',
    cost: 8.4,
  },
  {
    title: 'Fix a bug',
    plain:
      'The sword hits twice instead of once. Claude reads the code, finds out why, and fixes it.',
    cost: 3.1,
  },
  {
    title: 'Make the glow effects',
    plain:
      'These are called shaders: small programs that tell the screen how to draw light, sparks and color.',
    cost: 4.6,
  },
  {
    title: 'Write the branching dialogue',
    plain:
      'Conversations that change depending on what the player picks. Claude builds the system that keeps track.',
    cost: 5.2,
  },
  {
    title: 'Build a level-making tool',
    plain:
      'A small helper that makes it faster to put levels together, so you spend less time on busywork.',
    cost: 3.9,
  },
  {
    title: 'Run the checks',
    plain:
      "Quick automatic tests that make sure the new stuff didn't break the old stuff.",
    cost: 1.8,
  },
  {
    title: 'Tidy everything up',
    plain:
      "Reorganizing the code so it's easier to change later. Like cleaning your room so you can find things again.",
    cost: 4.3,
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
    text: 'A program runs Claude thousands of times a day on its own',
    answer: 'api',
    why: 'Big automatic jobs that run without a person are API work.',
  },
];

export type Level = { id: string; n: number; label: string; kanji: string };

// The page is laid out like a level-select map: six stops, then the finish.
// Kanji are drawn from the baked brush set (src/components/brand/glyphs.ts).
export const LEVELS: Level[] = [
  { id: 'why', n: 1, label: 'Why I asked', kanji: '探' },
  { id: 'pay', n: 2, label: 'Two ways to pay', kanji: '道' },
  { id: 'day', n: 3, label: 'A day of building', kanji: '作' },
  { id: 'line', n: 4, label: 'Where the line is', kanji: '岐' },
  { id: 'sort', n: 5, label: 'Your turn', kanji: '遊' },
  { id: 'month', n: 6, label: 'Your month', kanji: '月' },
];
