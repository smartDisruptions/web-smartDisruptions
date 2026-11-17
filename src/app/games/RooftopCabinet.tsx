import Kiru from '@/components/kiru/Kiru';
import { Seal } from '@/components/brand/Kanji';
import RooftopRun from '@/components/arcade/RooftopRun';
import RooftopPoster from './Poster';

/**
 * Kiru's Rooftop Run, the cabinet you play on the page: its marquee, the
 * screen (a poster until Start is pressed; the game is a separate chunk the
 * press fetches) and the deck with the blurb and the keys.
 *
 * It was the Arcade's featured cabinet until 2026-11-17, when Tumbler took
 * that spot and this one moved to its own page, /games/rooftop-run, behind a
 * cabinet in the row like every other game (Josh's call).
 */
export default function RooftopCabinet() {
  return (
    <section id="rooftop-run" className="rr" aria-labelledby="rr-title" data-market="">
      <Kiru pose="game" className="rr-kiru" />
      <div className="rr-cab">
        <div className="rr-marquee">
          <Seal char="速" className="rr-seal" />
          <div>
            <p className="rr-kick">
              Free play<span className="rr-kick-more"> · plays right here</span>
            </p>
            <h1 id="rr-title" className="rr-title font-display arc-neon" data-tube="red">
              Kiru&apos;s Rooftop Run
            </h1>
          </div>
        </div>
        <div className="rr-bezel">
          <RooftopRun poster={<RooftopPoster />} helpId="rr-help" />
        </div>
        <div className="rr-deck">
          <p className="rr-blurb">
            Kiru runs the rooftops of the town below. I built six levels for him, each one timed to its own song,
            and six ways to move through them: run, kite, roll, parasol, dragon and shadow step. Practice mode
            lets you drop checkpoints, every level hides three secret scrolls, and Classic, the endless run this
            cabinet started with, is still on the menu. Nothing about the game loads until you press Start.
          </p>
          <p id="rr-help" className="rr-keys">
            <span className="rr-kbd">
              <kbd>Space</kbd> or{' '}
              <kbd>
                <span aria-hidden="true">↑</span>
                <span className="sr-only">Up arrow</span>
              </kbd>{' '}
              to jump
            </span>
            <span className="rr-touch">Tap to jump</span>
            <span>hold to keep jumping, or to climb</span>
            <span className="rr-kbd">
              <kbd>P</kbd> pause
            </span>
            <span className="rr-kbd">
              <kbd>M</kbd> sound
            </span>
            <span className="rr-kbd">
              practice: <kbd>C</kbd> / <kbd>X</kbd> checkpoints
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
