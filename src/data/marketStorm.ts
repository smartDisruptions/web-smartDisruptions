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

// The recurring finding across every report so far: the number in the headline
// is not the number the filing supports. It kept turning up buried in KPI notes,
// so it gets its own block — one row per claim, the gap named explicitly.
export interface HeadlineVsReal {
  headline: string; // what the release / the coverage leads with
  real: string; // what the filing supports
  gap: string; // the mechanism that separates them
}

// A report links to its siblings. Three isolated notes are three notes; three
// notes that read each other are a thesis about the AI-capex cycle.
export interface ThroughLine {
  text: string; // markdown — how this report reads against the others
  links: { label: string; slug: string }[];
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
  headlineVsReal?: HeadlineVsReal[]; // the gap between the release and the filing
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
  // The reader here is a working professional learning AI, not a fund manager.
  // Every report has to answer "what does this tell me about AI?" in plain
  // English, or it is a sell-side note wearing our typeface.
  soWhat?: string; // markdown — the non-finance takeaway
  throughLine?: ThroughLine;
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
  soWhat: `The number to take away from this print isn't the EPS — it's **~$220 billion of capex in one year, at one company**, to build the thing you rent by the token.

That is what "AI is cheap now" actually costs somebody. Every time an API call gets cheaper, it is because a company like this one front-loaded a decade of concrete, power, and silicon and is betting it can bill for it later. Amazon's free cash flow going negative is the first quarter where that bet showed up as an actual hole in the statement rather than a line in a slide deck.

The practical read: if you build on top of this infrastructure, your costs are currently subsidised by a capex race between four companies. Useful to know while it lasts — and worth noticing that **power, not chips, is the binding constraint** Amazon named. That's the ceiling on how cheap inference gets.`,
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

const msftQ4_FY2026: MarketStormReport = {
  slug: 'msft-q4-fy2026',
  ticker: 'MSFT',
  company: 'Microsoft Corporation',
  title:
    'Microsoft moved $15B of capex off the reported line — in the same quarter free cash flow fell for the first time',
  excerpt:
    'Azure grew 43% and crossed $100B. But the headline EPS growth is ~27% powered by a non-cash mark on a private stake, the widely-reported capex "cut" is a lease reclassification rather than a dollar less spending, and $329B of signed-but-uncommenced leases sit off the capex line entirely. STORM put four AI agents on the Q4 FY2026 print, then had a skeptic try to refute every load-bearing claim against the filings.',
  catalyst: 'Q4 FY2026 earnings — reported July 29, 2026',
  publishDate: '2026-08-03',
  tags: ['MSFT', 'Azure', 'earnings', 'AI-infrastructure', 'accounting'],
  verdict:
    'Azure crossed $100B growing 43%, and the market paid with the largest one-day market-cap gain in history. Underneath it, three separate accounting choices all moved reported numbers the same direction — and the real obligation moved off the statement.',
  priceStrip: [
    { k: 'Close · Jul 29 (pre)', v: '$390.54' },
    { k: 'Jul 30 move', v: '+15%', tone: 'bull' },
    { k: 'Price · Aug 3', v: '$487.65' },
    { k: 'Market cap', v: '~$3.62T' },
    { k: 'Fwd P/E', v: '22.6–24.8×' },
    { k: 'FCF yield', v: '~1.85%', tone: 'warn' },
  ],
  summary: `Azure grew **43%** and crossed **$100B** in annual revenue, commercial backlog hit **$678B (+84%)**, and the stock put up the **largest single-day market-cap gain on record**. That part is real. But GAAP EPS of **$4.81 (+32%)** outruns operating income (**+18%**) entirely below the operating line — and roughly **27% of the full year's net income growth** is a non-cash mark on a private OpenAI stake, not operations. Microsoft's non-GAAP **$4.74** strips the OpenAI gain and *keeps* a **$3.2B Anthropic gain** inside it. Meanwhile the calendar-2026 capex figure fell ~$190B → **~$175B** on a **lease reclassification, not less spending**; datacenter useful lives were extended **15 → 25 years** effective FY2027; and **$329.1B** of signed-but-uncommenced leases sit outside the $115.9B capex line. Free cash flow stayed positive at **$67.0B** — while *falling* for the first time in the series.`,
  kpis: [
    {
      label: 'Azure growth',
      value: '+43%',
      delta: 'crossed $100B',
      note: 'Reported and constant-currency — not an FX artifact.',
      tone: 'bull',
    },
    {
      label: 'Commercial RPO',
      value: '$678B',
      delta: '+84%',
      note: 'Ex-OpenAI +25% — management figure, spoken only, unaudited.',
      tone: 'bull',
    },
    {
      label: 'Operating income',
      value: '$40.6B',
      delta: '+18%',
      note: 'The durable number — read the multiple off this, not EPS.',
      tone: 'bull',
    },
    {
      label: 'Diluted EPS (GAAP)',
      value: '$4.81',
      delta: '⚠ +32% vs +18% OI',
      note: 'Gap sits below the operating line; FY26 OpenAI swing was $8.6B.',
      tone: 'warn',
    },
    {
      label: 'Free cash flow (Q4)',
      value: '$19.6B',
      delta: '▼ 23% YoY',
      note: 'Positive — but the first decline, on $41B of quarterly capex.',
      tone: 'bear',
    },
    {
      label: 'Microsoft Cloud margin',
      value: '65%',
      delta: '▼ from 68%',
      note: 'Compressed 3 points — the opposite of what AWS printed.',
      tone: 'bear',
    },
    {
      label: 'Uncommenced leases',
      value: '$329.1B',
      delta: 'off-statement',
      note: '~3× Azure annual revenue; commences FY27–FY33.',
      tone: 'warn',
    },
    {
      label: 'FY26 depreciation',
      value: '$34.3B',
      delta: 'from $22.0B',
      note: 'Up 56% — and useful lives were just extended 15→25 years.',
      tone: 'warn',
    },
    {
      label: 'Q1 FY27 guide',
      value: '$89.9–91.0B',
      delta: '+16%',
      note: 'Above Street ~$89.7B; Azure guided to accelerate to ~45%.',
      tone: 'bull',
    },
  ],
  printTableTitle: 'Q4 FY2026 — the facts everything hangs on',
  printTable: {
    columns: [
      { label: 'Metric' },
      { label: 'Q4 FY2026', align: 'right' },
      { label: 'YoY', align: 'right' },
      { label: 'Note' },
    ],
    rows: [
      {
        cells: [
          'Total revenue',
          '$90,007M',
          '+17.7%',
          'Beat ~$87.6B consensus by $2.4B',
        ],
      },
      {
        star: true,
        cells: [
          'Operating income',
          '$40,603M',
          '+18.3%',
          '45.1% margin — essentially flat YoY',
        ],
      },
      {
        cells: [
          'Other income (expense), net',
          '+$3,444M',
          'from −$1,707M',
          'A $5,151M swing — the source of the EPS gap',
        ],
      },
      {
        cells: [
          'Net income',
          '$35,766M',
          '+31.3%',
          'Despite a higher 18.8% tax rate (vs 16.5%)',
        ],
      },
      {
        star: true,
        cells: [
          'Diluted EPS — GAAP / non-GAAP',
          '$4.81 / $4.74',
          '+32% / +23%',
          '⚠ non-GAAP strips OpenAI only; Anthropic gain stays in',
        ],
      },
      {
        cells: [
          'Microsoft Cloud',
          '$59.3B',
          '+27%',
          'Gross margin 65%, down from 68%',
        ],
      },
      {
        star: true,
        cells: [
          'Azure and other cloud',
          '—',
          '+43%',
          'Crossed $100B annual revenue; +43% cc',
        ],
      },
      {
        cells: [
          'Intelligent Cloud',
          '$39,306M',
          '+31.6%',
          '$15,955M op income · 40.6% margin, flat',
        ],
      },
      {
        cells: [
          'Productivity & Business Processes',
          '$37,847M',
          '+14.3%',
          '$21,900M op income · 57.9% margin',
        ],
      },
      {
        cells: [
          'More Personal Computing',
          '$12,854M',
          '−4.4%',
          'Op income −13.9%; Xbox impairments',
        ],
      },
      {
        star: true,
        cells: [
          'Capex incl. finance leases',
          '~$41B',
          '+69–71%',
          '$35.8B cash PP&E + $5.6B leases; ⅔ short-lived silicon',
        ],
      },
      {
        star: true,
        cells: [
          'Free cash flow',
          '$19,639M',
          '▼ 23%',
          '⚠ positive but declining; FY26 $67.0B, down ~6.5%',
        ],
      },
      {
        cells: [
          'Commercial RPO',
          '$678B',
          '+84%',
          'Ex-OpenAI +25%; ~30–45% OpenAI-attributable',
        ],
      },
      {
        cells: [
          'Commercial bookings',
          '—',
          '+10% (+11% cc)',
          'Ex-OpenAI +18% — OpenAI depresses this one',
        ],
      },
      {
        cells: [
          'FY26 totals',
          '$331.8B rev',
          '+17.8%',
          'Op income $155.2B (+20.8%); GAAP EPS $17.95 (+32%)',
        ],
      },
      {
        cells: [
          'Uncommenced leases',
          '$329.1B',
          'as of 6/30/26',
          '⚠ Not in capex; commences FY27–FY33',
        ],
      },
    ],
  },
  bull: [
    '**Azure grew 43% and crossed $100B** — accelerating off a base that should be decelerating, and guided to ~45% next quarter.',
    '**The backlog is real and broadening:** $678B RPO (+84%), and still +25% excluding OpenAI — so the growth is not just the related party.',
    '**Margins expanded while capex ran up 69%:** FY26 operating margin 46.8% vs ~45.6%, which is not what a broken-returns story looks like.',
    '**Free cash flow is positive** at $67.0B for the year — the thing Amazon lost this quarter, Microsoft kept.',
    '**Microsoft is third-cheapest of the Mag-7** on forward P/E (24.8× vs GOOGL 28.1×, AMZN 29.3×, AAPL 33.2×).',
    '**Maia 200 attacks the actual constraint:** ~750W vs Nvidia 1,200W+ matters when your binding limit is a gigawatt, not a purchase order.',
  ],
  bear: [
    '**Free cash flow fell for the first time** — down 23% in the quarter and ~6.5% for the year; capex now consumes 63% of operating cash flow.',
    '**The $15B capex "cut" is a reclassification,** not restraint: shifting finance leases to operating leases moves spending off the reported line without reducing it by a dollar.',
    '**$329.1B of uncommenced leases** sit outside capex entirely — roughly 3× Azure’s annual revenue, commencing FY27–FY33.',
    '**~27% of FY26 net income growth is a non-cash mark** on a private OpenAI stake that swung from a $3.62B loss to a $4.96B gain.',
    '**Cloud gross margin compressed 3 points** to 65% — the mirror image of the margin *expansion* AWS printed the next day.',
    '**Microsoft lost right of first refusal** on OpenAI’s compute, while OpenAI committed $100B+ to AWS on top of its $250B Azure commitment.',
  ],
  theQuestion: `Three accounting choices landed in one quarter, and every one of them flattered a reported number: useful lives extended 15→25 years, ~$15B of capex reclassified from finance to operating leases, and a headline EPS lifted by a non-cash mark on a private stake. Individually each is defensible — datacenters really may last 25 years, ASC 842 really does work that way, and the OpenAI gain is really disclosed. The question is whether they are ordinary hygiene arriving together by coincidence, or a reported cash profile being managed while the actual obligation — $329B of leases not yet on any statement — accumulates offstage. Everything else is downstream of that call.`,
  analysis: `## Valuation — a reasonable P/E sitting on a 1.85% cash yield

The multiple depends entirely on which earnings number you use, and the trackers do not agree with each other.

| Multiple (at $487.65, Aug 3) | Value | Context |
| --- | --- | --- |
| Trailing P/E | 27.2× | on GAAP $17.95 |
| **Forward P/E** | **22.6–24.8×** | genuine tracker spread, not one number |
| P/E on clean operating EPS | ~28.6× | strips the residual discrete benefit |
| EV / EBITDA | 19.0× | — |
| Price / Sales | 10.9× | — |
| **Price / FCF** | **54.1×** | the line nobody quotes |
| PEG | 1.58 | — |
| S&P 500 forward P/E | 19.6× | FactSet, Jul 31 — MSFT at ~26% premium |

The under-discussed number is that **P/FCF of 54× against a P/E of 27×**. The equity yields about **1.85% in free cash flow** because capex is taking 63% of operating cash. On the P/E line the multiple is asking for roughly what management guided — ~14–15% NTM EPS growth, and the Q1 guide plus a ~45% Azure acceleration is consistent with that. The stretch is entirely on cash, not on earnings.

Analyst reaction was uniformly constructive and unusually dispersed: **56 analysts, mean target $562.73, median $550, high $870, low $400**, with 40 Strong Buy / 13 Buy / 3 Hold / 0 Sell. Goldman went $610→$640; Wells Fargo reset to $650. **I could not find a single post-print cut** — but note that BofA ($500) and Phillip ($515) raised to levels barely above the current price, which is where the real disagreement lives.

## AI-compute position — attacking the constraint that actually binds

Microsoft now reports capacity in **gigawatts, not GPUs**, and that unit change is the tell. It added ~1GW in the quarter, opened 31 datacenters (88 for the year), and says it is on track to roughly double total capacity in two years. Demand still exceeds supply, and management **declined to say when that ends** — or even to name whether the binding constraint is power, shells, GPUs, or land.

That reframes the silicon story. **Maia 200 is an inference part, not a training part** — TSMC N3, 10 PFLOPS FP4, 216GB HBM3e, and critically **~750W against Nvidia designs at 1,200W+**. When your limit is a gigawatt rather than a purchase order, performance-per-watt *is* the capacity strategy. It is internal-only; enterprise customers cannot select Maia instances.

> **Caveat the skeptic pass insisted on:** every custom-silicon performance claim in circulation this quarter — Microsoft's "30% better performance per dollar," Amazon's Trainium comparisons, Google's TPU numbers — is **vendor-published and unrefereed**. MLPerf Inference v6.0 (April 2026) drew 24 submitting organizations and included **no Maia results and no current-generation TPU results**. There is no neutral referee. Treat all of it as directional.

On competitive growth, the three clouds are not comparable without adjusting for base: **Azure +43% off >$100B**, **AWS +37% to $42.2B**, **Google Cloud +82% to $24.8B**. The Google figure is the one most often quoted without its asterisk — it **includes the Wiz acquisition**, closed March 2026, with no organic/inorganic split disclosed anywhere I could find. All three are now supply-constrained, which means the differentiator has moved from who has demand to who can energize watts fastest.

The OpenAI relationship is now genuinely two-sided. Microsoft holds ~27% as-converted at **$135B carrying value**, OpenAI committed **$250B** of Azure purchases — and Microsoft **gave up right of first refusal** on OpenAI's compute. OpenAI has since expanded AWS by ~$100B on top of an existing $38B. Products still ship first on Azure unless Microsoft cannot supply, but the exclusivity is gone.

## Risk — six, isolated, not blurred

1. **The reclassification question (the central risk).** The calendar-2026 capex guide fell ~$190B → ~$175B because finance leases became operating leases, not because spending fell. Extending assumed asset life from 15 to 25 years makes a given lease term a smaller fraction of that life, which is the mechanism that moves the classification. Microsoft disclosed all of it on the call — but the headline number that reached most readers was "Microsoft cut capex."
2. **The off-statement obligation.** $329.1B of leases signed but not commenced, primarily datacenters, commencing FY27–FY33. That is roughly 3× Azure's annual revenue and it appears in none of the capex figures. Sources disagree on the prior-period base ($196.6B vs $92.7B) and I could not reconcile them against the filing.
3. **Earnings quality.** The FY26 OpenAI line swung $8.6B — from a $3.62B loss to a $4.96B gain — against ~$31.6B of total net income growth. The gain is a **dilution gain from the OpenAI recapitalization**: non-cash, non-operating, and reversible if OpenAI's valuation compresses. Separately, a $3.2B Anthropic gain sits *inside* the "clean" non-GAAP $4.74.
4. **Depreciation, deferred rather than absorbed.** FY26 depreciation was $34.3B, up from $22.0B and $15.2B. The useful-life extension pushes future depreciation out — and management guided FY27 operating margin "down less than a point." Real compression, pre-announced, small. Worth noting the extension covers **buildings and shells, not servers or GPUs**, so the classic "they stretched server lives" attack does not apply here.
5. **Cloud margin compression.** Microsoft Cloud gross margin fell 3 points to 65%. Amazon printed AWS margin *expansion* the following day. Same capex cycle, opposite margin direction — that contrast is the single most decision-relevant comparison in this report.
6. **Related-party concentration.** OpenAI accounts for somewhere in a **30–45% band** of commercial RPO depending on which disclosure and quarter you read, and Microsoft does not disclose how much Azure revenue comes from OpenAI. The direction of travel is down as a share and up in absolute dollars.

## Time horizon & position sizing (kept separate)

**Horizon.** This is not a next-quarter setup — the stock already moved ~25% in three sessions and the Q1 guide is in the price. The thesis resolves on a **3–5 year** window: do the FY27–FY33 lease commencements convert to billed Azure revenue at a return above the depreciation that was just pushed out? Under two years you are trading sentiment on the capex headline and the mark-to-market swings on two private stakes. At five years you are underwriting **Azure ROIC against a deferred depreciation schedule** — the actual bet.

**Sizing considerations (not a recommendation).** MSFT now carries the same AI-capex-cycle beta as NVDA, AMZN and GOOGL, so it adds correlation rather than diversification to an AI-infrastructure basket. Reported earnings now swing on marks on two private companies — OpenAI and Anthropic — which is a new and lumpy source of non-operating volatility Microsoft does not remark routinely. And a ~1.85% free-cash-flow yield leaves less cushion than a 27× P/E implies.`,
  invalidation: {
    bull: [
      'Free cash flow keeps falling through FY27 as the uncommenced leases begin commencing — "positive FCF" becomes a technicality.',
      'Azure decelerates back toward the 30s% while the deferred depreciation lands, compressing Intelligent Cloud margin from both sides.',
      'The OpenAI stake marks down materially — reversing the dilution gain and exposing how much of FY26 EPS growth was non-operating.',
      'Ex-OpenAI RPO growth rolls over, showing the backlog was more related-party-dependent than the +25% figure implies.',
      'FY27 operating margin falls materially more than the guided "less than a point," indicating the useful-life extension was masking real compression.',
    ],
    bear: [
      'FCF inflects clearly upward in FY27–FY28 even as leases commence — proving the build is self-funding.',
      'Azure holds 40%+ growth through the depreciation step-up, with Intelligent Cloud margin stable or rising.',
      'Maia lands a verified third-party benchmark (MLPerf or equivalent) that substantiates the perf-per-watt claim rather than asserting it.',
      'Ex-OpenAI bookings keep compounding at 18%+, making the related-party concentration a shrinking rather than structural issue.',
    ],
  },
  verification: {
    confirmed: 3,
    partlyTrue: 5,
    corrected: 1,
    confirmedNote:
      'Confirmed against Microsoft’s own filings: the OpenAI EPS impact ($480M/$0.07 in Q4, $4,963M/$0.67 for FY26, reconciling exactly across four quarters) · commercial RPO $678B +84% with ex-OpenAI +25% and bookings +18% · Microsoft Cloud gross margin 65% in Q4 and 66% for the year, down from 68%.',
    items: [
      {
        kind: 'corrected',
        title: '"Capex more than doubled, yet free cash flow stayed positive"',
        text: 'Both halves mislead. "More than doubled" is true only of the narrow cash PP&E line; on Microsoft’s own $41B headline measure capex rose ~70%. And "stayed positive" hides that FCF *fell* 23% in the quarter and ~6.5% for the year — the first annual decline in the series. The defensible verb is "declined while remaining positive."',
      },
      {
        kind: 'partly',
        title: 'The EPS gap sits "entirely" below the operating line',
        text: 'The direction is right but "entirely" hides a two-sided decomposition: the tax rate rose from 16.5% to 18.8%, clawing back ~3.7pp, and EPS growth exceeds net income growth partly because the share count fell — a buyback effect, not an income-statement item.',
      },
      {
        kind: 'partly',
        title: 'The $6.5B OpenAI gain explains the other-income swing',
        text: 'It explains 72% of it, not all. Other income swung $15.6B year over year; Microsoft’s own ex-OpenAI adjusted other income still moved +$4.3B — which is where the $3.2B Anthropic gain lives.',
      },
      {
        kind: 'partly',
        title: '"Clean operating EPS of ~$4.47"',
        text: 'The $0.27 of discrete items is defined by Microsoft as a variance versus April guidance, not as a decomposition of reported EPS — and its components are largely operating lines. Subtracting it yields "EPS as if discrete items had landed on guidance," not a clean operating figure. The scrubbed beat is directionally right; the precise number carries a real error bar.',
      },
      {
        kind: 'partly',
        title: 'The 15→25 year useful-life extension, cited to the 10-K',
        text: 'The extension is verbatim in Amy Hood’s call remarks, but it appears nowhere in the FY2026 10-K — "25 years" occurs zero times, and the PP&E policy note still reads "five to 15 years." The change is prospective from FY2027. Citing the filing for it makes a call disclosure look like a filed one.',
      },
      {
        kind: 'partly',
        title: 'Capex +69% vs Azure +43% — "a 26-point spread"',
        text: 'The spread is 27–28 points on the unrounded base ($41.4B, giving +71%). More importantly it is an analyst construct, not a disclosed figure, and it compares total-company capex growth against one segment’s revenue growth. Microsoft Cloud overall grew 27%.',
      },
    ],
  },
  openQuestions: [
    'What share of Azure revenue actually comes from OpenAI? Microsoft discloses the RPO share inconsistently (30–45% across quarters and sources) and never discloses the revenue.',
    'What is the prior-period base for the $329.1B of uncommenced leases? Sources give $196.6B and $92.7B — plausibly sequential vs annual, but I could not reconcile either against the filing.',
    'What is the Nvidia-versus-in-house split of Azure AI capacity? No Microsoft disclosure exists; every circulating figure is a third-party estimate.',
    'Does the 30% perf-per-dollar Maia claim hold against a neutral benchmark? There is no MLPerf submission to check it against, and the baseline is unstated.',
    'One flat contradiction left unresolved: Microsoft’s release reports the Q4 OpenAI item as a $480M *gain*, while at least one outlet described a ~$600M Q4 *markdown*. The primary filing supports the gain, and I did not average them.',
  ],
  soWhat: `The transferable lesson here has nothing to do with owning the stock: **when a number moves, check whether the thing it measures moved, or whether the definition did.**

Microsoft's capex figure fell from ~$190B to ~$175B and was widely reported as a pullback in AI spending. It wasn't. Leases were reclassified — the same buildings, counted differently. Meanwhile $329.1B of signed-but-uncommenced leases sit outside the capex line entirely, and the useful life of a datacenter was extended from 15 years to 25, which lowers annual depreciation on every asset in the fleet.

None of that is fraud; it is all disclosed, and mostly defensible. But three separate accounting choices in one quarter all moved reported numbers the same direction, and the summary you read probably mentioned none of them. **The filing and the coverage of the filing are two different documents** — and only one of them is signed under penalty of law.`,
  sources: [
    {
      n: 1,
      label: 'Microsoft Q4 FY2026 press release — 8-K Exhibit 99.1',
      url: 'https://www.sec.gov/Archives/edgar/data/0000789019/000119312526323632/msft-ex99_1.htm',
      primary: true,
      secondaryUrl:
        'https://www.microsoft.com/en-us/investor/earnings/fy-2026-q4/press-release-webcast',
      secondaryLabel: 'Microsoft IR',
    },
    {
      n: 2,
      label: 'Microsoft Form 10-K, fiscal year ended June 30, 2026',
      url: 'https://www.sec.gov/Archives/edgar/data/0000789019/000119312526323660/msft-20260630.htm',
      primary: true,
    },
    {
      n: 3,
      label: 'Microsoft FY26 Q4 earnings call — Amy Hood prepared remarks',
      url: 'https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q4',
      primary: true,
    },
    {
      n: 4,
      label:
        'Investing.com — Microsoft Q4 FY2026 earnings call transcript (2026-07-29)',
      url: 'https://www.investing.com/news/transcripts/earnings-call-transcript-microsoft-q4-2026-beats-forecasts-stock-jumps-8-93CH-4822020',
    },
    {
      n: 5,
      label: 'CNBC — Microsoft Q4 FY2026 vs LSEG consensus (2026-07-29)',
      url: 'https://www.cnbc.com/2026/07/29/microsoft-msft-q4-earnings-report-2026.html',
    },
    {
      n: 6,
      label:
        'Directions on Microsoft — capacity constraints and capex acceleration (2026-07-30)',
      url: 'https://www.directionsonmicrosoft.com/microsoft-expect-capacity-constraints-capex-acceleration-to-continue/',
    },
    {
      n: 7,
      label: 'PYMNTS — the 15-to-25-year datacenter useful-life extension',
      url: 'https://www.pymnts.com/earnings/2026/microsoft-extends-data-center-lifespans-to-soften-ai-buildout-costs/',
    },
    {
      n: 8,
      label:
        'Business Model Analyst — "the $15B capex cut is an accounting move"',
      url: 'https://businessmodelanalyst.com/microsoft-capex-accounting-signal/',
    },
    {
      n: 9,
      label:
        'BTW Media — $329.1B of uncommenced datacenter leases (from the FY26 10-K)',
      url: 'https://btw.media/en/microsoft-329-1bn-uncommenced-datacentre-leases',
    },
    {
      n: 10,
      label:
        'Bloomberg — over $130B in new datacenter leases in the quarter (2026-07-29)',
      url: 'https://www.bloomberg.com/news/articles/2026-07-29/microsoft-reports-over-130-billion-in-new-data-center-leases',
    },
    {
      n: 11,
      label:
        'TechCrunch — $3.2B Anthropic gain; conflicting OpenAI characterization (2026-07-29)',
      url: 'https://techcrunch.com/2026/07/29/microsoft-logs-3-2b-from-anthropic-investment-but-openai-was-a-mixed-bag/',
    },
    {
      n: 12,
      label:
        'Microsoft — the next chapter of the Microsoft/OpenAI partnership (2025-10-28)',
      url: 'https://blogs.microsoft.com/blog/2025/10/28/the-next-chapter-of-the-microsoft-openai-partnership/',
      primary: true,
      secondaryUrl:
        'https://openai.com/index/next-chapter-of-microsoft-openai-partnership/',
      secondaryLabel: 'OpenAI',
    },
    {
      n: 13,
      label:
        'Directions on Microsoft — the April 2026 OpenAI agreement amendment',
      url: 'https://www.directionsonmicrosoft.com/microsoft-openai-amend-their-agreement-again/',
    },
    {
      n: 14,
      label:
        'DataCenterDynamics — recapitalization terms, 27% stake, $250B Azure, ROFR lost',
      url: 'https://www.datacenterdynamics.com/en/news/openai-completes-for-profit-move-microsoft-given-27-stake-and-250bn-azure-contract-but-no-longer-has-cloud-right-of-first-refusal/',
    },
    {
      n: 15,
      label: 'The Register — Maia 200 technical teardown (2026-01-26)',
      url: 'https://www.theregister.com/2026/01/26/microsoft_maia_200/',
    },
    {
      n: 16,
      label: 'Forbes — Maia 200 deployment and cloud AI economics (2026-02-01)',
      url: 'https://www.forbes.com/sites/janakirammsv/2026/02/01/microsoft-deploys-custom-maia-200-chip-to-reshape-cloud-ai-economics/',
    },
    {
      n: 17,
      label:
        'MLCommons — MLPerf Inference v6.0 results (2026-04-01); no Maia submission',
      url: 'https://mlcommons.org/2026/04/mlperf-inference-v6-0-results/',
      primary: true,
    },
    {
      n: 18,
      label:
        'Amazon Q2 2026 earnings release — AWS +37% comparison (2026-07-30)',
      url: 'https://www.aboutamazon.com/news/company-news/amazon-earnings-q2-2026-report',
      primary: true,
    },
    {
      n: 19,
      label:
        'Alphabet Q2 2026 earnings release — Google Cloud +82% (2026-07-22)',
      url: 'https://s206.q4cdn.com/479360582/files/doc_financials/2026/q2/2026q2-alphabet-earnings-release.pdf',
      primary: true,
    },
    {
      n: 20,
      label:
        'Google — Wiz acquisition closed (2026-03-11); the asterisk on the 82%',
      url: 'https://www.googlecloudpresscorner.com/2026-03-11-Google-Completes-Acquisition-of-Wiz',
      primary: true,
    },
    {
      n: 21,
      label: 'stockanalysis.com — MSFT valuation stack, as of 2026-08-03',
      url: 'https://stockanalysis.com/stocks/msft/statistics/',
    },
    {
      n: 22,
      label:
        'stockanalysis.com — MSFT analyst targets and rating counts, as of 2026-08-03',
      url: 'https://stockanalysis.com/stocks/msft/forecast/',
    },
    {
      n: 23,
      label: 'FactSet Earnings Insight — S&P 500 forward P/E 19.6 (2026-07-31)',
      url: 'https://insight.factset.com/sp-500-earnings-season-update-july-31-2026',
    },
    {
      n: 24,
      label: 'Yahoo Finance — largest single-day gain in history (2026-07-30)',
      url: 'https://finance.yahoo.com/technology/article/microsofts-stock-rockets-more-than-15-for-largest-single-day-jump-in-history-120144134.html',
    },
    {
      n: 25,
      label: 'TipRanks — Goldman Sachs raises to $640 after the beat',
      url: 'https://www.tipranks.com/news/microsoft-stock-price-forecast-goldman-sachs-raises-target-to-640-after-q4-beat',
    },
    {
      n: 26,
      label:
        'scanx.trade — ex-OpenAI RPO growth from the call [conflicts with other attributions]',
      url: 'https://scanx.trade/stock-market-news/companies/microsoft-q4-results-commercial-rpo-hits-record-678-billion/46990028',
    },
  ],
};

const pltrQ2_2026: MarketStormReport = {
  slug: 'pltr-q2-2026',
  ticker: 'PLTR',
  company: 'Palantir Technologies Inc.',
  title:
    'Palantir grew 93% and paid a 1.4% tax rate — only one of those is in the headlines',
  excerpt:
    'Revenue accelerated for a third straight quarter to +93%, GAAP operating margin went 27% → 47%, and free cash flow hit a 63% margin on $14.6 million of capex. The growth is real and the operating leverage is not an adjusted-numbers trick. But $15.4M of tax on $1.08B of pre-tax income does a fifth of the work in the headline EPS, and the stock carries ~114× normalized earnings. STORM put four AI agents on the Q2 2026 print, then had skeptics try to refute every load-bearing claim against the filings — including this report’s own bear case, which is where the pass bit hardest.',
  catalyst: 'Q2 2026 earnings — reported August 3, 2026',
  publishDate: '2026-08-04',
  tags: ['PLTR', 'AIP', 'earnings', 'enterprise-AI', 'valuation'],
  verdict:
    'Palantir accelerated to 93% growth at a $1.9B quarterly run rate — something large software companies are not supposed to be able to do. It is also the one AI winner with no capex to hide anything in, which moves the entire earnings-quality question into the price.',
  priceStrip: [
    { k: '52-wk high', v: '$207.52' },
    { k: 'Two-day move', v: '≈ +30%', tone: 'bull' },
    { k: 'Price · Aug 4', v: '$163.24' },
    { k: 'Market cap', v: '~$391B' },
    { k: 'Fwd P/E', v: '86.5×', tone: 'warn' },
    { k: 'P/S · FY26 guide', v: '~48×', tone: 'bear' },
  ],
  summary: `Revenue grew **93%** to $1.935B — the *third consecutive quarter of acceleration* (+70% → +85% → +93%), which at a $1.9B quarterly run rate is close to unheard of. GAAP operating margin went **27% → 47%**, and that one isn't adjusted: it's the actual income statement. Adjusted free cash flow was **$1.22B at a 63% margin** on **$14.6M** of capex — Palantir monetizes the AI buildout without funding it. Management raised the FY26 guide to **$8.15B (+82%)**, up from the +61% it guided in February. All real. But **Palantir paid $15.4M of tax on $1.081B of pre-tax income — a 1.42% rate** — while its own non-GAAP footnote calls 23% the long-term rate; apply that and the headline **$0.41 EPS is ~$0.32**. Closed TCV grew only **49%** against revenue's 93%, all of it from one segment — though the broader backlog (total RDV **+83%**) largely answers that. At **~48× forward sales and ~114× normalized earnings**, the price already assumes about five more years of this.`,
  headlineVsReal: [
    {
      headline:
        '"GAAP net income of $1.062 billion, representing a 55% margin" — and diluted EPS of **$0.41**, up from $0.13.',
      real: 'About **$0.32** at the tax rate Palantir itself calls its long-term rate. Operating income — the part that is unambiguously the business — was $912M.',
      gap: 'Palantir booked **$15.4M of tax on $1,081.3M of pre-tax income, a 1.42% effective rate**, confirmed in the Q2 10-Q filed 2026-08-04. Note 10 states the company "has maintained a full valuation allowance on its U.S. and U.K. deferred tax assets" with "a reasonable possibility" of releasing it. Its own adjusted-EPS footnote assumes a 23.0% long-term rate; applying that costs ~$233M and ~9¢. You can watch the gap open in the release itself — adjusted EPS ($0.41) has converged with GAAP EPS and is arithmetically now a shade *below* it, where a year ago it was $0.16 against $0.13. That convergence is mechanical, not mysterious: adjusted EPS is taxed at 23% while GAAP is taxed at 1.42%, so the two lines meeting *is* the tax gap becoming visible.',
    },
    {
      headline:
        '"Rule of 40 score of 155%" — quoted in the CEO’s first sentence.',
      real: '**140%** using the GAAP operating margin. Still, by a distance, the best score in enterprise software.',
      gap: 'Palantir defines Rule of 40 as revenue growth plus the **adjusted** operating margin (62%), which excludes $265.2M of stock compensation. The GAAP margin is 47%. This is a company-defined metric, not a GAAP one — the number is extraordinary either way, but 155% and 140% are not the same claim.',
    },
    {
      headline:
        '"Closed total contract value (TCV) of $3.373 billion, up 49% year-over-year" — read as bookings confirming the growth.',
      real: 'Closed TCV did grow at roughly **half** the rate of revenue (+49% vs +93%) — but it is the *narrowest* backlog measure, and the broader ones tracked revenue closely: **total remaining deal value $13.1B, +83%**.',
      gap: 'This is the claim our own verification pass cut down the most, so here it is with the counter-evidence attached. The arithmetic holds: TCV-to-quarterly-revenue fell to **1.74× from 2.26×**, the TCV definition is word-for-word unchanged between releases, and backing US commercial ($2.132B) out of the $3.373B total leaves bookings everywhere else at **$1.241B vs $1.427B — about −13% YoY**. What defuses it: the year-ago quarter was a *record* +140% TCV spike, the ratio actually **rose sequentially** from 1.48× in Q1 2026, and total RDV (+83%) and RPO ($4.9B) are the measures that matter for revenue conversion. Treat TCV as one yellow flag worth watching next quarter — not as evidence the growth is hollow.',
    },
  ],
  kpis: [
    {
      label: 'Revenue growth',
      value: '+93%',
      delta: '3rd straight accel',
      note: '+70% → +85% → +93%, at a $1.9B quarterly run rate.',
      tone: 'bull',
    },
    {
      label: 'US commercial revenue',
      value: '$764M',
      delta: '+149% YoY',
      note: 'The engine of the whole print — and the concentration.',
      tone: 'bull',
    },
    {
      label: 'GAAP operating margin',
      value: '47%',
      delta: '▲ from 27%',
      note: 'Real operating leverage — this is the unadjusted line.',
      tone: 'bull',
    },
    {
      label: 'Adjusted free cash flow',
      value: '$1.22B',
      delta: '63% margin',
      note: 'On $14.6M of capex. Nobody else in AI has this shape.',
      tone: 'bull',
    },
    {
      label: 'Effective tax rate',
      value: '1.42%',
      delta: '⚠ vs 23% stated',
      note: '$15.4M on $1.08B pre-tax; ~9¢ of the $0.41 EPS.',
      tone: 'warn',
    },
    {
      label: 'Closed TCV',
      value: '$3.37B',
      delta: '+49% YoY',
      note: 'The one metric lagging revenue — but total RDV grew 83%.',
      tone: 'warn',
    },
    {
      label: 'Total remaining deal value',
      value: '$13.1B',
      delta: '+83% YoY',
      note: 'The broad backlog measure — tracks revenue far more closely.',
      tone: 'bull',
    },
    {
      label: 'Stock comp',
      value: '$265M',
      delta: '13.7% of revenue',
      note: 'Down from 15.9%; diluted share count up just 0.2% YoY.',
      tone: 'neutral',
    },
    {
      label: 'Valuation',
      value: '~48×',
      delta: 'fwd sales · ~114× norm. P/E',
      note: 'The most expensive large-cap in US software, by a wide margin.',
      tone: 'bear',
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
        cells: [
          'Revenue',
          '$1,935.5M',
          '+93%',
          'Beat ~$1.81B consensus and its own $1.86B guide',
        ],
      },
      {
        star: true,
        cells: [
          'US commercial revenue',
          '$764M',
          '+149%',
          'The engine — and where all the bookings growth sits',
        ],
      },
      {
        cells: [
          'US government revenue',
          '$809M',
          '+90%',
          'Still the larger US half',
        ],
      },
      {
        cells: [
          'US revenue (total)',
          '$1,573M',
          '+115%',
          '81% of total revenue — this is a US story',
        ],
      },
      {
        star: true,
        cells: [
          'GAAP income from operations',
          '$912.0M',
          '+239%',
          '47% margin, up from 27% — not an adjusted figure',
        ],
      },
      {
        cells: [
          'Adjusted income from operations',
          '$1,194.5M',
          '+157%',
          '62% margin — excludes $265M of stock comp',
        ],
      },
      {
        cells: [
          'Interest income',
          '$77.5M',
          '+38%',
          'On $9.2B of cash and Treasuries, no debt',
        ],
      },
      {
        cells: [
          'Other income, net',
          '$91.8M',
          'from $6.6M',
          '⚠ ~14×; materially non-cash marks — not operating',
        ],
      },
      {
        star: true,
        cells: [
          'Provision for income taxes',
          '$15.4M',
          'on $1,081.3M pre-tax',
          '⚠ A 1.42% effective rate; company states 23% long-term',
        ],
      },
      {
        cells: [
          'GAAP net income',
          '$1,061.9M',
          '+225%',
          '55% margin — flattered by the tax line above',
        ],
      },
      {
        cells: [
          'GAAP EPS (diluted)',
          '$0.41',
          'vs $0.13',
          '⚠ ~$0.32 at Palantir’s own 23% long-term rate',
        ],
      },
      {
        cells: [
          'Adjusted EPS (diluted)',
          '$0.41',
          'vs $0.16',
          'Now *below* GAAP — the flip is the tell',
        ],
      },
      {
        cells: [
          'Stock-based compensation',
          '$265.2M',
          '+66%',
          '13.7% of revenue, improved from 15.9%',
        ],
      },
      {
        star: true,
        cells: [
          'Adjusted free cash flow',
          '$1,220.4M',
          '+115%',
          '63% margin — the strongest fact in the release',
        ],
      },
      {
        star: true,
        cells: [
          'Purchases of property & equipment',
          '$14.6M',
          '+91%',
          '0.75% of revenue — monetizes AI without funding it',
        ],
      },
      {
        cells: [
          'Closed TCV',
          '$3,373M',
          '+49%',
          '⚠ Bookings growing at half the rate of revenue',
        ],
      },
      {
        cells: [
          'US commercial TCV',
          '$2,132M',
          '+153%',
          'All of the TCV growth, and then some',
        ],
      },
      {
        cells: [
          'TCV outside US commercial (derived)',
          '$1,241M',
          '−13%',
          '⚠ $1,427M a year ago — against a record comp',
        ],
      },
      {
        cells: ['US commercial RDV', '$6,238M', '+124%', '+27% QoQ'],
      },
      {
        star: true,
        cells: [
          'Total remaining deal value',
          '$13.1B',
          '+83%',
          'Disclosed on the call, not in the release bullets',
        ],
      },
      {
        cells: [
          'Remaining performance obligations',
          '$4.9B',
          '10-Q Note 3',
          'The non-cancelable measure; 43% books within 12 months',
        ],
      },
      {
        cells: [
          'Customer count',
          '1,049',
          '+24%',
          'Also on the call — growth is spend-per-customer, not logos',
        ],
      },
      {
        cells: [
          'Days sales outstanding',
          '70.0 days',
          'from 78.6 (Q1)',
          'Compressed sharply — revenue is being collected',
        ],
      },
      {
        cells: [
          'Diluted shares outstanding',
          '2,568.7M',
          '+0.2%',
          'Dilution has essentially stopped — a dated bear point',
        ],
      },
      {
        cells: ['Cash + short-term Treasuries', '$9.2B', '+53%', 'No debt'],
      },
      {
        cells: [
          'FY2026 revenue guide',
          '$8,150–8,158M',
          '+82%',
          '▲ from +61% guided in February — ~$1B added',
        ],
      },
    ],
  },
  bull: [
    '**Revenue growth is accelerating, three quarters running** — +70% → +85% → +93% — at a scale where the law of large numbers is supposed to bite.',
    '**The operating leverage is GAAP, not adjusted:** operating margin went 27% → 47%, and the **GAAP** margin expanded *more* than the adjusted one (2,029bp vs 1,545bp) — the opposite of stock-comp suppression. Incremental operating margin on new revenue was **69%**.',
    '**Cash confirms the earnings:** DSO compressed from 78.6 to 70.0 days while revenue grew 18.5% sequentially, and contract liabilities were a $144M *source* of cash. Customers are paying earlier, not later — the strongest evidence against a pulled-forward-on-paper thesis.',
    '**63% free-cash-flow margin on $14.6M of capex.** Palantir is the asset-light tenant of everyone else’s $200B build — no depreciation wave, no debt, no negative-FCF window.',
    '**Guidance raised twice, hard:** FY26 revenue from +61% (February) to +71% (May) to **+82%** (August) — roughly $1B added in six months, after eight straight beats.',
    '**The dilution complaint is now stale:** diluted share count rose 0.2% YoY and stock comp fell from 15.9% to 13.7% of revenue.',
    '**The competition bear case got weaker, not stronger** — 149% US commercial growth is not the shape of a company losing share to hyperscaler AI layers.',
  ],
  bear: [
    '**~48× forward sales and ~114× normalized earnings** — the most expensive large-cap in US software, with no close second.',
    '**A 1.42% effective tax rate** does ~9¢ of the $0.41 headline EPS; Palantir’s own footnote says 23% is the long-term rate.',
    '**Closed TCV grew at half the rate of revenue** (+49% vs +93%) — the weakest of the backlog measures, and worth watching, though total RDV (+83%) largely offsets it.',
    '**TCV outside US commercial fell ~13% YoY**, against a record comp. US revenue is 81% of the total and growth is spend-per-customer, not new logos (customer count +24%).',
    '**Concentration is increasing, not broadening** — and the release gives no international commercial growth figure at all.',
    '**$91.8M of "other income"** sits inside that 55% net margin — and the 10-Q shows **$66M of it is unrealized gains on public equity stakes the company mostly cannot yet sell.**',
    '**Insider selling in size for two years**, including 397,744 Class A shares by the CEO in May 2026.',
  ],
  theQuestion: `Is 93% growth a *land grab with a long runway* — sovereign AI as a real new category Palantir defined and owns — or a *deepening* of a narrow base, where 1,049 customers spend more each year until they stop? The bookings data cuts both ways: total RDV grew 83%, but customer count grew only 24%, so nearly all of this is existing accounts expanding. Every other question is downstream. At ~114× normalized earnings the price doesn't just need the land-grab answer; it needs it to keep being true for about five more years.`,
  analysis: `## Valuation — this is the entire bear case, and it isn't a small one

At **$163.24** the market pays **~$391B** (on basic shares; ~$419B on diluted) for a company guiding to **$8.15B** of 2026 revenue. That is **~48× forward sales**. Large-cap software generally lives at 10–20×. For a same-day comparison against the most direct AI beneficiary in the market: Nvidia trades at **~20× trailing and ~12× forward sales**, against Palantir's ~64× trailing and ~48× on the FY26 guide.

The earnings multiple is where it gets concrete. Trailing P/E is 139.6× and forward is 86.5× — but both are computed on a tax rate the company itself says is not the long-run rate. Normalize FY26: the adjusted operating income guide of **$4.89B**, less roughly **$1.05B** of stock compensation and payroll tax, plus ~**$0.6B** of interest and other income, taxed at Palantir's own **23%**, lands near **$3.4B of normalized earnings — about 114× the basic market cap** (~122× diluted).

| Multiple (on $163.24) | Value | Context |
| --- | --- | --- |
| Price / sales (FY26 guide) | **~48×** | Rest of large-cap software: 10–20× |
| Trailing P/E | 139.6× | On a 1.4% tax rate |
| Forward P/E | 86.5× | Also on the low tax rate |
| **Normalized P/E (our estimate)** | **~114×** | GAAP operating basis, taxed at Palantir's own 23% |
| EV / EBITDA | 143.6× | — |
| Price / free cash flow | 116.6× | ~85× on the FY26 adj. FCF guide |
| Price / book | 30.9× | — |

**What has to happen.** At ~114×, reaching a 30× multiple — still a premium to almost anything — requires earnings to grow about **3.8×**. At a 40% earnings CAGR that is four years; at 30%, a bit over five. So today's price embeds roughly **half a decade of compounding at rates almost no company sustains, just to arrive at "expensive."**

One concession the bears should make: **the de-rating already partly happened.** Palantir entered this print ~41% below its 52-week high and down ~32% year to date — the business compounded at 85% through the first half of 2026 while the stock fell. Even after a ~30% two-day move it sits ~21% below the $207.52 high. The multiple compression bears were waiting for arrived in H1; this print bought some of it back.

## The growth — what is actually accelerating, and what isn't

Take the operating business on its own terms, because it has earned that. Revenue growth went **+70% (Q4 2025) → +85% (Q1 2026) → +93% (Q2 2026)**. Acceleration at a $1B+ quarterly scale is rare enough to be the story on its own. GAAP operating margin went **27% → 47%** in a year — and this is the point most bear write-ups skip, because it is not a non-GAAP artifact; it is the reported income statement. Adjusted free cash flow margin is 63%. Guidance has gone from +61% to +71% to +82% in six months.

The margin story deserves one more line, because it is the opposite of what the standard Palantir bear case assumes. Stock compensation grew **65.8%** — faster than total costs (+39.4%) — so it was a *drag* on margin, not its source. The decisive proof: the **GAAP** operating margin expanded 2,029bp while the **adjusted** margin expanded only 1,545bp. GAAP outran non-GAAP. Whatever else is going on in this print, the margin is not a stock-comp trick.

Cash agrees. Operating cash flow of $1,216M is 1.14× net income, and **days sales outstanding compressed from 78.6 to 70.0** even as revenue grew 18.5% sequentially — receivables grew 5.7% against 18.6% revenue growth. Contract liabilities were a **$144M source** of cash. Customers are paying earlier, not later, which is the single most direct evidence against a "revenue is being pulled forward on paper" reading.

Then the counterweight. **Closed TCV grew 49% while revenue grew 93%** — TCV-to-quarterly-revenue fell to 1.74× from 2.26×. And the composition is narrow: US commercial TCV was **$2.132B of the $3.373B** total; back it out and bookings everywhere else went **$1.427B → $1.241B, about −13% YoY**.

> **Caveat, applied honestly — and this is the claim our own verification pass cut down hardest.** Q2 2025 was a *record* TCV quarter at +140%, so the comp is punishing. The ratio actually **rose sequentially**, from 1.48× in Q1 2026. And TCV is the softest of three backlog measures: total **remaining deal value is $13.1B, +83%** — close to revenue's +93% — while **remaining performance obligations**, the non-cancelable measure, stand at **$4.9B**, with 43% expected to book as revenue inside twelve months. TCV is one yellow flag worth watching next quarter. It is not evidence the growth is hollow, and an earlier draft of this report leaned on it far too hard.

What the release *doesn't* put in its bullet list is worth naming, though it is a smaller point than it first appears. **Customer count** (1,049, +24%) and **total RDV** ($13.1B, +83%) were both given on the earnings call rather than in the highlights, and **RPO** appears only in Note 3 of the 10-Q. Nothing is hidden. But the +24% customer number tells you something the +149% US commercial revenue number does not: **this quarter's growth is overwhelmingly existing customers spending more, not new logos arriving.** That is a better business in the short run and a narrower one in the long run.

## The shape nobody else in AI has

Palantir spent **$14.6M** on property and equipment this quarter — **0.75% of revenue** — and generated $1.22B of adjusted free cash flow. Amazon's trailing capex is ~$169B; Microsoft's was $115.9B for the year with another $329B of uncommenced leases sitting off the statement.

That difference is not a detail, it is the investment case. Palantir sells into the AI buildout **without funding it**. There is no depreciation wave arriving in 2027, no debt raised to cover a capex hole, no negative-free-cash-flow window to explain away. The earnings-quality questions that dominated the Amazon and Microsoft prints simply have no place to live on this balance sheet.

Which is precisely why they moved into the price — and into the tax line.

## Risk — each isolated, do not blur

1. **Valuation / multiple risk (dominant).** ~114× normalized earnings, ~48× forward sales. A 30% de-rating requires nothing to go wrong operationally — that is not a hypothetical, it is what happened in H1 2026 while revenue accelerated.
2. **Earnings quality — the tax line.** A 1.42% effective rate against the company's own stated 23% long-term rate. When the shield exhausts, reported EPS growth decouples *downward* from operating growth, and the optics of that quarter will be ugly regardless of the business.
3. **Concentration.** US revenue is 81% of total; US commercial supplied all the bookings growth. Marketed as a global sovereign-AI wave, the segment data currently describes a US phenomenon.
4. **Bookings vs. revenue.** TCV growing at half of revenue growth. If revenue keeps outrunning bookings, growth converges downward to bookings — the only question is when.
5. **Non-operating income.** $91.8M of "other income," ~14× the year-ago figure, sitting inside the 55% net margin. The 10-Q settles what it is: realized and unrealized gains on equity securities plus FX — and specifically **$66M of net *unrealized* gains on publicly-traded stakes, "the majority of which are subject to short-term restrictions on the ability to sell."** Palantir's public-equity holdings went from $23M to $184M in six months. So a visible slice of the quarter's net income is a paper mark on shares the company could not sell today if it wanted to, and it reverses if those positions fall.
6. **Insider selling.** Karp sold 397,744 Class A shares on May 20, 2026 under a 10b5-1 plan, with sustained executive-suite selling for two years. Pre-scheduled 10b5-1 sales are not a signal by themselves — but the aggregate is large enough to name rather than omit.
7. **Competition (ranked low, deliberately).** Every hyperscaler sells an AI application layer. This print made that case *weaker*: 149% US commercial growth is not what share loss looks like.

## Time horizon & position sizing (kept separate)

**Horizon.** Not a next-quarter setup. The next two quarters are guided to decelerate — **+83%** for Q3, and the FY guide implies roughly **+72%** for Q4 — and Palantir has beaten its own guide eight quarters running, so the near term is mostly a game of by-how-much.

It is tempting to wave the deceleration away as a hard comp. That doesn't survive checking, and the check is clean because *sequential* growth is comp-independent. Through the back half of 2025 revenue compounded **+40.2%** from Q2 to Q4; the 2026 guide compounds only **+25.3%** across the same stretch. Hold Q2 2026's own delivered sequential rate (+18.5%) and Q4 lands near **$2.71B — a +93% year-over-year rate, identical to the quarter just posted.** So the entire 93% → 72% step-down lives in the guidance, not in the base. Either management is sandbagging by roughly $290M of quarterly revenue, or it sees something the print doesn't show. Given eight straight beats the first is more likely — but it is a *choice about guidance*, not arithmetic forced by the comparison. The thesis resolves over **3–5 years** on the question the valuation section poses: does ~$8B of revenue become ~$30B+ before the multiple normalizes? Under two years you are trading sentiment on the AI complex, not the business.

**Sizing considerations (not a recommendation).** Two things separate Palantir from the other names in this section. It is the only one that **doesn't carry capex-cycle risk** — no depreciation wave, no debt, no negative-FCF window — so it is genuine diversification against AMZN/MSFT/NVDA exposure rather than more of the same beta. Against that: at ~48× sales, returns are dominated by the multiple rather than by operations, and H1 2026 is the proof — the business accelerated and the stock fell 32%. A position sized for the business will behave like a position sized for the multiple.`,
  invalidation: {
    bull: [
      '**Total RDV** growth — not TCV — falls materially below revenue growth for two consecutive quarters. That is the measure that matters, and at +83% it currently does not.',
      'TCV outside US commercial declines a second and third quarter, turning a hard comp into a confirmed trend.',
      'Customer count stalls near ~1,050 while revenue decelerates — proving the model was land-and-expand into a fixed base, not a land grab.',
      'The valuation allowance releases and normalized EPS growth visibly lags the multiple.',
    ],
    bear: [
      'Q3 beats the $2.162B guide by the customary 4%+, confirming the 93% → 72% curve is a guidance choice rather than a demand ceiling.',
      'International commercial gets disclosed and turns — proving "sovereign AI" is a global category rather than a US one.',
      'Customer count re-accelerates alongside revenue, showing new logos rather than only deeper wallets.',
      'Adjusted FCF lands at the top of the $4.5–4.7B guide while revenue nearly doubles — funding the multiple from cash rather than hope.',
    ],
  },
  verification: {
    confirmed: 6,
    partlyTrue: 3,
    corrected: 4,
    confirmedNote:
      'Confirmed against Palantir’s own 8-K and the Q2 10-Q: revenue $1,935.5M / +93% and US commercial $764M / +149% · GAAP income from operations $912.0M at a 47% margin, up from 27%, with 69% incremental margin · adjusted free cash flow $1,220.4M at a 63% margin on $14.6M of capex · DSO compressed 78.6 → 70.0 days · the 1.42% effective tax rate and the full valuation allowance in Note 10 · the FY26 guide raised to $8.150–8.158B (+82%) from +61% in February.',
    items: [
      {
        kind: 'corrected',
        title:
          'The "55% net margin" is an operating result — a fifth of it is the tax line',
        text: 'Palantir booked **$15.4M of tax on $1,081.3M of pre-tax income — a 1.42% effective rate** — while its own adjusted-EPS footnote states a 23.0% long-term rate. At 23%, net income is ~$833M and diluted EPS ~$0.32, not $0.41. The release itself shows the flip: adjusted EPS is now *below* GAAP EPS ($0.41 vs $0.41, versus $0.16 vs $0.13 a year ago).',
      },
      {
        kind: 'corrected',
        title: 'The "massive dilution" bear point is dated',
        text: 'The most-repeated criticism of Palantir no longer matches the filing. **Diluted share count rose 0.23% YoY** (2,562.9M → 2,568.7M) and stock compensation *fell* from 15.9% to **13.7% of revenue**. It was a fair complaint in 2023–24; on this print it is not.',
      },
      {
        kind: 'partly',
        title: '"Rule of 40 score of 155%"',
        text: 'True to Palantir’s own definition, which sums revenue growth and the **adjusted** operating margin (62%). On the GAAP margin (47%) it is 140%. Best in enterprise software either way — but it is a company-defined, non-GAAP-flavored metric, quoted as though it were an audited one.',
      },
      {
        kind: 'corrected',
        title:
          'Our own first draft: "bookings grew at half the rate of revenue" was overstated',
        text: 'The skeptic pass cut down this report’s own load-bearing bear claim, so it is recorded here rather than quietly edited. The arithmetic survived — closed TCV +49% vs revenue +93%, TCV-to-revenue 1.74× from 2.26×, definition unchanged, and TCV outside US commercial down ~13%. But three counters were missing: the year-ago quarter was a **record +140%** TCV spike, the ratio **rose sequentially** from 1.48× in Q1 2026, and TCV is the softest of three backlog measures — **total RDV is $13.1B (+83%)** and **RPO is $4.9B**. "The only headline metric growing slower than revenue" was also simply false: US government revenue (+90%), customer count (+24%) and international all grew slower too.',
      },
      {
        kind: 'corrected',
        title:
          'Our own first draft: the "missing" disclosures were not missing',
        text: 'An earlier version of this report asked where customer count and total RDV had gone, and said the 10-Q was not yet filed. All three were wrong. **Customer count (1,049, +24%)** and **total RDV ($13.1B, +83%)** were both given on the earnings call; **RPO ($4.9B)** is in Note 3 of the **Q2 10-Q, which was filed 2026-08-04** — the same day this report first published. They are absent from the press-release bullet list, which is a far weaker observation than "undisclosed," and the report now says so.',
      },
      {
        kind: 'partly',
        title: '"Demand for AI sovereignty has now been unleashed"',
        text: 'The segment data supports a **US** story specifically: US revenue +115% and 81% of the total. The release gives **no international commercial growth figure at all** — historically Palantir’s weakest segment. The demand is evidently real; its geography is being described more broadly than the disclosure supports.',
      },
      {
        kind: 'partly',
        title: 'The $91.8M of "other income, net" inside the 55% net margin',
        text: 'Resolved once the Q2 10-Q landed. It is realized and unrealized gains on equity securities plus FX — including **$66M of net *unrealized* gains on publicly-traded stakes, "the majority of which are subject to short-term restrictions on the ability to sell."** Public-equity holdings went $23M → $184M in six months. So the non-cash read was right; what it understated is that these are marks on shares Palantir could not currently sell.',
      },
      {
        kind: 'partly',
        title: 'The margin expansion as evidence of "operating leverage"',
        text: 'True, and the verification pass strengthened it rather than weakening it. Opex/revenue fell 53.9% → 37.5% (−1,640bp of the ~2,029bp expansion) against only ~388bp from gross margin, and incremental operating margin on new revenue was **69%**. Stock comp grew 65.8% — *faster* than total costs — so the **GAAP** margin expanded 2,029bp while the **adjusted** margin expanded only 1,545bp. The stock-comp-suppression charge is refuted outright.',
      },
    ],
  },
  openQuestions: [
    'Why is guidance implying a 93% → 72% deceleration that the sequential math doesn’t require? Hold Q2’s own +18.5% sequential pace and Q4 prints ~$2.71B (+93%). The step-down is a guidance *choice*, not comp arithmetic — is it the usual sandbag, or visibility we can’t see?',
    'What is international commercial actually doing? "Sovereign AI" is described as a global wave, but the release quantifies only the US (+115%, 81% of revenue) and gives no international commercial growth figure at all.',
    'Does the tax shield have a date on it? Note 10 says there is "a reasonable possibility" of releasing the valuation allowance. Whenever that lands, reported EPS growth decouples downward from operating growth — and nobody has guided to when.',
  ],
  soWhat: `If you want to know where enterprise AI money is actually going, this print is the cleanest signal yet — and it is not going to the model labs.

Palantir sells the layer between a company's private data and somebody else's model. Its customers are signing nine-figure contracts not to *get* intelligence — they can rent that from four vendors at commodity prices — but to use it without handing over the thing that makes them good at their job. Karp's phrasing on the call was that customers "have declined to become vassal states of the language labs."

The practical read for anyone building with AI: **the model is becoming the commodity and the context is becoming the product.** Palantir grew 93% selling plumbing, governance, and deployment around models it does not own. That is the same bet you make every time you invest in a \`CLAUDE.md\` instead of a better prompt — value accrues to whoever owns the context, not whoever owns the weights.

And the money shows the shape of it. Amazon spent roughly **$169 billion** of capex to be in this cycle. Palantir spent **$14.6 million**.`,
  throughLine: {
    text: `Three reports now, three readings of the same AI-capex cycle — and Palantir is the mirror image of the other two.

Amazon and Microsoft both had an obligation problem. The cash was real, but the thing funding the future sat where the headline number didn't show it: free cash flow turned negative at Amazon; $329B of signed-but-uncommenced leases sat off Microsoft's capex line entirely. Both reports came down to the same question — *where did the capex go, and when does it bill?*

Palantir has no capex to hide anything in. $14.6M of property and equipment against $1.22B of free cash flow. It is the tenant, not the landlord — it monetizes the buildout without funding it.

So the earnings-quality question doesn't disappear, it **relocates**. For AMZN and MSFT it lives on the balance sheet. For PLTR there is barely a balance sheet to interrogate — so it lives entirely in the price, and in a 1.4% tax rate.`,
    links: [
      { label: 'AMZN — the first negative-cash quarter', slug: 'amzn-q2-2026' },
      {
        label: 'MSFT — the capex that moved off the line',
        slug: 'msft-q4-fy2026',
      },
    ],
  },
  sources: [
    {
      n: 1,
      label: 'Palantir Q2 2026 press release (SEC 8-K, Exhibit 99.1)',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000039/a2026q2ex991pressrelease.htm',
      primary: true,
      secondaryUrl:
        'https://www.sec.gov/Archives/edgar/data/0001321655/000132165526000039/pltr-20260803.htm',
      secondaryLabel: '8-K',
    },
    {
      n: 2,
      label:
        'Palantir Q2 2026 Form 10-Q (filed 2026-08-04) — RPO, Note 10 tax, equity-securities marks',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000041/pltr-20260630.htm',
      primary: true,
    },
    {
      n: 3,
      label:
        'Palantir Q2 2025 press release — the year-ago TCV and customer-count comp',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165525000105/a2025q2ex991pressrelease.htm',
      primary: true,
    },
    {
      n: 4,
      label:
        'Palantir Q2 2026 earnings call transcript — total RDV $13.1B, customer count 1,049',
      url: 'https://seekingalpha.com/article/4929675-palantir-technologies-inc-pltr-q2-2026-earnings-call-transcript',
    },
    {
      n: 5,
      label:
        'Palantir Q1 2026 press release — the sequential and guidance trail',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000026/a2026q1ex991pressrelease.htm',
      primary: true,
    },
    {
      n: 6,
      label: 'Palantir Q4 2025 results — FY25 base and the original FY26 guide',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000004/a2025q4ex991earningsrelease.htm',
      primary: true,
    },
    {
      n: 7,
      label:
        'CNBC — Palantir stock rises 30% on commercial revenue, AI sovereignty (2026-08-04)',
      url: 'https://www.cnbc.com/2026/08/04/palantir-2q-earnings-ai-sovereign-tools.html',
    },
    {
      n: 8,
      label: 'CNBC — Palantir Q2 2026 earnings (2026-08-03)',
      url: 'https://www.cnbc.com/2026/08/03/palantir-pltr-earnings-q2-2026.html',
    },
    {
      n: 9,
      label:
        'stockanalysis.com — PLTR statistics (price, market cap, multiples)',
      url: 'https://stockanalysis.com/stocks/pltr/statistics/',
    },
    {
      n: 10,
      label: 'GuruFocus — Q2 2026 earnings call highlights',
      url: 'https://www.gurufocus.com/news/9000347/palantir-technologies-inc-pltr-q2-2026-earnings-call-highlights-record-93-revenue-growth-and-raised-guidance-signal-unprecedented-ai-demand',
    },
    {
      n: 11,
      label: 'Seeking Alpha — Q2 2026 earnings call presentation',
      url: 'https://seekingalpha.com/article/4929655-palantir-technologies-inc-2026-q2-results-earnings-call-presentation',
    },
    {
      n: 12,
      label:
        'TradingKey — earnings preview: 8 straight beats, 40% off its high',
      url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262068882-palantir-pltr-earnings-preview-august-3-2026-options-swing-triangle-tradingkey',
    },
    {
      n: 13,
      label: 'TradingKey — surges 15% after Q2 results, guidance raised',
      url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262072328-palantir-q2-earnings-sweep-expectations-stock-surges-15-tradingkey',
    },
    {
      n: 14,
      label:
        '24/7 Wall St. — after the blowout, where the stock could head next',
      url: 'https://247wallst.com/investing/2026/08/04/after-palantirs-blowout-earnings-heres-where-the-stock-could-head-next/',
    },
    {
      n: 15,
      label: 'TIKR — down 34% from its 52-week high, the path to $212 by 2028',
      url: 'https://www.tikr.com/blog/palantir-stock-is-down-34-from-its-52-week-high-heres-the-path-to-212-by-2028',
    },
    {
      n: 16,
      label:
        'StockTitan — Karp Form 4: 397,744 Class A shares sold (2026-05-20)',
      url: 'https://www.stocktitan.net/sec-filings/PLTR/form-4-palantir-technologies-inc-insider-trading-activity-48a8d6e385ad.html',
    },
    {
      n: 17,
      label: 'TipRanks — Karp continues to sell company stock',
      url: 'https://www.tipranks.com/news/palantir-pltr-ceo-alex-karp-continues-to-sell-company-stock',
    },
    {
      n: 18,
      label:
        'MarketBeat — Palantir Q2 2026 earnings report (consensus vs actual)',
      url: 'https://www.marketbeat.com/earnings/reports/2026-8-3-palantir-technologies-inc-stock/',
    },
    {
      n: 19,
      label: 'Yahoo Finance — what to expect from Palantir’s Q2 2026 report',
      url: 'https://finance.yahoo.com/markets/stocks/articles/expect-palantir-q2-2026-earnings-124258336.html',
    },
    {
      n: 20,
      label:
        'AOL / Fortune — Karp on frontier labs wanting to "colonize your enterprise"',
      url: 'https://www.aol.com/articles/palantir-ceo-alex-karp-says-002758000.html',
    },
    {
      n: 21,
      label:
        'FinancialContent — sustained insider selling [low-confidence secondary]',
      url: 'https://markets.financialcontent.com/stocks/article/marketminute-2026-3-10-palantir-shares-dip-as-sustained-insider-selling-shadows-dominant-ai-footprint',
    },
    {
      n: 22,
      label:
        'Palantir Investor Relations — CEO letters and investor presentations',
      url: 'https://investors.palantir.com',
    },
    {
      n: 23,
      label:
        'stockanalysis.com — NVDA statistics (the same-day sales-multiple comparison)',
      url: 'https://stockanalysis.com/stocks/nvda/statistics/',
    },
  ],
};

