// VisionGarage Coding PWA – Service Worker
const CACHE_NAME = 'vg-codings-v4';
const OFFLINE_URL = './car-coding-docs.html';

const PRECACHE_URLS = [
  './car-coding-docs.html',
  './manifest.json',
  './vg-icon.svg',
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
// Strategy: Cache First pentru resurse locale, Network First pentru externe
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests (forum searches etc.)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(event.request);

      if (cached) {
        // Return cache, update in background
        fetchAndCache(event.request, cache);
        return cached;
      }

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        // Offline – return cached offline page
        return cache.match(OFFLINE_URL);
      }
    })
  );
});

async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
  } catch { /* offline, ignore */ }
}

// ── BACKGROUND SYNC ──────────────────────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-codings') {
    event.waitUntil(syncCodings());
  }
});

async function syncCodings() {
  // Placeholder for future server sync
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
}

// ── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const title = data.title || 'VisionGarage Codări';
  const options = {
    body: data.body || 'Codare nouă disponibilă în baza de date!',
    icon: './vg-icon.svg',
    badge: './vg-icon.svg',
    tag: data.tag || 'vg-update',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: data.url || './car-coding-docs.html' },
    actions: [
      { action: 'view', title: 'Vezi codarea' },
      { action: 'dismiss', title: 'Ignoră' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || './car-coding-docs.html';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(wins => {
        const match = wins.find(w => w.url.includes('car-coding-docs'));
        if (match) { match.focus(); match.navigate(url); }
        else clients.openWindow(url);
      })
    );
  }
});

// ── VERSION CHECK MESSAGE ─────────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME });
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
