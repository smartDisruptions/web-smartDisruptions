import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionContainer } from '@/components/ui';
import { samples } from '@/data/samples';
import { projects } from '@/data/resume';

export const metadata: Metadata = {
  title: 'Web Design — SmartDisruptions',
  description:
    'I build websites for local businesses with AI, fast, and I show the receipts. Real client work, live links, and four sample designs you can open right now.',
  openGraph: {
    title: 'Web Design — SmartDisruptions',
    description:
      'Websites for local businesses, built with AI and shipped with receipts. Open the samples.',
    url: 'https://smartdisruptions.com/web-design',
    type: 'website',
  },
};

/** The client work that can be pointed at, newest first. */
const proof = projects.filter((p) =>
  ['Samurai Kitchen', 'Review Growth System', 'Dirty Coffee Pullman'].includes(
    p.name,
  ),
);

export default function WebDesignPage() {
  return (
    <>
      {/* ── The offer ─────────────────────────────────────────────────── */}
      <SectionContainer className="pb-8 pt-20 sm:pt-28">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl font-semibold leading-[1.06] tracking-tight text-text-primary sm:text-6xl">
            I build websites for local businesses, and I show my work.
          </h1>

          <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-text-primary">
            Not templates. Not a page builder with your logo dropped in. Real
            sites, built fast with AI and finished by hand — a food truck&rsquo;s
            ordering page, a coffee shop, a review system that runs itself.
          </p>

          <p className="mt-5 max-w-[62ch] leading-relaxed text-text-secondary">
            Every claim on this page has a live link or a commit behind it,
            including the parts that went wrong. That is the whole pitch: you can
            check it.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="https://www.linkedin.com/in/joshescusa"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-7 py-3 text-base font-medium text-background transition-colors hover:bg-accent-hover"
            >
              Start a conversation
            </a>
            <a
              href="#samples"
              className="text-sm font-medium text-text-secondary underline underline-offset-4 transition-colors hover:text-accent"
            >
              Or open a sample first
            </a>
          </div>
        </div>
      </SectionContainer>

      {/* ── Proof ─────────────────────────────────────────────────────── */}
      <SectionContainer className="py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
          Work that shipped
        </h2>

        <dl className="mt-10 divide-y divide-border border-y border-border">
          {proof.map((p) => (
            <div
              key={p.name}
              className="grid gap-2 py-8 sm:grid-cols-[1fr_2fr] sm:gap-10"
            >
              <dt>
                <span className="font-display text-lg font-semibold text-text-primary">
                  {p.href ? (
                    <a
                      href={p.href}
                      className="underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent"
                    >
                      {p.name}
                    </a>
                  ) : (
                    p.name
                  )}
                </span>
                <span className="mt-1 block text-sm text-text-secondary">
                  {p.kind}
                </span>
              </dt>
              <dd>
                <p className="font-medium text-text-primary">{p.result}</p>
                <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
                  {p.detail}
                </p>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
          No testimonials here, because I don&rsquo;t have any on record yet.
          When I do, they&rsquo;ll go where you can check them too.
        </p>
      </SectionContainer>

      {/* ── The gallery ───────────────────────────────────────────────── */}
      <SectionContainer id="samples" className="py-16">
        <div className="max-w-3xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            Samples
          </h2>
          <p className="mt-5 max-w-[62ch] leading-relaxed text-text-primary">
            One résumé — mine, the real one — designed four different ways. Same
            facts in all four, so the only variable is the design. Open them and
            see how far the look can move while the content sits still.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {samples.map((s) => (
            <Link
              key={s.slug}
              href={`/web-design/resume-sample/${s.slug}`}
              className="group block overflow-hidden rounded-2xl transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transform-none motion-reduce:transition-none"
              style={{ background: s.cardBg, color: s.cardInk }}
            >
              <div className="flex h-full flex-col p-7">
                <div className="flex gap-1.5" aria-hidden="true">
                  {s.palette.map((c) => (
                    <span
                      key={c}
                      className="h-3 w-3 rounded-full ring-1 ring-inset ring-white/20"
                      style={{ background: c }}
                    />
                  ))}
                </div>

                <h3
                  className="mt-6 font-display text-xl font-semibold tracking-tight"
                  style={{ color: s.cardAccent }}
                >
                  {s.name}
                </h3>

                <p className="mt-3 text-sm leading-relaxed opacity-85">
                  {s.thesis}
                </p>

                <p className="mt-auto pt-7 text-sm font-medium">
                  <span className="underline decoration-current/40 underline-offset-4 group-hover:decoration-current">
                    Open the sample
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-text-secondary">
          <Link
            href="/web-design/resume-sample"
            className="underline underline-offset-4 transition-colors hover:text-accent"
          >
            See all four side by side
          </Link>
        </p>
      </SectionContainer>

      {/* ── Close ─────────────────────────────────────────────────────── */}
      <SectionContainer className="pb-24 pt-8">
        <div className="max-w-2xl border-t border-border pt-12">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary">
            If you need a site
          </h2>
          <p className="mt-5 max-w-[62ch] leading-relaxed text-text-primary">
            Tell me what your business does and what the site has to accomplish.
            I&rsquo;ll tell you honestly whether I&rsquo;m the right person for
            it — the food truck needed ordering, the coffee shop needed a menu
            and a map, and those are different jobs.
          </p>
          <p className="mt-5 max-w-[62ch] leading-relaxed text-text-secondary">
            I haven&rsquo;t set public pricing yet, so that part is a
            conversation rather than a number on a page.
          </p>
          <a
            href="https://www.linkedin.com/in/joshescusa"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-accent px-7 py-3 text-base font-medium text-background transition-colors hover:bg-accent-hover"
          >
            Message me on LinkedIn
          </a>
        </div>
      </SectionContainer>
    </>
  );
}
