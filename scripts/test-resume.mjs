/**
 * Tests for the résumé (/resume).
 *
 * The page is built on the skills list (test-skills.mjs covers that), and
 * adds three things of its own that can each go quietly wrong: a "hiring
 * for…" lens naming a skill that was renamed (it would filter to nothing),
 * a case-study link to a staged article or a report that doesn't exist
 * (fine on the preview, a 404 on the live site), and a link into the
 * private knowledge base. A hiring manager clicking a dead receipt is worse
 * than no receipt, so these run with the rest.
 *
 *   node --import ./scripts/ts-resolve-register.mjs scripts/test-resume.mjs
 */
import {
  CASE_STUDIES,
  EXPERIENCE,
  LENSES,
  LOOP,
  lensesFor,
} from '../src/data/resume.ts';
import { allSkills } from '../src/data/skills.ts';
import { apps } from '../src/data/apps.ts';
import { projects } from '../src/data/projects.ts';
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

const skillIds = new Set(allSkills.map((s) => s.id));
const published = new Set(
  getAllPosts()
    .filter((p) => p.status === 'published')
    .map((p) => p.slug)
);
const reports = new Set(marketStormReports.map((r) => r.slug));
const builtSlugs = new Set([
  ...apps.map((a) => a.slug),
  ...projects.map((p) => p.slug),
]);

console.log('— the lens —');

ok(
  'every lens has a short URL-safe id, a name and a pitch',
  LENSES.every((l) => /^[a-z]+$/.test(l.id) && l.name && l.pitch)
);
ok(
  'lens ids are unique',
  new Set(LENSES.map((l) => l.id)).size === LENSES.length
);
ok(
  'no lens is called "all" (that one means everything)',
  !LENSES.some((l) => l.id === 'all')
);

const unknown = LENSES.flatMap((l) =>
  l.skills.filter((id) => !skillIds.has(id)).map((id) => `${l.id}: ${id}`)
);
ok(
  'every skill a lens names exists in skills.ts',
  unknown.length === 0,
  unknown.join(', ')
);

ok(
  'every lens keeps at least four skills, so it never filters to a stub',
  LENSES.every((l) => new Set(l.skills).size >= 4)
);

const orphans = allSkills
  .filter((s) => lensesFor(s.id).length === 0)
  .map((s) => s.id);
ok(
  'every skill shows under at least one lens',
  orphans.length === 0,
  orphans.join(', ')
);

console.log('— the receipts —');

const links = CASE_STUDIES.flatMap((c) =>
  c.links.map((l) => ({ c: c.id, ...l }))
);

ok(
  'every case study has a call and at least one link',
  CASE_STUDIES.every((c) => c.call && c.links.length > 0)
);

const badArticles = links
  .filter((l) => l.href.startsWith('/content/'))
  .filter((l) => !published.has(l.href.slice('/content/'.length)));
ok(
  'every article linked is published',
  badArticles.length === 0,
  badArticles.map((l) => `${l.c}: ${l.href}`).join(', ')
);

const badReports = links
  .filter((l) => /^\/market-storm\/.+/.test(l.href))
  .filter((l) => !reports.has(l.href.slice('/market-storm/'.length)));
ok(
  'every Market Storm report linked exists',
  badReports.length === 0,
  badReports.map((l) => l.href).join(', ')
);

const badBuilt = links
  .filter((l) => l.href.startsWith('/built/'))
  .filter((l) => !builtSlugs.has(l.href.slice('/built/'.length)));
ok(
  'every /built page linked exists',
  badBuilt.length === 0,
  badBuilt.map((l) => l.href).join(', ')
);

ok(
  'every link is a site path or an https URL',
  links.every((l) => l.href.startsWith('/') || l.href.startsWith('https://'))
);
ok(
  'nothing points into the private knowledge-base repository',
  !links.some((l) => l.href.includes('josh-ai-builder-brain'))
);

console.log('— the rest —');

ok(
  'the loop has steps with a line each',
  LOOP.length >= 3 && LOOP.every((s) => s.step && s.line)
);
ok(
  'every experience entry has a when, a role and a line',
  EXPERIENCE.every((x) => x.when && x.role && x.line)
);

console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
