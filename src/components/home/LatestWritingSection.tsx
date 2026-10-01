import Link from 'next/link';
import { getPublishedPosts } from '@/lib/posts';
import HeroImage from '@/components/HeroImage';
import Kiru from '@/components/kiru/Kiru';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui';

/**
 * The newest notes. Desktop: the latest as a wide feature beside a stack of
 * four. Phone: a horizontal rail that snaps card to card, the next card
 * peeking so a thumb knows to swipe — how a native app shows "more".
 *
 * Each card's image carries `post-hero-<slug>` as its view-transition name,
 * the same name the post page gives its hero, so tapping a card morphs the
 * image into the article.
 */
export default function LatestWritingSection() {
  const posts = getPublishedPosts().slice(0, 5);
  if (posts.length === 0) return null;
  const [lead, ...rest] = posts;

  return (
    <section aria-labelledby="hm-notes" className="mx-auto max-w-6xl px-5 pt-20 sm:px-6 sm:pt-28">
      <div className="sd-reveal flex items-end justify-between gap-4">
        <div>
          <p className="sd-kicker">Latest</p>
          <h2 id="hm-notes" className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl">
            Notes from the bench
          </h2>
        </div>
        <Kiru pose="read" className="hidden h-28 w-auto shrink-0 sm:block" />
      </div>

      <div className="hm-notes mt-10">
        <Link href={`/content/${lead.slug}`} className="sd-card sd-tilt hm-note-lead group">
          <div className="hm-note-img" style={{ viewTransitionName: `post-hero-${lead.slug}` }}>
            <HeroImage post={lead} className="h-full w-full object-cover" />
          </div>
          <div className="p-5 sm:p-7">
            <p className="text-[0.78rem] font-semibold text-text-secondary">
              <span className="text-pen-ink">{lead.category}</span> · {formatDate(lead.publishDate)}
            </p>
            <h3 className="font-display mt-2 text-2xl leading-tight sm:text-[2rem]">{lead.title}</h3>
            <p className="font-read mt-3 line-clamp-3 text-text-secondary">{lead.excerpt}</p>
          </div>
        </Link>

        <ul className="hm-note-rail" role="list">
          {rest.map((post) => (
            <li key={post.slug}>
              <Link href={`/content/${post.slug}`} className="sd-card hm-note">
                <div className="hm-note-thumb" style={{ viewTransitionName: `post-hero-${post.slug}` }}>
                  <HeroImage post={post} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 p-4">
                  <p className="text-[0.72rem] font-semibold text-text-secondary">{formatDate(post.publishDate)}</p>
                  <h3 className="mt-1 line-clamp-3 text-[1.02rem] leading-snug font-bold">{post.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sd-reveal mt-10">
        <Button variant="secondary" href="/content">
          All the notes
        </Button>
      </div>
    </section>
  );
}
