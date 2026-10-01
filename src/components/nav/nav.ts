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
  { href: '/market-storm', label: 'Market Storm', short: 'Storm', tab: true },
  { href: '/built', label: 'What I Built', short: 'Built', tab: true },
  { href: '/games', label: 'Arcade', short: 'Arcade', tab: true },
  { href: '/about', label: 'About', short: 'About', tab: false },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Which way a tab change moves, so the page can slide the matching way. */
export function direction(pathname: string, href: string): string[] {
  const from = NAV.findIndex((n) => isActive(pathname, n.href));
  const to = NAV.findIndex((n) => n.href === href);
  if (from < 0 || to < 0 || from === to) return [];
  return [to > from ? 'nav-forward' : 'nav-back'];
}
