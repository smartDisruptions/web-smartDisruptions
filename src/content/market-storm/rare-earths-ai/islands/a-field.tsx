'use client';

import { useEffect, useRef } from 'react';

/**
 * MagnetField — the hero's iron filings, on one 2D canvas.
 *
 * WHAT IT DRAWS
 * -------------
 * A few thousand short ink strokes (iron filings) lying on the hero's washi,
 * each lined up with the magnetic field of the bar magnet the five element
 * tiles make. The field is a uniformly magnetised bar: each pole face is a
 * sheet of magnetic "charge", integrated in closed form (four square roots a
 * point). Filings in a strong field form chains along it; where it is weak
 * they stay scattered, as real filings do when friction beats the torque.
 *
 * The reader's pointer (or a finger) is a second magnet: an S pole held just
 * above the paper. Every filing swings to the combined field on its own
 * damped spring — stiff where the field is strong, lazy where it is weak — so
 * the paper answers like iron, not like a chart. A finger can drag sideways
 * across the paper (vertical drags still scroll) or tap to set the magnet
 * down for a moment.
 *
 * Once, on load, the filings are sprinkled onto the paper at random and then
 * the paper is "tapped": they jump into line. By day they are sumi ink; by
 * night, moonlit silver-indigo.
 *
 * WHY IT COSTS ALMOST NOTHING
 * ---------------------------
 * - It starts after `load`, in an idle callback. First paint is the field
 *   drawn as dashed lines on the server (Hero.tsx), which also stays as the
 *   fallback if a 2D canvas is unavailable or its context is lost.
 * - Every frame is ONE batched path: all the filings, one stroke() call,
 *   one device pixel wide (Skia's hairline fast path; see sizeCanvas).
 * - It draws only while something moves — the sprinkle, a swinging filing,
 *   the pointer magnet easing. When everything settles the loop stops: no
 *   idle frames. It never runs off screen, in a hidden tab, or while the
 *   page scrolls (it holds still until scrollend, like Kiru).
 * - The canvas holds a capped number of device pixels, and covers only the
 *   paper around the magnet.
 * - Under prefers-reduced-motion it draws one settled still and stops; the
 *   pointer does nothing.
 *
 * It is decoration: aria-hidden, pointer-events: none. It listens to the hero
 * passively and never cancels an event, so it can't take a tap from a link.
 */

const T_TAP = 0.36; // s into the sprinkle: the paper is tapped and the filings align
const SPRINKLE = 0.3; // s over which the filings land
const W0 = 9; // spring rate (rad/s) in a vanishing field…
const W1 = 21; // …plus this much in a strong one
const ZETA = 0.5; // damping: a little overshoot, like iron on paper
const FEATHER = 18; // px: filings thin out this close to text
const EDGE = 30; // px: and toward the paper's edges

