import Kiru from '@/components/kiru/Kiru';
import Kanji, { Slash } from '@/components/brand/Kanji';
import { GLYPHS } from '@/components/brand/glyphs';
import { Button } from '@/components/ui';
import { bamboo, fuji, haze, pagoda, roof, seeded, torii, town } from '@/components/brand/scenery';
import HeroFX from './HeroFX';
import { KIRU_S, KIRU_X, KIRU_Y, RIDGE_Y, ROOF_H, ROOF_W } from './geometry';
import './hero.css';

/**
 * The home hero: a rooftop above a sleeping town, Mt. Fuji behind it, Kiru on
 * the ridge. Day is an ink-wash print under a vermilion sun; night is the same
 * town under a moon, windows and lanterns lit.
 *
 * Every layer is server-rendered SVG — the scene is in the first HTML byte and
 * costs no image requests. Depth comes from three independent sources, all on
 * the compositor:
 *   - scroll: each layer has its own scroll-driven `translate` (CSS),
 *   - pointer / phone tilt: HeroFX writes --px/--py, layers `transform` by them,
 *   - time: haze drifts, bamboo sways, lanterns swing (CSS keyframes).
 * HeroFX adds the two things CSS can't: sakura petals that scatter away from
 * your finger, and Kiru throwing a shuriken wherever you tap the sky.
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

export default function HeroScene() {
  return (
    <section className="hx" data-pose="wave" aria-labelledby="hx-title">
      <div className="hx-sky" aria-hidden />
      <div className="hx-scene" aria-hidden>

      <svg className="hx-layer hx-stars" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMin slice" aria-hidden>
        {[0, 1, 2].map((g) => (
          <g key={g} className={`hx-tw hx-tw-${g}`}>
            {STARS.filter((s) => s.g === g).map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} />
            ))}
          </g>
        ))}
      </svg>

      <div className="hx-layer hx-orb" data-depth="far" aria-hidden>
        <div className="hx-orb-disc" />
      </div>

      <svg className="hx-layer hx-birds" viewBox="0 0 200 60" aria-hidden>
        <path d="M10 30 q8 -8 16 0 q8 -8 16 0" />
        <path d="M60 18 q6 -6 12 0 q6 -6 12 0" />
      </svg>

      <svg className="hx-layer hx-fuji" data-depth="far" viewBox="0 0 1600 520" preserveAspectRatio="xMidYMax meet" aria-hidden>
        <defs>
          <linearGradient id="hx-fuji-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--hx-fuji-top)" />
            <stop offset="1" stopColor="var(--hx-fuji-bot)" />
          </linearGradient>
        </defs>
        <path d={FUJI.body} fill="url(#hx-fuji-g)" />
        <path d={FUJI.snow} fill="var(--hx-snow)" />
      </svg>

      <svg className="hx-layer hx-haze hx-haze-a" viewBox="0 0 1600 140" preserveAspectRatio="none" aria-hidden>
        <path d={HAZE_A} />
      </svg>

      <svg className="hx-layer hx-town" data-depth="mid" viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <path d={TOWN_MID} fill="var(--hx-town-far)" />
        <path d={TOWN.roofs} fill="var(--hx-town)" />
        <g className="hx-windows">
          {TOWN.windows.map(([x, y], i) => (
            <rect key={i} x={x - 6} y={y} width="12" height="14" rx="2" />
          ))}
        </g>
      </svg>

      <svg className="hx-layer hx-haze hx-haze-b" viewBox="0 0 1600 120" preserveAspectRatio="none" aria-hidden>
        <path d={HAZE_B} />
      </svg>

      <svg className="hx-layer hx-bamboo" data-depth="near" viewBox="0 0 300 760" preserveAspectRatio="xMinYMax meet" aria-hidden>
        <g className="hx-sway">
          <path d={BAMBOO.stalks} className="hx-bamboo-stalk" />
          <path d={BAMBOO.nodes} className="hx-bamboo-node" />
          <path d={BAMBOO.leaves} className="hx-bamboo-leaf" />
        </g>
      </svg>

      <svg className="hx-layer hx-roof" data-depth="near" viewBox={`0 0 ${ROOF_W} ${ROOF_H}`} preserveAspectRatio="xMidYMax meet" aria-hidden>
        <defs>
          <linearGradient id="hx-roof-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: 'var(--hx-roof)' }} />
            <stop offset="0.3" style={{ stopColor: 'var(--hx-roof)' }} />
            <stop offset="0.62" style={{ stopColor: 'var(--hx-roof)', stopOpacity: 0 }} />
          </linearGradient>
          <radialGradient id="hx-glow">
            <stop offset="0" stopColor="#ffd27a" stopOpacity="0.75" />
            <stop offset="0.45" stopColor="#ff9a4a" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ff7a3a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={ROOF_BODY} className="hx-roof-body" />
        <path d={TILE_LINES} className="hx-roof-tiles" />
        <path d={`M30 ${RIDGE_Y - 6} L${ROOF_W} ${RIDGE_Y - 6}`} className="hx-roof-ridge" />
        <path d={roof(158, RIDGE_Y - 10, 22, 14)} className="hx-roof-cap" />
        {/* the lantern hangs from the eave */}
        <g className="hx-lantern">
          <path d={`M188 ${RIDGE_Y + 2} L188 ${RIDGE_Y + 34}`} className="hx-lantern-cord" />
          <circle cx="188" cy={RIDGE_Y + 78} r="62" className="hx-lantern-glow" />
          <rect x="166" y={RIDGE_Y + 34} width="44" height="8" rx="2" className="hx-lantern-cap" />
          <ellipse cx="188" cy={RIDGE_Y + 76} rx="30" ry="36" className="hx-lantern-paper" />
          <path
            d={`M160 ${RIDGE_Y + 64} Q188 ${RIDGE_Y + 60} 216 ${RIDGE_Y + 64} M159 ${RIDGE_Y + 76} Q188 ${RIDGE_Y + 72} 217 ${RIDGE_Y + 76} M160 ${RIDGE_Y + 88} Q188 ${RIDGE_Y + 84} 216 ${RIDGE_Y + 88}`}
            className="hx-lantern-ribs"
          />
          <path d={LANTERN_GLYPH} transform={`translate(176 ${RIDGE_Y + 64}) scale(0.024)`} className="hx-lantern-kanji" />
          <rect x="168" y={RIDGE_Y + 108} width="40" height="8" rx="2" className="hx-lantern-cap" />
          <path d={`M188 ${RIDGE_Y + 116} l0 16`} className="hx-lantern-cord" />
        </g>
        {/* Kiru on the ridge. Three poses stacked; HeroFX picks one. */}
        <g className="hx-leap">
        <g className="hx-kiru">
          <Kiru pose="wave" x={KIRU_X} y={KIRU_Y} width={KIRU_S} height={KIRU_S} className="hx-k hx-k-wave" />
          <Kiru pose="idle" x={KIRU_X} y={KIRU_Y} width={KIRU_S} height={KIRU_S} className="hx-k hx-k-idle" />
          <Kiru pose="throw" x={KIRU_X} y={KIRU_Y} width={Math.round((KIRU_S * 280) / 240)} height={KIRU_S} className="hx-k hx-k-throw" />
        </g>
        </g>
      </svg>

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
            <svg className="hx-title-brush" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
              <path d="M3 13 C 50 3, 90 18, 140 9 S 230 4, 297 11" />
            </svg>
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
