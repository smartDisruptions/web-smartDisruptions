import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * The faces every Satori share card is set in: Dela Gothic One for the one
 * line that shouts, Inter for everything small. The site's own UI face is
 * system-ui, which a card cannot ask for — a card has no platform — so Inter
 * stands in for it here and in scripts/make-hero.mjs, which renders the same
 * faces from the woff2 copies in scripts/fonts/.
 *
 * TTF, because Satori cannot read woff2. Every face is registered: with only
 * one loaded, Satori falls back to it for every element (the Notebook card
 * once came out entirely in handwriting that way).
 *
 * All four are Latin subsets (Dela Gothic One is 2.5 MB with its Japanese; the
 * site draws its kanji as SVG paths instead). Made with fontTools:
 *   pyftsubset <font> --unicodes=<Google's latin range + arrows, ≈, ≤ ≥>
 *     --layout-features=liga,calt,ccmp,locl,tnum,pnum,lnum,case
 *     --drop-tables+=GPOS --name-IDs='*' --no-hinting
 * Inter is the google/fonts variable font, instanced at opsz 14 and wght
 * 500/700/800 first (fontTools.varLib.instancer) — Satori reads static fonts
 * only. Both are SIL OFL 1.1; the licence stays in each file's name table.
 *
 * These TTFs carry NO kerning, on purpose. Satori's font engine misreads both
 * faces' class kerning and opens a double space at random word gaps ("DATA
 * CENTER" set as "DATA  CENTER", "customers  at"). Unkerned is invisible at
 * card size; a hole in a headline is not. The woff2 copies Chrome renders from
 * keep their kerning — Chrome reads it correctly.
 */
const read = (file: string) =>
  readFileSync(path.join(process.cwd(), 'src/fonts', file));

export const CARD_FONTS = [
  {
    name: 'Dela Gothic One',
    data: read('dela-gothic-one-400.ttf'),
    weight: 400 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: read('inter-500.ttf'),
    weight: 500 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: read('inter-700.ttf'),
    weight: 700 as const,
    style: 'normal' as const,
  },
  {
    name: 'Inter',
    data: read('inter-800.ttf'),
    weight: 800 as const,
    style: 'normal' as const,
  },
];

export const DISPLAY = 'Dela Gothic One';
export const SANS = 'Inter';

/**
 * `font-size-adjust: 0.5`, by hand. The site sets Dela Gothic One with it
 * (DESIGN.md: the weight shouts, so the size doesn't have to) and so does
 * make-hero.mjs, but Satori ignores the property — without this, every
 * display size on a Satori card would land 8% larger than the same number on
 * the site. Dela's x-height is 540/1000.
 */
export const display = (px: number) => Math.round((px * 0.5) / 0.54);

/** Shadow Dojo at night — the dark side of the `--sd-*` tokens in globals.css. */
export const NIGHT = {
  bg: '#090b16',
  bg2: '#0e1122',
  surface: '#11152a',
  text: '#eceefa',
  muted: '#a6abc8',
  accent: '#9bb0ff',
  pen: '#ff5b3d',
  penInk: '#ff8166',
  gold: '#ffcf70',
  moon: '#fff3d6',
  rule: 'rgba(236, 238, 250, 0.12)',
  kiruLine: '#3d4c95',
  bull: '#4ade80',
  bear: '#f87171',
  warn: '#f2b483',
};
