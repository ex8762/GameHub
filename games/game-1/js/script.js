const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

function resizeCanvas() {
    // 響應式自適應，維持2:3比例，支援高DPI
    const logicalWidth = 480;
    const logicalHeight = 720;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = '100vw';
    canvas.style.height = 'calc(100vw * 1.5)';
    // 若螢幕較高，則以高度為主
    if (window.innerHeight / window.innerWidth < 1.5) {
        canvas.style.height = '100vh';
        canvas.style.width = (window.innerHeight / 1.5) + 'px';
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize

const WIDTH = 480;
const HEIGHT = 720;

let gameState = {
    player: { x: WIDTH / 2, y: HEIGHT - 70, width: 40, height: 40, speed: 5 },
    bullets: [],
    enemies: [],
    score: 0,
    gameOver: false,
    lastEnemySpawnTime: 0,
    explosionParticles: [],
    controls: {
        moveLeft: false,
        moveRight: false,
        touchStartX: null,
        touchEndX: null
    },
    lastShootTime: 0
};

const touchThreshold = 30;
let autoShootInterval = null;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const x = e.touches[0].clientX;
    const screenWidth = window.innerWidth;
    // 左1/3移動左，右1/3移動右，中間射擊
    if (x < screenWidth / 3) {
        gameState.controls.moveLeft = true;
        gameState.controls.moveRight = false;
    } else if (x > screenWidth * 2 / 3) {
        gameState.controls.moveRight = true;
        gameState.controls.moveLeft = false;
    } else {
        shootBullet();
        // 長按自動連發
        autoShootInterval = setInterval(shootBullet, 200);
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    gameState.controls.moveLeft = false;
    gameState.controls.moveRight = false;
    if (autoShootInterval) {
        clearInterval(autoShootInterval);
        autoShootInterval = null;
    }
}, { passive: false });

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') gameState.controls.moveLeft = true;
    if (e.key === 'ArrowRight') gameState.controls.moveRight = true;
    if (e.key === ' ') shootBullet();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') gameState.controls.moveLeft = false;
    if (e.key === 'ArrowRight') gameState.controls.moveRight = false;
});

function drawPlayer() {
    ctx.save();
    // 動態根據玩家寬高置中
    const w = gameState.player.width;
    const h = gameState.player.height;
    ctx.translate(gameState.player.x + w / 2, gameState.player.y + h / 2);
    // 主體
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2);
    const bodyGradient = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    bodyGradient.addColorStop(0, '#4CAF50');
    bodyGradient.addColorStop(1, '#388E3C');
    ctx.fillStyle = bodyGradient;
    ctx.shadowColor = '#4CAF50';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // 機艙（圓形窗戶）
    ctx.beginPath();
    ctx.arc(0, -h / 4, w / 6, 0, Math.PI * 2);
    ctx.fillStyle = '#b3e5fc';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(-w / 8, -h / 3.2, w / 16, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    // 左右機翼
    ctx.beginPath();
    ctx.moveTo(-w / 2, h / 8);
    ctx.lineTo(-w * 0.8, h / 2.5);
    ctx.lineTo(-w / 5, h / 2.2);
    ctx.closePath();
    ctx.fillStyle = '#81c784';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w / 2, h / 8);
    ctx.lineTo(w * 0.8, h / 2.5);
    ctx.lineTo(w / 5, h / 2.2);
    ctx.closePath();
    ctx.fillStyle = '#81c784';
    ctx.fill();
    // 尾翼
    ctx.beginPath();
    ctx.moveTo(0, h / 2 - 2);
    ctx.lineTo(-w / 6, h / 2 + h / 6);
    ctx.lineTo(w / 6, h / 2 + h / 6);
    ctx.closePath();
    ctx.fillStyle = '#2e7d32';
    ctx.fill();
    // 裝飾條紋
    ctx.beginPath();
    ctx.moveTo(-w / 5, h / 5);
    ctx.lineTo(w / 5, h / 5);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fffde7';
    ctx.stroke();
    ctx.restore();
}

const SHOOT_COOLDOWN = 300;

function shootBullet() {
    if (gameState.gameOver) return;
    const now = Date.now();
    if (now - gameState.lastShootTime < SHOOT_COOLDOWN) return;
    gameState.lastShootTime = now;
    gameState.bullets.push({ x: gameState.player.x + gameState.player.width / 2 - 5, y: gameState.player.y, width: 10, height: 20, speed: 6.5 });
}

function drawBullets() {
    gameState.bullets.forEach(bullet => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) return;
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.rect(bullet.x, bullet.y, bullet.width, bullet.height * 2);
        ctx.fill();
        const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + 20);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 20);
    });
}

