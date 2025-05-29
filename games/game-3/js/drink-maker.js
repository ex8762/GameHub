// 調配飲品的相關功能
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 初始化調配面板
        initMixPanel();
        // 更新原料顯示
        updateIngredientDisplay();
    } catch (error) {
        console.error('飲品製作初始化錯誤:', error);
    }
});

// 初始化調配面板
function initMixPanel() {
    // 綁定製作按鈕事件
    const makeButton = document.getElementById('permanent-make-button');
    if (makeButton) {
        makeButton.addEventListener('click', function() {
            processMixForm();
        });
    }

    // 為每個輸入框添加事件監聽器，以便在值改變時更新UI
    const ingredientInputs = document.querySelectorAll('.ingredient-input-container input');
    ingredientInputs.forEach(input => {
        input.addEventListener('change', function() {
            validateIngredientInput(this);
        });
        
        input.addEventListener('input', function() {
            validateIngredientInput(this);
        });
    });
}

// 驗證原料輸入的有效性
function validateIngredientInput(inputElement) {
    const value = parseInt(inputElement.value, 10) || 0;
    const max = parseInt(inputElement.max, 10) || 0;
    
    // 確保值不小於0
    if (value < 0) {
        inputElement.value = 0;
    }
    
    // 確保值不超過最大值（即庫存量）
    if (value > max) {
        inputElement.value = max;
        showNotification('原料數量不能超過庫存量');
    }
    
    // 更新當前使用的原料視覺提示
    updateInputVisualFeedback(inputElement);
}

// 更新輸入框的視覺反饋
function updateInputVisualFeedback(inputElement) {
    const value = parseInt(inputElement.value, 10) || 0;
    
    if (value > 0) {
        inputElement.classList.add('active-ingredient');
    } else {
        inputElement.classList.remove('active-ingredient');
    }
}

// 處理調配表單提交
function processMixForm() {
    // 收集所有輸入的原料
    const ingredientInputs = {
        coffee: parseInt(document.getElementById('permanent-coffee-input').value, 10) || 0,
        milk: parseInt(document.getElementById('permanent-milk-input').value, 10) || 0,
        sugar: parseInt(document.getElementById('permanent-sugar-input').value, 10) || 0,
        cocoa: parseInt(document.getElementById('permanent-cocoa-input').value, 10) || 0,
        ice: parseInt(document.getElementById('permanent-ice-input').value, 10) || 0,
        chocolate_syrup: parseInt(document.getElementById('permanent-chocolate-syrup-input').value, 10) || 0,
        matcha: parseInt(document.getElementById('permanent-matcha-input').value, 10) || 0,
        tea: parseInt(document.getElementById('permanent-tea-input').value, 10) || 0,
        fruit: parseInt(document.getElementById('permanent-fruit-input').value, 10) || 0
    };
    
    // 檢查是否有任何原料被添加
    const hasIngredients = Object.values(ingredientInputs).some(value => value > 0);
    
    if (!hasIngredients) {
        showNotification('請添加至少一種原料');
        return;
    }
    
    // 檢查庫存是否足夠
    for (const [ingredient, amount] of Object.entries(ingredientInputs)) {
        if (amount > 0 && ingredients[ingredient] < amount) {
            showNotification(`${getIngredientDisplayName(ingredient)}庫存不足`);
            return;
        }
    }
    
    // 嘗試識別飲品
    const matchedDrink = identifyDrink(ingredientInputs);
    
    if (matchedDrink) {
        // 成功製作飲品
        makeDrink(matchedDrink, ingredientInputs);
    } else {
        // 無法識別的配方
        showNotification('無法識別的配方，但你仍消耗了原料');
        // 扣除原料
        deductIngredients(ingredientInputs);
    }
    
    // 重置表單
    resetMixForm();
}

// 識別飲品配方
function identifyDrink(ingredientInputs) {
    // 檢查每個已知的飲品配方
    for (const [drinkName, recipe] of Object.entries(drinks)) {
        // 檢查原料是否符合配方
        let isMatch = true;
        
        // 檢查配方中所需的每一種原料
        for (const [ingredient, requiredAmount] of Object.entries(recipe.requiredIngredients)) {
            // 如果輸入的原料量不等於配方所需量，不是匹配
            if (ingredientInputs[ingredient] !== requiredAmount) {
                isMatch = false;
                break;
            }
        }
        
        // 檢查是否有多餘的原料（配方中沒有要求的原料）
        for (const [ingredient, amount] of Object.entries(ingredientInputs)) {
            if (amount > 0 && (!recipe.requiredIngredients[ingredient] || recipe.requiredIngredients[ingredient] === 0)) {
                isMatch = false;
                break;
            }
        }
        
        if (isMatch) {
            return drinkName;
        }
    }
    
    // 沒有匹配的飲品配方
    return null;
}

