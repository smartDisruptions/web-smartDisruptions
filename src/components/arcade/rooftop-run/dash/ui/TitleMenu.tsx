import { useEffect, useRef } from 'react';
import { MAX_SCROLLS, MAX_STARS } from '../storage';
import { focusInGame } from './focus';
import {
  GearIcon,
  InfinityIcon,
  PlayIcon,
  ScrollIcon,
  StarIcon,
} from './icons';

export type TitleChoice = 'levels' | 'classic' | 'gear';

/**
 * The title screen, over Kiru's attract run: the logo top left, the menu on
 * the right, so he stays in view on the left at every size.
 */
export default function TitleMenu({
  stars,
  scrolls,
  focus,
  onChoose,
}: {
  stars: number;
  scrolls: number;
  /** The button to focus: the one the player last came back from. */
  focus: TitleChoice;
  onChoose: (choice: TitleChoice) => void;
}) {
  const levels = useRef<HTMLButtonElement>(null);
  const classic = useRef<HTMLButtonElement>(null);
  const gear = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const target =
      focus === 'classic' ? classic : focus === 'gear' ? gear : levels;
    focusInGame(target.current);
  }, [focus]);

  return (
    <div className="rr-menu" role="group" aria-label="Kiru's Rooftop Run">
      <div className="rr-menu-head">
        <div aria-hidden="true">
          <p className="rr-logo-a arc-neon" data-tube="amber">
            Kiru&apos;s
          </p>
          <p
            className="rr-logo-b font-display arc-neon arc-flicker"
            data-tube="red"
          >
            Rooftop Run
          </p>
        </div>
        <p className="rr-tally">
          <span>
            <StarIcon filled />
            <span>
              {stars}
              <span className="rr-of">/{MAX_STARS}</span>
            </span>
            <span className="sr-only"> stars</span>
          </span>
          <span>
            <ScrollIcon got />
            <span>
              {scrolls}
              <span className="rr-of">/{MAX_SCROLLS}</span>
            </span>
            <span className="sr-only"> secret scrolls</span>
          </span>
        </p>
      </div>
      <div className="rr-menu-btns">
        <button
          ref={levels}
          type="button"
          className="rr-start"
          onClick={() => onChoose('levels')}
        >
          <PlayIcon />
          Levels
        </button>
        <button
          ref={classic}
          type="button"
          className="rr-btn"
          data-tube="cyan"
          onClick={() => onChoose('classic')}
        >
          <InfinityIcon />
          Classic
        </button>
        <button
          ref={gear}
          type="button"
          className="rr-btn"
          data-tube="amber"
          onClick={() => onChoose('gear')}
        >
          <GearIcon />
          Gear
        </button>
      </div>
    </div>
  );
}
