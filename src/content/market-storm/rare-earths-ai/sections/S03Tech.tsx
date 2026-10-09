import type { CSSProperties } from 'react';
import { CHAPTERS, LABELS, S03, TECH } from '../content';
import {
  Chapter,
  Fig,
  Findings,
  Rich,
  TableDetails,
  Verdict,
  Why,
} from '../ui';
import { plain } from '../islands/c-text';
import './c.css';

/*
 * 03 · Which tech will actually need magnets?
 *
 * The odds are iron filings. Each technology gets a row of twenty filings,
 * one per five points of probability. As the row scrolls up the screen an
 * invisible magnet sweeps along it: the scattered filings are pushed aside
 * and that many lie behind it in a straight line, the rest still scattered
 * on the paper. The 100 kg of magnet is a 10×10 block that assembles itself
 * row by row as it scrolls in, the five AI-specific cells dropping in last in
 * lilac, with the block's field drawn in dotted filings around it.
 *
 * All of it is server-rendered and moved by scroll timelines on the
 * compositor (transform and opacity only). Every moving part is a group, not
 * a filing or a cell: a scroll-driven animation costs the main thread a
 * little on every scrolling frame anywhere on the page, so this chapter runs
 * nineteen of them, not two hundred. Without scroll-timeline support, or
 * under reduced motion, everything simply shows in its final place.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/** One filing per five points of probability. */
const FILINGS = 20;

