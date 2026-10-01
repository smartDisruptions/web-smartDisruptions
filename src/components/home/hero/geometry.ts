/**
 * Hero geometry shared by the server scene and the client effects, so the
 * shuriken leaves Kiru's actual hand. Units are the roof SVG's viewBox.
 */
export const ROOF_W = 1000;
export const ROOF_H = 236;
export const RIDGE_Y = 74;
/** Kiru's box on the ridge: idle/wave are 240 units square, scaled to KIRU_S. */
export const KIRU_S = 270;
export const KIRU_X = 600;
/** Feet sit at y≈232 of his 240-unit box; put them on top of the ridge. */
export const KIRU_Y = RIDGE_Y - 8 - Math.round((232 / 240) * KIRU_S);
/** The throwing hand in the 'throw' pose, in roof units. */
export const HAND = { x: KIRU_X + 175 * (KIRU_S / 240), y: KIRU_Y + 136 * (KIRU_S / 240) };
