#!/usr/bin/env node
// The stills the /videos page needs, and the two colours each video lends the room.
//
//   node scripts/video-assets.mjs                 every folder under public/videos and public/films
//   node scripts/video-assets.mjs <poster.jpg> <public folder>   also make that folder's poster first
//
// For each folder that holds a film it makes sure there is
//   poster.webp  1280x720, the frame on the screen before play
//   thumb.webp    640x360, the same frame for the library and for phones
// and prints a `tint` pair for src/data/videos.ts: the two strongest colours in
// the frame, evened out so every video glows about as brightly. The page paints
// them as a soft light behind the screen. They are data, so a pair that reads
// wrong can simply be changed by hand in the data file.
import { readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const pub = join(root, 'public');
const exists = (p) =>
  stat(p).then(
    () => true,
    () => false
  );

const [srcPoster, srcDir] = process.argv.slice(2);
if (srcPoster && srcDir) {
  await sharp(srcPoster)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 80, effort: 6 })
    .toFile(join(root, srcDir, 'poster.webp'));
}

async function folders(dir, depth) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = join(dir, e.name);
    if (await exists(join(p, 'film.mp4'))) out.push(p);
    else if (depth > 0) out.push(...(await folders(p, depth - 1)));
  }
  return out;
}

const hsv = (r, g, b) => {
  const mx = Math.max(r, g, b),
    mn = Math.min(r, g, b),
    d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx / 255];
};
const hsl2hex = (h, s, l) => {
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c =
      l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/** The two strongest hues in a frame, as glow colours of even strength. */
async function tint(file) {
  const { data } = await sharp(file)
    .resize(64, 36, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bins = Array.from({ length: 24 }, () => ({ w: 0, x: 0, y: 0, s: 0 }));
  for (let i = 0; i < data.length; i += 3) {
    const [h, s, v] = hsv(data[i], data[i + 1], data[i + 2]);
    if (s < 0.2 || v < 0.16) continue; // greys and blacks have no hue worth lending
    const w = s * s * v;
    const b = bins[Math.floor(h / 15) % 24];
    b.w += w;
    b.x += Math.cos((h * Math.PI) / 180) * w;
    b.y += Math.sin((h * Math.PI) / 180) * w;
    b.s += s * w;
  }
  // Smooth across neighbours so a hue that straddles two bins still wins.
  const score = bins.map(
    (b, i) => b.w + 0.5 * (bins[(i + 23) % 24].w + bins[(i + 1) % 24].w)
  );
  const order = score.map((w, i) => [w, i]).sort((a, b) => b[0] - a[0]);
  if (!order[0][0]) return null; // a frame with no colour: the page falls back to moonlight
  const hue = (i) => {
    const b = bins[i];
    return ((Math.atan2(b.y, b.x) * 180) / Math.PI + 360) % 360;
  };
  const a = order[0][1];
  const far = order.find(
    ([w, i]) =>
      w > order[0][0] * 0.12 &&
      Math.min(Math.abs(i - a), 24 - Math.abs(i - a)) >= 4
  );
  const ha = hue(a);
  const hb = far ? hue(far[1]) : (ha + 32) % 360;
  const sat = (i) =>
    Math.min(0.92, Math.max(0.6, (bins[i].s / bins[i].w) * 1.05));
  return [
    hsl2hex(ha, sat(a), 0.56),
    hsl2hex(hb, far ? sat(far[1]) : sat(a) * 0.9, 0.56),
  ];
}

const dirs = [
  ...(await folders(join(pub, 'videos'), 0)),
  ...(await folders(join(pub, 'films'), 1)),
].sort();
for (const d of dirs) {
  const poster = join(d, 'poster.webp');
  if (!(await exists(poster))) {
    console.log(`${relative(pub, d)}: no poster.webp, skipped`);
    continue;
  }
  const thumb = join(d, 'thumb.webp');
  let made = '';
  if (!(await exists(thumb))) {
    await sharp(poster)
      .resize(640, 360, { fit: 'cover' })
      .webp({ quality: 76, effort: 6 })
      .toFile(thumb);
    made = '  (made thumb.webp)';
  }
  const t = await tint(poster);
  console.log(
    `/${relative(pub, d)}`.padEnd(40),
    t ? `tint: ['${t[0]}', '${t[1]}']` : 'tint: none (no colour in the frame)',
    made
  );
}
