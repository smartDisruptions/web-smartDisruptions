'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Pip at his mouse hole, beside the archive's door, waving you off. In
 * Whack-a-Dust-Bunny he pops up out of the holes too, and you must not bonk
 * him. Here you can: tap him and he flinches into his hiding pose with an
 * "OW! Not me!", then pops back out.
 *
 * Both poses arrive already drawn (server-rendered Pips passed in as props),
 * so this island ships no art, only a state flag. The button is a real,
 * labelled button; the bubble is a polite status message, so a screen reader
 * hears the joke too.
 */
type Mood = 'idle' | 'ow' | 'back';

export default function MouseHole({ rest, flinch }: { rest: ReactNode; flinch: ReactNode }) {
  const [mood, setMood] = useState<Mood>('idle');
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const bonk = () => {
    window.clearTimeout(timer.current);
    setMood('ow');
    timer.current = window.setTimeout(() => setMood('back'), 1500);
  };

  return (
    <div className="gh-hole" data-mood={mood}>
      <span className="gh-hole-mouth" aria-hidden="true" />
      <button type="button" className="gh-hole-btn" onClick={bonk} aria-label="Bonk Pip">
        <span className="gh-hole-pip gh-hole-rest">{rest}</span>
        <span className="gh-hole-pip gh-hole-flinch">{flinch}</span>
      </button>
      <span className="gh-hole-arch" aria-hidden="true" />
      <span className="gh-ow" role="status">
        {mood === 'ow' ? 'OW! Not me!' : ''}
      </span>
    </div>
  );
}
