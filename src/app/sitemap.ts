import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';
import { apps, BROOM_BLADE_ARCADE_SLUGS } from '@/data/apps';
import { projects, PROJECT_APP_SLUGS } from '@/data/projects';
import { marketStormReports } from '@/data/marketStorm';

const BASE = 'https://smartdisruptions.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/content`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/market-storm`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/built`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/games`, changeFrequency: 'monthly', priority: 0.4 },
    {
      url: `${BASE}/games/lantern-night`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/games/night-parade`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/games/tokaido-run`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/games/neo-dojo-survivors`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE}/games/path-not-taken`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    // The Broom & Blade Arcade's five machines.
    ...BROOM_BLADE_ARCADE_SLUGS.map((slug) => ({
      url: `${BASE}/games/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })),
    { url: `${BASE}/games/archive`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/kiru`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.1 },
  ];

  const posts: MetadataRoute.Sitemap = getPublishedPosts().map((entry) => ({
    url: `${BASE}/content/${entry.slug}`,
    lastModified: new Date(entry.publishDate),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const reports: MetadataRoute.Sitemap = marketStormReports.map((report) => ({
    url: `${BASE}/market-storm/${report.slug}`,
    lastModified: new Date(report.publishDate),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // One entry per page that actually exists under /built: the project pages,
  // plus every app that is not already covered by one.
  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE}/built/${project.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const appPages: MetadataRoute.Sitemap = apps
    .filter(
      (app) =>
        !PROJECT_APP_SLUGS[app.slug] &&
        !projects.some((p) => p.slug === app.slug)
    )
    .map((app) => ({
      url: `${BASE}/built/${app.slug}`,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

  return [...staticRoutes, ...posts, ...reports, ...projectPages, ...appPages];
}
