import type { Metadata } from 'next';
import Link from 'next/link';
import Kiru, { type KiruPose } from '@/components/kiru/Kiru';
import Kanji, { Seal, Vertical, Slash } from '@/components/brand/Kanji';
import { GLYPHS } from '@/components/brand/glyphs';
import { IconArrowRight, IconSearch } from '@/components/icons';
import { SmokeBomb, PaletteCard } from './SmokeBomb';
import { SMOKE_CSS } from './smoke-css';
import './kiru.css';

// His name is 切る. Until 切 and る are baked into glyphs.ts (they aren't
// yet — see scripts/build-glyphs.mjs), the brushwork is 斬, which is also read
// "kiru": to cut. Bake them and the page switches to his real name by itself.
const NAME_BAKED = '切' in GLYPHS.brush && 'る' in GLYPHS.brush;

const DESCRIPTION =
  'Kiru is the ninja who lives on this site. His name means “to cut”, and he cuts through hype. Every pose, and the page where he does each job.';

// Setting openGraph/twitter here replaces the root's, images included, so the
// site card (src/app/opengraph-image.tsx — Kiru's head on the night skyline)
// is named explicitly or a shared /kiru link would render with no picture.
const CARD = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'SmartDisruptions — building real things with AI, in public',
};

export const metadata: Metadata = {
  title: 'Meet Kiru — SmartDisruptions',
  description: DESCRIPTION,
  alternates: { canonical: '/kiru' },
  openGraph: {
    title: 'Meet Kiru — the Smart Disruptions ninja',
    description: DESCRIPTION,
    url: 'https://smartdisruptions.com/kiru',
    siteName: 'SmartDisruptions',
    type: 'website',
    locale: 'en_US',
    images: [CARD],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meet Kiru — the Smart Disruptions ninja',
    description: DESCRIPTION,
    images: [{ ...CARD, url: '/twitter-image' }],
  },
};

/**
 * Meet Kiru — the house ninja, every pose, and where on the site he does each
 * job. The big one follows your pointer (SiteFX moves the eyes of every ninja
 * on screen, so the whole gallery watches you too). The "vanish" card is the
 * real smoke bomb from the 404 page. Styles: ./kiru.css, ./smoke-css.ts.
 *
 * Keep the gallery honest: a pose is listed under a page only if that page
 * actually shows him that way.
 */

type Spot = {
  pose: KiruPose | 'vanish';
  where: string;
  caption: string;
  href?: string;
  /** Opens the command palette instead of navigating. */
  palette?: boolean;
};

const SPOTS: Spot[] = [
  {
    pose: 'wave',
    where: 'Home',
    caption: 'Says hello on the front page.',
    href: '/',
  },
  {
    pose: 'idle',
    where: 'Home',
    caption: 'On watch, between moves.',
    href: '/',
  },
  { pose: 'throw', where: 'Home', caption: 'Shuriken out.', href: '/' },
  {
    pose: 'read',
    where: 'Writing',
    caption: 'Nose in the notes.',
    href: '/content',
  },
  {
    pose: 'storm',
    where: 'Market Storm',
    caption: 'Holds the umbrella while the market rains.',
    href: '/market-storm',
  },
  {
    pose: 'build',
    where: 'What I Built',
    caption: 'Hammer in hand, mid-build.',
    href: '/built',
  },
  {
    pose: 'game',
    where: 'Arcade',
    caption: 'Controller in hand. Don’t ask for a turn.',
    href: '/games',
  },
  {
    pose: 'meditate',
    where: 'About me',
    caption: 'Waits at the top of the path.',
    href: '/about-me#story',
  },
  {
    pose: 'run',
    where: 'About me',
    caption: 'Runs the path as you scroll it.',
    href: '/about-me#story',
  },
  {
    pose: 'shh',
    where: 'Privacy',
    caption: 'Keeps quiet about the little the site keeps.',
    href: '/privacy',
  },
  {
    pose: 'peek',
    where: 'Search',
    caption: 'Peeks over the top of search. Tap to open it.',
    palette: true,
  },
  {
    pose: 'bow',
    where: 'Every post',
    caption: 'Bows at the end, to say thanks for reading.',
    href: '/content',
  },
  {
    pose: 'sit',
    where: 'Footer',
    caption: 'Keeps watch at the bottom of every page.',
  },
  { pose: 'vanish', where: '404', caption: 'Gone in a puff of smoke. Tap it.' },
];

