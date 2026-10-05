import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { apps, ARCADE_SLUGS, ARCADE_ARCHIVE_SLUGS, BROOM_BLADE_ARCADE_SLUGS, type App } from '@/data/apps';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import RooftopRun from '@/components/arcade/RooftopRun';
import RooftopPoster from './Poster';
import Cabinets, { ArrowIcon } from './Cabinets';
import MarketFX from './MarketFX';
import GuildHall from './guild/GuildHall';
import { LANTERNS, TICKER_INK, WIRE_PATH, ticker } from './market';
import './arcade.css';

export const metadata: Metadata = {
  title: 'Arcade',
  description:
    "Hand-built browser games: Kiru and the Neo Dojo Cast, Kiru's Rooftop Run playable right here on the page, a rhythm duel in pre-alpha, and downstairs, Pip's Broom & Blade Arcade.",
};

/**
 * THE ARCADE — a neon night market (Shadow Dojo, October 2026).
 *
 * The line-up is ARCADE_SLUGS in src/data/apps.ts, in cabinet order (Josh's
 * call on the ordering): Kiru's games, then Neo Dojo Survivors, then Path Not
 * Taken, a rhythm duel in pre-alpha. Every other game is in the archive,
 * /games/archive, behind the door at the bottom of the page. /built reads the same lists, so the pages can't drift.
 *
 * This page is a server component. What moves is CSS on the compositor —
 * the neon's rare flicker, the lanterns, the ticker — and stops under reduced
 * motion. The platform filter is native radio buttons and :has(), so it costs
 * no JavaScript either. The only client code is the Rooftop Run cabinet's
 * Start button; the game itself is a separate chunk fetched by pressing it.
 */

const byslug = (slugs: string[]) =>
  slugs.map((slug) => apps.find((app) => app.slug === slug)).filter((app): app is App => app !== undefined);
const games = byslug(ARCADE_SLUGS);
const guild = byslug(BROOM_BLADE_ARCADE_SLUGS);
const archived = byslug(ARCADE_ARCHIVE_SLUGS);
// "The Pembroke File, Cloth Simulator … and AUREUM Snake", written out, so the
// door says what is behind it.
const ARCHIVE_NAMES = new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(archived.map((g) => g.name));

const TICKER = ticker(games.map((g) => g.name));

