import type { CSSProperties } from 'react';
import Kiru from '@/components/kiru/Kiru';
import { GLYPHS } from '@/components/brand/glyphs';
import StaticSvg from '@/components/brand/StaticSvg';
import { DOOR, FRAME, KIRU, NOREN, REST, panelLeft, pctX, pctY } from './noren';
import NorenFX from './NorenFX';
import './noren.css';

/**
 * The noren: the split curtain that marks a dojo's door, in ai-iro indigo
 * with 場 ("place") dyed across its four panels, and Kiru behind it, holding
 * the middle two apart by their hem to peek out. The rest of him shows under
 * the hem.
 *
 * All of it is server-rendered: the cloth is eight plain boxes (each panel
 * hangs in two pieces, cut a little below the middle so the lower part can
 * lag and fold), the character is one baked path drawn once and shown
 * through each piece by <use>, so a slice of it rides on every piece.
 * NorenFX moves the pieces with springs, on transforms only. Without it (no
 * JS, reduced motion) this is the still picture: Kiru peeking through the
 * gap.
 *
 * `mini` is the same doorway as a small, still illustration (About Me's
 * closing card); it parts on hover in CSS.
 */

// 場 inked across the cloth: its ink box is x 35–960, y 50–961 of the em.
const GLYPH = GLYPHS.brush['場'].d;
const KANJI_EM = 300;
const kanjiAt = (() => {
  const s = KANJI_EM / 1000;
  const x = NOREN.w / 2 - 497.5 * s;
  const y = 34 - 50 * s;
  return `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s})`;
})();

const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: pctX(x),
  top: pctY(y),
  width: pctX(w),
  height: pctY(h),
});

const LOWER = NOREN.h - NOREN.seam;

export default function Noren({
  id = 'au-ba',
  mini = false,
  label = 'Part the noren. Kiru is hiding behind it.',
}: {
  /** The glyph's element id. Unique per page if two doorways ever share one. */
  id?: string;
  mini?: boolean;
  label?: string;
}) {
  // A piece of cloth at rest. The live doorway's rest is a plain transform,
  // because NorenFX rewrites it every frame, and an inline style that also
  // holds custom properties (which inherit) makes every rewrite restyle the
  // piece's children too. The mini's rest stays a variable, for its hover.
  const pose = (h: number, prop: '--s' | '--b', deg: number): CSSProperties =>
    mini
      ? ({
          height: `${(h * 100).toFixed(3)}%`,
          [prop]: `${deg.toFixed(2)}deg`,
        } as CSSProperties)
      : {
          height: `${(h * 100).toFixed(3)}%`,
          transform: `skewX(${deg.toFixed(2)}deg)`,
        };
  const kiruBox = box(KIRU.x, KIRU.y, KIRU.w, KIRU.peekH);
  const bodyBox = box(KIRU.x, KIRU.y, KIRU.w, KIRU.bodyH);

  return (
    <div
      className={`au-door ${mini ? 'au-door-mini' : ''}`}
      data-kiru="peek"
      data-mood="0"
      style={{ aspectRatio: `${DOOR.w} / ${DOOR.h}` }}
    >
      {/* The character, drawn once; every piece of cloth shows its slice. */}
      <svg className="au-defs" aria-hidden focusable="false">
        <defs>
          <path id={id} d={GLYPH} transform={kanjiAt} />
        </defs>
      </svg>

      <div className="au-scene" aria-hidden>
        {/* The doorway's shadow on the ground, under everything. */}
        <div
          className="au-step"
          style={box(10, FRAME.sill + 8, DOOR.w - 20, 26)}
        />
        {/* Inside the dojo: the back wall, the light, the floorboards. */}
        <div
          className="au-in"
          style={box(
            FRAME.post,
            FRAME.lintel,
            NOREN.w,
            FRAME.sill - FRAME.lintel
          )}
        />

        {/* Kiru, standing behind the cloth: his own legs and torso (the
            shared parts every ninja uses), arms up to the hem, and over them
            the peek pose, his face and the fists that hold the cloth. */}
        <StaticSvg
          className="kiru au-kbody"
          style={bodyBox}
          viewBox="0 0 240 240"
        >
          <use href="#k-legs" />
          <use href="#k-torso" />
          <path d="M74 156 Q66 159 62 164" className="ka-o" />
          <path d="M74 156 Q66 159 62 164" className="ka-l" />
          <path d="M126 156 Q134 159 138 164" className="ka-o" />
          <path d="M126 156 Q134 159 138 164" className="ka-s" />
        </StaticSvg>
        <div className="au-kiru" style={kiruBox}>
          <Kiru pose="peek" className="au-k au-k-0" />
          {!mini && <Kiru pose="peek" mood="wink" className="au-k au-k-1" />}
        </div>

        {/* The doorway: lintel, posts and sill. */}
        <div className="au-lintel" style={box(0, 0, DOOR.w, FRAME.lintel)} />
        <div
          className="au-post"
          style={box(
            0,
            FRAME.lintel,
            FRAME.post,
            FRAME.sill + 18 - FRAME.lintel
          )}
        />
        <div
          className="au-post au-post-r"
          style={box(
            DOOR.w - FRAME.post,
            FRAME.lintel,
            FRAME.post,
            FRAME.sill + 18 - FRAME.lintel
          )}
        />
        <div
          className="au-sill"
          style={box(FRAME.post - 6, FRAME.sill, NOREN.w + 12, 18)}
        />

        {/* The rod, through every panel's sleeve; its ends rest on the posts. */}
        <div className="au-rod" style={box(8, NOREN.y + 7, DOOR.w - 16, 10)} />

        <div
          className="au-noren"
          style={box(NOREN.x, NOREN.y, NOREN.w, NOREN.h)}
        >
          {REST.peek.map(([s, b], i) => {
            const left = panelLeft(i);
            return (
              <div
                key={i}
                className="au-pn"
                data-i={i}
                style={{
                  left: `${((left / NOREN.w) * 100).toFixed(3)}%`,
                  width: `${((NOREN.pw / NOREN.w) * 100).toFixed(3)}%`,
                }}
              >
                <div
                  className="au-u"
                  style={pose(NOREN.seam / NOREN.h, '--s', s)}
                >
                  <div className="au-cloth au-cloth-u">
                    <svg
                      viewBox={`${left} 0 ${NOREN.pw} ${NOREN.seam}`}
                      preserveAspectRatio="none"
                      focusable="false"
                    >
                      <use href={`#${id}`} className="au-ba-bleed" />
                      <use href={`#${id}`} className="au-ba-ink" />
                    </svg>
                  </div>
                  <div
                    className="au-d"
                    style={pose(LOWER / NOREN.seam, '--b', b)}
                  >
                    <div className="au-cloth au-cloth-d">
                      <svg
                        viewBox={`${left} ${NOREN.seam} ${NOREN.pw} ${LOWER}`}
                        preserveAspectRatio="none"
                        focusable="false"
                      >
                        <use href={`#${id}`} className="au-ba-bleed" />
                        <use href={`#${id}`} className="au-ba-ink" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!mini && (
        <>
          {/* The whole doorway is one button: tap it (or press Enter) and the
              curtain parts and Kiru ducks; swipe across it and the cloth
              sways. Decorative to a screen reader beyond its name. */}
          <button type="button" className="au-hit" aria-label={label} />
          <NorenFX />
        </>
      )}
    </div>
  );
}
