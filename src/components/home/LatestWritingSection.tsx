import Link from 'next/link';
import { getPublishedPosts } from '@/lib/posts';
import {
  SectionContainer,
  Badge,
  Button,
  RevealOnScroll,
} from '@/components/ui';
import HeroImage from '@/components/HeroImage';
import { formatDate } from '@/lib/format';

export default function LatestWritingSection() {
  const posts = getPublishedPosts().slice(0, 3);

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

        <div className="mt-10 divide-y divide-border border-y border-border">
          {posts.map((post) => (
            <RevealOnScroll key={post.slug}>
              <Link
                href={`/content/${post.slug}`}
                className="group block py-7 transition-colors sm:flex sm:gap-6"
              >
                {post.heroImage && (
                  <div className="mb-4 shrink-0 self-start overflow-hidden rounded-lg border border-border sm:mb-0 sm:w-44">
                    {/* 40:21 is the hero's own ratio — a fixed height here
                        cropped the sides and clipped the first letter of every
                        line. */}
                    <HeroImage
                      post={post}
                      className="aspect-[40/21] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="accent">{post.category}</Badge>
                    <span className="text-xs text-text-secondary">
                      {formatDate(post.publishDate)}
                    </span>
                  </div>
                  <h3 className="font-display mt-3 text-xl font-semibold text-text-primary transition-colors group-hover:text-accent sm:text-2xl">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-text-secondary">{post.excerpt}</p>
                  <span className="mt-3 inline-block text-sm font-medium text-accent">
                    Read it &rarr;
                  </span>
                </div>
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
