const FILES_TO_CACHE = [
    "./index.html",
    "./js/index.js",
    "./css/styles.css",
  "./service-worker.js"
];

const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

// Install the service worker
self.addEventListener('install', function(evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Your files were pre-cached successfully!');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Activate the service worker and remove old data from the cache
self.addEventListener('activate', function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== CACHE_NAME) {
            console.log('Removing old cache data', key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)

  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        console.log(' responding with cache: ' + e.request.url);
        return request;
      } else {
        console.log('file is not cached, fetching : ' + e.request.url)
        return fetch(e.request)
      }

    })

  )
});
