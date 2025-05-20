// 修復按鈕無響應問題

// 檢查buildings對象是否已定義，如果沒有則定義它
if (typeof buildings === 'undefined') {
    // 人口類建築
    const populationBuildings = {
        house: { count: 0, level: 1, baseCost: 100, basePop: 5, upgradeCost: 150 }
    };

    // 能源類建築
    const energyBuildings = {
        powerplant: { count: 0, level: 1, baseCost: 400, baseEnergy: 15, upgradeCost: 500 }
    };

    // 工業品類建築
    const industryBuildings = {
        factory: { count: 0, level: 1, baseCost: 500, baseIndustry: 10, upgradeCost: 600 }
    };

    // 綜合類建築（如商業區，主要產生金錢）
    const incomeBuildings = {
        shop: { count: 0, level: 1, baseCost: 300, baseIncome: 30, upgradeCost: 400 }
    };

    // 匯總所有建築物，方便主程式統一管理
    window.buildings = {
        ...populationBuildings,
        ...energyBuildings,
        ...industryBuildings,
        ...incomeBuildings
    };
}

// 確保所有按鈕事件處理函數都已定義
if (typeof build !== 'function') {
    window.build = function(type) {
        const b = buildings[type];
        if (!b) return;
        let cost = b.baseCost * Math.pow(1.2, b.count);
        cost = Math.floor(cost);
        if (money < cost) { log('金錢不足，無法建造。'); return; }
        money -= cost;
        b.count++;
        if (type === 'house') population += b.basePop * b.level;
        if (type === 'factory') industry += b.baseIndustry * b.level;
        if (type === 'powerplant') energy += b.baseEnergy * b.level;
        log(`建造1座${getBuildingName(type)}，花費$${cost}。`);
        update();
    };
}

if (typeof upgradeBuilding !== 'function') {
    window.upgradeBuilding = function(type) {
        const b = buildings[type];
        if (!b) return;
        let cost = b.upgradeCost * b.level;
        if (money < cost) { log('金錢不足，無法升級。'); return; }
        money -= cost;
        b.level++;
        log(`${getBuildingName(type)}升級為等級${b.level}！`);
        update();
    };
}

if (typeof collectIncome !== 'function') {
    window.collectIncome = function() {
        let income = buildings.shop.count * 30 * buildings.shop.level;
        let factoryProd = buildings.factory.count * 10 * buildings.factory.level;
        let powerProd = buildings.powerplant.count * 15 * buildings.powerplant.level;
        money += income;
        industry += factoryProd;
        energy += powerProd;
        log(`收取收益：金錢+$${income}，工業品+${factoryProd}，能源+${powerProd}`);
        update();
    };
}

if (typeof nextTick !== 'function') {
    window.nextTick = function() {
        // 放置收益：每次自動產生資源與金錢
        collectIncome();
        log('時間流逝，自動獲得收益！');
    };
}

if (typeof getBuildingName !== 'function') {
    window.getBuildingName = function(type) {
        switch(type) {
            case 'house': return '住宅區';
            case 'shop': return '商業區';
            case 'factory': return '工廠';
            case 'powerplant': return '發電廠';
            default: return '';
        }
    };
}

// 確保log和update函數已定義
if (typeof log !== 'function') {
    window.log = function(msg) {
        document.getElementById('log').textContent = msg;
    };
}

// 函數：確保全局遊戲狀態變量為數字並初始化
function ensureGlobalNumericState() {
    window.money = (typeof window.money === 'number' && !isNaN(window.money)) ? window.money : 1000;
    window.level = (typeof window.level === 'number' && !isNaN(window.level)) ? window.level : 1;
    window.population = (typeof window.population === 'number' && !isNaN(window.population)) ? window.population : 0;
    window.energy = (typeof window.energy === 'number' && !isNaN(window.energy)) ? window.energy : 0;
    window.industry = (typeof window.industry === 'number' && !isNaN(window.industry)) ? window.industry : 0;
}

// 腳本解析時，初始化一次全局狀態
ensureGlobalNumericState();

window.update = function() {
    ensureGlobalNumericState(); // 在更新前確保狀態為數字

    // 正確設置元素的文本內容，而不是將元素本身賦值給textContent
    document.getElementById('money').textContent = money;
    document.getElementById('level').textContent = level;
    document.getElementById('population').textContent = population;
    document.getElementById('energy').textContent = energy;
    document.getElementById('industry').textContent = industry;
    document.getElementById('house-count').textContent = buildings.house.count;
    document.getElementById('shop-count').textContent = buildings.shop.count;
    document.getElementById('factory-count').textContent = buildings.factory.count;
    document.getElementById('powerplant-count').textContent = buildings.powerplant.count;
};

// 修復index.html中的按鈕事件
document.addEventListener('DOMContentLoaded', function() {
    // 初始化更新，確保頁面加載時顯示正確的數值
    update(); // update 函數內部會調用 ensureGlobalNumericState
    
    // 不需要重新綁定按鈕事件，因為HTML中已經有onclick屬性
    // 確保全局函數可用即可，上面的代碼已經定義了所有需要的函數
});