import { buildings } from "./buildings.js";
let money = 1000;
let level = 1;
let population = 0;
let energy = 0;
let industry = 0;

function update() {
    document.getElementById('money').textContent = money;
    document.getElementById('level').textContent = level;
    document.getElementById('population').textContent = population;
    document.getElementById('energy').textContent = energy;
    document.getElementById('industry').textContent = industry;
    document.getElementById('house-count').textContent = buildings.house.count;
    document.getElementById('shop-count').textContent = buildings.shop.count;
    document.getElementById('factory-count').textContent = buildings.factory.count;
    document.getElementById('powerplant-count').textContent = buildings.powerplant.count;
}

function log(msg) {
    document.getElementById('log').textContent = msg;
}

function build(type) {
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
}

function upgradeBuilding(type) {
    const b = buildings[type];
    if (!b) return;
    let cost = b.upgradeCost * b.level;
    if (money < cost) { log('金錢不足，無法升級。'); return; }
    money -= cost;
    b.level++;
    log(`${getBuildingName(type)}升級為等級${b.level}！`);
    update();
}

function collectIncome() {
    let income = buildings.shop.count * 30 * buildings.shop.level;
    let factoryProd = buildings.factory.count * 10 * buildings.factory.level;
    let powerProd = buildings.powerplant.count * 15 * buildings.powerplant.level;
    money += income;
    industry += factoryProd;
    energy += powerProd;
    log(`收取收益：金錢+$${income}，工業品+${factoryProd}，能源+${powerProd}`);
    update();
}

function nextTick() {
    // 放置收益：每次自動產生資源與金錢
    collectIncome();
    log('時間流逝，自動獲得收益！');
}

function getBuildingName(type) {
    switch(type) {
        case 'house': return '住宅區';
        case 'shop': return '商業區';
        case 'factory': return '工廠';
        case 'powerplant': return '發電廠';
        default: return '';
    }
}

// 自動放置收益，每5秒自動執行一次 nextTick
setInterval(nextTick, 5000);
update();