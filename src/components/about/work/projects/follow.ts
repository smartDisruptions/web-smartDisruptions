/**
 * Keyboard focus follows the emaki. Loaded only when the projects section
 * nears the screen (WorkProjectsIsland imports this file lazily, so it is
 * its own small chunk).
 *
 * On the moving scroll, three of the four scenes are always off to one side
 * (translated, not scrolled: the page cannot scroll sideways), so a Tab
 * onto one of their links would put the focus ring off the screen. When
 * focus lands in a scene that is not the one on show, this scrolls the page
 * to that scene's marker (the same zero-size element its seal links to),
 * and the scroll timeline does the rest: the paper rolls to the scene.
 *
 * It runs once per focus change, never per frame, and writes no styles. On
 * the still scroll (reduced motion, no scroll timelines, a short screen)
 * every scene is already in the page's flow, so it does nothing.
 */
export function follow(
  section: HTMLElement,
  first?: Element | null
): () => void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const show = (target: Element | null) => {
    const scene = target?.closest<HTMLElement>('.wk-pj-scene');
    if (!scene) return;
    const css = getComputedStyle(scene);
    // The still scroll: the browser's own focus scrolling is all it needs.
    if (css.position !== 'sticky') return;
    // Each scene's marker sits right before it in the runway.
    const marker = scene.previousElementSibling;
    const run = scene.parentElement;
    if (
      !(marker instanceof HTMLElement) ||
      !marker.classList.contains('wk-pj-at') ||
      !run
    )
      return;

    // Already the scene on show — pinned, and resting square in the window —
    // then leave the page where it is. (During the opening, the scroll is
    // still being unrolled over the first scene: that counts as not shown.)
    const r = scene.getBoundingClientRect();
    const w = run.getBoundingClientRect();
    const pinned = Math.abs(r.top - (parseFloat(css.top) || 0)) < 2;
    if (pinned && Math.abs(r.left - w.left) < 2) return;

    marker.scrollIntoView({
      block: 'start',
      behavior: reduce.matches ? 'instant' : 'smooth',
    });
  };

  const onFocus = (e: FocusEvent) => show(e.target as Element | null);

  // The focus that loaded this module, if it was a focus: answer it too.
  if (first && section.contains(first)) show(first);
  section.addEventListener('focusin', onFocus);
  return () => section.removeEventListener('focusin', onFocus);
}
