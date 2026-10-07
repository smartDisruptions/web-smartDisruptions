import { G, JUMP_V, kit } from './kit';

/**
 * Dragon Festival (level 5, Insane). 150 bpm: a beat is 4.16 blocks at
 * normal speed and 5.16 at fast. Every section starts on a gate, on the
 * downbeat where the song's crash lands.
 *
 *   intro  0-4    Run under the fireworks; leap off the pagoda into the gate
 *   a      4-12   Dragon: stones and hanging beams on the beat, a tunnel
 *   b      12-20  Shadow Step between roofs and eaves over caltrop beds
 *   c      20-28  Fast: drums and spirit lanterns; a red drum in the breath
 *   d      28-36  Dragon, fast: dive, a tunnel on eighths, a picket fence
 *   e      36-44  Shadow Step and Roll, trading every two bars
 *   outro  44-48  The parade passes; he runs over the line on the final hit
 *
 * Scrolls: 0 high over the stones in bar 6; 1 in a pocket of the caltrop
 * bed in bar 13 (step down and straight back up); 2 above the pink lantern
 * at the top of the drum's arc in bar 21.
 */
const k = kit('dragon-festival');
const { at } = k;

k.speed(at(20), 6, 'fast', 8);
k.speed(at(44), 4.5, 'normal', 5);

