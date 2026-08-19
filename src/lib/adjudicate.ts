/**
 * THE EVIDENCE ENGINE — the adjudicator.
 *
 * This is the part that makes the difference between a portfolio and a record.
 * It reads `src/data/evidence.ts` and grades it against four rules. It is
 * deterministic, it takes no arguments beyond the data, and — this is the
 * whole design — the person whose page it is cannot talk it out of a verdict.
 * Improving a grade requires doing more work, not writing better copy.
 *
 * A proof system that never says no is a certificate mill.
 *
 * THE RULES
 * ---------
 *  1. Every skill claim links to a dated artifact. No artifact, no claim.
 *  2. Timestamps come from the work, not from the assertion.
 *  3. Evidence a stranger cannot open is testimony, not proof.
 *  4. The engine names what it will not certify, and why.
 *
 * Rule 3 is the one that costs something. A great deal of real work happens
 * behind an employer's walls or in a private repository, and it is genuinely
 * real — but a claim resting only on it cannot be checked by the reader, and
 * a system that pretends otherwise is lying on the author's behalf. Those
 * claims come back `attested` rather than `evidenced`, and the page prints
 * the distinction.
 */

import type {
  CaseStudy,
  EvidenceLink,
  Profile,
  SkillClaim,
} from '@/data/evidence';

export const RULES = [
  {
    id: 1,
    rule: 'Every skill claim links to a dated artifact.',
    detail: 'No artifact, no claim. The claim is not softened — it is refused.',
  },
  {
    id: 2,
    rule: 'Timestamps come from the work, not the assertion.',
    detail:
      'Every date here is the day the work happened, taken from a record kept at the time. A record written afterwards is a memory.',
  },
  {
    id: 3,
    rule: 'Evidence a stranger cannot open is testimony, not proof.',
    detail:
      'Private repositories and employer systems still count as a record. They do not count as proof, and a claim resting only on them is downgraded.',
  },
  {
    id: 4,
    rule: 'The engine names what it will not certify, and why.',
    detail:
      'Every project states what it does not demonstrate, and what would close the gap. A page that only flatters is worth nothing to a reader deciding whether to trust it.',
  },
] as const;

/**
 * How a claim came out.
 *
 * `evidenced` — backed by at least one project with at least one artifact a
 *               stranger can open.
 * `attested`  — backed by real, dated projects whose evidence is all private.
 *               True as far as it goes, uncheckable by the reader.
 * `refused`   — nothing links to it. Rule 1.
 */
export type ClaimStatus = 'evidenced' | 'attested' | 'refused';

export interface Verdict {
  claim: SkillClaim;
  status: ClaimStatus;
  /** Case studies offered in support that actually resolve. */
  supporting: CaseStudy[];
  /** The subset of their evidence a stranger can open. */
  openable: EvidenceLink[];
  /** Plain-language statement of why this status, printed on the page. */
  reason: string;
}

export interface Counters {
  projects: number;
  deployed: number;
  usedByOthers: number;
  skillsEvidenced: number;
  claimsRefused: number;
  openableArtifacts: number;
  /** Days between the first and last dated entry in the record. */
  recordSpanDays: number;
}

export interface Gap {
  gap: string;
  wouldClose: string;
  /** Derived by the engine from the data, or declared by the person. */
  source: 'derived' | 'declared';
}

export interface Adjudicated {
  profile: Profile;
  counters: Counters;
  verdicts: Verdict[];
  /** Just the refusals and downgrades, for the panel that leads with them. */
  refused: Verdict[];
  attested: Verdict[];
  gaps: Gap[];
}

const isOpenable = (e: EvidenceLink): boolean =>
  e.access === 'public' && typeof e.href === 'string' && e.href.length > 0;

/** Every evidence item across a set of case studies that a stranger can open. */
function openableAcross(studies: CaseStudy[]): EvidenceLink[] {
  return studies.flatMap((s) => s.evidence.filter(isOpenable));
}

/**
 * Grade one claim.
 *
 * Note the order: resolution first, then openability. A claim pointing at a
 * project that does not exist is refused for the same reason as a claim
 * pointing at nothing — a dangling reference is not weaker evidence, it is
 * an absence of evidence wearing a link's clothes.
 */
export function adjudicateClaim(claim: SkillClaim, all: CaseStudy[]): Verdict {
  const supporting = claim.evidence
    .map((slug) => all.find((c) => c.slug === slug))
    .filter((c): c is CaseStudy => Boolean(c));

  if (supporting.length === 0) {
    return {
      claim,
      supporting: [],
      openable: [],
      status: 'refused',
      reason:
        'Nothing in the record is offered as evidence for this. Rule 1: no artifact, no claim.',
    };
  }

  const openable = openableAcross(supporting);
  const projectWord = supporting.length === 1 ? 'project' : 'projects';

  if (openable.length === 0) {
    return {
      claim,
      supporting,
      openable,
      status: 'attested',
      reason: `Backed by ${supporting.length} dated ${projectWord}, but every artifact behind it is private. Rule 3: you can read this claim; you cannot check it.`,
    };
  }

  const artifactWord = openable.length === 1 ? 'artifact' : 'artifacts';
  return {
    claim,
    supporting,
    openable,
    status: 'evidenced',
    reason: `Backed by ${supporting.length} dated ${projectWord} and ${openable.length} ${artifactWord} you can open right now.`,
  };
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / 86_400_000));
}

