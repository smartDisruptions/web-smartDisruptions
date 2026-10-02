'use client';

import { useCallback, useRef, useState, type ComponentType, type ReactNode } from 'react';
import type { GameProps } from './rooftop-run/Game';

/**
 * The Rooftop Run cabinet's screen. Until Start is pressed this is a poster
 * (server-rendered art passed in as `poster`) and one button; the game —
 * engine, art, Kiru's canvas rig, the synth — is a separate chunk that is
 * fetched by the press itself. An idle Arcade page runs no game code and no
 * animation frame loop.
 *
 * The fetch starts on pointerdown, a beat before the click lands, which is
 * still the press: nothing is prefetched on hover, on scroll or on idle.
 */
const loadGame = () => import('./rooftop-run/Game');

export default function RooftopRun({ poster, helpId }: { poster: ReactNode; helpId: string }) {
  const [Game, setGame] = useState<ComponentType<GameProps> | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [ready, setReady] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  const warm = useCallback(() => {
    loadGame().catch(() => {});
  }, []);

  const start = useCallback(async () => {
    if (state === 'loading' || Game) return;
    setState('loading');
    // Bring the whole cabinet on screen before the first jump. A cabinet
    // taller than the window (a phone on its side) can't be: then the screen
    // itself, clear of the header and the tab bar (its scroll margins, in
    // arcade.css).
    const cab = screenRef.current?.closest('.rr-cab');
    if (cab) {
      const r = cab.getBoundingClientRect();
      if (r.top < 56 || r.bottom > window.innerHeight) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const target =
          r.height > window.innerHeight && screenRef.current
            ? screenRef.current
            : cab;
        target.scrollIntoView({
          block: 'center',
          behavior: reduce ? 'auto' : 'smooth',
        });
      }
    }
    try {
      const mod = await loadGame();
      setGame(() => mod.default);
      setState('idle');
    } catch {
      setState('error');
    }
  }, [state, Game]);

  const onReady = useCallback(() => setReady(true), []);

  return (
    <div ref={screenRef} className="rr-screen">
      {!ready && (
        <div className="rr-poster">
          {poster}
          <button
            type="button"
            className="rr-poster-hit"
            tabIndex={-1}
            aria-hidden="true"
            onPointerDown={warm}
            onClick={start}
          />
          {!Game && (
            <div className="rr-start-wrap">
              <button
                type="button"
                className="rr-start"
                onPointerDown={warm}
                onClick={start}
                data-pressed={state === 'loading' ? '' : undefined}
                aria-describedby={helpId}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
                  <path d="M6 4.2v11.6a.8.8 0 0 0 1.2.7l9.4-5.8a.8.8 0 0 0 0-1.4L7.2 3.5A.8.8 0 0 0 6 4.2Z" />
                </svg>
                Press Start
                <span className="sr-only">: play Kiru&apos;s Rooftop Run</span>
              </button>
              <p className="rr-hint rr-blink" aria-hidden="true">
                Free play
              </p>
            </div>
          )}
          {state === 'loading' && (
            <p className="rr-status" role="status">
              Loading…
            </p>
          )}
          {state === 'error' && (
            <p className="rr-status" role="alert">
              The game didn&apos;t load. Check the connection and press Start again.
            </p>
          )}
        </div>
      )}
      {Game && <Game helpId={helpId} onReady={onReady} />}
      <div className="rr-glass" aria-hidden="true" />
    </div>
  );
}
