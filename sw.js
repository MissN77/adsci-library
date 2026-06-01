// Service worker: cache the app shell for offline use
const V = "adsci-v2";
const SHELL = ["/adsci-library/", "/adsci-library/index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  // network first for the flags script (always want fresh flags)
  if (e.request.url.includes("script.google.com")) return;
  e.respondWith(
    fetch(e.request).then(r => {
      // update cache with fresh copy
      const copy = r.clone();
      caches.open(V).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
