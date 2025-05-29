const CACHE_NAME = 'game-cache-v6';
const OFFLINE_PAGE = './offline.html';

// 版本控制 - 用於快取更新和管理
const APP_VERSION = '1.2.0';
const BUILD_TIMESTAMP = new Date().toISOString();

// 改進的快取策略配置
const CACHE_STRATEGY = {
    images: 'cache-first',     // 圖片優先使用快取
    styles: 'stale-while-revalidate',  // CSS使用更新後的策略
    scripts: 'network-first',  // JS優先從網路獲取
    pages: 'network-first',    // 頁面優先從網路獲取
    api: 'network-only',       // API請求始終從網路獲取
    sounds: 'cache-first',     // 音效優先使用快取
    fonts: 'cache-first',      // 字體優先使用快取
    other: 'network-first'     // 其他資源預設策略
};

// 核心資源列表 - 應用正常運行所必需的資源
const CORE_ASSETS = [
    './',
    './offline.html',
    './index.html',
    './assets/css/styles.css',
    './assets/css/rating-fix.css',
    './assets/js/simple-star-rating.js',
    './favicon.ico'
];

// 次要資源列表 - 在網路允許的情況下預載
const SECONDARY_ASSETS = [
    './assets/css/simple-rating.css',
    './manifest.json'
];

// 預快取資源列表 - 組合所有核心資源
const PRE_CACHE_URLS = [...CORE_ASSETS];

// 快取存活時間(毫秒) - 根據資源類型優化
const CACHE_TTL = {
    images: 14 * 24 * 60 * 60 * 1000, // 14天
    styles: 7 * 24 * 60 * 60 * 1000,  // 7天
    scripts: 24 * 60 * 60 * 1000,     // 24小時
    fonts: 30 * 24 * 60 * 60 * 1000,  // 30天
    sounds: 14 * 24 * 60 * 60 * 1000, // 14天
    api: 5 * 60 * 1000,               // 5分鐘
    other: 24 * 60 * 60 * 1000        // 24小時
};

/**
 * 精確判斷資源類型
 * @param {URL} url - 資源URL物件
 * @returns {string} 資源類型
 */
function getResourceType(url) {
    // 如果沒有有效的URL物件，返回預設類型
    if (!url || !url.pathname) return 'other';
    
    const path = url.pathname;
    const pathLower = path.toLowerCase();
    
    // API請求處理
    if (path.includes('/api/') || pathLower.includes('/graphql')) return 'api';
    
    // 頁面請求處理
    if (path === '/' || path === '/index.html' || pathLower.endsWith('.html') || 
        pathLower.endsWith('.htm') || path.indexOf('.') === -1) {
        return 'pages';
    }
    
    // 根據副檔名判斷
    const ext = pathLower.split('.').pop();
    
    // 圖片類型
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'avif', 'ico', 'bmp'].includes(ext)) {
        return 'images';
    }
    
    // 樣式表
    if (['css', 'scss', 'less'].includes(ext)) {
        return 'styles';
    }
    
    // 腳本
    if (['js', 'mjs', 'jsx', 'ts', 'tsx'].includes(ext)) {
        return 'scripts';
    }
    
    // 音效
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
        return 'sounds';
    }
    
    // 字體
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) {
        return 'fonts';
    }
    
    // 影片
    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
        return 'videos';
    }
    
    // 文件
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'json', 'xml'].includes(ext)) {
        return 'documents';
    }
    
    // 預設返回其他類型
    return 'other';
}

/**
 * 高級資源載入策略與重試機制
 * @param {Request} request - 原始的請求物件
 * @param {number} maxRetries - 最大重試次數
 * @returns {Promise<Response>} 回應物件
 */
