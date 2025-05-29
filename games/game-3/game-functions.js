// 遊戲核心變數和函數

// 初始化 drinksMade 統計（合併 init-vars.js）
if (typeof window.drinksMade === 'undefined') {
    window.drinksMade = {
        "美式咖啡": 0,
        "拿鐵": 0,
        "卡布奇諾": 0,
        "摩卡": 0,
        "冰咖啡": 0,
        "巧克力咖啡": 0
    };
}

// 遊戲變數
let money = 100;
let level = 1;
let experience = 0;
let drinksSold = 0;

// 物資
let ingredients = {
    coffee: 10,
    milk: 10,
    sugar: 10,
    cocoa: 5,
    ice: 5,
    chocolate_syrup: 5,
    matcha: 3,
    tea: 5,
    fruit: 5
};

// 員工
let staff = [];

// 裝飾
let decorations = [];

// 飲品配方
let drinks = {
    "美式咖啡": {
        requiredIngredients: { coffee: 2, sugar: 1 },
        sellPrice: 65,
        experience: 5,
        preparationTime: 2, // 製作時間（秒）
        description: "經典的美式咖啡，濃郁的咖啡香氣，不加太多糖。"
    },
    "拿鐵": {
        requiredIngredients: { coffee: 1, milk: 2, sugar: 1 },
        sellPrice: 85,
        experience: 8,
        preparationTime: 3,
        description: "絲滑奶香與咖啡的完美結合，適合喜歡溫和口感的顧客。"
    },
    "卡布奇諾": {
        requiredIngredients: { coffee: 1, milk: 1, sugar: 1 },
        sellPrice: 75,
        experience: 7,
        preparationTime: 3,
        description: "帶有豐富奶泡的經典義式咖啡。"
    },
    "摩卡": {
        requiredIngredients: { coffee: 1, milk: 1, cocoa: 1, sugar: 1 },
        sellPrice: 95,
        experience: 10,
        preparationTime: 4,
        description: "結合巧克力與咖啡風味，甜而不膩。"
    },
    "冰咖啡": {
        requiredIngredients: { coffee: 2, sugar: 1, ice: 2 },
        sellPrice: 80,
        experience: 6,
        preparationTime: 2,
        description: "清爽冰涼的咖啡，夏日最佳選擇。"
    },
    "巧克力咖啡": {
        requiredIngredients: { coffee: 1, milk: 1, chocolate_syrup: 1 },
        sellPrice: 90,
        experience: 9,
        preparationTime: 3,
        description: "濃郁的巧克力風味，搭配咖啡的獨特口感。"
    },
    "焦糖瑪奇朵": {
        requiredIngredients: { coffee: 1, milk: 2, sugar: 2 },
        sellPrice: 100,
        experience: 12,
        preparationTime: 4,
        description: "帶有甜美焦糖風味的特調咖啡，層次豐富。"
    },
    "抹茶拿鐵": {
        requiredIngredients: { milk: 2, sugar: 1, matcha: 2 },
        sellPrice: 110,
        experience: 15,
        preparationTime: 3,
        description: "日式抹茶與牛奶的完美結合，清新獨特。"
    },
    "水果茶": {
        requiredIngredients: { tea: 1, sugar: 1, fruit: 2 },
        sellPrice: 95,
        experience: 8,
        preparationTime: 5,
        description: "清新水果茶，富含豐富的果香與茶香。"
    }
};

// 任務
let missions = [
    { id: 1, description: "製作5杯美式咖啡", reward: 50, completed: false, type: "drink", target: "美式咖啡", count: 5 },
    { id: 2, description: "招聘2名員工", reward: 100, completed: false, type: "staff", count: 2 },
    { id: 3, description: "購買3個裝飾品", reward: 150, completed: false, type: "decor", count: 3 }
];

// 待處理訂單
let pendingOrders = [];

// 面板切換函數
function toggleShopPanel() {
    const panel = document.getElementById('shop-panel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        hideAllPanels();
        panel.style.display = 'block';
    }
}

function toggleStaffPanel() {
    const panel = document.getElementById('staff-panel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        hideAllPanels();
        panel.style.display = 'block';
        renderStaffList();
    }
}

function toggleDecorPanel() {
    const panel = document.getElementById('decor-panel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        hideAllPanels();
        panel.style.display = 'block';
    }
}

