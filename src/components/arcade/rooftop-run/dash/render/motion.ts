/**
 * Where moving things are, as functions of the song's beat, so what is drawn
 * is exactly what the simulation collides with: the motion and lantern maths
 * come straight from ../physics.ts, the same functions the sim uses.
 */
import { lanternAngle, motionWave } from '../physics';
import type { VentObj } from '../types';
import { mod } from './util';

/** A Motion's swing at `beats`: -1..1 (physics.motionWave). */
export const motionW = motionWave;

/** A lantern's rope angle from straight down (radians, + swings right). */
export { lanternAngle };

/**
 * How far into its cycle a vent is at `beats` (0 .. on + off). The jet is on
 * for the first `on` beats: the same test as physics.ventActive, kept as a
 * number so the drawing can ease the jet in and out.
 */
export function ventCycle(o: VentObj, beats: number): number {
  return mod(beats + (o.phase ?? 0), o.on + o.off);
}
