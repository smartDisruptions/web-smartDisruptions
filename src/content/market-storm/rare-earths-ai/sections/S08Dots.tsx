import type { CSSProperties } from 'react';
import { CHAINS, CHAPTERS, S08, type ChainStrength } from '../content';
import { Chapter, Rich, Verdict, Why } from '../ui';
import FluxFilter from '../islands/e-flux';
import './e.css';

/*
 * 08 · Connecting the dots — the force field.
 *
 * Each causal chain is a flux line: its four steps sit on the line like
 * stations, and a few filings of ink ride along it. The four chains that
 * push demand up flow forward in indigo; the two that push against flow
 * backward in vermilion. How many filings, and how fast, follows the chain's
 * strength. Everything is server-rendered text; the motion is CSS
 * transforms, run by a small island only while a chain is on screen and
 * never while the page scrolls (islands/e-flux.tsx).
 */

/** Filings per line and seconds per pass, by strength. */
const FLOW: Record<ChainStrength, { n: number; s: number }> = {
  strong: { n: 7, s: 2.4 },
  medium: { n: 5, s: 3.6 },
  weak: { n: 3, s: 5.6 },
  against: { n: 5, s: 3.6 },
};
/*
 * The riders of a line are one strip, two copies of the same pattern long,
 * that slides one copy's length per pass and starts again: a seamless loop
 * with one animation per line. (Twenty-eight riders each on their own
 * offset clock woke the main thread at every rider's lap — about twenty
 * style passes a second at 4× CPU; one clock per line all but none.) So the
 * filings stay irregular, each rider's nudge and length repeats with the
 * pattern, by its place in it.
 */
const JITTER = [0, 0.14, -0.1, 0.06, -0.13, 0.1, -0.05];
const LENGTH = [1, 0.7, 1.3, 0.85, 1.15, 0.75, 1.2];
/** Where rider k starts, in pattern lengths (the strip is two long). */
const at = (k: number, n: number) => (k + JITTER[k % n]) / n;
/** Bars on the little strength meter (the label says it in words). */
const BARS: Partial<Record<ChainStrength, number>> = {
  strong: 3,
  medium: 2,
  weak: 1,
};

export default function S08Dots() {
  const up = CHAINS.filter((c) => c.strength !== 'against').length;
  const counts = { all: CHAINS.length, up, against: CHAINS.length - up };
  return (
    <Chapter chapter={CHAPTERS[7]} glyph="網" className="re-e-dots">
      <Verdict text={S08.verdict} />
      <div className="re-e-flux" data-filter="all">
        <FluxFilter counts={counts} />
        <ol className="re-e-chains" role="list">
          {CHAINS.map((c, i) => {
            const dir = c.strength === 'against' ? 'against' : 'up';
            const flow = FLOW[c.strength];
            return (
              <li
                key={c.title}
                className="re-e-chain"
                data-dir={dir}
                data-str={c.strength}
                style={{ '--n': flow.n, '--d': `${flow.s}s` } as CSSProperties}
              >
                <div className="re-e-chain-head">
                  <span className="re-e-chain-n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="re-e-chain-t">{c.title}</h3>
                  <p className="re-e-str">
                    <span
                      className="re-e-meter"
                      aria-hidden="true"
                      data-bars={BARS[c.strength] ?? 0}
                    >
                      {dir === 'up' ? (
                        <>
                          <i />
                          <i />
                          <i />
                        </>
                      ) : (
                        <svg viewBox="0 0 16 12" focusable="false">
                          <path d="M15 6H2.5M6.5 1.5 2 6l4.5 4.5" />
                        </svg>
                      )}
                    </span>
                    {c.strengthLabel}
                  </p>
                </div>
                <div className="re-e-track">
                  <div className="re-e-line" aria-hidden="true">
                    <span className="re-e-filings" />
                    <span className="re-e-head" />
                  </div>
                  <div className="re-e-riders" aria-hidden="true">
                    <span className="re-e-strip">
                      {Array.from({ length: flow.n * 2 }, (_, k) => (
                        <span
                          key={k}
                          className="re-e-p"
                          style={
                            {
                              '--g': (
                                at(k + 1, flow.n) - at(k, flow.n)
                              ).toFixed(4),
                              '--len': LENGTH[k % flow.n],
                            } as CSSProperties
                          }
                        />
                      ))}
                    </span>
                  </div>
                  <ol className="re-e-steps" role="list">
                    {c.steps.map((s, k) => (
                      <li key={k} className="re-e-step">
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
                <p className="font-read re-e-chain-p">
                  <Rich text={c.text} />
                </p>
              </li>
            );
          })}
        </ol>
      </div>
      <Why text={S08.why} />
    </Chapter>
  );
}
