// 統一的錯誤處理系統
class ErrorHandler {
    constructor() {
        this.maxLogs = 100;
        this.errorLevels = {
            DEBUG: 0,
            INFO: 1,
            WARNING: 2,
            ERROR: 3,
            CRITICAL: 4
        };
    }

    /**
     * 初始化錯誤處理系統
     */
    init() {
        // 設置全局錯誤處理
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError({
                message: message,
                source: source,
                lineno: lineno,
                colno: colno,
                error: error,
                level: this.errorLevels.ERROR
            });
            return false;
        };

        // 處理未捕獲的 Promise 錯誤
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: 'Unhandled Promise Rejection',
                error: event.reason,
                level: this.errorLevels.ERROR
            });
        });

        // 監控網路狀態變化
        window.addEventListener('online', () => {
            this.logError({
                message: '網路已恢復連接',
                level: this.errorLevels.INFO
            });
        });

        window.addEventListener('offline', () => {
            this.logError({
                message: '網路連接已斷開',
                level: this.errorLevels.WARNING
            });
        });
    }

    /**
     * 記錄錯誤
     * @param {Object} options 錯誤選項
     * @param {string} options.message 錯誤訊息
     * @param {Error} [options.error] 錯誤對象
     * @param {number} [options.level] 錯誤級別
     * @param {string} [options.source] 錯誤來源
     */
    logError({ message, error = null, level = this.errorLevels.ERROR, source = '' }) {
        const timestamp = new Date().toISOString();
        const errorLog = {
            timestamp,
            message,
            level,
            source: source || 'unknown',
            stack: error?.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // 保存錯誤日誌
        this.saveLog(errorLog);

        // 根據錯誤級別顯示通知
        this.showErrorNotification(errorLog);

        // 如果是嚴重錯誤，同時發送到後端
        if (level >= this.errorLevels.ERROR) {
            this.sendErrorToServer(errorLog);
        }

        // 在控制台輸出詳細信息
        console.error('[ErrorHandler]', errorLog);
    }

    /**
     * 保存錯誤日誌到本地存儲
     */
    saveLog(errorLog) {
        try {
            const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
            logs.unshift(errorLog);
            
            // 限制日誌數量
            if (logs.length > this.maxLogs) {
                logs.length = this.maxLogs;
            }
            
            localStorage.setItem('errorLogs', JSON.stringify(logs));
        } catch (e) {
            console.error('保存錯誤日誌失敗:', e);
        }
    }

    /**
     * 顯示錯誤通知
     */
    showErrorNotification(errorLog) {
        if (typeof NotificationSystem === 'undefined') {
            return;
        }

        const notificationTypes = {
            [this.errorLevels.DEBUG]: 'info',
            [this.errorLevels.INFO]: 'info',
            [this.errorLevels.WARNING]: 'warning',
            [this.errorLevels.ERROR]: 'error',
            [this.errorLevels.CRITICAL]: 'error'
        };

        const type = notificationTypes[errorLog.level] || 'error';
        const duration = errorLog.level >= this.errorLevels.ERROR ? 8000 : 5000;

        NotificationSystem.show(errorLog.message, type, {
            duration,
            closeable: true
        });
    }

    /**
     * 發送錯誤到後端服務器
     */
    async sendErrorToServer(errorLog) {
        if (!navigator.onLine) {
            this.queueErrorForSync(errorLog);
            return;
        }

        try {
            const response = await fetch('/api/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(errorLog)
            });

            if (!response.ok) {
                throw new Error('發送錯誤日誌失敗');
            }
        } catch (e) {
            console.error('發送錯誤日誌到服務器失敗:', e);
            this.queueErrorForSync(errorLog);
        }
    }

    /**
     * 將錯誤加入同步隊列
     */
    queueErrorForSync(errorLog) {
        try {
            const queue = JSON.parse(localStorage.getItem('errorSyncQueue') || '[]');
            queue.push(errorLog);
            localStorage.setItem('errorSyncQueue', JSON.stringify(queue));
        } catch (e) {
            console.error('添加錯誤到同步隊列失敗:', e);
        }
    }

    /**
     * 獲取錯誤日誌
     */
    getLogs() {
        try {
            return JSON.parse(localStorage.getItem('errorLogs') || '[]');
        } catch (e) {
            console.error('獲取錯誤日誌失敗:', e);
            return [];
        }
    }

    /**
     * 清除錯誤日誌
     */
    clearLogs() {
        try {
            localStorage.removeItem('errorLogs');
            return true;
        } catch (e) {
            console.error('清除錯誤日誌失敗:', e);
            return false;
        }
    }

    /**
     * 同步待處理的錯誤日誌
     */
    async syncPendingErrors() {
        if (!navigator.onLine) {
            return;
        }

        try {
            const queue = JSON.parse(localStorage.getItem('errorSyncQueue') || '[]');
            if (queue.length === 0) {
                return;
            }

            const failedErrors = [];
            for (const errorLog of queue) {
                try {
                    await this.sendErrorToServer(errorLog);
                } catch (e) {
                    failedErrors.push(errorLog);
                }
            }

            // 更新同步隊列，只保留發送失敗的錯誤
            localStorage.setItem('errorSyncQueue', JSON.stringify(failedErrors));
        } catch (e) {
            console.error('同步錯誤日誌失敗:', e);
        }
    }
}

// 創建全局錯誤處理器實例
window.ErrorHandler = new ErrorHandler();
window.ErrorHandler.init();

// 定期同步錯誤日誌
setInterval(() => {
    window.ErrorHandler.syncPendingErrors();
}, 5 * 60 * 1000); // 每5分鐘同步一次
