'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * The storm room's one island. It draws nothing: it keeps the room's books,
 * so the section ships one small script instead of four.
 *
 *  1. Liveness. `data-on` sits on each moving part — 嵐, Kiru, the lead's
 *     magnetic field — only while that part is on screen and clear of the
 *     site's glass bars. The rain rings, Kiru's idle and the field's pulse
 *     run on it, so a loop the reader cannot see costs nothing. (Without
 *     JavaScript, `@media (scripting: none)` runs the rain rings instead,
 *     so nothing waits on this script to be seen.) The field switches only
 *     while the page is still: its light is a layer, and adding one is a
 *     layout pass.
 *  2. Holding still while the page scrolls. Any running CSS loop costs
 *     Chrome a style pass on every scrolling frame, even one the compositor
 *     draws (SiteFX pauses Pip for the same reason). Measured on a phone at
 *     4× CPU, the room's loops took scrolling through it from ~56fps to
 *     ~48. So the first scroll event of a gesture sets `data-hold` — one
 *     passive listener, `once`, no layout read — and `scrollend` lifts it:
 *     the rain rings and the field pause mid-motion and carry on. (Kiru is
 *     held by SiteFX, like every ninja on the site.)
 *  3. The kanji. If the room is still below the fold when this mounts, 嵐 is
 *     held un-inked (`data-ink="wait"`) and brushed in (`"go"`) once it is
 *     on screen and the reader has stopped scrolling — the brush is a
 *     repaint every frame, so it waits for a still page. If the reader is
 *     already looking at it, it stays as it is: inked.
 *  4. The bars. Anything marked `data-wms-fill` that is still below the
 *     fold is armed (drawn empty) and fills once — just once — when 40% of
 *     it is in view and the page is still. Already on screen, it is left
 *     full.
 *  5. Prefetching, once the page is still. A <Link> prefetches its page the
 *     moment it scrolls into view, and these pages are big (the rare-earths
 *     article's payload is ~330KB): measured on a phone, the room's four
 *     links fetched ~700KB and parsed it on the main thread mid-scroll. So
 *     the links say prefetch={false}, and this fetches a card's page once
 *     the card is on screen at the end of a scroll, or the moment a mouse
 *     points at it or a key focuses it — before the click, never during a
 *     fling.
 *
 * This used to be the ticker tape's pause button, which kept these books
 * behind it. The tape left the room with the archive (October 2026), and
 * nothing that moves here now carries words, so there is nothing to pause:
 * the island stayed, the button went.
 *
 * Every armed state lives inside `prefers-reduced-motion: no-preference` in
 * storm.css, and none of it is set under reduced motion, so a reader who
 * asked for less motion — or whose script never ran — sees every figure
 * finished.
 */
export default function RoomKeeper() {
  const ref = useRef<HTMLSpanElement>(null);
  const router = useRouter();

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
    // Kiru and the field must be wholly clear of the glass (an umbrella or a
    // ring of light under it while the rest is not still counts); 嵐 only
    // has to show.
    //
    // The field's light is a layer that exists only while it is on, so
    // switching it is a layout pass. Mid-scroll that is a dropped frame
    // just as the lead comes into view, so the field's switch waits for
    // the page to be still (its pulse is held while it scrolls anyway).
    const later = new Map<Element, boolean>();
    const live = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const whole = !e.target.classList.contains('wms-kanji');
          const on = whole ? e.intersectionRatio > 0.98 : e.isIntersecting;
          if (holding && e.target.hasAttribute('data-wms-field')) {
            later.set(e.target, on);
          } else {
            later.delete(e.target);
            e.target.toggleAttribute('data-on', on);
          }
        }
        inkWhenStill();
      },
      { rootMargin: `-${top}px 0px -${bottom}px 0px`, threshold: [0, 0.99] }
    );
    const switchLater = () => {
      for (const [el, on] of later) el.toggleAttribute('data-on', on);
      later.clear();
    };
    const parts = [
      ...room.querySelectorAll<HTMLElement>(
        '.wms-kanji, .wms-kiru, [data-wms-field]'
      ),
    ];
    for (const el of parts) live.observe(el);

    // The fill waits for a still page, like the ink: run mid-fling, its
    // frames are restyled on every scrolling frame and the reader misses
    // it anyway. So it starts when 40% of it is in view and nothing is
    // scrolling — now, or when the scroll ends with it still in view.
    const fills =
      below && !still
        ? [...room.querySelectorAll<HTMLElement>('[data-wms-fill]')]
        : [];
    const shown = new Set<Element>();
    const fillWhenStill = () => {
      if (holding) return;
      for (const el of shown) {
        el.setAttribute('data-seen', '');
        once.unobserve(el);
      }
      shown.clear();
    };
    const once = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.intersectionRatio >= 0.4) shown.add(e.target);
          else shown.delete(e.target);
        }
        fillWhenStill();
      },
      { threshold: 0.4 }
    );
    for (const el of fills) {
      el.setAttribute('data-armed', '');
      once.observe(el);
    }

    // Prefetching, once the page is still (5, above). A card counts as on
    // screen while its title link is. Which links show is asked once per
    // stop, of a one-shot IntersectionObserver: it answers after the next
    // frame's own intersection pass, so it never forces a layout, and it is
    // gone again before the next scroll. Not a standing observer (that runs
    // on every scrolling frame), and not rect reads at scrollend: there the
    // hold has just been lifted, so a rect read forced a style and layout
    // pass on the spot. Measured on a laptop, where a wheel ends a scroll
    // between notches, that was ~3ms a notch.
    const links = [...room.querySelectorAll<HTMLAnchorElement>('a[href]')];
    const fetched = new Set<string>();
    const fetchPage = (a: Element | null | undefined) => {
      const href = a?.getAttribute('href');
      if (!href || fetched.has(href)) return;
      fetched.add(href);
      router.prefetch(href);
    };
    let look: IntersectionObserver | null = null;
    const fetchInView = () => {
      look?.disconnect();
      look = null;
      const left = links.filter(
        (a) => !fetched.has(a.getAttribute('href') ?? '')
      );
      if (left.length === 0) return;
      const io = new IntersectionObserver((entries) => {
        io.disconnect();
        if (look === io) look = null;
        if (holding) return;
        for (const e of entries) if (e.isIntersecting) fetchPage(e.target);
      });
      for (const a of left) io.observe(a);
      look = io;
    };
    if (!below) fetchInView();
    // A mouse over a card (its stretched link) or a key landing on it says
    // the reader means it: fetch now. A finger touching down is usually the
    // start of a scroll, so touch waits for the scroll to end like the rest.
    const onIntent = (e: Event) => {
      if (e instanceof PointerEvent && e.pointerType !== 'mouse') return;
      fetchPage((e.target as Element | null)?.closest?.('a[href]'));
    };
    room.addEventListener('pointerover', onIntent, { passive: true });
    room.addEventListener('focusin', onIntent);

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
        switchLater();
        inkWhenStill();
        fillWhenStill();
        fetchInView();
      }
      if (hasEnd) listen();
    }
    listen();
    if (hasEnd)
      window.addEventListener('scrollend', release, { passive: true });

    return () => {
      live.disconnect();
      once.disconnect();
      room.removeEventListener('pointerover', onIntent);
      room.removeEventListener('focusin', onIntent);
      look?.disconnect();
      window.clearTimeout(quiet);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', release);
      for (const el of parts) el.removeAttribute('data-on');
      room.removeAttribute('data-hold');
    };
  }, [router]);

  return <span ref={ref} hidden />;
}
