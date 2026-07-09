'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';

/**
 * Back link on the app detail page. The arcade tags its links with
 * `?from=arcade`, so a visitor who came from the Arcade goes back to the
 * Arcade; everyone else goes back to /apps. Wrapped in <Suspense> by the page
 * so the route stays static — on the normal (soft) navigation from a card the
 * param is read instantly, no flash.
 */
export default function BackLink({ variant }: { variant: 'top' | 'bottom' }) {
  const fromArcade = useSearchParams().get('from') === 'arcade';
  const href = fromArcade ? '/games' : '/apps';

  if (variant === 'top') {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent"
      >
        &larr; Back to {fromArcade ? 'Arcade' : 'Apps'}
      </Link>
    );
  }

  return (
    <Button variant="secondary" href={href}>
      &larr; Back to {fromArcade ? 'the Arcade' : 'All Apps'}
    </Button>
  );
}
