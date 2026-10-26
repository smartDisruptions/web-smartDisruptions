import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import { BIO, CLAUDE, DOORS, DraftBar, NAME } from '../copy';

export const metadata: Metadata = {
  title: 'About — draft 2, the card',
};

/**
 * Draft 2 — the card (私). A meishi: the whole page is one business card and
 * three buttons under it, so it fits a phone screen without a scroll. The
 * Claude note is a round stamp pressed into the card's corner, and the
 * sentence it stands for is printed along the card's foot.
 */
export default function CardDraft() {
  return (
    <div className="adc-page">
      <DraftBar current="card" />

      <div className="adc-stage">
        <Kanji char="私" draw className="sd-watermark adc-mark" />

        <section className="adc-card" aria-labelledby="adc-name">
          <span className="adc-band" aria-hidden />
          <div className="adc-top">
            {/* eslint-disable-next-line @next/next/no-img-element -- a 12 KB pre-sized webp, the LCP image */}
            <img
              src="/images/josh.webp"
              alt=""
              width={320}
              height={320}
              fetchPriority="high"
              decoding="async"
              className="adc-photo"
            />
            <div>
              <p className="adc-role">
                Builder &middot; self-taught since 2008
              </p>
              <h1 id="adc-name" className="adc-name font-display">
                {NAME}
              </h1>
            </div>
          </div>

          <div className="adc-body font-read">
            <p>{BIO[0]}</p>
            <p>{BIO[1]}</p>
          </div>

          <p className="adc-foot">
            <strong>{CLAUDE.lead}</strong> It helped build this site and the
            apps and games on it. I read every change before it goes live.
          </p>

          {/* The stamp: "MADE WITH CLAUDE" around a seal, pressed at a tilt.
              The ring text is decoration; the sentence above says it. */}
          <span className="adc-stamp" aria-hidden>
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="adc-ring"
                  d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0"
                />
              </defs>
              <circle cx="60" cy="60" r="57" className="adc-stamp-o" />
              <circle cx="60" cy="60" r="35" className="adc-stamp-i" />
              <text className="adc-stamp-t">
                <textPath
                  href="#adc-ring"
                  textLength="280"
                  lengthAdjust="spacing"
                >
                  MADE WITH CLAUDE &middot; MADE WITH CLAUDE &middot;
                </textPath>
              </text>
            </svg>
            <Seal char="作" className="adc-stamp-seal" />
          </span>
        </section>

        <ul role="list" className="adc-doors">
          {DOORS.map((d) => (
            <li key={d.href}>
              <Link href={d.href} className="adc-door">
                <Kanji char={d.kanji} className="adc-door-k" />
                <span className="adc-door-name">{d.name}</span>
                <span className="adc-door-line">{d.line}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="adc-note">{CLAUDE.writing}</p>

        <Kiru pose="sit" className="adc-kiru" />
      </div>
    </div>
  );
}
