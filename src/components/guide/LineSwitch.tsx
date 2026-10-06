'use client';

import { useEffect, useRef, useState } from 'react';

type Mode = 'build' | 'run';

type Node = { title: string; sub: string; tone?: 'plan' | 'api' };

const SCENES: Record<
  Mode,
  { nodes: Node[]; hot: number; caption: string; bill: string }
> = {
  build: {
    nodes: [
      { title: 'You', sub: 'at your keyboard' },
      { title: 'Claude Code', sub: 'paid by your monthly plan', tone: 'plan' },
      { title: 'Your game', sub: 'built, tested and put online' },
      { title: 'Players', sub: 'play it. Claude is not involved.' },
    ],
    hot: 0,
    bill: 'Who pays: your monthly plan, one flat price',
    caption:
      "This is most games. Claude helped you make it, and your plan paid for that. Once it's out, players are only playing a game. Nothing they do calls Claude.",
  },
  run: {
    nodes: [
      { title: 'A player', sub: 'talks to a character' },
      { title: 'Your game', sub: 'asks Claude what to say back' },
      { title: 'Claude', sub: 'writes a reply, paid per use', tone: 'api' },
      {
        title: 'Your bill',
        sub: 'goes up a little each time',
        tone: 'api',
      },
    ],
    hot: 2,
    bill: 'Who pays: you, a little for every reply',
    caption:
      'Here the game asks Claude for something new while people play. Every reply the character gives is one paid trip, so a thousand players chatting means thousands of trips.',
  },
};

/**
 * The line between the two bills, as a switch. Dots travel the arrows on a
 * CSS transform loop; the loop pauses off screen (IntersectionObserver) and
 * doesn't run at all under reduced motion, where the dots sit still mid-way.
 * In "running" mode each dot that reaches Claude bumps the request counter,
 * driven by the animation's own iteration event, so there is no timer.
 */
export default function LineSwitch() {
  const [mode, setMode] = useState<Mode>('build');
  const [count, setCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const scene = SCENES[mode];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="gd-flow"
      ref={rootRef}
      data-mode={mode}
      data-playing={playing}
    >
      <div className="gd-switch" role="group" aria-label="Show me">
        {(['build', 'run'] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            className="gd-switch-btn"
            onClick={() => {
              setMode(m);
              setCount(0);
            }}
          >
            {m === 'build' ? 'A normal game' : 'With Claude inside'}
          </button>
        ))}
        <span className="gd-switch-thumb" aria-hidden />
      </div>

      <ol className="gd-flow-row" key={mode}>
        {scene.nodes.map((n, i) => (
          <li key={n.title} className="gd-flow-item">
            <div className="gd-flow-node" data-tone={n.tone ?? 'none'}>
              <span className="gd-flow-title">{n.title}</span>
              <span className="gd-flow-sub">{n.sub}</span>
              {mode === 'run' && i === 3 && (
                <span className="gd-flow-count tabular-nums" aria-live="off">
                  {count} {count === 1 ? 'reply' : 'replies'} paid
                </span>
              )}
            </div>
            {i < scene.nodes.length - 1 && (
              <span
                className="gd-flow-link"
                data-hot={i === scene.hot && mode === 'run'}
                aria-hidden
              >
                <span
                  className="gd-flow-run"
                  style={{ animationDelay: `${i * 0.55}s` }}
                  onAnimationIteration={
                    mode === 'run' && i === 2
                      ? () => setCount((c) => c + 1)
                      : undefined
                  }
                >
                  <span className="gd-flow-dot" />
                </span>
              </span>
            )}
          </li>
        ))}
      </ol>

      <p className="gd-flow-bill" data-tone={mode === 'run' ? 'api' : 'plan'}>
        {scene.bill}
      </p>
      <p className="gd-flow-caption font-read">{scene.caption}</p>
    </div>
  );
}
