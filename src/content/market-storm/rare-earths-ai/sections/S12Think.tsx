import { CHAPTERS, S12 } from '../content';
import { Chapter, Fig, Rich, Verdict } from '../ui';

/** STUB — owned by the end-matter builder. */
export default function S12Think() {
  return (
    <Chapter chapter={CHAPTERS[11]} glyph="道">
      <Verdict text={S12.verdict} />
      {S12.rules.map((r) => (
        <div key={r.title}>
          <strong>{r.title}</strong>
          <p>
            <Rich text={r.text} />
          </p>
        </div>
      ))}
      <Fig title={S12.glossaryTitle}>
        <dl>
          {S12.glossary.map((g) => (
            <div key={g.term}>
              <dt>{g.term}</dt>
              <dd>{g.def}</dd>
            </div>
          ))}
        </dl>
      </Fig>
    </Chapter>
  );
}
