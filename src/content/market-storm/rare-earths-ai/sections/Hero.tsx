import type { CSSProperties } from 'react';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal } from '@/components/brand/Kanji';
import { CHAPTERS, HERO } from '../content';
import { Rich } from '../ui';
import MagnetField from '../islands/a-field';
import ChapterRail from '../islands/a-rail';
import './hero.css';

/*
 * The opening: iron filings on washi.
 *
 * The five magnet elements are laid end to end as the body of a bar magnet
 * (a vermilion N cap, a steel S cap), and the hero's paper is covered in iron
 * filings lined up along its field — the school experiment, where a force you
 * can't see draws itself in iron. The reader's pointer (or finger) is a
 * second magnet: the filings swing to the combined field.
 *
 * The filings are a canvas island (../islands/a-field) that starts after the
 * page has loaded. Until then, and wherever it can't run, the field is drawn
 * here on the server as dashed ink lines: the same physics, computed once at
 * build time, so the first paint already shows the magnet's field.
 */

/* ── The static field: a bar magnet's field lines, in bar lengths ────────── */

/** Half the bar's length and its pole faces' half-height, in bar lengths. */
const BAR_A = 0.5;
const BAR_B = 0.17;

/**
 * Field of a uniformly magnetised bar: each pole face is a sheet of magnetic
 * "charge", here a line segment with a 1/r² kernel, integrated in closed
 * form. The N face is on the left. (The canvas island uses the same model.)
 */
function field(x: number, y: number): [number, number] {
  let fx = 0;
  let fy = 0;
  for (const [x0, q] of [
    [-BAR_A, 1],
    [BAR_A, -1],
  ] as const) {
    let dx = x - x0;
    if (Math.abs(dx) < 1e-7) dx = dx < 0 ? -1e-7 : 1e-7;
    const yp = y + BAR_B;
    const ym = y - BAR_B;
    const rp = Math.sqrt(dx * dx + yp * yp);
    const rm = Math.sqrt(dx * dx + ym * ym);
    fx += (q / dx) * (yp / rp - ym / rm);
    fy += q * (1 / rm - 1 / rp);
  }
  return [fx, fy];
}

const VIEW = { x0: -1.3, y0: -0.8, w: 2.6, h: 1.6 };

/** Follow the field (midpoint steps) from a seed until it meets the bar or leaves the view. */
function trace(x: number, y: number, dir: 1 | -1) {
  const pts: [number, number][] = [[x, y]];
  const h = 0.006;
  for (let i = 0; i < 1400; i++) {
    let [fx, fy] = field(x, y);
    let m = Math.hypot(fx, fy);
    const xm = x + (dir * fx * h) / (2 * m);
    const ym = y + (dir * fy * h) / (2 * m);
    [fx, fy] = field(xm, ym);
    m = Math.hypot(fx, fy);
    x += (dir * fx * h) / m;
    y += (dir * fy * h) / m;
    pts.push([x, y]);
    if (Math.abs(x) < BAR_A + 0.004 && Math.abs(y) < BAR_B + 0.03)
      return { pts, closed: true };
    if (
      x < VIEW.x0 ||
      x > VIEW.x0 + VIEW.w ||
      y < VIEW.y0 ||
      y > VIEW.y0 + VIEW.h
    ) {
      return { pts, closed: false };
    }
  }
  return { pts, closed: false };
}

/** Drop the points a smooth curve doesn't need (Ramer–Douglas–Peucker). */
function simplify(pts: [number, number][], eps: number): [number, number][] {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0];
  const [bx, by] = pts[pts.length - 1];
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1e-9;
  let far = 0;
  let at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
    if (d > far) {
      far = d;
      at = i;
    }
  }
  if (far <= eps) return [pts[0], pts[pts.length - 1]];
  return [
    ...simplify(pts.slice(0, at + 1), eps).slice(0, -1),
    ...simplify(pts.slice(at), eps),
  ];
}

