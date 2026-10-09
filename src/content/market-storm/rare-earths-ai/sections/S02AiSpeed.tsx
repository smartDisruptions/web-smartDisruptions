import type { CSSProperties } from 'react';
import Kanji from '@/components/brand/Kanji';
import { CHAPTERS, S02, type WorldKey } from '../content';
import { Chapter, Fig, Findings, Rich, Verdict, Why } from '../ui';
import Near from '../islands/c-near';
import WorldPick from '../islands/c-world-pick';
import './c.css';

/*
 * 02 · How fast is AI really moving?
 *
 * The run-rate climbs like a launch: four columns rise up through the axis
 * one after another as the chart scrolls up the screen (one scroll-driven
 * translate per column, no JavaScript), each figure riding on its tip. The July figure is drawn dashed because
 * it is Bloomberg's, not the company's (the chart's own sub-line says so).
 * Then the three labs as an editorial row, and "Pick your 2030": the three
 * scenarios are a radio group that sets the page-wide world, which the
 * ranking in chapter 10 follows.
 */

/** The run-rate axis tops out here ($B), as in the report's chart. */
const RR_MAX = 70;
const RR_TICKS = [0, 20, 40, 60];

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const isPress = (tip: string[]) => tip.some((t) => t.includes('Bloomberg'));

/** "Anthropic (Claude)" → the name, then a quieter parenthesis. Same characters. */
function LabName({ name }: { name: string }) {
  const m = /^(.*?)\s+(\(.+\))$/.exec(name);
  if (!m) return <>{name}</>;
  return (
    <>
      {m[1]} <span className="re-c-ai-aka">{m[2]}</span>
    </>
  );
}

function RunRate() {
  const { points } = S02.runRate;
  return (
    <>
      <div className="re-c-rr" role="img" aria-label={S02.runRate.aria}>
        <div className="re-c-rr-plot">
          {RR_TICKS.map((t) => (
            <span
              key={t}
              className="re-c-rr-tick"
              data-zero={t === 0 ? '' : undefined}
              style={{ '--t': t / RR_MAX } as Vars}
              aria-hidden="true"
            >
              <span>${t}B</span>
            </span>
          ))}
          <ol className="re-c-rr-cols" role="list">
            {points.map((p, i) => (
              <li
                key={p.label}
                className="re-c-rr-col"
                data-src={isPress(p.tip) ? 'press' : undefined}
                style={{ '--v': p.value / RR_MAX, '--i': i } as Vars}
              >
                {/* A window clipped at the axis; the column rises up through it. */}
                <span className="re-c-rr-win">
                  <span className="re-c-rr-rise">
                    <span className="re-c-rr-bar" aria-hidden="true" />
                    <span className="font-display re-c-rr-val">
                      {p.display}
                    </span>
                  </span>
                </span>
                <span className="re-c-rr-lbl">{p.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <ul className="re-c-rr-log" role="list">
        {points.map((p) => (
          <li key={p.label} data-src={isPress(p.tip) ? 'press' : undefined}>
            <b>{p.tip[0]}</b>
            <span>{p.tip.slice(1).join(' · ')}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function S02AiSpeed() {
  const scen = S02.scenarios;
  return (
    <Chapter chapter={CHAPTERS[1]} glyph="速" className="re-bleed re-c-ch">
      <div className="re-c-col">
        <Verdict text={S02.verdict} />
        <Fig
          title={S02.runRate.title}
          sub={S02.runRate.sub}
          source={S02.runRate.source}
        >
          <RunRate />
        </Fig>
      </div>

      <div className="re-c-wide re-c-ais">
        {S02.labs.map((l, i) => (
          <article
            key={l.name}
            className="re-c-ai sd-reveal"
            aria-labelledby={`re-c-ai-${i}`}
          >
            <h3 id={`re-c-ai-${i}`} className="font-display re-c-ai-name">
              <LabName name={l.name} />
            </h3>
            <ul className="font-read re-c-ai-list" role="list">
              {l.items.map((t, j) => (
                <li key={j}>
                  <Rich text={t} />
                </li>
              ))}
            </ul>
            <p className="re-c-ai-so">
              <strong>{S02.soLabel}</strong> <Rich text={l.so} />
            </p>
          </article>
        ))}
      </div>

      <div className="re-c-col">
        <figure className="re-c-pick-fig" aria-labelledby="re-c-pick-t">
          <h3 id="re-c-pick-t" className="re-fig-title re-c-pick-title">
            <Rich text={scen.title} />
          </h3>
          <WorldPick
            labelledBy="re-c-pick-t"
            items={scen.items.map((s) => ({
              key: s.key as WorldKey,
              name: s.name,
              p: s.p,
              text: <Rich text={s.text} />,
            }))}
            seal={<Kanji char="道" />}
          />
          <figcaption className="re-fig-src">
            <Rich text={scen.source} />
          </figcaption>
        </figure>

        <Findings items={S02.findings} />
        <Why text={S02.why} />
      </div>
      {/* One observer for chapters 02, 03 and 10: their charts move only near the screen. */}
      <Near />
    </Chapter>
  );
}
