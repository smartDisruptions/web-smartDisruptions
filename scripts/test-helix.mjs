/**
 * The wall's winding (src/components/built/helix.ts), checked for every
 * number of plaques the wall could plausibly hold.
 *
 *   npm run test:helix
 *
 * The spiral is endless only because each plaque is moved from the top of
 * the tower to the bottom at the right moment. If that arithmetic slips, a
 * plaque is hung twice, or not at all, or the row in front loses one.
 * These are the properties the drive and the server both lean on.
 */
import assert from 'node:assert/strict';
import { BEHIND, lapOf, turnsFor } from '../src/components/built/helix.ts';

let checks = 0;

// A plain ring up to seventeen, and never fewer than nine nor more than
// fifteen plaques to a turn after that.
for (let n = 1; n <= 200; n++) {
  const turns = turnsFor(n);
  assert.ok(Number.isInteger(turns) && turns >= 1, `turns for ${n}`);
  if (n <= 17) assert.equal(turns, 1, `${n} plaques are one ring`);
  else {
    assert.ok(turns >= 2, `${n} plaques are a spiral`);
    const perTurn = n / turns;
    assert.ok(perTurn >= 9 && perTurn <= 15, `${n}: ${perTurn} to a turn`);
  }
  checks++;
}
assert.equal(turnsFor(34), 3, 'the wall as it stands is three turns');

for (let n = 18; n <= 120; n++) {
  const turns = turnsFor(n);
  // The server's seam, and the two ends of where a screen can put it (a
  // plaque is edge-on to the eye between about 70° and 82° round).
  for (const behind of [BEHIND, 0.772, 0.806]) {
    const back = (behind * n) / turns;
    // The front of the tower at every quarter-plaque through four passes,
    // both ways.
    for (let q = -4 * n * 4; q <= 4 * n * 4; q++) {
      const c = q / 4;
      const places = [];
      for (let i = 0; i < n; i++) {
        const lap = lapOf(i, c, n, back);
        assert.ok(Number.isInteger(lap), `lap of ${i} at ${c}`);
        places.push(i + lap * n);
      }
      // Every plaque hangs once, on n consecutive places, starting `back`
      // plaques behind the front.
      places.sort((a, b) => a - b);
      for (let k = 1; k < n; k++) {
        assert.equal(places[k] - places[k - 1], 1, `${n} plaques at ${c}: gap`);
      }
      assert.ok(
        places[0] >= c - back && places[0] < c - back + 1,
        `${n} plaques at ${c}: the spiral starts ${places[0]}`
      );
      // The plaque in front, the two either side of it and the one under
      // it are always hung: the seam is never in the light.
      const row = n / turns;
      assert.ok(places[0] <= c - 2, `${n} at ${c}: front row cut short`);
      assert.ok(places[n - 1] >= c + row, `${n} at ${c}: second row cut`);
      checks++;
    }
  }
}

console.log(`wall spiral: ${checks} checks passed`);
