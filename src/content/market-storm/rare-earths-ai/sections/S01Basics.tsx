import { CHAPTERS, HERO, S01 } from '../content';
import { Chapter, Findings, Rich, Verdict, Why } from '../ui';
import './b.css';

/*
 * 01 · Rare earths in 60 seconds.
 *
 * The chain as a scene: ore → seventeen separated elements → metal →
 * magnet, laid along one flow of material that is wide at the mine, pinches
 * through the middle two steps (the bottleneck) and opens out at the magnet.
 * The scroll draws it, stage by stage, with `animation-timeline: view()`:
 * each station brings its own slice of the flow, then its object forms, with
 * transform and opacity only, so the compositor runs all of it. Without
 * scroll timelines, or under reduced motion, the finished picture is simply
 * there. The words on the scene are cut from the chapter's own finding (the
 * chain sentence), never retyped; the scene is decoration, because that
 * finding is on the page in full a few lines further down.
 *
 * The art is exported: chapter 04 hangs China's share on the same stations.
 */

/* ── The seventeen ───────────────────────────────────────────────────────── */

/** The 17 rare earths by atomic number: scandium, yttrium and the fifteen lanthanides. */
const RARE_EARTH_Z = [21, 39, ...Array.from({ length: 15 }, (_, i) => 57 + i)];
const LIGHT_Z = new Set<number>(HERO.elements.filter((e) => !e.heavy).map((e) => e.z));
const HEAVY_Z = new Set<number>(HERO.elements.filter((e) => e.heavy).map((e) => e.z));
export type BandKind = 'light' | 'heavy' | 'rest';
/** One entry per element: Nd/Pr are "light", Dy/Tb/Y "heavy" (the hero's own split). */
export const BANDS: BandKind[] = RARE_EARTH_Z.map((z) =>
  LIGHT_Z.has(z) ? 'light' : HEAVY_Z.has(z) ? 'heavy' : 'rest'
);

/* ── The chain sentence, cut at its arrows ───────────────────────────────── */

function chainOf(sentence: string) {
  const parts = sentence.split(' → ');
  const first = parts[0];
  const last = parts[parts.length - 1];
  const cut = last.indexOf('. ');
  if (parts.length !== 4 || first.indexOf(': ') < 0 || cut < 0) return null;
  return {
    steps: [first.slice(first.indexOf(': ') + 2), parts[1], parts[2], last.slice(0, cut)],
    note: last.slice(cut + 2),
  };
}
const CHAIN = chainOf(S01.findings[2]);

/* ── Station art (200 × 200, the flow runs through y = 100) ──────────────── */

type ArtProps = { className?: string };

const SPECKS: [number, number, number, BandKind | 'nd'][] = [
  [86, 118, 4.4, 'light'],
  [106, 104, 3.6, 'heavy'],
  [126, 130, 3.8, 'light'],
  [70, 134, 3, 'rest'],
  [144, 102, 3.4, 'nd'],
  [98, 140, 3, 'heavy'],
  [114, 74, 2.8, 'rest'],
  [80, 98, 2.8, 'nd'],
];

export function OreArt({ className = '' }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" className={`re-b-svg ${className}`} aria-hidden="true" focusable="false">
      <ellipse className="re-b-shade" cx="104" cy="156" rx="64" ry="7" />
      <g className="re-b-ore">
        <path className="re-b-rock" d="M42 122 54 82 88 56 132 58 162 86 168 124 142 152 78 154Z" />
        <path className="re-b-rock-top" d="M54 82 88 56 132 58 116 88 72 94Z" />
        <path className="re-b-rock-side" d="M132 58 162 86 168 124 142 152 126 114 116 88Z" />
        <path className="re-b-rock-line" d="M72 94 116 88 126 114M116 88 132 58M72 94 54 82M72 94 84 130M126 114 142 152" />
        {SPECKS.map(([x, y, r, k]) => (
          <circle key={`${x}-${y}`} className={`re-b-speck re-b-k-${k}`} cx={x} cy={y} r={r} />
        ))}
      </g>
    </svg>
  );
}

