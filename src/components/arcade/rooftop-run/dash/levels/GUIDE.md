# Building a Dash level

This is the guide for whoever builds one of the six levels. You need
`levels/kit.ts` (the authoring kit), `levels/meta.ts` (your level's song
sections, which you do not change) and the solver test. Read `../README.md`
for the design spec, and `sandbox.ts` for a worked example that uses every
object and all six modes.

## The loop

1. Read your level's `sections` in `meta.ts`: names, bars, energy, mode,
   speed, and a note on what each is for.
2. Build `levels/<id>.ts` with the kit and `export default k.build()`.
3. Run the solver on it:

   ```
   npm run test:rooftop -- --level <id>          # the full check
   npm run test:rooftop -- --level <id> --quick  # skip the slack measure
   ```

4. Read the table (see [The solver](#the-solver)), fix what it flags,
   and repeat. Then play it in the browser.

A level that fails the test does not ship.

## Coordinates

- Units are **blocks**. x grows to the right (the way Kiru runs), **y grows
  up**. y = 0 is the street; most roofs sit at y = 3 and levels live
  between y = 2 and y = 14.
- The view is 11.5 blocks tall and 16 to 26.5 wide. Kiru sits about 28% in
  from the left, so a player sees roughly 12 to 19 blocks ahead.
- Kiru's position is the **centre of his hitbox**. `start` is his centre x
  and the surface y his feet are on (default `{ x: 0, y: 3 }`).
- An object's `x` is its left edge (roofs, blocks, caltrops, drums, vents)
  or its centre (shuriken, crows, lanterns, scrolls).
- Time comes from x: Kiru never stops, so a distance is a time. At normal
  speed 10.4 blocks is one second.

## The physics in numbers

Every number lives in `../physics.ts`; the tables below come from it. The
simulation runs at 120 steps a second. "Window" means how long the press
can be and still work, measured step by step in the simulation; ±half of
it is the slack a player has aiming at the middle.

### Speeds

|                            | slow | normal | fast | faster | fastest |
| -------------------------- | ---- | ------ | ---- | ------ | ------- |
| blocks per second          | 8.4  | 10.4   | 12.9 | 15.6   | 19.2    |
| blocks per beat at 120 bpm | 4.2  | 5.2    | 6.45 | 7.8    | 9.6     |

Blocks per beat at your tempo: speed × 60 / bpm. `k.at()` does this for you.

### Run

A fixed arc: tap or hold, the jump is always the same. Holding jumps again
on every landing. A press up to 0.1 s before landing still jumps (the
buffer), and he can still jump up to 0.05 s after running off an edge
(coyote time; never design for it).

- **Peak 2.2 blocks** above where he left. Airtime on flat ground 0.406 s.
- **Steps:** up to 2 blocks is a jump (2.4 is a hard one); 2.5 and over
  cannot be climbed. A ledge within 0.25 below his feet is stepped onto.
- **Hitbox** 0.8 × 1.4. He fits under a ceiling 1.45 above the floor; leave 2.

|                                     | slow            | normal          | fast            | faster          | fastest         |
| ----------------------------------- | --------------- | --------------- | --------------- | --------------- | --------------- |
| jump distance, flat (blocks)        | 3.41            | 4.22            | 5.24            | 6.33            | 7.80            |
| jump distance landing 1 up / 1 down | 2.96 / 3.76     | 3.67 / 4.66     | 4.55 / 5.78     | 5.51 / 6.99     | 6.78 / 8.60     |
| widest gap: level / 1 up / 2 up     | 4.3 / 3.9 / 3.3 | 5.1 / 4.6 / 3.9 | 6.2 / 5.5 / 4.6 | 7.3 / 6.5 / 5.4 | 8.8 / 7.9 / 6.5 |
| widest gap: 2 down / 4 down         | 5.0 / 5.6       | 6.0 / 6.8       | 7.2 / 8.2       | 8.5 / 9.7       | 10.3 / 11.8     |

**Caltrop rows** (window in ms; ✗ cannot be cleared with one jump):

| row     | slow | normal | fast | faster | fastest |
| ------- | ---- | ------ | ---- | ------ | ------- |
| 1       | 258  | 283    | 300  | 308    | 325     |
| 2       | 142  | 183    | 225  | 250    | 275     |
| 3       | 25   | 92     | 150  | 183    | 225     |
| 4       | ✗    | ✗      | 67   | 117    | 175     |
| 5       | ✗    | ✗      | ✗    | 58     | 117     |
| 6       | ✗    | ✗      | ✗    | ✗      | 67      |
| 3 small | 50   | 117    | 175  | 208    | 250     |
| 4 small | ✗    | 17     | 92   | 142    | 200     |

At normal speed a triple is ±41 to ±46 ms (its window is 83 to 92 ms
depending on where it sits against the step grid): a **hard** obstacle, not
an easy one. A quadruple at normal speed is impossible by design.

**Gaps between roofs at the same height** (window in ms, coyote included):

| gap | slow | normal | fast | faster | fastest |
| --- | ---- | ------ | ---- | ------ | ------- |
| 2   | 317  | 358    | 367  | 392    | 400     |
| 3   | 200  | 258    | 292  | 325    | 350     |
| 4   | 83   | 158    | 217  | 258    | 292     |
| 5   | ✗    | 67     | 142  | 200    | 242     |
| 6   | ✗    | ✗      | 58   | 133    | 192     |

**Step-ups** onto a block of height h: 1 → 333 ms, 1.5 → 267, 2 → 183,
2.4 → 67 (at any speed but slow).

### Drums (pads) and spirit lanterns (orbs)

|              | effect                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- |
| jump drum    | launches to **4.5** above the drum                                                          |
| hop drum     | **3.2**                                                                                     |
| leap drum    | **6.5**                                                                                     |
| flip drum    | flips gravity, with a push toward the new ground (7.6 blocks/s)                             |
| jump lantern | a full jump from where he is: **2.2** up                                                    |
| hop lantern  | 0.7× the speed: **1.08** up                                                                 |
| leap lantern | 1.35× the speed: **4.0** up                                                                 |
| flip lantern | flips gravity with the same push as the flip drum                                           |
| spin lantern | flips gravity, then a full jump in the new gravity (first toward the old ground, then away) |
| slam lantern | slams him toward the ground at 26 blocks/s                                                  |

These heights hold in Run, Roll, Shadow Step and Parasol (the parasol's
gentle gravity gets a gentler launch to the same height). In the kite,
drums and lanterns push at the kite's full climb rate. The dragon ignores
everything but flip and spin (it flips).

Drums fire on touch, once per attempt. Lanterns fire on a press while he
touches one (a reach of 0.6 around its centre), once per attempt; a press
made up to 0.1 s before he reaches one still fires it **if the button is
still held**. A lantern takes the press before a jump does.

### The other modes

| mode        | button                                                        | numbers                                                                                                                                                                                                                                  |
| ----------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kite        | hold to climb, release to dive                                | climb and dive at **0.85 × speed** (about 40° at every speed); 0.35 s from full dive to full climb. Slides along floors, ceilings and block tops and bottoms; dies on a block's side. Hitbox 0.8 × 0.8                                   |
| Roll        | tap on a surface: gravity flips                               | same gravity as Run, a push of 7.6 blocks/s; crossing a 4-block gap takes about 0.22 s. Buffered 0.1 s. Holding does not flip again. Hitbox 0.9 × 0.9                                                                                    |
| Parasol     | each tap is a hop                                             | hop **1.6** blocks from wherever he is; gravity 0.45 of Run's; falls no faster than 7 blocks/s; a hop takes 0.56 s to come back down. Taps stack: tapping every 0.25 s climbs about 1.6 a tap. Hitbox 0.8 × 0.8                          |
| Dragon      | hold: up at 45°, release: down at 45°                         | rises one block per block, at every speed. Slides along floors and ceilings, dies on sides. Hitbox **0.4 × 0.4**                                                                                                                         |
| Shadow Step | tap on a surface: vanish and reappear on the opposite surface | instant; lands him standing (upside down) on the first block underside, ceiling bound, roof top, block top or floor bound in that direction. Nothing there: he leaves the level and dies. Buffered 0.1 s. Same gravity and hitbox as Run |

**Gravity −1** mirrors everything: he stands on undersides and a jump goes
down. Upside down with no ceiling he falls up until `killAbove` (40 by
default); for upside-down sections over open sky, lower it with
`k.kill(-4, 20)` so the death comes sooner.

### Hitboxes and hazards

Hazards test against Kiru's box shrunk by 15%, so a near miss is a miss.

- **Caltrops:** one box per row, from 0.35 in from each end, 0.55 tall
  (0.28 if small). A row is solid danger end to end.
- **Shuriken (saw):** a circle of 0.8 × its radius.
- **Crow:** a circle of 0.4.
- **Swinging lantern:** a circle of 0.45 at the end of the rope; the rope is
  harmless.
- **Vent:** its column, 0.1 narrower each side, only while blowing.
- **Solids:** landing on a top is fine; running into a side is a death; in
  Run a head bump on an underside just stops the rise. A block crushing him
  into another kills only once it is well inside him.

## The kit

```ts
import { kit } from './kit';
const k = kit('lantern-row'); // starts from levelMeta('lantern-row')
```

**Time and music**

| call                              | returns                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `k.at(bar, beat = 0)`             | the x where that moment falls (bars count from 0; `at(0)` is the start). Honours the start speed and the speed portals placed **so far**. |
| `k.beatX(beats)`                  | the same, counting beats                                                                                                                  |
| `k.timeAt(x)`, `k.beatAt(x)`      | level seconds, or beats, when Kiru reaches x                                                                                              |
| `k.speedAt(x)`, `k.vAt(x)`        | the speed id, or blocks per second, in force at x                                                                                         |
| `k.section(name)`, `k.sections()` | `{ name, bar0, bar1, x0, x1, energy, mode, speed, note }`                                                                                 |

**Objects** (each returns the object it added; see `../types.ts`)

`roof(x, w, top, style?)` · `block(x, y, w, h, { style, move })` ·
`spike(x, y, n = 1, { dir, small, move })` · `saw(x, y, r, move?)` ·
`crow(x, y, move?)` · `lantern(x, y, len, { swing, period, phase })` ·
`vent(x, y, h, on, off, { w, phase, style })` · `pad(x, y, c, flip?)` ·
`orb(x, y, c, move?)` · `gate(x, y, { mode, grav, floor, ceil, h })` ·
`speed(x, y, speed, h?)` · `scroll(x, y, id, move?)` ·
`text(x, y, text, size?)` · `deco(x, y, d, { s, flip })` ·
`theme(x, theme, fade?)` · `end(x)` · `add(obj)` · `kill(below, above)`

**Helpers**

| call                                                        | what it does                                                                                                                                                                                              |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `k.move(dx, dy, period, phase?, wave?)`                     | a Motion: offset (dx, dy) × a swing from −1 to 1, once every `period` beats                                                                                                                               |
| `k.topAt(x, below?)`                                        | top of the highest still roof or block under x (or null over a pit)                                                                                                                                       |
| `k.jumpSpikes(pressX, y, n = 1, { small })`                 | a caltrop row placed so a jump pressed with Kiru's centre at `pressX` sails over its middle; returns its left x. Put `pressX` on a beat: `k.jumpSpikes(k.at(6, 2), 3, 2)`                                 |
| `k.stairs(x, y, { steps, rise = 1, run = 3, style })`       | a staircase of blocks, one jump per step (negative rise goes down); returns the x past it                                                                                                                 |
| `k.roofs(x, [{ w, top, gap?, style? }, ...])`               | roofs in a row; every gap is checked against the jump at the speed in force (it throws if a gap is over 90% of the widest clearable); a gap left out is half the widest. Returns the x past the last roof |
| `k.orbChain(x, y, n, { c = 'jump', dy = 0 })`               | lanterns spaced so each arc meets the next one `dy` higher; returns the last x. A climbing chain (`dy` about 1.5) meets each lantern while he is slow, which is kinder than a level one                   |
| `k.fly(x0, x1, { mode, floor, ceil, back = 'run', grav? })` | a flying section: a gate into `mode` with the corridor [floor, ceil], a gate back out to `back`; both gates span the whole corridor. With `grav: -1` the way in flips him and the way out flips him back  |
| `k.build()`                                                 | sorts the objects, checks the level, returns the LevelDef                                                                                                                                                 |

`build()` throws one message listing every problem: not exactly one `end`;
scrolls 0, 1, 2 not each exactly once; a solid overlapping a caltrop's
cell; an object outside the level or past the kill lines; a gate corridor
too narrow for its mode or not containing its own centre; a start that is
not on a roof or block top.

### A worked example

The start of a First Light (this exact code builds, solves in half a
second, finishes in 60.0 s against a 60.0 s song, reaches all three
scrolls, and its tightest press is ±96 ms):

```ts
import { kit } from './kit';

const k = kit('first-light');
k.theme(-20, 'dawn');
k.roof(-16, k.at(5) + 16, 3, 'tiles'); // from behind the start to bar 5
k.text(8, 7, 'Tap to jump');
// One caltrop to jump on the downbeat of bar 2, another on bar 3.
k.jumpSpikes(k.at(2), 3);
k.jumpSpikes(k.at(3), 3);
k.scroll(k.at(3) + 2.1, 6.4, 0); // over the top of that jump
// Section a (bar 4 on): a double caltrop on beat 3, then a gap.
k.jumpSpikes(k.at(4, 2), 3, 2);
const after = k.roofs(k.at(5), [
  { w: 12, top: 3 },
  { w: 20, top: 3, gap: 3 }, // 3 blocks: a 258 ms window at normal speed
]);
// A crate to hop onto, and a scroll you only reach by jumping off it.
k.block(k.at(6) + 1.5, 3, 4, 1, { style: 'crate' });
k.scroll(k.at(6) + 4, 7.2, 1);
k.roof(after, k.at(28) + 10 - after, 3, 'flat'); // ... the rest of the level ...
k.scroll(k.at(10), 6, 2);
k.end(k.at(28)); // First Light is 28 bars long
export default k.build();
```

## Object notes

- **Caltrops** (`spike`): `dir` 'up' (default) sits on a surface at y,
  cells [x, x+n] × [y, y+1]; 'down' hangs from a ceiling at y, cells
  [x, x+n] × [y−1, y]; 'right' and 'left' stick out of a wall, cells
  [x, x+1] × [y, y+n] stacked upward, 'right' with its base on the left edge
  (a wall at x), 'left' with its base on the right edge (a wall at x+1).
  `small` is half the size. Never let a solid cover a caltrop's cell.
- **Drums** (`pad`): cell [x, x+1] on the surface at y; `flip: true` hangs
  it under a ceiling at y. Kiru must touch its top 0.3 to set it off. A
  launch is always away from his current gravity.
- **Gates**: they fire as Kiru's **centre crosses x while within y ± h/2**
  (h defaults to 4). A gate that does not span his path is silently missed,
  so give flying-section gates the whole corridor (`k.fly` does). A gate
  sets the corridor from there on: `floor` and `ceil` are safe lines to
  slide along; omitted or null means none. A gate into kite, parasol or
  dragon with neither bound gets a 10-block corridor centred on the gate. A
  mode change keeps half his vertical speed and, if he is standing, his
  feet where they are. Bounds apply in every mode: a floor bound in Run is
  a floor over the pits.
- **Wind chevrons** (`speed`): fire like gates. Place a section's chevron
  before you call `at()` for anything after it.
- **Moving things** (`move`): position = placed position + (dx, dy) × w,
  where w = sin(2π·p) ('sine', the default) or a triangle wave ('tri'), and
  p = beats / period + phase. Motion runs on level time, so it is the same
  on every attempt; at a different tempo it lands differently. He rides a
  moving block up and down, never sideways.
- **Swinging lanterns**: angle = swing × sin(2π·(beats/period + phase)),
  the body at (x + len·sin a, y − len·cos a). Defaults: swing 0.6 rad,
  period 4 beats.
- **Vents**: deadly while (beats + phase) mod (on + off) < on, then quiet.
  They hiss a beat before they blow.
- **Scrolls**: three per level. They count only on a finishing run, so
  each must be reachable on a route that still finishes.
- **The end**: exactly one; crossing its x completes the level.

## Patterns that feel good

- **Presses on the beat.** Decide where the press should land (a beat, or
  an eighth) and build the obstacle around that press: `k.jumpSpikes(k.at(bar,
beat), y, n)`. A drum, a lantern or a gate on a downbeat lands with the
  kick.
- **Show it, then use it.** A new object or mode appears alone first, with
  room to read it (two beats of clear run before it), then in combination.
- **Telegraph.** Every hazard should be visible about a second before it
  matters. Avoid a hazard just past the top of a jump, where a player cannot
  see it coming, and avoid hazards right behind a gate.
- **Breathers.** After a hard passage give one or two bars of plain run,
  and lighten the last bar of each section (the music fills there).
- **Readable mode entries.** Put mode gates on section boundaries. Start a
  flying corridor with its centre near where Kiru enters, give the first
  half-second of a new mode nothing to dodge, and keep corridors at least 4
  blocks tall at first (2.5 for the dragon).
- **Energy follows the song.** Energy 1 to 2: a press every bar or two.
  Energy 3: every beat or two. Energy 4 to 5: dense, combined, faster.
- **Rhythm over reflexes.** Repeated patterns at a steady spacing read as
  rhythm; irregular spacing reads as a trap. Vary one thing at a time.
- **Scrolls off the obvious path.** A detour that asks for a deliberate
  choice (a higher route, a lantern you would otherwise skip, a dive), never
  a frame-perfect press.
- **Difficulty.** The ids are easy to demon; players see Calm, Brisk, Steep,
  Fierce, Storm and Oni (`ui/faces.tsx`). Easy is single and double caltrops, wide gaps,
  slow corridors. Insane and demon are triples, tight corridors, fast
  speeds, mode switches every bar.

## Fitting the song

- `k.section(name)` gives the x range of each section (it uses the speed
  portals placed so far, so place each section's chevron at its `x0` first).
- Put the section's speed portal and mode gate at its `x0`.
- Put the end at the song's end: `k.end(k.at(totalBars))`. The test fails
  a level that finishes more than 3 s away from its song (`levelSeconds`).
- `k.timeAt(x)` and `k.beatAt(x)` tell you when anything happens.

## The solver

`npm run test:rooftop` solves every level and the sandbox; add `--level
<id>` for one, `--quick` to skip the slack measure. A bot searches every way
of playing (the button may change 60 times a second), keeps the routes that
stay furthest from danger, and replays its winning run to prove it.

```
level            solve time / song        scrolls slack min/med (target)   tightest x fly clear   objs    states      ms
first-light      yes   59.6/60.0s ✓       ✓✓✓     ±83/±129 (±70)           243.9      0.77         115   1289849    3789
```

| column      | meaning                                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| solve       | the bot finished the level                                                                                                                                |
| time / song | its finishing time against the song; ✓ within 3 s                                                                                                         |
| scrolls     | ✓ for each scroll it could pick up on a run that also finishes                                                                                            |
| slack       | the narrowest and the median window (±ms) over the run's presses in Run, Roll and Shadow Step, against your difficulty's target                           |
| tightest x  | where the narrowest press is                                                                                                                              |
| fly clear   | the narrowest gap (blocks) between Kiru and a hazard or a block's face on the bot's path through the flying sections; ⚠ when under the guide target below |
| states, ms  | how hard the bot worked                                                                                                                                   |

**Slack targets** (the narrowest press must reach these, and no press may
be a single 8 ms step):

| easy   | normal | hard | harder | insane | demon |
| ------ | ------ | ---- | ------ | ------ | ----- |
| ±70 ms | ±55    | ±45  | ±35    | ±28    | ±20   |

**Flying clearance targets** (a warning, not a failure): easy 0.5 blocks,
normal 0.4, hard 0.3, harder 0.25, insane 0.2, demon 0.15.

How slack is measured: each press of the bot's run (taps it does not need
are dropped first, and taps are held for 50 ms, as a person's are) slides
earlier and later one step at a time until the run stops finishing. A press
that falls short is measured again letting the rest of the run adapt, and
letting the press before it move too, since a player learns both. Flying
presses steer continuously, so their sections are judged by clearance.

What fits each target at normal speed, from the tables above: easy (±70)
allows single and double caltrops, gaps up to 4, steps up to 2; a triple
caltrop (±41 to ±46) needs **hard** or above, or fast speed (±75), or small
caltrops (±58).

**When it fails**, the notes under the table say where and why:

- `not solvable: ... died at x=... (spike)`: the furthest any route got,
  and what killed it. Look just before that x.
- `scroll N cannot be picked up`: move it nearer a route, or add one.
- `the narrowest window is ±31 ms ... x=412.5 (run)`: widen what is around
  that x (a shorter row, a narrower gap, more room before it).
- `finishes in 64.2 s but the song is 69.7 s`: move the end, or the
  speed portals.

You can also call the solver from code (`../solver.ts`): `solve(level)`
returns `{ ok, inputs, steps, reachedX, deathX, cause, ms, states, scrolls,
clearance }`, where `inputs` is the button (1 held, 0 not) for each 1/120 s
step; `solveScroll(level, id, inputs)`, `simplify`, `humanize` and
`measureSlack` are what the test uses.

## Gotchas

- **Speed portals before `at()`.** `at()` only knows the portals placed so
  far.
- **Gate spans.** A gate at y = 7 with the default h = 4 spans 5 to 9; Kiru
  running on a roof at y = 3 has his centre at 3.7 and misses it. Use
  `k.fly`, or give gates an `h` that covers his path.
- **Gates set the corridor**, including gravity-only gates: a gate with no
  `floor`/`ceil` removes the bounds (a flying mode then gets a 10-block
  corridor centred on the gate).
- **Tempo moves things.** Crows, moving blocks, lanterns and vents are tied
  to the beat, so a level built at one tempo cannot be copied to another.
- **Triple caltrops are hard** at normal speed (see above). Quadruples are
  impossible at normal and slow speed.
- **Upside down over open sky**, lower `killAbove` with `k.kill(...)`.
- **The six level files start as stubs** (the sandbox under each level's
  name and tempo). The test does not hold a stub to its song length;
  replacing the stub with `export default k.build()` makes it a real level.
