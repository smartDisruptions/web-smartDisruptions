import { CHAPTERS, DATES, S11 } from '../content';
import { Chapter, Fig, Findings, Verdict, Why } from '../ui';

/** STUB — owned by the end-matter builder. */
export default function S11Watch() {
  return (
    <Chapter chapter={CHAPTERS[10]} glyph="探">
      <Verdict text={S11.verdict} />
      <Fig title={S11.datesTitle}>
        <ol>
          {DATES.map((d) => (
            <li key={d.when + d.what}>
              <strong>{d.when}</strong> {d.what} — {d.detail}
            </li>
          ))}
        </ol>
      </Fig>
      <Findings items={S11.wrongIf} label={S11.wrongIfLabel} />
      <Why text={S11.why} />
    </Chapter>
  );
}
