import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal, Slash } from '@/components/brand/Kanji';
import HeroImage from '@/components/HeroImage';
import { LEVELS } from '@/components/guide/copy';
import { formatDate } from '@/lib/format';
import {
  getFieldNotes,
  newestNote,
  notePageHref,
  notesOnPage,
  totalNotePages,
  NOTES_PER_PAGE,
  type FieldNote,
} from '@/lib/fieldNotes';
import WritingStorm from '@/components/writing/storm/WritingStorm';
import LevelSweep from './LevelSweep';
import './writing.css';

/*
  The Writing page, one page of it. `/content` renders page 1 and
  `/content/page/[page]` renders the rest, both through this view, so the two
  can never drift apart.

  Page 1: the header, the pinned field guide as the lead, the two newest
  posts, the page numbers, Market Storm (mounted below by its own section),
  and the way into /learn. Pages 2+: a compact header with the page stamped
  beside the title, three notes, the page numbers.

  Everything here is rendered on the server. The only script is one small
  island: LevelSweep lights the guide's level strip once when it comes into
  view. (The header's ninja holds still while the page scrolls, like every
  ninja on the site: SiteFX does that.)
*/

/* ── Small parts ───────────────────────────────────────────────────────── */

/**
 * The frame a note's image sits in. A post's frame carries the view-transition
 * name its article gives the hero, so opening the card morphs the image into
 * the article (and back). The guide's page has no such hero, so its frame
 * stays unnamed.
 */
function Frame({
  note,
  priority = false,
}: {
  note: FieldNote;
  priority?: boolean;
}) {
  const style =
    note.kind === 'post'
      ? ({ viewTransitionName: `post-hero-${note.slug}` } as CSSProperties)
      : undefined;
  return (
    <div className="wr-frame" style={style}>
      {note.image ? (
        <HeroImage
          post={{
            heroImage: note.image.src,
            heroImageLight: note.image.srcLight,
            heroImageAlt: note.image.alt,
            title: note.title,
          }}
          priority={priority}
          width={note.image.width}
          height={note.image.height}
          className="wr-frame-img"
        />
      ) : (
        // A missing image never blocks publishing and never shows a broken
        // frame: a designed block with the category's initial instead.
        <div className="wr-frame-empty" aria-hidden>
          <span className="font-display">{note.category.charAt(0)}</span>
        </div>
      )}
    </div>
  );
}

/** A notebook's entry number. Decoration: the order is already the list's. */
function NoteNo({ no }: { no: number }) {
  return (
    <span className="wr-no" aria-hidden>
      <span className="wr-no-l">No.</span>
      {no}
    </span>
  );
}

