#!/usr/bin/env node
/**
 * Builds Kiru's headband tails: the pieces each tail is cut into, and the CSS
 * that moves them.
 *
 *   node scripts/build-kiru-tails.mjs
 *
 * Writes src/components/kiru/tails.ts (path data) and tails.css (motion). Both
 * are committed; re-run this after changing DRAWN or MOTION below.
 *
 * Why pieces: the tails used to be SMIL path morphs, and SMIL runs on the main
 * thread every frame. A ninja on screen cost a phone about a third of its main
 * thread at rest. Transforms run on the compositor instead, but a transform
 * can only move a shape, not bend it, so each tail is cut in two near its
 * middle: a root piece that swings (and billows a little) from the knot, and a
 * tip piece that turns on a joint and lags behind it. That's a ribbon with one
 * bend in it, which at Kiru's size reads as the old flutter.
 *
 * The joint is the circle inscribed in the ribbon at the cut, touching both
 * edges. The tip carries that whole disc as a cap, so however it turns, the
 * pieces still cover the disc: the outside of the bend is a round elbow,
 * tangent to both edges, and the inside is a crease. The root's outline stops
 * just short of the cut and the cap's outline carries on from there, so no two
 * anti-aliased edges ever sit on top of each other (that leaves a hairline).
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_TS = path.join(ROOT, 'src/components/kiru/tails.ts');
const OUT_CSS = path.join(ROOT, 'src/components/kiru/tails.css');

// The tails as drawn, at rest: knot end, top edge (two cubics) to the tip,
// bottom edge (two cubics) back. The node between each pair of cubics is where
// the ribbon gets its joint.
const DRAWN = {
  hi: 'M166 66 C182 54 196 62 210 52 C218 46 224 40 230 34 C226 48 218 58 206 64 C192 72 180 70 168 76 Z',
  lo: 'M166 72 C184 70 196 82 214 76 C222 73 228 68 233 62 C228 76 218 86 205 89 C190 92 178 84 166 82 Z',
  // Running: streamed flat behind him.
  'hi-run': 'M166 66 C188 60 210 66 232 60 C242 57 250 56 258 54 C252 64 244 70 232 72 C212 76 190 74 168 76 Z',
  'lo-run': 'M166 72 C190 74 212 80 234 76 C244 74 252 74 260 72 C254 82 244 88 232 88 C210 90 188 86 166 82 Z',
};

// Three poses per flap, eased like the SMIL they replace. root: [percent of
// the flap, degrees about the knot, billow across the ribbon]; tip: [percent,
// degrees about the joint]. Fitted to the old keyframes, then softened at the
// joint. Several flaps make one loop, because every loop restart wakes the main
// thread (React listens for animationiteration at its root): the two idle
// tails share a 15.2 s loop (8 flaps of 1.9 s, 7 of 2.17 s), the running ones
// a 5.5 s loop (11 of 0.5 s, 10 of 0.55 s).
const MOTION = {
  hi: { loop: 15.2, flaps: 8, root: [[33, 3.4, 1.18], [66, -10.5, 1.12]], tip: [[33, 13], [66, 18]] },
  lo: { loop: 15.2, flaps: 7, root: [[33, 3, 1.22], [66, -8.5, 0.97]], tip: [[33, 16], [66, 4]] },
  'hi-run': { loop: 5.5, flaps: 11, root: [[33, 2, 1.12], [66, -5, 1]], tip: [[33, 9], [66, 3]] },
  'lo-run': { loop: 5.5, flaps: 10, root: [[33, 2.2, 1.15], [66, -6, 1.06]], tip: [[33, 12], [66, 4]] },
};
const EASE = 'cubic-bezier(0.45, 0, 0.55, 1)';
const EPS = 0.4; // how far short of the cut the root's outline stops

// ── geometry ────────────────────────────────────────────────────────────────
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const unit = (a) => mul(a, 1 / Math.hypot(a[0], a[1]));
const mid = (a, b) => mul(add(a, b), 0.5);
const lerp = (a, b, t) => add(a, mul(sub(b, a), t));

/** de Casteljau: a cubic [p0, c1, c2, p3] split at t. */
function split(c, t) {
  const [p0, p1, p2, p3] = c;
  const a = lerp(p0, p1, t), b = lerp(p1, p2, t), d = lerp(p2, p3, t);
  const e = lerp(a, b, t), f = lerp(b, d, t), g = lerp(e, f, t);
  return [[p0, a, e, g], [g, f, d, p3]];
}
const at = (c, t) => split(c, t)[0][3];
const tangent = (c, t) => unit(sub(at(c, Math.min(1, t + 1e-5)), at(c, Math.max(0, t - 1e-5))));
const arcLength = (c, t0, t1, n = 200) => {
  let len = 0;
  for (let i = 1, prev = at(c, t0); i <= n; i++) {
    const p = at(c, t0 + ((t1 - t0) * i) / n);
    len += dist(p, prev);
    prev = p;
  }
  return len;
};
/** The t on cubic c that lies `len` along the curve from t0 (toward t = 1 if sign > 0, else toward 0). */
function walk(c, t0, len, sign) {
  let lo = sign > 0 ? t0 : 0, hi = sign > 0 ? 1 : t0;
  for (let i = 0; i < 50; i++) {
    const m = (lo + hi) / 2;
    const l = sign > 0 ? arcLength(c, t0, m) : arcLength(c, m, t0);
    if ((l < len) === sign > 0) lo = m;
    else hi = m;
  }
  return (lo + hi) / 2;
}

