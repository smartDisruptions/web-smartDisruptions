import type { MarketStormEntry } from '@/data/marketStorm';

/**
 * Picture-editing for the room: how a lead report's card image is cropped,
 * and when its catalyst is a date to watch.
 */

/* ── The lead's crop ──────────────────────────────────────────────────────── */

export interface LeadArt {
  /** The point the frame centres on, as fractions of the image (0..1). */
  focus: [number, number];
  /** The subject's width as a fraction of the image's. */
  subject: number;
  /** The image is iron filings round a magnet, so the field can pulse. */
  pulse?: boolean;
}

/*
 * Keyed by slug, like a picture editor's crop marks: the data says which
 * image, the room says how to frame it. A lead without an entry here shows
 * its whole card image, still.
 *
 * rare-earths-ai: the article's card (image.html) bakes its title into the
 * left half and puts the bar magnet right of centre, at 584,240, 560×126 of
 * 1200×630. The room has the title on the page as words, so the frame keeps
 * the magnet and its field and leaves the baked words outside.
 */
const ART: Record<string, LeadArt> = {
  'rare-earths-ai': {
    focus: [864 / 1200, 303 / 630],
    subject: 560 / 1200,
    pulse: true,
  },
};

export const leadArt = (e: MarketStormEntry): LeadArt | undefined =>
  ART[e.slug];

/* ── The date to watch ────────────────────────────────────────────────────── */

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

export interface WatchDate {
  day: number;
  month: string; // "Nov"
  year: number;
  iso: string; // "2026-11-10"
  /** Where the date sits in the catalyst, so the page can mark it up. */
  at: number;
  text: string; // "10 Nov 2026", as the catalyst writes it
}

/**
 * The first "10 Nov 2026"-style date in a report's catalyst, if it falls
 * after the report was published: a moment the report is waiting for rather
 * than one it is looking back at. ("Checked against filings through 31
 * August 2026" is the day of publishing, so it is not one.)
 *
 * The catalyst is prose, so this reads it rather than trusting a field; a
 * catalyst with no date simply gets no calendar leaf.
 */
export function watchDate(e: MarketStormEntry): WatchDate | null {
  const m = e.catalyst?.match(
    /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})\b/
  );
  if (!m) return null;
  const day = Number(m[1]);
  const mi = MONTHS.indexOf(m[2]);
  const year = Number(m[3]);
  if (day < 1 || day > 31 || mi < 0) return null;
  const iso = `${year}-${String(mi + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (iso <= e.publishDate) return null;
  return { day, month: MONTHS[mi], year, iso, at: m.index ?? 0, text: m[0] };
}