function Meta({ note }: { note: FieldNote }) {
  return (
    <p className="wr-meta">
      <time dateTime={note.date}>{formatDate(note.date)}</time>
      <span>{note.readLabel}</span>
    </p>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;
  return (
    <ul className="wr-tags" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

/** "Claude Code: plan or per use? Most games only need the plan" → the
 *  question and its answer, so the answer can carry the highlighter. */
function splitTurn(title: string): [string, string | null] {
  const at = title.indexOf('? ');
  if (at === -1) return [title, null];
  return [title.slice(0, at + 1), title.slice(at + 2)];
}

/* ── The lead ──────────────────────────────────────────────────────────── */

/**
 * The field guide, as the lead of page 1. It is laid out as seven levels, so
 * its card carries a level-select strip: the seven level kanji on a path,
 * which light up in order the first time the strip comes into view and ripple
 * when the card is hovered or focused. The strip is decoration (the guide's
 * own map is the navigation); the card is one link.
 */
function GuideLead({ note, isNewest }: { note: FieldNote; isNewest: boolean }) {
  const [ask, turn] = splitTurn(note.title);
  return (
    <Link
      href={note.href}
      transitionTypes={['nav-forward']}
      className="wr-guide sd-card group"
    >
      <div className="wr-guide-media">
        <Frame note={note} priority />
      </div>

      <div className="wr-guide-head">
        <p className="wr-lead-kicker">
          {isNewest && <Seal char="新" className="wr-seal" />}
          <span>Field guide</span>
          <NoteNo no={note.no} />
        </p>
        <h2 className="font-display wr-guide-title">
          {ask}
          {turn ? (
            <>
              {' '}
              <span className="sd-hl">{turn}</span>
            </>
          ) : null}
        </h2>
        <p className="font-read wr-guide-excerpt">{note.excerpt}</p>
      </div>

      <div className="wr-guide-levels">
        <LevelSweep className="wr-lv">
          <span className="wr-lv-path" />
          <span className="wr-lv-fill" />
          <ol className="wr-lv-track">
            {LEVELS.map((level, i) => (
              <li
                key={level.id}
                className="wr-lv-stop"
                style={{ '--i': i } as CSSProperties}
              >
                <span className="wr-lv-cart">
                  <Kanji char={level.kanji} className="wr-lv-k" />
                </span>
                <span className="wr-lv-n">{level.n}</span>
              </li>
            ))}
          </ol>
        </LevelSweep>
        <p className="wr-lv-cap">
          {LEVELS.length} levels, a card game and a calculator
        </p>
      </div>

      <div className="wr-guide-foot">
        <Meta note={note} />
        <span className="wr-cta">
          Start the guide{' '}
          <span aria-hidden className="wr-cta-arrow">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/**
 * The lead when it is a post rather than the guide (if the guide is ever
 * unpinned): image beside the words on a wide screen, above them on a phone.
 */
function PostLead({ note, isNewest }: { note: FieldNote; isNewest: boolean }) {
  return (
    <Link
      href={note.href}
      transitionTypes={['nav-forward']}
      className="wr-feature sd-card group"
    >
      <div className="wr-feature-media">
        <Frame note={note} priority />
      </div>
      <div className="wr-feature-body">
        <p className="wr-lead-kicker">
          {isNewest && <Seal char="新" className="wr-seal" />}
          <span>{isNewest ? 'Newest note' : note.category}</span>
          <NoteNo no={note.no} />
        </p>
        <h2 className="font-display wr-feature-title">{note.title}</h2>
        <p className="font-read wr-feature-excerpt">{note.excerpt}</p>
        <Meta note={note} />
        <Tags tags={note.tags} />
        <span className="wr-cta">
          Read the note{' '}
          <span aria-hidden className="wr-cta-arrow">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/* ── The cards ─────────────────────────────────────────────────────────── */

/** A note in the grid: image on top, then the words. */
function NoteCard({
  note,
  isNewest,
  priority = false,
}: {
  note: FieldNote;
  isNewest: boolean;
  priority?: boolean;
}) {
  return (
    <Link
      href={note.href}
      transitionTypes={['nav-forward']}
      className="wr-card sd-card sd-tilt group"
    >
      <Frame note={note} priority={priority} />
      <div className="wr-card-body">
        <div className="wr-card-top">
          <p className="wr-card-cat">
            {isNewest && <Seal char="新" className="wr-seal wr-seal-sm" />}
            <span>{note.category}</span>
          </p>
          <NoteNo no={note.no} />
        </div>
        <h2 className="wr-card-title">{note.title}</h2>
        <p className="wr-card-excerpt">{note.excerpt}</p>
        <Tags tags={note.tags} />
        <div className="wr-card-foot">
          <Meta note={note} />
          <span aria-hidden className="wr-card-arrow">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * The last page's closing tile, filling whatever the last row leaves open, so
 * the oldest note never sits beside empty columns. Its facts come from the
 * list: which note is the first one, and when it went up.
 */
function EndTile({ first, span }: { first: FieldNote; span: 1 | 2 }) {
  return (
    <li className="wr-grid-end sd-reveal" data-span={span}>
      <aside className="wr-fin-tile" aria-labelledby="wr-fin-title">
        <Kiru pose="bow" still className="wr-fin-tile-kiru" />
        <div className="wr-fin-tile-body">
          <p className="sd-kicker" id="wr-fin-title">
            The first note
          </p>
          <p className="wr-fin-tile-copy">
            Field notes start here, on {formatDate(first.date)}. Everything
            newer is on the pages before this one.
          </p>
          <div className="wr-fin-tile-go">
            <Link
              href={notePageHref(1)}
              transitionTypes={['nav-back', 'wr-page']}
              className="wr-pill"
            >
              <span aria-hidden>←</span> Back to the newest
            </Link>
            <Link
              href="/learn"
              transitionTypes={['nav-forward']}
              className="wr-pill wr-pill-primary"
            >
              Learn with me <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </aside>
    </li>
  );
}

/* ── Page numbers ──────────────────────────────────────────────────────── */

/**
 * Which page numbers to show. Up to seven, every number fits on a phone; past
 * that it is first, current ±1 and last, with gaps — one line however long the
 * archive grows. (The Market Storm index used the same window until it
 * stopped paging, October 2026.)
 */
function pageWindow(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) out.push('gap');
  for (let n = start; n <= end; n++) out.push(n);
  if (end < total - 1) out.push('gap');
  out.push(total);
  return out;
}

/**
 * Newer / Older. With nowhere to go it is a `<span>`, not a dead link — a
 * link to nowhere still sits in the tab order and announces as a link — and
 * it keeps its slot so the numbers don't slide between pages.
 *
 * Paging slides the page the way it travels (`nav-forward` for older,
 * `nav-back` for newer) and turns it like a page (`wr-page`, see the view
 * transitions in writing.css).
 */
function PageArrow({
  href,
  rel,
  children,
}: {
  href?: string;
  rel: 'prev' | 'next';
  children: ReactNode;
}) {
  const className = `wr-pager-arrow wr-pager-${rel}`;
  if (!href) {
    return (
      <span aria-hidden className={`${className} is-dead`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      rel={rel}
      transitionTypes={[rel === 'next' ? 'nav-forward' : 'nav-back', 'wr-page']}
      className={className}
    >
      {children}
    </Link>
  );
}

/**
 * "Newer" and "Older" rather than "Previous" and "Next": on a newest-first
 * list "next" points back in time. `rel` still carries document order. The
 * current page is stamped like a hanko — the primary button's vermilion with
 * white type (4.7:1), the same object in both lights.
 */
function Pager({
  page,
  total,
  count,
}: {
  page: number;
  total: number;
  count: number;
}) {
  if (total <= 1) return null;
  return (
    <nav className="wr-pager" aria-label="Field notes, by page">
      <div className="wr-pager-bar">
        <PageArrow
          href={page > 1 ? notePageHref(page - 1) : undefined}
          rel="prev"
        >
          <span aria-hidden>←</span> Newer
        </PageArrow>
        <ol className="wr-pager-nums">
          {pageWindow(page, total).map((item, i) =>
            item === 'gap' ? (
              <li key={`gap-${i}`} aria-hidden className="wr-pager-gap">
                …
              </li>
            ) : (
              <li key={item}>
                {item === page ? (
                  <span aria-current="page" className="wr-pager-now">
                    <span className="sr-only">Page </span>
                    {item}
                  </span>
                ) : (
                  <Link
                    href={notePageHref(item)}
                    aria-label={`Page ${item} of ${total}`}
                    transitionTypes={[
                      item > page ? 'nav-forward' : 'nav-back',
                      'wr-page',
                    ]}
                    className="wr-pager-num"
                  >
                    {item}
                  </Link>
                )}
              </li>
            )
          )}
        </ol>
        <PageArrow
          href={page < total ? notePageHref(page + 1) : undefined}
          rel="next"
        >
          Older <span aria-hidden>→</span>
        </PageArrow>
      </div>
      <p className="wr-pager-count">
        Page {page} of {total} · {count} notes
      </p>
    </nav>
  );
}

/* ── Headers ───────────────────────────────────────────────────────────── */

/** Page 1: the full header — 書 inking in, the cut title, Kiru reading. */
function IndexHead({ count, newest }: { count: number; newest?: FieldNote }) {
  return (
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
              {count} {count === 1 ? 'note' : 'notes'}
            </span>
            <span>newest {formatDate(newest.date)}</span>
          </p>
        )}
      </div>
    </header>
  );
}

/** "August 3 to August 22, 2026" — the days a page of notes spans. */
function daySpan(notes: FieldNote[]): string | null {
  if (notes.length === 0) return null;
  const days = notes.map((n) => n.date).sort();
  const first = days[0];
  const last = days[days.length - 1];
  if (first === last) return formatDate(first);
  const a = formatDate(first);
  const b = formatDate(last);
  return first.slice(0, 4) === last.slice(0, 4)
    ? `${a.replace(/, \d{4}$/, '')} to ${b}`
    : `${a} to ${b}`;
}

/**
 * Pages 2+: a compact header. The page number is stamped beside the title
 * like a hanko, and the line under it says which days this page covers.
 */
function PageHead({
  page,
  total,
  notes,
}: {
  page: number;
  total: number;
  notes: FieldNote[];
}) {
  const span = daySpan(notes);
  return (
    <header className="wr-head wr-head-compact">
      <Kanji char="書" draw className="sd-watermark wr-head-mark" />
      <div className="wr-head-titles">
        <p className="sd-kicker">Writing</p>
        <h1 className="font-display wr-head-title">
          Field notes
          <span className="sr-only">
            , page {page} of {total}
          </span>
          <span aria-hidden className="wr-stamp">
            {page}
          </span>
        </h1>
      </div>
      <div className="wr-head-kiru" aria-hidden>
        <Kiru pose="read" className="wr-head-ninja" />
      </div>
      <div className="wr-head-sub">
        <p className="wr-head-count">
          <span>
            Page {page} of {total}
          </span>
          {span && <span>{span}</span>}
        </p>
      </div>
    </header>
  );
}

/* ── Learn together ────────────────────────────────────────────────────── */

/**
 * The way out of page 1: /learn, the email splash. Same words and the same
 * calm as that page — its headline, its "no hype" line, its button — with
 * Kiru climbing onto the band's top edge to wave people in.
 */
function LearnBand() {
  return (
    <section className="wr-learn" aria-labelledby="wr-learn-title">
      <div className="wr-learn-card">
        <span aria-hidden className="wr-learn-clip">
          <Kanji char="学" className="wr-learn-mark" />
        </span>
        {/* Still: his idle loops would repaint the band on every scrolling
            frame. He rises over the edge instead, a transform the compositor
            runs (see .wr-learn-kiru). */}
        <div className="wr-learn-kiru" aria-hidden>
          <span className="wr-learn-kiru-rise">
            <Kiru pose="wave" still />
          </span>
        </div>
        <p className="sd-kicker">Learn together</p>
        <h2 id="wr-learn-title" className="font-display wr-learn-title">
          Let&rsquo;s learn to build websites, apps and games.
        </h2>
        <p className="font-display wr-learn-calm">
          No hype. <span>Just learning together.</span>
        </p>
        <Link
          href="/learn"
          transitionTypes={['nav-forward']}
          className="wr-learn-btn sd-btn-primary"
        >
          Learn with me <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

/* ── The page ──────────────────────────────────────────────────────────── */

export default function FieldNotesView({ page }: { page: number }) {
  const all = getFieldNotes();
  const notes = notesOnPage(page);
  const newest = newestNote();
  const isNewest = (n: FieldNote) => n.slug === newest?.slug;
  const total = totalNotePages;
  const last = page === total;
  const empty = NOTES_PER_PAGE - notes.length;

  if (page === 1) {
    const [lead, ...rest] = notes;
    return (
      <div className="wr-index">
        <IndexHead count={all.length} newest={newest} />

        <section className="wr-notes" aria-label="Field notes, page 1">
          {lead &&
            (lead.kind === 'guide' ? (
              <GuideLead note={lead} isNewest={isNewest(lead)} />
            ) : (
              <PostLead note={lead} isNewest={isNewest(lead)} />
            ))}
          {rest.length > 0 && (
            <ul className="wr-grid" role="list">
              {rest.map((note) => (
                <li key={note.slug} className="sd-reveal">
                  <NoteCard note={note} isNewest={isNewest(note)} />
                </li>
              ))}
            </ul>
          )}
          <Pager page={1} total={total} count={all.length} />
        </section>

        {/* Market Storm, the Writing page's second room. Page 1 only: pages
            2+ are for paging back through notes. It runs full-bleed on its
            own; this wrapper only owns the gap above it. */}
        <div className="wr-storm-slot">
          <WritingStorm />
        </div>

        <LearnBand />
      </div>
    );
  }

  return (
    <div className="wr-index">
      <PageHead page={page} total={total} notes={notes} />

      <section className="wr-notes" aria-label={`Field notes, page ${page}`}>
        <ul className="wr-grid wr-grid-three" role="list">
          {notes.map((note, i) => (
            <li key={note.slug} className="sd-reveal">
              <NoteCard
                note={note}
                isNewest={isNewest(note)}
                priority={i === 0}
              />
            </li>
          ))}
          {last && empty > 0 && all.length > 0 && (
            <EndTile
              first={all.reduce((a, b) => (b.no < a.no ? b : a))}
              span={empty === 2 ? 2 : 1}
            />
          )}
        </ul>
        <Pager page={page} total={total} count={all.length} />
      </section>
    </div>
  );
}
