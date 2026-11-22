import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { apps, ARCADE_SLUGS, ARCADE_FEATURED_SLUG, ARCADE_ARCHIVE_SLUGS, BROOM_BLADE_ARCADE_SLUGS, ESCAPE_ROOM_SLUGS, type App } from '@/data/apps';
import Kanji from '@/components/brand/Kanji';
import PlayRooms from '@/components/nav/PlayRooms';
import Featured from './Featured';
import Cabinets, { ArrowIcon } from './Cabinets';
import MarketFX from './MarketFX';
import GuildHall from './guild/GuildHall';
import EscapeRooms from './escape/EscapeRooms';
import { LANTERNS, TICKER_INK, WIRE_PATH, ticker } from './market';
import './arcade.css';

export const metadata: Metadata = {
  title: 'Arcade',
  description:
    "Hand-built browser games: King of the Pole, tetherball against the kids from my story, up front as the featured game, Kiru and the Neo Dojo Cast, Kiru's Rooftop Run, a rhythm duel in pre-alpha, Cosmo moonboarding under a ringed giant planet and flying his ship from a canyon floor to orbit, forty buildings to bring down with a rocket launcher, Tumbler, ten 1928 bank vaults to crack, The Moon Pearl escape room in the Lantern Theater, and downstairs, Pip's Broom & Blade Arcade.",
};

/**
 * THE ARCADE — a neon night market (Shadow Dojo, October 2026).
 *
 * The big cabinet at the top is the featured game, ARCADE_FEATURED_SLUG
 * (./Featured): King of the Pole, a new release, since 2026-11-22 (Josh's
 * call). Tumbler stood there from 2026-11-17, and Kiru's Rooftop Run before
 * it; both are cabinets in the row now, Rooftop Run with its own page
 * (./rooftop-run), and the featured game is left out of the row.
 *
 * The line-up is ARCADE_SLUGS in src/data/apps.ts, in cabinet order (Josh's
 * call on the ordering): Kiru's games, then Neo Dojo Survivors, then Path Not
 * Taken, a rhythm duel in pre-alpha, then Cosmo's Moondrift, a 3D moonboarding
 * game, Cosmo Outbound, a 3D flight from a canyon to orbit and on to other
 * worlds, Rubble Rouser, a 3D demolition game whose forty buildings stand
 * and fall by their structure, Tumbler, a puzzle of ten 1928 vault doors
 * of geared rings (2026-11-16), and King of the Pole, tetherball against the
 * kids from the story of the same name (2026-11-22). Then the Lantern
 * Theater, the Escape
 * Rooms (./escape, ESCAPE_ROOM_SLUGS): a marquee, a stage that plays the night
 * of the theft as you scroll, and a lineup you can hear. Below it the page
 * goes downstairs into
 * the Broom & Blade Arcade (./guild, BROOM_BLADE_ARCADE_SLUGS): Pip's room,
 * where the page's theme turns from neon to firelight (docs/broom-blade-arcade.md).
 * Every other game is in the archive, /games/archive, behind the hall's cellar
 * door at the bottom. /about reads the same lists, so the pages can't drift.
 *
 * This page is a server component. What moves is CSS on the compositor —
 * the neon's rare flicker, the lanterns, the ticker, the hall's firelight —
 * and stops under reduced motion. The platform filter is native radio buttons
 * and :has(), so it costs no JavaScript either. The client code is small:
 * MarketFX (pauses the market's loops off screen),
 * and in the hall, HallFX, Pip's mouse hole and the machines' best scores.
 */

const byslug = (slugs: string[]) =>
  slugs.map((slug) => apps.find((app) => app.slug === slug)).filter((app): app is App => app !== undefined);
const games = byslug(ARCADE_SLUGS);
// The featured game has the big cabinet at the top, so it stays out of the row.
const featured = games.find((g) => g.slug === ARCADE_FEATURED_SLUG);
const cabinets = games.filter((g) => g !== featured);
const guild = byslug(BROOM_BLADE_ARCADE_SLUGS);
const rooms = byslug(ESCAPE_ROOM_SLUGS);
const archived = byslug(ARCADE_ARCHIVE_SLUGS);
// "Cloth Simulator and Broom & Blade", written out, so the
// door says what is behind it.
const ARCHIVE_NAMES = new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(archived.map((g) => g.name));

const TICKER = ticker(games.map((g) => g.name));

export default function Arcade() {
  const onPage = [...games, ...rooms, ...guild];
  const live = onPage.filter((g) => g.status === 'live').length;
  return (
    <>
      {/* The Play tab's two rooms: this one, and Videos. Above the market, in
          the site's own colours, because it is the site's nav, not the
          arcade's. (The market below keeps its indent: one wrapper, no churn.) */}
      <PlayRooms current="arcade" />
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

        {/* The featured cabinet (ARCADE_FEATURED_SLUG): King of the Pole, a new release. */}
        {featured && (
          <Featured
            game={featured}
            seal="王"
            screen="/images/apps/king-of-the-pole-3.webp"
            alt="King of the Pole: Marcus, a kid in a grey hoodie, hits the tetherball and a row of five balls swings round the pole toward a kid in a lime-green gi, on a school blacktop with four-square and hopscotch painted on it. The caption says “Decoys! Which one’s real?”"
            newRelease
          />
        )}
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
        <Cabinets games={cabinets} from="arcade" title="The cabinets" titleId="arc-cabinets" />
      </div>

      {/* The Lantern Theater, on the market: the Escape Rooms. */}
      <EscapeRooms rooms={rooms} />

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
    </>
  );
}
