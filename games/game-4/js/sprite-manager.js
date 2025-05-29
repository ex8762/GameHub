// 精靈管理器 - 處理遊戲中的所有精靈圖和動畫
export class SpriteManager {
    constructor() {
        this.sprites = new Map();
        this.animations = new Map();
        this.spriteSheets = new Map();
    }

    // 載入單個精靈
    loadSprite(name, url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                this.sprites.set(name, image);
                resolve(image);
            };
            image.onerror = (error) => {
                console.error(`無法載入精靈 ${name}:`, error);
                reject(error);
            };
            image.src = url;
        });
    }

    // 載入精靈表
    loadSpriteSheet(name, url, frameWidth, frameHeight, frameCount) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const spriteSheet = {
                    image,
                    frameWidth,
                    frameHeight,
                    frameCount,
                    columns: Math.floor(image.width / frameWidth),
                    rows: Math.ceil(frameCount / Math.floor(image.width / frameWidth))
                };
                this.spriteSheets.set(name, spriteSheet);
                resolve(spriteSheet);
            };
            image.onerror = (error) => {
                console.error(`無法載入精靈表 ${name}:`, error);
                reject(error);
            };
            image.src = url;
        });
    }

    // 創建動畫
    createAnimation(name, spriteSheetName, frameIndices, frameDuration, loop = true) {
        const spriteSheet = this.spriteSheets.get(spriteSheetName);
        if (!spriteSheet) {
            console.error(`精靈表 ${spriteSheetName} 不存在`);
            return null;
        }

        const animation = {
            spriteSheet,
            frameIndices,
            frameDuration,
            loop,
            currentFrame: 0,
            elapsedTime: 0,
            isPlaying: false
        };

        this.animations.set(name, animation);
        return animation;
    }

    // 播放動畫
    playAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.currentFrame = 0;
            animation.elapsedTime = 0;
            animation.isPlaying = true;
            return animation;
        }
        return null;
    }

    // 停止動畫
    stopAnimation(name) {
        const animation = this.animations.get(name);
        if (animation) {
            animation.isPlaying = false;
            return animation;
        }
        return null;
    }

    // 更新動畫
    updateAnimation(name, deltaTime) {
        const animation = this.animations.get(name);
        if (animation && animation.isPlaying) {
            animation.elapsedTime += deltaTime;
            
            if (animation.elapsedTime >= animation.frameDuration) {
                const frameAdvance = Math.floor(animation.elapsedTime / animation.frameDuration);
                animation.currentFrame = (animation.currentFrame + frameAdvance) % animation.frameIndices.length;
                animation.elapsedTime %= animation.frameDuration;
                
                if (!animation.loop && animation.currentFrame === animation.frameIndices.length - 1) {
                    animation.isPlaying = false;
                }
            }
            
            return animation.frameIndices[animation.currentFrame];
        }
        return null;
    }

    // 繪製精靈
    drawSprite(ctx, name, x, y, width, height) {
        const sprite = this.sprites.get(name);
        if (sprite) {
            ctx.drawImage(sprite, x, y, width || sprite.width, height || sprite.height);
            return true;
        }
        return false;
    }

    // 繪製精靈表中的幀
    drawSpriteFrame(ctx, sheetName, frameIndex, x, y, width, height) {
        const sheet = this.spriteSheets.get(sheetName);
        if (sheet) {
            const column = frameIndex % sheet.columns;
            const row = Math.floor(frameIndex / sheet.columns);
            
            const sourceX = column * sheet.frameWidth;
            const sourceY = row * sheet.frameHeight;
            
            ctx.drawImage(
                sheet.image,
                sourceX, sourceY,
                sheet.frameWidth, sheet.frameHeight,
                x, y,
                width || sheet.frameWidth, height || sheet.frameHeight
            );
            return true;
        }
        return false;
    }

    // 繪製動畫
    drawAnimation(ctx, name, x, y, width, height) {
        const animation = this.animations.get(name);
        if (animation && animation.isPlaying) {
            const frameIndex = animation.frameIndices[animation.currentFrame];
            return this.drawSpriteFrame(
                ctx,
                animation.spriteSheet.name,
                frameIndex,
                x, y,
                width, height
            );
        }
        return false;
    }
}

// 單例模式
let instance = null;
export function getSpriteManager() {
    if (!instance) {
        instance = new SpriteManager();
    }
    return instance;
}
