import type { MouseEvent } from 'react';
import { DiamondIcon } from './icons';

/**
 * Practice mode's two checkpoint buttons, bottom left, where they cover only
 * road already run. Shown on every device; C or Z and X do the same.
 *
 * A mouse press must not take focus from the canvas (Space would stop
 * jumping), so it is cancelled; a tap hands focus straight back.
 */
export default function PracticeButtons({
  onPlace,
  onRemove,
  refocus,
}: {
  onPlace: () => void;
  onRemove: () => void;
  refocus: () => void;
}) {
  const keep = (e: MouseEvent) => e.preventDefault();
  const run = (act: () => void) => (e: MouseEvent) => {
    act();
    if (e.detail > 0) refocus();
  };
  return (
    <div className="rr-cp" role="group" aria-label="Checkpoints">
      <button
        type="button"
        className="rr-icon"
        onMouseDown={keep}
        onClick={run(onPlace)}
        aria-label="Place a checkpoint"
        title="Place a checkpoint (C)"
      >
        <DiamondIcon mark="+" />
      </button>
      <button
        type="button"
        className="rr-icon"
        onMouseDown={keep}
        onClick={run(onRemove)}
        aria-label="Remove the last checkpoint"
        title="Remove the last checkpoint (X)"
      >
        <DiamondIcon mark="-" />
      </button>
    </div>
  );
}
