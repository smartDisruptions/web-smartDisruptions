import type { CSSProperties } from 'react';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Slash } from '@/components/brand/Kanji';
import { GLYPHS } from '@/components/brand/glyphs';
import { Button } from '@/components/ui';
import { bamboo, fuji, haze, pagoda, roof, seeded, torii, town } from '@/components/brand/scenery';
import HeroFX from './HeroFX';
import { KIRU_S, KIRU_X, KIRU_Y, RIDGE_Y, ROOF_H, ROOF_W } from './geometry';
import './hero.css';
import StaticSvg from '@/components/brand/StaticSvg';

/**
 * The home hero: a rooftop above a sleeping town, Mt. Fuji behind it, Kiru on
 * the ridge in front of the moon. Day is an ink-wash print under a vermilion
 * sun; night is the same town under a moon, windows and lanterns lit.
 *
 * Every layer is server-rendered SVG — the scene is in the first HTML byte and
 * costs no image requests. And every moving thing moves on the compositor:
 * each animated part is its OWN element (stars, haze, bamboo, lantern, glow,
 * Kiru, each sakura petal), animated by transform or opacity only, so the big
 * static layers (Fuji, the town, the roof) are painted once and never again.
 *   - scroll: layers sink at different speeds (scroll-driven CSS),
 *   - pointer / Android tilt: HeroFX writes --px/--py, layers lean by depth,
 *   - time: haze drifts, bamboo sways, the lantern swings, petals fall (CSS).
 * HeroFX adds what CSS can't: Kiru throwing a shuriken wherever you tap the
 * sky, and — on a desktop, once you move the mouse — petals that scatter
 * away from the pointer.
 *
 * The headline is the LCP. It is plain text in the DOM from the first paint;
 * the katana-slash reveal is a clip-path animation on top of it.
 */

const STARS = (() => {
  const rnd = seeded(42);
  return Array.from({ length: 84 }, () => ({
    x: Math.round(rnd() * 1600),
    y: Math.round(rnd() * 520),
    r: Math.round((0.6 + rnd() * 1.3) * 10) / 10,
    g: Math.floor(rnd() * 3),
  }));
})();

// Ambient sakura: a fixed set of petals, each its own element with its own
// fall, drift and tumble — composited, no script.
const PETALS = (() => {
  const rnd = seeded(77);
  return Array.from({ length: 22 }, (_, i) => ({
    left: Math.round(rnd() * 100),
    delay: -Math.round(rnd() * 140) / 10,
    dur: 9 + Math.round(rnd() * 70) / 10,
    size: 9 + Math.round(rnd() * 8),
    drift: 40 + Math.round(rnd() * 120),
    spin: 1.6 + Math.round(rnd() * 20) / 10,
    tone: i % 3 === 0 ? 1 : 0,
    mobile: i % 2 === 0,
  }));
})();

const FUJI = fuji(800, 520, 700, 330);
const HAZE_A = haze(3, 1600, 2, 26);
const HAZE_B = haze(11, 1600, 2, 20);
const TOWN = town(1600, 300, 19, 110, 110);
const TOWN_MID = `${pagoda(1240, 248, 5, 150, 34)} ${torii(330, 262, 96, 74)}`;
const BAMBOO = bamboo(5, 5, 300, 760);

// The near roof Kiru stands on: a ridge with an onigawara end tile, the
// tiled slope falling away below it to the bottom-left.
const ROOF_BODY = `M60 ${RIDGE_Y + 8} Q40 ${RIDGE_Y - 18} 18 ${RIDGE_Y - 34} Q46 ${RIDGE_Y - 22} 70 ${RIDGE_Y - 8} L${ROOF_W} ${RIDGE_Y - 8} L${ROOF_W} ${ROOF_H} L-60 ${ROOF_H} Z`;
const TILE_LINES = Array.from({ length: 30 }, (_, i) => {
  const x = 96 + i * 32;
  return `M${x} ${RIDGE_Y + 10} L${x - 80} ${ROOF_H}`;
}).join(' ');

const LANTERN_GLYPH = GLYPHS.brush['忍'].d;

