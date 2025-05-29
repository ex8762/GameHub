// UI Manager - 處理所有使用者介面相關功能
import { getAssetLoader } from './asset-loader.js';

export class UIManager {
    constructor() {
        this.notifications = [];
        this.tooltips = [];
        this.fadeElements = [];
        
        // 取得UI元素
        this.notificationContainer = document.getElementById('notification-container');
        this.tooltipContainer = document.getElementById('tooltip-container');
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingText = document.getElementById('loading-text');
        this.instructionsPanel = document.getElementById('instructions');
        
        // 初始化
        this.setupEventListeners();
        this.setupTooltips();
        this.lastUpdateTime = Date.now();
    }

    setupEventListeners() {
        // 監聽滑鼠移動顯示工具提示
        document.addEventListener('mousemove', (e) => {
            this.updateTooltipPositions(e.clientX, e.clientY);
        });

        // 監聽按鈕和UI元素
        document.querySelectorAll('.interactive').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                element.classList.remove('hover');
            });
        });
    }

    setupTooltips() {
        // 為所有帶有data-tooltip屬性的元素設置工具提示
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltipText = element.getAttribute('data-tooltip');
                this.showTooltip(tooltipText, e.clientX, e.clientY);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (!this.notificationContainer) return;
        
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        
        // 添加適當的圖標
        let iconClass = '';
        switch(type) {
            case 'success': iconClass = '✅'; break;
            case 'error': iconClass = '❌'; break;
            case 'warning': iconClass = '⚠️'; break;
            default: iconClass = 'ℹ️'; break;
        }
        
        notification.innerHTML = `
            <span class="notification-icon">${iconClass}</span>
            <div class="notification-content">${message}</div>
        `;
        
        // 添加到容器
        this.notificationContainer.appendChild(notification);
        
        // 添加到通知列表
        const notificationObj = { element: notification, timeLeft: duration };
        this.notifications.push(notificationObj);
        
        // 初始淡入效果
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // 播放音效
        const soundMap = {
            'info': 'collect',
            'success': 'craft',
            'warning': 'error',
            'error': 'error'
        };
        
        if (window.soundManager && soundMap[type]) {
            window.soundManager.play(soundMap[type]);
        }
        
        return notification;
    }
    
    getIconForType(type) {
        switch(type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    }
    
    createTooltip(element, content) {
        const tooltip = document.createElement('div');
        tooltip.className = 'game-tooltip';
        tooltip.innerHTML = content;
        tooltip.style.opacity = '0';
        document.body.appendChild(tooltip);
        
        const tooltipObj = { 
            element: tooltip, 
            target: element, 
            content: content,
            visible: false
        };
        
        this.tooltips.push(tooltipObj);
        
        element.addEventListener('mouseenter', () => {
            tooltipObj.visible = true;
            tooltip.style.opacity = '1';
        });
        
        element.addEventListener('mouseleave', () => {
            tooltipObj.visible = false;
            tooltip.style.opacity = '0';
        });
        
        return tooltip;
    }
    
    updateTooltipPositions(mouseX, mouseY) {
        this.tooltips.forEach(tooltip => {
            if (tooltip.visible) {
                tooltip.element.style.left = `${mouseX + 15}px`;
                tooltip.element.style.top = `${mouseY + 15}px`;
            }
        });
    }
    
    addFadeElement(element, duration = 2000, direction = 'up', distance = 50) {
        // 為元素添加淡出和移動效果
        element.style.transition = `opacity ${duration/1000}s ease-out, transform ${duration/1000}s ease-out`;
        
        const directionMap = {
            'up': `translateY(-${distance}px)`,
            'down': `translateY(${distance}px)`,
            'left': `translateX(-${distance}px)`,
            'right': `translateX(${distance}px)`
        };
        
        element.style.opacity = '0';
        element.style.transform = directionMap[direction];
        
        const fadeObj = { 
            element: element, 
            startTime: Date.now(),
            duration: duration
        };
        
        this.fadeElements.push(fadeObj);
    }
    
    update(deltaTime) {
        // 更新通知
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            const notification = this.notifications[i];
            notification.timeLeft -= deltaTime;
            
            if (notification.timeLeft <= 0) {
                notification.element.style.opacity = '0';
                notification.element.style.transform = 'translateY(-20px)';
                
                // 從DOM移除通知
                setTimeout(() => {
                    if (notification.element.parentNode) {
                        notification.element.parentNode.removeChild(notification.element);
                    }
                }, 500);
                
                this.notifications.splice(i, 1);
            }
        }
        
        // 更新淡出元素
        for (let i = this.fadeElements.length - 1; i >= 0; i--) {
            const fadeElement = this.fadeElements[i];
            const elapsed = Date.now() - fadeElement.startTime;
            
            if (elapsed >= fadeElement.duration) {
                // 移除已完成動畫的元素
                if (fadeElement.element.parentNode) {
                    fadeElement.element.parentNode.removeChild(fadeElement.element);
                }
                this.fadeElements.splice(i, 1);
            }
        }
    }
    
    showFloatingText(text, x, y, color = '#ffffff', size = '16px') {
        const textElement = document.createElement('div');
        textElement.className = 'floating-text';
        textElement.textContent = text;
        textElement.style.position = 'absolute';
        textElement.style.left = `${x}px`;
        textElement.style.top = `${y}px`;
        textElement.style.color = color;
        textElement.style.fontSize = size;
        textElement.style.pointerEvents = 'none';
        textElement.style.fontWeight = 'bold';
        textElement.style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.7)';
        textElement.style.zIndex = '1000';
        
        document.body.appendChild(textElement);
        this.addFadeElement(textElement, 1500, 'up', 30);
        
        return textElement;
    }
    
    updateStatusBars(player) {
        // 設置進度條的函數
        const setBar = (id, value, max, warn = false) => {
            const bar = document.getElementById(id);
            if (bar) {
                const fill = bar.querySelector('.bar-fill');
                const valueDisplay = bar.querySelector('.value');
                
                const percentage = Math.max(0, Math.min(100, (value / max) * 100));
                fill.style.width = `${percentage}%`;
                
                // 閃爍警告色
                if (warn && percentage < 25) {
                    fill.style.backgroundColor = Math.floor(Date.now() / 500) % 2 === 0 ? '#e74c3c' : '#c0392b';
                } else {
                    fill.style.backgroundColor = '';
                }
                
                valueDisplay.textContent = `${Math.round(value)}/${max}`;
            }
        };
        
        // 更新狀態條
        setBar('health-bar', player.health, 100, true);
        setBar('hunger-bar', player.hunger, 100, true);
        setBar('thirst-bar', player.thirst, 100, true);
    }
    
    updateTemperature(temperature) {
        // 更新溫度顯示
        const temperatureElement = document.getElementById('temperature');
        if (temperatureElement) {
            temperatureElement.textContent = `溫度: ${Math.round(temperature)}°C`;
            
            // 根據溫度範圍調整顏色
            if (temperature < 5) {
                temperatureElement.style.color = '#3498db'; // 藍色（冷）
            } else if (temperature > 35) {
                temperatureElement.style.color = '#e74c3c'; // 紅色（熱）
            } else {
                temperatureElement.style.color = '#2ecc71'; // 綠色（適中）
            }
        }
    }
    
    updateSurvivalTime(gameTime) {
        // 更新生存時間
        const survivalTimeElement = document.getElementById('survival-time');
        if (survivalTimeElement) {
            const totalSeconds = Math.floor(gameTime / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            survivalTimeElement.textContent = `生存時間: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }
    
    showLoadingScreen(progress) {
        // 創建或獲取載入畫面
        let loadingScreen = document.getElementById('loading-screen');
        
        if (!loadingScreen) {
            loadingScreen = document.createElement('div');
            loadingScreen.id = 'loading-screen';
            loadingScreen.style.position = 'fixed';
            loadingScreen.style.top = '0';
            loadingScreen.style.left = '0';
            loadingScreen.style.width = '100%';
            loadingScreen.style.height = '100%';
            loadingScreen.style.backgroundColor = '#000';
            loadingScreen.style.display = 'flex';
            loadingScreen.style.flexDirection = 'column';
            loadingScreen.style.justifyContent = 'center';
            loadingScreen.style.alignItems = 'center';
            loadingScreen.style.zIndex = '9999';
            
            // 遊戲標題
            const title = document.createElement('h1');
            title.textContent = '生存遊戲';
            title.style.color = '#fff';
            title.style.marginBottom = '30px';
            title.style.fontSize = '48px';
            title.style.fontFamily = 'Arial, sans-serif';
            title.style.textShadow = '0 0 10px rgba(46, 204, 113, 0.8)';
            
            // 載入進度條容器
            const progressContainer = document.createElement('div');
            progressContainer.style.width = '60%';
            progressContainer.style.height = '20px';
            progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            progressContainer.style.borderRadius = '10px';
            progressContainer.style.overflow = 'hidden';
            
            // 載入進度條
            const progressBar = document.createElement('div');
            progressBar.id = 'loading-progress';
            progressBar.style.width = '0%';
            progressBar.style.height = '100%';
            progressBar.style.backgroundColor = '#2ecc71';
            progressBar.style.transition = 'width 0.3s ease-out';
            
            // 載入文字
            const progressText = document.createElement('div');
            progressText.id = 'loading-text';
            progressText.textContent = '載入中... 0%';
            progressText.style.color = '#fff';
            progressText.style.marginTop = '15px';
            
            // 添加元素
            progressContainer.appendChild(progressBar);
            loadingScreen.appendChild(title);
            loadingScreen.appendChild(progressContainer);
            loadingScreen.appendChild(progressText);
            
            document.body.appendChild(loadingScreen);
        }
        
        // 更新進度
        const progressBar = document.getElementById('loading-progress');
        const progressText = document.getElementById('loading-text');
        
        if (progressBar && progressText) {
            const percentage = Math.min(100, Math.round(progress * 100));
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `載入中... ${percentage}%`;
            
            // 如果進度完成，淡出載入畫面
            if (percentage >= 100) {
                setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    loadingScreen.style.transition = 'opacity 1s ease-out';
                    
                    setTimeout(() => {
                        if (loadingScreen.parentNode) {
                            loadingScreen.parentNode.removeChild(loadingScreen);
                        }
                    }, 1000);
                }, 500);
            }
        }
    }

    createInventoryTooltip(item) {
        if (!item) return '';
        
        let content = `
            <div class="item-tooltip">
                <div class="item-header">
                    <span class="item-icon">${item.icon}</span>
                    <span class="item-name">${item.name}</span>
                </div>
        `;
        
        if (item.description) {
            content += `<div class="item-description">${item.description}</div>`;
        }
        
        if (item.durability) {
            const durabilityPercent = Math.floor((item.currentDurability / item.durability) * 100);
            const durabilityColor = 
                durabilityPercent > 60 ? '#2ecc71' : 
                durabilityPercent > 30 ? '#f39c12' : 
                '#e74c3c';
            
            content += `
                <div class="item-durability">
                    <div class="durability-label">耐久度:</div>
                    <div class="durability-bar">
                        <div class="durability-fill" style="width: ${durabilityPercent}%; background-color: ${durabilityColor};"></div>
                    </div>
                    <div class="durability-value">${item.currentDurability}/${item.durability}</div>
                </div>
            `;
        }
        
        // 特殊屬性
        const properties = [];
        
        if (item.damage) properties.push(`傷害: ${item.damage}`);
        if (item.armor) properties.push(`防禦: ${item.armor}`);
        if (item.nutritionalValue) properties.push(`營養: ${item.nutritionalValue}`);
        if (item.hydrationValue) properties.push(`水分: ${item.hydrationValue}`);
        if (item.healAmount) properties.push(`治療: ${item.healAmount}`);
        if (item.efficiency) properties.push(`效率: ${item.efficiency}`);
        
        if (properties.length > 0) {
            content += `
                <div class="item-properties">
                    ${properties.map(prop => `<div class="item-property">${prop}</div>`).join('')}
                </div>
            `;
        }
        
        content += `</div>`;
        
        return content;
    }
    
    showInstructions() {
        if (this.instructionsPanel) {
            this.instructionsPanel.classList.remove('hidden');
            return this.instructionsPanel;
        }
        
        return null;
    }
    
    // 顯示載入畫面
    showLoadingScreen() {
        if (!this.loadingScreen) return;
        this.loadingScreen.style.display = 'flex';
    }
    
    // 隱藏載入畫面
    hideLoadingScreen() {
        if (!this.loadingScreen) return;
        this.loadingScreen.style.opacity = '0';
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            this.loadingScreen.style.opacity = '1';
        }, 500);
    }
    
    // 更新載入進度
    updateLoadingProgress(percent) {
        if (!this.loadingProgress || !this.loadingText) return;
        this.loadingProgress.style.width = `${percent}%`;
        this.loadingText.textContent = `${Math.floor(percent)}%`;
    }
    
    // 顯示工具提示
    showTooltip(text, x, y) {
        if (!this.tooltipContainer) return;
        
        this.tooltipContainer.innerHTML = text;
        this.tooltipContainer.style.display = 'block';
        
        // 計算定位，確保提示不會超出畫面
        const rect = this.tooltipContainer.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // 水平定位
        let tooltipX = x + 15; // 偏移選項，以避免渡於滑鼠下
        if (tooltipX + rect.width > viewportWidth) {
            tooltipX = viewportWidth - rect.width - 10;
        }
        
        // 垂直定位
        let tooltipY = y + 15;
        if (tooltipY + rect.height > viewportHeight) {
            tooltipY = y - rect.height - 10;
        }
        
        this.tooltipContainer.style.left = `${tooltipX}px`;
        this.tooltipContainer.style.top = `${tooltipY}px`;
    }
    
    // 隱藏工具提示
    hideTooltip() {
        if (!this.tooltipContainer) return;
        this.tooltipContainer.style.display = 'none';
    }
    
    // 顯示浮動文字
    showFloatingText(text, x, y, type = 'default') {
        const floatingText = document.createElement('div');
        floatingText.className = `floating-text ${type}`;
        floatingText.textContent = text;
        floatingText.style.left = `${x}px`;
        floatingText.style.top = `${y}px`;
        
        document.body.appendChild(floatingText);
        
        // 浮動文字會自動嚴徵後消失（透過 CSS 動畫）
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 1500);
        
        return floatingText;
    }
    
    // 切換遊戲說明面板
    toggleInstructions() {
        if (!this.instructionsPanel) return;
        this.instructionsPanel.classList.toggle('hidden');
    }
    
    // 關閉所有面板
    closeAllPanels() {
        const panels = [
            document.getElementById('inventory'),
            document.getElementById('crafting-panel'),
            document.getElementById('settings-panel'),
            document.getElementById('instructions')
        ];
        
        let anyPanelClosed = false;
        
        panels.forEach(panel => {
            if (panel && !panel.classList.contains('hidden')) {
                panel.classList.add('hidden');
                anyPanelClosed = true;
            }
        });
        
        return anyPanelClosed;
    }
}


