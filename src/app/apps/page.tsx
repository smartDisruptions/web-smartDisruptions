import type { Metadata } from 'next';
import AboutNext from '@/components/about/AboutNext';
import WorkThreshold from '@/components/about/work/threshold/WorkThreshold';
import WorkWall from '@/components/about/work/wall/WorkWall';
import { GlyphSprite } from '@/components/about/work/glyphs';
import ScrollPad from '@/components/about/work/ScrollPad';
import { shareMeta } from '@/lib/shareCard';
import './work.css';

const TITLE = 'Apps — SmartDisruptions';
const DESCRIPTION =
  'Everything I’ve built with AI: websites, apps and games, all online and free to try. Receipts included.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/apps' },
  ...shareMeta({ title: TITLE, description: DESCRIPTION, path: '/apps' }),
};

/**
 * Apps (/apps) — the work. It was About's first page (/about) until
 * November 2026, when it took Writing's place in the nav as Apps and
 * Writing took its place beside About Me (Josh's call). /about still
 * shows this page (app/about/page.tsx says why).
 *
 * What I Built (/built) was folded into this page in October 2026 (Josh's
 * call), and its nav tab went with it; /built redirects here, and each thing
 * keeps its own page at /built/<slug>. Its sibling, /about-me, is the
 * person; the fusuma at the top of both slides between them
 * (components/about/AboutSwitch).
 *
 * The page is a short stack (Josh, 2026-10-26: the four projects, More
 * builds and the games came off, leaving the wall to hold all of it):
 *
 *  1. the threshold — the noren, the h1 (the LCP) and the receipt, whose
 *     lines open the wall;
 *  2. everything on one wall (#wall), the ring (a spiral since
 *     2026-11-17, once it passed seventeen plaques), reading the same
 *     lists as the receipt (components/about/work/data.ts), so a count
 *     can't disagree with the plaques;
 *  3. the card to About Me.
 *
 * Every kanji and seal in those sections is drawn from one copy of its
 * glyph, the sprite rendered first here (components/about/work/glyphs.tsx).
 *
 * Styles: ./work.css (au-) for the page itself.
 */
export default function AppsPage() {
  return (
    <div className="au-page">
      <ScrollPad />
      <GlyphSprite />
      <WorkThreshold />
      <WorkWall />
      <AboutNext to="person" />
    </div>
  );
}
