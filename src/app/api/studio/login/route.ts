import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE,
  checkPassword,
  createSession,
  getAuthConfig,
  sessionCookieOptions,
} from '@/lib/studio/auth';

// Password attempts, per instance. The Studio has one operator, so anything
// above a handful a minute is someone else guessing.
const attempts = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (attempts.size > 5_000) attempts.clear();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  const cfg = getAuthConfig();
  if (!cfg.ok) {
    return NextResponse.json(
      {
        error: `Studio is not configured. Set ${cfg.missing.join(' and ')} in the environment.`,
      },
      { status: 503 }
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts. Wait a few minutes.' },
      { status: 429 }
    );
  }

  let password = '';
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }

  if (!(await checkPassword(password, cfg.config))) {
    // Deliberately vague: a wrong password and an unknown user are the same
    // thing here, and there is nothing useful to tell an attacker.
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(
    SESSION_COOKIE,
    await createSession(cfg.config),
    sessionCookieOptions
  );
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
