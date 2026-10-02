import type { SongData } from '../sequencer';

/**
 * Shadow Dojo, 160 bpm. Intense and relentless: drum and bass with taiko.
 *
 * Melody in the in scale on A (A Bb D E F), played on an edged reed lead
 * (closer to a hichiriki than a flute), over A phrygian: Am–F–Gm, and the
 * Am–Bb half-step vamp that never lets go. Two-step breakbeat from the
 * first bar, taiko on top. For the last section the whole song lifts a
 * half step into Bb, then the outro drops back to A to bow out.
 *
 *   intro 4  Am Bb Am Bb        no warm-up
 *   a     8  Am F Gm Am … Gm Bb   the hook
 *   b     8  F Gm Am Am … Bb Bb   Kite: long notes over the break
 *   c     8  Am Bb ×3, Gm Bb    Dragon: sixteenth-note runs
 *   d     8  Dm F Gm Am ×2      Shadow Step
 *   e     8  the hook again, at full energy
 *   f     8  (Bb) the runs, a half step higher
 *   outro 4  F Gm Am Am         bow out
 */
const song: SongData = {
  key: 57,
  pent: [0, 1, 5, 7, 8],
  dia: [0, 1, 3, 5, 7, 8, 10],
  dr: [
    '',
    'x.........x..... ....x.......x... s.s.s.s.s.s.s.s. ................',
    'x.........x..... ....X.......X... x.x.x.x.x.x.x.x. L...............',
    'x.........x..... ....X..o.o..X... xoxoxoxoxoxoxoxo L.....m...l...m.',
    'x.x.......x..... ....X..o.o..X.o. xoxOxoxoxoxOxoxo L.mmL.m.l.mmL.hh',
  ],
  bs: [
    '',
    '0-------------..',
    '0-------0--.0-..',
    '0-----0---0---3-',
    '0--0--0-0--0-.3-',
  ],
  ko: [
    '',
    '0.....2.....3.2.',
    '0.2.3.2.0.2.3.2.',
    '0232023202320232',
    '0232423202324232',
  ],
  ph: {
    A: 'a--a--8-a----ba-' + '9-------7---9---',
    B: 'b--b--9-7---9---' + '8-------5-------',
    C: '7--7--9-b---9---' + 'c-------b---9---',
    D: 'a-------9---7---' + 'b-------9---7---',
    E: '8-------a----ba-' + '8---------------',
    F: '7-------9---b---' + 'a-------------..',
    G: 'a-8-a-b-a-8-5-8-' + '9-7-9-b-9-7-6-7-',
    H: 'b-9-7-6-7-9-b-c-' + 'b-------9-------',
    I: '7---9---a---9---' + 'a-------7-------',
    J: 'b---a---9---7---' + '8-------5-------',
  },
  sec: [
    '1 2 1 2',
    '1 6 7 1 1 6 7 2|ABAC',
    '6 7 1 1 6 7 2 2|DEDF',
    '1 2 1 2 1 2 7 2|GGGH',
    '4 6 7 1|IJ',
    '1 6 7 1 1 6 7 2|ABAC',
    '1 2 1 2 1 2 7 2|GGGH|1',
    '6 7 1 1|-E',
  ],
  tn: [1, 300, 1300, 0.6],
};

export default song;
