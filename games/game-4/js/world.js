import { RESOURCE_TYPES } from './constants.js';

// 地形類型
const TERRAIN_TYPES = {
    GRASS: {
        id: 'grass',
        name: '草地',
        color: '#2ecc71',
        walkable: true,
        resources: [RESOURCE_TYPES.FIBER]
    },
    WATER: {
        id: 'water',
        name: '水',
        color: '#3498db',
        walkable: false,
        resources: [RESOURCE_TYPES.WATER, RESOURCE_TYPES.FISH]
    },
    SAND: {
        id: 'sand',
        name: '沙地',
        color: '#f1c40f',
        walkable: true,
        resources: [RESOURCE_TYPES.STONE]
    },
    FOREST: {
        id: 'forest',
        name: '森林',
        color: '#27ae60',
        walkable: true,
        resources: [RESOURCE_TYPES.WOOD, RESOURCE_TYPES.FIBER, RESOURCE_TYPES.BERRIES]
    },
    MOUNTAIN: {
        id: 'mountain',
        name: '山地',
        color: '#95a5a6',
        walkable: false,
        resources: [RESOURCE_TYPES.STONE, RESOURCE_TYPES.IRON_ORE, RESOURCE_TYPES.GOLD_ORE]
    },
    CAVE: {
        id: 'cave',
        name: '洞穴',
        color: '#34495e',
        walkable: true,
        resources: [RESOURCE_TYPES.COAL, RESOURCE_TYPES.IRON_ORE]
    },
    MUSHROOM: {
        id: 'mushroom',
        name: '蘑菇地',
        color: '#8e44ad',
        walkable: true,
        resources: [RESOURCE_TYPES.MUSHROOM]
    }
};

