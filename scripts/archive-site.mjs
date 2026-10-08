#!/usr/bin/env node
/**
 * Freezes a past design of this site into public/archive/<name>/, so it stays
 * online — clickable, both themes, phone menu and all — after the live site
 * has moved on. /built/<name> describes it; the archive is what it links to.
 *
 * The archive is the old commit's own code, built as a static export under a
 * base path. It is not a screenshot or a re-creation: same markup, same CSS,
 * same fonts, same JavaScript.
 *
 *   git worktree add /tmp/sd-archive <commit>
 *   (cd /tmp/sd-archive && npm ci)
 *   node scripts/archive-site.mjs --src /tmp/sd-archive [--name notebook]
 *
 * The --src checkout is edited in place, so use a throwaway worktree. Each
 * archive's settings live in ARCHIVES below. Re-running replaces that
 * archive's folder wholesale.
 *
 * What the old code is changed into, and why:
 *   - Static export under /archive/<name>: the live site serves it as plain
 *     files (next.config.ts rewrites /archive/<name>/x to x.html).
 *   - Only the main pages, a few posts and a few reports are kept. The old
 *     data is trimmed rather than the pages deleted afterwards, because the
 *     old Writing list builds its links in the browser: trimming the data is
 *     the only way the archive never links to a page it does not have. Any
 *     link in the old code or posts to a post or report that was not kept
 *     points at the live site instead.
 *   - Server-only routes go (the signup API, social-card images, sitemap,
 *     robots). The old signup form posts to the live /api/subscribe, which
 *     still exists, so it keeps working.
 *   - No analytics, so archive visits do not mix with the live site's.
 *   - Every page is noindex and keeps its canonical URL on the live site, so
 *     search engines keep pointing at the real pages.
 *   - A sticky-note banner on every page says what you are looking at and
 *     links back to the current site.
 *   - Image paths move under the archive, so the old pages show the old
 *     images even after the live site redraws its own. Only images a kept
 *     page uses are copied.
 */
import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const LIVE = 'https://www.smartdisruptions.com';

const ARCHIVES = {
  notebook: {
    commit: '6166455', // main before the Shadow Dojo redesign (PR #105, "Notebook")
    label: 'the Notebook design',
    dates: 'September 28 to October 1, 2026',
    study: '/built/notebook',
    posts: [
      'food-truck-site-with-ai', // the first post, 2026-07-08
      'six-prompts-one-day',
      'model-it-dont-prompt-it', // the newest when this design was retired
    ],
    reports: [
      'ai-capex-abundance-or-bubble',
      'amzn-q2-2026',
      'msft-q4-fy2026',
      'goog-q2-2026',
    ],
    // Taken off the site since this design (Josh, 2026-10-07): the archive
    // drops them too, rather than keep showing what the live site no longer
    // does. Apps and projects are filtered out of the old data, so no page
    // is built for them and nothing lists them; `skills` are removed whole;
    // `text` rewrites old copy that counted or named them.
    drop: {
      apps: ['field-office', 'grove', 'pebble-kart', 'going-traveling'],
      projects: ['pembroke-file'],
      skills: ['teaching'],
      text: [
        [
          'src/data/skills.ts',
          "The arcade is six cabinets. The Pembroke File is the one I would point at first: a five-act mystery where every clue is an object you pick up and read, puzzle boards checked by a program that solves each one before shipping, wires that really swing, and a pencil-rubbing canvas where the answer is never drawn — only revealed by shading around it. The newest cabinet is a chore-tracker my family actually uses, chores as quests with gold and gear. Two of the cabinets are my son's.",
          'The arcade is three cabinets. The newest is a chore-tracker my family actually uses, chores as quests with gold and gear.',
        ],
        [
          'src/app/built/page.tsx',
          'Six games. All of them free, and all of them play in your browser.',
          'Three games. All of them free, and all of them play in your browser.',
        ],
      ],
    },
  },
};

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce(
      (acc, a, i, all) =>
        a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc,
      []
    )
);
const name = args.name ?? 'notebook';
const cfg = ARCHIVES[name];
if (!cfg) throw new Error(`unknown archive "${name}"`);
if (!args.src)
  throw new Error(
    'pass --src <checkout of the old commit, with node_modules installed>'
  );

const SRC = path.resolve(args.src);
const REPO = process.cwd();
const BASE = `/archive/${name}`;
const DEST = path.join(REPO, 'public', 'archive', name);

const head = execSync('git rev-parse --short HEAD', { cwd: SRC })
  .toString()
  .trim();
if (!head.startsWith(cfg.commit.slice(0, 7))) {
  throw new Error(`${SRC} is at ${head}, expected ${cfg.commit}`);
}

