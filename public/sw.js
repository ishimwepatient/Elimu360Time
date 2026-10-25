const CACHE_NAME = 'elimu360-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/pwa-icon.svg',
  '/manifest.json'
];

// Install: Cache core static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-caching partial warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first for dynamic content, stale-while-revalidate for assets, offline fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests or browser-extension schemes
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Let third-party external scripts and APIs attempt network first
  if (request.url.includes('google') || request.url.includes('bellnewyork') || request.url.includes('accountut')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return empty mock if completely offline
        return new Response('/* offline third-party fallback */', {
          headers: { 'Content-Type': 'application/javascript' }
        });
      })
    );
    return;
  }

  // App shell & static assets: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network failed and we have no cached item, fallback to index.html for navigation
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// ==========================================
// DUOLINGO / PHOENIX LOCK SCREEN NOTIFICATIONS
// ==========================================

// Handle messages from client to display native lock screen notifications
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      icon: '/pwa-icon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: false,
      renotify: true,
      tag: options?.tag || 'elimu-reminder-' + Date.now(),
      data: options?.data || { url: '/', tab: 'generator' },
      actions: options?.actions || [
        { action: 'open_plan', title: 'Tegura Lesson Plan 📝' },
        { action: 'open_reb', title: 'Ibitabo bya REB 📚' }
      ],
      ...options
    };

    self.registration.showNotification(title || 'Elimu360 Teacher Reminder 🔔', notificationOptions);
  } else if (event.data.type === 'SCHEDULE_LOCKSCREEN_NOTIFICATION') {
    const { title, options, delayMs } = event.data;
    setTimeout(() => {
      const notificationOptions = {
        icon: '/pwa-icon.svg',
        badge: '/favicon.svg',
        vibrate: [300, 150, 300, 150, 300],
        requireInteraction: true,
        renotify: true,
        tag: options?.tag || 'elimu-scheduled-' + Date.now(),
        data: options?.data || { url: '/', tab: 'generator' },
        actions: options?.actions || [
          { action: 'open_plan', title: 'Fungura Elimu360 🚀' }
        ],
        ...options
      };
      self.registration.showNotification(title || 'Mwarimu, Ubutumwa bwa Lock Screen 📱', notificationOptions);
    }, delayMs || 3000);
  }
});

// Handle push events (if Web Push is triggered)
self.addEventListener('push', (event) => {
  let data = { title: 'Elimu360 Daily Reminder 🔔', body: 'Tegura Lesson Plan n’ibitabo byawe ubu!', tab: 'generator' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/pwa-icon.svg',
    badge: '/favicon.svg',
    vibrate: [250, 100, 250, 100, 250],
    tag: data.tag || 'elimu-push-reminder',
    renotify: true,
    data: {
      url: data.url || `/?tab=${data.tab || 'generator'}`,
      tab: data.tab || 'generator'
    },
    actions: [
      { action: 'open_now', title: 'Fungura Ubu 🚀' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle clicks on notification and lock screen action buttons
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetTab = event.notification.data?.tab || 'generator';
  const targetUrl = event.notification.data?.url || `/?tab=${targetTab}`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and post a message to switch tab
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TAB',
            tab: targetTab
          });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

