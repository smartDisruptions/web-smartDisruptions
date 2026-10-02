import type { OrbColor } from '../types';
import { G, JUMP_V, kit } from './kit';

/**
 * Lantern Row: normal, 124 bpm, 36 bars, 69.7 s. Festival night on the
 * rooftops: the spirit lanterns. Taps land on beats and eighths. Bars count
 * from 0 as at() does; beats are counted 1 to 4, as the music counts them.
 *
 *   intro  0-3   The festival street. Tap on a lantern in mid-air: the first
 *                one floats harmlessly over a caltrop on bar 2.
 *   a      4-11  Yellow lanterns over gaps and a caltrop pit, two in a row
 *                climbing, and a gap with a red lantern deep down (scroll 0).
 *   b     12-19  Kite under the moon, past crows and a swinging lantern
 *                (scroll 1 up under the eaves).
 *   c     20-27  Pink under hanging caltrops, red up a tall house, a drum
 *                into a lantern over a gap, a ladder of lanterns up a tower.
 *   d     28-33  Wind chevrons: fast. Triples, a lantern gap, a dip with a
 *                red drum in it (scroll 2), a drum into two lanterns up onto
 *                the festival hall.
 *   outro 34-35  Off the hall and home under the lanterns.
 */
const k = kit('lantern-row');
const at = k.at;
const SPB = 60 / k.meta.bpm;

/** Launch speeds: a yellow drum throws him 4.5 high, a red one 6.5. */
const YELLOW_DRUM = Math.sqrt(2 * G * 4.5);
const RED_DRUM = Math.sqrt(2 * G * 6.5);
/** Kiru's centre height t seconds after a launch of speed v from a surface at `top`. */
const arc = (top: number, v: number, t: number) =>
  top + 0.7 + v * t - (G * t * t) / 2;
/** An eighth note, seconds. */
const T8 = SPB / 2;
/** A lantern kick's rise over one eighth: where the next eighth's lantern goes. */
const RISE8 = JUMP_V * T8 - (G * T8 * T8) / 2;
/** A lantern on the eighth after a jump pressed at at(bar, beat) from `top`. */
function onTheAnd(
  bar: number,
  beat: number,
  top: number,
  c: OrbColor = 'yellow'
) {
  const y = arc(top, JUMP_V, T8);
  k.orb(at(bar, beat + 0.5), y, c);
  return y;
}
/** Where a jump from `top` pressed at at(bar, beat) is, t seconds later. */
const jumpAt = (bar: number, beat: number, top: number, t: number) => ({
  x: at(bar, beat) + k.vAt(at(bar, beat)) * t,
  y: arc(top, JUMP_V, t),
});

// ── Intro: the festival street ───────────────────────────────────────────
k.theme(-20, 'lanterns');
const e0 = at(4) + 0.4; // the street's end: the first lantern gap
k.roof(-16, e0 + 16, 3, 'tiles');
k.jumpSpikes(at(1), 3);
// The first lantern, harmless: over a single caltrop on bar 2, with the
// sign right above it.
k.jumpSpikes(at(2), 3);
onTheAnd(2, 0, 3);
k.text(at(2, 0.5), 8.9, 'Tap on a lantern', 0.8);
k.text(at(2, 0.5), 8, 'in mid-air', 0.8);
k.deco(-9, 3, 'banner');
k.deco(-4, 3, 'stone-lantern');
k.deco(5, 3, 'neon', { s: 2.2 });
k.deco(10, 3, 'cat');
k.deco(30, 3, 'banner', { s: 3 });
k.deco(36, 3, 'torii');
k.deco(52, 3, 'sakura');
k.deco(58, 3, 'stone-lantern');
k.deco(70, 3, 'banner', { s: 3.4 });
k.deco(75, 3, 'neon', { s: 2.6 });
k.deco(-12, 9.4, 'lanterns', { s: 11 });
k.deco(14, 9.8, 'lanterns', { s: 13 });
k.deco(50, 9.8, 'lanterns', { s: 10 });
k.deco(66, 9.9, 'lanterns', { s: 12 });

