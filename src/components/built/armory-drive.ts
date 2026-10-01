/**
 * The ring's behaviour, loaded only when the ring comes near the screen
 * (ArmoryWallIsland imports this file lazily, so it is its own small chunk).
 *
 * It never re-renders anything. The ring is server-rendered markup; this
 * writes one custom property (--spin) on one element per frame while the
 * ring is moving, and nothing at all when it is still or off screen.
 *
 *  - Drag / swipe: horizontal only. The stage is `touch-action: pan-y`, so a
 *    vertical swipe still scrolls the page; the browser cancels our pointer
 *    when that happens. A drag of one plaque's width turns one plaque.
 *  - Throw: release with speed and it coasts, then settles on a plaque.
 *  - Keys: ←/→ (and Home/End) on a plaque move focus to its neighbour and
 *    turn it to the front. Only the front plaque is in the Tab order (roving
 *    tabindex), so the ring is one stop for a keyboard, not thirteen.
 *  - Buttons and the status line: the visible way to turn it, announced.
 *  - Trackpads: a sideways two-finger swipe turns it; vertical wheel is left
 *    alone, so the page scroll is never taken over.
 *  - A tap that did not move is a click: the plaque's link opens.
 */
export function drive(root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('.bt-wall-stage');
  const ring = root.querySelector<HTMLElement>('.bt-ring');
  if (!stage || !ring) return () => {};
  const panels = Array.from(ring.querySelectorAll<HTMLElement>('.bt-panel'));
  const links = panels.map((p) => p.querySelector<HTMLAnchorElement>('.bt-panel-face'));
  const names = panels.map(
    (p) => p.querySelector('.bt-panel-name')?.textContent?.trim() ?? '',
  );
  const status = root.querySelector<HTMLElement>('[data-wall-status]');
  const prev = root.querySelector<HTMLButtonElement>('[data-wall-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-wall-next]');
  const n = panels.length;
  if (!n) return () => {};
  const step = 360 / n;

  let spin = 0; // degrees; any value, rotateY does not care about turns
  let vel = 0; // degrees per second, while coasting
  let target: number | null = null; // where it is settling
  let tween: { from: number; to: number; t0: number; dur: number } | null = null;
  let raf = 0;
  let last = 0;
  let front = -1;
  let onScreen = true;

  const degPerPx = () => {
    const w = panels[0].offsetWidth || 200;
    const gap = parseFloat(getComputedStyle(root).getPropertyValue('--gap')) || 20;
    return step / (w + gap);
  };
  let dpp = degPerPx();

  const nearest = (s: number) => Math.round(s / step) * step;
  const frontOf = (s: number) => (((Math.round(-s / step) % n) + n) % n);

  const paint = () => {
    ring.style.setProperty('--spin', `${spin.toFixed(3)}deg`);
    const f = frontOf(spin);
    if (f !== front) {
      if (front >= 0) {
        panels[front].removeAttribute('data-front');
        const old = links[front];
        if (old) old.tabIndex = -1;
      }
      panels[f].setAttribute('data-front', '');
      const cur = links[f];
      if (cur) cur.tabIndex = 0;
      front = f;
    }
  };

  const mod = (i: number) => ((i % n) + n) % n;
  let said = -1;
  /** Write the status line. `quiet` keeps a screen reader from hearing it
   *  twice when focus has already moved to the plaque and said its name. */
  const announce = (i: number, quiet = false) => {
    if (!status) return;
    const j = mod(i);
    said = j;
    if (quiet) status.setAttribute('aria-live', 'off');
    status.textContent = `${j + 1} of ${n} · `;
    const b = document.createElement('b');
    b.textContent = names[j];
    status.append(b);
    if (quiet) requestAnimationFrame(() => status.setAttribute('aria-live', 'polite'));
  };

  const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    let done = false;
    if (tween) {
      const p = Math.min(1, (now - tween.t0) / tween.dur);
      spin = tween.from + (tween.to - tween.from) * ease(p);
      if (p >= 1) {
        tween = null;
        done = true;
      }
    } else if (Math.abs(vel) > 12) {
      spin += vel * dt;
      vel *= Math.exp(-dt * 3.4);
    } else {
      vel = 0;
      if (target === null) target = nearest(spin);
      spin = target + (spin - target) * Math.exp(-dt * 11);
      if (Math.abs(spin - target) < 0.04) {
        spin = target;
        target = null;
        done = true;
      }
    }
    paint();
    if (done || !onScreen || document.hidden) {
      raf = 0;
      if (done) {
        // Keep the number small; a whole turn changes nothing on screen.
        spin = ((spin % 360) + 360) % 360;
        if (spin > 180) spin -= 360;
        paint();
        if (front !== said) announce(front, ring.contains(document.activeElement));
      }
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  const run = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };

  /** Turn so plaque i is at the front, the short way round. */
  const goTo = (i: number, say = false) => {
    const base = -mod(i) * step;
    const k = Math.round((spin - base) / 360);
    tween = null;
    vel = 0;
    target = base + 360 * k;
    run();
    // Announce where it is going now, not after the turn.
    if (say) announce(i);
  };
  const goBy = (d: number, say = false) => {
    const base = target ?? nearest(spin);
    const idx = frontOf(base);
    goTo(idx + d, say);
  };

  // ── Pointer ───────────────────────────────────────────────────────────────
  let pid: number | null = null;
  let startX = 0;
  let lastX = 0;
  let lastT = 0;
  let dragging = false;
  let suppressClick = false;

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || pid !== null) return;
    pid = e.pointerId;
    startX = lastX = e.clientX;
    lastT = e.timeStamp;
    dragging = false;
    suppressClick = false;
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerId !== pid) return;
    if (!dragging) {
      if (Math.abs(e.clientX - startX) < 7) return;
      dragging = true;
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already gone */
      }
      root.classList.add('is-dragging');
      tween = null;
      target = null;
      vel = 0;
      stop();
      dpp = degPerPx();
    }
    const dx = e.clientX - lastX;
    const dt = Math.max(0.001, (e.timeStamp - lastT) / 1000);
    spin += dx * dpp;
    vel = 0.75 * ((dx * dpp) / dt) + 0.25 * vel;
    lastX = e.clientX;
    lastT = e.timeStamp;
    paint();
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pid) return;
    pid = null;
    if (!dragging) return;
    dragging = false;
    // The click that follows a drag is not a press. Cleared again shortly, so
    // a keyboard Enter later on is never swallowed.
    suppressClick = true;
    window.setTimeout(() => (suppressClick = false), 80);
    root.classList.remove('is-dragging');
    // A pause before letting go means no throw.
    if (e.timeStamp - lastT > 90) vel = 0;
    vel = Math.max(-900, Math.min(900, vel));
    run();
  };
  const onCancel = (e: PointerEvent) => {
    if (e.pointerId !== pid) return;
    pid = null;
    if (dragging) {
      dragging = false;
      root.classList.remove('is-dragging');
      run();
    }
  };
  const onClickCapture = (e: MouseEvent) => {
    if (suppressClick) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    }
  };
  const onDragStart = (e: DragEvent) => e.preventDefault();

  // ── Trackpad: sideways swipes only ────────────────────────────────────────
  let wheelIdle = 0;
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) return;
    e.preventDefault();
    tween = null;
    target = null;
    vel = 0;
    stop();
    spin -= e.deltaX * dpp;
    paint();
    window.clearTimeout(wheelIdle);
    wheelIdle = window.setTimeout(run, 120);
  };

  // ── Keys and focus ────────────────────────────────────────────────────────
  const indexOfLink = (el: EventTarget | null) =>
    links.findIndex((l) => l !== null && l === el);
  const onKey = (e: KeyboardEvent) => {
    const i = indexOfLink(e.target);
    if (i < 0) return;
    let to: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = i + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = i - 1;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = n - 1;
    if (to === null) return;
    e.preventDefault();
    const j = ((to % n) + n) % n;
    links[j]?.focus({ preventScroll: true });
  };
  const onFocusIn = (e: FocusEvent) => {
    const i = indexOfLink(e.target);
    if (i >= 0 && !dragging) goTo(i);
  };

  const onPrev = () => goBy(-1, true);
  const onNext = () => goBy(1, true);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        onScreen = entry.isIntersecting;
        if (!onScreen) stop();
        else if (target !== null || tween || Math.abs(vel) > 12) run();
      }
    },
    { rootMargin: '60px' },
  );
  io.observe(stage);
  const onVisibility = () => {
    if (document.hidden) stop();
  };
  const onResize = () => {
    dpp = degPerPx();
  };

  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onCancel);
  stage.addEventListener('lostpointercapture', onCancel);
  stage.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener('dragstart', onDragStart);
  ring.addEventListener('click', onClickCapture, true);
  ring.addEventListener('keydown', onKey);
  ring.addEventListener('focusin', onFocusIn);
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize, { passive: true });

  // Roving tab stop: only the front plaque is tabbable.
  for (const l of links) if (l) l.tabIndex = -1;
  paint();
  announce(front, true);
  root.setAttribute('data-ready', '');
  if (prev) prev.disabled = false;
  if (next) next.disabled = false;
  // Focus may have arrived before this did (a Tab into the ring scrolls it
  // into view, which is what loads this file). Turn to it now.
  const already = indexOfLink(document.activeElement);
  if (already > 0) goTo(already);

  // One turn on arrival, so it reads as a ring and not a row. Ends where it
  // started; anything the reader does interrupts it.
  let introDone = false;
  const intro = new IntersectionObserver(
    (entries) => {
      if (introDone || !entries.some((e) => e.isIntersecting)) return;
      introDone = true;
      intro.disconnect();
      // Never spin under someone who is already using it.
      if (pid !== null || dragging || target !== null || ring.contains(document.activeElement)) {
        return;
      }
      tween = { from: spin + 360, to: spin, t0: performance.now(), dur: 2200 };
      run();
    },
    { threshold: 0.45 },
  );
  intro.observe(stage);

  return () => {
    stop();
    io.disconnect();
    intro.disconnect();
    window.clearTimeout(wheelIdle);
    stage.removeEventListener('pointerdown', onDown);
    stage.removeEventListener('pointermove', onMove);
    stage.removeEventListener('pointerup', onUp);
    stage.removeEventListener('pointercancel', onCancel);
    stage.removeEventListener('lostpointercapture', onCancel);
    stage.removeEventListener('wheel', onWheel);
    stage.removeEventListener('dragstart', onDragStart);
    ring.removeEventListener('click', onClickCapture, true);
    ring.removeEventListener('keydown', onKey);
    ring.removeEventListener('focusin', onFocusIn);
    prev?.removeEventListener('click', onPrev);
    next?.removeEventListener('click', onNext);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('resize', onResize);
    for (const l of links) if (l) l.removeAttribute('tabindex');
    for (const p of panels) p.removeAttribute('data-front');
    ring.style.removeProperty('--spin');
    root.removeAttribute('data-ready');
    root.classList.remove('is-dragging');
    if (prev) prev.disabled = true;
    if (next) next.disabled = true;
  };
}
