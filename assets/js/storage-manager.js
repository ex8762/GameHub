// 進階存儲空間管理器
class StorageSpaceManager {
    constructor() {
        this.quotaThreshold = 0.8; // 80% 空間使用警告閾值
        this.cleanupThreshold = 0.9; // 90% 空間使用自動清理閾值
        this.metrics = {
            usage: 0,
            quota: 0,
            items: 0,
            lastCheck: null
        };
    }

    /**
     * 初始化存儲空間管理器
     */
    async init() {
        try {
            await this.updateMetrics();
            this.startPeriodicCheck();
            console.log('存儲空間管理器初始化完成');
        } catch (err) {
            console.warn('存儲空間管理器初始化失敗:', err);
        }
    }

    /**
     * 更新存儲指標
     */
    async updateMetrics() {
        try {
            // 減少開發環境中的日誌輸出
            const isLocalEnvironment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (!isLocalEnvironment) {
                console.log('開始更新存儲指標...');
            }

            // 檢查配額 - 使用安全的檢查防止undefined錯誤
            if (typeof navigator !== 'undefined' && navigator && 
                typeof navigator.storage !== 'undefined' && navigator.storage && 
                typeof navigator.storage.estimate === 'function') {
                
                if (!isLocalEnvironment) {
                    console.log('navigator.storage.estimate 可用');
                }
                
                try {
                    const estimate = await navigator.storage.estimate();
                    const usage = estimate && typeof estimate.usage === 'number' ? estimate.usage : 0;
                    const quota = estimate && typeof estimate.quota === 'number' ? estimate.quota : 1000000;
                    
                    this.metrics.usage = usage;
                    this.metrics.quota = quota || 1000000; // 預設值避免除以0的錯誤
                    
                    if (!isLocalEnvironment) {
                        console.log(`存儲使用量: ${usage}, 配額: ${quota}`);
                    }
                } catch (e) {
                    console.warn('navigator.storage.estimate 呼叫失敗:', e);
                    // 設置預設值
                    this.metrics.usage = 0;
                    this.metrics.quota = 1000000;
                }
            } else {
                console.warn('navigator.storage.estimate 不可用');
                // 設置預設值
                this.metrics.usage = 0;
                this.metrics.quota = 1000000;
            }

            // 計算 localStorage 使用情況
            let localStorageSize = 0;
            let itemCount = 0;

            try {
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        try {
                            const itemSize = (key.length + localStorage[key].length) * 2; // UTF-16
                            localStorageSize += itemSize;
                            itemCount++;
                            if (!isLocalEnvironment) {
                                console.log(`鍵: ${key}, 大小: ${itemSize} bytes`);
                            }
                        } catch (e) {
                            if (!isLocalEnvironment) {
                                console.error(`無法解析 localStorage 鍵: ${key}`, e);
                            }
                        }
                    }
                }
            } catch (e) {
                console.warn('localStorage 計算失敗:', e);
            }

            this.metrics.items = itemCount;
            this.metrics.lastCheck = new Date();

            if (!isLocalEnvironment) {
                console.log('localStorage 總大小:', localStorageSize);
                console.log('localStorage 總項目數:', itemCount);
            }

