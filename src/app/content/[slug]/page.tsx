import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedPosts, getPostBySlug, type Post } from '@/lib/posts';
import ArticleBody from '@/components/ArticleBody';
import HeroImage from '@/components/HeroImage';
import SubscribeForm from '@/components/SubscribeForm';
import ReadingProgress from '@/components/ReadingProgress';
import DirectingDrill from '@/components/DirectingDrill';
import Kiru from '@/components/kiru/Kiru';
import Kanji from '@/components/brand/Kanji';
import MorphLink from '@/components/writing/MorphLink';
import { formatDate } from '@/lib/format';
import { imageSize, readingMinutes } from '../post-extras';
import '../writing.css';

// In-body interactive slots. A post drops the marker on its own line where the
// component belongs; the body is rendered as markdown either side of it. Posts
// without a marker are unaffected — split() just returns the whole body.
const EMBEDS: Record<string, () => React.ReactElement> = {
  'directing-drill': () => <DirectingDrill />,
};
const EMBED_RE = /^\[\[embed:([a-z-]+)\]\]$/m;

// Every real page is known at build time (publishing is a rebuild), so an
// unknown one is a plain static 404 rather than an on-demand render that
// Next can only finish in the browser.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedPosts().map((entry) => ({ slug: entry.slug }));
}

