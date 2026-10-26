import type { CSSProperties } from 'react';
import Link from 'next/link';
import Kiru from '@/components/kiru/Kiru';
import Kanji, { Seal, Slash } from '@/components/brand/Kanji';
import HeroImage from '@/components/HeroImage';
import { LEVELS } from '@/components/guide/copy';
import { formatDate } from '@/lib/format';
import {
  getArchivedNotes,
  getFieldNotes,
  newestNote,
  type FieldNote,
} from '@/lib/fieldNotes';
import WritingStorm from '@/components/writing/storm/WritingStorm';
import LevelSweep from './LevelSweep';
import './writing.css';

/*
  The Writing page and its archive. `/content` renders the front and
  `/content/archive` the archive, both through this view, so the two can
  never drift apart.

  The front: the header, the pinned field guide as the lead, any other
  current notes, the door to the archive, Market Storm (mounted below by its
  own section), and the way into /learn. The archive: a compact header, every
  archived note in the three-up grid, newest first, and a closing tile.
  (Both were paged, three notes a page, until the archive opened on
  2026-10-26; next.config.ts sends the old page addresses to the archive.)

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
 * The archive's closing tile, filling whatever the last row leaves open, so
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
            Field notes start here, on {formatDate(first.date)}. What I&apos;m
            writing now is on the Writing page.
          </p>
          <div className="wr-fin-tile-go">
            <Link
              href="/content"
              transitionTypes={['nav-back']}
              className="wr-pill"
            >
              <span aria-hidden>←</span> Back to Writing
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

/* ── Headers ───────────────────────────────────────────────────────────── */

/** The front: the full header — 書 inking in, the cut title, Kiru reading. */
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

/** "July 8 to August 28, 2026" — the days a list of notes spans. */
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
 * The archive: a compact header. It says what the archive is and that it is
 * not kept up to date, then which days it covers.
 */
function ArchiveHead({ notes }: { notes: FieldNote[] }) {
  const span = daySpan(notes);
  return (
    <header className="wr-head wr-head-compact">
      <Kanji char="書" draw className="sd-watermark wr-head-mark" />
      <div className="wr-head-titles">
        <p className="sd-kicker">Writing</p>
        <h1 className="font-display wr-head-title">The archive</h1>
      </div>
      <div className="wr-head-kiru" aria-hidden>
        <Kiru pose="read" className="wr-head-ninja" />
      </div>
      <div className="wr-head-sub">
        <p className="font-read wr-head-lead">
          My earlier field notes, written for the site&apos;s older design. I
          don&apos;t keep them up to date.
        </p>
        <p className="wr-head-count">
          <span>
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
          {span && <span>{span}</span>}
        </p>
      </div>
    </header>
  );
}

/* ── The way into the archive ──────────────────────────────────────────── */

/**
 * The front's door to the archive, under the current notes: how many, which
 * days, and one link. Quiet on purpose, like the end tile it leads to: a
 * dashed edge and no art, so the guide above stays the thing to read.
 */
function ArchiveDoor({ notes }: { notes: FieldNote[] }) {
  const span = daySpan(notes);
  return (
    <Link
      href="/content/archive"
      transitionTypes={['nav-forward']}
      className="wr-door group"
    >
      <span className="wr-door-body">
        <span className="sd-kicker">The archive</span>
        <span className="wr-door-line">
          {notes.length} earlier field {notes.length === 1 ? 'note' : 'notes'}
          {span ? `, ${span}` : ''}. Each one is still at its own link.
        </span>
      </span>
      <span className="wr-cta">
        Open the archive{' '}
        <span aria-hidden className="wr-cta-arrow">
          →
        </span>
      </span>
    </Link>
  );
}

/* ── Learn together ────────────────────────────────────────────────────── */

/**
 * The way out of the front: /learn, the email splash. Same words and the same
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

export default function FieldNotesView({
  view,
}: {
  view: 'front' | 'archive';
}) {
  const archive = getArchivedNotes();

  if (view === 'front') {
    const notes = getFieldNotes();
    const newest = newestNote();
    const isNewest = (n: FieldNote) => n.slug === newest?.slug;
    const [lead, ...rest] = notes;
    return (
      <div className="wr-index">
        <IndexHead count={notes.length} newest={newest} />

        <section className="wr-notes" aria-label="Field notes">
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
          {archive.length > 0 && <ArchiveDoor notes={archive} />}
        </section>

        {/* Market Storm, the Writing page's second room. The front only: the
            archive is for reading back through notes. It runs full-bleed on
            its own; this wrapper only owns the gap above it. */}
        <div className="wr-storm-slot">
          <WritingStorm />
        </div>

        <LearnBand />
      </div>
    );
  }

  // Three across on a wide screen: whatever the last row leaves open, the
  // end tile fills.
  const empty = (3 - (archive.length % 3)) % 3;
  return (
    <div className="wr-index">
      <ArchiveHead notes={archive} />

      <section className="wr-notes" aria-label="Archived field notes">
        <ul className="wr-grid wr-grid-three" role="list">
          {archive.map((note, i) => (
            <li key={note.slug} className="sd-reveal">
              <NoteCard note={note} isNewest={false} priority={i === 0} />
            </li>
          ))}
          {empty > 0 && (
            <EndTile
              first={archive.reduce((a, b) => (b.no < a.no ? b : a))}
              span={empty === 2 ? 2 : 1}
            />
          )}
        </ul>
      </section>
    </div>
  );
}
