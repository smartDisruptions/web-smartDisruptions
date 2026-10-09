import type { Metadata } from 'next';
import Kanji, { Seal } from '@/components/brand/Kanji';
import StaticSvg from '@/components/brand/StaticSvg';
import SubscribeForm from '@/components/SubscribeForm';
import BuildTrio from '@/components/build/BuildTrio';
import { buildRoom } from '@/components/build/rooms';
import { shareMeta } from '@/lib/shareCard';
import ShojiBrowser from './ShojiBrowser';
import MiniSite from './MiniSite';
import GuideWall from './GuideWall';
import '@/components/build/build-band.css';
import './websites.css';

const ROOM = buildRoom('websites');
const TITLE = 'Build Websites — SmartDisruptions';
const DESCRIPTION =
  'Guides on building real websites, from a blank page to a live address.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/build-websites' },
  ...shareMeta({
    title: TITLE,
    description: DESCRIPTION,
    path: '/build-websites',
  }),
};

// /build-websites — 網 ("net, web"). The header is the shoji browser: a tiny
// dojo website inside a browser framed like a shoji screen. Slide its edge
// and the site reflows from desktop to tablet to phone; flip it between
// Sketch, Code and Ship. Under it, the websites list, then the guides (an
// honest empty wall until the first one exists; see ./guides.ts), then the
// other two Build rooms. Styles: ./websites.css (bw-*).
export default function BuildWebsitesPage() {
  return (
    <div className="bw-page">
      <section className="bw-hero" aria-labelledby="bw-title">
        <Kanji char={ROOM.kanji} className="sd-watermark bw-mark" />
        <div className="bw-copy">
          <p className="sd-kicker">{ROOM.title}</p>
          <h1 id="bw-title" className="font-display bw-h1">
            Build interactive websites that are fast, clean, and{' '}
            <span className="bw-h1-mark">
              responsive.
              <StaticSvg
                className="bw-h1-brush"
                viewBox="0 0 200 16"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path d="M3 11 C 40 4, 80 13, 120 7 S 175 5, 197 9" />
              </StaticSvg>
            </span>
          </h1>
          <p className="bw-lede font-read">
            Responsive means it fits any screen. Drag the edge of this one: each
            red mark under it is a breakpoint, and the site rearranges as you
            cross it.
          </p>
        </div>

        <ShojiBrowser
          sketch={<MiniSite look="sketch" />}
          ship={<MiniSite look="ship" />}
        />

        <aside className="bw-join" aria-labelledby="bw-join-title">
          <Seal char={ROOM.kanji} className="bw-stamp" />
          <p id="bw-join-title" className="sd-kicker">
            The websites list
          </p>
          <p className="bw-join-line font-read">
            When I post a new guide on building websites, you get one email.
            Nothing else.
          </p>
          <SubscribeForm
            source="websites"
            cta="Get the guides"
            done="You’re on the websites list."
          />
        </aside>
      </section>

      <GuideWall />

      <BuildTrio current="websites" />
    </div>
  );
}
