import { NextResponse } from 'next/server';
import { SESSION_COOKIE, isAuthed } from '@/lib/studio/auth';
import { getGhConfig, scanAllBranches } from '@/lib/studio/github';
import { createDraft } from '@/lib/studio/actions';
import { cookies } from 'next/headers';

// Never prerender: the board reflects live repo state.
export const dynamic = 'force-dynamic';

/** proxy.ts already gates this, but a route that can write to the repo
 *  re-checks rather than trusting routing config it does not own. */
async function guard(): Promise<NextResponse | null> {
  const jar = await cookies();
  if (await isAuthed(jar.get(SESSION_COOKIE)?.value)) return null;
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const gh = getGhConfig();
  if (!gh.ok) {
    return NextResponse.json(
      {
        error: `Set ${gh.missing.join(', ')} to read branches.`,
        needsConfig: gh.missing,
        branches: [],
      },
      { status: 200 }
    );
  }

  try {
    return NextResponse.json({ branches: await scanAllBranches(gh.config) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not read the repo' },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const gh = getGhConfig();
  if (!gh.ok) {
    return NextResponse.json(
      { error: `Set ${gh.missing.join(', ')} first.` },
      { status: 503 }
    );
  }

  let title = '';
  let category: string | undefined;
  try {
    const body = (await request.json()) as {
      title?: unknown;
      category?: unknown;
    };
    title = typeof body.title === 'string' ? body.title.trim() : '';
    category = typeof body.category === 'string' ? body.category : undefined;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: 'A title is required' }, { status: 400 });
  }

  try {
    const created = await createDraft({ title, category }, gh.config);
    return NextResponse.json({ ok: true, ...created });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Could not create the draft' },
      { status: 400 }
    );
  }
}
