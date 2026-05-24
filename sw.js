const CACHE_NAME = "sarj-bul-v4-live-manual";
const FILES = [
  "./",
  "./index.html?v=4",
  "./manifest.json?v=4",
  "./config.js?v=4",
  "./sarjbul-icon-192.png?v=4",
  "./sarjbul-icon-512.png?v=4"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
