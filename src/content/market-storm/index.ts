import type { ComponentType } from 'react';

/**
 * Market Storm articles, by slug.
 *
 * Each article is its own page: its component is everything between the
 * site's nav and footer, built however the article wants. Register it here,
 * and add its listing entry to `marketStormArticles` in
 * src/data/marketStorm.ts so the section index, sitemap and search can find it.
 * Its card and share images are whatever the article makes; the listing just
 * points at them (`cardImage`, `ogImage`). The build fails if a listed article has no page here.
 */
export const articlePages: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  'rare-earths-ai': () => import('./rare-earths-ai/Article'),
  'arkg-ai-takeoff': () => import('./arkg-ai-takeoff/Article'),
};
