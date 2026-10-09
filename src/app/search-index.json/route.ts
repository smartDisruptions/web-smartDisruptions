import { getPublishedPosts } from '@/lib/posts';
import { marketStormReports } from '@/data/marketStorm';
import { projects } from '@/data/projects';
import { apps, GAME_SLUGS } from '@/data/apps';
import { builtHref } from '@/data/projects';

/**
 * Everything the command palette (⌘K) can find, baked at build time into one
 * static JSON file. The palette fetches it on first open, so a visitor who
 * never searches never downloads it. Only published posts are listed — the
 * same gate the rest of the site uses.
 */
export const dynamic = 'force-static';

export type SearchItem = {
  t: string; // title
  u: string; // url
  k: 'Page' | 'Note' | 'Market Storm' | 'Built' | 'Arcade';
  d?: string; // one line of description
  x?: string; // extra words to match on, never shown
};

export function GET() {
  // The sections first, in the nav's order: with an empty query the palette
  // lists every Page before anything else, so this is its table of contents.
  const items: SearchItem[] = [
    { t: 'Home', u: '/', k: 'Page', d: 'Start here' },
    {
      t: 'Writing',
      u: '/content',
      k: 'Page',
      d: 'Field notes from the bench, and Market Storm',
      x: 'notes articles posts market storm',
    },
    {
      t: 'Learn to build, together',
      u: '/learn',
      k: 'Page',
      d: 'Websites, apps and games, in plain words',
      x: 'learn newsletter email subscribe beginner course',
    },
    {
      t: 'Build websites',
      u: '/build-websites',
      k: 'Page',
      d: 'Learn to build websites with AI, in plain words',
      x: 'learn web site html css design newsletter email',
    },
    {
      t: 'Build apps',
      u: '/build-apps',
      k: 'Page',
      d: 'Learn to build apps with AI, in plain words',
      x: 'learn app mobile phone tool newsletter email',
    },
    {
      t: 'Build games',
      u: '/build-games',
      k: 'Page',
      d: 'Learn to build games with AI, in plain words',
      x: 'learn game games play canvas newsletter email',
    },
    {
      t: 'What I Built',
      u: '/built',
      k: 'Page',
      d: 'Websites, apps and tools, live',
    },
    { t: 'Arcade', u: '/games', k: 'Page', d: 'Games you can play right now' },
    {
      t: 'Market Storm archive',
      u: '/market-storm',
      k: 'Page',
      d: 'Every report: the AI market, read by a research method',
      x: 'storm reports earnings research thesis',
    },
    {
      t: 'About',
      u: '/about',
      k: 'Page',
      d: 'The work: what I built, with receipts',
      x: 'about builds receipts work',
    },
    {
      t: 'About Josh',
      u: '/about-me',
      k: 'Page',
      d: 'Who builds this, and how AI helps',
      x: 'about me josh story path skills',
    },
    {
      t: 'Privacy',
      u: '/privacy',
      k: 'Page',
      d: 'What this site collects (very little)',
    },
    {
      t: 'Meet Kiru',
      u: '/kiru',
      k: 'Page',
      d: 'The ninja who lives on this site',
      x: 'mascot ninja',
    },
    {
      t: 'Claude Code subscription vs API credits',
      u: '/guides/claude-code-subscription-vs-api',
      k: 'Page',
      d: 'Most games never need the API',
      x: 'pricing plan pro max api tokens cost subscription guide',
    },
  ];

  for (const p of getPublishedPosts()) {
    items.push({
      t: p.title,
      u: `/content/${p.slug}`,
      k: 'Note',
      d: p.excerpt,
      x: [p.category, ...p.tags].join(' '),
    });
  }
  for (const r of marketStormReports) {
    items.push({
      t: r.title,
      u: `/market-storm/${r.slug}`,
      k: 'Market Storm',
      d: r.excerpt,
      x: [r.ticker, r.company, ...(r.tags ?? [])].filter(Boolean).join(' '),
    });
  }
  for (const p of projects) {
    items.push({ t: p.name, u: `/built/${p.slug}`, k: 'Built', d: p.summary });
  }
  const projectHrefs = new Set(projects.map((p) => `/built/${p.slug}`));
  for (const a of apps) {
    const href = builtHref(a.slug);
    if (projectHrefs.has(href)) continue;
    items.push({
      t: a.name,
      u: href,
      k: (GAME_SLUGS as readonly string[]).includes(a.slug)
        ? 'Arcade'
        : 'Built',
      d: a.description,
      x: `${a.category} ${a.techStack.join(' ')}`,
    });
  }

  return Response.json(items, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
