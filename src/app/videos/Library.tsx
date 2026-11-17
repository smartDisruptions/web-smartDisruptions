'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import {
  kinds,
  makers,
  topics,
  videos,
  videoFile,
  kindOf,
  makerOf,
  runTime,
  longTime,
  type KindId,
  type MakerId,
  type TopicId,
  type Video,
} from '@/data/videos';

/**
 * The screening room: one screen, and the whole library beside it.
 *
 * The screen never leaves. On a wide window it holds its place while the
 * library scrolls past; on a phone it pins to the top once something is
 * playing, so you can keep looking through the library while you watch.
 *
 * The finder sorts the library three ways (kind, the Claude model that made
 * it, what it is about) and whatever it leaves is also the queue: Previous,
 * Next and "Play all" walk that list. Cards glide to their new places when the
 * list changes (a View Transition; browsers without one just switch).
 *
 * The room takes the colour of what's on: two colours from the video's poster
 * are painted as a soft light behind the screen. The two lights cross-fade by
 * opacity, so the change runs on the compositor.
 *
 * Speed: there is a single <video>, so the page holds one player however many
 * videos it lists, and nothing is fetched until play (preload="none"). Its src
 * is set by hand, never by React: re-rendering the same src would reload the
 * film mid-play. A video starts inside the tap that asked for it, because
 * phones only let sound play from a tap. Before the first play the screen is
 * the poster as a sized image (640 or 1280 wide, picked by the browser), which
 * is the page's first big paint.
 *
 * Links: /videos?kind=…&by=…&about=…&sort=… opens that view, and
 * /videos#<slug> puts that video on the screen. Neither starts playing.
 */
type Filter = {
  kind: 'all' | KindId;
  maker: 'any' | MakerId;
  topic: 'any' | TopicId;
  sort: 'featured' | 'newest' | 'shortest' | 'longest';
};
const OPEN: Filter = {
  kind: 'all',
  maker: 'any',
  topic: 'any',
  sort: 'featured',
};
const SORTS: [Filter['sort'], string][] = [
  ['featured', 'featured first'],
  ['newest', 'newest first'],
  ['shortest', 'shortest first'],
  ['longest', 'longest first'],
];

const fits = (v: Video, f: Filter) =>
  (f.kind === 'all' || v.kind === f.kind) &&
  (f.maker === 'any' || v.maker === f.maker) &&
  (f.topic === 'any' || v.topics.includes(f.topic));

/** The library under a filter, in its order. (Array sort is stable.) */
function pick(f: Filter): Video[] {
  const list = videos.filter((v) => fits(v, f));
  if (f.sort === 'shortest') list.sort((a, b) => a.seconds - b.seconds);
  if (f.sort === 'longest') list.sort((a, b) => b.seconds - a.seconds);
  if (f.sort === 'newest') list.sort((a, b) => b.date.localeCompare(a.date));
  return list;
}
const count = (f: Filter) =>
  videos.reduce((n, v) => n + (fits(v, f) ? 1 : 0), 0);

function address(f: Filter, slug?: string) {
  const q = new URLSearchParams();
  if (f.kind !== 'all') q.set('kind', f.kind);
  if (f.maker !== 'any') q.set('by', f.maker);
  if (f.topic !== 'any') q.set('about', f.topic);
  if (f.sort !== 'featured') q.set('sort', f.sort);
  const s = q.toString();
  return `${window.location.pathname}${s ? `?${s}` : ''}${slug ? `#${slug}` : ''}`;
}

type DocVT = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

/** Run a change to the library so its cards glide instead of jumping. */
function glide(change: () => void) {
  const doc = document as DocVT;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!doc.startViewTransition || still) {
    change();
    return;
  }
  // Cards carry a transition name only while this runs, so they don't take
  // part in the theme switch or a page change.
  const root = document.documentElement;
  root.classList.add('vd-glide');
  const done = () => root.classList.remove('vd-glide');
  try {
    doc.startViewTransition(() => flushSync(change)).finished.then(done, done);
  } catch {
    done();
    change();
  }
}

