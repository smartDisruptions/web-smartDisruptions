import type { SongData } from '../sequencer';

/**
 * The menu loop, 88 bpm, eight bars round and round: calm, so choosing a
 * level never feels rushed. Koto and pads in D mixolydian, a slow
 * C–Bm–Em–Am descent, the flute answering twice per loop. The last chord
 * (D) steps down to the first (C), so the seam never shows.
 */
const song: SongData = {
  key: 62,
  pent: [0, 2, 5, 7, 9],
  dia: [0, 2, 4, 5, 7, 9, 10],
  dr: ['................ ................ ..s...s...s...s. ................'],
  bs: ['0---------------'],
  ko: ['0..2..3..4..2...'],
  ph: {
    A: '6-------4---2---' + '3---------------',
    B: '6-------5---3---' + '5---------------',
  },
  sec: ['7 6 2 5 7 6 5 1|-A-B'],
  tn: [0, 300, 1600, 0.5],
  bpm: 88,
};

export default song;
