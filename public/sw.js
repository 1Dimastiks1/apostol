// Службовий файл: сайт відкривається й без інтернету. Нічого приватного не кешується:
// ні /api, ні адмінка, ні будь-які не-GET запити.
const VERSION = 'v1';
const STATIC = `parish-static-${VERSION}`;
const PAGES = `parish-pages-${VERSION}`;
const BASE = new URL('./', self.location).pathname; // '/' або '/apostol/'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((cache) => cache.addAll([BASE, `${BASE}offline.html`])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![STATIC, PAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isPrivate = (url) => url.pathname.includes('/api/') || url.pathname.includes('/.private-data');

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isPrivate(url)) return; // чужі адреси й API: завжди напряму в мережу

  // Відкриття сторінок: спершу мережа (свіжа версія), без інтернету: збережена головна
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && url.pathname === BASE) caches.open(PAGES).then((cache) => cache.put(BASE, res.clone()));
          return res;
        })
        .catch(async () => (url.pathname === BASE && (await caches.match(BASE))) || (await caches.match(`${BASE}offline.html`))),
    );
    return;
  }

  // Скрипти, стилі, шрифти, картинки: з кешу, а свіжа версія оновлюється у фоні
  if (['script', 'style', 'font', 'image'].includes(request.destination)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const cached = await cache.match(request);
        const fresh = fetch(request).then((res) => { if (res.ok) cache.put(request, res.clone()); return res; }).catch(() => cached);
        return cached || fresh;
      }),
    );
  }
});
