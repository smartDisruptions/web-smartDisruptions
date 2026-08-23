# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**The reader (primary, established).** A working professional who wants to learn
AI and not get left behind — Josh two years ago. They arrive from a link, read
one post, and leave either with something they can try today or nothing. They
are not a beginner to be talked down to and not an engineer to be impressed.

**The local business owner (new, for the web-design surface).** Someone who
needs a website or an ordering page and is deciding whether this person can
actually build it. They are not evaluating a portfolio the way a design
director would — they are looking for evidence that a real business like theirs
got a real working thing, and for a way to start a conversation.

**The design-curious visitor (new, for the sample surfaces).** Arrives at a
sample to see what is possible, not to hire anyone. Success is that they stay
inside the artifact and come away with a concrete sense of the ceiling.

## Product Purpose

Smart Disruptions is Josh Escusa's build-and-teach site: he builds real things
with AI — client sites, apps, tools, automations — and publishes how they
actually got made, including the parts that went wrong. Success for the site is
a reader who tries something, and (newly, on the web-design surface) a business
owner who starts a conversation.

## Positioning

Everything asserted on this site has a live URL, a commit, or a screenshot
behind it — including the failures. Josh has published his own security holes,
a dashboard that was public when he thought it was private, and a backend that
was dead for three months without anyone noticing. A neighboring "I build with
AI" site can copy the claim; it cannot copy a public record of being wrong in
specific, checkable ways.

The second half of the position: the AI's role is disclosed rather than hidden.
`/about` says outright that a model helps with the writing and that the
experiences, judgment, and final yes are Josh's.

## Operating Context

- Articles are drafted on the `dev` branch as `status: staged`, visible only on
  preview deployments; a scheduler promotes them. Site code goes to `main` by
  PR, never through `dev`. See AGENTS.md — this separation is load-bearing.
- Deployed on Vercel. Preview deployments are SSO-gated to Josh.
- Built with an agent-driven Claude Code pipeline (spec → plan → QA → ship).
- The site carries a light/dark theme switch (`data-theme` on `<html>`); both
  themes are first-class, not a default plus a variant.

## Capabilities and Constraints

- Next.js 16 App Router, React 19, Tailwind v4, TypeScript. No CMS — content is
  markdown in the repo.
- WCAG AA in **both** themes is non-negotiable and predates any tooling.
- The public site may render only `getPublishedPosts()`; drafts are unreachable
  and absent from the sitemap.
- **Open decision:** the live-model feature on the resume sample requires an
  `ANTHROPIC_API_KEY` in the Vercel project. As of 2026-08-04 no such variable
  exists (only `STUDIO_PASSWORD`, `STUDIO_SECRET`, `GITHUB_TOKEN`). Until Josh
  adds one, that feature must degrade to an honest disabled state rather than a
  simulated one.
- **Open decision:** pricing, packages, and turnaround for web-design work are
  undecided. No number may appear on the offer surface until Josh sets one.

## Brand Commitments

- Name **Smart Disruptions** / **SmartDisruptions**, at smartdisruptions.com.
- Voice: first person, plain, short paragraphs, receipts over claims,
  peer-to-peer with no labels for the reader, honest about what went wrong.
  Locked spec lives in Josh's vault (Content and Teaching Skill Tree § Voice).
- The main site's visual world ("Paper" — warm paper, one burnt-orange accent,
  warm-charcoal dark) is established and documented in DESIGN.md. It governs the
  site's own surfaces.
- **Binding constraint volunteered by Josh (2026-08-04):** the Web Design Resume
  Sample is to be themed *completely differently* from the Paper world. It is a
  sample artifact, not a site page wearing site clothes.
- AI-use disclosure on `/about` is a standing honesty commitment, not a
  one-time page.

## Evidence on Hand

Real and verifiable. Nothing below may be embellished; the absences at the end
must not be filled in.

**Career (from Josh's vault, About Me/Timeline + Profile):**

- Josh Escusa. Based in the Moscow, Idaho / Pullman, Washington region (the
  Palouse). Pacific time.
- **University of Idaho, ~11 continuous years (2014–present), three roles:**
  Design & Content for BEAMS (student financial-wellness program) 2014–2020 →
  Financial Aid Communications 2020–2023 → **Enterprise Developer 2024–present**.
- Enterprise Developer stack: Oracle SQL, Pro\*C, Banner, Argos. Financial aid
  systems. Also the department's AI person.
- **Net Price Calculator rebuild**, live ~Aug 2026 — replaced a vendor product
  that cost ~$80k.
- **BS Psychology, Washington State University.** No CS degree; self-taught into
  engineering on the job.
- **2008–2013 — self-taught web developer & SEO, freelance.** Built sites and
  ran SEO for small businesses. The technical origin.
- **~2011–2013 — Cobalt, Seattle**, reputation-management specialist (~1 year):
  car dealerships, reading and responding to reviews. The professional root of
  the Review Growth System.
- **FormYourFuture.com** — a niche-site venture he built and grew, then a major
  crash. Featured on an Empire Flippers podcast episode, *"From Crushing It To
  Getting Crushed."*
- **Martial arts:** 20+ years. TKD from age 10 in Okinawa, Japan; BJJ from 2008;
  first coaching in Arkansas ~2009–11; coached at V7 2022–summer 2025.
- 3 years of daily AI collaboration as of mid-2026.
- LinkedIn: https://www.linkedin.com/in/joshescusa

**Shipped work (real, live or in the repo):**

- **samuraikitchencatering.com** — a real site for a real friend's food truck.
  Built on the client's live Square catalog; the client placed a full order
  end-to-end on the test build. Also the subject of a published security
  post-mortem where Josh deleted an admin feature rather than patch its hole.
- **Review Growth System** — a SaaS reaching production maturity: role-based
  auth, four cron jobs, an accessibility audit.
- **Dirty Coffee Pullman** — local-business site.
- **Pebble Kart** — a game his son Gabe built himself, with Josh.
- **smartdisruptions.com** — this site. Six posts published; one of them was
  published entirely unattended by a scheduler that opened and merged its own PR.
- ~34 projects in `~/Documents/src` — games (PixiJS/TypeScript), local-business
  sites, growth tooling.

**Absences — future work must not invent these:**

- No client testimonials or quotes exist on record.
- No pricing, packages, rates, or turnaround times have been decided.
- No revenue, traffic, or conversion figures may be asserted.
- FormYourFuture specifics (exact years, Josh's exact role, peak revenue, cause
  of the crash) are unconfirmed — the podcast has the receipts, the vault does
  not.
- Josh's exact birth year is unconfirmed (derived ~1984–85). Do not print an age.
- Email address exists but Josh chose **not** to publish it on these surfaces;
  LinkedIn is the contact path.

## Product Principles

1. **Receipts over claims.** If it cannot be linked, committed, or screenshotted,
   it does not get asserted.
2. **Disclose the AI, don't hide it.** Including on surfaces that are themselves
   AI-built showpieces.
3. **Accessibility is a floor, not a goal** — AA in both themes, always.
4. **Teach from what shipped.** The process is the product.
5. **Josh keeps the judgment and the final yes.** Publishing, pricing, and
   client-facing claims are his calls, never an authoring session's.

## Accessibility & Inclusion

WCAG AA for all text in both light and dark themes (4.5:1 body, 3:1 large).
Keyboard operability and visible focus on every interactive element. Motion-heavy
surfaces must honor `prefers-reduced-motion` — the sample surfaces lean on motion,
so this is a hard requirement there, not a nicety.
