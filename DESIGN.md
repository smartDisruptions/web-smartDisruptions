---
name: Smart Disruptions
description: Paper. Editorial, typography-first, one warm accent on warm paper. Whitespace and type do the work. Dark mode is the same identity after dark — warm charcoal, never cold black.

# Values below mirror src/app/globals.css. That file is the source of truth;
# this is the portable export the impeccable detector reads. If a token
# changes there, change it here in the same commit.
colors:
  # Light — "Paper"
  paper-bg: '#f4efe4' # page ground; warm, deliberately not near-white
  paper-surface: '#fdfbf6' # cards, lifted one step above the page
  paper-surface-elevated: '#ece5d7'
  accent: '#c2410c' # the one warm accent
  accent-hover: '#9a3412'
  accent-secondary: '#b45309'
  text-primary: '#1a1714'
  text-secondary: '#6b6560'
  badge-secondary: '#92400e' # dark amber — AA on the light amber tint

  # Market Storm — bull / bear / caution data semantics. TEXT-SAFE inks, AA on
  # paper. Same ink-flip discipline as the arcade inks (dark here, bright below).
  bull-ink: '#166534' # green-800
  bear-ink: '#b91c1c' # same hue as arcade-red-ink
  warn-ink: '#92400e' # matches badge-secondary
  # Soft fills for chips/dots (decorative tints, not text)
  bull-soft: 'rgba(22, 101, 52, 0.1)'
  bear-soft: 'rgba(185, 28, 28, 0.08)'
  warn-soft: 'rgba(146, 64, 14, 0.1)'

  # Arcade inks (light) — TEXT ONLY. The bright arcade colors below fail AA
  # on paper, so anything that is text or a chip uses these.
  arcade-red-ink: '#b91c1c'
  arcade-yellow-ink: '#854d0e'
  arcade-blue-ink: '#1d4ed8'

  # Arcade brights — DECORATIVE FILLS ONLY (ribbons, glows, LEDs, confetti,
  # on-dark marquee) where contrast does not apply. Never use as text.
  arcade-red: '#ef4444'
  arcade-yellow: '#facc15'
  arcade-blue: '#3b82f6'

  # Dark — warm charcoal, not cold black
  dark-bg: '#14100c'
  dark-surface: '#241d15'
  dark-surface-elevated: '#302619'
  dark-accent: '#f4834b'
  dark-accent-hover: '#f7a273'
  dark-accent-secondary: '#e0913f'
  dark-text-primary: '#f4efe5'
  dark-text-secondary: '#b7ad9d'
  dark-badge-secondary: '#f2b483'
  # Arcade inks flip to bright neon on the dark cabinet — both clear AA in
  # their own theme. This is the "ink flip": a light-mode constraint turned
  # into a dark-mode feature.
  dark-arcade-red-ink: '#f87171'
  dark-arcade-yellow-ink: '#fde047'
  dark-arcade-blue-ink: '#60a5fa'
  # Market Storm inks flip to bright on the dark cabinet (both AA in their theme)
  dark-bull-ink: '#4ade80'
  dark-bear-ink: '#f87171' # shares the dark red ink
  dark-warn-ink: '#f2b483' # shares the dark badge amber
  dark-bull-soft: 'rgba(74, 222, 128, 0.14)'
  dark-bear-soft: 'rgba(248, 113, 113, 0.14)'
  dark-warn-soft: 'rgba(242, 180, 131, 0.14)'

typography:
  display:
    fontFamily: 'Fraunces, Georgia, Times New Roman, serif'
    fontSize: '3rem'
    fontWeight: 600
    letterSpacing: '-0.01em'
    lineHeight: 1.1
  headline:
    fontFamily: 'Fraunces, Georgia, Times New Roman, serif'
    fontSize: '1.75rem'
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 2
  small:
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: 'ui-monospace, SF Mono, JetBrains Mono, Fira Code, monospace'
    fontSize: '0.75rem'
    fontWeight: 500
    letterSpacing: '0.08em'

rounded:
  none: '0'
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '12px'
  '2xl': '16px'
  pill: '999px'

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

## Paper, not near-white

The page ground is `#f4efe4` — a warm paper. An earlier near-white (`#fbfaf7`)
with pure-white cards on top read as glare; the brightest thing on a reading
page should not be the cards. Cards sit one step _above_ a warmer page, which
is calmer and lets the warmth register.

## Warm dark, not cold black

Dark mode keeps the brand's temperature: `#14100c`, a warm charcoal. Cold black
would throw away the identity. In dark, text already scores AAA, so the contrast
work is structural — surfaces and borders lifted into visible steps so cards and
dividers read as layered instead of dissolving.

## The ink flip

The Arcade's bright red/yellow/blue fail AA on paper, so every _text_ use points
at an ink variant (`--arcade-*-ink`). In dark mode those inks flip to the bright
neon, which pops on the dark cabinet. Same hue family, opposite job.

**The rule that follows: bright arcade colors are for decorative fills only.**
If a color is text or a chip, it uses the ink. A raw `#ef4444` on text is a bug —
that exact mistake shipped once and was caught by an audit in July 2026.

## Reading measure over container width

Post bodies cap at `62ch` (~74 characters per line), not at the container width.
Above ~80 characters the eye loses its place on the return sweep.

## Market Storm data semantics (bull / bear / caution)

The Market Storm reports carry financial data with a real bull/bear polarity, so
they get three semantic inks beyond the single warm accent — `bull` (green),
`bear` (red), `warn` (amber). These encode _meaning in the data_ (a metric that
helps vs. hurts the thesis), never decoration, and they follow the same rules as
everything else: they are **on-token** (`--sd-bull/bear/warn` + soft tints), they
**flip** dark-on-paper → bright-on-dark like the arcade inks, and every text use
clears WCAG AA in both themes (`bear`/`warn` reuse the already-verified
`arcade-red-ink` / `badge-secondary` values). The accent stays burnt-orange; these
are a separate semantic axis, not a second accent.

## Accessibility is a floor, not a goal

All text meets WCAG AA (4.5:1 body, 3:1 large) in **both** themes. This is
non-negotiable and predates any tooling.
