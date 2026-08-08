/* WORK / Archive Service Worker
   策略：
   - 安装期预缓存「应用壳」+ 离线兜底页 + 图标
   - 导航请求：network-first（优先拿最新页面，网络失败时使用缓存）
   - 同源静态资源：stale-while-revalidate
   - 收藏页（?saved=1 / /favorites）：额外缓存正文，支持离线阅读
   - 跨域（字体/图片）：passthrough，缓存字体以提升二次加载
*/
const VERSION = "wa-v4";
const SHELL = [
  "/",
  "/desk",
  "/signals",
  "/cases",
  "/companies",
  "/podcasts",
  "/english",
  "/collections",
  "/favorites",
  "/offline",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
  // 收藏的文章正文：主动缓存以便离线阅读
  // 兼容两种消息：CACHE_PAGE（单条 url）与 CACHE_PAGES（urls 数组）
  if (event.data && event.data.type === "CACHE_PAGE" && event.data.url) {
    event.waitUntil(
      caches.open(VERSION).then((c) => c.add(event.data.url).catch(() => {}))
    );
  }
  if (event.data && event.data.type === "CACHE_PAGES" && Array.isArray(event.data.urls)) {
    event.waitUntil(
      caches.open(VERSION).then((c) =>
        Promise.all(event.data.urls.map((u) => c.add(u).catch(() => {})))
      )
    );
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    // 字体跨域：缓存以提升二次加载
    if (url.hostname.includes("fonts.gstatic.com") || url.hostname.includes("fonts.googleapis.com")) {
      event.respondWith(
        caches.match(req).then((cached) => {
          const network = fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
            return res;
          }).catch(() => cached);
          return cached || network;
        })
      );
    }
    return;
  }

  // 导航：优先请求最新页面，离线时再回退到缓存
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (!res.ok) throw new Error(`Navigation failed: ${res.status}`);
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || caches.match("/offline"))
    );
    return;
  }

  // 静态资源：stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
