// กำหนดชื่อแคชและเวอร์ชัน
const CACHE_NAME = 'usdx-cache-v1.0.2'; // เปลี่ยนเวอร์ชันเมื่อมีการอัปเดตไฟล์
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/swiper/swiper-bundle.min.css',
  'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap',
  'https://unpkg.com/swiper/swiper-bundle.min.js',
  'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
  // เพิ่มเส้นทางไอคอนของคุณที่นี่ (ตัวอย่าง)
  '/icons/icon-48x48.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-144x144.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// ติดตั้ง Service Worker และแคชไฟล์ทั้งหมด
self.addEventListener('install', event => {
  console.log('Service Worker: กำลังติดตั้งและแคชไฟล์...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: เปิดแคชแล้ว');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // บังคับให้ Service Worker ใหม่ทำงานทันที
      .catch(err => console.error('Service Worker: การแคชล้มเหลว', err))
  );
});

// เปิดใช้งาน Service Worker และล้างแคชเก่า
self.addEventListener('activate', event => {
  console.log('Service Worker: กำลังเปิดใช้งานและล้างแคชเก่า...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: ลบแคชเก่า:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    }).then(() => self.clients.claim()) // บังคับให้ Service Worker ควบคุมหน้าเว็บทันที
  );
});

// ดักจับคำขอ Fetch และให้บริการจากแคชหรือเครือข่าย
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // หากพบในแคช ให้ส่งคืนจากแคช
        if (response) {
          return response;
        }
        // หากไม่พบในแคช ให้ไปดึงจากเครือข่าย
        return fetch(event.request)
          .then(fetchResponse => {
            // ตรวจสอบว่าการตอบสนองถูกต้องหรือไม่
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            // แคชการตอบสนองใหม่
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return fetchResponse;
          })
          .catch(error => {
            console.error('Service Worker: การดึงข้อมูลล้มเหลว:', error);
            // สามารถส่งคืนหน้าออฟไลน์ได้ที่นี่หากต้องการ
            // return caches.match('/offline.html'); // ตัวอย่าง
          });
      })
  );
});

// ตรวจจับเมื่อมี Service Worker ใหม่พร้อมใช้งาน
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
