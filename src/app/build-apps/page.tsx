import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import SubscribeForm from '@/components/SubscribeForm';
import BuildTrio from '@/components/build/BuildTrio';
import { buildRoom } from '@/components/build/rooms';
import { IconArrowRight } from '@/components/icons';
import { shareMeta } from '@/lib/shareCard';
import Vessel from './Vessel';
import { GUIDES, type Guide } from './guides';
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
// apart (Vessel.tsx), with the apps list right under it; then the shelf where
// the guides will go (guides.ts), honestly empty until the first one; then
// the strip to the other two Build rooms. Styles: ./build-apps.css (ba-*).

const MONTH = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const when = (iso: string) => MONTH.format(new Date(`${iso}T12:00:00Z`));

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <li>
      <Link href={guide.href} className="sd-card ba-guide">
        {guide.tag && <span className="ba-guide-tag">{guide.tag}</span>}
        <span className="ba-guide-title font-display">{guide.title}</span>
        <span className="ba-guide-line">{guide.line}</span>
        <span className="ba-guide-foot">
          <time dateTime={guide.date}>{when(guide.date)}</time>
          <IconArrowRight size={20} className="ba-guide-go" />
        </span>
      </Link>
    </li>
  );
}

function EmptyShelf() {
  return (
    <div className="ba-empty">
      <Kiru pose="sit" className="ba-empty-kiru" />
      <div className="ba-empty-slots" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="ba-empty-slot">
            <Kanji char="器" />
          </span>
        ))}
      </div>
      <div className="ba-plank" aria-hidden />
      <div className="ba-empty-note">
        <p className="ba-empty-line font-read">
          <b>Nothing on the shelf yet.</b> The first app guide goes right here.
        </p>
        <a href="#ba-list" className="ba-empty-link">
          Get it by email
          <IconArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}

export default function BuildAppsPage() {
  const count = GUIDES.length;
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
            This page is mostly empty for now. Leave your email and each new app
            guide comes to you: one email per new guide, nothing else.
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
        <div className="ba-shelf-head">
          <div>
            <p className="sd-kicker">The guides</p>
            <h2 id="ba-shelf-title" className="ba-shelf-title font-display">
              App guides
            </h2>
          </div>
          <span className="ba-shelf-count">
            {count === 0
              ? 'None yet'
              : count === 1
                ? '1 guide'
                : `${count} guides`}
          </span>
        </div>
        {count > 0 ? (
          <ul className="ba-guides" role="list">
            {GUIDES.map((g) => (
              <GuideCard key={g.href} guide={g} />
            ))}
          </ul>
        ) : (
          <EmptyShelf />
        )}
      </section>

      <BuildTrio current="apps" />
    </div>
  );
}
