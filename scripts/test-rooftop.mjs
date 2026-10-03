/**
 * The Rooftop Run: Dash level test. A level that fails it does not ship.
 *
 * For every level (and the sandbox) the solver, a bot that tries every way
 * of playing, has to:
 *
 *   - finish the level;
 *   - pick up each of the three secret scrolls on a run that also finishes;
 *   - leave every tap a fair window: sliding each press of its run earlier
 *     and later, the narrowest window must meet the level's difficulty
 *     (easy ±70 ms, normal ±55, hard ±45, harder ±35, insane ±28, demon ±20),
 *     and no tap may be frame-perfect;
 *   - take as long as the song (within 3 s), so the music ends at the finish.
 *     The six level files start as stubs that reuse the sandbox; a stub is
 *     not held to its song length until it is built.
 *
 * Flying sections (kite, parasol, dragon) steer continuously, so the table
 * also shows the narrowest clearance on the bot's path there, in blocks,
 * with a warning mark when it is under the guide's target.
 *
 *   node --import ./scripts/ts-resolve-register.mjs scripts/test-rooftop.mjs
 *   ... --level moon-gate     one level (or: --level sandbox)
 *   ... --quick               skip the slack measure
 */
import {
  getLevel,
  LEVEL_METAS,
  levelSeconds,
} from '../src/components/arcade/rooftop-run/dash/levels/index.ts';
import {
  SANDBOX,
  isStub,
} from '../src/components/arcade/rooftop-run/dash/levels/sandbox.ts';
import {
  humanize,
  measureSlack,
  simplify,
  solve,
  solveScroll,
} from '../src/components/arcade/rooftop-run/dash/solver.ts';

const STEP = 1 / 120;
/** The narrowest fair window per difficulty, ± ms. */
const SLACK = {
  easy: 70,
  normal: 55,
  hard: 45,
  harder: 35,
  insane: 28,
  demon: 20,
};
/** Guide targets for flying clearance, blocks (a warning, not a failure). */
const CLEAR = {
  easy: 0.5,
  normal: 0.4,
  hard: 0.3,
  harder: 0.25,
  insane: 0.2,
  demon: 0.15,
};

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const li = args.indexOf('--level');
const only = li >= 0 ? args[li + 1] : null;

const levels = [
  ...LEVEL_METAS.map((m) => ({ name: m.id, level: getLevel(m.id) })),
  { name: 'sandbox', level: SANDBOX },
].filter((e) => !only || e.name === only);
if (levels.length === 0) {
  console.error(
    `No level "${only}". Levels: ${LEVEL_METAS.map((m) => m.id).join(', ')}, sandbox`
  );
  process.exit(1);
}

const pad = (s, n) => String(s).padEnd(n);
const rpad = (s, n) => String(s).padStart(n);
const header = [
  pad('level', 16),
  pad('solve', 5),
  pad('time / song', 18),
  pad('scrolls', 7),
  pad(quick ? 'slack (skipped)' : 'slack min/med (target)', 24),
  pad('tightest x', 10),
  pad('fly clear', 10),
  rpad('objs', 5),
  rpad('states', 9),
  rpad('ms', 7),
].join(' ');
console.log(header);
console.log('-'.repeat(header.length));

