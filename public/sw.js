const CACHE_NAME = 'elimu360-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/pwa-icon.svg',
  '/manifest.json',
  '/elimu_notifications_pool.json'
];

// Install: Cache core static assets including offline notifications pool
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

// Activate: Clean up older caches & claim clients
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
  // Start autonomous background loop
  initBackgroundAutonomousLoop();
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
        return new Response('/* offline third-party fallback */', {
          headers: { 'Content-Type': 'application/javascript' }
        });
      })
    );
    return;
  }

  // App shell & static assets: Stale-While-Revalidate with full offline fallback
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
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// ==============================================================
// ELIMU SMART NOTIFICATION SYSTEM: AUTONOMOUS OFFLINE ENGINE
// Hundreds of cached smart notifications sent regularly to lock screen
// even when offline or before user opens browser!
// ==============================================================

let cachedTeacherProfile = {
  teacherName: "Mwarimu w'Umwuga",
  schoolName: "",
  streak: 3
};

let lastDispatchedHour = -1;

// Load notification pool from cache
async function getOfflineNotificationPool() {
  try {
    const cachedResponse = await caches.match('/elimu_notifications_pool.json');
    if (cachedResponse) {
      return await cachedResponse.json();
    }
    const netResponse = await fetch('/elimu_notifications_pool.json');
    if (netResponse.ok) {
      const data = await netResponse.json();
      const cache = await caches.open(CACHE_NAME);
      cache.put('/elimu_notifications_pool.json', new Response(JSON.stringify(data)));
      return data;
    }
  } catch (e) {
    console.warn('[SW] Could not load pool from network/cache:', e);
  }
  return [];
}

// Dispatches an autonomous smart notification from the cached pool of 240+ items
async function dispatchNextSmartOfflineNotification() {
  const now = new Date();
  const currentHour = now.getHours();

  // Don't disturb during sleeping hours (11:00 PM to 06:00 AM)
  if (currentHour >= 23 || currentHour < 6) {
    return;
  }

  // Prevent duplicate bursts in the same 40-minute window
  if (lastDispatchedHour === currentHour) {
    return;
  }
  lastDispatchedHour = currentHour;

  const pool = await getOfflineNotificationPool();
  if (!pool || pool.length === 0) return;

  // Filter or match appropriate time window
  let windowKey = 'anytime';
  if (currentHour >= 6 && currentHour < 9) windowKey = 'morning';
  else if (currentHour >= 9 && currentHour < 12) windowKey = 'mid_morning';
  else if (currentHour >= 12 && currentHour < 14) windowKey = 'noon';
  else if (currentHour >= 14 && currentHour < 18) windowKey = 'afternoon';
  else if (currentHour >= 18 && currentHour < 21) windowKey = 'evening';
  else if (currentHour >= 21) windowKey = 'night';

  const candidates = pool.filter(item => item.timeWindow === windowKey || item.timeWindow === 'anytime');
  const chosen = candidates.length > 0 
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : pool[Math.floor(Math.random() * pool.length)];

  if (!chosen) return;

  const name = cachedTeacherProfile.teacherName || "Mwarimu w'Umwuga";
  const school = cachedTeacherProfile.schoolName ? `mu kigo cya ${cachedTeacherProfile.schoolName}` : "mu ishuri";
  const streak = cachedTeacherProfile.streak || 3;

  const title = chosen.title.replace(/{name}/g, name).replace(/{school}/g, school).replace(/{streak}/g, streak.toString());
  const body = chosen.body.replace(/{name}/g, name).replace(/{school}/g, school).replace(/{streak}/g, streak.toString());

  const options = {
    body,
    icon: '/pwa-icon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    tag: 'elimu-auto-' + Date.now(),
    renotify: true,
    data: {
      url: `/?tab=${chosen.tab || 'generator'}`,
      tab: chosen.tab || 'generator'
    },
    actions: [
      { action: 'open_app', title: 'Fungura Elimu360 🚀' }
    ]
  };

  await self.registration.showNotification(title, options);
}

// Background autonomous timer loop (runs periodically while service worker process is active)
function initBackgroundAutonomousLoop() {
  // Check every 35 minutes
  setInterval(() => {
    dispatchNextSmartOfflineNotification().catch(err => console.warn('[SW Auto]', err));
  }, 35 * 60 * 1000);
}

// Listen for Periodic Background Sync (standard PWA background alarm API supported on Chromium/Android)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'elimu-smart-notifications' || event.tag === 'elimu-daily-reminders') {
    event.waitUntil(dispatchNextSmartOfflineNotification());
  }
});

// Listen for One-Shot Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'elimu-sync-notifications') {
    event.waitUntil(dispatchNextSmartOfflineNotification());
  }
});

// Handle messages from client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SYNC_TEACHER_PROFILE') {
    if (event.data.profile) {
      cachedTeacherProfile = { ...cachedTeacherProfile, ...event.data.profile };
    }
  } else if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      icon: '/pwa-icon.svg',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: false,
      renotify: true,
      tag: options?.tag || 'elimu-smart-' + Date.now(),
      data: options?.data || { url: '/', tab: 'generator' },
      actions: options?.actions || [
        { action: 'open_plan', title: 'Tegura Lesson Plan 📝' },
        { action: 'open_reb', title: 'Ibitabo bya REB 📚' }
      ],
      ...options
    };

    self.registration.showNotification(title || 'Elimu Smart Assistant 🔔', notificationOptions);
  } else if (event.data.type === 'TRIGGER_OFFLINE_CYCLE') {
    dispatchNextSmartOfflineNotification();
  }
});

// Handle push events (if Web Push server is wired)
self.addEventListener('push', (event) => {
  let data = { title: 'Elimu Smart Assistant 🔔', body: 'Tegura Lesson Plan n’ibitabo byawe ubu!', tab: 'generator' };
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
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_TAB',
            tab: targetTab
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});


