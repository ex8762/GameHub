// 簡化的錯誤處理系統
var ErrorHandler = {
    errorLevels: {
        INFO: "info",
        WARNING: "warning",
        ERROR: "error"
    },    init: function() {
        var self = this;
        window.onerror = function(message, source, lineno, colno, error) {
            self.handleError(error || new Error(message), self.errorLevels.ERROR);
            return true;
        };

        window.addEventListener("unhandledrejection", (event) => {
            this.handleError(event.reason, this.errorLevels.ERROR);
        });
    },

    handleError(error, level = this.errorLevels.ERROR) {
        console.error("錯誤：", error);

        const errorInfo = {
            message: error.message || String(error),
            stack: error.stack,
            timestamp: new Date().toISOString(),
            level
        };

        this.storeError(errorInfo);

        if (window.showNotification) {
            window.showNotification(errorInfo.message, level);
        }
    },

    storeError(errorInfo) {
        try {
            const errors = JSON.parse(localStorage.getItem("errors") || "[]");
            errors.unshift(errorInfo);
            
            if (errors.length > 100) {
                errors.length = 100;
            }
            
            localStorage.setItem("errors", JSON.stringify(errors));
        } catch (err) {
            console.error("無法儲存錯誤記錄：", err);
        }
    },

    showError(message) {
        this.handleError(new Error(message), this.errorLevels.ERROR);
    },

    showWarning(message) {
        this.handleError(new Error(message), this.errorLevels.WARNING);
    },

    showInfo(message) {
        this.handleError(new Error(message), this.errorLevels.INFO);
    },

    getErrors() {
        try {
            return JSON.parse(localStorage.getItem("errors") || "[]");
        } catch (err) {
            console.error("無法讀取錯誤記錄：", err);
            return [];
        }
    },

    clearErrors() {
        try {
            localStorage.removeItem("errors");
            return true;
        } catch (err) {
            console.error("無法清除錯誤記錄：", err);
            return false;
        }
    }
};

// 初始化錯誤處理器
document.addEventListener("DOMContentLoaded", () => {
    ErrorHandler.init();
});

// 導出到全局
window.ErrorHandler = ErrorHandler;
