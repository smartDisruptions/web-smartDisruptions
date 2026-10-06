import Pip from '@/components/pip/Pip';
import { Bulbs, Plate, Screen, nameId, type MachineProps } from './parts';
import { range, region, scallops } from './geo';

/**
 * WHACK-A-DUST-BUNNY — a whack-a-mole cabinet under the game's red and cream
 * striped awning (dust bunnies sit on top, like an audience), its deck cut
 * with holes, and a broom-mallet hanging off the corner on a chain.
 *
 * Attract: dust bunnies pop up in turn (a golden one now and then), and
 * every lap Pip pops up instead, with a tiny "Not me!". The loop is phased so
 * its first frame — the still you see before the room is live, and under
 * reduced motion — is a bunny up and Pip up, protesting.
 *
 * Awning coordinates: viewBox 0 0 300 96. Deck: viewBox 0 0 300 100, holes
 * on y = 30 at x = 72, 150, 228, each 31 × 10.5.
 */

const SCALLOPS = scallops(4, 296, 58, 8, 28);
const SCALLOP_BULBS = range(8).map((i) => [4 + 18.25 + i * 36.5, 82] as const);
const HOLES = [72, 150, 228];
const STRIPES = range(10).map((i) => 2 + i * 29.6);
const RIMS = region(38, 26, 224, 18, 300, 100);
const BULBS = region(14, 74, 272, 16, 300, 96);

