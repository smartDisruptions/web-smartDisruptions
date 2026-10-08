import type { ReportChart } from '@/data/marketStorm';

/**
 * Charts for a Market Storm report.
 *
 * WHY THESE ARE HAND-DRAWN SVG
 * ----------------------------
 * No charting library. Three reasons, in order: the pages are server-rendered
 * and a library would drag the whole thing client-side for something that is
 * ultimately a few polygons; the site's colour is a set of CSS custom
 * properties and a library wants its own palette, which is how a page ends up
 * with two design systems; and a chart here has to work in both themes without
 * JavaScript deciding which one it is.
 *
 * WHY THE ANIMATION IS CSS-ONLY
 * -----------------------------
 * `animation-timeline: view()` grows the bars as the reader scrolls to them,
 * with no observer, no hydration and no client component. Browsers without it
 * simply render the finished chart, which is the correct fallback — the chart
 * is information, and information should not wait on a feature detect. The
 * whole block is disabled under `prefers-reduced-motion`.
 *
 * ACCESSIBILITY
 * -------------
 * Every chart carries a real caption and a visually-hidden table of the same
 * numbers. A screen reader gets the data, not "image".
 */

function fmt(
  v: number,
  unit: ReportChart['unit'],
  format?: ReportChart['valueFormat'],
  decimals?: number
) {
  // `decimals` keeps a column of figures aligned (6.0 beside 6.9, not 6).
  const n = decimals === undefined ? String(v) : v.toFixed(decimals);
  if (format === 'percent') return `${n}%`;
  if (format === 'currency-bn')
    return v >= 1000 ? `$${(v / 1000).toFixed(2)}T` : `$${v}B`;
  if (format === 'x') return `${n}×`;
  return `${n}${unit && unit.length <= 2 ? unit : ''}`;
}

/**
 * The same hidden table under every chart — the numbers, for anyone not seeing
 * them.
 *
 * `sr-only` goes on a wrapping div, never on the <table> itself. A table is
 * shrink-to-fit: it ignores the 1px width sr-only gives it and lays out to its
 * content instead, so the class hid the table visually while leaving it 393px
 * wide in the layout. Six of them did that, and the page scrolled sideways on
 * a phone for something no sighted reader could see.
 */
