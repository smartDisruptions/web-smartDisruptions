import { apps, GAME_SLUGS } from './apps';
import { projects, PROJECT_APP_SLUGS } from './projects';

/**
 * What /built shows, as data, so anything that counts it reads the same list
 * the page renders. The home receipts band and the /about receipt both said
 * "7 things built" while /built showed 4 projects and 4 more (October 2026):
 * each had its own copy of the filter, and neither knew about Kitsune Kitchen.
 */

/** Slugs /built already shows as project cards, under either name. */
export const BUILT_COVERED = new Set<string>([
  ...projects.map((p) => p.slug),
  ...Object.keys(PROJECT_APP_SLUGS),
]);

/** The apps /built's catalogue lists: not a game, not already a project card. */
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
 * Sites /built lists by hand, because they have no entry in the apps data.
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
 * Everything /built shows that isn't a game: the project cards, the
 * catalogue's apps and the hand-listed sites.
 */
export const THINGS_BUILT =
  projects.length + builtCatalogueApps.length + BUILT_SITES.length;
