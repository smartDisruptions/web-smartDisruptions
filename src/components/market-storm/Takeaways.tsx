/**
 * The findings, before the argument.
 *
 * Placed directly under the verdict because the honest assumption is that most
 * readers stop within a screen or two. If they take nothing else, they should
 * take these — so they are stated flat, numbered, each with a figure in it, and
 * none of them depends on having read anything above.
 *
 * Deliberately not a summary. A summary compresses the reasoning; this drops
 * the reasoning entirely and keeps the conclusions, which is what someone
 * skimming actually wants.
 */
export default function Takeaways({ items }: { items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section
      aria-labelledby="takeaways-heading"
      className="rounded-2xl border border-accent/25 bg-accent/[0.04] p-6 sm:p-8"
    >
      <h2
        id="takeaways-heading"
        className="font-mono-accent text-accent"
      >
        If you read nothing else
      </h2>
      <ol className="mt-5 space-y-4" role="list">
        {items.map((t, i) => (
          <li key={i} className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-1 font-mono text-sm font-bold text-accent [font-variant-numeric:tabular-nums]"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="max-w-[62ch] text-lg leading-8 text-text-primary">
              {t}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
