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
  '/images/apps/tether-ball-1.webp': [780, 1688],
  '/images/apps/tether-ball-2.webp': [780, 1688],
  '/images/apps/tether-ball-3.webp': [1600, 900],
  '/images/apps/tether-ball-thumbnail.webp': [1200, 630],
  '/images/apps/milk-bottle-knockdown-1.webp': [780, 1688],
  '/images/apps/milk-bottle-knockdown-2.webp': [780, 1688],
  '/images/apps/milk-bottle-knockdown-3.webp': [1600, 900],
  '/images/apps/milk-bottle-knockdown-thumbnail.webp': [1200, 630],
  '/images/apps/ring-toss-1.webp': [780, 1688],
  '/images/apps/ring-toss-2.webp': [780, 1688],
  '/images/apps/ring-toss-3.webp': [1600, 900],
  '/images/apps/ring-toss-thumbnail.webp': [1200, 630],
  '/images/apps/hoop-quest-1.webp': [780, 1688],
  '/images/apps/hoop-quest-2.webp': [780, 1688],
  '/images/apps/hoop-quest-3.webp': [1600, 900],
  '/images/apps/hoop-quest-thumbnail.webp': [1200, 630],
  '/images/apps/kid-volt-knockout-1.webp': [780, 1688],
  '/images/apps/kid-volt-knockout-2.webp': [780, 1688],
  '/images/apps/kid-volt-knockout-3.webp': [1600, 900],
  '/images/apps/kid-volt-knockout-thumbnail.webp': [1200, 630],
  '/images/apps/whack-a-dust-bunny-1.webp': [780, 1688],
  '/images/apps/whack-a-dust-bunny-2.webp': [780, 1688],
  '/images/apps/whack-a-dust-bunny-3.webp': [1600, 900],
  '/images/apps/whack-a-dust-bunny-thumbnail.webp': [1200, 630],
  '/images/apps/ai-diary-1.png': [1024, 1520],
  '/images/apps/ai-diary-2.png': [1024, 1520],
  '/images/apps/ai-diary-3.png': [1024, 1520],
  '/images/apps/ai-diary-thumbnail.png': [1024, 1520],
  '/images/apps/broom-blade-1.webp': [1200, 753],
  '/images/apps/broom-blade-2.webp': [1200, 753],
  '/images/apps/broom-blade-3.webp': [1200, 753],
  '/images/apps/broom-blade-thumbnail.webp': [800, 420],
  '/images/apps/cloth-simulator-1.webp': [1600, 900],
  '/images/apps/cloth-simulator-2.webp': [780, 1688],
  '/images/apps/cloth-simulator-3.webp': [780, 1688],
  '/images/apps/cloth-simulator-thumbnail.webp': [1200, 630],
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
  '/images/apps/moondrift-1.webp': [1600, 900],
  '/images/apps/moondrift-2.webp': [1600, 900],
  '/images/apps/moondrift-3.webp': [780, 1688],
  '/images/apps/moondrift-thumbnail.webp': [1200, 630],
  '/images/apps/cosmo-outbound-1.webp': [1600, 900],
  '/images/apps/cosmo-outbound-2.webp': [1600, 900],
  '/images/apps/cosmo-outbound-3.webp': [780, 1688],
  '/images/apps/cosmo-outbound-thumbnail.webp': [1200, 630],
  '/images/apps/rubble-rouser-1.webp': [1600, 900],
  '/images/apps/rubble-rouser-2.webp': [1600, 900],
  '/images/apps/rubble-rouser-3.webp': [780, 1688],
  '/images/apps/rubble-rouser-thumbnail.webp': [1200, 630],
  '/images/apps/the-moon-pearl-1.webp': [1600, 900],
  '/images/apps/the-moon-pearl-2.webp': [1600, 900],
  '/images/apps/the-moon-pearl-3.webp': [780, 1688],
  '/images/apps/the-moon-pearl-thumbnail.webp': [1200, 630],
  '/images/apps/night-parade-1.webp': [1600, 900],
  '/images/apps/night-parade-2.webp': [1600, 900],
  '/images/apps/night-parade-3.webp': [780, 1688],
  '/images/apps/night-parade-thumbnail.webp': [1200, 630],
  '/images/apps/portfolio-ledger-1.webp': [780, 1688],
  '/images/apps/portfolio-ledger-2.webp': [780, 1688],
  '/images/apps/portfolio-ledger-3.webp': [1600, 900],
  '/images/apps/portfolio-ledger-thumbnail.webp': [1200, 630],
  '/images/apps/pomodoro-1.webp': [1600, 900],
  '/images/apps/pomodoro-2.webp': [780, 1688],
  '/images/apps/pomodoro-3.webp': [780, 1688],
  '/images/apps/pomodoro-thumbnail.webp': [1200, 630],
  '/images/apps/rooftop-run-thumbnail.webp': [1200, 630],
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
  '/images/websites/arcade.webp': [1200, 750],
  '/images/websites/gilt-and-lather.webp': [1200, 750],
  '/images/websites/broom-blade.webp': [1200, 750],
  '/images/websites/kiru.webp': [1200, 750],
  '/images/websites/kiru-cast.webp': [1200, 750],
  '/images/websites/moonbowl.webp': [1200, 750],
  '/images/websites/notebook.webp': [1200, 750],
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
  arcade: '戯', // play, as in 遊戯: the Arcade
  kiru: '切', // his name: 切る, kiru, "to cut"
  'broom-blade': '遊', // play: chores turned into a game
  'samurai-kitchen': '侍', // samurai
  voltic: '雷', // thunder: "liquid lightning"
  moonbowl: '月', // moon: the egg yolk is the moon in the bowl
  notebook: '書', // writing: the notebook this site used to be
  'pomodoro-timer': '技', // technique: the Pomodoro technique
  'spacex-mars': '探', // explore
  'cloth-simulator': '風', // wind
  'tether-ball': '力', // power: the hit
  'ai-diary': '心', // heart, mind
  'portfolio-ledger': '帳', // a ledger, as in 帳簿: an account book
  'lantern-night': '光', // light: "Light the night"
  'night-parade': '斬', // cut: Kiru cuts each yokai in two
  'tokaido-run': '道', // the road: the Tōkaidō, 東海道
  'neo-dojo-survivors': '守', // defend: Tengu-9 holds the dojo for fifteen minutes
  'path-not-taken': '岐', // a fork in the road, as in 岐路: the path not taken
  moondrift: '漂', // to drift, as in 漂う: Cosmo drifting across the moon
  'cosmo-outbound': '航', // to voyage, as in 航宙, a voyage through space: Cosmo outbound, star to star
  'rubble-rouser': '崩', // to crumble, as in 崩れる: every building comes down
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
 * The shared-element name a screenshot carries on /about and on its own page,
 * so the browser carries the picture from the card into the hero on the way
 * in (a View Transition). Names must be unique on a page: one per slug. The
 * class lets device.css time all of them together.
 */
export function shotTransition(slug: string) {
  return {
    viewTransitionName: `bt-${slug}`,
    viewTransitionClass: 'bt-shot',
  } as const;
}
