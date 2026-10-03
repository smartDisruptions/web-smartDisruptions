import type { MouseEvent } from 'react';
import { FullIcon, PauseIcon, PlayIcon, SoundIcon } from './icons';

export interface HudProps {
  /** The pause button, where there is something to pause. */
  pause?: {
    paused: boolean;
    disabled: boolean;
    onClick: (e: MouseEvent) => void;
  };
  /**
   * Kiru is running a level: the buttons step back so the signs and gates
   * under them read, and in a phone's box only Pause stays (dash.css).
   */
  inPlay?: boolean;
  sound: boolean;
  onSound: (e: MouseEvent) => void;
  canFull: boolean;
  full: boolean;
  onFull: () => void;
}

/**
 * The buttons in the screen's top-right corner: pause, sound, full screen.
 * Classic and the level game share them, with Classic's original markup.
 */
export default function Hud({
  pause,
  inPlay,
  sound,
  onSound,
  canFull,
  full,
  onFull,
}: HudProps) {
  return (
    <div className="rr-hud" data-play={inPlay ? '' : undefined}>
      {pause && (
        <button
          type="button"
          className="rr-icon"
          onClick={pause.onClick}
          disabled={pause.disabled}
          aria-label={pause.paused ? 'Resume' : 'Pause'}
          title={pause.paused ? 'Resume (P)' : 'Pause (P)'}
        >
          {pause.paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      )}
      <button
        type="button"
        className="rr-icon rr-hud-more"
        onClick={onSound}
        aria-pressed={sound}
        aria-label="Sound"
        title={sound ? 'Sound on (M)' : 'Sound off (M)'}
      >
        <SoundIcon on={sound} />
      </button>
      {canFull && (
        <button
          type="button"
          className="rr-icon rr-hud-more"
          onClick={onFull}
          aria-pressed={full}
          aria-label="Full screen"
          title={full ? 'Leave full screen' : 'Full screen'}
        >
          <FullIcon full={full} />
        </button>
      )}
    </div>
  );
}
