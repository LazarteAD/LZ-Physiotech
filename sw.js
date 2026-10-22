const CACHE_NAME = 'lz-physiotech-v1';

const ASSETS_TO_CACHE = [

  './',

  './index.html',

  './manifest.json',

  'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',

  'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'
'./icons/icon-192.png',

];

// Install Event - Caching core static app shell

self.addEventListener('install', (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME).then((cache) => {

      console.log('[SW] Caching static shell resources');

      return cache.addAll(ASSETS_TO_CACHE);

    }).then(() => self.skipWaiting())

  );

});

// Activate Event - Clearing obsolete caches

self.addEventListener('activate', (event) => {

  event.waitUntil(

    caches.keys().then((cacheNames) => {

      return Promise.all(

        cacheNames.map((cache) => {

          if (cache !== CACHE_NAME) {

            console.log('[SW] Deleting old cache:', cache);

            return caches.delete(cache);

          }

        })

      );

    }).then(() => self.clients.claim())

  );

});

// Fetch Event - Stale-While-Revalidate pattern with dynamic network fallback

self.addEventListener('fetch', (event) => {

  // Pass non-GET requests straight to network (e.g. Firebase API calls)

  if (event.request.method !== 'GET') return;

  event.respondWith(

    caches.match(event.request).then((cachedResponse) => {

      const fetchPromise = fetch(event.request).then((networkResponse) => {

        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {

          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {

            cache.put(event.request, responseToCache);

          });

        }

        return networkResponse;

      }).catch(() => {

        // Fallback for network failure

      });

      return cachedResponse || fetchPromise;

    })

  );

});

// Push Notifications Listener

self.addEventListener('push', (event) => {

  const data = event.data ? event.data.text() : 'Time for scheduled kinesiology assessment!';

  const options = {

    body: data,

    icon: 'icons/icon-192.png',

    badge: 'icons/icon-192.png',

    vibrate: [100, 50, 100]

  };

  event.waitUntil(

    self.registration.showNotification('LZ Physiotech Reminder', options)

  );

});
