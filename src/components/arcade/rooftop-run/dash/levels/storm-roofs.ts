import type { RoofStyle } from '../types';
import { G, JUMP_V, kit } from './kit';

/**
 * Storm Roofs (Harder, 140 bpm, 44 bars). The storm is on the beat.
 *
 *   intro  0  the rain starts: a lantern swings overhead, a vent puffs
 *   a      4  steam vents that blow on every other kick (jump the puff),
 *             lanterns sweeping low across the roof (jump them as they swing
 *             through); a drum on the fill throws him into
 *   b     12  the Parasol: pillars, eaves, a lantern, a vent, a crow
 *             (scroll 1: over the shelf of beams)
 *   c     20  fast: vents, gaps and lanterns (scroll 0: drop into the low
 *             roof in a gap; a drum throws him back up). A red drum on the
 *             one-beat breath throws him into
 *   d     28  the storm breaks, faster: Parasol, Kite, Parasol, Kite, and
 *             steam erupting on every thunder (scroll 2: dive to the floor
 *             between an eave and a chimney)
 *   outro 40  the rain eases and dawn comes up
 *
 * Four-on-the-floor from a on, so every beat has a kick to press on.
 */
const k = kit('storm-roofs');

const mod = (a: number, n: number) => ((a % n) + n) % n;
/** Where a jump pressed on (bar, beat) peaks. */
const apex = (bar: number, beat = 0) =>
  k.at(bar, beat) + (k.vAt(k.at(bar, beat)) * JUMP_V) / G;
/**
 * A gap `g` wide for a jump pressed on (bar, beat): centred a little before
 * the jump's peak, so the window sits on the beat. Returns its two edges.
 */
function gapAt(bar: number, beat: number, g: number): [number, number] {
  const mid = apex(bar, beat) - 0.3;
  return [mid - g / 2, mid + g / 2];
}
/** Roofs from x0 to x1, broken by the gaps, in turn through the styles. */
function street(
  x0: number,
  x1: number,
  gaps: [number, number][],
  styles: RoofStyle[]
) {
  let x = x0;
  gaps.forEach(([a, b], i) => {
    k.roof(x, a - x, 3, styles[i % styles.length]);
    x = b;
  });
  k.roof(x, x1 - x, 3, styles[gaps.length % styles.length]);
}
/**
 * A short steam vent that blows for the beat a jump pressed on (bar, beat)
 * carries him over it, then rests for a beat: it puffs on every other kick.
 */
function puff(bar: number, beat = 0, h = 1.2, w = 1) {
  const x = apex(bar, beat) - w / 2;
  k.vent(x, 3, h, 1, 1, { w, phase: mod(-(bar * 4 + beat), 2) });
}
/**
 * A lantern on a long rope that sweeps low across the roof, through the
 * bottom of its swing (toward him) just as a jump pressed on (bar, beat)
 * carries him over it. Hung from a beam.
 */
function sweep(bar: number, beat = 0, len = 5.5, low = 4.1) {
  const x = apex(bar, beat);
  const b = bar * 4 + beat;
  k.block(x - 1.5, low + len, 3, 0.5, { style: 'beam' });
  k.lantern(x, low + len, len, {
    period: 4,
    phase: mod(0.5 - (b + 0.5) / 4, 1),
  });
}
/** A vent column that blows for one beat starting on (bar, beat), every `every` beats. */
function column(x: number, h: number, bar: number, beat = 0, every = 2, w = 1) {
  k.vent(x, 3, h, 1, every - 1, {
    w,
    phase: mod(-(bar * 4 + beat), every),
  });
}

// Wind chevrons first, so at() knows every speed.
k.speed(k.at(20), 7.5, 'fast', 9.5);
k.speed(k.at(28), 7.5, 'faster', 9.5);
k.speed(k.at(40), 7.5, 'normal', 9.5);

k.theme(-20, 'storm');

// ── Intro: the rain starts ──────────────────────────────────────────────────
street(-16, k.at(4), [gapAt(2, 0, 3)], ['tiles', 'flat']);
k.deco(5, 3, 'cat');
k.deco(10, 3, 'banner');
k.deco(k.at(1, 2.5), 3, 'neon');
k.jumpSpikes(k.at(1), 3);
// A lantern swinging overhead, and a tall vent puffing on the kick: he runs
// under the one, and through the other between puffs.
k.block(k.at(2, 2.5) - 1.5, 10, 3, 0.5, { style: 'beam' });
k.lantern(k.at(2, 2.5), 10, 2.5, { period: 4 });
k.vent(k.at(3, 1.5) - 0.5, 3, 4, 1, 1);
k.jumpSpikes(k.at(3), 3, 2);

