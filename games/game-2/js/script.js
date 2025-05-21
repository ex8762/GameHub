// 遊戲狀態
const gameState = {
    money: 1000,
    level: 1,
    population: 0,
    energy: 20, // 初始提供20能源
    industry: 0,
    lastSave: Date.now(),
    populationEfficiency: 1, // 新增：人口效率
    satisfaction: 1, // 新增：滿意度
    health: 1, // 新增：健康度
    prestige: 0, // 新增：威望值
    researchPoints: 0 // 新增：研究點數
};

// 建築物配置
const buildings = {
    house: {
        count: 0,
        level: 1,
        baseCost: 50,
        basePop: 10,
        upgradeCost: 100,
        maintenanceCost: 2,
        energyConsumption: 0, // 住宅區不需要能源
        prestigeGain: 0.1
    },
    shop: {
        count: 0,
        level: 1,
        baseCost: 150,
        baseIncome: 50,
        upgradeCost: 200,
        maintenanceCost: 5,
        energyConsumption: 1,
        populationRequirement: 5,
        prestigeGain: 0.2
    },
    factory: {
        count: 0,
        level: 1,
        baseCost: 250,
        baseIndustry: 20,
        upgradeCost: 300,
        maintenanceCost: 8,
        energyConsumption: 2,
        populationRequirement: 10,
        prestigeGain: 0.3
    },
    powerplant: {
        count: 0,
        level: 1,
        baseCost: 200,
        baseEnergy: 20,
        upgradeCost: 250,
        maintenanceCost: 10,
        energyConsumption: 0,
        prestigeGain: 0.15
    },
    school: {
        count: 0,
        level: 1,
        baseCost: 300,
        baseEfficiency: 0.1,
        upgradeCost: 400,
        maintenanceCost: 15,
        energyConsumption: 1,
        populationRequirement: 30,
        prestigeGain: 0.25,
        researchPointsGain: 0.2
    },
    hospital: {
        count: 0,
        level: 1,
        baseCost: 400,
        baseHealth: 0.15,
        upgradeCost: 500,
        maintenanceCost: 20,
        energyConsumption: 2,
        populationRequirement: 50,
        prestigeGain: 0.3,
        researchPointsGain: 0.25
    },
    park: {
        count: 0,
        level: 1,
        baseCost: 200,
        baseSatisfaction: 0.12,
        upgradeCost: 300,
        maintenanceCost: 10,
        energyConsumption: 1,
        populationRequirement: 20,
        prestigeGain: 0.2,
        researchPointsGain: 0.15
    }
};

// 成就系統
const achievements = {
    population: {
        name: '人口發展',
        levels: [
            { requirement: 100, reward: 1000, completed: false },
            { requirement: 500, reward: 5000, completed: false },
            { requirement: 1000, reward: 10000, completed: false }
        ]
    },
    money: {
        name: '財富累積',
        levels: [
            { requirement: 5000, reward: 2000, completed: false },
            { requirement: 20000, reward: 10000, completed: false },
            { requirement: 50000, reward: 25000, completed: false }
        ]
    },
    industry: {
        name: '工業發展',
        levels: [
            { requirement: 50, reward: 1500, completed: false },
            { requirement: 200, reward: 7500, completed: false },
            { requirement: 500, reward: 15000, completed: false }
        ]
    }
};

// 等級獎勵
const levelRewards = {
    2: { money: 2000, population: 20 },
    3: { money: 3000, energy: 30 },
    4: { money: 4000, industry: 40 },
    5: { money: 5000, population: 50 }
};

// 音效系統
const sounds = {
    build: new Audio('sounds/build.mp3'),
    upgrade: new Audio('sounds/upgrade.mp3'),
    collect: new Audio('sounds/collect.mp3'),
    achievement: new Audio('sounds/achievement.mp3')
};

// 播放音效
function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(() => {
            // 忽略自動播放限制錯誤
        });
    }
}

// 添加動畫效果
function addAnimation(element, className) {
    element.classList.add(className);
    element.addEventListener('animationend', () => {
        element.classList.remove(className);
    });
}

// 更新資源顯示
function updateResourceDisplay(id, value) {
    const element = document.getElementById(id);
    if (!element) return; // 若元素不存在則直接跳過
    const oldValue = parseInt(element.textContent);
    if (oldValue !== value) {
        addAnimation(element, 'resource-change');
    }
    element.textContent = Math.floor(value);
}

