import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { focusInGame, plainKey } from './focus';
import { DiamondIcon, LevelsIcon, PlayIcon, RestartIcon } from './icons';

/**
 * Paused mid-level. P or Esc resumes, R restarts, Q goes to the levels
 * (M, sound, is handled for the whole game).
 */
export default function PausePanel({
  name,
  practice,
  percent,
  best,
  onResume,
  onRestart,
  onPractice,
  onLevels,
}: {
  name: string;
  practice: boolean;
  /** How far this attempt had got. */
  percent: number;
  best: number;
  onResume: () => void;
  onRestart: () => void;
  onPractice: () => void;
  onLevels: () => void;
}) {
  const resumeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    focusInGame(resumeRef.current, false);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!plainKey(e)) return;
    const act =
      e.code === 'Escape' || e.code === 'KeyP'
        ? onResume
        : e.code === 'KeyR'
          ? onRestart
          : e.code === 'KeyQ'
            ? onLevels
            : null;
    if (act) {
      e.preventDefault();
      act();
    }
  };

  return (
    <div className="rr-panel-wrap">
      <div
        className="rr-panel rr-dpanel"
        role="group"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <p
          id={titleId}
          className="rr-panel-title font-display arc-neon"
          data-tube="cyan"
        >
          Paused
        </p>
        <p className="rr-panel-sub">
          {name} · {percent}%<span className="rr-wide"> · Best {best}%</span>
        </p>
        <div className="rr-panel-grid">
          <button
            ref={resumeRef}
            type="button"
            className="rr-start"
            onClick={onResume}
          >
            <PlayIcon />
            Resume
          </button>
          <button
            type="button"
            className="rr-btn"
            data-tube="cyan"
            onClick={onRestart}
            title="Restart (R)"
          >
            <RestartIcon />
            Restart
          </button>
          <button
            type="button"
            className="rr-btn"
            data-tube="green"
            aria-pressed={practice}
            onClick={onPractice}
            title="Practice mode: checkpoints, no stars"
          >
            <DiamondIcon />
            Practice
          </button>
          <button
            type="button"
            className="rr-btn"
            data-tube="amber"
            onClick={onLevels}
            title="Levels (Q)"
          >
            <LevelsIcon />
            Levels
          </button>
        </div>
        <p className="rr-panel-keys">
          <kbd>P</kbd> resume <kbd>R</kbd> restart <kbd>Q</kbd> levels{' '}
          <kbd>M</kbd> sound
          {practice && (
            <>
              {' '}
              <kbd>C</kbd>/<kbd>X</kbd> checkpoints
            </>
          )}
        </p>
      </div>
    </div>
  );
}