/**
 * The file to play. A video that has a lighter copy plays it on a phone and on
 * a slow or data-saving connection: about 1 Mbps, so it starts at once and
 * doesn't stall. Where the browser reports a fast connection the full film
 * plays, even on a phone.
 */
function source(x: Video) {
  if (!x.lite) return videoFile(x, 'film.mp4');
  const net = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
        downlink?: number;
      };
    }
  ).connection;
  const phone = Math.min(window.screen.width, window.screen.height) < 600;
  const slow = net
    ? !!net.saveData || net.effectiveType !== '4g' || (net.downlink ?? 10) < 3
    : phone;
  return videoFile(x, slow ? 'lite.mp4' : 'film.mp4');
}

function Stamp({ id }: { id: string }) {
  return (
    <span className="sd-seal vd-stamp" aria-hidden="true">
      <svg viewBox="0 0 1000 1000" focusable="false">
        <use href={`#vd-g-${id}`} />
      </svg>
    </span>
  );
}

export default function Library({ perch }: { perch?: ReactNode }) {
  const [f, setF] = useState<Filter>(OPEN);
  const [cur, setCur] = useState(videos[0].slug);
  const [started, setStarted] = useState(false);
  const [queue, setQueue] = useState(false);
  const [stuck, setStuck] = useState(false);
  // Two lights behind the screen; the one that's on shows the current video's
  // colours, and they swap on every change so the change is a cross-fade.
  const [glow, setGlow] = useState<{
    on: 0 | 1;
    tints: [Video['tint'], Video['tint']];
  }>({
    on: 0,
    tints: [videos[0].tint, videos[0].tint],
  });
  const video = useRef<HTMLVideoElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  // True once a video was chosen (not just shown by default): its slug then
  // belongs in the address.
  const chosen = useRef(false);

  const list = pick(f);
  const total = list.reduce((a, v) => a + v.seconds, 0);
  const v = videos.find((x) => x.slug === cur) ?? videos[0];
  const kind = kindOf(v);
  const filtered = f.kind !== 'all' || f.maker !== 'any' || f.topic !== 'any';

  /** Put a video on the screen without playing it. */
  function show(x: Video) {
    const el = video.current;
    if (el) {
      el.src = source(x);
      el.poster = videoFile(x, 'thumb.webp');
    }
    setCur(x.slug);
    setGlow((g) => {
      const on = g.on ? 0 : 1;
      const tints: [Video['tint'], Video['tint']] = [g.tints[0], g.tints[1]];
      tints[on] = x.tint;
      return { on, tints };
    });
  }

  function play(x: Video) {
    const el = video.current;
    if (!el) return;
    chosen.current = true;
    // Committed at once: the screen must be pinned (and measurable) before
    // the check below, and play() has to run inside this tap.
    flushSync(() => {
      if (x.slug !== cur) show(x);
      setStarted(true);
    });
    // The first play of the video the page opened on: the markup names the
    // full film, so a phone is handed its lighter copy here.
    if (el.getAttribute('src') !== source(x)) el.src = source(x);
    el.play().catch(() => {});
    window.history.replaceState(null, '', address(f, x.slug));
    // Bring the screen into view only if it isn't already (it is whenever
    // it's pinned or holding its place beside the library).
    const box = screen.current?.getBoundingClientRect();
    if (!box) return;
    const seen =
      Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
    if (seen < box.height * 0.6) {
      const still = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      screen.current?.scrollIntoView({
        block: 'center',
        behavior: still ? 'auto' : 'smooth',
      });
    }
  }

  /** The next or previous video in the list the finder left. */
  function neighbour(step: 1 | -1): Video | undefined {
    if (!list.length) return undefined;
    const i = list.findIndex((x) => x.slug === cur);
    if (i < 0) return step > 0 ? list[0] : list[list.length - 1];
    return list[(i + step + list.length) % list.length];
  }

  function refine(patch: Partial<Filter>) {
    const next = { ...f, ...patch };
    const nextList = pick(next);
    glide(() => {
      setF(next);
      // Nothing playing yet: the screen follows the finder, so the first
      // match is one tap from playing.
      if (!started && nextList.length && !nextList.some((x) => x.slug === cur))
        show(nextList[0]);
    });
    window.history.replaceState(
      null,
      '',
      address(next, chosen.current ? cur : undefined)
    );
  }

  /** Open the view an address named. The page is static, so the address can
      only be read after it loads: this is the one render that follows. */
  function arrive(next: Filter, first?: Video) {
    if (
      next.kind !== 'all' ||
      next.maker !== 'any' ||
      next.topic !== 'any' ||
      next.sort !== 'featured'
    )
      setF(next);
    if (first) show(first);
  }

  // Arrive on the view (and the video) the address names. Once, on arrival.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const has = <T extends { id: string }>(
      xs: readonly T[],
      id: string | null
    ) => xs.some((x) => x.id === id);
    const next: Filter = {
      kind: has(kinds, q.get('kind')) ? (q.get('kind') as KindId) : 'all',
      maker: has(makers, q.get('by')) ? (q.get('by') as MakerId) : 'any',
      topic: has(topics, q.get('about')) ? (q.get('about') as TopicId) : 'any',
      sort: SORTS.some(([id]) => id === q.get('sort'))
        ? (q.get('sort') as Filter['sort'])
        : 'featured',
    };
    const slug = decodeURIComponent(window.location.hash.slice(1))
      .split('/')
      .pop();
    const named = videos.find((x) => x.slug === slug);
    const first = named ?? pick(next)[0];
    if (named) chosen.current = true;
    arrive(next, first && first.slug !== videos[0].slug ? first : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Is the screen pinned right now? A marker just above it leaves the viewport
  // (under the top bar) at the moment the screen sticks. The phone's top bar
  // tucks away on the way down, and the pinned screen follows it up (CSS).
  useEffect(() => {
    const mark = sentinel.current;
    if (!mark || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      ([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 200),
      { rootMargin: '-66px 0px 0px 0px' }
    );
    io.observe(mark);
    return () => io.disconnect();
  }, []);

  function tap(e: MouseEvent<HTMLAnchorElement>, x: Video) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    e.preventDefault();
    play(x);
  }

  return (
    <div className="vd-room" data-pin={started || undefined}>
      <div className="vd-main">
        <div className="vd-stage">
          <div ref={sentinel} className="vd-sentinel" aria-hidden="true" />
          <div
            ref={screen}
            className="vd-screen"
            data-stuck={stuck || undefined}
          >
            <div className="vd-glow" aria-hidden="true">
              {([0, 1] as const).map((i) => (
                <span
                  key={i}
                  data-on={glow.on === i || undefined}
                  style={
                    {
                      '--vd-a': glow.tints[i][0],
                      '--vd-b': glow.tints[i][1],
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            {perch ? <div className="vd-perch">{perch}</div> : null}
            <div className="vd-frame sd-print">
              <video
                ref={video}
                className="vd-video"
                controls
                playsInline
                preload="none"
                width={1280}
                height={720}
                src={videoFile(videos[0], 'film.mp4')}
                poster={videoFile(videos[0], 'thumb.webp')}
                aria-label={`${v.title}, a ${kind.one.toLowerCase()} made with ${makerOf(v).name}, ${runTime(v.seconds)}`}
                onEnded={() => {
                  if (!queue) return;
                  const i = list.findIndex((x) => x.slug === cur);
                  const next = i < 0 ? list[0] : list[i + 1];
                  if (next) play(next);
                  else setQueue(false);
                }}
              >
                {v.captions ? (
                  <track
                    key={v.slug}
                    kind="captions"
                    src={videoFile(v, 'captions.vtt')}
                    srcLang="en"
                    label="Lyrics"
                  />
                ) : null}
              </video>
              {!started && (
                <button
                  type="button"
                  className="vd-start"
                  onClick={() => play(v)}
                >
                  {/* A phone is told the frame is 45vw wide so it takes the 640
                      one (20 KB, not 80): full width at 640 is what phones show
                      for any video, and it is the page's first big paint. */}
                  {/* eslint-disable-next-line @next/next/no-img-element -- a sized
                    WebP pair; next/image would add a request hop for nothing. */}
                  <img
                    src={videoFile(v, 'thumb.webp')}
                    srcSet={`${videoFile(v, 'thumb.webp')} 640w, ${videoFile(v, 'poster.webp')} 1280w`}
                    sizes="(min-width: 64rem) 44rem, (min-width: 40rem) 100vw, 45vw"
                    width={1280}
                    height={720}
                    alt=""
                    fetchPriority="high"
                    decoding="async"
                  />
                  <span className="vd-play" aria-hidden="true" />
                  <span className="sr-only">Play {v.title}</span>
                </button>
              )}
            </div>
          </div>

          <div className="vd-now">
            <p className="vd-now-meta">
              <Stamp id={v.kind} />
              <span>
                {kind.one} &middot; {runTime(v.seconds)} &middot;{' '}
                {makerOf(v).short}
              </span>
            </p>
            <h2 className="vd-h2 font-display" aria-live="polite">
              {v.title}
            </h2>
            <p className="vd-line">{v.line}</p>
            <div className="vd-controls">
              <button
                type="button"
                className="vd-btn"
                disabled={list.length < 2}
                onClick={() => {
                  const x = neighbour(-1);
                  if (x) play(x);
                }}
              >
                <Arrow dir={-1} /> Previous
              </button>
              <button
                type="button"
                className="vd-btn"
                disabled={list.length < 2}
                onClick={() => {
                  const x = neighbour(1);
                  if (x) play(x);
                }}
              >
                Next <Arrow dir={1} />
              </button>
              <a className="vd-more" href="#vd-how">
                How it was made
              </a>
            </div>
          </div>
        </div>

        <section className="vd-lib" aria-labelledby="vd-lib-h">
          <h2 id="vd-lib-h" className="sr-only">
            The library
          </h2>

          <div className="vd-finder">
            <div className="vd-kinds" role="group" aria-label="Kind of video">
              {[{ id: 'all' as const, label: 'All videos' }, ...kinds].map(
                (k) => {
                  const n = count({ ...f, kind: k.id });
                  return (
                    <button
                      key={k.id}
                      type="button"
                      className="vd-kind"
                      aria-pressed={f.kind === k.id}
                      aria-label={`${k.label}, ${n}`}
                      disabled={!n && f.kind !== k.id}
                      onClick={() => refine({ kind: k.id })}
                    >
                      <Stamp id={k.id} />
                      <span className="vd-kind-name" aria-hidden="true">
                        {k.label}
                        <span className="vd-kind-n">{n}</span>
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <p className="vd-say">
              Made with{' '}
              <span
                className="vd-pick"
                data-set={f.maker !== 'any' || undefined}
              >
                <select
                  aria-label="Claude model"
                  value={f.maker}
                  onChange={(e) =>
                    refine({ maker: e.target.value as Filter['maker'] })
                  }
                >
                  <option value="any">any model</option>
                  {makers.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={!count({ ...f, maker: m.id })}
                    >
                      {m.short}
                    </option>
                  ))}
                </select>
              </span>
              , about{' '}
              <span
                className="vd-pick"
                data-set={f.topic !== 'any' || undefined}
              >
                <select
                  aria-label="Topic"
                  value={f.topic}
                  onChange={(e) =>
                    refine({ topic: e.target.value as Filter['topic'] })
                  }
                >
                  <option value="any">anything</option>
                  {topics.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      disabled={!count({ ...f, topic: t.id })}
                    >
                      {t.say}
                    </option>
                  ))}
                </select>
              </span>
              ,{' '}
              <span
                className="vd-pick"
                data-set={f.sort !== 'featured' || undefined}
              >
                <select
                  aria-label="Order"
                  value={f.sort}
                  onChange={(e) =>
                    refine({ sort: e.target.value as Filter['sort'] })
                  }
                >
                  {SORTS.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </span>
              .
            </p>

            <div className="vd-result">
              <p className="vd-tally">
                <span aria-live="polite">
                  <b>
                    {list.length} {list.length === 1 ? 'video' : 'videos'}
                  </b>
                  {list.length ? <> &middot; {longTime(total)}</> : null}
                </span>
                {filtered ? (
                  <button
                    type="button"
                    className="vd-clear"
                    onClick={() => refine({ ...OPEN, sort: f.sort })}
                  >
                    Show all
                  </button>
                ) : null}
              </p>
              {list.length > 1 ? (
                <button
                  type="button"
                  className="vd-btn vd-queue"
                  aria-pressed={queue}
                  onClick={() => {
                    if (queue) {
                      setQueue(false);
                      return;
                    }
                    setQueue(true);
                    // Already watching one of these: carry on from it.
                    const el = video.current;
                    const on =
                      started &&
                      el &&
                      !el.paused &&
                      list.some((x) => x.slug === cur);
                    if (!on) play(list[0]);
                  }}
                >
                  <PlayAll />{' '}
                  {queue ? 'Playing all' : `Play all ${list.length}`}
                </button>
              ) : null}
            </div>
          </div>

          {list.length ? (
            <ol className="vd-wall" role="list">
              {list.map((x) => (
                <li
                  key={x.slug}
                  style={{ '--vt': `vd-${x.slug}` } as CSSProperties}
                >
                  <a
                    href={videoFile(x, 'film.mp4')}
                    className="vd-card sd-card"
                    aria-current={x.slug === cur ? 'true' : undefined}
                    aria-label={`Play ${x.title}, ${kindOf(x).one.toLowerCase()}, ${runTime(x.seconds)}, made with ${makerOf(x).short}`}
                    onClick={(e) => tap(e, x)}
                  >
                    <span className="vd-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
                      <img
                        src={videoFile(x, 'thumb.webp')}
                        width={640}
                        height={360}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                      <Stamp id={x.kind} />
                      <span className="vd-len">
                        {x.slug === cur ? 'On screen' : runTime(x.seconds)}
                      </span>
                    </span>
                    <span className="vd-card-text">
                      <span className="vd-title">{x.title}</span>
                      <span className="vd-sub">
                        {kindOf(x).one} &middot; {makerOf(x).short}
                      </span>
                      <span className="vd-card-line">{x.line}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="vd-empty">
              Nothing fits all three yet.{' '}
              <button
                type="button"
                className="vd-clear"
                onClick={() => refine({ ...OPEN, sort: f.sort })}
              >
                Show all videos
              </button>
            </p>
          )}
        </section>
      </div>

      <section className="vd-how" id="vd-how" aria-label="How it was made">
        {videos.map((x) => (
          <article key={x.slug} className="vd-how-item" hidden={x.slug !== cur}>
            <div className="vd-how-about">
              <h2 className="vd-how-h font-display">How {x.title} was made</h2>
              <p className="vd-p font-read">{x.about}</p>
              <ul className="vd-facts" role="list">
                <li>{makerOf(x).name}</li>
                {x.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
              <p className="vd-cost">
                <b>What it cost.</b> {x.cost}
              </p>
            </div>

            <ol className="vd-steps sd-sheet">
              {x.steps.map((s) => (
                <li key={s.title}>
                  <b>{s.title}</b>
                  <span className="font-read">{s.body}</span>
                </li>
              ))}
            </ol>

            {x.lyrics ? (
              <details className="vd-lyrics">
                <summary>Lyrics</summary>
                <div className="vd-lyrics-body font-read">
                  {x.lyrics.map((sec, k) => (
                    <p key={k} className={sec.hook ? 'vd-hook' : undefined}>
                      <em>{sec.label}</em>
                      {sec.lines.map((line, n) => (
                        <span key={n}>{line}</span>
                      ))}
                    </p>
                  ))}
                </div>
              </details>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}

/** A drawn arrow, not a glyph: one stroke weight with the rest of the UI. */
function Arrow({ dir }: { dir: 1 | -1 }) {
  return (
    <svg
      className="vd-icon"
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

/** Play, then the next one: the queue. */
function PlayAll() {
  return (
    <svg
      className="vd-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path d="M3 3.2v9.6L10 8 3 3.2Z" fill="currentColor" />
      <path
        d="M12.75 3.5v9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
