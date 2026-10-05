/**
 * Shared by the back link (a client island) and its server fallback, so the
 * two cannot drift: where "back" goes, what it says, and its arrow.
 */
export function backTarget(from: string | null) {
  if (from === 'arcade') return { href: '/games', label: 'Back to the arcade' };
  if (from === 'archive') return { href: '/games/archive', label: 'Back to the archive' };
  return { href: '/built', label: 'Everything I built' };
}

export function BackArrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}
