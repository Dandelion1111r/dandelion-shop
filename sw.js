const CACHE = 'dandelion-v6';
const CACHE_FIRST = [
  '/',
  '/styles.css',
  '/main.js',
  '/product-page.css',
  '/fa-subset.min.css',
  '/Dandelionlogo-fixed.webp',
  '/manifest.json',
  '/teddybaer-geschenkballon-rot.webp',
  '/feen-blumenbox.webp',
  '/ballon-box-boho-blau-gold.webp',
  '/ballon-box-dark-chrome-schwarz-gold.webp'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CACHE_FIRST).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  const isVersioned = /[?&]v=/.test(url.search);
  const isFont = /\.(woff2?|ttf|eot)$/.test(url.pathname);
  const isImage = /\.(webp|jpg|jpeg|png|svg|gif|ico)$/.test(url.pathname);
  const isScript = /\.(js|css)$/.test(url.pathname);

  if (isVersioned || isFont || isImage || isScript) {
    // Cache-first for versioned/static assets
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        });
      })
    );
  } else {
    // Network-first for HTML pages
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
