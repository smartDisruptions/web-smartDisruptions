import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Page changes run through the View Transitions API (React's
   * <ViewTransition> in the root layout): the page cross-fades and rises like
   * an app pushing a screen, the tab pill and the nav ink glide to their new
   * place. Browsers without the API navigate exactly as before.
   */
  experimental: {
    viewTransition: true,
  },
  /**
   * The service worker must never be cached, or a fix to it could take days
   * to reach people. See public/sw.js.
   */
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  /**
   * Past designs of this site live in public/archive/<name>, each a static
   * export of its own commit (scripts/archive-site.mjs). The export names a
   * page content.html; these give it the address it had. Real files — the old
   * scripts, styles, images and the .txt data the old router fetches — are
   * served before any rewrite runs.
   */
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: '/archive/:name', destination: '/archive/:name/index.html' },
        { source: '/archive/:name/:a', destination: '/archive/:name/:a.html' },
        {
          source: '/archive/:name/:a/:b',
          destination: '/archive/:name/:a/:b.html',
        },
        // Kiru's Lantern Night: a single-file game in public/games, played at
        // the address its share card and canonical link give.
        {
          source: '/games/lantern-night',
          destination: '/games/lantern-night/index.html',
        },
        // Kiru's Night Parade: the same, one file in public/games.
        {
          source: '/games/night-parade',
          destination: '/games/night-parade/index.html',
        },
      ],
      fallback: [],
    };
  },
  /**
   * /apps and /websites were folded into /built on 2026-09-20. These keep every
   * old address working — search results, anything Josh has shared, and the
   * links inside already-published articles.
   *
   * Order matters: the two named rules have to come before the /apps/:slug
   * catch-all, because Next takes the first match.
   */
  async redirects() {
    return [
      // The Pembroke File's app slug does not match its project slug.
      {
        source: '/apps/field-office',
        destination: '/built/pembroke-file',
        permanent: true,
      },
      {
        source: '/built/field-office',
        destination: '/built/pembroke-file',
        permanent: true,
      },
      { source: '/apps', destination: '/built', permanent: true },
      { source: '/apps/:slug', destination: '/built/:slug', permanent: true },
      { source: '/websites', destination: '/built', permanent: true },
    ];
  },
};

export default nextConfig;