// ── a: swinging lanterns and steam vents on the beat ────────────────────────
street(
  k.at(4),
  k.at(21),
  [gapAt(6, 0, 3), gapAt(8, 0, 3.5), gapAt(10, 0, 3), gapAt(20, 3, 4)],
  ['flat', 'warehouse', 'tiles', 'flat', 'tiles']
);
// The thunder on bar 5: a tall vent erupts on every downbeat, and is quiet
// by the time he runs past it.
k.vent(k.at(4, 2.5) - 0.5, 3, 5, 1, 3);
puff(4, 1);
puff(4, 3);
sweep(5, 1);
puff(5, 3, 1.5);
k.jumpSpikes(k.at(6, 2), 3);
sweep(6, 2);
sweep(7);
puff(7, 2);
puff(7, 3);
sweep(8);
k.jumpSpikes(k.at(8, 2), 3, 2);
puff(9, 0, 1.5);
sweep(9, 1);
puff(9, 3);
k.jumpSpikes(k.at(10, 2), 3);
puff(10, 3);
puff(11, 0, 1.5);
// The fill: a drum on beat 4 throws him up, and the parasol opens at the top.
k.pad(k.at(11, 3) + 0.3, 3, 'yellow');

// ── b: Parasol through the storm ────────────────────────────────────────────
const PF = 3;
const PC = 12;
k.gate(k.at(12), 7.5, { mode: 'parasol', floor: PF, ceil: PC, h: 9 });
k.text(k.at(12) + 6, 10.4, 'Tap to hop', 0.8);
k.block(k.at(13), PF, 2, 2, { style: 'stone' });
k.block(k.at(13, 2), PF, 2, 3, { style: 'stone' });
k.block(k.at(14), PF, 2, 2, { style: 'stone' });
k.block(k.at(14), 8.5, 2, PC - 8.5, { style: 'wall' });
k.lantern(k.at(14, 2.5), PC, 4, { period: 4 });
column(k.at(15), 4.5, 15, 0, 2, 2);
k.block(k.at(15, 2), 8, 2, PC - 8, { style: 'wall' });
// Stairs on the kick: a hop for each.
k.block(k.at(16), PF, 2, 1.5, { style: 'stone' });
k.block(k.at(16, 1), PF, 2, 2.8, { style: 'stone' });
k.block(k.at(16, 2), PF, 2, 4.1, { style: 'stone' });
k.block(k.at(17), 6.5, 2, PC - 6.5, { style: 'wall' });
k.crow(k.at(17, 2.5), 6.5, k.move(0, 2, 4));
// A shelf of beams: the scroll rides above it, for a higher route.
k.block(k.at(18), 7.6, 10, 0.6, { style: 'beam' });
k.scroll(k.at(18) + 6, 9.6, 1);
column(k.at(18, 3), 3.5, 18, 3);
k.block(k.at(19), 8, 2, PC - 8, { style: 'wall' });

// ── c: fast, vents, gaps and lanterns ───────────────────────────────────────
k.gate(k.at(20), 7.5, { mode: 'run', floor: null, ceil: null, h: 9 });
const dive = gapAt(21, 3, 4.5);
const pit = [k.at(24) + 2, k.at(24) + 7.2] as [number, number];
street(
  k.at(21),
  k.at(28) + 2,
  [dive, gapAt(23, 3, 4.5), pit, gapAt(26, 2, 4.5)],
  ['tiles', 'flat', 'tiles', 'pagoda', 'flat']
);
puff(20, 1);
sweep(21, 1);
// A gap with a lower roof in it: jump it, or drop in for the scroll, and a
// drum throws him back up.
k.roof(dive[0], dive[1] - dive[0], 1.2, 'warehouse');
k.scroll(dive[0] + 2.1, 2.1, 0);
k.pad(dive[0] + 3.1, 1.2, 'yellow');
k.jumpSpikes(k.at(22, 1), 3, 3);
sweep(22, 3);
puff(23, 0, 1);
puff(23, 1, 1);
// The crash on bar 25: a drum throws him over a long pit.
k.pad(k.at(24) + 0.3, 3, 'yellow');
k.jumpSpikes(k.at(24, 2), 3, 2);
puff(25, 0, 1.2, 2);
sweep(25, 2);
k.jumpSpikes(k.at(26), 3, 3);
puff(27, 0, 1);
puff(27, 1, 1);
// The breath before the storm breaks: a red drum on beat 4 throws him up,
// and the parasol opens on the drop.
k.pad(k.at(27, 3) + 0.3, 3, 'red');

