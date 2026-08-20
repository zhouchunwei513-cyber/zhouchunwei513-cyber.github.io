// 小秘 PWA Service Worker
// 缓存策略：index.html + manifest + 图标 -> cache-first（保证离线可用）
// 其他静态资源 -> stale-while-revalidate

const CACHE_VERSION = 'xiaomi-v1';
const CORE_ASSETS = [
  '/',
  '/?utm_source=pwa',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-192.png',
  '/icons/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // 不同源（CDN/字体/图片外链）放行，不缓存
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        // 后台刷新缓存（stale-while-revalidate）
        fetch(req).then((res) => {
          if (res && res.ok) {
            caches.open(CACHE_VERSION).then((c) => c.put(req, res.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, clone));
        }
        return res;
      }).catch(() => caches.match('/'));
    })
  );
});