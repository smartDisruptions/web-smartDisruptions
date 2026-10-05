'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui';
import { BackArrow, backTarget } from './back';

/**
 * The back link on a /built detail page — the same rule as
 * src/components/BackLink.tsx, in this section's own clothes: the Arcade
 * tags its links with `?from=arcade` and its archive with `?from=archive`, so
 * a visitor goes back to the room they came from; everyone else goes back to
 * /built.
 *
 * The page wraps it in <Suspense> with the /built version as the fallback,
 * so the route stays static and a soft navigation reads the param at once.
 */
export default function BuiltBackLink({ variant }: { variant: 'top' | 'bottom' }) {
  const { href, label } = backTarget(useSearchParams().get('from'));

  if (variant === 'top') {
    return (
      <Link href={href} className="bt-back">
        <BackArrow />
        {label}
      </Link>
    );
  }
  return (
    <Button variant="secondary" size="lg" href={href}>
      <span aria-hidden="true">&larr;</span> {label}
    </Button>
  );
}
