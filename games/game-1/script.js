const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Update game elements that depend on WIDTH and HEIGHT if necessary
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial resize

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let player = { x: WIDTH / 2, y: HEIGHT - 70, width: 50, height: 50, speed: 5 };
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let enemyGenerationInterval = 0;
let explosionParticles = [];
let lastEnemySpawnTime = 0;

let moveLeft = false, moveRight = false;
// Touch controls
let touchStartX = null;
let touchEndX = null;
const touchThreshold = 30; // Minimum swipe distance to register as movement

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent screen scrolling
    touchStartX = e.touches[0].clientX;
    // For shooting on tap, you might want to differentiate taps from swipes
    // For simplicity, let's make any touch shoot for now, can be refined later
    shootBullet(); 
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault(); // Prevent screen scrolling
    if (touchStartX === null) return;
    touchEndX = e.touches[0].clientX;
    let diffX = touchEndX - touchStartX;

    if (diffX > touchThreshold) {
        moveRight = true;
        moveLeft = false;
    } else if (diffX < -touchThreshold) {
        moveLeft = true;
        moveRight = false;
    } else {
        moveLeft = false;
        moveRight = false;
    }
    // Update touchStartX for continuous movement if desired, or reset for discrete swipes
    // touchStartX = touchEndX; // Uncomment for continuous movement based on drag
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    moveLeft = false;
    moveRight = false;
    touchStartX = null;
    touchEndX = null;
}, { passive: false });


document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveLeft = true;
    if (e.key === 'ArrowRight') moveRight = true;
    if (e.key === ' ') shootBullet();
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') moveLeft = false;
    if (e.key === 'ArrowRight') moveRight = false;
});

function drawPlayer() {
    // Q版機身主體
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 23, 25, 0, 0, Math.PI * 2);
    const bodyGradient = ctx.createLinearGradient(-23, 0, 23, 0);
    bodyGradient.addColorStop(0, '#4CAF50');
    bodyGradient.addColorStop(1, '#388E3C');
    ctx.fillStyle = bodyGradient;
    ctx.shadowColor = '#4CAF50';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    // 機艙（圓形窗戶）
    ctx.beginPath();
    ctx.arc(0, -7, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#b3e5fc';
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(-3, -10, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.5;
    ctx.fill();
    ctx.globalAlpha = 1;
    // 左右機翼
    ctx.beginPath();
    ctx.moveTo(-23, 5);
    ctx.lineTo(-38, 20);
    ctx.lineTo(-10, 18);
    ctx.closePath();
    ctx.fillStyle = '#81c784';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(23, 5);
    ctx.lineTo(38, 20);
    ctx.lineTo(10, 18);
    ctx.closePath();
    ctx.fillStyle = '#81c784';
    ctx.fill();
    // 尾翼
    ctx.beginPath();
    ctx.moveTo(0, 25);
    ctx.lineTo(-7, 38);
    ctx.lineTo(7, 38);
    ctx.closePath();
    ctx.fillStyle = '#2e7d32';
    ctx.fill();
    // 裝飾條紋
    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.lineTo(10, 10);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#fffde7';
    ctx.stroke();
    ctx.restore();
}

function shootBullet() {
    if (gameOver) return;
    bullets.push({ x: player.x + player.width / 2 - 5, y: player.y, width: 10, height: 20, speed: 6.5 });
}

function drawBullets() {
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) return false;
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.rect(bullet.x, bullet.y, bullet.width, bullet.height * 2);
        ctx.fill();
        const gradient = ctx.createLinearGradient(bullet.x, bullet.y, bullet.x, bullet.y + 20);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 20);
        return true;
    });
}

let ENEMY_SPAWN_INTERVAL = 2000 - Math.floor(score / 100) * 50;
if (ENEMY_SPAWN_INTERVAL < 500) ENEMY_SPAWN_INTERVAL = 500;

function spawnEnemy() {
    const currentTime = Date.now();
    if (currentTime - lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
        const enemy = createEnemy(Math.floor(Math.random() * 3));
        enemies.push(enemy);
        lastEnemySpawnTime = currentTime;
    }
}

