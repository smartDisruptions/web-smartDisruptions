'use client';

import { useLayoutEffect } from 'react';

/** ScrollPad's client half: data-au-pad on <html> while the page is mounted. */
export default function ScrollPadFX() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-au-pad', '');
    return () => root.removeAttribute('data-au-pad');
  }, []);
  return null;
}
