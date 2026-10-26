/**
 * The ring's behaviour, loaded only when the ring comes near the screen
 * (ArmoryWallIsland imports this file lazily, so it is its own small chunk).
 *
 * It never re-renders anything. The ring is server-rendered markup; this
 * writes one property on one element per frame while the ring is moving —
 * the ring's own transform, rotateY(turn) — and nothing at all when it is
 * still or off screen.
 *
 * WHAT A FRAME COSTS. The ring used to turn by an inherited custom property
 * that each plaque also shaded itself from with CSS trig: every frame of a
 * turn restyled ~285 elements and repainted the plaques it darkened (~390
 * raster tasks for one drag). Writing the transform itself restyles the
 * ring and next to nothing else (1–4 elements measured; a registered,
 * non-inherited custom property still cost 63), and it is a transform on a
 * layer the compositor already holds: no layout, no paint. The light and the shadow belong to the hall, not the plaques
 * (wall.css): they stay where the lantern is and the plaques turn through
 * them, which is how light behaves, and costs nothing per frame.
 *
 * ONE LAYER PER PLAQUE. Each plaque's back (its seal) is drawn inside the
 * plaque, mirrored, and shown only while the plaque faces away. Which ones
 * face away is worked out each frame from the same numbers the CSS places
 * them with (see `measure`): exact, so the swap happens while a plaque is
 * edge-on and can't be seen. Only the one or two plaques that crossed get
 * their attribute flipped.
 *
 *  - Drag / swipe: horizontal only. The stage is `touch-action: pan-y`, so a
 *    vertical swipe still scrolls the page; the browser cancels our pointer
 *    when that happens. iOS Safari doesn't always honour pan-y over the 3D
 *    ring, so a touch that starts sideways also has its default cancelled
 *    (the touch listeners below). A drag of one plaque's width turns one plaque.
 *    Pressing on a moving ring catches it.
 *  - Throw: release with speed and it coasts, then settles on a plaque. As a
 *    plaque comes to rest at the front, a gloss crosses it (data-lit).
 *  - Keys: ←/→ (and Home/End) on a plaque move focus to its neighbour and
 *    turn it to the front. Only the front plaque is in the Tab order (roving
 *    tabindex), so the ring is one stop for a keyboard, not twenty.
 *  - Buttons, the caption and the status line: the visible way to turn it,
 *    the front plaque's name in big type as it turns, and a polite live line
 *    that says where it stopped (never while it is only passing through).
 *  - Chips (ArmoryWallIsland): `find(group)` turns to the first plaque of a
 *    kind; while a kind is chosen, the arrows step between its plaques.
 *  - Trackpads: a sideways two-finger swipe turns it; vertical wheel is left
 *    alone, so the page scroll is never taken over.
 *  - A tap that did not move is a click: the plaque's link opens. A tap on a
 *    plaque seen from behind, or turned far round into the dark at the side,
 *    turns it to the front instead.
 *  - Entrance: the server parks the ring three plaques short of the first
 *    (ArmoryWall). The first time it is properly in view it turns that last
 *    short way and settles on the first plaque — once, and anything the
 *    reader does first cancels it.
 */

export type WallDrive = {
  /** Turn to the first plaque of a group ('all': the first plaque) and say so. */
  find: (group: string, lead: string) => void;
  /** Take every listener off and leave the ring where it stands. */
  stop: () => void;
};

const RAD = Math.PI / 180;
/**
 * The arc a tap can open from: within ~45° of the front (cos > 0.7), which
 * takes in the plaques two either side of it at rest (36°), whose labels the
 * hall's light leaves at AA. Further round (54°, a sliver in the dark) a tap
 * turns the plaque to the front first.
 */
const READABLE = 0.7;
const pad = (n: number) => String(n).padStart(2, '0');
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
/** A settle with a whisper of overshoot, for the entrance. */
const easeSettle = (p: number) => {
  const s = 0.9;
  const q = p - 1;
  return 1 + (s + 1) * q * q * q + s * q * q;
};

type Tween = {
  from: number;
  to: number;
  t0: number;
  dur: number;
  ease: (p: number) => number;
};

