/**
 * The smoke bomb's styles (and the 404's), as strings rendered through React's
 * hoisted <style href precedence> rather than imported .css files.
 *
 * Why: CSS imported by the ROOT not-found.tsx is preloaded on every page of the
 * site (Next keeps the 404 ready for a client-side notFound()), which costs
 * every visitor a request and logs a "preloaded but not used" warning. As a
 * hoisted <style>, it ships only with the pages that render it: the 404 and
 * /kiru. React dedupes it by href when both are on screen.
 */

const min = (css: string) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .trim();

export const SMOKE_CSS = min(`
/*
  Kiru's smoke bomb — the 404 page and the "vanish" card on /kiru.

  A cartoon cloud made of nothing but CSS: layered radial-gradient blobs,
  drawn twice — once a little larger in Kiru's outline colour, once in smoke —
  so the outline only shows around the silhouette, like his sticker outline.
  It billows a while and settles; tapping it clears the smoke (he's there) or
  drops another bomb (he's gone). Transforms and opacity only.

  Prefix: kv-
*/

.kv {
  display: grid;
  justify-items: center;
}
.kv-stage {
  position: relative;
  display: block;
  width: var(--kv-size, 15rem);
  aspect-ratio: 1 / 0.86;
  padding: 0;
  border: 0;
  border-radius: 40%;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.kv-stage:focus-visible {
  outline-offset: 6px;
  border-radius: 40%;
}
.kv-stage:active .kv-puff {
  scale: 0.96;
}

/* Kiru, inside the cloud. */
.kv-kiru {
  position: absolute;
  left: 50%;
  bottom: 4%;
  width: 64%;
  translate: -50% 0;
  transform-origin: 50% 80%;
  opacity: 0;
  scale: 0.6;
  pointer-events: none;
}
.kv-kiru .kiru {
  display: block;
  width: 100%;
  height: auto;
}
.kv[data-shown] .kv-kiru {
  opacity: 1;
  scale: 1;
}

/* The cloud. */
.kv-smoke {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.kv[data-shown] .kv-smoke {
  opacity: 0;
}
.kv-puff {
  position: absolute;
  inset: 0;
  transition: scale 0.2s ease;
}
.kv-layer {
  position: absolute;
  inset: 0;
}
.kv-blob {
  position: absolute;
  left: calc(var(--x) * 1%);
  top: calc(var(--y) * 1%);
  width: calc(var(--s) * 1%);
  aspect-ratio: 1;
  translate: -50% -50%;
  border-radius: 50%;
}
/* Three passes of the same blobs, cel-shaded like Kiru: the outline (a few
   pixels bigger, in his line colour), the shade, then the light, lifted a
   little so the shade shows along every underside. Flat colours, so where the
   blobs overlap they merge into one cloud. */
.kv-ink .kv-blob {
  width: calc(var(--s) * 1% + 9px);
  background: var(--kiru-line);
}
.kv-shade .kv-blob {
  background: #b9bfd4;
}
.kv-fill .kv-blob {
  width: calc(var(--s) * 1% - 5px);
  translate: -50% -58%;
  background: radial-gradient(circle at 38% 32%, #ffffff 0%, #f2f3f9 45%, #e2e5f0 100%);
}

/* Small puffs curling up off the cloud. */
.kv-wisp {
  position: absolute;
  left: calc(37% + var(--i) * 12%);
  top: 17%;
  width: 9%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #eceef6;
  box-shadow: 0 0 0 3px var(--kiru-line);
  opacity: 0;
}

/* Little stars thrown out by the bang. */
.kv-spark {
  position: absolute;
  left: calc(var(--x) * 1%);
  top: calc(var(--y) * 1%);
  width: 9%;
  aspect-ratio: 1;
  translate: -50% -50%;
  background: var(--sd-gold);
  clip-path: polygon(50% 0, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0 50%, 39% 39%);
  opacity: 0;
}

/* The sound effect, in brush: 消, "vanish" — the way a comic letters a bang. */
.kv-sfx {
  position: absolute;
  top: -8%;
  right: -12%;
  width: 34%;
  height: auto;
  color: var(--sd-pen);
  rotate: 10deg;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.kv[data-shown] .kv-sfx {
  opacity: 0;
}

.kv-hint {
  margin-top: 0.5rem;
  min-height: 1.5em;
  font-size: 0.85rem;
  font-weight: 650;
  color: var(--sd-text-secondary);
}

@media (prefers-reduced-motion: no-preference) {
  /* First visit: he's there for a beat, then the bomb goes off. */
  .kv:not([data-shown]):not([data-touched]) .kv-kiru {
    animation: kv-vanish 0.42s var(--ease-out-expo) 0.75s both;
  }
  .kv:not([data-shown]):not([data-touched]) .kv-puff {
    animation: kv-poof 0.75s cubic-bezier(0.2, 1.4, 0.4, 1) 0.68s both;
  }
  .kv:not([data-shown]):not([data-touched]) .kv-spark {
    animation: kv-spark 0.7s ease-out calc(0.72s + var(--d, 0s)) both;
  }
  .kv:not([data-shown]):not([data-touched]) .kv-sfx {
    animation: kv-sfx 0.6s cubic-bezier(0.2, 1.6, 0.4, 1) 0.8s both;
  }

  /* Tapped: bring him back, or send him away again. */
  .kv[data-touched]:not([data-shown]) .kv-kiru {
    animation: kv-vanish 0.36s var(--ease-out-expo) both;
  }
  .kv[data-touched]:not([data-shown]) .kv-puff {
    animation: kv-poof 0.7s cubic-bezier(0.2, 1.4, 0.4, 1) both;
  }
  .kv[data-touched]:not([data-shown]) .kv-spark {
    animation: kv-spark 0.65s ease-out var(--d, 0s) both;
  }
  .kv[data-shown] .kv-kiru {
    animation: kv-appear 0.6s cubic-bezier(0.2, 1.5, 0.4, 1) 0.1s both;
  }
  .kv[data-shown] .kv-smoke {
    animation: kv-clear 0.55s ease-out both;
  }
  .kv[data-shown] .kv-spark {
    animation: kv-spark 0.6s ease-out var(--d, 0s) both;
  }

  /* Then it drifts for a while and settles. Finite, so an open tab goes still. */
  .kv-blob {
    animation: kv-billow var(--t, 3.4s) ease-in-out var(--w, 0s) 8 alternate both;
  }
  .kv:not([data-shown]) .kv-wisp {
    animation: kv-wisp 2.8s ease-out calc(1.5s + var(--i) * 0.9s) 5 both;
  }
}
@keyframes kv-wisp {
  0% {
    opacity: 0;
    translate: 0 0;
    scale: 0.4;
  }
  25% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
    translate: calc((var(--i) - 1) * 14px) -52px;
    scale: 1.15;
  }
}

@keyframes kv-vanish {
  0% {
    opacity: 1;
    scale: 1;
  }
  100% {
    opacity: 0;
    scale: 0.55;
    rotate: -12deg;
  }
}
@keyframes kv-appear {
  0% {
    opacity: 0;
    scale: 0.4;
  }
  100% {
    opacity: 1;
    scale: 1;
  }
}
@keyframes kv-poof {
  0% {
    opacity: 0;
    scale: 0.15;
  }
  35% {
    opacity: 1;
  }
  100% {
    opacity: 1;
    scale: 1;
  }
}
@keyframes kv-clear {
  0% {
    opacity: 1;
    scale: 1;
  }
  100% {
    opacity: 0;
    scale: 1.45;
  }
}
@keyframes kv-billow {
  from {
    transform: none;
  }
  to {
    transform: translate(calc(var(--dx, 0) * 1px), calc(var(--dy, -4) * 1px)) scale(var(--g, 1.06));
  }
}
/* --fx/--fy are in the spark's own widths (it is 9% of the stage). */
@keyframes kv-spark {
  0% {
    opacity: 0;
    translate: -50% -50%;
    scale: 0.3;
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    translate: calc(-50% + var(--fx) * 1%) calc(-50% + var(--fy) * 1%);
    scale: 1;
    rotate: 90deg;
  }
}
@keyframes kv-sfx {
  from {
    opacity: 0;
    scale: 0.3;
    rotate: -20deg;
  }
}
`);

