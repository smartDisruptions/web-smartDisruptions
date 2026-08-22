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

/**
 * Which shelf a source sits on.
 *
 * The list runs to forty or fifty entries on a full report, and at that length
 * a flat column stops being a record and becomes a wall — the reader cannot
 * tell the 10-Q from a blog post skimming it. Grouping restores the one thing
 * a source list is for: seeing what the conclusions actually rest on.
 *
 * Absent, it is inferred from `primary` (filing, else analysis), so the two
 * reports written before this field existed keep rendering correctly.
 */
export type SourceKind = 'filing' | 'company' | 'data' | 'analysis';

export interface SourceRef {
  n: number;
  label: string;
  url: string;
  primary?: boolean;
  kind?: SourceKind;
  secondaryUrl?: string;
  secondaryLabel?: string;
}

/**
 * One agent in a run, and the stake it was told to take.
 *
 * These are adversarial on purpose: the short-seller is instructed to justify a
 * position against the company, the skeptics are told to REFUTE rather than
 * check. What survives that is what gets written up.
 */
export interface AgentRole {
  role: string;
  probe: string; // what this agent was pointed at
}

/**
 * How a report was actually produced.
 *
 * WHY THIS IS PUBLISHED
 * ---------------------
 * Not every report is researched the same way, and for a while that difference
 * was invisible. The eight earnings reads run four perspectives and send the
 * top handful of claims to skeptics; the thesis pieces run five and refute
 * every load-bearing claim there is. Rendering the roster and the verification
 * depth on each report turns an inconsistency into the thing the section is
 * actually about — "the finance is the payload; the method is the point".
 *
 * `claimsSurfaced` vs `claimsVerified` is the number that matters most, and the
 * one a reader cannot infer from anything else on the page: six of twenty-three
 * claims refuted-tested is a different promise from all forty-five.
 */
