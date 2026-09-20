import Link from 'next/link';
import { getPublishedPosts } from '@/lib/posts';
import { SectionContainer, Button, RevealOnScroll } from '@/components/ui';
import HeroImage from '@/components/HeroImage';
import { formatDate } from '@/lib/format';

export default function LatestWritingSection() {
  const posts = getPublishedPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <SectionContainer id="latest-writing">
      <div className="mx-auto max-w-3xl">
        <RevealOnScroll>
          <h2 className="font-display nb-underline text-4xl text-text-primary sm:text-5xl">
            notes from the bench
          </h2>
        </RevealOnScroll>

        {/* A ruled index card: the red margin line sits left of the list, and
            each post is one ruled row. Titles only — the excerpt lives on the
            Writing page, one tap away. */}
        <RevealOnScroll>
          <ul
            className="nb-index-card mt-10 -rotate-[0.4deg] divide-y divide-[var(--sd-rule)] py-2 pr-4 pl-11 sm:pr-7 sm:pl-14"
            role="list"
          >
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/content/${post.slug}`}
                  className="group flex items-center gap-4 py-5 sm:gap-6"
                >
                  {post.heroImage && (
                    <div className="nb-polaroid hidden w-36 shrink-0 -rotate-2 p-1.5 sm:block">
                      {/* 40:21 is the hero's own ratio — a fixed height here
                          cropped the sides and clipped the first letter of
                          every line. */}
                      <HeroImage
                        post={post}
                        className="aspect-[40/21] w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="font-mono-accent text-text-secondary">
                      {formatDate(post.publishDate)}
                    </span>
                    <h3 className="font-display mt-1 text-2xl text-text-primary transition-colors group-hover:text-accent sm:text-[1.7rem]">
                      {post.title}
                    </h3>
                  </div>
                  <span
                    aria-hidden
                    className="font-display text-3xl text-[var(--sd-pen-ink)] transition-transform group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </RevealOnScroll>

        <RevealOnScroll>
          <div className="mt-10">
            <Button variant="secondary" href="/content">
              All the notes
            </Button>
          </div>
        </RevealOnScroll>
      </div>
    </SectionContainer>
  );
}
