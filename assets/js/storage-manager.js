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
        await this.updateMetrics();
        this.startPeriodicCheck();
    }

    /**
     * 更新存儲指標
     */
    async updateMetrics() {
        try {
            // 檢查配額
            if (navigator.storage && navigator.storage.estimate) {
                const {usage, quota} = await navigator.storage.estimate();
                this.metrics.usage = usage;
                this.metrics.quota = quota;
            }

            // 計算 localStorage 使用情況
            let localStorageSize = 0;
            let itemCount = 0;
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const itemSize = (key.length + localStorage[key].length) * 2; // UTF-16
                    localStorageSize += itemSize;
                    itemCount++;
                }
            }

            this.metrics.items = itemCount;
            this.metrics.lastCheck = new Date();

            // 檢查警告閾值
            this.checkWarningThresholds();

        } catch (error) {
            console.error('更新存儲指標失敗:', error);
        }
    }

    /**
     * 檢查警告閾值
     */
    checkWarningThresholds() {
        const usageRatio = this.metrics.usage / this.metrics.quota;

        if (usageRatio > this.cleanupThreshold) {
            // 超過清理閾值，執行自動清理
            this.autoCleanup();
        } else if (usageRatio > this.quotaThreshold) {
            // 超過警告閾值，發出警告
            window.NotificationSystem.show(
                `存儲空間使用率已達 ${(usageRatio * 100).toFixed(1)}%`,
                'warning',
                { duration: 10000 }
            );
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

            window.NotificationSystem.show(
                '已完成存儲空間自動清理',
                'success',
                { duration: 5000 }
            );
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
        setInterval(() => {
            this.updateMetrics();
        }, 15 * 60 * 1000); // 每15分鐘檢查一次
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

// 當文檔載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    window.storageSpaceManager.init();
});
