// Data for the ARKG article. Figures come from the fact-checked research
// (.reports/storm-2026-10-07-arkg-ai-takeoff.md in the vault) and its sources.

export type Source = {
  n: number;
  label: string;
  url: string;
  kind: 'filing' | 'company' | 'data' | 'analysis';
};

export const SOURCES: Source[] = [
  {
    n: 1,
    label: 'Natera — Form 10-Q, quarter ended 30 Jun 2026',
    url: 'https://www.sec.gov/Archives/edgar/data/0001604821/000162828026054525/ntra-20260630.htm',
    kind: 'filing',
  },
  {
    n: 2,
    label: 'Eli Lilly — second-quarter 2026 results, 8-K exhibit (5 Aug 2026)',
    url: 'https://www.sec.gov/Archives/edgar/data/0000059478/000005947826000077/q226lillysalesandearningsp.htm',
    kind: 'filing',
  },
  {
    n: 3,
    label: 'Tempus AI — Form 10-Q, quarter ended 30 Jun 2026',
    url: 'https://www.sec.gov/Archives/edgar/data/0001717115/000119312526326090/tem-20260630.htm',
    kind: 'filing',
  },
  {
    n: 4,
    label:
      'Illumina — second-quarter 2026 results, 8-K exhibit 99.1 (30 Jul 2026)',
    url: 'https://www.sec.gov/Archives/edgar/data/0001110803/000111080326000155/q226earningsrelease.htm',
    kind: 'filing',
  },
  {
    n: 5,
    label:
      'Veracyte — second-quarter 2026 results, 8-K exhibit 99.1 (30 Jul 2026)',
    url: 'https://www.sec.gov/Archives/edgar/data/0001384101/000138410126000042/vcyt-07x30x20268xkearnings.htm',
    kind: 'filing',
  },
  {
    n: 6,
    label:
      'Recursion — second-quarter 2026 results, 8-K exhibit 99.1 (5 Aug 2026)',
    url: 'https://www.sec.gov/Archives/edgar/data/0001601830/000160183026000097/exhibit991-q0226.htm',
    kind: 'filing',
  },
  {
    n: 7,
    label:
      'Twist Bioscience — fiscal third-quarter 2026 results, 8-K exhibit 99.1 (3 Aug 2026)',
    url: 'https://www.sec.gov/Archives/edgar/data/0001581280/000158128026000044/twst-2026630xex991.htm',
    kind: 'filing',
  },
  {
    n: 8,
    label:
      '10x Genomics — second-quarter 2026 results, 8-K exhibit 99.1 (6 Aug 2026)',
    url: 'https://www.sec.gov/Archives/edgar/data/0001770787/000162828026054273/txg-20260806xexx991.htm',
    kind: 'filing',
  },
  {
    n: 9,
    label: 'Guardant Health — Form 10-Q, quarter ended 30 Jun 2026',
    url: 'https://www.sec.gov/Archives/edgar/data/0001576280/000157628026000037/gh-20260630.htm',
    kind: 'filing',
  },
  {
    n: 10,
    label: 'Tempus — second-quarter 2026 results (30 Jul 2026)',
    url: 'https://www.tempus.com/news/pr/tempus-reports-second-quarter-2026-results/',
    kind: 'company',
  },
  {
    n: 11,
    label:
      'Tempus and Recursion — extended data license and new license to Recursion’s RNA foundation model (21 Sep 2026)',
    url: 'https://www.tempus.com/news/pr/tempus-and-recursion-extend-existing-data-license-agreement-and-enter-new-license-agreement-for-recursions-rna-foundation-model/',
    kind: 'company',
  },
  {
    n: 12,
    label: 'Natera — second-quarter 2026 results (6 Aug 2026)',
    url: 'https://www.natera.com/company/news/natera-reports-second-quarter-2026-financial-results/',
    kind: 'company',
  },
  {
    n: 13,
    label:
      'NVIDIA and Lilly — co-innovation AI lab for drug discovery (12 Jan 2026)',
    url: 'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-and-Lilly-Announce-Co-Innovation-AI-Lab-to-Reinvent-Drug-Discovery-in-the-Age-of-AI/default.aspx',
    kind: 'company',
  },
  {
    n: 14,
    label:
      'Generate Biomedicines — second-quarter 2026 earnings release (6 Aug 2026)',
    url: 'https://generatebiomedicines.com/wp-content/uploads/2026/08/Generate-Biomedicines-Earnings-Release-Q22026.pdf',
    kind: 'company',
  },
  {
    n: 15,
    label:
      'Freenome — FDA approves SimpleScreen CRC; Abbott to commercialize in the US (27 Jul 2026)',
    url: 'https://www.freenome.com/newsroom/fda-approves-freenomes-simplescreen-crc/',
    kind: 'company',
  },
  {
    n: 16,
    label:
      'Takeda — FDA accepts zasocitinib NDA under priority review (14 Sep 2026)',
    url: 'https://www.takeda.com/newsroom/newsreleases/2026/fda-priority-review-zasocitinib-psoriasis/',
    kind: 'company',
  },
  {
    n: 17,
    label:
      'Insilico Medicine — first patient dosed in GENESIS-IPF-3, rentosertib’s Phase 3 (10 Sep 2026)',
    url: 'https://insilico.com/news/isn1009261-insilico-medicine-doses-first-patient-genesis-ipf-3',
    kind: 'company',
  },
  {
    n: 18,
    label: 'Caris Life Sciences — second-quarter 2026 results (5 Aug 2026)',
    url: 'https://www.carislifesciences.com/about/news-and-media/caris-life-sciences-reports-second-quarter-2026-financial-results-and-increases-2026-revenue-guidance/',
    kind: 'company',
  },
  {
    n: 19,
    label:
      'Basecamp Research — Trillion Gene Atlas with Anthropic, Ultima Genomics, PacBio and NVIDIA (18 Mar 2026)',
    url: 'https://basecamp-research.com/wp-content/uploads/2026/03/BCR-TGA.pdf',
    kind: 'company',
  },
  {
    n: 20,
    label:
      'Anthropic — launch post for its newest Claude model, with the science-test scores (22 Sep 2026)',
    url: 'https://www.anthropic.com/claude-opus-5-5',
    kind: 'company',
  },
  {
    n: 21,
    label:
      'Anthropic — Measurements for understanding the pace of AI development inside frontier labs (Sep 2026)',
    url: 'https://www.anthropic.com/institute/measuring-pace-of-ai-development',
    kind: 'company',
  },
  {
    n: 22,
    label: 'Anthropic — Claude for Life Sciences (20 Oct 2025)',
    url: 'https://www.anthropic.com/news/claude-for-life-sciences',
    kind: 'company',
  },
  {
    n: 23,
    label:
      'Anthropic — Claude accelerates protein design and analytical chemistry (18 Aug 2026)',
    url: 'https://www.anthropic.com/research/Claude-accelerates-protein-design',
    kind: 'company',
  },
  {
    n: 24,
    label:
      'Anthropic — How Claude is uplifting biomolecular modeling (17 Sep 2026)',
    url: 'https://www.anthropic.com/research/claude-uplifts-biomolecular-modeling',
    kind: 'company',
  },
  {
    n: 25,
    label:
      'OpenAI — safety card for its newest model, rated “High” for biology (Sep 2026)',
    url: 'https://deploymentsafety.openai.com/gpt-6-astra',
    kind: 'company',
  },
  {
    n: 26,
    label: 'OpenAI — Research acceleration: the view inside OpenAI (Sep 2026)',
    url: 'https://openai.com/index/research-acceleration-view-inside-openai/',
    kind: 'company',
  },
  {
    n: 27,
    label:
      'Anthropic — Claude discovers a novel enzyme system with CRISPR-like repeats (23 Sep 2026)',
    url: 'https://www.anthropic.com/news/claude-discovers-novel-enzyme-system',
    kind: 'company',
  },
  {
    n: 28,
    label: 'Anthropic — Novo Nordisk customer story (Claude by Anthropic)',
    url: 'https://claude.com/customers/novo-nordisk',
    kind: 'company',
  },
  {
    n: 29,
    label: 'OpenAI — its biology model for approved labs only (16 Apr 2026)',
    url: 'https://openai.com/index/introducing-gpt-rosalind/',
    kind: 'company',
  },
  {
    n: 30,
    label:
      'Google DeepMind — AlphaGenome Atlas: a map of every possible DNA letter change in the human genome (8 Sep 2026)',
    url: 'https://deepmind.google/blog/alphagenome-atlas-a-predictive-map-of-every-possible-dna-letter-change-in-the-human-genome/',
    kind: 'company',
  },
  {
    n: 31,
    label:
      'Eli Lilly — Lilly collaborates with OpenAI to discover novel medicines to treat drug-resistant bacteria (25 Jun 2024)',
    url: 'https://investor.lilly.com/news-releases/news-release-details/lilly-collaborates-openai-discover-novel-medicines-treat-drug',
    kind: 'company',
  },
  {
    n: 32,
    label: 'StockAnalysis — ARKG holdings (snapshot of 5 Oct 2026)',
    url: 'https://stockanalysis.com/etf/arkg/holdings/',
    kind: 'data',
  },
  {
    n: 33,
    label:
      'Investing.com — ARKG price and historical returns (6 Oct 2026 close)',
    url: 'https://www.investing.com/etfs/ark-genomic-revolution-multi-sector',
    kind: 'data',
  },
  {
    n: 34,
    label:
      'BIO, Informa and QLS — Clinical development success rates 2011–2020 (Feb 2021)',
    url: 'https://www.bio.org/clinical-development-success-rates-and-contributing-factors-2011-2020',
    kind: 'data',
  },
  {
    n: 35,
    label: 'Federal Reserve — FOMC statement (16 Sep 2026)',
    url: 'https://www.federalreserve.gov/newsevents/pressreleases/monetary20260916a.htm',
    kind: 'data',
  },
  {
    n: 36,
    label:
      'Federal Reserve Bank of St. Louis (FRED) — 10-year Treasury yield, daily (DGS10)',
    url: 'https://fred.stlouisfed.org/series/DGS10',
    kind: 'data',
  },
  {
    n: 37,
    label: 'MarketScreener — Twist Bioscience analyst consensus (Oct 2026)',
    url: 'https://www.marketscreener.com/quote/stock/TWIST-BIOSCIENCE-CORPORAT-46874562/consensus/',
    kind: 'data',
  },
  {
    n: 38,
    label:
      'MarketBeat — Natera stock up 4% to ~$406 vs a ~$331 consensus target (24 Sep 2026)',
    url: 'https://www.marketbeat.com/instant-alerts/price-natera-nasdaq-ntra-stock-price-up-4-still-a-buy-2026-09-24/',
    kind: 'data',
  },
  {
    n: 39,
    label:
      'Quiver Quantitative — ARKG historical prices (2025 year-end close $28.97)',
    url: 'https://www.quiverquant.com/stock/ARKG/historical-prices/',
    kind: 'data',
  },
  {
    n: 40,
    label:
      'Macrotrends — Twist Bioscience stock price history (6 Oct 2026 close $166.97)',
    url: 'https://www.macrotrends.net/stocks/charts/TWST/twist-bioscience/stock-price-history',
    kind: 'data',
  },
  {
    n: 41,
    label:
      'Jayatunga et al. (BCG), Drug Discovery Today — How successful are AI-discovered drugs in clinical trials? (2024)',
    url: 'https://www.sciencedirect.com/science/article/pii/S135964462400134X',
    kind: 'analysis',
  },
  {
    n: 42,
    label:
      'Stocktwits via Yahoo Finance — Cathie Wood’s ARKG is crushing her other ETFs (early Oct 2026)',
    url: 'https://finance.yahoo.com/healthcare/articles/cathie-wood-arkg-crushing-her-064411709.html',
    kind: 'analysis',
  },
  {
    n: 43,
    label:
      'Investing.com — Why is Twist Bioscience stock plunging today? (6 Oct 2026)',
    url: 'https://www.investing.com/news/stock-market-news/why-is-twist-bioscience-stock-plunging-today-93CH-4935087',
    kind: 'analysis',
  },
  {
    n: 44,
    label:
      'CNBC — OpenAI abandons plan to release upcoming model as safety concerns escalate (28 Sep 2026)',
    url: 'https://www.cnbc.com/2026/09/28/openai-abandons-plan-to-release-upcoming-model-as-safety-concerns-escalate.html',
    kind: 'analysis',
  },
  {
    n: 45,
    label:
      'Fierce Pharma — Lilly’s obesity pill Foundayo ‘disappointed’ in Q2 as injectables boom (Aug 2026)',
    url: 'https://www.fiercepharma.com/pharma/while-sales-lillys-obesity-pill-disappointed-q2-injectables-continue-boom',
    kind: 'analysis',
  },
  {
    n: 46,
    label:
      'The Motley Fool — Twist Bioscience fiscal Q3 2026 earnings call transcript (Aug 2026)',
    url: 'https://www.fool.com/earnings/call-transcripts/2026/08/10/twist-bioscience-twst-q3-2026-earnings-call-transcript/',
    kind: 'analysis',
  },
  {
    n: 47,
    label:
      'PwC — US pharma and life sciences deals 2026 midyear outlook (2026)',
    url: 'https://www.pwc.com/us/en/industries/health-industries/library/pharma-life-sciences-deals-outlook.html',
    kind: 'analysis',
  },
  {
    n: 48,
    label:
      'Pharmaceutical Executive — Deepening ties: why China is becoming big pharma’s most essential R&D partner (Jun 2026)',
    url: 'https://www.pharmexec.com/view/deepening-ties-why-china-becoming-big-pharma-most-essential-rd-partner',
    kind: 'analysis',
  },
  {
    n: 49,
    label:
      'OncLive — FDA approves adjuvant atezolizumab for MRD-positive bladder cancer, with Signatera as the companion test (15 May 2026)',
    url: 'https://www.onclive.com/view/fda-approves-adjuvant-atezolizumab-for-mrd-muscle-invasive-bladder-cancer',
    kind: 'analysis',
  },
];

