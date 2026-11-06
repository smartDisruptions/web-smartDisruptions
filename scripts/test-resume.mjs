/**
 * Tests for the résumé (/resume).
 *
 * The page's whole argument is "open any of it", so its failure mode is a
 * link that looks fine and goes nowhere: a staged article (renders on the
 * preview, 404s live), a /built page that was renamed, a game whose folder
 * moved, a screenshot that isn't there. A hiring manager clicking a dead
 * link is worse than no link, so these run with the rest of `npm test`.
 *
 *   node --import ./scripts/ts-resolve-register.mjs scripts/test-resume.mjs
 */
import { existsSync } from 'node:fs';
import {
  CAPABILITIES,
  EXPERIENCE,
  FEATURED,
  GALLERY,
  HOW_I_BUILD,
  SKILLS,
} from '../src/data/resume.ts';
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

/** Does a site-relative link lead to a real page? */
function resolves(href) {
  const path = href.split('#')[0];
  if (path === '/' || path === '/games' || path === '/market-storm')
    return true;
  let m;
  if ((m = path.match(/^\/content\/([^/]+)$/))) return published.has(m[1]);
  if ((m = path.match(/^\/market-storm\/([^/]+)$/))) return reports.has(m[1]);
  if ((m = path.match(/^\/built\/([^/]+)$/))) return builtSlugs.has(m[1]);
  if ((m = path.match(/^\/games\/([^/]+)$/)))
    return existsSync(`public/games/${m[1]}/index.html`);
  if ((m = path.match(/^\/demo\/([^/]+)$/)))
    return existsSync(`public/demo/${m[1]}`);
  return false;
}

const links = [
  ...CAPABILITIES.flatMap((c) => c.proof.map((p) => ({ from: c.id, ...p }))),
  ...FEATURED.flatMap((f) => f.links.map((l) => ({ from: f.id, ...l }))),
  ...HOW_I_BUILD.filter((h) => h.proof).map((h) => ({
    from: h.title,
    ...h.proof,
  })),
  ...GALLERY.flatMap((w) => [
    { from: w.id, label: w.name, href: w.href },
    ...(w.more ? [{ from: w.id, label: 'more', href: w.more }] : []),
  ]),
];

console.log('— every link goes somewhere —');

const dead = links.filter((l) => l.href.startsWith('/') && !resolves(l.href));
ok(
  'every site link resolves (published article, real report, /built page, game or demo)',
  dead.length === 0,
  dead.map((l) => `${l.from}: ${l.href}`).join(', ')
);
ok(
  'every link is a site path or an https URL',
  links.every((l) => l.href.startsWith('/') || l.href.startsWith('https://')),
  links
    .filter((l) => !l.href.startsWith('/') && !l.href.startsWith('https://'))
    .map((l) => `${l.from}: ${l.href}`)
    .join(', ')
);
ok(
  'nothing points into the private knowledge-base repository',
  !links.some((l) => l.href.includes('josh-ai-builder-brain'))
);

console.log('— every picture is there —');

const images = [
  ...FEATURED.map((f) => ({ from: f.id, src: f.image })),
  ...GALLERY.map((w) => ({ from: w.id, src: w.image })),
];
const missing = images.filter((i) => !existsSync(`public${i.src}`));
ok(
  'every featured and gallery image exists',
  missing.length === 0,
  missing.map((i) => `${i.from}: ${i.src}`).join(', ')
);
ok(
  'every featured image has alt text and its real size',
  FEATURED.every((f) => f.imageAlt && f.imageWidth > 0 && f.imageHeight > 0)
);

console.log('— the shape —');

ok(
  'every capability has a title, a line and at least one piece of proof',
  CAPABILITIES.every((c) => c.title && c.line && c.proof.length > 0)
);
ok(
  'every featured piece has a problem, what I built, a result, a stack and a link',
  FEATURED.every(
    (f) =>
      f.problem &&
      f.built.length >= 2 &&
      f.result &&
      f.stack.length &&
      f.links.length
  )
);
ok(
  'nothing featured is repeated in the gallery',
  !GALLERY.some((w) => FEATURED.some((f) => f.id === w.id))
);
ok(
  'the gallery holds every kind of work',
  ['Website', 'App', 'Game'].every((k) => GALLERY.some((w) => w.kind === k))
);
ok(
  'gallery ids are unique',
  new Set(GALLERY.map((w) => w.id)).size === GALLERY.length
);
ok(
  'every experience entry has a when, a role and a point',
  EXPERIENCE.every((x) => x.when && x.role && x.points.length)
);
ok(
  'every skill group has items',
  SKILLS.every((g) => g.group && g.items.length)
);

console.log(
  `\n${CAPABILITIES.length} capabilities · ${FEATURED.length} featured · ${GALLERY.length} in the gallery · ${links.length} links checked`
);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
