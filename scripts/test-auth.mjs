/**
 * Studio auth tests. This gate stands in front of a route that can commit to
 * the repo and merge to main, so the failure modes worth proving are: forged
 * cookies rejected, expired sessions rejected, and an unconfigured Studio
 * closed rather than open.
 *
 *   node --import ./scripts/ts-resolve-register.mjs scripts/test-auth.mjs
 */
let pass = 0,
  fail = 0;
const ok = (label, cond, extra = '') => {
  if (cond) {
    pass++;
    console.log(`PASS  ${label}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}${extra ? '  — ' + extra : ''}`);
  }
};

process.env.STUDIO_PASSWORD = 'correct horse battery staple';
process.env.STUDIO_SECRET = 'test-secret-not-a-real-one';

const auth = await import('../src/lib/studio/auth.ts');
const cfgResult = auth.getAuthConfig();
ok('config loads when both vars are set', cfgResult.ok === true);
const config = cfgResult.config;

console.log('\n— password —');
ok('correct password accepted', await auth.checkPassword('correct horse battery staple', config));
ok('wrong password rejected', !(await auth.checkPassword('wrong', config)));
ok('empty password rejected', !(await auth.checkPassword('', config)));
ok('prefix of the password rejected', !(await auth.checkPassword('correct horse battery stapl', config)));
ok('password plus a char rejected', !(await auth.checkPassword('correct horse battery staple!', config)));
ok('case change rejected', !(await auth.checkPassword('Correct Horse Battery Staple', config)));

console.log('\n— sessions —');
const token = await auth.createSession(config);
ok('fresh session verifies', await auth.verifySession(token, config));
ok('two sessions differ (nonce)', (await auth.createSession(config)) !== token);

ok('undefined token rejected', !(await auth.verifySession(undefined, config)));
ok('empty token rejected', !(await auth.verifySession('', config)));
ok('garbage token rejected', !(await auth.verifySession('nonsense', config)));
ok('token with no signature rejected', !(await auth.verifySession('123456789.abc', config)));

console.log('\n— forgery —');
const [expires, nonce, sig] = token.split('.');
ok('tampered signature rejected', !(await auth.verifySession(`${expires}.${nonce}.${sig.slice(0, -2)}xy`, config)));
ok('tampered expiry rejected', !(await auth.verifySession(`${Date.now() + 10 ** 10}.${nonce}.${sig}`, config)));
ok('tampered nonce rejected', !(await auth.verifySession(`${expires}.deadbeef.${sig}`, config)));
ok('signature alone is not enough', !(await auth.verifySession(sig, config)));
ok(
  'token signed with another secret rejected',
  !(await auth.verifySession(
    await auth.createSession({ password: config.password, secret: 'different-secret' }),
    config,
  )),
  'this is what rotating STUDIO_SECRET relies on',
);

console.log('\n— expiry —');
// createSession only ever mints a future expiry, so to test the time check we
// sign a past expiry ourselves with the real secret. A valid signature must
// still be refused once it is stale, or a stolen cookie would work forever.
async function signPayload(payload, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload)),
  );
  return btoa(String.fromCharCode(...mac))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const stalePayload = `${Date.now() - 1000}.nonce`;
const staleToken = `${stalePayload}.${await signPayload(stalePayload, config.secret)}`;
ok('correctly-signed but expired token rejected', !(await auth.verifySession(staleToken, config)));

const freshPayload = `${Date.now() + 60_000}.nonce`;
const freshToken = `${freshPayload}.${await signPayload(freshPayload, config.secret)}`;
ok('the same construction with a future expiry IS accepted', await auth.verifySession(freshToken, config),
   'proves the rejection above was the expiry, not the hand-rolled signature');

console.log('\n— unconfigured is closed —');
delete process.env.STUDIO_PASSWORD;
delete process.env.STUDIO_SECRET;
const fresh = await import('../src/lib/studio/auth.ts?nocfg=1');
const missing = fresh.getAuthConfig();
ok('reports what is missing', missing.ok === false && missing.missing.length === 2);
ok('isAuthed is false with no config, even with a real token', !(await fresh.isAuthed(token)));
ok('isAuthed is false with no config and no token', !(await fresh.isAuthed(undefined)));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
