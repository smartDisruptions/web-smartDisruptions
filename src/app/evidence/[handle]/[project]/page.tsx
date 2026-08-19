import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProfile, profiles } from '@/data/evidence';
import { verdictsForStudy } from '@/lib/adjudicate';
import { SectionContainer } from '@/components/ui';
import {
  EvidenceList,
  Field,
  Points,
  Prose,
  VerdictMark,
  statusText,
} from '@/components/evidence/parts';
import { formatDate } from '@/lib/format';

export function generateStaticParams() {
  return profiles.flatMap((p) =>
    p.caseStudies.map((c) => ({ handle: p.handle, project: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; project: string }>;
}): Promise<Metadata> {
  const { handle, project } = await params;
  const profile = getProfile(handle);
  const study = profile?.caseStudies.find((c) => c.slug === project);
  if (!profile || !study) return {};

  return {
    title: `${study.title} — ${profile.name} · Evidence`,
    description: study.headline,
    alternates: { canonical: `/evidence/${handle}/${project}` },
    openGraph: {
      title: study.title,
      description: study.headline,
      url: `/evidence/${handle}/${project}`,
      type: 'article',
      publishedTime: new Date(study.date).toISOString(),
      authors: [profile.name],
    },
    twitter: {
      card: 'summary_large_image',
      title: study.title,
      description: study.headline,
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ handle: string; project: string }>;
}) {
  const { handle, project } = await params;
  const profile = getProfile(handle);
  const study = profile?.caseStudies.find((c) => c.slug === project);
  if (!profile || !study) notFound();

  const verdicts = verdictsForStudy(study, profile);
  const openable = study.evidence.filter(
    (e) => e.access === 'public' && e.href
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: study.title,
    abstract: study.headline,
    dateCreated: new Date(study.date).toISOString(),
    creator: { '@type': 'Person', name: profile.name },
    url: `https://smartdisruptions.com/evidence/${handle}/${study.slug}`,
  };

  return (
    <SectionContainer className="py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <article className="mx-auto max-w-3xl">
        <Link
          href={`/evidence/${handle}`}
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          &larr; {profile.name}&rsquo;s record
        </Link>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="font-mono text-sm text-text-secondary">
              {study.dateRange ?? formatDate(study.date)}
            </span>
            {study.deployed && (
              <span className="font-mono-accent text-bull">
                Deployed{study.deployedNote ? ` — ${study.deployedNote}` : ''}
              </span>
            )}
            {study.usedByOthers && (
              <span className="text-sm font-medium text-accent">
                {study.usedBy ?? 'Used by someone else'}
              </span>
            )}
          </div>
          <h1 className="font-display mt-5 text-3xl font-semibold leading-[1.12] tracking-tight text-text-primary sm:text-[2.5rem]">
            {study.title}
          </h1>
          <p className="mt-5 max-w-[62ch] text-lg leading-[1.7] text-text-secondary">
            {study.headline}
          </p>
        </header>

        {/* ── The judgment field, up top ──────────────────────────────── */}
        {/* Deliberately first, ahead of the chronological fields. It is the
            only one of the ten that a résumé, a transcript and a certificate
            all fail to carry, so burying it in schema order would put the
            product below the context that exists to make it credible. */}
        <section className="mt-14">
          <p className="font-mono-accent text-accent">What judgment was mine</p>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-text-primary">
            The calls, not the output
          </h2>
          <div className="mt-5 max-w-[62ch]">
            <Points items={study.humanJudgment} tone="accent" />
          </div>
        </section>

        {/* ── The rest of the ten fields ──────────────────────────────── */}
        <div className="mt-16 flex flex-col gap-10">
          <Field label="The problem">
            <Prose>{study.problem}</Prose>
          </Field>

          <Field label="What I knew before">
            <Prose>{study.priorKnowledge}</Prose>
          </Field>

          <Field label="What I had to learn">
            <Points items={study.hadToLearn} />
          </Field>

          <Field label="Decisions, and why">
            <ul className="flex flex-col gap-6" role="list">
              {study.decisions.map((d, i) => (
                <li key={i}>
                  <p className="leading-[1.7] font-medium text-text-primary">
                    {d.call}
                  </p>
                  <p className="mt-1.5 leading-[1.75] text-text-secondary">
                    {d.why}
                  </p>
                </li>
              ))}
            </ul>
          </Field>

          <Field label="What went wrong">
            {/* The most credible section of any case study, which is why it is
                not softened into "challenges". */}
            <Points items={study.failures} tone="bear" />
          </Field>

          <Field label="What changed between versions">
            <Points items={study.iterations} />
          </Field>

          <Field label="What the AI did">
            <Points items={study.aiContribution} />
          </Field>

          <Field label="Result">
            <Prose>{study.result}</Prose>
          </Field>

          <Field label="Evidence" starred>
            <p className="max-w-[62ch] text-sm leading-relaxed text-text-secondary">
              {openable.length} of {study.evidence.length} can be opened by
              anyone. The rest are named anyway, with the reason they cannot be.
            </p>
            <EvidenceList items={study.evidence} />
          </Field>
        </div>

        {/* ── The adjudication ────────────────────────────────────────── */}
        <section className="mt-20">
          <p className="font-mono-accent text-accent">The adjudication</p>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            What this proves, and what it doesn&rsquo;t
          </h2>

          <div className="mt-8 border-t border-border pt-6">
            <h3
              className={`font-mono text-[0.8rem] font-medium tracking-[0.04em] ${statusText.evidenced}`}
            >
              What it demonstrates
            </h3>
            <div className="mt-3 max-w-[62ch]">
              <Points items={study.adjudication.demonstrates} />
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h3
              className={`font-mono text-[0.8rem] font-medium tracking-[0.04em] ${statusText.refused}`}
            >
              What it does not show
            </h3>
            <div className="mt-3 max-w-[62ch]">
              <Points items={study.adjudication.doesNotShow} tone="bear" />
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="font-mono text-[0.8rem] font-medium tracking-[0.04em] text-accent">
              What would close the gap
            </h3>
            <div className="mt-3 max-w-[62ch]">
              <Points items={study.adjudication.wouldClose} tone="accent" />
            </div>
          </div>
        </section>

        {/* ── Claims this supports ────────────────────────────────────── */}
        {verdicts.length > 0 && (
          <section className="mt-20">
            <p className="font-mono-accent text-text-secondary">
              Claims this supports
            </p>
            <ul className="mt-4" role="list">
              {verdicts.map((v) => (
                <li key={v.claim.id} className="border-t border-border py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="font-display font-semibold text-text-primary">
                      {v.claim.name}
                    </h3>
                    <VerdictMark status={v.status} />
                  </div>
                  <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
                    {v.reason}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── The generated outputs ───────────────────────────────────── */}
        <section className="mt-20 border-t border-border pt-10">
          <p className="font-mono-accent text-text-secondary">Also generated</p>
          <h2 className="font-display mt-3 text-xl font-semibold tracking-tight text-text-primary">
            The same evidence, in the shapes people ask for it
          </h2>

          <div className="mt-8">
            <h3 className="font-mono-accent text-text-secondary">
              Résumé line
            </h3>
            {/* No coloured left rail here, deliberately. A tinted rail is one
                of the patterns the design auditor flags as machine-generated,
                and the house idiom is a divider plus coloured text. */}
            <p className="mt-3 max-w-[62ch] leading-[1.7] text-text-primary">
              {study.resumeBullet}
            </p>
          </div>

          {study.star && (
            <div className="mt-10">
              <h3 className="font-mono-accent text-text-secondary">
                Interview answer
              </h3>
              <dl className="mt-3 max-w-[62ch] flex flex-col gap-4">
                {(
                  [
                    ['Situation', study.star.situation],
                    ['Task', study.star.task],
                    ['Action', study.star.action],
                    ['Result', study.star.result],
                  ] as const
                ).map(([label, text]) => (
                  <div key={label}>
                    <dt className="font-mono text-xs uppercase tracking-[0.07em] text-accent">
                      {label}
                    </dt>
                    <dd className="mt-1 leading-[1.75] text-text-secondary">
                      {text}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>

        <p className="mt-16 text-sm">
          <Link
            href={`/evidence/${handle}`}
            className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
          >
            &larr; Back to the full record
          </Link>
        </p>
      </article>
    </SectionContainer>
  );
}
