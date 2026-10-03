import { useEffect, useId, useRef, type KeyboardEvent } from 'react';
import { focusInGame, plainKey } from './focus';
import {
  LevelsIcon,
  PlayIcon,
  RestartIcon,
  ScrollIcon,
  StarIcon,
} from './icons';

export interface CompleteResult {
  name: string;
  practice: boolean;
  /**
   * The level's attempts over every visit, as on screen ("Attempt N") and on
   * the level card.
   */
  attempts: number;
  /** Jumps and seconds across this visit's attempts. */
  jumps: number;
  time: number;
  /** Scrolls picked up on the finishing run. */
  found: [boolean, boolean, boolean];
  /** The level's stars, and whether this finish earned them. */
  stars: number;
  starsNew: boolean;
  /** Gear this finish unlocked. */
  unlocked: string[];
  hasNext: boolean;
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** What the live region says when the panel appears. */
export function describeResult(r: CompleteResult): string {
  const found = r.found.filter(Boolean).length;
  const parts = [
    r.practice ? `Practice complete: ${r.name}.` : `Level complete: ${r.name}!`,
    `${r.attempts} ${r.attempts === 1 ? 'attempt' : 'attempts'}, ${r.jumps} ${r.jumps === 1 ? 'jump' : 'jumps'}, ${formatTime(r.time)}.`,
  ];
  if (!r.practice) {
    parts.push(`${found} of 3 scrolls found.`);
    parts.push(
      r.starsNew
        ? `${r.stars} stars earned.`
        : `${r.stars} stars, already yours.`
    );
  }
  if (r.unlocked.length) parts.push(`Unlocked: ${r.unlocked.join(', ')}.`);
  return parts.join(' ');
}

/**
 * The level's end card, after the canvas has had its fireworks. Esc goes
 * back to the levels.
 */
export default function CompletePanel({
  result: r,
  onNext,
  onClean,
  onReplay,
  onLevels,
}: {
  result: CompleteResult;
  onNext: () => void;
  /** After a practice finish: the same level, for real. */
  onClean: () => void;
  onReplay: () => void;
  onLevels: () => void;
}) {
  const firstRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    focusInGame(firstRef.current, false);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (plainKey(e) && e.code === 'Escape') {
      e.preventDefault();
      onLevels();
    }
  };

  return (
    <div className="rr-panel-wrap">
      <div
        className="rr-panel rr-dpanel rr-done"
        role="group"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <p className="rr-panel-sub rr-wide">{r.name}</p>
        <p
          id={titleId}
          className="rr-panel-title font-display arc-neon"
          data-tube={r.practice ? 'cyan' : 'amber'}
        >
          {r.practice ? 'Practice complete' : 'Level complete'}
        </p>
        <dl className="rr-stats">
          <div>
            <dt>Attempts</dt>
            <dd>{r.attempts.toLocaleString('en-US')}</dd>
          </div>
          <div>
            <dt>Jumps</dt>
            <dd>{r.jumps.toLocaleString('en-US')}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>{formatTime(r.time)}</dd>
          </div>
        </dl>
        {r.practice ? (
          <p className="rr-loot-note">
            Practice keeps no stars or scrolls. Next, run it without
            checkpoints.
          </p>
        ) : (
          <div className="rr-loot">
            <span className="rr-loot-scrolls">
              {r.found.map((got, i) => (
                <ScrollIcon key={i} got={got} />
              ))}
              <span className="sr-only">
                {r.found.filter(Boolean).length} of 3 scrolls found
              </span>
            </span>
            <span
              className="rr-loot-stars"
              data-new={r.starsNew ? '' : undefined}
            >
              <StarIcon filled />
              {r.starsNew ? `+${r.stars}` : r.stars}
              <span className="rr-loot-word">
                {r.starsNew ? ' stars' : ' stars, already yours'}
              </span>
            </span>
          </div>
        )}
        {r.unlocked.length > 0 && (
          <p className="rr-unlock">New gear: {r.unlocked.join(' · ')}</p>
        )}
        <div className="rr-panel-row rr-done-row">
          {(r.practice || r.hasNext) && (
            <button
              ref={firstRef}
              type="button"
              className="rr-start"
              onClick={r.practice ? onClean : onNext}
            >
              <PlayIcon />
              {r.practice ? (
                <>
                  Play<span className="rr-wide"> it clean</span>
                </>
              ) : (
                <>
                  Next<span className="rr-wide"> level</span>
                </>
              )}
            </button>
          )}
          <button
            ref={r.practice || r.hasNext ? undefined : firstRef}
            type="button"
            className="rr-btn"
            data-tube="cyan"
            onClick={onReplay}
          >
            <RestartIcon />
            Replay
          </button>
          <button
            type="button"
            className="rr-btn"
            data-tube="amber"
            onClick={onLevels}
          >
            <LevelsIcon />
            Levels
          </button>
        </div>
      </div>
    </div>
  );
}
