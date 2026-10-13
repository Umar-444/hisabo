const CACHE_NAME = "hisabo-shell-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install: Cache offline shell and core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older cache versions
self.addEventListener("activate", (event) => {
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

// Fetch: Network-first for navigation, falling back to /offline.html
// Financial Rule: NEVER cache /api/* financial requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // Never cache API or backend responses
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // HTML page navigations
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match(OFFLINE_URL);
        return cachedOffline || new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // Static assets (Next.js bundles, images, icons): Stale-while-revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// Web Push Handler (TASK-10)
self.addEventListener("push", (event) => {
  let data = {
    title: "Hisabo Notification",
    body: "You have a new shared balance update.",
    url: "/dashboard",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/dashboard",
    },
    actions: [
      { action: "open", title: "View Details" },
      { action: "close", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click Handler (Deep Linking)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
