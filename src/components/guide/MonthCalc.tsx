'use client';

import { useId, useState } from 'react';

const money = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

const WEEKS_PER_MONTH = 4.33;

/**
 * A month of building, priced with my real numbers: a normal day (~$45 at
 * API prices) and a big day with ten helper agents (~$400), both from one
 * receipt. The bars put that against the plan prices on one shared scale,
 * and the last line reads it against my plan's weekly allowance, which I
 * only know roughly (15% of a week was $535.94).
 */
export default function MonthCalc({
  normalDay,
  bigDay,
  weekAllowance,
  plans,
}: {
  normalDay: number;
  bigDay: number;
  weekAllowance: number;
  plans: { label: string; price: number }[];
}) {
  const [normal, setNormal] = useState(12);
  const [big, setBig] = useState(1);
  const nId = useId();
  const bId = useId();
  const api = normal * normalDay + big * bigDay;
  const scale = Math.max(api, ...plans.map((p) => p.price)) * 1.08;
  const weekShare = Math.round((api / WEEKS_PER_MONTH / weekAllowance) * 100);

  const rows = [
    { label: 'Paid per use', value: api, tone: 'api' },
    ...plans.map((p) => ({ label: p.label, value: p.price, tone: 'plan' })),
  ];

  return (
    <div className="gd-calc">
      <div className="gd-calc-inputs">
        <label className="gd-slider" htmlFor={nId}>
          <span className="gd-slider-top">
            <span>Normal days of building</span>
            <output className="tabular-nums" htmlFor={nId}>
              {normal}
            </output>
          </span>
          <span className="gd-slider-note">
            Just me and Claude. About {money(normalDay)} a day if paid per use.
          </span>
          <input
            id={nId}
            type="range"
            min={0}
            max={30 - big}
            step={1}
            value={normal}
            onChange={(e) => setNormal(Number(e.target.value))}
          />
        </label>
        <label className="gd-slider" htmlFor={bId}>
          <span className="gd-slider-top">
            <span>Big days with 10 helper agents</span>
            <output className="tabular-nums" htmlFor={bId}>
              {big}
            </output>
          </span>
          <span className="gd-slider-note">
            Like my busiest day. About {money(bigDay)} a day if paid per use.
          </span>
          <input
            id={bId}
            type="range"
            min={0}
            max={Math.min(8, 30 - normal)}
            step={1}
            value={big}
            onChange={(e) => setBig(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="gd-calc-head" aria-live="polite">
        <span className="gd-calc-big font-display tabular-nums">
          {money(api)}
        </span>
        <span className="gd-calc-sub">
          is what that month of building would cost if you paid per use, based
          on my real numbers.
        </span>
      </p>

      <ul className="gd-bars" role="list">
        {rows.map((r) => (
          <li key={r.label} className="gd-bar-row" data-tone={r.tone}>
            <span className="gd-bar-label">{r.label}</span>
            <span className="gd-bar-track" aria-hidden>
              <span
                className="gd-bar-fill"
                style={{ transform: `scaleX(${r.value / scale})` }}
              />
            </span>
            <span className="gd-bar-value tabular-nums">
              {money(r.value)}
              {r.tone === 'plan' ? ' a month' : ''}
            </span>
          </li>
        ))}
      </ul>

      <p className="gd-calc-week" data-over={weekShare > 100}>
        {weekShare > 100
          ? `Spread over the month, that's about ${money(api / WEEKS_PER_MONTH)} of building a week. On my $200 Max plan, that's more than the weekly limit (about ${weekShare}%), so I'd have to wait for it to reset.`
          : `Spread over the month, that's about ${money(api / WEEKS_PER_MONTH)} of building a week. On my $200 Max plan, that's about ${weekShare}% of the weekly limit.`}
      </p>
    </div>
  );
}
