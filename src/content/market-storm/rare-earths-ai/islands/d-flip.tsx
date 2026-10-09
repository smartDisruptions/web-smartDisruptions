/**
 * FLIP for the companies chapters: elements that change place in the layout
 * glide from where they were to where they are now, on transforms alone (the
 * compositor runs them). The layout itself changes once, on the click.
 *
 *   const before = snap(nodes);   // read, before the state change
 *   …commit…
 *   play(nodes, before);          // read once more, then animate
 *
 * `snap` reads each node's on-screen box, transforms included, so a second
 * click mid-glide starts from where the eye sees it, not from a jump.
 */

export type Snap = Map<Element, DOMRect>;

export function snap(nodes: Iterable<Element>): Snap {
  const m: Snap = new Map();
  for (const n of nodes) m.set(n, n.getBoundingClientRect());
  return m;
}

export function reducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function play(
  nodes: Iterable<Element>,
  before: Snap,
  {
    duration = 520,
    stagger = 14,
    maxDelay = 140,
  }: { duration?: number; stagger?: number; maxDelay?: number } = {}
) {
  const list = [...nodes];
  // Drop any glide still running, so the "after" read is the plain layout.
  for (const n of list) for (const a of n.getAnimations()) a.cancel();
  // All reads, then all writes: one layout, no thrash. A node that was off
  // screen and still is just goes to its place: nobody would see it glide,
  // and every glide costs a composited layer and a paint.
  const vh = window.innerHeight;
  const off = (r: DOMRect) => r.bottom < 0 || r.top > vh;
  const moves: [Element, number, number][] = [];
  for (const n of list) {
    const b = before.get(n);
    if (!b) continue;
    const a = n.getBoundingClientRect();
    if (off(a) && off(b)) continue;
    const dx = b.left - a.left;
    const dy = b.top - a.top;
    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) moves.push([n, dx, dy]);
  }
  moves.forEach(([n, dx, dy], i) => {
    n.animate(
      [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
      {
        duration,
        delay: Math.min(i * stagger, maxDelay),
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        // hold the old place through the stagger delay, or the row would
        // blink to its new place first
        fill: 'backwards',
      }
    );
  });
}
