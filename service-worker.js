const CACHE_NAME = 'usd-tracker-cache-v1.1'; // เปลี่ยนเวอร์ชัน cache เมื่อมีการอัปเดตเนื้อหา
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-48x48.png',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-144x144.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/apple-touch-icon.png', // ตรวจสอบว่ามีไฟล์นี้อยู่จริง
    // เพิ่ม assets อื่นๆ เช่น CSS, JS libraries ที่คุณใช้
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/swiper/swiper-bundle.min.css',
    'https://unpkg.com/swiper/swiper-bundle.min.js',
    'https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js',
    'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
];

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Cache addAll failed', error);
            })
    );
    self.skipWaiting(); // ให้ Service Worker ใหม่เริ่มทำงานทันทีหลังจากติดตั้ง
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // ควบคุมหน้าเว็บทันที
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // If not in cache, fetch from network
                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        // IMPORTANT: Clone the response. A response is a stream
                        // and can only be consumed once. We must clone it so that
                        // both the cache and the browser can consume it.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
            .catch(error => {
                console.error('Service Worker: Fetch failed', error);
                // คุณอาจต้องการแสดงหน้าออฟไลน์ที่กำหนดเองที่นี่
                // return caches.match('/offline.html');
            })
    );
});

// Listen for messages from the page to skip waiting
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting(); // สั่งให้ Service Worker ใหม่เริ่มทำงานทันที
        // ส่งข้อความกลับไปที่หน้าเพื่อบอกให้ reload
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({ type: 'RELOAD_APP' }));
        });
    }
});
