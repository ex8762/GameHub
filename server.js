const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { promisify } = require('util');

// 使用 Promise 版本的 fs 函數
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);

// 創建Express應用
const app = express();
const PORT = process.env.PORT || 3000;

// 安全性中間件
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdnjs.cloudflare.com", "cdn.jsdelivr.net", "*.google-analytics.com", "*.googletagmanager.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "cdn.jsdelivr.net", "fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "blob:", "*"],
            fontSrc: ["'self'", "cdnjs.cloudflare.com", "fonts.gstatic.com", "*.fontawesome.com"],
            connectSrc: ["'self'", "*.google-analytics.com", "*.doubleclick.net"],
            frameSrc: ["'self'", "*.youtube.com", "*.vimeo.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "blob:", "data:"],
            workerSrc: ["'self'", "blob:"],
        },
    },
}));

// API 請求限制 - 防止濫用
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分鐘
    max: 100, // 每個IP 15分鐘內最多100次請求
    standardHeaders: true,
    legacyHeaders: false,
    message: '請求過多，請稍後再試'
});

// 日誌記錄
app.use(morgan('tiny'));

// 基本中間件
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '/'), {
    maxAge: '1d', // 靜態資源快取1天
    etag: true
}));

// 評論數據存儲路徑
const commentsFilePath = path.join(__dirname, 'data', 'comments.json');

// 初始化資料目錄和檔案
async function initializeDataFiles() {
    try {
        // 確保 data 目錄存在
        const dataDir = path.join(__dirname, 'data');
        if (!await existsAsync(dataDir)) {
            await mkdirAsync(dataDir);
        }

        // 確保評論文件存在
        if (!await existsAsync(commentsFilePath)) {
            const initialComments = {
                'shooting-game': [],
                'simulation-game': [],
                'cafe-game': []
            };
            await writeFileAsync(commentsFilePath, JSON.stringify(initialComments, null, 2));
        }

        // 確保錯誤日誌目錄存在
        if (!await existsAsync(errorLogsPath)) {
            await mkdirAsync(errorLogsPath, { recursive: true });
        }

        console.log('資料目錄和檔案初始化完成');
    } catch (error) {
        console.error('初始化資料目錄和檔案失敗:', error);
    }
}

// 啟動時執行初始化
initializeDataFiles();

// 錯誤日誌存儲路徑
const errorLogsPath = path.join(__dirname, 'data', 'error-logs');

// 確保錯誤日誌目錄存在
if (!fs.existsSync(errorLogsPath)) {
    fs.mkdirSync(errorLogsPath, { recursive: true });
}

// API路由 - 獲取評論
app.get('/api/comments/:gameId', apiLimiter, async (req, res) => {
    try {
        // 輸入驗證
        const gameId = req.params.gameId;
        if (!gameId || typeof gameId !== 'string') {
            return res.status(400).json({ error: '無效的遊戲ID' });
        }

        // 讀取並返回評論
        const commentsData = await readFileAsync(commentsFilePath, 'utf8');
        const comments = JSON.parse(commentsData);

        // 設置快取頭 - 5分鐘
        res.set('Cache-Control', 'public, max-age=300');
        res.json(comments[gameId] || []);
    } catch (error) {
        console.error('讀取評論失敗:', error);
        res.status(500).json({ error: '無法讀取評論' });
    }
});

// API路由 - 添加評論
app.post('/api/comments/:gameId', apiLimiter, async (req, res) => {
    try {
        // 輸入驗證
        const gameId = req.params.gameId;
        const { username, comment, rating } = req.body;

        if (!gameId || typeof gameId !== 'string') {
            return res.status(400).json({ error: '無效的遊戲ID' });
        }

        if (!username || typeof username !== 'string' || username.length > 50) {
            return res.status(400).json({ error: '使用者名稱無效或過長' });
        }

        if (!comment || typeof comment !== 'string' || comment.length > 500) {
            return res.status(400).json({ error: '評論內容無效或過長' });
        }

        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ error: '評分必須是1-5之間的數字' });
        }

        // 讀取當前評論數據
        const commentsData = await readFileAsync(commentsFilePath, 'utf8');
        const comments = JSON.parse(commentsData);

        // 創建新評論，使用安全的內容
        const newComment = {
            id: Date.now(),
            username: username.trim().slice(0, 50),
            comment: comment.trim().slice(0, 500),
            rating: Math.min(5, Math.max(1, Math.floor(rating))),
            date: new Date().toISOString()
        };

        // 確保遊戲ID存在
        if (!comments[gameId]) {
            comments[gameId] = [];
        }

        // 添加新評論
        comments[gameId].push(newComment);
        await writeFileAsync(commentsFilePath, JSON.stringify(comments, null, 2));

        res.status(201).json(newComment);
    } catch (error) {
        console.error('添加評論失敗:', error);
        res.status(500).json({ error: '無法添加評論' });
    }
});

