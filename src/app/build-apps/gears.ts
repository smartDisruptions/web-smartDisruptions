/**
 * Gear outlines for the logic layer of the /build-apps phone (karakuri, the
 * old Japanese clockwork). Computed once on the server; the browser only ever
 * sees the finished path. One path per gear: the toothed rim, the axle hole
 * and a ring of lightening holes, cut out with fill-rule evenodd.
 */
const f = (n: number) => (Math.round(n * 100) / 100).toString();

function circle(cx: number, cy: number, r: number): string {
  return `M${f(cx + r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}Z`;
}

export function gearPath({
  teeth,
  tip,
  root,
  hole,
  windows = 0,
}: {
  teeth: number;
  /** Radius at the tips of the teeth. */
  tip: number;
  /** Radius at the roots, between the teeth. */
  root: number;
  /** The axle hole. */
  hole: number;
  /** Round lightening holes between the hub and the rim. */
  windows?: number;
}): string {
  // Centred on 0,0 so the gear turns about its own middle.
  const step = (Math.PI * 2) / teeth;
  const at = (r: number, a: number) =>
    `${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`;
  let d = '';
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    d += `${i ? 'L' : 'M'}${at(root, a - step * 0.5)}L${at(root, a - step * 0.3)}L${at(tip, a - step * 0.17)}L${at(tip, a + step * 0.17)}L${at(root, a + step * 0.3)}`;
  }
  d += 'Z';
  d += circle(0, 0, hole);
  if (windows) {
    const ring = (root + hole) / 2;
    const r = (root - hole) * 0.26;
    for (let i = 0; i < windows; i++) {
      const a = (i / windows) * Math.PI * 2 + step / 2;
      d += circle(ring * Math.cos(a), ring * Math.sin(a), r);
    }
  }
  return d;
}
