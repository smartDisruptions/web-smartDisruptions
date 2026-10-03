import { G, JUMP_V, kit } from './kit';

/**
 * Moon Gate (Hard, 132 bpm, 40 bars). The town turns upside down.
 *
 *   intro  0  moonlit roofs, three jumps on the kick
 *   a      4  the blue gate: upside down along the eaves, blue drums back
 *             down (scroll 0: jump the first drum and stay up)
 *   b     12  Roll: a pit in the roof says "go up", a gap in the eaves
 *             says "come down", caltrops on both
 *   c     20  blue and green lanterns flip him in mid-air, under sakura
 *             (scroll 1: a red lantern you could skip, up onto a ledge)
 *   d     28  fast: Roll and Kite trade places every two bars
 *             (scroll 2: over a chimney, by the eaves)
 *   outro 36  home under the moon
 *
 * The drums: kick on 0 (and 2.5 from a on), clap on 2 in a, snare on 1 and
 * 3 from b, an extra kick on 1.5 in d. Presses sit on those.
 */
const k = kit('moon-gate');

/** A hanging caltrop row under a ceiling at y, for a down-jump pressed at pressX. */
function hang(pressX: number, y: number, n = 1) {
  const left = pressX + (k.vAt(pressX) * JUMP_V) / G - n / 2;
  k.spike(left, y, n, { dir: 'down' });
  return left;
}
/** A drum's x so Kiru touches it on (bar, beat). */
const drumAt = (bar: number, beat = 0) => k.at(bar, beat) + 0.3;
/** Where a jump pressed on (bar, beat) peaks. */
const apex = (bar: number, beat = 0) =>
  k.at(bar, beat) + (k.vAt(k.at(bar, beat)) * JUMP_V) / G;
/** Eaves: a ceiling of tiled blocks from x0 to x1, underside at y, in pieces. */
function eave(
  x0: number,
  x1: number,
  y: number,
  style: 'tiles' | 'bridge' = 'tiles'
) {
  for (let x = x0; x < x1 - 0.01; x += 24)
    k.block(x, y, Math.min(24, x1 - x), 1, { style });
}

/**
 * Roll through a zigzag: caltrop rows on alternate surfaces, end to end, so
 * every switch has its own beat. `taps` are the switches; the first row is on
 * `from`, the surface he starts on, and each row ends a little after its tap.
 */
function zigzag(
  from: 'floor' | 'ceil',
  taps: [number, number][],
  end: number,
  lo: number,
  hi: number
) {
  let side = from;
  taps.forEach(([bar, beat], i) => {
    const x0 = k.at(bar, beat) + 1.5;
    const next = taps[i + 1];
    const x1 = next ? k.at(next[0], next[1]) + 1.5 : end;
    // He leaves `side` on this tap, so the row is on `side`.
    const n = Math.max(1, Math.floor(x1 - x0));
    if (side === 'floor') k.spike(x0, lo, n);
    else k.spike(x0, hi, n, { dir: 'down' });
    side = side === 'floor' ? 'ceil' : 'floor';
  });
}

k.kill(-4, 18);
k.theme(-20, 'moon');
// Wind chevrons first, so at() knows every speed: fast for d, normal home.
k.speed(k.at(28), 5.75, 'fast', 6);
k.speed(k.at(36), 6.75, 'normal', 8);

// ── Intro: moonlit and quiet ────────────────────────────────────────────────
k.roof(-16, k.at(2) + 0.6 + 16, 3, 'tiles');
k.deco(4, 3, 'cat');
k.deco(11, 3, 'stone-lantern');
k.deco(27, 3, 'torii');
k.jumpSpikes(k.at(1), 3);
const r1 = k.at(2) + 3.6;
k.roof(r1, drumAt(8) + 1.6 - r1, 3, 'warehouse');
k.deco(r1 + 4, 3, 'bonsai');
k.jumpSpikes(k.at(3), 3, 2);

