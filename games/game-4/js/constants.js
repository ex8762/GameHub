// 遊戲基本配置
const GAME_CONFIG = {
    TICK_RATE: 60,  // 遊戲更新頻率
    SAVE_INTERVAL: 60000,  // 自動存檔間隔（毫秒）
    INITIAL_HEALTH: 100,
    INITIAL_HUNGER: 100,
    INITIAL_THIRST: 100,
    MAX_INVENTORY_SLOTS: 24,
    DAY_LENGTH: 1200000,  // 遊戲中一天的長度（毫秒）
    TEMPERATURE_RANGE: {
        MIN: -10,
        MAX: 40
    }
};

// 物品類型
const ITEM_TYPES = {
    RESOURCE: 'resource',
    TOOL: 'tool',
    WEAPON: 'weapon',
    FOOD: 'food',
    MEDICAL: 'medical',
    CLOTHING: 'clothing',
    ARMOR: 'armor',
    EQUIPMENT: 'equipment',
    CONTAINER: 'container',
    MATERIAL: 'material',
    CRAFTING: 'crafting',
    QUEST: 'quest'
};

// 資源類型
const RESOURCE_TYPES = {
    // 基礎資源
    WOOD: {
        id: 'wood',
        name: '木材',
        icon: '🪵',
        weight: 2,
        description: '基礎建材，可用於製作工具和建築'
    },
    STONE: {
        id: 'stone',
        name: '石頭',
        icon: '🪨',
        weight: 3,
        description: '堅硬的建材，可用於製作更好的工具'
    },
    FIBER: {
        id: 'fiber',
        name: '纖維',
        icon: '🌿',
        weight: 1,
        description: '柔軟的植物纖維，可用於製作繩索和布料'
    },
    
    // 食物和水
    WATER: {
        id: 'water',
        name: '水',
        icon: '💧',
        weight: 1,
        hydrationValue: 20,
        description: '清涼的水，可以解渴'
    },
    BERRIES: {
        id: 'berries',
        name: '漿果',
        icon: '🫐',
        weight: 1,
        nutritionalValue: 10,
        hydrationValue: 5,
        description: '可食用的野生漿果'
    },
    MUSHROOM: {
        id: 'mushroom',
        name: '蘑菇',
        icon: '🍄',
        weight: 1,
        nutritionalValue: 15,
        description: '野生蘑菇，食用前需要煮熟'
    },
    MEAT_RAW: {
        id: 'meat_raw',
        name: '生肉',
        icon: '🥩',
        weight: 2,
        nutritionalValue: 0,
        description: '生的肉，需要烤熟才能安全食用'
    },
    MEAT_COOKED: {
        id: 'meat_cooked',
        name: '熟肉',
        icon: '🍖',
        weight: 2,
        nutritionalValue: 30,
        description: '烤熟的肉，美味又營養'
    },
    SALT: {
        id: 'salt',
        name: '鹽',
        icon: '🧂',
        weight: 1,
        description: '可用於保存食物或製作特殊物品'
    },
    FISH: {
        id: 'fish',
        name: '魚',
        icon: '🐟',
        weight: 2,
        nutritionalValue: 20,
        hydrationValue: 2,
        description: '新鮮的魚，可食用或烹飪'
    },
    
    // 礦物
    IRON_ORE: {
        id: 'iron_ore',
        name: '鐵礦石',
        icon: '⛰️',
        weight: 4,
        description: '未經處理的鐵礦石'
    },
    COAL: {
        id: 'coal',
        name: '煤炭',
        icon: '🪨',
        weight: 2,
        description: '可用於冶煉和保持溫暖'
    },
    GOLD_ORE: {
        id: 'gold_ore',
        name: '金礦石',
        icon: '💎',
        weight: 4,
        description: '珍貴的金礦石'
    },
    
    // 加工材料
    IRON_INGOT: {
        id: 'iron_ingot',
        name: '鐵錠',
        icon: '🔧',
        weight: 3,
        description: '精煉過的鐵，可用於製作高級工具'
    },
    GOLD_INGOT: {
        id: 'gold_ingot',
        name: '金錠',
        icon: '🏆',
        weight: 3,
        description: '精煉過的金'
    },
    ROPE: {
        id: 'rope',
        name: '繩索',
        icon: '➰',
        weight: 1,
        description: '用纖維製成的繩索'
    },
    CLOTH: {
        id: 'cloth',
        name: '布料',
        icon: '🧵',
        weight: 1,
        description: '織成的布料，可用於製作衣物'
    },
    AMULET: {
        id: 'amulet',
        name: '護身符',
        icon: '📿',
        weight: 1,
        description: '神秘的護身符，據說能帶來好運'
    }
};

