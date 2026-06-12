const CACHE_NAME = 'lunar-app-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Lora:ital,wght=0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve la versión en caché si existe, sino busca en internet
        return response || fetch(event.request);
      }).catch(() => {
        // Si todo falla (ej. buscando el clima offline), no rompe la app
        return new Response('Offline');
      })
  );
});