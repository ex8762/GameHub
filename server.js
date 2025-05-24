const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

// 創建Express應用
const app = express();
const PORT = process.env.PORT || 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// 評論數據存儲路徑
const commentsFilePath = path.join(__dirname, 'data', 'comments.json');

// 確保data目錄存在
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// 如果評論文件不存在，創建一個空的評論數據結構
if (!fs.existsSync(commentsFilePath)) {
    const initialComments = {
        'shooting-game': [],
        'simulation-game': [],
        'cafe-game': []
    };
    fs.writeFileSync(commentsFilePath, JSON.stringify(initialComments, null, 2));
}

// 錯誤日誌存儲路徑
const errorLogsPath = path.join(__dirname, 'data', 'error-logs');

// 確保錯誤日誌目錄存在
if (!fs.existsSync(errorLogsPath)) {
    fs.mkdirSync(errorLogsPath, { recursive: true });
}

// API路由 - 獲取評論
app.get('/api/comments/:gameId', (req, res) => {
    try {
        const comments = JSON.parse(fs.readFileSync(commentsFilePath, 'utf8'));
        const gameId = req.params.gameId;
        res.json(comments[gameId] || []);
    } catch (error) {
        console.error('讀取評論失敗:', error);
        res.status(500).json({ error: '無法讀取評論' });
    }
});

// API路由 - 添加評論
app.post('/api/comments/:gameId', (req, res) => {
    try {
        const comments = JSON.parse(fs.readFileSync(commentsFilePath, 'utf8'));
        const gameId = req.params.gameId;
        const newComment = {
            id: Date.now(),
            username: req.body.username,
            comment: req.body.comment,
            rating: req.body.rating,
            date: new Date().toISOString()
        };

        if (!comments[gameId]) {
            comments[gameId] = [];
        }

        comments[gameId].push(newComment);
        fs.writeFileSync(commentsFilePath, JSON.stringify(comments, null, 2));

        res.status(201).json(newComment);
    } catch (error) {
        console.error('添加評論失敗:', error);
        res.status(500).json({ error: '無法添加評論' });
    }
});

// API路由 - 記錄錯誤
app.post('/api/log-error', (req, res) => {
    try {
        const errorLog = req.body;
        const timestamp = new Date().toISOString().split('T')[0];
        const logFile = path.join(errorLogsPath, `errors-${timestamp}.json`);
        
        // 讀取當天的日誌文件
        let logs = [];
        if (fs.existsSync(logFile)) {
            logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
        }
        
        // 添加新的錯誤日誌
        logs.push({
            ...errorLog,
            timestamp: new Date().toISOString()
        });
        
        // 寫入文件
        fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
        
        res.status(200).json({ message: '錯誤日誌已記錄' });
    } catch (error) {
        console.error('記錄錯誤失敗:', error);
        res.status(500).json({ error: '無法記錄錯誤' });
    }
});

// 定期清理舊的錯誤日誌文件 (保留最近30天)
const cleanupErrorLogs = () => {
    try {
        const files = fs.readdirSync(errorLogsPath);
        const now = new Date();
        
        files.forEach(file => {
            const filePath = path.join(errorLogsPath, file);
            const stat = fs.statSync(filePath);
            const age = now - stat.mtime;
            
            // 如果文件超過30天就刪除
            if (age > 30 * 24 * 60 * 60 * 1000) {
                fs.unlinkSync(filePath);
            }
        });
    } catch (error) {
        console.error('清理錯誤日誌失敗:', error);
    }
};

// 每天執行一次清理
setInterval(cleanupErrorLogs, 24 * 60 * 60 * 1000);
// 啟動時執行一次清理
cleanupErrorLogs();

// 處理所有其他請求，返回index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 啟動服務器
app.listen(PORT, () => {
    console.log(`服務器運行在 http://localhost:${PORT}`);
    console.log(`您可以通過以下地址訪問網站：`);
    console.log(`- http://localhost:${PORT}`);
    console.log(`- http://127.0.0.1:${PORT}`);
    console.log(`- http://${require('os').hostname()}:${PORT} (區域網內可訪問)`);
});