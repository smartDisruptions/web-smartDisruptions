import type { SfxId } from '../types';
import type { Kit } from './synth';
import { filt, gain, CRASH, TMID } from './synth';

/**
 * Sound effects. Short and punchy, and pitched away from the songs (most
 * sit above the melody, or are noise), so they read over any section. They
 * play on their own bus, so stopping the music never cuts one off.
 */
export function playSfx(k: Kit, out: AudioNode, id: SfxId) {
  const c = k.ctx;
  const t0 = c.currentTime + 0.004;

  /** One oscillator sweeping f0 → f1 over `dur`, with a 5 ms attack and a fast decay. */
  const tone = (
    f0: number,
    f1: number,
    dur: number,
    type: OscillatorType,
    v: number,
    at = 0
  ) => {
    const t = t0 + at;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = gain(c, 0);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 0.02);
    k.track([o], [g], false);
  };

  /**
   * Noise through a filter sweeping f0 → f1. It rises for `att` seconds and
   * then dies away; if `att` is the whole length it only rises, and stops
   * dead: a whoosh played backwards.
   */
  const noise = (
    type: BiquadFilterType,
    f0: number,
    f1: number,
    dur: number,
    v: number,
    att: number,
    at = 0
  ) => {
    const t = t0 + at;
    const n = c.createBufferSource();
    n.buffer = k.noise;
    n.loop = true;
    const f = filt(c, type, f0, 1.2);
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = gain(c, 0);
    g.gain.setValueAtTime(0.001, t);
    if (att < dur) {
      g.gain.linearRampToValueAtTime(v, t + att);
      g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    } else {
      g.gain.exponentialRampToValueAtTime(v, t + dur - 0.01);
      g.gain.linearRampToValueAtTime(0, t + dur);
    }
    n.connect(f).connect(g).connect(out);
    n.start(t, (t * 7.31) % 0.9);
    n.stop(t + dur + 0.02);
    k.track([n], [f, g], false);
  };

  const drum = (i: number, v: number, at = 0) => {
    const s = c.createBufferSource();
    s.buffer = k.drums[i];
    const g = gain(c, v);
    s.connect(g).connect(out);
    s.start(t0 + at);
    k.track([s], [g], false);
  };

  /** Notes of a chord or a run, `gap` seconds apart. */
  const run = (
    fs: number[],
    gap: number,
    dur: number,
    type: OscillatorType,
    v: number,
    at = 0
  ) => fs.forEach((f, i) => tone(f, f, dur, type, v, at + i * gap));

  switch (id) {
    case 'jump':
      tone(330, 660, 0.09, 'triangle', 0.2);
      noise('bandpass', 900, 2600, 0.08, 0.08, 0.02);
      break;
    case 'land':
      tone(150, 55, 0.09, 'sine', 0.35);
      noise('lowpass', 900, 200, 0.07, 0.16, 0.003);
      break;
    case 'orb':
      // A bright ping: a chirp into a bell-like stack (G6, D7, G7).
      tone(1200, 2400, 0.04, 'triangle', 0.1);
      tone(1568, 1568, 0.3, 'sine', 0.24, 0.02);
      tone(2349, 2349, 0.22, 'sine', 0.1, 0.02);
      tone(3136, 3136, 0.12, 'sine', 0.05, 0.02);
      break;
    case 'pad':
      // A taiko struck, and the skin's boing as it throws him up.
      drum(TMID, 0.75);
      tone(120, 420, 0.24, 'sine', 0.4);
      break;
    case 'gate':
      noise('bandpass', 400, 3200, 0.42, 0.3, 0.15);
      tone(1319, 1319, 0.7, 'sine', 0.15, 0.08);
      tone(1976, 1976, 0.55, 'sine', 0.09, 0.08);
      break;
    case 'speed':
      noise('bandpass', 300, 6000, 0.45, 0.3, 0.3);
      tone(220, 880, 0.4, 'sawtooth', 0.05);
      break;
    case 'scroll':
      // A sparkle: D major, rolled upward fast, with a glint on top.
      run([1175, 1480, 1760, 2349], 0.045, 0.55, 'sine', 0.13);
      tone(4699, 4699, 0.3, 'sine', 0.03, 0.18);
      break;
    case 'flap':
      noise('lowpass', 1400, 300, 0.1, 0.2, 0.01);
      tone(260, 180, 0.07, 'sine', 0.12);
      break;
    case 'flip':
      tone(880, 440, 0.12, 'square', 0.05);
      tone(440, 990, 0.12, 'sine', 0.2);
      break;
    case 'teleport':
      noise('bandpass', 1000, 4500, 0.22, 0.3, 0.22);
      tone(1760, 2637, 0.08, 'sine', 0.14, 0.22);
      break;
    case 'death':
      // A crunch (bright noise, a falling buzz), then the ink splat: a dark
      // wet burst and a plop.
      noise('highpass', 1800, 900, 0.14, 0.45, 0.002);
      tone(260, 40, 0.35, 'sawtooth', 0.22);
      tone(180, 60, 0.12, 'square', 0.12);
      noise('lowpass', 1600, 120, 0.32, 0.42, 0.004, 0.03);
      tone(420, 90, 0.16, 'sine', 0.32, 0.02);
      break;
    case 'complete':
      // A short fanfare up the yo scale, a held chord and a cymbal.
      run([587, 659, 784, 880], 0.08, 0.14, 'square', 0.06);
      run([587, 659, 784, 880], 0.08, 0.14, 'triangle', 0.12);
      run([1175, 1480, 1760], 0, 0.9, 'triangle', 0.1, 0.34);
      drum(CRASH, 0.35, 0.34);
      break;
    case 'checkpoint':
      tone(1319, 1319, 0.12, 'triangle', 0.15);
      tone(1760, 1760, 0.3, 'sine', 0.17, 0.07);
      break;
    case 'newBest':
      run([1047, 1319, 1568, 2093], 0.065, 0.22, 'triangle', 0.11);
      tone(2093, 2093, 0.5, 'sine', 0.09, 0.26);
      break;
    case 'click':
      tone(1900, 1500, 0.025, 'sine', 0.18);
      break;
  }
}
