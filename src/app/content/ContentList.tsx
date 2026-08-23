'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PostSummary } from '@/lib/posts';
import { SectionContainer, Card, Badge } from '@/components/ui';
import HeroImage from '@/components/HeroImage';
import { formatDate } from '@/lib/format';

/**
 * Post thumbnail. Uses the post's heroImage when present, and falls back to
 * a designed paper block with the category initial — so a missing image
 * never blocks publishing and the layout never shows a broken frame.
 */
function Thumb({
  post,
  className = '',
}: {
  post: PostSummary;
  className?: string;
}) {
  if (post.heroImage) {
    return (
      <HeroImage post={post} className={`h-full w-full object-cover ${className}`.trim()} />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-elevated">
      <span className="font-display text-6xl font-semibold text-accent/25">
        {post.category.charAt(0)}
      </span>
    </div>
  );
}

/** Full-width lead card: image beside the copy on desktop, stacked on mobile. */
function FeaturedCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/content/${post.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_10px_30px_-12px_var(--sd-card-shadow)] sm:flex sm:items-center">
        {/* Holds the hero's own 40:21 at every width. This used to stretch to
            the card's height, which made the frame far narrower than the source
            and let object-cover crop the sides — on a hero whose words start
            68px from the edge, that clipped the first letter of every line. */}
        <div className="aspect-[40/21] overflow-hidden sm:w-2/5 sm:shrink-0">
          <Thumb
            post={post}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="accent">{post.category}</Badge>
            <span className="text-xs text-text-secondary">
              {formatDate(post.publishDate)}
            </span>
          </div>
          <h2 className="font-display mt-4 text-2xl font-semibold leading-tight tracking-tight text-text-primary transition-colors group-hover:text-accent sm:text-3xl">
            {post.title}
          </h2>
          <p className="mt-3 line-clamp-3 flex-1 text-text-secondary">
            {post.excerpt}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="mt-5 inline-block text-sm font-medium text-accent">
            Read More &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Compact card used once there are enough posts to fill a grid. */
function GridCard({ post }: { post: PostSummary }) {
  return (
    <Link href={`/content/${post.slug}`} className="group block h-full">
      <Card hover className="flex h-full flex-col overflow-hidden !p-0">
        <div className="aspect-[16/9] overflow-hidden">
          <Thumb
            post={post}
            className="transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="accent">{post.category}</Badge>
            <span className="text-xs text-text-secondary">
              {formatDate(post.publishDate)}
            </span>
          </div>
          <h2 className="font-display mt-3 text-lg font-semibold text-text-primary transition-colors group-hover:text-accent">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 flex-1 text-sm text-text-secondary">
            {post.excerpt}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="mt-4 inline-block text-sm font-medium text-accent">
            Read More &rarr;
          </span>
        </div>
      </Card>
    </Link>
  );
}

export default function ContentList({
  posts,
  categories,
}: {
  posts: PostSummary[];
  categories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? posts.filter((entry) => entry.category === activeCategory)
    : posts;

  const [featured, ...rest] = filtered;

  return (
    <SectionContainer className="py-20">
      {/* Page Header */}
      <div className="text-center">
        <p className="font-mono-accent text-accent">Writing</p>
        <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
          Field notes
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
          Plain-language guides from things I&apos;ve actually built with AI —
          what mattered, and why.
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

      {/* Content */}
      {filtered.length > 0 ? (
        <div className="mx-auto mt-12 max-w-5xl space-y-8">
          <FeaturedCard post={featured} />
          {/* A grid needs ≥2 items to look intentional; otherwise stay full-width. */}
          {rest.length >= 2 ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {rest.map((post) => (
                <GridCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            rest.map((post) => <FeaturedCard key={post.slug} post={post} />)
          )}
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
