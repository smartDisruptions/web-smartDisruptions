import { parsePost, type Post } from '@/lib/posts';

/**
 * GitHub client for the Studio. Server-only.
 *
 * The dashboard's whole premise is seeing articles that are NOT on the branch
 * it is running from — drafts live on their own branches until they ship — so
 * it reads the repo over the API rather than the local filesystem.
 *
 * Needs GITHUB_TOKEN (a token with `repo` scope) in the environment. Without
 * it the Studio degrades to read-nothing and says so, rather than half-working.
 */

const OWNER = 'smartDisruptions';
const REPO = 'web-smartDisruptions';
const API = 'https://api.github.com';
export const POSTS_PATH = 'src/content/posts';

/**
 * The two branches the Studio works between.
 *
 * `dev` is the drafting floor: new articles land here as `status: draft` and
 * stay invisible because the publish gate is status-based, not branch-based.
 * `main` is production. Publishing merges dev -> main, which is why the confirm
 * dialog says plainly that everything on dev ships, not just the one article.
 */
export const DRAFT_BRANCH = 'dev';
export const PRODUCTION_BRANCH = 'main';

export type GhConfig = { token: string };

export function getGhConfig():
  | { ok: true; config: GhConfig }
  | { ok: false; missing: string[] } {
  const token = process.env.GITHUB_TOKEN ?? '';
  return token
    ? { ok: true, config: { token } }
    : { ok: false, missing: ['GITHUB_TOKEN'] };
}

class GitHubError extends Error {
  // Assigned explicitly rather than via a TS parameter property: those need
  // code generation, so they break Node's strip-only TS mode that the
  // scripts/ runner relies on.
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
  }
}

