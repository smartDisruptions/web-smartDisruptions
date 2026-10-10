import StaticSvg from '@/components/brand/StaticSvg';
import { glyphId } from '@/components/about/work/glyphs';

/**
 * The back room's sign: 遊戯場 (yūgijō, "a place to play"), a vertical neon
 * sign of the kind that hangs outside every game hall in Japan, bent in red
 * tube. Decorative — the section's kicker and heading say "The arcade" and
 * "Games I built" in English — so it is aria-hidden.
 *
 * The glyphs are the site's baked brush paths (components/brand/glyphs.ts),
 * never a font, drawn from /about's glyph sprite (../glyphs.tsx, whose paths
 * keep their stroke width in screen pixels for this sign), and each is
 * traced as an outline rather than filled: neon is a line you bend. The
 * outline is placed once and stroked four times by <use>, wide and faint to
 * narrow and bright — a halo, a glow, the tube and its hot white core. That is how the sign glows without a blur filter: a
 * blur is repainted whenever anything near it changes, four static strokes
 * are painted once. The strokes keep their width in screen pixels
 * (non-scaling-stroke, on the sprite's paths), so the tube reads the same on
 * a phone and a desktop.
 *
 * One string of static markup (StaticSvg), so React never sees the paths.
 */

const CHARS = ['遊', '戯', '場'] as const;
/** One glyph (1000 units) plus the gap between two characters. */
const STEP = 1120;
const PAD = 60;

export default function NeonSign({ className }: { className?: string }) {
  const height = STEP * (CHARS.length - 1) + 1000;
  return (
    <StaticSvg
      viewBox={`${-PAD} ${-PAD} ${1000 + PAD * 2} ${height + PAD * 2}`}
      className={className}
      aria-hidden
      focusable="false"
    >
      <defs>
        <g id="wk-gm-sign-glyphs">
          {CHARS.map((ch, i) => (
            <use
              key={ch}
              href={`#${glyphId(ch)}`}
              transform={i ? `translate(0 ${i * STEP})` : undefined}
            />
          ))}
        </g>
      </defs>
      <use href="#wk-gm-sign-glyphs" className="wk-gm-tube-halo" />
      <use href="#wk-gm-sign-glyphs" className="wk-gm-tube-glow" />
      <use href="#wk-gm-sign-glyphs" className="wk-gm-tube" />
      <use href="#wk-gm-sign-glyphs" className="wk-gm-tube-core" />
    </StaticSvg>
  );
}
