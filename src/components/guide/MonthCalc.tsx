'use client';

import { useId, useState } from 'react';

const money = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

/**
 * Two sliders and four bars: roughly what a month of building would cost at
 * per-use prices, set against the three plan prices. The bars are scaleX
 * transforms on one shared scale, so the comparison is honest by eye.
 */
export default function MonthCalc({
  perHour,
  plans,
}: {
  perHour: number;
  plans: { label: string; price: number }[];
}) {
  const [hours, setHours] = useState(3);
  const [days, setDays] = useState(12);
  const hId = useId();
  const dId = useId();
  const api = hours * days * perHour;
  const scale = Math.max(api, ...plans.map((p) => p.price)) * 1.08;

  const rows = [
    { label: 'Paid per use (my estimate)', value: api, tone: 'api' },
    ...plans.map((p) => ({ label: p.label, value: p.price, tone: 'plan' })),
  ];

  return (
    <div className="gd-calc">
      <div className="gd-calc-inputs">
        <label className="gd-slider" htmlFor={hId}>
          <span className="gd-slider-top">
            <span>Hours of building a day</span>
            <output className="tabular-nums" htmlFor={hId}>
              {hours}
            </output>
          </span>
          <input
            id={hId}
            type="range"
            min={1}
            max={10}
            step={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
          />
        </label>
        <label className="gd-slider" htmlFor={dId}>
          <span className="gd-slider-top">
            <span>Days a month</span>
            <output className="tabular-nums" htmlFor={dId}>
              {days}
            </output>
          </span>
          <input
            id={dId}
            type="range"
            min={1}
            max={30}
            step={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          />
        </label>
      </div>

      <p className="gd-calc-head" aria-live="polite">
        <span className="gd-calc-big font-display tabular-nums">
          {money(api)}
        </span>
        <span className="gd-calc-sub">
          is roughly what {hours * days} hours of building would cost at per-use
          prices.
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
    </div>
  );
}
