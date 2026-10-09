import Link from 'next/link';
import { frontReports, type MarketStormEntry } from '@/data/marketStorm';
import './archived.css';

/** "August 2026": when it was written, at the precision staleness needs. */
const month = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * What an archived Market Storm report says about itself, near its top.
 *
 * Archiving takes a report off the front and nothing else: its URL, its words,
 * search and the sitemap all stay. So the page is the one place a reader
 * arriving from a search result can learn that it's old, and it says so in
 * three plain parts: archived, when it was written, not kept up to date. Then
 * it hands them the current reports by title, read from `frontReports()`, so
 * the links follow Josh's order without anyone editing this.
 *
 * Quiet on purpose: the page's own ink and a hairline, no warning colour. An
 * archived report isn't wrong, it's dated.
 *
 * `strip`: a template report renders this inside its storm band, under the
 * tags. An article draws its own page from the very top, so its notice is a
 * bar of its own above the article instead (see archived.css).
 */
export default function ArchivedNotice({
  report,
  strip = false,
}: {
  report: MarketStormEntry;
  strip?: boolean;
}) {
  const current = frontReports();
  const written = month.format(new Date(`${report.publishDate}T00:00:00Z`));

  const note = (
    <div className="ms-archived" role="note" aria-labelledby="ms-archived-k">
      <p id="ms-archived-k" className="sd-kicker">
        Archived
      </p>
      <p className="ms-archived-line">
        I wrote this in {written} and I don’t keep it up to date.
        {current.length > 0 && ' My current reports:'}
      </p>
      {current.length > 0 && (
        <ul role="list" className="ms-archived-list">
          {current.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/market-storm/${r.slug}`}
                className="ms-archived-link"
              >
                {/* One inline run, so a title that wraps keeps its arrow on
                    its last word instead of stranding it at the far edge.
                    The no-break space glues them; nowrap holds the arrow,
                    which a line may otherwise break before. */}
                <span>
                  <span className="ms-archived-title">{r.title}</span>
                  <span className="ms-archived-tail" aria-hidden="true">
                    {' '}
                    <span className="ms-archived-arrow">→</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return strip ? (
    <div className="ms-archived-strip">
      <div className="ms-archived-wrap">{note}</div>
    </div>
  ) : (
    note
  );
}
