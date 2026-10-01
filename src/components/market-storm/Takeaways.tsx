import { Seal } from '@/components/brand/Kanji';
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
 * It is an ofuda — the paper-slip material, cream with a vermilion band,
 * stamped 心 ("the heart of it"). The slip is the same object in both lights,
 * so it carries the day tokens (`ms-day`): every word on it, including bold
 * figures and links rendered by Inline, is dark ink on cream and clears AA
 * whatever theme the page around it is in.
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
      className="ms-day sd-note relative px-6 pb-8 pt-8 sm:px-10 sm:pb-10 sm:pt-9"
    >
      <Seal char="心" className="ms-ofuda-seal" />
      <h2 id="takeaways-heading" className="font-mono-accent text-pen-ink">
        If you read nothing else
      </h2>

      {lead && (
        <p className="font-read mt-4 max-w-[56ch] text-pretty text-[1.3rem] font-semibold leading-snug text-text-primary sm:text-[1.55rem]">
          <Inline>{lead}</Inline>
        </p>
      )}

      <ol
        className={`space-y-4 ${lead ? 'mt-7 border-t border-dashed border-[rgba(31,26,20,0.22)] pt-6' : 'mt-5'}`}
        role="list"
      >
        {items.map((t, i) => (
          <li key={i} className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-1 font-mono text-sm font-bold text-pen-ink [font-variant-numeric:tabular-nums]"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="font-read max-w-[62ch] text-[1.08rem] leading-[1.75] text-text-secondary">
              <Inline>{t}</Inline>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
