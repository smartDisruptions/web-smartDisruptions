import type { Metadata } from 'next';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { shareMeta } from '@/lib/shareCard';
import { films, filmFile, runTime } from '@/data/films';
import Theatre from './Theatre';
import './films.css';

const TITLE = 'Films — SmartDisruptions';
const DESCRIPTION =
  'Six short films where every frame and every note is computed from code. No camera, no footage, no image or video model, and zero API credits.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/films' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/films' }),
};

/**
 * /films — short films made entirely of code. 光 ("light") is the page kanji:
 * a film is light, and /videos next door is 影, its shadow. Kiru peeks at the
 * screen.
 *
 * A screening room: one screen with the film that's on beside it, then the
 * programme. The screen is one client component (./Theatre) holding a single
 * <video preload="none">, so nothing heavy loads until a film is played and
 * a phone downloads one 640px frame to paint the page. Each film is 720p at
 * about 1 Mbps, which starts at once on a phone and is sharp at the size the
 * screen is shown. Like /videos it has no tab and lights About (nav/nav.ts).
 *
 * The list lives in src/data/films.ts; the files in public/films/<slug>/.
 * Styles: ./films.css (fm-).
 */
const BASE = 'https://smartdisruptions.com';
const iso8601 = (s: number) => `PT${Math.floor(s / 60)}M${Math.round(s % 60)}S`;
const total = films.reduce((a, f) => a + f.seconds, 0);

export default function FilmsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: films.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: f.title,
        description: f.line,
        thumbnailUrl: `${BASE}${filmFile(f, 'poster.webp')}`,
        contentUrl: `${BASE}${filmFile(f, 'film.mp4')}`,
        uploadDate: `${f.date}T12:00:00-08:00`,
        duration: iso8601(f.seconds),
        url: `${BASE}/films#${f.slug}`,
      },
    })),
  };

  return (
    <div className="fm-page">
      {/* Static local data, JSON-encoded; < escaped so it can never close
          the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Without JavaScript the play button can't start anything: drop it
          and let the video's own poster and controls show through. */}
      <noscript>
        <style>{'.fm-start{display:none}'}</style>
      </noscript>

      <header className="fm-hero">
        <Kanji char="光" draw className="sd-watermark fm-mark" />
        <div className="fm-kiru">
          <Kiru pose="peek" />
        </div>
        <p className="sd-kicker">Films</p>
        <h1 className="fm-h1 font-display">Films made of code.</h1>
        <p className="fm-lede font-read">
          No camera, no footage, and no image or video model. Claude wrote the
          code that draws every frame and plays every note, and my Mac rendered
          it. These are six of the seventeen.
        </p>
      </header>

      <Theatre films={films} />

      <section className="fm-how" aria-labelledby="fm-how-h">
        <div className="fm-how-sheet sd-sheet">
          <h2 id="fm-how-h" className="fm-h3">
            How they were made
          </h2>
          <ol className="fm-steps">
            <li>
              <b>Claude chose the films.</b>
              <span className="font-read">
                I asked for short films on subjects of its choosing, each in a
                different style, with one agent working on each film. I picked
                these six from the seventeen it made.
              </span>
            </li>
            <li>
              <b>Code draws every frame.</b>
              <span className="font-read">
                Each shot is a small program that runs on the graphics chip (a
                shader) and works out the colour of every pixel. Every frame is
                drawn 4 to 16 times over and blended, which gives soft motion
                blur and clean edges.
              </span>
            </li>
            <li>
              <b>The music is code too.</b>
              <span className="font-read">
                Every score is synthesized in the browser, note by note, on the
                same clock as the picture. There are no samples and no
                recordings.
              </span>
            </li>
            <li>
              <b>Every line holds long enough to read.</b>
              <span className="font-read">
                The first cuts didn&rsquo;t. 186,282 cut away about a second
                after each key sentence, so now every line stays up for about a
                second plus 0.3 seconds a word, checked by a script that reads
                each film the way a viewer does.
              </span>
            </li>
          </ol>
        </div>

        <dl className="fm-facts">
          <div>
            <dt>Films</dt>
            <dd>{films.length}</dd>
          </div>
          <div>
            <dt>Running time</dt>
            <dd>{runTime(total)}</dd>
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
  );
}
