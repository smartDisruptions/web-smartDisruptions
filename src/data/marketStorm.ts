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
    'Revenue accelerated for a third straight quarter to +93%, GAAP operating margin went 27% → 47%, and free cash flow hit a 63% margin on $14.6 million of capex. The growth is real and the operating leverage is not an adjusted-numbers trick. But $15.4M of tax on $1.08B of pre-tax income does a fifth of the work in the headline EPS, bookings grew at half the rate of revenue, and the stock carries ~114× normalized earnings. STORM put four AI agents on the Q2 2026 print, then had a skeptic try to refute every load-bearing claim against the filing.',
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
  summary: `Revenue grew **93%** to $1.935B — the *third consecutive quarter of acceleration* (+70% → +85% → +93%), which at a $1.9B quarterly run rate is close to unheard of. GAAP operating margin went **27% → 47%**, and that one isn't adjusted: it's the actual income statement. Adjusted free cash flow was **$1.22B at a 63% margin** on **$14.6M** of capex — Palantir monetizes the AI buildout without funding it. Management raised the FY26 guide to **$8.15B (+82%)**, up from the +61% it guided in February. All real. But **Palantir paid $15.4M of tax on $1.081B of pre-tax income — a 1.42% rate** — while its own non-GAAP footnote calls 23% the long-term rate; apply that and the headline **$0.41 EPS is ~$0.32**. Closed TCV grew **49%** against revenue's 93%, and all of it came from one segment. At **~48× forward sales and ~114× normalized earnings**, the price already assumes about five more years of this.`,
  headlineVsReal: [
    {
      headline:
        '"GAAP net income of $1.062 billion, representing a 55% margin" — and diluted EPS of **$0.41**, up from $0.13.',
      real: 'About **$0.32** at the tax rate Palantir itself calls its long-term rate. Operating income — the part that is unambiguously the business — was $912M.',
      gap: 'Palantir booked **$15.4M of tax on $1,081.3M of pre-tax income, a 1.42% effective rate**. Its own adjusted-EPS footnote states an "estimated long-term annual effective tax rate of 23.0%." Applying the company’s own number costs ~$233M and ~9¢ of EPS. The tell is in the release itself: adjusted EPS ($0.41) is now *below* GAAP EPS for the first time — a year ago it was $0.16 vs $0.13, the other way around.',
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
      real: 'Bookings grew at roughly **half** the rate of revenue (+49% vs +93%), and **every dollar of the growth came from US commercial**.',
      gap: 'US commercial TCV was $2.132B of the $3.373B total. Back it out and bookings everywhere else — US government plus all international — went **$1.427B → $1.241B, about −13% YoY** (our arithmetic off the Q2 2025 and Q2 2026 releases). The fair caveat: Q2 2025 was itself a record TCV quarter at +140%, so the comp is brutal and one quarter is not a trend.',
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
      note: 'Bookings growing at half the rate of revenue.',
      tone: 'warn',
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
        cells: [
          'US commercial RDV',
          '$6,238M',
          '+124%',
          '+27% QoQ; no total-company RDV disclosed',
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
    '**The operating leverage is GAAP, not adjusted:** operating margin went 27% → 47% in a year, on the real income statement.',
    '**63% free-cash-flow margin on $14.6M of capex.** Palantir is the asset-light tenant of everyone else’s $200B build — no depreciation wave, no debt, no negative-FCF window.',
    '**Guidance raised twice, hard:** FY26 revenue from +61% (February) to +71% (May) to **+82%** (August) — roughly $1B added in six months, after eight straight beats.',
    '**The dilution complaint is now stale:** diluted share count rose 0.2% YoY and stock comp fell from 15.9% to 13.7% of revenue.',
    '**The competition bear case got weaker, not stronger** — 149% US commercial growth is not the shape of a company losing share to hyperscaler AI layers.',
  ],
  bear: [
    '**~48× forward sales and ~114× normalized earnings** — the most expensive large-cap in US software, with no close second.',
    '**A 1.42% effective tax rate** does ~9¢ of the $0.41 headline EPS; Palantir’s own footnote says 23% is the long-term rate.',
    '**Bookings grew at half the rate of revenue** (TCV +49% vs revenue +93%) — revenue eventually converges to bookings.',
    '**TCV outside US commercial fell ~13% YoY.** Concentration is increasing, not broadening, and US revenue is 81% of the total.',
    '**Two disclosures went quiet:** customer count (touted at +43% a year ago) and any total-company RDV or RPO figure.',
    '**$91.8M of "other income"** — ~14× the year-ago figure and materially non-cash — sits inside that 55% net margin.',
  ],
  theQuestion: `Is 93% growth a *land grab with a long runway* — sovereign AI as a real new category Palantir defined and owns — or a *pull-forward* into a US commercial base that the bookings data says isn't broadening? Every other question here is downstream. At ~114× normalized earnings the price doesn't just need the first answer; it needs it to keep being true for about five more years.`,
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

Then the counterweight, which is in the same release. **Closed TCV grew 49% while revenue grew 93%** — bookings are compounding at roughly half the rate of the revenue they eventually become. And the composition is narrow: US commercial TCV was **$2.132B of the $3.373B** total. Back it out and bookings everywhere else went **$1.427B → $1.241B, about −13% YoY**.

> **Caveat, applied honestly:** Q2 2025 was itself a record TCV quarter at +140% YoY, so this is a punishing comp, and a single quarter of a derived figure is not a trend. It is, however, the one number in the release that does not rhyme with the headline — and it is the number to watch next quarter.

Two disclosures that used to be there aren't. **Customer count** — touted in the Q2 2025 highlights at +43% YoY — appears in neither the Q1 nor the Q2 2026 release. And Palantir gives US commercial RDV ($6.238B) but **no total-company RDV or RPO**, so there is no way to check whether total backlog is keeping pace with revenue. Neither omission is evidence of a problem. Both remove the evidence that would settle one.

## The shape nobody else in AI has

Palantir spent **$14.6M** on property and equipment this quarter — **0.75% of revenue** — and generated $1.22B of adjusted free cash flow. Amazon's trailing capex is ~$169B; Microsoft's was $115.9B for the year with another $329B of uncommenced leases sitting off the statement.

That difference is not a detail, it is the investment case. Palantir sells into the AI buildout **without funding it**. There is no depreciation wave arriving in 2027, no debt raised to cover a capex hole, no negative-free-cash-flow window to explain away. The earnings-quality questions that dominated the Amazon and Microsoft prints simply have no place to live on this balance sheet.

Which is precisely why they moved into the price — and into the tax line.

## Risk — each isolated, do not blur

1. **Valuation / multiple risk (dominant).** ~114× normalized earnings, ~48× forward sales. A 30% de-rating requires nothing to go wrong operationally — that is not a hypothetical, it is what happened in H1 2026 while revenue accelerated.
2. **Earnings quality — the tax line.** A 1.42% effective rate against the company's own stated 23% long-term rate. When the shield exhausts, reported EPS growth decouples *downward* from operating growth, and the optics of that quarter will be ugly regardless of the business.
3. **Concentration.** US revenue is 81% of total; US commercial supplied all the bookings growth. Marketed as a global sovereign-AI wave, the segment data currently describes a US phenomenon.
4. **Bookings vs. revenue.** TCV growing at half of revenue growth. If revenue keeps outrunning bookings, growth converges downward to bookings — the only question is when.
5. **Non-operating income.** $91.8M of "other income," ~14× the year-ago figure and materially non-cash, sitting inside the 55% net margin.
6. **Insider selling.** Karp sold 397,744 Class A shares on May 20, 2026 under a 10b5-1 plan, with sustained executive-suite selling for two years. Pre-scheduled 10b5-1 sales are not a signal by themselves — but the aggregate is large enough to name rather than omit.
7. **Competition (ranked low, deliberately).** Every hyperscaler sells an AI application layer. This print made that case *weaker*: 149% US commercial growth is not what share loss looks like.

## Time horizon & position sizing (kept separate)

**Horizon.** Not a next-quarter setup. The next two quarters are guided to decelerate — **+83%** for Q3, and the FY guide implies roughly **+72%** for Q4 — and Palantir has beaten its own guide eight quarters running, so the near term is mostly a game of by-how-much. The thesis resolves over **3–5 years** on the question the valuation section poses: does ~$8B of revenue become ~$30B+ before the multiple normalizes? Under two years you are trading sentiment on the AI complex, not the business.

**Sizing considerations (not a recommendation).** Two things separate Palantir from the other names in this section. It is the only one that **doesn't carry capex-cycle risk** — no depreciation wave, no debt, no negative-FCF window — so it is genuine diversification against AMZN/MSFT/NVDA exposure rather than more of the same beta. Against that: at ~48× sales, returns are dominated by the multiple rather than by operations, and H1 2026 is the proof — the business accelerated and the stock fell 32%. A position sized for the business will behave like a position sized for the multiple.`,
  invalidation: {
    bull: [
      'Total TCV growth stays near half of revenue growth into FY27 — bookings stop replenishing the revenue they feed.',
      'TCV outside US commercial declines a second and third quarter, confirming concentration rather than a hard comp.',
      'The tax shield exhausts and normalized EPS growth visibly lags the multiple.',
      'US commercial revenue growth decelerates faster than the guide while international commercial stays undisclosed.',
    ],
    bear: [
      'Total TCV growth re-accelerates toward revenue growth — and Palantir resumes disclosing total RDV or customer count.',
      'International commercial turns, proving "sovereign AI" is a global category rather than a US one.',
      'The implied ~+72% Q4 guide is beaten by the usual 4%+, making the deceleration curve a sandbag rather than a ceiling.',
      'Adjusted FCF lands at the top of the $4.5–4.7B guide while revenue nearly doubles — funding the multiple from cash rather than hope.',
    ],
  },
  verification: {
    confirmed: 5,
    partlyTrue: 4,
    corrected: 2,
    confirmedNote:
      'Confirmed against Palantir’s own 8-K: revenue $1,935.5M / +93% and US commercial $764M / +149% · GAAP income from operations $912.0M at a 47% margin, up from 27% · adjusted free cash flow $1,220.4M at a 63% margin on $14.6M of capex · the FY26 guide raised to $8.150–8.158B (+82%) from +61% in February · $9.2B of cash and Treasuries with no debt.',
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
        kind: 'partly',
        title:
          '"Closed TCV of $3.373 billion, up 49%" as confirmation of the growth',
        text: 'Bookings grew at roughly half the rate of revenue, and **all** of the growth came from US commercial ($2.132B of $3.373B). Derived from the two press releases, TCV outside US commercial went $1.427B → $1.241B, **about −13% YoY**. Fair caveat: Q2 2025 was a record TCV quarter (+140%), so the comp is severe and one quarter is not a trend.',
      },
      {
        kind: 'partly',
        title: '"Demand for AI sovereignty has now been unleashed"',
        text: 'The segment data supports a **US** story specifically: US revenue +115% and 81% of the total. The release gives **no international commercial growth figure at all** — historically Palantir’s weakest segment. The demand is evidently real; its geography is being described more broadly than the disclosure supports.',
      },
      {
        kind: 'partly',
        title: 'The $91.8M of "other income, net" inside the 55% net margin',
        text: 'Up ~14× from $6.6M a year ago, and not operating income. The cash-flow statement backs out $62.2M of marketable-securities gains and $85.6M of "other operating activities" over six months, indicating a materially non-cash component. Exact composition awaits the 10-Q.',
      },
    ],
  },
  openQuestions: [
    'What actually composes the $91.8M of "other income, net"? It is ~14× the year-ago figure and sits inside the headline net margin — the press release doesn’t break it out, and the 10-Q isn’t filed yet.',
    'Why is there no total-company RDV or RPO? Palantir discloses US commercial RDV ($6.238B) but no total — which is precisely the figure that would settle whether total backlog is keeping pace with 93% revenue growth.',
    'Where did customer count go? Disclosed at +43% YoY in the Q2 2025 highlights, absent from both the Q1 and Q2 2026 releases. Is 149% US commercial growth more customers, or more spend from the same ones?',
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
        'Palantir Q2 2025 press release — the year-ago TCV and customer-count comp',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165525000105/a2025q2ex991pressrelease.htm',
      primary: true,
    },
    {
      n: 3,
      label:
        'Palantir Q1 2026 press release — the sequential and guidance trail',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000026/a2026q1ex991pressrelease.htm',
      primary: true,
    },
    {
      n: 4,
      label: 'Palantir Q4 2025 results — FY25 base and the original FY26 guide',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000004/a2025q4ex991earningsrelease.htm',
      primary: true,
    },
    {
      n: 5,
      label:
        'CNBC — Palantir stock rises 30% on commercial revenue, AI sovereignty (2026-08-04)',
      url: 'https://www.cnbc.com/2026/08/04/palantir-2q-earnings-ai-sovereign-tools.html',
    },
    {
      n: 6,
      label: 'CNBC — Palantir Q2 2026 earnings (2026-08-03)',
      url: 'https://www.cnbc.com/2026/08/03/palantir-pltr-earnings-q2-2026.html',
    },
    {
      n: 7,
      label:
        'stockanalysis.com — PLTR statistics (price, market cap, multiples)',
      url: 'https://stockanalysis.com/stocks/pltr/statistics/',
    },
    {
      n: 8,
      label: 'GuruFocus — Q2 2026 earnings call highlights',
      url: 'https://www.gurufocus.com/news/9000347/palantir-technologies-inc-pltr-q2-2026-earnings-call-highlights-record-93-revenue-growth-and-raised-guidance-signal-unprecedented-ai-demand',
    },
    {
      n: 9,
      label: 'Seeking Alpha — Q2 2026 earnings call presentation',
      url: 'https://seekingalpha.com/article/4929655-palantir-technologies-inc-2026-q2-results-earnings-call-presentation',
    },
    {
      n: 10,
      label:
        'TradingKey — earnings preview: 8 straight beats, 40% off its high',
      url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262068882-palantir-pltr-earnings-preview-august-3-2026-options-swing-triangle-tradingkey',
    },
    {
      n: 11,
      label: 'TradingKey — surges 15% after Q2 results, guidance raised',
      url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262072328-palantir-q2-earnings-sweep-expectations-stock-surges-15-tradingkey',
    },
    {
      n: 12,
      label:
        '24/7 Wall St. — after the blowout, where the stock could head next',
      url: 'https://247wallst.com/investing/2026/08/04/after-palantirs-blowout-earnings-heres-where-the-stock-could-head-next/',
    },
    {
      n: 13,
      label: 'TIKR — down 34% from its 52-week high, the path to $212 by 2028',
      url: 'https://www.tikr.com/blog/palantir-stock-is-down-34-from-its-52-week-high-heres-the-path-to-212-by-2028',
    },
    {
      n: 14,
      label:
        'StockTitan — Karp Form 4: 397,744 Class A shares sold (2026-05-20)',
      url: 'https://www.stocktitan.net/sec-filings/PLTR/form-4-palantir-technologies-inc-insider-trading-activity-48a8d6e385ad.html',
    },
    {
      n: 15,
      label: 'TipRanks — Karp continues to sell company stock',
      url: 'https://www.tipranks.com/news/palantir-pltr-ceo-alex-karp-continues-to-sell-company-stock',
    },
    {
      n: 16,
      label:
        'MarketBeat — Palantir Q2 2026 earnings report (consensus vs actual)',
      url: 'https://www.marketbeat.com/earnings/reports/2026-8-3-palantir-technologies-inc-stock/',
    },
    {
      n: 17,
      label: 'Yahoo Finance — what to expect from Palantir’s Q2 2026 report',
      url: 'https://finance.yahoo.com/markets/stocks/articles/expect-palantir-q2-2026-earnings-124258336.html',
    },
    {
      n: 18,
      label:
        'AOL / Fortune — Karp on frontier labs wanting to "colonize your enterprise"',
      url: 'https://www.aol.com/articles/palantir-ceo-alex-karp-says-002758000.html',
    },
    {
      n: 19,
      label:
        'FinancialContent — sustained insider selling [low-confidence secondary]',
      url: 'https://markets.financialcontent.com/stocks/article/marketminute-2026-3-10-palantir-shares-dip-as-sustained-insider-selling-shadows-dominant-ai-footprint',
    },
    {
      n: 20,
      label:
        'Palantir Investor Relations — CEO letters and investor presentations',
      url: 'https://investors.palantir.com',
    },
    {
      n: 21,
      label:
        'stockanalysis.com — NVDA statistics (the same-day sales-multiple comparison)',
      url: 'https://stockanalysis.com/stocks/nvda/statistics/',
    },
  ],
};

// Newest first — the section index renders in array order, without sorting.
export const marketStormReports: MarketStormReport[] = [
  pltrQ2_2026,
  msftQ4_FY2026,
  amznQ2_2026,
];

export function getReportBySlug(slug: string): MarketStormReport | undefined {
  return marketStormReports.find((r) => r.slug === slug);
}
