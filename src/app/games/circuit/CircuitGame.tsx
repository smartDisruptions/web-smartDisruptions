'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import {
  GATE_RULES,
  GATE_TYPES,
  evaluate,
  generatePuzzle,
  isSolved,
  localDateKey,
  signalLayers,
  type GateType,
  type Puzzle,
} from '@/lib/circuit';

// Same bold-primary arcade palette as /games — red star, yellow + blue cast.
const RED = '#ef4444';
const YELLOW = '#facc15';
const BLUE = '#3b82f6';
const RED_INK = 'var(--arcade-red-ink)';
const YELLOW_INK = 'var(--arcade-yellow-ink)';
const BLUE_INK = 'var(--arcade-blue-ink)';

// The board is a PCB: always dark, in both themes, like the CRT cabinets on
// the Arcade page. Copper idle traces, yellow live signal, gray unknowns.
const PCB_BG = '#0c1710';
const PCB_EDGE = '#1d3325';
const COPPER = '#8a5a33';
const WIRE_OFF = '#3d4a41';
const WIRE_UNKNOWN = '#5a6a60';
const SILK = '#e8f0e8';

const STORE_KEY = 'sd-circuit-store';

interface DayResult {
  timeSec: number;
  swaps: number;
  gates: number;
}

interface Store {
  lastSolved: string | null;
  streak: number;
  totalSolved: number;
  days: Record<string, DayResult>;
  progress: {
    dateKey: string;
    assigned: (GateType | null)[];
    startedAt: number | null;
    swaps: number;
  } | null;
}

const EMPTY_STORE: Store = {
  lastSolved: null,
  streak: 0,
  totalSolved: 0,
  days: {},
  progress: null,
};

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...EMPTY_STORE };
    return { ...EMPTY_STORE, ...(JSON.parse(raw) as Store) };
  } catch {
    return { ...EMPTY_STORE };
  }
}

function saveStore(store: Store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // Private mode etc. — the game still plays, it just won't remember.
  }
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------

// The puzzle depends on the player's local date and saved progress, so it can
// only exist client-side. Same pattern as ThemeToggle: useSyncExternalStore
// gives a hydration-safe "client is ready" flag with no setState-in-effect —
// the inner component then never renders on the server, so its useState
// initializers can read localStorage directly.
const subscribeNever = () => () => {};

export default function CircuitGame() {
  const isClient = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
  if (!isClient) {
    return (
      <div className="py-24 text-center">
        <p className="font-mono-accent text-sm uppercase tracking-[0.3em] text-text-secondary">
          Powering up the board…
        </p>
      </div>
    );
  }
  return <GameInner />;
}

interface GameInit {
  puzzle: Puzzle;
  store: Store;
  done: DayResult | null;
  resume: NonNullable<Store['progress']> | null;
}

