/**
 * Dash's instruments, all synthesised: no audio files.
 *
 * Drums and koto notes are rendered once into small AudioBuffers by plain
 * loops (a few milliseconds each, the first time sound is turned on), so a
 * hit at play time costs one buffer source and one gain. The bass, pads and
 * the shakuhachi lead stay live oscillators, because they glide, swell and
 * hold for as long as the song says.
 */

const TAU = Math.PI * 2;
const exp = Math.exp;

/** MIDI note number to Hz. */
export const hz = (m: number) => 440 * 2 ** ((m - 69) / 12);

// Drum buffer ids. The sequencer's instrument ids 0..12 are these.
export const KICK = 0;
export const SNARE = 1;
export const CLAP = 2;
export const HAT = 3;
export const OHAT = 4;
export const SHAKER = 5;
export const TLOW = 6;
export const TMID = 7;
export const THIGH = 8;
export const KA = 9;
export const CRASH = 10;
export const THUNDER = 11;
export const REVERSE = 12;

export interface Kit {
  ctx: BaseAudioContext;
  /** A second of white noise: breath, risers, whooshes. */
  noise: AudioBuffer;
  /** Drum hits by the ids above. */
  drums: AudioBuffer[];
  /** A koto note (rendered on first use) and the playback rate that tunes it. */
  koto(m: number): [AudioBuffer, number];
  /**
   * Every source goes through here. Music voices (`music`) are remembered so
   * pause and stop can cut them; every voice is disconnected when it ends.
   */
  track(
    srcs: AudioScheduledSourceNode[],
    nodes: AudioNode[],
    music?: boolean
  ): void;
}

/**
 * A seeded xorshift generator (-1..1). Seeded, so the kit renders the same
 * every time (and tests repeat); xorshift, because it is only a few integer
 * operations a sample.
 */
export function rng(seed: number) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 2147483648 - 1;
  };
}

/** Fills `d` with noise from `r` (a plain loop: typed-array helpers are slower). */
function fill(d: Float32Array, r: () => number) {
  for (let i = 0; i < d.length; i++) d[i] = r();
  return d;
}

/**
 * A mono buffer `sec` long, filled by `fn`, normalised to a 0.9 peak and
 * faded over its last quarter, so a sound that is cut off at the end of its
 * buffer never clicks.
 */
function mono(
  ctx: BaseAudioContext,
  sec: number,
  fn: (d: Float32Array, sr: number) => void,
  half = false
): AudioBuffer {
  // Drums with nothing much above 5 kHz render at half the rate: half the
  // work, and the buffer source resamples for free.
  const sr = ctx.sampleRate / (half ? 2 : 1);
  const b = ctx.createBuffer(1, Math.ceil(sec * sr), sr);
  const d = b.getChannelData(0);
  fn(d, sr);
  let pk = 1e-9;
  for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i]));
  const n = d.length;
  const f0 = Math.floor(n * 0.75);
  for (let i = 0; i < n; i++)
    d[i] *=
      (0.9 / pk) *
      (i < f0 ? 1 : 0.5 + 0.5 * Math.cos((Math.PI * (i - f0)) / (n - f0)));
  return b;
}

/** An RBJ biquad run over `x` in place: 'l'ow-pass, 'h'igh-pass or 'b'and-pass. */
function biq(x: Float32Array, sr: number, type: string, f: number, q = 0.7) {
  const w = (TAU * f) / sr;
  const c = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  let b0 = al;
  let b1 = 0;
  if (type === 'l') b1 = 1 - c;
  if (type === 'h') b1 = -1 - c;
  if (type !== 'b') b0 = Math.abs(b1) / 2;
  const b2 = type === 'b' ? -al : b0;
  const a0 = 1 + al;
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 + 2 * c * y1 - (1 - al) * y2) / a0;
    x2 = x1;
    x1 = x[i];
    y2 = y1;
    x[i] = y1 = y;
  }
  return x;
}