const FACTS: [string, string][] = [
  [
    'Pure SVG, drawn on the server.',
    'A ninja costs a few kilobytes of markup and no JavaScript.',
  ],
  [
    'He only moves while he’s on screen.',
    'Scroll him away and he stops, so a page full of ninjas costs nothing per frame.',
  ],
  [
    'His eyes follow your pointer.',
    'Or your last tap, on a phone. Move around this page and the whole gallery looks.',
  ],
  [
    'Same colours by day and by night.',
    'Like a real object. Only his outline and a rim of moonlight change with the theme.',
  ],
  [
    'Decoration, to a screen reader.',
    'He’s hidden from assistive tech; the words on the page do the talking.',
  ],
  [
    'He never covers text or blocks a tap.',
    'Every page puts him where he can do his job without getting in the way of yours.',
  ],
];

function Arrow() {
  return <IconArrowRight size={15} />;
}

function SpotBody({ spot, roof }: { spot: Spot; roof?: boolean }) {
  return (
    <>
      <span className="kp-pose-stage">
        {roof && (
          <svg
            className="kp-roof"
            viewBox="0 0 200 64"
            preserveAspectRatio="none"
            aria-hidden
            focusable="false"
          >
            <path
              d="M0 64 L0 58 Q26 56 40 30 L160 30 Q174 56 200 58 L200 64 Z"
              fill="var(--sky-mid)"
            />
            <path d="M34 26 L166 26 L162 33 L38 33 Z" fill="var(--sky-near)" />
            <path
              d="M58 40 L54 64 M82 40 L80 64 M106 40 L106 64 M130 40 L132 64 M154 40 L158 64"
              stroke="var(--sky-near)"
              strokeOpacity="0.18"
              strokeWidth="2"
            />
          </svg>
        )}
        <Kiru pose={spot.pose as KiruPose} />
      </span>
      <span className="kp-meta">
        <span className="kp-where">
          {spot.where}
          {spot.href && <Arrow />}
          {spot.palette && <IconSearch size={15} />}
        </span>
        <span className="kp-pose font-display">{spot.pose}</span>
        <span className="kp-cap">{spot.caption}</span>
      </span>
    </>
  );
}

function SpotCard({ spot }: { spot: Spot }) {
  if (spot.pose === 'vanish') {
    return (
      <div className="kp-card kp-vanish kp-wide sd-card">
        <span className="kp-pose-stage">
          <SmokeBomb hint={false}>
            <Kiru pose="wave" />
          </SmokeBomb>
        </span>
        <span className="kp-meta">
          <span className="kp-where">{spot.where}</span>
          <span className="kp-pose font-display">vanish</span>
          <span className="kp-cap">{spot.caption}</span>
        </span>
      </div>
    );
  }
  if (spot.palette) {
    return (
      <PaletteCard className="kp-card sd-card sd-tilt">
        <SpotBody spot={spot} />
      </PaletteCard>
    );
  }
  if (spot.href) {
    return (
      <Link href={spot.href} className="kp-card sd-card sd-tilt">
        <SpotBody spot={spot} />
      </Link>
    );
  }
  // The footer's sit: on a rooftop, the way the footer shows him.
  return (
    <div className="kp-card kp-sit kp-wide sd-print">
      <SpotBody spot={spot} roof />
    </div>
  );
}

