const CACHE_NAME = 'usd-stock-cache-v1.0.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.html',
  '/manifest.json',
  // เพิ่มไฟล์ css, js, icon, ฯลฯ ที่ต้องการ cache
];

// ติดตั้ง service worker และ cache ไฟล์
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ดักจับ fetch request
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
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
