/**
 * The scheduler: publish staged articles whose time has come.
 *
 * Runs from a GitHub Action, not from the site and not from Vercel cron —
 * Vercel's Hobby tier only fires cron once a day, which can't honour "9am
 * Thursday", and the site itself is the thing being published to.
 *
 * What it does, and deliberately does not do:
 *
 * - It flips `staged` -> `published` ONLY for articles whose liveAt has passed.
 *   Other staged articles ride along in the merge and stay invisible, because
 *   production only renders `published`. Publishing one never publishes another.
 * - It NEVER changes the gate. A rebuild alone can still never publish
 *   anything; this is a deliberate write, the same one the button makes.
 * - It REFUSES to run when the pending promote carries non-content files.
 *   Promoting dev ships everything on dev, and shipping code unattended — with
 *   nobody reading the "what else is shipping" panel — is not a thing a
 *   scheduler should decide. It logs and leaves it for a human press.
 *
 * Env: GITHUB_TOKEN (repo scope), GITHUB_REPOSITORY. DRY_RUN=1 to rehearse.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const [OWNER, REPO] = (process.env.GITHUB_REPOSITORY ?? '').split('/');
const TOKEN = process.env.GITHUB_TOKEN;
const DRY = process.env.DRY_RUN === '1';
const DRAFT = 'dev';
const PROD = 'main';
const POSTS = 'src/content/posts';
/**
 * What counts as "content" for the safety valve.
 *
 * An article ships with its hero and social card, so those are content too —
 * treating them as code would make the scheduler refuse for every post that
 * has an image, which is all of them. Anything outside these paths is code,
 * config or assets belonging to something else, and shipping that unattended
 * is not the scheduler's call.
 */
const CONTENT_PATHS = [
  (f) => f.startsWith(`${POSTS}/`) && f.endsWith('.md'),
  (f) => f.startsWith('public/images/content/'),
];

if (!TOKEN || !OWNER) {
  console.error('Need GITHUB_TOKEN and GITHUB_REPOSITORY');
  process.exit(1);
}

const api = async (p, init = {}) => {
  const res = await fetch(`https://api.github.com${p}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} on ${p}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.status === 204 ? null : res.json();
};

// Frontmatter only — enough to decide, without pulling in the app's parser.
function readFrontmatter(text) {
  if (!text.startsWith('---\n')) return {};
  const end = text.indexOf('\n---', 4);
  if (end === -1) return {};
  const out = {};
  for (const line of text.slice(4, end).split('\n')) {
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const now = new Date();
console.log(`autopublish — ${now.toISOString()}${DRY ? ' (dry run)' : ''}`);

// 1. What is due? Read from the checked-out dev branch.
const dir = path.join(process.cwd(), POSTS);
const due = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
  const fm = readFrontmatter(readFileSync(path.join(dir, file), 'utf8'));
  const status = fm.status === 'scheduled' ? 'staged' : fm.status;
  if (status !== 'staged' || !fm.liveAt) continue;
  const t = Date.parse(fm.liveAt);
  if (Number.isNaN(t)) {
    console.log(`  skip ${file}: unparseable liveAt "${fm.liveAt}"`);
    continue;
  }
  if (t <= now.getTime()) due.push({ file, slug: fm.slug ?? file.replace(/\.md$/, ''), liveAt: fm.liveAt });
  else console.log(`  waiting ${file} — due ${fm.liveAt}`);
}

if (due.length === 0) {
  console.log('nothing due. done.');
  process.exit(0);
}
console.log(`due now: ${due.map((d) => d.slug).join(', ')}`);

// 2. Safety valve. Promoting dev ships everything on dev; a scheduler must not
//    decide to ship code with nobody watching.
const cmp = await api(`/repos/${OWNER}/${REPO}/compare/${PROD}...${DRAFT}`);
const nonContent = (cmp.files ?? [])
  .map((f) => f.filename)
  .filter((f) => !CONTENT_PATHS.some((isContent) => isContent(f)));

if (nonContent.length > 0) {
  console.log(
    `REFUSING: ${DRAFT} carries ${nonContent.length} non-article file(s) — ` +
      `publishing would ship code unattended.\n  ${nonContent.slice(0, 10).join('\n  ')}` +
      `\nPublish by hand from Studio, where the "what else is shipping" panel is visible.`,
  );
  process.exit(0);
}

// 3. Flip only the due ones.
for (const d of due) {
  const p = `${POSTS}/${d.file}`;
  const meta = await api(`/repos/${OWNER}/${REPO}/contents/${p}?ref=${DRAFT}`);
  const text = Buffer.from(meta.content, 'base64').toString('utf8');
  const next = text.replace(/^status:.*$/m, 'status: published');
  if (next === text) {
    console.log(`  ${d.slug}: no status line changed, skipping`);
    continue;
  }
  console.log(`  publishing ${d.slug} (was due ${d.liveAt})`);
  if (DRY) continue;
  await api(`/repos/${OWNER}/${REPO}/contents/${p}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `autopublish: ${d.slug} (scheduled ${d.liveAt})`,
      content: Buffer.from(next, 'utf8').toString('base64'),
      branch: DRAFT,
      sha: meta.sha,
    }),
  });
}

// 4. Promote.
if (DRY) {
  console.log('dry run — not merging.');
  process.exit(0);
}
const open = await api(`/repos/${OWNER}/${REPO}/pulls?head=${OWNER}:${DRAFT}&base=${PROD}&state=open`);
const pr =
  open[0] ??
  (await api(`/repos/${OWNER}/${REPO}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title: `Autopublish: ${due.map((d) => d.slug).join(', ')}`,
      body: `Scheduled publish. Due: ${due.map((d) => `\`${d.slug}\` (${d.liveAt})`).join(', ')}.\n\nOnly due articles had their status flipped; anything else staged travels with this merge and stays invisible on production.`,
      head: DRAFT,
      base: PROD,
    }),
  }));

const merged = await api(`/repos/${OWNER}/${REPO}/pulls/${pr.number}/merge`, {
  method: 'PUT',
  body: JSON.stringify({ merge_method: 'merge' }),
});
console.log(`PR #${pr.number} -> merged: ${merged.merged} (${merged.message})`);
