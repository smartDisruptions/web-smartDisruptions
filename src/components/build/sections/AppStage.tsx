import Kiru from '@/components/kiru/Kiru';
import StaticSvg from '@/components/brand/StaticSvg';
import { seeded } from '@/components/brand/scenery';

/**
 * Build Apps, played by the scroll: 器, a vessel. A vermilion-lacquered phone
 * stands facing you on black urushi; as you scroll it tips back into an
 * exploded view and comes apart into the four things an app is made of,
 * each one named as it settles:
 *
 *   what you see       the screen
 *   what it decides    the logic, a gold flow of yes and no
 *   what it remembers  the data, rows on indigo glass
 *   what it runs on    the lacquer board itself, its circuit in maki-e gold
 *
 * Real CSS 3D with no perspective (an orthographic, technical-drawing view):
 * one rig turns, four slabs slide apart on translateZ, four labels fade in.
 * Transforms and opacity only. The base styles are the finished exploded
 * view: the still a reader gets without scroll timelines or with reduced
 * motion. Kiru is the app's avatar on the screen, holding still.
 */

/**
 * Maki-e gold dust and a stream line on the lacquer ground. The dust is
 * three paths (one per brightness), not 46 circles: same pixels, fewer nodes.
 */
function Ground() {
  const rnd = seeded(19);
  const dust = ['', '', ''];
  for (let i = 0; i < 46; i++) {
    const x = Math.round(rnd() * 1000) / 10;
    const y = Math.round(rnd() * 920) / 10;
    const r = Math.round((0.12 + rnd() * 0.3) * 100) / 100;
    const o = rnd();
    const n = (v: number) => Math.round(v * 100) / 100;
    dust[Math.min(2, Math.floor(o * 3))] +=
      `M${n(x - r)} ${y}a${r} ${r} 0 1 0 ${n(2 * r)} 0a${r} ${r} 0 1 0 ${n(-2 * r)} 0`;
  }
  return (
    <StaticSvg
      viewBox="0 0 100 92"
      preserveAspectRatio="none"
      className="hb-app-makie"
    >
      <g fill="#e2b85a">
        <path d={dust[0]} opacity="0.3" />
        <path d={dust[1]} opacity="0.5" />
        <path d={dust[2]} opacity="0.72" />
      </g>
      <g fill="none" stroke="#d9ad4f" strokeLinecap="round">
        <path
          d="M-4 70 C 14 58, 30 82, 50 70 S 86 52, 104 62"
          strokeWidth="0.35"
          opacity="0.55"
        />
        <path
          d="M-4 75 C 16 64, 32 88, 52 76 S 88 58, 104 68"
          strokeWidth="0.2"
          opacity="0.35"
        />
        <path
          d="M-4 18 C 18 10, 34 26, 58 16 S 90 6, 104 12"
          strokeWidth="0.2"
          opacity="0.3"
        />
      </g>
    </StaticSvg>
  );
}

/** What it runs on: the board, vermilion lacquer with a maki-e circuit. */
function Board() {
  const traces = [
    'M110 250 H70 V170 H40',
    'M110 280 H56 V330 H30',
    'M190 250 H232 V150 H262',
    'M190 290 H246 V380 H270',
    'M140 230 V120 H100 V70',
    'M160 230 V140 H210 V90',
    'M140 330 V430 H90 V480',
    'M165 330 V410 H220 V500',
  ];
  const vias = [
    [40, 170],
    [30, 330],
    [262, 150],
    [270, 380],
    [100, 70],
    [210, 90],
    [90, 480],
    [220, 500],
  ];
  return (
    <StaticSvg viewBox="0 0 300 580" className="hb-app-art">
      <rect width="300" height="580" rx="48" fill="#b5321e" />
      <rect
        x="6"
        y="6"
        width="288"
        height="568"
        rx="43"
        fill="none"
        stroke="#d24a32"
        strokeWidth="3"
        opacity="0.7"
      />
      <g
        fill="none"
        stroke="#e7be5e"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {traces.map((d) => (
          <path key={d} d={d} />
        ))}
        <rect x="110" y="230" width="80" height="100" rx="8" strokeWidth="4" />
        <rect x="126" y="250" width="48" height="60" rx="4" />
        <circle cx="150" cy="40" r="11" />
      </g>
      <g fill="#e7be5e">
        {vias.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="7" />
        ))}
      </g>
    </StaticSvg>
  );
}

/** What it remembers: rows of records on indigo glass. */
function Data() {
  const rows = [150, 110, 168, 96, 140, 124, 160];
  return (
    <StaticSvg viewBox="0 0 270 540" className="hb-app-art">
      <rect
        x="1.5"
        y="1.5"
        width="267"
        height="537"
        rx="38"
        fill="#1c2766"
        fillOpacity="0.82"
        stroke="#e7be5e"
        strokeWidth="3"
      />
      <rect x="34" y="50" width="120" height="14" rx="7" fill="#e7be5e" />
      {rows.map((w, i) => (
        <g key={i} transform={`translate(0 ${100 + i * 52})`}>
          <rect
            x="34"
            y="0"
            width="22"
            height="22"
            rx="5"
            fill="#e7be5e"
            opacity={i % 3 === 0 ? 1 : 0.55}
          />
          <rect
            x="70"
            y="5"
            width={w}
            height="12"
            rx="6"
            fill="#f4ead5"
            opacity="0.85"
          />
          <rect
            x={80 + w}
            y="5"
            width="30"
            height="12"
            rx="6"
            fill="#9bb0ff"
            opacity="0.55"
          />
        </g>
      ))}
    </StaticSvg>
  );
}

