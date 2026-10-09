const CACHE_NAME = 'daily-routine-v2';
const urlsToCache = [
  '/daily-routine-app/',
  '/daily-routine-app/index.html',
  '/daily-routine-app/manifest.json'
];

// Install: cache semua file penting
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: serve dari cache dulu, fallback ke network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      if (cachedRes) return cachedRes;
      return fetch(event.request).then(networkRes => {
        // Cache response baru untuk next time
        if (event.request.method === 'GET') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
        }
        return networkRes;
      }).catch(() => {
        // Fallback ke index.html jika offline
        return caches.match('/daily-routine-app/index.html');
      });
    })
  );
});
