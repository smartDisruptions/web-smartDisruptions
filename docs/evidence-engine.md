# The Evidence Engine

`/evidence` — the product page · `/evidence/<handle>` — a profile ·
`/evidence/<handle>/<project>` — a case study.

Turns a dated record of work into verifiable evidence of capability, and
refuses to certify what the record does not show.

## The one thing to understand

**The claims are authored. The verdicts are computed.** Those are two different
files and they must stay that way:

| File                    | Holds      | May contain                 |
| ----------------------- | ---------- | --------------------------- |
| `src/data/evidence.ts`  | the record | facts, claims, links, dates |
| `src/lib/adjudicate.ts` | the engine | rules only, no facts        |

`adjudicate()` is a pure function of the data. There is no configuration, no
override, and no way to write a claim persuasively enough to change its grade.
Improving a verdict requires doing more work and linking it.

If you ever find yourself editing `adjudicate.ts` to make a specific claim pass,
stop. That is the failure mode this whole thing exists to prevent.

## The four rules

1. **Every skill claim links to a dated artifact.** No artifact, no claim — the
   claim is refused, not softened.
2. **Timestamps come from the work, not the assertion.**
3. **Evidence a stranger cannot open is testimony, not proof.** A claim whose
   supporting artifacts are all private comes back `attested`, never
   `evidenced`.
4. **The engine names what it will not certify, and why.**

Three verdicts follow: `evidenced`, `attested`, `refused`.

## Adding a project

Append a `CaseStudy` to `caseStudies` in `src/data/evidence.ts` and list its
skill ids. Then run:

```bash
npm run test:evidence
```

The tests are not a formality — they have already caught four real errors in
this record:

- a claim pointing at a project id that did not exist
- a case study claiming a skill that did not list it back (the two directions
  have to agree)
- an evidence link marked `public` that pointed into the **private** vault
  repository, so it 404s for every reader
- an evidence link to an article that was still `staged`, which renders on
  preview builds and 404s on the live site

That last one is the subtle one. `getPublishedPosts()` is environment-aware by
design — a staged article renders on previews so it can be read before it
ships. That is the wrong gate for this record, which cites URLs on the **live**
site, so the test checks `status === 'published'` outright. The first version
used the environment-aware helper and passed a staged article.

## Marking evidence honestly

```ts
{ kind: 'live', label: '…', access: 'public', href: 'https://…' }   // openable
{ kind: 'code', label: '…', access: 'private', note: 'why not' }    // testimony
```

`access: 'public'` **requires** an `https://` href and the tests enforce it.
Never mark something public to make a claim score better — the downgrade is the
feature, and a link that 404s is worse than no link, because it invites the
reader to check and then wastes it.

Two hosts to keep straight:

- `github.com/smartDisruptions/web-smartDisruptions` — **public**, linkable.
- `github.com/smartDisruptions/josh-ai-builder-brain` — **private**, never
  linkable as public evidence. There is a test for exactly this.

## `deployed` vs the headline

`deployed` means something is running at a URL. It does not mean the feature the
case study is about has launched. Samurai Kitchen is the example: the site is
live, the ordering it describes is not — so it carries `deployedNote` and the
chip qualifies itself.

A green chip that asserts more than the prose beside it is the same
_status-is-not-liveness_ bug this repo has now hit four times. Use the note.

## Design

No coloured rails and no tinted sub-panels: structure is headings, dividers and
coloured text, per `DESIGN.md`. Verdict colours reuse the existing
`bull`/`warn`/`bear` semantic inks rather than adding a fourth axis.

`/evidence`, `/evidence/josh` and one case study are in the `design:audit`
route list. They pass baseline-clean; the only findings left are the three the
whole site carries deliberately (Inter, `kicker-above-heading`, and the em-dash
advisory).

One measure trap worth knowing, because it cost three findings: `max-w-[62ch]`
resolves against the element's **own** font size. Putting the cap on a base-size
parent and setting `text-sm` inside it yields ~89 characters per line, not 62.
Cap the small element itself.

## Checks

```bash
npm run test:evidence   # the rules, and whether the record is well-formed
npm run design:audit    # needs the site running on :3000
npm run build
```
