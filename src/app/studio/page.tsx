import { getAuthConfig } from '@/lib/studio/auth';
import { getGhConfig } from '@/lib/studio/github';
import StudioBoard from './StudioBoard';

export const metadata = {
  title: 'Studio — SmartDisruptions',
  robots: { index: false, follow: false },
};

// The board reflects live repo state; never prerender it.
export const dynamic = 'force-dynamic';

export default function StudioPage() {
  const auth = getAuthConfig();
  const gh = getGhConfig();
  const missing = [
    ...(auth.ok ? [] : auth.missing),
    ...(gh.ok ? [] : gh.missing),
  ];

  return <StudioBoard missingConfig={missing} />;
}
