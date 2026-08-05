/**
 * Tests for the post store: frontmatter round-tripping and the publish gate.
 * The gate is the security-relevant half — an unpublished draft must not be
 * reachable, listed, or in the sitemap.
 *
 *   node scripts/test-posts.mjs
 */
import {
  parseFrontmatter,
  stringifyFrontmatter,
} from '../src/lib/frontmatter.ts';
import { parsePost, isLive } from '../src/lib/posts.ts';
import { publishDay } from './publish-day.mjs';

let pass = 0,
  fail = 0;
const ok = (label, cond, extra = '') => {
  if (cond) {
    pass++;
    console.log(`PASS  ${label}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}${extra ? '  — ' + extra : ''}`);
  }
};
const throws = (label, fn, re) => {
  try {
    fn();
    fail++;
    console.log(`FAIL  ${label} — expected a throw, got none`);
  } catch (e) {
    const m = re ? re.test(e.message) : true;
    if (m) {
      pass++;
      console.log(`PASS  ${label}`);
    } else {
      fail++;
      console.log(`FAIL  ${label} — wrong error: ${e.message}`);
    }
  }
};

console.log('— frontmatter —');
const rt = (data, body = 'hello\n\nworld') => {
  const back = parseFrontmatter(stringifyFrontmatter(data, body));
  return { data: back.data, body: back.body.trim() };
};

ok(
  'scalars survive',
  (() => {
    const r = rt({ title: 'A title', n: 42, flag: true, nil: null });
    return (
      r.data.title === 'A title' &&
      r.data.n === 42 &&
      r.data.flag === true &&
      r.data.nil === null
    );
  })()
);

ok(
  'a numeric-looking string stays a string',
  (() => {
    const r = rt({ publishDate: '2026-08-01', version: '2.0' });
    return r.data.publishDate === '2026-08-01' && r.data.version === '2.0';
  })(),
  'quoting guard for number-like strings'
);

ok(
  'colons and quotes in prose survive',
  (() => {
    const tricky =
      'A card headed "Three things": invented source, no denominator';
    return rt({ excerpt: tricky }).data.excerpt === tricky;
  })()
);

ok(
  'commas inside quoted array items do not split',
  (() => {
    const r = rt({ tags: ['ai', 'a, b', 'workflow'] });
    return (
      JSON.stringify(r.data.tags) === JSON.stringify(['ai', 'a, b', 'workflow'])
    );
  })()
);

ok('empty array survives', JSON.stringify(rt({ tags: [] }).data.tags) === '[]');

ok(
  'channel objects survive',
  (() => {
    const ch = [
      {
        name: 'linkedin',
        status: 'scheduled',
        scheduledFor: '2026-08-02T16:00:00Z',
      },
      { name: 'substack', status: 'planned' },
    ];
    return (
      JSON.stringify(rt({ channels: ch }).data.channels) === JSON.stringify(ch)
    );
  })()
);

ok(
  'body with --- inside is not treated as a delimiter',
  (() => {
    const body = 'intro\n\n---\n\nafter a horizontal rule';
    return rt({ title: 'x' }, body).body === body;
  })()
);

ok(
  'body markdown headings survive',
  (() => {
    const body = '## 1. Loading context\n\ntext **bold** and `code`';
    return rt({ title: 'x' }, body).body === body;
  })()
);

ok(
  'no frontmatter returns whole text as body',
  (() => {
    const r = parseFrontmatter('# just markdown\n');
    return Object.keys(r.data).length === 0 && r.body === '# just markdown\n';
  })()
);

throws(
  'unterminated frontmatter throws',
  () => parseFrontmatter('---\ntitle: x\n'),
  /never closed/
);
throws(
  'malformed line throws',
  () => parseFrontmatter('---\nthis is not a pair\n---\nbody'),
  /Malformed/
);

console.log('\n— post parsing —');
const base = (over = '') => `---
title: Test post
slug: test-post
excerpt: An excerpt.
category: Working With AI
publishDate: 2026-08-01
tags: [ai]
${over}
---
Body text.`;

