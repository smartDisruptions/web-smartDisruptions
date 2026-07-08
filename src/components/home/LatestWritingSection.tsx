import Link from 'next/link';
import { contentEntries } from '@/data/content';
import { SectionContainer, Card, Badge, Button, RevealOnScroll } from '@/components/ui';

export default function LatestWritingSection() {
  const posts = contentEntries.slice(0, 2);

  if (posts.length === 0) return null;

  return (
    <SectionContainer id="latest-writing" className="bg-surface bg-grid">
      <RevealOnScroll>
        <div className="text-center">
          <p className="font-mono-accent text-sm text-accent/70">
            {'// Writing'}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-text-primary sm:text-4xl">
            Latest from the notebook
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
            The main thing here. Build breakdowns and field notes — only what
            I&apos;ve actually shipped and learned.
          </p>
        </div>
      </RevealOnScroll>

      <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <RevealOnScroll key={post.slug}>
            <Link href={`/content/${post.slug}`}>
              <Card hover className="flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <Badge variant="accent">{post.category}</Badge>
                  <span className="text-xs text-text-secondary">
                    {post.publishDate}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-text-secondary">
                  {post.excerpt}
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-accent">
                  Read it &rarr;
                </span>
              </Card>
            </Link>
          </RevealOnScroll>
        ))}
      </div>

      <RevealOnScroll>
        <div className="mt-12 text-center">
          <Button variant="secondary" href="/content">
            All writing
          </Button>
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
