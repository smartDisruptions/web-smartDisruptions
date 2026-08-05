import type { Metadata } from 'next';
import Link from 'next/link';
import { SectionContainer } from '@/components/ui';
import { samples } from '@/data/samples';
import { identity, disclosure } from '@/data/resume';

export const metadata: Metadata = {
  title: 'Web Design Resume Sample — SmartDisruptions',
  description:
    'One résumé, four visual worlds. The same facts designed four different ways, so the only variable is the design. Built by an AI agent in a single session.',
  openGraph: {
    title: 'Web Design Resume Sample — SmartDisruptions',
    description:
      'One résumé, four visual worlds. Same facts, four designs — open them and compare.',
    url: 'https://smartdisruptions.com/web-design/resume-sample',
    type: 'website',
  },
};

export default function ResumeSampleIndexPage() {
  return (
    <SectionContainer className="pb-24 pt-20">
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl font-semibold leading-[1.06] tracking-tight text-text-primary sm:text-5xl">
          One résumé, four worlds
        </h1>

        <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-text-primary">
          Every one of these renders the same record — {identity.name}, the real
          career, down to the last date. Nothing was softened for one design and
          sharpened for another. The content is a constant; only the design
          moves.
        </p>

        <p className="mt-5 max-w-[62ch] leading-relaxed text-text-secondary">
          That&rsquo;s the point of showing four. A design that looks inevitable
          usually just means nobody chose it. {disclosure}
        </p>
      </div>

      <div className="mt-14 space-y-5">
        {samples.map((s) => (
          <Link
            key={s.slug}
            href={`/web-design/resume-sample/${s.slug}`}
            className="group block overflow-hidden rounded-2xl transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transform-none motion-reduce:transition-none"
            style={{ background: s.cardBg, color: s.cardInk }}
          >
            <div className="grid gap-6 p-8 sm:grid-cols-[1fr_1.4fr] sm:gap-10 sm:p-10">
              <div>
                <h2
                  className="font-display text-2xl font-semibold tracking-tight"
                  style={{ color: s.cardAccent }}
                >
                  {s.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed opacity-70">
                  {s.lineage}
                </p>
                <div className="mt-6 flex gap-1.5" aria-hidden="true">
                  {s.palette.map((c) => (
                    <span
                      key={c}
                      className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/20"
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <p className="text-base leading-relaxed">{s.thesis}</p>
                <p className="mt-4 text-sm leading-relaxed opacity-75">
                  {s.signature}
                </p>
                <p className="mt-auto pt-8 text-sm font-medium">
                  <span className="underline decoration-current/40 underline-offset-4 group-hover:decoration-current">
                    Open {s.name}
                  </span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-12 text-sm text-text-secondary">
        <Link
          href="/web-design"
          className="underline underline-offset-4 transition-colors hover:text-accent"
        >
          Back to Web Design
        </Link>
      </p>
    </SectionContainer>
  );
}
