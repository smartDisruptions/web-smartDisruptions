import type { ResearchMethod } from '@/data/marketStorm';

/**
 * How a report was researched, shown on the report itself and on its card.
 *
 * WHY THIS IS ON THE PAGE AT ALL
 * ------------------------------
 * The section's claim is that a real adversarial process produced the finance,
 * and for a while that claim was unfalsifiable from the outside: two different
 * run shapes were rendering identically. Publishing the roster and the
 * verification depth is what turns "trust the method" into "here is the method,
 * including where it fell short on this one".
 */

/** "6 of 13 refuted-tested" is the number a reader cannot infer from anything else. */
export function verificationLine(m: ResearchMethod): string {
  if (m.claimsVerified === undefined) {
    return `${m.claimsSurfaced} claims tracked`;
  }
  if (m.verificationScope === 'all') {
    return `all ${m.claimsSurfaced} claims refuted-tested`;
  }
  return `${m.claimsVerified} of ${m.claimsSurfaced} claims refuted-tested`;
}

/**
 * The compact form, for an index card.
 *
 * One line at a 352px card width, which is what killed the earlier attempt at
 * listing the four role names here: they were identical on every card, so they
 * read as chrome and said nothing about the report — the same failure as the
 * verification chips this section already removed once.
 */
export function MethodBadge({ method }: { method?: ResearchMethod }) {
  if (!method) return null;
  // agentCount 0 means the run record was not retained. Falling back to the
  // roster length would print "4 agents" as if it were measured, when the
  // roster itself is an inference for those reports — so the count is simply
  // omitted and the claims line carries the badge alone.
  const agents = method.agentCount;
  return (
    <p className="font-mono text-[0.62rem] uppercase leading-[1.05rem] tracking-[0.07em] text-text-secondary">
      {agents > 0 ? `${agents} agents · ` : ''}
      {verificationLine(method)}
      {method.limitations?.length ? (
        <span className="text-warn" title={method.limitations[0]}>
          {' '}
          ·&nbsp;caveated
        </span>
      ) : null}
    </p>
  );
}

/**
 * The full form, for a report page: who was in the room and what they were
 * pointed at, then the counts, then anything that capped the run.
 */
export default function MethodBlock({ method }: { method?: ResearchMethod }) {
  if (!method) return null;

  // Deliberately frameless: this renders inside the report's receipt, which
  // already supplies the ground. A card in a card reads as a mistake.
  return (
    <section>
      <p className="sd-kicker">Who researched this</p>
      <h3 className="font-display mt-3 max-w-[40ch] text-[1.35rem] leading-[1.2] text-text-primary">
        {method.perspectives.length} agents took opposing stakes, then{' '}
        {method.verificationScope === 'all'
          ? 'every load-bearing claim'
          : 'the load-bearing claims'}{' '}
        went to a separate pass told to{' '}
        <strong className="font-normal text-pen-ink">refute</strong> them
      </h3>

      <ol
        className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2"
        role="list"
      >
        {method.perspectives.map((p, i) => (
          <li key={p.role} className="bg-surface px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="grid h-6 min-w-6 place-items-center rounded-full border border-border bg-background px-1 font-mono text-[0.62rem] font-bold text-accent [font-variant-numeric:tabular-nums]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-bold text-text-primary">
                {p.role}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-snug text-text-secondary">
              {p.probe}
            </p>
          </li>
        ))}
      </ol>

      {/* The counts, in the same 1px-gap-over-border-ground treatment the price
          strip and the card figures use, so the method reads as part of the
          report rather than as a footer bolted onto it. */}
      <div
        className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
      >
        {[
          { k: 'Perspectives', v: String(method.perspectives.length) },
          { k: 'Turns each', v: String(method.turnsEach) },
          {
            k: 'Claims tracked',
            v: String(method.claimsSurfaced),
          },
          {
            k: 'Refuted-tested',
            v:
              method.claimsVerified === undefined
                ? 'not recorded'
                : String(method.claimsVerified),
          },
          ...(method.primaryDocsOpened !== undefined
            ? [
                {
                  k: 'Primary docs opened',
                  v: String(method.primaryDocsOpened),
                },
              ]
            : []),
        ].map((cell) => (
          <div key={cell.k} className="bg-surface px-4 pb-3 pt-2.5">
            <div className="text-[0.62rem] font-bold uppercase leading-[1.05rem] tracking-[0.1em] text-text-secondary">
              {cell.k}
            </div>
            <div className="mt-1 font-mono text-[1.05rem] font-bold leading-none text-text-primary [font-variant-numeric:tabular-nums]">
              {cell.v}
            </div>
          </div>
        ))}
      </div>

      {method.limitations?.length ? (
        <div className="mt-4 rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3.5">
          <p className="font-mono-accent text-warn">What capped this run</p>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-text-secondary">
            {method.limitations.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
