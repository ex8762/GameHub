// 建築物分類與資料結構

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
const buildings = {
    ...populationBuildings,
    ...energyBuildings,
    ...industryBuildings,
    ...incomeBuildings
};

export { populationBuildings, energyBuildings, industryBuildings, incomeBuildings, buildings };