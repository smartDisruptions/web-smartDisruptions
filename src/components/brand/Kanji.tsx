import type { CSSProperties } from 'react';
import { GLYPHS, type GlyphFace } from './glyphs';
import StaticSvg from './StaticSvg';

/**
 * One Japanese character as an inline SVG path (see scripts/build-glyphs.mjs
 * for why it isn't a font). Colour is currentColor, size is the box you give
 * it. `draw` inks the outline and then fills it — a brush stroke, in CSS.
 *
 * Decorative by default. Pass `title` when the character carries meaning
 * a reader should hear (it rarely does — the English is on the page).
 */
export default function Kanji({
  char,
  face = 'brush',
  className,
  style,
  title,
  draw = false,
}: {
  char: string;
  face?: GlyphFace;
  className?: string;
  style?: CSSProperties;
  title?: string;
  draw?: boolean;
}) {
  const glyph = GLYPHS[face][char];
  if (!glyph) {
    throw new Error(
      `Kanji: "${char}" is not baked for the ${face} face — add it to scripts/build-glyphs.mjs and re-run it.`,
    );
  }
  return (
    <StaticSvg
      viewBox="0 0 1000 1000"
      className={`${draw ? 'kanji-draw ' : ''}${className ?? ''}`}
      style={style}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={glyph.d} pathLength={draw ? 1 : undefined} />
    </StaticSvg>
  );
}

/** A hanko: the vermilion seal with a white character pressed into it. */
export function Seal({
  char = '忍',
  className,
  title,
}: {
  char?: string;
  className?: string;
  title?: string;
}) {
  return (
    <span className={`sd-seal ${className ?? ''}`} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <Kanji char={char} />
    </span>
  );
}

/**
 * Text set top-to-bottom, one baked glyph per character — for the vertical
 * katakana tags. Each glyph is its own square so the column stays even.
 */
export function Vertical({
  text,
  face = 'gothic',
  className,
  gap = 0.08,
}: {
  text: string;
  face?: GlyphFace;
  className?: string;
  gap?: number;
}) {
  const chars = [...text];
  const step = 1000 * (1 + gap);
  return (
    <StaticSvg
      viewBox={`0 0 1000 ${Math.round(step * chars.length)}`}
      className={className}
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      {chars.map((ch, i) => {
        const g = GLYPHS[face][ch];
        if (!g) throw new Error(`Vertical: "${ch}" is not baked for ${face}`);
        // Long-vowel marks rotate in vertical writing, as they would in print.
        const rotate = ch === 'ー';
        return (
          <path
            key={i}
            d={g.d}
            transform={`translate(0 ${Math.round(i * step)})${rotate ? ' rotate(90 500 500)' : ''}`}
          />
        );
      })}
    </StaticSvg>
  );
}

/**
 * Katana-slash reveal for a line of display type. The words are in the DOM
 * once; the lower half of the cut is a ::before copy drawn from data-text
 * with empty alt text (`content: attr(data-text) / ""`), so crawlers and
 * screen readers get the line exactly once. Each half arrives from its own
 * side and they seal along a diagonal, under a passing blade-light.
 */
export function Slash({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return (
    <span
      className={`sd-slash ${className ?? ''}`}
      data-text={text}
      style={{ '--d': `${delay}s` } as CSSProperties}
    >
      <span className="sd-slash-a">{text}</span>
    </span>
  );
}
