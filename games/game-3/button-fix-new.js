// 按鈕事件監聽器修復
window.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('按鈕初始化開始');
        
        // 為所有面板切換按鈕添加點擊動畫效果
        initMenuButtonEffects();
        
        // 初始化其他按鈕的動畫效果
        initOtherButtonEffects();
        
        // 初始化各個面板切換按鈕
        initPanelToggleButtons();
        
        // 初始化商店按鈕
        initShopButtons();
        
        // 裝飾購買按鈕
        safeAddClickEvent('buy-table-decor', function() {
            if (typeof window.money !== 'undefined' && window.money >= 50) {
                if (window.decorations.length < 3) {
                    window.money -= 50;
                    window.decorations.push({ type: 'table', img: 'table.png' });
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.renderDecorations === 'function') window.renderDecorations();
                    showNotification('購買了一張有質感的木桌');
                    if (typeof window.checkMissionCompletion === 'function') window.checkMissionCompletion();
                } else {
                    showNotification('裝飾位置已滿');
                }
            } else {
                showNotification('金錢不足');
            }
        });

        safeAddClickEvent('buy-plant-decor', function() {
            if (typeof window.money !== 'undefined' && window.money >= 30) {
                if (window.decorations.length < 3) {
                    window.money -= 30;
                    window.decorations.push({ type: 'plant', img: 'plant.png' });
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.renderDecorations === 'function') window.renderDecorations();
                    showNotification('購買了一盆植物');
                    if (typeof window.checkMissionCompletion === 'function') window.checkMissionCompletion();
                } else {
                    showNotification('裝飾位置已滿');
                }
            } else {
                showNotification('金錢不足');
            }
        });

        safeAddClickEvent('buy-art-decor', function() {
            if (typeof window.money !== 'undefined' && window.money >= 80) {
                if (window.decorations.length < 3) {
                    window.money -= 80;
                    window.decorations.push({ type: 'art', img: 'art.png' });
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.renderDecorations === 'function') window.renderDecorations();
                    showNotification('購買了一幅藝術畫');
                    if (typeof window.checkMissionCompletion === 'function') window.checkMissionCompletion();
                } else {
                    showNotification('裝飾位置已滿');
                }
            } else {
                showNotification('金錢不足');
            }
        });
        
        console.log('按鈕初始化完成');
    } catch (error) {
        console.error('按鈕初始化錯誤:', error);
    }
});

// 初始化菜單按鈕效果
function initMenuButtonEffects() {
    try {
        const menuButtons = document.querySelectorAll('#menu button');
        if (menuButtons.length > 0) {
            menuButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // 添加點擊動畫效果
                    this.classList.add('button-click');
                    
                    // 動畫結束後移除類
                    setTimeout(() => {
                        this.classList.remove('button-click');
                    }, 300);
                });
            });
            console.log(`已為 ${menuButtons.length} 個菜單按鈕添加動畫效果`);
        } else {
            console.warn('未找到菜單按鈕');
        }
    } catch (error) {
        console.error('初始化菜單按鈕效果錯誤:', error);
    }
}

// 初始化其他按鈕的動畫效果
function initOtherButtonEffects() {
    try {
        // 為其他互動按鈕添加動畫效果
        const actionButtons = document.querySelectorAll('.make-button, .shop-button, .staff-button');
        if (actionButtons.length > 0) {
            actionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    this.classList.add('button-press');
                    setTimeout(() => {
                        this.classList.remove('button-press');
                    }, 200);
                });
            });
            console.log(`已為 ${actionButtons.length} 個動作按鈕添加動畫效果`);
        }
    } catch (error) {
        console.error('初始化其他按鈕動畫效果錯誤:', error);
    }
}

// 初始化面板切換按鈕
function initPanelToggleButtons() {
    try {
        // 安全地添加事件監聽器
        safeAddClickEvent('staff-button', function() {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel('staff-panel');
            }
        });

        safeAddClickEvent('decor-button', function() {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel('decor-panel');
            }
        });

        safeAddClickEvent('missions-button', function() {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel('missions-panel');
            }
        });

        safeAddClickEvent('orders-button', function() {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel('pending-orders-panel');
            }
        });
        
        safeAddClickEvent('shop-button', function() {
            if (typeof window.togglePanel === 'function') {
                window.togglePanel('shop-panel');
            }
        });
        
        safeAddClickEvent('mix-button', function() {
            // 預設情縫制作器不需要顯示/隱藏，因為它已經是固定顯示的
            // 但我們可以添加一些視覺效果
            const mixPanel = document.getElementById('permanent-mix-panel');
            if (mixPanel) {
                mixPanel.classList.add('highlight-panel');
                setTimeout(() => {
                    mixPanel.classList.remove('highlight-panel');
                }, 1000);
            }
        });
        
        console.log('面板切換按鈕初始化完成');
    } catch (error) {
        console.error('初始化面板切換按鈕錯誤:', error);
    }
}

