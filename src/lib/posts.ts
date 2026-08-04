import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { parseFrontmatter, type Frontmatter, type Scalar } from './frontmatter';

/**
 * Post store. One markdown file per article under src/content/posts, so that
 * two draft branches editing different articles never touch the same file, and
 * so an external tool can read a branch's drafts over the GitHub API without
 * having to parse a TypeScript module out of it.
 *
 * Publish state lives in frontmatter, which makes git the single source of
 * truth for the schedule — no second store to drift out of sync. The editorial
 * dashboard is a separate app; this repo only owns the content and the gate.
 */

export const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

/**
 * Where a post is in its life.
 *
 * - `draft`     — invisible everywhere, including previews.
 * - `staged`    — renders on PREVIEW deployments only. This is what makes a
 *                 read-before-you-ship review possible, and it is also what
 *                 lets several articles sit ready at once: a staged article
 *                 rides along in a dev -> main merge and stays invisible on
 *                 the live site, so publishing one never publishes another.
 * - `published` — live everywhere.
 *
 * `scheduled` is the old name for `staged` and is still accepted so a branch
 * written before the rename doesn't break the build.
 */
export type PostStatus = 'draft' | 'staged' | 'published';

/** A planned distribution push. The dashboard tracks these; it never posts. */
export type ChannelPlan = {
  name: string;
  status: 'planned' | 'scheduled' | 'done';
  scheduledFor?: string;
  note?: string;
};

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  publishDate: string;
  tags: string[];
  status: PostStatus;
  /** When a scheduled post should become public. ISO 8601. */
  liveAt?: string;
  channels: ChannelPlan[];
  heroImage?: string;
  /**
   * The hero re-grounded on paper, shown when the site is in its light theme.
   * Optional: a photograph or an app screenshot is theme-neutral and needs no
   * second copy, so only the generated cards set this.
   */
  heroImageLight?: string;
  heroImageAlt?: string;
  ogImage?: string;
}

const STATUSES: PostStatus[] = ['draft', 'staged', 'published'];
/** Old name -> new. Kept so pre-rename branches still parse. */
const STATUS_ALIASES: Record<string, PostStatus> = { scheduled: 'staged' };
const CHANNEL_STATUSES = new Set(['planned', 'scheduled', 'done']);

function str(v: Scalar | undefined, fallback = ''): string {
  return typeof v === 'string' ? v : v == null ? fallback : String(v);
}

function optionalStr(v: Scalar | undefined): string | undefined {
  const s = typeof v === 'string' ? v.trim() : '';
  return s === '' ? undefined : s;
}

export function postFromFrontmatter(
  data: Frontmatter,
  body: string,
  filename: string
): Post {
  const slug = str(data.slug as Scalar) || filename.replace(/\.md$/, '');
  const rawStatus = str(data.status as Scalar, 'draft');
  const aliased = STATUS_ALIASES[rawStatus] ?? rawStatus;
  if (!STATUSES.includes(aliased as PostStatus)) {
    throw new Error(
      `${filename}: unknown status "${rawStatus}" (expected ${STATUSES.join(' | ')})`
    );
  }
  const status = aliased as PostStatus;

  const rawChannels = Array.isArray(data.channels) ? data.channels : [];
  const channels: ChannelPlan[] = (rawChannels as Record<string, Scalar>[]).map(
    (c) => {
      const cs = str(c.status, 'planned');
      if (!CHANNEL_STATUSES.has(cs)) {
        throw new Error(`${filename}: unknown channel status "${cs}"`);
      }
      return {
        name: str(c.name),
        status: cs as ChannelPlan['status'],
        scheduledFor: optionalStr(c.scheduledFor),
        note: optionalStr(c.note),
      };
    }
  );

  // liveAt is optional on a staged post: undated means "ready, I'll press it",
  // dated means "publish it then". Both are legitimate.
  const liveAt = optionalStr(data.liveAt as Scalar);
  if (liveAt && Number.isNaN(Date.parse(liveAt))) {
    throw new Error(`${filename}: liveAt is not a valid date: "${liveAt}"`);
  }

  const tags = Array.isArray(data.tags)
    ? (data.tags as Scalar[]).map((t) => String(t))
    : [];

  return {
    slug,
    title: str(data.title as Scalar),
    excerpt: str(data.excerpt as Scalar),
    body,
    category: str(data.category as Scalar, 'Working With AI'),
    publishDate: str(data.publishDate as Scalar),
    tags,
    status,
    liveAt,
    channels,
    heroImage: optionalStr(data.heroImage as Scalar),
    heroImageLight: optionalStr(data.heroImageLight as Scalar),
    heroImageAlt: optionalStr(data.heroImageAlt as Scalar),
    ogImage: optionalStr(data.ogImage as Scalar),
  };
}

/** Parse one post file's raw text. Exported so an external tool can reuse it
 *  on content fetched from other branches, where there is no local file. */
export function parsePost(raw: string, filename: string): Post {
  const { data, body } = parseFrontmatter(raw);
  return postFromFrontmatter(data, body.trim(), filename);
}

let cache: Post[] | null = null;

/** Every post on this branch, newest first — regardless of status. */
export function getAllPosts(): Post[] {
  if (cache) return cache;
  if (!existsSync(POSTS_DIR)) return (cache = []);
  const posts = readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePost(readFileSync(path.join(POSTS_DIR, f), 'utf8'), f))
    .sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1));
  return (cache = posts);
}

/**
 * Are we rendering a preview rather than the live site?
 *
 * Vercel sets VERCEL_ENV to 'production' only for the production deployment;
 * branch deploys are 'preview'. Local dev has it unset, and showing staged
 * work locally is what you want.
 */
export function isPreviewEnv(): boolean {
  return process.env.VERCEL_ENV !== 'production';
}

/**
 * Is this post reachable on THIS deployment?
 *
 * On production, exactly one thing makes an article public: `status: published`,
 * which only a deliberate publish sets. Not a date, not the passage of time —
 * a rebuild can never publish anything, which is the property that stops one
 * article's publish from dragging others live with it.
 *
 * On a preview, `staged` renders too. That is the whole point of staging: the
 * article can be read exactly as it will look, on an SSO-gated URL, while
 * production still refuses to serve it.
 */
export function isLive(post: Post, preview: boolean = isPreviewEnv()): boolean {
  if (post.status === 'published') return true;
  return preview && post.status === 'staged';
}

/** The only list a deployment may render — staged included on previews. */
export function getPublishedPosts(): Post[] {
  const preview = isPreviewEnv();
  return getAllPosts().filter((p) => isLive(p, preview));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPublishedPosts().find((p) => p.slug === slug);
}

/** Card-level fields only. Keeps article bodies out of client bundles. */
export type PostSummary = Omit<Post, 'body' | 'channels'>;

export function toSummary(post: Post): PostSummary {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { body, channels, ...rest } = post;
  return rest;
}

export function getCategories(): string[] {
  return Array.from(new Set(getPublishedPosts().map((p) => p.category)));
}
