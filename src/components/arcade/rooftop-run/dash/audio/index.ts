import type { DashAudio, LevelId } from '../types';
import { levelMeta } from '../levels/meta';
import { closeLanes, createMixer, fillHall, openLanes } from './mixer';
import type { Mixer } from './mixer';
import { compile, playEv, KOTO, PAD } from './sequencer';
import type { Ev, Song, SongData } from './sequencer';
import { drumJobs, renderKoto, renderNoise, HAT, SHAKER } from './synth';
import type { Kit } from './synth';
import { playSfx } from './sfx';
import firstLight from './songs/first-light';
import lanternRow from './songs/lantern-row';
import moonGate from './songs/moon-gate';
import stormRoofs from './songs/storm-roofs';
import dragonFestival from './songs/dragon-festival';
import shadowDojo from './songs/shadow-dojo';
import menuSong from './songs/menu';

/**
 * Dash's music and sound effects, all synthesised in WebAudio.
 *
 * OFF until the player turns sound on: no AudioContext exists before that
 * click, and nothing is fetched, ever. The runtime calls play, pause,
 * resume and stop whether sound is on or not, and this module keeps the
 * song's position on the page clock (performance.now) the whole time, so
 * turning sound on halfway through a run starts the music at the right bar,
 * in time with the level.
 *
 * Scheduling is the usual lookahead pattern: every 25 ms, queue the notes
 * due in the next 120 ms at exact AudioContext times. Song time is level
 * time, so the AudioContext origin is worked out from the level clock, and
 * re-worked if the two clocks drift apart.
 */

const SONGS: Record<LevelId, SongData> = {
  'first-light': firstLight,
  'lantern-row': lanternRow,
  'moon-gate': moonGate,
  'storm-roofs': stormRoofs,
  'dragon-festival': dragonFestival,
  'shadow-dojo': shadowDojo,
};

type SongId = LevelId | 'menu';

const LOOKAHEAD = 0.12;
const TICK_MS = 25;
/** The screen shows a frame about this long after it is drawn; the music waits for it. */
const DISPLAY_LAG = 0.016;
/**
 * Each DynamicsCompressor looks 6 ms ahead (in Chrome, Firefox and Safari
 * alike), so everything leaves the master's two (compressor and limiter)
 * 12 ms late. The scheduler plays that much early, so a note lands on its
 * sixteenth.
 */
const COMP_DELAY = 0.012;
/** Past this many live music voices, hats, shakers and koto give way, so a slow phone keeps time. */
const MAX_VOICES = 90;

const cache = new Map<SongId, Song>();

/** A song, compiled once per page: the level's sections and tempo, the song's patterns. */
export function getSong(id: SongId): Song {
  let s = cache.get(id);
  if (!s) {
    if (id === 'menu')
      s = compile(menuSong, [{ bars: 8, energy: 1 }], menuSong.bpm ?? 88, true);
    else {
      const m = levelMeta(id);
      s = compile(SONGS[id], m.sections, m.bpm);
    }
    cache.set(id, s);
  }
  return s;
}

/** Everything that lives on one AudioContext: the mix, the kit, the live voices. */
interface Rig {
  ctx: BaseAudioContext;
  mix: Mixer;
  kit: Kit;
  live: Set<AudioScheduledSourceNode[]>;
  /** Koto brightness of the song now playing (part of the note cache's key). */
  bright: number;
  /** The kit has rendered: until then the scheduler and the effects wait. */
  ready: boolean;
}

/**
 * Builds a rig. The kit renders as a queue of small jobs (a few ms each):
 * all at once for an offline render (`now`), or one job per task in the
 * browser, so the click that turns sound on stays instant and the game
 * never drops a frame for it. Koto notes render when first played.
 */
function rig(ctx: BaseAudioContext, now = false): Rig {
  const live = new Set<AudioScheduledSourceNode[]>();
  const kotos = new Map<number, [AudioBuffer, number]>();
  const mix = createMixer(ctx);
  const drums: AudioBuffer[] = [];
  const r: Rig = {
    ctx,
    mix,
    live,
    bright: 0.6,
    ready: false,
    kit: {
      ctx,
      noise: renderNoise(ctx),
      drums,
      koto(m) {
        const id = m + 128 * Math.round(r.bright * 20);
        let b = kotos.get(id);
        if (!b) kotos.set(id, (b = renderKoto(ctx, m, r.bright)));
        return b;
      },
      track(srcs, nodes, music = true) {
        if (music) live.add(srcs);
        srcs[0].onended = () => {
          live.delete(srcs);
          for (const n of [...srcs, ...nodes]) n.disconnect();
        };
      },
    },
  };
  const jobs = [
    ...drumJobs(ctx).map((j) => () => {
      drums.push(j());
    }),
    () => fillHall(mix),
  ];
  const next = () => {
    if (ctx.state === 'closed') return;
    const j = jobs.shift();
    if (!j) r.ready = true;
    else {
      j();
      if (!now) setTimeout(next, 0);
    }
  };
  if (now) while (!r.ready) next();
  else setTimeout(next, 0);
  return r;
}

