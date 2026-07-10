import { NextResponse } from 'next/server';

// Email capture — inserts into the sd_subscribers table (Supabase).
//
// The key below is the project's PUBLISHABLE key: public by design (same class
// of key every Supabase browser app ships), safe in a public repo. Security is
// enforced by RLS: the table is INSERT-only for anon (shape-checked policy) —
// nobody can read the list with this key. Kept as constants instead of env vars
// so deploys work from any surface without a Vercel env-var step.
const SUPABASE_URL = 'https://nptrijdcnslkeeomksxj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xFYj-3TKWLQsdxtlcDgBUw_Di9VDaiw';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ALLOWED_SOURCES = new Set(['site', 'post', 'home']);

// Best-effort per-IP rate limit (in-memory, per serverless instance — enough
// to blunt casual abuse; the unique-email index is the real backstop).
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request: Request) {
  let body: { email?: string; source?: string; company?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: real people never see this field; bots fill it. Pretend success.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 320) {
    return NextResponse.json(
      { error: 'That does not look like an email address.' },
      { status: 400 },
    );
  }

  const source = ALLOWED_SOURCES.has(body.source ?? '') ? body.source : 'site';

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many attempts — try again later.' },
      { status: 429 },
    );
  }

  // Publishable keys go in the apikey header only (no Authorization header —
  // Supabase assumes the anon role, which is exactly what we want here).
  const res = await fetch(`${SUPABASE_URL}/rest/v1/sd_subscribers`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ email, source }),
  });

  // 409 = already subscribed (unique index). That's a success from the
  // subscriber's point of view — don't leak who's on the list.
  if (res.ok || res.status === 409) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: 'Something went wrong — try again in a minute.' },
    { status: 502 },
  );
}