export default function KiruPage() {
  return (
    <div className="kp-page pb-6">
      <style href="sd-smoke" precedence="medium">
        {SMOKE_CSS}
      </style>
      <div className="kp-top">
        <header className="kp-hero">
          <Kanji char="忍" className="sd-watermark kp-mark" />

          <div className="kp-copy">
            <p className="sd-kicker">The house ninja</p>
            <h1 className="kp-h1 font-display">
              <Slash text="Meet Kiru." />
            </h1>
            <p className="kp-lead font-read">
              Kiru is the ninja who lives on this site. His name is the Japanese
              verb <strong>kiru</strong>, &ldquo;to cut&rdquo; &mdash; and
              that&rsquo;s his job here: he cuts through hype. Every page has
              him doing that page&rsquo;s job.
            </p>
            <div className="kp-brand">
              <Seal char="忍" className="kp-brand-seal" />
              {NAME_BAKED ? (
                <span className="kp-brand-name">
                  <Kanji char="切" draw className="kp-brand-kanji" />
                  <Kanji char="る" draw className="kp-brand-kana" />
                </span>
              ) : (
                <Kanji char="斬" draw className="kp-brand-kanji" />
              )}
              <Vertical
                text="スマート・ディスラプションズ"
                className="kp-brand-tag"
              />
              <p className="kp-brand-note">
                <b>Shinobi</b> The seal is the ninja’s own character, and the
                brushwork {NAME_BAKED ? 'is his name, kiru.' : 'is a cut.'}
              </p>
            </div>
          </div>

          <div className="kp-stage">
            <span className="kp-moon" aria-hidden />
            <span className="kp-ground" aria-hidden />
            <Kiru pose="wave" mood="normal" className="kp-big" />
            <p className="kp-gaze">
              <span className="kp-gaze-fine">
                He&rsquo;s watching your pointer.
              </span>
              <span className="kp-gaze-touch">
                Tap anywhere. He&rsquo;ll look.
              </span>
            </p>
          </div>
        </header>
      </div>

      <section className="kp-sec" aria-labelledby="kp-where-title">
        <p className="sd-kicker">Thirteen poses, one rig</p>
        <h2 id="kp-where-title" className="kp-sec-title font-display">
          Where you&rsquo;ll find him
        </h2>
        <p className="kp-sec-sub">
          Every page gives him its job. Tap a card to go and see him do it.
        </p>
        <ul className="kp-grid" role="list">
          {SPOTS.map((spot) => (
            <li key={spot.pose} className={`kp-cell-${spot.pose}`}>
              <SpotCard spot={spot} />
            </li>
          ))}
        </ul>
      </section>

      <section className="kp-sec" aria-labelledby="kp-story-title">
        <p className="sd-kicker">His story&rsquo;s cast</p>
        <h2 id="kp-story-title" className="kp-sec-title font-display">
          Kiru: Path Not Taken Cast
        </h2>
        <p className="kp-sec-sub">
          The people of his story, drawn as ninja on his rig: the master who
          raised him, his oldest friend, the rich house that took him in, and
          the people of an old war. Twenty-four of them, introduced without
          spoilers.
        </p>
        {/* A static page in public/kiru/path-not-taken-cast, so a plain link, not <Link>. */}
        <a href="/kiru/path-not-taken-cast" className="kp-cast sd-card sd-tilt">
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size static card, nothing for next/image to do */}
          <img
            src="/images/kiru/path-not-taken-cast-og.webp"
            alt="Kiru the ninja between Daichi of House Sagara, in a white silk coat lined with violet and gold, and his oldest friend Koji, with Master Hideo, Lord Noboru, Captain Arai, Genji, Toma and Nami behind them, and the general Kuroda in his iron mask watching from the shadows"
            width={1200}
            height={630}
            loading="lazy"
            decoding="async"
            className="kp-cast-img"
          />
          <span className="kp-cast-cta">
            Meet the cast <Arrow />
          </span>
        </a>
      </section>

      <section className="kp-sec" aria-labelledby="kp-cast-title">
        <p className="sd-kicker">His crew, and his rogues</p>
        <h2 id="kp-cast-title" className="kp-sec-title font-display">
          The Neo Dojo Cast
        </h2>
        <p className="kp-sec-sub">
          Seven heroes in three squads, all drawn on his rig, and the six rogues
          he cuts through: hype, deepfakes, bugs in production, cloud lock-in,
          AI slop and vapourware.
        </p>
        {/* A static page in public/kiru/cast, so a plain link, not <Link>. */}
        <a href="/kiru/cast" className="kp-cast sd-card sd-tilt">
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size static card, nothing for next/image to do */}
          <img
            src="/images/kiru/neo-dojo-cast-og.webp"
            alt="Kiru leading the Neo Dojo Cast: Kage-X and Patch beside him, Nova, Captain Takotsubo, Tengu-9, Benri and Hovr behind, and the rogue Emperor Kemuri in the shadows"
            width={1200}
            height={630}
            loading="lazy"
            decoding="async"
            className="kp-cast-img"
          />
          <span className="kp-cast-cta">
            Meet the cast <Arrow />
          </span>
        </a>
      </section>

      <section className="kp-sec" aria-labelledby="kp-made-title">
        <p className="sd-kicker">Under the hood</p>
        <h2 id="kp-made-title" className="kp-sec-title font-display">
          How he&rsquo;s made
        </h2>
        <ol className="kp-facts sd-sheet" role="list">
          {FACTS.map(([lead, rest], i) => (
            <li key={lead} className="kp-fact">
              <span className="kp-fact-n" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p>
                <strong>{lead}</strong> {rest}
              </p>
            </li>
          ))}
        </ol>
        <p className="kp-more">
          The rules he lives by are written down in the site&rsquo;s{' '}
          <a href="https://github.com/smartDisruptions/web-smartDisruptions/blob/main/DESIGN.md">
            design notes
          </a>
          .
        </p>
      </section>
    </div>
  );
}