let failed = 0;
const notes = [];
for (const { name, level } of levels) {
  const t0 = performance.now();
  const problems = [];
  // The sandbox and the stubs made from it are a showcase, not a song.
  const stub = isStub(level);
  const song = levelSeconds(level);
  const r = solve(level);
  let states = r.states;
  let time = '—';
  let scrolls = '—';
  let slack = quick ? 'skipped' : '—';
  let tight = '—';
  let clear = '—';
  if (!r.ok) {
    problems.push(
      `not solvable: got to x=${r.reachedX.toFixed(1)}` +
        (r.deathX !== undefined
          ? `, the furthest run died at x=${r.deathX.toFixed(1)} (${r.cause})`
          : '') +
        (r.cause === 'timeout' ? ' (timed out)' : '')
    );
  } else {
    const secs = r.steps * STEP;
    const off = secs - song;
    const lengthOk = Math.abs(off) <= 3;
    time = `${secs.toFixed(1)}/${song.toFixed(1)}s ${lengthOk ? '✓' : stub ? (name === 'sandbox' ? '(sandbox)' : '(stub)') : '✗'}`;
    if (!lengthOk && !stub) {
      problems.push(
        `finishes in ${secs.toFixed(1)} s but the song is ${song.toFixed(1)} s (${off > 0 ? '+' : ''}${off.toFixed(1)} s): move the end or the speed portals`
      );
    }
    const marks = [];
    for (const id of [0, 1, 2]) {
      if (r.scrolls[id]) {
        marks.push('✓');
        continue;
      }
      const s = solveScroll(level, id, r.inputs);
      states += s.states;
      marks.push(s.ok ? '✓' : '✗');
      if (!s.ok) {
        problems.push(
          `scroll ${id} cannot be picked up on a finishing run` +
            (s.deathX !== undefined
              ? ` (best try died at x=${s.deathX.toFixed(1)}, ${s.cause})`
              : '')
        );
      }
    }
    scrolls = marks.join('');
    if (!quick) {
      const target = SLACK[level.difficulty];
      // Judge the presses that matter, made as people make them (a tap lasts
      // about 50 ms), letting a press that falls short be re-timed together
      // with the one before it, as a player learns both.
      const run = humanize(level, simplify(level, r.inputs));
      const sl = measureSlack(level, run, { target });
      const fmt = (v) => (Number.isFinite(v) ? `±${v.toFixed(0)}` : '—');
      slack = `${fmt(sl.min)}/${fmt(sl.median)} (±${target})`;
      tight = sl.tightest.length ? sl.tightest[0].x.toFixed(1) : '—';
      if (Number.isFinite(sl.clearance)) {
        clear = `${sl.clearance.toFixed(2)}${sl.clearance < CLEAR[level.difficulty] ? ' ⚠' : ''}`;
        if (sl.clearance < CLEAR[level.difficulty]) {
          notes.push(
            `${name}: flying clearance ${sl.clearance.toFixed(2)} blocks at x=${sl.clearanceX.toFixed(1)} is under the guide's ${CLEAR[level.difficulty]} for ${level.difficulty}`
          );
        }
      }
      if (sl.min < target) {
        slack += ' ✗';
        problems.push(
          `the narrowest window is ±${sl.min.toFixed(0)} ms, under ±${target} for ${level.difficulty}: ` +
            sl.tightest
              .map(
                (p) => `x=${p.x.toFixed(1)} (${p.mode}) ±${p.ms.toFixed(0)} ms`
              )
              .join(', ')
        );
      }
      if (sl.framePerfect > 0) {
        problems.push(
          `${sl.framePerfect} press(es) are frame-perfect (a single 8 ms step)`
        );
      }
    }
  }
  const ms = performance.now() - t0;
  console.log(
    [
      pad(name, 16),
      pad(r.ok ? 'yes' : 'NO', 5),
      pad(time, 18),
      pad(scrolls, 7),
      pad(slack, 24),
      pad(tight, 10),
      pad(clear, 10),
      rpad(level.objects.length, 5),
      rpad(states, 9),
      rpad(ms.toFixed(0), 7),
    ].join(' ')
  );
  if (problems.length) {
    failed++;
    for (const p of problems) notes.push(`${name}: FAIL ${p}`);
  }
}
if (notes.length) {
  console.log('');
  for (const n of notes) console.log(n);
}
console.log('');
console.log(
  failed
    ? `${failed} of ${levels.length} level(s) failed.`
    : `All ${levels.length} level(s) pass.`
);
process.exit(failed ? 1 : 0);
