import type { Metadata } from 'next';
import Link from 'next/link';
import { profile } from '@/data/evidence';
import { adjudicate, RULES } from '@/lib/adjudicate';
import { SectionContainer } from '@/components/ui';
import { FigureStrip, Points, statusText } from '@/components/evidence/parts';

export const metadata: Metadata = {
  title:
    'The Evidence Engine — turn the work you did with AI into proof · SmartDisruptions',
  description:
    'Three years of your best thinking is sitting in a chat window nobody will ever read. This turns it into dated, linked, verifiable evidence of capability — and refuses to certify what the work does not show.',
  alternates: { canonical: '/evidence' },
  openGraph: {
    title: 'The Evidence Engine — your best work is trapped in a chat window',
    description:
      'Dated, linked, verifiable evidence of capability, assembled from the work you already did — with a system that is allowed to say no.',
    url: '/evidence',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Evidence Engine — your best work is trapped in a chat window',
    description:
      'Dated, linked, verifiable evidence of capability, assembled from the work you already did.',
  },
};

/**
 * The ten fields, as the engine captures them.
 *
 * Nine are context. One is the product, and it is marked — the emphasis is the
 * argument, so flattening this into an even list would lose the point of it.
 */
const SCHEMA = [
  { field: 'Problem', why: 'What you were actually trying to do.' },
  {
    field: 'Prior knowledge',
    why: 'What you knew before. The delta is the learning.',
  },
  {
    field: 'What you had to learn',
    why: 'The skills the problem demanded, not the ones you meant to practise.',
  },
  {
    field: 'Decisions, and why',
    why: 'The reasoning, not just the outcome.',
  },
  {
    field: 'Failures',
    why: 'The most credible section of any case study, and the first one people cut.',
  },
  { field: 'Iterations', why: 'What changed between versions.' },
  {
    field: 'What judgment was yours',
    why: 'Where you decided, what you rejected, and what would have happened otherwise.',
    star: true,
  },
  {
    field: 'What the AI did',
    why: 'Honest — and it is what makes everything above it believable.',
  },
  { field: 'Result', why: 'What ultimately worked.' },
  {
    field: 'Evidence',
    why: 'Live URLs, code, documents, measurements, what a person said.',
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Capture while the work happens',
    body: 'Not reconstructed from memory when you need a résumé. A record written three weeks later is a memory, and it shows: the decisions blur, the failures quietly disappear, and what is left is a summary of the outcome.',
  },
  {
    n: '02',
    title: 'Extract the ten fields',
    body: 'Nine of them are context. The tenth — what judgment was yours — is the product, and everything else exists to make it credible. Where the record does not show a decision, the engine asks rather than inventing one.',
  },
  {
    n: '03',
    title: 'Adjudicate',
    body: 'The refusal pass. Every claim is graded against rules the author does not get to argue with: no artifact, no claim; a private artifact is testimony, not proof. Improving a grade takes more work, not better wording.',
  },
  {
    n: '04',
    title: 'Publish the whole thing, refusals included',
    body: 'A public page with skills that carry their evidence, projects that carry their case studies, and dates that came from the work — plus a section naming what it does not show and what would close the gap.',
  },
];

