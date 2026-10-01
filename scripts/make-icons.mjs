#!/usr/bin/env node
/**
 * Renders the app icons — Kiru's head on a moonlit indigo tile — from SVG with
 * the repo's own sharp. Re-run after changing KiruMark's geometry:
 *
 *   node scripts/make-icons.mjs
 *
 * Writes public/icons/*.png, src/app/apple-icon.png and src/app/favicon.ico.
 * The geometry below mirrors src/components/brand/KiruMark.tsx.
 */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const MARK = `
  <path d="M47 23c7-4 11-2 15-6-1 6-6 9-12 9 5 1 8 4 12 3-4 4-10 4-15 1z" fill="#bd3019"/>
  <ellipse cx="31" cy="34" rx="26" ry="24" fill="#252d56" stroke="#3d4c95" stroke-width="1.6"/>
  <path d="M5 30 Q31 14 57 30" stroke="#e8432a" stroke-width="7" fill="none"/>
  <rect x="25" y="17.5" width="12" height="7" rx="1.6" fill="#cfd5e2"/>
  <path d="M32.4 18.6 29 21.7h2.3l-1.4 1.9 3.8-3.2h-2.3z" fill="#e8432a"/>
  <path d="M12 33c9-4.6 29-4.6 38 0 3.2 1.6 3.2 7.6 0 9.2-9 4.6-29 4.6-38 0-3.2-1.6-3.2-7.6 0-9.2Z" fill="#f6d0a8"/>
  <ellipse cx="23.5" cy="37.6" rx="4" ry="4.6" fill="#fff"/>
  <ellipse cx="38.5" cy="37.6" rx="4" ry="4.6" fill="#fff"/>
  <circle cx="24.3" cy="38.3" r="2.6" fill="#13152a"/>
  <circle cx="39.3" cy="38.3" r="2.6" fill="#13152a"/>
  <path d="M18.5 31.6l8 2M43.5 31.6l-8 2" stroke="#13152a" stroke-width="2" stroke-linecap="round"/>`;

/** size: output px. pad: fraction of the tile left around the mark. */
function tile(size, { pad = 0.12, radius = 0.22, full = false } = {}) {
  const inner = 64 * (1 + pad * 2);
  const off = 64 * pad;
  const r = full ? 0 : inner * radius;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-off} ${-off} ${inner} ${inner}">
    <defs>
      <radialGradient id="sky" cx="0.7" cy="0.15" r="1">
        <stop offset="0" stop-color="#2a3570"/><stop offset="0.55" stop-color="#121735"/><stop offset="1" stop-color="#090b16"/>
      </radialGradient>
    </defs>
    <rect x="${-off}" y="${-off}" width="${inner}" height="${inner}" rx="${r}" fill="url(#sky)"/>
    <circle cx="46" cy="16" r="15" fill="#fff3d6" opacity="0.95"/>
    <circle cx="46" cy="16" r="21" fill="#fff3d6" opacity="0.12"/>
    ${MARK}
  </svg>`;
}

async function png(svg, out) {
  const buf = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(out, buf);
  return buf;
}

await png(tile(192), 'public/icons/icon-192.png');
await png(tile(512), 'public/icons/icon-512.png');
// Maskable: full-bleed, mark inside the 80% safe circle.
await png(tile(512, { pad: 0.34, full: true }), 'public/icons/maskable-512.png');
await png(tile(180, { pad: 0.16, full: true }), 'src/app/apple-icon.png');

// favicon.ico with 16/32/48 PNG entries (the ICO container accepts PNG data).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => sharp(Buffer.from(tile(s, { pad: 0.04, radius: 0.24 }))).png().toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0);
  e.writeUInt8(s, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(images[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});
writeFileSync('src/app/favicon.ico', Buffer.concat([header, ...dir, ...images]));
console.log('icons written');
