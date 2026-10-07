import { getPublishedPosts } from '@/lib/posts';
import { imageSize, readingMinutes } from '@/app/content/post-extras';
import { EXCERPT, PUBLISHED, TITLE } from '@/components/guide/copy';

/**
 * Field notes: everything the Writing page lists, in the order it lists it.
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
 * Three a page: on a wide screen that is one row of the three-up grid, and on
 * page 1 it is the lead and the two newest posts, which leaves room under them
 * for Market Storm and the way into /learn without a wall of cards first.
 */
export const NOTES_PER_PAGE = 3;

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
      alt: 'Split card: priced per use, my 4-day build came to $536, which I never paid, against what I actually paid, my usual $200 a month with nothing extra.',
      ...size,
    },
    // Pinned first on page 1. To unpin, set this to false: the guide then
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

let cache: FieldNote[] | null = null;

/** Every note, pinned first, then newest first. */
export function getFieldNotes(): FieldNote[] {
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
  cache = [
    ...numbered.filter((n) => n.pinned),
    ...numbered.filter((n) => !n.pinned),
  ];
  return cache;
}

/** The most recently dated note, wherever it sits — it wears the 新 seal. */
export function newestNote(): FieldNote | undefined {
  return getFieldNotes().reduce<FieldNote | undefined>(
    (best, n) => (!best || n.date > best.date ? n : best),
    undefined
  );
}

export const totalNotePages = Math.max(
  1,
  Math.ceil(getFieldNotes().length / NOTES_PER_PAGE)
);

export function notesOnPage(page: number): FieldNote[] {
  const start = (page - 1) * NOTES_PER_PAGE;
  return getFieldNotes().slice(start, start + NOTES_PER_PAGE);
}

/**
 * Page 1 lives at `/content`, never `/content/page/1`: two URLs with the same
 * cards would compete with each other, and the bare section URL is the one
 * that gets linked and shared. The numbered route starts at 2.
 */
export function notePageHref(page: number): string {
  return page <= 1 ? '/content' : `/content/page/${page}`;
}
