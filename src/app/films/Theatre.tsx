'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { filmFile, runTime, totalSeconds, type FilmModel } from '@/data/films';

/**
 * The screening room, by model: pick the Claude model, then one screen with
 * the film that's on, the programme, what that model was asked, how its films
 * were made, and its numbers. Switching model swaps all of it, which is the
 * comparison: same kind of ask, different model.
 *
 * There is a single <video>, so the page holds one player however many films
 * and models it lists, and nothing is fetched until a film is played
 * (preload="none"). Its src is set by hand, never by React: re-rendering the
 * same src would reload the film mid-play. A film starts inside the tap that
 * asked for it, because phones only let sound play from a tap.
 *
 * Before the first play the screen is the film's frame as a sized image (640
 * or 1280 wide, picked by the browser), with the play button on it: on a
 * phone that's a small download, and it's the page's first big paint. The
 * video's own poster is the 640 frame, so a phone fetches that frame once.
 * Each reel is a link to the film's file, so without JavaScript it still
 * plays, in the browser's own player.
 *
 * Links: /films#<model> opens that model's set, /films#<model>/<film> that
 * film. Neither starts playing by itself.
 */
export default function Theatre({ models }: { models: FilmModel[] }) {
  const [mi, setMi] = useState(0);
  const [cur, setCur] = useState(0);
  const [started, setStarted] = useState(false);
  const [playAll, setPlayAll] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const model = models[mi];
  const films = model.films;
  const n = films.length;
  const f = films[cur];
  const two = (k: number) => String(k).padStart(2, '0');

  function load(m: number, i: number) {
    const v = video.current;
    if (!v) return;
    const x = models[m].films[i];
    v.src = filmFile(x, 'film.mp4');
    v.poster = filmFile(x, 'thumb.webp');
    setMi(m);
    setCur(i);
    history.replaceState(null, '', `#${models[m].id}/${x.slug}`);
  }

  function play(i: number) {
    const v = video.current;
    if (!v) return;
    i = (i + n) % n;
    if (i !== cur) load(mi, i);
    setStarted(true);
    v.play().catch(() => {});
  }

  function pickModel(m: number) {
    if (m === mi) return;
    video.current?.pause();
    load(m, 0);
    setStarted(false);
    history.replaceState(null, '', `#${models[m].id}`);
  }

  // Arrow keys move between models, as in any tab list.
  function onTabKey(e: KeyboardEvent<HTMLButtonElement>) {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const m = (mi + step + models.length) % models.length;
    pickModel(m);
    tabs.current[m]?.focus();
  }

  // Arrive on the set (and film) the link names. Once, on arrival.
  useEffect(() => {
    const [mid, slug] = decodeURIComponent(window.location.hash.slice(1)).split(
      '/'
    );
    const m = models.findIndex((x) => x.id === mid);
    if (m < 0) return;
    const i = Math.max(
      0,
      models[m].films.findIndex((x) => x.slug === slug)
    );
    if (m !== 0 || i !== 0) load(m, i);
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
      <div className="fm-models">
        <p className="fm-models-label" id="fm-models-label">
          Made by
        </p>
        <div
          className="fm-tabs"
          role="tablist"
          aria-labelledby="fm-models-label"
        >
          {models.map((x, i) => (
            <button
              key={x.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`fm-tab-${x.id}`}
              aria-selected={i === mi}
              aria-controls="fm-set"
              tabIndex={i === mi ? 0 : -1}
              className="fm-tab"
              onClick={() => pickModel(i)}
              onKeyDown={onTabKey}
            >
              <span className="fm-tab-name">{x.name}</span>
              <span className="fm-tab-meta">
                {x.films.length} films &middot; {runTime(totalSeconds(x))}
              </span>
            </button>
          ))}
        </div>
        <p className="fm-models-next">
          Next: films by Fable 5.2 and newer models, so you can compare.
        </p>
      </div>

      <div id="fm-set" role="tabpanel" aria-labelledby={`fm-tab-${model.id}`}>
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
              src={filmFile(models[0].films[0], 'film.mp4')}
              poster={filmFile(models[0].films[0], 'thumb.webp')}
              aria-label={`${f.title}, a short film by ${model.name}, ${runTime(f.seconds)}`}
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
              Now showing &middot; {two(cur + 1)} of {two(n)}
            </p>
            <h2 className="fm-h2 font-display" aria-live="polite">
              {f.title}
            </h2>
            <p className="fm-meta">
              {f.style} &middot; {runTime(f.seconds)} &middot; {model.short}
            </p>
            <p className="fm-line">{f.line}</p>
            <p className="fm-about font-read">{f.about}</p>
            <div className="fm-controls">
              <button
                type="button"
                className="fm-btn"
                onClick={() => play(cur - 1)}
              >
                <Arrow dir={-1} /> Previous
              </button>
              <button
                type="button"
                className="fm-btn"
                onClick={() => play(cur + 1)}
              >
                Next <Arrow dir={1} />
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
            The programme &middot; {model.name}
          </h2>
          <ol className="fm-reels" role="list">
            {films.map((x, i) => (
              <li key={`${x.model}/${x.slug}`}>
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
                    <span className="fm-no">{two(i + 1)}</span>
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

        <section className="fm-how" aria-labelledby="fm-how-h">
          <div className="fm-how-main">
            <figure className="fm-ask sd-note">
              <figcaption className="fm-ask-cap">
                What I asked {model.short}
              </figcaption>
              {model.ask.map((a) => (
                <blockquote key={a} className="fm-ask-q font-read">
                  <p>{a}</p>
                </blockquote>
              ))}
              <p className="fm-ask-rule">{model.rule}</p>
            </figure>

            <div className="fm-how-sheet sd-sheet">
              <h2 id="fm-how-h" className="fm-h3">
                How {model.short}&rsquo;s films were made
              </h2>
              <p className="fm-note font-read">{model.note}</p>
              <ol className="fm-steps">
                {model.steps.map((s) => (
                  <li key={s.title}>
                    <b>{s.title}</b>
                    <span className="font-read">{s.body}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <dl className="fm-facts">
            <div className="fm-fact-wide">
              <dt>Model</dt>
              <dd className="fm-fact-model">{model.name}</dd>
            </div>
            <div>
              <dt>Films shown</dt>
              <dd>{n}</dd>
            </div>
            <div>
              <dt>Running time</dt>
              <dd>{runTime(totalSeconds(model))}</dd>
            </div>
            <div>
              <dt>Cameras</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>API credits</dt>
              <dd className="fm-zero">0</dd>
            </div>
          </dl>
        </section>
      </div>
    </>
  );
}

/** A drawn arrow, not a glyph: one stroke weight with the rest of the UI. */
function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg
      className="fm-arrow"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={dir < 0 ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path
        d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