async function gh<T>(
  path: string,
  config: GhConfig,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    // The dashboard must never show a cached view of what is on a branch.
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    let message = `GitHub ${res.status}`;
    try {
      const parsed = JSON.parse(detail) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      if (detail) message = detail.slice(0, 200);
    }
    throw new GitHubError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type Branch = { name: string; sha: string };

export async function listBranches(config: GhConfig): Promise<Branch[]> {
  const raw = await gh<{ name: string; commit: { sha: string } }[]>(
    `/repos/${OWNER}/${REPO}/branches?per_page=100`,
    config
  );
  return raw.map((b) => ({ name: b.name, sha: b.commit.sha }));
}

export type BranchPost = Post & {
  branch: string;
  /** Blob SHA — required to update the file without clobbering a newer edit. */
  sha: string;
  path: string;
  /** Set when the file exists but could not be parsed. */
  parseError?: string;
};

type ContentsEntry = { name: string; path: string; sha: string; type: string };

/** Every post file on one branch, parsed. Returns [] if the dir is absent. */
export async function listPostsOnBranch(
  branch: string,
  config: GhConfig
): Promise<BranchPost[]> {
  let entries: ContentsEntry[];
  try {
    entries = await gh<ContentsEntry[]>(
      `/repos/${OWNER}/${REPO}/contents/${POSTS_PATH}?ref=${encodeURIComponent(branch)}`,
      config
    );
  } catch (e) {
    // A branch created before the content migration simply has no posts dir.
    if (e instanceof GitHubError && e.status === 404) return [];
    throw e;
  }

  const files = entries.filter(
    (e) => e.type === 'file' && e.name.endsWith('.md')
  );

  return Promise.all(
    files.map(async (file) => {
      const raw = await fetchFileText(file.path, branch, config);
      try {
        return {
          ...parsePost(raw, file.name),
          branch,
          sha: file.sha,
          path: file.path,
        };
      } catch (err) {
        // One malformed draft must not blank the whole dashboard.
        return {
          ...emptyPost(file.name),
          branch,
          sha: file.sha,
          path: file.path,
          parseError: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );
}

/** Run tasks with a concurrency cap so a 28-branch repo doesn't open 28+
 *  sockets at once. GitHub allows it; being a good citizen costs nothing. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i]);
      }
    }
  );
  await Promise.all(workers);
  return results;
}

export type BranchScan = {
  branch: string;
  posts: BranchPost[];
  error?: string;
};

/**
 * Every post on every branch.
 *
 * Branches with no posts directory drop out on their own, which keeps the
 * repo's long tail of merged/stale branches off the board without a
 * hand-maintained ignore list. A branch that errors is reported rather than
 * silently skipped — a dashboard that quietly hides work is worse than useless.
 */
export async function scanAllBranches(config: GhConfig): Promise<BranchScan[]> {
  const branches = await listBranches(config);
  const scans = await mapLimit(branches, 8, async (b): Promise<BranchScan> => {
    try {
      return { branch: b.name, posts: await listPostsOnBranch(b.name, config) };
    } catch (e) {
      return {
        branch: b.name,
        posts: [],
        error: e instanceof Error ? e.message : String(e),
      };
    }
  });
  return scans.filter((s) => s.posts.length > 0 || s.error);
}

function emptyPost(filename: string): Post {
  return {
    slug: filename.replace(/\.md$/, ''),
    title: filename,
    excerpt: '',
    body: '',
    category: 'Unknown',
    publishDate: '',
    tags: [],
    status: 'draft',
    channels: [],
  };
}

export async function fetchFileText(
  path: string,
  branch: string,
  config: GhConfig
): Promise<string> {
  const data = await gh<{ content: string; encoding: string }>(
    `/repos/${OWNER}/${REPO}/contents/${path}?ref=${encodeURIComponent(branch)}`,
    config
  );
  return data.encoding === 'base64'
    ? Buffer.from(data.content, 'base64').toString('utf8')
    : data.content;
}

/**
 * Write a file on a branch. `sha` must be the blob SHA the caller read, so a
 * concurrent edit from another session is rejected rather than overwritten.
 */
export async function putFile(
  args: {
    path: string;
    branch: string;
    content: string;
    message: string;
    sha?: string;
  },
  config: GhConfig
): Promise<{ sha: string }> {
  const data = await gh<{ content: { sha: string } }>(
    `/repos/${OWNER}/${REPO}/contents/${args.path}`,
    config,
    {
      method: 'PUT',
      body: JSON.stringify({
        message: args.message,
        content: Buffer.from(args.content, 'utf8').toString('base64'),
        branch: args.branch,
        ...(args.sha ? { sha: args.sha } : {}),
      }),
    }
  );
  return { sha: data.content.sha };
}

export async function createBranch(
  name: string,
  fromBranch: string,
  config: GhConfig
): Promise<void> {
  const ref = await gh<{ object: { sha: string } }>(
    `/repos/${OWNER}/${REPO}/git/ref/heads/${encodeURIComponent(fromBranch)}`,
    config
  );
  await gh(`/repos/${OWNER}/${REPO}/git/refs`, config, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${name}`, sha: ref.object.sha }),
  });
}

export type PullRequest = { number: number; url: string; merged: boolean };

export async function findOpenPr(
  branch: string,
  base: string,
  config: GhConfig
): Promise<PullRequest | null> {
  // Filtered by base as well as head: an open dev -> staging PR must not be
  // mistaken for the dev -> main one and merged into the wrong place.
  const prs = await gh<{ number: number; html_url: string }[]>(
    `/repos/${OWNER}/${REPO}/pulls?head=${OWNER}:${branch}&base=${encodeURIComponent(base)}&state=open`,
    config
  );
  const pr = prs[0];
  return pr ? { number: pr.number, url: pr.html_url, merged: false } : null;
}

export async function openPr(
  args: { branch: string; title: string; body: string; base: string },
  config: GhConfig
): Promise<PullRequest> {
  const existing = await findOpenPr(args.branch, args.base, config);
  if (existing) return existing;
  const pr = await gh<{ number: number; html_url: string }>(
    `/repos/${OWNER}/${REPO}/pulls`,
    config,
    {
      method: 'POST',
      body: JSON.stringify({
        title: args.title,
        body: args.body,
        head: args.branch,
        base: args.base,
      }),
    }
  );
  return { number: pr.number, url: pr.html_url, merged: false };
}

export async function mergePr(
  number: number,
  config: GhConfig
): Promise<{ merged: boolean; message: string }> {
  return gh<{ merged: boolean; message: string }>(
    `/repos/${OWNER}/${REPO}/pulls/${number}/merge`,
    config,
    { method: 'PUT', body: JSON.stringify({ merge_method: 'merge' }) }
  );
}

export { GitHubError };