export interface ResearchMethod {
  /** An earnings read on one company, or a thesis across the whole cycle. */
  kind: 'earnings' | 'thesis';
  perspectives: AgentRole[];
  turnsEach: number;
  /** Load-bearing claims the report tracks in its verification ledger. */
  claimsSurfaced: number;
  /**
   * Of those, how many went through the ADVERSARIAL pass — an agent told to
   * refute the claim rather than check it. Optional because two reports predate
   * run-record capture and the split is not recoverable; the badge says
   * "tracked" rather than "refuted-tested" when it is absent, instead of
   * quietly implying a rigour that was not measured.
   */
  claimsVerified?: number;
  /** Whether every load-bearing claim was refuted-tested, or only the top few. */
  verificationScope: 'all' | 'top-n' | 'unrecorded';
  /** Agents that actually ran. 0 when the run record was not retained. */
  agentCount: number;
  runDate: string; // ISO 'YYYY-MM-DD'
  /** Primary filings and offering documents opened during the run, if counted. */
  primaryDocsOpened?: number;
  /**
   * Anything that capped the run, stated plainly. The first pass at the thesis
   * report had web fetching blocked and opened no primary filing at all — a
   * limitation that has to travel with the work, not sit in a commit message.
   */
  limitations?: string[];
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
  // The index card carries the company's mark instead of the hero. The two
  // images answer different questions: on an index the reader is scanning for
  // a company, and a logo answers that faster than any amount of type; on the
  // report page there is room for the finding, so the hero earns its place
  // there. Same reason the social card never varies while heroes do.
  /**
   * How this one was researched. Optional so a report written before the field
   * existed still renders; the UI falls back to the section-wide description.
   */
  method?: ResearchMethod;
  /**
   * The pinned thesis piece at the top of the index. At most one report should
   * carry this — `featuredReport()` takes the first and the rest fall into the
   * normal grid, so a stale flag degrades into an ordinary card rather than a
   * second hero.
   */
  featured?: boolean;
  cardImage?: string;
  cardImageLight?: string;
  cardImageAlt?: string;
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
    'The stock stopped being a cash-return story this quarter and became a duration bet: roughly $220B a year of capex, wagered on AWS billing it back before depreciation and rates catch up with it.',
  priceStrip: [
    { k: 'Close · Jul 30', v: '$235.50' },
    { k: 'After hours', v: '≈ +7–10%', tone: 'bull' },
    { k: 'Market cap', v: '~$2.53T' },
    { k: 'Fwd P/E', v: '~26.3×' },
  ],
  summary: `Amazon's cloud business had its best quarter in four years — and in the same release, the company burned more cash than it earned for the first time ever. Both are true, and they are the same story: AWS is growing fast *because* Amazon is spending roughly $220 billion a year building the data centres that run it. The bet is that the spending turns into billed revenue before the accounting catches up with it. The scorecard below is that argument in numbers — the operating business on one side, the cash statement on the other.`,
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
  method: {
    kind: 'earnings',
    perspectives: [
      {
        role: 'Fundamentals analyst',
        probe:
          'Segment margins, cash generation, and what the operating business actually earned.',
      },
      {
        role: 'Short seller',
        probe: 'What breaks the bull case, and by what mechanism.',
      },
      {
        role: 'Industry engineer',
        probe: 'Whether the technology and the moat are real.',
      },
      {
        role: 'Valuation watcher',
        probe: 'What the price already assumes.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 9,
    verificationScope: 'unrecorded',
    agentCount: 0,
    runDate: '2026-07-30',
    limitations: [
      'Run record not retained. The roster shown is the section standard — every recovered run used exactly these four — but it is an inference for this report, not a recording, and the split between adversarial and by-hand checking is not recoverable.',
    ],
  },
  cardImage: '/images/content/amzn-q2-2026-card-hero.webp',
  cardImageLight: '/images/content/amzn-q2-2026-card-hero-light.webp',
  cardImageAlt: 'Amazon logo',
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
  summary: `Microsoft had a genuinely strong quarter: Azure grew 43% and crossed $100 billion a year. But three separate accounting decisions in the same period all moved the reported numbers in the same, flattering direction — a capex figure that fell without the spending falling, a change to how long data centres are assumed to last, and $329 billion of signed leases that sit outside the capex line entirely. None of it is hidden and none of it is improper. It just means the headline number and the filing are telling slightly different stories, and only one of them is signed.`,
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

| Multiple (at $487.65, Aug 3) | Value | Context |
| --- | --- | --- |
| Trailing P/E | 27.2× | on GAAP $17.95 |
| **Forward P/E** | **22.6–24.8×** | genuine tracker spread, not one number |
| P/E on clean operating EPS | ~28.6× | strips the residual discrete benefit |
| EV / EBITDA | 19.0× | — |
| **Price / FCF** | **54.1×** | the line nobody quotes |
| S&P 500 forward P/E | 19.6× | FactSet, Jul 31 — MSFT at ~26% premium |

The under-discussed number is **P/FCF of 54× against a P/E of 27×**. The equity yields about **1.85% in free cash flow** because capex is taking 63% of operating cash. On earnings the multiple asks for roughly what management guided; the stretch is entirely on cash.

Analyst reaction was constructive and unusually dispersed: **56 analysts, mean target $562.73, high $870, low $400**, with 40 Strong Buy / 0 Sell and **no post-print cut I could find** — though BofA ($500) and Phillip ($515) raised to barely above the current price, which is where the real disagreement lives.

## The compute position

Microsoft now reports capacity in **gigawatts, not GPUs**, and the unit change is the tell. It added ~1GW in the quarter, opened 31 datacenters, and expects to roughly double capacity in two years. Demand still exceeds supply, and management **declined to say when that ends** — or to name whether the binding constraint is power, shells, GPUs or land.

That reframes the silicon story. **Maia 200 is an inference part, not a training part**, and critically draws **~750W against Nvidia designs at 1,200W+**. When your limit is a gigawatt rather than a purchase order, performance-per-watt *is* the capacity strategy.

> **Caveat the skeptic pass insisted on:** every custom-silicon claim this quarter — Microsoft's "30% better performance per dollar", Amazon's Trainium comparisons, Google's TPU numbers — is **vendor-published and unrefereed**. MLPerf Inference v6.0 included no Maia and no current-generation TPU results. There is no neutral referee; treat all of it as directional.

The OpenAI relationship is now two-sided. Microsoft holds ~27% as-converted at **$135B carrying value** and OpenAI committed **$250B** of Azure purchases — but Microsoft **gave up right of first refusal** on OpenAI's compute, and OpenAI has since expanded AWS by ~$100B. Products still ship first on Azure unless Microsoft cannot supply. The exclusivity is gone.

## Risk — each isolated, do not blur

1. **The reclassification (central).** Extending assumed asset life from 15 to 25 years makes a given lease term a smaller fraction of that life, which is the mechanism that moved finance leases to operating leases and the guide from ~$190B to ~$175B. All disclosed on the call — but the number that reached most readers was "Microsoft cut capex."
2. **The off-statement obligation.** $329.1B of leases signed but not commenced, roughly 3× Azure's annual revenue, commencing FY27–FY33, appearing in no capex figure. Sources disagree on the prior-period base and I could not reconcile them.
3. **Earnings quality.** The FY26 OpenAI line swung $8.6B, from a $3.62B loss to a $4.96B gain — a **non-cash dilution gain** from the recapitalisation, reversible if OpenAI's valuation compresses. A $3.2B Anthropic gain sits *inside* the "clean" non-GAAP figure.
4. **Depreciation, deferred rather than absorbed.** FY26 depreciation was $34.3B against $22.0B. The life extension pushes future depreciation out; management guided FY27 margin "down less than a point." Worth noting it covers **buildings and shells, not servers or GPUs**, so the usual "they stretched server lives" attack does not apply.
5. **Cloud margin compression.** Microsoft Cloud gross margin fell 3 points to 65% — while Amazon printed AWS margin *expansion* the following day. Same capex cycle, opposite direction, and the most decision-relevant comparison here.
6. **Related-party concentration.** OpenAI is somewhere in a **30–45% band** of commercial RPO depending which disclosure you read, and Microsoft does not disclose how much Azure revenue comes from it.

## Horizon and sizing (kept separate)

**Horizon.** Not a next-quarter setup — the stock moved ~25% in three sessions and the guide is in the price. The thesis resolves over **3–5 years**: do the FY27–FY33 lease commencements convert to billed Azure revenue at a return above the depreciation just pushed out?

**Sizing considerations (not a recommendation).** MSFT carries the same AI-capex-cycle beta as NVDA, AMZN and GOOGL, so it adds correlation rather than diversification. Reported earnings now swing on marks on two private companies, a new and lumpy source of volatility. And a ~1.85% free-cash-flow yield leaves less cushion than a 27× P/E implies.`,
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
  method: {
    kind: 'earnings',
    perspectives: [
      {
        role: 'Fundamentals analyst',
        probe:
          'Segment margins, cash generation, and what the operating business actually earned.',
      },
      {
        role: 'Short seller',
        probe: 'What breaks the bull case, and by what mechanism.',
      },
      {
        role: 'Industry engineer',
        probe: 'Whether the technology and the moat are real.',
      },
      {
        role: 'Valuation watcher',
        probe: 'What the price already assumes.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 9,
    verificationScope: 'unrecorded',
    agentCount: 0,
    runDate: '2026-08-03',
    limitations: [
      'Run record not retained. The roster shown is the section standard — every recovered run used exactly these four — but it is an inference for this report, not a recording, and the split between adversarial and by-hand checking is not recoverable.',
    ],
  },
  cardImage: '/images/content/msft-q4-fy2026-card-hero.webp',
  cardImageLight: '/images/content/msft-q4-fy2026-card-hero-light.webp',
  cardImageAlt: 'Microsoft logo',
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
        'Alphabet IR — Q2 2026 earnings release (PDF, the IR copy of the 8-K exhibit)',
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
  ],
  summary: `Palantir is growing faster at $2 billion a quarter than most software companies manage at a tenth the size — 93%, accelerating for a third straight quarter, with margins that widened rather than thinned. That part is not in dispute. What the headlines leave out is that the company paid **1.4% tax** on its profits, which flatters the earnings figure everyone quotes by about a fifth. The business is exceptional; the question this report ends on is whether a price of roughly 114× normalised earnings has already spent the next five years of it.`,
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
  analysis: `## Valuation — this is the entire bear case

At **$163.24** the market pays **~$391B** for a company guiding to **$8.15B** of 2026 revenue: **~48× forward sales**, where large-cap software lives at 10–20×. Nvidia, the most direct AI beneficiary in the market, trades at ~20× trailing and ~12× forward.

There is no clean P/E to quote, because the reported one runs on a tax rate the company itself says is not the long-run rate. Normalising FY26 — the adjusted operating income guide of **$4.89B**, less ~**$1.05B** of stock compensation and payroll tax, plus ~**$0.6B** of interest and other income, taxed at Palantir's own **23%** — lands near **$3.4B**, or about **114×**.

| Multiple (on $163.24) | Value | Context |
| --- | --- | --- |
| Price / sales (FY26 guide) | **~48×** | Rest of large-cap software: 10–20× |
| Trailing P/E | 139.6× | On a 1.4% tax rate |
| Forward P/E | 86.5× | Also on the low tax rate |
| **Normalised P/E (our estimate)** | **~114×** | GAAP operating basis, taxed at Palantir's own 23% |
| EV / EBITDA | 143.6× | — |
| Price / free cash flow | 116.6× | ~85× on the FY26 adj. FCF guide |

**What has to happen.** At ~114×, reaching a 30× multiple — still a premium to almost anything — needs earnings to grow about **3.8×**: four years at a 40% CAGR, a bit over five at 30%. Today's price embeds roughly half a decade of compounding at rates almost nothing sustains, just to arrive at *expensive*.

One concession the bears should make: **the de-rating already partly happened.** Palantir entered this print ~41% below its 52-week high and down ~32% year to date — the business compounded at 85% through the first half while the stock fell.

## Risk — each isolated, do not blur

1. **Valuation (dominant).** A 30% de-rating requires nothing to go wrong operationally. That is not hypothetical; it is what H1 2026 did while revenue accelerated.
2. **The tax line.** When the valuation allowance releases, reported EPS growth decouples *downward* from operating growth, and that quarter will look ugly regardless of the business.
3. **Concentration.** US revenue is 81% of the total, and growth is existing customers spending more — 1,049 of them, up 24%, against revenue up 93%.
4. **Bookings.** If revenue keeps outrunning bookings, growth converges down to bookings. The only question is when.
5. **Non-operating income.** $91.8M of "other income" includes **$66M of unrealised gains on public stakes the company mostly cannot yet sell** — it reverses if those positions fall.
6. **Competition (ranked low, deliberately).** Every hyperscaler sells an AI application layer. This print made that case *weaker*, not stronger: 149% US commercial growth is not what share loss looks like.

## Horizon and sizing (kept separate)

**Horizon.** Not a next-quarter setup — Q3 is guided to +83% and Q4 to roughly +72%, and Palantir has beaten its own guide eight quarters running, so the near term is a game of by-how-much. It is worth knowing the deceleration is a *guidance choice* rather than comp arithmetic: hold Q2's own +18.5% sequential pace and Q4 prints ~$2.71B, or +93%. The thesis resolves over **3–5 years** on one question — does ~$8B of revenue become ~$30B+ before the multiple normalises?

**Sizing considerations (not a recommendation).** Palantir is the rare AI name that **doesn't carry capex-cycle risk** — $14.6M of quarterly capex means no depreciation wave, no debt, no negative-FCF window — so it diversifies against the hyperscalers rather than doubling them. Against that: at ~48× sales the return is dominated by the multiple, not the operations, and H1 2026 proved it. A position sized for the business will behave like a position sized for the multiple.`,
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
  method: {
    kind: 'earnings',
    perspectives: [
      {
        role: 'Fundamentals analyst',
        probe:
          'Segment margins, cash generation, and what the operating business actually earned.',
      },
      {
        role: 'Short seller',
        probe: 'What breaks the bull case, and by what mechanism.',
      },
      {
        role: 'Industry engineer',
        probe: 'Whether the technology and the moat are real.',
      },
      {
        role: 'Valuation watcher',
        probe: 'What the price already assumes.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 13,
    claimsVerified: 6,
    verificationScope: 'top-n',
    agentCount: 12,
    runDate: '2026-08-04',
  },
  cardImage: '/images/content/pltr-q2-2026-card-hero.webp',
  cardImageLight: '/images/content/pltr-q2-2026-card-hero-light.webp',
  cardImageAlt: 'Palantir Technologies logo',
  sources: [
    {
      n: 1,
      label: 'Palantir Q2 2026 press release (SEC 8-K, Exhibit 99.1)',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000039/a2026q2ex991pressrelease.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 2,
      label:
        'Palantir Q2 2026 Form 10-Q (filed 2026-08-04) — RPO, Note 10 tax, equity-securities marks',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000041/pltr-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 3,
      label:
        'Palantir Q2 2025 press release — the year-ago TCV and customer-count comp',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165525000105/a2025q2ex991pressrelease.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 4,
      label:
        'Palantir Q1 2026 press release — the sequential and guidance trail',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000026/a2026q1ex991pressrelease.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 5,
      label: 'Palantir Q4 2025 results — FY25 base and the original FY26 guide',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000004/a2025q4ex991earningsrelease.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 6,
      label: 'Palantir Form 10-Q, period ended 2025-09-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165525000131/pltr-20250930.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 7,
      label: 'Palantir Form 10-Q, period ended 2025-06-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165525000106/pltr-20250630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 8,
      label: 'Palantir Form 10-Q, period ended 2026-03-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1321655/000132165526000028/pltr-20260331.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 9,
      label: 'SEC EDGAR — Palantir filing index',
      url: 'https://data.sec.gov/submissions/CIK0001321655.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 10,
      label: 'SEC EDGAR — Palantir filing index',
      url: 'https://data.sec.gov/api/xbrl/companyconcept/CIK0001321655/us-gaap/EarningsPerShareDiluted.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 11,
      label: 'Palantir — Overview • Ontology • Palantir',
      url: 'https://www.palantir.com/docs/foundry/ontology/overview',
      kind: 'company',
    },
    {
      n: 12,
      label: 'Palantir — Core concepts • Palantir',
      url: 'https://www.palantir.com/docs/foundry/ontology/core-concepts',
      kind: 'company',
    },
    {
      n: 13,
      label: 'Palantir — Action types • Overview • Palantir',
      url: 'https://www.palantir.com/docs/foundry/action-types/overview',
      kind: 'company',
    },
    {
      n: 14,
      label: 'Palantir — Palantir AIP Bootcamp',
      url: 'https://www.palantir.com/platforms/aip/bootcamp/',
      kind: 'company',
    },
    {
      n: 15,
      label:
        'Business Wire — Palantir reports Q2 2026: U.S. commercial revenue +149% YoY, revenue +93% YoY, raises FY2026 guidance',
      url: 'https://www.businesswire.com/news/home/20260802523449/en/Palantir-Reports-Q2-2026-U.S.-Comm-Revenue-Growth-of-149-YY-and-Revenue-Growth-of-93-YY-Raises-FY-2026-Revenue-Guidance-to-82-YY-Growth-and-U.S.-Comm-Revenue-Guidance-to-134-YY-Crushing-Consensus-Expectations',
      kind: 'company',
    },
    {
      n: 16,
      label:
        'Business Wire — Palantir reports Q1 2026: U.S. revenue +104% YoY, revenue +85% YoY, raises FY2026 guidance',
      url: 'https://www.businesswire.com/news/home/20260503338048/en/Palantir-Reports-Q1-2026-U.S.-Revenue-Growth-of-104-YY-and-Revenue-Growth-of-85-YY-Raises-FY-2026-Revenue-Guidance-to-71-YY-Growth-and-U.S.-Comm-Revenue-Guidance-to-120-YY-Crushing-Consensus-Expectations',
      kind: 'company',
    },
    {
      n: 17,
      label: 'Palantir IR — Q1 2026 Form 10-Q (PDF)',
      url: 'https://investors.palantir.com/files/2026%20Q1%20PLTR%2010-Q.pdf',
      kind: 'company',
    },
    {
      n: 18,
      label: 'Palantir IR — Palantir IR',
      url: 'https://investors.palantir.com/news-details/2026/Palantir-Reports-Q1-2026-U-S--Revenue-Growth-of-104-YY-and-Revenue-Growth-of-85-YY-Raises-FY-2026-Revenue-Guidance-to-71-YY-Growth-and-U-S--Comm-Revenue-Guidance-to-120-YY-Crushing-Consensus-Expectations/',
      kind: 'company',
    },
    {
      n: 19,
      label: 'Business Wire — En',
      url: 'https://www.businesswire.com/news/home/20260802523449/en/',
      kind: 'company',
    },
    {
      n: 20,
      label: 'Palantir IR — 2025%20fy%20pltr%2010 k',
      url: 'https://investors.palantir.com/files/2025%20FY%20PLTR%2010-K.pdf',
      kind: 'company',
    },
    {
      n: 21,
      label:
        'stockanalysis.com — PLTR statistics (price, market cap, multiples)',
      url: 'https://stockanalysis.com/stocks/pltr/statistics/',
      kind: 'data',
    },
    {
      n: 22,
      label: 'GuruFocus — Q2 2026 earnings call highlights',
      url: 'https://www.gurufocus.com/news/9000347/palantir-technologies-inc-pltr-q2-2026-earnings-call-highlights-record-93-revenue-growth-and-raised-guidance-signal-unprecedented-ai-demand',
      kind: 'data',
    },
    {
      n: 23,
      label: 'TipRanks — Karp continues to sell company stock',
      url: 'https://www.tipranks.com/news/palantir-pltr-ceo-alex-karp-continues-to-sell-company-stock',
      kind: 'data',
    },
    {
      n: 24,
      label:
        'TIKR — Palantir’s Q2 Earnings Call Produced Its Largest-Ever Guidance Raise. Here’s What Changed',
      url: 'https://www.tikr.com/blog/palantirs-q2-earnings-call-produced-its-largest-ever-guidance-raise-heres-what-changed',
      kind: 'data',
    },
    {
      n: 25,
      label:
        'stockanalysis.com — Palantir Technologies (PLTR) Stock Price & Overview',
      url: 'https://stockanalysis.com/stocks/pltr/',
      kind: 'data',
    },
    {
      n: 26,
      label:
        'TradingView — PLTR Stock Price — Palantir Technologies Stock Chart',
      url: 'https://www.tradingview.com/symbols/NASDAQ-PLTR/',
      kind: 'data',
    },
    {
      n: 27,
      label:
        'TIKR — Palantir Q1 2026 Earnings: U.S. Revenue Crosses 100% Growth for the First Time',
      url: 'https://www.tikr.com/blog/palantir-q1-2026-earnings-u-s-revenue-crosses-100-growth-for-the-first-time',
      kind: 'data',
    },
    {
      n: 28,
      label: 'GuruFocus — Palantir price-to-sales ratio',
      url: 'https://www.gurufocus.com/term/ps-ratio/PLTR',
      kind: 'data',
    },
    {
      n: 29,
      label:
        'Macrotrends — Palantir Technologies Price to Sales Ratio 2019-2026 | PLTR',
      url: 'https://www.macrotrends.net/stocks/charts/PLTR/palantir-technologies/price-sales',
      kind: 'data',
    },
    {
      n: 30,
      label: 'stockanalysis.com — Stock Comparison Tool',
      url: 'https://stockanalysis.com/stocks/compare/pltr-vs-nvda-vs-msft-vs-crm-vs-snow/',
      kind: 'data',
    },
    {
      n: 31,
      label: 'GuruFocus — Palantir accounts receivable history',
      url: 'https://www.gurufocus.com/term/accounts-receivable/PLTR',
      kind: 'data',
    },
    {
      n: 32,
      label:
        'GuruFocus — Palantir technologies inc pltr q2 earnings report gaap eps of 041 exceeds estimates revenue hits 1935 billiong',
      url: 'https://www.gurufocus.com/news/8999291/palantir-technologies-inc-pltr-q2-earnings-report-gaap-eps-of-041-exceeds-estimates-revenue-hits-1935-billiongf-score-81100-130-undervalued',
      kind: 'data',
    },
    {
      n: 33,
      label: 'MLQ.ai — Q1 2026 earnings',
      url: 'https://mlq.ai/stocks/PLTR/q1-2026-earnings/',
      kind: 'data',
    },
    {
      n: 34,
      label: 'GuruFocus — market commentary referenced during research',
      url: 'https://www.gurufocus.com/news/9000347/',
      kind: 'data',
    },
    {
      n: 35,
      label:
        'Palantir Q2 2026 earnings call transcript — total RDV $13.1B, customer count 1,049',
      url: 'https://seekingalpha.com/article/4929675-palantir-technologies-inc-pltr-q2-2026-earnings-call-transcript',
      kind: 'analysis',
    },
    {
      n: 36,
      label:
        'CNBC — Palantir stock rises 30% on commercial revenue, AI sovereignty (2026-08-04)',
      url: 'https://www.cnbc.com/2026/08/04/palantir-2q-earnings-ai-sovereign-tools.html',
      kind: 'analysis',
    },
    {
      n: 37,
      label: 'CNBC — Palantir Q2 2026 earnings (2026-08-03)',
      url: 'https://www.cnbc.com/2026/08/03/palantir-pltr-earnings-q2-2026.html',
      kind: 'analysis',
    },
    {
      n: 38,
      label: 'Seeking Alpha — Q2 2026 earnings call presentation',
      url: 'https://seekingalpha.com/article/4929655-palantir-technologies-inc-2026-q2-results-earnings-call-presentation',
      kind: 'analysis',
    },
    {
      n: 39,
      label:
        'TradingKey — earnings preview: 8 straight beats, 40% off its high',
      url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262068882-palantir-pltr-earnings-preview-august-3-2026-options-swing-triangle-tradingkey',
      kind: 'analysis',
    },
    {
      n: 40,
      label: 'TradingKey — surges 15% after Q2 results, guidance raised',
      url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262072328-palantir-q2-earnings-sweep-expectations-stock-surges-15-tradingkey',
      kind: 'analysis',
    },
    {
      n: 41,
      label:
        '24/7 Wall St. — after the blowout, where the stock could head next',
      url: 'https://247wallst.com/investing/2026/08/04/after-palantirs-blowout-earnings-heres-where-the-stock-could-head-next/',
      kind: 'analysis',
    },
    {
      n: 42,
      label: 'TIKR — down 34% from its 52-week high, the path to $212 by 2028',
      url: 'https://www.tikr.com/blog/palantir-stock-is-down-34-from-its-52-week-high-heres-the-path-to-212-by-2028',
      kind: 'analysis',
    },
    {
      n: 43,
      label:
        'StockTitan — Karp Form 4: 397,744 Class A shares sold (2026-05-20)',
      url: 'https://www.stocktitan.net/sec-filings/PLTR/form-4-palantir-technologies-inc-insider-trading-activity-48a8d6e385ad.html',
      kind: 'analysis',
    },
    {
      n: 44,
      label:
        'MarketBeat — Palantir Q2 2026 earnings report (consensus vs actual)',
      url: 'https://www.marketbeat.com/earnings/reports/2026-8-3-palantir-technologies-inc-stock/',
      kind: 'analysis',
    },
    {
      n: 45,
      label: 'Yahoo Finance — what to expect from Palantir’s Q2 2026 report',
      url: 'https://finance.yahoo.com/markets/stocks/articles/expect-palantir-q2-2026-earnings-124258336.html',
      kind: 'analysis',
    },
    {
      n: 46,
      label:
        'AOL / Fortune — Karp on frontier labs wanting to "colonize your enterprise"',
      url: 'https://www.aol.com/articles/palantir-ceo-alex-karp-says-002758000.html',
      kind: 'analysis',
    },
    {
      n: 47,
      label:
        'FinancialContent — sustained insider selling [low-confidence secondary]',
      url: 'https://markets.financialcontent.com/stocks/article/marketminute-2026-3-10-palantir-shares-dip-as-sustained-insider-selling-shadows-dominant-ai-footprint',
      kind: 'analysis',
    },
    {
      n: 48,
      label:
        'Palantir Investor Relations — CEO letters and investor presentations',
      url: 'https://investors.palantir.com',
      kind: 'analysis',
    },
    {
      n: 49,
      label:
        'stockanalysis.com — NVDA statistics (the same-day sales-multiple comparison)',
      url: 'https://stockanalysis.com/stocks/nvda/statistics/',
      kind: 'analysis',
    },
    {
      n: 50,
      label: 'Bdemerson — Palantir vs Databricks: How They Differ',
      url: 'https://www.bdemerson.com/article/palantir-vs-databricks',
      kind: 'analysis',
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
  publishDate: '2026-08-04',
  tags: ['SPCX', 'Starlink', 'AI-infrastructure', 'earnings', 'capex'],
  verdict:
    'Roughly 60% of the AI revenue paying for that build comes from a single customer who was not material three months ago — and a third of the debt behind it is owed to a firm run by one of SpaceX’s own directors.',
  priceStrip: [
    { k: 'IPO · Jun 12', v: '$135.00' },
    { k: 'High · Jun 16', v: '$225.64' },
    { k: 'Close · Aug 4', v: '$125.33', tone: 'bull' },
    { k: 'After hours', v: '$115.98', tone: 'bear' },
    { k: 'Market cap', v: '~$1.65T' },
    { k: 'P/S · Q2 ann.', v: '~53×', tone: 'bear' },
  ],
  summary: `In its first quarter as a public company, SpaceX earned **$7.8 billion** and spent **$18.4 billion** building for the future — $2.35 of capital for every dollar of revenue, almost all of it on AI computing. That is the number that knocked the stock after hours. Underneath it are two things the release does not lead with: roughly 60% of the revenue that computing serves comes from a **single customer** who did not exist on the books three months ago, and a third of the debt funding the build is owed to a firm run by one of SpaceX's own directors.`,
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
  theQuestion: `**Is $18.4B of quarterly capex a land grab into demand that already exists in contract form — or is it a purpose-built campus for one customer?** Customer B went from under 10% of revenue to 19.5% in a single quarter and is ~60% of the AI segment. The prospectus suggests a term through 2029; the risk factors say 90 days' notice. Which of those two sentences turns out to govern is, more or less, the entire investment.`,
  analysis: `## Valuation — no earnings to divide by

At the **$115.98** after-hours print the market values SpaceX near **$1.65T** on ~13.17B shares. There is no P/E: the company lost $541M in the quarter and $9.36B over the trailing year. So every multiple is revenue-based, and they are extreme.

| Multiple | Value | Context |
| --- | --- | --- |
| Price / sales (trailing) | **85.6×** | TTM revenue ~$19.3B |
| **Price / sales (Q2 annualised)** | **~53×** | On $31.3B of run-rate revenue |
| Price / sales (forward) | 32.4× | Implies ~$51B of forward revenue |
| EV / EBITDA | 313.5× | On the *adjusted* measure |
| P/E | n/a | Trailing net loss of $9.36B |

The forward multiple is the telling one: at 32.4× the market already underwrites roughly **$51B of forward revenue**, a 63% increase on the run rate. That is not a sceptical price.

The drawdown cuts both ways. The stock is **48.6% below its $225.64 June high** and **14.1% below the $135 IPO price**, so a great deal of enthusiasm has already gone. It also *rose 9.4%* on the day of the print and gave back 7.5% after hours — the market liked the revenue and disliked the capex, in that order.

## The customer

Note 3 discloses two customers above 10% of revenue. **Customer A at 18.3%** spans all three segments and is long-standing — 20.9%, 24.2% and 25.2% of revenue in 2025, 2024 and 2023, so it predates the cloud business. **Customer B at 19.5%** is new: it cleared 10% in no prior period, relates only to the AI segment, and at ~$1.52B is roughly **95% of the $1.6B of incremental cloud revenue**.

Plainly: **essentially all of the AI segment's growth this quarter came from one counterparty that was not material three months ago.**

It is not a secret — the prospectus describes an Anthropic arrangement of ~325,000 GPUs at ~$1.25B/month running to May 2029, and the CFO named Google and Anthropic on the call, with Google ramping from October. Note 17 lists only Tesla and Valor as related parties, so **the cloud customers are arm's-length** — worth ruling out explicitly, and it is ruled out.

> **The tension the filings don't resolve.** The risk factors say cloud agreements "may be terminated by either party upon **90 days' notice**." The prospectus describes a term running to 2029. Both are SpaceX's own words: the contracted term is long and the cancellation right is short, and only one of them gets tested if the AI capex cycle turns.

## The financing — a director's firm holds a third of the debt

Of $39,364M of total debt, **$13,329M — 33.9% — is owed to Valor Equity Partners**, whose founder, CEO and Chief Investment Officer **Antonio Gracias sits on SpaceX's board**. It comes from three equipment lease agreements for AI hardware (November 2025, January 2026, April 2026, the last through CTC Property LLC), all of which **failed sale-leaseback accounting** — so the assets stay on the balance sheet and the proceeds book as debt. SpaceX guarantees the lessees' payments. The balance nearly **tripled in six months** from $4,507M, and carries **$327M of the quarter's $629M interest expense — 52%**.

None of it is hidden; it is in Notes 9 and 17. The terms are not obviously off-market either: the 10-Q states these arrangements carry an **average fixed rate of 5.9%**, against 5.855% on the public notes.

There is a gap the filing does not reconcile. **$327M of quarterly interest against an average related-party balance near $8.9B annualises to the mid-teens**, not 5.9%. Failed sale-leaseback accounting can produce interest above a stated coupon, so there are innocent explanations — but the filing gives balances, interest and a rate that do not sit together, and does not say why. It is the thing I would most want asked on the next call.

## Risk — each isolated, do not blur

1. **The funding gap (dominant).** −$25.0B of H1 free cash flow against ~$105B of liquidity — roughly 18 months at the Q2 exit rate before the capital markets are needed again. Investment-grade access today is a condition, not a guarantee.
2. **Customer concentration.** 37.8% of revenue in two customers; ~60% of the AI segment in one that appeared this quarter.
3. **The depreciation assumption.** 90% of Adjusted EBITDA is D&A and stock comp, $12.6B of asset is not yet in service, and **the 10-Q publishes no useful-life table**. If GPU lives are shorter than assumed, the adjustment does the damage on the way back.
4. **Starlink unit economics.** ARPU −22% and revenue per subscriber −28% while subscribers doubled. Management cites international mix and cheaper plans; no like-for-like is given, so a price cut in mature markets cannot be ruled out.
5. **The 2027 wall.** $22,244M of the $27,955M of non-cancelable commitments falls in 2027.
6. **Operational and legal.** The NAACP is seeking to enjoin the gas turbines powering Colossus II under the Clean Air Act; separately, class actions over Grok's image generation, with a $354M accrual.

## The lockup — the weakness made the overhang bigger

On **August 6**, up to **911.5M shares** (excluding affiliates) come free — about **1.43× the entire IPO float**, roughly $106B. That much was widely reported and is right.

Less noticed: a second tranche of **455.8M "Additional Release Shares"** was scheduled for the same date, but only if the stock closed 30% above the $135 IPO price (**$175.50**) on five of the ten trading days ending on the earnings date. Over that window the closes ran $108.37 to $118.24. **The best close was 32.6% below the trigger. Zero of ten days qualified.**

So they do not release now. They roll to **December 8 — where up to 797.6M shares come free instead of 328.4M.** The weak share price did not avoid the dilution; it deferred it and made the December block **469M shares larger**. Every figure is an "up to", and the lockup is waivable with Goldman Sachs' written consent.

## Horizon and sizing (kept separate)

**Horizon.** The next 90 days are mechanics rather than fundamentals — the August 6 unlock, the October ramp of the Google agreement, the Cursor close, and a Q3 print showing whether Customer B's revenue is a step or a spike. The thesis resolves over **3–5 years**: does 1.4 GW of compute and a doubling constellation earn returns above a depreciation base compounding faster than revenue?

**Sizing considerations (not a recommendation).** This is the highest-beta expression of the AI-capex cycle — it concentrates an AI-infrastructure basket rather than diversifying it, and adds two risks the others do not carry: a single-customer AI revenue base and a funding requirement returning in ~18 months. Against that, Connectivity is a real, growing, profitable business worth something substantial alone. A position here is not one bet; it is three businesses on one balance sheet, two of which lose money at the operating line.`,
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
  soWhat: `Read the shape of this quarter and you learn what "AI infrastructure" actually means in 2026, because SpaceX is the least disguised version of it.

A rocket company that sells satellite internet spent **$15.8 billion in three months** on GPUs — financed partly by its IPO, partly by a bond issue, partly by lease agreements with a board member's investment firm — so that **AI labs can rent compute from it**. The customers are Anthropic and Google. The batteries come from Tesla. The power comes from mobile gas turbines that are the subject of a Clean Air Act injunction motion.

None of that is about model quality. It is about who can raise a hundred billion dollars and survive the eighteen months before it pays back.

The practical read if you're building rather than investing: **the cheap inference you rent is being funded by an enormous, leveraged bet with a clock on it.** Compute prices right now reflect a capex race, not a cost curve. When you pick a provider, the useful question isn't which benchmark it wins — it's whether that provider is funding the buildout from operating cash flow or from the capital markets, because only one of those keeps its prices when the market closes.`,
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
  method: {
    kind: 'earnings',
    perspectives: [
      {
        role: 'Fundamentals analyst',
        probe:
          'Segment margins, cash generation, and what the operating business actually earned.',
      },
      {
        role: 'Short seller',
        probe: 'What breaks the bull case, and by what mechanism.',
      },
      {
        role: 'Industry engineer',
        probe: 'Whether the technology and the moat are real.',
      },
      {
        role: 'Valuation watcher',
        probe: 'What the price already assumes.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 13,
    claimsVerified: 6,
    verificationScope: 'top-n',
    agentCount: 12,
    runDate: '2026-08-04',
  },
  cardImage: '/images/content/spcx-q2-2026-card-hero.webp',
  cardImageLight: '/images/content/spcx-q2-2026-card-hero-light.webp',
  cardImageAlt: 'SpaceX logo',
  sources: [
    {
      n: 1,
      label: 'SpaceX Q2 2026 earnings release — 8-K Exhibit 99.1 (2026-08-04)',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026052515/earningsreleaseq22608042.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 2,
      label:
        'SpaceX Q2 2026 Form 10-Q — Notes 3, 9, 16, 17 (concentration, debt, obligations, related party)',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026052535/spcx-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 3,
      label:
        'SpaceX IPO prospectus (424B4) — lockup terms and cloud agreements',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001181412&type=424&dateb=&owner=include&count=10',
      primary: true,
      kind: 'filing',
    },
    {
      n: 4,
      label: 'SEC EDGAR — SpaceX filing index',
      url: 'https://data.sec.gov/submissions/CIK0001181412.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 5,
      label: 'SpaceX Form 424B4 filed 2026-06-12',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026042639/spaceexplorationtechnologi.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 6,
      label: 'SpaceX Form 8-K filed 2026-08-04',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026052515/spcx-20260804.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 7,
      label: 'SpaceX Form 8-K filed 2026-06-15',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026043288/spaceexplorationtechnologi.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 8,
      label: 'SpaceX Form FWP filed 2026-06-05',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026041150/spacexagreementfwp.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 9,
      label:
        'stockanalysis.com — Space Exploration Technologies (SPCX) Stock Forecast & Price Targets',
      url: 'https://stockanalysis.com/stocks/spcx/forecast/',
      kind: 'data',
    },
    {
      n: 10,
      label: 'TipRanks — Forecast',
      url: 'https://www.tipranks.com/stocks/spcx/forecast',
      kind: 'data',
    },
    {
      n: 11,
      label: 'GuruFocus — Palantir price-to-sales ratio',
      url: 'https://www.gurufocus.com/term/ps-ratio/PLTR',
      kind: 'data',
    },
    {
      n: 12,
      label: 'GuruFocus — Microsoft price-to-sales ratio',
      url: 'https://www.gurufocus.com/term/ps-ratio/MSFT',
      kind: 'data',
    },
    {
      n: 13,
      label: 'GuruFocus — Alphabet',
      url: 'https://www.gurufocus.com/term/ps/NAS:GOOGL/PS-Ratio/Alphabet',
      kind: 'data',
    },
    {
      n: 14,
      label: 'GuruFocus — Amazon price-to-sales ratio',
      url: 'https://www.gurufocus.com/term/ps-ratio/AMZN',
      kind: 'data',
    },
    {
      n: 15,
      label: 'CompaniesMarketCap — SpaceX (SPCX) - Market capitalization',
      url: 'https://companiesmarketcap.com/spacex/marketcap/',
      kind: 'data',
    },
    {
      n: 16,
      label:
        'CNBC — SpaceX stock drops after first earnings report as AI costs soar',
      url: 'https://www.cnbc.com/2026/08/04/spacex-spcx-earnings-live-updates-q2-2026.html',
      kind: 'analysis',
    },
    {
      n: 17,
      label: 'stockanalysis.com — SPCX price, market cap and multiples',
      url: 'https://stockanalysis.com/stocks/spcx/statistics/',
      kind: 'analysis',
    },
    {
      n: 18,
      label: 'Investing.com — Q2 2026 earnings call transcript',
      url: 'https://ca.investing.com/news/transcripts/earnings-call-transcript-spacex-beats-revenue-estimates-in-q2-2026-shares-swing-93CH-4775805',
      kind: 'analysis',
    },
    {
      n: 19,
      label:
        'TechCrunch — Musk repeatedly one-upped his execs on the first earnings call',
      url: 'https://techcrunch.com/2026/08/04/elon-musk-repeatedly-one-upped-his-execs-on-spacexs-first-earnings-call/',
      kind: 'analysis',
    },
    {
      n: 20,
      label: 'Benzinga — Q2 highlights: revenue +92%, backlog $47.5B',
      url: 'https://www.benzinga.com/markets/earnings/26/08/60931182/spacex-q2-highlights-double-beat-revenue-up-92-backlog-hits-47-5-billion',
      kind: 'analysis',
    },
    {
      n: 21,
      label: 'Investing.com — IPO lockup expiry mechanics and tranches',
      url: 'https://www.investing.com/news/stock-market-news/spacex-ipo-lockup-expiry-123b-in-shares-set-to-unlock-in-early-august-2026-93CH-4796311',
      kind: 'analysis',
    },
    {
      n: 22,
      label: 'Axios — stock falls under IPO price as lockup expirations loom',
      url: 'https://www.axios.com/2026/07/17/spacex-lockup-stock-selloff',
      kind: 'analysis',
    },
    {
      n: 23,
      label: 'CNBC — earnings date set, triggering the first big share unlock',
      url: 'https://www.cnbc.com/2026/07/21/spacex-spcx-earnings-lock-up-expiration.html',
      kind: 'analysis',
    },
    {
      n: 24,
      label:
        'NPR — revenue rises as the once-soaring stock drifts back to Earth',
      url: 'https://www.npr.org/2026/08/04/nx-s1-5918536/spacex-first-earnings-report-since-ipo',
      kind: 'analysis',
    },
    {
      n: 25,
      label: 'Teslarati — first earnings beat while minimizing losses',
      url: 'https://www.teslarati.com/spacex-spcx-q2-2026-earnings-results/',
      kind: 'analysis',
    },
    {
      n: 26,
      label: 'Forbes — what to look for in SpaceX’s first earnings report',
      url: 'https://www.forbes.com/sites/investor-hub/article/spacex-first-earnings-report-what-to-look-out-for/',
      kind: 'analysis',
    },
    {
      n: 27,
      label: 'SpaceX Investor Relations',
      url: 'https://ir.spacex.com',
      kind: 'company',
    },
    {
      n: 28,
      label: 'S21 Q4Cdn — Spacex reports second quarter 2026 results',
      url: 'https://s21.q4cdn.com/184289198/files/doc_financials/2026/q2/SpaceX-Reports-Second-Quarter-2026-Results.pdf',
      kind: 'analysis',
    },
    {
      n: 29,
      label:
        'Yahoo Finance — SpaceX lock-up expiry could release $116 billion worth of shares (NASDAQ:SPCX)',
      url: 'https://finance.yahoo.com/markets/stocks/articles/spacex-lock-expiry-could-release-104117091.html',
      kind: 'analysis',
    },
    {
      n: 30,
      label:
        'Yahoo Finance — SpaceX stock hits new all-time low as AI capex jumps in Q2',
      url: 'https://finance.yahoo.com/technology/article/spacexs-q2-results-top-estimates-but-stock-drops-on-ai-capex-costs-132323178.html',
      kind: 'analysis',
    },
    {
      n: 31,
      label: 'Quartz — Spacex stock market cap decline earnings',
      url: 'https://qz.com/spacex-stock-market-cap-decline-earnings-072826',
      kind: 'analysis',
    },
    {
      n: 32,
      label: 'SpaceX IR — Q2 2026 earnings event details',
      url: 'https://ir.spacex.com/events/event-details/2026/SpaceX-Q2-2026-Earnings/default.aspx',
      kind: 'company',
    },
    {
      n: 33,
      label:
        "SemiAnalysis — xAI's Colossus 2 - First Gigawatt Datacenter In The World, Unique RL Methodology, Capital Raise",
      url: 'https://newsletter.semianalysis.com/p/xais-colossus-2-first-gigawatt-datacenter',
      kind: 'analysis',
    },
    {
      n: 34,
      label: 'Axios — Amazon google microsoft dominate data centers',
      url: 'https://www.axios.com/2026/06/26/amazon-google-microsoft-dominate-data-centers',
      kind: 'analysis',
    },
    {
      n: 35,
      label:
        'Datacenterknowledge — AI-First Hyperscalers: 2026’s Sprint Meets the Power Bottleneck',
      url: 'https://www.datacenterknowledge.com/hyperscalers/hyperscalers-in-2026-what-s-next-for-the-world-s-largest-data-center-operators-',
      kind: 'analysis',
    },
    {
      n: 36,
      label: 'Seeking Alpha — Access to this page has been denied',
      url: 'https://seekingalpha.com/news/4594541-google-amazon-meta-microsoft-could-add-up-to-34-gigawatts-of-compute-by-2027-ms',
      kind: 'analysis',
    },
    {
      n: 37,
      label:
        "Tech Times — Falcon 9 Fills Starlink's V3 Gap as Starship Abort Delays Gigabit Debut",
      url: 'https://www.techtimes.com/articles/321048/20260720/falcon-9-fills-starlinks-v3-gap-starship-abort-delays-gigabit-debut.htm',
      kind: 'analysis',
    },
    {
      n: 38,
      label:
        'Keeptrack Space — Starship 13 Deploys First Starlink V3 Sats, X Report 26 Jul 2026 - KeepTrack',
      url: 'https://keeptrack.space/x-report/spacex-brief-2026-07-26',
      kind: 'analysis',
    },
    {
      n: 39,
      label: 'Starship-Spacex Fandom — Starship flight test 13',
      url: 'https://starship-spacex.fandom.com/wiki/Starship_Flight_Test_13',
      kind: 'analysis',
    },
    {
      n: 40,
      label:
        'Lightreading — 115 MHz off the shelf: What the EchoStar approvals actually mean',
      url: 'https://www.lightreading.com/regulatory-politics/spacex-is-now-a-spectrum-holder-not-just-a-satellite-operator',
      kind: 'analysis',
    },
    {
      n: 41,
      label:
        'Spacenews — FCC approves SpaceX spectrum deal with $2.4 billion escrow condition',
      url: 'https://spacenews.com/fcc-approves-spacex-spectrum-deal-with-2-4-billion-escrow-condition/',
      kind: 'analysis',
    },
    {
      n: 42,
      label:
        'Insidetowers — FCC OKs EchoStar Spectrum Sale, With Conditions - Inside Towers',
      url: 'https://insidetowers.com/fcc-oks-echostar-spectrum-sale-with-conditions/',
      kind: 'analysis',
    },
    {
      n: 43,
      label:
        'Tech Times — SpaceX AI1 Orbital Data Center Bets on Space Power and Cooling: Economics Stay Unproven',
      url: 'https://www.techtimes.com/articles/318103/20260610/spacex-ai1-orbital-data-center-bets-space-power-cooling-economics-stay-unproven.htm',
      kind: 'analysis',
    },
    {
      n: 44,
      label:
        "Tom's Hardware — SpaceX unveils 11-million-square-foot Gigasat factory, a new manufacturing facility for space-based data centers — aims for 1 GW/year of space AI compute by late 2027 from i",
      url: 'https://www.tomshardware.com/tech-industry/big-tech/spacex-unveils-11-million-square-foot-gigasat-factory-a-new-manufacturing-facility-for-space-based-data-centers-aims-for-1-gw-year-of-space-ai-compute-by-late-2027-from-its-satellites',
      kind: 'analysis',
    },
    {
      n: 45,
      label:
        'Useluminix — Data Centers in Space: Feasibility & Economics (Mid-2026)',
      url: 'https://www.useluminix.com/reports/industry-analysis/data-centers-in-space',
      kind: 'analysis',
    },
    {
      n: 46,
      label:
        'Fortune — SpaceX revenue surges to $7.8 billion, blowing past Wall Street expectations by nearly $1 billion',
      url: 'https://fortune.com/2026/08/04/spacex-revenue-surges-92-to-7-8-billion-blowing-past-wall-street-expectations-by-nearly-1-billion/',
      kind: 'analysis',
    },
    {
      n: 47,
      label:
        "TradingKey — SpaceX's Q2 2026 revenue increased by 92% year-over-year, with AI revenue surging by 247%：However, a sharp increase in capital expenditures caused its stock price to fall by mor",
      url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262074436-spacex-q2-revenue-92-percent-ai-income-247-percent-capex-double-stock-drop-tradingkey',
      kind: 'analysis',
    },
    {
      n: 48,
      label: 'Seeking Alpha — Access to this page has been denied',
      url: 'https://seekingalpha.com/news/4625315-spacex-shares-fall-after-ai-spending-surge-overshadows-quarterly-beat',
      kind: 'analysis',
    },
    {
      n: 49,
      label:
        'Dailygazette — Musk’s SpaceX adds billions in debt while cutting interest costs | Tribune',
      url: 'https://www.dailygazette.com/tribune/musk-s-spacex-adds-billions-in-debt-while-cutting-interest-costs/article_eb65e4ea-6dcb-5537-9305-00a1935d4f0b.html',
      kind: 'analysis',
    },
    {
      n: 50,
      label: 'Quartz — Spacex stock ipo price below',
      url: 'https://qz.com/spacex-stock-ipo-price-below-071526',
      kind: 'analysis',
    },
  ],
};

const amdQ2_2026: MarketStormReport = {
  slug: 'amd-q2-2026',
  ticker: 'AMD',
  company: 'Advanced Micro Devices, Inc.',
  title:
    'AMD has promised 16% of itself to two customers at a penny a share — and none of it is in the earnings yet',
  excerpt:
    'Revenue grew 50% to a record $11.5B, Data Center more than doubled, and AMD beat on revenue, EPS and guidance. The stock fell 9% anyway. Underneath: the eye-catching growth rates are measured against a base carrying an $800M charge, $483M of the profit is investment gains, and Note 12 of the 10-Q discloses warrants for 320 million shares — about 16% of the company — issued to OpenAI and Meta at one cent each, none of it in the diluted share count. STORM put four AI agents on the print, then had skeptics try to refute every load-bearing claim against the filings.',
  catalyst: 'Q2 2026 earnings — reported August 4, 2026',
  publishDate: '2026-08-05',
  tags: ['AMD', 'Instinct', 'earnings', 'AI-infrastructure', 'dilution'],
  verdict:
    'A double beat and a raised outlook met a 9% drop, which is usually the market seeing something the release does not lead with. Here there are three such things, and the largest one is not in the income statement at all.',
  priceStrip: [
    { k: 'Price · Aug 5', v: '$487.80' },
    { k: 'After hrs · Aug 4', v: '−8.9%', tone: 'bear' },
    { k: '52-wk change', v: '+175%', tone: 'bull' },
    { k: 'Market cap', v: '~$795B' },
    { k: 'Fwd P/E', v: '44.1×', tone: 'warn' },
    { k: 'Street target', v: '~$579' },
  ],
  summary: `AMD had the best quarter in its history and the stock fell nine percent. Revenue grew 50% to a record $11.5 billion, the Data Center business more than doubled, and the company beat on revenue, profit *and* its forecast for next quarter. That combination usually means the market has noticed something the press release does not put up front. It has: the most striking growth figures are measured against a year-ago quarter that carried an $800 million write-off, a fifth of the pre-tax profit came from investment gains rather than selling chips, and the single largest number in this report is not in the financial statements at all — it is in a footnote.`,
  headlineVsReal: [
    {
      headline:
        'Nothing. This one is not in the release, the slides, or the call — it is **Note 12 of the 10-Q**, filed the following morning.',
      real: 'AMD has issued warrants for **320 million shares — about 16% of the company — to OpenAI and Meta, at an exercise price of one cent**. Total proceeds if every share is exercised: **$3.2 million**.',
      gap: 'None of it has vested, so AMD states verbatim that the warrants "had no impact on the Condensed Consolidated Financial Statements", and they are correspondingly absent from the 1,659M diluted share count that produced the $1.38 EPS. Fully vested, that EPS becomes about **$1.16**. This is not hidden — it is disclosed in the filing and the vesting is genuinely demanding: Instinct purchase milestones of up to 6 GW each, stock-price thresholds escalating to **$600 a share**, and further conditions on top. But the same note says the warrants "will be classified as liabilities until certain conditions for equity classification are met", which makes this deferred cost, not waived cost. **Meta\'s first tranche can vest on shipment of the initial gigawatt — possibly as soon as this quarter.**',
    },
    {
      headline:
        '"Operating income ($M) … Up **1585%**" and "Gross margin … Up **14 ppts**" — printed in AMD\'s own summary table.',
      real: 'About **+199%** and **+3.6 points** against a comparable base. On non-GAAP, +245% becomes about **+82%**.',
      gap: 'Both figures are measured against a Q2 2025 that AMD itself footnotes as carrying **$800M of inventory charges** from the US export controls on MI308. Add it back and the year-ago operating line is +$666M rather than −$134M, which is what makes 1,585% arithmetically possible — it is a percentage change off a negative base. AMD published the ex-charge margin restatement in *last* year\'s release ("approximately 54%") and did not carry it forward into this one. The underlying business is genuinely excellent; the growth rates are the wrong size.',
    },
    {
      headline:
        '"Net income $2,297M … diluted earnings per share **$1.38**", up 156%.',
      real: 'About **$0.98** stripping the investment gains and taxing what is left at the statutory 21%.',
      gap: '**$483M of the $598M "other income" — 81% of it — is gains on long-term investments**, which AMD removes from its own non-GAAP figures. The effective tax rate was **9.8%** (the 10-Q\'s number) against a 21% statutory rate and the 13% AMD itself uses for normalisation. To AMD\'s credit the $1.66 non-GAAP EPS contains **none** of the gain and adds $161M of tax back — the non-GAAP number is the conservative one here, which is not the usual direction of travel.',
    },
  ],
  kpis: [
    {
      label: 'Revenue',
      value: '$11.54B',
      delta: '+50% YoY',
      note: 'A record, and it beat the ~$11.25B consensus.',
      tone: 'bull',
    },
    {
      label: 'Data Center revenue',
      value: '$6.72B',
      delta: '+107% YoY',
      note: '58% of the company; operating margin 31.3%.',
      tone: 'bull',
    },
    {
      label: 'Gaming revenue',
      value: '$779M',
      delta: '▼ 31% YoY',
      note: 'The one segment going backwards, on semi-custom.',
      tone: 'bear',
    },
    {
      label: 'Client & Gaming op. income',
      value: '$582M',
      delta: '▼ 24% on +6% revenue',
      note: 'Margin 21.2% → 15.2%. Negative operating leverage.',
      tone: 'bear',
    },
    {
      label: 'Warrants outstanding',
      value: '320M sh',
      delta: '⚠ ~16% of the company',
      note: 'OpenAI + Meta at $0.01. None vested; none in EPS.',
      tone: 'warn',
    },
    {
      label: 'Investment gains',
      value: '$483M',
      delta: '81% of other income',
      note: '19% of pre-tax profit, from marks not chips.',
      tone: 'warn',
    },
    {
      label: 'Effective tax rate',
      value: '9.8%',
      delta: 'vs 21% statutory',
      note: 'FDDEI and R&D credits; Q1 was 14.8%.',
      tone: 'warn',
    },
    {
      label: 'Q3 guide',
      value: '~$13B',
      delta: '+41% YoY',
      note: 'Above consensus; non-GAAP margin flat at ~56%.',
      tone: 'bull',
    },
  ],
  printTableTitle: 'Q2 2026 — the facts everything hangs on',
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
          '$11,536M',
          '+50%',
          'Record; beat ~$11.25B consensus. Q1 was $10,253M',
        ],
      },
      {
        star: true,
        cells: [
          'GAAP operating income',
          '$1,990M',
          'from $(134)M',
          '⚠ "+1585%" is a change off a negative base',
        ],
      },
      {
        star: true,
        cells: [
          '— same, on a clean base',
          '$1,990M',
          '+199%',
          'Adding back the $800M MI308 charge AMD footnotes',
        ],
      },
      {
        cells: [
          'Non-GAAP operating income',
          '$3,094M',
          '+82% clean',
          'Printed as +245%; base was $897M + $800M',
        ],
      },
      {
        cells: [
          'GAAP gross margin',
          '54%',
          '+3.6 pts clean',
          '⚠ Printed "+14 ppts"; clean base is 50.2%',
        ],
      },
      {
        cells: [
          'Non-GAAP gross margin',
          '56%',
          '+2.5 pts clean',
          'AMD restated FY25 ex-charge as "approximately 54%"',
        ],
      },
      {
        cells: [
          'Other income, net',
          '$598M',
          'from $98M',
          '⚠ $483M of it is long-term investment gains',
        ],
      },
      {
        cells: [
          'Income before taxes',
          '$2,551M',
          '—',
          'Operating is 96% of the $2,068M ex-gain figure',
        ],
      },
      {
        star: true,
        cells: [
          'Income tax provision',
          '$252M',
          '9.8% rate',
          '⚠ vs 21% statutory and AMD’s own 13% normalisation',
        ],
      },
      {
        cells: [
          'GAAP diluted EPS',
          '$1.38',
          'vs $0.54',
          '⚠ ~$0.98 ex-gains at 21%; ~$1.16 if warrants vest',
        ],
      },
      {
        cells: [
          'Non-GAAP diluted EPS',
          '$1.66',
          'vs $0.48',
          'Beat ~$1.55–1.60. Contains none of the gain',
        ],
      },
      {
        star: true,
        cells: [
          '— Data Center',
          '$6,718M',
          '+107%',
          '$2,103M op. income, 31.3% margin, +226% clean',
        ],
      },
      {
        cells: ['— Client', '$3,062M', '+23%', 'Ryzen strength'],
      },
      {
        cells: ['— Gaming', '$779M', '−31%', '⚠ Semi-custom console decline'],
      },
      {
        cells: [
          '— Client & Gaming op. income',
          '$582M',
          '−24%',
          '⚠ Margin 21.2% → 15.2% on rising revenue',
        ],
      },
      {
        cells: [
          '— Embedded',
          '$977M',
          '+19%',
          '$386M op. income, 39.5% margin',
        ],
      },
      {
        star: true,
        cells: [
          'Warrants (10-Q Note 12)',
          '320M sh',
          '$0.01 each',
          '⚠ OpenAI + Meta; none vested; absent from EPS',
        ],
      },
      {
        cells: [
          'Diluted shares',
          '1,659M',
          '—',
          '1,979M if the warrants fully vest',
        ],
      },
      {
        cells: [
          'Q3 2026 outlook',
          '~$13.0B',
          '+41%',
          '±$300M; non-GAAP gross margin ~56%, flat QoQ',
        ],
      },
    ],
  },
  bull: [
    '**Data Center more than doubled to $6.7B** and earned a **31.3% operating margin** — on a clean base that is +226% operating income, which needs no distorted comparison to be extraordinary.',
    '**The beat was across the board:** revenue $11.54B vs ~$11.25B, non-GAAP EPS $1.66 vs ~$1.55–1.60, and a Q3 guide of ~$13B above consensus.',
    '**Non-GAAP is the conservative number here.** It excludes all $483M of investment gains and *adds back* $161M of tax to reach a 13% rate — the opposite of the usual direction, and a point in AMD’s favour on disclosure.',
    '**96% of durable pre-tax income is operating income.** Strip the marks and the earnings are still overwhelmingly from selling chips.',
    '**The customer list is the moat:** Helios is named as deploying at Anthropic, Meta, Microsoft, OpenAI and Oracle. Warrants aside, those are the buyers who matter.',
    '**Embedded quietly earns 39.5% operating margins** on $977M — the highest-margin segment, growing 19%, and almost never discussed.',
  ],
  bear: [
    '**320M warrants at a penny** — about 16% of the company to OpenAI and Meta — sit outside the share count. Fully vested, $1.38 becomes ~$1.16.',
    '**The headline growth rates are the wrong size.** +1,585% is +199% on a comparable base; +14 points of gross margin is +3.6.',
    '**A fifth of pre-tax profit is investment gains**, and the tax rate was 9.8% against a 21% statutory rate.',
    '**Client & Gaming operating income fell 24% while its revenue rose 6%** — margin 21.2% → 15.2%. Negative operating leverage in the segment meant to be ballast.',
    '**The Anthropic deal contributes nothing to FY2026.** "Up to 2 gigawatts", first gigawatt beginning H1 2027, with no disclosed firm minimum, dollar value or cancellation terms.',
    '**Guidance implies no further margin gain** — non-GAAP gross margin flat at ~56% in Q3 even as Data Center mix keeps rising.',
    '**At 44× forward earnings and 12.5× forward sales**, after a 175% year, the price already assumes the doubling continues.',
  ],
  theQuestion: `**Is 16% of the company a fair price for the customer list, or the tell that the customer list had to be bought?** AMD gave OpenAI and Meta warrants over 320 million shares at a cent each, vesting on gigawatt-scale purchase milestones. If the chips are as good as this quarter suggests, that equity was unnecessary and expensive. If they needed the sweetener to displace Nvidia at those two accounts, then the 107% Data Center growth is being purchased in stock — and the bill arrives exactly when the revenue does.`,
  analysis: `## Valuation — the price already owns the second doubling

At **$487.80** the market pays about **$795B** for AMD: **44.1× forward earnings**, **12.5× forward sales**, and 125× trailing. The stock is up **175% in a year**, which is most of why a double beat produced a 9% drop — a beat has to be enormous to move a price that has already moved.

| Multiple (at $487.80) | Value |
| --- | --- |
| Forward P/E | **44.1×** |
| Trailing P/E | 125.2× |
| Price / sales (forward) | 12.5× |
| EV / EBITDA | 82.4× |
| Price / free cash flow | 94.4× |
| 52-week change | **+175%** |

The Street mean target is about **$579**, roughly 19% above the price, in an unusually wide range — UBS at $730, Jefferies $640, Mizuho $625, Wedbush $600, Susquehanna $500, with outliers to $1,250. That dispersion is the honest signal: nobody disputes the Data Center trajectory, and nobody agrees what it is worth.

One thing the multiple does *not* yet price, because it cannot: if the warrants vest, the share count goes from 1,659M to roughly 1,979M. Every per-share figure above is calculated on the smaller number.

## The warrants — the largest number in this report

It is worth stating the mechanics plainly, because this is disclosed rather than hidden and the detail matters.

In **October 2025** AMD issued OpenAI warrants over **160 million shares**. In **February 2026** it issued Meta warrants over another **160 million**. Exercise price: **one cent**. Total proceeds to AMD if every share is exercised: **$3.2 million**, against a stake worth roughly $156B at today's price.

Vesting is genuinely demanding, and three conditions stack: Instinct purchase milestones of **up to 6 GW each**, share-price thresholds escalating to **$600**, and further technical and commercial conditions before exercise. None had vested at 27 June 2026, which is why AMD can state that they "had no impact on the Condensed Consolidated Financial Statements."

Two things follow that cut in opposite directions, and both are true.

**In AMD's favour:** this quarter's growth was *not* bought with the warrants. Volume MI450 and Helios shipments to those two customers begin in the second half, which is precisely why no purchase milestone has vested. The 50% revenue growth and 107% Data Center growth are unencumbered.

**Against:** the same note says the warrants "will be classified as liabilities until certain conditions for equity classification are met." That is deferred cost, not waived cost — and **Meta's first tranche can vest on shipment of the initial gigawatt, which could happen as soon as this quarter.** The equity cost and the warrant-linked revenue arrive together, in future periods, and only one of them is currently in anyone's model.

## Risk — each isolated, do not blur

1. **Dilution timing (the one that is new).** ~16% of the company is contingent on milestones that begin landing in the second half. Every per-share figure quoted today runs on the pre-warrant count.
2. **Comparison-base flattery.** The headline growth rates are 3–8× the comparable figures. That is a presentation problem rather than a business problem, but it sets expectations the business then has to meet.
3. **Client & Gaming going backwards on profit.** Operating income −24% on +6% revenue is the clearest negative signal in the segment table, and Gaming's −31% is a semi-custom cycle AMD does not control.
4. **Earnings quality.** 19% of pre-tax profit from investment marks, at a 9.8% tax rate driven by FDDEI and R&D credits rather than a one-off. Both are reversible.
5. **The Anthropic option.** "Up to 2 GW" with no firm minimum, no disclosed dollar value and no cancellation terms, first deliveries H1 2027, plus AMD committing up to **$5B of its own cash** into Anthropic. Read it as an option, not a backlog.
6. **Supply, not demand.** Guidance holds gross margin flat at ~56% while Data Center mix rises, which usually means Helios ramp costs — a good problem, and still a cap on near-term margin.

## Horizon and sizing (kept separate)

**Horizon.** The next two quarters are unusually legible: Helios volume shipments start, the first warrant tranches can vest, and Q3 is guided to ~$13B. The thesis resolves over **2–3 years** on one question — does AMD hold a genuine second position in AI training silicon, or is it the second source that gets squeezed when supply loosens? Under a year you are trading the multiple, which has already moved 175%.

**Sizing considerations (not a recommendation).** AMD is the highest-beta way to own the same AI-capex cycle as Nvidia without owning Nvidia, so it concentrates rather than diversifies an AI-infrastructure position. It also carries a risk none of the others do: a known, disclosed, contingent 16% dilution whose trigger is *good news*. A position sized on today's EPS is sized on a share count that the company's own success would change.`,
  invalidation: {
    bull: [
      'Warrant tranches vest faster than revenue scales, so the per-share arithmetic deteriorates while the top line still looks strong.',
      'Client & Gaming operating income keeps falling on flat-to-rising revenue — the negative operating leverage is structural, not a cycle.',
      'Non-GAAP gross margin stays flat or slips through 2027 as Helios ramps, showing the rack business is dilutive to margin at scale.',
      'The Anthropic "up to 2 GW" quietly slips or shrinks, confirming it was an option rather than a commitment.',
    ],
    bear: [
      'Data Center holds 100%+ growth for another two quarters with margins near 31%, proving the second source is now a first choice.',
      'A warrant tranche vests *and* the associated revenue lands large enough that the dilution is obviously worth it.',
      'Client & Gaming margin recovers as the semi-custom cycle turns, restoring the ballast.',
      'AMD discloses firm terms on Anthropic — a dollar value, a minimum, a schedule — converting the option into a backlog.',
    ],
  },
  verification: {
    confirmed: 5,
    partlyTrue: 4,
    corrected: 2,
    confirmedNote:
      'Confirmed against AMD’s Q2 2026 8-K Exhibit 99.1 and the Q2 10-Q: revenue $11,536M / +50% and the segment table · GAAP operating income $1,990M against $(134)M · other income $598M with $483M of investment gains stripped in AMD’s own reconciliation · the 9.8% effective tax rate stated in the 10-Q · Note 12’s 320M warrants to OpenAI and Meta at $0.01 with none vested.',
    items: [
      {
        kind: 'corrected',
        title:
          '"Operating income up 1,585%" and "gross margin up 14 points" are not comparable figures',
        text: 'Both are measured against a Q2 2025 carrying **$800M of MI308 export-control charges** that AMD footnotes in the same table. Add it back: operating income growth is **~+199%** (non-GAAP **~+82%**, not +245%) and GAAP gross margin expansion is **~+3.6 points** (50.2% → 53.8%), not 14. The 1,585% figure is a percentage change off a *negative* base, which makes it arithmetically meaningless as a growth rate. AMD published the ex-charge restatement in last year’s release and did not carry it forward.',
      },
      {
        kind: 'corrected',
        title: 'Our own draft: the gigawatt-to-GPU arithmetic was wrong',
        text: 'A first pass converted Anthropic’s "2 gigawatts" at ~140 kW per Helios rack, giving ~790,000–1,030,000 GPUs and $58–75B of hardware. The rack-power input was wrong by roughly 1.76×. The AMD/Schneider Electric co-engineered reference design specifies **up to 246 kW per rack**, and hands-on reporting puts the bus bar at **225–245 kW**. At 72 GPUs per rack the correct range is about **7,300–8,900 racks and 523,000–640,000 GPUs**, or ~$38–47B — and AMD has never defined whether its "gigawatt" means IT load or facility power, so even this is a band.',
      },
      {
        kind: 'partly',
        title: 'The warrants represent "19.3% of the company"',
        text: 'The 320M shares and $0.01 exercise price are confirmed verbatim in Note 12, as is "no impact on the Condensed Consolidated Financial Statements." But 19.3% divides by the *pre-issuance* 1,659M diluted count. Against a post-issuance 1,979M the stake is **~16.2%**, and the EPS effect is $1.38 → **~$1.16** rather than the larger haircut the higher figure implies.',
      },
      {
        kind: 'partly',
        title: 'The Anthropic partnership as evidence of committed demand',
        text: '"Up to 2 gigawatts" with the first gigawatt beginning H1 2027 is confirmed verbatim, as is the absence of any disclosed minimum, dollar value or cancellation right. A structural tell the release does not surface: AMD filed 8-Ks with Item 1.01 (material definitive agreement) **and** Item 3.02 (unregistered equity sales) for the OpenAI and Meta warrants, and filed no equivalent for Anthropic. It contributes **zero FY2026 revenue**.',
      },
      {
        kind: 'partly',
        title: 'The 9.8% effective tax rate as an earnings-quality problem',
        text: 'The rate is confirmed in the 10-Q (9.8% for the quarter, 11.8% for the half; Q1 was 14.8%). But the 10-Q attributes it to **foreign-derived deduction eligible income and R&D tax credits** — recurring structural items, not a discrete one-off. Calling it a one-time flatter would be wrong; calling it durable at 9.8% would also be wrong, since the same drivers produced 14.8% one quarter earlier.',
      },
      {
        kind: 'partly',
        title: 'The "gross margin miss" that drove the after-hours drop',
        text: 'Coverage attributed the 9% fall partly to a margin miss of "54% versus 56% consensus". AMD’s **GAAP** gross margin was 54% and its **non-GAAP** was exactly 56% — and sell-side consensus for AMD gross margin is conventionally non-GAAP. On that basis the quarter met the number rather than missing it, and the comparison circulating is between two different measures.',
      },
    ],
  },
  openQuestions: [
    'What are the exact vesting schedules and stock-price thresholds on each warrant tranche? Note 12 gives the ceiling (6 GW each, escalating to $600) but not the tranche-by-tranche steps — which is what decides whether dilution lands in Q3 2026 or 2029.',
    'What does AMD mean by a "gigawatt" — IT load or facility power? The difference is roughly 240,000 GPUs on the Anthropic deal, and the company has never defined it.',
    'Why did the effective tax rate fall from 14.8% in Q1 to 9.8% in Q2 when the 10-Q attributes both to the same structural drivers? Nothing discrete is disclosed to explain the step.',
    'Is Client & Gaming’s 6-point margin decline the semi-custom cycle or something structural? Revenue rose while operating income fell 24%, and the release does not decompose it.',
  ],
  soWhat: `If you want one lesson from this quarter that applies well beyond AMD, it is this: **when a supplier gives its customers equity, look at what it is buying.**

AMD handed OpenAI and Meta the right to about 16% of the company for a cent a share. Not cash, not a discount — ownership, vesting as they buy gigawatts of chips. That is a company deciding the most valuable thing it can spend is its own stock, in order to be designed into somebody else's AI build.

Read it charitably and it is alignment: the customers only get paid if AMD's chips ship at enormous scale, which means they are motivated to make them succeed. Read it sceptically and it is the cost of being second — Nvidia does not need to hand out warrants to get customers.

The practical read if you are building rather than investing: **the AI chip market has one dominant supplier and a credible second one, and the second one is paying in equity to stay credible.** That is good news for anyone buying compute, because it is what competition looks like before prices move — and it is the clearest evidence yet that the alternatives to the market leader are real enough to be worth subsidising.`,
  throughLine: {
    text: `Anthropic now appears as a counterparty in three of the five reports in this section, which is worth noticing on its own.

Amazon invests up to $25B in it and takes back a $100B+ AWS commitment. SpaceX's single largest AI customer — 19.5% of total company revenue — is almost certainly Anthropic at ~$1.25B a month. And AMD announces up to 2 GW of MI450 for it while committing up to $5B of its own cash back into it.

The same pattern keeps recurring across four very different balance sheets: **the supplier funds the customer, and the customer funds the supplier's growth number.** None of it is improper and all of it is disclosed. But when the same handful of AI labs sit on both sides of the ledger at Amazon, SpaceX and AMD simultaneously, the diversification in an "AI infrastructure basket" is thinner than the ticker count suggests.`,
    links: [
      {
        label: 'SPCX — one customer, 60% of the AI segment',
        slug: 'spcx-q2-2026',
      },
      {
        label: 'AMZN — funding Anthropic, billing Anthropic',
        slug: 'amzn-q2-2026',
      },
      { label: 'PLTR — the one with no capex at all', slug: 'pltr-q2-2026' },
    ],
  },
  method: {
    kind: 'earnings',
    perspectives: [
      {
        role: 'Fundamentals analyst',
        probe:
          'Segment margins, cash generation, and what the operating business actually earned.',
      },
      {
        role: 'Short seller',
        probe: 'What breaks the bull case, and by what mechanism.',
      },
      {
        role: 'Industry engineer',
        probe: 'Whether the technology and the moat are real.',
      },
      {
        role: 'Valuation watcher',
        probe: 'What the price already assumes.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 11,
    claimsVerified: 5,
    verificationScope: 'top-n',
    agentCount: 12,
    runDate: '2026-08-05',
    limitations: [
      'One of the six skeptic agents returned nothing; that claim was checked by hand instead.',
    ],
  },
  cardImage: '/images/content/amd-q2-2026-card-hero.webp',
  cardImageLight: '/images/content/amd-q2-2026-card-hero-light.webp',
  cardImageAlt: 'AMD logo',
  sources: [
    {
      n: 1,
      label: 'AMD Q2 2026 earnings release — 8-K Exhibit 99.1 (2026-08-04)',
      url: 'https://www.sec.gov/Archives/edgar/data/2488/000000248826000121/q22026991.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 2,
      label:
        'AMD Q2 2026 Form 10-Q — Note 12 (Warrants), Note 11, tax and investment disclosures',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000002488&type=10-Q&dateb=&owner=include&count=5',
      primary: true,
      kind: 'filing',
    },
    {
      n: 3,
      label: 'AMD Form 10-Q, period ended 2026-06-27',
      url: 'https://www.sec.gov/Archives/edgar/data/2488/000000248826000123/amd-20260627.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 4,
      label: 'AMD Form 8-K filed 2026-02-23',
      url: 'https://www.sec.gov/Archives/edgar/data/2488/000000248826000045/amd-20260223.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 5,
      label: 'SEC EDGAR — AMD filing index',
      url: 'https://www.sec.gov/Archives/edgar/data/2488/000119312525230895/',
      primary: true,
      kind: 'filing',
    },
    {
      n: 6,
      label: 'AMD Form 8-K filed 2025-08-05',
      url: 'https://www.sec.gov/Archives/edgar/data/2488/000000248825000106/q22025991.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 7,
      label: 'SEC EDGAR — AMD filing index',
      url: 'https://data.sec.gov/submissions/CIK0000002488.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 8,
      label: 'AMD Form 10-Q, period ended 2026-03-28',
      url: 'https://www.sec.gov/Archives/edgar/data/2488/000000248826000076/amd-20260328.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 9,
      label: 'AMD Form 10-K, period ended 2025-12-27',
      url: 'https://www.sec.gov/Archives/edgar/data/2488/000000248826000018/amd-20251227.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 10,
      label:
        'AMD Q2 2025 earnings release — the $800M MI308 charge and the ex-charge margin restatement',
      url: 'https://ir.amd.com/news-events/press-releases/detail/1257/amd-reports-second-quarter-2025-financial-results',
      primary: true,
      kind: 'company',
    },
    {
      n: 11,
      label: 'AMD Investor Relations — Q2 2026 results',
      url: 'https://ir.amd.com/news-events/press-releases/detail/1295/amd-reports-second-quarter-2026-financial-results',
      primary: true,
      kind: 'company',
    },
    {
      n: 12,
      label:
        'AMD Investor Relations — August 5, 2026 - 10-Q: Quarterly report [Sections 13 or 15(d)]',
      url: 'https://ir.amd.com/financial-information/sec-filings/content/0000002488-26-000123/amd-20260627.htm',
      kind: 'company',
    },
    {
      n: 13,
      label:
        'AMD Investor Relations — May 6, 2026 - 10-Q: Quarterly report [Sections 13 or 15(d)]',
      url: 'https://ir.amd.com/financial-information/sec-filings/content/0000002488-26-000076/amd-20260328.htm',
      kind: 'company',
    },
    {
      n: 14,
      label:
        'AMD Investor Relations — February 4, 2026 - 10-K: Annual report [Section 13 and 15(d), not S-K Item 405]',
      url: 'https://ir.amd.com/financial-information/sec-filings/content/0000002488-26-000018/amd-20251227.htm',
      kind: 'company',
    },
    {
      n: 15,
      label:
        'AMD Investor Relations — AMD and Anthropic Announce Strategic Partnership to Deploy Up to 2 Gigawatts of AMD Instinct MI450 Series GPUs :: Advanced Micro Devices, Inc. (AMD)',
      url: 'https://ir.amd.com/news-events/press-releases/detail/1292/amd-and-anthropic-announce-strategic-partnership-to-deploy-up-to-2-gigawatts-of-amd-instinct-mi450-series-gpus',
      kind: 'company',
    },
    {
      n: 16,
      label:
        'AMD Investor Relations — August 6, 2025 - 10-Q: Quarterly report [Sections 13 or 15(d)]',
      url: 'https://ir.amd.com/financial-information/sec-filings/content/0000002488-25-000108/amd-20250628.htm',
      kind: 'company',
    },
    {
      n: 17,
      label: 'AMD — Amd instinct mi455x brochure',
      url: 'https://www.amd.com/content/dam/amd/en/documents/products/accelerators/instinct/amd-instinct-mi455x_brochure.pdf',
      kind: 'company',
    },
    {
      n: 18,
      label: 'AMD — AMD Delivers Breakthrough MLPerf Training 6.0 Results',
      url: 'https://www.amd.com/en/blogs/2026/amd-delivers-breakthrough-mlperf-training-6-0-results.html',
      kind: 'company',
    },
    {
      n: 19,
      label:
        'AMD Investor Relations — AMD and Anthropic Announce Strategic Partnership to Deploy Up to 2 Gigawatts of AMD Instinct MI450 Series GPUs :: Advanced Micro Devices, Inc. (AMD)',
      url: 'https://ir.amd.com/news-events/press-releases/detail/1292/',
      kind: 'company',
    },
    {
      n: 20,
      label:
        'AMD Investor Relations — AMD Reports Second Quarter 2026 Financial Results :: Advanced Micro Devices, Inc. (AMD)',
      url: 'https://ir.amd.com/news-events/press-releases/detail/1295/',
      kind: 'company',
    },
    {
      n: 21,
      label: 'AMD Newsroom — AMD Reports Second Quarter 2026 Earnings',
      url: 'https://newsroom.amd.com/news/amd-2q-2026-earnings/',
      kind: 'company',
    },
    {
      n: 22,
      label:
        'AMD Newsroom — AMD and Anthropic Announce Strategic Partnership to Deploy up to 2 Gigawatts of AMD Instinct MI450 Series GPUs',
      url: 'https://newsroom.amd.com/news/amd-anthropic-strategic-partnership/',
      kind: 'company',
    },
    {
      n: 23,
      label:
        'AMD Investor Relations — AMD and OpenAI Announce Strategic Partnership to Deploy 6 Gigawatts of AMD GPUs :: Advanced Micro Devices, Inc. (AMD)',
      url: 'https://ir.amd.com/news-events/press-releases/detail/1260/amd-and-openai-announce-strategic-partnership-to-deploy-6-gigawatts-of-amd-gpus',
      kind: 'company',
    },
    {
      n: 24,
      label: 'stockanalysis.com — AMD price, market cap and multiples',
      url: 'https://stockanalysis.com/stocks/amd/statistics/',
      kind: 'data',
    },
    {
      n: 25,
      label:
        'stockanalysis.com — Advanced Micro Devices (AMD) Stock Forecast & Price Targets',
      url: 'https://stockanalysis.com/stocks/amd/forecast/',
      kind: 'data',
    },
    {
      n: 26,
      label: 'stockanalysis.com — NVIDIA (NVDA) Statistics & Valuation',
      url: 'https://stockanalysis.com/stocks/nvda/statistics/',
      kind: 'data',
    },
    {
      n: 27,
      label: 'GuruFocus — NVIDIA forward P/E ratio',
      url: 'https://www.gurufocus.com/term/forward-pe-ratio/NVDA',
      kind: 'data',
    },
    {
      n: 28,
      label: 'CompaniesMarketCap — AMD (AMD) - Market capitalization',
      url: 'https://companiesmarketcap.com/amd/marketcap/',
      kind: 'data',
    },
    {
      n: 29,
      label:
        'MLQ.ai — AMD Helios MI455X Rack-Scale Platform Surfaces with 72-GPU Design, UALink-over-Ethernet Interconnect',
      url: 'https://mlq.ai/news/amd-helios-mi455x-rack-scale-platform-surfaces-with-72-gpu-design-ualink-over-ethernet-interconnect/',
      kind: 'data',
    },
    {
      n: 30,
      label: 'CNBC — AMD earnings report Q2 2026',
      url: 'https://www.cnbc.com/2026/08/04/amd-earnings-report-q2-2026.html',
      kind: 'analysis',
    },
    {
      n: 31,
      label: 'Benzinga — stock tumbles nearly 9% after hours despite a Q2 beat',
      url: 'https://www.benzinga.com/markets/tech/26/08/60936941/amd-earnings-stock-after-hours-wall-street-forecast',
      kind: 'analysis',
    },
    {
      n: 32,
      label:
        'Investing.com — Q2 2026 slides: data center revenue doubles, stock falls after hours',
      url: 'https://www.investing.com/news/company-news/amd-q2-2026-slides-data-center-revenue-doubles-stock-falls-after-hours-93CH-4836240',
      kind: 'analysis',
    },
    {
      n: 33,
      label:
        'The Register — Helios hands-on: 225–245 kW bus bar, 72 GPUs per rack',
      url: 'https://www.theregister.com/',
      kind: 'analysis',
    },
    {
      n: 34,
      label:
        'Schneider Electric + AMD — co-engineered Helios reference design (up to 246 kW/rack)',
      url: 'https://www.se.com/us/en/',
      kind: 'analysis',
    },
    {
      n: 35,
      label: 'Benzinga — Wall Street price targets ahead of Q2',
      url: 'https://www.benzinga.com/analyst-stock-ratings/price-target/26/08/60901453/',
      kind: 'analysis',
    },
    {
      n: 36,
      label: 'TIKR — what the stock needed to show after the Anthropic deal',
      url: 'https://www.tikr.com/blog/amd-reports-q2-2026-earnings-august-4-what-the-stock-needs-to-show-after-its-anthropic-deal',
      kind: 'analysis',
    },
    {
      n: 37,
      label: 'StockTitan — full Q2 2026 release tables',
      url: 'https://www.stocktitan.net/news/AMD/amd-reports-second-quarter-2026-financial-s9qsl4zgkkw3.html',
      kind: 'analysis',
    },
    {
      n: 38,
      label: 'AMD Newsroom — Anthropic partnership, up to 2 GW of MI450',
      url: 'https://newsroom.amd.com/',
      kind: 'analysis',
    },
    {
      n: 39,
      label:
        'Globenewswire — Amd reports second quarter 2026 financial results',
      url: 'https://www.globenewswire.com/news-release/2026/08/04/3338848/0/en/AMD-Reports-Second-Quarter-2026-Financial-Results.html',
      kind: 'analysis',
    },
    {
      n: 40,
      label:
        'Yahoo Finance — AMD’s (NASDAQ:AMD) Q2 Sales Top Estimates But Stock Drops',
      url: 'https://finance.yahoo.com/markets/stocks/articles/amd-nasdaq-amd-q2-sales-202412914.html',
      kind: 'analysis',
    },
    {
      n: 41,
      label:
        'Yahoo Finance — AMD tops Q2 earnings estimates and provides strong outlook, but leaves investors unimpressed',
      url: 'https://finance.yahoo.com/technology/article/amd-to-report-q2-earnings-as-chip-stocks-continue-to-waver-110000620.html',
      kind: 'analysis',
    },
    {
      n: 42,
      label: 'Finbold — Analysts update AMD stock price target',
      url: 'https://finbold.com/analysts-update-amd-stock-price-target-2/',
      kind: 'analysis',
    },
    {
      n: 43,
      label:
        'Benzinga — Top wall street forecasters revamp amd expectations ahead of q2 earnings',
      url: 'https://www.benzinga.com/analyst-stock-ratings/price-target/26/08/60901453/top-wall-street-forecasters-revamp-amd-expectations-ahead-of-q2-earnings',
      kind: 'analysis',
    },
    {
      n: 44,
      label:
        'Investing.com — AMD beats Q2 2026 estimates, stock reverses after hours (call transcript)',
      url: 'https://ca.investing.com/news/transcripts/earnings-call-transcript-amd-beats-q2-2026-estimates-stock-reverses-after-hours-93CH-4775912',
      kind: 'analysis',
    },
    {
      n: 45,
      label:
        'CNBC — AMD to invest up to $5B in Anthropic as part of computing power deal',
      url: 'https://www.cnbc.com/2026/07/22/amd-anthropic-ai-chip-investment.html',
      kind: 'analysis',
    },
    {
      n: 46,
      label: 'Chipsandcheese — AMD’s Instinct MI455X: Aiming for the Sun',
      url: 'https://chipsandcheese.com/p/amds-instinct-mi455x-aiming-for-the',
      kind: 'analysis',
    },
    {
      n: 47,
      label:
        'The Register — AMD shines a light on its Helios rack-scale compute platform',
      url: 'https://www.theregister.com/2025/06/12/amd_helios_dc/',
      kind: 'analysis',
    },
    {
      n: 48,
      label:
        'Naddod — Nvidia vera rubin nvl144 next generation high performance computing platform',
      url: 'https://www.naddod.com/blog/nvidia-vera-rubin-nvl144-next-generation-high-performance-computing-platform',
      kind: 'analysis',
    },
    {
      n: 49,
      label:
        "Igorslab De — AMD's MLPerf Training 6.0 Results: Instinct MI355X Performance",
      url: 'https://www.igorslab.de/en/amd-mlperf-training-6-0-instinct-mi355x-approaches-blackwell-scales-multiple-servers/',
      kind: 'analysis',
    },
    {
      n: 50,
      label:
        'Thundercompute — ROCm vs CUDA: GPU Computing Comparison (August 2026)',
      url: 'https://www.thundercompute.com/blog/rocm-vs-cuda-gpu-computing',
      kind: 'analysis',
    },
  ],
};

const crwvQ2_2026: MarketStormReport = {
  slug: 'crwv-q2-2026',
  ticker: 'CRWV',
  company: 'CoreWeave, Inc.',
  title:
    'CoreWeave doubled its revenue and earned less doing it — one line on the income statement explains both',
  excerpt:
    'Revenue grew 112% to $2.58B and the stock rose 14%. But adjusted operating income FELL 36%, from $200M to $128M, and the reason is a single line: depreciation. Strip it out and operating costs grew 94% against 112% revenue — real operating leverage. Put it back and the sign flips. Underneath sits $35.1B of debt at rates up to 15%, interest expense equal to 25% of revenue, and $35.5B of signed leases the company states are not on its balance sheet. STORM put four AI agents on the print, then had skeptics try to refute every load-bearing claim against the 10-Q.',
  catalyst: 'Q2 2026 earnings — reported August 11, 2026',
  publishDate: '2026-08-19',
  tags: ['CRWV', 'AI-infrastructure', 'earnings', 'leverage', 'depreciation'],
  verdict:
    'The market read this as a beat and bid it up 14%. The filing describes a company whose interest bill is a quarter of its revenue, whose debt costs as much as 15%, and which has $35.5 billion of signed leases sitting outside the balance sheet it just reported.',
  priceStrip: [
    { k: 'Price · Aug 19', v: '$90.87' },
    { k: 'On the print', v: '+14%', tone: 'bull' },
    { k: '52-wk change', v: '−6.1%', tone: 'bear' },
    { k: 'Market cap', v: '$50.1B' },
    { k: 'Enterprise value', v: '$96.2B', tone: 'warn' },
    { k: 'Short interest', v: '11.1%', tone: 'bear' },
  ],
  summary: `CoreWeave rents out AI computing power, and business is booming: revenue more than doubled to $2.58 billion and the shares jumped 14%. Yet the company earned *less* profit than a year ago on twice the sales. That sounds impossible, and it has a single, unglamorous explanation — the chips wear out. CoreWeave buys GPUs with borrowed money, and the cost of writing those chips down over their useful life is now growing faster than the revenue they generate. Everything else in this report — the debt, the interest bill, the leases — follows from that one fact.`,
  headlineVsReal: [
    {
      headline:
        '"CoreWeave reached an important inflection point this quarter as our scale began to translate into **expanding operating leverage**." — the CEO, first line of the release.',
      real: 'Adjusted operating income **fell 36%**, from $200M to $128M, while revenue grew 112%. Adjusted EBITDA margin compressed from **62% to 59%**.',
      gap: 'Both can be argued, and the difference is which comparison you use. Sequentially adjusted operating income did improve — $21M in Q1 to $128M in Q2 — which is presumably what the quote means. Year over year it moved the other way. The mechanism is precise: **excluding depreciation, operating expenses grew 94% against revenue\u2019s 112%** — genuine operating leverage. Include the $1,393M of depreciation and amortisation, up 149%, and the sign flips. Depreciation is not a rounding item here; it is the business.',
    },
    {
      headline:
        '"**Adjusted EBITDA $1,510M**, a 59% margin" — the profitability figure that leads the non-GAAP table.',
      real: '**92% of it is a depreciation add-back.** The bridge from the $(626)M net loss adds $1,393M of D&A, $640M of net interest, $165M of stock comp and $62M of tax.',
      gap: 'To CoreWeave\u2019s credit, its *other* non-GAAP measure is the honest one: **adjusted operating income leaves depreciation in**, adding back only stock comp, $1M of acquisition costs and $11M of acquired-intangible amortisation. That is why one measure shows $1.51B of profit and the other shows $128M on the same quarter. The gap between them, $1,382M, is the cost of the chips being used up. And it is going to grow: accumulated depreciation is only **11% of gross PP&E**, and **$11.9B of construction in progress** is not depreciating at all yet.',
    },
    {
      headline:
        '"Revenue backlog **approximately $104 billion**", up 246% year over year.',
      real: 'The GAAP measure inside it, unsatisfied remaining performance obligations, went **$98.8B to $103.7B** in the quarter — **+$4.9B, or +5.0%**.',
      gap: 'The definitions are word-for-word identical across the two consecutive 10-Qs, so the sequential comparison is clean. Against ~$2.52B of revenue recognised from committed contracts, that implies roughly **$7.4B of gross bookings in Q2 — against ~$40B in Q1 2026** and ~$16.6B in Q2 2025. It is the first quarter in six where gross bookings came in below the year-ago quarter. The backlog is real and it is enormous; the growth in it is lumpy and front-loaded, and "+246%" describes a step that mostly happened last quarter.',
    },
  ],
  kpis: [
    {
      label: 'Revenue',
      value: '$2.58B',
      delta: '+112% YoY',
      note: 'Beat ~$2.56B consensus; the stock rose 14%.',
      tone: 'bull',
    },
    {
      label: 'Adjusted operating income',
      value: '$128M',
      delta: '\u25bc 36% YoY',
      note: 'Fell while revenue doubled. Depreciation-inclusive.',
      tone: 'bear',
    },
    {
      label: 'Operating income (GAAP)',
      value: '$(49)M',
      delta: 'from +$19M',
      note: 'Went negative. Margin (2)% against 2%.',
      tone: 'bear',
    },
    {
      label: 'Interest expense, net',
      value: '$640M',
      delta: '25% of revenue',
      note: 'Up 140%. Already net of $79M capitalised.',
      tone: 'bear',
    },
    {
      label: 'Depreciation & amortisation',
      value: '$1.39B',
      delta: '+149% YoY',
      note: '92% of Adjusted EBITDA. Growing faster than revenue.',
      tone: 'warn',
    },
    {
      label: 'Total debt',
      value: '$35.1B',
      delta: 'vs $5.0B equity',
      note: '89.6% recourse to CoreWeave, Inc. Rates to 15%.',
      tone: 'bear',
    },
    {
      label: 'Leases not yet commenced',
      value: '$35.5B',
      delta: '\u26a0 off balance sheet',
      note: 'Company\u2019s own words. Commencing 2026\u20132029.',
      tone: 'warn',
    },
    {
      label: 'Active power',
      value: '1.5 GW',
      delta: '+~500 MW in Q2',
      note: '3.7 GW contracted; >1.85 GW targeted by year end.',
      tone: 'bull',
    },
  ],
  printTableTitle: 'Q2 2026 — the facts everything hangs on',
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
          '$2,575M',
          '+112%',
          'From $1,212M. Beat ~$2.56B consensus',
        ],
      },
      {
        cells: [
          'Cost of revenue',
          '$879M',
          '34% of rev',
          '\u26a0 Was 26% \u2014 an 8-point deterioration',
        ],
      },
      {
        cells: [
          'Technology & infrastructure',
          '$1,507M',
          'from $670M',
          'Where most depreciation sits',
        ],
      },
      {
        star: true,
        cells: [
          'Operating income (loss)',
          '$(49)M',
          'from +$19M',
          '\u26a0 Went negative on doubled revenue',
        ],
      },
      {
        star: true,
        cells: [
          'Interest expense, net',
          '$(640)M',
          'from $(267)M',
          '\u26a0 25% of revenue; net of $79M capitalised',
        ],
      },
      {
        cells: ['Other income, net', '$125M', 'from $6M', 'Not operating'],
      },
      {
        cells: [
          'Loss before income taxes',
          '$(564)M',
          'from $(242)M',
          '\u2014',
        ],
      },
      {
        cells: [
          'Provision for income taxes',
          '$62M',
          'on a pre-tax loss',
          'Valuation allowance on US deferred tax assets',
        ],
      },
      {
        cells: [
          'Net loss / per share',
          '$(626)M / $(1.14)',
          'from $(290)M',
          'On 551M weighted shares',
        ],
      },
      {
        star: true,
        cells: [
          'Adjusted operating income',
          '$128M',
          '\u25bc from $200M',
          '\u26a0 Depreciation-inclusive. Margin 16% \u2192 5%',
        ],
      },
      {
        cells: [
          'Adjusted EBITDA',
          '$1,510M',
          '59% margin',
          'Was 62%. 92% of it is the D&A add-back',
        ],
      },
      {
        cells: [
          'D&A on property & equipment',
          '$1,382M',
          '+149%',
          'Against 112% revenue growth',
        ],
      },
      {
        cells: [
          'Gross PP&E / accumulated dep.',
          '$52.6B / $(5.9)B',
          '11% depreciated',
          'A young fleet \u2014 D&A accelerates from here',
        ],
      },
      {
        star: true,
        cells: [
          'Construction in progress',
          '$11,918M',
          '23% of gross PP&E',
          '\u26a0 Earning nothing, depreciating nothing \u2014 yet',
        ],
      },
      {
        cells: [
          'Total debt (carrying)',
          '$35,068M',
          'vs $5,024M equity',
          '\u26a0 89.6% recourse; $10.6B matures inside 18 months',
        ],
      },
      {
        star: true,
        cells: [
          'Leases not yet commenced',
          '$35,500M',
          'off-balance-sheet',
          '\u26a0 Excludes 393 MW capped at $14.7B and 355 MW more',
        ],
      },
      {
        cells: [
          'Unsatisfied RPO',
          '$103.7B',
          '+5.0% QoQ',
          'From $98.8B. Backlog quoted as ~$104B',
        ],
      },
      {
        cells: [
          'Q2 operating cash flow',
          '+$679M',
          'from $(251)M',
          'Against $(7,166)M of investing outflow',
        ],
      },
      {
        cells: [
          'Q2 debt issued / repaid',
          '$13,457M / $(3,884)M',
          '\u2014',
          'Financing supplied $10,071M in the quarter',
        ],
      },
      {
        cells: [
          'FY2026 guidance',
          '$12.4\u201313.2B',
          'capex $35\u201339B',
          '\u26a0 Capex ~2.9\u00d7 revenue; adj. op. income $960M\u2013$1.15B',
        ],
      },
    ],
  },
  bull: [
    '**Revenue grew 112% to $2.58B** and beat consensus, on a backlog of roughly $104B that the filings support as real rather than padded.',
    '**Strip depreciation and the operating leverage is genuine:** operating expenses grew 94% against 112% revenue growth. The underlying business scales.',
    '**Operating cash flow turned positive** — +$679M in the quarter against $(251)M a year ago, and +$3,663M across the half.',
    '**Adjusted operating income is the conservative measure and CoreWeave leads with it anyway.** It leaves $1,382M of depreciation in, which most companies in this position would have found a way to add back.',
    '**The six-year depreciable life is at the hyperscaler norm**, not beyond it — Alphabet uses six years, Microsoft two to six, Amazon five to six. This is not an aggressive assumption.',
    '**Physical delivery is real:** active power up ~500 MW to 1.5 GW in a quarter, 3.7 GW contracted, and the first bring-up of NVIDIA Vera Rubin NVL72 in the industry.',
    '**A 25% price increase across SKUs in July** — imposed into this demand environment, which is not something a commodity supplier can do.',
  ],
  bear: [
    '**Adjusted operating income fell 36% while revenue doubled.** Depreciation is growing faster than the revenue the depreciating assets produce.',
    '**Interest expense is 25% of revenue.** Coverage on adjusted operating income is **0.20\u00d7**; on GAAP operating income it is **negative**, and the gap widens in the Q3 guide.',
    '**$35.1B of debt against $5.0B of equity**, 89.6% recourse to the parent, at rates running to **15%**, with **$10.6B maturing inside 18 months** against $5.5B of cash.',
    '**$35.5B of signed leases sit off the balance sheet** by the company\u2019s own statement — and that figure excludes a site capped at **$14.7B** over sixteen years plus 355 MW more.',
    '**Depreciation has years of acceleration ahead:** the fleet is only 11% depreciated and $11.9B of construction in progress has not started yet.',
    '**Gross bookings decelerated hard** — roughly $7.4B in Q2 against ~$40B in Q1, the first quarter in six below its year-ago comparison.',
    '**Cost of revenue went from 26% to 34% of revenue** — unit costs are scaling faster than price.',
  ],
  theQuestion: `**Is depreciation a real cost here, or an accounting artefact that a long-lived asset outruns?** Everything turns on it. If a GPU bought today is still earning in six years, CoreWeave is a capital-intensive business with genuine 94%-versus-112% operating leverage and a $104B backlog to fill. If AI silicon is economically obsolete in three, then the depreciation line is not conservative enough, the $35.1B of debt was borrowed against assets that decay faster than they amortise, and the interest bill arrives regardless. The six-year life is at the industry norm — but Amazon looked at the same question in 2025 and moved its own estimate the other way.`,
  analysis: `## Valuation \u2014 the market cap is not the price

At **$90.87** CoreWeave\u2019s equity is worth **$50.1B**. Its **enterprise value is $96.2B** \u2014 nearly double, because the debt is roughly half the enterprise. Any multiple quoted on market cap alone describes a levered slice rather than the business.

| Multiple | Value |
| --- | --- |
| Price / sales (forward) | 2.6\u00d7 |
| **EV / sales (trailing)** | **12.7\u00d7** |
| EV / adjusted EBITDA | 25.4\u00d7 |
| Price / book | 10.0\u00d7 |
| Net cash position | **\u2212$46.0B** |
| Short interest | **11.1% of shares** |

That first pair is the whole valuation argument in two rows. On the equity, CoreWeave looks like a cheap hypergrowth name at 2.6\u00d7 forward sales. On the enterprise, it is at 12.7\u00d7 trailing sales with $51.6B of total debt and negative $13.66B of trailing free cash flow.

Two facts sit oddly together and both are true: the stock rose **14%** on this print, and it is **down 6.1% over 52 weeks** in which revenue more than doubled. Short interest is **11.1% of shares outstanding** \u2014 by a wide margin the most-shorted name this section has covered. The sell-side average target is $143.26. Nobody is neutral on this one.

## The depreciation question, which is the whole report

CoreWeave charged **$1,393M of depreciation and amortisation** this quarter, up **149%** against 112% revenue growth. That single line does three things at once.

It is **92% of Adjusted EBITDA** \u2014 the $1,510M figure is the $(626)M net loss plus D&A, interest, stock comp and tax. It is **99.2% inside adjusted operating income**, which is why that measure reads $128M rather than $1.5B, and why it fell 36%. And it is **the thing that flips the sign on operating leverage**: excluding it, operating expenses grew 94% against 112% revenue; including it, the company posted a $(49)M operating loss.

The forward path is worse before it is better, for two disclosed reasons. Accumulated depreciation is **$5.9B against $52.6B of gross PP&E \u2014 11%**. On a six-year life that is a young fleet with most of its depreciation ahead of it. And **$11.9B of construction in progress**, 23% of gross PP&E, is currently earning nothing and depreciating nothing; when it lands it hits the income statement with no grace period.

> **The correction our own skeptic pass insisted on.** A first draft called the six-year life "unusually aggressive." It is not. Alphabet depreciates servers and network equipment generally over six years, Microsoft states two to six, Amazon five to six. CoreWeave is at the norm. What is true is that **Amazon moved the other way** \u2014 cutting a subset of servers from six years to five effective January 2025, citing "the increased pace of technology development, particularly in the area of artificial intelligence and machine learning," at a cost of $1.4B in extra depreciation. One large buyer of the same equipment concluded it wears out faster than six years.

## The capital structure

**$35,068M of debt against $5,024M of equity.** Of that, **89.6% is recourse** \u2014 a direct obligation of, or unconditionally guaranteed by, CoreWeave, Inc. Only $3,663M is non-recourse.

The rates are the part that does not appear in any summary: the first delayed-draw term loan carries **15%**, the Magnetar facility 12%, recourse OEM arrangements 11%, and four of the five senior notes 10%. **$10.6B matures inside roughly eighteen months** against $5.5B of unrestricted cash. Since quarter-end the company has added a $2.6B facility at SOFR+5.5% and drawn $1.2B on its revolver.

> **A distinction worth keeping straight, because the skeptic pass corrected us on it.** "Low non-recourse debt" is not the same as "no ring-fencing." Note 10 discloses that beyond the non-recourse facility, further borrowings sit in **bankruptcy-remote special-purpose subsidiaries** whose assets "may be used only to settle the obligations of those entities" \u2014 covering **$18.2B** of non-current debt. There is a great deal of structural separation here. It simply runs alongside a parent guarantee rather than instead of one.

Then the item that is not on the balance sheet at all. Note 8 discloses **$35.5B of estimated future undiscounted payments on leases that have been executed but had not commenced** at 30 June, running 2026\u20132029 on seven-to-sixteen-year terms. CoreWeave states plainly that these "were not included in our condensed consolidated balance sheet." That figure **excludes** two cost-plus arrangements: one site with 393 MW still undelivered, capped at **$14.7B over sixteen years**, and others with 355 MW undelivered.

So the obligations are roughly $35.1B on the balance sheet and $35.5B more beside it, against $5.0B of equity.

## Risk \u2014 each isolated, do not blur

1. **Interest against profit (dominant).** $640M of quarterly interest against $128M of adjusted operating income is 0.20\u00d7 coverage, and negative on GAAP. Q3 guidance pairs $200\u2013260M of adjusted operating income against $860\u2013940M of interest \u2014 the gap widens in dollars, not narrows.
2. **The depreciation assumption.** Six years is the norm; if AI silicon is economically obsolete sooner, the charge is understated and the debt was raised against faster-decaying collateral.
3. **Refinancing.** $10.6B due inside eighteen months against $5.5B of cash, at a company whose existing paper runs to 15%. This works while capital markets stay open.
4. **The off-balance-sheet leases.** $35.5B commencing over four years, plus capped arrangements excluded from it.
5. **Bookings deceleration.** ~$7.4B of gross bookings in Q2 against ~$40B in Q1. One quarter is not a trend, and it is the first below its year-ago comparison in six.
6. **Unit costs.** Cost of revenue 26% \u2192 34% of revenue. The 25% July price increase reads partly as pass-through rather than pure pricing power.
7. **Concentration and counterparties.** The customer roster is a handful of AI labs and hyperscalers whose own capex plans set CoreWeave\u2019s revenue.

## Horizon and sizing (kept separate)

**Horizon.** The next two quarters are about mechanics: whether the July price increase holds, whether Q3 bookings recover from ~$7.4B, and whether the $10.6B of near maturities refinances at better than 15%. The thesis resolves over **3\u20135 years** on the depreciation question \u2014 does a GPU bought in 2026 still earn in 2032?

**Sizing considerations (not a recommendation).** This is the most levered expression of the AI-capex cycle in this section, and leverage cuts both ways: the equity is a thin slice on top of a large, expensive, largely recourse debt stack, which is why the stock can rise 14% on a print and still be down over a year of doubling revenue. An 11% short interest means the price carries mechanical squeeze risk in both directions that has nothing to do with the filings. Position size here is a statement about the capital markets staying open, not only about AI demand.`,
  invalidation: {
    bull: [
      'Adjusted operating income falls again year over year in Q3 \u2014 confirming depreciation is outrunning the revenue it produces rather than a single quarter\u2019s timing.',
      'Gross bookings stay near $7B for a second and third quarter, turning a lumpy backlog into a decelerating one.',
      'The $10.6B of near maturities refinances at or above current rates, showing the capital markets repricing the credit rather than rewarding the growth.',
      'Cost of revenue keeps climbing past 34% of revenue, showing the July price increase was pass-through and did not stick.',
    ],
    bear: [
      'Adjusted operating income turns positive year over year while revenue growth stays above 80% \u2014 depreciation stops outrunning it.',
      'A large refinancing lands materially inside 10%, repricing the whole stack and turning the interest line from a ceiling into a tailwind.',
      'Bookings re-accelerate toward Q1\u2019s ~$40B, showing Q2 was a gap between large contracts rather than a slowdown.',
      'Free cash flow inflects as construction in progress converts to revenue-earning capacity and capex normalises off the $35\u201339B guide.',
    ],
  },
  verification: {
    confirmed: 5,
    partlyTrue: 5,
    corrected: 2,
    confirmedNote:
      'Confirmed against CoreWeave\u2019s Q2 2026 8-K Exhibit 99.1 and the Q2 10-Q: revenue $2,575M / +112% with a $(49)M operating loss \u00b7 interest expense net $640M and the $62M tax provision on a pre-tax loss \u00b7 the adjusted-operating-income bridge, which adds back no depreciation \u00b7 $35,068M of debt against $5,024M of equity, 89.6% recourse \u00b7 Note 8\u2019s $35.5B of executed-but-not-commenced leases stated as off the balance sheet.',
    items: [
      {
        kind: 'corrected',
        title:
          'Our own draft: the six-year depreciable life is not "unusually aggressive"',
        text: 'A first pass framed CoreWeave\u2019s six-year life on technology equipment as an outlier. It is the norm: **Alphabet** depreciates servers and network equipment generally over six years, **Microsoft** states two to six, **Amazon** five to six. The genuinely notable fact is the opposite of the one drafted \u2014 **Amazon moved from six years to five** for a subset of servers effective January 2025, citing "the increased pace of technology development, particularly in the area of artificial intelligence and machine learning", at a cost of $1.4B in additional depreciation. CoreWeave did extend its own estimate from five to six years effective January 2023, which is a real lever; it just lands it at the industry standard rather than past it.',
      },
      {
        kind: 'corrected',
        title:
          'Our own draft: "almost no ring-fencing in the capital structure" was wrong',
        text: 'The recourse arithmetic is right \u2014 89.6% of the $35,068M is a direct or guaranteed obligation of CoreWeave, Inc. But low non-recourse debt is not the same as no ring-fencing, and Note 10 refutes the stronger claim directly: beyond the non-recourse facility, further borrowings sit in **bankruptcy-remote special-purpose consolidated subsidiaries** whose assets "may be used only to settle the obligations of those entities", covering **$18.2B** of non-current debt. Structural separation and parent recourse coexist here.',
      },
      {
        kind: 'partly',
        title: '"Expanding operating leverage"',
        text: 'Defensible **sequentially** \u2014 adjusted operating income went $21M in Q1 to $128M in Q2. Year over year it fell 36% while revenue grew 112%, and adjusted EBITDA margin compressed 62% \u2192 59%. The mechanism is exact: excluding depreciation, operating expenses grew 94% against 112% revenue growth; including it, the sign flips. The quote is a sequential claim standing next to annual comparisons.',
      },
      {
        kind: 'partly',
        title: 'Interest coverage, and one figure not to repeat',
        text: '$128M of adjusted operating income against $640M of interest is **0.20\u00d7**, and that flatters it \u2014 GAAP operating income was $(49)M, so coverage is negative, and the $640M is already net of $79M of capitalised interest. But a tempting shorthand is arithmetically false and we cut it: FY2026 adjusted operating income guidance of **$960M\u2013$1.15B is larger** than the $860\u2013940M of Q3 interest, not smaller. The honest version is that the gap widens in dollars \u2014 $512M in Q2, ~$670M guided for Q3.',
      },
      {
        kind: 'partly',
        title: 'The $104B backlog',
        text: 'Real, and larger than the GAAP measure by design. Unsatisfied RPO went **$98.8B \u2192 $103.7B**, +5.0% sequentially, under a definition word-for-word identical across consecutive 10-Qs. Implied gross bookings of roughly **$7.4B in Q2** against ~$40B in Q1 2026 and ~$16.6B in Q2 2025 \u2014 the first quarter in six below its year-ago figure. "Up 246% year over year" is accurate and describes a step that mostly happened in Q1.',
      },
      {
        kind: 'partly',
        title: 'The $62M tax provision on a $(564)M pre-tax loss',
        text: 'Not an anomaly and not a one-off. Note 12 states effective rates of **(11)% and (20)%** and explains that CoreWeave "recorded income tax expense in all periods presented despite experiencing losses before income taxes primarily due to limitations on the Company\u2019s ability to realize certain tax benefits, which has resulted in the Company maintaining a valuation allowance on its U.S. deferred tax assets." It owes cash tax in profitable jurisdictions while barred from booking a benefit on US losses \u2014 a position that says something about expected near-term US profitability.',
      },
      {
        kind: 'partly',
        title: 'Adjusted EBITDA as a profitability measure',
        text: '$1,510M at a 59% margin, and **92% of it is the depreciation add-back**. The margin also compressed from 62%. The measure is not wrong \u2014 it is a cash-proximate figure for a business with real cash costs below the D&A line \u2014 but at a company whose entire question is whether its assets decay faster than they amortise, adding back the amortisation is adding back the question.',
      },
    ],
  },
  openQuestions: [
    'What is the economic life of an AI GPU? CoreWeave says six years and sits at the industry norm; Amazon moved a subset to five in 2025 citing the pace of AI development. Nothing in either filing settles which is right, and the entire thesis turns on it.',
    'What does the $11.9B of construction in progress do to the depreciation run-rate when it lands? The filings give the balance but no schedule for when it enters service.',
    'Why did gross bookings fall to roughly $7.4B in Q2 from about $40B in Q1? Lumpy contracting is the benign explanation and the likely one, but neither the release nor the call decomposes it.',
    'At what rate does the $10.6B of near-term maturities refinance? Existing paper runs from 10% to 15%, and nothing yet shows where the marginal dollar prices.',
  ],
  soWhat: `There is a question underneath this quarter that matters to anyone renting AI computing power, which is now almost everyone building with it: **how long does a GPU last?**

CoreWeave says six years. It borrowed roughly $35 billion against that answer, and it charges about $1.4 billion a quarter to write the chips down. If six years is right, the economics work and the depreciation is just the accounting catching up with a business that scales. If the real answer is three or four \u2014 because each new generation is dramatically faster per dollar and per watt \u2014 then the charge is too small, the assets behind the debt decay quicker than the loans amortise, and the interest bill arrives anyway.

Nobody actually knows yet. The industry has never run a full replacement cycle on this class of hardware. Amazon looked at the question in 2025 and shortened its own estimate; Alphabet and Microsoft have not.

The practical read: **the price you pay for AI compute today is set by somebody\u2019s assumption about how long their hardware lasts.** When that assumption tightens across the industry, rented compute gets more expensive \u2014 and it will tighten first at whoever is most levered to being wrong.`,
  throughLine: {
    text: `Six reports in, this section has been circling one question in different costumes, and CoreWeave asks it most directly: **how much of the future is being paid for today, and what happens if the assets do not last as long as the financing?**

Ranked by capital spending against revenue, the six line up cleanly \u2014 Palantir at 0.75%, Microsoft around 32%, Amazon at roughly 105% of operating cash flow, SpaceX at 235%, and CoreWeave\u2019s guided $35\u201339B against $12.4\u201313.2B of revenue at roughly **290%**. AMD sits outside that scale entirely: it sells the chips the other five are buying, and pays for its customers in warrants rather than capex.

What makes CoreWeave the clarifying case is that it has none of the others\u2019 shock absorbers. No advertising business, no cloud franchise, no software margin, no $100B of cash \u2014 just the assets, the debt, and the depreciation schedule sitting between them.`,
    links: [
      { label: 'SPCX \u2014 capex at 235% of revenue', slug: 'spcx-q2-2026' },
      {
        label: 'MSFT \u2014 the capex that moved off the line',
        slug: 'msft-q4-fy2026',
      },
      {
        label: 'PLTR \u2014 the one with no capex at all',
        slug: 'pltr-q2-2026',
      },
    ],
  },
  method: {
    kind: 'earnings',
    perspectives: [
      {
        role: 'Fundamentals analyst',
        probe:
          'Segment margins, cash generation, and what the operating business actually earned.',
      },
      {
        role: 'Short seller',
        probe: 'What breaks the bull case, and by what mechanism.',
      },
      {
        role: 'Industry engineer',
        probe: 'Whether the technology and the moat are real.',
      },
      {
        role: 'Valuation watcher',
        probe: 'What the price already assumes.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 12,
    claimsVerified: 6,
    verificationScope: 'top-n',
    agentCount: 12,
    runDate: '2026-08-19',
  },
  cardImage: '/images/content/crwv-q2-2026-card-hero.webp',
  cardImageLight: '/images/content/crwv-q2-2026-card-hero-light.webp',
  cardImageAlt: 'CoreWeave logo',
  sources: [
    {
      n: 1,
      label:
        'CoreWeave Q2 2026 earnings release \\u2014 8-K Exhibit 99.1 (2026-08-11)',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000362/coreweave2q26earningspress.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 2,
      label:
        'CoreWeave Q2 2026 Form 10-Q \\u2014 Notes 2, 8, 10 and 12 (RPO, leases not yet commenced, debt, tax)',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000366/crwv-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 3,
      label:
        'CoreWeave FY2025 Form 10-K \\u2014 useful-life policy and the 2023 five-to-six-year change',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000104/crwv-20251231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 4,
      label: 'CoreWeave Q1 2026 Form 10-Q \\u2014 the $98.8B RPO comparison',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001769628&type=10-Q&dateb=&owner=include&count=6',
      primary: true,
      kind: 'filing',
    },
    {
      n: 5,
      label:
        'Amazon FY2025 Form 10-K \\u2014 the six-to-five-year server life change',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001018724&type=10-K&dateb=&owner=include&count=5',
      primary: true,
      kind: 'filing',
    },
    {
      n: 6,
      label: 'Nebius Form 6-K Exhibit 99.1 (earnings release) filed 2026-08-12',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926094568/tm2622968d1_ex99-1.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 7,
      label: 'SEC EDGAR — CoreWeave filing index',
      url: 'https://data.sec.gov/api/xbrl/companyconcept/CIK0001769628/us-gaap/RevenueRemainingPerformanceObligation.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 8,
      label: 'CoreWeave Form 8-K filed 2025-09-09',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962825000047/crwv-20250909.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 9,
      label: 'Amazon Form 10-K, period ended 2025-12-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 10,
      label:
        'CoreWeave Form 8-K Exhibit 99.1 (earnings release) filed 2026-08-07',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000357/ex991pr.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 11,
      label: 'Alphabet Form 10-K, period ended 2025-12-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 12,
      label: 'Microsoft Form 10-K, period ended 2026-06-30',
      url: 'https://www.sec.gov/Archives/edgar/data/789019/000119312526323660/msft-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 13,
      label: 'Nebius Form 6-K Exhibit 99.1 (earnings release) filed 2026-03-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926064092/nbis-20260331xex99d1.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 14,
      label: 'CoreWeave Form 10-Q, period ended 2026-03-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000222/crwv-20260331.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 15,
      label: 'CoreWeave Form 8-K filed 2026-05-07',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000220/coreweave1q26earningspress.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 16,
      label: 'CoreWeave Form 8-K filed 2025-08-12',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962825000039/coreweave2q25earningspress.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 17,
      label: 'CoreWeave Form 8-K filed 2025-11-10',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962825000059/coreweave3q25earningspress.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 18,
      label: 'CoreWeave Form 8-K filed 2026-02-26',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000094/coreweave4q25earningspress.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 19,
      label: 'CoreWeave Investor Relations \\u2014 Q2 2026 results',
      url: 'https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Second-Quarter-2026-Results/default.aspx',
      kind: 'company',
    },
    {
      n: 20,
      label:
        'CoreWeave IR — Q2 2026 earnings call, corrected transcript (11 August 2026, PDF)',
      url: 'https://s205.q4cdn.com/133937190/files/doc_financials/2026/q2/CRWV-US-CORRECTED-TRANSCRIPT-CoreWeave-Q2-2026-Earnings-Call-11August2026.pdf',
      kind: 'company',
    },
    {
      n: 21,
      label: 'CoreWeave IR — 2026 03 ddtl 4 overview',
      url: 'https://s205.q4cdn.com/133937190/files/doc_presentations/2026/Mar/2026-03-DDTL-4-Overview.pdf',
      kind: 'company',
    },
    {
      n: 22,
      label:
        'stockanalysis.com \\u2014 CRWV price, enterprise value and short interest',
      url: 'https://stockanalysis.com/stocks/crwv/statistics/',
      kind: 'data',
    },
    {
      n: 23,
      label: 'stockanalysis.com — CoreWeave (CRWV) Stock Price & Overview',
      url: 'https://stockanalysis.com/stocks/crwv/',
      kind: 'data',
    },
    {
      n: 24,
      label: 'stockanalysis.com — Nebius Group (NBIS) Statistics & Valuation',
      url: 'https://stockanalysis.com/stocks/nbis/statistics/',
      kind: 'data',
    },
    {
      n: 25,
      label: 'stockanalysis.com — NVIDIA (NVDA) Statistics & Valuation',
      url: 'https://stockanalysis.com/stocks/nvda/statistics/',
      kind: 'data',
    },
    {
      n: 26,
      label: 'stockanalysis.com — Microsoft (MSFT) Statistics & Valuation',
      url: 'https://stockanalysis.com/stocks/msft/statistics/',
      kind: 'data',
    },
    {
      n: 27,
      label: 'stockanalysis.com — Amazon.com (AMZN) Statistics & Valuation',
      url: 'https://stockanalysis.com/stocks/amzn/statistics/',
      kind: 'data',
    },
    {
      n: 28,
      label:
        'TradingView — CoreWeave, Inc. Stock 12‑Month Price Target Raised to $142.29, Implies 58% Upside — TradingView News',
      url: 'https://www.tradingview.com/news/tradingview:ecc666e81ee54:0-coreweave-inc-stock-12-month-price-target-raised-to-142-29-implies-58-upside/',
      kind: 'data',
    },
    {
      n: 29,
      label:
        'QuiverQuant — COREWEAVE ($CRWV) Releases Q2 2026 Earnings, Stock Rises',
      url: 'https://www.quiverquant.com/news/COREWEAVE+($CRWV',
      kind: 'data',
    },
    {
      n: 30,
      label: 'CNBC \\u2014 CoreWeave Q2 earnings report 2026',
      url: 'https://www.cnbc.com/2026/08/11/coreweave-crwv-q2-earnings-report-2026.html',
      kind: 'analysis',
    },
    {
      n: 31,
      label:
        'The Motley Fool \\u2014 Q2 2026 earnings call transcript (guidance and Q3 interest)',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/08/18/coreweave-crwv-q2-2026-earnings-call-transcript/',
      kind: 'analysis',
    },
    {
      n: 32,
      label:
        'Seeking Alpha \\u2014 FY2026 revenue guidance and the 1.85 GW power target',
      url: 'https://seekingalpha.com/news/4631186-coreweave-expects-12_4b-13_2b-of-2026-revenue-while-raising-year-end-active-power-target-to',
      kind: 'analysis',
    },
    {
      n: 33,
      label:
        'Investing.com \\u2014 Q2 2026 slides: revenue doubles, backlog surges',
      url: 'https://www.investing.com/news/company-news/coreweave-q2-2026-slides-revenue-doubles-backlog-surges-246-93CH-4852949',
      kind: 'analysis',
    },
    {
      n: 34,
      label: 'The Motley Fool — Why CoreWeave Stock Is Down 11.8%',
      url: 'https://www.fool.com/investing/2026/08/18/why-coreweave-stock-is-down-11/',
      kind: 'analysis',
    },
    {
      n: 35,
      label:
        'Investing.com — Bernstein raises coreweave stock price target on strong results',
      url: 'https://www.investing.com/news/analyst-ratings/bernstein-raises-coreweave-stock-price-target-on-strong-results-93CH-4855403',
      kind: 'analysis',
    },
    {
      n: 36,
      label:
        "Yahoo Finance — CoreWeave stock soars after earnings and 'an important inflection point'",
      url: 'https://finance.yahoo.com/technology/article/coreweave-to-report-second-quarter-results-amid-spending-margin-concerns-193036479.html',
      kind: 'analysis',
    },
    {
      n: 37,
      label:
        'Coreweave — CoreWeave Completes Industry-First Bring-Up and Validation of NVIDIA Vera Rubin NVL72',
      url: 'https://www.coreweave.com/news/coreweave-completes-industry-first-bring-up-of-nvidia-vera-rubin-nvl72',
      kind: 'analysis',
    },
    {
      n: 38,
      label:
        'Hpcwire — HPCwire - Since 1987 – Covering the Fastest Computers in the World and the People Who Run Them',
      url: 'https://www.hpcwire.com/off-the-wire/coreweave-completes-industry-first-bring-up-and-validation-of-nvidia-vera-rubin-nvl72/',
      kind: 'analysis',
    },
    {
      n: 39,
      label:
        'Trendforce — AI Server Demand to Drive Memory Contract Price Increases in 2Q26 as CSPs Secure Supply via Long-Term Agreements',
      url: 'https://www.trendforce.com/presscenter/news/20260331-12995.html',
      kind: 'analysis',
    },
    {
      n: 40,
      label:
        'Investing.com — CoreWeave tops Q2 2026 estimates, shares jump 13.5% (call transcript)',
      url: 'https://www.investing.com/news/transcripts/earnings-call-transcript-coreweave-tops-q2-2026-estimates-shares-jump-135-93CH-4852937',
      kind: 'analysis',
    },
    {
      n: 41,
      label: 'StockTitan — CoreWeave Q2 2026 Form 10-Q, filing summary',
      url: 'https://www.stocktitan.net/sec-filings/CRWV/10-q-core-weave-inc-quarterly-earnings-report-d3b596a1f167.html',
      kind: 'analysis',
    },
    {
      n: 42,
      label:
        'CNBC — The question everyone in AI asking: How long before a GPU depreciates?',
      url: 'https://www.cnbc.com/2025/11/14/ai-gpu-depreciation-coreweave-nvidia-michael-burry.html',
      kind: 'analysis',
    },
    {
      n: 43,
      label:
        'Fortune — As data-center operator CoreWeave prepares for earnings, stock bears worry its finances are emblematic of an AI bubble',
      url: 'https://fortune.com/2025/11/08/coreweave-earnings-debt-ai-infrastructure-bubble/',
      kind: 'analysis',
    },
    {
      n: 44,
      label:
        'Gadallon Substack — CoreWeave Is a Cloud Company. Its Economics Are a Spread Trade',
      url: 'https://gadallon.substack.com/p/coreweave-is-a-cloud-company-its',
      kind: 'analysis',
    },
    {
      n: 45,
      label:
        '24/7 Wall St. — CoreWeave Sinks 7% as Rising Yields Test the Most Leveraged AI Landlord',
      url: 'https://247wallst.com/investing/2026/08/18/coreweave-sinks-7-as-rising-yields-test-the-most-leveraged-ai-landlord/',
      kind: 'analysis',
    },
    {
      n: 46,
      label:
        'Tech Times — CoreWeave Q2 2026: $129B backlog grew $29.6B in six weeks despite 50% default odds',
      url: 'https://www.techtimes.com/articles/324054/20260812/coreweave-q2-2026-129b-backlog-grew-296b-six-weeks-despite-50-default-odds.htm',
      kind: 'analysis',
    },
    {
      n: 47,
      label: 'Seeking Alpha — Access to this page has been denied',
      url: 'https://seekingalpha.com/article/4935865-coreweave-q2-contracts-are-getting-shorter-debt-isnt',
      kind: 'analysis',
    },
  ],
};

const nbisQ2_2026: MarketStormReport = {
  slug: 'nbis-q2-2026',
  ticker: 'NBIS',
  company: 'Nebius Group N.V.',
  title:
    'Nebius has never reported an operating profit — every dollar of bottom-line profit it has shown is a mark on a stake in another company',
  excerpt:
    'Revenue grew 454% to $582M. The operating loss widened. Nebius has reported net income in both of the last two first-halves, and in both cases the entire profit is a non-cash revaluation of its stake in ClickHouse — $597.4M in 2025, $780.6M in 2026. Q2 2026 is the control case: no mark, and a $190.4M loss. Underneath sits a useful-life extension that cut this quarter’s depreciation by $43M, customer prepayments supplying 97.6% of operating cash flow, and a complete rotation of the top of the customer base in twelve months.',
  catalyst: 'Q2 2026 results — filed on Form 6-K, August 12, 2026',
  publishDate: '2026-08-20',
  tags: [
    'NBIS',
    'AI-infrastructure',
    'earnings-quality',
    'neocloud',
    'depreciation',
  ],
  verdict:
    'The AI cloud business is growing at a rate almost nothing in public markets matches, and the group has never once earned money from operations. Both of those are true, and the gap between them is filled by a private-company valuation, a depreciation estimate that lengthened in January, and $4.3 billion of convertible notes with another $4.5 billion proposed eight days after this print.',
  priceStrip: [
    { k: 'Price · Aug 20', v: '$223.90' },
    { k: '52-wk change', v: '+209%', tone: 'bull' },
    { k: 'Market cap', v: '$61.4B' },
    { k: 'EV / sales (TTM)', v: '46.9\u00d7', tone: 'bear' },
    { k: 'Net cash', v: '\u2212$2.2B' },
    { k: 'Short interest', v: '22.0%', tone: 'bear' },
  ],
  summary: `Nebius rents out AI computing power, and it is growing faster than almost anything on a public market — revenue up 454% in a year. It has also never made a profit from running that business. In both of the last two first-halves it reported net income anyway, and both times the profit came from re-valuing a stake it holds in a different company, the database maker ClickHouse. This quarter there was no such mark, and the result was a $190 million loss. Everything else in this report is about the machinery that sits between those two facts.`,
  headlineVsReal: [
    {
      headline:
        '"Net income from continuing operations was **$430.8 million** in the six months ended June 30, 2026" — the group has now reported first-half net income two years running.',
      real: 'A loss of about **$(349.8)M** once the ClickHouse revaluation is removed. In 2025 the same arithmetic gives **$(199.2)M**.',
      gap: 'The H1 2026 profit sits against a **$780.6M** non-cash gain from remeasuring the ClickHouse stake; H1 2025\u2019s $398.2M profit sat against a **$597.4M** gain. In both years the mark is larger than the profit. **Q2 2026 is the control case** \u2014 the gain was nil and the company lost $190.4M. Loss from operations, meanwhile, has been negative in every period disclosed: $(111.2)M, $(175.9)M, $(231.5)M, $(303.9)M. The mark is real, disclosed, and follows ClickHouse\u2019s January Series D. It is also a **Level 3 back-solve valuation** of a private company, remeasured on a single date, 16 January 2026.',
    },
    {
      headline:
        'The operating loss widened from $(111.2)M to $(175.9)M \u2014 **58%** \u2014 while revenue grew 454%.',
      real: 'Closer to **97%** on the depreciation policy that was in force three months earlier.',
      gap: 'Effective 1 January 2026 Nebius extended the useful life of servers and network equipment **from four years to five**. The filing quantifies it: the change **cut Q2 depreciation by $43.0M and reduced the Q2 net loss by $34.1M** ($86.1M and $75.7M for the half). On the prior estimate the Q2 operating loss would have been roughly $(218.9)M. Worth saying clearly in both directions \u2014 five years is still **shorter than CoreWeave\u2019s six**, and shorter than Alphabet or Microsoft. Nebius lengthened toward the industry norm rather than past it. But it lengthened, and it lengthened into the quarter where the loss was going to widen.',
    },
    {
      headline:
        '"Net cash provided by operating activities" of **$4,504.1M** in the first half \u2014 against $(352.0)M a year earlier.',
      real: '**97.6% of it is customers paying in advance.** Deferred revenue contributed **$4,395.0M** of that $4,504.1M.',
      gap: 'Deferred revenue on the balance sheet went from $1,577.5M to **$5,975.2M** in six months. That is a genuine vote of confidence from large customers and it funds the build \u2014 but it is a liability, not earnings, and it converts to revenue over one to five years. Strip it and underlying operating cash generation is roughly **$109M** against **$8,130.3M** of capital spending. Free cash flow for the half was $(3,626.2)M.',
    },
  ],
  kpis: [
    {
      label: 'Revenue',
      value: '$582.3M',
      delta: '+454% YoY',
      note: 'AI cloud alone $574.9M, up 514%.',
      tone: 'bull',
    },
    {
      label: 'Loss from operations',
      value: '$(175.9)M',
      delta: 'widened 58%',
      note: '~97% on the pre-January depreciation policy.',
      tone: 'bear',
    },
    {
      label: 'ClickHouse revaluation',
      value: '$780.6M',
      delta: 'H1; nil in Q2',
      note: 'Exceeds the $430.8M of H1 net income it produced.',
      tone: 'warn',
    },
    {
      label: 'Depreciation & amortisation',
      value: '$259.7M',
      delta: '44.6% of revenue',
      note: 'Exceeds group Adjusted EBITDA of $236.2M.',
      tone: 'warn',
    },
    {
      label: 'Top three customers',
      value: '59%',
      delta: 'of Q2 revenue',
      note: 'Last year’s top two both fell below 10%.',
      tone: 'warn',
    },
    {
      label: 'H1 capex',
      value: '$8.13B',
      delta: '8.3\u00d7 H1 revenue',
      note: 'FY guide $20\u201325B against $3.0\u20133.4B of revenue.',
      tone: 'bear',
    },
    {
      label: 'Remaining performance obligations',
      value: '$37.5B',
      delta: 'only 36% in 24 mths',
      note: '40% falls in months 25\u201348; the rest later.',
      tone: 'neutral',
    },
    {
      label: 'Convertible notes',
      value: '$4.3B + $4.5B',
      delta: 'raised, then proposed',
      note: 'Second offering announced 8 days after the print.',
      tone: 'bear',
    },
  ],
  printTableTitle: 'Q2 2026 — the facts everything hangs on',
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
          'Revenues',
          '$582.3M',
          '+454%',
          'From $105.1M. H1 $981.3M from $156.0M',
        ],
      },
      {
        cells: [
          '\u2014 Nebius AI cloud',
          '$574.9M',
          '+514%',
          'Segment Adjusted EBITDA $285.7M from $9.5M',
        ],
      },
      {
        cells: [
          '\u2014 TripleTen (edtech)',
          '$10.0M',
          '\u221219%',
          'Adjusted EBITDA $(9.4)M',
        ],
      },
      {
        cells: [
          '\u2014 Avride (autonomy)',
          '$1.0M',
          'from $0.2M',
          'Adjusted EBITDA $(40.1)M',
        ],
      },
      {
        cells: [
          'Depreciation & amortisation',
          '$259.7M',
          '+245%',
          '\u26a0 44.6% of revenue; exceeds group Adj. EBITDA',
        ],
      },
      { cells: ['Total operating costs', '$758.2M', 'from $216.3M', '\u2014'] },
      {
        star: true,
        cells: [
          'Loss from operations',
          '$(175.9)M',
          'from $(111.2)M',
          '\u26a0 Negative in every period disclosed',
        ],
      },
      {
        star: true,
        cells: [
          'Useful-life change impact',
          '+$43.0M',
          'Q2 depreciation',
          '\u26a0 4\u21925 years from 1 Jan; cut net loss by $34.1M',
        ],
      },
      {
        cells: [
          'Interest expense',
          '$(119.1)M',
          'from $(4.8)M',
          'Roughly 25\u00d7; H1 $(182.8)M',
        ],
      },
      {
        star: true,
        cells: [
          'ClickHouse revaluation gain',
          'nil',
          'vs $597.4M',
          '\u26a0 H1 $780.6M; carrying $737.1M \u2192 $1,517.7M',
        ],
      },
      {
        cells: ['Other income, net', '$81.5M', 'from $24.6M', 'Not operating'],
      },
      {
        cells: [
          'Net income / (loss)',
          '$(190.4)M',
          'from +$502.5M',
          'H1 +$430.8M \u2014 all of it downstream of the mark',
        ],
      },
      {
        star: true,
        cells: [
          'H1 operating cash flow',
          '+$4,504.1M',
          'from $(352.0)M',
          '\u26a0 $4,395.0M of it is deferred revenue',
        ],
      },
      {
        cells: [
          'Deferred revenue',
          '$5,975.2M',
          'from $1,577.5M',
          'Recognised over one to five years',
        ],
      },
      {
        cells: [
          'H1 capital expenditure',
          '$8,130.3M',
          'from $1,054.5M',
          '\u26a0 8.3\u00d7 H1 revenue; FCF $(3,626.2)M',
        ],
      },
      {
        cells: [
          'Cash and equivalents',
          '$8,042.1M',
          '\u2014',
          'Against $8,499.0M of non-current debt',
        ],
      },
      {
        star: true,
        cells: [
          'Customer concentration',
          '24 / 21 / 14%',
          '59% combined',
          '\u26a0 Prior year’s 39% and 15% both now below 10%',
        ],
      },
      {
        cells: [
          'Unsatisfied RPO',
          '$37,490.6M',
          '36% ≤24 mths',
          '40% in months 25\u201348; remainder later',
        ],
      },
      {
        cells: [
          'Convertible notes',
          '$4,337.5M',
          'gross, H1',
          '\u26a0 A further $4.50B proposed on 19 August',
        ],
      },
    ],
  },
  bull: [
    '**Revenue grew 454%**, and the AI cloud business alone grew 514% to $574.9M. Very little in public markets compounds at that rate.',
    '**The cloud segment does make money on its own terms:** Adjusted EBITDA of $285.7M against $9.5M a year ago, on a segment basis.',
    '**Customers are pre-paying for capacity.** Deferred revenue went $1,577.5M to $5,975.2M in six months \u2014 the build is being funded partly by the people who will use it.',
    '**$37.5B of remaining performance obligations**, disclosed in the filing rather than as a marketing figure, and explicitly net of the group’s estimate of variable consideration.',
    '**A five-year server life is shorter than the peer set** \u2014 CoreWeave uses six, as do Alphabet and (at the top of its range) Microsoft. Even after lengthening, Nebius depreciates faster than the companies it competes with.',
    '**The balance sheet is far cleaner than the closest comparable:** net debt of $2.2B against CoreWeave’s $46.0B, on $8.0B of cash.',
    '**The ClickHouse and Toloka stakes are real assets**, and the ClickHouse mark follows an arm’s-length Series D that Nebius did not participate in.',
  ],
  bear: [
    '**No operating profit in any period disclosed**, and the loss widened as revenue grew 454%.',
    '**Every dollar of reported first-half profit, in both years, is smaller than the ClickHouse mark that produced it.** Q2 had no mark and printed a $190.4M loss.',
    '**A depreciation estimate lengthened in January**, cutting Q2 depreciation by $43.0M and the loss by $34.1M, into the quarter where the loss widened anyway.',
    '**97.6% of operating cash flow is customer prepayment**, not earnings \u2014 a liability that converts over one to five years.',
    '**The top of the customer base rotated completely in twelve months:** last year’s 39% and 15% customers both fell below 10%, replaced by three at 24%, 21% and 14%.',
    '**Capex was 8.3\u00d7 revenue in the half**, and the FY guide of $20\u201325B against $3.0\u20133.4B of revenue is roughly 7\u00d7.',
    '**$4.3B of converts raised, and $4.50B more proposed eight days after this print** \u2014 roughly $8.8B of convertible debt inside eight months against $981M of half-year revenue.',
    '**46.9\u00d7 trailing EV/sales against CoreWeave’s 12.7\u00d7**, with 22% of the shares sold short.',
  ],
  theQuestion: `**Is the ClickHouse stake a distraction or the point?** Read it one way and it is noise: a non-cash mark on a side holding, irrelevant to whether the AI cloud works, and the operating numbers are what matter \u2014 in which case Nebius is a hypergrowth infrastructure business that has not yet crossed into profit, valued accordingly. Read it the other way and it is the only thing that has ever made this group money, it arrived on a single day in January from a private round the company did not participate in, and it papers over a business whose losses widen as it scales. The filing supports both readings. What it does not support is the reading where the group has earned anything from operations.`,
  analysis: `## Valuation \u2014 the mirror image of its closest peer

At **$223.90** Nebius is worth **$61.4B**, with an enterprise value of **$63.5B**. The two neoclouds now covered in this section are almost photographic negatives of each other:

| | Nebius | CoreWeave |
| --- | --- | --- |
| Enterprise value | $63.5B | $96.2B |
| Total debt | $10.2B | $51.6B |
| Net cash | \u2212$2.2B | \u2212$46.0B |
| **EV / sales (trailing)** | **46.9\u00d7** | **12.7\u00d7** |
| 52-week change | +209% | \u22126% |
| Short interest | **22.0%** | 11.1% |

Nebius has the cleaner balance sheet by an order of magnitude and the richer multiple by nearly four times. On 2026 guidance the gap narrows but does not close \u2014 roughly 19\u00d7 EV/revenue against CoreWeave\u2019s ~7\u00d7.

**22% of the shares are sold short**, the highest this section has covered. That cuts both ways and is worth holding lightly: it means a large group of professionals has taken the bear side of exactly the argument above, and it means the price carries mechanical squeeze risk that has nothing to do with the filings.

## What a 6-K does not tell you

This is the first foreign private issuer in this section, and the structure matters more than it sounds.

Nebius is Dutch-domiciled and files **6-K and 20-F, not 10-Q and 10-K**. The August 12 accession contains three documents: a cover, the MD&A, and the financial statements. There is no press release exhibit and no investor deck.

The consequence is concrete. **Every headline operating metric the stock trades on \u2014 annualised run-rate revenue, contracted megawatts, revenue guidance, capex guidance \u2014 appears in none of them.** ARR of $3.0B at end-June, the $7\u20139B exit-ARR target, FY revenue of $3.0\u20133.4B, capex of $20\u201325B and a year-end contracted-power target raised to 5 GW all come from the earnings call and the company\u2019s own website. A US filer would have furnished the release as an 8-K exhibit; CoreWeave\u2019s release points directly at its 10-Q.

None of that is improper \u2014 it is what the foreign-private-issuer regime permits. But it means the audited-adjacent record and the numbers in the headlines are two different documents, and only one of them is filed.

What the filing *does* disclose is better than expected in two places: **RPO of $37,490.6M**, with the honest detail that only **36% is expected to convert within 24 months** and 40% falls in months 25\u201348; and a full **customer-concentration table**.

## The customer table is the most interesting page in the filing

| Customer | Q2 2025 | Q2 2026 |
| --- | --- | --- |
| A | 39% | under 10% |
| B | 15% | under 10% |
| C | under 10% | **24%** |
| D | under 10% | **21%** |
| E | under 10% | **14%** |

The entire top of the customer base turned over in twelve months. Three unnamed customers are now **59% of revenue**, and the two that were 54% between them a year ago are both gone from the table.

At 454% growth this is what you would expect \u2014 new customers arriving so much larger than the old ones that the old ones drop below the threshold. It is not evidence of churn on its own. But it does mean the revenue base has no demonstrated persistence at the top, and the filing names none of them.

## Risk \u2014 each isolated, do not blur

1. **Earnings quality (dominant).** No operating profit in any disclosed period; all reported bottom-line profit downstream of a Level 3 mark on a private company, remeasured on one date.
2. **The depreciation estimate.** A four-to-five-year extension worth $43.0M a quarter, taken effective January, in a business where depreciation already exceeds group Adjusted EBITDA.
3. **The funding gap.** FY capex guidance of $20\u201325B against $8.1B spent in the half implies $12\u201317B still to fund, against $8.0B of cash \u2014 which is what the $4.50B convertible proposal on 19 August is for.
4. **Prepayment dependence.** 97.6% of operating cash flow is deferred revenue. If bookings slow, the cash flow statement deteriorates before the income statement does.
5. **Customer concentration.** 59% in three unnamed customers, with a fully rotated roster.
6. **Conglomerate drag.** Avride and TripleTen contributed $(49.5)M of Adjusted EBITDA loss in the quarter, roughly 28% of the group operating loss, on $11.0M of combined revenue.
7. **Dilution.** ~$8.8B of convertible notes raised or proposed inside eight months, plus prefunded warrants and treasury share sales in the H1 financing line.

## Horizon and sizing (kept separate)

**Horizon.** The near term is mechanical: whether the $4.50B convertible offering prices and on what terms, and whether Q3 shows operating loss narrowing rather than widening now that the depreciation change is in the base. The thesis resolves over **2\u20133 years** on one question \u2014 does the AI cloud reach operating profit before the capital markets tire of funding it?

**Sizing considerations (not a recommendation).** Nebius is the cleanest balance sheet and the richest multiple in the neocloud pair, which is an unusual combination and probably not a stable one. It also carries something none of the others do: a material part of the equity story is a stake in a private company whose value is set by other people\u2019s funding rounds. With 22% of shares short, the price will move for reasons unrelated to any of this.`,
  invalidation: {
    bull: [
      'Q3 shows the operating loss widening again, now that the useful-life change is fully in the base and can no longer flatter the comparison.',
      'Deferred revenue stops growing \u2014 the prepayment engine reverses and operating cash flow falls sharply while revenue still looks strong.',
      'The $4.50B convertible offering prices on materially worse terms than the H1 raise, or is pulled.',
      'A top-three customer drops below 10% again, showing the roster rotation is churn rather than growth.',
    ],
    bear: [
      'The AI cloud segment reaches group-level operating profit \u2014 the first time the business earns money without a mark.',
      'RPO converts faster than the disclosed 36%-in-24-months schedule, showing the backlog is nearer than the filing implies.',
      'Customer concentration falls because the denominator grew, with named investment-grade counterparties replacing unnamed ones.',
      'Capex intensity falls toward peer levels while growth holds, showing the 8.3\u00d7 was a build phase rather than a run rate.',
    ],
  },
  verification: {
    confirmed: 7,
    partlyTrue: 2,
    corrected: 1,
    confirmedNote:
      'Verified directly against the Q2 2026 6-K exhibits, quoted verbatim where it matters: the four-to-five-year useful-life extension and its $43.0M / $34.1M quarterly impact \u00b7 the ClickHouse remeasurement of 16 January 2026 taking carrying value $737.1M \u2192 $1,517.7M \u00b7 deferred revenue contributing $4,395.0M of $4,504.1M of operating cash flow \u00b7 the customer-concentration table \u00b7 RPO of $37,490.6M with 36% inside 24 months \u00b7 the full income statement \u00b7 the 19 August 6-K proposing $4.50B of convertible notes.',
    items: [
      {
        kind: 'corrected',
        title: 'The adversarial verification pass did not run on this report',
        text: 'Stated plainly because it is the method this section advertises. The four grounded interviews completed and produced six load-bearing claims, but **all six skeptic agents failed on a session limit** before they could attempt a refutation. Rather than publish the interviews unchecked, every load-bearing claim above was **verified by hand against the primary filings** \u2014 the figures in the confirmed note are quoted from the 6-K exhibits, not from an agent\u2019s summary. That is single-pass verification rather than adversarial verification, and it is weaker: nobody was tasked with trying to break these claims. Read this report with that discount applied. Two claims that could not be verified against a filing are marked below.',
      },
      {
        kind: 'partly',
        title: 'The guidance figures every headline used',
        text: 'ARR of $3.0B at end-June, an FY2026 exit-ARR target of $7\u20139B, revenue guidance of $3.0\u20133.4B, capex of $20\u201325B, and a year-end contracted-power target of 5 GW are all **call-sourced, not filed**. The August 12 accession contains no press release exhibit and no deck, and the MD&A contains no ARR, megawatt, gigawatt or guidance figure at all. They are reported here as management statements from the earnings call, which is a materially weaker basis than the rest of this report. One source also reported contracted power as "over 4 GW" against the transcript\u2019s 5 GW; both are recorded and neither is averaged.',
      },
      {
        kind: 'partly',
        title: 'Whether the $4.50B convertible offering has priced',
        text: 'The 19 August 6-K describes a **proposed** offering \u2014 $2.75B due 2030 and $1.75B due 2034, plus up to $675M of additional notes, "subject to market and other conditions". One research pass asserted it had priced upsized; **EDGAR shows no filing after 19 August**, so that could not be confirmed and is not stated as fact here. Treat the offering as announced and not yet completed as of this report.',
      },
    ],
  },
  openQuestions: [
    'Who are Customers C, D and E? Three unnamed counterparties are 59% of revenue, the prior year’s top two have both dropped below the disclosure threshold, and a foreign private issuer is not required to name them.',
    'What is the AI cloud segment’s operating loss on its own? The filing gives segment Adjusted EBITDA of $285.7M and a group operating loss of $(175.9)M, but does not push depreciation down to the segment — so the profitability of the actual business is not directly disclosed.',
    'What happens to operating cash flow when deferred revenue stops compounding? It supplied 97.6% of the half’s operating cash, and the filing says it unwinds over one to five years.',
    'Why extend server lives from four to five years effective January 2026, when Amazon shortened its own estimate the same month a year earlier citing the pace of AI development? The filing gives the assessment but not the underlying usage data.',
  ],
  soWhat: `There is a habit worth taking from this one, and it costs nothing: **when a company reports a profit, check which line it came from.**

Nebius reported net income in both of the last two first-halves. Both times, the number came from re-valuing a stake it owns in a different company — not from selling anything. This quarter there was no re-valuation, and the same business posted a $190 million loss. Nothing was hidden; it is all in the filing, in plain language, with the dates and the amounts.

The point is not that Nebius did anything wrong. It is that "the company was profitable" and "the business made money" are different sentences, and only one of them was true. That distinction shows up constantly once you look for it — a one-off gain, an asset sale, a mark on an investment, a tax item.

The practical version: **read the line above the bottom line.** Operating income tells you whether the business works. Net income tells you what happened to everything else as well. When those two disagree, the disagreement is usually the story.`,
  throughLine: {
    text: `This section has now looked at seven companies in the same AI-capital cycle, and Nebius completes a pair that is worth seeing together.

Nebius and CoreWeave do the same thing — rent out GPUs — and have arranged themselves as near-opposites. CoreWeave carries **$51.6B of debt and trades at 12.7\u00d7 trailing revenue**; Nebius carries **$10.2B and trades at 46.9\u00d7**. One has the leverage, the other has the multiple. Both spend multiples of their revenue on capital equipment, and both depend on depreciation estimates that nobody has yet tested through a full replacement cycle.

Ranked by capital spending against revenue, the picture is consistent: Palantir at 0.75%, Microsoft around 32%, Amazon at roughly 105% of operating cash flow, SpaceX at 235%, CoreWeave at about 290%, and Nebius\u2019s first half at **828%**. AMD sits outside the scale entirely \u2014 it sells the chips the rest are buying.`,
    links: [
      {
        label: 'CRWV \u2014 the same business, the opposite balance sheet',
        slug: 'crwv-q2-2026',
      },
      { label: 'SPCX \u2014 capex at 235% of revenue', slug: 'spcx-q2-2026' },
      {
        label: 'AMD \u2014 selling the chips the rest are buying',
        slug: 'amd-q2-2026',
      },
    ],
  },
  method: {
    kind: 'earnings',
    perspectives: [
      {
        role: 'Fundamentals analyst',
        probe:
          'Segment margins, cash generation, and what the operating business actually earned.',
      },
      {
        role: 'Short seller',
        probe: 'What breaks the bull case, and by what mechanism.',
      },
      {
        role: 'Industry engineer',
        probe: 'Whether the technology and the moat are real.',
      },
      {
        role: 'Valuation watcher',
        probe: 'What the price already assumes.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 10,
    claimsVerified: 0,
    verificationScope: 'top-n',
    agentCount: 12,
    runDate: '2026-08-20',
    limitations: [
      'All six skeptic agents died on a session limit before they could attempt a refutation. Every load-bearing claim was verified by hand against the 6-K exhibits instead — single-pass checking, not adversarial checking, and weaker for it.',
    ],
  },
  cardImage: '/images/content/nbis-q2-2026-card-hero.webp',
  cardImageLight: '/images/content/nbis-q2-2026-card-hero-light.webp',
  cardImageAlt: 'Nebius logo',
  sources: [
    {
      n: 1,
      label:
        'Nebius Q2 2026 Form 6-K, Exhibit 99.1 \\u2014 Operating and Financial Review (2026-08-12)',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926094844/nbis-20260812xex99d1.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 2,
      label:
        'Nebius Q2 2026 Form 6-K, Exhibit 99.2 \\u2014 financial statements: useful-life change, ClickHouse remeasurement, customer concentration, RPO',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926094844/nbis-20260812xex99d2.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 3,
      label:
        'Nebius Form 6-K (2026-08-19) \\u2014 proposed $4.50B convertible senior notes offering',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926098590/tm2623513d1_ex99-1.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 4,
      label: 'Nebius EDGAR filing index (CIK 0001513845)',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001513845&type=6-K&dateb=&owner=include&count=10',
      primary: true,
      kind: 'filing',
    },
    {
      n: 5,
      label: 'Nebius Form 6-K Exhibit 99.1 (earnings release) filed 2026-03-16',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926027886/tm268879d1_ex99-1.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 6,
      label: 'Nebius Form 6-K Exhibit 99.1 (earnings release) filed 2026-07-17',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926084452/tm2620683d1_ex99-1.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 7,
      label: 'CoreWeave Form 8-K filed 2026-08-11',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000362/coreweave2q26earningspress.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 8,
      label: 'Nebius Form 6-K filed 2026-08-12',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926094844/index.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 9,
      label: 'Nebius Form 6-K filed 2026-08-19',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926098590/tm2623513d1_6k.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 10,
      label: 'Nebius Form 6-K Exhibit 99.1 (earnings release) filed 2026-08-12',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926094568/tm2622968d1_ex99-1.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 11,
      label: 'Nebius Form 6-K filed 2026-08-12',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926094844/nbis-20260812x6k.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 12,
      label: 'SEC EDGAR — Nebius filing index',
      url: 'https://data.sec.gov/submissions/CIK0001513845.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 13,
      label: 'Nebius Form 6-K Exhibit 99.1 (earnings release) filed 2026-08-12',
      url: 'https://www.sec.gov/Archives/edgar/data/1513845/000110465926094568/tm2622968d1_ex99-2.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 14,
      label: 'Nebius newsroom \\u2014 Q2 2026 results and shareholder letter',
      url: 'https://nebius.com/newsroom',
      kind: 'company',
    },
    {
      n: 15,
      label: 'Nebius — Q2 2026 shareholder letter (PDF)',
      url: 'https://assets.nebius.com/assets/a6ecfd85-a6cb-4967-8ef7-9a25bd261f9c/SHLQ226.pdf',
      kind: 'company',
    },
    {
      n: 16,
      label:
        'CoreWeave IR — CoreWeave Reports Strong Second Quarter 2026 Results',
      url: 'https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Second-Quarter-2026-Results/default.aspx',
      kind: 'company',
    },
    {
      n: 17,
      label:
        'Nebius — Nebius to triple capacity at Finland data center to 75 MW',
      url: 'https://nebius.com/newsroom/nebius-to-triple-capacity-at-finland-data-center-to-75-mw',
      kind: 'company',
    },
    {
      n: 18,
      label: 'Nebius — Nebius to construct 310 MW AI factory in Finland',
      url: 'https://nebius.com/newsroom/nebius-to-construct-310-mw-ai-factory-in-finland',
      kind: 'company',
    },
    {
      n: 19,
      label:
        'Nebius — Nebius Group announces pricing of upsized private offering of $4.0 billion of convertible senior notes',
      url: 'https://nebius.com/newsroom/nebius-group-announces-pricing-of-upsized-private-offering-of-4-0-billion-of-convertible-senior-notes',
      kind: 'company',
    },
    {
      n: 20,
      label:
        'Nebius — Nebius Group announces proposed private offering of $4.50 billion of convertible senior notes',
      url: 'https://nebius.com/newsroom/nebius-group-announces-proposed-private-offering-of-4-50-billion-of-convertible-senior-notes',
      kind: 'company',
    },
    {
      n: 21,
      label: 'Nebius — Nebius reports second quarter 2026 financial results',
      url: 'https://nebius.com/newsroom/nebius-reports-second-quarter-2026-financial-results',
      kind: 'company',
    },
    {
      n: 22,
      label:
        'stockanalysis.com \\u2014 NBIS price, enterprise value and short interest',
      url: 'https://stockanalysis.com/stocks/nbis/statistics/',
      kind: 'data',
    },
    {
      n: 23,
      label: 'stockanalysis.com \\u2014 CRWV, for the peer comparison',
      url: 'https://stockanalysis.com/stocks/crwv/statistics/',
      kind: 'data',
    },
    {
      n: 24,
      label: 'stockanalysis.com — Nebius Group (NBIS) Stock Price & Overview',
      url: 'https://stockanalysis.com/stocks/nbis/',
      kind: 'data',
    },
    {
      n: 25,
      label: 'Macrotrends — Nebius Group Market Cap 2012-2026 | NBIS',
      url: 'https://www.macrotrends.net/stocks/charts/NBIS/nebius-group/market-cap',
      kind: 'data',
    },
    {
      n: 26,
      label: 'stockanalysis.com — CoreWeave (CRWV) Stock Price & Overview',
      url: 'https://stockanalysis.com/stocks/crwv/',
      kind: 'data',
    },
    {
      n: 27,
      label:
        'stockanalysis.com — Nebius Group (NBIS) Stock Price History 2011-2026',
      url: 'https://stockanalysis.com/stocks/nbis/history/',
      kind: 'data',
    },
    {
      n: 28,
      label: 'stockanalysis.com — Nebius Group (NBIS) Financials Overview',
      url: 'https://stockanalysis.com/stocks/nbis/financials/',
      kind: 'data',
    },
    {
      n: 29,
      label: 'CompaniesMarketCap — Nebius Group (NBIS) - Market capitalization',
      url: 'https://companiesmarketcap.com/nebius-group/marketcap/',
      kind: 'data',
    },
    {
      n: 30,
      label: 'Robinhood — Nebius Group: NBIS Stock Price Quote & News',
      url: 'https://robinhood.com/us/en/stocks/NBIS/',
      kind: 'data',
    },
    {
      n: 31,
      label:
        'stockanalysis.com — Nebius Group (NBIS) Stock Forecast & Analyst Price Targets',
      url: 'https://stockanalysis.com/stocks/nbis/forecast/',
      kind: 'data',
    },
    {
      n: 32,
      label:
        'TipRanks — Strong set up ahead of q2 earnings says goldman sachs analyst on nebius stock nbis assigning a street high tar',
      url: 'https://www.tipranks.com/news/strong-set-up-ahead-of-q2-earnings-says-goldman-sachs-analyst-on-nebius-stock-nbis-assigning-a-street-high-target',
      kind: 'data',
    },
    {
      n: 33,
      label:
        'Nebius Q2 2026 earnings call transcript \\u2014 the only source for ARR, power and guidance',
      url: 'https://www.fool.com/earnings/call-transcripts/2026/08/19/nebius-nbis-q2-2026-earnings-call-transcript/',
      kind: 'analysis',
    },
    {
      n: 34,
      label:
        'The Motley Fool — Nebius Just Signed $46 Billion in AI Cloud Deals With Microsoft and Meta. Can This Stock 10X?',
      url: 'https://www.fool.com/investing/2026/04/02/nebius-just-signed-46-billion-in-ai-cloud-deals-wi/',
      kind: 'analysis',
    },
    {
      n: 35,
      label: 'CNBC — CoreWeave (CRWV) Q2 earnings report 2026',
      url: 'https://www.cnbc.com/2026/08/11/coreweave-crwv-q2-earnings-report-2026.html',
      kind: 'analysis',
    },
    {
      n: 36,
      label:
        'StockTitan — Nebius reports second quarter 2026 financial qwyhxubfo15t',
      url: 'https://www.stocktitan.net/news/NBIS/nebius-reports-second-quarter-2026-financial-qwyhxubfo15t.html',
      kind: 'analysis',
    },
    {
      n: 37,
      label:
        'Wccftech — CoreWeave (CRWV) Depreciates Its GPUs Over 6 Years, While Its Competitor Nebius Uses A 4-Year Depreciation Period',
      url: 'https://wccftech.com/coreweave-crwv-depreciates-its-gpus-over-6-years-while-its-competitor-nebius-uses-a-4-year-depreciation-period/',
      kind: 'analysis',
    },
    {
      n: 38,
      label: 'Seeking Alpha — Access to this page has been denied',
      url: 'https://seekingalpha.com/news/4631437-nebius-surges-after-q2-beat-plans-to-continue-investing-in-capex',
      kind: 'analysis',
    },
    {
      n: 39,
      label:
        'The Motley Fool — Stock Market Today, Aug. 19: Nebius Falls 10% on $4.5 Billion Convertible Note Offering',
      url: 'https://www.fool.com/coverage/stock-market-today/2026/08/19/stock-market-today-aug-19-nebius-falls-10-on-usd4-5-billion-convertible-note-offering/',
      kind: 'analysis',
    },
    {
      n: 40,
      label:
        'Investing.com — Nebius prices 5 billion convertible notes offering',
      url: 'https://uk.investing.com/news/stock-market-news/nebius-prices-5-billion-convertible-notes-offering-93CH-4840180',
      kind: 'analysis',
    },
    {
      n: 41,
      label: 'Seeking Alpha — Access to this page has been denied',
      url: 'https://seekingalpha.com/news/4631186-coreweave-expects-12_4b-13_2b-of-2026-revenue-while-raising-year-end-active-power-target-to',
      kind: 'analysis',
    },
    {
      n: 42,
      label: 'TheStreet — thestreet.com',
      url: 'https://www.thestreet.com/investing/stocks/nbis-bofa-bank-of-america-raises-nebius-stock-price-target-after-q2-earnings-august-2026',
      kind: 'analysis',
    },
  ],
};

// Newest first — the section index renders in array order, without sorting.
const googQ2_2026: MarketStormReport = {
  slug: 'goog-q2-2026',
  ticker: 'GOOGL',
  company: 'Alphabet Inc.',
  title:
    'Alphabet reported $112 billion of profit and negative free cash flow in the same quarter',
  excerpt:
    'Net income rose 298%. Operating income rose 30%. The gap is a $99.0 billion gain on equity securities that is 99.7% unrealized — $278M of it was actually realized — and the cash flow statement backs the whole thing straight out. Underneath: $44.9 billion of capital spending in three months, free cash flow of negative $5.9 billion, a second straight quarter of zero buybacks, $49.6 billion of stock and preferred sold in June, and purchase commitments that went from $149 billion to $811 billion in six months.',
  catalyst: 'Q2 2026 earnings — reported July 22, 2026',
  publishDate: '2026-08-20',
  tags: ['GOOGL', 'AI-infrastructure', 'earnings-quality', 'capex', 'cloud'],
  verdict:
    'The most profitable quarter in the company’s history, and it consumed more cash than it produced. $77.1 billion of the $112.1 billion never touched cash — it is a mark on stakes Alphabet has largely agreed not to sell, and the largest of them has fallen about $21 billion since the quarter closed. Strip the mark and the operating business grew about 30%, which is a very good quarter and not a 294% one.',
  priceStrip: [
    { k: 'Price · Aug 20', v: '$342.10' },
    { k: 'Market cap', v: '$4.18T' },
    { k: 'Trailing P/E, screened', v: '17.3×', tone: 'warn' },
    { k: 'Trailing P/E, ex-marks', v: '~30.6×', tone: 'bear' },
    { k: 'Forward P/E', v: '25.9×' },
    { k: 'Price / free cash flow', v: '79.1×', tone: 'bear' },
  ],
  summary: `Alphabet had the biggest profit quarter any company has ever reported, and in the same three months it spent more cash than it took in. Both are true and they are connected by one line on the income statement: a **$99.0 billion gain on equity securities**, almost none of which involved selling anything. Alphabet marked up the value of stakes it holds in other companies — chiefly SpaceX, which went public in June, and a private company it does not name — and booked the increase as profit. That is permitted, disclosed, and normal accounting. It is also not money. Of the $99.0 billion, **$278 million was actually realized**; the cash flow statement removes the other $99.0 billion on the very next page.

Meanwhile the real business did something genuinely remarkable and something genuinely uncomfortable. Google Cloud grew **82%** and its operating margin went from 20.7% to 35.6%. And Alphabet spent **$44.9 billion on capital equipment in one quarter** — double a year ago — which pushed free cash flow to **negative $5.9 billion**, kept share repurchases at zero for a second straight quarter, and sat alongside **$49.6 billion** of stock and preferred sold in June.`,
  headlineVsReal: [
    {
      headline:
        'Diluted EPS of **$9.11**, up **294%**; net income available to common of **$112.1 billion**, up 298%.',
      real: 'About **$2.84** and **$35.0 billion** on the operating business — up roughly 23% and 24%.',
      gap: 'Alphabet quantifies this itself, in footnote (1) to the segment table: “the net effect of the gain on equity securities of $99.0 billion **increased the provision for income tax, net income, and diluted net income per common share by $21.9 billion, $77.1 billion, and $6.26**, respectively.” So $6.26 of the $9.11 — **68.7%** — is the mark. Comparing like with like matters: Q2 2025 also carried a $1,286M equity gain, and on the same ex-gain basis last year was about $2.22, so operating EPS grew roughly **28%**. That lines up with the +30% operating income growth, which is the honest read of the quarter.',
    },
    {
      headline:
        'Stock screeners show Alphabet on a trailing P/E of **17.3×** — the cheapest of the mega-caps.',
      real: 'Roughly **30.6×** once the marks come out of trailing earnings.',
      gap: 'The tell is visible on the screen without opening a filing: the **forward** P/E is 25.9× and the **trailing** P/E is 17.3×. Forward above trailing, on a company compounding revenue at 24%, is arithmetically impossible unless trailing earnings contain something that is not repeating. They do — and not once. Strip Q2’s $6.26, then strip Q1 2026’s mark as well (the 10-Q’s six-month equity gain of $135,946M less Q2’s $99,031M leaves **$36,915M in Q1**, about another $2.34 a share), and clean trailing EPS is roughly **$11.18**. On forward earnings Alphabet is more expensive than Microsoft (24.6×) and 52% dearer than Meta (17.1×). On cash it is starker still: price to free cash flow of **79.1×**, against 53.7× for Microsoft and 34.0× for Meta.',
    },
    {
      headline:
        'Alphabet bought back **no stock** and sold **$49.6 billion** of equity and preferred — widely tied to the $94 billion SpaceX stake it is not allowed to sell.',
      real: 'The chronology does not support it. Repurchases were **already zero in Q1 2026**, and the June raise **priced before the SpaceX IPO**.',
      gap: 'This one is a correction to our own first draft, so it is worth being blunt about. The Q1 2026 10-Q says verbatim: “In the three months ended March 31, 2026, there were no repurchases,” with the same $69.5 billion remaining as at June 30 — **six weeks before SpaceX listed on June 12**, when the stake was still an unrestricted private holding. The public offering and the Berkshire placement closed **June 4** and the preferred **June 5**, before the IPO existed to restrict anything. Alphabet states a different reason four separate times: proceeds are for “general corporate purposes, **including capital expenditures to scale AI infrastructure and global compute**.” The 10-Q even supplies the mechanical link between the two events: “if we are utilizing the repurchase program at the time of any future offerings of our equity securities … we may be required to suspend share repurchases.” The causation runs **raise → pause**, and the raise is about capex. An illiquid stake is a reason the paper gain cannot fund anything; it is not the reason for the raise.',
    },
  ],
  kpis: [
    {
      label: 'Revenue',
      value: '$119.80B',
      delta: '+24% YoY',
      note: '+23% constant currency; 12th straight double-digit quarter.',
      tone: 'bull',
    },
    {
      label: 'Free cash flow',
      value: '$(5.86)B',
      delta: 'negative',
      note: '$39.1B of operating cash against $44.9B of capex.',
      tone: 'bear',
    },
    {
      label: 'Google Cloud revenue',
      value: '$24.77B',
      delta: '+82% YoY',
      note: 'Operating margin 20.7% → 35.6%.',
      tone: 'bull',
    },
    {
      label: 'Gain on equity securities',
      value: '$99.03B',
      delta: '99.7% unrealized',
      note: 'Only $278M realized. $6.26 of the $9.11 EPS.',
      tone: 'warn',
    },
    {
      label: 'Operating income',
      value: '$40.77B',
      delta: '+30% YoY',
      note: 'Margin 32% → 34%. This is the real growth rate.',
      tone: 'bull',
    },
    {
      label: 'Q2 capital spending',
      value: '$44.92B',
      delta: '2.0× a year ago',
      note: 'H1 $80.6B. FY guide raised to $195–205B.',
      tone: 'bear',
    },
    {
      label: 'Purchase commitments',
      value: '$811.0B',
      delta: '5.4× since December',
      note: 'Against trailing-twelve-month free cash flow of $53.3B.',
      tone: 'bear',
    },
    {
      label: 'Share repurchases',
      value: '$0',
      delta: '2nd straight quarter',
      note: '$69.5B of a $70.0B authorization untouched.',
      tone: 'warn',
    },
  ],
  printTableTitle: 'Q2 2026 — the figures this report rests on',
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
          'Revenues',
          '$119,796M',
          '+24%',
          'From $96,428M. +23% in constant currency',
        ],
      },
      {
        cells: ['— Google Search & other', '$63,271M', '+17%', 'From $54,190M'],
      },
      {
        cells: ['— YouTube ads', '$11,055M', '+13%', 'From $9,796M'],
      },
      {
        cells: [
          '— Google Cloud',
          '$24,768M',
          '+82%',
          'From $13,624M. 59% of AWS’s size, up from 44%',
        ],
        star: true,
      },
      {
        cells: ['Operating income', '$40,770M', '+30%', 'Margin 32% → 34%'],
      },
      {
        cells: [
          '— Google Cloud operating income',
          '$8,814M',
          '+212%',
          'From $2,826M. Margin 20.7% → 35.6%',
        ],
        star: true,
      },
      {
        cells: [
          '— Other Bets',
          '$(1,799)M',
          'loss widened',
          'On revenue of $382M, from $373M',
        ],
      },
      {
        cells: [
          '— Alphabet-level activities',
          '$(5,789)M',
          '+72% loss',
          'Holds shared AI model R&D; absorbs 40% of Cloud’s gain',
        ],
      },
      {
        cells: [
          'Gain on equity securities, net',
          '$99,031M',
          'from $1,286M',
          '$77,354M non-marketable + $21,399M marketable + $278M realized',
        ],
        star: true,
      },
      {
        cells: [
          'Other income (expense), net',
          '$97,983M',
          'from $2,662M',
          '“primarily the result of net unrealized gains on our equity securities”',
        ],
      },
      {
        cells: [
          'Provision for income taxes',
          '$26,560M',
          'from $5,737M',
          'Effective rate 19.1% from 16.9%; $21.9B of it on the gain',
        ],
      },
      {
        cells: [
          'Net income available to common',
          '$112,107M',
          '+298%',
          'About $35,007M excluding the gain',
        ],
        star: true,
      },
      {
        cells: [
          'Diluted EPS',
          '$9.11',
          '+294%',
          'About $2.84 excluding the gain',
        ],
        star: true,
      },
      {
        cells: [
          'Purchases of property and equipment',
          '$(44,924)M',
          '2.0×',
          'From $(22,446)M. H1 $(80,598)M from $(39,643)M',
        ],
        star: true,
      },
      {
        cells: [
          'Free cash flow (company non-GAAP)',
          '$(5,855)M',
          'negative',
          'From $10,116M in Q1 2026. TTM $53,273M',
        ],
        star: true,
      },
      {
        cells: [
          'Repurchases of stock',
          '$0',
          'from $(13,238)M',
          'Also zero in Q1 2026; $69.5B of $70.0B unused',
        ],
      },
      {
        cells: [
          'June equity + preferred issued',
          '$49.6B net',
          'new',
          '$20.5B public + $10.0B Berkshire + $19.0B 6.25% convertible preferred',
        ],
      },
    ],
  },
  bull: [
    'The operating business grew 30% at a $480 billion annual revenue run rate, with margin expanding from 32% to 34%. At that size, both of those at once is rare.',
    'Google Cloud grew 82% and nearly doubled its operating margin, and the expansion is concentrated in labour — compensation grew 25.7% against 81.8% revenue growth, falling from 40.5% to 28.0% of Cloud revenue. That is operating leverage, not an accounting estimate.',
    'The capital is being raised on excellent terms. The $49.6 billion cost roughly 1.1–1.2% of dilution and about $1.19 billion a year in coupon, and Berkshire Hathaway took $10.0 billion of it in a private placement.',
    'The depreciation bill is genuinely ahead of the company rather than behind it: assets not yet in service went from $78.6 billion to $122.8 billion in six months. Revenue from that capital has not started, and neither has most of its cost.',
    'Search still grew 17% and YouTube ads 13%, twelve quarters into a story about search being disrupted.',
  ],
  bear: [
    'Free cash flow was negative $5.9 billion. The release’s own four-quarter reconciliation — $24.5B, $24.6B, $10.1B, $(5.9)B — shows the trend, and capex guidance was raised to $195–205 billion for 2026 with 2027 to “increase significantly.”',
    'Purchase commitments reached $811.0 billion at June 30, from $149.1 billion at December 31. Even allowing that some of the jump is a widened disclosure basis, energy agreements run 2–26 years with take-or-pay obligations through 2054.',
    '$112.1 billion of net income contains $77.1 billion of non-cash mark, and the largest single position behind it — 551,189,500 SpaceX shares — was worth $94.2 billion at June 30 and about $73.2 billion on August 20. That is roughly $21 billion of the gain already gone.',
    'The tax on the mark is real and the mark is not. The $21.9 billion is a deferred liability on an unrealized gain; if the marks reverse, so does it, but the quarter has already reported both.',
    'Trailing multiples across the market are polluted for this stock, in both directions and for at least two quarters running. Anyone screening on trailing P/E is looking at 17.3× for a business trading near 30×.',
  ],
  theQuestion: `Alphabet’s operating business grew 30% and its cloud arm grew 82% with margins that nearly doubled. In the same three months it spent $44.9 billion on capital, produced less cash than it spent, sold $49.6 billion of stock and preferred, and signed its way to $811 billion of purchase commitments.

Is that a company converting a lead into an unassailable one — or one whose lead now costs more to hold than the business earns?`,
  analysis: `## What the $99 billion actually is — and what our own first draft got wrong

The 10-Q decomposes the gain exactly:

| Component | Q2 2026 |
| --- | --- |
| Unrealized gain, non-marketable (measurement alternative) | $77,354M |
| Unrealized gain, marketable and other | $21,399M |
| **Realized** | **$278M** |
| Total | $99,031M |

The obvious reading of that table — and the one this report started with — is that 78% of the gain came from a private company Alphabet never names, and that the SpaceX IPO is the smaller piece. **That reading is wrong**, and the same filing refutes it.

SpaceX sat in the *non-marketable* bucket until it listed on **June 12**. Its step-up **to** the IPO price therefore ran through the $77,354M line, not the $21,399M one. The roll-forward makes this checkable: cumulative upward adjustments in the measurement-alternative book went $80,792M to $85,732M while $77,544M of gross upward gain was recognised in the quarter, so about **$72.6 billion of upward adjustment left the bucket**; add cost and the carrying value removed is roughly **$74.8 billion**. Alphabet’s **551,189,500 SpaceX shares at the $135 IPO price come to $74.41 billion** — a 0.6% match. The $21,399M is only the post-IPO move from $135 to $170.86.

So the gain **is** primarily SpaceX. Reconstructed, the split is roughly **$60 billion SpaceX and $36 billion the private company**. Stated plainly: **Alphabet does not disclose the split, and neither does any source.** That figure is a reconstruction from the filing’s own roll-forward, not a disclosure, and it is presented as such.

What survives from the original concern is a balance-sheet fact rather than an income-statement one: at June 30 the non-marketable book stands at **$124.3 billion**, of which **$87.9 billion was remeasured to Level 2 during the quarter** off an unnamed private company’s funding round. That is a real, undisclosed, unverifiable forward exposure. It is just not where most of this quarter’s gain came from.

## The mark is already reversing

Alphabet’s 13F, filed August 7, gives the position to the share: **551,189,500 SpaceX Class A shares at $94,176,237,970** — $170.86 each, and 93% of the entire $101.2 billion marketable equity book. The 10-Q footnotes it as **$80.0 billion “subject to short-term restrictions on the ability to sell”** plus **$14.1 billion “subject to long-term restrictions … through the third quarter of 2027.”**

Worth stating precisely, because it is easy to overstate: this is a **temporary contractual lockup, not a legal prohibition**, and SpaceX’s lockup releases in nine staggered tranches — a first tranche of 911.5 million company-wide shares freed on **August 6**. Under ASU 2022-03 a contractual sale restriction is not reflected in fair value, which is exactly why the position carries at the unadjusted $170.86.

SPCX closed at **$139.65 on August 19** and traded at **$132.85 on August 20**. At that last price the same 551,189,500 shares are worth about **$73.2 billion** — roughly **$21 billion below the June 30 mark**, or about **−$1.33 a diluted share** after tax at the 22.1% rate Alphabet itself disclosed on the Q2 gain.

That is an as-of estimate, not an accrual. Q3’s mark is set by the September 30 close, and it assumes Alphabet still holds every share unhedged. But the direction is the point: **about a fifth of the largest profit ever reported has evaporated in seven weeks**, and none of it was ever cash.

## The cash question, which is the real story

Strip the marks and this is a capital-expenditure quarter, and an extraordinary one.

Capex went **$22,446M to $44,924M** — doubled — and the half is **$80,598M** against $39,643M. Operating cash flow was **$39.1 billion**. Subtract the two and free cash flow is **$(5,855)M**. The company’s own four-quarter reconciliation reads $24,461M, $24,551M, $10,116M, $(5,855)M: the slide is not one bad quarter, it is four quarters of capex outrunning a cash machine.

Management is explicit about all of it. CFO Anat Ashkenazi attributed the negative free cash flow to “our investments in CapEx,” described the rationale for the raise as “a resilient … strong balance sheet,” and guided **2026 capex to $195–205 billion**, up from $180–190 billion, with 2027 to “increase significantly.” The market heard it: the stock fell between **5.4% and 7%** on July 23 depending on the source — its worst day in fourteen months — on a quarter that beat.

The funding stack assembled in June is worth listing, because it is more than the headline:

- **$20.5 billion** public offering — 29M Class A at $355.1982 and 29M Class C at $351.8018
- **$10.0 billion** private placement of 14M Class A + 14M Class C to Berkshire Hathaway’s National Indemnity
- **$19.0 billion** of 6.25% mandatory convertible preferred, converting on or about **May 15, 2029**, with $1.0 billion of capped calls struck 50% above the offering prices
- a **$40.0 billion at-the-market programme** established June 1, unused at quarter-end
- **$20.3 billion** of senior notes issued the same quarter

Dilution from the equity and preferred is genuinely small — about 86 million shares now plus at most ~54 million on conversion, roughly **1.1–1.2%** of the 12,230 million outstanding, at about $1.19 billion a year of coupon. The ATM would add roughly another 0.9% if used. This is cheap money. The question the terms answer is *how* Alphabet is funding the build; the question they raise is *why it needs to*.

## Google Cloud: how much of the 82% is real

Most of it, with three qualifiers that matter.

**It is not a depreciation trick.** No change in useful-life estimate is disclosed in the Q1 or Q2 2026 10-Q, the six-year server life from the FY2025 10-K still stands, and depreciation rose about 42% year on year to roughly $7.1 billion. The margin expansion is concentrated in labour: Cloud compensation grew **25.7%** against **81.8%** revenue growth, falling from 40.5% to 28.0% of Cloud revenue and contributing about 84% of the 14.85-point expansion. Incremental margin was 53.7%.

**But allocation cannot be ruled out from the filing.** Note 15 says centrally-managed technical-infrastructure costs “including the associated depreciation” are allocated to segments “generally based on usage, headcount, or revenue,” and Alphabet never discloses the amount allocated to Cloud. Cloud’s depreciation burden is unobservable. Separately — and this is the sharper point — **shared AI model R&D is deliberately not allocated to any segment**. It sits in “Alphabet-level activities,” whose loss widened from $(3,372)M to $(5,789)M, absorbing **$2,417 million, or 40% of Cloud’s entire $5,988 million operating-income increase**.

**And it is not like-for-like with AWS or Azure.** Google Cloud includes Workspace; AWS does not. It also includes a first full quarter of **Wiz** ($29.5 billion, closed March 11, contribution undisclosed, zero in the year-ago base) and new **TPU system hardware revenue** that Alphabet does not disaggregate — management called the 2026 contribution “relatively small,” said growth “accelerated meaningfully even after excluding the impact of TPU system sales,” and expects the majority of those agreements to land in 2027 (inventory quadrupled to $10.0 billion on TPU hardware, so 2027 will look different). In the same quarter **AWS grew 37% to $42,232M at a 39.4% segment margin** — above Google Cloud’s. Microsoft publishes no Azure-only margin or dollar figure at all.

The base matters too: Google Cloud is now **59% of AWS’s size**, up from 44%. Growing 82% off a base under half your rival’s is a different achievement from growing 37% off the bigger one — better in some readings, less impressive in others, and not the same thing.

## $811 billion

Alphabet’s disclosed “material purchase commitments and other contractual obligations” went **$149.1B (Dec 31) → $332.4B (Mar 31) → $811.0B (Jun 30)** — 5.4× in six months, with $200.7 billion falling short-term. Within it, Note 10 discloses **$707.0 billion of “expected future fixed or guaranteed commitments,”** the significant majority long-term supply agreements, with energy agreements running **2 to 26 years and take-or-pay obligations through 2054**. Add $85.2 billion of leases not yet commenced and $21.9 billion of variable-interest-entity funding commitments and the gross figure is roughly **$918 billion**.

Two honest deflations. Some of the jump is **scope, not spending**: “long-term supply agreements” appears nowhere in the FY2025 10-K, which used a narrower measurement basis, and the companion disclosure went $7.7B → $232.7B → $707.0B on an acknowledged widening in Q1 2026. And obligations running to 2054 measured against one capex-depressed year of free cash flow is a stress indicator, not a solvency ratio — $811 billion is about four years of spending at guided 2026 capex.

But the buildout underneath it is not a disclosure artifact: $80.6 billion of half-year capex against $39.6 billion, a $49.6 billion equity raise, buybacks at zero, and a negative free-cash-flow quarter all point the same way.

## The one number nobody explains

Back out Alphabet’s own footnoted $21.9 billion of tax and the residual effective rate on the operating business is **11.7%** — well below the 16.9% of a year ago. On six months, which washes out interim lumpiness, it is **14.1% against 16.3%**: a real decline of about 2 points, roughly half what the quarterly figures suggest, and neither the 10-Q nor the call explains it. The likeliest driver is a larger stock-based-compensation windfall benefit given the share price, which is a genuine tax benefit but a share-price-dependent one. Normalising at Alphabet’s own H1 ex-gain rate gives about **$2.76** rather than $2.84 — a 3% haircut on the clean anchor, worth knowing about and not worth panicking over.

## Risk — each isolated, do not blur

1. **Cash generation (dominant).** Negative free cash flow, capex guided to $195–205 billion for 2026 and higher in 2027, funded increasingly from capital markets rather than operations.
2. **Mark reversal.** About $21 billion of the reported gain is already gone at the August 20 SPCX price, and $94.1 billion of the position remains restricted into Q3 2027.
3. **The unnamed private company.** $87.9 billion remeasured to Level 2 in one quarter off a funding round, inside a $124.3 billion non-marketable book, with no name, no ownership percentage and no cost basis disclosed.
4. **Commitment scale.** $811 billion, some of it take-or-pay to 2054, signed against a demand curve nobody can yet see past 2027.
5. **Comparability.** Cloud’s headline growth and margin are not measured on the same basis as AWS’s or Azure’s, and Alphabet’s segments do not sum to consolidated operating income while Amazon’s do.
6. **Screen pollution.** Two consecutive quarters of enormous marks make every trailing multiple on this stock wrong, and the error is in the flattering direction.

## Horizon and sizing (kept separate)

**Horizon.** The near term is mechanical: the September 30 SPCX close sets the Q3 mark, and Q3 free cash flow against a capex run rate now above $45 billion a quarter says whether Q2 was the trough or the trend. The thesis resolves over **two to three years** on one question — does the compute Alphabet is buying produce revenue at a margin that justifies $200 billion a year, before the commitments become due?

**Sizing considerations (not a recommendation).** Alphabet is the only company in this section that could fund a build of this size from its own operations and is choosing not to. The balance sheet is not the risk. The risk is that the screened multiple looks like a value stock and the real one does not, and that two of the last two quarters’ earnings were set by other people’s share prices.`,
  invalidation: {
    bull: [
      'Q3 free cash flow stays negative or worsens while capex guidance rises again — the raise becomes a recurring requirement rather than a one-off.',
      'The Q3 equity mark reverses hard: SPCX below roughly $135 at September 30 would put the position under its own IPO price and turn the Q2 gain into a Q3 loss.',
      'Google Cloud growth decelerates sharply once Wiz is in the base and the TPU hardware timing normalises, showing the 82% was partly composition.',
      'The unnamed private company’s next round marks down, taking a bite out of the $124.3 billion non-marketable book with no warning and no name attached.',
    ],
    bear: [
      'Free cash flow returns to positive in Q3 or Q4 while capex stays at guidance — showing Q2 was a timing trough, not a structural inversion.',
      'Google Cloud sustains 60%-plus growth with margins holding above 30% for two more quarters, at which point the base-size objection stops mattering.',
      'Alphabet begins disclosing the SpaceX and private-company split, or the segments start summing to consolidated operating income, removing the comparability discount.',
      'TPU system revenue lands at scale in 2027 as guided, giving Alphabet a hardware line that Amazon and Microsoft do not have and that changes the cloud margin comparison structurally.',
    ],
  },
  verification: {
    confirmed: 0,
    partlyTrue: 4,
    corrected: 2,
    confirmedNote:
      'Confirmed against Alphabet’s own filings: every raw figure in this report was verified directly against the Q2 2026 8-K Exhibit 99.1, the Q2 2026 10-Q, the Q1 2026 10-Q and the August 7 Form 13F — the income statement and cash-flow lines, the equity-securities decomposition ($77,354M / $21,399M / $278M), the footnoted $21.9B / $77.1B / $6.26 tax and EPS effect, the $80.0B and $14.1B SpaceX restriction footnotes, the 551,189,500-share 13F position, the Q1 2026 “there were no repurchases” language, the June offering terms, and the $811.0B commitment disclosure. What did not survive was the interpretation layer: of six load-bearing claims put to adversarial skeptics, none passed clean.',
    items: [
      {
        kind: 'corrected',
        title: 'This report’s original thesis about the $99 billion was wrong',
        text: 'The first draft read the 10-Q’s $77,354M non-marketable line as a mark on the unnamed private company, concluding that the SpaceX IPO was the *smaller* part of the gain and that about 69% of net income traced to one company Alphabet never names. **The skeptic pass refuted it using the same filing.** SpaceX sat in the non-marketable bucket until it listed on June 12, so its step-up to the IPO price ran through that very line: the Q2 roll-forward shows roughly $74.8 billion of carrying value leaving the measurement-alternative bucket, against 551,189,500 shares × the $135 IPO price = $74.41 billion — a 0.6% match. The gain **is** primarily SpaceX. The 69% figure was also misapplied: it is the share of net income attributable to the *entire* $99.0 billion gain after tax, not to one slice, and it was originally computed by dividing a pre-tax number by an after-tax one. The corrected reconstruction — roughly $60 billion SpaceX, $36 billion the private company — is stated in the analysis **as a reconstruction, because Alphabet discloses no split and neither does any source.**',
      },
      {
        kind: 'corrected',
        title:
          'The buyback-and-raise story that everyone told, including us, is not supported by the chronology',
        text: 'The tempting narrative: Alphabet stopped repurchasing and sold $49.6 billion of stock because its enormous new SpaceX stake is locked up and cannot fund anything. **Every number in that sentence is right and the causation is wrong.** Repurchases were already zero in Q1 2026 — the Q1 10-Q says so verbatim, with the same $69.5 billion remaining — six weeks before SpaceX listed and before any restriction existed. The equity and preferred priced June 4–5, ahead of the June 12 IPO. Alphabet gives a different reason four times over (“capital expenditures to scale AI infrastructure and global compute”), the CFO said the same on the call, and the 10-Q’s own risk factors note that an issuer may have to suspend repurchases while selling equity. The raise and the pause are a capex story that predates the listing.',
      },
      {
        kind: 'partly',
        title: 'The Cloud margin expansion is real, but not fully observable',
        text: 'The claim that no accounting estimate manufactured the 20.7% → 35.6% expansion **holds** — no useful-life change is disclosed, the six-year server life stands, depreciation rose ~42%. Two caveats survive. Alphabet extended data-centre and office-building lives from a maximum of 25 to 40 years between the FY2023 and FY2024 10-Ks with no change-in-estimate disclosure or quantification anywhere; that predates the comparison period so it cannot manufacture the expansion, but “last changed January 2023” is true only of servers. And Note 15 confirms technical-infrastructure depreciation is allocated to segments on usage, headcount or revenue without disclosing the amount — so allocation cannot be excluded from the filing, only from the narrative.',
      },
      {
        kind: 'partly',
        title: 'The AWS and Azure comparison, in both directions',
        text: 'The non-comparability holds and is sharper than first stated: Alphabet’s segments do not sum to consolidated operating income while Amazon’s do exactly, because shared frontier-model R&D sits unallocated. But two details were overstated. Workspace is in the year-ago base too, so it distorts the *level*, not the growth rate. And the unallocated Alphabet-level loss grew 72%, which is faster than total revenue (+24%) but **slower** than Google Cloud (+82%) — so it is not evidence that Cloud’s margin is being flattered at an accelerating rate.',
      },
      {
        kind: 'partly',
        title: 'The $811 billion is real but the 5.4× is not clean',
        text: '“Long-term supply agreements” appears nowhere in the FY2025 10-K, which used a narrower measurement basis; the companion Note 10 disclosure went $7.7B (content licences only) → $232.7B → $707.0B on an acknowledged scope widening in Q1 2026. Part of the increase is **expanded disclosure, not new spending**, and the two cannot be separated from public filings. One component also moved the other way: variable-interest-entity commitments fell 46% during Q2 as the milestone-contingent portion went $40.0B → $20.0B. The buildout is nonetheless real, evidenced independently by capex, the raise and the cash flow.',
      },
      {
        kind: 'partly',
        title: 'The clean EPS anchor of $2.84 embeds an unexplained tax rate',
        text: 'Backing out the footnoted $21.9 billion leaves an 11.7% residual effective rate on the operating business, against 16.9% a year ago. The skeptic pass killed the tempting explanation — that $21.9B is a lazy statutory-rate allocation — by showing 22.1% **is** Alphabet’s statutory rate (21.0% federal + 1.0% state), that ASC 740 *requires* a deferred tax liability on an unrealised mark to be measured at the enacted rate, and that the two methods converge here because Alphabet’s rate-reducing items (FDII, R&D credits, foreign tax credits, stock comp) are operations-generated and do not attach to an equity mark. The residual decline is real but about half the headline size: 14.1% versus 16.3% on a six-month basis. Normalising at that rate gives about $2.76 rather than $2.84.',
      },
    ],
  },
  openQuestions: [
    'Which private company is the $87.9 billion Level 2 remeasurement? Alphabet names SpaceX four times and the other holding zero times, discloses no ownership percentage and no cost basis, and the position now sits inside a $124.3 billion non-marketable book.',
    'What is the split of the $99.0 billion between SpaceX and the private company? Alphabet does not disclose it, no press source has it, and the roughly $60B/$36B figure in this report is reconstructed from the measurement-alternative roll-forward.',
    'How much of Google Cloud’s technical-infrastructure depreciation is allocated to the segment? Note 15 says it is allocated on usage, headcount or revenue, and never says how much — which is the one number that would settle whether the 35.6% margin is comparable to AWS’s 39.4%.',
    'Why did the operating-business tax rate fall about two points with no explanation in either the 10-Q or the call, and how much of it is stock-comp windfall that unwinds if the share price does?',
  ],
  soWhat: `Here is the habit this quarter is worth, and it takes about ten seconds.

**When a company reports a profit, check whether the cash moved.**

Alphabet reported $112 billion of net income. $77 billion of it came from writing up the value of shares it owns in other companies — not from selling them. Of a $99 billion gain, **$278 million was actually realised**. Everything else was a re-pricing. You do not have to take anyone’s word for this: the cash flow statement removes the entire $99 billion on the next page, in a line called “gain on debt and equity securities, net.” That subtraction is the company telling you, in its own filing, that the profit was not cash.

And here is the part that makes it more than a technicality. The largest of those stakes — SpaceX — was worth $94 billion when the quarter closed on June 30. By August 20 the same shares were worth about $73 billion. **Roughly a fifth of the biggest profit ever reported evaporated in seven weeks**, and no money ever changed hands in either direction.

The practical version, and it works on any company: **find operating income, then find net income.** Operating income is what the business earned by doing its job. Net income is that plus everything else that happened — investments, one-off gains, tax items, asset sales. When the two disagree by a lot, the disagreement *is* the story, and it is usually in the paragraph nobody quotes.

There is a second habit hiding in this one. When a stock screener showed Alphabet on a P/E of 17 while the forward P/E was 26, that impossible pair was the tell. **A trailing multiple below a forward multiple, on a growing company, means the trailing earnings contain something that is not coming back.** You do not need a filing to spot that — just the willingness to notice when two numbers on the same screen cannot both be describing the same business.`,
  throughLine: {
    text: `This section has now looked at eight companies in the same AI-capital cycle, and Alphabet is the one that was supposed to be immune.

The recurring finding across these reports is that **the number in the headline is not the number the filing supports**, and it keeps arriving the same way: a non-cash mark on a stake in another company. Microsoft’s headline EPS growth was powered by a mark on a private stake. Nebius has never earned an operating profit and every dollar of bottom-line profit it has shown is a revaluation of its ClickHouse stake. Alphabet is the same mechanism at a scale that dwarfs both — $99.0 billion in one quarter, and $36.9 billion in the quarter before it.

It also closes a loop this section opened itself. The mark that drives Alphabet’s record quarter was created by the **SpaceX IPO** — the event covered here in June, from the other side. One report’s catalyst is another’s accounting entry.

Ranked by capital spending against revenue: Palantir at 0.75%, Microsoft around 32%, **Alphabet at 37.5%**, Amazon at roughly 105% of operating cash flow, SpaceX at 235%, CoreWeave at about 290%, and Nebius’s first half at 828%. AMD sits outside the scale entirely — it sells the chips the rest are buying. Alphabet lands near the low end of that ladder and still could not fund the quarter from operations, which is the most useful single fact in this report: **at the current pace of the buildout, being the most profitable company in the world is not sufficient.**`,
    links: [
      {
        label: 'SPCX — the IPO that created this mark',
        slug: 'spcx-q2-2026',
      },
      {
        label: 'MSFT — the same mechanism, one quarter earlier',
        slug: 'msft-q4-fy2026',
      },
      {
        label: 'NBIS — the same mechanism, all of the profit',
        slug: 'nbis-q2-2026',
      },
    ],
  },
  method: {
    kind: 'earnings',
    perspectives: [
      {
        role: 'Fundamentals analyst',
        probe:
          'Segment margins, cash generation, and what the operating business actually earned.',
      },
      {
        role: 'Short seller',
        probe: 'What breaks the bull case, and by what mechanism.',
      },
      {
        role: 'Industry engineer',
        probe: 'Whether the technology and the moat are real.',
      },
      {
        role: 'Valuation watcher',
        probe: 'What the price already assumes.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 6,
    claimsVerified: 6,
    verificationScope: 'top-n',
    agentCount: 12,
    runDate: '2026-08-20',
  },
  cardImage: '/images/content/goog-q2-2026-card-hero.webp',
  cardImageLight: '/images/content/goog-q2-2026-card-hero-light.webp',
  cardImageAlt: 'Google logo',
  sources: [
    {
      n: 1,
      label:
        'Alphabet Q2 2026 Form 8-K, Exhibit 99.1 — earnings release, income statement, cash flow, free-cash-flow reconciliation and the $21.9B / $77.1B / $6.26 footnote (2026-07-22)',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000066/googexhibit991q22026.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 2,
      label:
        'Alphabet Q2 2026 Form 10-Q — equity-securities decomposition, the SpaceX restriction footnotes, Note 10 purchase commitments, Note 11 the June offerings, Note 14 income taxes, Note 15 segment allocation',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000071/goog-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 3,
      label:
        'Alphabet Q1 2026 Form 10-Q — “In the three months ended March 31, 2026, there were no repurchases”, the chronology that refutes the buyback narrative',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000048/goog-20260331.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 4,
      label:
        'Alphabet Form 13F-HR (2026-08-07) — 551,189,500 SpaceX Class A shares at $94,176,237,970',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000073/information_table.xml',
      primary: true,
      kind: 'filing',
    },
    {
      n: 5,
      label:
        'Alphabet FY2025 Form 10-K — the six-year server useful life and the statutory rate reconciliation',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 6,
      label: 'Alphabet EDGAR filing index (CIK 0001652044)',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001652044&type=10-Q&dateb=&owner=include&count=10',
      primary: true,
      kind: 'filing',
    },
    {
      n: 7,
      label: 'Amazon Form 8-K Exhibit 99.1 (earnings release) filed 2026-07-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000024/amzn-20260630xex991.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 8,
      label:
        'Microsoft Form 8-K Exhibit 99.1 (earnings release) filed 2026-07-29',
      url: 'https://www.sec.gov/Archives/edgar/data/789019/000119312526323632/msft-ex99_1.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 9,
      label: 'Alphabet Form 424B2 filed 2026-08-07',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000119312526340264/d32286d424b2.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 10,
      label: 'SEC EDGAR — Alphabet filing index',
      url: 'https://data.sec.gov/submissions/CIK0001652044.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 11,
      label: 'Alphabet Form 10-Q, period ended 2025-06-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204425000062/goog-20250630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 12,
      label: 'Amazon Form 10-Q, period ended 2026-06-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000026/amzn-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 13,
      label: 'Alphabet Form 10-K, period ended 2024-12-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204425000014/goog-20241231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 14,
      label: 'Alphabet Form 10-K, period ended 2023-12-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204424000022/goog-20231231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 15,
      label: 'Alphabet Form 10-Q, period ended 2025-09-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204425000091/goog-20250930.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 16,
      label:
        'Alphabet IR — Q2 2026 earnings release (PDF, the IR copy of the 8-K exhibit)',
      url: 'https://s206.q4cdn.com/479360582/files/doc_financials/2026/q2/2026q2-alphabet-earnings-release.pdf',
      kind: 'company',
    },
    {
      n: 17,
      label: 'Alphabet IR — Q2 2026 Form 10-Q (PDF)',
      url: 'https://s206.q4cdn.com/479360582/files/doc_financials/2026/q2/GOOG-10-Q-Q2-2026.pdf',
      kind: 'company',
    },
    {
      n: 18,
      label: 'About Amazon — Amazon Q2 2026 earnings report: Read the release',
      url: 'https://www.aboutamazon.com/news/company-news/amazon-earnings-q2-2026-report',
      kind: 'company',
    },
    {
      n: 19,
      label: 'Microsoft — FY26 Q4 - Press Releases - Investor Relations',
      url: 'https://www.microsoft.com/en-us/investor/earnings/fy-2026-q4/press-release-webcast',
      kind: 'company',
    },
    {
      n: 20,
      label: 'Google Cloud documentation — TPU7x (Ironwood)',
      url: 'https://docs.cloud.google.com/tpu/docs/tpu7x',
      kind: 'company',
    },
    {
      n: 21,
      label:
        'Google — The Keyword — Sundar Pichai shares news from Google Cloud Next 2026',
      url: 'https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/cloud-next-2026-sundar-pichai/',
      kind: 'company',
    },
    {
      n: 22,
      label: 'Anthropic — Expanding our use of Google Cloud TPUs and Services',
      url: 'https://www.anthropic.com/news/expanding-our-use-of-google-cloud-tpus-and-services',
      kind: 'company',
    },
    {
      n: 23,
      label:
        'Anthropic — Anthropic expands partnership with Google and Broadcom for multiple gigawatts of next-generation compute',
      url: 'https://www.anthropic.com/news/google-broadcom-partnership-compute',
      kind: 'company',
    },
    {
      n: 24,
      label:
        'Google — The Keyword — Google signed 1 GW of data center demand response',
      url: 'https://blog.google/innovation-and-ai/infrastructure-and-cloud/global-network/demand-response-data-center-milestone/',
      kind: 'company',
    },
    {
      n: 25,
      label: 'Google — The Keyword — Google completes acquisition of Wiz',
      url: 'https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/wiz-acquisition/',
      kind: 'company',
    },
    {
      n: 26,
      label:
        'Alphabet Q2 2026 earnings call transcript — capex guidance of $195–205B, the balance-sheet rationale, TPU system revenue timing',
      url: 'https://stockanalysis.com/stocks/googl/transcripts/657320-q2-2026/',
      kind: 'data',
    },
    {
      n: 27,
      label:
        'stockanalysis.com — GOOGL price, market cap, trailing and forward P/E, price to free cash flow',
      url: 'https://stockanalysis.com/stocks/googl/statistics/',
      kind: 'data',
    },
    {
      n: 28,
      label:
        'stockanalysis.com — SPCX price, for the mark-to-market since June 30',
      url: 'https://stockanalysis.com/stocks/spcx/',
      kind: 'data',
    },
    {
      n: 29,
      label: 'Macrotrends — Alphabet PE Ratio 2012-2026 | GOOGL',
      url: 'https://www.macrotrends.net/stocks/charts/GOOGL/alphabet/pe-ratio',
      kind: 'data',
    },
    {
      n: 30,
      label:
        'QuiverQuant — Alphabet Stock (GOOGL) Opinions on Recent AI Developments and Earnings',
      url: 'https://www.quiverquant.com/news/Alphabet+Stock+(GOOGL',
      kind: 'data',
    },
    {
      n: 31,
      label: 'stockanalysis.com — Microsoft (MSFT) Statistics & Valuation',
      url: 'https://stockanalysis.com/stocks/msft/statistics/',
      kind: 'data',
    },
    {
      n: 32,
      label: 'stockanalysis.com — Amazon.com (AMZN) Statistics & Valuation',
      url: 'https://stockanalysis.com/stocks/amzn/statistics/',
      kind: 'data',
    },
    {
      n: 33,
      label: 'stockanalysis.com — Meta Platforms (META) Statistics & Valuation',
      url: 'https://stockanalysis.com/stocks/meta/statistics/',
      kind: 'data',
    },
    {
      n: 34,
      label:
        'Macrotrends — Space Exploration Technologies - Stock Price History | SPCX',
      url: 'https://www.macrotrends.net/stocks/charts/SPCX/spacex/stock-price-history',
      kind: 'data',
    },
    {
      n: 35,
      label:
        'CNBC — SpaceX lockup, first tranche of 911.5M shares released 2026-08-06',
      url: 'https://www.cnbc.com/2026/08/06/spacex-faces-test-as-shares-unlock-allowing-early-investors-cash-out.html',
      kind: 'analysis',
    },
    {
      n: 36,
      label:
        'Schaeffer’s Research — the July 23 reaction, worst day in fourteen months on the capex guide',
      url: 'https://www.schaeffersresearch.com/content/news/2026/07/23/alphabet-stock-eyes-worst-day-in-14-months-on-capex-spending',
      kind: 'analysis',
    },
    {
      n: 37,
      label:
        "The Motley Fool — Alphabet Just Revealed a $94 Billion Stake in SpaceX -- and It Can't Sell a Single Share Yet",
      url: 'https://www.fool.com/investing/2026/07/23/alphabet-just-revealed-a-94-billion-stake-in-space/',
      kind: 'analysis',
    },
    {
      n: 38,
      label: 'Investing.com — Alphabet Q2 2026 earnings call transcript',
      url: 'https://www.investing.com/news/transcripts/earnings-call-transcript-alphabet-beats-q2-2026-estimates-as-93CH-4807140',
      kind: 'analysis',
    },
    {
      n: 39,
      label:
        'Investing.com — Alphabet beats Q2 2026 estimates, shares fall on capex surge (call transcript)',
      url: 'https://www.investing.com/news/transcripts/earnings-call-transcript-alphabet-beats-q2-2026-estimates-shares-fall-on-capex-surge-93CH-4807140',
      kind: 'analysis',
    },
    {
      n: 40,
      label: 'SemiAnalysis — Google TPUv7: The 900lb Gorilla In the Room',
      url: 'https://newsletter.semianalysis.com/p/tpuv7-google-takes-a-swing-at-the',
      kind: 'analysis',
    },
    {
      n: 41,
      label:
        'DataCenterDynamics — Google increases server life to six years will save billions of dollars',
      url: 'https://www.datacenterdynamics.com/en/news/google-increases-server-life-to-six-years-will-save-billions-of-dollars/',
      kind: 'analysis',
    },
    {
      n: 42,
      label:
        'DataCenterDynamics — Google signs power deal with nextenergy to restart iowas 615mw duane arnold nuclear plant for ai data centers',
      url: 'https://www.datacenterdynamics.com/en/news/google-signs-power-deal-with-nextenergy-to-restart-iowas-615mw-duane-arnold-nuclear-plant-for-ai-data-centers/',
      kind: 'analysis',
    },
    {
      n: 43,
      label:
        'The Motley Fool — Stock Market Today, July 23: Alphabet Slides 7% After Announcing 2026 Capex of Roughly $200 Billion',
      url: 'https://www.fool.com/coverage/stock-market-today/2026/07/23/stock-market-today-july-23-alphabet-slides-7-after-announcing-2026-capex-of-roughly-usd200-billion/',
      kind: 'analysis',
    },
    {
      n: 44,
      label:
        'Yahoo Finance — Google falls more than 6% on capex growth expectations despite earnings beat',
      url: 'https://finance.yahoo.com/technology/article/google-falls-more-than-6-on-capex-growth-expectations-despite-earnings-beat-202407124.html',
      kind: 'analysis',
    },
    {
      n: 45,
      label: 'CNBC — Google (GOOG) Q2 2026 earnings report: Live updates',
      url: 'https://www.cnbc.com/2026/07/22/google-earnings-q2-goog-live-updates.html',
      kind: 'analysis',
    },
    {
      n: 46,
      label:
        'CNBC — SpaceX stock rebounds, closing above $135 IPO price for first time in weeks',
      url: 'https://www.cnbc.com/2026/08/10/spacex-spcx-stock-ipo-price.html',
      kind: 'analysis',
    },
    {
      n: 47,
      label: 'Quartz — Amazon Q2 2026 earnings and AWS cloud growth',
      url: 'https://qz.com/amazon-q2-2026-earnings-aws-cloud-growth-073026',
      kind: 'analysis',
    },
    {
      n: 48,
      label:
        'Fortune — Anthropic and SpaceX just handed Google the biggest profit quarter in company history—on paper',
      url: 'https://fortune.com/2026/07/22/anthropic-spacex-investments-google-earnings-biggest-ever-profit-quarter/',
      kind: 'analysis',
    },
    {
      n: 49,
      label:
        "Bloomberg — Alphabet's future spending commitments soar to $811 billion",
      url: 'https://www.bloomberg.com/news/articles/2026-07-23/alphabet-s-future-spending-commitments-soar-to-811-billion',
      kind: 'analysis',
    },
    {
      n: 50,
      label: 'Steady Compounding — Alphabet Q2 2026: The $707 Billion Footnote',
      url: 'https://steadycompounding.com/investing/alphabet-q2-2026/',
      kind: 'analysis',
    },
  ],
};

const aiCapexThesis2026: MarketStormReport = {
  slug: 'ai-capex-abundance-or-bubble',
  ticker: 'AI CAPEX',
  company: 'The hyperscaler buildout',
  title:
    'IT investment just passed its dot-com peak — and three of the four biggest spenders stopped paying for it out of cash',
  excerpt:
    'Private fixed investment in information-processing equipment and software reached 4.97% of GDP in Q2 2026 — the highest reading in the 79 years BEA has published the series, above the 4.46% of the dot-com peak. Over the same year, the share of hyperscaler capital spending funded by long-term debt went from 25% to 65%. This report tested 33 load-bearing claims against 83 primary documents. None was refuted, and the answer to "boom or bubble" is neither: the risk moved from the asset side to the liability side, and the largest single disclosed exposure rests on a consolidation judgment the auditor flagged by name.',
  catalyst: 'Standing thesis — verified against filings through August 2026',
  publishDate: '2026-08-22',
  featured: true,
  tags: ['AI-infrastructure', 'capex', 'earnings-quality', 'macro', 'thesis'],
  verdict:
    'Neither a boom that pays for itself nor a bubble about to pop. Across 33 load-bearing claims checked against 83 primary documents, not one was refuted — and what survived is that the risk moved. It is no longer in the valuations, and it is not in the depreciation schedules: three of the four biggest spenders shortened or held their asset lives. It is in leases that have not commenced, guarantees that are not liabilities yet, and one consolidation judgment the auditor called out by name.',
  priceStrip: [
    { k: 'IT investment / GDP', v: '4.97%', tone: 'warn' },
    { k: 'Dot-com peak, 2000Q4', v: '4.46%' },
    { k: 'Big-four TTM capex', v: '$510.7B' },
    { k: 'Debt-funded, H1 2026', v: '65%', tone: 'bear' },
    { k: 'Debt-funded, H1 2025', v: '25%' },
    { k: 'Claims refuted', v: '0 of 33', tone: 'bull' },
  ],
  summary: `Two things are true at once, and almost every argument about an AI bubble picks one and ignores the other.

The first: **the money is real and it is enormous.** The four biggest spenders put **$510.7 billion** into capital equipment in the twelve months to June 2026 — about **1.57% of the entire US economy**, and roughly **32%** of everything America spent on information-processing equipment and software. That line item is now **4.97% of GDP, the highest since the series began in 1947**, above the dot-com peak.

The second: **it has stopped being paid for out of earnings.** A year ago, Meta, Alphabet and Amazon funded about a quarter of their capital spending with borrowed money. In the first half of 2026 they funded **almost two-thirds** of it that way. Amazon went from 1.3% to 68%. Alphabet stopped buying back its own stock and raised $105.8 billion of outside capital in six months instead.

What this report went looking for was the mechanism that breaks. It did not find the one everybody names. It found a different one, and it is not in the numbers on the income statement — it is in the obligations sitting just off the edge of the balance sheet.`,
  headlineVsReal: [
    {
      headline:
        'The hyperscalers are **stretching depreciation schedules** to manufacture earnings — the oldest trick in the capital-intensive playbook.',
      real: 'Not in the current filings. **Amazon shortened.** Microsoft held. Meta lengthened once, eighteen months ago.',
      gap: 'Effective 1 January 2025 Amazon moved **a subset of servers and networking equipment from six years to five** — costing it **$1.4B of extra depreciation, $1.0B of net income and $0.10 a share**, primarily at AWS, and citing the pace of AI development as the reason. Microsoft still discloses **“two to six years”**, unchanged. Meta is the one lengthener: its FY2025 10-K raised most servers to **5.5 years**, worth **$2.92B less depreciation and $1.00 a share** — real, disclosed, and quantified, but a single change already in the base. This is the most-repeated bear argument in the sector and the filings do not support it today. A short thesis that rests on it is resting on 2023.',
    },
    {
      headline:
        'A **power and transformer stall** will halt the buildout — the queues are years long and the equipment is sold out.',
      real: 'Slippage runs in **quarters, not years**, and the binding constraint in 2026 turned out to be **paperwork**.',
      gap: 'We ran a cohort test on EIA-860M rather than quoting queue statistics: of **590 units and 49,221 MW** promising commercial operation in the first half of 2026, by the June vintage **54.3% were operating**, 44.0% were still planned and only **0.7% had been cancelled**. Median slip: **four months**. Only **1.9% of slipped megawatts** moved out beyond a year. Meanwhile ERCOT’s first large-load batch screened out **~294 GW of a 498 GW universe on eligibility alone** — 274 GW had filed no qualifying study, 20 GW missed a dynamic-model deadline. That is an administrative gate, not a physical one. The equipment story is real but it is **rationing, not a wall**: GE Vernova booked 12.1 GW of gas turbine orders in Q2 and shipped 3.3 GW, roughly 4:1, with shipments actually *down* year over year.',
    },
    {
      headline:
        '**“The Fed found AI raises productivity by 1.1%”** — the number that ends most arguments about whether any of this works.',
      real: 'It is a **modelled figure derived from a survey question**, not a measurement, and its own authors say so.',
      gap: 'Bick, Blandin and Deming asked workers to imagine a counterfactual — *“imagine that LAST WEEK you did not have access to Generative AI. How many additional hours of work would you have needed?”* — then fed the self-reported answer through **“a standard model of aggregate production”**, wage-weighted, from 5.4% of hours saved among users and 1.4% across all workers. The authors head a section **“Potential Gains May Not Yet Be Fully Captured in Measured Productivity”** and flag on-the-job leisure themselves. The November 2025 update revised it to **up to 1.3%** — and, to their credit, added an independent check against BLS and BEA industry data, correlation 0.32, which they explicitly say **“cannot be interpreted as causal.”** Meanwhile the measured series disagrees: **utilization-adjusted total factor productivity fell 0.42%** over the four quarters to Q2 2026 while labour productivity rose 2.2% — which is the signature of capital deepening bought by the capex itself, not of a technology making workers better.',
    },
  ],
  kpis: [
    {
      label: 'IT investment, share of GDP',
      value: '4.97%',
      delta: 'highest since 1947',
      note: 'Above the 4.46% dot-com peak. Top four readings in 79 years are the last four quarters.',
      tone: 'warn',
    },
    {
      label: 'Debt-funded capex share',
      value: '65%',
      delta: 'from 25% a year ago',
      note: 'Meta, Alphabet and Amazon, first half. Amazon went 1.3% → 68%.',
      tone: 'bear',
    },
    {
      label: 'Big-four capex, TTM',
      value: '$510.7B',
      delta: '1.57% of GDP',
      note: 'About 32% of all US information-processing equipment and software investment.',
      tone: 'neutral',
    },
    {
      label: 'Leases not yet commenced',
      value: '$830B',
      delta: 'four filers',
      note: 'Microsoft $329.1B · Meta $279.0B · Amazon $137.2B · Alphabet $85.2B. On no balance sheet.',
      tone: 'bear',
    },
    {
      label: 'Meta’s exposure on one venture',
      value: '$46.0B',
      delta: 'vs $2.9B carried',
      note: 'A 15.8× gap. The auditor made the consolidation judgment a critical audit matter.',
      tone: 'warn',
    },
    {
      label: 'Utilization-adjusted TFP',
      value: '−0.42%',
      delta: 'four quarters to Q2',
      note: 'Labour productivity rose 2.2% — the gain is capital deepening, not efficiency.',
      tone: 'bear',
    },
    {
      label: 'Microsoft debt raised for capex',
      value: '$0',
      delta: '2nd straight year',
      note: '$115.9B of capex, funded from $182.9B of operating cash — and still bought back stock.',
      tone: 'bull',
    },
    {
      label: 'Claims refuted by verification',
      value: '0 of 33',
      delta: '100% primary-sourced',
      note: '30 needed a correction. None collapsed.',
      tone: 'bull',
    },
  ],
  printTableTitle: 'The figures this thesis rests on',
  printTable: {
    columns: [
      { label: 'Figure' },
      { label: 'Value', align: 'right' },
      { label: 'Comparison', align: 'right' },
      { label: 'Source' },
    ],
    rows: [
      {
        cells: [
          'IT equipment + software investment, share of GDP',
          '4.97%',
          'vs 4.46% in 2000Q4',
          'BEA — highest of 318 quarters since 1947',
        ],
        star: true,
      },
      {
        cells: [
          'Big-four capex, twelve months to 2026-06-30',
          '$510.70B',
          '1.57% of GDP',
          'XBRL: MSFT $115.95B · AMZN $173.03B · GOOGL $132.40B · META $89.33B',
        ],
        star: true,
      },
      {
        cells: [
          'Capex funded by long-term debt, H1 2026',
          '64.9%',
          'from 25.4%',
          '$148.1B of $228.1B — Meta, Alphabet, Amazon cash flow statements',
        ],
        star: true,
      },
      {
        cells: ['— Meta', '51%', 'from 0%', '$24.91B of $49.11B'],
      },
      {
        cells: ['— Amazon', '68%', 'from 1.3%', '$67.00B of $98.41B'],
      },
      {
        cells: [
          '— Alphabet',
          '70%',
          'from 79%',
          '$56.23B of $80.60B — the one that fell',
        ],
      },
      {
        cells: [
          '— Oracle, FY2026',
          '~98%',
          'from 0% in FY2024',
          'Capex $55.66B (+162%), 83% of revenue; free cash flow −$23.69B',
        ],
      },
      {
        cells: [
          '— Microsoft, FY2026',
          '0%',
          '2nd straight year',
          '$115.95B capex, $0 debt issued, $22.3B repurchased',
        ],
        star: true,
      },
      {
        cells: [
          'Leases not yet commenced',
          '~$830B',
          'four filers',
          'MSFT $329.1B · META $279.0B · AMZN $137.2B · GOOGL $85.2B',
        ],
        star: true,
      },
      {
        cells: [
          'Meta “Venture” maximum exposure to loss',
          '$46.03B',
          'vs $2.92B carrying value',
          '20% interest; ~$28B residual value guarantee; EY critical audit matter',
        ],
        star: true,
      },
      {
        cells: [
          'Alphabet credit-derivative backstops to data-centre entities',
          '$43.79B',
          'from $16.94B in 6 months',
          'Recognised fair-value liability just $815M',
        ],
      },
      {
        cells: [
          'Oracle remaining performance obligations',
          '$638B',
          'from $138B (+362%)',
          'Revenue +17%. Only ~12% converts within 12 months',
        ],
      },
      {
        cells: [
          'Microsoft commercial RPO',
          '$678B',
          '+84%',
          'Weighted-average duration ~2.3 years; ~30% inside 12 months',
        ],
      },
      {
        cells: [
          'Amazon customer commitments not yet recognised',
          '~$496B',
          'from $244B in six months',
          'Weighted-average remaining life 6.4 years',
        ],
      },
      {
        cells: [
          'CoreWeave total liabilities / equity',
          '$72.0B / $5.0B',
          '90% of debt recourse',
          'Net interest expense $640M = 24.9% of revenue',
        ],
      },
      {
        cells: [
          'CCC & lower high-yield spread',
          '10.35%',
          'broad HY 2.75%, IG 0.82%',
          'Widest CCC print of 2026 — but stress is confined to that tier',
        ],
      },
      {
        cells: [
          'Utilization-adjusted total factor productivity',
          '−0.42%',
          'four quarters to 2026Q2',
          'SF Fed. Labour productivity +2.2% over the same window',
        ],
        star: true,
      },
      {
        cells: [
          'Gas capacity entering service, H1 2026',
          '2.89 GW',
          'pipeline claims 11.3 GW in 2027',
          'EIA-860M. A ~3.2× step-up demanded of the supply chain',
        ],
      },
      {
        cells: [
          'Median slip, units promising H1 2026 operation',
          '4 months',
          '0.7% cancelled',
          'EIA-860M cohort test, 590 units / 49,221 MW',
        ],
        star: true,
      },
    ],
  },
  bull: [
    'The demand is contracted, not hoped for. Microsoft carries $678B of commercial remaining performance obligations at a ~2.3-year weighted duration with ~30% landing inside twelve months; Amazon discloses ~$496B of customer commitments not yet recognised; CoreWeave reports 98% of revenue under committed take-or-pay contracts.',
    'The platform layer is profitable and getting more so. Google Cloud went from a 20.7% operating margin to 35.6% in a year — and Q1 was 32.9%, so it is a trend rather than a one-quarter artifact.',
    'Nobody is hiding the ball on depreciation. Amazon shortened server lives and took a $1.0B net income hit to do it. Microsoft has not moved. The single most-cited earnings-quality bear argument is simply not present in the current filings.',
    'The physical constraint is rationing, not a wall. Half of the capacity promising to arrive in H1 2026 arrived; the median slip was four months; 0.7% was cancelled.',
    'Microsoft proves the buildout can be funded from operations at full scale: $115.9B of capex, zero debt issued for a second consecutive year, and $22.3B of stock still repurchased.',
  ],
  bear: [
    'The obligation has moved somewhere the balance sheet does not show it. Roughly $830B of leases have been signed and not yet commenced across four filers, against a data-centre securitization market a fraction of that size.',
    'Meta discloses a maximum exposure to loss of $46.03B on a venture it carries at $2.92B, and stays unconsolidated by conceding it does not control the campus remarketing. Ernst & Young made that judgment a critical audit matter — an auditor publicly signalling the answer is contestable.',
    'Alphabet’s credit-derivative backstops to data-centre entities went from $16.94B to $43.79B in six months, with only $815M recognised as a liability.',
    'The funding mix inverted in a single year: 25% to 65% debt-funded. Amazon’s trailing free cash flow is now negative $7.6B against +$18.2B a year earlier, and Oracle funded ~98% of a 162% capex increase with borrowed money.',
    'The productivity is not in the aggregate data. Utilization-adjusted TFP fell 0.42% over the year to Q2 2026 while the investment share of GDP hit a 79-year high — the measured gain is capital deepening bought by the spending itself.',
    'Backlog quality varies enormously and the weakest is the largest: only ~12% of Oracle’s $638B RPO converts within twelve months.',
  ],
  theQuestion: `Every argument about an AI bubble is really an argument about where the risk sits.

The bears point at valuations and depreciation schedules. This report checked both against the filings and neither is where the fragility is: three of the four biggest spenders shortened or held their asset lives, and the platform margins are expanding.

But in the same twelve months, the share of the buildout funded by borrowed money went from a quarter to two-thirds, roughly $830 billion of leases were signed that have not commenced, and the single largest disclosed exposure is a $46 billion number sitting against a $2.9 billion carrying value on a judgment the auditor flagged.

So: is this a boom being financed prudently against contracted demand — or has the industry moved its risk to the one place quarterly earnings do not report it?`,
  analysis: `## What this run did differently, and why it matters

This question was researched once before, on 2026-08-21, and that pass is the reason this one exists. Web fetching was blocked in that environment, so **no agent opened a single primary filing** — every figure was search-surfaced text *about* a document. Of 45 load-bearing claims, only 3 survived unchanged: 21 needed correcting, 12 could not be verified at all, and **9 were refuted outright**. The failure modes were consistent: stale figures quoted in the present tense, numbers misattributed between banks, and a dozen outlets restating one analyst note being mistaken for a dozen sources.

This run opened **83 primary documents**. Of 33 load-bearing claims, **every one was checked against a primary source**, and the tally is: **3 confirmed clean, 30 confirmed with a correction, 0 refuted, 0 unverifiable.**

That difference — 9 refuted and 12 unverifiable, versus none of either — is the single best argument for the method this section is built on. The corrections that remain are refinements of magnitude and basis, not demolitions. Where the earlier pass concluded that a power-and-transformer *stall* was the likeliest outcome, the physical data does not support it, and that conclusion has been dropped.

## The finding: the risk moved, it did not disappear

Start with the thing that is genuinely unprecedented. Private fixed investment in information-processing equipment and software reached **4.97% of GDP in 2026Q2** — the highest of the **318 quarters** BEA has published since 1947, above the **4.46%** of the dot-com peak in 2000Q4 and far above 1995Q1's 3.24%. The **top four readings in seventy-nine years are the last four quarters.**

Worth being precise about the deflator, because it cuts the opposite way from the usual objection: IT prices fall while the GDP deflator rises, so a real-terms comparison *flatters today* rather than 2000. In real terms the gap is roughly **3.6×**, against 1.11× in nominal terms. Recomputing in real terms reinforces the headline rather than reversing it.

Against that, the four biggest spenders put **$510.70 billion** into capital equipment in the twelve months to June 2026 — **1.57% of GDP at an annual rate**, and **31.7%** of the entire national information-processing equipment-and-software line. Two caveats travel with that 31.7%, one of which the original claim had backwards: data-centre shells and land are counted as *structures*, not IT equipment, so they cannot appear in the denominator at all — and excluding finance leases makes the capex figure **too small**, not too large. Microsoft alone added **$24.6B of finance-lease right-of-use assets** in FY2026 on top of the $115.9B, with a further **$329.1B of datacenter leases not yet commenced**.

## Where the money now comes from

This is the change that happened inside twelve months, and it is the spine of the thesis.

| | H1 2025 | H1 2026 |
| --- | --- | --- |
| Meta | 0% | **51%** |
| Amazon | 1.3% | **68%** |
| Alphabet | 79% | **70%** |
| **Combined** | **25.4%** | **64.9%** |

That is the share of cash capital spending covered by long-term debt proceeds — **$148.1B against $228.1B** in the first half of 2026. Alphabet is the one that fell, which matters: the shift is not uniform, and stating it as a clean industry-wide inversion overstates it.

Two other filings sharpen the picture from opposite ends. **Oracle** funded roughly **98%** of a **162% increase** in capex with borrowed money — $46.09B of notes and term loans plus $3.35B of short-term capex financing plus $4.95B of mandatory convertible preferred, against **zero debt issuance in FY2024**. Its borrowings went **$92.6B to $129.5B in one year** and free cash flow was **−$23.69B**.

And **Microsoft is the counterexample, at the largest scale of all**: FY2026 capex of **$115,948M** with **"Proceeds from issuance of debt: 0"** — its *second consecutive* year at zero — while still repurchasing $22.3B of stock and paying $26.4B of dividends out of $182.9B of operating cash flow. Any thesis that says "the industry can no longer fund this from earnings" has to explain the biggest spender doing exactly that.

Alphabet sits in between, and its behaviour is the most interesting: it took repurchases to **zero** in H1 2026 (from $28.31B) while leaving its $70.0B authorisation untouched, and raised **$30.50B of common stock** — including a $10.0B private placement to Berkshire Hathaway — plus **$19.06B of 6.25% mandatory convertible preferred**, on top of $56.23B of debt. **$105.8B of external capital in six months against $80.6B of capex.**

## The part that is not on the balance sheet

Here is the actual fragility, and it is not a valuation.

**Leases signed and not yet commenced**, at 30 June 2026: Microsoft **$329.1B**, Meta **$279.0B**, Amazon **$137.2B**, Alphabet **$85.2B**. Roughly **$830 billion** of contracted obligation that appears on no balance sheet because the leases have not started. For scale, that is many multiples of every data-centre securitization outstanding combined — the structure everyone watches is not where the exposure is.

Then the structures themselves. Meta's Louisiana venture — never named in the filing, just **"the Venture"** — is a 20% membership interest in roughly **$27B of estimated development cost**, with an aggregate initial lease commitment of **~$12.31B** commencing **2029**, and **residual value guarantees with an aggregate threshold of ~$28 billion**. Meta carries it at **$2.92B** and discloses a **maximum exposure to loss of $46.03B**. A **15.8× gap** between the carrying value and the company's own statement of what it could lose.

The reason it stays off the balance sheet is a single narrow judgment, quoted from the filing: decisions about **"remarketing the data center campus"** were determined to have the most significant impact on the Venture's economic performance, and *"we do not have the power to direct"* them. Meta simultaneously provides the venture's construction management and property management services.

**Ernst & Young made that a critical audit matter** — the third of three in the FY2025 audit — citing the *"significant judgment required in determining the activities that most significantly affect the VIE's economic performance."* That is an auditor stating publicly that the answer is contestable. A second structure on the same template, in El Paso, was disclosed as a subsequent event with a further **~$13B** of residual value guarantees.

Alphabet's version is different in form and the same in kind: **credit-derivative backstops to data-centre entities went from $16.94B to $43.79B in six months** — 2.6× — with a recognised fair-value liability of just **$815M**. On default, Alphabet *"retain[s] the right to assume the underlying leases for internal use or to sublease to third parties."*

## What is *not* wrong, and this is most of the bear case

Three widely-repeated arguments did not survive contact with the filings.

**Depreciation games are not live.** Amazon **shortened** a subset of servers from six years to five effective 1 January 2025, taking $1.4B of extra depreciation and $1.0B of net income to do it, citing AI-driven technology pace. Microsoft is unchanged at "two to six years." Meta is the only lengthener — most servers to 5.5 years, worth $2.92B and $1.00 a share — and that was eighteen months ago and is already in the base.

**The power wall is a rationing system, not a wall.** The cohort test is in the "headline vs the filing" section above; the summary is that half the promised capacity arrived, the median slip was four months, and 0.7% was cancelled. The equipment market is genuinely tight — GE Vernova is booking gas turbine orders roughly **4:1 against shipments**, and shipments actually **fell** year over year — and Siemens Energy's Grid Technologies book-to-bill of 1.48 on a €51bn backlog says transformers are queued and priced years out. But queued is not cancelled.

**Credit stress is real and confined.** The CCC & lower high-yield spread was **10.35%** on 20 August 2026, the widest print of 2026 — but broad high yield was **2.75%**, near its 2026 tight, and investment grade was **0.82%**. And the CCC level is still below the **11.37%** reached in April 2025, so this is a 2026 high rather than a multi-year extreme. The dispersion is the signal: the marginal borrower is being repriced while the index is not.

**CoreWeave is the marginal borrower made concrete**: **$72.0B of total liabilities on $5.0B of equity**, debt **90% recourse**, and net interest expense of **$640M — 24.9% of revenue** — against an operating loss of just $(49)M. Revenue grew 112%; the net loss more than doubled to $(626)M, and interest is the largest single contributor. The neocloud problem is the balance sheet, not the gross margin. Its disclosed **$5.1B of OEM and software license financing at 9–11%** is vendor financing named as such.

## Risk — each isolated, do not blur

1. **Off-balance-sheet obligation (dominant).** ~$830B of uncommenced leases, ~$41B of announced residual value guarantees at Meta alone, $43.8B of Alphabet backstops carried at $815M.
2. **The consolidation judgment.** One auditor has already flagged it. If a structure of this type consolidates, the change lands on the balance sheet of the largest companies in the index at once.
3. **Funding-mix reversal.** 25% to 65% in a year, with Amazon's trailing free cash flow now negative.
4. **Backlog conversion.** Oracle's $638B at ~12% inside twelve months is the weakest near-term conversion of any filer opened.
5. **Marginal-borrower credit.** Confined to CCC today; the transmission risk is that it stops being confined.
6. **The productivity gap.** Utilization-adjusted TFP negative while investment hits a 79-year high. If the efficiency never shows up, the depreciation does anyway.

## Horizon and sizing (kept separate)

**Horizon.** The near term is mechanical: whether the uncommenced-lease balances keep compounding, and whether any filer consolidates a venture of this type. The thesis resolves over **two to three years** on one question — do the contracted backlogs convert into cash at a margin that services the debt raised to build them?

**Sizing considerations (not a recommendation).** The single most useful discriminator in this report is not a growth rate; it is **who is funding the build from operations and who is funding it from capital markets.** Microsoft at zero debt and Oracle at 98% are running the same strategy with opposite balance sheets, and only one of them needs the credit window to stay open.`,
  invalidation: {
    bull: [
      'Any filer consolidates a data-centre venture of the Meta type, or an auditor escalates the critical audit matter — the off-balance-sheet obligation becomes an on-balance-sheet one across several megacaps at once.',
      'Uncommenced lease balances keep compounding at the H1 2026 rate while backlog conversion does not, widening the gap between contracted cost and contracted revenue.',
      'CCC spreads stop being confined — broad high yield follows the lowest tier wider, which is the transmission mechanism from marginal borrower to buildout.',
      'Amazon or Alphabet posts a second consecutive negative free-cash-flow year while capex guidance rises again.',
    ],
    bear: [
      'Utilization-adjusted TFP turns positive and stays there for consecutive quarters — the efficiency gain shows up in the aggregate data rather than only in task-level studies.',
      'The debt-funded share falls back toward the 2025 level as operating cash flow catches up with capex, with Microsoft the template rather than the exception.',
      'Oracle-style backlogs start converting at the rate the filings imply, particularly the ~12%-inside-12-months tranche.',
      'Uncommenced leases begin commencing on schedule and appear as ordinary lease liabilities without incident — the obligation was always real and always disclosed.',
    ],
  },
  verification: {
    confirmed: 3,
    partlyTrue: 30,
    corrected: 0,
    confirmedNote:
      'Confirmed against primary documents: 33 load-bearing claims were surfaced and all 33 went to an adversarial pass instructed to refute rather than check, opening 83 primary documents between them — SEC filings and XBRL facts, BEA and BLS series, San Francisco and St. Louis Fed research, EIA-860M workbooks, ERCOT and PJM auction filings. Not one claim was refuted and not one was unverifiable. Thirty needed a correction to a magnitude, a basis or a caveat, and the substantive ones are below.',
    items: [
      {
        kind: 'partly',
        title:
          'The uncommenced-lease total was understated by a third — it omitted Meta',
        text: 'The claim put leases not yet commenced at ~$551B across three filers. Verification found **Meta discloses a further $278.99B** through 2036, on terms up to 30 years, taking the real figure to roughly **$830B**. An error in the conservative direction, but the largest single component was missing.',
      },
      {
        kind: 'partly',
        title:
          'The funding shift is not uniform, and Alphabet moved the other way',
        text: 'The 25% → 65% inversion holds in aggregate ($148.1B of $228.1B, versus $32.1B of $126.3B). But **Alphabet’s gross debt-funded ratio FELL, from 79.2% to 69.8%** — the headline reads as an industry-wide inversion and two of the three companies drove it. Microsoft is a full counterexample, and it was at zero for a *second* consecutive year, not newly so.',
      },
      {
        kind: 'partly',
        title: 'The GDP-share caveat was backwards',
        text: 'The claim cautioned that a real-terms comparison would flatter 2000 over today. It is the reverse: because IT deflators fall while the GDP deflator rises, **a chained-real comparison flatters today** — roughly a 3.6× gap in real terms against 1.11× nominal. Recomputing in real terms reinforces the finding rather than reversing it. Separately, the 31.7% overlap figure is an upper bound because data-centre structures and land are not in the denominator at all, and excluding finance leases makes the numerator too small.',
      },
      {
        kind: 'partly',
        title: 'CoreWeave’s customer concentration did not actually improve',
        text: 'The largest single customer fell from 71% to 36% of revenue, which reads as diversification. It is not: **Customer B rose from under 10% to 26%** over the same period. Aggregate concentration is roughly unchanged; the composition rotated. Reading the top-customer line alone gives the opposite conclusion to the table it sits in.',
      },
      {
        kind: 'partly',
        title:
          'The "Fed productivity" study now has an external check its critics do not mention',
        text: 'The claim that the 1.1% figure is modelled from a self-reported counterfactual rather than measured is exactly right, and the authors say so themselves. But the **November 2025 update added a triangulation against BLS and BEA industry data** — detrended industry productivity growth correlated 0.32 with survey-measured time savings — while stating it *"cannot be interpreted as causal."* Anyone using this study to argue the gains are absent from the data should know the same authors now offer corroborating external evidence. Also: the 1.3% is a **cumulative level effect** since ChatGPT’s release, not an annual rate.',
      },
      {
        kind: 'partly',
        title: 'Fermi’s tenant lease did not exist at the balance-sheet date',
        text: 'The claim described an 11 GW project against one executed lease for 222 MW — roughly 50:1. Verification found it worse: **at 2026-06-30 there was no tenant lease at all.** The TensorWave lease came after. The ratio the claim used to illustrate the announced-versus-contracted gap was, at the reporting date, undefined.',
      },
    ],
  },
  openQuestions: [
    'What happens to reported leverage across the megacaps if one data-centre venture of the Meta type consolidates? Ernst & Young has already called the judgment a critical audit matter, and no filer discloses what consolidation would do to its balance sheet.',
    'What are Anthropic’s and OpenAI’s actual economics? Neither has a public registration statement — EDGAR returns only SPVs and feeder funds — so every circulating revenue and profitability figure for the two largest model labs is unaudited and unfilable, including the ones this report’s bull case would otherwise lean on.',
    'How much of the ~$830B of uncommenced leases is cancellable, and on what terms? Microsoft notes some are "subject to contractual conditions"; none of the four filers quantifies the break cost.',
    'Does the ERCOT eligibility screen represent demand that evaporates or demand that refiles? ~294 GW of a 498 GW universe failed on paperwork, and whether that is speculative interconnection spam or real projects missing a deadline changes the load forecast by hundreds of gigawatts.',
  ],
  soWhat: `If you take one habit from this, take this one: **when someone tells you a company is spending beyond its means, ask where the money came from — and then ask what it promised that has not started yet.**

The headline argument about AI is about valuations. That turns out to be the least interesting part. What actually changed in the last twelve months is duller and more consequential: the biggest companies in the world went from paying for their buildout out of profits to borrowing about two-thirds of it, and they signed roughly **$830 billion** of leases that have not started, which appear on no balance sheet because a lease you have signed but not begun is not yet a liability.

None of that is hidden. It is all in the filings, in plain language, with the numbers attached. Meta says outright that it could lose **$46 billion** on something it carries at **$2.9 billion**. Its auditor added a note saying that judgment was hard.

The transferable version, for anything — not just AI: **an obligation you have committed to but not yet started is invisible in this quarter's numbers and completely real.** It applies to a company signing data-centre leases and it applies to a household signing a mortgage that begins next year. The place to look is never the headline; it is the section of the filing labelled "commitments" — the part that describes the future the company has already agreed to.

And one about research itself. This exact question was researched a day earlier without access to primary documents, and **9 of its 45 claims turned out to be wrong** with another 12 unverifiable. Same question, same method, same effort — the only variable was whether the agents could open the actual filing. That gap is the whole argument for reading the source.`,
  throughLine: {
    text: `This is the report the other eight are evidence for.

Every company report in this section found a version of the same thing: **the number in the headline is not the number the filing supports.** Microsoft's EPS growth was powered by a mark on a private stake. Nebius has never earned an operating profit and every dollar of bottom-line profit it has shown is a revaluation of a stake in another company. Alphabet's record quarter was 69% a non-cash mark on shares it had agreed not to sell. Those are three instances of one pattern, and this report is the pattern stated directly.

Ranked by capital spending against revenue, the ladder still holds: Palantir at 0.75%, Microsoft around 32%, Alphabet at 37.5%, Amazon at roughly 105% of operating cash flow, SpaceX at 235%, CoreWeave at about 290%, and Nebius's first half at 828%. AMD sits outside it — it sells the chips the rest are buying.

What this report adds is the funding side of that ladder. **Microsoft is at the low end and pays cash; Oracle is at the high end and borrows 98%.** Same buildout, opposite balance sheets — and only one of them needs the credit window to stay open.`,
    links: [
      {
        label: 'GOOGL — the mark, and the negative cash quarter',
        slug: 'goog-q2-2026',
      },
      {
        label: 'CRWV — the marginal borrower, in detail',
        slug: 'crwv-q2-2026',
      },
      {
        label: 'NBIS — profit that is entirely a revaluation',
        slug: 'nbis-q2-2026',
      },
    ],
  },
  method: {
    kind: 'thesis',
    perspectives: [
      {
        role: 'Capital-markets analyst',
        probe:
          'How the build is financed, and where the obligation actually sits.',
      },
      {
        role: 'Macro economist',
        probe:
          'Whether the productivity actually shows up in aggregate data, or only in task-level studies.',
      },
      {
        role: 'Grid and infrastructure engineer',
        probe:
          'The physical ceiling — power, transformers, interconnect queues, and build time.',
      },
      {
        role: 'Short seller',
        probe:
          'The specific mechanism by which this breaks, and what breaks first.',
      },
      {
        role: 'Demand-side analyst',
        probe:
          'Whether the revenue on the other side of the capex is real and durable.',
      },
    ],
    turnsEach: 3,
    claimsSurfaced: 33,
    claimsVerified: 33,
    verificationScope: 'all',
    agentCount: 15,
    runDate: '2026-08-22',
    primaryDocsOpened: 83,
  },
  cardImage: '/images/content/ai-capex-thesis-card-hero.webp',
  cardImageLight: '/images/content/ai-capex-thesis-card-hero-light.webp',
  cardImageAlt: 'Market Storm — the standing thesis on AI capital spending',
  sources: [
    {
      n: 1,
      label: 'SEC EDGAR — Amazon filing index and XBRL facts',
      url: 'https://data.sec.gov/api/xbrl/companyconcept/CIK0001018724/us-gaap/PaymentsToAcquireProductiveAssets.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 2,
      label: 'SEC EDGAR — Microsoft filing index and XBRL facts',
      url: 'https://data.sec.gov/api/xbrl/companyconcept/CIK0000789019/us-gaap/PaymentsToAcquirePropertyPlantAndEquipment.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 3,
      label: 'SEC EDGAR — Alphabet filing index and XBRL facts',
      url: 'https://data.sec.gov/api/xbrl/companyconcept/CIK0001652044/us-gaap/PaymentsToAcquirePropertyPlantAndEquipment.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 4,
      label: 'SEC EDGAR — Meta filing index and XBRL facts',
      url: 'https://data.sec.gov/api/xbrl/companyconcept/CIK0001326801/us-gaap/PaymentsToAcquirePropertyPlantAndEquipment.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 5,
      label: 'Amazon Form 10-K, period ended 2025-12-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000004/amzn-20251231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 6,
      label: 'Microsoft Form 10-K, period ended 2026-06-30',
      url: 'https://www.sec.gov/Archives/edgar/data/789019/000119312526323660/msft-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 7,
      label: 'Alphabet Form 10-K, period ended 2025-12-31',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/goog-20251231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 8,
      label: 'Meta — SEC filing, accession 0001628280-26-003942',
      url: 'https://www.sec.gov/Archives/edgar/data/1326801/000162828026003942/meta-20251231.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 9,
      label: 'Meta — SEC filing, accession 0001628280-26-050705',
      url: 'https://www.sec.gov/Archives/edgar/data/1326801/000162828026050705/meta-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 10,
      label: 'Oracle — SEC filing, accession 0001193125-26-277521',
      url: 'https://www.sec.gov/Archives/edgar/data/1341439/000119312526277521/orcl-20260531.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 11,
      label: 'CoreWeave Form 10-Q, period ended 2026-06-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1769628/000176962826000366/crwv-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 12,
      label: 'NVIDIA — SEC filing, accession 0001045810-26-000052',
      url: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000052/nvda-20260426.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 13,
      label: 'Alphabet Form 10-Q, period ended 2026-06-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1652044/000165204426000071/goog-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 14,
      label: 'Amazon Form 10-Q, period ended 2026-06-30',
      url: 'https://www.sec.gov/Archives/edgar/data/1018724/000101872426000026/amzn-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 15,
      label: 'SEC EDGAR — full-text search',
      url: 'https://efts.sec.gov/LATEST/search-index?q=%22data+center%22&forms=ABS-15G',
      primary: true,
      kind: 'filing',
    },
    {
      n: 16,
      label: 'SEC EDGAR — Meta filing index and XBRL facts',
      url: 'https://data.sec.gov/submissions/CIK0001326801.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 17,
      label:
        'SEC EDGAR — registrant search for "Anthropic": returns only SPVs and feeder funds, no registration statement',
      url: 'https://www.sec.gov/cgi-bin/browse-edgar?company=Anthropic&action=getcompany',
      primary: true,
      kind: 'filing',
    },
    {
      n: 18,
      label: 'SpaceX Form S-1/A filed 2026-06-03',
      url: 'https://www.sec.gov/Archives/edgar/data/1181412/000162828026040364/spaceexplorationtechnologib.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 19,
      label: 'SEC EDGAR — Microsoft filing index and XBRL facts',
      url: 'https://data.sec.gov/submissions/CIK0000789019.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 20,
      label: 'Company — SEC filing, accession 0001996810-26-000148',
      url: 'https://www.sec.gov/Archives/edgar/data/1996810/000199681026000148/gev-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 21,
      label: 'Company — SEC filing, accession 0001050915-26-000025',
      url: 'https://www.sec.gov/Archives/edgar/data/1050915/000105091526000025/pwr-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 22,
      label: 'Company — SEC filing, accession 0002071778-26-000051',
      url: 'https://www.sec.gov/Archives/edgar/data/2071778/000207177826000051/frmi-20260630.htm',
      primary: true,
      kind: 'filing',
    },
    {
      n: 23,
      label: 'SEC EDGAR — company filing index and XBRL facts',
      url: 'https://data.sec.gov/submissions/CIK0001996810.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 24,
      label: 'SEC EDGAR — company filing index and XBRL facts',
      url: 'https://data.sec.gov/submissions/CIK0001050915.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 25,
      label: 'SEC EDGAR — company filing index and XBRL facts',
      url: 'https://data.sec.gov/submissions/CIK0002071778.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 26,
      label: 'SEC EDGAR — CoreWeave filing index and XBRL facts',
      url: 'https://data.sec.gov/submissions/CIK0001769628.json',
      primary: true,
      kind: 'filing',
    },
    {
      n: 27,
      label: 'St. Louis Fed — Impact generative ai work productivity',
      url: 'https://www.stlouisfed.org/on-the-economy/2025/feb/impact-generative-ai-work-productivity',
      primary: true,
      kind: 'data',
    },
    {
      n: 28,
      label: 'St. Louis Fed — State generative ai adoption 2025',
      url: 'https://www.stlouisfed.org/on-the-economy/2025/nov/state-generative-ai-adoption-2025',
      primary: true,
      kind: 'data',
    },
    {
      n: 29,
      label: 'St. Louis Fed — Ai productivity what firms say earnings calls',
      url: 'https://www.stlouisfed.org/on-the-economy/2026/jul/ai-productivity-what-firms-say-earnings-calls',
      primary: true,
      kind: 'data',
    },
    {
      n: 30,
      label:
        'Federal Reserve — The Fed - Monitoring AI Adoption in the US Economy',
      url: 'https://www.federalreserve.gov/econres/notes/feds-notes/monitoring-ai-adoption-in-the-u-s-economy-20260403.html',
      primary: true,
      kind: 'data',
    },
    {
      n: 31,
      label: 'Bureau of Labor Statistics — Prod2.nr0',
      url: 'https://www.bls.gov/news.release/prod2.nr0.htm',
      primary: true,
      kind: 'data',
    },
    {
      n: 32,
      label: 'San Francisco Fed — Total Factor Productivity',
      url: 'https://www.frbsf.org/research-and-insights/data-and-indicators/total-factor-productivity-tfp/',
      primary: true,
      kind: 'data',
    },
    {
      n: 33,
      label: 'San Francisco Fed — El2026 14.pdf',
      url: 'https://www.frbsf.org/wp-content/uploads/el2026-14.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 34,
      label: 'FRED (St. Louis Fed) — Fredgraph.csv?id=a679rc1q027sbea',
      url: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=A679RC1Q027SBEA',
      primary: true,
      kind: 'data',
    },
    {
      n: 35,
      label: 'US Census Bureau — Release.pdf',
      url: 'https://www.census.gov/construction/c30/pdf/release.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 36,
      label: 'FRED (St. Louis Fed) — Fredgraph.csv?id=gdp',
      url: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=GDP',
      primary: true,
      kind: 'data',
    },
    {
      n: 37,
      label: 'FRED (St. Louis Fed) — Fredgraph.csv?id=bamlh0a3hyc',
      url: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A3HYC',
      primary: true,
      kind: 'data',
    },
    {
      n: 38,
      label: 'FRED (St. Louis Fed) — Fredgraph.csv?id=bamlh0a0hym2',
      url: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLH0A0HYM2',
      primary: true,
      kind: 'data',
    },
    {
      n: 39,
      label: 'FRED (St. Louis Fed) — Fredgraph.csv?id=bamlc0a0cm',
      url: 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=BAMLC0A0CM',
      primary: true,
      kind: 'data',
    },
    {
      n: 40,
      label: 'emp.lbl.gov — Queued%20up%202026%20edition.pdf',
      url: 'https://emp.lbl.gov/sites/default/files/2026-06/Queued%20Up%202026%20Edition.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 41,
      label: 'ERCOT — Ercot senate july 29 panel 1 assessing the grid.pdf',
      url: 'https://www.ercot.com/files/docs/2026/07/29/ERCOT-Senate-July-29-Panel-1-Assessing-The-Grid.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 42,
      label: 'ERCOT — Ercot largeload update april2026 b c  hearing.pdf',
      url: 'https://www.ercot.com/files/docs/2026/04/01/ERCOT_LargeLoad_Update_April2026_B-C_-Hearing.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 43,
      label: 'ERCOT — 8 interconnection and grid analysis update.pdf',
      url: 'https://www.ercot.com/files/docs/2026/05/24/8-Interconnection-and-Grid-Analysis-Update.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 44,
      label: 'ERCOT — March tac report.pdf',
      url: 'https://www.ercot.com/files/docs/2026/03/12/March-TAC-Report.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 45,
      label: 'EIA — December generator2025',
      url: 'https://www.eia.gov/electricity/data/eia860m/archive/xls/december_generator2025.xlsx',
      primary: true,
      kind: 'data',
    },
    {
      n: 46,
      label: 'EIA — June generator2026',
      url: 'https://www.eia.gov/electricity/data/eia860m/xls/june_generator2026.xlsx',
      primary: true,
      kind: 'data',
    },
    {
      n: 47,
      label: 'PJM — 2028 2029 bra results report.pdf',
      url: 'https://www.pjm.com/-/media/DotCom/markets-ops/rpm/rpm-auction-info/2028-2029/2028-2029-bra-results-report.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 48,
      label:
        'gov.texas.gov — Thomas gleeson pablo vegas data centers directive letter to puct ercot august 2026 .pdf',
      url: 'https://gov.texas.gov/uploads/files/press/Thomas_Gleeson_Pablo_Vegas_Data_Centers_Directive_Letter_to_PUCT_ERCOT_August_2026_.pdf',
      primary: true,
      kind: 'data',
    },
    {
      n: 49,
      label: 'ERCOT — Market Notice Details',
      url: 'https://www.ercot.com/services/comm/mkt_notices/M-A080326-01',
      primary: true,
      kind: 'data',
    },
    {
      n: 50,
      label:
        'Structured Finance Association — Sfa research corner how data center abs and cmbs fit in a broader financing ecosystem.pdf',
      url: 'https://structuredfinance.org/wp-content/uploads/2026/07/SFA-Research-Corner_How-Data-Center-ABS-and-CMBS-Fit-in-a-Broader-Financing-Ecosystem.pdf',
      kind: 'analysis',
    },
    {
      n: 51,
      label: "TechCrunch — Anthropic's annualized revenue surges to $65B",
      url: 'https://techcrunch.com/2026/08/17/anthropics-annualized-revenue-surges-to-65b/',
      kind: 'analysis',
    },
    {
      n: 52,
      label: 'Where’s Your Ed At — Anthropic\'s "Profitability" Swindle',
      url: 'https://www.wheresyoured.at/anthropics-profitability-swindle/',
      kind: 'analysis',
    },
    {
      n: 53,
      label: 'platform.claude.com — Pricing - Claude Platform Docs',
      url: 'https://platform.claude.com/docs/en/about-claude/pricing',
      kind: 'analysis',
    },
    {
      n: 54,
      label:
        'assets.siemens-energy.com — Earnings release q3 fy2026 en pdf original%20file.pdf',
      url: 'https://assets.siemens-energy.com/dam/d0147174-31a9-4a78-b062-b49d00428fc4/earnings-release-q3-fy2026-en-pdf_Original%20file.pdf',
      kind: 'analysis',
    },
    {
      n: 55,
      label:
        'Mitsubishi Heavy Industries — investor presentation — gas turbine order book (PDF)',
      url: 'https://www.mhi.com/finance/library/result/pdf/fy20261q/presentation.pdf',
      kind: 'analysis',
    },
    {
      n: 56,
      label:
        'Utility Dive — Facing an estimated 474 GW of interconnection requests, Texas hits pause on data centers',
      url: 'https://www.utilitydive.com/news/texas-hits-pause-data-center-interconnections/827046/',
      kind: 'analysis',
    },
    {
      n: 57,
      label:
        'Gibson Dunn — What Governor Abbott’s Data Center Audit Directive Means for ERCOT and the Batch Zero Study Process - Gibson Dunn',
      url: 'https://www.gibsondunn.com/what-governor-abbotts-data-center-audit-directive-means-for-ercot-and-the-batch-zero-study-process/',
      kind: 'analysis',
    },
    {
      n: 58,
      label: 'NERC — 2025 Long-Term Reliability Assessment (PDF)',
      url: 'https://www.nerc.com/globalassets/our-work/assessments/nerc_ltra_2025.pdf',
      kind: 'analysis',
    },
  ],
};

export const marketStormReports: MarketStormReport[] = [
  aiCapexThesis2026,
  googQ2_2026,
  nbisQ2_2026,
  crwvQ2_2026,
  amdQ2_2026,
  spcxQ2_2026,
  pltrQ2_2026,
  msftQ4_FY2026,
  amznQ2_2026,
];

/**
 * The pinned thesis piece, if there is one.
 *
 * Takes the FIRST report flagged `featured` rather than asserting there is only
 * one, so a second flag left on an older report degrades into an ordinary card
 * instead of rendering two heroes.
 */
export function featuredReport(): MarketStormReport | undefined {
  return marketStormReports.find((r) => r.featured);
}

/** Everything that is not the pinned piece, newest first — the normal grid. */
export function unfeaturedReports(): MarketStormReport[] {
  const f = featuredReport();
  return marketStormReports.filter((r) => r !== f);
}

export function getReportBySlug(slug: string): MarketStormReport | undefined {
  return marketStormReports.find((r) => r.slug === slug);
}
