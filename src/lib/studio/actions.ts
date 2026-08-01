import {
  parseFrontmatter,
  stringifyFrontmatter,
  type Frontmatter,
} from '@/lib/frontmatter';
import { parsePost, type ChannelPlan, type PostStatus } from '@/lib/posts';
import {
  DRAFT_BRANCH,
  PRODUCTION_BRANCH,
  POSTS_PATH,
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

/**
 * Create a new article on the drafting branch.
 *
 * It lands on `dev` as `status: draft`, which is invisible to the public site
 * because the gate is status-based rather than branch-based. That is what lets
 * a draft ride along in a dev -> main merge without appearing anywhere.
 */
export async function createDraft(
  args: { title: string; category?: string; excerpt?: string },
  config: GhConfig
): Promise<{ branch: string; slug: string; path: string }> {
  const slug = slugify(args.title);
  if (!slug)
    throw new Error('Title must contain at least one letter or number');

  const path = `${POSTS_PATH}/${slug}.md`;

  // A duplicate slug silently shadows an existing article once both are on the
  // same branch, so refuse rather than overwrite.
  const existing = await listPostsOnBranch(DRAFT_BRANCH, config);
  if (existing.some((p) => p.slug === slug)) {
    throw new Error(
      `An article with the slug "${slug}" already exists on ${DRAFT_BRANCH}.`
    );
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
    {
      path,
      branch: DRAFT_BRANCH,
      content,
      message: `studio: new draft "${args.title}"`,
    },
    config
  );

  return { branch: DRAFT_BRANCH, slug, path };
}

/**
 * Publish: flip status to published, then merge the drafting branch into
 * production so the article is live on the site.
 *
 * Note what this really does — it ships everything currently on `dev`, not
 * just this article. That is the same promote-to-production step that was
 * previously done by hand, so the confirm dialog states it rather than
 * letting it be a surprise. Other drafts riding along stay invisible because
 * the gate is status-based.
 *
 * Only ever called from an explicit press. Nothing here runs on a timer.
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

  // An article authored on a side branch has to reach the drafting branch
  // first, or merging dev -> main would ship without it.
  if (args.branch !== DRAFT_BRANCH) {
    const staging = await openPr(
      {
        branch: args.branch,
        base: DRAFT_BRANCH,
        title: `Stage: ${args.title}`,
        body: `Bringing **${args.title}** onto \`${DRAFT_BRANCH}\` ahead of publishing.`,
      },
      config
    );
    const staged = await mergePr(staging.number, config);
    if (!staged.merged) {
      throw new Error(
        `Could not merge ${args.branch} into ${DRAFT_BRANCH}: ${staged.message}`
      );
    }
  }

  const pr = await openPr(
    {
      branch: DRAFT_BRANCH,
      base: PRODUCTION_BRANCH,
      title: `Publish: ${args.title}`,
      body: [
        `Publishing **${args.title}** from the Studio.`,
        '',
        `Slug: \`${args.slug}\``,
        '',
        `This promotes \`${DRAFT_BRANCH}\` to \`${PRODUCTION_BRANCH}\`, so everything`,
        `currently on \`${DRAFT_BRANCH}\` ships. Other drafts travelling with it stay`,
        'invisible — the publish gate is status-based, not branch-based.',
      ].join('\n'),
    },
    config
  );

  const result = await mergePr(pr.number, config);
  return { prUrl: pr.url, merged: result.merged, message: result.message };
}
