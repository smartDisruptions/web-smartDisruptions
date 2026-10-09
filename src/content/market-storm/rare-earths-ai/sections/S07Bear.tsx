import { CHAPTERS, RED_FLAGS, S07 } from '../content';
import { Chapter, Fig, Findings, Flag, Table, Verdict, Why } from '../ui';

/** STUB — owned by the companies builder. */
export default function S07Bear() {
  return (
    <Chapter chapter={CHAPTERS[6]} glyph="倒">
      <Verdict text={S07.verdict} />
      <Fig title={S07.card.title} source={S07.card.source}>
        <Table
          head={S07.card.head}
          rows={RED_FLAGS.map((r) => [r.name, r.flags, <Flag key="f" kind={r.risk.kind}>{r.risk.text}</Flag>])}
        />
      </Fig>
      <Findings items={S07.findings} />
      <Why text={S07.why} />
    </Chapter>
  );
}
