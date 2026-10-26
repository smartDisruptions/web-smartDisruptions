import StaticSvg from '@/components/brand/StaticSvg';
import { GLYPHS } from '@/components/brand/glyphs';
import { wall } from './data';

/**
 * One copy of every brush glyph /about draws, and the pieces that point at
 * it.
 *
 * WHY: a baked glyph is 2–5 KB of path data, and a <Kanji> or <Seal> carries
 * the whole of it every time it is used — once in the HTML and again in the
 * RSC payload (StaticSvg keeps React out of the paths, not out of the
 * payload). The work's page draws about forty of them: each thing's mark on
 * its scene, its seal, its ema and its plaque on the ring, the receipt's 作,
 * the neon sign's 遊戯場. Measured on the production build (October 2026),
 * the page's HTML was 646 KB raw, half of it path data and 67 KB of that
 * exact repeats, all of it shipped twice.
 *
 * So the page renders <GlyphSprite /> once (app/about/page.tsx): a hidden
 * <svg> holding each glyph as a <path id>. <Glyph> and <GlyphSeal> are a
 * <Kanji> and a <Seal> that draw it with <use>, a few dozen bytes each. The
 * sprite's list is every thing's mark (from the wall, which holds all
 * twenty) plus the characters the sections use by name, below; a glyph
 * missing from it would draw nothing, so add a character here when a
 * section starts using it.
 *
 * The paths keep their stroke width in screen pixels (non-scaling-stroke),
 * for a glyph drawn as a stroke (the games' neon sign did, until it left
 * the page); a filled glyph looks exactly the same either way.
 */

/** Characters the sections draw by name, besides each thing's mark. */
const NAMED = [
  '作', // the receipt's seal (threshold) and the seal the wall closes on
  '場', // the threshold's hint
  '創', // the wall's lantern
];

const CHARS = [...new Set([...wall.map((item) => item.mark), ...NAMED])];

/** The id a glyph's path has in the sprite: by code point, so it is ASCII. */
export const glyphId = (char: string) =>
  `wk-g-${(char.codePointAt(0) ?? 0).toString(16)}`;

/** The page's one copy of each glyph. Render once, anywhere on the page. */
export function GlyphSprite() {
  return (
    <StaticSvg
      width="0"
      height="0"
      aria-hidden
      focusable="false"
      style={{ position: 'absolute', overflow: 'hidden' }}
    >
      <defs>
        {CHARS.map((char) => {
          const glyph = GLYPHS.brush[char];
          if (!glyph) {
            throw new Error(
              `GlyphSprite: "${char}" is not baked — add it to scripts/build-glyphs.mjs and re-run it.`
            );
          }
          return (
            <path
              key={char}
              id={glyphId(char)}
              d={glyph.d}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </defs>
    </StaticSvg>
  );
}

/** A <Kanji> drawn from the sprite: colour is currentColor, size is the box. */
export function Glyph({
  char,
  className,
}: {
  char: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      className={className}
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <use href={`#${glyphId(char)}`} />
    </svg>
  );
}

/** A <Seal> drawn from the sprite: the vermilion hanko, the glyph in white. */
export function GlyphSeal({
  char,
  className,
}: {
  char: string;
  className?: string;
}) {
  return (
    <span className={`sd-seal ${className ?? ''}`} aria-hidden>
      <Glyph char={char} />
    </span>
  );
}
