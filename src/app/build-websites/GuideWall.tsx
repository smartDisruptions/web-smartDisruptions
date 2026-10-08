import Link from 'next/link';
import StaticSvg from '@/components/brand/StaticSvg';
import { GUIDES } from './guides';

/**
 * The guides, as panes on a shoji screen. Until the first guide exists the
 * wall is honest about it: three blank panes, and an ensō (the brush circle
 * Zen painters use for "empty, and complete") where the first one will go.
 * Once there are guides they fill the panes newest first, and blank panes
 * finish the last row so the screen always looks built, not broken.
 */

/**
 * An ensō: one loaded stroke. It lands heavy at the lower left, swells round
 * the bowl, and runs dry at the end, where the bristles part into strands.
 * Built once on the server as a few filled outlines.
 */
const ENSO = (() => {
  const cx = 60;
  const cy = 61;
  const r = 41;
  const start = (128 * Math.PI) / 180; // lower left, where the brush lands
  const sweep = (324 * Math.PI) / 180;
  const ring = (t: number, off: number) => {
    const a = start + t * sweep;
    const wob = 1.6 * Math.sin(t * 7.3) + 0.7 * Math.sin(t * 19);
    const rr = r + wob + off;
    return `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  };
  // Pressure: a blot where it lands, full through the bowl, thinning out.
  const width = (t: number) =>
    2 + 22 * Math.pow(Math.min(1, t * 7), 0.5) * Math.pow(1 - t * 0.7, 1.3);
  const body = (t0: number, t1: number, lo: number, hi: number) => {
    const n = 48;
    const outer: string[] = [];
    const inner: string[] = [];
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      const w = width(t);
      outer.push(ring(t, w * hi));
      inner.push(ring(t, w * lo));
    }
    return `M${outer.join('L')}L${inner.reverse().join('L')}Z`;
  };
  // The body, then the dry tail as three strands with gaps between them.
  return [
    body(0, 0.8, -0.5, 0.5),
    body(0.78, 1, 0.18, 0.5),
    body(0.78, 0.96, -0.12, 0.08),
    body(0.78, 0.9, -0.5, -0.3),
  ].join(' ');
})();

const fmt = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

export default function GuideWall() {
  const guides = [...GUIDES].sort((a, b) => b.date.localeCompare(a.date));
  const empty = guides.length === 0;
  const blanks = empty ? 0 : (3 - (guides.length % 3)) % 3;

  return (
    <section className="bw-guides" aria-labelledby="bw-guides-h">
      <p className="sd-kicker">The guides</p>
      <h2 id="bw-guides-h" className="font-display bw-h2">
        {empty ? 'Nothing on the wall yet.' : 'Website guides'}
      </h2>
      <p className="bw-guides-lede font-read">
        {empty
          ? 'Each guide I write on building websites gets a pane here. The first one isn’t up yet.'
          : 'Newest first.'}
      </p>

      {empty ? (
        <div className="bw-shoji" aria-hidden>
          <span className="bw-pane bw-pane-empty">
            <StaticSvg
              className="bw-enso"
              viewBox="0 0 120 120"
              fill="currentColor"
            >
              <path d={ENSO} />
            </StaticSvg>
            <span className="bw-pane-note">The first guide goes here.</span>
          </span>
          <span className="bw-pane" />
          <span className="bw-pane" />
        </div>
      ) : (
        <ol className="bw-shoji bw-shoji-list" role="list">
          {guides.map((g) => (
            <li key={g.href} className="bw-pane">
              <Link href={g.href} className="sd-card bw-guide">
                <time className="bw-guide-date" dateTime={g.date}>
                  {fmt(g.date)}
                </time>
                <span className="font-display bw-guide-title">{g.title}</span>
                <span className="font-read bw-guide-sum">{g.summary}</span>
                <span className="bw-guide-go" aria-hidden>
                  Read it &rarr;
                </span>
              </Link>
            </li>
          ))}
          {Array.from({ length: blanks }, (_, i) => (
            <li
              key={`blank-${i}`}
              className="bw-pane bw-pane-blank"
              aria-hidden
            />
          ))}
        </ol>
      )}
    </section>
  );
}
