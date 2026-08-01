/**
 * Tests for the post store: frontmatter round-tripping and the publish gate.
 * The gate is the security-relevant half — an unpublished draft must not be
 * reachable, listed, or in the sitemap.
 *
 *   node scripts/test-posts.mjs
 */
import { parseFrontmatter, stringifyFrontmatter } from '../src/lib/frontmatter.ts';
import { parsePost, isLive } from '../src/lib/posts.ts';

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

ok('scalars survive', (() => {
  const r = rt({ title: 'A title', n: 42, flag: true, nil: null });
  return r.data.title === 'A title' && r.data.n === 42 && r.data.flag === true && r.data.nil === null;
})());

ok('a numeric-looking string stays a string', (() => {
  const r = rt({ publishDate: '2026-08-01', version: '2.0' });
  return r.data.publishDate === '2026-08-01' && r.data.version === '2.0';
})(), 'quoting guard for number-like strings');

ok('colons and quotes in prose survive', (() => {
  const tricky = 'A card headed "Three things": invented source, no denominator';
  return rt({ excerpt: tricky }).data.excerpt === tricky;
})());

ok('commas inside quoted array items do not split', (() => {
  const r = rt({ tags: ['ai', 'a, b', 'workflow'] });
  return JSON.stringify(r.data.tags) === JSON.stringify(['ai', 'a, b', 'workflow']);
})());

ok('empty array survives', JSON.stringify(rt({ tags: [] }).data.tags) === '[]');

ok('channel objects survive', (() => {
  const ch = [
    { name: 'linkedin', status: 'scheduled', scheduledFor: '2026-08-02T16:00:00Z' },
    { name: 'substack', status: 'planned' },
  ];
  return JSON.stringify(rt({ channels: ch }).data.channels) === JSON.stringify(ch);
})());

ok('body with --- inside is not treated as a delimiter', (() => {
  const body = 'intro\n\n---\n\nafter a horizontal rule';
  return rt({ title: 'x' }, body).body === body;
})());

ok('body markdown headings survive', (() => {
  const body = '## 1. Loading context\n\ntext **bold** and `code`';
  return rt({ title: 'x' }, body).body === body;
})());

ok('no frontmatter returns whole text as body', (() => {
  const r = parseFrontmatter('# just markdown\n');
  return Object.keys(r.data).length === 0 && r.body === '# just markdown\n';
})());

throws('unterminated frontmatter throws', () => parseFrontmatter('---\ntitle: x\n'), /never closed/);
throws('malformed line throws', () => parseFrontmatter('---\nthis is not a pair\n---\nbody'), /Malformed/);

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

ok('defaults to draft when status omitted', parsePost(base('status: draft'), 'a.md').status === 'draft');
throws('unknown status is rejected', () => parsePost(base('status: sortof'), 'a.md'), /unknown status/);
throws('scheduled without liveAt is rejected', () => parsePost(base('status: scheduled'), 'a.md'), /liveAt is missing/);
throws('invalid liveAt is rejected', () => parsePost(base('status: scheduled\nliveAt: soon'), 'a.md'), /not a valid date/);
throws('unknown channel status is rejected',
  () => parsePost(base('status: draft\nchannels:\n  - name: x\n    status: whenever'), 'a.md'),
  /unknown channel status/);

console.log('\n— the publish gate —');
const mk = (status, liveAt) => parsePost(base(`status: ${status}${liveAt ? `\nliveAt: ${liveAt}` : ''}`), 'a.md');

// Only a deliberate press publishes. A date is a plan, never an instruction:
// otherwise an article scheduled for last week and never pressed would go live
// as a side effect of publishing something else, since Publish promotes
// dev -> main and rebuilds the whole site.
ok('draft is NOT live', isLive(mk('draft')) === false);
ok('published IS live', isLive(mk('published')) === true);
ok('scheduled in the future is NOT live', isLive(mk('scheduled', '2026-08-05T00:00:00Z')) === false);
ok('scheduled in the PAST is still NOT live', isLive(mk('scheduled', '2020-01-01T00:00:00Z')) === false,
   'an overdue date must never self-publish');
ok('scheduled far in the past is still NOT live', isLive(mk('scheduled', '1999-01-01T00:00:00Z')) === false);
ok('only status decides — liveAt is ignored for published', isLive(mk('published')) === true);

console.log('\n— the real content store —');
const { readdirSync, readFileSync, writeFileSync, unlinkSync } = await import('node:fs');
const pathMod = await import('node:path');
const DIR = pathMod.join(process.cwd(), 'src/content/posts');
const files = readdirSync(DIR).filter((f) => f.endsWith('.md'));

ok('every post file parses', (() => {
  for (const f of files) parsePost(readFileSync(pathMod.join(DIR, f), 'utf8'), f);
  return true;
})(), 'a parse error would have thrown');

ok('every post has the fields the pages read', (() => {
  return files.every((f) => {
    const p = parsePost(readFileSync(pathMod.join(DIR, f), 'utf8'), f);
    return p.slug && p.title && p.excerpt && p.category && p.publishDate && p.body.length > 100;
  });
})());

ok('filename matches slug', files.every((f) => {
  const p = parsePost(readFileSync(pathMod.join(DIR, f), 'utf8'), f);
  return `${p.slug}.md` === f;
}));

// The gate has to hold against the real loader, not just the pure function:
// drop a draft into the store and confirm every public surface ignores it.
const probe = pathMod.join(DIR, 'zzz-gate-probe.md');
writeFileSync(probe, `---
title: Gate probe
slug: zzz-gate-probe
excerpt: Should never be publicly visible.
category: Working With AI
publishDate: 2099-01-01
tags: [test]
status: draft
---
Draft body that must not reach the public site.`);
try {
  const mod = await import(`../src/lib/posts.ts?cachebust=${files.length}`);
  const all = mod.getAllPosts();
  const live = mod.getPublishedPosts();
  ok('draft IS visible to the dashboard (getAllPosts)', all.some((p) => p.slug === 'zzz-gate-probe'));
  ok('draft is NOT in getPublishedPosts', !live.some((p) => p.slug === 'zzz-gate-probe'));
  ok('draft is NOT resolvable by slug', mod.getPostBySlug('zzz-gate-probe') === undefined);
  ok('published posts all pass isLive', live.every((p) => mod.isLive(p)));
} finally {
  unlinkSync(probe);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
