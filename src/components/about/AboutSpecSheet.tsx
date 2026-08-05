import Link from 'next/link';

/**
 * Template 4 — "The Spec Sheet"
 *
 * An about page shaped like a README. Mono labels on the left, values on the
 * right, scannable in about fifteen seconds. This is the densest of the five
 * and the most opinionated: it assumes the reader is technical, impatient, and
 * would rather scan a field list than read three paragraphs of introduction.
 *
 * The disclosure gets a terminal-ish frame, which is the point — the most
 * honest thing on the page is also the most visually distinct.
 */
const fields = [
  {
    label: 'Role',
    value: 'Enterprise developer at a university. Eleven years in.',
  },
  {
    label: 'Day stack',
    value: 'Oracle SQL · Pro*C · Banner · Argos',
  },
  {
    label: 'Night stack',
    value: 'Next.js · TypeScript · Tailwind · Supabase · Claude Code',
  },
  {
    label: 'Shipped',
    value:
      'A restaurant site taking real orders. An $80k vendor product replaced in-house. Nine apps live on this site. Games built with my son — one he built himself.',
  },
  {
    label: 'Writes about',
    value:
      'How things actually get made with AI: the timeline, the method, the mistakes, and the parts worth copying.',
  },
  {
    label: 'Also',
    value: 'Dad. BJJ and MMA coach, about two decades of it.',
  },
  {
    label: "Won't do",
    value:
      'Claim a build I did not do, or a result I did not get. Every post on this site has a live link or a screenshot behind it.',
  },
];

export default function AboutSpecSheet() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono-accent text-accent">README</p>
          <h1 className="font-display mt-3 text-4xl leading-[1.08] font-semibold tracking-tight text-text-primary sm:text-5xl">
            Josh Escusa
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-text-secondary">
            I build real things with AI and write down exactly how.
          </p>
        </div>
        <img
          src="/images/josh.webp"
          alt="Josh"
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 rounded-xl border border-border object-cover"
        />
      </div>

      {/* The field list. Labels are mono and quiet; values carry the weight. */}
      <dl className="mt-14 divide-y divide-border border-t border-b border-border">
        {fields.map((f) => (
          <div
            key={f.label}
            className="grid gap-2 py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8"
          >
            <dt className="font-mono-accent pt-1 text-text-secondary">
              {f.label}
            </dt>
            <dd className="leading-[1.7] text-text-primary">{f.value}</dd>
          </div>
        ))}
      </dl>

      {/* Disclosure, framed like output rather than prose. */}
      <section className="mt-14 overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border bg-surface-elevated px-5 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent" />
          <p className="font-mono-accent text-text-secondary">
            Disclosure · how this site is written
          </p>
        </div>

        <div className="space-y-4 px-5 py-6 leading-[1.75] text-text-secondary sm:px-8 sm:py-8">
          <p>
            <strong className="font-semibold text-text-primary">
              I use an AI model to help me write these posts.
            </strong>{' '}
            Saying so out loud matters here, because honesty is most of what
            this site is selling.
          </p>
          <p>
            The experiences are mine. The builds, the decisions, the dead ends,
            the things I got wrong and fixed &mdash; those happened at my
            keyboard, on real projects. AI didn&rsquo;t have them; I did. What
            it helps with is getting them onto the page: drafting, structuring,
            tightening a rambling paragraph into a clear one.
          </p>
          <p>
            I read and approve every word before it goes live. If a draft says
            something that isn&rsquo;t true, or frames me as something I&rsquo;m
            not, it gets fixed or cut &mdash; I&rsquo;ve done exactly that more
            than once. The receipts are real. The words had help. Both can be
            true at once, and I&rsquo;d rather tell you than have you wonder.
          </p>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <Link
          href="/content"
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          Read the writing &rarr;
        </Link>
        <Link
          href="/apps"
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          See what I&rsquo;ve built &rarr;
        </Link>
        <a
          href="https://www.linkedin.com/in/joshescusa"
          className="text-accent underline underline-offset-2 hover:text-accent-hover"
        >
          LinkedIn &rarr;
        </a>
      </div>
    </div>
  );
}
