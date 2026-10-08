import { G, JUMP_V, kit } from './kit';

/**
 * Shadow Dojo (level 6, Demon). 160 bpm, drum and bass: the kick lands on
 * beat 1 and the and of 3, the snare on 2 and 4, so most presses sit on
 * beats 0, 1, 2.5 and 3 of the bar. A beat is 4.84 blocks at fast, 5.85 at
 * faster, 7.2 at fastest and 3.9 at normal. Every section starts on a gate.
 *
 *   intro  0-4    Fast from the first beat: doubles and triples on the hits
 *   a      4-12   Everything so far: quads, a lantern chain, a blue drum to
 *                 the eaves, fire on the snare
 *   b      12-20  Kite through shuriken gates, under the moon
 *   c      20-28  Dragon, faster: a zigzag, a tunnel on the eighths, a fence
 *   d      28-36  Shadow Step and Roll, back in the dojo
 *   e      36-44  Parasol through the blades, in the storm
 *   f      44-52  Everything at the fastest speed, and one last dragon
 *   outro  52-56  Bow out
 *
 * Scrolls: 0 above the pink lantern at the top of the jump in bar 7; 1
 * between the two great shuriken in bar 16; 2 high over the last dragon's
 * beam in bar 50.
 */
const k = kit('shadow-dojo');
const { at } = k;

k.speed(at(12), 8, 'faster', 10);
k.speed(at(28), 7, 'fast', 8.4);
k.speed(at(36), 6, 'faster', 10);
k.speed(at(44), 7.5, 'fastest', 9.6);
k.speed(at(52), 4.5, 'normal', 5);

// ── Shapes ──
/** A stone pillar standing on the floor, its top at `top`. */
const stone = (x: number, top: number, spike = false, w = 1, base = 3) => {
  k.block(x - w / 2, base, w, top - base, { style: 'stone' });
  if (spike) k.spike(x - 0.5, top, 1);
};
/** A beam hanging from the ceiling, its bottom at `bottom`. */
const hang = (
  x: number,
  bottom: number,
  ceil: number,
  spike = false,
  w = 1
) => {
  k.block(x - w / 2, bottom, w, ceil - bottom, { style: 'beam' });
  if (spike) k.spike(x - 0.5, bottom, 1, { dir: 'down' });
};
/** A blade gate: a post from the floor and one from the ceiling, a shuriken on each tip. */
const blades = (
  x: number,
  gap: number,
  d: number,
  floor: number,
  ceil: number,
  r = 1
) => {
  const lo = gap - d / 2;
  const hi = gap + d / 2;
  k.block(x - 0.3, floor, 0.6, lo - floor, { style: 'wall' });
  k.saw(x, lo, r);
  k.block(x - 0.3, hi, 0.6, ceil - hi, { style: 'beam' });
  k.saw(x, hi, r);
};
/**
 * A caltrop row between two Shadow Step taps (Kiru's x at each), centred so
 * both windows come out the same. Up: on a surface at y. Down: under one.
 */
const bed = (xa: number, xb: number, y: number, up: boolean) => {
  const n = Math.max(1, Math.floor(xb - xa - 1 + 1e-6));
  const x0 = (xa + xb) / 2 - n / 2 + 0.09;
  k.spike(x0, y, n, up ? {} : { dir: 'down' });
};
/** Beds for a run of Shadow Step taps that starts on the floor. */
const shadowRun = (taps: number[], floor: number, eave: number) => {
  for (let i = 0; i + 1 < taps.length; i++)
    bed(taps[i], taps[i + 1], i % 2 === 0 ? floor : eave, i % 2 === 0);
};
/**
 * Roll rows for taps that start on the floor: the row he leaves starts just
 * after each tap and ends where his next landing allows. A lead row on the
 * eave keeps the first tap from coming early.
 */
const rollRun = (taps: number[], floor: number, eave: number, w = 0.34) => {
  // How far he travels before he is level with the far row: the flip's push
  // plus gravity over the corridor, less the caltrops' height.
  const d = eave - floor - 1.38;
  const push = 0.35 * JUMP_V;
  const t = (-push + Math.sqrt(push * push + 2 * G * d)) / G;
  const land = k.vAt(taps[0]) * t + 0.03;
  const lead0 = taps[0] - 2.4;
  const lead1 = taps[0] - w + land;
  k.spike(lead0, eave, Math.floor(lead1 - lead0), { dir: 'down' });
  for (let i = 0; i < taps.length; i++) {
    const x0 = taps[i] + w + 0.69;
    const x1 = i + 1 < taps.length ? taps[i + 1] - w + land : x0 + 4;
    const n = Math.max(1, Math.floor(x1 - x0 + 1e-6));
    const xs = (x0 + x1) / 2 - n / 2;
    if (i % 2 === 0) k.spike(xs, floor, n);
    else k.spike(xs, eave, n, { dir: 'down' });
  }
};

