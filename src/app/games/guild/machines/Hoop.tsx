import Pip from '@/components/pip/Pip';
import { BulbRow, Plate, Screen, nameId, type MachineProps } from './parts';
import { net, range } from './geo';

/**
 * HOOP QUEST — an upright oak cabinet whose marquee is the game's backboard:
 * dark oak in a gold frame, the cream shooter's square, a brass hoop and a
 * rope net off the front. Pip rides the backboard, as he does in the game.
 *
 * Attract: a ball arcs up and swishes through the hoop, the net kicks, and
 * Pip hops. Topper coordinates: viewBox 0 0 300 224, rim centre (150, 190).
 */

const BOARD =
  'M46 64H254a12 12 0 0 1 12 12V146c0 23-31 40-64 42H98c-33-2-64-19-64-42V76a12 12 0 0 1 12-12Z';
const BOARD_IN =
  'M50 72H250a6 6 0 0 1 6 6V144c0 18-27 33-56 35H100c-29-2-56-17-56-35V78a6 6 0 0 1 6-6Z';

const NET = net(40, 6, 34, 8.5, 4, 11.5, 4.2, 8);

export default function Hoop({ game, no }: MachineProps) {
  return (
    <article className="gm-cab gm-hoop" aria-labelledby={nameId(game)}>
      <div className="gm-top">
        <svg className="gm-art" viewBox="0 0 300 224" aria-hidden="true" focusable="false">
          {/* candlelight on the wall behind the board */}
          <ellipse cx="150" cy="128" rx="150" ry="96" fill="url(#gm-g-glow)" opacity=".55" />
          {/* the board's brass posts, into the cabinet's crown */}
          <rect x="80" y="150" width="10" height="66" fill="url(#gm-g-brass-x)" />
          <rect x="210" y="150" width="10" height="66" fill="url(#gm-g-brass-x)" />
          {/* the crown */}
          <path d="M2 202h296l-6 10H8Z" fill="url(#gm-g-brass)" />
          <path d="M8 212h284v12H8Z" fill="url(#gm-g-oak-y)" />
          {/* the backboard */}
          <path d={BOARD} fill="url(#gm-g-board)" />
          <clipPath id="gm-hoop-grain">
            <path d={BOARD} />
          </clipPath>
          <g clipPath="url(#gm-hoop-grain)" stroke="#1a110a" strokeWidth="1" opacity=".5">
            {range(9).map((i) => (
              <path key={i} d={`M30 ${80 + i * 13}c60 ${i % 2 ? 3 : -3} 180 ${i % 2 ? -3 : 3} 240 0`} fill="none" />
            ))}
          </g>
          <path d={BOARD} fill="none" stroke="url(#gm-g-brass)" strokeWidth="6.5" />
          <path d={BOARD_IN} fill="none" stroke="#b07e24" strokeWidth="1.4" opacity=".75" />
          {/* corner bolts */}
          {[
            [54, 80],
            [246, 80],
            [52, 146],
            [248, 146],
          ].map(([cx, cy]) => (
            <g key={cx * 1000 + cy}>
              <circle cx={cx} cy={cy} r="4.2" fill="#3a2410" />
              <circle cx={cx} cy={cy} r="3.2" fill="url(#gm-g-bulb)" />
            </g>
          ))}
          {/* the shooter's square */}
          <rect x="121" y="128" width="58" height="42" fill="none" stroke="#1a110a" strokeWidth="6" opacity=".5" />
          <rect x="121" y="128" width="58" height="42" fill="none" stroke="#f0e2c0" strokeWidth="3.6" />
          {/* the rim's bracket, and the back of the rim */}
          <path d="M136 172h28l-3 16h-22Z" fill="url(#gm-g-brass)" stroke="#5c3d0e" strokeWidth=".8" />
          <path d="M114 190a36 8.5 0 0 1 72 0" fill="none" stroke="#8a6018" strokeWidth="4.6" />
        </svg>

        <h3 id={nameId(game)} className="gm-name">
          {game.name}
        </h3>

        <BulbRow n={16} className="gm-hoop-bulbs" />

        {/* The ball: x rides the outer box, y and spin the inner one, so the
            two eases make a parabola. Behind the net and the rim's front. */}
        <span className="gm-hoop-ball gm-a" aria-hidden="true">
          <span className="gm-hoop-ball-y gm-a">
            <svg viewBox="0 0 30 30">
              <use href="#gm-s-bball" width="30" height="30" />
            </svg>
          </span>
        </span>

        {/* Moving parts ride HTML boxes: Chrome composites transforms on an
            HTML box, but not the individual transform properties on an svg. */}
        <span className="gm-hoop-net gm-a" aria-hidden="true">
          <svg viewBox="0 0 80 66" focusable="false">
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <g stroke="#5c4630" strokeWidth="2.6" opacity=".55" transform="translate(.6 1)">
              {NET.strands.map((d, i) => (
                <path key={i} d={d} />
              ))}
              <path d={NET.hem} />
            </g>
            <g stroke="#f3e6c6" strokeWidth="1.5">
              {NET.strands.map((d, i) => (
                <path key={i} d={d} />
              ))}
              <path d={NET.hem} strokeWidth="1.8" />
              </g>
            </g>
          </svg>
        </span>
        <svg className="gm-hoop-rim" viewBox="0 0 80 66" aria-hidden="true" focusable="false">
          <path d="M6 6a34 8.5 0 0 0 68 0" fill="none" stroke="#5c3d0e" strokeWidth="6.4" strokeLinecap="round" />
          <path d="M6 6a34 8.5 0 0 0 68 0" fill="none" stroke="url(#gm-g-brass)" strokeWidth="4.4" strokeLinecap="round" />
          <path d="M14 10.5a34 8.5 0 0 0 20 3.6" fill="none" stroke="#fff3c4" strokeWidth="1.2" strokeLinecap="round" opacity=".8" />
        </svg>

        <span className="gm-hoop-pip gm-a">
          <Pip pose="sit" still />
        </span>
      </div>

      <div className="gm-body">
        <div className="gm-bezel">
          <Screen game={game} />
        </div>
        <Plate game={game} no={no} />
      </div>

      <svg className="gm-base" viewBox="0 0 300 64" aria-hidden="true" focusable="false">
        <path d="M12 0h276v50H12Z" fill="url(#gm-g-oak-y)" />
        <path d="M12 0h276v3.5H12Z" fill="url(#gm-g-brass)" />
        <path d="M30 12h240v30H30Z" fill="#1c130b" opacity=".55" />
        {/* the ball rack */}
        <path d="M70 41h160" stroke="url(#gm-g-brass)" strokeWidth="4" strokeLinecap="round" />
        {[96, 136, 176].map((x, i) => (
          <use key={x} href="#gm-s-bball" x={x} y={11 + (i === 1 ? 1 : 0)} width="29" height="29" />
        ))}
        <path d="M4 50h292v14H4Z" fill="#160e07" />
        <path d="M4 50h292v2H4Z" fill="url(#gm-g-brass)" opacity=".6" />
      </svg>
    </article>
  );
}