export class World {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tileSize = 32;
        this.tiles = [];
        this.resources = new Map();
        this.generateWorld();
    }

    generateWorld() {
        // 使用柏林噪聲生成地形
        const noise = new SimplexNoise();
        
        // 生成基礎地形
        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                const elevation = noise.noise2D(x * 0.05, y * 0.05);
                const moisture = noise.noise2D(x * 0.03 + 1000, y * 0.03 + 1000);

                this.tiles[y][x] = this.determineTerrain(elevation, moisture);
                
                // 如果地形可以包含資源，隨機生成資源
                if (this.tiles[y][x].resources && Math.random() < 0.3) {
                    const resource = this.tiles[y][x].resources[
                        Math.floor(Math.random() * this.tiles[y][x].resources.length)
                    ];
                    this.resources.set(`${x},${y}`, {
                        type: resource,
                        amount: Math.floor(Math.random() * 5) + 1
                    });
                }
            }
        }
    }

    determineTerrain(elevation, moisture) {
        if (elevation < -0.3) {
            return TERRAIN_TYPES.WATER;
        } else if (elevation < -0.1) {
            return TERRAIN_TYPES.SAND;
        } else if (elevation > 0.3) {
            return TERRAIN_TYPES.MOUNTAIN;
        } else if (moisture > 0.2) {
            return TERRAIN_TYPES.FOREST;
        } else {
            return TERRAIN_TYPES.GRASS;
        }
    }

    isValidPosition(x, y) {
        const tileX = Math.floor(x / this.tileSize);
        const tileY = Math.floor(y / this.tileSize);

        // 檢查是否在世界邊界內
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
            return false;
        }

        // 檢查地形是否可行走
        return this.tiles[tileY][tileX].walkable;
    }

    getResource(x, y) {
        const key = `${Math.floor(x / this.tileSize)},${Math.floor(y / this.tileSize)}`;
        return this.resources.get(key);
    }

    removeResource(x, y) {
        const key = `${Math.floor(x / this.tileSize)},${Math.floor(y / this.tileSize)}`;
        const resource = this.resources.get(key);
        if (resource) {
            resource.amount--;
            if (resource.amount <= 0) {
                this.resources.delete(key);
                
                // 一定機率在附近隨機生成新資源
                if (Math.random() < 0.3) {
                    setTimeout(() => {
                        this.generateResourceNearby(x, y);
                    }, Math.random() * 30000 + 10000); // 10-40秒後重生
                }
            }
            return resource.type;
        }
        return null;
    }
    
    // 在世界中隨機位置生成資源
    generateRandomResource() {
        // 隨機選擇一個位置
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        
        // 確認該位置沒有資源且地形可行走
        const key = `${x},${y}`;
        if (!this.resources.has(key) && this.tiles[y] && this.tiles[y][x] && this.tiles[y][x].walkable) {
            const terrain = this.tiles[y][x];
            
            // 從該地形可生成的資源中隨機選擇
            if (terrain.resources && terrain.resources.length > 0) {
                const resourceType = terrain.resources[Math.floor(Math.random() * terrain.resources.length)];
                
                // 添加資源
                this.resources.set(key, {
                    type: resourceType,
                    amount: Math.floor(Math.random() * 3) + 1 // 1-3個資源
                });
                
                return { x, y, resourceType };
            }
        }
        
        return null;
    }
    
    // 在指定位置附近生成資源
    generateResourceNearby(centerX, centerY, radius = 3) {
        // 轉換為格子座標
        const tileX = Math.floor(centerX / this.tileSize);
        const tileY = Math.floor(centerY / this.tileSize);
        
        // 嘗試10次在附近找位置
        for (let attempts = 0; attempts < 10; attempts++) {
            // 在半徑範圍內隨機選擇一個位置
            const offsetX = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            const offsetY = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            
            const newX = tileX + offsetX;
            const newY = tileY + offsetY;
            
            // 確認位置在世界範圍內
            if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                const key = `${newX},${newY}`;
                
                // 確認該位置沒有資源且地形可行走
                if (!this.resources.has(key) && this.tiles[newY][newX].walkable) {
                    const terrain = this.tiles[newY][newX];
                    
                    // 從該地形可生成的資源中隨機選擇
                    if (terrain.resources && terrain.resources.length > 0) {
                        const resourceType = terrain.resources[Math.floor(Math.random() * terrain.resources.length)];
                        
                        // 添加資源
                        this.resources.set(key, {
                            type: resourceType,
                            amount: Math.floor(Math.random() * 3) + 1 // 1-3個資源
                        });
                        
                        return { x: newX, y: newY, resourceType };
                    }
                }
            }
        }
        
        return null;
    }

    draw(ctx, camera) {
        // 計算可見區域
        const startX = Math.max(0, Math.floor(camera.x / this.tileSize));
        const startY = Math.max(0, Math.floor(camera.y / this.tileSize));
        const endX = Math.min(this.width, Math.ceil((camera.x + camera.width) / this.tileSize));
        const endY = Math.min(this.height, Math.ceil((camera.y + camera.height) / this.tileSize));

        // 繪製地形
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const screenX = x * this.tileSize - camera.x;
                const screenY = y * this.tileSize - camera.y;

                // 繪製地形
                ctx.fillStyle = this.tiles[y][x].color;
                ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);

                // 如果有資源，繪製資源圖示
                const resource = this.resources.get(`${x},${y}`);
                if (resource) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(
                        resource.type.icon,
                        screenX + this.tileSize / 2,
                        screenY + this.tileSize / 2
                    );
                }
            }
        }
    }

    save() {
        return {
            width: this.width,
            height: this.height,
            tileSize: this.tileSize,
            tiles: this.tiles,
            resources: Array.from(this.resources.entries())
        };
    }

    load(data) {
        if (data) {
            this.width = data.width;
            this.height = data.height;
            this.tileSize = data.tileSize;
            this.tiles = data.tiles;
            this.resources = new Map(data.resources);
        }
    }
}

// 柏林噪聲的簡單實現
class SimplexNoise {
    constructor() {
        this.grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
    }

    noise2D(xin, yin) {
        // 簡化版的2D噪聲實現
        const n0 = xin * 0.5 + yin * 0.5;
        const n1 = Math.sin(xin) * 0.5;
        const n2 = Math.cos(yin) * 0.5;
        return (n0 + n1 + n2) / 2;
    }
}
