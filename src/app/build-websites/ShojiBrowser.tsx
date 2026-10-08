'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

/**
 * The shoji browser: a browser window framed like a shoji screen, with a tiny
 * website inside it (MiniSite, server-rendered twice and passed in).
 *
 *  - Slide it: drag the hikite (the finger pull on the right stile), use the
 *    arrow keys on it, or tap a screen size under the sill. The window's
 *    width is one registered custom property, --bw-v, in *virtual* pixels;
 *    the site inside reflows on its own container queries. Per frame this
 *    island writes that one property on one element (it doesn't inherit), a
 *    number into the readout, and the slider's ARIA values. No React state
 *    per frame.
 *  - Sketch / Code / Ship: which copy of the site is on top. Changing the top
 *    copy is a brush wipe: the incoming copy's wrapper slides in while its
 *    contents slide the other way, so they hold still under a moving edge.
 *    Two transforms, on the compositor. The copy that isn't showing is
 *    content-visibility: hidden, so a drag only ever lays out one site.
 *  - On load the sketch draws itself and a brush inks it to "shipped" (pure
 *    CSS, so it runs before this script loads). On a first visit the window
 *    then narrows to a phone and back once, to show what the handle does.
 *
 * Reduced motion: no intro, no demo, no wipe, no tweens. Dragging still works
 * (it's direct manipulation, not animation).
 */

type Mode = 'sketch' | 'code' | 'ship';
type Layer = 'sketch' | 'ship';
type Lay = 'phone' | 'tablet' | 'desktop';

const MIN = 360;
/** The mini-site's breakpoints, in virtual px. Keep in step with websites.css. */
const TABLET_AT = 560;
const DESKTOP_AT = 800;
const layoutOf = (v: number): Lay =>
  v < TABLET_AT ? 'phone' : v < DESKTOP_AT ? 'tablet' : 'desktop';
const LABEL: Record<Lay, string> = {
  phone: 'Phone',
  tablet: 'Tablet',
  desktop: 'Desktop',
};

const MODES: { key: Mode; label: string }[] = [
  { key: 'sketch', label: 'Sketch' },
  { key: 'code', label: 'Code' },
  { key: 'ship', label: 'Ship' },
];

const CAPTIONS: Record<Mode, string> = {
  sketch:
    'Sketch: boxes on paper, before any code. An X means a picture goes here.',
  code: 'Code: each box becomes an HTML tag, and the tag says what the box is.',
  ship: 'Ship: CSS adds the colour and the type, plus a layout for each screen size.',
};

/** Remembered per browser: the demo is for a first visit, not every visit. */
const SEEN_KEY = 'bw-demo-seen';
const seenDemo = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {}
};

const easeInOut = (p: number) =>
  p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

