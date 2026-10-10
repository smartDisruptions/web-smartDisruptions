'use client';

import {
  Fragment,
  memo,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { symbolEms } from './d-util';

/**
 * 05 · The periodic table of rare-earth stocks.
 *
 * Twelve element tiles in three "periods" (how far along each company is),
 * a chain of four step buttons that dims every tile not doing that step, and
 * a specimen label that slides out under a tile when you tap it (Escape puts
 * it back). The step buttons come after the tiles and dock at the bottom of
 * the screen while the table is on it, where a thumb is.
 *
 * Every word arrives as a prop, already rendered on the server from
 * content.ts; this island only owns which step is lit and which tile is
 * open. A tap re-renders only the tiles whose state it changes (they are
 * memoised), and the motion is opacity and transform only: dimming is an
 * opacity transition, the label rises in on transform. The first frame is
 * the server's.
 */

export type DStep = 'dig' | 'sep' | 'metal' | 'mag';
export const D_STEPS: DStep[] = ['dig', 'sep', 'metal', 'mag'];

export interface DTile {
  ticker: string;
  kind: 'ok' | 'unv' | 'fix';
  steps: DStep[];
  /** the tile's face is a button, so its words come as plain text */
  face: { name: string; status: string; price: string[] };
  /** the label under it renders the content's full markup */
  status: ReactNode;
  note: ReactNode;
  stepsText: ReactNode;
  price: ReactNode;
}

export interface DPeriod {
  kind: 'ok' | 'unv' | 'fix';
  label: ReactNode;
  tiles: DTile[];
}

/** UI words for the four steps (01 names them: dig → separate → metal → magnets). */
const STEP_LABEL: Record<DStep, string> = {
  dig: 'Dig',
  sep: 'Separate',
  metal: 'Metal',
  mag: 'Magnets',
};

/**
 * Four pips, top to bottom in chain order, like the shells down an
 * element's edge. `hot` is the step the filter has lit, if this one does it.
 */
function Pips({
  on,
  hot,
  className,
}: {
  on: DStep[];
  hot?: DStep | null;
  className: string;
}) {
  return (
    <span className={className} aria-hidden="true">
      {D_STEPS.map((s) => (
        <i
          key={s}
          className={on.includes(s) ? (s === hot ? 'on hot' : 'on') : undefined}
        />
      ))}
    </span>
  );
}

const Tile = memo(function Tile({
  t,
  n,
  head,
  isOpen,
  dim,
  hot,
  onToggle,
  register,
}: {
  t: DTile;
  n: number;
  head: readonly string[];
  isOpen: boolean;
  dim: boolean;
  hot: DStep | null;
  onToggle: (ticker: string) => void;
  register: (ticker: string, el: HTMLButtonElement | null) => void;
}) {
  const id = `re-d-label-${t.ticker}`;
  return (
    <>
      <button
        type="button"
        ref={(el) => register(t.ticker, el)}
        className="re-d-el"
        data-kind={t.kind}
        data-dim={dim || undefined}
        data-open={isOpen || undefined}
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => onToggle(t.ticker)}
        style={{ '--em': symbolEms(t.ticker).toFixed(2) } as CSSProperties}
      >
        <span className="re-d-el-z" aria-hidden="true">
          {String(n).padStart(2, '0')}
        </span>
        <span className="re-d-el-symw">
          <span className="re-d-el-sym">{t.ticker}</span>
        </span>
        <span className="re-d-el-name">{t.face.name}</span>
        <span className={`re-flag is-${t.kind} re-d-el-flag`}>
          {t.face.status}
        </span>
        <Pips on={t.steps} hot={hot} className="re-d-pips re-d-el-pips" />
        <span className="re-d-el-price">
          {t.face.price.map((part, i) => (
            <Fragment key={i}>
              {i > 0 && ' · '}
              <span className="re-d-nw">{part}</span>
            </Fragment>
          ))}
        </span>
        {isOpen && <span className="re-d-el-notch" aria-hidden="true" />}
      </button>
      <div
        id={id}
        className="re-d-label sd-note"
        role="region"
        aria-label={t.ticker}
        hidden={!isOpen}
      >
        <dl className="re-d-label-dl">
          <div>
            <dt>{head[2]}</dt>
            <dd>
              <span className="re-d-label-chain" aria-hidden="true">
                {D_STEPS.map((s) => (
                  <span
                    key={s}
                    className={t.steps.includes(s) ? 'on' : undefined}
                  >
                    {STEP_LABEL[s]}
                  </span>
                ))}
              </span>
              <span className="re-d-label-text">{t.stepsText}</span>
            </dd>
          </div>
          <div>
            <dt>{head[3]}</dt>
            <dd>
              <span className={`re-flag is-${t.kind}`}>{t.status}</span>{' '}
              {t.note}
            </dd>
          </div>
          <div>
            <dt>{head[4]}</dt>
            <dd className="re-d-label-price">{t.price}</dd>
          </div>
        </dl>
      </div>
    </>
  );
});

export default function DTable({
  periods,
  head,
}: {
  periods: DPeriod[];
  /** S05.table.head: Ticker, Company, Steps it does, Status, Latest price */
  head: readonly string[];
}) {
  const [step, setStep] = useState<DStep | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const faces = useRef(new Map<string, HTMLButtonElement>());

  const all = periods.flatMap((p) => p.tiles);
  const numberOf = new Map(all.map((t, i) => [t.ticker, i + 1]));
  const lit = step ? all.filter((t) => t.steps.includes(step)) : all;

  const onToggle = useCallback(
    (ticker: string) => setOpen((o) => (o === ticker ? null : ticker)),
    []
  );
  const register = useCallback(
    (ticker: string, el: HTMLButtonElement | null) => {
      if (el) faces.current.set(ticker, el);
      else faces.current.delete(ticker);
    },
    []
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      faces.current.get(open)?.focus();
      setOpen(null);
    }
  };

  return (
    <div className="re-d-pt" onKeyDown={onKeyDown}>
      {periods.map((p) => (
        <div
          key={p.kind}
          className="re-d-period"
          data-kind={p.kind}
          role="group"
          aria-labelledby={`re-d-period-${p.kind}`}
        >
          <p className="re-d-period-l" id={`re-d-period-${p.kind}`}>
            <i aria-hidden="true" />
            <span>{p.label}</span>
          </p>
          <div className="re-d-grid">
            {p.tiles.map((t) => {
              const does = step !== null && t.steps.includes(step);
              const isOpen = open === t.ticker;
              return (
                <Tile
                  key={t.ticker}
                  t={t}
                  n={numberOf.get(t.ticker) ?? 0}
                  head={head}
                  isOpen={isOpen}
                  dim={step !== null && !does && !isOpen}
                  hot={does ? step : null}
                  onToggle={onToggle}
                  register={register}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div className="re-d-dock">
        <div
          className="re-d-chain"
          role="group"
          aria-label="Show which companies do a step"
        >
          <button
            type="button"
            className="re-d-chip re-d-chip-all"
            aria-pressed={step === null}
            onClick={() => setStep(null)}
          >
            All
          </button>
          {D_STEPS.map((s) => (
            <button
              key={s}
              type="button"
              className="re-d-chip"
              data-s={s}
              aria-pressed={step === s}
              onClick={() => setStep((cur) => (cur === s ? null : s))}
            >
              <Pips on={[s]} className="re-d-pips re-d-chip-pips" />
              <span className="re-d-chip-l">{STEP_LABEL[s]}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {step
          ? `${STEP_LABEL[step]}: ${lit.map((t) => t.ticker).join(', ')}`
          : ''}
      </p>
    </div>
  );
}
