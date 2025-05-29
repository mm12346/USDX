// กำหนดชื่อแคชและเวอร์ชัน
const CACHE_NAME = 'usd-tracker-app-v1.1.7'; // อัปเดตเวอร์ชันเมื่อมีการเปลี่ยนแปลงไฟล์
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-180x180.png', // ตรวจสอบให้แน่ใจว่าพาธถูกต้อง
    '/icons/icon-512x512.png', // ตรวจสอบให้แน่ใจว่าพาธถูกต้อง
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/swiper/swiper-bundle.min.css',
    'https://unpkg.com/swiper/swiper-bundle.min.js',
    'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
    'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    // เพิ่มไฟล์อื่นๆ ที่จำเป็นสำหรับแอปของคุณที่นี่
];

// ติดตั้ง Service Worker และแคชไฟล์ที่จำเป็น
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(ASSETS);
            })
            .catch((error) => {
                console.error('[Service Worker] Failed to cache assets:', error);
            })
    );
    self.skipWaiting(); // บังคับให้ Service Worker ใหม่ทำงานทันที
});

// ดักจับคำขอ Fetch และตอบกลับด้วยไฟล์ที่แคชไว้
self.addEventListener('fetch', (event) => {
    // ไม่แคชคำขอไปยัง Google Apps Script API
    if (event.request.url.includes('script.google.com/macros/s/') || event.request.url.includes('firestore.googleapis.com')) {
        event.respondWith(fetch(event.request)); // ส่งคำขอไปยังเครือข่ายโดยตรง
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // ถ้าพบในแคช ให้ส่งคืนจากแคช
                if (response) {
                    return response;
                }
                // ถ้าไม่พบในแคช ให้ไปดึงจากเครือข่าย
                return fetch(event.request)
                    .then((networkResponse) => {
                        // ตรวจสอบว่าการตอบกลับถูกต้องก่อนที่จะแคช
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        // แคชการตอบกลับจากเครือข่ายสำหรับคำขอในอนาคต
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', event.request.url, error);
                        // สามารถตอบกลับด้วยหน้าออฟไลน์ได้ที่นี่หากต้องการ
                        // return caches.match('/offline.html');
                    });
            })
    );
});

// อัปเดต Service Worker ใหม่และลบแคชเก่า
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating Service Worker...');
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
        }).then(() => {
            console.log('[Service Worker] Old caches cleared. Claiming clients.');
            return self.clients.claim(); // ทำให้ Service Worker ควบคุมหน้าเว็บที่เปิดอยู่ทันที
        })
    );
});

// แจ้งเตือนผู้ใช้เมื่อมีการอัปเดต Service Worker
self.addEventListener('controllerchange', () => {
    console.log('[Service Worker] Controller changed. Sending update notification.');
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            // ส่งข้อความไปยังหน้าเว็บเพื่อแสดงการแจ้งเตือน
            client.postMessage({ type: 'UPDATE_AVAILABLE' });
        });
    });
});
