/**
 * Move focus to a control that just appeared in the game, but only while the
 * player's focus is in the game. A pause caused by clicking elsewhere on the
 * page must never pull focus back in (Space would resume the game instead of
 * scrolling the page).
 *
 * `fromNowhere`: also take focus when nothing has it. Right for menus the
 * player navigated to, whose button has just been removed (and for the
 * first menu after Start); wrong for panels that open on their own.
 */
export function focusInGame(
  el: HTMLElement | null | undefined,
  fromNowhere = true
) {
  if (!el) return;
  const game = el.closest('.rr-screen');
  const active = document.activeElement;
  const nowhere = !active || active === document.body;
  if ((nowhere && fromNowhere) || (!nowhere && game?.contains(active))) {
    el.focus({ preventScroll: true });
  }
}

/** A key with no modifier held, pressed once (not auto-repeat). */
export function plainKey(e: {
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  repeat: boolean;
}) {
  return !e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat;
}
