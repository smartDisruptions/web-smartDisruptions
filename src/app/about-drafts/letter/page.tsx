import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import { BIO, CLAUDE, DOORS, DraftBar, NAME } from '../copy';

export const metadata: Metadata = {
  title: 'About — draft 1, the letter',
};

/**
 * Draft 1 — the letter (心). One sheet of washi, written to you: hello, who
 * I am, how I build, signed with a seal. The three ways in are the P.S., so
 * the page reads before it sends you anywhere.
 */
export default function LetterDraft() {
  return (
    <div className="adl-page">
      <DraftBar current="letter" />
      <Kanji char="心" draw className="sd-watermark adl-mark" />

      <article className="adl-sheet sd-sheet">
        <header className="adl-head">
          {/* eslint-disable-next-line @next/next/no-img-element -- a 12 KB pre-sized webp, the LCP image */}
          <img
            src="/images/josh.webp"
            alt={NAME}
            width={320}
            height={320}
            fetchPriority="high"
            decoding="async"
            className="adl-photo"
          />
          <p className="sd-kicker">About &middot; A note from Josh</p>
        </header>

        <h1 className="adl-h1 font-display">Hi, I&rsquo;m Josh.</h1>

        <div className="adl-body font-read">
          {BIO.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p>
            <strong className="sd-hl">{CLAUDE.lead}</strong> {CLAUDE.body}
          </p>
          <p className="adl-quiet">{CLAUDE.writing}</p>
        </div>

        <footer className="adl-sign">
          <span className="adl-sign-name font-read">&mdash; Josh</span>
          <Seal char="私" className="adl-seal" />
        </footer>

        <section className="adl-ps" aria-labelledby="adl-ps-title">
          <h2 id="adl-ps-title" className="adl-ps-title font-read">
            <span>P.S.</span> Three places to start:
          </h2>
          <ul role="list" className="adl-ps-list">
            {DOORS.map((d) => (
              <li key={d.href}>
                <Link href={d.href} className="adl-ps-link">
                  <Kanji char={d.kanji} className="adl-ps-k" />
                  <span>
                    <span className="adl-ps-name">{d.name}</span>
                    <span className="adl-ps-line">{d.line}</span>
                  </span>
                  <span className="adl-ps-go" aria-hidden>
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Kiru pose="peek" className="adl-kiru" />
      </article>
    </div>
  );
}
