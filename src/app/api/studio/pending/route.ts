import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, isAuthed } from '@/lib/studio/auth';
import {
  DRAFT_BRANCH,
  PRODUCTION_BRANCH,
  comparePending,
  getGhConfig,
} from '@/lib/studio/github';

export const dynamic = 'force-dynamic';

/**
 * What a Publish press would carry to production, beyond the article itself.
 * Read-only; the confirm dialog shows it so promoting the drafting branch is
 * never a blind action.
 */
export async function GET() {
  const jar = await cookies();
  if (!(await isAuthed(jar.get(SESSION_COOKIE)?.value))) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const gh = getGhConfig();
  if (!gh.ok) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  try {
    const pending = await comparePending(
      PRODUCTION_BRANCH,
      DRAFT_BRANCH,
      gh.config
    );
    return NextResponse.json({
      ...pending,
      from: DRAFT_BRANCH,
      to: PRODUCTION_BRANCH,
    });
  } catch (e) {
    // Never block publishing on this — it is context, not a gate.
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not compare branches' },
      { status: 502 }
    );
  }
}
