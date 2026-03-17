const CACHE_NAME = 'info-holder-cache-v2';

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
    // Google Apps Script er data/OTP API call gulo cache korbe na
    if (event.request.url.includes('script.google.com')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Cache theke data pele seta dibe ebong background e update korbe
            if (cachedResponse) {
                fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
                    }
                }).catch(() => {});
                return cachedResponse;
            }
            
            // Notun kisu hole net theke ene cache korbe
            return fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                }
                return response;
            }).catch(() => {
                // Internet na thakle ebong cache na pele offline image dekhabe
                if (event.request.destination === 'image') {
                    return new Response('<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="100" height="100"><rect width="100" height="100" fill="%23eee"/><text x="50" y="50" font-family="Arial" font-size="12" text-anchor="middle" alignment-baseline="middle">Offline</text></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
                }
                // HTML file na pele index.html return korbe
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
