/**
 * The four I'd show you first, on /about: what they are, in order.
 *
 * WHY THIS EXISTS: Josh's call, 2026-10-10. The four are the Arcade, Kiru,
 * Broom & Blade and VOLTIC, in that order. Two of them are projects with a
 * write-up under /built (src/data/projects.ts); the Arcade and Kiru are
 * parts of this site, and their own pages (/games, /kiru) are where you meet
 * them, so they are described here instead. Samurai Kitchen and The Notebook
 * design, the four until then, keep their pages and hang with everything
 * else on /about.
 *
 * VOICE and FACTS as src/data/projects.ts: plain words for the average
 * person, nothing widened. The facts are the Arcade's and Kiru's own pages
 * (src/app/games, src/app/kiru) and DESIGN.md's section on Kiru.
 */

export type ShowcaseLink = {
  label: string;
  href: string;
  /** A page served as a static file from public/, so a plain link. */
  static?: boolean;
};

export type Showcase = {
  slug: string;
  name: string;
  eyebrow: string;
  summary: string;
  /** What it is, on its plaque on the wall. */
  kind: string;
  /** The page the pictures open. */
  href: string;
  image: string;
  imageAlt: string;
  /** A second picture beside the first, in a device of its own. */
  side?: {
    image: string;
    imageAlt: string;
    kind: 'Website' | 'Game' | 'App';
    href: string;
  };
  /** One button per way in; the first is the main one. */
  actions: ShowcaseLink[];
  /** The link under the buttons. */
  more: ShowcaseLink;
};

/** The four, by slug, in order. A slug not in SHOWCASE is a project's. */
export const FEATURED_SLUGS = ['arcade', 'kiru', 'broom-blade', 'voltic'];

/** The two of the four that are parts of this site rather than projects. */
export const SHOWCASE: Showcase[] = [
  {
    slug: 'arcade',
    name: 'The Arcade',
    eyebrow: 'On this site · free to play',
    summary:
      'My games, all free and all in your browser. Kiru’s games come first, then Pip’s Broom & Blade Arcade, then an archive.',
    kind: 'Games',
    href: '/games',
    image: '/images/websites/arcade.webp',
    imageAlt:
      'The Arcade: a neon Arcade sign under paper lanterns, a glowing 遊 sign, Kiru, and Kiru’s Rooftop Run, which plays right on the page.',
    side: {
      image: '/images/apps/lantern-night-1.webp',
      imageAlt: 'Kiru’s Lantern Night, the first game in the Arcade.',
      kind: 'Game',
      href: '/games/lantern-night',
    },
    actions: [
      { label: 'Go to the Arcade', href: '/games' },
      {
        label: 'Pip’s Broom & Blade Arcade',
        href: '/games#broom-blade-arcade',
      },
    ],
    more: { label: 'See all the games', href: '#games' },
  },
  {
    slug: 'kiru',
    name: 'Kiru',
    eyebrow: 'The house ninja · on every page',
    summary:
      'The ninja who lives on this site, drawn in code. Every page has him doing its job, he stars in my games, and he has a cast of his own.',
    kind: 'Character',
    href: '/kiru',
    image: '/images/websites/kiru.webp',
    imageAlt:
      'The Meet Kiru page: Kiru in his red headband in front of a red sun, beside his name, 切る, brushed in ink.',
    side: {
      image: '/images/websites/kiru-cast.webp',
      imageAlt:
        'The Neo Dojo Cast page: a character model sheet of Kiru and the crew drawn on his rig.',
      kind: 'Website',
      href: '/kiru/cast',
    },
    actions: [
      { label: 'Meet Kiru', href: '/kiru' },
      { label: 'Meet his crew', href: '/kiru/cast', static: true },
    ],
    more: {
      label: 'His story’s cast',
      href: '/kiru/path-not-taken-cast',
      static: true,
    },
  },
];
