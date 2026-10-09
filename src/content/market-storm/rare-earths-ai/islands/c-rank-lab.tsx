'use client';

import { memo, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { FactorKey, WorldKey } from '../content';
import { setWorld, useWorld } from '../world';

/*
 * The ranking lab — chapter 10's instrument.
 *
 * Thirteen rows (twelve companies and the REMX benchmark), each a bar of its
 * score in its tier's ink. Two controls re-rank them:
 *
 *  - "Rank by": the article's score, or one of the three 2030 worlds. This
 *    is the page-wide world from ../world.ts, so a pick in chapter 02 arrives
 *    here already made. If the lab is off screen when the world changes, the
 *    re-sort waits until it scrolls into view, so the reader sees their
 *    choice land.
 *  - "Try your own weights": seven sliders, one per factor, defaulting to
 *    the article's weights. Every composite is recomputed live (the weighted
 *    mean of the factor scores) and the rows re-sort. At the article's
 *    weights the scores are the article's own, `compositeDisplay` exactly;
 *    anything else is labelled as the reader's, with the article's score
 *    left as a thin mark on each bar.
 *
 * How it stays at 60fps:
 *  - The first frame is server-rendered and complete (article order, article
 *    scores); nothing shifts when the island boots.
 *  - Rows are absolutely placed by a `--slot` custom property
 *    (translateY(slot × row height) in CSS). A re-sort writes new slots and
 *    the rows glide there on a transform transition: FLIP with no First to
 *    measure, because every slot's place is known. Bars are full-width and
 *    slide (translateX) inside a clipping track. No layout property is ever
 *    animated.
 *  - Slider input is read by a native listener and folded into one
 *    requestAnimationFrame. Nothing here is React state except whether the
 *    panel is open and whether the weights are the reader's own: dragging a
 *    slider re-renders nothing. Each frame writes only what changed.
 *  - The list's DOM order is synced to the visual order once things settle
 *    (moving a node mid-transition would cancel its glide), so a screen
 *    reader reads the ranking it sees.
 */

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export type LabRow = {
  ticker: string;
  name: string;
  scores: Record<FactorKey, number>;
  composite: number;
  compositeDisplay: string;
  tier: number;
  tierName: string;
  worlds: Record<WorldKey, number>;
};
export type LabFactor = {
  key: FactorKey;
  label: string;
  short: string;
  weight: number;
};
export type LabWorld = { key: WorldKey; name: string };

type Motion = 'drag' | 'toggle';
type Mode = 'article' | 'yours' | 'world';

/** A slider's top. The article's largest weight is 20, so 40 is "twice that". */
const MAX_W = 40;

const UI = {
  rankBy: 'Rank by',
  article: 'Article score',
  yours: 'Your weights',
  tune: 'Try your own weights',
  reset: 'Reset to the article’s weights',
  company: 'Company',
  tier: 'Tier',
  scoreArticle: 'Article score',
  scoreYours: 'Your score',
  scoreWorld: (name: string) => `${name} score`,
  ghost: 'the article’s score',
  share: 'of the score',
  liveArticle: 'Ranked by the article’s scores.',
  liveYours: 'Ranked by your weights.',
  liveWorld: (name: string) => `Ranked by the ${name} scores.`,
};

const barX = (score: number) =>
  `translateX(${((score / 10 - 1) * 100).toFixed(2)}%)`;

/**
 * Change an element's text by editing its text node rather than replacing
 * it: a node swap rebuilds layout objects, an edit only re-measures.
 */
function setText(el: Element, text: string) {
  const node = el.firstChild;
  if (node && node.nodeType === Node.TEXT_NODE && !node.nextSibling) {
    if (node.nodeValue !== text) node.nodeValue = text;
  } else if (el.textContent !== text) {
    el.textContent = text;
  }
}

const Row = memo(function Row({ r, i }: { r: LabRow; i: number }) {
  return (
    <li
      className="re-c-row"
      data-i={i}
      data-tier={r.tier}
      style={{ '--slot': i } as Vars}
    >
      <span className="re-c-co">
        <b className="re-c-tk">{r.ticker}</b>{' '}
        <span className="re-c-nm">{r.name}</span>
      </span>
      <span className="re-c-track" aria-hidden="true">
        <span className="re-c-clip">
          <span className="re-c-bar" style={{ transform: barX(r.composite) }} />
        </span>
        <span
          className="re-c-ghost"
          style={{ '--g': r.composite / 10 } as Vars}
        />
      </span>
      <span className="font-display re-c-sc">{r.compositeDisplay}</span>
      <span className="re-c-ti">{r.tierName}</span>
    </li>
  );
});

type Api = { onWorld: (w: WorldKey | null) => void; reset: () => void };

export default function RankLab({
  rows,
  factors,
  worlds,
  aria,
}: {
  rows: LabRow[];
  factors: LabFactor[];
  worlds: LabWorld[];
  aria: string;
}) {
  const world = useWorld();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);
  const api = useRef<Api | null>(null);

  const defaultSum = factors.reduce((a, f) => a + f.weight, 0);

  // The instrument. Everything below runs outside React's render.
  useEffect(() => {
    const root = rootRef.current;
    const list = listRef.current;
    const panel = panelRef.current;
    const head = headRef.current;
    const live = liveRef.current;
    if (!root || !list || !panel || !head || !live) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const defaults = factors.map((f) => f.weight);
    const keyIndex = new Map(factors.map((f, k) => [f.key as string, k]));
    const inputs = factors.map((f) =>
      panel.querySelector<HTMLInputElement>(`input[data-weight="${f.key}"]`)
    );
    const outs = factors.map((f) =>
      panel.querySelector<HTMLOutputElement>(`output[data-share="${f.key}"]`)
    );
    const els = rows.map((_, i) => {
      const li = list.querySelector<HTMLLIElement>(`li[data-i="${i}"]`)!;
      return {
        li,
        bar: li.querySelector<HTMLElement>('.re-c-bar')!,
        sc: li.querySelector<HTMLElement>('.re-c-sc')!,
      };
    });
    const worldName = (w: WorldKey) =>
      worlds.find((x) => x.key === w)?.name ?? w;

    const s = {
      weights: [...defaults],
      // What the server-rendered rows show: the article's view. The world
      // effect below applies the store's value if it already differs.
      world: null as WorldKey | null,
      slots: rows.map((_, i) => i),
      x: rows.map((r) => r.composite),
      disp: rows.map((r) => r.compositeDisplay),
      said: '',
      custom: false,
      raf: 0,
      settle: 0,
      arrive: 0,
      visible: false,
      pending: false,
    };

    const isDefault = () => s.weights.every((w, k) => w === defaults[k]);
    const setData = (key: string, value: string) => {
      if (root.dataset[key] !== value) root.dataset[key] = value;
    };

    function apply(motion: Motion, arriving = false) {
      const w = s.world;
      const W = s.weights;
      const sum = W.reduce((a, b) => a + b, 0);
      const def = isDefault();
      const mode: Mode = w ? 'world' : def ? 'article' : 'yours';
      const x: number[] = [];
      const disp: string[] = [];
      rows.forEach((r, i) => {
        if (w) {
          x[i] = r.worlds[w];
          disp[i] = String(r.worlds[w]);
        } else if (def) {
          // The article's numbers, exactly as printed.
          x[i] = r.composite;
          disp[i] = r.compositeDisplay;
        } else if (sum <= 0) {
          x[i] = 0;
          disp[i] = '–';
        } else {
          // Weighted mean in integers, rounded half-up to one decimal the
          // way the article rounds its composites (6.65 → 6.7).
          let t = 0;
          factors.forEach((f, k) => {
            t += r.scores[f.key] * W[k];
          });
          x[i] = t / sum;
          disp[i] = (Math.floor((20 * t + sum) / (2 * sum)) / 10).toFixed(1);
        }
      });
      // Highest first; ties keep the article's order.
      const order = rows.map((_, i) => i).sort((a, b) => x[b] - x[a] || a - b);

      const animate = !reduce.matches;
      // Write only what changed: a drag calls this every frame.
      setData('motion', animate ? motion : 'none');
      setData('mode', mode);
      setData('world', w ?? '');
      const label =
        mode === 'world'
          ? UI.scoreWorld(worldName(w!))
          : mode === 'yours'
            ? UI.scoreYours
            : UI.scoreArticle;
      setText(head!, label);

      order.forEach((ri, slot) => {
        const e = els[ri];
        if (s.slots[ri] !== slot) {
          s.slots[ri] = slot;
          e.li.style.setProperty('--slot', String(slot));
        }
        if (s.x[ri] !== x[ri]) {
          s.x[ri] = x[ri];
          e.bar.style.transform = barX(x[ri]);
        }
        if (s.disp[ri] !== disp[ri]) {
          s.disp[ri] = disp[ri];
          setText(e.sc, disp[ri]);
        }
      });

      if (arriving && animate) {
        root!.classList.add('is-arrive');
        window.clearTimeout(s.arrive);
        s.arrive = window.setTimeout(
          () => root!.classList.remove('is-arrive'),
          1400
        );
      }
      const say =
        mode === 'world'
          ? UI.liveWorld(worldName(w!))
          : mode === 'yours'
            ? UI.liveYours
            : UI.liveArticle;
      if (say !== s.said) {
        s.said = say;
        setText(live!, say);
      }
      window.clearTimeout(s.settle);
      s.settle = window.setTimeout(settle, 1300);
    }

    // Bring the DOM order in line with what's on screen, once nothing is
    // gliding. Rows are placed by --slot, so moving a node changes no pixel.
    function settle() {
      const order = rows
        .map((_, i) => i)
        .sort((a, b) => s.slots[a] - s.slots[b]);
      const kids = list!.children;
      if (order.every((ri, k) => kids[k] === els[ri].li)) return;
      const mover = list as HTMLOListElement & {
        moveBefore?: (n: Node, r: Node | null) => void;
      };
      for (const ri of order) {
        if (mover.moveBefore) mover.moveBefore(els[ri].li, null);
        else list!.appendChild(els[ri].li);
      }
    }

    const shown = factors.map((f) => ({ pct: -1, w: f.weight }));
    function shares() {
      const W = s.weights;
      const sum = W.reduce((a, b) => a + b, 0);
      factors.forEach((_, k) => {
        const pct = sum > 0 ? Math.round((W[k] / sum) * 100) : 0;
        const out = outs[k];
        const input = inputs[k];
        if (pct !== shown[k].pct) {
          shown[k].pct = pct;
          if (out) setText(out, `${pct}%`);
          input?.setAttribute('aria-valuetext', `${pct}% ${UI.share}`);
        }
        if (W[k] !== shown[k].w) {
          shown[k].w = W[k];
          input?.style.setProperty('--v', String(W[k] / MAX_W));
        }
      });
    }

    function flush() {
      s.raf = 0;
      // Weights shape the article's score, so moving one leaves any world.
      if (s.world !== null) {
        s.world = null;
        setWorld(null);
      }
      apply('drag');
      shares();
      const mine = !isDefault();
      if (mine !== s.custom) {
        s.custom = mine;
        setCustom(mine);
      }
    }

    const onInput = (e: Event) => {
      const t = e.target as HTMLInputElement;
      const k = keyIndex.get(t.dataset.weight ?? '');
      if (k === undefined) return;
      s.weights[k] = Math.max(
        0,
        Math.min(MAX_W, Math.round(Number(t.value) || 0))
      );
      if (!s.raf) s.raf = requestAnimationFrame(flush);
    };
    panel.addEventListener('input', onInput);

    // Off screen, a new world waits; it lands when the lab comes into view.
    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting;
        if (s.visible && s.pending) {
          s.pending = false;
          apply('toggle', true);
        }
      },
      { rootMargin: '0px 0px -18% 0px' }
    );
    io.observe(list);

    api.current = {
      onWorld(w) {
        if (w === s.world) return;
        s.world = w;
        if (!s.visible && !reduce.matches) {
          s.pending = true;
          return;
        }
        s.pending = false;
        apply('toggle');
      },
      reset() {
        defaults.forEach((d, k) => {
          s.weights[k] = d;
          const input = inputs[k];
          if (input) input.value = String(d);
        });
        apply('toggle');
        shares();
        s.custom = false;
        setCustom(false);
      },
    };

    return () => {
      panel.removeEventListener('input', onInput);
      io.disconnect();
      cancelAnimationFrame(s.raf);
      window.clearTimeout(s.settle);
      window.clearTimeout(s.arrive);
      api.current = null;
    };
  }, [rows, factors, worlds]);

  useEffect(() => {
    api.current?.onWorld(world);
  }, [world]);

  const options: { key: WorldKey | null; name: string }[] = [
    { key: null, name: custom ? UI.yours : UI.article },
    ...worlds,
  ];

  return (
    <div
      ref={rootRef}
      className="re-c-lab"
      data-mode="article"
      data-motion="toggle"
    >
      <div className="re-c-tools">
        <fieldset className="re-c-seg">
          <legend className="re-c-seg-k">{UI.rankBy}</legend>
          <div className="re-c-seg-row">
            {options.map((o) => (
              <label
                key={o.key ?? 'article'}
                className={`re-c-seg-o is-${o.key ?? 'article'}`}
              >
                <input
                  type="radio"
                  name="re-c-rank"
                  value={o.key ?? ''}
                  checked={world === o.key}
                  onChange={() => setWorld(o.key)}
                />
                <span>{o.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          className="re-c-tune"
          aria-expanded={open}
          aria-controls="re-c-weights"
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
            <path d="M3 5h14M3 10h14M3 15h14" />
            <circle cx="13" cy="5" r="2" />
            <circle cx="7" cy="10" r="2" />
            <circle cx="15" cy="15" r="2" />
          </svg>
          {UI.tune}
          <span className="re-c-tune-chev" aria-hidden="true" />
        </button>
      </div>

      <div
        id="re-c-weights"
        ref={panelRef}
        className="re-c-weights"
        hidden={!open}
      >
        <div className="re-c-wgrid">
          {factors.map((f) => {
            const pct = Math.round((f.weight / defaultSum) * 100);
            return (
              <div key={f.key} className="re-c-w">
                <label htmlFor={`re-c-w-${f.key}`} className="re-c-w-l">
                  <span className="re-c-w-long">{f.label}</span>
                  <span className="re-c-w-short">{f.short}</span>
                </label>
                <output
                  htmlFor={`re-c-w-${f.key}`}
                  className="re-c-w-out"
                  data-share={f.key}
                >
                  {pct}%
                </output>
                <input
                  id={`re-c-w-${f.key}`}
                  type="range"
                  min={0}
                  max={MAX_W}
                  step={1}
                  defaultValue={f.weight}
                  data-weight={f.key}
                  className="re-c-w-in"
                  style={{ '--v': f.weight / MAX_W } as Vars}
                  aria-valuetext={`${pct}% ${UI.share}`}
                />
              </div>
            );
          })}
          <button
            type="button"
            className="re-c-reset"
            disabled={!custom}
            onClick={() => api.current?.reset()}
          >
            {UI.reset}
          </button>
        </div>
      </div>

      <div className="re-c-board">
        <div className="re-c-head" aria-hidden="true">
          <span className="re-c-head-co">{UI.company}</span>
          <span className="re-c-head-key">
            <i /> {UI.ghost}
          </span>
          <span ref={headRef} className="re-c-head-sc">
            {UI.scoreArticle}
          </span>
          <span className="re-c-head-ti">{UI.tier}</span>
        </div>
        <ol
          ref={listRef}
          className="re-c-rows"
          role="list"
          aria-label={aria}
          style={{ '--n': rows.length } as Vars}
        >
          {rows.map((r, i) => (
            <Row key={r.ticker} r={r} i={i} />
          ))}
        </ol>
      </div>
      <p ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  );
}
