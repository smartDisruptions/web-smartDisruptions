'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import {
  createGame,
  R_CLEAR,
  R_FELL,
  type Brush,
  type Game,
  type GameEvent,
  type Mode,
  type Refusal,
} from './engine';

/**
 * The header's toy: build a level, then play it. The pixels, the physics and
 * the input on the canvas are engine.ts; this is the cabinet around it — the
 * buttons, the status line (the page's aria-live), the "level clear" banner,
 * and the words. React state changes only when the game says something
 * happened (a mode, a lantern, a clear), never per frame.
 */

// Pixel icons, 10×10, drawn as runs of whole pixels.
function bits(rows: string[]): string {
  let d = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      if (row[x] !== '#') {
        x++;
        continue;
      }
      let w = 0;
      while (row[x + w] === '#') w++;
      d += `M${x} ${y}h${w}v1h${-w}z`;
      x += w;
    }
  });
  return d;
}
const ICONS = {
  play: bits([
    '..........',
    '..#.......',
    '..##......',
    '..###.....',
    '..####....',
    '..#####...',
    '..####....',
    '..###.....',
    '..##......',
    '..#.......',
  ]),
  roof: bits([
    '....##....',
    '...####...',
    '.########.',
    '##########',
    '..#....#..',
    '..#.##.#..',
    '..#.##.#..',
    '..#....#..',
    '..######..',
    '..........',
  ]),
  lantern: bits([
    '....##....',
    '..######..',
    '.########.',
    '.##.##.##.',
    '.########.',
    '.##.##.##.',
    '.########.',
    '..######..',
    '....##....',
    '....##....',
  ]),
  gate: bits([
    '#........#',
    '##########',
    '.########.',
    '..#....#..',
    '##########',
    '..#....#..',
    '..#....#..',
    '..#....#..',
    '..#....#..',
    '.##....##.',
  ]),
  reset: bits([
    '..#.......',
    '.##.......',
    '########..',
    '.##.....#.',
    '..#......#',
    '.........#',
    '.........#',
    '........#.',
    '..######..',
    '..........',
  ]),
  build: bits([
    '.#######..',
    '.########.',
    '.#######..',
    '....##....',
    '....##....',
    '....##....',
    '....##....',
    '....##....',
    '....##....',
    '..........',
  ]),
  jump: bits([
    '....##....',
    '...####...',
    '..######..',
    '.########.',
    '##.####.##',
    '....##....',
    '....##....',
    '....##....',
    '....##....',
    '..........',
  ]),
};
function Px({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 10 10"
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

// The words, in the verb of whatever is in your hand.
type Hints = Record<
  'attract' | Brush | 'play' | 'fall' | 'blocked' | 'reduced',
  string
>;
function hints(touch: boolean): Hints {
  const t = touch ? 'Tap' : 'Click';
  // Two lines at most on a phone, so the buttons never move.
  return {
    attract: `Demo run. ${t} the screen to take over.`,
    roof: `${t} to set a roof. ${t} its top to clear it. Drag to draw.`,
    lantern: `${t} the sky to hang a lantern. ${t} it to take it down.`,
    goal: `${t} a rooftop to move the gate there.`,
    play: touch
      ? 'Tap to jump. Hold for a bigger one.'
      : 'Click or press Space to jump. Hold for a bigger one.',
    fall: 'Missed. Back to the start.',
    blocked: 'That wall’s too tall to jump. Build it lower.',
    reduced: 'Motion is off, so Play draws Kiru’s run as dots.',
  };
}
const TOUCH_HINTS = hints(true);
const REFUSALS: Record<Refusal, string> = {
  start: 'Kiru starts on that roof, so it stays.',
  'goal-gap': 'The gate needs a roof under it. Move the gate first.',
  'goal-near': 'The gate needs a run-up. Put it further right.',
  inside: 'Lanterns hang in the sky, not inside buildings.',
  full: 'Eight lanterns is the most. Take one down first.',
};
const BRUSHES: { key: Brush; label: string; icon: string }[] = [
  { key: 'roof', label: 'Roof', icon: ICONS.roof },
  { key: 'lantern', label: 'Lantern', icon: ICONS.lantern },
  { key: 'goal', label: 'Gate', icon: ICONS.gate },
];
const MODE_LABEL: Record<Mode, string> = {
  attract: 'Demo',
  build: 'Build',
  play: 'Play',
};

export default function LevelToy() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>('attract');
  const [brush, setBrush] = useState<Brush>('roof');
  const [status, setStatus] = useState(TOUCH_HINTS.attract);
  const [lanterns, setLanterns] = useState({ got: 0, total: 3 });
  const [banner, setBanner] = useState<{ n: number; line: string } | null>(
    null
  );
  const [again, setAgain] = useState(false);
  const [cursor, setCursor] = useState('');
  const brushRef = useRef<Brush>('roof');
  const words = useRef<Hints>(TOUCH_HINTS);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const HINTS = (words.current = hints(
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ));
    let bannerTimer = 0;
    let cleared = false;
    const showBanner = (line: string) => {
      setBanner((b) => ({ n: (b?.n ?? 0) + 1, line }));
      window.clearTimeout(bannerTimer);
      bannerTimer = window.setTimeout(() => setBanner(null), 3600);
    };
    // Clearing a level you built points you at the list: the card under the
    // cabinet (beside it on a desktop) gives one quiet ping.
    const pingOptin = () => {
      const card = document.getElementById('bg-optin');
      if (!card) return;
      card.classList.remove('bg-ping');
      void card.offsetWidth;
      card.classList.add('bg-ping');
    };
    const onEvent = (e: GameEvent) => {
      switch (e.type) {
        case 'motion':
          if (e.reduced) setStatus(HINTS.reduced);
          break;
        case 'ready':
          setReady(true);
          break;
        case 'brush':
          brushRef.current = e.brush;
          setBrush(e.brush);
          setStatus(HINTS[e.brush]);
          break;
        case 'mode':
          setMode(e.mode);
          setAgain(false);
          if (e.mode === 'play') setStatus(HINTS.play);
          else if (e.mode === 'build') setStatus(HINTS[brushRef.current]);
          else setStatus(HINTS.attract);
          if (e.mode !== 'play') setBanner(null);
          break;
        case 'lanterns':
          setLanterns({ got: e.got, total: e.total });
          break;
        case 'fall':
          setStatus(HINTS.fall);
          setAgain(false);
          break;
        case 'blocked':
          setStatus(HINTS.blocked);
          break;
        case 'clear':
          cleared = true;
          setStatus(
            e.edited
              ? 'Level clear. You just built a game.'
              : 'Level clear. Now change something and play it again.'
          );
          showBanner(
            e.edited ? 'You just built a game.' : 'Now make it yours.'
          );
          if (e.edited) pingOptin();
          break;
        case 'again':
          setAgain(true);
          break;
        case 'run':
          // Played again after a clear: back to the jump hint.
          if (cleared) setStatus(HINTS.play);
          cleared = false;
          setAgain(false);
          setBanner(null);
          break;
        case 'edit':
          setCursor(e.text);
          break;
        case 'cursor':
          setCursor(e.text);
          break;
        case 'refuse':
          setStatus(REFUSALS[e.why]);
          break;
        case 'trace': {
          const of = e.total ? `, with ${e.got} of ${e.total} lanterns.` : '.';
          if (e.result === R_CLEAR) {
            setStatus(`Kiru makes it${of} The dots are his run.`);
            if (e.edited) {
              showBanner('You just built a game.');
              pingOptin();
            }
          } else if (e.result === R_FELL)
            setStatus(
              `Kiru falls at column ${e.at + 1}. Close the gap or move a roof.`
            );
          else
            setStatus(
              `Kiru can’t get past column ${e.at + 2}. Build it lower.`
            );
          break;
        }
      }
    };
    const g = createGame(el, {
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      onEvent,
    });
    game.current = g;
    return () => {
      window.clearTimeout(bannerTimer);
      g.destroy();
      game.current = null;
    };
  }, []);

  const pickBrush = (b: Brush) => {
    brushRef.current = b;
    setBrush(b);
    game.current?.brush(b);
    setStatus(words.current[b]);
  };

  // The big Jump button: hold for a higher jump, like the screen and Space.
  const jumpDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    game.current?.jumpDown();
  };
  const jumpUp = () => game.current?.jumpUp();
  const jumpKey = (e: KeyboardEvent<HTMLButtonElement>, down: boolean) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (down && !e.repeat) game.current?.jumpDown();
    if (!down) game.current?.jumpUp();
  };

  const playing = mode === 'play';
  const editing = mode === 'build';

  return (
    <div className="bg-cab" data-mode={mode}>
      <div className="bg-screen" data-ready={ready ? '' : undefined}>
        <canvas
          ref={canvas}
          className="bg-canvas"
          tabIndex={0}
          role="application"
          aria-roledescription="level editor"
          aria-label="Your level. Arrow keys move the cursor, Enter builds with the selected tool, 1 2 and 3 pick roof, lantern or gate, Space plays and jumps, Escape stops."
          aria-describedby="bg-status"
        />
        <div
          className="bg-banner"
          data-show={banner ? '' : undefined}
          key={banner?.n ?? 0}
          aria-hidden="true"
        >
          <span className="bg-banner-kick">Level clear</span>
          <span className="bg-banner-line font-display">{banner?.line}</span>
        </div>
      </div>

      <div className="bg-deck">
        <div className="bg-statusrow">
          <span className="bg-chip" data-mode={mode}>
            {MODE_LABEL[mode]}
          </span>
          <p id="bg-status" className="bg-status" aria-live="polite">
            {status}
          </p>
          <span
            className="bg-count"
            data-none={lanterns.total ? undefined : ''}
            role="img"
            aria-label={`Lanterns: ${lanterns.got} of ${lanterns.total}`}
          >
            <Px d={ICONS.lantern} className="bg-count-icon" />
            <span aria-hidden="true">
              {lanterns.got}/{lanterns.total}
            </span>
          </span>
        </div>

        <div className="bg-tools" role="group" aria-label="Level tools">
          {playing ? (
            <>
              <button
                type="button"
                className="bg-tool bg-tool-mode"
                onClick={() => game.current?.build()}
              >
                <Px d={ICONS.build} className="bg-ico" />
                <span>Build</span>
              </button>
              <button
                type="button"
                className="bg-tool bg-jump"
                onPointerDown={jumpDown}
                onPointerUp={jumpUp}
                onPointerCancel={jumpUp}
                onKeyDown={(e) => jumpKey(e, true)}
                onKeyUp={(e) => jumpKey(e, false)}
                onClick={(e) => {
                  // A click with no pointer behind it (assistive tech): a short hop.
                  if (e.detail === 0) {
                    game.current?.jumpDown();
                    window.setTimeout(() => game.current?.jumpUp(), 120);
                  }
                }}
              >
                <Px d={again ? ICONS.reset : ICONS.jump} className="bg-ico" />
                <span>{again ? 'Again' : 'Jump'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="bg-tool bg-tool-play"
                onClick={() => game.current?.play()}
              >
                <Px d={ICONS.play} className="bg-ico" />
                <span>Play</span>
              </button>
              {BRUSHES.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  className="bg-tool"
                  aria-pressed={editing && brush === b.key}
                  onClick={() => pickBrush(b.key)}
                >
                  <Px d={b.icon} className="bg-ico" />
                  <span>{b.label}</span>
                </button>
              ))}
              <button
                type="button"
                className="bg-tool bg-tool-reset"
                onClick={() => {
                  game.current?.reset();
                  setStatus('Back to the demo level.');
                }}
                aria-label="Reset the level"
              >
                <Px d={ICONS.reset} className="bg-ico" />
                <span>Reset</span>
              </button>
            </>
          )}
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {cursor}
      </p>
      <p className="bg-keys" aria-hidden="true">
        <kbd>←↑→↓</kbd> move · <kbd>Enter</kbd> build · <kbd>Space</kbd> play
        &amp; jump · <kbd>Esc</kbd> stop
      </p>
    </div>
  );
}
