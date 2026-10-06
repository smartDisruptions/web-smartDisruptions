import type { Metadata } from 'next';
import Link from 'next/link';
import { apps, ARCADE_ARCHIVE_SLUGS, type App } from '@/data/apps';
import Kanji from '@/components/brand/Kanji';
import Cabinets from '../Cabinets';
import '../arcade.css';

export const metadata: Metadata = {
  title: 'Arcade archive',
  description:
    "The Arcade's older cabinets, all still free to play: a kart racer my son Gabe built, a mystery in a locked filing cabinet, a cloth simulator, chores turned into a game, a honeycomb puzzle and Snake in gold.",
  alternates: { canonical: '/games/archive' },
};

/**
 * THE ARCADE'S ARCHIVE — the back room (October 2026).
 *
 * Josh's call, 2026-10-05: the front room (/games) keeps Kiru's games and Neo
 * Dojo Survivors, and every other game moved here, behind the door at the
 * bottom of that page. The line-up is ARCADE_ARCHIVE_SLUGS in
 * src/data/apps.ts, in its old cabinet order, and the cabinets are the same
 * component as the front room's, so the two can't drift. Nothing here was
 * taken down: each game still has its own page, and its links still work.
 */

const games = ARCADE_ARCHIVE_SLUGS.map((slug) => apps.find((app) => app.slug === slug)).filter(
  (app): app is App => app !== undefined,
);

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
            The Arcade&apos;s older cabinets. Kiru, the Neo Dojo, a duel still in pre-alpha and Pip&apos;s Broom &amp; Blade Arcade have the
            front room now, but every one of these still plays, including Pebble Kart, the kart racer my son Gabe built himself.
          </p>
          <Link href="/games" className="arc-back">
            <BackArrow />
            Back to the arcade
          </Link>
        </header>

        <Cabinets games={games} from="archive" title="The older cabinets" titleId="arc-archive-cabinets" />

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
