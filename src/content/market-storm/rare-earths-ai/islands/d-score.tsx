'use client';

import {
  memo,
  type CSSProperties,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { play, reducedMotion, snap, type Snap } from './d-flip';

/**
 * 06 · The AI scorecard, sortable.
 *
 * A real table (with explicit roles, because phones lay its rows out as
 * cards): a row header per company, three 0–5 meters, the verdict. The
 * column headers are buttons; a click sorts (most first, then fewest, then
 * back to the auditor's order) and the rows glide to their new places on
 * transforms (FLIP). Ties keep the auditor's order. Private companies wear
 * hatching and a tag, so they stay findable wherever a sort puts them.
 */

export type DScoreKey = 'name' | 'uses' | 'sells' | 'partners';

export interface DScoreRow {
  key: string;
  /** the name to sort by (private companies sort by the name after the tag) */
  sortName: string;
  /** "Private:" for the private companies, else null */
  tag: ReactNode | null;
  name: ReactNode;
  uses: number;
  sells: number;
  partners: number;
  verdict: ReactNode;
}

type Sort = { key: DScoreKey; dir: 'asc' | 'desc' } | null;

type MeterKey = 'uses' | 'sells' | 'partners';
const METERS: MeterKey[] = ['uses', 'sells', 'partners'];

/**
 * A meter: five squares and the score. The squares are one element drawn
 * with gradients (filled up to --v), not five: a sort moves every row, and
 * a moved row is restyled whole, so each element a row doesn't have is
 * work a sort doesn't do.
 */
function Meter({ v, max = 5 }: { v: number; max?: number }) {
  return (
    <span className="re-d-m">
      <span
        className="re-d-m-sq"
        style={{ '--v': v } as CSSProperties}
        aria-hidden="true"
      />
      <span className="re-d-m-v">
        {v}
        <span className="sr-only"> out of {max}</span>
      </span>
    </span>
  );
}

/**
 * One company's row. Memoised: a sort only moves rows, so React reorders
 * them without re-rendering what is inside (the sorted column's band is
 * drawn by CSS from the table's data-sort).
 */
const Row = memo(function Row({
  r,
  register,
}: {
  r: DScoreRow;
  register: (key: string, el: HTMLTableRowElement | null) => void;
}) {
  return (
    <tr
      role="row"
      className="re-d-sc-row"
      data-private={r.tag ? '' : undefined}
      ref={(el) => register(r.key, el)}
    >
      <th role="rowheader" scope="row" className="re-d-sc-name">
        {r.tag && (
          <>
            <span className="re-d-sc-tag">{r.tag}</span>{' '}
          </>
        )}
        {r.name}
      </th>
      {METERS.map((k, i) => (
        <td key={k} role="cell" className={`re-d-sc-m re-d-sc-m${i + 1}`}>
          <Meter v={r[k]} />
        </td>
      ))}
      <td role="cell" className="re-d-sc-v">
        {r.verdict}
      </td>
    </tr>
  );
});

function next(cur: Sort, key: DScoreKey): Sort {
  // Names read A→Z first; scores read most first.
  const first = key === 'name' ? 'asc' : 'desc';
  if (!cur || cur.key !== key) return { key, dir: first };
  if (cur.dir === first) return { key, dir: first === 'asc' ? 'desc' : 'asc' };
  return null;
}

export default function DScore({
  head,
  rows,
  caption,
}: {
  /** S06.card.head: Company, Uses AI, Sells to AI, Tech partners, Verdict */
  head: readonly string[];
  rows: DScoreRow[];
  caption: string;
}) {
  const [sort, setSort] = useState<Sort>(null);
  const trs = useRef(new Map<string, HTMLTableRowElement>());
  const before = useRef<Snap | null>(null);
  const register = useCallback(
    (key: string, el: HTMLTableRowElement | null) => {
      if (el) trs.current.set(key, el);
      else trs.current.delete(key);
    },
    []
  );

  const order = rows.map((r, i) => ({ r, i }));
  if (sort) {
    const dir = sort.dir === 'asc' ? 1 : -1;
    order.sort((a, b) => {
      const d =
        sort.key === 'name'
          ? a.r.sortName.localeCompare(b.r.sortName, 'en')
          : a.r[sort.key] - b.r[sort.key];
      return d * dir || a.i - b.i;
    });
  }

  const sortBy = (key: DScoreKey) => {
    if (!reducedMotion()) before.current = snap(trs.current.values());
    setSort((cur) => next(cur, key));
  };

  useLayoutEffect(() => {
    const b = before.current;
    before.current = null;
    if (b)
      play(trs.current.values(), b, {
        duration: 360,
        stagger: 8,
        maxDelay: 64,
      });
  }, [sort]);

  const cols: { key: DScoreKey; label: string; cls: string }[] = [
    { key: 'name', label: head[0], cls: 're-d-sc-hname' },
    { key: 'uses', label: head[1], cls: 're-d-sc-h1' },
    { key: 'sells', label: head[2], cls: 're-d-sc-h2' },
    { key: 'partners', label: head[3], cls: 're-d-sc-h3' },
  ];
  const label = (k: DScoreKey) => cols.find((c) => c.key === k)!.label;
  const how = !sort
    ? ''
    : sort.key === 'name'
      ? sort.dir === 'asc'
        ? 'A to Z'
        : 'Z to A'
      : sort.dir === 'desc'
        ? 'most first'
        : 'fewest first';

  return (
    <div className="re-d-sc" data-sort={sort?.key}>
      <p className="re-d-sc-status" aria-live="polite">
        {sort ? (
          <>
            Sorted by <strong>{label(sort.key)}</strong>, {how}
          </>
        ) : (
          'Tap a heading to sort'
        )}
      </p>
      <table className="re-d-sc-t" role="table">
        <caption className="sr-only">{caption}</caption>
        <thead role="rowgroup">
          <tr role="row" className="re-d-sc-row re-d-sc-head">
            {cols.map((c) => {
              const on = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  role="columnheader"
                  scope="col"
                  className={c.cls}
                  aria-sort={
                    on
                      ? sort!.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <button
                    type="button"
                    className="re-d-sc-sort"
                    data-dir={on ? sort!.dir : undefined}
                    onClick={() => sortBy(c.key)}
                  >
                    {c.label}
                    <svg
                      className="re-d-sc-arrow"
                      viewBox="0 0 8 12"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path className="re-d-sc-up" d="M4 0 8 5H0z" />
                      <path className="re-d-sc-down" d="M4 12 0 7h8z" />
                    </svg>
                  </button>
                </th>
              );
            })}
            <th role="columnheader" scope="col" className="re-d-sc-hv">
              {head[4]}
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          {order.map(({ r }) => (
            <Row key={r.key} r={r} register={register} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
