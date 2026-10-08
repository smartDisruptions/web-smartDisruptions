/**
 * The guides on /build-websites, one per entry. The page draws them as panes
 * on a shoji wall, newest first, and fills out the last row with blank panes
 * so the wall always looks finished.
 *
 * JOSH: this list is empty on purpose. Nothing is written yet, and the page
 * says so instead of showing made-up titles. To add a guide, publish it as
 * usual (a post in src/content/posts, or a page under /guides) and append it
 * here:
 *
 *   {
 *     href: '/content/my-first-website',
 *     title: 'My first website, start to live address',
 *     summary: 'One or two plain sentences about what it covers.',
 *     date: '2026-11-02', // the day it went live, YYYY-MM-DD (Pacific)
 *   },
 *
 * One entry per guide. Adding one here only changes this page: it doesn't
 * email the websites list (SubscribeForm source="websites") by itself.
 */
export type Guide = {
  /** Where the guide lives on this site, e.g. '/content/my-first-website'. */
  href: string;
  title: string;
  /** One or two sentences, shown under the title. */
  summary: string;
  /** The day it went live: YYYY-MM-DD. */
  date: string;
};

export const GUIDES: Guide[] = [];
