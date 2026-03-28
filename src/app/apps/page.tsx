'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apps, getAppCategories } from '@/data/apps';
import { SectionContainer, Card, Badge } from '@/components/ui';

export default function AppsGallery() {
  const categories = getAppCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? apps.filter((app) => app.category === activeCategory)
    : apps;

  return (
    <SectionContainer className="py-20">
      {/* Page Header */}
      <div className="text-center">
        <p className="font-mono-accent text-sm text-accent/70">// Showcase</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Apps Built With The System
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          Real applications — from idea to deployment. Each one is proof that
          the system works.
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
                : 'border border-white/10 text-text-secondary hover:text-text-primary'
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
                  : 'border border-white/10 text-text-secondary hover:text-text-primary'
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
          {filtered.map((app) => (
            <Link key={app.slug} href={`/apps/${app.slug}`}>
              <Card hover className="flex h-full flex-col">
                {/* Thumbnail */}
                <div className="overflow-hidden rounded-lg">
                  <img
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
                  <Badge
                    variant={app.status === 'live' ? 'accent' : 'secondary'}
                  >
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
                  <span className="text-sm font-medium text-accent">
                    View Details &rarr;
                  </span>
                  {app.liveUrl && (
                    <a
                      href={app.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-medium text-text-secondary transition-colors hover:text-accent"
                    >
                      Try Demo &rarr;
                    </a>
                  )}
                </div>
              </Card>
            </Link>
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
