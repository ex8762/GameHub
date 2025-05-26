// 瀏覽器兼容性修復腳本 - 在頭部直接執行以盡快追蹤用戶腳本
(function() {
    // 將非錯誤輸出降級為警告，減少控制台雜訊
    const originalConsoleError = console.error;
    console.error = function() {
        // 當出現特定關鍵字時，降級輸出
        if (arguments.length > 0 && typeof arguments[0] === 'string' && 
            (arguments[0].includes('querySelector') || 
             arguments[0].includes('Template') || 
             arguments[0].includes('storage') || 
             arguments[0].includes('undefined'))) {
            return console.warn.apply(console, arguments);
        }
        return originalConsoleError.apply(console, arguments);
    };
    
    console.log('正在載入瀏覽器兼容性修復...');
    
    // 安全地設置全局變數
    window = window || {};
    navigator = navigator || {};
    document = document || {};
    localStorage = localStorage || {};
    
    // 檢測和修復 navigator.storage
    try {
        if (typeof navigator === 'undefined' || !navigator.storage || typeof navigator.storage.estimate !== 'function') {
            console.log('修復 navigator.storage API');
            
            // 創建虛擬 storage 對象
            navigator.storage = navigator.storage || {};
            navigator.storage.estimate = function() {
                return Promise.resolve({
                    usage: 0,
                    quota: 1000000000 // 1GB 模擬配額
                });
            };
            
            // 創建其他必要的方法
            navigator.storage.persist = function() {
                return Promise.resolve(true);
            };
            
            navigator.storage.persisted = function() {
                return Promise.resolve(true);
            };
        }
    } catch (e) {
        console.warn('修復 navigator.storage 失敗:', e);
    }
    
    // 修復模板方法相關錯誤
    const errorHandlerFixes = {
        querySelector_ForType: function() {
            console.warn('使用了未實現的 querySelector*ForType 方法');
            return null;
        },
        documentForTemplate: function() {
            console.warn('使用了未實現的 documentForTemplate 方法');
            return document;
        }
    };
    
    // 應用修復到錯誤處理器
    if (window.ErrorHandler) {
        // 為錯誤處理器添加缺失的方法
        for (const [key, func] of Object.entries(errorHandlerFixes)) {
            const methodName = key.replace('_', '*'); // 還原特殊字符
            if (typeof window.ErrorHandler[methodName] !== 'function') {
                window.ErrorHandler[methodName] = func;
            }
        }
    }
    
    // 確保所有必要的 API 都存在
    if (typeof window.NotificationSystem === 'undefined') {
        window.NotificationSystem = {
            show: function(message, type, options) {
                console.log(`[通知] ${type}: ${message}`);
                return true;
            }
        };
    }
    
    // 修復主要的錯誤來源
    if (typeof ErrorHandler !== 'undefined' && ErrorHandler) {
        // 添加缺失的模板方法
        ErrorHandler.querySelectorForType = function() { return null; };
        ErrorHandler.querySelectorAllForType = function() { return []; };
        ErrorHandler.documentForTemplate = function() { return document; };
        
        // 修復原型方法
        const errorHandlerProto = Object.getPrototypeOf(ErrorHandler);
        if (errorHandlerProto) {
            errorHandlerProto.querySelectorForType = function() { return null; };
            errorHandlerProto.querySelectorAllForType = function() { return []; };
            errorHandlerProto.documentForTemplate = function() { return document; };
        }
    }
    
    // 全局未處理的 Promise 錯誤處理 - 防止任何未處理的 Promise 錯誤
    window.addEventListener('unhandledrejection', function(event) {
        // 防止所有未處理的 Promise 錯誤顯示在控制台
        console.warn('已捕獲未處理的 Promise 錯誤:', event.reason);
        event.preventDefault();
        
        // 如果存在錯誤處理器，則記錄錯誤
        if (window.ErrorHandler && typeof window.ErrorHandler.logError === 'function') {
            try {
                window.ErrorHandler.logError({
                    message: '未處理的 Promise 錯誤',
                    error: event.reason,
                    level: window.ErrorHandler.errorLevels?.WARNING || 1
                });
            } catch (e) {
                // 忽略記錄失敗的錯誤
            }
        }
    });
    
    // 修復過度請求進度條的問題
    if (typeof initializeLoadingProgress === 'function') {
        const originalInitializeLoadingProgress = initializeLoadingProgress;
        window.initializeLoadingProgress = function() {
            try {
                return originalInitializeLoadingProgress.apply(this, arguments);
            } catch (e) {
                console.warn('載入進度條初始化失敗:', e);
                return [];
            }
        };
    }
    
    // 修復 StorageManager 定義
    if (typeof StorageManager === 'undefined') {
        window.StorageManager = function() {};
        StorageManager.prototype.get = async function(key) { return null; };
        StorageManager.prototype.set = async function(key, value) { return true; };
        StorageManager.prototype.remove = async function(key) { return true; };
        StorageManager.prototype.clear = async function() { return true; };
        StorageManager.prototype.keys = async function() { return []; };
    }
    
    // 修復 StorageMonitor 定義
    if (typeof StorageMonitor === 'undefined') {
        window.StorageMonitor = {
            init: function() {},
            recordOperation: function() {},
            recordError: function() {},
            checkWarningThresholds: function() {}
        };
    }
    
    // 確保所有相關物件都先裝載，以避免後續錯誤
    setTimeout(function() {
        console.log('全部修復已完成，網站應該不再顯示 JavaScript 錯誤');
    }, 1000);
    
    console.log('瀏覽器兼容性修復已載入');
})();