export const TOP_HOLDINGS = [
  { name: '10x Genomics', pct: 10.38, group: 'Lab tools' },
  { name: 'Twist', pct: 10.12, group: 'Lab tools' },
  { name: 'Tempus', pct: 8.4, group: 'Tests and data' },
  { name: 'CRISPR Therapeutics', pct: 5.28, group: 'Gene editing' },
  { name: 'Absci', pct: 5.23, group: 'AI drug discovery' },
  { name: 'Personalis', pct: 4.91, group: 'Tests and data' },
  { name: 'Guardant', pct: 4.62, group: 'Tests and data' },
  { name: 'Natera', pct: 4.52, group: 'Tests and data' },
  { name: 'Illumina', pct: 4.51, group: 'Lab tools' },
  { name: 'CareDx', pct: 4.51, group: 'Tests and data' },
  { name: 'Eli Lilly', pct: 3.33, group: 'Medicines' },
  { name: 'Schrödinger', pct: 3.04, group: 'AI drug discovery' },
  { name: 'Beam', pct: 2.95, group: 'Gene editing' },
  { name: 'Recursion', pct: 2.58, group: 'AI drug discovery' },
  { name: 'Compass', pct: 2.44, group: 'Medicines' },
];

export const AI_MAP = [
  { name: 'Tempus', use: 8, gain: 8, spotlight: true, ranked: true },
  { name: 'Recursion', use: 8, gain: 6, spotlight: true, ranked: true },
  { name: 'Generate', use: 8, gain: 6, spotlight: false, ranked: true },
  { name: 'Lilly', use: 7, gain: 7, spotlight: true, ranked: true },
  { name: 'Schrödinger', use: 7, gain: 5, spotlight: false, ranked: true },
  { name: 'Freenome', use: 7, gain: 6, spotlight: false, ranked: true },
  { name: 'Natera', use: 6, gain: 7, spotlight: false, ranked: true },
  { name: 'Veracyte', use: 6, gain: 6, spotlight: false, ranked: true },
  { name: 'Guardant', use: 6, gain: 7, spotlight: false, ranked: true },
  { name: 'Illumina', use: 6, gain: 6, spotlight: false, ranked: true },
  { name: 'Absci', use: 6, gain: 4, spotlight: false, ranked: true },
  { name: 'Butterfly', use: 6, gain: 7, spotlight: false, ranked: false },
  { name: 'Twist', use: 5, gain: 9, spotlight: true, ranked: true },
  { name: '10x', use: 5, gain: 7, spotlight: false, ranked: true },
  { name: 'GeneDx', use: 5, gain: 6, spotlight: false, ranked: false },
  { name: 'CareDx', use: 4, gain: 5, spotlight: false, ranked: true },
  { name: 'PacBio', use: 4, gain: 5, spotlight: false, ranked: false },
  { name: 'Nurix', use: 4, gain: 5, spotlight: false, ranked: true },
  { name: 'Personalis', use: 4, gain: 2, spotlight: false, ranked: true },
  { name: 'Adaptive', use: 4, gain: 5, spotlight: false, ranked: true },
  { name: 'Intellia', use: 3, gain: 6, spotlight: false, ranked: true },
  { name: 'Alamar', use: 3, gain: 6, spotlight: false, ranked: false },
  { name: 'CRISPR', use: 2, gain: 6, spotlight: false, ranked: true },
  { name: 'Ionis', use: 2, gain: 5, spotlight: false, ranked: true },
  { name: 'Beam', use: 2, gain: 5, spotlight: false, ranked: true },
  { name: 'Compass', use: 1, gain: 3, spotlight: false, ranked: true },
];

