import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedPosts, getPostBySlug } from '@/lib/posts';
import { SectionContainer, Badge, Button } from '@/components/ui';
import ArticleBody from '@/components/ArticleBody';
import HeroImage from '@/components/HeroImage';
import SubscribeForm from '@/components/SubscribeForm';
import ReadingProgress from '@/components/ReadingProgress';
import DirectingDrill from '@/components/DirectingDrill';
import { formatDate } from '@/lib/format';

// In-body interactive slots. A post drops the marker on its own line where the
// component belongs; the body is rendered as markdown either side of it. Posts
// without a marker are unaffected — split() just returns the whole body.
const EMBEDS: Record<string, () => React.ReactElement> = {
  'directing-drill': () => <DirectingDrill />,
};
const EMBED_RE = /^\[\[embed:([a-z-]+)\]\]$/m;

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

  // The two published after this one in the list, wrapping round, so the
  // newest article still offers somewhere to go.
  const all = getPublishedPosts();
  const here = all.findIndex((p) => p.slug === entry.slug);
  const nextUp =
    here === -1
      ? all.filter((p) => p.slug !== entry.slug).slice(0, 2)
      : [all[(here + 1) % all.length], all[(here + 2) % all.length]].filter(
          (p): p is (typeof all)[number] => Boolean(p) && p.slug !== entry.slug
        );

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

  return (
    <SectionContainer className="py-10 sm:py-16">
      {/* Static local data, JSON-encoded; < escaped so content can never
          close the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <ReadingProgress targetId="article-sheet" />

      {/* The printed sheet: a plain page laid on the graph paper, so the grid
          never sits behind a sentence. nb-ruled adds the red margin down the
          left edge, and the left padding is wider than the right to clear it —
          the asymmetry is what a ruled page actually looks like. */}
      <div
        id="article-sheet"
        className="nb-sheet nb-ruled nb-tape mx-auto max-w-3xl px-5 pt-9 pb-12 sm:pt-14 sm:pr-14 sm:pb-16 sm:pl-[4.5rem]"
      >
        {/* Back Navigation */}
        <Link
          href="/content"
          className="font-display inline-flex min-h-11 items-center gap-2 text-2xl text-accent transition-colors hover:text-accent-hover"
        >
          &larr; all notes
        </Link>

        {/* Header */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">{entry.category}</Badge>
            <span className="text-sm text-text-secondary">
              {formatDate(entry.publishDate)} · by Josh Escusa
            </span>
          </div>
          <h1 className="font-display mt-5 text-[2.6rem] text-text-primary sm:text-[3.4rem]">
            {entry.title}
          </h1>
          {entry.excerpt && (
            <p className="font-read mt-4 max-w-[58ch] text-lg leading-[1.6] text-text-secondary italic">
              {entry.excerpt}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Hero Image */}
        {entry.heroImage && (
          <figure className="nb-polaroid nb-tape mt-12 -rotate-[0.8deg] p-2">
            <HeroImage
              post={entry}
              priority
              className="h-auto w-full object-cover"
            />
          </figure>
        )}

        {/* Markdown Body — capped by measure, not container width: body copy
          past ~80 characters per line loses the eye on the return sweep.
          An [[embed:name]] marker splits the body around an interactive
          component, which runs full container width rather than the measure. */}
        {(() => {
          const match = entry.body.match(EMBED_RE);
          const Embed = match ? EMBEDS[match[1]] : undefined;
          if (!match || !Embed) {
            return (
              <ArticleBody className="mt-12 max-w-[62ch]">
                {entry.body}
              </ArticleBody>
            );
          }
          const [before, after] = entry.body.split(match[0]);
          return (
            <>
              <ArticleBody className="mt-12 max-w-[62ch]">{before}</ArticleBody>
              <Embed />
              <ArticleBody className="max-w-[62ch]">{after}</ArticleBody>
            </>
          );
        })()}

        {/* Subscribe — the reader just finished a build story; offer the next one */}
        <div className="nb-index-card mt-16 rotate-[0.5deg] py-7 pr-6 pl-11 sm:pl-14">
          <h2 className="font-display text-4xl text-text-primary">
            want the next build?
          </h2>
          <p className="mt-2 max-w-lg text-sm text-text-secondary">
            One email when I publish a new breakdown — what I built, how, and
            what I learned. No spam, ever.
          </p>
          <SubscribeForm source="post" className="mt-5" />
        </div>

        {/* Back to Writing */}
        <div className="mt-12 border-t border-border pt-10 text-center">
          <Button variant="secondary" href="/content">
            &larr; Back to All Writing
          </Button>
        </div>
      </div>

      {/* Keep reading — two prints pinned under the page. Outside the sheet,
          because this is not part of the article. */}
      {nextUp.length > 0 && (
        <div className="mx-auto mt-14 max-w-3xl">
          <h2 className="font-display nb-underline text-4xl text-text-primary">
            keep reading
          </h2>
          <ul
            className="nb-wall mt-8 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2"
            role="list"
          >
            {nextUp.map((post) => (
              <li key={post.slug} className="h-full">
                <Link
                  href={`/content/${post.slug}`}
                  className="nb-polaroid nb-tape block h-full p-2.5 pb-4"
                >
                  {post.heroImage && (
                    <HeroImage
                      post={post}
                      className="aspect-[40/21] w-full object-cover"
                    />
                  )}
                  <h3 className="font-display mt-3 text-2xl leading-tight text-text-primary">
                    {post.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionContainer>
  );
}
