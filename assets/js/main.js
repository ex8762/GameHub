// 主要的 JavaScript 功能

document.addEventListener('DOMContentLoaded', function() {
    try {
        checkAndInitializeFeatures();
        initializeMobileMenu();
        initializeImagePreview();
        initializeRatingSystem();
        initializeCommentSystem();
        initializeSearchSystem();
        initializeLoadingProgress();
        initializeRecommendationSystem();
        initializeFavoriteSystem();
        initializeShareSystem();
        initializeAnalytics();
    } catch (error) {
        console.error('初始化錯誤:', error);
        NotificationSystem.show('某些功能可能無法使用', 'error');
    }
});

// 改進的通知系統
const NotificationSystem = {
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

// 全局錯誤處理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('全局錯誤:', { message, source, lineno, colno, error });
    NotificationSystem.show(
        '發生錯誤，請稍後再試',
        NotificationSystem.types.ERROR,
        { duration: 8000 }
    );
};

// 導出通知系統供其他模組使用
window.NotificationSystem = NotificationSystem;

// 功能檢查和初始化
function checkAndInitializeFeatures() {
    // 檢查 LocalStorage 可用性
    const isLocalStorageAvailable = () => {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
        } catch (e) {
            console.warn('LocalStorage 不可用:', e);
            return false;
        }
    };

    // 檢查 Clipboard API 可用性
    const isClipboardAvailable = () => {
        return !!navigator.clipboard;
    };

    // 檢查 Share API 可用性
    const isShareAvailable = () => {
        return !!navigator.share;
    };

    // 初始化功能狀態
    window.gameFeatures = {
        localStorage: isLocalStorageAvailable(),
        clipboard: isClipboardAvailable(),
        share: isShareAvailable()
    };

    // 如果 LocalStorage 不可用，使用內存存儲
    if (!window.gameFeatures.localStorage) {
        window.memoryStorage = {
            gameRatings: {},
            gameComments: {},
            gameFavorites: []
        };
    }
}

// 安全的存儲操作
class StorageManager {
    constructor() {
        this.initStorage();
        this.retryAttempts = 3;
        this.retryDelay = 1000;
    }

    initStorage() {
        this.storageType = this.checkStorageAvailability();
        if (this.storageType === 'memory') {
            window.memoryStorage = window.memoryStorage || {};
            window.ErrorHandler.logError({
                message: '使用內存存儲模式',
                level: window.ErrorHandler.errorLevels.WARNING
            });
        }
    }

    checkStorageAvailability() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return 'localStorage';
        } catch (e) {
            window.ErrorHandler.logError({
                message: 'LocalStorage 不可用',
                error: e,
                level: window.ErrorHandler.errorLevels.WARNING
            });
            return 'memory';
        }
    }

    async get(key, defaultValue = null) {
        return this.retry(async () => {
            try {
                let value;
                if (this.storageType === 'localStorage') {
                    value = localStorage.getItem(key);
                } else {
                    value = window.memoryStorage[key];
                }

                if (value === null || value === undefined) {
                    return defaultValue;
                }

                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            } catch (e) {
                throw new Error(`讀取數據失敗: ${key}`);
            }
        });
    }

    async set(key, value) {
        return this.retry(async () => {
            try {
                const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);

                if (this.storageType === 'localStorage') {
                    localStorage.setItem(key, serializedValue);
                } else {
                    window.memoryStorage[key] = serializedValue;
                }

                return true;
            } catch (e) {
                throw new Error(`保存數據失敗: ${key}`);
            }
        });
    }

    async remove(key) {
        return this.retry(async () => {
            try {
                if (this.storageType === 'localStorage') {
                    localStorage.removeItem(key);
                } else {
                    delete window.memoryStorage[key];
                }
                return true;
            } catch (e) {
                throw new Error(`删除數據失敗: ${key}`);
            }
        });
    }

    async clear() {
        return this.retry(async () => {
            try {
                if (this.storageType === 'localStorage') {
                    localStorage.clear();
                } else {
                    window.memoryStorage = {};
                }
                return true;
            } catch (e) {
                throw new Error('清空數據失敗');
            }
        });
    }

    async keys() {
        return this.retry(async () => {
            try {
                if (this.storageType === 'localStorage') {
                    return Object.keys(localStorage);
                } else {
                    return Object.keys(window.memoryStorage);
                }
            } catch (e) {
                throw new Error('獲取鍵列表失敗');
            }
        });
    }

    // 重試機制
    async retry(operation) {
        let lastError;
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (attempt < this.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                    this.retryDelay *= 2; // 指數退避
                }

                // 記錄重試嘗試
                window.ErrorHandler.logError({
                    message: `${error.message} (嘗試 ${attempt}/${this.retryAttempts})`,
                    error: error,
                    level: attempt === this.retryAttempts ? 
                          window.ErrorHandler.errorLevels.ERROR : 
                          window.ErrorHandler.errorLevels.WARNING
                });

                // 如果是 localStorage 錯誤且最後一次嘗試失敗，切換到內存存儲
                if (attempt === this.retryAttempts && this.storageType === 'localStorage') {
                    this.switchToMemoryStorage();
                }
            }
        }
        throw lastError;
    }

    // 切換到內存存儲
    switchToMemoryStorage() {
        this.storageType = 'memory';
        window.memoryStorage = window.memoryStorage || {};
        window.ErrorHandler.logError({
            message: '已切換至內存存儲模式',
            level: window.ErrorHandler.errorLevels.WARNING
        });
    }

    // 維護操作
    async maintenance() {
        try {
            // 檢查並清理過期數據
            const keys = await this.keys();
            const cleanupTasks = keys.map(async key => {
                const value = await this.get(key);
                if (this.isExpired(value)) {
                    await this.remove(key);
                }
            });

            await Promise.all(cleanupTasks);

            // 檢查存儲空間使用情況
            if (this.storageType === 'localStorage') {
                this.checkStorageQuota();
            }

        } catch (error) {
            window.ErrorHandler.logError({
                message: '存儲維護失敗',
                error: error,
                level: window.ErrorHandler.errorLevels.WARNING
            });
        }
    }

    // 檢查數據是否過期
    isExpired(value) {
        if (value && value.expireAt) {
            return new Date(value.expireAt).getTime() < Date.now();
        }
        return false;
    }

    // 檢查存儲配額使用情況
    checkStorageQuota() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length * 2; // UTF-16 編碼，每個字符 2 字節
                }
            }

            const quotaPercentage = (totalSize / (5 * 1024 * 1024)) * 100; // 假設配額為 5MB
            if (quotaPercentage > 80) {
                window.ErrorHandler.logError({
                    message: `存儲空間使用率高: ${Math.round(quotaPercentage)}%`,
                    level: window.ErrorHandler.errorLevels.WARNING
                });
            }
        } catch (error) {
            window.ErrorHandler.logError({
                message: '檢查存儲配額失敗',
                error: error,
                level: window.ErrorHandler.errorLevels.WARNING
            });
        }
    }
}

