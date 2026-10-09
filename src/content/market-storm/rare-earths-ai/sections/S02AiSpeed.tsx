import { CHAPTERS, S02 } from '../content';
import { Chapter, Fig, Findings, Rich, Table, Verdict, Why } from '../ui';

/** STUB — owned by the AI-and-ranking builder. */
export default function S02AiSpeed() {
  return (
    <Chapter chapter={CHAPTERS[1]} glyph="速">
      <Verdict text={S02.verdict} />
      <Fig title={S02.runRate.title} sub={S02.runRate.sub} source={S02.runRate.source}>
        <Table head={['', '$B a year']} rows={S02.runRate.points.map((p) => [p.label, p.display])} numeric={[1]} />
      </Fig>
      {S02.labs.map((l) => (
        <article key={l.name}>
          <h3>{l.name}</h3>
          <ul>
            {l.items.map((t, i) => (
              <li key={i}>
                <Rich text={t} />
              </li>
            ))}
          </ul>
          <p>
            <strong>{S02.soLabel}</strong> <Rich text={l.so} />
          </p>
        </article>
      ))}
      <Fig title={S02.scenarios.title} source={S02.scenarios.source}>
        {S02.scenarios.items.map((s) => (
          <div key={s.key}>
            <p>{s.name}</p>
            <p className="font-display">{s.p}%</p>
            <p>{s.text}</p>
          </div>
        ))}
      </Fig>
      <Findings items={S02.findings} />
      <Why text={S02.why} />
    </Chapter>
  );
}
