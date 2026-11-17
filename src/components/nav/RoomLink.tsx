'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * One room in the Play tab's switch (PlayRooms.tsx). A link like any other in
 * the nav; it is a client component only so a tap can give the same short
 * vibration the tab bar gives (Android; iOS ignores it).
 */
export default function RoomLink({
  href,
  current,
  types,
  label,
  children,
}: {
  href: string;
  current: boolean;
  /** Which way the page slides: see `direction()` in nav.ts. */
  types: string[];
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      prefetch={current ? false : undefined}
      transitionTypes={types}
      aria-current={current ? 'page' : undefined}
      aria-label={label}
      className="sd-room"
      onClick={() => {
        if (!current) navigator.vibrate?.(8);
      }}
    >
      {children}
    </Link>
  );
}
