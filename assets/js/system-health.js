// 系統健康監控器
class SystemHealthMonitor {
    constructor() {
        this.metrics = {
            memory: {
                usage: [],
                warnings: 0
            },
            errors: {
                count: 0,
                byType: {},
                recent: []
            },
            performance: {
                fps: [],
                responseTime: []
            },
            storage: {
                checks: [],
                warnings: 0
            }
        };
        
        this.thresholds = {
            memory: {
                warning: 0.8,    // 80% 記憶體使用率警告
                critical: 0.9    // 90% 記憶體使用率危險
            },
            performance: {
                minFps: 30,     // 最低FPS
                maxResponse: 1000 // 最大回應時間(ms)
            },
            errors: {
                maxRate: 0.1    // 10% 錯誤率閾值
            }
        };
    }

    /**
     * 初始化健康監控
     */
    init() {
        this.startPerformanceMonitoring();
        this.startMemoryMonitoring();
        this.startErrorMonitoring();
        this.startStorageMonitoring();
    }

    /**
     * 開始效能監控
     */
    startPerformanceMonitoring() {
        let lastTime = performance.now();
        let frames = 0;

        const measureFPS = () => {
            const now = performance.now();
            frames++;

            if (now >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (now - lastTime));
                this.metrics.performance.fps.push({
                    timestamp: new Date(),
                    value: fps
                });

                // 保留最近100個樣本
                if (this.metrics.performance.fps.length > 100) {
                    this.metrics.performance.fps.shift();
                }

                // 檢查FPS是否過低
                if (fps < this.thresholds.performance.minFps) {
                    this.reportPerformanceIssue('FPS過低', fps);
                }

                frames = 0;
                lastTime = now;
            }

            requestAnimationFrame(measureFPS);
        };

        requestAnimationFrame(measureFPS);

