import type { CSSProperties } from 'react';
import {
  CHAPTERS,
  RANKING,
  S02,
  S10,
  type FactorKey,
  type WorldKey,
} from '../content';
import {
  Chapter,
  Fig,
  Findings,
  Rich,
  TableDetails,
  Verdict,
  Why,
} from '../ui';
import RankLab, {
  type LabFactor,
  type LabRow,
  type LabWorld,
} from '../islands/c-rank-lab';
import WorldScope from '../islands/c-world-scope';
import './c.css';

/*
 * 10 · The ranking.
 *
 * The centrepiece is the ranking lab (../islands/c-rank-lab.tsx): the
 * thirteen scores as a live instrument the reader can re-rank by world or by
 * their own weights. Around it, everything is server-rendered: the tier
 * legend, the tier cards with every company's case, the scenario chart (the
 * three worlds spread out from Steady for the top seven, lit by the world
 * picked in chapter 02), the full tables, findings and why.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const tierOf = (n: number) => S10.tiers.find((t) => t.n === n);
const tierName = (n: number) => tierOf(n)?.name ?? '';

/** The worlds in the order the report lists them: takeoff, steady, stall. */
const WORLDS = S02.scenarios.items.map((s) => ({
  key: s.key as WorldKey,
  name: s.name,
}));

/** "Tier 1 · core" → "Tier 1" set large, "core" set small. Same characters. */
function TierName({ name }: { name: string }) {
  const [a, ...b] = name.split(' · ');
  return (
    <>
      <span className="font-display re-c-tier-a">{a}</span>
      {b.length > 0 && (
        <>
          <span className="re-c-tier-sep"> · </span>
          <span className="re-c-tier-b">{b.join(' · ')}</span>
        </>
      )}
    </>
  );
}

function TierKey() {
  return (
    <ul className="re-c-key" role="list">
      {[1, 2, 3, 4, 0].map((n) => (
        <li key={n} data-tier={n}>
          <i aria-hidden="true" />
          {tierName(n)}
        </li>
      ))}
    </ul>
  );
}

function Tiers() {
  return (
    <div className="re-c-wide re-c-tiers">
      {[1, 2, 3, 4].map((n) => {
        const list = RANKING.filter((r) => r.tier === n);
        return (
          <section
            key={n}
            className="re-c-tier sd-reveal"
            data-tier={n}
            aria-labelledby={`re-c-tier-${n}`}
          >
            <h3 id={`re-c-tier-${n}`} className="re-c-tier-h">
              <TierName name={tierName(n)} />
            </h3>
            <ul className="re-c-tier-list" role="list">
              {list.map((r) => (
                <li key={r.ticker}>
                  <p className="re-c-tier-co">
                    <span className="re-c-tier-tk">{r.ticker}</span>{' '}
                    <b>
                      {r.name} · {r.compositeDisplay}.
                    </b>
                    <span className="re-c-tier-meter" aria-hidden="true">
                      <i style={{ '--s': r.composite / 10 } as Vars} />
                    </span>
                  </p>
                  {r.why && (
                    <p className="font-read re-c-tier-why">
                      <Rich text={r.why} />
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

const SHAPE: Record<WorldKey, string> = {
  takeoff: 'up',
  steady: 'dot',
  stall: 'down',
};

function Scenarios() {
  const sc = S10.scenarioCard;
  const top = sc.top
    .map((t) => RANKING.find((r) => r.ticker === t))
    .filter((r): r is (typeof RANKING)[number] => Boolean(r));
  return (
    <WorldScope className="re-c-scen">
      <ul className="re-c-scen-key" role="list">
        {WORLDS.map((w, i) => (
          <li key={w.key} className={`is-${w.key}`}>
            <i
              className="re-c-mk"
              data-shape={SHAPE[w.key]}
              aria-hidden="true"
            />
            {sc.legend[i]}
          </li>
        ))}
      </ul>
      <div className="re-c-scen-chart" role="img" aria-label={sc.aria}>
        <div className="re-c-scen-axis" aria-hidden="true">
          {[0, 2, 4, 6, 8, 10].map((t) => (
            <span key={t} style={{ '--x': t / 10 } as Vars}>
              {t}
            </span>
          ))}
        </div>
        {top.map((r, i) => {
          const { takeoff, steady, stall } = r.worlds;
          return (
            <div
              key={r.ticker}
              className="re-c-scen-row"
              style={{ '--i': i } as Vars}
            >
              <span className="re-c-scen-co">
                <b>{r.ticker}</b>
                <span>{r.name}</span>
              </span>
              <span
                className="re-c-scen-track"
                style={
                  {
                    '--lo': stall / 10,
                    '--hi': takeoff / 10,
                    '--mid': steady / 10,
                  } as Vars
                }
              >
                <span className="re-c-scen-span" />
                {WORLDS.map((w) => (
                  <span
                    key={w.key}
                    className={`re-c-scen-rail is-${w.key}`}
                    style={{ '--x': r.worlds[w.key] / 10 } as Vars}
                  >
                    <span className="re-c-mk" data-shape={SHAPE[w.key]}>
                      <b>{r.worlds[w.key]}</b>
                    </span>
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </WorldScope>
  );
}

export default function S10Ranking() {
  const rows: LabRow[] = RANKING.map((r) => ({
    ticker: r.ticker,
    name: r.name,
    scores: r.scores,
    composite: r.composite,
    compositeDisplay: r.compositeDisplay,
    tier: r.tier,
    tierName: tierName(r.tier),
    worlds: r.worlds,
  }));
  const factors: LabFactor[] = S10.factors.map((f) => ({
    key: f.key as FactorKey,
    label: f.label,
    short: f.short,
    weight: f.weight,
  }));
  const worlds: LabWorld[] = WORLDS;

  return (
    <Chapter chapter={CHAPTERS[9]} glyph="力" className="re-bleed re-c-ch">
      <div className="re-c-col">
        <Verdict text={S10.verdict} />
      </div>

      <Fig
        title={S10.rank.title}
        sub={S10.rank.sub}
        source={S10.rank.source}
        className="re-c-wide re-c-rank-fig"
      >
        <TierKey />
        <RankLab
          rows={rows}
          factors={factors}
          worlds={worlds}
          aria={S10.rank.aria}
        />
        <TableDetails
          summary={S10.rank.tableSummary}
          head={S10.rank.tableHead}
          rows={RANKING.map((r) => [
            r.name,
            ...S10.factors.map((f) => String(r.scores[f.key as FactorKey])),
            r.compositeDisplay,
            tierName(r.tier),
          ])}
          numeric={[1, 2, 3, 4, 5, 6, 7, 8]}
        />
      </Fig>

      <Tiers />

      <div className="re-c-col">
        <Fig title={S10.scenarioCard.title} sub={S10.scenarioCard.sub}>
          <Scenarios />
          <TableDetails
            summary={S10.scenarioCard.tableSummary}
            head={S10.scenarioCard.tableHead}
            rows={RANKING.map((r) => [
              r.name,
              String(r.worlds.takeoff),
              String(r.worlds.steady),
              String(r.worlds.stall),
            ])}
            numeric={[1, 2, 3]}
          />
        </Fig>

        <Findings items={S10.findings} />
        <Why text={S10.why} />
      </div>
    </Chapter>
  );
}
