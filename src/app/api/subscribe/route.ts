import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

// Email capture — writes straight to the site's own Postgres database.
//
// The database is a free Neon project added through Vercel's Storage tab,
// which puts its connection string in DATABASE_URL. That variable lives only
// in Vercel's settings: nothing in this repo or in the browser can read the
// list. Neon scales to zero when idle and wakes on the next query, so it
// can't fall asleep for good the way the old setup did.
//
// History (2026-11-16): signups used to go through a Supabase edge function
// in the `samurai-kitchen-funnel` project. That project paused in late August
// 2026 and every signup failed from then on, with nobody noticing. If this
// endpoint can't reach its database it logs loudly and says so, rather than
// pretending.
//
// One list for everyone. `source` only records which page someone signed up
// from, so we can see which surface works.

const SOURCES = new Set([
  'site',
  'post',
  'home',
  'market-storm',
  'websites',
  'apps',
  'games',
]);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Durable limits, held in the database so they apply across every serverless
// instance. The per-IP records are deleted after two hours — the privacy page
// promises exactly that, so keep the two in step.
const PER_IP_PER_HOUR = 5;
const GLOBAL_PER_HOUR = 200; // backstop against a scripted flood

// First-layer per-IP limit, in memory, per serverless instance. Cheap, and it
// turns away a burst before it costs a database round trip.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;

function rateLimited(ip: string): boolean {
  if (hits.size > 10_000) hits.clear(); // unbounded-growth guard
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= PER_IP_PER_HOUR) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

// Only the site's own pages may call this endpoint. Browsers always send an
// Origin header on fetch POSTs, so requiring a match blocks drive-by pages
// from making their visitors' browsers hammer the form (which would defeat
// per-IP rate limits by distributing across many IPs).
function allowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (
    origin === 'https://smartdisruptions.com' ||
    origin === 'https://www.smartdisruptions.com' ||
    origin === 'https://smart-disruptions-web.vercel.app'
  ) {
    return true;
  }
  // This project's Vercel preview deployments
  return (
    origin.startsWith('https://web-smart-disruptions-') &&
    origin.endsWith('.vercel.app')
  );
}

// The tables create themselves on the first signup an instance handles, so a
// fresh database needs no setup step. Every statement is idempotent.
let schemaReady: Promise<void> | null = null;

function ensureSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  schemaReady ??= (async () => {
    await sql`
      create table if not exists sd_subscribers (
        id bigint generated always as identity primary key,
        email text not null unique,
        source text not null default 'site',
        created_at timestamptz not null default now()
      )`;
    await sql`
      create table if not exists sd_subscribe_hits (
        id bigint generated always as identity primary key,
        ip text not null,
        ts timestamptz not null default now()
      )`;
    await sql`
      create index if not exists sd_subscribe_hits_ip_ts
        on sd_subscribe_hits (ip, ts)`;
  })().catch((err) => {
    schemaReady = null; // try again on the next request
    throw err;
  });
  return schemaReady;
}

const TOO_MANY = 'Too many attempts — try again later.';
const BROKEN = 'Something went wrong — try again in a minute.';

export async function POST(request: Request) {
  if (!allowedOrigin(request.headers.get('origin'))) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

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

  const source = SOURCES.has(body.source ?? '') ? body.source! : 'site';

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: TOO_MANY }, { status: 429 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[subscribe] DATABASE_URL is not set — signups are failing');
    return NextResponse.json({ error: BROKEN }, { status: 503 });
  }

  try {
    const sql = neon(url);
    await ensureSchema(sql);

    await sql`delete from sd_subscribe_hits where ts < now() - interval '2 hours'`;

    const [limits] = await sql`
      select
        (select count(*) from sd_subscribe_hits
          where ip = ${ip} and ts > now() - interval '1 hour')::int as from_ip,
        (select count(*) from sd_subscribers
          where created_at > now() - interval '1 hour')::int as everyone`;
    if (
      limits.from_ip >= PER_IP_PER_HOUR ||
      limits.everyone >= GLOBAL_PER_HOUR
    ) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }

    // A repeat signup succeeds quietly, so the form never reveals whether an
    // address is already on the list.
    await sql.transaction([
      sql`insert into sd_subscribe_hits (ip) values (${ip})`,
      sql`insert into sd_subscribers (email, source)
          values (${email}, ${source})
          on conflict (email) do nothing`,
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[subscribe] database error', err);
    return NextResponse.json({ error: BROKEN }, { status: 502 });
  }
}
