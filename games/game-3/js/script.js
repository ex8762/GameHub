// JavaScript code extracted from App.htm

// 包裝腳本以避免全局變數衝突
(function() {
    // 全局變數設定
    let money = 100;
    let ingredients = { coffee: 10, milk: 10, sugar: 10, cocoa: 0, ice: 0, chocolate_syrup: 0 };
    let staff = [];
    let decorations = [];
    let experience = 0;
    let level = 1;
    let drinksSold = 0;
    let pendingOrders = [];
    window.currentOrder = null;

    // 飲品定義
    const drinks = {
        "美式咖啡": {
            requiredIngredients: { coffee: 2, sugar: 1 },
            sellPrice: 15
        },
        "拿鐵": {
            requiredIngredients: { coffee: 1, milk: 2, sugar: 1 },
            sellPrice: 20
        },
        "卡布奇諾": {
            requiredIngredients: { coffee: 1, milk: 1, sugar: 1 },
            sellPrice: 18
        },
        "摩卡": {
            requiredIngredients: { coffee: 1, milk: 1, cocoa: 1, sugar: 1 },
            sellPrice: 22
        },
        "冰咖啡": {
            requiredIngredients: { coffee: 2, sugar: 1, ice: 2 },
            sellPrice: 18
        },
        "巧克力咖啡": {
            requiredIngredients: { coffee: 1, chocolate_syrup: 2, milk: 1 },
            sellPrice: 25
        }
    };

    // 任務資料結構
    const missionList = [
        { id: 1, description: "賣出5杯飲品", requirement: { type: "drinksSold", value: 5 }, reward: { money: 50, exp: 20 } },
        { id: 2, description: "招聘1名員工", requirement: { type: "staffCount", value: 1 }, reward: { money: 30, exp: 15 } },
        { id: 3, description: "購買1個裝飾", requirement: { type: "decorCount", value: 1 }, reward: { money: 40, exp: 25 } },
        { id: 4, description: "賣出10杯飲品", requirement: { type: "drinksSold", value: 10 }, reward: { money: 100, exp: 30 } },
        { id: 5, description: "招聘3名員工", requirement: { type: "staffCount", value: 3 }, reward: { money: 150, exp: 40 } },
        { id: 6, description: "購買3個裝飾", requirement: { type: "decorCount", value: 3 }, reward: { money: 200, exp: 50 } },
        { id: 7, description: "達到2級", requirement: { type: "playerLevel", value: 2 }, reward: { money: 120, exp: 0 } },
        { id: 8, description: "製作5杯摩卡", requirement: { type: "specificDrink", drink: "摩卡", value: 5 }, reward: { money: 80, exp: 35 } },
        { id: 9, description: "製作3杯巧克力咖啡", requirement: { type: "specificDrink", drink: "巧克力咖啡", value: 3 }, reward: { money: 75, exp: 30 } },
        { id: 10, description: "達到3級", requirement: { type: "playerLevel", value: 3 }, reward: { money: 200, exp: 0 } },
        { id: 11, description: "賣出20杯飲品", requirement: { type: "drinksSold", value: 20 }, reward: { money: 150, exp: 50 } }
    ];

    // 任務狀態管理
    let missionStates = missionList.map(m => ({ id: m.id, completed: false, rewarded: false }));

    // 檢查任務是否完成
    function checkMissionCompletion() {
        missionList.forEach((mission, idx) => {
            if (!missionStates[idx].completed) {
                if (isMissionCompleted(mission)) {
                    missionStates[idx].completed = true;
                    showGameNotification(`任務完成：${mission.description}`);
                    renderMissions();
                }
            }
        });
    }

    // 判斷單一任務是否完成
    function isMissionCompleted(mission) {
        switch (mission.requirement.type) {
            case "drinksSold":
                return drinksSold >= mission.requirement.value;
            case "staffCount":
                return staff.length >= mission.requirement.value;
            case "decorCount":
                return decorations.length >= mission.requirement.value;
            case "playerLevel":
                return level >= mission.requirement.value;
            case "specificDrink":
                return drinksMade[mission.requirement.drink] >= mission.requirement.value;
            default:
                return false;
        }
    }

    // 領取任務獎勵
    function claimMissionReward(missionId) {
        const idx = missionList.findIndex(m => m.id === missionId);
        if (idx === -1) return;
        if (!missionStates[idx].completed || missionStates[idx].rewarded) return;
        money += missionList[idx].reward.money;
        experience += missionList[idx].reward.exp;
        missionStates[idx].rewarded = true;
        showGameNotification(`獲得獎勵：金錢+${missionList[idx].reward.money}，經驗+${missionList[idx].reward.exp}`);
        updateMoney();
        renderMissions();
    }

    // 渲染任務列表
    function renderMissions() {
        const missionPanel = document.getElementById('mission-panel');
        if (!missionPanel) return;
        missionPanel.innerHTML = '';
        missionList.forEach((mission, idx) => {
            const state = missionStates[idx];
            const div = document.createElement('div');
            div.className = 'mission-item' + (state.completed ? ' completed' : '');
            div.innerHTML = `<span>${mission.description}</span>` +
                (state.completed && !state.rewarded ? `<button onclick="claimMissionReward(${mission.id})">領取獎勵</button>` :
                    state.rewarded ? '<span>已領取</span>' : '<span>進行中</span>');
            missionPanel.appendChild(div);
        });
    }

    // 在遊戲進行關鍵事件後呼叫 checkMissionCompletion()
    // 例如賣出飲品、招聘員工、購買裝飾、升級、製作飲品時

    // 顯示通知訊息
    function showGameNotification(message, type = 'info', options = {}) {
        // 使用全局通知系統
        if (window.NotificationSystem) {
            const gameOptions = {
                sound: true,
                duration: 3000,
                ...options
            };
            window.NotificationSystem.show(message, type, gameOptions);
        } else {
            // 備用方案：使用原始通知
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
    }

    // 為所有按鈕添加點擊動畫效果
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.add('button-click');
            setTimeout(() => {
                this.classList.remove('button-click');
            }, 300);
        });
    });

    // 初始化遊戲
    window.addEventListener('load', function() {
        // 隱藏食譜面板
        document.getElementById('recipe-panel').style.display = 'none';
        // 渲染食譜
        renderRecipes();
        // 生成第一個訂單
        setTimeout(generateOrder, 5000);
        // 顯示歡迎訊息
        showGameNotification('歡迎來到咖啡廳經營遊戲！');

        // 添加音效控制
        const bgMusic = document.getElementById('background-music');
        bgMusic.volume = 0.3; // 設定背景音樂音量

        // 嘗試自動播放背景音樂
        try {
            bgMusic.play().catch(e => console.log('背景音樂播放失敗:', e));
        } catch (e) {
            console.log('背景音樂播放失敗:', e);
        }
        // 初始化金錢與原料顯示
        updateMoney();
        updateIngredients();
        renderStaffList();
        renderDecorations();
        renderMissions();
        document.getElementById('level').textContent = level;
    });

    // 添加音效控制按鈕
    const soundControlBtn = document.createElement('button');
    soundControlBtn.textContent = '🔊';
    soundControlBtn.style.position = 'fixed';
    soundControlBtn.style.top = '20px';
    soundControlBtn.style.right = '20px';
    soundControlBtn.style.zIndex = '100';
    soundControlBtn.style.padding = '8px 15px';
    soundControlBtn.style.backgroundColor = '#8b4513';
    soundControlBtn.style.color = 'white';
    soundControlBtn.style.border = 'none';
    soundControlBtn.style.borderRadius = '5px';
    soundControlBtn.style.cursor = 'pointer';

    let isMuted = false;
    soundControlBtn.addEventListener('click', function() {
        const allAudios = document.querySelectorAll('audio');
        isMuted = !isMuted;

        allAudios.forEach(audio => {
            audio.muted = isMuted;
        });

        soundControlBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    document.body.appendChild(soundControlBtn);

    // 遊戲存檔功能
    function saveGame() {
        localStorage.setItem('gameState', JSON.stringify({
            money: money,
            ingredients: ingredients,
            staff: staff,
            decorations: decorations,
            experience: experience,
            level: level,
            drinksSold: drinksSold,
            drinksMade: drinksMade,
            missions: missions
        }));
    }

    function loadGame() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            money = state.money || 100;
            ingredients = state.ingredients || { coffee: 10, milk: 10, sugar: 10, cocoa: 0, ice: 0, chocolate_syrup: 0 };
            staff = state.staff || [];
            decorations = state.decorations || [];
            experience = state.experience || 0;
            level = state.level || 1;
            drinksSold = state.drinksSold || 0;
            drinksMade = state.drinksMade || {
                "美式咖啡": 0,
                "拿鐵": 0,
                "卡布奇諾": 0,
                "摩卡": 0,
                "冰咖啡": 0,
                "巧克力咖啡": 0
            };
            if (state.missions) missions = state.missions;

            // 更新顯示
            updateMoney();
            updateIngredients();
            renderStaffList();
            renderMissions();
            document.getElementById('level').textContent = level;
        }
    }

    // 自動存檔
    setInterval(saveGame, 60000); // 每分鐘自動存檔

    // 在頁面載入時載入遊戲狀態
    loadGame();

})(); // IIFE 結束