export default function ShojiBrowser({
  sketch,
  ship,
}: {
  sketch: ReactNode;
  ship: ReactNode;
}) {
  const [mode, setMode] = useState<Mode>('ship');
  const [top, setTop] = useState<Layer>('ship');
  const [sk, setSk] = useState<'sketch' | 'code'>('sketch');
  const [wiping, setWiping] = useState(false);
  const [intro, setIntro] = useState(true);
  const [wipeN, setWipeN] = useState(0);

  const toyRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const hikiteRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const devRef = useRef<HTMLSpanElement>(null);
  const sketchRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);

  // Per-frame state lives in refs, never in React state.
  const v = useRef(1280);
  const max = useRef(1280);
  const lastN = useRef(-1);
  const lastLay = useRef<Lay | null>(null);
  const tweenRaf = useRef(0);
  const touched = useRef(false);
  const reduce = useRef(false);
  const pending = useRef<Mode | null>(null);
  const wipeAnims = useRef<Animation[]>([]);
  const timers = useRef<number[]>([]);

  /**
   * Write the window width (virtual px) and everything that reads it.
   * `edge` is what happens past either end: 'clamp' stops there, 'resist'
   * (a drag) lets it stretch a little, 'raw' (a tween easing back from a
   * stretch) shows the value as given. The readout and the layout always
   * report the clamped width.
   */
  const setV = useCallback(
    (
      next: number,
      byHand = false,
      edge: 'clamp' | 'resist' | 'raw' = 'clamp'
    ) => {
      const win = winRef.current;
      const hikite = hikiteRef.current;
      if (!win || !hikite) return;
      const val = Math.min(max.current, Math.max(MIN, next));
      let shown = val;
      if (edge === 'raw') shown = next;
      else if (edge === 'resist' && next !== val) {
        const over = Math.abs(next - val);
        shown = val + Math.sign(next - val) * 36 * (1 - Math.exp(-over / 90));
      }
      v.current = shown;
      win.style.setProperty('--bw-v', shown.toFixed(2));
      const n = Math.round(val);
      if (n === lastN.current) return;
      lastN.current = n;
      // One text node, rewritten in place: no nodes added or removed per frame.
      const num = numRef.current;
      if (num) {
        if (!num.firstChild) {
          num.appendChild(document.createTextNode(''));
          num.parentElement?.parentElement?.setAttribute('data-live', '');
        }
        (num.firstChild as Text).data = String(n);
      }
      const lay = layoutOf(n);
      hikite.setAttribute('aria-valuenow', String(n));
      hikite.setAttribute(
        'aria-valuetext',
        `${LABEL[lay]} layout, ${n} pixels wide`
      );
      if (lay !== lastLay.current) {
        const prev = lastLay.current;
        lastLay.current = lay;
        if (devRef.current) devRef.current.textContent = LABEL[lay];
        if (toyRef.current) toyRef.current.dataset.layout = lay;
        if (prev && !reduce.current) {
          devRef.current?.animate(
            [{ transform: 'scale(1.18)' }, { transform: 'none' }],
            { duration: 320, easing: 'cubic-bezier(.2,1.4,.4,1)' }
          );
          // The red mark that was just crossed answers: that was a breakpoint.
          const pair = [prev, lay];
          const marks = [
            pair.includes('phone') ? '.bw-bp-t' : '',
            pair.includes('desktop') ? '.bw-bp-d' : '',
          ].filter(Boolean);
          for (const m of marks) {
            toyRef.current
              ?.querySelector(m)
              ?.animate(
                [
                  { transform: 'scale(1)' },
                  { transform: 'scale(1.6, 1.9)', offset: 0.35 },
                  { transform: 'scale(1)' },
                ],
                { duration: 420, easing: 'ease-out' }
              );
          }
        }
        // A small tick in the hand when the layout snaps (Android; elsewhere
        // a no-op). Only for a person's own drag, never the demo.
        if (prev && byHand) {
          try {
            navigator.vibrate?.(8);
          } catch {}
        }
      }
    },
    []
  );

  /**
   * Kiru holds still while the window is being resized, the way SiteFX holds
   * him while the page scrolls (data-hold pauses his loops mid-pose). His
   * loops are free when nothing else is drawing, but once the main thread
   * draws every frame anyway it ticks them too, and inside an SVG that's a
   * style pass and a layout per frame: measured at 4x, holding him takes a
   * drag from ~47% of the main thread to under 30%.
   */
  const holdKiru = useCallback((on: boolean) => {
    const kiru = shipRef.current?.querySelector('svg[data-kiru]');
    if (!kiru) return;
    if (on) kiru.setAttribute('data-hold', '');
    else kiru.removeAttribute('data-hold');
  }, []);

  const stopTween = useCallback(() => {
    if (tweenRaf.current) {
      cancelAnimationFrame(tweenRaf.current);
      holdKiru(false);
    }
    tweenRaf.current = 0;
  }, [holdKiru]);

  const tween = useCallback(
    (to: number, ms: number, done?: () => void) => {
      stopTween();
      const from = v.current;
      const target = Math.min(max.current, Math.max(MIN, to));
      if (reduce.current || ms <= 0 || Math.abs(target - from) < 0.5) {
        setV(target);
        done?.();
        return;
      }
      holdKiru(true);
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / ms);
        setV(from + (target - from) * easeInOut(p), false, 'raw');
        if (p < 1) tweenRaf.current = requestAnimationFrame(step);
        else {
          tweenRaf.current = 0;
          holdKiru(false);
          done?.();
        }
      };
      tweenRaf.current = requestAnimationFrame(step);
    },
    [setV, stopTween, holdKiru]
  );

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  /** A person did something: the intro and the demo step aside for good. */
  const takeOver = useCallback(() => {
    if (touched.current) return;
    touched.current = true;
    markSeen();
    clearTimers();
    stopTween();
    setIntro(false);
    toyRef.current?.removeAttribute('data-demo');
  }, [stopTween]);

  // ── Mount: measure, then hand over from the CSS intro to the demo ───────
  useEffect(() => {
    const toy = toyRef.current;
    const track = trackRef.current;
    if (!toy || !track) return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduce.current = rm.matches;

    const measure = () => {
      const cs = getComputedStyle(track);
      const m = parseFloat(cs.getPropertyValue('--bw-max')) || 1280;
      const wasMax = v.current >= max.current - 0.5;
      max.current = m;
      setV(wasMax ? m : v.current);
    };
    v.current = Number.POSITIVE_INFINITY;
    measure();
    hikiteRef.current?.setAttribute('aria-valuemax', String(max.current));

    const ro = new ResizeObserver(() => {
      measure();
      hikiteRef.current?.setAttribute('aria-valuemax', String(max.current));
    });
    ro.observe(track);

    let io: IntersectionObserver | null = null;
    const demo = () => {
      if (touched.current || reduce.current) return;
      toy.dataset.demo = '';
      const end = () => {
        markSeen();
        toy.removeAttribute('data-demo');
        io?.disconnect();
        io = null;
        // Then the pull shows itself off, once.
        toy.dataset.hint = '';
        timers.current.push(
          window.setTimeout(() => toy.removeAttribute('data-hint'), 2600)
        );
      };
      tween(390, 1350, () => {
        timers.current.push(
          window.setTimeout(() => {
            if (!touched.current) tween(max.current, 1050, end);
          }, 650)
        );
      });
    };
    // The demo plays once, when the toy is well on screen. If it scrolls
    // away mid-demo, the demo stops and the window snaps back to its widest:
    // nothing animates off screen.
    let started = false;
    const armDemo = () => {
      if (touched.current || reduce.current || seenDemo()) return;
      io = new IntersectionObserver(
        ([e]) => {
          if (!started) {
            if (!e.isIntersecting || e.intersectionRatio < 0.6) return;
            started = true;
            timers.current.push(window.setTimeout(demo, 380));
            return;
          }
          if (e.isIntersecting || !toy.hasAttribute('data-demo')) return;
          clearTimers();
          stopTween();
          toy.removeAttribute('data-demo');
          setV(max.current);
          io?.disconnect();
          io = null;
        },
        { threshold: [0, 0.6] }
      );
      io.observe(track);
    };

    // The intro is CSS (it starts at first paint, before this script).
    // Wait for its own animations, not Kiru's loops, which never end.
    const intros = toy
      .getAnimations({ subtree: true })
      .filter(
        (a) => a instanceof CSSAnimation && a.animationName.startsWith('bw-')
      );
    let alive = true;
    Promise.all(intros.map((a) => a.finished))
      .then(() => {
        if (!alive || touched.current) return;
        setIntro(false);
        armDemo();
      })
      .catch(() => {});

    // Ends the demo where it stands: the window snaps back to its widest.
    const endDemo = () => {
      clearTimers();
      stopTween();
      toy.removeAttribute('data-demo');
      setV(max.current);
      io?.disconnect();
      io = null;
    };
    // A hidden tab runs no frames, so the demo would come back frozen
    // half-narrowed: end it instead. An ordinary tween can stay, because its
    // clock is the wall clock: it lands on its end value when the tab returns.
    const onHide = () => {
      if (document.hidden && toy.hasAttribute('data-demo')) endDemo();
    };
    document.addEventListener('visibilitychange', onHide);
    // Reduced motion switched on mid-visit: the demo ends, and from here on
    // presets jump and mode changes swap without the wipe (both read
    // reduce.current when they run).
    const onMotion = () => {
      reduce.current = rm.matches;
      if (rm.matches && toy.hasAttribute('data-demo')) endDemo();
    };
    rm.addEventListener('change', onMotion);

    return () => {
      alive = false;
      ro.disconnect();
      io?.disconnect();
      clearTimers();
      stopTween();
      document.removeEventListener('visibilitychange', onHide);
      rm.removeEventListener('change', onMotion);
    };
  }, [setV, stopTween, tween]);

  // ── The brush wipe, whenever the top copy changes ──────────────────────
  const incoming = useRef<Layer>('ship');
  const topRef = useRef<Layer>('ship');
  const switchTop = useCallback((nextTop: Layer) => {
    topRef.current = nextTop;
    setTop(nextTop);
    if (reduce.current) return;
    incoming.current = nextTop;
    setWiping(true);
    setWipeN((n) => n + 1);
  }, []);

  useLayoutEffect(() => {
    if (!wipeN) return;
    const layer = (incoming.current === 'ship' ? shipRef : sketchRef).current;
    const inner = layer?.firstElementChild as HTMLElement | null;
    if (!layer || !inner) return;
    const opts: KeyframeAnimationOptions = {
      duration: 780,
      easing: 'cubic-bezier(.65,0,.35,1)',
    };
    const a = layer.animate(
      [{ transform: 'translateX(-100%)' }, { transform: 'none' }],
      opts
    );
    const b = inner.animate(
      [{ transform: 'translateX(100%)' }, { transform: 'none' }],
      opts
    );
    wipeAnims.current = [a, b];
    let live = true;
    Promise.all([a.finished, b.finished])
      .then(() => {
        if (!live) return;
        wipeAnims.current = [];
        // A choice made mid-wipe waited for the brush; apply it now.
        const next = pending.current;
        pending.current = null;
        const nextTop: Layer | null =
          next === null ? null : next === 'ship' ? 'ship' : 'sketch';
        if (nextTop && nextTop !== topRef.current) switchTop(nextTop);
        else setWiping(false);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [wipeN, switchTop]);

  // A choice made mid-wipe waits for the brush, then applies.
  const choose = useCallback(
    (next: Mode) => {
      takeOver();
      if (next !== 'ship') setSk(next);
      setMode(next);
      if (wipeAnims.current.length) {
        pending.current = next;
        return;
      }
      const nextTop: Layer = next === 'ship' ? 'ship' : 'sketch';
      if (nextTop !== topRef.current) switchTop(nextTop);
    },
    [takeOver, switchTop]
  );

  // ── Dragging the pull ───────────────────────────────────────────────────
  const drag = useRef<{ id: number; x: number; v: number; k: number } | null>(
    null
  );
  const dragRaf = useRef(0);
  const dragTo = useRef(0);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const track = trackRef.current;
      const hikite = hikiteRef.current;
      if (!track || !hikite) return;
      takeOver();
      // A snap or a spring-back may still be easing: the hand wins.
      stopTween();
      e.preventDefault();
      hikite.focus({ preventScroll: true });
      hikite.setPointerCapture(e.pointerId);
      const k = parseFloat(getComputedStyle(track).getPropertyValue('--bw-k'));
      drag.current = {
        id: e.pointerId,
        x: e.clientX,
        v: v.current,
        k: k > 0 ? k : 0.3,
      };
      toyRef.current?.setAttribute('data-drag', '');
      holdKiru(true);
    },
    [takeOver, stopTween, holdKiru]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      dragTo.current = d.v + (e.clientX - d.x) / d.k;
      if (!dragRaf.current) {
        dragRaf.current = requestAnimationFrame(() => {
          dragRaf.current = 0;
          setV(dragTo.current, true, 'resist');
        });
      }
    },
    [setV]
  );

  const endDrag = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.id) return;
      drag.current = null;
      if (dragRaf.current) {
        cancelAnimationFrame(dragRaf.current);
        dragRaf.current = 0;
        setV(dragTo.current, true, 'resist');
      }
      toyRef.current?.removeAttribute('data-drag');
      holdKiru(false);
      // Pulled past an end, it springs back; let go near a screen size and
      // it settles onto it.
      const end = Math.min(max.current, Math.max(MIN, v.current));
      const near = [390, 768, max.current].find(
        (p) => Math.abs(p - v.current) <= 14
      );
      if (end !== v.current) tween(end, 260);
      else if (near !== undefined) tween(near, 160);
    },
    [setV, holdKiru, tween]
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      const step = e.shiftKey ? 50 : 10;
      const stops = [MIN, 390, 768, max.current];
      let to: number | null = null;
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          to = v.current - step;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          to = v.current + step;
          break;
        case 'PageDown':
          to = [...stops].reverse().find((s) => s < v.current - 0.5) ?? MIN;
          break;
        case 'PageUp':
          to = stops.find((s) => s > v.current + 0.5) ?? max.current;
          break;
        case 'Home':
          to = MIN;
          break;
        case 'End':
          to = max.current;
          break;
      }
      if (to === null) return;
      e.preventDefault();
      takeOver();
      stopTween();
      setV(to, true);
    },
    [takeOver, stopTween, setV]
  );

  const goTo = useCallback(
    (to: number | 'max') => {
      takeOver();
      tween(to === 'max' ? max.current : to, 560);
    },
    [takeOver, tween]
  );

  // The track never depends on the mode, so a mode change (a click) doesn't
  // re-render it: everything that changes in here per frame is written
  // straight to the DOM by setV.
  const track = useMemo(
    () => (
      <div ref={trackRef} className="bw-track">
        <div className="bw-wall" aria-hidden />
        <div ref={winRef} className="bw-win">
          <div className="bw-frame" aria-hidden />
          <div className="bw-bar" aria-hidden>
            <span className="bw-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="bw-url">
              <svg viewBox="0 0 12 12" className="bw-lock">
                <path d="M3.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5" />
                <rect x="2.5" y="5.5" width="7" height="5" rx="1.2" />
              </svg>
              kiru.dojo
            </span>
          </div>
          <div className="bw-view" aria-hidden data-nosnippet>
            <div ref={sketchRef} className="bw-layer bw-l-sketch">
              <div className="bw-inner">{sketch}</div>
              <span className="bw-brush" />
            </div>
            <div ref={shipRef} className="bw-layer bw-l-ship">
              <div className="bw-inner">{ship}</div>
              <span className="bw-brush" />
            </div>
          </div>
          <div
            ref={hikiteRef}
            className="bw-hikite"
            role="slider"
            tabIndex={0}
            aria-label="Width of the little browser"
            aria-orientation="horizontal"
            aria-valuemin={MIN}
            aria-valuemax={1280}
            aria-valuenow={1280}
            aria-valuetext="Desktop layout, 1280 pixels wide"
            aria-describedby="bw-toy-desc"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onLostPointerCapture={endDrag}
            onKeyDown={onKeyDown}
          >
            <span className="bw-pull" />
          </div>
          <span className="bw-edge" aria-hidden />
        </div>
        <div className="bw-sill">
          <div className="bw-groove" aria-hidden>
            <i className="bw-bp bw-bp-t" />
            <i className="bw-bp bw-bp-d" />
          </div>
          <div className="bw-presets" role="group" aria-label="Screen sizes">
            <button
              type="button"
              className="bw-pre bw-pre-phone"
              onClick={() => goTo(390)}
            >
              Phone
            </button>
            <button
              type="button"
              className="bw-pre bw-pre-tablet"
              onClick={() => goTo(768)}
            >
              Tablet
            </button>
            <button
              type="button"
              className="bw-pre bw-pre-desktop"
              onClick={() => goTo('max')}
            >
              Desktop
            </button>
          </div>
        </div>
      </div>
    ),
    [sketch, ship, onPointerDown, onPointerMove, endDrag, onKeyDown, goTo]
  );

  const modeIndex = MODES.findIndex((m) => m.key === mode);

  return (
    <div
      ref={toyRef}
      className={`bw-toy${intro ? ' bw-intro' : ''}`}
      data-mode={mode}
      data-top={top}
      data-wiping={wiping ? '' : undefined}
      data-sk={sk}
      data-layout="desktop"
    >
      <p id="bw-toy-desc" className="sr-only">
        A small made-up website for a dojo, inside a browser window. Change the
        window&rsquo;s width with the slider and the site rearranges for a
        phone, a tablet or a desktop. Switch between Sketch, Code and Ship to
        see it as a wireframe, as named HTML boxes, or finished.
      </p>
      <div className="bw-tools">
        <fieldset
          className="bw-seg"
          style={{ '--n': modeIndex } as CSSProperties}
        >
          <legend className="sr-only">Show the little site as</legend>
          <span className="bw-seg-ind" aria-hidden />
          {MODES.map((m) => (
            <label key={m.key} className="bw-seg-opt">
              <input
                type="radio"
                name="bw-mode"
                value={m.key}
                checked={mode === m.key}
                onChange={() => choose(m.key)}
                className="sr-only"
              />
              <span>{m.label}</span>
            </label>
          ))}
        </fieldset>
        <p className="bw-read" aria-hidden="true">
          <span className="bw-read-in">
            <span ref={devRef} className="bw-dev">
              Desktop
            </span>
            <span className="bw-sep"> · </span>
            <span className="bw-num0" />
            <span ref={numRef} className="bw-num" />
            px
          </span>
        </p>
      </div>

      {track}

      <p className="bw-cap" aria-live="polite">
        {CAPTIONS[mode]}
      </p>
    </div>
  );
}
