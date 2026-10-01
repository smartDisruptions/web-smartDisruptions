import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import SubscribeForm from '@/components/SubscribeForm';

/**
 * The last tile in the notes grid: the newsletter, with Kiru meditating while
 * he waits for the next one. Rendered on the server and handed to the client
 * list as a prop, so his SVG never ships as client JavaScript. It fills
 * whatever the last row of the grid leaves open (see `.wr-grid-end`).
 */
export default function NewsletterTile() {
  return (
    <aside className="wr-end" aria-labelledby="wr-end-title">
      <span aria-hidden className="wr-end-clip">
        <Kanji char="新" className="wr-end-mark" />
      </span>
      <Kiru pose="meditate" className="wr-end-kiru" />
      <p className="sd-kicker">The newsletter</p>
      <h2 id="wr-end-title" className="font-display wr-end-title">
        Want the next build?
      </h2>
      <p className="wr-end-copy">
        One email when I publish a new breakdown — what I built, how, and what
        I learned. No spam, ever.
      </p>
      <SubscribeForm source="site" className="wr-end-form" />
    </aside>
  );
}
