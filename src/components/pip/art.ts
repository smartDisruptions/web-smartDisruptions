/**
 * Pip's drawing: nine poses that share one head and one face, as SVG markup
 * strings. Pip.tsx wraps them in an <svg>; pip.css styles and animates them.
 *
 * This is plain TypeScript with no JSX, so a Node script can import it to
 * render a model sheet without Next. It returns strings rather than elements
 * because the art is static decoration: one string per <svg> in the payload,
 * not a hundred React elements to build and hydrate on a phone. That is the
 * same trade Kiru makes through svgString.
 *
 * THE BOX (see Pip.tsx): viewBox 0 0 200 200. A standing Pip has his feet on
 * y = 188 (the outer edge of their outline), centred on x = 100. `sit` puts
 * his seat on y = 150. In `peek`, nothing is drawn below y = 170.
 *
 * Every part that moves sits in a group whose local origin is its pivot,
 * so pip.css can turn ears, tail, scarf and arms with `transform-origin: 0 0`
 * whatever the pose. Markup uses single quotes so the RSC payload (JSON)
 * carries it without escaping.
 */
import type { PipMood, PipPose } from './Pip';

// ── Palette: the games' colours, plus the shades between them ──────────────
const FUR = '#A89582';
const BELLY = '#E6D5C0';
const PINK = '#E8A6A6';
const PINK_D = '#C98282';
const GOLD = '#E8B24A';
const TAIL = '#C79A8A';
const EYE = '#1A120B';
const MOUTH = '#4A1F18';
const TONGUE = '#E8857F';
const EMBER = '#D4622F';
const CREAM = '#F0E2C0';

// Shading comes from gradients in <PipDefs />. Each fill names a flat colour
// after the url(): without PipDefs on the page he still draws, just flatter.
const G_FUR = `url(#pip-fur) ${FUR}`;
const G_BELLY = `url(#pip-belly) ${BELLY}`;
const G_EAR = `url(#pip-ear) ${PINK}`;
const G_GOLD = `url(#pip-gold) ${GOLD}`;

// ── Little writers ──────────────────────────────────────────────────────────
type P = [number, number];
const f = (v: number) => String(Math.round(v * 10) / 10);

/** A shape with the sticker outline (class `po`, paint-order: stroke). */
const sh = (d: string, fill: string, cls = 'po') =>
  `<path d='${d}' fill='${fill}'${cls ? ` class='${cls}'` : ''}/>`;
const ell = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  cls = 'po'
) =>
  `<ellipse cx='${f(cx)}' cy='${f(cy)}' rx='${f(rx)}' ry='${f(ry)}' fill='${fill}'${cls ? ` class='${cls}'` : ''}/>`;
const g = (t: string, inner: string, cls?: string) =>
  `<g${t ? ` transform='${t}'` : ''}${cls ? ` class='${cls}'` : ''}>${inner}</g>`;
/** A part that moves: placed by its parent, animated about its own 0,0. */
const pivot = (x: number, y: number, a: number, cls: string, inner: string) =>
  g(
    `translate(${f(x)} ${f(y)})${a ? ` rotate(${f(a)})` : ''}`,
    g('', inner, cls)
  );

/**
 * A tapered shape along a smooth centreline (Catmull-Rom through `pts`),
 * `w0` wide at the base and `w1` at the round tip. The tail, mostly.
 */
