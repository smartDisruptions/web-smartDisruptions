import { G, JUMP_V, kit } from './kit';

/**
 * First Light: easy, 112 bpm, 28 bars, 60 s. Dawn over Kiru's town. Learn to
 * jump, then to fly. Every press lands on a beat or an off-beat. Bars count
 * from 0 as at() does; beats are counted 1 to 4, as the music counts them.
 *
 *   intro  0-3   Tap to jump: one caltrop on each of bars 1, 2 and 3.
 *   a      4-11  The first gap on bar 4, singles, the first double, a step up
 *                onto a pagoda, the cat's chimney (scroll 0), a gap down.
 *   b     12-19  Yellow drums: one alone, one up onto a warehouse. Hold to
 *                keep jumping, a crate up to a shrine, a double off its edge
 *                over a small one, a drum by the last caltrop (scroll 1).
 *   c     20-25  Hold to fly: a wide kite corridor over a skyline, with a dip
 *                to dive into (scroll 2). The festival lights come up.
 *   outro 26-27  Land, one last jump on the crescendo, the finish.
 */
const k = kit('first-light');
const at = k.at;

/** Blocks from a press to the top of the jump's arc. */
const apex = (x: number) => (k.vAt(x) * JUMP_V) / G;
/** A step up's riser this far past the press puts the press mid-window. */
const RISER = 2.55;
/** A held jump's length on flat ground at normal speed, blocks. */
const HOP = 4.247;

// ── Intro: find your feet ────────────────────────────────────────────────
k.theme(-20, 'dawn');
const gap1 = at(4) + apex(at(4)); // gap 1, centred under the bar-4 jump
k.roof(-16, gap1 - 1.25 + 16, 3, 'tiles');
k.deco(-6, 3, 'banner');
k.deco(-2.5, 3, 'stone-lantern');
k.deco(6, 3, 'cat');
k.deco(31, 3, 'laundry', { s: 4 });
k.deco(56, 3, 'bonsai');
k.deco(78, 3, 'banner', { s: 2.6 });
k.deco(82, 3, 'sakura');
k.deco(12, 9.6, 'lanterns', { s: 9 });
k.deco(52, 9.8, 'lanterns', { s: 10 });
k.text(19.5, 7, 'Tap to jump');
k.jumpSpikes(at(1), 3);
k.jumpSpikes(at(2), 3);
k.jumpSpikes(at(3), 3);

// ── a: gaps, doubles, a step up ──────────────────────────────────────────
const step1 = at(7) + RISER;
k.roof(gap1 + 1.25, step1 - gap1 - 1.25, 3, 'flat');
k.jumpSpikes(at(5), 3);
k.jumpSpikes(at(5, 2), 3);
k.jumpSpikes(at(6), 3, 2);
k.deco(gap1 + 4, 3, 'neon', { s: 2.4 });

// The pagoda, one block up, to a gap down on bar 10.
const gap2 = at(10) + apex(at(10));
k.roof(step1, gap2 - 1.5 - step1, 4, 'pagoda');
// The cat's chimney on bar 8. Scroll 0 floats over it, too high to reach
// from the pagoda: hop again off the chimney top to get it.
const chim = at(8) + RISER;
k.block(chim, 4, 3.6, 1, { style: 'chimney' });
k.deco(chim + 0.7, 5, 'cat', { flip: true });
k.scroll(chim + 4.2, 8.9, 0);
k.jumpSpikes(at(9), 4);
k.jumpSpikes(at(9, 2), 4);
k.deco(step1 + 2, 4, 'stone-lantern');
k.deco(at(9, 1), 4, 'banner', { s: 2.4 });

// Over gap 2, one block down, onto a long tiled roof. The fill bar's double
// goes on beat 4, landing just as the drum on bar 12 fires.
const r3 = gap2 + 1.5;
k.jumpSpikes(at(11, 3), 3, 2);
k.deco(r3 + 3, 3, 'bonsai');

// ── b: drums, holds, crates ──────────────────────────────────────────────
// The first drum, alone on the downbeat of bar 12: up and back down.
k.text(at(12) - 1, 9.1, 'Yellow drums', 0.85);
k.text(at(12) - 1, 8.2, 'launch you', 0.85);
k.pad(at(12) + 0.3, 3, 'yellow');
k.jumpSpikes(at(12, 2), 3);
// The second drum throws him up onto a warehouse three blocks higher.
const drum2 = at(13) + 0.3;
const wh = drum2 + 2.8;
k.roof(r3, wh - r3, 3, 'tiles');
k.pad(drum2, 3, 'yellow');
const whEnd = at(15) + 1;
k.roof(wh, whEnd - wh, 6, 'warehouse');
k.jumpSpikes(at(14), 6, 2);
k.jumpSpikes(at(14, 2), 6);
k.deco(wh + 1.5, 6, 'cat');
k.deco(at(14, 3), 6, 'neon', { s: 2 });

