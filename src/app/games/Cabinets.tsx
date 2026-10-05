import Link from 'next/link';
import type { App } from '@/data/apps';
import { builtHref } from '@/data/projects';

/**
 * A room of arcade cabinets. The Arcade's front room (/games) and its archive
 * (/games/archive) draw their cabinets with this one component, so the two
 * rooms can't drift apart.
 *
 * A server component: the platform filter is native radio buttons and :has(),
 * so it costs no JavaScript. `from` tags every cabinet's link (?from=arcade or
 * ?from=archive), and the game's page sends the visitor back to that room.
 */

const PLATFORMS = ['HTML5', 'PixiJS', 'Vanilla JavaScript', 'SVG', 'Web Audio API'];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Each cabinet gets a tube colour, cycling like the old red / yellow / blue.
const TUBES = ['pink', 'amber', 'cyan'] as const;

export const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
    <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
  </svg>
);

export default function Cabinets({
  games,
  from,
  title,
  titleId,
}: {
  games: App[];
  from: 'arcade' | 'archive';
  title: string;
  titleId: string;
}) {
  const platforms = Array.from(new Set(games.flatMap((g) => g.techStack.filter((t) => PLATFORMS.includes(t)))));
  // One filter rule per platform, generated from the data so a new platform
  // needs no CSS edit. Slugs are [a-z0-9-] only, so the selectors are safe.
  const filterCss = platforms
    .map((p) => `.arc-games:has(#arc-p-${slug(p)}:checked) .arc-grid>li:not([data-p~="${slug(p)}"]){display:none}`)
    .join('');

  return (
    <section className="arc-games" aria-labelledby={titleId}>
      <style dangerouslySetInnerHTML={{ __html: filterCss }} />
      <div className="arc-games-head">
        <h2 id={titleId} className="arc-h2 font-display">
          {title}
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
            const href = `${builtHref(game.slug)}?from=${from}`;
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
  );
}
