import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import { BIO, CLAUDE, DOORS, DraftBar, NAME } from '../copy';

export const metadata: Metadata = {
  title: 'About — draft 4, made with Claude',
};

/**
 * Draft 4 — made with Claude (作). The page a book prints on its last leaf,
 * the colophon: who made this and how. It leads with the working
 * arrangement — I pick, Claude builds on a test copy, I approve — then a
 * short bio, then a contents list with dotted leaders to where everything
 * it made lives.
 */
const STEPS = [
  {
    who: 'Josh',
    title: 'I pick what to build',
    body: 'A game, an app, a fix to this site. The idea and the call are mine.',
  },
  {
    who: 'Claude',
    title: 'Claude builds it on a test copy',
    body: 'It writes the code, checks it, and hands me a preview. Nothing it makes touches the live site.',
  },
  {
    who: 'Josh',
    title: 'I read it and say when it goes live',
    body: 'I go through every change. If it isn’t right it goes back, and nothing ships until I say so.',
  },
];

export default function MadeDraft() {
  return (
    <div className="adm-page">
      <DraftBar current="made" />

      <header className="adm-hero">
        <Kanji char="作" draw className="sd-watermark adm-mark" />
        <p className="sd-kicker">About &middot; How this place is made</p>
        <h1 className="adm-h1 font-display">
          Made by Josh, <span>with Claude.</span>
        </h1>
        <p className="adm-lede font-read">
          {CLAUDE.lead} {CLAUDE.body}
        </p>
      </header>

      <ol role="list" className="adm-steps" aria-label="How it gets made">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className="adm-step sd-sheet"
            data-who={s.who.toLowerCase()}
          >
            <span className="adm-step-n font-display" aria-hidden>
              0{i + 1}
            </span>
            <span className="adm-step-who">{s.who}</span>
            <h2 className="adm-step-title font-display">{s.title}</h2>
            <p className="adm-step-body">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="adm-grid">
        <section className="adm-me" aria-labelledby="adm-me-title">
          {/* eslint-disable-next-line @next/next/no-img-element -- a 12 KB pre-sized webp */}
          <img
            src="/images/josh.webp"
            alt={NAME}
            width={320}
            height={320}
            decoding="async"
            className="adm-photo"
          />
          <div>
            <h2 id="adm-me-title" className="adm-me-title font-display">
              I&rsquo;m Josh.
            </h2>
            <div className="font-read adm-me-body">
              {BIO.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <aside className="adm-ofuda sd-note" aria-label="About the writing">
          <Seal char="書" className="adm-ofuda-seal" />
          <p className="font-read">{CLAUDE.writing}</p>
        </aside>
      </div>

      <section className="adm-toc" aria-labelledby="adm-toc-title">
        <h2 id="adm-toc-title" className="sd-kicker">
          What it made, and where it lives
        </h2>
        <ul role="list">
          {DOORS.map((d) => (
            <li key={d.href}>
              <Link href={d.href} className="adm-toc-row">
                <Kanji char={d.kanji} className="adm-toc-k" />
                <span className="adm-toc-txt">
                  <span className="adm-toc-name font-display">{d.name}</span>
                  <span className="adm-toc-line">{d.line}</span>
                </span>
                <span className="adm-toc-dots" aria-hidden />
                <span className="adm-toc-go" aria-hidden>
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Kiru pose="build" className="adm-kiru" />
      </section>
    </div>
  );
}