const GUIDE_ICON = '<i class="fas fa-lightbulb guide-icon"></i>';

// 實時指引系統
const gameGuide = {
    steps: [{
            condition: () => buildings.house.count < 2,
            message: "先建造2個住宅區來增加人口",
            highlight: () => '[onclick="build(\'house\')"]'
        },
        {
            condition: () => buildings.house.count >= 2 && buildings.shop.count === 0,
            message: "建造商業區來賺取金錢",
            highlight: () => '[onclick="build(\'shop\')"]'
        },
        {
            condition: () => buildings.shop.count > 0 && buildings.powerplant.count === 0,
            message: "建造發電廠來提供更多能源",
            highlight: () => '[onclick="build(\'powerplant\')"]'
        },
        {
            condition: () => buildings.powerplant.count > 0 && buildings.factory.count === 0,
            message: "建造工廠來增加工業產值",
            highlight: () => '[onclick="build(\'factory\')"]'
        },
        {
            condition: () => buildings.factory.count > 0 && buildings.park.count === 0 && gameState.population >= 20,
            message: "建造公園來提升滿意度",
            highlight: () => '[onclick="build(\'park\')"]'
        },
        {
            condition: () => buildings.park.count > 0 && buildings.school.count === 0 && gameState.population >= 30,
            message: "建造學校來提升效率",
            highlight: () => '[onclick="build(\'school\')"]'
        },
        {
            condition: () => buildings.school.count > 0 && buildings.hospital.count === 0 && gameState.population >= 50,
            message: "建造醫院來提升健康度",
            highlight: () => '[onclick="build(\'hospital\')"]'
        }
    ],
    currentStep: 0,
    _hideTimer: null,
    update() {
        document.querySelectorAll('button').forEach(button => {
            button.style.animation = '';
        });
        let found = false;
        for (let i = 0; i < this.steps.length; i++) {
            if (this.steps[i].condition()) {
                this.currentStep = i;
                found = true;
                break;
            }
        }
        const guidePanel = document.getElementById('guide-panel');
        if (found) {
            const step = this.steps[this.currentStep];
            const percent = Math.round(((this.currentStep + 1) / this.steps.length) * 100);
            if (guidePanel) {
                guidePanel.style.display = 'flex';
                guidePanel.innerHTML = `
                    <div class='guide-title'>${GUIDE_ICON} 新手指引</div>
                    <div>${step.message}</div>
                    <div class='guide-progress'><div class='guide-progress-bar' style='width:${percent}%;'></div></div>
                    <div style='font-size:0.95em;color:#888;'>步驟 ${this.currentStep+1} / ${this.steps.length}</div>
                `;
            }
            if (step.highlight) {
                const selector = step.highlight();
                const btn = document.querySelector(selector);
                if (btn) btn.style.animation = 'pulse 1s infinite';
            }
            if (this._hideTimer) {
                clearTimeout(this._hideTimer);
                this._hideTimer = null;
            }
        } else {
            if (guidePanel) {
                guidePanel.style.display = 'flex';
                guidePanel.innerHTML = `<div class='guide-title'>${GUIDE_ICON} 新手指引</div><div>恭喜！你已經掌握基本玩法，盡情發展你的城市吧！</div>`;
                if (this._hideTimer) clearTimeout(this._hideTimer);
                this._hideTimer = setTimeout(() => {
                    guidePanel.style.display = 'none';
                }, 10000);
            }
        }
    }
};

// 等級系統配置
const levelSystem = {
    1: {
        name: "新手市長",
        requirements: { population: 0 },
        unlocks: {
            buildings: ['house', 'shop', 'powerplant', 'factory', 'park', 'school', 'hospital'],
            research: ['efficiency'],
            achievements: ['population']
        }
    },
    2: {
        name: "發展中的城市",
        requirements: { population: 100 },
        unlocks: {
            buildings: [],
            research: ['energy'],
            achievements: ['money']
        }
    },
    3: {
        name: "繁榮都市",
        requirements: { population: 300 },
        unlocks: {
            buildings: ['mall'],
            research: ['production'],
            achievements: ['industry']
        }
    },
    4: {
        name: "現代化大都會",
        requirements: { population: 600 },
        unlocks: {
            buildings: ['hospital', 'stadium'],
            research: ['automation'],
            achievements: ['prestige']
        }
    },
    5: {
        name: "國際大都市",
        requirements: { population: 1000 },
        unlocks: {
            buildings: ['airport', 'research_center'],
            research: ['future_tech'],
            achievements: ['master']
        }
    }
};

