/**
 * What I Built — the small facts the pages need about each picture.
 *
 * SIZES: the real pixel size of every screenshot /built shows, read from the
 * files themselves (ImageMagick `identify`, 2026-10-01). src/data/apps.ts has
 * no sizes, and an image without width/height shifts the page as it loads.
 * A file missing from this list still renders: its frame keeps the frame's
 * own shape and the picture is cropped to fit, so nothing moves either way.
 * Add a row when a new screenshot arrives.
 */
export const SIZES: Record<string, readonly [number, number]> = {
  '/images/apps/ai-diary-1.png': [1024, 1520],
  '/images/apps/ai-diary-2.png': [1024, 1520],
  '/images/apps/ai-diary-3.png': [1024, 1520],
  '/images/apps/ai-diary-thumbnail.png': [1024, 1520],
  '/images/apps/aureum-snake-1.png': [800, 400],
  '/images/apps/aureum-snake-2.png': [800, 400],
  '/images/apps/aureum-snake-3.png': [800, 600],
  '/images/apps/aureum-snake-thumbnail.webp': [800, 400],
  '/images/apps/broom-blade-1.webp': [1200, 753],
  '/images/apps/broom-blade-2.webp': [1200, 753],
  '/images/apps/broom-blade-3.webp': [1200, 753],
  '/images/apps/broom-blade-thumbnail.webp': [800, 420],
  '/images/apps/cloth-simulator-1.png': [1280, 800],
  '/images/apps/cloth-simulator-2.png': [1280, 800],
  '/images/apps/cloth-simulator-3.png': [390, 844],
  '/images/apps/cloth-simulator-thumbnail.webp': [800, 500],
  '/images/apps/field-office-1.png': [1440, 1000],
  '/images/apps/field-office-2.png': [1440, 1600],
  '/images/apps/field-office-3.png': [1440, 800],
  '/images/apps/field-office-thumbnail.webp': [800, 420],
  '/images/apps/going-traveling-1.webp': [1200, 760],
  '/images/apps/going-traveling-2.webp': [1200, 760],
  '/images/apps/going-traveling-3.webp': [1200, 760],
  '/images/apps/going-traveling-thumbnail.webp': [800, 420],
  '/images/apps/grove-1.png': [490, 644],
  '/images/apps/grove-2.png': [490, 644],
  '/images/apps/grove-3.png': [490, 644],
  '/images/apps/grove-thumbnail.webp': [800, 420],
  '/images/apps/lantern-night-1.webp': [1600, 900],
  '/images/apps/lantern-night-2.webp': [1600, 900],
  '/images/apps/lantern-night-3.webp': [780, 1688],
  '/images/apps/lantern-night-thumbnail.webp': [1200, 630],
  '/images/apps/neo-dojo-survivors-1.webp': [1600, 900],
  '/images/apps/neo-dojo-survivors-2.webp': [1600, 900],
  '/images/apps/neo-dojo-survivors-3.webp': [780, 1688],
  '/images/apps/neo-dojo-survivors-thumbnail.webp': [1200, 630],
  '/images/apps/path-not-taken-1.webp': [1600, 900],
  '/images/apps/path-not-taken-2.webp': [1600, 900],
  '/images/apps/path-not-taken-3.webp': [780, 1688],
  '/images/apps/path-not-taken-thumbnail.webp': [1200, 630],
  '/images/apps/night-parade-1.webp': [1600, 900],
  '/images/apps/night-parade-2.webp': [1600, 900],
  '/images/apps/night-parade-3.webp': [780, 1688],
  '/images/apps/night-parade-thumbnail.webp': [1200, 630],
  '/images/apps/pebble-kart-1.png': [1600, 813],
  '/images/apps/pebble-kart-2.png': [1600, 813],
  '/images/apps/pebble-kart-3.png': [1600, 813],
  '/images/apps/pebble-kart-thumbnail.webp': [800, 406],
  '/images/apps/pomodoro-1.png': [1440, 900],
  '/images/apps/pomodoro-2.png': [1280, 800],
  '/images/apps/pomodoro-3.png': [1440, 900],
  '/images/apps/pomodoro-thumbnail.png': [1200, 630],
  '/images/apps/samurai-kitchen-1.webp': [1200, 750],
  '/images/apps/samurai-kitchen-2.png': [1440, 900],
  '/images/apps/samurai-kitchen-3.png': [1440, 900],
  '/images/apps/samurai-kitchen-thumbnail.png': [1200, 630],
  '/images/apps/spacex-mars-1.png': [1440, 900],
  '/images/apps/spacex-mars-2.png': [1440, 900],
  '/images/apps/spacex-mars-3.png': [1440, 900],
  '/images/apps/spacex-mars-thumbnail.png': [1200, 630],
  '/images/apps/tokaido-run-1.webp': [1600, 900],
  '/images/apps/tokaido-run-2.webp': [1600, 900],
  '/images/apps/tokaido-run-3.webp': [780, 1688],
  '/images/apps/tokaido-run-thumbnail.webp': [1200, 630],
  '/images/websites/broom-blade.webp': [1200, 750],
  '/images/websites/kitsune-kitchen.webp': [1200, 750],
  '/images/websites/notebook.webp': [1200, 750],
  '/images/websites/pembroke-file.png': [1200, 630],
  '/images/websites/samurai-kitchen.webp': [1200, 750],
  '/images/websites/voltic.webp': [1200, 750],
};