/** Sets a rig up for a song: its koto tone, its echo a dotted eighth. */
function prepare(r: Rig, s: Song) {
  r.bright = s.tn[3];
  r.mix.echo.delayTime.value = s.sd * 3;
}

/** A cursor through a song's notes, in song seconds, wrapping if the song loops. */
function cursor(s: Song) {
  let i = 0;
  let base = 0;
  return {
    /** Skips to the first note at or after song time q. */
    seek(q: number) {
      base = s.loop ? Math.floor(q / s.len) * s.len : 0;
      i = 0;
      while (i < s.ev.length && base + s.ev[i][0] * s.sd < q) i++;
    },
    /** Hands out each note due before song time `until`, in order. */
    take(until: number, fn: (e: Ev, at: number) => void) {
      for (;;) {
        if (i >= s.ev.length) {
          if (!s.loop) return;
          i = 0;
          base += s.len;
        }
        const e = s.ev[i];
        const at = base + e[0] * s.sd;
        if (at >= until) return;
        i++;
        fn(e, at);
      }
    },
  };
}

export interface AudioJoin {
  /** Song position (s) when the scheduler joined. */
  pos: number;
  /** The bar (0-based) and beat (0..4) it joined at. */
  bar: number;
  beat: number;
  /** Song time (s) of the first note it then scheduled. */
  first: number;
}

