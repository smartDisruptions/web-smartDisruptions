'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The storm room's one island. On the page it is the ticker tape's
 * pause/play button (WCAG 2.2.2: anything that moves for more than five
 * seconds can be stopped). Behind the button it keeps the room's books, so
 * the section ships one small script instead of four:
 *
 *  1. Liveness. `data-on` sits on each moving part — 嵐, the tape, Kiru —
 *     only while that part is on screen and clear of the site's glass
 *     bars. The tape's crawl, the rain rings and Kiru's idle run on it, so
 *     a loop the reader cannot see costs nothing. (Without JavaScript,
 *     `@media (scripting: none)` runs the CSS loops instead, so nothing
 *     waits on this script to be seen.)
 *  2. Holding still while the page scrolls. Any running CSS loop costs
 *     Chrome a style pass on every scrolling frame, even one the compositor
 *     draws (SiteFX pauses Pip for the same reason). Measured on a phone at
 *     4× CPU, the room's loops took scrolling through it from ~56fps to
 *     ~48. So the first scroll event of a gesture sets `data-hold` — one
 *     passive listener, `once`, no layout read — and `scrollend` lifts it:
 *     the tape, the rain rings and Kiru pause mid-motion and carry on.
 *  3. The kanji. If the room is still below the fold when this mounts, 嵐 is
 *     held un-inked (`data-ink="wait"`) and brushed in (`"go"`) once it is
 *     on screen and the reader has stopped scrolling — the brush is a
 *     repaint every frame, so it waits for a still page. If the reader is
 *     already looking at it, it stays as it is: inked.
 *  4. The bars. Anything marked `data-wms-fill` that is still below the
 *     fold is armed (drawn empty) and fills once — just once — when 40% of
 *     it is in view. Already on screen, it is left full.
 *
 * Every armed state lives inside `prefers-reduced-motion: no-preference` in
 * storm.css, and none of it is set under reduced motion, so a reader who
 * asked for less motion — or whose script never ran — sees every figure
 * finished.
 */
export default function TapeToggle() {
  const ref = useRef<HTMLButtonElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const room = ref.current?.closest<HTMLElement>('.wms');
    if (!room) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // One layout read, on mount: is the room still below the fold?
    const below = room.getBoundingClientRect().top > window.innerHeight;

    if (below && !still) room.dataset.ink = 'wait';
    let holding = false;
    const kanji = room.querySelector<HTMLElement>('.wms-kanji');
    const inkWhenStill = () => {
      if (
        !holding &&
        room.dataset.ink === 'wait' &&
        kanji?.hasAttribute('data-on')
      ) {
        room.dataset.ink = 'go';
      }
    };

    // "On screen" means clear of the site's frosted bars: anything that
    // moves under a backdrop-filter makes the browser re-blur it every
    // frame. Measured on desktop at 4× CPU with Kiru's feet under the
    // header: 39fps idle, 57 with the glass off. So a part seen only through
    // the glass counts as off screen. The header's height is a token; the
    // phone tab bar is 64px and a rule, and only below 64rem.
    const top =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          '--sd-header-h'
        )
      ) || 65;
    const bottom = window.matchMedia('(min-width: 64rem)').matches ? 0 : 68;
    // Kiru must be wholly clear of the glass (his umbrella under it while his
    // feet are not still counts); the tape is wider than the screen on
    // purpose, so any of it showing is enough.
    const live = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const whole = e.target.classList.contains('wms-kiru');
          const on = whole ? e.intersectionRatio > 0.98 : e.isIntersecting;
          e.target.toggleAttribute('data-on', on);
        }
        inkWhenStill();
      },
      { rootMargin: `-${top}px 0px -${bottom}px 0px`, threshold: [0, 0.99] }
    );
    const parts = [
      ...room.querySelectorAll<HTMLElement>('.wms-kanji, .wms-tape, .wms-kiru'),
    ];
    for (const el of parts) live.observe(el);

    const fills =
      below && !still
        ? [...room.querySelectorAll<HTMLElement>('[data-wms-fill]')]
        : [];
    const once = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute('data-seen', '');
          once.unobserve(e.target);
        }
      },
      { threshold: 0.4 }
    );
    for (const el of fills) {
      el.setAttribute('data-armed', '');
      once.observe(el);
    }

    // The scroll hold. Where `scrollend` exists the listener fires once per
    // gesture and is re-armed at the end; elsewhere a quiet spell ends it.
    const hasEnd = 'onscrollend' in window;
    let quiet = 0;
    const listen = () =>
      window.addEventListener('scroll', onScroll, {
        passive: true,
        once: hasEnd,
      });
    function onScroll() {
      if (!holding) {
        holding = true;
        room!.setAttribute('data-hold', '');
      }
      window.clearTimeout(quiet);
      quiet = window.setTimeout(release, hasEnd ? 3000 : 160);
    }
    function release() {
      window.clearTimeout(quiet);
      if (holding) {
        holding = false;
        room!.removeAttribute('data-hold');
        inkWhenStill();
      }
      if (hasEnd) listen();
    }
    listen();
    if (hasEnd)
      window.addEventListener('scrollend', release, { passive: true });

    return () => {
      live.disconnect();
      once.disconnect();
      window.clearTimeout(quiet);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', release);
      for (const el of parts) el.removeAttribute('data-on');
      room.removeAttribute('data-hold');
    };
  }, []);

  useEffect(() => {
    ref.current
      ?.closest('.wms')
      ?.querySelector('.wms-tape')
      ?.toggleAttribute('data-paused', paused);
  }, [paused]);

  return (
    <button
      ref={ref}
      type="button"
      className="wms-tape-btn"
      onClick={() => setPaused((p) => !p)}
      aria-label={paused ? 'Play the report ticker' : 'Pause the report ticker'}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        {paused ? (
          <path d="M6 4.2v11.6c0 .6.6.9 1.1.6l9-5.8c.5-.3.5-.9 0-1.2l-9-5.8C6.6 3.3 6 3.6 6 4.2Z" />
        ) : (
          <path d="M5.5 4h3v12h-3zM11.5 4h3v12h-3z" />
        )}
      </svg>
    </button>
  );
}