// ── d: the storm breaks: Parasol and Kite at speed ──────────────────────────
// Steam erupts on every thunder (bars 29, 33, 37), ahead of him; by the time
// he gets there it has died down.
for (const bar of [28, 32, 36]) {
  column(k.at(bar, 1.5), 6.5, bar, 0, 16, 2);
  column(k.at(bar, 1.5) + 4, 5, bar, 0, 16, 2);
}
k.gate(k.at(28), 7.5, { mode: 'parasol', floor: PF, ceil: PC, h: 9 });
k.block(k.at(28, 2.5), PF, 2, 3.5, { style: 'stone' });
k.block(k.at(28, 3.5), 8.5, 2, PC - 8.5, { style: 'wall' });
column(k.at(29), 3.5, 29, 0, 2, 2);
k.block(k.at(29, 2), 8.5, 2, PC - 8.5, { style: 'wall' });
k.block(k.at(30), PF, 2, 2.5, { style: 'stone' });
k.block(k.at(30), 9, 2, PC - 9, { style: 'wall' });
k.lantern(k.at(30, 2.5), PC, 5, { period: 4, phase: 0.25 });
column(k.at(31), 4.5, 31, 0, 2, 2);
k.block(k.at(31, 2), 8.5, 2, PC - 8.5, { style: 'wall' });
k.gate(k.at(32), 7.5, { mode: 'kite', floor: PF, ceil: PC, h: 9 });
k.block(k.at(32, 2.5), PF, 2, 4, { style: 'chimney' });
k.block(k.at(33), 8, 2, PC - 8, { style: 'wall' });
k.saw(k.at(33, 2.5), 6.5, 1.1);
k.block(k.at(34), PF, 2, 4.5, { style: 'chimney' });
k.crow(k.at(34, 2.5), 9, k.move(0, 1.5, 4));
// Dive to the floor between the eave and the chimney for the scroll, then
// climb hard.
k.block(k.at(35), 7.5, 2, PC - 7.5, { style: 'wall' });
k.scroll(k.at(35) + 4.5, 3.9, 2);
k.block(k.at(35, 2), PF, 2, 3.5, { style: 'chimney' });
k.gate(k.at(36), 7.5, { mode: 'parasol', floor: PF, ceil: PC, h: 9 });
k.block(k.at(36, 2.5), PF, 2, 3.5, { style: 'stone' });
column(k.at(37), 4, 37, 0, 2, 2);
k.block(k.at(37, 2), 8.5, 2, PC - 8.5, { style: 'wall' });
k.gate(k.at(38), 7.5, { mode: 'kite', floor: PF, ceil: PC, h: 9 });
k.block(k.at(38, 2), PF, 2, 4.5, { style: 'chimney' });
k.block(k.at(39), 7.5, 2, PC - 7.5, { style: 'wall' });
k.saw(k.at(39, 2.5), 8.5, 1);

// ── Outro: the rain eases, and dawn comes ───────────────────────────────────
k.gate(k.at(40), 7.5, { mode: 'run', floor: null, ceil: null, h: 9 });
k.theme(k.at(40), 'dawn', 40);
street(k.at(28) + 2, k.at(44) + 36, [gapAt(42, 0, 3)], ['tiles', 'shrine']);
k.jumpSpikes(k.at(41), 3);
k.deco(k.at(41, 2.5), 3, 'banner');
k.deco(k.at(42) + 6, 3, 'torii');
k.deco(k.at(42, 2), 3, 'sakura');
k.jumpSpikes(k.at(43), 3);
k.deco(k.at(43, 2), 3, 'laundry', { s: 5 });
k.deco(k.at(43, 3), 7.5, 'crane');
k.end(k.at(44));
// Past the finish he runs on into the morning while the fireworks go up.
k.deco(k.at(44) + 3, 3, 'cat');
k.deco(k.at(44) + 9, 3, 'stone-lantern');
k.deco(k.at(44) + 14, 3, 'sakura');
k.deco(k.at(44) + 19, 9.6, 'lanterns', { s: 7 });
k.deco(k.at(44) + 28, 3, 'bonsai');
k.deco(k.at(44) + 33, 3, 'stone-lantern');
export default k.build();