async function fetchWithRetry(request, maxRetries = 2) {
    // 安全防護檢查
    if (!request || !request.url) {
        throw new Error('無效的請求物件');
    }
    
    // 解析請求資訊
    const url = new URL(request.url);
    const resourceType = getResourceType(url);
    const strategy = CACHE_STRATEGY[resourceType] || CACHE_STRATEGY.other || 'network-first';
    
    // 記錄請求情況用於診斷
    const requestInfo = {
        url: request.url,
        method: request.method,
        mode: request.mode,
        type: resourceType,
        strategy: strategy,
        timestamp: Date.now()
    };
    
    // 開啟快取
    const cache = await caches.open(CACHE_NAME);
    
    // 實作不同的快取策略
    try {
        switch (strategy) {
            case 'cache-only':
                // 僅使用快取，從不使用網路
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                throw new Error('快取中無法找到資源');
                
            case 'cache-first':
                // 優先從快取中獲取，如果沒有才從網路中獲取
                const cachedFirst = await cache.match(request);
                if (cachedFirst) {
                    // 後台偵測資源更新，但不等待結果
                    self.setTimeout(() => {
                        updateCache(request, resourceType).catch(err => 
                            console.warn('後台更新失敗:', err)
                        );
                    }, 1000);
                    return cachedFirst;
                }
                break; // 如果快取中沒有，則繼續從網路獲取
                
            case 'network-only':
                // 僅使用網路，即使快取中有資源也不使用
                const networkResponse = await fetchWithTimeout(request.clone(), 10000);
                if (networkResponse && networkResponse.status === 200) {
                    // 儲存API結果，但設定短的過期時間
                    if (resourceType === 'api') {
                        const headers = new Headers(networkResponse.headers);
                        headers.append('sw-fetched-on', new Date().toISOString());
                        headers.append('sw-ttl', CACHE_TTL.api);
                        
                        const clonedResponse = networkResponse.clone();
                        const cachedResponse = new Response(await clonedResponse.blob(), {
                            status: clonedResponse.status,
                            statusText: clonedResponse.statusText,
                            headers: headers
                        });
                        
                        cache.put(request, cachedResponse).catch(err => 
                            console.warn('快取 API 回應失敗:', err)
                        );
                    }
                    return networkResponse;
                }
                throw new Error('網路請求失敗');
                
            case 'stale-while-revalidate':
                // 同時從快取和網路獲取，先返回快取的結果，然後更新快取
                const cachedStale = await cache.match(request);
                
                // 後台更新快取
                const networkUpdate = fetchWithTimeout(request.clone(), 5000)
                    .then(response => {
                        if (response && response.status === 200) {
                            cache.put(request, response.clone()).catch(err => 
                                console.warn('更新快取失敗:', err)
                            );
                        }
                        return response;
                    })
                    .catch(err => console.warn('後台更新請求失敗:', err));
                
                // 如果有快取結果，直接返回
                if (cachedStale) {
                    return cachedStale;
                }
                
                // 如果沒有快取結果，等待網路結果
                return await networkUpdate;
                
            case 'network-first':
            default:
                // 優先從網路獲取，如果失敗則從快取獲取
                // 這裡使用重試機制
                let networkError;
                
                for (let i = 0; i <= maxRetries; i++) {
                    try {
                        // 使用帶逾時的fetch以避免長時間等待
                        const response = await fetchWithTimeout(request.clone(), 5000);
                        
                        // 檢查回應是否有效
                        if (response && response.status >= 200 && response.status < 400) {
                            // 快取成功的回應（除了特定請求）
                            if (response.status === 200 && request.method === 'GET' && 
                                resourceType !== 'api') {
                                try {
                                    await cache.put(request, response.clone());
                                } catch (cacheError) {
                                    console.warn('快取儲存失敗:', cacheError);
                                }
                            }
                            return response;
                        } else {
                            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
                        }
                    } catch (error) {
                        networkError = error;
                        if (i < maxRetries) {
                            // 指數退避延遲
                            const delay = 500 * Math.pow(2, i);
                            await new Promise(resolve => setTimeout(resolve, delay));
                            console.log(`第 ${i+1} 次重試 ${url.pathname}...`);
                        }
                    }
                }
                
                // 網路請求失敗，嘗試從快取獲取
                const cachedFallback = await cache.match(request);
                if (cachedFallback) {
                    console.log(`使用快取的備用資源: ${url.pathname}`);
                    return cachedFallback;
                }
                
                // 如果是導航請求且沒有快取，返回離線頁面
                if (request.mode === 'navigate') {
                    const offlinePage = await cache.match(OFFLINE_PAGE);
                    if (offlinePage) {
                        console.log('返回離線頁面');
                        return offlinePage;
                    }
                }
                
                // 當所有嘗試都失敗時拋出錯誤
                throw networkError || new Error('網路和快取請求都失敗');
        }
        
        // 預設的網路請求處理
        const networkFetch = await fetchWithTimeout(request.clone(), 5000);
        
        // 如果網路請求成功，快取結果並返回
        if (networkFetch && networkFetch.status === 200) {
            try {
                await cache.put(request, networkFetch.clone());
            } catch (err) {
                console.warn('快取儲存失敗:', err);
            }
            return networkFetch;
        }
        
        // 嘗試從快取中獲取以作為備用
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 如果所有嘗試都失敗，返回原始的網路回應（即使有錯誤）
        return networkFetch;
        
    } catch (error) {
        // 安全備用機制
        console.error('資源載入失敗:', request.url, error);
        
        // 導航請求常用離線頁面
        if (request.mode === 'navigate' || request.destination === 'document') {
            const offlinePage = await cache.match(OFFLINE_PAGE);
            if (offlinePage) {
                return offlinePage;
            }
        }
        
        // 其他資源類型如圖片可以提供預設圖片
        if (resourceType === 'images') {
            const placeholderImgUrl = './assets/images/placeholder.png';
            const placeholderImg = await cache.match(new Request(placeholderImgUrl));
            if (placeholderImg) {
                return placeholderImg;
            }
        }
        
        // 最終備用：拋出錯誤
        throw error;
    }
}