/** A tiny deterministic hash → [0, 1), so the scatter is the same on every render. */
function rnd(a: number, b: number): number {
  let h = (Math.imul(a + 1, 374761393) + Math.imul(b + 1, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** A scattered filing's angle: never close to lined-up. */
const angle = (a: number, b: number) => {
  const r = rnd(a, b);
  return Math.round(
    (r < 0.5 ? -1 : 1) * (28 + (r < 0.5 ? r * 2 : (r - 0.5) * 2) * 60)
  );
};

function Odds() {
  return (
    <ol className="re-c-odds" role="list" aria-label={plain(S03.odds.aria)}>
      {TECH.map((t, i) => {
        const on = Math.round((t.p / 100) * FILINGS);
        return (
          <li key={t.label} className="re-c-odd">
            <span className="re-c-odd-l">
              <Rich text={t.label} />
            </span>
            <span className="re-c-odd-v">
              <span className="font-display" aria-hidden="true">
                {t.p}%
              </span>
              <span className="sr-only">
                {t.p}
                <Rich text={S03.odds.tipSuffix} />
              </span>
            </span>
            <span
              className="re-c-filings"
              aria-hidden="true"
              style={{ '--on': on } as Vars}
            >
              <span className="re-c-fl-set">
                {Array.from({ length: on }, (_, k) => (
                  <i key={k} />
                ))}
              </span>
              <span className="re-c-fl-loose">
                {/* SVG shapes, not twenty rotated boxes: a transformed box
                    is a layer of its own, and the page walks every layer
                    on every frame (hit testing, pre-paint). */}
                <svg className="re-c-fl-svg" focusable="false">
                  {Array.from({ length: FILINGS }, (_, k) => (
                    <rect
                      key={k}
                      style={
                        {
                          '--k': k,
                          '--r': `${angle(i, k)}deg`,
                          '--y': `${Math.round((rnd(k, i + 40) - 0.5) * 8)}px`,
                        } as Vars
                      }
                    />
                  ))}
                </svg>
              </span>
            </span>
            <span className="re-c-odd-n">
              <Rich text={t.note} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** "AI-specific: data centres, drones, robots (~5)" → 5. */
function aiCells(): number {
  const m = /\(~(\d+)\)/.exec(plain(S03.waffle.legendAi));
  return m ? Number(m[1]) : 5;
}

function Magnet() {
  const ai = aiCells();
  // The block is laid down row by row, bottom first, each row sliding in
  // from alternate sides; the top row's AI-specific cells drop in last. Each
  // group is one moving part (see the note at the top).
  const groups: { key: string; cells: number; ai?: boolean; style: Vars }[][] =
    Array.from({ length: 10 }, (_, row) => {
      const from = (side: number, o: number) =>
        ({
          '--x': `${side * Math.round(80 + rnd(row, 3) * 70)}px`,
          '--y': `${Math.round((rnd(row, 5) - 0.5) * 24)}px`,
          '--r': `${side * Math.round(3 + rnd(row, 9) * 6)}deg`,
          '--o': o.toFixed(3),
        }) as Vars;
      const side = row % 2 ? 1 : -1;
      const order = ((9 - row) / 9) * 0.78;
      if (row > 0)
        return [{ key: `r${row}`, cells: 10, style: from(side, order) }];
      return [
        {
          key: 'ai',
          cells: ai,
          ai: true,
          style: {
            '--x': '0px',
            '--y': '-70px',
            '--r': '0deg',
            '--o': '1',
          } as Vars,
        },
        { key: 'r0', cells: 10 - ai, style: from(side, 0.84) },
      ];
    });
  return (
    <div className="re-c-mag-wrap">
      <div className="re-c-mag" role="img" aria-label={plain(S03.waffle.aria)}>
        <svg
          className="re-c-mag-field"
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          {/* Field lines leave the top face and loop round to the bottom one. */}
          {[0, 1, 2, 3].map((k) => {
            // Lines from near the face's middle swing widest; those from
            // near its edge hug the block.
            const x0 = 23 + k * 6;
            const out = 9 - k * 2.6;
            return (
              <g key={k}>
                <path
                  d={`M${x0} 14 C ${x0 - 6} ${4 - k * 2}, ${out - 2} ${10 - k * 3}, ${out} 50 S ${x0 - 6} ${96 + k * 2}, ${x0} 86`}
                />
                <path
                  d={`M${100 - x0} 14 C ${106 - x0} ${4 - k * 2}, ${102 - out} ${10 - k * 3}, ${100 - out} 50 S ${106 - x0} ${96 + k * 2}, ${100 - x0} 86`}
                />
              </g>
            );
          })}
          <path d="M50 14 V 2" />
          <path d="M50 86 V 98" />
        </svg>
        <div className="re-c-mag-block">
          {groups.map((row, r) => (
            <span key={r} className="re-c-mag-row">
              {row.map((g) => (
                <span
                  key={g.key}
                  className={`re-c-mag-g${g.ai ? ' is-ai' : ''}`}
                  style={{ ...g.style, '--n': g.cells } as Vars}
                >
                  {Array.from({ length: g.cells }, (_, k) => (
                    <i key={k} />
                  ))}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <ul className="re-c-mag-key" role="list">
        <li>
          <i className="re-c-sw is-ai" aria-hidden="true" />
          <span>
            <Rich text={S03.waffle.legendAi} />
          </span>
        </li>
        <li>
          <i className="re-c-sw" aria-hidden="true" />
          <span>
            <Rich text={S03.waffle.legendRest} />
          </span>
        </li>
      </ul>
    </div>
  );
}

export default function S03Tech() {
  return (
    <Chapter chapter={CHAPTERS[2]} glyph="器" className="re-c-ch">
      <Verdict text={S03.verdict} />

      <Fig title={S03.odds.title} sub={S03.odds.sub} source={S03.odds.source}>
        <Odds />
        <TableDetails
          summary={LABELS.showTable}
          head={S03.odds.tableHead}
          rows={TECH.map((t) => [t.label, `${t.p}%`, t.note])}
          numeric={[1]}
        />
      </Fig>

      <Fig
        title={S03.waffle.title}
        source={S03.waffle.source}
        className="re-c-mag-fig"
      >
        <Magnet />
      </Fig>

      <Findings items={S03.findings} />
      <Why text={S03.why} />
    </Chapter>
  );
}
