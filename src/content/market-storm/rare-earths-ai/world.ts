import { useSyncExternalStore } from 'react';
import type { WorldKey } from './content';

/*
 * The 2030 world the reader picked, page-wide.
 *
 * Chapter 02 sets it ("Pick your 2030"); chapter 10's ranking lab reads it
 * and re-ranks the companies for that world, and anything else on the page
 * may follow it too. `null` is the article's own view: the composite score,
 * no world chosen. That is the default, and it is never persisted: every
 * visit starts from the article's numbers.
 *
 * A module-level value and a set of listeners, read through
 * useSyncExternalStore. No context provider, no dependency: every island
 * that imports this module shares the one value. Islands that aren't React
 * can listen for the `re-world` event on window instead (detail: the key, or
 * null).
 */

let current: WorldKey | null = null;
const listeners = new Set<() => void>();

export function getWorld(): WorldKey | null {
  return current;
}

export function setWorld(next: WorldKey | null): void {
  if (next === current) return;
  current = next;
  for (const l of listeners) l();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('re-world', { detail: next }));
  }
}

export function subscribeWorld(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const onServer = (): WorldKey | null => null;

/** The chosen world, re-rendering the caller when it changes. */
export function useWorld(): WorldKey | null {
  return useSyncExternalStore(subscribeWorld, getWorld, onServer);
}
