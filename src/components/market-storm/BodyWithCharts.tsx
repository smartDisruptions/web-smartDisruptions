import ArticleBody from '@/components/ArticleBody';
import Figure from '@/components/market-storm/Chart';
import type { ReportChart } from '@/data/marketStorm';

/**
 * Long-form body that can contain figures.
 *
 * The markdown carries `[[chart:id]]` on its own line; this splits on those
 * markers and drops the matching figure between the prose segments. That keeps
 * the chart next to the sentence it proves, which is the whole point — a
 * gallery of charts at the end of an article is a gallery nobody reads.
 *
 * An unmatched marker renders nothing rather than throwing or printing the
 * raw token. A missing figure should cost the reader a chart, not the page.
 */
export default function BodyWithCharts({
  markdown,
  charts = [],
  className,
}: {
  markdown: string;
  charts?: ReportChart[];
  className?: string;
}) {
  const byId = new Map(charts.map((c) => [c.id, c]));
  const parts = markdown.split(/^\[\[chart:([a-z0-9-]+)\]\]$/gim);

  // split() with one capture group yields [text, id, text, id, text, ...]
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const chart = byId.get(part);
          return chart ? <Figure key={`c-${part}`} chart={chart} /> : null;
        }
        return part.trim() ? (
          <ArticleBody key={`t-${i}`} className={className}>
            {part}
          </ArticleBody>
        ) : null;
      })}
    </>
  );
}
