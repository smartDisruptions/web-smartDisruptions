import ArticleBody from '@/components/ArticleBody';
import Figure from '@/components/market-storm/Chart';
import type { ReportChart } from '@/data/marketStorm';

/**
 * A single number, set large, breaking the column.
 *
 * The cheapest way to stop a page reading as a wall. It is not decoration: a
 * figure a reader should carry away gets pulled out of the sentence and given
 * room, so someone skimming collects the numbers even if they take none of the
 * prose. Written as `[[stat:$24.1bn|caption]]` on its own line.
 */
function Stat({ value, caption }: { value: string; caption?: string }) {
  return (
    <div className="my-9 border-l-2 border-accent pl-6">
      <div className="font-display text-4xl font-semibold leading-none tracking-tight text-accent [font-variant-numeric:tabular-nums] sm:text-5xl">
        {value}
      </div>
      {caption && (
        <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-text-secondary">
          {caption}
        </p>
      )}
    </div>
  );
}

/**
 * Long-form body that can contain figures and pulled-out numbers.
 *
 * The markdown carries markers on their own line — `[[chart:id]]` for a figure,
 * `[[stat:value|caption]]` for a number. Splitting on them keeps each one next
 * to the sentence it belongs to, which is the entire point: a gallery of charts
 * at the end of an article is a gallery nobody reads.
 *
 * An unmatched marker renders nothing rather than throwing or printing the raw
 * token. A missing figure should cost a figure, not the page.
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
  const parts = markdown.split(/^\[\[(chart|stat):([^\]]+)\]\]$/gim);

  // split() with two capture groups yields [text, kind, arg, text, kind, arg, …]
  const out: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    const text = parts[i];
    if (text?.trim())
      out.push(
        <ArticleBody key={`t${i}`} className={className}>
          {text}
        </ArticleBody>
      );
    const kind = parts[i + 1];
    const arg = parts[i + 2];
    if (!kind) continue;
    if (kind.toLowerCase() === 'chart') {
      const chart = byId.get(arg);
      if (chart) out.push(<Figure key={`c${i}`} chart={chart} />);
    } else {
      const [value, caption] = arg.split('|');
      out.push(<Stat key={`s${i}`} value={value.trim()} caption={caption?.trim()} />);
    }
  }
  return <>{out}</>;
}
