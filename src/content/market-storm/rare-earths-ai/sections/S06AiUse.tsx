import { AI_SCORES, CHAPTERS, S06 } from '../content';
import { Chapter, Fig, Findings, Table, Verdict, Why } from '../ui';

/** STUB — owned by the companies builder. */
export default function S06AiUse() {
  return (
    <Chapter chapter={CHAPTERS[5]} glyph="技">
      <Verdict text={S06.verdict} />
      <Fig title={S06.card.title} sub={S06.card.sub} source={S06.card.source}>
        <Table
          head={S06.card.head}
          rows={AI_SCORES.map((a) => [a.name, String(a.uses), String(a.sells), String(a.partners), a.verdict])}
          numeric={[1, 2, 3]}
        />
      </Fig>
      <Findings items={S06.findings} />
      <Why text={S06.why} />
    </Chapter>
  );
}
