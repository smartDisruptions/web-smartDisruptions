import type { MetadataRoute } from 'next';
import { contentEntries } from '@/data/content';
import { apps } from '@/data/apps';
import { marketStormReports } from '@/data/marketStorm';

const BASE = 'https://smartdisruptions.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/content`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/market-storm`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/apps`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/games`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.1 },
  ];

  const posts: MetadataRoute.Sitemap = contentEntries.map((entry) => ({
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

  return [...staticRoutes, ...posts, ...reports, ...appPages];
}
