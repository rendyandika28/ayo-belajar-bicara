const CACHE_NAME = "web-adek-v3";

const APP_SHELL = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
];

// Install: pre-cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET over http(s); chrome-extension:// etc. cannot be cached
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // Navigation requests: network-first, fall back to cached /offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/offline"))
        )
    );
    return;
  }

  // Static assets (Next.js, fonts, icons): cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }

  // Generated assets on Cloudflare R2 (pictures, recorded voice): immutable, cache-first
  // so pictures and sounds already seen keep working offline. Skip partial (206) media responses.
  // Range requests (<audio> fallback) go straight to the network: caches.match ignores Range
  // and would answer a full 200, which Safari's media loader rejects.
  if ((url.hostname === "media.rdydika.dev" || url.hostname.endsWith(".r2.dev")) && !request.headers.has("range")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.status !== 206 && (response.ok || response.type === "opaque")) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      ).catch(() => Response.error()) // blocked/offline: fail quietly, the app falls back to emoji/TTS
    );
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || Response.error()))
  );
});
