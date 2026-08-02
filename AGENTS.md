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

Only a small YAML subset is supported (scalars, inline arrays, and one level of
block-list objects for `channels`). Anything outside it throws rather than being
half-parsed. Long prose belongs in the body, not in frontmatter.

## Images — generate them, don't skip them

Writing an article is not finished until it has both images. Generate them:

```bash
node scripts/make-hero.mjs <slug> spec.json
```

It writes `public/images/content/<slug>-hero.webp` (the in-page card) and
`<slug>.webp` (the social card), then adds whatever frontmatter keys are
missing. Headless Chrome renders and encodes both — nothing to install.

The spec is what makes the image worth having:

```json
{
  "headline": [
    { "t": "My dashboard said " },
    { "t": "published.", "tone": "good" },
    { "t": " The URL said " },
    { "t": "404.", "tone": "bad" }
  ],
  "rows": [
    { "label": "WHAT MY DASHBOARD SAID", "value": "You don't get replaced…",
      "badge": "PUBLISHED", "tone": "good" },
    { "label": "WHAT THE URL SAID", "value": "/content/you-dont…",
      "badge": "404", "tone": "bad" }
  ],
  "alt": "One sentence for someone who can't see the image."
}
```

Run with no spec and it falls back to the title, which is a waste of an image.
The card should stage the post's **central contrast** — what I believed next to
what was true — because the headline already carries the words. Two rows, a
`good` one and a `bad` one, is the house pattern.

A post with a real screenshot or photograph already set as its `heroImage`
keeps it; the script then generates only the social card.

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
