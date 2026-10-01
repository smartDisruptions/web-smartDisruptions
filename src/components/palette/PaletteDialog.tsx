'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Kiru from '@/components/kiru/Kiru';
import { IconArrowRight, IconSearch } from '@/components/icons';
import type { SearchItem } from '@/app/search-index.json/route';

let cache: Promise<SearchItem[]> | null = null;
function loadIndex() {
  cache ??= fetch('/search-index.json')
    .then((r) => r.json() as Promise<SearchItem[]>)
    .catch(() => {
      cache = null;
      return [];
    });
  return cache;
}

/** Fuzzy-ish scoring: whole-word and prefix hits in the title count most. */
function score(item: SearchItem, terms: string[]): number {
  const title = item.t.toLowerCase();
  const rest = `${item.d ?? ''} ${item.x ?? ''} ${item.k}`.toLowerCase();
  let s = 0;
  for (const term of terms) {
    const ti = title.indexOf(term);
    if (ti === 0) s += 12;
    else if (ti > 0) s += title[ti - 1] === ' ' ? 9 : 5;
    else if (rest.includes(term)) s += 2;
    else return 0;
  }
  return s;
}

const KIND_ORDER: SearchItem['k'][] = ['Page', 'Note', 'Market Storm', 'Built', 'Arcade'];

export default function PaletteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);

  useEffect(() => {
    loadIndex().then(setItems);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      setQ('');
      setSel(0);
      requestAnimationFrame(() => input.current?.focus());
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  const results = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      // No query: the sections, then the five newest notes.
      return [
        ...items.filter((i) => i.k === 'Page'),
        ...items.filter((i) => i.k === 'Note').slice(0, 5),
      ];
    }
    return items
      .map((i) => ({ i, s: score(i, terms) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || KIND_ORDER.indexOf(a.i.k) - KIND_ORDER.indexOf(b.i.k))
      .slice(0, 12)
      .map((r) => r.i);
  }, [items, q]);

  function go(item: SearchItem | undefined) {
    if (!item) return;
    onClose();
    router.push(item.u);
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
      aria-label="Search the site"
      className="sd-palette m-0 mx-auto mt-[max(10vh,env(safe-area-inset-top))] w-[min(640px,calc(100vw-24px))] max-w-none overflow-visible bg-transparent p-0 text-text-primary backdrop:bg-black/45 backdrop:backdrop-blur-[3px] max-sm:mt-auto max-sm:mb-0 max-sm:w-full"
    >
      <div className="relative overflow-hidden rounded-[22px] border border-border bg-surface shadow-[0_40px_90px_-30px_rgba(0,0,0,.55)] max-sm:rounded-b-none max-sm:pb-[env(safe-area-inset-bottom)]">
        <Kiru pose="peek" className="pointer-events-none absolute -top-[54px] right-8 h-[64px] w-auto" />
        <div className="flex items-center gap-3 border-b border-border px-5">
          <IconSearch size={20} className="shrink-0 text-text-secondary" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, results.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === 'Enter') {
                e.preventDefault();
                go(results[sel]);
              }
            }}
            placeholder="Search notes, reports, builds, games…"
            className="h-16 w-full bg-transparent text-[1.05rem] outline-none placeholder:text-text-secondary"
            role="combobox"
            aria-expanded="true"
            aria-controls="sd-palette-list"
            aria-activedescendant={results[sel] ? `sd-pal-${sel}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[0.7rem] text-text-secondary sm:inline">
            esc
          </kbd>
        </div>
        <ul id="sd-palette-list" role="listbox" className="max-h-[min(60vh,480px)] overflow-y-auto overscroll-contain p-2">
          {results.length === 0 && (
            <li className="px-4 py-10 text-center text-sm text-text-secondary">
              {items.length ? 'Nothing matches that. Try fewer words.' : 'Loading the index…'}
            </li>
          )}
          {results.map((item, i) => (
            <li
              key={item.u}
              id={`sd-pal-${i}`}
              role="option"
              aria-selected={i === sel}
              onMouseMove={() => setSel(i)}
              onClick={() => go(item)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 transition-colors ${
                i === sel ? 'bg-fill' : ''
              }`}
            >
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider ${
                  item.k === 'Market Storm'
                    ? 'bg-accent/12 text-accent'
                    : item.k === 'Arcade'
                      ? 'bg-gold/15 text-gold-ink'
                      : item.k === 'Note'
                        ? 'bg-pen/12 text-pen-ink'
                        : 'bg-fill text-text-secondary'
                }`}
              >
                {item.k === 'Market Storm' ? 'Storm' : item.k}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{item.t}</span>
                {item.d && <span className="block truncate text-sm text-text-secondary">{item.d}</span>}
              </span>
              <IconArrowRight size={16} className={`shrink-0 text-text-secondary transition-opacity ${i === sel ? 'opacity-100' : 'opacity-0'}`} />
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-4 border-t border-border px-5 py-2.5 text-[0.72rem] text-text-secondary sm:flex">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span className="ml-auto">Kiru found {items.length} things</span>
        </div>
      </div>
    </dialog>
  );
}
