import type { SongData } from '../sequencer';

/**
 * First Light, 112 bpm. Hopeful and gentle: dawn on the rooftops.
 *
 * Melody in the yo scale on D (D E G A B), over D major harmony, so the
 * tune never sounds the third (F#) and keeps that open, folk-song air.
 * The verse is I–V–vi–IV; the climb in b is the royal road (IV–V–iii–vi),
 * the progression half of Japanese pop is built on; the Kite section
 * floats on long notes; the outro lands with a plagal IV–I, an "amen".
 *
 *   intro 4  D G D Asus4    koto and pads, a dawn call on the flute
 *   a     8  D A Bm G …     the tune
 *   b     8  G A F#m Bm …   the royal road, higher
 *   c     6  G D A Bm G A   Kite: long, soaring notes
 *   outro 2  G D            home
 */
const song: SongData = {
  key: 62,
  pent: [0, 2, 5, 7, 9],
  dia: [0, 2, 4, 5, 7, 9, 11],
  dr: [
    'o............... ................ s.s.s.s.s.s.s.s. ................',
    'x.......x....... ....x.......x... x.s.x.s.x.s.x.s. ................',
    'x.....x.x....... ....x.......x... x.xsx.xsx.xsx.xs ..............m.',
  ],
  bs: ['0---------------', '0-------0---2---', '0--0--0-0--0--2-'],
  ko: ['0...2...4...2...', '0.2.3.2.4.2.3.2.', '0.2.3.4.5.4.3.2.'],
  ph: {
    I: '3-------4---5---' + '-------.3-------',
    A: '5---3---4-5-----' + '6-----5-3-------',
    B: '4---5---6-5-4---' + '2-------....1-3-',
    C: '4---2---3---6---' + '5-----------....',
    D: '7---5---4-5-7---' + '8-----7-6-------',
    E: '6---3---6-8-6---' + '9-------8-6-4---',
    F: '9---8---6---5---' + '6-----------....',
    G: 'a-------9---7---' + '8---------------',
    H: '6-------8---6---' + '9-------------..',
    J: '7-------5---4---' + '3---------------',
    K: '5-------4---3---' + '5---------------',
  },
  sec: [
    '1 4 1 5s|-I',
    '1 5 6 4 1 5 4,5 1|ABAC',
    '4 5 3 6 4 5 6 5|DEDF',
    '4 1 5 6 4 5|GHJ',
    '4 1|K',
  ],
  tn: [0, 380, 1800, 0.55],
};

export default song;
