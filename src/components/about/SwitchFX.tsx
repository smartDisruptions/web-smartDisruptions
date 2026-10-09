'use client';

import { useEffect, useRef } from 'react';

/**
 * The fusuma's slide (AboutSwitch.tsx). Renders nothing; it attaches one
 * click listener to the server-rendered switch around it.
 *
 * A tap on the other side moves the door at once (data-on), so the slide
 * starts on the tap rather than when the next page arrives. It also sets
 * data-au-door on <html>, which gives the switch's parts their
 * view-transition names (switch.css): the old page's door is captured where
 * it has got to, the new page's where it rests, and the browser glides it
 * the rest of the way. The names are on only for a slide that starts here,
 * so a page reached any other way just arrives with its switch in place.
 *
 * Its own page's side does nothing (no reload, no transition).
 */
export default function SwitchFX() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nav = anchor.current?.closest<HTMLElement>('.au-fsm');
    if (!nav) return;
    const root = document.documentElement;
    const release = () => root.removeAttribute('data-au-door');

    // Arriving by the switch: this page has drawn its side of the glide, so
    // the names can go once it has run (taking them away mid-glide would
    // drop the door out of it). No transition running, as under reduced
    // motion: at once.
    let settle = 0;
    let frame = 0;
    let fallback = 0;
    if (root.hasAttribute('data-au-door')) {
      settle = window.setTimeout(release, 3000);
      frame = requestAnimationFrame(() => {
        const glide = document
          .getAnimations()
          .filter((a) =>
            String(
              (a.effect as KeyframeEffect | null)?.pseudoElement ?? ''
            ).startsWith('::view-transition')
          );
        if (!glide.length) release();
        else Promise.allSettled(glide.map((a) => a.finished)).then(release);
      });
    }

    const onClick = (e: MouseEvent) => {
      const tab = (e.target as Element | null)?.closest<HTMLAnchorElement>(
        'a.au-fsm-tab'
      );
      if (!tab) return;
      if (tab.getAttribute('aria-current') === 'page') {
        e.preventDefault();
        return;
      }
      // A new tab or window: leave the door where it is.
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      )
        return;
      nav.dataset.on = tab.dataset.id;
      root.setAttribute('data-au-door', '');
      // If the navigation never lands, don't leave the names on. One timer
      // at a time: a stale one from an earlier tap would pull the names in
      // the middle of a later glide.
      window.clearTimeout(fallback);
      fallback = window.setTimeout(release, 4000);
    };
    nav.addEventListener('click', onClick);
    return () => {
      nav.removeEventListener('click', onClick);
      window.clearTimeout(settle);
      // Landed (this page is leaving): the next page's SwitchFX owns the
      // names now.
      window.clearTimeout(fallback);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <span ref={anchor} hidden />;
}
