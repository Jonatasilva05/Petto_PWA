const CACHE_NAME = 'petto-cache-v2';

// Usando caminhos relativos para evitar erros 404
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});