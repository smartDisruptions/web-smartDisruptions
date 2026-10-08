/**
 * The game guides on /build-games, newest first. Empty until the first one
 * is written: the page says so, and draws three empty slots on its shelf.
 *
 * JOSH: to add a guide, put an entry at the top of GUIDES. It renders as a
 * card in the next slot (slot 01 first), and the empty slots after it move
 * down; past three guides the shelf just grows. For example:
 *
 *   {
 *     href: '/guides/my-first-game',
 *     title: 'The first game I built with Claude',
 *     line: 'One sentence on what you build and what it took.',
 *     date: '2026-11-02',
 *   },
 *
 * `date` is the day it went live (YYYY-MM-DD, Pacific). Nothing else on the
 * page needs to change.
 */
export type Guide = {
  /** Where the guide lives on the site, e.g. '/guides/my-first-game'. */
  href: string;
  /** The guide's title, sentence case. */
  title: string;
  /** One line: what you build, and what it took. */
  line: string;
  /** YYYY-MM-DD. */
  date: string;
};

export const GUIDES: Guide[] = [];