export default function Arcade() {
  const onPage = [...games, ...guild];
  const live = onPage.filter((g) => g.status === 'live').length;
  return (
    <div className="arc">
      <MarketFX />
      {/* The lantern string */}
      <div className="arc-lanterns" aria-hidden="true" data-market="">
        <svg className="arc-wire" viewBox="0 0 1000 72" preserveAspectRatio="none">
          <path d={WIRE_PATH} fill="none" stroke="#2c2a3c" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        {LANTERNS.map((l) => (
          <span
            key={l.x}
            className="arc-lantern"
            data-gold={l.gold ? '' : undefined}
            data-wide={l.wide ? '' : undefined}
            style={{ left: `${l.x}%`, top: `${l.y}px`, '--sway': l.sway, '--delay': l.delay } as CSSProperties}
          />
        ))}
      </div>

      <div className="arc-wrap">
        <header className="arc-hero" data-market="">
          <Kanji char="遊" className="arc-watermark" />
          <p className="arc-kicker">★ Player One ★</p>
          <h1 className="arc-title font-display">
            <span className="arc-neon arc-flicker">Arcade</span>
          </h1>
          <p className="arc-lead font-read">
            A cabinet of hand-built games — pixels, physics, and chain-scored chaos. Insert coin. Press start.
          </p>
          <dl className="arc-stats">
            <div className="arc-stat">
              <dt>Games</dt>
              <dd className="font-display arc-neon">{String(onPage.length).padStart(2, '0')}</dd>
            </div>
            <div className="arc-stat" style={{ '--tube': 'var(--arc-amber)' } as CSSProperties}>
              <dt>Live</dt>
              <dd className="font-display arc-neon" data-tube="amber">
                {String(live).padStart(2, '0')}
              </dd>
            </div>
            <div className="arc-stat" style={{ '--tube': 'var(--arc-cyan)' } as CSSProperties}>
              <dt>Credits</dt>
              <dd className="font-display arc-neon" data-tube="cyan">
                ∞
              </dd>
            </div>
          </dl>
          {/* The page kanji, 遊 (play), bent in neon tube. */}
          <div className="arc-sign" aria-hidden="true">
            <div className="arc-sign-box arc-flicker-b">
              <Kanji char="遊" draw className="arc-sign-kanji" />
              <p className="arc-sign-word arc-neon" data-tube="cyan">
                Asobi
              </p>
            </div>
          </div>
        </header>

        {/* Free play: Kiru's Rooftop Run */}
        <section className="rr" aria-labelledby="rr-title" data-market="">
          <Kiru pose="game" className="rr-kiru" />
          <div className="rr-cab">
            <div className="rr-marquee">
              <Seal char="速" className="rr-seal" />
              <div>
                <p className="rr-kick">
                  Free play<span className="rr-kick-more"> · plays right here</span>
                </p>
                <h2 id="rr-title" className="rr-title font-display arc-neon" data-tube="red">
                  Kiru&apos;s Rooftop Run
                </h2>
              </div>
            </div>
            <div className="rr-bezel">
              <RooftopRun poster={<RooftopPoster />} helpId="rr-help" />
            </div>
            <div className="rr-deck">
              <p className="rr-blurb">
                Kiru runs the rooftops of the town below. I built six levels for him, each one timed to its own
                song, and six ways to move through them: run, kite, roll, parasol, dragon and shadow step. Practice
                mode lets you drop checkpoints, every level hides three secret scrolls, and Classic, the endless run
                this cabinet started with, is still on the menu. Nothing about the game loads until you press Start.
              </p>
              <p id="rr-help" className="rr-keys">
                <span className="rr-kbd">
                  <kbd>Space</kbd> or{' '}
                  <kbd>
                    <span aria-hidden="true">↑</span>
                    <span className="sr-only">Up arrow</span>
                  </kbd>{' '}
                  to jump
                </span>
                <span className="rr-touch">Tap to jump</span>
                <span>hold to keep jumping, or to climb</span>
                <span className="rr-kbd">
                  <kbd>P</kbd> pause
                </span>
                <span className="rr-kbd">
                  <kbd>M</kbd> sound
                </span>
                <span className="rr-kbd">
                  practice: <kbd>C</kbd> / <kbd>X</kbd> checkpoints
                </span>
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* The ticker */}
      <div className="arc-ticker" aria-hidden="true" data-market="">
        <div className="arc-ticker-track" style={{ '--arc-ticker-s': `${TICKER.seconds}s` } as CSSProperties}>
          {['a', 'b'].map((k) => (
            <div key={k} className="arc-ticker-seg">
              {TICKER.items.map((t, i) => (
                <span
                  key={`${k}-${i}`}
                  className="arc-ticker-item"
                  style={{
                    color: TICKER_INK[i % 3],
                    textShadow: `0 0 10px color-mix(in srgb, ${TICKER_INK[i % 3]} 55%, transparent)`,
                  }}
                >
                  ▸ {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="arc-wrap">
        <Cabinets games={games} from="arcade" title="The cabinets" titleId="arc-cabinets" />
      </div>

      {/* Downstairs: the Broom & Blade Arcade, Pip's room, and below it the
          door to the back room (every older cabinet, still playable). */}
      <GuildHall
        games={guild}
        door={
          archived.length > 0 && (
            <Link href="/games/archive" className="gh-door">
              <span className="gh-door-card">
                <span className="gh-door-kick">The back room</span>
                <span className="gh-door-title font-display">The archive</span>
                <span className="gh-door-line">
                  {archived.length} older cabinets, still free to play: {ARCHIVE_NAMES}.
                </span>
                <span className="gh-door-go">
                  Open the archive
                  <ArrowIcon />
                </span>
              </span>
            </Link>
          )
        }
      />

      <div className="arc-wrap">
        <div className="arc-end">
          <p className="arc-end-line">
            <span style={{ color: 'var(--arc-pink-ink)' }}>──</span>{' '}
            <span style={{ color: 'var(--arc-amber-ink)' }}>High Score Table</span>{' '}
            <span style={{ color: 'var(--arc-cyan-ink)' }}>— Cabinet #1 —</span>{' '}
            <span style={{ color: 'var(--arc-pink-ink)' }}>──</span>
          </p>
          <p className="arc-end-gabe">❤️ Built for Gabe.</p>
        </div>
      </div>
    </div>
  );
}
