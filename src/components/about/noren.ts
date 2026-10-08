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

/** Percent of the doorway, for placing parts in the server markup. */
export const pctX = (n: number) => `${((n / DOOR.w) * 100).toFixed(3)}%`;
export const pctY = (n: number) => `${((n / DOOR.h) * 100).toFixed(3)}%`;
