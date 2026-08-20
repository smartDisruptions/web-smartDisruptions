/**
 * Tests for the skills section on /about.
 *
 * The section makes one promise — every skill listed has something a stranger
 * can open that shows it being used — and the failure mode of that promise is
 * not a crash. It is a page that renders beautifully while pointing at a URL
 * that 404s, which is worse than claiming nothing: it invites the reader to
 * check and then wastes it.
 *
 * So these run on every build:
 *
 *   - every skill has at least one piece of evidence
 *   - every app slug resolves in apps.ts (the labels are derived from it)
 *   - every article link is genuinely PUBLISHED, not staged or draft
 *   - every Market Storm link resolves to a real report
 *   - nothing points into the private knowledge-base repository
 *
 * Two of those exist because they already caught a live mistake: a link into
 * the private vault repo, which 404s for everyone who is not Josh, and a link
 * to a staged article, which renders on preview builds and 404s on the real
 * site. Both looked completely fine in a browser on the preview.
 *
 *   node --import ./scripts/ts-resolve-register.mjs scripts/test-skills.mjs
 */
import {
  allSkills,
  evidenceFor,
  skillGroups,
  skillTotals,
} from '../src/data/skills.ts';
import { apps } from '../src/data/apps.ts';
import { getAllPosts } from '../src/lib/posts.ts';
import { marketStormReports } from '../src/data/marketStorm.ts';

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

const appSlugs = new Set(apps.map((a) => a.slug));
const reportSlugs = new Set(marketStormReports.map((r) => r.slug));

/*
 * `getPublishedPosts()` is environment-aware on purpose: a staged article
 * renders on preview deployments so it can be read before it ships. That is
 * the wrong gate here, because these links point at the LIVE site — so the
 * bar is `published` outright. The first version of this check used the
 * environment-aware helper and happily passed a staged article.
 */
const publishedSlugs = new Set(
  getAllPosts()
    .filter((p) => p.status === 'published')
    .map((p) => p.slug)
);

const withEvidence = allSkills.map((s) => ({ skill: s, ev: evidenceFor(s) }));
const everyLink = withEvidence.flatMap(({ skill, ev }) =>
  ev.map((e) => ({ skill: skill.id, ...e }))
);

console.log('— shape —');

ok(
  'every skill id is unique',
  new Set(allSkills.map((s) => s.id)).size === allSkills.length
);

ok(
  'every group has an id, a name and at least one skill',
  skillGroups.every((g) => g.id && g.name && g.blurb && g.skills.length > 0)
);

ok(
  'every skill has a term, a plain-language line and a where-I-used-it',
  allSkills.every((s) => s.name && s.plain && s.used),
  allSkills
    .filter((s) => !s.name || !s.plain || !s.used)
    .map((s) => s.id)
    .join(', ')
);

console.log('— the promise —');

ok(
  'every skill has at least one piece of evidence',
  withEvidence.every(({ ev }) => ev.length > 0),
  withEvidence
    .filter(({ ev }) => ev.length === 0)
    .map(({ skill }) => skill.id)
    .join(', ')
);

ok(
  'every app slug resolves in apps.ts',
  allSkills.every((s) => (s.apps ?? []).every((slug) => appSlugs.has(slug))),
  allSkills
    .flatMap((s) => (s.apps ?? []).filter((slug) => !appSlugs.has(slug)))
    .join(', ')
);

const badArticles = everyLink
  .filter((l) => l.href.startsWith('/content/'))
  .filter((l) => !publishedSlugs.has(l.href.replace('/content/', '')));

ok(
  'every article linked is published, not staged or draft',
  badArticles.length === 0,
  badArticles.map((l) => `${l.skill}: ${l.href}`).join(', ')
);

const badReports = everyLink
  .filter((l) => /^\/market-storm\/.+/.test(l.href))
  .filter((l) => !reportSlugs.has(l.href.replace('/market-storm/', '')));

ok(
  'every Market Storm report linked exists',
  badReports.length === 0,
  badReports.map((l) => `${l.skill}: ${l.href}`).join(', ')
);

ok(
  'nothing points into the private knowledge-base repository',
  !everyLink.some((l) => l.href.includes('josh-ai-builder-brain')),
  everyLink
    .filter((l) => l.href.includes('josh-ai-builder-brain'))
    .map((l) => `${l.skill}: ${l.label}`)
    .join(', ')
);

ok(
  'every link is either a site-relative path or an https URL',
  everyLink.every(
    (l) => l.href.startsWith('/') || l.href.startsWith('https://')
  ),
  everyLink
    .filter((l) => !l.href.startsWith('/') && !l.href.startsWith('https://'))
    .map((l) => `${l.skill}: ${l.href}`)
    .join(', ')
);

ok(
  'internal is set from the href, so nothing site-relative opens in a new tab',
  everyLink.every((l) => l.internal === l.href.startsWith('/'))
);

console.log('— reach —');

/*
 * The apps and the arcade are meant to be load-bearing evidence here, not a
 * gallery sitting off to one side. If the skills stop pointing at them this
 * has quietly become a list of articles.
 */
const linkedApps = new Set(allSkills.flatMap((s) => s.apps ?? []));
ok(
  'the skills point at most of the app gallery',
  linkedApps.size >= Math.ceil(apps.length * 0.7),
  `${linkedApps.size} of ${apps.length} apps referenced`
);

ok(
  'the arcade is cited as evidence',
  everyLink.some((l) => l.href === '/games')
);

ok(
  'at least one skill is evidenced by a game',
  everyLink.some((l) => l.kind === 'game')
);

const totals = skillTotals();
ok(
  'the totals agree with the data they are counted from',
  totals.skills === allSkills.length && totals.apps === apps.length
);

console.log(
  `\n${totals.skills} skills · ${totals.receipts} distinct receipts · ${totals.apps} apps · ${totals.games} arcade cabinets`
);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