/**
 * A drum skin: a sine whose pitch falls from f0 + df to f0, with the
 * inharmonic overtones of a real membrane (1.59× and 2.14×), plus a filtered
 * noise slap for the stick. [length s, f0, df, fall rate, decay rate,
 * overtone mix, slap cutoff Hz, slap level, slap decay rate]
 */
const SKINS = [
  [0.5, 47, 120, 32, 8, 0.12, 2800, 0.3, 260], // kick: a taiko-flavoured electronic kick
  [1, 58, 34, 10, 4.2, 0.45, 1100, 0.45, 40], // taiko low, the big "don"
  [0.7, 106, 28, 14, 6.5, 0.4, 1700, 0.4, 45], // taiko mid
  [0.45, 178, 32, 18, 9, 0.35, 2600, 0.4, 55], // taiko high
];

function skin(ctx: BaseAudioContext, r: () => number, s: number[]) {
  const [len, f0, df, fr, dr, pm, sc, sl, sd] = s;
  return mono(
    ctx,
    len,
    (d, sr) => {
      const n = biq(fill(new Float32Array(d.length), r), sr, 'l', sc);
      // Each exp(-t·rate) envelope is a running product: one multiply a sample.
      const [kf, ka, ko, ks] = [fr, dr, 3, sd].map((x) => exp(-x / sr));
      let fall = 1;
      let amp = 1;
      let ov = pm;
      let slap = sl;
      let ph = 0;
      for (let i = 0; i < d.length; i++) {
        ph += (TAU * (f0 + df * fall)) / sr;
        const over =
          ov > 1e-3
            ? ov * (Math.sin(ph * 1.593) + 0.6 * Math.sin(ph * 2.135))
            : 0;
        d[i] =
          amp * Math.min(1, (i * 3000) / sr) * (Math.sin(ph) + over) +
          slap * n[i];
        fall *= kf;
        amp *= ka;
        ov *= ko;
        slap *= ks;
      }
    },
    true
  );
}

// The 808's six inharmonic square waves: the clang inside a hat or a cymbal.
const METAL = [205.3, 304.4, 369.6, 522.7, 540, 800];

/**
 * Filtered noise (with optional metal) under an attack of `att` seconds and
 * an exponential decay: hats, shakers, cymbals.
 */
function hiss(
  ctx: BaseAudioContext,
  r: () => number,
  len: number,
  type: string,
  f: number,
  q: number,
  att: number,
  dec: number,
  metal = 0
) {
  return mono(ctx, len, (d, sr) => {
    const ph = [0, 0, 0, 0, 0, 0];
    const inc = METAL.map((x) => (x * metal) / sr);
    for (let i = 0; i < d.length; i++) {
      let m = 0;
      if (metal)
        for (let j = 0; j < 6; j++) {
          if ((ph[j] += inc[j]) >= 1) ph[j]--;
          m += ph[j] < 0.5 ? 0.12 : -0.12;
        }
      d[i] = r() * (metal ? 0.5 : 1) + m;
    }
    biq(d, sr, type, f, q);
    const k = exp(-dec / sr);
    for (let i = 0, e = 1; i < d.length; i++, e *= k)
      d[i] *= e * Math.min(1, i / (att * sr));
  });
}

/**
 * The drum kit as a list of jobs, one buffer each and a few milliseconds
 * apiece, run in order (they share one seeded generator). The engine runs
 * them between frames, so turning sound on never stalls the game.
 * Results are in the order of the drum ids.
 */
