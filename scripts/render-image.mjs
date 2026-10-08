/**
 * Render an HTML file to an image, at an exact size, with headless Chrome.
 *
 *   node scripts/render-image.mjs <page.html> <out.png|out.webp> [WIDTHxHEIGHT]
 *
 * No design lives here: the HTML is the picture. Market Storm articles keep
 * their image's source beside the article and render it with this (October
 * 2026), so an image can be anything and still be re-rendered later.
 *
 * Chrome is driven over its DevTools pipe rather than with `--screenshot`,
 * which sizes the window rather than the page (see make-hero.mjs for that
 * story). The page's fonts are awaited before the picture is taken.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [input, output, size = '1200x630'] = process.argv.slice(2);
if (!input || !output) {
  console.error(
    'Usage: node scripts/render-image.mjs <page.html> <out.png|out.webp> [WIDTHxHEIGHT]'
  );
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`No such file: ${input}`);
  process.exit(1);
}
if (!existsSync(CHROME)) {
  console.error(`Chrome not found at ${CHROME} (set CHROME_PATH).`);
  process.exit(1);
}
const [W, H] = size.split('x').map(Number);
const format = output.endsWith('.webp') ? 'webp' : 'png';

const tmp = mkdtempSync(path.join(tmpdir(), 'render-image-'));
const proc = spawn(
  CHROME,
  [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--allow-file-access-from-files',
    '--remote-debugging-pipe',
    `--user-data-dir=${path.join(tmp, 'profile')}`,
    // Only ever true in a container; on a Mac the sandbox stays on.
    ...(typeof process.getuid === 'function' && process.getuid() === 0
      ? ['--no-sandbox']
      : []),
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] }
);

const pending = new Map();
const waiting = [];
let seq = 0;
let buf = Buffer.alloc(0);
proc.stdio[4].on('data', (chunk) => {
  buf = Buffer.concat([buf, chunk]);
  let end;
  while ((end = buf.indexOf(0)) !== -1) {
    const msg = JSON.parse(buf.subarray(0, end).toString('utf8'));
    buf = buf.subarray(end + 1);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method) {
      const i = waiting.findIndex((w) => w.method === msg.method);
      if (i !== -1) waiting.splice(i, 1)[0].resolve(msg.params);
    }
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    proc.stdio[3].write(
      JSON.stringify({
        id,
        method,
        params,
        ...(sessionId ? { sessionId } : {}),
      }) + '\0'
    );
  });
const next = (method) =>
  new Promise((resolve) => waiting.push({ method, resolve }));

function done(code, message) {
  if (message) console.error(message);
  // Chrome keeps writing its profile for a moment after the kill, so the temp
  // folder is cleared once it has actually exited.
  const finish = () => {
    try {
      rmSync(tmp, { recursive: true, force: true });
    } catch {
      // A leftover temp folder is not worth failing a finished render over.
    }
    process.exit(code);
  };
  if (proc.exitCode !== null || proc.signalCode !== null) finish();
  proc.once('exit', finish);
  proc.kill('SIGKILL');
  setTimeout(finish, 3000).unref();
}
proc.on('error', (e) => done(1, `Could not start Chrome: ${e.message}`));
setTimeout(() => done(1, 'Chrome stopped answering.'), 60_000).unref();

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', {
  targetId,
  flatten: true,
});
await send('Page.enable', {}, sessionId);
await send(
  'Emulation.setDeviceMetricsOverride',
  { width: W, height: H, deviceScaleFactor: 1, mobile: false },
  sessionId
);
const loaded = next('Page.loadEventFired');
await send(
  'Page.navigate',
  { url: `file://${path.resolve(input)}` },
  sessionId
);
await loaded;
await send(
  'Runtime.evaluate',
  { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true },
  sessionId
);
const { data } = await send(
  'Page.captureScreenshot',
  {
    format,
    ...(format === 'webp' ? { quality: 86 } : {}),
    clip: { x: 0, y: 0, width: W, height: H, scale: 1 },
  },
  sessionId
);
writeFileSync(output, Buffer.from(data, 'base64'));
console.log(`  ${output} (${W}×${H} ${format})`);
done(0);
