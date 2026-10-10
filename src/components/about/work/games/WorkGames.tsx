import Image from 'next/image';
import Link from 'next/link';
import type { App } from '@/data/apps';
import { builtHref } from '@/data/projects';
import Kiru from '@/components/kiru/Kiru';
import { Button } from '@/components/ui';
import { IconArrowRight } from '@/components/icons';
import { shotTransition, sizeOf } from '@/components/built/media';
import { WORK_IDS, games, pad } from '@/components/about/work/data';
import NeonSign from './NeonSign';
import RailFocus from './RailFocus';
import './games.css';

/**
 * The games (#games): the dojo's arcade back room, after dark.
 *
 * The page walks out of the paper hall and into a dark room lit by its
 * games. In both themes the room is night, like the footer and the Arcade
 * itself: by day that is a change of light, so the doorway is drawn rather
 * than cut. You come in under a ranma, the latticed transom over a Japanese
 * doorway, with the room's neon showing through it and spilling onto the
 * paper above; you leave over the sill, with the same light falling out
 * onto the paper below. Inside, a vertical neon sign, 遊戯場 ("a place to
 * play"), hangs on the wall with Kiru standing on top of it, thumbs on his
 * controller.
 *
 * The twelve games are small CRT screens in two rows that slide past in
 * opposite directions as the page scrolls — the reel from the old home
 * page, reborn as a row of arcade screens. It is a scroll-driven CSS
 * animation on each row's own view timeline: no JavaScript, one transformed
 * element per row, run by the compositor. Each row crosses its whole length
 * while it is fully on screen, so every game passes through view. Without
 * scroll timelines, or under reduced motion, the rows are swipe rails with
 * scroll-snap, and a row that holds keyboard focus turns into a rail too,
 * so a focused screen can always be scrolled fully into view (games.css,
 * and ./RailFocus for the last few pixels Chrome leaves to chance).
 *
 * Each screen opens the game's own page at /built/<slug> and carries the
 * view-transition name that page's hero shares, so the picture travels with
 * you. The Arcade (/games) is where they are played; the plaque at the end
 * of the room goes there. Order is the Arcade's own (data.ts), and every
 * word about a game comes from src/data/apps.ts.
 *
 * A server component. Its only client code is RailFocus, one focus listener
 * that renders nothing. The only loop is the sign's rare flicker, which runs
 * while Kiru is on screen and holds still while the page scrolls (his
 * `data-live` and `data-hold`, set by SiteFX). Styles: ./games.css (wk-gm-).
 */

/** The arcade colours, one per screen in turn, for the neon rims. */
const TUBES = ['red', 'yellow', 'blue'] as const;

/**
 * A screen shows at most ~280px of picture (games.css: the screen width at
 * each breakpoint, less the bezel), so this is all a phone ever downloads.
 */
const SHOT_SIZES = '(min-width: 64rem) 280px, (min-width: 40rem) 240px, 176px';

/**
 * The plate under each screen: the game's name and a short label. A name
 * that ends in a stage in brackets ("Path Not Taken (Pre Alpha)") shows the
 * stage as its label; every other game shows what it is ("Game",
 * "Simulation").
 */
function plateOf(game: App): { name: string; label: string } {
  const staged = /^(.*\S)\s*\(([^)]+)\)$/.exec(game.name);
  return staged
    ? { name: staged[1], label: staged[2] }
    : { name: game.name, label: game.category };
}

function Screen({ game, n }: { game: App; n: number }) {
  const { name, label } = plateOf(game);
  const [w, h] = sizeOf(game.thumbnailUrl);
  return (
    <li>
      <Link
        href={builtHref(game.slug)}
        prefetch={false}
        className="wk-gm-cab"
        data-tube={TUBES[(n - 1) % TUBES.length]}
      >
        <div className="wk-gm-screen" style={shotTransition(game.slug)}>
          {/* The name on the plate is the link's text; the picture repeats
              it, so it is not read out twice. */}
          <Image
            src={game.thumbnailUrl}
            alt=""
            width={w}
            height={h}
            sizes={SHOT_SIZES}
            loading="lazy"
            draggable={false}
            className="wk-gm-shot"
          />
          <span className="wk-gm-glass" aria-hidden="true" />
        </div>
        <div className="wk-gm-plate">
          <h3 className="wk-gm-name font-display">{name}</h3>
          <p className="wk-gm-label">
            <span aria-hidden="true">{pad(n)} · </span>
            {label}
          </p>
        </div>
      </Link>
    </li>
  );
}

export default function WorkGames() {
  const half = Math.ceil(games.length / 2);
  const rows = [games.slice(0, half), games.slice(half)];

  return (
    <section
      id={WORK_IDS.games}
      aria-labelledby="wk-gm-h"
      className="wk-gm scroll-mt-20"
    >
      <RailFocus id={WORK_IDS.games} />
      <div className="wk-gm-ranma" aria-hidden="true" />

      <div className="wk-gm-room">
        <div className="wk-gm-head mx-auto max-w-6xl px-5 sm:px-6">
          <div className="wk-gm-copy">
            <p className="sd-kicker">The arcade</p>
            <h2
              id="wk-gm-h"
              className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl"
            >
              Games I built
            </h2>
            <p className="font-read mt-5 max-w-[52ch] text-lg leading-[1.7] text-text-secondary">
              {games.length} games. All of them free, and all of them play in
              your browser.
            </p>
          </div>
          <div className="wk-gm-sign" aria-hidden="true">
            <Kiru pose="game" className="wk-gm-kiru" />
            <div className="wk-gm-sign-box">
              <NeonSign className="wk-gm-neon" />
            </div>
          </div>
        </div>

        <div className="wk-gm-reel">
          {rows.map((row, r) => (
            <ul
              key={r}
              className={`wk-gm-row${r ? ' wk-gm-rev' : ''}`}
              role="list"
            >
              {row.map((game, i) => (
                <Screen key={game.slug} game={game} n={r * half + i + 1} />
              ))}
            </ul>
          ))}
        </div>

        <div className="wk-gm-end mx-auto max-w-6xl px-5 sm:px-6">
          <div className="wk-gm-plaque">
            <p className="wk-gm-led">
              <span className="wk-gm-led-k">Games</span>{' '}
              <span className="wk-gm-led-n font-display">{games.length}</span>
            </p>
            <div className="wk-gm-cta">
              <p className="wk-gm-cta-t font-display">
                All the games are in one place
              </p>
              <p className="wk-gm-cta-p font-read">
                The Arcade has every one of them. Pick one and press start.
              </p>
            </div>
            <Button href="/games" size="lg" className="wk-gm-go">
              Go to the Arcade
              <IconArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="wk-gm-sill" aria-hidden="true" />
    </section>
  );
}