// 新增建築物
const newBuildings = {
    mall: {
        count: 0,
        level: 1,
        baseCost: 800,
        baseIncome: 200,
        upgradeCost: 1000,
        maintenanceCost: 30,
        energyConsumption: 5,
        populationRequirement: 200,
        prestigeGain: 0.5,
        researchPointsGain: 0.3
    },
    stadium: {
        count: 0,
        level: 1,
        baseCost: 1200,
        baseIncome: 300,
        upgradeCost: 1500,
        maintenanceCost: 40,
        energyConsumption: 8,
        populationRequirement: 400,
        prestigeGain: 0.8,
        researchPointsGain: 0.4
    },
    airport: {
        count: 0,
        level: 1,
        baseCost: 2000,
        baseIncome: 500,
        upgradeCost: 2500,
        maintenanceCost: 60,
        energyConsumption: 15,
        populationRequirement: 800,
        prestigeGain: 1.2,
        researchPointsGain: 0.6
    },
    research_center: {
        count: 0,
        level: 1,
        baseCost: 1500,
        baseIncome: 100,
        upgradeCost: 2000,
        maintenanceCost: 50,
        energyConsumption: 10,
        populationRequirement: 600,
        prestigeGain: 0.6,
        researchPointsGain: 1.0
    }
};

// 研究系統（分支設計）
const research = {
    efficiency: {
        name: '效率提升',
        branches: {
            pop: {
                name: '人口效率',
                levels: [
                    { cost: 100, effect: 0.1, completed: false },
                    { cost: 300, effect: 0.15, completed: false },
                    { cost: 600, effect: 0.2, completed: false }
                ]
            },
            money: {
                name: '金錢效率',
                levels: [
                    { cost: 120, effect: 0.12, completed: false },
                    { cost: 350, effect: 0.18, completed: false },
                    { cost: 700, effect: 0.25, completed: false }
                ]
            }
        },
        chosen: null // 玩家選擇的分支
    },
    energy: {
        name: '能源優化',
        levels: [
            { cost: 150, effect: 0.1, completed: false },
            { cost: 400, effect: 0.15, completed: false },
            { cost: 800, effect: 0.2, completed: false }
        ]
    },
    production: {
        name: '產能提升',
        levels: [
            { cost: 200, effect: 0.1, completed: false },
            { cost: 500, effect: 0.15, completed: false },
            { cost: 1000, effect: 0.2, completed: false }
        ]
    }
};

// 新增研究項目
const newResearch = {
    automation: {
        name: '自動化技術',
        levels: [
            { cost: 300, effect: 0.2, completed: false },
            { cost: 800, effect: 0.3, completed: false },
            { cost: 1500, effect: 0.4, completed: false }
        ]
    },
    future_tech: {
        name: '未來科技',
        levels: [
            { cost: 500, effect: 0.3, completed: false },
            { cost: 1200, effect: 0.4, completed: false },
            { cost: 2000, effect: 0.5, completed: false }
        ]
    }
};

// 更新研究配置
Object.assign(research, newResearch);

// 更新成就配置
const newAchievements = {
    prestige: {
        name: '城市威望',
        levels: [
            { requirement: 10, reward: 5000, completed: false },
            { requirement: 50, reward: 20000, completed: false },
            { requirement: 100, reward: 50000, completed: false }
        ]
    },
    master: {
        name: '城市大師',
        levels: [
            { requirement: 1000, reward: 100000, completed: false },
            { requirement: 5000, reward: 500000, completed: false },
            { requirement: 10000, reward: 1000000, completed: false }
        ]
    }
};

// 更新建築物配置
Object.assign(buildings, newBuildings);

// 更新成就配置
Object.assign(achievements, newAchievements);

// 檢查等級提升
function checkLevelUp() {
    const currentLevel = gameState.level;
    const nextLevel = currentLevel + 1;

    if (levelSystem[nextLevel] &&
        gameState.population >= levelSystem[nextLevel].requirements.population) {
        gameState.level = nextLevel;
        const levelData = levelSystem[nextLevel];

        // 解鎖新內容
        unlockNewContent(levelData.unlocks);

        // 顯示等級提升訊息
        log(`恭喜！城市等級提升到 ${nextLevel} 級：${levelData.name}`);
        log('解鎖新內容：');
        if (levelData.unlocks.buildings) {
            levelData.unlocks.buildings.forEach(building => {
                log(`- 新建築：${getBuildingName(building)}`);
            });
        }
        if (levelData.unlocks.research) {
            levelData.unlocks.research.forEach(tech => {
                log(`- 新研究：${research[tech].name}`);
            });
        }

        // 播放升級音效
        playSound('upgrade');

        // 更新界面
        update();
        saveGame();
    }
}

