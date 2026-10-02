import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import type { Engine, Mode, RunStats } from '../../engine';
import type { Sfx } from '../../sfx';
import Hud from './Hud';
import { LevelsIcon, PlayIcon } from './icons';

export interface ClassicProps {
  helpId: string;
  /** Classic's own sound effects; the shell's sound button drives them. */
  sfx: Sfx;
  sound: boolean;
  onToggleSound: () => void;
  canFull: boolean;
  full: boolean;
  onFull: () => void;
  /** The shell's polite live region. */
  say: (line: string) => void;
  /** Back to the title menu. */
  onExit: () => void;
}

/**
 * Classic: the original endless run, exactly as it was (its engine, its
 * canvas HUD of score, best and coins, its pause and game-over panels, its
 * spoken lines), plus a way back to the menu. Its engine is a chunk of its
 * own, fetched the first time Classic is chosen.
 */
export default function Classic({
  helpId,
  sfx,
  sound,
  onToggleSound,
  canFull,
  full,
  onFull,
  say,
  onExit,
}: ClassicProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const runsRef = useRef(0);
  const [mode, setMode] = useState<Mode>('running');
  const [stats, setStats] = useState<RunStats>({
    score: 0,
    best: 0,
    newBest: false,
    coins: 0,
  });
  const [load, setLoad] = useState<'loading' | 'ready' | 'error' | 'failed'>(
    'loading'
  );

  const onMode = useEffectEvent((m: Mode, s: RunStats) => {
    setMode(m);
    setStats(s);
    if (m === 'running') {
      runsRef.current += 1;
      say(
        runsRef.current === 1
          ? 'Kiru is running. Space, the up arrow or a tap to jump; hold to jump higher.'
          : 'Running again.'
      );
    } else if (m === 'paused') {
      say('Paused. Press Space or tap to carry on.');
    } else if (m === 'over') {
      say(
        `Game over. Score ${s.score}. Best ${s.best}.${s.newBest ? ' A new best.' : ''} Press Space or tap to run again.`
      );
    }
  });
  const onSoundKey = useEffectEvent(() => onToggleSound());

  useEffect(() => {
    let cancelled = false;
    let engine: Engine | null = null;
    import('../../engine').then(
      ({ createRooftopRun }) => {
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        const mq = (q: string) => window.matchMedia(q).matches;
        const dela = getComputedStyle(document.documentElement)
          .getPropertyValue('--font-dela')
          .trim();
        try {
          engine = createRooftopRun(canvas, {
            reducedMotion: mq('(prefers-reduced-motion: reduce)'),
            touch: mq('(hover: none) and (pointer: coarse)'),
            sfx,
            hudFont: `${dela ? `${dela}, ` : ''}'Arial Black', system-ui, sans-serif`,
            onSoundKey: () => onSoundKey(),
            onMode: (m, s) => onMode(m, s),
          });
        } catch {
          // No 2D context (very old browser, or canvas disabled): say so.
          setLoad('failed');
          return;
        }
        engineRef.current = engine;
        setLoad('ready');
        canvas.focus({ preventScroll: true });
      },
      () => {
        if (!cancelled) setLoad('error');
      }
    );
    return () => {
      cancelled = true;
      engine?.destroy();
      engineRef.current = null;
    };
  }, [sfx]);

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
    onToggleSound();
    refocus(e);
  };
  const again = () => {
    engineRef.current?.restart();
    canvasRef.current?.focus({ preventScroll: true });
  };
  const resume = () => {
    engineRef.current?.resume();
    canvasRef.current?.focus({ preventScroll: true });
  };
  // The way back to the title, beside each panel's main button.
  const menu = (
    <button type="button" className="rr-btn" onClick={onExit}>
      <LevelsIcon />
      Menu
    </button>
  );

  if (load === 'failed') {
    return (
      <div className="rr-game rr-classic">
        <p className="rr-status" role="alert">
          This browser can&apos;t draw the game (no canvas support).
        </p>
      </div>
    );
  }

  const busy = mode === 'over' || mode === 'dying';
  return (
    <div className="rr-game rr-classic">
      <canvas
        ref={canvasRef}
        className="rr-canvas"
        tabIndex={0}
        role="application"
        aria-roledescription="game"
        aria-label="Kiru's Rooftop Run"
        aria-describedby={helpId}
      />
      <Hud
        pause={{
          paused: mode === 'paused',
          disabled: busy || load !== 'ready',
          onClick: onPauseClick,
        }}
        sound={sound}
        onSound={onSoundClick}
        canFull={canFull}
        full={full}
        onFull={onFull}
      />

      {load === 'loading' && (
        <p className="rr-status" role="status">
          Loading…
        </p>
      )}
      {load === 'error' && (
        <div className="rr-panel-wrap">
          <div className="rr-panel" role="group" aria-label="Classic">
            <p className="rr-panel-note" role="alert">
              Classic didn&apos;t load. Check the connection and try again.
            </p>
            <div className="rr-panel-pair">{menu}</div>
          </div>
        </div>
      )}

      {mode === 'paused' && (
        <div className="rr-panel-wrap">
          <div className="rr-panel" role="group" aria-label="Paused">
            <p
              className="rr-panel-title font-display arc-neon"
              data-tube="cyan"
            >
              Paused
            </p>
            <div className="rr-panel-pair">
              <button type="button" className="rr-start" onClick={resume}>
                <PlayIcon />
                Resume
              </button>
              {menu}
            </div>
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
            <div className="rr-panel-pair">
              <button type="button" className="rr-start" onClick={again}>
                <PlayIcon />
                Run again
              </button>
              {menu}
            </div>
            <p className="rr-panel-note">or press Space, or tap the screen</p>
          </div>
        </div>
      )}
    </div>
  );
}
