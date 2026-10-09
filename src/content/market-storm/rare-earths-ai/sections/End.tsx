import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import { Seal } from '@/components/brand/Kanji';
import SubscribeForm from '@/components/SubscribeForm';
import { MARKET_STORM_DISCLAIMER } from '@/data/marketStorm';
import { FOOTER, METHOD, SOURCES, SOURCES_HEAD } from '../content';
import { Rich } from '../ui';
import CiteBack from '../islands/e-back';
import './e.css';

/*
 * The end matter: how it was made, the receipts, the sign-off, and the
 * way to get the next one. Method and the sources are the article's own
 * words; the colophon carries the report's two footer lines and the site's
 * Market Storm disclaimer; the subscribe panel is night lacquer (ms-night)
 * like every Market Storm ending, with the iron filings of a magnet you
 * can't see behind Kiru as he bows out.
 */

/** "https://www.sec.gov/…" → "sec.gov": where a source lives, at a glance. */
const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export default function End() {
  return (
    <>
      <section id="method" className="re-e-method" aria-labelledby="method-t">
        <p className="sd-kicker">{METHOD.eyebrow}</p>
        <h2 id="method-t" className="font-display re-e-end-t">
          {METHOD.title}
        </h2>
        <ul className="re-e-method-list" role="list">
          {METHOD.items.map((t, i) => (
            <li key={i} className="font-read">
              <Rich text={t} />
            </li>
          ))}
        </ul>
      </section>

      <section
        id="sources"
        className="re-e-sources"
        aria-labelledby="sources-t"
      >
        <p className="sd-kicker">{SOURCES_HEAD.eyebrow}</p>
        <h2 id="sources-t" className="font-display re-e-end-t">
          {SOURCES_HEAD.title}{' '}
          <span className="re-e-src-count" aria-hidden="true">
            {SOURCES.length}
          </span>
        </h2>
        <ol className="re-e-src" role="list">
          {SOURCES.map((s) => (
            <li key={s.n} id={`src-${s.n}`} className="re-e-src-i">
              <span className="re-e-src-n">{s.n}</span>
              {/* The whole entry, title and site, is the link: a target as
                  tall as the entry, not one line of small type. */}
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="re-e-src-a"
              >
                <span className="re-e-src-t">{s.title}</span>
                <span className="re-e-src-host">{host(s.url)}</span>
              </a>
            </li>
          ))}
        </ol>
        <CiteBack />
      </section>

      <footer className="re-e-colophon">
        <div className="re-e-col-head">
          <Seal char="嵐" className="re-e-col-seal" />
          <p className="re-e-col1">{FOOTER.line1}</p>
        </div>
        <p className="font-read re-e-col2">{FOOTER.line2}</p>
        <p className="re-e-disc">{MARKET_STORM_DISCLAIMER}</p>
      </footer>

      <section className="re-e-end ms-night" aria-labelledby="re-end-t">
        <div className="re-e-end-field" aria-hidden="true" />
        <div className="re-e-end-in">
          <div className="re-e-end-copy">
            <h2 id="re-end-t" className="font-display">
              Get the next Market Storm in your inbox
            </h2>
            <p>One email when a real market moment triggers a new report.</p>
            <SubscribeForm source="market-storm" className="mt-6" />
          </div>
          <Kiru pose="bow" className="re-e-end-kiru" />
        </div>
      </section>

      <p className="re-e-back">
        <Link href="/market-storm">← Back to Market Storm</Link>
      </p>
    </>
  );
}