// ── a: lanterns over gaps and caltrop pits ───────────────────────────────
// Bar 4: jump at the edge, tap on the and, land across.
onTheAnd(4, 0, 3);
const r1 = at(4) + 6.3;
const e1 = at(6, 2) + 0.4;
k.roof(r1, e1 - r1, 3, 'flat');
k.jumpSpikes(at(5), 3);
// A pit of four caltrops: too long to jump, so the lantern carries him over.
k.spike(at(5, 2) + 1.6, 3, 4);
onTheAnd(5, 2, 3);
// Bar 6, beat 3: another lantern gap.
onTheAnd(6, 2, 3);
const r2 = at(6, 2) + 6.3;
const e2 = at(8) + 0.4;
k.roof(r2, e2 - r2, 3, 'tiles');
k.jumpSpikes(at(7), 3, 2);
// Bar 8: a long gap. Two lanterns on the eighths, each one higher.
const y8 = onTheAnd(8, 0, 3);
k.orb(at(8, 1), y8 + RISE8, 'yellow');
const r3 = at(8, 1) + 4;
const e3 = at(10) + 0.4;
k.roof(r3, e3 - r3, 3, 'flat');
k.jumpSpikes(at(9, 2), 3);
// Bar 10: a gap with the usual lantern on the and. Skip it and fall: scroll
// 0 floats down in the gap, and a red lantern deep below throws you out.
onTheAnd(10, 0, 3);
const r4 = at(10) + 6.3;
const deep = jumpAt(10, 0, 3, 0.43);
k.orb(deep.x, deep.y, 'red');
const s0 = jumpAt(10, 0, 3, 0.39);
k.scroll(s0.x, s0.y, 0);
// The fill: one jump on beat 4, landing just before the gate.
k.jumpSpikes(at(11, 3), 3);
k.deco(r1 + 8, 3, 'cat');
k.deco(at(5, 2) + 8, 3, 'laundry', { s: 3.5 });
k.deco(r2 + 13, 3, 'banner', { s: 3 });
k.deco(r2 + 18, 3, 'stone-lantern');
k.deco(r3 + 6, 3, 'neon', { s: 2.4 });
k.deco(r3 + 12, 3, 'bonsai');
k.deco(r4 + 4.4, 3, 'banner', { s: 2.8 });
k.deco(r4 + 8.4, 3, 'cat', { flip: true });
k.deco(r4 + 22.4, 3, 'stone-lantern');
k.deco(e0 - 3, 10, 'lanterns', { s: 11 });
k.deco(e1 - 2, 10, 'lanterns', { s: 10 });

// ── b: the kite under the moon ───────────────────────────────────────────
const fly0 = at(12);
const fly1 = at(20);
k.roof(r4, at(13) - r4, 3, 'tiles');
k.fly(fly0, fly1, { mode: 'kite', floor: 3, ceil: 11 });
k.deco(fly0 + 2, 11, 'lanterns', { s: 10 });
// Bar 13: over a pagoda, under a crow.
k.roof(at(13), 4, 6, 'pagoda');
k.roof(at(13) + 4, at(15) - at(13) - 4, 3, 'tiles');
k.crow(at(13) + 2, 9.6, k.move(0, 0.4, 4));
// Bar 14: a lantern swings from the eaves.
k.lantern(at(14) + 3, 11, 3, { swing: 0.5, period: 4 });
k.theme(at(14), 'moon', 16);
// Bar 15: a crow low, a crow high: slalom.
k.crow(at(15), 5, k.move(0, 0.5, 4));
k.crow(at(15, 2), 8.8, k.move(0, 0.5, 4, 0.5));
// Bar 16: the window between a beam and a warehouse.
k.roof(at(15), at(16) - at(15), 3, 'flat');
k.roof(at(16), 5, 5, 'warehouse');
k.block(at(16), 8, 5, 3, { style: 'beam' });
// Bar 17: over a tall pagoda; scroll 1 hides up under the eaves after it,
// before the beam that sends everyone down.
const p17 = at(17);
k.roof(at(16) + 5, p17 - at(16) - 5, 3, 'tiles');
k.roof(p17, 4, 7.5, 'pagoda');
k.scroll(p17 + 8, 10.2, 1);
k.block(p17 + 14, 7.6, 6, 3.4, { style: 'beam' });
k.roof(p17 + 4, fly1 + 8 - p17 - 4, 3, 'flat');
// Bar 18: crows bob on the beat.
k.crow(at(18, 2), 5.5, k.move(0, 1, 2));
k.crow(at(18, 3) + 2, 8.5, k.move(0, 1, 2, 0.5));
k.theme(at(18, 2), 'lanterns', 16);
k.deco(at(13) + 7, 11, 'lanterns', { s: 7 });
k.deco(at(15) + 9, 11, 'lanterns', { s: 7 });
k.deco(at(19) + 4, 11, 'lanterns', { s: 6 });
k.deco(at(13) + 2, 6, 'cat');

