import { Plate, Screen, nameId, type MachineProps } from './parts';
import { VoltReadout } from './Best';
import { region } from './geo';

/**
 * KID VOLT KNOCKOUT — the odd one out: a hot-pink neon punch-strength
 * machine, a little of the neon market that followed you downstairs. Black
 * lacquer and chrome, a neon sign, a yellow bolt, a KO readout in segment
 * digits, and a padded glove on a spring arm. It stands on its own mat.
 *
 * Attract: the glove throws a one-two into the readout, the KO flares, a
 * POW pops and the bolt crackles. Topper coordinates: viewBox 0 0 300 236.
 */

const W = 300;
const H = 236;

const READOUT = region(40, 124, 116, 46, W, H);
const GLOVE = region(176, 106, 90, 68.5, W, H);
const SPRING = region(262, 131, 28, 24, W, H);
const POW = region(130, 124, 40, 40, W, H);
const BOLT = region(158, 0, 68, 92, W, H);

// The bolt's outline where <use href="#gm-s-bolt"> lands it (x 166, y 2, 50×84).
const BOLT_EDGE = 'M196.8 4.5L172.7 50.3H190.2L181 84.4L210.2 33.1H192.7L204.3 4.5Z';

const NEON = 'M24 40a10 10 0 0 1 10-10h128a10 10 0 0 1 10 10v140a10 10 0 0 1-10 10H34a10 10 0 0 1-10-10Z';

