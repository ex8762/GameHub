// 改進的通知系統
window.NotificationSystem = window.NotificationSystem || {
    types: {
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error'
    },

    sounds: {
        info: null,
        success: 'success-sound',
        warning: 'warning-sound',
        error: 'error-sound'
    },

    queue: [],
    isProcessing: false,

    init() {
        // 確保容器存在
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            document.body.appendChild(container);
        }

        // 初始化音效
        this.initSounds();
    },

    initSounds() {
        const soundsPath = 'assets/sounds/';
        Object.entries(this.sounds).forEach(([type, filename]) => {
            if (filename) {
                const audio = new Audio(`${soundsPath}${filename}.mp3`);
                audio.preload = 'auto';
                this.sounds[type] = audio;
            }
        });
    },

    show(message, type = 'info', options = {}) {
        const defaultOptions = {
            duration: 5000,
            progress: true,
            sound: true,
            closeable: true
        };

        const finalOptions = {...defaultOptions, ...options };

        // 添加到隊列
        this.queue.push({ message, type, options: finalOptions });

        // 如果沒有正在處理的通知，開始處理
        if (!this.isProcessing) {
            this.processQueue();
        }
    },

    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const { message, type, options } = this.queue.shift();

        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getIconClass(type)}"></i>
                <span>${message}</span>
                ${options.closeable ? `
                    <button class="notification-close" aria-label="關閉通知">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
            ${options.progress ? '<div class="notification-progress"></div>' : ''}
        `;
        
        // 播放音效
        if (options.sound && this.sounds[type] && typeof this.sounds[type].play === 'function') {
            try {
                await this.sounds[type].play();
            } catch (error) {
                console.warn('無法播放通知音效:', error);
            }
        }

        const container = document.getElementById('notification-container');
        if (container) container.appendChild(notification);

        // 添加關閉功能
        if (options.closeable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => this.close(notification));
            
            // 鍵盤可訪問性
            closeBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.close(notification);
                }
            });
        }

        // 自動關閉
        if (options.duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    this.close(notification);
                }
            }, options.duration);
        }

        // 處理下一個通知
        setTimeout(() => this.processQueue(), 300);
    },

    close(notification) {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
            
            // 檢查是否需要移除容器
            const container = document.getElementById('notification-container');
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, 300);
    },

    getIconClass(type) {
        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-exclamation-circle'
        };
        return icons[type] || icons.info;
    }
};

// 初始化通知系統
document.addEventListener('DOMContentLoaded', () => {
    NotificationSystem.init();
});

// 導出通知系統供其他模組使用
window.NotificationSystem = NotificationSystem;