export function drumJobs(ctx: BaseAudioContext): (() => AudioBuffer)[] {
  const r = rng(7);
  let crash: AudioBuffer | null = null;
  return [
    () => skin(ctx, r, SKINS[0]),
    () =>
      mono(ctx, 0.3, (d, sr) => {
        const n = biq(fill(new Float32Array(d.length), r), sr, 'b', 2600, 0.6);
        for (let i = 0; i < d.length; i++) {
          const t = i / sr;
          d[i] =
            0.55 * Math.sin(TAU * 185 * t) * exp(-t * 26) + n[i] * exp(-t * 15);
        }
      }),
    // Three quick bursts, then a tail: the hands of a clap never land together.
    () =>
      mono(ctx, 0.35, (d, sr) => {
        biq(fill(d, r), sr, 'b', 1150, 1.3);
        for (let i = 0; i < d.length; i++) {
          const t = i / sr;
          d[i] *=
            t < 0.034 ? exp(-(t % 0.0115) * 320) : 0.7 * exp(-(t - 0.034) * 15);
        }
      }),
    () => hiss(ctx, r, 0.09, 'h', 7200, 0.8, 0.0002, 60, 1),
    () => hiss(ctx, r, 0.5, 'h', 7000, 0.8, 0.0002, 7, 1),
    () => hiss(ctx, r, 0.14, 'b', 6200, 1.2, 0.012, 32),
    () => skin(ctx, r, SKINS[1]),
    () => skin(ctx, r, SKINS[2]),
    () => skin(ctx, r, SKINS[3]),
    // The rim of a taiko struck with the stick: two wood modes and a click.
    () =>
      mono(ctx, 0.12, (d, sr) => {
        const n = biq(fill(new Float32Array(d.length), r), sr, 'h', 2200);
        for (let i = 0; i < d.length; i++) {
          const t = i / sr;
          d[i] =
            exp(-t * 70) *
              (Math.sin(TAU * 1720 * t) + 0.6 * Math.sin(TAU * 2580 * t)) +
            n[i] * exp(-t * 120);
        }
      }),
    () => (crash = hiss(ctx, r, 1.4, 'h', 3800, 0.6, 0.0017, 2.3, 1.7)),
    // Thunder: a crack, then brown noise that rolls on with a slow random swell.
    () =>
      mono(
        ctx,
        2.2,
        (d, sr) => {
          const crack = biq(fill(new Float32Array(d.length), r), sr, 'h', 1200);
          const k = exp(-1.2 / sr);
          const kc = exp(-1 / sr / 0.09);
          let br = 0;
          let sw = 0;
          let swv = 0;
          let e = 1;
          let ec = 0.5;
          for (let i = 0; i < d.length; i++, e *= k) {
            br = br * 0.995 + r() * 0.1;
            if (i % 2000 === 0) swv = 0.5 + 0.5 * r();
            sw += (swv - sw) * 0.0004;
            d[i] = br * (0.5 + sw) * Math.min(1, (i * 20) / sr) * e;
          }
          biq(d, sr, 'l', 420);
          for (let i = 0; i < d.length; i++, ec *= kc) d[i] += crack[i] * ec;
        },
        true
      ),
    // The crash, backwards: the swell into a drop.
    () => {
      const c = crash!;
      const b = ctx.createBuffer(1, c.length, c.sampleRate);
      b.getChannelData(0).set(c.getChannelData(0).slice().reverse());
      return b;
    },
  ];
}

/** A second of white noise. */
export function renderNoise(ctx: BaseAudioContext) {
  const r = rng(3);
  const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = r();
  return b;
}

/**
 * A koto string by Karplus-Strong: a burst of noise circulating in a delay
 * line one period long, averaged on each pass, so the highs die first, the
 * way a plucked string's do. The delay is a whole number of samples, so the
 * pitch is trimmed with the playback rate. `bright` (0..1) is how much top
 * the plectrum leaves in the burst.
 */