export default function Volt({ game, no }: MachineProps) {
  const words = game.name.split(' ');
  const last = words.pop();
  return (
    <article className="gm-cab gm-volt" aria-labelledby={nameId(game)}>
      <div className="gm-top">
        <svg className="gm-art" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          {/* neon spill on the wall */}
          <ellipse cx="130" cy="120" rx="150" ry="110" fill="#ff4f9a" opacity=".07" />
          {/* the post the glove's spring hangs from */}
          <rect x="289" y="124" width="8" height="84" fill="url(#gm-g-chrome)" />
          <circle cx="293" cy="124" r="6" fill="url(#gm-g-chrome)" stroke="#2a2438" strokeWidth="1" />
          {/* the head: a chrome-framed black glass sign */}
          <rect x="82" y="192" width="36" height="14" fill="url(#gm-g-chrome)" />
          <rect x="10" y="16" width="188" height="182" rx="20" fill="url(#gm-g-chrome)" />
          <rect x="15" y="21" width="178" height="172" rx="16" fill="#0b0715" />
          <rect x="15" y="21" width="178" height="86" rx="16" fill="#1b1230" opacity=".7" />
          {/* the neon frame: glow, tube, hot core */}
          <path d={NEON} fill="none" stroke="#ff4f9a" strokeWidth="9" opacity=".16" />
          <path d={NEON} fill="none" stroke="#ff4f9a" strokeWidth="4.4" opacity=".55" />
          <path d={NEON} fill="none" stroke="#ffe3f0" strokeWidth="1.7" />
          {/* the readout window (its digits are the client readout) */}
          <rect x="40" y="124" width="116" height="46" rx="6" fill="#120509" stroke="#3a0d1c" strokeWidth="2" />
          {/* pink LEDs under the readout */}
          {[50, 58, 138, 146].map((x) => (
            <circle key={x} cx={x} cy="178" r="2.1" fill="#ff7ab8" />
          ))}
          {/* the bolt, cutting the sign's corner */}
          <use href="#gm-s-bolt" x="166" y="2" width="50" height="84" />
          {/* the crown */}
          <path d="M4 204h292v9H4Z" fill="url(#gm-g-chrome)" />
          <path d="M9 213h282v23H9Z" fill="#0d0918" />
          <path d="M14 225h272" stroke="#ff4f9a" strokeWidth="5" opacity=".35" />
          <path d="M14 225h272" stroke="#ffe3f0" strokeWidth="1.4" />
        </svg>

        <h3 id={nameId(game)} className="gm-name">
          {words.join(' ')} <span>{last}</span>
        </h3>

        {/* The bolt crackles: a hot core and two arcs, on opacity. */}
        <svg className="gm-volt-crackle gm-a" viewBox={BOLT.viewBox} style={BOLT.style} aria-hidden="true" focusable="false">
          <path d={BOLT_EDGE} fill="none" stroke="#ffd21f" strokeWidth="8" strokeLinejoin="round" opacity=".45" />
          <path d={BOLT_EDGE} fill="none" stroke="#fffbe0" strokeWidth="2" strokeLinejoin="round" />
          <path d="M214 30l7-5-3 8 8-3M183 87l-3 6 6-3-1 6M167 44l-6-2 4 5-6 1" fill="none" stroke="#fff3a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* The readout: KO, or your fastest knockout once you have one. */}
        <VoltReadout viewBox={READOUT.viewBox} style={READOUT.style} cx={98} y={129} />

        {/* ...and it flares when the glove lands. */}
        <svg className="gm-volt-flash gm-a" viewBox={READOUT.viewBox} style={READOUT.style} aria-hidden="true" focusable="false">
          <rect x="40" y="124" width="116" height="46" rx="6" fill="url(#gm-g-flash)" />
          <rect x="41" y="125" width="114" height="44" rx="5.5" fill="none" stroke="#ffd1e0" strokeWidth="1.4" />
        </svg>

        <span className="gm-volt-pow gm-a" style={POW.style} aria-hidden="true">
          <svg viewBox={POW.viewBox} focusable="false">
          <path
            d="M150 125l4 10.4 10.6-4.8-4.8 10.6 10.4 4-10.4 4 4.8 10.6-10.6-4.8-4 10.4-4-10.4-10.6 4.8 4.8-10.6-10.4-4 10.4-4-4.8-10.6 10.6 4.8Z"
            fill="#ffd21f"
            stroke="#fff7c2"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          </svg>
        </span>

        {/* The spring arm and the glove: one-two. */}
        <span className="gm-volt-spring gm-a" style={SPRING.style} aria-hidden="true">
          <svg viewBox={SPRING.viewBox} focusable="false">
          <path d="M263 143l2.4-9 4 18 4-18 4 18 4-18 4 18 2.6-9" fill="none" stroke="#3a3450" strokeWidth="4" strokeLinejoin="round" />
          <path d="M263 143l2.4-9 4 18 4-18 4 18 4-18 4 18 2.6-9" fill="none" stroke="url(#gm-g-chrome)" strokeWidth="2.4" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="gm-volt-glove gm-a" style={GLOVE.style} aria-hidden="true">
          <svg viewBox={GLOVE.viewBox} focusable="false">
            <use href="#gm-s-glove" x="176" y="106" width="90" height="68.5" />
          </svg>
        </span>
      </div>

      <div className="gm-body">
        <div className="gm-bezel">
          <Screen game={game} />
        </div>
        <Plate game={game} no={no} />
      </div>

      <svg className="gm-base" viewBox="0 0 300 66" aria-hidden="true" focusable="false">
        {/* his own mat, lit pink at the rim */}
        <ellipse cx="150" cy="52" rx="148" ry="13" fill="#170a16" />
        <ellipse cx="150" cy="52" rx="148" ry="13" fill="none" stroke="#ff4f9a" strokeWidth="3" opacity=".35" />
        <ellipse cx="150" cy="51" rx="146" ry="12" fill="none" stroke="#ffd1e6" strokeWidth=".9" opacity=".7" />
        {/* the plinth */}
        <path d="M9 0h282v40H9Z" fill="#0d0918" />
        <path d="M9 0h282v4H9Z" fill="url(#gm-g-chrome)" />
        <path d="M24 26h252" stroke="#ff4f9a" strokeWidth="6" opacity=".3" />
        <path d="M24 26h252" stroke="#ffe3f0" strokeWidth="1.6" />
        <path d="M20 40h30v8H20ZM250 40h30v8h-30Z" fill="url(#gm-g-chrome)" />
      </svg>
    </article>
  );
}
