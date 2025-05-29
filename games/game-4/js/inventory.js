import { ITEM_TYPES, GAME_CONFIG } from './constants.js';

export class Inventory {
    constructor() {
        this.slots = Array(GAME_CONFIG.MAX_INVENTORY_SLOTS).fill(null);
        this.selectedSlot = 0;
        
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // 數字鍵切換選擇的物品欄位
        window.addEventListener('keydown', (e) => {
            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 1 && num <= 9) {
                this.selectedSlot = num - 1;
                this.render();
            }
        });

        // 滑鼠滾輪切換物品欄位
        window.addEventListener('wheel', (e) => {
            if (e.deltaY < 0) {
                this.selectedSlot = (this.selectedSlot - 1 + this.slots.length) % this.slots.length;
            } else {
                this.selectedSlot = (this.selectedSlot + 1) % this.slots.length;
            }
            this.render();
        });

        // 點擊選擇物品欄位
        const inventoryElement = document.querySelector('.inventory-grid');
        if (inventoryElement) {
            inventoryElement.addEventListener('click', (e) => {
                const slot = e.target.closest('.inventory-slot');
                if (slot) {
                    const index = Array.from(slot.parentNode.children).indexOf(slot);
                    this.selectedSlot = index;
                    this.render();
                }
            });
        }
    }    addItem(item) {
        let remainingCount = item.count || 1;
        
        // 如果物品可堆疊，先嘗試合併到現有堆疊
        if (item.stackable) {
            for (let i = 0; i < this.slots.length && remainingCount > 0; i++) {
                const slot = this.slots[i];
                if (slot && slot.canStackWith(item)) {
                    const addedAmount = slot.addToStack(remainingCount);
                    remainingCount -= addedAmount;
                }
            }
        }
        
        // 如果還有剩餘物品，放入新的空格
        while (remainingCount > 0) {
            const emptySlot = this.slots.findIndex(slot => slot === null);
            if (emptySlot === -1) {
                // 物品欄已滿，返回剩餘數量
                return remainingCount;
            }
            
            const newStack = new Item({
                ...item,
                count: Math.min(remainingCount, item.maxStack)
            });
            
            this.slots[emptySlot] = newStack;
            remainingCount -= newStack.count;
        }
        
        this.render();
        return 0; // 完全添加成功
    }

    removeItem(slotIndex, count = 1) {
        if (this.slots[slotIndex]) {
            if (this.slots[slotIndex].count > count) {
                this.slots[slotIndex].count -= count;
            } else {
                this.slots[slotIndex] = null;
            }
            this.render();
            return true;
        }
        return false;
    }

    getSelectedItem() {
        return this.slots[this.selectedSlot];
    }

    hasItem(itemId, count = 1) {
        const totalCount = this.slots.reduce((total, slot) => {
            if (slot && slot.id === itemId) {
                return total + slot.count;
            }
            return total;
        }, 0);
        return totalCount >= count;
    }

    render() {
        const inventoryGrid = document.querySelector('.inventory-grid');
        if (!inventoryGrid) return;

        inventoryGrid.innerHTML = '';

        this.slots.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = `inventory-slot${index === this.selectedSlot ? ' selected' : ''}`;

            if (item) {
                slot.innerHTML = `
                    <div class="item-icon">${item.icon}</div>
                    ${item.count > 1 ? `<div class="item-count">${item.count}</div>` : ''}
                `;
                
                // 添加工具提示
                slot.title = `${item.name}\n${item.description || ''}`;
            }

            inventoryGrid.appendChild(slot);
        });
    }

    // 存檔系統支援
    save() {
        return {
            slots: this.slots,
            selectedSlot: this.selectedSlot
        };
    }

    load(data) {
        if (data) {
            this.slots = data.slots;
            this.selectedSlot = data.selectedSlot;
            this.render();
        }
    }
}

// 物品類
export class Item {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type;
        this.icon = config.icon;
        this.description = config.description;
        this.count = config.count || 1;
        this.stackable = this.determineStackability(config);
        this.maxStack = this.determineMaxStack(config);
        this.durability = config.durability;
        this.currentDurability = config.durability;
        
        // 特殊屬性
        if (config.type === ITEM_TYPES.FOOD) {
            this.nutritionalValue = config.nutritionalValue;
            this.hydrationValue = config.hydrationValue;
        } else if (config.type === ITEM_TYPES.TOOL || config.type === ITEM_TYPES.WEAPON) {
            this.damage = config.damage;
            this.efficiency = config.efficiency;
        }
    }

    use() {
        if (this.durability) {
            this.currentDurability--;
            return this.currentDurability > 0;
        }
        return true;
    }

    repair(amount) {
        if (this.durability) {
            this.currentDurability = Math.min(this.durability, this.currentDurability + amount);
        }
    }

    getDurabilityPercentage() {
        if (!this.durability) return 100;
        return (this.currentDurability / this.durability) * 100;
    }

    determineStackability(config) {
        // 某些類型的物品預設不可堆疊
        if (config.stackable !== undefined) {
            return config.stackable;
        }
        
        switch (config.type) {
            case ITEM_TYPES.TOOL:
            case ITEM_TYPES.WEAPON:
            case ITEM_TYPES.CLOTHING:
                return false;
            default:
                return true;
        }
    }    determineMaxStack(config) {
        // 如果配置中明確指定了最大堆疊數量，則使用該值
        if (config.maxStack !== undefined) {
            return config.maxStack;
        }
        
        // 根據物品類型決定預設的最大堆疊數量
        switch (config.type) {
            case ITEM_TYPES.TOOL:
            case ITEM_TYPES.WEAPON:
            case ITEM_TYPES.CLOTHING:
                return 1;  // 工具、武器和衣物不可堆疊
            case ITEM_TYPES.FOOD:
                return 20; // 食物最多堆疊20個
            case ITEM_TYPES.RESOURCE:
                return 50; // 資源類物品最多堆疊50個
            case ITEM_TYPES.CRAFTABLE:
                return 30; // 可製作物品最多堆疊30個
            default:
                return 99; // 其他物品預設最多堆疊99個
        }
    }

    canStackWith(item) {
        // 檢查物品是否可以堆疊
        return this.stackable && 
               item.stackable && 
               this.id === item.id &&
               this.count < this.maxStack;
    }

    addToStack(amount) {
        // 計算實際可以添加的數量
        const spaceLeft = this.maxStack - this.count;
        const addAmount = Math.min(amount, spaceLeft);
        
        // 增加堆疊數量
        this.count += addAmount;
        
        // 返回實際添加的數量
        return addAmount;
    }
}
