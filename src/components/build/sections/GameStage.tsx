import type { CSSProperties } from 'react';
import StaticSvg from '@/components/brand/StaticSvg';
import { seeded } from '@/components/brand/scenery';
import {
  CURSOR,
  KIRU,
  LANTERN,
  MOON,
  TILE,
  TILE_URI,
  TORII,
  pixelPaths,
} from './pixels';

/**
 * Build Games, played by the scroll: a level editor on a night rooftop. The
 * editor's cursor walks the row and drops copper roof tiles into place one by
 * one (leaving a gap), sets a torii at the end, and pixel Kiru runs the level
 * it built: across the tiles, over the gap for the lantern, home to the gate
 * (the same rooftop, lanterns and gate the Build Games page lets you edit).
 * His legs are a four-frame run cycle stepped by the scroll itself, so he
 * runs as fast as you scroll and stops mid-stride when you stop.
 *
 * Pixel art the honest way: a 116 × 88 logical screen, an integer number of
 * CSS pixels per pixel (--px, from the stage's width), every drawing a few
 * crisp-edged SVG paths rendered on the server. What moves is a dozen small
 * elements, by transform and opacity, on the stage's view timeline. The base
 * styles are the still: the finished level, Kiru mid-leap for the lantern.
 */

const SLOTS = 14; // tile slots, x = 2 + 8i
const GAP = new Set([8, 9]);

function Pixels({ map }: { map: Map<string, string> }) {
  return (
    <>
      {[...map].map(([fill, d]) => (
        <path key={fill} d={d} fill={fill} />
      ))}
    </>
  );
}

function Sprite({ rows, className }: { rows: string[]; className?: string }) {
  const w = rows[0].length;
  return (
    <StaticSvg
      viewBox={`0 0 ${w} ${rows.length}`}
      shapeRendering="crispEdges"
      className={className}
    >
      <Pixels map={pixelPaths(rows)} />
    </StaticSvg>
  );
}

/** Everything that holds still: sky dressing, the town, the roof we're on. */
function Backdrop() {
  const rnd = seeded(88);
  const stars = new Map<string, string>();
  const star = (fill: string, x: number, y: number) =>
    stars.set(fill, (stars.get(fill) ?? '') + `M${x} ${y}h1v1h-1z`);
  for (let i = 0; i < 34; i++) {
    const x = Math.floor(-40 + rnd() * 196);
    const y = Math.floor(2 + rnd() * 44);
    const fill = ['#fff3d6', '#9bb0ff', '#ffffff'][i % 3];
    star(fill, x, y);
    if (i % 9 === 0) {
      star(fill, x - 1, y);
      star(fill, x + 1, y);
      star(fill, x, y - 1);
      star(fill, x, y + 1);
    }
  }

  // The town below the rooftops, roof edges catching the moon, a few
  // windows still lit.
  let town = '';
  let roofs = '';
  let lit = '';
  for (let x = -40; x < 156; ) {
    const w = 9 + Math.floor(rnd() * 8);
    const h = 5 + Math.floor(rnd() * 9);
    const top = 66 - h;
    town += `M${x} ${top}h${w}v${h}h${-w}z`;
    roofs += `M${x - 1} ${top}h${w + 2}v1h${-(w + 2)}z`;
    for (let k = 0; k < 2; k++) {
      if (rnd() < 0.55)
        lit += `M${x + 2 + Math.floor(rnd() * (w - 4))} ${top + 3 + Math.floor(rnd() * (h - 4))}h1v1h-1z`;
    }
    x += w + 1 + Math.floor(rnd() * 3);
  }
  // A pagoda over the town.
  let pagoda = 'M17 30h2v6h-2z';
  [10, 12, 14, 16].forEach((w, i) => {
    const y = 36 + i * 6;
    pagoda += `M${18 - w / 2 - 2} ${y}h${w + 4}v1h${-(w + 4)}z`;
    pagoda += `M${18 - w / 2} ${y + 1}h${w}v5h${-w}z`;
  });

  // The roof we stand on: a building under the tile row, the gap a drop.
  let base = '';
  let edge = '';
  let glow = '';
  for (const [x0, x1] of [
    [-40, 66],
    [82, 156],
  ]) {
    base += `M${x0} 74h${x1 - x0}v14h${x0 - x1}z`;
    edge += `M${x0} 74h${x1 - x0}v1h${x0 - x1}z`;
    for (let x = x0 + 3; x < x1 - 2; x += 7) glow += `M${x} 79h2v2h-2z`;
  }

  // The editor's grid, faint, and its palette: the tile picked, a lantern.
  let grid = '';
  for (let x = -38; x < 156; x += 8)
    for (let y = 10; y < 66; y += 8) grid += `M${x} ${y}h1v1h-1z`;
  const palette = pixelPaths(TILE, 6, 5, pixelPaths(LANTERN, 18, 4));

  return (
    <StaticSvg
      viewBox="-40 0 196 88"
      shapeRendering="crispEdges"
      className="hb-game-bg"
    >
      <path d={grid} fill="#9bb0ff" opacity="0.14" />
      <Pixels map={stars} />
      <Pixels map={pixelPaths(MOON, 86, 8)} />
      <path d={pagoda} fill="#0d1130" />
      <path d={town} fill="#121738" />
      <path d={roofs} fill="#222b5c" />
      <path d={lit} fill="#ffcf70" opacity="0.85" />
      <path d="M66 66h16v22h-16z" fill="#05060f" />
      <path d={base} fill="#0e1230" />
      <path d={edge} fill="#2a3266" />
      <path d={glow} fill="#ffcf70" opacity="0.5" />
      <path d="M4 3h24v12h-24z" fill="#0b0d22" opacity="0.72" />
      <path
        d="M5 4h10v1h-10zM5 13h10v1h-10zM5 5h1v8h-1zM14 5h1v8h-1z"
        fill="#ffffff"
      />
      <Pixels map={palette} />
    </StaticSvg>
  );
}

