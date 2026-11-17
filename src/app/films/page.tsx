import type { Metadata } from 'next';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import { shareMeta } from '@/lib/shareCard';
import { models, allFilms, filmFile } from '@/data/films';
import Theatre from './Theatre';
import './films.css';

const TITLE = 'Films — SmartDisruptions';
const DESCRIPTION =
  'Short films made entirely of code, grouped by the Claude model that made them. No camera, no footage, no image or video model, and zero API credits.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/films' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/films' }),
};

/**
 * /films — short films made entirely of code, by model. 光 ("light") is the
 * page kanji: a film is light, and /videos next door is 影, its shadow. Kiru
 * peeks at the screen.
 *
 * It is a screening room and a benchmark at once: each Claude model gets its
 * own set, made from the same kind of ask, and a viewer picks the model and
 * compares (./Theatre, the only client code). One <video preload="none">
 * holds every film, so nothing heavy loads until play, and a phone downloads
 * one small frame to paint the page. Like /videos it has no tab and lights
 * About (nav/nav.ts).
 *
 * The models and their films live in src/data/films.ts; the files in
 * public/films/<model>/<slug>/. Styles: ./films.css (fm-).
 */
const BASE = 'https://smartdisruptions.com';
const iso8601 = (s: number) => `PT${Math.floor(s / 60)}M${Math.round(s % 60)}S`;
const modelName = (id: string) => models.find((m) => m.id === id)?.name ?? '';

export default function FilmsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: allFilms.map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'VideoObject',
        name: f.title,
        description: `${f.line} Made by ${modelName(f.model)}, entirely in code.`,
        thumbnailUrl: `${BASE}${filmFile(f, 'poster.webp')}`,
        contentUrl: `${BASE}${filmFile(f, 'film.mp4')}`,
        uploadDate: `${f.date}T12:00:00-08:00`,
        duration: iso8601(f.seconds),
        url: `${BASE}/films#${f.model}/${f.slug}`,
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
          No camera, no footage, and no image or video model. A Claude model
          writes the code that draws every frame and plays every note, and my
          Mac renders it. Each set is labelled with the model that made it, so
          you can pick one and compare.
        </p>
      </header>

      <Theatre models={models} />
    </div>
  );
}
