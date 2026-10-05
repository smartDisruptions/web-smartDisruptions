import type { CSSProperties, ReactNode } from 'react';
import type { App } from '@/data/apps';
import Kiru from '@/components/kiru/Kiru';
import Pip, { PipDefs } from '@/components/pip/Pip';
import GuildMachines from './GuildMachines';
import HallFX from './HallFX';
import MouseHole from './MouseHole';
import { BannerArt, DoorFrameArt, DoorLeafArt, FloorArt, HallDefs, SIGN_BULBS, SignArt, StairArt } from './art';
import {
  AWNING_BULBS,
  FESTOON_PHONE,
  FESTOON_SAG,
  FESTOON_WIDE,
  MOTES,
  STAIR_PHONE,
  STAIR_WIDE,
  festoonWire,
  stairArt,
  type Hung,
  type Stair,
} from './scene';
import './guild.css';
import './loops.css';

/**
 * THE BROOM & BLADE ARCADE — the last room on /games, above the archive's
 * door (Josh's call, 2026-10-05). Downstairs from the neon night market: the
 * Broom & Blade guild hall's cellar arcade, after dark. Pip hosts.
 *
 * The page changes theme on the way down, and all of it is the compositor's
 * work (DESIGN.md): scroll timelines (`animation-timeline: view()`) light the
 * stair's torches one by one, fade the neon's spill and wash the screen in
 * firelight (a fixed layer, .gh-tint); the loops (torch flicker, the
 * signboard's chasing bulbs, dust in the light) run only while their part of
 * the room is on screen (HallFX sets [data-live]). Opacity and transform
 * only. Browsers without scroll timelines get the finished room, lit; reduced
 * motion stops every loop.
 *
 * Two tiny client islands: HallFX (liveness, and the phone's toolbar taking
 * the cellar's colour) and MouseHole (bonk Pip). Everything else is server
 * HTML, CSS and static SVG (art.tsx), its geometry worked out in scene.ts.
 *
 * The room's id is a contract: the five games link back to
 * /games#broom-blade-arcade.
 */

const vars = (o: Record<string, string | number>) => o as CSSProperties;
const pc = (n: number, of: number) => `${Math.round((n / of) * 10000) / 100}%`;

/**
 * A wall torch: an iron sconce (SVG) and a flame in three layers (HTML). The
 * layers flicker as one group, the halo breathes, two sparks rise; a torch's
 * variant (a, b or c) gives it its own beats on the shared clock, so no two
 * neighbours flicker alike and nothing is offset in time (loops.css).
 */
function Torch({ v, className, style }: { v: 'a' | 'b' | 'c'; className?: string; style?: CSSProperties }) {
  return (
    <span className={`gh-torch ${className ?? ''}`} style={style} aria-hidden="true">
      <svg className="gh-sconce" viewBox="-30 -6 60 60" focusable="false">
        <use href="#gh-sconce" />
      </svg>
      <span className="gh-fire">
        <span className="gh-halo gh-loop" data-v={v} />
        <span className="gh-burn gh-loop" data-v={v}>
          <span className="gh-flame gh-flame-a" />
          <span className="gh-flame gh-flame-b" />
          <span className="gh-flame gh-flame-c" />
        </span>
        <span className="gh-embers gh-loop" data-v={v}>
          <span className="gh-ember" />
          <span className="gh-ember gh-ember-b" />
        </span>
      </span>
    </span>
  );
}

const TORCH_V = ['a', 'b', 'c', 'a'] as const;

