/**
 * The geometry of "the path" on /about — one switchback trail, generated once
 * on the server and handed to two consumers that must agree to the pixel:
 *
 *  - the SVG brush stroke that inks itself as you scroll (stroke-dashoffset,
 *    normalised with pathLength="1"), and
 *  - Kiru, who runs it on `offset-path: shape(...)`.
 *
 * Why a switchback and not a free curve: the SVG is stretched to the timeline's
 * height (preserveAspectRatio="none", so x stays in pixels and only y scales),
 * while the CSS shape() is measured in real pixels. A dash fraction is measured
 * along the path in the SVG's own units; offset-distance is measured along it
 * on screen. The two only agree everywhere if every leg of the path climbs at
 * the same slope, because then distance along the path is proportional to
 * height in BOTH spaces. Equal-slope legs make the ink tip, Kiru and the
 * reader's eye line all land on the same spot — 60% down the screen — with no
 * JavaScript measuring anything.
 */

export type Route = {
  /** SVG path data in the rail's viewBox: x in px, y in 0..1000. */
  d: string;
  /** The same path as a CSS shape(): x in px, y in % of the rail's height. */
  shape: string;
  /** viewBox for the rail SVG. */
  viewBox: string;
  /** Where each corner falls, as a fraction of the path (0..1). */
  turns: number[];
};

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * @param width   rail width in px (the SVG's x units are px)
 * @param amp     how far each leg swings from the centre, px
 * @param legs    how many corners the trail turns
 * @param round   corner rounding, as a fraction of a leg (0..0.5)
 */
export function switchback(
  width: number,
  amp: number,
  legs: number,
  round = 0.2
): Route {
  const c = width / 2;
  const h = 1000 / legs; // one full leg, corner to corner, in y units
  const pts: [number, number][] = [[c, 0]];
  for (let i = 0; i < legs; i++)
    pts.push([c + (i % 2 === 0 ? amp : -amp), (i + 0.5) * h]);
  pts.push([c, 1000]);

  // Each corner becomes a quadratic: come in `round` of the way along the leg,
  // bend through the corner as the control point, leave the same distance out.
  // Bézier curves survive the non-uniform stretch exactly (they're affine
  // invariant), so the SVG and the CSS shape() stay the same curve on screen.
  const lerp = (
    a: [number, number],
    b: [number, number],
    t: number
  ): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  type Cmd =
    | { kind: 'L'; to: [number, number] }
    | { kind: 'Q'; ctrl: [number, number]; to: [number, number] };
  const cmds: Cmd[] = [];
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const next = pts[i + 1];
    // The first and last legs are half legs; keep the rounding the same size
    // in absolute terms so every corner looks alike.
    const tin = i === 1 ? round * 2 : round;
    const tout = i === pts.length - 2 ? round * 2 : round;
    cmds.push({ kind: 'L', to: lerp(cur, prev, Math.min(tin, 0.5)) });
    cmds.push({
      kind: 'Q',
      ctrl: cur,
      to: lerp(cur, next, Math.min(tout, 0.5)),
    });
  }
  cmds.push({ kind: 'L', to: pts[pts.length - 1] });

  const d =
    `M${r1(pts[0][0])} ${r1(pts[0][1])} ` +
    cmds
      .map((k) =>
        k.kind === 'L'
          ? `L${r1(k.to[0])} ${r1(k.to[1])}`
          : `Q${r1(k.ctrl[0])} ${r1(k.ctrl[1])} ${r1(k.to[0])} ${r1(k.to[1])}`
      )
      .join(' ');

  const pc = (y: number) => `${r1(y / 10)}%`;
  const shape =
    `shape(from ${r1(pts[0][0])}px ${pc(pts[0][1])}, ` +
    cmds
      .map((k) =>
        k.kind === 'L'
          ? `line to ${r1(k.to[0])}px ${pc(k.to[1])}`
          : `curve to ${r1(k.to[0])}px ${pc(k.to[1])} with ${r1(k.ctrl[0])}px ${pc(k.ctrl[1])}`
      )
      .join(', ') +
    ')';

  return {
    d,
    shape,
    viewBox: `0 0 ${width} 1000`,
    turns: Array.from({ length: legs }, (_, i) => (i + 0.5) / legs),
  };
}

/**
 * Kiru's run pose faces left. On a leg heading right he turns around; the
 * keyframes flip him (a quick turn on the Y axis) at every corner, on the same
 * scroll timeline as his travel, so he always faces the way he is going.
 */
export function turnKeyframes(name: string, turns: number[]): string {
  const e = 0.35; // % of the path either side of a corner that the turn takes
  const face = (i: number) => (i % 2 === 0 ? 'y 180deg' : 'y 0deg'); // leg 0 heads right
  const frames: string[] = [`0%{rotate:${face(0)}}`];
  turns.forEach((t, i) => {
    const at = t * 100;
    frames.push(`${r1(at - e)}%{rotate:${face(i)}}`);
    frames.push(`${r1(at + e)}%{rotate:${face(i + 1)}}`);
  });
  frames.push(`100%{rotate:${face(turns.length)}}`);
  return `@keyframes ${name}{${frames.join('')}}`;
}
