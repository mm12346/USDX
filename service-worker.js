// กำหนดชื่อแคชสำหรับเวอร์ชันปัจจุบัน
const CACHE_NAME = 'usdx-cache-v1';

// กำหนดรายการไฟล์ที่จะแคชเมื่อ Service Worker ติดตั้ง
// ตรวจสอบให้แน่ใจว่าได้รวมไฟล์ HTML, CSS, JS, และไอคอนทั้งหมดที่จำเป็นสำหรับการทำงานแบบออฟไลน์
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/swiper/swiper-bundle.min.css',
  'https://unpkg.com/swiper/swiper-bundle.min.js',
  'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap',
  '/app.js' // เพิ่ม app.js เข้าไปในรายการแคช
];

// เหตุการณ์ 'install': Service Worker จะถูกติดตั้งและแคชไฟล์
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all app shell assets');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache during install:', error);
      })
  );
});

// เหตุการณ์ 'fetch': ดักจับคำขอเครือข่ายและให้บริการจากแคชหากมี
self.addEventListener('fetch', (event) => {
  // ตรวจสอบว่าคำขอเป็นแบบ GET และไม่ใช่คำขอข้ามโดเมนที่อาจไม่สามารถแคชได้
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // ถ้ามีในแคช ให้ส่งคืนจากแคช
          if (response) {
            console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
            return response;
          }
          // ถ้าไม่มีในแคช ให้ไปดึงจากเครือข่าย
          console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
          return fetch(event.request)
            .then((networkResponse) => {
              // ตรวจสอบว่าการตอบกลับถูกต้องก่อนที่จะแคช
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              // แคชการตอบกลับใหม่
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return networkResponse;
            })
            .catch((error) => {
              console.error(`[Service Worker] Fetch failed for ${event.request.url}:`, error);
              // คุณสามารถส่งคืนหน้าออฟไลน์ที่กำหนดเองได้ที่นี่
              // เช่น return caches.match('/offline.html');
            });
        })
    );
  } else {
    // สำหรับคำขอที่ไม่ใช่ GET หรือคำขอข้ามโดเมน ให้ดำเนินการตามปกติ
    event.respondWith(fetch(event.request));
  }
});

// เหตุการณ์ 'activate': Service Worker เวอร์ชันใหม่จะเข้ามาควบคุมและล้างแคชเก่า
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating new service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // ทำให้ Service Worker ใหม่เริ่มควบคุมทันที
  return self.clients.claim();
});

// เหตุการณ์ 'message': รับข้อความจากหน้าเว็บ (เช่น แจ้งเตือนการอัปเดต)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
