/**
 * Small geometry helpers for the machines' SVG art. Everything here runs on
 * the server (the machines are server components), so the paths ship as
 * plain strings and cost the browser nothing to compute.
 */

const r1 = (n: number) => Math.round(n * 10) / 10;

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** A fluffy ball: a circle whose edge is a ring of soft bumps (a dust bunny). */
export function fluff(cx: number, cy: number, r: number, bumps: number, depth: number) {
  const pts: string[] = [];
  for (let i = 0; i < bumps; i++) {
    const a0 = (i / bumps) * Math.PI * 2;
    const a1 = ((i + 1) / bumps) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    // Wobble the bump depth a little so the fluff doesn't look stamped.
    const d = depth * (0.75 + 0.5 * Math.abs(Math.sin(i * 2.3)));
    const qx = cx + (r + d) * Math.cos(am);
    const qy = cy + (r + d) * Math.sin(am);
    if (i === 0) pts.push(`M${r1(x0)} ${r1(y0)}`);
    pts.push(`Q${r1(qx)} ${r1(qy)} ${r1(x1)} ${r1(y1)}`);
  }
  return pts.join('') + 'Z';
}

/** A row of hanging scallops (an awning's edge) from x0 to x1, top at y. */
export function scallops(x0: number, x1: number, y: number, n: number, depth: number) {
  const w = (x1 - x0) / n;
  return range(n).map((i) => {
    const a = x0 + i * w;
    const b = a + w;
    return `M${r1(a)} ${r1(y)}H${r1(b)}V${r1(y + depth * 0.35)}C${r1(b)} ${r1(y + depth * 1.18)} ${r1(a)} ${r1(
      y + depth * 1.18
    )} ${r1(a)} ${r1(y + depth * 0.35)}Z`;
  });
}

/** Hanging pennants (bunting) under a shelf edge. */
export function pennants(x0: number, x1: number, y: number, n: number, depth: number) {
  const w = (x1 - x0) / n;
  return range(n).map((i) => {
    const a = x0 + i * w;
    return `M${r1(a)} ${r1(y)}H${r1(a + w)}L${r1(a + w / 2)} ${r1(y + depth)}Z`;
  });
}

/**
 * A rope net hanging from a rim: two families of diagonal strands, which
 * cross as diamonds and narrow toward the bottom hem.
 */
export function net(cx: number, top: number, rx: number, ry: number, rows: number, rowH: number, taper: number, cols = 8) {
  const point = (row: number, i: number) => {
    const t = Math.max(0, Math.min(cols, i)) / cols;
    const a = Math.PI * t;
    const w = rx - row * taper;
    const y = top + (row === 0 ? ry * Math.sin(a) : ry + row * rowH + 2.4 * Math.sin(a));
    return [cx - w * Math.cos(a), y] as const;
  };
  const strands: string[] = [];
  for (let s = -rows; s <= cols; s++) {
    for (const dir of [1, -1]) {
      const pts: string[] = [];
      for (let row = 0; row <= rows; row++) {
        const i = s + dir * row + (dir < 0 ? rows : 0);
        if (i < 0 || i > cols) continue;
        const [x, y] = point(row, i);
        pts.push(`${r1(x)} ${r1(y)}`);
      }
      if (pts.length > 1) strands.push('M' + pts.join('L'));
    }
  }
  const hem = range(cols + 1)
    .map((i) => point(rows, i))
    .map(([x, y]) => `${r1(x)} ${r1(y)}`)
    .join('L');
  return { strands, hem: 'M' + hem };
}

/** Evenly spaced points along a line, for rows of marquee bulbs. */
export function dots(x0: number, x1: number, y: number, n: number) {
  return range(n).map((i) => [r1(x0 + ((x1 - x0) * i) / Math.max(1, n - 1)), y] as const);
}

const pct = (n: number) => `${Math.round(n * 100000) / 1000}%`;

/**
 * An overlay that sits exactly over a region of a W×H artwork: its viewBox is
 * that region, so it is drawn in the artwork's own coordinates, and its box
 * is placed in percentages of the artwork's box (height follows the viewBox).
 */
export function region(x: number, y: number, w: number, h: number, W: number, H: number) {
  return {
    viewBox: `${x} ${y} ${w} ${h}`,
    style: { left: pct(x / W), top: pct(y / H), width: pct(w / W) },
  };
}

/** Points along a quadratic curve (an arched sign's bulbs). */
export function alongQuad(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, n: number) {
  return range(n).map((i) => {
    const t = i / Math.max(1, n - 1);
    const u = 1 - t;
    return [r1(u * u * x0 + 2 * u * t * cx + t * t * x1), r1(u * u * y0 + 2 * u * t * cy + t * t * y1)] as const;
  });
}
