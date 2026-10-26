import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal, Slash } from '@/components/brand/Kanji';
import { BIO, CLAUDE, DOORS, DraftBar, NAME } from '../copy';

export const metadata: Metadata = {
  title: 'About — draft 3, three doors',
};

/**
 * Draft 3 — three doors (場). A short hello, one line about Claude on a sumi
 * band, then the page is three noren: indigo curtains with a white kanji,
 * split down the middle the way a shop's are. Hover or focus one and its
 * halves part to let you through, with Kiru waiting behind it. The links
 * are the page.
 */
export default function DoorsDraft() {
  return (
    <div className="add-page">
      <DraftBar current="doors" />

      <header className="add-hero">
        <Kanji char="場" draw className="sd-watermark add-mark" />
        <div className="add-hero-grid">
          <div>
            <p className="sd-kicker">About</p>
            <h1 className="add-h1 font-display">
              <Slash text="I’m Josh." />{' '}
              <Slash text="I build with Claude." delay={0.12} />
            </h1>
            <div className="add-bio font-read">
              {BIO.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- a 12 KB pre-sized webp, the LCP image */}
          <img
            src="/images/josh.webp"
            alt={NAME}
            width={320}
            height={320}
            fetchPriority="high"
            decoding="async"
            className="add-photo sd-tilt"
          />
        </div>
      </header>

      <aside className="add-band" aria-label="How I build">
        <div className="add-band-in">
          <Seal char="作" className="add-band-seal" />
          <p className="font-read">
            <strong>{CLAUDE.lead}</strong> {CLAUDE.body}
          </p>
        </div>
      </aside>

      <section className="add-doors" aria-labelledby="add-doors-title">
        <h2 id="add-doors-title" className="add-doors-title font-display">
          Come on in.
        </h2>
        <ul role="list" className="add-row">
          {DOORS.map((d) => (
            <li key={d.href}>
              <Link href={d.href} className="add-door">
                <span className="add-noren" aria-hidden>
                  <span className="add-half add-half-l">
                    <Kanji char={d.kanji} className="add-k add-k-l" />
                  </span>
                  <span className="add-half add-half-r">
                    <Kanji char={d.kanji} className="add-k add-k-r" />
                  </span>
                </span>
                <span className="add-behind" aria-hidden>
                  <Kiru pose={d.pose} />
                </span>
                <span className="add-cap">
                  <span className="add-cap-name font-display">{d.name}</span>
                  <span className="add-cap-line">{d.line}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="add-note font-read">{CLAUDE.writing}</p>
      </section>
    </div>
  );
}
