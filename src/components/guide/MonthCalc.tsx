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
    { label: 'At API prices', value: api, tone: 'api' },
    ...plans.map((p) => ({ label: p.label, value: p.price, tone: 'plan' })),
  ];

  return (
    <div className="gd-calc">
      <div className="gd-calc-inputs">
        <label className="gd-slider" htmlFor={nId}>
          <span className="gd-slider-top">
            <span>Normal build days a month</span>
            <output className="tabular-nums" htmlFor={nId}>
              {normal}
            </output>
          </span>
          <span className="gd-slider-note">
            One session, no helpers. About {money(normalDay)} each.
          </span>
          <input
            id={nId}
            type="range"
            min={0}
            max={30}
            step={1}
            value={normal}
            onChange={(e) => setNormal(Number(e.target.value))}
          />
        </label>
        <label className="gd-slider" htmlFor={bId}>
          <span className="gd-slider-top">
            <span>Big days with 10 helpers</span>
            <output className="tabular-nums" htmlFor={bId}>
              {big}
            </output>
          </span>
          <span className="gd-slider-note">
            Like my level build. About {money(bigDay)} each.
          </span>
          <input
            id={bId}
            type="range"
            min={0}
            max={8}
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
          is what that month would cost at API prices, using my real numbers.
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
          ? `On my $200 Max plan, that's more than a full week's allowance every week (about ${weekShare}%). I'd hit the limit and wait for it to reset.`
          : `On my $200 Max plan, that's about ${weekShare}% of a week's allowance in an average week.`}
      </p>
    </div>
  );
}