// ── c: pink, red, drums into lanterns ────────────────────────────────────
// Bar 20, beat 3: hanging caltrops overhead, so a full jump would meet
// them. The pink lantern is a small hop over the small caltrop.
const r5 = fly1 + 8;
const beam = at(20, 2) - 2;
const tall = at(21) + 5;
k.roof(r5, tall - r5, 3, 'tiles');
k.block(beam, 6.4, 8, 1, { style: 'beam' });
k.spike(beam + 1, 6.4, 6, { dir: 'down' });
k.orb(at(20, 2), 3.7, 'pink');
const pinkTop = (k.vAt(at(20, 2)) * 0.7 * JUMP_V) / G; // the hop's top
k.spike(at(20, 2) + pinkTop - 0.5, 3, 1, { small: true });
// Bar 21: the red lantern, up onto a tall house.
onTheAnd(21, 0, 3, 'red');
const tallEnd = at(22, 2);
k.roof(tall, tallEnd - tall, 7.5, 'shrine');
k.jumpSpikes(at(21, 2), 7.5);
k.jumpSpikes(at(22), 7.5, 2);
// Down off the house (a drop), then a drum on bar 23 into a lantern on the
// and, over a gap the drum alone falls short of.
const drum23 = at(23) + 0.3;
k.roof(tallEnd, drum23 + 1.2 - tallEnd, 3, 'flat');
k.pad(drum23, 3, 'yellow');
k.orb(at(23, 0.5), arc(3, YELLOW_DRUM, T8), 'yellow');
// Bar 24, the crash: a ladder of lanterns up the face of a tower, one on
// each eighth.
const r6 = drum23 + 7;
const l1 = onTheAnd(24, 0, 3);
k.orb(at(24, 1), l1 + RISE8, 'yellow');
k.orb(at(24, 1.5), l1 + 2 * RISE8, 'yellow');
const tower = at(24, 1.5) + 2;
const towerEnd = at(25, 2) + 0.4;
k.roof(r6, tower - r6, 3, 'tiles');
k.roof(tower, towerEnd - tower, 10, 'pagoda');
k.jumpSpikes(at(25), 10, 2);
// Off the tower (a long drop), and home through the end of the section.
k.roof(towerEnd, at(28) + 4 - towerEnd, 3, 'tiles');
k.jumpSpikes(at(26), 3, 2);
k.jumpSpikes(at(26, 2), 3);
// The fill: one jump on beat 4, landing as the wind picks up.
k.jumpSpikes(at(27, 3), 3);
k.deco(tall + 0.8, 7.5, 'banner', { s: 2.4 });
k.deco(tallEnd - 2.4, 7.5, 'cat');
k.deco(tallEnd + 4, 3, 'neon', { s: 2.2 });
k.deco(r6 + 3.7, 3, 'stone-lantern');
k.deco(tower + 4.5, 10, 'banner', { s: 3 });
k.deco(towerEnd - 3.7, 10, 'cat', { flip: true });
k.deco(towerEnd + 1.3, 10.5, 'lanterns', { s: 10 });
k.deco(at(26, 2) + 5, 3, 'banner', { s: 3 });
k.deco(at(27) + 8.5, 3, 'sakura');