            // 檢查警告閾值
            this.checkWarningThresholds();

        } catch (error) {
            console.error('更新存儲指標失敗:', error);
            if (window.NotificationSystem && typeof window.NotificationSystem.show === 'function') {
                try {
                    window.NotificationSystem.show(
                        '更新存儲指標失敗，請檢查控制台以獲取詳細資訊。',
                        'error',
                        { duration: 10000 }
                    );
                } catch (e) {
                    console.error('題示通知失敗:', e);
                }
            }
        }
    }

    /**
     * 檢查警告閾值
     */
    checkWarningThresholds() {
        // 確保指標存在且有效
        if (!this.metrics || typeof this.metrics.usage !== 'number' || typeof this.metrics.quota !== 'number' || this.metrics.quota === 0) {
            console.warn('存儲指標不完整或無效');
            return;
        }
        
        const usageRatio = this.metrics.usage / this.metrics.quota;

        if (usageRatio > this.cleanupThreshold) {
            // 超過清理閾值，執行自動清理
            this.autoCleanup();
        } else if (usageRatio > this.quotaThreshold) {
            // 超過警告閾值，發出警告
            if (window.NotificationSystem && typeof window.NotificationSystem.show === 'function') {
                window.NotificationSystem.show(
                    `存儲空間使用率已達 ${(usageRatio * 100).toFixed(1)}%`,
                    'warning',
                    { duration: 10000 }
                );
            } else {
                console.warn(`存儲空間使用率已達 ${(usageRatio * 100).toFixed(1)}%`);
            }
        }
    }

    /**
     * 自動清理存儲空間
     */
    async autoCleanup() {
        try {
            // 1. 清理過期數據
            await this.cleanExpiredData();

            // 2. 清理舊的錯誤日誌
            await this.cleanOldErrorLogs();

            // 3. 清理舊的遊戲快取
            await this.cleanOldGameCache();

            // 4. 清理不必要的統計數據
            await this.cleanOldStats();

            // 更新指標
            await this.updateMetrics();

            if (window.NotificationSystem && typeof window.NotificationSystem.show === 'function') {
                try {
                    window.NotificationSystem.show(
                        '已完成存儲空間自動清理',
                        'success',
                        { duration: 5000 }
                    );
                } catch (e) {
                    console.log('已完成存儲空間自動清理');
                }
            } else {
                console.log('已完成存儲空間自動清理');
            }
        } catch (error) {
            console.error('自動清理失敗:', error);
        }
    }

    /**
     * 清理過期數據
     */
    async cleanExpiredData() {
        const now = Date.now();
        const expiryCheck = {
            'maintenance_logs': 7 * 24 * 60 * 60 * 1000, // 7天
            'error_logs': 3 * 24 * 60 * 60 * 1000,      // 3天
            'game_stats': 30 * 24 * 60 * 60 * 1000      // 30天
        };

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                try {
                    const value = JSON.parse(localStorage[key]);
                    if (value && value.timestamp) {
                        const age = now - new Date(value.timestamp).getTime();
                        const maxAge = this.getMaxAge(key, expiryCheck);
                        if (maxAge && age > maxAge) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (e) {
                    // 忽略非 JSON 數據
                }
            }
        }
    }

    /**
     * 清理舊的錯誤日誌
     */
    async cleanOldErrorLogs() {
        const maxLogs = 100; // 保留最新的100條錯誤日誌
        try {
            const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            if (errorLogs.length > maxLogs) {
                errorLogs.splice(maxLogs);
                localStorage.setItem('error_logs', JSON.stringify(errorLogs));
            }
        } catch (error) {
            console.error('清理錯誤日誌失敗:', error);
        }
    }

    /**
     * 清理舊的遊戲快取
     */
    async cleanOldGameCache() {
        if ('caches' in window) {
            try {
                const keys = await caches.keys();
                const deletePromises = keys
                    .filter(key => key.startsWith('game-cache-') && key !== 'game-cache-v1')
                    .map(key => caches.delete(key));
                await Promise.all(deletePromises);
            } catch (error) {
                console.error('清理遊戲快取失敗:', error);
            }
        }
    }

    /**
     * 清理舊的統計數據
     */
    async cleanOldStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('game_stats') || '{}');
            const now = Date.now();
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天

            // 清理舊的統計數據
            Object.keys(stats).forEach(key => {
                const timestamp = new Date(stats[key].timestamp).getTime();
                if (now - timestamp > maxAge) {
                    delete stats[key];
                }
            });

            localStorage.setItem('game_stats', JSON.stringify(stats));
        } catch (error) {
            console.error('清理統計數據失敗:', error);
        }
    }

    /**
     * 獲取數據最大保存時間
     */
    getMaxAge(key, expiryCheck) {
        for (let pattern in expiryCheck) {
            if (key.includes(pattern)) {
                return expiryCheck[pattern];
            }
        }
        return null;
    }

    /**
     * 開始定期檢查
     */
    startPeriodicCheck() {
        // 檢查是否已有定時器，避免重複創建
        if (this._checkInterval) {
            clearInterval(this._checkInterval);
        }
        
        // 安全地創建定時器
        this._checkInterval = setInterval(() => {
            try {
                this.updateMetrics();
            } catch (err) {
                console.error('定期存儲檢查失敗:', err);
            }
        }, 15 * 60 * 1000); // 每15分鐘檢查一次
        
        console.log('存儲空間定期檢查已啟動');
    }

    /**
     * 獲取存儲空間報告
     */
    getStorageReport() {
        return {
            usage: this.metrics.usage,
            quota: this.metrics.quota,
            items: this.metrics.items,
            usageRatio: (this.metrics.usage / this.metrics.quota) * 100,
            lastCheck: this.metrics.lastCheck
        };
    }
}

// 創建全局實例
window.storageSpaceManager = new StorageSpaceManager();

// 當文檔載入完成時初始化 - 安全的初始化邏輯
document.addEventListener('DOMContentLoaded', () => {
    // 延遲初始化，確保其他系統已經載入
    setTimeout(() => {
        try {
            // 檢查必要的全局對象是否可用
            if (typeof window !== 'undefined' && 
                typeof navigator !== 'undefined' && 
                typeof localStorage !== 'undefined') {
                
                // 確保存儲管理器實例存在
                if (window.storageSpaceManager && 
                    typeof window.storageSpaceManager.init === 'function') {
                    
                    // 防止多次初始化
                    if (!window.storageSpaceManager._initialized) {
                        window.storageSpaceManager._initialized = true;
                        window.storageSpaceManager.init();
                    }
                }
            }
        } catch (e) {
            console.warn('存儲管理器初始化失敗:', e);
        }
    }, 2500); // 增加延遲時間，確保所有依賴項已載入
});

// 全局錯誤處理器 - 捕獲與存儲相關的未處理Promise錯誤
window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.toString().includes('storage')) {
        console.warn('捕獲到存儲相關的未處理Promise拒絕:', event.reason);
        event.preventDefault(); // 防止默認錯誤處理
    }
});
