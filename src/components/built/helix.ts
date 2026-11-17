/**
 * The wall's winding: how many turns a ring of n plaques is wound into.
 *
 * One ring was drawn for about twenty plaques. At thirty-four it had grown
 * flat and wide (a radius of 1.4 m on a desktop, the far side a row of
 * specks), and reaching the last plaque took thirty-three presses (Josh,
 * 2026-11-17: "getting big"). So past seventeen the ring is wound into a
 * spiral instead: about a dozen plaques to a turn, each turn one row lower
 * than the last. However many things there are, the tower is the same width
 * and only gets taller, and the rows below the front one are the plaques a
 * turn ahead, in plain sight.
 *
 * The server (ArmoryWall), the chips (ArmoryWallIsland) and the drive
 * (armory-drive) all place plaques by these numbers, and wall.css by the
 * same ones as custom properties (--n, --t), so they cannot disagree.
 */

/** About this many plaques make one turn. */
const PER_TURN = 11.5;

/**
 * How many turns n plaques make: one (a plain ring) up to seventeen, then
 * as many as keep each turn near a dozen (18–28 two, 29–40 three, …).
 */
export const turnsFor = (n: number) => Math.max(1, Math.round(n / PER_TURN));

/**
 * How far back up the spiral, in turns, a plaque is still hung before it is
 * moved to the far end. The spiral has no end, so some plaque is always
 * about to go from the top of the tower to the bottom; it does so at the
 * tower's side, at the angle where it is edge-on to the eye and so has no
 * width on screen, and is never seen to move. That angle depends on the
 * screen (the drive works it out exactly, as it does for the backs); this
 * is where it falls on a desktop, and what the server places plaques by
 * until the drive wakes.
 */
export const BEHIND = 0.79;

/**
 * Which copy of the spiral plaque i hangs on while the front of the tower
 * is at position c (in plaques, any real number): the lap L for which
 * i + L·n lies between `back` plaques behind c and n plaques on from there.
 */
export const lapOf = (i: number, c: number, n: number, back: number) =>
  Math.ceil((c - back - i) / n);
