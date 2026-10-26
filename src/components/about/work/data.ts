import { apps, GAME_SLUGS, getAppBySlug, type App } from '@/data/apps';
import {
  getProjectBySlug,
  projects,
  type Project,
  type ProjectPart,
} from '@/data/projects';
import { BUILT_COVERED, builtCatalogueApps } from '@/data/built';
import { FEATURED_SLUGS, SHOWCASE, type Showcase } from '@/data/showcase';
import type { WallItem } from '@/components/built/ArmoryWall';
import { markFor } from '@/components/built/media';

/**
 * The work on /about, as lists: what What I Built showed before it was
 * folded into About (October 2026). The receipt counts them and the wall
 * hangs them (and its chips sort them into the four, More builds and the
 * games), so the counts and the plaques can't drift from each other. The underlying filters live in src/data/built.ts, which
 * the home page's receipts band counts from too.
 */

/** The anchor the wall sits under, which the receipt's lines open. */
export const WORK_IDS = {
  wall: 'wall',
} as const;

/** A project with a write-up, in the shape the four are drawn in. */
function fromProject(p: Project): Showcase {
  // The project's own picture is the website; a part with a different
  // picture (Broom & Blade's game) gets a second device beside it.
  const side = p.parts.find((part) => part.image !== p.image);
  return {
    slug: p.slug,
    name: p.name,
    eyebrow: p.eyebrow,
    summary: p.summary,
    kind: p.parts.map((part) => part.kind).join(' + '),
    href: `/built/${p.slug}`,
    image: p.image,
    imageAlt: p.imageAlt,
    side: side && {
      image: side.image,
      imageAlt: side.imageAlt,
      kind: side.kind,
      href: side.href,
    },
    actions: p.parts.map((part) => ({
      label: part.linkLabel,
      href: part.href,
    })),
    more: { label: 'What is built into it', href: `/built/${p.slug}` },
  };
}

/**
 * The four I'd show you first, in Josh's order (src/data/showcase.ts): the
 * Arcade and Kiru, then Broom & Blade and Moonbowl Ramen from their write-ups.
 */
export const featured: Showcase[] = FEATURED_SLUGS.map((slug) => {
  const own = SHOWCASE.find((s) => s.slug === slug);
  if (own) return own;
  const project = getProjectBySlug(slug);
  if (!project) throw new Error(`featured: no project "${slug}"`);
  return fromProject(project);
});

export type CatalogueEntry = {
  key: string;
  name: string;
  description: string;
  thumbnail: string;
  liveUrl?: string;
  /** The live link's words ("Try it" when not given). */
  liveLabel?: string;
  /** Present when the thing has its own page under /built. */
  detailHref?: string;
  status: string;
  /** What the thing is ("Productivity", "Simulation", "Website"). */
  category: string;
  tech: string[];
};

/**
 * The projects with a write-up that are not among the four (Samurai Kitchen
 * and The Notebook design since 2026-10-10, VOLTIC since 2026-10-12). Their
 * category and three tech names come from the apps data where they have an
 * entry; The Notebook design is this site's own past design, kept as a
 * static export of its commit (scripts/archive-site.mjs), and VOLTIC has no
 * apps entry, so both are given here.
 */
const OWN_FACTS: Record<string, { category: string; tech: string[] }> = {
  notebook: {
    category: 'Website',
    tech: ['Next.js', 'Tailwind CSS', 'Static export'],
  },
  voltic: {
    category: 'Website',
    tech: ['Vite', 'three.js'],
  },
};

const otherProjects: CatalogueEntry[] = projects
  .filter((p) => !FEATURED_SLUGS.includes(p.slug))
  .map((p) => {
    const app = getAppBySlug(p.slug);
    const facts = OWN_FACTS[p.slug] ?? {
      category: app?.category ?? 'Website',
      tech: app?.techStack.slice(0, 3) ?? [],
    };
    return {
      key: p.slug,
      name: p.name,
      description: p.summary,
      thumbnail: p.image,
      liveUrl: p.parts[0]?.href,
      liveLabel: p.parts[0]?.linkLabel,
      detailHref: `/built/${p.slug}`,
      status: 'live',
      ...facts,
    };
  });

/** Everything else, in this order: the websites first, then the apps. */
const MORE_ORDER = [
  'samurai-kitchen',
  'notebook',
  'voltic',
  'portfolio-ledger',
  'pomodoro-timer',
  'spacex-mars',
  'ai-diary',
];
const rank = (key: string) => {
  const i = MORE_ORDER.indexOf(key);
  return i < 0 ? MORE_ORDER.length : i;
};

/**
 * Everything else: the projects that aren't among the four and the apps that
 * are neither a game nor a project. Anything new that MORE_ORDER doesn't name
 * yet goes last, in data order.
 */
export const catalogue: CatalogueEntry[] = [
  ...otherProjects,
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
].sort((a, b) => rank(a.key) - rank(b.key));

/**
 * The games: every game the Arcade shows (its front room, the Broom & Blade
 * Arcade and the archive), in the Arcade's own order, less any one a project
 * already covers (Broom & Blade). Each has its own page at /built/<slug>;
 * `liveUrl` is where it plays.
 */
export const games: App[] = GAME_SLUGS.filter(
  (slug) => !BUILT_COVERED.has(slug)
)
  .map((slug) => apps.find((a) => a.slug === slug))
  .filter((a): a is App => a !== undefined);

const projectParts = projects.flatMap((p) => p.parts);
const partsOf = (kind: ProjectPart['kind']) =>
  projectParts.filter((part) => part.kind === kind).length;

/**
 * What the receipt counts (Josh's call, 2026-10-21): websites, apps and
 * games, nothing else. A project counts once for each of its parts, so
 * Broom & Blade is a website and a game, as the Arcade's archive and the home
 * page's "games in the arcade" already count it. The Arcade and Kiru are
 * parts of this site rather than things of their own, so neither is counted;
 * the Arcade's games are, one by one.
 */
export const counts = {
  websites: partsOf('Website'),
  apps: partsOf('App') + builtCatalogueApps.length,
  games: partsOf('Game') + games.length,
};

/**
 * Everything on one wall: the four, everything else, then the games. Each
 * plaque opens the thing's own page (one without a page would open the
 * thing itself, in a new tab).
 */
export const wall: WallItem[] = [
  ...featured.map((f) => ({
    key: f.slug,
    name: f.name,
    kind: f.kind,
    href: f.href,
    src: f.image,
    mark: markFor(f.slug),
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
