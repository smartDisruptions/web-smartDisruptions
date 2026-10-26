import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import { IconArrowRight } from '@/components/icons';
import Noren from './Noren';
import './next.css';

/**
 * The card at the foot of each About page that opens the other one, drawn as
 * a small copy of the other page's header, so you can see where it goes:
 *
 *  - on /about (the work), "The person behind it": Josh's photo on a
 *    shikishi board, with About Me's 私 brushed beside it and its 作 stamp as
 *    the seal, and Kiru bowing you out;
 *  - on /about-me (the person), "See the work": the noren from /about, Kiru
 *    peeking through it. Hover it and the cloth parts.
 *
 * Each slides the way the fusuma at the top does (the person is forward).
 */
export default function AboutNext({ to }: { to: 'person' | 'work' }) {
  if (to === 'person') {
    return (
      <section className="au-next" aria-labelledby="au-next-person">
        <Link
          href="/about-me"
          transitionTypes={['nav-forward']}
          className="au-next-card sd-card"
        >
          <span className="au-next-art au-next-board" aria-hidden>
            <span className="au-next-shikishi">
              {/* eslint-disable-next-line @next/next/no-img-element -- the same 12 KB pre-sized webp About Me opens with */}
              <img
                src="/images/josh.webp"
                alt=""
                width={320}
                height={320}
                loading="lazy"
                decoding="async"
                className="au-next-photo"
              />
              <span className="au-next-brush">
                <Kanji char="私" className="au-next-brush-k" />
                <Seal char="作" className="au-next-brush-seal" />
              </span>
            </span>
          </span>
          <span className="au-next-head">
            <span className="sd-kicker">The person behind it</span>
            <h2 id="au-next-person" className="au-next-h font-display">
              Hi, I&rsquo;m Josh.
            </h2>
          </span>
          <span className="au-next-body">
            <span className="au-next-p font-read">
              Self-taught since 2008, and I build with Claude every day.
            </span>
            <span className="au-next-go">
              Meet me <IconArrowRight size={18} />
            </span>
          </span>
          <Kiru pose="bow" className="au-next-kiru" />
        </Link>
      </section>
    );
  }

  return (
    <section className="au-next au-next-narrow" aria-labelledby="au-next-work">
      <Link
        href="/about"
        transitionTypes={['nav-back']}
        className="au-next-card sd-card"
      >
        <span className="au-next-art au-next-door" aria-hidden>
          <Noren mini id="au-ba-mini" />
        </span>
        <span className="au-next-head">
          <span className="sd-kicker">The work</span>
          <h2 id="au-next-work" className="au-next-h font-display">
            See the work.
          </h2>
        </span>
        <span className="au-next-body">
          <span className="au-next-p font-read">
            The things I&rsquo;ve built, and the receipts for all of it.
          </span>
          <span className="au-next-go">
            Step inside <IconArrowRight size={18} />
          </span>
        </span>
      </Link>
    </section>
  );
}
