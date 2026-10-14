/* Service Worker — النسخة الجديدة */
const CACHE = 'grades-v4-1';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of ASSETS) {
      try {
        const r = await fetch(url, { cache: 'reload' });
        if(r.ok) await cache.put(url, r.clone());
      } catch(err){}
    }
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  e.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      if(fresh && fresh.ok){
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch(err){
      const cached = await caches.match(req, { ignoreSearch: true });
      if(cached) return cached;
      if(req.mode === 'navigate') return caches.match('./index.html');
      throw err;
    }
  })());
});
