const FILES_TO_CACHE = [
    "/index.html",
    "/index.js",
    "/styles.css",
    "/db.js"
];

const STATIC_CACHE = "static-cache";
const RUNTIME = "runtime-cache";

self.addEventListener("install", (event) => {
    event.waitUntil(
       caches
        .open(STATIC_CACHE)
        .then((cache) => cache.addAll(FILES_TO_CACHE) 
    ).then(self.skipWaiting())
    );

});
//Activate Handler
self.addEventListener("activate", (event) => {
    const currentCaches = [STATIC_CACHE, RUNTIME];
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) => {
                return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
            }).then((cachesToDelete) => {
                return Promise.all(cachesToDelete.map((cacheToDelete) => {
                    return caches.delete(cacheToDelete);
                
            })
    );
}).then(() => self.clients.claim())
    );
});
//Fetch cached data
self.addEventListener("fetch", (event) => {
    if (
        event.request.method !== "GET" ||
        !event.request.url.startsWith(self.location.origin)
    ){
        event.respondWith(event.request);
        return;
    }

    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(RUNTIME).then(cache => {
                return fetch(event.request).then(response => {
                    cache.put(event.request, response.clone());
                    return response;
                })
                .catch(() => caches.match(event.request));
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return caches.open(RUNTIME).then(cache => {
                return fetch(event.request).then(response => {
                    return cache.put(event.request, response.clone()).then(() => {
                        return response;
                    });
                });
            });
        })
    );
});