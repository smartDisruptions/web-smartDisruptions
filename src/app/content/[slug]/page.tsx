import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { contentEntries, getContentBySlug } from '@/data/content';
import { SectionContainer, Badge, Button } from '@/components/ui';

export function generateStaticParams() {
  return contentEntries.map((entry) => ({ slug: entry.slug }));
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
            {entry.publishDate}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
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

      {/* Markdown Body */}
      <article className="prose-invert mt-12 max-w-none">
        <ReactMarkdown
          components={{
            h2: ({ children }) => (
              <h2 className="mb-4 mt-10 text-2xl font-bold text-text-primary">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mb-3 mt-8 text-xl font-semibold text-text-primary">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-4 leading-relaxed text-text-secondary">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 ml-6 list-disc space-y-2 text-text-secondary">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-4 ml-6 list-decimal space-y-3 text-text-secondary">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold text-text-primary">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-text-primary/90">{children}</em>
            ),
            code: ({ children }) => (
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
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

      {/* Back to Writing */}
      <div className="mt-16 border-t border-white/10 pt-10 text-center">
        <Button variant="secondary" href="/content">
          &larr; Back to All Writing
        </Button>
      </div>
    </SectionContainer>
  );
}