// Down off the warehouse (a drop, no press), a small one, then hold.
k.jumpSpikes(at(15, 2), 3, 1, { small: true });
k.text(at(16) - 2, 8, 'Hold to keep jumping', 0.85);
// Three caltrops one held jump apart: the presses fall on 3-3-2.
k.jumpSpikes(at(16), 3);
k.jumpSpikes(at(16) + HOP, 3);
k.jumpSpikes(at(16) + 2 * HOP, 3);
k.deco(at(16) + 14, 3, 'laundry', { s: 4 });

// A crate, then the shrine roof: up one, up one more.
const crate = at(17) + RISER;
const shrine = at(17, 1) + RISER;
const ledge = at(18) + apex(at(18)) + 1; // the shrine's far edge
k.roof(whEnd, shrine - whEnd, 3, 'flat');
k.block(crate, 3, shrine - crate, 1, { style: 'crate' });
k.roof(shrine, ledge - shrine, 5, 'shrine');
k.deco(shrine + 0.6, 5, 'banner', { s: 2.4 });
k.jumpSpikes(at(17, 3), 5);
// A double on the shrine's edge over a small one at its foot: one jump.
k.spike(ledge - 2, 5, 2);
k.spike(ledge, 3, 1, { small: true });

// The last caltrop of b has a drum in front of it: jump on the beat and
// sail over both, or don't jump and the drum throws you over, past scroll 1.
// The caltrop sits a little late so an on-beat jump clears the drum easily.
const last = at(18, 2) + apex(at(18, 2)) + 0.7 - 0.5;
k.spike(last, 3, 1, { small: true });
k.pad(last - 1, 3, 'yellow');
k.scroll(last + 1.75, 8.5, 1);
// The fill: one jump on beat 4, landing just before the gate.
k.jumpSpikes(at(19, 3), 3);
k.deco(at(19) + 4, 3, 'bonsai');
k.deco(at(19) + 9, 3, 'cat');

// ── c: Hold to fly ───────────────────────────────────────────────────────
// A wide corridor (3 to 12) over a skyline. Buildings rise from the floor
// and timber beams hang from the eaves, each with at least 5 blocks of air.
const fly0 = at(20);
const fly1 = at(26);
k.fly(fly0, fly1, { mode: 'kite', floor: 3, ceil: 12 });
k.text(fly0 + 4.5, 8.6, 'Hold to fly');
k.deco(fly0 + 14, 12, 'lanterns', { s: 8 });
// Bar 21: over a pagoda.
const p1 = at(21);
k.roof(ledge, p1 - ledge, 3, 'tiles');
k.roof(p1, 4.5, 6.5, 'pagoda');
// Bar 22: under a beam, then over a warehouse.
const b1 = at(22);
k.roof(p1 + 4.5, at(22, 2) - p1 - 4.5, 3, 'flat');
k.block(b1, 9, 6, 3, { style: 'beam' });
k.roof(at(22, 2), 4, 5.5, 'warehouse');
k.deco(at(22, 2) + 2.2, 5.5, 'cat');
// Bar 23: up over a shrine, a crow keeping to the high corner.
const s1 = at(23);
k.roof(at(22, 2) + 4, s1 - at(22, 2) - 4, 3, 'tiles');
k.roof(s1, 4, 7, 'shrine');
k.deco(s1 + 2, 7, 'bonsai');
k.crow(at(23, 2), 11, k.move(0, 0.4, 4));
// Bar 24: the dip between two pagodas. Scroll 2 waits at the bottom.
const d0 = at(24) - 4;
const d1 = at(24) + 12;
k.roof(s1 + 4, d0 - s1 - 4, 3, 'flat');
k.roof(d0, 3, 7, 'pagoda');
k.roof(d0 + 3, d1 - d0 - 3, 3, 'tiles');
k.roof(d1, 3, 7, 'pagoda');
k.scroll(at(24) + 5.5, 4.2, 2);
k.deco(d0 + 7, 12, 'lanterns', { s: 6 });
// Bar 25: a low warehouse, then glide down to the gate.
const w2 = at(25, 1);
k.roof(d1 + 3, w2 - d1 - 3, 3, 'flat');
k.roof(w2, 5, 4.5, 'warehouse');
k.roof(w2 + 5, fly1 + 6 - w2 - 5, 3, 'tiles');
k.theme(at(25), 'lanterns', 16);

// ── outro: run it home ───────────────────────────────────────────────────
// The last jump goes with the final crescendo and lands on the line.
k.roof(fly1 + 6, at(28) + 30 - fly1 - 6, 3, 'tiles');
k.jumpSpikes(at(27, 2), 3);
k.deco(at(26) + 10, 3, 'sakura');
k.deco(at(26) + 16, 3, 'neon', { s: 2.4 });
k.deco(at(27) + 2, 3, 'banner', { s: 3 });
k.deco(at(28) + 4, 3, 'stone-lantern');
k.deco(at(28) + 8, 3, 'banner');
k.deco(at(28) + 12, 3, 'cat');
k.deco(at(28) + 18, 3, 'torii');
k.deco(at(28) + 21, 3, 'sakura');
k.deco(at(28) - 6, 9.5, 'lanterns', { s: 14 });
k.deco(at(28) + 9, 9.8, 'lanterns', { s: 12 });
k.end(at(28));

export default k.build();
