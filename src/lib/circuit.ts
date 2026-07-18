// Circuit of the Day — pure puzzle engine (no DOM, no React).
// Everyone in the same local date gets the same puzzle: the generator is
// seeded from the YYYY-MM-DD string, so it must stay deterministic — any
// change to the generation sequence below changes every future puzzle.

export type GateType = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR';

export const GATE_TYPES: GateType[] = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];

export const GATE_RULES: Record<GateType, string> = {
  AND: '1 only when BOTH inputs are 1',
  OR: '1 when EITHER input is 1',
  XOR: '1 when inputs are DIFFERENT',
  NAND: '0 only when both inputs are 1',
  NOR: '1 only when both inputs are 0',
};

export interface Gate {
  /* Signal ids: 0..numInputs-1 are the input switches; the output of gate i
     is signal numInputs + i. Gate sources always reference earlier signals. */
  sources: [number, number];
  /** The hidden answer — the type the generator used. Never shown to the player. */
  solution: GateType;
}

export interface Puzzle {
  dateKey: string; // YYYY-MM-DD (player-local)
  number: number; // #1 = LAUNCH_DATE
  numInputs: number;
  gates: Gate[];
  /** Target output for each input combo (combo index = bits, input 0 = LSB). */
  truth: number[];
}

// Puzzle #1 = launch day.
export const LAUNCH_DATE = '2026-07-18';

export function gateEval(type: GateType, a: number, b: number): number {
  switch (type) {
    case 'AND':
      return a & b;
    case 'OR':
      return a | b;
    case 'XOR':
      return a ^ b;
    case 'NAND':
      return 1 - (a & b);
    case 'NOR':
      return 1 - (a | b);
  }
}

/** Evaluate all signals for one input combo. `types[i] = null` → unknown gate:
    its output (and anything downstream of it) becomes null. */
export function evaluate(
  puzzle: Puzzle,
  combo: number,
  types: (GateType | null)[]
): (number | null)[] {
  const signals: (number | null)[] = [];
  for (let i = 0; i < puzzle.numInputs; i++) {
    signals.push((combo >> i) & 1);
  }
  puzzle.gates.forEach((gate, i) => {
    const type = types[i];
    const a = signals[gate.sources[0]];
    const b = signals[gate.sources[1]];
    signals.push(
      type === null || a === null || b === null ? null : gateEval(type, a, b)
    );
  });
  return signals;
}

/** Final-gate output for one combo, or null while the circuit has unknowns. */
export function outputFor(
  puzzle: Puzzle,
  combo: number,
  types: (GateType | null)[]
): number | null {
  const signals = evaluate(puzzle, combo, types);
  return signals[signals.length - 1];
}

/** True when every truth-table row matches the target. */
export function isSolved(puzzle: Puzzle, types: (GateType | null)[]): boolean {
  const rows = 1 << puzzle.numInputs;
  for (let combo = 0; combo < rows; combo++) {
    if (outputFor(puzzle, combo, types) !== puzzle.truth[combo]) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Deterministic generation

/** mulberry32 PRNG — tiny, seedable, deterministic across platforms. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface Candidate {
  numInputs: number;
  gates: Gate[];
  truth: number[];
}

function buildCandidate(rand: () => number): Candidate {
  const numInputs = rand() < 0.4 ? 2 : 3;
  const numGates = 3 + Math.floor(rand() * 3); // 3–5
  const gates: Gate[] = [];
  const unused = new Set<number>();
  for (let i = 0; i < numInputs; i++) unused.add(i);

  for (let i = 0; i < numGates; i++) {
    const available = numInputs + i;
    // First source: prefer a not-yet-consumed signal so nothing dangles.
    const unusedArr = [...unused];
    const a =
      unusedArr.length > 0
        ? unusedArr[Math.floor(rand() * unusedArr.length)]
        : Math.floor(rand() * available);
    let b = Math.floor(rand() * available);
    while (b === a) b = Math.floor(rand() * available);
    const solution = GATE_TYPES[Math.floor(rand() * GATE_TYPES.length)];
    gates.push({ sources: [a, b], solution });
    unused.delete(a);
    unused.delete(b);
    unused.add(available); // this gate's own output, waiting to be consumed
  }

  const puzzleShape: Puzzle = {
    dateKey: '',
    number: 0,
    numInputs,
    gates,
    truth: [],
  };
  const solutionTypes = gates.map((g) => g.solution);
  const rows = 1 << numInputs;
  const truth: number[] = [];
  for (let combo = 0; combo < rows; combo++) {
    truth.push(outputFor(puzzleShape, combo, solutionTypes) as number);
  }
  return { numInputs, gates, truth };
}

function isGoodCandidate(c: Candidate): boolean {
  const rows = 1 << c.numInputs;
  // Output must not be constant.
  if (c.truth.every((v) => v === c.truth[0])) return false;
  // Every signal except the final output must feed something.
  const consumed = new Set<number>();
  c.gates.forEach((g) => {
    consumed.add(g.sources[0]);
    consumed.add(g.sources[1]);
  });
  const totalSignals = c.numInputs + c.gates.length;
  for (let s = 0; s < totalSignals - 1; s++) {
    if (!consumed.has(s)) return false;
  }
  // Every input switch must matter to the output.
  const shape: Puzzle = {
    dateKey: '',
    number: 0,
    numInputs: c.numInputs,
    gates: c.gates,
    truth: c.truth,
  };
  const types = c.gates.map((g) => g.solution);
  for (let k = 0; k < c.numInputs; k++) {
    let matters = false;
    for (let combo = 0; combo < rows; combo++) {
      if (
        outputFor(shape, combo, types) !==
        outputFor(shape, combo ^ (1 << k), types)
      ) {
        matters = true;
        break;
      }
    }
    if (!matters) return false;
  }
  return true;
}

export function generatePuzzle(dateKey: string): Puzzle {
  const base = hashString(`circuit-of-the-day:${dateKey}`);
  for (let attempt = 0; attempt < 500; attempt++) {
    const rand = mulberry32(base + attempt * 0x9e3779b9);
    const c = buildCandidate(rand);
    if (isGoodCandidate(c)) {
      return {
        dateKey,
        number: puzzleNumber(dateKey),
        numInputs: c.numInputs,
        gates: c.gates,
        truth: c.truth,
      };
    }
  }
  // Unreachable in practice (soak-tested); typed fallback keeps callers total.
  throw new Error(`No valid puzzle for ${dateKey}`);
}

// ---------------------------------------------------------------------------
// Dates (player-local, like every daily puzzle game)

export function localDateKey(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function puzzleNumber(dateKey: string): number {
  const ms = Date.UTC(
    Number(dateKey.slice(0, 4)),
    Number(dateKey.slice(5, 7)) - 1,
    Number(dateKey.slice(8, 10))
  );
  const launch = Date.UTC(2026, 6, 18);
  return Math.round((ms - launch) / 86400000) + 1;
}

// ---------------------------------------------------------------------------
// Layout helper — assign each signal a column (layer) for rendering.

export function signalLayers(puzzle: Puzzle): number[] {
  const layers: number[] = [];
  for (let i = 0; i < puzzle.numInputs; i++) layers.push(0);
  puzzle.gates.forEach((g) => {
    layers.push(1 + Math.max(layers[g.sources[0]], layers[g.sources[1]]));
  });
  return layers;
}
