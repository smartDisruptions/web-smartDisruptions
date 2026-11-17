import type { Metadata } from 'next';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { GLYPHS } from '@/components/brand/glyphs';
import { shareMeta } from '@/lib/shareCard';
import { videos, kinds, kindOf, makerOf, videoFile } from '@/data/videos';
import PlayRooms from '@/components/nav/PlayRooms';
import Library from './Library';
import './videos.css';

const TITLE = 'Videos — SmartDisruptions';
const DESCRIPTION =
  'Music videos, short films drawn in code and game trailers, all made with AI. Sort them by kind, by the Claude model that made them or by topic, and see how each one was made.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/videos' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/videos' }),
};

/**
 * /videos — every video in one screening room: the music videos, the short
 * films drawn in code and the game trailers. 影 ("shadow", the character in
 * the Japanese words for filming and for a picture on a screen) is the page
 * kanji, and Kiru sits on the screen to watch.
 *
 * One screen, one library. The screen stays put (beside the library on a wide
 * window, pinned to the top on a phone once something is playing) and the
 * library sorts three ways: by kind, by the Claude model that made it, by what
 * it is about. Whatever the finder leaves is also the queue. Library.tsx is
 * the page's one island; this file is its static shell.
 *
 * On a phone it is one of the Play tab's two rooms, beside the Arcade: the
 * switch under the top bar (PlayRooms) moves between them. On a wide window
 * the header names it (nav/nav.ts). The footer and the command palette link
 * to it too. /films, the short films' first address, redirects here with the
 * films picked (next.config.ts).
 *
 * The list lives in src/data/videos.ts; the files in each video's `dir`.
 * Styles: ./videos.css (vd-).
 */
const BASE = 'https://smartdisruptions.com';

const iso8601 = (s: number) => {
  const t = Math.round(s);
  return `PT${Math.floor(t / 60)}M${t % 60}S`;
};

/** The kind stamps, drawn once here and reused by every card (<use>). */
const STAMPS: [string, string][] = [
  ['all', '影'],
  ...kinds.map((k): [string, string] => [k.id, k.kanji]),
];

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
        description: `${v.line} ${kindOf(v).one}, made with ${makerOf(v).name}.`,
        genre: kindOf(v).one,
        thumbnailUrl: `${BASE}${videoFile(v, 'poster.webp')}`,
        contentUrl: `${BASE}${videoFile(v, 'film.mp4')}`,
        uploadDate: `${v.date}T12:00:00-08:00`,
        duration: iso8601(v.seconds),
        url: `${BASE}/videos#${v.slug}`,
      },
    })),
  };

  return (
    <>
      {/* The Play tab's two rooms: the Arcade, and this one. Its two stamps
          reuse the glyphs already in this page's sprite. */}
      <PlayRooms
        current="videos"
        glyphs={{ arcade: 'vd-g-game-trailer', videos: 'vd-g-all' }}
      />
      <div className="vd-page">
        {/* Static local data, JSON-encoded; < escaped so it can never close
          the script tag. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
        {/* Without JavaScript the finder and the buttons can't work, so they
          step aside: the screen plays the first video with the browser's own
          controls, every card is a plain link to its file, and every
          "how it was made" is on the page. */}
        <noscript>
          <style>{`.vd-start,.vd-finder,.vd-controls{display:none!important}.vd-how-item[data-off]{display:grid!important;margin-bottom:3rem}`}</style>
        </noscript>

        <svg
          className="vd-sprite"
          width="0"
          height="0"
          aria-hidden="true"
          focusable="false"
        >
          {STAMPS.map(([id, char]) => (
            <symbol key={id} id={`vd-g-${id}`} viewBox="0 0 1000 1000">
              <path d={GLYPHS.brush[char].d} />
            </symbol>
          ))}
        </svg>

        <header className="vd-hero">
          <Kanji char="影" draw className="sd-watermark vd-mark" />
          <p className="sd-kicker">Videos</p>
          <h1 className="vd-h1 font-display">Videos made with AI.</h1>
          <p className="vd-lede font-read">
            Music videos, short films drawn in code, and game trailers. Each one
            says which Claude model made it, how, and what it cost.
          </p>
        </header>

        <Library perch={<Kiru pose="sit" />} />
      </div>
    </>
  );
}
