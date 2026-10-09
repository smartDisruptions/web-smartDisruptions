/**
 * Pixel art for the home's Build Games stage, drawn as text: one character
 * per pixel, `.` for none. pixelPaths() turns a drawing into one SVG path per
 * colour (horizontal runs merged), so a sprite is a handful of paths rendered
 * with shape-rendering="crispEdges" on the server. No images, no canvas.
 *
 * Palette by role (Josh's pixel-art rules): one near-black outline, a few
 * shades per material, a moonlit rim on the edges facing the moon, and
 * accents nothing else uses (the torii's vermilion, the lantern's glow).
 */

export const PAL: Record<string, string> = {
  O: '#0b0d22', // outline
  N: '#262f5c', // Kiru: hood, gi
  D: '#1a2046', // Kiru: shade
  L: '#5466c0', // Kiru: moonlit rim
  S: '#f6d0a8', // skin
  W: '#f4f6fb', // eye shine, hand wraps
  R: '#e8432a', // headband, torii
  r: '#a92a17', // headband shade, torii shade
  M: '#d6dcea', // headband plate
  B: '#e8432a', // belt
  // roof tiles: copper gone green, lit by the moon
  t: '#2f8a76',
  T: '#7fd6b8',
  u: '#1d5c4f',
  // lantern: paper lit from inside, gold caps
  y: '#ffb08a',
  g: '#f2c14e',
  h: '#b07a1c',
  // moon
  m: '#fff3d6',
  n: '#e9dbb4',
  // cursor
  w: '#ffffff',
};

const HEAD_A = [
  '.......OOOOOO.....',
  '.....OONNNNNNOO...',
  '....ONNNNNNNNNLO..',
  '....ONNNNNNNNNLLO.',
  '.RR.RRRRRRRRMMRRO.',
  'RRrrrrrrrrrrMMrrO.',
  '..R.ONSSSSSSSSSSO.',
  '....ONSSSOWSSSOWO.',
  '....ONSSSOOSSSOOO.',
  '.....ONNNNNNNNNO..',
  '......OONNNNNOO...',
];
// The tails flicked the other way.
const HEAD_B = [
  '.......OOOOOO.....',
  '.....OONNNNNNOO...',
  '....ONNNNNNNNNLO..',
  '..R.ONNNNNNNNNLLO.',
  '.RR.RRRRRRRRMMRRO.',
  'R.rrrrrrrrrrMMrrO.',
  '....ONSSSSSSSSSSO.',
  '....ONSSSOWSSSOWO.',
  '....ONSSSOOSSSOOO.',
  '.....ONNNNNNNNNO..',
  '......OONNNNNOO...',
];
const BLANK = '..................';

/** Pixel Kiru, 18×16, facing right; his feet are on row 15. */
export const KIRU = {
  run: [
    // contact: near leg reaching, far leg pushing off
    [
      BLANK,
      ...HEAD_A,
      '....OWONNNNNOWO...',
      '....OODDBBBNNO....',
      '...ODDO...ONNNO...',
      '..OOOO.....OOOO...',
    ],
    // passing: up a pixel, near leg under him
    [
      ...HEAD_B,
      '......ONNNNNO.....',
      '.....OWDBBBNOW....',
      '......ODNNNO......',
      '.....ODDOONO......',
      '.....OOO.OOO......',
    ],
    // contact, legs swapped
    [
      BLANK,
      ...HEAD_A,
      '...OWONNNNNOWO....',
      '....ONNNBBBDDO....',
      '...ONNNO..ODDO....',
      '..OOOO.....OOOO...',
    ],
    [
      ...HEAD_B,
      '......ONNNNNO.....',
      '.....OWNBBBDOW....',
      '......ONNNDO......',
      '......ONOODDO.....',
      '......OOO.OOO.....',
    ],
  ],
  // arms out, knees tucked
  jump: [
    ...HEAD_B.map((row, i) => (i === 9 ? '...OWONNNNNNNNOWO.' : row)),
    '.....ONNNNNNO.....',
    '.....ODBBBBNO.....',
    '....ONNNOONNNO....',
    '....OOOO..OOOO....',
    BLANK,
  ],
  // made it: happy eyes, fist up
  win: [
    BLANK,
    ...HEAD_A.map((row, i) =>
      i === 7
        ? '....ONSSSSOSSSOSO.'
        : i === 8
          ? '....ONSSSOSOSOSOOW'
          : i === 9
            ? '.....ONNNNNNNNNONO'
            : i === 10
              ? '......OONNNNNOONO.'
              : row
    ),
    '.....OWONNNNNNO...',
    '......ODBBBNO.....',
    '......ONNOONNO....',
    '.....OOOO.OOOO....',
  ],
};