// 創建全局存儲管理器實例
window.storageManager = new StorageManager();

// 定期執行存儲維護
setInterval(() => {
    window.storageManager.maintenance();
}, 30 * 60 * 1000); // 每30分鐘執行一次

// 改進的圖片載入處理
function handleImageLoad(img) {
    return new Promise((resolve, reject) => {
        if (img.complete) {
            resolve();
        } else {
            img.onload = resolve;
            img.onerror = () => {
                img.src = 'assets/images/placeholder.svg';
                reject(new Error('圖片載入失敗'));
            };
        }
    });
}

// 移動端導航功能
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-bars');
        this.querySelector('i').classList.toggle('fa-times');
    });

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navLinks.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
        });
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('nav')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.querySelector('i').classList.add('fa-bars');
            mobileMenuBtn.querySelector('i').classList.remove('fa-times');
        }
    });
}

// 圖片預覽功能
function initializeImagePreview() {
    const modal = document.getElementById('imagePreviewModal');
    const previewImage = document.getElementById('previewImage');
    const closePreview = document.getElementById('closePreview');
    const gameScreenshots = document.querySelectorAll('.game-screenshot');

    gameScreenshots.forEach(screenshot => {
        screenshot.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                previewImage.src = img.src;
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closePreview.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// 評分系統功能
function initializeRatingSystem() {
    const gameRatings = document.querySelectorAll('.game-rating');
    const ratings = JSON.parse(localStorage.getItem('gameRatings')) || {
        'shooting-game': { score: 0, count: 0, ratings: [] },
        'simulation-game': { score: 0, count: 0, ratings: [] },
        'cafe-game': { score: 0, count: 0, ratings: [] }
    };

    localStorage.setItem('gameRatings', JSON.stringify(ratings));

    function updateRatingDisplay(gameId) {
        const rating = ratings[gameId];
        const ratingSection = document.querySelector(`#${gameId} .game-rating`);
        if (ratingSection && rating) {
            const stars = ratingSection.querySelectorAll('.stars i');
            const scoreDisplay = ratingSection.querySelector('.rating-score');
            const countDisplay = ratingSection.querySelector('.rating-count');

            stars.forEach((star, index) => {
                const starValue = index + 1;
                if (starValue <= Math.floor(rating.score)) {
                    star.className = 'fas fa-star';
                } else if (starValue === Math.ceil(rating.score) && rating.score % 1 !== 0) {
                    star.className = 'fas fa-star-half-alt';
                } else {
                    star.className = 'far fa-star';
                }
            });

            scoreDisplay.textContent = rating.score.toFixed(1);
            countDisplay.textContent = `(${rating.count} 人評分)`;

            const distribution = calculateRatingDistribution(rating.ratings);
            updateRatingDistribution(gameId, distribution);
        }
    }

    function calculateRatingDistribution(ratings) {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        (ratings || []).forEach(rating => {
            const roundedRating = Math.round(rating);
            distribution[roundedRating]++;
        });
        return distribution;
    }

    function updateRatingDistribution(gameId, distribution) {
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);
        const distributionHTML = Object.entries(distribution).map(([rating, count]) => {
            const percentage = (count / total) * 100;
            return `
                <div class="distribution-bar">
                    <span class="star-count">${rating}星</span>
                    <div class="bar-container">
                        <div class="bar" style="width: ${percentage}%"></div>
                    </div>
                    <span class="count">${count}</span>
                </div>
            `;
        }).join('');

        const distributionSection = document.querySelector(`#${gameId} .rating-distribution`);
        if (distributionSection) {
            distributionSection.innerHTML = distributionHTML;
        }
    }

    document.querySelectorAll('.game-rating').forEach(ratingSection => {
        const stars = ratingSection.querySelectorAll('.stars i');
        const gameId = ratingSection.closest('.game-section').id;

        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const newScore = index + 1;
                const currentRating = ratings[gameId];

                currentRating.ratings.push(newScore);
                const newCount = currentRating.count + 1;
                const newAverage = currentRating.ratings.reduce((a, b) => a + b, 0) / newCount;

                ratings[gameId] = {
                    ...currentRating,
                    score: newAverage,
                    count: newCount
                };

                localStorage.setItem('gameRatings', JSON.stringify(ratings));
                updateRatingDisplay(gameId);

                star.classList.add('animate-star');
                setTimeout(() => star.classList.remove('animate-star'), 300);
            });
        });
    });

    ['shooting-game', 'simulation-game', 'cafe-game'].forEach(updateRatingDisplay);
}

