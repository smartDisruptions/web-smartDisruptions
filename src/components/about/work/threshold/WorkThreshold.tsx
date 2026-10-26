import { Slash } from '@/components/brand/Kanji';
import { Glyph, GlyphSeal } from '@/components/about/work/glyphs';
import Noren from '@/components/about/Noren';
import { WORK_IDS, counts } from '@/components/about/work/data';
import ThresholdFX from './ThresholdFX';
import './threshold.css';

/**
 * The threshold of /about: the door into the work, before the work itself.
 *
 * The h1 is plain text, the page's LCP. Beside it (under it on a phone) the
 * dojo's doorway: a tiled eave, the noren in ai-iro with 場 ("place") dyed
 * across it, Kiru peeking through the middle, and the room's lantern light
 * leaking out of every gap and pooling on the ground. Swipe the cloth and it
 * sways, and the light comes up with it; tap it and Kiru ducks
 * (components/about/Noren.tsx + NorenFX.tsx).
 *
 * Then the receipt, because that's the rule here: receipts over claims. It is
 * a till slip on a lacquered till. While the till is on its way up the
 * screen it rides the bottom edge (position: sticky, which the compositor
 * handles, so it costs nothing per frame), and the paper, which never moves,
 * comes up out of its slot as you scroll: the shop's name first, then each
 * line in order. When the whole slip is out the till settles under it and
 * the 作 seal stamps down (ThresholdFX notices; the stamp is CSS). Under
 * reduced motion, without JavaScript or without sticky support, it is simply
 * a stamped receipt on its till.
 *
 * Last, the cue: a real link down to the wall (#wall), with a brushed arrow
 * that inks itself down when you reach it.
 *
 * The receipt counts websites, apps and games, and nothing else (Josh's
 * call, 2026-10-21), with their total. The counts are read from the site's
 * own data at build time (`counts` in ../data.ts), so they can't drift from
 * the wall, where every one of them hangs; each line opens it (the four
 * projects, More builds and the games sections came off the page on
 * 2026-10-26). Styles: ./threshold.css (au-, new parts au-th-).
 */
export default function WorkThreshold() {
  const lines = [
    { label: 'Websites', n: counts.websites },
    { label: 'Apps', n: counts.apps },
    { label: 'Games', n: counts.games },
  ];
  const total = lines.reduce((sum, l) => sum + l.n, 0);

  return (
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
        {/* Room for the eave above the doorway and the light below it. */}
        <div className="au-th-door">
          <Noren />
        </div>
        <p className="au-hint" aria-hidden>
          <Glyph char="場" className="au-hint-k" />
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
          I build real things with AI. Then I show my work: honest breakdowns of
          what I build &mdash; the timeline, the method, and the parts worth
          copying. Everything below is online, and all of it is free to try.
        </p>
      </div>

      <div className="au-th-till">
        {/* A receipt, because that's the rule here: receipts over claims. */}
        <div className="au-receipt sd-note">
          <p className="au-rc-shop font-display">Smart Disruptions</p>
          <p className="au-rc-sub">The work so far</p>
          <ul className="au-rc-lines" role="list">
            {lines.map((l) => (
              <li key={l.label}>
                {/* Named by what it shows ("Games 12"), so the spoken name
                    matches the printed one (WCAG 2.5.3). Each line opens the
                    wall further down, so it is a plain anchor: through
                    next/link a same-page jump became a router navigation
                    wrapped in a full-page view transition, so the page froze
                    for the capture and cross-faded instead of simply
                    scrolling. */}
                <a href={`#${WORK_IDS.wall}`} className="au-rc-line">
                  <span>{l.label}</span>
                  <span className="au-rc-dots" aria-hidden />
                  <b>{l.n}</b>
                </a>
              </li>
            ))}
          </ul>
          <p className="au-rc-total">
            <span>Total</span>
            <span className="au-rc-dots" aria-hidden />
            <b>{total}</b>
          </p>
          {/* Not a count, so it sits under the total, not beside it. */}
          <p className="au-rc-total au-rc-note">
            <span>Mistakes</span>
            <span className="au-rc-dots" aria-hidden />
            <b>Included. Always.</b>
          </p>
          <p className="au-rc-foot">
            Receipts over claims. All of it, on one wall.
          </p>
          <GlyphSeal char="作" className="au-rc-seal" />
        </div>
        {/* The till the slip comes out of: a lacquered box with a slot, a
            lamp and a drawer. It rides the bottom of the screen until the
            whole slip is out (threshold.css). */}
        <div className="au-th-machine" aria-hidden>
          <i className="au-th-slot" />
          <i className="au-th-lamp" />
          <i className="au-th-drawer" />
          <i className="au-th-pull" />
        </div>
        <i className="au-th-end" aria-hidden />
      </div>

      <p className="au-th-cue">
        {/* A plain anchor, like the receipt's section lines: a jump down
            this page, not a navigation. */}
        <a href={`#${WORK_IDS.wall}`} className="au-th-cue-link">
          <span className="au-th-cue-text">See the work</span>
          <svg
            className="au-th-cue-ink"
            viewBox="0 0 40 112"
            aria-hidden
            focusable="false"
          >
            <path d="M21 2c4.5.5 6 4 5 8-1.4 20-2.6 44-3.4 68-.4 12-.8 22-1.6 30h-1.4c-.6-12-1.2-24-1.6-36-.8-22-1.4-44-2.4-62-.4-5 1.4-8.4 5.4-8ZM20.6 110c-4.2-8-9.6-14.6-16-19.4-1.2-1-.2-3 1.4-2.4 6.4 2.6 11.6 8.8 15.8 16.4ZM20 110c3.2-9 7.8-16.4 14.4-23 1-1-.2-2.8-1.6-2-6.4 3.6-11.2 10.4-14.2 18.4Z" />
          </svg>
        </a>
      </p>

      <ThresholdFX />
    </header>
  );
}
