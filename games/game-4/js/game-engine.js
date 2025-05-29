// Game Engine - 整合所有遊戲功能的核心類
import { GAME_CONFIG, WEATHER_TYPES, DAY_NIGHT_CYCLE } from './constants.js';
import { Player } from './player.js';
import { World } from './world.js';
import { Inventory } from './inventory.js';
import { CraftingSystem } from './crafting.js';
import { TERRAIN_TYPES, RESOURCE_TYPES, ITEM_TYPES, RECIPES } from './constants.js';
import { AssetLoader } from './asset-loader.js';
import { UIManager } from './ui-manager.js';
import { SoundManager } from './sound-manager.js';

export class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.gameTime = 0;
        this.player = new Player(320, 320);
        this.world = new World(100, 100);
        this.inventory = new Inventory();
        this.crafting = new CraftingSystem(this.inventory);
        this.weather = WEATHER_TYPES.CLEAR;
        this.camera = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
        this.lastAutoSave = 0;
        this.dayTime = 0; // 當前時間(毫秒)
        this.isDaytime = true;
        this.lastUpdate = Date.now();
        
        // 新增UI管理器和音效管理器
        this.ui = new UIManager();
        this.soundManager = SoundManager.getInstance();
        
        // 事件訂閱者
        this.eventSubscribers = {
            'resourceCollected': [],
            'weatherChange': [],
            'dayNightChange': [],
            'playerHealthChanged': [],
            'playerStatsChanged': [],
            'itemCrafted': []
        };
        
        // 資源重生計時器
        this.resourceRegenerationTimer = 0;
        
        this.init();
    }

    init() {
        // 初始化遊戲
        this.setupEventListeners();
        this.loadAssets();
        
        // 註冊事件處理
        this.registerEventHandlers();
        
        // 生成初始資源
        this.generateInitialResources();
        
        // 啟動遊戲循環
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    // 註冊事件處理
    registerEventHandlers() {
        // 訂閱資源收集事件
        this.subscribe('resourceCollected', (data) => {
            // 顯示資源收集通知
            this.ui.showNotification(`獲得 ${data.resource}`, 'success', 2000);
            
            // 播放資源收集音效
            if (data.resource === RESOURCE_TYPES.WOOD) {
                this.soundManager.play('woodCollect');
            } else if (data.resource === RESOURCE_TYPES.STONE) {
                this.soundManager.play('stoneCollect');
            } else {
                this.soundManager.play('itemCollect');
            }
        });
        
        // 訂閱天氣變化事件
        this.subscribe('weatherChange', (data) => {
            this.ui.showNotification(`天氣變化: ${data.weather}`, 'info', 3000);
            
            // 根據天氣播放不同音效
            if (data.weather === WEATHER_TYPES.RAIN) {
                this.soundManager.play('rainStart');
            } else if (data.weather === WEATHER_TYPES.CLEAR) {
                this.soundManager.play('clearWeather');
            }
        });
        
        // 訂閱日夜變化事件
        this.subscribe('dayNightChange', (data) => {
            const timeString = data.isDaytime ? '白天' : '夜晚';
            this.ui.showNotification(`現在是${timeString}`, 'info', 3000);
            
            // 根據日夜播放不同音效
            if (data.isDaytime) {
                this.soundManager.play('daytime');
            } else {
                this.soundManager.play('nighttime');
            }
        });
    }
    
    // 生成初始資源
    generateInitialResources() {
        // 生成一些初始資源
        for (let i = 0; i < 50; i++) {
            this.world.generateRandomResource();
        }
    }

    setupEventListeners() {
        // 設置鍵盤監聽
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // 設置視窗大小變更監聽
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 設置UI元素監聽
        this.setupUIListeners();
        
        // 初始化畫布大小
        this.handleResize();
    }
    
    // 設置UI元素監聽
    setupUIListeners() {
        // 設置工具提示
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltipText = element.getAttribute('data-tooltip');
                this.ui.showTooltip(tooltipText, e.clientX, e.clientY);
            });
            
            element.addEventListener('mouseleave', () => {
                this.ui.hideTooltip();
            });
        });
        
        // 設置遊戲說明按鈕
        const helpButton = document.getElementById('help-button');
        if (helpButton) {
            helpButton.addEventListener('click', () => {
                this.ui.toggleInstructions();
            });
        }
        
        // 設置音量控制
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseFloat(e.target.value);
                this.soundManager.setVolume(volume);
                
                // 播放音效示範
                if (volume > 0) {
                    this.soundManager.play('uiClick');
                }
            });
        }
        
        // 靜音按鈕
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                const isMuted = this.soundManager.toggleSound();
                muteButton.textContent = isMuted ? '取消靜音' : '靜音';
                this.ui.showNotification(isMuted ? '已靜音' : '已取消靜音', 'info', 1500);
            });
        }
    }

    handleKeyDown(event) {
        // 處理鍵盤輸入
        switch (event.key) {
            case 'ArrowUp': case 'w': case 'W':
                this.player.moving.up = true;
                break;
            case 'ArrowDown': case 's': case 'S':
                this.player.moving.down = true;
                break;
            case 'ArrowLeft': case 'a': case 'A':
                this.player.moving.left = true;
                break;
            case 'ArrowRight': case 'd': case 'D':
                this.player.moving.right = true;
                break;
            case 'e': case 'E':
                const resource = this.collectResource();
                if (!resource) {
                    this.ui.showNotification('附近沒有可收集的資源', 'warning', 1500);
                }
                break;
            case 'i': case 'I':
                this.toggleInventory();
                this.soundManager.play('uiOpen');
                break;
            case 'c': case 'C':
                this.toggleCrafting();
                this.soundManager.play('uiOpen');
                break;
            case 'h': case 'H':
                this.ui.toggleInstructions();
                this.soundManager.play('uiClick');
                break;
            case 'Escape':
                // 關閉所有UI面板
                if (this.ui.closeAllPanels()) {
                    this.soundManager.play('uiClose');
                }
                break;
        }
    }

    collectResource() {
        const playerTileX = Math.floor(this.player.x / this.world.tileSize);
        const playerTileY = Math.floor(this.player.y / this.world.tileSize);
        
        // 檢查玩家周圍的資源
        for (let y = playerTileY - 1; y <= playerTileY + 1; y++) {
            for (let x = playerTileX - 1; x <= playerTileX + 1; x++) {
                const key = `${x},${y}`;
                if (this.world.resources.has(key)) {
                    const resource = this.world.removeResource(x * this.world.tileSize, y * this.world.tileSize);
                    if (resource) {
                        this.inventory.addItem(resource, 1);
                        
                        // 觸發資源收集事件
                        this.publish('resourceCollected', { resource, amount: 1 });
                        
                        // 顯示浮動文字
                        this.ui.showFloatingText(
                            `+1 ${resource}`,
                            this.player.x - this.camera.x,
                            this.player.y - this.camera.y - 30,
                            'success'
                        );
                        
                        return resource;
                    }
                }
            }
        }
        
        return null;
    }

    gameLoop(timestamp) {
        // 計算時間差
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // 更新遊戲狀態
        this.update(deltaTime);
        
        // 渲染遊戲
        this.render();
        
        // 繼續遊戲循環
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        // 更新玩家
        this.player.update(deltaTime, this.world);
        
        // 更新相機位置
        this.updateCamera();
        
        // 更新天氣和時間
        this.updateWeatherAndTime(deltaTime);
        
        // 檢查自動保存
        this.checkAutoSave();
        
        // 定期生成新資源
        this.updateResourceRegeneration(deltaTime);
    }
    
    // 資源重生系統
    updateResourceRegeneration(deltaTime) {
        this.resourceRegenerationTimer += deltaTime;
        
        // 每60秒嘗試生成一些新資源
        if (this.resourceRegenerationTimer > 60000) {
            this.resourceRegenerationTimer = 0;
            
            // 嘗試生成1-3個新資源
            const resourceCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < resourceCount; i++) {
                const result = this.world.generateRandomResource();
                if (result) {
                    // 如果資源在視野範圍內，顯示通知
                    const screenX = result.x * this.world.tileSize - this.camera.x;
                    const screenY = result.y * this.world.tileSize - this.camera.y;
                    
                    if (screenX >= 0 && screenX <= this.camera.width && 
                        screenY >= 0 && screenY <= this.camera.height) {
                        this.ui.showNotification(`附近出現了${result.resourceType}`, 'info', 2000);
                    }
                }
            }
        }
    }

    loadAssets() {
        const loader = new AssetLoader();
        
        // 顯示載入畫面
        this.ui.showLoadingScreen();
        
        // 監聽進度
        loader.onProgress = (loaded, total, percent) => {
            this.ui.updateLoadingProgress(percent);
        };
        
        // 加載資源
        loader.loadAll().then((assets) => {
            // 資源加載完成
            console.log('遊戲資源加載完成');
            
            // 註冊音效
            if (assets.sounds) {
                Object.keys(assets.sounds).forEach(key => {
                    this.soundManager.registerSound(key, assets.sounds[key]);
                });
            }
            
            // 關閉載入畫面
            setTimeout(() => {
                this.ui.hideLoadingScreen();
                
                // 顯示歡迎訊息
                this.ui.showNotification('遊戲載入完成，歡迎來到生存世界！', 'success', 5000);
                
                // 播放背景音樂
                this.soundManager.playBackgroundMusic('bgMusic', { fadeIn: 2000 });
            }, 500);
        }).catch(error => {
            console.error('資源加載失敗:', error);
            this.ui.showNotification('資源加載失敗，請重新整理頁面', 'error', 0);
        });
    }

    // 事件訂閱系統
    subscribe(eventType, callback) {
        if (!this.eventSubscribers[eventType]) {
            this.eventSubscribers[eventType] = [];
        }
        this.eventSubscribers[eventType].push(callback);
    }
    
    unsubscribe(eventType, callback) {
        if (this.eventSubscribers[eventType]) {
            this.eventSubscribers[eventType] = this.eventSubscribers[eventType].filter(
                cb => cb !== callback
            );
        }
    }
    
    publish(eventType, data) {
        if (this.eventSubscribers[eventType]) {
            this.eventSubscribers[eventType].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`事件處理發生錯誤 (${eventType}):`, error);
                }
            });
        }
    }
    
    handleKeyUp(event) {
        // 處理鍵盤放開
        switch (event.key) {
            case 'ArrowUp': case 'w': case 'W':
                this.player.moving.up = false;
                break;
            case 'ArrowDown': case 's': case 'S':
                this.player.moving.down = false;
                break;
            case 'ArrowLeft': case 'a': case 'A':
                this.player.moving.left = false;
                break;
            case 'ArrowRight': case 'd': case 'D':
                this.player.moving.right = false;
                break;
        }
    }
    
    handleResize() {
        // 調整畫布大小以適應視窗
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.width = window.innerWidth;
        this.camera.height = window.innerHeight;
    }
    
    updateCamera() {
        // 計算相機位置，使玩家保持在畫面中央
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        
        // 確保相機不會超出世界邊界
        this.camera.x = Math.max(0, Math.min(this.world.width * this.world.tileSize - this.canvas.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.world.height * this.world.tileSize - this.canvas.height, this.camera.y));
    }
    
    toggleInventory() {
        const inventory = document.getElementById('inventory');
        inventory.classList.toggle('hidden');
        
        // 如果打開了物品欄，關閉合成面板
        if (!inventory.classList.contains('hidden')) {
            document.getElementById('crafting-panel').classList.add('hidden');
        }
    }
    
    toggleCrafting() {
        const craftingPanel = document.getElementById('crafting-panel');
        craftingPanel.classList.toggle('hidden');
        
        // 如果打開了合成面板，關閉物品欄
        if (!craftingPanel.classList.contains('hidden')) {
            document.getElementById('inventory').classList.add('hidden');
        }
    }
    
    checkAutoSave() {
        // 每5分鐘自動儲存遊戲
        if (this.gameTime - this.lastAutoSave > 5 * 60 * 1000) {
            this.saveGame();
            this.lastAutoSave = this.gameTime;
            this.ui.showNotification('遊戲已自動儲存', 'info', 2000);
        }
    }
    
    saveGame() {
        // 儲存遊戲數據到本地存儲
        const saveData = {
            player: this.player.save(),
            inventory: this.inventory.save(),
            world: this.world.save(),
            gameTime: this.gameTime,
            dayTime: this.dayTime
        };
        
        localStorage.setItem('survivalGame', JSON.stringify(saveData));
        return true;
    }
    
    loadGame() {
        // 從本地存儲載入遊戲數據
        const saveString = localStorage.getItem('survivalGame');
        if (!saveString) return false;
        
        try {
            const saveData = JSON.parse(saveString);
            
            this.player.load(saveData.player);
            this.inventory.load(saveData.inventory);
            this.world.load(saveData.world);
            this.gameTime = saveData.gameTime;
            this.dayTime = saveData.dayTime;
            
            this.ui.showNotification('遊戲已載入', 'success', 3000);
            return true;
        } catch (error) {
            console.error('載入遊戲失敗:', error);
            this.ui.showNotification('載入遊戲失敗', 'error', 3000);
            return false;
        }
    }
    
    updateWeatherAndTime(deltaTime) {
        // 更新遊戲內時間
        this.dayTime += deltaTime;
        if (this.dayTime >= 24 * 60 * 60 * 1000) {
            this.dayTime = 0;
        }
        
        // 判斷是白天還是夜晚
        const wasDay = this.isDaytime;
        this.isDaytime = this.dayTime < 12 * 60 * 60 * 1000;
        
        // 檢測日夜變化
        if (wasDay !== this.isDaytime) {
            // 觸發日夜變化事件
            this.publish('dayNightChange', { isDaytime: this.isDaytime, time: this.dayTime });
            
            // 更新日夜指示器
            this.updateDayNightIndicator();
        }
        
        // 隨機天氣變化
        if (Math.random() < 0.0001) {
            const oldWeather = this.weather;
            const weatherTypes = Object.values(WEATHER_TYPES);
            this.weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            
            if (oldWeather !== this.weather) {
                // 觸發天氣變化事件
                this.publish('weatherChange', { weather: this.weather, previous: oldWeather });
            }
        }
    }
    
    // 更新日夜指示器
    updateDayNightIndicator() {
        const indicator = document.querySelector('.day-night-indicator');
        if (!indicator) return;
        
        const progress = document.querySelector('.day-night-progress');
        const text = document.querySelector('.day-night-text');
        
        // 計算時間百分比
        const percent = (this.dayTime / (24 * 60 * 60 * 1000)) * 100;
        progress.style.width = `${percent}%`;
        
        // 更新文字
        const hour = Math.floor(this.dayTime / (60 * 60 * 1000));
        const minute = Math.floor((this.dayTime % (60 * 60 * 1000)) / (60 * 1000));
        text.textContent = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    render() {
        // 繪製遊戲
        this.ctx.save();
        
        // 計算光照水平（基於日夜循環）
        const timeRatio = this.dayTime / DAY_NIGHT_CYCLE.DAY_LENGTH;
        let lightLevel = 1; // 默認完全亮度
        
        if (timeRatio < DAY_NIGHT_CYCLE.DAWN_START || timeRatio > DAY_NIGHT_CYCLE.DUSK_END) {
            // 夜晚
            lightLevel = 0.3;
        } else if (timeRatio < DAY_NIGHT_CYCLE.DAWN_END) {
            // 黎明
            const dawnProgress = (timeRatio - DAY_NIGHT_CYCLE.DAWN_START) / (DAY_NIGHT_CYCLE.DAWN_END - DAY_NIGHT_CYCLE.DAWN_START);
            lightLevel = 0.3 + (0.7 * dawnProgress);
        } else if (timeRatio > DAY_NIGHT_CYCLE.DUSK_START) {
            // 黃昏
            const duskProgress = (timeRatio - DAY_NIGHT_CYCLE.DUSK_START) / (DAY_NIGHT_CYCLE.DUSK_END - DAY_NIGHT_CYCLE.DUSK_START);
            lightLevel = 1.0 - (0.7 * duskProgress);
        }
        
        // 調整全局透明度
        this.ctx.globalAlpha = 0.7 + lightLevel * 0.3;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新攝像機
        this.camera.width = this.canvas.width;
        this.camera.height = this.canvas.height;
        
        // 繪製世界
        this.world.draw(this.ctx, this.camera);
        
        // 天氣動畫
        this.drawWeatherEffect();
        
        // 繪製玩家
        const cam = this.camera;
        const px = this.player.x - cam.x;
        const py = this.player.y - cam.y;
        
        // 玩家光環效果
        this.ctx.save();
        this.ctx.shadowColor = '#3498db';
        this.ctx.shadowBlur = 18;
        this.ctx.beginPath();
        this.ctx.arc(px, py, this.player.size/2, 0, Math.PI*2);
        this.ctx.fillStyle = '#2980b9';
        this.ctx.fill();
        this.ctx.restore();
        
        // 日夜循環光照效果
        this.ctx.fillStyle = `rgba(0, 0, 0, ${1 - lightLevel})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製時間指示器
        this.drawDayTimeIndicator(this.ctx);
        
        this.ctx.restore();
    }

    drawWeatherEffect() {
        // 繪製天氣效果
        switch(this.weather.name) {
            case '晴朗':
                // 繪製陽光粒子
                break;
            case '雨':
                this.drawRain();
                break;
            case '雪':
                this.drawSnow();
                break;
            case '霧':
                this.drawFog();
                break;
        }
    }

    drawRain() {
        // 繪製雨滴
        const raindrops = 100;
        this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < raindrops; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + 5, y + 10);
            this.ctx.stroke();
        }
    }

    drawSnow() {
        // 繪製雪花
        const snowflakes = 50;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < snowflakes; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawFog() {
        // 繪製霧
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width/2, this.canvas.height/2, 0,
            this.canvas.width/2, this.canvas.height/2, this.canvas.width/2
        );
        gradient.addColorStop(0, 'rgba(200, 200, 200, 0.1)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0.4)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawDayTimeIndicator(ctx) {
        // 繪製日夜指示器
        const x = ctx.canvas.width - 110;
        const y = 20;
        const width = 100;
        const height = 20;
        
        // 繪製背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // 繪製進度條
        const progress = this.dayTime / DAY_NIGHT_CYCLE.DAY_LENGTH;
        ctx.fillStyle = this.isDaytime ? '#FFD700' : '#4169E1';
        ctx.fillRect(x, y, width * progress, height);
        
        // 繪製邊框
        ctx.strokeStyle = '#FFFFFF';
        ctx.strokeRect(x, y, width, height);
        
        // 繪製文字
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.isDaytime ? '白天' : '夜晚', x + width / 2, y + height / 2 + 4);
    }
}
