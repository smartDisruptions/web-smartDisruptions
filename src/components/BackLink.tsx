'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';

/**
 * Back link on a /built detail page. The arcade tags its links with
 * `?from=arcade`, so a visitor who came from the Arcade goes back to the
 * Arcade; everyone else goes back to /built. Wrapped in <Suspense> by the page
 * so the route stays static — on the normal (soft) navigation from a card the
 * param is read instantly, no flash.
 */
export default function BackLink({ variant }: { variant: 'top' | 'bottom' }) {
  const fromArcade = useSearchParams().get('from') === 'arcade';
  const href = fromArcade ? '/games' : '/built';

  if (variant === 'top') {
    return (
      <Link
        href={href}
        className="font-display inline-flex min-h-11 items-center gap-2 text-2xl text-accent transition-colors hover:text-accent-hover"
      >
        &larr; {fromArcade ? 'back to the arcade' : 'everything I built'}
      </Link>
    );
  }

  return (
    <Button variant="secondary" href={href}>
      &larr; {fromArcade ? 'Back to the arcade' : 'Everything I built'}
    </Button>
  );
}
