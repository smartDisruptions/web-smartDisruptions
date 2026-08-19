/**
 * Tests for the Evidence Engine.
 *
 * Two jobs, and the second one is the important one.
 *
 * 1. The adjudicator does what it says: refuses a claim with nothing behind
 *    it, downgrades one whose evidence is all private, and passes one with an
 *    openable artifact. These run against synthetic fixtures, so a change to
 *    Josh's record can never quietly change what the rules mean.
 *
 * 2. The record itself is well-formed — every claim points at a project that
 *    exists, every public evidence item actually has a URL, every date is a
 *    real ISO date, every case study is reachable from a skill.
 *
 * The second half exists because the failure mode of a proof system is not a
 * crash. It is a page that renders beautifully while asserting something it
 * cannot back: a claim pointing at a deleted project, or a link marked public
 * with nothing behind it. Both look fine in a browser.
 *
 *   node --import ./scripts/ts-resolve-register.mjs scripts/test-evidence.mjs
 */
import { profile, profiles } from '../src/data/evidence.ts';
import { getAllPosts } from '../src/lib/posts.ts';
import { marketStormReports } from '../src/data/marketStorm.ts';
import {
  adjudicate,
  adjudicateClaim,
  deriveGaps,
} from '../src/lib/adjudicate.ts';

let pass = 0,
  fail = 0;
