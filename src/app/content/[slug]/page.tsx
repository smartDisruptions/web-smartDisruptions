import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { contentEntries, getContentBySlug } from '@/data/content';
import { SectionContainer, Badge, Button } from '@/components/ui';
import SubscribeForm from '@/components/SubscribeForm';
import { formatDate } from '@/lib/format';

export function generateStaticParams() {
  return contentEntries.map((entry) => ({ slug: entry.slug }));
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
  const entry = getContentBySlug(slug);
  if (!entry) return {};

  return {
    title: `${entry.title} — SmartDisruptions`,
    description: entry.excerpt,
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
      ...(entry.heroImage ? { images: [{ url: entry.heroImage }] } : {}),
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
  const entry = getContentBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <SectionContainer className="py-20">
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
            {formatDate(entry.publishDate)}
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

      {/* Markdown Body */}
      <article className="mt-12 max-w-none">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="font-display mb-4 mt-12 text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.75rem]">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-3 mt-9 text-lg font-semibold text-text-primary">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-5 text-lg leading-8 text-text-primary/85">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-5 ml-5 list-disc space-y-2 text-lg text-text-primary/85">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-5 ml-5 list-decimal space-y-3 text-lg text-text-primary/85">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="leading-8">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold text-text-primary">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-text-primary/90">{children}</em>
            ),
            code: ({ children }) => (
              <code className="rounded bg-fill px-1.5 py-0.5 font-mono text-[0.85em] text-accent-hover">
                {children}
              </code>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-accent underline underline-offset-2 hover:opacity-80"
              >
                {children}
              </a>
            ),
          }}
        >
          {entry.body}
        </ReactMarkdown>
      </article>

        {/* Subscribe — the reader just finished a build story; offer the next one */}
        <div className="mt-16 rounded-xl border border-border bg-accent/[0.05] p-8">
          <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary">
            Get the next build in your inbox
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
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
