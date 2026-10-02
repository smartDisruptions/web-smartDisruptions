import Kiru from '@/components/kiru/Kiru';

/**
 * The attract screen for Kiru's Rooftop Run: the town at night, a gap to
 * jump, the coins that show the way over it, Kiru at the edge. Drawn here on
 * the server from a few numbers — the browser receives finished paths and no
 * code — in the same palette the canvas game paints with, so pressing Start
 * swaps one picture of the town for the playable one.
 *
 * The SVG is 800×400 and slices to whatever shape the screen is (4:3 on a
 * phone, 2:1 on a desk), so everything that matters sits in the middle.
 */

const W = 800;
const H = 400;
const r1 = (n: number) => Math.round(n * 10) / 10;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hipRoof(cx: number, y: number, hw: number, rise: number) {
  return [
    `M${r1(cx - hw - 8)} ${r1(y - 5)}`,
    `Q${r1(cx - hw + 2)} ${r1(y + 3)} ${r1(cx - hw * 0.62)} ${r1(y - 4)}`,
    `L${r1(cx - hw * 0.22)} ${r1(y - rise)} L${r1(cx + hw * 0.22)} ${r1(y - rise)}`,
    `L${r1(cx + hw * 0.62)} ${r1(y - 4)}`,
    `Q${r1(cx + hw - 2)} ${r1(y + 3)} ${r1(cx + hw + 8)} ${r1(y - 5)}`,
    `L${r1(cx + hw - 4)} ${r1(y + 4)} L${r1(cx - hw + 4)} ${r1(y + 4)} Z`,
  ].join(' ');
}

// Stars: three paths, one per brightness, rather than a rect each.
const STARS = (() => {
  const r = seeded(11);
  const d = ['', '', ''];
  for (let i = 0; i < 46; i++) {
    const x = Math.round(r() * W);
    const y = Math.round(r() * 190);
    const sz = r() < 0.7 ? 1 : 2;
    d[Math.floor(r() * 3)] += `M${x} ${y}h${sz}v${sz}h-${sz}z`;
  }
  return d;
})();

const ridge = (x: number) => {
  const a = (x / W) * Math.PI * 2;
  return 268 - 28 * Math.sin(a + 0.6) - 15 * Math.sin(a * 3 + 1.3) - 8 * Math.sin(a * 7 + 2.1);
};
const FAR = `M0 ${H} ${Array.from({ length: 41 }, (_, i) => `L${i * 20} ${r1(ridge(i * 20))}`).join(' ')} L${W} ${H} Z`;
const peak = (dx: number) => 120 + Math.pow(Math.abs(dx) / 170, 1.35) * 170;
const PEAK = `M330 ${H} ${Array.from({ length: 41 }, (_, i) => `L${r1(500 + (i - 20) * 8.5)} ${r1(Math.min(H, peak((i - 20) * 8.5)))}`).join(' ')} L670 ${H} Z`;
const SNOW = `M${r1(500 - 40)} ${r1(peak(40))} ${Array.from({ length: 21 }, (_, i) => `L${r1(500 - 40 + i * 4)} ${r1(peak(-40 + i * 4))}`).join(' ')} ${Array.from({ length: 11 }, (_, i) => `L${r1(500 + 40 - i * 8)} ${r1(peak(40 - i * 8) + 9 + 5 * Math.sin(i))}`).join(' ')} Z`;