const ok = (label, cond, extra = '') => {
  if (cond) {
    pass++;
    console.log(`PASS  ${label}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}${extra ? '  — ' + extra : ''}`);
  }
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/* ── The rules, against fixtures ─────────────────────────────────────────── */

console.log('— the rules —');

const study = (over = {}) => ({
  slug: 'fixture',
  title: 'Fixture',
  headline: 'h',
  date: '2026-01-01',
  deployed: false,
  usedByOthers: false,
  problem: 'p',
  priorKnowledge: 'p',
  hadToLearn: [],
  decisions: [],
  failures: [],
  iterations: [],
  humanJudgment: [],
  aiContribution: [],
  result: 'r',
  evidence: [],
  skills: [],
  adjudication: { demonstrates: [], doesNotShow: [], wouldClose: [] },
  resumeBullet: 'b',
  ...over,
});

const claim = (over = {}) => ({
  id: 'c',
  name: 'C',
  category: 'Cat',
  claim: 'built a thing',
  evidence: [],
  ...over,
});

ok(
  'rule 1 — a claim with no supporting project is refused',
  adjudicateClaim(claim(), []).status === 'refused'
);

ok(
  'rule 1 — a claim pointing at a project that does not exist is refused, not weakened',
  adjudicateClaim(claim({ evidence: ['missing'] }), [study()]).status ===
    'refused'
);

ok(
  'rule 3 — a claim whose evidence is all private is attested, not evidenced',
  adjudicateClaim(claim({ evidence: ['fixture'] }), [
    study({
      evidence: [
        { kind: 'code', label: 'repo', access: 'private', note: 'private' },
        { kind: 'metric', label: 'n', access: 'private', note: 'private' },
      ],
    }),
  ]).status === 'attested'
);

ok(
  'rule 3 — one openable artifact is enough to reach evidenced',
  adjudicateClaim(claim({ evidence: ['fixture'] }), [
    study({
      evidence: [
        { kind: 'code', label: 'repo', access: 'private', note: 'private' },
        {
          kind: 'live',
          label: 'url',
          access: 'public',
          href: 'https://example.com',
        },
      ],
    }),
  ]).status === 'evidenced'
);

ok(
  'a public item with no href does not count as openable',
  adjudicateClaim(claim({ evidence: ['fixture'] }), [
    study({ evidence: [{ kind: 'live', label: 'url', access: 'public' }] }),
  ]).status === 'attested'
);

ok(
  'the verdict carries the projects it used',
  adjudicateClaim(claim({ evidence: ['fixture'] }), [study()]).supporting
    .length === 1
);

ok(
  'grading is pure — the same input twice gives the same verdict',
  JSON.stringify(adjudicate(profile).counters) ===
    JSON.stringify(adjudicate(profile).counters)
);

/* ── Derived gaps ────────────────────────────────────────────────────────── */

console.log('— derived gaps —');

{
  const one = study({ slug: 'a' });
  const attestedClaim = claim({ id: 'x', name: 'X', evidence: ['a'] });
  const verdicts = [adjudicateClaim(attestedClaim, [one])];
  const gaps = deriveGaps(
    {
      ...profile,
      caseStudies: [one],
      skills: [attestedClaim],
      declaredGaps: [],
    },
    verdicts
  );
  ok(
    'an attested claim produces a derived gap naming it',
    gaps.some((g) => g.gap.includes('nobody outside can open')),
    JSON.stringify(gaps.map((g) => g.gap.slice(0, 40)))
  );
  ok(
    'every derived gap says what would close it',
    gaps.every((g) => g.wouldClose)
  );
  ok(
    'every derived gap is labelled as derived',
    gaps.every((g) => g.source === 'derived')
  );
}

/* ── The record is well-formed ───────────────────────────────────────────── */

console.log('— the record —');

const all = adjudicate(profile);
const slugs = new Set(profile.caseStudies.map((c) => c.slug));

ok(
  'every profile has a handle',
  profiles.every((p) => p.handle && p.name)
);

ok(
  'every case-study slug is unique',
  slugs.size === profile.caseStudies.length,
  `${slugs.size} unique of ${profile.caseStudies.length}`
);

ok(
  'every skill id is unique',
  new Set(profile.skills.map((s) => s.id)).size === profile.skills.length
);

ok(
  'every skill points only at projects that exist',
  profile.skills.every((s) => s.evidence.every((slug) => slugs.has(slug))),
  profile.skills
    .flatMap((s) => s.evidence.filter((slug) => !slugs.has(slug)))
    .join(', ')
);

ok(
  'every skill id named on a case study exists',
  profile.caseStudies.every((c) =>
    c.skills.every((id) => profile.skills.some((s) => s.id === id))
  ),
  profile.caseStudies
    .flatMap((c) =>
      c.skills.filter((id) => !profile.skills.some((s) => s.id === id))
    )
    .join(', ')
);

ok(
  'the two directions agree — a project claiming a skill is listed by that skill',
  profile.caseStudies.every((c) =>
    c.skills.every((id) =>
      profile.skills.find((s) => s.id === id)?.evidence.includes(c.slug)
    )
  ),
  profile.caseStudies
    .flatMap((c) =>
      c.skills
        .filter(
          (id) =>
            !profile.skills.find((s) => s.id === id)?.evidence.includes(c.slug)
        )
        .map((id) => `${c.slug} -> ${id}`)
    )
    .join(', ')
);

ok(
  'every case study is reachable from at least one skill claim',
  profile.caseStudies.every((c) =>
    profile.skills.some((s) => s.evidence.includes(c.slug))
  ),
  profile.caseStudies
    .filter((c) => !profile.skills.some((s) => s.evidence.includes(c.slug)))
    .map((c) => c.slug)
    .join(', ')
);

ok(
  'every date is a real ISO date',
  profile.caseStudies.every(
    (c) => ISO.test(c.date) && !Number.isNaN(Date.parse(c.date))
  ) &&
    ISO.test(profile.recordFrom) &&
    ISO.test(profile.recordTo)
);

ok(
  'no dated entry falls outside the stated record window',
  profile.caseStudies.every(
    (c) => c.date >= profile.recordFrom && c.date <= profile.recordTo
  ),
  profile.caseStudies
    .filter((c) => c.date < profile.recordFrom || c.date > profile.recordTo)
    .map((c) => `${c.slug} ${c.date}`)
    .join(', ')
);

ok(
  'every public evidence item has a URL — rule 3 has no honour system',
  profile.caseStudies.every((c) =>
    c.evidence.every(
      (e) => e.access !== 'public' || (e.href && /^https?:\/\//.test(e.href))
    )
  ),
  profile.caseStudies
    .flatMap((c) =>
      c.evidence
        .filter((e) => e.access === 'public' && !e.href)
        .map((e) => `${c.slug}: ${e.label}`)
    )
    .join(', ')
);

ok(
  'every private evidence item says why it cannot be opened',
  profile.caseStudies.every((c) =>
    c.evidence.every(
      (e) => e.access !== 'private' || (e.note && e.note.length > 10)
    )
  ),
  profile.caseStudies
    .flatMap((c) =>
      c.evidence
        .filter((e) => e.access === 'private' && !e.note)
        .map((e) => `${c.slug}: ${e.label}`)
    )
    .join(', ')
);

ok(
  'every case study states what it does not show — rule 4',
  profile.caseStudies.every(
    (c) =>
      c.adjudication.doesNotShow.length > 0 &&
      c.adjudication.wouldClose.length > 0
  ),
  profile.caseStudies
    .filter(
      (c) =>
        !c.adjudication.doesNotShow.length || !c.adjudication.wouldClose.length
    )
    .map((c) => c.slug)
    .join(', ')
);

ok(
  'every case study names the judgment that was human — the field is the product',
  profile.caseStudies.every((c) => c.humanJudgment.length > 0),
  profile.caseStudies
    .filter((c) => !c.humanJudgment.length)
    .map((c) => c.slug)
    .join(', ')
);

ok(
  'every case study records at least one failure',
  profile.caseStudies.every((c) => c.failures.length > 0),
  profile.caseStudies
    .filter((c) => !c.failures.length)
    .map((c) => c.slug)
    .join(', ')
);

ok(
  'every case study carries a résumé line with a number in it',
  profile.caseStudies.every((c) => /\d/.test(c.resumeBullet)),
  profile.caseStudies
    .filter((c) => !/\d/.test(c.resumeBullet))
    .map((c) => c.slug)
    .join(', ')
);

ok(
  'a project marked used-by-others names who',
  profile.caseStudies.every((c) => !c.usedByOthers || Boolean(c.usedBy)),
  profile.caseStudies
    .filter((c) => c.usedByOthers && !c.usedBy)
    .map((c) => c.slug)
    .join(', ')
);

ok(
  'the counters agree with the data they are counted from',
  all.counters.projects === profile.caseStudies.length &&
    all.counters.deployed ===
      profile.caseStudies.filter((c) => c.deployed).length &&
    all.counters.skillsEvidenced +
      all.counters.claimsRefused +
      all.attested.length ===
      profile.skills.length
);

/* The engine has to be *able* to refuse, and on this record it does. A page
   where nothing was ever refused is indistinguishable from one where the rules
   are not running. */
ok(
  'the engine refused at least one claim on the live record',
  all.counters.claimsRefused > 0,
  `refused ${all.counters.claimsRefused}`
);

ok('the live record produces at least one gap', all.gaps.length > 0);

/* ── Cited URLs on this site actually resolve ────────────────────────────── */

/*
 * The failure this catches really happened, twice, while the record was being
 * written: a link to an article that was still STAGED (so it renders on
 * previews and 404s on the live site), and a link into a private repository
 * that 404s for everyone who is not Josh. Both looked like perfectly good
 * evidence on the page. A record whose links do not resolve is worse than one
 * with fewer links, because it invites the reader to check and then wastes it.
 */
console.log('— cited URLs —');

const SITE = 'https://smartdisruptions.com';
/*
 * `getPublishedPosts()` is deliberately environment-aware — a staged article
 * renders on preview deployments, which is what makes a read-before-you-ship
 * review possible. That is the wrong gate here: this record cites URLs on the
 * LIVE site, so the bar is `published` outright. Using the environment-aware
 * helper is what made the first version of this check pass a staged article.
 */
const publishedSlugs = new Set(
  getAllPosts()
    .filter((p) => p.status === 'published')
    .map((p) => p.slug)
);
const reportSlugs = new Set(marketStormReports.map((r) => r.slug));

const citedOnSite = profile.caseStudies.flatMap((c) =>
  c.evidence
    .filter((e) => e.access === 'public' && e.href?.startsWith(SITE))
    .map((e) => ({ study: c.slug, href: e.href }))
);

const badArticles = citedOnSite
  .filter((x) => x.href.includes('/content/'))
  .filter(
    (x) => !publishedSlugs.has(x.href.split('/content/')[1].replace(/\/$/, ''))
  );

ok(
  'every cited article on this site is actually published, not staged or draft',
  badArticles.length === 0,
  badArticles.map((x) => `${x.study}: ${x.href}`).join(', ')
);

const badReports = citedOnSite
  .filter((x) => /\/market-storm\/.+/.test(x.href))
  .filter(
    (x) =>
      !reportSlugs.has(x.href.split('/market-storm/')[1].replace(/\/$/, ''))
  );

ok(
  'every cited Market Storm report exists',
  badReports.length === 0,
  badReports.map((x) => `${x.study}: ${x.href}`).join(', ')
);

/*
 * The private knowledge base is private. A link into it renders as a working
 * link and 404s for every reader, so it may never be marked public.
 */
ok(
  'nothing public points into the private knowledge-base repository',
  profile.caseStudies.every((c) =>
    c.evidence.every(
      (e) => e.access !== 'public' || !e.href?.includes('josh-ai-builder-brain')
    )
  ),
  profile.caseStudies
    .flatMap((c) =>
      c.evidence
        .filter(
          (e) =>
            e.access === 'public' && e.href?.includes('josh-ai-builder-brain')
        )
        .map((e) => `${c.slug}: ${e.label}`)
    )
    .join(', ')
);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
