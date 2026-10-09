import type { Metadata } from 'next';
import Link from 'next/link';
import Kanji from '@/components/brand/Kanji';
import Kiru from '@/components/kiru/Kiru';
import SubscribeForm from '@/components/SubscribeForm';
import BuildTrio from '@/components/build/BuildTrio';
import { buildRoom } from '@/components/build/rooms';
import { IconArrowRight } from '@/components/icons';
import { shareMeta } from '@/lib/shareCard';
import LevelToy from './LevelToy';
import { GUIDES } from './guides';
import '@/components/build/build-band.css';
import './build-games.css';

const ROOM = buildRoom('games');
const TITLE = 'Build Games — SmartDisruptions';
const DESCRIPTION =
  'Build a tiny rooftop level and play it right on the page, then get my guides to building small games as I write them.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/build-games' },
  ...shareMeta({
    title: TITLE,
    description: DESCRIPTION,
    path: '/build-games',
  }),
};

/**
 * /build-games — the games room. 戯 ("play") is the page kanji.
 *
 * The header is the idea: build a level, then play it. A pixel rooftop at
 * night (LevelToy + engine.ts, one canvas island) where you raise roofs, hang
 * lanterns and move the gate, then press Play and Kiru runs it. Before anyone
 * touches it, Kiru runs the demo level on his own. Clearing a level you built
 * points you at the games list, which sits right under the cabinet (beside it
 * on a desktop).
 *
 * Below: the shelf for the guides. It is honestly empty until Josh adds the
 * first one to GUIDES in ./guides.ts, and the empty slots are drawn as what
 * they are. Then the three Build rooms. Styles: ./build-games.css (bg-*).
 */

const SLOTS = 3;
const pad = (n: number) => String(n).padStart(2, '0');
const day = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

export default function BuildGamesPage() {
  const empty = Math.max(0, SLOTS - GUIDES.length);
  return (
    <div className="bg-page">
      <section className="bg-hero" aria-labelledby="bg-title">
        <Kanji char={ROOM.kanji} draw className="sd-watermark bg-mark" />
        <div className="bg-intro">
          <p className="sd-kicker">{ROOM.title}</p>
          <h1 id="bg-title" className="bg-h1 font-display">
            Build custom games,{' '}
            <span className="bg-h1-then">any way you like.</span>
          </h1>
          <p className="bg-lede font-read">
            Raise the rooftops, hang a few lanterns, move the gate. Press Play,
            and Kiru runs whatever you made.
          </p>
        </div>

        <div className="bg-game">
          <LevelToy />
        </div>

        <section
          id="bg-optin"
          className="bg-optin"
          aria-labelledby="bg-optin-title"
        >
          <p className="sd-kicker">The games list</p>
          <h2 id="bg-optin-title" className="bg-optin-title font-display">
            Get the guides as I write them.
          </h2>
          <p className="bg-optin-copy font-read">
            When I write a guide to building a small game, it comes to you. One
            email per new guide. Nothing else.
          </p>
          <SubscribeForm
            source={ROOM.source}
            cta="Get the game guides"
            done="You’re on the games list."
            className="bg-form"
          />
        </section>
      </section>

      <section
        className="bg-shelf build-band sd-defer"
        aria-labelledby="bg-shelf-title"
      >
        <p className="sd-kicker">The guides</p>
        <h2 id="bg-shelf-title" className="bg-shelf-title font-display">
          The shelf
        </h2>
        <p className="bg-shelf-note font-read">
          {GUIDES.length === 0
            ? 'Empty for now. The first guide goes in slot one.'
            : `${GUIDES.length === 1 ? 'One guide' : `${GUIDES.length} guides`} so far, newest first.`}
        </p>

        <div className="bg-slots">
          <Kiru pose="sit" className="bg-shelf-kiru" />
          {GUIDES.map((g, i) => (
            <Link
              key={g.href}
              href={g.href}
              className="sd-card bg-slot bg-guide"
            >
              <span className="bg-slot-n" aria-hidden="true">
                {pad(i + 1)}
              </span>
              <span className="bg-guide-title font-display">{g.title}</span>
              <span className="bg-guide-line">{g.line}</span>
              <span className="bg-guide-meta">
                <time dateTime={g.date}>{day(g.date)}</time>
                <span className="bg-guide-go">
                  Read it <IconArrowRight size={16} />
                </span>
              </span>
            </Link>
          ))}
          {Array.from({ length: empty }, (_, i) => (
            <div key={i} className="bg-slot bg-empty" aria-hidden="true">
              <span className="bg-slot-n">{pad(GUIDES.length + i + 1)}</span>
              <span className="bg-empty-label">Empty slot</span>
            </div>
          ))}
        </div>
      </section>

      <BuildTrio current="games" />
    </div>
  );
}
