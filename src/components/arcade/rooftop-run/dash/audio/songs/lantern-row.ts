import type { SongData } from '../sequencer';

/**
 * Lantern Row, 124 bpm. Festive: a matsuri down festival street.
 *
 * Melody in the minyō scale on E (E G A B D), the scale of Japanese folk
 * and festival songs, over bright major chords borrowed from E minor
 * (C, D, G) so it bounces rather than broods. Wood clappers open it, the
 * kick goes four on the floor with off-beat hats from b, taiko join in c,
 * and it ends on an E major chord, a festival lantern lit at the last bar.
 *
 *   intro 4  C D Em Em        clappers, shamisen-bright koto
 *   a     8  C D Em Em C D G D   the tune
 *   b     8  Am C D Em …      Kite: the long-note version
 *   c     8  C D G Em …       taiko, the tune again with a new answer
 *   d     6  C D G Em C D     the fast section: busier eighths
 *   outro 2  C E              home, in major
 */
const song: SongData = {
  key: 64,
  pent: [0, 3, 5, 7, 10],
  dia: [0, 2, 3, 5, 7, 8, 10],
  dr: [
    'o............... ................ s.s.s.s.s.s.s.s. k...k...k...k.k.',
    'x.......x....... ....x.......x... x.x.x.x.x.x.x.x. k.......k...k.k.',
    'x...x...x...x... ....x.......x... ..x...x...x...x. l.....m.l.m.m...',
    'x...x...x...x... ....X.......X.x. x.O.x.O.x.O.x.O. L..m..m.L.m.m.hh',
  ],
  bs: [
    '0---------------',
    '0---0---2---0---',
    '0.3.0.3.0.3.0.3.',
    '0.3.0.3.2.3.0.3.',
  ],
  ko: [
    '0...2...3...2...',
    '0.2.3.2.0.2.3.2.',
    '0.2.3.5.4.3.2.3.',
    '3.2.0.2.3.2.4.2.',
  ],
  ph: {
    A: '5-5-6-5-3-2-1---' + '2-2-4-2-0-2-4---',
    B: '3---1-3-5---3---' + '1-0-1-3-0-------',
    C: '6-6-5-3-4---3---' + '2-------4-------',
    D: '7-------5---4---' + '5-------6---5---',
    E: '9-------7---4---' + '5---------------',
    F: '7---8---4---2---' + '3-------5-------',
    G: '6-5-6-7-9-7-6---' + '5---3---5-------',
    H: '5-6-5-3-1-3-5---' + '4-------2---4---',
    I: '5-5-6-5-5-3-5-6-' + '4-4-7-4-2-4-5-7-',
    J: '9-7-6-7-9---7---' + '8---6---5-------',
    K: '5-------3-------' + '5---------------',
  },
  sec: [
    '6 7 1 1',
    '6 7 1 1 6 7 3 7|ABAC',
    '4 6 7 1|DEDF',
    '6 7 3 1 6 7 1 7|AGAH',
    '6 7 3 1 6 7|IJI',
    '6 1+|K',
  ],
  tn: [0, 420, 2200, 0.8],
};

export default song;
