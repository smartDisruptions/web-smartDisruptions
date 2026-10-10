---
name: Smart Disruptions
description: Shadow Dojo. Washi paper and sumi ink by day, the same dojo under a moon at night. Indigo (ai-iro) for anything you can press, vermilion for marks, a Japanese poster gothic for headlines, a reading serif for anything long, and the platform's own UI face for everything else. Kiru, the house ninja, lives on every page.

# Values below mirror src/app/globals.css. That file is the source of truth;
# this is the portable export the impeccable detector reads. If a token
# changes there, change it here in the same commit.
colors:
  # Day — washi paper, sumi ink
  paper-bg: '#f4efe4'
  paper-bg-2: '#ece5d6'
  paper-surface: '#fffcf5'
  paper-surface-elevated: '#e9e1cf'
  accent: '#2b3a96' # ai-iro INDIGO — links, active states. Things you press.
  accent-hover: '#1e2a75'
  accent-secondary: '#b42a17' # error / alert text
  pen: '#e2412a' # VERMILION — marks only: slashes, seals, the headband, pills
  pen-ink: '#b42a17' # vermilion when it is text — AA on washi (5.6:1)
  gold: '#c8962e'
  gold-ink: '#8a5a00'
  text-primary: '#15172b' # sumi
  text-secondary: '#4f5468'
  highlighter: 'rgba(255, 196, 64, 0.42)'
  sticky: '#f6ecd2' # ofuda paper slip — same in both themes
  sticky-ink: '#1f1a14'
  badge-secondary: '#8a1c16'
  button-primary: '#d63a22' # white text 4.7:1, same in both themes

  bull-ink: '#166534'
  bear-ink: '#b91c1c'
  warn-ink: '#92400e'
  bull-soft: 'rgba(22, 101, 52, 0.1)'
  bear-soft: 'rgba(185, 28, 28, 0.08)'
  warn-soft: 'rgba(146, 64, 14, 0.1)'

  arcade-red-ink: '#b91c1c'
  arcade-yellow-ink: '#854d0e'
  arcade-blue-ink: '#1d4ed8'
  arcade-red: '#ef4444'
  arcade-yellow: '#facc15'
  arcade-blue: '#3b82f6'

  # Night — the dojo under a moon
  dark-bg: '#090b16'
  dark-bg-2: '#0e1122'
  dark-surface: '#11152a'
  dark-surface-elevated: '#1a1f3a'
  dark-accent: '#9bb0ff'
  dark-accent-hover: '#c3d0ff'
  dark-accent-secondary: '#ff8166'
  dark-pen: '#ff5b3d'
  dark-pen-ink: '#ff8166'
  dark-gold: '#ffcf70'
  dark-text-primary: '#eceefa'
  dark-text-secondary: '#a6abc8'
  dark-highlighter: 'rgba(255, 196, 64, 0.2)'
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
    fontFamily: 'Dela Gothic One, Arial Black, system-ui, sans-serif'
    fontSize: '3rem'
    fontWeight: 400
    fontSizeAdjust: 0.5
    letterSpacing: '-0.01em'
    lineHeight: 1.12
  headline:
    fontFamily: 'Dela Gothic One, Arial Black, system-ui, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 400
    lineHeight: 1.12
  title:
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: 'Literata, Iowan Old Style, Georgia, serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.8
  small:
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
    fontSize: '0.7rem'
    fontWeight: 750
    letterSpacing: '0.14em'

rounded:
  none: '0'
  sm: '4px'
  md: '6px'
  lg: '12px'
  xl: '16px'
  '2xl': '22px'
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

Rules that are decisions, not defaults. If a detector or a reviewer argues
with one of these, the answer is on this page.

The site was "Paper" (cream, burnt orange) until September 2026, then
"Notebook" (graph paper, handwriting) for a month. **Shadow Dojo** replaced it
in October 2026, when Josh asked for a site that is visually stunning on a
phone, has a mascot, and stays best-in-class fast. Everything below exists to
hold all three at once.

## Two lights, one dojo

Day is washi paper and sumi ink. Night is the same place under a moon:
ai-iro indigo, moonlight, lanterns. Every token flips; no layout does. The
theme follows the reader's toggle, else their OS, and is set before first
paint. Switching paints the new theme as a circle growing out of the toggle
(a View Transition) — or just switches, under reduced motion.

## Indigo presses, vermilion marks

