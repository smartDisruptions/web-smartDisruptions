import type { Metadata } from 'next';
import Link from 'next/link';
import Kanji, { Seal, Slash } from '@/components/brand/Kanji';
import Noren from '@/components/about/Noren';
import AboutSwitch from '@/components/about/AboutSwitch';
import AboutNext from '@/components/about/AboutNext';
import LatestWritingSection from '@/components/home/LatestWritingSection';
import FeaturedAppsSection from '@/components/home/FeaturedAppsSection';
import StormTeaser from '@/components/home/StormTeaser';
import { getFieldNotes } from '@/lib/fieldNotes';
import { marketStormReports } from '@/data/marketStorm';
import { GAME_SLUGS } from '@/data/apps';
import { THINGS_BUILT } from '@/data/built';
import { shareMeta } from '@/lib/shareCard';
import './work.css';

const TITLE = 'About — SmartDisruptions';
const DESCRIPTION =
  'What this place is: my newest notes, the things I’ve built with AI, and Market Storm on the AI market.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/about' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/about' }),
};

/**
 * About (/about) — the work. What this place is, and the work itself: the
 * newest notes, the reel of builds and Market Storm, which opened the home
 * page until October 2026. Its sibling, /about-me, is the person; the fusuma
 * at the top of both slides between them (components/about/AboutSwitch).
 *
 * The header is a noren, the split curtain that marks a dojo's door: ai-iro
 * cloth with 場 ("place") dyed across it, Kiru peeking through the middle,
 * his feet under the hem. Swipe it and the cloth sways; tap it and he ducks
 * (components/about/Noren.tsx + NorenFX.tsx). The h1 is plain text beside
 * it, the page's LCP.
 *
 * The receipt counts are read from the site's own data at build time, so
 * they can't drift from the pages they open. Notes counts what /content
 * lists (posts plus the pinned guide), because the first card under it is
 * the guide; Things built counts what /built shows (src/data/built.ts).
 * Styles: ./work.css (au-).
 */
export default function AboutPage() {
  const lines = [
    {
      href: '/content',
      label: 'Notes from the bench',
      n: getFieldNotes().length,
    },
    {
      href: '/market-storm',
      label: 'Market Storm reports',
      n: marketStormReports.length,
    },
    { href: '/built', label: 'Things built', n: THINGS_BUILT },
    {
      href: '/games',
      label: 'Games in the arcade',
      n: GAME_SLUGS.length,
    },
  ];

  return (
    <div className="au-page">
      <AboutSwitch current="work" />

      <header className="au-hero">
        <div className="au-head">
          <p className="sd-kicker">About &middot; The work</p>
          <h1 className="au-h1 font-display">
            <span className="au-h1-line">
              <Slash text="Step inside." />
            </span>{' '}
            <span className="au-h1-line">
              <Slash text="Here’s the work." delay={0.12} />
            </span>
          </h1>
        </div>

        <div className="au-stage">
          <Noren />
          <p className="au-hint" aria-hidden>
            <Kanji char="場" className="au-hint-k" />
            <span className="au-hint-fine">
              Brush the noren aside. Kiru&rsquo;s back there.
            </span>
            <span className="au-hint-touch">
              Swipe the noren. Kiru&rsquo;s back there.
            </span>
          </p>
        </div>

        <div className="au-body">
          <p className="au-lede font-read">
            I build real things with AI. Then I show my work: honest breakdowns
            of what I build &mdash; the timeline, the method, and the parts
            worth copying.
          </p>

          {/* A receipt, because that's the rule here: receipts over claims. */}
          <div className="au-receipt sd-note">
            <p className="au-rc-shop font-display">Smart Disruptions</p>
            <p className="au-rc-sub">The work so far</p>
            <ul className="au-rc-lines" role="list">
              {lines.map((l) => (
                <li key={l.href}>
                  {/* Named by what it shows ("Notes from the bench 14"), so
                      the spoken name matches the printed one (WCAG 2.5.3). */}
                  <Link href={l.href} className="au-rc-line">
                    <span>{l.label}</span>
                    <span className="au-rc-dots" aria-hidden />
                    <b>{l.n}</b>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="au-rc-total">
              <span>Mistakes</span>
              <span className="au-rc-dots" aria-hidden />
              <b>Included. Always.</b>
            </p>
            <p className="au-rc-foot">Receipts over claims.</p>
            <Seal char="作" className="au-rc-seal" />
          </div>
        </div>
      </header>

      <LatestWritingSection />
      <FeaturedAppsSection />
      <StormTeaser />

      <AboutNext to="person" />
    </div>
  );
}