// ── a: the blue gate, upside down along the eaves ───────────────────────────
const E = 8; // eave underside
k.text(k.at(4) - 6, 10.3, 'Upside down!', 0.8);
eave(k.at(4) - 10, k.at(7) - 6, E);
k.gate(k.at(4), 5.5, { grav: -1, h: 5 });
k.deco(k.at(4, 2), 3, 'laundry', { s: 4 });
hang(k.at(5, 2), E);
hang(k.at(6, 2), E);
// The drum takes him home; jump it to stay up and find the scroll.
eave(k.at(7) - 6, k.at(8) + 4, E, 'bridge');
k.pad(drumAt(7), E, 'blue', true);
k.scroll(k.at(7, 2), 7.3, 0);
// The roof ends at a drum: the only way on is up, over the void.
k.pad(drumAt(8), 3, 'blue');
const gapL = k.at(10) + 0.6;
eave(k.at(8) + 4, gapL, E);
hang(k.at(8, 2), E);
hang(k.at(9), E, 2);
eave(gapL + 3, k.at(11) + 4, E);
k.pad(drumAt(11), E, 'blue', true);
const r2 = k.at(10, 2);
k.roof(r2, k.at(14) + 3 - r2, 3, 'tiles');
k.deco(r2 + 3, 3, 'banner');

// ── b: Roll between the roofs and the eaves ─────────────────────────────────
// Real roofs and eaves: a pit in the roof means "go up", a gap in the eaves
// means "come down". Caltrops on either surface say the same.
const LO = 3;
const HI = 8.5;
k.gate(k.at(12), 5.75, { mode: 'roll', grav: 1, h: 5.5 });
k.text(k.at(12) + 5, 7, 'Tap to switch', 0.7);
/** A roll obstacle's left edge, for a tap on (bar, beat). */
const bx = (bar: number, beat = 0) => k.at(bar, beat) + 2;
const pits: [number, number][] = [
  [bx(15), bx(15) + 4],
  [bx(17), bx(17) + 3],
  [bx(17, 3), bx(18, 1.5)],
];
const roofStyles = ['flat', 'shrine', 'tiles', 'warehouse'] as const;
let rx = k.at(14) + 3;
pits.forEach(([a, b], i) => {
  k.roof(rx, a - rx, LO, roofStyles[i]);
  rx = b;
});
k.roof(rx, k.at(21) + 0.6 - rx, LO, 'pagoda');
// The eaves, with one gap, end before the gate to c: he must come down.
eave(k.at(12) - 6, bx(16, 2.5), HI);
eave(bx(16, 2.5) + 4, bx(19, 2.5), HI);
k.spike(bx(13), LO, 2);
k.spike(bx(14), HI, 2, { dir: 'down' });
k.spike(bx(15, 2.5), HI, 2, { dir: 'down' });
k.spike(bx(16), LO, 2);
k.spike(bx(17, 1), HI, 1, { dir: 'down' });
k.spike(bx(17, 2.5), LO, 1);
k.spike(bx(18, 2.5), HI, 3, { dir: 'down' });
k.spike(bx(19), LO, 2);
k.deco(bx(16) + 6, LO, 'neon');

// ── c: blue and green lanterns flip him in mid-air ──────────────────────────
// Blue flips him straight across; green flips him with a hop, the long way.
k.theme(k.at(20) - 6, 'sakura', 10);
k.gate(k.at(20), 5.75, { mode: 'run', grav: 1, h: 5.5 });
k.jumpSpikes(k.at(20, 2.5), 3, 2);
// Over a pit too wide to jump: a blue lantern at the top of the jump.
k.orb(apex(21) + 0.4, 5.9, 'blue');
eave(k.at(20, 3), k.at(22) + 0.6, E);
hang(k.at(21, 2.5), E);
// The eave ends: dive, and a green lantern floats him over the pit.
k.orb(apex(22) + 0.4, 5.1, 'green');
const c2 = k.at(22) + 4.5;
k.roof(c2, k.at(24) + 0.6 - c2, 3, 'pagoda');
k.deco(c2 + 2, 3, 'sakura');
k.jumpSpikes(k.at(23), 3, 2);
// A red lantern you could skip: up onto the ledge, where the scroll waits.
k.orb(apex(23) + 0.2, 5.9, 'red');
k.block(k.at(23) + 5, 6.5, 7, 1, { style: 'tiles' });
k.scroll(k.at(23) + 9.5, 8.3, 1);
// A green lantern swoops him down into the pit's mouth and up to the eaves.
k.orb(apex(24) + 0.4, 5.9, 'green');
eave(k.at(24) + 4, k.at(25) + 0.6, E, 'bridge');
hang(k.at(24, 3), E, 2);
// Flip, flip: down with a blue lantern, up with another.
k.orb(apex(25) + 0.4, 5.1, 'blue');
const c3 = k.at(25) + 1.5;
k.roof(c3, k.at(25, 2.5) + 0.6 - c3, 3, 'shrine');
k.orb(apex(25, 2.5) + 0.4, 5.9, 'blue');
eave(k.at(25, 2.5), k.at(26, 2.5) + 0.6, E);
hang(k.at(26), E);
k.orb(apex(26, 2.5) + 0.4, 5.1, 'green');
const c4 = k.at(26, 2.5) + 4.5;
k.roof(c4, k.at(30) - c4, 3, 'flat');
k.deco(c4 + 3, 3, 'sakura', { flip: true });
// The fill: a jump on beat 4 lands on the drop.
k.jumpSpikes(k.at(27, 3), 3, 2);

