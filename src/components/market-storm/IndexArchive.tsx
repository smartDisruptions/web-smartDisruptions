import Link from 'next/link';
import { archivedReports, methodOf } from '@/data/marketStorm';
import { MethodBadge } from '@/components/market-storm/Method';

const MONTHS = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');

/** "2026-08-26" → "Aug 26, 2026": short enough to sit in a column. */
function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/**
 * THE ARCHIVE — every report taken off the front, newest first.
 *
 * Deliberately quieter than the front: no art, no excerpts, no figures. A
 * ledger, one line per report — the date, the ticker, the title — each line
 * a link to the report, which keeps its own URL and is not rewritten. The
 * method line stays on every entry because the paragraph above promises it
 * ("every card says which").
 *
 * These are the earnings reads, so the section's old heading and its
 * paragraph, which describe exactly them, live here now, word for word.
 *
 * The ten links don't prefetch. They are the quietest on the page, and ten
 * route prefetches firing as the list scrolls into view would be work done
 * during a scroll for clicks that mostly never come; a click fetches then.
 *
 * `id="archive"`: the Writing page links straight to it.
 */
export default function IndexArchive() {
  const reports = archivedReports();
  if (!reports.length) return null;

  return (
    <section
      id="archive"
      aria-labelledby="ms-archive-title"
      className="ms-archive scroll-mt-24"
    >
      <div className="flex items-baseline gap-3">
        <h2 id="ms-archive-title" className="sd-kicker">
          The companies, one quarter at a time
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <p className="whitespace-nowrap font-mono text-xs text-text-secondary [font-variant-numeric:tabular-nums]">
          {reports.length === 1 ? '1 report' : `${reports.length} reports`}
        </p>
      </div>
      <p className="mt-3 max-w-[70ch] text-[0.95rem] leading-relaxed text-text-secondary">
        Each of these reads a single company&rsquo;s filing.{' '}
        <strong className="text-text-primary">Four agents rather than five</strong>
        , and the top load-bearing claims go to the refutation pass rather than
        all of them — every card says which, and every report names its own
        roster.
      </p>
      <p className="ms-arc-note">
        Earlier reports, each at its own link. I don&rsquo;t update them.
      </p>

      {/* sd-defer: ten rows below the fold skip style, layout and paint
          until they near the screen. The #archive anchor is the section
          above, never a row inside the deferred list. */}
      <ol className="ms-arc sd-defer" role="list">
        {reports.map((r) => (
          <li key={r.slug} className="ms-arc-row group">
            <time dateTime={r.publishDate} className="ms-arc-date">
              {shortDate(r.publishDate)}
            </time>
            <span className="font-display ms-arc-ticker">{r.ticker ?? ''}</span>
            <div className="ms-arc-main">
              <Link
                href={`/market-storm/${r.slug}`}
                className="ms-stretch ms-arc-title"
                prefetch={false}
              >
                {r.title}
              </Link>
              <MethodBadge method={methodOf(r)} />
            </div>
            <span className="ms-arc-go" aria-hidden="true">
              &rarr;
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