function createEnemy(type) {
    const speedMultiplier = 1 + Math.floor(score / 200) * 0.5;
    const baseEnemy = { x: Math.random() * (WIDTH - 50), y: -50, width: 50, height: 50, bullets: [] };
    switch (type) {
        case 0: return { ...baseEnemy, speed: 1.5 * speedMultiplier, type: 'normal' };
        case 1: return { ...baseEnemy, speed: 2.5 * speedMultiplier, type: 'fast' };
        case 2: return { ...baseEnemy, speed: 1.8 * speedMultiplier, type: 'shooter', shooting: true, lastShot: 0 };
        default: return { ...baseEnemy, speed: 1.5 * speedMultiplier, type: 'normal' };
    }
}

const MAX_PARTICLES = 200;
function spawnExplosion(x, y) {
    if (explosionParticles.length < MAX_PARTICLES) {
        for (let i = 0; i < 10; i++) {
            explosionParticles.push({
                x, y,
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
    explosionParticles = explosionParticles.filter(explosion => {
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(explosion.x, explosion.y, 0, explosion.x, explosion.y, explosion.size);
        gradient.addColorStop(0, explosion.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
        explosion.x += explosion.dx;
        explosion.y += explosion.dy;
        explosion.size += 0.2;
        explosion.life--;
        return explosion.life > 0;
    });
}

function drawEnemies() {
    for (let index = enemies.length - 1; index >= 0; index--) {
        const enemy = enemies[index];
        enemy.y += enemy.speed;
        if (enemy.y > HEIGHT) gameOver = true;
        enemy.y += Math.sin(Date.now() * 0.005 + index) * 0.3;
        // Q版敵人繪製
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        if (enemy.type === 'normal') {
            // Q版圓形身體
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.fillStyle = '#ffb6b9';
            ctx.shadowColor = '#ffb6b9';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            // 大眼睛
            ctx.beginPath();
            ctx.arc(-8, -5, 7, 0, Math.PI * 2);
            ctx.arc(8, -5, 7, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-8, -5, 3, 0, Math.PI * 2);
            ctx.arc(8, -5, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            // 微笑嘴巴
            ctx.beginPath();
            ctx.arc(0, 8, 8, 0, Math.PI);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e75480';
            ctx.stroke();
        } else if (enemy.type === 'fast') {
            // Q版黃色橢圓身體
            ctx.beginPath();
            ctx.ellipse(0, 0, 23, 18, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ffe066';
            ctx.shadowColor = '#ffe066';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            // 大眼睛
            ctx.beginPath();
            ctx.arc(-7, -4, 6, 0, Math.PI * 2);
            ctx.arc(7, -4, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-7, -4, 2.5, 0, Math.PI * 2);
            ctx.arc(7, -4, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            // 嘟嘴
            ctx.beginPath();
            ctx.arc(0, 6, 5, 0, Math.PI, false);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e67e22';
            ctx.stroke();
        } else if (enemy.type === 'shooter') {
            // Q版藍色圓身體
            ctx.beginPath();
            ctx.arc(0, 0, 22, 0, Math.PI * 2);
            ctx.fillStyle = '#6ec6f3';
            ctx.shadowColor = '#6ec6f3';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            // 大眼睛
            ctx.beginPath();
            ctx.arc(-6, -6, 6, 0, Math.PI * 2);
            ctx.arc(6, -6, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-6, -6, 2.5, 0, Math.PI * 2);
            ctx.arc(6, -6, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            // 驚訝嘴巴
            ctx.beginPath();
            ctx.arc(0, 7, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 7, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();
            // 頂部小天線
            ctx.beginPath();
            ctx.moveTo(0, -22);
            ctx.lineTo(0, -30);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, -30, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
        ctx.restore();
        // 碰撞與子彈、敵人子彈繪製維持原本
        if (enemy.type === 'shooter' && Math.random() < 0.015 && enemy.lastShot <= 0) {
            shootEnemyBullet(enemy);
            enemy.lastShot = 60;
        }
        if (enemy.lastShot > 0) enemy.lastShot--;
        for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
            const bullet = bullets[bIndex];
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                let points = enemy.type === 'normal' ? 10 : enemy.type === 'fast' ? 15 : 20;
                score += points;
                enemies.splice(index, 1);
                bullets.splice(bIndex, 1);
                spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                break;
            }
        }
        enemy.bullets.forEach((bullet, bIndex) => {
            if (bullet.x < player.x + player.width && bullet.x + bullet.width > player.x &&
                bullet.y < player.y + player.height && bullet.y + bullet.height > player.y) {
                gameOver = true;
            }
            bullet.y += bullet.speed;
            if (bullet.y > HEIGHT) enemy.bullets.splice(bIndex, 1);
            ctx.fillStyle = 'red';
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }
}
for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];
    enemy.y += enemy.speed;
    if (enemy.y > HEIGHT) gameOver = true;
    enemy.y += Math.sin(Date.now() * 0.005 + index) * 0.5;
    ctx.fillStyle = enemy.type === 'normal' ? 'red' : enemy.type === 'fast' ? 'yellow' : 'blue';
    ctx.beginPath();
    if (enemy.type === 'normal') {
        ctx.rect(enemy.x, enemy.y, enemy.width, enemy.height);
    } else if (enemy.type === 'fast') {
        ctx.moveTo(enemy.x + 25, enemy.y);
        ctx.lineTo(enemy.x, enemy.y + 50);
        ctx.lineTo(enemy.x + 50, enemy.y + 50);
        ctx.closePath();
    } else if (enemy.type === 'shooter') {
        ctx.rect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.rect(enemy.x + 20, enemy.y + enemy.height, 10, 10);
    }
    ctx.fill();
    if (enemy.type === 'shooter' && Math.random() < 0.02 && enemy.lastShot <= 0) {
        shootEnemyBullet(enemy);
        enemy.lastShot = 60;
    }
    if (enemy.lastShot > 0) enemy.lastShot--;
    for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = bullets[bIndex];
        if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
            enemies.splice(index, 1);
            bullets.splice(bIndex, 1);
            score += 10;
            spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            break;
        }
    }
    enemy.bullets.forEach((bullet, bIndex) => {
        if (bullet.x < player.x + player.width && bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height && bullet.y + bullet.height > player.y) {
            gameOver = true;
        }
        bullet.y += bullet.speed;
        if (bullet.y > HEIGHT) enemy.bullets.splice(bIndex, 1);
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
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
    ctx.fillText(`分數: ${score}`, 20, 35);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(WIDTH / 2 - 150, HEIGHT / 2 - 100, 300, 200);
    ctx.strokeStyle = 'white';
    ctx.strokeRect(WIDTH / 2 - 150, HEIGHT / 2 - 100, 300, 200);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText('遊戲結束!', WIDTH / 2 - 100, HEIGHT / 2 - 30);
    ctx.font = '30px Arial';
    ctx.fillText(`最終分數: ${score}`, WIDTH / 2 - 90, HEIGHT / 2 + 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(WIDTH / 2 - 50, HEIGHT / 2 + 50, 100, 40);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('重玩', WIDTH / 2 - 25, HEIGHT / 2 + 75);
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        if (clickX > WIDTH / 2 - 50 && clickX < WIDTH / 2 + 50 &&
            clickY > HEIGHT / 2 + 50 && clickY < HEIGHT / 2 + 90) {
            location.reload();
        }
    }, { once: true });
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

function updateGame() {
    if (gameOver) {
        drawGameOver();
        return;
    }
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (moveLeft && player.x > 0) player.x -= player.speed;
    if (moveRight && player.x + player.width < WIDTH) player.x += player.speed;
    drawBackground();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawExplosions();
    drawScore();
    spawnEnemy();
    if (enemyGenerationInterval > 0) enemyGenerationInterval--;
    requestAnimationFrame(updateGame);
}
updateGame();