        // 監控頁面回應時間
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > this.thresholds.performance.maxResponse) {
                    this.reportPerformanceIssue('頁面回應時間過長', entry.duration);
                }
                
                this.metrics.performance.responseTime.push({
                    timestamp: new Date(),
                    value: entry.duration
                });

                if (this.metrics.performance.responseTime.length > 100) {
                    this.metrics.performance.responseTime.shift();
                }
            }
        });

        observer.observe({ entryTypes: ['longtask', 'event'] });
    }

    /**
     * 開始記憶體監控
     */
    startMemoryMonitoring() {
        const checkMemory = () => {
            if (performance.memory) {
                const used = performance.memory.usedJSHeapSize;
                const total = performance.memory.jsHeapSizeLimit;
                const ratio = used / total;

                this.metrics.memory.usage.push({
                    timestamp: new Date(),
                    value: ratio
                });

                // 保留最近100個樣本
                if (this.metrics.memory.usage.length > 100) {
                    this.metrics.memory.usage.shift();
                }

                // 檢查記憶體使用率
                if (ratio > this.thresholds.memory.critical) {
                    this.reportMemoryIssue('記憶體使用率危險', ratio);
                } else if (ratio > this.thresholds.memory.warning) {
                    this.reportMemoryIssue('記憶體使用率警告', ratio);
                }
            }
        };

        setInterval(checkMemory, 30000); // 每30秒檢查一次
    }

    /**
     * 開始錯誤監控
     */
    startErrorMonitoring() {
        window.addEventListener('error', (event) => {
            this.metrics.errors.count++;
            const errorType = event.error ? event.error.name : 'Unknown';
            
            this.metrics.errors.byType[errorType] = 
                (this.metrics.errors.byType[errorType] || 0) + 1;

            this.metrics.errors.recent.push({
                timestamp: new Date(),
                type: errorType,
                message: event.message
            });

            // 保留最近50個錯誤
            if (this.metrics.errors.recent.length > 50) {
                this.metrics.errors.recent.shift();
            }

            // 計算錯誤率並檢查
            this.checkErrorRate();
        });

        // 監控未處理的Promise錯誤
        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errors.count++;
            this.metrics.errors.recent.push({
                timestamp: new Date(),
                type: 'UnhandledPromiseRejection',
                message: event.reason
            });

            this.checkErrorRate();
        });
    }

    /**
     * 開始存儲監控
     */
    startStorageMonitoring() {
        const checkStorage = async () => {
            try {
                const report = await window.storageSpaceManager.getStorageReport();
                
                this.metrics.storage.checks.push({
                    timestamp: new Date(),
                    usage: report.usage,
                    quota: report.quota,
                    items: report.items
                });

                // 保留最近48個檢查（一天，每30分鐘一次）
                if (this.metrics.storage.checks.length > 48) {
                    this.metrics.storage.checks.shift();
                }

                // 分析存儲趨勢
                this.analyzeStorageTrends();
            } catch (error) {
                console.error('存儲監控失敗:', error);
            }
        };

        setInterval(checkStorage, 30 * 60 * 1000); // 每30分鐘檢查一次
    }

    /**
     * 分析存儲趨勢
     */
    analyzeStorageTrends() {
        if (this.metrics.storage.checks.length < 2) return;

        const latest = this.metrics.storage.checks[this.metrics.storage.checks.length - 1];
        const previous = this.metrics.storage.checks[this.metrics.storage.checks.length - 2];

        // 檢查快速增長
        const growthRate = (latest.usage - previous.usage) / previous.usage;
        if (growthRate > 0.2) { // 20%以上的增長
            this.reportStorageIssue('存儲空間使用快速增長', growthRate);
        }
    }

    /**
     * 檢查錯誤率
     */
    checkErrorRate() {
        const totalOperations = this.getTotalOperations();
        if (totalOperations === 0) return;

        const errorRate = this.metrics.errors.count / totalOperations;
        if (errorRate > this.thresholds.errors.maxRate) {
            this.reportErrorIssue('錯誤率過高', errorRate);
        }
    }

    /**
     * 獲取總操作數
     */
    getTotalOperations() {
        // 這裡可以根據實際情況計算總操作數
        return 1000; // 示例值
    }

    /**
     * 報告效能問題
     */
    reportPerformanceIssue(message, value) {
        window.NotificationSystem.show(
            `${message}: ${Math.round(value)}`,
            'warning',
            { duration: 5000 }
        );
    }

    /**
     * 報告記憶體問題
     */
    reportMemoryIssue(message, ratio) {
        this.metrics.memory.warnings++;
        window.NotificationSystem.show(
            `${message}: ${(ratio * 100).toFixed(1)}%`,
            'warning',
            { duration: 8000 }
        );
    }

    /**
     * 報告存儲問題
     */
    reportStorageIssue(message, rate) {
        this.metrics.storage.warnings++;
        window.NotificationSystem.show(
            `${message}: ${(rate * 100).toFixed(1)}%`,
            'warning',
            { duration: 8000 }
        );
    }

    /**
     * 報告錯誤問題
     */
    reportErrorIssue(message, rate) {
        window.NotificationSystem.show(
            `${message}: ${(rate * 100).toFixed(1)}%`,
            'error',
            { duration: 10000 }
        );
    }

    /**
     * 獲取健康報告
     */
    getHealthReport() {
        const now = new Date();
        const last24Hours = new Date(now - 24 * 60 * 60 * 1000);

        return {
            timestamp: now,
            memory: {
                currentUsage: this.metrics.memory.usage[this.metrics.memory.usage.length - 1],
                warnings24h: this.metrics.memory.warnings
            },
            performance: {
                avgFps: this.calculateAverage(this.metrics.performance.fps),
                avgResponseTime: this.calculateAverage(this.metrics.performance.responseTime)
            },
            errors: {
                total: this.metrics.errors.count,
                last24h: this.metrics.errors.recent.filter(e => e.timestamp > last24Hours).length,
                byType: this.metrics.errors.byType
            },
            storage: {
                latest: this.metrics.storage.checks[this.metrics.storage.checks.length - 1],
                warnings24h: this.metrics.storage.warnings
            }
        };
    }

    /**
     * 計算平均值
     */
    calculateAverage(array) {
        if (!array || array.length === 0) return 0;
        return array.reduce((sum, item) => sum + item.value, 0) / array.length;
    }
}

// 創建全局實例
window.systemHealthMonitor = new SystemHealthMonitor();

// 當文檔載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    window.systemHealthMonitor.init();
});
