const CACHE_NAME = 'info-holder-cache-v3';

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(['/', '/index.html']);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('script.google.com')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                fetch(event.request).then(response => {
                    // Google Drive image er jonno status === 0 support add kora hoyeche
                    if (response && (response.status === 200 || response.status === 0)) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            return fetch(event.request).then((response) => {
                // Ekhaneo status === 0 add kora hoyeche
                if (response && (response.status === 200 || response.status === 0)) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                }
                return response;
            }).catch(() => {
                if (event.request.destination === 'image') {
                    return new Response('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23eee"/><text x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" alignment-baseline="middle">Offline</text></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
                }
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
