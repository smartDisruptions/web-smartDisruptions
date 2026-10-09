import { CHAPTERS, COMPANIES, DROP, S05 } from '../content';
import { Chapter, Fig, Findings, Flag, Table, Verdict, Why } from '../ui';

/** STUB — owned by the companies builder. */
export default function S05Companies() {
  return (
    <Chapter chapter={CHAPTERS[4]} glyph="場">
      <Verdict text={S05.verdict} />
      <Fig title={S05.table.title} source={S05.table.source}>
        <Table
          head={S05.table.head}
          rows={COMPANIES.map((c) => [
            c.ticker,
            c.name,
            c.steps,
            <>
              <Flag kind={c.status.kind}>{c.status.text}</Flag> {c.status.note}
            </>,
            c.price,
          ])}
          numeric={[4]}
        />
      </Fig>
      <Fig title={S05.drop.title} sub={S05.drop.sub} source={S05.drop.source}>
        <Table head={['', '%', '']} rows={DROP.map((d) => [d.ticker, `${d.pct}%`, d.detail])} numeric={[1]} />
      </Fig>
      <Findings items={S05.findings} />
      <Why text={S05.why} />
    </Chapter>
  );
}
