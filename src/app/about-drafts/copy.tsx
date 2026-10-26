import Link from 'next/link';
import type { KiruPose } from '@/components/kiru/Kiru';

/**
 * The words every About draft shares (October 2026). Josh asked for About
 * to stop being a résumé: a brief about me, a plain note that I build the
 * site and the things on it with Claude, and three ways in — the Arcade,
 * the Writing and Learn. The four drafts differ in design only, so they all
 * read this one copy and a comparison is about the layout, not the words.
 *
 * Every claim here is one the live site already makes (self-taught since
 * 2008, an engineer at a university, games with my son, the AI note under
 * the writing). Nothing new is asserted.
 */

export const NAME = 'Josh Escusa';

export const BIO = [
  'I’ve been teaching myself to build things since 2008, and by day I’m a software engineer at a university.',
  'After hours I build websites, apps and games, and I put them here. A few of the games I made with my son.',
];

export const CLAUDE = {
  lead: 'I use Claude heavily.',
  body: 'Claude is an AI made by Anthropic, and I build with it every day. It helped build this site and the apps and games on it. I decide what gets made, I read every change, and I say when it goes live.',
  writing:
    'It helps with the writing too. The experiences are mine, and I read and approve every word before it’s posted.',
};

export type Door = {
  href: string;
  kanji: string;
  /** What the kanji means, for the reader who wonders. */
  gloss: string;
  name: string;
  line: string;
  pose: KiruPose;
};

export const DOORS: Door[] = [
  {
    href: '/games',
    kanji: '遊',
    gloss: 'play',
    name: 'The Arcade',
    line: 'Games I built. Free, and they run in your browser.',
    pose: 'game',
  },
  {
    href: '/content',
    kanji: '書',
    gloss: 'write',
    name: 'The Writing',
    line: 'What I learn building with AI, with the receipts.',
    pose: 'read',
  },
  {
    href: '/learn',
    kanji: '学',
    gloss: 'learn',
    name: 'Learn',
    line: 'How to build websites, apps and games with AI, in plain words.',
    pose: 'wave',
  },
];

export const DRAFTS = [
  {
    slug: 'letter',
    n: 1,
    name: 'The Letter',
    kanji: '心',
    pitch:
      'A short note on one sheet of paper, signed with a seal. Reads first, links last.',
  },
  {
    slug: 'card',
    n: 2,
    name: 'The Card',
    kanji: '私',
    pitch: 'A business card. Everything on one screen, three buttons under it.',
  },
  {
    slug: 'doors',
    n: 3,
    name: 'Three Doors',
    kanji: '場',
    pitch:
      'A short hello, then three noren curtains you walk through. The links are the page.',
  },
  {
    slug: 'made',
    n: 4,
    name: 'Made With Claude',
    kanji: '作',
    pitch:
      'Leads with how the site gets made, Josh and Claude step by step, then where it all lives.',
  },
] as const;

export type DraftSlug = (typeof DRAFTS)[number]['slug'];

/** The strip over every draft: which one this is, and the other three. */
export function DraftBar({ current }: { current: DraftSlug }) {
  const here = DRAFTS.find((d) => d.slug === current)!;
  return (
    <nav className="adx-bar" aria-label="About drafts">
      <Link href="/about-drafts" className="adx-bar-home">
        Draft {here.n} of {DRAFTS.length}
      </Link>
      <ul role="list">
        {DRAFTS.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/about-drafts/${d.slug}`}
              aria-current={d.slug === current ? 'page' : undefined}
            >
              <span aria-hidden>{d.n}</span> {d.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
