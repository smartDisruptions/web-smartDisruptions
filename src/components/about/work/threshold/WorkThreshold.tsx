import Link from 'next/link';
import Kanji, { Seal, Slash } from '@/components/brand/Kanji';
import Noren from '@/components/about/Noren';
import { getFieldNotes } from '@/lib/fieldNotes';
import { marketStormReports } from '@/data/marketStorm';
import {
  WORK_IDS,
  catalogue,
  games,
  projects,
  wall,
} from '@/components/about/work/data';
import './threshold.css';

/**
 * The threshold of /about: what this place is, before the work itself.
 *
 * The header is a noren, the split curtain that marks a dojo's door: ai-iro
 * cloth with 場 ("place") dyed across it, Kiru peeking through the middle,
 * his feet under the hem. Swipe it and the cloth sways; tap it and he ducks
 * (components/about/Noren.tsx + NorenFX.tsx). The h1 is plain text beside
 * it, the page's LCP.
 *
 * The receipt counts are read from the site's own data at build time, so
 * they can't drift from the sections they open: the four projects,
 * everything else and the games are this page's own sections (their sum is
 * the wall), and Notes counts what /content lists (posts plus the pinned
 * guide). Styles: ./threshold.css (au-).
 */
export default function WorkThreshold() {
  const lines = [
    {
      href: `#${WORK_IDS.projects}`,
      label: 'Projects, start to finish',
      n: projects.length,
    },
    {
      href: `#${WORK_IDS.more}`,
      label: 'Smaller builds',
      n: catalogue.length,
    },
    { href: `#${WORK_IDS.games}`, label: 'Games', n: games.length },
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
  ];

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
          I build real things with AI. Then I show my work: honest breakdowns of
          what I build &mdash; the timeline, the method, and the parts worth
          copying. Everything below is online, and all of it is free to try.
        </p>

        {/* A receipt, because that's the rule here: receipts over claims. */}
        <div className="au-receipt sd-note">
          <p className="au-rc-shop font-display">Smart Disruptions</p>
          <p className="au-rc-sub">The work so far</p>
          <ul className="au-rc-lines" role="list">
            {lines.map((l) => (
              <li key={l.href}>
                {/* Named by what it shows ("Games 12"), so the spoken name
                    matches the printed one (WCAG 2.5.3). */}
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
          <p className="au-rc-foot">
            Receipts over claims. {wall.length} things, all on one wall.
          </p>
          <Seal char="作" className="au-rc-seal" />
        </div>
      </div>
    </header>
  );
}