function spawnEnemy() {
    const currentTime = Date.now();
    const spawnInterval = Math.max(800, 2200 - Math.floor(gameState.score / 100) * 60);

    if (currentTime - gameState.lastEnemySpawnTime > spawnInterval) {
        const enemy = createEnemy(Math.floor(Math.random() * 3));
        gameState.enemies.push(enemy);
        gameState.lastEnemySpawnTime = currentTime;
    }
}

function createEnemy(type) {
    const speedMultiplier = 1 + Math.floor(gameState.score / 200) * 0.5;
    const baseEnemy = { x: Math.random() * (WIDTH - 40), y: -40, width: 40, height: 40, bullets: [] };
    switch (type) {
        case 0:
            return {...baseEnemy, speed: 1.5 * speedMultiplier, type: 'normal' };
        case 1:
            return {...baseEnemy, speed: 2.2 * speedMultiplier, type: 'fast' };
        case 2:
            return {...baseEnemy, speed: 1.6 * speedMultiplier, type: 'shooter', shooting: true, lastShot: 0 };
        default:
            return {...baseEnemy, speed: 1.5 * speedMultiplier, type: 'normal' };
    }
}

function spawnExplosion(x, y) {
    if (gameState.explosionParticles.length < 200) {
        for (let i = 0; i < 10; i++) {
            gameState.explosionParticles.push({
                x,
                y,
                life: 30,
                size: Math.random() * 5 + 2,
                dx: Math.random() * 4 - 2,
                dy: Math.random() * 4 - 2,
                color: Math.random() > 0.5 ? 'orange' : 'red'
            });
        }
    }
}

