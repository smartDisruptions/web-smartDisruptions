'use client';

import { useEffect } from 'react';

/**
 * The theater's one client island. No rendering, four small jobs:
 *
 *  1. Liveness. The marquee's chasing bulbs and the rain are CSS loops gated
 *     on `[data-live]`, which one IntersectionObserver sets on the theater's
 *     front while it is on screen. Reduced motion never sets it.
 *  2. The scroll hold. While the page scrolls, Chrome runs a main frame per
 *     scrolling frame, and every running CSS loop then costs a style pass. So
 *     the first scroll event of a gesture sets `data-hold` on the front, and
 *     scrollend lets it go (HallFX does the same downstairs). The stage's
 *     scroll timeline is not a loop and is never held.
 *  3. The browser chrome. While the theater fills the middle of the screen,
 *     the phone's toolbar takes its colour, and gives it back on the way out.
 *  4. The lineup. Tapping a suspect plays their alibi in the voice the game
 *     recorded, one at a time; the chosen quote shows under the wall. The
 *     voices are fetched on the first tap, never before.
 */
const THEATER = '#170c19';
const CHROME = { light: '#f4efe4', dark: '#090b16' } as const;

export default function EscapeFX() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.er');
    if (!root) return;
    const front = root.querySelector<HTMLElement>('.er-front');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const off: (() => void)[] = [];

    // ── 1. liveness ──
    if (front) {
      let seen = false;
      const paint = () =>
        front.toggleAttribute('data-live', seen && !reduce.matches);
      const io = new IntersectionObserver(
        ([e]) => {
          seen = e.isIntersecting;
          paint();
        },
        { rootMargin: '96px 0px' }
      );
      io.observe(front);
      reduce.addEventListener('change', paint);
      off.push(() => {
        io.disconnect();
        reduce.removeEventListener('change', paint);
        front.removeAttribute('data-live');
      });

      // ── 2. the scroll hold ──
      const hasScrollEnd = 'onscrollend' in window;
      let holding = false;
      let armed = false;
      let quiet = 0;
      const setHold = (on: boolean) => {
        if (holding === on) return;
        holding = on;
        front.toggleAttribute('data-hold', on);
      };
      const release = () => {
        window.clearTimeout(quiet);
        setHold(false);
        if (hasScrollEnd && armed) {
          window.removeEventListener('scroll', onScroll);
          listen();
        }
      };
      const onScroll = () => {
        setHold(true);
        window.clearTimeout(quiet);
        quiet = window.setTimeout(release, hasScrollEnd ? 1500 : 160);
      };
      const listen = () =>
        window.addEventListener('scroll', onScroll, {
          passive: true,
          once: hasScrollEnd,
        });
      const arm = (on: boolean) => {
        if (on === armed) return;
        armed = on;
        if (on) {
          listen();
          if (hasScrollEnd)
            window.addEventListener('scrollend', release, { passive: true });
        } else {
          window.removeEventListener('scroll', onScroll);
          window.removeEventListener('scrollend', release);
          window.clearTimeout(quiet);
          setHold(false);
        }
      };
      const near = new IntersectionObserver(
        ([e]) => arm(e.isIntersecting && !reduce.matches),
        {
          rootMargin: '96px 0px',
        }
      );
      near.observe(front);
      off.push(() => {
        near.disconnect();
        arm(false);
      });
    }

    // ── 3. the browser chrome ──
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    let inside = false;
    const site = () =>
      CHROME[
        document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
      ];
    const apply = () =>
      meta?.setAttribute('content', inside ? THEATER : site());
    const chrome = new IntersectionObserver(
      ([e]) => {
        if (inside === e.isIntersecting) return;
        inside = e.isIntersecting;
        apply();
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    chrome.observe(root);
    const onTheme = () => {
      if (inside) apply();
    };
    window.addEventListener('themechange', onTheme);
    off.push(() => {
      chrome.disconnect();
      window.removeEventListener('themechange', onTheme);
      if (inside) {
        inside = false;
        apply();
      }
    });

    // ── 4. the lineup ──
    for (const lineup of root.querySelectorAll<HTMLElement>(
      '[data-er-lineup]'
    )) {
      lineup.setAttribute('data-js', '');
      const buttons = [
        ...lineup.querySelectorAll<HTMLButtonElement>('.er-who'),
      ];
      const voices = new Map<string, HTMLAudioElement>();
      let playing: { btn: HTMLButtonElement; audio: HTMLAudioElement } | null =
        null;
      const stop = () => {
        if (!playing) return;
        playing.audio.pause();
        playing.btn.removeAttribute('data-talking');
        playing = null;
      };
      const pick = (btn: HTMLButtonElement) => {
        const who = btn.dataset.who ?? '';
        const again =
          btn.getAttribute('aria-pressed') === 'true' && playing?.btn === btn;
        stop();
        if (again) return;
        for (const b of buttons)
          b.setAttribute('aria-pressed', String(b === btn));
        lineup.setAttribute('data-said', who);
        lineup.setAttribute('data-heard', '');
        const src = btn.dataset.voice;
        if (!src) return;
        let audio = voices.get(who);
        if (!audio) {
          audio = new Audio(src);
          audio.preload = 'auto';
          voices.set(who, audio);
        }
        const a = audio;
        a.currentTime = 0;
        playing = { btn, audio: a };
        btn.setAttribute('data-talking', '');
        a.onended = () => {
          if (playing?.audio === a) stop();
        };
        a.play().catch(() => {
          if (playing?.audio === a) stop();
        });
      };
      const handlers = buttons.map((b) => {
        const h = () => pick(b);
        b.addEventListener('click', h);
        return () => b.removeEventListener('click', h);
      });
      const onHide = () => {
        if (document.visibilityState === 'hidden') stop();
      };
      document.addEventListener('visibilitychange', onHide);
      off.push(() => {
        stop();
        handlers.forEach((h) => h());
        document.removeEventListener('visibilitychange', onHide);
        lineup.removeAttribute('data-js');
      });
    }

    return () => off.forEach((f) => f());
  }, []);

  return null;
}
