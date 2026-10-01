import { openSync, readSync, closeSync } from 'node:fs';
import path from 'node:path';

/**
 * Server-only facts about a post that the frontmatter doesn't carry, worked
 * out from the files themselves at build time: how long the body takes to
 * read, and how big the hero image really is.
 *
 * Both are measured, never guessed. A reading time is a claim made to the
 * reader, so it comes from the words on the page; an image size is a promise
 * made to the layout, so it comes from the image's own header.
 */

/** Words a minute for screen reading of plain prose. */
const WPM = 230;

/**
 * Minutes to read a markdown body, rounded up. Counts the words a reader sees:
 * link targets, image paths, embed markers, table rules and markdown
 * punctuation are stripped first, so syntax never inflates the number.
 */
export function readingMinutes(markdown: string): number {
  const text = markdown
    .replace(/^\[\[embed:[a-z-]+\]\]$/gm, ' ') // interactive slots
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' ') // images: not read as prose
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links: keep the words
    .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, ' ') // table separator rows
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, ' ') // list markers
    .replace(/[#>*_`|~]+/g, ' ');
  // A word starts with a letter or digit; hyphenated words count once.
  const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,%$-]*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(words / WPM));
}

export type Size = { width: number; height: number };

const sizes = new Map<string, Size | null>();

/**
 * The pixel size of an image under /public, read from its header (WebP, PNG
 * or JPEG). Returns undefined for anything it can't read, so a caller falls
 * back to the house 1200×630 instead of failing a build.
 */
export function imageSize(src: string | undefined): Size | undefined {
  if (!src || !src.startsWith('/')) return undefined;
  if (sizes.has(src)) return sizes.get(src) ?? undefined;
  let found: Size | null = null;
  try {
    const file = path.join(process.cwd(), 'public', src);
    const fd = openSync(file, 'r');
    const buf = Buffer.alloc(64 * 1024);
    const n = readSync(fd, buf, 0, buf.length, 0);
    closeSync(fd);
    found = parse(buf.subarray(0, n));
  } catch {
    found = null;
  }
  sizes.set(src, found);
  return found ?? undefined;
}

function parse(b: Buffer): Size | null {
  // PNG: IHDR is always the first chunk.
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }
  // WebP: lossy (VP8), lossless (VP8L) or extended (VP8X).
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8 ') {
      return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    }
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (kind === 'VP8X') {
      return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    }
    return null;
  }
  // JPEG: walk the markers to the first start-of-frame.
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) return null;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSOF) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  return null;
}