function toggleMissionsPanel() {
    const panel = document.getElementById('missions-panel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        hideAllPanels();
        panel.style.display = 'block';
        renderMissionsList();
    }
}

function togglePendingOrdersPanel() {
    const panel = document.getElementById('pending-orders-panel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        hideAllPanels();
        panel.style.display = 'block';
        renderPendingOrdersList();
    }
}

function toggleRecipePanel() {
    const panel = document.getElementById('recipe-panel');
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        renderRecipeList();
    }
}

// 隱藏所有面板
function hideAllPanels() {
    const panels = [
        'shop-panel',
        'staff-panel',
        'decor-panel',
        'missions-panel',
        'pending-orders-panel'
    ];
    
    panels.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

// 更新金錢顯示
function updateMoney() {
    document.getElementById('money').textContent = money;
}

// 更新等級和經驗值顯示
function updateLevelAndExperience() {
    document.getElementById('level').textContent = level;
    
    // 如果有經驗值進度條，則更新
    const experienceBar = document.getElementById('experience-bar-fill');
    if (experienceBar) {
        const nextLevelExp = level * 100; // 每級需要的經驗 = 當前等級 x 100
        const percentage = Math.min(100, (experience / nextLevelExp) * 100);
        experienceBar.style.width = `${percentage}%`;
        
        // 同時更新數字顯示
        const experienceText = document.getElementById('experience-text');
        if (experienceText) {
            experienceText.textContent = `${experience}/${nextLevelExp}`;
        }
    }
}

// 增加經驗值並檢查升級
function addExperience(amount) {
    experience += amount;
    
    // 檢查是否可以升級
    const requiredExp = level * 100;
    if (experience >= requiredExp) {
        // 升級
        experience -= requiredExp;
        level++;
        
        // 升級獎勵
        const bonusMoney = level * 50;
        money += bonusMoney;
        
        // 每升2級增加一種物資
        for (const ingredient in ingredients) {
            ingredients[ingredient] += Math.floor(level / 2) + 1;
        }
        
        // 更新顯示
        updateMoney();
        updateIngredients();
        
        // 顯示升級通知
        showNotification(`恭喜！升級到 ${level} 級！獲得 ${bonusMoney} 元獎勵和額外物資！`);
        
        // 創建一個升級動畫效果
        const levelDisplay = document.getElementById('level');
        levelDisplay.classList.add('level-up-animation');
        setTimeout(() => {
            levelDisplay.classList.remove('level-up-animation');
        }, 2000);
    }
    
    // 更新等級顯示
    updateLevelAndExperience();
}

// 更新物資顯示
function updateIngredients() {
    document.getElementById('coffee-count').textContent = ingredients.coffee;
    document.getElementById('milk-count').textContent = ingredients.milk;
    document.getElementById('sugar-count').textContent = ingredients.sugar;
    document.getElementById('cocoa-count').textContent = ingredients.cocoa;
    document.getElementById('ice-count').textContent = ingredients.ice;
    document.getElementById('chocolate-syrup-count').textContent = ingredients.chocolate_syrup;
    
    // 新增原料顯示（如果UI元素存在）
    if (document.getElementById('matcha-count')) {
        document.getElementById('matcha-count').textContent = ingredients.matcha;
    }
    if (document.getElementById('tea-count')) {
        document.getElementById('tea-count').textContent = ingredients.tea;
    }
    if (document.getElementById('fruit-count')) {
        document.getElementById('fruit-count').textContent = ingredients.fruit;
    }
}

// 顯示通知
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// 渲染員工列表
function renderStaffList() {
    const staffList = document.getElementById('staff-list');
    staffList.innerHTML = '';
    
    staff.forEach((staffMember, index) => {
        const li = document.createElement('li');
        li.textContent = `${staffMember.name} (${staffMember.role})`;
        staffList.appendChild(li);
    });
}

// 渲染裝飾
function renderDecorations() {
    const spots = ['spot1', 'spot2', 'spot3'];
    
    decorations.forEach((decoration, index) => {
        if (index < spots.length) {
            const spot = document.getElementById(spots[index]);
            spot.style.backgroundImage = `url('images/${decoration.img}')`;
            spot.style.backgroundSize = 'contain';
            spot.style.backgroundRepeat = 'no-repeat';
            spot.style.backgroundPosition = 'center';
        }
    });
}

// 渲染任務列表
function renderMissionsList() {
    const missionsList = document.getElementById('missions-list');
    missionsList.innerHTML = '';
    
    missions.forEach(mission => {
        if (!mission.completed) {
            const li = document.createElement('li');
            li.textContent = `${mission.description} (獎勵: ${mission.reward}元)`;
            missionsList.appendChild(li);
        }
    });
}

// 渲染待處理訂單列表
let currentMixingOrderDetails = null; // 用於存儲當前選擇的訂單詳情

function selectOrderForMixing(order, orderElement) {
    currentMixingOrderDetails = order;
    document.getElementById('permanent-required-drink').textContent = order.drink;
    
    // 可選：添加選中狀態的視覺提示
    const allOrderItems = document.querySelectorAll('#pending-orders-list li');
    allOrderItems.forEach(item => item.style.backgroundColor = ''); // 清除其他選中
    if(orderElement) {
        orderElement.style.backgroundColor = '#e0e0e0'; // 標記選中項
    }
    // 清空調酒台的輸入框
    document.getElementById('permanent-coffee-input').value = 0;
    document.getElementById('permanent-milk-input').value = 0;
    document.getElementById('permanent-sugar-input').value = 0;
    document.getElementById('permanent-cocoa-input').value = 0;
    document.getElementById('permanent-ice-input').value = 0;
    document.getElementById('permanent-chocolate-syrup-input').value = 0;
}

function renderPendingOrdersList() {
    const pendingOrdersList = document.getElementById('pending-orders-list');
    pendingOrdersList.innerHTML = ''; // 清除舊列表
    
    pendingOrders.forEach((order) => { // 移除 index，因為我們直接用 order 物件
        const li = document.createElement('li');
        li.textContent = `${order.drink} (獎勵: ${order.reward}元)`;
        li.style.cursor = 'pointer';
        li.onclick = () => selectOrderForMixing(order, li);
        pendingOrdersList.appendChild(li);
    });
}

// 渲染食譜列表
function renderRecipeList() {
    const recipeList = document.getElementById('recipe-list');
    recipeList.innerHTML = '';
    
    // 飲品類型分類
    const drinkCategories = {
        'coffee': ['美式咖啡', '拿鐵', '卡布奇諾', '摩卡', '冰咖啡', '巧克力咖啡', '焦糖瑪奇朵'],
        'tea': ['抹茶拿鐵', '水果茶']
    };
    
    // 創建類別標題
    const coffeeHeader = document.createElement('h3');
    coffeeHeader.textContent = '咖啡類飲品';
    coffeeHeader.style.marginTop = '15px';
    coffeeHeader.style.borderBottom = '1px solid #d2b48c';
    recipeList.appendChild(coffeeHeader);
    
    // 渲染咖啡飲品
    drinkCategories.coffee.forEach(drinkName => {
        if (drinks[drinkName]) {
            renderDrinkRecipe(drinkName, drinks[drinkName], recipeList);
        }
    });
    
    // 創建茶類標題
    const teaHeader = document.createElement('h3');
    teaHeader.textContent = '茶類飲品';
    teaHeader.style.marginTop = '15px';
    teaHeader.style.borderBottom = '1px solid #d2b48c';
    recipeList.appendChild(teaHeader);
    
    // 渲染茶類飲品
    drinkCategories.tea.forEach(drinkName => {
        if (drinks[drinkName]) {
            renderDrinkRecipe(drinkName, drinks[drinkName], recipeList);
        }
    });
}

// 渲染單個飲品配方
function renderDrinkRecipe(drinkName, drinkInfo, container) {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    recipeCard.style.border = '1px solid #d2b48c';
    recipeCard.style.borderRadius = '5px';
    recipeCard.style.padding = '10px';
    recipeCard.style.margin = '10px 0';
    recipeCard.style.backgroundColor = '#f9f3e9';
    
    // 飲品標題
    const title = document.createElement('h4');
    title.textContent = drinkName;
    title.style.margin = '0 0 5px 0';
    title.style.color = '#8b4513';
    recipeCard.appendChild(title);
    
    // 飲品描述
    if (drinkInfo.description) {
        const description = document.createElement('p');
        description.textContent = drinkInfo.description;
        description.style.fontSize = '0.9em';
        description.style.fontStyle = 'italic';
        description.style.margin = '5px 0';
        recipeCard.appendChild(description);
    }
    
    // 價格和製作時間
    const priceTime = document.createElement('p');
    priceTime.innerHTML = `售價: <b>${drinkInfo.sellPrice}元</b> | 製作時間: <b>${drinkInfo.preparationTime}秒</b>`;
    priceTime.style.margin = '5px 0';
    recipeCard.appendChild(priceTime);
    
    // 配方材料
    const ingredients = document.createElement('div');
    ingredients.style.marginTop = '5px';
    
    const title2 = document.createElement('span');
    title2.textContent = '配方: ';
    title2.style.fontWeight = 'bold';
    ingredients.appendChild(title2);
    
    for (const [ingredient, amount] of Object.entries(drinkInfo.requiredIngredients)) {
        const ing = document.createElement('span');
        ing.textContent = `${translateIngredient(ingredient)} x${amount} `;
        ing.style.marginRight = '5px';
        ingredients.appendChild(ing);
    }
    
    recipeCard.appendChild(ingredients);
    container.appendChild(recipeCard);
}

// 翻譯原料名稱
function translateIngredient(ingredient) {
    const translations = {
        'coffee': '咖啡',
        'milk': '牛奶',
        'sugar': '糖',
        'cocoa': '可可粉',
        'ice': '冰塊',
        'chocolate_syrup': '巧克力醬',
        'matcha': '抹茶粉',
        'tea': '茶葉',
        'fruit': '水果'
    };
    
    return translations[ingredient] || ingredient;
}

// 檢查任務完成情況
function checkMissionCompletion() {
    missions.forEach(mission => {
        if (!mission.completed) {
            let completed = false;
            
            if (mission.type === 'drink' && drinksMade[mission.target] >= mission.count) {
                completed = true;
            } else if (mission.type === 'staff' && staff.length >= mission.count) {
                completed = true;
            } else if (mission.type === 'decor' && decorations.length >= mission.count) {
                completed = true;
            }
            
            if (completed) {
                mission.completed = true;
                money += mission.reward;
                updateMoney();
                showNotification(`任務完成：${mission.description}，獲得${mission.reward}元！`);
                renderMissionsList();
            }
        }
    });
}

// 初始化遊戲
window.addEventListener('DOMContentLoaded', function() {
    updateMoney();
    updateIngredients();
    renderRecipeList();
    
    // 每10秒生成一個隨機訂單
    setInterval(() => {
        if (pendingOrders.length < 5) {
            const drinkNames = Object.keys(drinks);
            const randomDrink = drinkNames[Math.floor(Math.random() * drinkNames.length)];
            const order = {
                drink: randomDrink,
                reward: drinks[randomDrink].sellPrice + Math.floor(Math.random() * 20),
                id: Date.now() // 給訂單一個唯一ID，方便查找和刪除
            };
            pendingOrders.push(order);
            showNotification(`新訂單：${order.drink}`);
            renderPendingOrdersList(); // 新增訂單後刷新列表
        }
    }, 10000);
    
    // 員工每秒產生收入
    setInterval(() => {
        if (staff.length > 0) {
            const income = staff.length;
            money += income;
            updateMoney();
        }
    }, 1000);

    // 為製作按鈕添加事件監聽器
    const makeButton = document.getElementById('permanent-make-button');
    if (makeButton) {
        makeButton.addEventListener('click', processMixedDrink);
    }
});

function processMixedDrink() {
    if (!currentMixingOrderDetails) {
        showNotification('請先從待處理訂單中選擇一個飲品！');
        return;
    }

    const targetDrinkName = currentMixingOrderDetails.drink;
    const drinkInfo = drinks[targetDrinkName];
    const recipe = drinkInfo.requiredIngredients;

    // 收集輸入的材料數量
    const mixedIngredients = {
        coffee: parseInt(document.getElementById('permanent-coffee-input').value) || 0,
        milk: parseInt(document.getElementById('permanent-milk-input').value) || 0,
        sugar: parseInt(document.getElementById('permanent-sugar-input').value) || 0,
        cocoa: parseInt(document.getElementById('permanent-cocoa-input').value) || 0,
        ice: parseInt(document.getElementById('permanent-ice-input').value) || 0,
        chocolate_syrup: parseInt(document.getElementById('permanent-chocolate-syrup-input').value) || 0,
        matcha: parseInt(document.getElementById('permanent-matcha-input')?.value) || 0,
        tea: parseInt(document.getElementById('permanent-tea-input')?.value) || 0,
        fruit: parseInt(document.getElementById('permanent-fruit-input')?.value) || 0
    };

    // 檢查配方是否正確
    let recipeMatch = true;
    for (const ingredient in recipe) {
        if (mixedIngredients[ingredient] !== recipe[ingredient]) {
            recipeMatch = false;
            break;
        }
    }
    // 同時檢查是否有多餘的原料
    for (const ingredient in mixedIngredients) {
        if (mixedIngredients[ingredient] > 0 && !recipe[ingredient]) {
             recipeMatch = false; // 有配方外原料
             break;
        }
        if (recipe[ingredient] && mixedIngredients[ingredient] !== recipe[ingredient]) {
            recipeMatch = false; // 配方內原料數量不對
            break;
        }
    }

    if (!recipeMatch) {
        showNotification('調配錯誤，請依照正確配方製作！');
        return;
    }

    // 檢查原料是否足夠
    for (const ingredient in recipe) {
        if (!ingredients[ingredient] || ingredients[ingredient] < recipe[ingredient]) {
            showNotification(`原料不足：${translateIngredient(ingredient)} 不夠！`);
            return;
        }
    }

    // 顯示製作動畫
    const cafeView = document.getElementById('cafe-view');
    const drinkAnimation = document.createElement('div');
    drinkAnimation.className = 'drink-animation';
    drinkAnimation.innerHTML = `<div class="drink-icon">☕</div><div class="drink-name">${targetDrinkName}</div>`;
    cafeView.appendChild(drinkAnimation);
    
    // 製作時間延遲
    const preparationTime = drinkInfo.preparationTime * 1000 || 3000;
    
    // 扣除原料
    for (const ingredient in recipe) {
        ingredients[ingredient] -= recipe[ingredient];
    }
    updateIngredients();
    
    // 顯示製作中提示
    showNotification(`正在製作 ${targetDrinkName}...`);
    
    // 延遲完成
    setTimeout(() => {
        // 移除動畫
        cafeView.removeChild(drinkAnimation);
        
        // 增加金錢
        money += currentMixingOrderDetails.reward;
        updateMoney();
        
        // 增加經驗值
        const expGained = drinkInfo.experience || 5;
        addExperience(expGained);
        
        // 增加售出飲品數量
        drinksSold++;
        if (typeof window.drinksMade !== 'undefined' && window.drinksMade[targetDrinkName] !== undefined) {
            window.drinksMade[targetDrinkName]++;
            checkMissionCompletion(); // 檢查任務完成情況
        }
        
        // 顯示完成通知
        showNotification(`${targetDrinkName} 製作完成！獲得 ${currentMixingOrderDetails.reward}元 和 ${expGained} 經驗值！`);
        
        // 播放完成音效（如果有）
        const orderCompleteSound = document.getElementById('order-complete-sound');
        if (orderCompleteSound) {
            orderCompleteSound.play().catch(e => console.log('Unable to play sound', e));
        }
        
        // 移除已完成的訂單
        const orderIndex = pendingOrders.findIndex(o => o.id === currentMixingOrderDetails.id);
        if (orderIndex > -1) {
            pendingOrders.splice(orderIndex, 1);
        }
        
        currentMixingOrderDetails = null; // 清除當前選中
        document.getElementById('permanent-required-drink').textContent = '無';
        renderPendingOrdersList(); // 刷新訂單列表
    }, preparationTime);
    
    // 清空調酒台的輸入框
    document.getElementById('permanent-coffee-input').value = 0;
    document.getElementById('permanent-milk-input').value = 0;
    document.getElementById('permanent-sugar-input').value = 0;
    document.getElementById('permanent-cocoa-input').value = 0;
    document.getElementById('permanent-ice-input').value = 0;
    document.getElementById('permanent-chocolate-syrup-input').value = 0;
    
    // 清空新材料輸入框（如果存在）
    const newIngredientInputs = ['matcha', 'tea', 'fruit'];
    newIngredientInputs.forEach(ing => {
        const input = document.getElementById(`permanent-${ing}-input`);
        if (input) input.value = 0;
    });
}