// 解鎖新內容
function unlockNewContent(unlocks) {
    // 解鎖建築物
    if (unlocks.buildings) {
        unlocks.buildings.forEach(building => {
            const buildingRow = document.querySelector(`[data-building="${building}"]`);
            if (buildingRow) {
                buildingRow.classList.remove('locked');
            }
        });
    }

    // 解鎖研究
    if (unlocks.research) {
        unlocks.research.forEach(tech => {
            const researchItem = document.querySelector(`[data-research="${tech}"]`);
            if (researchItem) {
                researchItem.classList.remove('locked');
            }
        });
    }
}

// 更新遊戲界面
function update() {
    updateResourceDisplay('money', gameState.money);
    updateResourceDisplay('level', gameState.level);
    updateResourceDisplay('population', gameState.population);
    updateResourceDisplay('energy', gameState.energy);
    updateResourceDisplay('industry', gameState.industry);
    updateResourceDisplay('prestige', gameState.prestige);
    updateResourceDisplay('research-points', gameState.researchPoints);

    // 更新所有建築物計數和等級
    Object.keys(buildings).forEach(type => {
        updateResourceDisplay(`${type}-count`, buildings[type].count);
        updateResourceDisplay(`${type}-level`, buildings[type].level);
    });

    // 更新按鈕狀態
    updateButtonStates();

    // 檢查成就和等級獎勵
    checkAchievements();
    checkLevelRewards();

    // 檢查等級提升
    checkLevelUp();

    // 更新建築物顯示
    updateBuildings();

    // 更新研究顯示
    updateResearch();

    // 更新成就顯示
    updateAchievements();

    // 更新實時指引
    gameGuide.update();
}

// 更新按鈕狀態
function updateButtonStates() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.classList.contains('upgrade')) {
            const type = button.getAttribute('onclick').match(/'([^']+)'/)[1];
            const building = buildings[type];
            const cost = building.upgradeCost * Math.pow(1.5, building.level - 1);
            button.disabled = gameState.money < cost;
            button.title = `升級費用：$${Math.floor(cost)}`;
        } else if (button.getAttribute('onclick') && button.getAttribute('onclick').includes('build')) {
            const type = button.getAttribute('onclick').match(/'([^']+)'/)[1];
            const building = buildings[type];
            const cost = Math.floor(building.baseCost * Math.pow(1.2, building.count));
            const canBuildNow = canBuild(type);
            button.disabled = gameState.money < cost || !canBuildNow;

            // 設置按鈕提示
            let tooltip = `建造費用：$${Math.floor(cost)}`;
            if (!canBuildNow) {
                if (building.populationRequirement && gameState.population < building.populationRequirement * building.count) {
                    tooltip += `\n需要人口：${building.populationRequirement * building.count}`;
                }
                if (building.energyConsumption > 0) {
                    tooltip += `\n需要能源：${building.energyConsumption}`;
                }
            }
            button.title = tooltip;
        }
    });
}

// 檢查是否可以建造
function canBuild(type) {
    const building = buildings[type];
    if (!building) return false;

    // 檢查人口需求
    if (building.populationRequirement && gameState.population < building.populationRequirement * building.count) {
        return false;
    }

    // 檢查能源消耗
    const totalEnergyConsumption = Object.values(buildings).reduce((sum, b) =>
        sum + (b.count * b.energyConsumption * b.level), 0);
    if (totalEnergyConsumption > gameState.energy) {
        return false;
    }

    return true;
}

// 建造建築物
function build(type) {
    const building = buildings[type];
    if (!building || !canBuild(type)) {
        log('無法建造：資源不足或條件不符。');
        return;
    }

    const cost = Math.floor(building.baseCost * Math.pow(1.2, building.count));
    if (gameState.money < cost) {
        log('金錢不足，無法建造。');
        return;
    }

    gameState.money -= cost;
    building.count++;

    // 更新資源
    switch (type) {
        case 'house':
            gameState.population += building.basePop * building.level;
            break;
        case 'factory':
            gameState.industry += building.baseIndustry * building.level;
            break;
        case 'powerplant':
            gameState.energy += building.baseEnergy * building.level;
            break;
    }

    // 添加建造動畫
    const buildingRow = document.querySelector(`[onclick="build('${type}')"]`).closest('.building-row');
    addAnimation(buildingRow, 'building-construct');

    // 播放建造音效
    playSound('build');

    log(`建造1座${getBuildingName(type)}，花費$${cost}。`);
    update();
    saveGame();
}

