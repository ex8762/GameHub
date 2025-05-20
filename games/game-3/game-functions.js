// 遊戲核心變數和函數

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
    chocolate_syrup: 5
};

// 員工
let staff = [];

// 裝飾
let decorations = [];

// 飲品配方
let drinks = {
    "美式咖啡": {
        requiredIngredients: { coffee: 2, sugar: 1 },
        sellPrice: 60
    },
    "拿鐵": {
        requiredIngredients: { coffee: 1, milk: 2, sugar: 1 },
        sellPrice: 80
    },
    "卡布奇諾": {
        requiredIngredients: { coffee: 1, milk: 1, sugar: 1 },
        sellPrice: 90
    },
    "摩卡": {
        requiredIngredients: { coffee: 1, milk: 1, cocoa: 1, sugar: 1 },
        sellPrice: 100
    },
    "冰咖啡": {
        requiredIngredients: { coffee: 2, sugar: 1, ice: 2 },
        sellPrice: 70
    },
    "巧克力咖啡": {
        requiredIngredients: { coffee: 1, milk: 1, chocolate_syrup: 1 },
        sellPrice: 110
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

// 更新物資顯示
function updateIngredients() {
    document.getElementById('coffee-count').textContent = ingredients.coffee;
    document.getElementById('milk-count').textContent = ingredients.milk;
    document.getElementById('sugar-count').textContent = ingredients.sugar;
    document.getElementById('cocoa-count').textContent = ingredients.cocoa;
    document.getElementById('ice-count').textContent = ingredients.ice;
    document.getElementById('chocolate-syrup-count').textContent = ingredients.chocolate_syrup;
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
    
    for (const [drinkName, drinkInfo] of Object.entries(drinks)) {
        const li = document.createElement('li');
        const recipe = drinkInfo.requiredIngredients;
        let recipeText = `${drinkName} (${drinkInfo.sellPrice}元): `;
        
        if (recipe.coffee) recipeText += `咖啡 x${recipe.coffee} `;
        if (recipe.milk) recipeText += `牛奶 x${recipe.milk} `;
        if (recipe.sugar) recipeText += `糖 x${recipe.sugar} `;
        if (recipe.cocoa) recipeText += `可可 x${recipe.cocoa} `;
        if (recipe.ice) recipeText += `冰塊 x${recipe.ice} `;
        if (recipe.chocolate_syrup) recipeText += `巧克力醬 x${recipe.chocolate_syrup} `;
        
        li.textContent = recipeText;
        recipeList.appendChild(li);
    }
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
    const recipe = drinks[targetDrinkName].requiredIngredients;

    const mixedIngredients = {
        coffee: parseInt(document.getElementById('permanent-coffee-input').value) || 0,
        milk: parseInt(document.getElementById('permanent-milk-input').value) || 0,
        sugar: parseInt(document.getElementById('permanent-sugar-input').value) || 0,
        cocoa: parseInt(document.getElementById('permanent-cocoa-input').value) || 0,
        ice: parseInt(document.getElementById('permanent-ice-input').value) || 0,
        chocolate_syrup: parseInt(document.getElementById('permanent-chocolate-syrup-input').value) || 0
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
        if (ingredients[ingredient] < recipe[ingredient]) {
            showNotification(`原料不足：${ingredient} 不夠！`);
            return;
        }
    }

    // 扣除原料
    for (const ingredient in recipe) {
        ingredients[ingredient] -= recipe[ingredient];
    }
    updateIngredients();

    // 增加金錢
    money += currentMixingOrderDetails.reward;
    updateMoney();

    // 增加售出飲品數量 (如果需要追蹤)
    drinksSold++; 
    // if (drinksMade && drinksMade[targetDrinkName] !== undefined) { drinksMade[targetDrinkName]++; }
    // checkMissionCompletion(); // 如果有任務系統需要更新

    showNotification(`${targetDrinkName} 製作完成！獲得 ${currentMixingOrderDetails.reward}元！`);

    // 移除已完成的訂單
    const orderIndex = pendingOrders.findIndex(o => o.id === currentMixingOrderDetails.id);
    if (orderIndex > -1) {
        pendingOrders.splice(orderIndex, 1);
    }
    
    currentMixingOrderDetails = null; // 清除當前選中
    document.getElementById('permanent-required-drink').textContent = '無';
    renderPendingOrdersList(); // 刷新訂單列表
    
    // 清空調酒台的輸入框
    document.getElementById('permanent-coffee-input').value = 0;
    document.getElementById('permanent-milk-input').value = 0;
    document.getElementById('permanent-sugar-input').value = 0;
    document.getElementById('permanent-cocoa-input').value = 0;
    document.getElementById('permanent-ice-input').value = 0;
    document.getElementById('permanent-chocolate-syrup-input').value = 0;
}