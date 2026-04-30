const CACHE_NAME = 'ketan-pms-v1';
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/ketan_logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline page and core assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Navigation requests -> Network First, Fallback to Cache/Offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // 2. Supabase API / External resources -> Network Only (or Network First)
  if (url.hostname.includes('supabase.co')) {
    // For API calls, we usually want fresh data. 
    // We can add caching here if needed later.
    return;
  }

  // 3. Static Assets (JS, CSS, Images) -> Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
