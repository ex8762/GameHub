import { GAME_CONFIG } from './constants.js';
import { getSpriteManager } from './sprite-manager.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 64;
        this.speed = 150;
        this.collisionBox = {
            x: 8,   // 偏移量
            y: 32,  // 偏移量
            width: 32,
            height: 32
        };

        // 屬性
        this.health = GAME_CONFIG.INITIAL_HEALTH;
        this.maxHealth = 100;
        this.hunger = GAME_CONFIG.INITIAL_HUNGER;
        this.maxHunger = 100;
        this.thirst = GAME_CONFIG.INITIAL_THIRST;
        this.maxThirst = 100;
        this.temperature = 20;
        this.energy = 100;
        this.maxEnergy = 100;
        this.level = 1;
        this.exp = 0;
        this.skillPoints = 0;
        this.skills = {
            gather: 0,
            hungerResist: 0,
            thirstResist: 0,
            environment: 0,
            strength: 0
        };

        this.baseVisionRange = 5; // 基礎視野範圍
        this.visionRange = this.baseVisionRange; // 當前視野範圍
    }

    update(deltaTime, world) {
        // 更新玩家動畫
        this.updateAnimation(deltaTime);
        
        // 更新移動
        this.updateMovement(deltaTime, world);
        
        // 更新狀態
        this.updateStatus(deltaTime);
    }
    
    updateMovement(deltaTime, world) {
        // 根據按鍵狀態更新位置
        let dx = 0;
        let dy = 0;

        if (this.moving.up) dy -= 1;
        if (this.moving.down) dy += 1;
        if (this.moving.left) dx -= 1;
        if (this.moving.right) dx += 1;

        // 確定方向
        if (dx !== 0 || dy !== 0) {
            this.isMoving = true;
            
            // 設定玩家朝向
            if (Math.abs(dx) > Math.abs(dy)) {
                this.direction = dx > 0 ? 'right' : 'left';
            } else {
                this.direction = dy > 0 ? 'down' : 'up';
            }
        } else {
            this.isMoving = false;
        }

        // 對角線移動速度正規化
        if (dx !== 0 && dy !== 0) {
            const normalize = 1 / Math.sqrt(2);
            dx *= normalize;
            dy *= normalize;
        }
        
        // 夜晚降低移動速度
        const speedMultiplier = world && world.isDaytime ? 1.0 : 0.7;
        
        // 應用速度
        const moveX = dx * this.speed * speedMultiplier * (deltaTime / 1000);
        const moveY = dy * this.speed * speedMultiplier * (deltaTime / 1000);

        // 確定新位置
        const newX = this.x + moveX;
        const newY = this.y + moveY;

        // 檢查碰撞
        if (this.canMoveTo(newX, newY, world)) {
            this.x = newX;
            this.y = newY;
            
            // 檢查周圍資源
            this.checkNearbyResources(world);
        }

        // 確保在邊界內
        this.x = Math.max(0, Math.min(world.width - 1, this.x));
        this.y = Math.max(0, Math.min(world.height - 1, this.y));
    }

    // 確認玩家是否可以移動到新位置
    canMoveTo(newX, newY, world) {
        if (!world) return true;
        
        // 計算碰撞箱在新位置的座標
        const collisionX = newX + this.collisionBox.x;
        const collisionY = newY + this.collisionBox.y;
        
        // 確認不會超出地圖邊界
        if (collisionX < 0 || collisionY < 0 || 
            collisionX + this.collisionBox.width > world.width * world.tileSize || 
            collisionY + this.collisionBox.height > world.height * world.tileSize) {
            return false;
        }
        
        // 檢查地形是否可行走
        const tileSize = world.tileSize;
        const startTileX = Math.floor(collisionX / tileSize);
        const startTileY = Math.floor(collisionY / tileSize);
        const endTileX = Math.floor((collisionX + this.collisionBox.width) / tileSize);
        const endTileY = Math.floor((collisionY + this.collisionBox.height) / tileSize);
        
        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                if (tileY >= 0 && tileY < world.height && tileX >= 0 && tileX < world.width) {
                    const tile = world.getTile(tileX, tileY);
                    if (tile && !tile.walkable) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    checkNearbyResources(world) {
        if (!world) return;
        
        const tileSize = world.tileSize;
        const playerTileX = Math.floor((this.x + this.width / 2) / tileSize);
        const playerTileY = Math.floor((this.y + this.height / 2) / tileSize);
        
        // 檢查玩家周圍3x3範圍的資源
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = playerTileX + dx;
                const checkY = playerTileY + dy;
                
                if (checkX >= 0 && checkX < world.width && 
                    checkY >= 0 && checkY < world.height) {
                    
                    const terrain = world.getTile(checkX, checkY);
                    if (terrain && Math.random() < 0.001 * this.getGatherBonus()) {
                        // 隨機選擇該地形的一種資源
                        if (terrain.resources && terrain.resources.length > 0) {
                            const resource = terrain.resources[Math.floor(Math.random() * terrain.resources.length)];
                            if (resource) {
                                world.addResource(checkX, checkY, resource);
                            }
                        }
                    }
                }
            }
        }
    }

    updateStatus(deltaTime) {
        var hungerRate = 1 / 1000 * this.getHungerDecayRate();
        var thirstRate = 1.5 / 1000 * this.getThirstDecayRate();

        this.hunger = Math.max(0, this.hunger - hungerRate * deltaTime);
        this.thirst = Math.max(0, this.thirst - thirstRate * deltaTime);

        if (this.hunger <= 0 || this.thirst <= 0) {
            this.health = Math.max(0, this.health - 2 / 1000 * deltaTime);
        }

        // 處理狀態效果
        var that = this;
        this.activeEffects.forEach(function(effect) {
            if (effect.healthEffect) {
                that.health = Math.max(0, Math.min(100, that.health + effect.healthEffect / 1000 * deltaTime));
            }
        });
    }

    // 技能效果
    getGatherBonus() {
        return 1 + this.skills.gather * 0.1; // 每級增加10%
    }

    getHungerDecayRate() {
        return 1 - this.skills.hungerResist * 0.1; // 每級減少10%
    }

    getThirstDecayRate() {
        return 1 - this.skills.thirstResist * 0.1; // 每級減少10%
    }

    getEnvironmentResist() {
        return this.skills.environment * 0.1; // 每級增加10%
    }

    getStrength() {
        return this.skills.strength; // 每級增加1
    }

    addExp(amount) {
        this.exp += amount;
        while (this.exp >= this.getExpToLevel()) {
            this.levelUp();
        }
    }

    getExpToLevel() {
        return this.level * 100; // 每級需要100經驗
    }

    levelUp() {
        this.level += 1;
        this.skillPoints += 1;
        this.exp = 0;
    }

    spendSkillPoint(skill) {
        if (this.skillPoints > 0 && this.skills[skill] < 10) {
            this.skills[skill] += 1;
            this.skillPoints -= 1;
            return true;
        }
        return false;
    }
}
