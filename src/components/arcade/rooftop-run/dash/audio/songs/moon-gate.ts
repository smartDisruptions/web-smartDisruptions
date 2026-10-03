import type { SongData } from '../sequencer';

/**
 * Moon Gate, 132 bpm. Mysterious, minor: the town turns upside down.
 *
 * Melody in the in scale (miyako-bushi) on E (E F A B C), the scale of the
 * koto's old court music, whose half steps (E–F, B–C) give it the hush of
 * a temple at night. Harmony in E phrygian: the vamp Em–F, the phrygian
 * cadence Dm–E (a major E for the gate's turn), F–Em under the melody's
 * falling A–F–E (the scale's own cadence), and in c the rising
 * F–G–Em. Half-time drums and space until d, where the rolls come in.
 *
 *   intro 4  Em F Em F         a lone rim click, the flute calls late
 *   a     8  Am F Em F,Em … Dm E   the tune, falling to E
 *   b     8  Am C Dm Em …      Roll: arpeggios rolling up and down
 *   c     8  F G Em Em … Dm E   the turn, high
 *   d     8  Am F Em F,Em … G E   faster: the tune with a new ending
 *   outro 4  Am F Em F,Em      home under the moon
 */
const song: SongData = {
  key: 64,
  pent: [0, 1, 5, 7, 8],
  dia: [0, 1, 3, 5, 7, 8, 10],
  dr: [
    'o............... ................ ................ ........k.......',
    'x.........x..... ........x....... ..s...s...s...s. ................',
    'x.........x..... ....x.......x... x.s.x.s.x.s.x.s. ......h.......m.',
    'x.....x...x..... ....X.......X..o xsxsxsxsxsxsxsxs l.....m...l.m...',
  ],
  bs: [
    '0---------------',
    '0-------------..',
    '0-------0---2-1-',
    '0--0--0-0--0--0-',
  ],
  ko: [
    '0.....2.....3...',
    '0.....2.....3.2.',
    '0.2.3.2.4.2.3.2.',
    '0232023202320232',
  ],
  ph: {
    A: '5------------65-' + '4-------3-------',
    B: '7---5---4---5---' + '6-------5---4---',
    C: '3-------5---3---' + '2---1---0-------',
    D: '6---7---6---4---' + '3-------5-------',
    E: '2-4-5-7-5-4-2---' + '4---5---9-------',
    F: '7-6-7-9-7-6-4---' + '5-------3-------',
    G: '6---4---2---1---' + '0---------------',
    H: '6---7---9---7---' + '8-------7---8---',
    I: 'a-------8---5---' + '5----65-3-------',
    J: '7-------6---4---' + '3---------------',
    K: '8---7---8-9-8---' + '8---------------',
  },
  sec: [
    '1 2 1 2|-A',
    '4 2 1 2,1 4 2 7 1+|BCBD',
    '4 6 7 1|EFEG',
    '2 3 1 1 2 3 7 1+|HIHJ',
    '4 2 1 2,1 4 2 3 1+|BCBK',
    '4 2 1 2,1|-C',
  ],
  tn: [0, 360, 1500, 0.5],
};

export default song;
