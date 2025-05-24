// 進階存儲空間管理器
const StorageManager = {
    quotaThreshold: 0.8, // 80% 空間使用警告閾值
    cleanupThreshold: 0.9, // 90% 空間使用自動清理閾值
    metrics: {
        usage: 0,
        quota: 0,
        items: 0,
        lastCheck: null
    },

    async init() {
        try {
            await this.updateStorageMetrics();
            this.startPeriodicCheck();
            return true;
        } catch (error) {
            console.error('初始化存儲管理器失敗:', error);
            if (window.ErrorHandler) {
                ErrorHandler.handleError(error);
            }
            return false;
        }
    },

    async updateStorageMetrics() {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const {usage, quota} = await navigator.storage.estimate();
                this.metrics.usage = usage;
                this.metrics.quota = quota;
                this.metrics.lastCheck = Date.now();
                
                if (this.checkQuotaWarning()) {
                    this.showStorageWarning();
                }
                
                if (this.checkQuotaCritical()) {
                    await this.cleanup();
                }
            }
        } catch (error) {
            console.error('更新存儲指標失敗:', error);
            throw error;
        }
    },

    checkQuotaWarning() {
        return this.metrics.usage > (this.metrics.quota * this.quotaThreshold);
    },

    checkQuotaCritical() {
        return this.metrics.usage > (this.metrics.quota * this.cleanupThreshold);
    },

    showStorageWarning() {
        if (window.showNotification) {
            showNotification(
                '存儲空間警告',
                '存儲空間使用率已超過 ' + (this.quotaThreshold * 100) + '%，請考慮清理一些數據。'
            );
        }
    },

    async cleanup() {
        try {
            await Promise.all([
                this.cleanupExpiredData(),
                this.cleanupOldErrorLogs(),
                this.cleanupOldGameCache(),
                this.cleanupOldStats()
            ]);
            await this.updateStorageMetrics();
        } catch (error) {
            console.error('清理存儲空間失敗:', error);
            throw error;
        }
    },

    async cleanupExpiredData() {
        const maxAge = this.getMaxDataAge();
        const now = Date.now();

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (item && item.timestamp && (now - item.timestamp > maxAge)) {
                    localStorage.removeItem(key);
                }
            } catch (e) { /* 忽略無法解析的項目 */ }
        }
    },

    async cleanupOldErrorLogs() {
        const maxLogs = 100; // 保留最新的100條錯誤日誌
        try {
            const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
            if (errorLogs.length > maxLogs) {
                errorLogs.splice(maxLogs);
                localStorage.setItem('error_logs', JSON.stringify(errorLogs));
            }
        } catch (e) { /* 忽略錯誤 */ }
    },

    async cleanupOldGameCache() {
        if ('caches' in window) {
            try {
                const keys = await caches.keys();
                const oldCaches = keys.filter(key => 
                    key.startsWith('game-cache-') && 
                    key !== 'game-cache-v1'
                );
                await Promise.all(oldCaches.map(key => caches.delete(key)));
            } catch (e) { /* 忽略錯誤 */ }
        }
    },

    async cleanupOldStats() {
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 天
        try {
            const stats = JSON.parse(localStorage.getItem('game_stats') || '{}');
            const now = Date.now();
            let changed = false;

            Object.keys(stats).forEach(key => {
                if (now - stats[key].timestamp > maxAge) {
                    delete stats[key];
                    changed = true;
                }
            });

            if (changed) {
                localStorage.setItem('game_stats', JSON.stringify(stats));
            }
        } catch (e) { /* 忽略錯誤 */ }
    },

    getMaxDataAge() {
        const usageRatio = this.metrics.usage / this.metrics.quota;
        const baseAge = 30 * 24 * 60 * 60 * 1000; // 30 天
        return Math.max(baseAge * (1 - usageRatio), 7 * 24 * 60 * 60 * 1000); // 最少 7 天
    },

    startPeriodicCheck() {
        setInterval(() => {
            this.updateStorageMetrics().catch(error => {
                console.error('定期檢查失敗:', error);
                if (window.ErrorHandler) {
                    ErrorHandler.handleError(error);
                }
            });
        }, 15 * 60 * 1000); // 每 15 分鐘檢查一次
    },

    async getStorageReport() {
        await this.updateStorageMetrics();
        return {
            ...this.metrics,
            usagePercent: (this.metrics.usage / this.metrics.quota * 100).toFixed(2),
            warning: this.checkQuotaWarning(),
            critical: this.checkQuotaCritical()
        };
    }
};

window.StorageManager = StorageManager;

// 確保在頁面加載時初始化
document.addEventListener('DOMContentLoaded', () => {
    StorageManager.init().catch(error => {
        console.error('StorageManager 初始化失敗:', error);
        if (window.ErrorHandler) {
            ErrorHandler.handleError(error);
        }
    });
});
