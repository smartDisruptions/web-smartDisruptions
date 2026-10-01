'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';

// The dialog (and the index it fetches) loads on first open, not with the page.
const PaletteDialog = lazy(() => import('./PaletteDialog'));

/**
 * ⌘K / Ctrl+K, "/" or the header's search button opens the command palette.
 * This shell is a few hundred bytes; everything else arrives on first use.
 */
export default function PaletteTrigger() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Each opening is a fresh dialog (empty query, first result selected).
  const [session, setSession] = useState(0);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    const show = () => {
      if (!openRef.current) setSession((n) => n + 1);
      setMounted(true);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (openRef.current) setOpen(false);
        else show();
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        show();
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('sd:palette', show);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('sd:palette', show);
    };
  }, []);

  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <PaletteDialog key={session} open={open} onClose={() => setOpen(false)} />
    </Suspense>
  );
}
