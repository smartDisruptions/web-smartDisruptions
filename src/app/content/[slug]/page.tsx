import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublishedPosts, getPostBySlug } from '@/lib/posts';
import { SectionContainer, Badge, Button } from '@/components/ui';
import ArticleBody from '@/components/ArticleBody';
import SubscribeForm from '@/components/SubscribeForm';
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
    <SectionContainer className="py-20">
      {/* Static local data, JSON-encoded; < escaped so content can never
          close the script tag. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <div className="mx-auto max-w-2xl">
        {/* Back Navigation */}
        <Link
          href="/content"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          &larr; Back to Writing
        </Link>

        {/* Header */}
        <div className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="accent">{entry.category}</Badge>
            <span className="text-sm text-text-secondary">
              {formatDate(entry.publishDate)} · by Josh Escusa
            </span>
          </div>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-[2.75rem]">
            {entry.title}
          </h1>
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
          <figure className="mt-10 overflow-hidden rounded-xl border border-border">
            <img
              src={entry.heroImage}
              alt={entry.heroImageAlt ?? entry.title}
              decoding="async"
              fetchPriority="high"
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
        <div className="mt-16 rounded-xl border border-border bg-accent/[0.05] p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Get the next build in your inbox
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
    </SectionContainer>
  );
}
