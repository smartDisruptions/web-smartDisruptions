'use client';

import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import type { PostSummary } from '@/lib/posts';
import HeroImage from '@/components/HeroImage';
import { formatDate } from '@/lib/format';

/** What the server worked out for each card: reading time, hero pixel size. */
export type CardExtras = { minutes: number; width: number; height: number };

const FALLBACK: CardExtras = { minutes: 0, width: 1200, height: 630 };

/**
 * The frame a card's image sits in. Its view-transition name is the one the
 * post page gives its hero, so opening a card morphs this image into the
 * article's hero (and pressing back morphs it home). One name per slug on the
 * page — the featured card and the grid never show the same post.
 */
function Frame({
  post,
  extras,
  priority = false,
  className = '',
}: {
  post: PostSummary;
  extras: CardExtras;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`wr-frame ${className}`.trim()}
      style={{ viewTransitionName: `post-hero-${post.slug}` } as CSSProperties}
    >
      {post.heroImage ? (
        <HeroImage
          post={post}
          priority={priority}
          width={extras.width}
          height={extras.height}
          className="wr-frame-img"
        />
      ) : (
        // A missing image never blocks publishing and never shows a broken
        // frame: a designed block with the category's initial instead.
        <div className="wr-frame-empty" aria-hidden>
          <span className="font-display">{post.category.charAt(0)}</span>
        </div>
      )}
    </div>
  );
}