// Placement of the separate layers inside the roof box, in % of that box —
// derived from the roof's own coordinates so they stay glued to the ridge.
const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(3)}%`;
const KIRU_BOX: CSSProperties = {
  left: pct(KIRU_X, ROOF_W),
  top: pct(KIRU_Y, ROOF_H),
  width: pct(KIRU_S, ROOF_W),
};
const LANTERN_BOX: CSSProperties = {
  left: pct(150, ROOF_W),
  top: pct(RIDGE_Y, ROOF_H),
  width: pct(76, ROOF_W),
};
const GLOW_BOX: CSSProperties = {
  left: pct(188, ROOF_W),
  top: pct(RIDGE_Y + 78, ROOF_H),
  width: pct(150, ROOF_W),
};

export default function HeroScene() {
  return (
    <section className="hx" data-pose="wave" aria-labelledby="hx-title">
      <div className="hx-sky" aria-hidden />
      <div className="hx-scene" aria-hidden>
        {[0, 1, 2].map((g) => (
          <StaticSvg
            key={g}
            className={`hx-layer hx-stars hx-tw-${g}`}
            viewBox="0 0 1600 520"
            preserveAspectRatio="xMidYMin slice"
          >
            {STARS.filter((s) => s.g === g).map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} />
            ))}
          </StaticSvg>
        ))}

        <div className="hx-layer hx-orb">
          <div className="hx-orb-disc" />
        </div>

        <StaticSvg className="hx-layer hx-birds" viewBox="0 0 200 60">
          <path d="M10 30 q8 -8 16 0 q8 -8 16 0" />
          <path d="M60 18 q6 -6 12 0 q6 -6 12 0" />
        </StaticSvg>

        <StaticSvg className="hx-layer hx-fuji" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax meet">
          <defs>
            <linearGradient id="hx-fuji-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--hx-fuji-top)" />
              <stop offset="1" stopColor="var(--hx-fuji-bot)" />
            </linearGradient>
          </defs>
          <path d={FUJI.body} fill="url(#hx-fuji-g)" />
          <path d={FUJI.snow} fill="var(--hx-snow)" />
        </StaticSvg>

        <div className="hx-layer hx-haze hx-haze-a">
          <StaticSvg viewBox="0 0 1600 140" preserveAspectRatio="none">
            <path d={HAZE_A} />
          </StaticSvg>
        </div>

        <StaticSvg className="hx-layer hx-town" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice">
          <path d={TOWN_MID} fill="var(--hx-town-far)" />
          <path d={TOWN.roofs} className="hx-town-near" />
          <g className="hx-windows">
            {TOWN.windows.map(([x, y], i) => (
              <rect key={i} x={x - 6} y={y} width="12" height="14" rx="2" />
            ))}
          </g>
        </StaticSvg>

        <div className="hx-layer hx-haze hx-haze-b">
          <StaticSvg viewBox="0 0 1600 120" preserveAspectRatio="none">
            <path d={HAZE_B} />
          </StaticSvg>
        </div>

        <StaticSvg className="hx-layer hx-bamboo" viewBox="0 0 300 760" preserveAspectRatio="xMinYMax meet">
          <path d={BAMBOO.stalks} className="hx-bamboo-stalk" />
          <path d={BAMBOO.nodes} className="hx-bamboo-node" />
          <path d={BAMBOO.leaves} className="hx-bamboo-leaf" />
        </StaticSvg>

        <div className="hx-layer hx-roofbox">
          <StaticSvg className="hx-roof" viewBox={`0 0 ${ROOF_W} ${ROOF_H}`} preserveAspectRatio="xMidYMax meet">
            <defs>
              <linearGradient id="hx-roof-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--hx-roof)' }} />
                <stop offset="0.3" style={{ stopColor: 'var(--hx-roof)' }} />
                <stop offset="0.62" style={{ stopColor: 'var(--hx-roof)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path d={ROOF_BODY} className="hx-roof-body" />
            <path d={TILE_LINES} className="hx-roof-tiles" />
            <path d={`M30 ${RIDGE_Y - 6} L${ROOF_W} ${RIDGE_Y - 6}`} className="hx-roof-ridge" />
            <path d={roof(158, RIDGE_Y - 10, 22, 14)} className="hx-roof-cap" />
          </StaticSvg>

          <div className="hx-glow" style={GLOW_BOX} />
          <StaticSvg className="hx-lantern" style={LANTERN_BOX} viewBox={`150 ${RIDGE_Y} 76 134`}>
            <path d={`M188 ${RIDGE_Y + 2} L188 ${RIDGE_Y + 34}`} className="hx-lantern-cord" />
            <rect x="166" y={RIDGE_Y + 34} width="44" height="8" rx="2" className="hx-lantern-cap" />
            <ellipse cx="188" cy={RIDGE_Y + 76} rx="30" ry="36" className="hx-lantern-paper" />
            <path
              d={`M160 ${RIDGE_Y + 64} Q188 ${RIDGE_Y + 60} 216 ${RIDGE_Y + 64} M159 ${RIDGE_Y + 76} Q188 ${RIDGE_Y + 72} 217 ${RIDGE_Y + 76} M160 ${RIDGE_Y + 88} Q188 ${RIDGE_Y + 84} 216 ${RIDGE_Y + 88}`}
              className="hx-lantern-ribs"
            />
            <path d={LANTERN_GLYPH} transform={`translate(176 ${RIDGE_Y + 64}) scale(0.024)`} className="hx-lantern-kanji" />
            <rect x="168" y={RIDGE_Y + 108} width="40" height="8" rx="2" className="hx-lantern-cap" />
            <path d={`M188 ${RIDGE_Y + 116} l0 16`} className="hx-lantern-cord" />
          </StaticSvg>

          {/* Kiru on the ridge. Three poses stacked; HeroFX picks one. */}
          <div className="hx-leap" style={KIRU_BOX}>
            <div className="hx-kiru">
              <Kiru pose="wave" className="hx-k hx-k-wave" />
              <Kiru pose="idle" className="hx-k hx-k-idle" />
              <Kiru pose="throw" className="hx-k hx-k-throw" />
            </div>
          </div>
        </div>

        <div className="hx-sakura">
          {PETALS.map((p, i) => (
            <i
              key={i}
              className={`hx-petal ${p.tone ? 'hx-petal-b' : ''} ${p.mobile ? '' : 'hx-petal-wide'}`}
              style={
                {
                  left: `${p.left}%`,
                  width: p.size,
                  height: p.size,
                  '--dur': `${p.dur}s`,
                  '--delay': `${p.delay}s`,
                  '--drift': `${p.drift}px`,
                  '--spin': `${p.spin}s`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="hx-scene-fade" />
      </div>

      <canvas className="hx-petals" aria-hidden />
      <div className="hx-fade" aria-hidden />

      <div className="hx-content">
        <p className="sd-kicker hx-rise" style={{ animationDelay: '0.05s' }}>
          Building with AI, in public
        </p>
        <h1 id="hx-title" className="font-display hx-title">
          <Slash text="I build real things" delay={0.1} />{' '}
          <Slash text="with AI." delay={0.22} />{' '}
          <Slash text="Then I" delay={0.34} />{' '}
          <span className="hx-title-mark">
            <Slash text="show my work." delay={0.46} />
            <StaticSvg className="hx-title-brush" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
              <path d="M3 13 C 50 3, 90 18, 140 9 S 230 4, 297 11" />
            </StaticSvg>
          </span>
        </h1>
        <p className="hx-sub hx-rise" style={{ animationDelay: '0.55s' }}>
          Honest breakdowns of what I build with AI — the timeline, the method,
          and the parts worth copying.
        </p>
        <div className="hx-actions hx-rise" style={{ animationDelay: '0.7s' }}>
          <Button variant="primary" size="lg" href="/content">
            Read the notes
          </Button>
          <Button variant="secondary" size="lg" href="/built">
            See what I&apos;ve built
          </Button>
        </div>
        <p className="hx-hint hx-rise" style={{ animationDelay: '1.4s' }} aria-hidden>
          <Kanji char="斬" className="h-4 w-4 text-pen" />
          <span className="hx-hint-fine">Click the sky. Kiru never misses.</span>
          <span className="hx-hint-touch">Tap the sky. Kiru never misses.</span>
        </p>
      </div>

      <HeroFX />
    </section>
  );
}