// 製作飲品
function makeDrink(drinkName, usedIngredients) {
    const recipe = drinks[drinkName];
    
    // 扣除原料
    deductIngredients(usedIngredients);
    
    // 增加金錢
    money += recipe.sellPrice;
    updateMoney();
    
    // 增加經驗
    addExperience(recipe.experience);
    
    // 更新飲品銷售統計
    drinksSold++;
    
    // 顯示通知
    showNotification(`成功製作了一杯${drinkName}！獲得${recipe.sellPrice}元和${recipe.experience}點經驗`);
    
    // 播放飲品製作動畫
    playDrinkAnimation(drinkName);
    
    // 檢查是否完成了相關任務
    checkMissionProgress('drink', drinkName);
}

// 扣除原料
function deductIngredients(usedIngredients) {
    // 遍歷使用的每種原料並扣除
    for (const [ingredient, amount] of Object.entries(usedIngredients)) {
        if (amount > 0) {
            ingredients[ingredient] -= amount;
        }
    }
    
    // 更新原料顯示
    updateIngredientDisplay();
}

// 重置調配表單
function resetMixForm() {
    const form = document.getElementById('permanent-mix-form');
    if (form) {
        const inputs = form.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.value = 0;
            input.classList.remove('active-ingredient');
        });
    }
}

// 更新原料顯示
function updateIngredientDisplay() {
    try {
        // 更新各原料的數量顯示
        updateElementText('coffee-count', ingredients.coffee);
        updateElementText('milk-count', ingredients.milk);
        updateElementText('sugar-count', ingredients.sugar);
        updateElementText('cocoa-count', ingredients.cocoa);
        updateElementText('ice-count', ingredients.ice);
        updateElementText('chocolate-syrup-count', ingredients.chocolate_syrup);
        updateElementText('matcha-count', ingredients.matcha);
        updateElementText('tea-count', ingredients.tea);
        updateElementText('fruit-count', ingredients.fruit);
        
        // 更新各輸入框的最大值
        updateElementMax('permanent-coffee-input', ingredients.coffee);
        updateElementMax('permanent-milk-input', ingredients.milk);
        updateElementMax('permanent-sugar-input', ingredients.sugar);
        updateElementMax('permanent-cocoa-input', ingredients.cocoa);
        updateElementMax('permanent-ice-input', ingredients.ice);
        updateElementMax('permanent-chocolate-syrup-input', ingredients.chocolate_syrup);
        updateElementMax('permanent-matcha-input', ingredients.matcha);
        updateElementMax('permanent-tea-input', ingredients.tea);
        updateElementMax('permanent-fruit-input', ingredients.fruit);
    } catch (error) {
        console.error('更新原料顯示錯誤:', error);
    }
}

// 安全更新元素文字內容的輔助函數
function updateElementText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// 安全更新輸入元素最大值的輔助函數
function updateElementMax(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.max = value;
    }
}

// 獲取原料顯示名稱
function getIngredientDisplayName(ingredient) {
    const displayNames = {
        coffee: '咖啡',
        milk: '牛奶',
        sugar: '糖',
        cocoa: '可可粉',
        ice: '冰塊',
        chocolate_syrup: '巧克力醬',
        matcha: '抹茶粉',
        tea: '茶葉',
        fruit: '水果'
    };
    
    return displayNames[ingredient] || ingredient;
}

// 播放飲品製作動畫
function playDrinkAnimation(drinkName) {
    // 創建一個飲品元素
    const drinkElement = document.createElement('div');
    drinkElement.className = 'drink-animation';
    drinkElement.innerHTML = `
        <i class="fas fa-mug-hot"></i>
        <span>${drinkName}</span>
    `;
    
    // 添加到頁面
    document.body.appendChild(drinkElement);
    
    // 設置動畫結束後移除元素
    setTimeout(() => {
        drinkElement.remove();
    }, 3000);
}

// 購買原料
function buyIngredient(type, amount) {
    let cost;
    
    switch (type) {
        case 'coffee':
            cost = 5 * amount;
            break;
        case 'milk':
            cost = 3 * amount;
            break;
        case 'sugar':
            cost = 1 * amount;
            break;
        case 'cocoa':
            cost = 7 * amount;
            break;
        case 'matcha':
            cost = 15 * amount;
            break;
        case 'tea':
            cost = 5 * amount;
            break;
        case 'fruit':
            cost = 8 * amount;
            break;
        default:
            cost = 5 * amount;
    }
    
    if (money >= cost) {
        money -= cost;
        ingredients[type] += amount;
        updateMoney();
        updateIngredientDisplay();
        showNotification(`購買了${amount}單位的${getIngredientDisplayName(type)}，花費${cost}元`);
    } else {
        showNotification('資金不足，無法購買');
    }
}
