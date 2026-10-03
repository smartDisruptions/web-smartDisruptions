/**
 * The Dash renderer: everything on the canvas except Kiru himself, who is
 * drawn by ../kiru-dash.ts from a pose this module builds every frame.
 *
 * Draw order, back to front:
 *   sky, stars, sun or moon, clouds          backdrop.ts
 *   far range, fireworks, town, ink, near    backdrop.ts (three baked depths)
 *   far rain                                 backdrop.ts
 *   background deco, corridor, roofs,        objects.ts
 *   blocks, deco, the finish
 *   gates, wind, drums, lanterns, scrolls    objects.ts
 *   hazards, signs, checkpoints, "Attempt"   objects.ts, hud.ts
 *   trail, dragon ribbon, Kiru, particles    trail.ts, fx.ts
 *   near rain, petals                        backdrop.ts
 *   progress bar, NEW BEST, LEVEL COMPLETE   hud.ts
 *
 * Budgets (README.md § Performance): no shadowBlur and no gradients built
 * per frame, sprites baked on setLevel / resize, culling by x, pooled
 * particles, no allocations in draw(). Things that use the palette are
 * drawn once per theme in play: once normally, twice while a theme object
 * crossfades (the incoming theme on top, at the fade's alpha).
 */
import { dragonNeck, drawKiruDash, warmKiruDash } from '../kiru-dash';
import type {
  DashPhase,
  DashRenderer,
  KiruDashPose,
  LevelDef,
  ModeId,
  RenderFrame,
  RendererOptions,
  SimEvent,
  ThemeId,
} from '../types';
import { DEFAULT_SKIN, SPEEDS, VIEW_H, VIEW_W_MAX, VIEW_W_MIN } from '../types';
import {
  Weather,
  drawLayer,
  drawSky,
  type BackView,
  type Backdrop,
} from './backdrop';
import { Bakery } from './bakery';
import { Fx, K, fxCol } from './fx';
import { COMPLETE_GONE, Hud } from './hud';
import {
  LAYERS,
  cull,
  drawCheckpoints,
  drawShadow,
  drawCorridors,
  drawFinish,
  drawInteractive,
  drawRoofs,
  drawThemed,
  planLevel,
  type Cam,
  type LevelPlan,
} from './objects';
import {
  GATE_COL,
  ORB_COL,
  PAD_COL,
  SPEED_COL,
  gateTint,
  type CommonArt,
  type ThemeArt,
} from './sprites';
import { PALETTES } from './themes';
import { Trail } from './trail';
import { clamp, mulberry32 } from './util';

interface ThemeSwitch {
  x: number;
  theme: ThemeId;
  fade: number;
}

/** He holds his pose for a blink of a hit, then shatters (seconds). */
const SHATTER_AT = 0.07;
/** Start baking a theme this many blocks before its crossfade begins. */
const LOOKAHEAD = 70;
/** The finish's fireworks, as particle colours. */
const FIREWORK = ['#ffd23f', '#ff6fbf', '#43d2ff', '#46f08a', '#ff4a2a'].map(
  fxCol
);
/**
 * Small fireworks carry on behind the end card until this far into the
 * finish (s). The engine stops drawing about three seconds in, with the card
 * up: every spark has burnt out by then, so the still frame behind the card
 * is a clean night.
 */
const FIREWORKS_END = 1.75;
/**
 * The glows' swell after a big hit in the song: a section's downbeat (crash
 * and big taiko), or the crash every four bars of an energy 4 or 5 section.
 */
const ACCENT_SECTION = 1;
const ACCENT_CRASH = 0.55;
/** How fast the swell dies away (per beat). */
const ACCENT_DECAY = 2.2;

