// Version: 2024-02-08T13:13:24.685Z
// This line imports the Workbox library from a CDN. In a production environment,
// you might want to host these files locally to ensure your service worker functions
// even if the CDN is not accessible.
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// Ensure Workbox is available before using it
if (workbox) {
  console.log(`Workbox is loaded.`);

  // Precaching: Cache files upon service worker installation
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Example runtime caching rules for different types of requests
  // Cache CSS and JavaScript files
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'style' || request.destination === 'script',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'css-js',
    })
  );

  // Cache images
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // Cache pages
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'document',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
        }),
      ],
    })
  );
  
  // Update service worker version and activate new service worker immediately
  const VERSION = 'v1.0.0'; // Update this value every time before you build
  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== VERSION) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }).then(() => {
        console.log('Claiming clients for version:', VERSION);
        return self.clients.claim();
      })
    );
  });
  
} else {
  console.log(`Workbox didn't load.`);
}

// Fallback for when a match is not found in the cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