export const RANKING = [
  { name: 'Eli Lilly', score: 7.4, tier: 1 },
  { name: 'Tempus', score: 7.3, tier: 1 },
  { name: 'Twist', score: 6.9, tier: 2 },
  { name: 'Veracyte', score: 6.9, tier: 2 },
  { name: 'Natera', score: 6.7, tier: 2 },
  { name: 'Illumina', score: 6.6, tier: 2 },
  { name: 'Guardant', score: 6.3, tier: 2 },
  { name: 'CRISPR Therapeutics', score: 6.3, tier: 4 },
  { name: 'Schrödinger', score: 6.2, tier: 3 },
  { name: '10x Genomics', score: 6.0, tier: 2 },
  { name: 'Generate', score: 6.0, tier: 3 },
  { name: 'Freenome', score: 5.8, tier: 3 },
  { name: 'Intellia', score: 5.8, tier: 4 },
  { name: 'CareDx', score: 5.7, tier: 4 },
  { name: 'Recursion', score: 5.5, tier: 3 },
  { name: 'Adaptive', score: 5.5, tier: 4 },
  { name: 'Ionis', score: 5.4, tier: 4 },
  { name: 'Beam', score: 5.1, tier: 4 },
  { name: 'Nurix', score: 4.9, tier: 3 },
  { name: 'Personalis', score: 4.6, tier: 4 },
  { name: 'Absci', score: 4.3, tier: 3 },
  { name: 'Compass', score: 4.3, tier: 4 },
];