// The town: a row of towers and a pagoda.
const town = (() => {
  const r = seeded(5);
  const parts: string[] = [];
  const lit: string[] = [];
  let x = -10;
  while (x < W) {
    const w = 22 + r() * 46;
    const h = 60 + r() * 110;
    const top = H - h;
    parts.push(`M${r1(x)} ${H} V${r1(top)} H${r1(x + w)} V${H} Z`);
    if (r() < 0.4) parts.push(hipRoof(x + w / 2, top, w / 2 + 2, 11));
    for (let wy = top + 10; wy < H - 8; wy += 12) {
      for (let wx = x + 5; wx < x + w - 6; wx += 9) {
        if (r() < 0.08) lit.push(`M${Math.round(wx)} ${Math.round(wy)}h3v4h-3z`);
      }
    }
    x += w + 3 + r() * 14;
  }
  const cx = 214;
  for (let k = 0; k < 5; k++) {
    const hw = 40 - k * 5.5;
    const base = H - 48 - k * 32;
    parts.push(`M${r1(cx - hw * 0.55)} ${base} V${base - 22} H${r1(cx + hw * 0.55)} V${base} Z`);
    parts.push(hipRoof(cx, base - 22, hw, 12));
  }
  parts.push(`M${cx - 1.5} ${H - 48 - 5 * 32 - 30} h3 v40 h-3 Z M${cx - 6} ${H - 48} h12 v48 h-12 Z`);
  return { d: parts.join(' '), lit: lit.join(' ') };
})();

// Near layer: big dark roofs with warm windows.
const near = (() => {
  const r = seeded(19);
  const parts: string[] = [];
  const lit: string[] = [];
  let x = -30;
  while (x < W) {
    const w = 70 + r() * 90;
    const h = 60 + r() * 70;
    const top = H - h;
    parts.push(`M${r1(x + 5)} ${H} V${r1(top)} H${r1(x + w - 5)} V${H} Z`);
    parts.push(hipRoof(x + w / 2, top, w / 2, 18 + r() * 10));
    for (let wy = top + 16; wy < H - 10; wy += 18) {
      for (let wx = x + 14; wx < x + w - 16; wx += 17) {
        if (r() < 0.16) lit.push(`M${Math.round(wx)} ${Math.round(wy)}h6v8h-6z`);
      }
    }
    x += w + 6 + r() * 26;
  }
  return { d: parts.join(' '), lit: lit.join(' ') };
})();

// The two roofs in play.
const ROOFS = [
  { x: -30, w: 352, top: 300 },
  { x: 452, w: 380, top: 280 },
];
// Facades: the dark windows are a pattern (three bays and a pillar, 96 wide);
// only the lit ones are drawn, on top of it.
const facadeLit = ROOFS.map(({ x, w, top }) => {
  const lit: string[] = [];
  const r = seeded(Math.round(x + 1000));
  for (let c = 0; c * 24 + 14 < w - 10; c++) {
    if (c % 4 === 3) continue;
    for (let row = 0; top + 28 + row * 27 < H; row++) {
      if (r() < 0.32) lit.push(`M${x + 14 + c * 24} ${top + 28 + row * 27}h10v13h-10z`);
    }
  }
  return lit.join('');
});
const cap = ({ x, w, top }: { x: number; w: number; top: number }) =>
  `M${x - 4} ${top} H${x + w + 4} Q${x + w + 11} ${top + 9} ${x + w + 21} ${top + 2} L${x + w + 14} ${top + 13} H${x - 14} L${x - 21} ${top + 2} Q${x - 11} ${top + 9} ${x - 4} ${top} Z`;

// Coins over the gap, along the arc a full jump takes.
const COINS = Array.from({ length: 7 }, (_, i) => {
  const u = (i + 0.5) / 7;
  return [r1(330 + u * 150), r1(266 - Math.sin(u * Math.PI) * 74 - u * 14)];
});

