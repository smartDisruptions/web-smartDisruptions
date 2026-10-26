import { getPublishedPosts } from '@/lib/posts';
import { imageSize, readingMinutes } from '@/app/content/post-extras';
import { EXCERPT, PUBLISHED, TITLE } from '@/components/guide/copy';

/**
 * Field notes: everything the Writing page lists, and its archive.
 *
 * Two kinds of thing live here. Posts are markdown in src/content/posts and
 * open at /content/<slug>. The field guide is its own route, because it is
 * built out of things you use rather than markdown, but on the Writing page
 * it is one more note and it is counted as one.
 *
 * Server-only. It reads the post store and the hero files from disk (through
 * posts.ts and post-extras.ts), so a card's reading time and image size are
 * measured at build time and no post body ever reaches the browser.
 */

/**
 * The posts taken off the Writing page's front (Josh's call, 2026-10-26).
 * They were written for the site's older design; the front now leads with the
 * field guide, then Market Storm. Archiving moves a card to /content/archive
 * and nothing else: each post keeps its URL, its words, search and the
 * sitemap. A post not named here goes on the front, so a new one lands there.
 * The last one is still a draft: if it is ever published, it is published
 * into the archive.
 */
export const ARCHIVED_POST_SLUGS: readonly string[] = [
  'model-it-dont-prompt-it',
  'six-checks-ai-research',
  'took-it-apart-and-built-it-again',
  'five-of-six-failures-said-success',
  'a-pipeline-with-no-server',
  'my-dashboard-said-published',
  'my-private-task-list-was-public',
  'you-dont-get-replaced-for-being-slow',
  'what-ai-handed-back',
  'six-prompts-one-day',
  'stop-re-explaining-yourself-to-ai',
  'i-tried-to-break-my-friends-ai-site',
  'food-truck-site-with-ai',
  'headlines-that-hide-their-subject',
];

const ARCHIVED = new Set(ARCHIVED_POST_SLUGS);

/** Whether a post lives in the archive rather than on the front. */
export function isArchivedPost(slug: string): boolean {
  return ARCHIVED.has(slug);
}

export type NoteImage = {
  /** The dark-theme hero. */
  src: string;
  /** The same card on paper, for the light theme. */
  srcLight?: string;
  alt: string;
  /** Real pixel size, read from the file, so the frame is reserved before the bytes land. */
  width: number;
  height: number;
};

export type FieldNote = {
  kind: 'guide' | 'post';
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO day, YYYY-MM-DD. */
  date: string;
  tags: string[];
  /** Measured from the body for posts; null for the guide, which is played as much as read. */
  minutes: number | null;
  /** What the card prints for length: "6 min read", or "Interactive guide". */
  readLabel: string;
  image: NoteImage | null;
  /** Pinned notes lead page 1 whatever is newer. */
  pinned: boolean;
  /** Its entry number in the archive, oldest first: the first note is No. 1. */
  no: number;
};

const GUIDE_SLUG = 'claude-code-subscription-vs-api';
const GUIDE_HERO = `/images/content/${GUIDE_SLUG}-hero.webp`;

/**
 * The field guide as a card. Title, excerpt and date come from the guide's own
 * copy (src/components/guide/copy.ts), so the card can never disagree with the
 * page it opens. The image is generated like every post's: its spec is
 * scripts/heroes/claude-code-subscription-vs-api.json, and `alt` below is that
 * spec's alt.
 */
function guideNote(): Omit<FieldNote, 'no'> {
  const size = imageSize(GUIDE_HERO) ?? { width: 1200, height: 630 };
  return {
    kind: 'guide',
    slug: GUIDE_SLUG,
    href: `/guides/${GUIDE_SLUG}`,
    title: TITLE,
    excerpt: EXCERPT,
    category: 'Field Guide',
    date: PUBLISHED,
    // The same tags as the guide's own metadata.
    tags: ['claude code', 'pricing', 'game dev'],
    minutes: null,
    readLabel: 'Interactive guide',
    image: {
      src: GUIDE_HERO,
      srcLight: `/images/content/${GUIDE_SLUG}-hero-light.webp`,
      alt: 'Split card: for the same 4 days on the same model, $536 if paid per use against about $7 of my monthly plan, so the plan came out roughly 75 times cheaper.',
      ...size,
    },
    // Pinned first on the front. To unpin, set this to false: the guide then
    // takes its place among the posts by date, and nothing else changes.
    pinned: true,
  };
}

function postNotes(): Omit<FieldNote, 'no'>[] {
  return getPublishedPosts().map((p) => {
    const minutes = readingMinutes(p.body);
    const size = imageSize(p.heroImage) ?? { width: 1200, height: 630 };
    return {
      kind: 'post' as const,
      slug: p.slug,
      href: `/content/${p.slug}`,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      date: p.publishDate,
      tags: p.tags,
      minutes,
      readLabel: `${minutes} min read`,
      image: p.heroImage
        ? {
            src: p.heroImage,
            srcLight: p.heroImageLight,
            alt: p.heroImageAlt ?? p.title,
            ...size,
          }
        : null,
      pinned: false,
    };
  });
}

let cache: { front: FieldNote[]; archive: FieldNote[] } | null = null;

/**
 * Numbered across both lists, oldest first, so a note keeps its entry number
 * when it moves to the archive.
 */
function allNotes(): { front: FieldNote[]; archive: FieldNote[] } {
  if (cache) return cache;
  // Newest first by date. The sort is stable, so posts that share a day keep
  // the post store's order.
  const byDate = [guideNote(), ...postNotes()].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0
  );
  const numbered: FieldNote[] = byDate.map((n, i) => ({
    ...n,
    no: byDate.length - i,
  }));
  const front = numbered.filter((n) => !ARCHIVED.has(n.slug));
  cache = {
    front: [
      ...front.filter((n) => n.pinned),
      ...front.filter((n) => !n.pinned),
    ],
    archive: numbered.filter((n) => ARCHIVED.has(n.slug)),
  };
  return cache;
}

/** The Writing page's front: pinned first, then newest first. */
export function getFieldNotes(): FieldNote[] {
  return allNotes().front;
}

/** The archive, newest first. */
export function getArchivedNotes(): FieldNote[] {
  return allNotes().archive;
}

/** The most recently dated note on the front — it wears the 新 seal. */
export function newestNote(): FieldNote | undefined {
  return getFieldNotes().reduce<FieldNote | undefined>(
    (best, n) => (!best || n.date > best.date ? n : best),
    undefined
  );
}
