// 主要的JavaScript檔案載入順序管理

// 共用變數
window.gameConfig = {
    version: '1.0.0',
    debug: false,
    features: {
        offlineSupport: true,
        localStorageSupport: true,
        serviceWorkerSupport: 'serviceWorker' in navigator
    }
};

// 載入所需的JavaScript文件
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// 依順序載入所有必要的指令碼
async function loadScripts() {
    try {        // 首先載入錯誤處理
        await loadScript('assets/js/error-handler.js');
        
        // 載入存儲管理器
        await loadScript('assets/js/storage-manager.js');
        
        // 載入系統健康監控
        await loadScript('assets/js/system-health.js');
        
        // 載入維護系統
        await loadScript('assets/js/maintenance.js');
        
        // 載入分享處理器
        await loadScript('assets/js/share-target.js');
        
        // 最後載入主要應用程式
        await loadScript('assets/js/main.js');
        
        // 初始化應用程式
        initializeApp();
    } catch (error) {
        console.error('載入指令碼失敗:', error);
        // 使用一般alert,因為此時NotificationSystem可能還未載入
        alert('應用程式載入失敗,請重新整理頁面');
    }
}

// 初始化應用程式
function initializeApp() {
    if (window.ErrorHandler) {
        window.ErrorHandler.init();
    }
    
    if (window.maintenanceSystem) {
        window.maintenanceSystem.init();
    }
    
    // 確保所有必要的功能都已載入
    if (window.storageManager && window.NotificationSystem) {
        window.NotificationSystem.show('應用程式已就緒', 'success', {
            duration: 3000
        });
    }
}

// 當文檔載入完成時開始載入指令碼
document.addEventListener('DOMContentLoaded', loadScripts);
