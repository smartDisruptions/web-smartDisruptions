import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { apps, ARCADE_SLUGS, type App } from '@/data/apps';
import { builtHref } from '@/data/projects';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import RooftopRun from '@/components/arcade/RooftopRun';
import RooftopPoster from './Poster';
import { LANTERNS, TICKER_INK, WIRE_PATH, ticker } from './market';
import './arcade.css';

export const metadata: Metadata = {
  title: 'Arcade',
  description:
    "Hand-built browser games, including a kart racer my son Gabe built, plus Kiru's Rooftop Run: six levels set to music, playable right here on the page.",
};

/**
 * THE ARCADE — a neon night market (Shadow Dojo, October 2026).
 *
 * The line-up is ARCADE_SLUGS in src/data/apps.ts, in cabinet order (Josh's
 * call on the ordering); /apps reads the same list, so the two can't drift.
 *
 * This page is a server component. What moves is CSS on the compositor —
 * the neon's rare flicker, the lanterns, the ticker — and stops under reduced
 * motion. The platform filter is native radio buttons and :has(), so it costs
 * no JavaScript either. The only client code is the Rooftop Run cabinet's
 * Start button; the game itself is a separate chunk fetched by pressing it.
 */

const games: App[] = ARCADE_SLUGS.map((slug) => apps.find((app) => app.slug === slug)).filter(
  (app): app is App => app !== undefined,
);

const PLATFORMS = ['HTML5', 'PixiJS', 'Vanilla JavaScript', 'SVG', 'Web Audio API'];
const platforms = Array.from(new Set(games.flatMap((g) => g.techStack.filter((t) => PLATFORMS.includes(t)))));
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// One filter rule per platform, generated from the data so a new platform
// needs no CSS edit. Slugs are [a-z0-9-] only, so the selectors are safe.
const FILTER_CSS = platforms
  .map((p) => `.arc-games:has(#arc-p-${slug(p)}:checked) .arc-grid>li:not([data-p~="${slug(p)}"]){display:none}`)
  .join('');

// Each cabinet gets a tube colour, cycling like the old red / yellow / blue.
const TUBES = ['pink', 'amber', 'cyan'] as const;

const TICKER = ticker(games.map((g) => g.name));

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
    <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
  </svg>
);

export default function Arcade() {
  const live = games.filter((g) => g.status === 'live').length;
  return (
    <div className="arc">
      {/* The lantern string */}
      <div className="arc-lanterns" aria-hidden="true">
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
        <header className="arc-hero">
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
              <dd className="font-display arc-neon">{String(games.length).padStart(2, '0')}</dd>
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
        <section className="rr" aria-labelledby="rr-title">
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
      <div className="arc-ticker" aria-hidden="true">
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
        <section className="arc-games" aria-labelledby="arc-cabinets">
          <style dangerouslySetInnerHTML={{ __html: FILTER_CSS }} />
          <div className="arc-games-head">
            <h2 id="arc-cabinets" className="arc-h2 font-display">
              The cabinets
            </h2>
            {platforms.length > 1 && (
              <fieldset className="arc-filter">
                <legend className="sr-only">Show games built with</legend>
                <input type="radio" name="arc-platform" id="arc-p-all" defaultChecked />
                <label htmlFor="arc-p-all">All Worlds</label>
                {platforms.map((p) => (
                  <span key={p} className="contents">
                    <input type="radio" name="arc-platform" id={`arc-p-${slug(p)}`} />
                    <label htmlFor={`arc-p-${slug(p)}`}>{p}</label>
                  </span>
                ))}
              </fieldset>
            )}
          </div>

          {games.length > 0 ? (
            <ul className="arc-grid">
              {games.map((game, idx) => {
                const href = `${builtHref(game.slug)}?from=arcade`;
                return (
                  <li
                    key={game.slug}
                    className="sd-reveal"
                    data-p={game.techStack.filter((t) => PLATFORMS.includes(t)).map(slug).join(' ')}
                  >
                    <article className="arc-cab sd-tilt" data-tube={TUBES[idx % TUBES.length]}>
                      <div className="arc-cab-top">
                        <span className="arc-slot" aria-hidden="true" />
                        <span className="arc-lamp" data-status={game.status}>
                          {game.status === 'live' ? 'PLAY' : game.status.toUpperCase()}
                        </span>
                      </div>
                      {/* The screen links to the same page as the name; it is
                          skipped by keyboard and screen readers, which get the
                          name link instead. */}
                      <Link href={href} className="arc-screen" tabIndex={-1} aria-hidden="true">
                        <span className="arc-screen-in">
                          {/* eslint-disable-next-line @next/next/no-img-element -- small static thumbnails, sized by the screen box */}
                          <img
                            src={game.thumbnailUrl}
                            alt={`${game.name} screenshot`}
                            width={800}
                            height={420}
                            loading="lazy"
                            decoding="async"
                          />
                          <span className="arc-scan" />
                          <span className="arc-vig" />
                        </span>
                      </Link>
                      <h3 className="arc-name font-display">
                        <Link href={href}>{game.name}</Link>
                      </h3>
                      <p className="arc-desc">{game.description}</p>
                      <ul className="arc-tags" aria-label="Built with">
                        {game.techStack.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                      <div className="arc-deck">
                        {game.liveUrl && (
                          <a className="arc-play" href={game.liveUrl} target="_blank" rel="noopener noreferrer">
                            <PlayIcon />
                            Press Start
                            <span className="sr-only">: {game.name} (opens in a new tab)</span>
                          </a>
                        )}
                        <Link className="arc-more" href={href}>
                          Details
                          <span className="sr-only"> about {game.name}</span>
                          <ArrowIcon />
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="arc-end-gabe" style={{ marginTop: '3rem' }}>
              No games in this world. Insert another coin.
            </p>
          )}
        </section>

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
