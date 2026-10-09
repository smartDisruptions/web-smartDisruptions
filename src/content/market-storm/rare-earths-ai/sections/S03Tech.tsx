import { CHAPTERS, S03, TECH } from '../content';
import { Chapter, Fig, Findings, Table, Verdict, Why } from '../ui';

/** STUB — owned by the AI-and-ranking builder. */
export default function S03Tech() {
  return (
    <Chapter chapter={CHAPTERS[2]} glyph="器">
      <Verdict text={S03.verdict} />
      <Fig title={S03.odds.title} sub={S03.odds.sub} source={S03.odds.source}>
        <Table head={S03.odds.tableHead} rows={TECH.map((t) => [t.label, `${t.p}%`, t.note])} numeric={[1]} />
      </Fig>
      <Fig title={S03.waffle.title} source={S03.waffle.source}>
        <p>{S03.waffle.legendAi}</p>
        <p>{S03.waffle.legendRest}</p>
      </Fig>
      <Findings items={S03.findings} />
      <Why text={S03.why} />
    </Chapter>
  );
}
