# Kiru's Rooftop Run: Dash

The rhythm level game in Kiru's town. One button, six ways to
move, six hand-built levels set to original music. The original endless run
stays too, as **Classic** (`../engine.ts`, unchanged).

`types.ts` is the contract. This file is the design spec behind it.

## Pillars

1. **One button, many ways to move.** Torii gates switch Kiru between six
   modes; each feels different and is learnable in seconds.
2. **Hand-built levels set to music.** Every attempt is the same level, so
   you learn it. Obstacles land on the beat, and mode changes land on section
   changes. Mastery comes from memory and rhythm, not luck.
3. **Instant retries.** A death shatters Kiru, and about half a second later
   the next attempt starts. There is an attempt counter, a progress bar with
   a %, a best % per level, and a practice mode with checkpoints.
4. **It is Kiru's world.** Every object is a rooftop thing: iron caltrops,
   spinning shuriken, taiko-drum springs, spirit lanterns, torii gates, crows,
   steam vents. Kiru stays recognisably Kiru in every mode.
5. **Fast.** It holds 60 fps on a mid-range phone. Nothing loads until Start.
   No image or audio files: the art is drawn and the music synthesised.

## World and camera

- Units are **blocks** (1 block = 24 world units). y grows up, and y = 0 is
  the street line. Levels mostly live between y = 2 and y = 14.
- The view is 11.5 blocks tall on landscape screens. Its width is clamped to
  16–26.5 blocks; past that, the height gives instead (portrait sees more
  sky, never less road).
- **Camera x:** Kiru sits about 28% in from the left.
- **Camera y:**
  - Run, Roll and Shadow follow Kiru with a dead zone (30–65% of the height)
    and smoothing of about 0.15 s.
  - When gate bounds define a corridor that fits the view, the camera centres
    on the corridor.
  - It freezes on death. It snaps on a practice respawn.
- The simulation runs at a fixed 120 Hz (`STEP`), and rendering interpolates.
  The sim is deterministic: no `Math.random`, and moving things are driven by
  level time.

## Speeds

`SPEEDS`, in blocks/s: slow 8.4 · normal 10.4 · fast 12.9 · faster 15.6 ·
fastest 19.2. Wind-chevron objects (`speed`) change the speed instantly.

## Modes (the physics targets; `physics.ts` holds the tuned numbers)

