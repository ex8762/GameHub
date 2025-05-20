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
                    showNotification(`任務完成：${mission.description}`);
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
        showNotification(`獲得獎勵：金錢+${missionList[idx].reward.money}，經驗+${missionList[idx].reward.exp}`);
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
    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';
        
        // 添加動畫效果
        notification.classList.add('button-click');
        
        // 3秒後自動隱藏
        setTimeout(() => {
            notification.style.display = 'none';
            notification.classList.remove('button-click');
        }, 3000);
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
        showNotification('歡迎來到咖啡廳經營遊戲！');
        
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
    ["spot1","spot2","spot3"].forEach(function(spotId, idx){
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
    panel.innerHTML = '<h3>原料庫存</h3><ul>' + Object.entries(ingredients).map(([k,v]) => `<li>${k}: ${v}</li>`).join('') + '</ul>';
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
    // 隨機產生一杯飲品訂單
    const drinkNames = Object.keys(drinks);
    const name = drinkNames[Math.floor(Math.random()*drinkNames.length)];
    const order = { drink: name, id: Date.now() };
    pendingOrders.push(order);
    renderPendingOrders();
    showNotification(`新訂單：${name}`);
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