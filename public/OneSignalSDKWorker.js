// Edarah — combined service worker.
// 1) OneSignal Web SDK v16 (push) — must be imported first so its push /
//    notificationclick handlers register.
// 2) A lightweight offline cache so the CRM is installable & works offline.
// One worker at root scope avoids the dual-service-worker conflict you'd get
// from registering OneSignal + a separate PWA worker.

importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE = "edarah-shell-v1";
const PRECACHE = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/brand/logo-official.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only handle same-origin requests; never touch Firebase / OneSignal / CDNs.
  if (url.origin !== self.location.origin) return;
  // Never cache API or auth traffic.
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network-first, fall back to the offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match("/offline.html")) || Response.error();
        }
      })(),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  if (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icons") ||
    url.pathname.startsWith("/brand") ||
    /\.(png|jpe?g|svg|webp|gif|woff2?|css|js)$/.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })(),
    );
  }
});
