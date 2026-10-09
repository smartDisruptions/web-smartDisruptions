'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

/**
 * 04 · The headline simulator: China's hand on the valve.
 *
 * A handwheel on a pipe of rare earths. Each notch of the wheel is one real,
 * dated headline and the share-price moves of that day: clockwise (tighten)
 * is 9 Oct 2025, when China tightened its rules; anticlockwise (open) steps
 * through the peace headlines that followed, in date order. Nothing here is
 * modelled. The chart beside it always shows all nine moves; the wheel only
 * picks which of them to light, and a live line under the slip says the
 * picked headline aloud.
 *
 * Turn it by dragging (with a fling and a detent click), with the mouse wheel
 * once it has focus, with the keyboard (it is a slider), or with the two plain
 * buttons. React state changes only when the picked notch changes. The wheel
 * settles on a spring that is worked out once, on release, and handed to the
 * compositor as a keyframed rotation, so a settling wheel costs the main
 * thread nothing frame to frame; the pipe's flow changes on the compositor
 * too. Nothing runs at rest. A settle in progress lands at once if the page
 * scrolls or the valve leaves the screen, and under reduced motion the wheel
 * simply jumps.
 *
 * Everything it shows arrives as props from the server component, so none of
 * the article's copy is shipped twice.
 */

export type ValveRow = {
  label: string;
  ticker: string;
  date: string;
  event: string;
  move: number;
  kind: 'up' | 'down';
};
type Stop = { kind: 'up' | 'rest' | 'down'; rows: number[] };
type Band = 'light' | 'heavy' | 'rest';

const STEP = 42; // degrees of wheel per notch
const K = 230; // spring stiffness
const C = 2 * Math.sqrt(K) * 0.62; // damping: a little overshoot, the click of a detent
const FPS = 60; // the settle is sampled at this rate for the compositor
const TICKS = [-20, -10, 0, 10, 20];
const SPAN = 25; // the chart runs −25% to +25%

const signed = (m: number) => `${m > 0 ? '+' : m < 0 ? '−' : ''}${Math.abs(m)}`;

/** Consecutive rows of one direction and one date are one headline. */
function stopsOf(rows: ValveRow[]) {
  const groups: Stop[] = [];
  rows.forEach((r, i) => {
    const g = groups[groups.length - 1];
    if (g && g.kind === r.kind && rows[g.rows[0]].date === r.date)
      g.rows.push(i);
    else groups.push({ kind: r.kind, rows: [i] });
  });
  const up = groups.filter((g) => g.kind === 'up').reverse();
  const down = groups.filter((g) => g.kind === 'down');
  const stops: Stop[] = [...up, { kind: 'rest', rows: [] }, ...down];
  return { stops, rest: up.length };
}

/** The seventeen strands of the flow in a pipe, one path per ink. */
function strands(bands: Band[], x1: number, x2: number) {
  const ink: Record<Band, string> = { light: '', heavy: '', rest: '' };
  bands.forEach((k, i) => {
    ink[k] += `M${x1} ${+(101 + i * 1.75).toFixed(2)}H${x2}`;
  });
  return (Object.keys(ink) as Band[]).map((k) => (
    <path key={k} className={`re-b-strand re-b-k-${k}`} d={ink[k]} />
  ));
}

/** The spring from `from` (moving at `v` deg/s) to `to`, one angle per frame. */
function springPath(from: number, v: number, to: number) {
  const out = [from];
  const sub = 4;
  const h = 1 / (FPS * sub);
  let a = from;
  for (let n = 1; n <= FPS * 3 * sub; n++) {
    v += (-K * (a - to) - C * v) * h;
    a += v * h;
    if (n % sub === 0) {
      out.push(a);
      if (Math.abs(a - to) < 0.05 && Math.abs(v) < 2) break;
    }
  }
  out[out.length - 1] = to;
  return out;
}

