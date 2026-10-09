'use client';

import type { ReactNode } from 'react';
import { useWorld } from '../world';

/**
 * A wrapper that carries the page-wide 2030 world as `data-world`, so the
 * server-rendered chart inside can light that world's marks in CSS. The
 * children stay server components; this island is the attribute and nothing
 * else.
 */
export default function WorldScope({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const world = useWorld();
  return (
    <div className={className} data-world={world ?? undefined}>
      {children}
    </div>
  );
}
