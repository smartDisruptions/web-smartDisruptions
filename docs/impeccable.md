# Design audit (impeccable)

A deterministic anti-pattern detector for the UI. No API key, no model — 58 rules
that either fire or don't. It is here as an **auditor**, not a generator: it
reviews what's already built and never writes design.

## Running it

```bash
npm run build && npm start     # terminal 1
npm run design:audit           # terminal 2
```

It sweeps all 7 routes at desktop (1280×800) and mobile (390×844). To point it
at production instead:

```bash
BASE_URL=https://smartdisruptions.com npm run design:audit
```

A static scan (`impeccable detect src/`) finds **nothing** on this project — it's
a Next.js + Tailwind app with no literal colors in the JSX, so every rule needs
the rendered page. Build and serve, or don't bother.

The version is pinned in `scripts/design-audit.mjs`. A detector that changes
under you isn't a check.

## Expected baseline

**One `low-contrast` finding on `/games` is expected and is a false positive.**
The ARCADE wordmark is `text-transparent` with a `bg-clip-text` gradient behind
it; the detector reads the transparent color as `#000000` and compares it to the
gradient underneath. There is no real contrast problem.

It is deliberately **not** suppressed. Contrast is the thing most worth catching,
and `/games` has the riskiest colors on the site — silencing the rule there to
kill one nuisance would blind the page that needs it most. So treat it as a
tripwire with a known baseline:

> `/games` low-contrast count == 1 → expected.
> `/games` low-contrast count > 1, or a low-contrast finding on any other
> route → **something real broke.**

## Findings that are left firing on purpose

These are open questions, not settled decisions. They still appear on every run
because the answer isn't in yet:

| Rule                    | Where                    | Why it's still firing                                                                                                                                                                                                   |
| ----------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `overused-font`         | every route              | Inter is 86–96% of the text and the objection is fair — it is the most-used face in AI-generated UIs. Changing it is a brand decision, not a lint fix. Unresolved.                                                      |
| `image-hover-transform` | `/`, `/content`, `/apps` | `hover:scale-105` on card images. Note the `/apps` one is currently **dead** — the class needs a `group` ancestor it doesn't have. Don't "fix" it by adding `group`; that switches on an effect nobody decided to have. |
| `oversized-h1`          | `/`                      | The home headline is 72px and 55 characters. Judgment call, not made yet.                                                                                                                                               |
| `nested-cards`          | `/games`                 | The CRT screen inside the game card. Probably fine, not yet decided.                                                                                                                                                    |
| `cramped-padding`       | `/games`                 | The marquee's children sit flush to its edges. Worth a look.                                                                                                                                                            |
| `em-dash-overuse`       | most routes              | Advisory only; never fails. Real signal about the prose, though.                                                                                                                                                        |

## The ignore file is a rejection log

`.impeccable/config.json` suppresses five rules. **Every entry carries a `reason`,
and that is the point** — the file exists to record _what the tool was told it got
wrong and why_, not just to make output quiet.

The house rule: **no ignore without a reason, and no reason that is just
"intentional."** A reason has to say what the decision was and when it was made.
Scope to the narrowest path that works — four of the five are scoped to `games`
precisely so the same pattern elsewhere still gets caught.

Currently ignored: `cream-palette` (site-wide — the Paper ground is a documented
decision), and on `/games` only: `dark-glow`, `gradient-text`,
`repeating-stripes-gradient`, `gpt-thin-border-wide-shadow` — the arcade
cabinet aesthetic, which is the subject of that page rather than a default
applied to a generic UI.

## DESIGN.md

`DESIGN.md` at the repo root is the portable export of the design system in
`src/app/globals.css`. The detector reads it and flags literal values that fall
outside the declared tokens — `design-system-color`, `design-system-radius`,
`design-system-font-size` — so drift off the system becomes a finding rather
than something you have to catch by eye.

Verified with a canary file carrying an off-token color, a 9px radius, and a
19px font-size: all three fired. Note that these rules land on **file/HTML
scans** (`impeccable detect some.html`); the route sweep in `design:audit`
currently reports none, which is consistent with the rendered pages staying on
token but is not by itself proof the rules run in browser mode.

**`globals.css` is the source of truth.** If a token changes there, change it in
`DESIGN.md` in the same commit or the check quietly goes stale.
