'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { filmFile, runTime, type Film } from '@/data/films';

/**
 * The screening room: one screen, the film that's on, and the programme.
 *
 * There is a single <video>, so the page holds one player however many films
 * it lists, and nothing is fetched until a film is played (preload="none").
 * Its src is set by hand, never by React: re-rendering the same src would
 * reload the film mid-play. A film starts inside the click that asked for it,
 * because phones only let sound play from a tap.
 *
 * Before the first play the screen is the film's frame as a sized image (640
 * or 1280 wide, picked by the browser), with the play button on it: on a
 * phone that's a small download, and it's the page's first big paint. The
 * video's own poster is the 640 frame, so a phone fetches that frame once. Each
 * reel is a link to the film's file, so without JavaScript it still plays,
 * in the browser's own player.
 */
export default function Theatre({ films }: { films: Film[] }) {
  const [cur, setCur] = useState(0);
  const [started, setStarted] = useState(false);
  const [playAll, setPlayAll] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const n = films.length;
  const f = films[cur];

  function load(i: number) {
    const v = video.current;
    if (!v) return;
    v.src = filmFile(films[i], 'film.mp4');
    v.poster = filmFile(films[i], 'thumb.webp');
    setCur(i);
    history.replaceState(null, '', `#${films[i].slug}`);
  }

  function play(i: number) {
    const v = video.current;
    if (!v) return;
    i = (i + n) % n;
    if (i !== cur) load(i);
    setStarted(true);
    v.play().catch(() => {});
  }

  // A link to /films#slug opens on that film (it doesn't start by itself).
  useEffect(() => {
    const i = films.findIndex((x) => `#${x.slug}` === window.location.hash);
    if (i > 0) load(i);
    // Once, on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(e: MouseEvent<HTMLAnchorElement>, i: number) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    e.preventDefault();
    play(i);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    screen.current?.scrollIntoView({
      block: 'center',
      behavior: still ? 'auto' : 'smooth',
    });
  }

  return (
    <>
      <section className="fm-theatre" aria-label="Now showing">
        <div ref={screen} className="fm-screen sd-print">
          <video
            ref={video}
            className="fm-video"
            controls
            playsInline
            preload="none"
            width={1280}
            height={720}
            src={filmFile(films[0], 'film.mp4')}
            poster={filmFile(films[0], 'thumb.webp')}
            aria-label={`${f.title}, a short film, ${runTime(f.seconds)}`}
            onEnded={() => {
              if (playAll && cur < n - 1) play(cur + 1);
            }}
          />
          {!started && (
            <button
              type="button"
              className="fm-start"
              onClick={() => play(cur)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a sized
                  WebP pair; next/image would add a request hop for nothing. */}
              <img
                src={filmFile(f, 'thumb.webp')}
                srcSet={`${filmFile(f, 'thumb.webp')} 640w, ${filmFile(f, 'poster.webp')} 1280w`}
                sizes="(min-width: 60rem) 46rem, 100vw"
                width={1280}
                height={720}
                alt=""
                fetchPriority="high"
                decoding="async"
              />
              <span className="fm-play" aria-hidden="true" />
              <span className="sr-only">Play {f.title}</span>
            </button>
          )}
        </div>

        <div className="fm-now">
          <p className="sd-kicker">
            Now showing &middot; {String(cur + 1).padStart(2, '0')} of{' '}
            {String(n).padStart(2, '0')}
          </p>
          <h2 className="fm-h2 font-display" aria-live="polite">
            {f.title}
          </h2>
          <p className="fm-meta">
            {f.style} &middot; {runTime(f.seconds)}
          </p>
          <p className="fm-line">{f.line}</p>
          <p className="fm-about font-read">{f.about}</p>
          <div className="fm-controls">
            <button
              type="button"
              className="fm-btn"
              onClick={() => play(cur - 1)}
            >
              <span aria-hidden="true">&larr;</span> Previous
            </button>
            <button
              type="button"
              className="fm-btn"
              onClick={() => play(cur + 1)}
            >
              Next <span aria-hidden="true">&rarr;</span>
            </button>
            <button
              type="button"
              className="fm-btn"
              aria-pressed={playAll}
              onClick={() => setPlayAll((p) => !p)}
            >
              Play all
            </button>
          </div>
        </div>
      </section>

      <section className="fm-programme" aria-labelledby="fm-programme-h">
        <h2 id="fm-programme-h" className="fm-h3">
          The programme
        </h2>
        <ol className="fm-reels" role="list">
          {films.map((x, i) => (
            <li key={x.slug}>
              <a
                href={filmFile(x, 'film.mp4')}
                className="fm-reel sd-card"
                aria-current={i === cur ? 'true' : undefined}
                aria-label={`Play ${x.title}, ${x.style}, ${runTime(x.seconds)}`}
                onClick={(e) => pick(e, i)}
              >
                <span className="fm-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
                  <img
                    src={filmFile(x, 'thumb.webp')}
                    width={640}
                    height={360}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="fm-no">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="fm-len">{runTime(x.seconds)}</span>
                </span>
                <span className="fm-reel-text">
                  <span className="fm-style">{x.style}</span>
                  <span className="fm-title">{x.title}</span>
                  <span className="fm-reel-line">{x.line}</span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
