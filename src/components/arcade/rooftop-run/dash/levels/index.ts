import type { LevelDef, LevelId } from '../types';
import { LEVEL_METAS, levelMeta, levelSeconds } from './meta';
import firstLight from './first-light';
import lanternRow from './lantern-row';
import moonGate from './moon-gate';
import stormRoofs from './storm-roofs';
import dragonFestival from './dragon-festival';
import shadowDojo from './shadow-dojo';

/** The level list, in order. Menus read LEVEL_METAS; the game reads getLevel. */
const LEVELS: Record<LevelId, LevelDef> = {
  'first-light': firstLight,
  'lantern-row': lanternRow,
  'moon-gate': moonGate,
  'storm-roofs': stormRoofs,
  'dragon-festival': dragonFestival,
  'shadow-dojo': shadowDojo,
};

export function getLevel(id: LevelId): LevelDef {
  return LEVELS[id];
}

export { LEVEL_METAS, levelMeta, levelSeconds };
