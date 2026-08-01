# Studio — the editor-in-chief dashboard

`/studio` is the private command center for the site's writing: every article
across every branch, when each one goes live, and where it gets distributed.

It is not a CMS. It edits **schedule and status**, never article prose — writing
still happens in the repo, in your editor. What the Studio owns is the editorial
layer on top: what exists, what's due, and the deliberate press that makes
something public.

## Setup

Three environment variables. Locally they go in `.env.local` (gitignored); on
Vercel, in the project's Environment Variables.

| Variable          | What it is                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `STUDIO_PASSWORD` | The password you type to sign in.                                                                 |
| `STUDIO_SECRET`   | A long random string used to sign session cookies. Rotating it signs every session out.           |
| `GITHUB_TOKEN`    | A GitHub token with `repo` scope. The Studio reads branches and commits schedule changes with it. |

Generate a secret with:

```bash
openssl rand -base64 32
```

Until all three are set, `/studio` shows a setup screen and refuses to sign
anyone in. There is deliberately no default password — an unconfigured Studio is
closed, not open.

## How content is stored

One markdown file per article at `src/content/posts/<slug>.md`. Frontmatter
carries the editorial state:

```yaml
---
title: You don't get replaced for being slow at AI
slug: you-dont-get-replaced-for-being-slow
excerpt: ...
category: Working With AI
publishDate: 2026-08-01
tags: [ai, workflow]
status: published # draft | scheduled | published
liveAt: 2026-09-15T16:30:00.000Z # scheduled posts only
channels:
  - name: linkedin
    status: done # planned | scheduled | done
    scheduledFor: 2026-09-16T15:00:00.000Z
---
Body markdown goes here.
```

Git is the single source of truth for both the article and its schedule. Every
Studio write is a commit, so there is no second store to drift out of sync and
the schedule's history is the repo's history.

## The publish gate

`getPublishedPosts()` is the only list the public site may render. A post is
public when:

- `status: published`, **or**
- `status: scheduled` and `liveAt` is in the past.

Anything else 404s, stays off `/content`, and is absent from the sitemap.
`scripts/test-posts.mjs` drops a draft into the store and asserts exactly that.

The second clause is a safety net, not the mechanism: if a scheduled press is
missed, the post still goes live at the next build rather than staying dark
forever. The intended path is that you press Publish.

## Workflow

`dev` is the drafting floor. `main` is live.

**New article** — or asking Claude for one — puts a file on `dev` with
`status: draft`. It appears in the Drafts column immediately. Nothing else is
needed: no branch to create, no PR to open.

**Schedule** writes `status: scheduled` and `liveAt` to the file on `dev`.

**Publish** flips `status` to `published` and merges `dev` into `main`, so the
article is live on smartdisruptions.com. It always asks for confirmation first,
and nothing publishes on a timer — making something public is a decision, so it
stays a press.

**What Publish actually ships:** everything currently on `dev`, not just that
one article. This is the same promote-to-production step that used to be done by
hand, so the confirm dialog says so rather than letting it surprise you. Other
drafts travelling along stay invisible, because the gate is status-based rather
than branch-based — that is the whole reason a draft can sit merged on `main`
safely.

An article authored on a side branch still works: Publish merges it into `dev`
first, then promotes.

## Views

- **Board** — every article grouped by draft / scheduled / published, showing
  which branch each lives on (normally `dev`). An article appearing on several
  branches collapses to the copy furthest along, with the rest listed as
  "also on".
- **Schedule** — what's dated, in date order, with what's overdue in red.
- **Channels** — a per-article grid of LinkedIn / Substack / Reddit / email.
  The Studio tracks the plan; it does not post to those platforms.

## Notes

- Writes carry the file's blob SHA, so if the same post changed elsewhere since
  the board loaded, the save is refused with "refresh and try again" rather than
  silently clobbering the newer version.
- A branch that fails to scan is reported on the board. A single malformed post
  degrades to one broken card instead of blanking everything.
- Branches with no `src/content/posts` directory drop out on their own, which
  keeps the repo's long tail of merged branches off the board without an ignore
  list.
- `/studio` sends `noindex, nofollow` and is absent from the sitemap.

## Tests

```bash
npm test          # both suites
npm run test:posts   # frontmatter round-trips, the publish gate, real files
npm run test:auth    # password, sessions, forged/expired tokens, unconfigured
```