export function BandsArt({ className = '' }: ArtProps) {
  // One path per ink (light, heavy, the rest, the rest a shade paler): the
  // seventeen lines are 17 strokes but only four elements.
  const pitch = 4.3;
  const top = 100 - (pitch * (BANDS.length - 1)) / 2;
  const ink = { light: '', heavy: '', rest: '', alt: '' };
  BANDS.forEach((k, i) => {
    const y = +(top + i * pitch).toFixed(2);
    const key = k === 'rest' && i % 2 ? 'alt' : k;
    ink[key] += `M${40 + ((i * 7) % 13)} ${y}H${160 - ((i * 5) % 11)}`;
  });
  return (
    <svg viewBox="0 0 200 200" className={`re-b-svg ${className}`} aria-hidden="true" focusable="false">
      <g className="re-b-bands">
        <path className="re-b-band-line re-b-k-rest" d={ink.rest} />
        <path className="re-b-band-line re-b-k-rest is-alt" d={ink.alt} />
        <path className="re-b-band-line re-b-k-heavy" d={ink.heavy} />
        <path className="re-b-band-line re-b-k-light" d={ink.light} />
      </g>
    </svg>
  );
}

export function IngotArt({ className = '' }: ArtProps) {
  return (
    <svg viewBox="0 0 200 200" className={`re-b-svg ${className}`} aria-hidden="true" focusable="false">
      <ellipse className="re-b-shade" cx="100" cy="128" rx="66" ry="5" />
      <g className="re-b-ingot">
        <path className="re-b-ing-front" d="M38 124 162 124 147 97 53 97Z" />
        <path className="re-b-ing-top" d="M53 97 147 97 133 78 67 78Z" />
        <path className="re-b-ing-line" d="M53 97 147 97M67 78 53 97M133 78 147 97" />
        <path className="re-b-ing-glint" d="M78 88H116" />
      </g>
    </svg>
  );
}

const FLUX = [
  'M64 96C20 84 26 24 100 24 174 24 180 84 136 96',
  'M64 91C36 80 46 46 100 46 154 46 164 80 136 91',
  'M64 86C50 78 64 66 100 66 136 66 150 78 136 86',
  'M64 104C20 116 26 176 100 176 174 176 180 116 136 104',
  'M64 109C36 120 46 154 100 154 154 154 164 120 136 109',
  'M64 114C50 122 64 134 100 134 136 134 150 122 136 114',
  'M58 100H12',
  'M142 100H188',
];

/**
 * Two layers (the field, then the block) so each can move on its own. Each
 * <svg> sits in a span, and it is the span that moves: an animated <svg>
 * re-lays out its whole drawing every frame of the animation (measured: a
 * third of chapter 01's scrolling cost); a moving box around it doesn't.
 */
export function MagnetArt({ className = '' }: ArtProps) {
  return (
    <span className={`re-b-magnet ${className}`} aria-hidden="true">
      <span className="re-b-flux">
        <svg viewBox="0 0 200 200" className="re-b-svg" focusable="false">
          <path className="re-b-fl" d={FLUX.join('')} />
        </svg>
      </span>
      <span className="re-b-mag">
      <svg viewBox="0 0 200 200" className="re-b-svg" focusable="false">
        <path className="re-b-mag-n" d="M100 82H70a6 6 0 0 0-6 6v24a6 6 0 0 0 6 6h30Z" />
        <path className="re-b-mag-s" d="M100 82h30a6 6 0 0 1 6 6v24a6 6 0 0 1-6 6h-30Z" />
        <rect className="re-b-mag-line" x="64" y="82" width="72" height="36" rx="6" />
        <text className="re-b-mag-t" x="82" y="105.5">
          N
        </text>
        <text className="re-b-mag-t" x="118" y="105.5">
          S
        </text>
      </svg>
      </span>
    </span>
  );
}

/* ── The flow they sit on ────────────────────────────────────────────────── */

// Wide at the mine, pinched through separating and metal-making, open again
// at the magnet. Across a wide screen and down a phone it is the same outline
// with x and y swapped.
const FLOW =
  'M44 28L210 28C255 28 255 64 300 64L700 64C745 64 745 40 790 40L956 40C980 40 980 160 956 160L790 160C745 160 745 136 700 136L300 136C255 136 255 172 210 172L44 172C20 172 20 28 44 28Z';
