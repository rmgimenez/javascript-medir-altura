var CACHE = 'medir-altura-v1';
var URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/js/app.js',
  '/js/state.js',
  '/js/camera.js',
  '/js/overlay.js',
  '/js/measurement.js',
  '/js/calibration.js',
  '/js/storage.js',
  '/js/gallery.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(URLS);
    })
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(e.request).then(function (response) {
        return response || fetch(e.request);
      });
    })
  );
});
