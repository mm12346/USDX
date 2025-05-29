// ตรวจสอบว่า Service Worker รองรับในเบราว์เซอร์หรือไม่
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('[App] Service Worker registered:', reg);

        // ตรวจจับการอัปเดต Service Worker
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // มี Service Worker ใหม่ที่ติดตั้งแล้วและพร้อมใช้งาน
              // แสดงการแจ้งเตือนแก่ผู้ใช้
              showUpdateNotification();
            }
          });
        });
      })
      .catch((error) => {
        console.error('[App] Service Worker registration failed:', error);
      });
  });
}

// ฟังก์ชันสำหรับแสดงการแจ้งเตือนการอัปเดต
function showUpdateNotification() {
  // สร้างองค์ประกอบการแจ้งเตือนแบบกำหนดเอง
  const notificationDiv = document.createElement('div');
  notificationDiv.id = 'updateNotification';
  notificationDiv.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-md shadow-lg transform transition-transform duration-300 translate-y-full z-50';
  notificationDiv.innerHTML = `
    <div class="flex items-center">
      <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p>มีเวอร์ชันใหม่พร้อมใช้งาน! กำลังอัปเดต...</p>
    </div>
  `;
  document.body.appendChild(notificationDiv);

  // แสดงการแจ้งเตือน
  setTimeout(() => {
    notificationDiv.classList.remove('translate-y-full');
  }, 100); // ให้เวลาสำหรับการเรนเดอร์ก่อนที่จะเริ่มการเปลี่ยนผ่าน

  // รอสักครู่แล้วโหลดหน้าใหม่
  setTimeout(() => {
    // ส่งข้อความไปยัง Service Worker เพื่อข้ามสถานะ waiting
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    // โหลดหน้าใหม่
    window.location.reload(true);
  }, 3000); // 3 วินาที
}
