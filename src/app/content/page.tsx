import { getPublishedPosts, getCategories, toSummary } from '@/lib/posts';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal, Slash } from '@/components/brand/Kanji';
import { formatDate } from '@/lib/format';
import ContentList, { type CardExtras } from './ContentList';
import NewsletterTile from './NewsletterTile';
import { imageSize, readingMinutes } from './post-extras';
import './writing.css';

// Server shell: reads the post store (filesystem, server-only) and hands the
// client list just the card fields. Post bodies stay out of the browser
// bundle — fifteen full articles is ~100KB the index never renders. What a
// card needs from a body (its reading time) and from a hero file (its real
// pixel size) is worked out here, at build time.
export default function ContentIndex() {
  const published = getPublishedPosts();
  const extras: Record<string, CardExtras> = {};
  for (const p of published) {
    const size = imageSize(p.heroImage);
    extras[p.slug] = {
      minutes: readingMinutes(p.body),
      width: size?.width ?? 1200,
      height: size?.height ?? 630,
    };
  }
  const newest = published[0];

  return (
    <div className="wr-index">
      <header className="wr-head">
        {/* 書, "to write" — inks itself in on arrival, then rests behind the
            reading ninja as a watermark. */}
        <Kanji char="書" draw className="sd-watermark wr-head-mark" />
        <div className="wr-head-titles">
          <p className="sd-kicker">Writing</p>
          {/* One cut per word: a Slash is a single line, and on a phone the
              two words stack. */}
          <h1 className="font-display wr-head-title">
            <Slash text="Field" /> <Slash text="notes" delay={0.14} />
          </h1>
        </div>
        <div className="wr-head-kiru" aria-hidden>
          <Kiru pose="read" className="wr-head-ninja" />
        </div>
        <div className="wr-head-sub">
          <p className="font-read wr-head-lead">
            Plain-language guides from things I&apos;ve actually built with AI —
            what mattered, and why.
          </p>
          {newest && (
            <p className="wr-head-count">
              <span>
                {published.length} {published.length === 1 ? 'note' : 'notes'}
              </span>
              <span>newest {formatDate(newest.publishDate)}</span>
            </p>
          )}
        </div>
      </header>

      <ContentList
        posts={published.map(toSummary)}
        categories={getCategories()}
        extras={extras}
        end={<NewsletterTile />}
        seal={<Seal char="新" className="wr-feature-seal" />}
      />
    </div>
  );
}
