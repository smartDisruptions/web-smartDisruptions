/**
 * A rooftop skyline — far hills, a pagoda, a torii, near roofs with lit
 * windows — drawn as three flat silhouette layers so it costs a few KB of
 * path data and no images. Colours come from --sky-* tokens: an ink-wash
 * landscape by day, a moonlit town by night.
 *
 * Geometry is generated here, on the server, from a few numbers; the browser
 * only ever sees finished paths.
 */

const W = 1440;
const H = 220;

function roof(cx: number, y: number, hw: number, rise: number): string {
  // A hip roof with upturned corners: the curl is what makes it read as
  // Japanese at a glance, even as a 20px silhouette.
  return [
    `M${cx - hw - 10} ${y - 6}`,
    `Q${cx - hw + 2} ${y + 3} ${cx - hw * 0.62} ${y - 5}`,
    `L${cx - hw * 0.22} ${y - rise}`,
    `L${cx + hw * 0.22} ${y - rise}`,
    `L${cx + hw * 0.62} ${y - 5}`,
    `Q${cx + hw - 2} ${y + 3} ${cx + hw + 10} ${y - 6}`,
    `L${cx + hw - 4} ${y + 4}`,
    `L${cx - hw + 4} ${y + 4}`,
    'Z',
  ].join(' ');
}

function pagoda(cx: number, base: number, tiers: number, width: number, tierH: number): string {
  const parts: string[] = [];
  for (let i = 0; i < tiers; i++) {
    const hw = width / 2 - i * (width * 0.07);
    const eave = base - i * tierH - tierH * 0.55;
    const bw = hw * 0.55;
    parts.push(`M${cx - bw} ${base - i * tierH} L${cx - bw} ${eave} L${cx + bw} ${eave} L${cx + bw} ${base - i * tierH} Z`);
    parts.push(roof(cx, eave, hw, tierH * 0.42));
  }
  const top = base - tiers * tierH - tierH * 0.1;
  parts.push(`M${cx - 2.5} ${top + 8} L${cx - 1.5} ${top - 46} L${cx + 1.5} ${top - 46} L${cx + 2.5} ${top + 8} Z`);
  for (let k = 0; k < 5; k++) {
    const ry = top - 10 - k * 7;
    parts.push(`M${cx - 7 + k} ${ry} h${14 - 2 * k} v2.4 h${-(14 - 2 * k)} Z`);
  }
  return parts.join(' ');
}

function torii(x: number, base: number, w: number, h: number): string {
  const p = w * 0.16;
  return [
    `M${x + p} ${base} L${x + p + 4} ${base - h} L${x + p + 13} ${base - h} L${x + p + 11} ${base} Z`,
    `M${x + w - p - 11} ${base} L${x + w - p - 13} ${base - h} L${x + w - p - 4} ${base - h} L${x + w - p} ${base} Z`,
    `M${x - 8} ${base - h - 2} Q${x + w / 2} ${base - h + 10} ${x + w + 8} ${base - h - 2} L${x + w + 4} ${base - h + 9} Q${x + w / 2} ${base - h + 18} ${x - 4} ${base - h + 9} Z`,
    `M${x + 2} ${base - h * 0.74} h${w - 4} v8 h${-(w - 4)} Z`,
  ].join(' ');
}

function houses(): { roofs: string; windows: [number, number][] } {
  // A deterministic row of roofs — the same town every build.
  const roofs: string[] = [];
  const windows: [number, number][] = [];
  let x = -20;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  while (x < W + 40) {
    const w = 90 + rnd() * 90;
    const top = H - 38 - rnd() * 48;
    const cx = x + w / 2;
    roofs.push(roof(cx, top, w / 2, 26 + rnd() * 14));
    roofs.push(`M${cx - w / 2 + 8} ${top + 4} L${cx - w / 2 + 8} ${H} L${cx + w / 2 - 8} ${H} L${cx + w / 2 - 8} ${top + 4} Z`);
    const n = Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) windows.push([cx - w / 4 + i * (w / 4), top + 18 + rnd() * 10]);
    x += w + 6 + rnd() * 30;
  }
  return { roofs: roofs.join(' '), windows };
}

const FAR =
  `M0 ${H} L0 120 C120 92 210 70 330 88 C430 104 500 60 610 66 C720 72 790 112 900 98 C1010 84 1080 52 1200 64 C1300 74 1380 96 ${W} 86 L${W} ${H} Z`;
const MID = `${pagoda(1110, H - 52, 5, 150, 30)} ${torii(268, H - 46, 92, 70)} M0 ${H} L0 ${H - 54} C200 ${H - 64} 420 ${H - 50} 700 ${H - 58} C980 ${H - 66} 1200 ${H - 52} ${W} ${H - 60} L${W} ${H} Z`;
const NEAR = houses();

export default function Skyline({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`relative ${className ?? ''}`} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="block h-full w-full">
        <circle cx="1240" cy="44" r="26" fill="var(--sky-moon)" />
        <circle cx="1240" cy="44" r="60" fill="var(--sky-moon)" opacity="0.12" />
        <path d={FAR} fill="var(--sky-far)" />
        <path d={MID} fill="var(--sky-mid)" />
        <path d={NEAR.roofs} fill="var(--sky-near)" />
        <g fill="var(--sky-window)">
          {NEAR.windows.map(([x, y], i) => (
            <rect key={i} x={x - 5} y={y} width="10" height="12" rx="1.5" />
          ))}
        </g>
      </svg>
      {children}
    </div>
  );
}
