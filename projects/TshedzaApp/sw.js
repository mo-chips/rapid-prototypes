const CACHE_NAME = 'tshedza-playground-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/main.js',
  './js/voice.js',
  './js/constants.js',
  './js/tracing-manager.js',
  './js/games/name-tracing.js',
  './js/games/alphabet-academy.js',
  './js/games/shape-safari.js',
  './js/games/balloon-pop.js',
  './js/games/number-tracing.js',
  './js/games/object-oasis.js',
  './js/games/body-parts.js',
  './js/games/animal-safari.js'
];

// Install Event: Cache all shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all offline shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clear out older caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache: ', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache First, fallback to network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(e.request).then((networkResponse) => {
        // Cache external Google Font files or local audio files dynamically on-the-fly
        if (e.request.url.startsWith('https://fonts.googleapis.com') || 
            e.request.url.startsWith('https://fonts.gstatic.com') ||
            e.request.url.includes('/audio/')) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
  );
});