| id        | name        | the button                                                       | targets                                                                                                                                                                                                   |
| --------- | ----------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run`     | Run         | Tap: jump. Hold: jump again on every landing.                    | Fixed arc, no variable height. Peak about 2.2 blocks. At normal speed a jump clears a **triple** spike with a fair window; a quadruple spike cannot be cleared. A 2-block step up is reachable; 3 is not. |
| `kite`    | Kite        | Hold to climb, release to dive.                                  | Smooth acceleration, capped climb and dive speeds. Touching the corridor floor or ceiling is safe (he slides).                                                                                            |
| `roll`    | Roll        | Tap (on a surface): gravity switches.                            | Buffered. He falls to the other surface at about run-gravity.                                                                                                                                             |
| `parasol` | Parasol     | Each tap is a hop.                                               | The parasol makes gravity gentle. Hops are consistent and stackable.                                                                                                                                      |
| `dragon`  | Dragon      | Hold to fly up at 45°, release to fly down at 45°.               | Tiny hitbox. Slides along floors and ceilings. A wall or hazard kills.                                                                                                                                    |
| `shadow`  | Shadow Step | Tap (on a surface): vanish and reappear on the opposite surface. | Instant. If no surface lies opposite, he leaves the level and dies (`sky`/`pit`).                                                                                                                         |

**Gravity.** A wisteria gate (`grav: -1`) turns him upside down; a jade one
(`grav: 1`) turns him back. Flip drums and flip or spin lanterns turn him over too.
Upside down, everything mirrors: he stands on ceilings, and a "jump" goes down.

**Hitboxes.** Kiru is drawn about 1.6 blocks tall in Run. The hitboxes are:

- Run and Shadow: solid box about 0.8 × 1.4 blocks.
- Roll: about 0.9 × 0.9.
- Kite and Parasol: about 0.8 × 0.8.
- Dragon: about 0.4 × 0.4.

Hazards test against a box about 15% smaller than the solid one, so a near
miss is a miss. The narrowest gap Run can pass under is about 1.6 blocks;
designers should leave 2.

**Solids.**

- Landing on top of a solid is fine, and so is sliding along its underside
  when upside down or flying.
- Running into a solid's side is a `wall` death.
- Ledge forgiveness: he snaps up onto a top surface if his feet are within
  about 0.25 blocks below it while falling.

## Objects (all in `types.ts`)

- **roof**: a building, solid from below the screen up to `top`. The gaps
  between roofs are pits.
- **block** (styles: tiles, crate, tank, wall, beam, stone, chimney, bridge):
  a solid box. It may move (`move`), and he rides moving blocks vertically.
- **spike**: iron caltrops, `n` in a row, facing up, down, left or right,
  full or `small`. The hitbox is forgiving: a narrow box in the spike's
  lower middle.
- **saw**: a giant spinning shuriken. Circle hitbox at about 80% of the drawn
  radius.
- **crow**: flies. Circle hitbox of about 0.4. Usually has a `move`.
- **lantern**: a heavy lantern swinging on a rope. Only the body kills.
- **vent**: steam or fire, deadly for `on` beats and quiet for `off` beats.
  It always warns a beat ahead.
- **pad** (taiko-drum springs), named for what they do and coloured from
  Kiru's palette (`render/sprites.ts` `PAD_COL`): `jump` (vermilion) is a high
  bounce (about 4.5 blocks), `hop` (jade) low (about 3.2), `leap` (gold) very
  high (about 6.5), `flip` (wisteria) turns gravity over with a push.
  Triggered by touch.
- **orb** (spirit lanterns): press while touching one.
  - `jump` (vermilion): a full jump.
  - `hop` (jade): 0.7×.
  - `leap` (gold): 1.35×.
  - `flip` (wisteria): turns gravity over with a small push.
  - `spin` (sakura): turns gravity over and jumps.
  - `slam` (night indigo): a hard push toward the ground.

  Each works once per attempt. There is a 0.1 s buffer: a press just before
  the overlap still counts if the button is still held.

- **gate** (torii): switches mode and/or gravity and sets the corridor. Flying
  modes with no bounds get a 10-block corridor centred on the gate.
- **speed** (wind chevrons): one chevron per step, one to five, running cool
  to hot (indigo, paper, gold, ember, crimson), and slow points back.
- **scroll**: secret scrolls, three per level, placed off the obvious path.
  They count only on a completed normal-mode run, not in practice.
- **text**: signs in the world, mostly First Light's tutorial.
- **deco**: pure art (cats, banners, lanterns, bonsai, laundry, neon, sakura…).
- **theme**: a palette crossfade from x on.
- **end**: the finish line. Exactly one per level.

**Readability rule.**

- Every hazard must read as a hazard in under 100 ms, on every theme, on a
  phone.
- Hazards get the brightest rim light; scenery never uses hazard colours.
- Orbs and pads differ by colour **and** by a glyph or shape, for colour-blind
  players.

## Attempts, practice, progress

**Normal mode.**

- A death shatters Kiru, and the next attempt starts from the beginning after
  about 0.6 s.
- "Attempt N" is drawn in the world near the start.
- A progress bar at the top shows the %, with a tick at the best.
- A new best shows "NEW BEST 47%" in the canvas.

**Practice mode.** Checkpoints work two ways.

- **Manual:** C or Z places one, X removes the last. On touch screens there
  are two on-screen buttons.
- **Automatic:** one is placed every ~2.5 s of level time when it is safe
  (grounded in Run, Roll or Shadow; anywhere in flying modes; not within 1
  block of a hazard; not mid-jump).
- A death respawns him at the latest checkpoint (a `Sim.snapshot()`), with
  the music resumed from that level time.
- The bar turns green, and practice best is tracked separately.

**Completion.**

- Crossing the finish starts a celebration in the canvas: fireworks,
  "LEVEL COMPLETE".
- After about 1.6 s the shell's panel shows attempts, jumps, time and the
  scrolls found.
- Progress persists in localStorage (`DashSave`, owned by the shell's
  `storage.ts`).

## Music

- Each level has an original song, synthesised in WebAudio. The style is
  ninja synthwave: taiko kicks, claps, hats, koto or shamisen plucks, a
  shakuhachi-ish lead, a synth bass, in Japanese pentatonic scales (in / yo).
- It follows `LevelMeta.sections` bar for bar, at the level's `bpm`. Energy
  1–5 sets the density.
- There is a fill on the last bar of each section and a lift or drop where a
  section starts.
- Song time equals level time: beat 0 is t = 0.
- Sound is off until the player turns it on, and the choice is not
  remembered. With sound off, the visuals still pulse on the beat (the
  renderer computes beats from `bpm`).

## Art direction

- **Shadow Dojo.** A moonlit indigo night, the site's vermilion (`#e8432a`)
  as the accent, the Dela Gothic One display face, and Kiru's own rig
  (`../kiru.ts`).