The accent (`--sd-accent`) is indigo — 藍, *ai*: the brand's colour is a pun
it gets for free. Links, active states, focus rings, anything you press.
Vermilion (`--sd-pen`) is for **marks**: the brush stroke under a heading,
the slash through a headline, a seal, the active tab pill, Kiru's headband.
When vermilion has to be text it uses `--sd-pen-ink`, which clears AA.

Vermilion is not the link colour for the same reason red never was: Market
Storm's `bear` ink is red, and a link in that hue reads as a verdict.

The one exception is the **primary button**: solid `#d63a22` with white text
in both themes (4.7:1). A button is an object, like the headband.

## Three faces, three jobs

- **Dela Gothic One** — headlines only (`font-display`). One weight, very
  heavy. `font-size-adjust: 0.5` holds it to the size the heading utilities
  were tuned for: the weight shouts, so the size doesn't have to.
- **Literata** — anything a reader is meant to *read* (`font-read`): article
  bodies, report bodies, lead paragraphs. Display type never sets a paragraph.
- **The platform's UI face** (`system-ui`) — nav, labels, cards, buttons. SF
  on Apple, Roboto on Android. It costs nothing to load, and it is most of
  why the site feels native on a phone.

Japanese characters are **never a font**. The ~40 the site draws (page
kanji, the katakana tag, seals) are baked into SVG paths by
`scripts/build-glyphs.mjs` (Potta One brush, Dela Gothic One gothic — both
OFL) and rendered by `<Kanji>`, `<Seal>` and `<Vertical>`. A CJK webfont is
megabytes; the paths are a few hundred bytes each. They are decoration: the
English is always on the page, so they are `aria-hidden` unless a `title`
says otherwise. Add a character by adding it to the script and re-running it.

## Kiru

The house ninja (切る, *kiru*, "to cut" — he cuts through hype). One rig in
`src/components/kiru/Kiru.tsx`, thirteen poses: idle, wave, read, storm,
build, game, meditate, shh, run, sit, peek, throw, bow. `/kiru` shows them
all.

- He is **pure SVG, rendered on the server**: no JavaScript, a few KB each.
- He is an **object**: the same colours in both themes. Only his outline
  (`--kiru-line`) and moonlight rim (`--kiru-rim`) follow the theme — ink by
  day, moonlit at night.
- He **idles only on screen**. `SiteFX` sets `data-live` while he is visible,
  and every loop he has runs on it, the headband's included. A page of ninjas
  costs nothing per frame off screen, and on screen his loops are transforms
  the compositor runs.
- He **holds still while the page scrolls**: `SiteFX` sets `data-hold` from
  the first scroll event to `scrollend`, which pauses his loops mid-pose
  (never resets them). Every hold rule names the parts it pauses. A `*` under
  any `[data-hold]` makes every hold on the page restyle whole subtrees,
  because Chrome tracks attribute changes by the attribute's name alone.
- His **eyes follow the pointer** (or the last touch) through `--lx/--ly`.
- He is **decorative** (`aria-hidden`) unless given a `title`.
- Every page has him, doing that page's job. He never covers text and never
  blocks a tap.

## Motion runs on the compositor

Transforms, opacity, clip-paths and scroll timelines. No motion library, no
animation of layout properties, nothing that animates while off screen.

- **Scroll reveals** are `animation-timeline: view()` (`.sd-reveal`): zero
  JavaScript. Browsers without scroll timelines show the content — content
  never waits on a feature detect.
- **Page transitions** are React's `<ViewTransition>` around `<main>`. Tab
  changes slide in the direction of travel; the tab pill and the nav's brush
  stroke glide to their new place because they carry view-transition names.
- **Reduced motion stops things, it doesn't strobe them.** Infinite loops are
  stopped outright, not shortened.
- **No SMIL.** Chrome runs it on the main thread every frame, and an
  `<animate>` on an element keeps even that element's CSS transforms off the
  compositor. On SVG, animate `transform` itself: Chrome won't composite the
  separate `translate`, `rotate` and `scale` properties there. Kiru's headband
  tails were SMIL path morphs until October 2026 and kept a throttled phone's
  main thread a third busy while he was on screen; they are now two pieces on
  a joint (`scripts/build-kiru-tails.mjs`).
- **Canvas and WebGL** effects are islands: they start after first paint,
  render at a capped resolution, pause when off screen or the tab is hidden,
  and draw a single still frame under reduced motion.

## Native on a phone

- A **tab bar** (Home, Writing, Learn, Built, Arcade) where a thumb reaches;
  About is the avatar in the top bar. The top bar tucks away while you scroll
  down and returns when you scroll up.
