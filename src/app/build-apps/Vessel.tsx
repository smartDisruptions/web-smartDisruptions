import type { CSSProperties } from 'react';
import Kiru from '@/components/kiru/Kiru';
import StaticSvg from '@/components/brand/StaticSvg';
import { GLYPHS } from '@/components/brand/glyphs';
import { gearPath } from './gears';
import VesselFX from './VesselFX';
import { CARD_SLOTS, CARD_START } from './vessel-model';

/**
 * The /build-apps header toy: "take the phone apart". 器 means vessel, and
 * the phone is drawn as one: urushi lacquer, a fine gold maki-e line, a
 * washi screen running a tiny made-up dojo app (a stamp card).
 *
 * Every part is server-rendered HTML in one CSS 3D scene, stacked the way an
 * app is: what you see (the screen), what it decides (the logic: karakuri
 * gears and two rules), what it remembers (the data: a stack of slips) and
 * what it runs on (the phone's own shell). VesselFX, the only script, turns
 * it, takes it apart and runs a tap through it. Without the script it is a
 * still picture of the phone; under reduced motion, a still exploded diagram
 * (CSS sets that pose, so it's right from the first paint).
 *
 * Styles: ./build-apps.css (ba-*).
 */

const STAMP = GLYPHS.brush['道'].d;

// A hand never stamps square: each slot has its own small lean.
const LEAN = [-8, 6, -3, 10, -6, 4, -11, 7];

const GEAR_BIG = gearPath({
  teeth: 14,
  tip: 50,
  root: 42,
  hole: 7,
  windows: 5,
});
const GEAR_SMALL = gearPath({
  teeth: 9,
  tip: 33,
  root: 25.5,
  hole: 5.5,
  windows: 3,
});

// Seigaiha (blue-sea waves) for the maki-e on the phone's back: rows of
// nested arcs, each row painted over the one above it, as the pattern is.
const WAVE_ROWS = Array.from({ length: 9 }, (_, row) => {
  const y = 16 + row * 10;
  const off = row % 2 ? 10 : 0;
  let d = '';
  for (let x = -10 + off; x <= 112; x += 20) {
    d += `M${x - 10} ${y}a10 10 0 0 1 20 0Z`;
    for (const r of [7, 4]) d += `M${x - r} ${y}a${r} ${r} 0 0 1 ${r * 2} 0`;
  }
  return d;
});

const z = (n: number): CSSProperties => ({ ['--i' as string]: n });

