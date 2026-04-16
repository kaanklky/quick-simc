const CACHE_VERSION = "v3";
const SHELL_CACHE = `quick-simc-shell-${CACHE_VERSION}`;
const WASM_CACHE = `quick-simc-wasm-${CACHE_VERSION}`;

const SHELL_ASSETS = [
  "/index.html",
  "/assets/css/styles.css",
  "/assets/js/app.js",
  "/assets/js/sim-worker.js",
];

const WASM_ASSETS = [
  "/assets/wasm/simc.js",
  "/assets/wasm/simc.wasm",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      await shell.addAll(SHELL_ASSETS);
      const wasm = await caches.open(WASM_CACHE);
      await Promise.all(
        WASM_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "no-cache" });
            if (res.ok) await wasm.put(url, res.clone());
          } catch {}
        })
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== WASM_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

function isWasmAsset(url) {
  return url.pathname.startsWith("/assets/wasm/");
}

function isShellAsset(url) {
  if (url.pathname === "/" || url.pathname === "/index.html") return true;
  if (url.pathname.startsWith("/assets/") && !isWasmAsset(url)) return true;
  return false;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (isWasmAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(WASM_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })()
    );
    return;
  }

  if (isShellAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const cached = await cache.match(req);
        const networkPromise = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })()
    );
  }
});
