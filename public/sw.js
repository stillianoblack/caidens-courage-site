/**
 * Minimal service worker — installability + web push display.
 * Network-first: no fetch caching. Purge legacy caches on activate after deploys.
 */
const SW_MESSAGE_SKIP_WAITING = 'SKIP_WAITING';

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === SW_MESSAGE_SKIP_WAITING) {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('push', (event) => {
  let payload = {
    title: "Caiden's Courage",
    body: '',
    url: '/family-hub/weekly-adventures',
    tag: 'caidens-courage-parent',
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    /* use defaults */
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      data: { url: payload.url },
      icon: '/logo192.png',
      badge: '/logo192.png',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/family-hub/weekly-adventures';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});
