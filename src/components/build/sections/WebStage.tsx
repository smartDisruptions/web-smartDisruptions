import type { CSSProperties } from 'react';
import Kiru from '@/components/kiru/Kiru';
import StaticSvg from '@/components/brand/StaticSvg';
import { box, line, pen, picture, pill, scribble } from './pen';

/**
 * Build Websites, played by the scroll: a shoji-framed browser (the wooden
 * top rail is the browser's bar) showing a tiny site. It arrives as a pen
 * sketch on washi, inks itself block by block into the finished site, and
 * then Kiru, peeking over the top rail, drags the window down to a phone's
 * width while the site reflows to fit: the menu folds into a hamburger, the
 * picture moves up, the cards drop below the fold.
 *
 * The squeeze is three nested clip windows moving in opposite directions
 * (build.css explains), so the frame narrows without animating a width: all
 * transforms. Each block of the site is one element that slides and scales
 * to its phone place, and its finished face presses in over the sketch, which
 * is a single drawing underneath that fades once the ink is down. Geometry is
 * in the stage's container units (cqi), so the whole thing scales as one
 * picture. The base styles are the finished desktop site: what a reader sees
 * without scroll timelines, or with reduced motion.
 */

const INK = 'var(--hb-ink)';
const PEN = {
  fill: 'none',
  stroke: 'var(--hb-sketch)',
  strokeWidth: 3.2,
  strokeLinecap: 'round' as const,
};

/** Its slice of the run: when this face presses in (0–1 of the whole run). */
const slice = (a: number, b: number) =>
  ({ '--a': a, '--b': b }) as CSSProperties;

/** The wireframe: every block, drawn by hand, in page units (10 per cqi). */
function Sketch() {
  const r = pen(11);
  const at = (x: number, y: number, d: string) => (
    <path d={d} transform={`translate(${x} ${y})`} {...PEN} />
  );
  return (
    <StaticSvg viewBox="0 0 872 505" className="hb-web-sketch">
      {/* brand: a dashed sun and the name */}
      <circle cx="56" cy="42" r="15" {...PEN} strokeDasharray="7 6" />
      {at(36, 22, box(56, 11, 104, 18, r, 3))}
      {/* the menu */}
      {at(
        0,
        0,
        line(562, 41, 622, 41, r) +
          line(647, 41, 707, 41, r) +
          line(732, 41, 792, 41, r)
      )}
      {/* the words: a headline, a line, a button */}
      {at(36, 120, scribble(4, 18, 330, 10, r))}
      {at(36, 120, scribble(4, 66, 236, 10, r))}
      {at(36, 120, line(4, 118, 316, 118, r) + line(4, 146, 236, 146, r))}
      {at(36, 120, pill(4, 184, 126, 38, r))}
      {/* the picture */}
      {at(462, 104, picture(6, 6, 362, 214, r))}
      <circle cx="728" cy="178" r="34" {...PEN} strokeDasharray="8 7" />
      {/* three cards */}
      {[36, 310, 584].map((x) => (
        <g key={x}>
          {at(x, 370, box(4, 4, 242, 114, r, 3))}
          {at(
            x,
            370,
            line(4, 72, 246, 72, r) +
              line(4, 4, 246, 72, r, 3) +
              line(246, 4, 4, 72, r, 3)
          )}
          {at(x, 370, line(18, 90, 160, 90, r) + line(18, 106, 112, 106, r))}
        </g>
      ))}
    </StaticSvg>
  );
}

/** The logo and the site's name. */
function Brand() {
  return (
    <span className="hb-web-b hb-web-brand">
      <StaticSvg
        viewBox="0 0 164 40"
        className="hb-web-ink"
        style={slice(0, 0.14)}
      >
        <circle cx="20" cy="20" r="19" fill="var(--hb-sun)" />
        <rect x="54" y="10" width="110" height="20" rx="10" fill={INK} />
      </StaticSvg>
    </span>
  );
}

