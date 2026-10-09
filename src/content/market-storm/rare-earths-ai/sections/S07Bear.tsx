import type { CSSProperties } from 'react';
import Kanji from '@/components/brand/Kanji';
import { CHAPTERS, RED_FLAGS, S07, type StatusKind } from '../content';
import { Chapter, Fig, Findings, Rich, Verdict, Why } from '../ui';
import DArm from '../islands/d-arm';
import { plain } from '../islands/d-util';
import './d.css';

/**
 * 07 · The bear case — the skeptic's stamps.
 *
 * Beside the verdict hangs one more element tile, the company it names: as
 * the verdict scrolls by, the tile drains to a ghost and a seal lands on it.
 * It is decoration, drawn only from words the verdict itself prints.
 *
 * Then the red flags, as a ledger stamped with hanko: each company's risk is
 * pressed in vermilion as its row scrolls in, and the stamps get heavier as
 * the risk does (a faint ring at Low–Med, solid ink at High, a doubled
 * border at Extreme). The word is always in the seal; the ink only repeats it.
 */

/** How hard each risk is stamped, by the short seller's own words. */
const LEVEL: Record<string, number> = {
  'Low–Med': 1,
  Medium: 2,
  'Med–High': 3,
  High: 4,
  Extreme: 5,
};
const LEVEL_OF_KIND: Record<StatusKind, number> = { ok: 1, unv: 2, fix: 4 };
const level = (r: (typeof RED_FLAGS)[number]) =>
  LEVEL[plain(r.risk.text)] ?? LEVEL_OF_KIND[r.risk.kind];

/** The ghost tile's words, lifted from the verdict (never retyped). */
const VERDICT = plain(S07.verdict);
const GHOST = {
  name: VERDICT.match(/called ([A-Z][\w-]+)/)?.[1] ?? '',
  years: VERDICT.match(/\b(?:19|20)\d\d\b/g) ?? [],
};

function GhostTile() {
  const [born, gone] = [GHOST.years[0], GHOST.years[GHOST.years.length - 1]];
  const face = (
    <>
      <span className="re-d-gt-z">{born}</span>
      <span className="re-d-gt-sym">
        <Kanji char="倒" className="h-full w-full" />
      </span>
      <span className="re-d-gt-name">{GHOST.name}</span>
      <span className="re-d-gt-mass">{gone !== born ? gone : ''}</span>
    </>
  );
  return (
    <div className="re-d-gt" aria-hidden="true" data-d-in="">
      <span className="re-d-gt-ghost">{face}</span>
      <span className="re-d-gt-solid">{face}</span>
      <span className="re-d-gt-seal sd-seal">
        <Kanji char="倒" />
      </span>
    </div>
  );
}

/** A seal with the risk in it. In the (aria-hidden) key it is plain words. */
function Seal({
  r,
  decorative = false,
}: {
  r: (typeof RED_FLAGS)[number];
  decorative?: boolean;
}) {
  return (
    <span className="re-d-seal" data-lv={level(r)}>
      <span className="re-d-seal-t">
        {decorative ? plain(r.risk.text) : <Rich text={r.risk.text} />}
      </span>
    </span>
  );
}

export default function S07Bear() {
  const scale = RED_FLAGS.filter(
    (r, i, all) => all.findIndex((x) => x.risk.text === r.risk.text) === i
  ).sort((a, b) => level(a) - level(b));
  return (
    <Chapter chapter={CHAPTERS[6]} glyph="倒" className="re-d-ch">
      <div className="re-d-mc" id="re-d-mc">
        <GhostTile />
        <Verdict text={S07.verdict} />
      </div>
      <DArm id="re-d-mc" threshold={1} bottom="-38%" />
      <Fig
        title={S07.card.title}
        source={S07.card.source}
        className="re-d-fig-rf"
      >
        <div className="re-d-rf-scale" aria-hidden="true">
          {scale.map((r, i) => (
            <span key={r.risk.text} className="re-d-rf-step">
              {i > 0 && <i className="re-d-rf-arrow" />}
              <Seal r={r} decorative />
            </span>
          ))}
        </div>
        <div className="re-d-rf-wrap" id="re-d-rf">
          <table className="re-d-rf" role="table">
            <caption className="sr-only">{plain(S07.card.title)}</caption>
            <thead role="rowgroup">
              <tr role="row" className="re-d-rf-row re-d-rf-head">
                {S07.card.head.map((h, i) => (
                  <th
                    key={h}
                    role="columnheader"
                    scope="col"
                    className={`re-d-rf-h${i}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody role="rowgroup">
              {RED_FLAGS.map((r, i) => (
                <tr
                  key={r.name}
                  role="row"
                  className="re-d-rf-row"
                  data-lv={level(r)}
                  data-d-in=""
                  style={{ '--i': i } as CSSProperties}
                >
                  <th role="rowheader" scope="row" className="re-d-rf-name">
                    <Rich text={r.name} />
                  </th>
                  <td role="cell" className="re-d-rf-flags">
                    <Rich text={r.flags} />
                  </td>
                  <td role="cell" className="re-d-rf-risk">
                    <Seal r={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DArm id="re-d-rf" threshold={1} />
      </Fig>
      <Findings items={S07.findings} />
      <Why text={S07.why} />
    </Chapter>
  );
}
