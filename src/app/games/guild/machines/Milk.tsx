import Pip from '@/components/pip/Pip';
import { Plate, Screen, nameId, type MachineProps } from './parts';
import { pennants, range, region } from './geo';

/**
 * MILK BOTTLE KNOCKDOWN — a shelf booth: the game's red ribbon for a sign,
 * three lamps, a red curtain, and three pyramids of milk bottles on an oak
 * shelf hung with bunting. Pip watches from the end of the shelf, as he
 * watches from the counter in the game.
 *
 * Attract: a ball flies in and knocks the top bottle off the middle pyramid;
 * it tumbles away, Pip ducks, and the bottle is back by the next throw.
 * Topper coordinates: viewBox 0 0 300 206, shelf top on y = 168.
 */

const W = 300;
const H = 206;
const PYRAMIDS = [54, 134, 214];
const BOTTLE = { w: 18, h: 27 };
// Every bottle but the one the ball knocks off (the middle pyramid's top).
const BOTTLES = PYRAMIDS.flatMap((cx, p) =>
  [
    [cx - 19, 141],
    [cx, 141],
    [cx + 19, 141],
    [cx - 9.5, 114],
    [cx + 9.5, 114],
    ...(p === 1 ? [] : [[cx, 87]]),
  ].map(([x, y]) => [x - BOTTLE.w / 2, y] as const)
);
const BUNTING = pennants(8, 292, 184, 12, 15);
const TOP = region(125, 87, 18, 27, W, H);
const BALL = region(126, 90, 16, 16, W, H);

export default function Milk({ game, no }: MachineProps) {
  return (
    <article className="gm-cab gm-milk" aria-labelledby={nameId(game)}>
      <div className="gm-top">
        <svg className="gm-art" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          {/* the curtain behind the shelf */}
          <path d="M16 56h268v114H16Z" fill="url(#gm-g-curtain)" />
          <path d="M16 56h268v30H16Z" fill="#1a0805" opacity=".45" />
          {/* three lamps and their light */}
          {PYRAMIDS.map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="92" rx="36" ry="26" fill="url(#gm-g-glow)" />
              <path d={`M${x} 56v12`} stroke="#3a2410" strokeWidth="1.4" />
              <path d={`M${x - 11} 78q11-16 22 0Z`} fill="url(#gm-g-brass)" stroke="#6e4a10" strokeWidth=".8" />
              <circle cx={x} cy="79" r="3.2" fill="#fffbe6" />
            </g>
          ))}
          {/* the pyramids */}
          {BOTTLES.map(([x, y]) => (
            <use key={`${x}-${y}`} href="#gm-s-milk" x={x} y={y} width={BOTTLE.w} height={BOTTLE.h} />
          ))}
          {/* the shelf, and its bunting */}
          <path d="M8 168h284v9H8Z" fill="url(#gm-g-oak-x)" />
          <path d="M8 168.6h284" stroke="#c9a877" strokeWidth="1.2" />
          <path d="M8 177h284v7H8Z" fill="#2a1c10" />
          {BUNTING.map((d, i) => (
            <path key={i} d={d} fill={i % 2 ? 'url(#gm-g-cream)' : 'url(#gm-g-red)'} stroke="#5c1a0e" strokeWidth=".6" />
          ))}
          {/* the ribbon: tails behind, folds, then the face */}
          <path d="M42 20H4l12 22-12 22h38Z" fill="#7e2414" stroke="#4a120a" strokeWidth=".8" />
          <path d="M258 20h38l-12 22 12 22h-38Z" fill="#7e2414" stroke="#4a120a" strokeWidth=".8" />
          <path d="M30 58l12 6V58ZM270 58l-12 6V58Z" fill="#3e0e07" />
          <path d="M30 6h240v52H30Z" fill="url(#gm-g-red)" />
          <path d="M30 9.5h240M30 54.5h240" stroke="#e8b24a" strokeWidth="1.4" />
          {[19, 281].map((x) => (
            <path
              key={x}
              d={`M${x} 34.6l2 4.2 4.6.6-3.3 3.2.8 4.6-4.1-2.2-4.1 2.2.8-4.6-3.3-3.2 4.6-.6Z`}
              fill="#e8b24a"
            />
          ))}
        </svg>

        <h3 id={nameId(game)} className="gm-name">
          {game.name}
        </h3>

        {/* The bottle that gets knocked off, and the ball that does it. */}
        <span className="gm-milk-top gm-a" style={TOP.style} aria-hidden="true">
          <svg viewBox={TOP.viewBox} focusable="false">
            <use href="#gm-s-milk" x="125" y="87" width={BOTTLE.w} height={BOTTLE.h} />
          </svg>
        </span>
        <span className="gm-milk-ball gm-a" style={BALL.style} aria-hidden="true">
          <span className="gm-milk-ball-y gm-a">
            <svg viewBox="0 0 20 20">
              <use href="#gm-s-baseball" width="20" height="20" />
            </svg>
          </span>
        </span>

        <span className="gm-milk-pip gm-a">
          <Pip pose="sit" still />
        </span>
      </div>

      <div className="gm-body gm-milk-wall">
        <div className="gm-bezel">
          <Screen game={game} />
        </div>
      </div>

      <div className="gm-body gm-milk-counter">
        <Plate game={game} no={no} />
      </div>

      <svg className="gm-base" viewBox="0 0 300 44" aria-hidden="true" focusable="false">
        <path d="M12 0h276v32H12Z" fill="url(#gm-g-oak-y)" />
        <path d="M12 0h276v3H12Z" fill="url(#gm-g-brass)" />
        {range(11).map((i) => (
          <path key={i} d={`M${24 + i * 24} 8v18`} stroke="#24180d" strokeWidth="1.2" opacity=".6" />
        ))}
        <path d="M4 32h292v12H4Z" fill="#160e07" />
      </svg>
    </article>
  );
}
