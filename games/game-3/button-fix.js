// 按鈕事件監聽器修復
window.addEventListener('DOMContentLoaded', function() {
    // 商店按鈕
    document.getElementById('shop-button').addEventListener('click', function() {
        toggleShopPanel();
    });

    // 員工按鈕
    document.getElementById('staff-button').addEventListener('click', function() {
        toggleStaffPanel();
    });

    // 裝飾按鈕
    document.getElementById('decor-button').addEventListener('click', function() {
        toggleDecorPanel();
    });

    // 任務按鈕
    document.getElementById('missions-button').addEventListener('click', function() {
        toggleMissionsPanel();
    });

    // 待處理訂單按鈕
    document.getElementById('pending-orders-button').addEventListener('click', function() {
        togglePendingOrdersPanel();
    });

    // 購買咖啡按鈕
    document.getElementById('buy-coffee').addEventListener('click', function() {
        if (money >= 5) {
            money -= 5;
            ingredients.coffee += 1;
            updateMoney();
            updateIngredients();
            document.getElementById('coffee-count').textContent = ingredients.coffee;
            showNotification('購買了1份咖啡');
        } else {
            showNotification('金錢不足');
        }
    });

    // 購買牛奶按鈕
    document.getElementById('buy-milk').addEventListener('click', function() {
        if (money >= 3) {
            money -= 3;
            ingredients.milk += 1;
            updateMoney();
            updateIngredients();
            document.getElementById('milk-count').textContent = ingredients.milk;
            showNotification('購買了1份牛奶');
        } else {
            showNotification('金錢不足');
        }
    });

    // 購買糖按鈕
    document.getElementById('buy-sugar').addEventListener('click', function() {
        if (money >= 2) {
            money -= 2;
            ingredients.sugar += 1;
            updateMoney();
            updateIngredients();
            document.getElementById('sugar-count').textContent = ingredients.sugar;
            showNotification('購買了1份糖');
        } else {
            showNotification('金錢不足');
        }
    });

    // 購買可可按鈕
    document.getElementById('buy-cocoa').addEventListener('click', function() {
        if (money >= 3) {
            money -= 3;
            ingredients.cocoa += 1;
            updateMoney();
            updateIngredients();
            document.getElementById('cocoa-count').textContent = ingredients.cocoa;
            showNotification('購買了1份可可');
        } else {
            showNotification('金錢不足');
        }
    });

    // 購買冰塊按鈕
    document.getElementById('buy-ice').addEventListener('click', function() {
        if (money >= 2) {
            money -= 2;
            ingredients.ice += 1;
            updateMoney();
            updateIngredients();
            document.getElementById('ice-count').textContent = ingredients.ice;
            showNotification('購買了1份冰塊');
        } else {
            showNotification('金錢不足');
        }
    });

    // 購買巧克力醬按鈕
    document.getElementById('buy-chocolate-syrup').addEventListener('click', function() {
        if (money >= 3) {
            money -= 3;
            ingredients.chocolate_syrup += 1;
            updateMoney();
            updateIngredients();
            document.getElementById('chocolate-syrup-count').textContent = ingredients.chocolate_syrup;
            showNotification('購買了1份巧克力醬');
        } else {
            showNotification('金錢不足');
        }
    });

    // 招聘員工按鈕
    document.getElementById('hire-staff').addEventListener('click', function() {
        if (money >= 100) {
            money -= 100;
            const staffNames = ['小明', '小華', '小芳', '小強', '小美'];
            const staffRoles = ['咖啡師', '服務員', '收銀員'];
            const newStaff = {
                name: staffNames[Math.floor(Math.random() * staffNames.length)],
                role: staffRoles[Math.floor(Math.random() * staffRoles.length)]
            };
            staff.push(newStaff);
            updateMoney();
            renderStaffList();
            showNotification(`招聘了新員工：${newStaff.name}（${newStaff.role}）`);
            checkMissionCompletion();
        } else {
            showNotification('金錢不足，無法招聘員工');
        }
    });

    // 購買裝飾按鈕
    document.getElementById('buy-table-decor').addEventListener('click', function() {
        if (money >= 50) {
            money -= 50;
            const emptySpotIndex = decorations.length;
            if (emptySpotIndex < 3) {
                decorations.push({ type: 'table', img: 'table.png' });
                updateMoney();
                renderDecorations();
                showNotification('購買了一張桌子');
                checkMissionCompletion();
            } else {
                showNotification('裝飾位置已滿');
                money += 50; // 退回金錢
                updateMoney();
            }
        } else {
            showNotification('金錢不足');
        }
    });

    document.getElementById('buy-plant-decor').addEventListener('click', function() {
        if (money >= 30) {
            money -= 30;
            const emptySpotIndex = decorations.length;
            if (emptySpotIndex < 3) {
                decorations.push({ type: 'plant', img: 'plant.png' });
                updateMoney();
                renderDecorations();
                showNotification('購買了一盆植物');
                checkMissionCompletion();
            } else {
                showNotification('裝飾位置已滿');
                money += 30; // 退回金錢
                updateMoney();
            }
        } else {
            showNotification('金錢不足');
        }
    });

    document.getElementById('buy-art-decor').addEventListener('click', function() {
        if (money >= 80) {
            money -= 80;
            const emptySpotIndex = decorations.length;
            if (emptySpotIndex < 3) {
                decorations.push({ type: 'art', img: 'art.png' });
                updateMoney();
                renderDecorations();
                showNotification('購買了一幅藝術畫');
                checkMissionCompletion();
            } else {
                showNotification('裝飾位置已滿');
                money += 80; // 退回金錢
                updateMoney();
            }
        } else {
            showNotification('金錢不足');
        }
    });

    // 製作飲品按鈕
    document.getElementById('permanent-make-button').addEventListener('click', function() {
        const coffeeInput = parseInt(document.getElementById('permanent-coffee-input').value) || 0;
        const milkInput = parseInt(document.getElementById('permanent-milk-input').value) || 0;
        const sugarInput = parseInt(document.getElementById('permanent-sugar-input').value) || 0;
        const cocoaInput = parseInt(document.getElementById('permanent-cocoa-input').value) || 0;
        const iceInput = parseInt(document.getElementById('permanent-ice-input').value) || 0;
        const chocolateSyrupInput = parseInt(document.getElementById('permanent-chocolate-syrup-input').value) || 0;

        // 檢查原料是否足夠
        if (coffeeInput > ingredients.coffee || milkInput > ingredients.milk || 
            sugarInput > ingredients.sugar || cocoaInput > ingredients.cocoa || 
            iceInput > ingredients.ice || chocolateSyrupInput > ingredients.chocolate_syrup) {
            showNotification('原料不足，無法製作');
            return;
        }

        // 檢查是否符合某個飲品配方
        let matchedDrink = null;
        for (const [drinkName, drinkInfo] of Object.entries(drinks)) {
            const recipe = drinkInfo.requiredIngredients;
            if (recipe.coffee === coffeeInput && recipe.milk === (milkInput || 0) && 
                recipe.sugar === (sugarInput || 0) && (recipe.cocoa || 0) === (cocoaInput || 0) && 
                (recipe.ice || 0) === (iceInput || 0) && (recipe.chocolate_syrup || 0) === (chocolateSyrupInput || 0)) {
                matchedDrink = drinkName;
                break;
            }
        }

        if (matchedDrink) {
            // 扣除原料
            ingredients.coffee -= coffeeInput;
            ingredients.milk -= milkInput;
            ingredients.sugar -= sugarInput;
            ingredients.cocoa -= cocoaInput;
            ingredients.ice -= iceInput;
            ingredients.chocolate_syrup -= chocolateSyrupInput;

            // 更新顯示
            document.getElementById('coffee-count').textContent = ingredients.coffee;
            document.getElementById('milk-count').textContent = ingredients.milk;
            document.getElementById('sugar-count').textContent = ingredients.sugar;
            document.getElementById('cocoa-count').textContent = ingredients.cocoa;
            document.getElementById('ice-count').textContent = ingredients.ice;
            document.getElementById('chocolate-syrup-count').textContent = ingredients.chocolate_syrup;

            // 增加金錢
            money += drinks[matchedDrink].sellPrice;
            updateMoney();
            drinksSold++;

            // 如果有特定飲品的計數器，增加計數
            if (typeof drinksMade !== 'undefined') {
                if (!drinksMade) drinksMade = {};
                if (!drinksMade[matchedDrink]) drinksMade[matchedDrink] = 0;
                drinksMade[matchedDrink]++;
            }

            showNotification(`成功製作了一杯${matchedDrink}，獲得${drinks[matchedDrink].sellPrice}元`);
            checkMissionCompletion();

            // 清空輸入框
            document.getElementById('permanent-coffee-input').value = 0;
            document.getElementById('permanent-milk-input').value = 0;
            document.getElementById('permanent-sugar-input').value = 0;
            document.getElementById('permanent-cocoa-input').value = 0;
            document.getElementById('permanent-ice-input').value = 0;
            document.getElementById('permanent-chocolate-syrup-input').value = 0;
        } else {
            showNotification('這個配方不符合任何已知飲品');
        }
    });

    // 初始化物資顯示
    document.getElementById('coffee-count').textContent = ingredients.coffee;
    document.getElementById('milk-count').textContent = ingredients.milk;
    document.getElementById('sugar-count').textContent = ingredients.sugar;
    document.getElementById('cocoa-count').textContent = ingredients.cocoa;
    document.getElementById('ice-count').textContent = ingredients.ice;
    document.getElementById('chocolate-syrup-count').textContent = ingredients.chocolate_syrup;
});