export function renderKoto(
  ctx: BaseAudioContext,
  m: number,
  bright: number
): [AudioBuffer, number] {
  const r = rng(m + 11);
  const sr = ctx.sampleRate;
  const f = hz(m);
  const n = Math.round(sr / f + 0.5);
  const t60 = Math.min(2, Math.max(0.5, 1.5 * (220 / f) ** 0.4));
  const g = 0.001 ** (1 / (f * t60));
  const line = new Float32Array(n);
  let lp = 0;
  for (let i = 0; i < n; i++) line[i] = lp += (r() - lp) * bright;
  // Plucked near the bridge: a comb takes out the harmonics a centre pluck would keep.
  const cut = Math.max(1, Math.round(n * 0.13));
  for (let i = n - 1; i >= cut; i--) line[i] -= line[i - cut];
  const b = mono(ctx, Math.min(t60, 1.3), (d) => {
    let p = 0;
    for (let i = 0; i < d.length; i++) {
      const q = (p + 1) % n;
      d[i] = line[p];
      line[p] = g * 0.5 * (line[p] + line[q]);
      p = q;
    }
  });
  // The loop's delay is n - 0.5 samples (the average sits between two taps).
  return [b, (f * (n - 0.5)) / sr];
}

// ── Live voices ─────────────────────────────────────────────────────────────

function osc(c: BaseAudioContext, type: OscillatorType, f: number, t: number) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.start(t);
  return o;
}

export function gain(c: BaseAudioContext, v: number) {
  const g = c.createGain();
  g.gain.value = v;
  return g;
}

export function filt(
  c: BaseAudioContext,
  type: BiquadFilterType,
  f: number,
  q = 0.7
) {
  const b = c.createBiquadFilter();
  b.type = type;
  b.frequency.value = f;
  b.Q.value = q;
  return b;
}

function noiseSrc(k: Kit, t: number, off: number) {
  const n = k.ctx.createBufferSource();
  n.buffer = k.noise;
  n.loop = true;
  n.start(t, off % 0.9);
  return n;
}

/** A one-shot buffer: a drum hit, or (with `rate`) a reversed cymbal fitted to a length. */
export function hit(
  k: Kit,
  out: AudioNode,
  b: AudioBuffer,
  t: number,
  v: number,
  rate = 1
) {
  const s = k.ctx.createBufferSource();
  s.buffer = b;
  s.playbackRate.value = rate;
  const a = gain(k.ctx, v);
  s.connect(a).connect(out);
  s.start(t);
  k.track([s], [a]);
}

/** A koto note, let ring for `dur` seconds and then damped. */
export function pluck(
  k: Kit,
  out: AudioNode,
  t: number,
  m: number,
  dur: number,
  v: number
) {
  const [b, rate] = k.koto(m);
  const s = k.ctx.createBufferSource();
  s.buffer = b;
  s.playbackRate.value = rate;
  // Damp it in time for the release to finish inside the buffer.
  const end = t + Math.min(dur, b.duration / rate - 0.3);
  const a = gain(k.ctx, v);
  a.gain.setTargetAtTime(0, end, 0.05);
  s.connect(a).connect(out);
  s.start(t);
  s.stop(end + 0.3);
  k.track([s], [a]);
}

/**
 * The shakuhachi. A soft triangle that scoops up into the note from a little
 * flat, a puff of band-passed breath at the attack that settles to a hiss,
 * and a vibrato that only arrives once the note has been held, as a player's
 * does. `reed` swaps the triangle for a filtered sawtooth: an edgier lead.
 */
export function lead(
  k: Kit,
  out: AudioNode,
  t: number,
  m: number,
  dur: number,
  v: number,
  reed: number
) {
  const c = k.ctx;
  const f = hz(m);
  const end = t + dur;
  const o = osc(c, reed ? 'sawtooth' : 'triangle', f * 0.97, t);
  o.frequency.setTargetAtTime(f, t, 0.025);
  const lfo = osc(c, 'sine', 5.2, t);
  const dep = gain(c, 0);
  dep.gain.setTargetAtTime(f * 0.011, t + 0.25, 0.12);
  lfo.connect(dep).connect(o.frequency);
  const lp = filt(c, 'lowpass', reed ? 2200 : 3400);
  const n = noiseSrc(k, t, m * 0.137);
  const bp = filt(c, 'bandpass', f * 1.5, 1.4);
  const nb = gain(c, 0);
  nb.gain.setTargetAtTime(v * 1.6, t, 0.006);
  nb.gain.setTargetAtTime(v * 0.45, t + 0.03, 0.08);
  const a = gain(c, 0);
  a.gain.setTargetAtTime(v, t, 0.018);
  a.gain.setTargetAtTime(0, end, 0.045);
  o.connect(lp).connect(a);
  n.connect(bp).connect(nb).connect(a);
  a.connect(out);
  for (const s of [o, lfo, n]) s.stop(end + 0.3);
  k.track([o, lfo, n], [dep, lp, bp, nb, a]);
}

