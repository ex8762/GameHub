const CACHE_NAME = 'game-site-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './admin.html',
    './manifest.json',
    './assets/css/styles.css',
    './assets/js/main.js',
    './assets/js/admin.js',
    './assets/images/icon-192x192.png',
    './assets/images/icon-512x512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                })
                .catch(() => {
                    // 離線時返回離線頁面
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                .filter((name) => name !== CACHE_NAME)
                .map((name) => caches.delete(name))
            );
        })
    );
});