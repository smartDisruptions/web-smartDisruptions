// Market Storm — the STORM multi-agent research method (adapted from Stanford's
// STORM) pointed at AI-market catalysts: earnings, major deals, industry moves.
// Each report is a structured object so the section renders as a consistent,
// scannable research note. Reports are RESEARCH, not investment advice.

export type Tone = 'bull' | 'bear' | 'warn' | 'neutral';

export interface Kpi {
  label: string;
  value: string;
  delta?: string;
  note?: string;
  tone?: Tone;
}

export interface PriceCell {
  k: string;
  v: string;
  tone?: Tone;
}

export interface DataColumn {
  label: string;
  align?: 'left' | 'right';
}

export interface DataRow {
  cells: string[];
  star?: boolean; // tinted "load-bearing" row
}

export interface DataTable {
  columns: DataColumn[];
  rows: DataRow[];
}

export interface VerificationItem {
  kind: 'partly' | 'corrected';
  title: string;
  text: string;
}

export interface Verification {
  confirmed: number;
  partlyTrue: number;
  corrected: number;
  confirmedNote: string;
  items: VerificationItem[];
}

export interface SourceRef {
  n: number;
  label: string;
  url: string;
  primary?: boolean;
  secondaryUrl?: string;
  secondaryLabel?: string;
}

export interface MarketStormReport {
  slug: string;
  ticker: string;
  company: string;
  title: string;
  excerpt: string;
  catalyst: string;
  publishDate: string; // ISO 'YYYY-MM-DD'
  tags: string[];
  verdict: string; // the one-line hero thesis
  priceStrip: PriceCell[];
  summary: string; // markdown — the one-paragraph read
  kpis: Kpi[];
  printTable: DataTable; // the catalyst's key figures
  printTableTitle: string;
  bull: string[];
  bear: string[];
  theQuestion: string; // the central-tension callout
  analysis: string; // markdown long-form (valuation, competitive, risk, horizon)
  invalidation: { bull: string[]; bear: string[] };
  verification: Verification;
  openQuestions: string[];
  sources: SourceRef[];
  ogImage?: string;
}

// Shown on the section index and every report — the standing disclosure.
export const MARKET_STORM_DISCLAIMER =
  'Market Storm is research, not investment advice. It is the output of an AI research method applied to public information, and it may contain errors. Nothing here is a recommendation to buy or sell any security. The author may hold positions in companies covered. Do your own research.';

// The method blurb — Market Storm is method-forward: what makes it distinct is
// the AI research pipeline, and every report says how it was made.
export const MARKET_STORM_METHOD =
  "Every Market Storm report is produced by STORM — a multi-agent research method adapted from Stanford's STORM. Several AI agents each take a different stake (a fundamentals analyst, a short-seller, an industry engineer, a valuation watcher), interview each other while grounded in live web search, and surface the load-bearing claims. A separate skeptic pass then tries to *refute* each of those claims against primary sources. What survives is written up here — with the caveats it earned. The finance is the payload; the method is the point.";

