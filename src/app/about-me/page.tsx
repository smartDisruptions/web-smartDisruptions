import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import { IconArrowRight } from '@/components/icons';
import AboutSwitch from '@/components/about/AboutSwitch';
import AboutNext from '@/components/about/AboutNext';
import { shareMeta } from '@/lib/shareCard';
import './about.css';

const TITLE = 'About me — SmartDisruptions';
const DESCRIPTION =
  'Self-taught since 2008, a software engineer by day, and I use Claude heavily: it helped build this site and the apps and games on it.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/about-me' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/about-me' }),
};

/**
 * About me (/about-me) — the card (私). The person behind the work; its
 * sibling, /about, is the work itself, and the fusuma at the top of both
 * slides between them.
 *
 * Until October 2026 this page was "The Path", a career timeline and a
 * skills list. Josh didn't want it to read as a résumé any more, so it became
 * a meishi: who I am in two sentences, a plain note that I build with Claude,
 * and three ways in (the Arcade, the Writing, Learn). Chosen from four
 * designs previewed side by side (the letter, the card, three doors, made
 * with Claude); the timeline and the other three are in git history.
 *
 * Every claim on the card is one the site already made before the redesign:
 * self-taught since 2008, an engineer at a university, games with my son.
 *
 * Styles: ./about.css (ab-).
 */
const BIO = [
  'I’ve been teaching myself to build things since 2008, and by day I’m a software engineer at a university.',
  'After hours I build websites, apps and games, and I put them here. A few of the games I made with my son.',
];

const DOORS = [
  {
    href: '/games',
    kanji: '遊',
    name: 'The Arcade',
    line: 'Games I built. Free, and they run in your browser.',
  },
  {
    href: '/content',
    kanji: '書',
    name: 'The Writing',
    line: 'What I learn building with AI, with the receipts.',
  },
  {
    href: '/learn',
    kanji: '学',
    name: 'Learn',
    line: 'How to build websites, apps and games with AI, in plain words.',
  },
];

export default function AboutPage() {
  return (
    <div className="ab-page">
      {/* The fusuma to /about, the work; the same switch heads both pages. */}
      <AboutSwitch current="person" />

      <div className="ab-stage">
        <Kanji char="私" draw className="sd-watermark ab-mark" />

        <section className="ab-card" aria-labelledby="ab-name">
          <span className="ab-band" aria-hidden />
          <div className="ab-top">
            {/* eslint-disable-next-line @next/next/no-img-element -- a 12 KB pre-sized webp; it is the LCP image, so it loads eagerly at high priority */}
            <img
              src="/images/josh.webp"
              alt=""
              width={320}
              height={320}
              fetchPriority="high"
              decoding="async"
              className="ab-photo"
            />
            <div>
              <p className="ab-role">Builder &middot; self-taught since 2008</p>
              <h1 id="ab-name" className="ab-name font-display">
                Josh
              </h1>
            </div>
          </div>

          <div className="ab-body font-read">
            {BIO.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <p className="ab-foot">
            <strong>I use Claude heavily.</strong> It helped build this site and
            the apps and games on it. I read every change before it goes live.
          </p>

          {/* The stamp: "MADE WITH CLAUDE" around a seal, pressed at a tilt.
              The ring text is decoration; the sentence above says it. */}
          <span className="ab-stamp" aria-hidden>
            <svg viewBox="0 0 120 120">
              <defs>
                <path
                  id="ab-ring"
                  d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0"
                />
              </defs>
              <circle cx="60" cy="60" r="57" className="ab-stamp-o" />
              <circle cx="60" cy="60" r="35" className="ab-stamp-i" />
              <text className="ab-stamp-t">
                <textPath
                  href="#ab-ring"
                  textLength="280"
                  lengthAdjust="spacing"
                >
                  MADE WITH CLAUDE &middot; MADE WITH CLAUDE &middot;
                </textPath>
              </text>
            </svg>
            <Seal char="作" className="ab-stamp-seal" />
          </span>
        </section>

        <ul role="list" className="ab-doors">
          {DOORS.map((d) => (
            <li key={d.href}>
              <Link href={d.href} className="ab-door">
                <Kanji char={d.kanji} className="ab-door-k" />
                <span className="ab-door-name">{d.name}</span>
                <span className="ab-door-line">{d.line}</span>
              </Link>
            </li>
          ))}
        </ul>

        <Kiru pose="sit" className="ab-kiru" />
      </div>

      <div className="ab-sec">
        <div className="ab-end">
          <Link href="/kiru" className="ab-meet sd-card">
            <Kiru pose="wave" />
            <span>
              <span className="ab-meet-k block">The house ninja</span>
              <span className="ab-meet-t block">Meet Kiru</span>
              <span className="ab-meet-s block">
                The ninja who lives on this site
              </span>
            </span>
            <IconArrowRight className="ab-meet-go" size={20} />
          </Link>
        </div>

        {/* And back out through the noren, to the work. */}
        <AboutNext to="work" />
      </div>
    </div>
  );
}