/** What it decides: a gold flow, the path it took marked in vermilion. */
function Logic() {
  return (
    <StaticSvg viewBox="0 0 270 540" className="hb-app-art">
      <rect
        x="1.5"
        y="1.5"
        width="267"
        height="537"
        rx="38"
        fill="#1f1512"
        fillOpacity="0.8"
        stroke="#e7be5e"
        strokeWidth="3"
      />
      <g
        fill="none"
        stroke="#e7be5e"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="95" y="50" width="80" height="40" rx="20" />
        <path d="M135 150 L175 190 L135 230 L95 190 Z" />
        <path d="M95 190 H62 V280" />
        <rect x="22" y="280" width="80" height="40" rx="10" />
        <path d="M62 320 V370 H112" />
        <rect x="95" y="370" width="80" height="40" rx="10" />
      </g>
      <g
        fill="none"
        stroke="#ff6a4d"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M135 90 V150" />
        <path d="M175 190 H208 V280" />
        <rect
          x="168"
          y="280"
          width="80"
          height="40"
          rx="10"
          fill="#ff6a4d"
          fillOpacity="0.25"
        />
        <path d="M208 320 V370 H175 M135 410 V450" />
        <circle cx="135" cy="472" r="20" fill="#ff6a4d" />
      </g>
    </StaticSvg>
  );
}

/**
 * What you see: the screen, a small app that does one job. A stamp card, as
 * on the Build Apps page: one stamp a class, five of eight so far.
 */
function Screen() {
  const stamps = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    cx: 64 + (i % 4) * 47,
    cy: 186 + Math.floor(i / 4) * 50,
    done: i < 5,
  }));
  return (
    <>
      <StaticSvg viewBox="0 0 270 550" className="hb-app-art">
        <rect width="270" height="550" rx="34" fill="#fffaf0" />
        <rect
          x="24"
          y="18"
          width="34"
          height="9"
          rx="4.5"
          fill="#1f1a14"
          opacity="0.7"
        />
        <rect
          x="200"
          y="18"
          width="46"
          height="9"
          rx="4.5"
          fill="#1f1a14"
          opacity="0.45"
        />
        <rect x="24" y="52" width="26" height="26" rx="6" fill="#e2412a" />
        <rect x="58" y="54" width="104" height="18" rx="9" fill="#1f1a14" />
        <rect x="58" y="78" width="80" height="9" rx="4.5" fill="#b8ab95" />
        <rect
          x="24"
          y="112"
          width="222"
          height="168"
          rx="18"
          fill="#fff"
          stroke="#e2412a"
          strokeWidth="3"
        />
        <rect x="40" y="130" width="54" height="9" rx="4.5" fill="#b8ab95" />
        <rect
          x="176"
          y="130"
          width="54"
          height="9"
          rx="4.5"
          fill="#e2412a"
          opacity="0.8"
        />
        {stamps.map((st) =>
          st.done ? (
            <g key={st.cx * 10 + st.cy}>
              <circle cx={st.cx} cy={st.cy} r="19" fill="#e2412a" />
              <rect
                x={st.cx - 8}
                y={st.cy - 3}
                width="16"
                height="6"
                rx="3"
                fill="#fffaf0"
              />
            </g>
          ) : (
            <circle
              key={st.cx * 10 + st.cy}
              cx={st.cx}
              cy={st.cy}
              r="18"
              fill="none"
              stroke="#d9cdb8"
              strokeWidth="3"
              strokeDasharray="5 5"
            />
          )
        )}
        <rect x="24" y="306" width="40" height="44" rx="8" fill="#1f1a14" />
        <rect x="72" y="332" width="40" height="12" rx="6" fill="#b8ab95" />
        <rect
          x="190"
          y="332"
          width="56"
          height="12"
          rx="6"
          fill="#1f1a14"
          opacity="0.5"
        />
        <rect x="24" y="456" width="222" height="48" rx="24" fill="#d63a22" />
        <rect x="100" y="476" width="70" height="9" rx="4.5" fill="#fff" />
        <rect
          x="100"
          y="528"
          width="70"
          height="6"
          rx="3"
          fill="#1f1a14"
          opacity="0.3"
        />
      </StaticSvg>
      <span className="hb-app-avatar">
        <Kiru pose="peek" still />
      </span>
    </>
  );
}

const LAYERS = [
  { key: 'board', label: 'What it runs on', art: <Board /> },
  { key: 'data', label: 'What it remembers', art: <Data /> },
  { key: 'logic', label: 'What it decides', art: <Logic /> },
  { key: 'screen', label: 'What you see', art: <Screen /> },
];

export default function AppStage() {
  return (
    <div className="hb-ground hb-app-stage">
      <Ground />
      <div className="hb-app-rig">
        {LAYERS.map((l) => (
          <div key={l.key} className={`hb-app-layer hb-app-${l.key}`}>
            {l.art}
          </div>
        ))}
      </div>
      <ol className="hb-app-labels">
        {[...LAYERS].reverse().map((l) => (
          <li key={l.key} className={`hb-app-label hb-app-label-${l.key}`}>
            {l.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
