const CACHE_NAME = 'eisenhower-cache-v2';
const ASSETS = [
  './index.html',
  './style.css',
  './storage.js',
  './manifest.json',
  './app.js',
  './drag.js',
  './ui.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
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