const file = (p) => path.join(SRC, p);
const read = (p) => readFileSync(file(p), 'utf8');
const write = (p, s) => writeFileSync(file(p), s);
/** Replace exactly once, or stop: the old code must look the way this script expects. */
function patch(p, from, to) {
  const s = read(p);
  const n =
    typeof from === 'string'
      ? s.split(from).length - 1
      : (
          s.match(new RegExp(from.source, from.flags.replace('g', '') + 'g')) ??
          []
        ).length;
  if (n !== 1)
    throw new Error(`${p}: expected one match for ${from}, found ${n}`);
  write(p, s.replace(from, to));
}

// ── 1. Static export under the archive's base path ─────────────────────────
write(
  'next.config.ts',
  `import type { NextConfig } from 'next';

// ARCHIVE BUILD (scripts/archive-site.mjs in the live repo).
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '${BASE}',
  images: { unoptimized: true },
};

export default nextConfig;
`
);

// ── 2. Server-only routes ───────────────────────────────────────────────────
for (const p of [
  'src/app/api',
  'src/app/opengraph-image.tsx',
  'src/app/twitter-image.tsx',
  'src/app/market-storm/[slug]/opengraph-image.tsx',
  'src/app/market-storm/page', // four reports fit on one page
  'src/app/robots.ts',
  'src/app/sitemap.ts',
]) {
  rmSync(file(p), { recursive: true, force: true });
}

