'use client';

import { useState } from 'react';
import Link from 'next/link';
import { contentEntries, getContentCategories } from '@/data/content';
import { SectionContainer, Card, Badge } from '@/components/ui';

export default function ContentList() {
  const categories = getContentCategories();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? contentEntries.filter((entry) => entry.category === activeCategory)
    : contentEntries;

  return (
    <SectionContainer className="py-20">
      {/* Page Header */}
      <div className="text-center">
        <p className="font-mono-accent text-sm text-accent/70">
          {'// Writing'}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
          Writing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          Honest build breakdowns and field notes — the timeline, the method,
          and the parts worth copying. Only what I&apos;ve actually shipped and
          learned.
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

      {/* Content Cards */}
      {filtered.length > 0 ? (
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {filtered.map((entry) => (
            <Link key={entry.slug} href={`/content/${entry.slug}`}>
              <Card hover className="flex h-full flex-col">
                {/* Category + Date */}
                <div className="flex items-center justify-between">
                  <Badge variant="accent">{entry.category}</Badge>
                  <span className="text-xs text-text-secondary">
                    {entry.publishDate}
                  </span>
                </div>

                {/* Title */}
                <h2 className="mt-4 text-lg font-semibold text-text-primary">
                  {entry.title}
                </h2>

                {/* Excerpt */}
                <p className="mt-2 flex-1 text-sm text-text-secondary">
                  {entry.excerpt}
                </p>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Link hint */}
                <span className="mt-4 inline-block text-sm font-medium text-accent">
                  Read More &rarr;
                </span>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center">
          <p className="text-lg text-text-secondary">
            No entries in this category yet. Check back soon.
          </p>
        </div>
      )}
    </SectionContainer>
  );
}
