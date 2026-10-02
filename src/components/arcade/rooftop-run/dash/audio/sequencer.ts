import type { Kit } from './synth';
import {
  bass,
  hit,
  lead,
  pad,
  pluck,
  riser,
  synth,
  KICK,
  SNARE,
  CLAP,
  HAT,
  OHAT,
  SHAKER,
  TLOW,
  TMID,
  THIGH,
  KA,
  CRASH,
  THUNDER,
  REVERSE,
} from './synth';

/**
 * Songs are written as compact pattern data and compiled once into a sorted
 * list of notes. The compiler is also the arranger: it follows the level's
 * sections bar for bar and applies the same rules to every song.
 *
 * - Energy (1..5) picks the drum groove, the bass line and the koto
 *   pattern; from 4 up a synth doubles the lead an octave down.
 * - Bar 1 of every section lands hard: crash, big taiko, kick. Players feel
 *   the gate land on the music.
 * - The last bar of every section is a fill: the groove stops halfway and
 *   taiko and snare take over, louder as they go.
 * - Into a louder section, or a new way of moving, a riser builds over that
 *   bar; into a quieter one the drums drop out under a reversed cymbal.
 *   Before the first full-energy section everything but the pads stops for
 *   a beat, so the downbeat hits harder.
 * - After the last section, a two-bar tail: one big hit and the last chord
 *   ringing out.
 */

/** A song, as pattern strings. Every line is one character per sixteenth note. */
export interface SongData {
  /** The tonic as a MIDI note: melody digit '0' (an octave above the pads). */
  key: number;
  /** The melody's pentatonic mode: semitones above the tonic. */
  pent: number[];
  /** The harmony's seven-note mode (from the tonic): chord degrees index it. */
  dia: number[];
  /**
   * Drum grooves by energy 1..5 (a missing level reuses the one below):
   * 'kick snare hats taiko', 16 steps each.
   *  kick   x hit · X accent · o soft
   *  snare  x clap · X clap and snare · s snare · o ghost · r rim
   *  hats   x closed · X accent · o soft · O open · s shaker
   *  taiko  L/l low (loud/soft) · M/m mid · H/h high · k rim
   */
  dr: string[];
  /** Bass lines by energy ('' for none): chord tones 0 root · 1 third · 2 fifth · 3 octave · 4 low fifth. */
  bs: string[];
  /** Koto lines by energy: chord tones 0..2, and 3..6 the same an octave (or two) up. */
  ko: string[];
  /** Melody phrases, two bars each: digit = step of the pentatonic (0 tonic, 5 an octave up). */
  ph: Record<string, string>;
  /**
   * One entry per section: 'chords|phrases|transpose'. Chords are one per bar
   * (looped), degrees 1..7 of `dia`, two in a bar split by a comma;
   * suffixes: + major, - minor, s sus4, 7 add the seventh. Phrases are one
   * letter per two bars (looped), '-' for rest.
   */
  sec: string[];
  /** [lead edge 0..1, bass cutoff Hz, pad cutoff Hz, koto brightness 0..1] */
  tn: number[];
  /** Thunder on section starts (Storm Roofs). */
  thunder?: boolean;
  /** Only for songs without a level (the menu). */
  bpm?: number;
}

export interface Shape {
  bars: number;
  energy: number;
  mode?: string;
}

/** One note or hit: [step (sixteenths from the start), instrument, MIDI note, length in steps, velocity]. */
export type Ev = [number, number, number, number, number];

export interface Song {
  ev: Ev[];
  /** Seconds per step. */
  sd: number;
  /** Seconds from the start to the end of the tail (or of one loop). */
  len: number;
  loop: boolean;
  tn: number[];
  /** The koto notes it needs rendered. */
  koto: number[];
}

// Instruments after the drums (0..12 are the drum buffers).
export const BASS = 13;
export const PAD = 14;
export const KOTO = 15;
export const LEAD = 16;
export const SYNTH = 17;
export const RISER = 18;

/** The strip each instrument plays into (pads alternate between 6 and 7). */
const CH = [0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 11, 4, 5, 6, 8, 9, 10, 11];

/** The four drum lines: character → [instrument, velocity, ...]. */
const LINES: Record<string, number[]>[] = [
  { x: [KICK, 0.8], X: [KICK, 1], o: [KICK, 0.5] },
  {
    x: [CLAP, 0.8],
    X: [CLAP, 0.9, SNARE, 0.7],
    s: [SNARE, 0.75],
    o: [SNARE, 0.28],
    r: [KA, 0.5],
  },
  {
    x: [HAT, 0.6],
    X: [HAT, 0.85],
    o: [HAT, 0.35],
    O: [OHAT, 0.55],
    s: [SHAKER, 0.6],
  },
  {
    L: [TLOW, 1],
    l: [TLOW, 0.6],
    M: [TMID, 1],
    m: [TMID, 0.7],
    H: [THIGH, 1],
    h: [THIGH, 0.7],
    k: [KA, 0.7],
  },
];

