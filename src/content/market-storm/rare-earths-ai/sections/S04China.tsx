import { BETA, CHAPTERS, S04 } from '../content';
import { Chapter, Fig, Findings, Table, Verdict, Why } from '../ui';

/** STUB — owned by the chain-and-China builder. */
export default function S04China() {
  return (
    <Chapter chapter={CHAPTERS[3]} glyph="弁">
      <Verdict text={S04.verdict} />
      <Fig title={S04.share.title} sub={S04.share.sub} source={S04.share.source}>
        <Table head={['Step', 'China']} rows={S04.share.rows.map((r) => [r.label, r.display])} numeric={[1]} />
      </Fig>
      <Fig title={S04.beta.title} sub={S04.beta.sub} source={S04.beta.source}>
        <Table
          head={S04.beta.tableHead}
          rows={BETA.map((b) => [b.label, `${b.move > 0 ? '+' : ''}${b.move}%`])}
          numeric={[1]}
        />
      </Fig>
      <Fig title={S04.ndpr.title} sub={S04.ndpr.sub} source={S04.ndpr.source}>
        <Table head={['', 'US$/kg']} rows={S04.ndpr.points.map((p) => [p.label, p.display])} numeric={[1]} />
        <p>{S04.ndpr.floor.label}</p>
      </Fig>
      <Findings items={S04.findings} />
      <Why text={S04.why} />
    </Chapter>
  );
}
