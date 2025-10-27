const CACHE_NAME = 'pwa-personas-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Archivos en caché');
      return cache.addAll(urlsToCache);
    })
  );
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            console.log('[ServiceWorker] Eliminando cache viejo:', k);
            return caches.delete(k);
          }
        })
      )
    )
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => {
        if (resp) {
          return resp; 
        } else {
          console.warn('[ServiceWorker] Recurso no encontrado en cache:', event.request.url);
          return new Response(
            'Recurso no disponible offline.',
            { status: 404, statusText: 'Offline: no disponible en cache' }
          );
        }
      })
  );
});
