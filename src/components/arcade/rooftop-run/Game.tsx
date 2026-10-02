'use client';

import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { Sfx } from './sfx';
import { createDashAudio } from './dash/audio';
import { createDashEngine } from './dash/engine';
import { getLevel, LEVEL_METAS } from './dash/levels';
import {
  levelProgress,
  loadSave,
  recordAttempt,
  saveSkin,
  totalScrolls,
  totalStars,
} from './dash/storage';
import type {
  DashAudio,
  DashEngine,
  DashPhase,
  DashRunInfo,
  DashSave,
  KiruSkin,
} from './dash/types';
import Classic from './dash/ui/Classic';
import CompletePanel, {
  describeResult,
  type CompleteResult,
} from './dash/ui/CompletePanel';
import { focusInGame, plainKey } from './dash/ui/focus';
import { allowedSkin, newlyUnlocked } from './dash/ui/gear';
import GearMenu from './dash/ui/GearMenu';
import Hud from './dash/ui/Hud';
import LevelSelect, { describeLevel } from './dash/ui/LevelSelect';
import PausePanel from './dash/ui/PausePanel';
import PracticeButtons from './dash/ui/PracticeButtons';
import TitleMenu, { type TitleChoice } from './dash/ui/TitleMenu';
import './dash/ui/dash.css';

export interface GameProps {
  /** id of the visible how-to-play line, for aria-describedby. */
  helpId: string;
  /** Called once the first frame is on the canvas, so the poster can go. */
  onReady?: () => void;
}

type Screen = 'title' | 'levels' | 'gear' | 'play' | 'classic';

/** The canvas has its fireworks first; then the end card. */
const COMPLETE_PANEL_MS = 1600;

const skinFrom = (save: DashSave): KiruSkin =>
  allowedSkin(save.skin, totalStars(save), totalScrolls(save));

/**
 * The playable screen. The level game owns the canvas (its runtime draws the
 * world, Kiru and the in-level HUD); this shell is everything around it: the
 * title menu over Kiru's attract run, the level select, the gear, the pause
 * and level-complete panels, practice's checkpoint buttons, the HUD buttons
 * (pause, sound, full screen), progress saved in this browser, and a polite
 * live region. Classic, the original endless run, is a mode with its own
 * canvas and its own chunk.
 *
 * This module and everything it imports is one lazy chunk: the page fetches
 * it when Start is pressed, never before.
 */