export function createRenderer(
  canvas: HTMLCanvasElement,
  opts: RendererOptions
): DashRenderer {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D is not available');
  const reduced = opts.reducedMotion;

  let W = 0;
  let H = 0;
  let cssW = 0;
  let cssH = 0;
  let dpr = 1;
  let level: LevelDef | null = null;
  let plan: LevelPlan | null = null;
  let switches: ThemeSwitch[] = [];
  const bakery = new Bakery(ctx, opts.hudFont);
  const weathers = new Map<ThemeId, Weather>();
  // This frame's art: the theme fading out (a) and in (b; the same when settled).
  let backA: Backdrop | null = null;
  let backB: Backdrop | null = null;
  let artA: ThemeArt | null = null;
  let artB: ThemeArt | null = null;
  let common: CommonArt | null = null;
  const keep: ThemeId[] = ['dawn', 'dawn', 'dawn'];
  const fx = new Fx();
  const trail = new Trail();
  const hud = new Hud(opts.hudFont);
  const rng = mulberry32(77);

  // Ambient time: keeps running through deaths, the finish and the menus.
  let now = 0;
  let lastWall = 0;
  let lastT = 0;

  // Kiru's eased pose state.
  let runPhase = 0;
  let air = 0;
  let blinkIn = 2.5;
  let blinkT = 0;
  let lastMode: ModeId = 'run';

  // Phases and attempts.
  let lastPhase: DashPhase | '' = '';
  let shattered = false;
  let attemptSeen = -1;
  let anchorX = 0;
  let anchorY = 0;
  let bestAtStart = 0;
  let newBestAt = -1e9;
  let newBestPct = 0;
  let nextFirework = 0;
  let fontPending = false;
  let fontArrived = false;
  /** The last launch came from a drum or a spirit lantern (Kiru flips). */
  let boosted = false;
  /**
   * While he is dying: the theme where the next attempt begins, baked ahead
   * during the shatter so a restart never waits on an evicted theme.
   */
  let respawnTheme: ThemeId = 'dawn';
  /** From an attempt's start until his first change of mode: no mode pop. */
  let spawnHold = false;
  let spawnMode: ModeId = 'run';
  /** Kiru's sprites were warmed for this scale and headband. */
  let warmScale = 0;
  let warmBand = '';
  const neck = { x: 0, y: 0 };
  /**
   * Attract mode never shows a death: the engine holds the frame a moment
   * and starts the strip over. Kiru vanishes in smoke, and the night dips
   * (0..1) to hide the cut behind the menus.
   */
  let attractDeadAt = -1;
  let vanished = false;
  let dip = 0;

  /**
   * The song's big hits, from the level's sections, the shape the music is
   * built from (bar n starts at beat 4n; song time is level time):
   * when (beats) and how strong each swell of the glows is, and when the
   * thunder cracks (level seconds), which storm lightning follows.
   */
  let accentBeat = new Float64Array(0);
  let accentAmp = new Float64Array(0);
  let thunderT = new Float64Array(0);
  /** Level time at the last frame, to catch the cues it passed. */
  let lastCueT = 0;

  const view: BackView = {
    W: 0,
    H: 0,
    ppu: 1,
    camX: 0,
    camY: 0,
    now: 0,
    pulse: 0,
    accent: 0,
    reduced,
  };
  const cam: Cam = {
    W: 0,
    H: 0,
    ppu: 1,
    ox: 0,
    oy: 0,
    x0: 0,
    x1: 0,
    y0: 0,
    y1: 0,
    beat: 0,
    t: 0,
    now: 0,
    pulse: 0,
    accent: 0,
    reduced,
  };
  const pose: KiruDashPose = {
    t: 0,
    mode: 'run',
    grav: 1,
    vy: 0,
    grounded: true,
    rot: 0,
    runPhase: 0,
    air: 0,
    jumpT: 1,
    flipT: Infinity,
    modeT: 0,
    held: false,
    skin: DEFAULT_SKIN,
    scale: 1,
    blink: false,
    dying: 0,
  };

  /**
   * The themes in play at x: a, fading into b by k (b === a when settled),
   * and the next theme coming up within the lookahead (or b).
   */
  const blend = {
    a: 'dawn' as ThemeId,
    b: 'dawn' as ThemeId,
    k: 0,
    next: 'dawn' as ThemeId,
  };
  function themeAt(x: number) {
    let cur = switches.length ? switches[0].theme : 'dawn';
    let prev = cur;
    let k = 1;
    let i = 1;
    for (; i < switches.length; i++) {
      const s = switches[i];
      if (s.x > x) break;
      prev = cur;
      cur = s.theme;
      k = clamp((x - s.x) / s.fade, 0, 1);
    }
    blend.a = k >= 1 || prev === cur ? cur : prev;
    blend.b = cur;
    blend.k = k >= 1 || prev === cur ? 0 : k;
    blend.next =
      i < switches.length && switches[i].x - x < LOOKAHEAD
        ? switches[i].theme
        : cur;
  }

  /** The settled theme at x (no crossfade). */
  function settledThemeAt(x: number): ThemeId {
    let cur = switches.length ? switches[0].theme : 'dawn';
    for (let i = 1; i < switches.length && switches[i].x <= x; i++)
      cur = switches[i].theme;
    return cur;
  }

  /** The view width the camera uses for this canvas (README § World and camera). */
  function viewWFor(w: number, h: number) {
    return clamp(VIEW_H * (w / Math.max(1, h)), VIEW_W_MIN, VIEW_W_MAX);
  }

  /** Bake (or fetch) this frame's art. False if there is nothing to draw on yet. */
  function prepare(ppu: number) {
    if (!level || !plan || W === 0 || H === 0) return false;
    bakery.setScale(W, H, ppu);
    keep[0] = blend.a;
    keep[1] = blend.b;
    keep[2] = blend.next;
    const a = bakery.need(blend.a, keep);
    const b = blend.b === blend.a ? a : bakery.need(blend.b, keep);
    backA = a.back;
    artA = a.art;
    backB = b.back;
    artB = b.art;
    if (blend.next !== blend.b) bakery.prefetch(blend.next, keep);
    else if (respawnTheme !== blend.a) bakery.prefetch(respawnTheme, keep);
    common = bakery.commonArt();
    if (fx.scale !== ppu) {
      fx.bake(ppu, pose.skin.band);
      hud.resize(ctx!, cssW || W, cssH || H, dpr);
      watchFont();
    }
    for (const id of keep)
      if (!weathers.has(id))
        weathers.set(id, new Weather(PALETTES[id], reduced));
    return true;
  }

  /** Signs are in the display face: if it isn't loaded yet, bake them again when it is. */
  function watchFont() {
    if (
      fontPending ||
      fontArrived ||
      typeof document === 'undefined' ||
      !document.fonts
    )
      return;
    try {
      if (document.fonts.check(`40px ${opts.hudFont}`)) return;
      fontPending = true;
      document.fonts.ready.then(() => {
        fontPending = false;
        fontArrived = true;
        bakery.refreshTexts();
        hud.refreshFont(ctx!);
      });
    } catch {
      /* no font loading API: bake with what there is */
    }
  }

  // ── The song ─────────────────────────────────────────────────────────────

  /**
   * Where the song's big hits fall, by the same rules the sequencer writes
   * them: every section opens with a crash and a big taiko hit; energy 4 and
   * 5 sections crash again every four bars; thunder (Storm Roofs) cracks on
   * a section's start above energy 1 and every four bars at energy 5.
   */
  function buildCues(l: LevelDef) {
    const ab: number[] = [];
    const aa: number[] = [];
    const th: number[] = [];
    let bar = 0;
    for (const s of l.sections) {
      for (let b = 0; b < s.bars; b++, bar++) {
        if (b === 0 || (s.energy > 3 && b % 4 === 0)) {
          ab.push(bar * 4);
          aa.push(b === 0 ? ACCENT_SECTION : ACCENT_CRASH);
        }
        if (b === 0 ? s.energy > 1 : s.energy === 5 && b % 4 === 0)
          th.push((bar * 240) / l.bpm);
      }
    }
    accentBeat = Float64Array.from(ab);
    accentAmp = Float64Array.from(aa);
    thunderT = Float64Array.from(th);
  }

  /** The first index in a sorted array whose value is above v. */
  function above(a: Float64Array, v: number) {
    let lo = 0;
    let hi = a.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (a[m] <= v) lo = m + 1;
      else hi = m;
    }
    return lo;
  }

  /** The glows' swell at this beat, from the last big hit at or before it. */
  function accentAt(beat: number) {
    const i = above(accentBeat, beat) - 1;
    if (i < 0) return 0;
    const since = beat - accentBeat[i];
    return since < 3 ? accentAmp[i] * Math.exp(-since * ACCENT_DECAY) : 0;
  }

  /**
   * Storm lightning on the song's thunder: a flash for a cue passed since
   * the last frame. A jump in level time (a restart, a checkpoint) passes
   * nothing. Weather keeps it photosafe (one flash per two seconds at most).
   */
  function thunder(f: RenderFrame) {
    const t0 = lastCueT;
    lastCueT = f.t;
    if (f.phase !== 'playing' || !(f.t > t0) || f.t - t0 > 0.5) return;
    const i = above(thunderT, t0);
    if (i >= thunderT.length || thunderT[i] > f.t) return;
    weathers.get(blend.a)?.strike();
    if (blend.b !== blend.a) weathers.get(blend.b)?.strike();
  }

  // ── Backdrop ─────────────────────────────────────────────────────────────

  function drawBackdrop() {
    const ba = backA!;
    const bb = backB!;
    const wa = weathers.get(blend.a)!;
    const wb = weathers.get(blend.b)!;
    const k = blend.k;
    const two = k > 0;
    const ka = two ? 1 - k : 1;
    drawSky(ctx!, ba, 1, view);
    if (two) drawSky(ctx!, bb, k, view);
    drawLayer(ctx!, ba, 0, 1, view);
    if (two) drawLayer(ctx!, bb, 0, k, view);
    wa.drawSky(ctx!, ba, ka, view);
    if (two) wb.drawSky(ctx!, bb, k, view);
    drawLayer(ctx!, ba, 1, 1, view);
    if (two) drawLayer(ctx!, bb, 1, k, view);
    wa.drawMid(ctx!, ba, ka, view);
    if (two) wb.drawMid(ctx!, bb, k, view);
    drawLayer(ctx!, ba, 2, 1, view);
    if (two) drawLayer(ctx!, bb, 2, k, view);
    wa.drawBack(ctx!, ka, view);
    if (two) wb.drawBack(ctx!, k, view);
  }

  function drawFrontWeather() {
    const k = blend.k;
    weathers.get(blend.a)!.drawFront(ctx!, backA!, k > 0 ? 1 - k : 1, view);
    if (k > 0) weathers.get(blend.b)!.drawFront(ctx!, backB!, k, view);
  }

  // ── The level, in themed passes ──────────────────────────────────────────

  function themed(layer: number) {
    drawThemed(ctx!, plan!, artA!, common!, cam, 1, layer);
    if (blend.k > 0)
      drawThemed(ctx!, plan!, artB!, common!, cam, blend.k, layer);
  }

  function drawLevel(f: RenderFrame) {
    const aa = artA!;
    const ab = artB!;
    if (!common || !plan) return;
    const two = blend.k > 0;
    themed(LAYERS.decoBack);
    drawCorridors(ctx!, plan, aa, cam, 1);
    if (two) drawCorridors(ctx!, plan, ab, cam, blend.k);
    drawRoofs(ctx!, plan, aa, cam, 1);
    if (two) drawRoofs(ctx!, plan, ab, cam, blend.k);
    themed(LAYERS.block);
    themed(LAYERS.deco);
    drawFinish(ctx!, plan, common, cam);
    const glow =
      aa.pal.glow + (two ? (ab.pal.glow - aa.pal.glow) * blend.k : 0);
    const st = f.state;
    drawInteractive(
      ctx!,
      plan,
      common,
      cam,
      st.used,
      st.scrolls,
      glow,
      LAYERS.portal
    );
    drawInteractive(
      ctx!,
      plan,
      common,
      cam,
      st.used,
      st.scrolls,
      glow,
      LAYERS.pickup
    );
    themed(LAYERS.hazard);
    themed(LAYERS.text);
    if (f.practice && f.checkpoints.length)
      drawCheckpoints(ctx!, f.checkpoints, common, cam);
    if (f.phase !== 'attract' && f.attempt > 0) {
      const s = hud.attemptSprite(f.attempt, cam.ppu);
      const x = anchorX * cam.ppu + cam.ox;
      if (x > -s.w && x < W + s.w) {
        ctx!.globalAlpha = 0.92;
        ctx!.drawImage(
          s.c,
          x - s.ax,
          cam.oy - anchorY * cam.ppu - s.ay,
          s.w,
          s.h
        );
        ctx!.globalAlpha = 1;
      }
    }
  }

  // ── Kiru ─────────────────────────────────────────────────────────────────

  /**
   * Kiru's pose for this frame, from the sim plus the renderer's own eased
   * state (the air blend, the run cycle, the blink, the dying ramp). Built
   * every frame, drawn or not, so nothing jumps when he reappears.
   */
  function updatePose(f: RenderFrame, dt: number, dtLevel: number) {
    const pl = f.state.player;
    // The legs turn while he runs: in play, behind the menus, and on through
    // the finish (the runtime keeps him running past the line).
    const running =
      f.phase === 'playing' || f.phase === 'attract' || f.phase === 'complete';
    if (pl.grounded && running)
      runPhase += dtLevel * (7.5 + SPEEDS[f.state.speed] * 0.65);
    air += ((pl.grounded ? 0 : 1) - air) * Math.min(1, dt * 16);
    blinkIn -= dt;
    if (blinkIn <= 0) {
      blinkT = 0.11;
      blinkIn = 2 + rng() * 3.5;
    }
    blinkT = Math.max(0, blinkT - dt);
    // A respawn is instant, as in Geometry Dash: no mode pop until the
    // first real change of mode.
    if (spawnHold && pl.mode !== spawnMode) spawnHold = false;
    pose.t = now;
    pose.mode = pl.mode;
    pose.grav = pl.grav;
    // jumpT, flipT and vy go straight through: kiru-dash reads a teleport
    // from flipT === jumpT with vy === 0.
    pose.vy = pl.vy;
    pose.grounded = pl.grounded;
    pose.rot = pl.rot;
    pose.runPhase = runPhase;
    pose.air = air;
    pose.jumpT = pl.jumpT;
    pose.flipT = pl.flipT;
    pose.modeT = spawnHold ? Infinity : pl.modeT;
    pose.held = f.held;
    pose.skin = f.skin;
    pose.scale = cam.ppu;
    pose.blink = blinkT > 0;
    pose.dying = f.phase === 'dying' ? clamp(f.phaseT / SHATTER_AT, 0, 1) : 0;
    pose.boosted = boosted;
    pose.reducedMotion = reduced || f.reducedMotion;
  }

  function drawKiru(f: RenderFrame) {
    if ((f.phase === 'dying' && f.phaseT >= SHATTER_AT) || vanished) return;
    // kiru-dash keeps its own alpha: never fade him through globalAlpha.
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.globalAlpha = 1;
    drawKiruDash(ctx!, f.px * cam.ppu + cam.ox, cam.oy - f.py * cam.ppu, pose);
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.globalAlpha = 1;
  }

  /**
   * Where "Attempt N" goes: above where the attempt begins, at the first
   * height that doesn't land on one of the level's own signs.
   */
  function placeAttempt(x: number, y: number, n: number) {
    anchorX = x;
    anchorY = y + 4.6;
    if (!level) return;
    const half = (`Attempt ${n}`.length * 0.62) / 2 + 0.6;
    for (const dy of [4.6, 6.8, 2.6, 9]) {
      let clear = true;
      for (const o of level.objects) {
        if (o.k !== 'text') continue;
        const sw = (o.text.length * (o.size ?? 1) * 0.84) / 2;
        if (
          Math.abs(o.x - x) < half + sw &&
          Math.abs(o.y - (y + dy)) < 1.5 * (o.size ?? 1) + 0.4
        ) {
          clear = false;
          break;
        }
      }
      if (clear) {
        anchorY = y + dy;
        return;
      }
    }
  }

  // ── Phases ───────────────────────────────────────────────────────────────

  function onPhase(f: RenderFrame) {
    if (
      f.attempt !== attemptSeen ||
      (f.phase === 'playing' && lastPhase === 'dying')
    ) {
      // A new attempt: "Attempt N" goes where it begins, and its best is
      // what it has to beat.
      attemptSeen = f.attempt;
      const cp =
        f.practice && f.checkpoints.length
          ? f.checkpoints[f.checkpoints.length - 1]
          : null;
      const sx = cp ? cp.x : (level?.start.x ?? 0);
      const sy = cp ? cp.y : (level?.start.y ?? 3);
      placeAttempt(sx + 6.5, sy, f.attempt);
      bestAtStart = f.best;
      shattered = false;
      trail.clear();
      plan?.hitAt.fill(-1e9);
      spawnHold = true;
      spawnMode = f.state.player.mode;
      if (lastPhase === 'dying' || lastPhase === 'complete') fx.clear();
    }
    if (f.phase !== lastPhase) {
      if (f.phase === 'dying' && !f.practice) {
        // The engine's numbers: a whole percent, at most 99 short of the
        // finish, against the best in force when the attempt began.
        const pct = Math.min(99, Math.floor(f.state.progress * 100));
        if (pct >= 1 && pct > Math.round(bestAtStart * 100)) {
          newBestAt = now;
          newBestPct = pct;
        }
      }
      if (f.phase === 'complete') nextFirework = 0;
      if (f.phase === 'playing' || f.phase === 'attract') {
        shattered = false;
        if (lastPhase === 'dying') newBestAt = Math.min(newBestAt, now - 1.65);
      }
      lastPhase = f.phase;
    }
    if (f.phase === 'dying' && !shattered && f.phaseT >= SHATTER_AT) {
      shattered = true;
      fx.setBand(f.skin.band);
      fx.shatter(f.px, f.py, reduced);
    }
    if (f.phase === 'complete') finishFireworks(f);
  }

  /**
   * The finish, on the phase's clock (the one the shell times its end card
   * by). The song's last hit lands on the finish line: a pair bursts at
   * once, then a quick volley while LEVEL COMPLETE is up. As the banner
   * fades and the card arrives, a few small ones at the sides and up high,
   * where the card isn't, and then the sky goes quiet.
   */
  function finishFireworks(f: RenderFrame) {
    const t = f.phaseT;
    if (t < nextFirework || t >= FIREWORKS_END) return;
    const col = FIREWORK[Math.floor(rng() * FIREWORK.length)];
    if (nextFirework === 0) {
      fx.firework(
        f.camX + f.viewW * 0.45,
        f.camY + f.viewH * 0.7,
        col,
        reduced
      );
      fx.firework(
        f.camX + f.viewW * 0.78,
        f.camY + f.viewH * 0.62,
        FIREWORK[(FIREWORK.indexOf(col) + 2) % FIREWORK.length],
        reduced
      );
      nextFirework = reduced ? 0.5 : 0.3;
      return;
    }
    if (t < COMPLETE_GONE - 0.2) {
      nextFirework = t + (reduced ? 0.5 : 0.22);
      const x = f.camX + f.viewW * (0.35 + rng() * 0.6);
      const y = f.camY + f.viewH * (0.45 + rng() * 0.45);
      fx.firework(x, y, col, reduced);
      return;
    }
    nextFirework = t + (reduced ? 0.6 : 0.24) + rng() * 0.08;
    const side = rng() < 0.5 ? 0.04 + rng() * 0.13 : 0.83 + rng() * 0.13;
    const x = f.camX + f.viewW * side;
    const y = f.camY + f.viewH * (0.64 + rng() * 0.26);
    fx.firework(x, y, col, reduced, 0.55);
  }

  // ── Events ───────────────────────────────────────────────────────────────

  function onEvent(ev: SimEvent, f: RenderFrame) {
    const pl = f.state.player;
    const g = pl.grav;
    const r = () => fx.rnd();
    switch (ev.e) {
      case 'jump':
      case 'flap':
      case 'teleport':
      case 'flip':
        boosted = false;
        break;
      case 'orb':
        boosted = ev.c !== 'blue' && ev.c !== 'black';
        break;
      case 'pad':
        boosted = ev.c !== 'blue';
        break;
      default:
        break;
    }
    switch (ev.e) {
      case 'jump': {
        const fy = ev.y - g * pl.h * 0.5;
        for (let k = 0; k < 6; k++)
          fx.spawn(
            K.Puff,
            ev.x - 0.2 + r() * 0.4,
            fy,
            -2 - r() * 3,
            g * (0.4 + r() * 1.2),
            0.35,
            0.35 + r() * 0.2,
            0,
            0,
            3,
            0
          );
        break;
      }
      case 'land': {
        const fy = ev.y - g * pl.h * 0.5;
        const k = clamp(Math.abs(ev.v) / 20, 0.25, 1);
        const n = Math.round(3 + 6 * k);
        for (let i = 0; i < n; i++) {
          const d = i % 2 ? 1 : -1;
          fx.spawn(
            K.Puff,
            ev.x + d * 0.25,
            fy,
            d * (1.5 + r() * 2.5) - 1.5,
            g * (0.3 + r() * 0.8),
            0.4,
            0.3 + r() * 0.25 * k,
            0,
            0,
            3,
            0
          );
        }
        break;
      }
      case 'orb': {
        const c = fxCol(ev.c === 'black' ? '#9a6aff' : ORB_COL[ev.c]);
        if (plan) plan.hitAt[ev.i] = now;
        fx.spawn(K.Ring, ev.x, ev.y, 0, 0, 0.4, 1.4, c);
        fx.burst(ev.x, ev.y, reduced ? 8 : 16, 7, c, 0.45, 0.5);
        fx.burst(ev.x, ev.y, 6, 3, 0, 0.3, 0.4);
        break;
      }
      case 'pad': {
        const c = fxCol(PAD_COL[ev.c]);
        if (plan) plan.hitAt[ev.i] = now;
        fx.spawn(K.Ring, ev.x, ev.y, 0, 0, 0.35, 1.1, c);
        for (let k = 0; k < (reduced ? 6 : 12); k++)
          fx.spawn(
            K.Dot,
            ev.x - 0.4 + r() * 0.8,
            ev.y,
            (r() - 0.5) * 3,
            g * (5 + r() * 6),
            0.5,
            0.45,
            c,
            g * 14,
            1.5
          );
        break;
      }
      case 'gate': {
        let col = GATE_COL.mode;
        if (plan && level) {
          plan.hitAt[ev.i] = now;
          const o = level.objects[ev.i];
          if (o && o.k === 'gate') col = GATE_COL[gateTint(o)];
        }
        const c = fxCol(
          col === GATE_COL.mode
            ? '#ff4a2a'
            : col === GATE_COL.blue
              ? '#3db4ff'
              : '#ffd23f'
        );
        fx.spawn(K.Ring, ev.x, ev.y, 0, 0, 0.5, 2.6, c);
        fx.burst(ev.x, ev.y, reduced ? 10 : 22, 8, c, 0.55, 0.55);
        trail.clear();
        break;
      }
      case 'speed': {
        if (plan) plan.hitAt[ev.i] = now;
        const c = fxCol(SPEED_COL[ev.speed]);
        for (let k = 0; k < (reduced ? 6 : 14); k++)
          fx.spawn(
            K.Streak,
            ev.x + 1 + r() * 6,
            ev.y - 3 + r() * 6,
            -18 - r() * 10,
            0,
            0.45,
            0.8 + r() * 0.8,
            c,
            0,
            0
          );
        break;
      }
      case 'scroll': {
        if (plan) plan.hitAt[ev.i] = now;
        for (let k = 0; k < (reduced ? 6 : 12); k++) {
          const a = (k / 12) * Math.PI * 2;
          fx.spawn(
            K.Star,
            ev.x,
            ev.y,
            Math.cos(a) * 3.5,
            Math.sin(a) * 3.5,
            0.6,
            0.7 + r() * 0.5,
            0,
            0,
            2.5
          );
        }
        fx.burst(ev.x, ev.y, 10, 4, fxCol('#ffcf70'), 0.6, 0.5);
        fx.spawn(K.Ring, ev.x, ev.y, 0, 0, 0.45, 1.6, fxCol('#ffcf70'));
        break;
      }
      case 'flap': {
        const fy = ev.y - g * 0.5;
        for (let k = 0; k < 5; k++)
          fx.spawn(
            K.Puff,
            ev.x - 0.3 + r() * 0.6,
            fy,
            -1 - r(),
            -g * (2 + r() * 2),
            0.35,
            0.3 + r() * 0.15,
            0,
            0,
            4,
            0
          );
        fx.spawn(K.Ring, ev.x, fy, 0, -g * 2, 0.3, 0.8, 0);
        break;
      }
      case 'flip':
        fx.spawn(K.Ring, ev.x, ev.y, 0, 0, 0.35, 1.3, fxCol('#3db4ff'));
        for (let k = 0; k < 8; k++)
          fx.spawn(
            K.Dot,
            ev.x,
            ev.y,
            (r() - 0.5) * 3,
            (r() - 0.5) * 9,
            0.4,
            0.4,
            fxCol('#3db4ff'),
            0,
            3
          );
        break;
      case 'teleport': {
        fx.smoke(ev.x, ev.y0);
        fx.smoke(ev.x, ev.y1);
        const n = Math.ceil(Math.abs(ev.y1 - ev.y0) * 1.5);
        for (let k = 0; k < n; k++) {
          const y = ev.y0 + ((ev.y1 - ev.y0) * k) / n;
          fx.spawn(
            K.Dot,
            ev.x + (r() - 0.5) * 0.3,
            y,
            -1,
            0,
            0.3,
            0.35,
            19,
            0,
            2
          );
        }
        trail.clear();
        break;
      }
      case 'death':
        // Behind the menus the canvas is scenery: it never shakes.
        if (!reduced && f.phase !== 'attract') fx.shake = 0.28;
        break;
      default:
        break;
    }
  }

  // ── The frame ────────────────────────────────────────────────────────────

  function draw(f: RenderFrame) {
    if (canvas.width !== W || canvas.height !== H) {
      W = canvas.width;
      H = canvas.height;
      fx.scale = 0;
    }
    const ppu = W / f.viewW;
    if (level !== f.level) setLevel(f.level);
    themeAt(f.px);
    respawnTheme = blend.a;
    if (f.phase === 'dying' && level) {
      const cp =
        f.practice && f.checkpoints.length
          ? f.checkpoints[f.checkpoints.length - 1]
          : null;
      respawnTheme = settledThemeAt(cp ? cp.x : level.start.x);
    }
    if (!prepare(ppu)) return;
    const wall = performance.now() / 1000;
    const dt = lastWall ? clamp(wall - lastWall, 0, 0.1) : 0;
    lastWall = wall;
    now += dt;
    const dtLevel = clamp(f.t - lastT, 0, 0.1);
    lastT = f.t;
    if (f.skin.band !== pose.skin.band) fx.setBand(f.skin.band);

    onPhase(f);
    attractDeath(f, dt);
    cam.ppu = ppu; // the pose needs the scale before the camera is filled in
    updatePose(f, dt, dtLevel);
    if (cam.ppu !== warmScale || f.skin.band !== warmBand) {
      // Pre-bake Kiru's sprites for this size and headband (kiru-dash).
      warmScale = cam.ppu;
      warmBand = f.skin.band;
      warmKiruDash(cam.ppu, f.skin);
    }

    view.W = W;
    view.H = H;
    view.ppu = ppu;
    view.camX = f.camX;
    view.camY = f.camY;
    view.now = now;
    // A song with thunder leads the lightning (attract mode has no song).
    const cued = thunderT.length > 0 && f.phase !== 'attract';
    const wa = weathers.get(blend.a);
    const wb = blend.b !== blend.a ? weathers.get(blend.b) : undefined;
    if (wa) wa.cued = cued;
    if (wb) wb.cued = cued;
    thunder(f);
    wa?.update(dt, view);
    wb?.update(dt, view);
    fx.update(f.phase === 'paused' ? 0 : dt);

    const pl = f.state.player;
    // The trail follows him through the finish too: he runs on past the line.
    const live =
      f.phase === 'playing' || f.phase === 'attract' || f.phase === 'complete';
    if (live) {
      if (pl.mode !== lastMode) trail.clear();
      if (pl.mode === 'dragon') {
        // The ribbon joins the dragon at its neck, not at Kiru's middle.
        dragonNeck(pose, neck);
        trail.push(f.px + neck.x, f.py - neck.y);
      }
      trail.emit(
        fx,
        f.skin.trail,
        f.px,
        f.py,
        dtLevel,
        SPEEDS[f.state.speed],
        reduced
      );
    }
    lastMode = pl.mode;

    const shx = reduced ? 0 : fx.shakeX(ppu);
    const shy = reduced ? 0 : fx.shakeY(ppu);
    cam.W = W;
    cam.H = H;
    cam.ppu = ppu;
    cam.ox = -f.camX * ppu + shx;
    cam.oy = (f.camY + f.viewH) * ppu + shy;
    cam.x0 = f.camX - 1;
    cam.x1 = f.camX + f.viewW + 1;
    cam.y0 = f.camY;
    cam.y1 = f.camY + f.viewH;
    cam.beat = f.beat;
    cam.t = f.t;
    cam.now = now;
    const b = f.beat - Math.floor(f.beat);
    const pulse = (1 - b) * (1 - b) * (1 - b);
    cam.pulse =
      f.phase === 'paused'
        ? 0
        : reduced || f.reducedMotion
          ? pulse * 0.35
          : pulse;
    view.pulse = cam.pulse;
    // The big hits lift the glows while the song plays (none in the menus,
    // which have no song, and none under reduced motion).
    cam.accent =
      f.phase === 'playing' && !reduced && !f.reducedMotion
        ? accentAt(f.beat)
        : 0;
    view.accent = cam.accent;

    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.globalAlpha = 1;
    ctx!.globalCompositeOperation = 'source-over';
    drawBackdrop();
    if (plan) cull(plan, cam);
    drawLevel(f);

    const kiruShown =
      !(f.phase === 'dying' && f.phaseT >= SHATTER_AT) && !vanished;
    if (kiruShown && plan && common)
      drawShadow(ctx!, plan, common, cam, f.px, f.py, pl.h / 2, pl.grav);
    fx.draw(ctx!, cam.ox, cam.oy, ppu, 0);
    if (pl.mode === 'dragon' || f.phase === 'dying')
      trail.drawRibbon(
        ctx!,
        f.skin.band,
        cam.ox,
        cam.oy,
        ppu,
        f.phase === 'dying' ? 0.6 : 1
      );
    drawKiru(f);
    fx.draw(ctx!, cam.ox, cam.oy, ppu, 1);
    drawFrontWeather();

    if (dip > 0) {
      ctx!.globalAlpha = dip * 0.92;
      ctx!.fillStyle = '#05040c';
      ctx!.fillRect(0, 0, W, H);
      ctx!.globalAlpha = 1;
    }
    if (f.phase !== 'attract') {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      hud.drawBar(ctx!, f.state.progress, f.best, f.practice, cam.pulse);
      hud.drawNewBest(ctx!, now - newBestAt, newBestPct, reduced);
      if (f.phase === 'complete') hud.drawComplete(ctx!, f.phaseT, reduced);
    }
    ctx!.globalAlpha = 1;
  }

  /**
   * Attract mode's rare death: he vanishes in a puff of smoke (no shatter,
   * no shake), and the night dips while the engine starts the strip over,
   * then lifts on the new strip.
   */
  function attractDeath(f: RenderFrame, dt: number) {
    const dead = f.phase === 'attract' && f.state.player.dead;
    if (dead) {
      if (attractDeadAt < 0) attractDeadAt = now;
      if (!vanished && now - attractDeadAt >= SHATTER_AT) {
        vanished = true;
        fx.smoke(f.px, f.py);
        trail.clear();
      }
    } else {
      attractDeadAt = -1;
      vanished = false;
    }
    const to = dead && now - attractDeadAt > 0.3 ? 1 : 0;
    dip += (to - dip) * Math.min(1, dt * 7);
    if (dip < 0.01 && to === 0) dip = 0;
  }

  function setLevel(l: LevelDef) {
    level = l;
    plan = planLevel(l);
    switches = [{ x: -Infinity, theme: l.theme, fade: 1 }];
    for (const o of l.objects) {
      if (o.k === 'theme')
        switches.push({
          x: o.x,
          theme: o.theme,
          fade: Math.max(0.01, o.fade ?? 8),
        });
    }
    switches.sort((a, b) => a.x - b.x);
    buildCues(l);
    bakery.setNeeds(plan.needs, plan.common);
    attemptSeen = -1;
    lastPhase = '';
    // Particles are left alone: attract mode swaps strips under Kiru's
    // feet in the same coordinates, and the swap must not show.
    trail.clear();
    if (W > 0) {
      themeAt(l.start.x);
      prepare(W / viewWFor(W, H));
    }
  }

  return {
    resize(cw: number, ch: number, ratio: number) {
      cssW = cw;
      cssH = ch;
      dpr = ratio;
      W = canvas.width || Math.round(cw * ratio);
      H = canvas.height || Math.round(ch * ratio);
      fx.scale = 0;
      if (level) prepare(W / viewWFor(W, H));
    },
    setLevel,
    event: onEvent,
    draw,
    destroy() {
      bakery.clear();
      weathers.clear();
      backA = backB = null;
      artA = artB = null;
      common = null;
      plan = null;
      level = null;
      fx.clear();
    },
  };
}
