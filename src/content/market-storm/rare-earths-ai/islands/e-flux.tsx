'use client';

import { useEffect, useRef, useState } from 'react';

type Filter = 'all' | 'up' | 'against';

const OPTIONS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'up', label: 'Push up' },
  { key: 'against', label: 'Push against' },
];

/**
 * Chapter 08's one island. On the page it is the All / Push up / Push
 * against filter, which dims the chains that don't match. Behind it, it
 * keeps the flux lines' particles cheap:
 *
 *  1. Liveness. Each chain's particles run only while that chain is on
 *     screen: an IntersectionObserver sets `data-live` on the chain, and the
 *     CSS loops run on it (e.css). Off screen they are paused, mid-flow.
 *  2. Holding still while the page scrolls. A running CSS loop costs Chrome
 *     a style pass on every scrolling frame, even one the compositor draws
 *     (see SiteFX). So the first scroll event of a gesture sets `data-hold`
 *     on the field — one passive listener, `once`, no layout read, and only
 *     if a chain is live — and `scrollend` lifts it a beat later (a reader
 *     scrolls in bursts). Chains that come into or leave view mid-scroll are
 *     noted and switched at the release, so a scrolling frame restyles
 *     nothing at all.
 *
 * Under reduced motion no chain ever goes live, and e.css defines no loop.
 * Without JavaScript the field shows its first frame: the particles lie
 * still along their lines, spaced like filings.
 */
export default function FluxFilter({
  counts,
}: {
  counts: Record<Filter, number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [said, setSaid] = useState('');

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>('.re-e-flux');
    if (!root) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const chains = [...root.querySelectorAll<HTMLElement>('.re-e-chain')];

    const live = new Set<Element>();
    const pending = new Map<Element, boolean>();
    let scrolling = false;
    let holding = false;
    const hold = (on: boolean) => {
      if (on === holding) return;
      holding = on;
      root.toggleAttribute('data-hold', on);
    };
    const setLive = (el: Element, on: boolean) => {
      el.toggleAttribute('data-live', on);
      if (on) live.add(el);
      else live.delete(el);
    };

    const io = still
      ? null
      : new IntersectionObserver((entries) => {
          for (const e of entries) {
            if (scrolling) pending.set(e.target, e.isIntersecting);
            else setLive(e.target, e.isIntersecting);
          }
        });
    for (const c of chains) io?.observe(c);

    // The scroll hold. Where `scrollend` exists the listener fires once per
    // gesture and is re-armed at the end; elsewhere a quiet spell ends it.
    // The release waits a beat after the scroll ends: a reader flicking
    // down a page scrolls in bursts, and a hold that let go between bursts
    // would restart the loops (and restyle them) between every two.
    const hasEnd = 'onscrollend' in window;
    let quiet = 0;
    let grace = 0;
    const listen = () =>
      window.addEventListener('scroll', onScroll, {
        passive: true,
        once: hasEnd,
      });
    function onScroll() {
      window.clearTimeout(grace);
      if (!scrolling) {
        scrolling = true;
        if (live.size) hold(true);
      }
      window.clearTimeout(quiet);
      quiet = window.setTimeout(ended, hasEnd ? 3000 : 160);
    }
    function ended() {
      window.clearTimeout(quiet);
      window.clearTimeout(grace);
      grace = window.setTimeout(release, 240);
      if (hasEnd) listen();
    }
    function release() {
      if (!scrolling) return;
      scrolling = false;
      for (const [el, on] of pending) setLive(el, on);
      pending.clear();
      hold(false);
    }
    if (!still) {
      listen();
      if (hasEnd)
        window.addEventListener('scrollend', ended, { passive: true });
    }

    return () => {
      io?.disconnect();
      window.clearTimeout(quiet);
      window.clearTimeout(grace);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scrollend', ended);
      for (const c of chains) c.removeAttribute('data-live');
      root.removeAttribute('data-hold');
    };
  }, []);

  const choose = (f: Filter) => {
    setFilter(f);
    ref.current
      ?.closest<HTMLElement>('.re-e-flux')
      ?.setAttribute('data-filter', f);
    setSaid(
      f === 'all'
        ? `Showing all ${counts.all} chains`
        : f === 'up'
          ? `Showing the ${counts.up} chains that push demand up`
          : `Showing the ${counts.against} chains that push against`
    );
  };

  // Each pill is also the field's legend: how many chains flow which way.
  // The label comes first in the DOM so the button reads "Push up, 4";
  // CSS lifts the count above it.
  return (
    <div ref={ref} className="re-e-filter">
      <div className="re-e-fgroup" role="group" aria-label="Filter the chains">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            className="re-e-fbtn"
            data-k={o.key}
            aria-pressed={filter === o.key}
            onClick={() => choose(o.key)}
          >
            <span className="re-e-flabel">{o.label}</span>
            <span className="re-e-fnum">
              <span className="re-e-fcount">{counts[o.key]}</span>
              <span className="re-e-farrow" aria-hidden="true">
                {o.key !== 'against' && <i data-d="up" />}
                {o.key !== 'up' && <i data-d="against" />}
              </span>
            </span>
          </button>
        ))}
      </div>
      <p className="re-e-said" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
