import type { Metadata } from 'next';
import Link from 'next/link';
import { apps, ARCADE_ARCHIVE_SLUGS, ARCADE_DEMO_SLUGS, type App } from '@/data/apps';
import Kanji from '@/components/brand/Kanji';
import Cabinets from '../Cabinets';
import '../arcade.css';

export const metadata: Metadata = {
  title: 'Arcade archive',
  description:
    "The Arcade's older cabinets, both still free to play: a cloth simulator and chores turned into a game. Plus a Demo section of rough builds to try.",
  alternates: { canonical: '/games/archive' },
};

/**
 * THE ARCADE'S ARCHIVE — the back room (October 2026).
 *
 * Josh's call, 2026-10-05: the front room (/games) keeps Kiru's games and Neo
 * Dojo Survivors, and every other game moved here, behind the door at the
 * bottom of that page. The line-up is ARCADE_ARCHIVE_SLUGS in
 * src/data/apps.ts, in its old cabinet order, and the cabinets are the same
 * component as the front room's, so the two can't drift. Each game here still
 * has its own page, and its links still work. AUREUM Snake was the third
 * cabinet until it came off the site (Josh's call, 2026-10-12); its old
 * addresses redirect (next.config.ts).
 *
 * Below the cabinets, the Demo section (Josh's call, 2026-10-14): rough or
 * greybox builds that play but aren't finished things, starting with Tether
 * Ball. They are ARCADE_DEMO_SLUGS, kept apart from GAME_SLUGS on purpose, so
 * /about's list of what I've built never shows them.
 */

const bySlug = (slugs: string[]) =>
  slugs.map((slug) => apps.find((app) => app.slug === slug)).filter((app): app is App => app !== undefined);
const games = bySlug(ARCADE_ARCHIVE_SLUGS);
const demos = bySlug(ARCADE_DEMO_SLUGS);

const BackArrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 10H5M9 5.5 4.5 10 9 14.5" />
  </svg>
);

export default function ArcadeArchive() {
  return (
    <div className="arc">
      <div className="arc-wrap">
        <header className="arc-hero arc-hero-archive">
          <Kanji char="遊" className="arc-watermark" />
          <p className="arc-kicker">★ Continue? ★</p>
          <h1 className="arc-title font-display">
            <span className="arc-neon" data-tube="amber">
              Archive
            </span>
          </h1>
          <p className="arc-lead font-read">
            The Arcade&apos;s older cabinets. Kiru, the Neo Dojo, a duel still in pre-alpha, Cosmo on the moon and Pip&apos;s Broom &amp; Blade Arcade have the
            front room now, but every one of these still plays.
          </p>
          <Link href="/games" className="arc-back">
            <BackArrow />
            Back to the arcade
          </Link>
        </header>

        <Cabinets games={games} from="archive" title="The older cabinets" titleId="arc-archive-cabinets" />

        {demos.length > 0 && <Cabinets games={demos} from="archive" title="Demo" titleId="arc-demo-cabinets" />}

        <div className="arc-end">
          <p className="arc-end-line">
            <span style={{ color: 'var(--arc-pink-ink)' }}>──</span>{' '}
            <span style={{ color: 'var(--arc-amber-ink)' }}>Continue?</span>{' '}
            <span style={{ color: 'var(--arc-cyan-ink)' }}>— Insert coin —</span>{' '}
            <span style={{ color: 'var(--arc-pink-ink)' }}>──</span>
          </p>
          <p className="arc-end-gabe">
            <Link href="/games" className="arc-end-link">
              Back to the arcade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