// ── Shapes ──
/** A stone pillar standing on the floor, its top at `top`. */
const stone = (x: number, top: number, spike = false, w = 1) => {
  k.block(x - w / 2, 3, w, top - 3, { style: 'stone' });
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
 * eave keeps the first tap from coming early; a tail row keeps him down.
 */
const rollRun = (taps: number[], floor: number, eave: number, w = 0.42) => {
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
/** Where to hang a row over an upside-down run so a jump at pressX clears it. */
const jumpX = (pressX: number, n: number) =>
  pressX + (k.vAt(pressX) * JUMP_V) / G - n / 2;

// ── Intro (bars 0-4): festival roofs, a drum up to the pagoda ──
k.theme(-20, 'sakura');
k.roof(-16, 49.7, 3, 'tiles');
k.deco(-8, 3, 'sakura');
k.deco(-2.5, 3, 'stone-lantern');
k.deco(6, 3, 'sakura', { flip: true });
k.deco(4, 9, 'lanterns', { s: 9 });
k.jumpSpikes(at(1), 3);
k.jumpSpikes(at(1, 2), 3, 2);
k.deco(22, 3, 'banner');
k.deco(30.6, 3, 'banner', { flip: true });
k.roof(36.69, 8.31, 4, 'shrine');
k.pad(at(2, 2) + 0.3, 4, 'jump');
k.roof(45, 18, 6.5, 'pagoda');
k.deco(47, 6.5, 'cat');
k.jumpSpikes(at(3), 6.5);
k.deco(55.5, 6.5, 'stone-lantern');
// Bar 3 is the fill: leap off the pagoda on beat 4 and the dragon gate
// catches him on the downbeat.

// ── a (bars 4-12): Dragon ──
const CA = 10;
k.fly(at(4), at(12), { mode: 'dragon', floor: 3, ceil: CA, back: 'shadow' });
k.roof(69, 132.5, 3, 'tiles');
// The sign comes early, over the pagoda, in two short lines.
k.text(at(3, 2) + 1, 10.9, 'Hold', 0.8);
k.text(at(3, 2) + 1, 9.9, 'to rise', 0.8);
// Quarter notes: a beam to dive under, a stone to rise over.
hang(at(4, 2), 6.0, CA);
stone(at(4, 3), 6.6);
hang(at(5, 0), 5.8, CA);
stone(at(5, 1), 6.8);
hang(at(5, 2), 5.7, CA);
stone(at(5, 3), 7.0);
// Caltrops on the tips, the line climbing.
hang(at(6, 0), 5.8, CA, true);
stone(at(6, 1), 6.6, true);
hang(at(6, 2), 6.1, CA, true);
stone(at(6, 3), 7.0, true);
hang(at(7, 0), 6.4, CA, true);
stone(at(7, 1), 7.2, true);
hang(at(7, 2), 6.6, CA, true);
k.deco(at(5, 2) + 0.7, 9.7, 'lanterns', { s: 3 });
k.deco(at(6, 2) + 0.7, 9.7, 'lanterns', { s: 3 });
k.deco(at(7, 0) + 0.7, 9.7, 'lanterns', { s: 3 });
k.scroll(at(6, 3) + 1.2, 9.1, 0);
// The tunnel: caltrops on one side at a time; switch on every beat.
{
  const x0 = at(7, 3) + 1;
  const x1 = at(9, 3) + 1;
  k.block(x0, 3, x1 - x0, 2, { style: 'stone' });
  k.block(x0, 6.8, x1 - x0, CA - 6.8, { style: 'wall' });
  const sw = [at(8, 1), at(8, 2), at(8, 3), at(9, 0), at(9, 1), at(9, 2)];
  let low = true;
  let from = x0 + 0.5;
  for (const s of sw) {
    const end = s + 0.4;
    const n = Math.max(1, Math.floor(end - from + 1e-6));
    if (low) k.spike(end - n, 6.8, n, { dir: 'down' });
    else k.spike(end - n, 5, n);
    low = !low;
    from = end + 1.2;
  }
}
// Down to the floor; bar 11 is the fill.
stone(at(10, 1), 6.2, true);
hang(at(10, 2), 6.0, CA, true);
stone(at(10, 3), 5.6, true);
hang(at(11, 0), 5.6, CA, true);
stone(at(11, 1), 4.6);
hang(at(11, 2), 5.0, CA);
k.deco(at(10, 2) + 0.7, 9.7, 'lanterns', { s: 3 });

// ── b (bars 12-20): Shadow Step, in lantern light ──
k.theme(at(12) - 6, 'lanterns', 14);
k.text(at(11, 3) + 0.5, 8.9, 'Tap to step', 0.7);
k.text(at(11, 3) + 0.5, 8.0, 'through', 0.7);
{
  const E1 = 7.5;
  const E2 = 8.5;
  const t = at;
  // Phrase 1: every other beat, over long beds.
  const p1 = [t(12, 2), t(13, 0), t(13, 2), t(14, 0)];
  k.roof(201.5, 67.6, 3, 'shrine');
  const e1 = p1[0] - 0.5;
  k.block(e1, E1, 262.5 - e1, 1, { style: 'tiles' });
  bed(p1[0], p1[1], 3, true);
  bed(p1[1], p1[2], E1, false);
  // The scroll pocket: step down into it and straight back up.
  k.spike(p1[2] + 0.69, 3, 3);
  k.scroll(p1[2] + 4.9, 3.7, 1);
  k.spike(p1[3] - 2.51, 3, 2);
  // Phrase 2: every beat.
  const p2 = [
    p1[3],
    t(14, 1),
    t(14, 2),
    t(14, 3),
    t(15, 0),
    t(15, 1),
    t(15, 2),
  ];
  for (let i = 0; i + 1 < p2.length; i++)
    bed(p2[i], p2[i + 1], i % 2 === 0 ? E1 : 3, i % 2 !== 0);
  k.spike(p2[6] + 0.69, E1, 3, { dir: 'down' });
  k.deco(213, 9.5, 'lanterns', { s: 8 });
  k.deco(238, 9.5, 'lanterns', { s: 8 });
  // Phrase 3: over a pit to a higher roof, under a higher eave.
  const p3 = [t(16, 0), t(16, 2), t(17, 0), t(17, 1), t(17, 2), t(17, 3)];
  k.block(p3[0] - 0.5, E2, at(19) + 2 - (p3[0] - 0.5), 1, { style: 'tiles' });
  k.spike(t(19, 0) + 0.69, E2, 1, { dir: 'down' });
  k.spike(p3[0] + 0.69, 3, 2);
  const r2 = p3[1] - 0.5;
  k.roof(r2, t(19, 0) + 2.5 - r2, 4, 'pagoda');
  bed(p3[1], p3[2], E2, false);
  for (let i = 2; i + 1 < p3.length; i++)
    bed(p3[i], p3[i + 1], i % 2 === 0 ? 4 : E2, i % 2 === 0);
  // Phrase 4: an eighth-note flick, then down to the street.
  const p4 = [
    p3[5],
    t(18, 0),
    t(18, 1),
    t(18, 1.5),
    t(18, 2),
    t(18, 3),
    t(19, 0),
  ];
  for (let i = 0; i + 1 < p4.length; i++)
    bed(p4[i], p4[i + 1], i % 2 === 0 ? E2 : 4, i % 2 !== 0);
  k.roof(p4[6] + 2.5, 26, 3, 'tiles');
  k.deco(278, 10.5, 'lanterns', { s: 10 });
  k.deco(304, 10.5, 'lanterns', { s: 10 });
  // Bar 19 is the fill: a drum on beat 4 throws him into section c.
  k.pad(at(19, 3) + 0.3, 3, 'jump');
  k.deco(at(19, 1) - 1, 3, 'stone-lantern');
}

// ── c (bars 20-28): fast, with drums and spirit lanterns ──
k.theme(at(19, 3), 'sakura', 10);
k.gate(at(20), 6, { mode: 'run', grav: 1, h: 8 });
{
  // A triple, then a drum across a pit to a higher roof and a double.
  k.roof(at(20) - 9, 31.4, 3, 'tiles');
  k.deco(at(20) + 2, 3, 'sakura');
  k.jumpSpikes(at(20, 2), 3, 3);
  k.pad(at(21) + 0.3, 3, 'jump');
  // The pink lantern at the top of the drum's arc is optional: tap it for
  // a higher hop and the scroll.
  k.orb(at(21) + 3.75, 8.2, 'hop');
  k.scroll(at(21) + 5.6, 9.9, 2);
  k.roof(at(21) + 4.6, 15, 5, 'pagoda');
  k.jumpSpikes(at(21, 2), 5, 2);
  // A pink drum on the and of 4 lifts him to a lantern on every beat of
  // bar 22.
  k.pad(at(21, 3.5) + 0.3, 5, 'hop');
  const last = k.orbChain(at(22) + 0.6, 8.9, 4);
  k.deco(at(22) - 1, 3.6, 'lanterns', { s: 18 });
  const r3 = last + 3.4;
  k.roof(r3, at(24) - 1.8 - r3, 5, 'tiles');
  // A quad on beat 3: the hardest single jump in the level.
  k.jumpSpikes(at(23, 2), 5, 4);
  // Bar 24 (a crash): red up to the pagoda.
  k.orb(at(24), 6.1, 'leap');
  k.roof(at(24) + 3.6, 16.4, 8, 'pagoda');
  k.jumpSpikes(at(24, 2), 8, 3);
  // Black down under the lantern string.
  k.orb(at(25), 8.7, 'slam');
  k.roof(at(25) + 1.5, 30, 3, 'warehouse');
  k.spike(at(25) + 2.5, 6.4, 6, { dir: 'down' });
  k.block(at(25) + 2.5, 6.4, 6, 0.6, { style: 'beam' });
  k.deco(at(25) + 2.5, 8.6, 'lanterns', { s: 6 });
  k.jumpSpikes(at(25, 2), 3, 3);
  // Blue drum to the eaves, a jump upside down, green to come home.
  k.pad(at(26) + 0.3, 3, 'flip');
  k.block(at(26) - 2, 7.5, at(27) - at(26) + 2.4, 1, { style: 'tiles' });
  k.spike(jumpX(at(26, 2), 2), 7.5, 2, { dir: 'down' });
  k.orb(at(27) + 0.8, 6.8, 'spin');
  k.roof(at(25) + 31.5, 36, 3, 'tiles');
  // The breath before the drop: a red drum on beat 4 into the dragon,
  // under a lantern string so it cannot be jumped.
  const red = at(27, 3);
  k.block(red - 5.3, 5.4, 4.9, 0.5, { style: 'beam' });
  k.spike(red - 5.3, 5.4, 4, { dir: 'down' });
  k.pad(red + 0.3, 3, 'leap');
}

// ── d (bars 28-36): Dragon, fast: the climax ──
const CD = 11;
k.fly(at(28), at(36), { mode: 'dragon', floor: 3, ceil: CD, back: 'shadow' });
k.roof(at(28) - 2, at(36) - at(28) + 2.5, 3, 'pagoda');
{
  // Dive from the top of the drum's arc to the street, under a low beam.
  hang(at(28, 1), 6.8, CD, true);
  k.block(at(28, 1.5) + 0.4, 4.7, 3.2, CD - 4.7, { style: 'wall' });
  k.spike(at(28, 1.5) + 0.5, 4.7, 3, { dir: 'down' });
  stone(at(28, 3), 6.2, true);
  hang(at(29, 0), 5.6, CD, true);
  stone(at(29, 1), 7.4, true);
  // The tunnel: switch on every eighth. The mouth is open above, so he can
  // dive in from the stone.
  const x0 = at(29, 3) + 1;
  const x1 = at(31, 3) + 1;
  // A stone causeway from the last pillar into the tunnel.
  const cw = at(29, 1) + 0.8;
  k.block(cw, 3, x1 - cw, 2.6, { style: 'stone' });
  k.block(x0 + 2.5, 7.2, x1 - x0 - 2.5, CD - 7.2, { style: 'wall' });
  let low = true;
  let from = x0 + 3;
  for (let b = 30 * 4 + 0.5; b < 31 * 4 + 3; b += 0.5) {
    const s = k.beatX(b);
    const end = s + 0.6;
    const n = Math.max(1, Math.floor(end - from + 1e-6));
    if (low) k.spike(end - n, 7.2, n, { dir: 'down' });
    else k.spike(end - n, 5.6, n);
    low = !low;
    from = end + 0.6;
  }
  // Bar 32 (a crash): a picket fence on the eighths, rising with the key.
  for (let i = 0; i < 14; i++) {
    const x = at(32, 0.5 + i * 0.5);
    const mid = 6.4 + Math.min(i, 13 - i) * 0.18;
    if (i % 2 === 0) stone(x, mid + 0.35, false, 0.5);
    else hang(x, mid - 0.35, CD, false, 0.5);
  }
  for (let i = 0; i < 4; i++)
    k.deco(at(32, 0.75 + i * 2), 10.6, 'lanterns', { s: 4.5 });
  // Bars 34-35: quarter notes stepping down; the drums drop on 35:3.
  stone(at(34, 1), 7.2, true);
  hang(at(34, 2), 6.0, CD, true);
  stone(at(34, 3), 6.6, true);
  hang(at(35, 0), 5.4, CD, true);
  stone(at(35, 1), 5.6, true);
  hang(at(35, 2), 4.6, CD);
}

// ── e (bars 36-44): Shadow Step and Roll, in lantern light ──
k.theme(at(36) - 4, 'lanterns', 10);
{
  const t = at;
  // Bars 36-37, Shadow: over a pit to a lower roof.
  const E1 = 7.5;
  const s1 = [t(36, 1), t(36, 2), t(36, 3), t(37, 1)];
  k.roof(at(36) + 0.5, s1[2] + 3 - (at(36) + 0.5), 3, 'shrine');
  k.block(s1[0] - 0.5, E1, s1[3] + 4.5 - (s1[0] - 0.5), 1, { style: 'tiles' });
  shadowRun(s1.slice(0, 3), 3, E1);
  k.spike(s1[2] + 0.69, 3, 2);
  const r2 = s1[3] - 0.5;
  // He stays up over the pit and steps down on 37:1; then stays down.
  k.spike(s1[3] + 0.69, E1, 3, { dir: 'down' });
  // Bars 38-39, Roll between the low roof and a lower eave.
  const E2 = 6.5;
  k.roof(r2, t(40, 2.5) + 2.69 - r2, 2, 'tiles');
  k.gate(at(38), 4.25, { mode: 'roll', h: 4.5 });
  k.block(at(37, 3), E2, at(40) - at(37, 3) + 1.5, 1, { style: 'tiles' });
  rollRun([t(38, 1), t(38, 2), t(38, 3), t(39, 0), t(39, 1), t(39, 2)], 2, E2);
  // Bars 40-41 (a crash), Shadow: an eighth-note flick, up over a pit,
  // down onto the warehouse roof one higher.
  k.gate(at(40), 4.25, { mode: 'shadow', h: 4.5 });
  const E3 = 7;
  const s3 = [t(40, 1), t(40, 2), t(40, 2.5)];
  const s4 = [t(41, 0), t(41, 1), t(41, 2)];
  k.block(s3[0] - 0.5, E3, at(44) + 1 - (s3[0] - 0.5), 1, { style: 'tiles' });
  shadowRun(s3, 2, E3);
  k.spike(s3[2] + 0.69, 2, 2);
  bed(s4[0], s4[1], E3, false);
  bed(s4[1], s4[2], 3, true);
  k.spike(s4[2] + 0.69, E3, 3, { dir: 'down' });
  // Bars 42-43, Roll on the eighths; the drums drop on 43:3.
  k.roof(s4[0] - 0.2, at(44) + 4 - (s4[0] - 0.2), 3, 'warehouse');
  k.gate(at(42), 5, { mode: 'roll', h: 4 });
  rollRun(
    [t(42, 1), t(42, 1.5), t(42, 2), t(42, 3), t(43, 0), t(43, 1)],
    3,
    E3
  );
  k.deco(at(36, 2), 9.4, 'lanterns', { s: 9 });
  k.deco(at(40, 2), 9.9, 'lanterns', { s: 9 });
}

// ── Outro (bars 44-48): the parade passes ──
k.gate(at(44), 5, { mode: 'run', grav: 1, h: 4 });
k.theme(at(44), 'sakura', 12);
{
  const r = at(44) + 4;
  k.roof(r, at(48) + 34 - r, 3, 'tiles');
  k.jumpSpikes(at(45), 3);
  k.jumpSpikes(at(46), 3, 2);
  // The last jump lands a beat early, so he runs over the line on the final hit.
  k.jumpSpikes(at(47, 2), 3);
  k.deco(at(44, 2), 3, 'banner');
  k.deco(at(44, 3), 9, 'lanterns', { s: 12 });
  k.deco(at(45, 2), 3, 'sakura');
  k.deco(at(46, 2), 3, 'torii');
  k.deco(at(46, 2) + 3, 9.2, 'lanterns', { s: 14 });
  k.deco(at(47, 1), 3, 'banner', { flip: true });
  k.deco(at(48) + 5, 3, 'stone-lantern');
  k.deco(at(48) + 9, 3, 'banner');
  k.deco(at(48) + 12, 8.5, 'crane');
  k.deco(at(48) + 15, 3, 'sakura');
  k.deco(at(48) + 20, 3, 'cat');
  k.end(at(48));
}

export default k.build();
