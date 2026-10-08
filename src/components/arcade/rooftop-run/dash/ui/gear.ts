/**
 * Kiru's gear: headband colours, earned with stars, and trails, earned with
 * secret scrolls. The last of each needs everything: all 36 stars, all 18
 * scrolls.
 */
import { DEFAULT_SKIN, type KiruSkin, type TrailId } from '../types';

export interface BandGear {
  id: string;
  name: string;
  color: string;
  /** Stars needed. */
  stars: number;
}

export interface TrailGear {
  id: TrailId;
  name: string;
  /** Secret scrolls needed. */
  scrolls: number;
}

export const BANDS: BandGear[] = [
  { id: 'vermilion', name: 'Vermilion', color: '#e8432a', stars: 0 },
  { id: 'indigo', name: 'Indigo', color: '#4f5bd5', stars: 3 },
  { id: 'jade', name: 'Jade', color: '#2fb38a', stars: 5 },
  { id: 'gold', name: 'Gold', color: '#f2b33d', stars: 7 },
  { id: 'sakura', name: 'Sakura', color: '#ff8fb8', stars: 13 },
  { id: 'white', name: 'White', color: '#f4f5ff', stars: 22 },
  { id: 'violet', name: 'Violet', color: '#9b5de5', stars: 28 },
  { id: 'black', name: 'Black', color: '#15161f', stars: 34 },
];

export const TRAILS: TrailGear[] = [
  { id: 'none', name: 'No trail', scrolls: 0 },
  { id: 'ink', name: 'Ink', scrolls: 1 },
  { id: 'petals', name: 'Petals', scrolls: 3 },
  { id: 'sparks', name: 'Sparks', scrolls: 6 },
  { id: 'embers', name: 'Embers', scrolls: 10 },
  { id: 'stars', name: 'Starfall', scrolls: 18 },
];

export const bandUnlocked = (b: BandGear, stars: number) => stars >= b.stars;
export const trailUnlocked = (t: TrailGear, scrolls: number) =>
  scrolls >= t.scrolls;

export function bandFor(color: string): BandGear | undefined {
  const c = color.toLowerCase();
  return BANDS.find((b) => b.color === c);
}

export function trailFor(id: TrailId): TrailGear | undefined {
  return TRAILS.find((t) => t.id === id);
}

/** The saved skin, with anything not (or no longer) earned put back to the default. */
export function allowedSkin(
  skin: KiruSkin,
  stars: number,
  scrolls: number
): KiruSkin {
  const band = bandFor(skin.band);
  const trail = trailFor(skin.trail);
  return {
    band: band && bandUnlocked(band, stars) ? band.color : DEFAULT_SKIN.band,
    trail:
      trail && trailUnlocked(trail, scrolls) ? trail.id : DEFAULT_SKIN.trail,
  };
}

/** Gear that unlocks between two totals: for "new headband" lines. */
export function newlyUnlocked(
  before: { stars: number; scrolls: number },
  after: { stars: number; scrolls: number }
): string[] {
  const out: string[] = [];
  for (const b of BANDS) {
    if (b.stars > before.stars && b.stars <= after.stars) {
      out.push(`${b.name} headband`);
    }
  }
  for (const t of TRAILS) {
    if (t.scrolls > before.scrolls && t.scrolls <= after.scrolls) {
      out.push(`${t.name} trail`);
    }
  }
  return out;
}
