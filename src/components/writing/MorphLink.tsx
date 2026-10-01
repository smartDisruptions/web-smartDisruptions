'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

/**
 * A link whose image morphs into the page it opens. On a plain click it names
 * its `[data-morph]` frame `post-hero-<slug>` — the name the post page gives
 * its hero — just before the navigation's View Transition captures the page.
 *
 * The name is added on click rather than at render because these cards sit at
 * the foot of another post: named up front, the next page's own "keep
 * reading" card for THIS post would pair with this page's hero (scrolled far
 * above) and fling it across the screen.
 */
export default function MorphLink({
  slug,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { slug: string }) {
  return (
    <Link
      {...props}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
          return;
        }
        const frame = e.currentTarget.querySelector<HTMLElement>('[data-morph]');
        if (frame) frame.style.viewTransitionName = `post-hero-${slug}`;
      }}
    />
  );
}