/**
 * 帶有逾時的 fetch 函數
 * @param {Request} request - 請求物件
 * @param {number} timeout - 逾時時間（毫秒）
 * @returns {Promise<Response>} 回應物件
 */
async function fetchWithTimeout(request, timeout = 5000) {
    return Promise.race([
        fetch(request),
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('請求逾時')), timeout)
        )
    ]);
}

/**
 * 後台更新快取的資源
 * @param {Request} request - 請求物件
 * @param {string} resourceType - 資源類型
 * @returns {Promise<void>}
 */
async function updateCache(request, resourceType) {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(request.clone());
    
    if (response && response.status === 200) {
        const headers = new Headers(response.headers);
        headers.append('sw-fetched-on', new Date().toISOString());
        headers.append('sw-cache-updated', 'true');
        
        const cachedResponse = new Response(await response.blob(), {
            status: response.status,
            statusText: response.statusText,
            headers: headers
        });
        
        await cache.put(request, cachedResponse);
    }
}

/**
 * Service Worker 事件處理
 * 跟蹤生命週期並出現關鍵、適用最佳實踐
 */

// 安裝事件 - 預先快取關鍵資源以提高效能
self.addEventListener('install', event => {
    console.log(`[Service Worker] 正在安裝新版本 ${APP_VERSION}`);
    
    // 確保安裝完成前執行所有密集型任務
    event.waitUntil(
        (async () => {
            try {
                // 開啟快取並預先快取核心資源
                const cache = await caches.open(CACHE_NAME);
                
                // 預先快取所有核心資源
                console.log('[Service Worker] 預先快取核心資源');
                await Promise.all(
                    PRE_CACHE_URLS.map(async (url) => {
                        try {
                            const request = new Request(url, { cache: 'reload' });
                            const response = await fetch(request);
                            if (response.status === 200) {
                                return cache.put(request, response);
                            } else {
                                console.warn(`[Service Worker] 無法快取 ${url}, 狀態碼: ${response.status}`);
                            }
                        } catch (err) {
                            console.warn(`[Service Worker] 預快取 ${url} 失敗:`, err);
                        }
                    })
                );
                
                // 在網路強健時嘗試預載次要資源
                if (navigator.onLine) {
                    console.log('[Service Worker] 網路可用，預載次要資源');
                    // 使用延遞加載以確保核心資源優先
                    setTimeout(() => {
                        Promise.all(
                            SECONDARY_ASSETS.map(url => {
                                fetch(new Request(url, { cache: 'reload' }))
                                    .then(response => {
                                        if (response.status === 200) {
                                            return cache.put(url, response);
                                        }
                                    })
                                    .catch(err => console.warn(`[Service Worker] 次要資源 ${url} 載入失敗:`, err));
                            })
                        ).catch(err => console.warn('[Service Worker] 次要資源載入失敗:', err));
                    }, 3000);
                }
                
                // 立即接管頁面不等待舊版本終止
                await self.skipWaiting();
                console.log('[Service Worker] 安裝完成，已跳過等待');
            } catch (error) {
                console.error('[Service Worker] 安裝期間發生錯誤:', error);
            }
        })()
    );
});

