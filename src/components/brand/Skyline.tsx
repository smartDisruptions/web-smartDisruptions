/**
 * A rooftop skyline — far hills, a pagoda, a torii, near roofs with lit
 * windows — drawn as three flat silhouette layers so it costs a few KB of
 * path data and no images. Colours come from --sky-* tokens: an ink-wash
 * landscape by day, a moonlit town by night.
 *
 * Geometry is generated here, on the server, from a few numbers; the browser
 * only ever sees finished paths.
 */

import { pagoda, torii, town } from './scenery';
import StaticSvg from '@/components/brand/StaticSvg';

const W = 1440;
const H = 220;

const FAR =
  `M0 ${H} L0 120 C120 92 210 70 330 88 C430 104 500 60 610 66 C720 72 790 112 900 98 C1010 84 1080 52 1200 64 C1300 74 1380 96 ${W} 86 L${W} ${H} Z`;
const MID = `${pagoda(1110, H - 52, 5, 150, 30)} ${torii(268, H - 46, 92, 70)} M0 ${H} L0 ${H - 54} C200 ${H - 64} 420 ${H - 50} 700 ${H - 58} C980 ${H - 66} 1200 ${H - 52} ${W} ${H - 60} L${W} ${H} Z`;
const NEAR = town(W, H, 7);

export default function Skyline({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`relative ${className ?? ''}`} aria-hidden>
      <StaticSvg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="block h-full w-full">
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
      </StaticSvg>
      {children}
    </div>
  );
}
