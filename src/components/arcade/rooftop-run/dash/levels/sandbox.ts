import type { LevelDef, LevelId, Obj } from '../types';
import { levelMeta } from './meta';

/**
 * A short test level with one of nearly everything, in raw objects (no kit),
 * so the runtime, the renderer and the audio have something to show before
 * the real levels exist. Not shipped as a level; the real ones replace the
 * stubs below. Spacing is generous because the physics were not tuned when
 * it was written: re-check it against the solver.
 */
const OBJECTS: Obj[] = [
  { k: 'theme', x: 0, theme: 'dawn' },
  { k: 'roof', x: -12, w: 43, top: 3, style: 'tiles' },
  { k: 'text', x: 8, y: 7.5, text: 'Tap to jump', size: 0.9 },
  { k: 'deco', x: 4, y: 3, d: 'cat' },
  { k: 'spike', x: 16, y: 3 },
  { k: 'spike', x: 24, y: 3, n: 2 },
  { k: 'roof', x: 34, w: 40, top: 3, style: 'flat' },
  { k: 'block', x: 42, y: 3, w: 3, h: 1, style: 'crate' },
  { k: 'spike', x: 50, y: 3 },
  { k: 'pad', x: 57, y: 3, c: 'yellow' },
  { k: 'scroll', x: 60, y: 9, id: 0 },
  { k: 'orb', x: 66, y: 6.5, c: 'yellow' },
  { k: 'deco', x: 68, y: 3, d: 'banner' },
  { k: 'roof', x: 74, w: 70, top: 3, style: 'warehouse' },
  { k: 'gate', x: 80, y: 7, mode: 'kite', floor: 3, ceil: 12, h: 9 },
  { k: 'saw', x: 92, y: 9.5, r: 1.1 },
  { k: 'block', x: 100, y: 3, w: 2, h: 3, style: 'tank' },
  { k: 'crow', x: 108, y: 8, move: { dx: 0, dy: 1.5, period: 4 } },
  { k: 'block', x: 114, y: 9, w: 2, h: 3, style: 'beam' },
  { k: 'gate', x: 124, y: 6, mode: 'run', h: 9, floor: null, ceil: null },
  { k: 'speed', x: 128, y: 5, speed: 'fast' },
  { k: 'lantern', x: 134, y: 11, len: 4, swing: 0.5, period: 4 },
  { k: 'roof', x: 147, w: 30, top: 4, style: 'pagoda' },
  { k: 'vent', x: 152, y: 4, h: 3, on: 1, off: 1 },
  { k: 'end', x: 168 },
];

export function stubLevel(id: LevelId): LevelDef {
  return { ...levelMeta(id), objects: OBJECTS, start: { x: 2, y: 3 } };
}

export const SANDBOX: LevelDef = stubLevel('first-light');