/** The synthwave double under the lead in the loud sections: a filtered sawtooth. */
export function synth(
  k: Kit,
  out: AudioNode,
  t: number,
  m: number,
  dur: number,
  v: number
) {
  const c = k.ctx;
  const o = osc(c, 'sawtooth', hz(m), t);
  const lp = filt(c, 'lowpass', 1700, 1.5);
  const a = gain(c, 0);
  a.gain.setTargetAtTime(v, t, 0.01);
  a.gain.setTargetAtTime(0, t + dur, 0.04);
  o.connect(lp).connect(a).connect(out);
  o.stop(t + dur + 0.25);
  k.track([o], [lp, a]);
}

/** A warm bass: a sawtooth whose filter closes after the attack, over a sine sub. */
export function bass(
  k: Kit,
  out: AudioNode,
  t: number,
  m: number,
  dur: number,
  v: number,
  cut: number
) {
  const c = k.ctx;
  const f = hz(m);
  const o = osc(c, 'sawtooth', f, t);
  const s = osc(c, 'sine', f, t);
  const lp = filt(c, 'lowpass', cut * 3, 2.5);
  lp.frequency.setTargetAtTime(cut, t, 0.07);
  const sg = gain(c, 0.55);
  const a = gain(c, 0);
  a.gain.setTargetAtTime(v, t, 0.004);
  a.gain.setTargetAtTime(v * 0.7, t + 0.03, 0.2);
  a.gain.setTargetAtTime(0, t + dur, 0.02);
  o.connect(lp).connect(a);
  s.connect(sg).connect(a);
  a.connect(out);
  o.stop(t + dur + 0.15);
  s.stop(t + dur + 0.15);
  k.track([o, s], [lp, sg, a]);
}

/** One pad voice: two sawtooths a few cents apart (the chorus), softened, slow in and out. */
export function pad(
  k: Kit,
  out: AudioNode,
  t: number,
  m: number,
  dur: number,
  v: number,
  cut: number
) {
  const c = k.ctx;
  const f = hz(m);
  const o1 = osc(c, 'sawtooth', f, t);
  const o2 = osc(c, 'sawtooth', f, t);
  o1.detune.value = -9;
  o2.detune.value = 9;
  const lp = filt(c, 'lowpass', cut, 0.5);
  const a = gain(c, 0);
  a.gain.setTargetAtTime(v, t, 0.12);
  a.gain.setTargetAtTime(0, t + dur, 0.2);
  o1.connect(lp);
  o2.connect(lp).connect(a).connect(out);
  o1.stop(t + dur + 1.5);
  o2.stop(t + dur + 1.5);
  k.track([o1, o2], [lp, a]);
}

/** A noise riser: a band-pass sweeping up while it swells, cut dead on the downbeat. */
export function riser(
  k: Kit,
  out: AudioNode,
  t: number,
  dur: number,
  v: number
) {
  const c = k.ctx;
  const n = noiseSrc(k, t, t);
  const bp = filt(c, 'bandpass', 300, 3);
  bp.frequency.setValueAtTime(300, t);
  bp.frequency.exponentialRampToValueAtTime(6000, t + dur);
  const a = gain(c, 0.0001);
  a.gain.setValueAtTime(0.0001, t);
  a.gain.exponentialRampToValueAtTime(v, t + dur - 0.01);
  a.gain.linearRampToValueAtTime(0, t + dur);
  n.connect(bp).connect(a).connect(out);
  n.stop(t + dur + 0.02);
  k.track([n], [bp, a]);
}
