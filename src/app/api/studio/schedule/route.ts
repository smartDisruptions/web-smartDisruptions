import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, isAuthed } from '@/lib/studio/auth';
import { getGhConfig } from '@/lib/studio/github';
import { publish, updateSchedule } from '@/lib/studio/actions';
import type { ChannelPlan, PostStatus } from '@/lib/posts';

export const dynamic = 'force-dynamic';

const STATUSES: PostStatus[] = ['draft', 'scheduled', 'published'];
const CHANNEL_STATUSES = new Set(['planned', 'scheduled', 'done']);

async function guard(): Promise<NextResponse | null> {
  const jar = await cookies();
  if (await isAuthed(jar.get(SESSION_COOKIE)?.value)) return null;
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}

type Body = {
  branch?: unknown;
  slug?: unknown;
  sha?: unknown;
  title?: unknown;
  status?: unknown;
  liveAt?: unknown;
  channels?: unknown;
  action?: unknown;
};

function parseChannels(input: unknown): ChannelPlan[] | undefined {
  if (input === undefined) return undefined;
  if (!Array.isArray(input)) throw new Error('channels must be a list');
  return input.map((c) => {
    const o = c as Record<string, unknown>;
    const name = typeof o.name === 'string' ? o.name.trim() : '';
    const status = typeof o.status === 'string' ? o.status : 'planned';
    if (!name) throw new Error('every channel needs a name');
    if (!CHANNEL_STATUSES.has(status)) {
      throw new Error(`unknown channel status "${status}"`);
    }
    const scheduledFor =
      typeof o.scheduledFor === 'string' && o.scheduledFor.trim()
        ? o.scheduledFor
        : undefined;
    if (scheduledFor && Number.isNaN(Date.parse(scheduledFor))) {
      throw new Error(`"${scheduledFor}" is not a valid date`);
    }
    return {
      name,
      status: status as ChannelPlan['status'],
      scheduledFor,
      note: typeof o.note === 'string' && o.note.trim() ? o.note : undefined,
    };
  });
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

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  const branch = typeof body.branch === 'string' ? body.branch : '';
  const slug = typeof body.slug === 'string' ? body.slug : '';
  const sha = typeof body.sha === 'string' ? body.sha : '';
  if (!branch || !slug || !sha) {
    return NextResponse.json(
      { error: 'branch, slug and sha are all required' },
      { status: 400 }
    );
  }

  try {
    // Publishing is its own action: it makes an article public, so it is never
    // a side effect of saving a schedule.
    if (body.action === 'publish') {
      const title = typeof body.title === 'string' ? body.title : slug;
      const result = await publish({ branch, slug, sha, title }, gh.config);
      return NextResponse.json({ ok: true, ...result });
    }

    const status =
      typeof body.status === 'string' &&
      STATUSES.includes(body.status as PostStatus)
        ? (body.status as PostStatus)
        : undefined;
    if (body.status !== undefined && status === undefined) {
      return NextResponse.json(
        { error: `status must be one of ${STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    let liveAt: string | null | undefined;
    if (body.liveAt !== undefined) {
      if (body.liveAt === null || body.liveAt === '') liveAt = null;
      else if (
        typeof body.liveAt === 'string' &&
        !Number.isNaN(Date.parse(body.liveAt))
      ) {
        liveAt = body.liveAt;
      } else {
        return NextResponse.json(
          { error: 'liveAt must be a valid date or empty' },
          { status: 400 }
        );
      }
    }

    if (status === 'scheduled' && liveAt === null) {
      return NextResponse.json(
        { error: 'A scheduled post needs a go-live date' },
        { status: 400 }
      );
    }

    const result = await updateSchedule(
      {
        branch,
        slug,
        sha,
        update: { status, liveAt, channels: parseChannels(body.channels) },
      },
      gh.config
    );
    return NextResponse.json({ ok: true, sha: result.sha });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Could not save';
    // A stale blob SHA means someone else edited the file since this board
    // loaded. Say so plainly rather than reporting a generic failure.
    const stale = /does not match|sha/i.test(message);
    return NextResponse.json(
      {
        error: stale
          ? 'This post changed since the board loaded. Refresh and try again.'
          : message,
      },
      { status: stale ? 409 : 400 }
    );
  }
}