// 飲品製作動畫效果

document.getElementById('permanent-make-button').addEventListener('click', function() {
    const drinkElement = document.getElementById('permanent-required-drink');
    drinkElement.classList.add('making-drink');
    setTimeout(() => drinkElement.classList.remove('making-drink'), 2000);

    // 播放製作飲品音效
    try {
        document.getElementById('drink-making-sound').play().catch(e => console.log('音效播放失敗:', e));
    } catch (e) {
        console.log('音效播放失敗:', e);
    }
});

// 播放音效並顯示通知
function showNotification(message) {
    const notificationElement = document.getElementById('notification');
    notificationElement.textContent = message;
    notificationElement.style.display = 'block';

    // 播放新訂單音效
    try {
        document.getElementById('new-order-sound').play().catch(e => console.log('音效播放失敗:', e));
    } catch (e) {
        console.log('音效播放失敗:', e);
    }

    setTimeout(() => notificationElement.style.display = 'none', 3000);
}

// 初始化背景音樂
window.addEventListener('click', function() {
    try {
        const bgMusic = document.getElementById('background-music');
        bgMusic.volume = 0.3; // 降低音量
        bgMusic.play().catch(e => console.log('背景音樂播放失敗:', e));
    } catch (e) {
        console.log('背景音樂播放失敗:', e);
    }
}, { once: true });