export const NOT_FOUND_CSS = min(`
/*
  The 404 page (src/app/not-found.tsx) — Kiru used a smoke bomb.
  The cloud itself is SMOKE_CSS above. Prefix: nf-
*/

.nf {
  position: relative;
  overflow-x: clip;
  display: grid;
  place-items: center;
  min-height: calc(100svh - 4rem - 72px);
  padding: 2rem 1rem 3rem;
}
@media (min-width: 64rem) {
  .nf {
    min-height: calc(100svh - 4rem);
    padding: 3rem 1.5rem 4rem;
  }
}
.nf-mark {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(46rem, 130vw);
  height: auto;
  translate: -50% -52%;
  opacity: 0.045;
}
:root[data-theme='dark'] .nf-mark {
  opacity: 0.065;
}
.nf-inner {
  position: relative;
  display: grid;
  justify-items: center;
  max-width: 46rem;
  text-align: center;
}
.nf-kicker {
  margin-top: 1.25rem;
}
.nf-h1 {
  margin-top: 0.8rem;
  font-size: clamp(2.1rem, 8.6vw, 3.6rem);
  line-height: 1.06;
  color: var(--sd-text-primary);
}
.nf-sub {
  margin-top: 1rem;
  max-width: 34ch;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--sd-text-secondary);
}
.nf-ways {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.65rem;
  margin-top: 1.75rem;
}
@media (max-width: 30rem) {
  .nf-ways {
    display: grid;
    width: 100%;
    max-width: 20rem;
  }
}

/* No entrance animation on the words: the headline is the page's largest
   paint, and the smoke bomb is the show. */
`);