/**
 * Gaps the engine can see for itself, without being told.
 *
 * These are deliberately mechanical. The engine is not trying to be insightful
 * about a career; it is checking whether the shape of the record supports the
 * shape of the claims. Anything it cannot derive, the person declares — and
 * the page labels which is which, because a gap somebody volunteered and a gap
 * a machine found are worth different amounts.
 */
export function deriveGaps(profile: Profile, verdicts: Verdict[]): Gap[] {
  const gaps: Gap[] = [];
  const studies = profile.caseStudies;

  const attested = verdicts.filter((v) => v.status === 'attested');
  if (attested.length > 0) {
    gaps.push({
      source: 'derived',
      gap: `${attested.length} ${attested.length === 1 ? 'claim rests' : 'claims rest'} entirely on work nobody outside can open — ${attested
        .map((v) => v.claim.name.toLowerCase())
        .join(', ')}. Real, dated, and uncheckable.`,
      wouldClose:
        'One openable artifact per claim: a public URL, a public repository, or a written breakdown carrying the transferable part without exposing anything internal.',
    });
  }

  const withMetric = studies.filter((s) =>
    s.evidence.some((e) => e.kind === 'metric' && isOpenable(e))
  );
  // Fires when fewer than half the projects carry a checkable number. A fixed
  // threshold would drift as the record grows — ten projects with two numbers
  // and a hundred with two are not the same problem.
  if (withMetric.length * 2 < studies.length) {
    gaps.push({
      source: 'derived',
      gap: `Only ${withMetric.length} of ${studies.length} projects carry a number a stranger can verify. Most of the measurement here is self-reported.`,
      wouldClose:
        'Published usage, traffic, revenue or performance figures on at least three projects, from a source that is not me.',
    });
  }

  const external = studies.filter((s) => s.usedByOthers);
  if (external.length < studies.length / 2) {
    gaps.push({
      source: 'derived',
      gap: `${external.length} of ${studies.length} projects have been used by anyone other than me. The rest are tools I built for myself, and a tool with one user has never had its assumptions tested.`,
      wouldClose:
        'Two more projects with real outside users and something written about what they broke.',
    });
  }

  return gaps;
}

/**
 * Grade the whole record.
 *
 * Pure and synchronous, so pages can call it during the static render and the
 * verdicts ship as HTML. There is nothing to configure: the same data always
 * produces the same page.
 */
export function adjudicate(profile: Profile): Adjudicated {
  const studies = profile.caseStudies;
  const verdicts = profile.skills.map((claim) =>
    adjudicateClaim(claim, studies)
  );

  const counters: Counters = {
    projects: studies.length,
    deployed: studies.filter((s) => s.deployed).length,
    usedByOthers: studies.filter((s) => s.usedByOthers).length,
    skillsEvidenced: verdicts.filter((v) => v.status === 'evidenced').length,
    claimsRefused: verdicts.filter((v) => v.status === 'refused').length,
    openableArtifacts: studies.flatMap((s) => s.evidence.filter(isOpenable))
      .length,
    recordSpanDays: daysBetween(profile.recordFrom, profile.recordTo),
  };

  const derived = deriveGaps(profile, verdicts);
  const declared: Gap[] = profile.declaredGaps.map((g) => ({
    ...g,
    source: 'declared',
  }));

  return {
    profile,
    counters,
    verdicts,
    refused: verdicts.filter((v) => v.status === 'refused'),
    attested: verdicts.filter((v) => v.status === 'attested'),
    gaps: [...derived, ...declared],
  };
}

/** Verdicts for one project, so a case study page can print its own grades. */
export function verdictsForStudy(
  study: CaseStudy,
  profile: Profile
): Verdict[] {
  return profile.skills
    .filter((claim) => study.skills.includes(claim.id))
    .map((claim) => adjudicateClaim(claim, profile.caseStudies));
}

/** Group verdicts by the claim's category, preserving first-seen order. */
export function byCategory(
  verdicts: Verdict[]
): { category: string; verdicts: Verdict[] }[] {
  const groups: { category: string; verdicts: Verdict[] }[] = [];
  for (const v of verdicts) {
    const existing = groups.find((g) => g.category === v.claim.category);
    if (existing) existing.verdicts.push(v);
    else groups.push({ category: v.claim.category, verdicts: [v] });
  }
  return groups;
}
