import { CHAPTERS, S01 } from '../content';
import { Chapter, Findings, Rich, Verdict, Why } from '../ui';

/** STUB — owned by the chain-and-China builder. */
export default function S01Basics() {
  return (
    <Chapter chapter={CHAPTERS[0]} glyph="土">
      <Verdict text={S01.verdict} />
      <div>
        {S01.tiles.map((t) => (
          <div key={t.label}>
            <p>{t.label}</p>
            <p className="font-display">{t.value}</p>
            <p>
              <Rich text={t.sub} />
            </p>
          </div>
        ))}
      </div>
      <Findings items={S01.findings} />
      <Why text={S01.why} />
    </Chapter>
  );
}
