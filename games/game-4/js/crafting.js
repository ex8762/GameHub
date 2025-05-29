import { ALL_RECIPES, RESOURCE_TYPES } from './constants.js';

export class CraftingSystem {
    constructor(inventory) {
        this.inventory = inventory;
        this.recipes = ALL_RECIPES;
        this.selectedRecipe = null;
        this.setupUI();
    }
    setupUI() {
        this.craftingMenu = document.getElementById('crafting-menu');
        if (!this.craftingMenu) {
            console.error('找不到製作選單元素');
            this.createCraftingMenu();
        }

        this.craftingGrid = this.craftingMenu.querySelector('.crafting-grid');
        if (!this.craftingGrid) {
            console.error('找不到製作網格元素');
            this.createCraftingGrid();
        }
        // 添加製作按鈕
        const craftButton = document.createElement('button');
        craftButton.className = 'primary-button craft-button';
        craftButton.textContent = '製作';
        craftButton.addEventListener('click', () => this.craftSelectedItem());
        this.craftingMenu.appendChild(craftButton);

        // 綁定快捷鍵
        window.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                this.toggleCraftingMenu();
            }
        });

        this.updateRecipeList();
    }

    createCraftingMenu() {
        // 創建製作選單
        const menu = document.createElement('div');
        menu.id = 'crafting-menu';
        menu.className = 'hidden';
        // 添加標題
        const title = document.createElement('h2');
        title.textContent = '製作選單';
        menu.appendChild(title);
        document.body.appendChild(menu);
        this.craftingMenu = menu;
    }

    createCraftingGrid() {
        // 創建製作網格
        const grid = document.createElement('div');
        grid.className = 'crafting-grid';
        this.craftingMenu.insertBefore(grid, this.craftingMenu.firstChild);
        this.craftingGrid = grid;
    }

    toggleCraftingMenu() {
        this.craftingMenu.classList.toggle('hidden');
        if (!this.craftingMenu.classList.contains('hidden')) {
            this.updateRecipeList();
        }
    }

    updateRecipeList() {
        if (!this.craftingGrid) return;
        this.craftingGrid.innerHTML = '';
        Object.values(this.recipes).forEach(recipe => {
            const canCraft = this.canCraftItem(recipe);
            const recipeElement = this.createRecipeElement(recipe, canCraft);
            this.craftingGrid.appendChild(recipeElement);
        });
    }

    createRecipeElement(recipe, canCraft) {
        const element = document.createElement('div');
        element.className = `recipe-item ${canCraft ? 'available' : 'unavailable'}`;
        const materialsHTML = Object.entries(recipe.materials)
            .map(([itemId, count]) => {
                // 先在 RESOURCE_TYPES 找，找不到再在 ALL_RECIPES 找
                let material = Object.values(RESOURCE_TYPES).find(r => r.id === itemId);
                if (!material && this.recipes) {
                    material = Object.values(this.recipes).find(r => r.id === itemId);
                }
                const available = this.inventory.hasItem(itemId, count);
                return `
                    <div class="material ${available ? 'available' : 'missing'}">
                        <span class="material-icon">${material ? material.icon : '?'}</span>
                        <span class="material-count">${count}</span>
                    </div>
                `;
            })
            .join('');
        element.innerHTML = `
            <div class="recipe-header">
                <span class="recipe-icon">${recipe.icon}</span>
                <span class="recipe-name">${recipe.name}</span>
            </div>
            <div class="recipe-materials">
                ${materialsHTML}
            </div>
        `;
        element.addEventListener('click', () => {
            this.selectRecipe(recipe);
            this.updateRecipeList();
        });
        if (this.selectedRecipe === recipe) {
            element.classList.add('selected');
        }
        return element;
    }

    selectRecipe(recipe) {
        this.selectedRecipe = this.selectedRecipe === recipe ? null : recipe;
    }

    canCraftItem(recipe) {
        return Object.entries(recipe.materials).every(([itemId, count]) => 
            this.inventory.hasItem(itemId, count)
        );
    }

    craftSelectedItem() {
        if (!this.selectedRecipe) {
            this.showMessage('請選擇要製作的物品');
            return;
        }
        if (!this.canCraftItem(this.selectedRecipe)) {
            this.showMessage('材料不足');
            return;
        }
        // 消耗材料
        Object.entries(this.selectedRecipe.materials).forEach(([itemId, count]) => {
            let remainingCount = count;
            for (let i = 0; i < this.inventory.slots.length && remainingCount > 0; i++) {
                const slot = this.inventory.slots[i];
                if (slot && slot.id === itemId) {
                    const removeCount = Math.min(remainingCount, slot.count);
                    this.inventory.removeItem(i, removeCount);
                    remainingCount -= removeCount;
                }
            }
        });
        // 添加製作的物品
        const craftedItem = {
            ...this.selectedRecipe,
            count: 1
        };
        if (this.inventory.addItem(craftedItem)) {
            this.showMessage(`成功製作 ${craftedItem.name}`);
            this.playSound('craft');
        } else {
            this.showMessage('物品欄已滿');
        }
        this.updateRecipeList();
    }

    showMessage(message) {
        // 創建一個臨時訊息元素
        const messageElement = document.createElement('div');
        messageElement.className = 'craft-message';
        messageElement.textContent = message;
        document.body.appendChild(messageElement);
        // 添加動畫效果
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 500);
        }, 2000);
    }
    playSound(soundName) {
        if (window.soundManager) {
            window.soundManager.play(soundName);
        }
    }
}
