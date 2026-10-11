import { apps, GAME_SLUGS } from './apps';
import { projects, PROJECT_APP_SLUGS } from './projects';
import { SHOWCASE } from './showcase';

/**
 * What I Built's lists, as data, so anything that counts them reads the same
 * lists the page renders: /about (the work) since October 2026, when the
 * /built index was folded into it. The home receipts band and the /about
 * receipt both said "7 things built" while /built showed 4 projects and 4
 * more (October 2026): each had its own copy of the filter, and neither
 * counted everything the page showed.
 */

/** Slugs already shown as one of the four projects, under either name. */
export const BUILT_COVERED = new Set<string>([
  ...projects.map((p) => p.slug),
  ...Object.keys(PROJECT_APP_SLUGS),
]);

/** The apps listed as "everything else": not a game, not one of the four. */
export const builtCatalogueApps = apps.filter(
  (app) =>
    !(GAME_SLUGS as readonly string[]).includes(app.slug) &&
    !BUILT_COVERED.has(app.slug)
);

/**
 * Everything built that isn't a game: the Arcade and Kiru (two of the four
 * /about leads with, src/data/showcase.ts), the projects with a page and the
 * catalogue's apps.
 */
export const THINGS_BUILT =
  SHOWCASE.length + projects.length + builtCatalogueApps.length;