function Meta({ post, extras }: { post: PostSummary; extras: CardExtras }) {
  return (
    <p className="wr-meta">
      <span className="wr-meta-cat">{post.category}</span>
      <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
      {extras.minutes > 0 && <span>{extras.minutes} min read</span>}
    </p>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="wr-tags" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

/**
 * The cover story: the newest note in the current filter, image beside the
 * words on a wide screen and above them on a phone. `lead` marks the real
 * lead — it carries the 新 ("new") seal by its label and the LCP-priority
 * image.
 */
function FeaturedCard({
  post,
  extras,
  lead,
  label,
  seal,
}: {
  post: PostSummary;
  extras: CardExtras;
  lead: boolean;
  label: string;
  seal?: ReactNode;
}) {
  return (
    <Link
      href={`/content/${post.slug}`}
      transitionTypes={['nav-forward']}
      className="wr-feature sd-card group"
    >
      <div className="wr-feature-media">
        <Frame post={post} extras={extras} priority={lead} />
      </div>
      <div className="wr-feature-body">
        {lead ? (
          // 新, "new" — stamped beside the label, off the image (the hero
          // art carries its own seal).
          <p className="wr-feature-kicker">
            {seal}
            <span>{label}</span>
          </p>
        ) : (
          <p className="sd-kicker">{label}</p>
        )}
        <h2 className="font-display wr-feature-title">{post.title}</h2>
        <p className="font-read wr-feature-excerpt">{post.excerpt}</p>
        <Meta post={post} extras={extras} />
        <Tags tags={post.tags} />
        <span className="wr-cta">
          Read the note <span aria-hidden className="wr-cta-arrow">→</span>
        </span>
      </div>
    </Link>
  );
}

/** A card in the grid: image on top, then the words. */
function GridCard({ post, extras }: { post: PostSummary; extras: CardExtras }) {
  return (
    <Link
      href={`/content/${post.slug}`}
      transitionTypes={['nav-forward']}
      className="wr-card sd-card sd-tilt group"
    >
      <Frame post={post} extras={extras} />
      <div className="wr-card-body">
        <p className="wr-card-cat">{post.category}</p>
        <h2 className="wr-card-title">{post.title}</h2>
        <p className="wr-card-excerpt">{post.excerpt}</p>
        <Tags tags={post.tags} />
        <div className="wr-card-foot">
          <p className="wr-meta">
            <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
            {extras.minutes > 0 && <span>{extras.minutes} min read</span>}
          </p>
          <span aria-hidden className="wr-card-arrow">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ContentList({
  posts,
  categories,
  extras,
  end,
  seal,
}: {
  posts: PostSummary[];
  categories: string[];
  extras: Record<string, CardExtras>;
  /** Server-rendered tile that closes the list (the newsletter). */
  end?: ReactNode;
  /** Server-rendered 新 seal for the cover story. Passed in rather than
   *  imported so the glyph table (~74 KB) never enters the client bundle. */
  seal?: ReactNode;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filterRun = useRef(0);

  const filtered = activeCategory
    ? posts.filter((entry) => entry.category === activeCategory)
    : posts;

  const [featured, ...rest] = filtered;
  const ex = (p: PostSummary) => extras[p.slug] ?? FALLBACK;

  /**
   * Switching a filter is a View Transition where the browser has one: the
   * tab's pill slides to its new tab and every card image that survives the
   * filter glides to its new place (they already carry names for the post
   * morph). The update is flushed synchronously inside the transition so the
   * browser captures the finished list. Without the API, or with reduced
   * motion, it just switches.
   */
  function choose(cat: string | null) {
    if (cat === activeCategory) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('startViewTransition' in document)) {
      setActiveCategory(cat);
      return;
    }
    const root = document.documentElement;
    const run = ++filterRun.current;
    root.classList.add('wr-filtering');
    const vt = document.startViewTransition(() => {
      flushSync(() => setActiveCategory(cat));
    });
    // A quick second tap skips this transition; that's fine, not an error.
    vt.ready.catch(() => {});
    vt.finished.finally(() => {
      // Only the latest run clears the flag — a skipped one finishes early.
      if (run === filterRun.current) root.classList.remove('wr-filtering');
    });
  }

  const tabs: { key: string | null; label: string; count: number }[] = [
    { key: null, label: 'All', count: posts.length },
    ...categories.map((cat) => ({
      key: cat,
      label: cat,
      count: posts.filter((p) => p.category === cat).length,
    })),
  ];

  return (
    <section className="wr-list" aria-label="Notes">
      {/* Category filter — a native segmented control. It scrolls sideways
          (and snaps) when the categories outgrow a phone. */}
      {categories.length > 1 && (
        <div className="wr-tabs-wrap">
          <div className="wr-tabs" role="group" aria-label="Filter notes by category">
            {tabs.map((tab) => {
              const on = activeCategory === tab.key;
              return (
                <button
                  key={tab.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(tab.key)}
                  className="wr-tab"
                  data-on={on || undefined}
                >
                  {on && (
                    <span
                      aria-hidden
                      className="wr-tab-thumb"
                      style={{ viewTransitionName: 'wr-tab-thumb' }}
                    />
                  )}
                  <span className="wr-tab-label">{tab.label}</span>
                  <span className="wr-tab-count">{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {activeCategory
          ? `Showing ${filtered.length} ${filtered.length === 1 ? 'note' : 'notes'} in ${activeCategory}`
          : `Showing all ${filtered.length} notes`}
      </p>

      {/* Content */}
      {filtered.length > 0 ? (
        <div className="wr-stack">
          <FeaturedCard
            post={featured}
            extras={ex(featured)}
            lead
            seal={seal}
            label={activeCategory ? `Newest in ${activeCategory}` : 'Newest note'}
          />
          {/* A grid needs ≥2 items to look intentional; otherwise stay full-width. */}
          {rest.length >= 2 ? (
            <ul className="wr-grid" role="list">
              {rest.map((post) => (
                <li key={post.slug} className="sd-reveal">
                  <GridCard post={post} extras={ex(post)} />
                </li>
              ))}
              {end && <li className="wr-grid-end sd-reveal">{end}</li>}
            </ul>
          ) : (
            <>
              {rest.map((post) => (
                <FeaturedCard
                  key={post.slug}
                  post={post}
                  extras={ex(post)}
                  lead={false}
                  label={post.category}
                />
              ))}
              {end && <div className="sd-reveal">{end}</div>}
            </>
          )}
        </div>
      ) : (
        <div className="wr-empty">
          <p>No entries in this category yet. Check back soon.</p>
        </div>
      )}
    </section>
  );
}
