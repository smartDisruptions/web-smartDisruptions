/**
 * The site's sections, in tab order. The desktop header, the phone tab bar
 * and the footer all read this list, so a section is added in one place.
 * `tab` marks the five that fit a phone tab bar; About lives on the avatar.
 */
export type NavItem = {
  href: string;
  label: string;
  short: string;
  tab: boolean;
};

export const NAV: NavItem[] = [
  { href: '/', label: 'Home', short: 'Home', tab: true },
  { href: '/content', label: 'Writing', short: 'Writing', tab: true },
  { href: '/learn', label: 'Learn', short: 'Learn', tab: true },
  { href: '/built', label: 'What I Built', short: 'Built', tab: true },
  { href: '/games', label: 'Arcade', short: 'Arcade', tab: true },
  { href: '/about', label: 'About', short: 'About', tab: false },
];

/**
 * Top-level segments that belong to another section's tab. Market Storm left
 * the nav in October 2026 and became a section of the Writing page, so its
 * archive (/market-storm, its pages and every report) lights Writing. The
 * guides are listed among Writing's field notes, so they light it too.
 *
 * About is two pages since October 2026: /about (the work) and /about-me (the
 * person), so About Me lights About. The three Build pages are the three
 * tracks /learn promises ("websites, apps and games"), so they light Learn.
 */
const PARENT: Record<string, string> = {
  'market-storm': '/content',
  guides: '/content',
  'about-me': '/about',
  'build-websites': '/learn',
  'build-apps': '/learn',
  'build-games': '/learn',
};

/**
 * The section a page belongs to ('/' for home), from the root layout's
 * selected segment (`useSelectedLayoutSegment()`). Active-tab styling reads
 * this rather than the address bar: the static 404 served for /content/nope
 * is the 404 page on the server and in the browser alike, so the tabs
 * hydrate without a mismatch.
 */
export function sectionOf(segment: string | null): string {
  if (segment === null) return '/';
  return PARENT[segment] ?? `/${segment}`;
}

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Which way a tab change moves, so the page can slide the matching way. The
 * page you leave counts as its section, so a Market Storm report sits where
 * Writing does: Learn is forward from it, Home is back.
 */
export function direction(pathname: string, href: string): string[] {
  const here = sectionOf(pathname.split('/')[1] || null);
  const from = NAV.findIndex((n) => isActive(here, n.href));
  const to = NAV.findIndex((n) => n.href === href);
  if (from < 0 || to < 0 || from === to) return [];
  return [to > from ? 'nav-forward' : 'nav-back'];
}
