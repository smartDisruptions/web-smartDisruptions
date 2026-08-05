/**
 * Routes that render as standalone artifacts rather than site pages.
 *
 * The Web Design resume samples each commit to their own visual world — that
 * is the whole point of them. Site chrome sitting on top would undercut the
 * demonstration and, worse, put the Paper palette next to a world chosen to be
 * nothing like it. So Navbar and Footer stand down on these routes and each
 * artifact carries its own way back.
 *
 * Deliberately narrow: it matches one segment below /web-design/resume-sample,
 * so the index page itself keeps the site's chrome and only the artifacts lose it.
 */
export function isArtifactRoute(pathname: string): boolean {
  return /^\/web-design\/resume-sample\/[^/]+\/?$/.test(pathname);
}