function renderDecorations() {
    // 依 decorations 陣列渲染裝飾物到 cafe-view
    ["spot1", "spot2", "spot3"].forEach(function(spotId, idx) {
        const spot = document.getElementById(spotId);
        spot.innerHTML = decorations[idx] ? `<img src="${decorations[idx].img}" alt="裝飾" style="width:100%;height:100%;">` : "";
    });
}


function renderStaffList() {
    const panel = document.getElementById('staff-panel');
    if (!panel) return;
    panel.innerHTML = '<h3>員工列表</h3><ul>' + (staff.length ? staff.map(s => `<li>${s.name} (${s.role})</li>`).join('') : '<li>尚無員工</li>') + '</ul>';
}

function updateMoney() {
    document.getElementById('money').textContent = money;
}

function updateIngredients() {
    // 假設有 ingredients-panel，這裡僅示範結構
    const panel = document.getElementById('ingredients-panel');
    if (!panel) return;
    panel.innerHTML = '<h3>原料庫存</h3><ul>' + Object.entries(ingredients).map(([k, v]) => `<li>${k}: ${v}</li>`).join('') + '</ul>';
}


// 商店面板顯示與隱藏
function toggleShopPanel() {
    const panel = document.getElementById('shop-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}
// 員工面板顯示與隱藏
function toggleStaffPanel() {
    const panel = document.getElementById('staff-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}
// 裝飾面板顯示與隱藏
function toggleDecorPanel() {
    const panel = document.getElementById('decor-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}
// 任務面板顯示與隱藏
function toggleMissionsPanel() {
    const panel = document.getElementById('missions-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}


function renderRecipes() {
    const list = document.getElementById('recipe-list');
    if (!list) return;
    list.innerHTML = Object.entries(drinks).map(([name, info]) => `<li><b>${name}</b>：${Object.entries(info.requiredIngredients).map(([k,v])=>k+':'+v).join(', ')}，售價${info.sellPrice}</li>`).join('');
}
// 待處理訂單面板顯示與隱藏
function togglePendingOrdersPanel() {
    const panel = document.getElementById('pending-orders-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}
// 食譜面板顯示與隱藏
function toggleRecipePanel() {
    const panel = document.getElementById('recipe-panel');
    panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
}
// 訂單生成與渲染
function generateOrder() {
    const drinks = ['coffee-milk', 'coffee-sugar', 'milk-sugar', 'coffee-milk-sugar'];
    const randomDrink = drinks[Math.floor(Math.random() * drinks.length)];

    gameState.orders.push({
        drink: randomDrink,
        time: Date.now()
    });

    playSound(sounds.newOrder);
    showGameNotification('新訂單！', 'info', {
        sound: true,
        duration: 4000
    });
    updateOrdersDisplay();
}

function renderPendingOrders() {
    const panel = document.getElementById('pending-orders-panel');
    if (!panel) return;
    panel.innerHTML = '<h3>待處理訂單</h3><ul>' + (pendingOrders.length ? pendingOrders.map(o => `<li>${o.drink}</li>`).join('') : '<li>暫無訂單</li>') + '</ul>';
}

// 補上飲品製作功能
function makeDrink(drinkName) {
    const recipe = drinks[drinkName];
    if (!recipe) return showNotification('無此飲品');
    // 檢查原料是否足夠
    for (let k in recipe.requiredIngredients) {
        if (!ingredients[k] || ingredients[k] < recipe.requiredIngredients[k]) {
            showNotification('原料不足，無法製作');
            return;
        }
    }
    // 扣除原料
    for (let k in recipe.requiredIngredients) {
        ingredients[k] -= recipe.requiredIngredients[k];
    }
    updateIngredients();
    money += recipe.sellPrice;
    updateMoney();
    drinksSold++;
    showNotification('完成一杯' + drinkName + '，收入+' + recipe.sellPrice);
}

// 遊戲狀態
const gameState = {
    level: 1,
    money: 1000,
    reputation: 0,
    satisfaction: 100,
    ingredients: {
        coffee: 0,
        milk: 0,
        sugar: 0,
        syrup: 0
    },
    staff: [],
    decorations: [],
    currentMix: [],
    orders: [],
    missions: []
};

// 音效
const sounds = {
    background: document.getElementById('background-music'),
    orderComplete: document.getElementById('order-complete-sound'),
    newOrder: document.getElementById('new-order-sound'),
    cash: document.getElementById('cash-sound'),
    levelUp: document.getElementById('level-up-sound'),
    drinkMaking: document.getElementById('drink-making-sound')
};

// 遊戲狀態管理系統
const GameState = {
    // 基礎狀態
    base: {
        level: 1,
        money: 1000,
        reputation: 0,
        satisfaction: 100,
        experience: 0,
        drinksSold: 0
    },

    // 庫存管理
    inventory: {
        coffee: 50,
        milk: 50,
        sugar: 50,
        syrup: 20,
        cocoa: 10,
        ice: 30,
        chocolate_syrup: 15
    },

    // 設備狀態
    equipment: {
        coffee_machine: { owned: false, condition: 100 },
        tea_set: { owned: false, condition: 100 },
        dessert_case: { owned: false, condition: 100 }
    },

    // 員工管理
    staff: [],

    // 裝飾管理
    decorations: [],

    // 訂單管理
    orders: [],

    // 任務管理
    missions: [],

    // 成就系統
    achievements: {
        firstSale: { earned: false, description: '完成第一筆訂單' },
        popularCafe: { earned: false, description: '達到 100 顧客滿意度' },
        masterBarista: { earned: false, description: '製作 100 杯飲品' },
        richOwner: { earned: false, description: '擁有 10000 元' }
    },

    // 統計數據
    statistics: {
        totalDrinksMade: 0,
        totalMoneyEarned: 0,
        totalCustomersServed: 0,
        bestSellingDrink: '',
        averageSatisfaction: 100,
        playTime: 0
    },

    // 遊戲設置
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true,
        autoSaveEnabled: true
    },

    // 存檔功能
    save() {
        const saveData = {
            base: this.base,
            inventory: this.inventory,
            equipment: this.equipment,
            staff: this.staff,
            decorations: this.decorations,
            achievements: this.achievements,
            statistics: this.statistics,
            settings: this.settings,
            savedAt: new Date().toISOString()
        };

        try {
            localStorage.setItem('cafeGameSave', JSON.stringify(saveData));
            showGameNotification('遊戲已保存', 'success');
        } catch (error) {
            console.error('保存遊戲失敗:', error);
            showGameNotification('保存遊戲失敗', 'error');
        }
    },

    // 讀檔功能
    load() {
        try {
            const saveData = JSON.parse(localStorage.getItem('cafeGameSave'));
            if (!saveData) return false;

            // 載入所有保存的數據
            Object.assign(this.base, saveData.base);
            Object.assign(this.inventory, saveData.inventory);
            Object.assign(this.equipment, saveData.equipment);
            this.staff = saveData.staff;
            this.decorations = saveData.decorations;
            Object.assign(this.achievements, saveData.achievements);
            Object.assign(this.statistics, saveData.statistics);
            Object.assign(this.settings, saveData.settings);

            showGameNotification('遊戲已載入', 'success');
            return true;
        } catch (error) {
            console.error('載入遊戲失敗:', error);
            showGameNotification('載入遊戲失敗', 'error');
            return false;
        }
    },

    // 重置遊戲
    reset() {
        const confirmed = confirm('確定要重置遊戲嗎？這將清除所有進度！');
        if (!confirmed) return;

        localStorage.removeItem('cafeGameSave');
        location.reload();
    },

    // 自動存檔
    startAutoSave() {
        if (this.settings.autoSaveEnabled) {
            setInterval(() => this.save(), 60000); // 每分鐘自動存檔
        }
    },

    // 更新成就
    updateAchievements() {
        const { base, statistics, achievements } = this;

        if (!achievements.firstSale.earned && statistics.totalDrinksMade > 0) {
            achievements.firstSale.earned = true;
            showGameNotification('達成成就：完成第一筆訂單！', 'success');
        }

        if (!achievements.popularCafe.earned && base.satisfaction >= 100) {
            achievements.popularCafe.earned = true;
            showGameNotification('達成成就：最受歡迎的咖啡廳！', 'success');
        }

        if (!achievements.masterBarista.earned && statistics.totalDrinksMade >= 100) {
            achievements.masterBarista.earned = true;
            showGameNotification('達成成就：咖啡大師！', 'success');
        }

        if (!achievements.richOwner.earned && base.money >= 10000) {
            achievements.richOwner.earned = true;
            showGameNotification('達成成就：成功的店主！', 'success');
        }
    },

    // 更新統計數據
    updateStatistics(action, data) {
        const stats = this.statistics;
        
        switch (action) {
            case 'drinkMade':
                stats.totalDrinksMade++;
                stats.totalMoneyEarned += data.price;
                // 更新最暢銷飲品
                const drinkStats = stats.drinkStats || {};
                drinkStats[data.drink] = (drinkStats[data.drink] || 0) + 1;
                stats.bestSellingDrink = Object.entries(drinkStats)
                    .sort((a, b) => b[1] - a[1])[0][0];
                break;

            case 'customerServed':
                stats.totalCustomersServed++;
                // 更新平均滿意度
                stats.averageSatisfaction = 
                    (stats.averageSatisfaction * (stats.totalCustomersServed - 1) + data.satisfaction) 
                    / stats.totalCustomersServed;
                break;
        }

        this.updateAchievements();
    }
};

// 季節系統
const SeasonSystem = {
    seasons: ['春', '夏', '秋', '冬'],
    currentSeason: 0,
    daysInSeason: 30,
    currentDay: 1,
    
    // 每個季節的特殊效果
    effects: {
        '春': {
            description: '春季特惠：所有飲品售價提升 10%',
            apply: (price) => price * 1.1
        },
        '夏': {
            description: '夏季特惠：冰飲售價提升 20%',
            apply: (price, drink) => drink.includes('ice') ? price * 1.2 : price
        },
        '秋': {
            description: '秋季特惠：熱飲售價提升 15%',
            apply: (price, drink) => !drink.includes('ice') ? price * 1.15 : price
        },
        '冬': {
            description: '冬季特惠：特調飲品售價提升 25%',
            apply: (price, drink) => drink.includes('special') ? price * 1.25 : price
        }
    },
    
    // 季節特殊飲品
    seasonalDrinks: {
        '春': {
            '櫻花拿鐵': {
                ingredients: ['coffee', 'milk', 'cherry_syrup'],
                price: 35,
                special: true
            }
        },
        '夏': {
            '冰檸檬咖啡': {
                ingredients: ['coffee', 'lemon_syrup', 'ice'],
                price: 30,
                special: true
            }
        },
        '秋': {
            '楓糖拿鐵': {
                ingredients: ['coffee', 'milk', 'maple_syrup'],
                price: 32,
                special: true
            }
        },
        '冬': {
            '薑餅拿鐵': {
                ingredients: ['coffee', 'milk', 'gingerbread_syrup'],
                price: 38,
                special: true
            }
        }
    },
    
    // 更新季節
    update() {
        this.currentDay++;
        if (this.currentDay > this.daysInSeason) {
            this.currentDay = 1;
            this.currentSeason = (this.currentSeason + 1) % 4;
            this.onSeasonChange();
        }
        this.updateUI();
    },
    
    // 季節變化時的處理
    onSeasonChange() {
        const season = this.seasons[this.currentSeason];
        showGameNotification(`季節變化：進入${season}季！\n${this.effects[season].description}`, 'info', {
            duration: 6000
        });
        
        // 更新菜單
        this.updateSeasonalMenu();
        
        // 觸發季節特殊事件
        EventSystem.triggerSeasonalEvent(season);
    },
    
    // 更新季節性菜單
    updateSeasonalMenu() {
        const season = this.seasons[this.currentSeason];
        const seasonalDrinks = this.seasonalDrinks[season];
        
        // 更新菜單顯示
        const menuList = document.getElementById('seasonal-menu');
        if (menuList) {
            menuList.innerHTML = Object.entries(seasonalDrinks)
                .map(([name, info]) => `
                    <div class="menu-item seasonal">
                        <h4>${name}</h4>
                        <p>材料：${info.ingredients.join(', ')}</p>
                        <p>價格：$${info.price}</p>
                        <span class="seasonal-tag">季節限定</span>
                    </div>
                `).join('');
        }
    },
    
    // 更新UI顯示
    updateUI() {
        const season = this.seasons[this.currentSeason];
        document.getElementById('current-season').textContent = season;
        document.getElementById('current-day').textContent = this.currentDay;
    }
};

// 特殊事件系統
const EventSystem = {
    events: {
        // 隨機事件
        random: [
            {
                id: 'rush_hour',
                name: '尖峰時刻',
                description: '大量顯客湧入！訂單數量和價格提升！',
                duration: 300, // 5分鐘
                effect: () => {
                    GameState.base.orderRate *= 2;
                    GameState.base.priceMultiplier *= 1.5;
                }
            },
            {
                id: 'food_critic',
                name: '美食評論家造訪',
                description: '完成評論家的訂單可獲得額外聲望！',
                duration: 180,
                effect: () => {
                    GameState.base.reputationMultiplier *= 2;
                }
            },
            {
                id: 'supply_shortage',
                name: '供應短缺',
                description: '原料成本暫時提升！',
                duration: 400,
                effect: () => {
                    GameState.base.ingredientCost *= 1.5;
                }
            }
        ],
        
        // 季節性事件
        seasonal: {
            '春': [
                {
                    id: 'cherry_blossom',
                    name: '櫻花季',
                    description: '櫻花特調飲品售價提升 30%！',
                    duration: 600,
                    effect: () => {
                        GameState.base.seasonalBonus *= 1.3;
                    }
                }
            ],
            '夏': [
                {
                    id: 'summer_festival',
                    name: '夏日祗',
                    description: '特殊訂單機率提升！',
                    duration: 500,
                    effect: () => {
                        GameState.base.specialOrderRate *= 2;
                    }
                }
            ],
            '秋': [
                {
                    id: 'autumn_sale',
                    name: '秋季特賣',
                    description: '所有飲品售價提升 20%！',
                    duration: 450,
                    effect: () => {
                        GameState.base.priceMultiplier *= 1.2;
                    }
                }
            ],
            '冬': [
                {
                    id: 'winter_warmth',
                    name: '冬日暖心',
                    description: '熱飲深受歡迎，售價提升 25%！',
                    duration: 550,
                    effect: () => {
                        GameState.base.hotDrinkBonus *= 1.25;
                    }
                }
            ]
        }
    },
    activeEvents: new Set(),
    
    // 觸發隨機事件
    triggerRandomEvent() {
        const randomEvents = this.events.random;
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        
        if (!this.activeEvents.has(event.id)) {
            this.startEvent(event);
        }
    },
    
    // 觸發季節性事件
    triggerSeasonalEvent(season) {
        const seasonalEvents = this.events.seasonal[season];
        if (seasonalEvents && seasonalEvents.length > 0) {
            const event = seasonalEvents[Math.floor(Math.random() * seasonalEvents.length)];
            this.startEvent(event);
        }
    },
    
    // 開始事件
    startEvent(event) {
        this.activeEvents.add(event.id);
        
        // 顯示事件通知
        showGameNotification(`特殊事件：${event.name}\n${event.description}`, 'info', {
            duration: 8000
        });
        
        // 應用事件效果
        event.effect();
        
        // 添加事件UI
        this.addEventUI(event);
        
        // 設定事件結束計時器
        setTimeout(() => this.endEvent(event), event.duration * 1000);
    },
    
    // 結束事件
    endEvent(event) {
        this.activeEvents.delete(event.id);
        
        // 移除事件UI
        this.removeEventUI(event);
        
        // 重置相關效果
        this.resetEventEffects(event);
        
        showGameNotification(`事件結束：${event.name}`, 'info');
    },
    
    // 添加事件UI
    addEventUI(event) {
        const eventsList = document.getElementById('active-events');
        if (eventsList) {
            const eventElement = document.createElement('div');
            eventElement.className = 'active-event';
            eventElement.id = `event-${event.id}`;
            eventElement.innerHTML = `
                <div class="event-header">
                    <h4>${event.name}</h4>
                    <span class="event-timer"></span>
                </div>
                <p>${event.description}</p>
            `;
            eventsList.appendChild(eventElement);
            
            // 更新倒計時
            this.updateEventTimer(event);
        }
    },
    
    // 更新事件計時器
    updateEventTimer(event) {
        const timerElement = document.querySelector(`#event-${event.id} .event-timer`);
        if (timerElement) {
            const endTime = Date.now() + (event.duration * 1000);
            
            const timerInterval = setInterval(() => {
                const timeLeft = Math.max(0, endTime - Date.now());
                if (timeLeft === 0) {
                    clearInterval(timerInterval);
                    return;
                }
                
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }, 1000);
        }
    },
    
    // 移除事件UI
    removeEventUI(event) {
        const eventElement = document.getElementById(`event-${event.id}`);
        if (eventElement) {
            eventElement.classList.add('fade-out');
            setTimeout(() => eventElement.remove(), 300);
        }
    },
    
    // 重置事件效果
    resetEventEffects(event) {
        // 根據事件ID重置相應的遊戲狀態
        switch (event.id) {
            case 'rush_hour':
                GameState.base.orderRate /= 2;
                GameState.base.priceMultiplier /= 1.5;
                break;
            case 'food_critic':
                GameState.base.reputationMultiplier /= 2;
                break;
            case 'supply_shortage':
                GameState.base.ingredientCost /= 1.5;
                break;
            // ... 其他事件的重置邏輯
        }
    }
};

// 在遊戲初始化時啟動季節系統
function initGame() {
    // ... existing initialization code ...
    
    // 初始化季節系統
    SeasonSystem.update();
    
    // 開始季節更新循環（每分鐘更新一天）
    setInterval(() => SeasonSystem.update(), 60000);
    
    // 開始隨機事件檢查（每5分鐘）
    setInterval(() => {
        if (Math.random() < 0.3) { // 30% 機率觸發事件
            EventSystem.triggerRandomEvent();
        }
    }, 300000);
}

// ... rest of the existing code ...