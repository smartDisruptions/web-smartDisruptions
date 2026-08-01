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

/** Where a post is in its life. Only `published` is publicly reachable. */
export type PostStatus = 'draft' | 'scheduled' | 'published';

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
  heroImageAlt?: string;
  ogImage?: string;
}

const STATUSES: PostStatus[] = ['draft', 'scheduled', 'published'];
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
  if (!STATUSES.includes(rawStatus as PostStatus)) {
    throw new Error(
      `${filename}: unknown status "${rawStatus}" (expected ${STATUSES.join(' | ')})`
    );
  }
  const status = rawStatus as PostStatus;

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

  const liveAt = optionalStr(data.liveAt as Scalar);
  if (status === 'scheduled' && !liveAt) {
    throw new Error(`${filename}: status is "scheduled" but liveAt is missing`);
  }
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
 * Is this post publicly reachable right now?
 *
 * Exactly one thing makes an article public: someone pressed Publish, which
 * set `status: published`. Nothing else — not a date, not the passage of time.
 *
 * An earlier version also treated `scheduled` with a past `liveAt` as live, so
 * a missed press would still go out on time. That was safe while publishing
 * only reached `dev`. It stopped being safe once Publish promotes `dev` to
 * `main`: an article scheduled for last week and never pressed would have gone
 * live as a side effect of publishing something else entirely. `liveAt` is a
 * plan, and the board surfaces overdue ones — it is not an instruction.
 */
export function isLive(post: Post): boolean {
  return post.status === 'published';
}

/** The only list the public site may render. */
export function getPublishedPosts(): Post[] {
  return getAllPosts().filter((p) => isLive(p));
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