/** A polyline as a smooth path: each kept point becomes a quadratic control point. */
function smooth(pts: [number, number][]) {
  const f = (v: number) => +v.toFixed(3);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
  }
  const last = pts[pts.length - 1];
  return `${d}L${f(last[0])} ${f(last[1])}`;
}

/**
 * Field lines seeded at equal angles around the N pole, each traced both
 * ways. A line that leaves the view instead of reaching the S pole is drawn
 * again mirrored, where it comes back in toward S.
 */
function fieldLines() {
  const out: string[] = [];
  const seeds = 22;
  for (let i = 0; i < seeds; i++) {
    const ang = ((28 + ((i + 0.5) / seeds) * 304) * Math.PI) / 180;
    const sx = -BAR_A + 0.16 * Math.cos(ang);
    const sy = 0.144 * Math.sin(ang);
    if (Math.abs(sx) < BAR_A + 0.01 && Math.abs(sy) < BAR_B + 0.02) continue;
    const back = trace(sx, sy, -1);
    const fwd = trace(sx, sy, 1);
    const line = simplify([...back.pts.reverse(), ...fwd.pts.slice(1)], 0.0025);
    out.push(smooth(line));
    if (!fwd.closed)
      out.push(smooth(line.map(([x, y]) => [-x, y] as [number, number])));
  }
  return out.join('');
}

// Computed once, at build time: the page ships only the path.
const FIELD_LINES = fieldLines();

/* ── The contents as a periodic table ────────────────────────────────────── */

/**
 * Each chapter's "element symbol" in the contents table. Decoration only
 * (aria-hidden): a letter or two from the chapter's subject, the way an
 * element's symbol comes from its name.
 */
const SYMBOL: Record<string, string> = {
  basics: 'Ba',
  'ai-speed': 'Ai',
  tech: 'Te',
  china: 'Cn',
  companies: 'Co',
  'ai-use': 'Au',
  bear: 'Be',
  dots: 'Do',
  missed: 'Mi',
  ranking: 'Rk',
  watch: 'W',
  think: 'Th',
};

