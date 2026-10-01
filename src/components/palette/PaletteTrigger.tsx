'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

// The dialog (and the index it fetches) loads on first open, not with the page.
const PaletteDialog = lazy(() => import('./PaletteDialog'));

/**
 * ⌘K / Ctrl+K, "/" or the header's search button opens the command palette.
 * This shell is a few hundred bytes; everything else arrives on first use.
 */
export default function PaletteTrigger() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const show = () => {
      setMounted(true);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setMounted(true);
        setOpen((o) => !o);
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
      <PaletteDialog open={open} onClose={() => setOpen(false)} />
    </Suspense>
  );
}
