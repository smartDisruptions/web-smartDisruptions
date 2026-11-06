import { appSample, pic, type Sample } from '@/components/build/samples';

/**
 * The samples on /build-apps: three of my apps, live, standing on the shelf.
 * Each comes from src/data/apps.ts; this list says what kind of thing it is
 * and which pictures to show. AI Diary's screenshots are phone-tall, so it
 * shows three of them side by side: the stream, the companion and the
 * patterns its line talks about.
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
      pic(
        '/images/apps/ai-diary-1.webp',
        'AI Diary’s stream: a week of entries as fireflies over night water, gold for calm days and blue for restless ones, under the words “Calm water tonight.”'
      ),
      pic(
        '/images/apps/ai-diary-2.webp',
        'AI Diary’s companion, Ember, suggesting a 2pm coffee cutoff after noticing late coffee in two entries.'
      ),
      pic(
        '/images/apps/ai-diary-3.webp',
        'AI Diary’s patterns: the week on the water, what Ember noticed, and five jars filled to show personality traits.'
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