const parse = (d) => {
  const n = d.match(/-?\d+(\.\d+)?/g).map(Number);
  const pt = (i) => [n[i], n[i + 1]];
  return {
    top: [[pt(0), pt(2), pt(4), pt(6)], [pt(6), pt(8), pt(10), pt(12)]], // knot -> tip
    bottom: [[pt(12), pt(14), pt(16), pt(18)], [pt(18), pt(20), pt(22), pt(24)]], // tip -> knot
  };
};
const samples = (segs, n = 600) => segs.flatMap((c, seg) => Array.from({ length: n + 1 }, (_, i) => ({ seg, t: i / n, p: at(c, i / n) })));
const nearest = (pts, q) => pts.reduce((best, s) => (dist(s.p, q) < dist(best.p, q) ? s : best));

const num = (v) => String(Math.round(v * 100) / 100);
const P = (p) => `${num(p[0])} ${num(p[1])}`;
const C = (c) => `C${P(c[1])} ${P(c[2])} ${P(c[3])}`;

function cut(d) {
  const { top, bottom } = parse(d);
  const knot = mid(top[0][0], bottom[1][3]);
  const dir = unit(add(tangent(top[0], 1), mul(tangent(bottom[0], 1), -1))); // along the ribbon, toward the tip
  const node = mid(top[0][3], bottom[0][3]);

  // T: the top-edge point level with the middle node; grow a circle from T along
  // the edge's inward normal until it touches the bottom edge, at B.
  const topPts = samples(top), botPts = samples(bottom);
  const T0 = topPts.reduce((best, s) => (Math.abs(dot(sub(s.p, node), dir)) < Math.abs(dot(sub(best.p, node), dir)) ? s : best));
  const tT = tangent(top[T0.seg], T0.t);
  let n = [-tT[1], tT[0]];
  if (dot(n, sub(nearest(botPts, T0.p).p, T0.p)) < 0) n = mul(n, -1);
  let lo = 0, hi = 40;
  for (let i = 0; i < 60; i++) {
    const r = (lo + hi) / 2, c = add(T0.p, mul(n, r));
    if (dist(nearest(botPts, c).p, c) > r) lo = r;
    else hi = r;
  }
  const r = (lo + hi) / 2;
  const J = add(T0.p, mul(n, r));
  const B0 = nearest(botPts, J);
  const T = T0.p, B = B0.p;

  // The edges, split at T and B (and EPS short of them, for the root's outline).
  const before = (segs, s) => (s.seg === 0 ? [split(segs[0], s.t)[0]] : [segs[0], split(segs[1], s.t)[0]]);
  const after = (segs, s) => (s.seg === 0 ? [split(segs[0], s.t)[1], segs[1]] : [split(segs[1], s.t)[1]]);
  const topRoot = before(top, T0), topTip = after(top, T0);
  const botTip = before(bottom, B0), botRoot = after(bottom, B0);
  const topRootShort = before(top, { seg: T0.seg, t: walk(top[T0.seg], T0.t, EPS, -1) });
  const botRootShort = after(bottom, { seg: B0.seg, t: walk(bottom[B0.seg], B0.t, EPS, 1) });

  // The tip's cap: round the back of the circle from B to T, as two arcs through
  // its back-most point K (one arc whose chord is nearly a diameter has a centre
  // that rounding can move by a whole unit).
  const back = Math.atan2(-dir[1], -dir[0]);
  const K = add(J, mul([Math.cos(back), Math.sin(back)], r));
  const wrap = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const angle = (p) => Math.atan2(p[1] - J[1], p[0] - J[0]);
  const sweep = wrap(back - angle(B)) < wrap(angle(T) - angle(B)) ? 1 : 0;
  const R = num(r);

  return {
    knot,
    joint: J,
    axis: (Math.atan2(J[1] - knot[1], J[0] - knot[0]) * 180) / Math.PI,
    tip: `M${P(B)} A${R} ${R} 0 0 ${sweep} ${P(K)} A${R} ${R} 0 0 ${sweep} ${P(T)} ${topTip.map(C).join(' ')} ${botTip.map(C).join(' ')} Z`,
    outline: `M${P(botRootShort[0][0])} ${botRootShort.map(C).join(' ')} L${P(top[0][0])} ${topRootShort.map(C).join(' ')}`,
    fill: `M${P(B)} ${botRoot.map(C).join(' ')} L${P(top[0][0])} ${topRoot.map(C).join(' ')} L${P(J)}Z`,
  };
}

