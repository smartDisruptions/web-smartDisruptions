import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getFieldNotes, type FieldNote } from '@/lib/fieldNotes';
import HeroImage from '@/components/HeroImage';
import Kiru from '@/components/kiru/Kiru';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui';
import './showcase.css';

/** A note's card image, in the shape HeroImage takes. */
function heroOf(note: FieldNote) {
  return {
    heroImage: note.image?.src,
    heroImageLight: note.image?.srcLight,
    heroImageAlt: note.image?.alt,
    title: note.title,
  };
}

/**
 * Only a post page names its hero `post-hero-<slug>`, so only a post's card
 * may carry that name: on the guide there is nothing for it to morph into.
 */
function morph(note: FieldNote): CSSProperties | undefined {
  return note.kind === 'post' ? { viewTransitionName: `post-hero-${note.slug}` } : undefined;
}

/**
 * The newest notes, in the order /content lists them: the pinned field guide
 * leads, then the newest posts (src/lib/fieldNotes.ts, so the home page and
 * the Writing page always agree). Desktop: the lead as a wide feature beside
 * a stack of four. Phone: a horizontal rail that snaps card to card, the next
 * card peeking so a thumb knows to swipe — how a native app shows "more".
 *
 * Each post card's image carries `post-hero-<slug>` as its view-transition
 * name, the same name the post page gives its hero, so tapping a card morphs
 * the image into the article.
 */
export default function LatestWritingSection() {
  const notes = getFieldNotes().slice(0, 5);
  if (notes.length === 0) return null;
  const [lead, ...rest] = notes;

  return (
    <section aria-labelledby="hm-notes" className="sd-defer mx-auto max-w-6xl px-5 pt-20 sm:px-6 sm:pt-28" style={{ containIntrinsicSize: 'auto 900px' }}>
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
        <Link href={lead.href} className="sd-card sd-tilt hm-note-lead group">
          <div className="hm-note-img" style={morph(lead)}>
            <HeroImage post={heroOf(lead)} className="h-full w-full object-cover" />
          </div>
          <div className="p-5 sm:p-7">
            <p className="text-[0.78rem] font-semibold text-text-secondary">
              <span className="text-pen-ink">{lead.category}</span> · {formatDate(lead.date)}
            </p>
            <h3 className="font-display mt-2 text-2xl leading-tight sm:text-[2rem]">{lead.title}</h3>
            <p className="font-read mt-3 line-clamp-3 text-text-secondary">{lead.excerpt}</p>
          </div>
        </Link>

        <ul className="hm-note-rail" role="list">
          {rest.map((note) => (
            <li key={note.slug}>
              <Link href={note.href} className="sd-card hm-note">
                <div className="hm-note-thumb" style={morph(note)}>
                  <HeroImage post={heroOf(note)} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 p-4">
                  <p className="text-[0.72rem] font-semibold text-text-secondary">{formatDate(note.date)}</p>
                  <h3 className="mt-1 line-clamp-3 text-[1.02rem] leading-snug font-bold">{note.title}</h3>
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