// 升級建築物
function upgradeBuilding(type) {
    const building = buildings[type];
    if (!building) return;

    const cost = building.upgradeCost * Math.pow(1.5, building.level - 1);
    if (gameState.money < cost) {
        log('金錢不足，無法升級。');
        return;
    }

    gameState.money -= cost;
    building.level++;

    // 更新資源
    switch (type) {
        case 'house':
            gameState.population += building.basePop;
            break;
        case 'factory':
            gameState.industry += building.baseIndustry;
            break;
        case 'powerplant':
            gameState.energy += building.baseEnergy;
            break;
    }

    // 添加升級動畫
    const buildingRow = document.querySelector(`[onclick="upgradeBuilding('${type}')"]`).closest('.building-row');
    addAnimation(buildingRow, 'building-construct');

    // 播放升級音效
    playSound('upgrade');

    log(`${getBuildingName(type)}升級為等級${building.level}！`);
    update();
    saveGame();
}

// 收取收益
function collectIncome() {
    // 計算人口效率加成
    const efficiencyBonus = 1 + (buildings.school.count * buildings.school.level * buildings.school.baseEfficiency);
    const healthBonus = 1 + (buildings.hospital.count * buildings.hospital.level * buildings.hospital.baseHealth);
    const satisfactionBonus = 1 + (buildings.park.count * buildings.park.level * buildings.park.baseSatisfaction);

    // 計算研究加成
    const researchBonus = 1 + Object.values(research).reduce((sum, tech) => {
        return sum + tech.levels.reduce((techSum, level) => {
            return techSum + (level.completed ? level.effect : 0);
        }, 0);
    }, 0);

    const totalBonus = efficiencyBonus * healthBonus * satisfactionBonus * researchBonus;

    const income = buildings.shop.count * 30 * buildings.shop.level * totalBonus;
    const factoryProd = buildings.factory.count * 10 * buildings.factory.level * totalBonus;
    const powerProd = buildings.powerplant.count * 15 * buildings.powerplant.level;

    // 計算維護成本
    const maintenanceCost = Object.values(buildings).reduce((sum, b) =>
        sum + (b.count * b.maintenanceCost * b.level), 0);

    // 計算能源消耗
    const energyConsumption = Object.values(buildings).reduce((sum, b) =>
        sum + (b.count * b.energyConsumption * b.level), 0);

    // 計算威望和研究點數
    const prestigeGain = Object.values(buildings).reduce((sum, b) =>
        sum + (b.count * b.prestigeGain * b.level), 0);
    const researchPointsGain = Object.values(buildings).reduce((sum, b) =>
        sum + (b.count * (b.researchPointsGain || 0) * b.level), 0);

    gameState.money += income - maintenanceCost;
    gameState.industry += factoryProd;
    gameState.energy = powerProd - energyConsumption;
    gameState.prestige += prestigeGain;
    gameState.researchPoints += researchPointsGain;

    // 更新效率值
    gameState.populationEfficiency = efficiencyBonus;
    gameState.health = healthBonus;
    gameState.satisfaction = satisfactionBonus;

    // 播放收取音效
    playSound('collect');

    log(`收取收益：$${Math.floor(income)}，工業產值：${Math.floor(factoryProd)}，能源：${Math.floor(gameState.energy)}，威望：+${prestigeGain.toFixed(1)}，研究點數：+${researchPointsGain.toFixed(1)}`);
    update();
    saveGame();
}

// 自動收益
function nextTick() {
    collectIncome();
    log('時間流逝，自動獲得收益！');
    autoIncomeSeconds = 30;
}

// 保存遊戲
function saveGame() {
    const saveData = {
        gameState,
        buildings,
        achievements,
        lastSave: Date.now()
    };
    localStorage.setItem('simulationGame', JSON.stringify(saveData));
}

