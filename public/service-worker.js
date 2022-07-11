const FILES_TO_CACHE = [
    "./index.html",
    "./js/index.js",
    "./css/styles.css",
  "./service-worker.js"
];

const APP_PREFIX = "BudgetTracker-";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const DATA_CACHE_NAME = "data-cache-" + VERSION;

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

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("deleting cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', function (e) {
  console.log('fetch request : ' + e.request.url)
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(e.request).then(response => {
          if (response.status === 200) {
            cache.put(e.request.url, response.clone());
          }
        
          return response;

        })
          .catch(err => {
            return cache.match(e.request)
          })
      })
    )
  }
    // caches.match(e.request).then(function (request) {
    //   if (request) {
    //     console.log(' responding with cache: ' + e.request.url);
    //     return request;
    //   } else {
    //     console.log('file is not cached, fetching : ' + e.request.url)
    //     return fetch(e.request)
    //   }

    // })
});