export default function EvidenceEnginePage() {
  const { counters, verdicts } = adjudicate(profile);

  return (
    <SectionContainer className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <div className="max-w-3xl">
          <p className="font-mono-accent text-accent">The Evidence Engine</p>
          <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-text-primary sm:text-5xl">
            Your best work of the last three years is trapped in a chat window.
          </h1>
          <p className="mt-6 max-w-[62ch] text-lg leading-[1.75] text-text-secondary">
            You solved real problems in there. You made real calls &mdash; what
            to build, what to throw away, where the model was confidently wrong.
            At the end of it you have a spreadsheet, a document, or a working
            thing, and no way at all to show the competence behind it.
          </p>
          <p className="mt-4 max-w-[62ch] text-lg leading-[1.75] text-text-secondary">
            That problem did not exist in 2022. Course platforms hand out
            completion certificates. Portfolio sites host claims you wrote about
            yourself. Neither one has{' '}
            <span className="text-text-primary">the record of the work.</span>
          </p>
        </div>

        {/* ── The live example ────────────────────────────────────────── */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Here is one, running on real data
          </h2>
          <p className="mt-4 max-w-[62ch] leading-[1.75] text-text-secondary">
            Every product like this launches empty. This one does not. It is
            pointed at a year of my own dated build records, and the page it
            produced is below &mdash; graded by the engine, refusals and all.
          </p>

          <div className="mt-8">
            <FigureStrip
              figures={[
                {
                  label: 'Projects on record',
                  value: String(counters.projects),
                },
                {
                  label: 'Artifacts you can open',
                  value: String(counters.openableArtifacts),
                  tone: 'bull',
                },
                {
                  label: 'Claims submitted',
                  value: String(verdicts.length),
                },
                {
                  label: 'Evidenced',
                  value: String(counters.skillsEvidenced),
                  tone: 'bull',
                },
                {
                  label: 'Attested only',
                  value: String(
                    verdicts.filter((v) => v.status === 'attested').length
                  ),
                  tone: 'warn',
                },
                {
                  label: 'Refused',
                  value: String(counters.claimsRefused),
                  tone: 'bear',
                },
              ]}
            />
          </div>

          <p className="mt-6 text-sm">
            <Link
              href={`/evidence/${profile.handle}`}
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              Read {profile.name}&rsquo;s full record &rarr;
            </Link>
          </p>
        </section>

        {/* ── How it works ────────────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            How it works
          </h2>
          <ul className="mt-8 flex flex-col gap-8" role="list">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t border-border pt-6">
                <div className="flex flex-wrap items-baseline gap-x-4">
                  <span className="font-mono text-sm font-semibold text-accent [font-variant-numeric:tabular-nums]">
                    {s.n}
                  </span>
                  <h3 className="font-display text-xl font-semibold text-text-primary">
                    {s.title}
                  </h3>
                </div>
                <p className="mt-3 max-w-[62ch] leading-[1.75] text-text-secondary">
                  {s.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── The schema ──────────────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            Ten fields per project. One of them is the whole point.
          </h2>
          <p className="mt-4 max-w-[62ch] leading-[1.75] text-text-secondary">
            When the output is cheap, what stays scarce is{' '}
            <span className="text-accent">the calls a person made.</span> An
            engine that surfaces where you decided, what you rejected, and what
            would have happened otherwise is doing something no résumé,
            transcript or certificate does. The other nine fields are there to
            make that one believable.
          </p>

          <ul className="mt-8" role="list">
            {SCHEMA.map((f) => (
              <li
                key={f.field}
                className="flex flex-col gap-1 border-t border-border py-4 sm:flex-row sm:gap-6"
              >
                <span
                  className={`shrink-0 font-medium sm:w-56 ${
                    f.star ? 'text-accent' : 'text-text-primary'
                  }`}
                >
                  {f.field}
                </span>
                <span className="max-w-[52ch] leading-[1.7] text-text-secondary">
                  {f.why}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── The refusal ─────────────────────────────────────────────── */}
        <section className="mt-20">
          <p className="font-mono-accent text-bear">The refusal</p>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            A proof system that never says no is a certificate mill
          </h2>
          <p className="mt-4 max-w-[62ch] leading-[1.75] text-text-secondary">
            So this one says no. It will tell you, in as many words:{' '}
            <span className="text-text-primary italic">
              this shows you can prompt your way to a working formula. It does
              not yet show you can debug one that breaks.
            </span>{' '}
            That sentence is the entire credibility of the thing &mdash; and it
            is also the most useful output, because it tells you exactly what to
            build next.
          </p>

          <ul className="mt-8 flex flex-col gap-5" role="list">
            {RULES.map((r) => (
              <li
                key={r.id}
                className="max-w-[62ch] border-t border-border pt-5"
              >
                <p className="leading-[1.7] text-text-primary">
                  <span className="font-mono text-accent">{r.id}.</span>{' '}
                  {r.rule}
                </p>
                <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
                  {r.detail}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-8 max-w-[62ch] leading-[1.75] text-text-secondary">
            On my own record those rules come back{' '}
            <span className={statusText.evidenced}>
              {counters.skillsEvidenced} evidenced
            </span>
            ,{' '}
            <span className={statusText.attested}>
              {verdicts.filter((v) => v.status === 'attested').length} attested
              only
            </span>{' '}
            and{' '}
            <span className={statusText.refused}>
              {counters.claimsRefused} refused
            </span>
            . I wrote the claims. I did not get a vote on the verdicts.
          </p>
        </section>

        {/* ── Honest status ───────────────────────────────────────────── */}
        <section className="mt-20 border-t border-border pt-10">
          <p className="font-mono-accent text-text-secondary">
            Where this is up to
          </p>
          <h2 className="font-display mt-3 text-xl font-semibold tracking-tight text-text-primary">
            What is built, and what is not
          </h2>
          <div className="mt-6 max-w-[62ch]">
            <Points
              items={[
                'Built and live: the schema, the adjudicator, and a public profile generated from a real year of dated records — mine. The verdicts on that page are computed, not written.',
                "Not built yet: paste-your-own-transcript. Turning somebody else's chat history into a profile means holding the most sensitive text a person can hand over — work data, client names, personal context — and I am not opening that door before the privacy design is settled and written down as plainly as the rest of this site.",
                'So there is nothing to sign up for here, on purpose. When it opens, it opens with the storage posture stated up front.',
              ]}
            />
          </div>
          <p className="mt-8 text-sm">
            <Link
              href={`/evidence/${profile.handle}`}
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              See what it produced &rarr;
            </Link>
          </p>
        </section>
      </div>
    </SectionContainer>
  );
}