// 評論系統功能
function initializeCommentSystem() {
    const commentForms = document.querySelectorAll('.comment-form');
    const comments = JSON.parse(localStorage.getItem('gameComments')) || {};

    function loadComments(gameId) {
        const commentsList = document.getElementById(`${gameId}-comments`);
        const gameComments = comments[gameId] || [];

        if (gameComments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">還沒有評論，來發表第一條評論吧！</div>';
            return;
        }

        commentsList.innerHTML = gameComments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-user">${comment.username}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <div class="comment-rating">
                    ${Array(5).fill().map((_, i) => 
                        `<i class="fas fa-star${i < comment.rating ? '' : ' far'}"></i>`
                    ).join('')}
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `).join('');
    }

    commentForms.forEach(form => {
        const starsInput = form.querySelector('.stars-input');
        let selectedRating = 0;

        starsInput.querySelectorAll('i').forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                starsInput.querySelectorAll('i').forEach((s, i) => {
                    s.className = i < selectedRating ? 'fas fa-star' : 'far fa-star';
                });
            });
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const gameId = this.dataset.game;
            const username = this.querySelector('[name="username"]').value;
            const content = this.querySelector('[name="comment"]').value;
            
            if (!selectedRating) {
                alert('請選擇評分！');
                return;
            }

            const comment = {
                id: Date.now().toString(),
                username,
                content,
                rating: selectedRating,
                date: new Date().toLocaleDateString('zh-TW')
            };

            if (!comments[gameId]) {
                comments[gameId] = [];
            }
            comments[gameId].unshift(comment);
            localStorage.setItem('gameComments', JSON.stringify(comments));

            loadComments(gameId);
            this.reset();
            starsInput.querySelectorAll('i').forEach(star => {
                star.className = 'far fa-star';
            });
            selectedRating = 0;
        });
    });

    ['shooting-game', 'simulation-game', 'cafe-game'].forEach(loadComments);
}

// 搜尋功能
function initializeSearchSystem() {
    const searchBox = document.getElementById('gameSearch');
    const searchFilters = document.querySelectorAll('.filter-btn');

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function filterGames(searchTerm, activeFilter) {
        const gameSections = document.querySelectorAll('.game-section');
        gameSections.forEach(section => {
            const gameTitle = section.querySelector('h2').textContent.toLowerCase();
            const gameCategories = section.dataset.categories.split(' ');
            const matchesSearch = gameTitle.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || gameCategories.includes(activeFilter);
            section.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
        });
    }

    searchBox.addEventListener('input', debounce(function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        filterGames(searchTerm, activeFilter);
    }, 300));

    searchFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            searchFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            filterGames(searchBox.value.toLowerCase(), this.dataset.filter);
        });
    });
}

// 改進的遊戲載入功能
async function initializeLoadingProgress() {
    const playButtons = document.querySelectorAll('.play-button');
    
    // 預載入遊戲資源
    async function preloadGameResources(gameUrl) {
        const resources = [
            { type: '遊戲腳本', url: `${gameUrl}/js/game.js` },
            { type: '遊戲樣式', url: `${gameUrl}/css/game.css` },
            { type: '遊戲音效', url: `${gameUrl}/audio/background.mp3` },
            { type: '遊戲圖片', url: `${gameUrl}/images/sprites.png` }
        ];

        const results = await Promise.allSettled(
            resources.map(async resource => {
                try {
                    const response = await fetch(resource.url, { method: 'HEAD' });
                    return {
                        type: resource.type,
                        status: response.ok ? '成功' : '失敗',
                        size: response.headers.get('content-length') || 0
                    };
                } catch (e) {
                    return {
                        type: resource.type,
                        status: '失敗',
                        error: e.message
                    };
                }
            })
        );

        return results.filter(result => result.value?.status === '成功');
    }

    // 創建載入UI
    function createLoadingUI() {
        const ui = document.createElement('div');
        ui.className = 'loading-ui';
        ui.innerHTML = `
            <div class="loading-content">
                <div class="loading-header">
                    <h3>載入遊戲中</h3>
                    <button class="cancel-loading">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="loading-spinner"></div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">準備載入... 0%</div>
                </div>
                <div class="loading-details"></div>
            </div>
        `;
        return ui;
    }

    // 更新載入進度
    function updateLoadingProgress(ui, phase, progress, details = '') {
        const progressFill = ui.querySelector('.progress-fill');
        const progressText = ui.querySelector('.progress-text');
        const detailsContainer = ui.querySelector('.loading-details');

        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${phase}... ${Math.round(progress)}%`;

        if (details) {
            const detailElement = document.createElement('div');
            detailElement.className = 'loading-detail';
            detailElement.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>${details}</span>
            `;
            detailsContainer.appendChild(detailElement);
            
            // 自動滾動到最新詳情
            detailsContainer.scrollTop = detailsContainer.scrollHeight;
        }
    }

    // 處理遊戲載入
    async function handleGameLoad(gameUrl, gameSection) {
        const loadingUI = createLoadingUI();
        gameSection.appendChild(loadingUI);

        let isCancelled = false;
        const cancelButton = loadingUI.querySelector('.cancel-loading');
        cancelButton.addEventListener('click', () => {
            isCancelled = true;
            loadingUI.remove();
            NotificationSystem.show('已取消載入', 'info');
        });

        try {
            // 檢查遊戲可用性
            updateLoadingProgress(loadingUI, '檢查遊戲狀態', 10);
            const response = await fetch(gameUrl, { method: 'HEAD' });
            if (!response.ok) throw new Error('遊戲暫時無法訪問');
            if (isCancelled) return;

            // 預載入資源
            updateLoadingProgress(loadingUI, '檢查遊戲資源', 30, '遊戲可以訪問');
            const preloadedResources = await preloadGameResources(gameUrl);
            if (isCancelled) return;

            // 載入必要資源
            updateLoadingProgress(loadingUI, '載入遊戲資源', 50, '開始載入遊戲資源');
            for (let i = 0; i < preloadedResources.length; i++) {
                if (isCancelled) return;
                const resource = preloadedResources[i];
                const progress = 50 + (i + 1) * (30 / preloadedResources.length);
                updateLoadingProgress(
                    loadingUI, 
                    '載入遊戲資源', 
                    progress,
                    `已載入: ${resource.value.type}`
                );
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // 準備遊戲環境
            if (isCancelled) return;
            updateLoadingProgress(loadingUI, '準備遊戲環境', 90, '配置遊戲設置');
            await new Promise(resolve => setTimeout(resolve, 500));

            // 完成載入
            if (isCancelled) return;
            updateLoadingProgress(loadingUI, '載入完成', 100, '遊戲準備就緒！');
            NotificationSystem.show('遊戲載入完成', 'success');

            // 延遲跳轉以顯示完成狀態
            setTimeout(() => {
                if (!isCancelled) {
                    window.location.href = gameUrl;
                }
            }, 1000);

        } catch (error) {
            console.error('遊戲載入錯誤:', error);
            NotificationSystem.show(error.message, 'error');
            loadingUI.remove();
        }
    }

    // 為每個遊戲按鈕添加載入處理
    playButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const gameUrl = this.href;
            const gameSection = this.closest('.game-section');
            await handleGameLoad(gameUrl, gameSection);
        });
    });
}

// 遊戲推薦系統
function initializeRecommendationSystem() {
    const gameCategories = {
        'shooting-game': ['action'],
        'simulation-game': ['simulation', 'strategy'],
        'cafe-game': ['simulation']
    };
    
    function getGamePreferences() {
        const ratings = JSON.parse(localStorage.getItem('gameRatings')) || {};
        const preferences = {};
        
        Object.entries(ratings).forEach(([gameId, data]) => {
            if (data.score > 0) {
                const categories = gameCategories[gameId] || [];
                categories.forEach(category => {
                    preferences[category] = (preferences[category] || 0) + data.score;
                });
            }
        });
        
        return preferences;
    }
    
    function updateRecommendations() {
        const preferences = getGamePreferences();
        const games = document.querySelectorAll('.game-section');
        
        games.forEach(game => {
            const gameId = game.id;
            const categories = gameCategories[gameId] || [];
            let relevanceScore = 0;
            
            categories.forEach(category => {
                relevanceScore += preferences[category] || 0;
            });
            
            if (relevanceScore > 0) {
                const recommendationBadge = document.createElement('div');
                recommendationBadge.className = 'recommendation-badge';
                recommendationBadge.innerHTML = '<i class="fas fa-thumbs-up"></i> 推薦遊戲';
                
                const existingBadge = game.querySelector('.recommendation-badge');
                if (!existingBadge) {
                    game.querySelector('.game-info').appendChild(recommendationBadge);
                }
            }
        });
    }
    
    // 監聽評分變化
    window.addEventListener('storage', (e) => {
        if (e.key === 'gameRatings') {
            updateRecommendations();
        }
    });
    
    // 初始化推薦
    updateRecommendations();
}

// 遊戲收藏功能
function initializeFavoriteSystem() {
    const favorites = JSON.parse(localStorage.getItem('gameFavorites')) || [];
    
    function addFavoriteButton(gameSection) {
        const gameInfo = gameSection.querySelector('.game-info');
        const gameId = gameSection.id;
        const isFavorite = favorites.includes(gameId);
        
        const favoriteButton = document.createElement('button');
        favoriteButton.className = `favorite-button ${isFavorite ? 'active' : ''}`;
        favoriteButton.innerHTML = `
            <i class="fas ${isFavorite ? 'fa-heart' : 'fa-heart-o'}"></i>
            ${isFavorite ? '已收藏' : '收藏遊戲'}
        `;
        
        favoriteButton.addEventListener('click', () => {
            const index = favorites.indexOf(gameId);
            if (index === -1) {
                favorites.push(gameId);
                favoriteButton.classList.add('active');
                favoriteButton.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                NotificationSystem.show('遊戲已加入收藏！');
            } else {
                favorites.splice(index, 1);
                favoriteButton.classList.remove('active');
                favoriteButton.innerHTML = '<i class="fas fa-heart-o"></i> 收藏遊戲';
                NotificationSystem.show('遊戲已取消收藏');
            }
            localStorage.setItem('gameFavorites', JSON.stringify(favorites));
            updateFavoritesList();
        });
        
        gameInfo.insertBefore(favoriteButton, gameInfo.querySelector('.play-button'));
    }
    
    function updateFavoritesList() {
        const favoritesList = document.getElementById('favoritesList');
        if (!favoritesList) {
            createFavoritesList();
            return;
        }
        
        favoritesList.innerHTML = '';
        if (favorites.length === 0) {
            favoritesList.innerHTML = '<p class="no-favorites">還沒有收藏的遊戲</p>';
            return;
        }
        
        favorites.forEach(gameId => {
            const gameSection = document.getElementById(gameId);
            if (gameSection) {
                const gameTitle = gameSection.querySelector('h2').textContent;
                const gameItem = document.createElement('div');
                gameItem.className = 'favorite-item';
                gameItem.innerHTML = `
                    <span>${gameTitle}</span>
                    <button class="remove-favorite" data-game="${gameId}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                favoritesList.appendChild(gameItem);
            }
        });
        
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const gameId = e.currentTarget.dataset.game;
                const index = favorites.indexOf(gameId);
                if (index !== -1) {
                    favorites.splice(index, 1);
                    localStorage.setItem('gameFavorites', JSON.stringify(favorites));
                    updateFavoritesList();
                    
                    const favoriteButton = document.querySelector(`#${gameId} .favorite-button`);
                    if (favoriteButton) {
                        favoriteButton.classList.remove('active');
                        favoriteButton.innerHTML = '<i class="fas fa-heart-o"></i> 收藏遊戲';
                    }
                }
            });
        });
    }
    
    function createFavoritesList() {
        const favoritesSection = document.createElement('div');
        favoritesSection.className = 'favorites-section';
        favoritesSection.innerHTML = `
            <h3><i class="fas fa-heart"></i> 收藏的遊戲</h3>
            <div id="favoritesList"></div>
        `;
        
        const mainContent = document.querySelector('main');
        mainContent.insertBefore(favoritesSection, mainContent.firstChild);
        updateFavoritesList();
    }
    
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
        }, 100);
    }
    
    document.querySelectorAll('.game-section').forEach(addFavoriteButton);
    createFavoritesList();
}

