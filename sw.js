const CACHE_NAME = 'lunar-app-v5';

// Archivos estáticos principales
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  // Fuerza al Service Worker a activarse de inmediato
  self.skipWaiting(); 
});

self.addEventListener('activate', event => {
  // Elimina cachés viejas para que la app se actualice
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Excluimos la API del clima para que no guarde un pronóstico viejo
  if (event.request.url.includes('open-meteo')) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 1. Devuelve la versión en caché si existe
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 2. Si no está en caché, la descarga de internet y la guarda dinámicamente
      return fetch(event.request).then(networkResponse => {
        // Asegurarse de que la respuesta es válida antes de guardarla
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(error => {
        // Ocurre si falla la red y el archivo no estaba en caché
        console.log('Recurso no disponible offline:', event.request.url);
      });
    })
  );
});