/** The stair down from the neon, in its phone or its wide drawing. */
function StairScene({ s, variant }: { s: Stair; variant: 'phone' | 'wide' }) {
  const a = stairArt(s);
  const at = (x: number, y: number) => vars({ '--x': pc(x, s.w), '--y': pc(y, s.h) });
  // Kiru's bow drawing is a 240-unit square with his feet 232 units down.
  const k = s.kiru;
  const kiru = vars({
    left: pc(k.x - k.w / 2, s.w),
    top: pc(s.y0 - (k.w * 232) / 240, s.h),
    width: pc(k.w, s.w),
  });
  const n = s.neon;
  return (
    <div className={`gh-stair-box gh-stair-${variant}`} style={vars({ aspectRatio: `${s.w} / ${s.h}` })}>
      <div className="gh-pools">
        {a.torches.map((t) => (
          <span key={t.x} className="gh-pool" style={at(t.x, t.y)} />
        ))}
      </div>
      <StairArt s={s} className="gh-stair-art" />
      {a.torches.map((t, i) => (
        <Torch key={t.x} v={TORCH_V[i % 4]} className="gh-stair-torch" style={at(t.x, t.y)} />
      ))}
      {/* The last neon of the night market, hung at the top of the stair. */}
      <div
        className="gh-neon"
        style={vars({ left: pc(n.x, s.w), top: pc(n.y, s.h), width: pc(n.w, s.w), height: pc(n.h, s.h) })}
      >
        <span className="gh-neon-sub arc-neon" data-tube="amber">
          Guild arcade
        </span>
        <span className="gh-neon-main arc-neon gh-loop">Downstairs</span>
        <svg className="gh-neon-arrow" viewBox="0 0 40 40" focusable="false">
          <path d="M8 8 L30 30 M30 14 V30 H14" />
        </svg>
      </div>
      {/* Kiru hosts the night market; here he hands over to Pip. He waves
          as the stair comes up, and bows as you start down it. */}
      <div className="gh-kiru" style={kiru}>
        <Kiru pose="wave" still className="gh-kiru-wave" />
        <Kiru pose="bow" still className="gh-kiru-bow" />
      </div>
    </div>
  );
}

/** A string of warm bulbs with pennants between them, swagged across. */
function Festoon({ items, swags, className }: { items: Hung[]; swags: number; className: string }) {
  const at = (h: Hung) => vars({ left: `${h.x}%`, top: `${h.y}px`, rotate: `${h.tilt}deg` });
  return (
    <div className={`gh-festoon ${className}`} aria-hidden="true">
      <svg
        className="gh-wire"
        viewBox={`0 0 ${swags * 100} ${FESTOON_SAG * 2}`}
        preserveAspectRatio="none"
        focusable="false"
      >
        <path d={festoonWire(swags)} />
      </svg>
      {items
        .filter((h) => h.kind === 'flag')
        .map((h) => (
          <span key={h.i} className="gh-flag" data-c={h.c} style={at(h)} />
        ))}
      {[0, 1].map((g) => (
        <span key={g} className="gh-festoon-g gh-loop" data-g={g}>
          {items
            .filter((h) => h.kind === 'bulb' && h.c === g)
            .map((h) => (
              <span key={h.i} className="gh-light" style={at(h)} />
            ))}
        </span>
      ))}
    </div>
  );
}

