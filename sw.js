const CACHE_NAME = "sarj-bul-live-v3";
const FILES = [
  "./",
  "./index.html?v=3",
  "./manifest.json?v=3",
  "./config.js?v=3",
  "./sarjbul-icon-192.png?v=3",
  "./sarjbul-icon-512.png?v=3"
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
