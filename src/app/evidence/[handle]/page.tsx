import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProfile, profiles } from '@/data/evidence';
import { adjudicate, byCategory, RULES } from '@/lib/adjudicate';
import { SectionContainer } from '@/components/ui';
import {
  FigureStrip,
  Points,
  VerdictMark,
  VerdictRow,
  statusText,
} from '@/components/evidence/parts';
import { formatDate } from '@/lib/format';

export function generateStaticParams() {
  return profiles.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = getProfile(handle);
  if (!profile) return {};

  const { counters } = adjudicate(profile);
  const description = `${counters.projects} projects, ${counters.deployed} deployed, ${counters.openableArtifacts} artifacts you can open. ${counters.skillsEvidenced} skill claims evidenced and ${counters.claimsRefused} refused — graded by rules the author does not get to argue with.`;

  return {
    title: `${profile.name} — evidence of capability · SmartDisruptions`,
    description,
    alternates: { canonical: `/evidence/${profile.handle}` },
    openGraph: {
      title: `${profile.name} — what the work actually shows`,
      description,
      url: `/evidence/${profile.handle}`,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profile.name} — what the work actually shows`,
      description,
    },
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = getProfile(handle);
  if (!profile) notFound();

  const { counters, verdicts, refused, attested, gaps } = adjudicate(profile);
  const grouped = byCategory(verdicts);
  const studies = [...profile.caseStudies].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: new Date(profile.recordFrom).toISOString(),
    dateModified: new Date(profile.recordTo).toISOString(),
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      description: profile.tagline,
      url: `https://smartdisruptions.com/evidence/${profile.handle}`,
    },
  };

  return (
    <SectionContainer className="py-16 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <div className="mx-auto max-w-4xl">
        <Link
          href="/evidence"
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
        >
          &larr; The Evidence Engine
        </Link>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          {profile.photo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={profile.photo}
              alt=""
              width={88}
              height={88}
              className="h-22 w-22 shrink-0 rounded-full border border-border object-cover"
            />
          )}
          <div>
            <p className="font-mono-accent text-accent">
              Evidence of capability
            </p>
            <h1 className="font-display mt-3 text-4xl font-semibold leading-[1.08] tracking-tight text-text-primary sm:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-2 max-w-[52ch] text-lg text-text-secondary">
              {profile.tagline}
            </p>
          </div>
        </header>

        <p className="mt-8 max-w-[62ch] text-lg leading-[1.75] text-text-secondary">
          {profile.intro}
        </p>

        <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {profile.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {l.label}
            </a>
          ))}
        </p>

        {/* ── The figures ─────────────────────────────────────────────── */}
        <div className="mt-12">
          <FigureStrip
            figures={[
              { label: 'Projects on record', value: String(counters.projects) },
              { label: 'Deployed', value: String(counters.deployed) },
              {
                label: 'Used by someone else',
                value: String(counters.usedByOthers),
              },
              {
                label: 'Artifacts you can open',
                value: String(counters.openableArtifacts),
                tone: 'bull',
              },
              {
                label: 'Claims evidenced',
                value: String(counters.skillsEvidenced),
                tone: 'bull',
              },
              {
                label: 'Claims refused',
                value: String(counters.claimsRefused),
                tone: 'bear',
              },
            ]}
          />
          <p className="mt-3 max-w-[62ch] text-sm text-text-secondary">
            Record kept from {formatDate(profile.recordFrom)} to{' '}
            {formatDate(profile.recordTo)} &mdash; {counters.recordSpanDays}{' '}
            days. Every date below is the day the work happened, not the day it
            was written up.
          </p>
        </div>

        {/* ── The verdict summary ─────────────────────────────────────── */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            {verdicts.length} claims submitted. The engine graded them.
          </h2>
          <p className="mt-4 max-w-[62ch] leading-[1.75] text-text-secondary">
            <span className={statusText.evidenced}>
              {counters.skillsEvidenced} evidenced
            </span>{' '}
            &mdash; backed by dated work with something a stranger can open.{' '}
            <span className={statusText.attested}>
              {attested.length} attested only
            </span>{' '}
            &mdash; real and dated, but every artifact behind it is private.{' '}
            <span className={statusText.refused}>
              {counters.claimsRefused} refused
            </span>{' '}
            &mdash; nothing in the record backs them, so the engine will not
            certify them at any strength.
          </p>
          <p className="mt-4 max-w-[62ch] leading-[1.75] text-text-secondary">
            The refusals are not an oversight left in for honesty points. They
            are the reason the rest of the page is worth reading:{' '}
            <Link
              href="#refusals"
              className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
            >
              a system that cannot say no has not said yes either
            </Link>
            .
          </p>
        </section>

        {/* ── Skills by category ──────────────────────────────────────── */}
        {grouped.map((group) => (
          <section key={group.category} className="mt-14">
            <h2 className="font-mono-accent text-accent">{group.category}</h2>
            <ul className="mt-4" role="list">
              {group.verdicts.map((v) => (
                <VerdictRow key={v.claim.id} verdict={v} />
              ))}
            </ul>
          </section>
        ))}

        {/* ── The projects ────────────────────────────────────────────── */}
        <section className="mt-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            The work behind it
          </h2>
          <p className="mt-3 max-w-[62ch] leading-[1.75] text-text-secondary">
            Ten fields per project. Nine are context. The one that matters is{' '}
            <span className="text-accent">what judgment was mine</span> &mdash;
            because when the output is cheap, the calls a person made are the
            only scarce thing left.
          </p>

          <ul
            className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2"
            role="list"
          >
            {studies.map((s) => (
              <li key={s.slug} className="h-full">
                <Link
                  href={`/evidence/${profile.handle}/${s.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_10px_30px_-12px_var(--sd-card-shadow)]"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-xs text-text-secondary">
                      {formatDate(s.date)}
                    </span>
                    {s.deployed && (
                      <span className="font-mono-accent text-bull">
                        Deployed
                      </span>
                    )}
                    {s.usedByOthers && (
                      <span className="font-mono-accent text-accent">
                        Used by someone else
                      </span>
                    )}
                  </div>
                  <h3 className="font-display mt-3 text-xl font-semibold leading-snug tracking-tight text-text-primary transition-colors group-hover:text-accent">
                    {s.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-4 text-sm leading-relaxed text-text-secondary">
                    {s.headline}
                  </p>
                  <div className="mt-auto pt-5 text-sm">
                    <span className="text-text-secondary">
                      {s.evidence.filter((e) => e.access === 'public').length}{' '}
                      openable &middot; {s.adjudication.doesNotShow.length}{' '}
                      stated limits
                    </span>
                    <span className="float-right font-medium text-accent">
                      Read &rarr;
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ── The refusal ─────────────────────────────────────────────── */}
        <section id="refusals" className="mt-20 scroll-mt-24">
          <p className="font-mono-accent text-bear">The refusal</p>
          <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
            What this record will not certify
          </h2>
          <p className="mt-4 max-w-[62ch] leading-[1.75] text-text-secondary">
            Anyone can generate flattery. A page with the standing to say{' '}
            <span className="text-bear">not yet</span> is the one worth
            believing &mdash; and it doubles as the most useful thing here,
            because it names exactly what to build next.
          </p>

          {refused.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-lg font-semibold text-text-primary">
                Claims the engine refused outright
              </h3>
              <ul className="mt-4" role="list">
                {refused.map((v) => (
                  <li key={v.claim.id} className="border-t border-border py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      <h4 className="font-display font-semibold text-text-primary">
                        {v.claim.name}
                      </h4>
                      <VerdictMark status={v.status} />
                    </div>
                    <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary italic">
                      &ldquo;{v.claim.claim}&rdquo;
                    </p>
                    <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
                      {v.reason}
                      {v.claim.limit ? ` ${v.claim.limit}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12">
            <h3 className="font-display text-lg font-semibold text-text-primary">
              Gaps in the shape of the record
            </h3>
            <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
              The first group the engine found by counting. The second Josh
              wrote down himself, because a machine cannot see the shape of a
              career from ten projects.
            </p>
            <ul className="mt-6" role="list">
              {gaps.map((g, i) => (
                <li key={i} className="border-t border-border py-5">
                  <p className="font-mono-accent text-text-secondary">
                    {g.source === 'derived'
                      ? 'Found by the engine'
                      : 'Declared by Josh'}
                  </p>
                  <p className="mt-2 max-w-[62ch] leading-[1.7] text-text-primary">
                    {g.gap}
                  </p>
                  <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
                    <span className="text-bull">What would close it.</span>{' '}
                    {g.wouldClose}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── The rules ───────────────────────────────────────────────── */}
        <section className="mt-20 border-t border-border pt-10">
          <p className="font-mono-accent text-text-secondary">
            How this was graded
          </p>
          <h2 className="font-display mt-3 text-xl font-semibold tracking-tight text-text-primary">
            Four rules, applied by code, not by the person being graded
          </h2>
          <ul className="mt-6 flex flex-col gap-5" role="list">
            {RULES.map((r) => (
              <li key={r.id} className="max-w-[62ch]">
                <p className="leading-[1.7] text-text-primary">
                  <span className="font-mono text-accent">{r.id}.</span>{' '}
                  {r.rule}
                </p>
                <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-text-secondary">
                  {r.detail}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-8 max-w-[62ch]">
            <Points
              items={[
                'The claims on this page are written by Josh. The verdicts are not — they are computed from the data by a function that takes no opinion, and the same data always produces the same page.',
                'Improving a grade here requires doing more work. There is no wording that moves a refusal to evidenced.',
              ]}
            />
          </div>
          <p className="mt-6 max-w-[62ch] text-sm text-text-secondary">
            <Link
              href="/evidence"
              className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
            >
              How the Evidence Engine works &rarr;
            </Link>
          </p>
        </section>
      </div>
    </SectionContainer>
  );
}