export default function Vessel() {
  return (
    <div className="ba-toy">
      {/* One copy of the stamp's brush glyph, used by every slot. */}
      <svg className="ba-defs" aria-hidden focusable="false">
        <defs>
          <symbol id="ba-dou" viewBox="0 0 1000 1000">
            <path d={STAMP} />
          </symbol>
        </defs>
      </svg>

      <div
        className="ba-stage"
        role="group"
        aria-roledescription="3D model"
        aria-label="A tiny stamp-card app on a phone. Drag it, or use the arrow keys, to turn it."
        tabIndex={0}
      >
        <div className="ba-backdrop" aria-hidden />
        <div className="ba-scene">
          <div className="ba-rotor">
            {/* ── What it runs on: the shell ─────────────────────────────── */}
            <div className="ba-part ba-back" aria-hidden>
              <span className="ba-cam" />
              <StaticSvg
                className="ba-back-art"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMin slice"
              >
                {WAVE_ROWS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </StaticSvg>
              <span className="ba-back-seal">
                <svg viewBox="0 0 1000 1000" focusable="false">
                  <path d={GLYPHS.brush['器'].d} />
                </svg>
              </span>
            </div>
            <div className="ba-part ba-floor" aria-hidden>
              <span className="ba-chip">
                <i />
              </span>
              <span className="ba-cell">
                <i />
                <i />
                <i />
              </span>
              <span className="ba-floor-cam" />
            </div>
            <div className="ba-part ba-ring" style={z(1)} aria-hidden />
            <div className="ba-part ba-ring" style={z(2)} aria-hidden />
            <div className="ba-part ba-ring" style={z(3)} aria-hidden />
            <div className="ba-side ba-side-l" aria-hidden />
            <div className="ba-side ba-side-r" aria-hidden />
            <div className="ba-side ba-side-t" aria-hidden />
            <div className="ba-side ba-side-b" aria-hidden />

            {/* ── What it remembers: the data ───────────────────────────── */}
            <div className="ba-part ba-plate ba-data" aria-hidden>
              <ol className="ba-slips">
                {Array.from({ length: 4 }, (_, i) => {
                  const n = CARD_START - i;
                  return (
                    <li key={n} className="ba-slip" style={z(i)}>
                      <span className="ba-slip-dot" />
                      Check-in <b>{n}</b>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* ── What it decides: the logic ────────────────────────────── */}
            <div className="ba-part ba-plate ba-logic" aria-hidden>
              <StaticSvg
                className="ba-gear ba-gear-a"
                viewBox="-52 -52 104 104"
              >
                <path d={GEAR_BIG} fillRule="evenodd" />
              </StaticSvg>
              <StaticSvg className="ba-gear ba-gear-b" viewBox="-35 -35 70 70">
                <path d={GEAR_SMALL} fillRule="evenodd" />
              </StaticSvg>
              <div className="ba-rules">
                <p className="ba-rule" data-rule="add">
                  <b>Tap</b>
                  <span>add a stamp</span>
                </p>
                <p className="ba-rule" data-rule="full">
                  <b>Card full</b>
                  <span>start a new one</span>
                </p>
              </div>
            </div>

            {/* ── What you see: the screen ──────────────────────────────── */}
            <div className="ba-part ba-screen">
              <div className="ba-glass">
                <div className="ba-status" aria-hidden>
                  <span>7:00</span>
                  <span className="ba-island" />
                  <span className="ba-batt" />
                </div>
                <div className="ba-app-head" aria-hidden>
                  <span className="ba-app-seal">
                    <svg viewBox="0 0 1000 1000" focusable="false">
                      <use href="#ba-dou" />
                    </svg>
                  </span>
                  <span className="ba-app-name">Dojo card</span>
                </div>
                <p className="ba-app-sub" aria-hidden>
                  A stamp for every class.
                </p>
                <div className="ba-card" aria-hidden>
                  <span className="ba-card-head">
                    <span>
                      Card <span className="ba-c">1</span>
                    </span>
                    <span>{CARD_SLOTS} classes</span>
                  </span>
                  <span className="ba-slots">
                    {Array.from({ length: CARD_SLOTS }, (_, i) => (
                      <span
                        key={i}
                        className="ba-slot"
                        data-on={i < CARD_START ? '' : undefined}
                        style={{ ['--r' as string]: `${LEAN[i]}deg` }}
                      >
                        <svg
                          className="ba-stamp"
                          viewBox="-200 -200 1400 1400"
                          focusable="false"
                        >
                          <use
                            href="#ba-dou"
                            x="0"
                            y="0"
                            width="1000"
                            height="1000"
                          />
                        </svg>
                      </span>
                    ))}
                  </span>
                  <span className="ba-full">
                    <b>Card full</b>
                  </span>
                </div>
                <p className="ba-count" aria-hidden>
                  <b className="ba-n">{CARD_START}</b> of {CARD_SLOTS}
                  <span className="ba-togo">
                    {CARD_SLOTS - CARD_START} to go
                  </span>
                </p>
                <button
                  type="button"
                  className="ba-btn"
                  aria-describedby="ba-live"
                >
                  Check in
                </button>
              </div>
            </div>

            {/* The tap's trip: a thread down through the layers, and the
                signal that runs along it. */}
            <div className="ba-thread" aria-hidden />
            <div className="ba-bead" aria-hidden />
          </div>
        </div>

        {/* Labels float beside the layers they name (VesselFX places them);
            they're the page's real words for the four parts. */}
        <ol className="ba-labels" aria-label="The four parts">
          <li className="ba-label" data-k="screen">
            <span className="ba-label-t">What you see</span>
            <span className="ba-label-s">the screen</span>
          </li>
          <li className="ba-label" data-k="logic">
            <span className="ba-label-t">What it decides</span>
            <span className="ba-label-s">the logic</span>
          </li>
          <li className="ba-label" data-k="data">
            <span className="ba-label-t">What it remembers</span>
            <span className="ba-label-s">the data</span>
          </li>
          <li className="ba-label" data-k="shell">
            <span className="ba-label-t">What it runs on</span>
            <span className="ba-label-s">the phone</span>
          </li>
        </ol>
        <div className="ba-leaders" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </div>

        <Kiru pose="build" className="ba-kiru" />
      </div>

      {/* What the tap is doing right now, step by step (the live region
          below says it once, for screen readers). */}
      <p className="ba-say" aria-hidden>
        <span className="ba-say-line">
          Tap <b>Check in</b>, or drag the phone to turn it.
        </span>
      </p>
      <p id="ba-live" className="sr-only" aria-live="polite" />

      <div className="ba-apart">
        <label htmlFor="ba-apart" className="ba-apart-label">
          Take it apart
        </label>
        <span className="ba-apart-end" aria-hidden>
          Together
        </span>
        <input
          id="ba-apart"
          className="ba-range"
          type="range"
          min={0}
          max={100}
          step={1}
          defaultValue={0}
          aria-valuetext="Together"
        />
        <span className="ba-apart-end" aria-hidden>
          Apart
        </span>
      </div>

      <VesselFX />
    </div>
  );
}
