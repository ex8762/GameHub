// 通知系統
const NotificationSystem = {
    container: null,
    queue: [],
    isProcessing: false,

    init() {
        // 確保容器存在
        if (!document.getElementById("notification-container")) {
            this.container = document.createElement("div");
            this.container.id = "notification-container";
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById("notification-container");
        }
    },

    show(message, type = "info", options = {}) {
        if (!message || !this.container) return;

        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="${this.getIconClass(type)}"></i>
            <span class="message">${message}</span>
            <button class="close-btn">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加到佇列
        this.queue.push({
            element: notification,
            options: {
                duration: options.duration || 5000,
                ...options
            }
        });

        // 如果沒有正在處理的通知，開始處理佇列
        if (!this.isProcessing) {
            this.processQueue();
        }
    },

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const { element, options } = this.queue.shift();

            this.container.appendChild(element);
            element.style.animation = "slideIn 0.3s ease-out";

            // 點擊關閉按鈕時移除通知
            const closeBtn = element.querySelector(".close-btn");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => this.close(element));
            }

            // 如果設置了自動關閉
            if (options.duration !== 0) {
                await new Promise(resolve => setTimeout(resolve, options.duration));
                await this.close(element);
            }
        }

        this.isProcessing = false;
    },

    async close(notification) {
        if (!notification) return;

        notification.style.animation = "slideOut 0.3s ease-out";
        await new Promise(resolve => setTimeout(resolve, 300));
        notification.remove();
    },

    getIconClass(type) {
        switch (type) {
            case "success":
                return "fas fa-check-circle";
            case "warning":
                return "fas fa-exclamation-triangle";
            case "error":
                return "fas fa-times-circle";
            default:
                return "fas fa-info-circle";
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    NotificationSystem.init();
    if (!window.NotificationSystem) {
        window.NotificationSystem = NotificationSystem;
    }
});
