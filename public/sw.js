
self.addEventListener('push', function(event) {
  console.log('Push received:', event);
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/',
      entityType: data.entityType,
      entityId: data.entityId
    },
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'פתח'
      },
      {
        action: 'dismiss',
        title: 'סגור'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  const url = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event);
});

// הרשמה אוטומטית ל-Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});