// ── d: fast ──────────────────────────────────────────────────────────────
k.speed(at(28), 6, 'fast', 8);
const r7 = at(28) + 4;
const e7 = at(29) + 0.4;
k.roof(r7, e7 - r7, 3, 'flat');
k.jumpSpikes(at(28, 2), 3, 3);
// Bar 29: a lantern gap at speed.
onTheAnd(29, 0, 3);
const r8 = at(29) + 7.4;
const e8 = at(31) + 0.6;
k.roof(r8, e8 - r8, 3, 'tiles');
k.jumpSpikes(at(29, 2), 3, 2);
k.jumpSpikes(at(30), 3, 3);
k.jumpSpikes(at(30, 2), 3, 2);
// Bar 31: jump the dip. Drop into it instead and the red drum at its
// bottom throws you up past scroll 2.
const dip = 3.6;
k.roof(e8, dip, 2, 'shrine');
const red = e8 + 1.9;
k.pad(red, 2, 'red');
const rt = RED_DRUM / G; // seconds to the top of the red drum's arc
k.scroll(red - 0.3 + k.vAt(red) * rt, arc(2, RED_DRUM, rt) + 0.2, 2);
// Bar 32, the crash: a drum on the downbeat, then two lanterns on the
// eighths, up onto the roof of the festival hall.
const r9 = e8 + dip;
const drum32 = at(32) + 0.3;
k.roof(r9, drum32 + 1.2 - r9, 3, 'flat');
k.pad(drum32, 3, 'yellow');
const d1 = arc(3, YELLOW_DRUM, T8);
k.orb(at(32, 0.5), d1, 'yellow');
// The second sits at the top of the first one's arc, about beat 2, where
// every timing of the first passes slowly.
const l2x = at(32, 0.5) + (k.vAt(at(32)) * JUMP_V) / G;
k.orb(l2x, d1 + 2, 'yellow');
const hall = l2x + 2.5;
const hallEnd = at(34) + 0.4;
k.roof(drum32 + 1.2, hall - drum32 - 1.2, 3, 'tiles');
k.roof(hall, hallEnd - hall, 9.5, 'pagoda');
k.jumpSpikes(at(32, 3), 9.5, 3);
// The fill: one jump on beat 4, then off the hall on the downbeat of 34.
k.jumpSpikes(at(33, 3), 9.5);
k.deco(r7 - 0.6, 3, 'banner', { s: 3.4 });
k.deco(e7 - 3, 3, 'neon', { s: 2.4 });
k.deco(at(29, 2) + 7, 3, 'stone-lantern');
k.deco(at(30, 1), 3, 'cat');
k.deco(e8 - 4, 3, 'banner', { s: 3 });
k.deco(r9 + 9, 3, 'neon', { s: 2.4 });
k.deco(r9 + 14, 3, 'bonsai');
k.deco(hall + 5.5, 9.5, 'banner', { s: 3 });
k.deco(hall + 12.5, 9.5, 'cat');
k.deco(at(33, 1), 9.5, 'banner', { s: 3 });

// ── outro: home under the lanterns ───────────────────────────────────────
k.roof(hallEnd, at(36) + 30 - hallEnd, 3, 'tiles');
k.jumpSpikes(at(35, 2), 3);
k.end(at(36));
const end = at(36);
k.deco(hallEnd + 4, 10.5, 'lanterns', { s: 12 });
k.deco(end - 32, 9.8, 'lanterns', { s: 12 });
k.deco(end - 6, 10, 'lanterns', { s: 16 });
k.deco(end + 12, 9.6, 'lanterns', { s: 14 });
k.deco(end - 41, 3, 'banner', { s: 3.2 });
k.deco(end - 36, 3, 'stone-lantern');
k.deco(end - 28, 3, 'cat');
k.deco(end - 21, 3, 'sakura');
k.deco(end - 16, 3, 'banner', { s: 3.2 });
k.deco(end + 5, 3, 'stone-lantern');
k.deco(end + 9, 3, 'banner', { s: 3.4 });
k.deco(end + 14, 3, 'cat', { flip: true });
k.deco(end + 18, 3, 'neon', { s: 2.6 });
k.deco(end + 24, 3, 'torii');

export default k.build();
