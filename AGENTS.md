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

| File | Where it shows |
|---|---|
| `<slug>-hero.webp` | in-page and grid card, dark theme |
| `<slug>-hero-light.webp` | the same art on paper, light theme |
| `<slug>.webp` | the social card |

**Keep the spec.** It lives at `scripts/heroes/<slug>.json` and is committed, so
the image can be re-rendered when the template changes. The first version of
this script took its spec as a throwaway argument; when the template was
redesigned every spec had to be reconstructed from the alt text.

```json
{
  "tone": "bad",
  "before": { "label": "What my dashboard said", "text": "Published" },
  "after":  { "label": "What the URL returned", "text": "404 — not found",
              "detail": "52 passing tests · none of them caught it" },
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
true — because the headline already carries the words. `tone` colours the second
panel and is the whole mood of the image: `bad` (red), `good` (green), `warn`
(amber), `info` (blue), `accent` (burnt orange). Every one is an on-token value
from DESIGN.md; don't introduce a colour that isn't in that list.

Write for the smallest place it appears. The grid renders the hero at about
500px wide, so `before.text` and `after.text` are clauses of roughly 30
characters — long ones are auto-shrunk, which is a fallback, not a licence. Put
the numbers in `detail`.

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
a check that *enforces* something about content has to reach `main` no earlier
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
