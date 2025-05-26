const CACHE_NAME = 'game-cache-v5';
const OFFLINE_PAGE = './offline.html';

// 更新快取策略配置
const CACHE_STRATEGY = {
    images: 'cache-first',
    styles: 'cache-first',
    scripts: 'network-first',
    pages: 'network-first',
    api: 'network-only',
    sounds: 'cache-first'
};

// 預快取資源列表 - 只包含確實存在的文件
const PRE_CACHE_URLS = [
    './',
    './offline.html',
    './index.html',
    './assets/css/styles.css'
    // 移除可能不存在的資源，減少錯誤
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
async function fetchWithRetry(request, maxRetries = 1) {
    const url = new URL(request.url);
    const resourceType = getResourceType(url);
    const strategy = CACHE_STRATEGY[resourceType] || 'network-first';
    
    // 先嘗試從快取獲取
    const cache = await caches.open(CACHE_NAME);
    
    if (strategy === 'cache-first') {
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
    }

    // 嘗試網路請求
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(request.clone());
            
            // 檢查回應是否有效
            if (response && response.status >= 200 && response.status < 400) {
                // 快取成功的回應（除了 API 請求）
                if (resourceType !== 'api' && response.status === 200) {
                    try {
                        await cache.put(request, response.clone());
                    } catch (cacheError) {
                        console.warn('快取儲存失敗:', cacheError);
                    }
                }
                return response;
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                // 指數退避延遲
                await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, i)));
            }
        }
    }

    // 網路請求失敗，嘗試從快取獲取
    if (strategy !== 'network-only') {
        const cached = await cache.match(request);
        if (cached) {
            return cached;
        }
    }

    // 如果是導航請求且沒有快取，返回離線頁面
    if (request.mode === 'navigate' || request.destination === 'document') {
        const offlinePage = await cache.match(OFFLINE_PAGE);
        if (offlinePage) {
            return offlinePage;
        }
    }

    // 所有嘗試都失敗
    throw lastError || new Error('Network request failed');
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
    // 只處理同源請求
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // 跳過某些特殊請求
    if (event.request.method !== 'GET' || 
        event.request.url.includes('chrome-extension://') ||
        event.request.url.includes('moz-extension://') ||
        event.request.url.includes('/sw.js') ||
        event.request.url.includes('/service-worker.js')) {
        return;
    }
    
    // 使用更簡單的響應處理方式減少錯誤
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            
            return fetch(event.request).then(response => {
                // 檢查回應是否有效
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                
                // 將回應保存到快取中
                let responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
                
                return response;
            }).catch(error => {
                console.warn('Service Worker 請求失敗:', event.request.url, error);
                
                // 如果是HTML頁面請求，返回離線頁面
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_PAGE);
                }
                
                // 返回簡單的錯誤響應
                return new Response('資源無法載入', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
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
