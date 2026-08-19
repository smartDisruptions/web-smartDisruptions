import type { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/posts';
import { apps } from '@/data/apps';
import { marketStormReports } from '@/data/marketStorm';
import { profiles } from '@/data/evidence';

const BASE = 'https://smartdisruptions.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/content`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/market-storm`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/evidence`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/apps`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/games`, changeFrequency: 'monthly', priority: 0.4 },
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

  const appPages: MetadataRoute.Sitemap = apps.map((app) => ({
    url: `${BASE}/apps/${app.slug}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  // The profile and every case study under it. Generated from the same data
  // the pages render, so a new project cannot ship missing from the sitemap.
  const evidencePages: MetadataRoute.Sitemap = profiles.flatMap((p) => [
    {
      url: `${BASE}/evidence/${p.handle}`,
      lastModified: new Date(p.recordTo),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    ...p.caseStudies.map((c) => ({
      url: `${BASE}/evidence/${p.handle}/${c.slug}`,
      lastModified: new Date(c.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]);

  return [...staticRoutes, ...posts, ...reports, ...appPages, ...evidencePages];
}