export default function Hero() {
  const ranked = HERO.answer.picks.filter((p) => p.role.startsWith('#'));
  const twist = HERO.answer.picks.filter((p) => !p.role.startsWith('#'));
  return (
    <>
      {/* Reading progress: a vermilion thread along the top, driven by the
          scroll itself. Browsers without scroll timelines don't show it. */}
      <div className="re-a-progress" aria-hidden="true" />

      <header className="re-a-hero" data-a-hero>
        <div className="re-a-wm" aria-hidden="true">
          <Kanji char="磁" draw className="h-full w-full" />
        </div>

        <div className="re-wrap re-a-in">
          <Link href="/market-storm" className="re-a-back" data-a-clear>
            ← Market Storm
          </Link>
          <p className="sd-kicker re-a-kick" data-a-clear>
            {HERO.eyebrow}
          </p>
          <h1
            id="re-title"
            className="font-display re-a-h1"
            data-a-clear="text"
          >
            {HERO.title}
          </h1>

          <div className="re-a-mag">
            <MagnetField />
            <div className="re-a-bar" data-a-bar>
              <svg
                className="re-a-lines"
                viewBox={`${VIEW.x0} ${VIEW.y0} ${VIEW.w} ${VIEW.h}`}
                aria-hidden="true"
                focusable="false"
              >
                <path d={FIELD_LINES} />
              </svg>
              <span className="re-a-cap is-n" aria-hidden="true">
                N
              </span>
              <ul
                className="re-a-els"
                aria-label={HERO.elementsLabel}
                role="list"
              >
                {HERO.elements.map((e, i) => (
                  <li
                    key={e.sym}
                    className={`re-a-el ${e.heavy ? 'is-heavy' : 'is-light'}`}
                    style={{ '--i': i } as CSSProperties}
                  >
                    <span className="re-a-el-z">{e.z}</span>
                    <span className="re-a-el-sym">{e.sym}</span>
                    <span className="re-a-el-nm">{e.name}</span>
                    {/* The dashed border says it on screen; this says it aloud. */}
                    <span className="sr-only">
                      {e.heavy ? ', heavy' : ', light'}
                    </span>
                  </li>
                ))}
              </ul>
              <span className="re-a-cap is-s" aria-hidden="true">
                S
              </span>
            </div>
            <p className="re-a-elnote" data-a-clear>
              {HERO.elNote}
            </p>
            {/* How to play with the field: shown only once the island is
                live (not without JS, not under reduced motion). */}
            <p className="re-a-hint" aria-hidden="true" data-a-clear>
              <svg viewBox="0 0 16 16" focusable="false">
                <path d="M3 2v6a5 5 0 0 0 10 0V2h-3v6a2 2 0 0 1-4 0V2z" />
              </svg>
              <span className="re-a-hint-fine">
                Your pointer is a magnet too.
              </span>
              <span className="re-a-hint-touch">
                Tap or drag sideways: your finger is a magnet too.
              </span>
            </p>
          </div>

          <p className="font-read re-a-lede" data-a-clear>
            {HERO.lede}
          </p>
          <dl className="re-a-readout" data-a-clear>
            {HERO.readout.map((r) => (
              <div key={r.k} className="re-a-ro">
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
          <div className="re-a-kiru" aria-hidden="true">
            <Kiru pose="storm" />
          </div>
        </div>
      </header>

      {/* ── The short answer ─────────────────────────────────────────────── */}
      <section
        className="re-wrap re-a-answer"
        aria-labelledby="re-a-answer-t"
        data-a-answer
      >
        <h2
          id="re-a-answer-t"
          className="font-display re-a-answer-t sd-brush-under"
        >
          {HERO.answer.title}
        </h2>
        <ol className="re-a-picks" role="list">
          {ranked.map((p, i) => (
            <li key={p.name} className="re-a-pick is-ranked">
              <span className="re-a-pick-n" aria-hidden="true">
                {i + 1}
              </span>
              <p className="re-a-pick-role">{p.role}</p>
              <h3 className="font-display re-a-pick-name">{p.name}</h3>
              <p className="re-a-pick-text">
                <Rich text={p.text} />
              </p>
            </li>
          ))}
          {twist.map((p) => (
            <li key={p.name} className="re-a-pick is-twist sd-note">
              <Seal char="岐" className="re-a-twist-seal" />
              <p className="re-a-pick-role">{p.role}</p>
              <h3 className="font-display re-a-pick-name">{p.name}</h3>
              <p className="font-read re-a-pick-text">
                <Rich text={p.text} />
              </p>
            </li>
          ))}
        </ol>
        <p className="re-a-disclaimer">{HERO.answer.disclaimer}</p>
      </section>

      {/* ── Contents: the chapters as a periodic table ───────────────────── */}
      <nav className="re-wrap re-a-toc" aria-labelledby="re-a-toc-t" data-a-toc>
        <h2 id="re-a-toc-t" className="sd-kicker re-a-toc-t">
          {HERO.contentsLabel}
        </h2>
        <ol className="re-a-pt" role="list">
          {CHAPTERS.map((c) => (
            <li key={c.id}>
              <a href={`#${c.id}`} className="re-a-pt-el">
                <span className="re-a-pt-n">
                  {String(c.n).padStart(2, '0')}
                </span>
                <span className="re-a-pt-sym" aria-hidden="true">
                  {SYMBOL[c.id] ?? c.toc.slice(0, 2)}
                </span>
                <span className="re-a-pt-t">{c.toc}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ChapterRail
        chapters={CHAPTERS.map(({ id, n, toc }) => ({ id, n, toc }))}
      />
    </>
  );
}
