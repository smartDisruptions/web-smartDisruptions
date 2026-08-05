# Web Design samples — the four worlds

The site's design system is `DESIGN.md` at the repo root ("Paper"). **This file
does not replace it and does not govern any site surface.** It records the four
self-contained visual worlds under `/web-design/resume-sample/*`, which are
deliberately outside Paper — that departure is the brief, not drift.

If the impeccable detector reports ~86 advisory "outside DESIGN.md" findings on
`src/app/web-design`, that is this file's subject matter, correctly detected.
Each artifact owns its tokens in its own `*.module.css`; nothing here leaks into
the site, because every token is scoped to that module's `.world` class.

## Why four

The set is the argument. One résumé (`src/data/resume.ts`) renders four ways, so
the design is visibly a decision rather than an inevitability. Remove the fourth
— the category standard — and the claim stops being falsifiable, which is why it
is built to the same standard as the other three rather than as a straw man.

## Shared rules across all four

- **Content is a constant.** Every fact comes from `src/data/resume.ts`. A world
  may change emphasis and order; it may not change, soften, or add a fact.
- **AA in both directions.** Each palette was picked so body text clears 4.5:1
  on its own ground. These worlds do not have a light/dark pair — each commits
  to one scene — so the check is per-world, not per-theme.
- **`prefers-reduced-motion` is honoured in every module**, including the
  bulletin's canvas (which draws one static frame rather than animating).
- **No site chrome.** `src/lib/chrome.ts` drops Navbar and Footer on artifact
  routes; each artifact carries its own way back.
- **The live-model panel is headless** (`useResumeAsk`), so each world renders
  it in its own vocabulary. A shared widget across four committed designs would
  be the one stock component that gives the set away.

## 1. Variety Trial Bulletin — `bulletin/`

Land-grant extension bulletins: the wheat variety trials WSU and U of Idaho
actually publish on the Palouse. A career as a performance record under measured
conditions.

| Token | Value | Job |
| --- | --- | --- |
| `--ground` | `#0f1711` | Basalt. Read at the field's edge at dusk. |
| `--wheat` | `#dfc46a` | Display, lit horizon, yield bars. |
| `--teal` | `#4f9d9d` | Survey lines, labels, contour strokes. |
| `--flag` | `#d94f8a` | Surveyor's flagging tape — the active plot only. |
| `--chaff` | `#eae4d2` | Body. |

Type: Bitter (slab display) / Archivo (labels) / Roboto Mono (tabular figures —
measurement, not costume). Square corners, hairline rules, plate borders.

**Signature:** stacked ridgelines on canvas, each filled a step lighter than the
one behind so the occlusion reads as land. Deterministic — no `Math.random`, so
they are the same hills every load.

## 2. Registered Screenprint — `screenprint/`

Translucent spot-colour passes with deliberate misregistration. Three roles at
one university printed over each other; the person is the overlap.

| Token | Value | Job |
| --- | --- | --- |
| `--stock` | `#e4e2d9` | Cool grey linen — **not** Paper's warm cream. |
| `--ink` | `#17181a` | The key plate. |
| `--cyan` / `--amber` / `--scarlet` | `#128a9c` / `#d18412` / `#c8323f` | The three passes. |

Type: Anton (poster caps) / Work Sans (body). 3px hard rules, offset flat-colour
blocks as second impressions, drawn registration crosses, a dot-screen paper
tooth. No rounded corners anywhere.

**Signature:** the registration slider. Offsets are expressed in `em`, not px,
so the misprint reads identically at every width. It starts at 7 rather than 0 —
in perfect register the colour hides behind the key and the mechanism is
invisible on arrival.

**Deliberate:** the offset block shadows would normally read as the neobrutalist
costume the craft floor warns about. Here a flat colour block behind a keyline
is literally what a second pass looks like, so the world earns it.

## 3. Phosphor Terminal — `terminal/`

P1 green phosphor on curved glass. Eleven years inside Oracle and Banner, drawn
as the surface it actually was.

| Token | Value | Job |
| --- | --- | --- |
| `--glass` | `#050a06` | The tube. |
| `--phosphor` | `#33ff66` | Body and cursor. |
| `--phosphor-dim` | `#2bbf4e` | History, dimming to afterimage. |
| `--amber` | `#ffb03a` | Warnings only. |

Type: VT323 at one size. Hierarchy is indentation, case, and full-width rules —
a character-cell display has nothing else.

**Signature:** a working command line. Local commands answer from the record;
anything unrecognised is treated as a question and goes to the model, so the
terminal *is* the ask panel rather than having one bolted to its side. Rules are
drawn in CSS, not typed — box-drawing characters fall back to a wider font and
overflow the 56-column field.

**Deliberate:** the scanlines and bloom are the subject here, the same reasoning
the project already accepted for the Arcade in `.impeccable/config.json`. That
ignore is scoped to `games`; this is a second, separate instance of the same
argument.

## 4. The Category Standard — `portfolio/`

The dark developer portfolio, played straight. Included as the control.

| Token | Value |
| --- | --- |
| `--bg` / `--surface` | `#0a0a0b` / `#121215` |
| `--fg` / `--muted` | `#fafafa` / `#a1a1aa` |
| `--accent` | `#818cf8` (`#6366f1` for fills) |

Type: Manrope over Inter — the category's own faces, on purpose. 12–16px radii,
pills, cards, a dotted rail.

**No irony and no smuggled quirk.** Dressing this one down would make it a straw
man and the four-way comparison worthless. Where the convention says big name,
scroll reveals and a dotted timeline, it gets exactly those, built properly:
focus rings on every control, reveals that never trap content (a `<noscript>`
rule un-hides them), and reduced-motion respected.