/** Small fast seeded PRNG, so a layout is the same pattern every time. */
function prng(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Box = [number, number, number, number]; // left, top, right, bottom, in layer px

export default function MagnetField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layerEl = ref.current;
    const heroEl = layerEl?.closest<HTMLElement>('[data-a-hero]');
    const barEl = heroEl?.querySelector<HTMLElement>('[data-a-bar]');
    if (!layerEl || !heroEl || !barEl) return;
    const layer: HTMLElement = layerEl;
    const hero: HTMLElement = heroEl;
    const bar: HTMLElement = barEl;

    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const canvas = document.createElement('canvas');
    canvas.className = 're-a-canvas';
    let ctx: CanvasRenderingContext2D | null = null;

    // ── Geometry, in the layer's CSS pixels ────────────────────────────────
    let W = 0;
    let H = 0;
    let heroW = 0;
    let heroH = 0;
    let scale = 1;
    let originX = 0; // the layer's position in the document
    let originY = 0;
    let cx = 0; // bar centre, half-length, pole-face half-height
    let cy = 0;
    let A = 1;
    let B = 1;
    let ax = 1; // the bar's axis, N → S: across on a wide screen, down on a phone
    let ay = 0;
    let fadeL = 30; // how far in from its left edge the paper fades in
    let fieldRef = 1; // field strength that counts as "strong"
    let poleQ = 1; // the pointer magnet's strength
    let poleH2 = 400; // its height above the paper, squared

    // ── The filings ────────────────────────────────────────────────────────
    let n = 0;
    let X = new Float32Array(0); // position
    let Y = new Float32Array(0);
    let LEN = new Float32Array(0); // length
    let TH = new Float32Array(0); // angle now
    let OM = new Float32Array(0); // angular velocity
    let BX = new Float32Array(0); // the bar's field here
    let BY = new Float32Array(0);
    let SB = new Float32Array(0); // its strength, 0..1
    let TB = new Float32Array(0); // the angle it asks for
    let DIS = new Float32Array(0); // this filing's disorder in a weak field
    let LAND = new Float32Array(0); // when it lands, in the sprinkle

    // ── State ──────────────────────────────────────────────────────────────
    let mode: 'off' | 'live' | 'still' = 'off';
    let disposed = false;
    let raf = 0;
    let last = 0;
    let onScreen = false;
    let intro = -1; // seconds into the sprinkle, or -1
    let tapped = false;
    let mx = 0; // the pointer magnet: where it is, where it's going, how strong
    let my = 0;
    let tx = 0;
    let ty = 0;
    let pm = 0;
    let pmTarget = 0;
    let ink = 'rgba(21,23,43,.85)';
    let touch: { x: number; y: number; drag: boolean } | null = null;
    let liftTimer = 0;
    let tapTimer = 0;
    let layoutQueued = 0;

    /** The bar's field at (x, y), in the bar's frame (u along the axis, v across) and back. */
    function barField(x: number, y: number, out: Float64Array) {
      const px = x - cx;
      const py = y - cy;
      const u = px * ax + py * ay;
      const v = py * ax - px * ay;
      const vp = v + B;
      const vm = v - B;
      let du = u + A; // N face: +1
      if (du > -1e-3 && du < 1e-3) du = du < 0 ? -1e-3 : 1e-3;
      let rp = Math.sqrt(du * du + vp * vp);
      let rm = Math.sqrt(du * du + vm * vm);
      let fu = (vp / rp - vm / rm) / du;
      let fv = 1 / rm - 1 / rp;
      du = u - A; // S face: −1
      if (du > -1e-3 && du < 1e-3) du = du < 0 ? -1e-3 : 1e-3;
      rp = Math.sqrt(du * du + vp * vp);
      rm = Math.sqrt(du * du + vm * vm);
      fu -= (vp / rp - vm / rm) / du;
      fv -= 1 / rm - 1 / rp;
      out[0] = fu * ax - fv * ay;
      out[1] = fu * ay + fv * ax;
    }

    function readInk() {
      ink =
        getComputedStyle(layer).getPropertyValue('--re-a-filing').trim() || ink;
    }

    function measureOrigin() {
      const r = layer.getBoundingClientRect();
      originX = r.left + window.scrollX;
      originY = r.top + window.scrollY;
    }

    /** Read the layout once (all reads, then no writes until generate). */
    function measure() {
      const lr = layer.getBoundingClientRect();
      const hr = hero.getBoundingClientRect();
      const br = bar.getBoundingClientRect();
      W = lr.width;
      H = lr.height;
      heroW = hr.width;
      heroH = hr.height;
      originX = lr.left + window.scrollX;
      originY = lr.top + window.scrollY;
      // On a wide screen the paper starts beside the title, not at the edge
      // of the screen: there it fades in gently rather than stopping.
      fadeL = lr.left > 2 ? 160 : EDGE;
      cx = br.left - lr.left + br.width / 2;
      cy = br.top - lr.top + br.height / 2;
      // A bar standing upright (a phone) has N at the top.
      const upright = br.height > br.width;
      ax = upright ? 0 : 1;
      ay = upright ? 1 : 0;
      A = Math.max(40, (upright ? br.height : br.width) / 2);
      B = Math.max(10, ((upright ? br.width : br.height) / 2) * 0.86);
      const box = (r: DOMRect, pad: number): Box => [
        r.left - lr.left - pad,
        r.top - lr.top - pad,
        r.right - lr.left + pad,
        r.bottom - lr.top + pad,
      ];
      const clears: Box[] = [];
      const range = document.createRange();
      hero.querySelectorAll<HTMLElement>('[data-a-clear]').forEach((el) => {
        if (el.dataset.aClear === 'text') {
          range.selectNodeContents(el);
          for (const r of range.getClientRects())
            if (r.width > 1) clears.push(box(r, 3));
        } else {
          clears.push(box(el.getBoundingClientRect(), 4));
        }
      });
      return { clears, barBox: box(br, 3) };
    }

    /** Sprinkle the filings: chains along the field where it's strong, scattered where it's weak. */
    function generate(clears: Box[], barBox: Box, settled: boolean) {
      const rnd = prng(0x5ad15c0 ^ Math.round(W * 7 + H));
      const f = new Float64Array(2);
      barField(cx - ay * A * 1.1, cy + ax * A * 1.1, f);
      fieldRef = Math.hypot(f[0], f[1]);
      poleQ = 2 * B * 1.5;
      poleH2 = Math.max(14, B * 0.6) ** 2;
      const lenK = Math.min(1.12, Math.max(0.82, A / 250));

      const inBar = (x: number, y: number) =>
        x > barBox[0] && x < barBox[2] && y > barBox[1] && y < barBox[3];
      const clearDist = (x: number, y: number) => {
        let d = 1e9;
        for (const c of clears) {
          const dx = Math.max(c[0] - x, 0, x - c[2]);
          const dy = Math.max(c[1] - y, 0, y - c[3]);
          const e = dx === 0 && dy === 0 ? 0 : Math.sqrt(dx * dx + dy * dy);
          if (e < d) d = e;
        }
        return d;
      };
      const strength = (x: number, y: number) => {
        barField(x, y, f);
        const m = Math.hypot(f[0], f[1]);
        return m / (m + fieldRef);
      };
      const accept = (x: number, y: number, s: number) => {
        const edge = Math.min((x * EDGE) / fadeL, W - x, y, H - y);
        if (edge <= 0) return 0;
        const cd = clearDist(x, y);
        if (cd < 2) return 0;
        const e = edge < EDGE ? (edge / EDGE) ** 2 : 1;
        const c = cd < FEATHER ? (cd / FEATHER) ** 2 : 1;
        return Math.min(1, 0.13 + s * s) * e * c;
      };

      // Pick the grid spacing that lands near the target count.
      const target = Math.round(Math.min(4400, Math.max(1500, (W * H) / 60)));
      let est = 0;
      for (let y = 10; y < H; y += 20) {
        for (let x = 10; x < W; x += 20) {
          if (inBar(x, y)) continue;
          const s = strength(x, y);
          est += accept(x, y, s) * (1 + 3 * s * s);
        }
      }
      const g = Math.max(5, 20 * Math.sqrt(est / target));

      const px: number[] = [];
      const py: number[] = [];
      const pl: number[] = [];
      for (let gy = 0; gy < H; gy += g) {
        for (let gx = 0; gx < W; gx += g) {
          let x = gx + rnd() * g;
          let y = gy + rnd() * g;
          if (inBar(x, y)) continue;
          let s = strength(x, y);
          if (rnd() > accept(x, y, s)) continue;
          // A chain: in a strong field each filing pulls the next into line.
          const links = 1 + Math.floor(rnd() * (1 + 6 * s * s));
          const dir = rnd() < 0.5 ? -1 : 1;
          for (let k = 0; k < links; k++) {
            if (k > 0) s = strength(x, y);
            const len =
              (rnd() < 0.45 ? 2 + rnd() * 2.6 : 4 + rnd() * 5.2) *
              lenK *
              (0.74 + 0.46 * s);
            px.push(x);
            py.push(y);
            pl.push(len);
            const m = Math.hypot(f[0], f[1]) || 1;
            const step = len + 1.3 + rnd() * 1.5;
            x += (dir * f[0] * step) / m + (rnd() - 0.5) * 0.8;
            y += (dir * f[1] * step) / m + (rnd() - 0.5) * 0.8;
            if (
              x < 0 ||
              y < 0 ||
              x > W ||
              y > H ||
              inBar(x, y) ||
              clearDist(x, y) < 3
            )
              break;
          }
        }
      }

      n = Math.min(px.length, 6000);
      X = Float32Array.from(px.slice(0, n));
      Y = Float32Array.from(py.slice(0, n));
      LEN = Float32Array.from(pl.slice(0, n));
      TH = new Float32Array(n);
      OM = new Float32Array(n);
      BX = new Float32Array(n);
      BY = new Float32Array(n);
      SB = new Float32Array(n);
      TB = new Float32Array(n);
      DIS = new Float32Array(n);
      LAND = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        barField(X[i], Y[i], f);
        BX[i] = f[0];
        BY[i] = f[1];
        const m = Math.hypot(f[0], f[1]);
        const s = m / (m + fieldRef);
        SB[i] = s;
        DIS[i] = (rnd() - 0.5) * 2.4;
        TB[i] = Math.atan2(f[1], f[0]) + DIS[i] * (1 - s) * (1 - s);
        TH[i] = settled ? TB[i] : rnd() * Math.PI;
        LAND[i] = rnd() * SPRINKLE;
      }
    }

    /**
     * The canvas's pixel density. Every filing is stroked exactly one device
     * pixel wide (see render), which Skia rasterises on its hairline fast
     * path — about eight times cheaper than a 1.1px stroke on a CPU-drawn
     * canvas, the difference between 4ms and 33ms a frame for 4,400 filings.
     * So the density also sets how fine the ink looks: a phone gets 1.5
     * (filings about ⅔ of a CSS pixel, still crisp), anything else up to 2,
     * all within a pixel budget.
     */
    function sizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const fine = fineMq.matches;
      const budget = fine ? 1_300_000 : 700_000;
      scale = Math.max(
        0.75,
        Math.min(dpr, fine ? 2 : 1.5, Math.sqrt(budget / Math.max(1, W * H)))
      );
      const w = Math.max(1, Math.round(W * scale));
      const h = Math.max(1, Math.round(H * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }

    function layout(settled: boolean) {
      const { clears, barBox } = measure();
      sizeCanvas();
      generate(clears, barBox, settled);
    }

    /**
     * One frame: advance every filing's spring toward the field (when `dt`),
     * and stroke them all as ONE path. Returns whether anything still moves.
     */
    function render(dt: number, from = -1) {
      const c = ctx;
      if (!c) return false;
      c.setTransform(scale, 0, 0, scale, 0, 0);
      // While the filings are still landing nothing on the paper moves, so
      // a sprinkle frame only adds the ones that landed since the last.
      const adding = from >= 0;
      if (!adding) c.clearRect(0, 0, W, H);
      c.beginPath();
      const sim = dt > 0 && (intro < 0 || tapped);
      const pole = pm > 0.001;
      const q = poleQ * pm;
      const t = intro;
      let maxD = 0;
      let maxO = 0;
      for (let i = 0; i < n; i++) {
        if (t >= 0) {
          const land = LAND[i];
          if (land > t || (adding && land <= from)) continue;
        }
        const x = X[i];
        const y = Y[i];
        let th = TH[i];
        if (sim) {
          let s = SB[i];
          let phi = TB[i];
          if (pole) {
            const dx = x - mx;
            const dy = y - my;
            const r2 = dx * dx + dy * dy + poleH2;
            const k = q / (r2 * Math.sqrt(r2));
            const fx = BX[i] - dx * k;
            const fy = BY[i] - dy * k;
            const m = Math.sqrt(fx * fx + fy * fy);
            s = m / (m + fieldRef);
            const w = 1 - s;
            phi = Math.atan2(fy, fx) + DIS[i] * w * w;
          }
          let d = phi - th;
          d -= Math.PI * Math.round(d / Math.PI); // filings have no head: θ ≡ θ + π
          const wn = W0 + W1 * s;
          const om = OM[i] + (wn * wn * d - 2 * ZETA * wn * OM[i]) * dt;
          th += om * dt;
          TH[i] = th;
          OM[i] = om;
          const ad = d < 0 ? -d : d;
          const ao = om < 0 ? -om : om;
          if (ad > maxD) maxD = ad;
          if (ao > maxO) maxO = ao;
        }
        const hl = LEN[i] * 0.5;
        const co = Math.cos(th) * hl;
        const si = Math.sin(th) * hl;
        c.moveTo(x - co, y - si);
        c.lineTo(x + co, y + si);
      }
      c.lineCap = 'butt';
      c.lineWidth = 1 / scale; // one device pixel: the hairline fast path
      c.strokeStyle = ink;
      c.stroke();
      return maxD > 0.01 || maxO > 0.08;
    }

    function frame(now: number) {
      raf = 0;
      if (disposed || mode !== 'live' || !onScreen || scrolling) return;
      if (document.hidden) return;
      const dt = last
        ? Math.min(0.034, Math.max(0.004, (now - last) / 1000))
        : 0.016;
      last = now;

      // The pointer magnet eases toward the pointer and in or out of strength.
      pm += (pmTarget - pm) * (1 - Math.exp(-dt * 7));
      if (Math.abs(pmTarget - pm) < 0.003) pm = pmTarget;
      const k = 1 - Math.exp(-dt * 15);
      mx += (tx - mx) * k;
      my += (ty - my) * k;
      const magnet =
        pm !== pmTarget ||
        (pm > 0 && Math.abs(tx - mx) + Math.abs(ty - my) > 0.4);

      let from = -1;
      if (intro >= 0) {
        if (intro > 0) from = intro; // the first sprinkle frame draws from blank
        intro += dt;
        if (!tapped && intro >= T_TAP) {
          // The tap: every filing gets a small kick, then the field takes it.
          tapped = true;
          for (let i = 0; i < n; i++) OM[i] = (Math.random() - 0.5) * 7;
          hero.setAttribute('data-a-tap', '');
          tapTimer = window.setTimeout(
            () => hero.removeAttribute('data-a-tap'),
            900
          );
        }
      }
      const moving = render(dt, tapped ? -1 : from);
      if (intro >= 0 && tapped && !moving) intro = -1;
      if (intro >= 0 || moving || magnet) raf = requestAnimationFrame(frame);
    }

    function wake() {
      if (
        !raf &&
        mode === 'live' &&
        onScreen &&
        !scrolling &&
        !document.hidden &&
        !disposed
      ) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    // ── It holds still while the page scrolls ──────────────────────────────
    // Like Kiru (SiteFX): from a gesture's first scroll event to scrollend
    // nothing draws and pointer moves are ignored — Chrome sends synthetic
    // ones as the page slides under a resting mouse, and every frame of
    // filings drawn mid-scroll would cost a canvas commit on a scrolling
    // frame. One passive listener catches just the first event (where
    // scrollend exists), so nothing runs per scrolling frame; the field
    // carries on from where it was once the page is still.
    // A reader scrolls in bursts (and a wheel ends a scroll at every
    // notch), so the field waits a beat after a scroll ends before it moves
    // again: it never redraws between two flicks.
    const hasScrollEnd = 'onscrollend' in window;
    let scrolling = false;
    let quiet = 0;
    let grace = 0;
    let armed = false;
    const listenScroll = () => {
      if (armed) return;
      armed = true;
      window.addEventListener('scroll', onScroll, {
        passive: true,
        once: hasScrollEnd,
      });
    };
    function onScroll() {
      if (hasScrollEnd) armed = false; // a `once` listener is spent
      window.clearTimeout(grace);
      if (!scrolling) {
        scrolling = true;
        stop();
      }
      window.clearTimeout(quiet);
      quiet = window.setTimeout(release, hasScrollEnd ? 3000 : 160);
    }
    function ended() {
      window.clearTimeout(quiet);
      window.clearTimeout(grace);
      grace = window.setTimeout(release, 250);
      listenScroll();
    }
    function release() {
      window.clearTimeout(quiet);
      window.clearTimeout(grace);
      if (scrolling) {
        scrolling = false;
        wake();
      }
      if (hasScrollEnd) listenScroll();
    }

    // ── The pointer is a magnet ────────────────────────────────────────────
    function aim(clientX: number, clientY: number) {
      tx = clientX + window.scrollX - originX;
      ty = clientY + window.scrollY - originY;
      if (pm < 0.02) {
        // Set the magnet down where the pointer is, rather than sliding it there.
        mx = tx;
        my = ty;
      }
      pmTarget = 1;
      wake();
    }
    function lift() {
      window.clearTimeout(liftTimer);
      pmTarget = 0;
      wake();
    }
    const onEnter = () => measureOrigin();
    const onMove = (e: PointerEvent) => {
      if (mode !== 'live' || !onScreen || scrolling) return;
      if (e.pointerType === 'touch') {
        if (!touch) return;
        if (!touch.drag) {
          if (Math.abs(e.clientX - touch.x) < 8) return;
          touch.drag = true;
          window.clearTimeout(liftTimer);
        }
      }
      aim(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => {
      if (mode !== 'live' || !onScreen || scrolling) return;
      measureOrigin();
      if (e.pointerType === 'touch')
        touch = { x: e.clientX, y: e.clientY, drag: false };
      else aim(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || !touch) return;
      // A tap sets the magnet down for a moment; a drag lets go of it.
      if (
        !touch.drag &&
        Math.hypot(e.clientX - touch.x, e.clientY - touch.y) < 10
      ) {
        aim(e.clientX, e.clientY);
        window.clearTimeout(liftTimer);
        liftTimer = window.setTimeout(lift, 1500);
      } else if (touch.drag) {
        liftTimer = window.setTimeout(lift, 450);
      }
      touch = null;
    };
    const onCancel = () => {
      if (touch?.drag) lift();
      touch = null;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') lift();
    };

    // ── Lifecycle ──────────────────────────────────────────────────────────
    function setMode(next: 'live' | 'still') {
      mode = next;
      hero.dataset.state = next;
    }

    function beginStill() {
      stop();
      intro = -1;
      pm = pmTarget = 0;
      for (let i = 0; i < n; i++) {
        TH[i] = TB[i];
        OM[i] = 0;
      }
      setMode('still');
      render(0);
    }

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) wake();
      else stop();
    });
    // Well away from the screen the canvas leaves the page altogether
    // (display: none; its pixels survive). On its own compositor layer it
    // otherwise stays in the layer tree, and Chrome uploaded all of its
    // pixels again on most commits while the next chapter scrolled by:
    // ~5ms a frame at 4× CPU, with nothing drawn.
    const near = new IntersectionObserver(
      ([entry]) => {
        canvas.style.display = entry.isIntersecting ? '' : 'none';
      },
      { rootMargin: '50% 0px 50% 0px' }
    );

    let forceLayout = false;
    const relayout = () => {
      layoutQueued = 0;
      if (disposed || !ctx) return;
      const lr = layer.getBoundingClientRect();
      const hr = hero.getBoundingClientRect();
      const same =
        lr.width === W &&
        lr.height === H &&
        hr.width === heroW &&
        hr.height === heroH;
      if (same && !forceLayout) return;
      forceLayout = false;
      // A new layout is drawn settled: the sprinkle plays once, on load.
      intro = -1;
      tapped = true;
      readInk();
      layout(true);
      if (mode === 'live' && pm > 0) wake();
      render(0);
    };
    const queueLayout = () => {
      if (!layoutQueued) layoutQueued = requestAnimationFrame(relayout);
    };
    // A late web font can rewrap the text without changing any box's size.
    const onFonts = () => {
      forceLayout = true;
      queueLayout();
    };
    const ro = new ResizeObserver(queueLayout);

    const onTheme = () => {
      // Repaint at once, even mid-loop, so the theme switch's view
      // transition snapshots filings that already match the new light.
      readInk();
      render(0);
    };
    const onVisibility = () => (document.hidden ? stop() : wake());
    const onMotionPref = () => {
      if (!ctx) return;
      if (reduceMq.matches) beginStill();
      else {
        setMode('live');
        wake();
      }
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
      hero.dataset.state = 'fallback';
    };
    const onRestored = () => {
      if (disposed) return;
      hero.dataset.state = mode;
      render(0);
      wake();
    };

    let idleId = 0;
    let timeoutId = 0;
    const start = () => {
      if (disposed) return;
      ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return; // the server's field lines stay
      layer.appendChild(canvas);
      readInk();
      const still = reduceMq.matches;
      layout(still);
      if (still) beginStill();
      else {
        intro = 0;
        tapped = false;
        setMode('live');
      }
      io.observe(layer);
      near.observe(layer);
      ro.observe(layer);
      ro.observe(hero);
      document.fonts?.addEventListener?.('loadingdone', onFonts);
      canvas.addEventListener('contextlost', onLost);
      canvas.addEventListener('contextrestored', onRestored);
      window.addEventListener('themechange', onTheme);
      listenScroll();
      if (hasScrollEnd) window.addEventListener('scrollend', ended);
      document.addEventListener('visibilitychange', onVisibility);
      reduceMq.addEventListener('change', onMotionPref);
      hero.addEventListener('pointerenter', onEnter, { passive: true });
      hero.addEventListener('pointermove', onMove, { passive: true });
      hero.addEventListener('pointerdown', onDown, { passive: true });
      hero.addEventListener('pointerup', onUp, { passive: true });
      hero.addEventListener('pointercancel', onCancel, { passive: true });
      hero.addEventListener('pointerleave', onLeave, { passive: true });
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(start, { timeout: 1500 });
      } else {
        timeoutId = window.setTimeout(start, 200);
      }
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener('load', schedule);
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
      window.clearTimeout(liftTimer);
      window.clearTimeout(tapTimer);
      if (layoutQueued) cancelAnimationFrame(layoutQueued);
      stop();
      io.disconnect();
      near.disconnect();
      ro.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', onFonts);
      canvas.removeEventListener('contextlost', onLost);
      canvas.removeEventListener('contextrestored', onRestored);
      window.removeEventListener('themechange', onTheme);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', ended);
      window.clearTimeout(quiet);
      window.clearTimeout(grace);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMq.removeEventListener('change', onMotionPref);
      hero.removeEventListener('pointerenter', onEnter);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerdown', onDown);
      hero.removeEventListener('pointerup', onUp);
      hero.removeEventListener('pointercancel', onCancel);
      hero.removeEventListener('pointerleave', onLeave);
      hero.removeAttribute('data-a-tap');
      delete hero.dataset.state;
      canvas.remove();
    };
  }, []);

  return <div ref={ref} className="re-a-field" aria-hidden="true" />;
}