const FLOW_DOWN = FLOW.replace(/(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g, '$2 $1');

// Iron filings lying along the flow: one 46 × 26 tile of short strokes, each
// a few degrees off true, repeated.
const FILINGS = [
  [6, 5, 4],
  [24, 10, -9],
  [39, 4, 11],
  [14, 19, -5],
  [33, 21, 7],
].map(([x, y, deg]) => {
  const dx = 3.4 * Math.cos((deg * Math.PI) / 180);
  const dy = 3.4 * Math.sin((deg * Math.PI) / 180);
  return [x - dx, y - dy, x + dx, y + dy].map((v) => +v.toFixed(2));
});

/**
 * One station's slice of the flow: the same outline seen through a window
 * a quarter of it wide (across) or tall (down), so the four slices meet
 * seamlessly and each can arrive with its own station.
 */
function FlowSlice({ i, down }: { i: number; down?: boolean }) {
  const id = `re-b-flow-${down ? 'v' : 'h'}${i}`;
  const d = down ? FLOW_DOWN : FLOW;
  // The span moves, not the <svg> (see MagnetArt).
  return (
    <span className={`re-b-flow ${down ? 'is-v' : 'is-h'}`} aria-hidden="true">
    <svg
      className="re-b-flow-svg"
      viewBox={down ? `0 ${i * 250} 200 250` : `${i * 250} 0 250 200`}
      preserveAspectRatio="none"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={down ? '0' : '1000'}
          y2={down ? '1000' : '0'}
        >
          <stop offset="0" className="re-b-stop-ore" />
          <stop offset="0.3" className="re-b-stop-ore" />
          <stop offset="0.36" className="re-b-stop-mid" />
          <stop offset="0.66" className="re-b-stop-mid" />
          <stop offset="0.8" className="re-b-stop-steel" />
          <stop offset="1" className="re-b-stop-steel" />
        </linearGradient>
        <pattern id={`${id}-f`} width={down ? 26 : 46} height={down ? 46 : 26} patternUnits="userSpaceOnUse">
          {FILINGS.map(([x1, y1, x2, y2], k) =>
            down ? (
              <line key={k} className="re-b-filing" x1={y1} y1={x1} x2={y2} y2={x2} />
            ) : (
              <line key={k} className="re-b-filing" x1={x1} y1={y1} x2={x2} y2={y2} />
            )
          )}
        </pattern>
      </defs>
      <path d={d} fill={`url(#${id})`} />
      <path d={d} fill={`url(#${id}-f)`} />
      <path className="re-b-flow-edge" d={d} vectorEffect="non-scaling-stroke" />
    </svg>
    </span>
  );
}

const ART = [OreArt, BandsArt, IngotArt, MagnetArt];

function ChainScene() {
  if (!CHAIN) return null;
  return (
    <div className="re-b-chain" aria-hidden="true">
      <div className="re-b-steps">
        {CHAIN.steps.map((step, i) => {
          const Art = ART[i];
          return (
            <div key={i} className={`re-b-st is-${i + 1}${i === 1 || i === 2 ? ' is-neck' : ''}`}>
              <FlowSlice i={i} />
              <FlowSlice i={i} down />
              <div className="re-b-st-art">
                <Art className={`re-b-art-${i + 1}`} />
              </div>
              <p className="re-b-cap">
                <span className="re-b-cap-n">{i + 1}</span>
                <span className="font-read re-b-cap-t">
                  <Rich text={step} />
                </span>
              </p>
            </div>
          );
        })}
      </div>
      <div className="re-b-neck">
        <p className="font-read re-b-neck-t">
          <Rich text={CHAIN.note} />
        </p>
      </div>
    </div>
  );
}

/* ── The chapter ─────────────────────────────────────────────────────────── */

export default function S01Basics() {
  return (
    <Chapter chapter={CHAPTERS[0]} glyph="土" className="re-bleed re-b-ch">
      <Verdict text={S01.verdict} />
      <ChainScene />
      <ul className="re-b-tiles" role="list">
        {S01.tiles.map((t, i) => (
          <li key={t.label} className="re-b-tile">
            <span className="re-b-tile-z" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="re-b-tile-k">{t.label}</p>
            <p className="font-display re-b-tile-v">{t.value}</p>
            <p className="re-b-tile-s">
              <Rich text={t.sub} />
            </p>
          </li>
        ))}
      </ul>
      <Findings items={S01.findings} />
      <Why text={S01.why} />
    </Chapter>
  );
}
