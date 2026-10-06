import type { MarketStormReport } from '@/data/marketStorm';

/**
 * The lead report's central contrast, as numbers a picture can be drawn from.
 *
 * The NVIDIA thesis turns on one comparison: $59.7bn of profit reported,
 * $24.1bn of cash that actually arrived. The report carries the RATIO as data
 * (the `cash-conversion` chart: 40.3 cents per dollar, 86.3 the quarter
 * before), but the two dollar figures only inside sentences.
 */

/*
 * FROM PROSE, NOT FROM FIELDS.
 *
 * Source: src/data/marketStorm.ts, report `ai-capex-abundance-or-bubble`:
 *   kpis[0].note                         "$24.1bn of cash against $59.7bn of profit"
 *   charts['cash-conversion'], Q2 FY27   "$24.1bn of cash against $59.7bn of profit"
 *
 * Keyed by slug, so a new lead report without an entry simply renders without
 * the bars. `findingFor` checks these against the chart's structured value,
 * so a corrected report cannot leave a stale picture behind: if the two
 * disagree by more than half a cent, the bars are dropped and the build log
 * says why.
 */
const FROM_PROSE: Record<
  string,
  {
    profitBn: number;
    cashBn: number;
    /** The chart whose highlighted point is this quarter's cents-per-dollar. */
    chart: string;
    /** The bars' labels, in the report's own plain words. */
    labels: { profit: string; cash: string; before: string };
  }
> = {
  'ai-capex-abundance-or-bubble': {
    profitBn: 59.7,
    cashBn: 24.1,
    chart: 'cash-conversion',
    labels: {
      profit: 'Profit NVIDIA reported',
      cash: 'Cash that actually arrived',
      before: 'three months earlier',
    },
  },
};

export interface Finding {
  profit: string; // "$59.7B"
  cash: string; // "$24.1B"
  labels: { profit: string; cash: string; before: string };
  /** Cash as a share of profit, 0..1 — the cash bar's length. */
  share: number;
  /** The same share one period earlier, 0..1 — the ghost the bar falls from. */
  before: number;
}

const money = (bn: number) => `$${bn}B`;

export function findingFor(report: MarketStormReport): Finding | null {
  const f = FROM_PROSE[report.slug];
  if (!f) return null;
  const points = report.charts?.find((c) => c.id === f.chart)?.points ?? [];
  const at = points.findIndex((p) => p.highlight);
  const now = points[at];
  const prev = points[at - 1];
  if (!now || !prev) return null;

  const share = f.cashBn / f.profitBn;
  if (Math.abs(share * 100 - now.value) > 0.5) {
    console.warn(
      `[WritingStorm] ${report.slug}: $${f.cashBn}bn / $${f.profitBn}bn is ${(share * 100).toFixed(1)}c, but the "${f.chart}" chart says ${now.value}c. Update FROM_PROSE in finding.ts; drawing no bars until then.`
    );
    return null;
  }
  return {
    profit: money(f.profitBn),
    cash: money(f.cashBn),
    labels: f.labels,
    share,
    before: Math.min(1, prev.value / 100),
  };
}

/** "40c" → "40¢", "from 86c" → "from 86¢". Cents read as cents. */
export const cents = (s: string) => s.replace(/(\d)c\b/g, '$1¢');
