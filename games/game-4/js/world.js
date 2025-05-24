import { RESOURCE_TYPES } from './constants.js';

// 地形類型
const TERRAIN_TYPES = {
    GRASS: {
        id: 'grass',
        name: '草地',
        color: '#2ecc71',
        walkable: true
    },
    WATER: {
        id: 'water',
        name: '水',
        color: '#3498db',
        walkable: false
    },
    SAND: {
        id: 'sand',
        name: '沙地',
        color: '#f1c40f',
        walkable: true
    },
    FOREST: {
        id: 'forest',
        name: '森林',
        color: '#27ae60',
        walkable: true,
        resources: [RESOURCE_TYPES.WOOD, RESOURCE_TYPES.FIBER]
    },
    MOUNTAIN: {
        id: 'mountain',
        name: '山地',
        color: '#95a5a6',
        walkable: false,
        resources: [RESOURCE_TYPES.STONE]
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
            }
            return resource.type;
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