/** Fallback when a file is not in SIZES: a 16:10 screen, the commonest shape. */
const FALLBACK: readonly [number, number] = [1200, 750];

export function sizeOf(src: string): readonly [number, number] {
  return SIZES[src] ?? FALLBACK;
}

export type FrameKind =
  | 'laptop'
  | 'browser'
  | 'tablet'
  | 'tablet-tall'
  | 'phone';

/**
 * Which device a screenshot sits in. The picture decides first — a tall one
 * can only be a phone or an upright tablet — and then what the thing is: a
 * website goes in a browser window, an app or a game in a tablet.
 */
export function frameFor(
  src: string,
  kind: 'Website' | 'Game' | 'App' | 'web-app'
): FrameKind {
  const [w, h] = sizeOf(src);
  const r = w / h;
  if (r < 0.62) return 'phone';
  if (r < 0.95) return 'tablet-tall';
  if (kind === 'Website' || kind === 'web-app') return 'browser';
  return 'tablet';
}

/**
 * The address bar text for a live link: the bare host, no scheme. A link on
 * this site (a past design under /archive) shows the site's own host and the
 * path, since that is what the reader's address bar will say.
 */
export function hostOf(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/')) return `smartdisruptions.com${url}`;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

/**
 * The brush kanji stamped on each thing's seal and watermark. Decorative —
 * the English is always on the page — and every one is a baked glyph
 * (components/brand/glyphs.ts), so nothing here loads a font.
 */
const MARKS: Record<string, string> = {
  'broom-blade': '遊', // play: chores turned into a game
  'pembroke-file': '秘', // secret: a locked file
  'samurai-kitchen': '侍', // samurai
  voltic: '雷', // thunder: "liquid lightning"
  notebook: '書', // writing: the notebook this site used to be
  'pomodoro-timer': '技', // technique: the Pomodoro technique
  'spacex-mars': '探', // explore
  'cloth-simulator': '風', // wind
  'ai-diary': '心', // heart, mind
  'aureum-snake': '遊', // play
  'pebble-kart': '速', // speed
  grove: '桜', // a tree that grows
  'going-traveling': '道', // the road
  'kitsune-kitchen': '作', // made
  'lantern-night': '光', // light: "Light the night"
  'night-parade': '斬', // cut: Kiru cuts each yokai in two
  'tokaido-run': '道', // the road: the Tōkaidō, 東海道
  'neo-dojo-survivors': '守', // defend: Tengu-9 holds the dojo for fifteen minutes
  'path-not-taken': '岐', // a fork in the road, as in 岐路: the path not taken
  // The Broom & Blade Arcade
  'hoop-quest': '籠', // a basket
  'kid-volt-knockout': '拳', // a fist
  'whack-a-dust-bunny': '兎', // a rabbit: the dust bunnies
  'ring-toss': '輪', // a ring
  'milk-bottle-knockdown': '倒', // to knock down
};

export function markFor(slug: string): string {
  return MARKS[slug] ?? '作';
}

/**
 * The shared-element name a screenshot carries on /built and on its own page,
 * so the browser carries the picture from the card into the hero on the way
 * in (a View Transition). Names must be unique on a page: one per slug. The
 * class lets built.css time all of them together.
 */
export function shotTransition(slug: string) {
  return {
    viewTransitionName: `bt-${slug}`,
    viewTransitionClass: 'bt-shot',
  } as const;
}