function GameInner() {
  const [init] = useState<GameInit>(() => {
    const dateKey = localDateKey(new Date());
    const puzzle = generatePuzzle(dateKey);
    const store = loadStore();
    const done = store.days[dateKey] ?? null;
    const resume =
      !done && store.progress && store.progress.dateKey === dateKey
        ? store.progress
        : null;
    return { puzzle, store, done, resume };
  });
  const puzzle = init.puzzle;
  const [assigned, setAssigned] = useState<(GateType | null)[]>(() =>
    init.done
      ? puzzle.gates.map((g) => g.solution)
      : puzzle.gates.map((_, i) => init.resume?.assigned[i] ?? null)
  );
  const [combo, setCombo] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(
    init.resume?.startedAt ?? null
  );
  const [swaps, setSwaps] = useState(init.resume?.swaps ?? 0);
  const [solvedResult, setSolvedResult] = useState<DayResult | null>(init.done);
  const [streak, setStreak] = useState(init.store.streak);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');
  const storeRef = useRef<Store>(init.store);

  // One shared 1s tick drives the play timer and the next-puzzle countdown.
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const persistProgress = useCallback(
    (
      next: (GateType | null)[],
      nextStartedAt: number | null,
      nextSwaps: number
    ) => {
      const store = storeRef.current;
      const updated: Store = {
        ...store,
        progress: {
          dateKey: puzzle.dateKey,
          assigned: next,
          startedAt: nextStartedAt,
          swaps: nextSwaps,
        },
      };
      storeRef.current = updated;
      saveStore(updated);
    },
    [puzzle]
  );

  const handleAssign = useCallback(
    (slot: number, type: GateType) => {
      if (solvedResult) return;
      const t0 = startedAt ?? Date.now();
      if (startedAt === null) setStartedAt(t0);

      const prev = assigned[slot];
      const nextSwaps = prev !== null && prev !== type ? swaps + 1 : swaps;
      if (nextSwaps !== swaps) setSwaps(nextSwaps);

      const next = assigned.map((v, i) => (i === slot ? type : v));
      setAssigned(next);
      setSelected(null);

      if (next.every((v) => v !== null) && isSolved(puzzle, next)) {
        const timeSec = Math.max(1, Math.round((Date.now() - t0) / 1000));
        const result: DayResult = {
          timeSec,
          swaps: nextSwaps,
          gates: puzzle.gates.length,
        };
        const store = storeRef.current;
        const yesterday = localDateKey(new Date(Date.now() - 86400000));
        const nextStreak =
          store.lastSolved === yesterday ? store.streak + 1 : 1;
        const updated: Store = {
          ...store,
          lastSolved: puzzle.dateKey,
          streak: nextStreak,
          totalSolved: store.totalSolved + 1,
          days: { ...store.days, [puzzle.dateKey]: result },
          progress: null,
        };
        storeRef.current = updated;
        saveStore(updated);
        setStreak(nextStreak);
        setSolvedResult(result);
      } else {
        persistProgress(next, t0, nextSwaps);
      }
    },
    [puzzle, solvedResult, assigned, startedAt, swaps, persistProgress]
  );

  const handleShare = useCallback(async () => {
    if (!solvedResult) return;
    const rows = '🟩'.repeat(puzzle.truth.length);
    const text = [
      `⚡ Circuit of the Day #${puzzle.number}`,
      `🔌 ${solvedResult.gates} gates · ⏱ ${fmtTime(solvedResult.timeSec)} · 🔁 ${solvedResult.swaps} swap${solvedResult.swaps === 1 ? '' : 's'}`,
      rows,
      `🔥 ${streak}-day streak`,
      'https://smartdisruptions.com/games/circuit',
    ].join('\n');
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // fall through to clipboard (user may have dismissed the sheet)
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    } catch {
      // Last resort: nothing to do; the button just won't confirm.
    }
  }, [puzzle, solvedResult, streak]);

  const playing = !solvedResult;
  const elapsed =
    solvedResult?.timeSec ??
    (startedAt ? Math.max(0, Math.floor((nowTick - startedAt) / 1000)) : 0);
  const allAssigned = assigned.every((v) => v !== null);
  const signals = evaluate(puzzle, combo, assigned);
  const rowsCount = 1 << puzzle.numInputs;

  // Next-puzzle countdown (local midnight).
  const midnight = new Date(nowTick);
  midnight.setHours(24, 0, 0, 0);
  const untilNext = Math.max(
    0,
    Math.floor((midnight.getTime() - nowTick) / 1000)
  );

  return (
    <div>
      {/* Status strip */}
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-5 gap-y-1">
        <Stat label={`Puzzle #${puzzle.number}`} ink={RED_INK} />
        <Stat label={`⏱ ${fmtTime(elapsed)}`} ink={YELLOW_INK} />
        <Stat label={`🔁 ${swaps} swaps`} ink={BLUE_INK} />
        <Stat label={`🔥 ${streak}`} ink={RED_INK} />
      </div>

      {/* The board */}
      <Board
        puzzle={puzzle}
        assigned={assigned}
        signals={signals}
        selected={selected}
        combo={combo}
        interactive={playing}
        onSelectSlot={(i) => setSelected(selected === i ? null : i)}
        onToggleInput={(i) => setCombo(combo ^ (1 << i))}
      />

      {/* Gate palette */}
      {playing && (
        <div className="mx-auto mt-5 max-w-xl">
          <p className="font-mono-accent text-center text-[11px] uppercase tracking-[0.25em] text-text-secondary">
            {selected === null
              ? 'Tap a ? chip on the board, then pick its gate'
              : `Pick a gate for chip G${selected + 1}`}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {GATE_TYPES.map((t) => (
              <button
                key={t}
                data-testid={`gate-chip-${t}`}
                disabled={selected === null}
                onClick={() => selected !== null && handleAssign(selected, t)}
                className="font-mono-accent rounded-lg border px-4 py-2 text-sm font-black tracking-wider transition-all disabled:opacity-40"
                style={{
                  borderColor:
                    selected === null ? 'var(--sd-border)' : `${YELLOW}88`,
                  color:
                    selected === null ? 'var(--sd-text-secondary)' : YELLOW_INK,
                  boxShadow:
                    selected === null ? 'none' : `0 0 12px ${YELLOW}33`,
                }}
                title={GATE_RULES[t]}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Truth table — the target */}
      <div className="mx-auto mt-8 max-w-xl">
        <p
          className="font-mono-accent text-center text-xs uppercase tracking-[0.3em]"
          style={{ color: BLUE_INK }}
        >
          Target truth table
        </p>
        <p className="mt-1 text-center text-xs text-text-secondary">
          Make the lamp match OUT on every row. Tap a row to set the switches.
        </p>
        <div
          className={`mt-3 grid gap-1.5 ${rowsCount > 4 ? 'sm:grid-cols-2' : ''}`}
        >
          {Array.from({ length: rowsCount }, (_, rowCombo) => {
            const out = allAssigned
              ? (evaluate(puzzle, rowCombo, assigned).at(-1) as number)
              : null;
            const match = out === null ? null : out === puzzle.truth[rowCombo];
            return (
              <button
                key={rowCombo}
                data-testid={`truth-row-${rowCombo}`}
                onClick={() => setCombo(rowCombo)}
                className="flex items-center justify-between rounded-lg border px-3 py-1.5 text-left transition-colors"
                style={{
                  borderColor:
                    combo === rowCombo ? `${YELLOW}aa` : 'var(--sd-border)',
                  backgroundColor:
                    combo === rowCombo ? `${YELLOW}14` : 'var(--sd-surface)',
                }}
              >
                <span className="font-mono-accent text-sm tracking-[0.2em] text-text-primary">
                  {Array.from({ length: puzzle.numInputs }, (_, i) => (
                    <span key={i} className="mr-2">
                      {String.fromCharCode(65 + i)}={(rowCombo >> i) & 1}
                    </span>
                  ))}
                </span>
                <span className="font-mono-accent flex items-center gap-2 text-sm font-black">
                  <span style={{ color: BLUE_INK }}>
                    OUT={puzzle.truth[rowCombo]}
                  </span>
                  <span
                    data-testid={`row-status-${rowCombo}`}
                    aria-label={
                      match === null
                        ? 'unknown'
                        : match
                          ? 'matches'
                          : 'mismatch'
                    }
                    style={{
                      color:
                        match === null
                          ? 'var(--sd-text-secondary)'
                          : match
                            ? '#16a34a'
                            : RED_INK,
                    }}
                  >
                    {match === null ? '·' : match ? '✓' : '✗'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Solved panel */}
      {solvedResult && (
        <div
          data-testid="solved-panel"
          className="mx-auto mt-8 max-w-xl rounded-2xl border p-6 text-center"
          style={{
            borderColor: `${YELLOW}66`,
            boxShadow: `0 0 30px ${YELLOW}22`,
          }}
        >
          <p
            className="font-mono-accent text-2xl font-black uppercase tracking-widest"
            style={{ color: YELLOW_INK }}
          >
            ★ Circuit Complete ★
          </p>
          <p className="font-mono-accent mt-3 text-sm text-text-primary">
            #{puzzle.number} · {solvedResult.gates} gates · ⏱{' '}
            {fmtTime(solvedResult.timeSec)} · 🔁 {solvedResult.swaps} swap
            {solvedResult.swaps === 1 ? '' : 's'} · 🔥 {streak}-day streak
          </p>
          <button
            data-testid="share-button"
            onClick={handleShare}
            className="font-mono-accent mt-5 rounded-full px-6 py-2.5 text-sm font-black uppercase tracking-widest transition-all"
            style={{
              backgroundColor: YELLOW,
              color: '#0a0a0a',
              boxShadow: `0 0 18px ${YELLOW}66`,
            }}
          >
            {shareState === 'copied' ? '✓ Copied!' : '↗ Share result'}
          </button>
          <p className="mt-4 text-xs text-text-secondary">
            Next circuit in{' '}
            <span
              className="font-mono-accent font-bold"
              style={{ color: BLUE_INK }}
            >
              {fmtTime(Math.floor(untilNext / 60))}:
              {String(untilNext % 60).padStart(2, '0')}
            </span>{' '}
            — one per day, same board for everyone.
          </p>
        </div>
      )}

      {/* How it works — the teaching beat */}
      <details className="mx-auto mt-8 max-w-xl rounded-xl border border-border bg-surface px-4 py-3">
        <summary className="font-mono-accent cursor-pointer text-xs font-black uppercase tracking-[0.25em] text-text-secondary">
          How logic gates work
        </summary>
        <div className="mt-3 space-y-1.5 text-sm text-text-secondary">
          <p className="text-text-primary">
            Every chip takes two wires in (each 0 or 1) and puts one wire out:
          </p>
          {GATE_TYPES.map((t) => (
            <p key={t}>
              <span
                className="font-mono-accent font-black"
                style={{ color: BLUE_INK }}
              >
                {t}
              </span>{' '}
              — {GATE_RULES[t]}.
            </p>
          ))}
          <p className="pt-1">
            Flip the input switches and watch the signal run the traces — deduce
            which gate each ? chip must be so the lamp matches the target on
            every row.
          </p>
        </div>
      </details>

      <p className="mt-10 text-center">
        <Link
          href="/games"
          className="font-mono-accent text-sm font-black uppercase tracking-wider"
          style={{ color: RED_INK }}
        >
          ◀ Back to the Arcade
        </Link>
      </p>
    </div>
  );
}

function Stat({ label, ink }: { label: string; ink: string }) {
  return (
    <span
      className="font-mono-accent text-xs font-black uppercase tracking-[0.2em]"
      style={{ color: ink }}
    >
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// The PCB board (SVG)

const COL_W = 132;
const ROW_H = 84;
const GATE_W = 74;
const GATE_H = 46;
const PAD_X = 24;
const PAD_Y = 26;

function Board({
  puzzle,
  assigned,
  signals,
  selected,
  combo,
  interactive,
  onSelectSlot,
  onToggleInput,
}: {
  puzzle: Puzzle;
  assigned: (GateType | null)[];
  signals: (number | null)[];
  selected: number | null;
  combo: number;
  interactive: boolean;
  onSelectSlot: (i: number) => void;
  onToggleInput: (i: number) => void;
}) {
  const layers = signalLayers(puzzle);
  const maxLayer = Math.max(...layers);

  // Position every signal: x by layer, y by order within the layer.
  const positions = useMemo(() => {
    const byLayer: number[][] = Array.from({ length: maxLayer + 1 }, () => []);
    layers.forEach((layer, sig) => byLayer[layer].push(sig));
    const tallest = Math.max(...byLayer.map((l) => l.length));
    const boardH = PAD_Y * 2 + tallest * ROW_H;
    const pos = new Map<number, { x: number; y: number }>();
    byLayer.forEach((sigs, layer) => {
      // x is the chip CENTER, so column 0 needs a half-chip offset from the edge.
      const x = PAD_X + GATE_W / 2 + layer * COL_W;
      sigs.forEach((sig, idx) => {
        const y = boardH / 2 + (idx - (sigs.length - 1) / 2) * ROW_H;
        pos.set(sig, { x, y });
      });
    });
    return { pos, boardH };
    // layers derives fully from puzzle
  }, [puzzle, layers, maxLayer]);

  const { pos, boardH } = positions;
  const outSig = puzzle.numInputs + puzzle.gates.length - 1;
  const lampX = PAD_X + GATE_W / 2 + (maxLayer + 1) * COL_W;
  const boardW = lampX + 64;
  const outVal = signals[outSig];

  const wireStyle = (v: number | null) => ({
    stroke: v === null ? WIRE_UNKNOWN : v === 1 ? YELLOW : WIRE_OFF,
    strokeDasharray: v === null ? '5 4' : undefined,
    filter: v === 1 ? `drop-shadow(0 0 3px ${YELLOW})` : undefined,
  });

  // Elbowed Manhattan trace from a source's right edge to a destination pin.
  const trace = (
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const x0 = from.x + GATE_W / 2;
    const midX = (x0 + to.x - GATE_W / 2) / 2 + GATE_W / 2 - 8;
    return `M ${x0} ${from.y} H ${midX} V ${to.y} H ${to.x - GATE_W / 2}`;
  };

  return (
    <div
      className="mx-auto mt-6 max-w-3xl overflow-x-auto rounded-2xl p-1"
      style={{ background: PCB_EDGE }}
    >
      <svg
        viewBox={`0 0 ${boardW} ${boardH}`}
        className="block h-auto w-full rounded-xl"
        style={{ background: PCB_BG, minWidth: 480 }}
        role="img"
        aria-label="Logic circuit board"
      >
        {/* PCB texture: via dots */}
        <defs>
          <pattern
            id="vias"
            width="34"
            height="34"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="6" cy="6" r="1.4" fill={COPPER} opacity="0.25" />
          </pattern>
        </defs>
        <rect width={boardW} height={boardH} fill="url(#vias)" />

        {/* Traces */}
        {puzzle.gates.map((gate, i) => {
          const gPos = pos.get(puzzle.numInputs + i)!;
          return gate.sources.map((src, pin) => {
            const sPos = pos.get(src)!;
            const pinY = gPos.y + (pin === 0 ? -GATE_H / 4 : GATE_H / 4);
            return (
              <path
                key={`w-${i}-${pin}`}
                d={trace(sPos, { x: gPos.x, y: pinY })}
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                {...{ style: wireStyle(signals[src]) }}
              />
            );
          });
        })}
        {/* Output trace to lamp */}
        <path
          d={`M ${pos.get(outSig)!.x + GATE_W / 2} ${pos.get(outSig)!.y} H ${lampX - 20}`}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          {...{ style: wireStyle(outVal) }}
        />

        {/* Input switches */}
        {Array.from({ length: puzzle.numInputs }, (_, i) => {
          const p = pos.get(i)!;
          const on = ((combo >> i) & 1) === 1;
          return (
            <g
              key={`in-${i}`}
              data-testid={`input-switch-${i}`}
              onClick={() => onToggleInput(i)}
              className="cursor-pointer"
              role="switch"
              aria-checked={on}
              aria-label={`Input ${String.fromCharCode(65 + i)}`}
            >
              <rect
                x={p.x - GATE_W / 2}
                y={p.y - GATE_H / 2}
                width={GATE_W}
                height={GATE_H}
                rx="10"
                fill={on ? '#2a2408' : '#131d16'}
                stroke={on ? YELLOW : COPPER}
                strokeWidth="1.5"
              />
              <text
                x={p.x - GATE_W / 2 + 14}
                y={p.y + 5}
                fontSize="15"
                fontWeight="900"
                fill={SILK}
                fontFamily="var(--font-mono-accent, monospace)"
              >
                {String.fromCharCode(65 + i)}
              </text>
              <circle
                cx={p.x + GATE_W / 2 - 18}
                cy={p.y}
                r="9"
                fill={on ? YELLOW : '#26332b'}
                stroke={on ? YELLOW : WIRE_OFF}
              />
              <text
                x={p.x + GATE_W / 2 - 18}
                y={p.y + 4}
                fontSize="11"
                fontWeight="900"
                textAnchor="middle"
                fill={on ? '#0a0a0a' : WIRE_UNKNOWN}
                fontFamily="var(--font-mono-accent, monospace)"
              >
                {on ? 1 : 0}
              </text>
            </g>
          );
        })}

        {/* Gate chips */}
        {puzzle.gates.map((_, i) => {
          const p = pos.get(puzzle.numInputs + i)!;
          const type = assigned[i];
          const isSel = selected === i;
          const v = signals[puzzle.numInputs + i];
          return (
            <g
              key={`g-${i}`}
              data-testid={`gate-slot-${i}`}
              onClick={() => interactive && onSelectSlot(i)}
              className={interactive ? 'cursor-pointer' : undefined}
              role="button"
              aria-label={`Gate ${i + 1}: ${type ?? 'unknown'}`}
            >
              <rect
                x={p.x - GATE_W / 2}
                y={p.y - GATE_H / 2}
                width={GATE_W}
                height={GATE_H}
                rx="8"
                fill={type ? '#10141a' : '#141210'}
                stroke={isSel ? YELLOW : type ? BLUE : RED}
                strokeWidth={isSel ? 2.5 : 1.5}
                strokeDasharray={type ? undefined : '6 4'}
                style={
                  isSel
                    ? { filter: `drop-shadow(0 0 6px ${YELLOW})` }
                    : undefined
                }
              />
              {/* pin nubs */}
              <circle
                cx={p.x - GATE_W / 2}
                cy={p.y - GATE_H / 4}
                r="2.5"
                fill={COPPER}
              />
              <circle
                cx={p.x - GATE_W / 2}
                cy={p.y + GATE_H / 4}
                r="2.5"
                fill={COPPER}
              />
              <circle cx={p.x + GATE_W / 2} cy={p.y} r="2.5" fill={COPPER} />
              <text
                x={p.x}
                y={p.y - 4}
                fontSize={type ? 14 : 18}
                fontWeight="900"
                textAnchor="middle"
                fill={type ? SILK : YELLOW}
                fontFamily="var(--font-mono-accent, monospace)"
              >
                {type ?? '?'}
              </text>
              <text
                x={p.x}
                y={p.y + 14}
                fontSize="9"
                textAnchor="middle"
                fill={v === 1 ? YELLOW : WIRE_UNKNOWN}
                fontFamily="var(--font-mono-accent, monospace)"
              >
                G{i + 1}
                {type ? ` · out ${v ?? '?'}` : ''}
              </text>
            </g>
          );
        })}

        {/* Output lamp */}
        <g
          data-testid="output-lamp"
          aria-label={`Output ${outVal ?? 'unknown'}`}
        >
          <circle
            cx={lampX}
            cy={pos.get(outSig)!.y}
            r="17"
            fill={outVal === 1 ? YELLOW : '#1a2019'}
            stroke={
              outVal === 1 ? YELLOW : outVal === null ? WIRE_UNKNOWN : WIRE_OFF
            }
            strokeWidth="2"
            style={
              outVal === 1
                ? { filter: `drop-shadow(0 0 10px ${YELLOW})` }
                : undefined
            }
          />
          <text
            x={lampX}
            y={pos.get(outSig)!.y + 5}
            fontSize="13"
            fontWeight="900"
            textAnchor="middle"
            fill={outVal === 1 ? '#0a0a0a' : WIRE_UNKNOWN}
            fontFamily="var(--font-mono-accent, monospace)"
          >
            {outVal ?? '?'}
          </text>
          <text
            x={lampX}
            y={pos.get(outSig)!.y + 34}
            fontSize="10"
            fontWeight="900"
            textAnchor="middle"
            fill={SILK}
            opacity="0.7"
            fontFamily="var(--font-mono-accent, monospace)"
          >
            OUT
          </text>
        </g>
      </svg>
    </div>
  );
}