// ── 3. Layout: no analytics, noindex, the archive banner ───────────────────
patch(
  'src/app/layout.tsx',
  "import { Analytics } from '@vercel/analytics/next';\n",
  ''
);
patch(
  'src/app/layout.tsx',
  "import { SpeedInsights } from '@vercel/speed-insights/next';\n",
  ''
);
patch(
  'src/app/layout.tsx',
  /\s*\{\/\* Cookieless, aggregate page analytics[\s\S]*?<SpeedInsights \/>/,
  ''
);
patch(
  'src/app/layout.tsx',
  /  robots: \{\n[\s\S]*?\n  \},\n/,
  '  robots: { index: false, follow: true },\n'
);
patch(
  'src/app/layout.tsx',
  '        <Navbar />',
  `        <div
          role="note"
          style={{
            background: 'var(--sd-sticky)',
            color: 'var(--sd-sticky-ink)',
            fontFamily: 'var(--font-sans), system-ui, sans-serif',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            padding: '0.6rem 1rem',
            textAlign: 'center',
          }}
        >
          <strong>Archive.</strong> This is smartdisruptions.com as it looked from ${cfg.dates}: ${cfg.label}.{' '}
          <a href="${LIVE}${cfg.study}" style={{ textDecoration: 'underline', fontWeight: 700 }}>About this design</a>
          {' · '}
          <a href="${LIVE}/" style={{ textDecoration: 'underline', fontWeight: 700 }}>Go to the current site</a>
        </div>
        <Navbar />`
);

// ── 4. Keep a few posts and reports ─────────────────────────────────────────
patch(
  'src/lib/posts.ts',
  'return getAllPosts().filter((p) => isLive(p, preview));',
  `return getAllPosts().filter((p) => isLive(p, preview) && ${JSON.stringify(cfg.posts)}.includes(p.slug));`
);
patch(
  'src/data/marketStorm.ts',
  /(export const marketStormReports: MarketStormReport\[\] = \[[\s\S]*?\n)\];/,
  `$1].filter((r) => ${JSON.stringify(cfg.reports)}.includes(r.slug));`
);

// ── 4b. Drop what has since left the live site ─────────────────────────────
if (cfg.drop) {
  const { apps = [], projects = [], skills = [], text = [] } = cfg.drop;
  const not = (list, key) => `.filter((x) => !${JSON.stringify(list)}.includes(${key}))`;
  // `as` keeps the declared element type: a filtered literal loses it.
  patch('src/data/apps.ts', /(export const apps: App\[\] = )(\[[\s\S]*?\n\]);/, `$1($2 as App[])${not(apps, 'x.slug')};`);
  patch('src/data/apps.ts', /(export const ARCADE_SLUGS = \[[\s\S]*?\n)\];/, `$1]${not(apps, 'x')};`);
  patch('src/data/projects.ts', /(export const projects: Project\[\] = )(\[[\s\S]*?\n\]);/, `$1($2 as Project[])${not(projects, 'x.slug')};`);
  patch('src/data/skills.ts', /(const ARCADE = new Set\(\[[\s\S]*?\n)\]\);/, `$1]${not(apps, 'x')});`);
  for (const id of skills)
    patch('src/data/skills.ts', new RegExp(`\\n      \\{\\n        id: '${id}',[\\s\\S]*?\\n      \\},`), '');
  for (const [p, from, to] of text) patch(p, from, to);
  console.log(`dropped ${apps.length} apps, ${projects.length} projects and ${skills.length} skills from the old data`);
}

// Links written into the old code and posts that point at a post or report
// the archive does not keep go to the live site instead.
const kept = new Set([
  ...cfg.posts.map((s) => `content/${s}`),
  ...cfg.reports.map((s) => `market-storm/${s}`),
]);
let relinked = 0;
const liveLink = (section, slug) => {
  if (kept.has(`${section}/${slug}`)) return `/${section}/${slug}`;
  relinked++;
  return `${LIVE}/${section}/${slug}`;
};
function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
// Links built from a slug at run time (`/content/${post.slug}`) get the same
// choice made in code: kept slugs stay in the archive, the rest go live.
const keptOf = { content: cfg.posts, 'market-storm': cfg.reports };
let dynamicLinks = 0;
const dynamicLink = (sec, expr) => {
  dynamicLinks++;
  const inArchive = '`/' + sec + '/${' + expr + '}`';
  const live = '`' + LIVE + '/' + sec + '/${' + expr + '}`';
  return `(${JSON.stringify(keptOf[sec])}.includes(${expr}) ? ${inArchive} : ${live})`;
};
for (const p of walk(file('src'))) {
  if (!/\.(tsx?|md)$/.test(p)) continue;
  const s = readFileSync(p, 'utf8');
  const t = s
    .replace(
      /(['"`])\/(content|market-storm)\/([a-z0-9-]+)\1/g,
      (m, q, sec, slug) => `${q}${liveLink(sec, slug)}${q}`
    )
    .replace(
      /\]\(\/(content|market-storm)\/([a-z0-9-]+)\)/g,
      (m, sec, slug) => `](${liveLink(sec, slug)})`
    )
    .replace(/`\/(content|market-storm)\/\$\{([\w.]+)\}`/g, (m, sec, expr) =>
      dynamicLink(sec, expr)
    );
  if (t !== s) writeFileSync(p, t);
}
console.log(
  `patched the old code; ${relinked} written-in links to posts or reports not kept now go to the live site, ${dynamicLinks} slug-built links choose at run time`
);

// ── 5. Build ────────────────────────────────────────────────────────────────
rmSync(file('out'), { recursive: true, force: true });
execSync('npx next build', {
  cwd: SRC,
  stdio: 'inherit',
  // Published posts only: the old preview gate also shows staged ones.
  env: {
    ...process.env,
    VERCEL_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
  },
});
const OUT = file('out');

// ── 6. Images move under the archive; only the ones in use are kept ────────
const textFiles = walk(OUT).filter((p) => /\.(html|txt|css|js)$/.test(p));
for (const p of textFiles) {
  const s = readFileSync(p, 'utf8');
  // "/images/…", \"/images/…\" (inside the inline RSC payload), url(/images/…)
  // and the second+ entries of a srcset (", /images/…").
  const t = s.replace(/(["(]|\\"|, )\/images\//g, `$1${BASE}/images/`);
  if (t !== s) writeFileSync(p, t);
}
const used = new Set();
for (const p of textFiles) {
  for (const m of readFileSync(p, 'utf8').matchAll(
    new RegExp(`${BASE}/images/([^"'\\\\)\\s,?#]+)`, 'g')
  ))
    used.add(m[1]);
}
let dropped = 0;
for (const p of walk(path.join(OUT, 'images'))) {
  const rel = path
    .relative(path.join(OUT, 'images'), p)
    .split(path.sep)
    .join('/');
  if (!used.has(rel)) {
    rmSync(p);
    dropped++;
  }
}
// Create-next-app leftovers nothing links to.
for (const f of [
  'file.svg',
  'globe.svg',
  'next.svg',
  'vercel.svg',
  'window.svg',
])
  rmSync(path.join(OUT, f), { force: true });

// ── 7. Every in-archive link must land on a file ────────────────────────────
const missing = new Set();
for (const p of walk(OUT).filter((f) => f.endsWith('.html'))) {
  for (const m of readFileSync(p, 'utf8').matchAll(
    new RegExp(`href="${BASE}([^"#?]*)`, 'g')
  )) {
    const target = m[1].replace(/\/$/, '') || '/index';
    const candidates = [
      path.join(OUT, target),
      path.join(OUT, `${target}.html`),
    ];
    if (!candidates.some((c) => existsSync(c) && statSync(c).isFile()))
      missing.add(`${path.relative(OUT, p)} → ${BASE}${m[1]}`);
  }
}
if (missing.size) {
  console.error([...missing].join('\n'));
  throw new Error(
    `${missing.size} archive links point at pages the archive does not have`
  );
}

// ── 8. Into the live site ───────────────────────────────────────────────────
rmSync(DEST, { recursive: true, force: true });
mkdirSync(path.dirname(DEST), { recursive: true });
cpSync(OUT, DEST, { recursive: true });
const pages = walk(DEST).filter((f) => f.endsWith('.html')).length;
const bytes = walk(DEST).reduce((n, f) => n + statSync(f).size, 0);
console.log(
  `archive "${name}": ${pages} pages, ${(bytes / 1048576).toFixed(1)} MB, ${used.size} images kept, ${dropped} dropped → ${path.relative(REPO, DEST)}`
);
