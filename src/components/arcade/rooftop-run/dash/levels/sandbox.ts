import type { LevelDef, LevelId, Obj } from '../types';
import { levelMeta } from './meta';
import { kit } from './kit';

/**
 * The sandbox: one of every object and all six modes in a single beatable
 * run, built with the kit. The runtime, the renderer and the audio use it
 * before the real levels exist, the six level files reuse it as stubs until
 * they are built, and it is the kit's worked example. Not shipped as a
 * level. The solver test (npm run test:rooftop) proves it can be finished,
 * with all three scrolls, at every level's tempo.
 *
 * It runs about 86 s at normal speed, longer than First Light's song: it is
 * a showcase, not a song. Sections, left to right:
 *
 *   A   0  Run: single, double and small caltrops, a crate, a gap, stairs
 *   B 100  Drums: yellow onto a tank, pink over caltrops, red up a pagoda,
 *          blue up to the eaves (a hanging caltrop), a yellow gate down
 *   C 195  Spirit lanterns: a yellow pair over a pit, pink over four
 *          caltrops, red up a pagoda, black for a dive (scroll 2), blue up
 *          to the eaves, green to come back down
 *   D 330  Gravity gates: blue up to a bridge, yellow back
 *   E 380  Kite: a shuriken, a chimney, a wall, a crow, a moving beam
 *          (scroll 1 by the ceiling)
 *   F 470  Roll: caltrops on the floor and the ceiling
 *   G 550  Parasol: a swinging lantern, a steam vent, a stone, a shuriken, a crow
 *   H 635  Dragon: stones, caltrops above and below, a moving shuriken
 *   I 705  Shadow Step: up to the eaves over caltrops, down past hanging ones
 *   J 790  Wind chevrons: slow, fast, faster, fastest, each with a row to jump
 *   K 900  Home
 */
const k = kit('first-light');

// The stubs reuse these objects under other levels' metas, so pin the speed
// (Shadow Dojo starts fast) and let only the tempo differ.
k.speed(1, 5, 'normal', 10);

// A. Run
k.theme(-20, 'dawn');
k.roof(-16, 86, 3, 'tiles');
k.text(8, 7.2, 'Tap to jump', 0.9);
k.deco(3, 3, 'cat');
k.deco(14, 3, 'bonsai');
k.jumpSpikes(k.at(1, 0), 3, 1);
k.jumpSpikes(k.at(1, 2), 3, 2);
k.block(k.at(2), 3, 4, 1, { style: 'crate' });
k.spike(k.at(2, 2) + 2, 3, 2, { small: true });
k.roof(73.5, 64, 3, 'flat');
k.stairs(82, 3, { steps: 2, rise: 1, run: 5, style: 'crate' });

// B. Drums
k.pad(100, 3, 'yellow');
k.block(104, 3, 8, 3.5, { style: 'tank' });
k.scroll(108, 9.6, 0);
k.pad(118, 3, 'pink');
k.spike(119.4, 3, 2);
k.pad(134, 3, 'red');
k.roof(137.5, 22, 8, 'pagoda');
k.roof(163, 60, 3, 'warehouse');
k.pad(170, 3, 'blue');
k.block(166, 8.5, 22, 1, { style: 'beam' });
k.spike(178, 8.5, 1, { dir: 'down' });
k.gate(186, 6.5, { grav: 1, h: 5 });

// C. Spirit lanterns
k.theme(195, 'lanterns');
k.deco(200, 8, 'lanterns', { s: 12 });
k.orbChain(225.1, 5.9, 2, { dy: 1.5 });
k.roof(232, 31, 3, 'tiles');
k.spike(245, 3, 4);
k.orb(246.1, 5.9, 'pink');
k.deco(240, 3, 'banner');
k.orb(260.1, 5.9, 'red');
k.roof(263, 22, 8, 'pagoda');
k.orb(285.5, 8.7, 'black');
k.scroll(286.6, 4.6, 2);
k.roof(285, 45, 3, 'flat');
k.orb(299.1, 5.9, 'blue');
k.block(299, 9.5, 19, 1, { style: 'beam' });
k.spike(308, 9.5, 1, { dir: 'down' });
k.orb(319.2, 9.2, 'green');

// D. Gravity gates
k.theme(325, 'moon');
k.roof(330, 50, 3, 'tiles');
k.gate(338, 6, { grav: -1, h: 6 });
k.block(337, 8.5, 28, 1, { style: 'bridge' });
k.spike(350, 8.5, 1, { dir: 'down' });
k.gate(362, 6, { grav: 1, h: 6 });