- **Market Storm lives inside Writing** (since October 2026): a section of
  the Writing page, with `/market-storm` as its own page — the front, then
  the archive. That page and every report light the Writing tab, and so do
  the guides, which Writing lists among its field notes (`sectionOf()` in
  `nav/nav.ts`).
- `viewport-fit=cover` with safe-area padding on the header and the tab bar.
- Every tappable thing is ≥44px and **presses in** (`active:scale`).
- The browser chrome takes the theme colour (`theme-color`), and the site
  installs to a home screen as an app (manifest + icons) with Kiru as its icon.
- ⌘K / `/` / the search button opens a **command palette** over a static
  index (`/search-index.json`), fetched on first open — a phone gets it as a
  bottom sheet.

## Materials

Named classes in `globals.css`, because each is a small recipe that must stay
identical everywhere it appears:

| Class | What it is |
| --- | --- |
| `sd-sheet` | The reading surface: washi by day, lacquer by night. Long text sits on one. |
| `sd-card` | Anything pressable that leads somewhere: lifts, a sheen crosses it, presses in. |
| `sd-print` | A card whose job is to show an image. |
| `sd-tilt` | Opt-in: a card that leans toward a fine pointer, with a soft light under it. |
| `sd-note` | An ofuda paper slip: cream, ink, a vermilion band. Same in both themes — never theme-coloured text on it. |
| `sd-seal` | A hanko: vermilion stamp, white kanji. |
| `sd-kicker` | The small uppercase label with a vermilion diamond. |
| `sd-brush-under` | The vermilion brush stroke under a heading (a mask, so the colour stays a token). |
| `sd-hl` | The gold highlighter swipe. In article bodies, `**bold**` renders with it. |
| `sd-watermark` | A giant brush kanji behind a page header. |
| `sd-glass` | Frosted glass for the header and the tab bar, with solid fallbacks. |
| `sd-defer` | `content-visibility: auto` for long below-the-fold blocks. |

The Notebook's `nb-*` classes are aliased to these until every call site has
moved over; new code uses `sd-*`.

## The grid is gone; the sheet stays

Long-form text never sits directly on the page ground: articles, reports,
About and Privacy are each a `sd-sheet`. Short text — a headline, a caption,
a card — may sit on the ground.

## Bold is the highlighter

In article bodies `**bold**` renders with the gold highlighter. Posts bold the
one line worth keeping. If a post bolds half its sentences the page will say
so — that is the point.

## Native corners

Cards are 16px, sheets 22px, pills round. The radii are set once in `@theme`
rather than at ~60 call sites.

## The ink flip

The Arcade's bright red/yellow/blue fail AA on washi, so every _text_ use
points at an ink variant (`--arcade-*-ink`). At night those inks flip to the
bright neon. **Bright arcade colours are decorative fills only.** A raw
`#ef4444` on text is a bug.

## Semantic data inks (bull / bear / caution)

Market Storm encodes polarity with three semantic inks — `bull` (green),
`bear` (red), `warn` (amber) — on-token, flipping dark-on-washi to
bright-at-night, every text use AA in both themes. They carry a **verdict
about the data**, never decoration. The Evidence Engine reuses the same three.

## Reading measure over container width

Post bodies cap at `62ch` (~74 characters per line).

## The share cards are the same dojo

Every image a link renders with — a post's hero, its social card, the site
card — is drawn from these tokens in these faces. (Market Storm articles make
their own images, since October 2026.) Two
generators do it and both change together: `scripts/make-hero.mjs` (headless
Chrome, writes the .webp files) and the `opengraph-image.tsx` routes (Satori,
at build time). Satori cannot read woff2: it needs the .ttf copies in
`src/fonts/`.

Two traps, both sprung once already. Satori ignores `font-size-adjust`, so the
routes apply the same 0.5 by hand; and Satori misreads both faces' kerning
(it opened random double spaces), so the Satori TTFs ship with kerning
stripped while Chrome's woff2 copies keep it. `make-hero.mjs` drives Chrome
over its DevTools pipe with an exact 1200×630 viewport — `--screenshot` sized
the window, not the page, and cut the bottom 87px off every image.

## Performance is a feature

The budget the design is held to: every route static, LCP under 1.5s on a
mid-range phone, CLS 0, no long tasks on load, 60fps scrolling. Decorative
JavaScript is lazy, off-screen work is paused, and nothing decorative is an
image request.

## Accessibility is a floor, not a goal

All text meets WCAG AA (4.5:1 body, 3:1 large) in **both** themes. Focus is a
2.5px vermilion ring. Skip link first. Decoration is `aria-hidden`.