// ── Intro (bars 0-4): fast from the first beat ──
k.theme(-20, 'dojo');
k.roof(-16, 54.82, 3, 'shrine');
k.deco(-9, 3, 'stone-lantern');
k.deco(-4.5, 3, 'bonsai');
k.deco(-1.5, 3, 'banner');
k.deco(7.5, 3, 'banner', { flip: true });
k.deco(17.6, 3, 'stone-lantern');
k.deco(26.5, 3, 'bonsai');
k.deco(2, 10.2, 'lanterns', { s: 10 });
k.jumpSpikes(at(0, 2.5), 3, 2);
k.jumpSpikes(at(1), 3, 3);
k.jumpSpikes(at(1, 2.5), 3, 3);
// Up a wide gap on the downbeat of bar 2, a triple on the kick.
k.roof(at(2) + 4.62, 14.92, 4, 'warehouse');
k.jumpSpikes(at(2, 2.5), 4, 3);
// Bar 3 is the fill: a gap on the downbeat, a caltrop on beat 4 whose
// jump lands on the crash of bar 4.
k.roof(at(3) + 5.19, at(5, 3.5) + 0.4 - (at(3) + 5.19), 4, 'shrine');
k.jumpSpikes(at(3, 3), 4, 2);

// ── a (bars 4-12): everything the first five levels taught ──
{
  const t = at;
  // Bars 4-5: caltrops on the kick and snare.
  k.jumpSpikes(t(4, 1), 4, 4);
  k.jumpSpikes(t(4, 2.5), 4, 3);
  k.jumpSpikes(t(5, 0), 4, 4);
  k.jumpSpikes(t(5, 1.5), 4, 3);
  k.deco(t(4) + 1.5, 4, 'banner');
  k.deco(t(4, 2) - 1.5, 10.5, 'lanterns', { s: 8 });
  k.deco(t(5, 2.5) + 1.5, 4, 'stone-lantern');
  // Jump off the edge on the and of 4: a climbing chain of spirit
  // lanterns, one on every beat of bar 6.
  k.orbChain(t(6), 6.9, 3, { dy: 0.62 });
  // A high roof; the caltrop on the downbeat of bar 7 has a pink lantern
  // at the top of its jump: tap it for the scroll.
  const r3 = t(6, 3) - 0.5;
  k.roof(r3, t(7, 3) + 0.4 - r3, 6.5, 'pagoda');
  k.jumpSpikes(t(7), 6.5, 3);
  k.deco(t(7, 2.4), 6.5, 'cat');
  k.orb(t(7) + 2.62, 9.4, 'hop');
  k.scroll(t(7) + 5.2, 11.3, 0);
  // Bar 8 (a crash): drop to the blue drum, up to the eaves; a jump
  // upside down; a green lantern home.
  k.roof(t(7, 3) + 0.4, 46, 3, 'tiles');
  k.pad(t(8) + 0.3, 3, 'flip');
  k.block(t(8) - 1, 8.5, t(9) - t(8) + 2, 1, { style: 'tiles' });
  k.spike(t(8, 2) + 2.62 - 1.5, 8.5, 3, { dir: 'down' });
  k.orb(t(9) + 0.8, 7.8, 'spin');
  // The street under the eaves is a caltrop bed: the drum is the way.
  k.spike(t(8) + 2.2, 3, 10);
  k.spike(t(8) + 13.2, 3, 9);
  // Bars 9-10: fire on the snare; jump it on the kick.
  for (const b of [t(9, 3), t(10, 1), t(10, 3)])
    k.vent(b + 0.3, 3, 1.8, 1, 1, { phase: 1, style: 'fire' });
  // Bar 11 is the fill: a triple, then a jump on beat 4 into the kite.
  k.jumpSpikes(t(11, 0), 3, 4);
  k.jumpSpikes(t(11, 3), 3, 2);
}

