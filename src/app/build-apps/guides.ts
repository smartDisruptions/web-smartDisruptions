/**
 * The app guides shelf on /build-apps.
 *
 * It is empty on purpose: the page went up before the first guide, and it says
 * so rather than showing made-up titles. Every entry here renders as a card on
 * the shelf, in this order, and the empty-shelf note disappears by itself once
 * there is one.
 */
export type Guide = {
  /** The guide's title, as it reads on its own page. */
  title: string;
  /** One plain line: what you build, or what you walk away knowing. */
  line: string;
  /** Where the guide lives, e.g. '/guides/your-first-app'. */
  href: string;
  /** The day it went up, 'YYYY-MM-DD' (Pacific). Shown as "Oct 2026". */
  date: string;
  /** Optional small tag above the title, e.g. 'Field guide'. */
  tag?: string;
};

// JOSH: add an app guide by putting an entry at the TOP of this list (newest
// first), e.g. { title: '…', line: '…', href: '/guides/…', date: '2026-11-02' }.
// Each one becomes a card on the shelf at /build-apps. Then send it to the
// apps list (SubscribeForm source "apps"): that list was promised one email
// per new guide, nothing else.
export const GUIDES: Guide[] = [];
