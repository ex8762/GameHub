// 分享目標處理器

class ShareTargetHandler {
    constructor() {
        this.shareData = null;
    }

    /**
     * 初始化分享處理
     */
    init() {
        // 檢查是否支援網頁分享
        if (navigator.share) {
            this.setupShareButtons();
        }

        // 處理接收到的分享內容
        this.handleIncomingShare();
    }

    /**
     * 設置分享按鈕
     */
    setupShareButtons() {
        document.querySelectorAll('.share-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const gameId = button.dataset.gameId;
                const gameData = this.getGameData(gameId);
                
                try {
                    await navigator.share({
                        title: gameData.title,
                        text: gameData.description,
                        url: gameData.url
                    });
                    
                    window.NotificationSystem.show('分享成功', 'success');
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error('分享失敗:', error);
                        window.NotificationSystem.show('分享失敗', 'error');
                    }
                }
            });
        });
    }

    /**
     * 處理接收到的分享內容
     */
    async handleIncomingShare() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedTitle = urlParams.get('title');
        const sharedText = urlParams.get('text');
        const sharedUrl = urlParams.get('url');

        if (sharedTitle || sharedText || sharedUrl) {
            this.shareData = {
                title: sharedTitle,
                text: sharedText,
                url: sharedUrl
            };

            // 處理分享內容
            await this.processSharedContent();
        }
    }

    /**
     * 處理分享內容
     */
    async processSharedContent() {
        if (!this.shareData) return;

        try {
            // 檢查是否是遊戲分享
            if (this.shareData.url && this.shareData.url.includes('/games/')) {
                const gameId = this.extractGameId(this.shareData.url);
                if (gameId) {
                    // 跳轉到對應的遊戲
                    window.location.href = `/games/${gameId}/index.html`;
                    return;
                }
            }

            // 如果是一般分享，顯示分享資訊
            this.showSharedContent();
        } catch (error) {
            console.error('處理分享內容失敗:', error);
            window.NotificationSystem.show('無法處理分享內容', 'error');
        }
    }

    /**
     * 提取遊戲ID
     */
    extractGameId(url) {
        const match = url.match(/\/games\/(game-[1-3])\//);
        return match ? match[1] : null;
    }

    /**
     * 獲取遊戲數據
     */
    getGameData(gameId) {
        const gameData = {
            'game-1': {
                title: '射擊遊戲 - 遊戲天地',
                description: '體驗刺激的射擊遊戲，挑戰你的反應能力！',
                url: `${window.location.origin}/games/game-1/index.html`
            },
            'game-2': {
                title: '模擬經營 - 遊戲天地',
                description: '打造你的商業帝國，體驗經營的樂趣！',
                url: `${window.location.origin}/games/game-2/index.html`
            },
            'game-3': {
                title: '咖啡廳 - 遊戲天地',
                description: '經營你的夢想咖啡廳，創造獨特的咖啡體驗！',
                url: `${window.location.origin}/games/game-3/index.html`
            }
        };

        return gameData[gameId] || {
            title: '遊戲天地',
            description: '精選網頁遊戲平台',
            url: window.location.origin
        };
    }

    /**
     * 顯示分享內容
     */
    showSharedContent() {
        const container = document.createElement('div');
        container.className = 'shared-content-container';
        container.innerHTML = `
            <div class="shared-content">
                <h3>${this.shareData.title || '分享內容'}</h3>
                <p>${this.shareData.text || ''}</p>
                ${this.shareData.url ? `<a href="${this.shareData.url}" target="_blank">${this.shareData.url}</a>` : ''}
            </div>
        `;

        document.body.appendChild(container);
        
        // 3秒後自動移除
        setTimeout(() => {
            container.remove();
        }, 3000);
    }
}

// 創建全局實例
window.shareTargetHandler = new ShareTargetHandler();

// 當文檔載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    window.shareTargetHandler.init();
});