const at = (x: number, y: number, extra?: Record<string, number>) =>
  ({ '--x': x, '--y': y, ...extra }) as CSSProperties;

export default function GameStage() {
  const slots = Array.from({ length: SLOTS }, (_, i) => i).filter(
    (i) => !GAP.has(i)
  );
  return (
    <div className="hb-ground hb-game-stage">
      <div
        className="hb-game-scene"
        style={{ '--tile': TILE_URI } as CSSProperties}
      >
        <Backdrop />
        {slots.map((i) => (
          <span
            key={i}
            className="hb-game-tile"
            style={at(2 + 8 * i, 66, {
              '--a': i * 0.03,
              '--b': i * 0.03 + 0.07,
            })}
          />
        ))}
        <span
          className="hb-game-px hb-game-torii"
          style={at(101, 52, { '--w': 14, '--h': 14 })}
        >
          <Sprite rows={TORII} />
        </span>
        <span
          className="hb-game-px hb-game-lantern"
          style={at(69, 27, { '--w': 7, '--h': 10 })}
        >
          <Sprite rows={LANTERN} />
        </span>
        <span
          className="hb-game-px hb-game-cursor"
          style={at(6, 57, { '--w': 7, '--h': 10 })}
        >
          <Sprite rows={CURSOR} />
        </span>
        <span className="hb-game-kiru">
          <span className="hb-game-hop">
            <span className="hb-game-run">
              <StaticSvg
                viewBox="0 0 72 16"
                shapeRendering="crispEdges"
                className="hb-game-strip"
              >
                <Pixels
                  map={KIRU.run.reduce(
                    (m, rows, f) => pixelPaths(rows, f * 18, 0, m),
                    new Map<string, string>()
                  )}
                />
              </StaticSvg>
            </span>
            <Sprite rows={KIRU.jump} className="hb-game-jump" />
            <Sprite rows={KIRU.win} className="hb-game-win" />
          </span>
        </span>
      </div>
    </div>
  );
}
