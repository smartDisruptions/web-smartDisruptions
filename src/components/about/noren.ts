/**
 * The noren's geometry, in one place: the server draws the doorway from it
 * and NorenFX moves the cloth with it, so the two can never disagree.
 *
 * Everything is in doorway units. The doorway is DOOR.w × DOOR.h units and
 * scales with its box (aspect-ratio), so a unit is a fixed fraction of the
 * box at every width; the markup places each part in % of the doorway.
 *
 * Kiru stands inside, behind the cloth, on the floor. The noren hangs down to
 * his hands: he holds the two middle panels apart by their hem corners and
 * looks out through the gap, and under the hem you see the rest of him.
 *
 * Each panel hangs in two pieces, cut at `seam`: the upper piece skews about
 * the rod, and the lower piece hangs from the upper one's foot and bends on
 * its own. Two skews per panel read as cloth (it lags and folds where it
 * bends) and cost two transforms.
 */

export const DOOR = { w: 452, h: 486 } as const;

/** The opening and the beams around it. */
export const FRAME = {
  lintel: 30, // top beam height
  post: 26, // side post width
  sill: 452, // y of the floor line (the sill sits on it)
} as const;

/**
 * Kiru, drawn in his own 240-unit space (the idle pose's: face centred on
 * x = 100, feet ending at y = 232). The peek pose shares it and adds his
 * hands, at (62, 166) and (138, 166).
 */
export const KIRU_K = 158 / 240;
const FEET_AT = FRAME.sill - 2;
const kiruTop = FEET_AT - 232 * KIRU_K;
/** Kiru's y (his units) in doorway units. */
const ky = (y: number) => kiruTop + y * KIRU_K;

const ROD_Y = 36;
const HEM = ky(166); // the hem is at his hands

/** The cloth: four panels on a rod, in doorway units. */
export const NOREN = {
  x: 26,
  y: ROD_Y, // top of the cloth (the sleeve wraps the rod here)
  w: 400,
  h: HEM - ROD_Y, // rod to hem
  panels: 4,
  gap: 4,
  pw: 97, // (w - 3 gaps) / 4
  sleeve: 24,
  /** Where each panel is cut into its two pieces, from the cloth's top. */
  seam: Math.round((HEM - ROD_Y) * 0.62),
} as const;

/** Left edge of panel i, in the cloth's own units. */
export const panelLeft = (i: number) => i * (NOREN.pw + NOREN.gap);

/** Kiru's boxes: the peek pose (head and hands) and his body under it. */
export const KIRU = {
  x: NOREN.x + NOREN.w / 2 - 100 * KIRU_K,
  y: kiruTop,
  w: 240 * KIRU_K,
  peekH: 178 * KIRU_K,
  bodyH: 240 * KIRU_K,
} as const;

/**
 * The resting cloth, in degrees of skew. Upper `s` swings a panel about the
 * rod (positive moves its foot right); lower `b` bends the piece under the
 * seam relative to the upper one.
 *
 * Peeking, Kiru holds the middle two panels by their hem corners, which sit
 * in his fists (38 of his units either side of his face), so each hangs as a
 * straight line from the rod to his hand: the gap is a narrow V that opens
 * onto his face just above the hem.
 */
const reach = 38 * KIRU_K; // centre of the face to the centre of a fist
const peekS = (Math.atan((reach - NOREN.gap / 2) / NOREN.h) * 180) / Math.PI;

export const REST = {
  /** [upper, lower] for each panel while Kiru peeks. */
  peek: [
    [0, 0],
    [-peekS, 0],
    [peekS, 0],
    [0, 0],
  ],
  /** All four hanging straight: Kiru has let go and stepped back. */
  duck: [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
} as const;

/**
 * The scene around the live doorway (the mini leaves all of it out), in the
 * same doorway units. Parts of it reach past the doorway's box: the tiled
 * eave rises above the lintel, and the light on the ground and the stepping
 * stone fall below the sill, so whoever places the doorway leaves `above`
 * and `below` units of room around it (threshold.css does, in % of width).
 */
export const SCENE = {
  /** The eave over the door: a row of round tile ends under a tiled slope. */
  eave: { x: -24, y: -44, w: DOOR.w + 48, h: 56 },
  /** The light from inside, on the ground in front of the sill. */
  spill: { x: -70, y: FRAME.sill - 10, w: DOOR.w + 140, h: 92 },
  /** A flat stone at the foot of the door, catching that light. */
  stone: { x: 164, y: 468, w: 124, h: 32 },
  /** The room's extra light, behind the cloth (only its gaps show it). */
  flare: { x: FRAME.post, y: 150, w: NOREN.w, h: FRAME.sill - 150 },
  /** The light at the hem: what spills under the cloth and out of the slit. */
  glow: { x: 60, y: 300, w: DOOR.w - 120, h: 200 },
  /** The dust drifting up through that light. */
  motes: { x: 96, y: 236, w: DOOR.w - 192, h: 240 },
  above: 44,
  below: 22,
} as const;

/**
 * The dust, in the motes box's own percent: where each mote starts, how long
 * one drift takes (s), where in it the page opens (a negative delay, so they
 * are already scattered on arrival), and how far it sways and rises (px).
 */
export const MOTES: readonly (readonly [
  number,
  number,
  number,
  number,
  number,
  number,
])[] = [
  // Either side of Kiru, and one up in the slit above his head: never over
  // his face.
  [10, 72, 11, -2, 14, -70],
  [20, 38, 14, -7, -12, -88],
  [28, 92, 9.5, -4, 9, -58],
  [50, 6, 15, -3, 8, -40],
  [76, 66, 13, -1, -16, -80],
  [88, 34, 10.5, -6, 12, -54],
  [93, 86, 12, -9, -9, -62],
];

/** Percent of the doorway, for placing parts in the server markup. */
export const pctX = (n: number) => `${((n / DOOR.w) * 100).toFixed(3)}%`;
export const pctY = (n: number) => `${((n / DOOR.h) * 100).toFixed(3)}%`;