/** Fills for the second half of a section's last bar, by energy: [taiko, snare]. */
const FILLS = [
  ['....m.h.', '........'],
  ['m...m.hh', '........'],
  ['l.l.mmhh', '......ss'],
  ['llmmhhmm', 's.s.ssss'],
  ['LLmmMMHH', 'ssssssss'],
];

const at = (a: string[], e: number) => a[Math.min(e, a.length) - 1] ?? '';

/** A chord token → its notes, in semitones above the tonic. */
function chord(dia: number[], tok: string): number[] {
  const i = +tok[0] - 1;
  const up = (k: number) => (dia[(i + k) % 7] - dia[i] + 12) % 12;
  const m = tok.slice(1);
  const third = m.includes('+')
    ? 4
    : m.includes('-')
      ? 3
      : m.includes('s')
        ? 5
        : up(2);
  const c = [dia[i], dia[i] + third, dia[i] + up(4)];
  if (m.includes('7')) c.push(dia[i] + up(6));
  return c;
}

/**
 * Voice leading: of the chord's inversions in the pads' register (lowest
 * note within the octave and a bit below the tonic), the one whose notes
 * move least from the chord before. Common tones hold; the rest step.
 */
function voice(c: number[], prev: number[], key: number): number[] {
  let best: number[] = [];
  let cost = Infinity;
  for (let inv = 0; inv < c.length; inv++) {
    let n = key + c[inv];
    while (n > key + 1) n -= 12;
    while (n < key - 10) n += 12;
    const v = [n];
    for (let j = 1; j < c.length; j++) {
      let m = key + c[(inv + j) % c.length];
      while (m <= v[j - 1]) m += 12;
      while (m - 12 > v[j - 1]) m -= 12;
      v.push(m);
    }
    const s = prev.length
      ? v.reduce((a, x) => a + Math.min(...prev.map((p) => Math.abs(p - x))), 0)
      : Math.abs(v[0] - key + 7);
    if (s < cost) {
      cost = s;
      best = v;
    }
  }
  return best;
}

/** A bass note: chord tone `d` with the root between E1 and D#2. */
function low(c: number[], key: number, d: number) {
  let r = key + c[0];
  while (r >= 40) r -= 12;
  while (r < 28) r += 12;
  return d > 2 ? r + (d > 3 ? c[2] - c[0] - 12 : 12) : r + c[d] - c[0];
}

/** A koto note: chord tone `d` (3+ an octave up) with the root around the tonic. */
function mid(c: number[], key: number, d: number) {
  let r = key + c[0];
  while (r >= key + 7) r -= 12;
  while (r < key - 5) r += 12;
  return r + c[d % 3] - c[0] + 12 * Math.floor(d / 3);
}

/** Each note of a pattern line: a symbol, then '-' to hold it; '.' rests. */
function notes(
  line: string,
  fn: (st: number, ch: string, len: number) => void
) {
  for (let s = 0; s < line.length; s++) {
    const ch = line[s];
    if (ch === '.' || ch === '-') continue;
    let len = 1;
    while (line[s + len] === '-') len++;
    fn(s, ch, len);
  }
}