const amznQ2_2026: MarketStormReport = {
  slug: 'amzn-q2-2026',
  ticker: 'AMZN',
  company: 'Amazon.com, Inc.',
  title:
    'Amazon just posted its best AWS quarter and its first negative-cash quarter — in the same release',
  excerpt:
    "AWS reaccelerated to +37% and expanded margin — killing the 'AI capex crushes cloud margins' bear thesis for now. But free cash flow turned negative, the headline EPS is ~3× inflated by a one-time Anthropic mark, and capex was raised to ~$220B. STORM put four AI agents on the Q2 2026 print the morning it dropped, then had a skeptic try to refute every load-bearing claim.",
  catalyst: 'Q2 2026 earnings — reported July 30, 2026',
  publishDate: '2026-07-30',
  tags: ['AMZN', 'AWS', 'earnings', 'AI-infrastructure', 'valuation'],
  verdict:
    'Amazon posted its best AWS quarter in years and its first-ever negative-cash quarter — in the same release. The stock is no longer a cash-return story; it’s a duration bet.',
  priceStrip: [
    { k: 'Close · Jul 30', v: '$235.50' },
    { k: 'After hours', v: '≈ +7–10%', tone: 'bull' },
    { k: 'Market cap', v: '~$2.53T' },
    { k: 'Fwd P/E', v: '~26.3×' },
    { k: 'Free cash flow', v: 'negative', tone: 'bear' },
  ],
  summary: `AWS reaccelerated to **+37%** (its fastest in 18 quarters) while *expanding* operating margin to **39.4%** — the opposite of what the "AI capex crushes cloud margins" bear case predicted. But trailing free cash flow turned **negative** as capex hit ~$169B, the headline **$5.75 EPS is ~3× inflated** by a one-time $53.4B mark on the Anthropic stake, and management **raised 2026 capex to ~$220B**. So the stock is no longer a cash-return story — it's a **duration bet** that ~$220B/yr of AI capex converts to AWS revenue at a good return before depreciation and rates catch it. At ~26× forward it's a *normal* Mag-7 multiple — you're not overpaying, but you're underwriting future cash flow that doesn't exist today.`,
  kpis: [
    {
      label: 'AWS revenue',
      value: '$42.2B',
      delta: '+37% YoY',
      note: 'Fastest growth in 18 quarters; beat ~31% consensus.',
      tone: 'bull',
    },
    {
      label: 'AWS operating margin',
      value: '39.4%',
      delta: '▲ from 32.9%',
      note: 'Expanded, didn’t compress — the surprise that funds the capex.',
      tone: 'bull',
    },
    {
      label: 'Operating income',
      value: '$27.5B',
      delta: '+43% YoY',
      note: 'The durable earnings number — read the P/E off this.',
      tone: 'bull',
    },
    {
      label: 'Diluted EPS',
      value: '$5.75',
      delta: '⚠ inflated',
      note: '~3× lifted by a $53.4B one-time Anthropic mark; clean ~$1.82.',
      tone: 'warn',
    },
    {
      label: 'Free cash flow (TTM)',
      value: '−$7.6 to −$11.6B',
      delta: 'from +$18.2B',
      note: 'First-ever negative; capex now exceeds operating cash flow.',
      tone: 'bear',
    },
    {
      label: 'FY26 capex guide',
      value: '~$220B',
      delta: '▲ from ~$200B',
      note: 'Raised on memory-cost inflation + the AI build.',
      tone: 'warn',
    },
    {
      label: 'AWS backlog (RPO)',
      value: '~$496B',
      delta: 'record',
      note: 'The bull’s "the capex is demand-backed" tell.',
      tone: 'bull',
    },
    {
      label: 'Q3 revenue guide',
      value: '+9–12%',
      delta: 'decel',
      note: 'Half of Q2’s +20%; management guides the slowdown itself.',
      tone: 'warn',
    },
  ],
  printTableTitle: 'Q2 2026 — the facts everything hangs on',
  printTable: {
    columns: [
      { label: 'Metric' },
      { label: 'Q2 2026', align: 'right' },
      { label: 'YoY', align: 'right' },
      { label: 'Note' },
    ],
    rows: [
      {
        cells: ['Total net sales', '$200.6B', '+20%', 'Beat ~$196.8B est.'],
      },
      {
        star: true,
        cells: [
          'AWS revenue',
          '$42.2B',
          '+37%',
          'Fastest in 18 quarters; beat ~31% consensus',
        ],
      },
      {
        star: true,
        cells: [
          'AWS operating income',
          '$16.6B',
          '+64%',
          '39.4% margin — expansion, not compression',
        ],
      },
      {
        cells: ['Advertising', '$19.8B', '+26%', 'Compounding underneath AWS'],
      },
      {
        cells: [
          'North America (retail)',
          '$116.2B',
          '+21% OI',
          '$9.1B op income · ~7.9% margin',
        ],
      },
      { cells: ['International', '$42.2B', '—', '$1.7B op income'] },
      {
        star: true,
        cells: [
          'Consolidated operating income',
          '$27.5B',
          '+43%',
          'The durable earnings number',
        ],
      },
      {
        cells: [
          'Net income / EPS',
          '$62.6B / $5.75',
          'vs $1.68',
          '⚠ includes $53.4B one-time Anthropic mark; clean ~$1.82',
        ],
      },
      {
        cells: [
          'TTM free cash flow',
          '−$7.6 to −$11.6B',
          'from +$18.2B',
          '⚠ capex exceeds operating cash flow',
        ],
      },
      {
        cells: [
          'TTM capex',
          '~$169B',
          '+~64%',
          'vs operating cash flow ~$161.4B',
        ],
      },
      {
        cells: [
          'FY2026 capex guide',
          '~$220B',
          '▲ ~$200B',
          'Raised — memory costs + AI',
        ],
      },
      {
        cells: [
          'AWS backlog (RPO)',
          '~$496B',
          'record',
          'The "demand-backed" defense of the capex',
        ],
      },
      {
        cells: [
          'Q3 2026 guide',
          '$197–202B',
          '+9–12%',
          'Decel — OI midpoint ≤ Q2; below ~$204B Street',
        ],
      },
    ],
  },
  bull: [
    '**AWS reaccelerates AND expands margin** off a ~$169B run-rate — the opposite of law-of-large-numbers deceleration.',
    '**Capex is demand-backed:** record ~$496B backlog, capacity sold out through 2027 (two customers tried to buy *all* of 2026’s Graviton).',
    '**Custom silicon → margin,** not just spend — Trainium framed as saving "tens of billions" of capex per year.',
    '**Ads (+26%) and North-America retail (+21% OI)** compound underneath.',
    '**~26× forward is mid-pack** for the Mag-7 — a normal multiple, not a stretched one.',
  ],
  bear: [
    '**Free cash flow is negative;** capex (~$169B) now *exceeds* operating cash flow — funded partly by ~$25B of new debt.',
    '**The $220B capex keeps rising** on memory-cost inflation, with ROIC unproven.',
    '**Earnings are flattered** by a reversible $53.4B non-cash Anthropic mark.',
    '**Circular financing:** Amazon funds Anthropic (~$25B), Anthropic commits >$100B back to AWS.',
    '**A depreciation wave** from the build is set to hit AWS margins in 2026–2027 — not yet realized.',
    '**Google Cloud grows faster** (63–82% vs AWS 37%) and trains its own frontier model on TPUs.',
  ],
  theQuestion: `Is negative free cash flow a *timing artifact* — Jassy's 6–24 month lag, where AWS lays out cash before it can bill, backed by the $496B backlog — or a *structural sink*, where memory-cost inflation and a depreciation wave mean the capex never earns its return? Everything else is downstream of that single call.`,
  analysis: `## Valuation — a normal multiple on a temporarily abnormal cash profile

AMZN sits **mid-pack in the Mag-7** — richer than Meta (~23×), cheaper than Nvidia. The after-hours pop made the forward multiple *richer, not cheaper*, and you're valuing on a P/FCF that currently doesn't compute.

| Multiple (on $235.50) | Value | Context |
| --- | --- | --- |
| Trailing P/E | 28.2× | — |
| **Forward P/E** | **26.3×** | range 25.5–29× across trackers |
| EV / EBITDA | 15.6× | — |
| Price / Sales | 3.3× | — |
| PEG | 1.20 | — |
| Price / FCF | n/a | free cash flow is negative |
| Mag-7 avg fwd P/E | ~27× | vs S&P ~21× — ~10% premium, lowest in a decade |

Post-print targets split hard, which is itself the signal: **BMO raised to $360**, while **UBS cut to $305** and **Mizuho to $320** (mean ~$315–319; 79 buys / 4 holds / 0 sells). The multiple is only "cheap" if AWS ROIC shows up before depreciation and rates catch it.

## AI-compute position — Nvidia's biggest landlord and its silicon challenger, at once

The most nuanced part of the picture, and where the skeptic pass caught the most spin. On the "winning" side: **Trainium3 is throughput-competitive** — a 144-chip UltraServer ≈362 PFLOPs vs Blackwell NVL72 ≈360 — and **Bedrock breadth de-risks single-model dependence** (>100k customers run Claude; GPT-5.5 landed on Bedrock in April 2026, ending Azure exclusivity). AWS is **supply-constrained, not demand-short**: power is "AWS's single biggest constraint," capacity short through 2027.

On the counterweight side: **the marquee OpenAI $38B AWS deal is Nvidia GPUs — not Trainium** — so AWS is the landlord there, not the silicon winner. Trainium's frontier-*training* demand is still overwhelmingly Anthropic. And **Google, not AWS, has the clean story** — TPU 8th-gen trains Gemini, and GCP is growing 2×+ faster off a smaller base. Trainium4's roadmap even adds Nvidia NVLink Fusion — an implicit admission the near-term plan is coexistence with CUDA, not displacement.

> **Caveat (downgraded in review):** The "Trainium at 30–50% of Nvidia cost" figure is AWS marketing that narrows vs H200 spot and disappears once you count the Neuron-SDK migration tax; the "Uber 50% savings" stat was misattributed — Uber's quote was about Graviton4 ride-matching, not training.

## Risk — each isolated, do not blur

1. **The FCF / capex duration bet (the central risk).** FCF is negative and capex (~$169B) exceeds operating cash flow (~$161.4B) — the "94% of OCF" figure circulating is wrong; it's ~105%, which is *why* FCF flipped negative. Jassy frames the hole as a 6–24 month timing lag, backed by the $496B backlog.
2. **Depreciation time-bomb (forward, not yet realized).** Depreciation from the exploding data-center base is set to flow into AWS operating income in 2026–2027, compressing margins even as revenue grows. It has *not* materialized — Q2 margin actually expanded to 39.4%.
3. **Earnings quality / Anthropic circularity.** A $16.8B non-cash Anthropic mark was ~half of Q1 net income — it reverses if Anthropic's ~$1T valuation compresses. The *magnitude* of the Amazon→Anthropic→AWS revenue loop is genuinely unknown (estimates span $1.9B–$10B); the existence is real.
4. **Guided deceleration (already visible).** Q3 revenue guide +9–12% (half of Q2's +20%), operating-income midpoint flat-to-down sequentially, below Street.
5. **Rate / consumer sensitivity.** Negative-FCF, long-duration, debt-funded growth is exactly the profile that de-rates if rates stay high; thin-margin retail carries tariff and recession exposure.
6. **Regulatory / FTC antitrust overhang.** A standing tail risk — not a near-term catalyst on this print.

## Time horizon & position sizing (kept separate)

**Horizon.** Not a next-quarter setup — Q3 is guided to decelerate and the stock already popped. The thesis pays off (or fails) on a **3–5 year** window: does the 2026–2027 capex super-cycle convert to billed AWS revenue at ROIC above the depreciation drag? Under ~2 years you're exposed mostly to sentiment on the capex/FCF headline and the Anthropic mark's swings; at 5 years you're underwriting **AWS ROIC vs depreciation vs rates** — the actual bet.

**Sizing considerations (not a recommendation).** AMZN's swing factor is now the *same* AI-capex cycle that drives Nvidia, Microsoft, and Google — so it adds capex-cycle beta, not diversification, to an AI-infra basket. Reported earnings now carry mark-to-market swings on the private Anthropic stake, a new source of non-operating volatility. And with no FCF cushion today, a normal multiple on an abnormal cash profile argues for entry discipline over conviction-max sizing.`,
  invalidation: {
    bull: [
      'AWS growth rolls back toward the 20s% *while* depreciation lands and compresses margin (the 2026–2027 test).',
      'Backlog (RPO) stalls or utilization disappoints — the "demand-backed" defense evaporates.',
      'The Anthropic stake marks *down* materially — hits earnings, exposes the growth circularity.',
      'Capex keeps rising without FCF inflecting positive by ~2027 — "timing lag" becomes "structural sink."',
    ],
    bear: [
      'FCF inflects clearly positive in 2027 as front-loaded capex bills out — proving the timing-lag framing.',
      'AWS holds high-30s% growth *and* margin through the depreciation wave — proving the capex earns its return.',
      'Trainium wins a *second* major frontier-training tenant beyond Anthropic — breaking the single-customer critique.',
    ],
  },
  verification: {
    confirmed: 5,
    partlyTrue: 3,
    corrected: 1,
    confirmedNote:
      'Confirmed against Amazon’s own filing: AWS +37% / 39.4% margin · negative FCF & $220B capex raise · the $53.4B Anthropic mark and $27.5B durable operating income · power as the binding constraint · the $496B backlog duration bet.',
    items: [
      {
        kind: 'partly',
        title: '"~$6B / ~4 points of AWS growth from Anthropic"',
        text: 'Not found in the cited sources; public estimates of Anthropic’s 2026 AWS revenue span ~$1.9B–$10B. The circularity is real; its magnitude is unknown.',
      },
      {
        kind: 'partly',
        title: 'Trainium "tens of billions saved / several hundred bps margin"',
        text: 'A Q1 2026 call quote spliced onto the Q2 39% margin — still management’s own framing, but temporally misattributed.',
      },
      {
        kind: 'partly',
        title: 'Trainium3 "30–50% of Nvidia cost" + "Uber 50% savings"',
        text: 'Throughput parity holds; the cost figure is AWS marketing that narrows vs H200 spot and disappears with the Neuron-SDK migration tax. The Uber savings stat was about Graviton4, not training.',
      },
      {
        kind: 'corrected',
        title: 'Capex is ~105% of operating cash flow, not "94%"',
        text: 'Capex *exceeds* operating cash flow — that’s precisely why free cash flow went negative. A widely-repeated error.',
      },
    ],
  },
  openQuestions: [
    'What is Anthropic’s *actual* 2026 AWS revenue contribution? Estimates span ~$1.9B–$10B — the circularity’s magnitude is genuinely unknown.',
    'When exactly does the depreciation step-up hit AWS operating margin, and how big? The whole bear case hinges on timing not yet disclosed.',
    'The precise TTM FCF figure — sources split −$7.6B vs −$11.6B on differing capex definitions. The most decision-relevant number has the least source agreement.',
  ],
  sources: [
    {
      n: 1,
      label: 'Amazon Q2 2026 press release (Investor Relations)',
      url: 'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Second-Quarter-Results/default.aspx',
      primary: true,
      secondaryUrl:
        'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000024/amzn-20260630xex991.htm',
      secondaryLabel: 'SEC ex-99.1',
    },
    {
      n: 2,
      label:
        'Investing.com — "AWS surges 37%, FCF turns negative" (2026-07-30)',
      url: 'https://www.investing.com/news/company-news/amazon-q2-2026-slides-aws-surges-37-free-cash-flow-turns-negative-93CH-4826472',
    },
    {
      n: 3,
      label: 'CNBC — Amazon / AWS Q2 2026 (2026-07-30)',
      url: 'https://www.cnbc.com/2026/07/30/amazon-amzn-q2-earnings-report-2026.html',
    },
    {
      n: 4,
      label: 'Yahoo Finance — Amazon Q2 2026 AWS (2026-07-30)',
      url: 'https://finance.yahoo.com/markets/stocks/articles/amazon-q2-2026-earnings-aws-204411872.html',
    },
    {
      n: 5,
      label: 'TradingView / Wall St Engine — rev / OI / NI breakdown',
      url: 'https://www.tradingview.com/news/tradingview:21248e9df393e:0-amazon-posts-200-6b-q2-revenue-27-5b-operating-income-and-62-6b-net-income/',
    },
    {
      n: 6,
      label: 'Variety — ad sales / profit / Anthropic (2026-07-30)',
      url: 'https://variety.com/2026/digital/news/amazon-ad-sales-q2-profit-62-billion-anthropic-1236824567/',
    },
    {
      n: 7,
      label: 'stockanalysis.com — AMZN statistics (multiples, FCF)',
      url: 'https://stockanalysis.com/stocks/amzn/statistics/',
    },
    {
      n: 8,
      label: 'Benzinga — analyst price targets (2026-07-28)',
      url: 'https://www.benzinga.com/analyst-stock-ratings/price-target/26/07/60789995/',
    },
    {
      n: 9,
      label: 'Morningstar — "$200B capex overshadows results"',
      url: 'https://www.morningstar.com/stocks/amazon-earnings-guidance-200-billion-capital-expenditure-2026-overshadows-good-results',
    },
    {
      n: 10,
      label: 'Fortune — Jassy on capex / demand / capacity (2026-07-30)',
      url: 'https://fortune.com/2026/07/30/andy-jassy-amazon-capex-demand-aws-pga-tour/',
    },
    {
      n: 11,
      label:
        'DataCenterDynamics — customers try to buy all Graviton capacity; 3.9GW',
      url: 'https://www.datacenterdynamics.com/en/news/two-customers-ask-to-buy-all-of-aws-graviton-instance-capacity-in-2026/',
    },
    {
      n: 12,
      label: 'GeekWire — "AWS booming but FCF turns negative"',
      url: 'https://www.geekwire.com/2026/aws-is-booming-but-amazons-free-cash-flow-turns-negative-on-record-ai-spending/',
    },
    {
      n: 13,
      label: 'TheNextWeb — Q1 2026 $16.8B Anthropic mark ≈ half of net income',
      url: 'https://thenextweb.com/news/amazon-q1-2026-anthropic-aws-earnings',
    },
    {
      n: 14,
      label: 'TechCrunch — Anthropic $5B / $100B AWS pledge (2026-04-20)',
      url: 'https://techcrunch.com/2026/04/20/anthropic-takes-5b-from-amazon-and-pledges-100b-in-cloud-spending-in-return/',
    },
    {
      n: 15,
      label: 'CNBC — Amazon to invest up to $25B in Anthropic (2026-04-20)',
      url: 'https://www.cnbc.com/2026/04/20/amazon-invest-up-to-25-billion-in-anthropic-part-of-ai-infrastructure.html',
    },
    {
      n: 16,
      label: 'SemiAnalysis — AWS Trainium3 deep dive',
      url: 'https://newsletter.semianalysis.com/p/aws-trainium3-deep-dive-a-potential',
    },
    {
      n: 17,
      label: 'Spheron — Trainium3 vs Nvidia H200 / B200 (2026)',
      url: 'https://www.spheron.network/blog/aws-trainium-3-vs-nvidia-h200-b200-llm-training-inference-2026/',
    },
    {
      n: 18,
      label: 'Motley Fool — Mag-7 valuation lowest in a decade (2026-07-16)',
      url: 'https://www.fool.com/investing/2026/07/16/magnificent-seven-low-valuation-mag-7-stock/',
    },
    {
      n: 19,
      label:
        'Investing.com analysis — "AWS growth must justify $200B AI spend"',
      url: 'https://www.investing.com/analysis/amazons-aws-growth-must-justify-its-200-billion-ai-spending-plan-200684076',
    },
    {
      n: 20,
      label:
        'tech-insider.org — Google Cloud growth [low-confidence secondary]',
      url: 'https://tech-insider.org/google-cloud-82-percent-growth-aws-earnings-2026/',
    },
    {
      n: 21,
      label: 'Google Cloud — AI infrastructure at Next ’26 (TPU 8th-gen)',
      url: 'https://cloud.google.com/blog/products/compute/ai-infrastructure-at-next26',
    },
    {
      n: 22,
      label: 'TradingKey — Q2 recap, price / multiples (2026-07-30)',
      url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262065084-amazon-amzn-q2-earnings-aws-37-percent-record-advertising-stock-up-9-percent-tradingkey',
    },
    {
      n: 23,
      label: 'TheNextWeb — Uber + AWS Trainium (2026-04-07)',
      url: 'https://thenextweb.com/news/uber-amazon-trainium-aws-chips',
    },
    {
      n: 24,
      label: 'Anthropic — Amazon / Trainium partnership',
      url: 'https://www.anthropic.com/news/anthropic-amazon-trainium',
    },
  ],
};

export const marketStormReports: MarketStormReport[] = [amznQ2_2026];

export function getReportBySlug(slug: string): MarketStormReport | undefined {
  return marketStormReports.find((r) => r.slug === slug);
}