/** The hero picture: a vermilion sun over Fuji, the site's own hero in miniature. */
function Art() {
  return (
    <span className="hb-web-b hb-web-art">
      <StaticSvg
        viewBox="0 0 374 226"
        className="hb-web-ink"
        style={slice(0.12, 0.3)}
      >
        <defs>
          <linearGradient id="hb-web-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6e2bd" />
            <stop offset="1" stopColor="#fbf3e2" />
          </linearGradient>
          <clipPath id="hb-web-art-clip">
            <rect width="374" height="226" rx="16" />
          </clipPath>
        </defs>
        <g clipPath="url(#hb-web-art-clip)">
          <rect width="374" height="226" fill="url(#hb-web-sky)" />
          <circle cx="266" cy="74" r="40" fill="var(--hb-sun)" />
          <path
            d="M18 226 L150 92 Q160 82 172 84 L186 86 Q196 84 204 92 L348 226 Z"
            fill="#2b3050"
          />
          <path
            d="M150 92 Q160 82 172 84 L186 86 Q196 84 204 92 L222 110 L204 104 L190 114 L176 102 L160 112 L146 98 Z"
            fill="#f4f1ea"
          />
          <path
            d="M-10 226 Q70 176 150 196 T300 186 T390 200 L390 226 Z"
            fill="#1d2138"
          />
          <rect
            x="34"
            y="52"
            width="70"
            height="7"
            rx="3.5"
            fill="#fffaf0"
            opacity="0.9"
          />
          <rect
            x="58"
            y="66"
            width="44"
            height="7"
            rx="3.5"
            fill="#fffaf0"
            opacity="0.7"
          />
        </g>
      </StaticSvg>
    </span>
  );
}

/** The headline, its line, and a button. */
function Words() {
  return (
    <span className="hb-web-b hb-web-words">
      <StaticSvg
        viewBox="0 0 360 224"
        className="hb-web-ink"
        style={slice(0.06, 0.22)}
      >
        <rect width="360" height="224" fill="var(--hb-paper)" />
        <rect x="0" y="0" width="352" height="38" rx="7" fill={INK} />
        <rect x="0" y="48" width="252" height="38" rx="7" fill={INK} />
        <rect
          x="0"
          y="110"
          width="320"
          height="15"
          rx="7.5"
          fill="var(--hb-muted)"
        />
        <rect
          x="0"
          y="138"
          width="236"
          height="15"
          rx="7.5"
          fill="var(--hb-muted)"
        />
        <rect
          x="0"
          y="180"
          width="132"
          height="44"
          rx="22"
          fill="var(--hb-button)"
        />
        <rect x="30" y="197" width="72" height="10" rx="5" fill="#fff" />
      </StaticSvg>
    </span>
  );
}

const CARD_TINTS = [
  ['#2b3a96', '#6b7bd6'],
  ['#c8962e', '#efcf7c'],
  ['#e2412a', '#f39a7f'],
];

/** A card: a picture, a title, a line. */
function Card({ i }: { i: number }) {
  const [a, b] = CARD_TINTS[i];
  const id = `hb-web-card-${i}`;
  return (
    <span className={`hb-web-b hb-web-card hb-web-c${i}`}>
      <StaticSvg
        viewBox="0 0 250 122"
        className="hb-web-ink"
        style={slice(0.2 + i * 0.05, 0.34 + i * 0.05)}
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="248"
          height="120"
          rx="12"
          fill="#fff"
          stroke="var(--hb-rule)"
          strokeWidth="2"
        />
        <path
          d="M1 13 Q1 1 13 1 L237 1 Q249 1 249 13 L249 72 L1 72 Z"
          fill={`url(#${id})`}
        />
        <circle cx={60 + i * 60} cy="36" r="14" fill="#fff" opacity="0.35" />
        <rect x="18" y="84" width="150" height="12" rx="6" fill={INK} />
        <rect
          x="18"
          y="102"
          width="98"
          height="9"
          rx="4.5"
          fill="var(--hb-muted)"
        />
      </StaticSvg>
    </span>
  );
}

export default function WebStage() {
  return (
    <div className="hb-ground hb-web-stage">
      <span className="hb-web-shadow" />
      <div className="hb-web-win">
        <div className="hb-web-pane">
          <div className="hb-web-page">
            <Sketch />
            <Brand />
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`hb-web-link hb-web-l${i}`}
                style={slice(0.02 + i * 0.03, 0.12 + i * 0.03)}
              />
            ))}
            <Art />
            <Words />
            <Card i={0} />
            <Card i={1} />
            <Card i={2} />
          </div>
        </div>
        <span className="hb-web-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="hb-web-slot" />
      </div>
      <span className="hb-web-kiru">
        <Kiru pose="peek" />
      </span>
    </div>
  );
}
