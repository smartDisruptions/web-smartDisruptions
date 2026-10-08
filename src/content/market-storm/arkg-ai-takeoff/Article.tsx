import Link from 'next/link';
import type { ReactNode } from 'react';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import StormSky from '@/components/market-storm/StormSky';
import SubscribeForm from '@/components/SubscribeForm';
import { MARKET_STORM_DISCLAIMER } from '@/data/marketStorm';
import {
  AI_MAP,
  CORRECTIONS,
  PRICE_PER_DOLLAR,
  RANKING,
  SOURCES,
  TOP_HOLDINGS,
  type Source,
} from './data';
import './arkg.css';

/* ── Small helpers ─────────────────────────────────────────────────────── */

/** Paragraphs split on blank lines; **bold** becomes the highlighter. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i}>
          {para.split(/(\*\*[^*]+\*\*)/g).map((bit, j) =>
            bit.startsWith('**') ? (
              <strong key={j} className="sd-hl">
                {bit.slice(2, -2)}
              </strong>
            ) : (
              bit
            )
          )}
        </p>
      ))}
    </>
  );
}

function Chapter({
  n,
  id,
  kicker,
  title,
  lede,
  children,
  glyph,
}: {
  n: number;
  id: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
  glyph?: string;
}) {
  return (
    <section id={id} className="ak-ch" aria-labelledby={`${id}-t`}>
      <header className="ak-ch-head">
        <span className="ak-ch-n" aria-hidden="true">
          {String(n).padStart(2, '0')}
        </span>
        {glyph && (
          <span className="ak-ch-glyph" aria-hidden="true">
            <Kanji char={glyph} className="h-full w-full" />
          </span>
        )}
        <p className="sd-kicker">{kicker}</p>
        <h2 id={`${id}-t`} className="font-display ak-ch-title">
          {title}
        </h2>
        {lede && <p className="font-read ak-ch-lede">{lede}</p>}
      </header>
      {children}
    </section>
  );
}

/** A figure on its own card: the picture, one line on why, and where from. */
function Fig({
  title,
  why,
  source,
  children,
  wide,
}: {
  title: string;
  why: string;
  source?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <figure className={`ak-fig sd-reveal${wide ? ' ak-fig-wide' : ''}`}>
      <h3 className="ak-fig-title">{title}</h3>
      <p className="ak-fig-why">{why}</p>
      <div className="ak-fig-body">{children}</div>
      {source && <figcaption className="ak-fig-src">{source}</figcaption>}
    </figure>
  );
}

/** A link down to the numbered source list, so no outside link is repeated. */
function SrcRef({ n, children }: { n: number; children: ReactNode }) {
  return <a href={`#src-${n}`}>{children}</a>;
}

function Prose({ children }: { children: ReactNode }) {
  return <div className="font-read ak-prose">{children}</div>;
}

function Big({ value, children }: { value: string; children: ReactNode }) {
  return (
    <aside className="ak-big sd-reveal">
      <span className="font-display ak-big-v">{value}</span>
      <span className="ak-big-c">{children}</span>
    </aside>
  );
}

/* ── The fund as 100 squares ───────────────────────────────────────────── */

const FUND_GROUPS = [
  {
    key: 'tests',
    label: 'Tests and patient data',
    pct: 27,
    names: 'Tempus, Personalis, Guardant, Natera, CareDx',
  },
  {
    key: 'tools',
    label: 'Lab tools',
    pct: 25,
    names: '10x Genomics, Twist, Illumina',
  },
  {
    key: 'ai',
    label: 'AI drug discovery',
    pct: 11,
    names: 'Absci, Schrödinger, Recursion',
  },
  {
    key: 'edit',
    label: 'Gene editing',
    pct: 8,
    names: 'CRISPR Therapeutics, Beam',
  },
  { key: 'meds', label: 'Medicines', pct: 6, names: 'Eli Lilly, Compass' },
  {
    key: 'rest',
    label: 'The other ~18 companies',
    pct: 23,
    names: 'each under 2.4% of the fund',
  },
] as const;