export default function Game({ helpId, onReady }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DashEngine | null>(null);
  const audioRef = useRef<DashAudio | null>(null);
  const soundRef = useRef(false);
  const phaseRef = useRef<DashPhase>('attract');
  const attemptRef = useRef(0);
  const introRef = useRef('');
  const timerRef = useRef(0);
  const visitRef = useRef({ jumps: 0, time: 0 });
  const doneRef = useRef<CompleteResult | null>(null);

  // Classic's sound effects: nothing is created until sound is turned on.
  const [sfx] = useState(() => new Sfx());
  const [screen, setScreen] = useState<Screen>('title');
  const [titleFocus, setTitleFocus] = useState<TitleChoice>('levels');
  const [phase, setPhase] = useState<DashPhase>('attract');
  const [runPercent, setRunPercent] = useState(0);
  const [levelIdx, setLevelIdx] = useState(0);
  const [practice, setPractice] = useState(false);
  const [save, setSave] = useState<DashSave>(loadSave);
  const [skin, setSkin] = useState<KiruSkin>(() => skinFrom(loadSave()));
  const [result, setResult] = useState<CompleteResult | null>(null);
  const [sound, setSound] = useState(false);
  const [live, setLive] = useState({ text: '', n: 0 });
  const [failed, setFailed] = useState(false);
  // Full screen where the browser allows it (not on iPhone): on a phone that
  // is a landscape playfield instead of a small box in a portrait page.
  const [canFull] = useState(
    () => typeof document !== 'undefined' && !!document.fullscreenEnabled
  );
  const [full, setFull] = useState(false);

  /** Polite announcements; the same words twice still get spoken. */
  const say = (text: string) => setLive((l) => ({ text, n: l.n + 1 }));

  const meta = LEVEL_METAS[levelIdx];

  /**
   * One button, two sound engines: the level game's and Classic's. The game
   * on screen gets the choice and the other stays asleep, so only one
   * AudioContext is ever awake; switching games carries the choice over.
   * Always called from a click or a key press, so the browser lets audio
   * start. (The level game's audio remembers what it was asked to play
   * while silent: the menu music, or the song in step with the level.)
   */
  const toggleSound = () => {
    const next = !soundRef.current;
    soundRef.current = next;
    if (screen === 'classic') sfx.setOn(next);
    else audioRef.current?.setOn(next);
    setSound(next);
  };

  /** From a level (its pause or end card) back to the level select. */
  const toLevels = () => {
    window.clearTimeout(timerRef.current);
    setResult(null);
    setScreen('levels');
    engineRef.current?.attract();
    say(`Levels. ${describeLevel(meta, levelProgress(save, meta.id))}`);
  };

  // ── The runtime's callbacks ──────────────────────────────────────────────
  const onPhase = useEffectEvent((p: DashPhase, info: DashRunInfo | null) => {
    const prev = phaseRef.current;
    phaseRef.current = p;
    setPhase(p);
    if (info) setRunPercent(info.percent);
    if (p === 'playing' && info) {
      window.clearTimeout(timerRef.current);
      setResult(null);
      setPractice(info.practice);
      const fresh = info.attempt !== attemptRef.current;
      attemptRef.current = info.attempt;
      say(
        fresh || prev !== 'paused'
          ? `${introRef.current}Attempt ${info.attempt}.`
          : 'Playing.'
      );
      introRef.current = '';
      // A new attempt, a resume or a restart from a panel: back to the game.
      focusInGame(canvasRef.current, false);
    } else if (p === 'paused') {
      say('Paused.');
    } else if (p === 'complete') {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        const r = doneRef.current;
        if (!r) return;
        setResult(r);
        say(describeResult(r));
      }, COMPLETE_PANEL_MS);
    }
  });

  const onAttempt = useEffectEvent((info: DashRunInfo) => {
    const before = loadSave();
    const wasDone = before.levels[info.levelId]?.completed === true;
    const next = recordAttempt(info);
    setSave(next);
    visitRef.current.jumps += info.jumps;
    visitRef.current.time += info.time;
    if (info.completed) {
      const m = LEVEL_METAS.find((l) => l.id === info.levelId) ?? meta;
      doneRef.current = {
        name: m.name,
        practice: info.practice,
        attempts: info.attempt,
        jumps: visitRef.current.jumps,
        time: visitRef.current.time,
        found: info.scrolls,
        stars: m.stars,
        starsNew: !info.practice && !wasDone,
        unlocked: info.practice
          ? []
          : newlyUnlocked(
              { stars: totalStars(before), scrolls: totalScrolls(before) },
              { stars: totalStars(next), scrolls: totalScrolls(next) }
            ),
        hasNext: m.n < LEVEL_METAS.length,
      };
    } else {
      say(`${info.percent} percent.${info.newBest ? ' New best.' : ''}`);
    }
  });

  const onKey = useEffectEvent((key: 'sound' | 'pause' | 'quit') => {
    const en = engineRef.current;
    if (key === 'sound') toggleSound();
    else if (!en) return;
    else if (key === 'pause') {
      if (en.phase === 'paused') en.resume();
      else if (en.phase === 'playing' || en.phase === 'dying') en.pause();
    } else if (key === 'quit' && en.phase === 'paused') toLevels();
  });

  const ready = useEffectEvent(() => onReady?.());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const audio = createDashAudio();
    audioRef.current = audio;
    const mq = (q: string) => window.matchMedia(q).matches;
    const dela = getComputedStyle(document.documentElement)
      .getPropertyValue('--font-dela')
      .trim();
    let engine: DashEngine | null = null;
    try {
      engine = createDashEngine({
        canvas,
        reducedMotion: mq('(prefers-reduced-motion: reduce)'),
        touch: mq('(hover: none) and (pointer: coarse)'),
        hudFont: `${dela ? `${dela}, ` : ''}'Arial Black', system-ui, sans-serif`,
        audio,
        skin: skinFrom(loadSave()),
        onPhase: (p, info) => onPhase(p, info),
        onAttempt: (info) => onAttempt(info),
        onKey: (key) => onKey(key),
      });
      engine.attract();
    } catch {
      // No 2D context (very old browser, or canvas disabled): say so.
      queueMicrotask(() => setFailed(true));
    }
    engineRef.current = engine;
    // The attract run paints on its first frame; then the poster can go.
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => ready());
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timerRef.current);
      engine?.destroy();
      audio.destroy();
      engineRef.current = null;
      audioRef.current = null;
    };
  }, []);

  useEffect(() => () => sfx.destroy(), [sfx]);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ── Moving between screens ───────────────────────────────────────────────
  const focusCanvas = () => canvasRef.current?.focus({ preventScroll: true });

  const choose = (c: TitleChoice) => {
    if (c === 'levels') {
      setScreen('levels');
      say(`Levels. ${describeLevel(meta, levelProgress(save, meta.id))}`);
    } else if (c === 'gear') {
      setScreen('gear');
      say('Gear: headbands and trails.');
    } else {
      // Classic gets the screen to itself: the attract run is hidden (its
      // loop stops off screen), the menu music stops, and the sound choice
      // moves to Classic's effects.
      audioRef.current?.stop();
      audioRef.current?.setOn(false);
      if (soundRef.current) sfx.setOn(true);
      setScreen('classic');
      say('Classic.');
    }
  };

  const toTitle = (from: TitleChoice) => {
    setTitleFocus(from);
    setScreen('title');
    say('Title menu.');
  };

  const exitClassic = () => {
    sfx.setOn(false);
    engineRef.current?.attract();
    if (soundRef.current) audioRef.current?.setOn(true);
    toTitle('classic');
  };

  const play = (prac: boolean, idx = levelIdx) => {
    const en = engineRef.current;
    const m = LEVEL_METAS[idx];
    if (!en || !m) return;
    window.clearTimeout(timerRef.current);
    doneRef.current = null;
    visitRef.current = { jumps: 0, time: 0 };
    attemptRef.current = 0;
    introRef.current = `${m.name}${prac ? ', practice' : ''}. `;
    setLevelIdx(idx);
    setPractice(prac);
    setResult(null);
    setScreen('play');
    en.start(getLevel(m.id), levelProgress(save, m.id), prac);
    focusCanvas();
  };

  const onSkin = (s: KiruSkin) => {
    setSkin(s);
    setSave(saveSkin(s));
    engineRef.current?.setSkin(s);
  };

  // ── HUD ──────────────────────────────────────────────────────────────────
  // A mouse click hands focus back to the game so Space keeps jumping; a
  // keyboard press (detail 0) leaves focus where the player put it.
  const refocus = (e: MouseEvent) => {
    if (e.detail > 0 && screen === 'play') focusCanvas();
  };
  const onPauseClick = (e: MouseEvent) => {
    const en = engineRef.current;
    if (!en) return;
    if (en.phase === 'paused') en.resume();
    else en.pause();
    refocus(e);
  };
  const onSoundClick = (e: MouseEvent) => {
    toggleSound();
    refocus(e);
  };
  const onFullClick = async () => {
    const screenEl = canvasRef.current?.closest<HTMLElement>('.rr-screen');
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (screenEl) {
        await screenEl.requestFullscreen({ navigationUI: 'hide' });
        if (window.matchMedia('(pointer: coarse)').matches) {
          const o = window.screen.orientation as ScreenOrientation & {
            lock?: (to: string) => Promise<void>;
          };
          await o.lock?.('landscape').catch(() => {});
        }
      }
    } catch {
      /* refused (no gesture, or not allowed here): stay as we are */
    }
    if (screen === 'play') focusCanvas();
  };

  // M toggles sound from anywhere in the game. A focused canvas handles its
  // own keys (the runtime reports M through onKey), so those are skipped.
  const onRootKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLCanvasElement || !plainKey(e)) return;
    if (e.code === 'KeyM') {
      e.preventDefault();
      toggleSound();
    }
  };

  if (failed) {
    return (
      <div className="rr-game">
        <p className="rr-status" role="alert">
          This browser can&apos;t draw the game (no canvas support).
        </p>
      </div>
    );
  }

  const playing = screen === 'play';
  const progress = levelProgress(save, meta.id);
  const stars = totalStars(save);
  const scrolls = totalScrolls(save);

  return (
    <div className="rr-game" onKeyDown={onRootKeyDown}>
      <canvas
        ref={canvasRef}
        className="rr-canvas"
        tabIndex={playing ? 0 : -1}
        data-off={screen === 'classic' ? '' : undefined}
        role="application"
        aria-roledescription="game"
        aria-label="Kiru's Rooftop Run"
        aria-describedby={helpId}
      />
      {screen === 'classic' ? (
        <Classic
          helpId={helpId}
          sfx={sfx}
          sound={sound}
          onToggleSound={toggleSound}
          canFull={canFull}
          full={full}
          onFull={onFullClick}
          say={say}
          onExit={exitClassic}
        />
      ) : (
        <>
          <div className="rr-dash" data-screen={screen}>
            {screen === 'title' && (
              <TitleMenu
                stars={stars}
                scrolls={scrolls}
                focus={titleFocus}
                onChoose={choose}
              />
            )}
            {screen === 'levels' && (
              <LevelSelect
                index={levelIdx}
                save={save}
                onIndex={setLevelIdx}
                onPlay={(prac) => play(prac)}
                onBack={() => toTitle('levels')}
                say={say}
              />
            )}
            {screen === 'gear' && (
              <GearMenu
                stars={stars}
                scrolls={scrolls}
                skin={skin}
                onSkin={onSkin}
                onBack={() => toTitle('gear')}
                say={say}
              />
            )}
            {playing &&
              practice &&
              (phase === 'playing' || phase === 'dying') && (
                <PracticeButtons
                  onPlace={() => engineRef.current?.placeCheckpoint()}
                  onRemove={() => engineRef.current?.removeCheckpoint()}
                  refocus={focusCanvas}
                />
              )}
            {playing && phase === 'paused' && (
              <PausePanel
                name={meta.name}
                practice={practice}
                percent={runPercent}
                best={practice ? progress.practiceBest : progress.best}
                onResume={() => engineRef.current?.resume()}
                onRestart={() => engineRef.current?.restart()}
                onPractice={() => {
                  // Switching restarts the attempt; say which mode it is in.
                  introRef.current = practice
                    ? 'Practice off. '
                    : 'Practice on. ';
                  engineRef.current?.setPractice(!practice);
                }}
                onLevels={toLevels}
              />
            )}
            {playing && result && (
              <CompletePanel
                result={result}
                onNext={() => play(false, levelIdx + 1)}
                onClean={() => play(false)}
                onReplay={() => play(result.practice)}
                onLevels={toLevels}
              />
            )}
          </div>
          <Hud
            pause={
              // Nothing to pause once the level is finished.
              playing && phase !== 'complete'
                ? {
                    paused: phase === 'paused',
                    disabled: phase === 'attract',
                    onClick: onPauseClick,
                  }
                : undefined
            }
            sound={sound}
            onSound={onSoundClick}
            canFull={canFull}
            full={full}
            onFull={onFullClick}
          />
        </>
      )}
      <p className="sr-only" aria-live="polite">
        {live.text}
        {live.n % 2 ? ' ' : ''}
      </p>
    </div>
  );
}
