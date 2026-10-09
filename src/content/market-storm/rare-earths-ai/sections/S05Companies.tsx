import { Fragment, type CSSProperties } from 'react';
import { CHAPTERS, COMPANIES, DROP, S05, type StatusKind } from '../content';
import {
  Chapter,
  Fig,
  Findings,
  Flag,
  Rich,
  TableDetails,
  Verdict,
  Why,
} from '../ui';
import DTable, { type DPeriod, type DStep } from '../islands/d-table';
import { plain, symbolEms } from '../islands/d-util';
import DArm from '../islands/d-arm';
import './d.css';

/**
 * 05 · Meet the companies — a periodic table of rare-earth stocks.
 *
 * Each company is an element tile: its ticker is the symbol, its latest
 * dated price sits where an atomic mass would, and four pips show which of
 * the four steps from chapter 01 (dig → separate → metal → magnets) its
 * "Steps it does" covers. The rows are periods of maturity, by the status
 * the fact-checker gave each one. Then the fall: every stock that came down
 * from its 52-week high hangs from that high on a thread as long as the drop.
 */

/**
 * Which of the four steps each company's "Steps it does" names. A reading
 * of that column so the tiles can show it at a glance; the column's own
 * words are on the page beside it (the tile's label and the table).
 */
const STEPS_OF: Record<string, DStep[]> = {
  LYC: ['dig', 'sep'], // Mine → separate (incl. heavies)
  MP: ['dig', 'sep', 'metal', 'mag'], // Mine → separate → metal → magnets → recycle
  '600111': ['dig', 'sep', 'metal', 'mag'], // Everything, state-owned
  NEO: ['sep', 'metal', 'mag'], // Separate → metal → magnets
  ILU: ['dig', 'sep'], // Mineral sands → refinery (2027)
  UUUU: ['sep'], // Separate (Utah) + uranium
  USAR: ['dig', 'metal', 'mag'], // Metal → magnets; mines (TX, Brazil)
  ARU: ['dig', 'sep'], // Mine + separate (Nolans)
  ARA: ['dig', 'sep'], // Mine + heavy separation (LA)
  UCU: ['sep'], // Separate (Louisiana, RapidSX)
  CRML: ['dig'], // Mine (Tanbreez)
  NB: ['dig'], // Mine (Nebraska)
};

const KINDS: StatusKind[] = ['ok', 'unv', 'fix'];

/** A drop as printed: a true minus sign, as the chart's description reads it. */
const pct = (v: number) => `${v < 0 ? '−' : ''}${Math.abs(v)}%`;

/** "A$15.32 · late Aug": a price and its date, each kept whole on a line. */
function Price({ text }: { text: string }) {
  return text.split(' · ').map((part, i) => (
    <Fragment key={i}>
      {i > 0 && ' · '}
      <span className="re-d-nw">
        <Rich text={part} />
      </span>
    </Fragment>
  ));
}

/** "$100.25 (18 Sep)" → the amount, then its date on a line of its own. */
function Lines({ text }: { text: string }) {
  return text.split(/ (?=\()/).map((part, i) => (
    <span key={i} className="re-d-line">
      {part}
    </span>
  ));
}

function periods(): DPeriod[] {
  return KINDS.map((kind) => {
    const rows = COMPANIES.filter((c) => c.status.kind === kind);
    return {
      kind,
      // The period's name is the statuses in it, as the table words them.
      label: [...new Set(rows.map((c) => c.status.text))].map((t, i) => (
        <Fragment key={t}>
          {i > 0 && ' · '}
          <Rich text={t} />
        </Fragment>
      )),
      tiles: rows.map((c) => ({
        ticker: c.ticker,
        kind,
        steps: STEPS_OF[c.ticker] ?? [],
        face: {
          name: plain(c.name),
          status: plain(c.status.text),
          price: plain(c.price).split(' · '),
        },
        status: <Rich text={c.status.text} />,
        note: <Rich text={c.status.note} />,
        stepsText: <Rich text={c.steps} />,
        price: <Price text={c.price} />,
      })),
    };
  }).filter((p) => p.tiles.length > 0);
}

/** The fall from the 52-week high: weights on threads from a ceiling. */
function Fall() {
  return (
    <div className="re-d-fall" id="re-d-fall">
      <div className="re-d-fall-scale" aria-hidden="true">
        {[25, 50, 75, 100].map((t) => (
          <span key={t} style={{ '--t': t / 100 } as CSSProperties}>
            {pct(-t)}
          </span>
        ))}
      </div>
      <ol className="re-d-fall-cols" aria-label={S05.drop.aria} data-d-in="">
        {DROP.map((d, i) => {
          const detail = plain(d.detail);
          const [hi, lo] = detail.split(' → ');
          return (
            <li
              key={d.ticker}
              style={
                {
                  '--d': Math.abs(d.pct) / 100,
                  '--i': i,
                  '--em': symbolEms(d.ticker).toFixed(2),
                } as CSSProperties
              }
            >
              <span className="sr-only">
                {d.ticker} {pct(d.pct)}
                {S05.drop.tipSuffix.replace(/^%/, '')}: {detail}
              </span>
              <span className="re-d-ghost" aria-hidden="true">
                {lo ? <Lines text={hi} /> : null}
              </span>
              <span className="re-d-bob" aria-hidden="true">
                <span className="re-d-bob-tile">
                  <b className="re-d-bob-sym">{d.ticker}</b>
                  <b className="re-d-bob-pct">{pct(d.pct)}</b>
                </span>
                <span className="re-d-bob-lo">
                  <Lines text={lo ? `→ ${lo}` : detail} />
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function S05Companies() {
  return (
    <Chapter chapter={CHAPTERS[4]} glyph="場" className="re-d-ch">
      <Verdict text={S05.verdict} />
      <Fig
        title={S05.table.title}
        source={S05.table.source}
        className="re-d-wide re-d-fig-pt"
      >
        <DTable periods={periods()} head={S05.table.head} />
        <TableDetails
          head={S05.table.head}
          rows={COMPANIES.map((c) => [
            c.ticker,
            c.name,
            c.steps,
            <>
              <Flag kind={c.status.kind}>
                <Rich text={c.status.text} />
              </Flag>{' '}
              <Rich text={c.status.note} />
            </>,
            c.price,
          ])}
          numeric={[4]}
          caption={plain(S05.table.title)}
        />
      </Fig>
      <Fig
        title={S05.drop.title}
        sub={S05.drop.sub}
        source={S05.drop.source}
        className="re-d-fig-fall"
      >
        <Fall />
        <DArm id="re-d-fall" threshold={0.7} />
      </Fig>
      <Findings items={S05.findings} />
      <Why text={S05.why} />
    </Chapter>
  );
}
