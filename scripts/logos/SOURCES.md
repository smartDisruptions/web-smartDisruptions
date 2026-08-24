# Company marks

Used to identify the company a Market Storm report covers. That is nominative
use — the same thing every financial publication does — not a claim of
affiliation or endorsement.

All but one are below the threshold of originality and hosted on Wikimedia
Commons as public domain **for copyright** (the exception is noted below).
Trademark is separate and still applies: these may identify coverage of the
company, and may not be used as a mark of SmartDisruptions, nor altered in
shape.

| File | Source | Copyright |
|---|---|---|
| `amzn.svg` | [Amazon logo.svg](https://commons.wikimedia.org/wiki/File:Amazon_logo.svg) | Public domain |
| `iren.svg` | [IREN site asset](https://iren.com/icons/logo.svg) | Publisher-served asset — **not** Commons PD; knockout, see note below |
| `goog.svg` | [Google 2015 logo.svg](https://commons.wikimedia.org/wiki/File:Google_2015_logo.svg) | Public domain |
| `crwv.svg` | [CoreWeave logo.svg](https://commons.wikimedia.org/wiki/File:CoreWeave_logo.svg) | Public domain |
| `msft.svg` | [Microsoft logo (2012).svg](https://commons.wikimedia.org/wiki/File:Microsoft_logo_(2012).svg) | Public domain |
| `nbis.svg` | [Nebius media kit](https://nebius.com/media-kit) | Publisher-supplied press asset — **not** Commons PD; see note below |
| `pltr.svg` | [Palantir Technologies logo.svg](https://commons.wikimedia.org/wiki/File:Palantir_Technologies_logo.svg) | Public domain |
| `amd.svg` | [AMD Logo.svg](https://commons.wikimedia.org/wiki/File:AMD_Logo.svg) | Public domain |
| `spcx.svg` | [SpaceX-Logo.svg](https://commons.wikimedia.org/wiki/File:SpaceX-Logo.svg) | Public domain |

Retrieved 2026-08-05 (and `goog.svg` on 2026-08-20) from the Commons API, not screenshotted — a screenshot of
a search result is usually somebody's redraw at the wrong size on the wrong
background.

**They render monochrome**, reversed to the theme's text colour rather than in
brand colours. Several are unreadable otherwise: SpaceX's wordmark is `#005288`
and Palantir's is black, both of which disappear on our charcoal ground. A single-colour reversed treatment is the standard permitted use on a
dark background, it keeps the cards reading as one set, and it stops the index
from becoming a row of competing brand palettes. The cost is Microsoft's four
coloured squares and Google's four-colour wordmark, which go grey with the rest.

**One mark has different provenance.** Nebius's logo is not on Wikimedia Commons; the file on English Wikipedia is tagged *Fair use* and copyrighted, and that rationale covers Wikipedia's own article rather than this site. It was taken instead from **Nebius's own media kit**, which the company publishes for press use and which ships a white variant — i.e. the publisher anticipates exactly the reversed treatment these cards apply. The `NEBIUS-outline-black.svg` file is used because the colour variant masks to a solid block.

**One mark needed a different rendering, not a different provenance.** IREN
Limited is not on Wikimedia Commons — the English Wikipedia article titled
"IREN" is the Italian utility Iren S.p.A., a different company — and IREN
publishes no media kit. The mark below comes from **IREN's own site asset**
(`iren.com/icons/logo.svg`), a third provenance alongside Commons PD and
Nebius's press kit, and the same nominative-use basis applies.

It also could not be drawn the way the others are. It is a **knockout logo**: a
solid parallelogram with the letters punched through it, which read only by
colour contrast. Masked in one colour the way every other mark here is, the
letters union with the block they sit on and the card renders a solid slab —
so `make-hero.mjs` grew a `logo.knockout` option that inlines and recolours the
SVG instead of masking it, putting the device in the theme's text colour and the
wordmark in its background colour. Still two theme tokens and no brand palette;
just drawn rather than stencilled.

**A first attempt gave up on this and shipped a text card instead.** That was
wrong, and the reason is worth keeping: "the mark does not mask" is a fact about
the renderer, not about the mark. Check whether the logo is a knockout before
concluding it cannot be reversed.
