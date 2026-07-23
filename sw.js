const CACHE_NAME = 'triggerpointmap-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './data.json',
  './triggerpoint_muscles.glb'
];
const OPTIONAL_ASSETS = ['./triggerpoint_patch.glb'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_ASSETS).catch(()=>{});
      await Promise.all(OPTIONAL_ASSETS.map((a) => cache.add(a).catch(()=>{})));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// network-first for same-origin assets so updates propagate without manual cache clearing
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
