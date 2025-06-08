const CACHE_NAME = 'usd-stock-cache-v1.6';
const urlsToCache = [
  './',
  'index.html',
  'app.html',
  'manifest.json',
  'offline.html', // ไม่มี / หรือ ./
  // เพิ่มไฟล์ css, js, icon, ฯลฯ ที่ต้องการ cache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).catch(() => {
        if (
          event.request.destination === 'document' ||
          event.request.headers.get('accept')?.includes('text/html')
        ) {
          return caches.match('offline.html'); // ไม่มี / หรือ ./
        }
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
});
