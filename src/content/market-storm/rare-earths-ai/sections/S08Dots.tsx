import { CHAINS, CHAPTERS, S08 } from '../content';
import { Chapter, Verdict, Why } from '../ui';

/** STUB — owned by the end-matter builder. */
export default function S08Dots() {
  return (
    <Chapter chapter={CHAPTERS[7]} glyph="網">
      <Verdict text={S08.verdict} />
      {CHAINS.map((c) => (
        <article key={c.title}>
          <h3>{c.title}</h3>
          <p>{c.strengthLabel}</p>
          <ol>
            {c.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p>{c.text}</p>
        </article>
      ))}
      <Why text={S08.why} />
    </Chapter>
  );
}
