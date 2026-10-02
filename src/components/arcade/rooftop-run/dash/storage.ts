/**
 * Kiru's Rooftop Run: Dash progress, kept in this browser.
 *
 * One versioned key holds everything: per-level progress (best %, practice
 * best %, attempts, completion, scrolls, jumps) and the chosen gear. Storage
 * can be blocked, full or private, so every read and write is guarded, and a
 * copy in memory carries progress through the visit when it cannot be saved.
 *
 * The sound choice is never stored: every visit starts silent.
 */
import {
  DEFAULT_SKIN,
  EMPTY_PROGRESS,
  MAX_COUNT,
  type DashRunInfo,
  type DashSave,
  type KiruSkin,
  type LevelId,
  type LevelProgress,
  type TrailId,
} from './types';
import { LEVEL_METAS } from './levels/meta';

export const SAVE_KEY = 'sd-rooftop-dash-v1';

const LEVEL_IDS = new Set<string>(LEVEL_METAS.map((m) => m.id));
const TRAIL_IDS = new Set<string>([
  'none',
  'ink',
  'petals',
  'sparks',
  'embers',
  'stars',
]);

const emptySave = (): DashSave => ({
  v: 1,
  levels: {},
  skin: { ...DEFAULT_SKIN },
});

// localStorage is the source of truth while it works, read afresh each time:
// another tab may have saved since (a copy loaded once and written back
// wiped out progress made in a second tab). This copy carries the visit
// once storage can't be read or written (blocked, private, full).
let memory: DashSave | null = null;
let memoryOnly = false;

const isObj = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);

const pct = (x: unknown) =>
  typeof x === 'number' && Number.isFinite(x)
    ? Math.max(0, Math.min(100, Math.round(x)))
    : 0;

const count = (x: unknown) =>
  typeof x === 'number' && Number.isFinite(x) && x > 0
    ? Math.min(MAX_COUNT, Math.floor(x))
    : 0;

function readProgress(x: unknown): LevelProgress | null {
  if (!isObj(x)) return null;
  const s = Array.isArray(x.scrolls) ? x.scrolls : [];
  return {
    best: pct(x.best),
    practiceBest: pct(x.practiceBest),
    attempts: count(x.attempts),
    completed: x.completed === true,
    scrolls: [s[0] === true, s[1] === true, s[2] === true],
    jumps: count(x.jumps),
  };
}

function readSkin(x: unknown): KiruSkin {
  if (!isObj(x)) return { ...DEFAULT_SKIN };
  const band =
    typeof x.band === 'string' && /^#[0-9a-f]{6}$/i.test(x.band)
      ? x.band.toLowerCase()
      : DEFAULT_SKIN.band;
  const trail =
    typeof x.trail === 'string' && TRAIL_IDS.has(x.trail)
      ? (x.trail as TrailId)
      : DEFAULT_SKIN.trail;
  return { band, trail };
}

/** Parse whatever is stored; anything unexpected falls back to the defaults. */
function parse(raw: string | null): DashSave {
  if (!raw) return emptySave();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return emptySave();
  }
  if (!isObj(data) || data.v !== 1) return emptySave();
  const save = emptySave();
  if (isObj(data.levels)) {
    for (const [id, p] of Object.entries(data.levels)) {
      if (!LEVEL_IDS.has(id)) continue;
      const prog = readProgress(p);
      if (prog) save.levels[id as LevelId] = prog;
    }
  }
  save.skin = readSkin(data.skin);
  return save;
}

const copy = (s: DashSave): DashSave => ({
  v: 1,
  levels: Object.fromEntries(
    Object.entries(s.levels).map(([id, p]) => [
      id,
      { ...p, scrolls: [...p.scrolls] },
    ])
  ) as DashSave['levels'],
  skin: { ...s.skin },
});

/** The saved progress (a fresh copy: change it through the functions below). */
export function loadSave(): DashSave {
  if (!memoryOnly) {
    try {
      memory = parse(localStorage.getItem(SAVE_KEY));
    } catch {
      /* blocked storage: start fresh, keep progress in memory */
      memoryOnly = true;
    }
  }
  if (!memory) memory = emptySave();
  return copy(memory);
}

/** Replace the save (in memory always; in storage when the browser allows). */
export function saveSave(save: DashSave): void {
  memory = copy(save);
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(memory));
  } catch {
    /* private mode, full or blocked: it lasts until the tab closes */
    memoryOnly = true;
  }
}

/** One level's progress, or the empty record if it has never been played. */
export function levelProgress(save: DashSave, id: LevelId): LevelProgress {
  const p = save.levels[id];
  return p
    ? { ...p, scrolls: [...p.scrolls] }
    : { ...EMPTY_PROGRESS, scrolls: [false, false, false] };
}

/**
 * Fold one attempt (a death, a finish, or one given up part-way) into the
 * save and store it. Every attempt counts, with its jumps, as in Geometry
 * Dash. One given up sets no best and keeps nothing else. Practice runs
 * raise the practice best, but only a normal-mode finish completes a level,
 * and only a completed normal run keeps its scrolls.
 */
export function recordAttempt(info: DashRunInfo): DashSave {
  const save = loadSave();
  const p = levelProgress(save, info.levelId);
  const percent = info.completed ? 100 : pct(info.percent);
  p.attempts = Math.min(MAX_COUNT, p.attempts + 1);
  p.jumps = Math.min(MAX_COUNT, p.jumps + count(info.jumps));
  if (info.abandoned) {
    // Counted above; nothing else.
  } else if (info.practice) {
    p.practiceBest = Math.max(p.practiceBest, percent);
  } else {
    p.best = Math.max(p.best, percent);
    if (info.completed) {
      p.completed = true;
      p.scrolls = [
        p.scrolls[0] || info.scrolls[0] === true,
        p.scrolls[1] || info.scrolls[1] === true,
        p.scrolls[2] || info.scrolls[2] === true,
      ];
    }
  }
  save.levels[info.levelId] = p;
  saveSave(save);
  return save;
}

export function loadSkin(): KiruSkin {
  return loadSave().skin;
}

export function saveSkin(skin: KiruSkin): DashSave {
  const save = loadSave();
  save.skin = readSkin(skin);
  saveSave(save);
  return save;
}

/** Stars earned: each completed level's stars. */
export function totalStars(save: DashSave): number {
  return LEVEL_METAS.reduce(
    (n, m) => n + (save.levels[m.id]?.completed ? m.stars : 0),
    0
  );
}

/** Secret scrolls kept, out of three per level. */
export function totalScrolls(save: DashSave): number {
  return LEVEL_METAS.reduce(
    (n, m) => n + (save.levels[m.id]?.scrolls.filter(Boolean).length ?? 0),
    0
  );
}

export const MAX_STARS = LEVEL_METAS.reduce((n, m) => n + m.stars, 0);
export const MAX_SCROLLS = LEVEL_METAS.length * 3;
