---
name: Smart Disruptions
description: Notebook. A builder's graph-paper notebook — handwriting for headlines and asides, a reading face for anything long, blue pen for anything you can press, red pen for marks. Taped prints, sticky notes and ruled cards are all CSS. Dark mode is the same notebook after dark — slate graph paper, chalk-bright pens, sticky notes still yellow.

# Values below mirror src/app/globals.css. That file is the source of truth;
# this is the portable export the impeccable detector reads. If a token
# changes there, change it here in the same commit.
colors:
  # Light — white graph paper
  paper-bg: '#fbfaf4' # page ground, under a 24px graph grid
  paper-grid: '#e7edf3' # the graph lines — kept faint so text on the grid stays easy to read
  paper-surface: '#ffffff' # sheets and cards, one step whiter than the page
  paper-surface-elevated: '#f2f0e6'
  accent: '#2a57c5' # the BLUE pen — links, eyebrows, active nav
  accent-hover: '#1f4396'
  accent-secondary: '#b3261e' # error / alert text
  pen: '#d93030' # the RED pen — underlines, scribbles, margin rule. Marks only.
  pen-ink: '#b3261e' # red pen when it is text — AA on paper
  text-primary: '#25252d'
  text-secondary: '#5f616e'
  highlighter: 'rgba(255, 226, 90, 0.62)'
  sticky: '#ffe26a'
  sticky-ink: '#2b2b33' # text on a sticky note, both themes
  tape: 'rgba(255, 221, 120, 0.75)'
  rule: '#cfe0f2' # ruled-card lines
  margin-line: '#f0a0a0'
  badge-secondary: '#8a1c16'

  # Market Storm — bull / bear / caution data semantics. TEXT-SAFE inks, AA on
  # paper. Same ink-flip discipline as the arcade inks (dark here, bright below).
  bull-ink: '#166534' # green-800
  bear-ink: '#b91c1c' # same hue as arcade-red-ink
  warn-ink: '#92400e'
  bull-soft: 'rgba(22, 101, 52, 0.1)'
  bear-soft: 'rgba(185, 28, 28, 0.08)'
  warn-soft: 'rgba(146, 64, 14, 0.1)'

  # Arcade inks (light) — TEXT ONLY.
  arcade-red-ink: '#b91c1c'
  arcade-yellow-ink: '#854d0e'
  arcade-blue-ink: '#1d4ed8'

  # Arcade brights — DECORATIVE FILLS ONLY. Never use as text.
  arcade-red: '#ef4444'
  arcade-yellow: '#facc15'
  arcade-blue: '#3b82f6'

  # Dark — slate graph paper
  dark-bg: '#13151a'
  dark-grid: '#222733'
  dark-surface: '#1b1e26'
  dark-surface-elevated: '#252934'
  dark-accent: '#93b4ff'
  dark-accent-hover: '#b9ceff'
  dark-accent-secondary: '#ff8585'
  dark-pen: '#ff8585'
  dark-text-primary: '#ebe7de'
  dark-text-secondary: '#a3a6b2'
  dark-highlighter: 'rgba(255, 226, 90, 0.24)'
  dark-sticky: '#ecd05a'
  dark-sticky-ink: '#23232a'
  dark-badge-secondary: '#ffb3b3'
  dark-arcade-red-ink: '#f87171'
  dark-arcade-yellow-ink: '#fde047'
  dark-arcade-blue-ink: '#60a5fa'
  dark-bull-ink: '#4ade80'
  dark-bear-ink: '#f87171'
  dark-warn-ink: '#f2b483'
  dark-bull-soft: 'rgba(74, 222, 128, 0.14)'
  dark-bear-soft: 'rgba(248, 113, 113, 0.14)'
  dark-warn-soft: 'rgba(242, 180, 131, 0.14)'

typography:
  display:
    fontFamily: 'Caveat, Bradley Hand, Segoe Print, cursive'
    fontSize: '3rem'
    fontWeight: 700
    fontSizeAdjust: 0.47
    letterSpacing: '0'
    lineHeight: 1.12
  headline:
    fontFamily: 'Caveat, Bradley Hand, Segoe Print, cursive'
    fontSize: '2.35rem'
    fontWeight: 700
    lineHeight: 1.12
  title:
    fontFamily: 'Nunito, system-ui, -apple-system, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: 'Literata, Iowan Old Style, Georgia, serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.8
  small:
    fontFamily: 'Nunito, system-ui, -apple-system, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: 'Nunito, system-ui, -apple-system, sans-serif'
    fontSize: '0.7rem'
    fontWeight: 800
    letterSpacing: '0.12em'

rounded:
  none: '0'
  sm: '4px'
  md: '6px'
  lg: '3px' # paper has square corners — see "Cut sheets" below
  xl: '3px'
  '2xl': '4px'
  pill: '999px'
  wobble: '255px 18px 225px 18px / 18px 225px 18px 255px' # hand-drawn outline

spacing:
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '24px'
  xl: '40px'
  '2xl': '64px'
  '3xl': '80px'
---

# Design notes

