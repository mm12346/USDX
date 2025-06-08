const CACHE_NAME = 'usd-stock-cache-v1.5';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json',
  '/offline.html', // เพิ่มบรรทัดนี้
  // เพิ่มไฟล์ css, js, icon, ฯลฯ ที่ต้องการ cache
];

// ติดตั้ง service worker และ cache ไฟล์
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ดักจับ fetch request
sself.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // ถ้าเจอใน cache ให้คืนเลย
      if (response) return response;
      // ถ้า fetch ไม่ได้ (offline) และเป็นหน้า html ให้แสดงหน้าออฟไลน์
      return fetch(event.request).catch(() => {
        if (event.request.destination === 'document' || event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/offline.html');
        }
      });
    })
  );
});


// อัปเดต service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
});
