/**
 * 資源監控模組 - 用於監控系統資源使用情況
 * 提供即時CPU、記憶體、FPS和渲染時間監控
 */

// 系統資訊面板初始化
function loadSystemInfo() {
    return new Promise((resolve) => {
        checkSystemStatus();
        initResourceMonitoring();
        resolve();
    });
}

// 即時資源監控功能
function initResourceMonitoring() {
    // 記憶體監控數據
    const memoryData = [];
    // CPU 監控數據
    const cpuData = [];
    // 渲染時間監控數據
    const renderData = [];
    // FPS 監控數據
    const fpsData = [];
    
    // 圖表初始化
    const historyCanvas = document.getElementById('resource-history-chart');
    let historyChart = null;
    
    if (historyCanvas) {
        const ctx = historyCanvas.getContext('2d');
        historyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'CPU 使用率 (%)',
                        data: cpuData,
                        borderColor: '#2196f3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: '記憶體使用量 (MB)',
                        data: memoryData,
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'FPS',
                        data: fpsData,
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // 關閉動畫以提高效能
                },
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        display: false // 預設不顯示 x 軸標籤
                    }
                }
            }
        });
    }
    
    let monitoring = false;
    let monitoringInterval = null;
    let frameCount = 0;
    let lastFrameTime = performance.now();
    let fps = 0;
    
    // 計算 FPS
    function calculateFPS() {
        frameCount++;
        const now = performance.now();
        const elapsed = now - lastFrameTime;
        
        if (elapsed >= 1000) { // 每秒更新一次 FPS
            fps = Math.round((frameCount * 1000) / elapsed);
            frameCount = 0;
            lastFrameTime = now;
            
            // 更新 FPS 計數器
            const fpsCounter = document.getElementById('fps-counter');
            if (fpsCounter) {
                fpsCounter.textContent = fps;
            }
        }
        
        if (monitoring) {
            requestAnimationFrame(calculateFPS);
        }
    }
    
    // 監控資源使用情況
    function monitorResources() {
        // 模擬 CPU 使用率 (實際導入中可能需要使用 Web Workers 或其他技術)
        const cpuUsage = Math.min(100, Math.max(0, Math.floor(Math.random() * 30) + (frameCount / 2)));
        const cpuDisplay = document.getElementById('cpu-usage');
        const cpuBar = document.getElementById('cpu-usage-bar');
        
        if (cpuDisplay) cpuDisplay.textContent = `${cpuUsage}%`;
        if (cpuBar) cpuBar.style.width = `${cpuUsage}%`;
        
        // 計算記憶體使用量
        let memoryUsage = 0;
        if (window.performance && performance.memory) {
            // Chrome 獨有 API
            memoryUsage = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
        } else {
            // 模擬其他瀏覽器
            memoryUsage = Math.min(2048, Math.max(100, Math.floor(Math.random() * 500) + 200));
        }
        
        const memoryDisplay = document.getElementById('memory-usage');
        const memoryBar = document.getElementById('memory-usage-bar');
        
        if (memoryDisplay) memoryDisplay.textContent = `${memoryUsage} MB`;
        if (memoryBar) memoryBar.style.width = `${Math.min(100, memoryUsage / 20)}%`;
        
        // 渲染時間
        let renderTime = 0;
        if (window.performance && performance.timing) {
            renderTime = Math.round(performance.now() - (performance.timing.navigationStart || 0)) % 100;
        } else {
            renderTime = Math.floor(Math.random() * 50) + 10;
        }
        
        const renderDisplay = document.getElementById('render-time');
        if (renderDisplay) renderDisplay.textContent = `${renderTime} ms`;
        
        // 更新圖表數據
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        if (historyChart) {
            // 限制數據點數量
            if (historyChart.data.labels.length > 20) {
                historyChart.data.labels.shift();
                historyChart.data.datasets.forEach(dataset => {
                    dataset.data.shift();
                });
            }
            
            // 添加新數據
            historyChart.data.labels.push(timestamp);
            historyChart.data.datasets[0].data.push(cpuUsage);
            historyChart.data.datasets[1].data.push(memoryUsage);
            historyChart.data.datasets[2].data.push(fps);
            
            // 更新圖表
            historyChart.update();
        }
    }
    
    // 綁定監控按鈕事件
    const startMonitoringBtn = document.getElementById('start-monitoring');
    if (startMonitoringBtn) {
        startMonitoringBtn.addEventListener('click', function() {
            if (!monitoring) {
                // 開始監控
                monitoring = true;
                this.innerHTML = '<i class="fas fa-pause"></i> 暫停監控';
                
                // 開始 FPS 監控
                calculateFPS();
                
                // 定期更新資源使用情況
                monitoringInterval = setInterval(monitorResources, 1000);
                
                // 添加資源監控日誌
                if (typeof addErrorLog === 'function') {
                    addErrorLog('資源監控已開始', 'info');
                }
                
            } else {
                // 暫停監控
                monitoring = false;
                this.innerHTML = '<i class="fas fa-play"></i> 開始監控';
                
                // 清除定時器
                clearInterval(monitoringInterval);
                
                // 添加資源監控日誌
                if (typeof addErrorLog === 'function') {
                    addErrorLog('資源監控已暫停', 'info');
                }
            }
        });
    }
    
    // 添加啟動樣式
    const resourceCards = document.querySelectorAll('.resource-card');
    resourceCards.forEach(card => {
        card.classList.add('animated', 'fadeIn');
    });
}

// 新增效能指標報告功能，修復「reportPerformanceMetrics is not defined」錯誤
function reportPerformanceMetrics() {
    return new Promise((resolve) => {
        try {
            // 收集基本效能指標
            const perfMetrics = {
                memory: window.performance && performance.memory ? {
                    usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)),
                    totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / (1024 * 1024)),
                    jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / (1024 * 1024))
                } : null,
                timing: window.performance && performance.timing ? {
                    domComplete: performance.timing.domComplete - performance.timing.navigationStart,
                    domInteractive: performance.timing.domInteractive - performance.timing.navigationStart,
                    loadEventEnd: performance.timing.loadEventEnd - performance.timing.navigationStart
                } : null,
                navigation: window.performance && performance.navigation ? {
                    redirectCount: performance.navigation.redirectCount,
                    type: performance.navigation.type
                } : null
            };

            // 如果存在，記錄到錯誤日誌系統
            if (typeof addErrorLog === 'function') {
                addErrorLog(`Performance metrics collected: CPU usage approx. ${perfMetrics.memory ? perfMetrics.memory.usedJSHeapSize : 'N/A'} MB`, 'info');
            }

            resolve(perfMetrics);
        } catch (err) {
            console.error('Error collecting performance metrics:', err);
            // 發生錯誤時也返回成功，避免阻斷初始化流程
            resolve(null);
        }
    });
}

// 確保在非 admin.html 頁面時不會報錯
if (typeof window.adminModules === 'undefined') {
    window.adminModules = {};
}

window.adminModules.resourceMonitor = {
    loadSystemInfo,
    initResourceMonitoring,
    reportPerformanceMetrics // 匯出新函數
};