export default function Whack({ game, no }: MachineProps) {
  return (
    <article className="gm-cab gm-whack" aria-labelledby={nameId(game)}>
      <div className="gm-top">
        <svg className="gm-art" viewBox="0 0 300 96" aria-hidden="true" focusable="false">
          {/* the audience on the awning */}
          <use href="#gm-s-bunny" x="22" y="1" width="31" height="33" />
          <use href="#gm-s-bunny-gold" x="242" y="3" width="28" height="30" />
          <use href="#gm-s-bunny" x="264" y="6" width="25" height="27" />
          {/* the valance */}
          <path d="M4 30h292v28H4Z" fill="url(#gm-g-red)" />
          <path d="M4 33h292M4 55h292" stroke="#e8b24a" strokeWidth="1.4" />
          {/* the scallops */}
          {SCALLOPS.map((d, i) => (
            <path key={i} d={d} fill={i % 2 ? 'url(#gm-g-cream)' : 'url(#gm-g-red)'} stroke="#5c1a0e" strokeWidth=".8" />
          ))}
          <path d="M4 58h292" stroke="#5c1a0e" strokeWidth="1.2" />
        </svg>
        <Bulbs points={SCALLOP_BULBS} viewBox={BULBS.viewBox} style={BULBS.style} r={2.6} />
        <h3 id={nameId(game)} className="gm-name">
          <span aria-hidden="true">★ </span>
          {game.name}
          <span aria-hidden="true"> ★</span>
        </h3>
      </div>

      <div className="gm-body gm-whack-box">
        <div className="gm-bezel">
          <Screen game={game} />
        </div>
      </div>

      <div className="gm-whack-deck">
        <svg className="gm-art" viewBox="0 0 300 100" aria-hidden="true" focusable="false">
          <path d="M18 4h264l16 56H2Z" fill="url(#gm-g-oak-y)" />
          <g stroke="#24180d" strokeWidth="1" opacity=".55">
            {range(7).map((i) => (
              <path key={i} d={`M${18 + (i + 1) * 33} 4L${2 + (i + 1) * 37} 60`} />
            ))}
          </g>
          <path d="M18 4h264" stroke="#a88a5e" strokeWidth="2" />
          {HOLES.map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="30" rx="34" ry="12.5" fill="#24180d" opacity=".6" />
              <ellipse cx={cx} cy="30" rx="31" ry="10.5" fill="url(#gm-g-hole)" />
              <ellipse cx={cx} cy="30" rx="31" ry="10.5" fill="none" stroke="#8c6a42" strokeWidth="3.2" />
            </g>
          ))}
          {/* the striped front lip */}
          {STRIPES.map((x, i) => (
            <path key={x} d={`M${x} 60h29.6v26H${x}Z`} fill={i % 2 ? 'url(#gm-g-cream)' : 'url(#gm-g-red)'} />
          ))}
          <path d="M2 60h296v3.4H2Z" fill="url(#gm-g-brass)" />
          <path d="M2 86h296v4H2Z" fill="#2a1a0e" />
        </svg>

        {/* The holes. Each critter rides up and down inside a box clipped
            to its hole's front edge; the rims' front arcs are drawn over. */}
        <span className="gm-whack-hole gm-whack-h1" aria-hidden="true">
          <span className="gm-whack-critter gm-a">
            <svg viewBox="0 0 60 64">
              <use href="#gm-s-bunny" width="60" height="64" />
            </svg>
          </span>
        </span>
        <span className="gm-whack-hole gm-whack-h2" aria-hidden="true">
          <span className="gm-whack-critter gm-a">
            <svg viewBox="0 0 60 64">
              <use href="#gm-s-bunny-gold" width="60" height="64" />
            </svg>
          </span>
        </span>
        <span className="gm-whack-hole gm-whack-h3" aria-hidden="true">
          <span className="gm-whack-critter gm-a">
            <svg viewBox="0 0 60 64">
              <use href="#gm-s-bunny" width="60" height="64" />
            </svg>
          </span>
        </span>
        <span className="gm-whack-pipbox" aria-hidden="true">
          <span className="gm-whack-pip gm-a">
            <Pip pose="peek" mood="surprised" still />
          </span>
        </span>
        <svg className="gm-whack-rims" viewBox={RIMS.viewBox} style={RIMS.style} aria-hidden="true" focusable="false">
          {HOLES.map((cx) => (
            <g key={cx} fill="none">
              <path d={`M${cx - 31} 30a31 10.5 0 0 0 62 0`} stroke="#8c6a42" strokeWidth="3.4" />
              <path d={`M${cx - 24} 36.6a31 10.5 0 0 0 30 4`} stroke="#c9a877" strokeWidth="1.1" opacity=".7" />
            </g>
          ))}
        </svg>
        <span className="gm-whack-bubble gm-a" aria-hidden="true">
          Not me!
        </span>

        {/* The broom-mallet on its chain. */}
        <svg className="gm-whack-mallet" viewBox="0 0 34 132" aria-hidden="true" focusable="false">
          <circle cx="17" cy="4" r="3.2" fill="none" stroke="url(#gm-g-brass)" strokeWidth="2" />
          {[11, 18, 25].map((y) => (
            <ellipse key={y} cx="17" cy={y} rx="2.2" ry="3.6" fill="none" stroke="#b9a07a" strokeWidth="1.6" />
          ))}
          <rect x="14.2" y="29" width="5.6" height="66" rx="2.6" fill="url(#gm-g-oak-x)" stroke="#2a1a0e" strokeWidth=".8" />
          <rect x="12.6" y="92" width="8.8" height="7" rx="1.5" fill="url(#gm-g-red)" />
          <path d="M12.4 99h9.2l9.6 28c.6 2-1 3.4-3 3.4H5.8c-2 0-3.6-1.4-3-3.4Z" fill="#d8b25a" stroke="#7a5414" strokeWidth=".9" />
          <path d="M14 101l-6 28M17 101v29M20 101l6 28M15.5 101l-3 29M18.5 101l3 29" stroke="#9c7a2c" strokeWidth=".8" opacity=".8" />
        </svg>
      </div>

      <div className="gm-body gm-whack-cab">
        <Plate game={game} no={no} />
      </div>

      <svg className="gm-base" viewBox="0 0 300 50" aria-hidden="true" focusable="false">
        {range(9).map((i) => (
          <path key={i} d={`M${15 + i * 30} 0h30v36h-30Z`} fill={i % 2 ? 'url(#gm-g-cream)' : 'url(#gm-g-red)'} />
        ))}
        <path d="M15 0h270v3H15Z" fill="url(#gm-g-brass)" />
        <path d="M15 33h270v3H15Z" fill="#000" opacity=".3" />
        <path d="M6 36h288v14H6Z" fill="#160e07" />
        <path d="M6 36h288v1.6H6Z" fill="url(#gm-g-brass)" opacity=".6" />
      </svg>
    </article>
  );
}