export function createDashAudio(): DashAudio {
  let r: Rig | null = null;
  let on = false;
  /** The song the runtime wants playing (whether or not sound is on). */
  let want: SongId | null = null;
  let song: Song | null = null;
  /** The song clock: at page time wall0 (ms) the song was at pos0 (s), moving or not. */
  let moving = false;
  let pos0 = 0;
  let wall0 = 0;
  let lanes: GainNode[] | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let cur: ReturnType<typeof cursor> | null = null;
  /** AudioContext time of song time 0, or null until the first tick after a start. */
  let origin: number | null = null;
  const joins: AudioJoin[] = [];

  const pos = () => (moving ? pos0 + (performance.now() - wall0) / 1000 : pos0);
  const anchor = (p: number) => {
    pos0 = p;
    wall0 = performance.now();
  };

  /** Cuts the music at once (30 ms fades); the reverb tails die naturally. */
  function silence() {
    clearInterval(timer);
    timer = undefined;
    if (!r || !lanes) return;
    closeLanes(r.mix, lanes);
    lanes = null;
    const t = r.ctx.currentTime + 0.04;
    for (const srcs of r.live)
      for (const s of srcs)
        try {
          s.stop(t);
        } catch {
          // Already stopped: nothing to do.
        }
    r.live.clear();
  }

  /** (Re)starts the wanted song on fresh lanes. The first tick finds the bar. */
  function begin() {
    silence();
    if (!on || !r || !want) return;
    song = getSong(want);
    prepare(r, song);
    lanes = openLanes(r.mix);
    cur = cursor(song);
    origin = null;
    timer = setInterval(tick, TICK_MS);
    tick();
  }

  function tick() {
    const ctx = r?.ctx as AudioContext | undefined;
    if (!r?.ready || !ctx || !song || !lanes || !cur) return;
    if (ctx.state !== 'running') return;
    const now = ctx.currentTime;
    const p = pos();
    const out = Math.min(0.25, ctx.outputLatency || ctx.baseLatency || 0);
    const o = now - p - out - COMP_DELAY + DISPLAY_LAG;
    if (origin === null) {
      // Joining: start at the first note still ahead, and bring in the pads
      // already held at this point, so a mid-bar entry is never bare.
      origin = o;
      const q = now + 0.005 - o;
      cur.seek(q);
      const bar = 16 * song.sd;
      const inLoop = song.loop ? q % song.len : q;
      let first = -1;
      cur.take(q + 0.5, (_, at) => {
        if (first < 0) first = at;
      });
      cur.seek(q);
      joins.push({
        pos: p,
        bar: Math.floor(inLoop / bar),
        beat: (inLoop % bar) / (4 * song.sd),
        first,
      });
      if (joins.length > 20) joins.shift();
      for (const e of song.ev) {
        const at = e[0] * song.sd;
        const left = (e[0] + e[3]) * song.sd - inLoop;
        if (e[1] === PAD && at < inLoop && left > 0.2)
          playEv(
            r.kit,
            lanes,
            [0, PAD, e[2], left / song.sd, e[4]],
            now + 0.01,
            song
          );
      }
    } else if (Math.abs(o - origin) > 0.03) {
      // The two clocks drifted (a throttled tab, a device clock): follow the level.
      origin = o;
    }
    const base = origin;
    const rr = r;
    const ll = lanes;
    const sg = song;
    cur.take(now + LOOKAHEAD - base, (e, at) => {
      const t = base + at;
      if (t < now) return;
      const i = e[1];
      if (
        rr.live.size > MAX_VOICES &&
        ((i >= HAT && i <= SHAKER) || i === KOTO)
      )
        return;
      playEv(rr.kit, ll, e, t, sg);
    });
  }

  // `joins` and `voices` are for tests and the dev overlay, not the runtime.
  const api: DashAudio & {
    readonly joins: AudioJoin[];
    readonly voices: number;
  } = {
    get on() {
      return on;
    },
    joins,
    get voices() {
      return r ? r.live.size : 0;
    },
    setOn(v) {
      on = v;
      if (!v) {
        silence();
        const ctx = r?.ctx as AudioContext | undefined;
        setTimeout(() => {
          if (!on) void ctx?.suspend().catch(() => {});
        }, 80);
        return;
      }
      try {
        if (!r) {
          const AC =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (!AC) {
            on = false;
            return;
          }
          const ctx = new AC({ latencyHint: 'interactive' });
          // iOS unlocks output for a context that starts a sound inside the gesture.
          const s = ctx.createBufferSource();
          s.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
          s.connect(ctx.destination);
          s.start();
          r = rig(ctx);
        }
        void (r.ctx as AudioContext).resume().catch(() => {});
        begin();
      } catch {
        on = false;
      }
    },
    play(level, fromSec) {
      want = level;
      moving = true;
      anchor(fromSec);
      begin();
    },
    stop() {
      want = null;
      moving = false;
      silence();
    },
    pause() {
      anchor(pos());
      moving = false;
      silence();
    },
    resume(fromSec) {
      anchor(fromSec);
      moving = true;
      begin();
    },
    menu() {
      want = 'menu';
      moving = true;
      anchor(0);
      begin();
    },
    sfx(id) {
      if (on && r?.ready && r.ctx.state === 'running')
        playSfx(r.kit, r.mix.sfx, id);
    },
    destroy() {
      silence();
      void (r?.ctx as AudioContext | undefined)?.close().catch(() => {});
      r = null;
      on = false;
      want = null;
    },
  };
  return api;
}

/**
 * Renders a song offline with the same compiler, instruments, mix and
 * cursor the game uses, a second at a time as the live scheduler would.
 * For tests and tuning; the game never calls it.
 */
export async function renderSong(
  id: SongId,
  sampleRate = 44100,
  from = 0,
  loops = 1
): Promise<AudioBuffer> {
  const s = getSong(id);
  const len = s.len * loops - from + (s.loop ? 0 : 0.4);
  // A short pre-roll, so even the first note can play COMP_DELAY early;
  // it is trimmed off, and the result starts exactly at song time `from`.
  const pre = 0.05;
  const ctx = new OfflineAudioContext(
    2,
    Math.ceil((len + pre) * sampleRate),
    sampleRate
  );
  const rg = rig(ctx, true);
  prepare(rg, s);
  const lanes = openLanes(rg.mix);
  const cur = cursor(s);
  cur.seek(from);
  const slice = (t: number) =>
    cur.take(Math.min(t + 1.1, len) + from, (e, at) =>
      playEv(rg.kit, lanes, e, at - from + pre - COMP_DELAY, s)
    );
  slice(0);
  for (let t = 1; t < len; t++)
    void ctx.suspend(t).then(() => {
      slice(t);
      return ctx.resume();
    });
  const out = await ctx.startRendering();
  const cut = Math.round(pre * sampleRate);
  const res = new AudioBuffer({
    length: out.length - cut,
    numberOfChannels: 2,
    sampleRate,
  });
  for (let c = 0; c < 2; c++)
    res.copyToChannel(out.getChannelData(c).subarray(cut), c);
  return res;
}
