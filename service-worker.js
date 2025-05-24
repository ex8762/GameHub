const CACHE_NAME = 'game-cache-v1';
const OFFLINE_PAGE = '/offline.html';
const CACHE_STRATEGY = {
    images: 'cache-first',
    styles: 'cache-first',
    scripts: 'network-first',
    pages: 'network-first',
    api: 'network-only'
};

// 預快取資源列表
const PRE_CACHE_URLS = [
    '/',
    OFFLINE_PAGE,
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/main.js',
    '/assets/js/error-handler.js'
];

// 快取存活時間(毫秒)
const CACHE_TTL = {
    images: 7 * 24 * 60 * 60 * 1000,  // 7天
    styles: 24 * 60 * 60 * 1000,      // 1天
    scripts: 12 * 60 * 60 * 1000,     // 12小時
    api: 5 * 60 * 1000                // 5分鐘
};

// 安裝事件 - 預快取重要資源
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(PRE_CACHE_URLS);
            })
            .catch(error => {
                console.error('預快取失敗:', error);
            })
    );
});

// 判斷資源類型
function getResourceType(url) {
    const path = new URL(url).pathname;
    if (path.match(/\.(jpg|jpeg|png|gif|svg)$/)) return 'images';
    if (path.match(/\.css$/)) return 'styles';
    if (path.match(/\.js$/)) return 'scripts';
    if (path.match(/\/api\//)) return 'api';
    return 'pages';
}

// 檢查快取是否過期
async function isCacheExpired(response, type) {
    if (!response || !response.headers) return true;
    
    const cachedDate = response.headers.get('date');
    if (!cachedDate) return true;
    
    const age = Date.now() - new Date(cachedDate).getTime();
    return age > CACHE_TTL[type];
}

// 網路請求策略
async function handleFetch(request) {
    const resourceType = getResourceType(request.url);
    const strategy = CACHE_STRATEGY[resourceType];
    
    try {
        switch (strategy) {
            case 'cache-first':
                return await handleCacheFirst(request, resourceType);
            case 'network-first':
                return await handleNetworkFirst(request, resourceType);
            case 'network-only':
                return await handleNetworkOnly(request);
            default:
                return await handleNetworkFirst(request, resourceType);
        }
    } catch (error) {
        console.error(`請求處理失敗: ${request.url}`, error);
        
        // 如果是頁面請求,返回離線頁面
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_PAGE);
        }
        
        throw error;
    }
}

// Cache-First 策略
async function handleCacheFirst(request, resourceType) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !(await isCacheExpired(cachedResponse, resourceType))) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        await cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        return cachedResponse || error;
    }
}

// Network-First 策略
async function handleNetworkFirst(request, resourceType) {
    try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, networkResponse.clone());
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse && !(await isCacheExpired(cachedResponse, resourceType))) {
            return cachedResponse;
        }
        throw error;
    }
}

// Network-Only 策略
async function handleNetworkOnly(request) {
    return fetch(request);
}

// 監聽 fetch 事件
self.addEventListener('fetch', event => {
    event.respondWith(handleFetch(event.request));
});