// 特別活動系統

// 特別活動類型
const eventTypes = {
    DOUBLE_MONEY: {
        title: '特價促銷日',
        description: '所有飲品獲得雙倍收入！',
        effect: (order) => { order.reward *= 2; },
        icon: '💰'
    },
    BONUS_EXP: {
        title: '咖啡鑑賞日',
        description: '製作飲品獲得額外50%經驗值！',
        effect: (drink) => { return Math.floor(drink.experience * 0.5); },
        icon: '⭐'
    },
    INGREDIENT_DISCOUNT: {
        title: '原料折扣日',
        description: '所有原料購買價格減半！',
        effect: () => { return 0.5; },
        icon: '🛒'
    },
    CUSTOMER_RUSH: {
        title: '客流高峰期',
        description: '顧客數量增加，但他們的耐心減少！',
        effect: () => { return 0.7; }, // 耐心減少為原來的70%
        icon: '👥'
    },
    RARE_INGREDIENTS: {
        title: '稀有原料日',
        description: '有機會獲得稀有原料作為額外獎勵！',
        effect: () => { 
            const rareIngredients = ['高山茶葉', '特級可可豆', '有機牛奶'];
            return rareIngredients[Math.floor(Math.random() * rareIngredients.length)];
        },
        icon: '✨'
    }
};

// 當前活動
let currentEvent = null;
let eventEndTime = 0;
let eventDuration = 3 * 60 * 1000; // 默認活動持續3分鐘

// 啟動特別活動
function startRandomEvent() {
    const eventKeys = Object.keys(eventTypes);
    const randomEvent = eventKeys[Math.floor(Math.random() * eventKeys.length)];
    
    // 設置當前活動
    currentEvent = {
        type: randomEvent,
        ...eventTypes[randomEvent]
    };
    
    // 設置結束時間
    eventEndTime = Date.now() + eventDuration;
    
    // 顯示活動通知
    showEventNotification(currentEvent);
    
    // 更新活動面板
    updateEventPanel();
    
    // 設置倒計時
    startEventCountdown();
}

// 顯示活動通知
function showEventNotification(event) {
    const notification = document.createElement('div');
    notification.className = 'special-event-notification';
    notification.innerHTML = `
        <div class="event-icon">${event.icon}</div>
        <div class="event-content">
            <div class="event-title">${event.title}</div>
            <div class="event-description">${event.description}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 動畫效果
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 5秒後移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
    
    // 播放通知音效
    const notificationSound = document.getElementById('notification-sound');
    if (notificationSound) {
        notificationSound.play().catch(e => console.log('Unable to play sound', e));
    }
}

// 更新活動面板
function updateEventPanel() {
    const eventPanel = document.getElementById('event-panel');
    if (!eventPanel) return;
    
    if (currentEvent) {
        eventPanel.innerHTML = `
            <div class="special-event">
                <div class="special-event-title">${currentEvent.icon} ${currentEvent.title}</div>
                <div class="special-event-description">${currentEvent.description}</div>
                <div class="special-event-timer" id="event-timer">--:--</div>
            </div>
        `;
        eventPanel.style.display = 'block';
    } else {
        eventPanel.style.display = 'none';
    }
}

// 啟動活動倒計時
function startEventCountdown() {
    const timerElement = document.getElementById('event-timer');
    if (!timerElement) return;
    
    const countdownInterval = setInterval(() => {
        const now = Date.now();
        const timeLeft = eventEndTime - now;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            endCurrentEvent();
            return;
        }
        
        // 格式化倒計時
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 結束當前活動
function endCurrentEvent() {
    // 顯示活動結束通知
    if (currentEvent) {
        showNotification(`${currentEvent.title} 活動已結束！`);
    }
    
    // 清除當前活動
    currentEvent = null;
    
    // 更新活動面板
    updateEventPanel();
    
    // 設置下一個隨機活動時間
    scheduleNextEvent();
}

// 安排下一個活動
function scheduleNextEvent() {
    // 隨機5-15分鐘後觸發下一個活動
    const nextEventDelay = (5 + Math.floor(Math.random() * 10)) * 60 * 1000;
    
    setTimeout(() => {
        startRandomEvent();
    }, nextEventDelay);
}

// 獲取當前活動的效果
function getCurrentEventEffect(type, data) {
    if (!currentEvent) return null;
    
    if (currentEvent.type === type) {
        return currentEvent.effect(data);
    }
    
    return null;
}

// 初始化事件系統
function initEventSystem() {
    // 創建活動面板
    if (!document.getElementById('event-panel')) {
        const eventPanel = document.createElement('div');
        eventPanel.id = 'event-panel';
        eventPanel.className = 'event-panel';
        document.body.appendChild(eventPanel);
    }
    
    // 安排第一個活動（遊戲開始後1-3分鐘觸發）
    const firstEventDelay = (1 + Math.floor(Math.random() * 2)) * 60 * 1000;
    setTimeout(() => {
        startRandomEvent();
    }, firstEventDelay);
}

// 當頁面加載完成後初始化事件系統
window.addEventListener('DOMContentLoaded', initEventSystem);
