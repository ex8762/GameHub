const CACHE_NAME = 'game-cache-v3';
const OFFLINE_PAGE = '/offline.html';

// 更新快取策略配置
const CACHE_STRATEGY = {
    images: 'cache-first',
    styles: 'cache-first',
    scripts: 'network-first',
    pages: 'network-first',
    api: 'network-only',
    sounds: 'cache-first'
};

// 預快取資源列表
const PRE_CACHE_URLS = [
    '/',
    OFFLINE_PAGE,
    '/index.html',
    '/assets/css/styles.css',
    '/assets/css/notification.css',
    '/assets/js/main.js',
    '/assets/js/error-handler.js',
    '/assets/js/notification.js',
    '/assets/sounds/success-sound.mp3',
    '/assets/sounds/warning-sound.mp3',
    '/assets/sounds/error-sound.mp3'
];

// 快取存活時間(毫秒)
const CACHE_TTL = {
    images: 7 * 24 * 60 * 60 * 1000,  // 7天
    styles: 24 * 60 * 60 * 1000,      // 1天
    scripts: 12 * 60 * 60 * 1000,     // 12小時
    sounds: 7 * 24 * 60 * 60 * 1000,  // 7天
    api: 5 * 60 * 1000                // 5分鐘
};

// 資源類型判斷
function getResourceType(url) {
    const ext = url.pathname.split('.').pop().toLowerCase();
    const path = url.pathname;
    
    if (path.startsWith('/api/')) return 'api';
    if (path === '/' || path.endsWith('.html')) return 'pages';
    
    switch (ext) {
        case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': case 'webp':
            return 'images';
        case 'css':
            return 'styles';
        case 'js':
            return 'scripts';
        case 'mp3': case 'wav': case 'ogg':
            return 'sounds';
        default:
            return 'other';
    }
}

// 資源載入重試機制
async function fetchWithRetry(request, maxRetries = 3) {
    let lastError;
    const url = new URL(request.url);
    const resourceType = getResourceType(url);
    const strategy = CACHE_STRATEGY[resourceType] || 'network-first';
    
    // 快取優先策略
    if (strategy === 'cache-first') {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
    }
    
    // 網路請求（帶重試）
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(request.clone());
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // 快取回應（除了 api 請求）
            if (resourceType !== 'api') {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, response.clone());
            }
            
            return response;
        } catch (error) {
            console.warn(`Retry ${i + 1}/${maxRetries} failed for ${request.url}:`, error);
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }
    }
    
    // 如果所有重試都失敗，檢查快取
    if (strategy !== 'network-only') {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
        
        // 如果是導航請求，返回離線頁面
        if (request.mode === 'navigate') {
            const offlinePage = await cache.match(OFFLINE_PAGE);
            if (offlinePage) return offlinePage;
        }
    }
    
    throw lastError;
}

// Service Worker 事件處理
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRE_CACHE_URLS))
            .then(() => self.skipWaiting())
            .catch(error => console.error('預快取失敗:', error))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith(self.location.origin)) return;
    
    event.respondWith(
        fetchWithRetry(event.request)
            .catch(error => {
                console.error('請求失敗:', error);
                return caches.match(OFFLINE_PAGE);
            })
    );
});

// 定期清理過期快取
async function cleanupCache() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        const now = Date.now();
        
        for (const request of requests) {
            const response = await cache.match(request);
            const resourceType = getResourceType(new URL(request.url));
            const maxAge = CACHE_TTL[resourceType] || CACHE_TTL.scripts;
            
            const headers = new Headers(response.headers);
            const cachedTime = headers.get('date') 
                ? new Date(headers.get('date')).getTime()
                : now;
            
            if (now - cachedTime > maxAge) {
                await cache.delete(request);
            }
        }
    } catch (error) {
        console.error('快取清理失敗:', error);
    }
}

// 每6小時執行一次快取清理
setInterval(cleanupCache, 6 * 60 * 60 * 1000);

// 初始清理
cleanupCache();