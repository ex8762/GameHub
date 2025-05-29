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
        } else {
            // 清除現有通知
            this.clearAll();
        }

        // 初始化音效
        this.initSounds();
        
        // 檢查是否為伺服器環境
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            console.log('伺服器環境已檢測，清除存儲指標相關通知');
            // 在伺服器環境下清除存儲指標相關通知
            this.removeStorageRelatedNotifications();
        }
    },
    
    async initSounds() {
        const soundsPath = '/assets/sounds/';
        const defaultSounds = {
            info: null,  // 資訊提示不播放音效
            success: 'success-sound',
            warning: 'warning-sound',
            error: 'error-sound'
        };

        // 重置音效設定
        this.sounds = {...defaultSounds};
        
        // 靜默載入音效
        for (const [type, filename] of Object.entries(this.sounds)) {
            if (filename) {
                try {
                    const audio = new Audio();
                    audio.preload = 'auto';
                    audio.src = `${soundsPath}${filename}.mp3`;
                    
                    // 使用 Promise 處理載入並加入錯誤處理
                    await new Promise((resolve, reject) => {
                        audio.oncanplaythrough = resolve;
                        audio.onerror = () => {
                            console.warn(`無法載入音效: ${filename}`);
                            resolve(); // 即使載入失敗也繼續執行
                        };
                    });

                    await new Promise((resolve) => {
                        audio.addEventListener('canplaythrough', resolve, { once: true });
                        audio.addEventListener('error', () => {
                            console.warn(`音效載入失敗: ${filename}.mp3`);
                            resolve();
                        });
                    });
                    
                    if (audio.error) {
                        this.sounds[type] = null;
                    } else {
                        this.sounds[type] = audio;
                    }
                } catch (error) {
                    console.warn(`音效初始化失敗: ${filename}`, error);
                    this.sounds[type] = null;
                }
            }
        }
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
    },
    
    // 清除所有通知
    clearAll() {
        const container = document.getElementById('notification-container');
        if (container) {
            // 清除所有通知
            const notifications = container.querySelectorAll('.notification');
            notifications.forEach(notification => {
                this.close(notification);
            });
        }
        
        // 清除陸列
        this.queue = [];
        this.isProcessing = false;
    },
    
    // 清除存儲相關通知
    removeStorageRelatedNotifications() {
        const container = document.getElementById('notification-container');
        if (container) {
            // 選擇所有存儲相關的通知
            const notifications = container.querySelectorAll('.notification');
            notifications.forEach(notification => {
                const text = notification.textContent || '';
                if (text.includes('存儲') || 
                    text.includes('存儲指標') || 
                    text.includes('存處指標')) {
                    this.close(notification);
                }
            });
        }
        
        // 過濟通知陸列中的存儲相關通知
        this.queue = this.queue.filter(item => {
            const message = item.message || '';
            return !(
                message.includes('存儲') || 
                message.includes('存儲指標') || 
                message.includes('存處指標')
            );
        });
    }
};

// 初始化通知系統
// 創建一個簡化版的通知系統作為備用
document.addEventListener('DOMContentLoaded', () => {
    // 確保我們有一個可用的通知系統
    if (!window.NotificationSystem || typeof window.NotificationSystem.init !== 'function') {
        // 如果沒有或方法不存在，則創建一個簡化版本
        window.NotificationSystem = {
            init: function() {
                console.log('簡化版通知系統初始化成功');
                // 確保容器存在
                if (!document.getElementById('notification-container')) {
                    const container = document.createElement('div');
                    container.id = 'notification-container';
                    document.body.appendChild(container);
                }
                return true;
            },
            show: function(message, type = 'info', options = {}) {
                console.log(`[通知] ${type}: ${message}`);
                // 簡化版通知顯示
                alert(message);
                return true;
            },
            // 其他必要的方法
            initSounds: function() { return true; }
        };
    }
    
    // 初始化通知系統
    try {
        window.NotificationSystem.init();
    } catch (err) {
        console.warn('通知系統初始化時發生錯誤，但網站仍會繼續運作', err);
    }
});
