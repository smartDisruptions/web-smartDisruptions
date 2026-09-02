import Inline from './Inline';

/**
 * The findings, before the argument.
 *
 * Placed at the top of the report because the honest assumption is that most
 * readers stop within a screen or two. If they take nothing else, they should
 * take these — so they are stated flat, numbered, each with a figure in it, and
 * none of them depends on having read anything above.
 *
 * Deliberately not a summary. A summary compresses the reasoning; this drops
 * the reasoning entirely and keeps the conclusions, which is what someone
 * skimming actually wants.
 *
 * `lead` is what the numbers add up to, in one sentence, and it comes first for
 * the same reason the block exists: a reader who stops after one line should
 * still have the point. It carries no figures — those are the list's job, and
 * a lead that restates them is how the old verdict paragraph came to say
 * everything twice.
 *
 * The heading and numerals use accent-HOVER, not accent. The card's own 4%
 * accent tint drops plain accent to 4.28:1 in the light theme -- it clears AA
 * on the page background and stops clearing it here, which is a contrast bug
 * the tint introduced rather than one the token has.
 */
export default function Takeaways({
  lead,
  items,
}: {
  lead?: string;
  items?: string[];
}) {
  if (!items?.length) return null;
  return (
    <section
      aria-labelledby="takeaways-heading"
      className="rounded-2xl border border-accent/25 bg-accent/[0.04] p-6 sm:p-8"
    >
      <h2 id="takeaways-heading" className="font-mono-accent text-accent-hover">
        If you read nothing else
      </h2>

      {lead && (
        <p className="mt-4 max-w-[56ch] text-pretty font-display text-xl leading-snug text-text-primary sm:text-2xl">
          <Inline>{lead}</Inline>
        </p>
      )}

      <ol
        className={`space-y-4 ${lead ? 'mt-7 border-t border-accent/15 pt-6' : 'mt-5'}`}
        role="list"
      >
        {items.map((t, i) => (
          <li key={i} className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-1.5 font-mono text-sm font-bold text-accent-hover [font-variant-numeric:tabular-nums]"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="max-w-[62ch] text-lg leading-8 text-text-secondary">
              <Inline>{t}</Inline>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