export function drive(root: HTMLElement): WallDrive {
  const stage = root.querySelector<HTMLElement>('.bt-wall-stage');
  const ring = root.querySelector<HTMLElement>('.bt-ring');
  const panels = ring
    ? Array.from(ring.querySelectorAll<HTMLElement>('.bt-panel'))
    : [];
  const n = panels.length;
  if (!stage || !ring || !n) return { find() {}, stop() {} };

  const links = panels.map((p) =>
    p.querySelector<HTMLAnchorElement>('.bt-panel-face')
  );
  const read = (p: HTMLElement, sel: string) =>
    p.querySelector(sel)?.textContent?.trim() ?? '';
  const names = panels.map((p) => read(p, '.bt-panel-name'));
  const kinds = panels.map((p) => read(p, '.bt-panel-kind'));
  const q = <T extends HTMLElement = HTMLElement>(sel: string) =>
    root.querySelector<T>(sel);
  const status = q('[data-wall-status]');
  const capKind = q('[data-wall-kind]');
  const capName = q('[data-wall-name]');
  const capAt = q('[data-wall-at]');
  const controls = q('.bt-wall-controls');
  const prev = q<HTMLButtonElement>('[data-wall-prev]');
  const next = q<HTMLButtonElement>('[data-wall-next]');
  const step = 360 / n;
  const mod = (i: number) => ((i % n) + n) % n;

  // Where the server left it (--park plaques short of the first, see
  // ArmoryWall), or wherever a previous run of this file stopped.
  const park = parseFloat(root.style.getPropertyValue('--park')) || 0;
  let spin = root.dataset.spin ? parseFloat(root.dataset.spin) : park * step;
  let vel = 0; // degrees per second, while coasting
  let target: number | null = null; // where it is settling after a drag
  let tween: Tween | null = null; // a turn to a chosen plaque
  let dest = -1; // the plaque a turn is heading to (button presses stack on it)
  let raf = 0;
  let last = 0;
  let onScreen = false;
  let front = panels.findIndex((p) => p.hasAttribute('data-front'));
  const away = panels.map((p) => p.hasAttribute('data-away'));
  let lit = -1;
  let said = front; // what the status line last said
  let intro: 'parked' | 'playing' | 'done' = root.hasAttribute('data-park')
    ? 'parked'
    : 'done';
  let introIo: IntersectionObserver | null = null;

  // ── Geometry, read once (and on resize) — never inside a frame ────────────
  // A plaque faces away when its normal points away from the eye. With the
  // ring placed as wall.css places it (translateZ(-r) rotateX(tilt)
  // rotateY(spin); each plaque rotateY(i·step) translateZ(r)) and seen from
  // `perspective` P at the stage's perspective-origin, the ring's centre yO
  // below the eye, the dot product of the two works out to
  //   cos(a) · (yO·sin(tilt) + (P + r)·cos(tilt)) − r,
  // so a plaque at angle a faces away exactly when cos(a) < `edge`.
  let dpp = 0.1; // degrees of turn per pixel of drag
  let edge = 0.35;
  const measure = () => {
    const cs = getComputedStyle(root);
    const ss = getComputedStyle(stage);
    const pw = panels[0].offsetWidth || 200;
    const gap = parseFloat(cs.getPropertyValue('--gap')) || 20;
    const tilt = (parseFloat(cs.getPropertyValue('--tilt')) || 0) * RAD;
    const r = pw / 2 / Math.sin(Math.PI / n) + gap;
    const P = parseFloat(ss.perspective) || 1500;
    const eye = parseFloat(ss.perspectiveOrigin.split(' ')[1]) || 0;
    const yO = ring.offsetTop + ring.offsetHeight / 2 - eye;
    dpp = step / (pw + gap);
    edge = r / (yO * Math.sin(tilt) + (P + r) * Math.cos(tilt));
  };

  const frontOf = (s: number) => mod(Math.round(-s / step));
  const nearest = (s: number) => Math.round(s / step) * step;

  const caption = (i: number) => {
    // New text nodes, not edits: the caption's boxes are fixed (wall.css),
    // so a longer name never moves anything around it.
    if (capName) {
      capName.textContent = names[i];
      capName.toggleAttribute('data-long', names[i].length > 22);
    }
    if (capKind) capKind.textContent = kinds[i];
    if (capAt) capAt.textContent = pad(i + 1);
  };

  // The ring's one tab stop (roving tabindex). It follows the front plaque
  // as the ring turns, except while a keyboard is in the ring: then it is
  // the focused plaque, which that turn is bringing round, so a quick second
  // Tab can't land on a plaque passing the front on the way. While the ring
  // stands parked for its entrance it is the first plaque, the one the
  // entrance settles on: a keyboard enters the ring at 01 (and its focus
  // turns the ring there, as the entrance would), not at whichever plaque
  // happened to be parked in front.
  let tabStop = -1;
  const setTabStop = (at: number) => {
    if (at === tabStop) return;
    if (tabStop < 0) {
      links.forEach((l, i) => {
        if (l) l.tabIndex = i === at ? 0 : -1;
      });
    } else {
      const old = links[tabStop];
      if (old) old.tabIndex = -1;
      const cur = links[at];
      if (cur) cur.tabIndex = 0;
    }
    tabStop = at;
  };
  const keyboardIn = () => {
    const el = document.activeElement;
    return !!el && ring.contains(el) && el.matches(':focus-visible');
  };

  const paint = () => {
    ring.style.transform = `rotateY(${spin.toFixed(2)}deg)`;
    for (let i = 0; i < n; i++) {
      const a = Math.cos((spin + i * step) * RAD) < edge;
      if (a !== away[i]) {
        away[i] = a;
        panels[i].toggleAttribute('data-away', a);
      }
    }
    const f = frontOf(spin);
    if (f !== front) {
      if (front >= 0) panels[front].removeAttribute('data-front');
      panels[f].setAttribute('data-front', '');
      front = f;
      if (intro === 'done' && !keyboardIn()) setTabStop(f);
      caption(f);
    }
  };
  let paintRaf = 0;
  const schedulePaint = () => {
    if (!paintRaf)
      paintRaf = requestAnimationFrame(() => {
        paintRaf = 0;
        paint();
      });
  };

  /** Write the status line: where the ring is going, said once. */
  const announce = (i: number, lead = '') => {
    if (!status) return;
    const j = mod(i);
    said = j;
    status.textContent = `${lead}${names[j]}, ${kinds[j].toLowerCase()}. ${j + 1} of ${n}.`;
  };

  // While the ring turns, the lantern holds still (wall.css), the way Kiru
  // holds still while the page scrolls: its sway would otherwise be ticked
  // on the main thread every frame the ring is producing.
  let turning = false;
  const setTurning = (on: boolean) => {
    if (on === turning) return;
    turning = on;
    root.toggleAttribute('data-turning', on);
  };

  // The gloss that crosses a plaque as it comes to rest at the front.
  const unlight = () => {
    if (lit >= 0) panels[lit].removeAttribute('data-lit');
    lit = -1;
  };
  const light = (i: number) => {
    unlight();
    panels[i].setAttribute('data-lit', '');
    lit = i;
  };

  const endIntro = () => {
    if (intro === 'done') return;
    intro = 'done';
    root.removeAttribute('data-park');
    introIo?.disconnect();
    introIo = null;
    // From here the tab stop follows the front (unless a keyboard brought
    // this about by focusing a plaque, which then keeps it).
    if (!keyboardIn()) setTabStop(front);
  };

  // After a turn that keyboard focus started, the focused plaque stands at
  // the front: lower and larger than where the browser scrolled to find it
  // (coming in from the Tab order it was a sliver at the side), over the
  // caption and the arrows. If those end below the window (or under a
  // phone's tab bar), bring them up. Only then, and only once the turn is
  // over: the page scrolls smoothly, so a scroll that wasn't needed would
  // cut the browser's own scroll to the focused plaque short. Measured in
  // the frame after the turn ends, never in the frame that wrote it.
  let reveal = false;
  const revealFront = () => {
    const below = controls ?? stage;
    const pad =
      parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingBottom
      ) || 0;
    if (below.getBoundingClientRect().bottom > innerHeight - pad)
      below.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const rest = () => {
    // Keep the number small; a whole turn changes nothing on screen.
    spin = ((spin % 360) + 360) % 360;
    if (spin > 180) spin -= 360;
    paint();
    dest = -1;
    setTurning(false);
    light(front);
    if (intro === 'playing') endIntro();
    if (reveal) {
      reveal = false;
      requestAnimationFrame(revealFront);
    }
    // After a drag, a throw or a swipe, say where it stopped. (Turns that
    // focus led have already been heard: the reader read the plaque.)
    if (front !== said) announce(front);
  };

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    let done = false;
    if (tween) {
      const p = Math.min(1, (now - tween.t0) / tween.dur);
      spin = tween.from + (tween.to - tween.from) * tween.ease(p);
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
    if (done) {
      raf = 0;
      rest();
      return;
    }
    if (!onScreen || document.hidden) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  const run = () => {
    unlight();
    setTurning(true);
    if (!raf && onScreen && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };
  const halt = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    tween = null;
    target = null;
    vel = 0;
    dest = -1;
  };
  const moving = () =>
    raf !== 0 || tween !== null || target !== null || Math.abs(vel) > 12;

  /** Turn so plaque i is at the front, the short way round. */
  const goTo = (i: number, say = false) => {
    const j = mod(i);
    const base = -j * step;
    const to = base + 360 * Math.round((spin - base) / 360);
    endIntro();
    halt();
    dest = j;
    tween = {
      from: spin,
      to,
      t0: performance.now(),
      dur: Math.min(1100, 340 + Math.abs(to - spin) * 4.2),
      ease: easeOut,
    };
    run();
    // Announce where it is going now, not after the turn.
    if (say) announce(j);
  };

  // While a chip has picked a kind, the others carry data-out (the island
  // sets it) and the arrows step between the plaques that are left.
  const inSet = (i: number) => !panels[i].hasAttribute('data-out');
  const stepFrom = (i: number, d: 1 | -1) => {
    for (let k = 1; k <= n; k++) {
      const j = mod(i + d * k);
      if (inSet(j)) return j;
    }
    return mod(i + d);
  };
  const firstIn = () =>
    Math.max(
      0,
      panels.findIndex((_, i) => inSet(i))
    );
  const lastIn = () => {
    for (let i = n - 1; i >= 0; i--) if (inSet(i)) return i;
    return n - 1;
  };
  const at = () => (dest >= 0 ? dest : front);

  const find = (group: string, lead: string) => {
    const first =
      group === 'all' ? 0 : panels.findIndex((p) => p.dataset.group === group);
    if (first < 0) return;
    goTo(first);
    announce(first, lead);
  };

  // ── Pointer ───────────────────────────────────────────────────────────────
  let pid: number | null = null;
  let startX = 0;
  let lastX = 0;
  let lastT = 0;
  let dragging = false;
  let caught = false; // this press stopped a moving ring
  let suppressClick = false;
  let clearSuppress = 0;
  const swallowClick = () => {
    // The click that follows is not a press. Cleared again shortly, so a
    // keyboard Enter later on is never swallowed.
    suppressClick = true;
    window.clearTimeout(clearSuppress);
    clearSuppress = window.setTimeout(() => (suppressClick = false), 80);
  };
  const indexOfLink = (el: EventTarget | null) =>
    el ? links.findIndex((l) => l !== null && l === el) : -1;

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || pid !== null) return;
    pid = e.pointerId;
    startX = lastX = e.clientX;
    lastT = e.timeStamp;
    dragging = false;
    suppressClick = false;
    endIntro();
    // A press on a moving ring catches it, the way a hand would.
    caught = moving();
    if (caught) halt();
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
      halt();
      unlight();
      setTurning(true);
    }
    const dx = e.clientX - lastX;
    const dt = Math.max(0.001, (e.timeStamp - lastT) / 1000);
    spin += dx * dpp;
    vel = 0.75 * ((dx * dpp) / dt) + 0.25 * vel;
    lastX = e.clientX;
    lastT = e.timeStamp;
    schedulePaint();
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerId !== pid) return;
    pid = null;
    if (dragging) {
      dragging = false;
      swallowClick();
      root.classList.remove('is-dragging');
      // A pause before letting go means no throw.
      if (e.timeStamp - lastT > 90) vel = 0;
      vel = Math.max(-900, Math.min(900, vel));
      run();
      return;
    }
    if (caught) {
      // The press stopped the ring; it was not meant to open anything.
      swallowClick();
      run();
      return;
    }
    // A tap on a plaque seen from behind turns it round rather than opening
    // something the reader can't see yet, and so does a tap on one turned
    // far round to the side (past READABLE): a sliver at the edge of the
    // light whose label the hall's shade has taken below AA. It comes to the
    // front, lit, its name in the caption, and the next tap opens it.
    // (Pointers only: a keyboard or a screen reader activating the link
    // always opens it, and only the front plaque is in the Tab order.)
    const face = (e.target as Element | null)?.closest?.('.bt-panel-face');
    const i = indexOfLink(face ?? null);
    if (i >= 0 && (away[i] || Math.cos((spin + i * step) * RAD) < READABLE)) {
      swallowClick();
      goTo(i, true);
    }
  };
  const onCancel = (e: PointerEvent) => {
    if (e.pointerId !== pid) return;
    pid = null;
    if (dragging) {
      dragging = false;
      root.classList.remove('is-dragging');
    }
    run();
  };
  // Only the stage losing the pointer ends a drag. On a touchscreen the
  // pointer starts out captured by the plaque under the finger (implicit
  // capture), so taking it for the stage fires lostpointercapture on that
  // plaque, and it bubbles up here: read as a cancel, every swipe ended a
  // few pixels in and the ring settled back (fixed 2026-10-26). A mouse has
  // no implicit capture, which is why dragging always worked on a desktop.
  const onLost = (e: PointerEvent) => {
    if (e.target === stage) onCancel(e);
  };
  const onClickCapture = (e: MouseEvent) => {
    if (suppressClick) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    }
  };
  const onDragStart = (e: DragEvent) => e.preventDefault();

  // ── Touch: claim a sideways swipe ─────────────────────────────────────────
  // touch-action: pan-y should leave a sideways swipe to the pointer code
  // above, but Safari on iOS does not reliably honour it over the ring's 3D
  // layers: it starts a pan of its own and cancels the pointer before the
  // ring can turn (Josh, 2026-10-26: "I can't touch scroll it"). So each
  // touch on the stage is also decided here, on its first few pixels:
  // sideways, and its default (a pan) is cancelled for the rest of the touch,
  // so the pointer stays ours; up or down, it is left alone and the page
  // scrolls. Two fingers are always left alone (a pinch). Non-passive only
  // on the stage, so the rest of the page scrolls without waiting on it.
  let touchX = 0;
  let touchY = 0;
  let axis: 'x' | 'y' | null = null;
  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      axis = 'y';
      return;
    }
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
    axis = null;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (axis === null) {
      const t = e.touches[0];
      const dx = Math.abs(t.clientX - touchX);
      const dy = Math.abs(t.clientY - touchY);
      if (dx < 4 && dy < 4) return;
      axis = dx > dy ? 'x' : 'y';
    }
    if (axis === 'x' && e.cancelable) e.preventDefault();
  };

  // ── Trackpad: sideways swipes only ────────────────────────────────────────
  let wheelIdle = 0;
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) {
      return;
    }
    e.preventDefault();
    endIntro();
    halt();
    unlight();
    setTurning(true);
    spin -= (e.deltaMode === 1 ? e.deltaX * 16 : e.deltaX) * dpp;
    schedulePaint();
    window.clearTimeout(wheelIdle);
    wheelIdle = window.setTimeout(run, 120);
  };

  // ── Keys and focus ────────────────────────────────────────────────────────
  const onKey = (e: KeyboardEvent) => {
    const i = indexOfLink(e.target);
    if (i < 0) return;
    let to = -1;
    if (e.key === 'ArrowRight') to = stepFrom(i, 1);
    else if (e.key === 'ArrowLeft') to = stepFrom(i, -1);
    else if (e.key === 'Home') to = firstIn();
    else if (e.key === 'End') to = lastIn();
    if (to < 0) return;
    e.preventDefault();
    links[to]?.focus({ preventScroll: true });
  };
  const onFocusIn = (e: FocusEvent) => {
    // Keyboard (or screen reader) focus turns the plaque to the front. A
    // pointer's focus doesn't: the press itself decides what happens.
    const i = indexOfLink(e.target);
    if (i >= 0 && pid === null && !dragging) {
      goTo(i);
      setTabStop(i);
      said = i; // a screen reader says the focused plaque's name itself
      reveal = true;
    }
  };

  const onPrev = () => goTo(stepFrom(at(), -1), true);
  const onNext = () => goTo(stepFrom(at(), 1), true);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        onScreen = entry.isIntersecting;
        // The lantern sways only while the hall is on screen (wall.css).
        root.toggleAttribute('data-awake', onScreen);
        if (!onScreen) {
          if (raf) cancelAnimationFrame(raf);
          raf = 0;
        } else if (tween || target !== null || Math.abs(vel) > 12) run();
      }
    },
    { rootMargin: '60px' }
  );
  io.observe(stage);

  // The entrance waits until the caption under the ring is clear of the
  // bottom of the screen (and of a phone's tab bar), so the front plaque is
  // in full view when it plays.
  if (intro === 'parked') {
    introIo = new IntersectionObserver(
      (entries) => {
        if (intro !== 'parked' || !entries.some((e) => e.isIntersecting)) {
          return;
        }
        introIo?.disconnect();
        introIo = null;
        intro = 'playing';
        said = 0;
        dest = 0;
        tween = {
          from: spin,
          to: 360 * Math.round(spin / 360), // the first plaque
          t0: performance.now(),
          dur: 1700,
          ease: easeSettle,
        };
        run();
      },
      { rootMargin: '0px 0px -15% 0px' }
    );
    introIo.observe(controls ?? stage);
  }

  const onVisibility = () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (tween || target !== null || Math.abs(vel) > 12) run();
  };
  let resizeRaf = 0;
  const onResize = () => {
    if (!resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        measure();
        paint();
      });
  };

  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onCancel);
  stage.addEventListener('lostpointercapture', onLost);
  stage.addEventListener('wheel', onWheel, { passive: false });
  stage.addEventListener('dragstart', onDragStart);
  stage.addEventListener('touchstart', onTouchStart, { passive: true });
  stage.addEventListener('touchmove', onTouchMove, { passive: false });
  ring.addEventListener('click', onClickCapture, true);
  ring.addEventListener('keydown', onKey);
  ring.addEventListener('focusin', onFocusIn);
  prev?.addEventListener('click', onPrev);
  next?.addEventListener('click', onNext);
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('resize', onResize, { passive: true });

  measure();
  // Roving tab stop: only one plaque is tabbable (setTabStop).
  setTabStop(intro === 'parked' ? 0 : front);
  paint();
  root.setAttribute('data-ready', '');
  // Focus may have arrived before this did (a Tab into the ring scrolls it
  // into view, which is what loads this file). Turn to it now.
  const already = indexOfLink(document.activeElement);
  if (already >= 0 && already !== front) {
    goTo(already);
    said = already;
  }

  return {
    find,
    stop() {
      if (raf) cancelAnimationFrame(raf);
      if (paintRaf) cancelAnimationFrame(paintRaf);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      raf = paintRaf = resizeRaf = 0;
      io.disconnect();
      introIo?.disconnect();
      window.clearTimeout(wheelIdle);
      window.clearTimeout(clearSuppress);
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerup', onUp);
      stage.removeEventListener('pointercancel', onCancel);
      stage.removeEventListener('lostpointercapture', onLost);
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('dragstart', onDragStart);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      ring.removeEventListener('click', onClickCapture, true);
      ring.removeEventListener('keydown', onKey);
      ring.removeEventListener('focusin', onFocusIn);
      prev?.removeEventListener('click', onPrev);
      next?.removeEventListener('click', onNext);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      for (const l of links) l?.removeAttribute('tabindex');
      unlight();
      root.removeAttribute('data-ready');
      root.removeAttribute('data-awake');
      root.removeAttribute('data-turning');
      root.classList.remove('is-dragging');
      // Hand the ring back to the CSS (under reduced motion it lies flat),
      // remembering where it stood so a later run carries on from there.
      root.dataset.spin = String(spin);
      ring.style.removeProperty('transform');
    },
  };
}