// ── output ──────────────────────────────────────────────────────────────────
const pieces = Object.fromEntries(Object.entries(DRAWN).map(([k, d]) => [k, cut(d)]));
const HEAD = 'Generated by scripts/build-kiru-tails.mjs. Edit the drawing or the motion there and re-run.';

const ts = `// ${HEAD}

/**
 * Kiru's headband tails, each cut into a tip (with its round cap at the joint),
 * the root's outline (open: no line across the cut) and the root's fill. See
 * the script for why, and tails.css for how they move.
 */
export const TAILS = {
${Object.entries(pieces)
  .map(([k, p]) => `  ${/^\w+$/.test(k) ? k : `'${k}'`}: {\n    tip: '${p.tip}',\n    outline: '${p.outline}',\n    fill: '${p.fill}',\n  },`)
  .join('\n')}
} as const;

export type TailName = keyof typeof TAILS;
`;

const deg = (v) => `${num(v)}deg`;
const px = (p) => `${num(p[0])}px ${num(p[1])}px`;
// One keyframe block per pose, listing every point in the loop where it falls.
const frames = (rows, f, flaps) => {
  const pct = (v) => `${Math.round(v * 1000) / 1000}%`;
  const at = (p) => Array.from({ length: flaps }, (_, i) => pct(((i + p / 100) * 100) / flaps));
  const blocks = [[[...at(0), '100%'], f()], ...rows.map(([p, ...v]) => [at(p), f(...v)])];
  return blocks.map(([stops, t]) => `  ${stops.join(', ')} {\n    transform: ${t};\n  }`).join('\n');
};
const css = `/* ${HEAD}

   Kiru's headband tails (src/components/kiru/Kiru.tsx). The root piece swings
   and billows from the knot, the tip turns on its joint and lags behind it.
   Transforms only, so the compositor runs them: no main-thread work per frame.
   Like the rest of his idle motion, only while he is on screen (data-live) and
   never under reduced motion. */
.kiru .kt-o {
  stroke: var(--kiru-line);
  stroke-width: 4px;
  stroke-linejoin: round;
  paint-order: stroke;
}
@media (prefers-reduced-motion: no-preference) {
${Object.entries(pieces)
  .map(([k, p]) => {
    const anim = (name) => `animation: ${name} ${MOTION[k].loop}s ${EASE} infinite;`;
    return `  .kiru[data-live] .kt-${k} {\n    ${anim(`kt-${k}`)}\n    transform-origin: ${px(p.knot)};\n  }\n  .kiru[data-live] .kt-${k} > .kt-tip {\n    ${anim(`kt-${k}-tip`)}\n    transform-origin: ${px(p.joint)};\n  }`;
  })
  .join('\n')}
}
${Object.entries(pieces)
  .map(([k, p]) => {
    const a = p.axis;
    // the billow scales across the ribbon: turn its axis level, scale, turn back
    const root = (turn, billow) => `rotate(${deg(turn ?? 0)}) rotate(${deg(a)}) scaleY(${num(billow ?? 1)}) rotate(${deg(-a)})`;
    const tip = (turn) => `rotate(${deg(turn ?? 0)})`;
    return `@keyframes kt-${k} {\n${frames(MOTION[k].root, root, MOTION[k].flaps)}\n}\n@keyframes kt-${k}-tip {\n${frames(MOTION[k].tip, tip, MOTION[k].flaps)}\n}`;
  })
  .join('\n')}
`;

writeFileSync(OUT_TS, ts);
writeFileSync(OUT_CSS, css);
console.log(`wrote ${path.relative(ROOT, OUT_TS)} (${ts.length} B) and ${path.relative(ROOT, OUT_CSS)} (${css.length} B)`);
