import { AI_SCORES, CHAPTERS, S06 } from '../content';
import { Chapter, Fig, Findings, Rich, Verdict, Why } from '../ui';
import DScore, { type DScoreRow } from '../islands/d-score';
import { plain } from '../islands/d-util';
import './d.css';

/**
 * 06 · How each company uses AI — the scorecard as a sortable ledger.
 *
 * Three 0–5 meters per company (squares, as the card's title says), the
 * auditor's verdict beside them. Sort any column and the rows glide into
 * their new order; sort by "Uses AI" and the private companies rise to the
 * top, which is the chapter's whole point. They stay marked wherever they
 * land: the auditor's own "Private:" becomes a tag, and their rows are
 * hatched like a specimen kept behind glass.
 */

const TAG = 'Private:';

function rows(): DScoreRow[] {
  return AI_SCORES.map((a) => {
    const priv = a.name.startsWith(TAG);
    const name = priv ? a.name.slice(TAG.length).trimStart() : a.name;
    return {
      key: a.name,
      sortName: name,
      tag: priv ? a.name.slice(0, TAG.length) : null,
      name: <Rich text={name} />,
      uses: a.uses,
      sells: a.sells,
      partners: a.partners,
      verdict: <Rich text={a.verdict} />,
    };
  });
}

export default function S06AiUse() {
  return (
    <Chapter chapter={CHAPTERS[5]} glyph="技" className="re-d-ch">
      <Verdict text={S06.verdict} />
      <Fig
        title={S06.card.title}
        sub={S06.card.sub}
        source={S06.card.source}
        className="re-d-wide re-d-fig-sc"
      >
        <DScore
          head={S06.card.head}
          rows={rows()}
          caption={plain(S06.card.title)}
        />
      </Fig>
      <Findings items={S06.findings} />
      <Why text={S06.why} />
    </Chapter>
  );
}
