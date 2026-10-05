import { Bulbs, Plate, Screen, nameId, type MachineProps } from './parts';
import { alongQuad, region, scallops } from './geo';

/**
 * RING TOSS — a striped booth: candy-striped posts with gold finials, an
 * arched sign in bulbs, a scalloped valance, a curtain wall with the screen
 * hung on it, and a stepped rack of glass bottles (one golden, worth ten in
 * the game) with spare rings hung on a peg.
 *
 * Attract: a ring tumbles down out of the air and drops over the golden
 * bottle's neck, wobbles, settles. Sign coordinates: viewBox 0 0 300 112.
 * Rack coordinates: viewBox 0 0 256 118, golden bottle on x = 128.
 */

const ARCH = 'M20 44Q150-20 280 44V86H20Z';
const ARCH_IN = 'M28 47Q150-8 272 47V80H28Z';
const ARCH_BULBS = alongQuad(32, 46, 150, -6, 268, 46, 13);
const BULBS = region(20, 6, 260, 48, 300, 112);
const VALANCE = scallops(20, 280, 86, 7, 21);

// The rack: three tiers of bottles, smaller toward the back.
const TIERS: Array<{ y: number; s: number; xs: number[]; colors: string[] }> = [
  { y: 40.5, s: 0.72, xs: [38, 74, 110, 146, 182, 218], colors: ['#8a63c9'] },
  { y: 72.5, s: 0.84, xs: [48, 88, 168, 208], colors: ['#4c7fc0'] },
  { y: 104.5, s: 0.96, xs: [40, 84, 128, 172, 216], colors: ['#5d9a52', '#c58a2e'] },
];
const GOLD = region(116, 30, 24, 46, 256, 118);
const RING = region(112, 37, 32, 14, 256, 118);

export default function Ring({ game, no }: MachineProps) {
  return (
    <article className="gm-cab gm-ring" aria-labelledby={nameId(game)}>
      <div className="gm-top">
        <svg className="gm-art" viewBox="0 0 300 112" aria-hidden="true" focusable="false">
          {/* the finials on the posts */}
          {[12, 288].map((x) => (
            <g key={x}>
              <path d={`M${x - 5} 24h10l-2 6h-6Z`} fill="url(#gm-g-brass)" />
              <circle cx={x} cy="15" r="8" fill="url(#gm-g-brass)" stroke="#6e4a10" strokeWidth=".8" />
              <circle cx={x - 2.6} cy="12" r="2.2" fill="#fff6d0" opacity=".7" />
            </g>
          ))}
          {/* the arched sign */}
          <path d={ARCH} fill="url(#gm-g-board)" stroke="url(#gm-g-brass)" strokeWidth="4.5" />
          <path d={ARCH_IN} fill="none" stroke="#b07e24" strokeWidth="1.2" opacity=".7" />
          {/* the valance */}
          {VALANCE.map((d, i) => (
            <path key={i} d={d} fill={i % 2 ? 'url(#gm-g-cream)' : 'url(#gm-g-red)'} stroke="#5c1a0e" strokeWidth=".8" />
          ))}
          <path d="M20 86h260" stroke="url(#gm-g-brass)" strokeWidth="2.4" />
        </svg>
        <Bulbs points={ARCH_BULBS} viewBox={BULBS.viewBox} style={BULBS.style} r={2.7} />
        <h3 id={nameId(game)} className="gm-name">
          {game.name}
        </h3>
      </div>

      <div className="gm-body gm-ring-wall">
        <div className="gm-bezel">
          <Screen game={game} />
        </div>
      </div>

      <div className="gm-ring-rack">
        <svg className="gm-art" viewBox="0 0 256 118" aria-hidden="true" focusable="false">
          {/* tiers: surface, then riser */}
          <path d="M14 40h228v32H14Z" fill="#3a2716" />
          <path d="M8 72h240v32H8Z" fill="#33220f" />
          <path d="M2 104h252v14H2Z" fill="#2a1c10" />
          <path d="M14 38h228v3.4H14ZM8 70h240v3.4H8ZM2 102h252v3.4H2Z" fill="url(#gm-g-oak-x)" />
          <path d="M14 38h228M8 70h240M2 102h252" stroke="#a88a5e" strokeWidth="1" />
          {TIERS.map((t) =>
            t.xs.map((x, i) => (
              <use
                key={`${t.y}-${x}`}
                href="#gm-s-bottle"
                x={x - 8 * t.s}
                y={t.y - 44 * t.s}
                width={16 * t.s}
                height={44 * t.s}
                style={{ color: t.colors[i % t.colors.length] }}
              />
            ))
          )}
          {/* spare rings on their peg */}
          <path d="M2 7h19" stroke="url(#gm-g-brass)" strokeWidth="3.4" strokeLinecap="round" />
          <ellipse cx="9" cy="20" rx="6" ry="13" fill="none" stroke="#2a6fb0" strokeWidth="3" />
          <ellipse cx="12.5" cy="21" rx="6" ry="13" fill="none" stroke="#e8b24a" strokeWidth="3" />
          <ellipse cx="16" cy="22" rx="6" ry="13" fill="none" stroke="#d4402a" strokeWidth="3" />
        </svg>

        {/* The tossed ring is drawn in two halves around the golden bottle,
            so the bottle's neck passes through it. */}
        <span className="gm-ring-fly gm-ring-back gm-a" style={RING.style} aria-hidden="true">
          <svg viewBox={RING.viewBox}>
            <path d="M116 44a12 4 0 0 1 24 0" fill="none" stroke="#9c2a18" strokeWidth="3" />
          </svg>
        </span>
        <svg className="gm-ring-gold" viewBox={GOLD.viewBox} style={GOLD.style} aria-hidden="true" focusable="false">
          <ellipse cx="128" cy="54" rx="13" ry="20" fill="url(#gm-g-glow)" />
          <use href="#gm-s-bottle" x="121.3" y="35.5" width="13.4" height="37" style={{ color: '#f0c040' }} />
        </svg>
        <span className="gm-ring-fly gm-ring-front gm-a" style={RING.style} aria-hidden="true">
          <svg viewBox={RING.viewBox}>
            <path d="M116 44a12 4 0 0 0 24 0" fill="none" stroke="#e0452c" strokeWidth="3.2" />
            <path d="M119 46a12 4 0 0 0 10 1.8" fill="none" stroke="#ffd2c4" strokeWidth="1.1" />
          </svg>
        </span>
      </div>

      <div className="gm-body gm-ring-counter">
        <Plate game={game} no={no} />
      </div>

      <svg className="gm-base" viewBox="0 0 300 40" aria-hidden="true" focusable="false">
        <path d="M22 0h256v28H22Z" fill="url(#gm-g-oak-y)" />
        <path d="M22 0h256v3H22Z" fill="url(#gm-g-brass)" />
        <path d="M2 28h296v12H2Z" fill="#160e07" />
      </svg>
    </article>
  );
}
