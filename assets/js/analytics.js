// 遊戲數據統計和分析功能
class GameAnalytics {
    constructor() {
        this.storageKey = 'gameAnalytics';
        this.data = this.loadData();
        this.initializeData();
        this.startSessionTracking();
    }

    // 初始化數據結構
    initializeData() {
        if (!this.data) {
            this.data = {
                totalVisits: 0,
                lastVisit: null,
                games: {},
                sessions: [],
                dailyStats: {},
                browserInfo: this.getBrowserInfo()
            };
        }
        if (!Array.isArray(this.data.sessions)) {
            this.data.sessions = [];
        }
        this.data.totalVisits++;
        this.data.lastVisit = new Date().toISOString();
        this.saveData();
    }

    // 獲取瀏覽器信息
    getBrowserInfo() {
        const ua = navigator.userAgent;
        return {
            userAgent: ua,
            browser: this.detectBrowser(ua),
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`
        };
    }

    // 檢測瀏覽器類型
    detectBrowser(ua) {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
        return 'Unknown';
    }

    // 開始追蹤會話
    startSessionTracking() {
        if (!Array.isArray(this.data.sessions)) {
            this.data.sessions = [];
        }
        const session = {
            startTime: new Date().toISOString(),
            endTime: null,
            duration: 0,
            events: []
        };
        this.currentSession = session;
        this.data.sessions.push(session);

        // 定期保存會話數據
        this.sessionInterval = setInterval(() => {
            this.updateSessionDuration();
            this.saveData();
        }, 60000); // 每分鐘更新一次

        // 頁面關閉時保存會話
        window.addEventListener('beforeunload', () => {
            this.endSession();
        });
    }

    // 結束當前會話
    endSession() {
        if (this.currentSession) {
            this.currentSession.endTime = new Date().toISOString();
            this.updateSessionDuration();
            this.saveData();
            clearInterval(this.sessionInterval);
        }
    }

    // 更新會話時長
    updateSessionDuration() {
        if (this.currentSession) {
            const start = new Date(this.currentSession.startTime);
            const now = new Date();
            this.currentSession.duration = Math.floor((now - start) / 1000);
        }
    }

    // 記錄遊戲事件
    trackGameEvent(gameId, eventType, eventData = {}) {
        if (!this.data.games[gameId]) {
            this.data.games[gameId] = {
                playCount: 0,
                totalPlayTime: 0,
                highScore: 0,
                lastPlayed: null,
                events: []
            };
        }

        const event = {
            type: eventType,
            timestamp: new Date().toISOString(),
            data: eventData
        };

        this.data.games[gameId].events.push(event);
        this.currentSession.events.push({
            gameId,
            ...event
        });

        // 更新遊戲統計
        switch (eventType) {
            case 'start':
                this.data.games[gameId].playCount++;
                this.data.games[gameId].lastPlayed = new Date().toISOString();
                break;
            case 'score':
                if (eventData.score > this.data.games[gameId].highScore) {
                    this.data.games[gameId].highScore = eventData.score;
                }
                break;
            case 'end':
                if (eventData.duration) {
                    this.data.games[gameId].totalPlayTime += eventData.duration;
                }
                break;
        }

        this.saveData();
    }

    // 獲取遊戲統計數據
    getGameStats(gameId) {
        return this.data.games[gameId] || null;
    }

    // 獲取所有統計數據
    getAllStats() {
        return {
            totalVisits: this.data.totalVisits,
            lastVisit: this.data.lastVisit,
            games: this.data.games,
            sessions: this.data.sessions,
            browserInfo: this.data.browserInfo
        };
    }

    // 生成每日統計報告
    generateDailyReport() {
        const today = new Date().toISOString().split('T')[0];
        if (!this.data.dailyStats[today]) {
            this.data.dailyStats[today] = {
                visits: 0,
                totalPlayTime: 0,
                gamesPlayed: {},
                uniqueUsers: new Set()
            };
        }

        const dailyStats = this.data.dailyStats[today];
        dailyStats.visits++;

        // 使用瀏覽器指紋作為唯一用戶標識
        const userFingerprint = this.generateUserFingerprint();
        dailyStats.uniqueUsers.add(userFingerprint);

        this.saveData();
        return dailyStats;
    }

    // 生成簡單的用戶指紋
    generateUserFingerprint() {
        const { userAgent, platform, language, screenResolution } = this.data.browserInfo;
        return btoa(`${userAgent}${platform}${language}${screenResolution}`).slice(0, 32);
    }

    // 保存數據到 LocalStorage
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('保存分析數據失敗:', e);
        }
    }

    // 從 LocalStorage 載入數據
    loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('載入分析數據失敗:', e);
            return null;
        }
    }
}

// 初始化分析系統
const analytics = new GameAnalytics();

// 導出分析實例
window.gameAnalytics = analytics;