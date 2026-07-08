import Link from 'next/link';
import { contentEntries } from '@/data/content';
import { SectionContainer, Badge, Button, RevealOnScroll } from '@/components/ui';

export default function LatestWritingSection() {
  const posts = contentEntries.slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <SectionContainer id="latest-writing" className="bg-surface">
      <div className="mx-auto max-w-3xl">
        <RevealOnScroll>
          <p className="font-mono-accent text-accent">Writing</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Latest from the notebook
          </h2>
          <p className="mt-3 max-w-2xl text-text-secondary">
            The main thing here — build breakdowns and field notes, only what
            I&apos;ve actually shipped and learned.
          </p>
        </RevealOnScroll>

        <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {posts.map((post) => (
            <RevealOnScroll key={post.slug}>
              <Link
                href={`/content/${post.slug}`}
                className="group block py-7 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="accent">{post.category}</Badge>
                  <span className="text-xs text-text-secondary">
                    {post.publishDate}
                  </span>
                </div>
                <h3 className="font-display mt-3 text-xl font-semibold text-text-primary transition-colors group-hover:text-accent sm:text-2xl">
                  {post.title}
                </h3>
                <p className="mt-2 text-text-secondary">{post.excerpt}</p>
                <span className="mt-3 inline-block text-sm font-medium text-accent">
                  Read it &rarr;
                </span>
              </Link>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll>
          <div className="mt-10">
            <Button variant="secondary" href="/content">
              All writing
            </Button>
          </div>
        </RevealOnScroll>
      </div>
    </SectionContainer>
  );
}
