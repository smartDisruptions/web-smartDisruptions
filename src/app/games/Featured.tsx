import Link from 'next/link';
import type { App } from '@/data/apps';
import { builtHref } from '@/data/projects';
import Kiru from '@/components/kiru/Kiru';
import { Seal } from '@/components/brand/Kanji';
import { ArrowIcon } from './Cabinets';

/**
 * The Arcade's featured cabinet: the one big machine at the top of /games.
 * Which game stands here is ARCADE_FEATURED_SLUG in src/data/apps.ts, and the
 * page leaves that game out of the row below so it isn't listed twice.
 *
 * Kiru's Rooftop Run stood here, playable on the page, until 2026-11-17, when
 * Tumbler took the spot as a new release (Josh's call). A featured game opens
 * on its own page, like every cabinet in the row. No client code: the screen
 * is a picture and a link.
 */
export default function Featured({
  game,
  seal,
  screen,
  newRelease,
}: {
  game: App;
  /** The kanji on the marquee's seal. */
  seal: string;
  /** The picture on the screen: wide, with what matters in the middle. */
  screen: string;
  newRelease?: boolean;
}) {
  const details = `${builtHref(game.slug)}?from=arcade`;
  return (
    <section id="featured" className="rr ft" aria-labelledby="ft-title" data-market="">
      <Kiru pose="game" className="rr-kiru" />
      <div className="rr-cab">
        <div className="rr-marquee">
          <Seal char={seal} className="rr-seal" />
          <div className="ft-head">
            <p className="ft-labels">
              <span className="ft-label">★ Featured game</span>
              {newRelease && <span className="ft-label ft-new">New release</span>}
            </p>
            <h2 id="ft-title" className="rr-title font-display arc-neon" data-tube="amber">
              {game.name}
            </h2>
          </div>
        </div>
        <div className="rr-bezel">
          <div className="rr-screen">
            <div className="rr-poster">
              {/* eslint-disable-next-line @next/next/no-img-element -- one static screenshot, sized by the screen box */}
              <img
                className="rr-poster-art ft-art"
                src={screen}
                alt={`${game.name}: a brass and gold vault door of geared rings`}
                width={1600}
                height={900}
                fetchPriority="high"
                decoding="async"
              />
              <span className="rr-poster-scan" />
              {game.liveUrl && (
                <>
                  <a className="rr-poster-hit" href={game.liveUrl} tabIndex={-1} aria-hidden="true" />
                  <div className="rr-start-wrap ft-start-wrap">
                    <a className="rr-start" href={game.liveUrl}>
                      <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
                        <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
                      </svg>
                      Press Start
                      <span className="sr-only">: play {game.name}</span>
                    </a>
                    <p className="rr-hint rr-blink" aria-hidden="true">
                      Free play
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="rr-glass" aria-hidden="true" />
          </div>
        </div>
        <div className="rr-deck">
          <p className="rr-blurb">{game.description}</p>
          <div className="ft-foot">
            <ul className="arc-tags" aria-label="Built with">
              {game.techStack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <Link className="arc-more" href={details}>
              Details
              <span className="sr-only"> about {game.name}</span>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
