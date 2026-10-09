import { CHAPTERS, S09 } from '../content';
import { Chapter, Rich, Verdict, Why } from '../ui';

/** STUB — owned by the end-matter builder. */
export default function S09Missed() {
  return (
    <Chapter chapter={CHAPTERS[8]} glyph="影">
      <Verdict text={S09.verdict} />
      {S09.factors.map((f) => (
        <article key={f.title}>
          <h3>{f.title}</h3>
          <p>
            <Rich text={f.text} />
          </p>
        </article>
      ))}
      <Why text={S09.why} />
    </Chapter>
  );
}
