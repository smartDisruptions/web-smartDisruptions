import { appSample, pic, type Sample } from '@/components/build/samples';

/**
 * The samples on /build-apps: three of my apps, live, standing on the shelf.
 * Each comes from src/data/apps.ts; this list says what kind of thing it is
 * and which pictures to show. AI Diary's screenshots are phone-tall, so it
 * shows three of them side by side: the journal, the companion and the
 * insights its line talks about.
 */
export const SAMPLES: Sample[] = [
  appSample('pomodoro-timer', {
    kind: 'Focus timer',
    goLabel: 'Try the app',
    pictures: [
      pic(
        '/images/apps/pomodoro-thumbnail.webp',
        'Patch’s Pomodoro: Patch at her desk in a room above a neon city, beside the wind-up tomato timer counting down.'
      ),
    ],
  }),
  appSample('ai-diary', {
    kind: 'Journal',
    goLabel: 'Try the app',
    pictures: [
      pic('/images/apps/ai-diary-1.png', 'AI Diary’s journal page, asking how your day was.'),
      pic('/images/apps/ai-diary-2.png', 'AI Diary’s companion, ready to talk about an entry.'),
      pic(
        '/images/apps/ai-diary-3.png',
        'AI Diary’s insights: personality, mood over time and writing style.'
      ),
    ],
  }),
  appSample('portfolio-ledger', {
    kind: 'Net-worth tracker',
    goLabel: 'Try the app',
    pictures: [
      pic(
        '/images/apps/portfolio-ledger-thumbnail.webp',
        'Portfolio Ledger on made-up numbers: a net worth of $303,460, its trend line, and Patch saying what moved today.'
      ),
    ],
  }),
];
