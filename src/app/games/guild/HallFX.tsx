'use client';

import { useEffect } from 'react';

/**
 * The hall's one effects island. Three small jobs, no rendering:
 *
 *  1. Liveness. Every loop in the room (torch flicker, the marquee chase, the
 *     dust in the light) is CSS gated on `[data-live]`. One
 *     IntersectionObserver sets it on the room (`.gh`, the contract other
 *     agents gate on) and on each zone of it (`[data-gh-zone]`) while that
 *     part is on screen, so a torch at the far end of the hall costs nothing.
 *     Reduced motion never sets it.
 *
 *  1b. The scroll hold. While the page scrolls, Chrome runs a main frame per
 *     scrolling frame, and every running CSS loop then costs a style pass,
 *     even one the compositor draws. So while the hall is on screen, the
 *     first scroll event of a gesture sets `data-hold` on `.gh-world` and
 *     `.gh` (every loop in the room, the machines' too, pauses on it), and
 *     scrollend lets them go. One passive listener, `once`, re-armed at
 *     scrollend, so nothing runs per scrolling frame; where scrollend is
 *     missing, a 160 ms quiet spell ends the hold. Scroll timelines (the
 *     stair, the tint) are not loops and are never held.
 *
 *  2. The browser chrome. While the hall fills the middle of the screen, the
 *     phone's toolbar takes the cellar's colour (theme-color #1a120b), and it
 *     goes back to the site's own colour on the way out. If the reader flips
 *     the theme while downstairs, ThemeToggle writes its colour and fires
 *     `themechange`; the cellar's colour is put straight back.
 */
const CELLAR = '#1a120b';
const CHROME = { light: '#f4efe4', dark: '#090b16' } as const;

export default function HallFX() {
  useEffect(() => {
    const world = document.querySelector<HTMLElement>('.gh-world');
    if (!world) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ── 1. liveness ──
    const targets = [
      ...world.querySelectorAll<HTMLElement>('.gh, [data-gh-zone]'),
    ];
    const seen = new Map<Element, boolean>();
    const paint = () => {
      for (const [el, on] of seen) el.toggleAttribute('data-live', on && !reduce.matches);
    };
    const live = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e.isIntersecting);
        paint();
      },
      { rootMargin: '96px 0px' },
    );
    targets.forEach((t) => live.observe(t));
    reduce.addEventListener('change', paint);

    // ── 1b. the scroll hold ──
    const room = world.querySelector<HTMLElement>('.gh');
    const held = [world, room].filter((el): el is HTMLElement => el !== null);
    const hasScrollEnd = 'onscrollend' in window;
    let holding = false;
    let armed = false;
    let quiet = 0;
    const setHold = (on: boolean) => {
      if (holding === on) return;
      holding = on;
      for (const el of held) el.toggleAttribute('data-hold', on);
    };
    const onScroll = () => {
      setHold(true);
      window.clearTimeout(quiet);
      // where scrollend exists this is only a safety net
      quiet = window.setTimeout(release, hasScrollEnd ? 1500 : 160);
    };
    const listen = () => window.addEventListener('scroll', onScroll, { passive: true, once: hasScrollEnd });
    function release() {
      window.clearTimeout(quiet);
      setHold(false);
      if (hasScrollEnd && armed) {
        window.removeEventListener('scroll', onScroll);
        listen();
      }
    }
    // Armed only while some part of the hall is on screen: elsewhere on the
    // page its loops aren't running, so there is nothing to hold.
    const arm = (on: boolean) => {
      if (on === armed) return;
      armed = on;
      if (on) {
        listen();
        if (hasScrollEnd) window.addEventListener('scrollend', release, { passive: true });
      } else {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('scrollend', release);
        window.clearTimeout(quiet);
        setHold(false);
      }
    };
    const near = new IntersectionObserver(([e]) => arm(e.isIntersecting && !reduce.matches), { rootMargin: '96px 0px' });
    near.observe(world);

    // ── 2. the browser chrome ──
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const inside = new Set<Element>();
    const site = () => CHROME[document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'];
    const apply = () => meta?.setAttribute('content', inside.size ? CELLAR : site());
    const chrome = new IntersectionObserver(
      (entries) => {
        const was = inside.size > 0;
        for (const e of entries) {
          if (e.isIntersecting) inside.add(e.target);
          else inside.delete(e.target);
        }
        if (was !== inside.size > 0) apply();
      },
      // "On screen" means crossing the middle fifth of the window.
      { rootMargin: '-40% 0px -40% 0px' },
    );
    world.querySelectorAll('.gh, .gh-exit').forEach((el) => chrome.observe(el));
    const onTheme = () => {
      if (inside.size) apply();
    };
    window.addEventListener('themechange', onTheme);

    return () => {
      near.disconnect();
      arm(false);
      live.disconnect();
      chrome.disconnect();
      reduce.removeEventListener('change', paint);
      window.removeEventListener('themechange', onTheme);
      targets.forEach((t) => t.removeAttribute('data-live'));
      if (inside.size) {
        inside.clear();
        apply();
      }
    };
  }, []);

  return null;
}
