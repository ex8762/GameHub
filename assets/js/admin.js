// 管理面板功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化標籤頁切換
    initializeTabs();

    // 載入統計數據
    loadStatistics();

    // 初始化圖表
    initializeCharts();

    // 檢查系統狀態
    checkSystemStatus();

    // 設置自動更新
    setInterval(loadStatistics, 60000); // 每分鐘更新一次
});

// 標籤頁切換功能
function initializeTabs() {
    const tabs = document.querySelectorAll('.nav-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有活動狀態
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // 添加新的活動狀態
            tab.classList.add('active');
            const targetId = tab.dataset.tab;
            document.getElementById(targetId).classList.add('active');

            // 重新渲染圖表
            updateCharts(targetId);
        });
    });
}

// 載入統計數據
function loadStatistics() {
    if (!window.gameAnalytics || typeof window.gameAnalytics.getAllStats !== 'function') {
        alert('統計系統尚未初始化，請檢查 analytics.js 是否正確載入。');
        return;
    }
    const stats = window.gameAnalytics.getAllStats();

    // 防呆：確保 stats.games 一定是物件
    if (!stats.games || typeof stats.games !== 'object') {
        stats.games = {};
    }

    // 更新總覽數據
    document.getElementById('total-visits').textContent = stats.totalVisits;

    let totalPlays = 0;
    let totalPlaytime = 0;
    let highestScore = 0;

    Object.values(stats.games).forEach(game => {
        totalPlays += game.playCount;
        totalPlaytime += game.totalPlayTime;
        if (game.highScore > highestScore) {
            highestScore = game.highScore;
        }
    });

    document.getElementById('total-plays').textContent = totalPlays;
    document.getElementById('total-playtime').textContent =
        Math.floor(totalPlaytime / 60) + '分鐘';
    document.getElementById('highest-score').textContent = highestScore;

    // 更新遊戲列表
    updateGamesList(stats.games);
}

