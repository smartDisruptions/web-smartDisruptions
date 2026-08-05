<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Writing articles

**New articles go on `dev`, staged. Never on `main`, never on a side branch.**

When asked to write an article, run a content day, or draft a post, create:

```
src/content/posts/<slug>.md
```

on the `dev` branch, with **`status: staged`** in the frontmatter.

Staged is deliberate, not a shortcut. The gate is environment-aware: staged
renders on **preview deployments only** and stays invisible on the live site.
So writing it staged means Josh can read it as it will actually look, on the
SSO-gated preview, the moment it is committed — without an extra trip to the
dashboard to make it visible, and without any risk of it reaching production.

**Do not set `liveAt`.** An undated staged article means "ready, Josh presses
publish when he wants". Setting a date means "publish itself then", and that
is a scheduling decision he makes, not one an authoring session makes.

**Do not set `status: published`, and do not merge to `main`.** Publishing is
a person's call.

Use `status: draft` only for a genuine stub with nothing worth looking at yet —
the New Article button in Studio does this. Anything with real prose in it
should be staged, because the whole point is that he can read it.

## Frontmatter

```yaml
---
title: The headline, sentence case
slug: matches-the-filename
excerpt: One or two sentences. Shown on cards and as the social description.
category: Working With AI
publishDate: 2026-08-01
tags: [ai, workflow]
status: staged
channels: []
---
Article body in markdown.
```

`title`, `slug`, `excerpt`, `category`, `publishDate` and a body are all
required — the dashboard flags an article missing any of them. The filename
must match the slug.

**Put today's date in `publishDate` and don't think about it.** It is a
placeholder until the article actually ships: `scripts/autopublish.mjs`
restamps it to the real day at the moment it flips `staged` → `published`.
That matters because an article can sit staged for a week, and the date is not
decoration — it is the schema.org `datePublished` asserted to Google and the
date printed on every card. Before this was automatic, one article claimed it
published a day before it did, and a staged one claimed a date while it had
never published at all.

If you publish **by hand** rather than through the scheduler, restamp the date
yourself in the same commit. `npm run test:posts` fails outright on a published
article dated in the future, and warns on an unpublished one whose date has
already passed — that warning is the one telling you to restamp.

Dates are anchored to Pacific (`scripts/publish-day.mjs`), never UTC.
`toISOString()` returns tomorrow from 5pm PT onward, which is how you get an
article dated a day ahead of itself.

**`heroImage`, `heroImageAlt` and `ogImage` are required too**, for anything
above `draft`. `npm run test:posts` fails without them, and fails again if a
path points at a file that isn't there. They used to be optional and made by
hand, which worked until the once nobody remembered — an article shipped with
no images and nothing noticed.

`heroImageLight` is optional but expected on a generated hero: it is the same
card grounded on paper, shown when the site is in its light theme. A photograph
or an app screenshot doesn't need one. If it is set, the file has to exist.

Only a small YAML subset is supported (scalars, inline arrays, and one level of
block-list objects for `channels`). Anything outside it throws rather than being
half-parsed. Long prose belongs in the body, not in frontmatter.

## Images — generate them, don't skip them

Writing an article is not finished until it has its images. Generate them:

```bash
node scripts/make-hero.mjs <slug> scripts/heroes/<slug>.json
```

It writes three files and adds whatever frontmatter keys are missing. Headless
Chrome renders and encodes all of them — nothing to install.

| File                     | Where it shows                     |
| ------------------------ | ---------------------------------- |
| `<slug>-hero.webp`       | in-page and grid card, dark theme  |
| `<slug>-hero-light.webp` | the same art on paper, light theme |
| `<slug>.webp`            | the social card                    |

**Keep the spec.** It lives at `scripts/heroes/<slug>.json` and is committed, so
the image can be re-rendered when the template changes. The first version of
this script took its spec as a throwaway argument; when the template was
redesigned every spec had to be reconstructed from the alt text.

```json
{
  "tone": "bad",
  "before": { "label": "What my dashboard said", "text": "Published" },
  "after": {
    "label": "What the URL returned",
    "text": "404 — not found",
    "detail": "52 passing tests · none of them caught it"
  },
  "headline": [
    { "t": "My dashboard said " },
    { "t": "published", "tone": "good" },
    { "t": ". The URL said " },
    { "t": "404", "tone": "bad" },
    { "t": "." }
  ],
  "alt": "One sentence for someone who can't see the image."
}
```

The picture is the post's **central contrast** — what I believed above what was
true — because the headline already carries the words. `tone` colours it and is
the whole mood of the image: `bad` (red), `good` (green), `warn` (amber), `info`
(blue), `accent` (burnt orange). Every one is an on-token value from DESIGN.md;
don't introduce a colour that isn't in that list.

Write for the smallest place it appears. The grid renders the hero at about
500px wide, so `before.text` and `after.text` are clauses of roughly 30
characters — long ones are auto-shrunk, which is a fallback, not a licence.

### The templates, and why you never pick one

Each template owns one **evidence key**. Putting that key in the spec is what
selects it. **There is no `template` field and there must not be one.**

| Add this key | Renders     | Use when                                              |
| ------------ | ----------- | ----------------------------------------------------- |
| nothing      | `split`     | the default, and most posts — one belief against one truth |
| `count`      | `count`     | a countable finding, 12 or fewer                      |
| `sequence`   | `sequence`  | things happened in an order and the order is the finding |
| `annotated`  | `annotated` | something reads fine and isn't — claims with their faults marked |

