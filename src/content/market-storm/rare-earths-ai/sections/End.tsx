import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import SubscribeForm from '@/components/SubscribeForm';
import { MARKET_STORM_DISCLAIMER } from '@/data/marketStorm';
import { FOOTER, METHOD, SOURCES, SOURCES_HEAD } from '../content';
import { Rich } from '../ui';

/** STUB — owned by the end-matter builder. Method, sources, sign-off, subscribe. */
export default function End() {
  return (
    <>
      <section id="method" aria-labelledby="method-t">
        <p className="sd-kicker">{METHOD.eyebrow}</p>
        <h2 id="method-t" className="font-display">
          {METHOD.title}
        </h2>
        <ul>
          {METHOD.items.map((t, i) => (
            <li key={i}>
              <Rich text={t} />
            </li>
          ))}
        </ul>
      </section>
      <section id="sources" aria-labelledby="sources-t">
        <p className="sd-kicker">{SOURCES_HEAD.eyebrow}</p>
        <h2 id="sources-t" className="font-display">
          {SOURCES_HEAD.title}
        </h2>
        <ol>
          {SOURCES.map((s) => (
            <li key={s.n} id={`src-${s.n}`}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </section>
      <footer>
        <p>{FOOTER.line1}</p>
        <p>{FOOTER.line2}</p>
        <p>{MARKET_STORM_DISCLAIMER}</p>
      </footer>
      <section aria-labelledby="re-end-t">
        <h2 id="re-end-t" className="font-display">
          Get the next Market Storm in your inbox
        </h2>
        <p>One email when a real market moment triggers a new report.</p>
        <SubscribeForm source="market-storm" />
        <Kiru pose="bow" />
      </section>
      <p>
        <Link href="/market-storm">← Back to Market Storm</Link>
      </p>
    </>
  );
}
