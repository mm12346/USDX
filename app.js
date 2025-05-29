// ตรวจสอบว่าเบราว์เซอร์รองรับ Service Worker หรือไม่
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker: ลงทะเบียนสำเร็จ:', registration.scope);

        // ตรวจสอบการอัปเดต Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Service Worker ใหม่ถูกติดตั้งแล้วและพร้อมใช้งาน
                console.log('Service Worker: มีการอัปเดตใหม่พร้อมใช้งาน');
                showUpdateNotification(); // แสดงการแจ้งเตือน
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('Service Worker: การลงทะเบียนล้มเหลว:', error);
      });
  });
}

// ฟังก์ชันแสดงการแจ้งเตือนการอัปเดต
function showUpdateNotification() {
  const updateNotification = document.getElementById('updateNotification');
  if (updateNotification) {
    updateNotification.classList.remove('translate-y-full', 'hidden'); // แสดงการแจ้งเตือน
    updateNotification.classList.add('translate-y-0');

    const refreshButton = document.getElementById('refreshAppButton');
    if (refreshButton) {
      refreshButton.onclick = () => {
        // ส่งข้อความไปยัง Service Worker เพื่อข้าม waiting state
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload(); // โหลดหน้าเว็บใหม่
      };
    }
  }
}

// ซ่อนการแจ้งเตือนเมื่อคลิกปิด
document.addEventListener('DOMContentLoaded', () => {
  const closeUpdateNotificationButton = document.getElementById('closeUpdateNotification');
  if (closeUpdateNotificationButton) {
    closeUpdateNotificationButton.addEventListener('click', () => {
      const updateNotification = document.getElementById('updateNotification');
      if (updateNotification) {
        updateNotification.classList.remove('translate-y-0');
        updateNotification.classList.add('translate-y-full');
        setTimeout(() => {
          updateNotification.classList.add('hidden');
        }, 300); // ซ่อนหลังจาก transition
      }
    });
  }
});
