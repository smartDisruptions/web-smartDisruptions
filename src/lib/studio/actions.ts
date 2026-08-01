import {
  parseFrontmatter,
  stringifyFrontmatter,
  type Frontmatter,
} from '@/lib/frontmatter';
import { parsePost, type ChannelPlan, type PostStatus } from '@/lib/posts';
import {
  BASE_BRANCH,
  POSTS_PATH,
  createBranch,
  fetchFileText,
  listPostsOnBranch,
  mergePr,
  openPr,
  putFile,
  type GhConfig,
} from './github';

/**
 * The operations the dashboard performs, kept out of the route handlers so
 * they can be reasoned about (and tested) on their own.
 *
 * Every write is a commit. Git stays the single source of truth for both the
 * article and its schedule — there is no second store to fall out of sync.
 */

export const CHANNELS = ['linkedin', 'substack', 'reddit', 'email'] as const;

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Branch name for a new draft. Namespaced so the board can spot them. */
export function draftBranchName(slug: string): string {
  return `draft/${slug}`;
}

/**
 * Rewrite only the frontmatter of a post file, leaving the body byte-identical.
 *
 * Deliberately not "parse to a Post and re-serialize": that would drop any
 * frontmatter key this build doesn't know about. An older or newer branch can
 * carry fields this code has never heard of and they must survive the edit.
 */
export function applyFrontmatter(raw: string, changes: Frontmatter): string {
  const { data, body } = parseFrontmatter(raw);
  const merged: Frontmatter = { ...data };
  for (const [k, v] of Object.entries(changes)) {
    if (v === null) delete merged[k];
    else merged[k] = v;
  }
  return stringifyFrontmatter(merged, body);
}

export type ScheduleUpdate = {
  status?: PostStatus;
  liveAt?: string | null;
  channels?: ChannelPlan[];
};

function channelsToFrontmatter(channels: ChannelPlan[]) {
  return channels.map((c) => {
    const out: Record<string, string> = { name: c.name, status: c.status };
    if (c.scheduledFor) out.scheduledFor = c.scheduledFor;
    if (c.note) out.note = c.note;
    return out;
  });
}

/** Update a post's schedule on its branch. Returns the new blob SHA. */
export async function updateSchedule(
  args: { branch: string; slug: string; sha: string; update: ScheduleUpdate },
  config: GhConfig
): Promise<{ sha: string }> {
  const path = `${POSTS_PATH}/${args.slug}.md`;
  const raw = await fetchFileText(path, args.branch, config);

  const changes: Frontmatter = {};
  if (args.update.status !== undefined) changes.status = args.update.status;
  if (args.update.liveAt !== undefined) {
    changes.liveAt = args.update.liveAt === null ? null : args.update.liveAt;
  }
  if (args.update.channels !== undefined) {
    changes.channels = channelsToFrontmatter(args.update.channels);
  }

  const next = applyFrontmatter(raw, changes);

  // Parse the result before committing. A schedule edit that produces an
  // unloadable post would break the build on merge; fail here instead.
  parsePost(next, `${args.slug}.md`);

  const summary =
    args.update.status !== undefined
      ? `status -> ${args.update.status}`
      : args.update.channels !== undefined
        ? 'update channel plan'
        : 'update schedule';

  return putFile(
    {
      path,
      branch: args.branch,
      content: next,
      sha: args.sha,
      message: `studio: ${summary} (${args.slug})`,
    },
    config
  );
}

/** Create a new draft on its own branch, per the branch-per-article rule. */
export async function createDraft(
  args: { title: string; category?: string; excerpt?: string },
  config: GhConfig
): Promise<{ branch: string; slug: string; path: string }> {
  const slug = slugify(args.title);
  if (!slug)
    throw new Error('Title must contain at least one letter or number');

  const branch = draftBranchName(slug);
  const path = `${POSTS_PATH}/${slug}.md`;

  // Refuse if the slug is already taken anywhere that matters — a duplicate
  // slug silently shadows an existing post once merged.
  const onBase = await listPostsOnBranch(BASE_BRANCH, config);
  if (onBase.some((p) => p.slug === slug)) {
    throw new Error(
      `A post with the slug "${slug}" already exists on ${BASE_BRANCH}`
    );
  }

  try {
    await createBranch(branch, BASE_BRANCH, config);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // 422 "Reference already exists" — reuse the branch rather than fail.
    if (!/already exists/i.test(msg)) throw e;

    // The branch was already there, so the draft may be too. Writing over it
    // without its blob SHA fails deep in the GitHub client with an opaque
    // '"sha" wasn't supplied'; say what actually happened instead.
    const existing = await listPostsOnBranch(branch, config);
    if (existing.some((p) => p.slug === slug)) {
      throw new Error(
        `A draft called "${args.title}" already exists on ${branch}.`
      );
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const content = stringifyFrontmatter(
    {
      title: args.title,
      slug,
      excerpt: args.excerpt ?? '',
      category: args.category ?? 'Working With AI',
      publishDate: today,
      tags: [],
      status: 'draft',
      channels: [],
    },
    `Start writing here.\n`
  );

  await putFile(
    { path, branch, content, message: `studio: new draft "${args.title}"` },
    config
  );

  return { branch, slug, path };
}

/**
 * Publish: flip status to published on the branch, then open and merge a PR
 * into the base branch. Only ever called from an explicit press.
 */
export async function publish(
  args: { branch: string; slug: string; sha: string; title: string },
  config: GhConfig
): Promise<{ prUrl: string; merged: boolean; message: string }> {
  await updateSchedule(
    {
      branch: args.branch,
      slug: args.slug,
      sha: args.sha,
      update: { status: 'published', liveAt: null },
    },
    config
  );

  const pr = await openPr(
    {
      branch: args.branch,
      title: `Publish: ${args.title}`,
      body: [
        `Publishing **${args.title}** from the Studio.`,
        '',
        `Slug: \`${args.slug}\``,
        `Status flipped to \`published\` on \`${args.branch}\`.`,
      ].join('\n'),
    },
    config
  );

  if (args.branch === BASE_BRANCH) {
    return {
      prUrl: pr.url,
      merged: false,
      message: 'Already on the base branch',
    };
  }

  const result = await mergePr(pr.number, config);
  return { prUrl: pr.url, merged: result.merged, message: result.message };
}