// 天氣類型
const WEATHER_TYPES = {
    CLEAR: {
        id: 'clear',
        name: '晴朗',
        icon: '☀️',
        temperatureModifier: 0
    },
    CLOUDY: {
        id: 'cloudy',
        name: '多雲',
        icon: '☁️',
        temperatureModifier: -2
    },
    RAIN: {
        id: 'rain',
        name: '下雨',
        icon: '🌧️',
        temperatureModifier: -5
    },
    STORM: {
        id: 'storm',
        name: '暴風雨',
        icon: '⛈️',
        temperatureModifier: -8
    }
};

// 狀態效果
const STATUS_EFFECTS = {
    HUNGER: {
        id: 'hunger',
        name: '飢餓',
        icon: '😫',
        healthEffect: -1
    },
    THIRST: {
        id: 'thirst',
        name: '口渴',
        icon: '🥵',
        healthEffect: -2
    },
    COLD: {
        id: 'cold',
        name: '寒冷',
        icon: '🥶',
        healthEffect: -1
    },
    HEAT: {
        id: 'heat',
        name: '炎熱',
        icon: '🔥',
        healthEffect: -1
    }
};

// 製作配方
const CRAFTING_RECIPES = {
    // 工具
    STONE_AXE: {
        id: 'stone_axe',
        name: '石斧',
        type: ITEM_TYPES.TOOL,
        icon: '🪓',
        materials: {
            [RESOURCE_TYPES.WOOD.id]: 2,
            [RESOURCE_TYPES.STONE.id]: 3
        },
        durability: 100,
        efficiency: 1.5,
        description: '基礎的伐木工具'
    },
    IRON_AXE: {
        id: 'iron_axe',
        name: '鐵斧',
        type: ITEM_TYPES.TOOL,
        icon: '⚒️',
        materials: {
            [RESOURCE_TYPES.WOOD.id]: 2,
            [RESOURCE_TYPES.IRON_INGOT.id]: 3
        },
        durability: 200,
        efficiency: 2.5,
        description: '更耐用的伐木工具'
    },
    PICKAXE: {
        id: 'pickaxe',
        name: '鎬子',
        type: ITEM_TYPES.TOOL,
        icon: '⛏️',
        materials: {
            [RESOURCE_TYPES.WOOD.id]: 2,
            [RESOURCE_TYPES.STONE.id]: 3
        },
        durability: 100,
        efficiency: 1.5,
        description: '用於開採礦物'
    },
    
    // 武器
    STONE_SPEAR: {
        id: 'stone_spear',
        name: '石矛',
        type: ITEM_TYPES.WEAPON,
        icon: '🗡️',
        materials: {
            [RESOURCE_TYPES.WOOD.id]: 3,
            [RESOURCE_TYPES.STONE.id]: 2
        },
        damage: 15,
        durability: 80,
        description: '基礎的狩獵工具'
    },
    IRON_SWORD: {
        id: 'iron_sword',
        name: '鐵劍',
        type: ITEM_TYPES.WEAPON,
        icon: '⚔️',
        materials: {
            [RESOURCE_TYPES.IRON_INGOT.id]: 3,
            [RESOURCE_TYPES.WOOD.id]: 1
        },
        damage: 25,
        durability: 150,
        description: '強力的近戰武器'
    },
    BOW: {
        id: 'bow',
        name: '弓',
        type: ITEM_TYPES.WEAPON,
        icon: '🏹',
        materials: {
            [RESOURCE_TYPES.WOOD.id]: 3,
            [RESOURCE_TYPES.ROPE.id]: 2
        },
        damage: 10,
        durability: 100,
        description: '遠程武器'
    },
    
    // 醫療用品
    BANDAGE: {
        id: 'bandage',
        name: '繃帶',
        type: ITEM_TYPES.MEDICAL,
        icon: '🩹',
        materials: {
            [RESOURCE_TYPES.CLOTH.id]: 2
        },
        healAmount: 20,
        description: '治療輕傷'
    },
    MEDICINE: {
        id: 'medicine',
        name: '藥物',
        type: ITEM_TYPES.MEDICAL,
        icon: '💊',
        materials: {
            [RESOURCE_TYPES.BERRIES.id]: 3,
            [RESOURCE_TYPES.MUSHROOM.id]: 2
        },
        healAmount: 40,
        description: '治療嚴重傷勢'
    },
    
    // 服裝
    CLOTH_ARMOR: {
        id: 'cloth_armor',
        name: '布甲',
        type: ITEM_TYPES.CLOTHING,
        icon: '👕',
        materials: {
            [RESOURCE_TYPES.CLOTH.id]: 5
        },
        armor: 5,
        warmth: 10,
        durability: 50,
        description: '基礎防護服裝'
    },
    IRON_ARMOR: {
        id: 'iron_armor',
        name: '鐵甲',
        type: ITEM_TYPES.CLOTHING,
        icon: '🛡️',
        materials: {
            [RESOURCE_TYPES.IRON_INGOT.id]: 5,
            [RESOURCE_TYPES.CLOTH.id]: 2
        },
        armor: 15,
        warmth: 5,
        durability: 150,
        description: '提供優秀的防護'
    },
    
    // 基礎材料加工
    ROPE: {
        id: 'rope',
        name: '繩索',
        type: ITEM_TYPES.RESOURCE,
        icon: '➰',
        materials: {
            [RESOURCE_TYPES.FIBER.id]: 3
        },
        description: '用於製作進階工具'
    },
    CLOTH: {
        id: 'cloth',
        name: '布料',
        type: ITEM_TYPES.RESOURCE,
        icon: '🧵',
        materials: {
            [RESOURCE_TYPES.FIBER.id]: 4
        },
        description: '用於製作衣物和醫療用品'
    },
    
    // 冶煉
    IRON_INGOT: {
        id: 'iron_ingot',
        name: '鐵錠',
        type: ITEM_TYPES.RESOURCE,
        icon: '🔧',
        materials: {
            [RESOURCE_TYPES.IRON_ORE.id]: 1,
            [RESOURCE_TYPES.COAL.id]: 1
        },
        description: '精煉的鐵，用於製作高級裝備'
    },
    GOLD_INGOT: {
        id: 'gold_ingot',
        name: '金錠',
        type: ITEM_TYPES.RESOURCE,
        icon: '🏆',
        materials: {
            [RESOURCE_TYPES.GOLD_ORE.id]: 1,
            [RESOURCE_TYPES.COAL.id]: 1
        },
        description: '精煉的金'
    },
    SALT: {
        id: 'salt',
        name: '鹽',
        type: ITEM_TYPES.RESOURCE,
        icon: '🧂',
        materials: {
            [RESOURCE_TYPES.WATER.id]: 1
        },
        description: '將水煮沸可獲得鹽'
    },
    FISH: {
        id: 'fish',
        name: '魚',
        type: ITEM_TYPES.FOOD,
        icon: '🐟',
        materials: {
            [RESOURCE_TYPES.WATER.id]: 1,
            // 假設有釣竿
            // 'fishing_rod': 1
        },
        nutritionalValue: 20,
        hydrationValue: 2,
        description: '釣魚可獲得新鮮的魚'
    },
    AMULET: {
        id: 'amulet',
        name: '護身符',
        type: ITEM_TYPES.EQUIPMENT,
        icon: '📿',
        materials: {
            [RESOURCE_TYPES.GOLD_INGOT.id]: 2,
            [RESOURCE_TYPES.ROPE.id]: 1,
            [RESOURCE_TYPES.SALT.id]: 1
        },
        description: '帶來好運的護身符'
    }
};

