const CACHE_NAME = 'asson-ui-cache-v5';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo/asson_logo.png',
  '/logo/ui_crest.jpg',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png'
];

// Install Event: Precaches core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleans up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first for dynamic navigation, Cache-first for hashed static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests to avoid caching mutations
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Explicitly bypass cache for API calls (Supabase DB, Auth, Storage, Analytics)
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/storage/v1/object/upload')
  ) {
    return;
  }

  // Network-First for navigation requests (HTML pages & SPA routes)
  // Ensures students never see stale notices, past questions, or timetables
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Cache-first for static assets (scripts, styles, images, fonts)
  if (
    url.origin === self.location.origin &&
    (request.destination === 'style' ||
     request.destination === 'script' ||
     request.destination === 'image' ||
     request.destination === 'font')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default fallback: Network fetch
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

