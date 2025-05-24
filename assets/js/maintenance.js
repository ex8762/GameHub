// 自動化維護系統
class MaintenanceSystem {
    constructor() {
        this.tasks = [];
        this.logs = [];
        this.maxLogs = 100;
        this.isRunning = false;
    }

    /**
     * 初始化維護系統
     */
    init() {
        // 註冊預設維護任務
        this.registerTask('checkStorage', async () => {
            await window.StorageManager.maintenance();
        }, 30 * 60 * 1000); // 每30分鐘
        
        this.registerTask('syncErrors', async () => {
            await window.ErrorHandler.syncPendingErrors();
        }, 5 * 60 * 1000); // 每5分鐘
        
        this.registerTask('cleanCache', async () => {
            await this.cleanCache();
        }, 24 * 60 * 60 * 1000); // 每24小時
        
        // 開始執行任務
        this.startTasks();
        
        // 註冊關機事件處理
        window.addEventListener('beforeunload', () => {
            this.logMaintenanceStatus();
        });
    }

    /**
     * 註冊維護任務
     */
    registerTask(name, callback, interval) {
        this.tasks.push({
            name,
            callback,
            interval,
            lastRun: 0,
            status: 'pending'
        });
    }

    /**
     * 開始執行任務
     */
    startTasks() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        setInterval(() => {
            this.checkAndRunTasks();
        }, 60000); // 每分鐘檢查一次
    }

    /**
     * 檢查並執行任務
     */
    async checkAndRunTasks() {
        const now = Date.now();
        
        for (const task of this.tasks) {
            if (now - task.lastRun >= task.interval) {
                try {
                    task.status = 'running';
                    await task.callback();
                    task.lastRun = now;
                    task.status = 'completed';
                    
                    this.log({
                        type: 'success',
                        task: task.name,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    task.status = 'failed';
                    
                    this.log({
                        type: 'error',
                        task: task.name,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                    
                    window.ErrorHandler.logError({
                        message: `維護任務失敗: ${task.name}`,
                        error: error,
                        level: window.ErrorHandler.errorLevels.ERROR
                    });
                }
            }
        }
    }

    /**
     * 清理快取
     */
    async cleanCache() {
        try {
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(
                    keys.map(key => {
                        // 保留最新版本的快取
                        if (key !== 'game-cache-v1') {
                            return caches.delete(key);
                        }
                    })
                );
            }
        } catch (error) {
            throw new Error('清理快取失敗: ' + error.message);
        }
    }

    /**
     * 記錄維護日誌
     */
    log(entry) {
        this.logs.unshift(entry);
        
        if (this.logs.length > this.maxLogs) {
            this.logs.pop();
        }
        
        // 儲存日誌
        try {
            window.storageManager.set('maintenance_logs', this.logs);
        } catch (error) {
            console.error('儲存維護日誌失敗:', error);
        }
    }

    /**
     * 取得維護狀態報告
     */
    getStatusReport() {
        return {
            tasks: this.tasks.map(task => ({
                name: task.name,
                status: task.status,
                lastRun: task.lastRun ? new Date(task.lastRun).toISOString() : null,
                nextRun: task.lastRun ? new Date(task.lastRun + task.interval).toISOString() : null
            })),
            recentLogs: this.logs.slice(0, 10)
        };
    }

    /**
     * 記錄維護狀態
     */
    logMaintenanceStatus() {
        const status = this.getStatusReport();
        
        try {
            window.storageManager.set('maintenance_status', {
                timestamp: new Date().toISOString(),
                status: status
            });
        } catch (error) {
            console.error('儲存維護狀態失敗:', error);
        }
    }
}

// 創建全局維護系統實例
window.maintenanceSystem = new MaintenanceSystem();

// 當文檔載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    window.maintenanceSystem.init();
});