export default function GuildHall({
  games,
  door,
}: {
  games: App[];
  /** The link to /games/archive (the page owns its copy). The hall hangs it
      on a cellar door: its ::before stretches over the doorway, so the whole
      door is the link, and the door swings open when it is hovered or
      focused. */
  door?: ReactNode;
}) {
  return (
    <div className="gh-world">
      <HallFX />
      <HallDefs />
      {/* Firelight over the whole window while the hall is here: it rises as
          the stair goes by and fades as the door does. Fixed, opacity only. */}
      <div className="gh-tint" aria-hidden="true">
        <div className="gh-tint-in" />
      </div>

      {/* ── The threshold: the stair down from the neon ── */}
      <div className="gh-stair" data-gh-zone aria-hidden="true">
        <span className="gh-spill" />
        <StairScene s={STAIR_PHONE} variant="phone" />
        <StairScene s={STAIR_WIDE} variant="wide" />
      </div>

      <section id="broom-blade-arcade" className="gh" aria-labelledby="gh-title">
        <PipDefs />

        {/* The ceiling: an oak beam and a carnival awning, red and cream
            like the booths' in the games, a bulb at every scallop's tip. */}
        <div className="gh-ceiling" data-gh-zone aria-hidden="true">
          <div className="gh-beam" />
          <div className="gh-awning" />
          {[0, 1].map((g) => (
            <span key={g} className="gh-awning-g gh-loop" data-g={g}>
              {AWNING_BULBS.filter((b) => b.g === g).map((b) => (
                <span key={b.k} style={vars({ '--k': b.k })} />
              ))}
            </span>
          ))}
        </div>

        {/* The sign, Pip on it, and what the room is. */}
        <header className="gh-head" data-gh-zone>
          <div className="gh-walllight" aria-hidden="true" />
          <div className="gh-banner gh-banner-l gh-loop" aria-hidden="true">
            <BannerArt />
          </div>
          <div className="gh-banner gh-banner-r gh-loop" aria-hidden="true">
            <BannerArt />
          </div>
          <Torch v="b" className="gh-head-torch gh-head-torch-l" />
          <Torch v="c" className="gh-head-torch gh-head-torch-r" />
          <div className="gh-sign">
            {/* Dust in the torchlight, in the air around the board (behind
                it, and never behind any text). */}
            <div className="gh-motes" aria-hidden="true">
              {[0, 1, 2].map((g) => (
                <span key={g} className="gh-motes-g gh-loop" data-g={g}>
                  {MOTES.filter((_, i) => i % 3 === g).map((m) => (
                    <span
                      key={`${m.x}-${m.y}`}
                      style={vars({ left: `${m.x}%`, top: `${m.y}%`, '--s': `${m.s}px` })}
                    />
                  ))}
                </span>
              ))}
            </div>
            <div className="gh-sign-drop">
              <div className="gh-sign-swing gh-loop">
                <span className="gh-chain gh-chain-l" aria-hidden="true" />
                <span className="gh-chain gh-chain-r" aria-hidden="true" />
                <div className="gh-board">
                  <h2 id="gh-title" className="gh-title">
                    <span className="sr-only">The Broom &amp; Blade Arcade</span>
                    <SignArt />
                  </h2>
                  <div className="gh-bulbs" aria-hidden="true">
                    {[0, 1, 2].map((g) => (
                      <span key={g} className="gh-bulbs-g gh-loop" data-g={g}>
                        {SIGN_BULBS.filter((b) => b.g === g).map((b) => (
                          <span key={`${b.x}-${b.y}`} style={vars({ left: `${b.x}%`, top: `${b.y}%` })} />
                        ))}
                      </span>
                    ))}
                  </div>
                  {/* Pip, sitting on the board's top edge (his seat, y = 150 of
                      200, on the edge). */}
                  <div className="gh-sitter">
                    <Pip pose="sit" className="gh-sitter-pip" />
                    <p className="gh-bubble gh-bubble-hi">
                      Hi! I&apos;m Pip. Shoot!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="gh-kicker">
            <span aria-hidden="true">★ </span>Downstairs · five machines<span aria-hidden="true"> ★</span>
          </p>
          <p className="gh-lead font-read">
            I built Broom &amp; Blade for my family. Our chores hang as quests on a board in a candlelit guild hall,
            and a finished chore earns tickets. At home, a ticket buys a round. Here, every round is free.
          </p>
          <p className="gh-ticket">
            <span className="gh-ticket-big">Admit one</span>
            <span className="gh-ticket-line">No ticket needed. It&apos;s Pip&apos;s treat.</span>
          </p>
        </header>

        {/* The floor: the machines stand on it, against the wall. */}
        <div className="gh-floor" data-gh-zone>
          <Festoon items={FESTOON_WIDE} swags={3} className="gh-festoon-wide" />
          <Festoon items={FESTOON_PHONE} swags={2} className="gh-festoon-phone" />
          <div className="gh-machines">
            <GuildMachines games={games} />
          </div>
          <div className="gh-ground" aria-hidden="true">
            <div className="gh-baseboard" />
            <FloorArt id="room" />
          </div>
        </div>
      </section>

      {/* ── The way out: the archive's door, back up into the night ── */}
      <div className="gh-exit" data-gh-zone>
        <div className="gh-doorway">
          <div className="gh-door-spot">
            <span className="gh-door-way" aria-hidden="true">
              {/* The one neon sign in the hall, over the way back up. */}
              <span className="gh-door-neon">
                <span className="arc-neon" data-tube="cyan">
                  Archive
                </span>
              </span>
              <DoorFrameArt />
              <span className="gh-door-leaf">
                <DoorLeafArt />
              </span>
              <Torch v="c" className="gh-door-torch gh-door-torch-l" />
              <Torch v="a" className="gh-door-torch gh-door-torch-r" />
            </span>
            {/* Pip's own way in, a mouse hole beside the big door: he waves
                you off from it. In Whack-a-Dust-Bunny you must not bonk him;
                here you can. */}
            <div className="gh-hole-spot">
              <MouseHole
                rest={<Pip pose="wave" flip className="gh-hole-pipsvg" />}
                flinch={<Pip pose="hide" mood="closed" flip className="gh-hole-pipsvg" />}
              />
            </div>
          </div>
          {door}
        </div>
        <div className="gh-exit-floor" aria-hidden="true">
          <FloorArt id="exit" />
        </div>
      </div>
    </div>
  );
}
