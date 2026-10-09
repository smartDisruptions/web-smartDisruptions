import { CHAPTERS, DATES, FOOTER, S11 } from '../content';
import { Chapter, Fig, Findings, Verdict, Why } from '../ui';
import DatesClock from '../islands/e-dates';
import './e.css';

/*
 * 11 · Keep score — the ten dates on a rail, with the reader's "today" on
 * it and a countdown on every exact date (islands/e-dates.tsx works those
 * out from the reader's clock after the page loads; the server sends none).
 * Then the "This view is wrong if…" list, set as tripwires.
 */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
/** The report's year (its run date is in the footer line). Dates written
 *  without a year ("3 Nov") fall in the 90 days after it. */
const YEAR = Number(FOOTER.line1.match(/\b20\d\d\b/)?.[0] ?? 2026);

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const lastDay = (y: number, m: number) =>
  new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

/**
 * What a `when` means on a calendar. Exact dates ("28–29 Oct", "3 Nov",
 * "10 Jan 2027") get a countdown; fuzzy ones ("Late Oct", "Early Nov",
 * "Dec 2026", "2027") only a span, so the reader's today can be placed
 * among them.
 */
function when(text: string): {
  exact: boolean;
  from: string;
  to: string;
  dateTime: string;
} {
  let m = text.match(
    /^(\d{1,2})(?:[–-](\d{1,2}))? ([A-Z][a-z]{2})(?: (\d{4}))?$/
  );
  if (m && MONTHS.includes(m[3])) {
    const y = m[4] ? Number(m[4]) : YEAR;
    const mo = MONTHS.indexOf(m[3]);
    const from = iso(y, mo, Number(m[1]));
    return {
      exact: true,
      from,
      to: iso(y, mo, Number(m[2] ?? m[1])),
      dateTime: from,
    };
  }
  m = text.match(/^(Early|Mid|Late) ([A-Z][a-z]{2})(?: (\d{4}))?$/);
  if (m && MONTHS.includes(m[2])) {
    const y = m[3] ? Number(m[3]) : YEAR;
    const mo = MONTHS.indexOf(m[2]);
    const [a, b] =
      m[1] === 'Early'
        ? [1, 10]
        : m[1] === 'Mid'
          ? [11, 20]
          : [21, lastDay(y, mo)];
    return {
      exact: false,
      from: iso(y, mo, a),
      to: iso(y, mo, b),
      dateTime: `${y}-${pad(mo + 1)}`,
    };
  }
  m = text.match(/^([A-Z][a-z]{2}) (\d{4})$/);
  if (m && MONTHS.includes(m[1])) {
    const y = Number(m[2]);
    const mo = MONTHS.indexOf(m[1]);
    return {
      exact: false,
      from: iso(y, mo, 1),
      to: iso(y, mo, lastDay(y, mo)),
      dateTime: `${y}-${pad(mo + 1)}`,
    };
  }
  const y = Number(text.match(/^(\d{4})$/)?.[1] ?? YEAR + 1);
  return {
    exact: false,
    from: iso(y, 0, 1),
    to: iso(y, 11, 31),
    dateTime: String(y),
  };
}

export default function S11Watch() {
  return (
    <Chapter chapter={CHAPTERS[10]} glyph="探" className="re-e-watch">
      <Verdict text={S11.verdict} />
      <Fig title={S11.datesTitle} className="re-e-dates">
        <ol className="re-e-rail" role="list">
          {DATES.map((d) => {
            const t = when(d.when);
            return (
              <li
                key={d.when + d.what}
                className="re-e-date"
                data-exact={t.exact ? '' : undefined}
                data-from={t.from}
                data-to={t.to}
              >
                <span className="re-e-now" aria-hidden="true" hidden>
                  <b />
                </span>
                <span className="re-e-node" aria-hidden="true" />
                <p className="re-e-when">
                  <time dateTime={t.dateTime}>{d.when}</time>
                  {t.exact && <span className="re-e-cd" hidden />}
                </p>
                <div className="re-e-ev">
                  <p className="re-e-what">{d.what}</p>
                  <p className="font-read re-e-detail">{d.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <span className="re-e-now re-e-now-end" aria-hidden="true" hidden>
          <b />
        </span>
        <DatesClock year={YEAR} />
      </Fig>
      <div className="re-e-wrong">
        <Findings items={S11.wrongIf} label={S11.wrongIfLabel} />
      </div>
      <Why text={S11.why} />
    </Chapter>
  );
}