function drawExplosions() {
    gameState.explosionParticles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

function drawEnemies() {
    gameState.enemies.forEach((enemy, enemyIndex) => {
        enemy.y += enemy.speed;
        if (enemy.y > HEIGHT) gameState.gameOver = true;
        enemy.y += Math.sin(Date.now() * 0.005 + Math.random() * 0.5) * 0.3;

        // Q版敵人繪製
        ctx.save();
        const ew = enemy.width;
        const eh = enemy.height;
        ctx.translate(enemy.x + ew / 2, enemy.y + eh / 2);
        if (enemy.type === 'normal') {
            // Q版圓形身體
            ctx.beginPath();
            ctx.arc(0, 0, ew / 2 - 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffb6b9';
            ctx.shadowColor = '#ffb6b9';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            // 大眼睛
            ctx.beginPath();
            ctx.arc(-ew / 5, -eh / 8, ew / 6, 0, Math.PI * 2);
            ctx.arc(ew / 5, -eh / 8, ew / 6, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-ew / 5, -eh / 8, ew / 12, 0, Math.PI * 2);
            ctx.arc(ew / 5, -eh / 8, ew / 12, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            // 微笑嘴巴
            ctx.beginPath();
            ctx.arc(0, eh / 6, ew / 4, 0, Math.PI);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e75480';
            ctx.stroke();
        } else if (enemy.type === 'fast') {
            // Q版黃色橢圓身體
            ctx.beginPath();
            ctx.ellipse(0, 0, ew / 2 - 2, eh / 2.2, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ffe066';
            ctx.shadowColor = '#ffe066';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            // 大眼睛
            ctx.beginPath();
            ctx.arc(-ew / 5, -eh / 8, ew / 7, 0, Math.PI * 2);
            ctx.arc(ew / 5, -eh / 8, ew / 7, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-ew / 5, -eh / 8, ew / 16, 0, Math.PI * 2);
            ctx.arc(ew / 5, -eh / 8, ew / 16, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            // 嘟嘴
            ctx.beginPath();
            ctx.arc(0, eh / 6, ew / 6, 0, Math.PI, false);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e67e22';
            ctx.stroke();
        } else if (enemy.type === 'shooter') {
            // Q版藍色圓身體
            ctx.beginPath();
            ctx.arc(0, 0, ew / 2 - 2, 0, Math.PI * 2);
            ctx.fillStyle = '#6ec6f3';
            ctx.shadowColor = '#6ec6f3';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            // 大眼睛
            ctx.beginPath();
            ctx.arc(-ew / 5.5, -eh / 6, ew / 7, 0, Math.PI * 2);
            ctx.arc(ew / 5.5, -eh / 6, ew / 7, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-ew / 5.5, -eh / 6, ew / 16, 0, Math.PI * 2);
            ctx.arc(ew / 5.5, -eh / 6, ew / 16, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            // 驚訝嘴巴
            ctx.beginPath();
            ctx.arc(0, eh / 5, ew / 10, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, eh / 5, ew / 20, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            // 頂部小天線
            ctx.beginPath();
            ctx.moveTo(0, -eh / 2 + 2);
            ctx.lineTo(0, -eh / 2 - eh / 6);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, -eh / 2 - eh / 6, ew / 20, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
        ctx.restore();

        // 敵人射擊邏輯
        if (enemy.type === 'shooter' && Math.random() < 0.015 && enemy.lastShot <= 0) {
            shootEnemyBullet(enemy);
            enemy.lastShot = 60;
        }
        if (enemy.lastShot > 0) enemy.lastShot--;

        // 檢查玩家子彈與敵人的碰撞
        for (let bIndex = gameState.bullets.length - 1; bIndex >= 0; bIndex--) {
            const bullet = gameState.bullets[bIndex];
            if (checkCollision(bullet, enemy)) {
                let points = enemy.type === 'normal' ? 10 : enemy.type === 'fast' ? 15 : 20;
                gameState.score += points;
                gameState.enemies.splice(enemyIndex, 1);
                gameState.bullets.splice(bIndex, 1);
                spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                break;
            }
        }

        // 檢查敵人子彈與玩家的碰撞
        for (let bIndex = enemy.bullets.length - 1; bIndex >= 0; bIndex--) {
            const bullet = enemy.bullets[bIndex];
            if (checkCollision(bullet, gameState.player)) {
                gameState.gameOver = true;
                enemy.bullets.splice(bIndex, 1);
                break;
            }
            bullet.y += bullet.speed;
            if (bullet.y > HEIGHT) {
                enemy.bullets.splice(bIndex, 1);
            } else {
                ctx.fillStyle = 'red';
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
        }
    });
}

function shootEnemyBullet(enemy) {
    // 藍色敵人（shooter）子彈速度提升
    let speed = 4.5;
    if (enemy.type === 'shooter') speed = 8.5;
    enemy.bullets.push({ x: enemy.x + enemy.width / 2 - 5, y: enemy.y + enemy.height, width: 10, height: 20, speed });
}

function drawScore() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 150, 40);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(10, 10, 150, 40);
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`分數: ${gameState.score}`, 20, 35);
}

function drawGameOver() {
    if (gameState.gameOver) {
        gameOverScreen.classList.remove('hidden');
        finalScoreElement.textContent = gameState.score;
    }
}

let stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        size: Math.random() * 2
    });
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, '#1e3c72');
    gradient.addColorStop(1, '#2a5298');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'white';
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updatePlayer() {
    if (gameState.controls.moveLeft && gameState.player.x > 0) {
        gameState.player.x -= gameState.player.speed;
    }
    if (gameState.controls.moveRight && gameState.player.x < WIDTH - gameState.player.width) {
        gameState.player.x += gameState.player.speed;
    }
}

function updateBullets() {
    gameState.bullets = gameState.bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > 0;
    });
}

function updateEnemies() {
    gameState.enemies = gameState.enemies.filter(enemy => {
        enemy.y += enemy.speed;

        if (enemy.y > HEIGHT) {
            gameState.gameOver = true;
            return false;
        }

        // 檢查碰撞
        if (checkCollision(enemy, gameState.player)) {
            gameState.gameOver = true;
            return false;
        }

        // 檢查子彈碰撞
        gameState.bullets = gameState.bullets.filter(bullet => {
            if (checkCollision(bullet, enemy)) {
                spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                gameState.score += 10;
                return false;
            }
            return true;
        });

        return true;
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y;
}

function updateExplosions() {
    gameState.explosionParticles = gameState.explosionParticles.filter(particle => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.size += 0.2;
        particle.life--;
        return particle.life > 0;
    });
}

function gameLoop() {
    if (!gameState.gameOver) {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        updatePlayer();
        updateBullets();
        spawnEnemy();
        updateEnemies();
        updateExplosions();

        drawBackground();
        drawBullets();
        drawEnemies();
        drawPlayer();
        drawExplosions();
        drawScore();
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

function initGame() {
    resizeCanvas();
    // 玩家置中且貼近底部
    gameState.player.x = WIDTH / 2 - gameState.player.width / 2;
    gameState.player.y = HEIGHT - gameState.player.height - 10;
    gameState.bullets = [];
    gameState.enemies = [];
    gameState.score = 0;
    gameState.gameOver = false;
    gameState.explosionParticles = [];
    gameState.lastShootTime = 0;
    gameOverScreen.classList.add('hidden');
}

function setupEventListeners() {
    window.addEventListener('resize', resizeCanvas);
    restartButton.addEventListener('click', initGame);
}

initGame();
setupEventListeners();
gameLoop();