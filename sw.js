/* Service Worker — تحديث مباشر للنسخة المنشورة */
const CACHE = 'grades-v8';
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    for (const url of APP_SHELL) {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) await cache.put(url, response.clone());
      } catch (_) {}
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names.filter(name => name !== CACHE).map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const isPage = request.mode === 'navigate' ||
    new URL(request.url).pathname.endsWith('/index.html');

  event.respondWith((async () => {
    try {
      // Always prefer the newest HTML so old layouts cannot return from cache.
      const response = await fetch(request, { cache: isPage ? 'no-store' : 'default' });
      if (response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (_) {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (isPage) {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      throw _;
    }
  })());
});
