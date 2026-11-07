/**
 * The wall's pictures, made small ahead of time.
 *
 *   npm run wall:thumbs          make any that are missing or out of date
 *   npm run test:wall            check only; fails if one is missing or stale
 *
 * Every plaque on /about's wall (components/built/ArmoryWall) shows its
 * screenshot in a 16:10 box: 252×158 CSS px, 176×110 on a phone. Those
 * screenshots are 1200 px originals, and they used to go through next/image,
 * which on Vercel means /_next/image resizes each one on the first request
 * after its cache lapses. The site's traffic is light enough that most visits
 * found it cold, so on a phone or an iPad the plaques filled in one by one
 * while the ring turned (Josh, 2026-11-07).
 *
 * So each one is made here instead, once, at the size the plaque draws it:
 * 528×330, which is the phone's 176 px at 3× and covers the 252 px plaque
 * at 2×, cropped to the box from the top centre exactly as the CSS crops it
 * (object-fit: cover; object-position: top). They are plain files in
 * public/images/wall/, served from the CDN with no resizing step.
 *
 * wall-thumbs.json (beside ArmoryWall) maps each screenshot to its thumbnail
 * and the hash of the screenshot it was made from. ArmoryWall reads it: a
 * plaque whose screenshot has a thumbnail shows that, and one that doesn't
 * yet (a new thing on the wall, before this has been run) falls back to
 * next/image, slower but never broken. `npm test` runs the check, which is
 * what says a thumbnail is missing or was made from an older screenshot.
 *
 * sharp is the one next/image itself uses (installed with next).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { wall } from '../src/components/about/work/data.ts';

const W = 528;
const H = 330;
const QUALITY = 72;
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public/images/wall');
const MANIFEST = path.join(ROOT, 'src/components/built/wall-thumbs.json');
const check = process.argv.includes('--check');

const hashOf = (file) =>
  createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 12);
/** /images/apps/rubble-rouser-thumbnail.webp → /images/wall/apps-rubble-rouser-thumbnail.webp */
const thumbFor = (src) => {
  const rel = src.replace(/^\/images\//, '');
  const name = rel.replace(/\.[a-z0-9]+$/i, '').replace(/\//g, '-');
  return `/images/wall/${name}.webp`;
};

const old = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : {};
const sources = [...new Set(wall.map((item) => item.src))];
const next = {};
const problems = [];
let made = 0;

if (!check) mkdirSync(OUT_DIR, { recursive: true });

for (const src of sources) {
  const file = path.join(ROOT, 'public', src);
  if (!existsSync(file)) {
    problems.push(`${src}: the screenshot itself is missing`);
    continue;
  }
  const hash = hashOf(file);
  const thumb = thumbFor(src);
  const thumbFile = path.join(ROOT, 'public', thumb);
  const fresh = old[src]?.hash === hash && existsSync(thumbFile);
  if (fresh) {
    next[src] = old[src];
    continue;
  }
  if (check) {
    problems.push(
      `${src}: ${old[src] ? 'its thumbnail was made from an older screenshot' : 'no thumbnail yet'}`
    );
    continue;
  }
  await sharp(file)
    .resize(W, H, { fit: 'cover', position: 'top' })
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(thumbFile);
  next[src] = { thumb, hash };
  made++;
}

if (check) {
  if (problems.length) {
    console.error(
      `The wall's thumbnails are out of date (run npm run wall:thumbs):\n  ${problems.join('\n  ')}`
    );
    process.exit(1);
  }
  console.log(`wall thumbnails: all ${sources.length} present and current`);
} else {
  // Sorted, so the file only changes when a thumbnail does.
  const sorted = Object.fromEntries(
    Object.keys(next)
      .sort()
      .map((k) => [k, next[k]])
  );
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exit(1);
  }
  console.log(
    `wall thumbnails: made ${made}, ${sources.length - made} already current`
  );
}
