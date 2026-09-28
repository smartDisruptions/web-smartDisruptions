import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