// 進階製作配方
const ADVANCED_RECIPES = {
    // 進階工具
    IRON_PICKAXE: {
        id: 'iron_pickaxe',
        name: '鐵鎬',
        type: ITEM_TYPES.TOOL,
        icon: '⛏️',
        materials: {
            [RESOURCE_TYPES.IRON_INGOT.id]: 3,
            [RESOURCE_TYPES.WOOD.id]: 2,
            [RESOURCE_TYPES.ROPE.id]: 1
        },
        durability: 200,
        efficiency: 3,
        stackable: false,
        description: '高效的採礦工具'
    },
    
    // 進階武器
    GOLDEN_SWORD: {
        id: 'golden_sword',
        name: '黃金劍',
        type: ITEM_TYPES.WEAPON,
        icon: '⚔️',
        materials: {
            [RESOURCE_TYPES.GOLD_INGOT.id]: 4,
            [RESOURCE_TYPES.IRON_INGOT.id]: 1,
            [RESOURCE_TYPES.ROPE.id]: 1
        },
        damage: 35,
        durability: 100,
        stackable: false,
        description: '華麗但脆弱的武器'
    },
    
    // 進階防具
    STEEL_ARMOR: {
        id: 'steel_armor',
        name: '鋼鐵盔甲',
        type: ITEM_TYPES.ARMOR,
        icon: '🛡️',
        materials: {
            [RESOURCE_TYPES.IRON_INGOT.id]: 8,
            [RESOURCE_TYPES.CLOTH.id]: 4,
            [RESOURCE_TYPES.ROPE.id]: 2
        },
        armor: 25,
        durability: 300,
        stackable: false,
        description: '提供極佳的防護'
    },
    
    // 容器
    BACKPACK: {
        id: 'backpack',
        name: '背包',
        type: ITEM_TYPES.CONTAINER,
        icon: '🎒',
        materials: {
            [RESOURCE_TYPES.CLOTH.id]: 6,
            [RESOURCE_TYPES.ROPE.id]: 4
        },
        slots: 12,
        stackable: false,
        description: '增加物品欄空間'
    },
    
    // 特殊裝備
    COMPASS: {
        id: 'compass',
        name: '羅盤',
        type: ITEM_TYPES.EQUIPMENT,
        icon: '🧭',
        materials: {
            [RESOURCE_TYPES.IRON_INGOT.id]: 2,
            [RESOURCE_TYPES.GOLD_INGOT.id]: 1
        },
        stackable: false,
        description: '協助導航'
    },
    
    // 高級食物
    STEW: {
        id: 'stew',
        name: '燉菜',
        type: ITEM_TYPES.FOOD,
        icon: '🥘',
        materials: {
            [RESOURCE_TYPES.MEAT_COOKED.id]: 2,
            [RESOURCE_TYPES.MUSHROOM.id]: 2,
            [RESOURCE_TYPES.BERRIES.id]: 1
        },
        nutritionalValue: 50,
        hydrationValue: 20,
        stackable: true,
        maxStack: 8,
        description: '美味且營養的料理'
    },
    
    // 高級醫療
    MEDKIT: {
        id: 'medkit',
        name: '醫療包',
        type: ITEM_TYPES.MEDICAL,
        icon: '🩺',
        materials: {
            [RESOURCE_TYPES.CLOTH.id]: 4,
            'bandage': 3,
            'medicine': 2
        },
        healAmount: 80,
        stackable: true,
        maxStack: 4,
        description: '完整的醫療套組'
    }
};