The one question to answer is **what evidence does this post have**, which is a
fact about the article. "Which template looks nicer here" is a taste call, and
taste calls don't survive this pipeline — three articles have been written in the
same two minutes before. A wrong treatment reads worse than a plain one, so when
no trigger clearly applies it's a `split`. That is the majority case by a wide
margin: six of the ten field notes are splits.

**Exactly one evidence key may be present.** Two is an error and the script
refuses to run: a post has one central piece of evidence, and if two look right
then the spec hasn't decided what the article is about yet.

There were ten of these. `console`, `receipt`, `versus`, `checklist`, `file` and
`field` were retired in August 2026 because each one turned out to be a split
wearing a costume — see the header of `scripts/make-hero.mjs` for the reasoning
and the bar that replaced the old one. Market Storm's four (`ledger`, `quote`,
`scorecard`, `logo`) are a different content type and are not affected.

A `count.of` above 12 stops being countable at a glance, so it renders `split`
and says so. Don't shrink the number to fit.

```json
"count": { "of": 8, "hit": 7, "unit": "claims checked" }
```

_8 claims checked_ over eight blocks with seven filled, under _**7 of 8**_.
`hit` is the number that broke, not the number that passed. `verdict` is
optional and usually wrong to set: if the title already says what the ratio
means, the ratio alone is the evidence and a verdict is a restatement.

```json
"sequence": { "steps": [ { "text": "build", "mark": true }, { "text": "mobile" } ],
              "verdict": "*Three of six* leaned on earlier work." }
```

Captions are one or two words — the rail and its numerals are the picture, and
the captions only name each step. Seven steps is the ceiling. `mark` fills a
node in the tone colour.

```json
"annotated": { "intro": "Three things in this are wrong.",
               "spans": [ { "text": "…the 2024 Gartner Retention Index", "flag": "Invented source" } ] }
```

Three flagged claims is the ceiling. This is the one template with a raised word
budget, because a reader has to be able to read the claim to see the flaw in it.

**`before` and `after` are always required**, whichever template renders: the
social card uses them and does not vary. Keep the labels short — they sit at
label tier, which is unreadable on a phone, so a long one spends the word budget
on the part nobody can read.

### Adding one

Append an entry to `REGISTRY` in `scripts/make-hero.mjs` with a `key` no other
template claims, a `render(theme)`, and optionally a `check` that returns a
string when the data can't be drawn. Then add a row to the table above. Nothing
else changes.

The bar is not "does this need its own data" — six templates cleared that and
were still retired. It is **can a `split` not draw this**. A console, a receipt,
a versus table and a checklist all resolve to two or three facts in a frame,
which is exactly what a split is; rendering the same posts both ways showed the
split was bigger, clearer and said the same thing.

The three that survive pass the real bar: `count` draws a quantity you see
rather than a number you read, `sequence` expresses order, and `annotated` marks
up three claims at once. If a `split` could carry it, it is a restyle of the
split, and the honest move is to improve the split.

### The social card never changes

Whatever the hero does, `<slug>.webp` is always the same design. The two images
have different jobs — the hero lives on an index where variety is the point, the
social card lives in a feed where being recognisable is. Don't add template
variants to the social card.

Run with no spec and it falls back to the title, which wastes the image.

A post with a real screenshot or photograph already set as its `heroImage` keeps
it, and the script generates only the social card. `--force` replaces an
existing hero — that flag is the only way to overwrite one, on purpose.

## What may go on `dev`, and what may not

**`dev` carries content only: articles and their images. Nothing else, ever.**

The scheduler promotes `dev` to production on its own, and promoting a branch
ships all of it. So it refuses to run whenever `dev` carries a file that is not
an article or an image — deciding to ship code with nobody watching is not a
thing a scheduler should do. That guard is correct and it is not going away.

What that means in practice:

- **An article and its images belong in ONE commit.** Not the post now and the
  hero later. A promote can land in the gap, and the article goes live with
  broken image links.
- **Tooling, scripts, config, docs and site code go straight to `main`** in
  their own PR. Never via `dev`. If it is not the article or its images, it does
  not belong on the drafting branch.

This is not theoretical. On 2026-08-02 a commit adding `scripts/make-hero.mjs`,
`scripts/test-posts.mjs` and this file went onto `dev` alongside an article, and
the scheduler correctly refused to publish anything for hours. The article was
fine. The tooling was fine. Putting them on the same branch was the mistake.

There is one ordering trap worth knowing, because it caught the fix for this:
a check that _enforces_ something about content has to reach `main` no earlier
than the content it checks. Ship them together, or main goes red in between.

Allowed on `dev`:

```
src/content/posts/<slug>.md
public/images/content/<slug>-hero.webp
public/images/content/<slug>-hero-light.webp
public/images/content/<slug>.webp
```

The hero spec (`scripts/heroes/<slug>.json`) is tooling, not content — it goes
to `main` with the rest of the scripts, never on `dev`.

## Voice

Josh's writing has a locked voice spec in his vault
(`Content and Teaching Skill Tree` § Voice). Load it before drafting — first
person, plain, short paragraphs, receipts over claims, peer-to-peer with no
labels for the reader, honest about what went wrong. If a draft reads like
generic AI prose, it is wrong.

## Checks

```bash
npm run test:posts   # frontmatter, the publish gate, real files, images present
npm run build
```

The publish gate is the one to respect: `getPublishedPosts()` is the only list
the public site may render, and a `draft` is unreachable, unlisted, and absent
from the sitemap. That is what lets drafts sit on `main` safely. Don't route
around it.
