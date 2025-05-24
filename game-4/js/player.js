import { GAME_CONFIG, STATUS_EFFECTS } from './constants.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
        this.speed = 5;
        this.size = 32;

        // 玩家狀態
        this.health = GAME_CONFIG.INITIAL_HEALTH;
        this.hunger = GAME_CONFIG.INITIAL_HUNGER;
        this.thirst = GAME_CONFIG.INITIAL_THIRST;
        this.temperature = 20; // 攝氏度
        
        // 狀態效果
        this.activeEffects = new Set();
        
        // 移動控制
        this.controls = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.controls.up = true;
                break;
            case 's':
            case 'arrowdown':
                this.controls.down = true;
                break;
            case 'a':
            case 'arrowleft':
                this.controls.left = true;
                break;
            case 'd':
            case 'arrowright':
                this.controls.right = true;
                break;
        }
    }

    handleKeyUp(event) {
        switch(event.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                this.controls.up = false;
                break;
            case 's':
            case 'arrowdown':
                this.controls.down = false;
                break;
            case 'a':
            case 'arrowleft':
                this.controls.left = false;
                break;
            case 'd':
            case 'arrowright':
                this.controls.right = false;
                break;
        }
    }

    update(deltaTime, world) {
        // 更新移動
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (this.controls.up) this.velocity.y = -this.speed;
        if (this.controls.down) this.velocity.y = this.speed;
        if (this.controls.left) this.velocity.x = -this.speed;
        if (this.controls.right) this.velocity.x = this.speed;

        // 對角線移動速度規範化
        if (this.velocity.x !== 0 && this.velocity.y !== 0) {
            const normalizer = Math.sqrt(2);
            this.velocity.x /= normalizer;
            this.velocity.y /= normalizer;
        }

        // 碰撞檢測和位置更新
        const newX = this.x + this.velocity.x;
        const newY = this.y + this.velocity.y;

        // 檢查新位置是否有效
        if (world.isValidPosition(newX, this.y)) {
            this.x = newX;
        }
        if (world.isValidPosition(this.x, newY)) {
            this.y = newY;
        }

        // 更新狀態
        this.updateStatus(deltaTime);
    }

    updateStatus(deltaTime) {
        // 每秒更新一次狀態
        const secondsPassed = deltaTime / 1000;

        // 更新飢餓和口渴
        this.hunger = Math.max(0, this.hunger - 0.1 * secondsPassed);
        this.thirst = Math.max(0, this.thirst - 0.15 * secondsPassed);

        // 檢查狀態效果
        if (this.hunger <= 30) {
            this.addEffect(STATUS_EFFECTS.HUNGER);
        } else {
            this.removeEffect(STATUS_EFFECTS.HUNGER);
        }

        if (this.thirst <= 20) {
            this.addEffect(STATUS_EFFECTS.THIRST);
        } else {
            this.removeEffect(STATUS_EFFECTS.THIRST);
        }

        // 應用狀態效果
        for (const effect of this.activeEffects) {
            this.health = Math.max(0, this.health + effect.healthEffect * secondsPassed);
        }
    }

    addEffect(effect) {
        this.activeEffects.add(effect);
    }

    removeEffect(effect) {
        this.activeEffects.delete(effect);
    }

    heal(amount) {
        this.health = Math.min(GAME_CONFIG.INITIAL_HEALTH, this.health + amount);
    }

    damage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health <= 0;
    }

    eat(food) {
        this.hunger = Math.min(GAME_CONFIG.INITIAL_HUNGER, this.hunger + food.nutritionalValue);
    }

    drink(water) {
        this.thirst = Math.min(GAME_CONFIG.INITIAL_THIRST, this.thirst + water.hydrationValue);
    }

    draw(ctx, camera) {
        // 轉換到相機空間
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // 繪製玩家
        ctx.fillStyle = '#3498db';
        ctx.fillRect(screenX - this.size/2, screenY - this.size/2, this.size, this.size);

        // 如果有狀態效果，顯示指示器
        if (this.activeEffects.size > 0) {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(screenX + this.size/2, screenY - this.size/2, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
