import type { Metadata } from 'next';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import SubscribeForm from '@/components/SubscribeForm';
import BuildTrio from '@/components/build/BuildTrio';
import SampleCard from '@/components/build/SampleCard';
import { buildRoom } from '@/components/build/rooms';
import { shareMeta } from '@/lib/shareCard';
import Vessel from './Vessel';
import { SAMPLES } from './samples';
import '@/components/build/build-band.css';
import './build-apps.css';

const ROOM = buildRoom('apps');
const TITLE = 'Build Apps — SmartDisruptions';
const DESCRIPTION =
  'Guides to building small, useful apps with AI, in plain words. Join the apps list and each new guide comes to you.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/build-apps' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/build-apps' }),
};

// /build-apps — 器, "vessel, instrument". The header is a phone you can take
// apart (Vessel.tsx), with the apps list right under it; then the shelf,
// with three of my apps standing on it (./samples.ts, cards by SampleCard);
// then the strip to the other two Build rooms. Styles: ./build-apps.css
// (ba-*).

export default function BuildAppsPage() {
  return (
    <div className="ba-page">
      <section className="ba-hero" aria-labelledby="ba-title">
        <Kanji char="器" draw className="sd-watermark ba-mark" />
        <div className="ba-copy">
          <p className="sd-kicker">{ROOM.title}</p>
          <h1 id="ba-title" className="ba-h1 font-display">
            Build apps for <span className="ba-h1-mark">anything</span>.
          </h1>
          <p className="ba-lede font-read">
            Follow along as I attempt to build apps that make life easier or
            more fun.
          </p>
        </div>

        <Vessel />

        <div id="ba-list" className="ba-list sd-sheet">
          {/* The list card is a stamp card too: join, and it gets stamped
              (VesselFX watches for the form's success line). */}
          <span className="ba-list-slot" aria-hidden>
            <span className="ba-list-stamp">
              <Kanji char="器" />
            </span>
          </span>
          <p className="sd-kicker">The apps list</p>
          <h2 className="ba-list-title font-display">
            Get each guide when it&rsquo;s done.
          </h2>
          <p className="ba-list-body font-read">
            The guides aren&rsquo;t written yet. Leave your email and each new
            app guide comes to you: one email per new guide, nothing else.
          </p>
          <SubscribeForm
            source={ROOM.source}
            cta="Get the app guides"
            done="You’re on the apps list."
            className="ba-list-form"
          />
        </div>
      </section>

      <section className="ba-shelf build-band" aria-labelledby="ba-shelf-title">
        <p className="sd-kicker">Samples</p>
        <h2 id="ba-shelf-title" className="ba-shelf-title font-display">
          Three apps you can try.
        </h2>
        <p className="ba-shelf-note font-read">
          Each one is live, so you can open it and use it.
        </p>

        <div className="ba-rack">
          <Kiru pose="sit" className="ba-rack-kiru" />
          <ul className="bs-list ba-samples" role="list">
            {SAMPLES.map((s) => (
              <li key={s.key} className="bs-card ba-sample">
                <SampleCard sample={s} />
              </li>
            ))}
          </ul>
          <div className="ba-plank" aria-hidden />
        </div>
      </section>

      <BuildTrio current="apps" />
    </div>
  );
}
