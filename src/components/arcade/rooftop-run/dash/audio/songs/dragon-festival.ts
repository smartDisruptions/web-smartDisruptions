import type { SongData } from '../sequencer';

/**
 * Dragon Festival, 150 bpm. Euphoric: fireworks, a dragon dance.
 *
 * Melody in the yo scale on E (E F# A B C#), over E major. The theme rides
 * I–V–vi–IV, b climbs the royal road (IV–V–iii–vi), c runs in eighths
 * over vi–IV–I–V and ends on a major C#, the dominant of F#. Then the key
 * lifts a whole step: the theme comes back in F# for the full-energy d,
 * the oldest euphoria trick there is, and the song stays up to the end.
 *
 *   intro 4  C#m A E B          clappers and bells
 *   a     8  E B C#m A …        Dragon: the theme
 *   b     8  A B G#m C#m ×2     Shadow Step: the royal road
 *   c     8  C#m A E B … B C#   fast: the run, into the key change
 *   d     8  (F#) the theme     everything
 *   e     8  (F#) the royal road
 *   outro 4  (F#) B C# F# F#    the parade passes
 */
const song: SongData = {
  key: 64,
  pent: [0, 2, 5, 7, 9],
  dia: [0, 2, 4, 5, 7, 9, 11],
  dr: [
    '',
    'x.......x....... ....x.......x... s.s.s.s.s.s.s.s. k.......k.k.....',
    'x...x...x...x... ....x.......x... ..x...x...x...x. l.......m.....m.',
    'x...x...x...x... ....X.......X... x.O.x.O.x.O.x.O. L..m..m.L..m.mhh',
    'x...x...x...x... ....X.......X... xoOoxoOoxoOoxoOo L.m.L.mmL.m.L.hh',
  ],
  bs: [
    '',
    '0---0---0---0---',
    '0.0.0.0.0.0.0.0.',
    '0.3.0.3.0.3.0.3.',
    '0.3.0.3.0.3.2.3.',
  ],
  ko: [
    '',
    '0.2.3.2.4.2.3.2.',
    '0.2.3.4.5.4.3.2.',
    '0234543202345432',
    '0234543202345432',
  ],
  ph: {
    A: '5---8---9-8-5---' + '6-------4---3---',
    B: '4---5---9---8---' + '7-------6---5---',
    C: '7---9---a---9---' + '8-------6-------',
    D: '9-8-7-5-7---9---' + '8---6---8-------',
    E: '8-------6---8---' + '9-------5-------',
    F: '3---6---8---9---' + 'a---------------',
    G: '9-9-8-9-a-9-8-5-' + '7-7-6-7-9-7-5---',
    H: '8-8-9-8-a-8-9-8-' + '6-6-4-6-8-6-4---',
    I: '8---6---8---9---' + '9-------------..',
    K: '8-------9---8---' + '5---------------',
  },
  sec: [
    '6 4 1 5',
    '1 5 6 4 1 5 4 5|ABAC',
    '4 5 3 6|DEDF',
    '6 4 1 5 6 4 5 6+|GHGI',
    '1 5 6 4 1 5 4 5|ABAC|2',
    '4 5 3 6|DEDF|2',
    '4 5 1 1|CK|2',
  ],
  tn: [0, 450, 2600, 0.75],
};

export default song;