// ── b (bars 12-20): Kite through the shuriken, faster ──
k.theme(at(12) - 4, 'moon', 12);
{
  const F = 3;
  const C = 13;
  k.gate(at(12), 8, { mode: 'kite', floor: F, ceil: C, h: 10 });
  k.roof(at(7, 3) + 46.4, at(20) - at(7, 3) - 40, 3, 'shrine');
  // Half notes, big swings.
  for (const b of [12.75, 13.75, 17.75, 18.75])
    k.deco(at(0, b * 4), 12.6, 'crane');
  blades(at(12, 2), 6.5, 3.4, F, C);
  blades(at(13, 0), 10, 3.4, F, C);
  blades(at(13, 2), 5.5, 3.4, F, C);
  blades(at(14, 0), 9.5, 3.4, F, C);
  // Quarter notes up a staircase of blades.
  const steps = [6.7, 7.4, 8.1, 8.8, 9.5, 8.8, 8.1, 7.4];
  steps.forEach((g, i) => blades(at(14, 1 + i), g, 3.2, F, C));
  // Bar 16 (a crash): two great shuriken on the beat.
  k.saw(at(16, 1), 8, 1.6, k.move(0, 2.6, 4));
  k.saw(at(16, 3), 8, 1.6, k.move(0, 2.6, 4, 0.5));
  k.scroll(at(16, 2), 8, 1);
  // Half notes again, tighter.
  blades(at(17, 2), 9.5, 3.2, F, C);
  blades(at(18, 0), 5.5, 3.2, F, C);
  blades(at(18, 2), 10, 3.2, F, C);
  blades(at(19, 0), 6, 3.2, F, C);
  // The breath on 19:4: the last gate low, then the drop.
  blades(at(19, 3), 6.5, 3.4, F, C);
}

// ── c (bars 20-28): Dragon, faster ──
k.theme(at(23, 2), 'storm', 16);
{
  const CC = 11;
  k.gate(at(20), 8, { mode: 'dragon', floor: 3, ceil: CC, h: 10 });
  k.roof(at(20) - 2, at(28) - at(20) + 6, 3, 'shrine');
  for (let i = 0; i < 6; i++) {
    const x = at(20, 1 + i);
    if (i % 2 === 0) hang(x, 5.6, CC, true);
    else stone(x, 7.4, true);
  }
  const x0 = at(21, 3) + 1;
  const x1 = at(24, 1) - 2;
  const cw = at(21, 2) + 0.8;
  k.block(cw, 3, x1 - cw, 2.6, { style: 'stone' });
  k.block(x0 + 2.5, 7.3, x1 - x0 - 2.5, CC - 7.3, { style: 'wall' });
  let low = true;
  let from = x0 + 3;
  for (let b = 22 * 4 + 0.5; b < 23 * 4 + 3; b += 0.5) {
    const s = k.beatX(b);
    const end = s + 0.6;
    const n = Math.max(1, Math.floor(end - from + 1e-6));
    if (low) k.spike(end - n, 7.3, n, { dir: 'down' });
    else k.spike(end - n, 5.6, n);
    low = !low;
    from = end + 0.6;
  }
  // Bar 24 (a crash): a picket fence on the eighths.
  for (let i = 0; i < 13; i++) {
    const x = at(24, 1 + i * 0.5);
    const ov = i < 2 ? 0.1 : 0.4;
    if (i % 2 === 1) stone(x, 6.6 + ov / 2, false, 0.5);
    else hang(x, 6.6 - ov / 2, CC, false, 0.5);
  }
  stone(at(26, 1), 7.2, true);
  hang(at(26, 2), 6.0, CC, true);
  stone(at(26, 3), 6.6, true);
  hang(at(27, 0), 5.4, CC, true);
  stone(at(27, 1), 5.6, true);
  // The drums drop on 27:3: glide down under the eaves to the street.
  k.block(at(27, 2) - 0.5, 4.8, at(28) + 1.5 - (at(27, 2) - 0.5), CC - 4.8, {
    style: 'wall',
  });
}

