document.addEventListener('DOMContentLoaded', () => {
  // ตรวจสอบว่า Browser รองรับ Service Worker หรือไม่
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);

        // ตรวจจับการอัปเดตของ Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Service Worker ใหม่ถูกติดตั้งแล้ว และมี Service Worker เก่ากำลังทำงานอยู่
                // แสดงข้อความแจ้งเตือนผู้ใช้ว่ามีอัปเดต
                showUpdateNotification();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }

  // ฟังก์ชันสำหรับแสดงข้อความแจ้งเตือนการอัปเดต
  function showUpdateNotification() {
    // สร้าง div สำหรับข้อความแจ้งเตือน
    const notificationDiv = document.createElement('div');
    notificationDiv.id = 'pwa-update-notification';
    notificationDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #22c55e; /* green-500 */
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
    `;
    notificationDiv.innerHTML = `
      <span>มีเวอร์ชันใหม่พร้อมใช้งาน! กำลังโหลด...</span>
    `;
    document.body.appendChild(notificationDiv);

    // โหลดหน้าใหม่หลังจากหน่วงเวลาเล็กน้อยเพื่อให้ Service Worker ใหม่ทำงาน
    setTimeout(() => {
      window.location.reload();
    }, 2000); // หน่วงเวลา 2 วินาทีก่อนโหลดหน้าใหม่
  }
});