export default function RooftopPoster() {
  return (
    <>
      <svg
        className="rr-poster-art"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="rrp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#060716" />
            <stop offset="0.42" stopColor="#111540" />
            <stop offset="0.74" stopColor="#271c52" />
            <stop offset="1" stopColor="#3d1f4a" />
          </linearGradient>
          <radialGradient id="rrp-halo">
            <stop offset="0.25" stopColor="#ffecc8" stopOpacity="0.32" />
            <stop offset="0.5" stopColor="#ffdcbe" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ffdcbe" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rrp-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#583478" stopOpacity="0" />
            <stop offset="1" stopColor="#583478" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="rrp-glow">
            <stop offset="0" stopColor="#ff6032" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ff6032" stopOpacity="0" />
          </radialGradient>
          {ROOFS.map((r, i) => (
            <pattern key={i} id={`rrp-win${i}`} x={r.x + 14} y={r.top + 28} width="96" height="27" patternUnits="userSpaceOnUse">
              <path d="M0 0h10v13H0zM24 0h10v13H24zM48 0h10v13H48z" fill="#0d1029" />
            </pattern>
          ))}
          <pattern id="rrp-tile" width="9" height="12" patternUnits="userSpaceOnUse">
            <path d="M9 7a4.5 4.5 0 0 1-9 0" fill="none" stroke="#38407a" strokeWidth="1.5" />
          </pattern>
          <radialGradient id="rrp-gold">
            <stop offset="0" stopColor="#ffbe5a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffbe5a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#rrp-sky)" />
        {STARS.map((d, i) => (
          <path key={i} d={d} fill="#fff" opacity={0.4 + i * 0.25} />
        ))}
        <circle cx="610" cy="78" r="110" fill="url(#rrp-halo)" />
        <circle cx="610" cy="78" r="27" fill="#fbecd0" />
        <g fill="#d6be96" opacity="0.45">
          <circle cx="601" cy="73" r="5.5" />
          <circle cx="618" cy="85" r="4" />
          <circle cx="614" cy="66" r="2.8" />
        </g>
        <path d={FAR} fill="#1d2353" />
        <path d={PEAK} fill="#1c2250" />
        <path d={SNOW} fill="#cdd6ff" opacity="0.5" />
        <rect y="250" width={W} height="150" fill="url(#rrp-mist)" />
        <path d={town.d} fill="#141a40" />
        <path d={town.lit} fill="#ffcf70" opacity="0.75" />
        <rect x="560" y="236" width="4" height="40" fill="#ff4f9a" opacity="0.9" />
        <rect x="96" y="262" width="4" height="34" fill="#3de1ff" opacity="0.85" />
        <path d={near.d} fill="#0d1030" />
        <path d={near.lit} fill="#ffbe6e" opacity="0.85" />

        {/* The roofs in play */}
        {ROOFS.map((r, i) => (
          <g key={i}>
            <rect x={r.x} y={r.top + 8} width={r.w} height={H - r.top} fill={i ? '#171b3d' : '#151937'} />
            <rect x={r.x} y={r.top + 8} width="4" height={H - r.top} fill="#8296ff" opacity="0.09" />
            <rect x={r.x + 14} y={r.top + 28} width={r.w - 24} height={H - r.top - 28} fill={`url(#rrp-win${i})`} />
            <path d={facadeLit[i]} fill="#ffcf70" />
          </g>
        ))}
        <path d={ROOFS.map(cap).join(' ')} fill="#252b55" />
        {ROOFS.map((r, i) => (
          <rect key={i} x={r.x - 8} y={r.top} width={r.w + 16} height="9" fill="url(#rrp-tile)" />
        ))}
        <path
          d={ROOFS.map((r) => `M${r.x - 4} ${r.top + 0.7} H${r.x + r.w + 4}`).join(' ')}
          stroke="#a0b4ff"
          strokeOpacity="0.55"
          strokeWidth="1.4"
        />

        {/* A chimney, breathing smoke */}
        <g>
          <rect x="128" y="258" width="26" height="42" fill="#3a2f52" />
          <rect x="128" y="258" width="3" height="42" fill="#a0aaff" opacity="0.16" />
          <path d="M128 266h26M128 274h26M128 282h26M128 290h26" stroke="#2a2140" strokeWidth="1.4" />
          <rect x="124.5" y="252" width="33" height="6.5" fill="#4c4170" />
          <circle cx="146" cy="236" r="7" fill="#9aa0c0" opacity="0.12" />
          <circle cx="137" cy="219" r="10" fill="#9aa0c0" opacity="0.08" />
        </g>

        {/* A torii with a lantern: run under it */}
        <g>
          <rect x="604" y="157" width="7" height="123" fill="#c4321c" />
          <rect x="685" y="157" width="7" height="123" fill="#c4321c" />
          <rect x="598" y="171" width="100" height="6" fill="#c4321c" />
          <path d="M588 149 Q648 160 708 149 L705 158 Q648 168 591 158 Z" fill="#1b1310" />
          <path d="M648 160 V178" stroke="#1b1310" strokeWidth="1.4" />
          <circle cx="648" cy="196" r="38" fill="url(#rrp-glow)" />
          <ellipse cx="648" cy="196" rx="13" ry="16" fill="#e8432a" />
          <ellipse cx="646" cy="193" rx="5.5" ry="10" fill="#ffdca0" opacity="0.55" />
          <path d="M636 190h24M635 196h26M636 202h24" stroke="#78140a" strokeOpacity="0.55" strokeWidth="1.2" />
          <rect x="641" y="178" width="14" height="3.4" fill="#1b1310" />
          <rect x="641" y="210.5" width="14" height="3.4" fill="#1b1310" />
        </g>

        {/* Coins along the jump */}
        {COINS.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="15" fill="url(#rrp-gold)" />
            <circle cx={x} cy={y} r="8.5" fill="#8a5a00" />
            <circle cx={x} cy={y} r="7" fill="#ffcf70" />
            <rect x={x - 2.4} y={y - 2.4} width="4.8" height="4.8" fill="#c8962e" />
          </g>
        ))}

        {/* A crow on the wind */}
        <g transform="translate(572 168)">
          <path d="M1 -1 L10 -14 L15 -9 Z" fill="#0b0c1a" />
          <ellipse cx="1" cy="0" rx="12" ry="7.5" fill="#0d0e1d" stroke="#5c6bc0" strokeWidth="1.6" />
          <circle cx="-9.5" cy="-3" r="6.2" fill="#0d0e1d" stroke="#5c6bc0" strokeWidth="1.6" />
          <path d="M-15 -4.5 L-22.5 -2 L-15 -0.5 Z" fill="#ffb547" />
          <circle cx="-11" cy="-4.4" r="1.6" fill="#ffe9a8" />
          <path d="M-2 -1 L7 -18 L15 -14 L8 1 Z" fill="#141632" stroke="#5c6bc0" strokeWidth="1.3" />
        </g>

        {/* Petals */}
        <g fill="#ffb7d0" opacity="0.8">
          <ellipse cx="380" cy="120" rx="3" ry="1.7" transform="rotate(30 380 120)" />
          <ellipse cx="470" cy="172" rx="2.6" ry="1.5" transform="rotate(-20 470 172)" />
          <ellipse cx="300" cy="196" rx="2.4" ry="1.4" transform="rotate(60 300 196)" />
          <ellipse cx="520" cy="236" rx="2.8" ry="1.6" transform="rotate(10 520 236)" />
        </g>

        {/* Kiru, at the edge, about to go — the rig runs left, so mirror it. */}
        <g transform="translate(560 0) scale(-1 1)">
          <Kiru pose="run" x={230} y={224} width={88} height={76} />
        </g>
      </svg>
      <div className="rr-poster-scan" aria-hidden="true" />
      <div className="rr-poster-title" aria-hidden="true">
        <p className="rr-logo-a arc-neon" data-tube="amber">
          Kiru&apos;s
        </p>
        <p className="rr-logo-b font-display arc-neon arc-flicker" data-tube="red" style={{ ['--flicker' as string]: '11s' }}>
          Rooftop Run
        </p>
        <p className="rr-poster-sub">Six levels · six ways to move</p>
      </div>
    </>
  );
}