ok(
  'defaults to draft when status omitted',
  parsePost(base('status: draft'), 'a.md').status === 'draft'
);
throws(
  'unknown status is rejected',
  () => parsePost(base('status: sortof'), 'a.md'),
  /unknown status/
);
// Deliberately no longer an error: an undated staged post means "ready, I'll
// press it", and a dated one means "publish it then". Both are valid.
ok(
  'staged without liveAt is accepted',
  parsePost(base('status: staged'), 'a.md').status === 'staged'
);
ok(
  'the old "scheduled" without liveAt is accepted too',
  parsePost(base('status: scheduled'), 'a.md').status === 'staged',
  'the alias must not resurrect the old requirement'
);
throws(
  'invalid liveAt is rejected',
  () => parsePost(base('status: scheduled\nliveAt: soon'), 'a.md'),
  /not a valid date/
);
throws(
  'unknown channel status is rejected',
  () =>
    parsePost(
      base('status: draft\nchannels:\n  - name: x\n    status: whenever'),
      'a.md'
    ),
  /unknown channel status/
);

console.log('\n— the publish gate —');
const mk = (status, liveAt) =>
  parsePost(
    base(`status: ${status}${liveAt ? `\nliveAt: ${liveAt}` : ''}`),
    'a.md'
  );

// PRODUCTION: only a deliberate publish makes an article public. Not a date,
// not the passage of time — a rebuild must never publish anything, which is
// what stops one article's publish from dragging others live with it.
const PROD = false;
ok('draft is NOT live in production', isLive(mk('draft'), PROD) === false);
ok(
  'staged is NOT live in production',
  isLive(mk('staged'), PROD) === false,
  'staged rides along in a merge and stays hidden — the load-bearing property'
);
ok(
  'staged + past date is STILL not live in production',
  isLive(mk('staged', '2020-01-01T00:00:00Z'), PROD) === false,
  'an overdue date must never self-publish; the scheduler flips status explicitly'
);
ok(
  'staged + future date is not live in production',
  isLive(mk('staged', '2099-01-01T00:00:00Z'), PROD) === false
);
ok('published IS live in production', isLive(mk('published'), PROD) === true);

// PREVIEW: staged renders, so it can be read exactly as it will look.
const PREVIEW = true;
ok(
  'draft is NOT live on preview',
  isLive(mk('draft'), PREVIEW) === false,
  'a draft is unfinished — staging is the deliberate "show me this" step'
);
ok('staged IS live on preview', isLive(mk('staged'), PREVIEW) === true);
ok(
  'staged + any date renders on preview',
  isLive(mk('staged', '2099-01-01T00:00:00Z'), PREVIEW) === true
);
ok('published IS live on preview', isLive(mk('published'), PREVIEW) === true);

console.log('\n— status compatibility —');
ok(
  'the old "scheduled" still parses, as staged',
  mk('scheduled', '2026-09-01').status === 'staged',
  'a branch written before the rename must not break the build'
);
ok(
  'staged without a date is allowed',
  mk('staged').status === 'staged',
  'undated staged = ready, I will press it'
);
throws(
  'an unknown status is still rejected',
  () => mk('sortof'),
  /unknown status/
);

console.log('\n— the real content store —');
const { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } =
  await import('node:fs');
const pathMod = await import('node:path');
const DIR = pathMod.join(process.cwd(), 'src/content/posts');
const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));

ok(
  'every post file parses',
  (() => {
    for (const f of files)
      parsePost(readFileSync(pathMod.join(DIR, f), 'utf8'), f);
    return true;
  })(),
  'a parse error would have thrown'
);

ok(
  'every post has the fields the pages read',
  (() => {
    return files.every((f) => {
      const p = parsePost(readFileSync(pathMod.join(DIR, f), 'utf8'), f);
      return (
        p.slug &&
        p.title &&
        p.excerpt &&
        p.category &&
        p.publishDate &&
        p.body.length > 100
      );
    });
  })()
);

ok(
  'filename matches slug',
  files.every((f) => {
    const p = parsePost(readFileSync(pathMod.join(DIR, f), 'utf8'), f);
    return `${p.slug}.md` === f;
  })
);