// ── d (bars 28-36): Shadow Step and Roll, back in the dojo ──
k.theme(at(28) - 4, 'dojo', 10);
{
  const t = at;
  k.gate(at(28), 7, { mode: 'shadow', floor: null, ceil: null, h: 8.4 });
  // Bars 28-29, Shadow: on the kick and snare; over a pit to a lower roof.
  const E1 = 7.5;
  const s1 = [t(28, 1), t(28, 2.5), t(28, 3)];
  const s2 = [t(29, 1), t(29, 2.5), t(29, 3)];
  k.roof(at(28) + 4, s1[2] + 2.69 - (at(28) + 4), 3, 'shrine');
  k.block(s1[0] - 0.5, E1, t(30) - 1 - (s1[0] - 0.5), 1, { style: 'tiles' });
  shadowRun(s1, 3, E1);
  k.spike(s1[2] + 0.69, 3, 2);
  const r2 = s2[0] - 0.5;
  bed(s2[0], s2[1], E1, false);
  bed(s2[1], s2[2], 2, true);
  k.spike(s2[2] + 0.69, E1, 3, { dir: 'down' });
  // Bars 30-31, Roll between the low roof and a lower eave.
  const E2 = 6.5;
  k.roof(r2, t(32, 2) + 2.69 - r2, 2, 'tiles');
  k.gate(at(30), 4.25, { mode: 'roll', h: 4.5 });
  k.block(t(30) - 1, E2, t(32) - t(30) + 1, 1, { style: 'tiles' });
  rollRun(
    [t(30, 1), t(30, 2.5), t(30, 3), t(31, 0), t(31, 1), t(31, 2.5)],
    2,
    E2
  );
  // Bars 32-33 (a crash), Shadow: an eighth-note flick, over a pit, down
  // onto the warehouse one higher.
  k.gate(at(32), 4.25, { mode: 'shadow', h: 4.5 });
  const E3 = 7;
  const s3 = [t(32, 1), t(32, 2), t(32, 2.5)];
  const s4 = [t(33, 0), t(33, 1), t(33, 2.5)];
  k.block(t(32), E3, t(35, 1.5) - t(32), 1, { style: 'tiles' });
  k.spike(s3[0] - 2.5, E3, 2, { dir: 'down' });
  shadowRun(s3, 2, E3);
  k.spike(s3[2] + 0.69, 2, 2);
  bed(s4[0], s4[1], E3, false);
  bed(s4[1], s4[2], 3, true);
  k.spike(s4[2] + 0.69, E3, 3, { dir: 'down' });
  // Bars 34-35, Roll; the drum on 35:4 throws him into the parasol.
  k.roof(s4[0] - 0.5, t(36) + 4 - (s4[0] - 0.5), 3, 'warehouse');
  k.gate(at(34), 5, { mode: 'roll', h: 4 });
  rollRun([t(34, 1), t(34, 2.5), t(34, 3), t(35, 0)], 3, E3);
  k.pad(t(35, 3) + 0.3, 3, 'jump');
  k.deco(t(29, 1.5), 3, 'banner');
  k.deco(t(32, 0.5), 9.2, 'lanterns', { s: 8 });
}

// ── e (bars 36-44): Parasol through the blades, faster, in the storm ──
k.theme(at(36) - 4, 'storm', 10);
{
  const F = 3;
  const C = 12;
  const t = at;
  k.gate(at(36), 7.5, { mode: 'parasol', floor: F, ceil: C, h: 9 });
  k.roof(at(36) - 2, at(44) - at(36) + 6, 3, 'tiles');
  // Bars 36-37: blades on the half notes.
  blades(t(36, 2), 8.5, 3.6, F, C);
  blades(t(37, 0), 6.5, 3.6, F, C);
  blades(t(37, 2), 8.5, 3.6, F, C);
  // Bars 38-39: the gates ride up and down on the beat; each is high on the
  // downbeat and low on beat 3 as you reach it.
  for (const [bar, beat] of [
    [38, 0],
    [38, 2],
    [39, 0],
    [39, 2],
  ] as const) {
    const x = t(bar, beat);
    const m = k.move(0, 1.4, 4, 0.25);
    k.block(x - 0.3, F - 1.5, 0.6, 7.5 - 1.8 - F + 1.5, {
      style: 'wall',
      move: m,
    });
    k.saw(x, 7.5 - 1.8, 1, m);
    k.block(x - 0.3, 7.5 + 1.8, 0.6, C + 1.5 - 7.5 - 1.8, {
      style: 'beam',
      move: m,
    });
    k.saw(x, 7.5 + 1.8, 1, m);
  }
  // Bar 40 (a crash): climb a stair of blades, a tap on every beat.
  [5.6, 6.8, 8.0, 9.2].forEach((g, i) => blades(t(40, 1 + i), g, 3.6, F, C));
  blades(t(41, 2), 7.2, 3.6, F, C);
  // Bars 42-43: fire on the snare under hanging blades.
  for (const b of [t(42, 1), t(42, 3), t(43, 1)])
    k.vent(b - 0.5, F, 3.6, 1, 1, { phase: 1, style: 'fire' });
  for (const b of [t(42, 2), t(43, 0)]) {
    k.block(b - 0.3, 9.6, 0.6, C - 9.6, { style: 'beam' });
    k.saw(b, 9.6, 1);
  }
}

