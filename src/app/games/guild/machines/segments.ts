/**
 * Kid Volt's readout: a 14-segment LED display (letters need the diagonals),
 * leaning like a real one. Shared by the server art and the client readout
 * that lights your fastest knockout, so the two draw the same display.
 */

// A cell is 24 × 36: corners, mid-edges and the centre.
const CELL: Record<string, [number, number, number, number]> = {
  a: [0, 0, 24, 0],
  b: [24, 0, 24, 18],
  c: [24, 18, 24, 36],
  d: [0, 36, 24, 36],
  e: [0, 18, 0, 36],
  f: [0, 0, 0, 18],
  g1: [0, 18, 12, 18],
  g2: [12, 18, 24, 18],
  h: [0, 0, 12, 18],
  i: [12, 0, 12, 18],
  j: [24, 0, 12, 18],
  k: [0, 36, 12, 18],
  l: [12, 36, 12, 18],
  m: [24, 36, 12, 18],
};
const SEGMENTS = Object.keys(CELL);

const GLYPHS: Record<string, string[]> = {
  K: ['f', 'e', 'g1', 'j', 'm'],
  O: ['a', 'b', 'c', 'd', 'e', 'f'],
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g1', 'g2', 'e', 'd'],
  '3': ['a', 'b', 'g1', 'g2', 'c', 'd'],
  '4': ['f', 'g1', 'g2', 'b', 'c'],
  '5': ['a', 'f', 'g1', 'g2', 'c', 'd'],
  '6': ['a', 'f', 'e', 'd', 'c', 'g1', 'g2'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g1', 'g2'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g1', 'g2'],
};

const r1 = (n: number) => Math.round(n * 10) / 10;
const lean = (y: number) => (18 - y) * 0.14;

function segment(ox: number, oy: number, key: string) {
  const [x1, y1, x2, y2] = CELL[key];
  const g = 3.1 / Math.hypot(x2 - x1, y2 - y1);
  const ax = x1 + (x2 - x1) * g;
  const ay = y1 + (y2 - y1) * g;
  const bx = x2 - (x2 - x1) * g;
  const by = y2 - (y2 - y1) * g;
  return `M${r1(ox + ax + lean(ay))} ${r1(oy + ay)}L${r1(ox + bx + lean(by))} ${r1(oy + by)}`;
}

/**
 * Lay a short string ("KO", or a clock like "1:37") out centred on cx, top
 * on y. Returns every segment of every cell (the dark ones show, as on a
 * real display), the lit ones, and the colon's dots.
 */
export function readout(text: string, cx: number, y: number) {
  const chars = [...text];
  const width = chars.reduce((w, ch, i) => w + (ch === ':' ? 12 : 24) + (i < chars.length - 1 ? 8 : 0), 0);
  let x = cx - width / 2;
  const unlit: string[] = [];
  const lit: string[] = [];
  const dots: Array<[number, number]> = [];
  for (const ch of chars) {
    if (ch === ':') {
      dots.push([r1(x + 6 + lean(11)), y + 11], [r1(x + 6 + lean(25)), y + 25]);
      x += 12 + 8;
      continue;
    }
    for (const s of SEGMENTS) unlit.push(segment(x, y, s));
    for (const s of GLYPHS[ch] ?? []) lit.push(segment(x, y, s));
    x += 24 + 8;
  }
  return { unlit, lit, dots };
}
