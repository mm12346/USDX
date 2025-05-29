// กำหนดชื่อ Cache และเวอร์ชัน
const CACHE_NAME = 'usdx-cache-v1'; // เปลี่ยนเวอร์ชันเมื่อมีการอัปเดตไฟล์
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/app.js',
  '/service-worker.js',
  '/icons/icon-192.png', // ตรวจสอบให้แน่ใจว่าพาธถูกต้อง
  '/icons/icon-512.png'  // ตรวจสอบให้แน่ใจว่าพาธถูกต้อง
];

// ติดตั้ง Service Worker และ Cache ไฟล์
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ดักจับ Request และ Serve จาก Cache หรือ Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // ถ้าพบใน Cache ให้ส่งคืนจาก Cache
        if (response) {
          return response;
        }
        // ถ้าไม่พบใน Cache ให้ Fetch จาก Network
        return fetch(event.request);
      })
  );
});

// ลบ Cache เก่าเมื่อ Service Worker ใหม่ถูก Activate
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // ลบ Cache ที่ไม่อยู่ใน whitelist
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
