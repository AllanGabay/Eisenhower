const CACHE_NAME = 'eisenhower-cache-v1';
const ASSETS = [
  './index.html',
  './style.css',
  './storage.js',
  './manifest.json'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
