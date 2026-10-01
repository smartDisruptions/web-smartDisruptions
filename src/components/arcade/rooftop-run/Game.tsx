'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { createRooftopRun, type Engine, type Mode, type RunStats } from './engine';
import { Sfx } from './sfx';

export interface GameProps {
  /** id of the visible how-to-play line, for aria-describedby. */
  helpId: string;
  /** Called once the first frame is on the canvas, so the poster can go. */
  onReady?: () => void;
}

/**
 * The playable screen: the canvas, the HUD buttons (pause, sound, full
 * screen), the pause and game-over panels, and a polite live region. This module and everything it imports is
 * one lazy chunk — the page fetches it when Start is pressed, never before.
 */
export default function Game({ helpId, onReady }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sfxRef = useRef<Sfx | null>(null);
  const soundRef = useRef(false);
  const runsRef = useRef(0);
  const onReadyRef = useRef(onReady);
  const [mode, setMode] = useState<Mode>('running');
  const [stats, setStats] = useState<RunStats>({ score: 0, best: 0, newBest: false, coins: 0 });
  const [sound, setSound] = useState(false);
  const [say, setSay] = useState('');
  const [failed, setFailed] = useState(false);
  // Full screen where the browser allows it (not on iPhone): on a phone that
  // is a landscape playfield instead of a small box in a portrait page.
  const [canFull] = useState(() => typeof document !== 'undefined' && !!document.fullscreenEnabled);
  const [full, setFull] = useState(false);

  const toggleSound = useCallback(() => {
    const next = !soundRef.current;
    soundRef.current = next;
    sfxRef.current?.setOn(next);
    setSound(next);
  }, []);
  const toggleSoundRef = useRef(toggleSound);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sfx = new Sfx();
    sfxRef.current = sfx;
    const mq = (q: string) => window.matchMedia(q).matches;
    const dela = getComputedStyle(document.documentElement).getPropertyValue('--font-dela').trim();
    let engine: Engine | null = null;
    try {
      engine = createRooftopRun(canvas, {
        reducedMotion: mq('(prefers-reduced-motion: reduce)'),
        touch: mq('(hover: none) and (pointer: coarse)'),
        sfx,
        hudFont: `${dela ? `${dela}, ` : ''}'Arial Black', system-ui, sans-serif`,
        onSoundKey: () => toggleSoundRef.current(),
        onMode: (m, s) => {
          setMode(m);
          setStats(s);
          if (m === 'running') {
            runsRef.current += 1;
            setSay(
              runsRef.current === 1
                ? 'Kiru is running. Space, the up arrow or a tap to jump; hold to jump higher.'
                : 'Running again.',
            );
          } else if (m === 'paused') {
            setSay('Paused. Press Space or tap to carry on.');
          } else if (m === 'over') {
            setSay(
              `Game over. Score ${s.score}. Best ${s.best}.${s.newBest ? ' A new best.' : ''} Press Space or tap to run again.`,
            );
          }
        },
      });
    } catch {
      // No 2D context (very old browser, or canvas disabled): say so.
      queueMicrotask(() => setFailed(true));
    }
    engineRef.current = engine;
    canvas.focus({ preventScroll: true });
    onReadyRef.current?.();
    return () => {
      engine?.destroy();
      sfx.destroy();
      engineRef.current = null;
      sfxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // A mouse click hands focus back to the game so Space keeps jumping; a
  // keyboard press (detail 0) leaves focus where the player put it.
  const refocus = (e: MouseEvent) => {
    if (e.detail > 0) canvasRef.current?.focus({ preventScroll: true });
  };
  const onPauseClick = (e: MouseEvent) => {
    const en = engineRef.current;
    if (!en) return;
    if (en.mode === 'paused') en.resume();
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
          const o = screen.orientation as ScreenOrientation & { lock?: (to: string) => Promise<void> };
          await o.lock?.('landscape').catch(() => {});
        }
      }
    } catch {
      /* refused (no gesture, or not allowed here): stay as we are */
    }
    canvasRef.current?.focus({ preventScroll: true });
  };
  const again = () => {
    engineRef.current?.restart();
    canvasRef.current?.focus({ preventScroll: true });
  };
  const resume = () => {
    engineRef.current?.resume();
    canvasRef.current?.focus({ preventScroll: true });
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

  const busy = mode === 'over' || mode === 'dying';
  return (
    <div className="rr-game">
      <canvas
        ref={canvasRef}
        className="rr-canvas"
        tabIndex={0}
        role="application"
        aria-roledescription="game"
        aria-label="Kiru's Rooftop Run"
        aria-describedby={helpId}
      />
      <div className="rr-hud">
        <button
          type="button"
          className="rr-icon"
          onClick={onPauseClick}
          disabled={busy}
          aria-label={mode === 'paused' ? 'Resume' : 'Pause'}
          title={mode === 'paused' ? 'Resume (P)' : 'Pause (P)'}
        >
          {mode === 'paused' ? (
            <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
              <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
              <rect x="4.5" y="3.5" width="4" height="13" rx="1.2" />
              <rect x="11.5" y="3.5" width="4" height="13" rx="1.2" />
            </svg>
          )}
        </button>
        <button
          type="button"
          className="rr-icon"
          onClick={onSoundClick}
          aria-pressed={sound}
          aria-label="Sound"
          title={sound ? 'Sound on (M)' : 'Sound off (M)'}
        >
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 7.5h3l4-3.5v12l-4-3.5h-3z" fill="currentColor" stroke="none" />
            {sound ? (
              <path d="M13.5 7.2a4 4 0 0 1 0 5.6M15.8 5a7 7 0 0 1 0 10" />
            ) : (
              <path d="M13.5 7.5l4 5M17.5 7.5l-4 5" />
            )}
          </svg>
        </button>
        {canFull && (
          <button
            type="button"
            className="rr-icon"
            onClick={onFullClick}
            aria-pressed={full}
            aria-label="Full screen"
            title={full ? 'Leave full screen' : 'Full screen'}
          >
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {full ? (
                <path d="M7.5 3.5v4h-4M12.5 3.5v4h4M7.5 16.5v-4h-4M12.5 16.5v-4h4" />
              ) : (
                <path d="M3.5 7.5v-4h4M16.5 7.5v-4h-4M3.5 12.5v4h4M16.5 12.5v4h-4" />
              )}
            </svg>
          </button>
        )}
      </div>

      {mode === 'paused' && (
        <div className="rr-panel-wrap">
          <div className="rr-panel" role="group" aria-label="Paused">
            <p className="rr-panel-title font-display arc-neon" data-tube="cyan">
              Paused
            </p>
            <button type="button" className="rr-start" onClick={resume}>
              <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
                <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
              </svg>
              Resume
            </button>
            <p className="rr-panel-note">or press Space, or tap the screen</p>
          </div>
        </div>
      )}

      {mode === 'over' && (
        <div className="rr-panel-wrap">
          <div className="rr-panel" role="group" aria-label="Game over">
            <p className="rr-panel-title font-display arc-neon">Game over</p>
            <div className="rr-panel-scores">
              <span>
                Score<b>{stats.score.toLocaleString('en-US')}</b>
              </span>
              <span>
                Best<b>{stats.best.toLocaleString('en-US')}</b>
              </span>
              {stats.newBest && <span className="rr-newbest">New best</span>}
            </div>
            <button type="button" className="rr-start" onClick={again}>
              <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
                <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
              </svg>
              Run again
            </button>
            <p className="rr-panel-note">or press Space, or tap the screen</p>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {say}
      </p>
    </div>
  );
}