export default function BValve({
  rows,
  bands,
  suffix,
  aria,
  hub,
}: {
  rows: ValveRow[];
  bands: Band[];
  suffix: string;
  aria: string;
  hub: ReactNode;
}) {
  const { stops, rest } = useMemo(() => stopsOf(rows), [rows]);
  const last = stops.length - 1;
  const [at, setAt] = useState(rest);
  const [moved, setMoved] = useState(false);
  const wheel = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const api = useRef<{ tighten: () => void; peace: () => void } | null>(null);

  useEffect(() => {
    const el = wheel.current;
    const rot = spin.current;
    if (!el || !rot) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const angleAt = (i: number) => (rest - i) * STEP;
    const lo = angleAt(last);
    const hi = angleAt(0);
    const stopAt = (a: number) =>
      Math.min(last, Math.max(0, rest - Math.round(a / STEP)));

    let cur = rest; // the picked notch, mirrored here for the handlers
    let angle = 0; // where the wheel rests (or is being held)
    let onScreen = true;
    let dragId = -1;

    const write = (a: number) => {
      rot.style.transform = a ? `rotate(${a.toFixed(2)}deg)` : '';
    };
    const pick = (i: number) => {
      if (i === cur) return false;
      cur = i;
      setAt(i);
      setMoved(true);
      return true;
    };

    // ── The settle: worked out once, played by the compositor. ────────────
    let anim: Animation | null = null;
    let path: number[] = [];
    /** Where a settling wheel is right now, and how fast it is turning. */
    const now = () => {
      if (!anim) return { a: angle, v: 0 };
      const f = (Number(anim.currentTime) || 0) / (1000 / FPS);
      const i = Math.min(path.length - 1, Math.floor(f));
      const j = Math.min(path.length - 1, i + 1);
      return {
        a: path[i] + (path[j] - path[i]) * (f - i),
        v: (path[j] - path[i]) * FPS,
      };
    };
    const drop = () => {
      anim?.cancel();
      anim = null;
      window.removeEventListener('scroll', land);
    };
    /** Land a settle where it is going, now (a page scroll, the valve off screen). */
    function land() {
      drop();
      write(angle);
    }
    const settle = (to: number, v0?: number) => {
      const from = now();
      drop();
      angle = to;
      write(to); // the resting state, under the animation
      if (
        reduce.matches ||
        !onScreen ||
        document.hidden ||
        typeof rot.animate !== 'function'
      )
        return;
      path = springPath(from.a, v0 ?? from.v, to);
      if (path.length < 3) return;
      anim = rot.animate(
        path.map((a) => ({ transform: `rotate(${a.toFixed(2)}deg)` })),
        { duration: ((path.length - 1) * 1000) / FPS, easing: 'linear' }
      );
      anim.onfinish = drop;
      window.addEventListener('scroll', land, { passive: true });
    };
    // A press on the notch it is already at gives the wheel a nudge, so the
    // press is felt; nothing else changes.
    const go = (i: number) => {
      const turned = pick(i);
      settle(angleAt(i), turned ? undefined : i <= rest ? 160 : -160);
    };
    api.current = {
      tighten: () => go(0),
      peace: () => go(cur <= rest || cur >= last ? rest + 1 : cur + 1),
    };

    // ── Drag: the wheel follows the finger round its axle. ────────────────
    // Between notches it resists a little and then snaps through, the feel
    // of a detent. Past either end it rubber-bands. While held it has its own
    // compositor layer; at rest it is plain vector art again, so it stays crisp.
    const shape = (r: number) => {
      if (r > hi) return hi + Math.min(22, (r - hi) * 0.3);
      if (r < lo) return lo - Math.min(22, (lo - r) * 0.3);
      const k = Math.round(r / STEP);
      const x = r - k * STEP;
      return (
        k * STEP +
        x -
        0.55 * (STEP / (2 * Math.PI)) * Math.sin((2 * Math.PI * x) / STEP)
      );
    };
    let raw = 0;
    let lastA = 0;
    let cx = 0;
    let cy = 0;
    let rMin = 0;
    const trail: { t: number; a: number }[] = [];
    const ptA = (e: PointerEvent) =>
      (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    const down = (e: PointerEvent) => {
      if (dragId !== -1 || (e.pointerType === 'mouse' && e.button !== 0))
        return;
      const r = el.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      rMin = r.width * 0.1;
      dragId = e.pointerId;
      el.setPointerCapture(e.pointerId);
      angle = now().a; // catch a settling wheel where it is
      drop();
      write(angle);
      rot.style.willChange = 'transform';
      raw = angle;
      lastA = ptA(e);
      trail.length = 0;
      trail.push({ t: e.timeStamp, a: raw });
      el.dataset.drag = '';
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== dragId) return;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if (dx * dx + dy * dy < rMin * rMin) return; // too near the axle to tell a direction
      const a = ptA(e);
      let d = a - lastA;
      if (d > 180) d -= 360;
      else if (d < -180) d += 360;
      lastA = a;
      raw = Math.min(hi + 80, Math.max(lo - 80, raw + d));
      angle = shape(raw);
      write(angle);
      trail.push({ t: e.timeStamp, a: raw });
      while (trail.length > 2 && e.timeStamp - trail[0].t > 90) trail.shift();
      const i = stopAt(angle);
      if (i !== cur) {
        pick(i);
        if (!reduce.matches) navigator.vibrate?.(4);
      }
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== dragId) return;
      dragId = -1;
      delete el.dataset.drag;
      rot.style.willChange = '';
      // The release is a sample too: a hand that stopped before letting go
      // leaves nothing to fling.
      trail.push({ t: e.timeStamp, a: raw });
      while (trail.length > 1 && e.timeStamp - trail[0].t > 90) trail.shift();
      const a0 = trail[0];
      const a1 = trail[trail.length - 1];
      const dt = (a1.t - a0.t) / 1000;
      const v =
        dt > 0.012 ? Math.max(-1500, Math.min(1500, (a1.a - a0.a) / dt)) : 0;
      const i = stopAt(Math.min(hi, Math.max(lo, raw + v * 0.15)));
      pick(i);
      settle(angleAt(i), v);
    };

    // ── Mouse wheel, once the valve has focus (never steals a page scroll). ─
    let acc = 0;
    let lastWheel = 0;
    const onWheel = (e: WheelEvent) => {
      if (document.activeElement !== el || !e.deltaY) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const next = cur + dir;
      if (next < 0 || next > last) return; // at an end: the page scrolls on
      e.preventDefault();
      if (e.timeStamp - lastWheel > 350) acc = 0;
      lastWheel = e.timeStamp;
      acc += e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      if (Math.abs(acc) >= 45) {
        acc = 0;
        go(next);
      }
    };

    // ── Keyboard: a slider. Up/right tightens, down/left opens. ───────────
    const onKey = (e: KeyboardEvent) => {
      let i = cur;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp')
        i = cur - 1;
      else if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowDown' ||
        e.key === 'PageDown'
      )
        i = cur + 1;
      else if (e.key === 'Home') i = last;
      else if (e.key === 'End') i = 0;
      else return;
      e.preventDefault();
      go(Math.min(last, Math.max(0, i)));
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (!onScreen && anim) land();
    });
    io.observe(el);

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('keydown', onKey);
    return () => {
      drop();
      io.disconnect();
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('lostpointercapture', up);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('keydown', onKey);
      api.current = null;
    };
  }, [rest, last]);

  // The still parts are built once: a press re-renders only what it changes.
  const base = useMemo(
    () => (
      <svg
        className="re-b-stage-svg"
        viewBox="-160 -130 320 270"
        aria-hidden="true"
        focusable="false"
      >
        <circle className="re-b-dial" cx="0" cy="-25" r="97" />
        <circle className="re-b-wheel-shadow" cx="4" cy="-19" r="75" />
        <rect className="re-b-stem" x="-6" y="-25" width="12" height="104" />
        <path className="re-b-bonnet" d="M-20 64H20L27 90H-27Z" />
        <rect
          className="re-b-pipe-in"
          x="-170"
          y="98"
          width="340"
          height="34"
        />
        {strands(bands, -170, -46)}
        <path className="re-b-pipe-wall" d="M-170 98H170M-170 132H170" />
        <rect
          className="re-b-flange"
          x="-46"
          y="91"
          width="10"
          height="48"
          rx="2"
        />
        <rect
          className="re-b-flange"
          x="36"
          y="91"
          width="10"
          height="48"
          rx="2"
        />
        <rect
          className="re-b-body"
          x="-36"
          y="86"
          width="72"
          height="58"
          rx="9"
        />
      </svg>
    ),
    [bands]
  );
  // Downstream of the valve, in its own <svg> so its squeeze is a compositor
  // transform rather than a repaint of the whole drawing; and in a span,
  // which is what squeezes: a transformed <svg> re-lays out its drawing on
  // every frame of the change.
  const flowDown = useMemo(
    () => (
      <span className="re-b-flow-dn" aria-hidden="true">
        <svg
          className="re-b-stage-svg"
          viewBox="-160 -130 320 270"
          focusable="false"
        >
          {strands(bands, 46, 170)}
        </svg>
      </span>
    ),
    [bands]
  );
  const wheelArt = useMemo(
    () => (
      <svg
        className="re-b-wheel-svg"
        viewBox="-86 -86 172 172"
        aria-hidden="true"
        focusable="false"
      >
        <circle className="re-b-rim-back" r="74" />
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={a}
            className="re-b-spoke"
            d="M-6.5 -18 -4 -70H4L6.5 -18Z"
            transform={`rotate(${a})`}
          />
        ))}
        {/* 24 grip bumps: one dotted circle (round caps on near-zero dashes) */}
        <circle className="re-b-knurl" r="81" pathLength="24" />
        <circle className="re-b-rim" r="74" />
        <circle className="re-b-rim-hi" r="78" />
        <circle className="re-b-pointer" cx="0" cy="-74" r="5" />
      </svg>
    ),
    []
  );

  const stop = stops[at];
  const spot = new Set(stop.rows);
  const head = stop.rows.length ? rows[stop.rows[0]] : null;
  const angleOf = (i: number) => ((rest - i) * STEP * Math.PI) / 180;

  return (
    <div className="re-b-valve" data-state={stop.kind}>
      <div className="re-b-rig">
        <div className="re-b-stage">
          {base}
          {flowDown}
          <svg
            className="re-b-stage-svg"
            viewBox="-160 -130 320 270"
            aria-hidden="true"
            focusable="false"
          >
            {stops.map((s, i) => {
              const a = angleOf(i);
              const [sx, sy] = [Math.sin(a), -Math.cos(a)];
              return (
                <line
                  key={i}
                  className={`re-b-tick is-${s.kind}${i === at ? ' is-on' : ''}`}
                  x1={+(sx * 91).toFixed(2)}
                  y1={+(sy * 91 - 25).toFixed(2)}
                  x2={+(sx * 104).toFixed(2)}
                  y2={+(sy * 104 - 25).toFixed(2)}
                />
              );
            })}
          </svg>
          <div
            ref={wheel}
            className="re-b-wheel"
            role="slider"
            tabIndex={0}
            aria-label="China’s valve: turn it to pick a headline"
            aria-valuemin={rest - last}
            aria-valuemax={rest}
            aria-valuenow={rest - at}
            aria-valuetext={
              head
                ? `${head.date}, ${head.event}`
                : 'Centred, no headline picked'
            }
          >
            <div ref={spin} className="re-b-spin">
              {wheelArt}
              <span className="sd-seal re-b-hub" aria-hidden="true">
                {hub}
              </span>
            </div>
            {/* The light stays where it is while the wheel turns under it. */}
            <svg
              className="re-b-wheel-lit"
              viewBox="-86 -86 172 172"
              aria-hidden="true"
              focusable="false"
            >
              <path className="re-b-lit-hi" d="M-62 -36A72 72 0 0 1 36 -62" />
              <path className="re-b-lit-lo" d="M62 36A72 72 0 0 1 -36 62" />
            </svg>
          </div>
        </div>
        <div className="re-b-btns">
          <button
            type="button"
            className="re-b-btn is-down"
            data-valve-peace=""
            onClick={() => api.current?.peace()}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 4.5H4.5V9M5 8.6A8 8 0 1 1 4.6 15" />
            </svg>
            Peace headlines
          </button>
          <button
            type="button"
            className="re-b-btn is-up"
            data-valve-tighten=""
            onClick={() => api.current?.tighten()}
          >
            China tightens
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 4.5h4.5V9M19 8.6A8 8 0 1 0 19.4 15" />
            </svg>
          </button>
        </div>
        {/* Every notch's slip is laid in the same cell, so the slip is always
            as tall as its longest headline and nothing below it ever moves.
            The words are said once, by the live line under it. */}
        <div
          className="sd-note re-b-slip"
          data-moved={moved ? '' : undefined}
          aria-hidden="true"
        >
          {stops.map((s, i) => {
            const on = i === at;
            const first = s.rows.length ? rows[s.rows[0]] : null;
            return (
              <div key={i} className={`re-b-slip-in${on ? ' is-on' : ''}`}>
                {first ? (
                  <>
                    <p className="re-b-slip-d">{first.date}</p>
                    <p className="font-display re-b-slip-h">{first.event}</p>
                    <ul className="re-b-chips" role="list">
                      {s.rows.map((r) => (
                        <li key={r} className={`re-b-chip is-${rows[r].kind}`}>
                          <span className="re-b-chip-a">
                            {rows[r].kind === 'up' ? '▲' : '▼'}
                          </span>
                          <b>{rows[r].ticker}</b>
                          <span>{signed(rows[r].move)}%</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="font-read re-b-slip-hint">
                    Turn the wheel, or press a button. Each notch is a dated
                    headline and that day’s share-price move.
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="sr-only" aria-live="polite">
          {head
            ? `${head.date}, ${head.event}: ${stop.rows
                .map(
                  (r) => `${rows[r].ticker} ${signed(rows[r].move)}${suffix}`
                )
                .join(', ')}.`
            : ''}
        </p>
      </div>

      <div className="re-b-bars" role="img" aria-label={aria}>
        <div className="re-b-axis" aria-hidden="true">
          <span className="re-b-axis-in">
            {TICKS.map((t) => (
              <span
                key={t}
                style={{ '--t': (t + SPAN) / (2 * SPAN) } as CSSProperties}
              >
                {signed(t)}%
              </span>
            ))}
          </span>
        </div>
        {rows.map((r, i) => {
          const on = spot.has(i);
          return (
            <div
              key={r.label}
              className="re-b-row"
              data-kind={r.kind}
              data-spot={on ? '' : undefined}
            >
              <span className="re-b-row-l">{r.label}</span>
              <span className="re-b-row-track">
                <span
                  className="re-b-row-bw"
                  style={{ '--w': Math.abs(r.move) / SPAN } as CSSProperties}
                >
                  <span className="re-b-row-bar" />
                </span>
                <span className="re-b-row-v">{signed(r.move)}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
