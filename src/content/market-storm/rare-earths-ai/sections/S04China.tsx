import type { CSSProperties } from 'react';
import Kanji from '@/components/brand/Kanji';
import { BETA, CHAPTERS, S04 } from '../content';
import { Chapter, Fig, Findings, TableDetails, Verdict, Why } from '../ui';
import BTips from '../islands/b-tips';
import BValve from '../islands/b-valve';
import { BANDS, BandsArt, MagnetArt, OreArt } from './S01Basics';
import './b.css';

/*
 * 04 · China holds the valve.
 *
 * Three pictures. The chain from chapter 01 comes back as three gauges, each
 * filled to China's share of that step. Then the headline simulator (the
 * island in ../islands/b-valve): a valve whose notches are the nine real
 * one-day moves, every one of them always on the chart beside it. Then the
 * NdPr price, drawn on by the scroll, against the $110 floor.
 */

const signed = (m: number) =>
  `${m > 0 ? '+' : m < 0 ? '−' : ''}${Math.abs(m)}%`;

/* ── China's share of each step ─────────────────────────────────────────── */

const GAUGE_ART = [OreArt, BandsArt, MagnetArt];

function Share() {
  const { share } = S04;
  return (
    <Fig
      title={share.title}
      sub={share.sub}
      source={share.source}
      className="re-b-share"
    >
      <div className="re-b-gauges" role="img" aria-label={share.aria}>
        {share.rows.map((r, i) => {
          const Art = GAUGE_ART[i] ?? OreArt;
          return (
            <div
              key={r.label}
              className="re-b-gauge"
              style={{ '--v': r.value / 100 } as CSSProperties}
            >
              <span className="re-b-gauge-art">
                <Art />
              </span>
              <p className="re-b-gauge-l">{r.label}</p>
              <p className="re-b-gauge-t">{r.tip[1]}</p>
              <p className="font-display re-b-gauge-v">{r.display}</p>
              <span className="re-b-pipe" aria-hidden="true">
                <span className="re-b-pipe-fill" />
              </span>
            </div>
          );
        })}
      </div>
    </Fig>
  );
}

/* ── NdPr: four prices against the floor ────────────────────────────────── */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const monthOf = (label: string) => {
  const [m, y] = label.split(' ');
  return Number(y) * 12 + MONTHS.indexOf(m);
};
const ND_MAX = 125;
const ND_GRID = [0, 50, 100];

function NdPr() {
  const { ndpr } = S04;
  const t0 = monthOf(ndpr.points[0].label);
  const t1 = monthOf(ndpr.points[ndpr.points.length - 1].label);
  // Real time on the x axis: the four quotes are 12, 2 and 7 months apart.
  const pts = ndpr.points.map((p) => ({
    ...p,
    x: +(((monthOf(p.label) - t0) / (t1 - t0)) * 100).toFixed(2),
    y: +(100 - (p.value / ND_MAX) * 100).toFixed(2),
  }));
  const peak = pts.reduce((a, b) => (b.value > a.value ? b : a));
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join('');
  const area = `${line}L100 100L0 100Z`;
  const yOf = (v: number) => 1 - v / ND_MAX;
  return (
    <Fig
      title={ndpr.title}
      sub={ndpr.sub}
      source={ndpr.source}
      className="re-b-ndpr"
    >
      <BTips className="re-b-nd">
        <div className="re-b-nd-plot">
          {ND_GRID.map((v) => (
            <span
              key={v}
              className="re-b-nd-tick"
              style={{ '--y': yOf(v) } as CSSProperties}
              aria-hidden="true"
            >
              ${v}
            </span>
          ))}
          {/* The four quotes stand from the start; the scroll draws the line
              through them: a cover the colour of the card slides off it, left
              to right (a transform, so the compositor runs it). */}
          <div className="re-b-nd-win">
            {ND_GRID.map((v) => (
              <span
                key={v}
                className="re-b-nd-grid"
                style={{ '--y': yOf(v) } as CSSProperties}
                aria-hidden="true"
              />
            ))}
            <span
              className="re-b-nd-floor"
              style={{ '--y': yOf(ndpr.floor.value) } as CSSProperties}
            >
              <span className="re-b-nd-floor-l">{ndpr.floor.label}</span>
            </span>
            <svg
              className="re-b-nd-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              role="img"
              aria-label={ndpr.aria}
            >
              <path className="re-b-nd-area" d={area} />
              <path
                className="re-b-nd-line"
                d={line}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className="re-b-nd-cover" aria-hidden="true" />
          </div>
          <div className="re-b-nd-pts">
            {pts.map((p, i) => (
              <button
                key={p.label}
                type="button"
                data-b-tip=""
                className={`re-b-nd-pt${p === peak ? ' is-peak' : ''}${i === 0 ? ' is-first' : ''}${i === pts.length - 1 ? ' is-last' : ''}`}
                style={{ '--x': p.x / 100, '--y': p.y / 100 } as CSSProperties}
                aria-label={`${p.label}: ${p.display}`}
                aria-describedby={`re-b-nd-tip-${i}`}
              >
                <span className="re-b-nd-dot" aria-hidden="true" />
                <span className="re-b-nd-v" aria-hidden="true">
                  {p.display}
                </span>
                <span
                  className="re-b-tip"
                  role="tooltip"
                  id={`re-b-nd-tip-${i}`}
                >
                  <strong>{p.tip[0]}</strong>
                  {p.tip.slice(1).map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="re-b-nd-x" aria-hidden="true">
          {pts.map((p, i) => (
            <span
              key={p.label}
              className={
                i === 0
                  ? 'is-first'
                  : i === pts.length - 1
                    ? 'is-last'
                    : i % 2
                      ? 'is-before'
                      : 'is-after'
              }
              style={{ '--x': p.x / 100 } as CSSProperties}
            >
              {p.label}
            </span>
          ))}
        </div>
      </BTips>
    </Fig>
  );
}

/* ── The chapter ─────────────────────────────────────────────────────────── */

export default function S04China() {
  const { beta } = S04;
  return (
    <Chapter chapter={CHAPTERS[3]} glyph="弁" className="re-bleed re-b-ch">
      <Verdict text={S04.verdict} />
      <Share />
      <Fig
        title={beta.title}
        sub={beta.sub}
        source={beta.source}
        className="re-b-wide re-b-beta"
      >
        <BValve
          rows={BETA}
          bands={BANDS}
          suffix={beta.tipSuffix}
          aria={beta.aria}
          hub={<Kanji char="弁" className="h-full w-full" />}
        />
        <TableDetails
          head={beta.tableHead}
          rows={BETA.map((b) => [b.label, signed(b.move)])}
          numeric={[1]}
          caption={beta.title}
        />
      </Fig>
      <NdPr />
      <Findings items={S04.findings} />
      <Why text={S04.why} />
    </Chapter>
  );
}
