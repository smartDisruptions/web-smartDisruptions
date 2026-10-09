import { CHAPTERS, S12 } from '../content';
import { Chapter, Fig, Rich, Verdict } from '../ui';
import './e.css';

/*
 * 12 · How to think about it — six rules on ofuda slips (`sd-note`: cream
 * paper, sumi ink, a vermilion band; the same object by day and by night),
 * hung from a rod, each on its own cord, swinging to rest as they scroll in.
 * Then the glossary: the definitions every marked word in the article opens
 * (term.tsx reads the same list).
 */

export default function S12Think() {
  return (
    <Chapter chapter={CHAPTERS[11]} glyph="道" className="re-e-think">
      <Verdict text={S12.verdict} />
      <ol className="re-e-slips" role="list">
        {S12.rules.map((r, i) => (
          <li key={r.title} className="re-e-slip">
            <div className="re-e-paper sd-note">
              <div className="re-e-slip-head">
                <span className="re-e-slip-n" aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className="re-e-slip-t">{r.title}</h3>
              </div>
              <p className="font-read re-e-slip-p">
                <Rich text={r.text} />
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Fig title={S12.glossaryTitle} className="re-e-gloss">
        <dl className="re-e-dl">
          {S12.glossary.map((g) => (
            <div key={g.term} className="re-e-gi">
              <dt className="re-e-gt">{g.term}</dt>
              <dd className="font-read re-e-gd">{g.def}</dd>
            </div>
          ))}
        </dl>
      </Fig>
    </Chapter>
  );
}
