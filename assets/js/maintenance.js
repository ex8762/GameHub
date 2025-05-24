// 自動化維護系統
const MaintenanceSystem = {
    tasks: [],
    logs: [],
    maxLogs: 100,
    isRunning: false,

    init() {
        // 註冊預設維護任務
        this.registerTask('checkStorage', async () => {
            if (window.StorageManager && typeof window.StorageManager.cleanup === 'function') {
                await window.StorageManager.cleanup();
            }
        }, 30 * 60 * 1000); // 每30分鐘
        
        this.registerTask('syncErrors', async () => {
            if (window.ErrorHandler && typeof window.ErrorHandler.syncPendingErrors === 'function') {
                await window.ErrorHandler.syncPendingErrors();
            }
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
    },

    registerTask(name, callback, interval) {
        this.tasks.push({
            name,
            callback,
            interval,
            lastRun: 0,
            status: 'pending'
        });
    },

    startTasks() {
        this.isRunning = true;
        this.tasks.forEach(task => {
            setInterval(async () => {
                try {
                    await task.callback();
                    task.lastRun = Date.now();
                    task.status = 'success';
                } catch (e) {
                    task.status = 'error';
                    this.logError(e);
                }
            }, task.interval);
        });
    },

    logError(error) {
        this.logs.push({
            time: new Date().toISOString(),
            error: error.message || String(error)
        });
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        if (window.ErrorHandler && typeof window.ErrorHandler.handleError === 'function') {
            window.ErrorHandler.handleError(error);
        }
    },

    logMaintenanceStatus() {
        // 可根據需求擴充
        if (window.StorageManager) {
            const report = window.StorageManager.getStorageReport ? window.StorageManager.getStorageReport() : {};
            this.logs.push({
                time: new Date().toISOString(),
                status: 'shutdown',
                storage: report
            });
        }
    },

    async cleanCache() {
        // 實作快取清理邏輯
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MaintenanceSystem.init();
    window.MaintenanceSystem = MaintenanceSystem;
});
