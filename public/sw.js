/* Service worker — Escuelas de Paysandú PWA */
const SHELL_CACHE = 'paysandu-shell-v1';
const IMAGE_CACHE = 'paysandu-images-v1';
const MAX_IMAGE_ENTRIES = 150;

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== IMAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isImageRequest(request, url) {
  if (request.destination === 'image') return true;
  if (url.pathname.startsWith('/_next/image')) return true;
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/object/public/')) {
    return true;
  }
  return false;
}

function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/');
}

async function trimImageCache() {
  const cache = await caches.open(IMAGE_CACHE);
  const keys = await cache.keys();
  if (keys.length <= MAX_IMAGE_ENTRIES) return;
  const extra = keys.length - MAX_IMAGE_ENTRIES;
  await Promise.all(keys.slice(0, extra).map((key) => cache.delete(key)));
}

async function staleWhileRevalidateImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trimImageCache();
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    void networkPromise;
    return cached;
  }

  const network = await networkPromise;
  if (network) return network;
  return new Response('', { status: 503, statusText: 'Offline' });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      await cache.put('/', response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    const cached = (await cache.match('/')) || (await cache.match(request));
    if (cached) return cached;
    return new Response('Sin conexión', {
      status: 503,
      statusText: 'Offline',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Solo mismo origen + imágenes remotas de Supabase
  const isSameOrigin = url.origin === self.location.origin;
  const isSupabaseImage =
    url.hostname.includes('supabase.co') &&
    url.pathname.includes('/storage/v1/object/public/');

  if (!isSameOrigin && !isSupabaseImage) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isImageRequest(request, url)) {
    event.respondWith(staleWhileRevalidateImage(request));
    return;
  }

  if (isSameOrigin && isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
  }
});
