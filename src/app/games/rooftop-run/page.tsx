import type { Metadata } from 'next';
import Link from 'next/link';
import RooftopCabinet from '../RooftopCabinet';
import MarketFX from '../MarketFX';
import '../arcade.css';

export const metadata: Metadata = {
  title: "Kiru's Rooftop Run",
  description:
    'Kiru runs the rooftops of his town: six levels, each timed to its own song, and six ways to move through them. It plays right here on the page.',
  alternates: { canonical: '/games/rooftop-run' },
};

/**
 * KIRU'S ROOFTOP RUN — the cabinet's own page (2026-11-17).
 *
 * The game used to play at the top of /games. Tumbler is the featured game
 * there now (Josh's call), so Rooftop Run is a cabinet in the row and this is
 * where its Press Start leads: the same cabinet, the same game, one room over.
 */

const BackArrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 10H5M9 5.5 4.5 10 9 14.5" />
  </svg>
);

export default function RooftopRunPage() {
  return (
    <div className="arc">
      <MarketFX />
      <div className="arc-wrap rr-page">
        <Link href="/games" className="arc-back">
          <BackArrow />
          Back to the arcade
        </Link>
        <RooftopCabinet />
      </div>
    </div>
  );
}
