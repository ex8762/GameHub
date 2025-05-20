// 遊戲狀態
let gameState = {
    money: 100,
    reputation: 0,
    menu: [
        { name: '美式咖啡', price: 60, cost: 20, prepTime: 2000 },
        { name: '拿鐵', price: 80, cost: 30, prepTime: 3000 },
        { name: '卡布奇諾', price: 90, cost: 35, prepTime: 3500 }
    ],
    customers: [],
    orders: []
};

// DOM元素
const cafeView = document.getElementById('cafe-view');
const menuPanel = document.getElementById('menu-panel');
const customerPanel = document.getElementById('customer-panel');
const moneyDisplay = document.getElementById('money');
const reputationDisplay = document.getElementById('reputation');

// 初始化遊戲
function initGame() {
    updateDisplay();
    createMenuItems();
    startCustomerGeneration();
}

// 更新顯示
function updateDisplay() {
    moneyDisplay.textContent = `💰 ${gameState.money}`;
    reputationDisplay.textContent = `⭐ ${gameState.reputation}`;
}

// 創建菜單項目
function createMenuItems() {
    menuPanel.innerHTML = '<h2>菜單</h2>';
    gameState.menu.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <span>${item.name}</span>
            <span>$${item.price}</span>
        `;
        menuPanel.appendChild(menuItem);
    });
}

// 生成顧客
function startCustomerGeneration() {
    setInterval(() => {
        if (gameState.customers.length < 5) {
            generateCustomer();
        }
    }, 5000);
}

function generateCustomer() {
    const customer = {
        id: Date.now(),
        order: gameState.menu[Math.floor(Math.random() * gameState.menu.length)],
        patience: 20000 // 20秒耐心
    };
    gameState.customers.push(customer);
    displayCustomer(customer);
}

// 顯示顧客
function displayCustomer(customer) {
    const customerElement = document.createElement('div');
    customerElement.className = 'customer';
    customerElement.innerHTML = `
        <span>顧客想要: ${customer.order.name}</span>
        <button onclick="takeOrder(${customer.id})">接受訂單</button>
    `;
    customerPanel.appendChild(customerElement);

    // 設置顧客耐心計時器
    setTimeout(() => {
        if (gameState.customers.includes(customer)) {
            removeCustomer(customer);
            gameState.reputation = Math.max(0, gameState.reputation - 1);
            updateDisplay();
        }
    }, customer.patience);
}

// 接受訂單
function takeOrder(customerId) {
    const customerIndex = gameState.customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return;

    const customer = gameState.customers[customerIndex];
    const order = customer.order;

    // 開始製作飲品
    setTimeout(() => {
        completeOrder(customer);
    }, order.prepTime);

    // 從顧客列表中移除
    gameState.customers.splice(customerIndex, 1);
    customerPanel.removeChild(customerPanel.children[customerIndex + 1]); // +1 因為有標題
}

// 完成訂單
function completeOrder(customer) {
    const profit = customer.order.price - customer.order.cost;
    gameState.money += profit;
    gameState.reputation++;
    updateDisplay();
}

// 移除顧客
function removeCustomer(customer) {
    const index = gameState.customers.indexOf(customer);
    if (index > -1) {
        gameState.customers.splice(index, 1);
        customerPanel.removeChild(customerPanel.children[index + 1]); // +1 因為有標題
    }
}

// 啟動遊戲
window.onload = initGame;