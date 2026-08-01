/**
 * Studio auth. Single operator, so this is a password check that mints an
 * HMAC-signed session cookie — no user table, no third-party auth to wire.
 *
 * The bar is real: this route can commit to the repo and merge to main, so a
 * forged cookie is equivalent to a push. Hence a signed token with an expiry,
 * constant-time comparison, and a hard refusal to run when the secrets are
 * unset — there is deliberately no default password.
 *
 * Built on Web Crypto rather than node:crypto so the identical code runs in
 * proxy.ts (Edge runtime) and in route handlers (Node runtime). One
 * implementation, no chance of the two gates disagreeing.
 *
 * Secrets come from the environment and are never committed:
 *   STUDIO_PASSWORD  the login password
 *   STUDIO_SECRET    HMAC key for session cookies (any long random string)
 */

export const SESSION_COOKIE = 'sd_studio';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // a working day, then re-auth

export type AuthConfig = { password: string; secret: string };

/** The configured secrets, or a list of what is missing. */
export function getAuthConfig():
  | { ok: true; config: AuthConfig }
  | { ok: false; missing: string[] } {
  const password = process.env.STUDIO_PASSWORD ?? '';
  const secret = process.env.STUDIO_SECRET ?? '';
  const missing: string[] = [];
  if (!password) missing.push('STUDIO_PASSWORD');
  if (!secret) missing.push('STUDIO_SECRET');
  if (missing.length) return { ok: false, missing };
  return { ok: true, config: { password, secret } };
}

const enc = new TextEncoder();

async function hmac(key: string, data: string): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, enc.encode(data)));
}

function toBase64Url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Constant-time compare of two strings.
 *
 * Both sides are hashed to a fixed 32 bytes first, so the comparison cost
 * cannot vary with input length — comparing raw strings would leak the
 * password's length through timing even with a byte-wise constant-time loop.
 */
async function safeEqual(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([hmac('cmp', a), hmac('cmp', b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

export function checkPassword(
  input: string,
  config: AuthConfig
): Promise<boolean> {
  return safeEqual(input, config.password);
}

async function sign(payload: string, secret: string): Promise<string> {
  return toBase64Url(await hmac(secret, payload));
}

/** Mint a session token valid for SESSION_TTL_MS. */
export async function createSession(config: AuthConfig): Promise<string> {
  const expires = Date.now() + SESSION_TTL_MS;
  // A nonce makes each session distinct, so one leaked cookie can be reasoned
  // about — and revoked by rotating STUDIO_SECRET — independently.
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(12)));
  const payload = `${expires}.${nonce}`;
  return `${payload}.${await sign(payload, config.secret)}`;
}

/** Verify a session token: signature first, then expiry. */
export async function verifySession(
  token: string | undefined,
  config: AuthConfig
): Promise<boolean> {
  if (!token) return false;
  const idx = token.lastIndexOf('.');
  if (idx < 1) return false;
  const payload = token.slice(0, idx);
  const signature = token.slice(idx + 1);
  if (!(await safeEqual(signature, await sign(payload, config.secret)))) {
    return false;
  }
  const expires = Number(payload.split('.')[0]);
  return Number.isFinite(expires) && expires > Date.now();
}

/** True when the request carries a valid Studio session. */
export async function isAuthed(token: string | undefined): Promise<boolean> {
  const cfg = getAuthConfig();
  if (!cfg.ok) return false; // unconfigured is closed, never open
  return verifySession(token, cfg.config);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_MS / 1000,
};