// ── d: Roll and Kite trade places, fast ─────────────────────────────────────
k.theme(k.at(28) - 4, 'moon', 10);
const KLO = 3;
const KHI = 10.5;
k.gate(k.at(28), 5.75, { mode: 'roll', grav: 1, floor: LO, ceil: HI, h: 5.5 });
// A zigzag, a switch on the kick or the snare, ending up on the eaves.
zigzag(
  'floor',
  [
    [28, 1],
    [28, 2.5],
    [29, 0],
    [29, 1.5],
    [29, 2.5],
  ],
  k.at(30) + 0.5,
  LO,
  HI
);
k.gate(k.at(30), 6.75, {
  mode: 'kite',
  grav: 1,
  floor: KLO,
  ceil: KHI,
  h: 7.5,
});
k.block(k.at(30, 1), KLO, 2, 3.5, { style: 'chimney' });
k.block(k.at(30, 2.5), 7, 2, KHI - 7, { style: 'wall' });
k.saw(k.at(31), 6.75, 1);
k.block(k.at(31, 1.5), KLO, 2, 4, { style: 'chimney' });
// The eaves come down to the roll's ceiling, so he flies into its corridor.
k.block(k.at(31, 2.5), HI, k.at(32) + 1 - k.at(31, 2.5), KHI - HI, {
  style: 'wall',
});
k.gate(k.at(32), 5.75, { mode: 'roll', grav: -1, floor: LO, ceil: HI, h: 5.5 });
// The zigzag again from the eaves; the last row runs to the gate, so he
// rides the eaves into the kite.
zigzag(
  'ceil',
  [
    [32, 1.5],
    [33, 0],
    [33, 1.5],
    [33, 2.5],
  ],
  k.at(34) + 0.5,
  LO,
  HI
);
k.gate(k.at(34), 6.75, {
  mode: 'kite',
  grav: 1,
  floor: KLO,
  ceil: KHI,
  h: 7.5,
});
k.block(k.at(34, 1), 6.5, 2, KHI - 6.5, { style: 'wall' });
k.block(k.at(34, 2.5), KLO, 2, 3.5, { style: 'chimney' });
// Climb past what the chimney needs, up by the eaves, for the scroll.
k.scroll(k.at(34, 2.5) + 1, 9.6, 2);
k.saw(k.at(35), 4.8, 0.9);
// The drums drop out: glide low under the last eave and land.
k.block(k.at(35, 1), 6.5, k.at(36) + 1 - k.at(35, 1), KHI - 6.5, {
  style: 'wall',
});

// ── Outro: home under the moon ──────────────────────────────────────────────
k.gate(k.at(36), 6.75, {
  mode: 'run',
  grav: 1,
  floor: null,
  ceil: null,
  h: 7.5,
});
k.roof(k.at(30), k.at(38) + 0.6 - k.at(30), 3, 'tiles');
k.jumpSpikes(k.at(37), 3);
const home = k.at(38) + 3.6;
k.roof(home, k.at(40) + 36 - home, 3, 'shrine');
k.deco(home + 6, 3, 'stone-lantern');
k.deco(k.at(39) - 2, 3, 'torii');
k.deco(k.at(39) + 6, 7.5, 'crane');
k.end(k.at(40));
// Past the finish he runs on under the moon while the fireworks go up.
k.deco(k.at(40) + 4, 3, 'cat');
k.deco(k.at(40) + 10, 3, 'stone-lantern');
k.deco(k.at(40) + 14, 9.6, 'lanterns', { s: 7 });
k.deco(k.at(40) + 23, 3, 'bonsai');
k.deco(k.at(40) + 27, 3, 'torii');
k.deco(k.at(40) + 33, 3, 'stone-lantern');
export default k.build();
