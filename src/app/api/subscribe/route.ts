import { NextResponse } from 'next/server';

// Email capture — forwards to the `subscribe` Supabase Edge Function, which is
// the ONLY write path to the sd_subscribers table.
//
// Hardened design (2026-07-09): the table has NO anon RLS policies, so the
// public API key can neither read nor write it — direct REST calls get 401.
// All inserts go through the edge function, which runs with the service role
// (key held inside Supabase, never in this repo) and enforces validation, a
// DB-backed per-IP rate limit, and duplicate-as-success (membership never
// leaks). A DB trigger caps global insert rate as the final backstop.
//
// The keys below are PUBLIC by design (the anon JWT only satisfies the edge
// function's JWT check; it has no table access). Safe in a public repo.
const SUPABASE_FUNCTIONS_URL =
  'https://nptrijdcnslkeeomksxj.supabase.co/functions/v1/subscribe';
const SUPABASE_ANON_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdHJpamRjbnNsa2Vlb21rc3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzODYwNDQsImV4cCI6MjA5ODk2MjA0NH0.JXL-MOvwIpMK43VLlCl-FzpP1IS21w0r9s2FgcvoyfA';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ALLOWED_SOURCES = new Set(['site', 'post', 'home']);

// First-layer per-IP rate limit (in-memory, per serverless instance — the
// edge function holds the durable DB-backed limit).
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  if (hits.size > 10_000) hits.clear(); // unbounded-growth guard
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

  const res = await fetch(SUPABASE_FUNCTIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_JWT}`,
      'Content-Type': 'application/json',
      // Forward the real visitor IP so the edge function's durable per-IP
      // limit applies to the visitor, not to Vercel's egress IPs.
      'x-client-ip': ip,
    },
    body: JSON.stringify({ email, source }),
  });

  if (res.ok) {
    return NextResponse.json({ ok: true });
  }
  if (res.status === 429) {
    return NextResponse.json(
      { error: 'Too many attempts — try again later.' },
      { status: 429 },
    );
  }

  return NextResponse.json(
    { error: 'Something went wrong — try again in a minute.' },
    { status: 502 },
  );
}
