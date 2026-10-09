import { CHAPTERS, S09 } from '../content';
import { Chapter, Rich, Verdict, Why } from '../ui';
import './e.css';

/*
 * 09 · Things most people miss — six cards pinned to the board by a magnet.
 *
 * Each title is stamped in ink (a rubber-stamp texture, a mask painted once);
 * each card carries a small horseshoe magnet with its own iron filings drawn
 * to it. As a card scrolls in it snaps to its magnet (a scroll timeline:
 * transforms only, no script). Without scroll timelines, or under reduced
 * motion, the cards are simply in place.
 */

function Magnet() {
  return (
    <svg
      className="re-e-mag"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="rotate(-135 16 16)">
        <path className="re-e-mag-u" d="M10 6v10a6 6 0 0 0 12 0V6" />
        <path className="re-e-mag-t" d="M10 5.5v4.5M22 5.5v4.5" />
      </g>
    </svg>
  );
}

export default function S09Missed() {
  return (
    <Chapter chapter={CHAPTERS[8]} glyph="影" className="re-e-missed">
      <Verdict text={S09.verdict} />
      <ul className="re-e-cards" role="list">
        {S09.factors.map((f) => (
          <li key={f.title} className="re-e-card">
            <Magnet />
            <h3 className="re-e-stamp">{f.title}</h3>
            <p className="font-read re-e-card-p">
              <Rich text={f.text} />
            </p>
          </li>
        ))}
      </ul>
      <Why text={S09.why} />
    </Chapter>
  );
}
