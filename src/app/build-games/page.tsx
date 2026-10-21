import type { Metadata } from 'next';
import Kanji from '@/components/brand/Kanji';
import Kiru from '@/components/kiru/Kiru';
import SubscribeForm from '@/components/SubscribeForm';
import BuildTrio from '@/components/build/BuildTrio';
import SampleCard from '@/components/build/SampleCard';
import { buildRoom } from '@/components/build/rooms';
import { shareMeta } from '@/lib/shareCard';
import LevelToy from './LevelToy';
import { SAMPLES } from './samples';
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
 * Below: the samples, three of my games in the shelf's numbered slots, with
 * Kiru sitting on the end (./samples.ts, cards by SampleCard). Then the
 * three Build rooms. Styles: ./build-games.css (bg-*).
 */

const pad = (n: number) => String(n).padStart(2, '0');

export default function BuildGamesPage() {
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
            Imagine and build incredible games and worlds.
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
        <p className="sd-kicker">Samples</p>
        <h2 id="bg-shelf-title" className="bg-shelf-title font-display">
          Three games, free to play.
        </h2>
        <p className="bg-shelf-note font-read">
          Each one runs in your browser, with nothing to install. Path Not
          Taken is still an early test.
        </p>

        <div className="bg-slots">
          <Kiru pose="sit" className="bg-shelf-kiru" />
          <ul className="bs-list bg-slot-list" role="list">
            {SAMPLES.map((s, i) => (
              <li key={s.key} className="bs-card bg-slot">
                <span className="bg-slot-n" aria-hidden="true">
                  {pad(i + 1)}
                </span>
                <SampleCard sample={s} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BuildTrio current="games" />
    </div>
  );
}