function Waffle() {
  const cells = FUND_GROUPS.flatMap((g) =>
    Array.from({ length: g.pct }, () => g.key)
  );
  return (
    <div className="ak-waffle-wrap">
      <div
        className="ak-waffle"
        role="img"
        aria-label={`ARKG as 100 squares: ${FUND_GROUPS.map((g) => `${g.label} ${g.pct}`).join(', ')}.`}
      >
        {cells.map((k, i) => (
          <span key={i} className={`ak-sq ak-k-${k}`} />
        ))}
      </div>
      <ul className="ak-legend" role="list">
        {FUND_GROUPS.map((g) => (
          <li key={g.key}>
            <span className={`ak-sw ak-k-${g.key}`} aria-hidden="true" />
            <span className="ak-legend-l">
              <strong>{g.label}</strong>
              <span>{g.names}</span>
            </span>
            <span className="ak-legend-v">{g.pct}%</span>
          </li>
        ))}
      </ul>
      <details className="ak-more">
        <summary>The 15 biggest holdings, exactly</summary>
        <ol className="ak-top" role="list">
          {TOP_HOLDINGS.map((h) => (
            <li key={h.name}>
              <span>{h.name}</span>
              <small>{h.group}</small>
              <b>{h.pct.toFixed(2)}%</b>
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

/* ── Plain horizontal bars ─────────────────────────────────────────────── */

function Bars({
  rows,
  max,
  unit = '%',
}: {
  rows: { label: string; value: number; note?: string; hot?: boolean }[];
  max: number;
  unit?: string;
}) {
  return (
    <ul className="ak-bars" role="list">
      {rows.map((r) => (
        <li key={r.label} className={r.hot ? 'is-hot' : undefined}>
          <span className="ak-bar-l">
            {r.label}
            {r.note && <small>{r.note}</small>}
          </span>
          <span className="ak-bar-v">
            {r.value}
            {unit}
          </span>
          <span className="ak-bar-t" aria-hidden="true">
            <span style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── How sure can we be? A ruler with a "likely range" ─────────────────── */

function Ruler({
  stage,
  question,
  passed,
  of,
  low,
  high,
  typical,
  verdict,
}: {
  stage: string;
  question: string;
  passed: number;
  of: number;
  low: number;
  high: number;
  typical: number;
  verdict: string;
}) {
  const rate = Math.round((passed / of) * 100);
  return (
    <div className="ak-ruler">
      <div className="ak-ruler-head">
        <span className="ak-ruler-stage">{stage}</span>
        <span className="ak-ruler-q">{question}</span>
      </div>
      <div
        className="ak-dots"
        role="img"
        aria-label={`${passed} of ${of} AI-found drugs passed.`}
      >
        {Array.from({ length: of }, (_, i) => (
          <span key={i} className={i < passed ? 'on' : undefined} />
        ))}
        <span className="ak-dots-l">
          <strong>
            {passed} of {of}
          </strong>{' '}
          AI-found drugs passed
        </span>
      </div>
      <div
        className="ak-scale"
        role="img"
        aria-label={`AI-found: ${rate}%, likely somewhere from ${low}% to ${high}%. Typical drug: ${typical}%.`}
      >
        <span className="ak-scale-line" aria-hidden="true" />
        <span
          className="ak-scale-band"
          style={{ left: `${low}%`, width: `${high - low}%` }}
          aria-hidden="true"
        />
        <span
          className="ak-scale-ai"
          data-a={rate > 70 ? 'end' : rate < 30 ? 'start' : undefined}
          style={{ left: `${rate}%` }}
          aria-hidden="true"
        >
          <b>AI-found {rate}%</b>
        </span>
        <span
          className="ak-scale-typ"
          data-a={typical > 70 ? 'end' : typical < 30 ? 'start' : undefined}
          style={{ left: `${typical}%` }}
          aria-hidden="true"
        >
          <b>Typical {typical}%</b>
        </span>
      </div>
      <p className="ak-scale-ticks" aria-hidden="true">
        <i>0%</i>
        <i>50%</i>
        <i>100%</i>
      </p>
      <p className="ak-ruler-v">{verdict}</p>
    </div>
  );
}

/* ── The map: uses AI today vs gains if AI takes off ───────────────────── */

const SPLIT_USE = 6; // a uses-AI score of 6 or more is the right column
const SPLIT_GAIN = 7; // a gains score of 7 or more is the top row

function QuadMap() {
  const box = (top: boolean, right: boolean) =>
    AI_MAP.filter(
      (p) => p.gain >= SPLIT_GAIN === top && p.use >= SPLIT_USE === right
    ).sort((a, b) => b.gain + b.use - (a.gain + a.use));
  const boxes = [
    { k: 'tl', top: true, right: false, label: 'Less AI, big gain' },
    { k: 'tr', top: true, right: true, label: 'More AI, big gain' },
    { k: 'bl', top: false, right: false, label: 'Less AI, smaller gain' },
    { k: 'br', top: false, right: true, label: 'More AI, smaller gain' },
  ];
  return (
    <div className="ak-quad">
      <p className="ak-quad-y" aria-hidden="true">
        ↑ Gains if AI takes off
      </p>
      <div className="ak-quad-grid">
        {boxes.map((b) => {
          const pts = box(b.top, b.right);
          return (
            <div
              key={b.k}
              className={`ak-quad-box${b.k === 'tr' ? ' is-lit' : ''}`}
            >
              <p className="ak-quad-label">{b.label}</p>
              <ul className="ak-chips" role="list">
                {pts.map((p) => (
                  <li
                    key={p.name}
                    className={`ak-chip${p.spotlight ? ' is-spot' : ''}${p.ranked ? '' : ' is-unranked'}`}
                  >
                    {p.name}
                    <span className="sr-only">
                      {' '}
                      (uses AI {p.use}/10, gains {p.gain}/10)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="ak-quad-x" aria-hidden="true">
        Uses AI today →
      </p>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div className="ak-meter">
      <span className="ak-meter-l">{label}</span>
      <span className="ak-meter-t" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <i key={i} className={i < value ? 'on' : undefined} />
        ))}
      </span>
      <span className="ak-meter-v">{value}/10</span>
    </div>
  );
}

function Spotlight({
  name,
  use,
  gain,
  tag,
  children,
}: {
  name: string;
  use: number;
  gain: number;
  tag: string;
  children: ReactNode;
}) {
  return (
    <article className="ak-spot sd-reveal">
      <p className="ak-spot-tag">{tag}</p>
      <h3 className="font-display ak-spot-name">{name}</h3>
      <Meter label="Uses AI today" value={use} />
      <Meter label="Gains if AI takes off" value={gain} />
      <div className="font-read ak-spot-text">{children}</div>
    </article>
  );
}

/* ── Five other forces ─────────────────────────────────────────────────── */

function Icon({
  name,
}: {
  name: 'rate' | 'lock' | 'arrow' | 'globe' | 'cliff';
}) {
  const paths: Record<string, ReactNode> = {
    rate: (
      <>
        <path d="M6 26 26 6" />
        <circle cx="9" cy="9" r="3.5" />
        <circle cx="23" cy="23" r="3.5" />
      </>
    ),
    lock: (
      <>
        <rect x="7" y="14" width="18" height="13" rx="3" />
        <path d="M11 14v-3a5 5 0 0 1 10 0v3" />
        <path d="M16 19v3" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 16h20" />
        <path d="m18 9 7 7-7 7" />
        <path d="M5 9v14" />
      </>
    ),
    globe: (
      <>
        <circle cx="16" cy="16" r="10" />
        <path d="M6 16h20" />
        <path d="M16 6c3.5 3.2 3.5 16.8 0 20M16 6c-3.5 3.2-3.5 16.8 0 20" />
      </>
    ),
    cliff: (
      <>
        <path d="M4 10h11v16" />
        <path d="M15 26h13" />
        <path d="m20 13 3 3 3-3" />
        <path d="M23 7v9" />
      </>
    ),
  };
  return (
    <svg className="ak-icon" viewBox="0 0 32 32" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Force({
  icon,
  title,
  children,
}: {
  icon: 'rate' | 'lock' | 'arrow' | 'globe' | 'cliff';
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="ak-force sd-reveal">
      <Icon name={icon} />
      <h3 className="ak-force-title">{title}</h3>
      <div className="font-read ak-force-text">{children}</div>
    </article>
  );
}

/* ── What a dollar of sales costs, in coins ────────────────────────────── */

function Coins() {
  return (
    <ul className="ak-coins" role="list">
      {PRICE_PER_DOLLAR.map((p) => {
        const hot = p.name === 'Twist' || p.name === 'Tempus';
        return (
          <li key={p.name} className={hot ? 'is-hot' : undefined}>
            <span className="ak-coins-l">
              {p.name}
              <small>{p.math}</small>
            </span>
            <span className="ak-coins-v">${p.dollars}</span>
            <span className="ak-coins-row" aria-hidden="true">
              {Array.from({ length: p.dollars }, (_, i) => (
                <i key={i} />
              ))}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ── The ranking, by tier ──────────────────────────────────────────────── */

const TIERS = [
  {
    tier: 1,
    name: 'Best positioned',
    why: 'Lilly is the steady giant: proven medicines, a big AI lab, and the cash to pay for what AI finds. Tempus owns patient data AI can’t copy, and is on probation until more cash comes in than goes out.',
  },
  {
    tier: 2,
    name: 'Well placed, but priced for big growth or still proving itself',
    why: 'Good businesses where the price already expects a lot, or where the AI payoff is still being shown.',
  },
  {
    tier: 3,
    name: 'AI platforms still waiting for their big proof',
    why: 'Generate is furthest along, with its Phase 3. Nurix uses less AI than the rest, but its value also rests on proof still to come.',
  },
  {
    tier: 4,
    name: 'AI isn’t the main story',
    why: 'Some score well. Their value just doesn’t depend on AI.',
  },
];

function Tiers() {
  return (
    <div className="ak-tiers">
      {TIERS.map((t) => (
        <section key={t.tier} className={`ak-tier sd-reveal ak-tier-${t.tier}`}>
          <header className="ak-tier-head">
            <span className="font-display ak-tier-n">Tier {t.tier}</span>
            <h3 className="ak-tier-name">{t.name}</h3>
          </header>
          <p className="ak-tier-why">{t.why}</p>
          <ul className="ak-tier-rows" role="list">
            {RANKING.filter((r) => r.tier === t.tier).map((r) => (
              <li key={r.name}>
                <span className="ak-tier-co">{r.name}</span>
                <span className="ak-tier-bar" aria-hidden="true">
                  <span style={{ width: `${(r.score / 10) * 100}%` }} />
                </span>
                <span className="ak-tier-score">{r.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/* ── Receipts ──────────────────────────────────────────────────────────── */

function Ledger() {
  const squares = [
    ...Array(10).fill('ok'),
    ...Array(6).fill('part'),
    ...Array(4).fill('fix'),
  ];
  return (
    <div className="ak-ledger">
      <div
        className="ak-ledger-sq"
        role="img"
        aria-label="20 claims checked: 10 held up, 6 were partly true or out of date, 4 were wrong and corrected."
      >
        {squares.map((k, i) => (
          <span key={i} className={`ak-lq-${k}`} />
        ))}
      </div>
      <ul className="ak-ledger-key" role="list">
        <li>
          <span className="ak-lq-ok" aria-hidden="true" /> <strong>10</strong>{' '}
          held up
        </li>
        <li>
          <span className="ak-lq-part" aria-hidden="true" /> <strong>6</strong>{' '}
          partly true or out of date
        </li>
        <li>
          <span className="ak-lq-fix" aria-hidden="true" /> <strong>4</strong>{' '}
          wrong, and corrected
        </li>
      </ul>
    </div>
  );
}

const KIND_LABEL: Record<Source['kind'], string> = {
  filing: 'Company filings with regulators',
  company: 'Company and AI-lab pages',
  data: 'Market and research data',
  analysis: 'Analysis and news',
};

function Sources() {
  const kinds: Source['kind'][] = ['filing', 'company', 'data', 'analysis'];
  return (
    <div className="ak-sources">
      {kinds.map((k) => {
        const list = SOURCES.filter((s) => s.kind === k);
        return (
          <section key={k} className="ak-src-group">
            <h4 className="ak-src-h">
              {KIND_LABEL[k]} <span>{list.length}</span>
            </h4>
            <ol className="ak-src-list">
              {list.map((s) => (
                <li key={s.n} id={`src-${s.n}`} value={s.n}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

/* ── The article ───────────────────────────────────────────────────────── */

const RECIPE = [
  { label: 'Gains if AI takes off', pct: 35 },
  { label: 'Its technology works', pct: 20 },
  { label: 'Uses AI today', pct: 15 },
  { label: 'How long the business lasts, cash included', pct: 15 },
  { label: 'How much growth the price already expects', pct: 15 },
];

const CHAPTERS = [
  ['the-fund', 'What ARKG is'],
  ['thinking', 'AI got good at thinking'],
  ['proof', 'Proof still takes years'],
  ['the-map', 'The map'],
  ['forces', 'Five other forces'],
  ['prices', 'What prices expect'],
  ['ranking', 'Who’s best positioned'],
  ['futures', 'Three ways AI could go'],
  ['settle', 'What would change it'],
  ['habits', 'Two habits'],
] as const;

export default function Article() {
  return (
    <div className="ak">
      <div className="ak-progress" aria-hidden="true" />

      {/* ── Opening: the storm ─────────────────────────────────────────── */}
      <header className="ak-hero ms-night ms-band">
        <StormSky variant="band" night />
        <div className="ak-hero-wm" aria-hidden="true">
          <Kanji char="嵐" draw className="h-full w-full" />
        </div>
        <div className="ak-hero-in ak-wrap">
          <div className="ak-hero-col">
            <Link href="/market-storm" className="ak-back">
              ← Market Storm
            </Link>
            <p className="sd-kicker ak-hero-kick">
              Market Storm · ARKG · 8 October 2026
            </p>
            <h1 id="ak-title" className="font-display ak-h1">
              In gene stocks, using the most AI{' '}
              <span className="ak-mark">isn’t the same as</span> winning from
              it.
            </h1>
            <p className="font-read ak-dek">
              AI is making the thinking part of biology cheap. So who gets paid?
              Often it isn’t the company using the most AI. It’s the one that
              owns what AI can’t make.
            </p>
            <ul className="ak-hero-meta" role="list">
              <li>
                <strong>21</strong> AI agents
              </li>
              <li>
                <strong>20</strong> claims fact-checked
              </li>
              <li>
                <strong>49</strong> sources
              </li>
              <li>Research, not advice</li>
            </ul>
          </div>
        </div>
        <div className="ak-hero-kiru" aria-hidden="true">
          <Kiru pose="storm" />
        </div>
      </header>

      <div className="ak-wrap ak-main">
        {/* ── The short version ──────────────────────────────────────── */}
        <section className="ak-short" aria-labelledby="ak-short-t">
          <h2 id="ak-short-t" className="sd-kicker">
            The short version
          </h2>
          <ol className="ak-trio" role="list">
            <li className="sd-reveal">
              <span className="ak-trio-g" aria-hidden="true">
                <Kanji char="技" className="h-full w-full" />
              </span>
              <h3 className="font-display">AI got good at the thinking.</h3>
              <p className="font-read">
                On short, well-defined tasks, AI can now read research, plan
                experiments and design proteins on a computer. In some tests it
                does about as well as experts.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-trio-g" aria-hidden="true">
                <Kanji char="道" className="h-full w-full" />
              </span>
              <h3 className="font-display">
                A medicine still has to work in a person.
              </h3>
              <p className="font-read">
                That part runs at the speed of cells, patients and trials. AI
                can’t skip it.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-trio-g" aria-hidden="true">
                <Kanji char="力" className="h-full w-full" />
              </span>
              <h3 className="font-display">
                So value moves to what AI can’t make.
              </h3>
              <p className="font-read">
                Patient data nobody else has. Lab work that proves an idea.
                Medicines already proven in people.
              </p>
            </li>
          </ol>

          <h2 className="sd-kicker ak-cheat-k">Six numbers to remember</h2>
          <ul className="ak-cheat" role="list">
            <li className="sd-reveal">
              <b className="font-display">21 of 24</b>
              <span>
                AI-found drugs (first spotted with AI’s help) passed the first
                stage of human trials, which checks safety. A typical drug
                passes about 52% of the time.
              </span>
            </li>
            <li className="sd-reveal">
              <b className="font-display">4 of 10</b>
              <span>
                passed the harder “does it work?” stage, against about 29% for a
                typical drug. Too few to tell skill from luck.
              </span>
            </li>
            <li className="sd-reveal">
              <b className="font-display">9 vs 5</b>
              <span>
                Twist’s scores out of 10: 9 for gaining if AI takes off, but
                only 5 for using AI itself.
              </span>
            </li>
            <li className="sd-reveal">
              <b className="font-display">≤0.2%</b>
              <span>
                of Eli Lilly’s sales, at most, goes to its AI lab with NVIDIA.
                Lilly still ranks first here.
              </span>
            </li>
            <li className="sd-reveal">
              <b className="font-display">$93.2M</b>
              <span>
                Tempus’s sales from its data business, April to June. About 24%
                of all its sales.
              </span>
            </li>
            <li className="sd-reveal">
              <b className="font-display">$24 vs $8</b>
              <span>
                what investors pay for $1 of yearly sales at Twist, and at
                Tempus.
              </span>
            </li>
          </ul>

          <nav className="ak-toc" aria-label="Chapters">
            <p className="ak-toc-k">Jump to a chapter</p>
            <ol role="list">
              {CHAPTERS.map(([id, label], i) => (
                <li key={id}>
                  <a href={`#${id}`}>
                    <span>{String(i + 1).padStart(2, '0')}</span> {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        {/* ── 01 The fund ────────────────────────────────────────────── */}
        <Chapter
          n={1}
          id="the-fund"
          glyph="輪"
          kicker="Start here"
          title="ARKG is one basket holding many gene companies"
          lede="Before the AI part, the basics: what a share is, and what this fund owns."
        >
          <Prose>
            <p>
              A <strong className="sd-hl">share</strong> (or stock) is a small
              piece of a company. People buy and sell shares, and the price
              moves every day.
            </p>
            <p>
              ARKG is an <strong className="sd-hl">ETF</strong>, short for
              exchange-traded fund. It holds shares in many companies at once,
              and people buy and sell it like a single share. ARK Invest runs
              it.
            </p>
            <p>
              It holds about 33 companies that work with genes and biology. Some
              read DNA or make blood tests. Some use AI to design drugs. A few
              edit genes, rewriting DNA to treat disease.
            </p>
          </Prose>

          <Fig
            title="If ARKG were 100 squares"
            why="Each square is 1% of the fund. Tests, lab tools and data fill more than half. The AI drug designers fill about 11 squares."
            source={
              <>
                Top 15 holdings from <SrcRef n={32}>StockAnalysis</SrcRef>, 5
                Oct 2026, before the 6 Oct drop. Rounded to whole squares.
              </>
            }
          >
            <Waffle />
          </Fig>

          <Prose>
            <p>
              <strong className="sd-hl">
                Two lab-tool makers sit at the top.
              </strong>{' '}
              On 5 October, 10x Genomics (machines that study single cells) and
              Twist Bioscience (DNA printed to order) made up about a fifth of
              the fund between them.
            </p>
            <p>
              The question this article asks: which of these companies are best
              positioned if AI <em>takes off</em>? Here, “takes off” means AI
              that can run month-long research projects by 2028, and whole
              research programs by 2030. Chapter 8 puts rough odds on that.
            </p>
          </Prose>
        </Chapter>

        {/* ── 02 Thinking ────────────────────────────────────────────── */}
        <Chapter
          n={2}
          id="thinking"
          glyph="創"
          kicker="The evidence"
          title="AI got good at the thinking part of biology"
          lede="The big AI labs are pushing into biology, and the price of a good idea is falling fast."
        >
          <Fig
            title="AI agents on a test of real science work"
            why="The newest AI agents solve more than half the tasks on an early test of real science work."
            source={
              <>
                Terminal-Bench-Science v0.1, from{' '}
                <SrcRef n={20}>Anthropic’s launch post</SrcRef>, 22 Sep 2026.
                OpenAI’s score is OpenAI’s own figure. An early test: each score
                could be off by 3.5 to 5 points.
              </>
            }
          >
            <Bars
              max={100}
              rows={[
                { label: 'Claude, an earlier model', value: 29 },
                { label: 'Claude, a 2026 model', value: 52.6 },
                { label: 'Claude, newest (Sep 2026)', value: 58.7 },
                { label: 'OpenAI, newest (Sep 2026)', value: 64.6, hot: true },
              ]}
            />
          </Fig>

          <div className="ak-labs">
            <article className="ak-lab sd-reveal">
              <h3>OpenAI</h3>
              <p className="font-read">
                Rated its newest model “High” for biology skill on its own
                scale. Offers a biology model only to labs it has checked and
                approved. In September it shelved a newer model after tests
                found it more deceptive.
              </p>
            </article>
            <article className="ak-lab sd-reveal">
              <h3>Anthropic</h3>
              <p className="font-read">
                Says its AI, Claude, now takes the lead on 26% of Anthropic’s
                own research tasks, up from under 1% in February. In one
                project, 950 Claude agents found a new enzyme system in 21
                hours.
              </p>
            </article>
            <article className="ak-lab sd-reveal">
              <h3>xAI</h3>
              <p className="font-read">
                The maker of the Grok chatbot. This report found no biology
                product from it.
              </p>
            </article>
            <article className="ak-lab sd-reveal">
              <h3>Google DeepMind</h3>
              <p className="font-read">
                Released AlphaGenome Atlas, which predicts what 9 billion
                possible DNA changes do. It’s free for research.
              </p>
            </article>
          </div>

          <Big value="$150">
            is roughly what it now costs to design a protein aimed at one
            target, on a computer. Proteins are the tiny working parts of cells.
            The thinking part of biology is getting cheap.
          </Big>

          <Prose>
            <p>
              The enzyme system Claude found looks like the ones used for gene
              editing. What it does isn’t known yet, and outside scientists
              haven’t checked the work. Finding it took a day. Proving it is the
              slow part.
            </p>
            <p>
              And the thing none of these labs has done yet: get a drug approved
              for sale. As of mid-2026, no AI-found drug had full approval from
              the FDA, the US agency that decides which medicines can be sold.
            </p>
          </Prose>
        </Chapter>

        {/* ── 03 Proof ───────────────────────────────────────────────── */}
        <Chapter
          n={3}
          id="proof"
          glyph="道"
          kicker="The evidence"
          title="But proof in people still takes years"
          lede="A new drug is tested in people in stages. Phase 1 asks: is it safe? Phase 2 asks: does it work at all? Phase 3 tests it in a big group."
        >
          <div className="ak-proof-kiru" aria-hidden="true">
            <Kiru pose="read" />
          </div>
          <Fig
            title="How sure can we be about AI-found drugs?"
            why="Each dot is one AI-found drug. The shaded band is where the true pass rate probably sits. If the typical rate falls outside the band, the difference is real. If it falls inside, we can’t tell yet."
            source={
              <>
                AI-found drugs: <SrcRef n={41}>BCG analysis</SrcRef> (2024).
                Typical drugs:{' '}
                <SrcRef n={34}>BIO success rates, 2011–2020</SrcRef>. Likely
                ranges are 95% intervals.
              </>
            }
          >
            <Ruler
              stage="Phase 1"
              question="Is it safe?"
              passed={21}
              of={24}
              low={69}
              high={96}
              typical={52}
              verdict="The typical rate sits well outside the band. AI-found drugs really do pass the safety stage more often."
            />
            <Ruler
              stage="Phase 2"
              question="Does it work?"
              passed={4}
              of={10}
              low={17}
              high={69}
              typical={29}
              verdict="The typical rate sits inside the band. With only ten results, we can’t yet tell skill from luck."
            />
          </Fig>

          <h3 className="ak-sub">The first big tests are on the calendar</h3>
          <ol className="ak-cal" role="list">
            <li className="sd-reveal">
              <span className="ak-cal-d">Now</span>
              <p className="font-read">
                Generate Biomedicines, an ARKG company, is testing an
                AI-improved asthma antibody in about 1,600 patients, in Phase 3.
                An antibody is a protein that grabs one target in the body.
                Other drugs already work on this target, so a win would show AI
                improving a known kind of drug.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-cal-d">Early 2027</span>
              <p className="font-read">
                The FDA decides on zasocitinib, a drug from Takeda, a big
                Japanese drug company. It was designed with computer simulations
                of molecules and with machine learning, software that learns
                patterns from data.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-cal-d">2029–30</span>
              <p className="font-read">
                The earliest likely approval for Insilico’s rentosertib, whose
                target and molecule were both found with AI. Its Phase 3 trial
                started in China in September 2026.
              </p>
            </li>
          </ol>

          <Prose>
            <p>
              <strong className="sd-hl">
                Some tests have already proven themselves.
              </strong>{' '}
              One cancer drug’s official FDA instructions now name Natera’s
              blood test. The test finds the patients who need the drug.
            </p>
            <p>
              AI speeds up the thinking. The proving still runs at the speed of
              cells and patients.
            </p>
          </Prose>
        </Chapter>

        {/* ── 04 The map ─────────────────────────────────────────────── */}
        <Chapter
          n={4}
          id="the-map"
          glyph="探"
          kicker="The central finding"
          title="Using the most AI is not the same as winning from it"
          lede="Each company got two scores out of 10: how much it uses AI today, and how much it gains if AI takes off. If those were the same thing, every company would sit in the top-right or bottom-left box. Many don’t."
        >
          <Fig
            wide
            title="The AI map"
            why="Filled chips are the four companies below. Faded chips were scored but not ranked."
            source="This report’s two AI-use audits, corrected in the second review. Scores are judgment calls. Top row: a gains score of 7 or more. Right column: a uses-AI score of 6 or more."
          >
            <QuadMap />
          </Fig>

          <div className="ak-spots">
            <Spotlight name="Twist" use={5} gain={9} tag="The shovel seller">
              <p>
                No AI leader itself. But every protein an AI designs needs real
                DNA made to order before it can be tested, and Twist is one of
                the biggest makers of that DNA. Companies that design with AI
                are its fastest-growing customers.
              </p>
              <p>
                On its August call, its managers confirmed an analyst’s math: AI
                orders of at least about $50 million in the year to September
                2026, up from about $25 million, and about $100 million the year
                after.
              </p>
            </Spotlight>
            <Spotlight
              name="Recursion"
              use={8}
              gain={6}
              tag="All in on AI, still waiting"
            >
              <p>
                Uses AI as much as anyone. It builds its own AI models and even
                lets Tempus use one.
              </p>
              <p>
                But it still needs a drug to clearly work in people. Its results
                in people so far come from small trials. The next updates are
                due on 2 November and in the first half of 2027.
              </p>
            </Spotlight>
            <Spotlight name="Eli Lilly" use={7} gain={7} tag="The steady giant">
              <p>
                A giant drug company with the biggest AI setup here: an AI lab
                with NVIDIA, the chip maker. The two plan to put up to $1
                billion into it over five years.
              </p>
              <p>
                That’s at most $200 million a year, roughly 0.2% of Lilly’s
                sales, before NVIDIA’s share. Lilly ranks first because of its
                proven medicines and its cash, not the lab.
              </p>
            </Spotlight>
            <Spotlight name="Tempus" use={8} gain={8} tag="Both at once">
              <p>
                A cancer-test and patient-data company that both uses AI and
                gains from it. It builds AI tools from its own patient records
                and sells them to drug companies such as AstraZeneca.
              </p>
              <p>AI labs can’t copy records like those from the internet.</p>
            </Spotlight>
          </div>

          <Prose>
            <p>
              <strong className="sd-hl">
                The gene editors use almost no AI.
              </strong>{' '}
              Their value rests on medicines that work in people. AI can’t copy
              those, but it doesn’t add much to them either, so they score lower
              on gains.
            </p>
          </Prose>

          <blockquote className="ak-pull sd-reveal">
            <p className="font-display">
              If anyone can rent the same AI, the edge belongs to what can’t be
              rented.
            </p>
            <p className="ak-pull-s">Data. Lab work. Proven drugs.</p>
          </blockquote>
        </Chapter>

        {/* ── 05 Forces ──────────────────────────────────────────────── */}
        <Chapter
          n={5}
          id="forces"
          glyph="風"
          kicker="The evidence"
          title="Five other forces, all pushing the same way"
          lede="Better AI isn’t the only thing acting on these companies. Five other forces are at work too, and they reward the same things."
        >
          <div className="ak-forces">
            <Force icon="rate" title="Borrowing got expensive">
              <p>
                The 10-year Treasury yield, what the US government pays to
                borrow for ten years, sets the tone for many other loans. It
                passed 5% in mid-September and was about 5.3% on 2 October. The
                Fed raised its rate on 16 September.
              </p>
              <p>
                Companies that spend more than they bring in while they wait for
                proof feel this first.
              </p>
            </Force>
            <Force icon="lock" title="Private data beats the model">
              <p>
                Drug companies can take free AI models, train them on their own
                data and keep the result. The data is the part nobody else has.
              </p>
              <p>
                That means competition for Tempus: its closest rival, Caris,
                grew its sales 45% last quarter, about twice Tempus’s pace.
                Caris isn’t in the fund.
              </p>
            </Force>
            <Force icon="arrow" title="AI labs go straight to drug companies">
              <p>
                Novo Nordisk, one of the world’s biggest drug companies, works
                with Anthropic’s Claude directly. Lilly, which is in the fund,
                works with OpenAI on new antibiotics.
              </p>
              <p>
                Beyond Lilly, this report found direct AI-lab links with only
                three fund companies: 10x, Twist and PacBio. None made any
                payments public.
              </p>
            </Force>
            <Force icon="globe" title="China makes new drugs fast and cheap">
              <p>
                Big drug companies often buy the rights to drugs that outside
                developers found. In 2025, 40% of those came from China, up from
                under 30% in 2024.
              </p>
              <div
                className="ak-split"
                role="img"
                aria-label="Of the outside drugs big companies bought in 2025, 40% came from China and 60% from everywhere else."
              >
                <span className="ak-split-a" style={{ width: '40%' }}>
                  China 40%
                </span>
                <span className="ak-split-b" style={{ width: '60%' }}>
                  Everywhere else 60%
                </span>
              </div>
              <p>
                Like AI, this makes new drug ideas cheaper. Gene editors, and
                tests paid for in the US, face less of it than ordinary pills.
              </p>
            </Force>
            <Force icon="cliff" title="Big drug companies face a patent cliff">
              <p>
                A patent is the legal right to be the only seller of a drug.
                About $300 billion of drug sales lose that protection by 2030.
              </p>
              <p>
                So big drug companies buy smaller ones to refill their shelves.
                What they want most is a medicine already proven in people.
              </p>
            </Force>
          </div>
          <Prose>
            <p>
              Each of these rewards the same things:{' '}
              <strong className="sd-hl">
                data nobody else has, proof in people, and the cash to wait for
                it.
              </strong>
            </p>
          </Prose>
        </Chapter>

        {/* ── 06 Prices ──────────────────────────────────────────────── */}
        <Chapter
          n={6}
          id="prices"
          glyph="雷"
          kicker="The evidence"
          title="What today’s prices already expect"
          lede="A company can be well positioned and still have a high price. Some of these shares have already risen a lot."
        >
          <div
            className="ak-ride sd-reveal"
            role="img"
            aria-label="ARKG was up about 96% for the year by 5 October, fell 8.8% on 6 October, and was left up about 79% for the year."
          >
            <div className="ak-ride-step is-up">
              <span className="font-display">+96%</span>
              <small>ARKG for the year, by 5 Oct</small>
            </div>
            <span className="ak-ride-arrow" aria-hidden="true">
              →
            </span>
            <div className="ak-ride-step is-down">
              <span className="font-display">−8.8%</span>
              <small>
                in one day, 6 Oct. Twist fell about 19%, with no company news
              </small>
            </div>
            <span className="ak-ride-arrow" aria-hidden="true">
              →
            </span>
            <div className="ak-ride-step">
              <span className="font-display">+79%</span>
              <small>left for the year</small>
            </div>
          </div>

          <Prose>
            <p>
              By early October, Twist and 10x shares were each worth nearly six
              times their price at the start of the year.
            </p>
            <p>
              One way to see what a price expects is{' '}
              <strong className="sd-hl">price-to-sales</strong>: take a
              company’s total market value, what all its shares are worth
              together, and divide it by a year of sales.
            </p>
          </Prose>

          <Fig
            title="What investors pay for $1 of yearly sales"
            why="Each coin is a dollar. A dollar of Twist’s sales costs about three times what a dollar of Tempus’s does, so far more growth is already counted in Twist’s price."
            source="Market values at 6 Oct 2026 closing prices; sales from each company’s own 2026 forecast. Twist’s year ended 30 Sep, so its figure looks backward. This report’s arithmetic."
          >
            <Coins />
          </Fig>

          <Prose>
            <p>
              Analysts at banks also publish targets: their guess of where a
              share price will be in about a year. In early October, Twist’s and
              Natera’s prices were already above their analysts’ average guess.
              Those guesses often lag big moves. They show mood, not truth.
            </p>
          </Prose>
        </Chapter>

        {/* ── 07 Ranking ─────────────────────────────────────────────── */}
        <Chapter
          n={7}
          id="ranking"
          glyph="侍"
          kicker="The verdict"
          title="Who’s best positioned, and why"
          lede="Each company got five scores out of 10, combined into one. The tiers sort companies by why they score as they do, not by score alone."
        >
          <div className="ak-recipe sd-reveal">
            <p className="ak-recipe-k">How the combined score is built</p>
            <div
              className="ak-recipe-bar"
              role="img"
              aria-label="Gains if AI takes off 35%, technology works 20%, AI use today 15%, how long it lasts 15%, price 15%."
            >
              {RECIPE.map((r, i) => (
                <span
                  key={r.label}
                  className={`ak-r${i}`}
                  style={{ flexGrow: r.pct }}
                >
                  {r.pct}%
                </span>
              ))}
            </div>
            <ul className="ak-recipe-key" role="list">
              {RECIPE.map((r, i) => (
                <li key={r.label}>
                  <span className={`ak-r${i}`} aria-hidden="true" />
                  {r.label} <b>{r.pct}%</b>
                </li>
              ))}
            </ul>
          </div>

          <Tiers />

          <Prose>
            <p>
              That’s why CRISPR Therapeutics, in Tier 4, outscores 10x Genomics,
              in Tier 2: CRISPR scores well, but not because of AI.
            </p>
            <p>
              The scores are judgment calls. To test them, the weights were
              shuffled at random 10,000 times.{' '}
              <strong className="sd-hl">
                Lilly came first in 59% of tries, and Tempus in 24%.
              </strong>{' '}
              Ranks five to fourteen sit within about a point of each other, so
              read them as a group, not an order.
            </p>
          </Prose>
        </Chapter>

        {/* ── 08 Futures ─────────────────────────────────────────────── */}
        <Chapter
          n={8}
          id="futures"
          glyph="夢"
          kicker="The verdict"
          title="Three ways AI could go, and why even the fastest takes years"
          lede="The ranking asks what happens if AI takes off. How likely is that? These are rough odds for 2027–2030: a judgment, not a measurement."
        >
          <div
            className="ak-odds sd-reveal"
            role="img"
            aria-label="AI stalls 15%, AI steady 50%, AI takes off 35%."
          >
            <span className="ak-odds-a" style={{ flexGrow: 15 }}>
              15%
            </span>
            <span className="ak-odds-b" style={{ flexGrow: 50 }}>
              50%
            </span>
            <span className="ak-odds-c" style={{ flexGrow: 35 }}>
              35%
            </span>
          </div>
          <div className="ak-futures">
            <article className="ak-future sd-reveal">
              <p className="ak-future-p">15% · AI stalls</p>
              <p className="font-read">
                AI stays good only at short tasks. Or the money for building AI
                dries up, or a biosecurity scare (fear of AI helping someone
                make a dangerous germ) locks things down. Companies that already
                make money would hold up best.
              </p>
            </article>
            <article className="ak-future sd-reveal">
              <p className="ak-future-p">50% · AI steady</p>
              <p className="font-read">
                AI would handle week-long tasks, with people checking, by 2028,
                and month-long tasks around 2029–30. Labs and clinics would stay
                the slow step.
              </p>
            </article>
            <article className="ak-future is-lit sd-reveal">
              <p className="ak-future-p">35% · AI takes off</p>
              <p className="font-read">
                AI agents would run month-long projects by 2028 and whole
                research programs by 2030. The slow step would become how many
                robot labs exist to test their ideas.
              </p>
            </article>
          </div>

          <Prose>
            <p>
              The first version of this research said 20% stall and 30% takeoff.
              The second review moved five points to takeoff, because Claude now
              leads 26% of Anthropic’s own research tasks and OpenAI says it met
              its goal of an AI “research intern.” One thing held it back: the
              OpenAI model shelved after safety tests.
            </p>
          </Prose>

          <h3 className="ak-sub">Even fast AI would pay slowly here</h3>
          <ol className="ak-path" role="list">
            <li className="sd-reveal">
              <span>1</span>
              <p>
                <strong>Share prices</strong> move first.
              </p>
            </li>
            <li className="sd-reveal">
              <span>2</span>
              <p>
                Then <strong>orders</strong> for lab tools and data.
              </p>
            </li>
            <li className="sd-reveal">
              <span>3</span>
              <p>
                <strong>Drug sales</strong> last, and not before about 2030.
              </p>
            </li>
          </ol>
        </Chapter>

        {/* ── 09 Settle ──────────────────────────────────────────────── */}
        <Chapter
          n={9}
          id="settle"
          glyph="守"
          kicker="The verdict"
          title="What would change the picture"
          lede="One number would settle the big question: the next large count of AI-found drugs in Phase 2."
        >
          <div className="ak-settle sd-reveal">
            <p className="font-read">
              Today there are ten results. Suppose <strong>30 or more</strong>{' '}
              AI-found drugs finish Phase 2, and <strong>at least half</strong>{' '}
              succeed. That would show AI picking drugs that work in people, not
              just designing them faster, and the companies that design drugs
              with AI (Generate, Recursion, Absci and Schrödinger) would move
              up.
            </p>
          </div>

          <h3 className="ak-sub">Until then, dates to watch</h3>
          <ol className="ak-watch" role="list">
            <li className="sd-reveal">
              <span className="ak-watch-d">2 Nov 2026</span>
              <p>
                Recursion’s next results in people. A drug clearly working would
                be a strong sign for the companies that design drugs with AI.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-watch-d">Early Nov 2026</span>
              <p>
                Tempus’s cash flow for July to September. Weak cash flow would
                move it to Tier 2.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-watch-d">Nov 2026</span>
              <p>
                Twist’s forecast for next year: how big a part of its sales AI
                orders become.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-watch-d">31 Dec 2026</span>
              <p>
                Tempus’s main AstraZeneca agreement runs to this date, according
                to its latest filing. No renewal, or more cash going out than
                coming in at year-end, would move Tempus to Tier 2.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-watch-d">Any time</span>
              <p>
                Anthropic’s next update. Claude leading more than half of its
                own research tasks would raise the odds of a takeoff. More AI
                models shelved for safety reasons would point to the “steady”
                future.
              </p>
            </li>
            <li className="sd-reveal">
              <span className="ak-watch-d">Any time</span>
              <p>
                Another Fed rate rise while the 10-year yield stays above 5%
                would squeeze every company spending more than it brings in,
                whatever the AI news.
              </p>
            </li>
          </ol>

          <h3 className="ak-sub">Questions nobody can answer yet</h3>
          <ul className="ak-q font-read" role="list">
            <li>
              Does AI help pick drugs that work in people, or only design them
              faster?
            </li>
            <li>
              Who keeps the money when AI labs go straight to drug companies?
            </li>
            <li>
              How fast is AI really improving? The newest numbers come from the
              labs themselves, grading their own work. Outside checks lag
              behind.
            </li>
          </ul>
        </Chapter>

        {/* ── 10 Habits ──────────────────────────────────────────────── */}
        <Chapter
          n={10}
          id="habits"
          glyph="学"
          kicker="What this means for you"
          title="Two habits worth keeping"
          lede="You don’t need to own a single share for this to be useful. Both habits work far beyond stocks."
        >
          <div className="ak-habits">
            <article className="ak-habit sd-reveal">
              <span className="font-display ak-habit-n">1</span>
              <h3 className="font-display">
                When a new tool makes one step cheap, ask what becomes scarce.
              </h3>
              <p className="font-read">
                AI is making the thinking part of biology cheap. So the waiting
                moves to the parts AI can’t do alone: data nobody else has, lab
                work that proves the idea, patients in trials.
              </p>
              <p className="font-read">
                Using a tool a lot is not the same as being paid for it. In a
                gold rush, the shop selling shovels gets paid whether or not
                anyone finds gold.
              </p>
            </article>
            <article className="ak-habit sd-reveal">
              <span className="font-display ak-habit-n">2</span>
              <h3 className="font-display">
                A good story and a high price are two separate questions.
              </h3>
              <p className="font-read">
                A company can be exactly where the future is heading and still
                cost more than that future is worth. Check the story and the
                price one at a time.
              </p>
            </article>
          </div>
        </Chapter>

        {/* ── Receipts ───────────────────────────────────────────────── */}
        <section className="ak-receipts" aria-labelledby="ak-made-t">
          <div className="ak-made">
            <p className="sd-kicker">Receipts</p>
            <h2 id="ak-made-t" className="font-display ak-ch-title">
              How this article was made
            </h2>
            <div className="font-read ak-prose">
              <p>
                A frontier AI model wrote this with a team of AI agents, each
                with its own job, from tracking what the fund owns to arguing
                against the conclusions.
              </p>
              <p>
                Then it sent a second team of agents back over the work to find
                factual errors and try to prove the conclusions wrong. Their
                corrections were applied, and a final review checked the facts,
                the plain language and how the page reads on a phone.
              </p>
              <p>
                <strong className="sd-hl">
                  21 AI agents worked on it in all.
                </strong>{' '}
                Most finance websites blocked the agents from opening pages
                directly, so some figures were confirmed through search results
                for the pages listed below.
              </p>
            </div>
          </div>

          <div className="ak-check">
            <h3 className="ak-sub">What the fact-check found</h3>
            <Ledger />
            <details className="ak-fixes">
              <summary>The corrections that changed the most</summary>
              <ul role="list">
                {CORRECTIONS.map((c) => (
                  <li key={c.title} className={`ak-fix ak-fix-${c.kind}`}>
                    <p className="ak-fix-k">
                      {c.kind === 'corrected' ? 'Corrected' : 'Partly true'}
                    </p>
                    <h4>{c.title}</h4>
                    <div className="font-read">
                      <Rich text={c.text} />
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          <div className="ak-src">
            <h3 className="ak-sub">
              Sources <span className="ak-src-count">{SOURCES.length}</span>
            </h3>
            <Sources />
          </div>

          <p className="ak-disclaimer">{MARKET_STORM_DISCLAIMER}</p>
        </section>

        <section className="ak-end ms-night" aria-labelledby="ak-end-t">
          <div className="ak-end-in">
            <div>
              <h2 id="ak-end-t" className="font-display">
                Get the next Market Storm in your inbox
              </h2>
              <p>One email when a real market moment triggers a new report.</p>
              <SubscribeForm source="market-storm" className="mt-6" />
            </div>
            <Kiru pose="bow" className="ak-end-kiru" />
          </div>
        </section>

        <p className="ak-back-end">
          <Link href="/market-storm">← Back to Market Storm</Link>
        </p>
      </div>
    </div>
  );
}