// API路由 - 記錄錯誤
app.post('/api/log-error', apiLimiter, async (req, res) => {
    try {
        const errorLog = req.body;

        // 錯誤日誌輸入驗證
        if (!errorLog || typeof errorLog !== 'object') {
            return res.status(400).json({ error: '無效的錯誤日誌格式' });
        }

        // 限制錯誤日誌大小
        const logSizeInKB = Buffer.byteLength(JSON.stringify(errorLog)) / 1024;
        if (logSizeInKB > 50) { // 限制為 50KB
            return res.status(413).json({ error: '錯誤日誌過大' });
        }

        const timestamp = new Date().toISOString().split('T')[0];
        const logFile = path.join(errorLogsPath, `errors-${timestamp}.json`);

        // 讀取當天的日誌文件
        let logs = [];
        if (await existsAsync(logFile)) {
            const logData = await readFileAsync(logFile, 'utf8');
            logs = JSON.parse(logData);

            // 限制單日誌文件的大小
            if (logs.length > 1000) {
                logs = logs.slice(-1000); // 只保留最新的1000條記錄
            }
        }

        // 添加新的錯誤日誌，包含更多信息
        logs.push({
            ...errorLog,
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent'] || 'unknown',
            ip: req.ip.replace(/::ffff:/, '') // 移除IPv4映射前綴
        });

        // 寫入文件
        await writeFileAsync(logFile, JSON.stringify(logs, null, 2));

        res.status(200).json({ message: '錯誤日誌已記錄' });
    } catch (error) {
        console.error('記錄錯誤失敗:', error);
        res.status(500).json({ error: '無法記錄錯誤' });
    }
});

// 定期清理舊的錯誤日誌文件 (保留最近30天)
async function cleanupErrorLogs() {
    try {
        const files = await readdirAsync(errorLogsPath);
        const now = new Date();
        let cleanedCount = 0;

        for (const file of files) {
            try {
                const filePath = path.join(errorLogsPath, file);
                const stat = await statAsync(filePath);
                const age = now - stat.mtime;

                // 如果文件超過30天就刪除
                if (age > 30 * 24 * 60 * 60 * 1000) {
                    await unlinkAsync(filePath);
                    cleanedCount++;
                }
            } catch (fileError) {
                console.warn(`清理文件 ${file} 時出錯:`, fileError);
                // 繼續處理其他文件
            }
        }

        if (cleanedCount > 0) {
            console.log(`已清理 ${cleanedCount} 個過期的錯誤日誌文件`);
        }
    } catch (error) {
        console.error('清理錯誤日誌失敗:', error);
    }
};

// 每天執行一次清理
setInterval(cleanupErrorLogs, 24 * 60 * 60 * 1000);
// 啟動時執行一次清理
cleanupErrorLogs();

// 錯誤處理中間件
app.use((err, req, res, next) => {
    console.error('未處理的錯誤:', err);
    res.status(500).json({ error: '伺服器內部錯誤' });
});

// 處理所有其他請求，返回index.html
app.get('*', (req, res) => {
    // 設置適當的快取控制
    res.set('Cache-Control', 'public, max-age=3600'); // 1小時
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 優雅地處理進程終止
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信號，關閉服務器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到 SIGINT 信號，關閉服務器...');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('未捕獲的異常:', err);
    // 記錄錯誤後繼續運行，避免服務器崩潰
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未處理的 Promise 拒絕:', reason);
    // 記錄錯誤後繼續運行，避免服務器崩潰
});

// 啟動服務器
app.listen(PORT, () => {
    console.log('============================================');
    console.log(`服務器啟動成功 - 監聽端口 ${PORT}`);
    console.log('============================================');
    console.log('您可以通過以下地址訪問網站：');
    console.log(`- http://localhost:${PORT}`);
    console.log(`- http://127.0.0.1:${PORT}`);

    // 獲取本機IP地址
    const networkInterfaces = require('os').networkInterfaces();
    const addresses = [];
    for (const iface of Object.values(networkInterfaces)) {
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                addresses.push(alias.address);
            }
        }
    }

    if (addresses.length > 0) {
        console.log('區域網內可通過以下地址訪問：');
        addresses.forEach(address => {
            console.log(`- http://${address}:${PORT}`);
        });
    }
    console.log('============================================');
});