/** A roof tile, 8×8: copper green, its top edge catching the moon. */
export const TILE = [
  'OOOOOOOO',
  'OTTTTTTO',
  'OttttttO',
  'OtuttutO',
  'OttttttO',
  'OutttutO',
  'OttttttO',
  'OOOOOOOO',
];

/** The goal: a torii, 14×14. */
export const TORII = [
  'OOOOOOOOOOOOOO',
  'ORRRRRRRRRRRRO',
  '.OOOOOOOOOOOO.',
  '..ORO....ORO..',
  '.OOROOOOOOROO.',
  '.ORRRRRRRRRRO.',
  '.OOROOOOOOROO.',
  '..ORO....ORO..',
  '..ORO....ORO..',
  '..OrO....OrO..',
  '..OrO....OrO..',
  '..OrO....OrO..',
  '.OOOOO..OOOOO.',
  '.OOOOO..OOOOO.',
];

/** A paper lantern over the gap, 7×10: what Kiru collects on the Build
    Games page, so the preview collects one too. */
export const LANTERN = [
  '...O...',
  '..OhO..',
  '.OhghO.',
  'ORRRRrO',
  'ORyRRrO',
  'OyRRRrO',
  'ORyRRrO',
  'ORRRRrO',
  '.OhghO.',
  '...g...',
];

/** The editor's cursor, 7×10. */
export const CURSOR = [
  'O......',
  'OO.....',
  'OwO....',
  'OwwO...',
  'OwwwO..',
  'OwwwwO.',
  'OwwwwwO',
  'OwwOOOO',
  'OwO....',
  'OO.....',
];

/** The moon, 17×17: a disc with a few shaded pixels. */
export const MOON = [
  '......mmmmm......',
  '....mmmmmmmmm....',
  '...mmmmmmmmmmm...',
  '..mmmmmmmnnmmmm..',
  '.mmmmmmmmnnmmmmm.',
  '.mmmnnmmmmmmmmmm.',
  'mmmmnnmmmmmmmmmmm',
  'mmmmmmmmmmmmmnmmm',
  'mmmmmmmmmmmmnnmmm',
  'mmmmmmmmmmmmmmmmm',
  'mmmmmmnmmmmmmmmmm',
  '.mmmmnnmmmmmmmmm.',
  '.mmmmmmmmmmmmmmm.',
  '..mmmmmmmmmnmmm..',
  '...mmmmmmmmmmm...',
  '....mmmmmmmmm....',
  '......mmmmm......',
];

/**
 * One path per colour for a drawing placed at (ox, oy), merged into `into`
 * when given, so a whole scene can share one path per colour.
 */
export function pixelPaths(
  rows: string[],
  ox = 0,
  oy = 0,
  into: Map<string, string> = new Map()
) {
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.' || !PAL[ch]) {
        x++;
        continue;
      }
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const fill = PAL[ch];
      into.set(
        fill,
        (into.get(fill) ?? '') + `M${ox + x} ${oy + y}h${end - x}v1h${x - end}z`
      );
      x = end;
    }
  });
  return into;
}

/** The roof tile as a CSS url(): one drawing every tile on a page can share. */
export const TILE_URI = (() => {
  const paths = [...pixelPaths(TILE)]
    .map(([fill, d]) => `<path d='${d}' fill='${fill}'/>`)
    .join('');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' shape-rendering='crispEdges'>${paths}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();
