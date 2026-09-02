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
  format?: ReportChart['valueFormat']
) {
  if (format === 'percent') return `${v}%`;
  if (format === 'currency-bn')
    return v >= 1000 ? `$${(v / 1000).toFixed(2)}T` : `$${v}B`;
  if (format === 'x') return `${v}×`;
  return `${v}${unit && unit.length <= 2 ? unit : ''}`;
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
            <th scope="col">{chart.unit}</th>
          </tr>
        </thead>
        <tbody>
          {chart.points.map((p) => (
            <tr key={p.label}>
              <th scope="row">{p.label}</th>
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
  return (
    <div className="space-y-3">
      {chart.points.map((p, i) => {
        const pct = (Math.abs(p.value) / max) * 100;
        return (
          <div
            key={p.label}
            className="grid grid-cols-[minmax(0,11rem)_1fr] items-center gap-4"
          >
            <div className="min-w-0">
              <div className="truncate text-sm text-text-primary">
                {p.label}
              </div>
              {p.note && (
                <div className="truncate font-mono text-[0.62rem] uppercase tracking-[0.07em] text-text-secondary">
                  {p.note}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="h-7 flex-1 overflow-hidden rounded-[3px] bg-fill">
                <div
                  className={`sd-bar h-full rounded-[3px] ${
                    p.highlight ? 'bg-accent' : 'bg-text-secondary/45'
                  }`}
                  style={{
                    ['--w' as string]: `${pct}%`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <div
                className={`w-24 shrink-0 text-right font-mono text-sm font-semibold [font-variant-numeric:tabular-nums] ${
                  p.highlight ? 'text-accent' : 'text-text-primary'
                }`}
              >
                {fmt(p.value, chart.unit, chart.valueFormat)}
              </div>
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
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="sd-draw"
      />
      {pts.map((p, i) =>
        p.highlight ? (
          <g key={p.label}>
            <circle cx={x(i)} cy={y(p.value)} r="4.5" fill="var(--sd-accent)" />
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
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
      {[a, b].map((p, i) => (
        <div key={p.label} className="bg-surface p-5">
          <div className="font-mono text-[0.62rem] uppercase leading-[1.05rem] tracking-[0.07em] text-text-secondary">
            {p.label}
          </div>
          <div
            className={`font-display mt-1 text-3xl font-semibold [font-variant-numeric:tabular-nums] sm:text-4xl ${
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
              background: `color-mix(in oklab, var(--sd-accent) ${88 - i * 17}%, var(--sd-surface))`,
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
              style={{
                background: `color-mix(in oklab, var(--sd-accent) ${88 - i * 17}%, var(--sd-surface))`,
              }}
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

const RENDER: Record<
  ReportChart['kind'],
  (p: { chart: ReportChart }) => React.ReactNode
> = {
  bar: Bars,
  line: Line,
  comparison: Comparison,
  stacked: Stacked,
};

export default function Figure({ chart }: { chart: ReportChart }) {
  const Body = RENDER[chart.kind] ?? Bars;
  return (
    <figure className="my-10 rounded-2xl border border-border bg-surface-elevated p-5 sm:p-7">
      <figcaption className="mb-5">
        <h3 className="font-display text-lg font-semibold tracking-tight text-text-primary">
          {chart.title}
        </h3>
        {/* The plain sentence is not decoration — it is the reason the chart is
            here. A chart a reader has to interpret unaided is a chart that gets
            skipped. */}
        <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
          {chart.whyItMatters}
        </p>
      </figcaption>
      <Body chart={chart} />
      <DataTable chart={chart} />
      {chart.source && (
        <p className="mt-4 border-t border-border pt-3 font-mono text-[0.62rem] uppercase tracking-[0.07em] text-text-secondary">
          {chart.source}
        </p>
      )}
    </figure>
  );
}
