const version = "1";
const cacheName = `$unique_id.-${version}`;
self.addEventListener("install", e => {
  e.waitUntil(caches.open(cacheName).then(cache => {
    return cache.addAll([`index.html`,`main-icon.png`,`apple-touch-icon.png`]).then(() => self.skipWaiting());
  }));
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", event => {
  event.respondWith(caches.open(cacheName).then(cache => cache.match(event.request, {ignoreSearch: true})).then(response => {
    return response || fetch(event.request);
  }));
});
