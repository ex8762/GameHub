// 系統健康監控類
class SystemHealthMonitor {
    constructor() {
        this.metrics = {
            memory: {
                usage: 0,
                limit: 0
            },
            performance: {
                responseTime: [],
                averageResponseTime: 0
            },
            errors: {
                count: 0,
                byType: {},
                recent: []
            },
            resources: {
                cpu: 0,
                storage: {
                    used: 0,
                    total: 0
                }
            }
        };
        
        this.init();
    }

    // 初始化監控
    async init() {
        this.startPerformanceMonitoring();
        this.startMemoryMonitoring();
        this.startResourceMonitoring();
        this.startErrorMonitoring();
    }

    // 開始效能監控
    startPerformanceMonitoring() {
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                this.metrics.memory.usage = memory.usedJSHeapSize;
                this.metrics.memory.limit = memory.jsHeapSizeLimit;
            }, 5000);
        }

        // 監控頁面載入效能
        if (window.performance.timing) {
            const timing = window.performance.timing;
            const responseTime = timing.responseEnd - timing.requestStart;
            this.metrics.performance.responseTime.push(responseTime);

            // 保持最近100個樣本
            if (this.metrics.performance.responseTime.length > 100) {
                this.metrics.performance.responseTime.shift();
            }

            // 計算平均回應時間
            this.metrics.performance.averageResponseTime = 
                this.metrics.performance.responseTime.reduce((a, b) => a + b, 0) / 
                this.metrics.performance.responseTime.length;
        }
    }

    // 開始記憶體監控
    startMemoryMonitoring() {
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memoryInfo = window.performance.memory;
                this.updateMemoryMetrics(memoryInfo);
            }, 10000);
        }
    }

    // 更新記憶體指標
    updateMemoryMetrics(memoryInfo) {
        this.metrics.memory = {
            usage: memoryInfo.usedJSHeapSize,
            total: memoryInfo.totalJSHeapSize,
            limit: memoryInfo.jsHeapSizeLimit
        };

        // 檢查記憶體使用警告
        if (this.metrics.memory.usage / this.metrics.memory.limit > 0.9) {
            this.triggerAlert('memory', '記憶體使用率過高');
        }
    }

    // 開始資源監控
    startResourceMonitoring() {
        setInterval(async () => {
            if (navigator.storage && navigator.storage.estimate) {
                try {
                    const estimate = await navigator.storage.estimate();
                    this.metrics.resources.storage = {
                        used: estimate.usage,
                        total: estimate.quota
                    };

                    // 檢查存儲空間警告
                    if (estimate.usage / estimate.quota > 0.9) {
                        this.triggerAlert('storage', '存儲空間即將用完');
                    }
                } catch (error) {
                    console.error('存儲空間估算失敗:', error);
                }
            }
        }, 30000);
    }

    // 開始錯誤監控
    startErrorMonitoring() {
        window.onerror = (msg, url, line, col, error) => {
            this.recordError({
                message: msg,
                source: url,
                line: line,
                column: col,
                error: error
            });
        };

        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                message: 'Unhandled Promise Rejection',
                error: event.reason
            });
        });
    }

    // 記錄錯誤
    recordError(errorInfo) {
        this.metrics.errors.count++;
        
        const errorType = errorInfo.error?.name || 'Unknown';
        this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;

        this.metrics.errors.recent.unshift({
            timestamp: new Date(),
            ...errorInfo
        });

        // 保持最近50條錯誤記錄
        if (this.metrics.errors.recent.length > 50) {
            this.metrics.errors.recent.pop();
        }

        // 觸發錯誤警告
        if (this.metrics.errors.count > 100) {
            this.triggerAlert('error', '錯誤數量異常');
        }
    }

    // 觸發警告
    triggerAlert(type, message) {
        const event = new CustomEvent('systemAlert', {
            detail: {
                type: type,
                message: message,
                timestamp: new Date(),
                metrics: this.getMetrics()
            }
        });
        window.dispatchEvent(event);
    }

    // 獲取監控指標
    getMetrics() {
        return {
            ...this.metrics,
            timestamp: new Date()
        };
    }

    // 獲取健康狀態報告
    getHealthReport() {
        const metrics = this.getMetrics();
        
        return {
            status: this.calculateOverallStatus(metrics),
            memory: {
                usage: this.formatBytes(metrics.memory.usage),
                total: this.formatBytes(metrics.memory.total),
                utilizationRate: (metrics.memory.usage / metrics.memory.total * 100).toFixed(2) + '%'
            },
            performance: {
                averageResponseTime: metrics.performance.averageResponseTime.toFixed(2) + 'ms',
                responseTimeHistory: metrics.performance.responseTime
            },
            errors: {
                total: metrics.errors.count,
                byType: metrics.errors.byType,
                recentErrors: metrics.errors.recent.slice(0, 5)
            },
            storage: {
                used: this.formatBytes(metrics.resources.storage.used),
                total: this.formatBytes(metrics.resources.storage.total),
                utilizationRate: (metrics.resources.storage.used / metrics.resources.storage.total * 100).toFixed(2) + '%'
            }
        };
    }

    // 計算整體狀態
    calculateOverallStatus(metrics) {
        const memoryUtilization = metrics.memory.usage / metrics.memory.total;
        const storageUtilization = metrics.resources.storage.used / metrics.resources.storage.total;
        const errorRate = metrics.errors.count / 100; // 以每100次操作的錯誤數計算

        if (memoryUtilization > 0.9 || storageUtilization > 0.9 || errorRate > 0.1) {
            return 'critical';
        } else if (memoryUtilization > 0.7 || storageUtilization > 0.7 || errorRate > 0.05) {
            return 'warning';
        }
        return 'healthy';
    }

    // 格式化位元組
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 創建全局實例
window.systemHealthMonitor = new SystemHealthMonitor();
