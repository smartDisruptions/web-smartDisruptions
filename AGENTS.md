<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Writing articles

**New articles go on `dev`, as drafts. Never on `main`, never on a side branch.**

When asked to write an article, run a content day, or draft a post, create:

```
src/content/posts/<slug>.md
```

on the `dev` branch, with `status: draft` in the frontmatter. That is the only
step needed — the editorial dashboard (a separate app) reads `dev` over the
GitHub API and the article appears in its drafts, where Josh schedules and
publishes it.

Do not set `liveAt`, do not flip `status`, and do not merge to `main`.
Scheduling and publishing are decisions made by a person, not here.

## Frontmatter

```yaml
---
title: The headline, sentence case
slug: matches-the-filename
excerpt: One or two sentences. Shown on cards and as the social description.
category: Working With AI
publishDate: 2026-08-01
tags: [ai, workflow]
status: draft
channels: []
---
Article body in markdown.
```

`title`, `slug`, `excerpt`, `category`, `publishDate` and a body are all
required — the dashboard flags an article missing any of them. The filename
must match the slug. `heroImage` / `heroImageAlt` / `ogImage` are optional; see
an existing post for the convention.

Only a small YAML subset is supported (scalars, inline arrays, and one level of
block-list objects for `channels`). Anything outside it throws rather than being
half-parsed. Long prose belongs in the body, not in frontmatter.

## Voice

Josh's writing has a locked voice spec in his vault
(`Content and Teaching Skill Tree` § Voice). Load it before drafting — first
person, plain, short paragraphs, receipts over claims, peer-to-peer with no
labels for the reader, honest about what went wrong. If a draft reads like
generic AI prose, it is wrong.

## Checks

```bash
npm run test:posts   # frontmatter round-trips, the publish gate, real files
npm run build
```

The publish gate is the one to respect: `getPublishedPosts()` is the only list
the public site may render, and a `draft` is unreachable, unlisted, and absent
from the sitemap. That is what lets drafts sit on `main` safely. Don't route
around it.
