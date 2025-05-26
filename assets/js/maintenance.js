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
        // 檢查必要的依賴對象是否存在
        const dependenciesAvailable = this.checkDependencies();
        
        if (!dependenciesAvailable) {
            console.warn('維護系統初始化失敗: 缺少必要的依賴對象');
            return;
        }
        
        try {
            // 註冊預設維護任務
            this.registerTask('checkStorage', async () => {
                if (window.storageManager && typeof window.storageManager.maintenance === 'function') {
                    await window.storageManager.maintenance();
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
        } catch (e) {
            console.error('維護系統初始化錯誤:', e);
        }
    }
    
    /**
     * 檢查依賴對象是否存在
     */
    checkDependencies() {
        // 在開發環境中忽略依賴檢查
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return false;
        }
        
        const dependencies = {
            'storageManager': typeof window.storageManager !== 'undefined',
            'ErrorHandler': typeof window.ErrorHandler !== 'undefined'
        };
        
        const missingDependencies = Object.entries(dependencies)
            .filter(([_, exists]) => !exists)
            .map(([name]) => name);
            
        if (missingDependencies.length > 0) {
            console.warn(`缺少依賴對象: ${missingDependencies.join(', ')}`);
            return false;
        }
        
        return true;
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
                    
                    // 安全地使用 ErrorHandler
                    if (window.ErrorHandler && typeof window.ErrorHandler.logError === 'function') {
                        try {
                            window.ErrorHandler.logError({
                                message: `維護任務失敗: ${task.name}`,
                                error: error,
                                level: window.ErrorHandler.errorLevels?.ERROR || 'ERROR'
                            });
                        } catch (e) {
                            console.error('記錄錯誤失敗:', e);
                        }
                    } else {
                        console.error(`維護任務失敗: ${task.name}`, error);
                    }
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
            if (window.storageManager && typeof window.storageManager.set === 'function') {
                window.storageManager.set('maintenance_logs', this.logs);
            } else {
                // 如果無法使用 storageManager，嘗試使用 localStorage
                localStorage.setItem('maintenance_logs', JSON.stringify(this.logs));
            }
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
            if (window.storageManager && typeof window.storageManager.set === 'function') {
                window.storageManager.set('maintenance_status', {
                    timestamp: new Date().toISOString(),
                    status: status
                });
            } else {
                // 如果無法使用 storageManager，嘗試使用 localStorage
                localStorage.setItem('maintenance_status', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    status: status
                }));
            }
        } catch (error) {
            console.error('儲存維護狀態失敗:', error);
        }
    }
}

// 創建全局維護系統實例
window.maintenanceSystem = new MaintenanceSystem();

// 當文檔載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延遲初始化，確保其他系統已經載入
    setTimeout(() => {
        try {
            if (window.maintenanceSystem) {
                window.maintenanceSystem.init();
            }
        } catch (e) {
            console.warn('維護系統初始化失敗:', e);
        }
    }, 1000);
});