// 成就系統
const ACHIEVEMENTS = {
    FIRST_CRAFT: {
        id: 'first_craft',
        name: '初次製作',
        description: '製作你的第一個物品',
        icon: '🛠️'
    },
    SURVIVOR: {
        id: 'survivor',
        name: '生存者',
        description: '存活一整天',
        icon: '🌅'
    },
    GATHERER: {
        id: 'gatherer',
        name: '採集者',
        description: '收集100個資源',
        icon: '🧺'
    }
};

// 合併基礎和進階配方
const ALL_RECIPES = {
    ...CRAFTING_RECIPES,
    ...ADVANCED_RECIPES
};

// 日夜循環相關常數
const DAY_NIGHT_CYCLE = {
    DAY_LENGTH: 300000, // 一天的長度(毫秒)
    DAWN_START: 0.2, // 黎明開始時間比例
    DAWN_END: 0.3, // 黎明結束時間比例
    DUSK_START: 0.7, // 黃昏開始時間比例
    DUSK_END: 0.8, // 黃昏結束時間比例
    NIGHT_VISION_RANGE: 0.5, // 夜晚視野範圍縮減係數
    RESOURCE_NIGHT_RATE: 0.5, // 夜晚資源生成率
};

// 導出所有常數
export {
    GAME_CONFIG,
    ITEM_TYPES,
    RESOURCE_TYPES,
    WEATHER_TYPES,
    STATUS_EFFECTS,
    CRAFTING_RECIPES,
    ADVANCED_RECIPES,
    ALL_RECIPES,
    ACHIEVEMENTS,
    DAY_NIGHT_CYCLE
};
