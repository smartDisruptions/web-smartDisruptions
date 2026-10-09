import { CHAPTERS, RANKING, S10 } from '../content';
import { Chapter, Fig, Findings, Table, TableDetails, Verdict, Why } from '../ui';

/** STUB — owned by the AI-and-ranking builder. */
export default function S10Ranking() {
  const tierName = (n: number) => S10.tiers.find((t) => t.n === n)?.name ?? '';
  return (
    <Chapter chapter={CHAPTERS[9]} glyph="力">
      <Verdict text={S10.verdict} />
      <Fig title={S10.rank.title} sub={S10.rank.sub} source={S10.rank.source}>
        <Table head={['', 'Score', 'Tier']} rows={RANKING.map((r) => [r.ticker, r.compositeDisplay, tierName(r.tier)])} numeric={[1]} />
        <TableDetails
          summary={S10.rank.tableSummary}
          head={S10.rank.tableHead}
          rows={RANKING.map((r) => [
            r.name,
            ...S10.factors.map((f) => String(r.scores[f.key as keyof typeof r.scores])),
            r.compositeDisplay,
            tierName(r.tier),
          ])}
          numeric={[1, 2, 3, 4, 5, 6, 7, 8]}
        />
      </Fig>
      {[1, 2, 3, 4].map((t) => (
        <div key={t}>
          <h3>{tierName(t)}</h3>
          <ul>
            {RANKING.filter((r) => r.tier === t).map((r) => (
              <li key={r.ticker}>
                <strong>
                  {r.ticker} {r.name} · {r.compositeDisplay}.
                </strong>{' '}
                {r.why}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Fig title={S10.scenarioCard.title} sub={S10.scenarioCard.sub}>
        <Table
          head={S10.scenarioCard.tableHead}
          rows={RANKING.map((r) => [r.name, String(r.worlds.takeoff), String(r.worlds.steady), String(r.worlds.stall)])}
          numeric={[1, 2, 3]}
        />
      </Fig>
      <Findings items={S10.findings} />
      <Why text={S10.why} />
    </Chapter>
  );
}