// 初始化商店按鈕
function initShopButtons() {
    try {
        // 購買咖啡按鈕
        safeAddClickEvent('buy-coffee', function() {
            if (typeof window.money !== 'undefined' && typeof window.ingredients !== 'undefined') {
                if (window.money >= 10) {
                    window.money -= 10;
                    window.ingredients.coffee += 1;
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.updateIngredientDisplay === 'function') window.updateIngredientDisplay();
                    showNotification('購買了1份咖啡');
                } else {
                    showNotification('金錢不足');
                }
            }
        });

        // 購買牛奶按鈕
        safeAddClickEvent('buy-milk', function() {
            if (typeof window.money !== 'undefined' && typeof window.ingredients !== 'undefined') {
                if (window.money >= 8) {
                    window.money -= 8;
                    window.ingredients.milk += 1;
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.updateIngredientDisplay === 'function') window.updateIngredientDisplay();
                    showNotification('購買了1份牛奶');
                } else {
                    showNotification('金錢不足');
                }
            }
        });

        // 購買糖按鈕
        safeAddClickEvent('buy-sugar', function() {
            if (typeof window.money !== 'undefined' && typeof window.ingredients !== 'undefined') {
                if (window.money >= 5) {
                    window.money -= 5;
                    window.ingredients.sugar += 1;
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.updateIngredientDisplay === 'function') window.updateIngredientDisplay();
                    showNotification('購買了1份糖');
                } else {
                    showNotification('金錢不足');
                }
            }
        });

        // 購買可可粉按鈕
        safeAddClickEvent('buy-cocoa', function() {
            if (typeof window.money !== 'undefined' && typeof window.ingredients !== 'undefined') {
                if (window.money >= 12) {
                    window.money -= 12;
                    window.ingredients.cocoa += 1;
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.updateIngredientDisplay === 'function') window.updateIngredientDisplay();
                    showNotification('購買了1份可可粉');
                } else {
                    showNotification('金錢不足');
                }
            }
        });

        // 購買冰塊按鈕
        safeAddClickEvent('buy-ice', function() {
            if (typeof window.money !== 'undefined' && typeof window.ingredients !== 'undefined') {
                if (window.money >= 3) {
                    window.money -= 3;
                    window.ingredients.ice += 1;
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.updateIngredientDisplay === 'function') window.updateIngredientDisplay();
                    showNotification('購買了1份冰塊');
                } else {
                    showNotification('金錢不足');
                }
            }
        });

        // 購買巧克力糖漿按鈕
        safeAddClickEvent('buy-chocolate-syrup', function() {
            if (typeof window.money !== 'undefined' && typeof window.ingredients !== 'undefined') {
                if (window.money >= 15) {
                    window.money -= 15;
                    window.ingredients.chocolateSyrup += 1;
                    if (typeof window.updateMoney === 'function') window.updateMoney();
                    if (typeof window.updateIngredientDisplay === 'function') window.updateIngredientDisplay();
                    showNotification('購買了1份巧克力糖漿');
                } else {
                    showNotification('金錢不足');
                }
            }
        });
        
        console.log('商店按鈕初始化完成');
    } catch (error) {
        console.error('初始化商店按鈕錯誤:', error);
    }
}

// 安全地添加點擊事件
function safeAddClickEvent(elementId, callback) {
    try {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('click', callback);
            console.log(`為 ${elementId} 添加點擊事件`);
        } else {
            console.warn(`元素 ${elementId} 不存在，無法添加點擊事件`);
        }
    } catch (error) {
        console.error(`為 ${elementId} 添加點擊事件錯誤:`, error);
    }
}

// 顯示通知的輔助函數
function showNotification(message) {
    try {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message);
        } else {
            console.log(`通知: ${message}`);
        }
    } catch (error) {
        console.error('顯示通知錯誤:', error);
    }
}