// E. Kite
k.roof(380, 90, 3, 'warehouse');
k.text(384, 10.5, 'Hold to fly', 0.8);
k.deco(386, 3, 'neon');
k.fly(380, 466, { mode: 'kite', floor: 3, ceil: 12 });
k.saw(394, 7.5, 1.2);
k.block(406, 3, 2, 4, { style: 'chimney' });
k.block(418, 8, 2, 4, { style: 'wall' });
k.crow(430, 7.5, k.move(0, 2, 4));
k.block(440, 6, 3, 1, { style: 'beam', move: k.move(0, 2.5, 4) });
k.scroll(448, 11.2, 1);
k.saw(456, 4.6, 1);

// F. Roll
k.theme(470, 'storm');
k.roof(470, 80, 3, 'tiles');
k.gate(478, 5.75, { mode: 'roll', floor: 3, ceil: 8.5, h: 5.5 });
k.text(481, 7.6, 'Tap to switch', 0.7);
k.spike(492, 3, 3);
k.spike(506, 8.5, 3, { dir: 'down' });
k.spike(520, 3, 2);
k.spike(530, 8.5, 2, { dir: 'down' });
k.gate(540, 5.75, { mode: 'run', grav: 1, floor: null, ceil: null, h: 5.5 });

// G. Parasol
k.roof(550, 85, 3, 'flat');
k.fly(552, 626, { mode: 'parasol', floor: 3, ceil: 13 });
k.text(556, 11, 'Tap to hop', 0.7);
k.lantern(568, 13, 4.5, { swing: 0.5, period: 4 });
k.vent(580, 3, 4, 1, 1, { w: 2 });
k.block(593, 3, 2, 5, { style: 'stone' });
k.saw(606, 10.5, 1);
k.crow(616, 6, k.move(0, 1.5, 4, 0.25));

// H. Dragon
k.theme(632, 'sakura');
k.deco(640, 3, 'sakura');
k.roof(635, 70, 3, 'pagoda');
k.fly(636, 700, { mode: 'dragon', floor: 3, ceil: 11 });
k.text(640, 9.8, 'Hold to rise', 0.7);
k.block(650, 3, 3, 3, { style: 'stone' });
k.block(662, 8, 3, 3, { style: 'stone' });
k.spike(674, 3, 3);
k.spike(682, 11, 3, { dir: 'down' });
k.saw(692, 7, 0.9, k.move(0, 1, 4));

// I. Shadow Step
k.theme(704, 'dojo');
k.roof(705, 33, 3, 'shrine');
k.gate(708, 5.5, { mode: 'shadow', h: 5 });
k.text(712, 7.6, 'Tap to step through', 0.6);
k.block(716, 8.5, 46, 1, { style: 'beam' });
k.deco(724, 8.5, 'chime');
k.spike(728, 3, 3);
k.roof(750, 45, 3, 'shrine');
k.spike(755, 8.5, 2, { dir: 'down' });
k.gate(772, 5.5, { mode: 'run', h: 5 });

// J. Wind chevrons: every speed
k.theme(790, 'dawn');
k.roof(795, 130, 3, 'tiles');
k.speed(790, 5, 'slow');
k.jumpSpikes(800, 3, 1);
k.speed(810, 5, 'fast');
k.jumpSpikes(820, 3, 2);
k.speed(832, 5, 'faster');
k.jumpSpikes(845, 3, 3);
k.speed(858, 5, 'fastest');
k.jumpSpikes(875, 3, 4);
k.speed(895, 5, 'normal');

// K. Home
k.deco(902, 3, 'torii');
k.deco(907, 3, 'stone-lantern');
k.deco(910, 7.5, 'crane');
k.deco(913, 3, 'laundry');
k.end(918);

const BUILT = k.build();
const OBJECTS: Obj[] = BUILT.objects;

/** The sandbox under another level's name and tempo: a placeholder until that level is built. */
export function stubLevel(id: LevelId): LevelDef {
  return { ...levelMeta(id), objects: OBJECTS, start: { ...BUILT.start } };
}

/** True for the sandbox and every stub made from it (the solver test skips their song-length check). */
export function isStub(level: LevelDef): boolean {
  return level.objects === OBJECTS;
}

export const SANDBOX: LevelDef = stubLevel('first-light');
