import type { Metadata } from 'next';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { shareMeta } from '@/lib/shareCard';
import { videos, videoFile, type Video } from '@/data/videos';
import './videos.css';

const TITLE = 'Videos — SmartDisruptions';
const DESCRIPTION =
  'Music videos made with AI: the song, the paintings, the animation and the edit. Each one comes with how it was made and what it cost.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/videos' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/videos' }),
};

/**
 * /videos — the music videos. 影 ("shadow", the character in the Japanese
 * words for filming and for a picture on a screen) is the page kanji, and
 * Kiru sits down to watch.
 *
 * It is its own page because nothing else on the site holds a film: Writing
 * is words, the Arcade is things you play, and the About wall counts
 * websites, apps and games and nothing else (Josh's call, 2026-10-21). Like
 * each thing's /built page it lights the About tab (nav/nav.ts), and the
 * footer and the command palette link to it.
 *
 * Each film is a plain <video>: nothing is fetched until it is played
 * (preload="none"), the poster is a sized WebP, and the controls are the
 * browser's own, so they work with a keyboard and a screen reader. The lyrics
 * are a captions track as well as text on the page. No JavaScript ships for
 * this page beyond the site's own.
 *
 * The list lives in src/data/videos.ts; the files in public/videos/<slug>/.
 * Styles: ./videos.css (vd-).
 */
const BASE = 'https://smartdisruptions.com';

const iso8601 = (s: number) => `PT${Math.floor(s / 60)}M${s % 60}S`;
const spoken = (v: Video) =>
  `${Math.floor(v.seconds / 60)} minutes ${v.seconds % 60} seconds`;

export default function VideosPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: videos.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: v.title,
        description: v.about,
        thumbnailUrl: `${BASE}${videoFile(v, 'poster.webp')}`,
        contentUrl: `${BASE}${videoFile(v, 'film.mp4')}`,
        uploadDate: `${v.date}T12:00:00-08:00`,
        duration: iso8601(v.seconds),
        url: `${BASE}/videos#${v.slug}`,
      },
    })),
  };

  return (
    <div className="vd-page">
      {/* Static local data, JSON-encoded; < escaped so it can never close
          the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <header className="vd-hero">
        <Kanji char="影" draw className="sd-watermark vd-mark" />
        <div className="vd-kiru">
          <Kiru pose="sit" />
        </div>
        <p className="sd-kicker">Videos</p>
        <h1 className="vd-h1 font-display">Music videos, made with AI.</h1>
        <p className="vd-lede font-read">
          Each one started as a paragraph I typed. Claude wrote the lyrics and
          ran the rest: one model sang the song, one painted the frames, one
          made them move, and Claude&rsquo;s own code cut the film to the beat.
          How each one was made, and what it cost, is under it.
        </p>
      </header>

      {videos.map((v, i) => (
        <article
          key={v.slug}
          id={v.slug}
          className="vd-item"
          aria-labelledby={`vd-${v.slug}`}
        >
          <div className="vd-frame sd-print">
            <video
              className="vd-video"
              controls
              playsInline
              preload="none"
              width={1920}
              height={1080}
              poster={videoFile(v, 'poster.webp')}
              aria-label={`${v.title}, a music video, ${spoken(v)}`}
            >
              <source src={videoFile(v, 'film.mp4')} type="video/mp4" />
              <track
                kind="captions"
                src={videoFile(v, 'captions.vtt')}
                srcLang="en"
                label="Lyrics"
              />
              Your browser can&rsquo;t play this video.{' '}
              <a href={videoFile(v, 'film.mp4')}>Download it</a> instead.
            </video>
          </div>

          <div className="vd-cols">
            <div className="vd-about">
              <p className="sd-kicker">
                {i === 0 ? 'Newest' : 'Earlier'} &middot; {v.length}
              </p>
              <h2 id={`vd-${v.slug}`} className="vd-h2 font-display">
                {v.title}
              </h2>
              <p className="vd-line">{v.line}</p>
              <p className="vd-p font-read">{v.about}</p>
              <ul className="vd-facts" role="list">
                {v.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className="vd-cost">
                <b>What it cost.</b> {v.cost}
              </p>
            </div>

            <div className="vd-how sd-sheet">
              <h3 className="vd-h3">How it was made</h3>
              <ol className="vd-steps">
                {v.steps.map((s) => (
                  <li key={s.title}>
                    <b>{s.title}</b>
                    <span className="font-read">{s.body}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <details className="vd-lyrics">
            <summary>Lyrics</summary>
            <div className="vd-lyrics-body font-read">
              {v.lyrics.map((sec, k) => (
                <p key={k} className={sec.hook ? 'vd-hook' : undefined}>
                  <em>{sec.label}</em>
                  {sec.lines.map((line, n) => (
                    <span key={n}>{line}</span>
                  ))}
                </p>
              ))}
            </div>
          </details>
        </article>
      ))}
    </div>
  );
}