// 遊戲分享功能
function initializeShareSystem() {
    function addShareButton(gameSection) {
        const gameInfo = gameSection.querySelector('.game-info');
        const gameId = gameSection.id;
        const gameTitle = gameSection.querySelector('h2').textContent;
        const gameUrl = `${window.location.origin}${window.location.pathname}#${gameId}`;
        
        const shareButton = document.createElement('button');
        shareButton.className = 'share-button';
        shareButton.innerHTML = '<i class="fas fa-share-alt"></i> 分享遊戲';
        
        shareButton.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: gameTitle,
                    text: `來玩「${gameTitle}」吧！`,
                    url: gameUrl
                })
                .then(() => NotificationSystem.show('分享成功！'))
                .catch(() => showShareDialog(gameTitle, gameUrl));
            } else {
                showShareDialog(gameTitle, gameUrl);
            }
        });
        
        gameInfo.insertBefore(shareButton, gameInfo.querySelector('.play-button'));
    }
    
    function showShareDialog(gameTitle, gameUrl) {
        const dialog = document.createElement('div');
        dialog.className = 'share-dialog';
        dialog.innerHTML = `
            <div class="share-content">
                <h3>分享遊戲</h3>
                <div class="share-options">
                    <button class="share-option" data-platform="facebook">
                        <i class="fab fa-facebook"></i> Facebook
                    </button>
                    <button class="share-option" data-platform="twitter">
                        <i class="fab fa-twitter"></i> Twitter
                    </button>
                    <button class="share-option" data-platform="line">
                        <i class="fab fa-line"></i> LINE
                    </button>
                    <button class="share-option copy-link">
                        <i class="fas fa-link"></i> 複製連結
                    </button>
                </div>
                <button class="close-dialog">關閉</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        dialog.querySelector('.close-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });
        
        dialog.querySelectorAll('.share-option').forEach(button => {
            button.addEventListener('click', () => {
                const platform = button.dataset.platform;
                let shareUrl = '';
                
                switch (platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(gameUrl)}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`來玩「${gameTitle}」吧！`)}&url=${encodeURIComponent(gameUrl)}`;
                        break;
                    case 'line':
                        shareUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(gameUrl)}`;
                        break;
                    default:
                        // 複製連結
                        navigator.clipboard.writeText(gameUrl)
                            .then(() => {
                                NotificationSystem.show('連結已複製到剪貼簿！');
                                dialog.remove();
                            });
                        return;
                }
                
                window.open(shareUrl, '_blank');
                dialog.remove();
            });
        });
    }
    
    document.querySelectorAll('.game-section').forEach(addShareButton);
}

// 遊戲數據統計和分析功能
function initializeAnalytics() {
    const analytics = safeStorage('get', 'gameAnalytics') || {
        visits: {},
        playTime: {},
        lastVisit: null,
        totalVisits: 0
    };

    // 更新訪問數據
    function updateVisitData() {
        const today = new Date().toISOString().split('T')[0];
        analytics.visits[today] = (analytics.visits[today] || 0) + 1;
        analytics.totalVisits++;
        analytics.lastVisit = new Date().toISOString();
        safeStorage('set', 'gameAnalytics', analytics);
    }

    // 追蹤遊戲時間
    function trackPlayTime(gameId) {
        if (!analytics.playTime[gameId]) {
            analytics.playTime[gameId] = {
                total: 0,
                sessions: []
            };
        }

        const startTime = Date.now();
        const session = {
            start: startTime,
            end: null,
            duration: 0
        };

        analytics.playTime[gameId].sessions.push(session);
        safeStorage('set', 'gameAnalytics', analytics);

        // 定期更新遊戲時間
        const interval = setInterval(() => {
            const currentTime = Date.now();
            session.end = currentTime;
            session.duration = (currentTime - startTime) / 1000; // 轉換為秒
            analytics.playTime[gameId].total = analytics.playTime[gameId].sessions.reduce(
                (total, session) => total + (session.duration || 0), 0
            );
            safeStorage('set', 'gameAnalytics', analytics);
        }, 10000); // 每10秒更新一次

        // 處理頁面關閉事件
        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
            session.end = Date.now();
            session.duration = (session.end - startTime) / 1000;
            analytics.playTime[gameId].total = analytics.playTime[gameId].sessions.reduce(
                (total, session) => total + (session.duration || 0), 0
            );
            safeStorage('set', 'gameAnalytics', analytics);
        });
    }

    // 創建數據展示面板
    function createAnalyticsPanel() {
        const panel = document.createElement('div');
        panel.className = 'analytics-panel';
        panel.innerHTML = `
            <div class="analytics-toggle">
                <i class="fas fa-chart-bar"></i>
            </div>
            <div class="analytics-content">
                <h3>遊戲數據統計</h3>
                <div class="analytics-data">
                    <div class="data-item">
                        <span class="label">總訪問次數</span>
                        <span class="value">${analytics.totalVisits}</span>
                    </div>
                    <div class="data-item">
                        <span class="label">最後訪問</span>
                        <span class="value">${analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleString() : '無'}</span>
                    </div>
                </div>
                <div class="analytics-chart">
                    <canvas id="visitsChart"></canvas>
                </div>
                <div class="play-time-stats">
                    <h4>遊戲時間統計</h4>
                    ${Object.entries(analytics.playTime).map(([gameId, data]) => `
                        <div class="play-time-item">
                            <span class="game-name">${document.getElementById(gameId)?.querySelector('h2')?.textContent || gameId}</span>
                            <span class="time">${formatPlayTime(data.total)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        // 切換面板顯示
        const toggle = panel.querySelector('.analytics-toggle');
        const content = panel.querySelector('.analytics-content');
        toggle.addEventListener('click', () => {
            content.classList.toggle('show');
            if (content.classList.contains('show')) {
                updateChart();
            }
        });

        // 更新圖表
        function updateChart() {
            const ctx = document.getElementById('visitsChart').getContext('2d');
            const dates = Object.keys(analytics.visits).slice(-7); // 最近7天
            const visits = dates.map(date => analytics.visits[date] || 0);

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates.map(date => formatDate(date)),
                    datasets: [{
                        label: '每日訪問量',
                        data: visits,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }

    // 格式化遊戲時間
    function formatPlayTime(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}秒`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}分鐘`;
        return `${Math.floor(seconds / 3600)}小時${Math.floor((seconds % 3600) / 60)}分鐘`;
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    // 初始化
    updateVisitData();
    createAnalyticsPanel();

    // 為每個遊戲添加時間追蹤
    document.querySelectorAll('.play-button').forEach(button => {
        const gameSection = button.closest('.game-section');
        if (gameSection) {
            button.addEventListener('click', () => {
                trackPlayTime(gameSection.id);
            });
        }
    });

    if (location.protocol === 'http:' || location.protocol === 'https:') {
        navigator.serviceWorker.register('service-worker.js').catch(()=>{});
    }
}

// Service Worker 註冊與錯誤處理
async function registerServiceWorker() {
    // 檢查是否支援 Service Worker
    if (!('serviceWorker' in navigator)) {
        console.warn('瀏覽器不支援 Service Worker');
        NotificationSystem.show('瀏覽器不支援離線功能', 'warning');
        return;
    }

    let retryCount = 0;
    const maxRetries = 3;

    async function attemptRegistration() {
        try {
            // 檢查是否已經註冊
            const existingRegistration = await navigator.serviceWorker.getRegistration();
            if (existingRegistration) {
                console.log('Service Worker 已註冊');
                monitorServiceWorker(existingRegistration);
                return true;
            }

            // 嘗試註冊
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('Service Worker 註冊成功');
            
            // 監控 Service Worker 狀態
            monitorServiceWorker(registration);
            return true;
        } catch (error) {
            console.error('Service Worker 註冊失敗:', error);
            NotificationSystem.show('離線功能啟用失敗，正在重試...', 'error');
            
            // 記錄錯誤日誌
            addErrorLog({
                message: 'Service Worker 註冊失敗',
                error: error,
                type: 'error'
            });
            
            return false;
        }
    }

    // 開始註冊流程
    while (retryCount < maxRetries) {
        if (await attemptRegistration()) {
            break;
        }
        retryCount++;
        if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒後重試
        }
    }

    if (retryCount === maxRetries) {
        NotificationSystem.show('離線功能啟用失敗，請稍後再試', 'error', {
            duration: 8000
        });
    }
}

// Service Worker 狀態監控
function monitorServiceWorker(registration) {
    registration.addEventListener('statechange', (e) => {
        console.log('Service Worker 狀態變更:', e.target.state);
        
        // 記錄重要狀態變更
        if (e.target.state === 'redundant') {
            NotificationSystem.show('Service Worker 已停用，請重新整理頁面', 'warning');
            addErrorLog({
                message: 'Service Worker 進入 redundant 狀態',
                type: 'warning'
            });
        }
    });

    // 監控更新
    registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                NotificationSystem.show('新版本可用，請重新整理頁面以更新', 'info', {
                    duration: 0,
                    closeable: true
                });
            }
        });
    });
}

// 存儲操作輔助函數
async function safeStorageOperation(operation, key, value = null) {
    try {
        switch (operation) {
            case 'get':
                return await window.storageManager.get(key, null);
            case 'set':
                return await window.storageManager.set(key, value);
            case 'remove':
                return await window.storageManager.remove(key);
            case 'clear':
                return await window.storageManager.clear();
            case 'keys':
                return await window.storageManager.keys();
            default:
                throw new Error('無效的存儲操作');
        }
    } catch (error) {
        // 記錄錯誤
        window.ErrorHandler.logError({
            message: `存儲操作失敗: ${operation}`,
            error: error,
            level: window.ErrorHandler.errorLevels.ERROR,
            context: {
                operation,
                key,
                hasValue: value !== null
            }
        });

        // 根據操作類型返回安全的預設值
        switch (operation) {
            case 'get':
                return null;
            case 'set':
            case 'remove':
            case 'clear':
                return false;
            case 'keys':
                return [];
            default:
                return null;
        }
    }
}

// 存儲系統監控
const StorageMonitor = {
    metrics: {
        operations: {
            total: 0,
            successful: 0,
            failed: 0
        },
        timing: {
            min: Infinity,
            max: 0,
            avg: 0,
            samples: []
        },
        errors: {
            byType: {},
            recent: []
        }
    },

    // 重置指標
    reset() {
        this.metrics = {
            operations: {
                total: 0,
                successful: 0,
                failed: 0
            },
            timing: {
                min: Infinity,
                max: 0,
                avg: 0,
                samples: []
            },
            errors: {
                byType: {},
                recent: []
            }
        };
    },

    // 記錄操作
    recordOperation(operation, success, duration) {
        this.metrics.operations.total++;
        if (success) {
            this.metrics.operations.successful++;
        } else {
            this.metrics.operations.failed++;
        }

        // 更新時間統計
        this.metrics.timing.samples.push(duration);
        this.metrics.timing.min = Math.min(this.metrics.timing.min, duration);
        this.metrics.timing.max = Math.max(this.metrics.timing.max, duration);
        this.metrics.timing.avg = this.metrics.timing.samples.reduce((a, b) => a + b, 0) / 
                                 this.metrics.timing.samples.length;

        // 限制樣本數量
        if (this.metrics.timing.samples.length > 100) {
            this.metrics.timing.samples.shift();
        }
    },

    // 記錄錯誤
    recordError(error, operation) {
        const errorType = error.name || 'Unknown';
        this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;

        this.metrics.errors.recent.push({
            timestamp: new Date(),
            operation,
            error: {
                type: errorType,
                message: error.message,
                stack: error.stack
            }
        });

        // 限制最近錯誤數量
        if (this.metrics.errors.recent.length > 10) {
            this.metrics.errors.recent.shift();
        }
    },

    // 獲取效能報告
    getPerformanceReport() {
        return {
            successRate: this.metrics.operations.successful / this.metrics.operations.total * 100,
            averageResponseTime: this.metrics.timing.avg,
            errorRate: this.metrics.operations.failed / this.metrics.operations.total * 100,
            mostCommonErrors: Object.entries(this.metrics.errors.byType)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    },

    // 監控警告
    checkWarningThresholds() {
        const report = this.getPerformanceReport();
        
        if (report.errorRate > 10) {
            window.ErrorHandler.logError({
                message: `存儲系統錯誤率過高: ${report.errorRate.toFixed(2)}%`,
                level: window.ErrorHandler.errorLevels.WARNING
            });
        }

        if (report.averageResponseTime > 1000) {
            window.ErrorHandler.logError({
                message: `存儲系統回應時間過長: ${report.averageResponseTime.toFixed(2)}ms`,
                level: window.ErrorHandler.errorLevels.WARNING
            });
        }
    }
};

// 將監控添加到 StorageManager
Object.assign(StorageManager.prototype, {
    async monitoredOperation(operation, func) {
        const startTime = performance.now();
        try {
            const result = await func();
            const duration = performance.now() - startTime;
            StorageMonitor.recordOperation(operation, true, duration);
            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            StorageMonitor.recordOperation(operation, false, duration);
            StorageMonitor.recordError(error, operation);
            throw error;
        }
    }
});

// 覆蓋 StorageManager 的方法以添加監控
const originalMethods = {
    get: StorageManager.prototype.get,
    set: StorageManager.prototype.set,
    remove: StorageManager.prototype.remove,
    clear: StorageManager.prototype.clear,
    keys: StorageManager.prototype.keys
};

StorageManager.prototype.get = async function(key, defaultValue) {
    return this.monitoredOperation('get', () => originalMethods.get.call(this, key, defaultValue));
};

StorageManager.prototype.set = async function(key, value) {
    return this.monitoredOperation('set', () => originalMethods.set.call(this, key, value));
};

StorageManager.prototype.remove = async function(key) {
    return this.monitoredOperation('remove', () => originalMethods.remove.call(this, key));
};

StorageManager.prototype.clear = async function() {
    return this.monitoredOperation('clear', () => originalMethods.clear.call(this));
};

StorageManager.prototype.keys = async function() {
    return this.monitoredOperation('keys', () => originalMethods.keys.call(this));
};

// 定期檢查警告閾值
setInterval(() => {
    StorageMonitor.checkWarningThresholds();
}, 5 * 60 * 1000); // 每5分鐘檢查一次

// 導出監控系統供其他模組使用
window.StorageMonitor = StorageMonitor;