- **Themes** (each a palette plus a backdrop set):
  - dawn: warm horizon, violet sky.
  - lanterns: red-lit festival night.
  - moon: cold blue, a huge moon.
  - storm: teal-grey, rain, soft lightning.
  - sakura: pink night, fireworks.
  - dojo: black and vermilion, ink.
- **Clarity.** Strong silhouettes, glowing rims on anything
  interactive, a beat pulse on glows and outlines, a ground line that reads.
  Parallax in three depths.
- **Effects.** Particles on jumps, landings, orbs, pads, gates and scrolls;
  a death shatter; finish fireworks; an optional trail (skins).

## Performance and budgets

- 60 fps on a mid-range phone. Per frame:
  - no `shadowBlur`;
  - no gradients built per frame;
  - sprites baked into offscreen canvases on `setLevel` / `resize`;
  - culling by x;
  - pooled particles (≤ 300).
- Draw fewer pixels (adaptive quality) rather than drop frames, as Classic
  does.
- The loop runs only while something moves. It stops when paused, when the
  tab is hidden, or when the game scrolls away.
- Size: Dash code plus levels plus songs ≤ **75 KB gzip**, inside the chunk
  that Start already fetches. Classic is a separate chunk, fetched when
  Classic is chosen. The solver never ships to production.

## Accessibility

- Menus and panels are DOM: buttons, keyboard-operable, visible focus. The
  level carousel takes ← → and Enter.
- A polite live region announces attempts, percent on death, new bests and
  completion.
- **Reduced motion:** no screen shake, no flashes, no camera kick, gentler
  pulses. The game still runs: the player started it on purpose.
- **Photosensitivity:** no full-screen flash faster than 3 per second.
  Lightning in Storm Roofs is soft and rare, and off under reduced motion.
- **Keys:**
  - Space, ↑, W, click or tap: the button.
  - P or Esc: pause.
  - M: sound.
  - R: restart.
  - C or Z: checkpoint, X: remove it (practice).
  - Q: quit to levels (from pause).

## Files and owners

| Area       | Files                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contract   | `types.ts`, `README.md`, `levels/meta.ts`, `levels/index.ts`                                                                                          |
| Simulation | `physics.ts`, `sim.ts`, `solver.ts`, `levels/kit.ts`, `levels/sandbox.ts`, `scripts/test-rooftop.mjs`                                                 |
| Runtime    | `engine.ts`, `camera.ts`, `attract.ts`                                                                                                                |
| Renderer   | `render/`                                                                                                                                             |
| Kiru       | `kiru-dash.ts`, plus exports added to `../kiru.ts` (Classic's drawing unchanged)                                                                      |
| Audio      | `audio/`                                                                                                                                              |
| Shell      | `../Game.tsx`, `../RooftopRun.tsx`, `ui/`, `storage.ts`, the `rr-` styles in `src/app/games/arcade.css`, the cabinet copy in `src/app/games/page.tsx` |
| Levels     | `levels/<id>.ts`, one file per level                                                                                                                  |

## Testing

- `npm run test:rooftop` runs the solver over every level. For each level it
  proves the level can be finished, that every scroll can be collected on a
  finishing run, and it reports the tightest input windows.
- A level that fails it does not ship.
- In development, `window.__dash` exposes the sim state and an autopilot that
  plays the solver's inputs, for browser tests.