// 載入遊戲
function loadGame() {
    const saveData = localStorage.getItem('simulationGame');
    if (saveData) {
        const data = JSON.parse(saveData);
        Object.assign(gameState, data.gameState);
        Object.assign(buildings, data.buildings);
        if (data.achievements) {
            Object.assign(achievements, data.achievements);
        }
        log('遊戲已載入！');
    }
}

// 獲取建築物名稱
function getBuildingName(type) {
    const names = {
        house: '住宅區',
        shop: '商業區',
        factory: '工廠',
        powerplant: '發電廠',
        school: '學校',
        hospital: '醫院',
        park: '公園',
        mall: '購物中心',
        stadium: '體育場館',
        airport: '國際機場',
        research_center: '研究中心'
    };
    return names[type] || '';
}

// 切換遊戲說明面板
function toggleHelp() {
    const helpPanel = document.getElementById('helpPanel');
    helpPanel.style.display = helpPanel.style.display === 'none' ? 'block' : 'none';
}

// 初始化遊戲
function initGame() {
    loadGame();
    update();
    // 設置自動收益計時器
    setInterval(nextTick, 30000);

    // 顯示初始遊戲提示
    log('歡迎來到模擬經營遊戲！點擊右上角的問號圖示查看遊戲說明。');
}

// 添加 CSS 動畫
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// 記錄遊戲日誌
function log(message) {
    const logElement = document.getElementById('log');
    const time = new Date().toLocaleTimeString();
    logElement.innerHTML = `<div>[${time}] ${message}</div>` + logElement.innerHTML;
    // 只保留最新10筆
    const logs = logElement.querySelectorAll('div');
    if (logs.length > 10) {
        for (let i = 10; i < logs.length; i++) {
            logs[i].remove();
        }
    }
}

// 當頁面載入完成時初始化遊戲
document.addEventListener('DOMContentLoaded', initGame);

window.build = build;
window.upgradeBuilding = upgradeBuilding;
window.collectIncome = collectIncome;
window.toggleHelp = toggleHelp;

function resetGame() {
    localStorage.removeItem('simulationGame');
    location.reload();
}
window.resetGame = resetGame;

let autoIncomeSeconds = 30;
setInterval(() => {
    autoIncomeSeconds--;
    if (autoIncomeSeconds <= 0) autoIncomeSeconds = 30;
    const timer = document.getElementById('auto-income-timer');
    if (timer) timer.textContent = `自動收益倒數：${autoIncomeSeconds} 秒`;
}, 1000);

// 檢查成就
function checkAchievements() {
    Object.entries(achievements).forEach(([category, data]) => {
        data.levels.forEach((level, index) => {
            if (!level.completed) {
                let value;
                switch (category) {
                    case 'population':
                        value = gameState.population;
                        break;
                    case 'money':
                        value = gameState.money;
                        break;
                    case 'industry':
                        value = gameState.industry;
                        break;
                }

                if (value >= level.requirement) {
                    level.completed = true;
                    gameState.money += level.reward;

                    // 添加成就解鎖動畫
                    const achievementElement = document.querySelector(`#${category}-achievements .achievement-item:nth-child(${index + 1})`);
                    if (achievementElement) {
                        addAnimation(achievementElement, 'achievement-unlock');
                    }

                    // 播放成就音效
                    playSound('achievement');

                    log(`達成成就：${data.name} ${index + 1}，獲得獎勵：$${level.reward}`);
                }
            }
        });
    });
}

// 檢查等級獎勵
function checkLevelRewards() {
    const reward = levelRewards[gameState.level];
    if (reward) {
        gameState.money += reward.money || 0;
        gameState.population += reward.population || 0;
        gameState.energy += reward.energy || 0;
        gameState.industry += reward.industry || 0;

        log(`恭喜達到 ${gameState.level} 級！獲得獎勵：`);
        if (reward.money) log(`金錢 +$${reward.money}`);
        if (reward.population) log(`人口 +${reward.population}`);
        if (reward.energy) log(`能源 +${reward.energy}`);
        if (reward.industry) log(`工業 +${reward.industry}`);

        update();
        saveGame();
    }
}

