import { gain, filt, rng } from './synth';

/**
 * The mix. Every music voice plays into a lane; lanes feed channel strips
 * (level, pan, reverb and echo sends); strips feed the music bus. Sound
 * effects have their own bus, a little louder than the music, so a jump is
 * never lost under a chorus. Both buses meet in a gentle compressor (the
 * glue), then a limiter and a final safety gain keep the peak under -1 dBFS.
 *
 * A song's lanes are made fresh for each start. Stopping fades the old lanes
 * out over 30 ms, while the next song can start at once on new ones, so a
 * practice respawn never clicks or waits.
 */

// Channel strips: [level, pan, reverb send, echo send]
const STRIPS = [
  [0.85, 0, 0.04, 0], // 0 kick
  [0.42, 0.08, 0.22, 0], // 1 snare, clap
  [0.2, 0.28, 0.08, 0], // 2 hats, shaker
  [0.62, -0.12, 0.16, 0], // 3 taiko
  [0.26, -0.05, 0.25, 0], // 4 cymbals
  [0.5, 0, 0.02, 0], // 5 bass
  [0.075, -0.55, 0.32, 0], // 6 pad, left
  [0.075, 0.55, 0.32, 0], // 7 pad, right
  [0.3, -0.3, 0.22, 0.16], // 8 koto
  [0.28, 0.06, 0.3, 0.2], // 9 lead
  [0.07, 0.18, 0.2, 0.12], // 10 synth double
  [0.3, 0, 0.3, 0], // 11 risers, thunder
];

export interface Mixer {
  ctx: BaseAudioContext;
  /** Sound effects play into this. */
  sfx: GainNode;
  /** The reverb and echo returns: dipped on stop so tails don't hang over a restart. */
  fx: GainNode;
  /** The echo: the engine sets it to a dotted eighth of each song. */
  echo: DelayNode;
  rev: ConvolverNode;
  strips: AudioNode[];
}

/** A small hall: decaying stereo noise, darker as it fades, as a real room's tail is. */
function hall(ctx: BaseAudioContext, sec: number) {
  const sr = ctx.sampleRate;
  const b = ctx.createBuffer(2, Math.ceil(sec * sr), sr);
  for (let ch = 0; ch < 2; ch++) {
    const r = rng(ch + 5);
    const d = b.getChannelData(ch);
    const k = Math.exp(-4.8 / sr);
    let lp = 0;
    let e = 0.5;
    for (let i = 0; i < d.length; i++, e *= k) {
      lp += (r() - lp) * (0.9 - (0.75 * i) / d.length);
      d[i] = i < 0.012 * sr ? 0 : lp * e;
    }
  }
  return b;
}

export function createMixer(ctx: BaseAudioContext): Mixer {
  const safety = gain(ctx, 0.7);
  safety.connect(ctx.destination);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -10;
  comp.knee.value = 12;
  comp.ratio.value = 2.5;
  comp.attack.value = 0.003;
  comp.release.value = 0.25;
  // Then a limiter, fast and hard, that only touches the rare peak: a
  // downbeat hit with a sound effect on top.
  const lim = ctx.createDynamicsCompressor();
  lim.threshold.value = -2;
  lim.knee.value = 0;
  lim.ratio.value = 20;
  lim.attack.value = 0.001;
  lim.release.value = 0.1;
  comp.connect(lim).connect(safety);
  const music = gain(ctx, 0.55);
  music.connect(comp);
  const sfx = gain(ctx, 0.9);
  sfx.connect(comp);
  const fx = gain(ctx, 1);
  fx.connect(music);
  // The hall's impulse is set later (fillHall): the convolver transforms it
  // when it is set, which is worth keeping out of the click that turns sound on.
  const rev = ctx.createConvolver();
  rev.connect(fx);
  // Echo with a darkening feedback loop, so repeats sink behind the lead.
  const echo = ctx.createDelay(1);
  const fb = gain(ctx, 0.3);
  const dark = filt(ctx, 'lowpass', 2600);
  echo.connect(dark).connect(fb).connect(echo);
  dark.connect(fx);
  const strips = STRIPS.map(([lvl, pan, rs, es]) => {
    const g = gain(ctx, lvl);
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    g.connect(p).connect(music);
    g.connect(gain(ctx, rs)).connect(rev);
    if (es) g.connect(gain(ctx, es)).connect(echo);
    return g;
  });
  return { ctx, sfx, fx, echo, rev, strips };
}

/** Gives the reverb its impulse: a small hall, 1.1 s (the tail is -50 dB by then). */
export function fillHall(m: Mixer) {
  m.rev.buffer = hall(m.ctx, 1.1);
}

/** Fresh lanes into the strips, for one song start. */
export function openLanes(m: Mixer): GainNode[] {
  const t = m.ctx.currentTime;
  m.fx.gain.cancelScheduledValues(t);
  m.fx.gain.setTargetAtTime(1, t, 0.02);
  return m.strips.map((s) => {
    const g = gain(m.ctx, 1);
    g.connect(s);
    return g;
  });
}

/** Fades lanes out in 30 ms (no click), then lets them go. */
export function closeLanes(m: Mixer, lanes: GainNode[]) {
  const t = m.ctx.currentTime;
  for (const g of lanes) {
    g.gain.setValueAtTime(1, t);
    g.gain.linearRampToValueAtTime(0, t + 0.03);
  }
  m.fx.gain.cancelScheduledValues(t);
  m.fx.gain.setTargetAtTime(0, t, 0.05);
  setTimeout(() => lanes.forEach((g) => g.disconnect()), 120);
}
