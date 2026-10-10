import { apps, GAME_SLUGS, type App } from '@/data/apps';
import { projects } from '@/data/projects';
import { BUILT_COVERED, BUILT_SITES, builtCatalogueApps } from '@/data/built';
import type { WallItem } from '@/components/built/ArmoryWall';
import { markFor } from '@/components/built/media';

/**
 * The work on /about, as lists: what What I Built showed before it was
 * folded into About (October 2026). Every section of the page reads these,
 * so the counts in the receipt, the jump links and the sections can't drift
 * from each other. The underlying filters live in src/data/built.ts, which
 * the home page's receipts band counts from too.
 */

/** The anchors each section of the work sits under, in page order. */
export const WORK_IDS = {
  projects: 'projects',
  more: 'more',
  games: 'games',
  wall: 'wall',
} as const;

/** The four I would show you first: src/data/projects.ts. */
export { projects };

export type CatalogueEntry = {
  key: string;
  name: string;
  description: string;
  thumbnail: string;
  liveUrl?: string;
  /** Present when the thing has its own page under /built. */
  detailHref?: string;
  status: string;
  /** What the thing is ("Productivity", "Simulation", "Website"). */
  category: string;
  tech: string[];
};

/**
 * Everything else: the apps that are neither a game nor already one of the
 * four, then the sites with no entry in the apps data (Kitsune Kitchen).
 */
export const catalogue: CatalogueEntry[] = [
  ...builtCatalogueApps.map((app) => ({
    key: app.slug,
    name: app.name,
    description: app.description,
    thumbnail: app.thumbnailUrl,
    liveUrl: app.liveUrl,
    detailHref: `/built/${app.slug}`,
    status: app.status,
    category: app.category,
    tech: app.techStack.slice(0, 3),
  })),
  ...BUILT_SITES.map((site) => ({
    key: site.key,
    name: site.name,
    description: site.description,
    thumbnail: site.thumbnail,
    liveUrl: site.liveUrl,
    status: site.status,
    category: 'Website',
    tech: site.tech,
  })),
];

/**
 * The games: every game the Arcade shows (its front room, the Broom & Blade
 * Arcade and the archive), in the Arcade's own order, less any one of the
 * four already covers (Broom & Blade). Each has its own page at
 * /built/<slug>; `liveUrl` is where it plays.
 */
export const games: App[] = GAME_SLUGS.filter(
  (slug) => !BUILT_COVERED.has(slug)
)
  .map((slug) => apps.find((a) => a.slug === slug))
  .filter((a): a is App => a !== undefined);

/**
 * Everything on one wall: the four, everything else, then the games. Each
 * plaque opens the thing's own page; Kitsune Kitchen has none, so it opens
 * the live demo.
 */
export const wall: WallItem[] = [
  ...projects.map((p) => ({
    key: p.slug,
    name: p.name,
    kind: p.parts.map((part) => part.kind).join(' + '),
    href: `/built/${p.slug}`,
    src: p.image,
    mark: markFor(p.slug),
  })),
  ...catalogue.map((c) => ({
    key: c.key,
    name: c.name,
    kind: c.category,
    href: c.detailHref ?? c.liveUrl ?? '/about',
    external: !c.detailHref,
    src: c.thumbnail,
    mark: markFor(c.key),
  })),
  ...games.map((g) => ({
    key: g.slug,
    name: g.name,
    kind: g.category,
    href: `/built/${g.slug}`,
    src: g.thumbnailUrl,
    mark: markFor(g.slug),
  })),
];

const WORDS = [
  'no',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
];

/** Small counts read as words in a sentence ("the four below"). */
export const inWords = (n: number) => WORDS[n] ?? String(n);

/** "01", "02" … for the big index numerals. */
export const pad = (n: number) => String(n).padStart(2, '0');
