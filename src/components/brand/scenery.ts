/**
 * Path generators for the site's Japanese scenery — roofs, pagodas, torii,
 * Mt. Fuji, bamboo, haze bands. Server-side only: pages ship the finished
 * path strings, never this code. Everything is deterministic, so the same
 * town is drawn on every build and hydration never sees a different path.
 */

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A seeded PRNG, so "random" scenery is identical on every render. */
export function seeded(seed: number) {
  let s = seed % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/** A hip roof with upturned corners — the curl is what reads as Japanese. */
export function roof(cx: number, y: number, hw: number, rise: number): string {
  return [
    `M${r1(cx - hw - 10)} ${r1(y - 6)}`,
    `Q${r1(cx - hw + 2)} ${r1(y + 3)} ${r1(cx - hw * 0.62)} ${r1(y - 5)}`,
    `L${r1(cx - hw * 0.22)} ${r1(y - rise)}`,
    `L${r1(cx + hw * 0.22)} ${r1(y - rise)}`,
    `L${r1(cx + hw * 0.62)} ${r1(y - 5)}`,
    `Q${r1(cx + hw - 2)} ${r1(y + 3)} ${r1(cx + hw + 10)} ${r1(y - 6)}`,
    `L${r1(cx + hw - 4)} ${r1(y + 4)}`,
    `L${r1(cx - hw + 4)} ${r1(y + 4)}`,
    'Z',
  ].join(' ');
}

export function pagoda(cx: number, base: number, tiers: number, width: number, tierH: number): string {
  const parts: string[] = [];
  for (let i = 0; i < tiers; i++) {
    const hw = width / 2 - i * (width * 0.07);
    const eave = base - i * tierH - tierH * 0.55;
    const bw = hw * 0.55;
    parts.push(
      `M${r1(cx - bw)} ${r1(base - i * tierH)} L${r1(cx - bw)} ${r1(eave)} L${r1(cx + bw)} ${r1(eave)} L${r1(cx + bw)} ${r1(base - i * tierH)} Z`,
    );
    parts.push(roof(cx, eave, hw, tierH * 0.42));
  }
  const top = base - tiers * tierH - tierH * 0.1;
  parts.push(`M${r1(cx - 2.5)} ${r1(top + 8)} L${r1(cx - 1.5)} ${r1(top - 46)} L${r1(cx + 1.5)} ${r1(top - 46)} L${r1(cx + 2.5)} ${r1(top + 8)} Z`);
  for (let k = 0; k < 5; k++) {
    const ry = top - 10 - k * 7;
    parts.push(`M${r1(cx - 7 + k)} ${r1(ry)} h${14 - 2 * k} v2.4 h${-(14 - 2 * k)} Z`);
  }
  return parts.join(' ');
}

export function torii(x: number, base: number, w: number, h: number): string {
  const p = w * 0.16;
  return [
    `M${r1(x + p)} ${base} L${r1(x + p + 4)} ${base - h} L${r1(x + p + 13)} ${base - h} L${r1(x + p + 11)} ${base} Z`,
    `M${r1(x + w - p - 11)} ${base} L${r1(x + w - p - 13)} ${base - h} L${r1(x + w - p - 4)} ${base - h} L${r1(x + w - p)} ${base} Z`,
    `M${x - 8} ${base - h - 2} Q${r1(x + w / 2)} ${base - h + 10} ${x + w + 8} ${base - h - 2} L${x + w + 4} ${base - h + 9} Q${r1(x + w / 2)} ${base - h + 18} ${x - 4} ${base - h + 9} Z`,
    `M${x + 2} ${r1(base - h * 0.74)} h${w - 4} v8 h${-(w - 4)} Z`,
  ].join(' ');
}

/** A row of town roofs across `width`, plus where their lit windows go. */
export function town(width: number, height: number, seed = 7, minW = 90, varW = 90) {
  const rnd = seeded(seed);
  const roofs: string[] = [];
  const windows: [number, number][] = [];
  let x = -20;
  while (x < width + 40) {
    const w = minW + rnd() * varW;
    const top = height - 38 - rnd() * 48;
    const cx = x + w / 2;
    roofs.push(roof(cx, top, w / 2, 26 + rnd() * 14));
    roofs.push(`M${r1(cx - w / 2 + 8)} ${r1(top + 4)} L${r1(cx - w / 2 + 8)} ${height} L${r1(cx + w / 2 - 8)} ${height} L${r1(cx + w / 2 - 8)} ${r1(top + 4)} Z`);
    const n = Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) windows.push([r1(cx - w / 4 + i * (w / 4)), r1(top + 18 + rnd() * 10)]);
    x += w + 6 + rnd() * 30;
  }
  return { roofs: roofs.join(' '), windows };
}