function taper(pts: P[], w0: number, w1: number): string {
  const n = pts.length;
  const L: P[] = [];
  const R: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(n - 1, i + 1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const tx = (b[0] - a[0]) / len;
    const ty = (b[1] - a[1]) / len;
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    L.push([pts[i][0] - ty * w, pts[i][1] + tx * w]);
    R.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  const run = (q: P[]) => {
    let s = '';
    for (let i = 0; i < q.length - 1; i++) {
      const p0 = q[Math.max(0, i - 1)];
      const p1 = q[i];
      const p2 = q[i + 1];
      const p3 = q[Math.min(q.length - 1, i + 2)];
      s += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return s;
  };
  const r = f(w1 / 2);
  return `M${f(L[0][0])} ${f(L[0][1])}${run(L)}A${r} ${r} 0 0 0 ${f(R[n - 1][0])} ${f(R[n - 1][1])}${run([...R].reverse())}Z`;
}

/** An arm: an outlined capsule stroke. `lit` picks the near-side fur. */
const limb = (d: string, lit = true) =>
  `<path d='${d}' class='pl'/><path d='${d}' class='${lit ? 'pf' : 'pfd'}'/>`;
/** A leg: the same, chubbier. */
const leg = (d: string, lit = true) =>
  `<path d='${d}' class='pl pll'/><path d='${d}' class='${lit ? 'pf' : 'pfd'} plf'/>`;

// ── Paws (local coordinates; the caller places and turns them) ───────────────
/** A resting paw: a pink mitten with two finger creases toward local -y. */
const paw = (r = 6.5) =>
  ell(0, 0, r, r * 0.9, PINK, 'po pt') +
  `<path d='M${f(-r * 0.3)} ${f(-r * 0.86)}v${f(r * 0.5)}M${f(r * 0.3)} ${f(-r * 0.86)}v${f(r * 0.5)}' class='pkn'/>`;
/** An open paw, fingers up (local +y runs back down the arm). */
const openPaw = () =>
  sh(
    'M-7 4C-9 -2 -8 -8 -5 -10C-5 -14 -1 -15 0 -12C1 -16 5 -16 5.5 -12C7.5 -14 10 -12 9 -8C11 -7 10 -2 8 1C6 6 -4 8 -7 4Z',
    PINK,
    'po pt'
  ) + `<path d='M-1.5 -9.5v4M3.5 -9v4' class='pkn'/>`;
/** A pointing paw: a fist with one finger out along +x. */
const pointPaw = () =>
  sh(
    'M-6 -1C-7 -6 -2 -8 2 -7L14 -7C17 -7 17 -2.5 14 -2.5L6 -2.5C8 1 6 6 1 6C-3 6 -6 3 -6 -1Z',
    PINK,
    'po pt'
  );
/** A paw gripping a rim: a flat-bottomed dome, its fingers lined up on y = 0. */
const gripPaw = () =>
  sh(
    'M-11.5 0C-12.5 -7 -7 -11.5 0 -11.5C7 -11.5 12.5 -7 11.5 0Z',
    PINK,
    'po pt'
  ) + `<path d='M-5 0v-4.5M0 0v-5.5M5 0v-4.5' class='pkn'/>`;

// ── The head ────────────────────────────────────────────────────────────────
// Local coordinates: the skull is centred on 0,0, radius ~37, and the snout
// points to the reader's left, as he faces in the games. Three-quarter view:
// the near eye sits right of the bridge, the far eye small beside the snout.
// A positive tilt lifts the snout; a negative one drops it.
const SKULL =
  'M1 -36C22 -36 38 -21 38 0C38 19 23 34 3 34C-13 34 -24 30 -34 24C-41 20 -48 17 -53 12C-58 7 -57 -1 -50 -4C-44 -7 -39 -11 -35 -17C-28 -29 -15 -36 1 -36Z';
const EYES = { near: [6, -5], far: [-24, -6] } as const;
const WHISKERS = 'M0 -1Q-11 -8 -24 -9M1 2Q-11 1 -25 3M0 5Q-9 9 -21 13';

type Ears = 'up' | 'perk' | 'droop';
type Mouth = 'smile' | 'grin' | 'open' | 'o' | 'eek' | 'none';

function ear(far: boolean, ears: Ears): string {
  // Each ear hangs from its base, so `droop` and the twitch turn it there.
  const [bx, by] = far ? [-17, -26] : [14, -27];
  const tilt =
    ears === 'droop' ? (far ? -38 : 42) : ears === 'perk' ? (far ? 6 : -6) : 0;
  const lift = ears === 'perk' ? -2 : 0;
  const disc = far
    ? ell(-7, -15 + lift, 20, 21.5, G_FUR) +
      ell(-5.5, -13.5 + lift, 12.5, 14, G_EAR, '')
    : ell(13, -14 + lift, 25, 25, G_FUR) +
      ell(10, -12 + lift, 16, 16.5, G_EAR, '');
  return pivot(bx, by, tilt, far ? 'pq' : 'pr', disc);
}

function eyesFor(mood: PipMood): string {
  const [nx, ny] = EYES.near;
  const [fx, fy] = EYES.far;
  const open = (x: number, y: number, rx: number, ry: number, c: number) =>
    ell(x, y, rx, ry, EYE, '') +
    `<circle cx='${f(x - rx * 0.4)}' cy='${f(y - ry * 0.42)}' r='${f(c)}' fill='#fff'/>` +
    `<circle cx='${f(x + rx * 0.38)}' cy='${f(y + ry * 0.5)}' r='${f(c * 0.42)}' fill='#fff' opacity='.8'/>`;
  const arc = (x: number, y: number, w: number, up: boolean) =>
    `<path d='M${f(x - w)} ${f(y + (up ? 2 : -1))}Q${f(x)} ${f(y + (up ? -9 : 6))} ${f(x + w)} ${f(y + (up ? 2 : -1))}' class='pa'/>`;
  if (mood === 'happy') return arc(nx, ny, 7.5, true) + arc(fx, fy, 5.5, true);
  if (mood === 'closed')
    return arc(nx, ny + 1, 7.5, false) + arc(fx, fy + 1, 5.5, false);
  if (mood === 'wink')
    return (
      `<g class='pg'>${open(fx, fy, 5.5, 8, 2.2)}</g>` + arc(nx, ny, 7.5, true)
    );
  const big = mood === 'surprised';
  const eyes = `<g class='pg'>${open(nx, ny - (big ? 1.5 : 0), big ? 8.6 : 7, big ? 11.5 : 9, big ? 3.4 : 2.8)}${open(fx, fy - (big ? 1.5 : 0), big ? 6.6 : 5.5, big ? 10.5 : 8, big ? 2.7 : 2.2)}</g>`;
  // raised brows: the one expression a mouse's eyes can't carry alone
  return big
    ? eyes +
        `<path d='M${nx - 7} ${ny - 18}Q${nx} ${ny - 24} ${nx + 7} ${ny - 19}M${fx - 5} ${fy - 17}Q${fx} ${fy - 22} ${fx + 4} ${fy - 18}' class='pbr'/>`
    : eyes;
}

function mouthFor(m: Mouth): string {
  switch (m) {
    case 'smile':
      return `<path d='M-45 19Q-40 24 -33 20' class='pm'/>`;
    case 'grin':
      return `<path d='M-47 17Q-39 27 -29 18' class='pm'/>`;
    case 'open':
      return (
        sh(
          'M-48 14C-42 19 -33 21 -24 19C-25 29 -33 35 -40 32C-46 29 -49 21 -48 14Z',
          MOUTH,
          'po pt'
        ) + sh('M-42 30C-38 26 -31 26 -28 29C-31 33 -38 34 -42 30Z', TONGUE, '')
      );
    case 'o':
      return ell(-39, 21, 3.4, 4.2, MOUTH, 'po pt');
    case 'eek':
      return `<path d='M-46 21q2.5 -2.5 5 0t5 0t5 0' class='pm'/>`;
    default:
      return '';
  }
}

function head(mood: PipMood, ears: Ears, mouth: Mouth, cover = false): string {
  if (mood === 'surprised' && ears === 'up') ears = 'perk';
  return (
    ear(true, ears) +
    ear(false, ears) +
    sh('M-9 -32C-10 -40 -4 -45 3 -44C-1 -42 -2 -38 -1 -34Z', G_FUR) +
    sh(SKULL, G_FUR) +
    // candlelight along the lit brow, and the paler muzzle
    `<path d='M-47 -5C-42 -8 -38 -12 -34 -18C-27 -29 -16 -34 -3 -34' class='prim'/>` +
    `<path d='M-49 -2C-42 -6 -36 -7 -31 -4C-25 0 -25 10 -30 16C-36 21 -47 19 -52 13C-55 8 -54 1 -49 -2Z' fill='${CREAM}' opacity='.32'/>` +
    ell(17, 13, 8.5, 5, PINK, '') +
    (cover ? '' : `<g class='pe'>${eyesFor(mood)}</g>`) +
    mouthFor(mouth) +
    // whiskers root under the nose, so the nose sits on top of them
    pivot(
      -43,
      9,
      0,
      'pw',
      `<path d='${WHISKERS}' class='pwo'/><path d='${WHISKERS}' class='pwi'/>`
    ) +
    ell(-52, 3, 6.5, 5.5, PINK, 'po pt') +
    `<circle cx='-54.5' cy='1' r='1.8' fill='#fff' opacity='.85'/>`
  );
}

const MOUTH_FOR: Record<PipMood, Mouth> = {
  normal: 'smile',
  happy: 'grin',
  surprised: 'o',
  closed: 'smile',
  wink: 'grin',
};

/** The head, placed: `x y` is the skull's centre in the box, `a` its tilt. */
const placeHead = (x: number, y: number, a: number, inner: string) =>
  pivot(x, y, a, 'ph', g('', inner, 'pgh'));

// ── Shared body parts (box coordinates) ─────────────────────────────────────
const SHADOW = (rx = 38) =>
  `<ellipse cx='100' cy='188' rx='${rx}' ry='4.5' class='psh'/>`;

/** The standing body: an egg with a cream belly. */
const BODY =
  sh(
    'M100 106C125 106 137 133 137 155C137 172 121 182 100 182C79 182 63 172 63 155C63 133 75 106 100 106Z',
    G_FUR
  ) +
  `<path d='M70 134C66.5 143 66 154 68.5 164' class='prim'/>` +
  ell(95, 156, 23, 24, G_BELLY, '');
/** Feet whose outline ends exactly on y = 188. */
const FEET =
  ell(82, 180.5, 13, 4.5, PINK) +
  ell(111, 180.5, 14, 4.5, PINK) +
  `<path d='M74 178.5v3.5M78.5 177.5v4M102.5 178.5v3.5M107 177.5v4' class='pkn'/>`;

/** The guild scarf's band and knot. Its free end is `scarfEnd`, drawn by the pose. */
const scarfBand = (dy = 0) =>
  g(
    dy ? `translate(0 ${dy})` : '',
    sh(
      'M66 106C78 119 121 121 134 106C137 110 137 115 133 118C119 131 80 129 66 117C62 113 62 109 66 106Z',
      G_GOLD
    ) +
      `<path d='M69 113C83 123 117 124 131 113' class='pfold'/>` +
      ell(128, 115, 6.5, 5.5, G_GOLD)
  );
/** The scarf's free end, hanging from under the knot; it flutters about 0,0. */
const scarfEnd = (dy = 0, a = -10) =>
  pivot(
    129,
    118 + dy,
    a,
    'ps',
    sh('M-4 -3C-5.5 6 -3 14 -5.5 23L-0.5 20L4.5 24C4 15 6.5 6 4 -3Z', G_GOLD) +
      `<path d='M0 1C-0.5 8 0.5 13 0 18' class='pfold'/>` +
      `<path d='M-4.5 24.5l-1 3.5M-0.5 22l0 3.5M3.5 25.5l1 3.5' class='ptas'/>`
  );

/** Tails, from the base at 0,0: tapered, ending in a curl. */
const TAIL_STAND = taper(
  [
    [0, 0],
    [20, 6],
    [40, -2],
    [48, -22],
    [42, -40],
    [47, -54],
    [55, -57],
  ],
  8,
  3
);
const TAIL_SIT = taper(
  [
    [0, 0],
    [14, 6],
    [27, 8],
    [33, 17],
    [33, 32],
    [29, 43],
    [33, 51],
    [40, 49],
  ],
  8,
  3
);
const tail = (x: number, y: number, a: number, d = TAIL_STAND) =>
  pivot(x, y, a, 'pt-l', sh(d, TAIL));

// ── Props ───────────────────────────────────────────────────────────────────
/** The guild pennant: ember, gold-trimmed, a gold star; flies from 0,0. */
const PENNANT =
  sh('M0 0C12 2 26 5 39 11C26 15 13 20 0 23Z', EMBER) +
  `<path d='M2 3C13 5 24 8 34 11.5' class='ptrim'/>` +
  sh(
    'M12 6.5l2 4 4.4.6-3.2 3.1.8 4.4-4-2.1-4 2.1.8-4.4-3.2-3.1 4.4-.6z',
    GOLD,
    'po pt'
  );

/** A carnival ticket, centred on 0,0: notched ends, ADMIT ONE, a perforated stub. */
const ticket = (flip: boolean) =>
  sh('M-32 -14H32V-5A5 5 0 0 0 32 5V14H-32V5A5 5 0 0 0 -32 -5Z', EMBER) +
  `<path d='M-27 -9.5H27M-27 9.5H27' class='ptkl'/>` +
  `<path d='M17 -12V12' class='pperf'/>` +
  // Mirrored with him, the words would read backwards: undo the flip here.
  `<text x='-6' y='3.2' textLength='38' lengthAdjust='spacingAndGlyphs' class='ptx'${flip ? ` transform='scale(-1 1)' style='transform-box:fill-box;transform-origin:center'` : ''}>ADMIT ONE</text>` +
  sh(
    'M24.5 -3.2l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.2-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z',
    CREAM,
    ''
  );

// ── Poses ───────────────────────────────────────────────────────────────────
interface PoseDef {
  /** The expression when the caller doesn't pick one. */
  mood: PipMood;
  /** How far down the box his eyes sit, for SiteFX's gaze. */
  eye: number;
  draw: (mood: PipMood, flip: boolean) => string;
}

// Folded paws, the games' resting pose: a little mouse holding his paws up.
const ARM_FAR =
  limb('M81 127Q76 140 88 145', false) +
  g('translate(89 146) rotate(-30)', paw(6.5));
const ARM_NEAR =
  limb('M119 127Q122 141 108 146') + g('translate(107 147) rotate(25)', paw(7));

export const POSES: Record<PipPose, PoseDef> = {
  idle: {
    mood: 'normal',
    eye: 0.37,
    draw: (m) =>
      SHADOW() +
      g(
        '',
        tail(124, 172, 0) +
          BODY +
          FEET +
          ARM_FAR +
          ARM_NEAR +
          scarfBand() +
          scarfEnd() +
          placeHead(97, 80, 0, head(m, 'up', MOUTH_FOR[m])),
        'pb'
      ),
  },

  wave: {
    mood: 'happy',
    eye: 0.37,
    draw: (m) =>
      SHADOW() +
      g(
        '',
        tail(124, 172, 0) +
          BODY +
          FEET +
          ARM_FAR +
          pivot(
            121,
            125,
            0,
            'pwv',
            limb('M0 0Q20 -2 23 -27') +
              g('translate(23 -30) rotate(12)', openPaw())
          ) +
          scarfBand() +
          scarfEnd() +
          placeHead(96, 80, -4, head(m, 'up', MOUTH_FOR[m])),
        'pb'
      ),
  },

  cheer: {
    mood: 'happy',
    eye: 0.32,
    draw: (m) =>
      `<g class='pk'>${SHADOW(28)}</g>` +
      g(
        '',
        g(
          'translate(0 -5)',
          tail(124, 172, 4) +
            // the far arm flung up behind his head
            limb('M82 124Q56 100 42 60', false) +
            g('translate(40 54) rotate(-26)', openPaw()) +
            BODY +
            g('translate(82 180) rotate(-26)', ell(0, 0, 12, 4.5, PINK)) +
            g('translate(115 180) rotate(24)', ell(0, 0, 12, 4.5, PINK)) +
            scarfBand() +
            scarfEnd(0, 24) +
            placeHead(98, 84, 8, head(m, 'up', 'open')) +
            // the pennant pole in the near paw, the flag flying off its top
            `<path d='M141 118L152 24' class='pole-o'/><path d='M141 118L152 24' class='pole'/>` +
            pivot(152, 26, 0, 'pn', PENNANT) +
            limb('M119 124Q138 114 145 96') +
            g('translate(146 93) rotate(-10)', paw(7.5))
        ),
        'pj'
      ),
  },

  peek: {
    mood: 'normal',
    eye: 0.64,
    draw: (m) =>
      placeHead(
        100,
        133,
        0,
        head(m, 'perk', m === 'surprised' ? 'o' : 'none')
      ) +
      g('translate(70 167.9)', gripPaw()) +
      g('translate(130 167.9)', gripPaw()),
  },

  point: {
    mood: 'happy',
    eye: 0.37,
    draw: (m) =>
      SHADOW() +
      g(
        '',
        tail(124, 172, 0) +
          BODY +
          FEET +
          scarfBand() +
          scarfEnd() +
          limb('M120 125Q142 134 128 151') +
          g('translate(127 152) rotate(-20)', paw(7)) +
          placeHead(96, 80, -3, head(m, 'up', MOUTH_FOR[m])) +
          limb('M80 124Q60 118 42 117', false) +
          g('translate(36 118) rotate(180) scale(1 -1)', pointPaw()),
        'pb'
      ),
  },

  ticket: {
    mood: 'happy',
    eye: 0.37,
    draw: (m, flip) =>
      SHADOW() +
      g(
        '',
        tail(124, 172, 0) +
          BODY +
          FEET +
          ARM_NEAR +
          scarfBand() +
          scarfEnd() +
          placeHead(96, 80, -4, head(m, 'up', MOUTH_FOR[m])) +
          limb('M81 126Q76 128 71 125', false) +
          g('translate(44 128) rotate(-10)', ticket(flip)) +
          g('translate(70 124) rotate(-60)', paw(7)),
        'pb'
      ),
  },

  sit: {
    mood: 'happy',
    eye: 0.34,
    draw: (m) =>
      g(
        '',
        tail(126, 139, 0, TAIL_SIT) +
          sh(
            'M100 102C123 102 135 124 135 139C135 146 128 147 100 147C72 147 65 146 65 139C65 124 77 102 100 102Z',
            G_FUR
          ) +
          ell(95, 131, 21, 15, G_BELLY, '') +
          // shins hanging over the ledge, swinging from the knee
          pivot(
            84,
            147,
            0,
            'pd',
            leg('M0 0L-1 14', false) +
              g('translate(-4 18) rotate(-16)', ell(0, 0, 11.5, 5, PINK))
          ) +
          pivot(
            114,
            147,
            0,
            'pd2',
            leg('M0 0L1 15') +
              g('translate(2 19) rotate(14)', ell(0, 0, 12.5, 5, PINK))
          ) +
          // round knees resting on the ledge, toward the reader
          ell(84, 141.5, 11, 5.5, G_FUR) +
          ell(114, 141.5, 12, 5.5, G_FUR) +
          limb('M80 118Q66 131 70 140', false) +
          g('translate(70 141.5) rotate(80)', paw(6.5)) +
          scarfBand(-4) +
          scarfEnd(-4) +
          limb('M121 118Q134 129 131 140') +
          g('translate(131 141.5) rotate(-80)', paw(7)) +
          placeHead(98, 79, -3, head(m, 'up', MOUTH_FOR[m])),
        'pb'
      ),
  },

  hide: {
    mood: 'closed',
    eye: 0.45,
    draw: (m) =>
      SHADOW() +
      g(
        '',
        tail(124, 172, -8) +
          sh(
            'M100 114C125 114 137 137 137 157C137 173 121 182 100 182C79 182 63 173 63 157C63 137 75 114 100 114Z',
            G_FUR
          ) +
          ell(95, 159, 23, 21, G_BELLY, '') +
          FEET +
          scarfBand(6) +
          scarfEnd(6, 4) +
          placeHead(96, 92, -10, head(m, 'droop', 'eek', m === 'closed')) +
          limb('M80 130Q68 116 72 101', false) +
          g('translate(72 95) rotate(6)', openPaw()) +
          // shut eyes stay covered; any other mood peeks out under the near paw
          (m === 'closed'
            ? limb('M120 130Q122 112 104 100') +
              g('translate(102 93) rotate(-16)', openPaw())
            : limb('M120 130Q129 106 113 85') +
              g('translate(112 76) rotate(-34)', openPaw())) +
          `<path d='M50 70q-6 6 0 12M43 64q-9 10 0 22M150 72q6 6 0 12M157 66q9 10 0 22' class='pfx'/>`,
        'pb'
      ),
  },

  bow: {
    mood: 'closed',
    eye: 0.43,
    draw: (m) =>
      SHADOW() +
      g(
        '',
        tail(126, 172, -16) +
          g(
            'rotate(-15 100 176)',
            BODY +
              limb('M122 128Q142 134 150 150') +
              g('translate(151 152) rotate(-30)', paw(7)) +
              scarfBand() +
              scarfEnd(0, 15)
          ) +
          placeHead(72, 84, -27, head(m, 'up', 'smile')) +
          limb('M76 132Q74 150 92 150', false) +
          g('translate(94 149) rotate(-70)', paw(7)),
        'pb'
      ) +
      FEET,
  },
};

/** The inner markup of one Pip. Cached: the same pose and mood draw the same. */
const cache = new Map<string, string>();
export function pipMarkup(
  pose: PipPose,
  mood: PipMood | undefined,
  flip = false
): string {
  const p = POSES[pose] ?? POSES.idle;
  const m = mood ?? p.mood;
  const key = `${pose}|${m}|${flip ? 1 : 0}`;
  let s = cache.get(key);
  if (s === undefined) {
    s = p.draw(m, flip);
    cache.set(key, s);
  }
  return s;
}

/** Gradients for <PipDefs />. Ids are prefixed `pip-` to stay out of the way. */
export const PIP_DEFS =
  `<radialGradient id='pip-fur' cx='.36' cy='.3' r='.8'><stop offset='0' stop-color='#BEAD9A'/><stop offset='.55' stop-color='${FUR}'/><stop offset='1' stop-color='#8C7967'/></radialGradient>` +
  `<radialGradient id='pip-belly' cx='.4' cy='.32' r='.75'><stop offset='0' stop-color='#F3E7D6'/><stop offset='.6' stop-color='${BELLY}'/><stop offset='1' stop-color='#D6C2AA'/></radialGradient>` +
  `<radialGradient id='pip-ear' cx='.42' cy='.42' r='.62'><stop offset='0' stop-color='#F2BDBA'/><stop offset='.7' stop-color='${PINK}'/><stop offset='1' stop-color='${PINK_D}'/></radialGradient>` +
  `<linearGradient id='pip-gold' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#F4CB6E'/><stop offset='.55' stop-color='${GOLD}'/><stop offset='1' stop-color='#C38F2E'/></linearGradient>`;