// ── f (bars 44-52): everything, at the fastest speed ──
k.theme(at(44) - 4, 'dojo', 10);
{
  const t = at;
  k.gate(at(44), 7.5, {
    mode: 'run',
    grav: 1,
    floor: null,
    ceil: null,
    h: 9.6,
  });
  // Bars 44-45 (a crash, the key lifts): six on the snare, a wide gap on
  // the kick, six on the downbeat, up two on the and of 2, six on 4.
  k.roof(at(44) - 2, t(44, 2.5) + 0.5 - (at(44) - 2), 3, 'shrine');
  k.jumpSpikes(t(44, 1), 3, 6);
  k.roof(t(44, 2.5) + 7.5, t(45, 1.5) + 0.83 - (t(44, 2.5) + 7.5), 3, 'tiles');
  k.jumpSpikes(t(45), 3, 6);
  const r5 = t(45, 1.5) + 4.83;
  k.roof(r5, t(46, 0.5) + 1.6 - r5, 5, 'warehouse');
  k.jumpSpikes(t(45, 3), 5, 6);
  // Bars 46-47: a climbing chain of spirit lanterns, a high roof, a black
  // lantern down under the eaves.
  k.pad(t(46, 0.5) + 0.3, 5, 'hop');
  k.orbChain(t(46, 1) + 1.1, 8.9, 3, { dy: 0.62 });
  const r8 = t(46, 3) + 5;
  k.roof(r8, t(47, 2) - 0.6 - r8, 8, 'pagoda');
  k.orb(t(47, 2) + 1.2, 8.6, 'slam');
  k.roof(t(47, 2) + 1.5, t(52) + 4 - (t(47, 2) + 1.5), 3, 'shrine');
  k.block(t(47, 2) + 5.6, 4.9, 8, 6.1, { style: 'wall' });
  k.spike(t(47, 2) + 5.6, 4.9, 8, { dir: 'down', small: true });
  // Bar 48 (a crash): the blue gate turns him up onto the eaves; two jumps
  // upside down; the yellow gate brings him home.
  const E = 9;
  k.gate(t(48), 5.5, { grav: -1, h: 6 });
  k.block(t(48) - 1, E, t(49, 1) + 4 - (t(48) - 1), 1, { style: 'tiles' });
  for (const b of [t(48, 1.5), t(48, 3)])
    k.spike(b + 3.9 - 2.5, E, 5, { dir: 'down' });
  k.gate(t(49, 1), 6, { grav: 1, h: 7 });
  k.jumpSpikes(t(49, 2.5), 3, 5);
  k.deco(t(49, 3.4), 3, 'banner');
  // Bar 50: the dragon, one last time, at the fastest speed.
  k.gate(t(50), 6.5, { mode: 'dragon', floor: 3, ceil: 10, h: 7 });
  stone(t(50, 1), 6.4, true);
  hang(t(50, 2), 6.6, 10, true);
  stone(t(50, 3), 6.4, true);
  k.scroll(t(50, 2) + 3.6, 9.3, 2);
  hang(t(51), 6.0, 10);
  k.gate(t(51, 1), 6.5, { mode: 'run', floor: null, ceil: null, h: 7 });
  // The drums drop on 51:3: run it out.
}

// ── Outro (bars 52-56): bow out ──
{
  const r = at(52) + 4;
  k.roof(r, at(56) + 34 - r, 3, 'shrine');
  k.jumpSpikes(at(53), 3);
  k.jumpSpikes(at(54), 3, 2);
  // The last jump lands a beat early: he runs over the line on the final hit.
  k.jumpSpikes(at(55, 2), 3);
  k.deco(at(52, 2), 3, 'stone-lantern');
  k.deco(at(53, 2), 3, 'banner');
  k.deco(at(54, 2), 3, 'torii');
  k.deco(at(54, 3), 10, 'lanterns', { s: 9 });
  k.deco(at(55, 0.5), 3, 'bonsai');
  k.deco(at(56) + 5, 3, 'stone-lantern');
  k.deco(at(56) + 9, 3, 'banner', { flip: true });
  k.deco(at(56) + 13, 9.4, 'crane');
  k.deco(at(56) + 17, 3, 'bonsai');
  k.deco(at(56) + 22, 3, 'cat');
  k.deco(at(56) + 27, 3, 'stone-lantern');
  k.end(at(56));
}

export default k.build();
