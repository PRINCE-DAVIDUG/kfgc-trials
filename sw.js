const CACHE_NAME = "kfgc-sw-test-v1";

self.addEventListener("install", event => {
  console.log("[KFGC SW] Installing");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  console.log("[KFGC SW] Activated");

  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request)
    )
  );
});