export const PRICE_PER_DOLLAR = [
  { name: 'Twist', dollars: 24, math: '~$10.5–11B ÷ $456M, year ended 30 Sep' },
  { name: 'Natera', dollars: 20, math: '~$58B ÷ $2.88B' },
  { name: '10x Genomics', dollars: 16, math: '~$10.0B ÷ $620M' },
  { name: 'Eli Lilly', dollars: 12, math: '~$1.03T ÷ $86B' },
  { name: 'Illumina', dollars: 9, math: '~$41B ÷ $4.62B' },
  { name: 'Tempus', dollars: 8, math: '~$13.0B ÷ $1.6B' },
];

export const CORRECTIONS = [
  {
    kind: 'corrected',
    title: 'Natera was in the top tier for the wrong reasons',
    text: 'The first version said Natera brought in more cash than it spent and had little legal risk. Its own report to regulators shows a **$67 million loss** from April to June, under standard accounting rules.\n\nNatera is appealing a court ruling that it owes Guardant, another fund company, about **$290 million** over false advertising. Its market value had also climbed to about 20 times its yearly sales, and its share price sat above analysts’ average guess. It moved to Tier 2.',
  },
  {
    kind: 'corrected',
    title:
      'Tempus’s “$200 million in a quarter” was deals signed, not money in',
    text: 'The $200 million was **bookings**: deals signed that pay out over several years. Sales from Tempus’s data business that quarter were **$93.2 million**.\n\nThe cash it burned in the first half of the year also grew, to $80.8 million from $61.5 million. Its main AstraZeneca agreement runs to 31 December, according to its latest filing, though its managers say the AstraZeneca work runs into 2027. It stays in Tier 1, on probation.',
  },
  {
    kind: 'corrected',
    title: 'A typical drug passes Phase 2 about 29% of the time, not 40%',
    text: 'The first version compared AI drugs (4 of 10) with a typical rate of about 40%, and called them the same. The industry figure for 2011–2020 is about **29%**. So AI drugs look a little better, but ten results are still too few to tell.\n\nThe “What would settle it” test was rewritten to match.',
  },
  {
    kind: 'partly',
    title:
      'Lilly is a weight-loss company with a big AI lab, not an AI company',
    text: 'Lilly’s AI work is real. It runs an AI lab with NVIDIA, budgeted at up to $1 billion over five years.\n\nBut the prices it actually gets for its drugs fell about 13%. Early on, its new weight-loss pill, Foundayo, sold about one-fifth as much as its main rival’s pill. This report found no AI-found Lilly drug in human trials.\n\nIt stays first, relabeled as the steady giant.',
  },
  {
    kind: 'corrected',
    title: 'Rentosertib’s Phase 3 started in September, not July',
    text: 'Insilico gave the first Phase 3 patient a dose of rentosertib on **9–10 September 2026**, in China. An earlier claim said July. Insilico says AI found both the drug and the target it aims at.',
  },
  {
    kind: 'partly',
    title: 'This year’s biggest gains were measured before a hard fall',
    text: 'The first version said Twist was up 495% and 10x up 473% for the year, each nearly six-fold. Those figures were from early October, before ARKG fell **8.8%** on 6 October, from $56.77 to $51.75.\n\nTwist fell about 19% that day. After the drop, Twist was still up more than 400% for the year, and ARKG about 79%.',
  },
];