// 更新成就顯示
function updateAchievements() {
    // 更新人口成就
    const populationList = document.getElementById('population-achievements');
    populationList.innerHTML = achievements.population.levels.map((level, index) => {
        const progress = Math.min(100, (gameState.population / level.requirement) * 100);
        return `
            <div class="achievement-item ${level.completed ? 'completed' : ''}">
                <div>人口發展 ${index + 1}</div>
                <div class="requirement">需要人口: ${level.requirement}</div>
                <div class="reward">獎勵: $${level.reward}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // 更新金錢成就
    const moneyList = document.getElementById('money-achievements');
    moneyList.innerHTML = achievements.money.levels.map((level, index) => {
        const progress = Math.min(100, (gameState.money / level.requirement) * 100);
        return `
            <div class="achievement-item ${level.completed ? 'completed' : ''}">
                <div>財富累積 ${index + 1}</div>
                <div class="requirement">需要金錢: $${level.requirement}</div>
                <div class="reward">獎勵: $${level.reward}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');

    // 更新工業成就
    const industryList = document.getElementById('industry-achievements');
    industryList.innerHTML = achievements.industry.levels.map((level, index) => {
        const progress = Math.min(100, (gameState.industry / level.requirement) * 100);
        return `
            <div class="achievement-item ${level.completed ? 'completed' : ''}">
                <div>工業發展 ${index + 1}</div>
                <div class="requirement">需要工業: ${level.requirement}</div>
                <div class="reward">獎勵: $${level.reward}</div>
                <div class="progress">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// 研究科技（分支邏輯）
function researchTech(category, branch, level) {
    const tech = research[category];
    if (!tech) return;
    // 分支型
    if (tech.branches) {
        if (tech.chosen === null) {
            tech.chosen = branch;
        }
        if (tech.chosen !== branch) return; // 只能選一分支
        const branchObj = tech.branches[branch];
        if (!branchObj || level >= branchObj.levels.length) return;
        const researchLevel = branchObj.levels[level];
        if (researchLevel.completed || gameState.researchPoints < researchLevel.cost) {
            log('無法研究：研究點數不足或已完成研究。');
            return;
        }
        gameState.researchPoints -= researchLevel.cost;
        researchLevel.completed = true;
        log(`完成研究：${branchObj.name} ${level + 1}級！`);
    } else {
        // 單線型
        if (level >= tech.levels.length) return;
        const researchLevel = tech.levels[level];
        if (researchLevel.completed || gameState.researchPoints < researchLevel.cost) {
            log('無法研究：研究點數不足或已完成研究。');
            return;
        }
        gameState.researchPoints -= researchLevel.cost;
        researchLevel.completed = true;
        log(`完成研究：${tech.name} ${level + 1}級！`);
    }
    update();
    saveGame();
}
window.researchTech = researchTech;

// 更新研究顯示（分支UI）
function updateResearch() {
    const researchList = document.getElementById('research-list');
    if (!researchList) return;
    researchList.innerHTML = Object.entries(research).map(([category, tech]) => {
                if (tech.branches) {
                    // 分支型
                    return `
                <div class="research-category">
                    <h3>${tech.name} <span style='color:#ff9800;'>(分支擇一)</span></h3>
                    <div style="display:flex;gap:10px;">
                        ${Object.entries(tech.branches).map(([branch, branchObj]) => {
                            const chosen = tech.chosen === branch;
                            const locked = tech.chosen !== null && !chosen;
                            return `
                                <div class="research-branch${chosen ? ' chosen' : ''}${locked ? ' locked' : ''}">
                                    <div style="font-weight:bold;">${branchObj.name}</div>
                                    ${branchObj.levels.map((level, idx) => `
                                        <div class="research-item ${level.completed ? 'completed' : ''}${locked ? ' locked' : ''}">
                                            <div>等級 ${idx + 1}</div>
                                            <div class="cost">研究點數: ${level.cost}</div>
                                            <div class="effect">效果: +${(level.effect * 100).toFixed(0)}%</div>
                                            <button onclick="researchTech('${category}', '${branch}', ${idx})" 
                                                ${level.completed || gameState.researchPoints < level.cost || locked ? 'disabled' : ''}>
                                                研究
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        } else {
            // 單線型
            return `
                <div class="research-category">
                    <h3>${tech.name}</h3>
                    ${tech.levels.map((level, index) => `
                        <div class="research-item ${level.completed ? 'completed' : ''}">
                            <div>等級 ${index + 1}</div>
                            <div class="cost">研究點數: ${level.cost}</div>
                            <div class="effect">效果: +${(level.effect * 100).toFixed(0)}%</div>
                            <button onclick="researchTech('${category}', null, ${index})" 
                                ${level.completed || gameState.researchPoints < level.cost ? 'disabled' : ''}>
                                研究
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }).join('');
}

// 折疊面板功能
function togglePanel(panelId) {
    const content = document.getElementById(`${panelId}-content`);
    const icon = content.previousElementSibling.querySelector('.toggle-icon');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.classList.add('expanded');
        icon.style.transform = 'rotate(180deg)';
    }
}

// 初始化時展開研究面板
document.addEventListener('DOMContentLoaded', function() {
    const researchContent = document.getElementById('research-content');
    const researchIcon = document.querySelector('#research-content').previousElementSibling.querySelector('.toggle-icon');
    researchContent.classList.add('expanded');
    researchIcon.style.transform = 'rotate(180deg)';
});

// 更新建築物顯示
function updateBuildings() {
    const buildingsContainer = document.querySelector('.buildings');
    buildingsContainer.innerHTML = `
        <h2>建築物</h2>
        ${Object.entries(buildings).map(([type, building]) => {
            const isUnlocked = isBuildingUnlocked(type);
            const desc = getBuildingDescription(type) || '無說明';
            const reqs =
                (building.populationRequirement ? `<p>需要${building.populationRequirement}人口</p>` : '') +
                (building.energyConsumption ? `<p>消耗${building.energyConsumption}能源</p>` : '');
            return `
                <div class="building-row ${isUnlocked ? '' : 'locked'}" data-building="${type}">
                    <div class="building-info">
                        <span>${getBuildingName(type)} (<span id="${type}-count">${building.count}</span>) Lv.<span id="${type}-level">${building.level}</span></span>
                        <div class="building-tooltip">
                            <p>${desc}</p>
                            ${reqs}
                        </div>
                    </div>
                    <button onclick="build('${type}')" ${isUnlocked ? '' : 'disabled'}>建造</button>
                    <button class="upgrade" onclick="upgradeBuilding('${type}')" ${isUnlocked ? '' : 'disabled'}>升級</button>
                </div>
            `;
        }).join('')}
    `;
}

// 檢查建築物是否解鎖
function isBuildingUnlocked(type) {
    for (let level = 1; level <= gameState.level; level++) {
        if (levelSystem[level].unlocks.buildings.includes(type)) {
            return true;
        }
    }
    return false;
}

// 獲取建築物描述
function getBuildingDescription(type) {
    const descriptions = {
        mall: '大型購物中心，提供大量收入',
        stadium: '體育場館，提升城市知名度',
        airport: '國際機場，帶來大量收入和威望',
        research_center: '研究中心，大幅提升研究效率'
    };
    return descriptions[type] || '';
}

// 隨機事件系統
const randomEvents = [
    {
        name: '政府補助',
        desc: '獲得政府補助金！金錢 +500',
        effect: () => { gameState.money += 500; }
    },
    {
        name: '人口成長',
        desc: '城市吸引新居民！人口 +20',
        effect: () => { gameState.population += 20; }
    },
    {
        name: '能源充沛',
        desc: '發現新能源！能源 +15',
        effect: () => { gameState.energy += 15; }
    },
    {
        name: '工業紅利',
        desc: '工業產值提升！工業 +30',
        effect: () => { gameState.industry += 30; }
    },
    {
        name: '小型災害',
        desc: '遭遇小型災害，金錢 -200',
        effect: () => { gameState.money = Math.max(0, gameState.money - 200); }
    },
    {
        name: '人口流失',
        desc: '部分居民搬離，人口 -10',
        effect: () => { gameState.population = Math.max(0, gameState.population - 10); }
    },
    {
        name: '能源短缺',
        desc: '能源消耗過大，能源 -10',
        effect: () => { gameState.energy = Math.max(0, gameState.energy - 10); }
    },
    {
        name: '工業事故',
        desc: '工廠發生事故，工業 -15',
        effect: () => { gameState.industry = Math.max(0, gameState.industry - 15); }
    },
    {
        name: '市民感謝',
        desc: '市民感謝你的努力，威望 +2',
        effect: () => { gameState.prestige += 2; }
    }
];

function triggerRandomEvent() {
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    event.effect();
    showEventPopup(event.desc);
    log(`【隨機事件】${event.desc}`);
    update();
}

function showEventPopup(msg) {
    const popup = document.getElementById('event-popup');
    if (!popup) return;
    popup.textContent = msg;
    popup.style.display = 'block';
    popup.style.animation = 'eventPop 0.5s';
    setTimeout(() => {
        popup.style.display = 'none';
    }, 2500);
}

// 每60秒觸發一次隨機事件
setInterval(triggerRandomEvent, 60000);