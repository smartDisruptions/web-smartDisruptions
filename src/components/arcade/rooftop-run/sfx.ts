/**
 * Kiru's Rooftop Run — sound. A handful of WebAudio blips synthesised on the
 * spot: no files, nothing to fetch. OFF by default, and the AudioContext is
 * only created when a player turns sound on (which is a user gesture, so the
 * browser lets it start). The choice is not remembered: every visit starts
 * silent.
 */
export class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  on = false;

  setOn(on: boolean) {
    this.on = on;
    if (!on) {
      void this.ctx?.suspend().catch(() => {});
      return;
    }
    try {
      if (!this.ctx) {
        const AC =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.32;
        this.master.connect(this.ctx.destination);
      }
      void this.ctx.resume().catch(() => {});
    } catch {
      this.on = false;
    }
  }

  /** One oscillator with a pitch sweep and a quick decay. */
  private tone(f0: number, f1: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
    const ctx = this.ctx;
    if (!this.on || !ctx || !this.master || ctx.state !== 'running') return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number, freq: number) {
    const ctx = this.ctx;
    if (!this.on || !ctx || !this.master || ctx.state !== 'running') return;
    if (!this.noiseBuf) {
      const len = Math.floor(ctx.sampleRate * 0.4);
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(freq, t);
    f.frequency.exponentialRampToValueAtTime(120, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  jump() {
    this.tone(330, 660, 0.13, 'square', 0.09);
  }
  doubleJump() {
    this.tone(520, 1180, 0.16, 'triangle', 0.13);
    this.noise(0.12, 0.05, 2400);
  }
  coin() {
    this.tone(988, 988, 0.07, 'square', 0.06);
    this.tone(1319, 1319, 0.16, 'square', 0.06, 0.06);
  }
  shuriken() {
    this.tone(784, 784, 0.08, 'triangle', 0.12);
    this.tone(1175, 1175, 0.08, 'triangle', 0.12, 0.07);
    this.tone(1568, 1568, 0.22, 'triangle', 0.12, 0.14);
  }
  land() {
    this.noise(0.07, 0.07, 700);
  }
  hit() {
    this.noise(0.35, 0.22, 1800);
    this.tone(220, 55, 0.4, 'sawtooth', 0.09);
  }
  fall() {
    this.tone(660, 90, 0.7, 'triangle', 0.1);
  }
  best() {
    [659, 784, 988, 1319].forEach((f, i) => this.tone(f, f, 0.14, 'square', 0.05, i * 0.09));
  }

  destroy() {
    void this.ctx?.close().catch(() => {});
    this.ctx = null;
  }
}