/** Mt. Fuji: concave flanks, a flat crater rim, a ragged snow line. */
export function fuji(cx: number, base: number, halfW: number, h: number) {
  const top = base - h;
  const rim = halfW * 0.085;
  const body = [
    `M${r1(cx - halfW)} ${base}`,
    `C${r1(cx - halfW * 0.6)} ${r1(base - h * 0.08)} ${r1(cx - halfW * 0.28)} ${r1(top + h * 0.42)} ${r1(cx - rim * 1.6)} ${r1(top + h * 0.05)}`,
    `Q${r1(cx - rim)} ${r1(top - h * 0.01)} ${r1(cx - rim * 0.5)} ${top}`,
    `L${r1(cx + rim * 0.5)} ${top}`,
    `Q${r1(cx + rim)} ${r1(top - h * 0.01)} ${r1(cx + rim * 1.6)} ${r1(top + h * 0.05)}`,
    `C${r1(cx + halfW * 0.28)} ${r1(top + h * 0.42)} ${r1(cx + halfW * 0.6)} ${r1(base - h * 0.08)} ${r1(cx + halfW)} ${base}`,
    'Z',
  ].join(' ');
  // Snow: follow the flanks down ~30%, then a ragged line back across.
  const sy = top + h * 0.3;
  const sxL = cx - halfW * 0.22;
  const sxR = cx + halfW * 0.22;
  const teeth: string[] = [];
  const n = 9;
  for (let i = 1; i < n; i++) {
    const x = sxR - ((sxR - sxL) * i) / n;
    const dip = i % 2 ? h * 0.07 : -h * 0.02;
    teeth.push(`L${r1(x)} ${r1(sy + dip + (i % 3 === 0 ? h * 0.04 : 0))}`);
  }
  const snow = [
    `M${r1(cx - rim * 1.6)} ${r1(top + h * 0.05)}`,
    `Q${r1(cx - rim)} ${r1(top - h * 0.01)} ${r1(cx - rim * 0.5)} ${top}`,
    `L${r1(cx + rim * 0.5)} ${top}`,
    `Q${r1(cx + rim)} ${r1(top - h * 0.01)} ${r1(cx + rim * 1.6)} ${r1(top + h * 0.05)}`,
    `C${r1(cx + halfW * 0.08)} ${r1(top + h * 0.16)} ${r1(cx + halfW * 0.16)} ${r1(top + h * 0.24)} ${r1(sxR)} ${r1(sy)}`,
    ...teeth,
    `L${r1(sxL)} ${r1(sy)}`,
    `C${r1(cx - halfW * 0.16)} ${r1(top + h * 0.24)} ${r1(cx - halfW * 0.08)} ${r1(top + h * 0.16)} ${r1(cx - rim * 1.6)} ${r1(top + h * 0.05)}`,
    'Z',
  ].join(' ');
  return { body, snow };
}

/** Bamboo: segmented stalks and a few blade leaves. */
export function bamboo(seed: number, count: number, width: number, height: number) {
  const rnd = seeded(seed);
  const stalks: string[] = [];
  const nodes: string[] = [];
  const leaves: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = (width / (count + 0.5)) * (i + 0.4) + rnd() * 18;
    const w = 9 + rnd() * 7;
    const lean = (rnd() - 0.5) * 30;
    const top = rnd() * height * 0.12;
    stalks.push(
      `M${r1(x - w / 2)} ${height} L${r1(x - w / 2 + lean)} ${r1(top)} Q${r1(x + lean)} ${r1(top - 6)} ${r1(x + w / 2 + lean)} ${r1(top)} L${r1(x + w / 2)} ${height} Z`,
    );
    const seg = 70 + rnd() * 40;
    for (let y = height - seg; y > top + 20; y -= seg) {
      const t = (height - y) / (height - top);
      const nx = x + lean * t;
      nodes.push(`M${r1(nx - w / 2 - 1.5)} ${r1(y)} h${r1(w + 3)} v3.2 h${r1(-(w + 3))} Z`);
      if (rnd() > 0.45) {
        const dir = rnd() > 0.5 ? 1 : -1;
        const len = 46 + rnd() * 40;
        const ly = y - 6;
        leaves.push(
          `M${r1(nx)} ${r1(ly)} Q${r1(nx + dir * len * 0.5)} ${r1(ly - 16)} ${r1(nx + dir * len)} ${r1(ly + 4)} Q${r1(nx + dir * len * 0.45)} ${r1(ly - 2)} ${r1(nx)} ${r1(ly + 3)} Z`,
        );
        leaves.push(
          `M${r1(nx)} ${r1(ly + 4)} Q${r1(nx + dir * len * 0.4)} ${r1(ly + 4)} ${r1(nx + dir * len * 0.82)} ${r1(ly + 22)} Q${r1(nx + dir * len * 0.35)} ${r1(ly + 10)} ${r1(nx)} ${r1(ly + 8)} Z`,
        );
      }
    }
  }
  return { stalks: stalks.join(' '), nodes: nodes.join(' '), leaves: leaves.join(' ') };
}

/** Suyari-gasumi: the long flat-bottomed haze bands of ukiyo-e prints. */
export function haze(seed: number, width: number, rows: number, rowH: number): string {
  const rnd = seeded(seed);
  const parts: string[] = [];
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * 200;
    const y = r * rowH * 1.9 + rnd() * rowH;
    while (x < width) {
      const w = 160 + rnd() * 320;
      const h = rowH * (0.55 + rnd() * 0.45);
      parts.push(
        `M${r1(x + h / 2)} ${r1(y)} h${r1(w - h)} a${r1(h / 2)} ${r1(h / 2)} 0 0 1 0 ${r1(h)} h${r1(-(w - h))} a${r1(h / 2)} ${r1(h / 2)} 0 0 1 0 ${r1(-h)} Z`,
      );
      x += w + 60 + rnd() * 260;
    }
  }
  return parts.join(' ');
}
