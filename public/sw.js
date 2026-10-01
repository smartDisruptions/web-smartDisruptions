/*
  Smart Disruptions service worker.

  What it does, deliberately little:
   - Build assets under /_next/static/ have content hashes in their names, so
     they never change: served cache-first. A repeat visit loads the app shell
     from disk, before the network answers.
   - Images, icons and fonts: served from cache, refreshed in the background.
   - Pages: always the network first, so nobody ever reads a stale article
     while online. A copy of each page you visit is kept, so it still opens
     with no connection; a page you never visited gets /offline instead.
   - Nothing else is touched: no API calls, no analytics, no other origins,
     nothing but GET.

  Kill switch: if this ever misbehaves, replace this file with one whose
  install handler calls self.registration.unregister() and deletes every
  cache. Browsers re-check this file on each navigation (it is served with
  no-cache; see next.config.ts), so the fix reaches everyone on their next
  visit.
*/
const VERSION = 'sd-2026-10-01';
const ASSETS = `${VERSION}-assets`;
const PAGES = `${VERSION}-pages`;
const OFFLINE = '/offline';
const MAX_PAGES = 60;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => c.addAll([OFFLINE]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const cacheable = (res) => res && res.ok && res.type === 'basic' && !res.redirected;

async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (cacheable(res)) {
    const c = await caches.open(ASSETS);
    c.put(req, res.clone());
  }
  return res;
}

async function staleWhileRevalidate(req, event) {
  const c = await caches.open(ASSETS);
  const hit = await c.match(req);
  const refresh = fetch(req)
    .then((res) => {
      if (cacheable(res)) c.put(req, res.clone());
      return res;
    })
    .catch(() => hit);
  if (hit) {
    event.waitUntil(refresh);
    return hit;
  }
  return refresh;
}

async function trim(cacheName, max) {
  const c = await caches.open(cacheName);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

async function networkFirstPage(req, event) {
  try {
    const res = await fetch(req);
    if (cacheable(res)) {
      const c = await caches.open(PAGES);
      event.waitUntil(c.put(req, res.clone()).then(() => trim(PAGES, MAX_PAGES)));
    }
    return res;
  } catch {
    return (await caches.match(req)) || (await caches.match(OFFLINE)) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/_vercel') || url.pathname.startsWith('/api/')) return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req));
    return;
  }
  if (/^\/(images|icons)\//.test(url.pathname) || /\.(?:webp|png|jpe?g|svg|woff2|ico)$/.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req, event));
    return;
  }
  // Full page loads only. The router's own data requests (RSC) go straight to
  // the network; if one fails offline, Next falls back to a full load, which
  // lands here.
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstPage(req, event));
  }
});
