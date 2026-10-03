import type { SongData } from '../sequencer';

/**
 * Storm Roofs, 140 bpm. Driving and dark, with thunder on the downbeats.
 *
 * Melody in the hirajoshi scale on D (D E F A Bb), the darkest of the
 * koto tunings, over D minor: i–bVI–bVII–i and, at the ends of phrases, a
 * major A (the dominant) that pulls hard back to D. Dotted-rhythm hooks,
 * eighth-note bass from the first bar, a gallop in c, sixteenths and
 * double-time taiko when the storm breaks in d.
 *
 *   intro 4   Dm Dm Bb A          the rain starts: shaker and bass
 *   a     8   Dm Bb C Dm … Gm A   the hook
 *   b     8   Bb C Dm Dm … A A    Parasol: floating long notes
 *   c     8   Dm Bb C A ×2        fast: running eighths
 *   d     12  Dm Bb C A … Bb C A A   the storm breaks, then climbs
 *   outro 4   Dm Bb Gm Dm         the rain eases
 */
const song: SongData = {
  key: 62,
  pent: [0, 2, 3, 7, 8],
  dia: [0, 2, 3, 5, 7, 8, 10],
  dr: [
    '',
    'x.......x....... ................ s.s.s.s.s.s.s.s. ................',
    'x...x...x...x... ....x.......x... ..x...x...x...x. ................',
    'x...x...x...x... ....X.......X... xoxxxoxxxoxxxoxx L.....m.L.....m.',
    'x...x...x...x.x. ....X.......X... xoxOxoxOxoxOxoxO L.mmL.mmL.mmL.hh',
  ],
  bs: [
    '',
    '0.0.0.0.0.0.0.0.',
    '0.0.0.0.0.0.0.0.',
    '0.00.00.0.00.00.',
    '0000000000000000',
  ],
  ko: [
    '',
    '0.2.3.2.0.2.3.2.',
    '0.2.3.2.0.2.3.2.',
    '0232023202320232',
    '0232423202324232',
  ],
  ph: {
    A: '5--5--3-7---5---' + '4--4--5-7-------',
    B: '6--6--5-6---8---' + '7-------5-------',
    C: '9--9--8-7---5---' + '6-------3-------',
    D: '8-------7---5---' + '6-------8-------',
    E: '7-------5---3---' + '5---------------',
    F: '3---1---3-4-3---' + '3---------------',
    G: '5-7-8-7-5-7-8-a-' + '9-8-7-5-4-5-7---',
    H: '6-8-6-5-6-8-9-8-' + '6-------8-------',
    I: 'a-------9---8---' + '6---8---9---a---',
    J: '8-------8-9-8---' + '6-------3-------',
    K: '9-------7-------' + '5---------------',
  },
  sec: [
    '1 1 6 5+',
    '1 6 7 1 1 6 4 5+|ABAC',
    '6 7 1 1 6 7 5+ 5+|DEDF',
    '1 6 7 5+|GH',
    '1 6 7 5+ 1 6 7 5+ 6 7 5+ 5+|GHGHIJ',
    '1 6 4 1|AK',
  ],
  tn: [0, 330, 1400, 0.45],
  thunder: true,
};

export default song;
