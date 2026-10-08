import type { ComponentType } from 'react';

/**
 * Market Storm articles, by slug.
 *
 * Each article is its own page: its component is everything between the
 * site's nav and footer, built however the article wants. Register it here,
 * and add its listing entry to `marketStormArticles` in
 * src/data/marketStorm.ts so the section index, sitemap, search and share
 * image can find it. The build fails if a listed article has no page here.
 */
export const articlePages: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  'arkg-ai-takeoff': () => import('./arkg-ai-takeoff/Article'),
};
