import { apps, GAME_SLUGS } from './apps';
import { projects, PROJECT_APP_SLUGS } from './projects';
import { SHOWCASE } from './showcase';

/**
 * What I Built's lists, as data, so anything that counts them reads the same
 * lists the page renders: /about (the work) since October 2026, when the
 * /built index was folded into it. The home receipts band and the /about
 * receipt both said "7 things built" while /built showed 4 projects and 4
 * more (October 2026): each had its own copy of the filter, and neither knew
 * about Kitsune Kitchen.
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

export type BuiltSite = {
  key: string;
  name: string;
  description: string;
  thumbnail: string;
  liveUrl: string;
  status: string;
  tech: string[];
};

/**
 * Sites listed by hand, because they have no entry in the apps data.
 * Kitsune Kitchen is a site, not an app; without this it would have vanished
 * with /websites.
 */
export const BUILT_SITES: BuiltSite[] = [
  {
    key: 'kitsune-kitchen',
    name: 'Kitsune Kitchen',
    description:
      'The same ordering system as Samurai Kitchen, set up for a restaurant I made up so that anyone can try it. You can build an order and go through the checkout without buying anything.',
    thumbnail: '/images/websites/kitsune-kitchen.webp',
    liveUrl: 'https://japanese-sushi-website.vercel.app',
    status: 'live',
    tech: ['Next.js', 'Square API', 'Demo build'],
  },
];

/**
 * Everything built that isn't a game: the Arcade and Kiru (two of the four
 * /about leads with, src/data/showcase.ts), the projects with a page, the
 * catalogue's apps and the hand-listed sites.
 */
export const THINGS_BUILT =
  SHOWCASE.length +
  projects.length +
  builtCatalogueApps.length +
  BUILT_SITES.length;