// 啟用事件 - 清理舊快取並管理快取存儲空間
self.addEventListener('activate', event => {
    console.log('[Service Worker] 正在啟用新版本');
    
    event.waitUntil(
        (async () => {
            try {
                // 獲取所有快取名稱
                const cacheKeys = await caches.keys();
                
                // 刪除舊版本的快取
                const oldCaches = cacheKeys.filter(key => 
                    key !== CACHE_NAME && key.startsWith('game-cache-')
                );
                
                if (oldCaches.length > 0) {
                    console.log(`[Service Worker] 清理 ${oldCaches.length} 個舊快取`);                    
                    await Promise.all(oldCaches.map(key => caches.delete(key)));
                }
                
                // 清理所有過期的資源
                await cleanupCache();
                
                // 立即接管所有客戶端
                await self.clients.claim();
                console.log('[Service Worker] 現在控制所有客戶端');
                
                // 通知所有客戶端服務工作線程已更新
                const clients = await self.clients.matchAll({ type: 'window' });
                for (const client of clients) {
                    client.postMessage({
                        type: 'SW_ACTIVATED',
                        version: APP_VERSION,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('[Service Worker] 啟用期間發生錯誤:', error);
            }
        })()
    );
});

// 請求事件 - 使用進階的請求處理策略
self.addEventListener('fetch', event => {
    // 請求資訊日誌
    const request = event.request;
    const url = new URL(request.url);
    
    // 只處理同源請求或特定的 CDN 請求
    const isSameOrigin = url.origin === self.location.origin;
    const isTrustedCDN = url.hostname.includes('cloudflare.com') || 
                        url.hostname.includes('jsdelivr.net') || 
                        url.hostname.includes('googleapis.com');
    
    if (!isSameOrigin && !isTrustedCDN) {
        return; // 不處理不受信任的跨域請求
    }
    
    // 跳過某些特殊請求
    if (request.method !== 'GET' || 
        url.pathname.endsWith('.php') ||
        url.pathname.includes('/admin/') ||
        url.pathname.endsWith('/service-worker.js') ||
        url.pathname.endsWith('/sw.js') ||
        url.pathname.endsWith('/firebase-messaging-sw.js') ||
        url.href.includes('chrome-extension://') ||
        url.href.includes('moz-extension://')) {
        return;
    }
    
    // 分析請求類型
    const resourceType = getResourceType(url);
    
    // 使用進階的請求策略
    event.respondWith((async () => {
        try {
            // 嘗試使用改進的資源載入策略
            return await fetchWithRetry(request);
        } catch (error) {
            console.error(`[Service Worker] 無法處理 ${url.pathname} 的請求:`, error);
            
            // 根據請求類型提供備用項
            if (request.mode === 'navigate') {
                // 導航請求使用離線頁面
                const cache = await caches.open(CACHE_NAME);
                const offlinePage = await cache.match(OFFLINE_PAGE);
                if (offlinePage) {
                    return offlinePage;
                }
                
                // 沒有快取的離線頁面，則返回簡易錯誤頁面
                return new Response(
                    `<!DOCTYPE html>
                    <html lang="zh-TW">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>無法連線</title>
                        <style>
                            body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; }
                            h1 { color: #e53935; }
                        </style>
                    </head>
                    <body>
                        <h1>無法連線！</h1>
                        <p>網路連線失敗，請檢查您的網路並稍後再試。</p>
                        <button onclick="window.location.reload()">重新整理</button>
                    </body>
                    </html>`,
                    {
                        status: 503,
                        headers: {
                            'Content-Type': 'text/html; charset=UTF-8',
                            'Cache-Control': 'no-store'
                        }
                    }
                );
            }
            
            if (resourceType === 'images') {
                // 圖片失敗時返回作備用的圖片
                const placeholderResponse = new Response(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f1f1f1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="#888">圖片無法載入</text></svg>',
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'image/svg+xml',
                            'Cache-Control': 'no-store'
                        }
                    }
                );
                return placeholderResponse;
            }
            
            // 其他資源的通用錯誤回應
            return new Response(`資源無法載入 - ${error.message}`, {
                status: 503,
                headers: { 'Content-Type': 'text/plain; charset=UTF-8' }
            });
        }
    })());
});

// 訊息事件 - 處理客戶端與服務工作線程之間的通訊
self.addEventListener('message', event => {
    const message = event.data;
    
    if (!message || !message.type) return;
    
    console.log(`[Service Worker] 收到訊息: ${message.type}`);
    
    switch (message.type) {
        case 'SKIP_WAITING':
            // 從客戶端收到跳過等待的命令
            self.skipWaiting().then(() => {
                console.log('[Service Worker] 跳過等待階段');
            });
            break;
            
        case 'CLEAN_CACHE':
            // 從客戶端收到清理快取的命令
            cleanupCache().then(() => {
                console.log('[Service Worker] 快取已清理');
                // 通知客戶端快取已清理
                if (event.source) {
                    event.source.postMessage({
                        type: 'CACHE_CLEANED',
                        timestamp: new Date().toISOString()
                    });
                }
            });
            break;
    }
});
/**
 * 智能快取清理功能
 * 根據資源類型、快取時間和快取空間進行智能清理
 * @returns {Promise<void>}
 */
async function cleanupCache() {
    try {
        console.log('[Service Worker] 開始快取清理運作');
        const cache = await caches.open(CACHE_NAME);
        const requests = await cache.keys();
        const now = Date.now();
        
        // 快取統計
        let totalItems = requests.length;
        let deletedItems = 0;
        let cachedSizeInBytes = 0;
        
        console.log(`[Service Worker] 找到 ${totalItems} 個快取項目`);
        
        // 檢查每個請求
        for (const request of requests) {
            try {
                // 獲取資源類型
                const url = new URL(request.url);
                const resourceType = getResourceType(url);
                const maxAge = CACHE_TTL[resourceType] || CACHE_TTL.other;
                
                // 獲取快取時間
                const response = await cache.match(request);
                if (!response) continue;
                
                // 此項目的快取大小
                const clone = response.clone();
                const blob = await clone.blob();
                cachedSizeInBytes += blob.size;
                
                // 判斷時間
                const headers = new Headers(response.headers);
                let cachedTime;
                
                // 優先使用我們自定義的快取時間標記
                if (headers.has('sw-fetched-on')) {
                    cachedTime = new Date(headers.get('sw-fetched-on')).getTime();
                } else if (headers.has('date')) {
                    cachedTime = new Date(headers.get('date')).getTime();
                } else {
                    // 如果沒有時間標記，假設是最近快取的
                    cachedTime = now;
                }
                
                // 檢查是否過期
                const age = now - cachedTime;
                if (age > maxAge) {
                    await cache.delete(request);
                    deletedItems++;
                    console.log(`[Service Worker] 清理過期項目: ${url.pathname} (類型: ${resourceType}, 年齡: ${Math.floor(age / 1000 / 60 / 60)} 小時)`);
                }
            } catch (itemError) {
                console.warn(`[Service Worker] 處理快取項目時出錯: ${request.url}`, itemError);
                // 繼續處理其他項目
            }
        }
        
        // 快取統計報告
        const remainingItems = totalItems - deletedItems;
        const cachedSizeInMB = (cachedSizeInBytes / (1024 * 1024)).toFixed(2);
        
        console.log(`[Service Worker] 快取清理完成:`);
        console.log(`- 已清理: ${deletedItems} 項目`);
        console.log(`- 剩餘: ${remainingItems} 項目`);
        console.log(`- 快取大小: 約 ${cachedSizeInMB} MB`);
        
        return {
            totalItems,
            deletedItems,
            remainingItems,
            cachedSizeInMB
        };
    } catch (error) {
        console.error('[Service Worker] 快取清理運作失敗:', error);
    }
}

// 設定定期清理排程 - 每12小時執行一次
self.addEventListener('activate', () => {
    // 啟動定期清理任務
    self.registration.periodicSync.register('cleanup-cache', {
        minInterval: 12 * 60 * 60 * 1000 // 12小時
    }).catch(err => {
        // 如果 periodicSync 不支援，則使用備用方法
        console.log('[Service Worker] PeriodicSync 不支援，使用備用排程方法');
        setInterval(cleanupCache, 12 * 60 * 60 * 1000); // 12小時
    });
});

// 進行初始清理
self.addEventListener('activate', event => {
    event.waitUntil(
        // 啟動後計劃在非主要時段執行清理
        new Promise(resolve => {
            setTimeout(() => {
                cleanupCache().then(resolve);
            }, 30000); // 啟動後等30秒執行，避免影響頁面加載
        })
    );
});

// 設置定期同步事件
self.addEventListener('periodicsync', event => {
    if (event.tag === 'cleanup-cache') {
        event.waitUntil(cleanupCache());
    }
});