const spcxQ2_2026: MarketStormReport = {
  slug: 'spcx-q2-2026',
  ticker: 'SPCX',
  company: 'Space Exploration Technologies Corp.',
  title:
    'SpaceX spent $2.35 of capex for every dollar of revenue — and its own share price just pushed a bigger unlock into December',
  excerpt:
    'The first quarterly report from the largest IPO in history: revenue up 92% to $7.8B, the operating loss cut from $970M to $143M, and capex of $18.4B — 2.35× revenue, against a $13.2B consensus. Nearly all of it is AI. One customer that did not exist last quarter is now a fifth of company revenue, $13.3B of the debt funding the build comes from a sitting director’s firm, and the stock was too weak to trigger an early share release — which moves a larger block to December instead. STORM put four AI agents on the print, then had skeptics try to refute every load-bearing claim against the 10-Q.',
  catalyst:
    'Q2 2026 — first earnings as a public company, reported August 4, 2026',
  publishDate: '2026-08-05',
  tags: ['SPCX', 'Starlink', 'AI-infrastructure', 'earnings', 'capex'],
  verdict:
    'Amazon’s capex quietly exceeded its operating cash flow. Microsoft’s moved off the reported line. Palantir had none at all. SpaceX spent 2.35× its revenue in a single quarter — and the question that decides the stock is whether the customer paying for it stays.',
  priceStrip: [
    { k: 'IPO · Jun 12', v: '$135.00' },
    { k: 'High · Jun 16', v: '$225.64' },
    { k: 'Close · Aug 4', v: '$125.33', tone: 'bull' },
    { k: 'After hours', v: '$115.98', tone: 'bear' },
    { k: 'Market cap', v: '~$1.65T' },
    { k: 'P/S · Q2 ann.', v: '~53×', tone: 'bear' },
  ],
  summary: `Revenue grew **92%** to **$7.814B** and all three segments accelerated. The operating loss narrowed from $(970)M to **$(143)M**. Those are good numbers, and the stock rose 9.4% into the print. Then capex landed: **$18.369B in one quarter — 2.35× revenue**, against a ~$13.2B consensus, of which **$15.828B was AI** against $2.561B of AI revenue. Shares fell 7.5% after hours. Underneath, three things the headline doesn't carry: **Adjusted EBITDA of $3.538B is 90% depreciation and stock comp**, and the 10-Q publishes no useful-life table for the assets generating that depreciation; a **single customer went from under 10% of revenue to 19.5%** in one quarter and is ~60% of the AI segment; and **$13.329B of the debt funding the build is a failed sale-leaseback with a firm run by a sitting director**. H1 free cash flow was **−$25.0B** against ~$105B of liquidity.`,
  headlineVsReal: [
    {
      headline:
        '"Adjusted EBITDA of $3.5 billion, up 191% from $1.2 billion" — the number leading the release and most of the coverage.',
      real: 'Loss from operations of **$(143)M** and a net loss of **$(541)M**. The gap is $4.079B, and **90% of it is depreciation ($2,848M) plus stock compensation ($831M)**.',
      gap: 'Depreciation is **36.4% of revenue** this quarter. Whether that is a "real" cost is not philosophical here: PP&E went $42.6B → $65.7B in six months against $28.5B of capex and $5.3B of depreciation, which reconciles to within $52M — essentially all the capex is capitalising into an asset base that must depreciate. And the disclosure that would let you check the assumption **is not in the filing**: the 10-Q names useful lives as a critical estimate but publishes **no useful-life table for property, plant and equipment** at all. For a company where depreciation *is* the headline metric, that is the number that matters most and it isn’t there.',
    },
    {
      headline:
        '"On pace to reach **$100 billion in annualized recurring revenue** by the end of the year" — the CFO, on the earnings call.',
      real: 'Q2 revenue of $7.814B annualises to about **$31B**. The claim implies more than tripling the run rate in roughly five months.',
      gap: 'It is not a GAAP figure, it carries no reconciliation, and it rests on cloud deals that have not started: the Google agreement is described as ramping from **October**, and another **$6.7B** was contracted in the first weeks of July. It may well prove right — the contracts appear to be real. But "annualized recurring revenue" here is a company-defined forward measure of capacity yet to be delivered, quoted alongside audited figures, and the two should not be read at the same weight.',
    },
    {
      headline:
        '"Closed multiple industry-leading Cloud Services Agreements resulting in **$14.1 billion of contracted sales**" — the second bullet of the release.',
      real: 'One customer is **19.5% of total company revenue** — about $1.52B — up from under 10% a quarter ago, and roughly **60% of the entire AI segment**.',
      gap: 'The 10-Q’s own risk factors say AI infrastructure revenue "is concentrated in a small number of customers" and that the cloud agreements "may be terminated by either party upon **90 days’ notice**" after an initial ramp. Against that, the IPO prospectus describes the Anthropic arrangement as roughly **325,000 GPUs at ~$1.25B/month through May 2029** — a long term, not a rolling quarter. Both statements are in SpaceX’s own filings and they are genuinely hard to hold at once. What is not in doubt: **$15.8B of quarterly capex is being deployed against revenue whose concentration the company itself flags as a risk.**',
    },
  ],
  kpis: [
    {
      label: 'Revenue',
      value: '$7.81B',
      delta: '+92% YoY',
      note: 'Beat the ~$6.72B consensus; all three segments accelerated.',
      tone: 'bull',
    },
    {
      label: 'Total capex',
      value: '$18.37B',
      delta: '2.35× revenue',
      note: 'Against a ~$13.2B consensus. This is why the stock fell.',
      tone: 'bear',
    },
    {
      label: 'AI capex vs AI revenue',
      value: '6.2×',
      delta: '$15.83B vs $2.56B',
      note: 'AI capex was $749M a year ago — a 21× increase.',
      tone: 'bear',
    },
    {
      label: 'Loss from operations',
      value: '$(143)M',
      delta: '▲ from $(970)M',
      note: 'Genuine improvement — the operating loss nearly closed.',
      tone: 'bull',
    },
    {
      label: 'Adjusted EBITDA',
      value: '$3.54B',
      delta: '⚠ 90% add-backs',
      note: 'D&A ($2,848M) + stock comp ($831M) of a $4,079M bridge.',
      tone: 'warn',
    },
    {
      label: 'Starlink subscribers',
      value: '12.0M',
      delta: 'doubled YoY',
      note: 'But ARPU fell $85 → $66; revenue per sub down ~28%.',
      tone: 'warn',
    },
    {
      label: 'Customer B',
      value: '19.5%',
      delta: 'of total revenue',
      note: 'Under 10% last quarter. ~60% of the AI segment.',
      tone: 'warn',
    },
    {
      label: 'H1 free cash flow',
      value: '−$25.0B',
      delta: '~18mo runway',
      note: 'OCF $3.5B vs capex $28.5B, against ~$105B liquidity.',
      tone: 'bear',
    },
  ],
  printTableTitle: 'Q2 2026 — the first public quarter, by segment',
  printTable: {
    columns: [
      { label: 'Metric' },
      { label: 'Q2 2026', align: 'right' },
      { label: 'vs Q2 2025', align: 'right' },
      { label: 'Note' },
    ],
    rows: [
      {
        cells: [
          'Revenue',
          '$7,814M',
          '+92%',
          'Beat ~$6.72B consensus; Q1 2026 was $4,694M',
        ],
      },
      {
        cells: [
          'Loss from operations',
          '$(143)M',
          'from $(970)M',
          'Nearly closed — the real improvement in the print',
        ],
      },
      {
        cells: [
          'Net loss / EPS',
          '$(541)M / $(0.09)',
          'from $(1,008)M',
          'On 5,864M weighted shares (part-quarter post-IPO)',
        ],
      },
      {
        star: true,
        cells: [
          'Adjusted EBITDA',
          '$3,538M',
          '+191%',
          '⚠ 90% of the bridge is D&A $2,848M + SBC $831M',
        ],
      },
      {
        cells: [
          '— Space revenue',
          '$962M',
          '+29%',
          'Launches FELL 46 → 38; mass to orbit 652t → 485t',
        ],
      },
      {
        cells: [
          '— Space operating loss',
          '$(542)M',
          'from $(369)M',
          'Entirely a +$383M rise in Starship R&D',
        ],
      },
      {
        star: true,
        cells: [
          '— Connectivity revenue',
          '$4,291M',
          '+66%',
          'The only segment profitable at the operating line',
        ],
      },
      {
        cells: [
          '— Connectivity operating income',
          '$1,656M',
          '+79%',
          'Carries the entire company',
        ],
      },
      {
        cells: [
          '— Starlink subscribers / ARPU',
          '12.0M / $66',
          'from 6.0M / $85',
          '⚠ Subs doubled, ARPU −22%, revenue per sub −28%',
        ],
      },
      {
        cells: [
          '— Enterprise & government',
          '$1,806M',
          '+108%',
          'Now 42% of Connectivity, from 33.5%',
        ],
      },
      {
        cells: [
          '— AI revenue',
          '$2,561M',
          '+247%',
          '+213% sequentially; $1.6B of it new cloud services',
        ],
      },
      {
        cells: [
          '— AI operating loss',
          '$(1,257)M',
          'from $(1,524)M',
          'Gross margin 25.2% → 56.8% — a real improvement',
        ],
      },
      {
        star: true,
        cells: [
          'Total capex',
          '$18,369M',
          'from $2,825M',
          '⚠ 2.35× revenue; consensus was ~$13.2B',
        ],
      },
      {
        star: true,
        cells: [
          '— AI capex',
          '$15,828M',
          'from $749M',
          '⚠ 6.2× AI revenue; a 21× year-over-year increase',
        ],
      },
      {
        cells: [
          'Nameplate compute',
          '1.4 GW',
          'from 0.4 GW',
          'Colossus II build-out; 1.0 GW at Q1',
        ],
      },
      {
        cells: [
          'H1 operating cash flow',
          '$3,466M',
          'from $351M',
          'Against $28,476M of H1 capex',
        ],
      },
      {
        star: true,
        cells: [
          'H1 free cash flow',
          '−$25,010M',
          '—',
          '⚠ ~18 months of runway at the Q2 exit rate',
        ],
      },
      {
        cells: [
          'Cash + marketable securities',
          '$100.0B',
          'from $24.7B',
          '~$105B with the $5B undrawn revolver',
        ],
      },
      {
        star: true,
        cells: [
          'Related-party debt',
          '$13,329M',
          'from $4,507M',
          '⚠ 33.9% of debt; a sitting director’s firm',
        ],
      },
      {
        cells: [
          'Related-party interest expense',
          '$327M',
          'from $0',
          '⚠ 52% of the quarter’s $629M interest expense',
        ],
      },
      {
        cells: [
          'Customer A / Customer B',
          '18.3% / 19.5%',
          '16.7% / <10%',
          '⚠ 37.8% of revenue in two customers',
        ],
      },
      {
        cells: [
          'Backlog',
          '$47,461M',
          '—',
          '56% books within a year; $14,286M already deferred revenue',
        ],
      },
      {
        cells: [
          'Non-cancelable obligations',
          '$27,955M',
          '—',
          '⚠ $22,244M of it falls in 2027 alone',
        ],
      },
    ],
  },
  bull: [
    '**Revenue +92% with all three segments accelerating**, and the operating loss nearly closed — $(970)M → $(143)M in a year.',
    '**Connectivity is a genuine profit engine:** $1,656M of operating income, +79%, on 12.0M Starlink subscribers (doubled) and Enterprise & Government revenue +108%.',
    '**The AI segment really did improve, not just get re-added-back.** Of the $1,755M sequential swing in AI Adjusted EBITDA, **69% came from the GAAP operating loss narrowing**, and AI gross margin went 25.2% → 56.8% year over year.',
    '**The Space decline is reallocation, not lost customers** — customer launches actually *rose* 9 → 10 with flat customer payload mass; the entire drop is internal Starlink deployment during the V2→V3 changeover.',
    '**~$105B of liquidity** and investment-grade access: $85.7B of IPO proceeds plus a $25B bond at a 5.855% weighted average.',
    '**The demand is contracted, not hoped for:** $14.1B of cloud agreements signed in the quarter, $6.7B more in July, and a $47.5B backlog of which 56% books inside a year.',
  ],
  bear: [
    '**Capex was 2.35× revenue** — $18.37B against $7.81B — and beat consensus by $5B. AI capex alone was 6.2× AI revenue.',
    '**H1 free cash flow was −$25.0B.** At the Q2 exit rate the ~$105B of liquidity is roughly **18 months**, and capex nearly doubled sequentially.',
    '**One customer is 19.5% of company revenue** and ~60% of the AI segment, from effectively nothing in Q1 — against risk-factor language about 90-day termination.',
    '**$13.3B of the debt is a failed sale-leaseback with a sitting director’s firm**, carrying 52% of the interest expense.',
    '**Starlink ARPU fell 22%** ($85 → $66) and revenue per subscriber ~28%, while subscriber count doubled.',
    '**$27,955M of non-cancelable obligations**, with **$22,244M concentrated in 2027** — the year the capex bill comes due.',
    '**Colossus II’s power is under legal challenge:** the NAACP is seeking to enjoin the mobile gas turbines running it under the Clean Air Act.',
  ],
  theQuestion: `Every AI-infrastructure report in this section has come down to a version of the same question, and here it is in its most extreme form: **is $18.4B of quarterly capex a land grab into demand that already exists in contract form — or is it a purpose-built campus for one customer?** Customer B went from under 10% of revenue to 19.5% in a single quarter and is ~60% of the AI segment. The prospectus suggests a term through 2029; the risk factors say 90 days' notice. Which of those two sentences turns out to govern is, more or less, the entire investment.`,
  analysis: `## Valuation — an unusual problem, because there are no earnings to divide by

At the **$115.98** after-hours print the market values SpaceX near **$1.65T** on ~13.17B shares. There is no P/E: the company lost $541M in the quarter and $9.36B over the trailing twelve months. So the multiples are all revenue-based, and they are extreme by any standard.

| Multiple | Value | Context |
| --- | --- | --- |
| Price / sales (trailing) | **85.6×** | TTM revenue ~$19.3B |
| **Price / sales (Q2 annualised)** | **~53×** | On $31.3B of run-rate revenue |
| Price / sales (forward) | 32.4× | Implies ~$51B of forward revenue |
| EV / EBITDA | 313.5× | On the *adjusted* measure |
| Price / book | 19.2× | Book value inflated by $85.7B of IPO proceeds |
| P/E | n/a | Trailing net loss of $9.36B |

The forward multiple is the interesting one. At 32.4× the market is already underwriting roughly **$51B of forward revenue** — a 63% increase on the current run rate. That is not a sceptical price. It is a price that assumes the cloud contracts ramp on schedule and the Starlink subscriber curve holds.

Context matters on the drawdown, though, and it cuts both ways. The stock is **48.6% below its $225.64 June high** and **14.1% below the $135 IPO price** — so a great deal of enthusiasm has already come out. It also *rose 9.4%* on the day of the print and gave back 7.5% after hours, which tells you the market liked the revenue and disliked the capex, in that order.

## The capex — where this sits on the spectrum

This section has now looked at four companies in the same AI-infrastructure cycle, and they form a clean spectrum of how much of the future is being paid for today:

| Company | Capex vs revenue | Where the strain shows |
| --- | --- | --- |
| Palantir | **0.75% of revenue** | Nowhere — it shows in the price instead |
| Microsoft | ~32% of quarterly revenue | $329B of leases *off* the capex line |
| Amazon | ~105% of operating cash flow | Free cash flow turned negative |
| **SpaceX** | **235% of revenue** | Everywhere at once |

SpaceX is not a more aggressive version of the hyperscalers. It is a different kind of company doing the same thing with a twentieth of the revenue base. **AI capex went from $749M to $15,828M in a year — a 21× increase** — while AI revenue went from $737M to $2,561M. The build is running roughly six years ahead of the revenue it serves.

Some of that asset isn't even depreciating yet. Construction-in-progress went **$4.6B → $12.6B**, and the 10-Q says it is "primarily comprised of ongoing construction and expansion of the facilities and equipment as well as AI infrastructure that has not yet been placed in service." So forward depreciation rises sharply as that lands — which is precisely the line that Adjusted EBITDA adds back.

## The customer

Note 3 of the 10-Q discloses two customers above 10% of consolidated revenue. **Customer A at 18.3%** spans all three segments and is long-standing — it was 20.9%, 24.2% and 25.2% of revenue in 2025, 2024 and 2023, so it predates the cloud business entirely. **Customer B at 19.5%** is new: it did not clear 10% in any prior period, it relates only to the AI segment, and at ~$1.52B it is roughly **95% of the $1.6B of incremental cloud revenue** the release attributes to the new agreements.

Put plainly: **essentially all of the AI segment's revenue growth this quarter came from one counterparty that was not material three months ago.**

The company doesn't name it in the 10-Q, but it isn't a secret either — the IPO prospectus describes an Anthropic arrangement of roughly 325,000 GPUs at about $1.25B/month running to May 2029, and the CFO named Google and Anthropic on the call, with the Google agreement ramping from October. Note 17 lists only Tesla and Valor as related parties, so **the cloud customers are arm's-length** — a reading worth ruling out explicitly, and it is ruled out.

> **The tension the filings don't resolve.** The risk factors say cloud agreements "may be terminated by either party upon 90 days' notice." The prospectus describes a term running to 2029. Both are SpaceX's own words. The honest position is that the *contracted* term is long and the *cancellation* right is short, and only one of those gets tested if the AI capex cycle turns.

## The financing — a director's firm holds a third of the debt

This is the disclosure most worth reading slowly. Of $39,364M of total debt, **$13,329M — 33.9% — is owed to Valor Equity Partners**, whose founder, CEO and Chief Investment Officer **Antonio Gracias serves on SpaceX's board**. It comes from three equipment lease agreements for AI infrastructure hardware (November 2025, January 2026, April 2026, the last through CTC Property LLC), all of which **failed sale-leaseback accounting** — meaning the assets stay on SpaceX's balance sheet and the proceeds book as debt. SpaceX guarantees the lessees' payments. The balance nearly **tripled in six months**, from $4,507M, and it carries **$327M of the quarter's $629M interest expense — 52%**.

None of that is hidden; it is all in Notes 9 and 17. And the terms are not obviously off-market: the 10-Q's Other Financings paragraph states these arrangements carry an **average fixed interest rate of 5.9%**, against 5.855% weighted average on the public investment-grade notes.

There is, however, a gap the filing does not reconcile. **$327M of quarterly interest against an average related-party balance of roughly $8.9B annualises to the mid-teens**, not 5.9%. Failed sale-leaseback accounting can produce interest expense that exceeds a stated coupon, so there are innocent explanations — but the filing gives balances and interest and a rate that don't sit together, and does not explain why. It is the single thing I would most want asked on the next call.

## Risk — each isolated, do not blur

1. **The capex/funding gap (dominant).** −$25.0B of H1 free cash flow, capex nearly doubling sequentially, ~$105B of liquidity — roughly 18 months at the Q2 exit rate before the company needs the capital markets again. It has investment-grade access today. That is a condition, not a guarantee.
2. **Customer concentration.** 37.8% of revenue in two customers; ~60% of the AI segment in one that appeared this quarter.
3. **The depreciation assumption.** 90% of Adjusted EBITDA is D&A and stock comp, $12.6B of asset is not yet in service, and **the 10-Q publishes no useful-life table**. If GPU lives are shorter than assumed, the adjustment does the damage on the way back.
4. **Starlink unit economics.** ARPU −22% and revenue per subscriber −28% while subscribers doubled. Management attributes it to international mix and cheaper plans; the filing gives no like-for-like or US-only ARPU, so a price cut in mature markets cannot be ruled out.
5. **The 2027 obligation wall.** $22,244M of the $27,955M of non-cancelable commitments falls in 2027.
6. **Governance.** A third of the debt and half the interest expense run to a board member's firm, with an unreconciled implied rate.
7. **Operational and legal.** The NAACP is seeking a preliminary injunction against the gas turbines powering Colossus II under the Clean Air Act; separately, multiple class actions over Grok's image generation, with a $354M litigation accrual.

## The lockup — the stock's weakness made the overhang bigger, not smaller

The mechanics here are genuinely non-obvious and worth getting right, because they are two days away.

On **August 6**, up to **911.5M shares** (excluding affiliates) come free — about **1.43× the entire 638.9M-share IPO float**, roughly $106B at the after-hours price. That much was widely reported and is correct.

What was less noticed: a *second* tranche of **455.8M "Additional Release Shares"** was also scheduled for that date — but only if the stock closed at least 30% above the $135 IPO price (**$175.50**) on five of the ten trading days ending on the earnings date. Over that window (July 22 – August 4) the closes ran $108.37 to $118.24. **The highest close was 32.6% below the trigger. Zero of ten days qualified.**

So those shares do not release now. Under the prospectus's alternative branch they roll to **December 8, 2026 — where up to 797.6M shares come free instead of 328.4M.** The weak share price didn't avoid the dilution. It deferred it, and made the December block **469M shares larger**.

Two caveats: every figure is an "up to," assuming no option exercises or RSU settlements after March 31; and the lockup, price condition included, is waivable with Goldman Sachs' written consent.

## Time horizon & position sizing (kept separate)

**Horizon.** The next 90 days are dominated by mechanics rather than fundamentals — the August 6 unlock, the October ramp of the Google agreement, the Cursor close in Q3, and a Q3 print that will show whether Customer B's revenue is a step or a spike. The actual thesis resolves on a **3–5 year** horizon: does 1.4 GW of compute and a doubling Starlink constellation generate returns above a depreciation base that is compounding faster than revenue?

**Sizing considerations (not a recommendation).** SpaceX is the highest-beta expression of the same AI-capex cycle that drives Amazon, Microsoft and Nvidia — it does not diversify an AI-infrastructure basket, it concentrates it, and it adds two risks the others do not carry: a single-customer AI revenue base and a funding requirement that returns in roughly 18 months. Against that, Connectivity is a real, growing, profitable business that would be worth something substantial on its own, and the Space franchise has no competitor at its cadence. A position here is not one bet; it is three businesses with one balance sheet, two of which lose money at the operating line.`,
  invalidation: {
    bull: [
      'Customer B’s revenue does not repeat in Q3 — proving the AI step-up was a spike, not a run rate.',
      'The Google agreement slips past its October ramp, or the $6.7B of July contracts do not convert on schedule.',
      'Capex stays near $18B/quarter without the revenue inflecting — pulling the funding requirement forward from ~18 months.',
      'Forward depreciation on the $12.6B of construction-in-progress compresses the AI segment back below breakeven on an adjusted basis.',
      'Starlink ARPU keeps falling at 20%+ while subscriber growth decelerates — the consumer business stops compounding.',
    ],
    bear: [
      'Q3 shows Customer B repeating *and* Google ramping — concentration falls because the denominator grows, not because anyone leaves.',
      'The August 6 unlock clears without a sustained break, removing the mechanical overhang that has driven the stock since June.',
      'Free cash flow inflects as the CIP balance converts to revenue-generating capacity and capex normalises off the Q2 spike.',
      'Starship V3 reaches rapid reuse, validating the cost-to-orbit claim that underwrites the whole Starlink deployment economics.',
    ],
  },
  verification: {
    confirmed: 6,
    partlyTrue: 4,
    corrected: 3,
    confirmedNote:
      'Confirmed against the Q2 2026 8-K and 10-Q: revenue $7,814M / +92% and the segment tables · capex $18,369M with $15,828M in AI · the Adjusted EBITDA bridge (D&A $2,848M + SBC $831M = 90% of $4,079M) · Note 3 concentration (Customer A 18.3%, Customer B 19.5%) · Note 17 related-party debt $13,329M with Valor and $327M of interest · Note 16 obligations $27,955M with $22,244M in 2027 · H1 free cash flow −$25,010M.',
    items: [
      {
        kind: 'corrected',
        title:
          'Our own draft: the related-party debt is not undisclosed-rate, and it is not obviously off-market',
        text: 'A first pass at this report described the Valor arrangements as carrying no disclosed rate, and derived a mid-teens implied rate from the balances. The 10-Q’s Other Financings paragraph does state a rate: **an average fixed 5.9% as of June 30, 2026** (5.5% at December 31), against 5.855% on the public notes. The correct framing is not "expensive related-party debt" but "**a disclosed 5.9% that the interest expense does not reconcile to**" — $327M against an average balance near $8.9B annualises to the mid-teens, and failed sale-leaseback accounting may explain the difference. The filing does not.',
      },
      {
        kind: 'corrected',
        title:
          'Our own draft: "the AI segment’s EBITDA flip is 100% add-backs" was wrong',
        text: 'The arithmetic is right — $(1,257)M + $1,885M D&A + $516M SBC + $2M restructuring = $1,146M — but the conclusion drawn from it was not. Of the **$1,755M sequential swing** from Q1’s $(609)M, **$1,212M (69%) came from the GAAP operating loss narrowing**, and AI gross margin expanded **25.2% → 44.3% → 56.8%** across three quarters. There is real operating improvement inside that segment, and an earlier draft denied it.',
      },
      {
        kind: 'corrected',
        title:
          'The "$116B unlocks August 6" coverage is right — but the December figure changed',
        text: 'We initially treated the widely published lockup number as the story. It is accurate: the 911.5M base tranche is unconditional. The finding is what happened to the *conditional* tranche — 455.8M shares needed five closes above $175.50 in the ten days to August 4, and **the best close was $118.24, with zero qualifying days**. Those shares roll forward, and the December 8 release becomes **up to 797.6M instead of 328.4M**.',
      },
      {
        kind: 'partly',
        title:
          '"$14.1 billion of contracted sales" as evidence of demand durability',
        text: 'The contracts are real and Note 2 defines contracted sales as the **non-cancellable, enforceable** portion, excluding cancellable future amounts — which is a stricter definition than most backlog metrics. But the risk factors say the cloud agreements "may be terminated by either party upon 90 days’ notice" after an initial ramp, and the prospectus describes the Anthropic term running to May 2029. Long contracted term, short cancellation right; the filings state both without reconciling them.',
      },
      {
        kind: 'partly',
        title: 'The Space segment decline as "reallocation, not deterioration"',
        text: 'True for the quarter: customer launches rose 9 → 10, customer payload was flat at ~87t, and the entire decline was internal Starlink deployment. The $173M wider loss reconciles exactly to a $383M rise in Starship R&D. **But the six-month columns reverse it** — H1 customer launches fell 21 → 17 and H1 Space revenue fell $1,611M → $1,581M. The quarter is reallocation; the half-year is flat-to-down.',
      },
      {
        kind: 'partly',
        title: 'Starlink ARPU falling from $85 to $66',
        text: 'Confirmed, and the 10-Q attributes it to "international expansion and the addition of lower priced service plans." Two caveats: consumer revenue per subscriber fell ~28%, *worse* than the 22.4% ARPU decline, implying the ARPU numerator is narrower than the reported consumer revenue line — a ~$277M gap the filing does not explain. And no like-for-like or US-only ARPU is given, so a price cut in mature markets cannot be ruled out.',
      },
      {
        kind: 'partly',
        title: 'H1 free cash flow of −$25.0B and "about 18 months of runway"',
        text: 'The arithmetic holds ($3,466M − $28,476M). Two refinements: a first-time, unexplained **$1,195M "Proceeds from product rebates"** line sits directly under capex in investing activities, which if netted puts free cash flow nearer −$23.8B. And liquidity is ~**$105B** ($93.5B cash + $6.5B securities + $5B undrawn revolver), not the $115.7B gross raised — that figure double-counts note proceeds already used to repay the bridge loan.',
      },
    ],
  },
  openQuestions: [
    'Why does $327M of quarterly related-party interest not reconcile to the disclosed 5.9% average fixed rate on those same arrangements? On an average balance near $8.9B it implies mid-teens. Failed sale-leaseback accounting may explain it; the filing does not.',
    'What useful lives are assigned to servers and networking equipment? The 10-Q names useful lives as a critical estimate but publishes no PP&E table — and depreciation is 36.4% of revenue and 70% of the Adjusted EBITDA bridge.',
    'Is Customer B’s ~$1.52B a run rate or a first-quarter catch-up? It went from roughly nothing to 19.5% of company revenue in one quarter, and Q3 is the first clean read.',
    'What is the $1,195M of "Proceeds from product rebates" in investing activities? It is a first-time line, it is material, and the filing does not describe it.',
  ],
  soWhat: `The four reports in this section now trace one arc, and it is the most useful thing in them: **the AI buildout has stopped being a technology story and become a capital-markets story.**

Look at what SpaceX actually is in this quarter. A rocket company that sells satellite internet, spending **$15.8 billion in three months** on GPUs — financed partly by a bond issue, partly by its IPO, and partly by lease agreements with a board member's investment firm — so that **AI labs can rent compute from it**. The customers are Anthropic and Google. The supplier of the batteries is Tesla. The power comes from mobile gas turbines that are being sued over.

That is what "AI infrastructure" means in practice, and none of it is about model quality. It is about who can raise $100 billion and survive the eighteen months before it pays back.

The practical read if you're building rather than investing: **the cheap inference you're using is being funded by an enormous, leveraged bet with a clock on it.** Four companies in this section have now shown the same shape from different angles — Amazon's cash flow went negative, Microsoft moved the spending off its capex line, SpaceX is spending 2.35× revenue, and Palantir is the one profiting from all of it without paying for any of it. Knowing which of those positions the company you depend on occupies is worth more than knowing its benchmark scores.`,
  throughLine: {
    text: `Four reports, one cycle — and SpaceX is the far end of it.

Every AI-infrastructure print this section has examined came down to the same question in a different disguise: **how much of the future is being paid for today, and where does that show up?** Amazon's capex quietly exceeded its operating cash flow and free cash flow went negative. Microsoft's fell ~$15B on a lease *reclassification* while $329B of signed leases sat off the capex line entirely. Palantir was the mirror image — $14.6M of quarterly capex, no depreciation wave, nothing to hide, so the whole risk moved into the multiple.

SpaceX takes it to the limit: **capex at 235% of revenue**, funded by an IPO, a bond, and a director's leasing vehicle, against an AI revenue base where one customer is 60% of the segment.

Ranked by capex-to-revenue, the four line up cleanly: **Palantir 0.75% · Microsoft ~32% · Amazon ~105% of operating cash flow · SpaceX 235%.** That ordering is also, roughly, the order of how much has to go right.`,
    links: [
      { label: 'PLTR — the one with no capex at all', slug: 'pltr-q2-2026' },
      {
        label: 'MSFT — the capex that moved off the line',
        slug: 'msft-q4-fy2026',
      },
      { label: 'AMZN — the first negative-cash quarter', slug: 'amzn-q2-2026' },
    ],
  },
  sources: [
    {
      n: 1,
      label: 'SpaceX Q2 2026 earnings release — 8-K Exhibit 99.1 (2026-08-04)',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026052515/earningsreleaseq22608042.htm',
      primary: true,
    },
    {
      n: 2,
      label:
        'SpaceX Q2 2026 Form 10-Q — Notes 3, 9, 16, 17 (concentration, debt, obligations, related party)',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026052535/spcx-20260630.htm',
      primary: true,
    },
    {
      n: 3,
      label:
        'SpaceX IPO prospectus (424B4) — lockup terms and cloud agreements',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001181412&type=424&dateb=&owner=include&count=10',
      primary: true,
    },
    {
      n: 4,
      label:
        'CNBC — SpaceX stock drops after first earnings report as AI costs soar',
      url: 'https://www.cnbc.com/2026/08/04/spacex-spcx-earnings-live-updates-q2-2026.html',
    },
    {
      n: 5,
      label: 'stockanalysis.com — SPCX price, market cap and multiples',
      url: 'https://stockanalysis.com/stocks/spcx/statistics/',
    },
    {
      n: 6,
      label: 'Investing.com — Q2 2026 earnings call transcript',
      url: 'https://ca.investing.com/news/transcripts/earnings-call-transcript-spacex-beats-revenue-estimates-in-q2-2026-shares-swing-93CH-4775805',
    },
    {
      n: 7,
      label:
        'TechCrunch — Musk repeatedly one-upped his execs on the first earnings call',
      url: 'https://techcrunch.com/2026/08/04/elon-musk-repeatedly-one-upped-his-execs-on-spacexs-first-earnings-call/',
    },
    {
      n: 8,
      label: 'Benzinga — Q2 highlights: revenue +92%, backlog $47.5B',
      url: 'https://www.benzinga.com/markets/earnings/26/08/60931182/spacex-q2-highlights-double-beat-revenue-up-92-backlog-hits-47-5-billion',
    },
    {
      n: 9,
      label: 'Investing.com — IPO lockup expiry mechanics and tranches',
      url: 'https://www.investing.com/news/stock-market-news/spacex-ipo-lockup-expiry-123b-in-shares-set-to-unlock-in-early-august-2026-93CH-4796311',
    },
    {
      n: 10,
      label: 'Axios — stock falls under IPO price as lockup expirations loom',
      url: 'https://www.axios.com/2026/07/17/spacex-lockup-stock-selloff',
    },
    {
      n: 11,
      label: 'CNBC — earnings date set, triggering the first big share unlock',
      url: 'https://www.cnbc.com/2026/07/21/spacex-spcx-earnings-lock-up-expiration.html',
    },
    {
      n: 12,
      label:
        'NPR — revenue rises as the once-soaring stock drifts back to Earth',
      url: 'https://www.npr.org/2026/08/04/nx-s1-5918536/spacex-first-earnings-report-since-ipo',
    },
    {
      n: 13,
      label: 'Teslarati — first earnings beat while minimizing losses',
      url: 'https://www.teslarati.com/spacex-spcx-q2-2026-earnings-results/',
    },
    {
      n: 14,
      label: 'Forbes — what to look for in SpaceX’s first earnings report',
      url: 'https://www.forbes.com/sites/investor-hub/article/spacex-first-earnings-report-what-to-look-out-for/',
    },
    {
      n: 15,
      label: 'SpaceX Investor Relations',
      url: 'https://ir.spacex.com',
    },
  ],
};

// Newest first — the section index renders in array order, without sorting.
export const marketStormReports: MarketStormReport[] = [
  spcxQ2_2026,
  pltrQ2_2026,
  msftQ4_FY2026,
  amznQ2_2026,
];

export function getReportBySlug(slug: string): MarketStormReport | undefined {
  return marketStormReports.find((r) => r.slug === slug);
}