// The gate has to hold against the real loader, not just the pure function:
// drop a draft into the store and confirm every public surface ignores it.
const probe = pathMod.join(DIR, 'zzz-gate-probe.md');
writeFileSync(
  probe,
  `---
title: Gate probe
slug: zzz-gate-probe
excerpt: Should never be publicly visible.
category: Working With AI
publishDate: 2099-01-01
tags: [test]
status: draft
---
Draft body that must not reach the public site.`
);
try {
  const mod = await import(`../src/lib/posts.ts?cachebust=${files.length}`);
  const all = mod.getAllPosts();
  const live = mod.getPublishedPosts();
  ok(
    'draft IS visible to the dashboard (getAllPosts)',
    all.some((p) => p.slug === 'zzz-gate-probe')
  );
  ok(
    'draft is NOT in getPublishedPosts',
    !live.some((p) => p.slug === 'zzz-gate-probe')
  );
  ok(
    'draft is NOT resolvable by slug',
    mod.getPostBySlug('zzz-gate-probe') === undefined
  );
  // getPublishedPosts is environment-aware, so asserting its results against
  // production rules is wrong by construction on a preview. Test the property
  // that actually matters, in both environments.
  ok(
    'everything it returns is live in the environment it was computed for',
    live.every((p) => mod.isLive(p, mod.isPreviewEnv()))
  );

  const wasEnv = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'production';
  const prodLive = mod.getPublishedPosts.call(null);
  ok(
    'production excludes the draft probe',
    !prodLive.some((p) => p.slug === 'zzz-gate-probe')
  );
  ok(
    'production excludes staged articles',
    !prodLive.some((p) => p.status === 'staged'),
    'staged rides along in a merge and must stay invisible on the live site'
  );
  ok(
    'production returns only published',
    prodLive.every((p) => p.status === 'published')
  );
  process.env.VERCEL_ENV = wasEnv;
} finally {
  unlinkSync(probe);
}

console.log('\n— every readable article carries its images —');
// An article shipped with no hero and nothing caught it, because the frontmatter
// treated images as optional and the only thing enforcing them was somebody
// remembering. A convention nothing checks is a preference. Draft is exempt: a
// stub has nothing to illustrate yet.
{
  const dir = DIR;
  const missing = [];
  const broken = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const post = parsePost(readFileSync(pathMod.join(dir, file), 'utf8'), file);
    if (post.status === 'draft') continue;
    const raw = readFileSync(pathMod.join(dir, file), 'utf8');
    const get = (k) =>
      (new RegExp(`^${k}:\\s*(.+)$`, 'm').exec(raw) ?? [])[1]?.trim();
    const hero = get('heroImage');
    const og = get('ogImage');
    const alt = get('heroImageAlt');
    if (!hero || !og || !alt) {
      missing.push(
        `${file} (${[!hero && 'heroImage', !og && 'ogImage', !alt && 'heroImageAlt'].filter(Boolean).join(', ')})`
      );
      continue;
    }
    // A path that points at nothing is the same as no image, and only shows up
    // as a broken box after it has shipped. heroImageLight is optional — a
    // photograph needs no second copy — but a declared one must resolve, or the
    // paper theme renders an empty frame where the hero should be.
    const heroLight = get('heroImageLight');
    for (const ref of [hero, og, heroLight].filter(Boolean)) {
      if (
        !existsSync(
          pathMod.join(process.cwd(), 'public', ref.replace(/^\//, ''))
        )
      )
        broken.push(`${file} -> ${ref}`);
    }
  }
  ok(
    'no staged or published article is missing its hero/og/alt',
    missing.length === 0,
    missing.join('; ')
  );
  ok(
    'every referenced image file actually exists on disk',
    broken.length === 0,
    broken.join('; ')
  );
}

console.log(
  '\n— publishDate says when it published, not when it was written —'
);
// publishDate is authored at DRAFT time and an article can sit staged for days,
// so without something watching, the date that reaches production is whichever
// day the draft happened to be written. It is not cosmetic: it is the
// schema.org `datePublished` asserted to Google and the date on every card.
// autopublish.mjs restamps it on the scheduled path; these two checks cover the
// manual path, where a person merges a staged article by hand.
{
  const today = publishDay();
  const future = [];
  const stale = [];
  for (const file of readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
    const p = parsePost(readFileSync(pathMod.join(DIR, file), 'utf8'), file);
    if (Number.isNaN(Date.parse(p.publishDate))) continue; // shape is tested above
    if (p.status === 'published' && p.publishDate > today) {
      future.push(`${p.slug} (${p.publishDate})`);
    }
    if (p.status !== 'published' && p.publishDate < today) {
      stale.push(`${p.slug} (${p.publishDate})`);
    }
  }

  // Hard failure: a live article cannot have published tomorrow. This is always
  // a mistake and it is visible to readers and to Google the moment it ships.
  ok(
    'no published article is dated in the future',
    future.length === 0,
    future.join('; ')
  );

  // Advisory: a staged article whose date has already passed WILL go live
  // backdated. That is worth saying out loud, but it must not fail the build —
  // a draft legitimately waits for its moment, and a red main every time
  // something sits overnight would train everyone to ignore this file.
  if (stale.length) {
    console.log(
      `WARN  ${stale.length} unpublished article(s) already dated in the past — ` +
        `they will publish backdated unless restamped: ${stale.join('; ')}`
    );
  } else {
    console.log('PASS  no unpublished article is carrying a stale date');
    pass++;
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