Rules that are decisions, not defaults. Each one was made once, deliberately —
if a detector or a reviewer argues with one of these, the answer is on this page.

The site was "Paper" (warm cream, burnt orange, Instrument Sans) until September
2026. Notebook replaced it after eight homepage comps: the brief was mobile
first, more design, far fewer words on the main pages, and the notebook was the
one direction that read as a person rather than a template.

## Handwriting never sets a paragraph

Caveat is for headlines, labels on prints, buttons and short asides. Anything a
reader is meant to *read* — article bodies, report bodies, lead paragraphs —
is Literata (`font-read`). UI text is Nunito. A page of handwriting is a page
nobody finishes; two Market Storm lead paragraphs were set in the display face
under Paper and were moved to `font-read` in the same change for this reason.

Caveat draws small for its point size, so `.font-display` carries
`font-size-adjust: 0.47`. That scales it to sit where the old display face sat
without touching the size utilities on ~58 headings. Tracking is reset to 0 —
negative tracking is a fix for tight sans headlines and makes handwriting
collide.

## The grid never runs behind a sentence

The page ground is graph paper. Long-form text does not sit on it: articles,
reports, About and Privacy are each a plain **sheet** (`nb-sheet`) laid on the
grid. Short text — a headline, a caption, a card — may sit on the grid directly.

## Blue pen presses, red pen marks

The accent (`--sd-accent`) is the blue pen: links, eyebrows, active states.
The red pen (`--sd-pen`) is for marks only — the stroke under a heading, the
scribble under the hero line, the margin rule, list markers. When red has to be
text it uses `--sd-pen-ink`, which clears AA.

Red is deliberately NOT the accent: Market Storm's `bear` ink is red, and an
accent in the same hue would make every link look like a verdict.

## Sticky notes are objects, not surfaces

A sticky note is yellow with dark ink in **both** themes (`--sd-sticky`,
`--sd-sticky-ink`). The primary button is the same material. Consequence: never
put theme-coloured text (`text-text-secondary`) on a sticky — it goes light in
dark mode and disappears. The subscribe form sits on a taped paper card, not a
sticky, for exactly this reason.

## Quotes are index cards, not sticky notes

Blockquotes in this site's content run to sixty words — Josh's own prompts, a
report's caveats. They render as a ruled index card in the reading face. A
handwritten sticky was tried first and was wrong the moment it met real content.

## Bold is the highlighter

In article bodies `**bold**` renders with the highlighter swipe (`nb-hl`). Posts
bold the one line worth keeping, which is what a highlighter is for. If a post
bolds half its sentences the page will say so, loudly — that is the point.

## Cut sheets

Paper has square corners. `--radius-lg`, `--radius-xl` and `--radius-2xl` are
redefined once in `@theme` (3–4px) rather than edited at ~60 call sites. Pills
and small chips keep their radius.

## A wall hangs a little crooked

`nb-wall` tilts its children a degree or so and straightens them on hover or
focus. It uses the individual `rotate` / `scale` properties, not `transform`, so
it composes with the scroll-reveal translate on the same element. Tilt is for
prints — image-led cards with a name. Text-heavy cards stay straight.

## The ink flip

The Arcade's bright red/yellow/blue fail AA on paper (true of graph paper as it was of cream), so every _text_ use points
at an ink variant (`--arcade-*-ink`). In dark mode those inks flip to the bright
neon, which pops on the dark cabinet. Same hue family, opposite job.

**The rule that follows: bright arcade colors are for decorative fills only.**
If a color is text or a chip, it uses the ink. A raw `#ef4444` on text is a bug —
that exact mistake shipped once and was caught by an audit in July 2026.

## Reading measure over container width

Post bodies cap at `62ch` (~74 characters per line), not at the container width.
Above ~80 characters the eye loses its place on the return sweep.

## Semantic data inks (bull / bear / caution)

The Market Storm reports carry financial data with a real bull/bear polarity, so
they get three semantic inks beyond the single warm accent — `bull` (green),
`bear` (red), `warn` (amber). These encode _meaning in the data_ (a metric that
helps vs. hurts the thesis), never decoration, and they follow the same rules as
everything else: they are **on-token** (`--sd-bull/bear/warn` + soft tints), they
**flip** dark-on-paper → bright-on-dark like the arcade inks, and every text use
clears WCAG AA in both themes (`bear`/`warn` reuse the already-verified
`arcade-red-ink` / `badge-secondary` values). The accent is the blue pen; these
are a separate semantic axis, not a second accent.

**The Evidence Engine reuses the same three inks**, and deliberately did not
introduce a fourth axis. A capability verdict has exactly the polarity these
encode — `evidenced` holds, `attested only` partly holds, `refused` does not —
so the values are already right and already AA-verified in both themes. The
rule that comes with the reuse: these inks may only carry a **verdict about the
data**, never a decorative highlight. A green heading that is not asserting
"this holds" is a bug, in either section.

## Accessibility is a floor, not a goal

All text meets WCAG AA (4.5:1 body, 3:1 large) in **both** themes. This is
non-negotiable and predates any tooling.
