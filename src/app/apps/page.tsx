'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apps, ARCADE_SLUGS, WEBSITE_SLUGS } from '@/data/apps';
import { SectionContainer, Card, Badge } from '@/components/ui';


export default function AppsGallery() {
  // The catalogue is what is left once the games have their own cabinet and
  // the sites have their own write-ups. Every entry still exists in the data,
  // so /apps/[slug] and the sitemap keep resolving — this only controls the
  // grid.
  const elsewhere = [...ARCADE_SLUGS, ...WEBSITE_SLUGS];
  const catalogue = apps.filter((app) => !elsewhere.includes(app.slug));

  // Categories come from what is actually on show, so removing the only
  // Commerce entry does not leave an empty filter behind.
  const categories = Array.from(new Set(catalogue.map((a) => a.category)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? catalogue.filter((app) => app.category === activeCategory)
    : catalogue;

  return (
    <SectionContainer className="py-20">
      {/* Page Header */}
      <div className="text-center">
        <p className="font-mono-accent text-accent">Apps</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          What I&apos;ve built
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          Real apps I&apos;ve shipped and put online — the receipts behind the
          writing. Try any of them live.
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === null
                ? 'bg-accent text-background'
                : 'border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-accent text-background'
                  : 'border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* App Grid */}
      {filtered.length > 0 ? (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* The card is clickable via the stretched "View Details" link — its
              ::after covers the whole card — so "Try Demo" stays a real sibling
              anchor. Nesting it inside a card-wide <Link> is invalid HTML and
              failed hydration on this route. */}
          {filtered.map((app) => (
            <Card
              key={app.slug}
              hover
              className="relative flex h-full flex-col"
            >
              {/* Thumbnail */}
              <div className="overflow-hidden rounded-lg">
                <img
                  loading="lazy"
                  decoding="async"
                  src={app.thumbnailUrl}
                  alt={`${app.name} screenshot`}
                  className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Name + Status */}
              <div className="mt-4 flex items-center gap-2">
                <h2 className="text-lg font-semibold text-text-primary">
                  {app.name}
                </h2>
                <Badge variant={app.status === 'live' ? 'accent' : 'secondary'}>
                  {app.status}
                </Badge>
              </div>

              {/* Description */}
              <p className="mt-2 flex-1 text-sm text-text-secondary">
                {app.description}
              </p>

              {/* Tech Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {app.techStack.map((t) => (
                  <Badge key={t} variant="default">
                    {t}
                  </Badge>
                ))}
              </div>

              {/* Link hints */}
              <div className="mt-4 flex items-center gap-4">
                <Link
                  href={`/apps/${app.slug}`}
                  className="text-sm font-medium text-accent after:absolute after:inset-0 after:content-['']"
                >
                  View Details &rarr;
                </Link>
                {app.liveUrl && (
                  <a
                    href={app.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative text-sm font-medium text-text-secondary transition-colors hover:text-accent"
                  >
                    Try Demo &rarr;
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center">
          <p className="text-lg text-text-secondary">
            No apps found in this category yet. Check back soon.
          </p>
        </div>
      )}
    </SectionContainer>
  );
}
