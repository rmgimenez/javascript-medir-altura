// Versão é lida de ?v=AAAA-MM-DD ou cai para data de build.
// Para forçar atualização, edite BUILD_VERSION abaixo e faça deploy.
var BUILD_VERSION = '2026-06-23';
var CACHE = 'medir-altura-' + BUILD_VERSION;

var URLS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/app.js',
  './js/state.js',
  './js/camera.js',
  './js/overlay.js',
  './js/measurement.js',
  './js/calibration.js',
  './js/storage.js',
  './js/gallery.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(URLS);
    }).then(function () {
      // Força o SW novo a assumir controle sem esperar o usuário fechar todas as abas.
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        // Remove qualquer cache que não seja o atual
        if (k !== CACHE) return caches.delete(k);
        return null;
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  // Só intercepta GET do mesmo origem
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) {
        // Cache-first com revalidação em background: serve rápido e atualiza depois.
        var networkUpdate = fetch(req).then(function (response) {
          if (response && response.ok) {
            var copy = response.clone();
            caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
          }
        }).catch(function () { /* offline, ok */ });
        // Não bloqueia a resposta no update
        if (typeof networkUpdate.then === 'function') {
          networkUpdate.catch(function () {});
        }
        return cached;
      }
      // Não está em cache: tenta rede e adiciona ao cache se ok
      return fetch(req).then(function (response) {
        if (response && response.ok) {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
        }
        return response;
      }).catch(function () {
        // Fallback para navegação offline
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