// Per-post social metadata so a shared post link shows THIS post's title,
// excerpt, and (if it has one) hero image — not the generic site card.
// Falls back to the site-wide opengraph-image when there's no hero image.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getPostBySlug(slug);
  if (!entry) return {};

  return {
    title: `${entry.title} — SmartDisruptions`,
    description: entry.excerpt,
    alternates: { canonical: `/content/${entry.slug}` },
    openGraph: {
      title: entry.title,
      description: entry.excerpt,
      type: 'article',
      url: `/content/${entry.slug}`,
      // article:published_time + article:author (fixes the "no author / no
      // publish date" warning in social validators) + article:tag.
      publishedTime: new Date(entry.publishDate).toISOString(),
      authors: ['Josh Escusa'],
      tags: entry.tags,
      // Prefer the title-baked social card; fall back to the on-page hero.
      ...((entry.ogImage ?? entry.heroImage)
        ? { images: [{ url: (entry.ogImage ?? entry.heroImage) as string }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: entry.title,
      description: entry.excerpt,
    },
  };
}

/** One of the two "keep reading" prints under the article. */
type Neighbour = { post: Post; label: string; dir: 'older' | 'newer' | 'more' };

/**
 * Where to go next: the note published just before this one and the one just
 * after, so the archive reads in order in both directions. At either end of
 * the archive the empty side is filled from the list instead, so every note —
 * the newest and the oldest — still offers two. Only published posts, always.
 */
function neighbours(all: Post[], slug: string): Neighbour[] {
  const here = all.findIndex((p) => p.slug === slug);
  if (here === -1) {
    return all
      .filter((p) => p.slug !== slug)
      .slice(0, 2)
      .map((post) => ({ post, label: 'Keep reading', dir: 'more' as const }));
  }
  const older = all[here + 1];
  const newer = all[here - 1];
  const out: Neighbour[] = [];
  if (older) out.push({ post: older, label: 'Older note', dir: 'older' });
  else if (here !== 0 && all[0]) out.push({ post: all[0], label: 'Newest note', dir: 'more' });
  if (newer) out.push({ post: newer, label: 'Newer note', dir: 'newer' });
  else if (all[here + 2]) out.push({ post: all[here + 2], label: 'Keep reading', dir: 'more' });
  // Never the same post twice, never this one.
  const seen = new Set<string>([slug]);
  return out.filter((n) => (seen.has(n.post.slug) ? false : (seen.add(n.post.slug), true)));
}

export default async function ContentDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getPostBySlug(slug);

  if (!entry) {
    notFound();
  }

  const all = getPublishedPosts();
  const nextUp = neighbours(all, entry.slug);
  const minutes = readingMinutes(entry.body);
  const hero = imageSize(entry.heroImage) ?? { width: 1200, height: 630 };

  // Article structured data — the named author + publish date + large image
  // signals Google Discover and search use to treat this as original,
  // experience-led content.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entry.title,
    description: entry.excerpt,
    datePublished: new Date(entry.publishDate).toISOString(),
    author: {
      '@type': 'Person',
      name: 'Josh Escusa',
      url: 'https://smartdisruptions.com',
    },
    ...((entry.ogImage ?? entry.heroImage)
      ? {
          image: [
            `https://smartdisruptions.com${entry.ogImage ?? entry.heroImage}`,
          ],
        }
      : {}),
    mainEntityOfPage: `https://smartdisruptions.com/content/${entry.slug}`,
  };

  // Markdown body — capped by measure, not container width: body copy past
  // ~80 characters per line loses the eye on the return sweep. An
  // [[embed:name]] marker splits the body around an interactive component,
  // which runs the full width of the sheet rather than the measure.
  const match = entry.body.match(EMBED_RE);
  const Embed = match ? EMBEDS[match[1]] : undefined;
  const [before, after] = match && Embed ? entry.body.split(match[0]) : [entry.body, ''];

  return (
    <div className="wr-post">
      {/* Static local data, JSON-encoded; < escaped so content can never
          close the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      {/* Kiru runs along the top as you read — pure CSS, driven by the
          sheet's own scroll timeline. */}
      <ReadingProgress />

      <article className="wr-article">
        <header className="wr-post-head">
          <Kanji char="書" draw className="sd-watermark wr-post-mark" />
          <Link href="/content" transitionTypes={['nav-back']} className="wr-back">
            <span aria-hidden className="wr-back-chev">
              ‹
            </span>
            All writing
          </Link>

          <p className="wr-post-meta">
            <span className="wr-post-cat">{entry.category}</span>
            <time dateTime={entry.publishDate}>{formatDate(entry.publishDate)}</time>
            <span>{minutes} min read</span>
            <span>by Josh Escusa</span>
          </p>
          <h1 className="font-display wr-post-title">{entry.title}</h1>
          {entry.excerpt && <p className="font-read wr-post-dek">{entry.excerpt}</p>}
          {entry.tags.length > 0 && (
            <ul className="wr-tags wr-post-tags" aria-label="Tags">
              {entry.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </header>

        {/* The hero carries the same view-transition name as its card on the
            index, so opening a card morphs the image into place. */}
        {entry.heroImage && (
          <div className="wr-hero-wrap">
            <figure
              className="wr-hero"
              style={{ viewTransitionName: `post-hero-${entry.slug}` } as CSSProperties}
            >
              <HeroImage
                post={entry}
                priority
                width={hero.width}
                height={hero.height}
                className="wr-hero-img"
              />
            </figure>
          </div>
        )}

        <div className="sd-sheet wr-sheet wr-read-target">
          <ArticleBody className="wr-body">{before}</ArticleBody>
          {Embed && (
            <>
              <div className="wr-embed">
                <Embed />
              </div>
              <ArticleBody className="wr-body">{after}</ArticleBody>
            </>
          )}

          {/* The end of the read: Kiru bows. */}
          <div className="wr-fin">
            <span aria-hidden className="wr-fin-rule" />
            <Kiru pose="bow" className="wr-fin-kiru" />
            <p className="font-display wr-fin-thanks">Thanks for reading.</p>
          </div>
        </div>
      </article>

      {/* Subscribe — the reader just finished a build story; offer the next one */}
      <section className="wr-sub" aria-labelledby="wr-sub-title">
        <Kiru pose="sit" className="wr-sub-kiru" />
        <span aria-hidden className="wr-sub-clip">
          <Kanji char="新" className="wr-sub-mark" />
        </span>
        <p className="sd-kicker">The newsletter</p>
        <h2 id="wr-sub-title" className="font-display wr-sub-title">
          Want the next build?
        </h2>
        <p className="wr-sub-copy">
          One email when I publish a new breakdown — what I built, how, and
          what I learned. No spam, ever.
        </p>
        <SubscribeForm source="post" className="mt-5" />
      </section>

      {/* Keep reading — outside the sheet, because this is not part of the
          article. Tapping one morphs its image into that note's hero. */}
      {nextUp.length > 0 && (
        <nav className="wr-more" aria-labelledby="wr-more-title">
          <h2 id="wr-more-title" className="font-display sd-brush-under wr-more-title">
            Keep reading
          </h2>
          <ul className="wr-more-grid" role="list">
            {nextUp.map(({ post, label, dir }) => {
              const size = imageSize(post.heroImage) ?? { width: 1200, height: 630 };
              return (
                <li key={post.slug} className="sd-reveal">
                  <MorphLink
                    href={`/content/${post.slug}`}
                    slug={post.slug}
                    transitionTypes={[dir === 'older' ? 'nav-back' : 'nav-forward']}
                    className="wr-more-card sd-card sd-tilt group"
                    data-dir={dir}
                  >
                    {post.heroImage && (
                      <div className="wr-frame" data-morph>
                        <HeroImage
                          post={post}
                          width={size.width}
                          height={size.height}
                          className="wr-frame-img"
                        />
                      </div>
                    )}
                    <div className="wr-more-body">
                      <p className="wr-more-dir">
                        {dir === 'older' && <span aria-hidden>← </span>}
                        {label}
                        {dir !== 'older' && <span aria-hidden> →</span>}
                      </p>
                      <h3 className="wr-more-name">{post.title}</h3>
                      <p className="wr-meta">
                        <span className="wr-meta-cat">{post.category}</span>
                        <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
                        <span>{readingMinutes(post.body)} min read</span>
                      </p>
                    </div>
                  </MorphLink>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Back to Writing */}
      <div className="wr-out">
        <Link href="/content" transitionTypes={['nav-back']} className="wr-out-btn">
          <span aria-hidden>←</span> Back to all writing
        </Link>
      </div>
    </div>
  );
}
