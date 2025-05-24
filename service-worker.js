const CACHE_NAME = 'game-cache-v1';
const OFFLINE_PAGE = '/offline.html';
const CACHE_STRATEGY = {
    images: 'cache-first',
    styles: 'cache-first',
    scripts: 'network-first',
    pages: 'network-first',
    api: 'network-only'
};

// 更新快取資源列表，包含音效檔案
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
    api: 5 * 60 * 1000                // 5分鐘
};

// 資源載入重試機制
async function fetchWithRetry(request, maxRetries = 3) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(request);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
        } catch (error) {
            lastError = error;
            // 等待一段時間後重試
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
    
    // 如果是導航請求，返回離線頁面
    if (request.mode === 'navigate') {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(OFFLINE_PAGE);
    }
    
    throw lastError;
}

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

// 快取優先策略
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) return cached;
    
    try {
        const response = await fetchWithRetry(request);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        // 如果是圖片，返回預設圖片
        if (request.destination === 'image') {
            return cache.match('/assets/images/placeholder.svg');
        }
        throw error;
    }
}

// 網路優先策略
async function networkFirst(request) {
    try {
        const response = await fetchWithRetry(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        
        // 如果是導航請求，返回離線頁面
        if (request.mode === 'navigate') {
            const cache = await caches.open(CACHE_NAME);
            return cache.match(OFFLINE_PAGE);
        }
        
        throw error;
    }
}

// 網路請求策略
async function handleFetch(request) {
    const resourceType = getResourceType(request.url);
    const strategy = CACHE_STRATEGY[resourceType];
    
    try {
        switch (strategy) {
            case 'cache-first':
                return await cacheFirst(request, resourceType);
            case 'network-first':
                return await networkFirst(request, resourceType);
            case 'network-only':
                return await handleNetworkOnly(request);
            default:
                return await networkFirst(request, resourceType);
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

// Network-Only 策略
async function handleNetworkOnly(request) {
    return fetch(request);
}

// 監聽 fetch 事件
self.addEventListener('fetch', event => {
    event.respondWith(handleFetch(event.request));
});