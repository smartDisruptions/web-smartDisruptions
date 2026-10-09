'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Tips for a server-drawn chart. Every point is a real <button data-b-tip>
 * carrying its own tip (role="tooltip", wired with aria-describedby); this
 * only says which one is open: on hover with a mouse, on keyboard focus, and
 * on a tap (a second tap, a tap elsewhere or Escape closes it). One
 * attribute changes per interaction; nothing runs otherwise.
 */
export default function BTips({ children, className }: { children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = box.current;
    if (!root) return;
    let open: HTMLElement | null = null;
    let pressing = false; // a pointer is mid-press: its focus belongs to the click
    let pressType = '';
    const show = (b: HTMLElement | null) => {
      if (b === open) return;
      open?.removeAttribute('data-open');
      open = b;
      b?.setAttribute('data-open', '');
    };
    const pointOf = (t: EventTarget | null) =>
      t instanceof Element ? t.closest<HTMLElement>('[data-b-tip]') : null;

    const over = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') show(pointOf(e.target));
    };
    const out = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && !pointOf(e.relatedTarget) && document.activeElement !== open) show(null);
    };
    const press = (e: PointerEvent) => {
      pressing = true;
      pressType = e.pointerType;
    };
    // A mouse click keeps the hovered tip; a tap or a key toggles it.
    const click = (e: MouseEvent) => {
      pressing = false;
      const b = pointOf(e.target);
      if (!b) return;
      const mouse = e.detail > 0 && pressType === 'mouse';
      show(mouse || b !== open ? b : null);
    };
    // Focus that came with a press is the click's business, not ours.
    const focusIn = (e: FocusEvent) => {
      if (!pressing) show(pointOf(e.target));
    };
    const focusOut = (e: FocusEvent) => {
      if (!root.contains(e.relatedTarget as Node | null)) show(null);
    };
    const key = (e: KeyboardEvent) => {
      pressing = false;
      if (e.key === 'Escape' && open) show(null);
    };
    const away = (e: PointerEvent) => {
      if (open && !root.contains(e.target as Node)) show(null);
    };

    root.addEventListener('pointerover', over);
    root.addEventListener('pointerout', out);
    root.addEventListener('pointerdown', press);
    root.addEventListener('click', click);
    root.addEventListener('focusin', focusIn);
    root.addEventListener('focusout', focusOut);
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', away, { passive: true });
    return () => {
      root.removeEventListener('pointerover', over);
      root.removeEventListener('pointerout', out);
      root.removeEventListener('pointerdown', press);
      root.removeEventListener('click', click);
      root.removeEventListener('focusin', focusIn);
      root.removeEventListener('focusout', focusOut);
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', away);
    };
  }, []);

  return (
    <div ref={box} className={className}>
      {children}
    </div>
  );
}