// 更新遊戲列表
function updateGamesList(games) {
    const container = document.querySelector('.games-list');
    container.innerHTML = '';

    Object.entries(games).forEach(([id, game]) => {
        const card = document.createElement('div');
        card.className = 'game-stat-card';
        card.innerHTML = `
            <h3>${id}</h3>
            <div class="game-stats">
                <div class="stat">
                    <i class="fas fa-play"></i>
                    <span>遊玩次數: ${game.playCount}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-clock"></i>
                    <span>總時間: ${Math.floor(game.totalPlayTime / 60)}分鐘</span>
                </div>
                <div class="stat">
                    <i class="fas fa-trophy"></i>
                    <span>最高分: ${game.highScore}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-calendar"></i>
                    <span>最後遊玩: ${new Date(game.lastPlayed).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// 初始化圖表
function initializeCharts() {
    // 每日訪問圖表
    const dailyVisitsCtx = document.getElementById('daily-visits-chart').getContext('2d');
    window.dailyVisitsChart = new Chart(dailyVisitsCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '每日訪問量',
                data: [],
                borderColor: '#2196F3',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // 遊戲比較圖表
    const gamesComparisonCtx = document.getElementById('games-comparison-chart').getContext('2d');
    window.gamesComparisonChart = new Chart(gamesComparisonCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: '遊玩次數',
                data: [],
                backgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // 活躍時段圖表
    const activeHoursCtx = document.getElementById('active-hours-chart').getContext('2d');
    window.activeHoursChart = new Chart(activeHoursCtx, {
        type: 'radar',
        data: {
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            datasets: [{
                label: '活躍度',
                data: new Array(24).fill(0),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // 瀏覽器分布圖表
    const browserCtx = document.getElementById('browser-chart').getContext('2d');
    window.browserChart = new Chart(browserCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF9800',
                    '#2196F3',
                    '#4CAF50',
                    '#F44336',
                    '#9C27B0'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // 平台分布圖表
    const platformCtx = document.getElementById('platform-chart').getContext('2d');
    window.platformChart = new Chart(platformCtx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#2196F3',
                    '#4CAF50',
                    '#FF9800'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// 更新圖表數據
function updateCharts(tabId) {
    const stats = window.gameAnalytics.getAllStats();

    switch (tabId) {
        case 'overview':
            updateDailyVisitsChart(stats);
            break;
        case 'games':
            updateGamesComparisonChart(stats);
            break;
        case 'users':
            updateUserCharts(stats);
            break;
    }
}

// 更新每日訪問圖表
function updateDailyVisitsChart(stats) {
    const dailyStats = stats.dailyStats;
    const dates = Object.keys(dailyStats).sort();
    const visits = dates.map(date => dailyStats[date].visits);

    window.dailyVisitsChart.data.labels = dates;
    window.dailyVisitsChart.data.datasets[0].data = visits;
    window.dailyVisitsChart.update();
}

// 更新遊戲比較圖表
function updateGamesComparisonChart(stats) {
    const games = stats.games;
    const labels = Object.keys(games);
    const playCounts = labels.map(id => games[id].playCount);

    window.gamesComparisonChart.data.labels = labels;
    window.gamesComparisonChart.data.datasets[0].data = playCounts;
    window.gamesComparisonChart.update();
}

// 更新用戶相關圖表
function updateUserCharts(stats) {
    // 更新活躍時段圖表
    const hourlyData = new Array(24).fill(0);
    stats.sessions.forEach(session => {
        const hour = new Date(session.startTime).getHours();
        hourlyData[hour]++;
    });

    window.activeHoursChart.data.datasets[0].data = hourlyData;
    window.activeHoursChart.update();

    // 更新瀏覽器分布圖表
    const browsers = {};
    stats.sessions.forEach(session => {
        const browser = session.browserInfo ? session.browserInfo.browser : 'Unknown';
        browsers[browser] = (browsers[browser] || 0) + 1;
    });

    window.browserChart.data.labels = Object.keys(browsers);
    window.browserChart.data.datasets[0].data = Object.values(browsers);
    window.browserChart.update();

    // 更新平台分布圖表
    const platforms = {};
    stats.sessions.forEach(session => {
        const platform = session.browserInfo ? session.browserInfo.platform : 'Unknown';
        platforms[platform] = (platforms[platform] || 0) + 1;
    });

    window.platformChart.data.labels = Object.keys(platforms);
    window.platformChart.data.datasets[0].data = Object.values(platforms);
    window.platformChart.update();
}

// 檢查系統狀態
async function checkSystemStatus() {
    // 檢查 LocalStorage
    const localStorageStatus = document.getElementById('localStorage-status');
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        localStorageStatus.textContent = '可用';
        localStorageStatus.className = 'status-ok';
    } catch (e) {
        localStorageStatus.textContent = '不可用';
        localStorageStatus.className = 'status-error';
    }

    // 檢查 IndexedDB
    const indexedDBStatus = document.getElementById('indexedDB-status');
    try {
        const request = indexedDB.open('test', 1);
        request.onsuccess = () => {
            indexedDBStatus.textContent = '可用';
            indexedDBStatus.className = 'status-ok';
            request.result.close();
            indexedDB.deleteDatabase('test');
        };
        request.onerror = () => {
            throw new Error();
        };
    } catch (e) {
        indexedDBStatus.textContent = '不可用';
        indexedDBStatus.className = 'status-error';
    }

    // 檢查 Service Worker
    const swStatus = document.getElementById('sw-status');
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.getRegistration();
            swStatus.textContent = registration ? '已啟用' : '未啟用';
            swStatus.className = registration ? 'status-ok' : 'status-warning';
        } catch (e) {
            swStatus.textContent = '不可用';
            swStatus.className = 'status-error';
        }
    } else {
        swStatus.textContent = '不支援';
        swStatus.className = 'status-error';
    }

    // 檢查網路連接
    const networkStatus = document.getElementById('network-status');
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    function updateNetworkStatus() {
        if (navigator.onLine) {
            networkStatus.textContent = '已連接';
            networkStatus.className = 'status-ok';
        } else {
            networkStatus.textContent = '未連接';
            networkStatus.className = 'status-error';
        }
    }
}

// 添加錯誤日誌
function addErrorLog(error) {
    const logContainer = document.getElementById('error-log');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
        <div class="log-time">${new Date().toLocaleString()}</div>
        <div class="log-message">${error.message}</div>
        ${error.stack ? `<div class="log-stack">${error.stack}</div>` : ''}
    `;
    logContainer.insertBefore(logEntry, logContainer.firstChild);
    
    // 限制日誌條目數量
    while (logContainer.children.length > 100) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// 顯示確認對話框
function showConfirmation(action) {
    const modal = document.getElementById('confirmationModal');
    const title = document.getElementById('modalTitle');
    const message = document.getElementById('modalMessage');
    const confirmButton = document.getElementById('confirmButton');

    switch (action) {
        case 'clearRatings':
            title.textContent = '清空評分';
            message.textContent = '您確定要清空所有遊戲的評分數據嗎？此操作無法撤銷。';
            confirmButton.onclick = () => {
                clearRatings();
                hideConfirmation();
            };
            break;
        case 'clearComments':
            title.textContent = '清空評論';
            message.textContent = '您確定要清空所有遊戲的評論數據嗎？此操作無法撤銷。';
            confirmButton.onclick = () => {
                clearComments();
                hideConfirmation();
            };
            break;
        case 'exportComments':
            title.textContent = '導出評論';
            message.textContent = '您確定要導出所有遊戲的評論數據嗎？';
            confirmButton.onclick = () => {
                exportComments();
                hideConfirmation();
            };
            break;
        case 'clearAllData':
            title.textContent = '清空所有數據';
            message.textContent = '您確定要清空所有遊戲的評分和評論數據嗎？此操作無法撤銷。';
            confirmButton.onclick = () => {
                clearAllData();
                hideConfirmation();
            };
            break;
        case 'exportAllData':
            title.textContent = '導出所有數據';
            message.textContent = '您確定要導出所有遊戲的評分和評論數據嗎？';
            confirmButton.onclick = () => {
                exportAllData();
                hideConfirmation();
            };
            break;
    }

    modal.style.display = 'flex';
}

// 隱藏確認對話框
function hideConfirmation() {
    document.getElementById('confirmationModal').style.display = 'none';
}

// 顯示成功提示
function showSuccess() {
    const message = document.getElementById('successMessage');
    message.style.display = 'block';
    setTimeout(() => {
        message.style.display = 'none';
    }, 3000);
}

// 清空評分
function clearRatings() {
    const ratings = {
        'shooting-game': { score: 0, count: 0, ratings: [] },
        'simulation-game': { score: 0, count: 0, ratings: [] },
        'cafe-game': { score: 0, count: 0, ratings: [] }
    };
    localStorage.setItem('gameRatings', JSON.stringify(ratings));
    updateStats();
    showSuccess();
}

// 清空評論
function clearComments() {
    localStorage.removeItem('gameComments');
    updateStats();
    showSuccess();
}

// 導出評論
function exportComments() {
    const comments = JSON.parse(localStorage.getItem('gameComments')) || {};
    downloadJSON(comments, 'game-comments.json');
}

// 清空所有數據
function clearAllData() {
    clearRatings();
    clearComments();
    showSuccess();
}

// 導出所有數據
function exportAllData() {
    const data = {
        ratings: JSON.parse(localStorage.getItem('gameRatings')) || {},
        comments: JSON.parse(localStorage.getItem('gameComments')) || {}
    };
    downloadJSON(data, 'game-data.json');
}

// 下載 JSON 文件
function downloadJSON(data, filename) {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', filename);
    linkElement.click();
}