/**
 * Market Storm: the front and the archive.
 *
 * Since 2026-10-09 the section has a front, in an order Josh sets with `pin`
 * (1 leads), and an archive (`archived`) of reports that left the front but
 * kept their URLs. The pages, the Writing room, the sitemap and search all
 * read that from src/data/marketStorm.ts, and none of them can tell a typo in
 * it from a decision. Two reports pinned 2, a lead nobody pinned, a report
 * both pinned and archived: each one renders without an error and quietly
 * puts the wrong thing at the front of the section.
 *
 * So these run on every build:
 *
 *   - every slug is unique and resolves to its own entry
 *   - every publish date is an ISO day, since the front and the archive sort
 *     on it as text
 *   - pins are unique positive integers
 *   - something is pinned 1, it is the lead, and it is not archived
 *   - nothing archived has a pin
 *   - the front and the archive split the section between them, and the front
 *     takes the pinned reports first, in pin order
 *   - every report at the front has a card picture: an image, or a template
 *     report's figures
 *   - every image the data names is a real file under public/
 *   - every article has a page in src/content/market-storm/index.ts
 *
 *   node --import ./scripts/ts-resolve-register.mjs scripts/test-market-storm.mjs
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  archivedReports,
  frontReports,
  getReportBySlug,
  isArticle,
  leadReport,
  marketStormReports,
  shareImageOf,
} from '../src/data/marketStorm.ts';
import { articlePages } from '../src/content/market-storm/index.ts';

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
const list = (entries) => entries.map((e) => e.slug).join(', ');

const all = marketStormReports;
const pinned = all.filter((e) => e.pin !== undefined);
const front = frontReports();
const archive = archivedReports();

console.log('— the section —');

const slugs = all.map((e) => e.slug);
ok(
  'every slug is unique',
  new Set(slugs).size === slugs.length,
  slugs.filter((s, i) => slugs.indexOf(s) !== i).join(', ')
);

ok(
  'every slug resolves to its own entry',
  all.every((e) => getReportBySlug(e.slug) === e),
  list(all.filter((e) => getReportBySlug(e.slug) !== e))
);

const isoDay = (s) =>
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
ok(
  'every publish date is an ISO day (YYYY-MM-DD)',
  all.every((e) => isoDay(e.publishDate)),
  all
    .filter((e) => !isoDay(e.publishDate))
    .map((e) => `${e.slug}: ${e.publishDate}`)
    .join(', ')
);

console.log('— the front —');

ok(
  'pins are positive integers',
  pinned.every((e) => Number.isInteger(e.pin) && e.pin > 0),
  pinned
    .filter((e) => !(Number.isInteger(e.pin) && e.pin > 0))
    .map((e) => `${e.slug}: ${e.pin}`)
    .join(', ')
);

const pins = pinned.map((e) => e.pin);
ok(
  'pins are unique',
  new Set(pins).size === pins.length,
  pinned
    .filter((e) => pins.indexOf(e.pin) !== pins.lastIndexOf(e.pin))
    .map((e) => `${e.slug}: ${e.pin}`)
    .join(', ')
);

const first = all.filter((e) => e.pin === 1);
ok(
  'something is pinned 1',
  first.length > 0,
  'nothing has pin: 1, so the lead is whatever happens to sort first'
);
ok(
  'the pin-1 report is not archived',
  first.every((e) => !e.archived),
  list(first.filter((e) => e.archived))
);
ok(
  'the pin-1 report is the lead',
  first.length > 0 && leadReport() === first[0],
  `lead is ${leadReport()?.slug}`
);

ok(
  'nothing archived has a pin',
  all.every((e) => !(e.archived && e.pin !== undefined)),
  list(all.filter((e) => e.archived && e.pin !== undefined))
);

ok(
  'the front and the archive split the section between them',
  front.length + archive.length === all.length &&
    all.every((e) => front.includes(e) !== archive.includes(e)),
  `front ${front.length} + archive ${archive.length} of ${all.length}`
);

const atFront = pinned.filter((e) => !e.archived).length;
const order = front.slice(0, atFront).map((e) => e.pin);
ok(
  'the front takes the pinned reports first, in pin order',
  order.every((p, i) => p !== undefined && (i === 0 || order[i - 1] < p)),
  `front opens with pins ${order.join(', ')}`
);

// A card at the front draws the article's own image, or a template report's
// headline figures. With neither it renders an empty frame.
const pictured = (e) =>
  Boolean(e.cardImage) || (!isArticle(e) && e.kpis.length > 0);
ok(
  'every report at the front has a card picture',
  front.every(pictured),
  list(front.filter((e) => !pictured(e)))
);

console.log('— files —');

const PUBLIC = path.join(process.cwd(), 'public');
const images = all.flatMap((e) =>
  [e.cardImage, e.cardImageLight, e.ogImage, shareImageOf(e)]
    .filter(Boolean)
    .map((src) => ({ slug: e.slug, src }))
);
const missing = images.filter(
  ({ src }) => !src.startsWith('/') || !existsSync(path.join(PUBLIC, src))
);
ok(
  'every image the data names is a file under public/',
  missing.length === 0,
  missing.map(({ slug, src }) => `${slug}: ${src}`).join(', ')
);

const articles = all.filter(isArticle);
ok(
  'every article has a page in src/content/market-storm/index.ts',
  articles.every((e) => typeof articlePages[e.slug] === 'function'),
  list(articles.filter((e) => typeof articlePages[e.slug] !== 'function'))
);

console.log(
  `\n${all.length} reports · ${front.length} at the front (${list(front)}) · ${archive.length} archived`
);
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