function DataTable({ chart }: { chart: ReportChart }) {
  return (
    <div className="sr-only">
      <table>
        <caption>{chart.title}</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            {chart.kind === 'quadrant' && (
              <th scope="col">{chart.xLabel ?? 'x'}</th>
            )}
            <th scope="col">
              {chart.kind === 'quadrant' ? (chart.yLabel ?? chart.unit) : chart.unit}
            </th>
          </tr>
        </thead>
        <tbody>
          {chart.points.map((p) => (
            <tr key={p.label}>
              <th scope="row">{p.label}</th>
              {chart.kind === 'quadrant' && <td>{p.x}</td>}
              <td>{fmt(p.value, chart.unit, chart.valueFormat)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── BAR ─────────────────────────────────────────────────────────────────────
   Things compared on one measure. Horizontal, because the labels are company
   names and a vertical bar chart turns them into diagonal text nobody reads. */
function Bars({ chart }: { chart: ReportChart }) {
  const max = Math.max(...chart.points.map((p) => Math.abs(p.value)), 0.0001);
  // On a phone the old three-column row left the bar track 0px wide: an
  // 11rem label and a 6rem value took the whole width, so every bar chart
  // rendered as a list of numbers. Below `sm` the label and value now share a
  // row with a thin full-width bar under them; from `sm` up the familiar
  // label · bar · value row returns. Labels wrap instead of truncating — a
  // label cut to "Phase 2 (does it work?) ·…" loses the word that matters.
  return (
    <div className="space-y-3.5 sm:space-y-3">
      {chart.points.map((p, i) => {
        const pct = (Math.abs(p.value) / max) * 100;
        return (
          <div
            key={p.label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,11rem)_1fr_6rem] sm:items-center sm:gap-x-4"
          >
            <div className="min-w-0">
              <div className="text-sm leading-snug text-text-primary">
                {p.label}
              </div>
              {p.note && (
                <div className="mt-0.5 font-mono text-[0.68rem] uppercase leading-snug tracking-[0.06em] text-text-secondary">
                  {p.note}
                </div>
              )}
            </div>
            <div
              className={`text-right font-mono text-sm font-semibold [font-variant-numeric:tabular-nums] sm:order-3 ${
                p.highlight ? 'text-accent' : 'text-text-primary'
              }`}
            >
              {fmt(p.value, chart.unit, chart.valueFormat, chart.decimals)}
            </div>
            <div className="col-span-2 h-2.5 overflow-hidden rounded-full bg-fill sm:order-2 sm:col-span-1 sm:h-7 sm:rounded-md">
              <div
                className={`sd-bar h-full rounded-[inherit] ${
                  p.highlight ? 'bg-accent' : 'bg-text-secondary/45'
                }`}
                style={{
                  ['--w' as string]: `${pct}%`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── LINE ────────────────────────────────────────────────────────────────────
   A value over time. Drawn to a 0-based y-axis on purpose: these charts exist
   to show scale against history, and a truncated axis makes every series look
   like a cliff. Points marked `highlight` get a dot and a label. */
function Line({ chart }: { chart: ReportChart }) {
  const W = 720;
  const H = 260;
  const PAD = { t: 16, r: 16, b: 28, l: 44 };
  const pts = chart.points;
  const max = Math.max(...pts.map((p) => p.value)) * 1.08;
  const x = (i: number) =>
    PAD.l + (i / Math.max(1, pts.length - 1)) * (W - PAD.l - PAD.r);
  const y = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b);
  const d = pts
    .map(
      (p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`
    )
    .join(' ');
  const area = `${d} L${x(pts.length - 1).toFixed(1)},${H - PAD.b} L${x(0).toFixed(1)},${H - PAD.b} Z`;
  const ticks = [0, max / 2, max];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={chart.title}
      preserveAspectRatio="xMidYMid meet"
    >
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={PAD.l}
            x2={W - PAD.r}
            y1={y(t)}
            y2={y(t)}
            stroke="var(--sd-border)"
            strokeWidth="1"
            strokeDasharray={t === 0 ? undefined : '3 5'}
          />
          <text
            x={PAD.l - 8}
            y={y(t) + 4}
            textAnchor="end"
            className="fill-[var(--sd-text-secondary)] font-mono text-[10px]"
          >
            {fmt(Math.round(t * 10) / 10, chart.unit, chart.valueFormat)}
          </text>
        </g>
      ))}
      <path
        d={area}
        fill="var(--sd-accent)"
        opacity="0.10"
        className="sd-fade"
      />
      <path
        d={d}
        fill="none"
        stroke="var(--sd-accent)"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="sd-draw"
      />
      {pts.map((p, i) =>
        p.highlight ? (
          <g key={p.label}>
            {/* A ringed dot, like a seal pressed on the line. */}
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r="5.5"
              fill="var(--sd-accent)"
              stroke="var(--sd-bg)"
              strokeWidth="3"
              paintOrder="stroke"
            />
            <text
              x={x(i)}
              y={y(p.value) - 12}
              textAnchor={i > pts.length - 3 ? 'end' : 'middle'}
              className="fill-[var(--sd-text-primary)] font-mono text-[11px] font-bold"
            >
              {fmt(p.value, chart.unit, chart.valueFormat)}
            </text>
          </g>
        ) : null
      )}
      {pts.map((p, i) =>
        i === 0 || i === pts.length - 1 || p.highlight ? (
          <text
            key={`x${p.label}`}
            x={x(i)}
            y={H - 8}
            textAnchor={
              i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'
            }
            className="fill-[var(--sd-text-secondary)] font-mono text-[10px]"
          >
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

/* ── COMPARISON ──────────────────────────────────────────────────────────────
   Exactly two numbers, where the whole point is the gap between them. Bigger
   type than a bar chart deserves, because this IS the finding. */
function Comparison({ chart }: { chart: ReportChart }) {
  const [a, b] = chart.points;
  if (!a || !b) return null;
  const max = Math.max(a.value, b.value) || 1;
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
      {[a, b].map((p, i) => (
        <div key={p.label} className="bg-surface p-5">
          <div className="font-mono text-[0.62rem] uppercase leading-[1.05rem] tracking-[0.07em] text-text-secondary">
            {p.label}
          </div>
          <div
            className={`font-display mt-2 text-3xl [font-variant-numeric:tabular-nums] sm:text-4xl ${
              i === 1 ? 'text-accent' : 'text-text-primary'
            }`}
          >
            {fmt(p.value, chart.unit, chart.valueFormat)}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-fill">
            <div
              className={`sd-bar h-full rounded-full ${i === 1 ? 'bg-accent' : 'bg-text-secondary/45'}`}
              style={{
                ['--w' as string]: `${(p.value / max) * 100}%`,
                animationDelay: `${i * 90}ms`,
              }}
            />
          </div>
          {p.note && (
            <div className="mt-2 text-sm leading-snug text-text-secondary">
              {p.note}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── STACKED ─────────────────────────────────────────────────────────────────
   Parts of one total, as a single bar. Used where the total is the headline
   and the split is the detail — $830bn of leases, and who signed them. */
function Stacked({ chart }: { chart: ReportChart }) {
  const total = chart.points.reduce((n, p) => n + p.value, 0) || 1;
  // With a highlighted point, that segment takes the accent and the rest step
  // down through greys — otherwise the accent ramp lightens left to right and
  // the point the prose is about can end up the palest segment on the bar.
  const lit = chart.points.some((p) => p.highlight);
  const shade = (p: { highlight?: boolean }, i: number) =>
    !lit
      ? `color-mix(in oklab, var(--sd-accent) ${88 - i * 17}%, var(--sd-surface))`
      : p.highlight
        ? 'var(--sd-accent)'
        : `color-mix(in oklab, var(--sd-text-secondary) ${45 - i * 10}%, var(--sd-surface))`;
  return (
    <div>
      <div className="flex h-12 w-full overflow-hidden rounded-lg border border-border">
        {chart.points.map((p, i) => (
          <div
            key={p.label}
            className="sd-bar h-full border-r border-border/60 last:border-r-0"
            style={{
              // --w drives BOTH the resting width and the animation target.
              // Setting `width` directly here instead let the keyframe's
              // `var(--w, 100%)` fallback win, and every segment animated to
              // full width — which flex then divided evenly, so a $329bn share
              // and an $85bn share drew identically.
              ['--w' as string]: `${(p.value / total) * 100}%`,
              background: shade(p, i),
              animationDelay: `${i * 70}ms`,
            }}
            title={`${p.label}: ${fmt(p.value, chart.unit, chart.valueFormat)}`}
          />
        ))}
      </div>
      <ul
        className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2"
        role="list"
      >
        {chart.points.map((p, i) => (
          <li key={p.label} className="flex items-baseline gap-2.5 text-sm">
            <span
              className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ background: shade(p, i) }}
              aria-hidden="true"
            />
            <span className="text-text-primary">{p.label}</span>
            <span className="ml-auto font-mono font-semibold text-text-primary [font-variant-numeric:tabular-nums]">
              {fmt(p.value, chart.unit, chart.valueFormat)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── QUADRANT ────────────────────────────────────────────────────────────────
   Two scores per company, sorted into four named boxes. Drawn as boxes of
   chips rather than a scatter plot on purpose: scores out of ten land on the
   same few grid points, so a scatter stacks five companies on one dot and
   labels them over each other — on a phone, unreadably. The box a company
   lands in is the finding; its exact coordinates are in the hidden table.

   The grid stays two-by-two at every width. Stacked into one column it is
   four lists, and the point of the figure is that "uses AI" and "gains from
   AI" are different directions. */
function Quadrant({ chart }: { chart: ReportChart }) {
  const xs = chart.xSplit ?? 5;
  const ys = chart.ySplit ?? 5;
  const labels = chart.quadrantLabels ?? { tl: '', tr: '', bl: '', br: '' };
  const byScore = (a: { value: number; x?: number }, b: { value: number; x?: number }) =>
    b.value + (b.x ?? 0) - (a.value + (a.x ?? 0));
  const cell = (top: boolean, right: boolean) =>
    chart.points
      .filter((p) => (p.value >= ys) === top && ((p.x ?? 0) >= xs) === right)
      .sort(byScore);
  const boxes = [
    { key: 'tl', top: true, right: false, label: labels.tl },
    { key: 'tr', top: true, right: true, label: labels.tr },
    { key: 'bl', top: false, right: false, label: labels.bl },
    { key: 'br', top: false, right: true, label: labels.br },
  ];
  return (
    <div className="ms-quad">
      <p className="ms-quad-axis ms-quad-axis-y">
        <span aria-hidden="true">↑</span> {chart.yLabel}
      </p>
      <div className="ms-quad-grid">
        {boxes.map((b) => {
          const pts = cell(b.top, b.right);
          const lit = b.top && b.right;
          return (
            <div key={b.key} className={`ms-quad-box${lit ? ' is-lit' : ''}`}>
              <div className="ms-quad-label">{b.label}</div>
              <ul className="ms-quad-chips" role="list">
                {pts.map((p) => (
                  <li
                    key={p.label}
                    className={`ms-quad-chip${p.highlight ? ' is-hl' : ''}`}
                    title={`${p.label}: ${chart.xLabel ?? 'x'} ${p.x}/10, ${chart.yLabel ?? 'y'} ${p.value}/10`}
                  >
                    {p.label}
                  </li>
                ))}
                {pts.length === 0 && (
                  <li className="ms-quad-empty">None</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="ms-quad-axis ms-quad-axis-x">
        {chart.xLabel} <span aria-hidden="true">→</span>
      </p>
    </div>
  );
}

const RENDER: Record<
  ReportChart['kind'],
  (p: { chart: ReportChart }) => React.ReactNode
> = {
  bar: Bars,
  line: Line,
  comparison: Comparison,
  stacked: Stacked,
  quadrant: Quadrant,
};

export default function Figure({ chart }: { chart: ReportChart }) {
  const Body = RENDER[chart.kind] ?? Bars;
  return (
    <figure className="sd-reveal my-10 rounded-[22px] border border-border bg-background p-5 sm:p-7">
      <figcaption className="mb-6">
        <h3 className="font-display text-[1.2rem] leading-snug text-text-primary">
          {chart.title}
        </h3>
        {/* The plain sentence is not decoration — it is the reason the chart is
            here. A chart a reader has to interpret unaided is a chart that gets
            skipped. */}
        <p className="font-read mt-2 max-w-[62ch] text-[0.95rem] leading-relaxed text-text-secondary">
          {chart.whyItMatters}
        </p>
      </figcaption>
      <Body chart={chart} />
      <DataTable chart={chart} />
      {chart.source && (
        <p className="mt-5 border-t border-dashed border-border pt-3 font-mono text-[0.62rem] uppercase tracking-[0.07em] text-text-secondary">
          {chart.source}
        </p>
      )}
    </figure>
  );
}