export function compile(
  d: SongData,
  shape: Shape[],
  bpm: number,
  loop = false
): Song {
  const ev: Ev[] = [];
  const drums = new Map<number, Ev>();
  const add = (s: number, i: number, n: number, len: number, v: number) => {
    // One hit per drum per step: where a groove and an accent meet, the louder wins.
    const o = i <= REVERSE ? drums.get(s * 32 + i) : null;
    if (o) o[4] = Math.max(o[4], v);
    else {
      const e: Ev = [s, i, n, len, v];
      if (i <= REVERSE) drums.set(s * 32 + i, e);
      ev.push(e);
    }
  };
  let bar = 0;
  let voicing: number[] = [];
  let last: number[] = [];
  let lastKey = d.key;
  shape.forEach((sec, si) => {
    const e = sec.energy;
    const [cs, ms = '', tr = '0'] = d.sec[si].split('|');
    const chords = cs.split(' ');
    const key = d.key + +tr;
    const groove = at(d.dr, e).split(' ');
    const bl = at(d.bs, e);
    const kl = at(d.ko, e);
    const nx = shape[si + 1];
    const dv = 0.55 + 0.09 * e;
    // Louder sections are louder, not only busier: about 1.6 dB per step of
    // energy, half that on the pads so a quiet section keeps its bed.
    const lift = 10 ** ((e - 3) * 0.08);
    const put = (s: number, i: number, n: number, len: number, v: number) =>
      add(s, i, n, len, v * (i === PAD ? Math.sqrt(lift) : lift));
    for (let b = 0; b < sec.bars; b++, bar++) {
      const s0 = bar * 16;
      const end = b === sec.bars - 1 && !loop;
      const drop = end && nx && nx.energy < e;
      // A beat of near-silence before the first full-energy section.
      const gap = end && nx && nx.energy === 5 && e < 5 ? 12 : 16;
      const segs = chords[b % chords.length]
        .split(',')
        .map((t) => chord(d.dia, t));
      const seg = (st: number) => segs[Math.floor((st * segs.length) / 16)];
      segs.forEach((c, j) => {
        voicing = voice(c, voicing, key);
        const len = 16 / segs.length;
        for (const n of voicing)
          put(s0 + j * len, PAD, n, len, 0.55 + 0.05 * e);
      });
      last = segs[segs.length - 1];
      lastKey = key;
      if (bl)
        notes(bl, (st, ch, len) => {
          if (st < gap)
            put(
              s0 + st,
              BASS,
              low(seg(st), key, +ch),
              len - 0.1,
              0.55 + 0.07 * e
            );
        });
      notes(kl, (st, ch, len) => {
        const v = (st % 4 ? 0.5 : 0.68) * (0.7 + 0.08 * e);
        if (st < gap) put(s0 + st, KOTO, mid(seg(st), key, +ch), len + 3, v);
      });
      for (let st = 0; st < gap; st++) {
        const fill = end && st >= 8;
        const f = FILLS[e - 1];
        const chars = !fill
          ? groove.map((l) => l[st]).join('')
          : drop
            ? ''
            : '.' + f[1][st - 8] + '.' + f[0][st - 8];
        for (let li = 0; li < chars.length; li++) {
          const p = LINES[li][chars[li]];
          const cresc = fill ? 0.55 + 0.06 * (st - 8) : 1;
          for (let j = 0; p && j < p.length; j += 2)
            put(s0 + st, p[j], 0, 0, p[j + 1] * dv * cresc);
        }
      }
      if (b % 2 === 0) {
        const p = d.ph[ms[(b >> 1) % ms.length]];
        if (p)
          notes(p, (st, ch, len) => {
            const x = parseInt(ch, 36);
            const n = key + 12 * Math.floor(x / 5) + d.pent[x % 5];
            put(s0 + st, LEAD, n, len - 0.2, 0.7 + 0.05 * e);
            if (e > 3) put(s0 + st, SYNTH, n - 12, len - 0.2, 0.7);
          });
      }
      if (!loop) {
        if (!b) {
          put(s0, CRASH, 0, 0, 0.5 + 0.1 * e);
          put(s0, TLOW, 0, 0, 0.8 + 0.04 * e);
          put(s0, KICK, 0, 0, 1);
        } else if (e > 3 && b % 4 === 0) put(s0, CRASH, 0, 0, 0.6);
        if (d.thunder && (b ? e === 5 && b % 4 === 0 : e > 1))
          put(s0, THUNDER, 0, 0, 0.5 + 0.1 * e);
      }
      if (end && nx) {
        if (drop) put(s0 + 8, REVERSE, 0, 8, 0.55);
        else if (nx.energy > e || nx.mode !== sec.mode)
          put(s0, RISER, 0, 16, 0.2 + 0.08 * nx.energy);
      }
    }
  });
  if (!loop) {
    // The tail: one big hit on the finish line, and the last chord ringing out.
    const s0 = bar * 16;
    add(s0, CRASH, 0, 0, 0.9);
    add(s0, TLOW, 0, 0, 1);
    add(s0, KICK, 0, 0, 1);
    for (const n of voice(last, voicing, lastKey)) add(s0, PAD, n, 20, 0.6);
    add(s0, BASS, low(last, lastKey, 0), 14, 0.8);
    for (let j = 0; j < 4; j++) add(s0, KOTO, mid(last, lastKey, j), 24, 0.5);
  }
  ev.sort((a, b) => a[0] - b[0]);
  const sd = 15 / bpm;
  return {
    ev,
    sd,
    len: (bar + (loop ? 0 : 2)) * 16 * sd,
    loop,
    tn: d.tn,
    koto: [...new Set(ev.filter((e) => e[1] === KOTO).map((e) => e[2]))],
  };
}

/** Plays one compiled event at context time `t`, into the song's lanes. */
export function playEv(k: Kit, lanes: AudioNode[], e: Ev, t: number, s: Song) {
  const [, i, n, len, v] = e;
  const dur = len * s.sd;
  const out = lanes[i === PAD ? 6 + (n & 1) : CH[i]];
  if (i === REVERSE) hit(k, out, k.drums[i], t, v, k.drums[i].duration / dur);
  else if (i <= REVERSE) hit(k, out, k.drums[i], t, v);
  else if (i === BASS) bass(k, out, t, n, dur, v, s.tn[1]);
  else if (i === PAD) pad(k, out, t, n, dur, v, s.tn[2]);
  else if (i === KOTO) pluck(k, out, t, n, dur, v);
  else if (i === LEAD) lead(k, out, t, n, dur, v, s.tn[0]);
  else if (i === SYNTH) synth(k, out, t, n, dur, v);
  else riser(k, out, t, dur, v);
}
